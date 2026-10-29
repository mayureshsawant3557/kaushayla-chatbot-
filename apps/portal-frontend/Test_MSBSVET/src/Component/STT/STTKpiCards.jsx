/* =============================================================================
   Module : STT Assessment Marks Entry
   File   : src/Component/STT/STTKpiCards.jsx
   Purpose: Sticky KPI dashboard shown above the grid.
              Row 1 : Total Candidates | Pending | Marks Entered
              Row 2 : Absent | Pass | Fail | Average Percentage
   ============================================================================= */
import React from "react";
import {
  Users,
  Clock,
  CheckSquare,
  UserX,
  BadgeCheck,
  XCircle,
  Percent,
} from "lucide-react";

const Card = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex items-center gap-3">
    <div className={`p-2 rounded-md ${accent}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 truncate">{label}</p>
      <p className="text-xl font-bold text-gray-800 leading-tight">{value}</p>
    </div>
  </div>
);

export default function STTKpiCards({ kpis }) {
  const k = kpis || {};

  return (
    <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80 py-3 mb-3">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <Card icon={Users} label="Total Candidates" value={k.totalCandidates ?? 0} accent="bg-slate-600" />
        <Card icon={Clock} label="Pending" value={k.pending ?? 0} accent="bg-amber-500" />
        <Card icon={CheckSquare} label="Marks Entered" value={k.marksEntered ?? 0} accent="bg-indigo-600" />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card icon={UserX} label="Absent" value={k.absent ?? 0} accent="bg-gray-500" />
        <Card icon={BadgeCheck} label="Pass" value={k.pass ?? 0} accent="bg-green-600" />
        <Card icon={XCircle} label="Fail" value={k.fail ?? 0} accent="bg-red-600" />
        <Card
          icon={Percent}
          label="Average Percentage"
          value={`${(k.averagePercentage ?? 0).toFixed(2)}%`}
          accent="bg-cyan-600"
        />
      </div>
    </div>
  );
}
