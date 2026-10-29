import { useNavigate, useSearchParams } from "react-router-dom";
import { candidateforattendance } from "../../../Endpoints_All/Examination/Exam";
import { useEffect, useState } from "react";
import agent from "../../../lib/api/agent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import Button from "../../base/Button";

const AttendanceReportDetails = () => {

    const column = [
        {
            key: 'SrNo',
            header: 'Sr. No.',
            width: '50px',
            className: 'text-center'
        },
        { key: 'ApplicationID', header: 'Application ID', width: '50px', className: 'text-center', },
        {
            key: 'CandidateName',
            header: 'Candidate Name',
            width: '200px',
            className: 'text-center'
        },
        {
            key: 'CandidateStatus',
            header: 'Candidate Status',
            width: '150px',
            className: 'text-center'
        },
        {
            key: 'BoardFee',
            header: 'Board Fee',
            width: '100px',
            className: 'text-center'
        },
        {
            key: 'AssessmentFee',
            header: 'Assessment Fee',
            width: '100px',
            className: 'text-center'
        },
        {
            key: 'ExamFee',
            header: 'Exam Fee',
            width: '100px',
            className: 'text-center'
        },
        { key: 'TransactionDetail', header: 'Transaction Detail', width: '200px' },
    ]

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const batchID = searchParams.get("BatchID");
    const subjectType = searchParams.get("SubjectType");
    const [summary, setSummary] = useState(null);
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await agent.get(`${candidateforattendance}?batchId=${batchID}&subjectType=${subjectType}`);
            const data = response?.data?.Data;
            if (!data) {
                return;
            }
            setSummary(data?.Table?.[0] ?? null);
            setCandidates(data?.Table1 ?? []);

        } catch (error) {
            setSummary(null);
            setCandidates([]);
        }
    };
    const tableData = candidates.map((candidate, index) => ({
        ...candidate,
        SrNo: index + 1,

    }));

    // const handleAttendanceSheetClick = (batchID, subjectType) => {
    //     if(!batchID || !subjectType) {
    //         console.error("BatchID or SubjectType is missing");
    //         return;
    //     }
    //     navigate(`/Exam/AttendanceReportDetails?BatchID=${batchID}&SubjectType=${subjectType}`);
    // }

    const handleAttendanceSheetClick = () => {

        const popupWidth = 1000;
        const popupHeight = 750;

        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const popup = window.open(
            `${window.location.origin}/React/AttendanceReportDetail?P1=${batchID}&P2=${subjectType}`,
            "AttendanceReportDetail",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!popup) {
            Swal.fire("Popup Blocked", "Please allow popups for this website.", "warning");
        }
    };
    const handleSeatingArrangementClick = () => {

        const popupWidth = 1000;
        const popupHeight = 750;

        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const popup = window.open(
            `${window.location.origin}/React/SeatingArrangementDetails?P1=${batchID}&P2=${subjectType}`,
            "SeatingArrangement",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!popup) {
            Swal.fire("Popup Blocked", "Please allow popups for this website.", "warning");
        }
    };

    return (
        <fieldset className="mb-4 rounded-md border p-4 m-4">
            <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
                <span className='text-base'>☰</span>
                <span>Attendance Report / Seating Arrangement</span>
            </legend>
            <div>
                {/* Row 1 */}
                <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-2'>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Course Code</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.CourseCode}</b></span>
                    </div>
                    <div className='flex col-span-2'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Course Name</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.CourseName}</b></span>
                    </div>
                </div>

                {/* Row 2 */}
                <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-2'>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Batch ID</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.BatchID}</b></span>
                    </div>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Batch Status</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.BatchStatusName}</b></span>
                    </div>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Exam Type</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.ExamType}</b></span>
                    </div>
                </div>

                {/* Row 3 */}
                <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-2'>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Batch Start Date</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.BatchStartDate}</b></span>
                    </div>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Batch End Date</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.BatchEndDate}</b></span>
                    </div>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Admission Last Date</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.AdmissionLastDate}</b></span>
                    </div>
                </div>

                {/* Row 4 */}
                <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-2'>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Admitted</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.Admitted}</b></span>
                    </div>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Approved</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.Approved}</b></span>
                    </div>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Rejected</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.Rejected}</b></span>
                    </div>
                </div>

                {/* Row 5 */}
                <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-2'>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Hall Ticket Issuance Date</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.HallTicketIssuanceDate}</b></span>
                    </div>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Exam Start Date</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.ExamStartDate}</b></span>
                    </div>
                    <div className='flex col-span-1'>
                        <label className='w-44 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Practical Exam Center Code</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.PracticalCenterCode}</b></span>
                    </div>
                </div>

                {/* Row 6 */}
                <div className='grid grid-cols-1 gap-2 md:grid-cols-3 mb-2 mt-2'>
                    <div className='flex col-span-1'>
                        <label className='w-50 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Practical Exam Center</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.PracticalCenter}</b></span>
                    </div>
                    <div className='flex col-span-1'>
                        <label className='w-50 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Theory Exam Center Code</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.TheoryCenterCode}</b></span>
                    </div>
                    <div className='flex col-span-1'>
                        <label className='w-50 rounded-l-lg bg-blue-200 px-3 py-2 text-right'>Theory Exam Center</label>
                        <span className='flex-grow rounded-r-lg border px-3 py-2'><b>{summary?.TheoryCenter}</b></span>
                    </div>
                </div>
            </div>
            <div className='flex justify-center gap-3 mt-6 mb-4'>
                <Button variant='danger' onClick={() => handleAttendanceSheetClick(batchID, subjectType)}>
                    Attendance Sheet
                </Button>
                <Button variant='primary' onClick={() => handleSeatingArrangementClick(batchID, subjectType)}>
                    {/* <Button variant='primary' onClick={() => navigate('/institute/dashboard')}> */}
                    Seating Arrangement
                </Button>
            </div>
            <hr className="my-4 border-gray-300" />
            <FilteredTableComponent
                className='pl-6 pr-6'
                data={tableData ?? []}
                columns={column}
                searchable={true}
                showExport={true}
                showExcelTemplate={false}
                showPDF={true}
                sortable={true}
            // renderCell={(item, column) => {
            //     if (column.key === 'BatchID') {

            //         return (
            //             <div className="flex gap-2">

            //                 <span
            //                     className="text-white font-semibold cursor-pointer bg-sky-500 hover:bg-sky-600 p-2 m-1 rounded"
            //                     onClick={() => handleClickBatchID(item?.BatchID, item?.SubjectTypeExamName)}
            //                 >
            //                     {item?.BatchID}
            //                 </span>
            //             </div>
            //         );
            //     }
            // }}
            />
        </fieldset>
    );
};

export default AttendanceReportDetails;