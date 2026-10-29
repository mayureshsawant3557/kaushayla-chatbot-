/* =============================================================================
   Module : STT -> Batch Result Report
   File   : src/Component/SuperAdmin/Reports/STTBatchResultReport/STTBatchResultKpiCards.jsx
   Purpose: KPI card grid. Pure presentational component driven by the `summary`
            object returned by ExamSTT_BatchResultReport_GetSummary.
            Tailwind card style consistent with the app's dashboard cards.
   ============================================================================= */
import React from "react";
import {
    Users,
    Layers,
    CheckCircle2,
    XCircle,
    UserX,
    Percent,
    ClipboardCheck,
} from "lucide-react";

const num = (v) => Number(v ?? 0).toLocaleString("en-IN");

const STTBatchResultKpiCards = ({ summary, loading }) => {
    const s = summary || {};

    // "Status" KPI is represented as Completed Batches (batches with a finalised
    // assessment status) — the most meaningful status metric for this report.
    const cards = [
        { key: "total", label: "Total Candidates", value: num(s.TotalCandidates), icon: Users, accent: "text-blue-600", ring: "bg-blue-50" },
        { key: "batches", label: "Batch Count", value: num(s.BatchCount), icon: Layers, accent: "text-indigo-600", ring: "bg-indigo-50" },
        { key: "completed", label: "Completed Batches", value: num(s.CompletedBatchCount), icon: ClipboardCheck, accent: "text-teal-600", ring: "bg-teal-50" },
        { key: "pass", label: "Pass", value: num(s.PassCount), icon: CheckCircle2, accent: "text-green-600", ring: "bg-green-50" },
        { key: "fail", label: "Fail", value: num(s.FailCount), icon: XCircle, accent: "text-red-600", ring: "bg-red-50" },
        { key: "absent", label: "Absent", value: num(s.AbsentCount), icon: UserX, accent: "text-amber-600", ring: "bg-amber-50" },
        {
            key: "avg",
            label: "Average Result %",
            value: `${Number(s.AverageResultPercentage ?? 0).toFixed(2)}%`,
            icon: Percent,
            accent: "text-purple-600",
            ring: "bg-purple-50",
        },
    ];

    return (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 lg:gap-4">
            {cards.map((c) => {
                const Icon = c.icon;
                return (
                    <div
                        key={c.key}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md"
                    >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${c.ring}`}>
                            <Icon className={`h-5 w-5 ${c.accent}`} />
                        </div>
                        {loading ? (
                            <div className="h-7 w-14 my-1 rounded bg-gray-200 animate-pulse" />
                        ) : (
                            <div className={`text-xl lg:text-2xl font-bold ${c.accent}`}>{c.value}</div>
                        )}
                        <div className="text-xs text-gray-600 font-medium mt-1 leading-tight">{c.label}</div>
                    </div>
                );
            })}
        </section>
    );
};

export default STTBatchResultKpiCards;
