/* =============================================================================
   Module : Short Term Training Assessment Marks Entry
   File   : src/pages/STT/STTAssessmentMarksPage.jsx
   Purpose: Top-level page. Enforces hardcoded UserId access control and renders
            a single card with three numbered sections:
              1. Filter      (cascading filters + assessment date + load)
              2. Analytics   (KPI dashboard)
              3. Data Entry  (action bar + inline-editable marks grid)
   Auth   : logged-in UserId is read from sessionStorage("userInfoAll").UserID
            (same convention used across the app).
   ============================================================================= */
import React, { useEffect } from "react";
import {
  ClipboardList,
  Save,
  Send,
  FileSpreadsheet,
  ShieldAlert,
  Lock,
  SlidersHorizontal,
  BarChart3,
  Table2,
} from "lucide-react";
import useSTTAssessment from "../../Hooks/STT/useSTTAssessment";
import STTFilters from "../../Component/STT/STTFilters";
import STTKpiCards from "../../Component/STT/STTKpiCards";
import STTMarksGrid from "../../Component/STT/STTMarksGrid";
import { SwalHelper } from "../../utils/swalHelper";
import { useAuth } from "../../Hooks/AuthContext";

/* -----------------------------------------------------------------------------
   ACCESS CONTROL
   Replace these UserIds with the real authorised user list.
   ----------------------------------------------------------------------------- */
const allowedUsers = [6206011,6220690,6206462,6209745,6217568,6206614];

const getLoggedInUserId = () => {
  try { 
    const {userInfo} = useAuth();
    return Number(userInfo?.UserID);
  } catch {
    return NaN;
  }
};

/* Numbered section header used inside the card. */
const SectionHeader = ({ step, title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold">
      {step}
    </span>
    {Icon && <Icon className="w-4 h-4 text-slate-600" />}
    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h2>
  </div>
);

export default function STTAssessmentMarksPage() {
  const userId = getLoggedInUserId();
   const {userInfo} = useAuth();
  const isAuthorized = allowedUsers.includes(userId);

  const {
    // filters
    loadFilters,
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
    isSubmitted,

    // kpi + actions
    kpis,
    saveDraft,
    submit,
    saving,
    submitting,
    exportToExcel,
  } = useSTTAssessment();

  // Load the cascading filter source once (only when authorised). The logged-in
  // UserId is sent to the API so only that user's mapped batches come back.
  useEffect(() => {
    if (isAuthorized) loadFilters(userId);
  }, [isAuthorized, loadFilters, userId]);
 

  /* Confirmation dialog before the irreversible Submit. */
  const handleSubmit = async () => {
    if (submitting || saving || isSubmitted) return;
    const res = await SwalHelper.confirm({
      title: "Submit Assessment?",
      html:
        "Once submitted, all marks are <b>locked permanently</b> and can no longer be edited.<br/>Do you want to continue?",
      confirmText: "Yes, Submit",
      cancelText: "Cancel",
    });
    if (res?.isConfirmed) {
      await submit();
    }
  };

  /* ---- Access denied screen ---- */
  if (!isAuthorized) {
    return (
      <div className="w-full p-6">
        <div className="max-w-xl mx-auto bg-white border border-red-200 rounded-lg shadow-sm p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Access Denied</h2>
          <p className="text-gray-600">You are not authorized to access this page.</p>
        </div>
      </div>
    );
  }

  const busy = saving || submitting;

  return (
    <div className="w-full p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Card title bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-slate-700 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            <h1 className="text-lg font-bold">Short Term Training Assessment Marks Entry</h1>
          </div>
          {isSubmitted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-500 text-white">
              <Lock className="w-3 h-3" /> Submitted (Locked)
            </span>
          )}
        </div>

        {/* Card body — three sections */}
        <div className="p-4 space-y-6">
          {/* ── Section 1 : Filter ── */}
          <section>
            <SectionHeader step="1" title="Filter" icon={SlidersHorizontal} />
            <STTFilters
              instituteOptions={instituteOptions}
              courseOptions={courseOptions}
              batchOptions={batchOptions}
              selectedInstituteId={selectedInstituteId}
              selectedCourseId={selectedCourseId}
              selectedBatchId={selectedBatchId}
              onSelectInstitute={onSelectInstitute}
              onSelectCourse={onSelectCourse}
              onSelectBatch={onSelectBatch}
              onLoad={loadCandidates}
              canLoad={canLoad}
              loadingCandidates={loadingCandidates}
              assessmentDate={assessmentDate}
              setAssessmentDate={setAssessmentDate}
              isSubmitted={isSubmitted}
              batchInfo={batchInfo}
              loaded={loaded}
            />
          </section>

          {/* Sections 2 & 3 appear only after candidates are loaded */}
          {loaded && (
            <>
              {/* ── Section 2 : Analytics ── */}
              <section>
                <SectionHeader step="2" title="Analytics" icon={BarChart3} />
                <STTKpiCards kpis={kpis} />
              </section>

              {/* ── Section 3 : Data Entry ── */}
              <section>
                <SectionHeader step="3" title="Data Entry" icon={Table2} />

                {/* Action bar */}
                <div className="flex flex-wrap items-center justify-end gap-3 mb-3">
                  <button
                    type="button"
                    onClick={exportToExcel}
                    disabled={!rows.length}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2 rounded transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Excel
                  </button>

                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={busy || isSubmitted || !rows.length}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save as Draft"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={busy || isSubmitted || !rows.length}
                    className="inline-flex items-center gap-2 bg-[#28a745] hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Submitting..." : "Save & Submit"}
                  </button>
                </div>

                {isSubmitted && (
                  <div className="mb-3 px-4 py-2 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
                    This assessment has been submitted and is now read-only.
                  </div>
                )}

                {/* Inline editable grid (search + sticky header + tab-in-cells) */}
                <STTMarksGrid rows={rows} isSubmitted={isSubmitted} onMarkChange={updateMark} />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
