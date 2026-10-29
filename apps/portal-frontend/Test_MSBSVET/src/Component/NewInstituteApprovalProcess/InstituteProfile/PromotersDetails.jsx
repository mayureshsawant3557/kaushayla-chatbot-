// import React, { useContext, useState, useEffect } from 'react';
// import { ThemeContext } from "../../Context/ThemeContext";
// import DropdownComponent from "../../formcomponent/DropdownComponent";
// import { useAuth } from "../../../Hooks/AuthContext";
// import { useNavigate, useLocation } from "react-router-dom";
// import agent from '../../../lib/api/agent';
// import useLoading from "../../../Hooks/useLoading";
// import Swal from 'sweetalert2';
// import {
//     GetInstituteIDByInstituteCode,
//     GetPromotingOrganisationIDByInstituteID,
//     GetPromoterDetailsByInstituteID,
//     GetPromotingOrganisationIDByTempInstituteID,
//     SaveInstitutePromoterStaffMappingDetails
// } from "../../../Endpoints_All/Base/Institute";
// import VerifiedIcon from "../../../assets/VerifiedIcon.jpg";
// import QuestionMark from "../../../assets/QuestionMark.png";
// import Button from "../../base/Button";
// import StaffProfilePopup from '../../formcomponent/StaffProfilePopup';

// const promoterTypeOptions = [
//     { id: "Trustee", name: "Trustee" },
//     { id: "Director", name: "Director" },
//     { id: "Partner", name: "Partner" },
//     { id: "Member", name: "Member" }
// ];

// function formatOptions(options) {
//     return options.map((opt) =>
//         typeof opt === "object"
//             ? { value: opt.id?.toString(), label: opt.name }
//             : { value: opt, label: opt }
//     );
// }

// // Helper function to get hash code
// function getHashCode(str) {
//     if (!str) return 0;
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) {
//         hash = ((hash << 5) - hash) + str.charCodeAt(i);
//         hash |= 0;
//     }
//     return Math.abs(hash);
// }

// const PromotersDetails = () => {
//     const { color } = useContext(ThemeContext);
//     const { userInfo } = useAuth();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const { startLoading, stopLoading, isLoading } = useLoading();

//     const [authorizedRepresentative, setAuthorizedRepresentative] = useState(null);
//     const [principalPromoter, setPrincipalPromoter] = useState(null);
//     const [members, setMembers] = useState([]);
//     const [isSamePerson, setIsSamePerson] = useState(false);
//     const [selectedPromoterType, setSelectedPromoterType] = useState('');
//     const [filteredMembers, setFilteredMembers] = useState([]);
//     const [hasPromotingOrg, setHasPromotingOrg] = useState(false);
//     const [instituteId, setInstituteId] = useState(null);
//     const [isSameDisabled, setIsSameDisabled] = useState(false);
//     const [showAddPrincipalBtn, setShowAddPrincipalBtn] = useState(true);

//     const [showStaffPopup, setShowStaffPopup] = useState(false);
//     const [selectedRoleConfig, setSelectedRoleConfig] = useState(null);
//     const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
//     const [verificationStatus, setVerificationStatus] = useState("");
//     const [verificationRemark, setVerificationRemark] = useState("");

//     // Secretary verification states
//     const [approvalStatus, setApprovalStatus] = useState('');
//     const [rejectReason, setRejectReason] = useState('');
//     const [showVerificationUI, setShowVerificationUI] = useState(false);
//     const [statusCode, setStatusCode] = useState("");
//     const canProceed = authorizedRepresentative && (isSamePerson || principalPromoter);
//     const [existingRemark, setExistingRemark] = useState('');
//     const [isRemarkLoaded, setIsRemarkLoaded] = useState(false);


//     const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
//     const userType = userInfoAll?.UserTypeID || userInfo?.UserTypeID;
//     const allowedStatuses = ["I", "U", "V", "R", "S"];
//     const isEditableUser =
//         userType !== 64
//     // const isEditableUser =
//     //     userType !== 64 &&
//     //     (statusCode === "" || allowedStatuses.includes(statusCode));

//     const getInstituteIdFromQueryString = () => {
//         const searchParams = new URLSearchParams(location.search);
//         const p1 = searchParams.get('P1');
//         const p2 = searchParams.get('P2');

//         if (p1 && p2) {
//             const calculatedHash = getHashCode(p1).toString();
//             if (calculatedHash === p2) {
//                 return parseInt(p1);
//             }
//         } else if (p1) {
//             return parseInt(p1);
//         }
//         return null;
//     };

//     const getInstituteIdByUserType = async () => {
//         try {
//             let id = null;

//             if (userType === 64) {
//                 const response = await agent.get(
//                     `/Base/GetPromotingOrganisationIDByInstituteCode/${userInfo?.UserLoginID}`
//                 );
//                 id = response.data?.Data;
//             }
//             else if (userType === 66) {
//                 const response = await agent.get(
//                     `${GetInstituteIDByInstituteCode}/${userInfo?.UserLoginID}`
//                 );
//                 id = response.data?.Data;
//             }
//             else {
//                 id =
//                     getInstituteIdFromQueryString() ||
//                     location.state?.instituteId ||
//                     sessionStorage.getItem("instituteId");
//             }


//             if (!id) return null;

//             if (userType === 81) {
//                 try {
//                     const res = await agent.get(
//                         `${GetPromotingOrganisationIDByTempInstituteID}/${id}`
//                     );

//                     const convertedId = res.data?.Data;


//                     return convertedId ? parseInt(convertedId) : parseInt(id);
//                 } catch (err) {
//                     console.warn("Conversion failed, using base ID");
//                     return parseInt(id);
//                 }
//             }

//             return parseInt(id);

//         } catch (error) {
//             console.error("Error getting institute ID:", error);
//             return null;
//         }
//     };
//     const getTempInstituteId = async () => {
//         if (userType !== 81) return null;

//         let id = getInstituteIdFromQueryString() ||
//             location.state?.instituteId ||
//             sessionStorage.getItem("instituteId");

//         return id ? parseInt(id) : null;
//     };

//     const getStatusInstituteId = async () => {
//         if (userType === 81) {
//             const searchParams = new URLSearchParams(location.search);

//             const P1 = searchParams.get("P1");
//             const P2 = searchParams.get("P2");

//             if (
//                 P1 &&
//                 P2 &&
//                 getHashCode(P1).toString() === P2
//             ) {
//                 return parseInt(P1);
//             }

//             return P1 ? parseInt(P1) : null;
//         }

//         const response = await agent.get(
//             `${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo?.UserLoginID}`
//         );

//         return response?.data?.Data;
//     };
//     const handleAddAuthorizedRepresentative = async () => {
//         let id;

//         if (userType === 81) {
//             id = await getTempInstituteId();
//         } else {
//             id = await getInstituteIdByUserType();
//         }


//         setInstituteId(id);

//         setSelectedRoleConfig({
//             button: "Update Authorized Representative",
//             ManagementTypeID: 5,
//             title: "Authorized Representative",
//             promoterId: authorizedRepresentative?.PromoterID
//         });

//         setShowStaffPopup(true);
//     };
//     const handleAddPrincipalPromoter = async () => {
//         let id;
//         if (userType === 81) {
//             id = await getTempInstituteId();
//         } else {
//             id = await getInstituteIdByUserType();
//         }

//         setInstituteId(id);

//         setSelectedRoleConfig({
//             button: "Add Principal Promoter",
//             ManagementTypeID: 8,
//             title: "Principal Promoter"
//         });
//         setShowStaffPopup(true);
//     };

//     const handleAddMember = () => {
//         const selectedOption = promoterTypeOptions.find(
//             opt => opt.name === selectedPromoterType
//         );
//         setSelectedRoleConfig({
//             button: "Add Promoter",
//             ManagementTypeID: selectedOption?.id,
//             title: selectedPromoterType
//         });
//         setShowStaffPopup(true);
//     };

//     const handleStaffSaved = async () => {
//         setShowStaffPopup(false);

//         // Show loading indicator
//         startLoading();

//         try {
//             // Wait a moment for the database to update
//             await new Promise(resolve => setTimeout(resolve, 500));

//             // Re-fetch the institute ID first (like C# Page_Load)
//             const id = await getInstituteIdByUserType();

//             if (id) {
//                 // Clear existing data
//                 setAuthorizedRepresentative(null);
//                 setPrincipalPromoter(null);
//                 setMembers([]);

//                 await fetchPromotersData(id);


//             }
//         } catch (error) {
//             console.error("Error refreshing data:", error);
//             Swal.fire("Error", "Failed to refresh data", "error");
//         } finally {
//             stopLoading();
//         }
//     };
//     const checkPromotingOrganisationAndFetchPromoters = async () => {
//         startLoading();
//         try {
//             let id = await getInstituteIdByUserType();


//             if (!id || id === 0) {
//                 await showInstructionAlert();
//                 return;
//             }

//             setInstituteId(id);
//             setHasPromotingOrg(true);

//             setAuthorizedRepresentative(null);
//             setPrincipalPromoter(null);
//             setMembers([]);

//             await fetchPromotersData(id);

//             if (userType === 81) {
//                 setShowVerificationUI(true);
//             }
//         } catch (error) {
//             console.error("Error:", error);
//             await showInstructionAlert();
//         } finally {
//             stopLoading();
//         }
//     };

//     const fetchPromotersData = async (promotingOrgId) => {
//         try {
//             const payload = {
//                 instituteId: promotingOrgId,
//                 exitInstituteID: 0,
//                 userLoginID: userInfo?.UserLoginID || "",
//                 pageCode: "PromotersDetails",
//                 itemId: "0",
//                 ipAddress: "1"
//             };

//             const response = await agent.post(
//                 `${GetPromoterDetailsByInstituteID}`,
//                 payload
//             );




//             if (response.data?.Status === "Success" && response.data?.Data) {
//                 const allPromoters = response.data.Data || [];
//                 const authPersonList = allPromoters.filter(p => p.PromoterTypeID === 5);
//                 const chairmanList = allPromoters.filter(p => p.PromoterTypeID === 8);
//                 const membersList = allPromoters.filter(p =>
//                     p.PromoterTypeID !== 5 && p.PromoterTypeID !== 8
//                 );

//                 const authRep = authPersonList.length > 0
//                     ? authPersonList.reduce((latest, current) =>
//                         current.PromoterID > latest.PromoterID ? current : latest
//                     )
//                     : null;

//                 const principal = chairmanList.length > 0
//                     ? chairmanList.reduce((latest, current) =>
//                         current.PromoterID > latest.PromoterID ? current : latest
//                     )
//                     : null;

//                 setAuthorizedRepresentative(authRep);
//                 setPrincipalPromoter(principal);
//                 setMembers(membersList);

//                 if (chairmanList.length > 0) {
//                     setIsSameDisabled(true);
//                     if (authRep && principal && authRep.StaffId === principal.StaffId) {
//                         setIsSamePerson(true);
//                     } else {
//                         setIsSamePerson(false);
//                     }
//                 } else {
//                     if (userType === 64) {
//                         setIsSameDisabled(true);
//                     } else if (userType === 81) {
//                         setIsSameDisabled(false);
//                     }
//                     setIsSamePerson(false);
//                 }
//             } else {
//                 setAuthorizedRepresentative(null);
//                 setPrincipalPromoter(null);
//                 setMembers([]);
//                 if (userType === 81) {
//                     setIsSameDisabled(false);
//                 } else {
//                     setIsSameDisabled(true);
//                 }
//                 setIsSamePerson(false);
//             }
//         } catch (error) {
//             console.error("Error fetching promoters data:", error);
//             setAuthorizedRepresentative(null);
//             setPrincipalPromoter(null);
//             setMembers([]);
//         }
//     };

//     const showInstructionAlert = async () => {
//         const result = await Swal.fire({
//             title: 'Promoters Not Updated',
//             width: '700px',
//             html: `
//           <div class="text-left w-full">
//               <p class="mb-3">Promoters for this Skill Development Institute are not updated. To update Promoters details, follow below mentioned process:</p>
//               <ol class="list-decimal ml-5 space-y-2">
//                   <li>Register Promoting Organization. Refer User Manual for Promoting Organization for detailed process</li>
//                   <li>Update "Promoters" page in Promoting Organization account.</li>
//                   <li>The Promoters details shall be displayed on this page once Promoters are updated in Promoting Organization account.</li>
//               </ol>
//           </div>
//       `,
//             icon: 'info',
//             confirmButtonText: 'OK',
//             customClass: {
//                 confirmButton: 'bg-[#00c3f9] hover:bg-[#00a8d6] text-white rounded px-6 py-2'
//             },
//             buttonsStyling: false,
//             allowOutsideClick: false,
//             allowEscapeKey: false
//         });

//         if (result.isConfirmed) {
//             window.history.back();
//         }
//     };

//     const extractProfileId = (htmlString) => {
//         if (!htmlString) return '';
//         const cleanText = htmlString.replace(/<[^>]*>/g, '');
//         return cleanText;
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return '';
//         const date = new Date(dateString);
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const year = date.getFullYear();
//         return `${day}/${month}/${year}`;
//     };

//     const getStatusIcon = (status) => {
//         const verifiedStatuses = ["A", "V", "Active", "Verified"];

//         if (verifiedStatuses.includes(status)) {
//             return (
//                 <div className="flex justify-center">
//                     <img alt="verified" src={VerifiedIcon} className="w-8 h-8" />
//                 </div>
//             );
//         }

//         return (
//             <div className="flex justify-center">
//                 <img alt="not-verified" src={QuestionMark} className="w-8 h-8" />
//             </div>
//         );
//     };

//     const handlePrintProfile = (profileID, staffId) => {
//         if (!profileID && !staffId) {
//             Swal.fire("Info", "No Profile ID available", "info");
//             return;
//         }
//         const displayId = profileID || staffId;
//         const popupWidth = 1000;
//         const popupHeight = 750;
//         const left = (window.screen.width - popupWidth) / 2;
//         const top = (window.screen.height - popupHeight) / 2;
//         window.open(
//             `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffId}&userLoginID=${displayId}&pageCode=STAFF_PRINT`,
//             "StaffPrintApplicationForm",
//             `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
//         );
//     };

//     const handleUpdateVerification = async (status) => {
//         try {
//             startLoading();

//             let finalInstituteId;
//             if (userType === 81) {
//                 finalInstituteId = await getStatusInstituteId();
//             } else {
//                 finalInstituteId = instituteId || await getInstituteIdByUserType();
//             }

//             const payload = {
//                 instituteID: finalInstituteId,
//                 remark: rejectReason || "",
//                 status: status,
//                 pageCode: "PromotersDetails",
//                 createdBy: userInfo?.UserLoginID,
//                 ipAddress: "1"
//             };

//             const response = await agent.post(
//                 "/api/InstituteBase/update-verification-status",
//                 payload
//             );

//             if (response.data?.success) {
//                 const hash = getHashCode(finalInstituteId.toString());
//                 navigate(`/Institute/ProposedInstituteDetails?P1=${finalInstituteId}&P2=${hash}`);
//             } else {
//                 Swal.fire("Error", response.data?.message || "Update failed", "error");
//             }
//         } catch (error) {
//             console.error(error);
//             Swal.fire("Error", "Something went wrong", "error");
//         } finally {
//             stopLoading();
//         }
//     };
//     const handleSamePersonChange = async (value) => {
//         setIsSamePerson(value);

//         if (value === true) {
//             if (authorizedRepresentative) {

//                 startLoading();
//                 try {
//                     const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
//                     let instituteID = await getInstituteIdByUserType();


//                     const payload = {
//                         ID: 0,
//                         InstituteID: instituteID,
//                         StaffID: extractProfileId(authorizedRepresentative.StaffProfileId) || 0,
//                         ManagementType: 8,
//                         CreateBy: userInfoAll.UserLoginID || "system",
//                         IPAddress: "127.0.0.1"
//                     };

//                     const res = await agent.post(`${SaveInstitutePromoterStaffMappingDetails}`, payload);


//                     const id = await getInstituteIdByUserType();

//                     if (id) {
//                         await fetchPromotersData(id);
//                     }

//                     setIsSameDisabled(true);

//                     Swal.fire({
//                         icon: "success",
//                         title: "Saved",
//                         text: "Promoter details Saved successfully",
//                         timer: 2000,
//                         showConfirmButton: false
//                     });
//                 } catch (error) {
//                     console.error(error);
//                     Swal.fire({
//                         icon: "error",
//                         title: "Error",
//                         text: "Failed to add Principal Promoter",
//                         timer: 2000,
//                         showConfirmButton: false
//                     });
//                     setIsSamePerson(false);
//                 } finally {
//                     stopLoading();
//                 }
//             } else {
//                 Swal.fire({
//                     icon: "error",
//                     title: "Error",
//                     text: "Please add Authorized Representative first",
//                     timer: 2000,
//                     showConfirmButton: false
//                 });
//                 setIsSamePerson(false);
//             }
//         } else {
//             setIsSameDisabled(false);
//         }
//     };
//     const renderPromoterRow = (promoter, isClickable = true) => {
//         if (!promoter) return null;

//         const profileId = extractProfileId(promoter.StaffProfileId) || promoter.StaffId;
//         const effectivePrincipal =
//             isSamePerson ? authorizedRepresentative : principalPromoter;
//         return (
//             <tr className="bg-white">
//                 <td className="border border-gray-300 px-2 py-1 text-center">
//                     {isClickable ? (
//                         <a
//                             href="#"
//                             className="text-blue-600 hover:text-blue-800 underline text-xs cursor-pointer"
//                             onClick={(e) => {
//                                 e.preventDefault();
//                                 handlePrintProfile(profileId, promoter.StaffId);
//                             }}
//                         >
//                             {profileId}
//                         </a>
//                     ) : (
//                         <span className="text-gray-700">{profileId}</span>
//                     )}
//                 </td>
//                 <td className="border border-gray-300 text-center px-2 py-1 text-xs">{promoter.Title || '-'}</td>
//                 <td className="border border-gray-300 text-center px-2 py-1 text-xs">{promoter.FirstName || '-'}</td>
//                 <td className="border border-gray-300 text-center px-2 py-1 text-xs">{promoter.MiddleName || '-'}</td>
//                 <td className="border border-gray-300 text-center px-2 py-1 text-xs">{promoter.LastName || '-'}</td>
//                 <td className="border border-gray-300 text-center px-2 py-1 text-xs">{promoter.GenderCode || '-'}</td>
//                 <td className="border border-gray-300 text-center px-2 py-1 text-xs">
//                     {promoter.FormatDOB || formatDate(promoter.DOB) || '-'}
//                 </td>
//                 <td className="border border-gray-300 px-2 py-1 text-xs">{promoter.MobileNo || '-'}</td>
//                 <td className="border border-gray-300 px-2 py-1">
//                     {getStatusIcon(promoter.IsapprovedPromoter)}
//                 </td>
//             </tr>
//         );
//     };

//     const handleBack = () => {
//         let id = null;

//         if (userType === 81) {
//             const searchParams = new URLSearchParams(location.search);
//             id = searchParams.get("P1");

//             if (id) {
//                 id = parseInt(id);
//                 const hash = getHashCode(id.toString());

//                 navigate(
//                     `/Institute/PromotingOrganization?P1=${id}&P2=${hash}`
//                 );
//             } else {
//                 navigate("/Institute/PromotingOrganization");
//             }
//         } else {
//             window.history.back();
//         }
//     };

//     const handleNext = () => {
//         if (userInfo.UserTypeID === 64) {
//             navigate('/Institute/ProposedInstituteDetails');
//         } else {
//             navigate('/institute/InstituteProfile');
//         }
//     };

//     const handleClose = async () => {
//         const result = await Swal.fire({
//             title: "Are you sure?",
//             text: "Do you want to close?",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#d33",
//             cancelButtonColor: "#3085d6",
//             confirmButtonText: "Yes",
//             cancelButtonText: "No"
//         });

//         if (result.isConfirmed) {
//             if (userInfo?.UserTypeID == 64) {
//                 navigate("/tinstitute/dashboard");
//                 return;
//             }
//             let id = null;

//             if (userType === 81) {
//                 const searchParams = new URLSearchParams(location.search);
//                 id = searchParams.get('P1');
//                 if (id) id = parseInt(id);
//             } else {
//                 id = instituteId || getInstituteIdFromQueryString() || sessionStorage.getItem("instituteId");
//             }

//             if (id) {
//                 const hash = getHashCode(id.toString());
//                 window.location.href = `/React/InstituteDash?P1=${id}&P2=${hash}`;
//             } else {
//                 window.location.href = '/React/InstituteDash';
//             }
//         }
//     };

//     useEffect(() => {
//         checkPromotingOrganisationAndFetchPromoters();

//     }, []);

//     useEffect(() => {
//         const fetchStatus = async () => {
//             const instId = await getStatusInstituteId();

//             if (!instId) {
//                 console.log("No instituteId available for status fetch");
//                 return;
//             }

//             console.log("Fetching status for instituteId:", instId); // Debug log

//             try {
//                 const res = await agent.get(
//                     `/api/InstituteBase/GetProposedInstituteStatus/${instId}`
//                 );

//                const statusData = res.data?.Data; 
//                console.log("Status data received:", statusData); // Debug log

//                 if (statusData) {
//                     const promotorsStatus = statusData.IsPromotors;
//                     const promotorsRemark = statusData.PromotorsRemark;

//                     console.log("Promotors Status:", promotorsStatus); // Debug log
//                     console.log("Promotors Remark:", promotorsRemark); // Debug log

//                     setStatusCode(promotorsStatus);

//                     if (userType !== 81) {
                        
//                         if (promotorsStatus === "V") {
//                             setVerificationStatus("V");
//                             setVerificationRemark("ALREADY VERIFIED");
//                         }
//                         else if (promotorsStatus === "R") {
//                             setVerificationStatus("R");
//                             setVerificationRemark(
//                                 promotorsRemark ||
//                                 "Promoters are not verified. Complete Promoters Profile, Request for Verification and complete verification process."
//                             );
//                         }
//                         else {
//                             setVerificationStatus("");
//                             setVerificationRemark("");
//                         }
//                     }

//                     // For secretary, set initial approval status based on existing verification
//                     if (userType === 81) {

//                         if (promotorsStatus === "R") {
//                             setApprovalStatus("R");
//                             setRejectReason(
//                                 "Promoters are not verified. Complete Promoters Profile, Request for Verification and complete verification process."
//                             );
//                             setIsAlreadyVerified(false);
//                         }
//                         else if (promotorsStatus === "V") {
//                             setApprovalStatus("V");
//                             setRejectReason("ALREADY VERIFIED");
//                             setIsAlreadyVerified(true);
//                         }
//                         else {
//                             setApprovalStatus("");
//                             setRejectReason("");
//                             setIsAlreadyVerified(false);
//                         }
//                     }
//                 }

//             } catch (err) {
//                 console.error("Error fetching status:", err);
//             }
//         };

//         // Only fetch if we have instituteId
//         if (instituteId) {
//             fetchStatus();
//         }
//     }, [userType, instituteId]); // Add instituteId as dependency


//     useEffect(() => {
//         let filtered = members.filter(m => m.PromoterType === selectedPromoterType);
//         if (filtered.length === 0 && members.length > 0) {
//             filtered = members;
//         }
//         setFilteredMembers(filtered);
//     }, [selectedPromoterType, members]);

//     useEffect(() => {
//         if (members.length > 0) {
//             setSelectedPromoterType(members[0].PromoterType);
//         }
//     }, [members]);

//     if (isLoading) {
//         return (
//             <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
//             </div>
//         );
//     }

//     if (!hasPromotingOrg) {
//         return null;
//     }

//     return (
//         <div className="w-full p-4">
//             <fieldset className='mb-4 rounded-md border p-4'>
//                 <legend
//                     className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
//                 >
//                     <span>Promoters</span>
//                 </legend>

//                 <div className="px-4 pb-3 pt-3">
//                     {/* Pink Note Box */}
//                     <div className="bg-red-100 border border-red-300 text-red-900 px-3 py-2 rounded text-sm mb-4">
//                         <strong>Note:</strong>
//                         <ol className="list-decimal list-inside mt-1 space-y-1">
//                             <li>
//                                 To edit Authorized Representative/ Principal Promoter/ Promoter profile information, login to respective Staff/ Management account and edit profile.
//                             </li>
//                             <li>
//                                 To change assigned Authorized Representative/ Principal Promoter/ Promoter, login to respective Promoting Organization and edit Promoters.
//                             </li>
//                         </ol>
//                     </div>

//                     {/* Authorized Representative Section */}
//                     <div className="mb-4">

//                         {/* ✅ GRAY HEADER ONLY */}
//                         <div className="bg-gray-200 px-3 py-2 rounded-t">
//                             <h3 className="text-sm font-semibold text-gray-800">
//                                 Authorized Representative of Promoting Organization<span className='text-red-500'>*</span>
//                             </h3>
//                         </div>

//                         <div className="bg-white border border-gray-300 rounded-b p-3">


//                             {isEditableUser && (
//                                 <div className="flex justify-center mb-3">
//                                     {authorizedRepresentative ? (
//                                         <Button
//                                             onClick={handleAddAuthorizedRepresentative}
//                                             className="text-xs px-5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md shadow-sm"
//                                         >

//                                             Update Authorized Representative
//                                         </Button>
//                                     ) : (
//                                         <Button onClick={handleAddAuthorizedRepresentative} className="text-xs px-5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md shadow-sm">
//                                             + Add Authorized Representative
//                                         </Button>
//                                     )}
//                                 </div>
//                             )}

//                             {/* TABLE */}
//                             {authorizedRepresentative ? (
//                                 <div className="overflow-x-auto">
//                                     <table className="w-full border-collapse border border-gray-300 text-sm">
//                                         <thead className="bg-gray-100">
//                                             <tr>
//                                                 <th className="border px-2 py-2 text-xs">Profile ID</th>
//                                                 <th className="border px-2 py-2 text-xs">Title</th>
//                                                 <th className="border px-2 py-2 text-xs">First Name</th>
//                                                 <th className="border px-2 py-2 text-xs">Middle Name</th>
//                                                 <th className="border px-2 py-2 text-xs">Last Name</th>
//                                                 <th className="border px-2 py-2 text-xs">Gender</th>
//                                                 <th className="border px-2 py-2 text-xs">DOB</th>
//                                                 <th className="border px-2 py-2 text-xs">Mobile</th>
//                                                 <th className="border px-2 py-2 text-xs">Status</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {renderPromoterRow(authorizedRepresentative)}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             ) : (
//                                 <div className="text-center text-gray-500 py-4">
//                                     No Authorized Representative found.
//                                 </div>
//                             )}

//                         </div>
//                     </div>

//                     {/* Principal Promoter Section */}
//                     <div className="mb-4">
//                         <div className="bg-gray-200 px-3 py-2 rounded-t">
//                             <h3 className="text-sm font-semibold text-gray-800">
//                                 Principal Promoter<span className='text-red-500'>*</span>
//                             </h3>
//                         </div>

//                         <div className="bg-white border border-gray-300 rounded-b p-3">

//                             <div className="mb-3 flex items-center gap-4 justify-left">
//                                 <span className="text-sm font-medium text-gray-700">
//                                     Is Authorized Representative and Principal Promoter same ?
//                                 </span>

//                                 <label className="flex items-center gap-1">
//                                     <input
//                                         type="radio"
//                                         name="isSame"
//                                         value="Yes"
//                                         checked={isSamePerson === true}
//                                         onChange={() => handleSamePersonChange(true)}
//                                         disabled={userType === 64}
//                                     />
//                                     <span>Yes</span>
//                                 </label>

//                                 <label className="flex items-center gap-1">
//                                     <input
//                                         type="radio"
//                                         name="isSame"
//                                         value="No"
//                                         checked={isSamePerson === false}
//                                         onChange={() => handleSamePersonChange(false)}
//                                         disabled={userType === 64}
//                                     />
//                                     <span>No</span>
//                                 </label>
//                             </div>

//                             {/* Add Principal Promoter button - always visible for Secretary when status allows */}
//                             {userType === 81 && (
//                                 <div className="flex justify-center mb-3">
//                                     <Button onClick={handleAddPrincipalPromoter} className="text-xs px-5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md shadow-sm">
//                                         Add Principal Promoter
//                                     </Button>
//                                 </div>
//                             )}

//                             {/* Show table based on selection */}
//                             {isSamePerson === true ? (
//                                 authorizedRepresentative ? (
//                                     <div className="overflow-x-auto">
//                                         <table className="w-full border-collapse border border-gray-300 text-sm">
//                                             <thead className="bg-gray-100">
//                                                 <tr>
//                                                     <th className="border px-2 py-2 text-xs">Profile ID</th>
//                                                     <th className="border px-2 py-2 text-xs">Title</th>
//                                                     <th className="border px-2 py-2 text-xs">First Name</th>
//                                                     <th className="border px-2 py-2 text-xs">Middle/ Father/ Husband Name</th>
//                                                     <th className="border px-2 py-2 text-xs">Last/ Surname</th>
//                                                     <th className="border px-2 py-2 text-xs">Gender</th>
//                                                     <th className="border px-2 py-2 text-xs">Date of Birth</th>
//                                                     <th className="border px-2 py-2 text-xs">Mobile No.</th>
//                                                     <th className="border px-2 py-2 text-xs">Status</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {renderPromoterRow(authorizedRepresentative)}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 ) : (
//                                     <div className="text-center text-gray-500 py-4">
//                                         No Authorized Representative found.
//                                     </div>
//                                 )
//                             ) : (
//                                 principalPromoter ? (
//                                     <div className="overflow-x-auto">
//                                         <table className="w-full border-collapse border border-gray-300 text-sm">
//                                             <thead className="bg-gray-100">
//                                                 <tr>
//                                                     <th className="border px-2 py-2 text-xs">Profile ID</th>
//                                                     <th className="border px-2 py-2 text-xs">Title</th>
//                                                     <th className="border px-2 py-2 text-xs">First Name</th>
//                                                     <th className="border px-2 py-2 text-xs">Middle/ Father/ Husband Name</th>
//                                                     <th className="border px-2 py-2 text-xs">Last/ Surname</th>
//                                                     <th className="border px-2 py-2 text-xs">Gender</th>
//                                                     <th className="border px-2 py-2 text-xs">Date of Birth</th>
//                                                     <th className="border px-2 py-2 text-xs">Mobile No.</th>
//                                                     <th className="border px-2 py-2 text-xs">Status</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {renderPromoterRow(principalPromoter)}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 ) : (
//                                     <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
//                                         No Principal Promoter found.
//                                     </div>
//                                 )
//                             )}
//                         </div>
//                     </div>
//                     {/* Members Section */}
//                     <div className="mb-4">

//                         <div className="bg-gray-200 px-3 py-2 rounded-t">
//                             <h3 className="text-sm font-semibold text-gray-800">Member</h3>
//                         </div>

//                         <div className="bg-white border border-gray-300 rounded-b p-3">

//                             <div className="flex justify-center items-center gap-3 mb-3 flex-wrap">

//                                 {/* Label */}
//                                 <span className="text-sm font-medium text-gray-700">
//                                     Promoter Type :
//                                 </span>

//                                 {/* Dropdown */}
//                                 <div className="w-64">
//                                     <DropdownComponent
//                                         label=""
//                                         name="PromoterType"
//                                         options={formatOptions(promoterTypeOptions)}
//                                         value={selectedPromoterType}
//                                         onChange={(value) => setSelectedPromoterType(value)}
//                                         required={false}
//                                         loading={false}
//                                         disabled={members.length > 0 || userType === 64}
//                                     />
//                                 </div>

//                                 {/* Button */}
//                                 {isEditableUser && (
//                                     <Button onClick={handleAddMember} className="text-xs px-5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md shadow-sm">
//                                         Add Promoter
//                                     </Button>
//                                 )}
//                             </div>

//                             {filteredMembers.length > 0 ? (
//                                 <div className="overflow-x-auto">
//                                     <table className="w-full border-collapse border border-gray-300 text-sm">
//                                         <thead className="bg-gray-100">
//                                             <tr>
//                                                 <th className="border px-2 py-2 text-xs">Sr. No.</th>
//                                                 <th className="border px-2 py-2 text-xs">Profile ID</th>
//                                                 <th className="border px-2 py-2 text-xs">Promoter Type</th>
//                                                 <th className="border px-2 py-2 text-xs">Title</th>
//                                                 <th className="border px-2 py-2 text-xs">First Name</th>
//                                                 <th className="border px-2 py-2 text-xs">Middle Name</th>
//                                                 <th className="border px-2 py-2 text-xs">Last Name</th>
//                                                 <th className="border px-2 py-2 text-xs">Gender</th>
//                                                 <th className="border px-2 py-2 text-xs">DOB</th>
//                                                 <th className="border px-2 py-2 text-xs">Mobile</th>
//                                                 <th className="border px-2 py-2 text-xs">Status</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {filteredMembers.map((member, index) => {
//                                                 const profileId = extractProfileId(member.StaffProfileId) || member.StaffId;
//                                                 return (
//                                                     <tr key={member.PromoterID || index}>
//                                                         <td className="border px-2 py-1 text-xs text-center">{index + 1}</td>
//                                                         <td className="border px-2 py-1 text-xs text-center">
//                                                             <a
//                                                                 href="#"
//                                                                 className="text-blue-600 hover:text-blue-800 underline text-xs cursor-pointer"
//                                                                 onClick={(e) => {
//                                                                     e.preventDefault();
//                                                                     handlePrintProfile(profileId, member.StaffId);
//                                                                 }}
//                                                             >
//                                                                 {profileId}
//                                                             </a>
//                                                         </td>
//                                                         <td className="border px-2 py-1 text-xs text-center">{member.PromoterType}</td>
//                                                         <td className="border px-2 py-1 text-xs text-center">{member.Title}</td>
//                                                         <td className="border px-2 py-1 text-xs text-center">{member.FirstName}</td>
//                                                         <td className="border px-2 py-1 text-xs text-center">{member.MiddleName}</td>
//                                                         <td className="border px-2 py-1 text-xs text-center">{member.LastName}</td>
//                                                         <td className="border px-2 py-1 text-xs text-center">{member.GenderCode}</td>
//                                                         <td className="border px-2 py-1 text-xs text-center">
//                                                             {member.FormatDOB || formatDate(member.DOB)}
//                                                         </td>
//                                                         <td className="border px-2 py-1 text-xs">{member.MobileNo}</td>
//                                                         <td className="border px-2 py-1">
//                                                             {getStatusIcon(member.IsapprovedPromoter)}
//                                                         </td>
//                                                     </tr>
//                                                 );
//                                             })}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             ) : (
//                                 <div className="text-center text-gray-500 py-4 border rounded">
//                                     {members.length > 0
//                                         ? 'No members found for selected promoter type.'
//                                         : 'No members found.'}
//                                 </div>
//                             )}

//                         </div>
//                     </div>

//                     {/* Secretary Verification Section */}
//                     {showVerificationUI && userType === 81 && (
//                         <div className="mb-6 border rounded-lg p-4 bg-gray-50">
//                             <h3 className="text-md font-normal mb-3">Select Approved Reject Status <span className='text-red-600'>*</span></h3>

//                             <div className="flex gap-6 mb-4">
//                                 <label className="inline-flex items-center">
//                                     <input
//                                         type="radio"
//                                         name="verificationStatus"
//                                         value="V"
//                                         checked={approvalStatus === 'V'}
//                                         onChange={(e) => setApprovalStatus(e.target.value)}
//                                         disabled={isAlreadyVerified}
//                                         className="form-radio h-4 w-4 text-green-600"
//                                     />
//                                     <span className="ml-2 text-sm">Verified</span>
//                                 </label>
//                                 <label className="inline-flex items-center">
//                                     <input
//                                         type="radio"
//                                         name="verificationStatus"
//                                         value="R"
//                                         checked={approvalStatus === 'R'}
//                                         onChange={(e) => setApprovalStatus(e.target.value)}
//                                         disabled={isAlreadyVerified}
//                                         className="form-radio h-4 w-4 text-red-600"
//                                     />
//                                     <span className="ml-2 text-sm">Rejected</span>
//                                 </label>
//                             </div>

//                             {(approvalStatus === 'R' || userType === 81) && (
//                                 <div className="mb-4">
//                                     <label className="block text-sm font-normal mb-2">
//                                         Reason for Rejection/ Remark
//                                         {approvalStatus === 'R' && !isAlreadyVerified && <span className="text-red-500">*</span>}
//                                     </label>
//                                     <textarea
//                                         className="w-full border border-gray-300 rounded-md p-2 text-sm uppercase"
//                                         rows="3"
//                                         value={rejectReason}
//                                         onChange={(e) => setRejectReason(e.target.value.toUpperCase())}
//                                         placeholder="Enter remark..."
//                                     />
//                                 </div>
//                             )}


//                         </div>
//                     )}
//                     {userType !== 81 &&
//                         (verificationStatus === "R" || verificationStatus === "V") && (

//                             <div className="mt-4 p-3 rounded border">

//                                 {verificationStatus === "R" && (
//                                     <div className="text-red-600">
//                                         <p className="font-normal">Verification Status: Rejected</p>
//                                         <p className="text-sm">
//                                             Reason for Rejection/ Remark : {verificationRemark?.toUpperCase()}
//                                         </p>
//                                     </div>
//                                 )}

//                                 {verificationStatus === "V" && (
//                                     <div className="text-green-600">
//                                         <p className="font-normal">Verification Status: Verified</p>
//                                         <p className="text-sm">
//                                             Reason for Rejection/ Remark : {verificationRemark?.toUpperCase()}
//                                         </p>
//                                     </div>
//                                 )}

//                             </div>
//                         )}

//                     <div className='flex justify-center gap-3 mt-6 mb-4'>

//                         <Button variant='primary' onClick={handleBack}>
//                             Back
//                         </Button>
//                         {authorizedRepresentative && (isSamePerson || principalPromoter) && (
//                             <Button
//                                 onClick={() => {
//                                     if (!authorizedRepresentative || (!isSamePerson && !principalPromoter)) {
//                                         Swal.fire("Info", "Authorized Representative or Principal Promoter missing");
//                                         return;
//                                     }

//                                     if (userType === 81) {
//                                         handleUpdateVerification(approvalStatus);
//                                     } else {
//                                         handleNext();
//                                     }
//                                 }}
//                                 className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow"
//                             >
//                                 {userType === 81 ? "Save & Next" : "Next"}
//                             </Button>
//                         )}
//                         <Button variant='danger' onClick={handleClose}>
//                             Close
//                         </Button>
//                     </div>

//                     {/* Staff Profile Popup */}
//                     <StaffProfilePopup
//                         open={showStaffPopup}
//                         onClose={() => setShowStaffPopup(false)}
//                         roleConfig={selectedRoleConfig}
//                         onSaved={handleStaffSaved}
//                         IsPromotorForm={true}
//                         instituteId={instituteId}
//                     />
//                 </div>
//             </fieldset>
//         </div>

//     );
// };

// export default PromotersDetails;

import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from "../../Context/ThemeContext";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { useAuth } from "../../../Hooks/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import agent from '../../../lib/api/agent';
import useLoading from "../../../Hooks/useLoading";
import Swal from 'sweetalert2';
import {
    GetInstituteIDByInstituteCode,
    GetPromotingOrganisationIDByInstituteID,
    GetPromoterDetailsByInstituteID,
    GetPromotingOrganisationIDByTempInstituteID,
    SaveInstitutePromoterStaffMappingDetails
} from "../../../Endpoints_All/Base/Institute";
import VerifiedIcon from "../../../assets/VerifiedIcon.jpg";
import QuestionMark from "../../../assets/QuestionMark.png";
import Button from "../../base/Button";
import StaffProfilePopup from '../../formcomponent/StaffProfilePopup';
import { getDeviceIP } from '../../../utils/CommonHelper';

const promoterTypeOptions = [
    { id: "Trustee", name: "Trustee" },
    { id: "Director", name: "Director" },
    { id: "Partner", name: "Partner" },
    { id: "Member", name: "Member" }
];

function formatOptions(options) {
    return options.map((opt) =>
        typeof opt === "object"
            ? { value: opt.id?.toString(), label: opt.name }
            : { value: opt, label: opt }
    );
}

// Helper function to get hash code
function getHashCode(str) {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

const PromotersDetails = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { startLoading, stopLoading, isLoading } = useLoading();

    const [authorizedRepresentative, setAuthorizedRepresentative] = useState(null);
    const [principalPromoter, setPrincipalPromoter] = useState(null);
    const [members, setMembers] = useState([]);
    const [isSamePerson, setIsSamePerson] = useState(false);
    const [selectedPromoterType, setSelectedPromoterType] = useState('');
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [hasPromotingOrg, setHasPromotingOrg] = useState(false);
    const [instituteId, setInstituteId] = useState(null);
    const [isSameDisabled, setIsSameDisabled] = useState(false);
    const [showAddPrincipalBtn, setShowAddPrincipalBtn] = useState(true);

    const [showStaffPopup, setShowStaffPopup] = useState(false);
    const [selectedRoleConfig, setSelectedRoleConfig] = useState(null);
    const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState("");
    const [verificationRemark, setVerificationRemark] = useState("");

    // Secretary verification states
    const [approvalStatus, setApprovalStatus] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [showVerificationUI, setShowVerificationUI] = useState(false);
    const [statusCode, setStatusCode] = useState("");
    const canProceed = authorizedRepresentative && (isSamePerson || principalPromoter);
    const [existingRemark, setExistingRemark] = useState('');
    const [isRemarkLoaded, setIsRemarkLoaded] = useState(false);
    const [ipAddress, setIpAddress] = useState("");

   
    const userType = userInfo?.UserTypeID || userInfo?.UserTypeID;
    const allowedStatuses = ["I", "U", "V", "R", "S"];
    const isEditableUser =
        userType !== 64
    // const isEditableUser =
    //     userType !== 64 &&
    //     (statusCode === "" || allowedStatuses.includes(statusCode));

    const getInstituteIdFromQueryString = () => {
        const searchParams = new URLSearchParams(location.search);
        const p1 = searchParams.get('P1');
        const p2 = searchParams.get('P2');

        if (p1 && p2) {
            const calculatedHash = getHashCode(p1).toString();
            if (calculatedHash === p2) {
                return parseInt(p1);
            }
        } else if (p1) {
            return parseInt(p1);
        }
        return null;
    };

    const getInstituteIdByUserType = async () => {
        try {
            let id = null;

            if (userType === 64) {
                const response = await agent.get(
                    `/Base/GetPromotingOrganisationIDByInstituteCode/${userInfo?.UserLoginID}`
                );
                id = response.data?.Data;
            }
            else if (userType === 66) {
                const response = await agent.get(
                    `${GetInstituteIDByInstituteCode}/${userInfo?.UserLoginID}`
                );
                id = response.data?.Data;
            }
            else {
                id =
                    getInstituteIdFromQueryString() ||
                    location.state?.instituteId ||
                    sessionStorage.getItem("instituteId");
            }


            if (!id) return null;

            if (userType === 81) {
                try {
                    const res = await agent.get(
                        `${GetPromotingOrganisationIDByTempInstituteID}/${id}`
                    );

                    const convertedId = res.data?.Data;


                    return convertedId ? parseInt(convertedId) : parseInt(id);
                } catch (err) {
                    console.warn("Conversion failed, using base ID");
                    return parseInt(id);
                }
            }

            return parseInt(id);

        } catch (error) {
            console.error("Error getting institute ID:", error);
            return null;
        }
    };
    const getTempInstituteId = async () => {
        if (userType !== 81) return null;

        let id = getInstituteIdFromQueryString() ||
            location.state?.instituteId ||
            sessionStorage.getItem("instituteId");

        return id ? parseInt(id) : null;
    };

    const handleAddAuthorizedRepresentative = async () => {
        let id;

        if (userType === 81) {
            id = await getTempInstituteId();
        } else {
            id = await getInstituteIdByUserType();
        }


        setInstituteId(id);

        setSelectedRoleConfig({
            button: "Update Authorized Representative",
            ManagementTypeID: 5,
            title: "Authorized Representative",
            promoterId: authorizedRepresentative?.PromoterID
        });

        setShowStaffPopup(true);
    };
    const handleAddPrincipalPromoter = async () => {
        let id;    
        if (userType === 81) {
            id = await getTempInstituteId();
        } else {
            id = await getInstituteIdByUserType();
        }

        setInstituteId(id);

        setSelectedRoleConfig({
            button: "Add Principal Promoter",
            ManagementTypeID: 8,
            title: "Principal Promoter"
        });
        setShowStaffPopup(true);
    };

     const fetchIP = async () => {
            try {
                const ip = await getDeviceIP();
                setIpAddress(ip);
            } catch (err) {
                console.error("Failed to get IP:", err);
            }
            };

    const handleAddMember = () => {
        const selectedOption = promoterTypeOptions.find(
            opt => opt.name === selectedPromoterType
        );
        setSelectedRoleConfig({
            button: "Add Promoter",
            ManagementTypeID: selectedOption?.id,
            title: selectedPromoterType
        });
        setShowStaffPopup(true);
    };

    const handleStaffSaved = async () => {
        setShowStaffPopup(false);

        // Show loading indicator
        startLoading();

        try {
            // Wait a moment for the database to update
            await new Promise(resolve => setTimeout(resolve, 500));

            // Re-fetch the institute ID first (like C# Page_Load)
            const id = await getInstituteIdByUserType();

            if (id) {
                // Clear existing data
                setAuthorizedRepresentative(null);
                setPrincipalPromoter(null);
                setMembers([]);

                await fetchPromotersData(id);


            }
        } catch (error) {
            console.error("Error refreshing data:", error);
            Swal.fire("Error", "Failed to refresh data", "error");
        } finally {
            stopLoading();
        }
    };
    const checkPromotingOrganisationAndFetchPromoters = async () => {
        startLoading();
        try {
            let id = await getInstituteIdByUserType();


            if (!id || id === 0) {
                await showInstructionAlert();
                return;
            }

            setInstituteId(id);
            setHasPromotingOrg(true);

            setAuthorizedRepresentative(null);
            setPrincipalPromoter(null);
            setMembers([]);

            await fetchPromotersData(id);

            if (userType === 81) {
                setShowVerificationUI(true);
            }
        } catch (error) {
            console.error("Error:", error);
            await showInstructionAlert();
        } finally {
            stopLoading();
        }
    };

    const fetchPromotersData = async (promotingOrgId) => {
        try {
            const payload = {
                instituteId: promotingOrgId,
                exitInstituteID: 0,
                userLoginID: userInfo?.UserLoginID || "",
                pageCode: "PromotersDetails",
                itemId: "0",
                ipAddress: ipAddress
            };

            const response = await agent.post(
                `${GetPromoterDetailsByInstituteID}`,
                payload
            );




            if (response.data?.Status === "Success" && response.data?.Data) {
                const allPromoters = response.data.Data || [];
                const authPersonList = allPromoters.filter(p => p.PromoterTypeID === 5);
                const chairmanList = allPromoters.filter(p => p.PromoterTypeID === 8);
                const membersList = allPromoters.filter(p =>
                    p.PromoterTypeID !== 5 && p.PromoterTypeID !== 8
                );

                const authRep = authPersonList.length > 0
                    ? authPersonList.reduce((latest, current) =>
                        current.PromoterID > latest.PromoterID ? current : latest
                    )
                    : null;

                const principal = chairmanList.length > 0
                    ? chairmanList.reduce((latest, current) =>
                        current.PromoterID > latest.PromoterID ? current : latest
                    )
                    : null;

                setAuthorizedRepresentative(authRep);
                setPrincipalPromoter(principal);
                setMembers(membersList);

                if (chairmanList.length > 0) {
                    setIsSameDisabled(true);
                    if (authRep && principal && authRep.StaffId === principal.StaffId) {
                        setIsSamePerson(true);
                    } else {
                        setIsSamePerson(false);
                    }
                } else {
                    if (userType === 64) {
                        setIsSameDisabled(true);
                    } else if (userType === 81) {
                        setIsSameDisabled(false);
                    }
                    setIsSamePerson(false);
                }
            } else {
                setAuthorizedRepresentative(null);
                setPrincipalPromoter(null);
                setMembers([]);
                if (userType === 81) {
                    setIsSameDisabled(false);
                } else {
                    setIsSameDisabled(true);
                }
                setIsSamePerson(false);
            }
        } catch (error) {
            console.error("Error fetching promoters data:", error);
            setAuthorizedRepresentative(null);
            setPrincipalPromoter(null);
            setMembers([]);
        }
    };

    const showInstructionAlert = async () => {
        const result = await Swal.fire({
            title: 'Promoters Not Updated',
            width: '700px',
            html: `
          <div class="text-left w-full">
              <p class="mb-3">Promoters for this Skill Development Institute are not updated. To update Promoters details, follow below mentioned process:</p>
              <ol class="list-decimal ml-5 space-y-2">
                  <li>Register Promoting Organization. Refer User Manual for Promoting Organization for detailed process</li>
                  <li>Update "Promoters" page in Promoting Organization account.</li>
                  <li>The Promoters details shall be displayed on this page once Promoters are updated in Promoting Organization account.</li>
              </ol>
          </div>
      `,
            icon: 'info',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'bg-[#00c3f9] hover:bg-[#00a8d6] text-white rounded px-6 py-2'
            },
            buttonsStyling: false,
            allowOutsideClick: false,
            allowEscapeKey: false
        });

        if (result.isConfirmed) {
            window.history.back();
        }
    };

    const extractProfileId = (htmlString) => {
        if (!htmlString) return '';
        const cleanText = htmlString.replace(/<[^>]*>/g, '');
        return cleanText;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStatusIcon = (status) => {
        const verifiedStatuses = ["A", "V", "Active", "Verified"];

        if (verifiedStatuses.includes(status)) {
            return (
                <div className="flex justify-center">
                    <img alt="verified" src={VerifiedIcon} className="w-8 h-8" />
                </div>
            );
        }

        return (
            <div className="flex justify-center">
                <img alt="not-verified" src={QuestionMark} className="w-8 h-8" />
            </div>
        );
    };

    const handlePrintProfile = (profileID, staffId) => {
        if (!profileID && !staffId) {
            Swal.fire("Info", "No Profile ID available", "info");
            return;
        }
        const displayId = profileID || staffId;
        const popupWidth = 1000;
        const popupHeight = 750;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;
        window.open(
            `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffId}&userLoginID=${displayId}&pageCode=STAFF_PRINT`,
            "StaffPrintApplicationForm",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    };

    const handleUpdateVerification = async (status) => {
        try {
            startLoading();

            let finalInstituteId = instituteId;
            if (userType === 81) {
                finalInstituteId = await getTempInstituteId();
            } else {
                finalInstituteId = instituteId;
            }


            const payload = {
                instituteID: finalInstituteId,
                remark: rejectReason || "",
                status: status,
                pageCode: "PromotersDetails",
                createdBy: userInfo?.UserLoginID,
                ipAddress: ipAddress
            };

            const response = await agent.post(
                "/api/InstituteBase/update-verification-status",
                payload
            );

            if (response.data?.success) {

                const hash = getHashCode(finalInstituteId.toString());
                navigate(`/Institute/ProposedInstituteDetails?P1=${finalInstituteId}&P2=${hash}`);
            } else {
                Swal.fire("Error", response.data?.message || "Update failed", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Something went wrong", "error");
        } finally {
            stopLoading();
        }
    };
    const handleSamePersonChange = async (value) => {
        setIsSamePerson(value);

        if (value === true) {
            if (authorizedRepresentative) {
                
                startLoading();
                try {
                   let instituteID = await getInstituteIdByUserType();
                    

                    const payload = {
                        ID: 0,
                        InstituteID: instituteID,
                        StaffID: extractProfileId(authorizedRepresentative.StaffProfileId) || 0,
                        ManagementType: 8,
                        CreateBy: userInfo?.UserLoginID || "system",
                        IPAddress: ipAddress
                    };

                    const res = await agent.post(`${SaveInstitutePromoterStaffMappingDetails}`, payload);
                    

                    const id = await getInstituteIdByUserType();
                    
                    if (id) {
                        await fetchPromotersData(id);
                    }

                    setIsSameDisabled(true);

                    Swal.fire({
                        icon: "success",
                        title: "Saved",
                        text: "Promoter details Saved successfully",
                        timer: 2000,
                        showConfirmButton: false
                    });
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to add Principal Promoter",
                        timer: 2000,
                        showConfirmButton: false
                    });
                    setIsSamePerson(false);
                } finally {
                    stopLoading();
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Please add Authorized Representative first",
                    timer: 2000,
                    showConfirmButton: false
                });
                setIsSamePerson(false);
            }
        } else {
            setIsSameDisabled(false);
        }
    };
    const renderPromoterRow = (promoter, isClickable = true) => {
        if (!promoter) return null;

        const profileId = extractProfileId(promoter.StaffProfileId) || promoter.StaffId;
        const effectivePrincipal =
            isSamePerson ? authorizedRepresentative : principalPromoter;
        return (
            <tr className="bg-white">
                <td className="border border-gray-300 px-2 py-1 text-center">
                    {isClickable ? (
                        <a
                            href="#"
                            className="text-blue-600 hover:text-blue-800 underline text-xs cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                handlePrintProfile(profileId, promoter.StaffId);
                            }}
                        >
                            {profileId}
                        </a>
                    ) : (
                        <span className="text-gray-700">{profileId}</span>
                    )}
                </td>
                <td className="border border-gray-300 text-center px-2 py-1 text-xs">{promoter.Title || '-'}</td>
                <td className="border border-gray-300 text-center px-2 py-1 text-xs">{promoter.FirstName || '-'}</td>
                <td className="border border-gray-300 text-center px-2 py-1 text-xs">{promoter.MiddleName || '-'}</td>
                <td className="border border-gray-300 text-center px-2 py-1 text-xs">{promoter.LastName || '-'}</td>
                <td className="border border-gray-300 text-center px-2 py-1 text-xs">{promoter.GenderCode || '-'}</td>
                <td className="border border-gray-300 text-center px-2 py-1 text-xs">
                    {promoter.FormatDOB || formatDate(promoter.DOB) || '-'}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-xs">{promoter.MobileNo || '-'}</td>
                <td className="border border-gray-300 px-2 py-1">
                    {getStatusIcon(promoter.IsapprovedPromoter)}
                </td>
            </tr>
        );
    };

    const handleBack = () => {
        let id = null;

        if (userType === 81) {
            const searchParams = new URLSearchParams(location.search);
            id = searchParams.get("P1");

            if (id) {
                id = parseInt(id);
                const hash = getHashCode(id.toString());

                navigate(
                    `/Institute/PromotingOrganization?P1=${id}&P2=${hash}`
                );
            } else {
                navigate("/Institute/PromotingOrganization");
            }
        } else {
            window.history.back();
        }
    };

    const handleNext = () => {
        if (userInfo.UserTypeID === 64) {
            navigate('/Institute/ProposedInstituteDetails');
        } else {
            navigate('/institute/InstituteProfile');
        }
    };

    const handleClose = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to close?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes",
            cancelButtonText: "No"
        });

        if (result.isConfirmed) {
             if(userInfo?.UserTypeID == 64){
                navigate("/tinstitute/dashboard");
                return;
             }
            let id = null;

            if (userType === 81) {
                const searchParams = new URLSearchParams(location.search);
                id = searchParams.get('P1');
                if (id) id = parseInt(id);
            } else {
                id = instituteId || getInstituteIdFromQueryString() || sessionStorage.getItem("instituteId");
            }

            if (id) {
                const hash = getHashCode(id.toString());
                window.location.href = `/React/InstituteDash?P1=${id}&P2=${hash}`;
            } else {
                window.location.href = '/React/InstituteDash';
            }
        }
    };

    useEffect(() => {
        checkPromotingOrganisationAndFetchPromoters();
        fetchIP();
        
    }, []);

    useEffect(() => {

        const fetchStatus = async () => {
            const id = await getInstituteIdByUserType();
            if (!id) return;
            const instId = userInfo?.UserID;
            try {
                const res = await agent.get(
                    `/api/InstituteBase/GetProposedInstituteStatus/${instId}`
                );


                const status = res.data?.Data || res.data?.Status;
                const remark =
                    res.data?.Remark ||
                    res.data?.Data1 ||
                    res.data?.remark ||
                    "";

                setStatusCode(status);

                if (userType !== 81) {
                    if (status?.IsPromotors === "V") {

                        setVerificationStatus("V");
                        setVerificationRemark(remark || "ALREADY VERIFIED");
                    } else if (status === "R") {
                        setVerificationStatus("R");
                        setVerificationRemark(remark);
                    } else {
                        setVerificationStatus("");
                        setVerificationRemark("");
                    }
                }

            } catch (err) {
                console.error("Error fetching status:", err);
            }
        };

        fetchStatus();
    }, []);

    useEffect(() => {
        if (userType === 81 && authorizedRepresentative && principalPromoter) {
            

            const isAuthVerified =
                authorizedRepresentative?.IsapprovedPromoter?.toUpperCase() === "V";

            const isPrincipalVerified =
                principalPromoter?.IsapprovedPromoter?.toUpperCase() === "V";

            if (isAuthVerified || isPrincipalVerified) {
                setApprovalStatus("V");
                setRejectReason("ALREADY VERIFIED");
            } else {
                setApprovalStatus("R");
                setRejectReason(
                    "Authorized Representative and/ or Principal Promoter not yet verified. Verify Authorized Representative and/ or Principal Promoter Profile."
                );
            }
        }
    }, [authorizedRepresentative, principalPromoter]);
    useEffect(() => {
        let filtered = members.filter(m => m.PromoterType === selectedPromoterType);
        if (filtered.length === 0 && members.length > 0) {
            filtered = members;
        }
        setFilteredMembers(filtered);
    }, [selectedPromoterType, members]);

    useEffect(() => {
        if (members.length > 0) {
            setSelectedPromoterType(members[0].PromoterType);
        }
    }, [members]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }

    if (!hasPromotingOrg) {
        return null;
    }

    return (
        <div className="w-full p-4">
            <fieldset className='mb-4 rounded-md border p-4'>
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    <span>Promoters</span>
                </legend>

                <div className="px-4 pb-3 pt-3">
                    {/* Pink Note Box */}
                    <div className="bg-red-100 border border-red-300 text-red-900 px-3 py-2 rounded text-sm mb-4">
                        <strong>Note:</strong>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>
                                To edit Authorized Representative/ Principal Promoter/ Promoter profile information, login to respective Staff/ Management account and edit profile.
                            </li>
                            <li>
                                To change assigned Authorized Representative/ Principal Promoter/ Promoter, login to respective Promoting Organization and edit Promoters.
                            </li>
                        </ol>
                    </div>

                    {/* Authorized Representative Section */}
                    <div className="mb-4">

                        {/* ✅ GRAY HEADER ONLY */}
                        <div className="bg-gray-200 px-3 py-2 rounded-t">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Authorized Representative of Promoting Organization<span className='text-red-500'>*</span>
                            </h3>
                        </div>

                        <div className="bg-white border border-gray-300 rounded-b p-3">


                            {isEditableUser && (
                                <div className="flex justify-center mb-3">
                                    {authorizedRepresentative ? (
                                        <Button
                                            onClick={handleAddAuthorizedRepresentative}
                                            className="text-xs px-5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md shadow-sm"
                                        >

                                            Update Authorized Representative
                                        </Button>
                                    ) : (
                                        <Button onClick={handleAddAuthorizedRepresentative} className="text-xs px-5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md shadow-sm">
                                            + Add Authorized Representative
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* TABLE */}
                            {authorizedRepresentative ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300 text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border px-2 py-2 text-xs">Profile ID</th>
                                                <th className="border px-2 py-2 text-xs">Title</th>
                                                <th className="border px-2 py-2 text-xs">First Name</th>
                                                <th className="border px-2 py-2 text-xs">Middle Name</th>
                                                <th className="border px-2 py-2 text-xs">Last Name</th>
                                                <th className="border px-2 py-2 text-xs">Gender</th>
                                                <th className="border px-2 py-2 text-xs">DOB</th>
                                                <th className="border px-2 py-2 text-xs">Mobile</th>
                                                <th className="border px-2 py-2 text-xs">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {renderPromoterRow(authorizedRepresentative)}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-4">
                                    No Authorized Representative found.
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Principal Promoter Section */}
                    <div className="mb-4">
                        <div className="bg-gray-200 px-3 py-2 rounded-t">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Principal Promoter<span className='text-red-500'>*</span>
                            </h3>
                        </div>

                        <div className="bg-white border border-gray-300 rounded-b p-3">

                            <div className="mb-3 flex items-center gap-4 justify-left">
                                <span className="text-sm font-medium text-gray-700">
                                    Is Authorized Representative and Principal Promoter same ?
                                </span>

                                <label className="flex items-center gap-1">
                                    <input
                                        type="radio"
                                        name="isSame"
                                        value="Yes"
                                        checked={isSamePerson === true}
                                        onChange={() => handleSamePersonChange(true)}
                                        disabled={userType === 64}
                                    />
                                    <span>Yes</span>
                                </label>

                                <label className="flex items-center gap-1">
                                    <input
                                        type="radio"
                                        name="isSame"
                                        value="No"
                                        checked={isSamePerson === false}
                                        onChange={() => handleSamePersonChange(false)}
                                        disabled={userType === 64}
                                    />
                                    <span>No</span>
                                </label>
                            </div>

                            {/* Add Principal Promoter button - always visible for Secretary when status allows */}
                            {userType === 81 && (
                                <div className="flex justify-center mb-3">
                                    <Button onClick={handleAddPrincipalPromoter} className="text-xs px-5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md shadow-sm">
                                        Add Principal Promoter
                                    </Button>
                                </div>
                            )}

                            {/* Show table based on selection */}
                            {isSamePerson === true ? (
                                authorizedRepresentative ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-300 text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="border px-2 py-2 text-xs">Profile ID</th>
                                                    <th className="border px-2 py-2 text-xs">Title</th>
                                                    <th className="border px-2 py-2 text-xs">First Name</th>
                                                    <th className="border px-2 py-2 text-xs">Middle/ Father/ Husband Name</th>
                                                    <th className="border px-2 py-2 text-xs">Last/ Surname</th>
                                                    <th className="border px-2 py-2 text-xs">Gender</th>
                                                    <th className="border px-2 py-2 text-xs">Date of Birth</th>
                                                    <th className="border px-2 py-2 text-xs">Mobile No.</th>
                                                    <th className="border px-2 py-2 text-xs">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {renderPromoterRow(authorizedRepresentative)}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-4">
                                        No Authorized Representative found.
                                    </div>
                                )
                            ) : (
                                principalPromoter ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-300 text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="border px-2 py-2 text-xs">Profile ID</th>
                                                    <th className="border px-2 py-2 text-xs">Title</th>
                                                    <th className="border px-2 py-2 text-xs">First Name</th>
                                                    <th className="border px-2 py-2 text-xs">Middle/ Father/ Husband Name</th>
                                                    <th className="border px-2 py-2 text-xs">Last/ Surname</th>
                                                    <th className="border px-2 py-2 text-xs">Gender</th>
                                                    <th className="border px-2 py-2 text-xs">Date of Birth</th>
                                                    <th className="border px-2 py-2 text-xs">Mobile No.</th>
                                                    <th className="border px-2 py-2 text-xs">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {renderPromoterRow(principalPromoter)}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
                                        No Principal Promoter found.
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    {/* Members Section */}
                    <div className="mb-4">

                        <div className="bg-gray-200 px-3 py-2 rounded-t">
                            <h3 className="text-sm font-semibold text-gray-800">Member</h3>
                        </div>

                        <div className="bg-white border border-gray-300 rounded-b p-3">

                            <div className="flex justify-center items-center gap-3 mb-3 flex-wrap">

                                {/* Label */}
                                <span className="text-sm font-medium text-gray-700">
                                    Promoter Type :
                                </span>

                                {/* Dropdown */}
                                <div className="w-64">
                                    <DropdownComponent
                                        label=""
                                        name="PromoterType"
                                        options={formatOptions(promoterTypeOptions)}
                                        value={selectedPromoterType}
                                        onChange={(value) => setSelectedPromoterType(value)}
                                        required={false}
                                        loading={false}
                                        disabled={members.length > 0 || userType === 64}
                                    />
                                </div>

                                {/* Button */}
                                {isEditableUser && (
                                    <Button onClick={handleAddMember} className="text-xs px-5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md shadow-sm">
                                        Add Promoter
                                    </Button>
                                )}
                            </div>

                            {filteredMembers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300 text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border px-2 py-2 text-xs">Sr. No.</th>
                                                <th className="border px-2 py-2 text-xs">Profile ID</th>
                                                <th className="border px-2 py-2 text-xs">Promoter Type</th>
                                                <th className="border px-2 py-2 text-xs">Title</th>
                                                <th className="border px-2 py-2 text-xs">First Name</th>
                                                <th className="border px-2 py-2 text-xs">Middle Name</th>
                                                <th className="border px-2 py-2 text-xs">Last Name</th>
                                                <th className="border px-2 py-2 text-xs">Gender</th>
                                                <th className="border px-2 py-2 text-xs">DOB</th>
                                                <th className="border px-2 py-2 text-xs">Mobile</th>
                                                <th className="border px-2 py-2 text-xs">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMembers.map((member, index) => {
                                                const profileId = extractProfileId(member.StaffProfileId) || member.StaffId;
                                                return (
                                                    <tr key={member.PromoterID || index}>
                                                        <td className="border px-2 py-1 text-xs text-center">{index + 1}</td>
                                                        <td className="border px-2 py-1 text-xs text-center">
                                                            <a
                                                                href="#"
                                                                className="text-blue-600 hover:text-blue-800 underline text-xs cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handlePrintProfile(profileId, member.StaffId);
                                                                }}
                                                            >
                                                                {profileId}
                                                            </a>
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs text-center">{member.PromoterType}</td>
                                                        <td className="border px-2 py-1 text-xs text-center">{member.Title}</td>
                                                        <td className="border px-2 py-1 text-xs text-center">{member.FirstName}</td>
                                                        <td className="border px-2 py-1 text-xs text-center">{member.MiddleName}</td>
                                                        <td className="border px-2 py-1 text-xs text-center">{member.LastName}</td>
                                                        <td className="border px-2 py-1 text-xs text-center">{member.GenderCode}</td>
                                                        <td className="border px-2 py-1 text-xs text-center">
                                                            {member.FormatDOB || formatDate(member.DOB)}
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs">{member.MobileNo}</td>
                                                        <td className="border px-2 py-1">
                                                            {getStatusIcon(member.IsapprovedPromoter)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-4 border rounded">
                                    {members.length > 0
                                        ? 'No members found for selected promoter type.'
                                        : 'No members found.'}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Secretary Verification Section */}
                    {showVerificationUI && userType === 81 && (
                        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                            <h3 className="text-md font-normal mb-3">Select Approved Reject Status *</h3>

                            <div className="flex gap-6 mb-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="verificationStatus"
                                        value="V"
                                        checked={approvalStatus === 'V'}
                                        onChange={(e) => setApprovalStatus(e.target.value)}
                                        disabled={true}
                                        className="form-radio h-4 w-4 text-green-600"
                                    />
                                    <span className="ml-2 text-sm">Verified</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="verificationStatus"
                                        value="R"
                                        checked={approvalStatus === 'R'}
                                        onChange={(e) => setApprovalStatus(e.target.value)}
                                        disabled={true}
                                        className="form-radio h-4 w-4 text-red-600"
                                    />
                                    <span className="ml-2 text-sm">Rejected</span>
                                </label>
                            </div>

                            {(approvalStatus === 'R' || userType === 81) && (
                                <div className="mb-4">
                                    <label className="block text-sm font-normal mb-2">
                                        Reason for Rejection/ Remark
                                        {approvalStatus === 'R' && !isAlreadyVerified && <span className="text-red-500">*</span>}
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm uppercase"
                                        rows="3"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value.toUpperCase())}
                                        placeholder="Enter remark..."
                                    />
                                </div>
                            )}


                        </div>
                    )}
                    {userType !== 81 &&
                        (verificationStatus === "R" || verificationStatus === "V") && (

                            <div className="mt-4 p-3 rounded border">

                                {verificationStatus === "R" && (
                                    <div className="text-red-600">
                                        <p className="font-normal">Verification Status: Rejected</p>
                                        <p className="text-sm">
                                            Reason for Rejection/ Remark : {verificationRemark?.toUpperCase()}
                                        </p>
                                    </div>
                                )}

                                {verificationStatus === "V" && (
                                    <div className="text-green-600">
                                        <p className="font-normal">Verification Status: Verified</p>
                                        <p className="text-sm">
                                            Reason for Rejection/ Remark : {verificationRemark?.toUpperCase()}
                                        </p>
                                    </div>
                                )}

                            </div>
                        )}

                    <div className='flex justify-center gap-3 mt-6 mb-4'>

                        <Button variant='primary' onClick={handleBack}>
                            Back
                        </Button>
                        {authorizedRepresentative && (isSamePerson || principalPromoter) && (
                            <Button
                                onClick={() => {
                                    if (!authorizedRepresentative || (!isSamePerson && !principalPromoter)) {
                                        Swal.fire("Info", "Authorized Representative or Principal Promoter missing");
                                        return;
                                    }

                                    if (userType === 81) {
                                        handleUpdateVerification(approvalStatus);
                                    } else {
                                        handleNext();
                                    }
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow"
                            >
                                {userType === 81 ? "Save & Next" : "Next"}
                            </Button>
                        )}
                        <Button variant='danger' onClick={handleClose}>
                            Close
                        </Button>
                    </div>

                    {/* Staff Profile Popup */}
                    <StaffProfilePopup
                        open={showStaffPopup}
                        onClose={() => setShowStaffPopup(false)}
                        roleConfig={selectedRoleConfig}
                        onSaved={handleStaffSaved}
                        IsPromotorForm={true}
                        instituteId={instituteId}
                    />
                </div>
            </fieldset>
        </div>

    );
};

export default PromotersDetails;

