import React, { useState, useEffect, useMemo, useCallback } from "react";
import agent from "../../../lib/api/agent";
import { SwalHelper } from "../../../utils/swalHelper";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { CalendarDays } from "lucide-react";

// ─── Endpoints ──────────────────────────────────────────────────────────
// GET  calls Attendance_RegularizationGetInstituteRequests (params: userTypeId, approvalStatus)
// CollegeId is NOT sent from the frontend — the backend resolves it
// server-side from the logged-in user's collegeLoginId (see
// AttendanceController.GetInstituteRegularization / AttendanceWorker).
const GetAttendanceRegularisationRequestsUrl = "/api/Attendance/get-institute-regularization";
// POST calls ProcessRegularization(List<long> requestId, int action, string approvalRemark = "")
// Confirmed via backend logs — this is a real bulk endpoint. Request body
// must be a BARE JSON array of ids (e.g. [37,46]), with action and
// approvalRemark sent as query params. Response Data is a single object
// when one id is sent, or an array when multiple ids are sent — each item
// carries its own Success/Message even though the HTTP status is always
// 200. approveBy is NOT a parameter — the backend resolves the approver
// itself via GetUserLoginId(), same pattern as CollegeId above.
const UpdateAttendanceRegularisationStatus = "/api/Attendance/regularization-process";

const PAGE_SIZE = 10;

// ─── userTypeId constants (same as attendance dashboard) ─────────────────
const USER_TYPE = { STAFF: 95, CANDIDATE: 91 };

// ─── Colors (trimmed down to what this page actually uses) ───────────────
const C = {
  navy:            "#111c35",
  staffAccent:     "#7c3aed",
  candidateAccent: "#7c3aed",
  approved:        "#16a34a",
  rejected:        "#dc2626",
  pending:         "#ca8a04",
};

// r.id AS RequestId — primary key of the regularisation request row
const getRequestId = (item) => item?.RequestId ?? item?.RequestID ?? item?.Id ?? item?.id;

const getDisplayName = (item) =>
  item.UserName ?? item.Name ?? item.FullName ?? item.userName ?? item.fullName ?? item.ApplicationID ?? "Unknown";

// approval_status is a tinyint: -1 Rejected, 0 Pending, 1 Approved.
// The SP already computes ApprovalStatusText for us — this is just a
// fallback in case a row ever comes back without it.
const mapNumericApprovalStatus = (n) => {
  const v = Number(n);
  if (v === 1) return "Approved";
  if (v === -1) return "Rejected";
  if (v === 0) return "Pending";
  return "Unknown";
};

const getApprovalStatusText = (item) =>
  item?.ApprovalStatusText ?? mapNumericApprovalStatus(item?.ApprovalStatus);

// request_type comes back from the DB as a short code (PI/PO/etc.) — map it
// to a readable label for display. Falls back to the raw code if it's ever
// something we don't recognise, so nothing silently disappears.
const REQUEST_TYPE_LABELS = {
  PI: "Punch In",
  PO: "Punch Out",
};

const getRequestTypeLabel = (item) => {
  const code = (item?.RequestType ?? "").toString().trim().toUpperCase();
  return REQUEST_TYPE_LABELS[code] ?? item?.RequestType ?? "—";
};

const isPendingRow = (item) => {
  if (item?.ApprovalStatus !== undefined && item?.ApprovalStatus !== null) {
    return Number(item.ApprovalStatus) === 0;
  }
  return getApprovalStatusText(item).toUpperCase() === "PENDING";
};

// "YYYY-MM" key for a row's attendance date — used to filter by month.
// Matches whichever field the Attendance Date column actually displays.
const getAttendanceMonthKey = (item) => {
  const raw = item?.RequestedPunchDateTime ?? item?.AttendanceDate;
  if (!raw) return null;
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return null;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};

// Sort order for the Approval Status column: Pending first, then Approved, then Rejected.
const STATUS_SORT_ORDER = { PENDING: 0, APPROVED: 1, REJECTED: 2 };
const getStatusSortRank = (item) => {
  const rank = STATUS_SORT_ORDER[getApprovalStatusText(item).toUpperCase()];
  return rank === undefined ? 99 : rank; // unknown statuses sink to the bottom
};

// DD/MM/YYYY, regardless of browser locale
const formatDate = (d) => {
  if (!d || d === "—") return "—";
  try {
    const dt = new Date(d);
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch { return d; }
};

// 12-hour clock with AM/PM
const formatTime = (t) => {
  if (!t || t === "—") return "—";
  if (/^\d{1,2}:\d{2}$/.test(t)) {
    const [hStr, mStr] = t.split(":");
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${mStr} ${period}`;
  }
  try { return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }); }
  catch { return t; }
};

const approvalStatusBadge = (item) => {
  const u = getApprovalStatusText(item).toUpperCase();
  if (u === "APPROVED") return { bg: "#dcfce7", color: C.approved, label: "Approved" };
  if (u === "REJECTED") return { bg: "#fee2e2", color: C.rejected, label: "Rejected" };
  if (u === "PENDING")  return { bg: "#fef9c3", color: C.pending,  label: "Pending" };
  return { bg: "#f3f4f6", color: "#6b7280", label: getApprovalStatusText(item) };
};

// The controller returns ApiResponse<object>.SuccessResponse(data, message),
// which serializes the payload list under "Data" (see AttendanceWorker /
// Repository.GetInstituteRegularization). This tries the common shapes and
// falls back to [] rather than throwing.
const extractRequestList = (payload) => {
  if (Array.isArray(payload)) {
    if (payload.length && payload[0] && "RequestId" in payload[0]) return payload;
    for (const part of payload) {
      if (Array.isArray(part) && part.length && "RequestId" in part[0]) return part;
      if (Array.isArray(part?.Data) && part.Data.length && "RequestId" in part.Data[0]) return part.Data;
    }
    return [];
  }
  if (Array.isArray(payload?.Data)) return payload.Data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.Table2)) return payload.Table2;       // ADO.NET DataSet default naming
  if (Array.isArray(payload?.Data?.Table2)) return payload.Data.Table2;
  if (Array.isArray(payload?.Details)) return payload.Details;
  return [];
};

// Normalizes the ProcessRegularization response into an array of
// { RequestId, Success, Message, ApprovalStatus, ... } objects.
// Confirmed from backend logs: when a single id is sent, Data comes back
// as ONE object (not wrapped in an array); when multiple ids are sent,
// Data is an array — one entry per id. Success/failure is always per-item
// (Success: true/false) even though the HTTP status is always 200, so
// every caller must check each item's Success flag rather than relying on
// the request not throwing.
const extractProcessResults = (payload) => {
  const data = payload?.Data ?? payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "RequestId" in data) return [data];
  return [];
};

// Builds a summary from a ProcessRegularization results array, for display
// in a single popup after an approve/reject action.
//
// ProcessRegularization's response items only carry RequestId/Success/
// Message — no ApplicationID or RequestType — so those are looked up from
// the `rows` already held in state, keyed by RequestId.
//
// Identical messages (same RequestType + same Message text) are grouped
// into ONE line listing every affected Application ID, e.g.:
//   "Application ID 202601C176637, 202601C176638 (Punch Out): Punch In
//   for same date must be approved before Punch Out can be approved."
// Distinct messages are kept as separate lines (joined with a blank line
// between them) rather than run together into one paragraph.
const buildResultsSummary = (results, rows) => {
  const rowById = new Map((rows || []).map(r => [String(getRequestId(r)), r]));

  const groups = new Map();
  results.forEach(item => {
    const row = rowById.get(String(item.RequestId));
    const applicationId = row?.ApplicationID ?? item.RequestId;
    const typeLabel = getRequestTypeLabel(row ?? {});
    const key = `${typeLabel}||${item.Message}`;
    if (!groups.has(key)) {
      groups.set(key, { typeLabel, message: item.Message, applicationIds: [] });
    }
    groups.get(key).applicationIds.push(applicationId);
  });

  return Array.from(groups.values())
    .map(g => {
      const idsLabel = g.applicationIds.length > 1
        ? `Application IDs ${g.applicationIds.join(", ")}`
        : `Application ID ${g.applicationIds[0]}`;
      return `${idsLabel} (${g.typeLabel}): ${g.message}`;
    })
    // NOTE: this assumes SwalHelper renders "\n" as a line break (e.g. it
    // passes { html: true } to SweetAlert2 and this string gets turned
    // into <br/><br/> before rendering, or it uses SweetAlert2's `text`
    // option with white-space: pre-line styling). If SwalHelper renders
    // plain text with no line-break support, the messages will still look
    // run-together — in that case swap this join for "<br/><br/>" and
    // confirm SwalHelper passes `html` rather than `text` to SweetAlert2.
    .join("\n\n");
};

const TableSkeleton = () => (
  <div style={{ padding: "16px 0" }}>
    <div style={{ height: 32, background: "#f0f0f0", borderRadius: 6, marginBottom: 12 }} />
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={{ height: 38, background: "#f5f6f8", borderRadius: 6, marginBottom: 6 }} />
    ))}
  </div>
);

// ─── Reject remark modal (remark is compulsory here, not for approvals) ──
const RejectRemarkModal = ({ targets, onCancel, onConfirm, submitting }) => {
  const [remark, setRemark] = useState("");

  useEffect(() => {
    if (targets && targets.length) setRemark("");
  }, [targets]);

  if (!targets || targets.length === 0) return null;

  const trimmed = remark.trim();
  const isBulk = targets.length > 1;
  const heading = isBulk ? `Reject ${targets.length} requests` : "Reject request";
  const description = isBulk
    ? `This remark will be applied to all ${targets.length} selected requests. A remark is required.`
    : `Rejecting ${getDisplayName(targets[0])}'s regularisation request. A remark is required.`;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000,
      }}
      onClick={() => !submitting && onCancel()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 14, width: 380, maxWidth: "90vw",
          padding: "22px 22px 18px", boxShadow: "0 12px 40px rgba(0,0,0,.25)",
        }}
      >
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#1f2937" }}>
          {heading}
        </h3>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#6b7280" }}>
          {description}
        </p>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={3}
          placeholder="Reason for rejection…"
          disabled={submitting}
          style={{
            width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
            padding: "9px 11px", fontSize: 13, resize: "vertical", outline: "none",
            fontFamily: "inherit", color: "#1f2937",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button
            onClick={onCancel}
            disabled={submitting}
            style={{
              background: "#fff", color: "#374151", border: "1px solid #e5e7eb",
              borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(trimmed)}
            disabled={submitting || !trimmed}
            style={{
              background: C.rejected, color: "#fff", border: "none",
              borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700,
              cursor: submitting || !trimmed ? "not-allowed" : "pointer",
              opacity: submitting || !trimmed ? 0.6 : 1,
            }}
          >
            {submitting ? "Rejecting…" : isBulk ? `Reject ${targets.length} requests` : "Reject request"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Table panel ───────────────────────────────────────────────────────────
// Approve/Reject is done ONLY via the bulk selection bar below (checkboxes
// + "Approve selected" / "Reject selected"), even for a single request —
// there is no per-row Approve/Reject button in the table itself anymore.
const RegularisationTablePanel = ({
  rows, loading, accent, panelTitle, panelSubtitle,
  actioningIds, actioningType,
  selectedMonth, selectedIds, onSelectionChange,
  onBulkApprove, onOpenBulkReject,
}) => {
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [rows, selectedMonth]);

  const filteredRows = useMemo(() => {
    const monthFiltered = selectedMonth
      ? (rows || []).filter(r => getAttendanceMonthKey(r) === selectedMonth)
      : (rows || []);
    // Stable sort: Pending first, then Approved, then Rejected. Requests
    // within the same status keep the order the API returned them in
    // (already requested_on DESC from the SP).
    return [...monthFiltered].sort((a, b) => getStatusSortRank(a) - getStatusSortRank(b));
  }, [rows, selectedMonth]);

  const totalPages = Math.max(1, Math.ceil((filteredRows?.length || 0) / PAGE_SIZE));
  const pagedRows = useMemo(
    () => (filteredRows || []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredRows, page]
  );

  const selectedCount = selectedIds.size;

  // Column keys line up with the SP's SELECT aliases:
  // RequestId, ApplicationID, AttendanceDate, RequestType, PunchDateTime,
  // PunchRemark, ApprovalStatus / ApprovalStatusText, RequestedOn,
  // ApproveBy, ApproveOn, ApprovalRemark.
  const columns = useMemo(() => [
    { key: "rowNo",           header: "Sr No",                    width: "60px",  headerClassName: "text-center", className: "text-center text-gray-400 font-semibold" },
    { key: "ApplicationID",   header: "Application Id",           width: "130px", headerClassName: "text-left",   className: "text-gray-700 whitespace-nowrap font-mono" },
    { key: "UserName",        header: "Name",                     width: "auto",  headerClassName: "text-left",   className: "text-gray-800 font-semibold" },
    { key: "AttendanceDate",  header: "Attendance Date",          width: "130px", headerClassName: "text-center", className: "text-center" },
    { key: "AttendanceTime",  header: "Attendance Time",          width: "120px", headerClassName: "text-center", className: "text-center" },
    { key: "RequestType",     header: "Request Type",             width: "170px", headerClassName: "text-left",   className: "text-gray-700" },
    { key: "RequestedOn",     header: "Request Time",             width: "150px", headerClassName: "text-center", className: "text-center" },
    { key: "PunchRemark",     header: "Remark",                   width: "220px", headerClassName: "text-left",   className: "text-gray-600" },
    { key: "ApprovalStatus",  header: "Approval Status",          width: "130px", headerClassName: "text-center", className: "text-center", sortable: false },
  ], []);

  const tableData = useMemo(
    () => pagedRows.map((r, i) => ({ ...r, rowNo: (page - 1) * PAGE_SIZE + i + 1 })),
    [pagedRows, page]
  );

  const renderCell = useCallback((item, column) => {
    if (column.key === "UserName") {
      return <span>{getDisplayName(item)}</span>;
    }
    if (column.key === "AttendanceDate") {
      return <span>{formatDate(item.RequestedPunchDateTime)}</span>;
    }
    if (column.key === "AttendanceTime") {
      return <span>{formatTime(item.RequestedPunchDateTime)}</span>;
    }
    if (column.key === "RequestType") {
      return <span>{getRequestTypeLabel(item)}</span>;
    }
    if (column.key === "RequestedOn") {
      return <span>{formatTime(item.RequestedOn)}</span>;
    }
    if (column.key === "PunchRemark") {
      const text = item.PunchRemark ?? "—";
      return (
        <span style={{ display: "block", whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>
          {text}
        </span>
      );
    }
    if (column.key === "ApprovalStatus") {
      const cfg = approvalStatusBadge(item);
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: cfg.bg, color: cfg.color, fontSize: 11.5, fontWeight: 700,
          padding: "4px 11px", borderRadius: 20, whiteSpace: "nowrap",
        }}>
          {cfg.label}
        </span>
      );
    }
    return undefined;
  }, []);

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,.08)", border: "1px solid #f1f5f9", overflow: "hidden", padding: "18px 20px" }}>
      {!loading && selectedCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", marginBottom: 14, padding: "10px 14px", background: "#f8fafc", border: "1px solid #eef0f3", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12.5, color: "#374151", fontWeight: 600 }}>{selectedCount} selected</span>
              <button
                onClick={() => onBulkApprove(Array.from(selectedIds))}
                disabled={actioningIds.size > 0}
                style={{
                  background: C.approved, color: "#fff", border: "none", borderRadius: 7,
                  padding: "7px 14px", fontSize: 12, fontWeight: 700,
                  cursor: actioningIds.size > 0 ? "not-allowed" : "pointer",
                  opacity: actioningIds.size > 0 ? 0.6 : 1,
                }}
              >
                {actioningType === "approve" && actioningIds.size > 0 ? "Approving…" : `Approve selected (${selectedCount})`}
              </button>
              <button
                onClick={() => onOpenBulkReject(filteredRows.filter(r => selectedIds.has(getRequestId(r))))}
                disabled={actioningIds.size > 0}
                style={{
                  background: "#fff", color: C.rejected, border: `1.5px solid ${C.rejected}`, borderRadius: 7,
                  padding: "7px 14px", fontSize: 12, fontWeight: 700,
                  cursor: actioningIds.size > 0 ? "not-allowed" : "pointer",
                  opacity: actioningIds.size > 0 ? 0.6 : 1,
                }}
              >
                {actioningType === "reject" && actioningIds.size > 0 ? "Rejecting…" : `Reject selected (${selectedCount})`}
              </button>
            </div>
        </div>
      )}
      {loading ? (
        <TableSkeleton />
      ) : (
        <FilteredTableComponent
          key={`${panelTitle}-${selectedMonth || "all"}`}
          data={tableData}
          columns={columns}
          renderCell={renderCell}
          title={panelTitle}
          tableTitle=""
          exportFileName={panelTitle.replace(/\s+/g, "_")}
          tableId={`regularisation-table-${panelTitle.replace(/\s+/g, "-").toLowerCase()}`}
          maxHeight="560px"
          emptyStateMessage="No requests found"
          emptyStateSubMessage="No regularisation requests returned by the API"
          showSearch={true}
          searchPosition="right"
          showExport={true}
          showExcel={false}
          showPDF={true}
          showExcelTemplate={false}
          showCheckbox={true}
          isRowSelectable={isPendingRow}
          onSelectionChange={onSelectionChange}
          sortable={true}
        />
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 14 }}>
          <button
            onClick={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
            style={{ minWidth: 36, height: 36, padding: "0 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#fff", color: page === 1 ? "#cbd5e1" : "#374151", border: "1px solid #e5e7eb", cursor: page === 1 ? "not-allowed" : "pointer" }}
          >
            Previous
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#6b7280", padding: "0 6px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => page < totalPages && setPage(page + 1)}
            disabled={page === totalPages}
            style={{ minWidth: 36, height: 36, padding: "0 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#fff", color: page === totalPages ? "#cbd5e1" : "#374151", border: "1px solid #e5e7eb", cursor: page === totalPages ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function AttendanceRegularisationApproval() {
  const [activeTab,   setActiveTab]   = useState("staff");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Default to the current month; "" means "all months" once cleared.
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ids of the requests currently being approved/rejected — always driven
  // by the bulk selection bar now (one id counts as a "bulk" of size 1).
  const [actioningIds,  setActioningIds]  = useState(() => new Set());
  const [actioningType, setActioningType] = useState(null);

  // rows selected via checkboxes for approve/reject (Set of RequestId)
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // rows queued for rejection (drives the remark modal); [] = closed.
  // Holds one item for a single selected row, or several for multiple —
  // the same remark gets applied to every item in this array.
  const [rejectTargets,    setRejectTargets]    = useState([]);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Clear selection whenever the underlying data changes — new tab's fetch,
  // or after an approve/reject updates rows locally.
  useEffect(() => { setSelectedIds(new Set()); }, [rows]);

  // ── CollegeId resolution removed ────────────────────────────────────
  // The backend (AttendanceController.GetInstituteRegularization) resolves
  // CollegeId itself, server-side, from the authenticated collegeLoginId —
  // see AttendanceWorker.GetInstituteRegularization, which calls
  // _attendanceRepo.GetInstituteIDByInstituteCode(collegeLoginId) before
  // hitting the SP. The frontend no longer needs to fetch or send CollegeId.
  //
  // ── approveBy resolution removed ────────────────────────────────────
  // Confirmed from the controller: ProcessRegularization resolves the
  // approver itself via GetUserLoginId() — the frontend never needs to
  // send an approveBy value.

  const fetchData = useCallback(async (tab) => {
    const userTypeId = tab === "staff" ? USER_TYPE.STAFF : USER_TYPE.CANDIDATE;
    setLoading(true);
    setError(null);
    try {
      const res = await agent.get(GetAttendanceRegularisationRequestsUrl, {
        // Param names match the controller action signature:
        // GetInstituteRegularization(long userTypeId, int? approvalStatus)
        params: { userTypeId },
      });

      console.log(`[${tab}] regularisation requests — RAW RESPONSE:`, res?.data);

      const list = extractRequestList(res?.data);
      setRows(list);
    } catch (err) {
      const status = err?.status ?? err?.response?.status;
      if (status === 400) {
        setRows([]);
        setLoading(false);
        return;
      }
      const msg =
        err?.Message ?? err?.message ??
        err?.response?.data?.Message ?? err?.response?.data?.message ??
        "Request failed";
      setError(msg);
      SwalHelper.error("Error", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  // ── Approve / Reject ─────────────────────────────────────────────────
  // Confirmed via backend logs: ProcessRegularization(List<long> requestId,
  // int action, string approvalRemark = "") binds requestId from a BARE
  // JSON array body (e.g. "[37,46]") — not wrapped in an object — since
  // ASP.NET Core infers the one complex-type parameter as [FromBody] and
  // the simple-type params (action, approvalRemark) as query/route params.
  // approveBy is resolved server-side, never sent from the frontend.
  //
  // Response shape varies by how many ids were sent:
  //   1 id   → Data is a SINGLE object:  { RequestId, Success, Message, ... }
  //   2+ ids → Data is an ARRAY of those objects, one per id.
  // Every item carries its own Success: true/false — the HTTP status is
  // always 200 even when an individual request fails (e.g. "Punch In
  // already exists for this date."), so callers must check each item's
  // Success flag. extractProcessResults() normalizes both shapes into a
  // single array so callers never have to special-case the single-id path.
  const approveRequests = useCallback(async (requestIds) => {
    const res = await agent.post(UpdateAttendanceRegularisationStatus, requestIds, {
      params: { action: 1, approvalRemark: "" },
    });
    return extractProcessResults(res?.data);
  }, []);

  const rejectRequests = useCallback(async (requestIds, remark) => {
    const res = await agent.post(UpdateAttendanceRegularisationStatus, requestIds, {
      params: { action: -1, approvalRemark: remark },
    });
    return extractProcessResults(res?.data);
  }, []);

  // Handles both a single selected row and multiple — "bulk" of size 1 is
  // just the normal case now that there's no separate row-level button.
  const handleBulkApprove = useCallback(async (ids) => {
    if (!ids || ids.length === 0) return;
    setActioningIds(new Set(ids));
    setActioningType("approve");
    try {
      const results = await approveRequests(ids);
      const succeededIds = results.filter(r => r.Success).map(r => r.RequestId);
      const failed = results.filter(r => !r.Success);

      if (succeededIds.length) {
        setRows(prev => prev.map(r => succeededIds.includes(getRequestId(r))
          ? { ...r, ApprovalStatus: 1, ApprovalStatusText: "Approved" }
          : r));
      }

      // Always show every result — success and failure — in one popup, so
      // the user can see exactly which request(s) went through and why any
      // others didn't (e.g. "Punch In for same date must be approved
      // before Punch Out can be approved."). ApplicationIDs and messages
      // are grouped by buildResultsSummary() so identical failures across
      // several requests collapse into a single line.
      // NOTE: assumes SwalHelper exposes a `.success(title, message)`
      // alongside the `.error(title, message)` already used elsewhere in
      // this file. If your utils/swalHelper.js doesn't export `.success`,
      // swap that one call for whatever success-toast/alert helper it does
      // export — the message-building logic (buildResultsSummary) doesn't
      // need to change either way.
      const summary = buildResultsSummary(results, rows);
      if (failed.length === 0) {
        SwalHelper.success("Approved", summary);
      } else if (succeededIds.length === 0) {
        SwalHelper.error("Approval failed", summary);
      } else {
        SwalHelper.error("Some requests could not be approved", summary);
      }
    } catch (err) {
      const msg =
        err?.Message ?? err?.message ??
        err?.response?.data?.Message ?? err?.response?.data?.message ??
        "Failed to approve requests";
      SwalHelper.error("Error", msg);
    } finally {
      setActioningIds(new Set());
      setActioningType(null);
    }
  }, [approveRequests, rows]);

  // Opens the remark modal — pass one item for a single selected row, or
  // several for multiple. Same modal, same "one remark for all" flow.
  const handleOpenBulkReject = useCallback((items) => {
    if (!items || items.length === 0) return;
    setRejectTargets(items);
  }, []);

  const handleRejectConfirm = useCallback(async (remark) => {
    if (!rejectTargets.length || !remark.trim()) return;
    const ids = rejectTargets.map(getRequestId).filter(id => id != null);
    if (!ids.length) {
      SwalHelper.error("Error", "Could not determine the request id for these rows.");
      return;
    }
    setActioningIds(new Set(ids));
    setActioningType("reject");
    setRejectSubmitting(true);
    try {
      const results = await rejectRequests(ids, remark.trim());
      const succeededIds = results.filter(r => r.Success).map(r => r.RequestId);
      const failed = results.filter(r => !r.Success);

      if (succeededIds.length) {
        setRows(prev => prev.map(r => succeededIds.includes(getRequestId(r))
          ? { ...r, ApprovalStatus: -1, ApprovalStatusText: "Rejected", ApprovalRemark: remark.trim() }
          : r));
      }

      const summary = buildResultsSummary(results, rows);
      if (failed.length === 0) {
        SwalHelper.success("Rejected", summary);
      } else if (succeededIds.length === 0) {
        SwalHelper.error("Rejection failed", summary);
      } else {
        SwalHelper.error("Some requests could not be rejected", summary);
      }

      setRejectTargets([]);
    } catch (err) {
      const msg =
        err?.Message ?? err?.message ??
        err?.response?.data?.Message ?? err?.response?.data?.message ??
        "Failed to reject requests";
      SwalHelper.error("Error", msg);
    } finally {
      setActioningIds(new Set());
      setActioningType(null);
      setRejectSubmitting(false);
    }
  }, [rejectTargets, rejectRequests, rows]);

  // FilteredTableComponent's built-in checkbox column calls this with the
  // actual array of selected row objects whenever selection changes
  // (individual check, or its own header "select all" checkbox).
  const handleTableSelectionChange = useCallback((items) => {
    const ids = (items || []).map(getRequestId).filter(id => id != null);
    setSelectedIds(new Set(ids));
  }, []);

  const accent = activeTab === "staff" ? C.staffAccent : C.candidateAccent;
  const panelTitle = activeTab === "staff" ? "Staff Regularisation Approval" : "Candidate Regularisation Approval";
  const panelSubtitle = activeTab === "staff"
    ? "Pending and past staff attendance regularisation requests"
    : "Pending and past candidate attendance regularisation requests";

  const isLoading = loading;

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: "#f1f5f9",
      fontFamily: "'Poppins', sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>

      {/* ── Sidebar (same structure/behaviour as the attendance dashboard) ── */}
      <aside style={{
        width: sidebarOpen ? 210 : 0, overflow: "hidden",
        background: C.navy, display: "flex", flexDirection: "column",
        transition: "width 280ms ease", flexShrink: 0,
      }}>
        <div style={{ padding: "22px 14px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 14px", borderBottom: "1px solid rgba(255,255,255,.08)", marginBottom: 4 }}>
            <CalendarDays size={16} color="#64748b" strokeWidth={2} />
            <span style={{ color: "#64748b", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em" }}>Dashboard</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { id: "staff",     label: "Staff Attendance",     color: C.staffAccent },
            { id: "candidate", label: "Candidate Attendance", color: C.candidateAccent },
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
            <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: error ? "#ef4444" : isLoading ? "#f59e0b" : "#22c55e" }} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: error ? "#f87171" : isLoading ? "#fbbf24" : "#4ade80" }}>
              {error ? "API Error" : isLoading ? "Loading…" : "Data loaded"}
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
              <h1 style={{ fontSize: 17, fontWeight: 800, color: "#1f2937", margin: 0 }}>{panelTitle}</h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
              <CalendarDays size={14} strokeWidth={2.2} /> Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#1f2937", outline: "none", cursor: "pointer", background: "#f8fafc", transition: "border-color 150ms" }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
            />
            {/* {selectedMonth && (
              <button
                onClick={() => setSelectedMonth("")}
                style={{ background: "#fff", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
              >
                Clear
              </button>
            )} */}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          {error ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}>
              <span style={{ fontSize: 32 }}>⚠️</span>
              <p style={{ color: "#ef4444", fontWeight: 600, fontSize: 14, margin: 0, textAlign: "center" }}>{error}</p>
              <button onClick={() => fetchData(activeTab)} style={{ background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, padding: "8px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Retry</button>
            </div>
          ) : (
            <RegularisationTablePanel
              rows={rows}
              loading={isLoading}
              accent={accent}
              panelTitle={panelTitle}
              panelSubtitle={panelSubtitle}
              actioningIds={actioningIds}
              actioningType={actioningType}
              selectedMonth={selectedMonth}
              selectedIds={selectedIds}
              onSelectionChange={handleTableSelectionChange}
              onBulkApprove={handleBulkApprove}
              onOpenBulkReject={handleOpenBulkReject}
            />
          )}
        </main>
      </div>

      <RejectRemarkModal
        targets={rejectTargets}
        submitting={rejectSubmitting}
        onCancel={() => !rejectSubmitting && setRejectTargets([])}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}