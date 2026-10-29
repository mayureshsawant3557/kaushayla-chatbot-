/* =============================================================================
   Module : Short Term Training Assessment Marks Entry
   File   : src/Component/STT/STTMarksGrid.jsx
   Purpose: Inline-editable marks grid (NO modal, NO pagination). Sticky header
            with the body scrolling only. Built-in search by Candidate Name /
            Application ID. Tab / Shift+Tab cycle ONLY through the editable mark
            cells (other controls are skipped while inside the grid).
            All inputs are disabled once the batch is submitted (locked).
   ============================================================================= */
import React, { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { MARK_LIMITS } from "../../Hooks/STT/useSTTAssessment";

const GRADE_STYLES = {
  PASS: "bg-green-100 text-green-700 border border-green-300",
  FAIL: "bg-red-100 text-red-700 border border-red-300",
  ABSENT: "bg-gray-200 text-gray-700 border border-gray-300",
};

const STATUS_STYLES = {
  Submitted: "bg-green-600 text-white",
  Draft: "bg-amber-500 text-white",
  Pending: "bg-gray-300 text-gray-700",
};

const Badge = ({ value, map, fallback = "—" }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[value] || "bg-gray-200 text-gray-600"}`}>
    {value || fallback}
  </span>
);

const thCls = "px-3 py-2 text-xs font-semibold text-white text-center whitespace-nowrap";
const tdCls = "px-3 py-2 text-sm text-gray-700 text-center align-middle";

/* A single editable numeric mark cell. Tagged with data-mark-cell so the grid
   can build the Tab navigation ring. */
function MarkCell({ value, field, candidateId, disabled, onChange }) {
  const limit = MARK_LIMITS[field];
  return (
    <input
      type="number"
      inputMode="numeric"
      data-mark-cell="1"
      min={0}
      max={limit}
      step={1}
      value={value}
      disabled={disabled}
      title={`0 - ${limit}`}
      onChange={(e) => onChange(candidateId, field, e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        // Block decimal point, exponent and sign (Tab handled by the grid).
        if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
      }}
      onWheel={(e) => e.currentTarget.blur()} // prevent scroll-changing value
      className={
        "w-20 border border-gray-300 rounded px-2 py-1 text-center text-sm " +
        "focus:outline-none focus:ring-2 focus:ring-slate-400 " +
        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed " +
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      }
    />
  );
}

export default function STTMarksGrid({ rows, isSubmitted, onMarkChange }) {
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);

  /* Filter by Candidate Name or Application ID (display value or raw id). */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const name = (r.CandidateName || "").toLowerCase();
      const appId = String(r.ApplicationIDDisplay ?? r.ApplicationID ?? "").toLowerCase();
      return name.includes(q) || appId.includes(q);
    });
  }, [rows, search]);

  /* Keep Tab within the editable mark cells only. Cycles top-to-bottom,
     left-to-right (theory -> observation -> viva -> next row). */
  const handleGridKeyDown = (e) => {
    if (e.key !== "Tab") return;
    const el = e.target;
    if (!el || el.getAttribute?.("data-mark-cell") == null) return;

    const inputs = Array.from(
      wrapRef.current?.querySelectorAll("input[data-mark-cell]:not([disabled])") || [],
    );
    const idx = inputs.indexOf(el);
    if (idx === -1) return;

    e.preventDefault();
    const delta = e.shiftKey ? -1 : 1;
    const next = inputs[(idx + delta + inputs.length) % inputs.length];
    if (next) {
      next.focus();
      next.select?.();
    }
  };

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
        No candidates loaded. Select filters and click <b>Load Candidates</b>.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Toolbar: search (stays fixed above the scrolling body) */}
      <div className="flex items-center justify-between gap-3 p-3 border-b border-gray-100">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name or application ID..."
            className="w-full border border-gray-300 rounded pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Showing {filtered.length} of {rows.length}
        </span>
      </div>

      {/* Scroll area: sticky header, body scrolls only */}
      <div ref={wrapRef} onKeyDown={handleGridKeyDown} className="overflow-auto max-h-[55vh]">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-700">
            <tr>
              <th className={`${thCls} text-left`}>Application ID</th>
              <th className={`${thCls} text-left`}>Candidate Name</th>
              <th className={thCls}>Total Theory<br />MM 140</th>
              <th className={thCls}>Practical 1 Observation<br />MM 230</th>
              <th className={thCls}>Practical 2 Viva<br />MM 80</th>
              <th className={thCls}>Total Practical<br />MM 310</th>
              <th className={thCls}>Grand Total<br />MM 450</th>
              <th className={thCls}>Percentage</th>
              <th className={thCls}>Grade</th>
              <th className={thCls}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-gray-500">
                  No candidates match your search.
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => (
                <tr
                  key={r.CandidateID}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-slate-50"}
                >
                  <td className={`${tdCls} text-left font-medium text-gray-800`}>
                    {r.ApplicationIDDisplay ?? r.ApplicationID}
                  </td>
                  <td className={`${tdCls} text-left`}>{r.CandidateName}</td>

                  <td className={tdCls}>
                    <MarkCell
                      value={r.TotalTheory140}
                      field="TotalTheory140"
                      candidateId={r.CandidateID}
                      disabled={isSubmitted}
                      onChange={onMarkChange}
                    />
                  </td>
                  <td className={tdCls}>
                    <MarkCell
                      value={r.PracticalObservation230}
                      field="PracticalObservation230"
                      candidateId={r.CandidateID}
                      disabled={isSubmitted}
                      onChange={onMarkChange}
                    />
                  </td>
                  <td className={tdCls}>
                    <MarkCell
                      value={r.PracticalViva80}
                      field="PracticalViva80"
                      candidateId={r.CandidateID}
                      disabled={isSubmitted}
                      onChange={onMarkChange}
                    />
                  </td>

                  <td className={`${tdCls} font-semibold text-gray-800`}>{r.TotalPractical310}</td>
                  <td className={`${tdCls} font-semibold text-gray-800`}>{r.GrandTotal450}</td>
                  <td className={`${tdCls} font-semibold`}>{Number(r.Percentage).toFixed(2)}%</td>
                  <td className={tdCls}>
                    <Badge value={r.Grade} map={GRADE_STYLES} />
                  </td>
                  <td className={tdCls}>
                    <Badge value={r.RowStatus} map={STATUS_STYLES} fallback="Pending" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
