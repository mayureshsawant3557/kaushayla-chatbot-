import { useContext, useState, useCallback, useRef, useEffect } from "react";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { FaBuilding } from "react-icons/fa";
import FormComponent from "../../Component/formcomponent/FormComponent";
import DropdownSelectComponent from "../../Component/formcomponent/DropdownSelectComponent";
import { FileText } from 'lucide-react';
import AuthorizedRepresentativePopup from "../../Component/formcomponent/AuthorizedRepresentativeReadonlyPopup";
import SecurityQuestion from "../../Component/formcomponent/SecurityQuestion";
import { DateInput } from "../../Component/formcomponent/DateInputComponent";
import CaptchaComponent from "../../Component/formcomponent/CaptchaComponent";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getTitleFromGender } from "../../utils/genderUtils";
import { initialFormState } from "../../lib/types/promotorRegistation.d";
import { SwalHelper } from "../../utils/swalHelper";
import {
    RegisterPromotorOrganisation,
    IsNewRegistrationStarted,
    CheckDuplicatePromotingOrganisation,
} from "../../Endpoints_All/Registration/registration";
import { formatOptions, getDeviceIP } from "../../utils/CommonHelper"; // 👈 getDeviceIP added
import {
    useStates,
    useDistricts,
    useTalukas,
    useCities,
    usePincodeLookup,
} from "../../lib/hooks/useAddressQueries";
import {
    usePromoters,
    usePromoterTypes,
    usePromotingTypes,
} from "../../lib/hooks/useMasterQueries";
import DetailItem from "../../Component/formcomponent/DetailItem";
import { usePromoterRegistrationMutation } from "../../lib/hooks/usePromoterRegistrationMutation";
import publicAgent from "../../lib/api/publicAgent";
import OTPService from '../../Component/formcomponent/OTPService';
import { useCascadingAddress } from "../../lib/hooks/useCascadingAddress";

const PromotingOrganizationRegistration = () => {
    const { color } = useContext(ThemeContext);
    const { t } = useTranslation("promotorOrgRegistration");

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [showOtherCity, setShowOtherCity] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
/*    const [authLoginId, setAuthLoginId] = useState("");*/
    const [selectedAuthData, setSelectedAuthData] = useState(null);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [isAutoFillingAddress, setIsAutoFillingAddress] = useState(false);
    const [registrationAllowed, setRegistrationAllowed] = useState(null);
    const [ipAddress, setIpAddress] = useState(""); // 👈 new
    const [checkingRegistrationNumber, setCheckingRegistrationNumber] = useState(false);
    const regNumberRef = useRef("");

    const SecurityQuestionRef = useRef();
    const CaptchaRef = useRef();
    const navigate = useNavigate();

    // 👈 new: fetch the device IP once when the page loads
    useEffect(() => {
        const fetchIP = async () => {
            try {
                const ip = await getDeviceIP();
                setIpAddress(ip);
            } catch (err) {
                console.error("Failed to get IP:", err);
            }
        };
        fetchIP();
    }, []);

    // Safe AI Assistant Autofill event listener for Promoting Organization
    useEffect(() => {
        const handleAutofill = (e) => {
            if (e && e.detail) {
                const d = e.detail;
                setFormData(prev => ({
                    ...prev,
                    ...(d.NameOfPromotingOrganization && { NameOfPromotingOrganization: d.NameOfPromotingOrganization }),
                    ...(d.DateOfRegistration && { DateOfRegistration: d.DateOfRegistration }),
                    ...(d.OrganizatioRegistrationNumber && { OrganizatioRegistrationNumber: d.OrganizatioRegistrationNumber }),
                    ...(d.Phone && { Phone: d.Phone }),
                    ...(d.Email && { Email: d.Email }),
                    AuthorizedRepresentative: {
                        ...(prev.AuthorizedRepresentative || {}),
                        ...(d.firstName && { FirstName: d.firstName }),
                        ...(d.middleName && { MiddleName: d.middleName }),
                        ...(d.lastName && { LastName: d.lastName }),
                        ...(d.primaryMobile && { MobileNo: d.primaryMobile }),
                        ...(d.email && { EmailID: d.email }),
                    }
                }));
            }
        };
        window.addEventListener('msbsvet:autofill', handleAutofill);
        return () => window.removeEventListener('msbsvet:autofill', handleAutofill);
    }, []);

    useEffect(() => {
        const checkRegistrationStarted = async (UserTypeID) => {
            try {
                const response = await publicAgent.get(
                    `${IsNewRegistrationStarted}?UserTypeID=${UserTypeID}`,
                );

                if (response?.data?.Data === true) {
                    setRegistrationAllowed(true);
                    return;
                }

                setRegistrationAllowed(false);
                SwalHelper.warning(
                    "Alert",
                    "Promoting Organization Registration is Not Started / Closed.",
                ).then(() => {
                    navigate("/react");
                });
            } catch (error) {
                setRegistrationAllowed(false);
                SwalHelper.warning(
                    "Alert",
                    "Promoting Organization Registration is Not Started / Closed.",
                ).then(() => {
                    navigate("/react");
                });
            }
        };

        checkRegistrationStarted(66);
    }, [navigate]);
    useCascadingAddress(formData, setFormData, isAutoFillingAddress);
    // 🔹 Queries
    const { data: states } = useStates();
    const { data: districts } = useDistricts(formData.StateID);
    const { data: talukas } = useTalukas(formData.DistrictID);
    const { data: cities } = useCities(formData.TalukaID);
    /* const pincodeMutation = usePincodeLookup();*/
    const { getPincode } = usePincodeLookup();

    const { data: promoters, isLoading: loadingPromoters } = usePromoters();
    const { data: promoterTypes, isLoading: loadingPromoterTypes } = usePromoterTypes();
    const { data: promotingTypes, isLoading: loadingPromotingTypes } = usePromotingTypes();

    const handleInputChange = (name, value) => {
        if (name === "OrganizatioRegistrationNumber") {
            regNumberRef.current = value ?? "";
        }
        setFormData(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: "" }));
    };

    // Duplicate Registration Number check (backend API + stored procedure)
    const checkDuplicateRegistrationNumber = async (value) => {
        const registrationNumber = value?.trim();

        // Empty is handled by validate(); don't call the API
        if (!registrationNumber) return true;

        try {
            setCheckingRegistrationNumber(true);

            const response = await publicAgent.post(
                CheckDuplicatePromotingOrganisation,
                { OrganizatioRegistrationNumber: registrationNumber }
            );

            const result = response?.data?.Data ?? response?.data?.data;
            const isDuplicate = Number(result?.IsDuplicate ?? result?.isDuplicate);

            // User changed the value while the request was in flight -> ignore this result
            if (regNumberRef.current.trim() !== registrationNumber) {
                return !isDuplicate;
            }

            if (isDuplicate === 1) {
                setErrors(prev => ({
                    ...prev,
                    OrganizatioRegistrationNumber:
                        result?.Message ?? result?.message ??
                        "Organization Registration Number already exists.",
                }));
                return false;
            }

            setErrors(prev => ({ ...prev, OrganizatioRegistrationNumber: "" }));
            return true;
        } catch (error) {
            console.error("Duplicate check failed:", error);
            setErrors(prev => ({
                ...prev,
                OrganizatioRegistrationNumber:
                    "Unable to verify Registration Number. Please try again.",
            }));
            return false;
        } finally {
            setCheckingRegistrationNumber(false);
        }
    };

    const handleCaptchaVerify = (isValid) => {
        setCaptchaVerified(isValid);
        if (isValid) {
            setErrors(prev => {
                const { captcha, ...rest } = prev;
                return rest;
            });
        }
    };

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

    const handleCityChange = (value) => {
        const isOther = value === "9999999";
        setShowOtherCity(isOther);
        setFormData(p => ({ ...p, CityID: value, CityName: isOther ? "" : p.CityName }));
    };

    const registrationMutation = usePromoterRegistrationMutation({
        formData,
        setErrors,
        selectedAuthData,
        SecurityQuestionRef,
        CaptchaRef,
        onSuccess: (data) => {
            resetForm();
            navigate("/after-promoting-register", {
                state: { profileId: data.Data },
            });
        },
    });

    const resetForm = () => {
        setFormData(initialFormState);
        setErrors({});
        setSelectedAuthData(null);
        setPopupOpen(false);
        regNumberRef.current = "";

        SecurityQuestionRef.current?.resetForm();
        if (CaptchaRef.current) {
            CaptchaRef.current.resetCaptcha();
        }
    }

    const handleReset = () => {
        SwalHelper.confirm("Reset Form?", "All entered data will be cleared")
            .then((result) => {
                if (result.isConfirmed) {
                    resetForm();
                    SwalHelper.success("Reset", "Form has been cleared");
                }
            });
    };
    const REQUIRED_FIELDS = {
        RegistrationFor: "Registration For",
        OrganisationTypeID: "Type of Promoting Organization",
        PromoterStatusID: "Promoting Organization Status",
        NameOfPromotingOrganization: "Organization Name",
        DateOfRegistration: "Date of Registration",
        OrganizatioRegistrationNumber: "Registration/Incorporation Number", 
        PromotingOrganizationAddress: "Address",
        StateID: "State",
        DistrictID: "District",
        TalukaID: "Taluka",
        CityID: "City",
        PinCode: "PIN Code",
        AuthorizedRepresentative: "Authorized Representative",
        SecurityQuestion: "Security Question",
        captcha: "CAPTCHA Verification",
        AuthLoginId:"Authorized Representative Login ID is required"
    };

    const validate = () => {
        const errors = {};
        Object.keys(REQUIRED_FIELDS).forEach((field) => {
            if (field ==="AuthorizedRepresentative" || field === "SecurityQuestion" || field === "captcha") return;
            if (!formData[field]) errors[field] = "Required";
        });

        if (!selectedAuthData) {
            errors.AuthorizedRepresentative = "Please fetch Authorized Representative details";
        }

        if (!SecurityQuestionRef.current?.validateSecurity()) errors.SecurityQuestion = "Required";

        if (!CaptchaRef.current?.validate()) errors.captcha = "Please complete CAPTCHA";

        setErrors(errors);

        if (Object.keys(errors).length > 0) {
            const messages = Object.entries(errors)
                .map(([key, value]) => `${REQUIRED_FIELDS[key] || key}: ${value}`)
                .join("<br/>");

            SwalHelper.error("Please fix the following errors:", messages);
            return false;
        }

        return true;
    };

    const otpServiceVerification = OTPService({
        mobileNo: selectedAuthData?.MobileNo,
        purpose: 'InstituteProfileVerification',
        isVerifyRequired: true,
        messege: 'OTP verification required by Authorized Representative of Institute for Institute Profile Verification',
        isDuplicateCheck: false,
        onSuccess: async (data) => {
            await submitRequest();
        },
        onError: (error) => {
            SwalHelper.loading(
                "Verification Failed",
                error.message || "OTP verification failed. Please try again.",
            );
        },
        onCancel: () => {
        }
    });

    const submitRequest = async () => {

        const {
            securityQuestionId: SecurityQuestionId,
            securityAnswer: SecurityAnswer,
            password: Password
        } = SecurityQuestionRef.current.getSecurityDetails();

        const formatDate = (dateStr) => {
            if (!dateStr) return null;

            // Only process dd/MM/yyyy strings
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                const [day, month, year] = dateStr.split("/");
                return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
            }

            const d = new Date(dateStr);
            return isNaN(d) ? null : d.toISOString().split("T")[0];
        };

        // 👈 new: use the stored IP, or fetch it now if it hadn't loaded yet
        let clientIp = ipAddress;
        if (!clientIp) {
            try {
                clientIp = await getDeviceIP();
            } catch {
                clientIp = "";
            }
        }

        // ---- FINAL PAYLOAD ----
        const payload = {
            ...formData,
            RegistrationFor: "2",
            DateOfRegistration: formatDate(formData.DateOfRegistration),
            AuthorizedRepresentative:
            {
                ...selectedAuthData,
                DOB: formatDate(selectedAuthData.DOB),
                Title: getTitleFromGender(selectedAuthData?.Gender),
            },
            SecurityQuestionId,
            SecurityAnswer,
            Password,
            IpAddress: clientIp, // 👈 new
        };
        

        try {
            SwalHelper.loading(
                "Submitting...",
                "Please wait while we process your promotor organisation registration"
            );

            const response = await publicAgent.post(RegisterPromotorOrganisation, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            });

            

            if ((response.data.success || response.status === 200 || response.status === 201) && response.data?.Data?.length==13) {
                SwalHelper.success(
                    "Registration Promotor Organisation Successful!",
                    "Your details have been submitted successfully."
                ).then((result) => {
                    if (result.isConfirmed) {
                        resetForm();
                        navigate("/after-promoting-register", { state: { profileId: response.data.Data } });
                    }
                });
            } else {
                SwalHelper.error(
                    "Submission Error",
                    response?.data?.Data || ""
                )
            }
        } catch (error) {
            SwalHelper.error(
                "Submission Error",
                error.response?.data?.message || "Failed to submit promotor organisation registration. Please try again later.",
            );
        }
    }

    const handleChange = useCallback((value, field) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (checkingRegistrationNumber) return;

        if (!validate()) {
            return;
        }

        const isRegistrationNumberValid = await checkDuplicateRegistrationNumber(
            formData.OrganizatioRegistrationNumber
        );

        if (!isRegistrationNumberValid) {
            SwalHelper.error(
                "Registration Number",
                "This Registration/Incorporation Number already exists. Please correct it and try again."
            );
            return;
        }

        await otpServiceVerification.startVerification();
    };

    return (
        <div className="space-y-6 p-4">
            <fieldset className="rounded-xl bg-white shadow-md border border-gray-200">
                <legend className={`flex items-center gap-2 ${color} px-4 py-2 text-sm font-semibold text-white rounded-md ml-6`}>
                    <FaBuilding className="w-4 h-4" />
                    {t("headings.pageTopRegistration")}
                </legend>

                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                        <FormComponent
                            label={t("labels.applicationFor")}
                            value="Promoting Organization"
                            disabled={true}
                        />
                    </div>
                </div>
            </fieldset>
            <fieldset className="rounded-xl bg-white shadow-md border border-gray-200">
                <legend className={`flex items-center gap-2 ${color} px-4 py-2 text-sm font-semibold text-white rounded-md ml-6`}>
                    <FaBuilding className="w-4 h-4" />
                    {t("headings.promotingOrganizationDetails")}
                </legend>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <DropdownSelectComponent
                            label={t("labels.typeOfPromotingOrg")}
                            name="OrganisationTypeID"
                            options={formatOptions(promotingTypes)}
                            value={formData.OrganisationTypeID || ""}
                            onChange={(value) => handleInputChange("OrganisationTypeID", value)}
                            error={errors.OrganisationTypeID}
                            required
                            loading={loadingPromoterTypes}
                        />
                        <DropdownSelectComponent
                            label={t("labels.promotingOrgStatus")}
                            name="PromoterStatusID"
                            options={formatOptions(promoters)}
                            value={formData.PromoterStatusID || ""}
                            onChange={(value) => handleInputChange("PromoterStatusID", value)}
                            error={errors.PromoterStatusID}
                            required
                            loading={loadingPromoters}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 pl-6 pr-6">
                    <div className="col-span-9">
                        <FormComponent
                            label={t("labels.instituteName")}
                            name="NameOfPromotingOrganization"
                            value={formData.NameOfPromotingOrganization}
                            onChange={(e) => handleInputChange("NameOfPromotingOrganization", e)}
                            required
                            error={errors.NameOfPromotingOrganization}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 pl-6 pr-6">
                    <div>
                        <DateInput label={t("labels.registrationDate")}
                            value={formData.DateOfRegistration}
                            onChange={(val) => handleInputChange('DateOfRegistration', val)}
                            required
                            minDate={new Date(1900, 0, 1)}
                            maxDate={new Date()}
                            error={errors.DateOfRegistration}
                        />
                    </div>
                    <div>
                        <FormComponent
                            label={t("labels.OrganizatioRegistrationNumber")}
                            name="OrganizatioRegistrationNumber"
                            value={formData.OrganizatioRegistrationNumber}
                            onChange={(e) => handleInputChange("OrganizatioRegistrationNumber", e)}
                            onBlur={() =>
                                checkDuplicateRegistrationNumber(formData.OrganizatioRegistrationNumber)
                            }
                            required
                            error={errors.OrganizatioRegistrationNumber}
                            as="textarea"
                            className="resize-none"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-6 pr-6">
                    <div className="md:col-span-3">
                        <FormComponent
                            label={t("labels.address")}
                            name="PromotingOrganizationAddress"
                            value={formData.PromotingOrganizationAddress}
                            onChange={(e) => handleInputChange("PromotingOrganizationAddress", e)}
                            required
                            error={errors.PromotingOrganizationAddress}
                            as="textarea"
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <FormComponent
                            label={t("labels.promotingOrgPin")}
                            value={formData.PinCode}
                            onChange={handlePincodeChange}
                            error={errors.PinCode}
                            required={true}
                            extraClass="font-medium"
                            placeholder="Enter pin code"
                            maxLength="6"
                            type="tel"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-6 pr-6 pb-6">
                    <DropdownSelectComponent
                        label={t("labels.state")}
                        name="StateID"
                        options={formatOptions(states)}
                        value={formData.StateID?.toString()}
                        onChange={v => handleChange(v, "StateID")}
                        error={errors.StateID}
                        required={true}
                    />
                    <DropdownSelectComponent
                        label={t("labels.district")}
                        name="DistrictID"
                        options={formatOptions(districts)}
                        value={formData.DistrictID?.toString()}
                        onChange={v => handleChange(v, "DistrictID")}
                        error={errors.DistrictID}
                        required={true}
                        disabled={!formData.StateID}
                    />
                    <DropdownSelectComponent
                        label={t("labels.taluka")}
                        name="TalukaID"
                        options={formatOptions(talukas)}
                        value={formData.TalukaID?.toString()}
                        onChange={v => handleChange(v, "TalukaID")}
                        error={errors.TalukaID}
                        required={true}
                        disabled={!formData.DistrictID}
                    />
                    <DropdownSelectComponent
                        label={t("labels.city")}
                        name="CityID"
                        options={formatOptions(cities)}
                        value={formData.CityID?.toString()}
                        onChange={handleCityChange}
                        error={errors.CityID}
                        required={true}
                        disabled={!formData.TalukaID}
                    />
                    {showOtherCity && (
                        <FormComponent
                            label={t("labels.otherCity")}
                            name="CityName"
                            value={formData.CityName}
                            onChange={(value) => handleInputChange('CityName', value)}
                            error={errors.CityName}
                            required
                            placeholder="Enter city or village name"
                        />
                    )}

                </div>
            </fieldset>
            <fieldset className="bg-white border rounded-xl shadow">
                <legend className={`${color} text-white px-4 py-2 ml-6 rounded-md flex items-center gap-2 text-sm font-semibold`}>
                    <FaBuilding /> {t("headings.authorizedRepresentativeDetails")}
                </legend>

                <div className="p-6">
                    <div className="flex gap-3 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                        <FileText className="text-yellow-700 mt-1" />
                        <div>
                            <p className="font-semibold text-yellow-800 text-sm">
                                {t("headings.authorizedRepresentative")}
                            </p>
                            <p className="text-sm text-yellow-700">
                                If not registered,
                                <a
                                    href="https://msbsvet.edu.in/Registration/StaffRegistration.aspx"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline text-blue-600"
                                >  click here
                                </a>
                                to register and complete profile.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pl-6 pr-6">
                    {/* Login ID Input */}
                    <div className="flex">
                        <input
                            type="text"
                            maxLength={13}
                            value={formData.AuthLoginId}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase();

                                setFormData(prev => ({
                                    ...prev,
                                    AuthLoginId: value,
                                }));

                                // clear error when user types
                                if (errors.AuthLoginId) {
                                    setErrors(prev => {
                                        const { AuthLoginId, ...rest } = prev;
                                        return rest;
                                    });
                                }
                            }}
                             placeholder="Please Enter Authorized Representative Profile ID"
                            className={`w-full border rounded-md px-3 py-2 text-sm uppercase
                            ${errors.AuthLoginId ? "border-red-500" : "border-gray-300"}
                            focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.AuthLoginId && (
                            <span className="text-sm text-red-500 mt-1">
                                {errors.AuthLoginId}
                            </span>
                        )}
                    </div>

                    {/* Button */}
                    <div className="flex">
                        <button
                            type="button"
                            onClick={() => {
                                if (!formData.AuthLoginId.trim()) {
                                    SwalHelper.warning(
                                        "Required",
                                        "Please enter Authorized Representative LoginID"
                                    );
                                    return;
                                }
                                setPopupOpen(true);
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 whitespace-nowrap w-300 md:w-auto"
                        >
                            Get Authorized Representative Details
                        </button>
                    </div>

                    {/* Note */}
                    <div className="bg-red-50 border-l-4 mb-4 border-red-500 p-3 rounded-md text-sm text-red-800 pl-6 pr-6">
                        <strong>Note:</strong> To edit below populated information, log in to your
                        account and edit profile. OTP shall be sent on Primary Mobile Number to
                        confirm registration.
                    </div>
                </div>
                {selectedAuthData && (
                <div className="border rounded-lg bg-gray-50 p-5 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        
                            <>
                                <DetailItem label={t("labels.title")} value={getTitleFromGender(selectedAuthData?.Gender)} />
                                <DetailItem label={t("labels.firstName")} value={selectedAuthData.FirstName || ""} />
                                <DetailItem label={t("labels.middleName")} value={selectedAuthData.MiddleName || ""} />
                                <DetailItem label={t("labels.lastName")} value={selectedAuthData.LastName || ""} />
                                <DetailItem label={t("labels.gender")} value={selectedAuthData.Gender || ""} />
                                <DetailItem label={t("labels.dob")} value={selectedAuthData.DOB || ""} />
                                <DetailItem label={t("labels.aadhaarNo")} value={selectedAuthData.AadhaarNo || ""} />
                                <DetailItem label={t("labels.mobileNo")} value={selectedAuthData.MobileNo || ""} />
                                <DetailItem label={t("labels.altMobileNo")} value={selectedAuthData.AltMobileNo || ""} />
                                <DetailItem label={t("labels.email")} value={selectedAuthData.EMailID || ""} />
                            </>
                       
                    </div>
                </div>
                 )}
            </fieldset>
            <div className="grid grid-cols-1 md:grid-cols-1">
                <div className="col-md-12 mb-3">
                    <label className="control-label font-medium">
                        {t("headings.createPromoting")}
                        <span className="block text-sm text-gray-600">
                            (User can login to account to complete details and avail services)
                        </span>
                    </label>
                </div>
            </div>
            {/*use of SecurityQuestion component*/}
            <div>
                <SecurityQuestion ref={SecurityQuestionRef}
                    onChange={() =>
                        setErrors(prev => {
                            const { SecurityQuestion, ...rest } = prev;
                            return rest;
                        })
                    } />
            </div>
            <div className="mt-8">
                <CaptchaComponent
                    ref={CaptchaRef}
                    onVerify={handleCaptchaVerify}
                />
                {errors.captcha && (
                    <p className="mt-1 text-sm text-red-500">{errors.captcha}</p>
                )}
            </div>
            <div className="flex justify-center items-center gap-4 mt-6">
                <button
                    type="button"
                    className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm disabled:opacity-60"
                    onClick={handleSubmit}
                    disabled={checkingRegistrationNumber}
                >
                    {registrationMutation.isPending ? t("buttons.pendingSubmitting") : t("buttons.proceed")}
                </button>
                {(
                    <button
                        type="button"
                        className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm"
                        onClick={handleReset}
                    >
                        {t("buttons.reset")}
                    </button>
                )}
            </div>
            <AuthorizedRepresentativePopup
                open={popupOpen}
                applicationId={formData.AuthLoginId}
                onClose={() => setPopupOpen(false)}
                onSelect={(data) => {
                    setSelectedAuthData(data);
                    setErrors(prev => {
                        const { AuthLoginId, AuthorizedRepresentative, ...rest } = prev;
                        return rest;
                    });
                    setPopupOpen(false);
                }}
            />
        </div>
    );
};

export default PromotingOrganizationRegistration;