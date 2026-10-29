import React, { useState, useEffect, useContext, useRef } from "react";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useSearchParams, useNavigate } from "react-router-dom";

import FormComponent from "../../Component/formcomponent/FormComponent";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import UploadPdf from "../../Component/formcomponent/UploadPdf";
import OTPService from "../../Component/formcomponent/OTPService";
import { getDeviceIP } from "../../utils/CommonHelper";
import { SwalHelper } from "../../utils/swalHelper";
import Loader from "../../Component/formcomponent/Loader";
import { DateInput } from "../../Component/formcomponent/DateInputComponent";
// import Staff_PrintApplicationForm from "../../Component/PrintApplicationForm/Staff_PrintApplicationForm";
import agent from "../../lib/api/agent";
import {
  SaveStaffPrimaryVerification,
  GetStaffPrimary,
} from "../../Endpoints_All/Secretary/StaffManagement";
import { useAuth } from "../../Hooks/AuthContext";

// ─── Dropdown options ─────────────────────────────────────────────────────────
const VERIFY_OPTIONS = [
  { label: "Select", value: "-1" },
  { label: "Verify", value: "V" },
  { label: "Reject", value: "R" },
];

const GENDER_OPTIONS = [
  { label: "Select", value: "-1" },
  { label: "Male", value: "M" },
  { label: "Female", value: "F" },
  { label: "Other", value: "O" },
];

// ─── Reusable row component ───────────────────────────────────────────────────
const VerificationRow = ({
  label,
  required,
  valueCol,
  verifyValue,
  onVerifyChange,
  remarkValue,
  onRemarkChange,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "3fr 4fr 2fr 3fr",
      gap: "8px",
      alignItems: "start",
      padding: "10px 0",
      borderBottom: "0.5px solid var(--color-border-tertiary)",
    }}
  >
    <div
      style={{
        fontSize: "14px",
        paddingTop: "8px",
        color: "var(--color-text-primary)",
      }}
    >
      {label}
      {required && (
        <span style={{ color: "var(--color-text-danger)", marginLeft: "2px" }}>
          *
        </span>
      )}
    </div>
    <div>{valueCol}</div>
    <div>
      <DropdownComponent
        options={VERIFY_OPTIONS}
        value={verifyValue}
        onChange={onVerifyChange}
      />
    </div>
    <div>
      <FormComponent
        value={remarkValue || ""}
        onChange={onRemarkChange}
        disabled={verifyValue !== "R"}
        autoUpperCase
        placeholder={verifyValue === "R" ? "Enter reject remark" : ""}
      />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const staffID = searchParams.get("P1");
  const { color } = useContext(ThemeContext);
  const { userInfo } = useAuth();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // const [printData, setPrintData] = useState(null);
  const [errors, setErrors] = useState({});


  // ── Load staff data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!staffID) return;
    loadData();
  }, [staffID]);

  const formatDate = (date) => {
    if (!date) return "";

    // ✅ If Date object
    if (date instanceof Date) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // ✅ If string (fallback)
    if (typeof date === "string" && date.includes("-")) {
      const [y, m, d] = date.split("-");
      return `${d}/${m}/${y}`;
    }

    return date;
  };

  const loadData = async () => {
    const ipAddress = await getDeviceIP();
    setLoading(true);
    setError("");
    try {
      //console.log(
      //  "Fetching staff data with staffID:",
      //  staffID,
      //  "and userLoginID:",
      //  userInfo.UserLoginID,
      //);
      const res = await agent.post(GetStaffPrimary, {
        staffID: Number(staffID),
        userLoginID: userInfo?.UserLoginID || "",
        pageCode: "StaffVerification",
        ipAddress,
      });
      //console.log("API response:", res);
      const apiData = res?.data?.Data || {};

      // Convert PascalCase → camelCase properly
      const toCamelCase = (str) => str.charAt(0).toLowerCase() + str.slice(1);

      const mappedData = Object.fromEntries(
        Object.entries(apiData).map(([key, value]) => [
          toCamelCase(key),
          value,
        ]),
      );

      // Fix special fields manually
      mappedData.dob = apiData?.DOB?.substring(0, 10) || "";
      mappedData.eMailID = apiData?.EMailID || ""; // keep same for input binding

      setData(mappedData);
    } catch (err) {
      SwalHelper.error("Error", "Failed to load staff data.");
    } finally {
      setLoading(false);
    }
  };

  // ── Generic field updater ────────────────────────────────────────────────────
  const updateField = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }));

    const getSecretaryMobile = async () => {
        try {
            const res = await agent.get(`/api/UserManagement/GetUserDetails/${userInfo?.UserID}`);

            //console.log("User Details Response:", res);

            const userData = res?.data;

            // ✅ FIXED FIELD NAME
            return userData?.UserMobileNo;

        } catch (err) {
            return null;
        }
    };


    // ── OTP → Save ───────────────────────────────────────────────────────────────
    const otp = OTPService({
        purpose: "Verification",
        messege: "Secretary Staff Verification",
        onSuccess: async () => {
            const ipAddress = await getDeviceIP();
            setSaving(true);
            try {
                const formatToBackend = (date) => {
                    if (!date) return "";

                    if (typeof date === "string" && date.includes("-")) {
                        return date;
                    }

                    if (typeof date === "string" && date.includes("/")) {
                        const [d, m, y] = date.split("/");
                        return `${y}-${m}-${d}`;
                    }

                    return "";
                };

                const payload = {
                    ...data,
                    dob: formatToBackend(data.dob),
                    staffID: Number(staffID),
                    isDOBFilePathVerify: "V",
                    userLoginID: userInfo?.UserLoginID || "",
                    ipAddress,
                    pageCode: "StaffVerification",
                };

                const response = await agent.post(
                    SaveStaffPrimaryVerification,
                    payload,
                );

                const result = response?.data?.Data;

                if (result === "Y") {
                    SwalHelper.success(
                        "Success",
                        response?.data?.Message || "Saved successfully",
                    ).then(() => {
                        navigate("/SDILOI/StaffManagementSearch");
                    });
                } else {
                    SwalHelper.error("Error", response?.data?.Message || "Save failed.");
                }
            } catch (err) {
                SwalHelper.error("Error", err?.message || "Something went wrong.");
            } finally {
                setSaving(false);
            }
        },

        onError: () => {
            SwalHelper.error("Error", "OTP verification failed");
        }
    });

  const validate = () => {
    const newErrors = {};

    if (!data.firstName?.trim()) newErrors.firstName = "First Name is required";

    if (!data.lastName?.trim()) newErrors.lastName = "Last Name is required";

    if (!data.dob) newErrors.dob = "Date of Birth is required";

    if (!data.aadhaarNo) newErrors.aadhaarNo = "Aadhaar Number is required";
    else if (!/^[0-9]{12}$/.test(data.aadhaarNo))
      newErrors.aadhaarNo = "Enter valid 12-digit Aadhaar";

    if (!data.genderCode || data.genderCode === "-1")
      newErrors.genderCode = "Gender is required";

    if (!data.eMailID) newErrors.eMailID = "Email is required";

    if (!data.mobileNo) newErrors.mobileNo = "Mobile number is required";

    if (!data.photoFilePath) newErrors.photoFilePath = "Photo is required";

    if (!data.aadhaarFilePath)
      newErrors.aadhaarFilePath = "Aadhaar file is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
    const handleSave = () => {
        setError("");

        if (!validate()) {
            SwalHelper.warning(
                "Validation Error",
                "Please fill all required fields correctly",
            );
            return;
        }

        SwalHelper.confirm({
            title: "Are you sure?",
            text: "Do you want to submit verification?",
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            const mobile = await getSecretaryMobile();

            if (!mobile) {
                SwalHelper.error("Error", "Mobile number not found");
                return;
            }

            otp.startVerification(mobile);
        });
    };
  // ✅ PRINT POPUP (LIKE INSTITUTE FILE)
  const handlePrint = () => {
    if (!staffID) return;

    const userLoginID = userInfo?.UserLoginID || "";

    window.open(
      `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffID}&userLoginID=${userLoginID}`,
      "_blank",
      "width=1000,height=750",
    );
  };

  const handleClose = () => {
    navigate("/SDILOI/StaffManagementSearch");
  };

  // ── Column header row ─────────────────────────────────────────────────────────
  const ColHeader = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 4fr 2fr 3fr",
        gap: "8px",
        padding: "8px 0",
        borderBottom: "1px solid var(--color-border-secondary)",
        fontWeight: 500,
        fontSize: "13px",
        color: "var(--color-text-secondary)",
      }}
    >
      <div>Field Name</div>
      <div>Value</div>
      <div>Verification Status</div>
      <div>Reject Remark</div>
    </div>
  );

  {
    loading && <Loader />;
  }
  return (
    <div className="p-4">
      <fieldset className="rounded border p-4 mb-6 bg-white shadow-sm">
        <legend className={`rounded ${color} px-4 py-1 text-xl text-white`}>
          Staff / Management
        </legend>

        {/* Print button */}
        <div style={{ textAlign: "center", margin: "12px 0 16px" }}>
          <button
            onClick={handlePrint}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            Print Profile form
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "var(--color-background-danger)",
              color: "var(--color-text-danger)",
              border: "0.5px solid var(--color-border-danger)",
              borderRadius: "var(--border-radius-md)",
              padding: "10px 14px",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            {error}
          </div>
        )}

        {/* Profile ID (read-only, no verify) */}
        {data.itiRegistrationNo && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 4fr 2fr 3fr",
              gap: "8px",
              padding: "10px 0",
              borderBottom: "0.5px solid var(--color-border-tertiary)",
              fontSize: "14px",
              alignItems: "center",
            }}
          >
            <div style={{ color: "var(--color-text-primary)" }}>Profile ID</div>
            <div
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              {data.itiRegistrationNo}
            </div>
            <div />
            <div />
          </div>
        )}

        <ColHeader />

        {/* ── First Name ── */}
        <VerificationRow
          label="First Name"
          required
          valueCol={
            <FormComponent
              value={data.firstName || ""}
              onChange={(v) => updateField("firstName", v)}
              autoUpperCase
              error={errors.firstName}
            />
          }
          verifyValue={data.isFirstNameVerify || "-1"}
          onVerifyChange={(v) => updateField("isFirstNameVerify", v)}
          remarkValue={data.firstNameVerifyRemark}
          onRemarkChange={(v) => updateField("firstNameVerifyRemark", v)}
        />

        {/* ── Middle / Father / Husband Name ── */}
        <VerificationRow
          label="Middle / Father / Husband Name"
          valueCol={
            <FormComponent
              value={data.middleName || ""}
              onChange={(v) => updateField("middleName", v)}
              autoUpperCase
            />
          }
          verifyValue={data.isMiddleNameVerify || "-1"}
          onVerifyChange={(v) => updateField("isMiddleNameVerify", v)}
          remarkValue={data.middleNameVerifyRemark}
          onRemarkChange={(v) => updateField("middleNameVerifyRemark", v)}
        />

        {/* ── Last Name / Surname ── */}
        <VerificationRow
          label="Last Name / Surname"
          required
          valueCol={
            <FormComponent
              value={data.lastName || ""}
              onChange={(v) => updateField("lastName", v)}
              autoUpperCase
              error={errors.lastName}
            />
          }
          verifyValue={data.isLastNameVerify || "-1"}
          onVerifyChange={(v) => updateField("isLastNameVerify", v)}
          remarkValue={data.lastNameVerifyRemark}
          onRemarkChange={(v) => updateField("lastNameVerifyRemark", v)}
        />

        {/* ── Photo ── */}
        <VerificationRow
          label="Photo"
          required
          valueCol={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {data.photoFilePath && (
                <img
                  src={data.photoFilePath}
                  alt="Photo"
                  style={{
                    width: "100px",
                    height: "130px",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                  }}
                />
              )}

              <UploadPdf
                label="Upload Photo"
                allowedFileTypes="jpg, jpeg"
                userLoginID={userInfo?.UserLoginID || ""}
                onFileChange={(file) =>
                  updateField("photoFilePath", file.filePath)
                }
                // uniquefilepath={data.photoFilePath}
              />
            </div>
          }
          verifyValue={data.isPhotoFilePathVerify || "-1"}
          onVerifyChange={(v) => updateField("isPhotoFilePathVerify", v)}
          remarkValue={data.photoFilePathVerifyRemark}
          onRemarkChange={(v) => updateField("photoFilePathVerifyRemark", v)}
        />

        {/* ── Date of Birth ── */}
        <VerificationRow
          label="Date of Birth"
          required
          valueCol={
            <DateInput
              value={data.dob}
              onChange={(v) => updateField("dob", v)}
              error={errors.dob}
              dateFormat="dd/MM/yyyy" // 🔥 IMPORTANT
            />
          }
          verifyValue={data.isDOBVerify || "-1"}
          onVerifyChange={(v) => updateField("isDOBVerify", v)}
          remarkValue={data.dobVerifyRemark}
          onRemarkChange={(v) => updateField("dobVerifyRemark", v)}
        />

        {/* ── Aadhaar Number ── */}
        <VerificationRow
          label="Aadhaar Number"
          required
          valueCol={
            <FormComponent
              value={data.aadhaarNo || ""}
              onChange={(v) => updateField("aadhaarNo", v)}
              error={errors.aadhaarNo}
            />
          }
          verifyValue={data.isAadhaarNoVerify || "-1"}
          onVerifyChange={(v) => updateField("isAadhaarNoVerify", v)}
          remarkValue={data.aadhaarNoVerifyRemark}
          onRemarkChange={(v) => updateField("aadhaarNoVerifyRemark", v)}
        />

        {/* ── Aadhaar Card Upload ── */}
        <VerificationRow
          label="Upload Aadhaar Card"
          required
          valueCol={
            <UploadPdf
              label="Upload"
              allowedFileTypes="jpg, jpeg, pdf"
              userLoginID={userInfo?.UserLoginID || ""}
              onFileChange={(file) =>
                updateField("aadhaarFilePath", file.filePath)
              }
              uniquefilepath={data.aadhaarFilePath}
            />
          }
          verifyValue={data.isAadhaarFilePathVerify || "-1"}
          onVerifyChange={(v) => updateField("isAadhaarFilePathVerify", v)}
          // BUG FIX: original code checked isGenderCodeVerify here — now correctly uses isAadhaarFilePathVerify
          remarkValue={data.aadhaarFilePathVerifyRemark}
          onRemarkChange={(v) => updateField("aadhaarFilePathVerifyRemark", v)}
        />

        {/* ── Gender ── */}
        <VerificationRow
          label="Gender"
          required
          valueCol={
            <DropdownComponent
              options={GENDER_OPTIONS}
              value={data.genderCode || "-1"}
              onChange={(v) => updateField("genderCode", v)}
              error={errors.genderCode}
            />
          }
          verifyValue={data.isGenderCodeVerify || "-1"}
          onVerifyChange={(v) => updateField("isGenderCodeVerify", v)}
          remarkValue={data.genderCodeVerifyRemark}
          onRemarkChange={(v) => updateField("genderCodeVerifyRemark", v)}
        />

        {/* ── Email / Mobile (no verification columns — matches original) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
            padding: "16px 0",
            borderBottom: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Email ID{" "}
              <span style={{ color: "var(--color-text-danger)" }}>*</span>
            </label>
            <FormComponent
              value={data.eMailID || ""}
              onChange={(v) => updateField("eMailID", v)}
              error={errors.eMailID}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Mobile No.
            </label>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                value="+91"
                disabled
                style={{
                  width: "52px",
                  padding: "6px 8px",
                  fontSize: "13px",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-secondary)",
                }}
              />
              <FormComponent
                value={data.mobileNo || ""}
                onChange={(v) =>
                  updateField("mobileNo", v.replace(/\D/g, "").slice(0, 10))
                }
                error={errors.mobileNo}
              />
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Alt Mobile No.
            </label>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                value="+91"
                disabled
                style={{
                  width: "52px",
                  padding: "6px 8px",
                  fontSize: "13px",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-secondary)",
                }}
              />
              <FormComponent
                value={data.altMobileNo || ""}
                onChange={(v) =>
                  updateField("altMobileNo", v.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit number"
              />
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? "#9ca3af" : "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "9px 28px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleClose}
            style={{
              background: "#0891b2",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "9px 28px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Close
          </button>
        </div>
      </fieldset>
    </div>
  );
};

export default StaffVerification;
