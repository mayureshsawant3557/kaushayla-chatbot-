import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@mui/material";
import user from "../../assets/login-bro.svg";
import { ThemeContext } from "../Context/ThemeContext";
import { X, User, UserPlus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AccountLogin,
  autoLogin,
} from "../../Endpoints_All/Account/authentication";
import Swal from "sweetalert2";
import { useLoading } from "../../Hooks/useLoading";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAccount } from "../../lib/hooks/useAccount";
import { setAccessToken } from "../../lib/api/authService";
import { useAuth } from "../../Hooks/AuthContext";
import ChangeSecurityQuestion from "../Login/Miscellaneous/ChangeSecurityQuestion";
import Captcha from "../base/Captcha";

const UpdatedSignInPage = ({ onLoginStateChange }) => {
  const { color } = useContext(ThemeContext);
  const [showPopup, setShowPopup] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const captchaRef = useRef(null);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const canvasRef = useRef(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    autoLogin,
    loginProcess,
    data,
    error,
    isError,
    isLoading: isLoginLoading,
    isSuccess,
  } = useAccount();

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    profileId: "",
    password: "",
    captcha: "",
  });

  const [formData, setFormData] = useState({
    profileId: "",
    password: "",
    captcha: "",
  });

  const { startLoading, stopLoading, isLoading } = useLoading();
  const [captchaText, setCaptchaText] = useState("");
  const [captchaMessage, setCaptchaMessage] = useState("");
  const [userType, setUserType] = useState("");
  const { login } = useAuth();


  // Extract JWT token from URL query on mount and call auto-login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      handleAutoLogin(tokenFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCaptchaValidation = (name, error) => {
    setIsCaptchaValid(!error);

    setValidationErrors((prev) => ({
      ...prev,
      captcha: error || "",
    }));
  };

  const normalizeRedirectUrl = (url = "/") => {
    let cleaned = url
      .replace(/^(\.+\/)+/, "")
      .replace(/^\/+/, "/")
      .replace(/\/+/g, "/");
    return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  };

  function passwordtohash(str) {
    try {
      return btoa(str);
    } catch (error) {
      return btoa(unescape(encodeURIComponent(str)));
    }
  }

  function generateCaptcha() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  }

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    ctx.font = "30px Arial";
    ctx.fillStyle = "#000";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    const x = canvas.width / 2;
    const y = canvas.height / 2 + 5;
    const angle = (Math.random() - 0.5) * 0.4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(captchaText, 0, 0);
    ctx.restore();
  };

  useEffect(() => {
    if (showSignInPopup) {
      const newCaptcha = generateCaptcha();
      setCaptchaText(newCaptcha);
      setCaptchaMessage("");
      setFormData({ profileId: "", password: "", captcha: "" });
      setValidationErrors({ profileId: "", password: "", captcha: "" });
      setLoginError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSignInPopup]);

  useEffect(() => {
    if (captchaText) drawCaptcha();
  }, [captchaText]);

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setCaptchaMessage("");
    setFormData((prev) => ({ ...prev, captcha: "" }));
    setValidationErrors((prev) => ({ ...prev, captcha: "" }));
  };

  const handleRegisterClick = () => setShowPopup(true);
  const handleSignInClick = () => setShowSignInPopup(true);

  const handleUserTypeChange = (e) => setUserType(e.target.value);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "captcha" || name === "profileId" ? value.toUpperCase() : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (loginError) setLoginError("");
  };

  const validateForm = () => {
    const errors = {
      profileId: "",
      password: "",
      captcha: "",
    };
    let isValid = true;

    if (!formData.profileId.trim()) {
      errors.profileId = t("Profile_ID_Required");
      isValid = false;
    }
    if (!formData.password.trim()) {
      errors.password = t("Password_Required");
      isValid = false;
    }
    if (!formData.captcha.trim()) {
      errors.captcha = t("CAPTCHA_Required");
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  function generateLegacyToken(userLoginID) {
    return btoa(userLoginID + ":" + new Date().getTime());
  }

  useEffect(() => {
    const openLogin = sessionStorage.getItem("OPEN_LOGIN_POPUP");

    if (openLogin === "true") {
      setShowSignInPopup(true);
      sessionStorage.removeItem("OPEN_LOGIN_POPUP");
    }
  }, []);

  useEffect(() => {
    if (!isError || !error) return;
    captchaRef.current?.refresh();
    switch (error.code) {
      case "MULTIPLE_LOGIN":
        Swal.fire({
          title: t("Close_Other_Logins"),
          text: t("Close_Other_Logins_Message"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: t("Yes"),
          cancelButtonText: t("No"),
        }).then((result) => {
          if (result.isConfirmed) {
            completeLoginProcess(error.payload);
          }
        });
        break;

      case "LOGIN_NOT_ALLOWED":
        Swal.fire({
          icon: "error",
          title: t("Login_Failed"),
          text: error.message,
        });
        break;

      case "TOKEN_MISSING":
        Swal.fire({
          icon: "error",
          title: t("System_Error"),
          text: t("Authentication_Token_Missing"),
        });
        break;

      default:
        Swal.fire({
          icon: "error",
          title: t("Login_Failed"),
          text: error.message || t("Unexpected_Error"),
        });
    }
  }, [isError, error, t]);

  useEffect(() => {
    if (isSuccess && data) {
      completeLoginProcess(data);
    }
  }, [isSuccess, data]);

  const completeLoginProcess = (data) => {
    setAccessToken(data.AccessToken);
    login(data.UserLoginID, data.UserTypeCode, data);

    if (data.SecurityQuestionID <= 0) {
      //navigate(`/${data.UserTypeCode}/change-security-question`, {
      //  replace: true,
      //});
      navigate("/Candidate/ChangeSecurityQuestion", {
        replace: true,
      });

      // <ChangeSecurityQuestion/>
      return;
    }

    navigate(normalizeRedirectUrl(data.DashBoardPathReact), { replace: true });
  };

  const handleAutoLogin = async (jwtToken) => {
    if (!jwtToken) {
      Swal.fire({
        icon: "error",
        title: t("Token_Missing"),
        text: t("No_Token_Found"),
      }).then(() => navigate("/"));
      return;
    }

    autoLogin(jwtToken);
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const captchaValid = await captchaRef.current?.validate();
    if (!captchaValid) {
        //captchaRef.current?.refresh();
        setTimeout(() => {
            captchaRef.current?.refresh();
        }, 1000);
        return;
    }
    setCaptchaMessage(t("Correct_CAPTCHA"));

    loginProcess({
      userLoginID: formData.profileId,
      userPassword: passwordtohash(formData.password),
    });
  };

  const handleSubmit = () => {
    if (!userType) {
      alert(t("Please_Select_User_Type"));
      return;
    }
    if (userType === "Candidate") navigate("/candidate/register");
    else if (userType === "Staff") navigate("/staff/register");
    else if (userType === "Institute") navigate("/institute/register");
    setShowPopup(false);
  };

  const handleClickHere = () => {
    navigate("/AccountRecovery");
  };

  return (
    <div className="relative mx-auto w-full max-w-[620px] pt-3">
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 mt-5 z-10">
        <div
          className={`flex items-center justify-center ${color} px-4 py-1.5 rounded-lg shadow-md`}
        >
          <svg
            className="mr-2 h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-2xl font-semibold text-white tracking-wide">
            {t("Sign_In")}
          </span>
        </div>
      </div>

      <Card className="w-full border space-y-3">
        <img
          src={user}
          className="m-2 mx-auto mt-6 h-30 w-1/3"
          alt={t("User_illustration")}
        />

        <CardContent className="space-y-3 px-2">
          <div className="flex items-center justify-evenly">
            <div className="text-lg text-gray-700">{t("Existing_User_Question")}</div>
            <button
              onClick={handleSignInClick}
              style={{
                backgroundColor: color,
                color: "white",
              }}
              className="bg-[#BC460B] hover:opacity-90 rounded-full min-w-[140px] px-2 py-2"
            >
              {t("Sign_In")}
            </button>
          </div>

          <div className="flex items-center justify-evenly mt-5">
            <div className="text-lg text-gray-700">{t("Not_Registered_Question")}</div>
            <button
              onClick={handleRegisterClick}
              style={{
                backgroundColor: color,
                color: "white",
              }}
              className="bg-[#BC460B] hover:opacity-90 rounded-full text-md min-w-[140px] px-6 py-2"
            >
              {t("Register_Here")}
            </button>
          </div>

          <div className="mt-4 text-center">
            <div className="text-md text-gray-700">
              {t("Having_Trouble_Signing_In")}
              <button
                type="button"
                className="text-lg font-semi-bold ml-2 text-[#1D4ED8] hover:text-[#417cfa]"
                onClick={handleClickHere}
              >
                {t("Click_Here")}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showSignInPopup && (
        // z-index raised from z-20 -> z-[100]: the nav bar (`sticky z-50`)
        // and its dropdown panel (`z-[60]`) both sat above this modal's old
        // z-20, so the nav rendered on top of the overlay/backdrop instead
        // of being covered by it. z-[100] guarantees the modal always wins.
        // backdrop-blur-sm added so the page content behind the overlay
        // is blurred, not just darkened.
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-lg bg-white shadow-lg sm:mx-0">
            <div
              className={`${color} text-white p-4 rounded-t-lg flex justify-between items-center`}
            >
              <div className="flex items-center gap-2">
                <User size={24} />
                <h2 className="text-lg font-semibold sm:text-xl">
                  {t("Sign_In")}
                </h2>
              </div>
              <button
                onClick={() => setShowSignInPopup(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="profileId"
                    placeholder={t("PROFILE_ID")}
                    value={formData.profileId}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${validationErrors.profileId
                      ? "border-red-500"
                      : "border-gray-300"
                      } bg-[#F8FBFE] p-2 text-sm text-gray-700 placeholder-gray-400 sm:p-3 sm:text-base`}
                  />
                  {validationErrors.profileId && (
                    <p className="mt-1 text-sm text-red-500">
                      {validationErrors.profileId}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("PASSWORD")}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${validationErrors.password
                      ? "border-red-500"
                      : "border-gray-300"
                      } bg-[#F8FBFE] p-2 pr-10 text-sm text-gray-700 placeholder-gray-400 sm:p-3 sm:pr-12 sm:text-base`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 sm:right-3"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="w-full sm:flex-1">
                    <Captcha
                      ref={captchaRef}
                      name="captcha"
                      label=""
                      type="alphanumeric"
                      difficulty="easy"
                      required
                      clearable
                      enableVoice
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          captcha: value,
                        }))
                      }
                      onValidationChange={handleCaptchaValidation}
                    />
                  </div>
                </div>

                {captchaMessage && (
                  <div className="text-center text-sm">
                    <span
                      className={
                        captchaMessage.includes("✅") || captchaMessage.includes("बरोबर")
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {captchaMessage}
                    </span>
                  </div>
                )}

                {loginError && (
                  <div className="text-center text-sm">
                    <span className="text-red-600">{loginError}</span>
                  </div>
                )}

                <div className="text-md text-gray-700">
                  {t("Having_Trouble_Signing_In")}
                  <button
                    type="button"
                    className="text-md ml-2 text-[#1D4ED8] hover:text-[#417cfa]"
                    onClick={handleClickHere}
                  >
                    {t("Click_Here")}
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-md bg-[#0D6EFD] px-6 py-2 text-base font-medium text-white hover:bg-blue-600 disabled:bg-blue-300 sm:px-8 sm:text-lg"
                  >
                    {isLoading ? t("Logging_In") : t("Login")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        // Same z-index fix as the Sign In modal above: z-20 -> z-[100],
        // plus backdrop-blur-sm to match.
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-lg bg-white shadow-lg sm:mx-0">
            <div
              className={`${color} text-white p-4 rounded-t-lg flex justify-between items-center`}
            >
              <div className="flex items-center gap-2">
                <UserPlus size={24} />
                <h2 className="text-lg font-semibold sm:text-xl">
                  {t("New_User_Registration")}
                </h2>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <select
                value={userType}
                onChange={handleUserTypeChange}
                className="mb-4 w-full rounded-md border border-gray-300 bg-[#F8FBFE] p-2 text-sm text-gray-700 sm:p-3 sm:text-base"
              >
                <option value="">{t("Select_User_Type")}</option>
                <option value="Candidate">{t("Candidate")}</option>
                <option value="Staff">{t("Staff/Management")}</option>
                <option value="Institute">
                  {t("Skill_Developement_Institute")}
                </option>
              </select>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!userType}
                  className="rounded-md bg-[#0D6EFD] px-6 py-2 text-base font-medium text-white hover:bg-blue-600 disabled:bg-blue-300 sm:px-8 sm:text-lg"
                >
                  {t("REGISTER")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatedSignInPage;