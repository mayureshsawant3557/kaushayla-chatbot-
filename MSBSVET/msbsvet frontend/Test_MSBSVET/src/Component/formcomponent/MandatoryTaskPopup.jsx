import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import agent from "../../lib/api/agent";
import {
  GetInstituteIDByInstituteCode,
  GetInstituteManagementDetails,
  GetPromotingOrganisationIDByInstituteID,
  GetPromoterDetailsByInstituteID,
  GetPromoterDetailsExistingInstituteByInstituteID,
  IsVerified,
  IsEligible,
} from "../../Endpoints_All/Base/Institute";

// ---- Switches ----
const DEBUG = true; // console logs. Set false for release.
const SHOW_BADGE = false; // on-screen red status badge (bottom-left)
const FAIL_OPEN = false; // false: failed check = Incomplete (popup shows). true: failed = Complete (never locks users out). Use true for release.
const FORCE_SHOW = false; // true: fake data, no API
// Which endpoint decides the "Institute Profile" row:
//   "verified" -> IsVerified (check-request-eligibility)
//   "eligible" -> IsEligible (check-form-eligibility)
const PROFILE_CHECK = "verified";
// ------------------

const log = (...a) => DEBUG && console.log("[MandatoryPopup]", ...a);

const TASKS = [
  {
    key: "Management",
    label: "Institute Management",
    path: "/Institute/Management",
  },
  {
    key: "PromotingOrganization",
    label: "Promoting Organization",
    path: "/Institute/PromotingOrganization",
  },
  { key: "Promoters", label: "Promoters", path: "/Institute/Promoters" },
  {
    key: "InstituteProfile",
    label: "Institute Profile",
    path: "/Institute/InstituteProfile",
  },
];

const NOTES = [
  "Institute is required to fill up all details in above pages before accessing Portal.",
  "Submit Institute Profile for verification.",
  "Institutes with verified Institute Profile shall only be able to apply for additional course/ units",
];

/* ---------------- Response helpers (tolerant) ---------------- */

// Case-insensitive property lookup: getKey(row, /^instituteid$/i)
const getKey = (obj, re) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return undefined;
  const k = Object.keys(obj).find((key) => re.test(key));
  return k === undefined ? undefined : obj[k];
};

// "Success", "success", "SUCCESS", " Success ", true, 200 all count
const isSuccess = (d) => {
  const s = d?.Status ?? d?.status ?? d?.Success ?? d?.success ?? d?.IsSuccess;
  if (s === true || s === 1 || s === 200) return true;
  return ["success", "ok", "true", "200"].includes(
    String(s ?? "")
      .trim()
      .toLowerCase(),
  );
};

// Data can arrive as a JSON string (common with stored-procedure APIs)
const parseData = (d) => {
  const raw = d?.Data ?? d?.data;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
};

const isMeaningful = (v) => {
  if (v === null || v === undefined || v === false || v === 0) return false;
  if (typeof v === "string") return v.trim() !== "" && v.trim() !== "0";
  if (Array.isArray(v)) return v.length > 0; // empty list is NOT data
  if (typeof v === "object") return Object.values(v).some(isMeaningful);
  return true;
};

const ID_RE = /^(promotingorg\w*id|promoterid|id)$/i;

// True if the payload contains at least one real record
const payloadHasRecord = (data) => {
  if (data === null || data === undefined) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data !== "object") return isMeaningful(data);

  // object wrapping a list, e.g. { Promoters: [...] } or { Table: [...] }
  const lists = Object.values(data).filter(Array.isArray);
  if (lists.some((l) => l.length > 0)) return true;

  // single record: prefer an ID field, otherwise any non-empty value
  const idKey = Object.keys(data).find((k) => ID_RE.test(k));
  if (
    idKey !== undefined &&
    data[idKey] !== null &&
    data[idKey] !== undefined
  ) {
    const n = Number(data[idKey]);
    return Number.isNaN(n) ? isMeaningful(data[idKey]) : n > 0;
  }
  return Object.values(data).some(isMeaningful);
};

const hasData = (res) =>
  isSuccess(res.data) && payloadHasRecord(parseData(res.data));

// kept as a separate name so the call sites stay readable
const hasRows = hasData;

// Pull a numeric/string ID out of a scalar, an object, or a one-row array
const pickId = (data) => {
  const row = Array.isArray(data) ? data[0] : data;
  if (row === null || row === undefined) return null;
  if (typeof row === "number" || typeof row === "string") return row;
  return getKey(row, /^promotingorg\w*id$/i) ?? getKey(row, /^id$/i) ?? null;
};

/* ---------------- API helpers ---------------- */

const finish = (res, method, url) => {
  log(`${method} ${url.split("/").pop()} ->`, res?.status, res?.data);
  if (!res || !res.status || res.status >= 400 || !res.data) {
    throw new Error(`Request failed (${res?.status}): ${url}`);
  }
  return res;
};

// One retry so a single timeout doesn't flip a completed task to Incomplete
const withRetry = async (fn, tries = 2) => {
  let err;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw err;
};

const get = (url, params) =>
  withRetry(async () =>
    finish(
      await agent.get(url, {
        params: { ...params, _t: Date.now() }, // defeats cached GET responses
        headers: { accept: "*/*" },
        silent: true,
      }),
      "GET",
      url,
    ),
  );

const post = (url, body) =>
  withRetry(async () =>
    finish(
      await agent.post(url, body, {
        headers: { accept: "*/*" },
        silent: true,
      }),
      "POST",
      url,
    ),
  );

const pickInstituteId = (body) => {
  const data = parseData(body);
  const row = Array.isArray(data) ? data[0] : data;
  if (row === null || row === undefined) return null;
  if (typeof row === "number" || typeof row === "string") return row;
  return getKey(row, /^instituteid$/i) ?? null;
};

const resolveInstituteId = async (userLoginId) => {
  const res = await get(GetInstituteIDByInstituteCode, {
    InstituteCode: userLoginId,
  });
  log("resolve response:", res.data);
  return pickInstituteId(res.data);
};

const PAGE_CODE = "MandatoryTask";
const IP_ADDRESS = "0.0.0.0";

// Same body the real Promoters page sends. NOTE: instituteId here is the
// PROMOTING ORGANISATION id, not the institute id.
const promotersBody = ({ userLoginId }, promotingOrgId) => ({
  instituteId: promotingOrgId,
  userLoginID: userLoginId,
  pageCode: "ExistingInstitute",
  itemId: "0",
  ipAddress: IP_ADDRESS,
});

// Same lookup the Promoters page does first. Null = no promoting org linked.
const resolvePromotingOrgId = async ({ instituteId }) => {
  const res = await get(
    `${GetPromotingOrganisationIDByInstituteID}/${instituteId}`,
  );
  if (!isSuccess(res.data)) return null;
  const id = pickId(parseData(res.data));
  return Number(id) > 0 ? id : null;
};

const eligibilityBody = ({ instituteId, userLoginId }) => ({
  InstituteID: instituteId,
  UserLoginID: userLoginId,
  PageCode: PAGE_CODE,
  IPAddress: IP_ADDRESS,
});

const TRUE_WORDS = [
  "y",
  "yes",
  "true",
  "1",
  "verified",
  "approved",
  "eligible",
  "submitted",
  "complete",
  "completed",
];

const isTrueLike = (v) =>
  v === true ||
  v === 1 ||
  (typeof v === "string" && TRUE_WORDS.includes(v.trim().toLowerCase()));

const rowFlagIsTrue = (row) => {
  if (isTrueLike(row)) return true; // scalar response: true / "Y" / 1
  return (
    !!row &&
    typeof row === "object" &&
    Object.entries(row).some(
      ([k, v]) => /verif|eligib/i.test(k) && isTrueLike(v),
    )
  );
};

// Each check gets (ctx, orgIdPromise). The promoting-org id is looked up
// once and shared by the two checks that need it.
const CHECKS = {
  Management: async ({ instituteId }) =>
    hasRows(
      await get(GetInstituteManagementDetails, { InstituteID: instituteId }),
    ),
  PromotingOrganization: async (_ctx, orgIdPromise) => !!(await orgIdPromise),
  // DIAGNOSTIC: queries both promoter endpoints and counts the row Complete
  // if either returns records. Check the "Promoters check ->" console line to
  // see which one works, then pin the check to that endpoint.
  Promoters: async (ctx, orgIdPromise) => {
    const orgId = await orgIdPromise;
    if (!orgId) return false;
    const body = promotersBody(ctx, orgId);

    const [existing, promotingOrg] = await Promise.allSettled([
      post(GetPromoterDetailsExistingInstituteByInstituteID, body),
      post(GetPromoterDetailsByInstituteID, body),
    ]);

    const ok = [existing, promotingOrg].map(
      (r) => r.status === "fulfilled" && hasRows(r.value),
    );
    log(
      "Promoters check ->",
      { existingInstitute: ok[0], promotingOrg: ok[1] },
      existing.reason?.message,
      promotingOrg.reason?.message,
    );
    return ok.some(Boolean);
  },
  InstituteProfile: async (ctx) => {
    const url = PROFILE_CHECK === "eligible" ? IsEligible : IsVerified;
    const res = await post(url, eligibilityBody(ctx));
    const data = parseData(res.data);
    const row = Array.isArray(data) ? data[0] : data;
    const ok = isSuccess(res.data) && rowFlagIsTrue(row);
    if (!ok) log(`InstituteProfile (${PROFILE_CHECK}) row:`, row);
    return ok;
  },
};

// `previous` = last known statuses. If a check errors out we keep what we
// knew before instead of flipping the row to Incomplete.
const loadMandatoryStatus = async (ctx, previous) => {
  const keys = Object.keys(CHECKS);
  const orgIdPromise = resolvePromotingOrgId(ctx);
  orgIdPromise.catch(() => {}); // avoid unhandled rejection; checks handle it below
  const results = await Promise.allSettled(
    keys.map((k) => CHECKS[k](ctx, orgIdPromise)),
  );
  const map = {};
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      log(`check "${keys[i]}" errored ->`, r.reason?.message || r.reason);
    }
    map[keys[i]] =
      r.status === "fulfilled" ? r.value : (previous?.[keys[i]] ?? FAIL_OPEN);
  });
  return map;
};

/* ---------------- Styles ---------------- */

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    overflowY: "auto",
    padding: "24px 16px",
  },
  card: {
    width: "100%",
    maxWidth: 760,
    background: "#fff",
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "0 10px 40px rgba(0,0,0,.4)",
    fontFamily: "inherit",
  },
  header: {
    background: "#0b2a6f",
    color: "#fff",
    padding: "12px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    cursor: "pointer",
    lineHeight: 1,
    padding: "4px 8px",
    borderRadius: 4,
    opacity: 0.8,
    transition: "opacity 0.15s, background-color 0.15s",
  },
  body: { padding: 20 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: {
    background: "#f3f4f6",
    textAlign: "left",
    padding: "8px 12px",
    fontWeight: 600,
    color: "#1f2937",
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#1f2937",
  },
  note: {
    marginTop: 16,
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: 4,
    padding: 12,
    fontSize: 13,
    color: "#991b1b",
  },
  btnWrap: { marginTop: 24, textAlign: "center" },
  badge: {
    position: "fixed",
    left: 8,
    bottom: 8,
    zIndex: 99999,
    background: "#b91c1c",
    color: "#fff",
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 4,
    maxWidth: 420,
  },
};

/* ---------------- Component ---------------- */

const MandatoryTaskPopup = ({ userLoginId, instituteId: instituteIdProp }) => {
  const [status, setStatus] = useState(null);
  const [resolvedId, setResolvedId] = useState(null);
  const [resolveError, setResolveError] = useState(null);
  const [hover, setHover] = useState(false);
  const [closeHover, setCloseHover] = useState(false);
  const [isClosed, setIsClosed] = useState(false); // manual dismissal
  const lastStatusRef = useRef(null); // last known statuses, used if a check errors

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const instituteId = instituteIdProp ?? resolvedId;
  const onTaskPage = TASKS.some((t) =>
    pathname.toLowerCase().endsWith(t.path.toLowerCase()),
  );

  // Reset closed state if route changes
  useEffect(() => {
    setIsClosed(false);
  }, [pathname]);

  // Resolve institute id if the parent didn't pass one
  useEffect(() => {
    if (FORCE_SHOW || instituteIdProp || !userLoginId || resolvedId) return;
    let cancelled = false;
    setResolveError(null);
    resolveInstituteId(userLoginId)
      .then((id) => {
        log("resolved instituteId:", id);
        if (cancelled) return;
        if (id === null || id === undefined) {
          setResolveError(
            "response had no InstituteID (check param/field name)",
          );
        } else {
          setResolvedId(id);
        }
      })
      .catch((e) => {
        log("could not resolve instituteId:", e.message);
        if (!cancelled) setResolveError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [userLoginId, instituteIdProp, resolvedId]);

  // Load statuses fresh on every route change; never show stale results
  useEffect(() => {
    setStatus(null); // drop stale result so an old "Incomplete" never flashes
    if (onTaskPage) return;

    if (FORCE_SHOW) {
      setStatus({
        Management: false,
        PromotingOrganization: false,
        Promoters: true,
        InstituteProfile: false,
      });
      return;
    }
    if (!userLoginId || !instituteId) return;

    let cancelled = false;
    loadMandatoryStatus(
      { userLoginId, instituteId },
      lastStatusRef.current,
    ).then((map) => {
      log("result", map, { userLoginId, instituteId });
      if (cancelled) return;
      lastStatusRef.current = map;
      setStatus(map);
    });
    return () => {
      cancelled = true;
    };
  }, [userLoginId, instituteId, pathname, onTaskPage]);

  // Work out what to render
  const rows = status
    ? TASKS.map((t) => ({ ...t, done: !!status[t.key] }))
    : [];
  const next = rows.find((r) => !r.done);

  let reason = null;
  if (isClosed) reason = "dismissed by user";
  else if (!userLoginId)
    reason = "no userLoginId prop passed to MandatoryTaskPopup";
  else if (onTaskPage)
    reason = `on a task page (${pathname}); popup hidden by design`;
  else if (!FORCE_SHOW && !instituteId)
    reason = resolveError
      ? `could not resolve instituteId: ${resolveError}`
      : "resolving instituteId...";
  else if (!status) reason = "checking status...";
  else if (!next) reason = "all 4 tasks complete";

  // Nothing pending (or any hide reason) -> render nothing
  if (reason || !next) {
    return SHOW_BADGE ? (
      <div style={S.badge}>MandatoryPopup: {reason || "nothing pending"}</div>
    ) : null;
  }

  return (
    <div
      style={S.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mandatory-title"
    >
      <div style={S.card}>
        <div style={S.header}>
          <h2 id="mandatory-title" style={S.title}>
            Mandatory Task to Complete
          </h2>
          <button
            type="button"
            aria-label="Close mandatory tasks modal"
            onClick={() => setIsClosed(true)}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            style={{
              ...S.closeBtn,
              opacity: closeHover ? 1 : 0.8,
              backgroundColor: closeHover
                ? "rgba(255, 255, 255, 0.15)"
                : "transparent",
            }}
          >
            &#x2715;
          </button>
        </div>

        <div style={S.body}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: "65%" }}>Task</th>
                <th style={S.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td style={S.td}>{r.label}</td>
                  <td
                    style={{
                      ...S.td,
                      fontWeight: 600,
                      color: r.done ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {r.done ? "Complete" : "Incomplete"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={S.note}>
            <div style={{ marginBottom: 4 }}>Note:</div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {NOTES.map((n) => (
                <li key={n} style={{ marginBottom: 4 }}>
                  {n}
                </li>
              ))}
            </ol>
          </div>

          <div style={S.btnWrap}>
            <button
              type="button"
              onClick={() => navigate(next.path)}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                background: hover ? "#16a34a" : "#1f3f9a",
                color: "#fff",
                border: 0,
                borderRadius: 4,
                padding: "6px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background .15s",
              }}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandatoryTaskPopup;
