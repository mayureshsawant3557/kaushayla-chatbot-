import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import govLogo from '../../assets/independencedayindia20.jpg'
import boardLogo from '../../assets/Board Logo - small size.jpg'
import agent from '../../lib/api/agent'
import useLoading from '../../Hooks/useLoading'
import { GetCourseByID } from '../../Endpoints_All/MasterMgmt/CourseDetails'

const CourseSummary = () => {
    const { startLoading, stopLoading } = useLoading()
    const [searchParams] = useSearchParams()
    const [courseDetails, setCourseDetails] = useState(null)
    const [error, setError] = useState(null)
const hasPrinted = useRef(false)  
    const courseId = searchParams.get('P1')

    useEffect(() => {
        if (courseId) fetchCourseDetails()
    }, [courseId])

    const fetchCourseDetails = async () => {
        startLoading()
        try {
            const res = await agent.get(GetCourseByID, {
                params: { CourseID: courseId }
            })

            const json = res.data
          if (json?.Status === 'Success') {
    setCourseDetails(json.Data)
    
    if (!hasPrinted.current) {
        hasPrinted.current = true
        setTimeout(() => {
            window.print()
        }, 800)
    }
} else {
    setError('Course not found.')
}
        } catch (err) {
            console.error('Error loading course details', err)
            setError('Failed to load course details.')
        } finally {
            stopLoading()
        }
    }

  
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
        )
    }

    if (!courseDetails) return null

    const d = courseDetails

    return (
        <div className="bg-white p-4 md:p-10 min-h-screen">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        @media print {
                            .no-print { display: none; }
                            body { background-color: white !important; }
                            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    `
                }}
            />

            <div className="max-w-full mx-auto bg-white border border-black shadow-sm">

                {/* ── HEADER ── */}
                <div className="p-4 border-b border-black">
                    <div className="flex justify-between items-center text-center">
                        <img src={govLogo} alt="Gov Emblem" className="h-20" />
                        <div className="flex-1 px-4">
                            <h1 className="text-sm font-semibold">Government of Maharashtra</h1>
                            <h2 className="text-sm">Skill, Employment, Entrepreneurship and Innovation Department</h2>
                            <h2 className="text-md font-bold text-blue-900">
                                Maharashtra State Board of Skill, Vocational Education and Training
                            </h2>
                            <h3 className="text-lg font-bold tracking-widest mt-1">COURSE SUMMARY</h3>
                        </div>
                        <img src={boardLogo} alt="Board Logo" className="h-20" />
                    </div>
                </div>

              
                {/* <div className="flex justify-center my-3 no-print">
                    <button
                        onClick={handlePrint}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-1 px-6 rounded shadow-sm text-sm"
                    >
                        Print
                    </button>
                </div> */}

                {/* ── MAIN CONTENT ── */}
                <div className="overflow-x-auto p-4">
                    <table className="w-full border-collapse border border-black text-sm">
                        <tbody>

                            {/* ── COURSE INFO SECTION HEADER ── */}
                            <tr className="bg-gray-100">
                                <th colSpan={4} className="text-center p-2 border border-black font-bold">
                                    Course Information
                                </th>
                            </tr>

                            <DetailRow label="Course Name" value={d.CourseNameDisplay} />
                            <DetailRow label="Sector" value={d.Sector} />
                            <DetailRow label="Sub Sector" value={d.SubSector} />
                            <DetailRow label="Course Approved by" value={d.CourseApprovedBy} />

                            <tr>
                                <td className="p-2 border border-black font-semibold bg-gray-50 w-1/4">Course Category</td>
                                <td className="p-2 border border-black w-1/4">{d.CourseCategory || 'N/A'}</td>
                                <td className="p-2 border border-black font-semibold bg-gray-50 w-1/4">Course Type</td>
                                <td className="p-2 border border-black w-1/4">{d.CourseType || 'N/A'}</td>
                            </tr>

                            <tr>
                                <td className="p-2 border border-black font-semibold bg-gray-50">Intake per Unit</td>
                                <td className="p-2 border border-black">{d.IntakePerUnit || 'N/A'}</td>
                                <td className="p-2 border border-black font-semibold bg-gray-50">NSQF Level</td>
                                <td className="p-2 border border-black">{d.NSQFLevel || 'N/A'}</td>
                            </tr>

                            <tr>
                                <td className="p-2 border border-black font-semibold bg-gray-50">Training Fee Category</td>
                                <td className="p-2 border border-black">{d.TrainingFeeCategory || 'N/A'}</td>
                                <td className="p-2 border border-black font-semibold bg-gray-50">Minimum Age</td>
                                <td className="p-2 border border-black">{d.MinAge || 'N/A'}</td>
                            </tr>

                            <DetailRow label="Training Mode" value={d.TrainingMode} />

                            {/* ── DURATION SECTION HEADER ── */}
                            <tr className="bg-gray-100">
                                <th colSpan={4} className="text-center p-2 border border-black font-bold">
                                    Duration in Hours
                                </th>
                            </tr>

                            <tr>
                                <td colSpan={4} className="p-0">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 text-center font-semibold">
                                                <th className="p-2 border border-black font-semibold">Theory</th>
                                                <th className="p-2 border border-black font-semibold">Practical</th>
                                                <th className="p-2 border border-black font-semibold">OJT Mandatory</th>
                                                <th className="p-2 border border-black font-semibold">OJT Optional</th>
                                                <th className="p-2 border border-black font-semibold">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="text-center">
                                                <td className="p-2 border border-black">{d.TheoryDurationDisplay || '-'}</td>
                                                <td className="p-2 border border-black">{d.PracticalDurationDisplay || '-'}</td>
                                                <td className="p-2 border border-black">{d.OJTMandatoryDurationDisplay || '-'}</td>
                                                <td className="p-2 border border-black">{d.OJTOptionalDurationDisplay || '-'}</td>
                                                <td className="p-2 border border-black">{d.TotalDurationDisplay || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            {/* ── ADMISSION & CERTIFICATION SECTION HEADER ── */}
                            <tr className="bg-gray-100">
                                <th colSpan={4} className="text-center p-2 border border-black font-bold">
                                    Admission and Certification
                                </th>
                            </tr>

                            <tr>
                                <td className="p-2 border border-black font-semibold bg-gray-50 w-1/4">Admission Fees</td>
                                <td className="p-2 border border-black w-1/4">{d.AdmissionFees ?? 'N/A'}</td>
                                <td className="p-2 border border-black font-semibold bg-gray-50 w-1/4">Exam / Assessment Fees</td>
                                <td className="p-2 border border-black w-1/4">{d.ExamAssesmentFee ?? 'N/A'}</td>
                            </tr>

                            {/* ── MINIMUM ENTRY QUALIFICATION SECTION HEADER ── */}
                            <tr className="bg-gray-100">
                                <th colSpan={4} className="text-center p-2 border border-black font-bold">
                                    Minimum Entry Qualification
                                </th>
                            </tr>

                            <tr>
                                <td colSpan={4} className="p-0">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 text-center font-semibold">
                                                <th className="p-2 border border-black font-semibold w-16">Sr. No.</th>
                                                <th className="p-2 border border-black font-semibold">Qualification</th>
                                                <th className="p-2 border border-black font-semibold">Mandatory Criteria</th>
                                                <th className="p-2 border border-black font-semibold">Experience in Months</th>
                                                <th className="p-2 border border-black font-semibold">Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {d.MinimumEntryQualificationEntity?.length > 0 ? (
                                                d.MinimumEntryQualificationEntity.map((q, i) => (
                                                    <tr key={q.QualificationRowID ?? i} className="text-center">
                                                        <td className="p-2 border border-black">{i + 1}.</td>
                                                        <td className="p-2 border border-black text-left px-2">{q.Qualification || ''}</td>
                                                        <td className="p-2 border border-black">{q.MandatoryCriteria || ''}</td>
                                                        <td className="p-2 border border-black">{q.ExperienceInMonth || ''}</td>
                                                        <td className="p-2 border border-black">{q.Remark || ''}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="p-2 border border-black text-center text-gray-400">
                                                        No Qualification Added
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ── HELPER ──
const DetailRow = ({ label, value }) => (
    <tr>
        <td className="p-2 border border-black font-semibold bg-gray-50 w-1/4">{label}</td>
        <td colSpan={3} className="p-2 border border-black">
            {value || 'N/A'}
        </td>
    </tr>
)

export default CourseSummary