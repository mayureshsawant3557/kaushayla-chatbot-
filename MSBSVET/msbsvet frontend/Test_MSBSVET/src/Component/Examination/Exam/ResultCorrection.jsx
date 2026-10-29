import { useContext, useEffect, useState } from "react";
import Button from "../../base/Button";
import FormComponent from "../../formcomponent/FormComponent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { CandidateResults, CandidateResultsDetails, SaveResultCorrection } from "../../../Endpoints_All/Examination/VerificationCertificate";
import { getCandidateID } from "../../../Endpoints_All/Admission/admission";
import agent from "../../../lib/api/agent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { Edit, Eye, FileSpreadsheet, Upload, Save } from "lucide-react";
import UploadPdf from "../../formcomponent/UploadPdf";
import UploadPhoto from "../../formcomponent/UploadPhoto";
import { getDeviceIP } from "../../../utils/CommonHelper";
import Swal from "sweetalert2";
import { ThemeContext } from "../../Context/ThemeContext";
import { useAuth } from "../../../Hooks/AuthContext";

const ResultCorrection = () => {
    const column = [
        { key: 'Action', header: 'Action', width: '70px', className: 'text-center' },
        {
            key: 'ApplicationIDDisplay',
            header: 'Application ID',
            width: '120px',
            className: 'text-center'
        },
        { key: 'Examination', header: 'Name of Examination', width: '140px', className: 'text-center' },
        { key: 'CourseNameCode', header: 'Course Name Code', width: '280px', className: 'text-center' },
        {
            key: 'Duration',
            header: 'Duration',
            width: '70px',
            className: 'text-center'
        },
        {
            key: 'InstituteNameCode',
            header: 'Institute Name Code',
            width: '280px',
            className: 'text-center'
        },
        {
            key: 'TotalMarksMax',
            header: 'Max Marks',
            width: '70px',
            className: 'text-center'
        },
        {
            key: 'TotalMarksMin',
            header: 'Min Marks',
            width: '70px',
            className: 'text-center'
        },
        {
            key: 'TotalMarksObt',
            header: 'Marks Obtained',
            width: '70px',
            className: 'text-center'
        },
        { key: 'Percentage', header: 'Percentage', width: '70px', className: 'text-center' },
        { key: 'Grade', header: 'Grade', width: '70px', className: 'text-center' }
    ]
    const editResultColumns = [
        { key: 'SubjectCode', header: 'Subject Code', width: '70px', className: 'text-center' },
        {
            key: 'SubjectName',
            header: 'Subject Name',
            width: '140px',
            className: 'text-center'
        },
        { key: 'SubjectTypeCode', header: 'Subject Type', width: '70px', className: 'text-center' },
        {
            key: 'MaxMarks',
            header: 'Max Marks',
            width: '50px',
            className: 'text-center'
        },
        {
            key: 'MinMark',
            header: 'Min Marks',
            width: '50px',
            className: 'text-center'
        },
        {
            key: 'ObtMarks',
            header: 'Marks Obtained',
            width: '50px',
            className: 'text-center'
        },
        { key: 'Attendance', header: 'Attendance', width: '140px', className: 'text-center' },
        { key: 'Result', header: 'Result', width: '70px', className: 'text-center' },
        { key: 'Remark', header: 'Remark', width: '70px', className: 'text-center' },
        { key: 'IsResultFresh', header: 'Result Fresh', width: '70px', className: 'text-center' },
        { key: 'ExaminationName', header: 'Examination Name', width: '100px', className: 'text-center' },
        { key: 'AttendanceSheet', header: 'Attendance Sheet', width: '50px', className: 'text-center' },
        { key: 'EvaluationSheet', header: 'Evaluation Sheet', width: '50px', className: 'text-center' },
        { key: 'View', header: 'View', width: '80px', className: 'text-center' },
    ]
    const { userInfo } = useAuth();

    const userTypeID = userInfo?.UserTypeID || 0;
    const userLoginID = userInfo?.UserLoginID || 0;
    const [candidateProfileID, setCandidateProfileID] = useState("");
    const [resultData, setResultData] = useState([]);
    const [showResultList, setShowresultList] = useState(false);
    const [showEditResult, setShowEditResult] = useState(false);
    const [editResultData, setEditResultData] = useState([]);
    const [selectedApplicationData, setSelectedApplicationData] = useState(null);
    const [photoData, setPhotoData] = useState(null);
    const [signData, setSignData] = useState(null);
    const [commonDocumentData, setCommonDocumentData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { color } = useContext(ThemeContext);
    // State to store uploaded document for each subject
    const [subjectDocuments, setSubjectDocuments] = useState({});
    const [ipAddress, setIpAddress] = useState("");

   

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
    };
    const handleSearchClick = async () => {
        if (!candidateProfileID) {
            //alert("Please enter a candidate profile ID.");
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter a candidate profile ID.',
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
            return;
        }
        fetchIP();


        const getCandiateId = await agent.get(`${getCandidateID}?ApplicationID=${candidateProfileID}`);

        if (getCandiateId?.data?.Status !== "Success") {
            //alert("Failed to fetch candidate ID. Please check the profile ID and try again.");
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch candidate ID. Please check the profile ID and try again.',
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
            return;
        }

        const candidateID = getCandiateId?.data?.Data;

        const response = await agent.get(`${CandidateResults}?candidateId=${candidateID}`);

        if (response?.data?.Status === "Success") {
            const candidateResults = response?.data?.Data;
            setShowresultList(true);
            setResultData(response?.data?.Data || []);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch candidate results. Please try again.',
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
        }
    };

    const tableData = resultData.map((result, index) => ({
        ...result,
        srNo: index + 1
    }));

    

    const editResultTableData = editResultData.map((result, index) => ({
        ...result,
        srNo: index + 1
    }));

    const renderActionCell = (item, column) => {
        if (column.key === 'Action') {
            return (
                <div className="flex gap-2 justify-center">
                    <Edit className="cursor-pointer text-blue-500" size={20} onClick={() => handleEdit(item)} />
                </div>
            );
        }
    }

    const attendanceOptions = [
        { value: '1', label: 'Present' },
        { value: '2', label: 'Absent' },
        { value: '3', label: 'Result Hold' }
    ];

    const handleStatusChange = (value, item) => {
        setEditResultData(prevData => prevData.map(data =>
            data.SubjectCode === item.SubjectCode ? { ...data, Attendance: value } : data
        ));
    }

    // Handle subject document upload
// Handle subject document upload
const handleSubjectDocumentUpload = (uploadData, rowId) => {
    setSubjectDocuments(prev => ({
        ...prev,
        [rowId]: uploadData
    }));
}

    const renderResultViewCell = (item, column) => {
        console.log('---------------', item);
        
if (column.key === 'View') {
    const docKey = item.ExamMarksDetilID ?? item.ID; // pick whichever is reliably unique
    return (
        item?.UploadedDocumentPath != null ? (
            <div className="flex gap-2 justify-center">
                <FileSpreadsheet className="cursor-pointer text-blue-500" size={20} onClick={() => handleDocumentView(item?.UploadedDocumentPath, 'UploadedDocument')} />
            </div>
        ) : (
            <div className="flex justify-center">
                <UploadPdf
                    key={`subject_doc_${docKey}`}
                    onFileChange={(uploadData) => handleSubjectDocumentUpload(uploadData, docKey)}
                    userTypeId={userTypeID}
                    userLoginID={userLoginID}
                    id={`subject_doc_${docKey}`}
                    buttonText="Upload"
                    label=""
                    allowedFileTypes="pdf"
                    maxFileSize="5 MB"
                    required={false}
                    showLabel={false}
                    linkName="View"
                    uniquefilepath={subjectDocuments[docKey]?.filePath || item?.DocumentURL || ""}
                />
            </div>
        )
    );
}
        if (column.key === 'AttendanceSheet') {
            return (
                <div className="flex gap-2 justify-center">
                    <FileSpreadsheet className="cursor-pointer text-blue-500" size={20} onClick={() => handleDocumentView(item?.AttendanceReportPath, 'AttendanceSheet')} />
                </div>
            );
        }
        if (column.key === 'EvaluationSheet') {
            return (
                <div className="flex gap-2 justify-center">
                    <FileSpreadsheet className="cursor-pointer text-blue-500" size={20} onClick={() => handleDocumentView(item?.EvaluationReportPath, 'EvaluationSheet')} />
                </div>
            );
        }
        if (column.key === 'ObtMarks') {
            return (
                <div className="flex gap-2 justify-center">
                    <FormComponent
                        value={item?.ObtMarks}
                        onChange={(value) => {
                            const numVal = parseFloat(value);
                            const max = parseFloat(item?.MaxMarks);
                            const min = parseFloat(item?.MinMark);

                            const capped = !isNaN(numVal) && !isNaN(max) && numVal > max ? max : value;

                            const newResult =
                                !isNaN(numVal) && !isNaN(min)
                                    ? numVal < min ? 'Fail' : 'Pass'
                                    : item?.Result;

                            setEditResultData(prevData =>
                                prevData.map(data =>
                                    data.SubjectCode === item.SubjectCode
                                        ? { ...data, ObtMarks: capped, Result: newResult }
                                        : data
                                )
                            );
                        }}
                    />
                </div>
            );
        }
        if (column.key === 'Attendance') {
            return (
                <div className="w-full min-w-[140px]">
                    <select
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={item?.Attendance || ''}
                        onChange={(e) => handleStatusChange(e.target.value, item)}
                    >
                        <option value="">Select</option>
                        {attendanceOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }
        if (column.key === 'Remark') {
            return (
                <div className="flex gap-2 justify-center">
                    <FormComponent
                        value={item?.Remark}
                        disabled
                    />
                </div>
            );
        }
    }



    const handleDocumentView = (item, documentType) => {
        if (!item || item === "") {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `No ${documentType === 'AttendanceSheet' ? 'attendance sheet' : 'evaluation sheet'} available`,
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
            return;
        }

        const popupWidth = 1000
        const popupHeight = 750

        const left = (window.screen.width - popupWidth) / 2
        const top = (window.screen.height - popupHeight) / 2

        window.open(
            `${item}`,
            'DocumentView',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )

    }

    const handleEdit = async (item) => {
        if (!item.ApplicationID || !item.CourseID || !item.ExaminationID) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Missing necessary information to fetch result details.',
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
            return;
        }

        setSelectedApplicationData(item);

        const response = await agent.get(`${CandidateResultsDetails}?applicationId=${item.ApplicationID}&courseId=${item.CourseID}&examinationId=${item.ExaminationID}`);
        if (response?.data?.Status === "Success") {
            const candidateResults = response?.data?.Data;
            setShowEditResult(true);
            setEditResultData(response?.data?.Data || []);
            if (candidateResults?.length > 0) {
                setCommonDocumentData({
                    filePath: candidateResults[0]?.CommonDocument || ""
                });
            }
const existingDocs = {};
response.data.Data.forEach(subject => {
    const docKey = subject.ExamMarksDetilID ?? subject.ID;
    if (subject?.DocumentURL) {
        existingDocs[docKey] = { filePath: subject.DocumentURL };
    }
});
setSubjectDocuments(existingDocs);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch candidate results. Please try again.',
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
        }
    }

    const handlePhotoUpload = (uploadData) => {
        setPhotoData(uploadData);
    }

    const handleSignUpload = (uploadData) => {
        setSignData(uploadData);
    }

    const handleCommonDocumentUpload = (uploadData) => {
        setCommonDocumentData(uploadData);
    }




    const handleSaveCorrection = async () => {
        if (!editResultData.length) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to Save Data.',
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
            return;
        }
        if (!commonDocumentData?.filePath) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Common Document is required. Please upload before saving.',
                confirmButtonColor: 'red',
                confirmButtonText: 'OK'
            });
            return;
        }

        setIsSaving(true);

        try {

            const rawDob = resultData[0]?.DateofBirth ?? '';
            let formattedDob = '';
            if (rawDob) {
                const dateObj = new Date(rawDob);
                formattedDob = !isNaN(dateObj)
                    ? dateObj.toLocaleDateString("en-GB")
                    : rawDob;
            }

            const payload = {
                userLoginID: userLoginID,
                ipAddress: ipAddress,
                applicationID: selectedApplicationData?.ApplicationID,
                candidateID: selectedApplicationData?.CandidateID,
                examinationID: selectedApplicationData?.ExaminationID,
                courseID: selectedApplicationData?.CourseID,
                applicationIDDisplay: selectedApplicationData?.ApplicationIDDisplay || '',
                photoFilePath: photoData?.filePath || resultData[0]?.CandidatePhoto || '',
                signFilePath: signData?.filePath || resultData[0]?.CandidateSign || '',
                commonDocument: commonDocumentData?.filePath || '',
                firstName: resultData[0]?.FirstName || '',
                middleName: resultData[0]?.MiddleName || '',
                lastName: resultData[0]?.LastName || '',
                dateOfBirth: formattedDob,
                // dateOfBirth: resultData[0]?.DateofBirth
                //     ? new Date(resultData[0].DateofBirth).toLocaleDateString("en-GB")
                //     : '',
                motherName: resultData[0]?.MotherName || '',
marks: editResultData.map(item => {
    const docKey = item.ExamMarksDetilID ?? item.ID;
    return {
        subjectCode: item.SubjectCode || '',
        subjectName: item.SubjectName || '',
        subjectTypeCode: item.SubjectTypeCode || '',
        maxMarks: item.MaxMarks || 0,
        minMarks: item.MinMark || 0,
        obtainedMarks: item.ObtMarks || 0,
        attendance: String(item.Attendance ?? '-1'),
        result: item.Result || '',
        remark: item.Remark || '',
        examMarksID: item.ExamMarksID || 0,
        examMarksDetilID: item.ExamMarksDetilID || 0,
        resultID: item.ID,
        documentURL: subjectDocuments[docKey]?.filePath || item?.DocumentURL || '',
        attendanceSheetURL: item.AttendanceReportPath || '',
        evaluationSheetURL: item.EvaluationReportPath || '',
        examinationName: item.ExaminationName || ''
    };
})
            };


            const response = await agent.post(`${SaveResultCorrection}`, payload);


            if (response?.data?.Status === "Success" || response?.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Result Correction',
                    text: 'Candidate Result Correction Saved Successfully.',
                    confirmButtonColor: '#28a745',
                    confirmButtonText: 'OK'
                })
                setShowEditResult(false);
                setPhotoData(null);
                setSignData(null);
                setCommonDocumentData(null);
                setSubjectDocuments({});
                await handleSearchClick();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to Save Result Correction. Please try again.',
                    confirmButtonColor: 'red',
                    confirmButtonText: 'Cancel'
                })
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occured while saving. Please try again.',
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
        } finally {
            setIsSaving(false);
        }
    }

    if (userTypeID !== 82) return null;
    return (
        <div>
            <fieldset className="mt-6 mb-6 rounded-xl border border-gray-300 bg-white shadow-sm p-5 ml-2 mr-2">
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                > <span className='text-base'>☰ </span>
                    <span>Result Correction</span>
                </legend>
                <div className="flex items-center gap-2 border-b pb-2">
                    <span>Search Candidate</span>
                </div>
                <div className="mt-4 flex items-center gap-4 w-full">
                    <FormComponent
                        label="Profile ID"
                        extraClass="w-1/3"
                        value={candidateProfileID}
                        onChange={(value) => setCandidateProfileID(value.toUpperCase())}
                        required
                        disabled={showResultList}
                    />
                </div>
                <div className="flex justify-center gap-3 m-2">
                    <Button variant='success' onClick={() => { handleSearchClick() }}>
                        Search
                    </Button>
                    <Button variant='danger' onClick={() => {
                        setCandidateProfileID("");
                        setShowresultList(false);
                        setShowEditResult(false);
                        setResultData([]);
                        setEditResultData([]);
                        setSubjectDocuments({});
                    }}>
                        Reset
                    </Button>
                </div>
            </fieldset>

            {showResultList ? (
                <fieldset className="mb-4 rounded-md border p-4 m-4">
                    <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
                        <span className='text-base'>☰</span>
                        <span>Result List</span>
                    </legend>
                    <div className="mb-4">
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-4 mb-2 mt-2'>
                            <div className='flex col-span-2'>
                                <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Profile No.</label>
                                <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{candidateProfileID}</b></span>
                            </div>
                            <div className='flex col-span-2'>
                                <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Candidate Name</label>
                                <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{resultData[0]?.CandidateName || ""}</b></span>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-4 mb-2 mt-2'>
                            <div className='flex col-span-2'>
                                <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Date of Birth</label>
                                <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{resultData[0]?.DateofBirth ? new Date(resultData[0].DateofBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : ""}</b></span>
                            </div>
                            <div className='flex col-span-2'>
                                <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Mother Name</label>
                                <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{resultData[0]?.MotherName || ""}</b></span>
                            </div>
                        </div>
                    </div>

                    <FilteredTableComponent
                        data={tableData ?? []}
                        columns={column}
                        searchable={true}
                        showExport={true}
                        showExcelTemplate={false}
                        showPDF={true}
                        sortable={true}
                        renderCell={renderActionCell}
                    />
                </fieldset>) : null}

            {showEditResult ? (
                <fieldset className="mb-4 rounded-md border p-4 m-4">
                    <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
                        <span className='text-base'>☰</span>
                        <span>Edit Result</span>
                    </legend>
                    <div className="mb-4">
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-4 mb-2 mt-2'>
                            <div className='flex col-span-2'>
                                <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Application ID</label>
                                <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{candidateProfileID}</b></span>
                            </div>
                            <div className='flex col-span-2'>
                                <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Name on Result</label>
                                <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{resultData[0]?.CandidateName || ""}</b></span>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-2'>
                            <div className='flex col-span-1'>
                                <FormComponent
                                    label="First Name :"
                                    extraClass="w-full"
                                    value={resultData[0]?.FirstName || ""}
                                    onChange={(value) => setResultData(prev => {
                                        const updated = [...prev];
                                        updated[0] = { ...updated[0], FirstName: value };
                                        return updated;
                                    })}
                                />
                            </div>
                            <div className='flex col-span-1'>
                                <FormComponent
                                    label="Middle Name :"
                                    extraClass="w-full"
                                    value={resultData[0]?.MiddleName || ""}
                                    onChange={(value) => setResultData(prev => {
                                        const updated = [...prev];
                                        updated[0] = { ...updated[0], MiddleName: value };
                                        return updated;
                                    })}
                                />
                            </div>
                            <div className='flex col-span-1'>
                                <FormComponent
                                    label="Last Name :"
                                    extraClass="w-full"
                                    value={resultData[0]?.LastName || ""}
                                    onChange={(value) => setResultData(prev => {
                                        const updated = [...prev];
                                        updated[0] = { ...updated[0], LastName: value };
                                        return updated;
                                    })}
                                />

                            </div>
                        </div>
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-2 mb-2 mt-2'>
                            <div className='flex col-span-1'>
                                <FormComponent
                                    label="Mother Name :"
                                    value={resultData[0]?.MotherName || ""}
                                    extraClass="w-2/3"
                                    onChange={(value) => setResultData(prev => {
                                        const updated = [...prev];
                                        updated[0] = { ...updated[0], MotherName: value };
                                        return updated;
                                    })}
                                />
                            </div>
                            <div className='flex col-span-1'>
                                <FormComponent
                                    label="Date of Birth :"
                                    type="date"
                                    value={resultData[0]?.DateofBirth.split('T')[0] || ""}
                                    extraClass="w-2/3"
                                    onChange={(value) => setResultData(prev => {
                                        const updated = [...prev];
                                        updated[0] = { ...updated[0], DateofBirth: value };
                                        return updated;
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-4 items-start">
                        {/* Upload Photo Section */}
                        <div className="col-span-1 flex flex-col items-center p-4 border rounded-lg bg-gray-50">
                            <UploadPhoto
                                photo={resultData[0]?.CandidatePhoto || ""}
                                onPhotoChange={handlePhotoUpload}
                                userTypeId={userTypeID}
                                userLoginID={userLoginID}
                                id="candidate_photo"
                                buttonText="Upload Photo"
                                allowedFileTypes="jpg, jpeg, png"
                                maxFileSize="2 MB"
                                uniquefilepath={resultData[0]?.CandidatePhoto || ""}
                            />
                        </div>

                        <div className="col-span-1 flex flex-col items-center p-4 border rounded-lg bg-gray-50">
                            <UploadPhoto
                                photo={resultData[0]?.CandidateSign || ""}
                                onPhotoChange={handleSignUpload}
                                userTypeId={userTypeID}
                                userLoginID={userLoginID}
                                id="candidate_sign"
                                buttonText="Upload Sign"
                                allowedFileTypes="jpg, jpeg, png"
                                maxFileSize="1 MB"
                                uniquefilepath={resultData[0]?.CandidateSign || ""}
                            />
                        </div>

                        <div className="col-span-1 flex flex-col items-center justify-center p-4 border rounded-lg bg-gray-50">
                            <label className="text-sm font-medium text-gray-700 mb-2">Common Document <span className="text-red-500">*</span></label>
                            <UploadPdf
                                onFileChange={handleCommonDocumentUpload}
                                userTypeId={userTypeID}
                                userLoginID={userLoginID}
                                id="common_document"
                                buttonText="Upload"
                                label=""
                                allowedFileTypes="pdf"
                                maxFileSize="5 MB"
                                required={true}
                                showLabel={false}
                                linkName="View Document"
                                uniquefilepath={
                                    commonDocumentData?.filePath ||
                                    editResultData?.[0]?.CommonDocument ||
                                    ""
                                }
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <div className="w-[1470px]">
                            <FilteredTableComponent
                                data={editResultTableData ?? []}
                                columns={editResultColumns}
                                searchable={true}
                                showExport={true}
                                showExcelTemplate={false}
                                showPDF={true}
                                sortable={true}
                                renderCell={renderResultViewCell}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-3 mt-4">
                        <Button
                            variant='success'
                            onClick={handleSaveCorrection}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save & Submit'}
                        </Button>
                        <Button
                            variant='danger'
                            onClick={() => {
                                setShowEditResult(false);
                                setPhotoData(null);
                                setSignData(null);
                                setCommonDocumentData(null);
                                setSubjectDocuments({});
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </fieldset>) : null}
        </div>
    );
}
export default ResultCorrection;