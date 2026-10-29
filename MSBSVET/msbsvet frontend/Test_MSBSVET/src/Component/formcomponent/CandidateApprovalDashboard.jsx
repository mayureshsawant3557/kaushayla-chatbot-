import { useEffect, useState } from "react";
import { Users, UserCheck, FileCheck, Clock, XCircle } from "lucide-react";

// Keeps the exact count-up animation
const useCountUp = (target, duration = 900) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const end = Number(target) || 0;
        if (end === 0) {
            setValue(0);
            return;
        }
        const start = performance.now();
        let frameId;

        const easeOutQuad = (t) => t * (2 - t);

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(Math.floor(easeOutQuad(progress) * end));
            if (progress < 1) {
                frameId = requestAnimationFrame(step);
            } else {
                setValue(end);
            }
        };

        frameId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameId);
    }, [target, duration]);

    return value;
};

// Adapted themes matching the soft full-bleed backgrounds and distinct borders from the image
const THEMES = {
    blue: {
        wrapper: "bg-[#F2F7FD] border-[#C5D9F1]", // Light blue matching the "ACTIVE" card
        textMain: "text-[#1B4D82]",
        textMuted: "text-[#4A729A]",
        badge: "bg-[#2774C4] text-white", // Blue pill
    },
    indigo: {
        wrapper: "bg-[#F3F4F9] border-[#C7CEE5]",
        textMain: "text-[#2D3748]",
        textMuted: "text-[#4A5568]",
        badge: "bg-[#4A5568] text-white",
    },
    green: {
        wrapper: "bg-[#EEF6EB] border-[#A8CD8E]", // Soft green matching the "DONE" card
        textMain: "text-[#2A591B]",
        textMuted: "text-[#4B753E]",
        badge: "bg-[#BBD9A6] text-[#2A591B]", // Green pill
    },
    amber: {
        wrapper: "bg-[#FFFBF0] border-[#F0DC9C]",
        textMain: "text-[#855A1F]",
        textMuted: "text-[#A37B42]",
        badge: "bg-[#F0DC9C] text-[#855A1F]",
    },
    red: {
        wrapper: "bg-[#FEF5F5] border-[#F4C4C4]",
        textMain: "text-[#9B2C2C]",
        textMuted: "text-[#C55757]",
        badge: "bg-[#F4C4C4] text-[#9B2C2C]",
    },
};

const DashboardCard = ({ icon, theme, label, count, statusBadge }) => {
    const animatedCount = useCountUp(count);
    const t = THEMES[theme] || THEMES.blue;

    return (
        <div
            className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-[14px] border-[1.5px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${t.wrapper}`}
        >
            {/* Top Row: Label and Optional Status Pill */}
            <div className="flex items-start justify-between gap-2">
                <h3 className={`text-[15px] font-bold leading-tight tracking-wide ${t.textMain}`}>
                    {label}
                </h3>

                {statusBadge && (
                    <span className={`shrink-0 rounded-full px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-wider shadow-sm ${t.badge}`}>
                        {statusBadge}
                    </span>
                )}
            </div>

            {/* Bottom Row: Icon and Large Count */}
            <div className="mt-6 flex items-end justify-between">
                <div className={`opacity-80 transition-transform duration-300 group-hover:scale-110 ${t.textMuted}`}>
                    {icon}
                </div>
                <div className={`text-4xl font-extrabold tracking-tight ${t.textMain}`}>
                    {animatedCount.toLocaleString("en-IN")}
                </div>
            </div>
        </div>
    );
};

const CardSkeleton = () => (
    <div className="flex h-[130px] flex-col justify-between rounded-[14px] border-[1.5px] border-gray-200 bg-gray-50 p-5 shadow-sm animate-pulse">
        <div className="h-4 w-3/4 rounded bg-gray-300" />
        <div className="mt-6 flex items-end justify-between">
            <div className="h-8 w-8 rounded bg-gray-300" />
            <div className="h-10 w-16 rounded bg-gray-300" />
        </div>
    </div>
);

const CandidateApprovalDashboard = ({ data, loading }) => {
    const counts = {
        TotalRegistered: 0,
        Admitted: 0,
        Approved: 0,
        ApprovalPending: 0,
        ApprovalRejected: 0,
        ...data,
    };

    return (
        <div className="w-full p-4 mt-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                    <h5 className="mt-0.5 text-[19px] font-bold tracking-tight text-slate-800">
                        Candidate Approval Process Dashboard
                    </h5>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {[...Array(5)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <DashboardCard
                        icon={<Users size={28} strokeWidth={2.5} />}
                        theme="blue"
                        label="Total Registered"
                        count={counts.TotalRegistered}
                        statusBadge="Active"
                    />
                    <DashboardCard
                        icon={<UserCheck size={28} strokeWidth={2.5} />}
                        theme="indigo"
                        label="Total Admitted"
                        count={counts.Admitted}
                    />
                    <DashboardCard
                        icon={<FileCheck size={28} strokeWidth={2.5} />}
                        theme="green"
                        label="Approved Candidates"
                        count={counts.Approved}
                        statusBadge="Done"
                    />
                    <DashboardCard
                        icon={<Clock size={28} strokeWidth={2.5} />}
                        theme="amber"
                        label="Approval Pending"
                        count={counts.ApprovalPending}
                        statusBadge="Wait"
                    />
                    <DashboardCard
                        icon={<XCircle size={28} strokeWidth={2.5} />}
                        theme="red"
                        label="Approval Rejected"
                        count={counts.ApprovalRejected}
                    />
                </div>
            )}
        </div>
    );
};

export default CandidateApprovalDashboard;