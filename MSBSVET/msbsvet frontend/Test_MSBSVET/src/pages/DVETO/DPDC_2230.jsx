import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import agent from "../../lib/api/agent";
import Swal from "sweetalert2";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import FormComponent from "../../Component/formcomponent/FormComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import {
  DVETOGetInstituteForDpdcFund,
  DVETO_GetFundAllocationData_2230,
  DVETO_SaveFundAllocationData_2230,
  DVETO_GetFundAllocationMasters_2230,
  GetHeadDocuments_2230,
  Save_HeadDocuments_2230,
} from "../../Endpoints_All/Base/DVETO";
import { GetCurrentFinancialYear } from "../../Endpoints_All/Base/Institute";
import { DVETOGetDvetoManagementTypeByDvetoID } from "../../Endpoints_All/Base/DVETO";
import OTPService from "../../Component/formcomponent/OTPService";
import { useAuth } from "../../Hooks/AuthContext";
import { getDeviceIP } from "../../utils/CommonHelper";
import UploadPdf from "../../Component/formcomponent/UploadPdf";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const parseNum = (v) => parseFloat(String(v).replace(/,/g, "")) || 0;
const pct = (num, den) =>
  den > 0 ? Math.min(100, Math.round((num / den) * 100)) : 0;

// ─── Formula map ──────────────────────────────────────────────────────────────
const FORMULA_MAP = {
  MET: ["A", "C", "B", "P", "W", "I"],
  TK: ["R"],
  LIB: ["Q"],
  CON: ["D", "Z", "J"],
  "Non-MET": ["X", "E", "Y", "K"],
  INVOCATION: ["F"],
};

// SectionID of the derived/formula section
const FORMULA_SECTION_ID = 4;

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  primary: "#1a56db",
  primaryDark: "#1e40af",
  accent: "#0ea5e9",
  teal: "#0d9488",
  violet: "#7c3aed",
  amber: "#d97706",
  rose: "#e11d48",
  success: "#16a34a",
  successBg: "#f0fdf4",
  successBdr: "#86efac",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  dangerBdr: "#fca5a5",
  warn: "#d97706",
  warnBg: "#fffbeb",
  warnBdr: "#fcd34d",
  surface: "#ffffff",
  surfaceAlt: "#f8fafc",
  bg: "#f1f5f9",
  border: "#e2e8f0",
  borderFocus: "#93c5fd",
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

// ─── Progress bar inside section header ──────────────────────────────────────
function SectionProgress({ alloc, dist }) {
  const p = pct(dist, alloc);
  const barColor = p < 40 ? P.danger : p < 80 ? P.warn : P.success;
  return (
    <div style={{ minWidth: "160px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: P.textMid,
          marginBottom: "4px",
        }}
      >
        <span style={{ fontWeight: 600 }}>₹{fmt(dist)} distributed</span>
        <span style={{ fontWeight: 700, color: barColor }}>{p}%</span>
      </div>
      <div
        style={{
          height: "6px",
          borderRadius: "99px",
          background: P.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "99px",
            width: `${p}%`,
            background:
              p < 40
                ? `linear-gradient(90deg, ${P.danger}, #f87171)`
                : p < 80
                  ? `linear-gradient(90deg, ${P.amber}, #fbbf24)`
                  : `linear-gradient(90deg, ${P.teal}, ${P.success})`,
            transition: "width 0.7s ease",
          }}
        />
      </div>
      <div style={{ fontSize: "10px", color: P.textMuted, marginTop: "3px" }}>
        of ₹{fmt(alloc)} allocated
      </div>
    </div>
  );
}

// ─── Balance pill ─────────────────────────────────────────────────────────────
function BalPill({ value }) {
  const neg = value < 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700",
        background: neg ? P.dangerBg : P.successBg,
        color: neg ? P.danger : P.success,
        border: `1px solid ${neg ? P.dangerBdr : P.successBdr}`,
      }}
    >
      {neg ? "▼" : "▲"} ₹{fmt(Math.abs(value))}
    </span>
  );
}

// ─── Grand summary stat card ──────────────────────────────────────────────────
function StatCard({ label, value, color, sub, showSymbol = true }) {
  return (
    <div
      style={{
        flex: "1 1 150px",
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: "12px",
        padding: "14px 18px",
        borderTop: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "600",
          color: P.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "18px", fontWeight: "800", color: P.text }}>
        {" "}
        {showSymbol ? "₹" : ""}
        {value}
      </div>
      {sub !== undefined && (
        <div style={{ fontSize: "11px", color: P.textMuted, marginTop: "4px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Build table rows/columns for a section ───────────────────────────────────
function buildTableData({
  section,
  sections,
  heads,
  institutes,
  allocationState,
  onTotalAllocationChange,
  onAmountChange,
  readOnly,
  headDocuments = [],
}) {
  const isFormulaSection = section.SectionID === FORMULA_SECTION_ID;
  const sectionData = allocationState[section.SectionCode] || {};

  const getHeadAlloc = (hc) => {
    if (isFormulaSection) {
      const sourceHeadCodes = FORMULA_MAP[hc] || [];
      let derivedAlloc = 0;
      sections?.forEach((sec) => {
        if (sec.SectionID === FORMULA_SECTION_ID) return;
        sourceHeadCodes.forEach((shc) => {
          derivedAlloc +=
            allocationState[sec.SectionCode]?.[shc]?.totalAllocation || 0;
        });
      });
      return derivedAlloc;
    }
    return sectionData[hc]?.totalAllocation || 0;
  };

  //const getTotalDist = (hc) =>
  //    Object.values(sectionData[hc]?.distributions || {}).reduce((a, b) => a + b, 0);

  const getInstDist = (hc, instID) => {
    if (isFormulaSection) {
      const sourceHeadCodes = FORMULA_MAP[hc] || [];
      let derivedDist = 0;
      sections?.forEach((sec) => {
        if (sec.SectionID === FORMULA_SECTION_ID) return;
        sourceHeadCodes.forEach((shc) => {
          derivedDist +=
            allocationState[sec.SectionCode]?.[shc]?.distributions?.[instID] ||
            0;
        });
      });
      return derivedDist;
    }
    return sectionData[hc]?.distributions?.[instID] || 0;
  };
  const getTotalDist = (hc) => {
    if (isFormulaSection) {
      return institutes.reduce(
        (acc, inst) => acc + getInstDist(hc, inst.InstituteID),
        0,
      );
    }
    return Object.values(sectionData[hc]?.distributions || {}).reduce(
      (a, b) => a + b,
      0,
    );
  };
  // Balance is simply allocation minus distribution
  const getBalance = (hc) => getHeadAlloc(hc) - getTotalDist(hc);

  const columns = [
    {
      key: "sn",
      header: "SN",
      width: "44px",
      render: (row) => (
        <span style={{ color: P.textMuted, fontSize: "12px" }}>{row.sn}</span>
      ),
    },
    {
      key: "name",
      header: "Institute / Office",
      render: (row) => (
        <span
          style={{
            fontWeight: row.isSpecial ? "700" : "500",
            color: row.isSpecial ? P.primaryDark : P.text,
            fontSize: "13px",
          }}
        >
          {row.name}
        </span>
      ),
    },
    ...heads.map((h) => ({
      key: h.HeadCode,

      header: (() => {
        const doc = headDocuments.find(
          (d) => d.SectionID === section.SectionID && d.HeadCode === h.HeadCode,
        );

        return (
          <div
            style={{
              textAlign: "center",
              lineHeight: "1.5",
              cursor: doc ? "pointer" : "default",
            }}
            onClick={() => {
              if (doc?.DocumentUrl) {
                const popupWidth = 1000;
                const popupHeight = 800;

                const left = (window.screen.width - popupWidth) / 2;

                const top = (window.screen.height - popupHeight) / 2;

                window.open(
                  doc.DocumentUrl,
                  "HeadDocument",
                  `width=${popupWidth},
                             height=${popupHeight},
                             left=${left},
                             top=${top},
                             resizable=yes,
                             scrollbars=yes`,
                );
              }
            }}
          >
            <div
              style={{
                fontWeight: "700",
                color: "#ffffff",
                fontSize: "12px",
                textDecoration: doc ? "underline" : "none",
              }}
            >
              {h.HeadName}
            </div>
          </div>
        );
      })(),

      render: (row) => row[h.HeadCode],
    })),
    ,
    {
      key: "total",
      header: "Total",
      width: "120px",
      render: (row) => row.total,
    },
  ];

  const rows = [];

  // ── Total Allocation row ──────────────────────────────────────────────────
  const taRowTotal = heads.reduce((a, h) => a + getHeadAlloc(h.HeadCode), 0);
  const taRow = {
    sn: "",
    name: "Total Allocation",
    isSpecial: true,
    rowType: "allocation",
    total: (
      <span style={{ fontWeight: "800", color: P.primary, fontSize: "13px" }}>
        ₹{fmt(taRowTotal)}
      </span>
    ),
  };
  heads.forEach((h) => {
    if (isFormulaSection) {
      taRow[h.HeadCode] = (
        <span
          style={{ fontWeight: "700", color: P.primaryDark, fontSize: "13px" }}
        >
          ₹{fmt(getHeadAlloc(h.HeadCode))}
        </span>
      );
    } else {
      taRow[h.HeadCode] = (
        <FormComponent
          label=""
          type="text"
          inputMode="numeric"
          value={String(sectionData[h.HeadCode]?.totalAllocation || "")}
          onChange={(value) => {
            const v = parseNum(value);
            const totalDist = getTotalDist(h.HeadCode);
            if (v < totalDist) {
              Swal.fire({
                title: "Invalid Total Allocation",
                html: `<div style="font-family:sans-serif;text-align:center;line-height:1.8">
                                    <p>Total Distribution entered = <b>₹ ${fmt(totalDist)}</b></p>
                                    <p>New Allocation = <b style="color:#dc2626">₹ ${fmt(v)}</b></p>
                                    <p style="color:#d97706;font-size:13px">Allocation cannot be less than already distributed amount.</p>
                                </div>`,
                icon: "warning",
                confirmButtonColor: P.primary,
                confirmButtonText: "OK",
              });
              return;
            }
            onTotalAllocationChange(section.SectionCode, h.HeadCode, v);
          }}
          placeholder="0"
          min="0"
          disabled={readOnly}
          extraClass="!mb-0"
        />
      );
    }
  });
  rows.push(taRow);

  // ── Institute rows ────────────────────────────────────────────────────────
  institutes.forEach((inst, idx) => {
    //const rowTotal = heads.reduce((a, h) => a + (sectionData[h.HeadCode]?.distributions?.[inst.InstituteID] || 0), 0);
    const rowTotal = heads.reduce(
      (a, h) => a + getInstDist(h.HeadCode, inst.InstituteID),
      0,
    );
    const row = {
      sn: idx + 1,
      name: inst.InstituteName,
      isSpecial: false,
      rowType: "institute",
      total: (
        <span style={{ fontWeight: "600", color: P.primary, fontSize: "13px" }}>
          ₹{fmt(rowTotal)}
        </span>
      ),
    };
    heads.forEach((h) => {
      //const currVal = sectionData[h.HeadCode]?.distributions?.[inst.InstituteID] || 0;
      //row[h.HeadCode] = (
      //    <FormComponent
      //        label="" type="text" inputMode="numeric"
      //        value={String(currVal || "")}
      //        onChange={(value) => {
      //            const v = parseNum(value);
      //            const otherDist = getTotalDist(h.HeadCode) - currVal;
      //            const ta = getHeadAlloc(h.HeadCode);
      //            if (v > ta - otherDist) {
      //                const remBalance = ta - otherDist;
      //                Swal.fire({
      //                    title: "Allocation Exceeded",
      //                    html: `<div style="font-family:sans-serif;text-align:center;line-height:1.8">
      //                        <p>Total Allocation = <b>₹ ${fmt(ta)}</b></p>
      //                        <p>Already Distributed = <b>₹ ${fmt(otherDist)}</b></p>
      //                        <p>Available Balance = <b style="color:${remBalance >= 0 ? "#16a34a" : "#dc2626"}">₹ ${fmt(remBalance)}</b></p>
      //                        <p style="color:#d97706;font-size:13px">Amount must not exceed available balance.</p>
      //                    </div>`,
      //                    icon: "warning", confirmButtonColor: P.primary, confirmButtonText: "OK",
      //                });
      //                return;
      //            }
      //            onAmountChange(section.SectionCode, h.HeadCode, inst.InstituteID, v);
      //        }}
      //        placeholder="0" min="0" disabled={readOnly} extraClass="!mb-0"
      //    />
      //);
      const currVal = getInstDist(h.HeadCode, inst.InstituteID);

      row[h.HeadCode] = (
        <FormComponent
          label=""
          type="text"
          inputMode="numeric"
          value={String(currVal || "")}
          onChange={(value) => {
            // Don't allow editing in formula sections
            if (isFormulaSection) return;

            const v = parseNum(value);
            const otherDist = getTotalDist(h.HeadCode) - currVal;
            const ta = getHeadAlloc(h.HeadCode);

            if (v > ta - otherDist) {
              const remBalance = ta - otherDist;

              Swal.fire({
                title: "Allocation Exceeded",
                html: `<div style="font-family:sans-serif;text-align:center;line-height:1.8">
                        <p>Total Allocation = <b>₹ ${fmt(ta)}</b></p>
                        <p>Already Distributed = <b>₹ ${fmt(otherDist)}</b></p>
                        <p>Available Balance = <b style="color:${remBalance >= 0 ? "#16a34a" : "#dc2626"}">
                            ₹ ${fmt(remBalance)}
                        </b></p>
                        <p style="color:#d97706;font-size:13px">
                            Amount must not exceed available balance.
                        </p>
                    </div>`,
                icon: "warning",
                confirmButtonColor: P.primary,
                confirmButtonText: "OK",
              });

              return;
            }

            onAmountChange(
              section.SectionCode,
              h.HeadCode,
              inst.InstituteID,
              v,
            );
          }}
          placeholder="0"
          min="0"
          disabled={readOnly || isFormulaSection}
          extraClass="!mb-0"
        />
      );
    });
    rows.push(row);
  });

  // ── Total Distribution row ────────────────────────────────────────────────
  const tdRowTotal = heads.reduce((a, h) => a + getTotalDist(h.HeadCode), 0);
  const tdRow = {
    sn: "",
    name: "Total Distribution",
    isSpecial: true,
    rowType: "distribution",
    total: (
      <span style={{ fontWeight: "800", color: P.accent, fontSize: "13px" }}>
        ₹{fmt(tdRowTotal)}
      </span>
    ),
  };
  heads.forEach((h) => {
    tdRow[h.HeadCode] = (
      <span style={{ fontWeight: "700", color: P.accent, fontSize: "13px" }}>
        ₹{fmt(getTotalDist(h.HeadCode))}
      </span>
    );
  });
  rows.push(tdRow);

  // ── Balance row ───────────────────────────────────────────────────────────
  const grandBal = taRowTotal - tdRowTotal;
  const balRow = {
    sn: "",
    name: "Balance",
    isSpecial: true,
    rowType: "balance",
    total: <BalPill value={grandBal} />,
  };
  heads.forEach((h) => {
    balRow[h.HeadCode] = <BalPill value={getBalance(h.HeadCode)} />;
  });
  rows.push(balRow);

  return { columns, rows };
}

function getRowStyle(row) {
  if (!row) return {};
  switch (row.rowType) {
    case "allocation":
      return { background: P.alloc, fontWeight: "600" };
    case "distribution":
      return { background: P.dist, fontWeight: "600" };
    case "balance":
      return { background: P.bal };
    default:
      return {};
  }
}

// ─── Section block (collapsible) ─────────────────────────────────────────────
function SectionBlock({
  section,
  sections,
  heads,
  institutes,
  allocationState,
  onTotalAllocationChange,
  onAmountChange,
  readOnly,
  index,
  isOpen,
  onToggle,
  onUploadClick,
  documents = [],
  userTypeID,
}) {
  const clr = SECTION_ACCENTS[index % SECTION_ACCENTS.length];
  const { columns, rows } = buildTableData({
    section,
    sections,
    heads,
    institutes,
    allocationState,
    onTotalAllocationChange,
    onAmountChange,
    readOnly,
    headDocuments: documents,
  });

  const isFormulaSection = section.SectionID === FORMULA_SECTION_ID;
  const sectionData = allocationState[section.SectionCode] || {};

  let totalAlloc = 0;
  if (isFormulaSection) {
    heads.forEach((h) => {
      const sourceHeadCodes = FORMULA_MAP[h.HeadCode] || [];
      sections?.forEach((sec) => {
        if (sec.SectionID === FORMULA_SECTION_ID) return;
        sourceHeadCodes.forEach((shc) => {
          totalAlloc +=
            allocationState[sec.SectionCode]?.[shc]?.totalAllocation || 0;
        });
      });
    });
  } else {
    totalAlloc = heads.reduce(
      (a, h) => a + (sectionData[h.HeadCode]?.totalAllocation || 0),
      0,
    );
  }

  //const totalDist = heads.reduce((a, h) =>
  //    a + Object.values(sectionData[h.HeadCode]?.distributions || {}).reduce((x, y) => x + y, 0), 0);
  //const balance = totalAlloc - totalDist;
  let totalDist = 0;
  if (isFormulaSection) {
    heads.forEach((h) => {
      const sourceHeadCodes = FORMULA_MAP[h.HeadCode] || [];
      sections?.forEach((sec) => {
        if (sec.SectionID === FORMULA_SECTION_ID) return;
        sourceHeadCodes.forEach((shc) => {
          totalDist += Object.values(
            allocationState[sec.SectionCode]?.[shc]?.distributions || {},
          ).reduce((x, y) => x + y, 0);
        });
      });
    });
  } else {
    totalDist = heads.reduce(
      (a, h) =>
        a +
        Object.values(sectionData[h.HeadCode]?.distributions || {}).reduce(
          (x, y) => x + y,
          0,
        ),
      0,
    );
  }

  const balance = totalAlloc - totalDist;

  return (
    <div
      style={{
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: "14px",
        marginBottom: "20px",
        overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.10)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)")
      }
    >
      <div style={{ height: "4px", background: clr.strip }} />

      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: clr.light,
          border: "none",
          borderBottom: isOpen ? `1px solid ${P.border}` : "none",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "800",
                color: clr.text,
                fontFamily: "'DM Sans','Segoe UI',sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {section.SectionName}
              {isFormulaSection && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: "#ccfbf1",
                    color: "#115e59",
                    border: "1px solid #5eead4",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Auto-calculated
                </span>
              )}
            </div>
            <div
              style={{ fontSize: "11px", color: P.textMuted, marginTop: "2px" }}
            >
              {heads.length} head{heads.length !== 1 ? "s" : ""} ·{" "}
              {institutes.length} institutes
            </div>
          </div>
          {readOnly && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "12px",
                background: P.warnBg,
                color: P.warn,
                border: `1px solid ${P.warnBdr}`,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              View Only
            </span>
          )}
        </div>

        {/* Right Side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {userTypeID === 14 &&
            [
              "District General",
              "Schedule Caste Program",
              "Schedule Tribe Program",
              "District Mining Fund",
            ].includes(section.SectionName) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUploadClick(section);
                  }}
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#2563eb",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  Upload PDF
                </button>
              </div>
            )}

          <SectionProgress alloc={totalAlloc} dist={totalDist} />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "2px",
              minWidth: "90px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: P.textMid,
              }}
            >
              Balance
            </span>

            <BalPill value={balance} />
          </div>

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={clr.text}
            strokeWidth="2"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s",
              flexShrink: 0,
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <FilteredTableComponent
          data={rows}
          columns={columns}
          searchable={false}
          sortable={false}
          showSearch={false}
          showExport={false}
          exportable={false}
          stickyHeader={true}
          maxHeight="560px"
          rowStyle={getRowStyle}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FundAllocation2230() {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading } = useLoading();
  const { userInfo } = useAuth();
  const loginID = userInfo?.UserID;
  const instType = "GITI";
  const InstituteCode =
    userInfo?.UserTypeID === 61 ? userInfo?.UserLoginID : null;
  const isReadOnly = userInfo?.UserTypeID === 61;

  const [loading, setLoading] = useState(false);
  const [districtName, setDistrictName] = useState("");
  const [districtID, setDistrictID] = useState("");
  const [financialYearOptions, setFinancialYearOptions] = useState([]);
  const [financialYearID, setFinancialYearID] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [userMobile, setUserMobile] = useState("");

  const [sections, setSections] = useState([]);
  const [heads, setHeads] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [allocationState, setAllocationState] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedUploadSection, setSelectedUploadSection] = useState(null);
  const [selectedHead, setSelectedHead] = useState(null);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");
  const [headPopupOpen, setHeadPopupOpen] = useState(false);
  const [selectedSectionForUpload, setSelectedSectionForUpload] =
    useState(null);
  const [selectedHeadCode, setSelectedHeadCode] = useState("");
  const [headError, setHeadError] = useState(false);
  const [headDocuments, setHeadDocuments] = useState([]);
  const uploadBtnRef = useRef(null);
  const pendingSaveRef = useRef(null);

  // ✅ Snapshot of last server state — used for diff on save
  const serverStateRef = useRef({});

  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
    } catch (err) {
      console.error(err);
    }
  };

  // ── OTP ───────────────────────────────────────────────────────────────────
  const otpService = OTPService({
    mobileNo: userMobile,
    purpose: "SubmitDPDCFundByDveto",
    isVerifyRequired: true,
    messege:
      "OTP verification required by District Vocational Education and Training Officer",
    isDuplicateCheck: false,
    onSuccess: async () => {
      const pending = pendingSaveRef.current;
      if (pending) {
        pendingSaveRef.current = null;
        await performSave(pending.payload);
      }
    },
    onError: (error) => {
      pendingSaveRef.current = null;
      Swal.fire({
        title: "Verification Failed",
        text: error.message || "OTP failed.",
        icon: "error",
      });
    },
    onCancel: () => {
      pendingSaveRef.current = null;
    },
  });

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadFinancialYears = useCallback(async () => {
    try {
      const res = await agent.get(GetCurrentFinancialYear);
      const data = res.data?.Data || [];
      const options = data.map((item) => ({
        value: item.YearId,
        label: item.YearDisplayName,
      }));
      setFinancialYearOptions(options);
      const cur = data.find((x) => x.isCurrent);
      if (cur) {
        setFinancialYearID(cur.YearId);
        setSelectedFinancialYear(cur.YearDisplayName);
      }
    } catch (err) {}
  }, []);

  const fetchUserMobile = useCallback(async () => {
    if (!loginID) return;
    try {
      const res = await agent.get(
        `${DVETOGetDvetoManagementTypeByDvetoID}/${loginID}/6`,
      );
      const data = res?.data;
      setUserMobile(
        data?.Status === "Success" && data?.Data?.length > 0
          ? String(data.Data[0]?.MobileNo || "")
          : "",
      );
    } catch (err) {}
  }, [loginID]);

  const loadInstitutes = useCallback(async () => {
    if (!loginID) return;
    try {
      const res = await agent.get(
        `${DVETOGetInstituteForDpdcFund}/${loginID}/${instType}/${InstituteCode}`,
      );
      const data = res?.data?.Data || [];
      setDistrictName(data[0]?.District || "");
      setDistrictID(data[0]?.CollegeDistrictID || "");
      setInstitutes(
        data.map((d) => ({
          InstituteID: d.InstituteID || d.CollegeID,
          InstituteName: d.InstituteName || d.CollegeName,
        })),
      );
    } catch (err) {}
  }, [loginID, instType, InstituteCode]);

  const loadMasters = useCallback(async () => {
    try {
      const res = await agent.get(DVETO_GetFundAllocationMasters_2230);
      const raw = res?.data?.Data || {};
      const sec = raw?.Table || [];
      const hds = raw?.Table1 || [];

      setSections(sec);
      setHeads(hds);

      const init = {};
      const expInit = {};
      sec.forEach((section) => {
        init[section.SectionCode] = {};
        expInit[section.SectionCode] = true;
        hds
          .filter((h) => h.SectionID === section.SectionID)
          .forEach((h) => {
            init[section.SectionCode][h.HeadCode] = {
              totalAllocation: 0,
              distributions: {},
            };
          });
      });
      setAllocationState(init);
      setExpandedSections(expInit);
    } catch (err) {}
  }, []);

  // ✅ loadAllocationData — builds state AND snapshots serverStateRef
  const loadAllocationData = useCallback(async () => {
    if (!districtID || !financialYearID || sections.length === 0) return;
    try {
      setLoading(true);
      const res = await agent.get(
        `${DVETO_GetFundAllocationData_2230}?FinancialYearID=${financialYearID}&DistrictID=${districtID}&InstituteCode=${InstituteCode}`,
      );
      const allocations = res?.data?.Data?.Table || [];
      const distributions = res?.data?.Data?.Table1 || [];

      setAllocationState((prev) => {
        const next = JSON.parse(JSON.stringify(prev));

        allocations.forEach((row) => {
          const { SectionCode: sc, HeadCode: hc } = row;
          if (next?.[sc]?.[hc]) {
            next[sc][hc].totalAllocation = Number(row.TotalAllocation || 0);
            next[sc][hc].totalDistributed = Number(row.TotalDistributed || 0);
            next[sc][hc].balanceAmount = Number(row.BalanceAmount || 0);
          }
        });

        distributions.forEach((row) => {
          const { SectionCode: sc, HeadCode: hc, CollegeID } = row;
          if (next?.[sc]?.[hc])
            next[sc][hc].distributions[CollegeID] = Number(
              row.DistributedAmount || 0,
            );
        });

        // ✅ Freeze a deep copy as the server baseline for diff
        serverStateRef.current = JSON.parse(JSON.stringify(next));

        return next;
      });
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [districtID, financialYearID, sections, InstituteCode]);
  const loadHeadDocuments = async () => {
    try {
      const res = await agent.get(
        `${GetHeadDocuments_2230}?OfficeID=${districtID}&FinancialYearID=${financialYearID}`,
      );

      setHeadDocuments(res.data.Data.Table || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getSectionDocuments = (sectionId) => {
    return headDocuments.filter((x) => x.SectionID === sectionId);
  };

  const handleUploadClick = (section) => {
    setSelectedSectionForUpload(section);
    setSelectedHeadCode("");
    setHeadPopupOpen(true);
  };
  const handleHeadDocumentUpload = async (fileData) => {
    try {
      const payload = {
        officeID: districtID,
        sectionID: selectedUploadSection?.SectionID,
        headCode: selectedHead?.HeadCode,
        headName: selectedHead?.HeadName,
        documentUrl:
          fileData?.filePath || fileData?.FilePath || fileData?.url || "",
        isMandatory: true,
        isActive: true,
        createdBy: userInfo?.UserLoginID,
        createdIPByAddress: ipAddress,
        financialYearID,
      };

      const response = await agent.put(Save_HeadDocuments_2230, payload);

      await loadHeadDocuments();

      Swal.fire("Success", "Document uploaded successfully", "success");
    } catch (err) {
      console.error("Upload Error:", err);

      Swal.fire("Error", err?.message || "Failed to save document", "error");
    }
  };

  useEffect(() => {
    loadFinancialYears();
    fetchIP();
    fetchUserMobile();
    loadInstitutes();
    loadMasters();
  }, []);

  useEffect(() => {
    if (districtID && financialYearID && sections.length > 0) {
      loadHeadDocuments();
      loadAllocationData();
    }
  }, [districtID, financialYearID, sections]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTotalAllocationChange = useCallback(
    (sectionCode, headCode, value) => {
      setAllocationState((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        if (next[sectionCode]?.[headCode] !== undefined)
          next[sectionCode][headCode].totalAllocation = value;
        return next;
      });
    },
    [],
  );

  const handleAmountChange = useCallback(
    (sectionCode, headCode, instituteID, value) => {
      setAllocationState((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        if (next[sectionCode]?.[headCode] !== undefined)
          next[sectionCode][headCode].distributions[instituteID] = value;
        return next;
      });
    },
    [],
  );

  const toggleCollapseAll = () => {
    const isAnyOpen = Object.values(expandedSections).some((v) => v);
    const next = {};
    sections.forEach((s) => (next[s.SectionCode] = !isAnyOpen));
    setExpandedSections(next);
  };

  // ── Build payload — DIFF only (changed rows) ──────────────────────────────
  const buildPayload = () => {
    const data = [];
    const server = serverStateRef.current;

    sections
      .filter((s) => s.SectionID !== FORMULA_SECTION_ID)
      .forEach((section) => {
        heads
          .filter((h) => h.SectionID === section.SectionID)
          .forEach((h) => {
            const entry = allocationState[section.SectionCode]?.[h.HeadCode];
            const prev = server[section.SectionCode]?.[h.HeadCode];
            if (!entry) return;

            const currentTA = entry.totalAllocation || 0;
            const prevTA = prev?.totalAllocation || 0;

            // ✅ Total Allocation — only if value changed
            if (currentTA !== prevTA) {
              data.push({
                financialYearID: Number(financialYearID),
                districtID: Number(districtID),
                sectionCode: section.SectionCode,
                headCode: h.HeadCode,
                allocationTypeCode: "TOTAL_ALLOCATION",
                instituteID: null,
                amount: currentTA,
                remarks: "Total Allocation",
              });
            }

            // ✅ Distribution per institute — only if value changed
            institutes.forEach((inst) => {
              const currentAmt = entry.distributions?.[inst.InstituteID] || 0;
              const prevAmt = prev?.distributions?.[inst.InstituteID] || 0;

              if (currentAmt !== prevAmt) {
                data.push({
                  financialYearID: Number(financialYearID),
                  districtID: Number(districtID),
                  sectionCode: section.SectionCode,
                  headCode: h.HeadCode,
                  allocationTypeCode: "DISTRIBUTION",
                  instituteID: inst.InstituteID,
                  amount: currentAmt,
                  remarks: "Institute Allocation",
                });
              }
            });
          });
      });

    return { userID: loginID, data };
  };

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    for (const section of sections.filter(
      (s) => s.SectionID !== FORMULA_SECTION_ID,
    )) {
      for (const h of heads.filter((x) => x.SectionID === section.SectionID)) {
        const entry = allocationState[section.SectionCode]?.[h.HeadCode];
        if (!entry) continue;
        const ta = entry.totalAllocation || 0;
        const td = Object.values(entry.distributions || {}).reduce(
          (a, b) => a + b,
          0,
        );
        if (td > ta) {
          Swal.fire({
            title: "Validation Error",
            html: `<div style="font-family:sans-serif;text-align:center;line-height:2">
                            <b>[${section.SectionCode}] ${h.HeadName}</b><br/>
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
    }
    return true;
  };

  // ── performSave — re-snapshots after success ───────────────────────────────
  const performSave = async (payload) => {
    try {
      startLoading();
      const res = await agent.post(DVETO_SaveFundAllocationData_2230, payload);
      if (res?.data?.Status === "Success" || res?.data?.status === 200) {
        Swal.fire({
          title: "Saved Successfully",
          text: "Fund allocation data has been saved.",
          icon: "success",
          confirmButtonColor: P.primary,
        });
        // ✅ Reload + re-snapshot so next save diff is clean
        await loadAllocationData();
      } else {
        throw new Error(res?.data?.Message || "Save failed");
      }
    } catch (err) {
      Swal.fire({
        title: "Save Failed",
        text: err.message || "An error occurred.",
        icon: "error",
        confirmButtonColor: P.primary,
      });
    } finally {
      stopLoading();
    }
  };

  // ── handleSave — guards empty diff ────────────────────────────────────────
  const handleSave = () => {
    if (!financialYearID || !districtID) {
      Swal.fire({
        title: "Incomplete",
        text: "Please select a Financial Year.",
        icon: "warning",
        confirmButtonColor: P.primary,
      });
      return;
    }
    if (!validate()) return;

    const payload = buildPayload();

    // ✅ Nothing changed — skip OTP + API entirely
    if (payload.data.length === 0) {
      Swal.fire({
        title: "No Changes",
        text: "No data has been modified since last save.",
        icon: "info",
        confirmButtonColor: P.primary,
      });
      return;
    }

    pendingSaveRef.current = { payload };
    otpService.startVerification();
  };

  const handleReset = () => {
    Swal.fire({
      title: "Reset Data?",
      text: "All unsaved changes will be discarded.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: P.primary,
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, reset",
    }).then((r) => {
      if (r.isConfirmed) loadAllocationData();
    });
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const regularSections = useMemo(
    () => sections.filter((s) => s.SectionID !== FORMULA_SECTION_ID),
    [sections],
  );

  const grandAlloc = regularSections.reduce(
    (sa, sec) =>
      sa +
      heads
        .filter((h) => h.SectionID === sec.SectionID)
        .reduce(
          (ha, h) =>
            ha +
            (allocationState[sec.SectionCode]?.[h.HeadCode]?.totalAllocation ||
              0),
          0,
        ),
    0,
  );

  const grandDist = regularSections.reduce(
    (sa, sec) =>
      sa +
      heads
        .filter((h) => h.SectionID === sec.SectionID)
        .reduce(
          (ha, h) =>
            ha +
            Object.values(
              allocationState[sec.SectionCode]?.[h.HeadCode]?.distributions ||
                {},
            ).reduce((x, y) => x + y, 0),
          0,
        ),
    0,
  );

  const grandBal = grandAlloc - grandDist;
  const grandPct = pct(grandDist, grandAlloc);
  const uploadHeadOptions = selectedSectionForUpload
    ? heads
        .filter((h) => h.SectionID === selectedSectionForUpload.SectionID)
        .map((h) => ({
          value: h.HeadCode,
          label: h.HeadName,
        }))
    : [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: P.bg,
        padding: "28px 24px",
        color: P.text,
      }}
    >
      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(241,245,249,0.80)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(3px)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                border: `3px solid ${P.border}`,
                borderTop: `3px solid ${P.primary}`,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 14px",
              }}
            />
            <p
              style={{
                fontSize: "13px",
                color: P.textMid,
                margin: 0,
                fontWeight: "600",
              }}
            >
              Loading data…
            </p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="bg-gradient-to-r from-blue-600 to-white rounded-xl px-6 py-5 mb-5 shadow-lg shadow-blue-600/25">
        <div className="flex items-center justify-between">
          <p className="m-0 text-xl font-bold text-white">
            Major Head 2230 Labour and Employment (GITI)
          </p>
          {sections.length > 0 && (
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
                  transform: Object.values(expandedSections).some((v) => v)
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              {Object.values(expandedSections).some((v) => v)
                ? "Collapse All"
                : "Expand All"}
            </button>
          )}
        </div>
      </div>

      {/* Filter + Grand Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "16px",
          marginBottom: "20px",
          animation: "fadeIn 0.5s ease 0.05s both",
        }}
      >
        {/* Filter card */}
        <div
          style={{
            background: P.surface,
            border: `1px solid ${P.border}`,
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <h3
            style={{
              margin: "0 0 14px",
              fontSize: "11px",
              fontWeight: "700",
              color: P.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Filters
          </h3>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "12px",
                fontWeight: "600",
                color: P.textMid,
              }}
            >
              District
            </label>
            <input
              type="text"
              value={districtName}
              disabled
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${P.border}`,
                borderRadius: "8px",
                background: P.surfaceAlt,
                color: P.text,
                fontSize: "15px",
                cursor: "not-allowed",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "12px",
                fontWeight: "600",
                color: P.textMid,
              }}
            >
              Financial Year <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={financialYearID}
              onChange={(e) => {
                const sel = financialYearOptions.find(
                  (x) => String(x.value) === e.target.value,
                );
                setFinancialYearID(e.target.value);
                setSelectedFinancialYear(sel?.label || "");
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${P.border}`,
                borderRadius: "8px",
                background: P.surface,
                color: P.text,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <option value="">Select Financial Year</option>
              {financialYearOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grand summary */}
        {sections.length > 0 && (
          <div
            style={{
              background: P.surface,
              border: `1px solid ${P.border}`,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: "11px",
                fontWeight: "700",
                color: P.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Grand Summary
            </h3>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              <StatCard
                label="Total Allocation"
                value={fmt(grandAlloc)}
                color={P.primary}
              />
              <StatCard
                label="Total Distributed"
                value={fmt(grandDist)}
                color={P.accent}
              />
              <StatCard
                label="Balance"
                value={fmt(Math.abs(grandBal))}
                color={grandBal < 0 ? P.danger : P.success}
                sub={grandBal < 0 ? "Over-allocated" : "Available"}
              />
              <StatCard
                label="Institutes"
                value={institutes.length}
                color={P.violet}
                showSymbol={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {sections.length === 0 && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: P.surface,
            border: `1px solid ${P.border}`,
            borderRadius: "14px",
            color: P.textMuted,
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={P.textMuted}
            strokeWidth="1.5"
            style={{ marginBottom: "12px" }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ margin: 0, fontSize: "14px" }}>
            No sections loaded. Please check master API configuration.
          </p>
        </div>
      )}

      {/* All Sections */}
      <div style={{ animation: "fadeIn 0.5s ease 0.1s both" }}>
        {sections.map((section, idx) => {
          const sectionHeads = heads.filter(
            (h) => h.SectionID === section.SectionID,
          );
          if (sectionHeads.length === 0) return null;
          return (
            <SectionBlock
              key={section.SectionCode}
              section={section}
              sections={sections}
              heads={sectionHeads}
              institutes={institutes}
              allocationState={allocationState}
              onTotalAllocationChange={handleTotalAllocationChange}
              onAmountChange={handleAmountChange}
              readOnly={
                !districtID ||
                !financialYearID ||
                isReadOnly ||
                section.SectionCode === "D"
              }
              index={idx}
              isOpen={!!expandedSections[section.SectionCode]}
              onToggle={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  [section.SectionCode]: !prev[section.SectionCode],
                }))
              }
              onUploadClick={handleUploadClick}
              documents={getSectionDocuments(section.SectionID)}
              userTypeID={userInfo?.UserTypeID}
            />
          );
        })}
      </div>

      {sections.length > 0 && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "rgba(241,245,249,0.94)",
            backdropFilter: "blur(10px)",
            borderTop: `1px solid ${P.border}`,
            padding: "14px 0",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "8px",
            zIndex: 100,
          }}
        >
          {InstituteCode == null && (
            <button
              onClick={handleSave}
              style={{
                padding: "10px 28px",
                border: "none",
                borderRadius: "8px",
                background: `linear-gradient(135deg, ${P.primaryDark}, ${P.primary})`,
                color: "#fff",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 3px 12px rgba(26,86,219,0.35)",
                fontFamily: "'DM Sans','Segoe UI',sans-serif",
                letterSpacing: "0.2px",
                transition: "all 0.15s",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Allocation
            </button>
          )}
        </div>
      )}
      {headPopupOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "500px",
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <h3
              style={{
                marginBottom: "20px",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              Select Head
            </h3>

            <div>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                {/* Head <span style={{ color: "red" }}></span> */}

                {headError && (
                  <span
                    style={{
                      color: "#ef4444",
                      marginLeft: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Head is required
                  </span>
                )}
              </label>

              <DropdownComponent
                label=""
                options={uploadHeadOptions}
                value={selectedHeadCode}
                onChange={(value) => {
                  setSelectedHeadCode(value);
                  setHeadError(false);
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => setHeadPopupOpen(false)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  minWidth: "100px",
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!selectedHeadCode) {
                    setHeadError(true);
                    return;
                  }

                  const headObj = heads.find(
                    (h) => h.HeadCode === selectedHeadCode,
                  );

                  setSelectedHead(headObj);
                  setSelectedUploadSection(selectedSectionForUpload);

                  setHeadPopupOpen(false);

                  setTimeout(() => {
                    document
                      .querySelector(".upload-pdf-component button")
                      ?.click();
                  }, 100);
                }}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  minWidth: "100px",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "none" }}>
        <UploadPdf
          id="headDocumentUpload"
          label="Upload Head Document"
          userLoginID={userInfo?.UserLoginID}
          userTypeId={userInfo?.UserTypeID}
          allowedFileTypes="pdf"
          onFileChange={handleHeadDocumentUpload}
        />
      </div>
    </div>
  );
}
