import { useRef, useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import FormComponent from "../formcomponent/FormComponent";
import UploadPdf from "../formcomponent/UploadPdf";
import SecurityQuestion from "../formcomponent/SecurityQuestion";
import CaptchaComponent from "../formcomponent/CaptchaComponent";
import { DateInput } from "../formcomponent/DateInputComponent";
import { SwalHelper } from "../../utils/swalHelper";
import { AiOutlineCheckCircle } from "react-icons/ai";
import OTPService from "../formcomponent/OTPService";
// import { IsMobileNoDuplicate } from "../../Endpoints_All/Registration/registration";
import { GetDuplicateAadharCandidatePrimary } from "../../Endpoints_All/Candidate/primary";
import agent from "../../lib/api/agent";
import Swal from "sweetalert2";
import { RegisterCandidateStep } from "../../Endpoints_All/SchoolStep/CourseAndRegister";
import { useAuth } from "../../Hooks/AuthContext";
import { getDeviceIP } from "../../utils/CommonHelper";

const RegisterCandidates = () => {
  const captchaRef = useRef();
  const securityRef = useRef();
  const aadharUploadRef = useRef();
  const photoUploadRef = useRef();
  const [aadharData, setAadharData] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isCheckingAadhar, setIsCheckingAadhar] = useState(false);
  const [isAadharDuplicate, setIsAadharDuplicate] = useState(false);
  const [errors, setErrors] = useState({});
  const [ipAddress, setIpAddress] = useState("0.0.0.0");
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    aadhar: "",
    primaryMobile: "",
    secondaryMobile: "",
    email: "",
  });
  const { userInfo } = useAuth();
  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);

    } catch (err) {
      console.error("Failed to get IP:", err);
    }
  };
  const otpService = OTPService({
    mobileNo: formData.primaryMobile,
    purpose: "Registration",
    isDuplicateCheck: false,
    // duplicateCheckUrl: null,
    onSuccess: () => {
      setIsVerified(true);
    },
  });

  useEffect(() => {
    fetchIP();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleVerifyClick = async () => {
    await otpService.startVerification();
  };

  const isAadharValid = (aadhaar) => {
    const regex = /^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$|^[2-9]{1}[0-9]{11}$/;
    return regex.test(aadhaar);
  };

  useEffect(() => {
    const cleanAadhar = formData.aadhar.replace(/\s+/g, "");

    if (cleanAadhar.length !== 12 || !isAadharValid(cleanAadhar)) {
      setIsAadharDuplicate(false);
      return;
    }

    const checkDuplicate = async () => {
      try {
        setIsCheckingAadhar(true);

        const { data } = await agent.get(
          `${GetDuplicateAadharCandidatePrimary}?aadharNo=${cleanAadhar}&candidateId=0`,
        );

        if (data?.Status === "Success" && data?.Data?.IsDuplicate === true) {
          const name = data?.Data?.CandidateName;
          const appId = data?.Data?.ApplicationID;

          setIsAadharDuplicate(true);

          Swal.fire({
            icon: "warning",
            title: "Duplicate Aadhaar Found ⚠️",
            html: `
      <div style="font-size:15px">
        <p><b>Name:</b> ${name}</p>
        <p><b>Application ID:</b> ${appId}</p>
      </div>
    `,
            confirmButtonColor: "#dc2626",
          });
          setFormData((prev) => ({
            ...prev,
            aadhar: "",
          }));

          return;
        }

        setIsAadharDuplicate(false);
      } catch (error) {
      } finally {
        setIsCheckingAadhar(false);
      }
    };

    const timer = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timer);
  }, [formData.aadhar]);

  const resetForm = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      dob: "",
      gender: "",
      aadhar: "",
      primaryMobile: "",
      secondaryMobile: "",
      email: "",
    });

    setPhotoData(null);
    setAadharData(null);
    setIsVerified(false);
    setResendCooldown(0);

    securityRef.current?.resetForm();
    captchaRef.current?.resetCaptcha();
    aadharUploadRef.current?.resetUpload?.();
    photoUploadRef.current?.resetUpload?.();
  };
  const handleRegister = async () => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanAadhar = formData.aadhar.replace(/\s+/g, "");

      let newErrors = {};

      if (!formData.firstName.trim())
        newErrors.firstName = "First Name is required";
      if (!formData.middleName.trim())
        newErrors.middleName = "Middle Name is required";

      if (!formData.lastName.trim())
        newErrors.lastName = "Last Name is required";

      if (!formData.dob) newErrors.dob = "Date of Birth is required";

      if (!formData.gender) newErrors.gender = "Gender is required";

      if (!cleanAadhar) newErrors.aadhar = "Aadhar Number is required";
      else if (!isAadharValid(cleanAadhar))
        newErrors.aadhar = "Invalid Aadhar Number";

      if (isAadharDuplicate)
        newErrors.aadhar = "This Aadhaar is already registered";

      if (!aadharData?.filePath)
        newErrors.aadharUpload = "Aadhar document upload is required";

      if (!photoData?.filePath)
        newErrors.photoUpload = "Photo upload is required";

      if (!formData.primaryMobile || formData.primaryMobile.length !== 10) {
        newErrors.primaryMobile = "Valid Primary Mobile number is required";
      } else if (!isVerified) {
        newErrors.primaryMobile = "Please verify your mobile number";
      }

      if (!formData.email) newErrors.email = "Email is required";
      else if (!emailRegex.test(formData.email))
        newErrors.email = "Invalid Email format";

      const securityValidation = securityRef.current.validateSecurity();
      if (!securityValidation.isValid)
        newErrors.security = "Please complete Security Question properly";

      const isCaptchaValid = captchaRef.current.validate();
      if (!isCaptchaValid) newErrors.captcha = "Invalid Captcha";

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        return SwalHelper.warning(
          "Validation",
          "Please correct highlighted fields",
        );
      }

      const securityDetails = securityRef.current.getSecurityDetails();

      const [dd, mm, yyyy] = formData.dob.split("/");
      const dobISO = new Date(yyyy, mm - 1, dd).toISOString();

      const payload = {
        itiRegistrationNo: "",
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        genderCode: formData.gender === "Male" ? "M" : "F",
        dob: dobISO,
        mobileNo: formData.primaryMobile,
        altMobileNo: formData.secondaryMobile || "",
        eMailID: formData.email,
        securityQuestionID: securityDetails.securityQuestionId,
        securityQuestionAnswer: securityDetails.securityAnswer,
        password: securityDetails.password,
        userLoginID: userInfo?.UserLoginID,
        ipAddress: ipAddress,
        pageCode: "REGISTER",
        isAdmissionDataFetch: 0,
        listJobRole: [],
        dobFilePath: "",
        aadhaarNo: cleanAadhar,
        aadhaarFilePath: aadharData.filePath,
        photoFilePath: photoData.filePath,
        signFilePath: "",
      };


      SwalHelper.loading("Registering Candidate...");

      const response = await agent.post(RegisterCandidateStep, payload);

      SwalHelper.close();

      if (response?.data?.Status === "Success") {
        const loginId = response?.data?.Data;

        await Swal.fire({
          icon: "success",
          title: "Registration Successful 🎉",
          html: `
          <div style="font-size:16px">
            <p><b>Your Login ID:</b></p>
            <div style="
              font-size:22px;
              font-weight:bold;
              color:#d97706;
              margin:10px 0;
              padding:8px;
              background:#fff7ed;
              border-radius:6px;
            ">
              ${loginId}
            </div>
            <p>Please save this ID for future login.</p>
          </div>
        `,
          confirmButtonText: "OK",
          confirmButtonColor: "#ea580c",
        });

        resetForm();
      } else {
        SwalHelper.error(
          "Error",
          response?.data?.Message || "Registration failed",
        );
      }
    } catch (error) {
      SwalHelper.close();
      SwalHelper.error("Error", "Registration failed. Please try again.");
    }
  };

  return (
    <div className="relative w-full p-4 bg-gray-100 min-h-screen">
      <fieldset className="rounded-sm border border-gray-300 bg-white p-6 shadow-lg">
        <legend className="px-4 py-2 bg-slate-500 text-white text-lg font-semibold rounded-md w-auto flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Registration Details
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold text-gray-700">Primary Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormComponent
                label="First Name"
                required
                value={formData.firstName}
                onChange={handleChange("firstName")}
                error={errors.firstName}
              />
              <FormComponent
                label="Middle / Father / Husband Name"
                value={formData.middleName}
                onChange={handleChange("middleName")}
                error={errors.middleName}
              />
              <FormComponent
                label="Last / Surname"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                error={errors.lastName}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateInput
                label="Date of Birth (DD/MM/YYYY)"
                required
                value={formData.dob}
                onChange={handleChange("dob")}
                maxDate={new Date()} // prevents future dates
                error={errors.dob}
              />

              <FormComponent
                label="Gender"
                required
                isSelect
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                ]}
                value={formData.gender}
                onChange={handleChange("gender")}
                error={errors.gender}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormComponent
                label="Aadhar Number"
                required
                value={formData.aadhar}
                onChange={(value) => {
                  const cleaned = value.replace(/\D/g, "").slice(0, 12);
                  handleChange("aadhar")(cleaned);
                }}
                error={errors.aadhar}
              />

              <UploadPdf
                ref={aadharUploadRef}
                label="Upload Aadhar Card"
                required
                userTypeId={userInfo?.UserTypeID}
                userLoginID={userInfo?.UserLoginID}
                onFileChange={(data) => {
                  setAadharData(data);
                }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Mobile Number <span className="text-red-500">*</span>
                  {errors.primaryMobile && (
                    <span className="ml-2 text-sm text-red-500">
                      {errors.primaryMobile}
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-2 bg-gray-100 border rounded-md text-sm ${errors.primaryMobile
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                  >
                    +91
                  </div>

                  <input
                    type="text"
                    maxLength={10}
                    value={formData.primaryMobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({
                        ...formData,
                        primaryMobile: value,
                      });

                      setErrors((prev) => {
                        const { primaryMobile, ...rest } = prev;
                        return rest;
                      });
                    }}
                    className={`flex-1 rounded-md border p-2 ${errors.primaryMobile
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                    placeholder="Enter Mobile Number"
                    disabled={isVerified}
                  />

                  {isVerified ? (
                    <span className="flex items-center text-green-600">
                      <AiOutlineCheckCircle className="text-xl" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyClick}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm">
                    +91
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.secondaryMobile}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryMobile: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="flex-1 rounded-md border border-gray-300 p-2"
                    placeholder="Enter Mobile Number"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormComponent
                label="E-Mail ID"
                required
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                error={errors.email}
              />
            </div>

            <SecurityQuestion ref={securityRef} />

            <div className="mt-4">
              <CaptchaComponent ref={captchaRef} />
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleRegister}
                className="bg-orange-600 text-white px-8 py-2 rounded-full hover:bg-orange-700"
              >
                Register
              </button>
            </div>
          </div>
          <div className="pl-6 flex justify-center self-start">
            <div className="w-64 bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col items-center">
              <h4 className="text-sm font-semibold text-gray-700 mb-5">
                Candidate Photo <span className="text-red-500">*</span>
              </h4>

              <div
                className={`h-44 w-36 rounded-xl overflow-hidden flex items-center justify-center border-2 transition-all duration-300 ${errors.photoUpload
                    ? "border-red-500"
                    : "border-dashed border-gray-300 hover:border-blue-400"
                  } bg-gray-50`}
              >
                {photoData?.filePath ? (
                  <img
                    src={photoData.filePath}
                    alt="Uploaded"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center px-2">
                    <p className="text-gray-400 text-xs">No Photo Uploaded</p>
                    <p className="text-gray-400 text-[11px] mt-1">
                      JPG / PNG (Max 2MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 w-full flex justify-center">
                <div className="flex justify-center">
                  <UploadPdf
                    label=""
                    ref={photoUploadRef}
                    userTypeId={userInfo?.UserTypeID}
                    userLoginID={userInfo?.UserLoginID}
                    id="photoUpload"
                    allowedFileTypes="jpg, jpeg, png"
                    maxFileSize="2 MB"
                    buttonText="Upload Photo"
                    linkName=""
                    onFileChange={(data) => {
                      setPhotoData(data);
                      setErrors((prev) => {
                        const { photoUpload, ...rest } = prev;
                        return rest;
                      });
                    }}
                  />
                </div>
              </div>

              {errors.photoUpload && (
                <p className="text-red-500 text-xs mt-3 text-center">
                  {errors.photoUpload}
                </p>
              )}
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
};

export default RegisterCandidates;
