
import React, { useState, useEffect, useRef } from 'react'
import agent from '../../lib/api/agent'
import BoardLogo from '../../assets/Board Logo - small size.jpg'
import independencedayindia from '../../assets/independencedayindia20.jpg'
import { useLoading } from '../../Hooks/useLoading'

import {
    candidateforattendance,
    SubjectAttendanceByBatchID,
    AttendanceByBatchID
} from '../../Endpoints_All/Examination/Exam'


const LoadingSpinner = () => (
    <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>Loading...</span>
    </div>
)


export default function SeatingArrangementDetails() {
    const { startLoading, stopLoading, isLoading } = useLoading()

    const [batchID, setBatchID] = useState(null)
    const [subjectType, setSubjectType] = useState(null)

    const [attendanceData, setAttendanceData] = useState(null)

    const [subjectList, setSubjectList] = useState([])

    const [candidateList, setCandidateList] = useState([])

    const [error, setError] = useState(null)
    const dataFetchedRef = useRef(false)


    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const p1 = params.get('P1')
const p2 = params.get('P2')
        if (p1 && p2) {
            setBatchID(Number(p1))
            setSubjectType(p2)
        } else {
            setError('Missing BatchID or SubjectType in URL.')
        }
    }, [])

    useEffect(() => {
        if (!batchID || !subjectType || dataFetchedRef.current) return
        dataFetchedRef.current = true
        fetchAllData()
    }, [batchID, subjectType])

    useEffect(() => {
        if (!isLoading && candidateList.length > 0) {
            const timer = setTimeout(() => window.print(), 2000)
            return () => clearTimeout(timer)
        }
    }, [isLoading, candidateList])

    const fetchAllData = async () => {
        startLoading()
        try {
            const res1 = await agent.get(
                `${candidateforattendance}?batchId=${batchID}&subjectType=${subjectType}`
            )
            const data1 = res1.data?.Data
            const header = data1?.Table?.[0] || null
            setAttendanceData(header)

            const res2 = await agent.get(`${SubjectAttendanceByBatchID}?batchId=${batchID}`)
            if (res2.data?.Status === 'Success') {
                setSubjectList(res2.data?.Data?.Table || [])
            }

            const res3 = await agent.get(`${AttendanceByBatchID}?batchId=${batchID}`)
            if (res3.data?.Status === 'Success' && res3.data?.Data?.Table?.length > 0) {
                setCandidateList(res3.data.Data.Table)
            } else {
                setCandidateList(data1?.Table1 || [])
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setError('Failed to load attendance data.')
        } finally {
            stopLoading()
        }
    }

    const fmt = (val, fallback = 'NA') => val ?? fallback
    const fmtDate = d => (!d || d.startsWith('0001') ? '—' : d.substring(0, 10))

    const selectedSubject = subjectList.find(
        s => s.ExamSubjectType?.toLowerCase() === subjectType?.toLowerCase()
    )

    const totalCandidates = candidateList.length

    const totalPresent = candidateList.filter(c => c.IsPresent === true || c.Attendance === 'P').length
    const totalAbsent = candidateList.filter(c => c.IsPresent === false || c.Attendance === 'A').length

    if (error)
        return (
            <div className='bg-gray-100 min-h-screen flex items-center justify-center'>
                <div className='bg-red-50 border border-red-300 text-red-700 p-6 rounded'>
                    {error}
                </div>
            </div>
        )

    const p = attendanceData

    return (
        <div className='bg-white p-4 md:p-10 min-h-screen'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
      @media print {
  @page {
    size: A4;
    margin: 10mm;
  }
}

        .print-container {
          width: 100%;
          transform: scale(0.95); 
          transform-origin: top left;
        }

        table {
          font-size: 11px !important; 
        }

        th, td {
          padding: 4px !important; 
        }

        h1, h2, h3 {
          margin: 2px 0 !important;
        }

        img {
          max-height: 60px !important;
        }

        .no-print {
          display: none !important;
        }
      }
    `,
                }}
            />

            <div className='print-container max-w-full mx-auto bg-white border border-black shadow-sm'>
                {/* <div className='max-w-full mx-auto bg-white border border-black shadow-sm'> */}

                <div className='p-4 border-b border-black'>
                    <div className='flex justify-between items-center text-center'>
                        <img src={independencedayindia} alt='Emblem' className='h-20' />
                        <div className='flex-1 px-4'>
                            <h1 className='text-sm font-semibold'>Government of Maharashtra</h1>
                            <h2 className='text-sm'>
                                Skill, Employment, Entrepreneurship and Innovation Department
                            </h2>
                            <h2 className='text-md font-bold text-blue-900'>
                                Maharashtra State Board of Skill, Vocational Education and Training
                            </h2>
                            <h3 className='text-lg font-bold mt-1'>SEATING ARRANGEMENT</h3>
                        </div>
                        <img src={BoardLogo} alt='Logo' className='h-20' />
                    </div>
                </div>

                <div className='overflow-x-auto p-4'>

                    <table className='w-full border-collapse border border-black text-sm'>
                        <tbody>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/6'>
                                    Exam Center
                                </td>
                                <td className='p-2 border border-black' colSpan={5}>
                                    {fmt(p?.TheoryCenterCode)} – {fmt(p?.TheoryCenter)}
                                </td>
                            </tr>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>Course</td>
                                <td className='p-2 border border-black' colSpan={5}>
                                    {fmt(p?.CourseCode)} – {fmt(p?.CourseName)}
                                </td>
                            </tr>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>Batch ID</td>
                                <td className='p-2 border border-black'>{fmt(p?.BatchID)}</td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Subject Type
                                </td>
                                <td className='p-2 border border-black' colSpan={3}>
                                    {fmt(selectedSubject?.ExamSubjectType ?? subjectType)}
                                </td>
                            </tr>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>Subject</td>
                                <td className='p-2 border border-black' colSpan={5}>
                                    {fmt(selectedSubject?.SubjectCode)} – {fmt(selectedSubject?.SubjectName)}
                                </td>
                            </tr>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Examination
                                </td>
                                <td className='p-2 border border-black'>
                                    {fmt(selectedSubject?.ExamSession ?? p?.ExamType)}
                                </td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Date of Exam
                                </td>
                                <td className='p-2 border border-black'>
                                    {fmt(selectedSubject?.ExamDate
                                        ? fmtDate(selectedSubject.ExamDate)
                                        : fmtDate(p?.ExamStartDate))}
                                </td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Timing
                                </td>
                                <td className='p-2 border border-black'>
                                    {fmt(selectedSubject?.ExamTime)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className='mt-2'>
                        <div className='bg-gray-50 p-2 border border-black font-bold text-sm'>
                            List of Examinee
                        </div>
                        <table className='w-full border border-black border-collapse text-sm'>
                            <thead>
                                <tr className='bg-gray-100'>
                                    <th className='border border-black p-2'>Sr. No.</th>
                                    <th className='border border-black p-2'>Institute Code</th>
                                    <th className='border border-black p-2'>Application ID</th>
                                    <th className='border border-black p-2'>Candidate Name</th>
                                    <th className='border border-black p-2'>Gender</th>
                                    <th className='border border-black p-2 w-28'>
                                        Room No.
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidateList.length > 0 ? (
                                    candidateList.map((c, index) => (
                                        <tr key={index}>
                                            <td className='border border-black p-2 text-center'>
                                                {index + 1}
                                            </td>
                                            <td className='border border-black p-2'>
                                                {c.InstituteCode ?? c.CollegeID}
                                            </td>
                                            <td className='border border-black p-2'>
                                                {c.ApplicationIDDisplay}
                                            </td>
                                            <td className='border border-black p-2'>
                                                {c.CandidateName}
                                            </td>
                                            <td className='border border-black p-2 text-center'>
                                                {c.Gender}
                                            </td>
                                            {/* <td className='border border-black p-2 text-center'>
                                                
                                            </td> */}
                                            {/* <td className='border border-black p-2'>
                                                
                                            </td> */}
                                            <td className='border border-black p-2'>
                                                <div className='h-10' />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan='8' className='text-center p-3 text-gray-500 italic'>
                                            No Examinee Data Available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Totals ── */}
                    <table className='w-full border-collapse border border-black text-sm mt-2'>
                        <tbody>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/6'>
                                    Total Candidates
                                </td>
                                <td className='p-2 border border-black font-bold'>
                                    {totalCandidates}
                                </td>
                                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/6'>
                                    Total Present
                                </td>
                                <td className='p-2 border border-black'>
                                    {totalPresent || ''}
                                </td>
                                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/6'>
                                    Total Absent
                                </td>
                                <td className='p-2 border border-black'>
                                    {totalAbsent || ''}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className='mt-2'>
                        <div className='bg-gray-50 p-2 border border-black font-bold text-sm'>
                            Instructions
                        </div>
                        <ol className='list-decimal list-inside p-4 text-sm space-y-1 border border-black border-t-0'>
                            <li>
                                Exam Center to write Room No. for every candidate appearing for examination.
                            </li>
                            <li>
                                Display the Seating Arrangement at the entrance of Institute and exam hall.
                            </li>
                            <li>
                                No candidate other than the above mentioned candidates to be permitted in the exam hall.
                            </li>
                        </ol>
                    </div>

                    <table className='w-full border-collapse border border-black text-sm mt-2'>
                        <tbody>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/6'>
                                    Printed on :
                                </td>
                                <td className='p-2 border border-black'>
                                    {new Date().toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false,
                                    })}
                                </td>
                                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/6'>
                                    Printed by :
                                </td>
                                <td className='p-2 border border-black font-semibold'>
                                    {fmt(candidateList?.[0]?.InstituteCode ?? candidateList?.[0]?.CollegeID)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table className='w-full border-collapse border border-black text-sm mt-2'>
                        <tbody>
                            <tr>
                                <td
                                    colSpan={2}
                                    className='p-2 border border-black text-center font-semibold'
                                >
                                    Institute Head
                                </td>
                            </tr>
                            <tr>
                                <td className='p-2 border border-black text-center font-semibold w-1/2'>
                                    Supervisor
                                </td>
                                <td className='p-2 border border-black text-center font-semibold w-1/2'>
                                    Exam Center In-charge
                                </td>
                            </tr>
                            <tr>
                                <td className='border border-black p-2 w-1/2'>
                                    <div className='text-xs text-gray-600 mb-1'>Signature and Stamp :</div>
                                    <div className='h-14' />
                                    <div className='text-xs text-gray-600'>Name :</div>
                                    <div className='h-6' />
                                </td>
                                <td className='border border-black p-2 w-1/2'>
                                    <div className='text-xs text-gray-600 mb-1'>Signature and Stamp :</div>
                                    <div className='h-14' />
                                    <div className='text-xs text-gray-600'>Name :</div>
                                    <div className='h-6' />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className='mt-4 mb-2 text-center text-sm font-semibold'>
                        This is system generated Attendance Report
                    </div>
                    <hr className='border-gray-600' />
                    <div className='mt-2 text-center text-sm font-bold'>!! कौशल्यम् बलम् !!</div>
                </div>
            </div>
        </div>
    )
}
