import { use, useContext, useEffect, useState } from "react";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import agent from "../../../lib/api/agent";
import { ApproveCandidateResult, GetCandidateResultsDetailsForApprove, GetResultCorrectionsForApproval, RejectCandidateResult } from "../../../Endpoints_All/Examination/VerificationCertificate";
import Button from "../../base/Button";
import FormComponent from "../../formcomponent/FormComponent";
import { FileSpreadsheet } from "lucide-react";
import { getDeviceIP } from "../../../utils/CommonHelper";
import Swal from "sweetalert2";
import { useAuth } from "../../../Hooks/AuthContext";
import { ThemeContext } from "../../Context/ThemeContext";

const ResultCorrectionForApproval = () => {
    const column = [
        { key: 'Action', header: 'Action', width: '70px', className: 'text-center' },
        {
            key: 'ApplicationIDDisplay',
            header: 'Application ID',
            width: '120px',
            className: 'text-center'
        },
        { key: 'CandidateName', header: 'Candidate Name', width: '280px', className: 'text-center' },
        { key: 'ExaminationName', header: 'Name of Examination', width: '140px', className: 'text-center' },
        {
            key: 'CourseNameCode',
            header: 'Course Name Code',
            width: '280px',
            className: 'text-center'
        },
        {
            key: 'InstituteNameCode',
            header: 'Institute Name Code',
            width: '280px',
            className: 'text-center'
        }
    ];

    const editedResultColumns = [
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

    const attendanceOptions = [
        { value: '1', label: 'Present' },
        { value: '2', label: 'Absent' },
        { value: '3', label: 'Result Hold' }
    ];

    const [resultData, setResultData] = useState([]);
    const [showResultDetails, setShowResultDetails] = useState(false);
    const [candidateDetails, setCandidateDetails] = useState([]);
    const [overallResult, setOverallResult] = useState([]);
    const [rejectRemark, setRejectRemark] = useState('');

    const [ipAddress, setIpAddress] = useState("");
    const { color } = useContext(ThemeContext); 

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
    };

    const { userInfo } = useAuth();

    const UserLoginID = userInfo?.UserLoginID || 0;
    const userTypeID = userInfo?.UserTypeID || 0;

    useEffect(() => {
        if (userTypeID !== 81) {
            return;
        }
        fetchResultCorrectionsForApproval();
        //handleRejectCandidateResult();

    }, []);

    const fetchResultCorrectionsForApproval = async () => {
        try {
            const response = await agent.get(GetResultCorrectionsForApproval);

            if (response.data && response?.data?.Data?.length > 0) {
                setCandidateDetails(response?.data?.Data || []);
            } else {
                setCandidateDetails([]);

            }

        } catch (error) {
        }
    }

    const tableData = candidateDetails.map((result, index) => ({
        ...result,
        srNo: index + 1
    }));


    const editedResultTableData = resultData.map((result, index) => ({
        ...result,
        srNo: index + 1
    }));
    const renderActionCell = (item, column) => {
        if (column.key === 'Action') {
            return (
                <div className="flex gap-2 justify-center">
                    <button
                        className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium text-sm text-center dark:text-white rounded-sm px-1 py-0.5 transition-all shadow-sm"
                        size='xs'
                        onClick={() => handleViewResult(item)}
                    >View Result</button>
                    {/* <Button
                        variant='success'
                        size='xs'
                        onClick={() => handleViewResult(item)}
                    >View Result</Button> */}
                </div>
            );
        }
    }

    const renderResultViewCell = (item, column) => {

        if (column.key === 'AttendanceSheet') {
            return (
                <div className="flex gap-2 justify-center">
                    <FileSpreadsheet className="cursor-pointer text-blue-500" size={20} onClick={() => handleDocumentView(item?.AttendanceReportPath, 'AttendanceSheet')} />
                </div>
            );
        }

        if (column.key === 'View' && item?.UploadedDocumentPath != null) {
            return (
                <div className="flex gap-2 justify-center">
                    <FileSpreadsheet className="cursor-pointer text-blue-500" size={20} onClick={() => handleDocumentView(item?.UploadedDocumentPath, 'UploadedDocument')} />
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

        if (column.key === 'Attendance') {
            // <div className="w-full min-w-[140px]">
            //     <select
            //         className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            //         value={item?.Attendance || ''}
            //         disabled
            //     >
            //         <option value="">{item?.Attendance || ''}</option>
            //         {attendanceOptions.map(option => (
            //             <option key={option.value} value={option.value}>
            //                 {option.label}
            //             </option>
            //         ))}
            //     </select>
            // </div>
            const label = attendanceOptions.find(opt => opt.value === String(item?.Attendance))?.label || '';
            return (
                <div className="w-full min-w-[140px] px-2 py-1 border border-gray-300 rounded-md bg-gray-100 text-sm text-center">
                    {label}
                </div>
            );
        }
    }

    const handleViewResult = async (item) => {
        if (!candidateDetails || candidateDetails.length === 0 || !item) {
            alert('No result data available to view.');
            return;
        }

        fetchIP();
        const response = await agent.get(`${GetCandidateResultsDetailsForApprove}?applicationId=${item.ApplicationID}&examinationId=${item.ExaminationID}`);
        if (response.data && response?.data?.Data) {
            setShowResultDetails(true);



            setResultData(response?.data?.Data?.Table || []);
            setOverallResult(response?.data?.Data?.Table2 || []);
        } else {
            setResultData([]);
            setShowResultDetails(false);
            setOverallResult([]);
            alert('No result details found for the selected candidate.');
        }

    }
    const handleDocumentView = (item, documentType) => {
        if (!item || item === "") {
            alert(`No ${documentType === 'AttendanceSheet' ? 'attendance sheet' : 'evaluation sheet'} available`);
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
    const handleApproveCandidateResult = async (applicationId, examinationId) => {
        if (!candidateDetails || !resultData || !overallResult) {
            alert('Can not Approve.');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Missing Necessary Information.',
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
            return;
        }
        const payload = {
            applicationID: applicationId || 0,
            examinationID: examinationId || 0,
            userLoginID: UserLoginID || '',
            ipAddress: ipAddress || ''
        }

        const response = await agent.post(ApproveCandidateResult, payload);
        if (response?.data?.Status === 'Success' && response?.data?.Data === 'Data has not been saved. Please try again.') {


            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to Approved Candidate Result.',
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Result Approved',
                text: 'Candidate Result Approved Successfully.',
                confirmButtonColor: '#28a745',
                confirmButtonText: 'OK'
            }).then(()=>{
                fetchResultCorrectionsForApproval();
                setShowResultDetails(false);
            })
        }

    }
    const handleRejectCandidateResult = async (applicationId, examinationId) => {
        if (!candidateDetails || !resultData || !overallResult) {
            alert('Can not Approve.');
            return;
        }
        const payload = {
            applicationID: applicationId || 0,
            examinationID: examinationId || 0,
            userLoginID: UserLoginID || '',
            ipAddress: ipAddress || '',
            rejectRemark: rejectRemark || ''
        }
        const response = await agent.post(RejectCandidateResult, payload);

        if (response?.data?.Status === 'Success' && response?.data?.Data === 'Data has not been saved. Please try again.') {


            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to Reject Candidate Result.',
                confirmButtonColor: 'red',
                confirmButtonText: 'Cancel'
            })
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Result Rejected',
                text: 'Candidate Result Rejected Successfully.',
                confirmButtonColor: '#28a745',
                confirmButtonText: 'OK'
            }).then(()=>{
                fetchResultCorrectionsForApproval();
                setShowResultDetails(false);
            })
        }

    }

    if (userTypeID !== 81) return null;
    return (
        <div>
            {!showResultDetails && (
            <fieldset className="mb-4 rounded-md border p-4 m-4">
                <legend className={`flex ${color} items-center gap-2 rounded-md border border-gray-400 px-4 py-2 text-lg font-semibold text-white`}>
                    <span className='text-base'>☰</span>
                    <span>Result Correction - Result List</span>
                </legend>
                <FilteredTableComponent
                    data={tableData ?? []}
                    columns={column ?? []}
                    searchable={true}
                    showExport={true}
                    showExcelTemplate={false}
                    showPDF={true}
                    sortable={true}
                    renderCell={renderActionCell}
                />
            </fieldset>
            )}
            {showResultDetails ? (
                <fieldset className="mb-4 rounded-md border p-4 m-4">
                    <legend className={`flex ${color} items-center gap-2 rounded-md border border-gray-400 px-4 py-2 text-lg font-semibold text-white`}>
                        <span className='text-base'>☰</span>
                        <span>Edit Result</span>
                    </legend>
                    <div className="mb-4">
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-4 mb-2 mt-2'>
                            <div className='flex col-span-2'>
                                <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Application ID</label>
                                <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{resultData[0]?.ApplicationIDDisplay || ""}</b></span>
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
                                    disabled
                                />
                            </div>
                            <div className='flex col-span-1'>
                                <FormComponent
                                    label="Middle Name :"
                                    extraClass="w-full"
                                    value={resultData[0]?.MiddleName || ""}
                                    disabled
                                />
                            </div>
                            <div className='flex col-span-1'>
                                <FormComponent
                                    label="Last Name :"
                                    extraClass="w-full"
                                    value={resultData[0]?.LastName || ""}
                                    disabled
                                />

                            </div>
                        </div>
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-2 mb-2 mt-2'>
                            <div className='flex col-span-1'>
                                <FormComponent
                                    label="Mother Name :"
                                    value={resultData[0]?.MotherName || ""}
                                    extraClass="w-2/3"
                                    disabled
                                />
                            </div>
                            <div className='flex col-span-1'>
                                <FormComponent
                                    label="Date of Birth :"
                                    type="date"
                                    value={resultData[0]?.DateofBirth.split('T')[0] || ""}
                                    extraClass="w-2/3"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-4 items-start">
                        <div className="col-span-1 flex flex-col items-center p-4 border rounded-lg">

                            {/* Candidate Photo */}
                            <div className="w-40 h-48 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
                                <img
                                    src={resultData[0]?.CandidatePhoto || ""}
                                    alt="Candidate"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="w-40 h-16 mt-3 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
                                <img
                                    src={resultData[0]?.CandidateSign || ""}
                                    alt="Candidate Sign"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                        </div>
                        <div className="col-span-1 flex flex-col items-center justify-center p-4 border rounded-lg bg-gray-50">
                            <label className="text-sm font-medium text-gray-700 mb-2">Common Document <span className="text-red-500">*</span></label>
                            {resultData[0]?.CommonDocument !== null ? (

                                <FileSpreadsheet className="cursor-pointer text-blue-500" size={30} onClick={() => { handleDocumentView(resultData[0]?.CommonDocument, 'Common Document') }} />
                            ) : <span>Not Uploaded Common Document</span>}

                        </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <div className="w-[1470px]">
                            <FilteredTableComponent
                                data={editedResultTableData ?? []}
                                columns={editedResultColumns}
                                searchable={true}
                                showExport={true}
                                showExcelTemplate={false}
                                showPDF={true}
                                sortable={true}
                                renderCell={renderResultViewCell}
                            />
                        </div>
                    </div>


                    <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-2'>
                        <div className='flex col-span-1'>
                            <FormComponent
                                label="Total Marks :"
                                extraClass="w-full"
                                value={overallResult[0]?.TotalMaxMarks || ""}
                                disabled
                            />
                        </div>
                        <div className='flex col-span-1'>
                            <FormComponent
                                label="Total Min Marks :"
                                extraClass="w-full"
                                value={overallResult[0]?.TotalMarksMin || ""}
                                disabled
                            />
                        </div>
                        <div className='flex col-span-1'>
                            <FormComponent
                                label="Total Obtained Marks :"
                                extraClass="w-full"
                                value={overallResult[0]?.FinalTotalMarksObtained || ""}
                                disabled
                            />

                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-2'>
                        <div className='flex col-span-1'>
                            <FormComponent
                                label="Overall Result :"
                                extraClass="w-full"
                                value={overallResult[0]?.FinalResult || ""}
                                disabled
                            />
                        </div>
                        <div className='flex col-span-1'>
                            <FormComponent
                                label="Percentage :"
                                extraClass="w-full"
                                value={overallResult[0]?.FinalPercentage || ""}
                                disabled
                            />
                        </div>
                        <div className='flex col-span-1'>
                            <FormComponent
                                label="Grade :"
                                extraClass="w-full"
                                value={overallResult[0]?.FinalGrade || ""}
                                disabled
                            />

                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-2'>
                        <div className='flex col-span-1'>
                            <FormComponent
                                label="Condem Marks :"
                                extraClass="w-full"
                                value={overallResult[0]?.CondemMarks || ""}
                                disabled
                            />
                        </div>
                        <div className='flex col-span-1'>
                            <FormComponent
                                label="Condem Symbol :"
                                extraClass="w-full"
                                value={overallResult[0]?.CondemSymbol || ""}
                                disabled
                            />
                        </div>
                        <div className='flex col-span-1'>

                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-8'>
                        <div className='flex col-span-1'>
                            <FormComponent
                                label="Reject Remark :"
                                extraClass="w-full"
                                value={rejectRemark || ''}
                                onChange={(value) => setRejectRemark(value)}
                            />
                        </div>
                        <div className='flex col-span-2'>

                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant='success'
                            onClick={() => { handleApproveCandidateResult(resultData[0]?.ApplicationID, resultData[0]?.ExaminationID) }}

                        >
                            Approve
                        </Button>
                        <Button
                            variant='danger'
                            onClick={() => { handleRejectCandidateResult(resultData[0]?.ApplicationID, resultData[0]?.ExaminationID) }}

                        >
                            Reject
                        </Button>
                        <Button
                            variant='warning'

                            onClick={() => setShowResultDetails(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </fieldset>) : null}
        </div>
    )
}
export default ResultCorrectionForApproval;