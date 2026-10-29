import { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = "https://your-api-base-url.com"; // ← change this

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA  (mirrors exact DB columns + PageGroup)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_DATA = [
    // ── PageGroup 1 → LoI Stage ──────────────────────────────────────────────
    { PageCode: "InstitutePayment", PercentageStatus: 100, PageId: 1, PageURL: "../Institute/InstitutePayment.aspx", PageNameDisplay: "Registration Fee", BGColur: "#fef3cd", DisplayType: "Verified", VerifyStatus: "V", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 1 },
    { PageCode: "PromotingOrganization", PercentageStatus: 100, PageId: 2, PageURL: "../Institute/PromotingOrganization.aspx", PageNameDisplay: "Promoting Organization", BGColur: "#cfe2ff", DisplayType: "Verified", VerifyStatus: "V", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 1 },
    { PageCode: "PromotersDetails", PercentageStatus: 100, PageId: 3, PageURL: "../Institute/PromotersDetails.aspx", PageNameDisplay: "Promoters", BGColur: "#FFE8E8", DisplayType: "Verified", VerifyStatus: "V", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 1 },
    { PageCode: "ProposedInstituteDetails", PercentageStatus: 100, PageId: 4, PageURL: "../Institute/ProposedInstituteDetails.aspx", PageNameDisplay: "Institute Profile", BGColur: "#e2e3e5", DisplayType: "Verified", VerifyStatus: "V", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 1 },
    { PageCode: "ProposedCourse", PercentageStatus: 100, PageId: 5, PageURL: "../Institute/ProposedCourse.aspx", PageNameDisplay: "Proposed Courses", BGColur: "#cfe2ff", DisplayType: "Verified", VerifyStatus: "V", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 1 },
    { PageCode: "SelfDeclaration", PercentageStatus: 100, PageId: 6, PageURL: "../Institute/SelfDeclaration.aspx", PageNameDisplay: "Self-Declaration", BGColur: "#f8d7da", DisplayType: "Verified", VerifyStatus: "V", AnchorTagTarget: "_self", DocumentPath: "https://example.com/a.pdf", PageGroup: 1 },
    { PageCode: "LOIGeneration", PercentageStatus: 100, PageId: 7, PageURL: "../SDILOI/PrintLOIInstituteProfile.aspx", PageNameDisplay: "Application for LoI", BGColur: "#f5d7b5", DisplayType: "Document", VerifyStatus: "V", AnchorTagTarget: "_blank", DocumentPath: "", PageGroup: 1 },
    { PageCode: "LOIGeneration", PercentageStatus: 100, PageId: 7, PageURL: "../Institute/PrintLOI.aspx", PageNameDisplay: "Letter of Intent (LoI)", BGColur: "#fef3cd", DisplayType: "Document", VerifyStatus: "", AnchorTagTarget: "_blank", DocumentPath: "", PageGroup: 1 },
    // ── PageGroup 2 → Inspection Stage ──────────────────────────────────────
    { PageCode: "UnitforInspection", PercentageStatus: 0, PageId: 8, PageURL: "../Institute/UnitforInspection.aspx", PageNameDisplay: "Unit for Inspection", BGColur: "#4ade80", DisplayType: "Percent", VerifyStatus: "N", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 2 },
    { PageCode: "BuildingDetails", PercentageStatus: 0, PageId: 9, PageURL: "../Institute/BuildingDetails.aspx", PageNameDisplay: "Building Details", BGColur: "#4ade80", DisplayType: "Percent", VerifyStatus: "N", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 2 },
    { PageCode: "LandDetails", PercentageStatus: 0, PageId: 10, PageURL: "../Institute/LandDetails.aspx", PageNameDisplay: "Land Details", BGColur: "#93c5fd", DisplayType: "Percent", VerifyStatus: "N", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 2 },
    { PageCode: "WorkshopDetails", PercentageStatus: 0, PageId: 11, PageURL: "../Institute/WorkshopDetails.aspx", PageNameDisplay: "Workshop Details", BGColur: "#f9a8d4", DisplayType: "Percent", VerifyStatus: "N", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 2 },
    { PageCode: "TrainingEquipmentDetails", PercentageStatus: 0, PageId: 12, PageURL: "../Institute/TrainingEquipmentDetails.aspx", PageNameDisplay: "Training Equipment Details", BGColur: "#bfdbfe", DisplayType: "Percent", VerifyStatus: "N", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 2 },
    { PageCode: "CommonFacilityDetails", PercentageStatus: 0, PageId: 13, PageURL: "../Institute/CommonFacilityDetails.aspx", PageNameDisplay: "Common Facility Details", BGColur: "#4ade80", DisplayType: "Percent", VerifyStatus: "N", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 2 },
    { PageCode: "PowerDetails", PercentageStatus: 0, PageId: 14, PageURL: "../Institute/PowerDetails.aspx", PageNameDisplay: "Power Details", BGColur: "#bfdbfe", DisplayType: "Percent", VerifyStatus: "N", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 2 },
    { PageCode: "InstituteBank", PercentageStatus: 0, PageId: 15, PageURL: "../Institute/InstituteBank.aspx", PageNameDisplay: "Bank Account", BGColur: "#bfdbfe", DisplayType: "Percent", VerifyStatus: "N", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 2 },
    { PageCode: "InspectionFee", PercentageStatus: 0, PageId: 16, PageURL: "../Institute/InspectionFee.aspx", PageNameDisplay: "Inspection Fees", BGColur: "#4ade80", DisplayType: "Percent", VerifyStatus: "N", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 2 },
    { PageCode: "InspectionRequest", PercentageStatus: 0, PageId: 17, PageURL: "../Institute/InspectionRequest.aspx", PageNameDisplay: "Request For Inspection", BGColur: "#bfdbfe", DisplayType: "Percent", VerifyStatus: "N", AnchorTagTarget: "_self", DocumentPath: "", PageGroup: 2 },
];

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — API SERVICE LAYER
// ─────────────────────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

// Attach auth token if stored in localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/**
 * STEP 2 — API CALLS
 * GET ${BASE_URL}/Base/GetInstituteIDByInstituteCode
 * Returns array of stage items with PageGroup differentiator
 */
async function fetchDashboardStages(instituteCode) {
    const { data } = await api.get("/Base/GetInstituteIDByInstituteCode", {
        params: { instituteCode }, // adjust param name to match your API
    });
    // data should be an array of stage row objects
    return Array.isArray(data) ? data : data?.data ?? data?.result ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function VerifiedIcon() {
    return (
        <div className="flex flex-col items-center gap-1 transition-transform duration-300 group-hover:scale-110">
            <div className="relative w-12 h-12">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-green-400 bg-white" />
                {/* Inner check */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.8"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                {/* Small "VERIFIED" badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[0.45rem] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap tracking-wide">
                    VERIFIED
                </div>
            </div>
        </div>
    );
}

function DocumentIcon() {
    return (
        <div className="flex flex-col items-center transition-transform duration-300 group-hover:scale-110">
            <div className="relative w-10 h-12">
                <svg viewBox="0 0 40 48" fill="none" className="w-full h-full drop-shadow-sm">
                    {/* Page body */}
                    <rect x="2" y="2" width="30" height="38" rx="3" fill="#e8f0fe" stroke="#93c5fd" strokeWidth="2" />
                    {/* Folded corner */}
                    <path d="M22 2 L32 12 L22 12 Z" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1.5" strokeLinejoin="round" />
                    {/* Lines */}
                    <line x1="8" y1="20" x2="26" y2="20" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="26" x2="22" y2="26" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="32" x2="18" y2="32" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                    {/* Red bookmark dot */}
                    <circle cx="32" cy="8" r="6" fill="#ef4444" />
                </svg>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOI CARD  (Verified / Document)
// ─────────────────────────────────────────────────────────────────────────────
function LoiCard({ stage, index }) {
    const isVerified = stage.DisplayType === "Verified";
    const isDocument = stage.DisplayType === "Document";
    const hasDoc = !!stage.DocumentPath;

    return (
        <div style={{ animation: `fadeUp .4s ease both`, animationDelay: `${index * 55}ms`, opacity: 0 }}>
            <a
                href={stage.PageURL || "#"}
                target={stage.AnchorTagTarget}
                rel={stage.AnchorTagTarget === "_blank" ? "noopener noreferrer" : undefined}
                className="block no-underline group"
            >
                <div className="
          flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white
          shadow-sm cursor-pointer
          transition-all duration-300 ease-out
          group-hover:-translate-y-2 group-hover:scale-[1.04]
          group-hover:shadow-2xl group-hover:border-blue-200
        ">
                    {/* Top — icon */}
                    <div className="flex items-center justify-center h-[90px] bg-white
            transition-colors duration-300 group-hover:bg-slate-50">
                        {isVerified && <VerifiedIcon />}
                        {isDocument && <DocumentIcon />}
                    </div>

                    {/* Bottom — title */}
                    <div
                        className="flex items-center justify-center min-h-[44px] px-2 py-2
              border-t border-black/[0.07] transition-all duration-300 group-hover:brightness-95"
                        style={{ backgroundColor: stage.BGColur }}
                    >
                        <span className="text-[0.72rem] font-bold text-gray-700 text-center leading-snug
              group-hover:text-gray-900 transition-colors duration-300">
                            {stage.PageNameDisplay}
                        </span>
                    </div>
                </div>
            </a>

            {/* Download chip when DocumentPath present */}
            {hasDoc && (
                <a href={stage.DocumentPath} target="_blank" rel="noopener noreferrer"
                    className="mt-1.5 flex items-center justify-center gap-1 text-[0.6rem] font-semibold
            text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1
            hover:bg-orange-100 transition-colors duration-200">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 8V2H7v6H3l7 7 7-7h-4zm-7 10h8v2H6v-2z" />
                    </svg>
                    Download
                </a>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// INSPECTION CARD  (Percent)
// ─────────────────────────────────────────────────────────────────────────────
function InspectionCard({ stage, index }) {
    const pct = parseInt(stage.PercentageStatus) || 0;

    return (
        <div style={{ animation: `fadeUp .4s ease both`, animationDelay: `${index * 55}ms`, opacity: 0 }}>
            <a
                href={stage.PageURL || "#"}
                target={stage.AnchorTagTarget}
                rel={stage.AnchorTagTarget === "_blank" ? "noopener noreferrer" : undefined}
                className="block no-underline group"
            >
                <div className="
          flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white
          shadow-sm cursor-pointer
          transition-all duration-300 ease-out
          group-hover:-translate-y-2 group-hover:scale-[1.04]
          group-hover:shadow-2xl group-hover:border-blue-200
        ">
                    {/* Top — big percentage */}
                    <div className="flex items-center justify-center h-[72px] bg-white px-3
            transition-colors duration-300 group-hover:bg-slate-50">
                        <span className="text-3xl font-black text-gray-800 tracking-tight
              transition-all duration-300 group-hover:scale-110 inline-block group-hover:text-blue-600">
                            {pct}%
                        </span>
                    </div>

                    {/* Bottom — label with API bg color */}
                    <div
                        className="flex items-center justify-center min-h-[40px] px-2 py-2
              border-t border-black/[0.07] transition-all duration-300 group-hover:brightness-90"
                        style={{ backgroundColor: stage.BGColur }}
                    >
                        <span className="text-[0.7rem] font-bold text-white text-center leading-snug drop-shadow-sm">
                            {stage.PageNameDisplay}
                        </span>
                    </div>
                </div>
            </a>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON CARD
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard({ tall = false }) {
    return (
        <div className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
            <div className={`${tall ? "h-[90px]" : "h-[72px]"} bg-gray-100`} />
            <div className="h-[44px] bg-gray-50" />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function Section({ title, accentColor, done, total, children, loading, tall }) {
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <div className="mb-6">
            {/* Section heading */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full shrink-0" style={{ background: accentColor }} />
                    <h4 className="text-base font-bold text-gray-800 tracking-tight">{title}</h4>
                </div>

                {!loading && (
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
                        <span className="text-gray-500 font-medium">{done}/{total} done</span>
                        <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${progress}%`, background: accentColor }}
                            />
                        </div>
                        <span className="font-bold text-gray-700">{progress}%</span>
                    </div>
                )}
            </div>

            {/* Card grid */}
            <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} tall={tall} />)
                        : children}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BANNER
// ─────────────────────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
    return (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-300
      text-amber-800 text-sm rounded-xl px-4 py-3 mb-4 gap-4">
            <span>⚠️ {message} — showing cached data</span>
            <button onClick={onRetry}
                className="shrink-0 bg-amber-700 hover:bg-amber-800 text-white text-xs
          font-semibold px-3 py-1.5 rounded-lg transition-colors">
                Retry
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Props:
 *   instituteCode  – string  (e.g. "INST001")  passed from parent / router
 */
export default function InstituteDashboard({ instituteCode = "INST001" }) {
    const [allStages, setAllStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── STEP 3 — Fetch on mount / instituteCode change ────────────────────────
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const rows = await fetchDashboardStages(instituteCode);
            setAllStages(rows);
        } catch (err) {
            const msg =
                err.response?.data?.message ??
                err.response?.statusText ??
                err.message ??
                "Failed to load dashboard data.";
            setError(msg);
            setAllStages(MOCK_DATA); // graceful fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [instituteCode]);

    // ── STEP 4 — Split by PageGroup ───────────────────────────────────────────
    const loiStages = allStages.filter((s) => s.PageGroup === 1);
    const inspectionStages = allStages.filter((s) => s.PageGroup === 2);

    const loiDone = loiStages.filter((s) => parseInt(s.PercentageStatus) === 100).length;
    const inspectionDone = inspectionStages.filter((s) => parseInt(s.PercentageStatus) === 100).length;

    return (
        <>
            {/* Global keyframe */}
            <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

            <div className="w-full px-4 py-4 bg-gray-50 min-h-screen font-sans">

                {error && <ErrorBanner message={error} onRetry={fetchData} />}

                {/* ── LoI Stage ── */}
                <Section
                    title="LoI Stage"
                    accentColor="linear-gradient(180deg,#f59e0b,#ea580c)"
                    done={loiDone}
                    total={loiStages.length}
                    loading={loading}
                    tall
                >
                    {loiStages.map((stage, i) => (
                        <LoiCard key={`loi-${stage.PageCode}-${i}`} stage={stage} index={i} />
                    ))}
                </Section>

                {/* ── Inspection Stage ── */}
                <Section
                    title="Inspection Stage"
                    accentColor="linear-gradient(180deg,#3b82f6,#06b6d4)"
                    done={inspectionDone}
                    total={inspectionStages.length}
                    loading={loading}
                    tall={false}
                >
                    {inspectionStages.map((stage, i) => (
                        <InspectionCard key={`ins-${stage.PageCode}-${i}`} stage={stage} index={i} />
                    ))}
                </Section>

            </div>
        </>
    );
}

/*
───────────────────────────────────────────────────────────────────────────────
IMPLEMENTATION STEPS
───────────────────────────────────────────────────────────────────────────────

STEP 1 — Install dependencies
  npm install axios

STEP 2 — Update BASE_URL
  const BASE_URL = "https://your-real-api.com";

STEP 3 — Adjust API param name in fetchDashboardStages()
  params: { instituteCode }   →  match whatever your API expects
  e.g.  params: { InstituteCode: instituteCode }

STEP 4 — Add auth token if needed
  localStorage.setItem("authToken", "<jwt>");
  The axios interceptor will pick it up automatically.

STEP 5 — Use in parent page / router
  import InstituteDashboard from "./InstituteDashboard";
  <InstituteDashboard instituteCode="INST001" />
  or read from router:
  const { code } = useParams();
  <InstituteDashboard instituteCode={code} />

STEP 6 — Expected API response shape
  GET /Base/GetInstituteIDByInstituteCode?instituteCode=INST001
  Returns: Array of objects with these EXACT fields:
  {
    PageCode:          "InstitutePayment",
    PercentageStatus:  100,
    PageId:            1,
    PageURL:           "../Institute/InstitutePayment.aspx",
    PageNameDisplay:   "Registration Fee",
    BGColur:           "#fef3cd",
    DisplayType:       "Verified" | "Percent" | "Document",
    VerifyStatus:      "V" | "N" | "",
    AnchorTagTarget:   "_self" | "_blank",
    DocumentPath:      "https://..." | "",
    PageGroup:         1  ← LoI Stage
                       2  ← Inspection Stage
  }

STEP 7 — Remove MOCK_DATA and the fallback setAllStages(MOCK_DATA)
         once your real API is working.
───────────────────────────────────────────────────────────────────────────────
*/