
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronDown, Upload, Info, ChevronRight, ChevronsDown, ChevronsUp, Loader2, CheckCircle2, ArrowUp, ArrowDown, Search, X } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import agent from "../../lib/api/agent";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { GetCurrentFinancialYear, StateFundSaveAllocation } from "../../Endpoints_All/Base/Institute";
import { GetStateFundOfficeUsers, GetStateFundAllocation } from "../../Endpoints_All/Base/DVETO";
import { useAuth } from "../../Hooks/AuthContext";
import OTPService from "../../Component/formcomponent/OTPService";
import { GetUserDetails } from "../../Endpoints_All/ITISpecification/itiSpecification";
import { useLoading } from "../../Hooks/useLoading";
import mahaLogo from "../../assets/Maharashtra.png";
import boardLogo from "../../assets/Board Logo - small size.jpg";

const P = {
  primary: "#1a56db",
  primaryDark: "#1e40af",
  accent: "#0ea5e9",
  teal: "#0d9488",
  violet: "#7c3aed",
  amber: "#d97706",
  success: "#16a34a",
  successBg: "#f0fdf4",
  successBdr: "#86efac",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  dangerBdr: "#fca5a5",
  warnBg: "#fffbeb",
  warnBdr: "#fcd34d",
  surface: "#ffffff",
  surfaceAlt: "#f8fafc",
  bg: "#f1f5f9",
  border: "#e2e8f0",
  text: "#0f172a",
  textMid: "#475569",
  textMuted: "#94a3b8",
  alloc: "#eff6ff",
  dist: "#f0f9ff",
  bal: "#f0fdf4",
};

const SECTION_ACCENTS = [
  { strip: P.accent, light: "#f0f9ff", text: "#0369a1" },
  { strip: P.violet, light: "#f5f3ff", text: "#5b21b6" },
  { strip: P.amber, light: "#fffbeb", text: "#92400e" },
  { strip: P.teal, light: "#f0fdfa", text: "#115e59" },
];

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const parseNum = (v) => parseFloat(String(v).replace(/,/g, "")) || 0;
const pct = (num, den) => (den > 0 ? Math.min(100, Math.round((num / den) * 100)) : 0);

// Used only for the "Printed on ..." line printed on every PDF export.
const formatDateTimeForPDF = (d) =>
  d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const USER_TYPE_LABELS = {
  12: "DVET",
  13: "RO",
  15: "DVETO",
};

// UserTypeID 61 ("Institutes") is shared by BOTH GTHS institutes (used in
// Sections A/B) and GITI institutes (used in Sections B/C) — the backend
// does not send a separate type for them. So the real office type has to
// be inferred from the institute name itself; otherwise every 61 row gets
// stuck with one hardcoded label (e.g. GITI institutes under Section C
// incorrectly showing as "GTHS").
function inferInstituteGroup(label) {
  const up = String(label || "").toUpperCase();
  if (up.includes("TECHNICAL HIGH SCHOOL")) return "GTHS";
  if (up.includes("INDUSTRIAL TRAINING INSTITUTE")) return "GITI";
  return "DVETO";
}

// Returns { key, label } for the office-type group a row belongs to.
// DVET / RO / DVETO come straight from UserTypeID; anything else (mainly
// UserTypeID 61) is inferred from the institute name so GTHS and GITI
// institutes are grouped and labeled correctly instead of both showing
// the same wrong name.
function officeGroupInfo(row) {
  const known = USER_TYPE_LABELS[row.userTypeId];
  if (known) return { key: String(row.userTypeId), label: known };
  const inferred = inferInstituteGroup(row.label);
  return { key: inferred, label: inferred };
}

// ── Group color palette ─────────────────────────────────────────────────
// Each office-type group (DVET / RO / DVETO / Institutes...) gets a stable
// color so rows stay identifiable even after you've scrolled past that
// group's header row. Color is picked deterministically from the group
// key so the same office type always gets the same color across sections.
const GROUP_COLOR_PALETTE = [
  { bg: "#eff6ff", text: "#1d4ed8", strip: "#3b82f6" }, // blue
  { bg: "#f5f3ff", text: "#6d28d9", strip: "#8b5cf6" }, // violet
  { bg: "#f0fdfa", text: "#0f766e", strip: "#14b8a6" }, // teal
  { bg: "#fff7ed", text: "#c2410c", strip: "#f97316" }, // orange
  { bg: "#fdf2f8", text: "#be185d", strip: "#ec4899" }, // pink
  { bg: "#f0fdf4", text: "#15803d", strip: "#22c55e" }, // green
];

function getGroupColor(groupKey) {
  const key = String(groupKey ?? "unknown");
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return GROUP_COLOR_PALETTE[hash % GROUP_COLOR_PALETTE.length];
}

function groupRowsByType(rows) {
  const buckets = {};
  rows.forEach((r) => {
    const { key, label } = officeGroupInfo(r);
    if (!buckets[key]) {
      buckets[key] = {
        groupKey: key,
        groupLabel: label,
        items: [],
      };
    }
    buckets[key].items.push(r);
  });
  return Object.values(buckets);
}

function warnInvalidTotalAllocation({ label, newAllocation, alreadyDistributed }) {
  Swal.fire({
    title: "Invalid Total Allocation",
    html: `<div style="font-family:sans-serif;text-align:center;line-height:1.8">
      <p><b>${label}</b></p>
      <p>Total Distribution entered = <b>₹ ${fmt(alreadyDistributed)}</b></p>
      <p>New Allocation = <b style="color:#dc2626">₹ ${fmt(newAllocation)}</b></p>
      <p style="color:#d97706;font-size:13px">Allocation cannot be less than already distributed amount.</p>
    </div>`,
    icon: "warning",
    confirmButtonColor: P.primary,
    confirmButtonText: "OK",
  });
}

function warnAllocationExceeded({ label, totalAllocation, alreadyDistributed, remBalance }) {
  Swal.fire({
    title: "Allocation Exceeded",
    html: `<div style="font-family:sans-serif;text-align:center;line-height:1.8">
      <p><b>${label}</b></p>
      <p>Total Allocation = <b>₹ ${fmt(totalAllocation)}</b></p>
      <p>Already Distributed = <b>₹ ${fmt(alreadyDistributed)}</b></p>
      <p>Available Balance = <b style="color:${remBalance >= 0 ? "#16a34a" : "#dc2626"}">₹ ${fmt(remBalance)}</b></p>
      <p style="color:#d97706;font-size:13px">Amount must not exceed available balance.</p>
    </div>`,
    icon: "warning",
    confirmButtonColor: P.primary,
    confirmButtonText: "OK",
  });
}

const BUDGET_SECTIONS = [
  {
    sectionCode: "A",
    title: "Strengthening of DVET",
    budgetCode: "22033462",
    objectCode: "52",
    headName: "Machinery",
    applicableOffices: ["DVET", "MSBSVET", "RO", "DVETO", "GTHS"],
  },
  {
    sectionCode: "B",
    title: "Strengthening of DVET",
    budgetCode: "2230A174",
    objectCode: "52",
    headName: "Machinery",
    applicableOffices: ["DVET", "MSBSVET", "RO", "DVETO", "GITI", "BRTI"],
  },
  {
    sectionCode: "C",
    title: "Expansion of ITI",
    budgetCode: "2230A209",
    objectCode: "52",
    headName: "Machinery",
    applicableOffices: ["GITI"],
  },
];

const emptyAllocationState = () => ({
  A: { totalAllocation: 0, distributions: {} },
  B: { totalAllocation: 0, distributions: {} },
  C: { totalAllocation: 0, distributions: {} },
});

// ── Response mapping helpers for GetStateFundAllocation ────────────────────
// The API is expected to return records shaped like the save payload
// (allocationTypeID: 1 = Total Allocation, 2 = Distribution, 3 = GTHS
// Institute Split). Field casing can differ depending on the backend
// serializer, so every field is read defensively with several possible
// key names.
const pickField = (rec, keys) => {
  for (const k of keys) {
    if (rec && rec[k] !== undefined && rec[k] !== null) return rec[k];
  }
  return undefined;
};

function extractAllocationRecords(rawData) {
  // rawData is whatever came back on res.data
  const d = rawData?.Data ?? rawData?.data ?? rawData;

  if (Array.isArray(d)) {
    return d;
  }

  // Some endpoints (like GetStateFundOfficeUsers) return a dataset with
  // Table / Table1 / Table2 style keys instead of a flat array.
  if (d && typeof d === "object") {
    const tableKeys = Object.keys(d).filter((k) => /^Table\d*$/i.test(k));
    if (tableKeys.length) {
      const merged = tableKeys.reduce((acc, k) => acc.concat(Array.isArray(d[k]) ? d[k] : []), []);
      return merged;
    }
  }

  return [];
}

function mapAllocationRecordsToState(records) {
  const allocationState = emptyAllocationState();
  const instituteSplit = {};

  records.forEach((rec, idx) => {
    const sectionCodeRaw = pickField(rec, ["SectionCode", "sectionCode", "Section", "section"]);
    const sectionCode = sectionCodeRaw != null ? String(sectionCodeRaw).trim().toUpperCase() : null;
    if (!sectionCode || !allocationState[sectionCode]) {
      return;
    }

    // The GetStateFundAllocation endpoint does NOT return an
    // AllocationTypeID field. Instead each row's shape tells us what it is:
    //   - Total Allocation rows carry a TotalAllocation field, no OfficeUserID
    //   - Distribution rows carry OfficeUserID + Amount, no TotalAllocation
    //   - GTHS Institute Split rows also carry OfficeUserID + Amount, but are
    //     distinguished by a Remarks value of "GTHS Institute Split"
    // We first try an explicit AllocationTypeID (in case a future/other
    // endpoint does send it), and fall back to shape-based detection.
    let allocationTypeID = Number(pickField(rec, ["AllocationTypeID", "allocationTypeID", "AllocationTypeId"]));

    const totalAllocationRaw = pickField(rec, ["TotalAllocation", "totalAllocation", "Total_Allocation"]);
    const officeUserIDRaw = pickField(rec, ["OfficeUserID", "officeUserID", "OfficeUserId", "UserID", "userID"]);
    const remarksRaw = pickField(rec, ["Remarks", "remarks"]);
    const remarks = remarksRaw != null ? String(remarksRaw).trim().toLowerCase() : null;

    if (!allocationTypeID || Number.isNaN(allocationTypeID)) {
      if (remarks && (remarks.includes("gths") || remarks.includes("institute split"))) {
        allocationTypeID = 3;
      } else if (totalAllocationRaw !== undefined && officeUserIDRaw === undefined) {
        allocationTypeID = 1;
      } else if (officeUserIDRaw !== undefined) {
        allocationTypeID = 2;
      }
    }

    // Amount lives in different fields depending on row type: Total rows use
    // TotalAllocation, Distribution/GTHS rows use Amount.
    const amount =
      allocationTypeID === 1
        ? Number(totalAllocationRaw) || 0
        : Number(pickField(rec, ["Amount", "amount"])) || 0;

    if (allocationTypeID === 1) {
      // Total Allocation for the section
      allocationState[sectionCode].totalAllocation = amount;
    } else if (allocationTypeID === 2) {
      // Distribution to a specific office user
      if (officeUserIDRaw === undefined) {
        return;
      }
      const rowKey = String(officeUserIDRaw);
      allocationState[sectionCode].distributions[rowKey] = amount;
    } else if (allocationTypeID === 3) {
      // GTHS institute-wise split (always tracked against Section A rows)
      if (officeUserIDRaw === undefined) {
        return;
      }
      const rowKey = String(officeUserIDRaw);
      instituteSplit[rowKey] = amount;
    }
  });

  return { allocationState, instituteSplit };
}

// ── NEW VALIDATION: deterministic snapshot serializer ───────────────────────
// Used only to detect "no changes since last save" before Save/OTP. Mirrors
// the same amt > 0 filtering already used inside buildSavePayload(), so the
// comparison stays consistent with what actually gets sent to the server.
// Pure function — reads nothing, writes nothing, changes no existing state
// or payload shape.
function serializeAllocationSnapshot(allocationState, instituteSplit) {
  const parts = [];

  BUDGET_SECTIONS.forEach((sec) => {
    const secState = allocationState[sec.sectionCode] || { totalAllocation: 0, distributions: {} };
    parts.push(`TA:${sec.sectionCode}:${secState.totalAllocation || 0}`);

    const rowKeys = Object.keys(secState.distributions || {}).sort();
    rowKeys.forEach((rowKey) => {
      const amt = secState.distributions[rowKey] || 0;
      if (amt > 0) parts.push(`D:${sec.sectionCode}:${rowKey}:${amt}`);
    });
  });

  const splitKeys = Object.keys(instituteSplit || {}).sort();
  splitKeys.forEach((rowKey) => {
    const amt = instituteSplit[rowKey] || 0;
    if (amt > 0) parts.push(`S:${rowKey}:${amt}`);
  });

  return parts.join("|");
}

// ── Export builders for Sections A/B/C ───────────────────────────────────
// Pull plain numbers straight from allocationState/rows instead of the
// rendered JSX cells (<Cell/>, <BalPill/>) that live in tableRows.
function buildSectionExportRows(section, rows, data) {
  const grouped = groupRowsByType(rows);
  const body = [];
  let sn = 0;
  grouped.forEach((g) => {
    g.items.forEach((item) => {
      sn++;
      const amt = data.distributions[item.rowKey] || 0;
      body.push([sn, item.label, g.groupLabel, amt]);
    });
  });
  const totalDist = rows.reduce((a, r) => a + (data.distributions[r.rowKey] || 0), 0);
  const totalCount = body.length;
  const distributedCount = body.filter((r) => (r[3] || 0) > 0).length;
  return {
    body,
    totalAlloc: data.totalAllocation || 0,
    totalDist,
    balance: (data.totalAllocation || 0) - totalDist,
    totalCount,
    distributedCount,
  };
}

function exportSectionToExcel(section, rows, data) {
  const { body, totalAlloc, totalDist, balance } = buildSectionExportRows(section, rows, data);
  if (body.length === 0) {
    Swal.fire({ icon: "warning", title: "No Data", text: "No data available to export." });
    return;
  }
  const title = `[${section.sectionCode}] ${section.title} — ${section.budgetCode}/${section.objectCode}`;
  const headers = ["SN", "Institute / Office", "Group", `${section.budgetCode}/${section.objectCode}`];
  const aoa = [
    [title],
    [],
    headers,
    ...body,
    [],
    ["", "Total Allocation", "", totalAlloc],
    ["", "Total Distribution", "", totalDist],
    ["", "Balance", "", balance],
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Section ${section.sectionCode}`);
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `StateFund_Section_${section.sectionCode}.xlsx`);
}

// Converts an imported image asset (bundler URL) into a base64 data URL.
// jsPDF's addImage() requires base64/data-URL input, not a plain URL.
function loadImageAsBase64(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = src;
  });
}

// ── Shared government header block — used by EVERY PDF export (Sections
// A, B, C, and D). Draws the Maharashtra emblem + board logo, the three
// lines of department text, a divider, and the given section title.
// Returns the Y position where the data table should start.
async function addGovernmentHeaderToPDF(doc, sectionTitleLine) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoSize = 16; // mm — sized to fit both portrait (A/B/C) and landscape (D) pages
  const pageCenter = pageWidth / 2;
  const marginX = 14;

  // Measure the actual widest line of department text (at the font size it
  // will be drawn at) so the logos are placed with a real, comfortable gap
  // instead of a guessed constant — this is what was causing the right
  // logo to overlap the "...Innovation Department" line before.
  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  const widestLineWidth = Math.max(
    doc.getTextWidth("Skill, Employment, Entrepreneurship and Innovation Department"),
    doc.getTextWidth("Maharashtra State Board of Skill, Vocational Education and")
  );
  const textHalfWidth = widestLineWidth / 2;
  const gap = 10; // comfortable breathing room between text and each logo

  const leftLogoX = Math.max(marginX, pageCenter - textHalfWidth - logoSize - gap);
  const rightLogoX = Math.min(pageWidth - marginX - logoSize, pageCenter + textHalfWidth + gap);

  try {
    const [mahaLogoBase64, boardLogoBase64] = await Promise.all([
      loadImageAsBase64(mahaLogo),
      loadImageAsBase64(boardLogo),
    ]);
    doc.addImage(mahaLogoBase64, "PNG", leftLogoX, 6, logoSize, logoSize);
    doc.addImage(boardLogoBase64, "PNG", rightLogoX, 6, logoSize, logoSize);
  } catch (e) {
    // Logos are decorative — if they fail to load, continue rendering the PDF without them.
  }

  doc.setFont(undefined, "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(26, 86, 219);
  doc.text("Government of Maharashtra", pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(10);
  doc.text("Skill, Employment, Entrepreneurship and Innovation Department", pageWidth / 2, 15.5, { align: "center" });
  doc.text("Maharashtra State Board of Skill, Vocational Education and", pageWidth / 2, 20.5, { align: "center" });
  doc.text("Training", pageWidth / 2, 25, { align: "center" });
  doc.setTextColor(0, 0, 0);

  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.5);
  doc.line(14, 29, pageWidth - 14, 29);

  doc.setFontSize(12);
  doc.text(sectionTitleLine, 14, 36);
  doc.setFont(undefined, "normal");

  return 41; // startY for the data table below the header
}

// Prints "Printed on: <date>, <time>" bottom-right on every page of the
// PDF (same date/time format as before, just relocated to the footer per
// feedback — and reworded from "Generated on" to "Printed on").
function addPrintedOnFooter(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont(undefined, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Printed on: ${formatDateTimeForPDF(new Date())}`, pageWidth - 14, pageHeight - 8, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }
}


// ── PDF export for Sections A / B / C ────────────────────────────────────
async function exportSectionToPDF(section, rows, data) {
  const { body, totalAlloc, totalDist, balance, totalCount, distributedCount } = buildSectionExportRows(section, rows, data);
  if (body.length === 0) {
    Swal.fire({ icon: "warning", title: "No Data", text: "No data available to export." });
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");
  const startY = await addGovernmentHeaderToPDF(
    doc,
    `[${section.sectionCode}] ${section.title} (${section.budgetCode}/${section.objectCode})`
  );

  // Summary counts shown FIRST — right under the header, before the
  // institute-wise table — so it's immediately clear how many of the
  // total institutes/offices have actually been given a distribution.
  autoTable(doc, {
    startY,
    theme: "grid",
    head: [["Summary", "Value"]],
    body: [
      ["Total Institutes / Offices", `${totalCount}`],
      ["Institutes / Offices Distributed", `${distributedCount} of ${totalCount} (${pct(distributedCount, totalCount)}%)`],
      ["Total Allocation", `Rs. ${fmt(totalAlloc)}`],
      ["Total Distribution", `Rs. ${fmt(totalDist)}`],
      ["Balance", `Rs. ${fmt(balance)}`],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [26, 86, 219], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 75 }, 1: { cellWidth: 55 } },
    tableWidth: "wrap",
  });

  const tableStartY = (doc.lastAutoTable?.finalY || startY) + 8;

  autoTable(doc, {
    head: [["SN", "Institute / Office", "Group", `${section.budgetCode}/${section.objectCode}`]],
    body: body.map((r) => [r[0], r[1], r[2], `Rs. ${fmt(r[3])}`]),
    startY: tableStartY,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [26, 86, 219], textColor: 255, fontStyle: "bold" },
  });

  addPrintedOnFooter(doc);
  doc.save(`StateFund_Section_${section.sectionCode}.pdf`);
}

// ── Export builders for Section D (consolidated summary) ────────────────
function buildSummaryExportRows(officeUsersBySection, allocationState) {
  const map = new Map();
  BUDGET_SECTIONS.forEach((s) => {
    (officeUsersBySection[s.sectionCode] || []).forEach((u) => {
      if (!map.has(u.rowKey)) map.set(u.rowKey, u);
    });
  });
  const allRows = Array.from(map.values());
  const grouped = groupRowsByType(allRows);
  const body = [];
  let sn = 0;
  grouped.forEach((g) => {
    g.items.forEach((item) => {
      sn++;
      const amounts = BUDGET_SECTIONS.map((s) => allocationState[s.sectionCode]?.distributions?.[item.rowKey] || 0);
      const total = amounts.reduce((a, b) => a + b, 0);
      body.push([sn, item.label, g.groupLabel, ...amounts, total]);
    });
  });
  const totalAllocRow = BUDGET_SECTIONS.map((s) => allocationState[s.sectionCode]?.totalAllocation || 0);
  const totalDistRow = BUDGET_SECTIONS.map((s) =>
    Object.values(allocationState[s.sectionCode]?.distributions || {}).reduce((a, v) => a + (v || 0), 0)
  );
  const grandAlloc = totalAllocRow.reduce((a, b) => a + b, 0);
  const grandDist = totalDistRow.reduce((a, b) => a + b, 0);
  const totalCount = body.length;
  const distributedCount = body.filter((r) => (r[r.length - 1] || 0) > 0).length;
  return { body, totalAllocRow, totalDistRow, grandAlloc, grandDist, totalCount, distributedCount };
}

function exportSummaryToExcel(officeUsersBySection, allocationState) {
  const { body, totalAllocRow, totalDistRow, grandAlloc, grandDist } = buildSummaryExportRows(
    officeUsersBySection,
    allocationState
  );
  if (body.length === 0) {
    Swal.fire({ icon: "warning", title: "No Data", text: "No data available to export." });
    return;
  }
  const codeHeaders = BUDGET_SECTIONS.map((s) => `${s.budgetCode}/${s.objectCode}`);
  const headers = ["SN", "Institute / Office", "Group", ...codeHeaders, "Total"];
  const aoa = [
    ["D. State Fund — Consolidated Summary"],
    [],
    headers,
    ["", "Total Allocation", "", ...totalAllocRow, grandAlloc],
    ...body,
    ["", "Total Distribution", "", ...totalDistRow, grandDist],
    ["", "Balance", "", ...totalAllocRow.map((a, i) => a - totalDistRow[i]), grandAlloc - grandDist],
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "State Fund Summary");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `StateFund_Section_D_Summary.xlsx`);
}

// ── PDF export for Section D (consolidated summary) ─────────────────────
async function exportSummaryToPDF(officeUsersBySection, allocationState) {
  const { body, totalAllocRow, totalDistRow, grandAlloc, grandDist, totalCount, distributedCount } = buildSummaryExportRows(
    officeUsersBySection,
    allocationState
  );
  if (body.length === 0) {
    Swal.fire({ icon: "warning", title: "No Data", text: "No data available to export." });
    return;
  }

  const doc = new jsPDF("l", "mm", "a4");
  const startY = await addGovernmentHeaderToPDF(doc, "State Fund — Consolidated Summary");

  // Summary counts shown FIRST — right under the header, before the
  // institute-wise table — so it's immediately clear how many of the
  // total institutes/offices have actually received a distribution.
  autoTable(doc, {
    startY,
    theme: "grid",
    head: [["Summary", "Value"]],
    body: [
      ["Total Institutes / Offices", `${totalCount}`],
      ["Institutes / Offices Distributed", `${distributedCount} of ${totalCount} (${pct(distributedCount, totalCount)}%)`],
      ["Grand Total Allocation", `Rs. ${fmt(grandAlloc)}`],
      ["Grand Total Distribution", `Rs. ${fmt(grandDist)}`],
      ["Grand Balance", `Rs. ${fmt(grandAlloc - grandDist)}`],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 75 }, 1: { cellWidth: 55 } },
    tableWidth: "wrap",
  });

  const codeHeaders = BUDGET_SECTIONS.map((s) => `${s.budgetCode}/${s.objectCode}`);
  const pdfBody = body.map((r) => {
    const [sn, name, group, ...amounts] = r;
    const total = amounts[amounts.length - 1];
    const codeAmts = amounts.slice(0, -1);
    return [sn, name, group, ...codeAmts.map((a) => `Rs. ${fmt(a)}`), `Rs. ${fmt(total)}`];
  });

  const tableStartY = (doc.lastAutoTable?.finalY || startY) + 8;

  autoTable(doc, {
    head: [["SN", "Institute / Office", "Group", ...codeHeaders, "Total"]],
    body: pdfBody,
    startY: tableStartY,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: "bold" },
  });

  addPrintedOnFooter(doc);
  doc.save(`StateFund_Section_D_Summary.pdf`);
}

function BalPill({ value }) {
  const neg = value < 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        background: neg ? P.dangerBg : P.successBg,
        color: neg ? P.danger : P.success,
        border: `1px solid ${neg ? P.dangerBdr : P.successBdr}`,
        whiteSpace: "nowrap",
      }}
    >
      {neg ? "▼" : "▲"} ₹{fmt(Math.abs(value))}
    </span>
  );
}

function BudgetCodeBadge({ code, tone }) {
  const clr = tone || { text: P.primaryDark, light: "#eef2ff", strip: P.primary };
  return (
    <span
      title={code}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 8,
        fontSize: 12.5,
        fontWeight: 800,
        letterSpacing: 0.3,
        fontFamily: "'Consolas','Courier New',monospace",
        background: clr.light,
        color: clr.text,
        border: `1px solid ${clr.text}33`,
        borderLeft: `3px solid ${clr.strip || clr.text}`,
        whiteSpace: "nowrap",
      }}
    >
      {code}
    </span>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div
      className="sfa-stat-card"
      style={{
        flex: "1 1 150px",
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: 12,
        padding: "14px 18px",
        borderTop: `3px solid ${color}`,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: P.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: P.text }}>₹{value}</div>
      {sub !== undefined && <div style={{ fontSize: 11, color: P.textMuted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionProgress({ alloc, dist }) {
  const p = pct(dist, alloc);
  const barColor = p < 40 ? P.danger : p < 80 ? P.amber : P.success;
  return (
    <div style={{ minWidth: 130, flex: "1 1 130px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: P.textMid, marginBottom: 4, gap: 6 }}>
        <span style={{ fontWeight: 600 }}>₹{fmt(dist)} distributed</span>
        <span style={{ fontWeight: 700, color: barColor }}>{p}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: P.border, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 99, width: `${p}%`, background: barColor, transition: "width .5s ease" }} />
      </div>
      <div style={{ fontSize: 10, color: P.textMuted, marginTop: 3 }}>of ₹{fmt(alloc)} allocated</div>
    </div>
  );
}

function Cell({ value, onChange, disabled }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value === 0 ? "" : value}
      placeholder="0"
      disabled={disabled}
      onChange={(e) => onChange(parseNum(e.target.value))}
      style={{
        width: "100%",
        minWidth: 90,
        padding: "7px 10px",
        borderRadius: 7,
        border: `1px solid ${P.border}`,
        fontSize: 13,
        background: disabled ? P.surfaceAlt : P.surface,
        color: disabled ? P.textMuted : P.text,
        cursor: disabled ? "not-allowed" : "text",
      }}
    />
  );
}

// ── Row style callback for FilteredTableComponent ──────────────────────────
// Same pattern as getRowStyle() on the DPDC page: special rows get a tinted
// background based on rowType. groupHeader rows (the collapsible office-type
// dividers) get their own amber tint so they stay visually distinct.
function getRowStyle(row) {
  if (!row) return {};
  switch (row.rowType) {
    case "allocation": return { background: P.alloc, fontWeight: "600" };
    case "distribution": return { background: P.dist, fontWeight: "600" };
    case "balance": return { background: P.bal };
    case "groupHeader":
      return {
        background: row.groupColor?.bg || "#fffaf0",
        borderLeft: `4px solid ${row.groupColor?.strip || P.amber}`,
      };
    case "institute":
      return row.groupColor ? { borderLeft: `3px solid ${row.groupColor.strip}` } : {};
    default:
      return {};
  }
}

// Renders the "Institute / Office" cell for a group-header row inside
// FilteredTableComponent — a clickable toggle with a chevron, same look as
// the old SectionGroupHeader, just rendered as a normal cell instead of a
// colSpan row.
function GroupHeaderCell({ row }) {
  const clr = row.groupColor || { text: P.text, strip: P.amber };
  return (
    <button
      onClick={row.onToggleGroup}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontWeight: 800,
        color: clr.text,
        padding: 0,
        fontSize: 13,
      }}
    >
      {row.groupOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: clr.strip, flexShrink: 0 }} />
      {row.name} <span style={{ color: P.textMuted, fontWeight: 700 }}>({row.groupCount})</span>
    </button>
  );
}

// Institute-row name cell: shows a small colored tag naming the office
// group (RO / DVET / DVETO / Institutes...) above the institute name, so
// you can tell which group a row belongs to even after scrolling past
// that group's header row.
function InstituteNameCell({ row }) {
  const clr = row.groupColor;
  return (
    <div>
      {row.groupLabel && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 9,
            fontWeight: 800,
            color: clr?.text || P.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginBottom: 2,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: clr?.strip || P.textMuted, flexShrink: 0 }} />
          {row.groupLabel}
        </div>
      )}
      <div style={{ fontWeight: "500", color: P.text, fontSize: 13 }}>{row.name}</div>
    </div>
  );
}

// ── UI-ONLY: floating scroll navigator ──────────────────────────────────
// Fixed bottom-right pair of buttons so the user can jump straight to the
// top or bottom of the page instead of manually scrolling through every
// section to find the Save button. Pure UI helper — no business logic.
function FloatingScrollNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 220);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

  return (
    <div
      className="sfa-scroll-nav"
      style={{
        position: "fixed",
        right: 18,
        bottom: 92,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity .2s ease, transform .2s ease",
      }}
    >
      <button
        onClick={scrollToTop}
        title="Scroll to top"
        aria-label="Scroll to top"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `1px solid ${P.border}`,
          background: P.surface,
          color: P.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(15,23,42,0.15)",
        }}
      >
        <ArrowUp size={18} />
      </button>
      <button
        onClick={scrollToBottom}
        title="Scroll to Save Allocation"
        aria-label="Scroll to bottom"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          background: `linear-gradient(135deg, ${P.primaryDark}, ${P.primary})`,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(26,86,219,0.35)",
        }}
      >
        <ArrowDown size={18} />
      </button>
    </div>
  );
}

// ── UI-ONLY: per-section search box ──────────────────────────────────────
// Lets the user type an institute/office name to filter the rows shown
// inside that section's table. Pure UI filter — it only changes which rows
// are rendered, it never touches allocationState, distributions, or any
// save/validation logic.
function SectionSearchBox({ value, onChange, matchCount, showCount }) {
  return (
    <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 340 }}>
      <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: P.textMuted, pointerEvents: "none" }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search institute / office…"
        style={{
          width: "100%",
          padding: "7px 30px 7px 30px",
          borderRadius: 8,
          border: `1px solid ${P.border}`,
          fontSize: 12.5,
          background: "#fff",
          color: P.text,
        }}
      />
      {value ? (
        <button
          onClick={() => onChange("")}
          title="Clear search"
          aria-label="Clear search"
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: P.textMuted,
            display: "flex",
            alignItems: "center",
            padding: 2,
          }}
        >
          <X size={10} />
        </button>
      ) : null}
      {showCount && value ? (
        <div style={{ position: "absolute", top: "90%", left: 0, marginTop: 2, fontSize: 10, color: matchCount > 0 ? P.textMuted : P.danger }}>
          {matchCount > 0 ? `${matchCount} match${matchCount === 1 ? "" : "es"}` : "No institute/office found"}
        </div>
      ) : null}
    </div>
  );
}

function BudgetSection({ section, index, rows, data, onTotalChange, onDistChange, isOpen, onToggle, usersLoading, openGroups, setOpenGroups }) {
  const clr = SECTION_ACCENTS[index % SECTION_ACCENTS.length];
  const totalAlloc = data.totalAllocation;
  const totalDist = rows.reduce((a, r) => a + (data.distributions[r.rowKey] || 0), 0);
  const balance = totalAlloc - totalDist;

  const groupedRows = useMemo(() => groupRowsByType(rows), [rows]);

  // ── UI-ONLY: search filter (does not touch allocationState) ─────────────
  const [searchTerm, setSearchTerm] = useState("");
  const filteredGroupedRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return groupedRows;
    return groupedRows
      .map((g) => ({ ...g, items: g.items.filter((it) => String(it.label || "").toLowerCase().includes(term)) }))
      .filter((g) => g.items.length > 0);
  }, [groupedRows, searchTerm]);
  const searchMatchCount = useMemo(() => filteredGroupedRows.reduce((a, g) => a + g.items.length, 0), [filteredGroupedRows]);

  const handleTotalChange = (v) => {
    if (v < totalDist) {
      warnInvalidTotalAllocation({
        label: `[${section.sectionCode}] ${section.title} (${section.budgetCode}/${section.objectCode})`,
        newAllocation: v,
        alreadyDistributed: totalDist,
      });
      return;
    }
    onTotalChange(section.sectionCode, v);
  };

  const handleDistChange = (rowKey, v) => {
    const currVal = data.distributions[rowKey] || 0;
    const otherDist = totalDist - currVal;
    const remBalance = totalAlloc - otherDist;

    if (v > remBalance) {
      const rowLabel = rows.find((r) => r.rowKey === rowKey)?.label || rowKey;
      warnAllocationExceeded({
        label: `[${section.sectionCode}] ${rowLabel}`,
        totalAllocation: totalAlloc,
        alreadyDistributed: otherDist,
        remBalance,
      });
      return;
    }
    onDistChange(section.sectionCode, rowKey, v);
  };

  const setAllGroups = (val) => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      const sec = { ...(next[section.sectionCode] || {}) };
      groupedRows.forEach((g) => {
        sec[g.groupKey] = val;
      });
      next[section.sectionCode] = sec;
      return next;
    });
  };

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({
      ...prev,
      [section.sectionCode]: {
        ...(prev[section.sectionCode] || {}),
        [groupKey]: !(prev[section.sectionCode]?.[groupKey] ?? false),
      },
    }));
  };

  const isGroupOpen = (groupKey) => openGroups?.[section.sectionCode]?.[groupKey] ?? true;

  // ── Export handlers (Excel / PDF) — read plain numbers from allocation
  // state directly, since tableRows holds rendered JSX cells, not raw
  // values. Always exports the full section dataset, independent of the
  // current search/collapse state.
  const handleExportExcel = () => exportSectionToExcel(section, rows, data);
  const handleExportPDF = () => exportSectionToPDF(section, rows, data);

  // ── Build columns + rows for FilteredTableComponent ─────────────────────
  // Same shape as buildTableData() on the DPDC page: a flat `rows` array of
  // plain objects keyed by column key, with JSX values, plus a `rowType` used
  // by getRowStyle() for tinting. Group-header rows are just rows too — the
  // toggle lives in the "name" column's rendered content instead of a
  // colSpan <tr>.
  const sc = section.sectionCode;

  const tableColumns = useMemo(
    () => [
      { key: "sn", header: "SN", width: "44px", render: (row) => <span style={{ color: P.textMuted, fontSize: "12px" }}>{row.sn}</span> },
      {
        key: "name",
        header: "Institute / Office",
        render: (row) =>
          row.rowType === "groupHeader" ? (
            <GroupHeaderCell row={row} />
          ) : row.rowType === "institute" ? (
            <InstituteNameCell row={row} />
          ) : (
            <span style={{ fontWeight: row.isSpecial ? "700" : "500", color: row.isSpecial ? P.primaryDark : P.text, fontSize: "13px" }}>
              {row.name}
            </span>
          ),
      },
      {
        key: sc,
        header: <BudgetCodeBadge code={`${section.budgetCode}/${section.objectCode}`} tone={clr} />,
        render: (row) => row[sc],
      },
      { key: "total", header: "Total", width: "120px", render: (row) => row.total },
    ],
    [sc, section.budgetCode, section.objectCode, clr]
  );

  const tableRows = useMemo(() => {
    const out = [];

    out.push({
      sn: "",
      name: "Total Allocation",
      isSpecial: true,
      rowType: "allocation",
      [sc]: <Cell value={totalAlloc} onChange={handleTotalChange} />,
      total: <span style={{ fontWeight: "800", color: P.primary, fontSize: "13px" }}>₹{fmt(totalAlloc)}</span>,
    });

    filteredGroupedRows.forEach((group) => {
      const open = searchTerm.trim() ? true : isGroupOpen(group.groupKey);
      const groupColor = getGroupColor(group.groupKey);
      out.push({
        sn: "",
        name: group.groupLabel,
        rowType: "groupHeader",
        groupOpen: open,
        groupCount: group.items.length,
        groupColor,
        onToggleGroup: () => toggleGroup(group.groupKey),
        [sc]: null,
        total: null,
      });
      if (open) {
        group.items.forEach((r, i) => {
          const val = data.distributions[r.rowKey] || 0;
          out.push({
            sn: i + 1,
            name: r.label,
            rowType: "institute",
            groupLabel: group.groupLabel,
            groupColor,
            [sc]: <Cell value={val} onChange={(v) => handleDistChange(r.rowKey, v)} />,
            total: <span style={{ fontWeight: "600", color: P.primary, fontSize: "13px" }}>₹{fmt(val)}</span>,
          });
        });
      }
    });

    out.push({
      sn: "",
      name: "Total Distribution",
      isSpecial: true,
      rowType: "distribution",
      [sc]: <span style={{ fontWeight: "700", color: P.accent, fontSize: "13px" }}>₹{fmt(totalDist)}</span>,
      total: <span style={{ fontWeight: "800", color: P.accent, fontSize: "13px" }}>₹{fmt(totalDist)}</span>,
    });

    out.push({
      sn: "",
      name: "Balance",
      isSpecial: true,
      rowType: "balance",
      [sc]: <BalPill value={balance} />,
      total: <BalPill value={balance} />,
    });

    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sc, totalAlloc, totalDist, balance, filteredGroupedRows, searchTerm, openGroups, data]);

  return (
    <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, marginBottom: 18, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ height: 4, background: clr.strip }} />
      <button
        onClick={onToggle}
        className="sfa-section-header"
        style={{ width: "100%", background: clr.light, border: "none", borderBottom: isOpen ? `1px solid ${P.border}` : "none", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", gap: 14, flexWrap: "wrap" }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: clr.text }}>
            {section.sectionCode}. {section.title}
          </div>
          <div style={{ fontSize: 11, color: P.textMid, marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span>Budget Code:</span>
            <BudgetCodeBadge code={section.budgetCode} tone={clr} />
            <span>&nbsp;·&nbsp; Object Code: <b>{section.objectCode}</b> ({section.headName}) &nbsp;·&nbsp; {section.applicableOffices.join(", ")}</span>
          </div>
        </div>
        <div className="sfa-section-header-right" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <SectionProgress alloc={totalAlloc} dist={totalDist} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, minWidth: 90 }}>
            <span style={{ fontSize: 11, color: P.textMid }}>Balance</span>
            <BalPill value={balance} />
          </div>
          <ChevronDown size={18} color={clr.text} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }} />
        </div>
      </button>

      {isOpen && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "10px 14px", background: P.surfaceAlt, borderBottom: `1px solid ${P.border}`, flexWrap: "wrap" }}>
            <SectionSearchBox value={searchTerm} onChange={setSearchTerm} matchCount={searchMatchCount} showCount />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setAllGroups(true)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${P.border}`, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                <ChevronsDown size={14} style={{ display: "inline", marginRight: 6 }} />Open All
              </button>
              <button onClick={() => setAllGroups(false)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${P.border}`, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                <ChevronsUp size={14} style={{ display: "inline", marginRight: 6 }} />Collapse All
              </button>
            </div>
          </div>

          {usersLoading ? (
            <div style={{ padding: "14px 12px", textAlign: "center", color: P.textMuted, fontSize: 12 }}>Loading office users…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "14px 12px", textAlign: "center", color: P.textMuted, fontSize: 12 }}>
              No office users found for: {section.applicableOffices.join(", ")}
            </div>
          ) : (
            <FilteredTableComponent
              data={tableRows}
              columns={tableColumns}
              searchable={false}
              sortable={false}
              showSearch={false}
              showExport={true}
              exportable={true}
              showExcel={true}
              showPDF={true}
              downloadCSV={handleExportExcel}
              downloadPDF={handleExportPDF}
              exportFileName={`StateFund_Section_${section.sectionCode}`}
              stickyHeader={true}
              maxHeight="560px"
              rowStyle={getRowStyle}
            />
          )}
        </>
      )}
    </div>
  );
}

// ── D. State Fund ───────────────────────────────────────────────────────
// Lists EVERY office user across every office type (DVET, RO, DVETO,
// Institutes/GTHS — not just GTHS), grouped with the same open/close
// behaviour as Sections A/B/C, and every cell under every budget code is a
// real editable input box (not "—"). Typing a value here writes straight
// into the same allocationState used by the A/B/C accordions above — it's
// the same numbers, just a faster consolidated way to enter them.
function StateFundSummary({ officeUsersBySection, allocationState, isOpen, onToggle, usersLoading, openGroups, setOpenGroups }) {
  const clr = SECTION_ACCENTS[3];
  const sectionCode = "D";

  // Every office user across A/B/C, deduped by rowKey, so every office type
  // shows up here — not just GTHS.
  const allRows = useMemo(() => {
    const map = new Map();
    BUDGET_SECTIONS.forEach((s) => {
      (officeUsersBySection[s.sectionCode] || []).forEach((u) => {
        if (!map.has(u.rowKey)) map.set(u.rowKey, u);
      });
    });
    return Array.from(map.values());
  }, [officeUsersBySection]);

  const sectionTotalAlloc = (code) => allocationState[code]?.totalAllocation || 0;
  const sectionTotalDist = (code) =>
    Object.values(allocationState[code]?.distributions || {}).reduce((a, v) => a + (v || 0), 0);

  // Section D is VIEW-ONLY — it's a read-only consolidated summary of the
  // amounts entered in Sections A/B/C above. There is no editing here, so
  // no change-handler / validation logic is needed for this section.

  const groupedRows = useMemo(() => groupRowsByType(allRows), [allRows]);

  // ── UI-ONLY: search filter (view-only section, no state changes) ────────
  const [searchTerm, setSearchTerm] = useState("");
  const filteredGroupedRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return groupedRows;
    return groupedRows
      .map((g) => ({ ...g, items: g.items.filter((it) => String(it.label || "").toLowerCase().includes(term)) }))
      .filter((g) => g.items.length > 0);
  }, [groupedRows, searchTerm]);
  const searchMatchCount = useMemo(() => filteredGroupedRows.reduce((a, g) => a + g.items.length, 0), [filteredGroupedRows]);

  const setAllGroups = (val) => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      const sec = { ...(next[sectionCode] || {}) };
      groupedRows.forEach((g) => {
        sec[g.groupKey] = val;
      });
      next[sectionCode] = sec;
      return next;
    });
  };

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({
      ...prev,
      [sectionCode]: { ...(prev[sectionCode] || {}), [groupKey]: !(prev[sectionCode]?.[groupKey] ?? false) },
    }));
  };

  const isGroupOpen = (groupKey) => openGroups?.[sectionCode]?.[groupKey] ?? true;

  const rowTotal = (rowKey) =>
    BUDGET_SECTIONS.reduce((a, s) => a + (allocationState[s.sectionCode]?.distributions?.[rowKey] || 0), 0);

  const grandAllocTotal = BUDGET_SECTIONS.reduce((a, s) => a + sectionTotalAlloc(s.sectionCode), 0);
  const grandDistTotal = BUDGET_SECTIONS.reduce((a, s) => a + sectionTotalDist(s.sectionCode), 0);

  // ── Export handlers (Excel / PDF) — read plain numbers directly from
  // allocationState/officeUsersBySection, since tableRows below holds
  // rendered JSX for every amount cell.
  const handleExportExcel = () => exportSummaryToExcel(officeUsersBySection, allocationState);
  const handleExportPDF = () => exportSummaryToPDF(officeUsersBySection, allocationState);

  // ── Build columns + rows for FilteredTableComponent ─────────────────────
  // Section D is view-only (a read-only consolidated summary), so every
  // amount column below is plain text — no <Cell> inputs, matching the
  // original markup exactly
  const tableColumns = useMemo(
    () => [
      { key: "sn", header: "SN", width: "44px", render: (row) => <span style={{ color: P.textMuted, fontSize: "12px" }}>{row.sn}</span> },
      {
        key: "name",
        header: "Institute / Office",
        render: (row) =>
          row.rowType === "groupHeader" ? (
            <GroupHeaderCell row={row} />
          ) : row.rowType === "institute" ? (
            <InstituteNameCell row={row} />
          ) : (
            <span style={{ fontWeight: row.isSpecial ? "700" : "500", color: row.isSpecial ? P.primaryDark : P.text, fontSize: "13px" }}>
              {row.name}
            </span>
          ),
      },
      ...BUDGET_SECTIONS.map((s) => ({
        key: s.sectionCode,
        header: <BudgetCodeBadge code={`${s.budgetCode}/${s.objectCode}`} tone={clr} />,
        render: (row) => row[s.sectionCode],
      })),
      { key: "total", header: "Total", width: "120px", render: (row) => row.total },
    ],
    [clr]
  );

  const tableRows = useMemo(() => {
    const out = [];

    const allocRow = { sn: "", name: "Total Allocation", isSpecial: true, rowType: "allocation" };
    BUDGET_SECTIONS.forEach((s) => {
      allocRow[s.sectionCode] = (
        <span style={{ fontWeight: "700", fontSize: "13px", color: P.primaryDark }}>₹{fmt(sectionTotalAlloc(s.sectionCode))}</span>
      );
    });
    allocRow.total = <span style={{ fontWeight: "800", color: P.primary, fontSize: "13px" }}>₹{fmt(grandAllocTotal)}</span>;
    out.push(allocRow);

    filteredGroupedRows.forEach((group) => {
      const open = searchTerm.trim() ? true : isGroupOpen(group.groupKey);
      const groupColor = getGroupColor(group.groupKey);
      const groupRow = {
        sn: "",
        name: group.groupLabel,
        rowType: "groupHeader",
        groupOpen: open,
        groupCount: group.items.length,
        groupColor,
        onToggleGroup: () => toggleGroup(group.groupKey),
        total: null,
      };
      BUDGET_SECTIONS.forEach((s) => { groupRow[s.sectionCode] = null; });
      out.push(groupRow);

      if (open) {
        group.items.forEach((row, i) => {
          const r = { sn: i + 1, name: row.label, rowType: "institute", groupLabel: group.groupLabel, groupColor };
          BUDGET_SECTIONS.forEach((s) => {
            const amt = allocationState[s.sectionCode]?.distributions?.[row.rowKey] || 0;
            r[s.sectionCode] = <span style={{ fontSize: "13px", color: P.text }}>₹{fmt(amt)}</span>;
          });
          r.total = <span style={{ fontWeight: "700", color: P.primary, fontSize: "13px" }}>₹{fmt(rowTotal(row.rowKey))}</span>;
          out.push(r);
        });
      }
    });

    const distRow = { sn: "", name: "Total Distribution", isSpecial: true, rowType: "distribution" };
    BUDGET_SECTIONS.forEach((s) => {
      distRow[s.sectionCode] = (
        <span style={{ fontWeight: "700", fontSize: "13px", color: P.accent }}>₹{fmt(sectionTotalDist(s.sectionCode))}</span>
      );
    });
    distRow.total = <span style={{ fontWeight: "800", color: P.accent, fontSize: "13px" }}>₹{fmt(grandDistTotal)}</span>;
    out.push(distRow);

    const balRow = { sn: "", name: "Balance", isSpecial: true, rowType: "balance" };
    BUDGET_SECTIONS.forEach((s) => {
      balRow[s.sectionCode] = <BalPill value={sectionTotalAlloc(s.sectionCode) - sectionTotalDist(s.sectionCode)} />;
    });
    balRow.total = <BalPill value={grandAllocTotal - grandDistTotal} />;
    out.push(balRow);

    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRows, allocationState, filteredGroupedRows, searchTerm, openGroups]);

  return (
    <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, marginBottom: 18, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ height: 4, background: clr.strip }} />
      <button
        onClick={onToggle}
        className="sfa-section-header"
        style={{ width: "100%", background: clr.light, border: "none", borderBottom: isOpen ? `1px solid ${P.border}` : "none", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", flexWrap: "wrap", gap: 10 }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: clr.text }}>D. State Fund</div>
        <ChevronDown size={18} color={clr.text} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }} />
      </button>

      {isOpen && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "10px 14px", background: P.surfaceAlt, borderBottom: `1px solid ${P.border}`, flexWrap: "wrap" }}>
            <SectionSearchBox value={searchTerm} onChange={setSearchTerm} matchCount={searchMatchCount} showCount />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setAllGroups(true)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${P.border}`, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                <ChevronsDown size={14} style={{ display: "inline", marginRight: 6 }} />Open All
              </button>
              <button onClick={() => setAllGroups(false)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${P.border}`, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                <ChevronsUp size={14} style={{ display: "inline", marginRight: 6 }} />Collapse All
              </button>
            </div>
          </div>

          {usersLoading ? (
            <div style={{ padding: "14px 12px", textAlign: "center", color: P.textMuted, fontSize: 12 }}>Loading office users…</div>
          ) : allRows.length === 0 ? (
            <div style={{ padding: "14px 12px", textAlign: "center", color: P.textMuted, fontSize: 12 }}>No office users found.</div>
          ) : (
            <FilteredTableComponent
              data={tableRows}
              columns={tableColumns}
              searchable={false}
              sortable={false}
              showSearch={false}
              showExport={true}
              exportable={true}
              showExcel={true}
              showPDF={true}
              downloadCSV={handleExportExcel}
              downloadPDF={handleExportPDF}
              exportFileName="StateFund_Section_D_Summary"
              stickyHeader={true}
              maxHeight="560px"
              rowStyle={getRowStyle}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function StateFundAllocation() {
  // ── Auth / OTP identity ────────────────────────────────────────────────
  const { userInfo } = useAuth();
  const loginID = userInfo?.UserID;

  // ── Global page loader (shown while any data fetch below is in flight) ──
  const { startLoading, stopLoading } = useLoading();

  const [allocationState, setAllocationState] = useState(emptyAllocationState());
  const [instituteSplit, setInstituteSplit] = useState({});
  const [openSections, setOpenSections] = useState({ A: true, B: true, C: true, D: true });
  const [openGroups, setOpenGroups] = useState({});

  const [financialYearOptions, setFinancialYearOptions] = useState([]);
  const [financialYearID, setFinancialYearID] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [fyLoading, setFyLoading] = useState(false);

  const [officeUsersLoading, setOfficeUsersLoading] = useState(false);
  const [officeUsersError, setOfficeUsersError] = useState(null);
  const [officeUsersBySection, setOfficeUsersBySection] = useState({ A: [], B: [], C: [] });

  // ── Server-backed allocation (source of truth is the database) ────────
  // GetStateFundAllocation is the single source of truth: SAVE writes to
  // TRN_StateFundAllocation, then GET reads it back and re-maps it into
  // allocationState / instituteSplit so the grid always reflects exactly
  // what's persisted server-side. No browser storage is used anywhere.
  const [allocationLoading, setAllocationLoading] = useState(false);
  const [allocationError, setAllocationError] = useState(null);
  const [allocationLoadedAt, setAllocationLoadedAt] = useState(null);

  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // ── OTP state ───────────────────────────────────────────────────────────
  const [userMobile, setUserMobile] = useState("");
  const [userName, setUserName] = useState("");
  const pendingSaveRef = useRef(null);

  // ── NEW VALIDATION: snapshot of the last server-loaded/last-saved state.
  // Used only to detect "no changes since last save" before Save/OTP —
  // mirrors the DPDC page's serverStateRef pattern. Does not affect payload
  // shape, business logic, or any existing state.
  const serverStateRef = useRef("");

  // ── Global loader: on whenever any of the page's existing loading flags
  // is true (financial years / office users / allocation), off once all
  // have finished. Purely observes existing state — no fetch logic touched.
  useEffect(() => {
    const isBusy = fyLoading || officeUsersLoading || allocationLoading;
    if (isBusy) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [fyLoading, officeUsersLoading, allocationLoading, startLoading, stopLoading]);

  const loadFinancialYears = useCallback(async () => {
    try {
      setFyLoading(true);
      const res = await agent.get(GetCurrentFinancialYear);
      const data = res.data?.Data || [];
      const options = data.map((item) => ({ value: item.YearId, label: item.YearDisplayName }));
      setFinancialYearOptions(options);
      const cur = data.find((x) => x.isCurrent);
      if (cur) {
        setFinancialYearID(cur.YearId);
        setSelectedFinancialYear(cur.YearDisplayName);
      }
    } catch (err) {
      // Failed to load financial years — options list stays empty.
    } finally {
      setFyLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinancialYears();
  }, [loadFinancialYears]);

  // ── Fetch logged-in user's details (mobile number) for OTP ────────────────
  const fetchUserMobile = useCallback(async () => {
    if (!loginID) return;
    try {
      const res = await agent.get(`${GetUserDetails}/${loginID}`);
      const record = res?.data;
      const mobile = record?.UserMobileNo || "";
      

      setUserMobile(String(mobile || ""));
      setUserName(record?.UserName || "");
    } catch (err) {
      setUserMobile("");
    }
  }, [loginID]);

  useEffect(() => {
    fetchUserMobile();
  }, [fetchUserMobile]);

  // ── OTP Service configuration ─────────────────────────────────────────────
  const otpService = OTPService({
    mobileNo: userMobile,
    purpose: "SubmitStateFundAllocation",
    isVerifyRequired: true,
    messege: "OTP verification required to save State Fund allocation",
    isDuplicateCheck: false,
    onSuccess: async () => {
      const pending = pendingSaveRef.current;
      if (pending) {
        pendingSaveRef.current = null;
        await performSaveAllocation(pending.payload);
      }
    },
    onError: (error) => {
      pendingSaveRef.current = null;
      Swal.fire({ title: "Verification Failed", text: error?.message || "OTP failed.", icon: "error" });
    },
    onCancel: () => {
      pendingSaveRef.current = null;
    },
  });

  const mapUserRows = (list) =>
    (Array.isArray(list) ? list : []).map((item, i) => ({
      rowKey: String(item.UserID ?? item.SrNo ?? `row-${i}`),
      label: item.UserName ?? "—",
      userTypeId: item.UserTypeID,
    }));

  const loadStateFundOfficeUsers = useCallback(async () => {
    try {
      setOfficeUsersLoading(true);
      setOfficeUsersError(null);
      const res = await agent.get(GetStateFundOfficeUsers);
      const data = res?.data?.Data ?? {};
      setOfficeUsersBySection({
        A: mapUserRows(data.Table ?? []),
        B: mapUserRows(data.Table1 ?? []),
        C: mapUserRows(data.Table2 ?? []),
      });
    } catch (err) {
      setOfficeUsersError(err?.message || "Failed to load state fund office users");
    } finally {
      setOfficeUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStateFundOfficeUsers();
  }, [loadStateFundOfficeUsers]);

  // ── GET StateFund_GetAllocation: reads whatever is currently persisted ───
  // for the selected financial year and maps it straight into
  // allocationState / instituteSplit. This is called both on financial-year
  // change AND immediately after a successful save, so the grid is always
  // bound to what's actually in the database.
  const loadStateFundAllocation = useCallback(async (fyId) => {
    if (!fyId) {
      setAllocationState(emptyAllocationState());
      setInstituteSplit({});
      setAllocationLoadedAt(null);
      // ── NEW VALIDATION: keep the "no changes" snapshot in sync when no
      // financial year is selected (state is reset to empty).
      serverStateRef.current = serializeAllocationSnapshot(emptyAllocationState(), {});
      return;
    }

    try {
      setAllocationLoading(true);
      setAllocationError(null);

      const res = await agent.get(GetStateFundAllocation, { params: { FinancialYearID: fyId } });

      const records = extractAllocationRecords(res?.data);

      const { allocationState: mappedAllocationState, instituteSplit: mappedInstituteSplit } =
        mapAllocationRecordsToState(records);

      setAllocationState(mappedAllocationState);
      setInstituteSplit(mappedInstituteSplit);
      setAllocationLoadedAt(new Date().toISOString());

      // ── NEW VALIDATION: snapshot the just-loaded server state as the
      // baseline for the "no changes since last save" check.
      serverStateRef.current = serializeAllocationSnapshot(mappedAllocationState, mappedInstituteSplit);
    } catch (err) {
      setAllocationError(err?.response?.data?.Message || err?.message || "Failed to load state fund allocation");
      setAllocationState(emptyAllocationState());
      setInstituteSplit({});
      // ── NEW VALIDATION: keep the "no changes" snapshot consistent with
      // the reset state on a load failure.
      serverStateRef.current = serializeAllocationSnapshot(emptyAllocationState(), {});
    } finally {
      setAllocationLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStateFundAllocation(financialYearID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialYearID]);

  const gthsUsers = useMemo(
    () => (officeUsersBySection.A || []).filter((u) => String(u.label || "").toUpperCase().includes("TECHNICAL HIGH SCHOOL")),
    [officeUsersBySection]
  );

  // Fill in any rows that exist in the office-users list but were not
  // returned by GetStateFundAllocation (e.g. a brand-new office user with
  // no distribution saved yet), without touching values already loaded
  // from the server.
  useEffect(() => {
    setAllocationState((prev) => {
      const next = { ...prev };
      BUDGET_SECTIONS.forEach((sec) => {
        const dist = { ...next[sec.sectionCode].distributions };
        (officeUsersBySection[sec.sectionCode] || []).forEach((r) => {
          if (!(r.rowKey in dist)) dist[r.rowKey] = 0;
        });
        next[sec.sectionCode] = { ...next[sec.sectionCode], distributions: dist };
      });
      return next;
    });

    setInstituteSplit((prev) => {
      const next = { ...prev };
      gthsUsers.forEach((u) => {
        if (!(u.rowKey in next)) next[u.rowKey] = 0;
      });
      return next;
    });

    setOpenGroups((prev) => {
      const next = { ...prev };
      ["A", "B", "C"].forEach((secCode) => {
        const groups = groupRowsByType(officeUsersBySection[secCode] || []);
        if (!next[secCode]) next[secCode] = {};
        groups.forEach((g) => {
          if (!(g.groupKey in next[secCode])) next[secCode][g.groupKey] = true;
        });
      });

      // Section D ("State Fund") shows ALL office types merged from A/B/C,
      // so its group-open state needs building the same way.
      const allRowsForD = (() => {
        const map = new Map();
        BUDGET_SECTIONS.forEach((s) => {
          (officeUsersBySection[s.sectionCode] || []).forEach((u) => {
            if (!map.has(u.rowKey)) map.set(u.rowKey, u);
          });
        });
        return Array.from(map.values());
      })();
      const dGroups = groupRowsByType(allRowsForD);
      if (!next.D) next.D = {};
      dGroups.forEach((g) => {
        if (!(g.groupKey in next.D)) next.D[g.groupKey] = true;
      });

      return next;
    });
  }, [officeUsersBySection, gthsUsers]);

  const toggle = (code) => setOpenSections((p) => ({ ...p, [code]: !p[code] }));

  // ── Collapse All / Expand All (same pattern as DPDC) ──────────────────────
  const toggleCollapseAll = () => {
    const isAnyOpen = Object.values(openSections).some((v) => v);
    const next = {};
    ["A", "B", "C", "D"].forEach((code) => (next[code] = !isAnyOpen));
    setOpenSections(next);
  };

  const onTotalChange = (sectionCode, value) => setAllocationState((prev) => ({ ...prev, [sectionCode]: { ...prev[sectionCode], totalAllocation: value } }));
  const onDistChange = (sectionCode, rowKey, value) => setAllocationState((prev) => ({ ...prev, [sectionCode]: { ...prev[sectionCode], distributions: { ...prev[sectionCode].distributions, [rowKey]: value } } }));
  const onSplitChange = (rowKey, value) => setInstituteSplit((prev) => ({ ...prev, [rowKey]: value }));

  const gthsOfficeTotal = gthsUsers.reduce((a, u) => a + (allocationState.A.distributions[u.rowKey] || 0), 0);

  const grandAlloc = useMemo(() => Object.values(allocationState).reduce((a, s) => a + s.totalAllocation, 0), [allocationState]);
  const grandDist = useMemo(() => Object.values(allocationState).reduce((a, s) => a + Object.values(s.distributions).reduce((x, y) => x + y, 0), 0), [allocationState]);
  const grandBal = grandAlloc - grandDist;

  // A rowKey -> user lookup spanning every office list, so the payload
  // builder below can label ANY distribution entry correctly — including
  // ones typed in via the "State Fund" master table for a budget code that
  // user wasn't originally pre-listed under.
  const allUsersLookup = useMemo(() => {
    const map = {};
    BUDGET_SECTIONS.forEach((s) => {
      (officeUsersBySection[s.sectionCode] || []).forEach((u) => {
        if (!map[u.rowKey]) map[u.rowKey] = u;
      });
    });
    return map;
  }, [officeUsersBySection]);

  const buildSavePayload = () => {
    const data = [];
    const fyID = Number(financialYearID) || financialYearID;

    BUDGET_SECTIONS.forEach((sec) => {
      const secState = allocationState[sec.sectionCode];

      data.push({
        financialYearID: fyID,
        sectionCode: sec.sectionCode,
        budgetCode: sec.budgetCode,
        objectCode: sec.objectCode,
        allocationTypeID: 1,
        officeUserID: null,
        userTypeID: null,
        amount: secState.totalAllocation,
        remarks: "Total Allocation",
      });

      // Iterate every distribution entered for this section (not just the
      // ones from officeUsersBySection[sec.sectionCode]) so amounts typed
      // into the "State Fund" master table for any office/any budget code
      // are never silently dropped.
      Object.entries(secState.distributions || {}).forEach(([rowKey, amt]) => {
        if (amt > 0) {
          const user = allUsersLookup[rowKey];
          data.push({
            financialYearID: fyID,
            sectionCode: sec.sectionCode,
            budgetCode: sec.budgetCode,
            objectCode: sec.objectCode,
            allocationTypeID: 2,
            officeUserID: Number(rowKey) || rowKey,
            userTypeID: user?.userTypeId ?? null,
            amount: amt,
            remarks: "Distribution",
          });
        }
      });
    });

    const secA = BUDGET_SECTIONS[0];
    gthsUsers.forEach((u) => {
      const amt = instituteSplit[u.rowKey] || 0;
      if (amt > 0) {
        data.push({
          financialYearID: fyID,
          sectionCode: secA.sectionCode,
          budgetCode: secA.budgetCode,
          objectCode: secA.objectCode,
          allocationTypeID: 3,
          officeUserID: Number(u.rowKey) || u.rowKey,
          userTypeID: u.userTypeId ?? null,
          amount: amt,
          remarks: "GTHS Institute Split",
        });
      }
    });

    return data;
  };

  // ── NEW VALIDATION: validate() — mirrors the DPDC page's validate().
  // For every budget section, Total Distribution must never exceed Total
  // Allocation. Shows the same style of SweetAlert used on the DPDC page
  // (Section Name, Total Allocation, Total Distribution, Balance) and stops
  // Save on the first violation found. Does not alter allocationState,
  // buildSavePayload, or any existing per-cell validation.
  const validate = () => {
    for (const sec of BUDGET_SECTIONS) {
      const secState = allocationState[sec.sectionCode];
      if (!secState) continue;

      const ta = secState.totalAllocation || 0;
      const td = Object.values(secState.distributions || {}).reduce((a, b) => a + b, 0);

      if (td > ta) {
        Swal.fire({
          title: "Validation Error",
          html: `<div style="font-family:sans-serif;text-align:center;line-height:2">
            <b>[${sec.sectionCode}] ${sec.title}</b><br/>
            <p>Total Allocation = <b>₹ ${fmt(ta)}</b></p>
            <p>Total Distribution = <b>₹ ${fmt(td)}</b></p>
            <p>Balance = <b style="color:#dc2626">₹ ${fmt(ta - td)}</b></p>
            <p style="color:#d97706">Distribution exceeds allocation!</p>
          </div>`,
          icon: "error",
          confirmButtonColor: P.primary,
        });
        return false;
      }
    }
    return true;
  };

  // ── SAVE → RELOAD → REMAP → CONFIRM ────────────────────────────────────
  // 1) POST StateFund_SaveAllocation writes to TRN_StateFundAllocation.
  // 2) Immediately (awaited) GET StateFund_GetAllocation reads it back.
  // 3) Response is mapped into allocationState / instituteSplit, binding
  //    the grid to exactly what the database now holds.
  // 4) Only then is the "Saved" confirmation shown, so the user never sees
  //    a success message before the on-screen numbers are in sync with
  //    the server.
  const performSaveAllocation = async (payload) => {
    try {
      setSaving(true);

      // Step 1 — write
      const res = await agent.post(StateFundSaveAllocation, payload);

      // Step 2 & 3 — read back immediately and rebind the grid
      await loadStateFundAllocation(financialYearID);

      // Step 4 — confirm only after the grid reflects the saved data
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
      Swal.fire({
        title: "Allocation Saved",
        text: "State fund allocation has been saved successfully.",
        icon: "success",
        confirmButtonColor: P.primary,
      });
    } catch (err) {
      Swal.fire({
        title: "Save Failed",
        text: err?.response?.data?.Message || err?.message || "Could not save allocation. Please try again.",
        icon: "error",
        confirmButtonColor: P.primary,
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Triggered by the Save button — validates, then requires OTP ───────────
  const handleSaveAllocation = () => {
    if (!financialYearID) {
      Swal.fire({ title: "Select Financial Year", text: "Please select a financial year before saving.", icon: "warning", confirmButtonColor: P.primary });
      return;
    }

    if (!userMobile) {
      Swal.fire({
        title: "Mobile Number Missing",
        text: "Could not find a registered mobile number for OTP verification.",
        icon: "warning",
        confirmButtonColor: P.primary,
      });
      return;
    }

    // ── NEW VALIDATION: validate() must pass before Save proceeds ───────────
    if (!validate()) return;

    const data = buildSavePayload();

    // ── NEW VALIDATION: empty payload check ──────────────────────────────────
    if (data.length === 0) {
      Swal.fire({
        title: "No Data",
        text: "No data available to save.",
        icon: "warning",
        confirmButtonColor: P.primary,
      });
      return;
    }

    // ── NEW VALIDATION: "no changes since last save" check ──────────────────
    const currentSnapshot = serializeAllocationSnapshot(allocationState, instituteSplit);
    if (currentSnapshot === serverStateRef.current) {
      Swal.fire({
        title: "No Changes",
        text: "No data has been modified since last save.",
        icon: "info",
        confirmButtonColor: P.primary,
      });
      return;
    }

    const payload = { userID: loginID, data };
    pendingSaveRef.current = { payload };
    otpService.startVerification();
  };

  const anySectionOpen = Object.values(openSections).some((v) => v);

  return (
    <div className="sfa-root" style={{ minHeight: "100vh", background: P.bg, padding: "24px", paddingBottom: "24px", color: P.text, fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Gradient header — same pattern as DPDC banner + Collapse All button */}
      <div className="bg-gradient-to-r from-blue-600 to-white rounded-xl px-6 py-5 mb-5 shadow-lg shadow-blue-600/25">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="m-0 text-xl font-bold text-white">State Fund </p>
            <p className="m-0 mt-1 text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
              District: All &nbsp;·&nbsp; Financial Year: {fyLoading ? "Loading…" : selectedFinancialYear || "—"}
              {/* {userName ? <> &nbsp;·&nbsp; Logged in as: <b>{userName}</b></> : null} */}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <select
              value={financialYearID}
              disabled={fyLoading}
              onChange={(e) => {
                const sel = financialYearOptions.find((x) => String(x.value) === e.target.value);
                setFinancialYearID(e.target.value);
                setSelectedFinancialYear(sel?.label || "");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "rgba(255,255,255,0.95)",
                color: P.text,
                fontSize: 13,
                fontWeight: 600,
                cursor: fyLoading ? "not-allowed" : "pointer",
                minWidth: 180,
              }}
            >
              <option value="">Select Financial Year</option>
              {financialYearOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              onClick={toggleCollapseAll}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white border rounded-lg transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                borderColor: "#1D4ED8",
                color: "#FFFFFF",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{
                  transform: anySectionOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              {anySectionOpen ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>
      </div>

      {allocationLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
            padding: "8px 14px",
            borderRadius: 10,
            fontSize: 12,
            background: "#eff6ff",
            border: `1px solid #bfdbfe`,
            color: "#1d4ed8",
            flexWrap: "wrap",
          }}
        >
          <Loader2 size={14} style={{ animation: "sfa-spin 0.8s linear infinite" }} />
          <span>Loading saved allocation for {selectedFinancialYear || "the selected financial year"}…</span>
        </div>
      )}

      {!allocationLoading && allocationError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
            padding: "8px 14px",
            borderRadius: 10,
            fontSize: 12,
            background: P.dangerBg,
            border: `1px solid ${P.dangerBdr}`,
            color: P.danger,
            flexWrap: "wrap",
          }}
        >
          <Info size={14} />
          <span>Could not load saved allocation: {allocationError}</span>
        </div>
      )}

      <div className="sfa-stats" style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <StatCard label="Total Allocation" value={fmt(grandAlloc)} color={P.primary} />
        <StatCard label="Total Distributed" value={fmt(grandDist)} color={P.accent} />
        <StatCard label="Balance" value={fmt(Math.abs(grandBal))} color={grandBal < 0 ? P.danger : P.success} sub={grandBal < 0 ? "Over-allocated" : "Available"} />
      </div>

      {BUDGET_SECTIONS.map((sec, i) => (
        <BudgetSection
          key={sec.sectionCode}
          section={sec}
          index={i}
          rows={officeUsersBySection[sec.sectionCode] || []}
          data={allocationState[sec.sectionCode]}
          onTotalChange={onTotalChange}
          onDistChange={onDistChange}
          isOpen={openSections[sec.sectionCode]}
          onToggle={() => toggle(sec.sectionCode)}
          usersLoading={officeUsersLoading}
          openGroups={openGroups}
          setOpenGroups={setOpenGroups}
        />
      ))}

      <StateFundSummary
        officeUsersBySection={officeUsersBySection}
        allocationState={allocationState}
        isOpen={openSections.D}
        onToggle={() => toggle("D")}
        usersLoading={officeUsersLoading}
        openGroups={openGroups}
        setOpenGroups={setOpenGroups}
      />

      {/* UI-ONLY: floating up/down navigator, sits just above the fixed
          Save footer so users can jump around a long page without
          repeated manual scrolling. */}
      <FloatingScrollNav />

      {/* UI-ONLY: Save Allocation bar */}
      <div
  className="sfa-save-footer"
  style={{
    width: "100%",
    margin: "30px 0",
    padding: "20px 0",
    background: "#f8fafc",
    borderTop: `1px solid ${P.border}`,
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  }}
>
        <button
          onClick={handleSaveAllocation}
          disabled={saving}
          className="sfa-save-btn"
          style={{
            padding: "11px 32px",
            border: "none",
            borderRadius: 10,
            background: savedFlash
              ? `linear-gradient(135deg, ${P.success}, #22c55e)`
              : `linear-gradient(135deg, ${P.primaryDark}, ${P.primary})`,
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.85 : 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 14px rgba(26,86,219,0.35)",
            transition: "background .3s ease, transform .15s ease",
          }}
        >
          {saving ? (
            <>
              <Loader2 size={15} style={{ animation: "sfa-spin 0.8s linear infinite" }} /> Saving…
            </>
          ) : savedFlash ? (
            <>
              <CheckCircle2 size={15} /> Saved
            </>
          ) : (
            <>
              <Upload size={14} /> Save Allocation
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes sfa-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .sfa-root { padding: 14px !important; }
          .sfa-header { flex-direction: column; align-items: flex-start !important; padding: 16px !important; }
          .sfa-fy-select { width: 100%; min-width: 0 !important; }
          .sfa-stats { flex-direction: column; }
          .sfa-stat-card { flex: 1 1 auto !important; width: 100%; }
          .sfa-section-header { flex-direction: column; align-items: flex-start !important; }
          .sfa-section-header-right { width: 100%; justify-content: space-between !important; }
          .sfa-save-btn { width: 100%; justify-content: center; }
          .sfa-table-scroll { max-height: 360px; }
          .sfa-scroll-nav { right: 12px; bottom: 84px; }
        }

        @media (max-width: 480px) {
          .sfa-header > div:first-child > div:first-child { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
}