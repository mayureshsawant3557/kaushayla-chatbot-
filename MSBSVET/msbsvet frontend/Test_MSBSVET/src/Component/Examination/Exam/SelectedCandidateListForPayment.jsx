
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FaBars } from 'react-icons/fa'
import FilteredTableComponent from '../../../Component/formcomponent/FilteredTableComponent'
import Button from '../../base/Button'
import agent from '../../../lib/api/agent'
import { GetFeeCartItems } from '../../../Endpoints_All/Fee/feeManagement'
import { SwalHelper } from '../../../utils/swalHelper'

const FeeSummaryColumn = [
  { header: 'Total Selected Candidate', key: 'TotalCandidate', width: '120px', className: 'text-center', headerClassName: 'text-center' },
  { header: 'Total Board Fee (Rs.)', key: 'BoardFee', width: '120px', className: 'text-center', headerClassName: 'text-center' },
  { header: 'Total Assessment Fee (Rs.)', key: 'AssessmentFee', width: '120px', className: 'text-center', headerClassName: 'text-center' },
  { header: 'Total Exam Fee To Pay (Rs.)', key: 'ExamFee', width: '120px', className: 'text-center', headerClassName: 'text-center' },
]

const candidateColumns = [
  { header: 'Sr. No.', key: 'SrNo', width: '60px', className: 'text-center', headerClassName: 'text-center' },
  { header: 'Exam Type', key: 'ExamType', width: '60px', className: 'text-center', headerClassName: 'text-center' },
  { header: 'Application ID', key: 'ApplicationIDDisplay', width: '180px', className: 'text-center' },
  { header: 'Candidate Name', key: 'CandidateName', width: '280px', className: 'text-left' },
  { header: 'Payable Fees', key: 'ExamFee', width: '120px', className: 'text-center' },
]

// ── InfoField: dark label + bold value ──────────────────────────────────────
const InfoField = ({ label, value }) => (
  <div className="flex flex-col gap-1 rounded-md border px-4 py-3"
    style={{ background: '#f0f4ff', borderColor: '#c7d7fa' }}>
    <span className="text-xs font-bold uppercase tracking-wide"
      style={{ color: '#1e3a8a' }}>
      {label}
    </span>
    <span className="text-sm font-bold"
      style={{ color: '#0a0a0a' }}>
      {value || '—'}
    </span>
  </div>
)

// ── StatCard: light pastel bg + dark text ────────────────────────────────────
const colorMap = {
  green:  { bg: '#d1fae5', border: '#6ee7b7', label: '#064e3b', dot: '#10b981' },
  blue:   { bg: '#dbeafe', border: '#93c5fd', label: '#1e3a8a', dot: '#3b82f6' },
  purple: { bg: '#ede9fe', border: '#c4b5fd', label: '#4c1d95', dot: '#8b5cf6' },
  amber:  { bg: '#fef3c7', border: '#fcd34d', label: '#78350f', dot: '#f59e0b' },
}

const StatCard = ({ label, value, colorClass }) => {
  const c = colorMap[colorClass]
  return (
    <div style={{
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: '14px',
      padding: '20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot, marginBottom: '2px' }} />
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: c.label }}>
        {label}
      </span>
      <span style={{ fontSize: '26px', fontWeight: 700, color: '#0a0a0a' }}>
        {value}
      </span>
    </div>
  )
}

const SelectedCandidatesForPayment = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const cartId = searchParams.get('cartId')
  const [courseData, setCourseData] = useState([])
  const [candidateData, setCandidateData] = useState([])

  useEffect(() => {
    if (!cartId) return
    const getCartDetails = async () => {
      try {
        const response = await agent.post(`${GetFeeCartItems}?CartId=${cartId}`)
        const course = Array.isArray(response.data?.Data[0]) ? response.data.Data[0] : []
        const candidates = Array.isArray(response.data?.Data[1])
          ? response.data.Data[1].map((item, index) => ({ ...item, SrNo: index + 1 }))
          : []
        setCourseData(course)
        setCandidateData(candidates)
      } catch (error) {
        SwalHelper.error(error.message || 'Failed to fetch cart details. Please try again.')
      }
    }
    getCartDetails()
  }, [cartId])

  const handleShowFeeInfo = () => {
    if (!candidateData || !cartId || !courseData) return
    navigate(`/Exam/FeeInfo?A1=${cartId}&PhaseId=2`)
  }

  const summary = courseData[0] || {}

  return (
    <div className="mx-auto w-full p-6 space-y-5">

      {/* ── Fee Summary Section ── */}
      <fieldset className="rounded-lg border border-gray-200">
        <legend className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md ml-4 text-sm font-semibold">
          <FaBars className="mr-2" />
          Fee Summary for Current Payment
        </legend>

        <div className="p-5 space-y-4">
          {/* Course Code + Name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoField label="Course Code" value={summary?.CourseCode} />
            <div className="md:col-span-2">
              <InfoField label="Course Name" value={summary?.CourseName} />
            </div>
          </div>

          {/* Batch + Exam + Dates */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <InfoField label="Batch ID" value={summary?.BatchID} />
            <InfoField label="Exam Type" value={summary?.ExamType} />
            <InfoField label="Batch Start Date" value={summary?.BatchStartDate} />
            <InfoField label="Batch End Date" value={summary?.BatchEndDate} />
          </div>
        </div>
      </fieldset>

      {/* ── Fee Breakdown Section ── */}
      <fieldset className="rounded-lg border border-gray-200">
        <legend className="flex items-center bg-teal-700 text-white px-4 py-2 rounded-md ml-4 text-sm font-semibold">
          <FaBars className="mr-2" />
          Fee Breakdown
        </legend>

        <div className="p-5 space-y-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard
              label="Total Candidates"
              value={summary?.TotalCandidate ?? '—'}
              colorClass="green"
            />
            <StatCard
              label="Board Fee (Rs.)"
              value={summary?.BoardFee ? `₹ ${summary.BoardFee}` : '—'}
              colorClass="blue"
            />
            <StatCard
              label="Assessment Fee (Rs.)"
              value={summary?.AssessmentFee ? `₹ ${summary.AssessmentFee}` : '—'}
              colorClass="purple"
            />
            <StatCard
              label="Total Exam Fee to Pay (Rs.)"
              value={summary?.ExamFee ? `₹ ${summary.ExamFee}` : '—'}
              colorClass="amber"
            />
          </div>

          {/* Hidden fee table for export */}
          <div className="hidden">
            <FilteredTableComponent
              data={courseData ?? []}
              columns={FeeSummaryColumn}
              searchable={false}
              showExport={false}
              showExcelTemplate={false}
              showPDF={false}
              sortable={false}
            />
          </div>

          <div className="flex justify-center pt-2">
            <Button variant="success" onClick={handleShowFeeInfo}>
              Proceed to Pay
            </Button>
          </div>
        </div>
      </fieldset>

      {/* ── Selected Candidate List Section ── */}
      <fieldset className="rounded-lg border border-gray-200">
        <legend className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-md ml-4 text-sm font-semibold">
          <FaBars className="mr-2" />
          Selected Candidate List for Current Payment
        </legend>

        <div className="p-5">
          <FilteredTableComponent
            data={candidateData ?? []}
            columns={candidateColumns}
            searchable={true}
            showExport={false}
            showExcelTemplate={false}
            showPDF={false}
            sortable={true}
          />
        </div>
      </fieldset>

    </div>
  )
}

export default SelectedCandidatesForPayment