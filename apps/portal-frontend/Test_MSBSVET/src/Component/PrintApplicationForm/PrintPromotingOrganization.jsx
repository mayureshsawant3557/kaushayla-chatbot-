// import React from 'react';

// function PromotingOrganization() {

//     return (
//         <div className="w-[95%] max-w-[900px] mx-auto my-5 border border-gray-300 p-5 bg-white font-sans">
//             {/* Header Section */}
//             <div className="flex flex-col md:flex-row justify-between items-center text-center mb-2">
//                 <div className="logo-left mb-2 md:mb-0">
//                     <img
//                         src="https://staging.msbsvet.edu.in/App_Themes/default/images/independencedayindia20.jpg"
//                         alt="State Emblem"
//                         className="h-[60px]"
//                     />
//                 </div>
//                 <div className="header-text flex-grow">
//                     <div className="flex justify-between text-[10px] text-gray-600 mb-1">
//                         <span>06/03/2026, 16:24</span>
//                         <span>Promoting Organization ID: 202512P660046</span>
//                     </div>
//                     <h3 className="text-sm font-bold uppercase">Government of Maharashtra</h3>
//                     <h3 className="text-xs font-normal">Skill, Employment, Entrepreneurship and Innovation Department</h3>
//                     <h2 className="text-sm font-bold uppercase text-[#2c3e50]">Maharashtra State Board of Skill, Vocational Education and Training</h2>
//                     <h1 className="text-lg font-bold mt-2">Promoting Organization</h1>
//                     <p className="text-sm font-bold">Promoting Organization ID:</p>
//                 </div>
//                 <div className="logo-right">
//                     <img
//                         src="https://staging.msbsvet.edu.in/App_Themes/default/images/Board%20Logo%20-%20small%20size.jpg"
//                         alt="MSBSVET Logo"
//                         className="h-[60px]"
//                     />
//                 </div>
//             </div>

//             {/* Form Table */}
//             <div className="border border-[#a2b9bc]">

//                 {/* Section Header */}
//                 <div className="bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-sm flex items-center">
//                     Promoting Organization <span className="ml-2 text-green-600"></span>
//                 </div>

//                 {/* Row 1 */}
//                 <div className="flex flex-col md:flex-row border-b border-[#a2b9bc]">
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Type of Promoting Organization</div>
//                     <div className="p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]"></div>
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Government/ Private Status</div>
//                     <div className="p-2 text-xs md:w-[25%]"></div>
//                 </div>

//                 {/* Row 2 */}
//                 <div className="flex flex-col md:flex-row border-b border-[#a2b9bc]">
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Name of Promoting Organization</div>
//                     <div className="p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]"></div>
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Date of Registration/
//                         Incorporation/
//                         Establishmen</div>
//                     <div className="p-2 text-xs md:w-[25%]"></div>
//                 </div>

//                 {/* Row 3 */}
//                 <div className="flex flex-col md:flex-row border-b border-[#a2b9bc]">
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Registration/
//                         Incorporation
//                         Number/ GR
//                         Number</div>
//                     <div className="p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]"></div>
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Upload
//                         Registration/
//                         Incorporation
//                         Certificate</div>
//                     <div className="p-2 text-xs md:w-[25%]"></div>
//                 </div>

//                 {/* Row 4: Address */}
//                 <div className="flex flex-col md:flex-row border-b border-[#a2b9bc]">
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Address as
//                         mentioned
//                         during
//                         registrationPAN of
//                         Promoting
//                         Organization</div>
//                     <div className="p-2 text-xs flex-grow"></div>
//                 </div>

//                 {/* Row 5 */}
//                 <div className="flex flex-col md:flex-row border-b border-[#a2b9bc]">
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Pin Number</div>
//                     <div className="p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]"></div>
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">City/ Village</div>
//                     <div className="p-2 text-xs md:w-[25%]"></div>
//                 </div>

//                 {/* Row 6 */}
//                 <div className="flex flex-col md:flex-row border-b border-[#a2b9bc]">
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Taluka</div>
//                     <div className="p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]"></div>
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">District</div>
//                     <div className="p-2 text-xs md:w-[25%]"></div>
//                 </div>

//                 {/* Row 7: State */}
//                 <div className="flex flex-col md:flex-row border-b border-[#a2b9bc]">
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">State</div>
//                     <div className="p-2 text-xs flex-grow"></div>
//                 </div>

//                 {/* Row 8 */}
//                 <div className="flex flex-col md:flex-row border-b border-[#a2b9bc]">
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">PAN of
//                         Promoting
//                         Organization</div>
//                     <div className="p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]"></div>
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Upload PAN
//                         Card of
//                         Promoting
//                         Organization</div>
//                     <div className="p-2 text-xs md:w-[25%]"></div>
//                 </div>

//                 {/* Row 9 */}
//                 <div className="flex flex-col md:flex-row border-b border-[#a2b9bc]">
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">Phone Number</div>
//                     <div className="p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]"></div>
//                     <div className="p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]">E-Mail ID</div>
//                     <div className="p-2 text-xs md:w-[25%]"></div>
//                 </div>

//                 {/* Full Width Section Headers */}
//                 {["Promoter/s", "Authorized Person"].map((title) => (
//                     <div key={title} className="bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-xs">{title}</div>
//                 ))}

//                 <div className="p-2 text-xs border-b border-[#a2b9bc] min-h-[30px]"></div>

//                 <div className="bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-xs">Principal Promoter</div>

//                 <div className="p-2 text-xs border-b border-[#a2b9bc] min-h-[30px]"></div>

//                 {["Member", "Affiliated Institutes", "Applied Institute"].map((title) => (
//                     <div key={title} className="bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-xs">{title}</div>
//                 ))}
//             </div>

//             {/* Footer */}
//             <div className="mt-4 border border-[#a2b9bc] text-center p-2 font-bold text-sm">
//                 !! कौशल्यम् बलम् !!
//             </div>
//         </div>
//     );
// }

// export default PromotingOrganization;

// import React, { useEffect, useState } from 'react'
// import { useSearchParams } from 'react-router-dom'
// import agent from '../../lib/api/agent'
// import BoardLogo from '../../assets/Board Logo - small size.jpg'
// import independencedayindia from '../../assets/independencedayindia20.jpg'
// import { GetPromotingOrganisationDetails } from '../../Endpoints_All/Base/Institute'

// const fmt = (val, fallback = '—') => val || fallback
// const fmtDate = d => {
//   if (!d || d.startsWith('0001')) return '—'
//   return d.substring(0, 10)
// }

// function PromotingOrganization () {
//   const [searchParams] = useSearchParams()

//   // instituteId is the numeric ID — promotingOrgId is the display string like "202512P660046"
//   const instituteId = parseInt(searchParams.get('instituteId'), 10)
//   const promotingOrgId = searchParams.get('promotingOrgId')
//   const userLoginID = searchParams.get('userLoginID') || ''

//   const [orgData, setOrgData] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     if (instituteId) fetchOrgDetails()
//   }, [instituteId])

//   const fetchOrgDetails = async () => {
//     try {
//       const res = await agent.post(GetPromotingOrganisationDetails, {
//         instituteId: instituteId,
//         exitInstituteID: 0,
//         userLoginID: userLoginID,
//         pageCode: 'ExistingInstitute',
//         itemId: 0,
//         ipAddress: ''
//       })
//       console.log('------>>>>>>', res.data);

//       if (res.data?.Status === 'Success' && res.data?.Data) {
//         setOrgData(res.data.Data)
//       } else {
//         setError('No data found.')
//       }
//     } catch (err) {
//       console.error('fetchOrgDetails error:', err)
//       setError('Failed to load promoting organization details.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Print after data loads
//   useEffect(() => {
//     if (!loading && !error && orgData) {
//       const timer = setTimeout(() => window.print(), 800)
//       return () => clearTimeout(timer)
//     }
//   }, [loading, error, orgData])

//   if (loading) return <div className='p-4'>Loading...</div>
//   if (error) return <div className='p-4 text-red-600'>{error}</div>

//   const o = orgData

//   return (
//     <div className='w-[95%] max-w-[900px] mx-auto my-5 border border-gray-300 p-5 bg-white font-sans'>
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

//       {/* Header Section */}
//       <div className='flex flex-col md:flex-row justify-between items-center text-center mb-2'>
//         <div className='logo-left mb-2 md:mb-0'>
//           <img
//             src={independencedayindia}
//             alt='State Emblem'
//             className='h-[60px]'
//           />
//         </div>
//         <div className='header-text flex-grow'>
//           <div className='flex justify-between text-[10px] text-gray-600 mb-1'>
//             <span>{new Date().toLocaleString()}</span>
//             <span>Promoting Organization ID: {promotingOrgId}</span>
//           </div>
//           <h3 className='text-sm font-bold uppercase'>
//             Government of Maharashtra
//           </h3>
//           <h3 className='text-xs font-normal'>
//             Skill, Employment, Entrepreneurship and Innovation Department
//           </h3>
//           <h2 className='text-sm font-bold uppercase text-[#2c3e50]'>
//             Maharashtra State Board of Skill, Vocational Education and Training
//           </h2>
//           <h1 className='text-lg font-bold mt-2'>Promoting Organization</h1>
//           <p className='text-sm font-bold'>
//             Promoting Organization ID: {promotingOrgId}
//           </p>
//         </div>
//         <div className='logo-right'>
//           <img src={BoardLogo} alt='MSBSVET Logo' className='h-[60px]' />
//         </div>
//       </div>

//       {/* Form Table */}
//       <div className='border border-[#a2b9bc]'>
//         {/* Section Header */}
//         <div className='bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-sm flex items-center'>
//           Promoting Organization
//         </div>

//         {/* Row 1 */}
//         <div className='flex flex-col md:flex-row border-b border-[#a2b9bc]'>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Type of Promoting Organization
//           </div>
//           <div className='p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]'>
//             {fmt(o?.TypeOfPromotingOrganization)}
//           </div>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Government/ Private Status
//           </div>
//           <div className='p-2 text-xs md:w-[25%]'>
//             {fmt(o?.GovernmentPrivateStatus)}
//           </div>
//         </div>

//         {/* Row 2 */}
//         <div className='flex flex-col md:flex-row border-b border-[#a2b9bc]'>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Name of Promoting Organization
//           </div>
//           <div className='p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]'>
//             {fmt(o?.NameOfPromotingOrganization)}
//           </div>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Date of Registration / Incorporation / Establishment
//           </div>
//           <div className='p-2 text-xs md:w-[25%]'>
//             {fmtDate(o?.DateOfRegistration)}
//           </div>
//         </div>

//         {/* Row 3 */}
//         <div className='flex flex-col md:flex-row border-b border-[#a2b9bc]'>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Registration / Incorporation Number / GR Number
//           </div>
//           <div className='p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]'>
//             {fmt(o?.RegistrationNumber)}
//           </div>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Upload Registration / Incorporation Certificate
//           </div>
//           <div className='p-2 text-xs md:w-[25%]'>
//             {o?.RegistrationCertificatePath ? 'Uploaded' : '—'}
//           </div>
//         </div>

//         {/* Row 4: Address */}
//         <div className='flex flex-col md:flex-row border-b border-[#a2b9bc]'>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Address as mentioned during Registration
//           </div>
//           <div className='p-2 text-xs flex-grow'>{fmt(o?.Address)}</div>
//         </div>

//         {/* Row 5 */}
//         <div className='flex flex-col md:flex-row border-b border-[#a2b9bc]'>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Pin Number
//           </div>
//           <div className='p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]'>
//             {fmt(o?.PinCode)}
//           </div>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             City/ Village
//           </div>
//           <div className='p-2 text-xs md:w-[25%]'>{fmt(o?.City)}</div>
//         </div>

//         {/* Row 6 */}
//         <div className='flex flex-col md:flex-row border-b border-[#a2b9bc]'>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Taluka
//           </div>
//           <div className='p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]'>
//             {fmt(o?.Taluka)}
//           </div>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             District
//           </div>
//           <div className='p-2 text-xs md:w-[25%]'>{fmt(o?.District)}</div>
//         </div>

//         {/* Row 7: State */}
//         <div className='flex flex-col md:flex-row border-b border-[#a2b9bc]'>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             State
//           </div>
//           <div className='p-2 text-xs flex-grow'>{fmt(o?.State)}</div>
//         </div>

//         {/* Row 8 */}
//         <div className='flex flex-col md:flex-row border-b border-[#a2b9bc]'>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             PAN of Promoting Organization
//           </div>
//           <div className='p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]'>
//             {fmt(o?.PAN)}
//           </div>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Upload PAN Card of Promoting Organization
//           </div>
//           <div className='p-2 text-xs md:w-[25%]'>
//             {o?.PANCardPath ? 'Uploaded' : '—'}
//           </div>
//         </div>

//         {/* Row 9 */}
//         <div className='flex flex-col md:flex-row border-b border-[#a2b9bc]'>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             Phone Number
//           </div>
//           <div className='p-2 text-xs md:w-[25%] border-r border-[#a2b9bc]'>
//             {fmt(o?.PhoneNo)}
//           </div>
//           <div className='p-2 text-xs font-bold bg-[#fafafa] border-r border-[#a2b9bc] md:w-[25%]'>
//             E-Mail ID
//           </div>
//           <div className='p-2 text-xs md:w-[25%]'>{fmt(o?.EmailID)}</div>
//         </div>

//         {/* Promoter/s */}
//         <div className='bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-xs'>
//           Promoter/s
//         </div>

//         {/* Authorized Person */}
//         <div className='bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-xs'>
//           Authorized Person
//         </div>
//         <div className='p-2 text-xs border-b border-[#a2b9bc] min-h-[30px]'>
//           {fmt(o?.AuthorizedPerson)}
//         </div>

//         {/* Principal Promoter */}
//         <div className='bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-xs'>
//           Principal Promoter
//         </div>
//         <div className='p-2 text-xs border-b border-[#a2b9bc] min-h-[30px]'>
//           {fmt(o?.PrincipalPromoter)}
//         </div>

//         {/* Member */}
//         <div className='bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-xs'>
//           Member
//         </div>
//         <div className='p-2 text-xs border-b border-[#a2b9bc] min-h-[30px]'>
//           {fmt(o?.Member)}
//         </div>

//         {/* Affiliated Institutes */}
//         <div className='bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-xs'>
//           Affiliated Institutes
//         </div>
//         <div className='p-2 text-xs border-b border-[#a2b9bc] min-h-[30px]'>
//           {fmt(o?.AffiliatedInstitutes)}
//         </div>

//         {/* Applied Institute */}
//         <div className='bg-[#f8f9fa] border-b border-[#a2b9bc] p-2 font-bold text-xs'>
//           Applied Institute
//         </div>
//         <div className='p-2 text-xs border-b border-[#a2b9bc] min-h-[30px]'>
//           {fmt(o?.AppliedInstitute)}
//         </div>
//       </div>

//       {/* Footer */}
//       <div className='mt-4 border border-[#a2b9bc] text-center p-2 font-bold text-sm'>
//         !! कौशल्यम् बलम् !!
//       </div>
//     </div>
//   )
// }

// export default PromotingOrganization
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import agent from '../../lib/api/agent'
import { getDeviceIP } from '../../utils/CommonHelper' // adjust path if needed
import BoardLogo from '../../assets/Board Logo - small size.jpg'
import independencedayindia from '../../assets/independencedayindia20.jpg'
import {
    GetAssociatedInstituteByPromotingOrganisationID,
    GetPromoterDetailsByInstituteID,
    GetPromotingOrganisationDetails
} from '../../Endpoints_All/Base/Institute'

const VERIFIED_ICON = 'https://msbsvet.edu.in/Images/RightSign.png'
const QUESTION_ICON = 'https://msbsvet.edu.in/Images/QuestionMark.png'
// Red circle + red cross, same style as the green right sign.
// Replace with a hosted URL (e.g. 'https://msbsvet.edu.in/Images/Cross.png') if you have one.
const REJECTED_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<circle cx="12" cy="12" r="10" fill="none" stroke="#f74b4b" stroke-width="2.4"/>' +
    '<path d="M8.2 8.2l7.6 7.6M15.8 8.2l-7.6 7.6" stroke="#f74b4b" stroke-width="2.6" stroke-linecap="round"/>' +
    '</svg>'
)}`

const fmt = (val, fallback = '—') => val || fallback
const fmtDate = d => {
    if (!d || d.startsWith('0001')) return '—'
    return d.substring(0, 10)
}
const cleanStatus = s => (s || '').toString().trim().toUpperCase()

/* One icon component used everywhere:
   V = VERIFIED_ICON, R = REJECTED_ICON, ANY other value = QUESTION_ICON */
const StatusIcon = ({ status, size = 26 }) => {
    const s = cleanStatus(status)

    if (s === 'V') return <img width={`${size}px`} src={VERIFIED_ICON} alt="verified" />
    if (s === 'R') return <img width={`${size}px`} src={REJECTED_ICON} alt="rejected" />
    return <img width={`${size}px`} src={QUESTION_ICON} alt="not verified" />
}

/* Status badge: V = Verified, R = Rejected, anything else = Not Verified */
const renderStatus = (status, reason) => {
    const s = cleanStatus(status)

    let label, color

    if (s === 'V') {
        label = 'Verified'
        color = 'green'
    } else if (s === 'R') {
        label = `Rejected${reason ? ` - ${reason}` : ''}`
        color = '#f52828'
    } else {
        label = 'Not Verified'
        color = '#2563eb'
    }

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '8px', verticalAlign: 'middle' }}>
            <StatusIcon status={s} size={26} />
            <span style={{ color, fontWeight: 'bold' }}>{label}</span>
        </span>
    )
}

function PromotingOrganization() {
    const [searchParams] = useSearchParams()

    const instituteId = parseInt(searchParams.get('instituteId'), 10)
    const promotingOrgId = searchParams.get('promotingOrgId')
    const userLoginID = searchParams.get('userLoginID') || ''

    const [orgData, setOrgData] = useState(null)
    const [promotersData, setPromotersData] = useState({
        authorizedPerson: [],
        chairman: [],
        members: []
    })
    const [associatedInstitutes, setAssociatedInstitutes] = useState({
        affiliated: [],
        applied: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const extractId = (html) => {
        if (!html) return ''

        const temp = document.createElement('div')
        temp.innerHTML = html

        const anchor = temp.querySelector('a')
        return anchor ? anchor.textContent.trim() : ''
    }

    const openInstituteDetails = (instId, courseCode = 0) => {
        if (!instId) return

        const popupWidth = 1000
        const popupHeight = 750
        const left = (window.screen.width - popupWidth) / 2
        const top = (window.screen.height - popupHeight) / 2

        window.open(
            `${window.location.origin}/React/InstituteDetailsPrint?instituteId=${instId}&courseCode=${courseCode}`,
            '_blank',
            `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
        )
    }

    const openStaffDetails = (staffProfileHtml) => {
        if (!staffProfileHtml) return

        // userLoginID = text inside the anchor
        const staffLoginIdMatch = staffProfileHtml.match(/>([^<]+)</)
        const staffLoginId = staffLoginIdMatch ? staffLoginIdMatch[1] : ''

        // staffID = P1 value
        const staffIdMatch = staffProfileHtml.match(/P1=(\d+)/)
        const staffID = staffIdMatch ? staffIdMatch[1] : ''

        const popupWidth = 1000
        const popupHeight = 750
        const left = (window.screen.width - popupWidth) / 2
        const top = (window.screen.height - popupHeight) / 2

        window.open(
            `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffID}&userLoginID=${staffLoginId}`,
            '_blank',
            `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
        )
    }

    useEffect(() => {
        if (instituteId) {
            init()
        }
    }, [instituteId])

    const getInstituteIdFromCode = async (code) => {
        try {
            const res = await agent.get(
                `/Base/GetInstituteIDByInstituteCode?InstituteCode=${code}`
            )
            return res.data?.Data || res.data
        } catch (err) {
            console.error('Error converting promotingOrgId:', err)
            return null
        }
    }

    const init = async () => {
        setLoading(true)
        setError(null)

        try {
            // Get IP first and pass it directly (state would not be updated yet)
            let ip = ''
            try {
                ip = (await getDeviceIP()) || ''
            } catch (err) {
                console.error('Failed to get IP:', err)
            }

            let finalInstituteId = null

            // CASE 1: promotingOrgId available -> always convert
            if (promotingOrgId) {
                finalInstituteId = await getInstituteIdFromCode(promotingOrgId)
            }
            // CASE 2: fallback (only if promotingOrgId missing)
            else if (instituteId && instituteId !== 0) {
                finalInstituteId = instituteId
            }

            if (!finalInstituteId) {
                setError('Valid Institute ID not found')
                return
            }

            await Promise.all([
                fetchOrgDetails(finalInstituteId, ip),
                fetchPromoterDetails(finalInstituteId, ip),
                fetchAssociatedInstitutes(finalInstituteId, ip)
            ])
        } catch (err) {
            console.error('Init error:', err)
            setError('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const fetchOrgDetails = async (promotingId, ip) => {
        try {
            const res = await agent.post(GetPromotingOrganisationDetails, {
                instituteId: promotingId,
                exitInstituteID: 0,
                userLoginID: userLoginID,
                pageCode: 'ExistingInstitute',
                itemId: 0,
                ipAddress: ip
            })
            if (res.data?.Status === 'Success' && res.data?.Data) {
                setOrgData(res.data.Data)
            }
        } catch (err) {
            console.error('fetchOrgDetails error:', err)
            throw err
        }
    }

    const fetchPromoterDetails = async (promotingId, ip) => {
        try {
            const res = await agent.post(GetPromoterDetailsByInstituteID, {
                instituteId: promotingId,
                userLoginID: userLoginID,
                pageCode: 'PageCode',
                itemId: '0',
                ipAddress: ip
            })

            if (res.data?.Status === 'Success' && res.data?.Data) {
                const lstPromoters = res.data.Data

                const authorizedPerson = lstPromoters.filter(item => item.PromoterTypeID === 5)
                const chairman = lstPromoters.filter(item => item.PromoterTypeID === 8)
                const members = lstPromoters.filter(
                    item => item.PromoterTypeID !== 5 && item.PromoterTypeID !== 8
                )

                setPromotersData({ authorizedPerson, chairman, members })
            }
        } catch (err) {
            console.error('fetchPromoterDetails error:', err)
            throw err
        }
    }

    const fetchAssociatedInstitutes = async (promotingId, ip) => {
        try {
            const res = await agent.post(GetAssociatedInstituteByPromotingOrganisationID, {
                instituteId: promotingId,
                userLoginID: userLoginID,
                pageCode: 'PageCode',
                itemId: '0',
                ipAddress: ip
            })

            if (res.data?.Status === 'Success' && res.data?.Data) {
                const entity = res.data.Data

                const affiliated = entity.filter(item => item.PromoterTypeID === 1)
                const applied = entity.filter(item => item.PromoterTypeID === 2)

                setAssociatedInstitutes({ affiliated, applied })
            }
        } catch (err) {
            console.error('fetchAssociatedInstitutes error:', err)
            throw err
        }
    }

    // Print after data loads
    useEffect(() => {
        if (!loading && !error && orgData) {
            const timer = setTimeout(() => window.print(), 800)
            return () => clearTimeout(timer)
        }
    }, [loading, error, orgData])

    if (loading) return <div className='p-4'>Loading...</div>
    if (error) return <div className='p-4 text-red-600'>{error}</div>

    const o = orgData

    // Overall status of the promoting organization (from GetPromotingOrganisationDetails)
    const orgStatus = cleanStatus(o?.IsApprovedPromotingOrganisationStatus)

    // Promoter row with verification icon
    const renderPromoterWithIcon = (item, idx, list) => {
        const fullName = `${item.Title || ''} ${item.FirstName || ''} ${item.MiddleName || ''} ${item.LastName || ''}`.trim()
        const cleanProfileId = extractId(item.StaffProfileId)

        return (
            <div
                key={idx}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: idx !== list.length - 1 ? '1px solid #ccc' : 'none',
                    padding: '6px 0',
                    gap: '8px'
                }}
            >
                <span>
                    {fullName}{' '}
                    (
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            openStaffDetails(item.StaffProfileId)
                        }}
                        style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        {cleanProfileId}
                    </a>
                    )
                </span>
                <StatusIcon status={item.IsapprovedPromoter} size={30} />
            </div>
        )
    }

    // Institute row (affiliated / applied)
    const renderInstituteRow = (item, idx) => (
        <div
            key={idx}
            style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #ccc',
                padding: '6px 0',
                gap: '8px'
            }}
        >
            <span>
                {item.NameofInstitute}{' '}
                (
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault()
                        openInstituteDetails(item.InstituteID, 0)
                    }}
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                >
                    {extractId(item.InstituteCode)}
                </a>
                )
            </span>
            <StatusIcon status={item.IsVerified} size={30} />
        </div>
    )

    return (
        <div className='bg-white p-4 md:p-10 min-h-screen'>
            <style dangerouslySetInnerHTML={{
                __html: `
          @media print {
            .no-print { display: none; }
            body { background-color: white !important; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `
            }} />

            <div className='max-w-full mx-auto bg-white border border-black shadow-sm'>

                {/* ── HEADER ── */}
                <div className='p-4 border-b border-black'>
                    <div className='flex justify-between items-center text-center'>
                        <img src={independencedayindia} alt='Emblem' className='h-20' />
                        <div className='flex-1 px-4'>
                            <h1 className='text-sm font-semibold'>Government of Maharashtra</h1>
                            <h2 className='text-sm'>Skill, Employment, Entrepreneurship and Innovation Department</h2>
                            <h2 className='text-md font-bold text-blue-900'>
                                Maharashtra State Board of Skill, Vocational Education and Training
                            </h2>
                            <h3 className='text-lg font-bold mt-1'>Promoting Organization</h3>
                        </div>
                        <img src={BoardLogo} alt='Logo' className='h-20' />
                    </div>
                    <div className='mt-4 border-t border-black pt-2 text-center text-sm font-semibold'>
                        <p>
                            Promoting Organization ID: {fmt(promotingOrgId || o?.ApplicationID)}
                            
                        </p>
                        <p>Date: {fmtDate(o?.PromotingOrganizationRegistrationDate)}</p>
                    </div>
                </div>

                {/* ── MAIN TABLE ── */}
                <div className='overflow-x-auto p-4'>
                    <table className='w-full border-collapse border border-black text-sm'>
                        <tbody>

                            {/* Section header */}
                            <tr className='bg-gray-100'>
                                <th colSpan={4} className='text-left p-2 border border-black font-bold'>
                                    Promoting Organization
                                    {renderStatus(orgStatus)}
                                </th>
                            </tr>

                            {/* Type / Govt-Private Status */}
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/4'>
                                    Type of Promoting Organization
                                </td>
                                <td className='p-2 border border-black w-1/4'>
                                    {fmt(o?.PromotingOrganisationTypeName || o?.PromotingType)}
                                </td>
                                <td className='p-2 border border-black font-semibold bg-gray-50 w-1/4'>
                                    Government / Private Status
                                </td>
                                <td className='p-2 border border-black w-1/4'>
                                    {fmt(o?.PromoterStatus)}
                                </td>
                            </tr>

                            {/* Name / Date of Registration */}
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Name of Promoting Organization
                                </td>
                                <td className='p-2 border border-black'>
                                    {fmt(o?.NameOfPromotingOrganization)}
                                </td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Date of Registration / Incorporation / Establishment
                                </td>
                                <td className='p-2 border border-black'>
                                    {fmtDate(o?.PromotingOrganizationRegistrationDate)}
                                </td>
                            </tr>

                            {/* Registration Number / Certificate */}
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Registration / Incorporation Number / GR Number
                                </td>
                                <td className='p-2 border border-black'>
                                    {fmt(o?.OrganizatioRegistrationNumber)}
                                </td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Upload Registration / Incorporation Certificate
                                </td>
                                <td className='p-2 border border-black'>
                                    {o?.RegistrationCertificatePath || o?.PANPath ? 'Uploaded' : '—'}
                                </td>
                            </tr>

                            {/* Address */}
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Address as mentioned during Registration
                                </td>
                                <td colSpan={3} className='p-2 border border-black'>
                                    {fmt(o?.PromotingOrganizationAddress)}
                                </td>
                            </tr>

                            {/* Pin / City */}
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>Pin Number</td>
                                <td className='p-2 border border-black'>{fmt(o?.PromotingOrganizationPincode)}</td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>City / Village</td>
                                <td className='p-2 border border-black'>{fmt(o?.PromotingOrganizationCityName)}</td>
                            </tr>

                            {/* Taluka / District */}
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>Taluka</td>
                                <td className='p-2 border border-black'>{fmt(o?.PromotingOrganizationTaluka)}</td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>District</td>
                                <td className='p-2 border border-black'>{fmt(o?.PromotingOrganizationDistrict)}</td>
                            </tr>

                            {/* State */}
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>State</td>
                                <td colSpan={3} className='p-2 border border-black'>{fmt(o?.PromotingOrganizationState)}</td>
                            </tr>

                            {/* PAN / Upload PAN */}
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    PAN of Promoting Organization
                                </td>
                                <td className='p-2 border border-black'>
                                    {fmt(o?.PAN)}
                                </td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Upload PAN Card of Promoting Organization
                                </td>
                                <td className='p-2 border border-black'>
                                    {o?.PANPath ? 'Uploaded' : '—'}
                                </td>
                            </tr>

                            {/* Phone / Email */}
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>Phone Number</td>
                                <td className='p-2 border border-black'>
                                    {fmt(o?.PromotingOrganizationPhoneNumber || o?.AuthorizedRepresentativeMobileNo)}
                                </td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>E-Mail ID</td>
                                <td className='p-2 border border-black'>{fmt(o?.AuthorizedRepresentativeEMailID)}</td>
                            </tr>

                            {/* ── Authorized Person ── */}
                            <tr className='bg-gray-100'>
                                <th colSpan={4} className='text-left p-2 border border-black font-bold'>
                                    Authorized Person
                                </th>
                            </tr>
                            <tr>
                                <td colSpan={4} className='p-2 border border-black'>
                                    {promotersData.authorizedPerson.length > 0
                                        ? promotersData.authorizedPerson.map((item, idx) =>
                                            renderPromoterWithIcon(item, idx, promotersData.authorizedPerson))
                                        : 'No records found !'}
                                </td>
                            </tr>

                            {/* ── Principal Promoter (Chairman) ── */}
                            <tr className='bg-gray-100'>
                                <th colSpan={4} className='text-left p-2 border border-black font-bold'>
                                    Principal Promoter
                                </th>
                            </tr>
                            <tr>
                                <td colSpan={4} className='p-2 border border-black'>
                                    {promotersData.chairman.length > 0
                                        ? promotersData.chairman.map((item, idx) =>
                                            renderPromoterWithIcon(item, idx, promotersData.chairman))
                                        : 'No records found !'}
                                </td>
                            </tr>

                            {/* ── Member ── */}
                            <tr className='bg-gray-100'>
                                <th colSpan={4} className='text-left p-2 border border-black font-bold'>
                                    Member
                                </th>
                            </tr>
                            {promotersData.members.length > 0 ? (
                                <tr>
                                    <td colSpan={4} className='p-2 border border-black'>
                                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                            Promoter Type: {promotersData.members[0]?.PromoterType}
                                        </div>
                                        {promotersData.members.map((item, idx) =>
                                            renderPromoterWithIcon(item, idx, promotersData.members))}
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan={4} className='p-2 border border-black'>
                                        No records found !
                                    </td>
                                </tr>
                            )}

                            {/* ── Affiliated Institutes ── */}
                            <tr className='bg-gray-100'>
                                <th colSpan={4} className='text-left p-2 border border-black font-bold'>
                                    Affiliated Institutes
                                </th>
                            </tr>
                            <tr>
                                <td colSpan={4} className='p-2 border border-black'>
                                    {associatedInstitutes.affiliated.length > 0
                                        ? associatedInstitutes.affiliated.map(renderInstituteRow)
                                        : 'No records found !'}
                                </td>
                            </tr>

                            {/* ── Applied Institute ── */}
                            <tr className='bg-gray-100'>
                                <th colSpan={4} className='text-left p-2 border border-black font-bold'>
                                    Applied Institute
                                </th>
                            </tr>
                            <tr>
                                <td colSpan={4} className='p-2 border border-black'>
                                    {associatedInstitutes.applied.length > 0
                                        ? associatedInstitutes.applied.map(renderInstituteRow)
                                        : 'No records found !'}
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    {/* ── Footer ── */}
                    <div className='mt-4 text-center font-bold text-sm'>
                        !! कौशल्यम् बलम् !!
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PromotingOrganization