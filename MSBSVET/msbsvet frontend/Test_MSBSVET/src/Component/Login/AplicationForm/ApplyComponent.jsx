import { useState, useEffect } from "react";
import DropdownComponent from '../../formcomponent/DropdownComponent';
import { useLocation, useNavigate } from 'react-router-dom';
import agent from '../../../lib/api/agent';
import Swal from 'sweetalert2';
import { GetInstituteIDByInstituteCode, GetInstituteDetails, SearchInstitute } from '../../../Endpoints_All/Institute/institute';
import { ApplyForCourse, GetAppliedCourseByCandidateId, DeleteAppliedCourse, GetAppliedMainCourse, GetAppliedCourses, GetMainCourseAppliedFor } from '../../../Endpoints_All/Candidate/courseApplication';
import { GetApplicationIDByApplicationIDDisplay, API_BASE, GetAdmissionYear } from '../../../Endpoints_All/Base/masterData';
import { getIp } from '../../../Endpoints_All/Utils/fileUpload';
import { useAuth } from "../../../Hooks/AuthContext";
// Course Details Popup Modal Component
const CourseDetailsModal = ({ isOpen, onClose, instituteCode, courseCode, courseID }) => {
    const [courseDetails, setCourseDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);



    const fetchCourseDetails = async () => {
        if (!instituteCode || !courseCode) return;

        try {
            setLoading(true);
            setError(null);

            // Step 1: Get Institute ID from Institute Code
            const instituteResponse = await fetch(`${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`);
            const instituteJson = await instituteResponse.json();

            if (instituteJson?.Status !== "Success" || !instituteJson?.Data) {
                throw new Error("Failed to fetch Institute ID");
            }

            const instituteId = instituteJson.Data;

            // Step 2: Get Institute Details using Institute ID and Course Code
            const detailsResponse = await fetch(`${GetInstituteDetails}/${instituteId}/${courseID}`);
            const detailsJson = await detailsResponse.json();


            if (detailsJson?.Status === "Success" && detailsJson?.Data) {
                setCourseDetails(detailsJson.Data);
            } else {
                throw new Error("Failed to fetch course details");
            }

        } catch (error) {
            console.error('Error fetching course details:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && instituteCode && courseCode) {
            fetchCourseDetails();
        }
    }, [isOpen, instituteCode, courseCode]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-blue-900 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-semibold">Course Details</h2>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading course details...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-600 text-center py-4">
                            Error: {error}
                        </div>
                    )}

                    {courseDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Institute Name:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.InstituteName || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Institute Address:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.InstituteAddress || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.City || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pin Code:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.PinCode || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Taluka:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.Taluka || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">District:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.District || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Region:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.Region || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.State || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone No.:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.PhoneNo || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fax No.:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.FaxNo || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">E-Mail ID:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.EMailID || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Web Site:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.WebSite || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Course Name:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.CourseName || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Course Code:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.CourseCode || courseCode}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.Duration || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Time / Part Time:</label>
                                    <p className="mt-1 text-sm text-gray-900">{courseDetails.FullTimePartTime || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Institute Search Form Component
const InstituteSearchForm = () => {
    // Get applicationIdDisplay from navigation state
    const location = useLocation();
    const { applicationIdDisplay } = location.state || {};
    const { applicationId } = location.state || {};
    const { admissionYearID } = location.state || {};

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        regionID: '0',
        districtID: '0',
        talukaID: '0',
        sectorID: '0',
        courseTypeID: '0',
        entryQualificationID: '0',
        courseID: '0'
    });

    const [dropdownOptions, setDropdownOptions] = useState({

        region: [{ value: '0', label: 'All' }],
        district: [{ value: '0', label: 'All' }],
        taluka: [{ value: '0', label: 'All' }],
        sector: [{ value: '0', label: 'All' }],
        courseType: [{ value: '0', label: 'All' }],
        entryQualification: [{ value: '0', label: 'All' }],
        course: [{ value: '0', label: 'All' }]
    });

    const [loading, setLoading] = useState({
        region: false,
        district: false,
        taluka: false,
        sector: false,
        courseType: false,
        entryQualification: false,
        course: false
    });

    const [appliedCourses, setAppliedCourses] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [applying, setApplying] = useState({});
    const [errors, setErrors] = useState({});

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInstituteCode, setSelectedInstituteCode] = useState('');
    const [selectedCourseCode, setSelectedCourseCode] = useState('');
    const [selectedCourseID, setSelectedCourseID] = useState(null);

    const [masterData, setMasterData] = useState({
        district: [],
        taluka: []
    });

    // Session data
    const { userInfo } = useAuth();

    const userLoginID = userInfo?.UserLoginID;
    const userID = userInfo?.UserID;


    // Handle Institute Code click
    const handleInstituteCodeClick = (instituteCode, courseCode, courseID) => {
        setSelectedInstituteCode(instituteCode);
        setSelectedCourseCode(courseCode);
        setSelectedCourseID(courseID);
        setIsModalOpen(true);
    };

    // Generic API fetch function
    const fetchDropdownData = async (endpoint, key, isCascading = false) => {
        try {
            setLoading(prev => ({ ...prev, [key]: true }));

            const response = await fetch(`${API_BASE}/${endpoint}`);
            const json = await response.json();

            const items = Array.isArray(json?.Data) ? json.Data : [];
            const filteredItems = items.filter(item => item.Group !== '-1');

            if (isCascading) {
                // Keep the raw list (with Group = parent id) for later filtering
                setMasterData(prev => ({ ...prev, [key]: filteredItems }));

                // Nothing selected in the parent yet, so show just "All"
                setDropdownOptions(prev => ({
                    ...prev,
                    [key]: [{ value: '0', label: 'All' }]
                }));
            } else {
                const transformedData = [
                    { value: '0', label: 'All' },
                    ...filteredItems.map(item => ({
                        value: item.Value,
                        label: item.Text
                    }))
                ];

                setDropdownOptions(prev => ({
                    ...prev,
                    [key]: transformedData
                }));
            }
        } catch (error) {
            console.error(`Error fetching ${key}:`, error);
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    // GetMasterRegionDistrict: Value = districtId, Group = regionId
    const filterDistrictsByRegion = (regionID) => {
        if (!regionID || regionID === '0') {
            setDropdownOptions(prev => ({
                ...prev,
                district: [{ value: '0', label: 'All' }]
            }));
            return;
        }

        const filtered = masterData.district
            .filter(item => item.Group === regionID)
            .map(item => ({ value: item.Value, label: item.Text }));

        setDropdownOptions(prev => ({
            ...prev,
            district: [{ value: '0', label: 'All' }, ...filtered]
        }));
    };

    // GetMasterTaluka: Value = talukaId, Group = districtId
    const filterTalukasByDistrict = (districtID) => {
        if (!districtID || districtID === '0') {
            setDropdownOptions(prev => ({
                ...prev,
                taluka: [{ value: '0', label: 'All' }]
            }));
            return;
        }

        const filtered = masterData.taluka
            .filter(item => item.Group === districtID)
            .map(item => ({ value: item.Value, label: item.Text }));

        setDropdownOptions(prev => ({
            ...prev,
            taluka: [{ value: '0', label: 'All' }, ...filtered]
        }));
    };

    // Get Application ID from ApplicationIDDisplay
    const getApplicationID = async (applicationIdDisplay) => {
        try {
            const response = await fetch(`${GetApplicationIDByApplicationIDDisplay}?ApplicationIDDisplay=${applicationIdDisplay}`);
            const json = await response.json();

            if (json?.Status === "Success" && json?.Data) {
                return json.Data.ApplicationID || json.Data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching Application ID:', error);
            return null;
        }
    };

    // Check if course is already applied
    const isCourseApplied = (courseID, instituteID) => {
        return appliedCourses.some(course =>
            course.CourseID === courseID && course.InstituteID === instituteID
        );
    };


    const getCurrentAdmissionYearId = async () => {
        try {
            const response = await fetch(GetAdmissionYear);
            const json = await response.json();

            if (json?.Status === "Success" && Array.isArray(json?.Data)) {
                const currentYear = json.Data.find(y => y.isCurrent === true);
                return currentYear ? currentYear.YearId : null;
            }
            return null;
        } catch (error) {
            console.error("Error fetching Admission Year:", error);
            return null;
        }
    };

    // helper to get IP from API (using your getIp wrapper)
    const getCurrentIp = async () => {
        try {
            const response = await agent.get(getIp, {
                headers: {
                    accept: "*/*",
                },
            });
            // API returns: { "ip": "152.57.248.36" }
            return response.data?.ip || null;
        } catch (error) {
            console.error("Error fetching IP address:", error);
            return null;
        }
    };
    // Handle Apply Course
    const handleApplyCourse = async (institute) => {
        if (!userID || !userLoginID) {
            Swal.fire({
                icon: 'error',
                title: 'Session Expired',
                text: 'User information not found. Please login again.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!applicationIdDisplay) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Navigation',
                text: 'Application ID not found. Please access this page through the proper channel.',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Check if already applied
        if (isCourseApplied(institute.CourseID, institute.InstituteID)) {
            Swal.fire({
                icon: 'info',
                title: 'Already Applied',
                html: `You've already applied for <b>${institute.CourseName}</b> at <b>${institute.InstituteName}</b>.`,
                confirmButtonText: 'OK'
            });
            return;
        }

        const applyKey = `${institute.InstituteID}-${institute.CourseID}`;

        try {
            setApplying(prev => ({ ...prev, [applyKey]: true }));

            // First get ApplicationID from ApplicationIDDisplay
            const applicationID = await getApplicationID(applicationIdDisplay);

            if (!applicationID) {
                Swal.fire({
                    icon: 'error',
                    title: 'Application Error',
                    html: 'Failed to get <b>Application ID</b>. Please try again or contact support if the problem persists.',
                    confirmButtonText: 'Try Again',
                    footer: '<a href="/contact">Need help?</a>'
                });
                return;
            }

            const admissionYearId = await getCurrentAdmissionYearId();
            if (!admissionYearId) {
                Swal.fire({
                    icon: "error",
                    title: "Admission Year Error",
                    text: "Failed to get current admission year. Please try again.",
                    confirmButtonText: "OK",
                });
                return;
            }

            const ip = await getCurrentIp();
            if (!ip) {
                Swal.fire({
                    icon: "error",
                    title: "IP Error",
                    text: "Failed to get IP address. Please try again.",
                    confirmButtonText: "OK",
                });
                return;
            }

            // Prepare apply course payload
            const applyPayload = {
                CandidateID: parseInt(userID),
                CourseID: parseInt(institute.CourseID),
                CollegeID: parseInt(institute.InstituteID),
                ApplicationID: parseInt(applicationID),
                AdmissionYearID: admissionYearId,
                UserLoginID: userLoginID,
                IPAddress: ip,
                PageCode: "ApplyCourse",
            };


            // const response = await fetch(ApplyForCourse, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify(applyPayload)
            // });

            const response = await agent.post(ApplyForCourse, applyPayload, {
                headers: {
                    "Content-Type": "application/json"
                }
            });


            const result = response.data;
            if (result?.Status === "Success") {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Course applied successfully!',
                }).then(async () => {
                    // Refresh applied courses list after alert is closed
                    await fetchAppliedCourses();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result?.Message || 'Failed to apply for course. Please try again.',
                });
            }

        } catch (error) {
            console.error('Apply course error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while applying for the course. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setApplying(prev => ({ ...prev, [applyKey]: false }));
        }
    };

    // Handle search
    const handleSearch = async () => {
        try {
            setSearching(true);

            const isSTTResponse = await agent.get(`${GetMainCourseAppliedFor}?applicationID=${applicationId}`);
            let isSTT;
            if (isSTTResponse?.data?.Status == 'Success' && isSTTResponse?.data?.Data != 0) {
                isSTT = isSTTResponse?.data?.Data || 0;
            }

            // Build request body with default values (0 for empty fields)
            const searchParams = {
                regionID: formData.regionID ? parseInt(formData.regionID) : 0,
                districtID: formData.districtID ? parseInt(formData.districtID) : 0,
                talukaID: formData.talukaID ? parseInt(formData.talukaID) : 0,
                sectorID: formData.sectorID ? parseInt(formData.sectorID) : 0,
                courseTypeID: formData.courseTypeID ? parseInt(formData.courseTypeID) : 0,
                courseID: formData.courseID ? parseInt(formData.courseID) : 0,
                entryQualificationID: formData.entryQualificationID ? parseInt(formData.entryQualificationID) : 0,
                fullPartTime: formData.fullPartTime ? formData.fullPartTime : "",
                instituteCode: formData.instituteCode ? formData.instituteCode : "",
                instituteID: formData.instituteID ? parseInt(formData.instituteID) : 0,
                isForSTT: isSTT || 0
            };


            // const response = await fetch(
            //     SearchInstitute,
            //     {
            //         method: "POST",
            //         headers: {
            //             "Content-Type": "application/json"
            //         },
            //         body: JSON.stringify(searchParams)
            //     }
            // );

            const response = await agent.post(SearchInstitute, searchParams, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response?.data?.Status === "Success" && response?.data?.Data) {
                const result = response.data;

                // Handle different response formats
                let dataArray = [];
                if (result?.Data && Array.isArray(result.Data)) {
                    dataArray = result.Data;
                } else if (Array.isArray(result)) {
                    dataArray = result;
                } else if (result) {
                    dataArray = [result];
                }

                setSearchResults(dataArray);

                if (dataArray.length === 0) {
                }
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            Swal.fire({
                icon: 'error',
                title: 'Search Error',
                text: 'Error occurred while searching institutes. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setSearching(false);
        }
    };

    // Fetch applied courses function
    const fetchAppliedCourses = async () => {
        try {
            if (!userID) return;

            //const response = await fetch(`${GetAppliedCourseByCandidateId}?candidateId=${userID}`);
            //const json = await response.json();

            const response = await agent.get(GetAppliedCourses, {
                params: {
                    candidateId: userID,
                    applicationId: applicationId,
                    admissionYearID: admissionYearID
                }
            });

            if (response?.data?.Status === "Success" && Array.isArray(response.data.Data)) {
                setAppliedCourses(response.data.Data);
            } else {
                setAppliedCourses([]);
            }
        } catch (error) {
            console.error("Error fetching applied courses:", error);
            setAppliedCourses([]);
        }
    };

    // Delete course function
    const handleDeleteCourse = async (course) => {
        if (!userID || !userLoginID) {
            alert("User info not found.");
            return;
        }

        const { value: confirmDelete } = await Swal.fire({
            title: 'Confirm Deletion',
            html: `Are you sure you want to delete <b>"${course.Course}"</b> from <b>"${course.InstituteName}"</b>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            focusConfirm: false,
            allowOutsideClick: false
        });

        if (!confirmDelete) return;

        try {
            const appliedCoursesResponse = await agent.get(
                GetAppliedMainCourse,
                {
                    params: {
                        candidateId: userID
                    }
                }
            );

            const appliedCoursesData = appliedCoursesResponse.data;

            // ✅ Extract Data[0] safely
            const appliedCourse = appliedCoursesData?.Data?.[0];

            if (!appliedCourse) {
                alert("No applied course data found.");
                return;
            }

            // Prepare delete payload with the fetched data
            const deletePayload = {
                AdmissionYearID: appliedCourse.AdmissionYearID,
                ApplicationID: appliedCourse.ApplicationID,
                CandidateID: userID,
                CollegeID: course.InstituteID,
                CourseID: course.CourseID,
                IPAddress: "127.0.0.1",
                PageCode: "ApplyCourse",
                UserLoginID: userLoginID
            };


            const response = await agent.delete(
                DeleteAppliedCourse,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "*/*"
                    },
                    data: deletePayload // body goes under `data` in agent.delete
                }
            );

            if (response.data?.Status === "Success") {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Course deleted successfully.',
                    timer: 3000,  // Auto close after 3 seconds
                    showConfirmButton: false
                });
                // Remove the course from local state without API re-fetch
                setAppliedCourses(prevCourses =>
                    prevCourses.filter(c =>
                        !(c.CourseID === course.CourseID && c.InstituteID === course.InstituteID)
                    )
                );
            } else {
                alert(response.data?.Message || "Failed to delete course.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting the course.");
        }
    };
    // Load initial dropdown data
    useEffect(() => {
        fetchDropdownData('GetMasterRegion', 'region');
        fetchDropdownData('GetMasterRegionDistrict', 'district', true); // cascading
        fetchDropdownData('GetMasterTaluka', 'taluka', true);           // cascading
        fetchDropdownData('GetMasterSector', 'sector');
        fetchDropdownData('GetMasterCourseType', 'courseType');
        fetchDropdownData('GetMasterEntryQualification', 'entryQualification');
        fetchDropdownData('GetMasterCourse', 'course');
        fetchAppliedCourses();
    }, []);

    // Handle form field changes
    const handleChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'regionID') {
                updated.districtID = '0';
                updated.talukaID = '0';
            }
            if (field === 'districtID') {
                updated.talukaID = '0';
            }
            return updated;
        });

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: false }));
        }

        if (field === 'regionID') {
            filterDistrictsByRegion(value);
            setDropdownOptions(prev => ({
                ...prev,
                taluka: [{ value: '0', label: 'All' }]
            }));
        }

        if (field === 'districtID') {
            filterTalukasByDistrict(value);
        }
    };

    // Handle reset
    const handleReset = () => {
        setFormData({
            regionID: '0',
            districtID: '0',
            talukaID: '0',
            sectorID: '0',
            courseTypeID: '0',
            entryQualificationID: '0',
            courseID: '0'
        });
        setDropdownOptions(prev => ({
            ...prev,
            district: [{ value: '0', label: 'All' }],
            taluka: [{ value: '0', label: 'All' }]
        }));
        setSearchResults([]);
        setErrors({});
    };

    // to navigate back to main course page 
    const navigateToMainCoursePage = () => {
        navigate('/Candidate/MainCourseAdmissionApply', {
            state: {
                from: 'training-application'
            }
        });
    };

    return (
        <div className="max-w-full mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Course Details Modal */}
            <CourseDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                instituteCode={selectedInstituteCode}
                courseCode={selectedCourseCode}
                courseID={selectedCourseID}
            />

            {/* Search Institute Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="bg-gray-600 text-white px-4 py-2 rounded-t-lg -mx-6 -mt-6 mb-6">
                    <h2 className="text-lg font-semibold">Search Institute</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Region Dropdown */}
                    <DropdownComponent
                        label="Region"
                        value={formData.regionID}
                        onChange={(value) => handleChange('regionID', value)}
                        options={dropdownOptions.region}
                        error={errors.regionID}
                        loading={loading.region}
                    />

                    {/* District Dropdown */}
                    <DropdownComponent
                        label="District"
                        value={formData.districtID}
                        onChange={(value) => handleChange('districtID', value)}
                        options={dropdownOptions.district}
                        error={errors.districtID}
                        loading={loading.district}
                    />

                    {/* Taluka Dropdown */}
                    <DropdownComponent
                        label="Taluka"
                        value={formData.talukaID}
                        onChange={(value) => handleChange('talukaID', value)}
                        options={dropdownOptions.taluka}
                        error={errors.talukaID}
                        loading={loading.taluka}
                    />

                    {/* Sector Dropdown */}
                    <DropdownComponent
                        label="Sector"
                        value={formData.sectorID}
                        onChange={(value) => handleChange('sectorID', value)}
                        options={dropdownOptions.sector}
                        error={errors.sectorID}
                        loading={loading.sector}
                    />

                    {/* Course Type Dropdown */}
                    <DropdownComponent
                        label="Course Type"
                        value={formData.courseTypeID}
                        onChange={(value) => handleChange('courseTypeID', value)}
                        options={dropdownOptions.courseType}
                        error={errors.courseTypeID}
                        loading={loading.courseType}
                    />

                    {/* Entry Qualification Dropdown */}
                    <DropdownComponent
                        label="Entry Qualification"
                        value={formData.entryQualificationID}
                        onChange={(value) => handleChange('entryQualificationID', value)}
                        options={dropdownOptions.entryQualification}
                        error={errors.entryQualificationID}
                        loading={loading.entryQualification}
                    />

                    {/* Course Dropdown */}
                    <DropdownComponent
                        label="Course"
                        value={formData.courseID}
                        onChange={(value) => handleChange('courseID', value)}
                        options={dropdownOptions.course}
                        error={errors.courseID}
                        loading={loading.course}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {searching ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Searching...
                            </>
                        ) : (
                            'Search Institute'
                        )}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Search Results Table Section */}
            {searchResults.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">


                    {/* Table Container with Scroll */}
                    {searchResults.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="bg-green-600 text-white px-4 py-2 rounded-t-lg -mx-6 -mt-6 mb-6">
                                <h2 className="text-lg font-semibold">Institute List</h2>
                            </div>

                            {/* Table Container - Only Vertical Scroll */}
                            <div className="overflow-y-auto max-h-96 border border-gray-300 rounded-lg shadow-sm">
                                <table className="w-full bg-white table-fixed">
                                    {/* Table Header */}
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="w-12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Sr.
                                            </th>
                                            <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Region
                                            </th>
                                            <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                District
                                            </th>
                                            <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Inst. Code
                                            </th>
                                            <th className="w-120 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Institute Name
                                            </th>
                                            <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Course Code
                                            </th>
                                            <th className="w-100 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Course
                                            </th>
                                            <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Type
                                            </th>
                                            <th className="w-12 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Intake
                                            </th>
                                            <th className="w-12 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Vacancy
                                            </th>
                                            <th className="w-28 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    {/* Table Body */}
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {searchResults.map((institute, index) => {

                                            const applyKey = `${institute.InstituteID}-${institute.CourseID}`;
                                            const isApplied = isCourseApplied(institute.CourseID, institute.InstituteID);
                                            const isApplying = applying[applyKey];

                                            return (
                                                <tr key={`${institute.InstituteID}-${institute.CourseID}-${index}`} className="hover:bg-gray-50">
                                                    {/* Sr. No. */}
                                                    <td className="px-2 py-3 text-sm text-gray-900 border-b">
                                                        {index + 1}
                                                    </td>

                                                    {/* Region */}
                                                    <td className="px-2 py-3 text-sm text-gray-900 border-b">
                                                        <div className="truncate" title={institute.Region}>
                                                            {institute.Region || '-'}
                                                        </div>
                                                    </td>

                                                    {/* District */}
                                                    <td className="px-2 py-3 text-sm text-gray-900 border-b">
                                                        <div className="truncate" title={institute.District}>
                                                            {institute.District || '-'}
                                                        </div>
                                                    </td>

                                                    {/* Institute Code */}
                                                    <td className="px-2 py-3 text-sm border-b">
                                                        <button
                                                            onClick={() => handleInstituteCodeClick(institute.InstituteCode, institute.CourseCode, institute.CourseID)}
                                                            className="text-blue-600 hover:text-blue-800 underline truncate block w-full text-left"
                                                            title={institute.InstituteCode}
                                                        >
                                                            {institute.InstituteCode || '-'}
                                                        </button>
                                                    </td>

                                                    {/* Institute Name */}
                                                    <td className="px-2 py-3 text-sm text-gray-900 border-b">
                                                        <div className="truncate" title={institute.InstituteName}>
                                                            {institute.InstituteName || '-'}
                                                        </div>
                                                    </td>

                                                    {/* Course Code */}
                                                    <td className="px-2 py-3 text-sm text-gray-900 border-b">
                                                        <div className="truncate" title={institute.CourseCode}>
                                                            {institute.CourseCode || '-'}
                                                        </div>
                                                    </td>

                                                    {/* Course */}
                                                    <td className="px-2 py-3 text-sm text-gray-900 border-b">
                                                        <div className="truncate" title={institute.Course}>
                                                            {institute.Course || '-'}
                                                        </div>
                                                    </td>

                                                    {/* Full Time / Part Time */}
                                                    <td className="px-2 py-3 text-sm border-b">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full truncate ${institute.FullTimePartTime === 'FULL TIME'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {institute.FullTimePartTime === 'FULL TIME' ? 'Full Time' : 'Part Time'}
                                                        </span>
                                                    </td>

                                                    {/* Intake */}
                                                    <td className="px-2 py-3 text-sm text-gray-900 border-b text-center">
                                                        {institute.TotalIntake || 0}
                                                    </td>

                                                    {/* Vacancy */}
                                                    <td className="px-2 py-3 text-sm text-gray-900 border-b text-center">
                                                        {institute.CurrentVacancy || 0}
                                                    </td>

                                                    {/* Apply Button */}
                                                    <td className="px-2 py-3 text-sm border-b text-center">
                                                        {isApplied ? (
                                                            <span className="bg-gray-400 text-white px-2 py-1 rounded text-xs font-medium inline-block">
                                                                Applied
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleApplyCourse(institute)}
                                                                disabled={isApplying}
                                                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 inline-flex items-center justify-center gap-1 w-full"
                                                            >
                                                                {isApplying ? (
                                                                    <>
                                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                                        <span className="hidden sm:inline">Applying...</span>
                                                                    </>
                                                                ) : (
                                                                    'Apply'
                                                                )}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Results Summary */}
                            <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
                                <span>
                                    Showing <span className="font-semibold">{searchResults.length}</span> institute{searchResults.length !== 1 ? 's' : ''} found
                                </span>
                                {searchResults.length > 10 && (
                                    <span className="text-xs text-gray-500">
                                        Scroll down to see more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* Applied Courses List Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="bg-gray-600 text-white px-4 py-2 rounded-t-lg -mx-6 -mt-6 mb-6">
                    <h2 className="text-lg font-semibold">Applied Course List</h2>
                </div>

                {appliedCourses.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Institute Code</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Institute Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Course Code</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Course Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Course Type</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Shift</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Full Time / Part Time</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appliedCourses.map((course, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">{course.InstituteCode}</td>
                                        <td className="border border-gray-300 px-4 py-2">{course.InstituteName}</td>
                                        <td className="border border-gray-300 px-4 py-2">{course.CourseCode}</td>
                                        <td className="border border-gray-300 px-4 py-2">{course.Course}</td>
                                        <td className="border border-gray-300 px-4 py-2">{course.CourseType}</td>
                                        <td className="border border-gray-300 px-4 py-2">{course.Shift}</td>
                                        <td className="border border-gray-300 px-4 py-2">{course.FullTimePartTime}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleDeleteCourse(course)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500">No applied courses found.</div>
                )}
            </div>

            {/* Navigation Button */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={navigateToMainCoursePage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Main Course Page
                </button>
            </div>
        </div>
    );
};

export default InstituteSearchForm;