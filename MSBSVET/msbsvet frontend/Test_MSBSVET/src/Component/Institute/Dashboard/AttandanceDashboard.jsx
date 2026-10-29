import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, Sector } from "recharts";
import agent from "../../../lib/api/agent";
import { SwalHelper } from "../../../utils/swalHelper";
import { GetInstituteSummaryByDate } from "../../../Endpoints_All/Institute/institute";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
//import { GetCourseByCollogeID } from "../../Endpoints_All/Base/masterData";
import {
  GetCourseByCollegeID,
  GetInstituteCourseBatches,
} from "../../../Endpoints_All/Administration/admin";

import {
  LogIn,
  LogOut,
  UserCheck,
  UserX,
  Users,
  ClipboardList,
  CalendarDays,
  PieChart as PieChartIcon,
  BookOpen,
  Layers,
  MapPin,
} from "lucide-react";

const PAGE_SIZE = 10;

// ─── userTypeId constants (from Swagger screenshots) ─────────────────────
const USER_TYPE = { STAFF: 95, CANDIDATE: 91 };

// ─── Helpers ──────────────────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function getUserSession() {
  try {
    const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll") || "{}");
    const userInfo    = JSON.parse(sessionStorage.getItem("userInfo")    || "{}");
    const instituteCode = userInfoAll?.UserLoginID ?? userInfo?.profileId ?? "";
    return { instituteCode, userInfoAll };
  } catch {
    return { instituteCode: "", userInfoAll: {} };
  }
}


// ─── Colors ───────────────────────────────────────────────────────────────
const C = {
  punchIn:         "#2563eb",
  punchOut:        "#16a34a",
  remaining:       "#dc2626",
  total:           "#0f172a",
  navy:            "#111c35",
  staffAccent:     "#2563eb",
  candidateAccent: "#7c3aed",
  navAccent:       "#7c3aed",
};

const Skeleton = ({ w = "100%", h = 20, r = 6 }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: "linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    display: "inline-block",
  }} />
);

// ─── Pagination ────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange, accent }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const around = new Set([1, 2, totalPages - 1, totalPages]);
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(totalPages, currentPage + 1);
        i++
      ) {
        around.add(i);
      }
      const sorted = [...around].sort((a, b) => a - b);
      sorted.forEach((p, idx) => {
        pages.push(p);
        const next = sorted[idx + 1];
        if (next && next - p > 1) pages.push("...");
      });
    }
    return pages;
  };

  const btnBase = {
    minWidth: 36, height: 36, padding: "0 12px", display: "flex", alignItems: "center",
    justifyContent: "center", borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: "pointer", userSelect: "none", transition: "background 120ms, color 120ms",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
      <button
        style={{ ...btnBase, background: "#fff", color: currentPage === 1 ? "#cbd5e1" : "#374151", border: "1px solid #e5e7eb", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#9ca3af", fontSize: 13 }}>…</span>
        ) : (
          <button
            key={p}
            style={{
              ...btnBase,
              background: currentPage === p ? accent : "#fff",
              color: currentPage === p ? "#fff" : "#374151",
              border: `1px solid ${currentPage === p ? accent : "#e5e7eb"}`,
            }}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        style={{ ...btnBase, background: "#fff", color: currentPage === totalPages ? "#cbd5e1" : "#374151", border: "1px solid #e5e7eb", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

// ─── Table Skeleton ─────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div style={{ padding: "16px 0" }}>
    <div style={{ height: 32, background: "#f0f0f0", borderRadius: 6, marginBottom: 12 }} />
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={{ height: 38, background: "#f5f6f8", borderRadius: 6, marginBottom: 6 }} />
    ))}
  </div>
);

// ─── Hover Member Popover ─────────────────────────────────────────────────
const MemberPopover = ({ members, color, label, visible, anchorRef }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!visible || !anchorRef?.current) return;

    const updatePos = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      // Wrapper below is `position: fixed`, so coordinates must stay
      // viewport-relative (getBoundingClientRect already gives us that) —
      // adding window.scrollY/scrollX here would double-count scroll and
      // make the popover drift away from its card as soon as the page scrolls.
      setPos({
        top:  rect.bottom + 8,
        left: rect.left,
      });
    };

    updatePos();
    // Keep the popover locked to the card while it's open, even if the
    // page scrolls or the window resizes.
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [visible, anchorRef]);

  if (!visible || !members?.length) return null;

  const formatTime = (ts) => {
    if (!ts) return "—";
    try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return ts; }
  };

  const getDisplayName = (m) =>
    m.UserName ?? m.Name ?? m.FullName ?? m.userName ?? m.fullName ?? "Unknown";

  return (
    <div style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none" }}>
      <div style={{
        position: "absolute",
        top:  pos.top,
        left: pos.left,
        background: "#fff",
        border: `2px solid ${color}30`,
        borderRadius: 14,
        boxShadow: `0 8px 32px rgba(0,0,0,.14), 0 0 0 1px ${color}18`,
        minWidth: 280,
        maxWidth: 360,
        maxHeight: 320,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${color}18, ${color}08)`,
          borderBottom: `1px solid ${color}20`,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 0 3px ${color}28` }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{label}</span>
          <span style={{ marginLeft: "auto", background: color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{members.length}</span>
        </div>
        <div style={{ overflowY: "auto", maxHeight: 250 }}>
          {members.map((m, i) => {
            const displayName = getDisplayName(m);
            return (
              <div key={m.UserLoginID ?? i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderBottom: i < members.length - 1 ? "1px solid #f5f6f8" : "none", transition: "background 80ms" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 10.5, color: "#9ca3af", fontFamily: "monospace" }}>{m.UserLoginID ?? "—"}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{formatTime(m.PunchIn)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── StatCard with hover popover ──────────────────────────────────────────
const StatCard = ({ icon, title, value, sub, borderColor, bgColor, loading, popoverMembers, popoverLabel }) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const filteredMembers = Array.isArray(popoverMembers) ? popoverMembers : [];

  return (
    <div ref={cardRef} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: "#fff", borderRadius: 14, padding: "16px 18px",
      borderLeft: `4px solid ${borderColor}`,
      boxShadow: hovered && filteredMembers.length ? `0 6px 24px ${borderColor}28, 0 1px 8px rgba(0,0,0,.07)` : "0 1px 8px rgba(0,0,0,.07)",
      cursor: filteredMembers.length ? "pointer" : "default",
      transition: "box-shadow 150ms", position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>{title}</p>
          {loading
            ? <Skeleton w="70px" h={26} r={6} />
            : <p style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "2px 0 0", lineHeight: 1 }}>{typeof value === "number" ? value.toLocaleString() : value}</p>
          }
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "3px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</p>
        </div>
        {filteredMembers.length > 0 && !loading && (
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${borderColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 9, color: borderColor, fontWeight: 800 }}>▼</span>
          </div>
        )}
      </div>
      <MemberPopover members={filteredMembers} color={borderColor} label={popoverLabel} visible={hovered && filteredMembers.length > 0 && !loading} anchorRef={cardRef} />
    </div>
  );
};

// ─── Active Donut Shape ───────────────────────────────────────────────────
const ActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 7} startAngle={startAngle} endAngle={endAngle} fill={fill} />;
};

// ─── Donut Chart ──────────────────────────────────────────────────────────
const DonutChart = ({ slices, centerPct, centerLabel, accent, loading }) => {
  const [activeIdx, setActiveIdx] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative" }}>
        <PieChart width={210} height={210}>
          <defs>
            {slices.map((s, i) => (
              <linearGradient key={i} id={`dg${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={1} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          <Pie data={slices} cx={105} cy={105} innerRadius={62} outerRadius={90} paddingAngle={3} cornerRadius={5} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0} activeIndex={activeIdx} activeShape={ActiveShape} onMouseEnter={(_, i) => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}>
            {slices.map((_, i) => <Cell key={i} fill={loading ? "#e5e7eb" : `url(#dg${i})`} />)}
          </Pie>
          <Tooltip
            formatter={(v, n) => [v.toLocaleString(), n]}
            contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
            position={{ x: 150, y: -6 }}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 20, pointerEvents: "none" }}
            cursor={false}
          />
        </PieChart>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          {loading ? <Skeleton w="60px" h={26} r={5} /> : <span style={{ fontSize: 24, fontWeight: 800, color: accent }}>{centerPct}%</span>}
          <span style={{ fontSize: 9.5, color: "#9ca3af", marginTop: 2, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>{centerLabel}</span>
        </div>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
        {slices.map((s, i) => (
          <div key={s.name} onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 10, background: activeIdx === i ? `${s.color}18` : "transparent", transition: "background 120ms", cursor: "default" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0, boxShadow: activeIdx === i ? `0 0 0 4px ${s.color}28` : "none", transition: "box-shadow 120ms" }} />
              <span style={{ fontSize: 12.5, color: "#374151", fontWeight: 500 }}>{s.name}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {loading ? <Skeleton w="50px" h={14} r={4} /> : (
                <>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{s.value.toLocaleString()}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${s.color}1c`, color: s.color, minWidth: 44, textAlign: "center" }}>{s.pct}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Status badge ──────────────────────────────────────────────────────────
// NOTE: icons removed from rendering (see AttendanceTablePanel renderCell)
// per request — badges now show plain text only, no arrow/icon glyphs.
const statusBadge = (s, isToday) => {
  if (!s) return { bg: "#f3f4f6", color: "#6b7280", Icon: Users, label: "—" };
  const u = s.toUpperCase();
  if (u === "PI") return { bg: "#dbeafe", color: "#2563eb", Icon: LogIn,  label: "Punch In" };
  if (u === "PO") return { bg: "#dcfce7", color: "#16a34a", Icon: LogOut, label: isToday ? "Punch Out" : "Present" };
  if (u === "RE") return isToday
    ? { bg: "#fee2e2", color: "#dc2626", Icon: UserX, label: "Remaining" }
    : { bg: "#fee2e2", color: "#dc2626", Icon: UserX, label: "Absent" };
  if (u === "AB") return { bg: "#fee2e2", color: "#dc2626", Icon: UserX, label: "Absent" };
  return { bg: "#f3f4f6", color: "#6b7280", Icon: Users, label: s };
};

const formatPunchTime = (ts) => {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  catch { return ts; }
};

// ─── Location Map Popover (free Google Maps iframe embed, no API key) ────
// Uses Google's public "output=embed" URL — free, no API key, no billing.
// Positioning now flips above the anchor (and clamps horizontally/vertically
// to the viewport) when there isn't enough room below, so the map never
// renders off-screen or below the fold.
const LocationMapPopover = ({ lat, lng, visible, anchorRef, onMouseEnter, onMouseLeave }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!visible || !anchorRef?.current) return;

    const updatePos = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const POPOVER_WIDTH  = 320;
      const POPOVER_HEIGHT = 280; // map (220) + info row + padding

      // Wrapper below is `position: fixed`, so coordinates stay
      // viewport-relative — no window.scrollX/scrollY here.
      let left = rect.left;
      const maxLeft = window.innerWidth - POPOVER_WIDTH - 12;
      if (left > maxLeft) left = Math.max(12, maxLeft);

      const spaceBelow = window.innerHeight - rect.bottom;
      let top;
      if (spaceBelow < POPOVER_HEIGHT + 16) {
        top = rect.top - POPOVER_HEIGHT - 8;
        if (top < 8) top = 8;
      } else {
        top = rect.bottom + 4;
      }

      setPos({ top, left });
    };

    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [visible, anchorRef]);

  if (!visible || lat == null || lng == null) return null;

  
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none" }}>
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          position: "absolute",
          top: pos.top,
          left: pos.left,
          width: 320,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,.18)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          pointerEvents: "auto",
          
          paddingTop: 6,
          marginTop: -6,
        }}
      >
        <iframe
          title="location-map"
          src={src}
          width="320"
          height="220"
          style={{ border: 0, display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div style={{ padding: "8px 10px", fontSize: 11, color: "#374151", borderTop: "1px solid #f1f5f9" }}>
          <p style={{ margin: "0 0 4px", lineHeight: 1.4, fontFamily: "monospace" }}>
            {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}&z=17`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#2563eb", fontWeight: 600 }}
          >
            Open in Google Maps ↗
          </a>
        </div>
      </div>
    </div>
  );
};


const LocationCell = ({ lat, lng }) => {
  const [hovered, setHovered] = useState(false);
  const anchorRef = useRef(null);
  const closeTimer = useRef(null);

  const openNow = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setHovered(true);
  };

  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setHovered(false), 150);
  };

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  if (lat == null || lng == null) {
    return <span style={{ color: "#d1d5db" }}>—</span>;
  }

  return (
    <span
      ref={anchorRef}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      style={{
        fontSize: 11.5,
        color: "#2563eb",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        cursor: "pointer",
      }}
    >
      <MapPin size={11} strokeWidth={2.3} style={{ flexShrink: 0 }} />
      <span
        style={{
          whiteSpace: "nowrap",
          color: "#2563eb",
          fontWeight: 800,
        }}
      >
        View Map
      </span>
      <LocationMapPopover
        lat={lat}
        lng={lng}
        visible={hovered}
        anchorRef={anchorRef}
        onMouseEnter={openNow}
        onMouseLeave={closeSoon}
      />
    </span>
  );
};

// ─── Attendance Table Panel ────────────────────────────────────────────────
const AttendanceTablePanel = ({ rows, loading, accent, isToday, panelTitle, panelSubtitle }) => {
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [rows]);

  const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / PAGE_SIZE));
  const pagedRows = useMemo(
    () => (rows || []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

  const columns = useMemo(() => [
    { key: "rowNo",         header: "Sr No",          width: "44px",  headerClassName: "text-center", className: "text-center text-gray-400 font-semibold" },
    { key: "UserLoginID",   header: "Application ID",     width: "130px", headerClassName: "text-left",   className: "text-gray-700 whitespace-nowrap font-mono" },
    { key: "UserName",      header: "Name",        width: "auto",  headerClassName: "text-left",   className: "text-gray-800 font-semibold" },
    { key: "PunchIn",       header: "Punch In",    width: "100px", headerClassName: "text-center", className: "text-center" },
    // View Map column now centered (was text-left, 180px)
    { key: "PunchInLocation",  header: "Punch In Location",  width: "140px", headerClassName: "text-center", className: "text-center" },
    { key: "PunchOut",      header: "Punch Out",   width: "100px", headerClassName: "text-center", className: "text-center" },
    // View Map column now centered (was text-left, 180px)
    { key: "PunchOutLocation", header: "Punch Out Location", width: "140px", headerClassName: "text-center", className: "text-center" },
    { key: "AttendanceStatus", header: "Status",   width: "130px", headerClassName: "text-center", className: "text-center", sortable: false },
  ], []);

  const tableData = useMemo(
    () => pagedRows.map((r, i) => ({ ...r, rowNo: (page - 1) * PAGE_SIZE + i + 1 })),
    [pagedRows, page]
  );

  const getDisplayName = (item) =>
    item.UserName ?? item.Name ?? item.FullName ?? item.userName ?? item.fullName ?? "Unknown";

  const renderCell = useCallback((item, column) => {
    if (column.key === "PunchIn") {
      const st = item.AttendanceStatus?.toUpperCase();
      const showTime = st === "PI" || st === "PO";
      return showTime && item.PunchIn
        ? <span style={{ color: "#2563eb", fontWeight: 600 }}>{formatPunchTime(item.PunchIn)}</span>
        : <span style={{ color: "#d1d5db" }}>—</span>;
    }
    if (column.key === "PunchOut") {
      const st = item.AttendanceStatus?.toUpperCase();
      const showTime = st === "PO";
      return showTime && item.PunchOut
        ? <span style={{ color: "#16a34a", fontWeight: 600 }}>{formatPunchTime(item.PunchOut)}</span>
        : <span style={{ color: "#d1d5db" }}>—</span>;
    }
    // Each row shows its OWN candidate's coordinates via a free
    // Google Maps iframe embed on hover — no external geocoding API call.
    if (column.key === "PunchInLocation") {
      return <LocationCell lat={item.PunchInLatitude} lng={item.PunchInLongitude} />;
    }
    if (column.key === "PunchOutLocation") {
      return <LocationCell lat={item.PunchOutLatitude} lng={item.PunchOutLongitude} />;
    }
    if (column.key === "AttendanceStatus") {
      // Icon removed from the badge per request — plain text pill only.
      const cfg = statusBadge(item.AttendanceStatus, isToday);
      return (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: cfg.bg, color: cfg.color, fontSize: 11.5, fontWeight: 700, padding: "4px 11px", borderRadius: 20, whiteSpace: "nowrap" }}>
          {cfg.label}
        </span>
      );
    }
    if (column.key === "UserName") {
      const displayName = getDisplayName(item);
      return <span>{displayName}</span>;
    }
    return undefined;
  }, [accent, isToday]);

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,.08)", border: "1px solid #f1f5f9", overflow: "hidden", padding: "18px 20px" }}>
      {/* <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ClipboardList size={18} color={accent} strokeWidth={2.2} />
        </div>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.01em" }}>{panelTitle}</h2>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{panelSubtitle}</p>
        </div>
      </div> */}

      {loading ? (
        <TableSkeleton />
      ) : (
        <FilteredTableComponent
          data={tableData}
          columns={columns}
          renderCell={renderCell}
          title={panelTitle}
          tableTitle=""
          exportFileName={panelTitle.replace(/\s+/g, "_")}
          tableId={`attendance-table-${panelTitle.replace(/\s+/g, "-").toLowerCase()}`}
          maxHeight="520px"
          emptyStateMessage="No records found"
          emptyStateSubMessage="No attendance data returned by the API for this date"
          showSearch={true}
          searchPosition="right"
          showExport={true}
          showExcel={false}
          showPDF={true}
          showExcelTemplate={false}
          showCheckbox={false}
          sortable={true}
        />
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} accent={accent} />
    </div>
  );
};

const SummarySection = ({ data, loading, error, onRetry, accent, donutLabel, isToday, panelTitle, panelSubtitle, emptyMessage }) => {
  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}>
        <span style={{ fontSize: 32 }}>⚠️</span>
        <p style={{ color: "#ef4444", fontWeight: 600, fontSize: 14, margin: 0, textAlign: "center" }}>{error}</p>
        <button onClick={onRetry} style={{ background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, padding: "8px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Retry</button>
      </div>
    );
  }

  if (!loading && !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}>
        <Users size={32} color="#9ca3af" strokeWidth={1.8} />
        <p style={{ color: "#6b7280", fontWeight: 600, fontSize: 14, margin: 0, textAlign: "center" }}>{emptyMessage}</p>
      </div>
    );
  }

  const total     = Number(data?.TotalCount) || 0;
  const punchOut  = Number(data?.PunchOut)   || 0;
  const punchIn   = Number(data?.PunchIn)    || 0;
  const remaining = Number(data?.Remaining)  || 0;
  const details   = Array.isArray(data?.Details) ? data.Details : [];

  const attended = punchIn + punchOut;
  const attPct   = total > 0 ? ((attended / total) * 100).toFixed(1) : "0.0";
  const pct      = (n) => total > 0 ? `${((n / total) * 100).toFixed(1)}%` : "0%";

  const allMembers       = details;
  const punchInMembers   = details.filter(d => d.AttendanceStatus?.toUpperCase() === "PI");
  const punchOutMembers  = details.filter(d => d.AttendanceStatus?.toUpperCase() === "PO");
  const remainingMembers = details.filter(d => d.AttendanceStatus?.toUpperCase() === "RE");

  const card1Icon = <Users size={22} color={accent} strokeWidth={2.2} />;
  const card2Icon = <LogIn size={22} color={C.punchIn} strokeWidth={2.2} />;

  const card3Label = isToday ? "Punch Out" : "Present";
  const card3Color = C.punchOut;
  const card3Bg    = "#f0fdf4";
  const card3Icon  = isToday
    ? <LogOut size={22} color={card3Color} strokeWidth={2.2} />
    : <UserCheck size={22} color={card3Color} strokeWidth={2.2} />;
  const card3Sub   = isToday ? `${pct(punchOut)} completed` : `${pct(punchOut)} were present`;

  const card4Label = isToday ? "Remaining" : "Absent";
  const card4Color = isToday ? C.remaining : "#dc2626";
  const card4Bg    = "#fef2f2";
  const card4Icon  = <UserX size={22} color={card4Color} strokeWidth={2.2} />;
  const card4Sub   = isToday ? `${pct(remaining)} not yet arrived` : `${pct(remaining)} were absent`;

  const slices = isToday ? [
    { name: "Punch In",  value: punchIn,   color: C.punchIn,  pct: pct(punchIn)  },
    { name: "Punch Out", value: punchOut,  color: C.punchOut, pct: pct(punchOut) },
    { name: "Remaining", value: remaining, color: C.remaining,pct: pct(remaining)},
  ].filter(s => s.value >= 0) : [
    { name: "Punch In", value: punchIn,   color: C.punchIn,  pct: pct(punchIn)  },
    { name: "Present",  value: punchOut,  color: C.punchOut, pct: pct(punchOut) },
    { name: "Absent",   value: remaining, color: "#dc2626",  pct: pct(remaining)},
  ].filter(s => s.value >= 0);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        <StatCard icon={card1Icon} title="Total" value={total} sub="All members" borderColor={accent} bgColor={`${accent}18`} loading={loading} popoverMembers={allMembers} popoverLabel="All Members" />
        <StatCard icon={card2Icon} title="Punch In" value={punchIn} sub={`${pct(punchIn)} punched in`} borderColor={C.punchIn} bgColor="#eff6ff" loading={loading} popoverMembers={punchInMembers} popoverLabel="Punched In" />
        <StatCard icon={card3Icon} title={card3Label} value={punchOut} sub={card3Sub} borderColor={card3Color} bgColor={card3Bg} loading={loading} popoverMembers={punchOutMembers} popoverLabel={card3Label} />
        <StatCard icon={card4Icon} title={card4Label} value={remaining} sub={card4Sub} borderColor={card4Color} bgColor={card4Bg} loading={loading} popoverMembers={remainingMembers} popoverLabel={card4Label} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 14, alignItems: "start" }}>
        <AttendanceTablePanel
          rows={details}
          loading={loading}
          accent={accent}
          isToday={isToday}
          panelTitle={panelTitle}
          panelSubtitle={panelSubtitle}
        />
        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 20px", boxShadow: "0 1px 8px rgba(0,0,0,.07)", border: "1px solid #f1f5f9", position: "sticky", top: 0 }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2937", margin: "0 0 2px", textAlign: "center" }}>Distribution</h2>
          <DonutChart slices={slices} centerPct={attPct} centerLabel={donutLabel} accent={accent} loading={loading} />
        </div>
      </div>
    </>
  );
};

// ─── Course / Batch dropdown (candidate tab only) ─────────────────────────
const CourseBatchFilter = ({
  courses, batches, coursesLoading, batchesLoading,
  selectedCourse, selectedBatch, onCourseChange, onBatchChange, accent,
}) => {
  const selectBase = {
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    padding: "7px 30px 7px 12px",
    fontSize: 13,
    color: "#1f2937",
    outline: "none",
    cursor: "pointer",
    background: "#f8fafc",
    transition: "border-color 150ms",
    appearance: "none",
    minWidth: 170,
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
          <BookOpen size={14} strokeWidth={2.2} /> Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => onCourseChange(e.target.value)}
          disabled={coursesLoading}
          style={selectBase}
          onFocus={e => e.target.style.borderColor = accent}
          onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
        >
          <option value="">{coursesLoading ? "Loading courses…" : "All Courses"}</option>
          {courses.map(c => (
            <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
          <Layers size={14} strokeWidth={2.2} /> Batch
        </label>
        <select
          value={selectedBatch}
          onChange={(e) => onBatchChange(e.target.value)}
          disabled={!selectedCourse || batchesLoading}
          style={{ ...selectBase, cursor: !selectedCourse ? "not-allowed" : "pointer", opacity: !selectedCourse ? 0.6 : 1 }}
          onFocus={e => e.target.style.borderColor = accent}
          onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
        >
          <option value="">
            {!selectedCourse ? "Select course first" : batchesLoading ? "Loading batches…" : "All Batches"}
          </option>
          {batches.map(b => (
            <option key={b.batchId} value={b.batchId}>{b.batchName}</option>
          ))}
        </select>
      </div>
    </>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function AttendanceDashboard() {
  const [activeTab,    setActiveTab]    = useState("staff");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  const [staffState,     setStaffState]     = useState({ data: null, loading: false, error: null });
  const [candidateState, setCandidateState] = useState({ data: null, loading: false, error: null });

  // ── Course / Batch dropdown state (candidate tab) ──
  const [courses,        setCourses]        = useState([]);
  const [batches,         setBatches]        = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch,  setSelectedBatch]  = useState("");
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);

  const { instituteCode } = getUserSession();

  const [collegeId, setCollegeId] = useState(null);

  useEffect(() => {
    if (!instituteCode) return;
    const resolveCollegeId = async () => {
      try {
        const res = await agent.get("/Base/GetInstituteIDByInstituteCode", {
          params: { InstituteCode: instituteCode },
        });
        const id = res?.data?.Data;
        console.log("GetInstituteIDByInstituteCode resolved collegeId:", id);
        setCollegeId(id || null);
      } catch (err) {
        console.log("GetInstituteIDByInstituteCode error:", err);
        setCollegeId(null);
      }
    };
    resolveCollegeId();
  }, [instituteCode]);

  const fetchData = useCallback(async (tab, date, courseId = 0, batchId = 0) => {
    const userTypeId = tab === "staff" ? USER_TYPE.STAFF : USER_TYPE.CANDIDATE;
    const setState   = tab === "staff" ? setStaffState : setCandidateState;

    setState(prev => ({ ...prev, loading: true, error: null }));

    const params = { userTypeId, attendanceDate: date };
    // Course/Batch filtering only applies to the candidate tab.
    if (tab === "candidate") {
      params.CourseID = courseId || 0;
      params.BatchID  = batchId  || 0;
    }
    

    try {
      const res = await agent.get(GetInstituteSummaryByDate, { params });

      // ── Full raw response (exactly what the API returned) ──
      console.log(`[${tab}] Attendance_GetInstituteSummary_ByDate — RAW RESPONSE:`, res);
      console.log(`[${tab}] Attendance_GetInstituteSummary_ByDate — res.data:`, res?.data);

      const statusCode = Number(res?.data?.StatusCode ?? res?.data?.statusCode ?? 200);
      const payload    = res?.data?.Data ?? res?.data?.data ?? res?.data ?? null;

      if (statusCode === 200 && payload) {
        console.log(`[${tab}] params sent:`, params);
        console.log(`[${tab}] payload (Data) received:`, payload);
        console.log(`[${tab}] Summary — TotalCount/PunchIn/PunchOut/Remaining:`, {
          TotalCount: payload?.TotalCount,
          PunchIn:    payload?.PunchIn,
          PunchOut:   payload?.PunchOut,
          Remaining:  payload?.Remaining,
        });

      
        const details = Array.isArray(payload?.Details) ? payload.Details : [];
        console.log(`[${tab}] Details rows count:`, details.length);
        console.table(
          details.map((d) => ({
            UserLoginID: d.UserLoginID,
            UserName: d.UserName,
            AttendanceStatus: d.AttendanceStatus,
            PunchIn: d.PunchIn,
            PunchInLatitude: d.PunchInLatitude,
            PunchInLongitude: d.PunchInLongitude,
            PunchOut: d.PunchOut,
            PunchOutLatitude: d.PunchOutLatitude,
            PunchOutLongitude: d.PunchOutLongitude,
          }))
        );

        setState({ data: payload, loading: false, error: null });
      } else {
        console.log(`[${tab}] No payload / non-200 statusCode:`, statusCode, res?.data);
        setState({ data: null, loading: false, error: null });
      }
    } catch (err) {
      console.log(`[${tab}] Attendance_GetInstituteSummary_ByDate — ERROR:`, err);
      console.log(`[${tab}] error response data:`, err?.response?.data);
      const status = err?.status ?? err?.response?.status;

      if (status === 400) {
        setState({ data: null, loading: false, error: null });
        return;
      }

      const msg =
        err?.Message ??
        err?.message ??
        err?.response?.data?.Message ??
        err?.response?.data?.message ??
        "Request failed";
      setState({ data: null, loading: false, error: msg });
      SwalHelper.error("Error", msg);
    }
  }, []);

  // Staff tab: refetches only when the date changes.
  useEffect(() => {
    fetchData("staff", selectedDate);
  }, [selectedDate, fetchData]);

  // ── Candidate tab: refetch on date change, keeping any already-selected ──
  // course/batch filters. Only the DATE change triggers this effect;
  // selecting a course or batch on its own is still handled separately
  // (see handleCourseChange / handleBatchChange below) so we don't
  // double-fire requests.
  useEffect(() => {
    fetchData("candidate", selectedDate, selectedCourse, selectedBatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // ── GetCourseByCollegeID: loads Course dropdown options ──
  const fetchCourses = useCallback(async () => {
    if (!collegeId) {
      console.log("fetchCourses: skipped — collegeId not resolved yet.");
      setCourses([]);
      return;
    }
    setCoursesLoading(true);
    try {
      const params = { CollegeID: collegeId };
      const res = await agent.get(GetCourseByCollegeID, { params });

      const statusCode = Number(res?.data?.StatusCode ?? res?.data?.statusCode ?? 200);
      const payload     = res?.data?.Data ?? res?.data?.data ?? res?.data ?? [];
      const list        = Array.isArray(payload) ? payload : [];

      if (statusCode === 200 && list.length >= 0) {
        const mapped = list
          .filter(c => {
            const id = c.CourseID ?? c.courseId ?? c.CourseId ?? c.Value ?? c.Id ?? c.id;
            const name = (c.CourseName ?? c.courseName ?? c.Name ?? c.Text ?? c.name ?? "").toString().trim().toLowerCase();
            return id != null && String(id) !== "-1" && name !== "select" && name !== "";
          })
          .map(c => ({
            courseId:   c.CourseID ?? c.courseId ?? c.CourseId ?? c.Value ?? c.Id ?? c.id,
            courseName: c.CourseName ?? c.courseName ?? c.Name ?? c.Text ?? c.name ?? "Unknown Course",
          }));
        setCourses(mapped);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.log("GetCourseByCollegeID error:", err);
      setCourses([]);
      const msg =
        err?.Message ??
        err?.message ??
        err?.response?.data?.Message ??
        err?.response?.data?.message ??
        "Failed to load courses";
      SwalHelper.error("Error", msg);
    } finally {
      setCoursesLoading(false);
    }
  }, [collegeId]);

  // ── GetInstituteCourseBatches: loads Batch dropdown options for the selected course ──
  const fetchBatches = useCallback(async (courseId) => {
    if (!courseId) {
      setBatches([]);
      return;
    }

    if (!collegeId) {
      console.log("fetchBatches: skipped — collegeId not resolved yet.");
      setBatches([]);
      return;
    }

    setBatchesLoading(true);

    try {
      const params = {
        instituteID: collegeId,
        courseID: courseId,
        admissionYearID: 0,
        isAttendanceDashboard: true, // only currently-active batches
      };

      const res = await agent.get(GetInstituteCourseBatches, { params });

      const statusCode = Number(res?.data?.StatusCode ?? res?.data?.statusCode ?? 200);
      const payload = res?.data?.Data ?? res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload) ? payload : [];

      if (statusCode === 200) {
        const mapped = list
          .filter(b => {
            const id = b.BatchID ?? b.batchId ?? b.BatchId ?? b.Value ?? b.Id ?? b.id;
            const name = (b.BatchName ?? b.batchName ?? b.Name ?? b.Text ?? b.name ?? "").toString().trim().toLowerCase();
            return id != null && String(id) !== "-1" && name !== "select" && name !== "";
          })
          .map(b => ({
            batchId: b.BatchID ?? b.batchId ?? b.BatchId ?? b.Value ?? b.Id ?? b.id,
            batchName: b.BatchName ?? b.batchName ?? b.Name ?? b.Text ?? b.name ?? "Unknown Batch",
          }));

        setBatches(mapped);
      } else {
        setBatches([]);
      }
    } catch (err) {
      console.log("GetInstituteCourseBatches error:", err);
      setBatches([]);
      const msg =
        err?.Message ??
        err?.message ??
        err?.response?.data?.Message ??
        err?.response?.data?.message ??
        "Failed to load batches";
      SwalHelper.error("Error", msg);
    } finally {
      setBatchesLoading(false);
    }
  }, [collegeId]);

  // Load courses once, the first time the Candidate tab is opened.
  useEffect(() => {
    if (activeTab === "candidate" && courses.length === 0 && !coursesLoading) {
      fetchCourses();
    }
  }, [activeTab, courses.length, coursesLoading, fetchCourses]);

  // Whenever the selected course changes, reload the batch dropdown.
  // NOTE: this only loads the batch *list* — it never calls the attendance API.
  useEffect(() => {
    fetchBatches(selectedCourse);
  }, [selectedCourse, fetchBatches]);

  // ── Course dropdown handler: updates course + clears batch together. ──
  // If a specific course is chosen, we do NOT fetch here — fetchBatches()
  // loads the batch list and the user still needs to pick a batch;
  // handleBatchChange remains the only place that fetches for a specific
  // course, exactly as before.
  //
  // FIX: if the course is cleared back to "All Courses" (empty value),
  // there is no batch step left to trigger a fetch, so we fetch immediately
  // here with CourseID=0 / BatchID=0 — this is what previously required a
  // full page refresh to show all courses again.
  const handleCourseChange = useCallback((courseId) => {
    setSelectedCourse(courseId);
    setSelectedBatch("");
    setBatches([]);

    if (!courseId) {
      fetchData("candidate", selectedDate, 0, 0);
    }
  }, [fetchData, selectedDate]);

  // ── Batch dropdown handler: fires the attendance fetch for the candidate ──
  // tab with a real CourseID + BatchID pair. Uses the argument directly
  // (not state) to avoid any stale-closure issue.
  const handleBatchChange = useCallback((batchId) => {
    setSelectedBatch(batchId);
    fetchData("candidate", selectedDate, selectedCourse, batchId);
  }, [fetchData, selectedDate, selectedCourse]);

  const state      = activeTab === "staff" ? staffState     : candidateState;
  const accent     = activeTab === "staff" ? C.staffAccent  : C.candidateAccent;
  const donutLabel = activeTab === "staff" ? "Staff Attend." : "Candidate";

  const panelTitle    = activeTab === "staff" ? "Staff Attendance" : "Candidate Attendance";
  const panelSubtitle = activeTab === "staff"
    ? `Staff punch records for ${selectedDate}`
    : `Candidate punch records for ${selectedDate}`;

  const emptyMessage = activeTab === "staff"
    ? "No staff enrolled for this institute."
    : "No candidate enrolled for this institute.";

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: "#f1f5f9",
      fontFamily: "'Poppins', sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.7; filter: invert(0); }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 210 : 0, overflow: "hidden",
        background: C.navy, display: "flex", flexDirection: "column",
        transition: "width 280ms ease", flexShrink: 0,
      }}>
        {/* <div style={{ padding: "22px 14px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 14px", borderBottom: "1px solid rgba(255,255,255,.08)", marginBottom: 4 }}>
            <CalendarDays size={16} color="#64748b" strokeWidth={2} />
            <span style={{ color: "#64748b", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em" }}>Dashboard</span>
          </div>
        </div> */}

        <nav style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { id: "staff",     label: "Staff Attendance",     color: C.navAccent },
            { id: "candidate", label: "Candidate Attendance", color: C.navAccent },
          ].map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 11,
                padding: "11px 13px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                border: active ? "1px solid rgba(255,255,255,.18)" : "1px solid transparent",
                cursor: "pointer", textAlign: "left", transition: "all 140ms",
                background: active ? item.color : "transparent",
                color: active ? "#fff" : "#94a3b8",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: state.error ? "#ef4444" : state.loading ? "#f59e0b" : "#22c55e" }} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: state.error ? "#f87171" : state.loading ? "#fbbf24" : "#4ade80" }}>
              {state.error ? "API Error" : state.loading ? "Loading…" : "Data loaded"}
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ background: "#fff", padding: "12px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,.07)", flexShrink: 0, gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 20, lineHeight: 1, padding: 4 }}>☰</button>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 800, color: "#1f2937", margin: 0 }}>
                {panelTitle}
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {activeTab === "candidate" && (
              <CourseBatchFilter
                courses={courses}
                batches={batches}
                coursesLoading={coursesLoading}
                batchesLoading={batchesLoading}
                selectedCourse={selectedCourse}
                selectedBatch={selectedBatch}
                onCourseChange={handleCourseChange}
                onBatchChange={handleBatchChange}
                accent={accent}
              />
            )}
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
              <CalendarDays size={14} strokeWidth={2.2} /> Select Date
            </label>
            <input type="date" value={selectedDate} max={todayISO()} onChange={e => { if (e.target.value) setSelectedDate(e.target.value); }}
              style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#1f2937", outline: "none", cursor: "pointer", background: "#f8fafc", transition: "border-color 150ms" }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          <SummarySection
            key={activeTab}
            data={state.data}
            loading={state.loading}
            error={state.error}
            onRetry={() => fetchData(activeTab, selectedDate, selectedCourse, selectedBatch)}
            accent={accent}
            donutLabel={donutLabel}
            isToday={selectedDate === todayISO()}
            panelTitle={panelTitle}
            panelSubtitle={panelSubtitle}
            emptyMessage={emptyMessage}
          />
        </main>
      </div>
    </div>
  );
}