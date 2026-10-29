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
import { useNavigate, useLocation } from "react-router-dom";
import {
  GetInstituteIDByInstituteCode,
  GetPromotingOrganisationIDByInstituteID,
  GetPromotingOrganisationDetails,
} from "../../../Endpoints_All/Base/Institute";
import { SavePromotionalOrganisationDetailsVerification } from "../../../Endpoints_All/Secretary/PromotingOrganisation";
import agent from "../../../lib/api/agent";
import Loader from "../../../Component/formcomponent/Loader";
import {
  useStates,
  useDistricts,
  useTalukas,
  useCities,
  usePincodeLookup,
} from "../../../lib/hooks/useAddressQueries";
import { SwalHelper } from "../../../utils/swalHelper";
import { useCascadingAddress } from "../../../lib/hooks/useCascadingAddress";
import { formatOptions } from "../../../utils/CommonHelper";
import { getDeviceIP } from "../../../utils/CommonHelper";
import {
  GetMasterPromotingType,
  GetMasterPromoterStatus,
} from "../../../Endpoints_All/Secretary/PromotingOrganisation";

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
  PromoterStatus: "",
};

// Readable labels for the edit note
const STATUS_LABELS = {
  S: "Submitted",
  V: "Verified",
  R: "Rejected",
};

// Reads the stored path from whatever shape UploadPdf hands back
const extractFilePath = (fileData) =>
  fileData?.filePath ||
  fileData?.filepath ||
  fileData?.uniqueFileName ||
  fileData?.uniquefilepath ||
  "";

const PromotingOrganizations = () => {
  const { color } = useContext(ThemeContext);
  const { t } = useTranslation("promotorOrgRegistration");
  const { userInfo } = useAuth();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const navigate = useNavigate();

  const userTypeId = userInfo?.UserTypeID || 0;

  const userLoginId = userInfo?.UserLoginID;
  const [fullData, setFullData] = useState({});
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);

  const [regCertOcrStatus, setRegCertOcrStatus] = useState({
    verified: null,
    message: "",
    loading: false,
  });
  const [panOcrStatus, setPanOcrStatus] = useState({
    verified: null,
    message: "",
    loading: false,
  });

  const [orgStatus, setOrgStatus] = useState("");
  const [showOtherCity, setShowOtherCity] = useState(false);
  const [isAutoFillingAddress, setIsAutoFillingAddress] = useState(false);
  const [isEditAllowed, setIsEditAllowed] = useState(true);
  const [editRemark, setEditRemark] = useState("");
  const [finalStatus, setFinalStatus] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const isSecretary = userTypeId === 81;
  const isEditableUser = [66, 81].includes(userTypeId);

  // Submitted (S) or Verified (V) -> locked. Rejected (R) -> editable.
  const normalizedOrgStatus = (orgStatus || "").toString().trim().toUpperCase();
  const isLockedStatus = ["S", "V"].includes(normalizedOrgStatus);
  const isRejectedStatus =
    !isLockedStatus && (normalizedOrgStatus === "R" || finalStatus === "R");

  // Locked always wins. Rejected overrides the backend "IsEditingAllowed" flag.
  const fieldsDisabled =
    !isEditableUser ||
    (!isSecretary &&
      (isLockedStatus || (!isEditAllowed && !isRejectedStatus)));

  // Note message when editing is not allowed
  const statusLabel = STATUS_LABELS[normalizedOrgStatus] || normalizedOrgStatus;

  const editNote = (() => {
    if (!isEditableUser || isSecretary) return "";
    if (isLockedStatus) {
      return normalizedOrgStatus === "V"
        ? "Editing is not allowed. Your details are verified."
        : "Editing is not allowed. It is sent for verification.";
    }
    if (isRejectedStatus) return "";
    if (!isEditAllowed) {
      return (
        editRemark ||
        `Editing is not allowed${statusLabel ? ` for status "${statusLabel}"` : ""}.`
      );
    }
    return "";
  })();

  useCascadingAddress(formData, setFormData, isAutoFillingAddress);
  // Dropdown data
  const { data: states, loading: stateLoading } = useStates();
  const { data: districts, loading: districtsLoading } = useDistricts(
    formData.StateID,
  );
  const { data: talukas, loading: talukaLoading } = useTalukas(
    formData.DistrictID,
  );
  const { data: cities, loading: cityLoading } = useCities(formData.TalukaID);
  const { getPincode } = usePincodeLookup();

  // File/PDF paths
  const [regCertFileData, setRegCertFileData] = useState({});
  const [panCardFileData, setPanCardFileData] = useState({});

  const [dropdowns, setDropdowns] = useState({
    types: [],
    status: [],
  });

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const instituteIdFromUrl = params.get("instituteId");

  const isVerificationMode = userTypeId !== 66;

  useEffect(() => {
    fetchDropdownData();
    fetchPromotingOrganizationData();
  }, []);

  const handlePincodeChange = useCallback(async (value) => {
    const pin = value.replace(/\D/g, "").slice(0, 6);
    setFormData((p) => ({ ...p, PinCode: pin }));

    setErrors((prev) => {
      const { PinCode, ...rest } = prev;
      return rest;
    });

    if (pin.length < 6) {
      setFormData((prev) => ({
        ...prev,
        StateID: "",
        DistrictID: "",
        TalukaID: "",
        CityID: "",
      }));

      setErrors((prev) => {
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
      setFormData((prev) => ({
        ...prev,
        PinCode: pin,
        StateID,
        DistrictID,
        TalukaID,
        CityID,
      }));

      setErrors((prev) => {
        const {
          StateID: s,
          DistrictID: d,
          TalukaID: t,
          CityID: c,
          ...rest
        } = prev;
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
    setFormData((p) => ({
      ...p,
      CityID: value,
      CityName: isOther ? "" : p.CityName,
    }));
  };

  const handleChange = useCallback((value, field) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const checkEditingAllowed = async (instituteId) => {
    try {
      const ipAddress = await getDeviceIP();

      const payload = {
        instituteId: Number(instituteId),
        exitInstituteID: Number(instituteId),
        userLoginID: userLoginId,
        pageCode: isVerificationMode
          ? "PromotingOrganizationVerification"
          : "PromotingOrganization",
        itemId: Number(instituteId),
        ipAddress: ipAddress || "",
      };

      const res = await agent.post("/Base/IsEditingAllowed", payload);
      const row = res?.data?.Data?.[0];

      if (row) {
        setIsEditAllowed(row.IsEditAllowed);
        setEditRemark(row.Remarks || "");
      }
    } catch (err) {
      console.error("[PromotingOrg] Failed to check editing allowed:", err);
    }
  };

  // Returns the overall (final) status so the caller can use it immediately
  const getOrganisationStatus = async (orgId) => {
    try {
      const res = await agent.get(
        `/api/PromotionalOrganisation/GetStatusProposedOrganisation/${orgId}`,
      );

      const status = (res?.data?.Data || "").toString().trim().toUpperCase();

      setOrgStatus(status);
      return status;
    } catch (err) {
      console.error("[PromotingOrg] Failed to fetch org status:", err);
      return "";
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [typeRes, statusRes] = await Promise.all([
        agent.get(GetMasterPromotingType),
        agent.get(GetMasterPromoterStatus),
      ]);

      setDropdowns({
        types: formatOptions(typeRes?.data?.Data || []),
        status: formatOptions(statusRes?.data?.Data || []),
      });
    } catch (err) {
      console.error("[PromotingOrg] Failed to fetch dropdown data:", err);
    }
  };

  const fetchPromotingOrganizationData = async () => {
    startLoading();
    try {
      const resinstitute = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${userLoginId}`,
      );
      const InstituteId = resinstitute.data.Data;
      let PromotorOrganisationID;

      if (isVerificationMode) {
        PromotorOrganisationID = instituteIdFromUrl;
      } else if (userTypeId === 66) {
        PromotorOrganisationID = InstituteId;
      } else {
        const resorganisation = await agent.get(
          `${GetPromotingOrganisationIDByInstituteID}/${InstituteId}`,
        );
        PromotorOrganisationID = resorganisation?.data?.Data;
      }

      await checkEditingAllowed(PromotorOrganisationID);

      // Overall status (same as dashboard)
      const overallStatus = await getOrganisationStatus(PromotorOrganisationID);

      const restrictedUserTypes = [64, 66, 81];
      if (
        !isVerificationMode &&
        !restrictedUserTypes.includes(userTypeId) &&
        (!PromotorOrganisationID || PromotorOrganisationID === 0)
      ) {
        const result = await Swal.fire({
          icon: "info",
          title: "Not Mapped",
          html: `
                        <div class="text-left">
                            <p class="mb-2">Promoting Organization for this Skill Development Institute is not mapped. To map the Promoting Organization, follow below mentioned process:</p>
                            <ol class="mt-2 ml-4 list-decimal text-left space-y-0">
                                <li>Register Promoting Organization. Refer User Manual for Promoting Organization for detailed process</li>
                                <li>Update "Affiliated Institutes" on "Associated Institute/s" page in Promoting Organization account.</li>
                                <li>The Promoting Organization details shall be displayed on this page once "Affiliated Institutes" are updated.</li>
                            </ol>
                        </div>
                    `,
          confirmButtonText: "OK",
          customClass: {
            confirmButton:
              "bg-[#00c3f9] hover:bg-[#00a8d6] text-white rounded px-6 py-2",
          },
          buttonsStyling: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        if (result.isConfirmed) {
          navigate("/institute/Management");
        }
        return;
      }

      const payload = {
        ItemId: 0,
        InstituteId: PromotorOrganisationID,
        UserLoginID: userLoginId,
        PageCode: isVerificationMode
          ? "PromotingOrganizationVerification"
          : "ExistingInstitute",
        IPAddress: "",
      };

      const response = await agent.post(
        `${GetPromotingOrganisationDetails}`,
        payload,
      );
      const data = response?.data;

      if (data && data.Status === "Success" && data.Data) {
        setEditMode(true);

        const orgData = data.Data;
        setFullData(orgData);
        setFormData({
          ProfileID: orgData.ApplicationID || "",

          TypeOfPromotingOrganization:
            orgData.PromotingOrganizationType?.toString() || "",

          PromotingOrganisationTypeName:
            orgData.PromotingOrganisationTypeName || "",

          PromoterStatus:
            orgData.PromotingOrganizationStatusID?.toString() || "",

          NameOfPromotingOrganization:
            orgData.NameOfPromotingOrganization || "",

          DateOfRegistration:
            orgData.PromotingOrganizationRegistrationDate || "",

          RegistrationNumber: orgData.OrganizatioRegistrationNumber || "",

          PromotingOrganizationAddress:
            orgData.PromotingOrganizationAddress || "",

          StateID: orgData.PromotingOrganizationStateID?.toString() || "",
          DistrictID: orgData.PromotingOrganizationDistrictID?.toString() || "",
          TalukaID: orgData.PromotingOrganizationTalukaID?.toString() || "",
          CityID: orgData.PromotingOrganizationCityID?.toString() || "",

          CityName: orgData.PromotingOrganizationCityName || "",

          PinCode: orgData.PromotingOrganizationPincode || "",

          Phone: orgData.AuthorizedRepresentativeMobileNo || "",
          Email: orgData.AuthorizedRepresentativeEMailID || "",

          PAN: orgData.PAN || "",
          PANCard: orgData.PANPath || "",
          RegistrationCertificate: orgData.RegistrationCertificatePath || "",

          PromotingOrganizationTypeOther:
            orgData.PromotingOrganizationTypeOther || "",
        });

        // Section-level verification flag from the details record
        const verificationStatus = (
          orgData.IsApprovedPromotingOrganisationStatus || ""
        )
          .toString()
          .trim()
          .toUpperCase();

        // GetStatusProposedOrganisation (same value as the DB FormStatus) is the
        // source of truth. The details-record flag is only used as a fallback for
        // the secretary's radios when the overall status is not yet Verified/Rejected.
        const isDecided = ["V", "R"].includes(overallStatus);
        const resolvedFinalStatus = isDecided
          ? overallStatus
          : isSecretary
            ? verificationStatus
            : overallStatus;

        const rawRejectReason = (
          orgData.RejectResionPromotingOrganisationStatus || ""
        ).toString();

        setFinalStatus(resolvedFinalStatus);
        setRejectReason(rawRejectReason);

        setRegCertFileData({
          fileName: orgData.RegistrationCertificateFileName,
          uniqueFileName: orgData.RegistrationCertificatePath,
          filePath: orgData.RegistrationCertificatePath,
        });

        setPanCardFileData({
          fileName: orgData.PANCardFileName,
          uniqueFileName: orgData.PANPath,
          filePath: orgData.PANPath,
        });
      }
    } catch (error) {
      console.error("[PromotingOrg] Failed to fetch organization info:", error);
      Swal.fire("Error", "Failed to fetch organization info", "error");
    } finally {
      stopLoading();
    }
  };

  const generateHash = (value) => {
    let hash = 0;
    const str = value.toString();

    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }

    return Math.abs(hash);
  };
  const isFormDirty =
    JSON.stringify(formData) !== JSON.stringify(initialFormState);
  const handleNext = async () => {
    if (isFormDirty) {
      const result = await SwalHelper.confirm({
        title: "Unsaved Changes",
        text: "Your changes will not be saved.",
        confirmText: "Yes, Continue",
        cancelText: "Stay Here",
      });

      if (!result.isConfirmed) return;
    }

    if (userTypeId === 66) {
      navigate("/promotingorganization/PromotersDetails");
    } else {
      const orgId = instituteIdFromUrl || fullData?.PromotingOrganisationID;
      const hash = generateHash(orgId);

      navigate(
        `/promotingorganization/PromotersDetails?P1=${orgId}&P2=${hash}`,
      );
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
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

  const verifyDocumentWithOcr = async (
    filePath,
    documentType,
    expectedNumber,
    docLabel,
    setStatus
  ) => {
    if (!filePath) return;

    if (!expectedNumber || !expectedNumber.toString().trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Document Number",
        text: `Please enter the ${docLabel} number before verifying the document.`,
        confirmButtonColor: "#00c3f9",
      });
      return;
    }

    setStatus({ verified: null, message: "Verifying document...", loading: true });

    try {
      Swal.fire({
        title: "Verifying Document",
        text: `Running OCR verification for ${docLabel}...`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await agent.post(
        "/api/PromotionalOrganisation/VerifyDocumentOcr",
        {
          filePath: filePath,
          documentType: documentType,
          expectedNumber: expectedNumber.toString().trim(),
        }
      );

      const resData = res?.data?.Data || res?.data;
      const isVerified = resData?.verified === true;
      const message =
        resData?.message ||
        (isVerified
          ? "VERIFIED"
          : "NOT VERIFIED — Document number does not match");

      setStatus({
        verified: isVerified,
        message: message,
        loading: false,
      });

      if (isVerified) {
        Swal.fire({
          icon: "success",
          title: "VERIFIED",
          text: `Document number matches the entered ${docLabel} number.`,
          confirmButtonColor: "#00c3f9",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "NOT VERIFIED — Document number does not match",
          text: message || "Document number does not match the entered number.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error("[OCR Verification Error]", err);
      const errMsg =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message ||
        "OCR processing error occurred.";

      setStatus({
        verified: false,
        message: errMsg,
        loading: false,
      });

      Swal.fire({
        icon: "error",
        title: "OCR Verification Failed",
        text: errMsg,
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleRegCertFile = (fileData) => {
    setRegCertFileData(fileData || {});
    const path = extractFilePath(fileData);
    setFormData((prev) => ({
      ...prev,
      RegistrationCertificate: path,
    }));
    setErrors((prev) => ({ ...prev, RegistrationCertificate: "" }));

    if (path) {
      verifyDocumentWithOcr(
        path,
        "registration_certificate",
        formData.RegistrationNumber,
        "Registration/GR",
        setRegCertOcrStatus
      );
    }
  };

  const handlePanCardFile = (fileData) => {
    setPanCardFileData(fileData || {});
    const path = extractFilePath(fileData);
    setFormData((prev) => ({
      ...prev,
      PANCard: path,
    }));
    setErrors((prev) => ({ ...prev, PANCard: "" }));

    if (path) {
      verifyDocumentWithOcr(
        path,
        "pan",
        formData.PAN,
        "PAN Card",
        setPanOcrStatus
      );
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.TypeOfPromotingOrganization)
      newErrors.TypeOfPromotingOrganization = "Type is required";
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
    if (!formData.StateID) newErrors.StateID = "State required";
    if (!formData.DistrictID) newErrors.DistrictID = "District required";
    if (!formData.TalukaID) newErrors.TalukaID = "Taluka required";
    if (!formData.CityID) newErrors.CityID = "City/Village required";
    if (!formData.PinCode) newErrors.PinCode = "Pin code required";
    else if (!/^[0-9]{6}$/.test(formData.PinCode))
      newErrors.PinCode = "Enter valid 6-digit pin";
    if (!formData.Phone) newErrors.Phone = "Phone required";
    else if (!/^[1-9][0-9]{9}$/.test(formData.Phone))
      newErrors.Phone = "Enter 10-digit phone";
    if (!formData.Email) newErrors.Email = "E-mail required";
    else if (!/^([a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,6})$/i.test(formData.Email))
      newErrors.Email = "Enter valid e-mail";
    if (!formData.PAN) newErrors.PAN = "PAN required";
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.PAN))
      newErrors.PAN = "Enter valid PAN (AAAAA9999A)";
    if (!formData.PANCard) newErrors.PANCard = "Upload PAN card";

    // Secretary must choose a status, and a remark is required when rejecting
    if (isVerificationMode && isSecretary) {
      if (!["V", "R"].includes(finalStatus))
        newErrors.FinalStatus = "Select Verified or Rejected";
      else if (finalStatus === "R" && !rejectReason.trim())
        newErrors.RejectReason = "Reason for rejection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapFormToApi = (formData, fullData) => ({
    ...fullData,

    // override editable fields
    NameOfPromotingOrganization: formData.NameOfPromotingOrganization,
    PromotingOrganizationAddress: formData.PromotingOrganizationAddress,
    PromotingOrganizationPincode: formData.PinCode,

    PromotingOrganizationStateID: Number(formData.StateID),
    PromotingOrganizationDistrictID: Number(formData.DistrictID),
    PromotingOrganizationTalukaID: Number(formData.TalukaID),
    PromotingOrganizationCityID: Number(formData.CityID),

    PromotingOrganizationCityName:
      formData.CityName || fullData.PromotingOrganizationCityName,

    PromotingOrganizationPhoneNumber: formData.Phone,
    AuthorizedRepresentativeEMailID: formData.Email,

    PAN: formData.PAN,
    PANPath: formData.PANCard,

    RegistrationCertificatePath: formData.RegistrationCertificate,
    OrganizatioRegistrationNumber: formData.RegistrationNumber,

    PromotingOrganizationType: Number(formData.TypeOfPromotingOrganization),
    PromotingOrganizationStatusID: Number(formData.PromoterStatus),
    PromoterStatus: Number(formData.PromoterStatus),
  });

  const formatSqlDateTime = () => {
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, "0");

    return (
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    );
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (regCertOcrStatus.verified === false) {
      Swal.fire({
        icon: "error",
        title: "NOT VERIFIED — Document number does not match",
        text: "Registration Certificate number does not match. Please upload a matching document.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    if (panOcrStatus.verified === false) {
      Swal.fire({
        icon: "error",
        title: "NOT VERIFIED — Document number does not match",
        text: "PAN Card number does not match. Please upload a matching document.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    startLoading();
    try {
      let response;
      if (isVerificationMode) {
        const ipAddress = await getDeviceIP();

        const payload = mapFormToApi(formData, fullData);
        payload.IPAddress = ipAddress || "0.0.0.0";
        payload.UserLoginID = userLoginId;
        payload.PageCode = "PromotingOrganizationVerification";

        payload.IsApprovedPromotingOrganisationStatus = finalStatus;
        payload.RejectResionPromotingOrganisationStatus =
          finalStatus === "R" ? rejectReason.trim() : "";
        response = await agent.post(
          SavePromotionalOrganisationDetailsVerification,
          payload,
        );
      } else {
        const ipAddress = await getDeviceIP();

        const normalPayload = {
          InstituteID: instituteIdFromUrl || fullData?.PromotingOrganisationID,
          PromotingOrganisationProfileID: formData.ProfileID,
          PromotingOrganisationName: formData.NameOfPromotingOrganization,
          RegistrationDate: formData.DateOfRegistration,
          EMailID: formData.Email,
          MobileNo: formData.Phone,
          PANNo: formData.PAN,
          // FIX: use the form value (set on upload AND on initial load).
          // Previously used `panCardFileData.filepath` (wrong casing) which
          // was undefined and caused the 400 "PANPath" validation error.
          PANPath: formData.PANCard || "",
          PAddress: formData.PromotingOrganizationAddress,
          PPincode: formData.PinCode,
          POtherCity: formData.CityName || "",
          RegistrationCertificatePath: formData.RegistrationCertificate || "",
          RegistrationNumber: formData.RegistrationNumber,
          PStateID: Number(formData.StateID),
          PDistrictID: Number(formData.DistrictID),
          PTalukaID: Number(formData.TalukaID),
          PCityID: Number(formData.CityID),
          PromoterStatus: Number(formData.PromoterStatus),
          PromotingOrganisationType: Number(
            formData.TypeOfPromotingOrganization,
          ),
          IPAddress: ipAddress,
          PageCode: "PromotingOrganization",
          IsVerify: "N",
          VerifiedBy: userLoginId,
          VerifiedOn: formatSqlDateTime(),
          UserLoginID: userLoginId,
          OtherPromotingOrganisationType:
            formData.PromotingOrganizationTypeOther || "",
        };
        console.log("[handleSave] Normal mode payload:", normalPayload);

        response = await agent.post(
          "/api/PromotionalOrganisation/SavePromotionalOrganisationDetails",
          normalPayload,
        );
      }

      if (response?.data?.Status === "Success") {
        await Swal.fire({
          icon: "success",
          title: "Verification Successful",
          text:
            response?.data?.Message ||
            "Document verified successfully! You can now proceed.",
          confirmButtonColor: "#28a745",
          confirmButtonText: "Continue",
        });

        setEditMode(true);

        if (userTypeId === 66) {
          navigate("/promotingorganization/PromotersDetails");
        } else {
          const orgId = instituteIdFromUrl || fullData?.PromotingOrganisationID;
          const hash = generateHash(orgId);

          navigate(
            `/promotingorganization/PromotersDetails?P1=${orgId}&P2=${hash}`,
          );
        }
      } else {
        const rawMsg =
          response?.data?.Message ||
          response?.data?.message ||
          "Failed to save";
        const isOcrMismatch =
          typeof rawMsg === "string" &&
          (rawMsg.toLowerCase().includes("ocr") ||
            rawMsg.toLowerCase().includes("verification failed") ||
            rawMsg.toLowerCase().includes("does not match") ||
            rawMsg.toLowerCase().includes("mismatch"));

        if (isOcrMismatch) {
          Swal.fire({
            icon: "error",
            title: "Verification Failed",
            html: `
              <div class="text-center p-2">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-3 text-2xl font-bold">
                  !
                </div>
                <p class="text-base font-semibold text-gray-800 mb-2">Document Does Not Match</p>
                <p class="text-sm text-gray-600 leading-relaxed">${rawMsg}</p>
              </div>
            `,
            confirmButtonText: "Close",
            confirmButtonColor: "#dc3545",
            customClass: {
              confirmButton:
                "bg-[#dc3545] hover:bg-[#c82333] text-white rounded px-6 py-2 text-sm font-semibold transition-colors",
            },
            buttonsStyling: false,
          });
        } else {
          Swal.fire("Error", rawMsg, "error");
        }
      }
    } catch (err) {
      console.error("[PromotingOrg] Save/Verification Error:", err);
      const rawMsg =
        err?.Message ||
        err?.message ||
        err?.data?.Message ||
        err?.data?.message ||
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Verification failed. Document does not match.";

      const isOcrMismatch =
        typeof rawMsg === "string" &&
        (rawMsg.toLowerCase().includes("ocr") ||
          rawMsg.toLowerCase().includes("verification failed") ||
          rawMsg.toLowerCase().includes("does not match") ||
          rawMsg.toLowerCase().includes("mismatch"));

      if (isOcrMismatch) {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          html: `
            <div class="text-center p-2">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-3 text-2xl font-bold">
                !
              </div>
              <p class="text-base font-semibold text-gray-800 mb-2">Document Does Not Match</p>
              <p class="text-sm text-gray-600 leading-relaxed">${rawMsg}</p>
            </div>
          `,
          confirmButtonText: "Close",
          confirmButtonColor: "#dc3545",
          customClass: {
            confirmButton:
              "bg-[#dc3545] hover:bg-[#c82333] text-white rounded px-6 py-2 text-sm font-semibold transition-colors",
          },
          buttonsStyling: false,
        });
      } else {
        Swal.fire("Error", rawMsg, "error");
      }
    } finally {
      stopLoading();
    }
  };

  const handleBack = () => {
    const isSecretary = userTypeId === 81 || userTypeId === 14;

    if (isSecretary) {
      navigate("/SDILOI/PromotingOrganizationSearch");
    } else {
      navigate("/promotingorganization/dashboard");
    }
  };

  const toInputDate = (value) => {
    if (!value) return "";
    return value.split("T")[0];
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="w-full p-4">
        <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
          <legend
            className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
          >
            <FaBuilding className="mr-2 text-white" />
            Promoting Organization
          </legend>

          {editNote && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded text-sm mx-4 mt-3 mb-3">
              <strong>Note:</strong> {editNote}
            </div>
          )}

          <form className="w-full px-4 pb-3" autoComplete="off">
            {/* Row 1: Profile ID and Name */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="col-span-1">
                <FormComponent
                  label="Profile ID"
                  name="ProfileID"
                  value={formData.ProfileID}
                  disabled={fieldsDisabled}
                  readOnly
                />
              </div>
              <div className="col-span-3">
                <FormComponent
                  label="Name of Promoting Organization"
                  name="NameOfPromotingOrganization"
                  value={formData.NameOfPromotingOrganization}
                  onChange={(e) =>
                    handleInputChange("NameOfPromotingOrganization", e)
                  }
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
                  options={dropdowns.types}
                  value={formData.TypeOfPromotingOrganization?.toString()}
                  onChange={(value) =>
                    handleDropdownChange("TypeOfPromotingOrganization", value)
                  }
                  error={errors.TypeOfPromotingOrganization}
                  required
                  loading={false}
                  disabled={fieldsDisabled}
                />
              </div>
              <div className="col-span-1">
                {formData.TypeOfPromotingOrganization === "11" && (
                  <FormComponent
                    label="Other Type"
                    value={formData.PromotingOrganizationTypeOther || ""}
                    onChange={(val) =>
                      handleInputChange("PromotingOrganizationTypeOther", val)
                    }
                    disabled={fieldsDisabled}
                  />
                )}
              </div>

              <div className="col-span-1">
                <DropdownComponent
                  label="Government/ Private Status"
                  name="PromoterStatus"
                  options={dropdowns.status}
                  value={formData.PromoterStatus?.toString()}
                  onChange={(value) =>
                    handleDropdownChange("PromoterStatus", value)
                  }
                  error={errors.GovernmentPrivateStatus}
                  required
                  loading={false}
                  disabled={fieldsDisabled}
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
                  onChange={(val) =>
                    handleInputChange("DateOfRegistration", val)
                  }
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
                  onChange={(val) =>
                    handleInputChange("RegistrationNumber", val)
                  }
                  required
                  error={errors.RegistrationNumber}
                  disabled={fieldsDisabled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Registration/ Incorporation Certificate{" "}
                  <span className="text-red-500">*</span>
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
                  userTypeId={userTypeId}
                  userLoginID={userLoginId}
                  linkName="View "
                  uniquefilepath={regCertFileData.uniqueFileName || ""}
                  id="uploadRegCert"
                  disabled={fieldsDisabled}
                />
                {errors.RegistrationCertificate && (
                  <div className="text-xs text-red-500 mt-1">
                    {errors.RegistrationCertificate}
                  </div>
                )}
                {regCertOcrStatus.loading && (
                  <div className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
                    <span>⏳ Verifying document via OCR...</span>
                  </div>
                )}
                {regCertOcrStatus.verified === true && (
                  <div className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                    <span>✓ VERIFIED</span>
                  </div>
                )}
                {regCertOcrStatus.verified === false && !regCertOcrStatus.loading && (
                  <div className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                    <span>✗ {regCertOcrStatus.message || "NOT VERIFIED — Document number does not match"}</span>
                  </div>
                )}
                {formData.RegistrationCertificate && !regCertOcrStatus.loading && (
                  <button
                    type="button"
                    onClick={() =>
                      verifyDocumentWithOcr(
                        formData.RegistrationCertificate,
                        "registration_certificate",
                        formData.RegistrationNumber,
                        "Registration/GR",
                        setRegCertOcrStatus
                      )
                    }
                    className="mt-1 text-xs text-blue-600 underline hover:text-blue-800 font-medium block"
                  >
                    Verify OCR
                  </button>
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
                  onChange={(val) =>
                    handleInputChange("PromotingOrganizationAddress", val)
                  }
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
                    onChange={(value) => handleInputChange("CityName", value)}
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
                  <div className="text-xs text-red-500 mt-1">
                    {errors.Phone}
                  </div>
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
                  onChange={(e) => handleInputChange("Email", e.target.value)}
                  disabled={fieldsDisabled}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Email ? "border-red-500" : "border-gray-300"} disabled:bg-gray-100`}
                  placeholder="Enter email"
                />
                {errors.Email && (
                  <div className="text-xs text-red-500 mt-1">
                    {errors.Email}
                  </div>
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
                  onChange={(e) => handleInputChange("Website", e.target.value)}
                  disabled={fieldsDisabled}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Website ? "border-red-500" : "border-gray-300"} disabled:bg-gray-100`}
                  placeholder="https://example.com"
                />
                {errors.Website && (
                  <div className="text-xs text-red-500 mt-1">
                    {errors.Website}
                  </div>
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
                  Upload Organization PAN Card{" "}
                  <span className="text-red-500">*</span>
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
                  userTypeId={userTypeId}
                  userLoginID={userLoginId}
                  linkName="View PAN Card"
                  uniquefilepath={panCardFileData.uniqueFileName || ""}
                  id="uploadPanCard"
                  disabled={fieldsDisabled}
                />
                {errors.PANCard && (
                  <div className="text-xs text-red-500 mt-1">
                    {errors.PANCard}
                  </div>
                )}
                {panOcrStatus.loading && (
                  <div className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
                    <span>⏳ Verifying document via OCR...</span>
                  </div>
                )}
                {panOcrStatus.verified === true && (
                  <div className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                    <span>✓ VERIFIED</span>
                  </div>
                )}
                {panOcrStatus.verified === false && !panOcrStatus.loading && (
                  <div className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                    <span>✗ {panOcrStatus.message || "NOT VERIFIED — Document number does not match"}</span>
                  </div>
                )}
                {formData.PANCard && !panOcrStatus.loading && (
                  <button
                    type="button"
                    onClick={() =>
                      verifyDocumentWithOcr(
                        formData.PANCard,
                        "pan",
                        formData.PAN,
                        "PAN Card",
                        setPanOcrStatus
                      )
                    }
                    className="mt-1 text-xs text-blue-600 underline hover:text-blue-800 font-medium block"
                  >
                    Verify OCR
                  </button>
                )}
              </div>
            </div>

            {isVerificationMode && userTypeId === 81 && (
              <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                <h3 className="text-md font-normal mb-3">
                  Select Approved Reject Status{" "}
                  <span className="text-red-500">*</span>
                </h3>

                <div className="flex gap-6 mb-4">
                  {/* VERIFIED */}
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="V"
                      checked={finalStatus === "V"}
                      onChange={(e) => {
                        setFinalStatus(e.target.value);
                        setRejectReason(""); // clear remark when Verified
                        setErrors((prev) => ({
                          ...prev,
                          FinalStatus: "",
                          RejectReason: "",
                        }));
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
                        setFinalStatus(e.target.value);
                        setErrors((prev) => ({ ...prev, FinalStatus: "" }));
                      }}
                      className="form-radio h-4 w-4 text-red-600"
                    />
                    <span className="ml-2 text-sm">Rejected</span>
                  </label>
                </div>
                {errors.FinalStatus && (
                  <div className="text-xs text-red-500 -mt-3 mb-3">
                    {errors.FinalStatus}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-normal mb-2">
                    Reason for Rejection/ Remark
                    {finalStatus === "R" && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>

                  <textarea
                    className={`w-full border rounded-md p-2 text-sm uppercase ${
                      finalStatus === "R"
                        ? "border-gray-300"
                        : "border-gray-200 bg-gray-100 cursor-not-allowed"
                    }`}
                    rows="3"
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value.toUpperCase());
                      setErrors((prev) => ({ ...prev, RejectReason: "" }));
                    }}
                    placeholder="Enter remark..."
                    disabled={finalStatus !== "R"}
                  />
                  {errors.RejectReason && (
                    <div className="text-xs text-red-500 mt-1">
                      {errors.RejectReason}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Final status message (applicant view) */}
            {!isSecretary &&
              finalStatus === "R" &&
              normalizedOrgStatus !== "S" && (
                <div className="mt-4 text-sm text-red-600">
                  <p>Verification Status: Rejected</p>
                  <p className="mt-2 uppercase">
                    Reason for Rejection/ Remark : {rejectReason}
                  </p>
                </div>
              )}

            {!isSecretary && finalStatus === "V" && (
              <div className="mt-4 text-sm text-green-600">
                <p>Verification Status: Verified</p>
                {rejectReason && (
                  <p className="mt-2 uppercase">
                    Reason for Rejection/ Remark : {rejectReason}
                  </p>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                type="button"
                className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
                onClick={handleBack}
              >
                Back
              </button>
              {!fieldsDisabled && (
                <button
                  type="button"
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm"
                  onClick={handleSave}
                >
                  Save and Next
                </button>
              )}
              <button
                type="button"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-semibold text-sm"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </form>
        </fieldset>
      </div>
    </>
  );
};

export default PromotingOrganizations;