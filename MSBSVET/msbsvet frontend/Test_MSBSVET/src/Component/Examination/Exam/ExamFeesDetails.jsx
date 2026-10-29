// import FilteredTableComponent from '../../../Component/formcomponent/FilteredTableComponent'
// import { useEffect, useState } from 'react'
// import FormComponent from '../../../Component/formcomponent/FormComponent'
// import Button from '../../base/Button'
// import DropdownComponent from '../../../Component/formcomponent/DropdownComponent'
// import agent from '../../../lib/api/agent'
// import { SwalHelper } from '../../../utils/swalHelper'
// import Swal from 'sweetalert2'
// import { duration } from '@mui/material'
// import { getDeviceIP } from '../../../utils/CommonHelper'
// import {
//   CandidateForExamFees,
//   GetInstituteIDByInstituteCode
// } from '../../../Endpoints_All/Examination/Exam'
// import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
// import { SaveFeeCartItems } from '../../../Endpoints_All/Fee/feeManagement'

// const column = [
//   {
//     header: 'Sr. No.',
//     key: 'srNo',
//     width: '60px',
//     className: 'text-center',
//     headerClassName: 'text-center'
//   },
//   {
//     header: 'Application ID',
//     key: 'ApplicationIDDisplay',
//     width: '200px',
//     className: 'text-center'
//   },
//   {
//     header: 'Candidate Name',
//     key: 'CandidateName',
//     width: '400px',
//     className: 'text-center'
//   },
//   {
//     header: 'Candidate Status',
//     key: 'CandidateStatus',
//     width: '85px',
//     className: 'text-center'
//   },
//   {
//     header: 'Board Fee',
//     key: 'BoardFee',
//     width: '85px',
//     className: 'text-center'
//   },
//   {
//     header: 'Assessment Fee',
//     key: 'AssessmentFee',
//     width: '85px',
//     className: 'text-center'
//   },
//   {
//     header: 'Transaction Detail',
//     key: 'TransactionDetail',
//     width: '200px',
//     className: 'text-center'
//   }
// ]

// const ExamFeesDetails = () => {
//   const [searchParams] = useSearchParams()
//   const batchId = searchParams.get('batchId')
//   const navigate = useNavigate()
//   const [selectedCandidates, setSelectedCandidates] = useState([])
//   const [courseData, setCourseData] = useState([])
//   const [candidates, setCandidates] = useState([])
//   const [courseId, setCourseId] = useState(null)

//   const totalBoardFees = selectedCandidates.reduce(
//     (sum, c) => sum + (c.BoardFee || 0),
//     0
//   )
//   const totalAssessmentFees = selectedCandidates.reduce(
//     (sum, c) => sum + (c.AssessmentFee || 0),
//     0
//   )
//   const totalExamFees = selectedCandidates.reduce(
//     (sum, c) => sum + (c.ExamFee || 0),
//     0
//   )

//   const handleClickPayFees = async () => {
//     if (selectedCandidates.length === 0) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'No Candidate Selected',
//         text: 'Please select at least one candidate to Pay Fees.'
//       })
//       return
//     }

//     try {
//       const userInfoAll = JSON.parse(sessionStorage.getItem('userInfoAll'))
//       const userLoginID = userInfoAll?.UserLoginID

//       if (!userLoginID) {
//         throw new Error('User login ID not found in session storage')
//       }

//       const instituteResponse = await agent.get(
//         `${GetInstituteIDByInstituteCode}?InstituteCode=${userLoginID}`
//       )

//       const instituteData = instituteResponse.data

//       if (instituteData.Status !== 'Success' || !instituteData.Data) {
//         throw new Error(
//           instituteData.Message || 'Failed to retrieve Institute ID'
//         )
//       }

//       const instituteId = instituteData.Data
//       const ip = await getDeviceIP()

//       const candidatePayload = selectedCandidates.map(c => ({
//         applicationId: c.ApplicationID || 0,
//         courseID: courseId || 0,
//         batchID: batchId || 0,
//         instituteID: instituteId || 0,
//         candidateID: c.CandidateID || 0,
//         boardFees: c.BoardFee || 0,
//         assessmentFees: c.AssessmentFee || 0,
//         examFees: c.ExamFee || 0,
//         newBatchID: 0
//       }))

//       const response = await agent.post(SaveFeeCartItems, candidatePayload, {
//         params: {
//           InstituteID: instituteId,
//           CourseID: courseId,
//           BatchID: batchId,
//           UserLoginId: userLoginID,
//           IPAddress: ip,
//           phaseId: 1
//         }
//       })

//       if (response.data?.Status === 'Success') {
//         Swal.fire({
//           icon: 'success',
//           title: 'Success',
//           text: 'Fee cart items saved successfully.'
//         })
//         const cartId = response.data?.Data[0]?.CartId;
//         // navigate(`selectedCandidates/${cartId}`, {
//         //   state: { cartId }
//         // })
//         // navigate(`selectedCandidates?cartId=${cartId}`)
//         navigate(`/Exam/selectedCandidates?cartId=${cartId}`)
//       } else {
//         throw new Error(
//           response.data?.Message || 'Failed to save fee cart items'
//         )
//       }
//     } catch (error) {
//       console.error('handleClickPayFees error:', error)
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.message || 'Something went wrong. Please try again.'
//       })
//     }
//   }
//   const handleBack = () => navigate(-1)
//   useEffect(() => {
//     if (!batchId) {
//       return
//     }

//     // const fetchCandidates = async () => {
//     //   const response = await agent.get(CandidateForExamFees, {
//     //     params: { batchId: batchId }
//     //   })
//     //   const rawData = response.data?.Data
//     //   const courseData = rawData?.Table?.[0] || {}
//     //   const candidateData = Array.isArray(rawData?.Table1)
//     //     ? rawData.Table1.map((item, index) => ({
//     //         ...item,
//     //         srNo: index + 1
//     //       }))
//     //     : []
//     //   setCourseData(courseData)
//     //   setCandidates(candidateData)
//     //   setCourseId(candidateData[0]?.CourseID || 0)
//     //   console.log('data--->>>--->>>', response.data)
//     // }

//     const fetchCandidates = async () => {
//       try {
//         const response = await agent.get(CandidateForExamFees, {
//           params: { batchId: batchId }
//         })
//         console.log('...................', response.data);
        
//         const rawData = response.data?.Data
//         const courseData = rawData?.Table?.[0] || {}
//         const candidateData = Array.isArray(rawData?.Table1)
//           ? rawData.Table1.map((item, index) => ({
//             ...item,
//             srNo: index + 1
//           }))
//           : []
//         setCourseData(courseData)
//         setCandidates(candidateData)
//         setCourseId(candidateData[0]?.CourseID || 0)
//       } catch (error) {
//         console.error('fetchCandidates error:', error)
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: error.message || 'Failed to fetch candidates. Please try again.'
//         })
//       }
//     }

//     fetchCandidates()
//   }, [batchId])
//   const handlePayFees = () => {
//     if (!selectedCandidates) {
//       return
//     }
//     navigate('selectedCandidates')
//   }
//   return (
//     <div className='mx-auto w-full rounded-lg bg-white p-6 shadow-md'>
//       <fieldset className='mb-4 rounded-md border p-4'>
//         <legend className='flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white'>
//           <span className='text-base'>☰</span>
//           <span>Exam Fees Details</span>
//         </legend>
//         {/* <div className='flex mb-3'>
//           <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//             Course
//           </label>
//           <span className='flex-grow rounded-r-lg border px-6 py-3'>
//             {' '}
//             <b></b>
//           </span>
//         </div> */}
//         <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mb-4'>
//           <div className='flex col-span-1'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Course Code
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.CourseCode ?? ''}</b>
//             </span>
//           </div>
//           <div className='flex col-span-2'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Course Name
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.CourseName ?? ''}</b>
//             </span>
//           </div>
//         </div>

//         <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mb-4'>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Batch ID
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.BatchID ?? ''}</b>
//             </span>
//           </div>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Batch Status
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.BatchStatusName ?? ''}</b>
//             </span>
//           </div>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Exam Type
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.ExamType ?? ''}</b>
//             </span>
//           </div>
//         </div>

//         <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mb-4'>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Batch Start Date
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.BatchStartDate ?? ''}</b>
//             </span>
//           </div>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Batch End Date
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.BatchEndDate ?? ''}</b>
//             </span>
//           </div>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Admission Last Date
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.AdmissionLastDate ?? ''}</b>
//             </span>
//           </div>
//         </div>

//         <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mb-4'>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Admitted
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.Admitted ?? ''}</b>
//             </span>
//           </div>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Approved
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.Approved ?? ''}</b>
//             </span>
//           </div>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Rejected
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.Rejected ?? 0}</b>
//             </span>
//           </div>
//         </div>

//         <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mb-4'>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Hall Ticket Issuance Date
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.HallTicketIssuanceDate ?? ''}</b>
//             </span>
//           </div>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Exam Start Date
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{courseData?.ExamStartDate ?? ''}</b>
//             </span>
//           </div>
//           <div />
//         </div>
//         <FilteredTableComponent
//           className='pl-6 pr-6'
//           data={candidates ?? []}
//           columns={column}
//           searchable={true}
//           showExport={false}
//           showExcelTemplate={false}
//           showPDF={false}
//           sortable={true}
//           showCheckbox={true}
//           isRowSelectable={item =>
//             (!item.TransactionDetail || item.TransactionDetail.trim() === '') &&
//             item.PendingAmount > 0
//           }
//           onSelectionChange={selected => setSelectedCandidates(selected)}
//           renderCell={(item, column) => {
//             if (column.key === 'applicationId') {
//               return (
//                 <span
//                   className='text-blue-600 font-bold cursor-pointer hover:underline'
//                   onClick={() => fetchBatchByUnit(item.applicationId)}
//                 >
//                   {item.applicationId}
//                 </span>
//               )
//             }
//           }}
//         />
//         <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mb-4'>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Board Fees
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{totalBoardFees}</b>
//             </span>
//           </div>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Assessment Fees
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{totalAssessmentFees}</b>
//             </span>
//           </div>
//           <div className='flex'>
//             <label className='w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right'>
//               Exam Fees
//             </label>
//             <span className='flex-grow rounded-r-lg border px-6 py-3'>
//               <b>{totalExamFees}</b>
//             </span>
//           </div>
//         </div>
//       </fieldset>

//       <div className='flex justify-center gap-3 mt-4'>
       
//         <Button variant='success' onClick={handleClickPayFees}>
//           Pay Fees
//         </Button>
//         <Button variant='info' onClick={handleBack}>
//           Back
//         </Button>
//       </div>
//     </div>
//   )
// }

// export default ExamFeesDetails
// import FilteredTableComponent from '../../../Component/formcomponent/FilteredTableComponent'
// import { useEffect, useState } from 'react'
// import Button from '../../base/Button'
// import agent from '../../../lib/api/agent'
// import Swal from 'sweetalert2'
// import { getDeviceIP } from '../../../utils/CommonHelper'
// import {
//   CandidateForExamFees,
//   GetInstituteIDByInstituteCode
// } from '../../../Endpoints_All/Examination/Exam'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { SaveFeeCartItems } from '../../../Endpoints_All/Fee/feeManagement'

// const column = [
//   { header: 'Sr. No.',          key: 'srNo',               width: '60px',  className: 'text-center', headerClassName: 'text-center' },
//   { header: 'Application ID',   key: 'ApplicationIDDisplay',width: '200px', className: 'text-center', headerClassName: 'text-center' },
//   { header: 'Candidate Name',   key: 'CandidateName',       width: '300px', className: 'text-center', headerClassName: 'text-center' },
//   { header: 'Candidate Status', key: 'CandidateStatus',     width: '120px', className: 'text-center', headerClassName: 'text-center' },
//   { header: 'Board Fee',        key: 'BoardFee',            width: '100px', className: 'text-center', headerClassName: 'text-center' },
//   { header: 'Assessment Fee',   key: 'AssessmentFee',       width: '120px', className: 'text-center', headerClassName: 'text-center' },
//   { header: 'Transaction Detail',key: 'TransactionDetail',  width: '160px', className: 'text-center', headerClassName: 'text-center' }
// ]

// /* ── Field: label above, value in bordered box ── */
// const Field = ({ label, value }) => (
//   <div className='flex flex-col'>
//     <span className='mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400'>
//       {label}
//     </span>
//     <div className='flex min-h-[40px] items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800'>
//       {value || <span className='text-gray-300'>—</span>}
//     </div>
//   </div>
// )

// /* ── StatBox: colored number + label ── */
// const StatBox = ({ label, value, bg, border, text }) => (
//   <div className={`flex flex-col items-center justify-center rounded-lg border px-2 py-3 ${bg} ${border}`}>
//     <span className={`text-2xl font-bold leading-none ${text}`}>{value ?? 0}</span>
//     <span className={`mt-1 text-[11px] font-medium ${text} opacity-70`}>{label}</span>
//   </div>
// )

// const ExamFeesDetails = () => {
//   const [searchParams] = useSearchParams()
//   const batchId = searchParams.get('batchId')
//   const navigate = useNavigate()

//   const [selectedCandidates, setSelectedCandidates] = useState([])
//   const [courseData, setCourseData]                 = useState({})
//   const [candidates, setCandidates]                 = useState([])
//   const [courseId, setCourseId]                     = useState(null)
//   const [loading, setLoading]                       = useState(false)
//   const [fetching, setFetching]                     = useState(false)

//   const totalBoardFees      = selectedCandidates.reduce((s, c) => s + (c.BoardFee      || 0), 0)
//   const totalAssessmentFees = selectedCandidates.reduce((s, c) => s + (c.AssessmentFee || 0), 0)
//   const totalExamFees       = selectedCandidates.reduce((s, c) => s + (c.ExamFee       || 0), 0)

//   useEffect(() => {
//     if (!batchId) return
//     const fetchCandidates = async () => {
//       setFetching(true)
//       try {
//         const response    = await agent.get(CandidateForExamFees, { params: { batchId } })
//         const rawData     = response.data?.Data
//         const course      = rawData?.Table?.[0] || {}
//         const candidateData = Array.isArray(rawData?.Table1)
//           ? rawData.Table1.map((item, index) => ({ ...item, srNo: index + 1 }))
//           : []
//         setCourseData(course)
//         setCandidates(candidateData)
//         setCourseId(candidateData[0]?.CourseID || 0)
//       } catch (error) {
//         console.error('fetchCandidates error:', error)
//         Swal.fire({ icon: 'error', title: 'Failed to load', text: error.message || 'Could not fetch candidates.' })
//       } finally {
//         setFetching(false)
//       }
//     }
//     fetchCandidates()
//   }, [batchId])

//   const handleClickPayFees = async () => {
//     if (selectedCandidates.length === 0) {
//       Swal.fire({ icon: 'warning', title: 'No Candidate Selected', text: 'Please select at least one candidate to Pay Fees.' })
//       return
//     }
//     setLoading(true)
//     try {
//       const userInfoAll = JSON.parse(sessionStorage.getItem('userInfoAll'))
//       const userLoginID = userInfoAll?.UserLoginID
//       if (!userLoginID) throw new Error('User login ID not found in session storage')

//       const instituteResponse = await agent.get(`${GetInstituteIDByInstituteCode}?InstituteCode=${userLoginID}`)
//       const instituteData     = instituteResponse.data
//       if (instituteData.Status !== 'Success' || !instituteData.Data)
//         throw new Error(instituteData.Message || 'Failed to retrieve Institute ID')

//       const instituteId = instituteData.Data
//       const ip          = await getDeviceIP()

//       const candidatePayload = selectedCandidates.map(c => ({
//         applicationId:  c.ApplicationID  || 0,
//         courseID:       courseId          || 0,
//         batchID:        batchId           || 0,
//         instituteID:    instituteId       || 0,
//         candidateID:    c.CandidateID     || 0,
//         boardFees:      c.BoardFee        || 0,
//         assessmentFees: c.AssessmentFee   || 0,
//         examFees:       c.ExamFee         || 0,
//         newBatchID:     0
//       }))

//       const response = await agent.post(SaveFeeCartItems, candidatePayload, {
//         params: { InstituteID: instituteId, CourseID: courseId, BatchID: batchId, UserLoginId: userLoginID, IPAddress: ip, phaseId: 1 }
//       })

//       if (response.data?.Status === 'Success') {
//         const cartId = response.data?.Data[0]?.CartId
//         Swal.fire({ icon: 'success', title: 'Success', text: 'Fee cart items saved successfully.' })
//         navigate(`/Exam/selectedCandidates?cartId=${cartId}`)
//       } else {
//         throw new Error(response.data?.Message || 'Failed to save fee cart items')
//       }
//     } catch (error) {
//       console.error('handleClickPayFees error:', error)
//       Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Something went wrong. Please try again.' })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleBack = () => navigate(-1)

//   return (
//     <div className='min-h-screen w-full bg-gray-50 p-5'>

//       {/* ── Page Header ── */}
//       <div className='mb-5 flex items-center justify-between rounded-xl border border-blue-100 bg-white px-5 py-4 shadow-sm'>
//         <div className='flex items-center gap-3'>
//           <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl'>
//             🧾
//           </div>
//           <div>
//             <h1 className='text-base font-bold text-gray-900'>Exam Fees Details</h1>
//             <p className='text-xs text-gray-400'>Review candidates and collect batch exam fees</p>
//           </div>
//         </div>
//         {batchId && (
//           <span className='rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold text-blue-600'>
//             Batch #{batchId}
//           </span>
//         )}
//       </div>

//       {fetching ? (
//         <div className='flex items-center justify-center py-32 text-gray-400'>
//           <span className='mr-2 animate-spin text-xl'>⏳</span> Loading batch data…
//         </div>
//       ) : (
//         <>
//           {/* ── Course & Batch Info ── */}
//           <div className='mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>

//             {/* Course header */}
//             <div className='border-b border-gray-100 bg-gray-50 px-5 py-2.5'>
//               <span className='text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400'>Course</span>
//             </div>
//             <div className='grid grid-cols-1 gap-4 px-5 pb-5 pt-4 md:grid-cols-3'>
//               <Field label='Course Code' value={courseData?.CourseCode} />
//               <div className='md:col-span-2'>
//                 <Field label='Course Name' value={courseData?.CourseName} />
//               </div>
//             </div>

//             {/* Batch header */}
//             <div className='border-b border-t border-gray-100 bg-gray-50 px-5 py-2.5'>
//               <span className='text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400'>Batch</span>
//             </div>
//             <div className='space-y-4 px-5 pb-5 pt-4'>
//               <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
//                 <Field label='Batch ID'     value={courseData?.BatchID} />
//                 <Field label='Batch Status' value={courseData?.BatchStatusName} />
//                 <Field label='Exam Type'    value={courseData?.ExamType} />
//               </div>
//               <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
//                 <Field label='Batch Start Date'    value={courseData?.BatchStartDate} />
//                 <Field label='Batch End Date'      value={courseData?.BatchEndDate} />
//                 <Field label='Admission Last Date' value={courseData?.AdmissionLastDate} />
//               </div>
//               <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
//                 <Field label='Hall Ticket Issuance Date' value={courseData?.HallTicketIssuanceDate} />
//                 <Field label='Exam Start Date'           value={courseData?.ExamStartDate} />
//                 {/* Admission Stats */}
//                 <div className='flex flex-col'>
//                   <span className='mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400'>
//                     Admission Stats
//                   </span>
//                   <div className='grid flex-1 grid-cols-3 gap-2'>
//                     <StatBox label='Admitted' value={courseData?.Admitted}        bg='bg-green-50'  border='border-green-200'  text='text-green-600'  />
//                     <StatBox label='Approved' value={courseData?.Approved}        bg='bg-purple-50' border='border-purple-200' text='text-purple-600' />
//                     <StatBox label='Rejected' value={courseData?.Rejected ?? 0}   bg='bg-red-50'    border='border-red-200'    text='text-red-500'    />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── Candidates Table ── */}
//           <div className='mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
//             <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-2.5'>
//               <span className='text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400'>Candidates</span>
//               {selectedCandidates.length > 0 && (
//                 <span className='rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-600'>
//                   {selectedCandidates.length} selected
//                 </span>
//               )}
//             </div>
//             <div className='p-4'>
//               <FilteredTableComponent
//                 data={candidates ?? []}
//                 columns={column}
//                 searchable={true}
//                 showExport={false}
//                 showExcelTemplate={false}
//                 showPDF={false}
//                 sortable={true}
//                 showCheckbox={true}
//                 isRowSelectable={item =>
//                   (!item.TransactionDetail || item.TransactionDetail.trim() === '') &&
//                   item.PendingAmount > 0
//                 }
//                 onSelectionChange={selected => setSelectedCandidates(selected)}
//                 renderCell={(item, col) => {
//                   if (col.key === 'ApplicationIDDisplay') {
//                     return (
//                       <span className='cursor-pointer font-semibold text-blue-600 hover:underline'>
//                         {item.ApplicationIDDisplay}
//                       </span>
//                     )
//                   }
//                   if (col.key === 'CandidateStatus') {
//                     const statusMap = {
//                       Approved: 'bg-green-100 text-green-700 border-green-200',
//                       Pending:  'bg-amber-100 text-amber-700 border-amber-200',
//                       Rejected: 'bg-red-100 text-red-600 border-red-200'
//                     }
//                     return (
//                       <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusMap[item.CandidateStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
//                         {item.CandidateStatus}
//                       </span>
//                     )
//                   }
//                   if (col.key === 'TransactionDetail') {
//                     return item.TransactionDetail ? (
//                       <span className='inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700'>
//                         ✓ {item.TransactionDetail}
//                       </span>
//                     ) : (
//                       <span className='font-medium text-gray-300'>—</span>
//                     )
//                   }
//                 }}
//               />
//             </div>
//           </div>

//           {/* ── Fee Summary ── */}
//           <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-3'>
//             <div className='flex items-center gap-4 rounded-xl border border-purple-200 bg-purple-50 px-5 py-4'>
//               <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl'>🏛️</div>
//               <div>
//                 <p className='text-[11px] font-bold uppercase tracking-wide text-purple-400'>Total Board Fees</p>
//                 <p className='mt-0.5 text-2xl font-bold text-purple-700'>₹{totalBoardFees.toLocaleString('en-IN')}</p>
//               </div>
//             </div>
//             <div className='flex items-center gap-4 rounded-xl border border-teal-200 bg-teal-50 px-5 py-4'>
//               <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xl'>📋</div>
//               <div>
//                 <p className='text-[11px] font-bold uppercase tracking-wide text-teal-400'>Total Assessment Fees</p>
//                 <p className='mt-0.5 text-2xl font-bold text-teal-700'>₹{totalAssessmentFees.toLocaleString('en-IN')}</p>
//               </div>
//             </div>
//             <div className='flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4'>
//               <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl'>🧮</div>
//               <div>
//                 <p className='text-[11px] font-bold uppercase tracking-wide text-blue-400'>Total Exam Fees</p>
//                 <p className='mt-0.5 text-2xl font-bold text-blue-700'>₹{totalExamFees.toLocaleString('en-IN')}</p>
//               </div>
//             </div>
//           </div>

//           {/* ── Actions ── */}
//           <div className='flex items-center justify-center gap-3 pb-4'>
//             <Button variant='info' onClick={handleBack}>
//               ← Back
//             </Button>
//             <button
//               onClick={handleClickPayFees}
//               disabled={loading || selectedCandidates.length === 0}
//               className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
//             >
//               {loading
//                 ? <><span className='animate-spin'>⏳</span> Processing…</>
//                 : <>💳 Pay Fees</>
//               }
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

// export default ExamFeesDetails
import FilteredTableComponent from '../../../Component/formcomponent/FilteredTableComponent'
import { useEffect, useState } from 'react'
import Button from '../../base/Button'
import agent from '../../../lib/api/agent'
import Swal from 'sweetalert2'
import { getDeviceIP } from '../../../utils/CommonHelper'
import {
  CandidateForExamFees,
  GetInstituteIDByInstituteCode
} from '../../../Endpoints_All/Examination/Exam'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SaveFeeCartItems } from '../../../Endpoints_All/Fee/feeManagement'
import { useAuth } from '../../../Hooks/AuthContext'

const column = [
  { header: 'Sr. No.',           key: 'srNo',                width: '60px',  className: 'text-center', headerClassName: 'text-center' },
  { header: 'Application ID',    key: 'ApplicationIDDisplay', width: '200px', className: 'text-center', headerClassName: 'text-center' },
  { header: 'Candidate Name',    key: 'CandidateName',        width: '300px', className: 'text-center', headerClassName: 'text-center' },
  { header: 'Candidate Status',  key: 'CandidateStatus',      width: '120px', className: 'text-center', headerClassName: 'text-center' },
  { header: 'Board Fee',         key: 'BoardFee',             width: '100px', className: 'text-center', headerClassName: 'text-center' },
  { header: 'Assessment Fee',    key: 'AssessmentFee',        width: '120px', className: 'text-center', headerClassName: 'text-center' },
  { header: 'Transaction Detail',key: 'TransactionDetail',    width: '160px', className: 'text-center', headerClassName: 'text-center' }
]

/* ── Field: dark label + bordered value box ── */
const Field = ({ label, value }) => (
  <div className='flex flex-col'>
    <span className='mb-1.5 text-[12px] font-semibold text-slate-800'>
      {label}
    </span>
    <div className='flex min-h-[38px] items-center rounded-lg border border-[#D0D9E8] bg-[#F8F9FC] px-3 py-2 text-sm font-medium text-gray-800'>
      {value || <span className='text-gray-300'>—</span>}
    </div>
  </div>
)

/* ── StatBox ── */
const StatBox = ({ label, value, bg, border, text, textLabel }) => (
  <div className={`flex flex-col items-center justify-center rounded-lg border px-2 py-3 ${bg} ${border}`}>
    <span className={`text-2xl font-semibold leading-none ${text}`}>{value ?? 0}</span>
    <span className={`mt-1 text-[11px] font-medium ${textLabel}`}>{label}</span>
  </div>
)

/* ── Section Header ── */
const SectionHeader = ({ icon, title, right }) => (
  <div className='flex items-center gap-2 border-b border-[#D0D9E8] bg-[#F0F4FF] px-4 py-2.5'>
    <span className='text-[15px] text-[#1B5FBE]'>{icon}</span>
    <span className='text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1B5FBE]'>{title}</span>
    {right && <div className='ml-auto'>{right}</div>}
  </div>
)

const ExamFeesDetails = () => {
  const [searchParams] = useSearchParams()
  const batchId = searchParams.get('batchId')
  const navigate = useNavigate()
   const {userInfo} = useAuth();

  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [courseData, setCourseData]                 = useState({})
  const [candidates, setCandidates]                 = useState([])
  const [courseId, setCourseId]                     = useState(null)
  const [loading, setLoading]                       = useState(false)
  const [fetching, setFetching]                     = useState(false)

  const totalBoardFees      = selectedCandidates.reduce((s, c) => s + (c.BoardFee      || 0), 0)
  const totalAssessmentFees = selectedCandidates.reduce((s, c) => s + (c.AssessmentFee || 0), 0)
  const totalExamFees       = selectedCandidates.reduce((s, c) => s + (c.ExamFee       || 0), 0)

  useEffect(() => {
    if (!batchId) return
    const fetchCandidates = async () => {
      setFetching(true)
      try {
        const response      = await agent.get(CandidateForExamFees, { params: { batchId } })
        const rawData       = response.data?.Data
        const course        = rawData?.Table?.[0] || {}
        const candidateData = Array.isArray(rawData?.Table1)
          ? rawData.Table1.map((item, index) => ({ ...item, srNo: index + 1 }))
          : []
        setCourseData(course)
        setCandidates(candidateData)
        setCourseId(candidateData[0]?.CourseID || 0)
      } catch (error) {
        console.error('fetchCandidates error:', error)
        Swal.fire({ icon: 'error', title: 'Failed to load', text: error.message || 'Could not fetch candidates.' })
      } finally {
        setFetching(false)
      }
    }
    fetchCandidates()
  }, [batchId])

  const handleClickPayFees = async () => {
    if (selectedCandidates.length === 0) {
      Swal.fire({ icon: 'warning', title: 'No Candidate Selected', text: 'Please select at least one candidate to Pay Fees.' })
      return
    }
    setLoading(true)
    try {
      
      const userLoginID = userInfo?.UserLoginID
      if (!userLoginID) throw new Error('User login ID not found in session storage')

      const instituteResponse = await agent.get(`${GetInstituteIDByInstituteCode}?InstituteCode=${userLoginID}`)
      const instituteData     = instituteResponse.data
      if (instituteData.Status !== 'Success' || !instituteData.Data)
        throw new Error(instituteData.Message || 'Failed to retrieve Institute ID')

      const instituteId = instituteData.Data
      const ip          = await getDeviceIP()

      const candidatePayload = selectedCandidates.map(c => ({
        applicationId:  c.ApplicationID  || 0,
        courseID:       courseId          || 0,
        batchID:        batchId           || 0,
        instituteID:    instituteId       || 0,
        candidateID:    c.CandidateID     || 0,
        boardFees:      c.BoardFee        || 0,
        assessmentFees: c.AssessmentFee   || 0,
        examFees:       c.ExamFee         || 0,
        newBatchID:     0
      }))

      const response = await agent.post(SaveFeeCartItems, candidatePayload, {
        params: { InstituteID: instituteId, CourseID: courseId, BatchID: batchId, UserLoginId: userLoginID, IPAddress: ip, phaseId: 1 }
      })

      if (response.data?.Status === 'Success') {
        const cartId = response.data?.Data[0]?.CartId
        Swal.fire({ icon: 'success', title: 'Success', text: 'Fee cart items saved successfully.' })
        navigate(`/Exam/selectedCandidates?cartId=${cartId}`)
      } else {
        throw new Error(response.data?.Message || 'Failed to save fee cart items')
      }
    } catch (error) {
      console.error('handleClickPayFees error:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => navigate(-1)

  return (
    <div className='min-h-screen w-full bg-[#F4F6FA] p-5'>

      {/* ── Page Header ── */}
      <div className='mb-5 flex items-center justify-between rounded-xl border border-[#D0D9E8] bg-white px-5 py-3.5 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5FBE] text-white text-xl'>
            🧾
          </div>
          <div>
            <h1 className='text-[15px] font-semibold text-gray-900'>Exam Fees Details</h1>
            <p className='text-xs text-gray-500'>Review candidates and collect batch exam fees</p>
          </div>
        </div>
        {batchId && (
          <span className='rounded-full bg-[#1B5FBE] px-4 py-1.5 text-xs font-semibold text-white'>
            Batch #{batchId}
          </span>
        )}
      </div>

      {fetching ? (
        <div className='flex items-center justify-center py-32 text-gray-400'>
          <span className='mr-2 animate-spin text-xl'>⏳</span> Loading batch data…
        </div>
      ) : (
        <>
          {/* ── Course & Batch Info ── */}
          <div className='mb-5 overflow-hidden rounded-xl border border-[#D0D9E8] bg-white shadow-sm'>

            <SectionHeader icon='📘' title='Course' />
            <div className='grid grid-cols-1 gap-4 px-5 pb-5 pt-4 md:grid-cols-3'>
              <Field label='Course Code' value={courseData?.CourseCode} />
              <div className='md:col-span-2'>
                <Field label='Course Name' value={courseData?.CourseName} />
              </div>
            </div>

            <SectionHeader icon='🗂️' title='Batch' />
            <div className='space-y-4 px-5 pb-5 pt-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Field label='Batch ID'     value={courseData?.BatchID} />
                <Field label='Batch Status' value={courseData?.BatchStatusName} />
                <Field label='Exam Type'    value={courseData?.ExamType} />
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Field label='Batch Start Date'    value={courseData?.BatchStartDate} />
                <Field label='Batch End Date'      value={courseData?.BatchEndDate} />
                <Field label='Admission Last Date' value={courseData?.AdmissionLastDate} />
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Field label='Hall Ticket Issuance Date' value={courseData?.HallTicketIssuanceDate} />
                <Field label='Exam Start Date'           value={courseData?.ExamStartDate} />
                <div className='flex flex-col'>
                  <span className='mb-1.5 text-[12px] font-semibold text-slate-800'>
                    Admission Stats
                  </span>
                  <div className='grid flex-1 grid-cols-3 gap-2'>
                    <StatBox label='Admitted' value={courseData?.Admitted}      bg='bg-[#EAF3DE]'  border='border-[#97C459]'  text='text-[#27500A]'  textLabel='text-[#3B6D11]' />
                    <StatBox label='Approved' value={courseData?.Approved}      bg='bg-[#EEEDFE]'  border='border-[#AFA9EC]'  text='text-[#3C3489]'  textLabel='text-[#534AB7]' />
                    <StatBox label='Rejected' value={courseData?.Rejected ?? 0} bg='bg-[#FCEBEB]'  border='border-[#F09595]'  text='text-[#791F1F]'  textLabel='text-[#A32D2D]' />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Candidates Table ── */}
          <div className='mb-5 overflow-hidden rounded-xl border border-[#D0D9E8] bg-white shadow-sm'>
            <SectionHeader
              icon='👥'
              title='Candidates'
              right={
                selectedCandidates.length > 0 && (
                  <span className='rounded-full bg-[#1B5FBE] px-3 py-0.5 text-xs font-semibold text-white'>
                    {selectedCandidates.length} selected
                  </span>
                )
              }
            />
            <div className='p-4'>
              <FilteredTableComponent
                data={candidates ?? []}
                columns={column}
                searchable={true}
                showExport={false}
                showExcelTemplate={false}
                showPDF={false}
                sortable={true}
                showCheckbox={true}
                isRowSelectable={item =>
                  (!item.TransactionDetail || item.TransactionDetail.trim() === '') &&
                  item.PendingAmount > 0
                }
                onSelectionChange={selected => setSelectedCandidates(selected)}
                renderCell={(item, col) => {
                  if (col.key === 'ApplicationIDDisplay') {
                    return (
                      <span className='cursor-pointer font-semibold text-[#1B5FBE] hover:underline'>
                        {item.ApplicationIDDisplay}
                      </span>
                    )
                  }
                  if (col.key === 'CandidateStatus') {
                    const statusMap = {
                      Approved: 'bg-[#EAF3DE] text-[#27500A] border-[#97C459]',
                      Pending:  'bg-[#FAEEDA] text-[#633806] border-[#EF9F27]',
                      Rejected: 'bg-[#FCEBEB] text-[#791F1F] border-[#F09595]'
                    }
                    return (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusMap[item.CandidateStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {item.CandidateStatus}
                      </span>
                    )
                  }
                  if (col.key === 'TransactionDetail') {
                    return item.TransactionDetail ? (
                      <span className='inline-flex items-center gap-1 rounded-full border border-[#97C459] bg-[#EAF3DE] px-2.5 py-0.5 text-xs font-semibold text-[#27500A]'>
                        ✓ {item.TransactionDetail}
                      </span>
                    ) : (
                      <span className='font-medium text-gray-300'>—</span>
                    )
                  }
                }}
              />
            </div>
          </div>

          {/* ── Fee Summary ── */}
          <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='flex items-center gap-4 rounded-xl border border-[#AFA9EC] bg-[#EEEDFE] px-5 py-4'>
              <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#CECBF6] text-xl'>🏛️</div>
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-[#534AB7]'>Total Board Fees</p>
                <p className='mt-0.5 text-2xl font-semibold text-[#26215C]'>₹{totalBoardFees.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className='flex items-center gap-4 rounded-xl border border-[#5DCAA5] bg-[#E1F5EE] px-5 py-4'>
              <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#9FE1CB] text-xl'>📋</div>
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-[#0F6E56]'>Total Assessment Fees</p>
                <p className='mt-0.5 text-2xl font-semibold text-[#04342C]'>₹{totalAssessmentFees.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className='flex items-center gap-4 rounded-xl border border-[#85B7EB] bg-[#E6F1FB] px-5 py-4'>
              <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#B5D4F4] text-xl'>🧮</div>
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-[#185FA5]'>Total Exam Fees</p>
                <p className='mt-0.5 text-2xl font-semibold text-[#042C53]'>₹{totalExamFees.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className='flex items-center justify-center gap-3 pb-4'>
            <button
              onClick={handleBack}
              className='inline-flex items-center gap-2 rounded-xl border border-[#D0D9E8] bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95'
            >
              ← Back
            </button>
            <button
              onClick={handleClickPayFees}
              disabled={loading || selectedCandidates.length === 0}
              className='inline-flex items-center gap-2 rounded-xl bg-[#1B5FBE] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#164DA0] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading
                ? <><span className='animate-spin'>⏳</span> Processing…</>
                : <>💳 Pay Fees</>
              }
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ExamFeesDetails