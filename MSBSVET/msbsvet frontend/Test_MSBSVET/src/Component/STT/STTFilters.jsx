/* =============================================================================
   Module : Short Term Training Assessment Marks Entry
   File   : src/Component/STT/STTFilters.jsx
   Purpose: Cascading filter panel (Institute -> Course -> Batch) using searchable
            dropdowns, the mandatory single Assessment Date, and the "Load
            Candidates" action. After a batch is loaded it shows the read-only
            batch summary strip.
   Props  : driven entirely by the useSTTAssessment hook (lifted state).
   ============================================================================= */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Filter, CalendarDays, Search, Loader2, ChevronDown, X } from "lucide-react";

const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const controlCls =
  "w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60 disabled:cursor-not-allowed";

/* -----------------------------------------------------------------------------
   SearchableSelect
   Lightweight, dependency-free searchable dropdown.
   options: [{ id, label }]   value: selected id   onChange: (id) => void
   ----------------------------------------------------------------------------- */
function SearchableSelect({ value, options, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const selected = options.find((o) => String(o.id) === String(value));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o.label).toLowerCase().includes(q));
  }, [options, query]);

  // Close on outside click.
  useEffect(() => {
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Focus the search box when the panel opens.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const choose = (id) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={`relative ${open ? "z-50" : "z-0"}`} ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className={`${controlCls} flex items-center justify-between text-left`}
      >
        <span className={`truncate ${selected ? "text-gray-800" : "text-gray-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
          {/* Search box */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                placeholder="Type to search..."
                className="w-full border border-gray-300 rounded pl-7 pr-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Options */}
          <ul className="max-h-56 overflow-auto py-1">
            {value && (
              <li>
                <button
                  type="button"
                  onClick={() => choose("")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-500 hover:bg-slate-50"
                >
                  <X className="w-3.5 h-3.5" /> Clear selection
                </button>
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No matches</li>
            ) : (
              filtered.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => choose(o.id)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                      String(o.id) === String(value) ? "bg-slate-100 font-medium text-slate-800" : "text-gray-700"
                    }`}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const SummaryItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[11px] uppercase tracking-wide text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-800 break-words">{value || "—"}</span>
  </div>
);

export default function STTFilters({
  instituteOptions,
  courseOptions,
  batchOptions,
  selectedInstituteId,
  selectedCourseId,
  selectedBatchId,
  onSelectInstitute,
  onSelectCourse,
  onSelectBatch,
  onLoad,
  canLoad,
  loadingCandidates,

  assessmentDate,
  setAssessmentDate,
  isSubmitted,

  batchInfo,
  loaded,
}) {
  const selectedInstitute = instituteOptions.find(
    (i) => String(i.id) === String(selectedInstituteId),
  );

  // Map the hook's option shapes to the { id, label } the SearchableSelect needs.
  const instituteItems = useMemo(
    () => instituteOptions.map((i) => ({ id: i.id, label: i.name })),
    [instituteOptions],
  );
  const courseItems = useMemo(
    () => courseOptions.map((c) => ({ id: c.id, label: c.name })),
    [courseOptions],
  );
  const batchItems = useMemo(
    () => batchOptions.map((b) => ({ id: b.id, label: String(b.id) })),
    [batchOptions],
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      <div className="flex items-center gap-2 mb-4 text-gray-700">
        <Filter className="w-4 h-4" />
        <h2 className="font-semibold">Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Institute */}
        <div>
          <label className={labelCls}>
            Institute <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={selectedInstituteId}
            options={instituteItems}
            onChange={onSelectInstitute}
            placeholder="-- Select Institute --"
            disabled={isSubmitted}
          />
        </div>

        {/* Institute Code (derived, read-only) */}
        <div>
          <label className={labelCls}>Institute Code</label>
          <input
            type="text"
            readOnly
            value={selectedInstitute?.code ?? ""}
            placeholder="Auto"
            className={`${controlCls} cursor-default`}
          />
        </div>

        {/* Course */}
        <div>
          <label className={labelCls}>
            Course <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={selectedCourseId}
            options={courseItems}
            onChange={onSelectCourse}
            placeholder="-- Select Course --"
            disabled={isSubmitted || !selectedInstituteId}
          />
        </div>

        {/* Course Code (derived, read-only) */}
        <div>
          <label className={labelCls}>Course Code</label>
          <input
            type="text"
            readOnly
            value={courseOptions.find((c) => String(c.id) === String(selectedCourseId))?.code ?? ""}
            placeholder="Auto"
            className={`${controlCls} cursor-default`}
          />
        </div>

        {/* Batch */}
        <div>
          <label className={labelCls}>
            Batch <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={selectedBatchId}
            options={batchItems}
            onChange={onSelectBatch}
            placeholder="-- Select Batch --"
            disabled={isSubmitted || !selectedCourseId}
          />
        </div>
      </div>

      {/* Assessment date + Load */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-end">
        <div>
          <label className={labelCls}>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-4 h-4" /> Assessment Date{" "}
              <span className="text-red-500">*</span>
            </span>
          </label>
          <input
            type="date"
            className={controlCls}
            value={assessmentDate}
            onChange={(e) => setAssessmentDate(e.target.value)}
            disabled={isSubmitted}
          />
        </div>

        <div className="md:col-span-2 flex justify-start md:justify-end">
          <button
            type="button"
            onClick={onLoad}
            disabled={!canLoad}
            className="inline-flex items-center gap-2 bg-[#28a745] hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded transition-colors"
          >
            {loadingCandidates ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loadingCandidates ? "Loading..." : "Load Candidates"}
          </button>
        </div>
      </div>

      {/* Selected batch summary */}
      {loaded && batchInfo && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryItem label="Batch ID" value={batchInfo.batchId} />
            <SummaryItem label="Institute Name" value={batchInfo.instituteName} />
            <SummaryItem label="Institute Code" value={batchInfo.instituteCode} />
            <SummaryItem label="Course Name" value={batchInfo.courseName} />
            <SummaryItem label="Course Code" value={batchInfo.courseCode} />
          </div>
        </div>
      )}
    </div>
  );
}
