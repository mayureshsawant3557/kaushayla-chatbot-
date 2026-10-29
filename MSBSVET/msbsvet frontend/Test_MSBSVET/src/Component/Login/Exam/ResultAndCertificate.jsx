
// import { useState, useEffect, useContext } from 'react'
// import agent from "../../../lib/api/agent"
// import { Menu, Search } from 'lucide-react'
// import FilteredTableComponent from '../../formcomponent/FilteredTableComponent'
// import { ThemeContext } from '../../../Component/Context/ThemeContext'
// import {
//   GetcandidateresultcertificatenewAPI,
//   GetcandidateprintresultcertificateAPI,
//   // TODO: import your Certificate API endpoint here once you have it
//   // GetcandidateprintcertificateAPI,
//   GetcandidateprintcertificateAPI,
//   GetcandidateprintnoticeAPI,
// } from '../../../Endpoints_All/Candidate/primary'

// // ─────────────────────────────────────────────────────────────
// // SUB-COMPONENTS
// // ─────────────────────────────────────────────────────────────
// const DownloadBtn = ({ label, onClick, variant = "success" }) => {
//   const colorMap = {
//     success: "bg-[#28a745] hover:bg-[#218838] text-white",
//     warning: "bg-[#ffc107] hover:bg-[#e0a800] text-black",
//   }
//   return (
//     <div className="flex justify-center">
//       <button
//         type="button"
//         onClick={onClick}
//         className={`${colorMap[variant]} text-xs font-semibold px-3 py-1.5 rounded transition-colors duration-150 whitespace-nowrap`}
//       >
//         {label}
//       </button>
//     </div>
//   )
// }

// const ErrorLabel = ({ text }) => (
//   <span className="block text-center text-red-600 font-bold text-xs">
//     {text}
//   </span>
// )

// // ─────────────────────────────────────────────────────────────
// // SHARED BLOB DOWNLOADER UTILITY
// // Both Result and Certificate APIs return application/pdf blob
// // Only the apiUrl differs between them
// // ─────────────────────────────────────────────────────────────
// const downloadPdfBlob = async (apiUrl, payload, fallbackFileName) => {

//   console.log("📤 API URL       :", apiUrl)
//   console.log("📤 REQUEST PARAMS:", payload)

//   const response = await agent.get(apiUrl, {
//     params: payload,
//     responseType: 'blob',
//   })

//   console.log("📥 RESPONSE STATUS :", response?.status)
//   console.log("📥 RESPONSE HEADERS:", response?.headers)
//   console.log("📥 RESPONSE DATA   :", response?.data)

//   // Guard: backend may return JSON error instead of a real PDF
//   const contentType = response.headers?.["content-type"] || ""
//   console.log("📥 CONTENT-TYPE    :", contentType)

//   if (
//     contentType.includes("application/json") ||
//     contentType.includes("application/problem+json")
//   ) {
//     const text = await response.data.text()
//     console.error("❌ BACKEND RETURNED JSON INSTEAD OF PDF:", text)
//     let message = text
//     try { message = JSON.parse(text)?.Message || JSON.parse(text)?.message || text } catch {}
//     throw new Error(message)
//   }

//   // Prefer server-supplied filename from content-disposition header
//   // Backend sets: StatementofMarks_{candidateId}_{timestamp}.pdf
//   let fileName = fallbackFileName
//   const disposition = response.headers?.["content-disposition"]
//   console.log("📥 CONTENT-DISPOSITION:", disposition)

//   if (disposition?.includes("filename=")) {
//     fileName = disposition.split("filename=")[1].replace(/"/g, "").trim()
//     console.log("📥 FILENAME FROM HEADER:", fileName)
//   } else {
//     console.warn("⚠️ No content-disposition header — using fallback filename:", fallbackFileName)
//   }

//   const blob = new Blob([response.data], {
//     type: contentType || "application/pdf",
//   })
//   console.log("📦 BLOB SIZE:", blob.size, "bytes | TYPE:", blob.type)

//   const url  = window.URL.createObjectURL(blob)
//   const link = document.createElement("a")
//   link.href     = url
//   link.download = fileName
//   document.body.appendChild(link)
//   link.click()
//   link.remove()
//   window.URL.revokeObjectURL(url)

//   console.log("✅ FILE DOWNLOAD TRIGGERED:", fileName)
// }

// // ─────────────────────────────────────────────────────────────
// // BLOB ERROR PARSER  (handles both JSON and plain-text errors)
// // ─────────────────────────────────────────────────────────────
// const parseBlobError = async (err) => {
//   console.group("🔴 ERROR DETAILS")
//   console.error("Full error object :", err)

//   // agent.jsx intercepts axios errors and rethrows a plain {status:500} object
//   // So err.response is undefined — we read err.status directly
//   const status  = err?.response?.status ?? err?.status ?? "Unknown"
//   const errData = err?.response?.data   ?? err?.data

//   console.error("HTTP status       :", status)
//   console.error("Error data        :", errData)
//   console.groupEnd()

//   try {
//     // Case 1: error data is a Blob (responseType:blob on 4xx/5xx)
//     if (errData instanceof Blob) {
//       const errText = await errData.text()
//       console.error("❌ BLOB TEXT:", errText)
//       try {
//         const errJson = JSON.parse(errText)
//         console.error("❌ JSON:", errJson)
//         return `Error ${status}: ${errJson?.Message || errJson?.message || errJson?.title || errText}`
//       } catch {
//         return `Error ${status}: ${errText || "Something went wrong."}`
//       }
//     }

//     // Case 2: error data is already parsed JSON object
//     if (errData && typeof errData === "object") {
//       const msg = errData?.Message || errData?.message || errData?.title
//       if (msg) return `Error ${status}: ${msg}`
//     }

//     // Case 3: agent rethrew plain {status:500} — backend crash
//     if (status === 500) {
//       return `Server Error (500): The report generation failed on the server. Please contact support.`
//     }

//     // Case 4: generic fallback
//     return `Error ${status}: ${err?.message || "Something went wrong. Please try again."}`

//   } catch {
//     return "Download failed. Please try again."
//   }
// }

// // ─────────────────────────────────────────────────────────────
// // COMPONENT
// // ─────────────────────────────────────────────────────────────
// export default function ResultAndCertificate() {

//   const { color } = useContext(ThemeContext)

//   const [tableData, setTableData]   = useState([])
//   const [loading, setLoading]       = useState(false)
//   const [error, setError]           = useState('')
//   const [searchTerm, setSearchTerm] = useState('')

//   // ───────────────────────────────────────────────────────────
//   // HANDLER 1 — DOWNLOAD RESULT
//   //
//   // API  : GetcandidateprintresultcertificateAPI
//   // Route: GET /candidate-print-result-certificate
//   // Params (from backend controller):
//   //   candidateId   → long
//   //   applicationId → long
//   //   examinationId → int
//   //   isResultFresh → string
//   // Returns: PDF blob
//   //   filename: StatementofMarks_{candidateId}_{timestamp}.pdf
//   // ───────────────────────────────────────────────────────────
//   const handleDownloadResult = async (row) => {
//     try {
//       console.group("📄 DOWNLOAD RESULT — START")
//       console.log("🔵 ROW DATA:", row)

//       const payload = {
//         candidateId:   row.candidateID,    // long
//         applicationId: row.applicationID,  // long
//         examinationId: row.examinationID,  // int
//         isResultFresh: row.isResultFresh,  // string
//       }

//       console.log("🔵 RESULT PAYLOAD:", payload)
//       console.groupEnd()

//       await downloadPdfBlob(
//         GetcandidateprintresultcertificateAPI,
//         payload,
//         `Result_${row.candidateID}.pdf`
//       )

//       console.log("✅ RESULT DOWNLOAD COMPLETE")

//     } catch (err) {
//       console.error("❌ RESULT DOWNLOAD FAILED:", err)
//       const message = await parseBlobError(err)
//       alert(message)
//     }
//   }

//   // ───────────────────────────────────────────────────────────
//   // HANDLER 2 — DOWNLOAD CERTIFICATE
//   //
//   // API  : TODO → replace GetcandidateprintresultcertificateAPI
//   //        with your Certificate API import name once available
//   // Route: GET /your-certificate-endpoint
//   // Params: same as Result API
//   // Returns: PDF blob
//   // ───────────────────────────────────────────────────────────
//   const handleDownloadCertificate = async (row) => {
//     try {
//       console.group("📜 DOWNLOAD CERTIFICATE — START")
//       console.log("🔵 ROW DATA:", row)

//       const payload = {
//         candidateId:   row.candidateID,
//         applicationId: row.applicationID,
//         examinationId: row.examinationID,
//         isResultFresh: row.isResultFresh,
//       }

//       console.log("🔵 CERTIFICATE PAYLOAD:", payload)
//       console.groupEnd()

//       // TODO: replace GetcandidateprintresultcertificateAPI
//       //       with your Certificate API endpoint once available
//       await downloadPdfBlob(
//         GetcandidateprintcertificateAPI, // ← REPLACE THIS
//         payload,
//         `Certificate_${row.candidateID}.pdf`
//       )

//       console.log("✅ CERTIFICATE DOWNLOAD COMPLETE")

//     } catch (err) {
//       console.error("❌ CERTIFICATE DOWNLOAD FAILED:", err)
//       const message = await parseBlobError(err)
//       alert(message)
//     }
//   }

//   // ─────────────────────────────────────────────────────────────
//   // TABLE COLUMNS
//   //
//   // IMPORTANT: FilteredTableComponent does NOT support column.render
//   // Custom cell rendering is done via the renderCell PROP below.
//   // result / certificate / notice columns are excluded from Excel/PDF
//   // export since they contain buttons (not plain text values).
//   // ─────────────────────────────────────────────────────────────
//   const columns = [
//     { key: 'srNo',                header: 'Sr. No.',       headerClassName: 'text-center' },
//     { key: 'applicationIdDisplay', header: 'Application ID', headerClassName: 'text-center' },
//     { key: 'examinationName',     header: 'Examination',   headerClassName: 'text-center' },
//     { key: 'collegeName',         header: 'Institute',     headerClassName: 'text-center' },
//     { key: 'batchID',             header: 'Batch ID',      headerClassName: 'text-center' },
//     { key: 'courseName',          header: 'Course Name',   headerClassName: 'text-center' },
//     { key: 'resultStatus',        header: 'Result Status', headerClassName: 'text-center' },
//     // Button columns — rendered via renderCell prop, excluded from exports
//     { key: 'result',      header: 'Result',      headerClassName: 'text-center', excludeFromExport: true },
//     { key: 'certificate', header: 'Certificate', headerClassName: 'text-center', excludeFromExport: true },
//     { key: 'notice',      header: 'Notice',      headerClassName: 'text-center', excludeFromExport: true },
//   ]

//   // ─────────────────────────────────────────────────────────────
//   // RENDER CELL — passed as prop to FilteredTableComponent
//   //
//   // FilteredTableComponent internals call: renderCell(item, column, rowIndex)
//   // Returning undefined tells the component to use its default rendering.
//   //
//   // Flag logic mirrors original ASPX exactly:
//   //   Result / Certificate : flag > 0 → error label  | flag == 0 → green button
//   //   Notice               : flag > 0 → yellow button | flag == 0 → error label (OPPOSITE)
//   // ─────────────────────────────────────────────────────────────
//   const handleRenderCell = (item, column) => {
//     switch (column.key) {

//       // RESULT
//       // ASPX: Visible = DownloadRsult > 0 ? false : true  (button)
//       case 'result':
//         return Number(item.downloadResultFlag) > 0
//           ? <ErrorLabel text="Result Not Declared" />
//           : <DownloadBtn
//               label="Download Result"
//               onClick={() => handleDownloadResult(item)}
//             />

//       // CERTIFICATE
//       // ASPX: Visible = DownloadCertificate > 0 ? false : true  (button)
//       case 'certificate':
//         return Number(item.downloadCertificateFlag) > 0
//           ? <ErrorLabel text="No Certificate Generated" />
//           : <DownloadBtn
//               label="Download Certificate"
//               onClick={() => handleDownloadCertificate(item)}
//             />

//       // NOTICE — OPPOSITE flag logic
//       // ASPX: Visible = DownloadNotice > 0 ? true : false  (button)
//       case 'notice':
//         return Number(item.downloadNoticeFlag) > 0
//           ? <DownloadBtn
//               label="Download Notice"
//               variant="warning"
//               onClick={() => {
//                 // TODO: wire notice download handler when API is ready
//                 alert("Notice download coming soon.")
//               }}
//             />
//           : <ErrorLabel text="No Notice Generated" />

//       // All other columns → undefined = FilteredTableComponent default rendering
//       default:
//         return undefined
//     }
//   }

//   // ───────────────────────────────────────────────────────────
//   // API CALL — fetch table data on mount
//   // API: GetcandidateresultcertificatenewAPI
//   // Params: { candidateId }
//   // ───────────────────────────────────────────────────────────
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true)

//         const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll"))
//         const candidateId = userInfoAll?.UserID

//         console.group("📋 FETCH TABLE DATA — START")
//         console.log("🔵 SESSION userInfoAll :", userInfoAll)
//         console.log("🔵 CANDIDATE ID        :", candidateId)

//         if (!candidateId) {
//           console.error("❌ candidateId is missing in sessionStorage")
//           console.groupEnd()
//           setError("Candidate ID not found")
//           return
//         }

//         const response = await agent.get(
//           GetcandidateresultcertificatenewAPI,
//           { params: { candidateId } }
//         )

//         console.log("📥 LIST API — STATUS  :", response?.status)
//         console.log("📥 LIST API — HEADERS :", response?.headers)
//         console.log("📥 LIST API — RAW DATA:", response?.data)

//         const apiData =
//           response?.data?.Data ||
//           response?.data?.data ||
//           response?.data || []

//         console.log("📥 LIST API — RESOLVED ARRAY:", apiData)
//         console.log("📥 LIST API — ROW COUNT      :", apiData.length)

//         const formattedData = apiData.map((item, index) => ({

//           // ── display fields ────────────────────────────────
//           srNo:                 index + 1,
//           applicationIdDisplay: item.ApplicationIDDisplay || '---',
//           examinationName:      item.ExaminationName      || '---',
//           collegeName:          item.CollegeName          || '---',
//           batchID:              item.BatchID              || '---',
//           courseName:           item.CourseName           || '---',
//           resultStatus:         item.ResultStatus         || '---',

//           // ── download payload fields ───────────────────────
//           // mirrors ASPX CommandArgument:
//           // CandidateID;ApplicationID;BatchID;ExaminationID;IsResultFresh
//           candidateID:   item.CandidateID,
//           applicationID: item.ApplicationID,
//           examinationID: item.ExaminationID,
//           isResultFresh: item.IsResultFresh,

//           // ── visibility flags (raw numbers from API) ───────
//           // ASPX uses: Convert.ToInt32(Eval("DownloadRsult"))  ← note ASPX typo
//           // 0 = available → show button
//           // >0 = not available → show error label
//           downloadResultFlag:      Number(item.DownloadRsult      ?? item.DownloadResult      ?? 1),
//           downloadCertificateFlag: Number(item.DownloadCertificate ?? 1),
//           // Notice is opposite: >0 = available, 0 = not available
//           downloadNoticeFlag:      Number(item.DownloadNotice      ?? 0),
//         }))

//         console.log("✅ FORMATTED TABLE DATA:", formattedData)
//         console.log("✅ SAMPLE ROW [0] FLAGS:", {
//           downloadResultFlag:      formattedData[0]?.downloadResultFlag,
//           downloadCertificateFlag: formattedData[0]?.downloadCertificateFlag,
//           downloadNoticeFlag:      formattedData[0]?.downloadNoticeFlag,
//         })
//         console.groupEnd()

//         setTableData(formattedData)

//       } catch (err) {
//         console.group("🔴 LIST API ERROR")
//         console.error("Error object  :", err)
//         console.error("HTTP status   :", err?.response?.status)
//         console.error("Response data :", err?.response?.data)
//         console.groupEnd()
//         setError("Failed to load data")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   // ───────────────────────────────────────────────────────────
//   // SEARCH FILTER
//   // ───────────────────────────────────────────────────────────
//   const filteredData = tableData.filter(item =>
//     Object.values(item).some(value =>
//       value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   )

//   // ───────────────────────────────────────────────────────────
//   // UI
//   // ───────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gray-100 p-5">
//       <div className="relative mt-6">

//         {/* HEADER */}
//         <div className="absolute -top-5 left-4 z-10">
//           <div className={`${color} text-white flex items-center gap-2 px-4 py-2 rounded-lg`}>
//             <Menu className="w-4 h-4" />
//             Result And Certificate
//           </div>
//         </div>

//         {/* CARD */}
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//           <div className="pt-8 px-5 pb-5">

//             {/* SEARCH */}
//             <div className="flex justify-end mb-4">
//               <div className="relative">
//                 <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-8 pr-3 py-2 border rounded-md text-sm"
//                 />
//               </div>
//             </div>

//             {/* ERROR */}
//             {error && (
//               <div className="text-red-500 mb-4 font-semibold">{error}</div>
//             )}

//             {/* TABLE
//                 renderCell prop → handled by handleRenderCell above
//                 FilteredTableComponent calls: renderCell(item, column, rowIndex)
//             */}
//             <FilteredTableComponent
//               data={filteredData}
//               columns={columns}
//               loading={loading}
//               renderCell={handleRenderCell}
//               searchable={false}
//               showSearch={false}
//               sortable={true}
//               showExport={true}
//               stickyHeader={true}
//               maxHeight="500px"
//               tableId="result-table"
//               exportFileName="Result_Certificate_Report"
//             />

//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }
// import { useState, useEffect, useContext } from 'react'
// import agent from "../../../lib/api/agent"
// import { Menu, Search } from 'lucide-react'
// import FilteredTableComponent from '../../formcomponent/FilteredTableComponent'
// import { ThemeContext } from '../../../Component/Context/ThemeContext'
// import {
//   GetcandidateresultcertificatenewAPI,
//   GetcandidateprintresultcertificateAPI,
 
//   GetcandidateprintcertificateAPI,
//   GetcandidateprintnoticeAPI,
// } from '../../../Endpoints_All/Candidate/primary'


// const DownloadBtn = ({ label, onClick, variant = "success" }) => {
//   const colorMap = {
//     success: "bg-[#28a745] hover:bg-[#218838] text-white",
//     warning: "bg-[#ffc107] hover:bg-[#e0a800] text-black",
//   }
//   return (
//     <div className="flex justify-center">
//       <button
//         type="button"
//         onClick={onClick}
//         className={`${colorMap[variant]} text-xs font-semibold px-3 py-1.5 rounded transition-colors duration-150 whitespace-nowrap`}
//       >
//         {label}
//       </button>
//     </div>
//   )
// }

// const ErrorLabel = ({ text }) => (
//   <span className="block text-center text-red-600 font-bold text-xs">
//     {text}
//   </span>
// )


// const downloadPdfBlob = async (apiUrl, payload, fallbackFileName) => {

//   console.log("📤 API URL       :", apiUrl)
//   console.log("📤 REQUEST PARAMS:", payload)

//   const response = await agent.get(apiUrl, {
//     params: payload,
//     responseType: 'blob',
//   })

//   console.log("📥 RESPONSE STATUS :", response?.status)
//   console.log("📥 RESPONSE HEADERS:", response?.headers)
//   console.log("📥 RESPONSE DATA   :", response?.data)

 
//   const contentType = response.headers?.["content-type"] || ""
//   console.log("📥 CONTENT-TYPE    :", contentType)

//   if (
//     contentType.includes("application/json") ||
//     contentType.includes("application/problem+json")
//   ) {
//     const text = await response.data.text()
//     console.error("❌ BACKEND RETURNED JSON INSTEAD OF PDF:", text)
//     let message = text
//     try { message = JSON.parse(text)?.Message || JSON.parse(text)?.message || text } catch {}
//     throw new Error(message)
//   }

  
//   let fileName = fallbackFileName
//   const disposition = response.headers?.["content-disposition"]
//   console.log("📥 CONTENT-DISPOSITION:", disposition)

//   if (disposition?.includes("filename=")) {
//     fileName = disposition.split("filename=")[1].replace(/"/g, "").trim()
//     console.log("📥 FILENAME FROM HEADER:", fileName)
//   } else {
//     console.warn("⚠️ No content-disposition header — using fallback filename:", fallbackFileName)
//   }

//   const blob = new Blob([response.data], {
//     type: contentType || "application/pdf",
//   })
//   console.log("📦 BLOB SIZE:", blob.size, "bytes | TYPE:", blob.type)

//   const url  = window.URL.createObjectURL(blob)
//   const link = document.createElement("a")
//   link.href     = url
//   link.download = fileName
//   document.body.appendChild(link)
//   link.click()
//   link.remove()
//   window.URL.revokeObjectURL(url)

//   console.log("✅ FILE DOWNLOAD TRIGGERED:", fileName)
// }


// const parseBlobError = async (err) => {
//   console.group("🔴 ERROR DETAILS")
//   console.error("Full error object :", err)

  
//   const status  = err?.response?.status ?? err?.status ?? "Unknown"
//   const errData = err?.response?.data   ?? err?.data

//   console.error("HTTP status       :", status)
//   console.error("Error data        :", errData)
//   console.groupEnd()

//   try {
   
//     if (errData instanceof Blob) {
//       const errText = await errData.text()
//       console.error("❌ BLOB TEXT:", errText)
//       try {
//         const errJson = JSON.parse(errText)
//         console.error("❌ JSON:", errJson)
//         return `Error ${status}: ${errJson?.Message || errJson?.message || errJson?.title || errText}`
//       } catch {
//         return `Error ${status}: ${errText || "Something went wrong."}`
//       }
//     }

//     if (errData && typeof errData === "object") {
//       const msg = errData?.Message || errData?.message || errData?.title
//       if (msg) return `Error ${status}: ${msg}`
//     }

//     if (status === 500) {
//       return `Server Error (500): The report generation failed on the server. Please contact support.`
//     }

    
//     return `Error ${status}: ${err?.message || "Something went wrong. Please try again."}`

//   } catch {
//     return "Download failed. Please try again."
//   }
// }


// export default function ResultAndCertificate() {

//   const { color } = useContext(ThemeContext)

//   const [tableData, setTableData]   = useState([])
//   const [loading, setLoading]       = useState(false)
//   const [error, setError]           = useState('')
//   const [searchTerm, setSearchTerm] = useState('')

 
 
//   // const handleDownloadResult = async (row) => {
//   //   try {
//   //     console.group("📄 DOWNLOAD RESULT — START")
//   //     console.log("🔵 ROW DATA:", row)

//   //     const payload = {
//   //       candidateId:   row.candidateID,    // long
//   //       applicationId: row.applicationID,  // long
//   //       examinationId: row.examinationID,  // int
//   //       isResultFresh: row.isResultFresh,  // string
//   //     }

//   //     console.log("🔵 RESULT PAYLOAD:", payload)
//   //     console.groupEnd()

//   //     await downloadPdfBlob(
//   //       GetcandidateprintresultcertificateAPI,
//   //       payload,
//   //       `Result_${row.candidateID}.pdf`
//   //     )

//   //     console.log("✅ RESULT DOWNLOAD COMPLETE")

//   //   } catch (err) {
//   //     console.error("❌ RESULT DOWNLOAD FAILED:", err)
//   //     const message = await parseBlobError(err)
//   //     alert(message)
//   //   }
//   // }
// const handleDownloadResult = async (row) => {
//   try {
//     // ... existing code unchanged ...
//     await downloadPdfBlob(GetcandidateprintresultcertificateAPI, payload, `Result_${row.candidateID}.pdf`)
//   } catch (err) {
//     const message = await parseBlobError(err)
//     setRowError(row, 'result', message)  // ← replace alert()
//   }
// }

// // const handleDownloadCertificate = async (row) => {
// //   try {
// //     // ... existing code unchanged ...
// //     await downloadPdfBlob(GetcandidateprintcertificateAPI, payload, `Certificate_${row.candidateID}.pdf`)
// //   } catch (err) {
// //     const message = await parseBlobError(err)
// //     setRowError(row, 'certificate', message)  // ← replace alert()
// //   }
// // }

// const handleDownloadNotice = async (row) => {
//   try {
//     // ... existing code unchanged ...
//   } catch (err) {
//     const message = await parseBlobError(err)
//     setRowError(row, 'notice', message)  // ← replace alert()
//   }
// }
  
//   const handleDownloadCertificate = async (row) => {
//     try {
//       console.group("📜 DOWNLOAD CERTIFICATE — START")
//       console.log("🔵 ROW DATA:", row)

//       const payload = {
//         candidateId:   row.candidateID,
//         applicationId: row.applicationID,
//         examinationId: row.examinationID,
//         isResultFresh: row.isResultFresh,
//       }

//       console.log("🔵 CERTIFICATE PAYLOAD:", payload)
//       console.groupEnd()

//       // TODO: replace GetcandidateprintresultcertificateAPI
//       //       with your Certificate API endpoint once available
//       await downloadPdfBlob(
//         GetcandidateprintcertificateAPI, // ← REPLACE THIS
//         payload,
//         `Certificate_${row.candidateID}.pdf`
//       )

//       console.log("✅ CERTIFICATE DOWNLOAD COMPLETE")

//     } catch (err) {
//       console.error("❌ CERTIFICATE DOWNLOAD FAILED:", err)
//       const message = await parseBlobError(err)
//       alert(message)
//     }
//   }

  
//   const handleDownloadNotice = async (row) => {
//     try {

//       // ── STEP 1 : log full row received from table ──────────
//       console.group("📋 DOWNLOAD NOTICE — START")
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
//       console.log("🔵 STEP 1 — ROW DATA RECEIVED FROM TABLE:")
//       console.log("   candidateID  :", row.candidateID)
//       console.log("   applicationID:", row.applicationID)
//       console.log("   examinationID:", row.examinationID)
//       console.log("   isResultFresh:", row.isResultFresh)
//       console.log("   full row     :", row)

//       // ── STEP 2 : build payload ─────────────────────────────
//       const payload = {
//         candidateId:   row.candidateID,    // long
//         applicationId: row.applicationID,  // long
//         examinationId: row.examinationID,  // int
//         isResultFresh: row.isResultFresh,  // string
//       }

//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
//       console.log("🔵 STEP 2 — PAYLOAD BUILT (sent as query params):")
//       console.log("   payload:", payload)
//       console.log("   API URL:", GetcandidateprintnoticeAPI)
//       console.groupEnd()

//       // ── STEP 3 : fire API via agent ────────────────────────
//       console.group("📡 NOTICE API CALL")
//       console.log("🔵 STEP 3 — CALLING agent.get with responseType: blob ...")

//       const response = await agent.get(GetcandidateprintnoticeAPI, {
//         params: payload,
//         responseType: 'blob',
//       })

//       // ── STEP 4 : log raw response ──────────────────────────
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
//       console.log("🟢 STEP 4 — API RESPONSE RECEIVED:")
//       console.log("   status         :", response?.status)
//       console.log("   headers        :", response?.headers)
//       console.log("   data (raw blob):", response?.data)

//       const contentType  = response.headers?.["content-type"] || ""
//       const disposition  = response.headers?.["content-disposition"] || ""

//       console.log("   content-type   :", contentType)
//       console.log("   content-disp   :", disposition)
//       console.groupEnd()

//       // ── STEP 5 : guard — backend returned JSON error ───────
//       if (
//         contentType.includes("application/json") ||
//         contentType.includes("application/problem+json")
//       ) {
//         const errText = await response.data.text()
//         console.group("❌ STEP 5 — BACKEND RETURNED JSON (not a PDF)")
//         console.error("   raw text:", errText)
//         let parsed = {}
//         try { parsed = JSON.parse(errText) } catch {}
//         console.error("   parsed  :", parsed)
//         console.groupEnd()
//         throw new Error(parsed?.Message || parsed?.message || errText || "Backend returned error instead of PDF")
//       }

//       // ── STEP 6 : resolve filename ──────────────────────────
//       let fileName = `Notice_${row.candidateID}.pdf`  // fallback
//       if (disposition.includes("filename=")) {
//         fileName = disposition.split("filename=")[1].replace(/"/g, "").trim()
//         console.log("🟢 STEP 6 — FILENAME FROM content-disposition:", fileName)
//       } else {
//         console.warn("⚠️ STEP 6 — No content-disposition header, using fallback:", fileName)
//       }

//       // ── STEP 7 : build Blob and trigger download ───────────
//       const blob = new Blob([response.data], {
//         type: contentType || "application/pdf",
//       })

//       console.group("📦 STEP 7 — BLOB BUILT")
//       console.log("   blob size :", blob.size, "bytes")
//       console.log("   blob type :", blob.type)
//       console.log("   file name :", fileName)
//       console.groupEnd()

//       const url  = window.URL.createObjectURL(blob)
//       const link = document.createElement("a")
//       link.href     = url
//       link.download = fileName
//       document.body.appendChild(link)
//       link.click()
//       link.remove()
//       window.URL.revokeObjectURL(url)

//       console.log("✅ STEP 8 — NOTICE DOWNLOAD TRIGGERED SUCCESSFULLY:", fileName)

//     } catch (err) {
//       console.group("🔴 NOTICE DOWNLOAD — ERROR")
//       console.error("   error object :", err)
//       console.error("   http status  :", err?.response?.status ?? err?.status)
//       console.error("   error data   :", err?.response?.data   ?? err?.data)
//       console.groupEnd()
//       const message = await parseBlobError(err)
//       alert(message)
//     }
//   }

  
//   const columns = [
//     { key: 'srNo',                header: 'Sr. No.',       headerClassName: 'text-center' },
//     { key: 'applicationIdDisplay', header: 'Application ID', headerClassName: 'text-center' },
//     { key: 'examinationName',     header: 'Examination',   headerClassName: 'text-center' },
//     { key: 'collegeName',         header: 'Institute',     headerClassName: 'text-center' },
//     { key: 'batchID',             header: 'Batch ID',      headerClassName: 'text-center' },
//     { key: 'courseName',          header: 'Course Name',   headerClassName: 'text-center' },
//     { key: 'resultStatus',        header: 'Result Status', headerClassName: 'text-center' },
    
//     { key: 'result',      header: 'Result',      headerClassName: 'text-center', excludeFromExport: true },
//     { key: 'certificate', header: 'Certificate', headerClassName: 'text-center', excludeFromExport: true },
//     { key: 'notice',      header: 'Notice',      headerClassName: 'text-center', excludeFromExport: true },
//   ]

 
//   // const handleRenderCell = (item, column) => {
//   //   switch (column.key) {

      
//   //     case 'result':
//   //       return Number(item.downloadResultFlag) > 0
//   //         ? <ErrorLabel text="Result Not Declared" />
//   //         : <DownloadBtn
//   //             label="Download Result"
//   //             onClick={() => handleDownloadResult(item)}
//   //           />

     
//   //     case 'certificate':
//   //       return Number(item.downloadCertificateFlag) > 0
//   //         ? <ErrorLabel text="No Certificate Generated" />
//   //         : <DownloadBtn
//   //             label="Download Certificate"
//   //             onClick={() => handleDownloadCertificate(item)}
//   //           />

//   //     // case 'notice':
//   //     //   return Number(item.downloadNoticeFlag) > 0
//   //     //     ? <DownloadBtn
//   //     //         label="Download Notice"
//   //     //         variant="warning"
//   //     //         onClick={() => handleDownloadNotice(item)}
//   //     //       />
//   //     //     : <ErrorLabel text="No Notice Generated" />
//   //     case 'notice':
//   // // TEMP — force button to test API
//   // return (
//   //   <DownloadBtn
//   //     label="Download Notice"
//   //     variant="warning"
//   //     onClick={() => handleDownloadNotice(item)}
//   //   />
//   // )

      
//   //     default:
//   //       return undefined
//   //   }
//   // }
//   const handleRenderCell = (item, column) => {
//   switch (column.key) {

//     case 'result': {
//       const err = getRowError(item, 'result')
//       return err
//         ? <ErrorLabel text={err} />
//         : <DownloadBtn label="Download Result" onClick={() => handleDownloadResult(item)} />
//     }

//     case 'certificate': {
//       const err = getRowError(item, 'certificate')
//       return err
//         ? <ErrorLabel text={err} />
//         : <DownloadBtn label="Download Certificate" onClick={() => handleDownloadCertificate(item)} />
//     }

//     case 'notice': {
//       const err = getRowError(item, 'notice')
//       return err
//         ? <ErrorLabel text={err} />
//         : <DownloadBtn label="Download Notice" onClick={() => handleDownloadNotice(item)} />
//     }

//     default:
//       return undefined
//   }
// }

  
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true)

//         const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll"))
//         const candidateId = userInfoAll?.UserID

//         console.group("📋 FETCH TABLE DATA — START")
//         console.log("🔵 SESSION userInfoAll :", userInfoAll)
//         console.log("🔵 CANDIDATE ID        :", candidateId)

//         if (!candidateId) {
//           console.error("❌ candidateId is missing in sessionStorage")
//           console.groupEnd()
//           setError("Candidate ID not found")
//           return
//         }

//         const response = await agent.get(
//           GetcandidateresultcertificatenewAPI,
//           { params: { candidateId } }
//         )

//         console.log("📥 LIST API — STATUS  :", response?.status)
//         console.log("📥 LIST API — HEADERS :", response?.headers)
//         console.log("📥 LIST API — RAW DATA:", response?.data)

//         const apiData =
//           response?.data?.Data ||
//           response?.data?.data ||
//           response?.data || []

//         console.log("📥 LIST API — RESOLVED ARRAY:", apiData)
//         console.log("📥 LIST API — ROW COUNT      :", apiData.length)

//         const formattedData = apiData.map((item, index) => ({

//           // ── display fields ────────────────────────────────
//           srNo:                 index + 1,
//           applicationIdDisplay: item.ApplicationIDDisplay || '---',
//           examinationName:      item.ExaminationName      || '---',
//           collegeName:          item.CollegeName          || '---',
//           batchID:              item.BatchID              || '---',
//           courseName:           item.CourseName           || '---',
//           resultStatus:         item.ResultStatus         || '---',

//           // ── download payload fields ───────────────────────
//           // mirrors ASPX CommandArgument:
//           // CandidateID;ApplicationID;BatchID;ExaminationID;IsResultFresh
//           candidateID:   item.CandidateID,
//           applicationID: item.ApplicationID,
//           examinationID: item.ExaminationID,
//           isResultFresh: item.IsResultFresh,

//           // ── visibility flags (raw numbers from API) ───────
//           // ASPX uses: Convert.ToInt32(Eval("DownloadRsult"))  ← note ASPX typo
//           // 0 = available → show button
//           // >0 = not available → show error label
//           downloadResultFlag:      Number(item.DownloadRsult      ?? item.DownloadResult      ?? 1),
//           downloadCertificateFlag: Number(item.DownloadCertificate ?? 1),
//           // Notice is opposite: >0 = available, 0 = not available
//           downloadNoticeFlag:      Number(item.DownloadNotice      ?? 0),
//         }))

//         console.log("✅ FORMATTED TABLE DATA:", formattedData)
//         console.log("✅ SAMPLE ROW [0] FLAGS:", {
//           downloadResultFlag:      formattedData[0]?.downloadResultFlag,
//           downloadCertificateFlag: formattedData[0]?.downloadCertificateFlag,
//           downloadNoticeFlag:      formattedData[0]?.downloadNoticeFlag,
//         })
//         console.groupEnd()

//         setTableData(formattedData)

//       } catch (err) {
//         console.group("🔴 LIST API ERROR")
//         console.error("Error object  :", err)
//         console.error("HTTP status   :", err?.response?.status)
//         console.error("Response data :", err?.response?.data)
//         console.groupEnd()
//         setError("Failed to load data")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   // ───────────────────────────────────────────────────────────
//   // SEARCH FILTER
//   // ───────────────────────────────────────────────────────────
//   const filteredData = tableData.filter(item =>
//     Object.values(item).some(value =>
//       value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   )

//   // ───────────────────────────────────────────────────────────
//   // UI
//   // ───────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gray-100 p-5">
//       <div className="relative mt-6">

//         {/* HEADER */}
//         <div className="absolute -top-5 left-4 z-10">
//           <div className={`${color} text-white flex items-center gap-2 px-4 py-2 rounded-lg`}>
//             <Menu className="w-4 h-4" />
//             Result And Certificate
//           </div>
//         </div>

//         {/* CARD */}
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//           <div className="pt-8 px-5 pb-5">

//             {/* SEARCH */}
//             <div className="flex justify-end mb-4">
//               <div className="relative">
//                 <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-8 pr-3 py-2 border rounded-md text-sm"
//                 />
//               </div>
//             </div>

//             {/* ERROR */}
//             {error && (
//               <div className="text-red-500 mb-4 font-semibold">{error}</div>
//             )}

          
//             <FilteredTableComponent
//               data={filteredData}
//               columns={columns}
//               loading={loading}
//               renderCell={handleRenderCell}
//               searchable={false}
//               showSearch={false}
//               sortable={true}
//               showExport={true}
//               stickyHeader={true}
//               maxHeight="500px"
//               tableId="result-table"
//               exportFileName="Result_Certificate_Report"
//             />

//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }
import { useState, useEffect, useContext } from 'react'
import agent from "../../../lib/api/agent"
import { Menu, Search } from 'lucide-react'
import FilteredTableComponent from '../../formcomponent/FilteredTableComponent'
import { ThemeContext } from '../../../Component/Context/ThemeContext'
import {
  GetcandidateresultcertificatenewAPI,
  GetcandidateprintresultcertificateAPI,
  GetcandidateprintcertificateAPI,
  GetcandidateprintnoticeAPI,
} from '../../../Endpoints_All/Candidate/primary'
import { useAuth } from '../../../Hooks/AuthContext'


// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────

const DownloadBtn = ({ label, onClick }) => (
  <div className="flex justify-center">
    <button
      type="button"
      onClick={onClick}
      className="bg-[#28a745] hover:bg-[#218838] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors duration-150 whitespace-nowrap"
    >
      {label}
    </button>
  </div>
)

const ErrorLabel = ({ text }) => (
  <span className="block text-center text-red-600 font-bold text-xs">
    {text}
  </span>
)


// ─────────────────────────────────────────────────────────────
// PDF DOWNLOAD HELPER
// ─────────────────────────────────────────────────────────────

const downloadPdfBlob = async (apiUrl, payload, fallbackFileName) => {

  const response = await agent.get(apiUrl, {
    params: payload,
    responseType: 'blob',
  })

  const contentType = response.headers?.["content-type"] || ""

  // Guard: backend returned JSON error instead of PDF
  if (
    contentType.includes("application/json") ||
    contentType.includes("application/problem+json")
  ) {
    const text = await response.data.text()
    console.error("❌ BACKEND RETURNED JSON INSTEAD OF PDF:", text)
    let message = text
    try { message = JSON.parse(text)?.Message || JSON.parse(text)?.message || text } catch {}
    throw new Error(message)
  }

  // Resolve filename
  let fileName = fallbackFileName
  const disposition = response.headers?.["content-disposition"]

  if (disposition?.includes("filename=")) {
    fileName = disposition.split("filename=")[1].replace(/"/g, "").trim()
  } else {
    console.warn("⚠️ No content-disposition header — using fallback filename:", fallbackFileName)
  }

  const blob = new Blob([response.data], { type: contentType || "application/pdf" })

  const url  = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href     = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)

}


// ─────────────────────────────────────────────────────────────
// BLOB ERROR PARSER
// ─────────────────────────────────────────────────────────────

const parseBlobError = async (err) => {
  console.group("🔴 ERROR DETAILS")
  console.error("Full error object :", err)

  const status  = err?.response?.status ?? err?.status ?? "Unknown"
  const errData = err?.response?.data   ?? err?.data

  console.error("HTTP status       :", status)
  console.error("Error data        :", errData)
  console.groupEnd()

  try {
    if (errData instanceof Blob) {
      const errText = await errData.text()
      console.error("❌ BLOB TEXT:", errText)
      try {
        const errJson = JSON.parse(errText)
        console.error("❌ JSON:", errJson)
        return `Error ${status}: ${errJson?.Message || errJson?.message || errJson?.title || errText}`
      } catch {
        return `Error ${status}: ${errText || "Something went wrong."}`
      }
    }

    if (errData && typeof errData === "object") {
      const msg = errData?.Message || errData?.message || errData?.title
      if (msg) return `Error ${status}: ${msg}`
    }

    if (status === 500) {
      return `Server Error (500): The report generation failed on the server. Please contact support.`
    }

    return `Error ${status}: ${err?.message || "Something went wrong. Please try again."}`

  } catch {
    return "Download failed. Please try again."
  }
}


// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function ResultAndCertificate() {

  const { color } = useContext(ThemeContext)
    const {userInfo} = useAuth();

  const [tableData,  setTableData]  = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [rowErrors,  setRowErrors]  = useState({})   // ← per-cell error state


  // ── Row error helpers ──────────────────────────────────────

  const setRowError = (row, type, message) => {
    const key = `${row.candidateID}_${row.applicationID}_${type}`
    setRowErrors(prev => ({ ...prev, [key]: message }))
  }

  const getRowError = (row, type) => {
    return rowErrors[`${row.candidateID}_${row.applicationID}_${type}`] || null
  }


  // ── Download handlers ──────────────────────────────────────

  const handleDownloadResult = async (row) => {
    try {
      console.group("📄 DOWNLOAD RESULT — START")

      
      const payload = {
        candidateId:   row.candidateID,
        applicationId: row.applicationID,
        examinationId: row.examinationID,
        isResultFresh: row.isResultFresh,
      }
      
        debugger;

      console.groupEnd()

      await downloadPdfBlob(
        GetcandidateprintresultcertificateAPI,
        payload,
        `Result_${row.candidateID}.pdf`
      )


    } catch (err) {
      console.error("❌ RESULT DOWNLOAD FAILED:", err)
      const message = await parseBlobError(err)
      setRowError(row, 'result', message)
    }
  }

  const handleDownloadCertificate = async (row) => {
    try {

      const payload = {
        candidateId:   row.candidateID,
        applicationId: row.applicationID,
        examinationId: row.examinationID,
        isResultFresh: row.isResultFresh,
      }
      debugger;

      await downloadPdfBlob(
        GetcandidateprintcertificateAPI,
        payload,
        `Certificate_${row.candidateID}.pdf`
      )


    } catch (err) {
      const message = await parseBlobError(err)
      setRowError(row, 'certificate', message)
    }
  }

  const handleDownloadNotice = async (row) => {
    try {

      const payload = {
        candidateId:   row.candidateID,
        applicationId: row.applicationID,
        examinationId: row.examinationID,
        isResultFresh: row.isResultFresh,
      }



      const response = await agent.get(GetcandidateprintnoticeAPI, {
        params: payload,
        responseType: 'blob',
      })

      const contentType = response.headers?.["content-type"] || ""
      const disposition = response.headers?.["content-disposition"] || ""


      // Guard: backend returned JSON error instead of PDF
      if (
        contentType.includes("application/json") ||
        contentType.includes("application/problem+json")
      ) {
        const errText = await response.data.text()
        let parsed = {}
        try { parsed = JSON.parse(errText) } catch {}
        throw new Error(parsed?.Message || parsed?.message || errText || "Backend returned error instead of PDF")
      }

      // Resolve filename
      let fileName = `Notice_${row.candidateID}.pdf`
      if (disposition.includes("filename=")) {
        fileName = disposition.split("filename=")[1].replace(/"/g, "").trim()
      } else {
        console.warn("⚠️ STEP 6 — No content-disposition header, using fallback:", fileName)
      }

      const blob = new Blob([response.data], { type: contentType || "application/pdf" })

      const url  = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href     = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)


    } catch (err) {
      console.group("🔴 NOTICE DOWNLOAD — ERROR")
      console.error("   error object :", err)
      console.error("   http status  :", err?.response?.status ?? err?.status)
      console.error("   error data   :", err?.response?.data   ?? err?.data)
      console.groupEnd()
      const message = await parseBlobError(err)
      setRowError(row, 'notice', message)
    }
  }


  // ── Table columns ──────────────────────────────────────────

  const columns = [
    { key: 'srNo',                header: 'Sr. No.',        headerClassName: 'text-center' },
    { key: 'applicationIdDisplay', header: 'Application ID', headerClassName: 'text-center' },
    { key: 'examinationName',     header: 'Examination',    headerClassName: 'text-center' },
    { key: 'collegeName',         header: 'Institute',      headerClassName: 'text-center' },
    { key: 'batchID',             header: 'Batch ID',       headerClassName: 'text-center' },
    { key: 'courseName',          header: 'Course Name',    headerClassName: 'text-center' },
    { key: 'resultStatus',        header: 'Result Status',  headerClassName: 'text-center' },
    { key: 'result',      header: 'Result',      headerClassName: 'text-center', excludeFromExport: true },
    { key: 'certificate', header: 'Certificate', headerClassName: 'text-center', excludeFromExport: true },
    { key: 'notice',      header: 'Notice',      headerClassName: 'text-center', excludeFromExport: true },
  ]


  // ── Cell renderer ──────────────────────────────────────────
  // Logic: always show Download button
  // If API returns PDF  → file downloads, button stays ✅
  // If API returns error → red error message replaces button in that cell only ✅

  const handleRenderCell = (item, column) => {
    switch (column.key) {

      case 'result': {
        const err = getRowError(item, 'result')
        return err
          ? <ErrorLabel text={err} />
          : <DownloadBtn label="Download Result" onClick={() => handleDownloadResult(item)} />
      }

      case 'certificate': {
        const err = getRowError(item, 'certificate')
        return err
          ? <ErrorLabel text={err} />
          : <DownloadBtn label="Download Certificate" onClick={() => handleDownloadCertificate(item)} />
      }

      case 'notice': {
        const err = getRowError(item, 'notice')
        return err
          ? <ErrorLabel text={err} />
          : <DownloadBtn label="Download Notice" onClick={() => handleDownloadNotice(item)} />
      }

      default:
        return undefined
    }
  }


  // ── Fetch table data on mount ──────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        
        const candidateId = userInfo?.UserID


        if (!candidateId) {
          console.error("❌ candidateId is missing in sessionStorage")
          console.groupEnd()
          setError("Candidate ID not found")
          return
        }

        const response = await agent.get(
          GetcandidateresultcertificatenewAPI,
          { params: { candidateId } }
        )

        const apiData =
          response?.data?.Data ||
          response?.data?.data ||
          response?.data || []

        const formattedData = apiData.map((item, index) => ({
          // display fields
          srNo:                 index + 1,
          applicationIdDisplay: item.ApplicationIDDisplay || '---',
          examinationName:      item.ExaminationName      || '---',
          collegeName:          item.CollegeName          || '---',
          batchID:              item.BatchID              || '---',
          courseName:           item.CourseName           || '---',
          resultStatus:         item.ResultStatus         || '---',

          // download payload fields
          candidateID:   item.CandidateID,
          applicationID: item.ApplicationID,
          examinationID: item.ExaminationID,
          isResultFresh: item.IsResultFresh,
        }))


        setTableData(formattedData)

      } catch (err) {
        console.group("🔴 LIST API ERROR")
        console.error("Error object  :", err)
        console.error("HTTP status   :", err?.response?.status)
        console.error("Response data :", err?.response?.data)
        console.groupEnd()
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
  }, [])


  // ── Search filter ──────────────────────────────────────────

  const filteredData = tableData.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )


  // ── UI ─────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      <fieldset className='mb-4 rounded-md border p-4'>

        {/* HEADER */}
        {/* <div className="absolute -top-5 left-4 z-10"> */}
          <legend className={`flex ${color} items-center text-white border-2 border-gray-300 gap-2 rounded-md px-4 py-2 text-lg font-semibold `}>
            <Menu className="w-4 h-4" />
            Result And Certificate
          </legend>
        {/* </div> */}

        {/* CARD */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="pt-8 px-5 pb-5">

            {/* SEARCH */}
            <div className="flex justify-end mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>

            {/* PAGE-LEVEL ERROR */}
            {error && (
              <div className="text-red-500 mb-4 font-semibold">{error}</div>
            )}

            <FilteredTableComponent
              data={filteredData}
              columns={columns}
              loading={loading}
              renderCell={handleRenderCell}
              searchable={false}
              showSearch={false}
              sortable={true}
              showExport={true}
              stickyHeader={true}
              maxHeight="500px"
              tableId="result-table"
              exportFileName="Result_Certificate_Report"
            />

          </div>
        </div>

      </fieldset>
    </div>
  )
}