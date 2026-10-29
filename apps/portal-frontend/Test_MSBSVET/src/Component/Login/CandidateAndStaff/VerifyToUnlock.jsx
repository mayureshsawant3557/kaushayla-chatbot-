import React, { useEffect, useState } from 'react';
import agent from '../../../lib/api/agent';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    GetAppliedMainCourse,
    GetAppliedCourseByCandidateId,
    DeleteAppliedCourseByCandidateId
} from '../../../Endpoints_All/Candidate/courseApplication';
import { getDeviceIP } from '../../../utils/CommonHelper';
import { useAuth } from '../../../Hooks/AuthContext';
import { IsCandidategeteligibilityflag } from '../../../Endpoints_All/Base/formLock';

const VerifyToUnlock = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]); 
    const [currentApplication, setCurrentApplication] = useState(null); 
    const [appliedCourses, setAppliedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [ipAddress, setIpAddress] = useState("");
    const {userInfo} = useAuth();
    const userID = userInfo?.UserID;

    useEffect (() => {
        fetchIP();
        checkUnlockEligibility();
    },[]);

    useEffect(() => {
        const runSequential = async () => {
            const apps = await fetchReqDataToCallAPI();

            if (apps && apps.length > 0) {
                setCurrentApplication(apps[0]); // Store the current application
                await fetchAppliedCourses(apps[0]);
            } else {
                console.warn("No applications found to proceed.");
            }
        };

        runSequential();
    }, []);

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };

        const checkUnlockEligibility = async () => {
                if (!userInfo) return;
        
                try {
                    let url = '';
        
                    if (userType === 'Candidate') {
                        url = `${IsCandidategeteligibilityflag}?candidateId=${userID}&UserLoginID=${userInfo.UserLoginID}`;
                    } else {
                        url = `${IsCandidategeteligibilityflag}?StaffID=${userID}&UserLoginID=${userInfo.UserLoginID}`;
                    }
        
                    const response = await agent.get(url);
                    
        
                    if (response.data.Status === "Success" && response.data.Data && response.data.Data.length > 0) {
                        const eligibilityData = response.data.Data[0];
                        const isAllowed = eligibilityData.IsApplicationFormUnlockAllowed ?? true;
                        const reason = eligibilityData.ReasonForApplicationFormUnlockNotAllowed ?? "";
        
                        setIsUnlockAllowed(isAllowed);
                        setUnlockNotAllowedReason(reason);
        
                    } else {
                        // Default to allowed if API fails or returns no data
                        setIsUnlockAllowed(true);
                        setUnlockNotAllowedReason("");
                    }
                } catch (err) {
                    console.error("Error checking unlock eligibility:", err);
                    // Default to allowed on error to prevent blocking legitimate users
                    setIsUnlockAllowed(true);
                    setUnlockNotAllowedReason("");
        
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        refreshUserInfo();
                    }
                }
            };

    // Fetch applied courses
    const fetchReqDataToCallAPI = async () => {
        try {
            setLoading(true);

            //const response = await fetch(`${GetAppliedMainCourse}?candidateId=${userID}`);
            const response = await agent.get(GetAppliedMainCourse, {
                params: {
                    candidateId: userID
                }
            });
            //const data = await response.data;

            const applicationsData = Array.isArray(response.data?.Data) ? response.data.Data : [];
            

            const transformedApplications = applicationsData.map(app => ({
                id: app.ApplicationID,
                applicationId: app.ApplicationID, // Fixed: use ApplicationID directly, not ApplicationIDDisplay
                applicationIdDisplay: app.ApplicationIDDisplay,
                courseCategory: app.MainCourseName,
                lastUpdated: app.LastModifiedOn ? new Date(app.LastModifiedOn).toLocaleString() : "N/A",
                amount: parseFloat(app.AmountPaid || 0),
                date: app.PaymentDate ? new Date(app.PaymentDate).toLocaleDateString() : "N/A",
                status: app.PaymentStatus || "Unknown",
                isUnlocked: app.IsUnlock === 1,
                isLocked: app.IsLock === 1,
                isFeePaid: app.IsFeePaid === 1,
                isApplied: app.IsApplied === 1,
                mainCourseId: app.MainCourseID,
                candidateId: app.CandidateID,
                admissionYearId: app.AdmissionYearID // Fixed: use the correct field name
            }));

            setApplications(transformedApplications);
            return transformedApplications;
        } catch (error) {
            console.error('Error fetching applied courses:', error);
            alert('Error fetching applied courses. Please try again.');
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };



    const fetchAppliedCourses = async (application) => {
        try {
            if (!application || !application.candidateId) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Applied Courses Found',
                    text: 'Application data is missing or invalid.',
                });
                return;
            }

            const response = await agent.get(
                GetAppliedCourseByCandidateId,
                {
                    params: {
                        candidateId: application.candidateId
                    }
                }
            );

            if (response.data.Status === "Success" && response.data.Data.length > 0) {
                setAppliedCourses(response.data.Data);
                setShowConfirm(true);
            } else {
                navigate('/Candidate/LockApplicationForm', {
                    state: {
                        candidateId: application.candidateId,
                        from: 'training-application'
                    }
                });
            }

        } catch (err) {
            console.error("Error fetching courses", err);
            Swal.fire({
                icon: 'info',
                title: 'No Applied Courses Found',
                text: 'You can Unlock you form',
            }).then(() => {
                navigate('/Candidate/LockApplicationForm', {
                    state: {
                        candidateId: application?.candidateId || null,
                        from: 'training-application'
                    }
                });
            });
        } finally {
            setLoading(false);
        }
    };


    const handleUnlock = async () => {
        // Fixed: Check if currentApplication exists
        if (!currentApplication) {
            alert("Application data not available. Please try again.");
            return;
        }

        try {
            setLoading(true);

            const deleteResponses = [];

            for (const course of appliedCourses) {
                if (!course || !course.CourseID || !course.InstituteID) continue;

                const data = {
                    AdmissionYearID: currentApplication.admissionYearId, // Fixed: use currentApplication
                    ApplicationID: currentApplication.applicationId, // Fixed: use currentApplication and ensure it's a number
                    CandidateID: currentApplication.candidateId, // Fixed: use currentApplication
                    CollegeID: course.InstituteID,
                    CourseID: course.CourseID,
                    IPAddress: ipAddress,
                    PageCode: "1",
                    UserLoginID: userInfo.UserLoginID || ""
                };

                const response = await agent.delete(
                    DeleteAppliedCourseByCandidateId,
                    {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        data
                    }
                );

                deleteResponses.push(response);
            }

            const allSuccessful = deleteResponses.every(
                response => response.data?.Status === "Success"
            );

            if (allSuccessful) {
                alert("All courses deleted successfully.");
                navigate('/Candidate/LockApplicationForm');
            } else {
                alert("Some courses could not be deleted. Please try again.");
            }

        } catch (err) {
            console.error("Error during delete:", err);
            alert("Failed to delete courses. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/Candidate/MainCourseAdmissionApply');
    };

    if (loading) {
        return (
            <div className="text-center mt-10 text-gray-700 text-lg">
                Loading application details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-10 text-red-600 font-medium">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {showConfirm && (
                <>
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700 text-sm">
                            Candidate has already applied for Admission to below mentioned Institute.
                            If you wish to Unlock Application Form, then all selected options shall be deleted.
                        </p>
                    </div>

                    <div className="overflow-x-auto border rounded-md shadow-sm">
                        <table className="min-w-full bg-white border">
                            <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                                <tr>
                                    <th className="px-4 py-2 border-b">Institute Code</th>
                                    <th className="px-4 py-2 border-b">Institute Name</th>
                                    <th className="px-4 py-2 border-b">Course Code</th>
                                    <th className="px-4 py-2 border-b">Course</th>
                                    <th className="px-4 py-2 border-b">Shift</th>
                                    <th className="px-4 py-2 border-b">Course Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appliedCourses.map((course, idx) => (
                                    <tr key={idx} className="text-sm text-gray-800">
                                        <td className="px-4 py-2 border-b">MS{course.InstituteCode}00007</td>
                                        <td className="px-4 py-2 border-b">{course.InstituteName || 'N/A'}</td>
                                        <td className="px-4 py-2 border-b">{course.CourseCode}</td>
                                        <td className="px-4 py-2 border-b">LICENTIATE IN COMPUTER HARDWARE MAINTENANCE</td>
                                        <td className="px-4 py-2 border-b">1st Shift</td>
                                        <td className="px-4 py-2 border-b">{course.CourseType}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            onClick={handleCancel}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                        >
                            No, Go Back
                        </button>
                        <button
                            onClick={handleUnlock}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Yes, Unlock'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default VerifyToUnlock;