import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Clock,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import agent from "../../../lib/api/agent";
import { useAuth } from "../../../hooks/AuthContext";

// TODO: if your `agent` baseURL already includes "/api", remove the "api/" prefix below
const GetAttendanceCalendar = "api/Attendance/calendar";

/* =============================================================================
   DATE HELPERS
   ========================================================================== */
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n) {
  return String(n).padStart(2, "0");
}
function dateKey(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}
function mondayIndex(jsDay) {
  return (jsDay + 6) % 7;
}
function buildCalendarGrid(year, monthIndex) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startOffset = mondayIndex(firstOfMonth.getDay());
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: daysInPrevMonth - startOffset + 1 + i, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, inMonth: true });
  }
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const trailing = 7 - remainder;
    for (let day = 1; day <= trailing; day++) {
      cells.push({ day, inMonth: false });
    }
  }
  return cells;
}
// "2026-09-02" -> "Wednesday, September 2" — parsed as Y/M/D directly
// (not via `new Date(str)`) so there's no UTC/local timezone shift.
function formatFriendlyDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = mondayIndex(new Date(y, m - 1, d).getDay());
  return `${WEEKDAYS_FULL[dow]}, ${MONTH_NAMES[m - 1]} ${d}`;
}

// Parses a punch-in/punch-out value that may arrive either as a full
// datetime string (e.g. "2026-09-04T10:00:00") or as a bare time string
// (e.g. "10:00 AM"). Bare times are anchored to the record's own date so
// duration math below is never thrown off by timezone parsing quirks.
function parsePunchTime(value, dateStr) {
  if (!value) return null;
  if (/\d{4}-\d{2}-\d{2}/.test(value)) {
    const direct = new Date(value);
    if (!isNaN(direct.getTime())) return direct;
  }
  const match = String(value).match(/(\d{1,2}):(\d{2})\s*([AaPp][Mm])?/);
  if (!match || !dateStr) return null;
  const [, hh, mm, ampm] = match;
  let hours = parseInt(hh, 10);
  const minutes = parseInt(mm, 10);
  const suffix = ampm?.toLowerCase();
  if (suffix === "pm" && hours !== 12) hours += 12;
  if (suffix === "am" && hours === 12) hours = 0;
  const [y, m, d] = dateStr.split("-").map(Number);
  const combined = new Date(y, m - 1, d);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

// Renders a punch value as a plain "10:00 AM" style time for display,
// reusing the same parsing as the duration calculation so the displayed
// times and the computed total always agree.
function formatPunchTime(value, dateStr) {
  const parsed = parsePunchTime(value, dateStr);
  if (!parsed) return null;
  return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Total worked hours, derived directly from punch-in/punch-out rather than
// trusted as a pre-computed field — this is the only source of truth for
// the hours shown on the selected-day ring.
function calcHoursFromPunch(punchIn, punchOut, dateStr) {
  const inDate = parsePunchTime(punchIn, dateStr);
  const outDate = parsePunchTime(punchOut, dateStr);
  if (!inDate || !outDate) return null;
  let diffMs = outDate - inDate;
  if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // guard against an overnight shift
  return diffMs / (1000 * 60 * 60);
}

function normalizeAttendance(list) {
  if (!Array.isArray(list)) return {};
  const map = {};
  list.forEach((item) => {
    const date = item.date || item.Date || item.AttendanceDate;
    const status = (item.status || item.Status || "").toLowerCase();
    const dayOfWeek = item.dayOfWeek || item.DayOfWeek || "";
    const punchIn = item.punchIn ?? item.PunchIn ?? item.punchInTime ?? item.PunchInTime ?? null;
    const punchOut = item.punchOut ?? item.PunchOut ?? item.punchOutTime ?? item.PunchOutTime ?? null;
    const dKey = date ? date.slice(0, 10) : null;

    // Prefer a duration computed from the actual punch times; only fall
    // back to whatever total the API sends when punches aren't available.
    let totalHours = calcHoursFromPunch(punchIn, punchOut, dKey);
    if (totalHours == null) {
      const apiTotal = item.totalHours ?? item.TotalHours ?? null;
      totalHours = apiTotal != null ? Number(apiTotal) : null;
    }

    if (date) map[dKey] = { status, totalHours, dayOfWeek, punchIn, punchOut };
  });
  return map;
}

// Muted, editorial palette — each status gets a tinted bg + border (not
// just "present" left plain white), so all four read consistently on the
// grid.
const STATUS_META = {
  present:    { label: "Present",    dot: "#86efac", text: "#0f6b4c", bg: "#eaf7f1", border: "#cdead9" },
  incomplete: { label: "Incomplete", dot: "#a1887f", text: "#8a4f2c", bg: "#fbf2ec", border: "#f0ddd0" },
  absent:     { label: "Absent",     dot: "#fcd34d", text: "#9c6c15", bg: "#fdf6e8", border: "#f3e4bd" },
  none:       { label: "No record",  dot: "#c7cdd6", text: "#77808f", bg: "#f7f8fb", border: "#eceff3" },
};
// Sundays are always shown in red — a fixed weekly-off treatment that
// applies regardless of attendance status (present/absent/etc. for a
// Sunday would be unusual, but this takes visual priority either way).
const SUNDAY_DOT = "#ef4444";
const SUNDAY_BG = "#fee2e2";
const SUNDAY_BORDER = "#fca5a5";
const SUNDAY_TEXT = "#b91c1c";

const LEGEND_ITEMS = [
  { key: "present", title: "Present", desc: "Attended the session" },
  { key: "incomplete", title: "Incomplete", desc: "Attendance not completed" },
  { key: "absent", title: "Absent", desc: "Did not attend the session" },
  { key: "none", title: "No record", desc: "No attendance record found" },
];

// Standard shift length used as the ring's 100% mark. Adjust to match
// whatever a full working day means for your org.
const FULL_SHIFT_HOURS = 9;

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.none;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: meta.bg, border: `1px solid ${meta.border}`, color: meta.text,
      fontSize: 12.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot }} />
      {meta.label}
    </span>
  );
}

// Shown in place of StatusPill when the selected day is a Sunday — labels
// it as the weekly off day rather than implying an attendance status.
function WeeklyOffPill() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: SUNDAY_BG, border: `1px solid ${SUNDAY_BORDER}`, color: SUNDAY_TEXT,
      fontSize: 12.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: SUNDAY_DOT }} />
      Weekly off
    </span>
  );
}

// Reference blue for the ring — matches the accent used on the Timesheet-
// style reference design, used consistently regardless of attendance status.
const RING_BLUE = "#3f6fbf";

// Ring chart for the selected day's logged hours — worked hours (from
// punch-in/punch-out) filled against a full-shift reference, with the total
// in the center and the punch-in/punch-out times underneath. No punch-out
// control, break, or overtime figures here by design; this is a read-only
// summary of time already logged.
function HoursRing({ hours, punchIn, punchOut, dateStr, maxHours = FULL_SHIFT_HOURS, color = RING_BLUE }) {
  const size = 112;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeHours = hours != null ? Math.max(0, hours) : null;
  const pct = safeHours != null ? Math.min(safeHours / maxHours, 1) : 0;
  const offset = circumference * (1 - pct);

  const punchInLabel = formatPunchTime(punchIn, dateStr);
  const punchOutLabel = formatPunchTime(punchOut, dateStr);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e6eaf1" strokeWidth={strokeWidth}
        />
        {safeHours != null && (
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 400ms ease" }}
          />
        )}
        <text
          x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: "'Poppins', sans-serif", fontSize: 21, fontWeight: 700, fill: "#101828" }}
        >
          {safeHours != null ? safeHours.toFixed(2) : "—"}
        </text>
        <text
          x="50%" y="65%" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 16, fontWeight: 500, fill: "#98a2b3" }}
        >
          Hrs
        </text>
      </svg>

      {(punchInLabel || punchOutLabel) && (
        <div style={{ display: "flex", gap:60 , marginTop: 12 }}>
          {punchInLabel && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={18} color="#98a2b3" />
              <div>
                <div style={{ fontSize: 16, color: "#98a2b3", fontWeight: 600, lineHeight: 1.3 }}>Punch in</div>
                <div style={{ fontSize: 14, color: "#33465f", fontWeight: 600, lineHeight: 1.3 }}>{punchInLabel}</div>
              </div>
            </div>
          )}
          {punchOutLabel && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={18} color="#98a2b3" />
              <div>
                <div style={{ fontSize: 16, color: "#98a2b3", fontWeight: 600, lineHeight: 1.3 }}>Punch out</div>
                <div style={{ fontSize: 14, color: "#33465f", fontWeight: 600, lineHeight: 1.3 }}>{punchOutLabel}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   ATTENDANCE DASHBOARD
   All Staff/Candidate routing is resolved here on the frontend, same pattern
   as AdditionalDetails.jsx — no backend changes required:
   - UserTypeID 61 (institute/staff viewing a candidate) or 91 (candidate) -> "Candidate"
   - Everyone else -> "Staff"
   - candidateId in the URL always overrides to Candidate context
   The resolved user id is sent as CandidateID or StaffID; the backend can
   read it whenever it's ready to. Until then it will keep resolving the
   user from the auth token as it does today, so this remains backward
   compatible with the current controller.
   ========================================================================== */
export default function AttendanceDashboard() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [serverAbsentDays, setServerAbsentDays] = useState(null);

  const [searchParams] = useSearchParams();
  const candidateIdFromUrl = searchParams.get("candidateId");

  const { userInfo } = useAuth();
  const userTypeID = Number(userInfo?.UserTypeID);
  const userLoginID = userInfo?.UserLoginID;
  const loggedInUserID = userInfo?.UserID;

  // UserTypeID 61 = Institute/Staff viewing a candidate
  const isInstituteUser = userTypeID === 61;

  const formType =
    isInstituteUser || candidateIdFromUrl || userTypeID === 91
      ? "Candidate"
      : "Staff";

  const userID = isInstituteUser
    ? candidateIdFromUrl
    : candidateIdFromUrl || loggedInUserID;

  const userTypeIDName = formType === "Candidate" ? "CandidateID" : "StaffID";

  const cells = buildCalendarGrid(viewYear, viewMonth);

  const loadAttendance = useCallback(async () => {
    if (!userID) return;

    setLoading(true);
    setError("");

    try {
      const params = {
        [userTypeIDName]: userID,
        UserLoginID: userLoginID,
        year: viewYear,
        month: viewMonth + 1,
      };

      const response = await agent.get(GetAttendanceCalendar, { params });
      console.log(`${formType} attendance API response:`, response);

      if (response.data.Status === "Success" || response.data.status === true) {
        const payload = response.data.Data ?? response.data.data;
        const calendarDays = payload?.calendarDays ?? payload?.CalendarDays ?? [];
        setAttendance(normalizeAttendance(calendarDays));
        setServerAbsentDays(
          payload?.absentDays ?? payload?.AbsentDays ?? null
        );
      } else {
        setError(response.data.Message || response.data.message || "Could not load attendance data.");
        setAttendance({});
        setServerAbsentDays(null);
      }
    } catch (err) {
      setError(err.message || "Could not load attendance data.");
      setAttendance({});
      setServerAbsentDays(null);
    } finally {
      setLoading(false);
    }
  }, [viewYear, viewMonth, userTypeIDName, userID, userLoginID, formType]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance, refreshTick]);

  const summary = (() => {
    let present = 0, absent = 0, incomplete = 0, totalDays = 0;
    cells.forEach(({ day, inMonth }) => {
      if (!inMonth) return;
      totalDays += 1;
      const status = attendance[dateKey(viewYear, viewMonth, day)]?.status;
      if (status === "present") present += 1;
      if (status === "absent") absent += 1;
      if (status === "incomplete") incomplete += 1;
    });
    return {
      present,
      incomplete,
      absent: serverAbsentDays ?? absent,
      totalDays,
    };
  })();

  function goToMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    else if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
    setSelectedDate(null);
  }

  function isSunday(idx) { return idx % 7 === 6; }

  function handleSelectDay(key) {
    setSelectedDate((prev) => (prev === key ? null : key));
  }

  const selectedRecord = selectedDate ? attendance[selectedDate] : null;
  const selectedStatus = selectedDate ? (selectedRecord?.status || "none") : null;
  const selectedIsSunday = selectedDate
    ? (() => {
        const [y, m, d] = selectedDate.split("-").map(Number);
        return mondayIndex(new Date(y, m - 1, d).getDay()) === 6;
      })()
    : false;

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f7" }}>
      {/* Single deliberate accent: a thin gradient strip echoing the three
          attendance colors, flush with the top of the viewport. */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #93c5fd 0%, #86efac 45%, #fcd34d 100%)" }} />

      <div
        style={{
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          padding: "28px 24px 40px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {/* Legend bar */}
          <div style={{ background: "#ffffff", border: "1px solid #e6eaf1", borderRadius: 14, padding: "16px 22px", display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 16 }}>
            {LEGEND_ITEMS.map((item) => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: STATUS_META[item.key].dot, display: "inline-block" }} />
                <span style={{ fontSize: 14, color: "#33465f", fontWeight: 500 }}>{item.title}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#fdecea", border: "1px solid #f6c6c1", color: "#b3261e", fontSize: 13.5, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} /> {error}
              </span>
              <button className="att-retry" onClick={() => setRefreshTick((t) => t + 1)} style={{ background: "#ffffff", border: "1px solid #f3d3d0", color: "#b3261e", borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                Retry
              </button>
            </div>
          )}

          {/* Main grid */}
          <div className="att-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 16, alignItems: "start" }}>
            {/* Calendar panel */}
            <div style={{
              background: "#ffffff", border: "1px solid #e6eaf1", borderRadius: 20,
              padding: "22px 24px 26px", position: "relative",
              boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 16px 36px -18px rgba(16,24,40,0.16)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <button className="att-navbtn" onClick={() => goToMonth(-1)} aria-label="Previous month" style={navBtnStyle}>
                  <ChevronLeft size={18} color="#33465f" />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 21, fontWeight: 600, color: "#101828" }}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </span>
                  <Calendar size={17} color="#8592a6" />
                </div>
                <button className="att-navbtn" onClick={() => goToMonth(1)} aria-label="Next month" style={navBtnStyle}>
                  <ChevronRight size={18} color="#33465f" />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 }}>
                {WEEKDAYS.map((w) => (
                  <div key={w} style={{ textAlign: "center", fontSize: 12.5, color: "#98a2b3", fontWeight: 600 }}>{w}</div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 7, opacity: loading ? 0.4 : 1, transition: "opacity 0.2s" }}>
                {cells.map((cell, idx) => {
                  const key = cell.inMonth ? dateKey(viewYear, viewMonth, cell.day) : null;
                  const record = cell.inMonth ? attendance[key] : null;
                  const status = cell.inMonth ? (record?.status || "none") : null;
                  const meta = status ? STATUS_META[status] || STATUS_META.none : STATUS_META.none;
                  const isSelected = key && key === selectedDate;
                  const isSun = cell.inMonth && isSunday(idx);
                  const numberColor = !cell.inMonth ? "#c7cdd6" : isSun ? SUNDAY_TEXT : "#1c2b45";

                  return (
                    <button
                      key={idx}
                      className={cell.inMonth ? "att-daybtn" : undefined}
                      disabled={!cell.inMonth}
                      aria-pressed={isSelected || undefined}
                      onClick={() => cell.inMonth && handleSelectDay(key)}
                      style={{
                        aspectRatio: "1 / 0.8",
                        borderRadius: 12,
                        border: isSelected ? "2px solid #93c5fd" : `1px solid ${cell.inMonth ? (isSun ? SUNDAY_BORDER : meta.border) : "#eef1f5"}`,
                        background: !cell.inMonth ? "#f7f8fa" : isSelected ? "#eaf0fb" : isSun ? SUNDAY_BG : meta.bg,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        cursor: cell.inMonth ? "pointer" : "default",
                        padding: 0,
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 600, color: numberColor, fontVariantNumeric: "tabular-nums" }}>{cell.day}</span>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: !cell.inMonth ? "#d5dae2" : isSun ? SUNDAY_DOT : meta.dot, display: "inline-block" }} />
                    </button>
                  );
                })}
              </div>

              {loading && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ffffff", border: "1px solid #e6eaf1", borderRadius: 999, padding: "8px 16px", boxShadow: "0 6px 18px rgba(28,43,69,0.08)" }}>
                    <Loader2 size={15} style={{ animation: "att-spin 0.8s linear infinite" }} color="#3f6fbf" />
                    <span style={{ fontSize: 13, color: "#33465f", fontWeight: 500 }}>Loading attendance…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Selected-day detail — status pill plus an hours ring computed
                  from punch-in/punch-out. No punch-out control, break, or
                  overtime figures here by design. */}
              {selectedDate && (
                <div style={{ background: "#ffffff", border: "1px solid #e6eaf1", borderRadius: 16, padding: "18px 20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#98a2b3", fontWeight: 600, marginBottom: 3 }}>Selected day</div>
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 600, color: "#101828" }}>
                        {formatFriendlyDate(selectedDate)}
                      </div>
                    </div>
                    <button className="att-clear" onClick={() => setSelectedDate(null)} aria-label="Clear selected day" style={{ background: "none", border: "none", cursor: "pointer", color: "#98a2b3", padding: 4, borderRadius: 6 }}>
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    {selectedIsSunday ? <WeeklyOffPill /> : <StatusPill status={selectedStatus} />}
                  </div>

                  {!selectedIsSunday && (
                    <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                      <HoursRing
                        hours={selectedRecord?.totalHours ?? null}
                        punchIn={selectedRecord?.punchIn ?? null}
                        punchOut={selectedRecord?.punchOut ?? null}
                        dateStr={selectedDate}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              <div style={{ background: "#ffffff", border: "1px solid #e6eaf1", borderRadius: 16, padding: "20px 22px 24px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1c2b45", marginBottom: 16 }}>
                  {MONTH_NAMES[viewMonth]} {viewYear} summary
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  <SummaryStat value={summary.present} label="Present" color="#0f6b4c" bg="#eaf7f1" />
                  <SummaryStat value={summary.incomplete} label="Incomplete" color="#8a4f2c" bg="#fbf2ec" />
                  <SummaryStat value={summary.absent} label="Absent" color="#9c6c15" bg="#fdf6e8" />
                  <SummaryStat value={summary.totalDays} label="Total days" color="#93c5fd" bg="#eaf0fb" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        /* TODO: for production, prefer loading this via a <link> in
           index.html rather than @import here — it lets the browser start
           the font fetch earlier instead of waiting on this stylesheet. */

        @keyframes att-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .att-daybtn { transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease; }
        .att-daybtn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px -8px rgba(16,24,40,0.28);
        }
        .att-daybtn:focus-visible,
        .att-navbtn:focus-visible,
        .att-retry:focus-visible,
        .att-clear:focus-visible {
          outline: 2px solid #93c5fd;
          outline-offset: 2px;
        }

        .att-navbtn { transition: background 120ms ease, border-color 120ms ease; }
        .att-navbtn:hover { background: #f3f6fc; border-color: #c9d4e8; }

        .att-retry:hover { background: #fdf3f2; }
        .att-clear:hover { background: #f2f4f7; color: #475467; }

        @media (max-width: 860px) {
          .att-grid { grid-template-columns: 1fr !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .att-daybtn, .att-navbtn { transition: none !important; }
          .att-daybtn:hover:not(:disabled) { transform: none !important; }
        }
      `}</style>
    </div>
  );
}

function SummaryStat({ value, label, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "16px 8px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 24, fontWeight: 600, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#5b6b82", marginTop: 2 }}>{label}</div>
    </div>
  );
}

const navBtnStyle = { width: 34, height: 34, borderRadius: 9, border: "1px solid #e0e5ec", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };