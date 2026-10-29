// import { useState, useEffect } from "react";

// const API_BASE = "/api"; // change if needed

// // ---------------- API ----------------
// async function fetchCoursesList() {
//   try {
//     const res = await fetch(`${API_BASE}/CourseNorms/GetCoursesList`);
//     if (!res.ok) throw new Error("API failed");
//     return await res.json();
//   } catch (err) {
//     console.error("Courses List API Error:", err);

//     // fallback (so UI never breaks)
//     return [];
//   }
// }

// async function fetchCourseByID(courseID) {
//   try {
//     const res = await fetch(`${API_BASE}/CourseNorms/GetCourseByID?P1=${courseID}`);
//     if (!res.ok) throw new Error("API failed");
//     return await res.json();
//   } catch (err) {
//     console.error("Course Detail API Error:", err);
//     return null;
//   }
// }

// // ----------- SAFE VALUE ----------
// const safe = (val) => (val === null || val === undefined || val === "" ? "—" : val);

// // ---------------- LIST PAGE ----------------
// function CourseNormsApp() {
//   const [courses, setCourses] = useState([]);
//   const [selectedCourseID, setSelectedCourseID] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetchCoursesList().then((data) => {
//       setCourses(data || []);
//       setLoading(false);
//     });
//   }, []);

//   if (selectedCourseID) {
//     return (
//       <CourseDetailPage
//         courseID={selectedCourseID}
//         onBack={() => setSelectedCourseID(null)}
//       />
//     );
//   }

//   const filtered = courses.filter((c) =>
//     (c.CourseNameDisplay || "").toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <div className="bg-blue-900 text-white py-3 px-6 flex items-center gap-3">
//         <span className="text-2xl">🏛️</span>
//         <div>
//           <p className="text-xs">Government of Maharashtra</p>
//           <p className="text-sm font-bold">
//             Maharashtra State Board of Skill, Vocational Education and Training
//           </p>
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto py-8 px-4">
//         <h2 className="text-2xl font-bold mb-2">Course Norms</h2>
//         <p className="text-sm text-gray-500 mb-4">
//           Click on any course to view its complete norms and details
//         </p>

//         {/* Search */}
//         <input
//           type="text"
//           placeholder="Search courses..."
//           className="w-full border p-2 mb-4"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         {/* Table */}
//         <div className="bg-white border">
//           <table className="w-full text-sm">
//             <thead className="bg-slate-800 text-white">
//               <tr>
//                 <th className="p-3 text-left">Course Category</th>
//                 <th className="p-3 text-left">Course</th>
//                 <th className="p-3 text-left">Duration</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={3} className="p-6 text-center">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan={3} className="p-6 text-center">
//                     No data found
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((c, i) => (
//                   <tr
//                     key={c.CourseID}
//                     className={`cursor-pointer ${
//                       i % 2 === 0 ? "bg-white" : "bg-gray-50"
//                     }`}
//                     onClick={() => setSelectedCourseID(c.CourseID)}
//                   >
//                     <td className="p-3">{safe(c.CourseCategory)}</td>
//                     <td className="p-3 text-blue-700">
//                       {safe(c.CourseNameDisplay)}
//                     </td>
//                     <td className="p-3">{safe(c.TotalDuration)} HRS</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ---------------- DETAIL PAGE ----------------
// function CourseDetailPage({ courseID, onBack }) {
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchCourseByID(courseID).then((data) => {
//       setCourse(data);
//       setLoading(false);
//     });
//   }, [courseID]);

//   if (loading) return <div className="p-6 text-center">Loading...</div>;
//   if (!course) return <div className="p-6 text-center text-red-500">Error loading data</div>;

//   return (
//     <div className="p-4 bg-gray-100 min-h-screen">
//       <button onClick={onBack} className="mb-4 text-blue-700">
//         ← Back
//       </button>

//       <div className="bg-white border">
//         <table className="w-full text-sm">
//           <tbody>
//             <tr>
//               <td className="p-2 font-bold">Course Name</td>
//               <td className="p-2">{safe(course.CourseNameDisplay)}</td>
//             </tr>
//             <tr>
//               <td className="p-2 font-bold">Sector</td>
//               <td className="p-2">{safe(course.Sector)}</td>
//             </tr>
//             <tr>
//               <td className="p-2 font-bold">Sub Sector</td>
//               <td className="p-2">{safe(course.SubSector)}</td>
//             </tr>
//             <tr>
//               <td className="p-2 font-bold">Approved By</td>
//               <td className="p-2">{safe(course.CourseApprovedBy)}</td>
//             </tr>
//             <tr>
//               <td className="p-2 font-bold">Course Type</td>
//               <td className="p-2">{safe(course.CourseType)}</td>
//             </tr>
//             <tr>
//               <td className="p-2 font-bold">NSQF Level</td>
//               <td className="p-2">{safe(course.NSQFLevel)}</td>
//             </tr>
//             <tr>
//               <td className="p-2 font-bold">Minimum Age</td>
//               <td className="p-2">{safe(course.MinAge)}</td>
//             </tr>

//             {/* Duration */}
//             <tr>
//               <td className="p-2 font-bold">Theory</td>
//               <td className="p-2">{safe(course.TheoryDuration)}</td>
//             </tr>
//             <tr>
//               <td className="p-2 font-bold">Practical</td>
//               <td className="p-2">{safe(course.PracticalDuration)}</td>
//             </tr>
//             <tr>
//               <td className="p-2 font-bold">Total</td>
//               <td className="p-2">{safe(course.TotalDuration)}</td>
//             </tr>

//             {/* Fees FIXED */}
//             <tr>
//               <td className="p-2 font-bold">Admission Fees</td>
//               <td className="p-2">{safe(course.AdmissionFees)}</td>
//             </tr>
//             <tr>
//               <td className="p-2 font-bold">Exam Fees</td>
//               <td className="p-2">{safe(course.ExamAssesmentFee)}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default CourseNormsApp;
import React from 'react'

const CourseNormsPrint = () => {

  // Replace this with your real API data
  const d = {
    CourseNameDisplay: 'CERTIFICATE COURSE IN AEROSPACE CNC MACHINIST (AAS/Q1001)',
    Sector: 'AEROSPACE AND AVIATION',
    SubSector: 'MANUFACTURING AND ASSEMBLY',
    CourseApprovedBy: 'NATIONAL COUNCIL OF VOCATIONAL EDUCATION AND TRAINING (NCVET)',
    CourseCategory: 'CERTIFICATE COURSE',
    CourseType: 'PART TIME',
    IntakePerUnit: '30',
    NSQFLevel: '4.0',
    TrainingFeeCategory: '1A',
    MinAge: '16',
    MaxBatchPerDay: '',
    TrainingMode: 'Conventional',
    TheoryDuration: '248',
    PracticalDuration: '367',
    OJTMandatoryDuration: '60',
    OJTOptionalDuration: '0',
    TotalDuration: '675',
    TheoryBoardDuration: '248', TheoryBoardDurationunitDisplay: 'HOUR',
    PracticalBoardDuration: '367', PracticalBoardDurationunitDisplay: 'HOUR',
    OJTMandatoryBoardDuration: '60', OJTMandatoryBoardDurationunitDisplay: 'HOUR',
    OJTOptionalBoardDuration: '0', OJTOptionalBoardDurationunitDisplay: 'HOUR',
    TotalBoardDuration: '675', TotalBoardDurationunitDisplay: 'HOUR',
    WorkshopFloorPreferenceDisplay: 'Any',
    WorkshopSpaceRequired: '0',
    PowerTypeDisplay: 'Single Phase',
    PowerInKW: '0',
    SeparateClassRoomRequired: '0', ClassRoomArea: '30', ClassUtilizationperweekinHours: '0',
    SeparateDrawingHallRequired: '0', DrawingRoomArea: '0', DrawingUtilizationperweekinHours: '0',
    SeparateComputerLabRequired: '0', ComputerLabArea: '0', ComputerLabUtilizationperweekinHours: '0',
    SeparateAgricultureLandRequired: '0', AgricultureLandArea: '0', AgricultureLandUtilizationperweekinHours: '0',
    SeparateOpenGroundRequired: '0', OpenGroundArea: '0', OpenGroundUtilizationperweekinHours: '0',
    InspectionFees: '10000',
    SecurityDeposit: '25000',
    RenewalFees: '10000',
    ApprovalGroupID: '0',
    ExamAssesmentFee: '0',
    SyllabusVersionDisplay: '08/05/2025',
    ModelCurriculumUrl: 'https://msbsvet.blob.core.windows.net/msbsvet/msbsvetlive/ModelCurriculum/AAS_Q1001_MC.pdf',
    QualificationPackUrl: 'https://msbsvet.blob.core.windows.net/msbsvet/msbsvetlive/QualificationPack/AAS_Q1001_QP.pdf',
    MinimumEntryQualificationEntity: [
      { Qualification: 'As per Course Curriculum', MandatoryCriteria: '', ExperienceInMonths: '', Remark: '' }
    ],
    trainingInfrastructureEntities: [],
  }

  const facilities = [
    { label: 'Class Room',       separately: d.SeparateClassRoomRequired,       area: d.ClassRoomArea,       util: d.ClassUtilizationperweekinHours },
    { label: 'Drawing Hall',     separately: d.SeparateDrawingHallRequired,      area: d.DrawingRoomArea,      util: d.DrawingUtilizationperweekinHours },
    { label: 'Computer Lab',     separately: d.SeparateComputerLabRequired,      area: d.ComputerLabArea,      util: d.ComputerLabUtilizationperweekinHours },
    { label: 'Agriculture Land', separately: d.SeparateAgricultureLandRequired,  area: d.AgricultureLandArea,  util: d.AgricultureLandUtilizationperweekinHours },
    { label: 'Open Ground',      separately: d.SeparateOpenGroundRequired,       area: d.OpenGroundArea,       util: d.OpenGroundUtilizationperweekinHours },
  ]

  const qualifications = d.MinimumEntryQualificationEntity || []
  const trainingInfra  = d.trainingInfrastructureEntities  || []

  const lbl = 'border border-gray-400 px-2 py-1 font-semibold bg-white text-black align-middle text-xs'
  const val = 'border border-gray-400 px-2 py-1 bg-white text-black align-middle text-xs'
  const ctr = 'border border-gray-400 px-2 py-1 text-center bg-white text-black align-middle text-xs'
  const hdr = 'border border-gray-400 px-2 py-1 text-center font-semibold bg-white text-black align-middle text-xs'
  const sec = 'border border-gray-400 px-2 py-1 font-semibold bg-white text-black align-middle text-xs'

  return (
    <div className="bg-white min-h-screen p-4 font-sans text-black text-xs">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        table { border-collapse: collapse; width: 100%; }
      ` }} />

      {/* ── HEADER ── */}
      <table className="w-full mb-2 border-b-2 border-blue-900">
        <tbody>
          <tr>
            <td className="border-0 p-1 w-20 text-center align-middle">
              {/* Replace src with your actual emblem image import */}
              <div className="h-16 w-16 mx-auto bg-gray-200 flex items-center justify-center text-gray-400 text-xs">Emblem</div>
            </td>
            <td className="border-0 text-center align-middle px-2 py-1">
              <p className="text-xs">Government of Maharashtra</p>
              <p className="text-xs">Skill, Employment, Entrepreneurship and Innovation Department</p>
              <p className="text-sm font-semibold">Maharashtra State Board of Skill, Vocational Education and Training</p>
              <p className="text-base font-bold mt-1 tracking-wide">COURSE NORMS</p>
            </td>
            <td className="border-0 p-1 w-20 text-center align-middle">
              {/* Replace src with your actual board logo import */}
              <div className="h-16 w-16 mx-auto bg-gray-200 flex items-center justify-center text-gray-400 text-xs">Logo</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── COURSE INFO ── */}
      <table className="w-full">
        <tbody>
          <tr>
            <td className={`${lbl} w-48`}>Course Name</td>
            <td className={val} colSpan={5}>{d.CourseNameDisplay}</td>
          </tr>
          <tr>
            <td className={lbl}>Sector</td>
            <td className={val} colSpan={5}>{d.Sector}</td>
          </tr>
          <tr>
            <td className={lbl}>Sub Sector</td>
            <td className={val} colSpan={5}>{d.SubSector}</td>
          </tr>
          <tr>
            <td className={lbl}>Course Approved by</td>
            <td className={val} colSpan={5}>{d.CourseApprovedBy}</td>
          </tr>
          <tr>
            <td className={`${lbl} w-1/5`}>Course Category</td>
            <td className={`${val} w-1/4`}>{d.CourseCategory}</td>
            <td className={`${lbl} w-1/6`}>Course Type</td>
            <td className={val} colSpan={3}>{d.CourseType}</td>
          </tr>
          <tr>
            <td className={lbl}>Intake per Unit</td>
            <td className={val}>{d.IntakePerUnit}</td>
            <td className={lbl}>NSQF Level</td>
            <td className={val} colSpan={3}>{d.NSQFLevel}</td>
          </tr>
          <tr>
            <td className={lbl}>Training Fee Category</td>
            <td className={val}>{d.TrainingFeeCategory}</td>
            <td className={lbl}>Minimum Age</td>
            <td className={val} colSpan={3}>{d.MinAge}</td>
          </tr>
          <tr>
            <td className={lbl}>Max. batches per day</td>
            <td className={val} colSpan={5}>{d.MaxBatchPerDay}</td>
          </tr>
          <tr>
            <td className={lbl}>Training Mode</td>
            <td className={val} colSpan={5}>{d.TrainingMode}</td>
          </tr>

          {/* Duration in Hours */}
          <tr><td className={sec} colSpan={6}>Duration in Hours</td></tr>
          <tr>
            <td className={val}></td>
            <td className={hdr}>Theory</td>
            <td className={hdr}>Practical</td>
            <td className={hdr}>OJT Mandatory</td>
            <td className={hdr}>OJT Optional</td>
            <td className={hdr}>Total</td>
          </tr>
          <tr>
            <td className={val}></td>
            <td className={ctr}>{d.TheoryDuration}</td>
            <td className={ctr}>{d.PracticalDuration}</td>
            <td className={ctr}>{d.OJTMandatoryDuration}</td>
            <td className={ctr}>{d.OJTOptionalDuration}</td>
            <td className={ctr}>{d.TotalDuration}</td>
          </tr>

          {/* Board Course Duration */}
          <tr><td className={sec} colSpan={6}>Board Course Duration</td></tr>
          <tr>
            <td className={val}></td>
            <td className={hdr}>Theory</td>
            <td className={hdr}>Practical</td>
            <td className={hdr}>OJT Mandatory</td>
            <td className={hdr}>OJT Optional</td>
            <td className={hdr}>Total</td>
          </tr>
          <tr>
            <td className={val}></td>
            <td className={ctr}>{d.TheoryBoardDuration} {d.TheoryBoardDurationunitDisplay}</td>
            <td className={ctr}>{d.PracticalBoardDuration} {d.PracticalBoardDurationunitDisplay}</td>
            <td className={ctr}>{d.OJTMandatoryBoardDuration} {d.OJTMandatoryBoardDurationunitDisplay}</td>
            <td className={ctr}>{d.OJTOptionalBoardDuration} {d.OJTOptionalBoardDurationunitDisplay}</td>
            <td className={ctr}>{d.TotalBoardDuration} {d.TotalBoardDurationunitDisplay}</td>
          </tr>

          {/* Workshop */}
          <tr><td className={sec} colSpan={6}>Workshop</td></tr>
          <tr>
            <td className={lbl}>Floor Preference</td>
            <td className={val} colSpan={2}>{d.WorkshopFloorPreferenceDisplay}</td>
            <td className={lbl}>Area in Sq. Meter</td>
            <td className={val} colSpan={2}>{d.WorkshopSpaceRequired}</td>
          </tr>

          {/* Power Supply */}
          <tr><td className={sec} colSpan={6}>Power Supply</td></tr>
          <tr>
            <td className={lbl}>Power Type</td>
            <td className={val} colSpan={2}>{d.PowerTypeDisplay}</td>
            <td className={lbl}>Power in KW</td>
            <td className={val} colSpan={2}>{d.PowerInKW}</td>
          </tr>

          <tr><td className={sec} colSpan={6}>Training Facilities</td></tr>
        </tbody>
      </table>

      {/* ── TRAINING FACILITIES ── */}
      <table className="w-full">
        <thead>
          <tr>
            <td className={`${hdr} w-1/4`}>Facilities</td>
            <td className={`${hdr} w-1/4`}>Required Separately</td>
            <td className={`${hdr} w-1/4`}>Area in Sq. Meter</td>
            <td className={`${hdr} w-1/4`}>Utilization per Week in Hours</td>
          </tr>
        </thead>
        <tbody>
          {facilities.map((f, i) => (
            <tr key={i}>
              <td className={ctr}>{f.label}</td>
              <td className={ctr}>{f.separately}</td>
              <td className={ctr}>{f.area}</td>
              <td className={ctr}>{f.util}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── APPROVAL FEES ── */}
      <table className="w-full">
        <tbody>
          <tr><td className={sec} colSpan={4}>Approval Fees per Unit in Rs.</td></tr>
        </tbody>
        <thead>
          <tr>
            <td className={hdr}>Inspection Fees</td>
            <td className={hdr}>Security Deposit</td>
            <td className={hdr}>Renewal Fees (for 3 Years)</td>
            <td className={hdr}>Approval Group</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={ctr}>{d.InspectionFees}</td>
            <td className={ctr}>{d.SecurityDeposit}</td>
            <td className={ctr}>{d.RenewalFees}</td>
            <td className={ctr}>{d.ApprovalGroupID}</td>
          </tr>

          <tr><td className={sec} colSpan={4}>Admission and Certification</td></tr>
          <tr>
            <td className={lbl}>Admission Fees</td>
            <td className={val}>{d.InspectionFees}</td>
            <td className={lbl}>Exam/ Assessment Fees</td>
            <td className={val}>{d.ExamAssesmentFee}</td>
          </tr>

          <tr><td className={sec} colSpan={4}>Syllabus</td></tr>
          <tr>
            <td className={lbl}>Syllabus Version</td>
            <td className={val}>{d.SyllabusVersionDisplay}</td>
            <td className={lbl}>Model Curriculum</td>
            <td className={val}>
              <a href={d.ModelCurriculumUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">
                {d.ModelCurriculumUrl}
              </a>
            </td>
          </tr>
          <tr>
            <td className={val}></td>
            <td className={val}></td>
            <td className={lbl}>Qualification Pack</td>
            <td className={val}>
              <a href={d.QualificationPackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">
                {d.QualificationPackUrl}
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── MINIMUM ENTRY QUALIFICATION ── */}
      <table className="w-full">
        <tbody>
          <tr><td className={sec} colSpan={5}>Minimum Entry Qualification</td></tr>
        </tbody>
        <thead>
          <tr>
            <td className={`${hdr} w-10`}>Sr. No.</td>
            <td className={`${hdr} w-2/5`}>Qualification</td>
            <td className={hdr}>Mandatory Criteria</td>
            <td className={hdr}>Experience in Months</td>
            <td className={hdr}>Remark</td>
          </tr>
        </thead>
        <tbody>
          {qualifications.length > 0 ? qualifications.map((q, i) => (
            <tr key={i}>
              <td className={ctr}>{i + 1}.</td>
              <td className={val}>{q.Qualification}</td>
              <td className={val}>{q.MandatoryCriteria}</td>
              <td className={ctr}>{q.ExperienceInMonths}</td>
              <td className={val}>{q.Remark}</td>
            </tr>
          )) : (
            <tr><td className={ctr} colSpan={5}>No Qualification Data</td></tr>
          )}
        </tbody>
      </table>

      {/* ── TRAINING INFRASTRUCTURE ── */}
      <table className="w-full">
        <tbody>
          <tr><td className={sec} colSpan={5}>Training Infrastructure</td></tr>
        </tbody>
        {trainingInfra.length > 0 ? (
          <>
            <thead>
              <tr>
                <td className={`${hdr} w-10`}>Sr. No.</td>
                <td className={hdr}>Item</td>
                <td className={hdr}>Quantity</td>
                <td className={hdr}>Description</td>
                <td className={hdr}>Remark</td>
              </tr>
            </thead>
            <tbody>
              {trainingInfra.map((item, i) => (
                <tr key={i}>
                  <td className={ctr}>{i + 1}.</td>
                  <td className={val}>{item.ItemName}</td>
                  <td className={ctr}>{item.Quantity}</td>
                  <td className={val}>{item.Description}</td>
                  <td className={val}>{item.Remark}</td>
                </tr>
              ))}
            </tbody>
          </>
        ) : (
          <tbody>
            <tr><td className={ctr} colSpan={5}>No Training Infrastructure Added</td></tr>
          </tbody>
        )}
      </table>

      {/* ── FOOTER ── */}
      <div className="bg-blue-900 text-white text-center text-xs py-2 mt-4">
        © Maharashtra State Board of Skill, Vocational Education and Training. All Rights Reserved.
      </div>
    </div>
  )
}

export default CourseNormsPrint;