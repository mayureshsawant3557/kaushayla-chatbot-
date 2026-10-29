import React, { useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../../Context/ThemeContext";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FormComponent from "../../formcomponent/FormComponent";
import UploadPdf from "../../formcomponent/UploadPdf";
import { FaUniversity, FaTrash } from "react-icons/fa";
import { useAuth } from "../../../Hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import agent from '../../../lib/api/agent';
import Swal from "sweetalert2";
import { useLoading } from "../../../Hooks/useLoading";
import { useCascadingAddress } from "../../../lib/hooks/useCascadingAddress";
import {
    useStates, useDistricts, useTalukas, useCities, usePincodeLookup,
} from "../../../lib/hooks/useAddressQueries";
import { SwalHelper } from "../../../utils/swalHelper";

import {
    GetInstituteIDByInstituteCode,
    GetInstituteManagementDetails,
    GetProposedInstituteDetails,
    SaveProposedInstituteDetails,
    LockInstituteProfileDetails,
    UnLockInstituteProfileDetails,
    IsEligible,
    IsVerified,
    SaveInstituteVerificationDetails
} from "../../../Endpoints_All/Base/Institute";
import { GetInstituteAndManagementMobile } from "../../../Endpoints_All/ITISpecification/itiSpecification";
import OTPService from '../../formcomponent/OTPService';
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import { formatOptions } from "../../../utils/CommonHelper";
import { DateInput } from "../../formcomponent/DateInputComponent";
import { GetMasterTableList } from "../../../Endpoints_All/Base/masterData";

const locationCategoryOptions = [
    { id: "1", name: "Urban" },
    { id: "2", name: "Rural" },
    { id: "3", name: "Semi-Urban" }
];

const particularOptions = [
    { id: "1", name: "VTP (as on MSSDS/ MSCVT Portal)" },
    { id: "2", name: "TC ID (as on Skill India Portal)" },
    { id: "3", name: "TP ID (as on Skill India Portal)" }
];

function formatOption(options) {
    return options.map((opt) =>
        typeof opt === "object"
            ? { value: opt.id?.toString(), label: opt.name }
            : { value: opt, label: opt }
    );
}

//const formatOption = (data) => {
//    return data.map(item => ({
//        value: item.Value,
//        label: item.Text
//    }));
//};

const InstituteProfile = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const P1 = params.get("P1");

    const [finalStatus, setFinalStatus] = useState("");
    const [rejectReason, setRejectReason] = useState("");

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
        InstituteCategory: "",
        InstituteOwnership: "",
    });

    //const [states, setStates] = useState([]);
    //const [districts, setDistricts] = useState([]);
    //const [talukas, setTalukas] = useState([]);
    /*    const [cities, setCities] = useState([]);*/
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

    //const [loading, setLoading] = useState({
    //    states: false,
    //    districts: false,
    //    talukas: false,
    //    cities: false
    //});

    const [errors, setErrors] = useState({});
    const [fieldsDisabled, setFieldsDisabled] = useState(false);
    const [latLongInput, setLatLongInput] = useState("");
    const [showRepPopup, setShowRepPopup] = useState(false);
    const [popupKey, setPopupKey] = useState(0);
    const [registrationDetails, setRegistrationDetails] = useState([]);
    const [isAutoFillingAddress, setIsAutoFillingAddress] = useState(false);
    const [instituteCategories, setInstituteCategories] = useState([]);

    const [instituteOwnerships, setInstituteOwnerships] = useState([]);

    useCascadingAddress(formData, setFormData, isAutoFillingAddress);
    const { data: states, loading: stateLoading } = useStates();
    const { data: districts, loading: districtsLoading } = useDistricts(formData.StateID);
    const { data: talukas, loading: talukaLoading } = useTalukas(formData.DistrictID);
    const { data: cities, loading: cityLoading } = useCities(formData.TalukaID);
    const { getPincode } = usePincodeLookup();

    const handlePincodeChange = useCallback(async (value) => {
        const pin = value.replace(/\D/g, "").slice(0, 6);
        setFormData(p => ({ ...p, PinCode: pin }));

        setErrors(prev => {
            const { PinCode, ...rest } = prev;
            return rest;
        });

        if (pin.length < 6) {
            setFormData(prev => ({
                ...prev,
                StateID: "",
                DistrictID: "",
                TalukaID: "",
                CityID: ""
            }));

            setErrors(prev => {
                const { StateID, DistrictID, TalukaID, CityID, ...rest } = prev;
                return rest;
            });

            return;
        }

        if (pin.length !== 6) return;

        try {
            /*const res = await pincodeMutation.mutateAsync(pin);*/
            setIsAutoFillingAddress(true);
            const res = await getPincode(pin);
            if (res.Status !== "Success") return;

            const { StateID, DistrictID, TalukaID, CityID } = res.Data;
            setFormData(prev => ({
                ...prev,
                PinCode: pin,
                StateID,
                DistrictID,
                TalukaID,
                CityID
            }));

            setErrors(prev => {
                const { StateID: s, DistrictID: d, TalukaID: t, CityID: c, ...rest } = prev;
                return rest;
            });
        } catch {
            SwalHelper.error("Invalid Pincode");
        } finally {
            setTimeout(() => setIsAutoFillingAddress(false), 0);
        }
    }, []);
    // Initialize OTP Service Hook for Verification
    const otpServiceVerification = OTPService({
        mobileNo: userMobile,
        purpose: 'InstituteProfileVerification',
        isVerifyRequired: true,
        messege: 'OTP verification required by Authorized Representative of Institute for Institute Profile Verification',
        isDuplicateCheck: false,
        onSuccess: async (data) => {
            await submitVerificationRequest();
        },
        onError: (error) => {
            Swal.fire({
                title: "Verification Failed",
                text: error.message || "OTP verification failed. Please try again.",
                icon: "error"
            });
        },
        onCancel: () => {
        }
    });

    // Initialize OTP Service Hook for Withdraw
    const otpServiceWithdraw = OTPService({
        mobileNo: userMobile,
        purpose: 'WithdrawInstituteProfileVerification',
        isVerifyRequired: true,
        messege: 'OTP verification required by Authorized Representative of Institute to Withdraw Verification Request',
        isDuplicateCheck: false,
        onSuccess: async (data) => {
            await submitWithdrawRequest();
        },
        onError: (error) => {
            Swal.fire({
                title: "Verification Failed",
                text: error.message || "OTP verification failed. Please try again.",
                icon: "error"
            });
        },
        onCancel: () => {
        }
    });

    useEffect(() => {

        initializeComponent();
        
    }, []);

    // useEffect(() => {
    //     const fetchDropdowns = async () => {
    //         try {
    //             const [catRes, ownRes] = await Promise.all([
    //                 agent.get(GetMasterTableList, {
    //                     params: {
    //                         TableName: 'Master_Institute_Category',
    //                         DataValueField: 'CategoryID',
    //                         DataTextField: 'Category',
    //                         HasSelect: true
    //                     }
    //                 }),
    //                 agent.get(GetMasterTableList, {
    //                     params: {
    //                         TableName: 'Master_InstituteOwnership',
    //                         DataValueField: 'OwnershipID',
    //                         DataTextField: 'OwnershipName',
    //                         HasSelect: true
    //                     }
    //                 }),
    //             ]);
    //             console.log('Category Response:', catRes);
    //             console.log('Ownership Response:', ownRes);

    //             if (catRes.data?.Status === "Success")
    //                 setInstituteCategories(catRes.data.Data);
    //             if (ownRes.data?.Status === "Success")
    //                 setInstituteOwnerships(ownRes.data.Data);
    //         } catch (err) {
    //             console.error("Error fetching dropdown data:", err);
    //         }
    //     };
    //     fetchDropdowns();
    // }, []);

    // Initialize component - Fetch all initial data
    const initializeComponent = async () => {
        await fetchUserAndInstituteDetails();
        await fetchIP();
        //await fetchStates();
    };

    // Separate useEffect to handle dependent API calls
    useEffect(() => {

        if (instituteID && userLoginID) {
            fetchInstituteProfile();
            fetchManagementMobile();
            checkEligibilityStatus();
            checkVerificationStatus();
        }
    }, [instituteID, userLoginID]);

    // Fetch user and institute details once
    const fetchUserAndInstituteDetails = async () => {
        try {
            const loginID = userInfo?.UserLoginID;

            setUserLoginID(loginID);

            //  Use P1 from URL (Reverify flow)
            if (P1) {
                const instID = Number(P1);
                setInstituteID(instID);

                return; //  stop here, don't call old API
            }


            const resInstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`
            );

            if (resInstitute.data?.Data) {
                const instID = resInstitute.data.Data;
                setInstituteID(instID);

            } else {
            }

        } catch (error) {
        }
    };

    // Fetch IP Address using getIp API
    const fetchIP = async () => {
        try {
            const response = await agent.get(getIp, {
                headers: {
                    'accept': '*/*'
                }
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

    // Fetch management mobile number
    const fetchManagementMobile = async () => {
        if (!instituteID) {
            return;
        }

        try {
            const url = `${GetInstituteAndManagementMobile}/${instituteID}/1`;
            debugger;
            const response = await agent.get(url, {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                }
            });

            if (response.data && response.data.Status === "Success" && response.data.Data?.length > 0) {
                const mobileNo = response.data.Data[0].MobileNo || "";
                setUserMobile(mobileNo);
            } else {
                setUserMobile("");
            }
        } catch (error) {
        }
    };

    //const fetchStates = async () => {
    //    startLoading()
    //    try {
    //        const response = await agent.get(GET_STATES_API);
    //        console.log("States response:", response.data);
    //        if (response.data.Status === "Success") {
    //            const stateData = response.data.Data.filter(item => item.Value !== "-1");
    //            setStates(stateData);
    //        }
    //    } catch (error) {
    //        console.error("Error fetching states:", error);
    //        Swal.fire({
    //            icon: 'error',
    //            title: 'Error',
    //            text: `Error loading states: ${error.message}`
    //        });
    //    } finally {
    //        stopLoading();
    //    }
    //};

    //const getDistricts = async (stateId) => {
    //    startLoading()
    //    try {
    //        const response = await agent.get(GetMasterDistrict);
    //        if (response.data.Status === "Success") {
    //            const allDistricts = response.data.Data.filter(item => item.Group == stateId);
    //            setDistricts(allDistricts);
    //        }
    //    } catch (error) {
    //        console.error("Error fetching districts:", error);
    //    } finally {
    //        stopLoading()
    //    }
    //};

    //const getTalukas = async (districtId) => {
    //    startLoading()
    //    try {
    //        const response = await agent.get(GetMasterTaluka);
    //        if (response.data.Status === "Success") {
    //            const allTalukas = response.data.Data.filter(item => item.Value !== "-1" && item.Group == districtId);
    //            setTalukas(allTalukas);
    //        }
    //    } catch (error) {
    //        console.error("Error fetching talukas:", error);
    //    } finally {
    //        stopLoading()
    //    }
    //};

    //const getCities = async (talukaId) => {
    //    startLoading()
    //    try {
    //        const response = await agent.get(GetMasterCity);
    //        if (response.data.Status === "Success") {
    //            const allCities = response.data.Data.filter(item => item.Value !== "-1" && item.Group == talukaId);

    //            const citiesWithOther = [
    //                ...allCities,
    //                { Value: "9999999", Text: "Other", Group: talukaId, Group2: "-1" }
    //            ];

    //            setCities(citiesWithOther);
    //        }
    //    } catch (error) {
    //        console.error("Error fetching cities:", error);
    //    } finally {
    //        stopLoading()
    //    }
    //};

    const fetchInstituteProfile = async () => {
        if (!instituteID || !userLoginID) {
            return;
        }

        startLoading();
        try {
            const response = await agent.get(
                `${GetProposedInstituteDetails}/${instituteID}/${userLoginID}`
            );
            if (response.data?.Status === "Success" && response.data?.Data) {
                const data = response.data.Data;

                setFormData({
                    InstituteID: data.InstituteID || 0,
                    InstituteCode: data.InstituteCode || "",
                    InstituteName: data.InstituteName || "",
                    InstituteEstablishmentDate: data.EstablishmentDate && data.EstablishmentDate !== "0001-01-01T00:00:00"
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
                    LocationCategory: data.LocationCategoryID || "1",
                    LocationCategoryID: data.LocationCategoryID || "1",
                    PhoneNo: data.PhoneNo || "",
                    EMailID: data.EMailID || "",
                    Website: data.WebSite || "",
                    Latitude: data.Latitude || "",
                    Longitude: data.Longitude || "",
                    latLongInput: data.Latitude || "",
                    MSBSVETRegistrationNumber: data.MSBSVETRegistrationNumber || "",
                    MSBSVETApprovalDate: data.MSBSVETApprovalDate && data.MSBSVETApprovalDate !== "0001-01-01T00:00:00"
                        ? data.MSBSVETApprovalDate.substring(0, 10)
                        : "",
                    MSBSVETApprovalLetterPath: data.MSBSVETApprovalLetterPath || "",
                    VTPRegistrationNumber: data.VTPRegistrationNumber || "",
                    VTPApprovalDate: data.VTPApprovalDate && data.VTPApprovalDate !== "0001-01-01T00:00:00"
                        ? data.VTPApprovalDate.substring(0, 10)
                        : "",
                    VTPApprovalLetterPath: data.VTPApprovalLetterPath || "",
                    SmartTPRegistrationNumber: data.SmartTPRegistrationNumber || "",
                    SmartTPApprovalDate: data.SmartTPApprovalDate && data.SmartTPApprovalDate !== "0001-01-01T00:00:00"
                        ? data.SmartTPApprovalDate.substring(0, 10)
                        : "",
                    SmartTPApprovalLetterPath: data.SmartTPApprovalLetterPath || "",
                    SmartTCRegistrationNumber: data.SmartTCRegistrationNumber || "",
                    SmartTCApprovalDate: data.SmartTCApprovalDate && data.SmartTCApprovalDate !== "0001-01-01T00:00:00"
                        ? data.SmartTCApprovalDate.substring(0, 10)
                        : "",
                    SmartTCApprovalLetterPath: data.SmartTCApprovalLetterPath || "",
                    FormStatus: data.FormStatus || "",
                    InstituteProfileVerificationRemark: data.InstituteProfileVerificationRemark || "",
                    InstituteCategory: data.InstituteCategoryID?.toString() || "",
                    InstituteOwnership: data.InstituteOwnershipID?.toString() || "",
                });
                setFinalStatus(data.FormStatus || "");
                setRejectReason(data.InstituteProfileVerificationRemark || "");
                setShowOtherCity(data.CityID === 9999999 || data.CityID == "9999999");
                //getDistricts(data.StateID || "");
                //getTalukas(data.DistrictID || "");
                //getCities(data.TalukaID || "");
                setLatLongInput(
                    data.Latitude && data.Longitude
                        ? `${data.Latitude}, ${data.Longitude}`
                        : data.Latitude || ""
                );

                if (data.lstOtherRegistrationDetailsEntity && data.lstOtherRegistrationDetailsEntity.length > 0) {
                    const mappedDetails = data.lstOtherRegistrationDetailsEntity.map(detail => ({
                        ID: detail.ID || 0,
                        ParticularID: detail.ParticularID || "",
                        InstituteCode: detail.InstituteCode || "",
                        RegisteredName: detail.RegisteredName || "",
                        ApprovalDate: detail.ApprovalDate && detail.ApprovalDate !== "0001-01-01T00:00:00"
                            ? detail.ApprovalDate.substring(0, 10)
                            : "",
                        ApprovalOrderPath: detail.ApprovalOrderPath || "",
                        ApprovalOrderFileName: detail.ApprovalOrderFileName || "",
                        isNew: false, // Mark existing records
                    }));
                    setRegistrationDetails(mappedDetails);
                }
            }

        } catch (error) {
            Swal.fire("Error", "Failed to fetch institute profile", "error");
        } finally {
            stopLoading();
        }
    };

    // Check eligibility status using IsEligible API
    const checkEligibilityStatus = async () => {
        if (!instituteID || !userLoginID) {
            return;
        }

        try {

            const response = await agent.post(IsEligible, {
                instituteID: instituteID,
                userLoginID: userLoginID
            }, {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                }
            });


            if (response.data && response.data.Status === "Success") {
                const eligibilityData = response.data.Data?.[0];
                if (eligibilityData) {
                    const isEligible = eligibilityData.IsEligible || false;
                    const errMsg = eligibilityData.ErrMsg || "";

                    setIsEligibleForRequest(isEligible);
                    setEligibilityMessage(errMsg);

                    // Set fields disabled if not eligible (request already sent)
                    setFieldsDisabled(!isEligible);

                    // Scroll to top if there's a message
                    if (!isEligible && errMsg) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
            }
        } catch (error) {
        }
    };

    // Check verification status using IsVerified API
    const checkVerificationStatus = async () => {
        if (!instituteID || !userLoginID) {
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
        }
    };

    // Check if user can withdraw - calls IsVerified API
    const checkWithdrawEligibility = async () => {
        if (!instituteID || !userLoginID) {
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
            Swal.fire("Error", "Failed to check verification status. Please try again.", "error");
            return false;
        }
    };

    // Determine if form fields are editable
    const isFormFieldEditable = (fieldName) => {


        // ✅ HIGHEST PRIORITY: Secretary (UserTypeID 81)
        if (userInfo?.UserTypeID === 81) {
            return true; // 🔥 ALL FIELDS UNLOCKED
        }
        // If profile is verified, only Email, PhoneNo, and Website are editable
        if (isProfileVerified) {
            return ['EMailID', 'PhoneNo', 'Website'].includes(fieldName);
        }

        // Otherwise, use the general fieldsDisabled state
        return !fieldsDisabled;
    };

    // Determine if registration table can add new rows
    const canAddRegistrationRow = () => {
        // If profile is verified, can add new rows
        if (userInfo?.UserTypeID === 81) return true;
        if (isProfileVerified) {
            return true;
        }

        // Otherwise, based on fieldsDisabled
        return !fieldsDisabled;
    };

    // Determine if a registration row can be edited
    const canEditRegistrationRow = (row) => {
        // If profile is verified, only new rows can be edited
        if (userInfo?.UserTypeID === 81) return true;
        if (isProfileVerified) {
            return row.isNew === true;
        }

        // Otherwise, based on fieldsDisabled
        return !fieldsDisabled;
    };

    // Determine if a registration row can be deleted
    const canDeleteRegistrationRow = (row) => {
        // If profile is verified, only new rows can be deleted
        if (userInfo?.UserTypeID === 81) return true;
        if (isProfileVerified) {
            return row.isNew === true;
        }

        // Otherwise, based on fieldsDisabled
        return !fieldsDisabled;
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
    const handleCityChange = (value) => {
        const isOther = value === "9999999";
        setShowOtherCity(isOther);
        setFormData(p => ({ ...p, CityID: value, CityName: isOther ? "" : p.CityName }));
    };

    const handleChange = useCallback((value, field) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);
    const handleDropdownChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));

        //if (name === "StateID") {
        //    setLoading(prev => ({ ...prev, districts: true, talukas: false, cities: false }));
        //    getDistricts(value);
        //    setFormData((prev) => ({
        //        ...prev,
        //        DistrictID: "",
        //        TalukaID: "",
        //        CityID: "",
        //        OtherCity: ""
        //    }));
        //    setShowOtherCity(false);
        //    setLoading(prev => ({ ...prev, districts: false }));
        //}

        //if (name === "DistrictID") {
        //    setLoading(prev => ({ ...prev, talukas: true, cities: false }));
        //    getTalukas(value);
        //    setFormData((prev) => ({
        //        ...prev,
        //        TalukaID: "",
        //        CityID: "",
        //        OtherCity: ""
        //    }));
        //    setShowOtherCity(false);
        //    setLoading(prev => ({ ...prev, talukas: false }));
        //}

        //if (name === "TalukaID") {
        //    setLoading(prev => ({ ...prev, cities: true }));
        //    getCities(value);
        //    setFormData((prev) => ({
        //        ...prev,
        //        CityID: "",
        //        OtherCity: ""
        //    }));
        //    setShowOtherCity(false);
        //    setLoading(prev => ({ ...prev, cities: false }));
        //}

        //if (name === "CityID") {
        //    const isOther = value === "9999999" || value === 9999999;
        //    setShowOtherCity(isOther);

        //    if (!isOther) {
        //        setFormData(prev => ({ ...prev, OtherCity: "" }));
        //    }
        //}
    };

    //const handlePincodeChange = async (name, value) => {
    //    try {
    //        setFormData(prev => ({ ...prev, [name]: value }));

    //        if (value.length !== 6) return;

    //        setLoading(prev => ({ ...prev, districts: true, talukas: true, cities: true }));

    //        const response = await agent.get(`${GetPincodeData}?Pincode=${value}`);
    //        const data = response.data.Data;

    //        console.log("📍 Pincode data:", data);

    //        if (data.StateID) {
    //            setFormData(prev => ({
    //                ...prev,
    //                StateID: data.StateID.toString()
    //            }));
    //            await getDistricts(data.StateID);
    //        }

    //        if (data.DistrictID) {
    //            setFormData(prev => ({
    //                ...prev,
    //                DistrictID: data.DistrictID.toString()
    //            }));
    //            await getTalukas(data.DistrictID);
    //        }

    //        if (data.TalukaID) {
    //            setFormData(prev => ({
    //                ...prev,
    //                TalukaID: data.TalukaID.toString()
    //            }));
    //            await getCities(data.TalukaID);
    //        }

    //        if (data.CityID) {
    //            setFormData(prev => ({
    //                ...prev,
    //                CityID: data.CityID.toString()
    //            }));
    //            setShowOtherCity(data.CityID.toString() === "9999999");
    //        }

    //    } catch (error) {
    //        console.error("Error fetching pincode data:", error);
    //        Swal.fire("Error", "Invalid pincode or service unavailable", "error");
    //    } finally {
    //        setLoading(prev => ({
    //            ...prev,
    //            districts: false,
    //            talukas: false,
    //            cities: false
    //        }));
    //    }
    //};

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

        setRegistrationDetails([
            ...registrationDetails,
            {
                ID: 0,
                ParticularID: "",
                InstituteCode: "",
                RegisteredName: "",
                ApprovalDate: "",
                ApprovalOrderPath: "",
                ApprovalOrderFileName: "",
                isNew: true, // Mark as new
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
            rowToDelete.ParticularID ||
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
                await saveFormData(updatedDetails);

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Registration detail has been deleted successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } else {
            const updatedDetails = registrationDetails.filter((_, i) => i !== index);
            setRegistrationDetails(updatedDetails);
        }
    };

    const validateRegistrationDetails = () => {
        const newErrors = {};
        let hasErrors = false;

        registrationDetails.forEach((detail, index) => {
            const hasAnyData =
                detail.ParticularID ||
                detail.InstituteCode ||
                detail.RegisteredName ||
                detail.ApprovalDate ||
                detail.ApprovalOrderPath;

            if (hasAnyData) {
                if (!detail.ParticularID) {
                    newErrors[`registration_${index}_ParticularID`] = "Particular is required";
                    hasErrors = true;
                }
                if (!detail.InstituteCode) {
                    newErrors[`registration_${index}_InstituteCode`] = "Institute Code is required";
                    hasErrors = true;
                }
                if (!detail.RegisteredName) {
                    newErrors[`registration_${index}_RegisteredName`] = "Registered Name is required";
                    hasErrors = true;
                }
                if (!detail.ApprovalDate) {
                    newErrors[`registration_${index}_ApprovalDate`] = "Approval Date is required";
                    hasErrors = true;
                }
                if (!detail.ApprovalOrderPath) {
                    newErrors[`registration_${index}_ApprovalOrderPath`] = "Approval Order is required";
                    hasErrors = true;
                }
            }
        });

        return { hasErrors, errors: newErrors };
    };

    const validate = () => {
        const newErrors = {};

        if (userInfo?.UserTypeID === 81) {
            if (!finalStatus) {
                newErrors.finalStatus = "Please select status";
            }

            if (finalStatus === "R" && !rejectReason) {
                newErrors.rejectReason = "Remark required";
            }
        }

        // If profile is verified, only validate editable fields
        if (!isProfileVerified) {
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

            if (!formData.LocationCategory)
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

    const saveFormData = async (registrationDetailsToSave = null) => {
        const detailsToSave = registrationDetailsToSave !== null ? registrationDetailsToSave : registrationDetails;
        debugger;
        startLoading();
        try {
            const payload = {
                instituteID: parseInt(instituteID) || 0,
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
                locationCategory: formData.LocationCategory || "",
                locationCategoryID: parseInt(formData.LocationCategory) || 0,
                lastModifiedOn: "",
                establishmentDate: formData.InstituteEstablishmentDate || " ",
                resolutionPath: "",
                website: formData.Website || "",
                instituteStatusID: 0,
                isActive: true,
                userLoginID: userLoginID || "",
                ipAddress: ipAddress || "0.0.0.0",
                pageCode: "ExistingInstitute",
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

                FrormStatus: finalStatus || "",
                InstituteProfileVerificationRemark: rejectReason,
                lstOtherRegistrationDetailsEntity: detailsToSave
                    .filter(detail => {
                        return detail.ParticularID ||
                            detail.InstituteCode ||
                            detail.RegisteredName ||
                            detail.ApprovalDate ||
                            detail.ApprovalOrderPath;
                    })
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


            const response = await agent.post(SaveProposedInstituteDetails, payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });


            if (response?.data?.Status === "Success") {


                if (userInfo?.UserTypeID !== 81) {
                    await Swal.fire("Success", "Institute profile saved successfully!", "success");
                }

                return true;
            } else {
                Swal.fire("Error", response?.data?.Message || "Failed to save", "error");
                return false;
            }
        } catch (err) {

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
            Swal.fire("Validation Error", "Please fill all required fields correctly", "warning");
            return;
        }

        //  Step 1: Save form
        const saved = await saveFormData();

        if (!saved) return;

        //  Step 2: If Secretary → Save verification
        if (userInfo?.UserTypeID === 81) {
            const verified = await saveVerification();
            if (!verified) return;
        }
        if (userInfo?.UserTypeID === 61) {
            navigate("/institute/dashboard");
            return;
        }

        navigate("/institute/dashboard");
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
            Swal.fire("Error", error?.response?.data?.Message || "Failed to submit verification request", "error");
        } finally {
            stopLoading();
        }
    };




    const saveVerification = async () => {
        try {
            if (!finalStatus) {
                Swal.fire("Error", "Please select verification status", "warning");
                return false;
            }

            if (finalStatus === "R" && !rejectReason) {
                Swal.fire("Error", "Remark required for rejection", "warning");
                return false;
            }

            const payload = {
                ...formData,

                instituteID: parseInt(instituteID) || 0,
                userLoginID: userLoginID,
                ipAddress: ipAddress || "0.0.0.0",
                pageCode: "ExistingInstitute",

                //  REQUIRED FALLBACKS (IMPORTANT)
                faxNo: formData.FaxNo || "NA",
                std: formData.STD || "000",
                region: formData.Region || "NA",
                resolutionPath: formData.ResolutionPath || "NA",
                lastModifiedOn: formData.LastModifiedOn || new Date().toISOString(),

                //  VERIFICATION FIELDS
                frormStatus: finalStatus,
                instituteProfileVerificationRemark: rejectReason || ""
            };


            const response = await agent.post(
                SaveInstituteVerificationDetails,
                payload
            );

            if (response?.data?.Status === "Success") {
                Swal.fire("Success", "Verification saved successfully", "success");
                return true;
            } else {
                Swal.fire("Error", response?.data?.Message || "Failed", "error");
                return false;
            }

        } catch (err) {
            Swal.fire("Error", "Verification failed", "error");
            return false;
        }
    };






    // Handle Withdraw Verification - Check IsVerified first, then trigger OTP
    const handleWithdrawVerification = async () => {
        // First check if profile is verified using IsVerified API
        const canWithdraw = await checkWithdrawEligibility();

        if (!canWithdraw) {
            // Already handled in checkWithdrawEligibility - shows alert
            return;
        }

        if (!userMobile) {
            Swal.fire("Error", "Mobile number not found. Please contact administrator.", "error");
            return;
        }

        // Trigger OTP verification for withdraw
        await otpServiceWithdraw.startVerification(userMobile);
    };

    // Submit withdraw request
    const submitWithdrawRequest = async () => {
        if (!instituteID || !userLoginID) {
            Swal.fire("Error", "Institute details not found. Please refresh the page.", "error");
            return;
        }

        startLoading();
        try {

            const response = await agent.post(UnLockInstituteProfileDetails, {
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
                // Refresh the eligibility status after successful unlock
                await checkEligibilityStatus();
                await checkVerificationStatus();

                Swal.fire({
                    title: "Success",
                    text: "Verification request withdrawn successfully! You can now edit the form.",
                    icon: "success"
                });
            } else {
                Swal.fire("Error", response.data?.Message || "Failed to withdraw verification request", "error");
            }
        } catch (error) {
            Swal.fire("Error", error?.response?.data?.Message || "Failed to withdraw verification request", "error");
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

    // const handleBack = () => {
    //     window.history.back();
    // };
    const handleBack = () => {

        const userTypeId = userInfo?.UserTypeID;

        if (Number(userTypeId) === 61) {
            navigate("/institute/dashboard");
        } else {
            navigate(-1);
        }
    };

    const instituteCategoryOptions = instituteCategories.map(cat => ({
        value: cat.Value.toString(),
        label: cat.Text
    }));

    const instituteOwnershipOptions = instituteOwnerships.map(ownership => ({
        value: ownership.Value.toString(),
        label: ownership.Text
    }));


    // Loading indicator
    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }

    return (
        <div className="w-full p-4">
            {/* Eligibility Message - Shows when IsEligible = false */}
            {!isEligibleForRequest && eligibilityMessage && (
                <div className="mb-4 rounded-md border-l-4 border-yellow-500 bg-yellow-50 p-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-yellow-800">{eligibilityMessage}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    type="button"
                                    onClick={() => setEligibilityMessage("")}
                                    className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                                >
                                    {/*<span className="sr-only">Dismiss</span>*/}
                                    {/*<svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">*/}
                                    {/*    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />*/}
                                    {/*</svg>*/}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {userInfo?.UserTypeID !== 81 &&
                formData.FormStatus !== "C" &&
                formData.FormStatus !== "L" && (
                    <div
                        className={`mb-4 rounded-md border-l-4 p-4 ${formData.FormStatus === "V"
                            ? "border-green-500 bg-green-50"
                            : formData.FormStatus === "R"
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 bg-gray-50"
                            }`}
                    >
                        {/* Verification Status Label */}
                        <div className="mb-3">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Verification Status:{" "}
                                <span
                                    className={`font-semibold ${formData.FormStatus === "V"
                                        ? "text-green-600"
                                        : formData.FormStatus === "R"
                                            ? "text-red-600"
                                            : "text-gray-600"
                                        }`}
                                >
                                    {formData.FormStatus === "V"
                                        ? "Verified"
                                        : formData.FormStatus === "R"
                                            ? "Rejected"
                                            : ""}
                                </span>
                            </label>
                        </div>

                        {/* Remark Label */}
                        {formData.InstituteProfileVerificationRemark && (
                            <div className="mb-3">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    {formData.FormStatus === "R"
                                        ? "Reason for Rejection"
                                        : "Remark"}
                                    :{" "}
                                    <span
                                        className={`font-semibold ${formData.FormStatus === "V"
                                            ? "text-green-600"
                                            : formData.FormStatus === "R"
                                                ? "text-red-600"
                                                : "text-gray-600"
                                            }`}
                                    >
                                        {formData.InstituteProfileVerificationRemark}
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>
                )}



            <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    <FaUniversity className="mr-2 text-white" />
                    Institute Profile
                </legend>

                <form className="w-full px-4 pb-3 pt-3" autoComplete="off">
                    {/* Row 1: Institute Code and Name */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div className="md:col-span-1">
                            <FormComponent
                                label="Institute Code"
                                name="InstituteCode"
                                value={formData.InstituteCode}
                                disabled
                                readOnly
                            />
                        </div>

                        <div className="md:col-span-3">
                            <FormComponent
                                label="Institute Name"
                                name="InstituteName"
                                value={formData.InstituteName}
                                disabled
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Row 2: Establishment Date */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
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
                                max={new Date().toISOString().split("T")[0]}
                                error={errors.InstituteEstablishmentDate}
                                disabled={!isFormFieldEditable('InstituteEstablishmentDate')}
                            /> 
                            {/*<label className="block text-sm font-medium text-gray-700 mb-1">*/}
                            {/*    Institute Establishment Date <span className="text-red-500">*</span>*/}
                            {/*</label>*/}
                            {/*<DateInput*/}
                            {/*    value={formData.InstituteEstablishmentDate}*/}
                            {/*    onChange={(value) =>*/}
                            {/*        handleInputChange("InstituteEstablishmentDate", value)*/}
                            {/*    }*/}
                            {/*    minDate={new Date(1900, 0, 1)}*/}
                            {/*    maxDate={new Date()}*/}
                            {/*    disabled={!isFormFieldEditable('InstituteEstablishmentDate')}*/}
                            {/*/>*/}
                            {/*{errors.InstituteEstablishmentDate && (*/}
                            {/*    <p className="text-red-500 text-xs mt-1">*/}
                            {/*        {errors.InstituteEstablishmentDate}*/}
                            {/*    </p>*/}
                            {/*)}*/}
                        </div>
                        <div className="md:col-span-1">
                            <DropdownComponent
                                label="Institute Category"
                                name="InstituteCategory"
                                options={formatOption(instituteCategoryOptions)}
                                value={formData.InstituteCategory?.toString()}
                                onChange={(value) =>
                                    handleDropdownChange("InstituteCategory", value)
                                }
                                error={errors.InstituteCategory}
                                loading={false}
                                disabled={true}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <DropdownComponent
                                label="Institute Ownership"
                                name="InstituteOwnership"
                                options={formatOption(instituteOwnershipOptions)}
                                value={formData.InstituteOwnership?.toString()}
                                onChange={(value) =>
                                    handleDropdownChange("InstituteOwnership", value)
                                }
                                error={errors.InstituteOwnership}
                                loading={false}
                                disabled={true}
                            />
                        </div>

                    </div>

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
                                disabled={!isFormFieldEditable('InstituteAddress')}
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
                                onChange={handlePincodeChange}
                                disabled={!isFormFieldEditable('PinCode')}
                                error={errors.PinCode}
                            />
                        </div>
                    </div>

                    {/* Row 4: State, District, Taluka, City/Village */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <DropdownComponent
                            label="State"
                            name="StateID"
                            options={formatOptions(states)}
                            value={formData.StateID?.toString()}
                            onChange={(value) => handleChange(value, "StateID")}
                            error={errors.StateID}
                            required={true}
                            loading={stateLoading}
                            disabled={!isFormFieldEditable('StateID')}
                        />
                        <div>
                            <DropdownComponent
                                label="District"
                                name="DistrictID"
                                options={formatOptions(districts)}
                                value={formData.DistrictID?.toString()}
                                onChange={(value) => handleChange(value, "DistrictID")}
                                error={errors.DistrictID}
                                required={true}
                                loading={districtsLoading}
                                disabled={!isFormFieldEditable('DistrictID')}
                            />
                        </div>
                        <div>
                            <DropdownComponent
                                label="Taluka"
                                name="TalukaID"
                                options={formatOptions(talukas)}
                                value={formData.TalukaID?.toString()}
                                onChange={(value) => handleChange(value, "TalukaID")}
                                error={errors.TalukaID}
                                required={true}
                                loading={talukaLoading}
                                disabled={!isFormFieldEditable('TalukaID')}
                            />
                        </div>
                        <div>
                            <DropdownComponent
                                label="City / Village"
                                name="CityID"
                                options={formatOptions(cities)}
                                value={formData.CityID?.toString()}
                                onChange={handleCityChange}
                                error={errors.CityID}
                                required={true}
                                loading={cityLoading}
                                disabled={!isFormFieldEditable('CityID')}
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
                                    disabled={!isFormFieldEditable('OtherCity')}
                                />
                            </div>
                        )}

                        <div className="md:col-span-1">
                            <DropdownComponent
                                label="Location Category"
                                name="LocationCategory"
                                options={formatOption(locationCategoryOptions)}
                                value={formData.LocationCategory?.toString()}
                                onChange={(value) =>
                                    handleDropdownChange("LocationCategory", value)
                                }
                                error={errors.LocationCategory}
                                required={true}
                                loading={false}
                                disabled={!isFormFieldEditable('LocationCategory')}
                            />
                        </div>
                    </div>

                    {/* Row 6: Phone, Email, Website */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 items-start">
                        {/* Phone */}
                        <div>
                            <FormComponent
                                label="Phone No."
                                name="PhoneNo"
                                value={formData.PhoneNo}
                                onChange={(value) => {
                                    const onlydigits = value.replace(/\D/g, "").slice(0, 10);
                                    handleInputChange("PhoneNo", onlydigits);
                                }}
                                error={errors.PhoneNo}
                                required
                                disabled={!isFormFieldEditable('PhoneNo')}
                                maxLength={10}
                            />
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
                                disabled={!isFormFieldEditable('EMailID')}
                                placeholder="Enter your email"
                                className={`block w-full px-3 py-2 text-sm border rounded-md
                                    focus:outline-none focus:ring-2 focus:ring-blue-500
                                    ${errors.EMailID ? "border-red-500" : "border-gray-300"}
                                    disabled:bg-gray-100`}
                            />

                            {errors.EMailID && (
                                <div className="text-xs text-red-500 mt-1">
                                    {errors.EMailID}
                                </div>
                            )}
                        </div>

                        {/* Website */}
                        <div className="mb-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Website
                            </label>

                            <input
                                type="text"
                                name="Website"
                                value={formData.Website || ""}
                                onChange={(e) => handleInputChange("Website", e.target.value)}
                                disabled={!isFormFieldEditable('Website')}
                                placeholder="Enter website"
                                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1
                                    ${errors.Website
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-blue-500"
                                    } disabled:bg-gray-100`}
                            />

                            {errors.Website && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.Website}
                                </p>
                            )}
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
                                            <button
                                                type="button"
                                                className={`w-6 h-6 rounded flex items-center justify-center text-lg font-bold ${!canAddRegistrationRow()
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                    }`}
                                                onClick={addRegistrationRow}
                                                disabled={!canAddRegistrationRow()}
                                            >
                                                +
                                            </button>
                                        </th>

                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">
                                            S.N.
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[230px]">
                                            Particular
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">
                                            Institute Code
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[220px]">
                                            Registered Name
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[120px]">
                                            Approval Date
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-[140px]">
                                            Approval Order
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {registrationDetails.length > 0 ? (
                                        registrationDetails.map((detail, index) => {
                                            const canEdit = canEditRegistrationRow(detail);
                                            const canDelete = canDeleteRegistrationRow(detail);

                                            return (
                                                <tr key={index} className="bg-white">
                                                    <td className="border border-gray-300 px-2 py-1 text-center w-10">
                                                        {canDelete ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteRegistrationRow(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <FaTrash className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <FaTrash className="w-4 h-4 text-gray-300" />
                                                        )}
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 text-xs text-center">
                                                        {index + 1}
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 w-[230px]">
                                                        <select
                                                            className={`w-full px-2 py-1 text-xs border ${errors[`registration_${index}_ParticularID`]
                                                                ? "border-red-500"
                                                                : "border-gray-300"
                                                                } rounded ${!canEdit ? 'bg-gray-100' : ''}`}
                                                            value={detail.ParticularID}
                                                            onChange={(e) =>
                                                                handleRegistrationChange(index, "ParticularID", e.target.value)
                                                            }
                                                            disabled={!canEdit}
                                                        >
                                                            <option value="">Select</option>
                                                            {particularOptions.map(opt => (
                                                                <option key={opt.id} value={opt.id}>
                                                                    {opt.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1">
                                                        <input
                                                            type="text"
                                                            className={`w-full h-7 px-2 py-1 text-xs border rounded uppercase ${errors[`registration_${index}_InstituteCode`]
                                                                ? "border-red-500"
                                                                : "border-gray-300"
                                                                } ${!canEdit ? "bg-gray-100" : ""}`}
                                                            value={detail.InstituteCode}
                                                            onChange={(e) =>
                                                                handleRegistrationChange(
                                                                    index,
                                                                    "InstituteCode",
                                                                    e.target.value.toUpperCase()
                                                                )
                                                            }
                                                            disabled={!canEdit}
                                                        />
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 w-[220px]">
                                                        <input
                                                            type="text"
                                                            className={`w-full h-7 px-2 py-1 text-xs border rounded uppercase ${errors[`registration_${index}_RegisteredName`]
                                                                ? "border-red-500"
                                                                : "border-gray-300"
                                                                } ${!canEdit ? "bg-gray-100" : ""}`}
                                                            value={detail.RegisteredName}
                                                            onChange={(e) =>
                                                                handleRegistrationChange(
                                                                    index,
                                                                    "RegisteredName",
                                                                    e.target.value.toUpperCase()
                                                                )
                                                            }
                                                            disabled={!canEdit}
                                                        />
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 w-[120px]">
                                                        <input
                                                            type="date"
                                                            className={`w-full px-2 py-1 text-xs border ${errors[`registration_${index}_ApprovalDate`]
                                                                ? "border-red-500"
                                                                : "border-gray-300"
                                                                } rounded ${!canEdit ? 'bg-gray-100' : ''}`}
                                                            value={detail.ApprovalDate}
                                                            onChange={(e) =>
                                                                handleRegistrationChange(index, "ApprovalDate", e.target.value)
                                                            }
                                                            disabled={!canEdit}
                                                        />
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 w-[140px]">
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
                                                            userLoginID={userInfo?.UserLoginID}
                                                            linkName="View "
                                                            uniquefilepath={detail.ApprovalOrderPath || ""}
                                                            id={`uploadApprovalOrder_${index}`}
                                                            disabled={!canEdit}
                                                        />
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
                                    disabled={!isFormFieldEditable('LatitudeLongitude')}
                                />

                                {/* NOTES (TAKES REMAINING HEIGHT) */}
                                <div className="flex-1 bg-gray-50 border border-gray-300 rounded p-3 text-xs overflow-y-auto">
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
                                        <li>Click on Google Map to precisely locate your institute and then right click</li>
                                        <li>Click Latitude, Longitude shown on map</li>
                                        <li>Paste the copied value</li>
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

                        {/* RIGHT SIDE (MAP — SAME HEIGHT) */}
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

                    {/* Note Section */}
                    {
                        formData.FormStatus === "V" || formData.FormStatus === "R" ?
                            ("") : (
                                <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                                    <p className="text-sm text-blue-700">
                                        <span className="font-medium">Note:</span>
                                    </p>
                                    {isEligibleForRequest ? (
                                        <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
                                            <li>Click on <strong>"Request Verification"</strong> to verify Institute Profile.</li>
                                            <li>Else click on <strong>"Save and Next"</strong> to save information on this page and go to next page.</li>
                                            <li>Once Request Verification is submitted, the information on this page shall be locked for editing.</li>
                                            <li>
                                                Information shall be forwarded to the Secretary, Maharashtra State Board of Skill,
                                                Vocational Education and Training for verification.
                                            </li>
                                            <li>Applicant can Withdraw Verification Request to edit information on this page.</li>
                                            <li>Applicant cannot Withdraw Verification Request after verification by the Board.</li>
                                            <li>
                                                Once verified, the Authorized Representative of the Training Institute shall be
                                                informed through SMS.
                                            </li>
                                            <li>Once verified, only selected information shall be available for editing.</li>
                                            <li>Applicant may contact the Board Helpline for any assistance.</li>
                                            <li>
                                                Existing Institutes with a verified Institute Profile shall only be able to apply
                                                for additional courses/units.
                                            </li>
                                        </ol>
                                    ) : (
                                        <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
                                            <li>Request for Verification is submitted.</li>
                                            <li>
                                                Request has been forwarded to Secretary, Maharashtra State Board of Skill,
                                                Vocational Education and Training for verification.
                                            </li>
                                            <li>Applicant can Withdraw Verification Request and edit information on this page.</li>
                                            <li>Applicant cannot Withdraw Verification Request after verification.</li>
                                            <li>
                                                Once verified, Authorized Representative of Training Institute shall be informed through SMS.
                                            </li>
                                            <li>Applicant may contact Board Helpline for any assistance.</li>
                                            <li>
                                                Existing Institutes with verified Institute Profile shall only be able to apply
                                                for additional course/ units.
                                            </li>
                                        </ol>
                                    )}
                                </div>
                            )}


                    {userInfo?.UserTypeID === 81 && (
                        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                            <h3 className="text-md font-normal mb-3">
                                Select Approved Reject Status <span className="text-red-500">*</span>
                            </h3>

                            <div className="flex gap-6 mb-4">

                                {/* VERIFIED */}
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="V"
                                        checked={finalStatus === "V"}
                                        onChange={(e) => {
                                            setFinalStatus("V");
                                            setRejectReason("");
                                        }}
                                        className="form-radio h-4 w-4 text-green-600"
                                    />
                                    <span className="ml-2 text-sm">Verified</span>
                                </label>

                                {/* REJECTED */}
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="R"
                                        checked={finalStatus === "R"}
                                        onChange={(e) => {
                                            setFinalStatus("R");
                                        }}
                                        className="form-radio h-4 w-4 text-red-600"
                                    />
                                    <span className="ml-2 text-sm">Rejected</span>
                                </label>

                            </div>

                            <div>
                                <label className="block text-sm mb-2">
                                    Reason for Rejection / Remark
                                    {finalStatus === "R" && <span className="text-red-500">*</span>}
                                </label>

                                <textarea
                                    className={`w-full border rounded-md p-2 text-sm uppercase ${finalStatus === "R"
                                        ? "border-gray-300"
                                        : "bg-gray-100 cursor-not-allowed"
                                        }`}
                                    rows="3"
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value.toUpperCase())
                                    }
                                    disabled={finalStatus !== "R"}
                                />
                            </div>
                        </div>
                    )}


                    {/* Action Buttons */}
                    <div className="mt-6 border-t border-gray-300 pt-4 relative">


                        {/* Left side: Request / Withdraw */}
                        {["V", "R"].includes(formData.FormStatus) ? null : (
                            <div className="absolute left-0">
                                {isEligibleForRequest ? (
                                    <button
                                        type="button"
                                        className="bg-[#dc3545] hover:bg-[#c82333] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                                        onClick={async () => {
                                            const isSaved = await handleSaveForRequest();
                                            if (isSaved !== false) {
                                                handleRequestVerification();
                                            }
                                        }}
                                    >
                                        Request Verification
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="bg-[#dc3545] hover:bg-[#c82333] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                                        onClick={handleWithdrawVerification}
                                    >
                                        Withdraw Verification Request
                                    </button>
                                )}
                            </div>
                        )}


                        {/* Center: Back & Save */}
                        <div className="flex justify-center gap-4">
                            <button
                                type="button"
                                className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                                onClick={handleBack}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className={`text-white px-6 py-2 rounded font-semibold text-sm transition-colors ${userInfo?.UserTypeID === 61
                                        ? "bg-yellow-600 hover:bg-yellow-600"
                                        : "bg-[#28a745] hover:bg-[#218838]"
                                    }`}
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>

            </fieldset>


        </div>
    );
};

export default InstituteProfile;
