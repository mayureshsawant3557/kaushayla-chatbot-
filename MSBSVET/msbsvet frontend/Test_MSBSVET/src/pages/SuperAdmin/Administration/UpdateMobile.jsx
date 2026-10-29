
// import { useState, useContext, useRef } from "react";
// import { ThemeContext } from "../../../Component/Context/ThemeContext";
// import { FaFileAlt } from "react-icons/fa";
// import { Eye, EyeOff } from "lucide-react";
// import { SwalHelper } from "../../../utils/swalHelper";
// import agent from "../../../lib/api/agent";
// import axios from "axios";
// import OTPService from "../../../Component/formcomponent/OTPService";

// import {
//   getMobileNoDuplicateAPI,
//   getUserLoginIdsByNameAPI,
//   updateMobileNumberAPI,
//   resetPasswordAPI,
// } from "../../../Endpoints_All/Administration/admin";

// export default function UpdatePasswordMobile() {
//   const { color } = useContext(ThemeContext);

//   const actionRef = useRef(null);

//   const [loginId, setLoginId] = useState("");
//   const [updateType, setUpdateType] = useState("");
//   const [searched, setSearched] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [userData, setUserData] = useState({
//     loginId: "",
//     userName: "",
//     mobile: "",
//   });

//   const [mobileNumber, setMobileNumber] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   // ── OTP SERVICE ──
//   const otpService = OTPService({
//     purpose: "Verification",
//     messege: "Enter OTP sent to your registered mobile number",

//     onSuccess: async () => {
//       if (actionRef.current === "mobile") {
//         await saveMobileAfterOTP();
//       }
//       if (actionRef.current === "password") {
//         await updatePasswordAfterOTP();
//       }
//     },

//     onError: () => {
//       SwalHelper.error("Error", "OTP verification failed");
//     },
//   });

//   const getUserMobile = async () => {
//     try {
//       const userInfo = JSON.parse(sessionStorage.getItem("userInfoAll"));
//       const userID = userInfo?.UserID;

//       if (!userID) {
//         return null;
//       }

//       const res = await agent.get(
//         `/api/UserManagement/GetUserDetails/${userID}`
//       );

//       return res?.data?.UserMobileNo;
//     } catch (err) {
//       console.error("Error fetching user mobile:", err);
//       return null;
//     }
//   };

//   // ── SEARCH ──
//   const handleSearch = async () => {
//     const errors = [];
//     if (!loginId) errors.push("Please Enter Application Form Number.");
//     if (!updateType) errors.push("Please Select Update Type Status.");

//     if (errors.length > 0) {
//       SwalHelper.error("Errors", errors.map((e) => `• ${e}`).join("<br/>"));
//       return;
//     }

//     setLoading(true);
//     setSearched(false);

//     try {
//       const res = await agent.get(`${getUserLoginIdsByNameAPI}/${loginId}`);
//       const data = Array.isArray(res.data) ? res.data[0] : res.data;

//       if (!data) {
//         SwalHelper.warning("Not Found", "No user found for the given Login ID.");
//         return;
//       }

//       setUserData({
//         loginId: data.UserLoginID || "",
//         userName: data.UserName || "",
//         mobile: data.UserMobileNo || "",
//       });

//       setMobileNumber(data.UserMobileNo || "");
//       setNewPassword("");
//       setConfirmPassword("");
//       setSearched(true);
//     } catch (err) {
//       console.log(err);
//       SwalHelper.error("Error", "Search failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── MOBILE BUTTON CLICK (OTP FIRST) ──
//   const handleSaveMobile = async () => {
//     const mobile = await getUserMobile();

//     if (!mobile) {
//       SwalHelper.error("Error", "Mobile number not found");
//       return;
//     }

//     actionRef.current = "mobile";
//     otpService.startVerification(mobile);
//   };

//   // ── SAVE MOBILE AFTER OTP ──
//   const saveMobileAfterOTP = async () => {
//     if (!mobileNumber) {
//       SwalHelper.error("Validation", "Please enter a mobile number.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const dupRes = await agent.get(`${getMobileNoDuplicateAPI}/${mobileNumber}`);

//       if (dupRes?.data?.Status === "Duplicate") {
//         SwalHelper.warning(
//           "Warning",
//           `Primary Mobile Number already registered for<br/>
//            Profile ID: ${dupRes.data.ProfileID || ""}<br/>
//            Name: ${dupRes.data.UserName || ""}<br/>
//            Enter Other Primary Mobile Number.`
//         );
//         return;
//       }

//       const res = await agent.post(updateMobileNumberAPI, {
//         userLoginID: userData.loginId,
//         mobileNo: mobileNumber,
//         ipAddress: "",
//         modifyBy: userData.loginId,
//       });

//       if (res?.status === 200) {
//         SwalHelper.success("Success", "Mobile number updated successfully!");
//       }
//     } catch (err) {
//       SwalHelper.error(
//         "Error",
//         err?.response?.data || "Update failed. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── PASSWORD BUTTON CLICK (OTP FIRST) ──
//   const handleUpdatePassword = async () => {
//     const mobile = await getUserMobile();

//     if (!mobile) {
//       SwalHelper.error("Error", "Mobile number not found");
//       return;
//     }

//     actionRef.current = "password";
//     otpService.startVerification(mobile);
//   };

//   // ── UPDATE PASSWORD AFTER OTP ──
//   const updatePasswordAfterOTP = async () => {
//     const errors = [];
//     if (!newPassword) errors.push("Please enter new password.");
//     if (!confirmPassword) errors.push("Please enter confirm password.");

//     const passwordRegex = /^(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/;
//     if (newPassword && !passwordRegex.test(newPassword)) {
//       errors.push(
//         "Password must be at least 8 characters and contain at least one special character."
//       );
//     }

//     if (newPassword !== confirmPassword)
//       errors.push("Passwords do not match.");

//     if (errors.length > 0) {
//       SwalHelper.error("Errors", errors.map((e) => `• ${e}`).join("<br/>"));
//       return;
//     }

//     setLoading(true);

//     try {
//       // ── use agent with silent:true so agent does NOT reject
//       // ── and we get the raw response including error data
//       const res = await agent.post(resetPasswordAPI, {
//         userLoginID: userData.loginId,
//         securityQuestionID: 0,
//         securityQuestionAnswer: "",
//         newPassword: newPassword,
//         errorMessage: "",
//         ipAddress: "",
//       }, { silent: true });

//       // ── if status is not 200/2xx show the raw data as message
//       if (res?.status === 200 || res?.status === 201) {
//         SwalHelper.success(
//           "Success",
//           typeof res.data === "string"
//             ? res.data
//             : "Password updated successfully!"
//         );
//         setNewPassword("");
//         setConfirmPassword("");
//       } else {
//         // ── API returned error (400 etc) — data is the plain string message
//         const apiMsg =
//           typeof res?.data === "string" && res.data.trim() !== ""
//             ? res.data.trim()
//             : res?.data?.message ||
//               res?.data?.Message ||
//               res?.data?.error ||
//               "Update failed.";

//         SwalHelper.warning("Warning", apiMsg);
//       }
//     } catch (err) {
//       // ── fallback if silent still throws
//       const apiMsg =
//         typeof err?.data === "string" && err.data.trim() !== ""
//           ? err.data.trim()
//           : err?.message && err.message !== "undefined"
//           ? err.message
//           : "Update failed.";

//       SwalHelper.warning("Warning", apiMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── RESET ──
//   const handleReset = () => {
//     setLoginId("");
//     setUpdateType("");
//     setSearched(false);
//     setUserData({ loginId: "", userName: "", mobile: "" });
//     setMobileNumber("");
//     setNewPassword("");
//     setConfirmPassword("");
//   };

//   return (
//     <div className="w-full p-4">

//       {/* ── SEARCH PANEL ── */}
//       <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg mb-6">
//         <legend
//           className={`flex ${color} items-center text-base font-semibold text-white px-3 py-1.5 rounded-md ml-4`}
//         >
//           <FaFileAlt className="mr-2" />
//           Update Password / Mobile No
//         </legend>

//         <div className="px-6 pt-4 pb-6">
//           <div className="flex flex-wrap items-end gap-10">

//             {/* Login ID */}
//             <div className="flex flex-col gap-1">
//               <label className="text-sm font-medium text-gray-700">
//                 Application Form Number / User Login ID{" "}
//                 <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={loginId}
//                 onChange={(e) => {
//                   setLoginId(e.target.value);
//                   setSearched(false);
//                 }}
//                 className="border border-gray-300 rounded-md px-3 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-green-500"
//                 placeholder="Enter Login ID"
//               />
//             </div>

//             {/* Update Type */}
//             <div className="flex flex-col gap-1">
//               <label className="text-sm font-medium text-gray-700">
//                 Select Update Type <span className="text-red-500">*</span>
//               </label>
//               <div className="flex items-center gap-6 mt-1">
//                 <label className="flex items-center gap-2 text-sm cursor-pointer">
//                   <input
//                     type="radio"
//                     value="Password"
//                     checked={updateType === "Password"}
//                     onChange={() => { setUpdateType("Password"); setSearched(false); }}
//                   />
//                   Password
//                 </label>
//                 <label className="flex items-center gap-2 text-sm cursor-pointer">
//                   <input
//                     type="radio"
//                     value="Mobile No"
//                     checked={updateType === "Mobile No"}
//                     onChange={() => { setUpdateType("Mobile No"); setSearched(false); }}
//                   />
//                   Mobile No
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-center gap-3 mt-6">
//             <button
//               onClick={handleSearch}
//               disabled={loading}
//               className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-8 py-2 rounded-md shadow transition-colors"
//             >
//               {loading ? "Searching..." : "Search"}
//             </button>
//             <button
//               onClick={handleReset}
//               disabled={loading}
//               className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-8 py-2 rounded-md shadow transition-colors"
//             >
//               Reset
//             </button>
//           </div>
//         </div>
//       </fieldset>

//       {/* ── MOBILE PANEL ── */}
//       {searched && updateType === "Mobile No" && (
//         <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg mb-6">
//           <legend
//             className={`flex ${color} items-center text-base font-semibold text-white px-3 py-1.5 rounded-md ml-4`}
//           >
//             <FaFileAlt className="mr-2" />
//             Update Mobile Number
//           </legend>

//           <div className="px-6 pt-4 pb-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   Login ID <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   value={userData.loginId}
//                   readOnly
//                   className="border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm w-full cursor-not-allowed"
//                 />
//               </div>

//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   User Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   value={userData.userName}
//                   readOnly
//                   className="border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm w-full cursor-not-allowed"
//                 />
//               </div>

//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   User Mobile Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   value={mobileNumber}
//                   onChange={(e) => setMobileNumber(e.target.value)}
//                   className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"
//                   placeholder="Enter mobile number"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-center mt-6">
//               <button
//                 onClick={handleSaveMobile}
//                 disabled={loading}
//                 className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-8 py-2 rounded-md shadow transition-colors"
//               >
//                 {loading ? "Saving..." : "Save"}
//               </button>
//             </div>
//           </div>
//         </fieldset>
//       )}

//       {/* ── PASSWORD PANEL ── */}
//       {searched && updateType === "Password" && (
//         <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg mb-6">
//           <legend
//             className={`flex ${color} items-center text-base font-semibold text-white px-3 py-1.5 rounded-md ml-4`}
//           >
//             <FaFileAlt className="mr-2" />
//             Update Password
//           </legend>

//           <div className="px-6 pt-4 pb-6">
//             {/* Read-only user info */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   Login ID <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   value={userData.loginId}
//                   readOnly
//                   className="border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm w-full cursor-not-allowed"
//                 />
//               </div>

//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   User Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   value={userData.userName}
//                   readOnly
//                   className="border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm w-full cursor-not-allowed"
//                 />
//               </div>
//             </div>

//             {/* Password fields with eye toggle */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   New Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showNewPassword ? "text" : "password"}
//                     placeholder="Enter new password"
//                     value={newPassword}
//                     onChange={(e) => setNewPassword(e.target.value)}
//                     className="border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowNewPassword((prev) => !prev)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     tabIndex={-1}
//                   >
//                     {showNewPassword ? (
//                       <EyeOff className="w-4 h-4" />
//                     ) : (
//                       <Eye className="w-4 h-4" />
//                     )}
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">
//                   Min. 8 characters with at least one special character (@, #, $, !, %, *, ?, &)
//                 </p>
//               </div>

//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   Confirm Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     placeholder="Confirm new password"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     className="border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword((prev) => !prev)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     tabIndex={-1}
//                   >
//                     {showConfirmPassword ? (
//                       <EyeOff className="w-4 h-4" />
//                     ) : (
//                       <Eye className="w-4 h-4" />
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-center mt-6">
//               <button
//                 onClick={handleUpdatePassword}
//                 disabled={loading}
//                 className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-8 py-2 rounded-md shadow transition-colors"
//               >
//                 {loading ? "Updating..." : "Update Password"}
//               </button>
//             </div>
//           </div>
//         </fieldset>
//       )}
//     </div>
//   );
// }
import { useState, useContext, useRef } from "react";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { FaFileAlt } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { SwalHelper } from "../../../utils/swalHelper";
import agent from "../../../lib/api/agent";
import axios from "axios";
import OTPService from "../../../Component/formcomponent/OTPService";
import PasswordFields from "../../../Component/formcomponent/PasswordFields";

import {
  getMobileNoDuplicateAPI,
  getUserLoginIdsByNameAPI,
  updateMobileNumberAPI,
  resetPasswordAPI,
} from "../../../Endpoints_All/Administration/admin";
import { useAuth } from "../../../Hooks/AuthContext";

export default function UpdatePasswordMobile() {
  const { color } = useContext(ThemeContext);
  const {userInfo} = useAuth();
const [passwordErrors, setPasswordErrors] = useState({});
  const actionRef = useRef(null);
  const passwordValidatedRef = useRef(false); // ← tracks if pre-check already passed

  const [loginId, setLoginId] = useState("");
  const [updateType, setUpdateType] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    loginId: "",
    userName: "",
    mobile: "",
  });

  const [mobileNumber, setMobileNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── OTP SERVICE ──
  const otpService = OTPService({
    purpose: "Verification",
    messege: "Enter OTP sent to your registered mobile number",

    onSuccess: async () => {
      if (actionRef.current === "mobile") {
        await saveMobileAfterOTP();
      }
      if (actionRef.current === "password") {
        await updatePasswordAfterOTP();
      }
    },

    onError: () => {
      SwalHelper.error("Error", "OTP verification failed");
    },
  });

  const getUserMobile = async () => {
    try {
      const userID = userInfo?.UserID;

      if (!userID) {
        return null;
      }

      const res = await agent.get(
        `/api/UserManagement/GetUserDetails/${userID}`
      );

      return res?.data?.UserMobileNo;
    } catch (err) {
      return null;
    }
  };

  // ── SEARCH ──
  const handleSearch = async () => {
    const errors = [];
    if (!loginId) errors.push("Please Enter Application Form Number.");
    if (!updateType) errors.push("Please Select Update Type Status.");

    if (errors.length > 0) {
      SwalHelper.error("Errors", errors.map((e) => `• ${e}`).join("<br/>"));
      return;
    }

    setLoading(true);
    setSearched(false);

    try {
      const res = await agent.get(`${getUserLoginIdsByNameAPI}/${loginId}`);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;

      if (!data) {
        SwalHelper.warning("Not Found", "No user found for the given Login ID.");
        return;
      }

      setUserData({
        loginId: data.UserLoginID || "",
        userName: data.UserName || "",
        mobile: data.UserMobileNo || "",
      });

      setMobileNumber(data.UserMobileNo || "");
      setNewPassword("");
      setConfirmPassword("");
      setSearched(true);
    } catch (err) {
      SwalHelper.error("Error", "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── MOBILE BUTTON CLICK (OTP FIRST) ──
  const handleSaveMobile = async () => {
    const mobile = await getUserMobile();

    if (!mobile) {
      SwalHelper.error("Error", "Mobile number not found");
      return;
    }

    actionRef.current = "mobile";
    otpService.startVerification(mobile);
  };

  // ── SAVE MOBILE AFTER OTP ──
  const saveMobileAfterOTP = async () => {
    if (!mobileNumber) {
      SwalHelper.error("Validation", "Please enter a mobile number.");
      return;
    }

    setLoading(true);

    try {
      const dupRes = await agent.get(`${getMobileNoDuplicateAPI}/${mobileNumber}`);

      if (dupRes?.data?.Status === "Duplicate") {
        SwalHelper.warning(
          "Warning",
          `Primary Mobile Number already registered for<br/>
           Profile ID: ${dupRes.data.ProfileID || ""}<br/>
           Name: ${dupRes.data.UserName || ""}<br/>
           Enter Other Primary Mobile Number.`
        );
        return;
      }

      const res = await agent.post(updateMobileNumberAPI, {
        userLoginID: userData.loginId,
        mobileNo: mobileNumber,
        ipAddress: "",
        modifyBy: userData.loginId,
      });

      if (res?.status === 200) {
        SwalHelper.success("Success", "Mobile number updated successfully!");
      }
    } catch (err) {
      SwalHelper.error(
        "Error",
        err?.response?.data || "Update failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── PASSWORD BUTTON CLICK ──
  // NEW FLOW: Validate fields → Check last 3 passwords via API → If reused show warning (stop)
  //           → If OK, send OTP → On OTP success, update password
  const handleUpdatePassword = async () => {
    // Step 1: Basic field validation (before any API call)
    const errors = [];
   if (Object.keys(passwordErrors).length > 0) {
  SwalHelper.error("Errors", "Please fix password errors first");
  return;
}

    const passwordRegex = /^(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/;
    if (newPassword && !passwordRegex.test(newPassword)) {
      errors.push(
        "Password must be at least 8 characters and contain at least one special character."
      );
    }

    if (newPassword !== confirmPassword) errors.push("Passwords do not match.");

    if (errors.length > 0) {
      SwalHelper.error("Errors", errors.map((e) => `• ${e}`).join("<br/>"));
      return;
    }

    // Step 2: Check against last 3 passwords BEFORE triggering OTP
    setLoading(true);
    try {
      const checkRes = await agent.post(
        resetPasswordAPI,
        {
          userLoginID: userData.loginId,
          securityQuestionID: 0,
          securityQuestionAnswer: "",
          newPassword: newPassword,
          errorMessage: "",
          ipAddress: "",
        },
        { silent: true }
      );

      // Non-2xx means password is reused — show DB message and STOP (no OTP)
      if (checkRes?.status !== 200 && checkRes?.status !== 201) {
        const apiMsg =
          typeof checkRes?.data === "string" && checkRes.data.trim() !== ""
            ? checkRes.data.trim()
            : checkRes?.data?.message ||
              checkRes?.data?.Message ||
              checkRes?.data?.error ||
              "This password was used recently. Please choose a different password.";

        SwalHelper.warning("Password Not Allowed", apiMsg);
        return; // ← Hard stop: do NOT proceed to OTP
      }

      // ← Pre-check passed, mark as validated
      passwordValidatedRef.current = true;
    } catch (err) {
      const apiMsg =
        typeof err?.data === "string" && err.data.trim() !== ""
          ? err.data.trim()
          : err?.message && err.message !== "undefined"
          ? err.message
          : "Password validation failed. Please try again.";

      SwalHelper.warning("Warning", apiMsg);
      return; // ← Hard stop: do NOT proceed to OTP
    } finally {
      setLoading(false);
    }

    // Step 3: Password passed the last-3 check → Now trigger OTP
    const mobile = await getUserMobile();
    if (!mobile) {
      SwalHelper.error("Error", "Mobile number not found");
      return;
    }

    actionRef.current = "password";
    otpService.startVerification(mobile);
  };

  // ── UPDATE PASSWORD AFTER OTP SUCCESS ──
  // NOTE: resetPasswordAPI was already called successfully in handleUpdatePassword (pre-check).
  // That call both validated AND updated the password in the DB.
  // So here we just show success — no second API call needed.
  const updatePasswordAfterOTP = async () => {
    if (passwordValidatedRef.current) {
      // Password was already saved during the pre-check step
      SwalHelper.success("Success", "Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      passwordValidatedRef.current = false; // reset for next use
      return;
    }

    // Fallback (should not normally reach here)
    setLoading(true);
    try {
      const res = await agent.post(
        resetPasswordAPI,
        {
          userLoginID: userData.loginId,
          securityQuestionID: 0,
          securityQuestionAnswer: "",
          newPassword: newPassword,
          errorMessage: "",
          ipAddress: "",
        },
        { silent: true }
      );

      if (res?.status === 200 || res?.status === 201) {
        SwalHelper.success(
          "Success",
          typeof res.data === "string" ? res.data : "Password updated successfully!"
        );
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const apiMsg =
          typeof res?.data === "string" && res.data.trim() !== ""
            ? res.data.trim()
            : res?.data?.message ||
              res?.data?.Message ||
              res?.data?.error ||
              "Update failed.";
        SwalHelper.warning("Warning", apiMsg);
      }
    } catch (err) {
      const apiMsg =
        typeof err?.data === "string" && err.data.trim() !== ""
          ? err.data.trim()
          : err?.message && err.message !== "undefined"
          ? err.message
          : "Update failed.";
      SwalHelper.warning("Warning", apiMsg);
    } finally {
      setLoading(false);
    }
  };

  // ── RESET ──
  const handleReset = () => {
    setLoginId("");
    setUpdateType("");
    setSearched(false);
    setUserData({ loginId: "", userName: "", mobile: "" });
    setMobileNumber("");
    setNewPassword("");
    setConfirmPassword("");
    passwordValidatedRef.current = false; // ← reset flag
  };

  return (
    <div className="w-full p-4">

      {/* ── SEARCH PANEL ── */}
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg mb-6">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white px-3 py-1.5 rounded-md ml-4`}
        >
          <FaFileAlt className="mr-2" />
          Update Password / Mobile No
        </legend>

        <div className="px-6 pt-4 pb-6">
          <div className="flex flex-wrap items-end gap-10">

            {/* Login ID */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Application Form Number / User Login ID{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  setSearched(false);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter Login ID"
              />
            </div>

            {/* Update Type */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Select Update Type <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6 mt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value="Password"
                    checked={updateType === "Password"}
                    onChange={() => { setUpdateType("Password"); setSearched(false); }}
                  />
                  Password
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value="Mobile No"
                    checked={updateType === "Mobile No"}
                    onChange={() => { setUpdateType("Mobile No"); setSearched(false); }}
                  />
                  Mobile No
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-8 py-2 rounded-md shadow transition-colors"
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-8 py-2 rounded-md shadow transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </fieldset>

      {/* ── MOBILE PANEL ── */}
      {searched && updateType === "Mobile No" && (
        <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg mb-6">
          <legend
            className={`flex ${color} items-center text-base font-semibold text-white px-3 py-1.5 rounded-md ml-4`}
          >
            <FaFileAlt className="mr-2" />
            Update Mobile Number
          </legend>

          <div className="px-6 pt-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Login ID <span className="text-red-500">*</span>
                </label>
                <input
                  value={userData.loginId}
                  readOnly
                  className="border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm w-full cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={userData.userName}
                  readOnly
                  className="border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm w-full cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  User Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleSaveMobile}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-8 py-2 rounded-md shadow transition-colors"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </fieldset>
      )}

      {/* ── PASSWORD PANEL ── */}
      {searched && updateType === "Password" && (
        <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg mb-6">
          <legend
            className={`flex ${color} items-center text-base font-semibold text-white px-3 py-1.5 rounded-md ml-4`}
          >
            <FaFileAlt className="mr-2" />
            Update Password
          </legend>

          <div className="px-6 pt-4 pb-6">
            {/* Read-only user info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Login ID <span className="text-red-500">*</span>
                </label>
                <input
                  value={userData.loginId}
                  readOnly
                  className="border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm w-full cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={userData.userName}
                  readOnly
                  className="border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm w-full cursor-not-allowed"
                />
              </div>
            </div>

          <PasswordFields
  newPassword={newPassword}
  confirmPassword={confirmPassword}
  setNewPassword={setNewPassword}
  setConfirmPassword={setConfirmPassword}
  setErrorsFromParent={setPasswordErrors}
/>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-8 py-2 rounded-md shadow transition-colors"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </fieldset>
      )}
    </div>
  );
}