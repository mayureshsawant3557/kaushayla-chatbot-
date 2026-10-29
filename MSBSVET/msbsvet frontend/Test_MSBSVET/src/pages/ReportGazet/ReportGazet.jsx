import React, { useContext, useEffect, useState } from 'react'
import { FileText, RotateCcw, Eye } from 'lucide-react';
import { useLoading } from '../../Hooks/useLoading';
import { ThemeContext } from '../../Component/Context/ThemeContext';
import FilteredTableComponent from '../../Component/formcomponent/FilteredTableComponent';
import { useAuth } from "../../Hooks/AuthContext"
import agent from '../../lib/api/agent';
import { GetCourseByCollegeID, GetExamType, GetGazetteReportData } from '../../Endpoints_All/Administration/admin';
import { GetAdmissionYear, GetInstituteIDByInstituteCode } from '../../Endpoints_All/Institute/institute';
import { getDistrictIDByDistrictUser, GetExaminationByInstitute, GetExaminationListAPI, InstituteBulkPrintResultAPI } from '../../Endpoints_All/Examination/Exam';
import DropdownComponent from '../../Component/formcomponent/DropdownComponent';
import Button from '../../Component/Base/Button';
import Loader from '../../Component/formcomponent/Loader';
import { userDetailsAPI } from '../../Endpoints_All/Account/userManagement';
import { GetMasterRegionDistrict } from '../../Endpoints_All/Base/location';
import { buildGazetteReportData } from '../../utils/buildGazetteReportData';
import { downloadGazettePdf } from '../../utils/downloadGazettePdf';


const ReportGazet = () => {

    const baseTableColumns = [
        { key: 'serialNumber', header: 'Sr. No.', width: '45px', className: 'text-center', headerClassName: 'text-center', sortable: true, searchable: false },
        { key: 'ApplicationIDDisplay', header: 'Application No.', width: '160px', className: 'text-center', headerClassName: 'text-center', searchable: true },
        { key: 'CandidateName', header: "Candidate's Name", width: '180px', className: 'text-center', headerClassName: 'text-center', searchable: true },
    ];

    const endTableColumns = [
        { key: 'TotalMarksObt', header: 'Total Marks', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'TotalMarksMax', header: 'Out Of Marks', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'GraceMarks', header: 'Grace Marks', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'Grade', header: 'Grade', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: true },
        { key: 'Percentage', header: 'Percentage', width: '90px', className: 'text-center', headerClassName: 'text-center', searchable: false },
    ];

    const courseSubjectsColumns = [
        { key: 'serialNumber', header: 'Sr. No.', width: '45px', className: 'text-center', headerClassName: 'text-center', sortable: false, searchable: false },
        { key: 'SubjectName', header: 'Subject Name', width: '180px', className: 'text-center', headerClassName: 'text-center', searchable: true },
        { key: 'SubjectCode', header: 'Subject Code', width: '100px', className: 'text-center', headerClassName: 'text-center', searchable: true },
        { key: 'SubjectType', header: 'Subject Type', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'max', header: 'Max Marks', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'min', header: 'Min Marks', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
    ];

    const courseListColumns = [
        { key: 'serialNumber', header: 'Sr. No.', width: '50px', className: 'text-center', headerClassName: 'text-center', sortable: false, searchable: false },
        { key: 'courseName', header: 'Course Name', width: '300px', className: 'text-left', headerClassName: 'text-left', searchable: true },
        { key: 'courseCode', header: 'Course Code', width: '120px', className: 'text-center', headerClassName: 'text-center', searchable: true },
        { key: 'totalCandidates', header: 'Total', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'pass', header: 'Pass', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'fail', header: 'Fail', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'hold', header: 'Hold', width: '80px', className: 'text-center', headerClassName: 'text-center', searchable: false },
        { key: 'action', header: 'Action', width: '100px', className: 'text-center', headerClassName: 'text-center', sortable: false, searchable: false },
    ];

    const instituteColumns = [
        {
            key: "serialNumber",
            header: "Sr. No.",
            width: "30px",
            className: "text-center",
            headerClassName: "text-center",
        },
        {
            key: "district",
            header: "District",
            width: "30px",
            className: "text-center",
            headerClassName: "text-center",
            searchable: true
        },
        {
            key: "instituteCode",
            header: "Institute Code",
            width: "80px",
            className: "text-center",
            headerClassName: "text-center",
        },
        {
            key: "instituteName",
            header: "Institute Name",
            width: "250px",
            className: "text-center",
            headerClassName: "text-center",
        },
        {
            key: "totalCandidates",
            header: "Total",
            width: "50px",
            className: "text-center",
            headerClassName: "text-center",
        },
        {
            key: "action",
            header: "Action",
            width: "50px",
            className: "text-center",
            headerClassName: "text-center",
        },
    ];

    const filterableColumns = [
        'ApplicationIDDisplay', 'CandidateName', 'Grade'];

    const courseListFilterableColumns = [
        'courseName', 'courseCode'];

    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const { startLoading, stopLoading } = useLoading();

    const [pageLoading, setPageLoading] = useState(true);
    const [userTypeId, setUserTypeId] = useState(0);
    const [instituteNumericId, setInstituteNumericId] = useState(0);
    const [instituteOptions, setInstituteOptions] = useState([]);
    const [selectedInstituteId, setSelectedInstituteId] = useState("");
    const [examYearOptions, setExamYearOptions] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState("");
    const [selectedYearId, setSelectedYearId] = useState("");
    const [selectedExamType, setSelectedExamType] = useState("");
    const [isLoadingYears, setIsLoadingYears] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [instituteNameForPrint, setInstituteNameForPrint] = useState('');

    // District related states
    const [districtOptions, setDistrictOptions] = useState([]);
    const [instituteOptionsByDistrict, setInstituteOptionsByDistrict] = useState([]);
    const [selectedDistrictId, setSelectedDistrictId] = useState("");
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingInstitutes, setIsLoadingInstitutes] = useState(false);
    const [allInstitutes, setAllInstitutes] = useState([]);

    const [showInstituteList, setShowInstituteList] = useState(false);
    const [instituteListData, setInstituteListData] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState(null);

    // Course list states
    const [courseListData, setCourseListData] = useState([]);
    const [showCourseList, setShowCourseList] = useState(false);
    const [loadingCourseList, setLoadingCourseList] = useState(false);

    const [showResults, setShowResults] = useState(false);
    const [loadingResults, setLoadingResults] = useState(false);
    const [courseDetails, setCourseDetails] = useState({ courseName: "", admissionSession: "" });
    const [admissionStats, setAdmissionStats] = useState({ totalCandidates: 0, pass: 0, fail: 0, hold: 0 });
    const [courseSubjectsData, setCourseSubjectsData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [selectedCourseName, setSelectedCourseName] = useState('');
    // Store raw data for later use
    const [rawApiData, setRawApiData] = useState([]);
    // ── Dynamic table columns for subject marks ──
    const [dynamicTableColumns, setDynamicTableColumns] = useState([]);
    const [districtid, setDistrictId] = useState(null);

    const [admissionYears, setAdmissionYears] = useState([]);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [examTypeOptions, setExamTypeOptions] = useState([]);


    useEffect(() => {
        const initialize = async () => {
            try {
                setPageLoading(true);
                const typeId = Number(userInfo?.UserTypeID);
                setUserTypeId(typeId);
                if (typeId === 61 || typeId === 14) {
                    await fetchAvailableYears();
                } else if (typeId === 10) {
                    await fetchDistricts();
                }
            } finally {
                setPageLoading(false);
            }
        };
        initialize();
    }, []);

    useEffect(() => {
        fetchAdmissionYears();
        fetchExamType();
    }, [])

    useEffect(() => {
        const fetchInstituteName = async () => {
            if (userInfo?.UserTypeID === 61) {
                const name = await getInstDetails();
                if (name) {
                    setInstituteNameForPrint(name);
                }
            }
        };
        fetchInstituteName();
    }, [userInfo]);

    useEffect(() => {
        const readyToFetch = (userTypeId === 61 || userTypeId === 14)
            ? !!selectedYearId  
            : !!(selectedYearId && selectedExamType); 

        if (readyToFetch) {
            fetchExamYearOptions();
        } else {
            setExamYearOptions([{ value: '', label: 'Select Examination' }]);
            setSelectedExamId("");
        }
    }, [selectedYearId, selectedExamType, userTypeId]);

    const fetchDistricts = async () => {
        try {
            setIsLoadingDistricts(true);
            const response = await agent.get(`${GetMasterRegionDistrict}`);
            const responseData = response.data?.Data || response.data || [];

            let districts = [];
            if (Array.isArray(responseData)) {
                districts = responseData;
            } else if (Array.isArray(responseData?.Data)) {
                districts = responseData.Data;
            } else if (Array.isArray(responseData?.Table)) {
                districts = responseData.Table;
            }

            const formattedDistricts = districts
                .filter(item => item.Text !== 'Select')
                .map(item => ({
                    value: item.Value || item.ID || item.DistrictID,
                    label: item.Text || item.DistrictName || item.Name,
                    group: item.Group
                }));

            setDistrictOptions([
                { value: '', label: 'Select District' },
                ...formattedDistricts
            ]);

            await fetchAvailableYears();

        } catch (error) {
            console.error("Error fetching districts:", error);
            setErrorMessage("Failed to load districts");
        } finally {
            setIsLoadingDistricts(false);
        }
    };

    const fetchInstituteByDistrictID = async (districtId) => {
        if (userTypeId !== 10) {
            return;
        }

        if (!districtId) {
            setInstituteOptionsByDistrict([{ value: '', label: 'Select Institute' }]);
            setSelectedInstituteId("");
            return;
        }

        try {
            setIsLoadingInstitutes(true);
            const response = await agent.get("/Base/GetMasterInstituteFilter", {
                params: {
                    RegionID: -1,
                    DistrictID: districtId,
                    TalukaID: -1,
                    ExaminationID: selectedExamId
                },
            });

            let institutes = [];
            if (response?.data?.Data) {
                institutes = response.data.Data;
            } else if (Array.isArray(response.data)) {
                institutes = response.data;
            }

            const formattedInstitutes = institutes
                .filter(item => item.Text !== 'Select' && item.Value !== '-1')
                .map(item => ({
                    value: item.Value,
                    label: item.Text,
                    group: item.Group,
                    group2: item.Group2
                }));

            setInstituteOptionsByDistrict([
                { value: '', label: 'Select Institute' },
                ...formattedInstitutes
            ]);

            setSelectedInstituteId("");

        } catch (error) {
            console.error("Error fetching institutes by district:", error);
            setErrorMessage("Failed to load institutes for selected district");
            setInstituteOptionsByDistrict([{ value: '', label: 'Select Institute' }]);
        } finally {
            setIsLoadingInstitutes(false);
        }
    };

    const fetchAllInstitutes = async () => {
        try {
            const response = await agent.get("/Base/GetMasterInstitute");
            const institutes = response.data?.Data || response.data?.Table || response.data || [];
            setAllInstitutes(institutes);

            setInstituteOptions([
                { value: '', label: 'Select Institute' },
                ...institutes.map(item => ({
                    value: item.Value || item.CollegeID,
                    label: item.Text || item.CollegeName,
                    group: item.Group
                }))
            ]);
        } catch (error) {
            console.error("Error fetching all institutes:", error);
        }
    };

    const handleDistrictChange = async (districtId) => {
        setSelectedDistrictId(districtId);
        setSelectedInstituteId("");
        setErrorMessage("");
        setShowResults(false);
        setShowCourseList(false);
        setCourseListData([]);

        if (!districtId) {
            setInstituteOptionsByDistrict([{ value: '', label: 'Select Institute' }]);
            setSelectedInstituteId("");
            return;
        }

        await fetchInstituteByDistrictID(districtId);
    };

    const fetchExamYearOptions = async () => {
        const isReady = (userTypeId === 61 || userTypeId === 14)
            ? !!selectedYearId
            : !!(selectedYearId && selectedExamType);

        if (!isReady) {
            setExamYearOptions([{ value: '', label: 'Select Examination' }]);
            return;
        }

        try {
            setIsLoadingYears(true);

            let response;
            if (userTypeId === 61) {
                response = await agent.get(`${GetExaminationByInstitute}InstituteID=${instituteNumericId}`);
            } else if (userTypeId === 14) {
                response = await agent.get(`${GetExaminationListAPI}?yearId=${selectedYearId}`);
            } else {
                response = await agent.get(`${GetExaminationListAPI}?examTypeId=${selectedExamType}&yearId=${selectedYearId}`);
            }

            const responseData = response.data;

            let rawYearsData = [];
            if (Array.isArray(responseData)) rawYearsData = responseData;
            else if (Array.isArray(responseData?.Data)) rawYearsData = responseData.Data;
            else if (Array.isArray(responseData?.Table)) rawYearsData = responseData.Table;
            else if (responseData && typeof responseData === "object") {
                const arrayValues = Object.values(responseData).filter(Array.isArray);
                if (arrayValues.length > 0) rawYearsData = arrayValues[0];
            }

            let formattedYears;
            if (userTypeId === 61) {
                const filteredYears = rawYearsData.filter((f) => f.ExaminatioYearID == selectedYearId);
                formattedYears = filteredYears.map(exam => ({
                    value: exam?.ID || exam?.ExaminationID,
                    label: exam?.ExaminationName || exam?.Name || '',
                }));
            } else {
                formattedYears = rawYearsData.map(exam => ({
                    value: exam?.ID || exam?.ExaminationID,
                    label: exam?.ExaminationName || exam?.Name || '',
                }));
            }

            setExamYearOptions([
                { value: '', label: 'Select Examination' },
                ...formattedYears
            ]);

            setSelectedExamId("");

        } catch (error) {
            console.error("Error fetching examinations:", error);
            setExamYearOptions([{ value: '', label: 'Select Examination' }]);
            setErrorMessage("Failed to load examinations");
        } finally {
            setIsLoadingYears(false);
        }
    };

    const fetchAvailableYears = async () => {
        try {
            if (!userInfo) return;

            const instituteIdResponse = await agent.get(GetInstituteIDByInstituteCode, {
                params: { InstituteCode: userInfo?.UserLoginID }
            });
            const instituteId = instituteIdResponse?.data?.Data;
            if (!instituteId) {
                setErrorMessage("Could not retrieve institute information");
                return;
            }
            setInstituteNumericId(instituteId);

        } catch (error) {
            console.error("Error initializing:", error);
        }
    };

    const fetchExamType = async () => {
        try {
            const response = await agent.get(`${GetExamType}`);
            let examTypeArray = [];
            if (response?.data?.Data && response?.data?.Data.length > 0) {
                examTypeArray = response?.data?.Data || [];

                const formattedExamType = examTypeArray.map(exam => ({
                    value: exam?.ExamTypeID,
                    label: exam?.ExamType,
                }));

                setExamTypeOptions([
                    { value: '', label: 'Select Exam Type' },
                    ...formattedExamType
                ]);
            } else {
                setAdmissionYears([]);
            }

        } catch (err) {
            console.error("Error fetching Exam Type", err);
            setExamTypeOptions([]);
        }
    }

    const fetchAdmissionYears = async () => {
        try {
            const response = await agent.get(`${GetAdmissionYear}`)
            let yearArray = [];
            if (response?.data?.Data && response?.data?.Data.length > 0) {
                yearArray = response?.data?.Data || [];

                const formattedYears = yearArray.map(year => ({
                    value: year?.YearId,
                    label: year?.YearDisplayName,
                }));

                setAdmissionYears([
                    { value: '', label: 'Select Year' },
                    ...formattedYears
                ]);
            } else {
                setAdmissionYears([]);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleInstituteChange = async (instituteId) => {
        setSelectedInstituteId(instituteId);
        setSelectedExamId("");
        setExamYearOptions([]);
        setErrorMessage("");
        setShowResults(false);
        setShowCourseList(false);
        setCourseListData([]);

        if (instituteId) {
            await fetchExamYearOptions(instituteId);
        }
    };

    const handleYearChange = (yearId) => {
        setSelectedYearId(yearId);
        if (userTypeId === 10) {
            setSelectedExamType("");
        }
        setSelectedExamId("");
        setExamYearOptions([{ value: '', label: 'Select Examination' }]);
    };

    const handleExamTypeChange = (examTypeId) => {
        setSelectedExamType(examTypeId);
        setSelectedExamId("");
        setExamYearOptions([{ value: '', label: 'Select Examination' }]);
    };

    const getDistinctCandidates = (data) => {
        const uniqueMap = new Map();
        data.forEach(row => {
            const appId = row.ApplicationID;
            if (!uniqueMap.has(appId)) {
                uniqueMap.set(appId, row);
            }
        });
        return Array.from(uniqueMap.values());
    };

    const handleDownloadGazettePdf = async () => {
        if (!selectedExamId) {
            setErrorMessage("Please select examination");
            return;
        }
        if (!rawApiData.length) {
            setErrorMessage("No data available to generate the report");
            return;
        }

        setGeneratingPdf(true);
        setErrorMessage("");
        try {
            let instituteName = '';
            let filteredData = rawApiData;

            if (userTypeId === 10) {
                if (selectedInstituteId) {
                    filteredData = rawApiData.filter(row =>
                        String(row.InstituteID) === String(selectedInstituteId) ||
                        String(row.InstituteCode) === String(selectedInstituteId)
                    );

                    const inst = instituteOptionsByDistrict.find(i =>
                        String(i.value) === String(selectedInstituteId)
                    );
                    instituteName = inst?.label || selectedInstituteId || '';
                } else if (selectedDistrictId) {
                    filteredData = rawApiData.filter(row =>
                        String(row.DistrictID) === String(selectedDistrictId)
                    );
                    const district = districtOptions.find(d =>
                        String(d.value) === String(selectedDistrictId)
                    );
                    instituteName = district?.label || 'All Institutes in District';
                } else {
                    instituteName = 'All Institutes';
                }
            } else if ((userTypeId === 14) && selectedInstitute) {
                filteredData = rawApiData.filter(row =>
                    String(row.InstituteCode) === String(selectedInstitute)
                );
            } else if (userTypeId === 61) {
                const rawInstituteId = selectedInstituteId || instituteNumericId;
                filteredData = rawApiData.filter(row =>
                    String(row.InstituteCode) === String(rawInstituteId) ||
                    String(row.InstituteID) === String(rawInstituteId)
                );
                instituteName = instituteNameForPrint || '';
            }

            if (!filteredData.length) {
                console.warn("No filtered data found, using all data");
                filteredData = rawApiData;
            }

            const reportData = buildGazetteReportData({
                rawApiData: filteredData,
                examinationId: selectedExamId,
                examinationName: examYearOptions.find(e => String(e.value) === String(selectedExamId))?.label || '',
                instituteName: instituteName || 'All Institutes',
            });

            let fName;
            if (userTypeId === 10) {
                if (selectedInstituteId) {
                    fName = `Gazette_${instituteName}`;
                } else if (selectedDistrictId) {
                    fName = `Gazette_${instituteName}`;
                } else {
                    fName = 'Gazette_All_Institutes';
                }
            } else if (userTypeId === 61) {
                fName = instituteNameForPrint || 'Institute_Result';
            } else if (userTypeId === 14) {
                fName = userInfo?.UserLoginID || 'District_Result';
            }
            const fileName = `${fName}_${examYearOptions.find(e => String(e.value) === String(selectedExamId))?.label || ''}.pdf`;
            await downloadGazettePdf(reportData, fileName);
        } catch (error) {
            console.error("Error generating PDF:", error);
            setErrorMessage(error.message || "Failed to generate the PDF report");
        } finally {
            setGeneratingPdf(false);
        }
    };

    const fetchCourseList = async () => {
        if (!selectedExamId) {
            setErrorMessage("Please select examination");
            return;
        }

        setLoadingCourseList(true);
        setErrorMessage("");
        setShowCourseList(false);
        setShowResults(false);
        setCourseListData([]);

        try {
            const rawInstituteId = selectedInstituteId || instituteNumericId;
            const effectiveInstituteId = Number(rawInstituteId) === 1 ? 0 : rawInstituteId;

            let districtId = 0;
            let gazetteType = "I";

            if (userTypeId === 14) {
                const districtResponse = await agent.get(getDistrictIDByDistrictUser, {
                    params: {
                        UserLoginID: userInfo?.UserLoginID
                    }
                });

                districtId = districtResponse.data?.Data || 0;
                setDistrictId(districtId);
                gazetteType = "D";
            }

            let params = {}
            if (userTypeId === 10) {
                let gType = 'C'; 
                let instId = 0;
                let distId = 0;

                if (selectedInstituteId) {
                    gType = 'I';
                    instId = selectedInstituteId;
                } else if (selectedDistrictId) {
                    gType = 'D';
                    distId = selectedDistrictId;
                }
                params = {
                    examinationId: selectedExamId,
                    instituteId: instId,
                    isResultFresh: "F",
                    gazetteType: gType,
                    districtId: distId
                };
            } else {
                params = {
                    examinationId: selectedExamId,
                    instituteId: effectiveInstituteId,
                    isResultFresh: "F",
                    gazetteType,
                    districtId
                };
            }

            const response = await agent.get(GetGazetteReportData, { params });
            const responseData = response.data?.Data || response.data;

            let rawData = [];
            if (Array.isArray(responseData)) rawData = responseData;
            else if (Array.isArray(responseData?.Table)) rawData = responseData.Table;
            else if (Array.isArray(responseData?.Table1)) rawData = responseData.Table1;

            if (!rawData.length) {
                setErrorMessage("No data found for selected criteria");
                setLoadingCourseList(false);
                return;
            }

            setRawApiData(rawData);

            if (userTypeId === 14 || userTypeId === 10) {
                const instituteMap = new Map();

                rawData.forEach((row) => {
                    const key = row.InstituteCode;

                    if (!instituteMap.has(key)) {
                        instituteMap.set(key, {
                            instituteId: row.InstituteID || row.InstituteCode,
                            district: row.District || '',
                            instituteCode: row.InstituteCode,
                            instituteName: row.InstituteNameCode || row.InstituteName || '',
                            candidates: []
                        });
                    }

                    instituteMap.get(key).candidates.push(row);
                });

                const instituteList = Array.from(instituteMap.values()).map((inst, index) => ({
                    serialNumber: index + 1,
                    district: inst.district,
                    instituteId: inst.instituteId,
                    instituteCode: inst.instituteCode,
                    instituteName: inst.instituteName,
                    totalCandidates: getDistinctCandidates(inst.candidates).length,
                    action: "View"
                }));


                instituteList.sort((a, b) => a.instituteName.localeCompare(b.instituteName));

                setInstituteListData(instituteList);
                setShowInstituteList(true);
                setShowCourseList(false);
                setLoadingCourseList(false);
                return;
            }

            const examinationFiltered = rawData.filter(
                row => String(row.ExaminationID || row.Examination_Id) === String(selectedExamId)
            );

            if (!examinationFiltered.length) {
                setErrorMessage(`No data found for the selected examination`);
                setLoadingCourseList(false);
                return;
            }

            const courseMap = new Map();
            examinationFiltered.forEach(row => {
                const courseKey = row.CourseID;
                if (!courseMap.has(courseKey)) {
                    courseMap.set(courseKey, {
                        courseId: row.CourseID,
                        courseName: row.CourseName || row.CourseNameCode || '-',
                        courseCode: row.CourseCode || '',
                        candidates: []
                    });
                }
                courseMap.get(courseKey).candidates.push(row);
            });

            const courseList = Array.from(courseMap.values()).map((course, index) => {
                const distinctCandidates = getDistinctCandidates(course.candidates);

                const pass = distinctCandidates.filter(c => c.ResultStatus === 'Pass').length;
                const fail = distinctCandidates.filter(c => c.ResultStatus === 'Fail' || c.ResultStatus === 'ABSENT').length;
                const hold = distinctCandidates.filter(c => c.ResultStatus === 'Result Hold').length;

                return {
                    serialNumber: index + 1,
                    courseId: course.courseId,
                    courseName: course.courseName,
                    courseCode: course.courseCode,
                    totalCandidates: distinctCandidates.length,
                    pass: pass,
                    fail: fail,
                    hold: hold,
                    action: 'View'
                };
            });

            courseList.sort((a, b) => a.courseName.localeCompare(b.courseName));

            setCourseListData(courseList);
            setShowCourseList(true);

        } catch (error) {
            console.error("Error fetching course list:", error);
            setErrorMessage(error.response?.data?.title || "Failed to retrieve course data");
        } finally {
            setLoadingCourseList(false);
        }
    };

    const renderInstituteRow = (row) => ({
        ...row,
        action: (
            <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
                onClick={() => handleViewInstitute(row)}
            >
                <Eye size={14} />
                View
            </button>
        )
    });

    const handleViewInstitute = (row) => {
        setSelectedInstitute(row.instituteCode);

        const instituteWiseData = rawApiData.filter(
            x => String(x.InstituteCode) === String(row.instituteCode)
        );

        const courseMap = new Map();

        instituteWiseData.forEach(item => {
            if (!courseMap.has(item.CourseID)) {
                courseMap.set(item.CourseID, {
                    courseId: item.CourseID,
                    courseName: item.CourseName,
                    courseCode: item.CourseCode,
                    candidates: []
                });
            }
            courseMap.get(item.CourseID).candidates.push(item);
        });

        const courses = Array.from(courseMap.values()).map((course, index) => {
            const candidates = getDistinctCandidates(course.candidates);
            return {
                serialNumber: index + 1,
                courseId: course.courseId,
                courseName: course.courseName,
                courseCode: course.courseCode,
                totalCandidates: candidates.length,
                pass: candidates.filter(x => x.ResultStatus === "Pass").length,
                fail: candidates.filter(x => x.ResultStatus === "Fail" || x.ResultStatus === "ABSENT").length,
                hold: candidates.filter(x => x.ResultStatus === "Result Hold").length,
                action: "View"
            };
        });

        setCourseListData(courses);
        setShowInstituteList(false);
        setShowCourseList(true);
    };

    const handleViewCourseDetails = async (courseId, courseName) => {
        setSelectedCourseId(courseId);
        setSelectedCourseName(courseName);
        setShowResults(false);
        setLoadingResults(true);
        setTableData([]);
        setCourseSubjectsData([]);
        setCourseDetails({ courseName: "", admissionSession: "" });
        setAdmissionStats({ totalCandidates: 0, pass: 0, fail: 0, hold: 0 });
        setDynamicTableColumns([]);

        startLoading();

        try {
            if (!rawApiData.length) {
                setErrorMessage("No data available");
                setLoadingResults(false);
                stopLoading();
                return;
            }

            let filteredData;

            if (userTypeId === 10) {
                const instituteToFilter = selectedInstitute;

                filteredData = rawApiData.filter(row => {
                    const instituteMatch = instituteToFilter
                        ? String(row.InstituteCode) === String(instituteToFilter)
                        : false;

                    return (
                        String(row.ExaminationID) === String(selectedExamId) &&
                        String(row.CourseID) === String(courseId) &&
                        instituteMatch
                    );
                });
            } else if (userTypeId === 14) {
                const instituteToFilter = selectedInstitute;
                filteredData = rawApiData.filter(row => {
                    const instituteMatch = instituteToFilter
                        ? String(row.InstituteCode) === String(instituteToFilter)
                        : false;

                    return (
                        String(row.ExaminationID) === String(selectedExamId) &&
                        String(row.CourseID) === String(courseId) &&
                        instituteMatch
                    );
                });
            } else {
                filteredData = rawApiData.filter(row => {
                    return (
                        String(row.ExaminationID) === String(selectedExamId) &&
                        String(row.CourseID) === String(courseId)
                    );
                });
            }

            if (!filteredData.length) {
                setErrorMessage("No data found for the selected course");
                setLoadingResults(false);
                stopLoading();
                return;
            }

            const candidateMap = new Map();
            const subjectSet = new Map();

            filteredData.forEach(row => {
                const appId = row.ApplicationID;

                if (!candidateMap.has(appId)) {
                    candidateMap.set(appId, {
                        CandidateID: row.CandidateID,
                        ApplicationID: row.ApplicationID,
                        ApplicationIDDisplay: row.ApplicationIDDisplay,
                        CandidateName: row.CandidateName,
                        CourseName: row.CourseName,
                        CourseID: row.CourseID,
                        CourseNameCode: row.CourseNameCode,
                        ExaminationName: row.ExaminationName,
                        ResultStatus: row.ResultStatus,
                        Grade: row.Grade,
                        ResultDate: row.ResultDate,
                        Percentage: (row.ResultStatus === 'Fail' || row.ResultStatus === 'ABSENT')
                            ? 'NA'
                            : (row.Percentage ? `${row.Percentage}%` : '-'),
                        TotalMarksObt: row.TotalMarksObt || '-',
                        TotalMarksMax: row.TotalMarksMax,
                        TotalMarksMin: row.TotalMarksMin,
                        GraceMarks: row.GraceMarks ? `${row.GraceMarks}` : '0',
                        subjects: {},
                    });
                }

                if (row.SubjectName) {
                    const compositeKey = `${row.SubjectCode}_${row.SubjectType || 'THEORY'}`;
                    const candidate = candidateMap.get(appId);

                    candidate.subjects[compositeKey] = {
                        SubjectName: row.SubjectName,
                        SubjectCode: row.SubjectCode,
                        SubjectType: row.SubjectType || 'THEORY',
                        obt: row.Result === 'Absent' ? 'AB' : `${row.obt}` + `${row.Result === 'Fail' ? '*' : row.SubjectGraceMarks !== '' ? '@' : ''}` || '-',
                        max: row.max,
                        min: row.min,
                    };

                    if (!subjectSet.has(compositeKey)) {
                        subjectSet.set(compositeKey, {
                            SubjectName: row.SubjectName,
                            SubjectCode: row.SubjectCode,
                            SubjectType: row.SubjectType || 'THEORY',
                            max: row.max,
                            min: row.min,
                        });
                    }
                }
            });

            const grouped = Array.from(candidateMap.values());
            const sortedSubjects = Array.from(subjectSet.keys()).sort();
            const subjectDetails = Array.from(subjectSet.values());

            const subjectColumns = sortedSubjects.map(compositeKey => {
                const parts = compositeKey.split('_');
                const subjectCode = parts[0];
                const subjectType = parts[1] || '';

                return {
                    key: `subject_${compositeKey}`,
                    header: `${subjectCode} (${subjectType})`,
                    width: '60px',
                    className: 'text-center',
                    headerClassName: 'text-center',
                    searchable: false,
                    sortable: false,
                };
            });

            const dynamicColumns = [
                ...baseTableColumns,
                ...subjectColumns,
                ...endTableColumns
            ];

            setDynamicTableColumns(dynamicColumns);

            const candidateRows = grouped.map((c, index) => {
                const row = {
                    serialNumber: index + 1,
                    CandidateID: c.CandidateID,
                    ApplicationID: c.ApplicationID,
                    ApplicationIDDisplay: c.ApplicationIDDisplay,
                    CandidateName: c.CandidateName,
                    TotalMarksObt: c.TotalMarksObt,
                    TotalMarksMax: c.TotalMarksMax,
                    GraceMarks: c.GraceMarks,
                    ResultStatus: c.ResultStatus,
                    Grade: c.Grade,
                    Percentage: c.Percentage,
                };
                sortedSubjects.forEach(compositeKey => {
                    const subjectData = c.subjects[compositeKey];
                    row[`subject_${compositeKey}`] = subjectData ? subjectData.obt : '-';
                });
                return row;
            });

            candidateRows.sort((a, b) => (a.CandidateID || 0) - (b.CandidateID || 0));

            const subjectRows = subjectDetails.map((s, index) => ({
                serialNumber: index + 1,
                SubjectName: s.SubjectName,
                SubjectCode: s.SubjectCode,
                SubjectType: s.SubjectType,
                max: s.max,
                min: s.min,
            }));

            const pass = grouped.filter(c => c.ResultStatus === 'Pass').length;
            const fail = grouped.filter(c => c.ResultStatus === 'Fail' || c.ResultStatus === 'ABSENT').length;
            const hold = grouped.filter(c => c.ResultStatus === 'Result Hold').length;

            const firstCandidate = grouped[0];

            setCourseDetails({
                courseName: firstCandidate?.CourseNameCode || firstCandidate?.CourseName || '-',
                admissionSession: firstCandidate?.ExaminationName || '-',
            });
            setAdmissionStats({ totalCandidates: grouped.length, pass, fail, hold });
            setCourseSubjectsData(subjectRows);
            setTableData(candidateRows);
            setShowResults(true);
            setShowCourseList(false);

        } catch (error) {
            console.error("Error fetching course details:", error);
            setErrorMessage(error.response?.data?.title || "Failed to retrieve course details");
        } finally {
            setLoadingResults(false);
            stopLoading();
        }
    };

    const handleReset = () => {
        setSelectedExamId("");
        setSelectedYearId("");
        setSelectedExamType("");
        setSelectedDistrictId("");
        setSelectedInstituteId("");
        setSelectedInstitute(null);

        setExamYearOptions([{ value: '', label: 'Select Examination' }]);
        setExamTypeOptions([]);
        setAdmissionYears([]);
        setInstituteOptionsByDistrict([{ value: '', label: 'Select Institute' }]);

        setShowInstituteList(false);
        setShowCourseList(false);
        setShowResults(false);

        setCourseListData([]);
        setRawApiData([]);
        setTableData([]);
        setCourseSubjectsData([]);
        setInstituteListData([]);

        setCourseDetails({
            courseName: "",
            admissionSession: ""
        });

        setAdmissionStats({
            totalCandidates: 0,
            pass: 0,
            fail: 0,
            hold: 0
        });

        setSelectedCourseId(null);
        setSelectedCourseName("");
        setDynamicTableColumns([]);
        setErrorMessage("");
        setGeneratingPdf(false);

        fetchAdmissionYears();
        fetchExamType();

        if (userTypeId === 10) {
            fetchDistricts();
        }
    };

    const getInstDetails = async () => {
        if (userInfo?.UserTypeID !== 61) {
            return null;
        }
        try {
            const response = await agent.get(`${userDetailsAPI}?userTypeId=${userInfo?.UserTypeID}&userLoginId=${userInfo?.UserLoginID}`);
            let instName = '';
            if (response?.data && response?.data?.length > 0) {
                instName = response?.data[0]?.UserName || '';
            }
            return instName;
        } catch (error) {
            console.error('Error fetching institute details:', error);
            return null;
        }
    };

    const handleBackToCourseList = () => {
        setShowResults(false);
        setShowCourseList(true);
        setTableData([]);
        setCourseSubjectsData([]);
        setCourseDetails({
            courseName: "",
            admissionSession: ""
        });
        setAdmissionStats({
            totalCandidates: 0,
            pass: 0,
            fail: 0,
            hold: 0
        });
        setSelectedCourseId(null);
        setSelectedCourseName("");
        setDynamicTableColumns([]);
    };

    const handleBackToInstituteList = () => {
        setShowCourseList(false);
        setShowInstituteList(true);
        setCourseListData([]);
        setSelectedInstitute(null);
    };

    const openReportGazetPopup = () => {
        if (!selectedExamId) {
            setErrorMessage("Please select examination");
            return;
        }

        const selectedExam = examYearOptions.find(e => String(e.value) === String(selectedExamId));

        const rawInstituteId = selectedInstituteId || instituteNumericId;
        const effectiveInstituteId = Number(rawInstituteId) === 1 ? 0 : rawInstituteId;

        let instituteName = '';
        if (userTypeId === 61) {
            instituteName = instituteNameForPrint || '';
        } else {
            instituteName = instituteOptions.find(i => String(i.value) === String(rawInstituteId))?.label || '';
        }

        const courseName = courseDetails.courseName || '';
        const courseId = selectedCourseId || '0';

        let params;
        if (userTypeId === 61) {
            params = new URLSearchParams({
                instituteId: effectiveInstituteId || 0,
                examinationId: selectedExamId || 0,
                courseId: courseId,
                courseCode: '',
                instituteName: instituteName || '',
                examinationName: selectedExam?.label || '',
                courseName: courseName,
                userLoginID: userInfo?.UserLoginID || '',
                userTypeID: userTypeId || 0
            });
        } else if (userTypeId === 14) {
            params = new URLSearchParams({
                instituteId: effectiveInstituteId || 0,
                examinationId: selectedExamId || 0,
                courseId: courseId,
                courseCode: '',
                instituteName: instituteName || '',
                examinationName: selectedExam?.label || '',
                courseName: courseName,
                userLoginID: userInfo?.UserLoginID || '',
                userTypeID: userTypeId || 0,
                districtId: districtid || 0
            });
        } else if (userTypeId === 10) {
            params = new URLSearchParams({
                instituteId: selectedInstituteId || 0,
                examinationId: selectedExamId || 0,
                courseId: courseId,
                courseCode: '',
                instituteName: instituteName || '',
                examinationName: selectedExam?.label || '',
                courseName: courseName,
                userLoginID: userInfo?.UserLoginID || '',
                userTypeID: userTypeId || 0,
                districtId: selectedDistrictId || 0
            });
        }

        const popupWidth = 1000;
        const popupHeight = 800;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const documentUrl = `${window.location.origin}/React/ReportGazetPrint?${params.toString()}`

        const popup = window.open(
            ``,
            'ReportGazetPrint',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (popup) {
            popup.document.write(`
                <html>
                    <head>
                        <title>${instituteName} Result Sheet</title>
                        <style>
                            body { margin: 0; overflow: hidden; }
                            iframe { border: none; width: 100vw; height: 100vh; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${documentUrl}" frameborder="0"></iframe>
                    </body>
                </html>
            `);
            popup.document.close();
            popup.focus();
        }

        if (!popup) {
            Swal.fire({
                title: 'Popup Blocked',
                text: 'Please allow popups for this website to print the report.',
                icon: 'error'
            });
        }
    };

    const renderCourseListRow = (row) => {
        return {
            ...row,
            action: (
                <button
                    onClick={() => handleViewCourseDetails(row.courseId, row.courseName)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                    <Eye size={14} />
                    View
                </button>
            )
        };
    };

    if (pageLoading) return <Loader />;

    const hasSelection = selectedExamId || selectedInstituteId || selectedDistrictId;

    const courseListWithActions = courseListData.map(row => renderCourseListRow(row));

    return (
        <>
            <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
                <div className="bg-white rounded-xl shadow-md px-10 py-8">

                    {!showResults && (
                        <fieldset className='mb-4 rounded-md border border-gray-300 p-4 bg-white'>
                            <legend className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}>
                                <FileText size={25} className="w-4 h-4 mr-2" />
                                Report Gazette
                            </legend>

                            {errorMessage && (
                                <div className="mb-6 bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
                                    {errorMessage}
                                </div>
                            )}

                            <div className={`grid gap-6 mb-8 ${userTypeId === 14
                                ? "grid-cols-1 md:grid-cols-2"  
                                : userTypeId === 10
                                    ? "grid-cols-1 md:grid-cols-4"  
                                    : userTypeId === 61
                                        ? "grid-cols-1 md:grid-cols-2"  
                                        : "grid-cols-1 md:grid-cols-2"
                                }`}>
                                <div>
                                    <DropdownComponent
                                        label="Exam Year"
                                        options={admissionYears}
                                        value={selectedYearId}
                                        onChange={handleYearChange}
                                        error={!selectedYearId && errorMessage.includes("Please select")}
                                        required={true}
                                        disabled={isLoadingYears}
                                        loading={isLoadingYears}
                                    />
                                </div>

                                {userTypeId === 10 && (
                                    <div>
                                        <DropdownComponent
                                            label="Exam Type"
                                            options={examTypeOptions}
                                            value={selectedExamType}
                                            onChange={handleExamTypeChange}
                                            error={!selectedExamType && errorMessage.includes("Please select")}
                                            required={true}
                                            disabled={!selectedYearId}
                                            loading={isLoadingYears}
                                        />
                                    </div>
                                )}

                                <div>
                                    <DropdownComponent
                                        label="Examination"
                                        options={examYearOptions}
                                        value={selectedExamId}
                                        onChange={setSelectedExamId}
                                        error={!selectedExamId && errorMessage.includes("Please select")}
                                        required={true}
                                        disabled={
                                            (userTypeId === 61 || userTypeId === 14)
                                                ? !selectedYearId
                                                : !selectedExamType
                                        }
                                        loading={isLoadingYears}
                                    />
                                </div>

                                {userTypeId === 10 && (
                                    <>
                                        <div>
                                            <DropdownComponent
                                                label="District"
                                                options={districtOptions}
                                                value={selectedDistrictId}
                                                onChange={handleDistrictChange}
                                                disabled={!selectedExamId}
                                                loading={isLoadingDistricts}
                                                required={false}
                                            />
                                        </div>

                                        {selectedDistrictId && (
                                            <div>
                                                <DropdownComponent
                                                    label="Institute"
                                                    options={instituteOptionsByDistrict}
                                                    value={selectedInstituteId}
                                                    onChange={(value) => {
                                                        setSelectedInstituteId(value);
                                                        if (value) {
                                                            setSelectedInstitute(null);
                                                        }
                                                    }}
                                                    disabled={!selectedDistrictId}
                                                    loading={isLoadingInstitutes}
                                                    required={false}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="mt-8 flex justify-center gap-4">
                                <Button
                                    variant='success'
                                    onClick={fetchCourseList}
                                    disabled={!selectedExamId}
                                >
                                    Search
                                </Button>
                                {(selectedExamId || showInstituteList || showCourseList || showResults || instituteListData.length > 0 || courseListData.length > 0) && (
                                    <Button
                                        variant="danger"
                                        onClick={handleReset}
                                    >
                                        <RotateCcw size={16} className="mr-2" />
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </fieldset>
                    )}

                    {loadingCourseList && (
                        // <div className="mt-6 text-center py-12 bg-white rounded-lg border border-gray-200">
                        //     <div className="flex justify-center items-center">
                        //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                        //         <p className="text-gray-500 text-lg ml-3">{userTypeId==61? 'Loading':''}</p>
                        //     </div>
                        // </div>
                        <Loader/>
                    )}

                    {loadingResults && (
                        <div className="mt-6 text-center py-12 bg-white rounded-lg border border-gray-200">
                            <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                                <p className="text-gray-500 text-lg ml-3">Loading result data...</p>
                            </div>
                        </div>
                    )}

                    {showInstituteList && !loadingCourseList && (
                        <div className="mt-6">
                            <fieldset className="mb-4 rounded-md border border-gray-300 p-4 bg-white overflow-visible relative">
                                <legend
                                    className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color || "bg-green-600"}`}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Institutes
                                </legend>

                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm text-gray-500">
                                        Total: {instituteListData.length} Institute
                                        {instituteListData.length !== 1 ? "s" : ""}
                                    </div>
                                </div>

                                <FilteredTableComponent
                                    data={instituteListData.map(renderInstituteRow)}
                                    columns={instituteColumns}
                                    tableId="Institute List"
                                    maxHeight="500px"
                                    showExcel={false}
                                    showPDF={false}
                                    emptyStateMessage="No Institutes Found"
                                    emptyStateSubMessage="Try adjusting your search criteria"
                                />
                            </fieldset>
                        </div>
                    )}

                    {showCourseList && !loadingCourseList && (
                        <div className="mt-6">
                            <fieldset className="mb-4 rounded-md border border-gray-300 p-4 bg-white overflow-visible relative">
                                <legend
                                    className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color || "bg-green-600"}`}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Courses
                                </legend>

                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm text-gray-500">
                                        Total: {courseListData.length} Course
                                        {courseListData.length !== 1 ? "s" : ""}
                                    </div>
                                </div>

                                <FilteredTableComponent
                                    data={courseListWithActions}
                                    columns={courseListColumns}
                                    filterColumns={courseListFilterableColumns}
                                    tableId="Course List Report Gazet"
                                    maxHeight="500px"
                                    emptyStateMessage="No Courses Found"
                                    emptyStateSubMessage="Try adjusting your search criteria"
                                    showExcel={false}
                                    showPDF={false}
                                />
                                {(userTypeId === 14 || userTypeId === 10) && (
                                    <div className="flex justify-end mt-4">
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={handleBackToInstituteList}
                                        >
                                            ← Back to Institutes
                                        </Button>
                                    </div>
                                )}
                            </fieldset>
                        </div>
                    )}

                    {showResults && !loadingResults && (
                        <div className="mt-6 space-y-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 shadow-sm">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-gray-200">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Details</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Course Name</div>
                                                <div className="font-medium text-gray-800 break-words">
                                                    {`${courseDetails.courseName} `}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Examination</div>
                                                <div className="font-medium text-gray-800">
                                                    {courseDetails.admissionSession}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Admission Statistics</h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            <div className="text-center p-3 lg:p-4 bg-blue-50 rounded-lg">
                                                <div className="text-xl lg:text-2xl font-bold text-blue-600 mb-1">
                                                    {admissionStats.totalCandidates}
                                                </div>
                                                <div className="text-xs text-gray-600 font-medium">Total Candidates</div>
                                            </div>
                                            <div className="text-center p-3 lg:p-4 bg-green-50 rounded-lg">
                                                <div className="text-xl lg:text-2xl font-bold text-green-600 mb-1">
                                                    {admissionStats.pass}
                                                </div>
                                                <div className="text-xs text-gray-600 font-medium">Pass</div>
                                            </div>
                                            <div className="text-center p-3 lg:p-4 bg-gray-100 rounded-lg">
                                                <div className="text-xl lg:text-2xl font-bold text-gray-600 mb-1">
                                                    {admissionStats.fail}
                                                </div>
                                                <div className="text-xs text-gray-600 font-medium">Fail</div>
                                            </div>
                                            <div className="text-center p-3 lg:p-4 bg-yellow-50 rounded-lg">
                                                <div className="text-xl lg:text-2xl font-bold text-yellow-600 mb-1">
                                                    {admissionStats.hold}
                                                </div>
                                                <div className="text-xs text-gray-600 font-medium">Hold</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 w-full relative" style={{ zIndex: 1 }}>
                                    <FilteredTableComponent
                                        data={courseSubjectsData}
                                        columns={courseSubjectsColumns}
                                        tableId="Course Subjects Report Gazet"
                                        maxHeight="500px"
                                        emptyStateMessage="No Subject Data Found"
                                        emptyStateSubMessage="Try adjusting your search criteria"
                                        showExcel={false}
                                        showPDF={false}
                                    />
                                </div>

                                <div className="flex justify-end items-end">
                                    <Button
                                        size='sm'
                                        variant='danger'
                                        onClick={handleBackToCourseList}
                                    >
                                        ← Back to Courses
                                    </Button>
                                </div>
                            </div>

                            <fieldset className='mb-4 rounded-md border border-gray-300 p-4 bg-white overflow-visible relative'>
                                <legend className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color || 'bg-green-600'}`}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Result ({tableData.length} Candidate{tableData.length !== 1 ? 's' : ''})
                                </legend>
                                <div className="mt-2 w-full relative" style={{ zIndex: 1 }}>
                                    <FilteredTableComponent
                                        data={tableData}
                                        columns={dynamicTableColumns.length > 0 ? dynamicTableColumns : baseTableColumns}
                                        filterColumns={filterableColumns}
                                        tableId="Result Report Gazet"
                                        maxHeight="500px"
                                        emptyStateMessage="No Result Found"
                                        emptyStateSubMessage="Try adjusting your search criteria"
                                        showExcel={true}
                                        showPDF={true}
                                    />
                                </div>
                            </fieldset>
                        </div>
                    )}

                    {userTypeId === 10 && hasSelection && !showResults && showInstituteList && (
                        <div className="flex justify-center pt-4">
                            <Button
                                size="md"
                                onClick={handleDownloadGazettePdf}
                                variant="success"
                                disabled={generatingPdf || !rawApiData.length}
                            >
                                <FileText size={18} />
                                {generatingPdf ? 'Generating PDF...' : 'Print Gazette Report'}
                            </Button>
                        </div>
                    )}

                    {userTypeId === 61 && !showResults && showCourseList && hasSelection && (
                        <div className="flex justify-center pt-4">
                            <Button
                                size="md"
                                onClick={handleDownloadGazettePdf}
                                variant="success"
                                disabled={generatingPdf || !rawApiData.length}
                            >
                                <FileText size={18} />
                                {generatingPdf ? 'Generating PDF...' : 'Print Gazette Report'}
                            </Button>
                        </div>
                    )}

                    {userTypeId === 14 && !showResults && showInstituteList && hasSelection && (
                        <div className="flex justify-center pt-4">
                            <Button
                                size="md"
                                onClick={handleDownloadGazettePdf}
                                variant="success"
                                disabled={generatingPdf || !rawApiData.length}
                            >
                                <FileText size={18} />
                                {generatingPdf ? 'Generating PDF...' : 'Print Gazette Report'}
                            </Button>
                        </div>
                    )}
                </div>

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
                overflow-y: visible !important;
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
                
                /* Prevent text wrapping */
                .overflow-x-auto th,
                .overflow-x-auto td {
                white-space: nowrap;
                padding: 12px 8px;
                overflow: hidden;
                text-overflow: ellipsis;
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
        </>
    );
};

export default ReportGazet;