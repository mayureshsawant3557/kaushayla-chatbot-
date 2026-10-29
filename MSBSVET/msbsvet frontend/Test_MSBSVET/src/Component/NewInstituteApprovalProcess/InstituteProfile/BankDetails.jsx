import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import agent from "../../../lib/api/agent";
import axios from "axios";
import Swal from "sweetalert2";
import FormComponent from "../../formcomponent/FormComponent";
import UploadPdf from "../../formcomponent/UploadPdf";
import { useLoading } from "../../../Hooks/useLoading";
import { ThemeContext } from "../../Context/ThemeContext";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import {
    GetInstituteBankDetails,
  SaveInstituteBankDetails,
} from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import { RazorApi } from "../../../Endpoints_All/External/ifsc";

import { useInspectionLock } from "../../../Hooks/useInspectionLock";
import { UpdateInstituteInspectionVerificationStatus } from "../../../Endpoints_All/Base/DVETO";
import InspectionStatusComponent from "../../formcomponent/InspectionStatusComponent";
import { useAuth } from "../../../Hooks/AuthContext";

import InstituteFlowLayout from "../../../Component/InstituteFlow/InstituteFlowLayout";
import { usePagePermission } from "../../../Hooks/usePagePermission";
import { useInstituteFlow } from "../../../Hooks/useInstituteFlow";

const BankDetails = () => {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const p1 = searchParams.get("P1");
  const p2 = searchParams.get("P2");

    
    const { goNext, goBack, handleClose } = useInstituteFlow(
        "Bank Account",
        p1,
        p2
    );  


  const [inspectionStatus, setInspectionStatus] = useState({
    status: "",
    remark: "",
  });

    // Centralized Permissions
    const {
       // userTypeID,
        isViewer,
        canEdit,
        canSave,
    } = usePagePermission();

    

  // State for user and institute details
  const [userLoginID, setUserLoginID] = useState("");
  const [userTypeID, setUserTypeID] = useState("");
  const [instituteID, setInstituteID] = useState(null);
  const [ipAddress, setIpAddress] = useState("");
  const { userInfo } = useAuth();

  // State for form fields
  const [bankRowId, setBankRowId] = useState(0);
  const [accountType, setAccountType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [passbook, setPassbook] = useState({ fileName: "", filePath: "" });
  const [passbookPath, setPassbookPath] = useState("");

  // State for validation and UI
  const [errors, setErrors] = useState({});
  const [isVerifyingIFSC, setIsVerifyingIFSC] = useState(false);
  const [ifscVerified, setIfscVerified] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  // Account type options
  const accountTypeOptions = [
    { label: "Saving", value: "Saving" },
    { label: "Current", value: "Current" },
  ];

  const inspectionref = useRef();

  //LOCK
  const { isLocked, eligibilityData } = useInspectionLock(
    instituteID,
    userLoginID,
    "Bank Account",
  );

  // Fetch user and institute details
  const fetchUserAndInstituteDetails = async () => {
    try {
      const loginID = userInfo?.UserLoginID;
      const typeID = userInfo?.UserTypeID;
      setUserLoginID(loginID);
      setUserTypeID(typeID);

      // DVETO dashboard case
      if (typeID === 14 || (typeID === 81 && p1) || (typeID === 501 && p1)) {
        setInstituteID(p1);
        return p1;
      }

      const resInstitute = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
      );

      if (resInstitute.data?.Data) {
        const instID = resInstitute.data.Data;
        setInstituteID(instID);
        return instID;
      } else {
        console.warn("Institute not found for UserLoginID:", loginID);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user and institute details:", error);
      return null;
    }
  };

  // Fetch IP Address
  const fetchIP = async () => {
    try {
      const response = await agent.get(getIp, {
        headers: {
          accept: "*/*",
        },
      });

      if (response.data?.ip) {
        setIpAddress(response.data.ip);
      } else {
        setIpAddress("0.0.0.0");
      }
    } catch (error) {
      console.error("Error fetching IP:", error);
      setIpAddress("0.0.0.0");
    }
  };

  // Fetch existing bank details
  const fetchBankDetails = async (instID) => {
    if (!instID) return;

    try {
      startLoading();
      const response = await agent.get(
        `${GetInstituteBankDetails}?InstituteID=${instID}`,
      );

      if (
        response.data?.Status === "Success" &&
        response.data?.Data?.length > 0
      ) {
        const bankData = response.data.Data[0];
        setBankRowId(bankData.BankRowId || 0);
        setAccountType(bankData.AccountType || "");
        setAccountNumber(bankData.AccountNo || "");
        setAccountHolderName(bankData.AccountHolderName || "");
        setIfscCode(bankData.IFSCCode || "");
        setBankName(bankData.BankName || "");
        setBranchName(bankData.BranchName || "");
        setPassbookPath(bankData.CancelChequePath || "");

        if (bankData.IFSCCode && bankData.BankName) {
          setIfscVerified(true);
        }

        if (bankData.CancelChequePath) {
          setPassbook({
            fileName: "Existing Document",
            filePath: bankData.CancelChequePath,
          });
        }

        setHasExistingData(true);
      } else {
        setHasExistingData(false);
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
      //Swal.fire({
      //    title: "Error",
      //    text: "Failed to fetch bank details",
      //    icon: "error"
      //});
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      await fetchIP();
      const instID = await fetchUserAndInstituteDetails();
      if (instID) {
        await fetchBankDetails(instID);
      }
    };

    initializeData();
  }, []);

  // Verify IFSC Code
  const verifyIFSC = async (e) => {
    e.preventDefault();

    setErrors({ ...errors, ifscCode: null });

    if (!ifscCode) {
      setErrors({ ...errors, ifscCode: "IFSC code is required" });
      return;
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode)) {
      setErrors({ ...errors, ifscCode: "Invalid IFSC format" });
      return;
    }

    setIsVerifyingIFSC(true);
    try {
      const response = await axios.get(`${RazorApi}${ifscCode}`);

      if (response.data) {
        const newBankName = response.data.BANK || "";
        const newBranchName = response.data.BRANCH || "";

        setBankName(newBankName);
        setBranchName(newBranchName);
        setIfscVerified(true);

        Swal.fire({
          title: "Success",
          text: "IFSC code verified successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        setErrors({
          ...errors,
          ifscCode: "Invalid IFSC code. No bank details found.",
        });
        setIfscVerified(false);
      }
    } catch (error) {
      console.error("Error verifying IFSC code:", error);
      setErrors({
        ...errors,
        ifscCode: "Failed to verify IFSC code. Please check and try again.",
      });
      setIfscVerified(false);

      Swal.fire({
        title: "Error",
        text: "Failed to verify IFSC code",
        icon: "error",
      });
    } finally {
      setIsVerifyingIFSC(false);
    }
  };

  // Handle passbook upload
  const handlePassbookChange = (fileData) => {
    if (fileData) {
      // Handle both file object and fileData structure
      const fileName =
        fileData.name || fileData.fileName || "Uploaded Document";
      const filePath = fileData.filePath || fileData.uniqueFileName || "";

      setPassbook({
        fileName: fileName,
        filePath: filePath,
      });
      setPassbookPath(filePath);

      // Clear passbook error properly
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.passbook;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!accountType) {
      newErrors.accountType = "Account type is required";
    }

    if (!accountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{9,18}$/.test(accountNumber)) {
      newErrors.accountNumber = "Account number must be 9-18 digits";
    }

    if (!accountHolderName) {
      newErrors.accountHolderName = "Account holder name is required";
    } else if (accountHolderName.trim().length < 2) {
      newErrors.accountHolderName =
        "Account holder name must be at least 2 characters";
    }

    if (!ifscCode) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      newErrors.ifscCode = "Invalid IFSC format";
    }

    if (!ifscVerified) {
      newErrors.ifscCode = "Please verify IFSC code";
    }

    if (!bankName) {
      newErrors.bankName = "Bank name is required";
    }

    if (!branchName) {
      newErrors.branchName = "Branch name is required";
    }

    if (!passbookPath && !passbook.filePath) {
      newErrors.passbook = "Bank passbook cover page or cheque is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Save and Next
  const handleSaveAndNext = async () => {
      if (isLocked) {
         
          navigate("/Institute/InspectionFee");
         
      return;
      }
      if (isViewer || !canSave) {
          goNext();
          return;
      }
    if (!validateForm()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill all required fields correctly",
        icon: "error",
      });
      return;
    }

    if (!instituteID) {
      Swal.fire({
        title: "Error",
        text: "Institute ID not found",
        icon: "error",
      });
      return;
    }

    const bankDetailsPayload = {
      bankRowId: bankRowId,
      instituteID: instituteID,
      accountType: accountType,
      accountNo: accountNumber,
      accountHolderName: accountHolderName,
      ifscCode: ifscCode,
      bankName: bankName,
      branchName: branchName,
      cancelChequePath: passbookPath || passbook.filePath,
      userLoginID: userLoginID,
      ipAddress: ipAddress,
      pageCode: "BANK_DETAILS",
      isDeleteAllowed: true,
      isEditAllowed: true,
    };

    try {
      startLoading();
      const response = await agent.post(
        SaveInstituteBankDetails,
        bankDetailsPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data?.Status === "Success") {
        Swal.fire({
          title: "Success",
          text: response.data.Message || "Bank details saved successfully",
          icon: "success",

          showConfirmButton: true,
        }).then((res) => {
          if (res.isConfirmed) {
            navigate("/Institute/InspectionFee");
          }
        });

        // Reload data after save
        await fetchBankDetails(instituteID);
      } else {
        Swal.fire({
          title: "Error",
          text: response.data?.Message || "Failed to save bank details",
          icon: "error",
        }).then((res) => {
          if (res.isConfirmed) {
            navigate("/Institute/InspectionFee");
          }
        });
      }
    } catch (error) {
      console.error("Error saving bank details:", error);
      Swal.fire({
        title: "Error",
        text: error.Message || "Failed to save bank details",
        icon: "error",
      }).then((res) => {
        if (res.isConfirmed) {
          navigate("/Institute/InspectionFee");
        }
      });
    } finally {
      stopLoading();
    }
  };

  const handleAdminSubmit = async () => {
    const isvalid = inspectionref.current?.validate();

    //if (!isvalid) {
    //    return;
      //}

      if (isViewer || !canSave) {
          goNext();
          return;
      }

    if (!inspectionStatus.status) {
      Swal.fire("Validation", "Please select status", "warning");
      return;
    }

    if (inspectionStatus.status === "R" && !inspectionStatus.remark) {
      Swal.fire("Validation", "Remark required when rejected", "warning");
      return;
    }
      
      if (isLocked) {
         
          navigate(`/Institute/InspectionFee?P1=${p1}&P2=${p2}`);
          
      return;
    }

    try {
      startLoading();

      if (!validateForm()) {
        Swal.fire({
          title: "Validation Error",
          text: "Please fill all required fields correctly",
          icon: "error",
        });
        return;
      }

      if (!instituteID) {
        Swal.fire({
          title: "Error",
          text: "Institute ID not found",
          icon: "error",
        });
        return;
      }

      const bankDetailsPayload = {
        bankRowId: bankRowId,
        instituteID: instituteID,
        accountType: accountType,
        accountNo: accountNumber,
        accountHolderName: accountHolderName,
        ifscCode: ifscCode,
        bankName: bankName,
        branchName: branchName,
        cancelChequePath: passbookPath || passbook.filePath,
        userLoginID: userLoginID,
        ipAddress: ipAddress,
        pageCode: "BANK_DETAILS",
        isDeleteAllowed: true,
        isEditAllowed: true,
      };

      try {
        startLoading();
        const response = await agent.post(
          SaveInstituteBankDetails,
          bankDetailsPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (response.data?.Status === "Success") {
          // Swal.fire({
          //     title: "Success",
          //     text: response.data.Message || "Bank details saved successfully",
          //     icon: "success",

          //     showConfirmButton: true
          // }).then((res) => {
          //     if (res.isConfirmed) {
          //         navigate('/Institute/InspectionFee')
          //     }

          // });

          // Reload data after save
          await fetchBankDetails(instituteID);
        } else {
          Swal.fire({
            title: "Error",
            text: response.data?.Message || "Failed to save bank details",
            icon: "error",
          }).then((res) => {
            if (res.isConfirmed) {
              navigate("/Institute/InspectionFee");
            }
          });
        }
      } catch (error) {
        console.error("Error saving bank details:", error);
        Swal.fire({
          title: "Error",
          text: error.Message || "Failed to save bank details",
          icon: "error",
        }).then((res) => {
          if (res.isConfirmed) {
            navigate("/Institute/InspectionFee");
          }
        });
      } finally {
        stopLoading();
      }

      const payload = {
        InstituteID: instituteID,
        PageCode: "BankAccount",
        Status: inspectionStatus.status,
        Remark: inspectionStatus.remark || "",
        CreatedBy: userLoginID,
        IpAddress: ipAddress,
        userTypeID: userTypeID,
      };

      const res = await agent.post(
        UpdateInstituteInspectionVerificationStatus,
        payload,
      );

      if (res.data?.Status !== "Success") {
        throw new Error(res.data?.Message || "Status update failed");
      }

      await Swal.fire("Success", "Verified successfully", "success");

      navigate(`/Institute/InspectionFee?P1=${p1}&P2=${p2}`);
    } catch (err) {
      Swal.fire("Error", err.Message || "Something went wrong", "error");
    } finally {
      stopLoading();
    }
    };
    const handleSave = async () => {
        if (userTypeID === 14 || userTypeID === 81) {
            await handleAdminSubmit();
        } else if (userTypeID === 64) {
            await handleSaveAndNext();
        } else {
            goNext();
        }
    };

    return (
        <InstituteFlowLayout
            currentPageCode="Bank Account"
            p1={p1}
            p2={p2}
            onSave={ handleSave }
            isSaveLoading={isLoading}
            isLocked={isLocked}
            title="Bank Account"
            color={color}
        >
    <div className="container mx-auto p-6 max-w-full  min-h-screen">
      
     
       
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <FormComponent
              label="Type Of Account"
              isSelect={true}
              options={accountTypeOptions}
              value={accountType}
              onChange={(val) => {
                setAccountType(val);
                setErrors({ ...errors, accountType: null });
              }}
              error={errors.accountType}
              required={true}
              disabled={isLocked}
            />
          </div>

          <div>
            <FormComponent
              label="Account Number"
              type="text"
              value={accountNumber}
              onChange={(val) => {
                setAccountNumber(val);
                setErrors({ ...errors, accountNumber: null });
              }}
              error={errors.accountNumber}
              required={true}
              placeholder="Enter account number"
              disabled={isLocked}
            />
          </div>

          <div>
            <FormComponent
              label="Name Of Account Holder"
              type="text"
              value={accountHolderName}
              onChange={(val) => {
                setAccountHolderName(val);
                setErrors({ ...errors, accountHolderName: null });
              }}
              error={errors.accountHolderName}
              required={true}
              placeholder="Enter account holder name"
              disabled={isLocked}
              autoUpperCase={true}
            />
          </div>
        </div>

        {/* Row 2: IFSC Code with Verify Button, Bank Name, Branch Name */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-2 items-end">
            <div className="flex-grow">
              <FormComponent
                label="Bank IFSC Code"
                type="text"
                value={ifscCode}
                onChange={(value) => {
                  const upperValue = value.toUpperCase();
                  setIfscCode(upperValue);
                  setIfscVerified(false);
                  setBankName("");
                  setBranchName("");
                  setErrors({ ...errors, ifscCode: null });
                }}
                error={errors.ifscCode}
                required={true}
                placeholder="Enter IFSC code"
                extraClass="mb-0"
                disabled={isLocked}
              />
            </div>
            <button
              type="button"
              onClick={verifyIFSC}
              disabled={isVerifyingIFSC || !ifscCode || isLocked}
              className={`mb-1 px-4 py-2 rounded font-semibold text-sm transition-colors whitespace-nowrap ${
                isVerifyingIFSC
                  ? "bg-yellow-300 text-gray-700 cursor-wait"
                  : ifscVerified
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
              } ${!ifscCode ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isVerifyingIFSC ? "Fetching..." : "Check IFSC Code"}
            </button>
          </div>

          <div>
            <FormComponent
              label="Bank Name"
              type="text"
              value={bankName}
              onChange={setBankName}
              error={errors.bankName}
              required={true}
              placeholder="Auto-filled after IFSC verification"
              disabled={true}
            />
          </div>

          <div>
            <FormComponent
              label="Branch Name"
              type="text"
              value={branchName}
              onChange={setBranchName}
              error={errors.branchName}
              required={true}
              placeholder="Auto-filled after IFSC verification"
              disabled={true}
            />
          </div>
        </div>

        {/* Row 3: Upload Passbook */}
        <div className="mt-6">
          <UploadPdf
            file={passbook?.fileName || ""}
            onFileChange={handlePassbookChange}
            buttonClassName="bg-[#00c3f9]"
            buttonText="Upload"
            label="Upload Bank Passbook Cover Page / Cheque"
            showLabel={true}
            allowedFileTypes="jpg, jpeg, png, pdf"
            maxFileSize="2 MB"
            required={true}
            userTypeId={userTypeID}
            userLoginID={userLoginID}
            linkName="View Bank Passbook Cover Page / Cheque"
            uniquefilepath={passbookPath || ""}
            id="passbookUpload"
            disabled={isLocked}
          />
          {errors.passbook && (
            <p className="mt-1 text-sm text-red-600">{errors.passbook}</p>
          )}
        </div>
      

      <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Bank Account should be in the name of Proposed
          Institute or Promoting Organization.
        </p>
      </div>

      {/*{userTypeID === 14 && (*/}
      {/*    <InspectionStatusComponent*/}
      {/*        instituteId={instituteID}*/}
      {/*        pageCode="Bank Account"*/}
      {/*        onChange={(data) => setInspectionStatus(data)}*/}
      {/*    />*/}
      {/*)}*/}
                {(userTypeID === 81 || isViewer) &&
        (["S"].includes(eligibilityData?.InspectionStatus) ||
          ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
          <InspectionStatusComponent
            //ref={inspectionref}
            instituteId={instituteID}
            pageCode="Bank Account"
            // onChange={(data) => setInspectionStatus(data)}
            readOnly={
              eligibilityData?.InspectionStatus === "S" && userTypeID === 81
            }
            TypeID="14"
            //userName="By DVETO"
            mode="view"
          />
        )}

      {(userTypeID === 14 ||
        ((userTypeID == 64 || userTypeID == 81) &&
          (["I", "S", "WD", "W"].includes(eligibilityData?.InspectionStatus) ||
            ["V", "W"].includes(eligibilityData?.VerificationStatus)))) && (
        <InspectionStatusComponent
          ref={inspectionref}
          instituteId={instituteID}
          pageCode="Bank Account"
          onChange={(data) => setInspectionStatus(data)}
          //readOnly={userTypeID !== 14}
          // readOnly={eligibilityData?.InspectionStatus === 'S' && userTypeID === 14}
          readOnly={
            (userTypeID === 14 && eligibilityData?.InspectionStatus === "S") ||
            (userTypeID === 81 && eligibilityData?.VerificationStatus === "V")
          }
          TypeID={userTypeID}
        />
      )}

                { (userTypeID === 14 || isViewer) &&
        ["S", "WD"].includes(eligibilityData?.InspectionStatus) && (
          <InspectionStatusComponent
            //  ref={inspectionref}
            instituteId={instituteID}
            pageCode="Bank Account"
            // onChange={(data) => setInspectionStatus(data)}
            //readOnly={userTypeID !== 14}
            readOnly={
              eligibilityData?.InspectionStatus === "S" && userTypeID === 14
            }
            TypeID="81"
            //userName="By Board"
            mode="view"
          />
        )}
            </div>
        </InstituteFlowLayout>
      
      
   
  );
};

export default BankDetails;


// <div className="flex justify-center gap-8 mt-8 pt-12 border-t-2 border-gray-300">
//     {userTypeID == 64 && (
//         <>
//             <button
//                 type="button"
//                 onClick={() => navigate("/Institute/PowerDetails")}
//                 className="px-6 py-3 bg-cyan-500 text-white rounded text-sm"
//             >
//                 Back
//             </button>

//             <button
//                 type="button"
//                 onClick={handleSaveAndNext}
//                 className="bg-[#28a745] text-white px-6 py-3 rounded text-sm"
//                 disabled={isLoading}
//             >
//                 {isLoading ? "Saving..." : isLocked ? "Next" : "Save and Next"}
//             </button>

//             <button
//                 type="button"
//                 onClick={() => navigate("/tinstitute/dashboard")}
//                 className="px-6 py-3 bg-gray-600 text-white rounded text-sm"
//             >
//                 Close
//             </button>
//         </>
//     )}

//     {(userTypeID === 14 || userTypeID === 81) && (
//         <>
//             <button
//                 type="button"
//                 onClick={() =>
//                     navigate(`/Institute/PowerDetails?P1=${p1}&P2=${p2}`)
//                 }
//                 className="px-6 py-3 bg-cyan-500 text-white rounded text-sm"
//             >
//                 Back
//             </button>

//             <button
//                 type="button"
//                 onClick={handleAdminSubmit}
//                 className="bg-[#28a745] text-white px-6 py-3 rounded text-sm"
//             >
//                 Save and Next
//             </button>

//             <button
//                 type="button"
//                 onClick={() => {
//                     if (userTypeID == 14) {
//                         navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`);
//                     } else {
//                         navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`);
//                     }
//                 }}
//                 className="px-6 py-3 bg-gray-600 text-white rounded text-sm"
//             >
//                 Close
//             </button>
//         </>
//     )}
// </div>