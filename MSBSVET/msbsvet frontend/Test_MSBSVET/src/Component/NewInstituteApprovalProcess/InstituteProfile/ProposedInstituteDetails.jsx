import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FormComponent from "../../formcomponent/FormComponent";
import UploadPdf from "../../formcomponent/UploadPdf";
import { FaUniversity, FaTrash, FaPlus, FaPlusSquare, FaFile, FaFileDownload, FaFileAlt } from "react-icons/fa";
import { useAuth } from "../../../Hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import agent from '../../../lib/api/agent';
import Swal from "sweetalert2";
import { useLoading } from "../../../Hooks/useLoading";
import StaffProfilePopup from "../../formcomponent/StaffProfilePopup";

import {
    GetInstituteIDByInstituteCode,
    GetInstituteManagementDetails,
    SaveProposedInstituteDetails,
    LockInstituteProfileDetails,
    UnLockInstituteProfileDetails,
    IsEligible,
    IsVerified,
    PromotingOrgGetProposedExistingInstituteDetails,
    PromotingOrgGetProposedInstituteDetails,
    GetPromoterDetailsByInstituteID,
    IsEditingAllowed,
    SaveProposedInstituteDetail,
} from "../../../Endpoints_All/Base/Institute";
import { GetInstituteAndManagementMobile } from "../../../Endpoints_All/ITISpecification/itiSpecification";
import OTPService from '../../formcomponent/OTPService';
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";

import ReactDOM from 'react-dom/client';
import Staff_PrintApplicationForm from '../../PrintApplicationForm/Staff_PrintApplicationForm';

import { GetMasterTableList, GetStaffID } from '../../../Endpoints_All/Base/masterData';

import {
    GetPincodeData,
    GetMasterDistrict,
    GetMasterTaluka,
    GetMasterCity
} from '../../../Endpoints_All/Base/location';
import ReservedWordPopUp from "../../InstituteRegistration/ReservedWordPopUp";
import Button from "../../base/Button";
import VerifiedIcon from "../../../assets/VerifiedIcon.jpg"
import QuestionMark from "../../../assets/QuestionMark.png"
import InstituteConfirmationPopup from "../../formcomponent/InstituteConfirmationPopup";
import { getDeviceIP } from "../../../utils/CommonHelper";
import AddAuthorizedRepPopup from "../../formcomponent/AddAuthorizedRepPopup";
import { File } from "lucide-react";

const GET_STATES_API = `${GetMasterTableList}?TableName=Master_State&DataValueField=StateID&DataTextField=State&HasSelect=true`;

const locationCategoryOptions = [
    { id: "0", name: "Select" },
    { id: "1", name: "Rural" },
    { id: "2", name: "Urban" },
    { id: "3", name: "Semi-Urban" }
];

const particularOptions = [
    { id: "1", name: "VTP (as on MSSDS/ MSCVT Portal)" },
    { id: "2", name: "TC ID (as on Skill India Portal)" },
    { id: "3", name: "TP ID (as on Skill India Portal)" }
];

function formatOptions(options) {
    return options.map((opt) =>
        typeof opt === "object"
            ? { value: opt.id?.toString(), label: opt.name }
            : { value: opt, label: opt }
    );
}

const formatOption = (data) => {
    return data.map(item => ({
        value: item.Value,
        label: item.Text
    }));
};

const ProposedInstituteDetails = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const [verificationStatusMessage, setVerificationStatusMessage] = useState({
        show: false,
        status: "",
        remark: "",
        color: ""
    });

    const [formData, setFormData] = useState({
        InstituteID: 0,
        InstituteCode: "",
        InstituteName: "",
        InstituteEstablishmentDate: "",
        InstituteAddress: "",
        PinCode: "",
        StateID: "",
        State: "",
        DistrictID: "",
        District: "",
        TalukaID: "",
        Taluka: "",
        CityID: "",
        CityVillage: "",
        OtherCity: "",
        LocationCategory: "",
        LocationCategoryID: "",
        PhoneNo: "",
        EMailID: "",
        Website: "",
        Latitude: "",
        Longitude: "",
        MSBSVETRegistrationNumber: "",
        MSBSVETApprovalDate: "",
        MSBSVETApprovalLetterPath: "",
        VTPRegistrationNumber: "",
        VTPApprovalDate: "",
        VTPApprovalLetterPath: "",
        SmartTPRegistrationNumber: "",
        SmartTPApprovalDate: "",
        SmartTPApprovalLetterPath: "",
        SmartTCRegistrationNumber: "",
        SmartTCApprovalDate: "",
        SmartTCApprovalLetterPath: "",
        IsNewInst: 0,
        CollegeRegistrationNo: ''
    });

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [talukas, setTalukas] = useState([]);
    const [cities, setCities] = useState([]);
    const [showOtherCity, setShowOtherCity] = useState(false);
    const [ipAddress, setIpAddress] = useState("");
    const [userMobile, setUserMobile] = useState("");
    const [instituteID, setInstituteID] = useState(0);
    const [userLoginID, setUserLoginID] = useState("");

    // Verification status states
    const [isEligibleForRequest, setIsEligibleForRequest] = useState(true);
    const [eligibilityMessage, setEligibilityMessage] = useState("");
    const [isProfileVerified, setIsProfileVerified] = useState(false);
    const [verificationRemark, setVerificationRemark] = useState("");
    const [isEditingAllowed, setIsEditingAllowed] = useState(false);

    const [showVerificationUI, setShowVerificationUI] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [existingStatus, setExistingStatus] = useState('');
    const [existingRemark, setExistingRemark] = useState('');
    const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);


    const [instituteId, setInstituteId] = useState(null);

    const [loading, setLoading] = useState({
        states: false,
        districts: false,
        talukas: false,
        cities: false
    });

    const [errors, setErrors] = useState({});
    const [fieldsDisabled, setFieldsDisabled] = useState(false);
    const [latLongInput, setLatLongInput] = useState("");
    const [showRepPopup, setShowRepPopup] = useState(false);
    const [popupKey, setPopupKey] = useState(0);
    const [registrationDetails, setRegistrationDetails] = useState([]);
    const [showReservedWords, setShowReservedWords] = useState(false);
    const [isNewInst, setIsNewInst] = useState(false);
    const [promoterDetails, setPromoterDetails] = useState([]);
    const [showStaffProfilePopup, setShowStaffProfilePopup] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);



    useEffect(() => {

        initializeComponent();
        
    }, []);

    // Initialize component - Fetch all initial data
    const initializeComponent = async () => {

        await fetchUserAndInstituteDetails();
        await fetchIP();
        await fetchStates();
    };

    // Separate useEffect to handle dependent API calls
    useEffect(() => {

        if (instituteID && userLoginID) {
            fetchInstituteProfile();
            //fetchManagementMobile();
            checkEligibilityStatus();
            checkVerificationStatus();
            fetchPromoterDetails();
        }
    }, [instituteID, userLoginID]);

    useEffect(() => {
        const fetchVerificationStatus = async () => {
            const userType = userInfo?.UserTypeID || userInfo?.UserTypeID;


            if (userType === 81 && instituteID) {
                setShowVerificationUI(true);

                try {
                    const response = await agent.get(`/api/InstituteBase/GetInstituteDash?InstituteCode=${userLoginID}&InstituteID=${instituteID}`);

                    const dataSet = response.data;
                    if (dataSet && dataSet.Table2 && dataSet.Table2.length > 0) {
                        const verificationData = dataSet.Table2[0];


                        // Get status from IsProposedInstitute
                        let status = verificationData.IsProposedInstitute || "";
                        if (status === "N") {
                            status = "";
                        }
                        const remark = verificationData.ProposedInstituteRemark || "";

                        setApprovalStatus(status);
                        setRejectReason(remark);

                        if (status === "V") {
                            setIsAlreadyVerified(true);
                        } else {
                            setIsAlreadyVerified(false);
                        }
                    } else {
                        setApprovalStatus("");
                        setRejectReason("");
                        setIsAlreadyVerified(false);
                    }
                } catch (error) {
                    console.error("Error fetching verification status:", error);
                    setApprovalStatus("");
                    setRejectReason("");
                    setIsAlreadyVerified(false);
                }
            }
        };

        fetchVerificationStatus();
    }, [instituteID, userLoginID, userInfo?.UserTypeID]);

    const getInstituteIdForSecretary = () => {

        const searchParams = new URLSearchParams(location.search);
        let p1 = searchParams.get('P1');
        let p2 = searchParams.get('P2');

        if (p1 && p2) {
            const calculatedHash = getHashCode(p1).toString();
            if (calculatedHash === p2) {
                return parseInt(p1);
            }
        } else if (p1) {
            return parseInt(p1);
        }

        const instituteIdFromSession = userInfo?.InstituteID;
        if (instituteIdFromSession) {
            return parseInt(instituteIdFromSession);
        }
        if (userInfo?.InstituteID) {
            return parseInt(userInfo.InstituteID);
        }

        return null;
    };



    const fetchUserAndInstituteDetails = async () => {
        try {
            
            const userType = userInfo?.UserTypeID || userInfo?.UserTypeID;
            const loginID = userInfo.UserLoginID || userInfo?.UserLoginID;
            setUserLoginID(loginID);

            let instID = null;

            if (userType === 81) {
                instID = getInstituteIdForSecretary();
                if (!instID) {
                    console.warn("Institute ID not found in query string for Secretary");
                    return;
                }
                setShowVerificationUI(true);
            } else {
                // INSTITUTE FLOW - Get by Institute Code
                const resInstitute = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`
                );
                instID = resInstitute.data?.Data;
            }

            if (instID) {
                setInstituteID(instID);
            } else {
                console.warn("Institute not found for UserLoginID:", loginID);
            }
        } catch (error) {
            console.error("Error fetching user and institute details:", error);
        }
    };

    // Fetch IP Address using getIp API
    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
    };
    // Add this helper function after your other helper functions
    const getInstituteIdFromQueryString = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const p1 = searchParams.get('P1');
        const p2 = searchParams.get('P2');

        if (p1) {
            // Validate hash if P2 exists
            if (p2) {
                const calculatedHash = getHashCode(p1);
                if (calculatedHash.toString() === p2) {
                    return parseInt(p1);
                }
            } else {
                return parseInt(p1);
            }
        }
        return null;
    };

    // Helper function for hash code
    const getHashCode = (str) => {
        if (!str) return 0;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    // Fetch management mobile number
    const fetchManagementMobile = async () => {
        if (!instituteID) {
            console.warn("Institute ID not available yet");
            return;
        }

        try {
            const url = `${GetInstituteAndManagementMobile}/${instituteID}/1`;

            const response = await agent.get(url);
            // const response = await agent.get(url, {
            //     headers: {
            //         'accept': '*/*',
            //         'Content-Type': 'application/json',
            //     }
            // });

            if (response.data && response.data.Status === "Success" && response.data.Data?.length > 0) {
                const mobileNo = response.data.Data[0].MobileNo || "";
                setUserMobile(mobileNo);
            } else {
                console.warn("No mobile number found for management type 2");
                setUserMobile("");
            }
        } catch (error) {
            console.error("Error fetching management mobile:", error);
        }
    };

    const fetchStates = async () => {
        startLoading()
        try {
            const response = await agent.get(GET_STATES_API);
            if (response.data.Status === "Success") {
                const stateData = response.data.Data.filter(item => item.Value !== "-1");
                setStates(stateData);
            }
        } catch (error) {
            console.error("Error fetching states:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error loading states: ${error.message}`
            });
        } finally {
            stopLoading();
        }
    };

    const getDistricts = async (stateId) => {
        startLoading()
        try {
            const response = await agent.get(GetMasterDistrict);
            if (response.data.Status === "Success") {
                const allDistricts = response.data.Data.filter(item => item.Group == stateId);
                setDistricts(allDistricts);
            }
        } catch (error) {
            console.error("Error fetching districts:", error);
        } finally {
            stopLoading()
        }
    };

    const getTalukas = async (districtId) => {
        startLoading()
        try {
            const response = await agent.get(GetMasterTaluka);
            if (response.data.Status === "Success") {
                const allTalukas = response.data.Data.filter(item => item.Value !== "-1" && item.Group == districtId);
                setTalukas(allTalukas);
            }
        } catch (error) {
            console.error("Error fetching talukas:", error);
        } finally {
            stopLoading()
        }
    };

    const getCities = async (talukaId) => {
        startLoading()
        try {
            const response = await agent.get(GetMasterCity);
            if (response.data.Status === "Success") {
                const allCities = response.data.Data.filter(item => item.Value !== "-1" && item.Group == talukaId);

                const citiesWithOther = [
                    ...allCities,
                    { Value: "9999999", Text: "Other", Group: talukaId, Group2: "-1" }
                ];

                setCities(citiesWithOther);
            }
        } catch (error) {
            console.error("Error fetching cities:", error);
        } finally {
            stopLoading()
        }
    };

    const fetchInstituteProfile = async () => {

        if (!instituteID || !userLoginID) {
            console.warn("Institute ID or UserLoginID not available yet");
            return;
        }

        startLoading();

        try {
            const response = await agent.get(
                `${PromotingOrgGetProposedInstituteDetails}/${instituteID}/${userLoginID}`
            );
            const data = response.data?.Data;
            if (response.data?.Status === "Success" && data) {


                const locationCatOption = locationCategoryOptions.find(
                    opt => opt.name === data.LocationCategory
                );
                setFormData({
                    InstituteID: data.InstituteID || 0,
                    InstituteCode: data.InstituteCode || "",
                    InstituteName: data.InstituteName || "",
                    InstituteEstablishmentDate:
                        data.EstablishmentDate && data.EstablishmentDate !== "0001-01-01T00:00:00"
                            ? data.EstablishmentDate.substring(0, 10)
                            : "",
                    InstituteAddress: data.InstituteAddress || "",
                    PinCode: data.PinCode || "",
                    StateID: data.StateID || "",
                    State: data.State || "",
                    DistrictID: data.DistrictID || "",
                    District: data.District || "",
                    TalukaID: data.TalukaID || "",
                    Taluka: data.Taluka || "",
                    CityID: data.CityID !== -1 ? data.CityID.toString() : "",
                    City: data.CityVillage || "",
                    OtherCity: data.OtherCity || "",
                    LocationCategory: locationCatOption?.id || data.LocationCategoryID?.toString() || "",
                    LocationCategoryID: data.LocationCategoryID || 0,
                    PhoneNo: data.PhoneNo || "",
                    EMailID: data.EMailID || "",
                    Website: data.WebSite || "",
                    Latitude: data.Latitude || "",
                    Longitude: data.Longitude || "",
                    latLongInput: data.Latitude || "",
                    MSBSVETRegistrationNumber: data.MSBSVETRegistrationNumber || "",
                    MSBSVETApprovalDate:
                        data.MSBSVETApprovalDate && data.MSBSVETApprovalDate !== "0001-01-01T00:00:00"
                            ? data.MSBSVETApprovalDate.substring(0, 10)
                            : "",
                    MSBSVETApprovalLetterPath: data.MSBSVETApprovalLetterPath || "",
                    VTPRegistrationNumber: data.VTPRegistrationNumber || "",
                    VTPApprovalDate:
                        data.VTPApprovalDate && data.VTPApprovalDate !== "0001-01-01T00:00:00"
                            ? data.VTPApprovalDate.substring(0, 10)
                            : "",
                    VTPApprovalLetterPath: data.VTPApprovalLetterPath || "",
                    SmartTPRegistrationNumber: data.SmartTPRegistrationNumber || "",
                    SmartTPApprovalDate:
                        data.SmartTPApprovalDate && data.SmartTPApprovalDate !== "0001-01-01T00:00:00"
                            ? data.SmartTPApprovalDate.substring(0, 10)
                            : "",
                    SmartTPApprovalLetterPath: data.SmartTPApprovalLetterPath || "",
                    SmartTCRegistrationNumber: data.SmartTCRegistrationNumber || "",
                    SmartTCApprovalDate:
                        data.SmartTCApprovalDate && data.SmartTCApprovalDate !== "0001-01-01T00:00:00"
                            ? data.SmartTCApprovalDate.substring(0, 10)
                            : "",
                    SmartTCApprovalLetterPath: data.SmartTCApprovalLetterPath || "",
                    FormStatus: data.FormStatus || "",
                    InstituteProfileVerificationRemark: data.InstituteProfileVerificationRemark || "",
                    IsNewInst: data.IsNewInst || 0,
                    CollegeRegistrationNo: data.CollegeRegistrationNo || ''
                });

                setShowOtherCity(data.CityID === 9999999 || data.CityID == "9999999");
                getDistricts(data.StateID || "");
                getTalukas(data.DistrictID || "");
                getCities(data.TalukaID || "");
                const userType = userInfo?.UserTypeID || userInfo?.UserTypeID;
                if (userType !== 81 && instituteID) {
                    try {
                        const statusResponse = await agent.get(
                            `/api/InstituteBase/GetProposedInstituteStatus/${instituteID}`
                        );


                        const statusData = statusResponse.data?.Data;

                        const status = statusData?.IsProposedInstitute;
                        const remark = statusData?.ProposedInstituteRemark;


                        if (status === "R") {
                            setVerificationStatusMessage({
                                show: true,
                                status: "Rejected",
                                remark: remark?.toUpperCase(),
                                color: "red"
                            });
                        }
                        else if (status === "V") {
                            setVerificationStatusMessage({
                                show: true,
                                status: "Verified",
                                remark: remark?.toUpperCase(),
                                color: "green"
                            });
                        }
                        else {
                            setVerificationStatusMessage({
                                show: false,
                                status: "",
                                remark: "",
                                color: ""
                            });
                        }

                    } catch (error) {
                        console.error("Error fetching status:", error);
                    }
                }

                setLatLongInput(
                    data.Latitude && data.Longitude
                        ? `${data.Latitude}, ${data.Longitude}`
                        : data.Latitude || ""
                );


                if (data.lstOtherRegistrationDetailsEntity?.length > 0) {
                    const mappedDetails = data.lstOtherRegistrationDetailsEntity.map(detail => ({
                        ID: detail.ID || 0,
                        ParticularID: detail.ParticularID || "",
                        InstituteCode: detail.InstituteCode || "",
                        RegisteredName: detail.RegisteredName || "",
                        ApprovalDate:
                            detail.ApprovalDate && detail.ApprovalDate !== "0001-01-01T00:00:00"
                                ? detail.ApprovalDate.substring(0, 10)
                                : "",
                        ApprovalOrderPath: detail.ApprovalOrderPath || "",
                        ApprovalOrderFileName: detail.ApprovalOrderFileName || "",
                        isNew: false
                    }));
                    setRegistrationDetails(mappedDetails);

                }

                setIsNewInst(data?.IsNewInst === 1);


            }

        } catch (error) {
            console.error("Fetch error:", error);
            Swal.fire("Error", "Failed to fetch institute profile", "error");
        } finally {
            stopLoading();
        }
    };

    const handleUpdateVerification = async () => {
        if (!approvalStatus) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please select Approved / Reject status",
                confirmButtonColor: "#3085d6"
            });
            return;
        }
        if (approvalStatus === "R" && !rejectReason.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please enter a reason for rejection",
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        const id = instituteID || getInstituteIdFromQueryString();
        startLoading();
        try {
            const payload = {
                instituteID: id,
                remark: rejectReason?.toUpperCase() || "",
                status: approvalStatus,
                pageCode: "ProposedInstitute",  // Same as C# PageCode
                createdBy: userLoginID,
                ipAddress: ipAddress || "127.0.0.1"
            };

            const response = await agent.post("/api/InstituteBase/update-verification-status", payload);

            if (response.data?.success) {
                return true;
            }

            return false;

        } catch (error) {
            console.error(error);
            return false;
        }
    };
    const fetchPromoterDetails = async () => {
        if (!instituteID || !userLoginID) {
            console.warn("Institute ID or UserLoginID not available yet");
            return;
        }

        const payload = {
            instituteId: instituteID,
            exitInstituteID: 0,
            userLoginID: userLoginID,
            pageCode: "ProposedInstitute",
            itemId: 0,
            ipAddress: ipAddress
        }

        const response = await agent.post(GetPromoterDetailsByInstituteID, payload);
        if (response.data.Status === 'Success' && response?.data?.Data.length > 0) {
            setPromoterDetails(response?.data?.Data || [])

        }

    }

    // Check eligibility status using IsEligible API
    const checkEligibilityStatus = async () => {
        if (!instituteID || !userLoginID) {
            console.error("Institute ID or UserLoginID not available");
            return;
        }

        try {

            const isEditAllowed = await agent.post(IsEditingAllowed, {
                instituteId: instituteID,
                exitInstituteID: 0,
                userLoginID: userLoginID,
                pageCode: 'ProposedInstitute',
                itemId: 0,
                ipAddress: ipAddress
            })


            if (isEditAllowed.data && isEditAllowed?.data?.Status === "Success") {
                if (isEditAllowed?.data?.Data?.[0]) {
                    const isAllowed = isEditAllowed?.data?.Data?.[0].IsEditAllowed || false;
                    setIsEditingAllowed(isAllowed);
                }
            }
        } catch (error) {
            console.error("Error checking eligibility status:", error);
            console.warn("Could not determine eligibility status");
        }
    };

    // Check verification status using IsVerified API
    const checkVerificationStatus = async () => {
        if (!instituteID || !userLoginID) {
            console.error("Institute ID or UserLoginID not available");
            return;
        }

        try {

            const response = await agent.post(IsVerified, {
                instituteID: instituteID,
                userLoginID: userLoginID
            }, {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                }
            });


            if (response.data && response.data.Status === "Success") {
                const verificationData = response.data.Data?.[0];
                if (verificationData) {
                    const isVerified = verificationData.IsVerified || false;
                    const remark = verificationData.VerificationRemark || "";

                    setIsProfileVerified(isVerified);
                    setVerificationRemark(remark);

                    // If verified, override fieldsDisabled to allow only specific fields
                    if (isVerified) {
                        setFieldsDisabled(false); // We'll handle this in isFormFieldEditable
                    }
                }
            }
        } catch (error) {
            console.error("Error checking verification status:", error);
            console.warn("Could not determine verification status");
        }
    };

    // Check if user can withdraw - calls IsVerified API
    const checkWithdrawEligibility = async () => {
        if (!instituteID || !userLoginID) {
            console.error("Institute ID or UserLoginID not available");
            return false;
        }

        try {

            const response = await agent.post(IsVerified, {
                instituteID: instituteID,
                userLoginID: userLoginID
            }, {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                }
            });


            if (response.data && response.data.Status === "Success") {
                const verificationData = response.data.Data?.[0];
                if (verificationData) {
                    const isVerified = verificationData.IsVerified || false;
                    const remark = verificationData.VerificationRemark || "";

                    setIsProfileVerified(isVerified);
                    setVerificationRemark(remark);

                    if (isVerified) {
                        // Already verified by board - cannot withdraw
                        Swal.fire({
                            title: "Cannot Withdraw",
                            html: `<p>This profile has already been verified by the board.</p>
                                  ${remark ? `<p class="mt-2"><strong>Remark:</strong> ${remark}</p>` : ''}
                                  <p class="mt-2">Withdrawal is not allowed.</p>`,
                            icon: "warning"
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        return false;
                    }

                    // Not verified yet - can withdraw
                    return true;
                }
                return false;
            }
            return false;
        } catch (error) {
            console.error("Error checking withdraw eligibility:", error);
            Swal.fire("Error", "Failed to check verification status. Please try again.", "error");
            return false;
        }
    };

    const isFormFieldEditable = (fieldName) => {
        if (isProfileVerified) {
            return ['EMailID', 'PhoneNo', 'Website'].includes(fieldName);
        }

        // Otherwise, use the general fieldsDisabled state
        return !fieldsDisabled;
    };


    const canEditRegistrationRow = (row) => {
        if (row.isNew === true) {
            return true;
        }


        if (isProfileVerified) {
            return false;
        }

        return !fieldsDisabled;
    };

    const canDeleteRegistrationRow = (row) => {
        if (row.isNew === true) {
            return true;
        }

        if (isProfileVerified) {
            return false;
        }

        return !fieldsDisabled;
    };

    const canAddRegistrationRow = () => {
        if (isProfileVerified && !isEditingAllowed) {
            return false;
        }
        return true;
    };
    const toInputDate = (value) => {
        if (!value) return "";
        return value.split("T")[0];
    };

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));
    };

    const handleDropdownChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));

        if (name === "StateID") {
            setLoading(prev => ({ ...prev, districts: true, talukas: false, cities: false }));
            getDistricts(value);
            setFormData((prev) => ({
                ...prev,
                DistrictID: "",
                TalukaID: "",
                CityID: "",
                OtherCity: ""
            }));
            setShowOtherCity(false);
            setLoading(prev => ({ ...prev, districts: false }));
        }

        if (name === "DistrictID") {
            setLoading(prev => ({ ...prev, talukas: true, cities: false }));
            getTalukas(value);
            setFormData((prev) => ({
                ...prev,
                TalukaID: "",
                CityID: "",
                OtherCity: ""
            }));
            setShowOtherCity(false);
            setLoading(prev => ({ ...prev, talukas: false }));
        }

        if (name === "TalukaID") {
            setLoading(prev => ({ ...prev, cities: true }));
            getCities(value);
            setFormData((prev) => ({
                ...prev,
                CityID: "",
                OtherCity: ""
            }));
            setShowOtherCity(false);
            setLoading(prev => ({ ...prev, cities: false }));
        }

        if (name === "CityID") {
            const isOther = value === "9999999" || value === 9999999;
            setShowOtherCity(isOther);

            if (!isOther) {
                setFormData(prev => ({ ...prev, OtherCity: "" }));
            }
        }
    };

    const handlePincodeChange = async (name, value) => {
        try {
            setFormData(prev => ({ ...prev, [name]: value }));

            if (value.length !== 6) return;

            setLoading(prev => ({ ...prev, districts: true, talukas: true, cities: true }));

            const response = await agent.get(`${GetPincodeData}?Pincode=${value}`);
            const data = response.data.Data;


            if (data.StateID) {
                setFormData(prev => ({
                    ...prev,
                    StateID: data.StateID.toString()
                }));
                await getDistricts(data.StateID);
            }

            if (data.DistrictID) {
                setFormData(prev => ({
                    ...prev,
                    DistrictID: data.DistrictID.toString()
                }));
                await getTalukas(data.DistrictID);
            }

            if (data.TalukaID) {
                setFormData(prev => ({
                    ...prev,
                    TalukaID: data.TalukaID.toString()
                }));
                await getCities(data.TalukaID);
            }

            if (data.CityID) {
                setFormData(prev => ({
                    ...prev,
                    CityID: data.CityID.toString()
                }));
                setShowOtherCity(data.CityID.toString() === "9999999");
            }

        } catch (error) {
            console.error("Error fetching pincode data:", error);
            Swal.fire("Error", "Invalid pincode or service unavailable", "error");
        } finally {
            setLoading(prev => ({
                ...prev,
                districts: false,
                talukas: false,
                cities: false
            }));
        }
    };

    const handleRegistrationChange = (index, field, value) => {
        const updated = [...registrationDetails];
        updated[index][field] = value;
        setRegistrationDetails(updated);

        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`registration_${index}_${field}`];
            return newErrors;
        });
    };

    const handleRegistrationFileUpload = (index, fileData) => {
        const updated = [...registrationDetails];
        updated[index].ApprovalOrderPath = fileData.filePath;
        updated[index].ApprovalOrderFileName = fileData.fileName;
        setRegistrationDetails(updated);
    };


    const addRegistrationRow = () => {
        if (!canAddRegistrationRow()) {
            Swal.fire("Error", "Cannot add new rows at this time.", "error");
            return;
        }

        // Mirrors: listOtherRegistrationDetailsEntity.Add(new OtherRegistrationDetailsEntity())
        setRegistrationDetails(prev => [
            ...prev,
            {
                ID: 0,
                ParticularID: "-1",      // matches ddlParticular default "Select"/"-1"
                InstituteCode: "",
                RegisteredName: "",
                ApprovalDate: "",
                ApprovalOrderPath: "",
                ApprovalOrderFileName: "",
                isNew: true,
            }
        ]);
    };

    const deleteRegistrationRow = async (index) => {
        const rowToDelete = registrationDetails[index];

        if (!canDeleteRegistrationRow(rowToDelete)) {
            Swal.fire("Error", "This row cannot be deleted.", "error");
            return;
        }

        const hasActualData =
            (rowToDelete.ParticularID && rowToDelete.ParticularID !== "-1") ||
            rowToDelete.InstituteCode ||
            rowToDelete.RegisteredName ||
            rowToDelete.ApprovalDate ||
            rowToDelete.ApprovalOrderPath;

        if (hasActualData) {
            const result = await Swal.fire({
                title: 'Delete Registration Detail',
                text: 'This row contains data. Are you sure you want to delete this registration detail?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                const updatedDetails = registrationDetails.filter((_, i) => i !== index);
                setRegistrationDetails(updatedDetails);
                await saveFormData(updatedDetails, false);  // persist after delete

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Registration detail has been deleted successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } else {
            setRegistrationDetails(prev => prev.filter((_, i) => i !== index));
        }
    };
    const validateRegistrationDetails = () => {
        const newErrors = {};
        let hasErrors = false;

        registrationDetails.forEach((detail, index) => {
            const hasAnyData =
                detail.ParticularID !== "-1" ||
                detail.InstituteCode?.trim() ||
                detail.RegisteredName?.trim() ||
                detail.ApprovalDate ||
                detail.ApprovalOrderPath;

            if (hasAnyData) {

                if (!detail.ParticularID || detail.ParticularID === "-1") {
                    newErrors[`registration_${index}_ParticularID`] =
                        "Required";
                    hasErrors = true;
                }

                if (!detail.InstituteCode?.trim()) {
                    newErrors[`registration_${index}_InstituteCode`] =
                        "Required";
                    hasErrors = true;
                }

                if (!detail.RegisteredName?.trim()) {
                    newErrors[`registration_${index}_RegisteredName`] =
                        "Required";
                    hasErrors = true;
                }

                if (!detail.ApprovalDate) {
                    newErrors[`registration_${index}_ApprovalDate`] =
                        "Required";
                    hasErrors = true;
                }

                if (!detail.ApprovalOrderPath) {
                    newErrors[`registration_${index}_ApprovalOrderPath`] =
                        "Required";
                    hasErrors = true;
                }
            }
        });

        return { hasErrors, errors: newErrors };
    };

    const openRegistrationDetailsPopup = (url) => {
        if (!url) {
            Swal.fire("Error", "No file available to view.", "error");
            return;
        }
        const popupWidth = 1000;
        const popupHeight = 750;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;
        window.open(
            `${url}`,
            "OtherRegistrationDetails",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    }

    const validate = () => {
        const newErrors = {};

        if (!isProfileVerified) {
            if (!formData.InstituteName?.trim()) {
                newErrors.InstituteName = "Institute name required";
            }
            if (!formData.InstituteEstablishmentDate)
                newErrors.InstituteEstablishmentDate = "Establishment date required";
            if (!formData.InstituteAddress)
                newErrors.InstituteAddress = "Address required";
            if (!formData.PinCode)
                newErrors.PinCode = "Pin code required";
            else if (!/^[0-9]{6}$/.test(formData.PinCode))
                newErrors.PinCode = "Enter valid 6-digit pin";

            if (!formData.CityID)
                newErrors.CityID = "City / Village required";

            if (formData.CityID === "9999999" && !formData.OtherCity) {
                newErrors.OtherCity = "Please enter city/village name";
            }

            if (!formData.LocationCategory || formData.LocationCategory === "0")
                newErrors.LocationCategory = "Location category required";

            if (!formData.Latitude || !formData.Longitude) {
                newErrors.LatitudeLongitude = "Latitude and Longitude are required";
            } else {
                const lat = parseFloat(formData.Latitude);
                const lng = parseFloat(formData.Longitude);

                if (isNaN(lat) || isNaN(lng)) {
                    newErrors.LatitudeLongitude = "Invalid Latitude or Longitude format";
                } else if (lat < -90 || lat > 90) {
                    newErrors.LatitudeLongitude = "Latitude must be between -90 and 90";
                } else if (lng < -180 || lng > 180) {
                    newErrors.LatitudeLongitude = "Longitude must be between -180 and 180";
                }
            }
        }

        // Always validate Phone and Email (editable even when verified)
        if (!formData.PhoneNo)
            newErrors.PhoneNo = "Phone number required";
        else if (!/^[0-9]{10}$/.test(formData.PhoneNo))
            newErrors.PhoneNo = "Enter valid 10-digit phone";

        if (!formData.EMailID)
            newErrors.EMailID = "Email required";
        else if (!/^([a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,6})$/i.test(formData.EMailID))
            newErrors.EMailID = "Enter valid email";

        const registrationValidation = validateRegistrationDetails();
        if (registrationValidation.hasErrors) {
            Object.assign(newErrors, registrationValidation.errors);
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const saveFormData = async (registrationDetailsToSave = null, showSuccessPopup = true) => {

        const detailsToSave = registrationDetailsToSave !== null ? registrationDetailsToSave : registrationDetails;

        startLoading();
        try {
            const payload = {
                instituteID: parseInt(instituteID) || 0,
                applicationFor: 0,
                instituteCode: formData.InstituteCode || "",
                instituteName: formData.InstituteName || "",
                instituteAddress: formData.InstituteAddress || "",
                stateID: parseInt(formData.StateID) || 0,
                state: formData.State || "",
                regionID: 0,
                region: "",
                districtID: parseInt(formData.DistrictID) || 0,
                district: formData.District || "",
                talukaID: parseInt(formData.TalukaID) || 0,
                taluka: formData.Taluka || "",
                city: formData.CityVillage || "",
                cityID: parseInt(formData.CityID) || 0,
                otherCity: formData.OtherCity || "",
                pinCode: formData.PinCode || "",
                std: "",
                phoneNo: formData.PhoneNo || "",
                faxNo: "",
                eMailID: formData.EMailID || "",
                webSite: formData.Website || "",          //  fixed: was "website"
                instituteUrl: "",
                // locationCategory: formData.LocationCategory || "",
                // locationCategoryID: parseInt(formData.LocationCategory) || 0,
                locationCategoryID: parseInt(formData.LocationCategory) || 0,
                locationCategory: locationCategoryOptions.find(
                    opt => opt.id === String(formData.LocationCategory)
                )?.name || "",
                lastModifiedOn: "",
                establishmentDate: formData.InstituteEstablishmentDate
                    ? new Date(formData.InstituteEstablishmentDate).toISOString()
                    : new Date().toISOString(),
                resolutionPath: "",
                instituteStatusID: 0,
                promotingOrgTypeID: 0,
                courseTypeID: 0,
                prevInstituteCode: "",
                isActive: true,
                userLoginID: userLoginID || "",
                ipAddress: ipAddress || "0.0.0.0",
                pageCode: "ProposedInstitute",            //  fixed: matches your page
                authorizedPersonTitle: "",
                authorizedPersonFirstName: "",
                authorizedPersonMiddleName: "",
                authorizedPersonLastName: "",
                authorizedPersonName: "",
                authorizedPersonMobileNo1: "",
                authorizedPersonMobileNo2: "",
                authorizedPersonEmailId: "",
                authorizedPersonPhoto: "",
                promotingOrgOthers: "",
                promotingOrgType: "",
                authorizedPersonAadharNo: "",
                authorizedPersonGender: "",
                password: "",
                authorizedPersonDOB: new Date().toISOString(),
                authorizedPersonAadharCardPath: "",
                designation: "",
                userID: 0,
                msbsvetRegistrationNumber: formData.MSBSVETRegistrationNumber || "",
                msbsvetApprovalDate: formData.MSBSVETApprovalDate || "",
                msbsvetApprovalLetterPath: formData.MSBSVETApprovalLetterPath || "",
                vtpRegistrationNumber: formData.VTPRegistrationNumber || "",
                vtpApprovalDate: formData.VTPApprovalDate || "",
                vtpApprovalLetterPath: formData.VTPApprovalLetterPath || "",
                smartTPRegistrationNumber: formData.SmartTPRegistrationNumber || "",
                smartTPApprovalDate: formData.SmartTPApprovalDate || "",
                smartTPApprovalLetterPath: formData.SmartTPApprovalLetterPath || "",
                smartTCRegistrationNumber: formData.SmartTCRegistrationNumber || "",
                smartTCApprovalDate: formData.SmartTCApprovalDate || "",
                smartTCApprovalLetterPath: formData.SmartTCApprovalLetterPath || "",
                latitude: formData.Latitude?.toString() || "",
                longitude: formData.Longitude?.toString() || "",
                isNewInst: formData.IsNewInst || 0,
                formStatus: formData.FormStatus || "",
                instituteProfileVerificationRemark: formData.InstituteProfileVerificationRemark || "",
                collegeRegistrationNo: formData.CollegeRegistrationNo || '',
                collegeID: 0,
                listInstituteMember: [],
                listInstituteCourse: [],
                lstOtherRegistrationDetailsEntity: detailsToSave   //  matches entity field name
                    .filter(detail =>
                        (detail.ParticularID && detail.ParticularID !== "-1") ||
                        detail.InstituteCode ||
                        detail.RegisteredName ||
                        detail.ApprovalDate ||
                        detail.ApprovalOrderPath
                    )
                    .map(detail => ({
                        ID: parseInt(detail.ID) || 0,
                        ParticularID: parseInt(detail.ParticularID) || 0,
                        InstituteCode: detail.InstituteCode || "",
                        RegisteredName: detail.RegisteredName || "",
                        ApprovalDate: detail.ApprovalDate || "",
                        ApprovalOrderPath: detail.ApprovalOrderPath || "",
                        InstituteID: parseInt(instituteID) || 0
                    }))
            };
         



            const response = await agent.post(SaveProposedInstituteDetail, payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });


            if (response?.data?.Status === "Success") {
                if (showSuccessPopup) {
                    await Swal.fire("Success", "Institute profile saved successfully!", "success");
                }
                return true;
            } else {
                console.error("API Error Response:", response.data);
                Swal.fire("Error", response?.data?.Message || "Failed to save", "error");
                return false;
            }
        } catch (err) {
            console.error("Save error details:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                headers: err.response?.headers
            });

            if (err.response?.status === 400) {
                Swal.fire(
                    "Validation Error",
                    "Invalid data sent to server. Check all fields.",
                    "error"
                );
            } else {
                Swal.fire("Error", err?.response?.data?.Message || err?.message || "Failed to save", "error");
            }
            return false;
        } finally {
            stopLoading();
        }
    };



    const handleSave = async () => {

        if (!validate()) {
            Swal.fire(
                "Validation Error",
                "Please fill all required fields correctly",
                "warning"
            );
            return;
        }
        if (!isEditingAllowed) {
            navigate('/Institute/ProposedCourse');
            return;
        }

        setShowConfirmPopup(true);
    };
    const handleConfirmYes = async () => {
        setShowConfirmPopup(false);
        const saved = await saveFormData();

        if (!saved) return;
        const userType = userInfo?.UserTypeID || userInfo?.UserTypeID;

        if (userType === 81) {
            await handleUpdateVerification();
        }

        const hash = getHashCode(instituteID.toString());

        navigate(`/Institute/ProposedCourse?P1=${instituteID}&P2=${hash}`);
    };

    const handleConfirmNo = () => {
        setShowConfirmPopup(false);
    };

    const handleSaveForRequest = async () => {
        if (!validate()) {
            Swal.fire("Validation Error", "Please fill all required fields correctly", "warning");
            return false;
        }

        return await saveFormData();
    };

    // Handle Request Verification - Trigger OTP
    const handleRequestVerification = async () => {
        if (!validate()) {
            Swal.fire("Validation Error", "Please fill all required fields correctly before requesting verification", "warning");
            return;
        }

        if (!isEligibleForRequest) {
            Swal.fire("Error", "You are not eligible to request verification at this time.", "error");
            return;
        }

        if (!userMobile) {
            Swal.fire("Error", "Mobile number not found. Please contact administrator.", "error");
            return;
        }

        await otpServiceVerification.startVerification(userMobile);
    };

    // Submit verification request
    const submitVerificationRequest = async () => {
        if (!instituteID || !userLoginID) {
            console.error("Institute ID or UserLoginID not available");
            Swal.fire("Error", "Institute details not found. Please refresh the page.", "error");
            return;
        }

        startLoading();
        try {

            const response = await agent.post(LockInstituteProfileDetails, {
                instituteID: instituteID,
                userLoginID: userLoginID,
                ipAddress: ipAddress || "0.0.0.0",
                pageCode: "ExistingInstitute"
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data && response.data.Status === "Success") {
                // Refresh the eligibility status after successful lock
                await checkEligibilityStatus();

                Swal.fire({
                    title: "Success",
                    text: "Request for Verification submitted successfully! Form is now locked for editing.",
                    icon: "success"
                });
            } else {
                Swal.fire("Error", response.data?.Message || "Failed to submit verification request", "error");
            }
        } catch (error) {
            console.error("Error submitting verification request:", error);
            Swal.fire("Error", error?.response?.data?.Message || "Failed to submit verification request", "error");
        } finally {
            stopLoading();
        }
    };

    const handleRepPopupClose = () => {
        setShowRepPopup(false);
        setPopupKey(prev => prev + 1);
    };

    const onRepPopupSaved = async () => {
        handleRepPopupClose();
    };

    const handleBack = () => {
        const id =
            instituteId ||
            getInstituteIdFromQueryString?.();
        // getInstituteId();

        if (userInfo?.UserTypeID === 81) {

            if (id) {
                navigate(
                    `/Institute/PromotersDetails?P1=${id}&P2=${String(id).getHashCode()}`
                );
            } else {
                navigate(`/Institute/PromotersDetails`);
            }
        } else {

            window.history.back();
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
            if (userInfo?.UserTypeID == 64) {
                navigate("/tinstitute/dashboard");
                return;
            }
            if (userInfo?.UserTypeID === 81) {
                const instituteId = getInstituteIdForSecretary();
                const hash = getHashCode(instituteId.toString());

                navigate(`/InstituteDash?P1=${instituteId}&P2=${hash}`);
            } else {
                window.close(); // only works if opened via window.open()
            }
        }
    };

    // Loading indicator
    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }

    const openReservedWordsListPopup = () => {
        setShowReservedWords(true);
    }

    const openStaffProfilePopup = () => {
        setShowStaffProfilePopup(true);
    }
    // Build instituteData from formData + promoterDetails
    const firstPromoter = promoterDetails?.[0];
    const authTitle = firstPromoter?.GenderCode === "Female" ? "Mrs." : "Mr.";
    const authName = firstPromoter
        ? `${firstPromoter.FirstName || ""} ${firstPromoter.MiddleName || ""} ${firstPromoter.LastName || ""}`.trim().toUpperCase()
        : "";

    // Extract login ID from StaffProfileId HTML string
    const staffIdMatch = firstPromoter?.StaffProfileId?.match(/>([^<]+)</);
    const authLoginId = staffIdMatch ? staffIdMatch[1] : "";
    const authMobile = firstPromoter?.MobileNo || "";

    // Get display names from dropdown selected values
    const selectedState = states.find(s => String(s.Value) === String(formData.StateID));
    const selectedDistrict = districts.find(d => String(d.Value) === String(formData.DistrictID));
    const selectedTaluka = talukas.find(t => String(t.Value) === String(formData.TalukaID));
    const selectedCity = cities.find(c => String(c.Value) === String(formData.CityID));

    const instituteData = {
        instituteName: formData.InstituteName || "",
        isNewInst: String(formData.IsNewInst),
        prevInstituteCode: formData.InstituteCode || "",
        address: formData.InstituteAddress || "",
        city: selectedCity?.Text || formData.City || "",
        otherCity: formData.OtherCity || "",
        pincode: formData.PinCode || "",
        taluka: selectedTaluka?.Text || formData.Taluka || "",
        district: selectedDistrict?.Text || formData.District || "",
        state: selectedState?.Text || formData.State || "",
        authTitle,
        authName,
        authLoginId,
        authMobile,
    };

    const handlePrintProfile = async (profileID) => {
        if (!profileID) {
            Swal.fire("Info", "No Profile ID available", "info");
            return;
        }
        const resstaff = await agent.get(`${GetStaffID}?ApplicationID=${profileID.trim()}`);

        const displayId = profileID || staffId;
        const staffID = resstaff?.data?.Data;
        const popupWidth = 1000;
        const popupHeight = 750;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;
        window.open(
            `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffID}&userLoginID=${displayId}&pageCode=STAFF_PRINT`,
            "StaffPrintApplicationForm",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    };

    return (
        <div className="w-full p-4">
            {showReservedWords && (
                <ReservedWordPopUp close={setShowReservedWords} />
            )}

            {showStaffProfilePopup && (
                <AddAuthorizedRepPopup
                    open={showStaffProfilePopup}
                    roleConfig={{
                        button: "Add Authorized Representative",
                        ManagementTypeID: promoterDetails?.PromoterTypeID || 5
                    }}
                    onClose={() => setShowStaffProfilePopup(false)}
                    onSaved={() => {
                        setShowStaffProfilePopup(false);
                        fetchPromoterDetails();
                    }}
                    IsPromotorForm={true}
                />
            )}
            <InstituteConfirmationPopup
                open={showConfirmPopup}
                onConfirm={handleConfirmYes}
                onCancel={handleConfirmNo}
                instituteData={instituteData}
            />



            {/* <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    <FaUniversity className="mr-2 text-white" />
                    Institute Profile
                </legend> */}
            <fieldset className='mb-4 rounded-md border p-4'>
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    {/* <FaUserTie className="mr-2 text-white" /> */}
                    <span>Institute Profile</span>
                </legend>
                <div className="bg-sky-100 border border-s-sky-400 text-sky-700 px-3 py-2 rounded text-sm mb-4">
                    <strong>Note:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                        <li>
                            Existing Institute can update their below displayed details through their Institute Login &gt; Institute Profile &gt; Institute Profile.
                        </li>
                        <li>
                            New Institute has to fill up all details.
                        </li>
                    </ol>
                </div>
                <div className="px-4 pb-3 pt-3">
                    <label htmlFor="">Whether Existing Institute or New Institute <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div className="col-span-2">
                            <input type="radio" name="Existing" id="" checked={formData?.IsNewInst == 0 ? false : true} disabled />
                            <label htmlFor="" className="pl-2">Existing</label>
                        </div>

                        <div className="col-span-2">
                            <input type="radio" name="New Institute" id="" checked={formData?.IsNewInst == 0 ? true : false} disabled />
                            <label htmlFor="" className="pl-2">New Institute</label>
                        </div>
                    </div>

                </div>

                <form className="w-full px-4 pb-3 pt-3" autoComplete="off">
                    {/* Row 1: Institute Code and Name */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        {formData?.IsNewInst==1 && (
                        <div className="md:col-span-1">
                            <FormComponent
                                label="Institute Code"
                                name="InstituteCode"
                                value={formData?.CollegeRegistrationNo}
                                disabled
                                readOnly
                            />
                        </div>
                        )}

                        <div className="md:col-span-4">
                            <FormComponent
                                label="Institute Name"
                                name="InstituteName"
                                value={formData.InstituteName}
                                onChange={(value) =>
                                    handleInputChange("InstituteName", value.toUpperCase())
                                }

                                required
                                error={errors.InstituteName}
                                extraClass="w-3/4 inline-block"
                                disabled={!isEditingAllowed}
                            />
                            <span> SKILL DEVELOPMENT INSTITUTE</span>
                            <p><span onClick={openReservedWordsListPopup} className="text-blue-500">Click here</span> for list of reserve words i.e. words which cannot be used in the Name of Proposed Institute</p>
                        </div>
                    </div>

                    {/* Row 2: Establishment Date */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div className="md:col-span-1">
                            <FormComponent
                                type="date"
                                label="Institute Establishment Date"
                                name="InstituteEstablishmentDate"
                                value={toInputDate(formData.InstituteEstablishmentDate)}
                                onChange={(value) =>
                                    handleInputChange("InstituteEstablishmentDate", value)
                                }
                                required
                                error={errors.InstituteEstablishmentDate}
                                disabled={!isFormFieldEditable('InstituteEstablishmentDate')}
                            />
                        </div>
                    </div> */}

                    {/* Row 3: Address and Pin Code */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div className="md:col-span-3">
                            <FormComponent
                                label="Address of Institute"
                                name="InstituteAddress"
                                value={formData.InstituteAddress}
                                onChange={(value) =>
                                    handleInputChange("InstituteAddress", value.toUpperCase())
                                }
                                required
                                error={errors.InstituteAddress}
                                disabled={!isEditingAllowed}
                            //disabled={!isFormFieldEditable('InstituteAddress')}
                            // disabled={!isNewInst}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <FormComponent
                                label="Pin Code"
                                type="text"
                                name="PinCode"
                                placeholder="Enter pin code"
                                value={formData.PinCode}
                                maxLength={6}
                                onlydigits={true}
                                required
                                className={`w-full p-2 border rounded-md ${errors.PinCode ? "border-red-500" : "border-gray-300"}`}
                                onChange={(value) => handlePincodeChange("PinCode", value)}
                                error={errors.PinCode}
                                disabled={!isEditingAllowed}
                            />
                        </div>
                    </div>

                    {/* Row 4: State, District, Taluka, City/Village */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <DropdownComponent
                            label="State"
                            name="StateID"
                            options={formatOption(states)}
                            value={formData.StateID?.toString()}
                            onChange={(value) => handleDropdownChange("StateID", value)}
                            error={errors.StateID}
                            required={true}
                            loading={loading.states}
                            disabled={!isEditingAllowed}
                        />
                        <div>
                            <DropdownComponent
                                label="District"
                                name="DistrictID"
                                options={formatOption(districts)}
                                value={formData.DistrictID?.toString()}
                                onChange={(value) => handleDropdownChange("DistrictID", value)}
                                error={errors.DistrictID}
                                required={true}
                                loading={loading.districts}
                                disabled={!isEditingAllowed}
                            //disabled={!isFormFieldEditable('DistrictID')}
                            // disabled={!isNewInst}
                            />
                        </div>
                        <div>
                            <DropdownComponent
                                label="Taluka"
                                name="TalukaID"
                                options={formatOption(talukas)}
                                value={formData.TalukaID?.toString()}
                                onChange={(value) => handleDropdownChange("TalukaID", value)}
                                error={errors.TalukaID}
                                required={true}
                                loading={loading.talukas}
                                disabled={!isEditingAllowed}
                            //disabled={!isFormFieldEditable('TalukaID')}
                            //  disabled={!isNewInst}
                            />
                        </div>
                        <div>
                            <DropdownComponent
                                label="City / Village"
                                name="CityID"
                                options={formatOption(cities)}
                                value={formData.CityID?.toString()}
                                onChange={(value) => handleDropdownChange("CityID", value)}
                                error={errors.CityID}
                                required={true}
                                loading={loading.cities}
                                disabled={!isEditingAllowed}
                            //disabled={!isFormFieldEditable('CityID')}
                            // disabled={!isNewInst}
                            />
                        </div>
                    </div>

                    {/* Row 5: Other City/Village and Location Category */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        {showOtherCity && (
                            <div className="md:col-span-1">
                                <FormComponent
                                    label="Other City / Village"
                                    name="OtherCity"
                                    value={formData.OtherCity}
                                    onChange={(value) =>
                                        handleInputChange("OtherCity", value.toUpperCase())
                                    }
                                    error={errors.OtherCity}
                                    required={true}
                                    disabled={!isEditingAllowed}
                                //disabled={!isFormFieldEditable('OtherCity')}
                                // disabled={!isNewInst}
                                />
                            </div>
                        )}

                        <div className="md:col-span-1">
                            <DropdownComponent
                                label="Location Category"
                                name="LocationCategory"
                                options={formatOptions(locationCategoryOptions)}
                                value={formData.LocationCategory.toString()}
                                onChange={(value) =>
                                    handleDropdownChange("LocationCategory", value)
                                }
                                error={errors.LocationCategory}
                                required={true}
                                loading={false}
                                disabled={!isEditingAllowed}
                            //disabled={!isFormFieldEditable('LocationCategory')}
                            // disabled={!isNewInst}
                            />
                        </div>
                    </div>

                    {/* Row 6: Phone, Email, Website */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 items-start">
                        {/* Phone */}
                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone No. <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center">
                                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm rounded-l-md h-[38px]">
                                    +91
                                </span>
                                <input
                                    type="text"
                                    name="PhoneNo"
                                    value={formData.PhoneNo}
                                    onChange={(e) => {
                                        const onlydigits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        handleInputChange("PhoneNo", onlydigits);
                                    }}
                                    maxLength={10}
                                    placeholder="Enter phone number"
                                    className={`w-full px-3 py-2 text-sm border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.PhoneNo ? "border-red-500" : "border-gray-300"}`}
                                    //  disabled={!isNewInst}
                                    disabled={!isEditingAllowed}
                                />
                            </div>
                            {/* {errors.PhoneNo && (
                                <p className="text-xs text-red-500 mt-1">{errors.PhoneNo}</p>
                            )} */}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="EMailID"
                                className="block text-sm font-medium text-gray-700 mb-1 h-5"
                            >
                                E-Mail ID <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="email"
                                id="EMailID"
                                name="EMailID"
                                value={formData.EMailID}
                                onChange={(e) => handleInputChange("EMailID", e.target.value)}
                                required
                                //  disabled={!isFormFieldEditable('EMailID')}
                                // disabled={!isNewInst}
                                placeholder="Enter your email"
                                className={`block w-full px-3 py-2 text-sm border rounded-md
                                   focus:outline-none focus:ring-2 focus:ring-blue-500
                                   ${errors.EMailID ? "border-red-500" : "border-gray-300"}
                                   disabled:bg-gray-100`}
                                disabled={!isEditingAllowed}
                            />

                            {errors.EMailID && (
                                <div className="text-xs text-red-500 mt-1">
                                    {errors.EMailID}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Authorized Representative of Training Institute */}
                    <div className="mb-4 border rounded px-2 py-2 w-full">

                        <p>Authorized Representative of Training Institute <span className="text-red-500">*</span></p>
                        <div className="px-3 py-2 mb-2 rounded flex justify-center items-center">
                            <Button variant='info' size='sm' onClick={openStaffProfilePopup} disabled={!isEditingAllowed}>
                                Update Authorized Representative of Training Institute
                            </Button>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-full border-collapse border border-gray-300 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-2 py-2 text-center ">
                                            Profile ID
                                        </th>

                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">
                                            Title
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[230px]">
                                            First Name
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">
                                            Middle/ Father/ Husband Name
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[220px]">
                                            Last/ Surname
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[120px]">
                                            Gender
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[140px]">
                                            Date of Birth
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[140px]">
                                            Mobile No.
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[140px]">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {promoterDetails.length > 0 ? (
                                        promoterDetails.map((detail, index) => {
                                            const staffIdInHtmlForm = detail?.StaffProfileId;
                                            const match = staffIdInHtmlForm.match(/>([^<]+)</);
                                            const formattedStaffID = match ? match[1] : null;

                                            return (
                                                <tr key={index} className="bg-white">
                                                    <td className="border border-gray-300 px-2 py-1 text-center ">
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrintProfile(formattedStaffID)}
                                                            className="text-blue-600 underline hover:text-blue-800 cursor-pointer text-xs font-medium"
                                                            title="Click to view profile"
                                                        >
                                                            {formattedStaffID}
                                                        </button>
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 text-center">
                                                        {detail?.Title}
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 text-center">
                                                        {detail?.FirstName}
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 text-center">
                                                        {detail?.MiddleName}
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 w-[220px] text-center">
                                                        {detail?.LastName}
                                                    </td>
                                                    <td className="border border-gray-300 px-2 py-1 w-[220px] text-center">
                                                        {detail?.GenderCode}
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 w-[120px] text-center">
                                                        {/* <input
                                                            type="date"
                                                            className={`w-full px-2 py-1 text-xs border border-gray-300 rounded `}
                                                            value={detail?.FormatDOB}
                                                            onChange={(e) =>
                                                                handleRegistrationChange(index, "FormatDOB", e.target.value)
                                                            }
                                                            disabled={!canEdit}
                                                        /> */}
                                                        {detail?.FormatDOB}
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 w-[140px] text-center">
                                                        {detail?.MobileNo}
                                                    </td>
                                                    <td className="border border-gray-300 px-2 py-1 w-[140px] flex justify-center">
                                                        {detail?.IsapprovedPromoter === 'V' ? (
                                                            <img src={VerifiedIcon} alt="Approved" className="w-8 h-8" />
                                                        ) : (
                                                            <img src={QuestionMark} alt="Not Approved" className="w-8 h-8" />
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center text-xs text-gray-500 py-4">
                                                No Authorized Representative.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Other Registration Details Table */}

                    <div className="mb-4 border rounded px-2 py-2 w-full">
                        <div className="bg-gray-200 px-3 py-2 mb-2 rounded flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Other Registration Details
                            </h3>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-full border-collapse border border-gray-300 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-2 py-2 text-center w-10">
                                            <Button size='xs' disabled={!isEditingAllowed} onClick={addRegistrationRow}>
                                                <FaPlusSquare />
                                            </Button>
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">S.N.</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[230px]">Particular</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Institute Code</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[220px]">Registered Name</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[120px]">Approval Date</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[140px]">Approval Order</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {registrationDetails.length > 0 ? (
                                        registrationDetails.map((detail, index) => {
                                            const canEdit = canEditRegistrationRow(detail);
                                            const canDelete = canDeleteRegistrationRow(detail);

                                            return (
                                                <tr key={index} className="bg-white">
                                                    {/* Delete button */}
                                                    <td className="border border-gray-300 px-2 py-1 text-center w-10">
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteRegistrationRow(index)}
                                                            className={`text-red-600 hover:text-red-800 ${!canDelete ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                            disabled={!canDelete}
                                                        >
                                                            <FaTrash className="w-4 h-4" />
                                                        </button>
                                                    </td>

                                                    {/* Serial number */}
                                                    <td className="border border-gray-300 px-2 py-1 text-xs text-center">
                                                        {index + 1}
                                                    </td>

                                                    {/* Particular dropdown - mirrors ddlParticular with exact same options as old code */}
                                                    <td className="border border-gray-300 px-2 py-1 w-[250px]">
                                                        <select
                                                            className={`w-full px-2 py-1 text-xs border rounded ${errors[`registration_${index}_ParticularID`]
                                                                ? 'border-red-500'
                                                                : 'border-gray-300'
                                                                } ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                            value={detail.ParticularID || "-1"}
                                                            onChange={(e) =>
                                                                handleRegistrationChange(index, "ParticularID", e.target.value)
                                                            }
                                                            disabled={!canEdit}
                                                        >
                                                            {/* Exact options from gvOtherRegistrationDetails_RowDataBound */}
                                                            <option value="-1">Select</option>
                                                            <option value="1">VTP (as on MSSDS/ MSCVT Portal)</option>
                                                            <option value="2">TC ID (as on Skill India Portal)</option>
                                                            <option value="3">TP ID (as on Skill India Portal)</option>
                                                        </select>
                                                        {errors[`registration_${index}_ParticularID`] && (
                                                            <span className="text-xs text-red-500 block mt-1">
                                                                {errors[`registration_${index}_ParticularID`]}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Institute Code - txtRegistrationNumber */}
                                                    <td className="border border-gray-300 px-2 py-1">
                                                        <input
                                                            type="text"
                                                            className={`w-full h-7 px-2 py-1 text-xs border rounded uppercase ${errors[`registration_${index}_InstituteCode`]
                                                                ? 'border-red-500'
                                                                : 'border-gray-300'
                                                                } ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                            value={detail.InstituteCode || ""}
                                                            onChange={(e) =>
                                                                handleRegistrationChange(
                                                                    index,
                                                                    "InstituteCode",
                                                                    e.target.value.toUpperCase()
                                                                )
                                                            }
                                                            disabled={!canEdit}
                                                            placeholder="Enter code"
                                                        />
                                                        {errors[`registration_${index}_InstituteCode`] && (
                                                            <span className="text-xs text-red-500 block mt-1">
                                                                {errors[`registration_${index}_InstituteCode`]}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Registered Name - txtRegisteredName */}
                                                    <td className="border border-gray-300 px-2 py-1 w-[220px]">
                                                        <input
                                                            type="text"
                                                            className={`w-full h-7 px-2 py-1 text-xs border rounded uppercase ${errors[`registration_${index}_RegisteredName`]
                                                                ? 'border-red-500'
                                                                : 'border-gray-300'
                                                                } ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                            value={detail.RegisteredName || ""}
                                                            onChange={(e) =>
                                                                handleRegistrationChange(
                                                                    index,
                                                                    "RegisteredName",
                                                                    e.target.value.toUpperCase()
                                                                )
                                                            }
                                                            disabled={!canEdit}
                                                            placeholder="Enter name"
                                                        />
                                                        {errors[`registration_${index}_RegisteredName`] && (
                                                            <span className="text-xs text-red-500 block mt-1">
                                                                {errors[`registration_${index}_RegisteredName`]}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Approval Date - txtApprovalDate */}
                                                    <td className="border border-gray-300 px-2 py-1 w-[120px]">
                                                        <input
                                                            type="date"
                                                            className={`w-full px-2 py-1 text-xs border ${errors[`registration_${index}_ApprovalDate`]
                                                                ? 'border-red-500'
                                                                : 'border-gray-300'
                                                                } ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                            value={detail.ApprovalDate || ""}
                                                            onChange={(e) =>
                                                                handleRegistrationChange(index, "ApprovalDate", e.target.value)
                                                            }
                                                            disabled={!canEdit}
                                                        />
                                                        {errors[`registration_${index}_ApprovalDate`] && (
                                                            <span className="text-xs text-red-500 block mt-1">
                                                                {errors[`registration_${index}_ApprovalDate`]}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 w-[140px]">
                                                        {detail.ApprovalOrderPath && detail.ApprovalOrderPath.length > 2 ? (
                                                            // btnView equivalent - shows when file already uploaded
                                                            <div className="flex flex-col gap-1 ">
                                                                <button className="flex justify-center text-blue-600 hover:text-blue-800" onClick={() => openRegistrationDetailsPopup(detail.ApprovalOrderPath)}>
                                                                    <FaFileAlt className="h-[35px]" />
                                                                </button>
                                                                {/* <a
                                                                    href={detail.ApprovalOrderPath}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 underline text-xs"
                                                                >
                                                                    View Order
                                                                </a> */}
                                                                {/* Allow re-upload only if row is editable */}
                                                                {/* {canEdit && (
                                                                    <UploadPdf
                                                                        file={detail.ApprovalOrderFileName || ""}
                                                                        onFileChange={(fileData) =>
                                                                            handleRegistrationFileUpload(index, fileData)
                                                                        }
                                                                        buttonText="Re-Upload"
                                                                        buttonClassName="bg-gray-500 hover:bg-gray-600"
                                                                        label=""
                                                                        required={false}
                                                                        showLabel={false}
                                                                        allowedFileTypes="pdf"
                                                                        maxFileSize="5 MB"
                                                                        userTypeId={userInfo?.UserTypeID}
                                                                        userLoginID={userLoginID}
                                                                        uniquefilepath={detail.ApprovalOrderPath || ""}
                                                                        id={`uploadApprovalOrder_${index}`}
                                                                    />
                                                                )} */}
                                                            </div>
                                                        ) : (
                                                            // btnUpload equivalent - shows when no file uploaded yet
                                                            <UploadPdf
                                                                file={detail.ApprovalOrderFileName || ""}
                                                                onFileChange={(fileData) =>
                                                                    handleRegistrationFileUpload(index, fileData)
                                                                }
                                                                buttonText="Upload"
                                                                buttonClassName="bg-[#00c3f9] hover:bg-[#00a8d6]"
                                                                label=""
                                                                required={true}
                                                                showLabel={false}
                                                                allowedFileTypes="pdf"
                                                                maxFileSize="5 MB"
                                                                userTypeId={userInfo?.UserTypeID}
                                                                userLoginID={userLoginID}
                                                                linkName="View "
                                                                uniquefilepath={detail.ApprovalOrderPath || ""}
                                                                id={`uploadApprovalOrder_${index}`}
                                                                disabled={!canEdit}
                                                            />
                                                        )}
                                                        {errors[`registration_${index}_ApprovalOrderPath`] && (
                                                            <span className="text-xs text-red-500 block mt-1">
                                                                {errors[`registration_${index}_ApprovalOrderPath`]}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center text-xs text-gray-500 py-4">
                                                No registration details added yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Latitude/Longitude with validation error display */}
                    <div className="grid grid-cols-12 gap-4 mb-4">
                        {/* LEFT SIDE (Input + Notes = SAME HEIGHT AS MAP) */}
                        <div className="col-span-12 md:col-span-5">
                            <div className="h-[360px] flex flex-col gap-3">
                                {/* INPUT (AUTO HEIGHT) */}
                                <FormComponent
                                    label="Latitude, Longitude"
                                    name="LatitudeLongitude"
                                    value={latLongInput?.toString()}
                                    onChange={(value) => {
                                        const cleanedValue = value.replace(/[^0-9.,-]/g, '');
                                        setLatLongInput(cleanedValue);

                                        const [lat, lng] = cleanedValue.split(",");
                                        setFormData(prev => ({
                                            ...prev,
                                            Latitude: lat?.trim() || "",
                                            Longitude: lng?.trim() || ""
                                        }));

                                        setErrors(prev => ({
                                            ...prev,
                                            LatitudeLongitude: ""
                                        }));
                                    }}
                                    required
                                    error={errors.LatitudeLongitude}
                                    //disabled={!isFormFieldEditable('LatitudeLongitude')}
                                    disabled={!isEditingAllowed}
                                />

                                {/* NOTES (TAKES REMAINING HEIGHT) */}
                                <div className="flex-1 bg-gray-50 border border-gray-300 rounded p-3 text-sm overflow-y-auto">
                                    <h4 className="font-semibold mb-2 sticky top-0 bg-gray-50">
                                        Instructions
                                    </h4>
                                    <ul className="list-disc ml-5 space-y-2">
                                        <li>
                                            <a
                                                href="https://www.google.com/maps"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline"
                                            >
                                                Click Here
                                            </a>{" "}
                                            to open Google Maps
                                        </li>
                                        <li>Preciously locate your Institute on the Google Map</li>
                                        <li>A pop-up window will appear with the Latitude, Longitude in decimal format at the top</li>
                                        <li>To copy just click on the Latitude, Longitude</li>
                                        <li>Paste this value in the text box</li>
                                        <li>
                                            <a href="#" className="text-blue-600 underline">
                                                Click Here
                                            </a>{" "}
                                            to see video
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-7">
                            <div className="h-[360px] border border-gray-300 rounded overflow-hidden bg-white">
                                {formData.Latitude && formData.Longitude ? (
                                    <iframe
                                        title="Google Map"
                                        className="w-full h-full"
                                        frameBorder="0"
                                        src={`https://www.google.com/maps?q=${formData.Latitude},${formData.Longitude}&z=15&output=embed`}
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                        Map will appear here after entering Latitude & Longitude
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Secretary Verification Section - Only for UserType 81 */}
                    {showVerificationUI && (userInfo?.UserTypeID === 81 || userInfo?.UserTypeID === 81) && (
                        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                            <h3 className="text-md font-normal mb-3">Select Approved Reject Status <span className="text-red-500">*</span></h3>

                            <div className="flex gap-6 mb-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="V"
                                        checked={approvalStatus === 'V'}
                                        onChange={(e) => setApprovalStatus(e.target.value)}
                                        className="form-radio h-4 w-4 text-green-600"
                                    />
                                    <span className="ml-2 text-sm">Verified</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="R"
                                        checked={approvalStatus === 'R'}
                                        onChange={(e) => setApprovalStatus(e.target.value)}
                                        className="form-radio h-4 w-4 text-red-600"
                                    />
                                    <span className="ml-2 text-sm">Rejected</span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-normal mb-2">
                                    Reason for Rejection/ Remark<span className="text-red-500">*</span>
                                    {approvalStatus === 'R'}
                                </label>
                                <textarea
                                    className="w-full border rounded p-2 mt-2 uppercase"
                                    placeholder="ENTER REMARK..."
                                    value={rejectReason || ""}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                            </div>


                        </div>
                    )}
                    {verificationStatusMessage.show && (
                        <div className="mt-4 p-3 rounded border">

                            <div className={
                                verificationStatusMessage.color === "red"
                                    ? "text-red-600"
                                    : "text-green-600"
                            }>

                                <p className="font-normal">
                                    Verification Status: {verificationStatusMessage.status}
                                </p>

                                <p className="text-sm">
                                    Reason for Rejection/ Remark : {verificationStatusMessage.remark}
                                </p>

                            </div>

                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 border-t border-gray-300 pt-4 relative">

                        {/* Center: Back & Save */}
                        <div className="flex justify-center gap-4">
                            {/* <button
                                type="button"
                                className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                                onClick={handleBack}
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                                onClick={handleSave}
                            >
                                Save and Next
                            </button> */}
                            <Button variant='primary' onClick={handleBack}>Back</Button>
                            {!isEditingAllowed ? (
                                <Button variant='success' onClick={handleSave}>Next</Button>
                            ) : (
                                <Button variant='success' onClick={handleSave}>Save & Next</Button>
                            )}
                            <Button variant='danger' onClick={handleClose}>close</Button>
                        </div>
                    </div>
                </form>
            </fieldset>


        </div>
    );
};

export default ProposedInstituteDetails;
