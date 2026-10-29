import React, { useState, useContext } from "react";
import { FileText } from "lucide-react";
import { useLoading } from "../../../Hooks/useLoading";
import agent from "../../../lib/api/agent";
import { ApprovedPendingCandidateList } from "../../../Endpoints_All/Administration/admin";
import AdmissionReportSearchFilter from "./AdmissionReportSearchFilter";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Context/ThemeContext";
import { useAuth } from "../../../Hooks/AuthContext";
import { maskString } from "../../../utils/CommonHelper";

const AdmissionCancelledCandidateListPage = () => {
    const { startLoading, stopLoading } = useLoading();
    const [candidateList, setCandidateList] = useState([]);
    const [searchError, setSearchError] = useState("");
    const [loadingResults, setLoadingResults] = useState(false);
    const [summary, setSummary] = useState({ intake: 0, cancelled: 0, vacant: 0 });
    const [noDataMessage, setNoDataMessage] = useState("");
    const { color } = useContext(ThemeContext);
    const [courseDetails, setCourseDetails] = useState({
        courseName: "",
        instituteName: "",
        districtName: "",
        admissionSessionYear: ""
    });
    const [showResults, setShowResults] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [showAadhaar, setShowAadhaar] = useState(false);
    const { userInfo } = useAuth();

    const fetchUserMappingData = async () => {
        try {
            let instituteId = 0;
            let regionId = 0;

            if (userInfo?.UserTypeID === 61) {
                const res = await agent.get(
                    `/Base/GetInstituteIDByInstituteCode?InstituteCode=${userInfo.UserLoginID}`
                );

                instituteId = res.data?.Data || 0;
            }

            if (userInfo?.UserTypeID === 13) {
                const res = await agent.get(
                    `/Base/GetRegionInstitute/${userInfo.UserLoginID}`
                );

                regionId = res.data?.Data || 0;
            }

            if (userInfo?.UserTypeID === 14) {
                const res = await agent.get(
                    `/Base/GetDistrictIDByDistrictUser/${userInfo.UserLoginID}`
                );

                regionId = res.data?.Data || 0;
            }

            return { instituteId, regionId };
        } catch (error) {
            console.error("Error fetching user mapping data:", error);

            return {
                instituteId: 0,
                regionId: 0
            };
        }
    };

    const handleCustomSearch = async ({
        courseId,
        courseName,
        admissionYearId,
        instituteId,
        districtId,
        districtName,
        batchId,
        batchName,
        batchType,
        admissionSessionName,
        setSummary: setFilterSummary,
        setErrorMessage
    }) => {
        setHasSearched(true);
        startLoading();
        setLoadingResults(true);
        setSearchError("");
        setCandidateList([]);
        setShowResults(false);
        setNoDataMessage("");
        setCourseDetails({
            courseName: "",
            instituteName: "",
            districtName: "",
            admissionSessionYear: ""
        });

        try {
            let collegeId = Number(instituteId) || 0;
            let regionId = 0;

            const mapping = await fetchUserMappingData();

            if (userInfo?.UserTypeID === 61) {
                collegeId = Number(mapping.instituteId) || 0;
            }

            const typeId = Number(userInfo?.UserTypeID);

            if (
                (typeId === 10 || typeId === 13 || typeId === 14) &&
                (!instituteId || Number(instituteId) === 1)
            ) {
                regionId = Number(districtId) || 0;
            }

            const searchParameters = {
                CourseID: Number(courseId) || 1,
                CollegeID: Number(collegeId) || 1,
                AdmissionYearID: Number(admissionYearId),
                BatchID: Number(batchId) || 0,
                Flag: "C",
                RegionID: Number(regionId) || 0
            };

            const response = await agent.get(ApprovedPendingCandidateList, {
                params: searchParameters
            });

            const responseData = response.data?.Data || response.data;

            if (!responseData) {
                setErrorMessage("No data received from server");
                return;
            }

            let candidates = [];

            if (responseData.Table && Array.isArray(responseData.Table)) {
                candidates = responseData.Table;
            } else if (responseData.Table0 && Array.isArray(responseData.Table0)) {
                candidates = responseData.Table0;
            } else if (
                responseData.Candidates &&
                Array.isArray(responseData.Candidates)
            ) {
                candidates = responseData.Candidates;
            }

            const transformedCandidates = candidates.map((candidate, index) => ({
                id: candidate.CandidateID || candidate.ApplicationID || index,
                serialNumber: index + 1,
                ApplicationIDDisplay: candidate.ApplicationIDDisplay || "N/A",
                CandidateName: candidate.CandidateName || "N/A",
                Gender: candidate.Gender || "N/A",
                CategoryCode: candidate.CategoryCode || "N/A",
                IsBelongToPWD: candidate.IsBelongToPWD || "N/A",
                MobileNo: candidate.MobileNo || "N/A",
                CancelledDateTime:
                    candidate.CancelledDateTime ||
                    candidate.ReportedDateTime ||
                    "N/A",
                UnitNo: candidate.UnitNo || "N/A",
                ShiftNo: candidate.ShiftNo || "N/A",
                YearDisplayName: candidate.YearDisplayName || "N/A",
                BatchName: candidate.BatchName || "N/A",
                AadhaarNo: candidate.AadhaarNo || "N/A",
                Duration: candidate.Duration || "N/A",
                CandidateID: candidate.CandidateID || 0,
                ApplicationID: candidate.ApplicationID || 0,
                CollegeID: candidate.CollegeID || 0,
                CourseID: candidate.CourseID || 0,
                ResponseUrl: candidate.ResponseUrl || "",
                CancellationReason: candidate.CancellationReason || "N/A",
                ExaminationName: candidate.ExaminationName || "N/A",
                ISForSTT: candidate.ISForSTT || "N/A",
                ExamType: candidate.ExamType || "N/A",
                BatchID: candidate.BatchID || "N/A"
            }));

            let filteredCandidates = transformedCandidates;

            if (Number(batchId) > 0) {
                filteredCandidates = transformedCandidates.filter(
                    item => String(item.BatchID) === String(batchId)
                );
            } else if (batchType) {
                filteredCandidates = transformedCandidates.filter(
                    item =>
                        item.BatchName?.trim().toLowerCase() ===
                        batchType.trim().toLowerCase()
                );
            }

            setCandidateList(filteredCandidates);

            let statistics = null;

            if (
                responseData.Table1 &&
                Array.isArray(responseData.Table1) &&
                responseData.Table1.length > 0
            ) {
                statistics = responseData.Table1[0];

                const newSummary = {
                    intake: parseInt(statistics.Intake) || 0,
                    cancelled:
                        parseInt(statistics.Cancelled) ||
                        parseInt(statistics.Admitted) ||
                        0,
                    vacant: parseInt(statistics.Vacant) || 0
                };

                setCourseDetails({
                    courseName:
                        courseId && Number(courseId) > 0
                            ? statistics.CourseName || courseName || ""
                            : "",
                    instituteName:
                        instituteId && Number(instituteId) > 0
                            ? statistics.InstituteName || ""
                            : "",
                    districtName:
                        districtId && Number(districtId) > 0
                            ? districtName || ""
                            : "",
                    admissionSessionYear:
                        statistics.AdmissionSessionYear ||
                        admissionSessionName ||
                        ""
                });

                setSummary(newSummary);

                if (setFilterSummary) {
                    setFilterSummary(newSummary);
                }
            }

            if (filteredCandidates.length > 0) {
                setShowResults(true);
            } else {
                setNoDataMessage("No Candidate Found.");
                setShowResults(false);
                return;
            }


        } catch (error) {
            console.error("API Error:", error);

            const errorMsg =
                error.response?.data?.title ||
                "Failed to retrieve cancelled candidate information";

            setSearchError(errorMsg);

            if (setErrorMessage) {
                setErrorMessage(errorMsg);
            }

            setShowResults(false);
        } finally {
            stopLoading();
            setLoadingResults(false);
        }
    };

    const handleReset = () => {
        setCandidateList([]);
        setSearchError("");
        setLoadingResults(false);
        setSummary({
            intake: 0,
            cancelled: 0,
            vacant: 0,
        });

        setNoDataMessage("");

        setCourseDetails({
            courseName: "",
            instituteName: "",
            districtName: "",
            admissionSessionYear: "",
        });

        setShowResults(false);
        setHasSearched(false);
    };

    //function for formatting aadhar no in table 
    const formatAadhar = (aadharNumber) => {
        if (!aadharNumber || aadharNumber === "N/A") return "N/A";
        const aadhar = aadharNumber.toString().replace(/\s/g, '');
        if (aadhar.length === 12) {
            return `${aadhar.substring(0, 4)} ${aadhar.substring(4, 8)} ${aadhar.substring(8, 12)}`;
        }
        return aadharNumber;
    };

    const formatMobile = (mobileNumber) => {
        if (!mobileNumber || mobileNumber === "N/A") return "N/A";
        const mobile = mobileNumber.toString().replace(/\s/g, '');
        if (mobile.length === 10) {
            return `${mobile.substring(0, 5)} ${mobile.substring(5)}`;
        }
        return mobileNumber;
    };

    const renderCell = (item, column, rowIndex) => {
        if (column.key === 'serialNumber') {
            return rowIndex + 1;
        }

        if (column.key === 'IsBelongToPWD') {
            return item.IsBelongToPWD || "N/A";
        }

        if (column.key === 'MobileNo') return formatMobile(item.MobileNo);
        if (column.key === "AadhaarNo") {
            if (!item.AadhaarNo || item.AadhaarNo === "N/A") return "N/A";

            return showAadhaar
                ? formatAadhar(item.AadhaarNo)
                : maskString(item.AadhaarNo);
        }

        if (column.key === 'ApplicationIDDisplay') {
            return item.ApplicationIDDisplay || "N/A";
        }

        if (column.key === 'CancellationReason') {
            return item.CancellationReason || "N/A";
        }

        return item[column.key] || "N/A";
    };

    // Optimized table columns with reduced widths to fit all columns
    const tableColumns = [
        { key: 'serialNumber', header: 'Sr. No.', width: '45px', className: 'text-center', headerClassName: 'text-center', sortable: false, searchable: false },
        { key: 'ApplicationIDDisplay', header: 'Application No.', width: '95px', className: 'text-center', headerClassName: 'text-center', searchable: true },
        { key: 'CandidateName', header: "Candidate's Name", width: '150px', className: 'text-center', headerClassName: 'text-center', searchable: true },
        { key: 'Gender', header: 'Gender', width: '60px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'CategoryCode', header: 'Caste Category', width: '100px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'IsBelongToPWD', header: 'PWD', width: '50px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        {
            key: 'MobileNo', header: 'Mobile No.', width: '120px', className: 'text-center whitespace-nowrap', headerClassName: 'text-center whitespace-nowrap', searchable: true
        }, { key: 'CancelledDateTime', header: 'Cancelled Date', width: '100px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'UnitNo', header: 'Unit', width: '45px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'ShiftNo', header: 'Shift', width: '45px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'YearDisplayName', header: 'Adm. Year', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'BatchName', header: 'Batch', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        {
            key: 'AadhaarNo', header: 'Aadhar No.', width: '150px', className: 'text-center whitespace-nowrap', headerClassName: 'text-center whitespace-nowrap', searchable: true
        }, { key: 'Duration', header: 'Duration', width: '70px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        // { key: 'CancellationReason', header: 'Cancellation Reason', width: '150px', className: 'text-center', headerClassName: 'text-center', searchable: true },
        { key: 'ExaminationName', header: 'Examination Name', width: '150px', className: 'text-center', headerClassName: 'text-center', searchable: true },
        { key: 'ISForSTT', header: 'Short Term Training Courses', width: '70px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'ExamType', header: 'Exam Type', width: '100px', className: 'text-center', headerClassName: 'text-center', searchable: true },
        { key: 'BatchID', header: 'Batch ID', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: true },
    ];

    const filterableColumns = [
        'Gender', 'CategoryCode', 'IsBelongToPWD', 'AadhaarNo', 'CandidateName', 'YearDisplayName', 'BatchName', 'CancellationReason'
    ];

    // Columns that should have search enabled
    const searchableColumns = [
        'ApplicationIDDisplay',
        'CandidateName',
        'MobileNo',
        'AadhaarNo',
        'CancellationReason'
    ];

    const prepareExportData = (data) => {
        return data.map(item => ({
            'Sr. No.': item.serialNumber,
            'Application No.': item.ApplicationIDDisplay,
            "Candidate Name": item.CandidateName,
            'Gender': item.Gender,
            'Category': item.CategoryCode,
            'PWD': item.IsBelongToPWD === "YES" ? "Yes" : item.IsBelongToPWD === "NO" ? "No" : item.IsBelongToPWD,
            'Mobile': formatMobile(item.MobileNo),
            'Cancelled Date': item.CancelledDateTime,
            'Unit': item.UnitNo,
            'Shift': item.ShiftNo,
            'Adm. Year': item.YearDisplayName,
            'Batch': item.BatchName,
            'Aadhar No.': showAadhaar
                ? formatAadhar(item.AadhaarNo)
                : maskString(item.AadhaarNo),
            'Duration': item.Duration,
            'Cancellation Reason': item.CancellationReason,
            'Examination Name': item.ExaminationName,
            'Short Term Training Courses': item.ISForSTT,
            'Exam Type': item.ExamType,
            'Batch ID': item.BatchID
        }));
    };

    // Custom PDF generation function
    const handlePDFExport = () => {
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                const primaryColor = [220, 38, 38]; // Red color for cancelled
                const white = [255, 255, 255];
                const black = [44, 62, 80];
                const lightGray = [249, 250, 251];


                doc.setFontSize(14);
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.setFont("helvetica", "bold");
                doc.text('Cancelled Candidates Report', 10, 15);


                doc.setFontSize(9);
                doc.setTextColor(black[0], black[1], black[2]);
                doc.setFont("helvetica", "normal");

                let subtitle = '';
                if (courseDetails.courseName) subtitle += courseDetails.courseName;
                if (courseDetails.instituteName) subtitle += subtitle ? ' - ' + courseDetails.instituteName : courseDetails.instituteName;
                if (courseDetails.admissionSessionYear) subtitle += subtitle ? ' (' + courseDetails.admissionSessionYear + ')' : courseDetails.admissionSessionYear;

                doc.text(subtitle || 'Candidate Report', 10, 22);

                doc.setFontSize(8);
                doc.setTextColor(black[0], black[1], black[2]);
                doc.text(`Intake: ${summary.intake}`, doc.internal.pageSize.width - 60, 15);
                doc.text(`Cancelled: ${summary.cancelled}`, doc.internal.pageSize.width - 60, 22);
                doc.text(`Vacant: ${summary.vacant}`, doc.internal.pageSize.width - 60, 29);
                doc.text(`Total Cancelled: ${candidateList.length}`, doc.internal.pageSize.width - 60, 36);

                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.5);
                doc.line(10, 40, doc.internal.pageSize.width - 10, 40);

                const exportData = prepareExportData(candidateList);
                const headers = Object.keys(exportData[0] || {});

                const tableBody = exportData.map(row =>
                    headers.map(header => {
                        let value = row[header] || 'N/A';

                        if (header === "Candidate Name" && value.length > 25) {
                            value = value.substring(0, 22) + '...';
                        }
                        if (header === 'Application No.' && value.length > 18) {
                            value = value.substring(0, 15) + '...';
                        }
                        if (header === 'Aadhar No.' && value !== 'N/A' && value.length > 14) {
                            value = value.substring(0, 14) + '...';
                        }
                        if (header === 'Cancellation Reason' && value.length > 30) {
                            value = value.substring(0, 27) + '...';
                        }

                        return value;
                    })
                );

                doc.autoTable({
                    head: [headers],
                    body: tableBody,
                    startY: 45,
                    margin: { left: 8, right: 8 },
                    styles: {
                        fontSize: 7,
                        cellPadding: 1.5,
                        overflow: 'linebreak',
                        cellWidth: 'wrap',
                        valign: 'middle',
                        lineColor: [220, 220, 220],
                        lineWidth: 0.1
                    },
                    headStyles: {
                        fillColor: primaryColor,
                        textColor: white,
                        fontStyle: 'bold',
                        halign: 'center',
                        fontSize: 7.5,
                        cellPadding: 2,
                        lineWidth: 0.2
                    },
                    bodyStyles: {
                        textColor: black,
                        lineColor: [230, 230, 230]
                    },
                    alternateRowStyles: {
                        fillColor: lightGray
                    },
                    columnStyles: {
                        0: { cellWidth: 12, halign: 'center' },  // Sr. No.
                        1: { cellWidth: 30, halign: 'center' },  // Application No.
                        2: { cellWidth: 40, halign: 'left' },    // Candidate Name
                        3: { cellWidth: 15, halign: 'center' },  // Gender
                        4: { cellWidth: 20, halign: 'left' },    // Category
                        5: { cellWidth: 12, halign: 'center' },  // PWD
                        6: { cellWidth: 25, halign: 'left' },    // Mobile
                        7: { cellWidth: 25, halign: 'left' },    // Cancelled Date
                        8: { cellWidth: 12, halign: 'center' },  // Unit
                        9: { cellWidth: 12, halign: 'center' },  // Shift
                        10: { cellWidth: 20, halign: 'left' },   // Adm. Year
                        11: { cellWidth: 20, halign: 'left' },   // Batch
                        12: { cellWidth: 28, halign: 'left' },   // Aadhar No.
                        13: { cellWidth: 18, halign: 'left' },   // Duration
                        14: { cellWidth: 40, halign: 'left' }    // Cancellation Reason
                    },
                    didDrawPage: (data) => {

                        const pageCount = doc.internal.getNumberOfPages();
                        const currentPage = data.pageNumber;

                        doc.setFontSize(7);
                        doc.setTextColor(128, 128, 128);


                        doc.text(
                            `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
                            10,
                            doc.internal.pageSize.height - 8
                        );


                        doc.text(
                            `Page ${currentPage} of ${pageCount}`,
                            doc.internal.pageSize.width - 30,
                            doc.internal.pageSize.height - 8
                        );
                    }
                });

                // Save the PDF
                const fileName = `Cancelled_Candidates_${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
            });
        });
    };

    return (
        <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
            <AdmissionReportSearchFilter
                noDataMessage={noDataMessage}
                title="Admission Cancelled Candidate List"
                titleIcon={<FileText />}
                reportType="cancelled-candidates"
                customSearchHandler={handleCustomSearch}
                showSummary={true}
                showSearchButton={true}
                hasSearched={hasSearched}
                onReset={handleReset}
            >
                {showResults && (
                    <div className="mt-6 space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 shadow-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-gray-200">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Cancelled Candidate Details</h3>
                                    <div className="space-y-3">

                                        {courseDetails.districtName && (
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">
                                                    District
                                                </div>
                                                <div className="font-medium text-gray-800 break-words">
                                                    {courseDetails.districtName}
                                                </div>
                                            </div>
                                        )}

                                        {courseDetails.instituteName && (
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">
                                                    Institute Name
                                                </div>
                                                <div className="font-medium text-gray-800 break-words">
                                                    {courseDetails.instituteName}
                                                </div>
                                            </div>
                                        )}

                                        {courseDetails.courseName && (
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">
                                                    Course Name
                                                </div>
                                                <div className="font-medium text-gray-800 break-words">
                                                    {courseDetails.courseName}
                                                </div>
                                            </div>
                                        )}

                                        {courseDetails.admissionSessionYear && (
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">
                                                    Admission Session
                                                </div>
                                                <div className="font-medium text-gray-800">
                                                    {courseDetails.admissionSessionYear}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Cancellation Statistics</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div className="text-center p-3 lg:p-4 bg-blue-50 rounded-lg">
                                            <div className="text-xl lg:text-2xl font-bold text-blue-600 mb-1">{summary.intake}</div>
                                            <div className="text-xs text-gray-600 font-medium">Total Intake</div>
                                        </div>
                                        <div className="text-center p-3 lg:p-4 bg-green-50 rounded-lg">
                                            <div className="text-xl lg:text-2xl font-bold text-green-600 mb-1">{summary.cancelled}</div>
                                            <div className="text-xs text-gray-600 font-medium">Total Admitted</div>
                                        </div>
                                        <div className="text-center p-3 lg:p-4 bg-gray-100 rounded-lg">
                                            <div className="text-xl lg:text-2xl font-bold text-gray-600 mb-1">{summary.vacant}</div>
                                            <div className="text-xs text-gray-600 font-medium">Total Vacant</div>
                                        </div>
                                        <div className="text-center p-3 lg:p-4 bg-red-50 rounded-lg">
                                            <div className="text-xl lg:text-2xl font-bold text-red-600 mb-1">{candidateList.length}</div>
                                            <div className="text-xs text-gray-600 font-medium">Cancelled Candidates</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Section - Always show when showResults is true */}
                        <fieldset className="mb-4 rounded-md border border-gray-300 p-4 bg-white overflow-visible relative isolate z-0">
                            <legend
                                className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                            >
                                Cancelled Candidate List ({candidateList.length} Candidate{candidateList.length !== 1 ? 's' : ''})
                            </legend>

                            <div className="mt-2 w-full relative isolate z-0 aadhaar-table-section">
                                <div className="relative isolate z-0">

                                    {/* View Aadhaar Button */}
                                    <div
                                        className="absolute left-0 top-0 z-10 flex items-center gap-2"
                                        style={{
                                            marginTop: "5px",
                                            marginRight: "8px",
                                            marginLeft: "70px",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setShowAadhaar(prev => !prev)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md text-white transition-colors shadow-sm ${showAadhaar
                                                    ? "bg-red-600 hover:bg-red-700"
                                                    : "bg-blue-600 hover:bg-blue-700"
                                                }`}
                                        >
                                            {showAadhaar ? "Hide Aadhaar" : "View Aadhaar"}
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto relative z-0">
                                        <FilteredTableComponent
                                            data={candidateList}
                                            columns={tableColumns}
                                            filterColumns={filterableColumns}
                                            renderCell={renderCell}
                                            sortable={true}
                                            searchable={true}
                                            exportable={true}
                                            showExcelTemplate={false}
                                            exportFileName={`Cancelled_Candidates_${new Date().toISOString().split('T')[0]}`}
                                            tableId="cancelled-candidates-table"
                                            maxHeight="500px"
                                            stickyHeader={true}
                                            emptyStateMessage="No cancelled candidates found"
                                            emptyStateSubMessage="Try adjusting your search criteria or there are no cancelled admissions for this selection"
                                            showSearch={true}
                                            showExport={true}
                                            showExcel={true}
                                            showPDF={false}
                                            searchableColumns={searchableColumns}
                                            exportData={prepareExportData(candidateList)}
                                            onPDFExport={handlePDFExport}
                                        />
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                )}

                {/* {!showResults && hasSearched && !loadingResults && (
                    <div className="mt-6 text-center py-12 bg-white rounded-lg border border-gray-200">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">No results found</p>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
                    </div>
                )} */}

                {/* {!showResults && !hasSearched && !loadingResults && (
                    <div className="mt-6 text-center py-12 bg-white rounded-lg border border-gray-200">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">Click Search to view cancelled candidates</p>
                        <p className="text-gray-400 text-sm mt-2">Select course and institute to generate report</p>
                    </div>
                )}

                {loadingResults && (
                    <div className="mt-6 text-center py-12 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            <p className="text-gray-500 text-lg ml-3">Loading cancelled candidates...</p>
                        </div>
                    </div>
                )} */}

                {searchError && (
                    <div className="mt-6 text-center py-8 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-red-600 text-lg">{searchError}</p>
                    </div>
                )}
            </AdmissionReportSearchFilter>

           <style jsx global>{`
                /* Fix for fieldset overflow hiding dropdowns */
                fieldset {
                min-width: 0;
                width: 100%;
                overflow: visible !important;
                }
                
                /* Ensure dropdowns are visible above table */
                .filter-dropdown-container,
                .filter-menu,
                [class*="filter-dropdown"],
                [class*="dropdown-menu"] {
                z-index: 9999 !important;
                position: relative;
                }
                
                /* Fix for search input wrapper */
                .search-input-wrapper {
                position: relative;
                z-index: 100;
                }
                
                /* Make search input visible and clickable */
                .search-input-wrapper input {
                position: relative;
                z-index: 101;
                background: white;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                padding: 0.5rem 1rem 0.5rem 2.5rem;
                width: 100%;
                opacity: 1 !important;
                visibility: visible !important;
                transition: all 0.2s ease;
                }
                
                /* Search icon positioning */
                .search-icon {
                position: absolute;
                left: 0.75rem;
                top: 50%;
                transform: translateY(-50%);
                z-index: 102;
                color: #6b7280;
                }
                
                /* Container for table with horizontal scroll */
                .overflow-x-auto {
                overflow-x: auto;
                overflow-y: hidden;
                -webkit-overflow-scrolling: touch;
                width: 100%;
                position: relative;
                border-radius: 0.5rem;
                }
                
                /* Ensure table doesn't clip dropdowns */
                .overflow-x-auto table {
                width: max-content;
                min-width: 100%;
                border-collapse: collapse;
                position: relative;
                }
                
                /* Column sizing + text handling (no forced ellipsis clipping) */
                .overflow-x-auto th,
                .overflow-x-auto td {
                white-space: nowrap;
                padding: 12px 8px;
                min-width: 100px;
                overflow: visible;
                }
                
                /* Hover effects */
                .filter-button:hover,
                [class*="filter-button"]:hover {
                background-color: #f3f4f6;
                border-color: #d1d5db;
                }
                
                .search-input-wrapper input:hover {
                border-color: #10b981;
                }
                
                .search-input-wrapper input:focus {
                border-color: #10b981;
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                outline: none;
                }
                
                tbody tr:hover {
                background-color: #f9fafb;
                }
                
                /* Break long words */
                .break-words {
                word-break: break-word;
                overflow-wrap: break-word;
                }

                /* Print styles for PDF optimization */
                @media print {
                body {
                    background: white;
                    margin: 0.2in;
                    padding: 0;
                    font-family: Arial, Helvetica, sans-serif;
                }
                
                .no-print {
                    display: none !important;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    page-break-inside: avoid;
                    font-size: 8pt;
                }
                
                th {
                    background-color: #059669 !important;
                    color: white !important;
                    font-weight: bold;
                    padding: 4px 2px;
                    text-align: center;
                    border: 1px solid #047857;
                }
                
                td {
                    padding: 3px 2px;
                    border: 1px solid #ddd;
                    vertical-align: middle;
                }
                
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                }
            `}</style>
        </div>
    );
};

export default AdmissionCancelledCandidateListPage;