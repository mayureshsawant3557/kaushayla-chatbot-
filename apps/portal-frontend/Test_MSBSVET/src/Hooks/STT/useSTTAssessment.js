/* =============================================================================
   Module : STT Assessment Marks Entry
   File   : src/Hooks/STT/useSTTAssessment.js
   Purpose: All state + business logic for the STT Assessment Marks page:
              - cascading filter options (Institute / Course / Batch)
              - candidate grid rows with inline edit, range validation,
                auto-calculation (totals, percentage) and grade derivation
              - draft save & submit (with permanent lock after submit)
              - KPI computation
              - Excel export (candidate details + KPI summary)
   Depends: xlsx, file-saver (already in package.json), SwalHelper, sttService.
   ============================================================================= */
import { useCallback, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import sttService from "../../lib/service/STT/sttService";
import { SwalHelper } from "../../utils/swalHelper";

/* Maximum marks per field – also used for range validation. */
export const MARK_LIMITS = {
  TotalTheory140: 140,
  PracticalObservation230: 230,
  PracticalViva80: 80,
};

const PASS_THRESHOLD = 225; // GrandTotal >= 225 => PASS
const GRAND_MAX = 450;

/* ---- Pure calculation helpers (exported for unit testing) ---- */
export const computeGrade = (theory, obs, viva, grandTotal) => {
  if (theory === 0 && obs === 0 && viva === 0) return "ABSENT";
  return grandTotal >= PASS_THRESHOLD ? "PASS" : "FAIL";
};

export const recalcRow = (row) => {
  const theory = Number(row.TotalTheory140) || 0;
  const obs = Number(row.PracticalObservation230) || 0;
  const viva = Number(row.PracticalViva80) || 0;

  const totalPractical = obs + viva;
  const grandTotal = theory + totalPractical;
  const percentage = Math.round((grandTotal / GRAND_MAX) * 100 * 100) / 100; // 2 decimals
  const grade = computeGrade(theory, obs, viva, grandTotal);

  return {
    ...row,
    TotalTheory140: theory,
    PracticalObservation230: obs,
    PracticalViva80: viva,
    TotalPractical310: totalPractical,
    GrandTotal450: grandTotal,
    Percentage: percentage,
    Grade: grade,
  };
};

const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

/* Client IP for audit columns (CreatedIP / ModifiedIP). Mirrors the existing
   app convention (ipify). Failure is non-fatal — the server falls back to the
   connection's remote IP when this is empty. */
const getIPAddress = async () => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data?.ip ?? "";
  } catch {
    return "";
  }
};

/* Note: the acting UserId is resolved server-side from the JWT, so it is not
   passed into this hook; access control lives in the page component. */
export default function useSTTAssessment() {
  /* ---- Filter source + selections ---- */
  const [filterRows, setFilterRows] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const [selectedInstituteId, setSelectedInstituteId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  /* ---- Loaded batch / grid state ---- */
  const [batchInfo, setBatchInfo] = useState(null); // { batchId, instituteName, ... collegeId, courseId }
  const [assessmentDate, setAssessmentDate] = useState("");
  const [rows, setRows] = useState([]);
  const [headerStatus, setHeaderStatus] = useState("Pending"); // Pending | Draft | Submitted
  const [loaded, setLoaded] = useState(false);

  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isSubmitted = headerStatus === "Submitted";

  /* =========================================================================
     FILTERS
     ========================================================================= */
  const loadFilters = useCallback(async (userId) => {
    try {
      setLoadingFilters(true);
      const data = await sttService.getFilters(userId);
      setFilterRows(Array.isArray(data) ? data : []);
    } catch (err) {
      SwalHelper.error("Error", err?.message || "Unable to load filters.");
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  /* Distinct institute options */
  const instituteOptions = useMemo(() => {
    const map = new Map();
    filterRows.forEach((r) => {
      if (!map.has(r.InstituteId)) {
        map.set(r.InstituteId, {
          id: r.InstituteId,
          name: r.InstituteName,
          code: r.InstituteCode,
        });
      }
    });
    return Array.from(map.values());
  }, [filterRows]);

  /* Course options filtered by the chosen institute */
  const courseOptions = useMemo(() => {
    const map = new Map();
    filterRows
      .filter((r) => String(r.InstituteId) === String(selectedInstituteId))
      .forEach((r) => {
        if (!map.has(r.CourseID)) {
          map.set(r.CourseID, {
            id: r.CourseID,
            code: r.CourseCode,
            name: r.CourseNameDisplay,
          });
        }
      });
    return Array.from(map.values());
  }, [filterRows, selectedInstituteId]);

  /* Batch options filtered by institute + course */
  const batchOptions = useMemo(() => {
    const map = new Map();
    filterRows
      .filter(
        (r) =>
          String(r.InstituteId) === String(selectedInstituteId) &&
          String(r.CourseID) === String(selectedCourseId),
      )
      .forEach((r) => {
        if (!map.has(r.BatchID)) map.set(r.BatchID, { id: r.BatchID });
      });
    return Array.from(map.values());
  }, [filterRows, selectedInstituteId, selectedCourseId]);

  const onSelectInstitute = useCallback((value) => {
    setSelectedInstituteId(value);
    setSelectedCourseId("");
    setSelectedBatchId("");
  }, []);

  const onSelectCourse = useCallback((value) => {
    setSelectedCourseId(value);
    setSelectedBatchId("");
  }, []);

  const onSelectBatch = useCallback((value) => {
    setSelectedBatchId(value);
  }, []);

  const canLoad =
    selectedInstituteId && selectedCourseId && selectedBatchId && !loadingCandidates;

  /* =========================================================================
     LOAD CANDIDATES + existing assessment
     ========================================================================= */
  const loadCandidates = useCallback(async () => {
    if (!selectedBatchId) {
      SwalHelper.warning("Required", "Please select a Batch first.");
      return;
    }

    try {
      setLoadingCandidates(true);
      SwalHelper.loading("Loading candidates...");

      const batchId = Number(selectedBatchId);

      // Candidates SP overlays any saved marks, RowStatus and the assessment
      // date, so the grid is fully hydrated from this single call.
      const candidates = await sttService.getCandidates(batchId);

      const list = (Array.isArray(candidates) ? candidates : []).map((c) =>
        recalcRow({
          CollegeID: c.CollegeID,
          CourseID: c.CourseID,
          BatchID: c.BatchID,
          CandidateID: c.CandidateID,
          ApplicationID: c.ApplicationID,
          ApplicationIDDisplay: c.ApplicationIDDisplay,
          CandidateName: c.CandidateName,
          TotalTheory140: c.TotalTheory140 || 0,
          PracticalObservation230: c.PracticalObservation230 || 0,
          PracticalViva80: c.PracticalViva80 || 0,
          RowStatus: c.RowStatus || "Pending",
        }),
      );

      const first = list[0] || {};

      // Overall batch status derived from the per-row RowStatus. A submitted
      // batch locks the whole page.
      const derivedStatus = list.some((r) => r.RowStatus === "Submitted")
        ? "Submitted"
        : list.some((r) => r.RowStatus === "Draft")
        ? "Draft"
        : "Pending";

      setBatchInfo({
        batchId,
        collegeId: first.CollegeID,
        courseId: first.CourseID,
        instituteName: candidates?.[0]?.InstituteName ?? "",
        instituteCode:
          instituteOptions.find((i) => String(i.id) === String(selectedInstituteId))?.code ?? "",
        courseName: candidates?.[0]?.CourseNameDisplay ?? "",
        courseCode: candidates?.[0]?.CourseCode ?? "",
      });

      setRows(list);
      setHeaderStatus(derivedStatus);
      setAssessmentDate(candidates?.[0]?.AssessmentDate || todayISO());
      setLoaded(true);

      SwalHelper.close();
      if (list.length === 0) {
        SwalHelper.info("No Candidates", "No candidates found for the selected batch.");
      }
    } catch (err) {
      SwalHelper.error("Error", err?.message || "Unable to load candidates.");
    } finally {
      setLoadingCandidates(false);
    }
  }, [selectedBatchId, selectedInstituteId, instituteOptions]);

  /* =========================================================================
     INLINE MARK EDIT
     ========================================================================= */
  /**
   * Updates one mark field of one candidate, enforcing numeric + range rules,
   * then recalculates the derived totals / percentage / grade for that row.
   * Returns silently (no state change) for invalid input so the user cannot
   * type an out-of-range or non-numeric value.
   */
  const updateMark = useCallback(
    (candidateId, field, rawValue) => {
      if (isSubmitted) return; // locked

      const limit = MARK_LIMITS[field];
      if (limit === undefined) return;

      // Allow clearing the field (treated as 0)
      if (rawValue === "" || rawValue === null || rawValue === undefined) {
        setRows((prev) =>
          prev.map((r) =>
            r.CandidateID === candidateId ? recalcRow({ ...r, [field]: 0 }) : r,
          ),
        );
        return;
      }

      // Numeric only (no decimals / signs)
      if (!/^\d+$/.test(String(rawValue))) return;

      const value = Number(rawValue);
      if (Number.isNaN(value) || value < 0 || value > limit) return;

      setRows((prev) =>
        prev.map((r) =>
          r.CandidateID === candidateId ? recalcRow({ ...r, [field]: value }) : r,
        ),
      );
    },
    [isSubmitted],
  );

  /* =========================================================================
     KPI SUMMARY (computed from current grid rows + header status)
     ========================================================================= */
  const kpis = useMemo(() => {
    const total = rows.length;

    // "Entered" = a row that has been persisted (Draft/Submitted) OR has any
    // marks typed in the current session.
    const isEntered = (r) =>
      r.RowStatus === "Draft" ||
      r.RowStatus === "Submitted" ||
      r.TotalTheory140 > 0 ||
      r.PracticalObservation230 > 0 ||
      r.PracticalViva80 > 0;

    const entered = rows.filter(isEntered);
    const marksEntered = entered.length;
    const pending = total - marksEntered;

    const absent = rows.filter((r) => r.Grade === "ABSENT").length;
    const pass = rows.filter((r) => r.Grade === "PASS").length;
    const fail = rows.filter((r) => r.Grade === "FAIL").length;

    const avgBase = entered.length ? entered : rows;
    const avgPercentage = avgBase.length
      ? Math.round(
          (avgBase.reduce((s, r) => s + (Number(r.Percentage) || 0), 0) / avgBase.length) * 100,
        ) / 100
      : 0;

    return {
      totalCandidates: total,
      pending,
      marksEntered,
      absent,
      pass,
      fail,
      averagePercentage: avgPercentage,
    };
  }, [rows]);

  /* =========================================================================
     SAVE / SUBMIT
     ========================================================================= */
  const buildPayload = useCallback(
    () => ({
      collegeId: batchInfo?.collegeId,
      courseId: batchInfo?.courseId,
      batchId: batchInfo?.batchId,
      assessmentDate,
      candidates: rows.map((r) => ({
        candidateId: r.CandidateID,
        applicationId: r.ApplicationID,
        totalTheory140: Number(r.TotalTheory140) || 0,
        practicalObservation230: Number(r.PracticalObservation230) || 0,
        practicalViva80: Number(r.PracticalViva80) || 0,
      })),
    }),
    [batchInfo, assessmentDate, rows],
  );

  const validateBeforePersist = useCallback(() => {
    if (!assessmentDate) {
      SwalHelper.warning("Required", "Assessment Date is mandatory.");
      return false;
    }
    if (!rows.length) {
      SwalHelper.warning("No Data", "There are no candidates to save.");
      return false;
    }
    return true;
  }, [assessmentDate, rows]);

  const saveDraft = useCallback(async () => {
    if (isSubmitted || saving || submitting) return;
    if (!validateBeforePersist()) return;

    try {
      setSaving(true);
      SwalHelper.loading("Saving draft...");
      const ipAddress = await getIPAddress();
      const result = await sttService.saveDraft({ ...buildPayload(), ipAddress });

      setHeaderStatus(result?.status || "Draft");
      setRows((prev) => prev.map((r) => ({ ...r, RowStatus: "Draft" })));

      SwalHelper.close();
      SwalHelper.toast("success", "Draft saved successfully.");
    } catch (err) {
      SwalHelper.error("Save Failed", err?.message || "Unable to save draft.");
    } finally {
      setSaving(false);
    }
  }, [isSubmitted, saving, submitting, validateBeforePersist, buildPayload]);

  const submit = useCallback(async () => {
    if (isSubmitted || saving || submitting) return;
    if (!validateBeforePersist()) return;

    try {
      setSubmitting(true);
      SwalHelper.loading("Submitting assessment...");
      const ipAddress = await getIPAddress();
      const result = await sttService.submit({ ...buildPayload(), ipAddress });

      setHeaderStatus(result?.status || "Submitted");
      setRows((prev) => prev.map((r) => ({ ...r, RowStatus: "Submitted" })));

      SwalHelper.close();
      SwalHelper.success("Submitted", "Assessment submitted and locked successfully.");
    } catch (err) {
      SwalHelper.error("Submit Failed", err?.message || "Unable to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  }, [isSubmitted, saving, submitting, validateBeforePersist, buildPayload]);

  /* =========================================================================
     EXPORT TO EXCEL  (candidate detail sheet + KPI summary sheet)
     ========================================================================= */
  const exportToExcel = useCallback(() => {
    if (!rows.length) {
      SwalHelper.warning("No Data", "There is nothing to export.");
      return;
    }

    // Sheet 1 : candidate marks
    const detailRows = rows.map((r) => ({
      "Application ID": r.ApplicationIDDisplay ?? r.ApplicationID,
      "Candidate Name": r.CandidateName,
      "Total Theory (140)": r.TotalTheory140,
      "Practical Observation (230)": r.PracticalObservation230,
      "Practical Viva (80)": r.PracticalViva80,
      "Total Practical (310)": r.TotalPractical310,
      "Grand Total (450)": r.GrandTotal450,
      "Percentage (%)": r.Percentage,
      Grade: r.Grade,
      Status: r.RowStatus,
    }));
    const wsDetails = XLSX.utils.json_to_sheet(detailRows);

    // Sheet 2 : KPI summary
    const summaryRows = [
      { Metric: "Total Candidates", Value: kpis.totalCandidates },
      { Metric: "Pending", Value: kpis.pending },
      { Metric: "Marks Entered", Value: kpis.marksEntered },
      { Metric: "Absent", Value: kpis.absent },
      { Metric: "Pass", Value: kpis.pass },
      { Metric: "Fail", Value: kpis.fail },
      { Metric: "Average Percentage (%)", Value: kpis.averagePercentage },
      { Metric: "Assessment Date", Value: assessmentDate },
      { Metric: "Status", Value: headerStatus },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsDetails, "Marks");
    XLSX.utils.book_append_sheet(wb, wsSummary, "KPI Summary");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileName = `STT_Assessment_Batch_${batchInfo?.batchId ?? "export"}.xlsx`;
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
  }, [rows, kpis, assessmentDate, headerStatus, batchInfo]);

  return {
    // filters
    loadFilters,
    loadingFilters,
    filterRows,
    instituteOptions,
    courseOptions,
    batchOptions,
    selectedInstituteId,
    selectedCourseId,
    selectedBatchId,
    onSelectInstitute,
    onSelectCourse,
    onSelectBatch,
    canLoad,

    // grid / batch
    loadCandidates,
    loadingCandidates,
    rows,
    batchInfo,
    loaded,
    assessmentDate,
    setAssessmentDate,
    updateMark,
    headerStatus,
    isSubmitted,

    // kpi
    kpis,

    // actions
    saveDraft,
    submit,
    saving,
    submitting,
    exportToExcel,
  };
}
