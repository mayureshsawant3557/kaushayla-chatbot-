
// import { useState, useEffect, useRef } from "react";
// import { Plus, Trash2, X } from "lucide-react";
// import agent from "../../../../lib/api/agent";
// import {
//   GetMasterSectorapi,
//   GetMasterSubSectorAPI,
//   GetCourse,
//   GetExamType,
//   GetMasterTableListAPI,
//   SaveCourseapi ,
// } from "../../../../Endpoints_All/Administration/admin";

// // ══════════════════════════════════════════════════════════════
// //  API HELPER  (uses your existing agent instance)
// // ══════════════════════════════════════════════════════════════
// const api = {
//   get: async (url) => {
//     try {
//       const res = await agent.get(url);
//       return res?.data?.Data || res?.Data || [];
//     } catch (e) {
//       console.error("GET error", url, e);
//       return [];
//     }
//   },
//   post: async (url, payload) => {
//     const res = await agent.post(url, payload);
//     return res?.data || res;
//   },
//   upload: async (formData) => {
//     const res = await agent.post("/Base/UploadCourseDocument", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res?.data || res;
//   },
// };

// const mapTV = (d = []) => d.map((x) => ({ label: x.Text,      value: String(x.Value)        }));
// const mapCT = (d = []) => d.map((x) => ({ label: x.CourseType, value: String(x.CourseTypeID) }));
// const mapET = (d = []) => d.map((x) => ({ label: x.ExamType,   value: String(x.ExamTypeID)   }));


// const SEL  = { label: "Select",       value: "-1" };
// const SEL0 = { label: "Select",       value: "0"  };
// const DASH = { label: "-- Select --", value: "-1" };

// const YN_OPTS       = [DASH, { label:"Yes",value:"0" }, { label:"No",value:"1" }];
// const FLOOR_OPTS    = [DASH, { label:"Ground Floor",value:"0"  }, { label:"First Floor",value:"1" }, { label:"Second Floor",value:"2" }];
// const POWER_OPTS    = [DASH, { label:"Single Phase",value:"1"  }, { label:"Three Phase",value:"2"  }];
// const CTYPE_OPTS    = [SEL,  { label:"Full Time",   value:"1"  }, { label:"Part Time",  value:"2"  }, { label:"Distance",value:"3" }];
// const MANDATORY_OPT = [DASH, { label:"Yes",value:"1" }, { label:"No",value:"0" }];


// const LABEL_COLOR = "#3b3fa0";   
// const HEADER_BG   = "#1e2d5f";  

// const inputCls = (err) =>
//   `w-full px-3 py-2 border rounded text-sm text-gray-800 bg-white
//    focus:outline-none focus:ring-1 focus:ring-blue-400
//    ${err ? "border-red-400" : "border-gray-300"}`;

// const selectCls = (err, disabled) =>
//   `w-full px-3 py-2 border rounded text-sm bg-white appearance-none
//    focus:outline-none focus:ring-1 focus:ring-blue-400
//    ${err      ? "border-red-400"                       : "border-gray-300"}
//    ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-gray-800"}`;

// const FL = ({ text, required, error }) => (
//   <label className="block mb-1 text-sm font-medium" style={{ color: LABEL_COLOR }}>
//     {text}
//     {required && <span className="text-red-500 ml-0.5">*</span>}
//     {error    && <span className="ml-2 text-xs font-normal text-red-500">{text} is required</span>}
//   </label>
// );

// /** Native select dropdown */
// const Sel = ({ label, options = [], value, onChange, error, required, disabled }) => (
//   <div>
//     {label && <FL text={label} required={required} error={error} />}
//     <div className="relative">
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         disabled={disabled}
//         className={selectCls(error, disabled)}
//       >
//         {options.map((o) => (
//           <option key={o.value} value={o.value}>{o.label}</option>
//         ))}
//       </select>
//       {/* custom caret */}
//       <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▾</span>
//     </div>
//   </div>
// );

// /** Text / number input */
// const Inp = ({ label, value, onChange, error, required, type = "text", readOnly, placeholder }) => (
//   <div>
//     {label && <FL text={label} required={required} error={error} />}
//     <input
//       type={type} value={value} onChange={onChange}
//       readOnly={readOnly} placeholder={placeholder}
//       className={`${inputCls(error)} ${readOnly ? "bg-gray-100 text-gray-500" : ""}`}
//     />
//   </div>
// );

// /** Fieldset + legend section wrapper — matches the bordered sections in image */
// const Sec = ({ title, children }) => (
//   <fieldset className="border border-gray-300 rounded px-4 pt-1 pb-4 mt-5">
//     <legend
//       className="px-2 text-sm font-semibold"
//       style={{ color: "#374151" }}
//     >
//       {title}
//     </legend>
//     {children}
//   </fieldset>
// );

// const InfoBadge = ({ tip }) => (
//   <span
//     title={tip}
//     className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-xs cursor-help select-none ml-1"
//     style={{ backgroundColor: "#3b82f6" }}
//   >
//     i
//   </span>
// );

// const PlusBtn = ({ onClick }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className="w-7 h-7 rounded flex items-center justify-center text-white transition-colors hover:opacity-80"
//     style={{ backgroundColor: "#2563eb" }}
//   >
//     <Plus size={14} strokeWidth={2.5} />
//   </button>
// );

// const DelBtn = ({ onClick }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className="w-7 h-7 rounded flex items-center justify-center text-white transition-colors hover:opacity-80"
//     style={{ backgroundColor: "#2563eb" }}
//   >
//     <Trash2 size={13} strokeWidth={2} />
//   </button>
// );


// const UploadModal = ({ title, fileNameDisplay, onClose, onUploaded }) => {
//   const [file,    setFile]    = useState(null);
//   const [errMsg,  setErrMsg]  = useState("");
//   const [loading, setLoading] = useState(false);
//   const inputRef = useRef();

//   const handleFile = (e) => {
//     const f = e.target.files[0];
//     if (!f) return;
//     const ok = ["image/jpeg","image/jpg","application/pdf"].includes(f.type);
//     if (!ok)               { setErrMsg("Only jpg, jpeg, pdf allowed.");    return; }
//     if (f.size > 1048576)  { setErrMsg("Maximum file size is 1 MB.");      return; }
//     setErrMsg(""); setFile(f);
//   };

//   const handleUpload = async () => {
//     if (!file) { setErrMsg("Please select a file."); return; }
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("file", file);
//       fd.append("FileNameDisplay", fileNameDisplay);
//       const res = await api.upload(fd);
//       onUploaded(res?.Data?.DocumentURL || res?.DocumentURL || "");
//       onClose();
//     } catch {
//       setErrMsg("Upload failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        
//         <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: HEADER_BG }}>
//           <h3 className="text-white font-semibold text-sm">{title}</h3>
//           <button onClick={onClose} className="text-white hover:text-red-300 transition-colors">
//             <X size={16} />
//           </button>
//         </div>

       
//         <div className="px-6 py-5 text-center space-y-1">
//           <p className="text-sm text-gray-700">
//             File Types Allowed :&nbsp;
//             <span className="font-semibold" style={{ color: LABEL_COLOR }}>jpg, jpeg, pdf</span>
//           </p>
//           <p className="text-sm text-gray-700">
//             Maximum File Size Allowed :&nbsp;
//             <span className="font-semibold" style={{ color: LABEL_COLOR }}>1 MB</span>
//           </p>
//           <hr className="my-3 border-gray-200" />
//           <div className="text-left mt-3">
//             <label className="block text-sm font-medium mb-2" style={{ color: LABEL_COLOR }}>
//               Select File to Upload <span className="text-red-500">*</span>
//             </label>
//             <input
//               ref={inputRef} type="file" accept=".jpg,.jpeg,.pdf"
//               onChange={handleFile}
//               className="block w-full text-sm text-gray-600 border border-gray-300 rounded
//                 file:mr-3 file:py-1.5 file:px-4 file:border-0
//                 file:text-sm file:font-medium file:bg-gray-200 file:text-gray-700
//                 hover:file:bg-gray-300 cursor-pointer"
//             />
//             {file   && <p className="text-xs text-green-600 mt-1">✓ {file.name}</p>}
//             {errMsg && <p className="text-xs text-red-500 mt-1">{errMsg}</p>}
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 px-6 py-3 border-t border-gray-200">
//           <button onClick={onClose}
//             className="px-5 py-2 rounded text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors">
//             Close
//           </button>
//           <button onClick={handleUpload} disabled={loading}
//             className="px-5 py-2 rounded text-sm font-medium text-white transition-colors disabled:opacity-60"
//             style={{ backgroundColor: "#2563eb" }}>
//             {loading ? "Uploading…" : "Upload"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };


// const NewCourseForm = () => {

//   // ── dropdown options ─────────────────────────────────────
//   const [opts, setOpts] = useState({
//     sector:           [SEL],
//     subSector:        [SEL],
//     courseApprovedBy: [SEL],
//     courseCategory:   [SEL],
//     nsqfLevel:        [SEL],
//     trainingFeeCat:   [SEL],
//     approvalGroup:    [SEL0],
//     examType:         [SEL],
//     qualification:    [SEL],
//     mandatoryCriteria:[SEL],
//     nameOfItem:       [SEL],
//     remarkUtil:       [SEL],
//   });

//   const [loadingInit,      setLoadingInit]      = useState(true);
//   const [loadingSubSector, setLoadingSubSector] = useState(false);

//   // ── form values ──────────────────────────────────────────
//   const [form, setForm] = useState({
//     sector:"-1", subSector:"-1", courseApprovedBy:"-1",
//     courseCode:"", courseCategory:"-1", courseType:"-1",
//     courseName:"", courseNameDisplay:"",
//     maxBatches:"", nsqfLevel:"-1", trainingFeeCat:"-1",
//     minAge:"14", intakePerUnit:"30",
//     trainingModes:[],
//     theory:"", practical:"", ojtMandatory:"", ojtOptional:"",
//     floorPref:"-1", workshopSqm:"",
//     powerType:"-1", powerKW:"",
//     facilities:{
//       classRoom:      { reqSep:"-1", area:"30", util:"" },
//       drawingHall:    { reqSep:"-1", area:"30", util:"" },
//       computerLab:    { reqSep:"-1", area:"30", util:"" },
//       agricultureLand:{ reqSep:"-1", area:"30", util:"" },
//       openGround:     { reqSep:"-1", area:"30", util:"" },
//     },
//     inspectionFees:"", securityDeposit:"", renewalFees:"",
//     approvalGroup:"0",
//     admissionFees:"", examType:"-1", examFees:"0",
//     syllabusVersion:"",
//     modelCurrType:"upload", qualPackType:"upload",
//     modelCurriculumUrl:"", qualificationPackUrl:"",
//   });

//   // ── grid rows ────────────────────────────────────────────
//   const [qualRows,  setQualRows]  = useState([]);
//   const [infraRows, setInfraRows] = useState([]);

//   // ── upload modal ─────────────────────────────────────────
//   const [modal, setModal] = useState({ open:false, type:"" });

//   const [errors, setErrors] = useState({});

//   // ════════════════════════════════════════════════════════
//   //  LOAD ALL DROPDOWNS ON MOUNT  (parallel Promise.all)
//   // ════════════════════════════════════════════════════════
//   useEffect(() => {
//     (async () => {
//       setLoadingInit(true);
//       const TL = GetMasterTableListAPI;
//       try {
//         const [
//           secD, appD, catD, examD, nsqfD, feeD, agrD, qualD, mandD, itemD, remD,
//         ] = await Promise.all([
//           api.get(GetMasterSectorapi),                                                                                          // ① Sector
//           api.get(`${TL}?TableName=Master_CourseApprover&DataValueField=CourseApproverID&DataTextField=CourseApprover&HasSelect=true&orderByText=CourseApproverID`), // ③
//           api.get(GetCourse),                                                                                                   // ④ CourseCategory
//           api.get(GetExamType),                                                                                                 // ⑨ ExamType
//           api.get(`${TL}?TableName=Master_NSQFLevel&DataValueField=ID&DataTextField=NSQFLEVEL&HasSelect=true&orderByText=ID`),  // ⑥
//           api.get(`${TL}?TableName=Master_TrainingFeeCategory&DataValueField=ID&DataTextField=TrainingFeeCategory&HasSelect=true&orderByText=ID`), // ⑦
//           api.get(`${TL}?TableName=Master_ApprovalGroup&DataValueField=ID&DataTextField=ApprovalGroupName&HasSelect=false&orderByText=ID`),        // ⑧
//           api.get("/Base/GetMasterEntryQualification"),                                                                        // ⑩
//           api.get(`${TL}?TableName=Master_CouseMandatorQualification&DataValueField=MandatorQualificationID&DataTextField=MandatorQualification&HasSelect=true&orderByText=MandatorQualification`), // ⑪
//           api.get(`${TL}?TableName=Master_TrainingNameofItem&DataValueField=ID&DataTextField=TrainingNameofItem&HasSelect=true&orderByText=TrainingNameofItem`),    // ⑫
//           api.get(`${TL}?TableName=Master_TrainingRemarkforUtilization&DataValueField=ID&DataTextField=RemarkforUtilization&HasSelect=true&orderByText=ID`),        // ⑬
//         ]);
//         setOpts((p) => ({
//           ...p,
//           sector:           mapTV(secD),
//           courseApprovedBy: mapTV(appD),
//           courseCategory:   [SEL, ...mapCT(catD)],
//           examType:         [SEL, ...mapET(examD)],
//           nsqfLevel:        mapTV(nsqfD),
//           trainingFeeCat:   mapTV(feeD),
//           approvalGroup:    [SEL0, ...mapTV(agrD)],
//           qualification:    mapTV(qualD),
//           mandatoryCriteria:mapTV(mandD),
//           nameOfItem:       mapTV(itemD),
//           remarkUtil:       mapTV(remD),
//         }));
//       } finally {
//         setLoadingInit(false);
//       }
//     })();
//   }, []);

//   // ════════════════════════════════════════════════════════
//   //  SUB SECTOR — cascades on Sector change
//   //  ② GET /Base/GetMasterSubSector?SectorID={id}
//   // ════════════════════════════════════════════════════════
//   useEffect(() => {
//     if (form.sector === "-1") {
//       setOpts((p) => ({ ...p, subSector:[SEL] }));
//       setForm((p) => ({ ...p, subSector:"-1" }));
//       return;
//     }
//     (async () => {
//       setLoadingSubSector(true);
//       try {
//         const d = await api.get(`${GetMasterSubSectorAPI}?SectorID=${form.sector}`);
//         setOpts((p) => ({ ...p, subSector: mapTV(d) }));
//         setForm((p) => ({ ...p, subSector: "-1" }));
//       } finally {
//         setLoadingSubSector(false);
//       }
//     })();
//   }, [form.sector]);

//   // ── helpers ──────────────────────────────────────────────
//   const set    = (k, v) => setForm((p) => ({ ...p, [k]: v }));
//   const setFac = (fac, k, v) => setForm((p) => ({
//     ...p, facilities:{ ...p.facilities, [fac]:{ ...p.facilities[fac],[k]:v } },
//   }));
//   const toggleMode = (m) => set("trainingModes",
//     form.trainingModes.includes(m)
//       ? form.trainingModes.filter((x) => x !== m)
//       : [...form.trainingModes, m]);

//   const total = ["theory","practical","ojtMandatory","ojtOptional"]
//     .reduce((a, k) => a + (parseFloat(form[k]) || 0), 0);

//   // ── Qualification grid ops ────────────────────────────────
//   const addQual = () =>
//     setQualRows((r) => [...r, { id:Date.now(), qualID:"-1", critID:"-1", exp:"", remark:"" }]);
//   const delQual = (id) => setQualRows((r) => r.filter((x) => x.id !== id));
//   const setQual = (id, k, v) => setQualRows((r) => r.map((x) => x.id===id ? {...x,[k]:v} : x));

//   // ── Infrastructure grid ops ───────────────────────────────
//   const addInfra = () =>
//     setInfraRows((r) => [...r, { id:Date.now(), itemID:"-1", reqPerUnit:"", remarkID:"-1", mandatory:"-1", allied:"-1", mou:"-1" }]);
//   const delInfra = (id) => setInfraRows((r) => r.filter((x) => x.id !== id));
//   const setInfra = (id, k, v) => setInfraRows((r) => r.map((x) => x.id===id ? {...x,[k]:v} : x));

//   // ── SAVE  POST /Course/SaveCourse ─────────────────────────
//   const handleSave = async () => {
//   const e = {};

//   ["sector","subSector","courseApprovedBy","courseCode","courseCategory","courseType","courseName","courseNameDisplay"]
//     .forEach((k) => { 
//       if (!form[k] || form[k] === "-1") e[k] = true; 
//     });

//   setErrors(e);
//   if (Object.keys(e).length) return;

//   try {
//     const payload = {
//   courseID: 0,

//   sectorID: +form.sector,
//   sector: form.sectorName || "",

//   subSectorID: +form.subSector,
//   subSector: form.subSectorName || "",

//   courseApprovedByID: +form.courseApprovedBy,
//   courseApprovedBy: form.courseApprovedByName || "",

//   courseCode: form.courseCode.trim().toUpperCase(),
//   courseName: form.courseName.trim(),
//   courseNameDisplay: form.courseNameDisplay.trim(),

//   trainingModeConventional: form.trainingModes.includes("Conventional") ? 1 : 0,
//   trainingModeDualSystem: form.trainingModes.includes("Dual System") ? 1 : 0,
//   trainingModeBlended: form.trainingModes.includes("Blended") ? 1 : 0,
//   trainingModeOnline: form.trainingModes.includes("Online") ? 1 : 0,
//   trainingModeAllMode: form.trainingModes.includes("All Mode") ? 1 : 0,

//   trainingMode: form.trainingModes.join(", "),

//   courseCategoryID: +form.courseCategory,
//   courseCategory: form.courseCategoryName || "",

//   courseTypeID: +form.courseType,
//   courseType: form.courseTypeName || "",

//   duration: "",
//   courseDurationunit: 0,
//   hours: "",
//   maxBatchPerDay: form.maxBatches || "",

//   nsqfLevelID: +form.nsqfLevel,
//   nsqfLevel: form.nsqfLevelName || "",

//   trainingFeeID: +form.trainingFeeCat,
//   trainingFeeCategory: form.trainingFeeCatName || "",

//   minAge: +form.minAge || 0,
//   intakePerUnit: +form.intakePerUnit || 0,

//   boardCoursesDuration: 0,
//   boardCoursesDurationUnitID: 0,
//   boardCoursesDurationUnit: "",

//   workshopFloorPreference: +form.floorPref,
//   workshopFloorPreferenceDisplay: form.floorPrefName || "",

//   workshopSpaceRequired: +form.workshopSqm || 0,

//   powerType: +form.powerType,
//   powerTypeDisplay: form.powerTypeName || "",
//   powerInKW: +form.powerKW || 0,

//   separateClassRoomRequired: +form.facilities.classRoom.reqSep,
//   classRoomArea: +form.facilities.classRoom.area || 0,
//   classUtilizationperweekinHours: +form.facilities.classRoom.util || 0,

//   separateDrawingHallRequired: +form.facilities.drawingHall.reqSep,
//   drawingRoomArea: +form.facilities.drawingHall.area || 0,
//   drawingUtilizationperweekinHours: +form.facilities.drawingHall.util || 0,

//   separateComputerLabRequired: +form.facilities.computerLab.reqSep,
//   computerLabArea: +form.facilities.computerLab.area || 0,
//   computerLabUtilizationperweekinHours: +form.facilities.computerLab.util || 0,

//   separateAgricultureLandRequired: +form.facilities.agricultureLand.reqSep,
//   agricultureLandArea: +form.facilities.agricultureLand.area || 0,
//   agricultureLandUtilizationperweekinHours: +form.facilities.agricultureLand.util || 0,

//   separateOpenGroundRequired: +form.facilities.openGround.reqSep,
//   openGroundArea: +form.facilities.openGround.area || 0,
//   openGroundUtilizationperweekinHours: +form.facilities.openGround.util || 0,

//   inspectionFees: +form.inspectionFees || 0,
//   securityDeposit: +form.securityDeposit || 0,
//   renewalFees: +form.renewalFees || 0,
//   admissionFees: +form.admissionFees || 0,

//   examAssesmentFee: +form.examFees || 0,
//   examTypeID: +form.examType,
//   approvalGroupID: +form.approvalGroup,

//   syllabusVersion: new Date().toISOString(),
//   syllabusVersionDisplay: form.syllabusVersion || "",

//   modelCurriculumUrl: form.modelCurriculumUrl,
//   qualificationPackUrl: form.qualificationPackUrl,

//   theoryDuration: +form.theory || 0,
//   practicalDuration: +form.practical || 0,
//   ojtMandatoryDuration: +form.ojtMandatory || 0,
//   ojtOptionalDuration: +form.ojtOptional || 0,
//   totalDuration: total || 0,

//   theoryDurationDisplay: form.theoryDisplay || "",
//   practicalDurationDisplay: form.practicalDisplay || "",
//   ojtMandatoryDurationDisplay: form.ojtMandatoryDisplay || "",
//   ojtOptionalDurationDisplay: form.ojtOptionalDisplay || "",
//   totalDurationDisplay: form.totalDisplay || "",

//   // BOARD DURATIONS (default)
//   theoryBoardDuration: 0,
//   theoryBoardDurationunit: 0,
//   theoryBoardDurationunitDisplay: "",

//   practicalBoardDuration: 0,
//   practicalBoardDurationunit: 0,
//   practicalBoardDurationunitDisplay: "",

//   ojtMandatoryBoardDuration: 0,
//   ojtMandatoryBoardDurationunit: 0,
//   ojtMandatoryBoardDurationunitDisplay: "",

//   ojtOptionalBoardDuration: 0,
//   ojtOptionalBoardDurationunit: 0,
//   ojtOptionalBoardDurationunitDisplay: "",

//   totalBoardDuration: 0,
//   totalBoardDurationunit: 0,
//   totalBoardDurationunitDisplay: "",

//   boardShare: 0,
//   saiShare: 0,

//   // ✅ Qualification
//   minimumEntryQualificationEntity: qualRows.map((r) => ({
//     courseID: 0,
//     qualificationRowID: 0,
//     qualificationID: +r.qualID,
//     mandatoryCriteriaID: +r.critID,
//     experienceInMonth: r.exp || "",
//     remark: r.remark || "",
//     qualification: r.qualName || "",
//     mandatoryCriteria: r.critName || "",
//   })),

//   // ✅ Infrastructure (UPDATED STRUCTURE)
//   trainingInfrastructureEntities: infraRows.map((r) => ({
//     traningInfrastructureRowID: 0,
//     courseID: 0,
//     nameofItem: r.itemName || "",
//     nameofItemID: +r.itemID,
//     category: r.categoryName || "",
//     categoryID: +r.categoryID || 0,
//     remarkforUtilization: r.remarkName || "",
//     remarkforUtilizationID: +r.remarkID,
//     dsrItem: r.dsrItem || "",
//     mandatory: r.mandatory || "",
//     alliedCourseItem: r.allied || "",
//     moUItem: r.mou || "",
//     requirePerunit: r.reqPerUnit || "",
//     isActive: 1,
//   })),
// };

//     // ✅ Correct API call
//     const res = await api.post("/api/CourseDetails/SaveCourse", payload);

//     const result = res?.data;

//     if (result === "Y" || result?.message === "Y") {
//       alert("Course saved successfully!");
//     } else {
//       alert(result?.message || "Save failed.");
//     }

//   } catch (err) {
//     console.error(err);
//     alert("Error: " + (err?.response?.data || err?.message || "Unknown error"));
//   }
// };

//   const handleReset = () => {
//     setForm((p) => ({
//       ...p,
//       sector:"-1", subSector:"-1", courseApprovedBy:"-1",
//       courseCode:"", courseCategory:"-1", courseType:"-1",
//       courseName:"", courseNameDisplay:"",
//     }));
//     setErrors({});
//   };

//   const FAC_ROWS = [
//     { key:"classRoom",       label:"Class Room"       },
//     { key:"drawingHall",     label:"Drawing Hall"     },
//     { key:"computerLab",     label:"Computer Lab"     },
//     { key:"agricultureLand", label:"Agriculture Land" },
//     { key:"openGround",      label:"Open Ground"      },
//   ];

//   if (loadingInit) return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="flex items-center gap-3">
//         <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//         <span className="text-sm text-gray-600">Loading…</span>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-100" style={{ fontFamily:"system-ui,sans-serif" }}>

//       {/* Upload Modal */}
//       {modal.open && (
//         <UploadModal
//           title={modal.type==="modelcurriculum" ? "Upload Model Curriculum" : "Upload Qualification Pack"}
//           fileNameDisplay={modal.type}
//           onClose={() => setModal({ open:false, type:"" })}
//           onUploaded={(url) => {
//             set(modal.type==="modelcurriculum" ? "modelCurriculumUrl" : "qualificationPackUrl", url);
//           }}
//         />
//       )}

//       {/* ── Dark Navy Header — matches screenshot exactly ── */}
//       <div
//         className="flex items-center gap-3 px-4 py-2 text-white text-sm font-semibold"
//         style={{ backgroundColor: HEADER_BG }}
//       >
//         <span className="text-lg leading-none">☰</span>
//         <span>New Course</span>
//       </div>

//       {/* ── Page body ── */}
//       <div className="p-4">

//         {/* ══ OUTER FIELDSET — "Course Details" legend ══
//             This is the main bordered box from the screenshots */}
//         <fieldset
//           className="bg-white rounded border border-gray-300 px-5 pb-6"
//           style={{ borderColor: "#d1d5db" }}
//         >
//           <legend
//             className="px-2 text-sm font-semibold text-gray-700 ml-2"
//           >
//             Course Details
//           </legend>

//           {/* ══ Row 1: Sector / Sub Sector / Course Approved By ══ */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

//             {/* ① Sector — GET /Base/GetMasterSector */}
//             <Sel label="Sector" required
//               options={opts.sector} value={form.sector}
//               onChange={(v) => set("sector", v)} error={errors.sector}
//             />

//             {/* ② Sub Sector — GET /Base/GetMasterSubSector?SectorID={id}  (cascades) */}
//             <div>
//               <FL text="Sub Sector" required error={errors.subSector} />
//               <div className="relative">
//                 <select
//                   value={form.subSector}
//                   onChange={(e) => set("subSector", e.target.value)}
//                   disabled={form.sector==="-1" || loadingSubSector}
//                   className={selectCls(errors.subSector, form.sector==="-1"||loadingSubSector)}
//                 >
//                   {opts.subSector.map((o) => (
//                     <option key={o.value} value={o.value}>{o.label}</option>
//                   ))}
//                 </select>
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▾</span>
//                 {loadingSubSector && (
//                   <span className="absolute right-7 top-2.5 text-xs text-blue-500 animate-pulse">Loading…</span>
//                 )}
//               </div>
//               {form.sector==="-1" && (
//                 <p className="text-xs text-gray-400 mt-1">Select a sector first</p>
//               )}
//             </div>

//             {/* ③ Course Approved By — GET /Base/GetMasterTableList?TableName=Master_CourseApprover */}
//             <Sel label="Course Approved by" required
//               options={opts.courseApprovedBy} value={form.courseApprovedBy}
//               onChange={(v) => set("courseApprovedBy", v)} error={errors.courseApprovedBy}
//             />
//           </div>

//           {/* ══ Row 2: Course Code / Course Category / Course Type ══ */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
//             <Inp label="Course Code" required
//               value={form.courseCode}
//               onChange={(e) => set("courseCode", e.target.value)} error={errors.courseCode}
//             />

//             {/* ④ Course Category — GET /Base/GetCourseType */}
//             <Sel label="Course Category" required
//               options={opts.courseCategory} value={form.courseCategory}
//               onChange={(v) => set("courseCategory", v)} error={errors.courseCategory}
//             />

//             {/* ⑤ Course Type — STATIC (Global.MasterCourseTimingType) */}
//             <Sel label="Course Type" required
//               options={CTYPE_OPTS} value={form.courseType}
//               onChange={(v) => set("courseType", v)} error={errors.courseType}
//             />
//           </div>

//           {/* Course Name — full width */}
//           <div className="mb-5">
//             <Inp label="Course Name" required
//               value={form.courseName}
//               onChange={(e) => set("courseName", e.target.value)} error={errors.courseName}
//             />
//           </div>

//           {/* Course Name Display — full width */}
//           <div className="mb-5">
//             <Inp label="Course Name Display" required
//               value={form.courseNameDisplay}
//               onChange={(e) => set("courseNameDisplay", e.target.value)} error={errors.courseNameDisplay}
//             />
//           </div>

//           {/* ══ Row 3: Max Batches / NSQF Level / Training Fee Category ══ */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
//             <Inp label="Max. batches per day" type="number" required
//               value={form.maxBatches} onChange={(e) => set("maxBatches", e.target.value)}
//             />

//             {/* ⑥ NSQF Level — GET /Base/GetMasterTableList?TableName=Master_NSQFLevel */}
//             <Sel label="NSQF Level" required
//               options={opts.nsqfLevel} value={form.nsqfLevel}
//               onChange={(v) => set("nsqfLevel", v)}
//             />

//             {/* ⑦ Training Fee Category — GET /Base/GetMasterTableList?TableName=Master_TrainingFeeCategory */}
//             <Sel label="Training Fee Category" required
//               options={opts.trainingFeeCat} value={form.trainingFeeCat}
//               onChange={(v) => set("trainingFeeCat", v)}
//             />
//           </div>

//           {/* Minimum Age + Intake Per Unit */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
//             <Inp label="Minimum Age" type="number" required
//               value={form.minAge} onChange={(e) => set("minAge", e.target.value)}
//             />
//             <Inp label="Intake Per Unit" type="number" required
//               value={form.intakePerUnit} onChange={(e) => set("intakePerUnit", e.target.value)}
//             />
//           </div>

//           {/* Training Mode checkboxes */}
//           <div className="mb-2">
//             <p className="text-sm font-medium mb-2" style={{ color:LABEL_COLOR }}>
//               Training Mode <span className="text-red-500">*</span>
//             </p>
//             <div className="flex flex-wrap gap-6">
//               {["Conventional","Dual System","Blended","Online","All Mode"].map((m) => (
//                 <label key={m} className="flex items-center gap-2 text-sm cursor-pointer select-none text-gray-700">
//                   <input type="checkbox" checked={form.trainingModes.includes(m)}
//                     onChange={() => toggleMode(m)}
//                     className="w-4 h-4 accent-blue-600 rounded" />
//                   {m}
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* ── Duration in Hours ── */}
//           <Sec title="Duration in Hours">
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
//               <Inp label="Theory"        type="number" required value={form.theory}        onChange={(e)=>set("theory",e.target.value)} />
//               <Inp label="Practical"     type="number" required value={form.practical}     onChange={(e)=>set("practical",e.target.value)} />
//               <Inp label="OJT Mandatory" type="number" required value={form.ojtMandatory}  onChange={(e)=>set("ojtMandatory",e.target.value)} />
//               <Inp label="OJT Optional"  type="number"          value={form.ojtOptional}   onChange={(e)=>set("ojtOptional",e.target.value)} />
//               <Inp label="Total" value={String(total||0)} readOnly required />
//             </div>
//           </Sec>

//           {/* ── Workshop ── */}
//           <Sec title="Workshop">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
//               <Sel label="Floor Preference" required options={FLOOR_OPTS}
//                 value={form.floorPref} onChange={(v)=>set("floorPref",v)} />
//               <Inp label="Workshop in Sq. Meter" type="number" required
//                 value={form.workshopSqm} onChange={(e)=>set("workshopSqm",e.target.value)} />
//             </div>
//           </Sec>

//           {/* ── Power Supply ── */}
//           <Sec title="Power Supply">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
//               <Sel label="Power Type" required options={POWER_OPTS}
//                 value={form.powerType} onChange={(v)=>set("powerType",v)} />
//               <Inp label="Power in KW" type="number" required
//                 value={form.powerKW} onChange={(e)=>set("powerKW",e.target.value)} />
//             </div>
//           </Sec>

//           {/* ── Training Facilities ── */}
//           <Sec title="Training Facilities">
//             <div className="overflow-x-auto mt-2">
//               <table className="w-full text-sm border-collapse">
//                 <thead>
//                   <tr className="border-b border-gray-200 bg-gray-50">
//                     <th className="text-left px-3 py-2 font-semibold text-gray-700 w-40">Facilities</th>
//                     <th className="text-left px-3 py-2 font-semibold text-gray-700">
//                       Required Separately <span className="text-red-500">*</span>
//                     </th>
//                     <th className="text-left px-3 py-2 font-semibold text-gray-700">
//                       Area in Sq. Meter <span className="text-red-500">*</span>
//                     </th>
//                     <th className="text-left px-3 py-2 font-semibold text-gray-700">
//                       Utilization per Week in Hours <span className="text-red-500">*</span>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {FAC_ROWS.map(({ key, label }) => (
//                     <tr key={key} className="border-t border-gray-100">
//                       <td className="px-3 py-2 font-medium text-sm" style={{ color:LABEL_COLOR }}>
//                         {label} <span className="text-red-500">*</span>
//                       </td>
//                       <td className="px-3 py-2 min-w-36">
//                         <Sel options={YN_OPTS} value={form.facilities[key].reqSep}
//                           onChange={(v)=>setFac(key,"reqSep",v)} />
//                       </td>
//                       <td className="px-3 py-2 min-w-24">
//                         <input type="number" value={form.facilities[key].area}
//                           onChange={(e)=>setFac(key,"area",e.target.value)}
//                           className={inputCls(false)} />
//                       </td>
//                       <td className="px-3 py-2 min-w-24">
//                         <input type="number" value={form.facilities[key].util}
//                           onChange={(e)=>setFac(key,"util",e.target.value)}
//                           className={inputCls(false)} />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </Sec>

//           {/* ── Approval Fees ── */}
//           <Sec title="Approval Fees per Unit in Rs.">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
//               <Inp label="Inspection Fees"            type="number" required value={form.inspectionFees}  onChange={(e)=>set("inspectionFees",e.target.value)} />
//               <Inp label="Security Deposit"           type="number" required value={form.securityDeposit} onChange={(e)=>set("securityDeposit",e.target.value)} />
//               <Inp label="Renewal Fees (for 3 Years)" type="number" required value={form.renewalFees}     onChange={(e)=>set("renewalFees",e.target.value)} />
//             </div>
//             <div className="mt-4 max-w-xs">
//               {/* ⑧ Approval Group — GET /Base/GetMasterTableList?TableName=Master_ApprovalGroup */}
//               <Sel label="Approval Group" required
//                 options={opts.approvalGroup} value={form.approvalGroup}
//                 onChange={(v)=>set("approvalGroup",v)} />
//             </div>
//           </Sec>

//           {/* ── Admission and Certification ── */}
//           <Sec title="Admission and Certification">
//             <div className="mt-3 mb-4 max-w-xs">
//               <Inp label="Admission Fees" type="number" required
//                 value={form.admissionFees} onChange={(e)=>set("admissionFees",e.target.value)} />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
//               {/* ⑨ Exam Type — GET /Base/GetExamType */}
//               <Sel label="Type of Exam" required
//                 options={opts.examType} value={form.examType}
//                 onChange={(v)=>set("examType",v)} />
//               <Inp label="Examination / Assessment Fees per Candidate" type="number" required
//                 value={form.examFees} onChange={(e)=>set("examFees",e.target.value)} />
//             </div>
//           </Sec>

//           {/* ── Syllabus ── */}
//           <Sec title="Syllabus">
//             <div className="mt-3 mb-4 max-w-xs">
//               <Inp label="Syllabus Version" required
//                 value={form.syllabusVersion} onChange={(e)=>set("syllabusVersion",e.target.value)} />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {[
//                 { fk:"modelCurrType", uk:"modelCurriculumUrl",  mt:"modelcurriculum",  title:"Model Curriculum",  tip:"Upload or link model curriculum" },
//                 { fk:"qualPackType",  uk:"qualificationPackUrl", mt:"qualificationpack",title:"Qualification Pack", tip:"Upload or link qualification pack" },
//               ].map(({ fk, uk, mt, title, tip }) => (
//                 <div key={fk}>
//                   <p className="text-sm font-medium flex items-center mb-2" style={{ color:LABEL_COLOR }}>
//                     {title}<InfoBadge tip={tip} />
//                   </p>
//                   <div className="flex gap-5 mb-3">
//                     {[["upload","Upload File"],["external","External Link"]].map(([v,l]) => (
//                       <label key={v} className="flex items-center gap-2 text-sm cursor-pointer text-gray-700">
//                         <input type="radio" name={fk} value={v}
//                           checked={form[fk]===v} onChange={()=>set(fk,v)}
//                           className="accent-blue-600" /> {l}
//                       </label>
//                     ))}
//                   </div>
//                   {form[fk]==="upload" ? (
//                     <div className="flex items-center gap-3">
//                       {/* ⑮ Upload button → opens modal → POST /Base/UploadCourseDocument */}
//                       <button
//                         type="button"
//                         onClick={() => setModal({ open:true, type:mt })}
//                         className="px-6 py-2 rounded text-sm font-medium text-white transition-colors"
//                         style={{ backgroundColor:"#06b6d4" }}
//                       >
//                         Upload
//                       </button>
//                       {form[uk] && (
//                         <a href={form[uk]} target="_blank" rel="noreferrer"
//                           className="text-xs text-blue-600 underline">View File</a>
//                       )}
//                     </div>
//                   ) : (
//                     <input type="url" placeholder="https://" value={form[uk]}
//                       onChange={(e)=>set(uk,e.target.value)}
//                       className={inputCls(false)} />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </Sec>

//           {/* ══════════════════════════════════════════════════════
//               MINIMUM ENTRY QUALIFICATION GRID
//               ⑩ Qualification      GET /Base/GetMasterEntryQualification
//               ⑪ Mandatory Criteria GET /Base/GetMasterTableList Master_CouseMandatorQualification
//           ══════════════════════════════════════════════════════ */}
//           <Sec title="Minimum Entry Qualification">
//             <div className="border border-gray-200 rounded overflow-hidden mt-2">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="p-2 w-10 border-r border-gray-200">
//                       <PlusBtn onClick={addQual} />
//                     </th>
//                     {["Sr. No.","Qualification","Mandatory Criteria","Experience in Months","Remark"].map((h) => (
//                       <th key={h} className="p-2 text-left font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {qualRows.length===0 ? (
//                     <tr><td colSpan={6} className="p-4 text-center text-gray-400 text-sm">No Qualification Added</td></tr>
//                   ) : qualRows.map((row, idx) => (
//                     <tr key={row.id} className="border-t border-gray-200">
//                       <td className="p-2 text-center border-r border-gray-200">
//                         <DelBtn onClick={()=>delQual(row.id)} />
//                       </td>
//                       <td className="p-2 text-center text-gray-600 border-r border-gray-200">{idx+1}.</td>
//                       <td className="p-2 min-w-52 border-r border-gray-200">
//                         {/* ⑩ */}
//                         <Sel options={opts.qualification} value={row.qualID}
//                           onChange={(v)=>setQual(row.id,"qualID",v)} />
//                       </td>
//                       <td className="p-2 min-w-48 border-r border-gray-200">
//                         {/* ⑪ */}
//                         <Sel options={opts.mandatoryCriteria} value={row.critID}
//                           onChange={(v)=>setQual(row.id,"critID",v)} />
//                       </td>
//                       <td className="p-2 min-w-32 border-r border-gray-200">
//                         <input type="number" value={row.exp}
//                           onChange={(e)=>setQual(row.id,"exp",e.target.value)}
//                           className={inputCls(false)} />
//                       </td>
//                       <td className="p-2 min-w-32">
//                         <input type="text" value={row.remark}
//                           onChange={(e)=>setQual(row.id,"remark",e.target.value)}
//                           className={inputCls(false)} />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </Sec>

//           {/* ══════════════════════════════════════════════════════
//               TRAINING INFRASTRUCTURE GRID
//               ⑫ Name of Item       GET /Base/GetMasterTableList Master_TrainingNameofItem
//               ⑬ Remark Utilization GET /Base/GetMasterTableList Master_TrainingRemarkforUtilization
//               Mandatory / Allied / MoU — STATIC Yes/No
//           ══════════════════════════════════════════════════════ */}
//           <Sec title="Training Infrastructure">
//             <div className="border border-gray-200 rounded overflow-hidden mt-2 overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="p-2 w-10 border-r border-gray-200">
//                       <PlusBtn onClick={addInfra} />
//                     </th>
//                     {["Sr. No.","Name of Item","Required per unit","Remark for Utilization","Mandatory","Allied Course Item","MoU Item"].map((h) => (
//                       <th key={h} className="p-2 text-left font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {infraRows.length===0 ? (
//                     <tr><td colSpan={8} className="p-4 text-center text-gray-400 text-sm">No Training Infrastructure Added</td></tr>
//                   ) : infraRows.map((row, idx) => (
//                     <tr key={row.id} className="border-t border-gray-200">
//                       <td className="p-2 text-center border-r border-gray-200">
//                         <DelBtn onClick={()=>delInfra(row.id)} />
//                       </td>
//                       <td className="p-2 text-center text-gray-600 border-r border-gray-200">{idx+1}.</td>
//                       <td className="p-2 min-w-48 border-r border-gray-200">
//                         {/* ⑫ */}
//                         <Sel options={opts.nameOfItem} value={row.itemID}
//                           onChange={(v)=>setInfra(row.id,"itemID",v)} />
//                       </td>
//                       <td className="p-2 min-w-28 border-r border-gray-200">
//                         <input type="text" value={row.reqPerUnit}
//                           onChange={(e)=>setInfra(row.id,"reqPerUnit",e.target.value)}
//                           className={inputCls(false)} />
//                       </td>
//                       <td className="p-2 min-w-48 border-r border-gray-200">
//                         {/* ⑬ */}
//                         <Sel options={opts.remarkUtil} value={row.remarkID}
//                           onChange={(v)=>setInfra(row.id,"remarkID",v)} />
//                       </td>
//                       <td className="p-2 min-w-32 border-r border-gray-200">
//                         <Sel options={MANDATORY_OPT} value={row.mandatory}
//                           onChange={(v)=>setInfra(row.id,"mandatory",v)} />
//                       </td>
//                       <td className="p-2 min-w-32 border-r border-gray-200">
//                         <Sel options={MANDATORY_OPT} value={row.allied}
//                           onChange={(v)=>setInfra(row.id,"allied",v)} />
//                       </td>
//                       <td className="p-2 min-w-28">
//                         <Sel options={MANDATORY_OPT} value={row.mou}
//                           onChange={(v)=>setInfra(row.id,"mou",v)} />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </Sec>

//           {/* ── Action Buttons ── */}
//           <div className="flex justify-end gap-3 pt-6">
//             <button
//               type="button"
//               onClick={handleSave}
//               className="px-8 py-2 rounded text-sm font-semibold text-white transition-colors"
//               style={{ backgroundColor:"#15803d" }}
//             >
//               Save
//             </button>
//             <button
//               type="button"
//               onClick={handleReset}
//               className="px-8 py-2 rounded text-sm font-semibold text-white transition-colors"
//               style={{ backgroundColor:"#ef4444" }}
//             >
//               Reset
//             </button>
//           </div>

//         </fieldset>{/* end Course Details */}
//       </div>
//     </div>
//   );
// };

// export default NewCourseForm;
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import agent from "../../../../lib/api/agent"; // adjust path as needed
import {
  GetMasterSectorapi,
  GetMasterSubSectorAPI,
  GetCourse,
  GetExamType,
  GetMasterTableListAPI,
  SaveCourseapi,
} from "../../../../Endpoints_All/Administration/admin"; // adjust path as needed

import DropdownComponent from "../../../formcomponent/DropdownComponent";
import UploadPdf from "../../../formcomponent/UploadPdf";
import Loader from "../../../formcomponent/Loader";

const api = {
  get: async (url) => {
    try {
      const res = await agent.get(url);
      // Handle all backend response shapes:
      // res.data.Data | res.data.data | res.Data | res.data | plain array
      const raw = res?.data?.Data ?? res?.data?.data ?? res?.Data ?? res?.data ?? res ?? [];
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  },
  post: async (url, payload) => {
    const res = await agent.post(url, payload);
    return res?.data || res;
  },
};

// Universal mapper — covers every field name variation your APIs may return
const mapTV = (d = []) => d.map((x) => {
  // Value field: try all known ID/Value field names
  const val =
    x.Value      ?? x.value      ??
    x.ID         ?? x.Id         ?? x.id         ??
    x.SectorID   ?? x.SubSectorID ?? x.CourseApproverID ??
    x.NSQFLevelID ?? x.TrainingFeeCategoryID ??
    x.ApprovalGroupID ?? x.ExamTypeID ??
    x.QualificationID ?? x.MandatorQualificationID ??
    x.TrainingNameofItemID ?? x.RemarkforUtilizationID ??
    x.CourseTypeID ?? x.CourseCategoryID ??
    null;

  // Label field: try all known Text/Name field names
  const lbl =
    x.Text                  ?? x.label               ??
    x.Name                  ?? x.name                ??
    x.Qualification         ?? x.QualificationName   ??
    x.MandatorQualification ?? x.MandatoryQualification ??
    x.TrainingNameofItem    ?? x.NameofItem           ??
    x.RemarkforUtilization  ?? x.Remark               ??
    x.NSQFLEVEL             ?? x.NSQFLevel            ??
    x.TrainingFeeCategory   ?? x.FeeCategory          ??
    x.ApprovalGroupName     ?? x.GroupName            ??
    x.ExamType              ?? x.Sector               ??
    x.SubSector             ?? x.CourseApprover       ??
    x.CourseType            ?? x.CourseCategory       ??
    (val != null ? String(val) : null);

  if (lbl == null || val == null) return null;
  return { label: String(lbl), value: String(val) };
}).filter(Boolean);
const mapCT = (d = []) => d
  .map((x) => ({ label: x.CourseType ?? x.Text ?? x.label, value: String(x.CourseTypeID ?? x.Value ?? x.value ?? '') }))
  .filter((x) => x.label && x.value);
const mapET = (d = []) => d
  .map((x) => ({ label: x.ExamType ?? x.Text ?? x.label, value: String(x.ExamTypeID ?? x.Value ?? x.value ?? '') }))
  .filter((x) => x.label && x.value);

const SEL  = { label: "Select", value: "-1" };
const SEL0 = { label: "Select", value: "0"  };
const DASH = { label: "-- Select --", value: "-1" };

const YN_OPTS       = [DASH, { label:"Yes",value:"0" }, { label:"No",value:"1" }];
const FLOOR_OPTS    = [DASH, { label:"Ground Floor",value:"0" }, { label:"First Floor",value:"1" }, { label:"Second Floor",value:"2" }];
const POWER_OPTS    = [DASH, { label:"Single Phase",value:"1" }, { label:"Three Phase",value:"2" }];
const CTYPE_OPTS    = [SEL,  { label:"Full Time",value:"1" }, { label:"Part Time",value:"2" }, { label:"Distance",value:"3" }];
const MANDATORY_OPT = [DASH, { label:"Yes",value:"1" }, { label:"No",value:"0" }];

const LABEL_COLOR = "#3b3fa0";
const HEADER_BG   = "#1e2d5f";

const inputCls = (err) =>
  `w-full px-3 py-2 border rounded text-sm text-gray-800 bg-white
   focus:outline-none focus:ring-1 focus:ring-blue-400
   ${err ? "border-red-400" : "border-gray-300"}`;

/** Field label */
const FL = ({ text, required, error }) => (
  <label className="block mb-1 text-sm font-medium" style={{ color: LABEL_COLOR }}>
    {text}
    {required && <span className="text-red-500 ml-0.5">*</span>}
    {error    && <span className="ml-2 text-xs font-normal text-red-500">{text} is required</span>}
  </label>
);

/** Text / number input */
const Inp = ({ label, value, onChange, error, required, type = "text", readOnly, placeholder }) => (
  <div>
    {label && <FL text={label} required={required} error={error} />}
    <input
      type={type} value={value} onChange={onChange}
      readOnly={readOnly} placeholder={placeholder}
      className={`${inputCls(error)} ${readOnly ? "bg-gray-100 text-gray-500" : ""}`}
    />
  </div>
);

/** Fieldset + legend section wrapper */
const Sec = ({ title, children }) => (
  <fieldset className="border border-gray-300 rounded px-4 pt-1 pb-4 mt-5">
    <legend
      className="px-3 py-0.5 text-sm font-semibold rounded"
      style={{ color: "#1e2d5f", background: "#f1f5f9", border: "1px solid #d1d5db" }}
    >
      {title}
    </legend>
    {children}
  </fieldset>
);

const InfoBadge = ({ tip }) => (
  <span
    title={tip}
    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-xs cursor-help select-none ml-1"
    style={{ backgroundColor: "#3b82f6" }}
  >i</span>
);

const PlusBtn = ({ onClick }) => (
  <button type="button" onClick={onClick}
    className="w-7 h-7 rounded flex items-center justify-center text-white transition-colors hover:opacity-80"
    style={{ backgroundColor: "#2563eb" }}>
    <Plus size={14} strokeWidth={2.5} />
  </button>
);

const DelBtn = ({ onClick }) => (
  <button type="button" onClick={onClick}
    className="w-7 h-7 rounded flex items-center justify-center text-white transition-colors hover:opacity-80"
    style={{ backgroundColor: "#2563eb" }}>
    <Trash2 size={13} strokeWidth={2} />
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN FORM
// ─────────────────────────────────────────────────────────────────────────────
const NewCourseForm = () => {

  const [opts, setOpts] = useState({
    sector:[], subSector:[], courseApprovedBy:[], courseCategory:[],
    nsqfLevel:[], trainingFeeCat:[], approvalGroup:[], examType:[],
    qualification:[], mandatoryCriteria:[], nameOfItem:[], remarkUtil:[],
  });

  const [loadingInit,      setLoadingInit]      = useState(true);
  const [loadingSubSector, setLoadingSubSector] = useState(false);
  const [saving,           setSaving]           = useState(false);

  const [form, setForm] = useState({
    sector:"-1", subSector:"-1", courseApprovedBy:"-1",
    courseCode:"", courseCategory:"-1", courseType:"-1",
    courseName:"", courseNameDisplay:"",
    maxBatches:"", nsqfLevel:"-1", trainingFeeCat:"-1",
    minAge:"14", intakePerUnit:"30",
    trainingModes:[],
    theory:"", practical:"", ojtMandatory:"", ojtOptional:"",
    floorPref:"-1", workshopSqm:"",
    powerType:"-1", powerKW:"",
    facilities:{
      classRoom:      { reqSep:"-1", area:"30", util:"" },
      drawingHall:    { reqSep:"-1", area:"30", util:"" },
      computerLab:    { reqSep:"-1", area:"30", util:"" },
      agricultureLand:{ reqSep:"-1", area:"30", util:"" },
      openGround:     { reqSep:"-1", area:"30", util:"" },
    },
    inspectionFees:"", securityDeposit:"", renewalFees:"",
    approvalGroup:"0",
    admissionFees:"", examType:"-1", examFees:"0",
    syllabusVersion:"",
    modelCurrType:"upload", qualPackType:"upload",
    modelCurriculumUrl:"", qualificationPackUrl:"",
  });

  const [qualRows,  setQualRows]  = useState([]);
  const [infraRows, setInfraRows] = useState([]);
  const [errors,    setErrors]    = useState({});

  // ── Init dropdowns ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingInit(true);
      const TL = GetMasterTableListAPI;
      try {
        const [secD, appD, catD, examD, nsqfD, feeD, agrD, qualD, mandD, itemD, remD] = await Promise.all([
          api.get(GetMasterSectorapi),
          api.get(`${TL}?TableName=Master_CourseApprover&DataValueField=CourseApproverID&DataTextField=CourseApprover&HasSelect=true&orderByText=CourseApproverID`),
          api.get(GetCourse),
          api.get(GetExamType),
          api.get(`${TL}?TableName=Master_NSQFLevel&DataValueField=ID&DataTextField=NSQFLEVEL&HasSelect=true&orderByText=ID`),
          api.get(`${TL}?TableName=Master_TrainingFeeCategory&DataValueField=ID&DataTextField=TrainingFeeCategory&HasSelect=true&orderByText=ID`),
          api.get(`${TL}?TableName=Master_ApprovalGroup&DataValueField=ID&DataTextField=ApprovalGroupName&HasSelect=false&orderByText=ID`),
          api.get("/Base/GetMasterEntryQualification"),
          api.get(`${TL}?TableName=Master_CouseMandatorQualification&DataValueField=MandatorQualificationID&DataTextField=MandatorQualification&HasSelect=true&orderByText=MandatorQualification`),
          api.get(`${TL}?TableName=Master_TrainingNameofItem&DataValueField=ID&DataTextField=TrainingNameofItem&HasSelect=true&orderByText=TrainingNameofItem`),
          api.get(`${TL}?TableName=Master_TrainingRemarkforUtilization&DataValueField=ID&DataTextField=RemarkforUtilization&HasSelect=true&orderByText=ID`),
        ]);
        setOpts({
          // HasSelect=true APIs already return a Select row — do NOT prepend SEL again
          sector:            [SEL, ...mapTV(secD)],  // GetMasterSector has no HasSelect — prepend
          courseApprovedBy:  mapTV(appD),            // HasSelect=true — already has Select
          courseCategory:    [SEL, ...mapCT(catD)],  // GetCourse has no HasSelect — prepend
          examType:          [SEL, ...mapET(examD)], // GetExamType has no HasSelect — prepend
          nsqfLevel:         mapTV(nsqfD),           // HasSelect=true — already has Select
          trainingFeeCat:    mapTV(feeD),            // HasSelect=true — already has Select
          approvalGroup:     [SEL0, ...mapTV(agrD)], // HasSelect=false — prepend SEL0
          qualification:     [SEL, ...mapTV(qualD)], // no HasSelect — prepend
          mandatoryCriteria: mapTV(mandD),           // HasSelect=true — already has Select
          nameOfItem:        mapTV(itemD),           // HasSelect=true — already has Select
          remarkUtil:        mapTV(remD),            // HasSelect=true — already has Select
          subSector:         [SEL],
        });
      } finally {
        setLoadingInit(false);
      }
    })();
  }, []);

  // ── Sub sector cascade ──────────────────────────────────────────────────────
  useEffect(() => {
    if (form.sector === "-1") {
      setOpts((p) => ({ ...p, subSector:[SEL] }));
      setForm((p) => ({ ...p, subSector:"-1" }));
      return;
    }
    (async () => {
      setLoadingSubSector(true);
      try {
        const d = await api.get(`${GetMasterSubSectorAPI}?SectorID=${form.sector}`);
        setOpts((p) => ({ ...p, subSector:[SEL, ...mapTV(d)] }));
        setForm((p) => ({ ...p, subSector:"-1" }));
      } finally {
        setLoadingSubSector(false);
      }
    })();
  }, [form.sector]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set    = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setFac = (fac, k, v) => setForm((p) => ({
    ...p, facilities:{ ...p.facilities, [fac]:{ ...p.facilities[fac],[k]:v } },
  }));
  const INDIVIDUAL_MODES = ["Conventional", "Dual System", "Blended", "Online"];
  const ALL_MODES        = [...INDIVIDUAL_MODES, "All Mode"];

  const toggleMode = (m) => {
    setForm((p) => {
      const cur = p.trainingModes;

      if (m === "All Mode") {
        // If "All Mode" is currently checked → uncheck everything
        // If "All Mode" is currently unchecked → check everything
        const newModes = cur.includes("All Mode") ? [] : [...ALL_MODES];
        return { ...p, trainingModes: newModes };
      }

      // Individual mode toggled
      let next = cur.includes(m)
        ? cur.filter((x) => x !== m)          // uncheck this mode
        : [...cur.filter((x) => x !== "All Mode"), m]; // add this mode, remove All Mode first

      // If all 4 individual modes are now checked → also auto-check "All Mode"
      const allIndividualChecked = INDIVIDUAL_MODES.every((im) => next.includes(im));
      if (allIndividualChecked && !next.includes("All Mode")) {
        next = [...next, "All Mode"];
      }

      return { ...p, trainingModes: next };
    });
  };

  const total = ["theory","practical","ojtMandatory","ojtOptional"]
    .reduce((a, k) => a + (parseFloat(form[k]) || 0), 0);

  // ── Qualification grid ──────────────────────────────────────────────────────
  const addQual = () =>
    setQualRows((r) => [...r, { id:Date.now(), qualID:"-1", critID:"-1", exp:"", remark:"" }]);
  const delQual = (id) => setQualRows((r) => r.filter((x) => x.id !== id));
  const setQual = (id, k, v) => setQualRows((r) => r.map((x) => x.id===id ? {...x,[k]:v} : x));

  // ── Infrastructure grid ─────────────────────────────────────────────────────
  const addInfra = () =>
    setInfraRows((r) => [...r, { id:Date.now(), itemID:"-1", reqPerUnit:"", remarkID:"-1", mandatory:"-1", allied:"-1", mou:"-1" }]);
  const delInfra = (id) => setInfraRows((r) => r.filter((x) => x.id !== id));
  const setInfra = (id, k, v) => setInfraRows((r) => r.map((x) => x.id===id ? {...x,[k]:v} : x));

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const e = {};
    ["sector","subSector","courseApprovedBy","courseCode","courseCategory","courseType","courseName","courseNameDisplay"]
      .forEach((k) => { if (!form[k] || form[k] === "-1") e[k] = true; });

    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const payload = {
        courseID: 0,
        sectorID: +form.sector,
        subSectorID: +form.subSector,
        courseApprovedByID: +form.courseApprovedBy,
        courseCode: form.courseCode.trim().toUpperCase(),
        courseName: form.courseName.trim(),
        courseNameDisplay: form.courseNameDisplay.trim(),
        trainingModeConventional: form.trainingModes.includes("Conventional") ? 1 : 0,
        trainingModeDualSystem: form.trainingModes.includes("Dual System") ? 1 : 0,
        trainingModeBlended: form.trainingModes.includes("Blended") ? 1 : 0,
        trainingModeOnline: form.trainingModes.includes("Online") ? 1 : 0,
        trainingModeAllMode: form.trainingModes.includes("All Mode") ? 1 : 0,
        trainingMode: form.trainingModes.join(", "),
        courseCategoryID: +form.courseCategory,
        courseTypeID: +form.courseType,
        maxBatchPerDay: form.maxBatches || "",
        nsqfLevelID: +form.nsqfLevel,
        trainingFeeID: +form.trainingFeeCat,
        minAge: +form.minAge || 0,
        intakePerUnit: +form.intakePerUnit || 0,
        workshopFloorPreference: +form.floorPref,
        workshopSpaceRequired: +form.workshopSqm || 0,
        powerType: +form.powerType,
        powerInKW: +form.powerKW || 0,
        separateClassRoomRequired: +form.facilities.classRoom.reqSep,
        classRoomArea: +form.facilities.classRoom.area || 0,
        classUtilizationperweekinHours: +form.facilities.classRoom.util || 0,
        separateDrawingHallRequired: +form.facilities.drawingHall.reqSep,
        drawingRoomArea: +form.facilities.drawingHall.area || 0,
        drawingUtilizationperweekinHours: +form.facilities.drawingHall.util || 0,
        separateComputerLabRequired: +form.facilities.computerLab.reqSep,
        computerLabArea: +form.facilities.computerLab.area || 0,
        computerLabUtilizationperweekinHours: +form.facilities.computerLab.util || 0,
        separateAgricultureLandRequired: +form.facilities.agricultureLand.reqSep,
        agricultureLandArea: +form.facilities.agricultureLand.area || 0,
        agricultureLandUtilizationperweekinHours: +form.facilities.agricultureLand.util || 0,
        separateOpenGroundRequired: +form.facilities.openGround.reqSep,
        openGroundArea: +form.facilities.openGround.area || 0,
        openGroundUtilizationperweekinHours: +form.facilities.openGround.util || 0,
        inspectionFees: +form.inspectionFees || 0,
        securityDeposit: +form.securityDeposit || 0,
        renewalFees: +form.renewalFees || 0,
        admissionFees: +form.admissionFees || 0,
        examAssesmentFee: +form.examFees || 0,
        examTypeID: +form.examType,
        approvalGroupID: +form.approvalGroup,
        syllabusVersion: new Date().toISOString(),
        syllabusVersionDisplay: form.syllabusVersion || "",
        modelCurriculumUrl: form.modelCurriculumUrl,
        qualificationPackUrl: form.qualificationPackUrl,
        theoryDuration: +form.theory || 0,
        practicalDuration: +form.practical || 0,
        ojtMandatoryDuration: +form.ojtMandatory || 0,
        ojtOptionalDuration: +form.ojtOptional || 0,
        totalDuration: total || 0,
        theoryBoardDuration: 0,
        practicalBoardDuration: 0,
        ojtMandatoryBoardDuration: 0,
        ojtOptionalBoardDuration: 0,
        totalBoardDuration: 0,
        boardShare: 0,
        saiShare: 0,
        minimumEntryQualificationEntity: qualRows.map((r) => ({
          courseID: 0,
          qualificationRowID: 0,
          qualificationID: +r.qualID,
          mandatoryCriteriaID: +r.critID,
          experienceInMonth: r.exp || "",
          remark: r.remark || "",
        })),
        trainingInfrastructureEntities: infraRows.map((r) => ({
          traningInfrastructureRowID: 0,
          courseID: 0,
          nameofItemID: +r.itemID,
          remarkforUtilizationID: +r.remarkID,
          mandatory: r.mandatory || "",
          alliedCourseItem: r.allied || "",
          moUItem: r.mou || "",
          requirePerunit: r.reqPerUnit || "",
          isActive: 1,
        })),
      };

      const res = await api.post("/api/CourseDetails/SaveCourse", payload);
      const result = res?.data;
      if (result === "Y" || result?.message === "Y") {
        alert("Course saved successfully!");
      } else {
        alert(result?.message || "Save failed.");
      }
    } catch (err) {
      alert("Error: " + (err?.response?.data || err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm((p) => ({
      ...p,
      sector:"-1", subSector:"-1", courseApprovedBy:"-1",
      courseCode:"", courseCategory:"-1", courseType:"-1",
      courseName:"", courseNameDisplay:"",
    }));
    setErrors({});
  };

  const FAC_ROWS = [
    { key:"classRoom",        label:"Class Room"        },
    { key:"drawingHall",      label:"Drawing Hall"      },
    { key:"computerLab",      label:"Computer Lab"      },
    { key:"agricultureLand",  label:"Agriculture Land"  },
    { key:"openGround",       label:"Open Ground"       },
  ];

  if (loadingInit) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily:"system-ui,sans-serif" }}>

      {/* Full-screen saving overlay */}
      {saving && <Loader />}

      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-2 text-white text-sm font-semibold"
        style={{ backgroundColor: HEADER_BG }}
      >
        <span className="text-lg leading-none">☰</span>
        <span>New Course</span>
      </div>

      <div className="p-4">
        <fieldset className="bg-white rounded border-2 border-gray-300 px-5 pb-6"
          style={{ borderColor:"#d1d5db" }}>
          <legend
            className="px-3 py-0.5 ml-2 text-sm font-semibold rounded"
            style={{ color: "#1e2d5f", background: "#f1f5f9", border: "1px solid #d1d5db" }}
          >
            Course Details
          </legend>

          {/* Row 1: Sector / Sub Sector / Course Approved By */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

            {/* ① Sector */}
            <DropdownComponent
              label="Sector" required
              options={opts.sector} value={form.sector}
              onChange={(v) => set("sector", v)} error={errors.sector}
            />

            {/* ② Sub Sector (cascades) */}
            <DropdownComponent
              label="Sub Sector" required
              options={opts.subSector} value={form.subSector}
              onChange={(v) => set("subSector", v)}
              error={errors.subSector}
              disabled={form.sector==="-1"}
              loading={loadingSubSector}
            />

            {/* ③ Course Approved By */}
            <DropdownComponent
              label="Course Approved by" required
              options={opts.courseApprovedBy} value={form.courseApprovedBy}
              onChange={(v) => set("courseApprovedBy", v)} error={errors.courseApprovedBy}
            />
          </div>

          {/* Row 2: Course Code / Course Category / Course Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <Inp label="Course Code" required
              value={form.courseCode}
              onChange={(e) => set("courseCode", e.target.value)} error={errors.courseCode}
            />

            {/* ④ Course Category */}
            <DropdownComponent
              label="Course Category" required
              options={opts.courseCategory} value={form.courseCategory}
              onChange={(v) => set("courseCategory", v)} error={errors.courseCategory}
            />

            {/* ⑤ Course Type */}
            <DropdownComponent
              label="Course Type" required
              options={CTYPE_OPTS} value={form.courseType}
              onChange={(v) => set("courseType", v)} error={errors.courseType}
            />
          </div>

          {/* Course Name */}
          <div className="mb-5">
            <Inp label="Course Name" required
              value={form.courseName}
              onChange={(e) => set("courseName", e.target.value)} error={errors.courseName}
            />
          </div>

          {/* Course Name Display */}
          <div className="mb-5">
            <Inp label="Course Name Display" required
              value={form.courseNameDisplay}
              onChange={(e) => set("courseNameDisplay", e.target.value)} error={errors.courseNameDisplay}
            />
          </div>

          {/* Row 3: Max Batches / NSQF Level / Training Fee Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <Inp label="Max. batches per day" type="number" required
              value={form.maxBatches} onChange={(e) => set("maxBatches", e.target.value)}
            />

            {/* ⑥ NSQF Level */}
            <DropdownComponent
              label="NSQF Level" required
              options={opts.nsqfLevel} value={form.nsqfLevel}
              onChange={(v) => set("nsqfLevel", v)}
            />

            {/* ⑦ Training Fee Category */}
            <DropdownComponent
              label="Training Fee Category" required
              options={opts.trainingFeeCat} value={form.trainingFeeCat}
              onChange={(v) => set("trainingFeeCat", v)}
            />
          </div>

          {/* Min Age + Intake */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
            <Inp label="Minimum Age" type="number" required
              value={form.minAge} onChange={(e) => set("minAge", e.target.value)}
            />
            <Inp label="Intake Per Unit" type="number" required
              value={form.intakePerUnit} onChange={(e) => set("intakePerUnit", e.target.value)}
            />
          </div>

          {/* Training Mode */}
          <div className="mb-2">
            <p className="text-sm font-medium mb-2" style={{ color:LABEL_COLOR }}>
              Training Mode <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-6">
              {ALL_MODES.map((m) => (
                <label key={m} className="flex items-center gap-2 text-sm cursor-pointer select-none text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.trainingModes.includes(m)}
                    onChange={() => toggleMode(m)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          {/* Duration in Hours */}
          <Sec title="Duration in Hours">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
              <Inp label="Theory"        type="number" required value={form.theory}       onChange={(e)=>set("theory",e.target.value)} />
              <Inp label="Practical"     type="number" required value={form.practical}    onChange={(e)=>set("practical",e.target.value)} />
              <Inp label="OJT Mandatory" type="number" required value={form.ojtMandatory} onChange={(e)=>set("ojtMandatory",e.target.value)} />
              <Inp label="OJT Optional"  type="number"          value={form.ojtOptional}  onChange={(e)=>set("ojtOptional",e.target.value)} />
              <Inp label="Total" value={String(total || 0)} readOnly required />
            </div>
          </Sec>

          {/* Workshop */}
          <Sec title="Workshop">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <DropdownComponent label="Floor Preference" required
                options={FLOOR_OPTS} value={form.floorPref}
                onChange={(v)=>set("floorPref",v)}
              />
              <Inp label="Workshop in Sq. Meter" type="number" required
                value={form.workshopSqm} onChange={(e)=>set("workshopSqm",e.target.value)}
              />
            </div>
          </Sec>

          {/* Power Supply */}
          <Sec title="Power Supply">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <DropdownComponent label="Power Type" required
                options={POWER_OPTS} value={form.powerType}
                onChange={(v)=>set("powerType",v)}
              />
              <Inp label="Power in KW" type="number" required
                value={form.powerKW} onChange={(e)=>set("powerKW",e.target.value)}
              />
            </div>
          </Sec>

          {/* Training Facilities */}
          <Sec title="Training Facilities">
            <div className="mt-2" style={{overflowX:"auto",overflowY:"visible"}}>
              <table className="w-full text-sm border-collapse" style={{overflow:"visible"}}>
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 w-40">Facilities</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Required Separately <span className="text-red-500">*</span></th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Area in Sq. Meter <span className="text-red-500">*</span></th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Utilization per Week in Hours <span className="text-red-500">*</span></th>
                  </tr>
                </thead>
                <tbody style={{overflow:"visible"}}>
                  {FAC_ROWS.map(({ key, label }) => (
                    <tr key={key} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium text-sm" style={{ color:LABEL_COLOR }}>
                        {label} <span className="text-red-500">*</span>
                      </td>
                      <td className="px-3 py-2 min-w-40" style={{overflow:"visible",position:"relative",zIndex:10}}>
                        <DropdownComponent
                          label="" options={YN_OPTS} value={form.facilities[key].reqSep}
                          onChange={(v)=>setFac(key,"reqSep",v)}
                        />
                      </td>
                      <td className="px-3 py-2 min-w-24">
                        <input type="number" value={form.facilities[key].area}
                          onChange={(e)=>setFac(key,"area",e.target.value)}
                          className={inputCls(false)} />
                      </td>
                      <td className="px-3 py-2 min-w-24">
                        <input type="number" value={form.facilities[key].util}
                          onChange={(e)=>setFac(key,"util",e.target.value)}
                          className={inputCls(false)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Sec>

       
          <Sec title="Approval Fees per Unit in Rs.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <Inp label="Inspection Fees"            type="number" required value={form.inspectionFees}  onChange={(e)=>set("inspectionFees",e.target.value)} />
              <Inp label="Security Deposit"           type="number" required value={form.securityDeposit} onChange={(e)=>set("securityDeposit",e.target.value)} />
              <Inp label="Renewal Fees (for 3 Years)" type="number" required value={form.renewalFees}     onChange={(e)=>set("renewalFees",e.target.value)} />
            </div>
            <div className="mt-4 max-w-xs">
              
              <DropdownComponent label="Approval Group" required
                options={opts.approvalGroup} value={form.approvalGroup}
                onChange={(v)=>set("approvalGroup",v)}
              />
            </div>
          </Sec>

          
          <Sec title="Admission and Certification">
            <div className="mt-3 mb-4 max-w-xs">
              <Inp label="Admission Fees" type="number" required
                value={form.admissionFees} onChange={(e)=>set("admissionFees",e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
     
              <DropdownComponent label="Type of Exam" required
                options={opts.examType} value={form.examType}
                onChange={(v)=>set("examType",v)}
              />
              <Inp label="Examination / Assessment Fees per Candidate" type="number" required
                value={form.examFees} onChange={(e)=>set("examFees",e.target.value)}
              />
            </div>
          </Sec>

          <Sec title="Syllabus">
            <div className="mt-3 mb-4 max-w-xs">
              <Inp label="Syllabus Version" required
                value={form.syllabusVersion} onChange={(e)=>set("syllabusVersion",e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
              <div>
                <p className="text-sm font-medium flex items-center mb-2" style={{ color:LABEL_COLOR }}>
                  Model Curriculum <InfoBadge tip="Upload or link model curriculum" />
                </p>
                <div className="flex gap-5 mb-3">
                  {[["upload","Upload File"],["external","External Link"]].map(([v,l]) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer text-gray-700">
                      <input type="radio" name="modelCurrType" value={v}
                        checked={form.modelCurrType===v} onChange={()=>set("modelCurrType",v)}
                        className="accent-blue-600" /> {l}
                    </label>
                  ))}
                </div>
                {form.modelCurrType==="upload" ? (
           
                  <UploadPdf
                    id="modelCurriculum"
                    label="Model Curriculum"
                    showLabel={false}
                    buttonText="Upload"
                    buttonClassName="bg-[#06b6d4]"
                    allowedFileTypes="pdf, jpg, jpeg"
                    maxFileSize="1 MB"
                    uniquefilepath={form.modelCurriculumUrl}
                    linkName="View File"
                    onFileChange={({ filePath }) => set("modelCurriculumUrl", filePath)}
                  />
                ) : (
                  <input type="url" placeholder="https://" value={form.modelCurriculumUrl}
                    onChange={(e)=>set("modelCurriculumUrl",e.target.value)}
                    className={inputCls(false)} />
                )}
              </div>

          
              <div>
                <p className="text-sm font-medium flex items-center mb-2" style={{ color:LABEL_COLOR }}>
                  Qualification Pack <InfoBadge tip="Upload or link qualification pack" />
                </p>
                <div className="flex gap-5 mb-3">
                  {[["upload","Upload File"],["external","External Link"]].map(([v,l]) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer text-gray-700">
                      <input type="radio" name="qualPackType" value={v}
                        checked={form.qualPackType===v} onChange={()=>set("qualPackType",v)}
                        className="accent-blue-600" /> {l}
                    </label>
                  ))}
                </div>
                {form.qualPackType==="upload" ? (
                
                  <UploadPdf
                    id="qualificationPack"
                    label="Qualification Pack"
                    showLabel={false}
                    buttonText="Upload"
                    buttonClassName="bg-[#06b6d4]"
                    allowedFileTypes="pdf, jpg, jpeg"
                    maxFileSize="1 MB"
                    uniquefilepath={form.qualificationPackUrl}
                    linkName="View File"
                    onFileChange={({ filePath }) => set("qualificationPackUrl", filePath)}
                  />
                ) : (
                  <input type="url" placeholder="https://" value={form.qualificationPackUrl}
                    onChange={(e)=>set("qualificationPackUrl",e.target.value)}
                    className={inputCls(false)} />
                )}
              </div>
            </div>
          </Sec>

      
          <Sec title="Minimum Entry Qualification">
            <div className="border border-gray-200 rounded mt-2" style={{overflow:"visible"}}>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 w-10 border-r border-gray-200">
                      <PlusBtn onClick={addQual} />
                    </th>
                    {["Sr. No.","Qualification","Mandatory Criteria","Experience in Months","Remark"].map((h) => (
                      <th key={h} className="p-2 text-left font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{overflow:"visible"}}>
                  {qualRows.length===0 ? (
                    <tr><td colSpan={6} className="p-4 text-center text-gray-400 text-sm">No Qualification Added</td></tr>
                  ) : qualRows.map((row, idx) => (
                    <tr key={row.id} className="border-t border-gray-200">
                      <td className="p-2 text-center border-r border-gray-200">
                        <DelBtn onClick={()=>delQual(row.id)} />
                      </td>
                      <td className="p-2 text-center text-gray-600 border-r border-gray-200">{idx+1}.</td>
                      <td className="p-2 min-w-52 border-r border-gray-200" style={{overflow:"visible",position:"relative",zIndex:10}}>
                       
                        <DropdownComponent
                          label="" options={opts.qualification} value={row.qualID}
                          onChange={(v)=>setQual(row.id,"qualID",v)}
                        />
                      </td>
                      <td className="p-2 min-w-48 border-r border-gray-200" style={{overflow:"visible",position:"relative",zIndex:10}}>
                       
                        <DropdownComponent
                          label="" options={opts.mandatoryCriteria} value={row.critID}
                          onChange={(v)=>setQual(row.id,"critID",v)}
                        />
                      </td>
                      <td className="p-2 min-w-32 border-r border-gray-200">
                        <input type="number" value={row.exp}
                          onChange={(e)=>setQual(row.id,"exp",e.target.value)}
                          className={inputCls(false)} />
                      </td>
                      <td className="p-2 min-w-32">
                        <input type="text" value={row.remark}
                          onChange={(e)=>setQual(row.id,"remark",e.target.value)}
                          className={inputCls(false)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Sec>

          <Sec title="Training Infrastructure">
            <div className="border border-gray-200 rounded mt-2" style={{overflowX:"auto",overflowY:"visible"}}>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 w-10 border-r border-gray-200">
                      <PlusBtn onClick={addInfra} />
                    </th>
                    {["Sr. No.","Name of Item","Required per unit","Remark for Utilization","Mandatory","Allied Course Item","MoU Item"].map((h) => (
                      <th key={h} className="p-2 text-left font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{overflow:"visible"}}>
                  {infraRows.length===0 ? (
                    <tr><td colSpan={8} className="p-4 text-center text-gray-400 text-sm">No Training Infrastructure Added</td></tr>
                  ) : infraRows.map((row, idx) => (
                    <tr key={row.id} className="border-t border-gray-200">
                      <td className="p-2 text-center border-r border-gray-200">
                        <DelBtn onClick={()=>delInfra(row.id)} />
                      </td>
                      <td className="p-2 text-center text-gray-600 border-r border-gray-200">{idx+1}.</td>
                      <td className="p-2 min-w-48 border-r border-gray-200" style={{overflow:"visible",position:"relative",zIndex:10}}>
                      
                        <DropdownComponent
                          label="" options={opts.nameOfItem} value={row.itemID}
                          onChange={(v)=>setInfra(row.id,"itemID",v)}
                        />
                      </td>
                      <td className="p-2 min-w-28 border-r border-gray-200">
                        <input type="text" value={row.reqPerUnit}
                          onChange={(e)=>setInfra(row.id,"reqPerUnit",e.target.value)}
                          className={inputCls(false)} />
                      </td>
                      <td className="p-2 min-w-48 border-r border-gray-200" style={{overflow:"visible",position:"relative",zIndex:10}}>
                   
                        <DropdownComponent
                          label="" options={opts.remarkUtil} value={row.remarkID}
                          onChange={(v)=>setInfra(row.id,"remarkID",v)}
                        />
                      </td>
                      <td className="p-2 min-w-32 border-r border-gray-200" style={{overflow:"visible",position:"relative",zIndex:10}}>
                        <DropdownComponent
                          label="" options={MANDATORY_OPT} value={row.mandatory}
                          onChange={(v)=>setInfra(row.id,"mandatory",v)}
                        />
                      </td>
                      <td className="p-2 min-w-32 border-r border-gray-200" style={{overflow:"visible",position:"relative",zIndex:10}}>
                        <DropdownComponent
                          label="" options={MANDATORY_OPT} value={row.allied}
                          onChange={(v)=>setInfra(row.id,"allied",v)}
                        />
                      </td>
                      <td className="p-2 min-w-28" style={{overflow:"visible",position:"relative",zIndex:10}}>
                        <DropdownComponent
                          label="" options={MANDATORY_OPT} value={row.mou}
                          onChange={(v)=>setInfra(row.id,"mou",v)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Sec>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={handleSave}
              className="px-8 py-2 rounded text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor:"#15803d" }}>
              Save
            </button>
            <button type="button" onClick={handleReset}
              className="px-8 py-2 rounded text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor:"#ef4444" }}>
              Reset
            </button>
          </div>

        </fieldset>
      </div>
    </div>
  );
};

export default NewCourseForm;