import { useContext, useState, useCallback, useEffect } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FormComponent from "../../formcomponent/FormComponent";
import UploadPdf from "../../formcomponent/UploadPdf";
import { FaBuilding } from "react-icons/fa";
import { useAuth } from "../../../Hooks/AuthContext";
import Swal from "sweetalert2";
import { useLoading } from "../../../Hooks/useLoading";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../../base/Button";
import {
    GetInstituteIDByInstituteCode,
    GetPromotingOrganisationIDByInstituteID,
    GetPromotingOrganisationDetails,
    GetPromotingOrganisationIDByTempInstituteID
} from "../../../Endpoints_All/Base/Institute";
import agent from "../../../lib/api/agent";
import { useFormMode } from "../../../lib/hooks/useFormMode";
import {
    useStates,
    useDistricts,
    useTalukas,
    useCities,
    usePincodeLookup,
} from "../../../lib/hooks/useAddressQueries";
import { SwalHelper } from "../../../utils/swalHelper";
import { useCascadingAddress } from "../../../lib/hooks/useCascadingAddress";
import { formatOptions, getDeviceIP } from "../../../utils/CommonHelper";
import RedirectToOld from "../../formcomponent/RedirectToOld";

const initialFormState = {
    ProfileID: "",
    TypeOfPromotingOrganization: "",
    GovernmentPrivateStatus: "",
    NameOfPromotingOrganization: "",
    DateOfRegistration: "",
    RegistrationNumber: "",
    RegistrationCertificate: "",
    PromotingOrganizationAddress: "",
    StateID: "",
    DistrictID: "",
    TalukaID: "",
    CityID: "",
    CityName: "",
    PinCode: "",
    PhoneCountryCode: "+91",
    Phone: "",
    Email: "",
    Website: "",
    PAN: "",
    PANCard: "",
    PromotingOrganisationTypeName: "",
    PromoterStatus: ""
};

const PromotingOrganization = () => {

    const { color } = useContext(ThemeContext);
    const { t } = useTranslation("promotorOrgRegistration");
    const { userInfo } = useAuth();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [showOtherCity, setShowOtherCity] = useState(false);
    const [isAutoFillingAddress, setIsAutoFillingAddress] = useState(false);
    const [showVerificationUI, setShowVerificationUI] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [existingStatus, setExistingStatus] = useState('');
    const [existingRemark, setExistingRemark] = useState('');
    const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

    const [verificationStatus, setVerificationStatus] = useState('');
    const [verificationRemark, setVerificationRemark] = useState('');
    const [instituteId, setInstituteId] = useState(null);
     const [ipAddress, setIpAddress] = useState("0.0.0.0");



    const userType = Number(userInfo?.UserTypeID);
    const isSecretary = userType === 81;
    const {
        fieldsDisabled,
    } = useFormMode(userInfo.UserTypeID);


    useCascadingAddress(formData, setFormData, isAutoFillingAddress);
    // Dropdown data
    const { data: states, loading: stateLoading } = useStates();
    const { data: districts, loading: districtsLoading } = useDistricts(formData.StateID);
    const { data: talukas, loading: talukaLoading } = useTalukas(formData.DistrictID);
    const { data: cities, loading: cityLoading } = useCities(formData.TalukaID);
    const { getPincode } = usePincodeLookup();

    // File/PDF paths
    const [regCertFileData, setRegCertFileData] = useState({});
    const [panCardFileData, setPanCardFileData] = useState({});

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

    const handleChange = useCallback((value, field) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    useEffect(() => {
        fetchPromotingOrganizationData();
        fetchIP();
        
        // eslint-disable-next-line
    }, []);
    // Add this useEffect to fetch verification status for secretary
    useEffect(() => {
        const fetchSecretaryVerificationStatus = async () => {
            if (userInfo?.UserTypeID === 81 && instituteId) {
                try {
                    const statusResponse = await agent.get(`/api/InstituteBase/GetProposedInstituteStatus/${instituteId}`);

                    if (statusResponse.data?.Data) {
                        const statusData = statusResponse.data.Data;
                        const orgStatus = statusData.IsPromotingOrganization;
                        const orgRemark = statusData.PromotingOrganizationRemark;

                        setExistingStatus(orgStatus);
                        setExistingRemark(orgRemark);

                        if (orgStatus === "R") {
                            setApprovalStatus("R");
                            setRejectReason("Promoting Organization is not verified. Complete Promoting Organization Profile, Request for Verification and complete verification process.");
                            setIsAlreadyVerified(false);
                        } else {
                            setApprovalStatus("V");
                            setRejectReason("ALREADY VERIFIED");
                            setIsAlreadyVerified(true);
                        }
                    }
                } catch (error) {

                    setApprovalStatus("R");
                    setRejectReason("Promoting Organization is not verified. Complete Promoting Organization Profile, Request for Verification and complete verification process.");
                    setIsAlreadyVerified(false);
                }
            }
        };

        fetchSecretaryVerificationStatus();
    }, [userInfo?.UserTypeID, instituteId]);

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
        };

    const fetchPromotingOrganizationData = async () => {
        startLoading();
        try {
            let instituteId = 0;

            if (userInfo?.UserTypeID === 81) {
                // SECRETARY FLOW
                const urlParams = new URLSearchParams(window.location.search);
                const P1 = urlParams.get("P1");
                const P2 = urlParams.get("P2");


                if (P1 && P2 && String(P1).getHashCode?.().toString() === P2) {
                    instituteId = P1;
                } else if (P1) {
                    instituteId = P1;
                }
            } else {
                // INSTITUTE FLOW
                const resinstitute = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo?.UserLoginID}`
                );
                instituteId = resinstitute?.data?.Data;
            }


            if (!instituteId) {
                return;
            }

            setInstituteId(instituteId);
            if (userInfo?.UserTypeID !== 81 && instituteId) {
                try {
                    const statusResponse = await agent.get(
                        `/api/InstituteBase/GetProposedInstituteStatus/${instituteId}`
                    );

                    const statusData = statusResponse.data?.Data;

                    if (statusData) {
                        const orgStatus = statusData.IsPromotingOrganization;
                        const orgRemark = statusData.PromotingOrganizationRemark;

                        setVerificationStatus(orgStatus);

                        if (orgStatus === "V") {
                            setVerificationRemark("ALREADY VERIFIED");
                        } else {
                            setVerificationRemark(orgRemark);
                        }
                    }

                } catch (error) {
                }
            }

            const resorganisation = await agent.get(
                `${GetPromotingOrganisationIDByInstituteID}/${instituteId}`
            );

            const PromotingOrganisationID = resorganisation?.data?.Data;


            if (userInfo.UserTypeID !== 61 && (!PromotingOrganisationID || PromotingOrganisationID === 0)) {
                const result = await Swal.fire({
                    icon: "info",
                    title: "Not Mapped",
                    html: `
                        <div class="text-left">
                            <p class="mb-2">Promoting Organization is not mapped.</p>
                        </div>
                    `,
                    confirmButtonText: "OK",
                    customClass: {
                        confirmButton: "bg-[#00c3f9] hover:bg-[#00a8d6] text-white rounded px-6 py-2"
                    },
                    buttonsStyling: false
                });

                if (result.isConfirmed) {
                    window.history.back();
                }
                return;
            }

            const payload = {
                ItemId: 0,
                InstituteId: PromotingOrganisationID,
                UserLoginID: userInfo?.UserLoginID,
                PageCode: "ExistingInstitute",
                IPAddress: ipAddress
            };

            const response = await agent.post(GetPromotingOrganisationDetails, payload);
            const data = response?.data;


            if (data && data.Status === "Success" && data.Data) {
                setEditMode(true);
                const orgData = data.Data;


                setFormData({
                    ProfileID: orgData.ApplicationID || "",
                    TypeOfPromotingOrganization: orgData.PromotingOrganisationTypeName || "",
                    GovernmentPrivateStatus: orgData.PromoterStatus || "",
                    NameOfPromotingOrganization: orgData.NameOfPromotingOrganization || "",
                    DateOfRegistration: orgData.PromotingOrganizationRegistrationDate,
                    RegistrationNumber: orgData.OrganizatioRegistrationNumber || "",
                    RegistrationCertificate: orgData.RegistrationCertificatePath || "",
                    PromotingOrganizationAddress: orgData.PromotingOrganizationAddress || "",
                    StateID: orgData.PromotingOrganizationStateID,
                    DistrictID: orgData.PromotingOrganizationDistrictID,
                    TalukaID: orgData.PromotingOrganizationTalukaID,
                    CityID: orgData.PromotingOrganizationCityID,
                    PinCode: orgData.PromotingOrganizationPincode,
                    PhoneCountryCode: "+91",
                    Phone: orgData.AuthorizedRepresentativeMobileNo,
                    Email: orgData.AuthorizedRepresentativeEMailID,
                    Website: orgData.Website || "",
                    PAN: orgData.PAN,
                    PANCard: orgData.PANPath,
                    PromotingOrganisationTypeName: orgData.PromotingOrganisationTypeName || "",
                    PromoterStatus: orgData.PromoterStatus || ""
                });

                setRegCertFileData({
                    fileName: orgData.RegistrationCertificateFileName,
                    uniqueFileName: orgData.RegistrationCertificatePath
                });

                setPanCardFileData({
                    fileName: orgData.PANCardFileName,
                    uniqueFileName: orgData.PANPath
                });
            }

            if (userInfo?.UserTypeID === 81) {
                setShowVerificationUI(true);

                try {
                    const statusResponse = await agent.get(`/api/InstituteBase/GetProposedInstituteStatus/${instituteId}`);

                    if (statusResponse.data?.Data) {
                        const statusData = statusResponse.data.Data;
                        const orgStatus = statusData.IsPromotingOrganization;
                        const orgRemark = statusData.PromotingOrganizationRemark;

                        setExistingStatus(orgStatus);
                        setExistingRemark(orgRemark);

                        if (orgStatus === "R") {
                            setApprovalStatus("R");
                            setRejectReason("Promoting Organization is not verified. Complete Promoting Organization Profile, Request for Verification and complete verification process.");
                            setIsAlreadyVerified(false);
                        } else {
                            setApprovalStatus("V");
                            setRejectReason("ALREADY VERIFIED");
                            setIsAlreadyVerified(true);
                        }
                    }
                } catch (error) {
                    setApprovalStatus("R");
                    setRejectReason("Promoting Organization is not verified. Complete Promoting Organization Profile, Request for Verification and complete verification process.");
                    setIsAlreadyVerified(false);
                }
            }

        } catch (error) {
            Swal.fire("Error", "Failed to fetch organization info", "error");
        } finally {
            stopLoading();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    };

    const handleclose = async () => {

        const userTypeId = Number(userInfo?.UserTypeID);

        if (userTypeId === 61) {
            navigate("/institute/dashboard");
            return;
        }

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

            if (userTypeId === 64) {
                navigate("/tinstitute/dashboard");
                return;
            }

            const hash = String(instituteId).getHashCode();
            navigate(`/InstituteDash?P1=${instituteId}&P2=${hash}`);
        }
    };

    const handleInputChange = (name, value) => {
        setFormData(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: "" }));
    };

    const handlePhoneChange = (e) => {
        const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
        setFormData((prev) => ({ ...prev, Phone: onlyDigits }));
        setErrors((prev) => ({ ...prev, Phone: "" }));
    };

    const handleDropdownChange = async (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleRegCertFile = (fileData) => {
        setRegCertFileData(fileData);
        setFormData((prev) => ({
            ...prev,
            RegistrationCertificate: fileData?.uniqueFileName || ""
        }));
        setErrors((prev) => ({ ...prev, RegistrationCertificate: "" }));
    };

    const handlePanCardFile = (fileData) => {
        setPanCardFileData(fileData);
        setFormData((prev) => ({
            ...prev,
            PANCard: fileData?.uniqueFileName || ""
        }));
        setErrors((prev) => ({ ...prev, PANCard: "" }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.TypeOfPromotingOrganization)
            newErrors.TypeOfPromotingOrganization = "Type is required";
        if (!formData.GovernmentPrivateStatus)
            newErrors.GovernmentPrivateStatus = "Status required";
        if (!formData.NameOfPromotingOrganization)
            newErrors.NameOfPromotingOrganization = "Name required";
        if (!formData.DateOfRegistration)
            newErrors.DateOfRegistration = "Date required";
        if (!formData.RegistrationNumber)
            newErrors.RegistrationNumber = "Registration No. required";
        if (!formData.RegistrationCertificate)
            newErrors.RegistrationCertificate = "Upload certificate";
        if (!formData.PromotingOrganizationAddress)
            newErrors.PromotingOrganizationAddress = "Address required";
        if (!formData.StateID)
            newErrors.StateID = "State required";
        if (!formData.DistrictID)
            newErrors.DistrictID = "District required";
        if (!formData.TalukaID)
            newErrors.TalukaID = "Taluka required";
        if (!formData.CityID)
            newErrors.CityID = "City/Village required";
        if (!formData.PinCode)
            newErrors.PinCode = "Pin code required";
        else if (!/^[0-9]{6}$/.test(formData.PinCode))
            newErrors.PinCode = "Enter valid 6-digit pin";
        if (!formData.Phone)
            newErrors.Phone = "Phone required";
        else if (!/^[1-9][0-9]{9}$/.test(formData.Phone))
            newErrors.Phone = "Enter 10-digit phone";
        if (!formData.Email)
            newErrors.Email = "E-mail required";
        else if (!/^([a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,6})$/i.test(formData.Email))
            newErrors.Email = "Enter valid e-mail";
        if (!formData.PAN)
            newErrors.PAN = "PAN required";
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.PAN))
            newErrors.PAN = "Enter valid PAN (AAAAA9999A)";
        if (!formData.PANCard)
            newErrors.PANCard = "Upload PAN card";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleBack = () => {
        let id =
            instituteId ||''

        if (userType === 81) {

            if (id) {
                navigate(
                    `/Institute/InstitutePayment?P1=${id}&P2=${String(id).getHashCode()}`
                );
            } else {
                navigate("/Institute/InstitutePayment");
            }
        } else {

            window.history.back();
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }

    const toInputDate = (value) => {
        if (!value) return "";
        return value.split("T")[0];
    };


    const handleSave = async () => {

        if (userInfo?.UserTypeID === 81) {
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

            startLoading();
            try {
                const urlParams = new URLSearchParams(window.location.search);
                let instituteId = urlParams.get("P1");

                if (!instituteId) {
                    instituteId = formData.ProfileID;
                }

                const payload = {
                    instituteID: parseInt(instituteId),
                    remark: rejectReason?.toUpperCase() || "",
                    status: approvalStatus,
                    pageCode: "PromotingOrganization",
                    createdBy: userInfo?.UserLoginID,
                    ipAddress: ipAddress
                };


                const response = await agent.post("/api/InstituteBase/update-verification-status", payload);
                if (response.data?.success) {
                    const hash = String(instituteId).getHashCode();
                    navigate(`/Institute/PromotersDetails?P1=${instituteId}&P2=${hash}`);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: response.data?.message || "Update failed",
                        confirmButtonColor: "#3085d6"
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Something went wrong",
                    confirmButtonColor: "#3085d6"
                });
            } finally {
                stopLoading();
            }
            return;
        }

        if (!validate()) return;

        startLoading();
        try {
            const response = await agent.post(
                "/api/PromotionalOrganisation/SavePromotionalOrganisationDetails",
                {
                    ...formData,
                    InstituteID: userInfo?.InstituteID,
                    UserLoginID: userInfo?.UserLoginID
                }
            );

            if (response?.data?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Saved successfully!",
                    confirmButtonColor: "#3085d6"
                });
                setEditMode(true);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response?.data?.message || "Failed to save",
                    confirmButtonColor: "#3085d6"
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.message || "Failed to save",
                confirmButtonColor: "#3085d6"
            });
        } finally {
            stopLoading();
        }
    };

    return (
        <div className="w-full p-4">
            <fieldset className='mb-4 rounded-md border border-gray-300 p-4 bg-white shadow-sm'>
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    <span>Promoting Organization</span>
                </legend>


                <div className="bg-pink-100 border border-pink-300 text-pink-800 px-3 py-2 rounded text-sm mx-4 mt-3 mb-3">
                    <strong>Note:</strong> To edit below populated information, log in to Promoting Organization account and edit profile.
                </div>

                <form className="w-full px-4 pb-3" autoComplete="off">
                    {/* Row 1: Profile ID and Name */}
                    <div className="grid grid-cols-4 gap-3 mb-3">
                        <div className="col-span-1">
                            <FormComponent
                                label="Profile ID"
                                name="ProfileID"
                                value={formData.ProfileID}
                                disabled
                                readOnly
                            />
                        </div>
                        <div className="col-span-3">
                            <FormComponent
                                label="Name of Promoting Organization"
                                name="NameOfPromotingOrganization"
                                value={formData.NameOfPromotingOrganization}
                                onChange={(e) => handleInputChange("NameOfPromotingOrganization", e)}
                                required
                                error={errors.NameOfPromotingOrganization}
                                disabled={fieldsDisabled}
                            />
                        </div>
                    </div>

                    {/* Row 2: Type and Government Status */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div className="col-span-1">
                            <DropdownComponent
                                label="Type of Promoting Organization"
                                name="TypeOfPromotingOrganization"
                                options={[
                                    {
                                        label: formData.PromotingOrganisationTypeName,
                                        value: formData.PromotingOrganisationTypeName || ""
                                    }
                                ]}
                                value={formData.PromotingOrganisationTypeName || ""}
                                onChange={() => { }}
                                error={errors.TypeOfPromotingOrganization}
                                required
                                loading={false}
                                disabled
                            />
                        </div>
                        <div className="col-span-1">
                            <DropdownComponent
                                label="Government/ Private Status"
                                name="GovernmentPrivateStatus"
                                options={[
                                    {
                                        label: formData.PromoterStatus,
                                        value: formData.PromoterStatus || ""
                                    }
                                ]}
                                value={formData.PromoterStatus || ""}
                                onChange={() => { }}
                                error={errors.GovernmentPrivateStatus}
                                required
                                loading={false}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Row 3: Date, Registration Number, Upload Certificate */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                            <FormComponent
                                type="date"
                                label="Registration/ Incorporation Date"
                                name="DateOfRegistration"
                                value={toInputDate(formData.DateOfRegistration)}
                                onChange={(val) => handleInputChange('DateOfRegistration', val)}
                                required
                                error={errors.DateOfRegistration}
                                disabled={fieldsDisabled}
                            />
                        </div>
                        <div>
                            <FormComponent
                                label="Registration/ Incorporation/ GR. No."
                                name="RegistrationNumber"
                                value={formData.RegistrationNumber}
                                onChange={(val) => handleInputChange('RegistrationNumber', val)}
                                required
                                error={errors.RegistrationNumber}
                                disabled={fieldsDisabled}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Registration/ Incorporation Certificate <span className="text-red-500">*</span>
                            </label>
                            <UploadPdf
                                file={regCertFileData.fileName || ""}
                                onFileChange={handleRegCertFile}
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
                                uniquefilepath={regCertFileData.uniqueFileName || ""}
                                id="uploadRegCert"
                                disabled={true}
                            />
                            {errors.RegistrationCertificate && (
                                <div className="text-xs text-red-500 mt-1">{errors.RegistrationCertificate}</div>
                            )}
                        </div>
                    </div>

                    {/* Row 4: Address and Pin Code */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div className="md:col-span-3">
                            <FormComponent
                                label="Address as mentioned during Registration"
                                name="PromotingOrganizationAddress"
                                value={formData.PromotingOrganizationAddress}
                                onChange={(val) => handleInputChange('PromotingOrganizationAddress', val)}
                                required
                                error={errors.PromotingOrganizationAddress}
                                disabled={fieldsDisabled}
                                as="textarea"
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <FormComponent
                                label="Pin Code"
                                name="PinCode"
                                value={formData.PinCode}
                                onChange={handlePincodeChange}
                                required
                                error={errors.PinCode}
                                disabled={fieldsDisabled}
                                maxLength={6}
                            />
                        </div>
                    </div>

                    {/* Row 5: State, District, Taluka, City/Village - WITH CASCADE */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div>
                            <DropdownComponent
                                label="State"
                                name="StateID"
                                options={formatOptions(states)}
                                value={formData.StateID?.toString()}
                                onChange={(value) => handleChange(value, "StateID")}
                                error={errors.StateID}
                                required={true}
                                loading={stateLoading}
                                disabled={fieldsDisabled}
                            />
                        </div>
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
                                disabled={fieldsDisabled || !formData.StateID}
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
                                disabled={fieldsDisabled || !formData.DistrictID}
                            />
                        </div>
                        <div>
                            <DropdownComponent
                                label="City/ Village"
                                name="CityID"
                                options={formatOptions(cities)}
                                value={formData.CityID?.toString()}
                                onChange={handleCityChange}
                                error={errors.CityID}
                                required={true}
                                loading={cityLoading}
                                disabled={fieldsDisabled || !formData.TalukaID}
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
                    </div>

                    {/* Row 6: Phone, Email, Website */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 items-start">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 h-5">
                                Phone No. <span className="text-red-500">*</span>
                            </label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                                    +91
                                </span>
                                <input
                                    type="text"
                                    name="Phone"
                                    value={formData.Phone}
                                    onChange={handlePhoneChange}
                                    maxLength={10}
                                    inputMode="numeric"
                                    disabled={fieldsDisabled}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            {errors.Phone && (
                                <div className="text-xs text-red-500 mt-1">{errors.Phone}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 h-5">
                                E-Mail ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="Email"
                                value={formData.Email}
                                onChange={(value) => handleInputChange("Email", value)}
                                disabled={fieldsDisabled}
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Email ? "border-red-500" : "border-gray-300"} disabled:bg-gray-100`}
                                placeholder="Enter email"
                            />
                            {errors.Email && (
                                <div className="text-xs text-red-500 mt-1">{errors.Email}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 h-5">
                                Website
                            </label>
                            <input
                                type="url"
                                name="Website"
                                value={formData.Website}
                                onChange={(value) => handleInputChange("Website", value)}
                                disabled={fieldsDisabled}
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Website ? "border-red-500" : "border-gray-300"} disabled:bg-gray-100`}
                                placeholder="https://example.com"
                            />
                            {errors.Website && (
                                <div className="text-xs text-red-500 mt-1">{errors.Website}</div>
                            )}
                        </div>
                    </div>

                    {/* Row 7: PAN and Upload PAN Card */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div className="md:col-span-1">
                            <FormComponent
                                label="Organization PAN No."
                                name="PAN"
                                value={formData.PAN}
                                onChange={(value) => handleInputChange("PAN", value)}
                                required
                                error={errors.PAN}
                                disabled={fieldsDisabled}
                                maxLength={10}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Organization PAN Card <span className="text-red-500">*</span>
                            </label>
                            <UploadPdf
                                file={panCardFileData.fileName || ""}
                                onFileChange={handlePanCardFile}
                                buttonText="Upload"
                                buttonClassName="bg-[#00c3f9] hover:bg-[#00a8d6]"
                                label=""
                                required={true}
                                showLabel={false}
                                allowedFileTypes="pdf"
                                maxFileSize="5 MB"
                                userTypeId={userInfo?.UserTypeID}
                                userLoginID={userInfo?.UserLoginID}
                                linkName="View PAN Card"
                                uniquefilepath={panCardFileData.uniqueFileName || ""}
                                id="uploadPanCard"
                                disabled={true}
                            />
                            {errors.PANCard && (
                                <div className="text-xs text-red-500 mt-1">{errors.PANCard}</div>
                            )}
                        </div>
                    </div>
                    {/* Secretary Verification Section - Only for User Type 81 */}
                    {showVerificationUI && userInfo?.UserTypeID === 81 && (
                        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                            <h3 className="text-md font-normal mb-3">Select Approved Reject Status <span className="text-red-500">*</span></h3>

                            <div className="flex gap-6 mb-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="V"
                                        checked={approvalStatus === 'V'}
                                        onChange={(e) => setApprovalStatus(e.target.value)}
                                        disabled={isAlreadyVerified} // Disable if already verified
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
                                        disabled={isAlreadyVerified} // Disable if already verified
                                        className="form-radio h-4 w-4 text-red-600"
                                    />
                                    <span className="ml-2 text-sm">Rejected</span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-normal mb-2">
                                    Reason for Rejection/ Remark
                                    {approvalStatus === 'R' && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm uppercase"
                                    rows="3"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value.toUpperCase())}
                                    // Remove disabled - always editable
                                    placeholder="Enter remark..."
                                />
                            </div>


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
                                            Reason for Rejection/ Remark : ALREADY VERIFIED
                                        </p>
                                    </div>
                                )}

                            </div>
                        )}

                    <div className="flex justify-center items-center gap-4 mt-6">

                        {/* Back button hide for 61 */}
                        {userInfo?.UserTypeID !== 61 && (
                            <Button variant='primary' onClick={handleBack}>
                                Back
                            </Button>
                        )}

                        {/* UserTypeID 61 Custom UI Buttons */}
                        {userInfo?.UserTypeID === 61 ? (
                            <>
                                <button
                                    type="button"
                                    className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
                                    onClick={handleclose}
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    className="bg-yellow-600 hover:bg-yellow-600 text-white px-6 py-2 rounded font-semibold text-sm"
                                    onClick={() => navigate("/institute/dashboard")}
                                >
                                    Save 
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Save & Next for 81 */}
                                {userInfo?.UserTypeID === 81 && (
                                    <Button
                                        variant='success'
                                        onClick={handleSave}
                                    >
                                        Save & Next
                                    </Button>
                                )}

                                {/* Next button for other users */}
                                {userInfo?.UserTypeID !== 81 && (
                                    <Button
                                        variant='success'
                                        onClick={() => {
                                            const hash = String(instituteId).getHashCode();
                                            navigate(`/Institute/PromotersDetails`);
                                        }}
                                    >
                                        Next
                                    </Button>
                                )}

                                <Button variant='danger' onClick={handleclose}>
                                    Close
                                </Button>
                            </>
                        )}
                    </div>
                </form>

            </fieldset>
        </div>
    );
};

export default PromotingOrganization;



