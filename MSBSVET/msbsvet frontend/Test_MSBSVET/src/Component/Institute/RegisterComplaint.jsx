import React, { useContext, useState, useRef, useEffect } from "react";
import { MdOutlinePersonAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Loader from "../../Component/formcomponent/Loader";
import { SwalHelper } from "../../utils/swalHelper";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { AddressService } from "../../lib/services/addressService";
import agent from "../../lib/api/agent";
import { getDeviceIP } from "../../utils/CommonHelper";
import FormComponent from "../../Component/formcomponent/FormComponent";
import UploadDocument from "../../Component/formcomponent/UploadDocument";
import CaptchaComponent from "../../Component/formcomponent/CaptchaComponent";
import SecurityQuestion from "../../Component/formcomponent/SecurityQuestion";
import OTPService from "../../Component/formcomponent/OTPService";
import { GetMasterTableList } from "../../Endpoints_All/Base/Institute";
import Swal from "sweetalert2";
import verified from "../../assets/VerifiedIcon.jpg";
import { GetUserData } from "../../Endpoints_All/ITISpecification/itiSpecification";
import { RegisterComplaint } from "../../Endpoints_All/Registration/registration";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
// ─── Validation helpers ───────────────────────────────────────────────────────
const EMAIL_REGEX = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const URL_REGEX = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;
const PIN_REGEX = /^\d{6}$/;

// Match your actual "Other" master value — adjust if needed
const OTHER_TYPE_VALUE = "11";
const instituteTypeIsOther = (typeId) =>
    String(typeId).toUpperCase() === OTHER_TYPE_VALUE;

const validateAll = (
    isRegistered,
    itiRegNo,
    complainant,
    isMobileVerified,
    institute,
    complaintDetails,
    place,
    declared,
    documents  // ← added: array from UploadDocument ref
) => {
    const errors = {};

    // ── Section 1: Complainant ───────────────────────────────────────────────
    if (isRegistered === "yes" && !itiRegNo.trim()) {
        errors.itiRegNo = "Please enter ITI Registration Number.";
    }

    if (!complainant.firstName.trim()) {
        errors.firstName = "Please enter First Name.";
    }

    if (!complainant.email.trim()) {
        errors.email = "Please enter Email ID.";
    } else if (!EMAIL_REGEX.test(complainant.email.trim())) {
        errors.email = "Please enter a valid Email ID.";
    }

    if (!complainant.mobile.trim()) {
        errors.mobile = "Please enter Mobile Number.";
    } else if (!MOBILE_REGEX.test(complainant.mobile.trim())) {
        errors.mobile = "Mobile number must be 10 digits and start with 6–9.";
    } else if (!isMobileVerified) {
        errors.mobile = "Please verify your Mobile Number.";
    }

    if (complainant.altMobile.trim() && !MOBILE_REGEX.test(complainant.altMobile.trim())) {
        errors.altMobile = "Alternate mobile must be 10 digits and start with 6–9.";
    }

    if (!complainant.address.trim()) {
        errors.address = "Please enter Address.";
    }

    if (!complainant.pincode.trim()) {
        errors.pincode = "Please enter Pincode.";
    } else if (!PIN_REGEX.test(complainant.pincode.trim())) {
        errors.pincode = "Pincode must be 6 digits.";
    }

    if (!complainant.stateId || complainant.stateId === "-1") {
        errors.stateId = "Please select State.";
    }
    if (!complainant.districtId || complainant.districtId === "-1") {
        errors.districtId = "Please select District.";
    }
    if (!complainant.talukaId || complainant.talukaId === "-1") {
        errors.talukaId = "Please select Taluka.";
    }
    if (!complainant.cityId || complainant.cityId === "-1") {
        errors.cityId = "Please select City.";
    }
    if (complainant.cityId === "9999999" && !complainant.otherCity.trim()) {
        errors.otherCity = "Please enter Other City.";
    }

    // ── Section 2: Institute ─────────────────────────────────────────────────
    if (!institute.name.trim()) {
        errors.instituteName = "Please enter Institute Name.";
    }
    if (!institute.typeId || institute.typeId === "-1") {
        errors.instituteTypeId = "Please select Type of Institute.";
    }
    if (instituteTypeIsOther(institute.typeId) && !institute.otherType.trim()) {
        errors.instituteOtherType = "Please enter Other Type of Institute.";
    }
    if (institute.website.trim() && !URL_REGEX.test(institute.website.trim())) {
        errors.instituteWebsite = "Please enter a valid Website URL.";
    }

    // ── Section 3: Owner ─────────────────────────────────────────────────────
    if (institute.ownerEmail.trim() && !EMAIL_REGEX.test(institute.ownerEmail.trim())) {
        errors.ownerEmail = "Please enter a valid Email ID.";
    }
    if (institute.ownerMobile.trim() && !MOBILE_REGEX.test(institute.ownerMobile.trim())) {
        errors.ownerMobile = "Owner mobile must be 10 digits and start with 6–9.";
    }
    if (!institute.address.trim()) {
        errors.instituteAddress = "Please enter Institute Address.";
    }
    if (!institute.pincode.trim()) {
        errors.institutePincode = "Please enter Institute Pincode.";
    } else if (!PIN_REGEX.test(institute.pincode.trim())) {
        errors.institutePincode = "Institute Pincode must be 6 digits.";
    }
    if (!institute.stateId || institute.stateId === "-1") {
        errors.instituteStateId = "Please select Institute State.";
    }
    if (!institute.districtId || institute.districtId === "-1") {
        errors.instituteDistrictId = "Please select Institute District.";
    }
    if (!institute.talukaId || institute.talukaId === "-1") {
        errors.instituteTalukaId = "Please select Institute Taluka.";
    }
    if (!institute.cityId || institute.cityId === "-1") {
        errors.instituteCityId = "Please select Institute City.";
    }
    if (institute.cityId === "9999999" && !institute.otherCity.trim()) {
        errors.instituteOtherCity = "Please enter Other City for Institute.";
    }

    // ── Section 4: Complaint Details ─────────────────────────────────────────
    if (!complaintDetails.trim()) {
        errors.complaintDetails = "Please enter Details of the Complaint.";
    }

    // ── Documents: at least 1 row with a file uploaded ───────────────────────
    // mirrors: cvIsDocumentUploaded in .aspx — checks first row hdnDocumentPath is not empty
    const hasUploadedDoc =
        Array.isArray(documents) &&
        documents.some((doc) => doc?.file);
    if (!hasUploadedDoc) {
        errors.documents = "Please upload at least one document.";
    }

    // ── Declaration ──────────────────────────────────────────────────────────
    if (!place.trim()) {
        errors.place = "Please enter Place.";
    }
    if (!declared) {
        errors.declared = "Please accept the Declaration.";
    }

    return errors;
};

// ─────────────────────────────────────────────────────────────────────────────

const ComplaintForm = () => {
    const { color } = useContext(ThemeContext);

    const [isRegistered, setIsRegistered] = useState("no");
    const [itiRegNo, setItiRegNo] = useState("");
    const [instituteTypes, setInstituteTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [complainant, setComplainant] = useState({
        firstName: "", middleName: "", lastName: "",
        email: "", mobile: "", altMobile: "",
        address: "", pincode: "",
        stateId: "-1", districtId: "-1", talukaId: "-1", cityId: "-1", otherCity: "",
    });
    const navigate = useNavigate();
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [talukas, setTalukas] = useState([]);
    const [cities, setCities] = useState([]);
    const [districtMaster, setDistrictMaster] = useState([]);
    const [talukaMaster, setTalukaMaster] = useState([]);
    const [cityMaster, setCityMaster] = useState([]);

    const [instituteDistricts, setInstituteDistricts] = useState([]);
    const [instituteTalukas, setInstituteTalukas] = useState([]);
    const [instituteCities, setInstituteCities] = useState([]);

    const [institute, setInstitute] = useState({
        name: "", typeId: "-1", otherType: "", website: "",
        ownerFirstName: "", ownerMiddleName: "", ownerLastName: "",
        ownerEmail: "", ownerMobile: "",
        address: "", pincode: "",
        stateId: "-1", districtId: "-1", talukaId: "-1", cityId: "-1", otherCity: "",
    });

    const [complaintDetails, setComplaintDetails] = useState("");
    const [place, setPlace] = useState("");
    const [declared, setDeclared] = useState(false);
    const today = new Date().toLocaleDateString("en-GB");

    // ── Refs ─────────────────────────────────────────────────────────────────
    const securityQuestionRef = useRef();
    const captchaRef = useRef();        
    const uploadDocumentRef = useRef(); 

    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const pendingActionRef = useRef(null);

    // All validation errors
    const [errors, setErrors] = useState({});

    // ─────────────────────────────────────────────────────────────────────────
    // Load masters
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const loadMasters = async () => {
            try {
                const [statesRes, districtRes, talukaRes, cityRes] = await Promise.all([
                    AddressService.getStates(),
                    AddressService.getDistricts(),
                    AddressService.getTalukas(),
                    AddressService.getCities(),
                ]);

                const instituteTypeRes = await agent.get(
                    `${GetMasterTableList}?TableName=Master_TypeofInstitute&DataValueField=ID&DataTextField=TypefInstitute&HasSelect=true`
                );
                setInstituteTypes(
                    (instituteTypeRes?.data?.Data || []).map((x) => ({ label: x.Text, value: x.Value }))
                );
                setStates(
                    (statesRes?.Data || []).map((x) => ({ label: x.Text, value: x.Value, Group: x.Group }))
                );
                setDistrictMaster(
                    (districtRes?.Data || []).map((x) => ({ label: x.Text, value: x.Value, Group: x.Group }))
                );
                setTalukaMaster(
                    (talukaRes?.Data || []).map((x) => ({ label: x.Text, value: x.Value, Group: x.Group }))
                );
                setCityMaster(
                    (cityRes?.Data || []).map((x) => ({ label: x.Text, value: x.Value, Group: x.Group, Group2: x.Group2 }))
                );
            } catch (err) {
            }
        };
        loadMasters();
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // OTP Service
    // ─────────────────────────────────────────────────────────────────────────
    const otpService = OTPService({
        purpose: "VerifyCandidateMobileNo",
        messege: "Enter the OTP sent to your registered mobile number.",
        onSuccess: () => {
            const action = pendingActionRef.current;
            if (action === "verify") {
                setIsMobileVerified(true);
                setErrors((prev) => ({ ...prev, mobile: undefined }));
                pendingActionRef.current = null;
            } else if (action === "register") {
                pendingActionRef.current = null;
                submitComplaint();
            }
        },
        onError: () => {
            Swal.fire("Error", "OTP verification failed. Please try again.", "error");
            pendingActionRef.current = null;
        },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
    const clearError = (key) =>
        setErrors((prev) => ({ ...prev, [key]: undefined }));

    // ─────────────────────────────────────────────────────────────────────────
    // Complainant cascade handlers
    // ─────────────────────────────────────────────────────────────────────────
    const handleComplainantChange = (field, value) => {
        setComplainant((p) => ({ ...p, [field]: value }));
        clearError(field);
    };

    const handleStateChange = (value) => {
        setComplainant((p) => ({ ...p, stateId: value, districtId: "-1", talukaId: "-1", cityId: "-1" }));
        setDistricts(districtMaster.filter((x) => x.Group === value || x.Group === "-1"));
        setTalukas([]);
        setCities([]);
        ["stateId", "districtId", "talukaId", "cityId"].forEach(clearError);
    };

    const handleDistrictChange = (value) => {
        setComplainant((p) => ({ ...p, districtId: value, talukaId: "-1", cityId: "-1" }));
        setTalukas(talukaMaster.filter((x) => x.Group === value || x.Group === "-1"));
        setCities([]);
        ["districtId", "talukaId", "cityId"].forEach(clearError);
    };

    const handleTalukaChange = (value) => {
        setComplainant((p) => ({ ...p, talukaId: value, cityId: "-1" }));
        setCities(
            cityMaster.filter(
                (x) => String(x.Group) === String(value) || x.Value === "9999999"
            )
        );
        ["talukaId", "cityId"].forEach(clearError);
    };

    const handlePincodeChange = async (pincode) => {
        handleComplainantChange("pincode", pincode);
        if (pincode.length === 6) {
            try {
                const data = await AddressService.getPincodeDetails(pincode);
                if (data?.Data?.Pincode?.length === 6) {
                    const d = data.Data;
                    setDistricts(districtMaster.filter((x) => x.Group === String(d.StateID) || x.Group === "-1"));
                    setTalukas(talukaMaster.filter((x) => x.Group === String(d.DistrictID) || x.Group === "-1"));
                    setCities(
                        cityMaster.filter(
                            (x) =>
                                String(x.Group) === String(d.TalukaID) ||
                                x.Value === "9999999"
                        )
                    );
                    setComplainant((p) => ({
                        ...p, pincode,
                        stateId: String(d.StateID),
                        districtId: String(d.DistrictID),
                        talukaId: String(d.TalukaID),
                        cityId: String(d.CityID),
                    }));
                    ["pincode", "stateId", "districtId", "talukaId", "cityId"].forEach(clearError);
                }
            } catch { /* ignore */ }
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Institute cascade handlers
    // ─────────────────────────────────────────────────────────────────────────
    const handleInstituteChange = (field, value) => {
        setInstitute((p) => ({ ...p, [field]: value }));
        clearError(`institute${field.charAt(0).toUpperCase() + field.slice(1)}`);
        clearError(field);
    };

    const handleInstituteStateChange = (value) => {
        setInstitute((p) => ({ ...p, stateId: value, districtId: "-1", talukaId: "-1", cityId: "-1" }));
        setInstituteDistricts(districtMaster.filter((x) => x.Group === value || x.Group === "-1"));
        setInstituteTalukas([]);
        setInstituteCities([]);
        ["instituteStateId", "instituteDistrictId", "instituteTalukaId", "instituteCityId"].forEach(clearError);
    };

    const handleInstituteDistrictChange = (value) => {
        setInstitute((p) => ({ ...p, districtId: value, talukaId: "-1", cityId: "-1" }));
        setInstituteTalukas(talukaMaster.filter((x) => x.Group === value || x.Group === "-1"));
        setInstituteCities([]);
        ["instituteDistrictId", "instituteTalukaId", "instituteCityId"].forEach(clearError);
    };

    const handleInstituteTalukaChange = (value) => {
        setInstitute((p) => ({ ...p, talukaId: value, cityId: "-1" }));
        setInstituteCities(
            cityMaster.filter(
                (x) => String(x.Group) === String(value) || x.Value === "9999999"
            )
        );
        ["instituteTalukaId", "instituteCityId"].forEach(clearError);
    };

    const handleInstitutePincodeChange = async (pincode) => {
        handleInstituteChange("pincode", pincode);
        if (pincode.length === 6) {
            try {
                const data = await AddressService.getPincodeDetails(pincode);
                if (data?.Data?.Pincode?.length === 6) {
                    const d = data.Data;
                    setInstituteDistricts(districtMaster.filter((x) => x.Group === String(d.StateID) || x.Group === "-1"));
                    setInstituteTalukas(talukaMaster.filter((x) => x.Group === String(d.DistrictID) || x.Group === "-1"));
                    setInstituteCities(
                        cityMaster.filter(
                            (x) =>
                                String(x.Group) === String(d.TalukaID) ||
                                x.Value === "9999999"
                        )
                    );
                    setInstitute((p) => ({
                        ...p, pincode,
                        stateId: String(d.StateID),
                        districtId: String(d.DistrictID),
                        talukaId: String(d.TalukaID),
                        cityId: String(d.CityID),
                    }));
                    ["institutePincode", "instituteStateId", "instituteDistrictId", "instituteTalukaId", "instituteCityId"].forEach(clearError);
                }
            } catch { /* ignore */ }
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Get ITI details
    // ─────────────────────────────────────────────────────────────────────────
    const handleGetDetails = async () => {

        if (!itiRegNo) {
            SwalHelper.warning(
                "Warning",
                "Please enter ITI Registration Number."
            );
            return;
        }

        try {

            setLoading(true);

            SwalHelper.loading(
                "Fetching Details...",
                "Please wait while loading candidate details."
            );

            const res = await agent.get(
                `${GetUserData}?ITIRegistrationNo=${itiRegNo}`
            );

            const data = res?.data?.Data;

            if (!data) {

                setLoading(false);
                SwalHelper.close();

                SwalHelper.warning(
                    "Warning",
                    "No details found."
                );

                return;
            }

            // Load dropdown masters first
            const filteredDistricts = districtMaster.filter(
                (x) =>
                    x.Group === String(data.StateID) ||
                    x.Group === "-1"
            );

            const filteredTalukas = talukaMaster.filter(
                (x) =>
                    x.Group === String(data.DistrictID) ||
                    x.Group === "-1"
            );

            const filteredCities = cityMaster.filter(
                (x) =>
                    x.Group2 === String(data.TalukaID) ||
                    x.Group2 === "-1"
            );

            setDistricts(filteredDistricts);
            setTalukas(filteredTalukas);
            setCities(filteredCities);

            setComplainant((prev) => ({
                ...prev,

                firstName: data.CandidateFirstName || "",
                middleName: data.FatherName || "",
                lastName: data.CandidateLastName || "",

                email: data.Email || "",
                mobile: data.PrimaryMobileNo || "",
                altMobile: data.SecondaryMobileNo || "",

                address: [
                    data.AddressLine1,
                    data.AddressLine2,
                ]
                    .filter(Boolean)
                    .join(" "),

                pincode: data.PinCode || "",

                stateId: String(data.StateID || "-1"),
                districtId: String(data.DistrictID || "-1"),
                talukaId: String(data.TalukaID || "-1"),
                cityId: String(data.CityID || "-1"),
            }));

            setLoading(false);

            SwalHelper.close();

            SwalHelper.success(
                "Success",
                "Details fetched successfully."
            );

        } catch (err) {


            setLoading(false);

            SwalHelper.close();

            SwalHelper.error(
                "Error",
                err?.response?.data?.Message ||
                "Failed to fetch details."
            );
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Verify mobile
    // ─────────────────────────────────────────────────────────────────────────
    const handleVerifyMobile = () => {
        if (!MOBILE_REGEX.test(complainant.mobile)) {
            Swal.fire("Warning", "Please enter a valid 10-digit mobile number.", "warning");
            return;
        }
        pendingActionRef.current = "verify";
        otpService.startVerification(complainant.mobile);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Register — validate ALL, then captcha, then OTP
    // ─────────────────────────────────────────────────────────────────────────
    const handleRegister = () => {
        // 1. Get current documents from UploadDocument ref
        const documents = uploadDocumentRef.current?.getDocuments?.() ?? [];

        // 2. Run all field validations
        const newErrors = validateAll(
            isRegistered, itiRegNo, complainant, isMobileVerified,
            institute, complaintDetails, place, declared,
            documents  // ← pass documents for upload check
        );

        // 3. Security question validation via ref
        const securityValidation = securityQuestionRef.current?.validateSecurity();
        if (!securityValidation?.isValid) {
            newErrors.security = "Please complete security question details correctly.";
        }

        // 4. If field errors exist — show inline + alert first error
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Swal.fire({
                icon: "warning",
                title: "Please fix the following",
                text: Object.values(newErrors)[0],
            });
            return;
        }

        // 5. Validate captcha — CaptchaComponent.validate() returns boolean
        const captchaValid = captchaRef.current?.validate();
        if (!captchaValid) {
            setErrors((prev) => ({ ...prev, captcha: "Please enter valid CAPTCHA." }));
            Swal.fire("Warning", "Please enter valid CAPTCHA.", "warning");
            captchaRef.current?.resetCaptcha();
            return;
        }

        // 6. All valid — trigger OTP for final confirmation (mirrors btnRegister_Click)
        pendingActionRef.current = "register";
        otpService.startVerification(complainant.mobile);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Submit (called after OTP success)
    // ─────────────────────────────────────────────────────────────────────────
    const submitComplaint = async () => {
        const securityDetails = securityQuestionRef.current?.getSecurityDetails();
        const documents = uploadDocumentRef.current?.getDocuments?.() ?? [];
        

        const ip = await getDeviceIP();
        // Build document list for payload — mirrors lstRegisterComplaintDocument
        const lstRegisterComplaintDocument = documents
            .filter((doc) => doc.file)
            .map((doc, i) => ({
                DocumentID: 0,
                DocumentName:
                    doc.name?.toUpperCase() ||
                    `DOCUMENT ${i + 1}`,

                DocumentPath:
                    doc.file?.name || "",
            }));
        try {
            const payload = {
                isMSBSVETPortal: isRegistered === "yes" ? 1 : 0,
                msbsvetRegistrationNumber: itiRegNo || "",
                firstName: (complainant.firstName || "").toUpperCase(),
                middleName: (complainant.middleName || "").toUpperCase(),
                lastName: (complainant.lastName || "").toUpperCase(),
                mobileNo: complainant.mobile || "",
                altMobileNo: complainant.altMobile || "",
                eMailID: complainant.email || "",
                address: (complainant.address || "").toUpperCase(),
                pincode: complainant.pincode || "",
                stateID: parseInt(complainant.stateId || 0),
                state: states.find((x) => x.value === complainant.stateId)?.label || "",
                districtID: parseInt(complainant.districtId || 0),
                district: districts.find((x) => x.value === complainant.districtId)?.label || "",
                talukaID: parseInt(complainant.talukaId || 0),
                taluka: talukas.find((x) => x.value === complainant.talukaId)?.label || "",
                cityID: parseInt(complainant.cityId || 0),
                cityName: complainant.cityId === "9999999"
                    ? (complainant.otherCity || "").toUpperCase() : "",
                nameofInstitute: (institute.name || "").toUpperCase(),
                typeofInstituteID: parseInt(institute.typeId || 0),
                typeofInstituteName: instituteTypeIsOther(institute.typeId)
                    ? (institute.otherType || "").toUpperCase() : "",
                nameofPersonwhoownsInstituteFirstName: (institute.ownerFirstName || "").toUpperCase(),
                nameofPersonwhoownsInstituteMiddleName: (institute.ownerMiddleName || "").toUpperCase(),
                nameofPersonwhoownsInstituteLastName: (institute.ownerLastName || "").toUpperCase(),
                nameofPersonwhoownsInstituteMobileNo: institute.ownerMobile || "",
                nameofPersonwhoownsInstituteWebSite: institute.website || "",
                nameofPersonwhoownsInstituteEMailID: institute.ownerEmail || "",
                nameofPersonwhoownsInstituteAddress: (institute.address || "").toUpperCase(),
                nameofPersonwhoownsInstitutePincode: institute.pincode || "",
                nameofPersonwhoownsInstituteStateID: parseInt(institute.stateId || 0),
                nameofPersonwhoownsInstituteState: states.find((x) => x.value === institute.stateId)?.label || "",
                nameofPersonwhoownsInstituteDistrictID: parseInt(institute.districtId || 0),
                nameofPersonwhoownsInstituteDistrict: instituteDistricts.find((x) => x.value === institute.districtId)?.label || "",
                nameofPersonwhoownsInstituteTalukaID: parseInt(institute.talukaId || 0),
                nameofPersonwhoownsInstituteTaluka: instituteTalukas.find((x) => x.value === institute.talukaId)?.label || "",
                nameofPersonwhoownsInstituteCityID: parseInt(institute.cityId || 0),
                nameofPersonwhoownsInstituteCityName: institute.cityId === "9999999"
                    ? (institute.otherCity || "").toUpperCase() : "",
                securityQuestionID: securityDetails?.securityQuestionId || 0,
                securityQuestionAnswer: (securityDetails?.securityAnswer || "").toUpperCase(),
                password: securityDetails?.password || "",
                userLoginID: "Guest",
                ipAddress: ip || "",
                pageCode: "REGISTER_COMPLAINT",
                isAdmissionDataFetch: isRegistered === "yes" ? 1 : 0,
                registerComplaintDate: new Date().toISOString(),
                detailsofthecomplaint: complaintDetails || "",
                declaration: declared ? "YES" : "NO",
                place: (place || "").toUpperCase(),
                complaintNo: "",
                complaintDate: "",
                lstRegisterComplaintDocument,  // ← document list now included
            };

            const res = await agent.post(RegisterComplaint, payload);
            const responseData = res?.data?.Data || res?.data;

            // Reset captcha after successful submission
            captchaRef.current?.resetCaptcha();
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Complaint Registered Successfully.",
            }).then(() => {

                navigate("/after-register", {
                    state: {
                        profileId:
                            typeof responseData === "string"
                                ? responseData
                                : responseData?.ComplaintNo ||
                                responseData?.ProfileID ||
                                ""
                    }
                });

            });
        } catch (err) {
            // Reset captcha on failure too
            captchaRef.current?.resetCaptcha();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.response?.data?.Message || err?.message || "Failed to register complaint.",
            });
        }
    };

    const sectionHeader = (text) => (
        <h2 className={`mb-5 rounded-md ${color} px-4 py-2 text-lg font-semibold text-white`}>
            {text}
        </h2>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (

          <>
            {loading && <Loader />}
        <div className="col-md-12 p-4">
            <fieldset className="w-full rounded-2xl border border-gray-300 bg-white p-6 shadow-lg">

                <legend className={`flex items-center space-x-2 rounded-md border border-gray-400 ${color} px-4 py-1 font-medium text-white`}>
                    <MdOutlinePersonAdd size={24} />
                    <span>Register Complaint</span>
                </legend>

                <div className="mb-8 text-center border-b border-gray-300 pb-6">

                    <h1 className="mx-auto max-w-6xl text-xl font-bold leading-relaxed text-gray-800">
                        Maharashtra Unauthorized Institutions and Unauthorized Courses of Study
                        in Agriculture, Animal and Fishery Sciences, Health Sciences,
                        Higher, Technical and Vocational Education
                        (Complaints, Appeals and Remedial Measures) Rules, 2024
                    </h1>

                    <h2 className="mt-5 text-xl font-semibold text-gray-700">
                        FORM A
                    </h2>

                    <p className="mt-1 text-lg text-gray-600">
                        (see rule 3)
                    </p>

                    <p className="mt-5 text-xl font-medium text-gray-800">
                        Complaint to be presented before the Competent Authority
                    </p>
                </div>

                {/* AUTHORITY */}
                <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="font-medium">Before the Competent Authority</p>
                    <div className="mt-2 space-y-1 pl-4 text-gray-700">
                        <div className="space-y-3 text-lg leading-relaxed">
                            <p>To,</p>

                            <p>The Director,</p>

                            <p>
                                Directorate of Vocational Education and Training,
                            </p>

                            <p>
                                3, Mahapalika Marg, Post Box No. 10036,
                            </p>

                            <p>
                                Mumbai 400001
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 1: COMPLAINANT ───────────────────────────────────────── */}
                <div className="mb-8 rounded-xl border border-gray-200 p-5">
                    {sectionHeader("1. Particulars of the Complainant")}

                    {/* ITI Registered? */}
                    <div className="mb-6">
                        <label className="mb-2 block font-medium text-gray-700">
                            Are you Registered User (Candidate/ Staff/ Management) on MSBSVET Portal https://msbsvet.edu.in) 
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-6">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input type="radio" checked={isRegistered === "yes"} onChange={() => setIsRegistered("yes")} />
                                Yes
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                                <input type="radio" checked={isRegistered === "no"} onChange={() => setIsRegistered("no")} />
                                No
                            </label>
                        </div>
                    </div>

                    {/* ITI Registration No */}
                    {isRegistered === "yes" && (
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <FormComponent
                                    label="ITI Registration Number"
                                    value={itiRegNo}
                                    onChange={(v) => { setItiRegNo(v); clearError("itiRegNo"); }}
                                    required
                                    autoUpperCase
                                    error={errors.itiRegNo}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleGetDetails}
                                className={`mb-2 rounded-md px-5 py-2 text-white ${color}`}
                            >
                                Get Details
                            </button>
                        </div>
                    )}

                    {/* Name */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormComponent
                            label="First Name" value={complainant.firstName} required autoUpperCase
                            onChange={(v) => handleComplainantChange("firstName", v)}
                            error={errors.firstName}
                        />
                        <FormComponent
                            label="Middle Name" value={complainant.middleName} autoUpperCase
                            onChange={(v) => handleComplainantChange("middleName", v)}
                        />
                        <FormComponent
                            label="Last Name" value={complainant.lastName} autoUpperCase
                            onChange={(v) => handleComplainantChange("lastName", v)}
                        />
                    </div>

                    {/* Contact */}
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormComponent
                            label="Email ID" type="email" value={complainant.email} required
                            onChange={(v) => handleComplainantChange("email", v)}
                            error={errors.email}
                        />

                        {/* Mobile with inline Verify button */}
                        <div className="mb-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="rounded border border-gray-300 bg-gray-100 px-2 py-2 text-sm text-gray-600">
                                    +91
                                </span>
                                <input
                                    type="text"
                                    maxLength={10}
                                    value={complainant.mobile}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, "");
                                        handleComplainantChange("mobile", v);
                                        if (isMobileVerified) setIsMobileVerified(false);
                                    }}
                                    className={`flex-1 rounded border px-3 py-2 text-sm focus:outline-none ${errors.mobile
                                            ? "border-red-500 focus:ring-1 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                                        }`}
                                    disabled={isMobileVerified}
                                />
                                {isMobileVerified ? (
                                    <img src={verified} alt="Verified" className="h-8 w-8" title="Mobile Verified" />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleVerifyMobile}
                                        className="whitespace-nowrap rounded bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600"
                                    >
                                        Verify
                                    </button>
                                )}
                            </div>
                            {errors.mobile && (
                                <span className="mt-1 block text-sm text-red-500">{errors.mobile}</span>
                            )}
                        </div>

                        <FormComponent
                            label="Alternate Mobile Number" value={complainant.altMobile}
                            onChange={(v) => handleComplainantChange("altMobile", v)}
                            error={errors.altMobile}
                        />
                    </div>

                    {/* Address */}
                    <div className="mt-4">
                        <FormComponent
                            label="Address" value={complainant.address} required autoUpperCase
                            onChange={(v) => handleComplainantChange("address", v)}
                            error={errors.address}
                        />
                    </div>

                    {/* Location */}
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <FormComponent
                            label="Pincode" value={complainant.pincode} required
                            onChange={handlePincodeChange}
                            error={errors.pincode}
                        />
                            <DropdownComponent
                                label="State"
                                options={states}
                                value={complainant.stateId}
                                required
                                onChange={handleStateChange}
                                error={errors.stateId}
                            />
                            <DropdownComponent
                                label="District"
                                options={districts}
                                value={complainant.districtId}
                                required
                                onChange={handleDistrictChange}
                                error={errors.districtId}
                            />
                            <DropdownComponent
                                label="Taluka"
                                options={talukas}
                                value={complainant.talukaId}
                                required
                                onChange={handleTalukaChange}
                                error={errors.talukaId}
                            />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <DropdownComponent
                                label="City"
                                options={cities}
                                value={complainant.cityId}
                                required
                                onChange={(v) => handleComplainantChange("cityId", v)}
                                error={errors.cityId}
                            />
                            {complainant.cityId === "9999999" && (
                            <FormComponent
                                label="Other City" value={complainant.otherCity} autoUpperCase
                                onChange={(v) => handleComplainantChange("otherCity", v)}
                                error={errors.otherCity}
                            />
                        )}
                    </div>
                </div>

                {/* ── SECTION 2: INSTITUTE ────────────────────────────────────────── */}
                <div className="mb-8 rounded-xl border border-gray-200 p-5">
                    {sectionHeader("2. Particulars of the Institution")}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormComponent
                            label="Institute Name" value={institute.name} required autoUpperCase
                            onChange={(v) => handleInstituteChange("name", v)}
                            error={errors.instituteName}
                        />
                            <DropdownComponent
                                label="Type of Institute"
                                options={instituteTypes}
                                value={institute.typeId}
                                required
                                onChange={(v) => handleInstituteChange("typeId", v)}
                                error={errors.instituteTypeId}
                            />
                    </div>

                    {instituteTypeIsOther(institute.typeId) && (
                        <div className="mt-4">
                            <FormComponent
                                label="Other Type of Institute" value={institute.otherType} autoUpperCase
                                onChange={(v) => handleInstituteChange("otherType", v)}
                                error={errors.instituteOtherType}
                            />
                        </div>
                    )}

                    <div className="mt-4">
                        <FormComponent
                            label="Institute Website" value={institute.website}
                            onChange={(v) => handleInstituteChange("website", v)}
                            error={errors.instituteWebsite}
                        />
                    </div>
                </div>

                {/* ── SECTION 3: OWNER ────────────────────────────────────────────── */}
                <div className="mb-8 rounded-xl border border-gray-200 p-5">
                    {sectionHeader("3. Name of Person who owns / runs Institute")}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormComponent label="First Name" value={institute.ownerFirstName} autoUpperCase onChange={(v) => handleInstituteChange("ownerFirstName", v)} />
                        <FormComponent label="Middle Name" value={institute.ownerMiddleName} autoUpperCase onChange={(v) => handleInstituteChange("ownerMiddleName", v)} />
                        <FormComponent label="Last Name" value={institute.ownerLastName} autoUpperCase onChange={(v) => handleInstituteChange("ownerLastName", v)} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormComponent
                            label="Email ID" type="email" value={institute.ownerEmail}
                            onChange={(v) => handleInstituteChange("ownerEmail", v)}
                            error={errors.ownerEmail}
                        />
                        <FormComponent
                            label="Mobile Number" value={institute.ownerMobile}
                            onChange={(v) => handleInstituteChange("ownerMobile", v)}
                            error={errors.ownerMobile}
                        />
                    </div>

                    <div className="mt-4">
                        <FormComponent
                            label="Address" value={institute.address} required autoUpperCase
                            onChange={(v) => handleInstituteChange("address", v)}
                            error={errors.instituteAddress}
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <FormComponent
                            label="Pincode" value={institute.pincode} required
                            onChange={handleInstitutePincodeChange}
                            error={errors.institutePincode}
                        />
                            <DropdownComponent
                                label="State"
                                options={states}
                                value={institute.stateId}
                                required
                                onChange={handleInstituteStateChange}
                                error={errors.instituteStateId}
                            />
                            <DropdownComponent
                                label="District"
                                options={instituteDistricts}
                                value={institute.districtId}
                                required
                                onChange={handleInstituteDistrictChange}
                                error={errors.instituteDistrictId}
                            />
                            <DropdownComponent
                                label="Taluka"
                                options={instituteTalukas}
                                value={institute.talukaId}
                                required
                                onChange={handleInstituteTalukaChange}
                                error={errors.instituteTalukaId}
                            />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <DropdownComponent
                                label="City"
                                options={instituteCities}
                                value={institute.cityId}
                                required
                                onChange={(v) => handleInstituteChange("cityId", v)}
                                error={errors.instituteCityId}
                            />
                            {institute.cityId === "9999999" && (
                            <FormComponent
                                label="Other City" value={institute.otherCity} autoUpperCase
                                onChange={(v) => handleInstituteChange("otherCity", v)}
                                error={errors.instituteOtherCity}
                            />
                        )}
                    </div>
                </div>

                {/* ── SECTION 4: COMPLAINT DETAILS ─────────────────────────────────── */}
                <div className="mb-8 rounded-xl border border-gray-200 p-5">
                    {sectionHeader("4. Details of the Complaint")}
                    <textarea
                        rows={6}
                        maxLength={500}
                        value={complaintDetails}
                        onChange={(e) => {
                            setComplaintDetails(e.target.value);
                            clearError("complaintDetails");
                        }}
                        className={`w-full rounded-md border p-3 text-sm focus:outline-none ${errors.complaintDetails
                                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                                : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                            }`}
                        placeholder="Enter complaint details (max 500 characters)"
                    />
                    <div className="mt-1 flex items-center justify-between">
                        {errors.complaintDetails
                            ? <span className="text-sm text-red-500">{errors.complaintDetails}</span>
                            : <span />
                        }
                        <span className="text-xs text-gray-400">{complaintDetails.length}/500</span>
                    </div>
                </div>

                {/* ── DOCUMENTS ─────────────────────────────────────────────────────── */}
                <div className="mb-8 rounded-xl border border-gray-200 p-5">
                    {/*
                        IMPORTANT: UploadDocument needs to expose getDocuments() via forwardRef + useImperativeHandle.
                        Add this to UploadDocument.jsx:
                            useImperativeHandle(ref, () => ({
                                getDocuments: () => documents,
                            }));
                        And change: const UploadDocument = ({ allowedTypes, maxSize }) => {
                        To:        const UploadDocument = forwardRef(({ allowedTypes, maxSize }, ref) => {
                    */}
                    <UploadDocument
                        ref={uploadDocumentRef}
                        allowedTypes={["image/jpeg", "image/jpg", "image/png", "application/pdf"]}
                        maxSize={5 * 1024 * 1024}
                    />
                    {errors.documents && (
                        <p className="mt-2 text-sm text-red-500">{errors.documents}</p>
                    )}
                </div>

                {/* ── SECTION 5: ACCOUNT ──────────────────────────────────────────── */}
                <div className="mb-8 rounded-xl border border-gray-200 p-5">
                    {sectionHeader("5. Create Complaint Account")}
                    <SecurityQuestion ref={securityQuestionRef} />
                    {errors.security && (
                        <p className="mt-2 text-sm text-red-500">{errors.security}</p>
                    )}
                </div>

                {/* ── DECLARATION ────────────────────────────────────────────────── */}
                <div className="mb-8 rounded-xl border border-gray-200 p-5">
                    {sectionHeader("Declaration")}

                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            className="mt-1"
                            checked={declared}
                            onChange={(e) => {
                                setDeclared(e.target.checked);
                                clearError("declared");
                            }}
                        />
                        <span className="text-sm text-gray-700">
                            I{" "}
                            <strong>
                                {complainant.firstName} {complainant.middleName} {complainant.lastName}
                            </strong>
                            , the complainant do hereby verify and state that the contents of this
                            complaint are true to the best of my knowledge and belief. I hereby declare
                            that I have not filed any complaint on the same subject matter before any
                            other Competent Authority or Court.{" "}
                            <span className="text-red-500">*</span>
                        </span>
                    </label>
                    {errors.declared && (
                        <p className="mt-1 text-sm text-red-500">{errors.declared}</p>
                    )}

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormComponent
                            label="Place" value={place} required autoUpperCase
                            onChange={(v) => { setPlace(v); clearError("place"); }}
                            error={errors.place}
                        />
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                            <div className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                {today}
                            </div>
                        </div>
                    </div>

                    {/* Captcha with ref — validate() called in handleRegister */}
                    <div className="mt-6">
                        <CaptchaComponent ref={captchaRef} />
                        {errors.captcha && (
                            <p className="mt-1 text-sm text-red-500">{errors.captcha}</p>
                        )}
                    </div>
                </div>

                {/* ── SUBMIT ──────────────────────────────────────────────────────── */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleRegister}
                        className={`${color} rounded-lg px-8 py-3 text-lg font-semibold text-white shadow-md`}
                    >
                        Register Complaint
                    </button>
                </div>

            </fieldset>
            </div>
        </>
    );
};

export default ComplaintForm;