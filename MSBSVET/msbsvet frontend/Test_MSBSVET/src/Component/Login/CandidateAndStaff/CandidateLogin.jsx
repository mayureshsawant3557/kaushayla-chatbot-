// import { useState, useEffect } from 'react';
// import { useLocation, Navigate, useNavigate } from 'react-router-dom';
// import agent from '../../../lib/api/agent';
// import { CandidateLoginDetails } from '../../../Endpoints_All/Account/authentication';
// import { IsStaffFormLocked, IsCandidateFormLocked } from '../../../Endpoints_All/Base/formLock';
// import Swal from 'sweetalert2';
// import { useLoading } from "../../../Hooks/useLoading";
// import { useStepValidation } from "../../../hooks/useStepValidation";
// import { GetCandidateDashboard } from '../../../Endpoints_All/Candidate/primary';
// import { GetStaffDashboard } from '../../../Endpoints_All/Staff/primary'; // TODO: adjust path/name to match your actual Staff endpoint file

// const CandidateLogin = ({ isLoggedIn, userLoginId, onLoginStateChange }) => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [userData, setUserData] = useState(null);
//     const { startLoading, stopLoading } = useLoading();
//     const [error, setError] = useState(null);
//     const [showWelcomeCard, setShowWelcomeCard] = useState(true);
//     const [dashBoardData, setDashBoardData] = useState([]);

//     const currentUserLoginId = location.state?.profileId || userLoginId || "";

//     // Determine if user is Staff based on userLoginId containing 'S' or 's'
//     const isStaffUser = currentUserLoginId && (currentUserLoginId.toUpperCase().includes('S'));

//     // Use the step validation hook (kept only for userID / formType / lock-check needs;
//     // step-gating itself is now fully driven by the dashboard API below)
//     const {
//         currentStepId,
//         validateAndNavigate,
//         canAccessStep,
//         allProgressSections,
//         isLoading: stepLoading,
//         formType,
//         userID,
//         isStaff
//     } = useStepValidation();

//     // Define progress sections based on user type
//     const getProgressSections = () => {
//         if (isStaffUser) {
//             // Staff progress sections (11 steps)
//             return [
//                 { id: 1, number: 1, label: 'Primary', route: '/Staff/Primary', pageCode: 'Primary', progress: 0 },
//                 { id: 2, number: 2, label: 'Address', route: '/Staff/Address', pageCode: 'Address', progress: 0 },
//                 { id: 3, number: 3, label: 'Parent', route: '/Staff/Parent', pageCode: 'Parent', progress: 0 },
//                 { id: 4, number: 4, label: 'Category', route: '/Staff/Category', pageCode: 'Category', progress: 0 },
//                 { id: 5, number: 5, label: 'Qualification', route: '/Staff/Qualification', pageCode: 'Qualification', progress: 0 },
//                 { id: 6, number: 6, label: 'Training', route: '/Staff/Training', pageCode: 'Training', progress: 0 },
//                 { id: 7, number: 7, label: 'Additional', route: '/Staff/Additional', pageCode: 'Additional', progress: 0 },
//                 { id: 8, number: 8, label: 'Bank', route: '/Staff/Bank', pageCode: 'Bank', progress: 0 },
//                 { id: 9, number: 9, label: 'Work Experience', route: '/Staff/WorkExperience', pageCode: 'WorkExperience', progress: 0 },
//                 { id: 10, number: 10, label: 'Sectorial Expertise', route: '/Staff/SectorialExpertise', pageCode: 'SectorialExpertise', progress: 0 },
//                 { id: 11, number: 11, label: 'Verify', route: '/Staff/LockApplicationForm', pageCode: 'LockApplicationForm', progress: 0 }
//             ];
//         } else {
//             // Candidate progress sections (12 steps)
//             return [
//                 { id: 1, number: 1, label: 'Primary', route: '/Candidate/Primary', pageCode: 'Primary', progress: 0 },
//                 { id: 2, number: 2, label: 'Address', route: '/Candidate/Address', pageCode: 'Address', progress: 0 },
//                 { id: 3, number: 3, label: 'Parent', route: '/Candidate/Parent', pageCode: 'Parent', progress: 0 },
//                 { id: 4, number: 4, label: 'Category', route: '/Candidate/Category', pageCode: 'Category', progress: 0 },
//                 { id: 5, number: 5, label: 'Qualification', route: '/Candidate/Qualification', pageCode: 'Qualification', progress: 0 },
//                 { id: 6, number: 6, label: 'Training', route: '/Candidate/Training', pageCode: 'Training', progress: 0 },
//                 { id: 7, number: 7, label: 'Additional', route: '/Candidate/Additional', pageCode: 'Additional', progress: 0 },
//                 { id: 8, number: 8, label: 'Bank', route: '/Candidate/Bank', pageCode: 'Bank', progress: 0 },
//                 { id: 9, number: 9, label: 'Work Experience', route: '/Candidate/WorkExperience', pageCode: 'WorkExperience', progress: 0 },
//                 { id: 10, number: 10, label: 'Verify', route: '/Candidate/LockApplicationForm', pageCode: 'LockApplicationForm', progress: 0 },
//                 { id: 11, number: 11, label: 'Apply', route: '/Candidate/MainCourseAdmissionApply', pageCode: 'ApplyForAdmission', progress: 0 },
//                 { id: 12, number: 12, label: 'Admission Letter', route: '/Dashboard/DashboardCandidate', pageCode: 'PrintAdmissionLetter', progress: 0 },
//             ];
//         }
//     };

//     const progressSections = getProgressSections();

//     // Fetch dashboard data — Candidate vs Staff hit different endpoints,
//     // but both are expected to return { Data: [{ PageCode, PageStatus }, ...] }
//     const getDashboardData = async () => {
//         try {
//             const endpoint = isStaffUser
//                 ? `${GetStaffDashboard}?staffId=${userID}`
//                 : `${GetCandidateDashboard}?candidateId=${userID}`;

//             const response = await agent.get(endpoint);
            

//             if (response.data && response.data.Data && response.data.Data.length > 0) {
//                 setDashBoardData(response.data.Data);
//             }
//         } catch (error) {
//             console.error('Error fetching dashboard data:', error);
//         }
//     };

//     // Derive the current step purely from dashboard data (works for both Candidate & Staff,
//     // since both progressSections carry a pageCode and both APIs return the same shape)
//     const getCurrentStepFromDashboard = () => {
//         if (!dashBoardData || dashBoardData.length === 0) {
//             // API hasn't returned yet — fall back to hook's currentStepId temporarily
//             return currentStepId;
//         }
//         // Walk sections in order; first one that isn't 100% is the current step
//         for (const section of progressSections) {
//             const apiEntry = dashBoardData.find(d => d.PageCode === section.pageCode);
//             if (!apiEntry || apiEntry.PageStatus !== 100) {
//                 return section.number;
//             }
//         }
//         // Everything completed
//         return progressSections[progressSections.length - 1].number;
//     };

//     const effectiveCurrentStepId = getCurrentStepFromDashboard();

//     const canAccessStepUnified = (stepNumber) => {
//         return stepNumber <= effectiveCurrentStepId;
//     };

//     // Convert progress to binary (100% or 0%), driven entirely by dashboard data
//     const convertToBinaryProgress = (sections) => {
//         return sections.map(section => {
//             const apiEntry = dashBoardData.find(d => d.PageCode === section.pageCode);
//             if (apiEntry) {
//                 return { ...section, progress: apiEntry.PageStatus === 100 ? 100 : 0 };
//             }
//             // Fallback while dashBoardData hasn't loaded yet
//             return { ...section, progress: section.number <= effectiveCurrentStepId ? 100 : 0 };
//         });
//     };

//     const binaryProgressSections = convertToBinaryProgress(progressSections);

//     // Split sections for display based on user type
//     const topProgressSections = isStaffUser
//         ? binaryProgressSections.slice(0, 6)  // Staff: 6 sections in top row
//         : binaryProgressSections.slice(0, 6); // Candidate: 6 sections in top row

//     const bottomProgressSections = isStaffUser
//         ? binaryProgressSections.slice(6)     // Staff: remaining 5 sections in bottom row
//         : binaryProgressSections.slice(6);    // Candidate: remaining 6 sections in bottom row

//     useEffect(() => {
//         if (location.state && location.state.isLoggedIn && location.state.profileId) {
//             if (onLoginStateChange && (!isLoggedIn || userLoginId !== location.state.profileId)) {
//                 onLoginStateChange(true, location.state.profileId);
//             }
//         }
//     }, [location, isLoggedIn, userLoginId, onLoginStateChange]);

//     // Fetch user data from API
//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 startLoading();
//                 setError(null);

//                 if (!currentUserLoginId) {
//                     setError('No user ID provided. Please login again.');
//                     stopLoading();
//                     return;
//                 }

//                 const response = await agent.get(`${CandidateLoginDetails}?userLoginId=${currentUserLoginId}`);


//                 if (!response.data) {
//                     console.error('API response data is null or undefined');
//                     setError('API returned null or undefined data');
//                     stopLoading();
//                     return;
//                 }

//                 if (Array.isArray(response.data) && response.data.length === 0) {
//                     console.error('API returned empty array');
//                     setError('No user data found');
//                     stopLoading();
//                     return;
//                 }

//                 setUserData(Array.isArray(response.data) ? response.data[0] : response.data);
//                 stopLoading();
//             } catch (error) {
//                 console.error('Error fetching user data:', error);
//                 setError(error.message || 'Failed to fetch data');
//                 stopLoading();
//             }
//         };

//         if (isLoggedIn || location.state?.isLoggedIn) {
//             fetchUserData();
//             getDashboardData();
//         }
//     }, [currentUserLoginId, isLoggedIn, location.state?.isLoggedIn]);

//     // Hide welcome card after a few seconds
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setShowWelcomeCard(false);
//         }, 5000);
//         return () => clearTimeout(timer);
//     }, []);

//     // Handle navigation to different sections
//     const navigateTo = async (route, extraState = {}) => {
//         try {
//             if (!userID) {
//                 console.error('No userID found in sessionStorage');
//                 return;
//             }

//             const lockCheckEndpoint = isStaffUser
//                 ? `${IsStaffFormLocked}?StaffID=${userID}`
//                 : `${IsCandidateFormLocked}?CandidateID=${userID}`;


//             const response = await agent.get(lockCheckEndpoint);

//             if (response.data.Data === true) {
//                 if (isStaffUser) {
//                     // For Staff: Show message and redirect to LockApplicationForm
//                     Swal.fire({
//                         title: 'Information',
//                         text: `Profile is locked.`,
//                         icon: 'info',
//                         confirmButtonText: 'Ok',
//                         confirmButtonColor: '#28a745'
//                     }).then(() => {
//                         navigate('/Staff/LockApplicationForm', {
//                             state: {
//                                 profileId: userData?.UserLoginID || currentUserLoginId,
//                                 isLoggedIn: true
//                             }
//                         });
//                     });
//                 } else {
//                     // For Candidate: Show original message
//                     Swal.fire({
//                         title: 'Information',
//                         text: `Profile is locked. To view Profile, follow link Application Form > Unlock Profile`,
//                         icon: 'info',
//                         confirmButtonText: 'Ok',
//                         confirmButtonColor: '#28a745'
//                     }).then(() => {

//                         navigate('/Candidate/LockApplicationForm', {
//                             state: {
//                                 profileId: userData?.UserLoginID || currentUserLoginId,
//                                 isLoggedIn: true
//                             }
//                         });

//                     });
//                 }
//             } else {
//                 navigate(route, {
//                     state: {
//                         profileId: userData?.UserLoginID || currentUserLoginId,
//                         isLoggedIn: true,
//                         ...extraState
//                     }
//                 });
//             }
//         } catch (error) {
//             console.error('Error checking form lock status:', error);
//             navigate(route, {
//                 state: {
//                     profileId: userData?.UserLoginID || currentUserLoginId,
//                     isLoggedIn: true,
//                     ...extraState
//                 }
//             });
//         }
//     };

//     // Decide the actual target route based on section + its completion status
//     // (Only Apply / Admission Letter for Candidates have special post-completion routing today)
//     const getEffectiveRoute = (section) => {
//         if (section.pageCode === 'ApplyForAdmission') {
//             return section.progress === 100
//                 ? '/Candidate/MainCourseAdmissionApply'
//                 : section.route;
//         }
//         if (section.pageCode === 'PrintAdmissionLetter') {
//             return section.progress === 100
//                 ? '/candidate/dashboard'
//                 : section.route;
//         }
//         return section.route;
//     };

//     // Updated section click handler
//     const handleSectionClick = (section) => {

//         if (canAccessStepUnified(section.number)) {
//             const targetRoute = getEffectiveRoute(section);
//             const isCompleted = section.progress === 100;

//             // Apply / Admission Letter: once completed, always go straight there —
//             // bypass the lock check entirely, regardless of profile lock status.
//             const bypassesLockCheck =
//                 isCompleted &&
//                 (section.pageCode === 'ApplyForAdmission' || section.pageCode === 'PrintAdmissionLetter');

//             if (bypassesLockCheck) {
//                 navigate(targetRoute, {
//                     state: {
//                         profileId: userData?.UserLoginID || currentUserLoginId,
//                         isLoggedIn: true,
//                         isCompleted: true
//                     }
//                 });
//             } else {
//                 navigateTo(targetRoute, { isCompleted });
//             }
//         } else {
//             const currentStepSection = progressSections.find(s => s.number === effectiveCurrentStepId);
//             const currentStepLabel = currentStepSection ? currentStepSection.label : 'Unknown';

//             Swal.fire({
//                 icon: 'warning',
//                 title: 'Step Not Allowed',
//                 text: `You can access only up to "${currentStepLabel}" (Step ${effectiveCurrentStepId}).`,
//             });
//         }
//     };

//     // Component for progress circle with binary progress (100% or 0%)
//     const ProgressCircle = ({ progress, label, onClick, disabled = false }) => {
        
//         const getBackgroundColor = (progress) => {
//             if (progress === 100) return '#d4ede4'; // Green for completed (100%)
//             return '#fff2cc'; // Yellow for not completed (0%)
//         };

//         const getBorderColor = (progress) => {
//             if (progress === 100) return '#28a745'; // Green border for completed
//             return '#ffc107'; // Yellow border for not completed
//         };

//         return (
//             <div className="flex flex-col items-center" style={{ position: 'relative' }}>
//                 <button
//                     onClick={onClick}
//                     disabled={disabled}
//                     className={`flex items-center justify-center rounded-full transition-shadow ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:shadow-lg cursor-pointer'
//                         }`}
//                     style={{
//                         width: '70px',
//                         height: '70px',
//                         backgroundColor: getBackgroundColor(progress),
//                         border: `2px solid ${getBorderColor(progress)}`,
//                         zIndex: 2
//                     }}
//                 >
//                     <span className="font-semibold text-sm">{progress}%</span>
//                 </button>
//                 <div className="mt-2 text-center text-sm font-medium max-w-24">{label}</div>
//             </div>
//         );
//     };

//     if (!isLoggedIn && !location.state?.isLoggedIn) {
//         return <Navigate to="/CandidateLogin" />;
//     }

//     if (error) {
//         return (
//             <div className="flex h-screen w-full flex-col items-center justify-center p-4">
//                 <div className="mb-4 text-xl text-red-600">Error: {error}</div>
//                 <div className="text-md">
//                     Please check the API endpoint and ensure it is responding correctly.
//                     <br />
//                     You might need to check if the service is running or if CORS is properly configured.
//                 </div>
//                 <button
//                     className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
//                     onClick={() => navigate('/')}
//                 >
//                     Back to Login
//                 </button>
//             </div>
//         );
//     }

//     const displayData = userData || {
//         UserLoginID: currentUserLoginId,
//         UserType: isStaffUser ? "Staff" : "Candidate",
//         UserName: "",
//         CurrentLoginDateTime: new Date().toLocaleString(),
//         LastLoginDateTime: "N/A",
//         CollegeName: ""
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return "N/A";
//         try {
//             const date = new Date(dateString);
//             return date.toLocaleString();
//         } catch (e) {
//             return dateString;
//         }
//     };

//     return (
//         <div className="w-full p-4">
//             {/* Loading indicator for step validation */}
//             {stepLoading && (
//                 <div className="mb-4 text-center">
//                     <div className="text-blue-600">Loading step information...</div>
//                 </div>
//             )}

//             {/* User Info Section */}
//             {showWelcomeCard && (
//                 <div className="w-full p-4">
//                     <fieldset className="w-full rounded-lg border border-gray-300 p-4">
//                         <legend className="rounded-md border bg-gray-200 px-4 py-2 text-center font-bold text-gray-600">
//                             Welcome to Maharashtra State Board of Skill, Vocational Education and Training Portal
//                         </legend>
//                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                             {/* Left Column */}
//                             <div className="space-y-4">
//                                 <div className="flex">
//                                     <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">User Login ID</div>
//                                     <div className="flex-grow rounded-r-lg border px-6 py-3">{displayData.UserLoginID}</div>
//                                 </div>
//                                 <div className="flex">
//                                     <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">User Type</div>
//                                     <div className="flex-grow rounded-r-lg border px-6 py-3">
//                                         {displayData.UserType || (isStaffUser ? "Staff" : "Candidate")}
//                                     </div>
//                                 </div>
//                                 <div className="flex">
//                                     <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">User Name</div>
//                                     <div className="flex-grow rounded-r-lg border px-6 py-3">{displayData.UserName}</div>
//                                 </div>
//                             </div>

//                             {/* Right Column */}
//                             <div className="space-y-4">
//                                 {displayData.IPAddress && (
//                                     <div className="flex">
//                                         <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">IP Address</div>
//                                         <div className="flex-grow rounded-r-lg border px-6 py-3">{displayData.IPAddress}</div>
//                                     </div>
//                                 )}
//                                 <div className="flex">
//                                     <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">Current Login Time</div>
//                                     <div className="flex-grow rounded-r-lg border px-6 py-3">{formatDate(displayData.CurrentLoginDateTime)}</div>
//                                 </div>
//                                 <div className="flex">
//                                     <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">Previous Login Time</div>
//                                     <div className="flex-grow rounded-r-lg border px-6 py-3">{formatDate(displayData.LastLoginDateTime)}</div>
//                                 </div>
//                                 {displayData.CollegeName && displayData.CollegeName.trim() !== "" && (
//                                     <div className="flex">
//                                         <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">College Name</div>
//                                         <div className="flex-grow rounded-r-lg border px-6 py-3">{displayData.CollegeName}</div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </fieldset>
//                 </div>
//             )}

//             {/* Dashboard Title */}
//             <fieldset className="w-full rounded-lg border border-gray-300 p-4">
//                 <legend className="rounded-md border bg-gray-200 px-4 py-2 text-center font-bold text-gray-600">
//                     {isStaffUser ? "Staff" : "Candidate"} Dashboard - Current Step: {effectiveCurrentStepId}
//                 </legend>

//                 {/* Progress Tracking Section */}
//                 <div className="w-full p-6">
//                     {/* Top Progress Row */}
//                     <div className="relative mb-16">
//                         <div className="flex items-center justify-evenly">
//                             {topProgressSections.map((section) => (
//                                 <ProgressCircle
//                                     key={section.id}
//                                     progress={section.progress}
//                                     label={section.label}
//                                     onClick={() => handleSectionClick(section)}
//                                     disabled={!canAccessStepUnified(section.number)}
//                                 />
//                             ))}
//                         </div>
//                         <div
//                             className="absolute left-0 right-0 top-9 z-5 h-1 bg-gray-300"
//                             style={{ width: '100%' }}
//                         />
//                     </div>

//                     {/* Bottom Progress Row */}
//                     <div className="relative">
//                         <div className="flex items-center justify-evenly">
//                             {bottomProgressSections.map((section) => (
//                                 <ProgressCircle
//                                     key={section.id}
//                                     progress={section.progress}
//                                     label={section.label}
//                                     onClick={() => handleSectionClick(section)}
//                                     disabled={!canAccessStepUnified(section.number)}
//                                 />
//                             ))}
//                         </div>
//                         <div
//                             className="absolute left-0 right-0 top-7 z-5 h-1 bg-gray-300"
//                             style={{ width: '100%' }}
//                         />
//                     </div>
//                 </div>

//                 {/* Debug Information (can be removed in production) */}

//             </fieldset>
//         </div>
//     );
// };

// export default CandidateLogin;
import { useState, useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import agent from '../../../lib/api/agent';
import { CandidateLoginDetails } from '../../../Endpoints_All/Account/authentication';
import { IsStaffFormLocked, IsCandidateFormLocked } from '../../../Endpoints_All/Base/formLock';
import Swal from 'sweetalert2';
import { useLoading } from "../../../Hooks/useLoading";
import { useStepValidation } from "../../../hooks/useStepValidation";
import { GetCandidateDashboard } from '../../../Endpoints_All/Candidate/primary';
import { GetStaffDashboard } from '../../../Endpoints_All/Staff/primary'; // TODO: adjust path/name to match your actual Staff endpoint file
import CandidateStaffStepCardsGrid from '../../../Component/Dashboard/CandidateStaffStepCardsGrid'; // adjust path as needed

const CandidateLogin = ({ isLoggedIn, userLoginId, onLoginStateChange }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState(null);
    const { startLoading, stopLoading } = useLoading();
    const [error, setError] = useState(null);
    const [showWelcomeCard, setShowWelcomeCard] = useState(true);
    const [dashBoardData, setDashBoardData] = useState([]);

    const currentUserLoginId = location.state?.profileId || userLoginId || "";

    // Determine if user is Staff based on userLoginId containing 'S' or 's'
    const isStaffUser = currentUserLoginId && (currentUserLoginId.toUpperCase().includes('S'));

    // Use the step validation hook (kept only for userID / formType / lock-check needs;
    // step-gating itself is now fully driven by the dashboard API below)
    const {
        currentStepId,
        validateAndNavigate,
        canAccessStep,
        allProgressSections,
        isLoading: stepLoading,
        formType,
        userID,
        isStaff
    } = useStepValidation();

    // Define progress sections based on user type
    const getProgressSections = () => {
        if (isStaffUser) {
            // Staff progress sections (11 steps)
            return [
                { id: 1, number: 1, label: 'Primary', route: '/Staff/Primary', pageCode: 'Primary', progress: 0 },
                { id: 2, number: 2, label: 'Address', route: '/Staff/Address', pageCode: 'Address', progress: 0 },
                { id: 3, number: 3, label: 'Parent', route: '/Staff/Parent', pageCode: 'Parent', progress: 0 },
                { id: 4, number: 4, label: 'Category', route: '/Staff/Category', pageCode: 'Category', progress: 0 },
                { id: 5, number: 5, label: 'Qualification', route: '/Staff/Qualification', pageCode: 'Qualification', progress: 0 },
                { id: 6, number: 6, label: 'Training', route: '/Staff/Training', pageCode: 'Training', progress: 0 },
                { id: 7, number: 7, label: 'Additional', route: '/Staff/Additional', pageCode: 'Additional', progress: 0 },
                { id: 8, number: 8, label: 'Bank', route: '/Staff/Bank', pageCode: 'Bank', progress: 0 },
                { id: 9, number: 9, label: 'Work Experience', route: '/Staff/WorkExperience', pageCode: 'WorkExperience', progress: 0 },
                { id: 10, number: 10, label: 'Sectorial Expertise', route: '/Staff/SectorialExpertise', pageCode: 'SectorialExpertise', progress: 0 },
                { id: 11, number: 11, label: 'Verify', route: '/Staff/LockApplicationForm', pageCode: 'LockApplicationForm', progress: 0 }
            ];
        } else {
            // Candidate progress sections (12 steps)
            return [
                { id: 1, number: 1, label: 'Primary', route: '/Candidate/Primary', pageCode: 'Primary', progress: 0 },
                { id: 2, number: 2, label: 'Address', route: '/Candidate/Address', pageCode: 'Address', progress: 0 },
                { id: 3, number: 3, label: 'Parent', route: '/Candidate/Parent', pageCode: 'Parent', progress: 0 },
                { id: 4, number: 4, label: 'Category', route: '/Candidate/Category', pageCode: 'Category', progress: 0 },
                { id: 5, number: 5, label: 'Qualification', route: '/Candidate/Qualification', pageCode: 'Qualification', progress: 0 },
                { id: 6, number: 6, label: 'Training', route: '/Candidate/Training', pageCode: 'Training', progress: 0 },
                { id: 7, number: 7, label: 'Additional', route: '/Candidate/Additional', pageCode: 'Additional', progress: 0 },
                { id: 8, number: 8, label: 'Bank', route: '/Candidate/Bank', pageCode: 'Bank', progress: 0 },
                { id: 9, number: 9, label: 'Work Experience', route: '/Candidate/WorkExperience', pageCode: 'WorkExperience', progress: 0 },
                { id: 10, number: 10, label: 'Verify', route: '/Candidate/LockApplicationForm', pageCode: 'LockApplicationForm', progress: 0 },
                { id: 11, number: 11, label: 'Apply', route: '/Candidate/MainCourseAdmissionApply', pageCode: 'ApplyForAdmission', progress: 0 },
                { id: 12, number: 12, label: 'Admission Letter', route: '/Dashboard/DashboardCandidate', pageCode: 'PrintAdmissionLetter', progress: 0 },
            ];
        }
    };

    const progressSections = getProgressSections();

    // Fetch dashboard data — Candidate vs Staff hit different endpoints,
    // but both are expected to return { Data: [{ PageCode, PageStatus }, ...] }
    const getDashboardData = async () => {
        try {
            const endpoint = isStaffUser
                ? `${GetStaffDashboard}?staffId=${userID}`
                : `${GetCandidateDashboard}?candidateId=${userID}`;

            const response = await agent.get(endpoint);


            if (response.data && response.data.Data && response.data.Data.length > 0) {
                setDashBoardData(response.data.Data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    // Derive the current step purely from dashboard data (works for both Candidate & Staff,
    // since both progressSections carry a pageCode and both APIs return the same shape)
    const getCurrentStepFromDashboard = () => {
        if (!dashBoardData || dashBoardData.length === 0) {
            // API hasn't returned yet — fall back to hook's currentStepId temporarily
            return currentStepId;
        }
        // Walk sections in order; first one that isn't 100% is the current step
        for (const section of progressSections) {
            const apiEntry = dashBoardData.find(d => d.PageCode === section.pageCode);
            if (!apiEntry || apiEntry.PageStatus !== 100) {
                return section.number;
            }
        }
        // Everything completed
        return progressSections[progressSections.length - 1].number;
    };

    const effectiveCurrentStepId = getCurrentStepFromDashboard();

    const canAccessStepUnified = (stepNumber) => {
        return stepNumber <= effectiveCurrentStepId;
    };

    // Convert progress to binary (100% or 0%), driven entirely by dashboard data
    const convertToBinaryProgress = (sections) => {
        return sections.map(section => {
            const apiEntry = dashBoardData.find(d => d.PageCode === section.pageCode);
            if (apiEntry) {
                return { ...section, progress: apiEntry.PageStatus === 100 ? 100 : 0 };
            }
            // Fallback while dashBoardData hasn't loaded yet
            return { ...section, progress: section.number <= effectiveCurrentStepId ? 100 : 0 };
        });
    };

    const binaryProgressSections = convertToBinaryProgress(progressSections);

    // Build the card grid steps, carrying the original section for the click handler
    const cardSteps = binaryProgressSections.map((section) => ({
        pageCode: section.pageCode,
        label: section.label,
        progress: section.progress,
        disabled: !canAccessStepUnified(section.number),
        _section: section,
    }));

    useEffect(() => {
        if (location.state && location.state.isLoggedIn && location.state.profileId) {
            if (onLoginStateChange && (!isLoggedIn || userLoginId !== location.state.profileId)) {
                onLoginStateChange(true, location.state.profileId);
            }
        }
    }, [location, isLoggedIn, userLoginId, onLoginStateChange]);

    // Fetch user data from API
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                startLoading();
                setError(null);

                if (!currentUserLoginId) {
                    setError('No user ID provided. Please login again.');
                    stopLoading();
                    return;
                }

                const response = await agent.get(`${CandidateLoginDetails}?userLoginId=${currentUserLoginId}`);


                if (!response.data) {
                    console.error('API response data is null or undefined');
                    setError('API returned null or undefined data');
                    stopLoading();
                    return;
                }

                if (Array.isArray(response.data) && response.data.length === 0) {
                    console.error('API returned empty array');
                    setError('No user data found');
                    stopLoading();
                    return;
                }

                setUserData(Array.isArray(response.data) ? response.data[0] : response.data);
                stopLoading();
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError(error.message || 'Failed to fetch data');
                stopLoading();
            }
        };

        if (isLoggedIn || location.state?.isLoggedIn) {
            fetchUserData();
            getDashboardData();
        }
    }, [currentUserLoginId, isLoggedIn, location.state?.isLoggedIn]);

    // Hide welcome card after a few seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcomeCard(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    // Handle navigation to different sections
    const navigateTo = async (route, extraState = {}) => {
        try {
            if (!userID) {
                console.error('No userID found in sessionStorage');
                return;
            }

            const lockCheckEndpoint = isStaffUser
                ? `${IsStaffFormLocked}?StaffID=${userID}`
                : `${IsCandidateFormLocked}?CandidateID=${userID}`;
            const response = await agent.get(lockCheckEndpoint);
            if (response.data.Data === true) {
                if (isStaffUser) {
                    // For Staff: Show message and redirect to LockApplicationForm
                    // Swal.fire({
                    //     title: 'Information',
                    //     text: `Profile is locked.`,
                    //     icon: 'info',
                    //     confirmButtonText: 'Ok',
                    //     confirmButtonColor: '#28a745'
                    // }).then(() => {
                    //     navigate('/Staff/LockApplicationForm', {
                    //         state: {
                    //             profileId: userData?.UserLoginID || currentUserLoginId,
                    //             isLoggedIn: true
                    //         }
                    //     });
                    // });
                    navigate(route, {
                    state: {
                        profileId: userData?.UserLoginID || currentUserLoginId,
                        isLoggedIn: true,
                        ...extraState
                    }
                });
                } 
                else {
                    // For Candidate: Show original message
                    if(route=='/Candidate/MainCourseAdmissionApply'){
                        navigate(route)
                    } else {
                        Swal.fire({
                        title: 'Information',
                        text: `Profile is locked. To view Profile, follow link Application Form > Unlock Profile`,
                        icon: 'info',
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#28a745'
                    }).then(() => {

                        navigate('/Candidate/LockApplicationForm', {
                            state: {
                                profileId: userData?.UserLoginID || currentUserLoginId,
                                isLoggedIn: true
                            }
                        });

                    });
                    }
                }
            } else {
                navigate(route, {
                    state: {
                        profileId: userData?.UserLoginID || currentUserLoginId,
                        isLoggedIn: true,
                        ...extraState
                    }
                });
            }
        } catch (error) {
            console.error('Error checking form lock status:', error);
            navigate(route, {
                state: {
                    profileId: userData?.UserLoginID || currentUserLoginId,
                    isLoggedIn: true,
                    ...extraState
                }
            });
        }
    };

    // Decide the actual target route based on section + its completion status
    // (Only Apply / Admission Letter for Candidates have special post-completion routing today)
    const getEffectiveRoute = (section) => {
        if (section.pageCode === 'ApplyForAdmission') {
            return section.progress === 100
                ? '/Candidate/MainCourseAdmissionApply'
                : section.route;
        }
        if (section.pageCode === 'PrintAdmissionLetter') {
            return section.progress === 100
                ? '/candidate/dashboard'
                : section.route;
        }
        return section.route;
    };

    // Updated section click handler
    const handleSectionClick = (section) => {

        if (canAccessStepUnified(section.number)) {
            const targetRoute = getEffectiveRoute(section);
            const isCompleted = section.progress === 100;

            // Apply / Admission Letter: once completed, always go straight there —
            // bypass the lock check entirely, regardless of profile lock status.
            const bypassesLockCheck =
                isCompleted &&
                (section.pageCode === 'ApplyForAdmission' || section.pageCode === 'PrintAdmissionLetter');

            if (bypassesLockCheck) {
                navigate(targetRoute, {
                    state: {
                        profileId: userData?.UserLoginID || currentUserLoginId,
                        isLoggedIn: true,
                        isCompleted: true
                    }
                });
            } else {
                navigateTo(targetRoute, { isCompleted });
            }
        } else {
            const currentStepSection = progressSections.find(s => s.number === effectiveCurrentStepId);
            const currentStepLabel = currentStepSection ? currentStepSection.label : 'Unknown';

            Swal.fire({
                icon: 'warning',
                title: 'Step Not Allowed',
                text: `You can access only up to "${currentStepLabel}" (Step ${effectiveCurrentStepId}).`,
            });
        }
    };

    // Card grid click handler — unwraps the original section and reuses
    // the existing navigation / lock-check / warning logic unchanged.
    const handleStepClick = (step) => {
        handleSectionClick(step._section);
    };

    if (!isLoggedIn && !location.state?.isLoggedIn) {
        return <Navigate to="/CandidateLogin" />;
    }

    if (error) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center p-4">
                <div className="mb-4 text-xl text-red-600">Error: {error}</div>
                <div className="text-md">
                    Please check the API endpoint and ensure it is responding correctly.
                    <br />
                    You might need to check if the service is running or if CORS is properly configured.
                </div>
                <button
                    className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    onClick={() => navigate('/')}
                >
                    Back to Login
                </button>
            </div>
        );
    }

    const displayData = userData || {
        UserLoginID: currentUserLoginId,
        UserType: isStaffUser ? "Staff" : "Candidate",
        UserName: "",
        CurrentLoginDateTime: new Date().toLocaleString(),
        LastLoginDateTime: "N/A",
        CollegeName: ""
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="w-full p-4">
            {/* Loading indicator for step validation */}
            {stepLoading && (
                <div className="mb-4 text-center">
                    <div className="text-blue-600">Loading step information...</div>
                </div>
            )}

            {/* User Info Section */}
            {showWelcomeCard && (
                <div className="w-full p-4">
                    <fieldset className="w-full rounded-lg border border-gray-300 p-4">
                        <legend className="rounded-md border bg-gray-200 px-4 py-2 text-center font-bold text-gray-600">
                            Welcome to Maharashtra State Board of Skill, Vocational Education and Training Portal
                        </legend>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="flex">
                                    <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">User Login ID</div>
                                    <div className="flex-grow rounded-r-lg border px-6 py-3">{displayData.UserLoginID}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">User Type</div>
                                    <div className="flex-grow rounded-r-lg border px-6 py-3">
                                        {displayData.UserType || (isStaffUser ? "Staff" : "Candidate")}
                                    </div>
                                </div>
                                <div className="flex">
                                    <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">User Name</div>
                                    <div className="flex-grow rounded-r-lg border px-6 py-3">{displayData.UserName}</div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                {displayData.IPAddress && (
                                    <div className="flex">
                                        <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">IP Address</div>
                                        <div className="flex-grow rounded-r-lg border px-6 py-3">{displayData.IPAddress}</div>
                                    </div>
                                )}
                                <div className="flex">
                                    <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">Current Login Time</div>
                                    <div className="flex-grow rounded-r-lg border px-6 py-3">{formatDate(displayData.CurrentLoginDateTime)}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">Previous Login Time</div>
                                    <div className="flex-grow rounded-r-lg border px-6 py-3">{formatDate(displayData.LastLoginDateTime)}</div>
                                </div>
                                {displayData.CollegeName && displayData.CollegeName.trim() !== "" && (
                                    <div className="flex">
                                        <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">College Name</div>
                                        <div className="flex-grow rounded-r-lg border px-6 py-3">{displayData.CollegeName}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </fieldset>
                </div>
            )}

            {/* Dashboard Title */}
            <fieldset className="w-full rounded-lg border border-gray-300 p-4">
                <legend className="rounded-md border bg-gray-200 px-4 py-2 text-center font-bold text-gray-600">
                    {isStaffUser ? "Staff" : "Candidate"} Dashboard - Current Step: {effectiveCurrentStepId}
                </legend>

                {/* Progress Tracking Section */}
                <div className="w-full p-6">
                    <CandidateStaffStepCardsGrid
                        steps={cardSteps}
                        onStepClick={handleStepClick}
                    />
                </div>

            </fieldset>
        </div>
    );
};

export default CandidateLogin;