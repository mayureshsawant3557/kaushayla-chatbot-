import { useContext, useEffect, useState } from "react";
import {
  GetPromoterDetailsByInstituteID,
  GetProposedCourseUnitDetails,
  SaveLOIStatus,
} from "../../../Endpoints_All/Base/Institute";
import {
  CheckLOIGenerated,
  GetProposedInstituteStatus,
} from "../../../Endpoints_All/Institute/institute";
import agent from "../../../lib/api/agent";
import { getDeviceIP } from "../../../utils/CommonHelper";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import Button from "../../base/Button";
import LOIConfirmationPopup from "../../formcomponent/LOIConfirmationPopup";
import OTPService from "../../formcomponent/OTPService";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { useAuth } from "../../../Hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
import { ThemeContext } from "../../Context/ThemeContext";
import { useNoticePopup } from "../../../Component/formcomponent/NoticePop";

const LOIGeneration = () => {
  const tableColumns = [
    {
      key: "SrNo",
      header: "Sr.No.",
      sortable: true,
      width: "70px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "CourseWithCourseCode",
      header: "Course",
      sortable: true,
      width: "400px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "ApprovedUnits",
      header: "Approved Units (A)",
      sortable: true,
      width: "120px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "LOIProposedUnits",
      header: "LOI Units (B)",
      sortable: true,
      width: "100px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "TotalUnits",
      header: "Total Units (C=A+B)",
      sortable: true,
      width: "100px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "InspectionFee",
      header: "Inspection Fee",
      sortable: true,
      width: "130px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "SecurityDeposit",
      header: "Security Deposit",
      sortable: true,
      width: "140px",
      headerClassName: "text-center",
      className: "text-center",
    },
  ];

  const { t, i18n } = useTranslation("contact");
  const { userInfo } = useAuth();
  const [ipAddress, setIpAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [mobileNo, setMobileNo] = useState("");
  const [proposedInstituteData, setProposedInstituteData] = useState({});
  const [instituteID, setInstituteID] = useState(0);
  const [instituteLoginID, setInstituteLoginID] = useState("");
  const [isLoIGenerated, setIsLoIGenerated] = useState(false);
  const [popupMode, setPopupMode] = useState("submit");
  const navigate = useNavigate();
  const userType = Number(userInfo?.UserTypeID);
  const isSecretary = userType === 81;
  const [instituteId, setInstituteId] = useState(null);
  const [isLoIIssued, setIsLoIIssued] = useState(false);
  const { color } = useContext(ThemeContext);

  const { showNoticePopup } = useNoticePopup();

  useEffect(() => {
    setIsOtpVerified(false);
    initializeComponent();
  }, []);

  useEffect(() => {
    showNoticePopup({
      title: "सूचना",
      icon: null,
      width: 1200,
      content: [
        {
          text: "1. संस्था एका वेळी १ युनिटमध्ये ३० विद्यार्थ्यांची फक्त १ बॅच चालवू शकते.",
        },
        {
          text: "2. संस्था एकाच प्रशिक्षण पायाभूत सुविधांचा (Training Infrastructure) वापर करून वेगवेगळ्या युनिट्सच्या अनेक बॅचेस शिफ्टमध्ये चालवू शकते.",
        },
        {
          text: "3. प्रतिदिन कमाल बॅचेस (Max. batches per day): शिफ्टमध्ये प्रतिदिन चालविता येणाऱ्या अनेक युनिट्सच्या बॅचेसची कमाल संख्या दर्शविते.",
        },
        {
          text: "4. आवश्यक कमाल प्रशिक्षण सेटअप्स (Max Training setups required): शिफ्टमध्ये अनेक बॅचेस चालविण्यासाठी संस्थेत आवश्यक असलेल्या प्रशिक्षण सेटअप्सची कमाल संख्या दर्शविते.",
        },
        {
          text: "5. उदाहरणार्थ:",
        },
        {
          text: "a) पूर्णवेळ पदविका अभ्यासक्रमांसाठी (Full Time Diploma Course), संस्था २ शिफ्टमध्ये दररोज ७ तासांप्रमाणे २ युनिट्सच्या कमाल २ बॅचेस चालवू शकते आणि त्यासाठी फक्त १ प्रशिक्षण सेटअप आवश्यक असेल. तिसऱ्या युनिटच्या तिसऱ्या बॅचसाठी अतिरिक्त प्रशिक्षण सेटअप आवश्यक असून, ३ युनिट्सच्या ३ बॅचेससाठी एकूण २ प्रशिक्षण सेटअप्स लागतील.",
          className: "ml-3",
        },
        {
          text: "b) अर्धवेळ / अल्पमुदत प्रमाणपत्र अभ्यासक्रमासाठी (Part Time / Short Term Certificate Course), संस्था प्रतिदिन प्रशिक्षण तासांनुसार अनेक युनिट्सच्या ४ ते ८ बॅचेस प्रतिदिन चालवू शकते आणि त्यासाठी फक्त १ प्रशिक्षण सेटअप आवश्यक असेल.",
          className: "ml-3",
        },

        {
          text: "6. सर्व प्रशिक्षण पायाभूत सुविधांची गणना निरिक्षण युनिट्सच्या (Inspection Units) आधारे केली जाईल.",
        },
        {
          text: "7. संस्थेने उपलब्ध प्रशिक्षण सेटअप्सनुसार निरिक्षण युनिट्स (Inspection Units) नमूद करणे आवश्यक आहे.",
        },
        {
          text: "8. सदर वेब पेजवरील तक्त्यात दर्शविलेले निरिक्षण शुल्क व सुरक्षा अनामत रक्कम (Security Deposit) केवळ नव्याने प्रस्तावित युनिट्सच्या (newly Proposed Units) आधारे गणना केलेली आहे.",
        },
      ],
      confirmText: "OK",
    });
  }, [showNoticePopup]);

  function getHashCode(str) {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
  const getInstituteIdFromQueryString = () => {
    const searchParams = new URLSearchParams(location.search);
    const p1 = searchParams.get("P1");
    const p2 = searchParams.get("P2");

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
  const getInstituteId = () => {
    if (userType === 81) {
      const p1 = new URLSearchParams(window.location.search).get("P1");
      return p1 ? parseInt(p1) : 0;
    }
    return userInfo?.UserID || 0;
  };
  const initializeComponent = async () => {
    await fetchIP();
    await getCourseUnitDetails();
    await GetProposedInstituteDetails();
  };
  String.prototype.getHashCode = function () {
    let hash = 0;
    if (this.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
      const char = this.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  };

  const getCourseUnitDetails = async () => {
    const loginID = userInfo?.UserLoginID || "";
    const instituteId = getInstituteId();
    setInstituteID(userInfo?.UserID || 0);
    setInstituteLoginID(userInfo?.UserLoginID || "");

    if (!loginID && !instituteId) {
      return;
    }

    setLoading(true);

    const payload = {
      instituteId: instituteId,
      exitInstituteID: 0,
      userLoginID: loginID,
      pageCode: "LOIGeneration",
      itemId: 0,
      ipAddress: ipAddress,
    };

    try {
      const response = await agent.post(
        `${GetProposedCourseUnitDetails}`,
        payload,
      );

      if (response.data?.Status === "Success" && response.data?.Data?.Table) {
        const coursesArray = response.data.Data.Table;
        setCourseData(coursesArray);
      }
      await checkLoIStatus(instituteId);
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  const GetProposedInstituteDetails = async () => {
    const loginID = userInfo?.UserLoginID || "";
    const instituteId = getInstituteId();
    if (!loginID && !instituteId) {
      return;
    }

    const response = await agent.get(
      `${GetProposedInstituteStatus}/${instituteId}`,
    );
    if (response.data?.Status === "Success" && response.data?.Data) {
      setProposedInstituteData(response?.data?.Data || {});
      if (response?.data?.Data?.ISLetterOfIntentIssued === "Y") {
        setIsLoIIssued(true);
      }
    }
  };
  const tableData = courseData.map((course, index) => ({
    ...course,
    SrNo: index + 1,
    LOIProposedUnits: Number(course.LOIProposedUnits) || 0,

    TotalUnits:
      (Number(course.ApprovedUnits) || 0) +
      (Number(course.LOIProposedUnits) || 0),
  }));

  const lastRow = {
    SrNo: courseData.length + 1,
    CourseWithCourseCode: "Total",
    ApprovedUnits: courseData.reduce(
      (sum, item) => sum + (Number(item.ApprovedUnits) || 0),
      0,
    ),
    LOIProposedUnits: courseData.reduce(
      (sum, item) => sum + (Number(item.LOIProposedUnits) || 0),
      0,
    ),
    TotalUnits: courseData.reduce(
      (sum, item) =>
        sum +
        ((Number(item.ApprovedUnits) || 0) +
          (Number(item.LOIProposedUnits) || 0)),
      0,
    ),
    InspectionFee: courseData.reduce(
      (sum, item) => sum + (Number(item.InspectionFee) || 0),
      0,
    ),
    SecurityDeposit: courseData.reduce(
      (sum, item) => sum + (Number(item.SecurityDeposit) || 0),
      0,
    ),
  };

  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
    } catch (err) {
      console.error("Failed to get IP:", err);
    }
  };

  const handleLOISubmission = () => {
    if (courseData.length === 0) {
      Swal.fire({
        icon: "error",
        title: t("No Data Available"),
        text: t("No course data available to submit."),
      });
      return;
    }
    setPopupMode("submit");
    setShowConfirmationPopup(true);
  };
  const handleWithdrawLOI = () => {
    setPopupMode("withdraw");
    setShowConfirmationPopup(true);
  };
  const otpService = OTPService({
    mobileNo: mobileNo,
    purpose: "VerifyMobileNo",
    isVerifyRequired: true,
    messege: t("OTP verification required"),
    isDuplicateCheck: false,

    onSuccess: async () => {
      setIsOtpVerified(true);
      try {
        const loginID = userInfo?.UserLoginID || "";

        const LOIPayload = {
          instituteId: userInfo?.UserID || 0,
          exitInstituteID: 0,
          userLoginID: loginID,
          pageCode: "LOIGeneration",
          itemId: popupMode === "withdraw" ? "R" : "0",
          ipAddress: ipAddress,
        };

        const saveLOIResponse = await agent.post(
          `${SaveLOIStatus}`,
          LOIPayload,
        );

        if (saveLOIResponse.data?.Status === "Success") {
          Swal.fire({
            icon: "success",
            title: t(popupMode === "withdraw" ? "Withdrawn" : "Submitted"),
            text: t(
              popupMode === "withdraw"
                ? "Application for Letter of Intent withdrawn successfully."
                : "Application for Letter of Intent submitted successfully.",
            ),
            showConfirmButton: true,
            confirmButtonText: t("OK"),
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              saveLOIResponse.data?.Message || `Failed to ${popupMode} LOI.`,
          });
        }
        await checkLoIStatus(LOIPayload.instituteId);
      } catch (saveError) {
        console.error("Error saving LOI status:", saveError);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `OTP verified but LOI ${popupMode} failed. Please try again.`,
        });
      }
    },

    onError: (error) => {
      Swal.fire({
        title: t("Verification Failed"),
        text: error.message || t("OTP verification failed"),
        icon: "error",
        showCancelButton: true,
        cancelButtonText: t("Cancel"),
      });
    },
  });
  const printLOI = () => {
    if (!instituteID) {
      return;
    }
    const popupWidth = 1000;
    const popupHeight = 750;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;
    window.open(
      `${window.location.origin}/React/PrintLOI?P1=${instituteID}&P2=${userInfo?.UserLoginID || ""}`,
      "LetterOfIntent",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );
  };
  const generateOtpAndSubmitLOI = async () => {
    const loginID = userInfo?.UserLoginID || "";
    const instituteId = getInstituteId();

    try {
      const payload = {
        instituteId: instituteId,
        exitInstituteID: 0,
        userLoginID: loginID,
        pageCode: "LOIGeneration",
        itemId: "0",
        ipAddress: ipAddress,
      };

      const response = await agent.post(
        `${GetPromoterDetailsByInstituteID}`,
        payload,
      );

      let mobile = "";
      if (
        response.data?.Status === "Success" &&
        response.data?.Data?.length > 0
      ) {
        const promoterDetails = response.data.Data[0];
        mobile = promoterDetails.MobileNo;
      }

      if (!mobile) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Mobile number not found. Please contact administrator.",
        });
        return;
      }

      setMobileNo(String(mobile));

      // Only trigger OTP — SaveLOIStatus will fire inside onSuccess
      await otpService.startVerification(String(mobile));
    } catch (error) {
      console.error("Error generating OTP or submitting LOI:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  const openPopup = () => {
    const hashid = btoa(String(instituteID));
    const popupWidth = 1000;
    const popupHeight = 750;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;
    window.open(
      `${window.location.origin}/React/LOIApplicationPrintForm?P1=${instituteID}&P2=${hashid}`,
      "LOIApplicationPrintForm",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );
  };

  const checkLoIStatus = async (instituteId) => {
    if (!instituteId) return;

    const payload = {
      instituteId: instituteId,
      exitInstituteID: 0,
      userLoginID: userInfo?.UserLoginID || "",
      pageCode: "LOIGeneration",
      itemId: 0,
      ipAddress: ipAddress,
    };

    const response = await agent.post(`${CheckLOIGenerated}`, payload);
    if (response.data?.Status === "Success") {
      setIsLoIGenerated(response?.data?.Data || false);
    }
  };
  const handleWithdrawConfirmed = async () => {
    const loginID = userInfo?.UserLoginID || "";
    const instituteId = getInstituteId();

    try {
      const payload = {
        instituteId: instituteId,
        exitInstituteID: 0,
        userLoginID: loginID,
        pageCode: "LOIGeneration",
        itemId: "0",
        ipAddress: ipAddress,
      };

      const response = await agent.post(
        `${GetPromoterDetailsByInstituteID}`,
        payload,
      );

      let mobile = "";
      if (
        response.data?.Status === "Success" &&
        response.data?.Data?.length > 0
      ) {
        mobile = response.data.Data[0].MobileNo;
      }

      if (!mobile) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Mobile number not found. Please contact administrator.",
        });
        return;
      }

      setMobileNo(String(mobile));
      await otpService.startVerification(String(mobile));
    } catch (error) {
      console.error("Error generating OTP for withdrawal:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  const handleBack = () => {
    const id =
      instituteId || getInstituteIdFromQueryString?.() || getInstituteId();

    if (userInfo?.UserTypeID === 81) {
      if (id) {
        navigate(
          `/Institute/SelfDeclaration?P1=${id}&P2=${String(id).getHashCode()}`,
        );
      } else {
        navigate(`/Institute/SelfDeclaration`);
      }
    } else {
      window.history.back();
    }
  };

  const handleClose = () => {
    const instituteId = getInstituteId();

    if (isSecretary) {
      navigate(
        `/InstituteDash?P1=${instituteId}&P2=${String(instituteId).getHashCode()}`,
      );
    } else {
      navigate("/tinstitute/dashboard");
    }
  };
  if (!userInfo) return null;
  return (
    <div className="w-full p-4">
      {showConfirmationPopup && (
        <LOIConfirmationPopup
          isOpen={showConfirmationPopup}
          onClose={() => setShowConfirmationPopup(false)}
          mode={popupMode}
          onConfirm={() => {
            if (popupMode === "submit") {
              generateOtpAndSubmitLOI();
            } else {
              handleWithdrawConfirmed();
            }
            setShowConfirmationPopup(false);
          }}
        />
      )}
      <fieldset className="mb-4 rounded-md border p-4">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          <span>Application for Letter of Intent (LoI)</span>
        </legend>
        {!isLoIGenerated ? (
          <div className="pb-3 pt-3">
            <div style={{ overflowX: "auto", width: "100%" }}>
              <div style={{ minWidth: "1000px" }}>
                <FilteredTableComponent
                  data={[...tableData, lastRow]}
                  columns={tableColumns ?? []}
                  filterColumns={["CourseWithCourseCode"]}
                  searchable={true}
                  sortable={true}
                  showExcelTemplate={false}
                  exportable={true}
                  showSearch={true}
                  showExport={true}
                  className="mt-2"
                  //renderCell={renderCell}
                  maxHeight="500px"
                  stickyHeader={true}
                  loading={loading}
                />
              </div>
            </div>
            {!isSecretary && !isLoIGenerated && (
              <div className="pb-3 pt-3 bg-cyan-100 rounded-sm text-cyan-900 text-sm">
                <span className="p-2 m-2 font-semibold">Note:</span>
                <ol className="list-decimal list-inside pl-8">
                  <li className="pb-2">
                    Click on "Application for Letter of Intent (LoI)" to submit
                    your application.
                  </li>
                  <li className="pb-2">
                    Once Application for Letter of Intent (LoI) is submitted,
                    the information on previous pages shall be locked.
                  </li>
                  <li className="pb-2">
                    Application shall be forwarded to Secretary, Maharashtra
                    State Board of Skill, Vocational Education and Training for
                    verification and approval.
                  </li>
                  <li className="pb-2">
                    Applicant can Withdraw Application for Letter of Intent
                    (LoI) and edit information.
                  </li>
                  <li className="pb-2">
                    Applicant cannot Withdraw Application for Letter of Intent
                    (LoI) after Letter of Intent (LoI) is issued.
                  </li>
                  <li className="pb-2">
                    Once verified and approved, Letter of Intent (LoI) shall be
                    issued online and Authorized Representative of Training
                    Institute shall be informed through SMS.
                  </li>
                  <li className="pb-2">
                    Applicant may contact Board Helpline for any assistance.
                  </li>
                </ol>
              </div>
            )}

            <hr className="pt-3 border-b-gray-300" />
            <div className="flex justify-center items-center gap-4">
              <Button variant="primary" onClick={handleBack}>
                Back
              </Button>

              {!isSecretary && (
                <Button variant="success" onClick={handleLOISubmission}>
                  Application for Letter of Intent (LoI)
                </Button>
              )}

              {isSecretary && (
                <Button
                  variant="success"
                  onClick={() => {
                    const instituteId = getInstituteId();
                    navigate(
                      `/InstituteDash?P1=${instituteId}&P2=${String(instituteId).getHashCode()}`,
                    );
                  }}
                >
                  Save & Next
                </Button>
              )}
              <Button variant="danger" onClick={handleClose}>
                close
              </Button>
            </div>
          </div>
        ) : (
          <div className="pb-3 pt-3">
            <div style={{ overflowX: "auto", width: "100%" }}>
              <div style={{ minWidth: "1000px" }}>
                <FilteredTableComponent
                  data={[...tableData, lastRow]}
                  columns={tableColumns ?? []}
                  filterColumns={["CourseWithCourseCode"]}
                  searchable={true}
                  sortable={true}
                  showExcelTemplate={false}
                  exportable={true}
                  showSearch={true}
                  showExport={true}
                  className="mt-2"
                  //renderCell={renderCell}
                  maxHeight="500px"
                  stickyHeader={true}
                  loading={loading}
                />
              </div>
            </div>
            {!isSecretary && !isLoIIssued && (
              <div className="pb-3 pt-3 bg-red-100 rounded-sm text-red-900 text-sm">
                <span className="p-2 m-2 font-semibold">Note:</span>
                <ol className="list-decimal list-inside pl-8">
                  <li className="pb-2">
                    Application for Letter of Intent (LoI) is submitted.
                  </li>
                  <li className="pb-2">
                    Application has been forwarded to Secretary, Maharashtra
                    State Board of Skill, Vocational Education and Training for
                    verification.
                  </li>
                  <li className="pb-2">
                    Applicant can Withdraw Application for Letter of Intent
                    (LoI) and edit information.
                  </li>
                  <li className="pb-2">
                    Applicant cannot Withdraw Application for Letter of Intent
                    (LoI) after Letter of Intent (LoI) is issued.
                  </li>
                  <li className="pb-2">
                    Once verified and approved, Letter of Intent (LoI) shall be
                    issued online and Authorized Representative of Training
                    Institute shall be informed through SMS.
                  </li>
                  <li className="pb-2">
                    Applicant may contact Board Helpline for any assistance.
                  </li>
                </ol>
              </div>
            )}

            <div className="flex justify-start items-center gap-4 mt-3 mb-3">
              {!isSecretary && (
                <Button variant="primary" onClick={openPopup}>
                  LoI Application
                </Button>
              )}
              {!isSecretary && isLoIIssued && (
                <Button variant="success" onClick={printLOI}>
                  <FaPrint className="inline-block ml-2" />
                  Letter of Intent (LoI)
                </Button>
              )}
            </div>
            {isLoIIssued && (
              <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span>
                </p>

                <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
                  <li>
                    Institute can run only 1 Batch of 30 students in 1 Unit at a
                    time.
                  </li>
                  <li>
                    Institute can run multiple batches of different Units in
                    shifts with the same training infrastructure.
                  </li>
                  <li>
                    Max. batches per day: Indicates maximum number of batches of
                    multiple Units in shifts per day.
                  </li>
                  <li>
                    Max Training setups required: Indicates the maximum number
                    of training setups required in institute to run multiple
                    batches in shifts.
                  </li>

                  <li>
                    For example:
                    <ol className="list-[lower-alpha] list-inside ml-4 mt-1 space-y-1">
                      <li>
                        For a Full Time Diploma Course, the Institute can run a
                        maximum of 2 batches of 2 Units for 7 hours per day in 2
                        shifts and shall require only 1 training setup. For the
                        3rd batch of the 3rd Unit, an additional training setup
                        is required, making a total of 2 training setups for 3
                        batches of 3 Units.
                      </li>
                      <li>
                        For a Part Time / Short Term Certificate Course, the
                        Institute can run 4 to 8 batches per day of multiple
                        Units depending on per-day training hours and shall
                        require only 1 training setup.
                      </li>
                    </ol>
                  </li>

                  <li>
                    All training infrastructure shall be calculated based on the
                    Inspection Units.
                  </li>
                  <li>
                    Institute has to enter Inspection Units depending upon the
                    available training setups.
                  </li>

                  <li>
                    Inspection Fees and Security Deposit displayed in the above
                    table is calculated based on newly Proposed Units only.
                  </li>
                </ol>
              </div>
            )}

            <hr className="pt-3 border-b-gray-300" />
            <div className="flex justify-center items-center gap-4">
              <Button variant="primary" onClick={handleBack}>
                Back
              </Button>
              {!isSecretary && !isLoIIssued && (
                <Button variant="danger" onClick={handleWithdrawLOI}>
                  Withdraw Application for Letter of Intent (LoI)
                </Button>
              )}

              {isSecretary && (
                <Button
                  variant="success"
                  onClick={() => {
                    const instituteId = getInstituteId();
                    navigate(
                      `/InstituteDash?P1=${instituteId}&P2=${String(instituteId).getHashCode()}`,
                    );
                  }}
                >
                  Save & Next
                </Button>
              )}
              <Button variant="light" onClick={handleClose}>
                close
              </Button>
            </div>
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default LOIGeneration;
