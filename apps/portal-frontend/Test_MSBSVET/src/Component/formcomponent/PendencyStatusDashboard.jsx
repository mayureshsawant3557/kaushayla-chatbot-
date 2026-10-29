import { useEffect, useState } from "react";
import { PenLine, CalendarClock, LockOpen, CheckSquare } from "lucide-react";

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

const THEMES = {
    teal: {
        wrapper: "bg-[#EAF4F4] border-[#B2D8D8]",
        textMain: "text-[#2C6E6E]",
        textMuted: "text-[#4F9494]",
        badge: "bg-[#B2D8D8] text-[#2C6E6E]",
    },
    amber: {
        wrapper: "bg-[#FFFBF0] border-[#F0DC9C]",
        textMain: "text-[#855A1F]",
        textMuted: "text-[#A37B42]",
        badge: "bg-[#F0DC9C] text-[#855A1F]",
    },
    navy: {
        wrapper: "bg-[#F2F7FD] border-[#C5D9F1]",
        textMain: "text-[#1B4D82]",
        textMuted: "text-[#4A729A]",
        badge: "bg-[#C5D9F1] text-[#1B4D82]",
    },
    green: {
        wrapper: "bg-[#EEF6EB] border-[#A8CD8E]",
        textMain: "text-[#2A591B]",
        textMuted: "text-[#4B753E]",
        badge: "bg-[#BBD9A6] text-[#2A591B]",
    },
};

const PendencyCard = ({ icon, theme, label, count, total }) => {
    const animatedCount = useCountUp(count);
    const t = THEMES[theme] || THEMES.teal;
    const share = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div
            className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-[14px] border-[1.5px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${t.wrapper}`}
        >
            {/* Top Row: Label and Percentage Pill */}
            <div className="flex items-start justify-between gap-2">
                <h3 className={`text-[15px] font-bold leading-tight tracking-wide ${t.textMain}`}>
                    {label}
                </h3>

                {/* Replaced the progress bar with a clean pill badge */}
                <span className={`shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-wider shadow-sm ${t.badge}`}>
                    {share}%
                </span>
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


const PendencyStatusDashboard = ({ data, loading }) => {
    const counts = {
        InComplete: 0,
        PendingApproval: 0,
        WithdrawVerification: 0,
        Verified: 0,
        ...data,
    };

    const total =
        counts.InComplete +
        counts.PendingApproval +
        counts.WithdrawVerification +
        counts.Verified;

    return (
        <div className="w-full p-4 mt-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                    <h5 className="mt-0.5 text-[19px] font-bold tracking-tight text-slate-800">
                        Promoting Organisation Status
                    </h5>
                </div>
                {!loading && (
                    <p className="text-sm text-slate-500">
                        Total Cases:{" "}
                        <span className="font-semibold text-slate-700">
                            {total.toLocaleString("en-IN")}
                        </span>
                    </p>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <PendencyCard
                        icon={<PenLine size={28} strokeWidth={2.5} />}
                        theme="teal"
                        label="In-Complete"
                        count={counts.InComplete}
                        total={total}
                    />
                    <PendencyCard
                        icon={<CalendarClock size={28} strokeWidth={2.5} />}
                        theme="amber"
                        label="Pending Approval"
                        count={counts.PendingApproval}
                        total={total}
                    />
                    <PendencyCard
                        icon={<LockOpen size={28} strokeWidth={2.5} />}
                        theme="navy"
                        label="Withdraw Verification"
                        count={counts.WithdrawVerification}
                        total={total}
                    />
                    <PendencyCard
                        icon={<CheckSquare size={28} strokeWidth={2.5} />}
                        theme="green"
                        label="Verified"
                        count={counts.Verified}
                        total={total}
                    />
                </div>
            )}
        </div>
    );
};

export default PendencyStatusDashboard;