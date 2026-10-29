// import React, { useEffect, useState } from 'react'

// import { GetInstituteDetails } from '../../Endpoints_All/Institute/institute'
// import BoardLogo from '../../assets/Board Logo - small size.jpg'
// import independencedayindia20 from '../../assets/independencedayindia20.jpg'
// import agent from '../../lib/api/agent'
// import { useSearchParams } from 'react-router-dom'
// import useLoading from '../../Hooks/useLoading'

// const InstituteDetailsPrint = () => {
//   // const InstituteDetailsPrint = ({ instituteId, courseCode= 0 }) => {
//   const { startLoading, stopLoading, isLoading } = useLoading()
//   const [searchParams] = useSearchParams()

//   const instituteId = searchParams.get('instituteId')
//   const courseCode = searchParams.get('courseCode')

//   const [courseDetails, setCourseDetails] = useState(null)

//   useEffect(() => {
//     if (instituteId) fetchInstituteDetails()
//   }, [instituteId, courseCode])

//   const fetchInstituteDetails = async () => {
//     startLoading()
//     try {
//       const res = await agent.get(
//         `${GetInstituteDetails}/${instituteId}/${courseCode}`
//       )
//       const json = res.data


//       if (json?.Status === 'Success') {
//         setCourseDetails(json.Data)

//         setTimeout(() => {
//           window.print()
//         }, 800)
//       }
//     } catch (error) {
//       console.error('Error loading institute details', error)
//     } finally {
//       stopLoading()
//     }
//   }

//   if (!courseDetails) return startLoading()
//   const d = courseDetails

//   return (
//     // <div className="p-4 text-sm">

//     //     {/* HEADER */}
//     //     <table className="w-full border border-gray-300 mb-2">
//     //         <tbody>
//     //             <tr>
//     //                 <td className="w-[5%] text-center border-r-0">
//     //                     <img src={independencedayindia20} alt="" width="60" />
//     //                 </td>

//     //                 <td className="w-[90%] text-center border-x-0">
//     //                     <div className="text-xs">Maharashtra State Board</div>
//     //                     <div className="text-xs">of Skill, Vocational Education and Training</div>
//     //                     <div className="text-sm font-semibold">
//     //                         Institute Information
//     //                     </div>
//     //                 </td>

//     //                 <td className="w-[5%] text-center border-l-0">
//     //                     <img src={BoardLogo} alt="" width="60" />
//     //                 </td>
//     //             </tr>
//     //         </tbody>
//     //     </table>

//     //     {/* INSTITUTE DETAILS */}
//     //     <table className="w-full border border-gray-300 text-xs mb-2">
//     //         <tbody>

//     //             <tr className="bg-gray-100 font-semibold text-center">
//     //                 <td colSpan="4" className="border p-1">
//     //                     Institute Information
//     //                 </td>
//     //             </tr>

//     //             <tr>
//     //                 <td className="border p-1 text-right w-1/4 font-semibold">
//     //                     Institute Name
//     //                 </td>
//     //                 <td colSpan="3" className="border p-1">
//     //                     {courseDetails.InstituteName || "N/A"}
//     //                 </td>
//     //             </tr>

//     //             <tr>
//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Institute Address
//     //                 </td>
//     //                 <td colSpan="3" className="border p-1">
//     //                     {courseDetails.InstituteAddress || "N/A"}
//     //                 </td>
//     //             </tr>

//     //             <tr>
//     //                 <td className="border p-1 text-right font-semibold">
//     //                     City
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.City || "N/A"}
//     //                 </td>

//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Pin Code
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.PinCode || "N/A"}
//     //                 </td>
//     //             </tr>

//     //             <tr>
//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Taluka
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.Taluka || "N/A"}
//     //                 </td>

//     //                 <td className="border p-1 text-right font-semibold">
//     //                     District
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.District || "N/A"}
//     //                 </td>
//     //             </tr>

//     //             <tr>
//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Region
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.Region || "N/A"}
//     //                 </td>

//     //                 <td className="border p-1 text-right font-semibold">
//     //                     State
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.State || "N/A"}
//     //                 </td>
//     //             </tr>

//     //             <tr>
//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Phone No
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.PhoneNo || "N/A"}
//     //                 </td>

//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Fax No
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.FaxNo || "N/A"}
//     //                 </td>
//     //             </tr>

//     //             <tr>
//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Email ID
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.EmailID || "N/A"}
//     //                 </td>

//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Website
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.WebSite || "N/A"}
//     //                 </td>
//     //             </tr>

//     //         </tbody>
//     //     </table>

//     //     {/* COURSE DETAILS */}
//     //     <table className="w-full border border-gray-300 text-xs mb-2">
//     //         <tbody>

//     //             <tr className="bg-gray-100 font-semibold text-center">
//     //                 <td colSpan="4" className="border p-1">
//     //                     Course Details
//     //                 </td>
//     //             </tr>

//     //             <tr>
//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Course Name
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.CourseName || "N/A"}
//     //                 </td>

//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Course Code
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.CourseCode || courseCode}
//     //                 </td>
//     //             </tr>

//     //             <tr>
//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Duration
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.Duration || "N/A"}
//     //                 </td>

//     //                 <td className="border p-1 text-right font-semibold">
//     //                     Full Time / Part Time
//     //                 </td>
//     //                 <td className="border p-1">
//     //                     {courseDetails.FullTimePartTime || "N/A"}
//     //                 </td>
//     //             </tr>

//     //         </tbody>
//     //     </table>

//     // </div>

//     <div className='bg-white p-4 md:p-10 min-h-screen'>
//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//           @media print {
//             .no-print { display: none; }
//             body { background-color: white !important; }
//             * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//           }
//         `
//         }}
//       />

//       <div className='max-w-full mx-auto bg-white border border-black shadow-sm'>
//         {/* ── HEADER ── */}
//         <div className='p-4 border-b border-black'>
//           <div className='flex justify-between items-center text-center'>
//             <img src={independencedayindia20} alt='Emblem' className='h-20' />
//             <div className='flex-1 px-4'>
//               <h1 className='text-sm font-semibold'>
//                 Government of Maharashtra
//               </h1>
//               <h2 className='text-sm'>
//                 Skill, Employment, Entrepreneurship and Innovation Department
//               </h2>
//               <h2 className='text-md font-bold text-blue-900'>
//                 Maharashtra State Board of Skill, Vocational Education and
//                 Training
//               </h2>
//             </div>
//             <img src={BoardLogo} alt='Logo' className='h-20' />
//           </div>
//         </div>

//         {/* ── VTI TABLE ── */}
//         <div className='overflow-x-auto p-4'>
//           <table className='w-full border-collapse border border-black text-sm'>
//             <tbody>
//               {/* Section Header */}
//               <tr className='bg-gray-100'>
//                 <th
//                   colSpan={4}
//                   className='text-center p-2 border border-black font-bold'
//                 >
//                   Vocational Training Institute (VTI)
//                 </th>
//               </tr>

//               {/* Institute Name */}
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50 w-1/4'>
//                   Institute Name :
//                 </td>
//                 <td colSpan={3} className='p-2 border border-black'>
//                   {d.InstituteName || 'N/A'}
//                 </td>
//               </tr>

//               {/* Institute Address */}
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Institute Address :
//                 </td>
//                 <td colSpan={3} className='p-2 border border-black'>
//                   {d.InstituteAddress || 'N/A'}
//                 </td>
//               </tr>

//               {/* City / Pin Code */}
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50 w-1/4'>
//                   City :
//                 </td>
//                 <td className='p-2 border border-black w-1/4'>
//                   {d.City || 'N/A'}
//                 </td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50 w-1/4'>
//                   Pin Code :
//                 </td>
//                 <td className='p-2 border border-black w-1/4'>
//                   {d.PinCode || 'N/A'}
//                 </td>
//               </tr>

//               {/* Taluka / District */}
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Taluka :
//                 </td>
//                 <td className='p-2 border border-black'>{d.Taluka || 'N/A'}</td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   District :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.District || 'N/A'}
//                 </td>
//               </tr>

//               {/* Region / State */}
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Region :
//                 </td>
//                 <td className='p-2 border border-black'>{d.Region || 'N/A'}</td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   State :
//                 </td>
//                 <td className='p-2 border border-black'>{d.State || 'N/A'}</td>
//               </tr>

//               {/* Phone / Fax */}
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Phone No. :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.PhoneNo || 'N/A'}
//                 </td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Fax No. :
//                 </td>
//                 <td className='p-2 border border-black'>{d.FaxNo || 'N/A'}</td>
//               </tr>

//               {/* Email / Website */}
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   E-Mail ID :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.EMailID || 'N/A'}
//                 </td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Web Site :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.WebSite || 'N/A'}
//                 </td>
//               </tr>

//               {/* ── HEAD OF INSTITUTE ── */}
//               <tr className='bg-gray-100'>
//                 <th
//                   colSpan={4}
//                   className='text-center p-2 border border-black font-bold'
//                 >
//                   Head of Institute
//                 </th>
//               </tr>

//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Name :
//                 </td>
//                 <td colSpan={3} className='p-2 border border-black'>
//                   {d.MemberNamePrincipal || 'N/A'}
//                 </td>
//               </tr>
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Designation :
//                 </td>
//                 <td colSpan={3} className='p-2 border border-black'>
//                   {d.DesignationPrincipal || 'N/A'}
//                 </td>
//               </tr>
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Mobile No :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.MobileNoPrincipal || 'N/A'}
//                 </td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Alternate Mobile No :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.AltMobileNoPrincipal || 'N/A'}
//                 </td>
//               </tr>
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   E-Mail ID :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.EMailIDPrincipal || 'N/A'}
//                 </td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Phone No :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.PhoneNoPrincipal || 'N/A'}
//                 </td>
//               </tr>

//               {/* ── ADMISSION COORDINATOR ── */}
//               <tr className='bg-gray-100'>
//                 <th
//                   colSpan={4}
//                   className='text-center p-2 border border-black font-bold'
//                 >
//                   Admission Coordinator
//                 </th>
//               </tr>

//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Name :
//                 </td>
//                 <td colSpan={3} className='p-2 border border-black'>
//                   {d.MemberName || 'N/A'}
//                 </td>
//               </tr>
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Designation :
//                 </td>
//                 <td colSpan={3} className='p-2 border border-black'>
//                   {d.Designation || 'N/A'}
//                 </td>
//               </tr>
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Mobile No :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.MobileNoCoOrdinator || 'N/A'}
//                 </td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Alternate Mobile No :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.AltMobileNoCoOrdinator || 'N/A'}
//                 </td>
//               </tr>
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   E-Mail ID :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.EMailIDCoOrdinator || 'N/A'}
//                 </td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Phone No :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.PhoneNoCoOrdinator || 'N/A'}
//                 </td>
//               </tr>

//               {/* ── AVAILABLE COURSES ── */}
//               <tr className='bg-gray-100'>
//                 <th
//                   colSpan={4}
//                   className='text-center p-2 border border-black font-bold'
//                 >
//                   Available Courses (All Units are displayed separately)
//                 </th>
//               </tr>
//               <tr className='bg-gray-100'>
//                 <th
//                   colSpan={4}
//                   className='text-center p-2 border border-black font-bold'
//                 >
//                   Course Details
//                 </th>
//               </tr>

//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Course Name :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.CourseName || 'N/A'}
//                 </td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Course Code :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.CourseCode || courseCode || 'N/A'}
//                 </td>
//               </tr>
//               <tr>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Duration :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.Duration || 'N/A'}
//                 </td>
//                 <td className='p-2 border border-black font-semibold bg-gray-50'>
//                   Full Time / Part Time :
//                 </td>
//                 <td className='p-2 border border-black'>
//                   {d.FullTimePartTime || 'N/A'}
//                 </td>
//               </tr>
//             </tbody>
//           </table>

//           <div className='mt-4 font-bold text-sm'>
//             Information Last Updated on : {d.LastModifiedOn || 'N/A'}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default InstituteDetailsPrint
import React, { useEffect, useState } from 'react'

import { GetInstituteDetails } from '../../Endpoints_All/Institute/institute'
import BoardLogo from '../../assets/Board Logo - small size.jpg'
import independencedayindia20 from '../../assets/independencedayindia20.jpg'
import agent from '../../lib/api/agent'
import { useSearchParams } from 'react-router-dom'
import useLoading from '../../Hooks/useLoading'
import { useRef } from 'react'

const InstituteDetailsPrint = () => {
  const { startLoading, stopLoading, isLoading } = useLoading()
  const [searchParams] = useSearchParams()

  const instituteId = searchParams.get('instituteId')
  const courseCode = searchParams.get('courseCode')

  const [courseDetails, setCourseDetails] = useState(null)
  const hasPrinted = useRef(false)

  useEffect(() => {
    if (instituteId) fetchInstituteDetails()
  }, [instituteId, courseCode])

  const fetchInstituteDetails = async () => {
    startLoading()
    try {
      const res = await agent.get(
        `${GetInstituteDetails}/${instituteId}/${courseCode}`
      )
      const json = res.data


      if (json?.Status === 'Success') {
        setCourseDetails(json.Data)

        if (!hasPrinted.current) {
          hasPrinted.current = true
          setTimeout(() => {
            window.print()
          }, 800)
        }
      }
    } catch (error) {
      console.error('Error loading institute details', error)
    } finally {
      stopLoading()
    }
  }

  if (!courseDetails) return null

  const d = courseDetails
  
  // Get Principal details (MemberTypeID == 6 as per old code)
  const principal = d.ListInstituteMember?.find(member => member.MemberTypeID === 6) || {}
  
  // Get Admission Coordinator details (MemberTypeID == 7 as per old code)
  const coordinator = d.ListInstituteMember?.find(member => member.MemberTypeID === 7) || {}
  
  // If no member found with MemberTypeID, try to use the root level data
  const hasPrincipalInList = Object.keys(principal).length > 0
  const hasCoordinatorInList = Object.keys(coordinator).length > 0

  // Get the specific course if courseCode is provided, otherwise use first course
  const selectedCourse = courseCode 
    ? d.ListInstituteCourse?.find(course => course.CourseCode === courseCode)
    : d.ListInstituteCourse?.[0]

  return (
    <div className='bg-white p-4 md:p-10 min-h-screen'>
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

      <div className='max-w-full mx-auto bg-white border border-black shadow-sm'>
        {/* ── HEADER ── */}
        <div className='p-4 border-b border-black'>
          <div className='flex justify-between items-center text-center'>
            <img src={independencedayindia20} alt='Emblem' className='h-20' />
            <div className='flex-1 px-4'>
              <h1 className='text-sm font-semibold'>
                Government of Maharashtra
              </h1>
              <h2 className='text-sm'>
                Skill, Employment, Entrepreneurship and Innovation Department
              </h2>
              <h2 className='text-md font-bold text-blue-900'>
                Maharashtra State Board of Skill, Vocational Education and
                Training
              </h2>
            </div>
            <img src={BoardLogo} alt='Logo' className='h-20' />
          </div>
        </div>

        {/* ── VTI TABLE ── */}
        <div className='overflow-x-auto p-4'>
          <table className='w-full border-collapse border border-black text-sm'>
            <tbody>
              {/* Section Header */}
              <tr className='bg-gray-100'>
                <th
                  colSpan={4}
                  className='text-center p-2 border border-black font-bold'
                >
                  Vocational Training Institute (VTI)
                </th>
              </tr>

              {/* Institute Name */}
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/4'>
                  Institute Name :
                </td>
                <td colSpan={3} className='p-2 border border-black'>
                  {d.InstituteCode} - {d.InstituteName || 'N/A'}
                </td>
              </tr>

              {/* Institute Address */}
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Institute Address :
                </td>
                <td colSpan={3} className='p-2 border border-black'>
                  {d.InstituteAddress || 'N/A'}
                </td>
              </tr>

              {/* City / Pin Code */}
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/4'>
                  City :
                </td>
                <td className='p-2 border border-black w-1/4'>
                  {d.City || 'N/A'}
                </td>
                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/4'>
                  Pin Code :
                </td>
                <td className='p-2 border border-black w-1/4'>
                  {d.PinCode || 'N/A'}
                </td>
              </tr>

              {/* Taluka / District */}
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Taluka :
                </td>
                <td className='p-2 border border-black'>{d.Taluka || 'N/A'}</td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  District :
                </td>
                <td className='p-2 border border-black'>
                  {d.District || 'N/A'}
                </td>
              </tr>

              {/* Region / State */}
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Region :
                </td>
                <td className='p-2 border border-black'>{d.Region || 'N/A'}</td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  State :
                </td>
                <td className='p-2 border border-black'>{d.State || 'N/A'}</td>
              </tr>

              {/* Phone / Fax */}
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Phone No. :
                </td>
                <td className='p-2 border border-black'>
                  {d.PhoneNo || 'N/A'}
                </td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Fax No. :
                </td>
                <td className='p-2 border border-black'>{d.FaxNo || 'N/A'}</td>
              </tr>

              {/* Email / Website */}
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  E-Mail ID :
                </td>
                <td className='p-2 border border-black'>
                  {d.EMailID || 'N/A'}
                </td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Web Site :
                </td>
                <td className='p-2 border border-black'>
                  {d.WebSite || 'N/A'}
                </td>
              </tr>

              {/* ── HEAD OF INSTITUTE (PRINCIPAL) ── */}
              <tr className='bg-gray-100'>
                <th
                  colSpan={4}
                  className='text-center p-2 border border-black font-bold'
                >
                  Head of Institute
                </th>
              </tr>

              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Name :
                </td>
                <td colSpan={3} className='p-2 border border-black'>
                  {hasPrincipalInList 
                    ? principal.MemberName 
                    : d.AuthorizedPersonName || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Designation :
                </td>
                <td colSpan={3} className='p-2 border border-black'>
                  {hasPrincipalInList 
                    ? principal.Designation 
                    : d.Designation || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Mobile No :
                </td>
                <td className='p-2 border border-black'>
                  {hasPrincipalInList 
                    ? principal.MobileNo 
                    : d.AuthorizedPersonMobileNo1 || 'N/A'}
                </td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Alternate Mobile No :
                </td>
                <td className='p-2 border border-black'>
                  {hasPrincipalInList 
                    ? principal.AltMobileNo 
                    : d.AuthorizedPersonMobileNo2 || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  E-Mail ID :
                </td>
                <td className='p-2 border border-black'>
                  {hasPrincipalInList 
                    ? principal.EMailiD 
                    : d.AuthorizedPersonEmailId || 'N/A'}
                </td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Phone No :
                </td>
                <td className='p-2 border border-black'>
                  {hasPrincipalInList 
                    ? principal.PhoneNo 
                    : d.PhoneNo || 'N/A'}
                </td>
              </tr>

              {/* ── ADMISSION COORDINATOR ── */}
              <tr className='bg-gray-100'>
                <th
                  colSpan={4}
                  className='text-center p-2 border border-black font-bold'
                >
                  Admission Coordinator
                </th>
              </tr>

              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Name :
                </td>
                <td colSpan={3} className='p-2 border border-black'>
                  {hasCoordinatorInList ? coordinator.MemberName : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Designation :
                </td>
                <td colSpan={3} className='p-2 border border-black'>
                  {hasCoordinatorInList ? coordinator.Designation : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Mobile No :
                </td>
                <td className='p-2 border border-black'>
                  {hasCoordinatorInList ? coordinator.MobileNo : 'N/A'}
                </td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Alternate Mobile No :
                </td>
                <td className='p-2 border border-black'>
                  {hasCoordinatorInList ? coordinator.AltMobileNo : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  E-Mail ID :
                </td>
                <td className='p-2 border border-black'>
                  {hasCoordinatorInList ? coordinator.EMailiD : 'N/A'}
                </td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Phone No :
                </td>
                <td className='p-2 border border-black'>
                  {hasCoordinatorInList ? coordinator.PhoneNo : 'N/A'}
                </td>
              </tr>

              {/* ── COURSE DETAILS SECTION ── */}
              {selectedCourse && (
                <>
                  <tr className='bg-gray-100'>
                    <th
                      colSpan={4}
                      className='text-center p-2 border border-black font-bold'
                    >
                      Course Details
                    </th>
                  </tr>

                  <tr>
                    <td className='p-2 border border-black font-semibold bg-gray-50'>
                      Course Name :
                    </td>
                    <td className='p-2 border border-black' colSpan={3}>
                      {selectedCourse.Course || 'N/A'}
                    </td>
                  </tr>

                  <tr>
                    <td className='p-2 border border-black font-semibold bg-gray-50'>
                      Course Code :
                    </td>
                    <td className='p-2 border border-black'>
                      {selectedCourse.CourseCode || 'N/A'}
                    </td>
                    <td className='p-2 border border-black font-semibold bg-gray-50'>
                      Course Type :
                    </td>
                    <td className='p-2 border border-black'>
                      {selectedCourse.CourseType || 'N/A'}
                    </td>
                  </tr>

                  <tr>
                    <td className='p-2 border border-black font-semibold bg-gray-50'>
                      Duration :
                    </td>
                    <td className='p-2 border border-black'>
                      {selectedCourse.Duration || 'N/A'}
                    </td>
                    <td className='p-2 border border-black font-semibold bg-gray-50'>
                      Full Time / Part Time :
                    </td>
                    <td className='p-2 border border-black'>
                      {selectedCourse.FullTimePartTime || 'N/A'}
                    </td>
                  </tr>

                  <tr>
                    <td className='p-2 border border-black font-semibold bg-gray-50'>
                      Total Intake :
                    </td>
                    <td className='p-2 border border-black'>
                      {selectedCourse.TotalIntake || 'N/A'}
                    </td>
                    <td className='p-2 border border-black font-semibold bg-gray-50'>
                      Current Vacancy :
                    </td>
                    <td className='p-2 border border-black'>
                      {selectedCourse.CurrentVacancy || 'N/A'}
                    </td>
                  </tr>

                  <tr>
                    <td className='p-2 border border-black font-semibold bg-gray-50'>
                      Course Batch Start Date :
                    </td>
                    <td className='p-2 border border-black'>
                      {selectedCourse.CourseBatchStartDate || 'N/A'}
                    </td>
                    <td className='p-2 border border-black font-semibold bg-gray-50'>
                      Admission Last Date :
                    </td>
                    <td className='p-2 border border-black'>
                      {selectedCourse.AdmissionLastDate || 'N/A'}
                    </td>
                  </tr>
                </>
              )}

              {/* ── ALL COURSES LIST TABLE ── */}
              <tr className='bg-gray-100'>
                <th
                  colSpan={4}
                  className='text-center p-2 border border-black font-bold'
                >
                  Available Courses (All Units are displayed separately)
                </th>
              </tr>
              
              <tr>
                <td colSpan={4} className='p-0'>
                  <table className='w-full border-collapse border border-black text-sm'>
                    <thead>
                      <tr className='bg-gray-100'>
                        <th className='p-2 border border-black text-center'>Sr. No.</th>
                        <th className='p-2 border border-black text-center'>Course Code</th>
                        <th className='p-2 border border-black text-center'>Course Name</th>
                        <th className='p-2 border border-black text-center'>Course Type</th>
                        <th className='p-2 border border-black text-center'>Full Time/Part Time</th>
                        <th className='p-2 border border-black text-center'>Duration</th>
                        <th className='p-2 border border-black text-center'>Intake</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.ListInstituteCourse?.map((course, index) => (
                        <tr key={course.CourseID}>
                          <td className='p-2 border border-black text-center'>{index + 1}</td>
                          <td className='p-2 border border-black'>{course.CourseCode || 'N/A'}</td>
                          <td className='p-2 border border-black'>{course.Course || 'N/A'}</td>
                          <td className='p-2 border border-black'>{course.CourseType || 'N/A'}</td>
                          <td className='p-2 border border-black'>{course.FullTimePartTime || 'N/A'}</td>
                          <td className='p-2 border border-black'>{course.Duration || 'N/A'}</td>
                          <td className='p-2 border border-black text-center'>{course.TotalIntake || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          <div className='mt-4 font-bold text-sm'>
            Information Last Updated on : {d.LastModifiedOn || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstituteDetailsPrint