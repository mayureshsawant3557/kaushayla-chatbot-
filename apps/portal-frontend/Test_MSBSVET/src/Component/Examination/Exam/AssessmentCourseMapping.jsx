
import {
  ClipboardList,
  Save,
  SlidersHorizontal,
  Building2,
  CheckCircle2,
  Loader2,
  Filter as FilterIcon,
  RefreshCw,
  Users,
  Repeat,
  History,
  AlertTriangle,
  X,
  ArrowRight,
} from "lucide-react";


import { useState, useCallback, useEffect, useContext } from "react";
import agent from "../../../lib/api/agent";
import {
  GetSTTInstituteCourseActiveBatches,
  GetSTTBatchAgencies,
  savebatchagencymapping,
  AgenciesForReassign,
} from "../../../Endpoints_All/Examination/Exam";
import { GetSTTCandidatesByBatch } from "../../../Endpoints_All/STT/sttEndpoints";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { ThemeContext } from "../../Context/ThemeContext";
import { getDeviceIP } from "../../../utils/CommonHelper";

function useBatchAgencyAssignment() {

  const [instituteOptions, setInstituteOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);

  const [selectedInstituteId, setSelectedInstituteId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [loadingInstitutes, setLoadingInstitutes] = useState(false);
  const [instituteCourseBatchData, setInstituteCourseBatchData] = useState([]);

  const [agencyOptions, setAgencyOptions] = useState([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState("");
  const [loadingAgencies, setLoadingAgencies] = useState(false);

  const [existingAgency, setExistingAgency] = useState(null);

  const [reassignMode, setReassignMode] = useState(false);

  const [mappingHistory, setMappingHistory] = useState([]);

  const [mappedBatches, setMappedBatches] = useState([]);
  const [loadingMappedBatches, setLoadingMappedBatches] = useState(false);

  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN");
  };

  function resetAgencyState() {
    setAgencyOptions([]);
    setSelectedAgencyId("");
    setExistingAgency(null);
    setSaved(false);
    setCandidates([]);
    setReassignMode(false);
    setMappingHistory([]);
  }

  const loadInstitutes = useCallback(async () => {
    setLoadingInstitutes(true);
    try {
      const res = await agent.get(GetSTTInstituteCourseActiveBatches);

      const data = res.data?.Data?.Table || [];
      setInstituteCourseBatchData(data);

const uniqueInstitutes = Array.from(
  new Map(
    data.map((item) => [
      item.InstituteID,
      {
        value: String(item.InstituteID),
        label: item.InstituteRegistrationNo
          ? `${item.InstituteName} (${item.InstituteRegistrationNo})`
          : item.InstituteName,
        code: item.InstituteID,
        registrationNo: item.InstituteRegistrationNo,
      },
    ])
  ).values()
);

      setInstituteOptions(uniqueInstitutes);
    } catch (err) {

      setInstituteOptions([]);
      setInstituteCourseBatchData([]);
    } finally {
      setLoadingInstitutes(false);
    }
  }, []);

  // const fetchAgencyOptionsForBatch = useCallback(async (batchId) => {
  //   const res = await agent.get(GetSTTBatchAgencies, {
  //     params: { BatchID: batchId },
  //   });

  //   const rows = res?.data?.Data?.Table || res?.data?.Data || [];

  //   return Array.from(
  //     new Map(
  //       rows.map((item) => [
  //         String(item.UserID),
  //         {
  //           value: String(item.UserID),
  //           label: item.UserName,
  //           code: item.UserLoginID,
  //           isAssigned: Boolean(item.MappingIsActive),
  //         },
  //       ])
  //     ).values()
  //   );
  // }, []);
  const fetchAgencyOptionsForBatch = useCallback(async (batchId) => {
  try {
    const res = await agent.get(GetSTTBatchAgencies, {
      params: {
        BatchID: batchId,
      },
    });

    const rows = res?.data?.Data?.Table || res?.data?.Data || [];

    return Array.from(
      new Map(
        rows.map((item) => [
          String(item.UserID),
          {
            // Actual value used for mapping
            value: String(item.UserID),

            // Display text in dropdown
            label: item.UserLoginID
              ? `${item.UserName} (${item.UserLoginID})`
              : item.UserName,

            // Keep LoginID separately
            code: item.UserLoginID,

            // Used to identify currently mapped agency
            isAssigned: Boolean(item.MappingIsActive),
          },
        ])
      ).values()
    );
  } catch (error) {
    console.error("Error fetching agencies for batch:", error);
    return [];
  }
}, []);

  const loadMappedBatchesForCourse = useCallback(
    async (batches) => {
      if (!batches || !batches.length) {
        setMappedBatches([]);
        return;
      }

      setLoadingMappedBatches(true);
      try {
        const results = await Promise.all(
          batches.map(async (b) => {
            try {
              const options = await fetchAgencyOptionsForBatch(b.value);
              const assigned = options.find((o) => o.isAssigned);
              return assigned
                ? {
                    batchId: b.value,
                    batchLabel: b.label,
                    agencyLabel: assigned.label,
                    agencyCode: assigned.code,
                  }
                : null;
            } catch (err) {

              return null;
            }
          })
        );
        setMappedBatches(results.filter(Boolean));
      } finally {
        setLoadingMappedBatches(false);
      }
    },
    [fetchAgencyOptionsForBatch]
  );
  

  const onSelectInstitute = useCallback(
    (instituteId) => {
      setSelectedInstituteId(instituteId);
      setSelectedCourseId("");
      setSelectedBatchId("");
      setCourseOptions([]);
      setBatchOptions([]);
      resetAgencyState();
      setMappedBatches([]);

      if (!instituteId) return;

      const instituteCourses = instituteCourseBatchData.filter(
        (item) => String(item.InstituteID) === String(instituteId)
      );

      const uniqueCourses = Array.from(
        new Map(
          instituteCourses.map((item) => [
            item.CourseID,
            {
              value: String(item.CourseID),
              label: `${item.CourseName} (${item.CourseCode})`,
              code: item.CourseCode,
              name: item.CourseName,
            },
          ])
        ).values()
      );

      setCourseOptions(uniqueCourses);
    },
    [instituteCourseBatchData]
  );

  const onSelectCourse = useCallback(
    (courseId) => {
      setSelectedCourseId(courseId);
      setSelectedBatchId("");
      setBatchOptions([]);
      resetAgencyState();
      setMappedBatches([]);

      if (!courseId) return;

      const batches = instituteCourseBatchData.filter(
        (item) =>
          String(item.InstituteID) === String(selectedInstituteId) &&
          String(item.CourseID) === String(courseId) &&
          Number(item.BatchStatus) === 4
      );

      const uniqueBatches = Array.from(
        new Map(
          batches.map((item) => [
            item.BatchID,
            {
              value: String(item.BatchID),
              label: `${item.BatchID} (${formatDate(item.BatchStartDate)} - ${formatDate(item.BatchEndDate)})`,
            },
          ])
        ).values()
      );

      setBatchOptions(uniqueBatches);
      loadMappedBatchesForCourse(uniqueBatches);
    },
    [instituteCourseBatchData, selectedInstituteId, loadMappedBatchesForCourse]
  );

  const loadCandidates = useCallback(async (batchId) => {
    if (!batchId) {
      setCandidates([]);
      return;
    }

    setLoadingCandidates(true);
    try {
      const url = GetSTTCandidatesByBatch(batchId);
      const res = await agent.get(url);

      const rows = res?.data?.Data || [];

      const mapped = rows.map((item, idx) => ({
        ...item,
        key: String(item.CandidateID ?? idx),
        Course: `${item.CourseCode ?? ""} - ${item.CourseNameDisplay ?? ""}`,
      }));

      setCandidates(mapped);
    } catch (err) {

      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  const fetchAgenciesForReassign = useCallback(async (batchId) => {
    const res = await agent.get(AgenciesForReassign, {
      params: { BatchID: batchId },
    });

    const rows = res?.data?.Data?.Table || res?.data?.Data || [];

    // return Array.from(
    //   new Map(
    //     rows.map((item) => [
    //       String(item.UserID),
    //       {
    //         value: String(item.UserID),
    //        // label: item.IsCurrentlyAssigned ? `${item.UserName} ✓ Current` : item.UserName,
    //          label: item.UserLoginID
    //           ? `${item.UserName} (${item.UserLoginID})`
    //           : item.UserName,
    //         code: item.UserLoginID,
    //         isAssigned: Boolean(item.IsCurrentlyAssigned),
    //       },
    //     ])
    //   ).values()
    // );
    return Array.from(
  new Map(
    rows.map((item) => [
      String(item.UserID),
      {
        // Actual value used for mapping
        value: String(item.UserID),

        // Display: Agency Name (Login ID) + Current if already mapped
        label: item.UserLoginID
          ? `${item.UserName} (${item.UserLoginID})${
              item.IsCurrentlyAssigned ? " ✓ Current" : ""
            }`
          : `${item.UserName}${
              item.IsCurrentlyAssigned ? " ✓ Current" : ""
            }`,

        // Login ID kept separately
        code: item.UserLoginID,

        // Used to identify currently mapped agency
        isAssigned: Boolean(item.IsCurrentlyAssigned),
      },
    ])
  ).values()
);
  }, []);

  const onSelectBatch = useCallback(
    async (batchId) => {
      setSelectedBatchId(batchId);
      resetAgencyState();

      if (!batchId) return;

      setLoadingAgencies(true);
      try {
        const options = await fetchAgencyOptionsForBatch(batchId);
        setAgencyOptions(options);

        const assigned = options.find((o) => o.isAssigned);
        if (assigned) {
          setSelectedAgencyId(assigned.value);
          setExistingAgency(assigned);
          await loadCandidates(batchId);
        } else {
          setCandidates([]);
        }
      } catch (err) {

        setAgencyOptions([]);
      } finally {
        setLoadingAgencies(false);
      }
    },
    [loadCandidates, fetchAgencyOptionsForBatch]
  );

  const onSelectAgency = useCallback((agencyId) => setSelectedAgencyId(agencyId), []);

  const startReassign = useCallback(async () => {
    setSaved(false);
    setSelectedAgencyId("");
    setReassignMode(true);

    setLoadingAgencies(true);
    try {
      const options = await fetchAgenciesForReassign(selectedBatchId);
      setAgencyOptions(options);
    } catch (err) {

      setAgencyOptions([]);
    } finally {
      setLoadingAgencies(false);
    }
  }, [selectedBatchId, fetchAgenciesForReassign]);

  const cancelReassign = useCallback(() => {
    setReassignMode(false);
    setSelectedAgencyId(existingAgency?.value || "");
  }, [existingAgency]);

  const canAssign =
    !existingAgency &&
    !!selectedInstituteId &&
    !!selectedCourseId &&
    !!selectedBatchId &&
    !!selectedAgencyId;

  const canConfirmReassign =
    reassignMode && !!selectedAgencyId && selectedAgencyId !== existingAgency?.value;

  const canSave = canAssign || canConfirmReassign;

  const saveAssignment = useCallback(async () => {
    setSaving(true);
    try {

      const deviceIP = await getDeviceIP();

      const payload = {
        BatchID: Number(selectedBatchId),
        UserID: Number(selectedAgencyId),
        ModifiedBy: "Admin",
        ModifiedIP: deviceIP || null,
      };

      const res = await agent.post(savebatchagencymapping, payload);

      setSaved(true);

      const newAgency = agencyOptions.find((a) => a.value === selectedAgencyId);
      const cleanLabel = (label) => (label || "").replace(/\s*✓ Current$/, "");
      const newAgencyClean = newAgency ? { ...newAgency, label: cleanLabel(newAgency.label) } : null;
      const wasReassignment = !!existingAgency;

      if (wasReassignment && newAgencyClean) {
        setMappingHistory((prev) => [
          {
            id: `${existingAgency.value}-${Date.now()}`,
            fromAgency: existingAgency.label,
            fromCode: existingAgency.code,
            toAgency: newAgencyClean.label,
            toCode: newAgencyClean.code,
            reassignedAt: new Date(),
          },
          ...prev,
        ]);
      }

      if (newAgencyClean) {
        setExistingAgency({ ...newAgencyClean, isAssigned: true });
      }
      setReassignMode(false);

      await loadCandidates(selectedBatchId);
      loadMappedBatchesForCourse(batchOptions);

      return { success: true, data: res?.data };
    } catch (err) {

      return {
        success: false,
        error:
          err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err?.message ||
          "Save failed",
      };
    } finally {
      setSaving(false);
    }
  }, [selectedBatchId, selectedAgencyId, agencyOptions, existingAgency, loadCandidates, batchOptions, loadMappedBatchesForCourse]);

  const resetForm = useCallback(() => {
    setSelectedInstituteId("");
    setSelectedCourseId("");
    setSelectedBatchId("");
    setCourseOptions([]);
    setBatchOptions([]);
    resetAgencyState();
  }, []);

  return {
    instituteOptions, courseOptions, batchOptions, agencyOptions,
    selectedInstituteId, selectedCourseId, selectedBatchId, selectedAgencyId,
    loadingInstitutes, loadingAgencies,
    loadInstitutes, onSelectInstitute, onSelectCourse, onSelectBatch, onSelectAgency,
    existingAgency, canSave, canAssign, canConfirmReassign, saveAssignment, saving, saved, resetForm,
    candidates, loadingCandidates,
    reassignMode, startReassign, cancelReassign, mappingHistory,
    mappedBatches, loadingMappedBatches, loadMappedBatchesForCourse,
  };
}

const SectionHeader = ({ step, title, icon: Icon }) => (
  <div className="flex items-center gap-2.5 mb-3">
    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#10275C] text-white text-xs font-bold shadow-sm">
      {step}
    </span>
    {Icon && <Icon className="w-4 h-4 text-[#10275C]" />}
    <h2 className="text-sm font-semibold text-slate-800 tracking-wide">{title}</h2>
  </div>
);

function ReadOnlyField({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <input
        type="text"
        value={value || ""}
        readOnly
        placeholder="—"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50/80 text-slate-500"
      />
    </div>
  );
}

function ReassignConfirmModal({ batchLabel, currentAgencyLabel, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Reassign this batch?</h3>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to reassign this batch to another agency?
              {batchLabel && (
                <>
                  {" "}Batch <b>{batchLabel}</b> is currently with{" "}
                  <b>{currentAgencyLabel}</b>.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 bg-slate-50 px-5 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 border border-gray-300 text-slate-600 hover:bg-white px-3 py-1.5 rounded text-sm font-semibold transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded text-sm font-semibold transition-colors"
          >
            <Repeat className="w-4 h-4" /> Yes, reassign
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignConfirmModal({ agencyLabel, batchLabel, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 shrink-0">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Assign this agency?</h3>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to assign <b>{agencyLabel}</b> to Batch{" "}
              <b>{batchLabel}</b>?
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 bg-slate-50 px-5 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 border border-gray-300 bg-white text-slate-600 hover:bg-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Save className="w-4 h-4" /> Yes, assign
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageModal({ variant = "error", title, message, onClose }) {
  const isError = variant === "error";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
              isError ? "bg-red-100" : "bg-emerald-100"
            }`}
          >
            {isError ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 bg-slate-50 px-5 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors ${
              isError ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function AgencyMappingPanel({
  existingAgency, agencyOptions, selectedAgencyId, onSelectAgency,
  reassignMode, onStartReassign, onCancelReassign, saving,
  canAssign, canConfirmReassign, onSave,
  loadingAgencies, selectedBatchId, canReassign,
}) {
  if (!selectedBatchId) {
    return (
      <DropdownComponent
        label="Agency" required value="" onChange={() => {}}
        options={[]} disabled loading={false}
      />
    );
  }

  if (!existingAgency) {
    return (
      <DropdownComponent
        label="Agency" required value={selectedAgencyId} onChange={onSelectAgency}
        options={agencyOptions} loading={loadingAgencies}
      />
    );
  }

  if (!reassignMode) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600">Agency</label>
        <div className="flex items-center justify-between gap-3 border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-emerald-100/40 rounded-xl px-3.5 py-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white shrink-0 shadow-sm">
              <Building2 className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-950 truncate">{existingAgency.label}</p>
              <p className="text-xs text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {existingAgency.code || "—"} · Currently mapped
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartReassign}
            disabled={!canReassign}
            title={
              canReassign
                ? undefined
                : "Reassign is locked because at least one candidate's marks have already been submitted"
            }
            className="inline-flex items-center gap-1.5 shrink-0 border border-amber-300 bg-white text-amber-700 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Repeat className="w-3.5 h-3.5" /> Reassign Agency
          </button>
        </div>
        {!canReassign && (
          <p className="text-xs text-slate-400 mt-0.5 flex items-start gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-px" />
            Reassign is available only while every candidate's marks are <b>Pending</b>. Once
            the mapped agency has submitted even one candidate's marks, this batch can no
            longer be reassigned.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 border border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl p-3.5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
        <Repeat className="w-3.5 h-3.5" /> Reassigning from {existingAgency.label}
      </div>
      <DropdownComponent
        label="Select new Agency" required value={selectedAgencyId} onChange={onSelectAgency}
        options={agencyOptions} loading={loadingAgencies}
      />
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancelReassign}
          className="inline-flex items-center gap-1 border border-gray-300 bg-white text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canConfirmReassign || saving}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Repeat className="w-3.5 h-3.5" />}
          {saving ? "Saving..." : "Reassign Agency"}
        </button>
      </div>
    </div>
  );
}

function BatchAgencyCascadeFilters({
  instituteOptions, courseOptions, batchOptions, agencyOptions,
  selectedInstituteId, selectedCourseId, selectedBatchId, selectedAgencyId,
  onSelectInstitute, onSelectCourse, onSelectBatch, onSelectAgency,
  loadingInstitutes, loadingAgencies, existingAgency,
  reassignMode, onStartReassign, onCancelReassign, saving,
  canAssign, canConfirmReassign, onSave, canReassign,
}) {
  const institute = instituteOptions.find((i) => i.value === selectedInstituteId);
  const course = courseOptions.find((c) => c.value === selectedCourseId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05)]">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#EAF1FC] text-[#10275C]">
          <FilterIcon className="w-3.5 h-3.5" />
        </span>
        <span className="text-sm font-semibold text-slate-800">Filters</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <DropdownComponent
          label="Institute" required value={selectedInstituteId} onChange={onSelectInstitute}
          options={instituteOptions} loading={loadingInstitutes}
        />
        {/* <ReadOnlyField label="Institute Code" value={institute?.code} /> */}
        <ReadOnlyField label="Institute Code" value={institute?.registrationNo} />
        <DropdownComponent
          label="Course" required value={selectedCourseId} onChange={onSelectCourse}
          options={courseOptions} disabled={!selectedInstituteId}
        />
        <ReadOnlyField label="Course Code" value={course?.code} />
        <DropdownComponent
          label="Batch" required value={selectedBatchId} onChange={onSelectBatch}
          options={batchOptions} disabled={!selectedCourseId}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
        <div className="md:col-span-2">
          <AgencyMappingPanel
            existingAgency={existingAgency}
            agencyOptions={agencyOptions}
            selectedAgencyId={selectedAgencyId}
            onSelectAgency={onSelectAgency}
            reassignMode={reassignMode}
            onStartReassign={onStartReassign}
            onCancelReassign={onCancelReassign}
            saving={saving}
            canAssign={canAssign}
            canConfirmReassign={canConfirmReassign}
            onSave={onSave}
            loadingAgencies={loadingAgencies}
            selectedBatchId={selectedBatchId}
            canReassign={canReassign}
          />
        </div>
      </div>

      {existingAgency && !reassignMode && (
        <div className="flex items-start gap-2 text-xs bg-[#EEF3FC] border border-[#D6E4F7] text-[#10275C] rounded-lg px-3.5 py-2.5 mt-4">
          <Building2 className="w-4 h-4 mt-0.5 shrink-0 text-[#3B65A6]" />
          <span>
            This batch is currently assigned to <b>{existingAgency.label}</b>. Use{" "}
            <b>Reassign Agency</b> above to move it to a different agency.
          </span>
        </div>
      )}
    </div>
  );
}

function BatchAgencyAssignmentsTable({
  institute, course, rows, onRefresh, refreshing, selectedBatchId,
}) {
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filteredRows = !q
    ? rows
    : rows.filter(
        (r) =>
          (r.batchLabel || "").toLowerCase().includes(q) ||
          (r.agencyLabel || "").toLowerCase().includes(q)
      );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#10275C] to-[#1B3A75] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-white/70" />
          <span className="text-sm font-semibold text-white">Batch Agency Assignments</span>
          <span className="text-xs text-white/60 bg-white/10 rounded-full px-2 py-0.5">
            {refreshing ? "Loading…" : `${rows.length} mapped`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batch or agency..."
            className="border border-white/20 bg-white/10 text-white placeholder:text-white/50 rounded-lg px-3 py-1.5 text-xs w-52 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20"
          />
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1 border border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-60 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </button>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <th className="px-5 py-2.5">Institute</th>
            <th className="px-5 py-2.5">Course</th>
            <th className="px-5 py-2.5">Batch</th>
            <th className="px-5 py-2.5">Agency</th>
          </tr>
        </thead>
        <tbody>
          {refreshing && rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Checking every batch in this course…
              </td>
            </tr>
          ) : filteredRows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-sm">
                {rows.length === 0
                  ? "No batches in this institute + course have an agency mapped yet."
                  : "No matching assignment."}
              </td>
            </tr>
          ) : (
            filteredRows.map((r, idx) => (
              <tr
                key={r.batchId}
                className={`border-t border-slate-100 transition-colors hover:bg-[#F6F9FE] ${
                  r.batchId === selectedBatchId
                    ? "bg-[#EEF3FC]"
                    : idx % 2 === 1
                    ? "bg-slate-50/60"
                    : ""
                }`}
              >
                <td className="px-5 py-3 text-slate-700">{institute || "—"}</td>
                <td className="px-5 py-3 text-slate-700">{course || "—"}</td>
                <td className="px-5 py-3 text-slate-700">{r.batchLabel}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {r.agencyLabel}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function MappingHistoryTable({ history }) {
  if (!history.length) return null;

  return (
    <section>
      <SectionHeader step="H" title="Reassignment History" icon={History} />
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-amber-50/70 text-left text-xs font-semibold text-amber-800 tracking-wide">
              <th className="px-5 py-2.5">Previous Agency</th>
              <th className="px-5 py-2.5"></th>
              <th className="px-5 py-2.5">New Agency</th>
              <th className="px-5 py-2.5">Reassigned At</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-t border-slate-100 hover:bg-slate-50/70 transition-colors ${
                  idx % 2 === 1 ? "bg-slate-50/40" : ""
                }`}
              >
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1">
                    {row.fromAgency}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">{row.fromCode || "—"}</div>
                </td>
                <td className="px-5 py-3 text-amber-400">
                  <ArrowRight className="w-4 h-4" />
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-2.5 py-1">
                    {row.toAgency}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">{row.toCode || "—"}</div>
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {row.reassignedAt.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
const candidateColumns = [
  { key: "srNo", header: "Sr. No.", render: (_row, _col, index) => index + 1 },
  { key: "ApplicationIDDisplay", header: "Application No" },
  { key: "CandidateName", header: "Candidate Name" },
  { key: "Course", header: "Course" },
  { key: "AssessmentDate", header: "Assessment Date" },
  { key: "TotalTheory140", header: "Theory (140)" },
  { key: "TotalPractical310", header: "Practical (310)" },
  { key: "GrandTotal450", header: "Total (450)" },
  { key: "Percentage", header: "%" },
  { key: "Grade", header: "Grade" },
  { key: "FeesStatus", header: "Fees Status" }, // <-- new column
  { key: "RowStatus", header: "Status" },
];

const renderCandidateCell = (item, column) => {
  if (column.key === "Grade") {
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
          item.Grade === "PASS"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {item.Grade}
      </span>
    );
  }

  if (column.key === "FeesStatus") {
    const isSubmitted =
      String(item.FeesStatus || "").trim().toLowerCase() === "submitted";
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
          isSubmitted
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {item.FeesStatus || "Pending"}
      </span>
    );
  }

  return undefined;
};



export default function CMSAdminBatchAgencyAssignmentPage() {
  const { color } = useContext(ThemeContext);

  const {
    instituteOptions, courseOptions, batchOptions, agencyOptions,
    selectedInstituteId, selectedCourseId, selectedBatchId, selectedAgencyId,
    loadingInstitutes, loadingAgencies,
    loadInstitutes, onSelectInstitute, onSelectCourse, onSelectBatch, onSelectAgency,
    existingAgency, canAssign, canConfirmReassign, saveAssignment, saving, saved, resetForm,
    candidates, loadingCandidates,
    reassignMode, startReassign, cancelReassign, mappingHistory,
    mappedBatches, loadingMappedBatches, loadMappedBatchesForCourse,
  } = useBatchAgencyAssignment();

  const [showReassignConfirm, setShowReassignConfirm] = useState(false);
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [messageModal, setMessageModal] = useState(null);

  useEffect(() => {
    loadInstitutes();
  }, [loadInstitutes]);

  const hasAnySubmittedMarks = candidates.some(
    (c) => String(c.RowStatus || "").trim().toLowerCase() === "submitted"
  );
  const canReassign = !hasAnySubmittedMarks;

  const handleAssign = () => {
    setShowAssignConfirm(true);
  };

  const handleConfirmAssignYes = async () => {
    setShowAssignConfirm(false);
    const result = await saveAssignment();
    if (result.success) {
      setMessageModal({
        variant: "success",
        title: "Agency assigned",
        message: "The agency has been assigned to this batch.",
      });
    } else {
      setMessageModal({
        variant: "error",
        title: "Assignment failed",
        message: result.error || "Save failed",
      });
    }
  };

  const handleReassignClick = () => {
    if (!canReassign) return;
    setShowReassignConfirm(true);
  };

  const handleConfirmReassignYes = () => {
    setShowReassignConfirm(false);
    startReassign();
  };

  const handleSaveReassignment = async () => {
    const result = await saveAssignment();

    if (result.success) {
      setMessageModal({
        variant: "success",
        title: "Agency reassigned",
        message: "The batch has been reassigned to the new agency.",
      });
    } else {
      setMessageModal({
        variant: "error",
        title: "Reassignment failed",
        message: result.error || "Reassign failed",
      });
    }
  };

  return (
    <div className="w-full min-h-full bg-[#F5F7FA] p-4 md:p-6">
      {showReassignConfirm && (
        <ReassignConfirmModal
          batchLabel={selectedBatchId}
          currentAgencyLabel={existingAgency?.label}
          onCancel={() => setShowReassignConfirm(false)}
          onConfirm={handleConfirmReassignYes}
        />
      )}

      {showAssignConfirm && (
        <AssignConfirmModal
          agencyLabel={agencyOptions.find((a) => a.value === selectedAgencyId)?.label || "this agency"}
          batchLabel={selectedBatchId}
          onCancel={() => setShowAssignConfirm(false)}
          onConfirm={handleConfirmAssignYes}
        />
      )}

      {messageModal && (
        <MessageModal
          variant={messageModal.variant}
          title={messageModal.title}
          message={messageModal.message}
          onClose={() => setMessageModal(null)}
        />
      )}

      <fieldset className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06),0_12px_32px_rgba(16,24,40,0.06)]">
        <legend className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 shadow-sm`}>
          <ClipboardList className="mr-2 text-white" />
          Batch Agency Assignment
          {saved && (
            <span className="inline-flex items-center gap-1 ml-3 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
        </legend>

        <div className="px-4 md:px-6 pb-6 pt-3 space-y-6">
          <section>
            <SectionHeader step="1" title="Filter" icon={SlidersHorizontal} />
            <BatchAgencyCascadeFilters
              instituteOptions={instituteOptions}
              courseOptions={courseOptions}
              batchOptions={batchOptions}
              agencyOptions={agencyOptions}
              selectedInstituteId={selectedInstituteId}
              selectedCourseId={selectedCourseId}
              selectedBatchId={selectedBatchId}
              selectedAgencyId={selectedAgencyId}
              onSelectInstitute={onSelectInstitute}
              onSelectCourse={onSelectCourse}
              onSelectBatch={onSelectBatch}
              onSelectAgency={onSelectAgency}
              loadingInstitutes={loadingInstitutes}
              loadingAgencies={loadingAgencies}
              existingAgency={existingAgency}
              reassignMode={reassignMode}
              onStartReassign={handleReassignClick}
              onCancelReassign={cancelReassign}
              saving={saving}
              canAssign={canAssign}
              canConfirmReassign={canConfirmReassign}
              onSave={handleSaveReassignment}
              canReassign={canReassign}
            />
          </section>

          {selectedCourseId && batchOptions.length > 0 && (
            <section>
              <BatchAgencyAssignmentsTable
                institute={instituteOptions.find((i) => i.value === selectedInstituteId)?.label}
                course={courseOptions.find((c) => c.value === selectedCourseId)?.label}
                rows={mappedBatches}
                selectedBatchId={selectedBatchId}
                onRefresh={() => loadMappedBatchesForCourse(batchOptions)}
                refreshing={loadingMappedBatches}
              />
            </section>
          )}

          {!existingAgency && (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={!canAssign || saving}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg transition-colors text-sm font-semibold shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}

          {existingAgency && !reassignMode && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          )}

          {selectedBatchId && (
            <section>
              <SectionHeader step="2" title="Candidates" icon={Users} />
              {existingAgency ? (
                <fieldset className="border border-slate-200 rounded-xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05)]">
                  <div className="px-5 py-5">
                    <FilteredTableComponent
                      data={candidates}
                      columns={candidateColumns}
                      loading={loadingCandidates}
                      searchable={true}
                      sortable={true}
                      exportable={true}
                      showSearch={true}
                      showExport={true}
                      showPDF={true}
                      showExcel={true}
                      renderCell={renderCandidateCell}
                      exportFileName="CandidateList"
                      tableTitle="List of Candidates"
                      maxHeight="500px"
                      stickyHeader={true}
                      emptyStateMessage="No Data Found"
                      emptyStateSubMessage="No candidates found for this batch."
                    />
                  </div>
                </fieldset>
              ) : (
                <div className="text-sm text-slate-500 bg-slate-50/70 border border-dashed border-slate-300 rounded-xl px-4 py-8 text-center">
                  This batch doesn't have an agency mapped yet. Select an agency above and save to
                  view its candidates.
                </div>
              )}
            </section>
          )}

          <MappingHistoryTable history={mappingHistory} />
        </div>
      </fieldset>
    </div>
  );
}