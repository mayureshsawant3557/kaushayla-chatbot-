import React, { useState, useEffect, useRef, useContext } from "react";
import { useAuth } from "../../../Hooks/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import agent from "../../../lib/api/agent";
import useLoading from "../../../Hooks/useLoading";
import Swal from "sweetalert2";
import Button from "../../base/Button";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import UploadPdf from "../../formcomponent/UploadPdf";
import { ThemeContext } from "../../Context/ThemeContext";
import { getDeviceIP } from "../../../utils/CommonHelper";

const SelfDeclaration = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { startLoading, stopLoading, isLoading } = useLoading();

  const [instituteId, setInstituteId] = useState(null);
  const [isEditAllowed, setIsEditAllowed] = useState(true);
  const [isDeclarationUploaded, setIsDeclarationUploaded] = useState(false);
  const [declarationPath, setDeclarationPath] = useState("");
  const [wordTemplatePath, setWordTemplatePath] = useState("");
  const [mhActPath, setMhActPath] = useState("");
  const [mhActText, setMhActText] = useState("");
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isUploadEnabled, setIsUploadEnabled] = useState(false);
  const [uploadedFileData, setUploadedFileData] = useState(null);

  const [showVerificationUI, setShowVerificationUI] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [existingStatus, setExistingStatus] = useState("");
  const [existingRemark, setExistingRemark] = useState("");
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const [ipAddress, setIpAddress] = useState("");

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationRemark, setVerificationRemark] = useState("");
  const [showDownloadSection, setShowDownloadSection] = useState(false);
  const [showUnauthorizedPage, setShowUnauthorizedPage] = useState(false);
  const { color } = useContext(ThemeContext);

  const userType = userInfo?.UserTypeID || userInfo?.UserTypeID;

  const getHashCode = (str) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
    } catch (err) {
      console.error("Failed to get IP:", err);
    }
  };

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

  const getInstituteIdByUserType = async () => {
    try {
      let id = null;

      if (userType === 61 || userType === 64) {
        const response = await agent.get(
          `${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo?.UserLoginID}`,
        );
        id = response.data?.Data;
      } else {
        id =
          getInstituteIdFromQueryString() ||
          location.state?.instituteId ||
          sessionStorage.getItem("instituteId");
      }

      return id ? parseInt(id) : null;
    } catch (error) {
      console.error("Error getting institute ID:", error);
      return null;
    }
  };

  const checkEligibilityToEdit = async (instId) => {
    try {
      const payload = {
        InstituteId: instId,
        UserLoginID: userInfo?.UserLoginID,
        PageCode: "SelfDeclaration",
        ipAddress: ipAddress,
      };

      const response = await agent.post("/Base/IsEditingAllowed", payload);

      if (response.data?.Data) {
        const data = response.data.Data[0];
        const isEdit = data?.IsEditAllowed;
        const remarks = data?.Remarks;

        setIsEditAllowed(isEdit);

        if (!isEdit && userType !== 81) {
          Swal.fire({
            icon: "warning",
            title: "Info",
            text: remarks || "Editing not allowed",
            timer: 3000,
            showConfirmButton: false,
          });
        }
      }
    } catch (error) {
      console.error("Error checking edit eligibility:", error);
      setIsEditAllowed(true);
    }
  };
  const handleViewDocument = () => {
    if (declarationPath) {
      window.open(declarationPath, "_blank");
    } else {
      Swal.fire({
        icon: "warning",
        title: "No Document",
        text: "No undertaking has been uploaded yet.",
        confirmButtonColor: "#0066ff",
      });
    }
  };
  const loadSelfDeclaration = async (instId) => {
    try {
      const payload = {
        instituteId: instId,
        exitInstituteID: 0,
        userLoginID: userInfo?.UserLoginID || "string",
        pageCode: "SelfDeclaration",
        itemId: "0",
        ipAddress: ipAddress,
      };

      const response = await agent.post(
        "/api/InstituteBase/GetSelfDeclarationPath",
        payload,
      );

      if (
        response.data &&
        response.data.Data &&
        response.data.Data.length > 0
      ) {
        const data = response.data.Data[0]; // Access first element of array

        if (
          data.SelfDeclarationPath &&
          data.SelfDeclarationPath.trim() !== ""
        ) {
          setDeclarationPath(data.SelfDeclarationPath);
          setIsDeclarationUploaded(true);
          setIsConsentChecked(true);
          setUploadedFileData({
            filePath: data.SelfDeclarationPath,
            fileName: "Self Declaration Document",
          });
        }

        if (
          data.UndertakingWordTemplatePath &&
          data.UndertakingWordTemplatePath.trim() !== ""
        ) {
          setWordTemplatePath(data.UndertakingWordTemplatePath);
        }

        if (data.MHActPath && data.MHActPath.trim() !== "") {
          setMhActPath(data.MHActPath);
          setMhActText(data.MHActText || "Download MH Act");
        }

        if (!isEditAllowed && userType !== 81) {
          setIsUploadEnabled(false);
        } else {
          setIsUploadEnabled(isConsentChecked);
        }

        if (userType === 81) {
          setIsConsentChecked(true);
          setIsUploadEnabled(true);
        }
      }

      if (userType !== 81) {
        const statusResponse = await agent.get(
          `/api/InstituteBase/GetProposedInstituteStatus/${instId}`,
        );
        if (statusResponse.data && statusResponse.data.Data) {
          const statusData = statusResponse.data.Data;
          setVerificationStatus(statusData.IsSelfDeclaration);
          setVerificationRemark(statusData.SelfDeclarationRemark);
        }
      }
      if (userType === 81) {
        try {
          const dashResponse = await agent.get(
            `/api/InstituteBase/GetInstituteDash`,
            {
              params: {
                InstituteID: instId,
                InstituteCode: userInfo?.UserLoginID || "",
              },
            },
          );

          const table1 = dashResponse.data?.Table1 || [];

          const selfDeclRow = table1.find((item) => item.Seqno === 6);

          if (selfDeclRow) {
            const existingStatusValue = selfDeclRow.PageStatus || "";
            const existingRemarkValue = selfDeclRow.Remark || "";

            setExistingStatus(existingStatusValue);
            setExistingRemark(existingRemarkValue);
            setApprovalStatus(existingStatusValue);
            setRejectReason(existingRemarkValue);

            if (existingStatusValue === "V") {
              setIsAlreadyVerified(true);
            }
          }
        } catch (error) {
          console.error("Error fetching institute dash:", error);
        }
      }
    } catch (error) {
      console.error("Error loading self declaration:", error);
      Swal.fire("Error", "Failed to load self declaration details.", "error");
    }
  };

  const handleFileUpload = async (fileData) => {
    setUploadedFileData(fileData);

    startLoading();
    try {
      const payload = {
        InstituteId: instituteId,
        SelfDeclarationPath: fileData?.filePath,
        UserLoginID: userInfo?.UserLoginID || "",
        IPAddress: ipAddress,
        PageCode: "SelfDeclaration",
      };

      const formData = new FormData();
      formData.append("file", fileData.file);
      formData.append("request", JSON.stringify(payload));

      const response = await agent.post(
        "/api/InstituteBase/SaveSelfDeclarationPath",
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data?.Status === "Success") {
        Swal.fire(
          "Success",
          "Self declaration uploaded successfully.",
          "success",
        );
        await loadSelfDeclaration(instituteId);
      } else {
        Swal.fire(
          "Error",
          response.data?.Message || "Failed to upload file.",
          "error",
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire(
        "Error",
        error.response?.data?.title || "Failed to upload file.",
        "error",
      );
    } finally {
      stopLoading();
    }
  };
  const handleConsentChange = (checked) => {
    setIsConsentChecked(checked);
    if (checked && isEditAllowed) {
      setIsUploadEnabled(true);
    } else {
      setIsUploadEnabled(false);
    }
  };

  const handleProceed = async () => {
    if (userType === 81) {
      if (!approvalStatus) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Please select Approved / Reject status",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
      if (approvalStatus === "R" && !rejectReason.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Please enter a reason for rejection",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      startLoading();
      try {
        const payload = {
          instituteID: instituteId,
          remark: rejectReason?.toUpperCase() || "",
          status: approvalStatus,
          pageCode: "SelfDeclaration",
          createdBy: userInfo?.UserLoginID,
          ipAddress: ipAddress,
        };

        const response = await agent.post(
          "/api/InstituteBase/update-verification-status",
          payload,
        );

        if (response.data?.success) {
          // Swal.fire("Success", "Status updated successfully", "success");
          await loadSelfDeclaration(instituteId);
          const hash = getHashCode(instituteId.toString());

          navigate(`/Institute/LOIGeneration?P1=${instituteId}&P2=${hash}`);
        } else {
          Swal.fire(
            "Error",
            response.data?.message || "Update failed",
            "error",
          );
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Something went wrong", "error");
      } finally {
        stopLoading();
      }
    } else {
      const hash = getHashCode(instituteId.toString());
      navigate(`/Institute/LOIGeneration`);
    }
  };

  const handleViewUploadedUndertaking = () => {
    if (declarationPath) {
      const popupWidth = 1000;
      const popupHeight = 750;
      const left = (window.screen.width - popupWidth) / 2;
      const top = (window.screen.height - popupHeight) / 2;

      let viewerUrl;

      // For DOCX/DOC files - use Google Docs Viewer
      if (
        declarationPath.toLowerCase().includes(".docx") ||
        declarationPath.toLowerCase().includes(".doc")
      ) {
        viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(declarationPath)}`;
      }
      // For PDF files
      else if (declarationPath.toLowerCase().includes(".pdf")) {
        viewerUrl = declarationPath;
      }
      // For other files, force download
      else {
        window.open(declarationPath, "_blank");
        return;
      }

      window.open(
        viewerUrl,
        "DocumentViewer",
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`,
      );
    } else {
      Swal.fire({
        icon: "warning",
        title: "No Document",
        text: "No undertaking has been uploaded yet.",
        confirmButtonColor: "#0066ff",
      });
    }
  };

  const handleBack = () => {
    const id =
      instituteId || getInstituteIdFromQueryString?.() || getInstituteId();

    if (userInfo?.UserTypeID === 81) {
      if (id) {
        navigate(
          `/Institute/ProposedCourse?P1=${id}&P2=${String(id).getHashCode()}`,
        );
      } else {
        navigate(`/Institute/ProposedCourse`);
      }
    } else {
      window.history.back();
    }
  };
  const getInstituteIdForSecretary = () => {
    const searchParams = new URLSearchParams(location.search);
    let p1 = searchParams.get("P1");
    let p2 = searchParams.get("P2");

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

  const handleClose = () => {
    if (userInfo?.UserTypeID == 64) {
      navigate("/tinstitute/dashboard");
      return;
    }
    if (userInfo?.UserTypeID === 81) {
      const instituteId = getInstituteIdForSecretary();
      navigate(
        `/InstituteDash?P1=${instituteId}&P2=${String(instituteId).getHashCode()}`,
      );
    } else {
      window.close();
    }
  };
  const handleDownloadTemplate = () => {
    if (wordTemplatePath) {
      window.open(wordTemplatePath, "_blank");
    } else {
      // Default template URL from old code
      const defaultTemplateUrl =
        "https://msbsvet.blob.core.windows.net/msbsvet/templates/Self%20Declaration%20Template.docx";
      window.open(defaultTemplateUrl, "_blank");
    }
  };

  const handleVisitUnauthorizedPage = () => {
    if (mhActPath) {
      window.open(mhActPath, "_blank");
    } else {
      window.open(
        "https://msbsvet.edu.in/Public/UnauthorizedInstitutes.aspx",
        "_blank",
      );
    }
  };

  useEffect(() => {
    fetchIP();
  });

  useEffect(() => {
    const init = async () => {
      startLoading();
      try {
        const id = await getInstituteIdByUserType();
        if (id) {
          setInstituteId(id);
          await checkEligibilityToEdit(id);
          await loadSelfDeclaration(id);
        }

        if (userType === 81) {
          setShowVerificationUI(true);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        stopLoading();
      }
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
      </div>
    );
  }

  const declarationPoints = [
    "I / We have carefully read and understood all the criteria for affiliation.",
    "I / We have verified the conformity with requirements of the affiliation criteria.",
    "I / We hereby assure that the information provided in support of this application is correct to the best of my knowledge and belief.",
    "I / We hereby assure that we are not blacklisted by Central/ State Government or any of its organization for any reason.",
    "I/ We are aware that Issuance of Letter of Intent does not mean approval/ affiliation. Institute has to arrange Training Infrastructure and space as per norms, submit Training Infrastructure details online, pay inspection fees and apply for Physical Inspection.",
    "I / We shall produce all the Original Documents to substantiate the uploaded information and documents to the Inspection Committee and Maharashtra State Board of Skill, Vocational Education and Training whenever asked for.",
    "I/ We are aware that after approval, we are required to pay Security Deposit, appoint adequate number of staff, both training and supporting, with requisite qualification and update their information on portal. Board shall subsequently issue Affiliation Order.",
    "I / We hereby assure that we shall admit the trainees only to approved and affiliated Units.",
    "I / We hereby assure that we shall verify the entry qualification of the trainees and produce trainee documents for verification.",
    "I / We hereby assure that the institute shall abide to all the safety norms.",
    <>
      I / We are aware that I / We shall be prosecuted under the Law,
      application shall be cancelled and all the fees paid shall be ceased for
      <ol type="i" className="list-decimal ml-8 mt-2">
        <li>
          information furnished by us is proved to be false, incorrect or
          incomplete
        </li>
        <li>documents uploaded is proved to be fake/ manipulated/ forged</li>
        <li>photos uploaded are not as actual and have been manipulated</li>
        <li>
          influence or threaten inspection committee or approving/ affiliating
          authorities
        </li>
      </ol>
    </>,
    "I / We are aware that Application Fee/ Inspection Fees/ Revisit Fees once paid is 'non-refundable'.",
    "I / We are aware that I / We are entitled only for refund of Security Deposit less the dues, if any, on surrender/ deaffiliate/ closure of Institute/ Courses/ Units on our request.",
    "I / We are aware that this application does not mean grant of approval/ affiliation, but shall be validated by the authorities and approved/ affiliated / rejected either in part or complete depending upon the Training Infrastructure requirement and availability.",
    "I / We are aware that the affiliation granted shall not be permanent and I / We shall regularly renew it as per Maharashtra State Board of Skill, Vocational Education and Training policy.",
    'I/ We are aware that the proposed courses shall be run on "Permanently unaided basis" and the management shall provide required funds/ investment in development of land/ building and in providing related infrastructural, instructional and other facilities including qualified staff from time to time and for meeting recurring expenditure as per the norms and standards laid down by the Government of Maharashtra and/or Board.',
    "I / We herewith also confirm that the institute by virtue of the approval/ affiliation granted by Government of Maharashtra/ Maharashtra State Board of Skill, Vocational Education and Training shall not automatically become claimant to any grant-in-aid from the Central or State Government for the Institute or for any recurring expenditure etc.",
    "I / We shall regularly check Maharashtra State Board of Skill, Vocational Education and Training website and follow the instructions from time to time after submitting the application.",
    "I / We undertake that Maharashtra State Board of Skill, Vocational Education and Training shall not be responsible for negligence on my/ our part once any information is updated on the website and I / We fail to check the same.",
    "Apart from affiliation norms, I / We shall follow all existing statues/ provisions/ notifications/ orders/ policies of Central Government, State Government and Maharashtra State Board of Skill, Vocational Education and Training issued in respect to Training.",
    "This is to certify that we are fully aware of provisions made in CHAPTER IV- OFFENCES AND PENALTIES of Maharashtra Act No. XX of 2013, 21 August 2013, an act to provide for prohibition of establishment of unauthorized institutions and introduction of unauthorized courses of Studies in Agriculture, Animal and fishery sciences, Health Sciences, Higher, Vocational and Technical education in the State of Maharashtra and for matters connected therewith or incidental thereto. I / We herewith confirm that I / We shall not admit any students in the proposed courses unless we get the final Letter of Admission from the Government of Maharashtra and/or Maharashtra State Board of Skill, Vocational Education and Training.",
  ];

  return (
    <div className="w-full p-4">
      <fieldset className="mb-4 rounded-md border p-4">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          <span>Self Declaration</span>
        </legend>

        <div className="px-4 pb-3 pt-3">
          {/* Declaration Text Section */}
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
            >
              <h3 className="text-sm font-semibold text-white-800 text-center">
                Self-Declaration by the Applicant
              </h3>
            </div>
            <div className="bg-white border border-gray-300 rounded-b p-4">
              <ol className="list-decimal ml-5 space-y-2 text-sm text-justify">
                {declarationPoints.map((point, index) => (
                  <li key={index} className="mb-2">
                    {typeof point === "string" ? point : point}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Undertaking Section */}
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
            >
              <h3 className="text-sm font-semibold text-white-800">
                Upload Undertaking
              </h3>
            </div>

            <div className="bg-white border border-gray-300 rounded-b p-4">
              {/* Consent Checkbox */}
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isConsentChecked}
                    onChange={(e) => handleConsentChange(e.target.checked)}
                    disabled={!isEditAllowed && userType !== 81}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">
                    I/ We accept all above Terms and Conditions
                  </span>
                </label>
              </div>

              {/* Main page label */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Self Declaration on Rs.100 Non-Judicial Stamp Paper{" "}
                <span className="text-red-500">*</span>
              </label>

              {/* Upload PDF Component with inline view button */}
              <div className="flex items-center gap-3">
                <UploadPdf
                  file={uploadedFileData}
                  onFileChange={handleFileUpload}
                  buttonClassName="bg-cyan-500 hover:bg-cyan-600"
                  buttonText="Upload Self Declaration"
                  id="selfDeclaration"
                  allowedFileTypes="pdf, jpg, jpeg"
                  maxFileSize="1 MB"
                  required={true}
                  label="Upload Undertaking on stamp paper"
                  showLabel={false}
                  userTypeId={userType}
                  userLoginID={userInfo?.UserLoginID}
                  linkName=""
                  uniquefilepath={declarationPath}
                  //disabled={!isUploadEnabled}
                  tooltip="Upload Self Declaration Document (PDF/DOC/DOCX, Max 5MB)"
                  tooltipPosition="right"
                />

                {/* View Uploaded Undertaking Button - next to upload button */}
                {declarationPath && (
                  <button
                    type="button"
                    onClick={handleViewUploadedUndertaking}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    View Uploaded Undertaking
                  </button>
                )}
              </div>

              {/* Template Links - Remove duplicate Visit Unauthorized Page */}
              <div className="flex flex-col gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-blue-600 hover:text-blue-800 underline text-sm text-left"
                >
                  Download Self Declaration Template
                </button>

                {mhActPath && !mhActPath.includes("UnauthorizedInstitute") && (
                  <a
                    href={mhActPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    {mhActText || "Download MH Act"}
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleVisitUnauthorizedPage}
                  className="text-blue-600 hover:text-blue-800 underline text-sm text-left"
                >
                  Visit Unauthorized Institute/ Course Page
                </button>
              </div>
              {userType !== 81 &&
                (verificationStatus === "R" || verificationStatus === "V") && (
                  <div className="mt-4 p-3 rounded border">
                    {verificationStatus === "R" && (
                      <div className="text-red-600">
                        <p className="font-normal">
                          Verification Status: Rejected
                        </p>
                        <p className="text-sm">
                          Reason for Rejection/ Remark:{" "}
                          {verificationRemark?.toUpperCase()}
                        </p>
                      </div>
                    )}
                    {verificationStatus === "V" && (
                      <div className="text-green-600">
                        <p className="font-normal">
                          Verification Status: Verified
                        </p>
                        <p className="text-sm">
                          Reason for Rejection/ Remark:{" "}
                          {verificationRemark?.toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Secretary Verification Section */}
          {showVerificationUI && userType === 81 && (
            <div className="mb-6 border rounded-lg p-4 bg-gray-50">
              <h3 className="text-md font-normal mb-3">
                Select Approved Reject Status{" "}
                <span className="text-red-500">*</span>
              </h3>

              <div className="flex gap-6 mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="V"
                    checked={approvalStatus === "V"}
                    onChange={(e) => setApprovalStatus(e.target.value)}
                  />
                  <span className="ml-2 text-sm">Verified</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="R"
                    checked={approvalStatus === "R"}
                    onChange={(e) => setApprovalStatus(e.target.value)}
                  />
                  <span className="ml-2 text-sm">Rejected</span>
                </label>
              </div>
              {/* Rejection Reason - Disabled when Verified */}
              <div className="mb-4">
                <label className="block text-sm font-normal mb-2">
                  Reason for Rejection/ Remark{" "}
                  <span className="text-red-500">*</span>
                  {approvalStatus === "R"}
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2 text-sm uppercase"
                  rows="3"
                  value={rejectReason}
                  onChange={(e) =>
                    setRejectReason(e.target.value.toUpperCase())
                  }
                  placeholder="Enter remark..."
                />
              </div>
            </div>
          )}

          {/* Verification Status Labels for Institute Users
                    {userType !== 81 && (verificationStatus === "R" || verificationStatus === "V") && (
                        <div className="mb-4">
                            <label className="text-sm font-semibold">Verification Status:</label>
                            <span className={`ml-2 text-sm ${verificationStatus === "R" ? "text-red-600" : "text-green-600"}`}>
                                {verificationStatus === "R" ? "Rejected" : "Verified"}
                            </span>
                            {verificationRemark && (
                                <div className="mt-1 text-sm text-gray-600">
                                    <strong>Remark:</strong> {verificationRemark}
                                </div>
                            )}
                        </div>
                    )} */}

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mt-6 mb-4">
            <Button variant="primary" onClick={handleBack}>
              Back
            </Button>

            {(isDeclarationUploaded || userType === 81) && (
              <Button
                onClick={handleProceed}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow"
              >
                {userType === 81 ? "Save & Next" : "Next"}
              </Button>
            )}

            <Button variant="danger" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </fieldset>
    </div>
  );
};

export default SelfDeclaration;
