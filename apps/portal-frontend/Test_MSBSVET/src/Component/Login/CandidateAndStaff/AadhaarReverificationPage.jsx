import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import VerifiedIcon from "../../../assets/VerifiedIcon.jpg";
import { useAuth } from "../../../Hooks/AuthContext";
import { ThemeContext } from "../../Context/ThemeContext";
import agent from "../../../lib/api/agent";
import { GetCandidatePrimary, SaveCandidatePrimary } from "../../../Endpoints_All/Candidate/primary";
import { GetStaffPrimary, SaveStaffPrimary } from "../../../Endpoints_All/Staff/primary";
import { aadhaarReVerification, aadhaarVerification } from "../../../Endpoints_All/Base/masterData";
import AadhaarVerificationModal from "../../formcomponent/AadhaarVerificationPopup";
import ProgressTracker from "./ProgressTracker";
import { getDeviceIP } from "../../../utils/CommonHelper";

const AadhaarReverificationPage = () => {
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const { color } = useContext(ThemeContext);
    const [searchParams] = useSearchParams();
    const [ipAddress, setIpAddress] = useState("");

    // States
    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        gender: "",
        aadhaarNo: "",
        userLoginID: "",
        candidateId: "",
        staffId: "",
        // Additional fields for save
        itiRegistrationNo: "",
        photoFilePath: "",
        signFilePath: "",
        dobFilePath: "",
        aadhaarFilePath: "",
        mobileNo: "",
        altMobileNo: "",
        eMailID: "",
        // Staff specific
        listJobRole: [],
        jobRole: "",
        steppID: 0,
        // Verification fields
        isFirstNameVerify: "",
        isMiddleNameVerify: "",
        isLastNameVerify: "",
        isPhotoFilePathVerify: "",
        isSignFilePathVerify: "",
        isGenderCodeVerify: "",
        isDOBVerify: "",
        isDOBFilePathVerify: "",
        isAadhaarNoVerify: "",
        isAadhaarFilePathVerify: "",
        firstNameVerifyRemark: "",
        middleNameVerifyRemark: "",
        lastNameVerifyRemark: "",
        photoFilePathVerifyRemark: "",
        signFilePathVerifyRemark: "",
        genderCodeVerifyRemark: "",
        dobVerifyRemark: "",
        dobFilePathVerifyRemark: "",
        aadhaarNoVerifyRemark: "",
        aadhaarFilePathVerifyRemark: "",
        rejectCnt: "",
        verifyCnt: "",
        isAddhareVerify: true,
    });
    const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
    const [isAadhaarReverified, setIsAadhaarReverified] = useState(false);
    const [showAadhaarModal, setShowAadhaarModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userType, setUserType] = useState("");
    const [saving, setSaving] = useState(false);
    const hasShownIncompletePromptRef = useRef(false);

    const candidateIdFromUrl = searchParams.get("candidateId");
    const applicationId = searchParams.get("applicationId");

    const userTypeID = userInfo?.UserTypeID;
    //const effectiveCandidateId = Number(userTypeID) === 61 ? candidateIdFromUrl : userInfo?.UserID;

    // Fetch IP on mount
    useEffect(() => {
        fetchIP();
    }, []);

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (error) {
            console.error("Error fetching IP:", error);
        }
    };

    useEffect(() => {
        if (loading) return;
        if (hasShownIncompletePromptRef.current) return;
        if (!userType) return; // wait until we know Candidate vs Staff

        const hasPrimaryDetails =
            formData.firstName?.trim() &&
            formData.dob &&
            formData.gender &&
            formData.aadhaarNo;

        const isIncomplete = !isAadhaarVerified || !hasPrimaryDetails;

        if (isIncomplete) {
            hasShownIncompletePromptRef.current = true;

            Swal.fire({
                title: "Primary Details Not Completed",
                text: "You need to complete Aadhaar verification and your primary details before you can reverify.",
                icon: "warning",
                confirmButtonText: "Go to Primary Details",
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then(() => {
                if (userType === "Candidate") {
                    navigate("/Candidate/Primary");
                } else if (userType === "Staff") {
                    navigate("/Staff/Primary");
                }
            });
        }
    }, [loading, isAadhaarVerified, formData.firstName, formData.dob, formData.gender, formData.aadhaarNo, userType, navigate]);

    // Determine user type and fetch data
    useEffect(() => {
        if (!userInfo?.UserLoginID) return;

        const userLoginID = userInfo.UserLoginID;

        if (userLoginID.includes("C") || Number(userTypeID) === 91) {
            setUserType("Candidate");
            fetchCandidateData();
        } else if (userLoginID.includes("S") || Number(userTypeID) === 95) {
            setUserType("Staff");
            fetchStaffData();
        }
    }, [userInfo, candidateIdFromUrl]);

    const fetchCandidateData = async () => {
        try {
            setLoading(true);

            let candidateId;
            candidateId = userInfo?.UserID;

            const response = await agent.get(`${GetCandidatePrimary}?candidateId=${candidateId}`);
            const data = response.data.Data;

            if (data) {
                setFormData((prev) => ({
                    ...prev,
                    firstName: data.FirstName || "",
                    middleName: data.MiddleName || "",
                    lastName: data.LastName || "",
                    dob: formatDateToDDMMYYYY(data.DOB) || "",
                    gender: data.GenderCode || "",
                    aadhaarNo: data.AadhaarNo || "",
                    userLoginID: data.UserLoginID || userInfo?.UserLoginID || "",
                    candidateId: data.CandidateID || candidateId,
                    // Additional fields
                    itiRegistrationNo: data.ITIRegistrationNo || "",
                    photoFilePath: data.PhotoFilePath || "",
                    signFilePath: data.SignFilePath || "",
                    dobFilePath: data.DOBFilePath || "",
                    aadhaarFilePath: data.AadhaarFilePath || "",
                    mobileNo: data.MobileNo || "",
                    altMobileNo: data.AltMobileNo || "",
                    eMailID: data.EMailID || "",
                }));

                // Check if Aadhaar is already verified
                const isVerified = data.IsAadhaarVerified === true ||
                    data.IsAadhaarVerified === 1 ||
                    data.IsAadhaarVerified === "1" ||
                    data.IsAddhareVerify === true ||
                    data.IsAddhareVerify === 1 ||
                    data.IsAddhareVerify === "1";

                setIsAadhaarVerified(isVerified);
                setIsAadhaarReverified(data.IsAadhaarReverified === true ||
                    data.IsAadhaarReverified === 1 ||
                    data.IsAadhaarReverified === "1");
            }
        } catch (error) {
            console.error("Error fetching candidate data:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to fetch profile data. Please try again.",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffData = async () => {
        try {
            setLoading(true);

            const staffId = userInfo?.UserID;
            const numericStaffId = parseInt(staffId?.toString().slice(-6)) || 0;

            const requestBody = {
                StaffID: numericStaffId,
                UserLoginID: userInfo?.UserLoginID || "",
                PageCode: "Primary",
                IPAddress: ipAddress,
            };

            const response = await agent.post(GetStaffPrimary, requestBody);
            const data = response.data.Data;

            if (data) {
                setFormData((prev) => ({
                    ...prev,
                    firstName: data.FirstName || "",
                    middleName: data.MiddleName || "",
                    lastName: data.LastName || "",
                    dob: formatDateToDDMMYYYY(data.DOB) || "",
                    gender: data.GenderCode || "",
                    aadhaarNo: data.AadhaarNo || "",
                    userLoginID: data.UserLoginID || userInfo?.UserLoginID || "",
                    staffId: data.StaffID || numericStaffId,
                    // Additional fields
                    itiRegistrationNo: data.ITIRegistrationNo || "",
                    photoFilePath: data.PhotoFilePath || "",
                    signFilePath: data.SignFilePath || "",
                    dobFilePath: data.DOBFilePath || "",
                    aadhaarFilePath: data.AadhaarFilePath || "",
                    mobileNo: data.MobileNo || "",
                    altMobileNo: data.AltMobileNo || "",
                    eMailID: data.EMailID || "",
                    // Staff specific fields
                    listJobRole: data.ListJobRole || [],
                    jobRole: data.JobRole || "",
                    steppID: data.SteppID || 0,
                    // Verification fields
                    isFirstNameVerify: data.IsFirstNameVerify || "",
                    isMiddleNameVerify: data.IsMiddleNameVerify || "",
                    isLastNameVerify: data.IsLastNameVerify || "",
                    isPhotoFilePathVerify: data.IsPhotoFilePathVerify || "",
                    isSignFilePathVerify: data.IsSignFilePathVerify || "",
                    isGenderCodeVerify: data.IsGenderCodeVerify || "",
                    isDOBVerify: data.IsDOBVerify || "",
                    isDOBFilePathVerify: data.IsDOBFilePathVerify || "",
                    isAadhaarNoVerify: data.IsAadhaarNoVerify || "",
                    isAadhaarFilePathVerify: data.IsAadhaarFilePathVerify || "",
                    firstNameVerifyRemark: data.FirstNameVerifyRemark || "",
                    middleNameVerifyRemark: data.MiddleNameVerifyRemark || "",
                    lastNameVerifyRemark: data.LastNameVerifyRemark || "",
                    photoFilePathVerifyRemark: data.PhotoFilePathVerifyRemark || "",
                    signFilePathVerifyRemark: data.SignFilePathVerifyRemark || "",
                    genderCodeVerifyRemark: data.GenderCodeVerifyRemark || "",
                    dobVerifyRemark: data.DOBVerifyRemark || "",
                    dobFilePathVerifyRemark: data.DOBFilePathVerifyRemark || "",
                    aadhaarNoVerifyRemark: data.AadhaarNoVerifyRemark || "",
                    aadhaarFilePathVerifyRemark: data.AadhaarFilePathVerifyRemark || "",
                    rejectCnt: data.RejectCnt || "",
                    verifyCnt: data.VerifyCnt || "",
                    isAddhareVerify: data.IsAddhareVerify || true,
                }));

                const isVerified = data.IsAadhaarVerified === true ||
                    data.IsAadhaarVerified === 1 ||
                    data.IsAadhaarVerified === "1" ||
                    data.IsAddhareVerify === true ||
                    data.IsAddhareVerify === 1 ||
                    data.IsAddhareVerify === "1";

                setIsAadhaarVerified(isVerified);
                setIsAadhaarReverified(data.IsAadhaarReverified === true ||
                    data.IsAadhaarReverified === 1 ||
                    data.IsAadhaarReverified === "1");
            }
        } catch (error) {
            console.error("Error fetching staff data:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to fetch profile data. Please try again.",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDateToDDMMYYYY = (dateString) => {
        if (!dateString) return "";

        if (dateString.includes("/")) {
            return dateString;
        }

        if (dateString.includes("T") || dateString.includes("-")) {
            try {
                let datePart = dateString;
                if (dateString.includes("T")) {
                    datePart = dateString.split("T")[0];
                }

                const parts = datePart.split("-");
                if (parts.length === 3) {
                    const year = parts[0];
                    const month = parts[1];
                    const day = parts[2];
                    return `${day}/${month}/${year}`;
                }
            } catch (e) {
                console.error("Error parsing date:", e);
            }
        }

        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }
        } catch (e) { }

        return dateString;
    };

    // // Format DOB for API (YYYY-MM-DDThh:mm:ss.sssZ)
    // const formatDOBForAPI = (dob) => {
    //     if (!dob) return new Date().toISOString();

    //     // If already in DD/MM/YYYY format, convert to ISO
    //     if (dob.includes("/")) {
    //         const [dd, mm, yyyy] = dob.split("/").map(Number);
    //         const date = new Date(yyyy, mm - 1, dd);
    //         if (!isNaN(date.getTime())) {
    //             return date.toISOString();
    //         }
    //     }

    //     // If it's already in ISO format, return as is
    //     if (dob.includes("T")) {
    //         return dob;
    //     }

    //     // If it's in YYYY-MM-DD format
    //     if (dob.includes("-")) {
    //         const date = new Date(dob);
    //         if (!isNaN(date.getTime())) {
    //             return date.toISOString();
    //         }
    //     }

    //     return new Date().toISOString();
    // };


    const formatDOBForAPI = (dob) => {
        if (!dob) return "";

        // DD/MM/YYYY
        if (dob.includes("/")) {
            const [dd, mm, yyyy] = dob.split("/");

            return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
        }

        // Already YYYY-MM-DD or ISO
        if (dob.includes("T")) {
            return dob.split("T")[0];
        }

        if (dob.includes("-")) {
            return dob.split("T")[0];
        }

        return dob;
    };

    // ✅ Save updated details after reverification
    const saveUpdatedDetails = async (verifiedData) => {
        setSaving(true);

        try {
            const isCandidate = userType === "Candidate" || Number(userTypeID) === 91;
            const isStaff = userType === "Staff" || Number(userTypeID) === 95;

            if (isCandidate) {

                const candidateId = formData.candidateId || userInfo?.UserID;

                // Build payload matching Swagger schema
                const submissionData = {
                    candidateID: parseInt(candidateId) || 0,
                    itiRegistrationNo: formData.itiRegistrationNo || "",
                    firstName: verifiedData.firstName || formData.firstName || "",
                    middleName: verifiedData.middleName || formData.middleName || "",
                    lastName: verifiedData.lastName || formData.lastName || "",
                    photoFilePath: formData.photoFilePath || "",
                    signFilePath: formData.signFilePath || "",
                    genderCode: verifiedData.gender || formData.gender || "",
                    dob: formatDOBForAPI(verifiedData.dob || formData.dob),
                    dobFilePath: formData.dobFilePath || "",
                    aadhaarNo: verifiedData.aadhaarNo || formData.aadhaarNo || "",
                    aadhaarFilePath: formData.aadhaarFilePath || "",
                    mobileNo: formData.mobileNo || "",
                    altMobileNo: formData.altMobileNo || "",
                    eMailID: formData.eMailID || "",
                    userLoginID: userInfo?.UserLoginID || "",
                    ipAddress: ipAddress || "",
                    pageCode: "Primary",
                    isAadhaarVerified: true,
                    isForReverification : 1
                };

                const response = await agent.post(SaveCandidatePrimary, submissionData);

                if (response.status === 200 || response.status === 201) {
                    return true;
                }
                return false;
            } else if (isStaff) {

                const staffId = formData.staffId || userInfo?.UserID;
                const numericStaffId = parseInt(staffId?.toString().slice(-6)) || 0;

                // Build payload matching Swagger schema
                const submissionData = {
                    staffID: numericStaffId || 0,
                    itiRegistrationNo: formData.itiRegistrationNo || "",
                    firstName: verifiedData.firstName || formData.firstName || "",
                    middleName: verifiedData.middleName || formData.middleName || "",
                    lastName: verifiedData.lastName || formData.lastName || "",
                    photoFilePath: formData.photoFilePath || "",
                    signFilePath: formData.signFilePath || "",
                    genderCode: verifiedData.gender || formData.gender || "",
                    dob: formatDOBForAPI(verifiedData.dob || formData.dob),
                    dobFilePath: formData.dobFilePath || "",
                    aadhaarNo: verifiedData.aadhaarNo || formData.aadhaarNo || "",
                    aadhaarFilePath: formData.aadhaarFilePath || "",
                    mobileNo: formData.mobileNo || "",
                    altMobileNo: formData.altMobileNo || "",
                    eMailID: formData.eMailID || "",
                    userLoginID: userInfo?.UserLoginID || "",
                    ipAddress: ipAddress || "",
                    pageCode: "Primary",
                    listJobRole: formData.listJobRole || [],
                    jobRole: formData.jobRole || "",
                    steppID: formData.steppID || 0,
                    // Verification fields - preserve existing values
                    isFirstNameVerify: formData.isFirstNameVerify || "",
                    isMiddleNameVerify: formData.isMiddleNameVerify || "",
                    isLastNameVerify: formData.isLastNameVerify || "",
                    isPhotoFilePathVerify: formData.isPhotoFilePathVerify || "",
                    isSignFilePathVerify: formData.isSignFilePathVerify || "",
                    isGenderCodeVerify: formData.isGenderCodeVerify || "",
                    isDOBVerify: formData.isDOBVerify || "",
                    isDOBFilePathVerify: formData.isDOBFilePathVerify || "",
                    isAadhaarNoVerify: formData.isAadhaarNoVerify || "",
                    isAadhaarFilePathVerify: formData.isAadhaarFilePathVerify || "",
                    firstNameVerifyRemark: formData.firstNameVerifyRemark || "",
                    middleNameVerifyRemark: formData.middleNameVerifyRemark || "",
                    lastNameVerifyRemark: formData.lastNameVerifyRemark || "",
                    photoFilePathVerifyRemark: formData.photoFilePathVerifyRemark || "",
                    signFilePathVerifyRemark: formData.signFilePathVerifyRemark || "",
                    genderCodeVerifyRemark: formData.genderCodeVerifyRemark || "",
                    dobVerifyRemark: formData.dobVerifyRemark || "",
                    dobFilePathVerifyRemark: formData.dobFilePathVerifyRemark || "",
                    aadhaarNoVerifyRemark: formData.aadhaarNoVerifyRemark || "",
                    aadhaarFilePathVerifyRemark: formData.aadhaarFilePathVerifyRemark || "",
                    rejectCnt: formData.rejectCnt || "",
                    verifyCnt: formData.verifyCnt || "",
                    isAddhareVerify: true,
                };

                const response = await agent.post(SaveStaffPrimary, submissionData);

                if (response.status === 200 || response.status === 201) {
                    return true;
                }
                return false;
            }

            return false;
        } catch (error) {
            console.error("Error saving updated details:", error);
            console.error("Error response:", error.response?.data);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleAadhaarFormSync = async (verifiedData) => {
        // Update local state with verified data
        setFormData((prev) => ({
            ...prev,
            firstName: verifiedData.firstName,
            middleName: verifiedData.middleName,
            lastName: verifiedData.lastName,
            dob: verifiedData.dob,
            gender: verifiedData.gender,
            aadhaarNo: verifiedData.aadhaarNo,
        }));

        setShowAadhaarModal(false);

        // Show saving indicator
        Swal.fire({
            title: "Saving Updated Details...",
            text: "Please wait while we save your updated information.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        // ✅ Save the updated details to the database
        const saveSuccess = await saveUpdatedDetails(verifiedData);

        Swal.close();

        if (saveSuccess) {
            setIsAadhaarReverified(true);

            Swal.fire({
                title: "Aadhaar Reverified",
                text: "Your Aadhaar has been reverified and details updated successfully.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });

            setTimeout(() => {
                handleNextNavigation();
            }, 2000);
        } else {
            Swal.fire({
                title: "Reverification Completed but Save Failed",
                text: "Aadhaar was reverified but we couldn't save the updated details. Please contact support.",
                icon: "warning",
                confirmButtonText: "OK",
            });
            setIsAadhaarReverified(true);
        }
    };

    const handleNextNavigation = () => {
        if (userType === "Candidate") {
            navigate(`/candidate/dashboard`);
        } else if (userType === "Staff") {
            navigate(`/staff/dashboard`);
        }
    };

    const openReverifyModal = () => {
        if (!isAadhaarVerified) {
            Swal.fire({
                title: "Aadhaar Not Verified",
                text: "You need to verify your Aadhaar first before reverifying.",
                icon: "warning",
                confirmButtonText: "OK",
            });
            return;
        }

        if (isAadhaarReverified) {
            Swal.fire({
                title: "Already Reverified",
                text: "Your Aadhaar has already been reverified.",
                icon: "info",
                confirmButtonText: "OK",
            });
            return;
        }

        if (!formData.firstName || !formData.dob || !formData.gender || !formData.aadhaarNo) {
            Swal.fire({
                title: "Incomplete Data",
                text: "Please ensure all required fields are filled before reverification.",
                icon: "warning",
                confirmButtonText: "OK",
            });
            return;
        }

        setShowAadhaarModal(true);
    };

    const handleSkip = () => {
        Swal.fire({
            title: "Skip Reverification?",
            text: "You can reverify your Aadhaar later from your profile.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Skip",
            cancelButtonText: "Stay",
        }).then((result) => {
            if (result.isConfirmed) {
                handleNextNavigation();
            }
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* <div className="mb-6 overflow-x-auto">
                <ProgressTracker currentStep="aadhaar-reverify" />
            </div> */}

            {/* Main Card */}
            <fieldset className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className={`${color} px-6 py-5`}>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        {/* <span className="text-2xl">🔐</span> */}
                        Aadhaar Reverification
                    </h2>
                    {/* <p className="text-white/80 text-sm mt-1">
                        {isAadhaarReverified
                            ? "Your Aadhaar has been successfully reverified."
                            : isAadhaarVerified
                                ? "Your Aadhaar is verified. Please reverify to continue."
                                : "Please verify your Aadhaar first."}
                    </p> */}
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Profile Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-sm text-gray-500">Full Name</label>
                            <p className="font-medium text-gray-800">
                                {[formData.firstName, formData.middleName, formData.lastName]
                                    .filter(Boolean)
                                    .join(" ") || "—"}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-sm text-gray-500">Date of Birth</label>
                            <p className="font-medium text-gray-800">{formData.dob || "—"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-sm text-gray-500">Gender</label>
                            <p className="font-medium text-gray-800">
                                {formData.gender === "1" ? "Male" :
                                    formData.gender === "2" ? "Female" :
                                        formData.gender === "3" ? "Transgender / Other" :
                                            formData.gender === "M" ? "Male" :
                                                formData.gender === "F" ? "Female" :
                                                    formData.gender === "T" ? "Transgender / Other" : "—"}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-sm text-gray-500">Aadhaar Number</label>
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-800">
                                    {formData.aadhaarNo ?
                                        `XXXX XXXX ${formData.aadhaarNo.slice(-4)}` :
                                        "—"}
                                </p>
                                {isAadhaarVerified && (
                                    <img
                                        src={VerifiedIcon}
                                        alt="Verified"
                                        className="h-6 w-auto"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Badges */}
                    {/* <div className="flex flex-wrap gap-3 mb-6">
                        <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${isAadhaarVerified
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                            <span>{isAadhaarVerified ? "✅" : "⏳"}</span>
                            {isAadhaarVerified ? "Aadhaar Verified" : "Aadhaar Not Verified"}
                        </div>
                        {isAadhaarReverified && (
                            <div className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 bg-green-100 text-green-700">
                                <span>✅</span>
                                Aadhaar Reverified
                            </div>
                        )}
                    </div> */}

                    {/* Info Message */}
                    {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-blue-500 text-xl">ℹ️</span>
                            <div>
                                <p className="text-sm text-blue-700">
                                    <strong>Why reverification?</strong> Aadhaar reverification ensures your identity remains verified and up-to-date. This is required periodically or when your details change.
                                </p>
                                <p className="text-sm text-blue-600 mt-2">
                                    <strong>Note:</strong> Your Aadhaar number is locked and cannot be changed during reverification.
                                </p>
                                <p className="text-sm text-blue-600 mt-2">
                                    <strong>What happens next?</strong> After successful reverification, your updated details will be saved automatically.
                                </p>
                            </div>
                        </div>
                    </div> */}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        {!isAadhaarReverified ? (
                            <button
                                onClick={openReverifyModal}
                                disabled={!isAadhaarVerified || saving}
                                className={`
                                    px-4 py-2 rounded-md text-white font-medium text-sm flex items-center gap-2
                                    ${isAadhaarVerified && !saving
                                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all"
                                        : "bg-gray-400 cursor-not-allowed"}
                                `}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-2 w-2 border-2 border-white border-t-transparent"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        {/* <span>🔄</span> */}
                                        {isAadhaarVerified ? "Reverify Aadhaar" : "Aadhaar Verification Required"}
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                <img src={VerifiedIcon} alt="Verified" className="h-10 w-auto" />
                                <div>
                                    <p className="font-medium text-green-700">Aadhaar Reverified Successfully!</p>
                                    <p className="text-sm text-green-600">Your identity has been reverified and details updated.</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSkip}
                            disabled={saving}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Skip for Now
                        </button>
                    </div>

                    {/* Additional Info */}
                    {!isAadhaarReverified && isAadhaarVerified && (
                        <div className="mt-4 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                            <p>⚠️ You will need to reverify your Aadhaar to complete this process.</p>
                        </div>
                    )}
                </div>
            </fieldset>

            {/* Aadhaar Verification Modal (for reverification) */}
            <AadhaarVerificationModal
                isOpen={showAadhaarModal}
                onClose={() => setShowAadhaarModal(false)}
                onVerified={handleAadhaarFormSync}
                onFormSync={handleAadhaarFormSync}
                apiEndpoint={aadhaarVerification}
                reverifyApiEndpoint={aadhaarReVerification}
                isReverify={true}
                formData={{
                    firstName: formData.firstName,
                    middleName: formData.middleName,
                    lastName: formData.lastName,
                    dob: formData.dob,
                    gender: formData.gender,
                    aadhaarNo: formData.aadhaarNo,
                    candidateId: formData.candidateId || userInfo?.UserID,
                    userLoginID: formData.userLoginID || userInfo?.UserLoginID,
                }}
            />
        </div>
    );
};

export default AadhaarReverificationPage;