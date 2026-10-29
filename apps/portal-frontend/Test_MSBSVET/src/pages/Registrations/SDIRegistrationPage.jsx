import { useState, useEffect, useRef, useContext } from "react";
import Swal from "sweetalert2";

import { SwalHelper } from "../../utils/swalHelper.js";
import ModeSelector from "../../component/instituteregistration/ModeSelector";
import ExistingInstituteForm from "../../component/instituteregistration/ExistingInstituteForm";
import NewInstituteForm from "../../component/instituteregistration/NewInstituteForm";
import CaptchaComponent from "../../component/formcomponent/CaptchaComponent";
import PromotingOrganizationDetails from "../../component/instituteregistration/PromotingOrganizationDetails";
import AuthorizedRepresentativeofSkillDevelopmentInstitute from "../../component/instituteregistration/AuthorizedRepresentativeofSkillDevelopmentInstitute";
import SecurityQuestion from "../../component/formcomponent/SecurityQuestion";
import ErrorListPopup from "../../component/instituteregistration/ErrorListPopup";
import { getDeviceIP } from "../../utils/CommonHelper";
import {
  GetApprovedInstituteId,
  IsInstituteExist,
  CheckExistingInstituteSDIApplication,
  SaveInstituteDraft,
  SubmitInstituteRegistration,
  GetMasterIgnoreWords,
  IsNewRegistrationStarted,
} from "../../Endpoints_All/Registration/SDIRegistration";
import { useNavigate } from "react-router-dom";

import agent from "../../lib/api/agent";
import OTPService from "../../Component/formcomponent/OTPService";
import VerifiedIcon from "../../assets/VerifiedIcon.jpg";
import NotVerifiedIcon from "../../assets/NotVerifiedIcon.jpg";

function SDIRegistrationPage() {
  const navigate = useNavigate();
  const securityRef = useRef();
  const captchaRef = useRef();



  const [registrationAllowed, setRegistrationAllowed] = useState(null);

  const [promotingRepData, setPromotingRepData] = useState(null);
  const [showReservedPopup, setShowReservedPopup] = useState(false);
  const [ignoreWords, setIgnoreWords] = useState([]);

  const [mode, setMode] = useState("");
  const [profileId, setProfileId] = useState("");
  const [details, setDetails] = useState(null);

  const isModeSelected = !!mode;
  useEffect(() => {
  }, [details]);

  const [showStaffNotFound, setShowStaffNotFound] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [errorFields, setErrorFields] = useState([]);

  const [newInstitute, setNewInstitute] = useState({ proposedName: "" });

  const [form, setForm] = useState({
    securityQuestion: "",
    securityAnswer: "",
    password: "",
    confirmPassword: "",
    captchaInput: "",
  });

  const [instituteEntity, setInstituteEntity] = useState({
    ApplicationFor: "",
    IsExistingInstitute: "",
    InstituteID: "",
    InstituteName: "",
    PromotingOrgType: "",
    PromotingOrganisationID: "",
    PromotingOrgOthers: "",
    PromotingOrganisationStatus: "",
    AuthorizedPersonTitle: "",
    AuthorizedPersonFirstName: "",
    AuthorizedPersonMiddleName: "",
    AuthorizedPersonLastName: "",
    AuthorizedPersonGender: "",
    AuthorizedPersonDOB: "",
    AuthorizedPersonAadharNo: "",
    AuthorizedPersonMobileNo1: "",
    AuthorizedPersonMobileNo2: "",
    EMailID: "",
    AuthorizedPersonForPromotingOrganisationTitle: "",
    AuthorizedPersonForPromotingOrganisationFirstName: "",
    AuthorizedPersonForPromotingOrganisationMiddleName: "",
    AuthorizedPersonForPromotingOrganisationLastName: "",
    AuthorizedPersonForPromotingOrganisationGender: "",
    AuthorizedPersonForPromotingOrganisationDOB: "",
    AuthorizedPersonForPromotingOrganisationAadharNo: "",
    AuthorizedPersonForPromotingOrganisationMobileNo1: "",
    AuthorizedPersonForPromotingOrganisationMobileNo2: "",
    AuthorizedPersonForPromotingOrganisationEMailID: "",
  });
  const [promotingOrgLocation, setPromotingOrgLocation] = useState(null);


  useEffect(() => {
    const checkRegistrationStarted = async (UserTypeID) => {
      try {
        const response = await agent.get(
          `${IsNewRegistrationStarted}?UserTypeID=${UserTypeID}`,
        );

        if (response?.data?.Data === true) {
          setRegistrationAllowed(true);
          return;
        }

        setRegistrationAllowed(false);
        Swal.fire({
          title: "Alert",
          text: "Institute Registration is Not Started / Closed.",
          icon: "warning",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
          allowOutsideClick: false,
        }).then(() => {
          navigate("/react");
        });
      } catch (error) {
        setRegistrationAllowed(false);
        Swal.fire({
          title: "Alert",
          text: "Institute Registration is Not Started / Closed.",
          icon: "warning",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
          allowOutsideClick: false,
        }).then(() => {
          navigate("/react");
        });
      }
    };

    checkRegistrationStarted(64);
  }, [navigate]);

  useEffect(() => {
    const fetchIgnoreWords = async () => {
      try {
        const response = await agent.get(GetMasterIgnoreWords);
        if (response?.data?.Status === "Success") {
          setIgnoreWords(response.data.Data || []);
        }
      } catch (error) {
      }
    };

    fetchIgnoreWords();
  }, []);

  useEffect(() => {
    setDetails(null);
    setProfileId("");
    setPromotingRepData(null);

    setInstituteEntity((prev) => ({
      ApplicationFor: prev.ApplicationFor,
      IsExistingInstitute: "",
      InstituteID: "",
      InstituteName: "",
      PromotingOrgType: "",
      PromotingOrganisationID: "",
      PromotingOrgOthers: "",
      PromotingOrganisationStatus: "",
      AuthorizedPersonTitle: "",
      AuthorizedPersonFirstName: "",
      AuthorizedPersonMiddleName: "",
      AuthorizedPersonLastName: "",
      AuthorizedPersonGender: "",
      AuthorizedPersonDOB: "",
      AuthorizedPersonAadharNo: "",
      AuthorizedPersonMobileNo1: "",
      AuthorizedPersonMobileNo2: "",
      EMailID: "",
      AuthorizedPersonForPromotingOrganisationTitle: "",
      AuthorizedPersonForPromotingOrganisationFirstName: "",
      AuthorizedPersonForPromotingOrganisationMiddleName: "",
      AuthorizedPersonForPromotingOrganisationLastName: "",
      AuthorizedPersonForPromotingOrganisationGender: "",
      AuthorizedPersonForPromotingOrganisationDOB: "",
      AuthorizedPersonForPromotingOrganisationAadharNo: "",
      AuthorizedPersonForPromotingOrganisationMobileNo1: "",
      AuthorizedPersonForPromotingOrganisationMobileNo2: "",
      AuthorizedPersonForPromotingOrganisationEMailID: "",
    }));

    setForm({
      securityQuestion: "",
      securityAnswer: "",
      password: "",
      confirmPassword: "",
      captchaInput: "",
    });
  }, [mode]);
  useEffect(() => {
    if (registrationAllowed !== true) return;

    const noticeHtml =
      "<div style='text-align:left; font-size:14px; line-height:1.6;'>" +
      "<p style='margin-bottom:12px;'><b>1. Full Time Courses:</b><br />" +
      "Last Date for Admission to Full Time Certificate, Diploma and Advance Diploma for August 2026 Session is 31st August, 2026. Hence last date for application for New Full Time Certificate, Diploma and Advance Diploma Course for 2026-27 is 31st May, 2026. No new applications for these types of courses shall be accepted for 2026-27. Application for 2027-28 shall be accepted from 1st September, 2026 onwards</p>" +
      "<p><b>2. Part Term Courses:</b><br />" +
      "Application for Part Time Short Term Courses shall be accepted throughout the year and shall be processed on quarterly basis.</p>" +
      "</div>";

    Swal.fire({
      title: 'Important Notice',
      html: noticeHtml,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
      width: '42rem'
    });
  }, [registrationAllowed]);

  // const handleChange = (field, value) => {
  //   setForm((prev) => ({ ...prev, [field]: value }));
  // };

  const validateAndSubmit = () => {
    let errors = [];

    // ---------------- BASIC FORM VALIDATION ----------------

    if (!mode)
      errors.push(
        "Please Select Existing Training Institute or New Training Institute Status.",
      );

    if (!instituteEntity.ApplicationFor)
      errors.push("Please Select Application Type.");

    if (mode === "new" && !instituteEntity.InstituteName?.trim()) {
      errors.push("Please Enter Proposed Institute Name.");
    }

    if (!instituteEntity.PromotingOrganisationID)
      errors.push("Please Enter Promoting Organization Profile ID.");

    if (mode === "new") {
      if (!instituteEntity.PromotingOrgType)
        errors.push("Please Select Type of Promoting Organisation.");

      if (!instituteEntity.AuthorizedPersonForPromotingOrganisationFirstName)
        errors.push("Please Enter First Name.");

      if (!instituteEntity.AuthorizedPersonForPromotingOrganisationMobileNo1)
        errors.push("Please Enter Primary Mobile Number.");
    }

    if (!instituteEntity.AuthorizedPersonFirstName)
      errors.push("Please Enter First Name.");

    if (!instituteEntity.AuthorizedPersonMobileNo1)
      errors.push("Please Enter Primary Mobile Number.");

    // ---------------- SECURITY VALIDATION ----------------

    const securityResult = securityRef.current?.validateSecurity();

    if (!securityResult?.isValid) {
      const securityErrors = Object.values(securityResult.errors);
      errors = [...errors, ...securityErrors];
    }

    // ---------------- CAPTCHA VALIDATION ----------------

    const isCaptchaValid = captchaRef.current?.validate();

    if (!isCaptchaValid) {
      errors.push("Incorrect Captcha entered.");
    }

    // ---------------- FINAL CHECK ----------------

    if (errors.length > 0) {
      setErrorFields(errors);
      setShowErrors(true);
      return;
    }

    // Everything valid → Start OTP
    otpService.startVerification();
  };

  const showVerificationPopup = (data) => {
    const isInstituteVerified = data?.verified === true;
    const isOrgMapped = !!data?.promotingOrganization?.id;
    const isOrgVerified = data?.promotingOrganization?.verified === true;
    const isRepVerified = data?.representative?.verified === true;

    const allVerified =
      isInstituteVerified && isOrgMapped && isOrgVerified && isRepVerified;

    Swal.fire({
      showConfirmButton: false,
      width: "1100px",
      padding: 0,
      position: "top",
      background: "transparent",
      backdrop: "rgba(0,0,0,0.45)",
      html: `
<div style="font-family:Segoe UI, Arial, sans-serif;
            border-radius:6px;
            overflow:hidden;
            box-shadow:0 6px 20px rgba(0,0,0,0.25);
            text-align:left;">

  <!-- HEADER -->
  <div style="background:#0b2e63;
              color:white;
              padding:20px 30px;
              font-size:22px;
              font-weight:600;
              display:flex;
              justify-content:space-between;
              align-items:center;">
    Alert !
    <button id="closeBtn"
            style="background:#e74c3c;
                   color:white;
                   border:none;
                   padding:6px 12px;
                   border-radius:4px;
                   font-size:14px;
                   cursor:pointer;">
      X
    </button>
  </div>

  <!-- BODY -->
  <div style="background:#f2f2f2;
              padding:35px 45px;
              font-size:16px;
              color:#333;">

    <!-- Training Institute -->
    <div style="display:flex;justify-content:space-between;margin-bottom:25px;">
      <div style="width:85%;">
        <h3 style="margin-bottom:5px;">Training Institute</h3>
        <b>Training Institute :</b>
        ${data?.fullData?.InstituteNameCode ?? "NA"}
        <hr style="margin-top:8px;">
      </div>
      <img src="${isInstituteVerified ? VerifiedIcon : NotVerifiedIcon}"
           style="width:45px;height:45px;" />
    </div>

    <!-- Promoting Organization -->
    <div style="display:flex;justify-content:space-between;margin-bottom:25px;">
      <div style="width:85%;">
        <h3 style="margin-bottom:5px;">Promoting Organization</h3>
        <b>Promoting Organization :</b>
        ${data?.promotingOrganization?.name ?? "NA"}
        <hr style="margin-top:8px;">
      </div>
      <img src="${isOrgMapped && isOrgVerified ? VerifiedIcon : NotVerifiedIcon}"
           style="width:45px;height:45px;" />
    </div>

    <!-- Representative -->
    <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
      <div style="width:85%;">
        <h3 style="margin-bottom:5px;">
          Authorized Representative of Promoting Organization
        </h3>

        <b>Staff / Management :</b>
        ${data?.representative?.id ?? "NA"} <br/>

        <b>Primary Mobile No :</b>
        ${data?.representative?.primaryMobileNumber ?? "NA"}
      </div>

      <img src="${isRepVerified ? VerifiedIcon : NotVerifiedIcon}"
           style="width:45px;height:45px;" />
    </div>

    ${!allVerified
          ? `
        <div style="color:red;
                    font-size:18px;
                    text-align:center;
                    margin-top:25px;
                    line-height:1.8;">
          ${!isInstituteVerified
            ? `Existing Institute is Not Verified. Complete Institute Verification Process and then apply. Read User Manual for Institute for more details.<br/><br/>`
            : ""
          }
          ${!isOrgMapped
            ? `Promoting Organization for this Training Institute is not Mapped. Update Affiliated Institute/s Page through Promoting Organization Login. Read Promoting Organization User Manual for more details.<br/><br/>`
            : ""
          }
          ${isOrgMapped && !isOrgVerified
            ? `Promoting Organization is Not Verified. Complete the Verification Process and then apply. Read Promoting Organization User Manual for more details.<br/><br/>`
            : ""
          }
          ${!isRepVerified
            ? `Authorized Representative is Not Verified. Complete the Verification Process and then apply. Read Promoting Organization User Manual for more details.`
            : ""
          }
        </div>
      `
          : `
        <div style="text-align:center;margin-top:35px;">
          <button id="applyBtn"
                  style="background:#2e8b57;
                         color:white;
                         padding:10px 40px;
                         border:none;
                         border-radius:4px;
                         font-size:16px;
                         cursor:pointer;">
            Add Training Institute
          </button>
        </div>
      `
        }

   ${!allVerified
          ? `
    <div style="text-align:center;margin-top:25px;">
      <button id="closeBtn2"
              style="background:#2e8b57;
                     color:white;
                     padding:8px 30px;
                     border:none;
                     border-radius:4px;
                     font-size:16px;
                     cursor:pointer;">
        Close
      </button>
    </div>
  `
          : ""
        }


  </div>
</div>
`,

      didOpen: () => {
        const closeBtn = document.getElementById("closeBtn");
        const closeBtn2 = document.getElementById("closeBtn2");
        const applyBtn = document.getElementById("applyBtn");

        if (closeBtn) {
          closeBtn.onclick = () => Swal.close();
        }

        if (closeBtn2) {
          closeBtn2.onclick = () => Swal.close();
        }

        if (allVerified && applyBtn) {
          applyBtn.onclick = () => {
            Swal.close();

            const d = data.originalData;


            setDetails(d);

            setInstituteEntity((prev) => ({
              ...prev,

              InstituteID: d.CollegeID,
              InstituteName: d.InstituteName,

              PromotingOrganisationID: d.PromotingOrganisationID,
              PromotingOrgType: d.PromotingType || d.PromotingOrgType,
              PromotingOrganisationStatus: d.PromotingOrganisationStatus,

              // SDI Representative
              AuthorizedPersonTitle: d.AuthorizedPersonTitle,
              AuthorizedPersonFirstName: d.AuthorizedPersonFirstName,
              AuthorizedPersonMiddleName: d.AuthorizedPersonMiddleName,
              AuthorizedPersonLastName: d.AuthorizedPersonLastName,
              AuthorizedPersonGender: d.AuthorizedPersonGender,
              AuthorizedPersonDOB: d.AuthorizedPersonDOB,
              AuthorizedPersonAadharNo: d.AuthorizedPersonAadharNo,
              AuthorizedPersonMobileNo1: d.AuthorizedPersonMobileNo,
              EMailID: d.AuthorizedPersonEmailID,

              // Promoting Organisation Representative
              AuthorizedPersonForPromotingOrganisationTitle:
                d.AuthorizedPersonTitle,
              AuthorizedPersonForPromotingOrganisationFirstName:
                d.AuthorizedPersonFirstName,
              AuthorizedPersonForPromotingOrganisationMiddleName:
                d.AuthorizedPersonMiddleName,
              AuthorizedPersonForPromotingOrganisationLastName:
                d.AuthorizedPersonLastName,
              AuthorizedPersonForPromotingOrganisationGender:
                d.AuthorizedPersonGender,
              AuthorizedPersonForPromotingOrganisationDOB:
                d.AuthorizedPersonDOB,
              AuthorizedPersonForPromotingOrganisationAadharNo:
                d.AuthorizedPersonAadharNo,
              AuthorizedPersonForPromotingOrganisationMobileNo1:
                d.AuthorizedPersonMobileNo,
              AuthorizedPersonForPromotingOrganisationEMailID:
                d.AuthorizedPersonEmailID,
            }));
          };
        }
      },
    });
  };

  // Fetch Institute

  const getDetails = async () => {
    try {
      if (!profileId) return;

      SwalHelper.loading("Checking...");

      //  Approval Check
      const approvalResponse = await agent.get(
        `${GetApprovedInstituteId}?InstituteCode=${profileId}`,
      );

      const instituteId = approvalResponse.data?.Data;

      if (!instituteId) {
        SwalHelper.close();

        setShowStaffNotFound(true);
        return;
      }

      //  Existing SDI Application Check
      const existingResponse = await agent.get(
        `${CheckExistingInstituteSDIApplication}?InstituteID=${instituteId}`,
      );

      if (existingResponse.data?.Data?.length > 0) {
        SwalHelper.close();

        const popupMsg = existingResponse.data.Data[0].PopupMsg;
        SwalHelper.warning("Alert", popupMsg);

        return;
      }

      //  Fetch Institute Details
      const existResponse = await agent.get(
        `${IsInstituteExist}?InstituteID=${instituteId}`,
      );

      const instituteArray = existResponse.data?.Data;


      SwalHelper.close();

      if (!instituteArray || instituteArray.length === 0) {
        setShowStaffNotFound(true);
        return;
      }

      const instituteData = instituteArray[0];

      const mappedDetails = {
        fullData: instituteData,
        verified: instituteData.InstituteVerify === "V",
        promotingOrganization: {
          id: instituteData.PromotingOrganisationID,
          name: instituteData.PromotingOrganisationNameCode,
          verified: instituteData.IsProposedOrganisationVeify === "V",
        },
        representative: {
          id: instituteData.AuthorizedPersonName,
          primaryMobileNumber: instituteData.AuthorizedPersonMobileNo ?? "NA",
          verified: instituteData.IsStaffVeify === "V",
        },
      };

      showVerificationPopup({
        ...mappedDetails,
        originalData: instituteData,
      });
    } catch (error) {
      SwalHelper.close();
      setShowStaffNotFound(true);
    }
  };

  //  Savet

  const saveInstituteDraft = async () => {
    try {
      const payload = { ...instituteEntity, Status: "DRAFT" };

      const response = await agent.post(SaveInstituteDraft, payload);

      SwalHelper.success(
        "Draft Saved",
        response?.data?.Message || "Draft Saved Successfully",
      );
    } catch (error) {
    }
  };

  //  Submit

  const submitInstituteRegistration = async () => {
    const securityDetails = securityRef.current?.getSecurityDetails();
    const locationSource = details || promotingOrgLocation;

    

    // console.log(
    //   "InstituteID:",
    //   instituteEntity.InstituteID,
    //   typeof instituteEntity.InstituteID,
    // );

    // console.log(
    //   "PromotingOrgType:",
    //   instituteEntity.PromotingOrgType,
    //   typeof instituteEntity.PromotingOrgType,
    // );

    // console.log(
    //   "AuthorizedPersonDOB:",
    //   instituteEntity.AuthorizedPersonDOB,
    //   typeof instituteEntity.AuthorizedPersonDOB,
    // );

    // console.log(
    //   "AuthorizedPersonForPromotingOrganisationDOB:",
    //   instituteEntity.AuthorizedPersonForPromotingOrganisationDOB,
    //   typeof instituteEntity.AuthorizedPersonForPromotingOrganisationDOB,
    // );

    try {
      SwalHelper.loading("Submitting Registration...");

      const ip = await getDeviceIP();
      const promotingTypeMap = {
        'SOCIETY': 1,
        'TRUST': 2,
        'COMPANY': 3,
        'PROPRIETORSHIP': 4,
        'PARTNERSHIP': 5,
        'GOVERNMENTOFINDIA': 6,
        'GOVERNMENTOFINDIAUNDERTAKING': 7,
        'GOVERNMENTOFMAHARASHTRA': 8,
        'GOVERNMENTOFMAHARASHTRAUNDERTAKING': 9,
        'UNIVERSITY': 10,
        'OTHER(SPECIFY)': 11,
      };
      const formatDate = (dateStr) => {
        if (!dateStr) return null;

        const parts = dateStr.split("/");
        if (parts.length !== 3) return null;

        const [dd, mm, yyyy] = parts;

        return new Date(`${yyyy}-${mm}-${dd}T00:00:00`).toISOString();
      };

      const payload = {
        applicationFor: Number(instituteEntity.ApplicationFor),

        promotingOrgType:
          promotingTypeMap[
          instituteEntity.PromotingOrgType || details?.PromotingType
          ] || 0,

        promotingOrganisationID: Number(
          instituteEntity.PromotingOrganisationID,
        ),

        promotingOrgOthers: instituteEntity.PromotingOrgOthers || "",

        instituteStatusID: instituteEntity.PromotingOrganisationStatus || 0,

        instituteName: instituteEntity.InstituteName,

        skill: "Skill Development",

        isExistingInstitute: Number(instituteEntity.IsExistingInstitute),

        instituteID: instituteEntity.InstituteID
          ? Number(instituteEntity.InstituteID)
          : 0,

        establishmentDate: new Date().toISOString(),

        // ---------------- SDI REP ----------------

        authorizedPersonTitle: instituteEntity.AuthorizedPersonTitle,
        authorizedPersonFirstName: instituteEntity.AuthorizedPersonFirstName,
        authorizedPersonMiddleName: instituteEntity.AuthorizedPersonMiddleName,
        authorizedPersonLastName: instituteEntity.AuthorizedPersonLastName,
        authorizedPersonGender: instituteEntity.AuthorizedPersonGender,

        authorizedPersonDOB: formatDate(instituteEntity.AuthorizedPersonDOB),

        authorizedPersonAadharNo: instituteEntity.AuthorizedPersonAadharNo,
        authorizedPersonMobileNo1: instituteEntity.AuthorizedPersonMobileNo1,
        authorizedPersonMobileNo2: instituteEntity.AuthorizedPersonMobileNo2,
        eMailID: instituteEntity.EMailID,

        // ---------------- PROMOTING ORG REP ----------------

        authorizedPersonForPromotingOrganisationTitle:
          instituteEntity.AuthorizedPersonForPromotingOrganisationTitle ||
          instituteEntity.AuthorizedPersonTitle,

        authorizedPersonForPromotingOrganisationFirstName:
          instituteEntity.AuthorizedPersonForPromotingOrganisationFirstName ||
          instituteEntity.AuthorizedPersonFirstName,

        authorizedPersonForPromotingOrganisationMiddleName:
          instituteEntity.AuthorizedPersonForPromotingOrganisationMiddleName ||
          instituteEntity.AuthorizedPersonMiddleName,

        authorizedPersonForPromotingOrganisationLastName:
          instituteEntity.AuthorizedPersonForPromotingOrganisationLastName ||
          instituteEntity.AuthorizedPersonLastName,

        authorizedPersonForPromotingOrganisationGender:
          instituteEntity.AuthorizedPersonForPromotingOrganisationGender ||
          instituteEntity.AuthorizedPersonGender,

        authorizedPersonForPromotingOrganisationDOB: formatDate(
          instituteEntity.AuthorizedPersonForPromotingOrganisationDOB ||
          instituteEntity.AuthorizedPersonDOB,
        ),

        authorizedPersonForPromotingOrganisationAadharNo:
          instituteEntity.AuthorizedPersonForPromotingOrganisationAadharNo ||
          instituteEntity.AuthorizedPersonAadharNo,

        authorizedPersonForPromotingOrganisationMobileNo1:
          instituteEntity.AuthorizedPersonForPromotingOrganisationMobileNo1 ||
          instituteEntity.AuthorizedPersonMobileNo1,

        authorizedPersonForPromotingOrganisationMobileNo2:
          instituteEntity.AuthorizedPersonForPromotingOrganisationMobileNo2 ||
          instituteEntity.AuthorizedPersonMobileNo2,

        authorizedPersonForPromotingOrganisationEMailID:
          instituteEntity.AuthorizedPersonForPromotingOrganisationEMailID ||
          instituteEntity.EMailID,

        // ---------------- LOCATION (REQUIRED) ----------------

        // stateID: details?.CollegeStateID || 0,
        // districtID: details?.CollegeDistrictID || 0,
        // talukaID: details?.CollegeTalukaID || 0,
        // ddlCity: details?.CITYID || 0,
        stateID: locationSource?.CollegeStateID || locationSource?.stateID || 0,
        districtID: locationSource?.CollegeDistrictID || locationSource?.districtID || 0,
        talukaID: locationSource?.CollegeTalukaID || locationSource?.talukaID || 0,
        ddlCity: locationSource?.CITYID || locationSource?.cityID || 0,
        otherCity: "",

        exInstStateID: details?.CollegeStateID || 0,
        exInstDistrictID: details?.CollegeDistrictID || 0,
        exInstTalukaID: details?.CollegeTalukaID || 0,
        exInstddlCity: details?.CITYID || 0,
        exInstOtherCity: "",
        exInstPincode: details?.CollegePincode || "",
        // exInstStateID: locationSource?.CollegeStateID || locationSource?.stateID || 0,
        // exInstDistrictID: locationSource?.CollegeDistrictID || locationSource?.districtID || 0,
        // exInstTalukaID: locationSource?.CollegeTalukaID || locationSource?.talukaID || 0,
        // exInstddlCity: locationSource?.CITYID || locationSource?.cityID || 0,
        // exInstPincode: locationSource?.CollegePincode || locationSource?.pincode || "",

        // ---------------- SECURITY ----------------

        securityQuestionID: securityDetails?.securityQuestionId,
        securityQuestionAnswer: securityDetails?.securityAnswer,

        authorizedPersonUserLoginID:
          instituteEntity.AuthorizedPersonAadharNo || "",

        authorizedPersonForPromotingOrganisationUserLoginID:
          instituteEntity.AuthorizedPersonForPromotingOrganisationAadharNo ||
          instituteEntity.AuthorizedPersonAadharNo ||
          "",
        password: securityDetails?.password,

        userLoginID: "SYSTEM",
        ipAddress: ip,
        pageCode: "InstituteRegistration",
      };



      const response = await agent.post(SubmitInstituteRegistration, payload);


      const generatedLoginId = response?.data?.Data;


      SwalHelper.close();

      if (response?.data?.Status !== "Success") {
        SwalHelper.error(
          "Registration Failed",
          response?.data?.Message || "Something went wrong",
        );
        return;
      }

      SwalHelper.success(
        "Institute Registered Successfully",
        response?.data?.Message || "Registration Completed",
      ).then(() => {
        navigate("/after-register", {
          state: { profileId: generatedLoginId },
        });
      });
    } catch (error) {
      SwalHelper.close();

      SwalHelper.error("Error", error?.response?.data || "Registration failed");
    }
  };

  const handleOtpSuccess = async () => {
    await submitInstituteRegistration();
  };

  const otpService = OTPService({
    mobileNo:
      instituteEntity?.AuthorizedPersonMobileNo1 ||
      instituteEntity?.AuthorizedPersonForPromotingOrganisationMobileNo1,
    purpose: "SDI Registration",
    isVerifyRequired: true,
    onSuccess: handleOtpSuccess,
  });

  if (registrationAllowed !== true) {
    return null;
  }

  return (
    <>
      {showErrors && (
        <ErrorListPopup
          fields={errorFields}
          onClose={() => setShowErrors(false)}
        />
      )}

      <fieldset className="pt-6 m-4 border-t-2 shadow-2xl border-gray-100 rounded-xl">
        <ModeSelector
          mode={mode}
          setMode={setMode}
          setInstituteEntity={setInstituteEntity}
        />

        {mode === "existing" && (
          <ExistingInstituteForm
            profileId={profileId}
            setProfileId={setProfileId}
            getDetails={getDetails}
            details={details}
            setInstituteEntity={setInstituteEntity}
          />
        )}

        {mode === "new" && (
          <NewInstituteForm
            newInstitute={newInstitute}
            setNewInstitute={setNewInstitute}
            show={showReservedPopup}
            setShow={setShowReservedPopup}
            setInstituteEntity={setInstituteEntity}
            reservedKeywords={ignoreWords}
          />
        )}

        <PromotingOrganizationDetails
          key={`promoting-${mode}`}
          InstituteDetails={details}
          isExisting={mode}
          setInstituteEntity={setInstituteEntity}
          setPromotingRepData={setPromotingRepData}
          setPromotingOrgLocation={setPromotingOrgLocation}
          isModeSelected={isModeSelected}
        />
      </fieldset>

      <AuthorizedRepresentativeofSkillDevelopmentInstitute
        key={`rep-${mode}`}
        InstituteDetails={details}
        setInstituteEntity={setInstituteEntity}
        promotingRepData={promotingRepData}
        isModeSelected={isModeSelected}
      />

      <div className="mx-4 mt-6 bg-white shadow-xl rounded-[5px] p-6">
        <SecurityQuestion ref={securityRef} />
      </div>

      <div className="m-8 p-6 space-y-6">
        <div className="flex justify-center">
          <CaptchaComponent ref={captchaRef} />
        </div>

        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => validateAndSubmit()}
            className="bg-[#188654] px-6 py-2 rounded text-white font-semibold"
          >
            Register Institute
          </button>

          <button
            type="button"
            onClick={saveInstituteDraft}
            className="bg-[#DC3545] px-6 py-2 rounded text-white font-semibold"
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}

export default SDIRegistrationPage;
