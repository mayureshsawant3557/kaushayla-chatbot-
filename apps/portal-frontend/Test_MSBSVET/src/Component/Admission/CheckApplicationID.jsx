import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
// import agent from '../../../lib/api/agent';
import agent from '../../lib/api/agent';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import { AdmissionAPI, GetCurrentAdmissionYear, admissionApplicationStatus, admissionDetailsAPI, reportingDetailsAPI, reportingDetailsByInstitute } from '../../Endpoints_All/Admission/admission'
import { GetInstituteIDByInstituteCode } from '../../Endpoints_All/Institute/institute'
import { GetCourseByCollogeID, SaveUserActionDetails, GetApplicationIDByApplicationIDDisplay, GetCandidateIDByApplicationID, GetCandidateName } from '../../Endpoints_All/Base/masterData'
import { ThemeContext } from '../Context/ThemeContext';
import { getIp } from '../../Endpoints_All/Utils/fileUpload';
import { useAuth } from "../../Hooks/AuthContext"
import FilteredTableComponent from '../../Component/formcomponent/FilteredTableComponent';
import DropdownComponent from '../../Component/formcomponent/DropdownComponent';

const CheckApplicationID = () => {
    const [searchParams] = useSearchParams();
    const flag = searchParams.get('Flag') || 'ConfirmAdmission';
    const [showNoData, setShowNoData] = useState(false);

    // State variables
    const [admissionYear, setAdmissionYear] = useState('');
    const [course, setCourse] = useState('');
    const [applicationID, setApplicationID] = useState('');
    const [round, setRound] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { color } = useContext(ThemeContext);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");


    // Data states
    const [admissionYears, setAdmissionYears] = useState([]);
    const [courses, setCourses] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [selectAdmissionData, setSelectAdmissionData] = useState([]);
    const [confirmationData, setConfirmationData] = useState([]);
    const [applicationDetails, setApplicationDetails] = useState({ id: '', name: '' });

    // UI states
    const [showSelectAdmission, setShowSelectAdmission] = useState(false);
    const [showCancelFilter, setShowCancelFilter] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showRound, setShowRound] = useState(false);


    const [showCancelAdmissionDetails, setShowCancelAdmissionDetails] = useState(false);
    const [cancelAdmissionData, setCancelAdmissionData] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");


    const { userInfo } = useAuth();
    const user = userInfo;

    // Headers based on flag
    const getHeader = () => {
        switch (flag) {
            case 'ConfirmAdmission':
                return 'Confirm Admission';
            case 'CancelAdmission':
                return 'Cancel Admission';
            case 'PrintAdmissionLetter':
                return 'Print Admission Confirmation Slip';
            case 'PrintAdmissionCancellationLetter':
                return 'Print Admission Cancellation Slip';
            case 'PrintRejectionAdmissionLetter':
                return 'Print Admission Rejection Slip';
            default:
                return 'Check Application ID';
        }
    };

    // API base URL
    const API_BASE_URL = AdmissionAPI
    // Initialize component based on flag
    useEffect(() => {

        fetchIP();
        initializeComponent();
    }, [flag]);

    const fetchIP = async () => {
        try {
            const response = await agent.get(getIp, {
                headers: {
                    accept: "*/*",
                },
            });

            if (response.data?.ip) {
                setIpAddress(response.data.ip);
            } else {
                setIpAddress("0.0.0.0");
            }
        } catch (error) {
            setIpAddress("0.0.0.0");
        }
    };

    const selectAdmissionColumns = [
        {
            key: 'serialNumber',
            header: 'S.N.',
            width: '60px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: false,
            sortable: false
        },
        {
            key: 'ApplicationIDDisplay',
            header: 'APPLICATION ID',
            width: '175px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: true,
            sortable: true
        },
        {
            key: 'CandidateName',
            header: 'CANDIDATE NAME',
            width: '355px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: true,
            sortable: true
        },
        {
            key: 'CourseName',
            header: 'COURSE',
            width: '950px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: true,
            sortable: true
        },
        {
            key: 'District',
            header: 'DISTRICT',
            width: '145px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: true,
            sortable: true
        },
        {
            key: 'ApplicationDate',
            header: 'DATE OF APPLICATION',
            width: '175px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: true,
            sortable: true
        },
        {
            key: 'MobileNo',
            header: 'MOBILE NO',
            width: '140px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: true,
            sortable: true
        },
        {
            key: 'Action',
            header: 'ACTION',
            width: '170px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: false,
            sortable: false
        }
    ];

    const filterableColumns = [
        'CandidateName', 'CourseName', 'ApplicationDate', 'District', 'MobileNo'];

    const selectAdmissionTableColumns = [
        {
            key: 'serialNumber',
            header: 'S.N.',
            width: '70px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: false,
            sortable: false
        },
        {
            key: 'Action',
            header: 'ACTION',
            width: '180px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: false,
            sortable: false
        },
        {
            key: 'CollegeName',
            header: 'INSTITUTE NAME',
            width: '600px',
            className: 'text-left',
            headerClassName: 'text-center',
            searchable: true,
            sortable: true
        },
        {
            key: 'CourseName',
            header: 'COURSE',
            width: '350px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: true,
            sortable: true
        },
        {
            key: 'CourseCode',
            header: 'COURSE CODE',
            width: '180px',
            className: 'text-center',
            headerClassName: 'text-center',
            searchable: true,
            sortable: true
        }
    ];


    const initializeComponent = async () => {
        try {
            setLoading(true);

            // Reset states
            setShowSelectAdmission(false);
            setShowCancelFilter(false);
            setShowConfirmation(false);
            setShowRound(false);

            switch (flag) {
                case 'ConfirmAdmission':
                    setShowRound(false);
                    setShowConfirmation(true);
                    await loadCurrentRoundID();
                    await loadConfirmationData('ConfirmAdmission');
                    break;

                case 'CancelAdmission':
                    setShowCancelFilter(true);
                    setShowConfirmation(true);
                    await loadAdmissionYears();
                    await loadCourses();
                    await loadConfirmationData('CancelAdmission');
                    break;

                case 'PrintAdmissionLetter':
                    setShowConfirmation(true);
                    await loadConfirmationData('PrintAdmissionLetter');
                    break;

                case 'PrintAdmissionCancellationLetter':
                    setShowConfirmation(true);
                    await loadConfirmationData('PrintAdmissionCancellationLetter');
                    break;

                case 'PrintRejectionAdmissionLetter':
                    setShowConfirmation(true);
                    await loadConfirmationData('PrintRejectionAdmissionLetter');
                    break;
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to initialize component', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadCurrentRoundID = async () => {
        try {
            const response = await agent.get(`${API_BASE_URL}/current-round`);
            if (response.data && response.data > 0) {
                setRound(response.data.toString());
            } else if (response.data?.Data && response.data.Data > 0) {
                setRound(response.data.Data.toString());
            } else {
                // Fallback to default round
                setRound('1');
            }
        } catch (error) {
            // Set a default round if API fails
            setRound('1');
        }
    };

    // Load admission years
    const loadAdmissionYears = async () => {
        try {
            const response = await agent.get(GetCurrentAdmissionYear);
            setAdmissionYears(response.data?.Data);
        } catch (error) {
        }
    };

    const loadCourses = async () => {
        try {
            const instituteIDResponse = await agent.get(`${GetInstituteIDByInstituteCode}?InstituteCode=${user.UserLoginID}`);
            const instituteID = instituteIDResponse.data?.Data;

            const response = await agent.get(`${GetCourseByCollogeID}?CollegeID=${instituteID}`);

            // Get courses data and filter out invalid entries
            let coursesData = response.data?.Data || [];

            // Filter out invalid courses (null, undefined, or empty CourseName)
            coursesData = coursesData.filter(course =>
                course &&
                course.CourseID &&
                course.CourseName &&
                course.CourseName.trim() !== '' &&
                course.CourseName !== 'Select Course'
            );

            // Remove duplicate courses based on CourseName
            const uniqueCourses = [];
            const seenCourseNames = new Set();

            for (const course of coursesData) {
                if (!seenCourseNames.has(course.CourseName)) {
                    seenCourseNames.add(course.CourseName);
                    uniqueCourses.push(course);
                }
            }

            // Sort courses alphabetically by CourseName
            uniqueCourses.sort((a, b) => a.CourseName.localeCompare(b.CourseName));

            // Set courses - the "ALL" option will be added separately in the JSX
            setCourses(uniqueCourses);
        } catch (error) {
            setCourses([]);
        }
    };

    const loadConfirmationData = async (reportFlag) => {
        try {
            const instituteIDResponse = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${user.UserLoginID}`
            );
            const instituteID = instituteIDResponse.data?.Data;


            const response = await agent.get(
                `${API_BASE_URL}/reporting-details-by-institute?instituteID=${instituteID}&flag=${reportFlag}`
            );

            setConfirmationData(response.data);
        } catch (error) {
        }
    };

    // Handle search button click
    const handleSearch = async () => {
        setErrorMessage("");
        setShowNoData(false);
        setShowSelectAdmission(false);
        if (!applicationID.trim()) {
            Swal.fire('Validation Error', 'Please Enter Application Form Number.', 'warning');
            return;
        }

        if (showRound && round === '-1') {
            Swal.fire('Validation Error', 'Please Select Round.', 'warning');
            return;
        }
        setShowNoData(false);

        try {
            setLoading(true);

            // Log user action
            await agent.post(SaveUserActionDetails, null, {
                params: {
                    Module: 'Admission',
                    UserLoginID: user.UserLoginID,
                    ApplicationID: applicationID,
                    ActionTaken: flag,
                    IPAddress: ipAddress,
                    PageURL: window.location.href
                }
            });


            switch (flag) {
                case 'ConfirmAdmission':
                    await confirmAdmission();
                    break;
                case 'CancelAdmission':
                    await cancelAdmission();
                    break;
                case 'PrintAdmissionLetter':
                    await printAdmissionLetter();
                    break;
                case 'PrintAdmissionCancellationLetter':
                    await printAdmissionCancellationLetter();
                    break;
                case 'PrintRejectionAdmissionLetter':
                    await printAdmissionRejectionLetter();
                    break;
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmAdmission = async () => {
        try {
            const applicationIDResponse = await agent.get(
                `${GetApplicationIDByApplicationIDDisplay}?applicationIDDisplay=${applicationID}`
            );

            const appID = applicationIDResponse.data?.Data;

            if (!appID || appID === 0) {

                const instituteIDResponse = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${user.UserLoginID}`
                );

                const collegeID = instituteIDResponse.data?.Data;

                const statusResponse = await agent.get(
                    admissionApplicationStatus,
                    {
                        params: {
                            ApplicationID: applicationID,
                            CollegeID: collegeID,
                            UserTypeID: userInfo?.UserTypeID
                        }
                    }
                );

                setErrorMessage(statusResponse.data || "");
                setShowNoData(true);

                return;
            }

            const candidateIDResponse = await agent.get(
                `${GetCandidateIDByApplicationID}?applicationID=${appID}`
            );
            const candidateID = candidateIDResponse.data?.Data;

            const admissionDetailsResponse = await agent.get(
                `${admissionDetailsAPI}/${candidateID}`
            );
            const admissionDetails = admissionDetailsResponse.data;

            if (admissionDetails && admissionDetails.length > 0) {
                setErrorMessage(admissionDetails || "");
                return;
                return;
            }

            const encryptedApplicationID = appID.toString();

            const reportingDetailsResponse = await agent.get(
                reportingDetailsAPI,
                {
                    params: {
                        candidateID: candidateID,
                        applicationID: appID,
                        encryptedApplicationID: encryptedApplicationID,
                        roundID: round || 1,
                        reportingStatus: 'N',
                        userLoginID: user.UserLoginID || '',
                        flag: 'ConfirmAdmission'
                    }
                }
            );

            const reportingDetails = reportingDetailsResponse.data;



            if (reportingDetails && reportingDetails.length > 0) {
                setShowNoData(false);
                const candidateNameResponse = await agent.get(
                    `${GetCandidateName}?candidateID=${candidateID}`
                );
                const candidateName = candidateNameResponse.data?.Data;

                setApplicationDetails({
                    id: applicationID,
                    name: candidateName
                });
                setSelectAdmissionData(reportingDetails);
                setShowSelectAdmission(true);
            } else {
                setShowSelectAdmission(false);
                setShowNoData(true);

                if (user.UserTypeID === 61) {

                    const instituteIDResponse = await agent.get(
                        `${GetInstituteIDByInstituteCode}?InstituteCode=${user.UserLoginID}`
                    );
                    const collegeID = instituteIDResponse.data?.Data;

                    const statusResponse = await agent.get(
                        admissionApplicationStatus,
                        {
                            params: {
                                ApplicationID: appID,
                                CollegeID: collegeID,
                                UserTypeID: userInfo?.UserTypeID
                            }
                        }
                    );


                    const statusMessage =
                        statusResponse.data ||
                        "";

                    setErrorMessage(statusMessage);
                    setShowNoData(true);
                    return;
                } else {
                    setErrorMessage("");
                    setShowNoData(true);
                    return;
                }
            }
        } catch (error) {
            Swal.fire('Error', 'Something went wrong while confirming admission.', 'error');
        }
    };

    const cancelAdmission = async () => {

        try {


            const applicationIDResponse = await agent.get(
                `${GetApplicationIDByApplicationIDDisplay}?applicationIDDisplay=${applicationID}`
            );



            const appID = applicationIDResponse.data?.Data;


            if (!appID || appID === 0) {

                const instituteIDResponse = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${user.UserLoginID}`
                );

                const collegeID = instituteIDResponse.data?.Data;

                const statusResponse = await agent.get(
                    admissionApplicationStatus,
                    {
                        params: {
                            ApplicationID: applicationID,
                            CollegeID: collegeID,
                            UserTypeID: userInfo?.UserTypeID
                        }
                    }
                );

                setErrorMessage(statusResponse.data || "");
                setShowNoData(true);

                return;
            }

            const candidateIDResponse = await agent.get(
                `${GetCandidateIDByApplicationID}?applicationID=${appID}`
            );
            const candidateID = candidateIDResponse.data?.Data;

            // First check if candidate is admitted
            const admissionDetailsResponse = await agent.get(
                `${admissionDetailsAPI}/${candidateID}`
            );
            const admissionDetails = admissionDetailsResponse.data;


            // If candidate is NOT admitted, show message
            if (!admissionDetails || admissionDetails.length === 0) {

                if (user.UserTypeID === 61) {

                    const instituteIDResponse = await agent.get(
                        `${GetInstituteIDByInstituteCode}?InstituteCode=${user.UserLoginID}`
                    );

                    const collegeID = instituteIDResponse.data?.Data;

                    const statusResponse = await agent.get(
                        admissionApplicationStatus,
                        {
                            params: {
                                ApplicationID: appID,
                                CollegeID: collegeID,
                                UserTypeID: userInfo?.UserTypeID
                            }
                        }
                    );


                    const apiMessage = statusResponse.data || "";

                    setErrorMessage(apiMessage);
                    setShowNoData(true);


                    return;
                }

                setShowNoData(true);
                return;
            }

            // Candidate is admitted, now get reporting details for cancellation
            const encryptedApplicationID = appID.toString();

            const reportingDetailsResponse = await agent.get(
                reportingDetailsAPI,
                {
                    params: {
                        candidateID: candidateID,
                        applicationID: appID,
                        encryptedApplicationID: encryptedApplicationID,
                        roundID: 1,
                        reportingStatus: 'Y',
                        userLoginID: user.UserLoginID || '',
                        flag: 'CancelAdmission'
                    }
                }
            );

            const reportingDetails = reportingDetailsResponse.data;

            if (reportingDetails && reportingDetails.length > 0) {
                // Candidate is admitted and reporting details found - show cancellation options
                setShowNoData(false);

                const candidateNameResponse = await agent.get(
                    `${GetCandidateName}?candidateID=${candidateID}`
                );
                const candidateName = candidateNameResponse.data?.Data;

                setApplicationDetails({
                    id: applicationID,
                    name: candidateName
                });
                setSelectAdmissionData(reportingDetails);
                setShowSelectAdmission(true);
            } else {
                if (user.UserTypeID === 61) {
                    const instituteIDResponse = await agent.get(
                        `${GetInstituteIDByInstituteCode}?InstituteCode=${user.UserLoginID}`
                    );
                    const collegeID = instituteIDResponse.data?.Data;

                    const statusResponse = await agent.get(
                        admissionApplicationStatus,
                        { params: { applicationID: appID, collegeID: collegeID, UserTypeID: userInfo?.UserTypeID } }
                    );

                    const statusMessage = statusResponse.data?.Data || statusResponse.data;

                    setErrorMessage(statusMessage || "");
                    setShowNoData(true);
                    return;
                } else {
                    setErrorMessage("");
                    setShowNoData(true);
                    return;
                }
                setShowNoData(true);
            }
        } catch (error) {

            try {
                const instituteIDResponse = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${user.UserLoginID}`
                );

                const collegeID = instituteIDResponse.data?.Data;

                const statusResponse = await agent.get(
                    admissionApplicationStatus,
                    {
                        params: {
                            ApplicationID: applicationID, // display ID entered by user
                            CollegeID: collegeID,
                            UserTypeID: userInfo?.UserTypeID
                        }
                    }
                );

                setErrorMessage(statusResponse.data || "");
                setShowNoData(true);

                return;

            } catch (statusError) {



                setErrorMessage(
                    statusError?.response?.data?.Message ||
                    "Invalid Application Form Number."
                );

                setShowNoData(true);
            }
        }
    };

    const printAdmissionLetter = async () => {

        const applicationIDResponse = await agent.get(`${API_BASE_URL}/GetApplicationIDByApplicationIDDisplay?applicationIDDisplay=${applicationID}`);
        const appID = applicationIDResponse.data;

        if (appID === 0) {
            Swal.fire('Info', 'Invalid Application Form Number.', 'info');
            return;
        }

        const candidateIDResponse = await agent.get(`${API_BASE_URL}/GetCandidateIDByApplicationID?applicationID=${appID}`);
        const candidateID = candidateIDResponse.data;

        const encryptedCandidateID = appID.toString();

        const reportingDetailsResponse = await agent.get(`${API_BASE_URL}/GetReportingDetails`, {
            params: {
                candidateID: candidateID,
                applicationID: appID,
                encryptedApplicationID: encryptedCandidateID,
                roundID: 1,
                reportingStatus: 'Y',
                userLoginID: user.UserLoginID,
                flag: 'PrintAdmissionLetter'
            }
        });

        const reportingDetails = reportingDetailsResponse.data;



        if (!reportingDetails || reportingDetails.length === 0) {
            if (user.UserTypeID === 61) {
                const instituteIDResponse = await agent.get(`${API_BASE_URL}/GetInstituteIDByInstituteCode?userLoginID=${user.UserLoginID}`);
                const collegeID = instituteIDResponse.data;

                const statusResponse = await agent.get(`${API_BASE_URL}/GetAdmissionApplicationStatus?applicationID=${appID}&collegeID=${collegeID}&userTypeID=${userInfo?.UserTypeID}`);
                const statusMessage = statusResponse.data;

                if (statusMessage === '') {
                    Swal.fire('Info', 'This candidate is not admitted in your college.', 'info');
                } else {
                    Swal.fire('Info', statusMessage, 'info');
                }
            } else {
                Swal.fire('Info', 'This candidate is not admitted in any college.', 'info');
            }
        } else {
            const candidateNameResponse = await agent.get(`${API_BASE_URL}/GetCandidateName?candidateID=${candidateID}`);
            const candidateName = candidateNameResponse.data;

            setApplicationDetails({
                id: applicationID,
                name: candidateName
            });
            setSelectAdmissionData(reportingDetails);
            setShowSelectAdmission(true);
        }

    };

    const printAdmissionCancellationLetter = async () => {

        const applicationIDResponse = await agent.get(`${API_BASE_URL}/GetApplicationIDByApplicationIDDisplay?applicationIDDisplay=${applicationID}`);
        const appID = applicationIDResponse.data;

        if (appID === 0) {
            Swal.fire('Info', 'Invalid Application Form Number.', 'info');
            return;
        }

        const candidateIDResponse = await agent.get(`${API_BASE_URL}/GetCandidateIDByApplicationID?applicationID=${appID}`);
        const candidateID = candidateIDResponse.data;

        const encryptedCandidateID = appID.toString();

        const reportingDetailsResponse = await agent.get(`${API_BASE_URL}/GetReportingDetails`, {
            params: {
                candidateID: candidateID,
                applicationID: appID,
                encryptedApplicationID: encryptedCandidateID,
                roundID: 1,
                reportingStatus: 'C',
                userLoginID: user.UserLoginID,
                flag: 'PrintAdmissionCancellationLetter'
            }
        });

        const reportingDetails = reportingDetailsResponse.data;

        if (!reportingDetails || reportingDetails.length === 0) {
            if (user.UserTypeID === 61) {
                const instituteIDResponse = await agent.get(`${API_BASE_URL}/GetInstituteIDByInstituteCode?userLoginID=${user.UserLoginID}`);
                const collegeID = instituteIDResponse.data;

                const statusResponse = await agent.get(`${API_BASE_URL}/GetAdmissionApplicationStatus?applicationID=${appID}&collegeID=${collegeID}&userTypeID=${userInfo?.UserTypeID}`);
                const statusMessage = statusResponse.data;

                if (statusMessage === '') {
                    Swal.fire('Info', 'This candidate is not admitted in your college.', 'info');
                } else {
                    Swal.fire('Info', statusMessage, 'info');
                }
            } else {
                Swal.fire('Info', 'This candidate is not cancelled in any college.', 'info');
            }
        } else {
            const candidateNameResponse = await agent.get(`${API_BASE_URL}/GetCandidateName?candidateID=${candidateID}`);
            const candidateName = candidateNameResponse.data;

            setApplicationDetails({
                id: applicationID,
                name: candidateName
            });
            setSelectAdmissionData(reportingDetails);
            setShowSelectAdmission(true);
        }

    };

    const printAdmissionRejectionLetter = async () => {

        const applicationIDResponse = await agent.get(`${API_BASE_URL}/GetApplicationIDByApplicationIDDisplay?applicationIDDisplay=${applicationID}`);
        const appID = applicationIDResponse.data;

        if (appID === 0) {
            Swal.fire('Info', 'Invalid Application Form Number.', 'info');
            return;
        }

        const candidateIDResponse = await agent.get(`${API_BASE_URL}/GetCandidateIDByApplicationID?applicationID=${appID}`);
        const candidateID = candidateIDResponse.data;

        const encryptedCandidateID = appID.toString();

        const reportingDetailsResponse = await agent.get(`${API_BASE_URL}/GetReportingDetails`, {
            params: {
                candidateID: candidateID,
                applicationID: appID,
                encryptedApplicationID: encryptedCandidateID,
                roundID: 1,
                reportingStatus: 'R',
                userLoginID: user.UserLoginID,
                flag: 'PrintAdmissionRejectionLetter'
            }
        });

        const reportingDetails = reportingDetailsResponse.data;

        if (!reportingDetails || reportingDetails.length === 0) {
            if (user.UserTypeID === 61) {
                const instituteIDResponse = await agent.get(`${API_BASE_URL}/GetInstituteIDByInstituteCode?UserLoginID=${user.UserLoginID}`);
                const collegeID = instituteIDResponse.data;

                const statusResponse = await agent.get(`${API_BASE_URL}/GetAdmissionApplicationStatus?applicationID=${appID}&collegeID=${collegeID}&userTypeID=${userInfo?.UserTypeID}`);
                const statusMessage = statusResponse.data;

                if (statusMessage === '') {
                    Swal.fire('Info', 'This candidate is not admitted in your college.', 'info');
                } else {
                    Swal.fire('Info', statusMessage, 'info');
                }
            } else {
                Swal.fire('Info', 'This candidate is not rejected in any college.', 'info');
            }
        } else {
            const candidateNameResponse = await agent.get(`${API_BASE_URL}/GetCandidateName?candidateID=${candidateID}`);
            const candidateName = candidateNameResponse.data;

            setApplicationDetails({
                id: applicationID,
                name: candidateName
            });
            setSelectAdmissionData(reportingDetails);
            setShowSelectAdmission(true);
        }

    };

    const handleCourseChange = async (selectedCourseId) => {
        setCourse(selectedCourseId);

        try {
            const instituteIDResponse = await agent.get(`${GetInstituteIDByInstituteCode}?InstituteCode=${user.UserLoginID}`);
            const instituteID = instituteIDResponse.data?.Data;

            let filteredData;
            if (selectedCourseId === '1') {
                // Show all data
                const response = await agent.get(`${reportingDetailsByInstitute}?instituteID=${instituteID}&flag=CancelAdmission`);
                filteredData = response.data;
            } else {
                const response = await agent.get(`${reportingDetailsByInstitute}?instituteID=${instituteID}&flag=CancelAdmission&courseId=${selectedCourseId}`);
                filteredData = response.data;
            }
            setConfirmationData(filteredData);
        } catch (error) {
        }
    };


    const handleProceedClick = (proceedUrl) => {
        if (!proceedUrl) return;

        const hrefMatch = proceedUrl.match(/href\s*=\s*"([^"]+)"/);
        if (!hrefMatch) return;

        const url = hrefMatch[1];
        const queryString = url.split("?")[1];

        const params = new URLSearchParams(queryString);

        const clean = (val) => val?.replace(/[^0-9]/g, "");

        const finalParams = {
            P1: clean(params.get("P1")),
            P2: clean(params.get("P2")),
            C1: clean(params.get("C1")),
            C2: clean(params.get("C2")),
            R1: clean(params.get("R1"))
        };


        if (!finalParams.C1 || !finalParams.C2) {
            Swal.fire('Error', 'Invalid data. Missing course or college information.', 'error');
            return;
        }

        // Check if this is for cancel admission
        if (flag === 'CancelAdmission') {
            navigate(
                `/Admission/cancel-admission-details`,
                {
                    state: finalParams
                }
            );
        } else {
            navigate(
                `/Admission/confirm-admission-details`,
                {
                    state: finalParams
                }
            );
        }
    };

    const renderSelectAdmissionCell = (item, column, rowIndex) => {

        if (column.key === 'serialNumber') {
            return rowIndex + 1;
        }

        if (column.key === 'Action') {
            return (
                <button
                    onClick={() => handleProceedClick(item.ProceedURL)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md text-sm whitespace-nowrap"
                >
                    {flag === 'CancelAdmission'
                        ? 'Cancel Admission'
                        : 'Confirm Admission'}
                </button>
            );
        }

        return item[column.key] ?? '';
    };

    const renderSelectAdmissionTableCell = (item, column, rowIndex) => {
        if (column.key === 'serialNumber') {
            return rowIndex + 1;
        }

        if (column.key === 'Action') {
            return (
                <button
                    onClick={() => handleProceedClick(item.ProceedURL)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md text-sm whitespace-nowrap"
                >
                    {flag === 'CancelAdmission'
                        ? 'Cancel Admission'
                        : 'Confirm Admission'}
                </button>
            );
        }

        return item[column.key] ?? '';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="relative w-full bg-white shadow-lg rounded-lg overflow-visible">



                    {/* Search Section UI - Main Container */}
                    <div className="w-full flex justify-center items-start mt-5 px-0">

                        <div className="relative w-full bg-white rounded-xl shadow-md py-7 px-6">


                            {/* Floating Header */}
                            <div
                                className={`absolute -top-4 left-6 ${color} text-white px-5 py-1.5 rounded-md text-md font-semibold shadow`}
                            >
                                {getHeader()}
                            </div>
                            {errorMessage?.trim() && (
                                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                                    {errorMessage}
                                </div>
                            )}
                            {/* Cancel Filter Section */}
                            {showCancelFilter && (
                                <div className="mb-6 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* Admission Year */}
                                        <div>
                                            <DropdownComponent
                                                label="Admission Year"
                                                options={admissionYears.map((year) => ({
                                                    value: year.YearId,
                                                    label: year.YearDisplayName
                                                }))}
                                                value={admissionYear}
                                                onChange={setAdmissionYear}
                                                required={false}
                                                loading={loading}
                                            />
                                        </div>

                                        {/* Course Type */}
                                        <div>
                                            <DropdownComponent
                                                label="Course Type"
                                                options={[
                                                    {
                                                        value: "1",
                                                        label: "All"
                                                    },
                                                    ...courses.map((courseItem) => ({
                                                        value: courseItem.CourseID,
                                                        label: courseItem.CourseName
                                                    }))
                                                ]}
                                                value={course}
                                                onChange={handleCourseChange}
                                                required={false}
                                                loading={loading}
                                            />
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* Form */}

                            <div className="flex flex-col items-center gap-6">
                                {/* Input */}
                                <div className="w-full max-w-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                        Application Form Number <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        value={applicationID}
                                        onChange={(e) => {
                                            let value = e.target.value;
                                            value = value.replace(/\s+/g, '');
                                            setApplicationID(value.toUpperCase());
                                        }}
                                        maxLength={30}
                                        placeholder="Enter Application Number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    />
                                </div>

                                {/* Button */}
                                <div className="flex gap-3 mb-4">
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading}
                                        className="px-8 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 text-sm font-medium disabled:opacity-50"
                                    >
                                        {loading ? 'Searching...' : 'Search'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setApplicationID('');
                                            setErrorMessage('');
                                            setShowNoData(false);
                                            setShowSelectAdmission(false);
                                            setSelectAdmissionData([]);
                                            setApplicationDetails({ id: '', name: '' });
                                        }}
                                        className="px-8 py-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200 text-sm font-medium"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Results Section - Display inside the same container */}
                            {(showSelectAdmission || (showConfirmation && confirmationData.length > 0)) && (
                                <div className="mt-0 pt-0">

                                    {/* Application Details - When search returns results */}
                                    {showSelectAdmission && (
                                        <div className="mt-2 mb-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0">

                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                                        Application ID:
                                                    </label>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {applicationDetails.id}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                                        Candidate Name:
                                                    </label>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {applicationDetails.name}
                                                    </span>
                                                </div>

                                            </div>
                                        </div>
                                    )}



                                    {/* Select Admission Table - When reporting details found */}
                                    {showSelectAdmission && selectAdmissionData.length > 0 && (
                                        <div className="mt-4 w-full">
                                            <FilteredTableComponent
                                                data={selectAdmissionData}
                                                columns={selectAdmissionTableColumns}
                                                renderCell={renderSelectAdmissionTableCell}
                                                searchable={true}
                                                sortable={true}
                                                showSearch={true}
                                                searchPosition="right"
                                                exportable={false}
                                                showExport={false}

                                            />
                                        </div>
                                    )}

                                    {/* Confirmation Data Table - When showing candidate list */}
                                    {showConfirmation && confirmationData.length > 0 && (
                                        <div className="mt-4">
                                            <FilteredTableComponent
                                                data={confirmationData}
                                                columns={selectAdmissionColumns}
                                                renderCell={renderSelectAdmissionCell}
                                                searchable={true}
                                                sortable={true}
                                                showSearch={true}
                                                searchPosition="right"
                                                exportable={false}
                                                showExport={false}
                                                filterColumns={filterableColumns}
                                            />
                                        </div>
                                    )}


                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckApplicationID;

