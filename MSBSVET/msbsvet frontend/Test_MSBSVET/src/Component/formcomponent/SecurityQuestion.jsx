import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import Swal from "sweetalert2";
import FormComponent2 from "./FormComponent2";
import { getSecurityQuestion } from "../../Endpoints_All/Account/securityQuestions";
import agent from "../../lib/api/agent";

const SecurityQuestion = forwardRef((props, ref) => {
  const initialFormState = {
    securityQuestion: "",
    securityAnswer: "",
    password: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [securityQuestions, setSecurityQuestions] = useState([]);

  // Password Strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength === 3)
      return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength === 4)
      return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Fetch security questions
  useEffect(() => {
    agent
      .get(getSecurityQuestion)
      .then((response) => {
        setSecurityQuestions(response.data);

        if (props.initialData) {
          setFormData((prevData) => ({
            ...prevData,
            securityQuestion: props.initialData.securityQuestionId || "",
          }));
        }
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Could not fetch security questions. Please try again later.",
        });
      });
  }, [props.initialData]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    validateSecurity: () => {
      const validationErrors = validate();
      return {
        isValid: Object.keys(validationErrors).length === 0,
        errors: validationErrors,
      };
    },

    getSecurityDetails: () => ({
      securityQuestionId: parseInt(formData.securityQuestion) || 0,
      securityAnswer: formData.securityAnswer,
      password: passwordtohash(formData.password),
    }),

    resetForm: () => {
      setFormData(initialFormState);
      setErrors({});
    },
  }));

  // Password hashing
  function passwordtohash(str) {
    try {
      return btoa(str);
    } catch (error) {
      return btoa(unescape(encodeURIComponent(str)));
    }
  }

  const handleChange = (field) => (e) => {
    const value =
      field === "securityQuestion" ? parseInt(e.target.value) : e.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _, ...rest } = prev;
      return rest;
    });

    props.onChange?.();
  };

  // Validation logic
  const validate = () => {
    const validationErrors = {};
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

    if (!formData.securityQuestion) {
      validationErrors.securityQuestion = "Please select a security question.";
    }

    if (!formData.securityAnswer.trim()) {
      validationErrors.securityAnswer = "Security answer is required.";
    }

    if (!formData.password) {
      validationErrors.password = "Password is required.";
    } else if (!passwordRegex.test(formData.password)) {
      validationErrors.password =
        "Password must be 8-15 characters long, with at least 1 uppercase letter, 1 number, and 1 special character.";
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = "Confirm Password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(validationErrors);
    return validationErrors;
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey || event.altKey) {
      event.preventDefault();
      Swal.fire({
        icon: "warning",
        title: "Action Not Allowed",
        text: "Ctrl and Alt keys are disabled for security reasons.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            Security Question <span className="ml-1 text-red-500">*</span>
            {errors.securityQuestion && (
              <span className="ml-2 text-sm text-red-500">
                {errors.securityQuestion}
              </span>
            )}
          </label>
          <select
            value={formData.securityQuestion}
            onChange={handleChange("securityQuestion")}
            className={`mt-1 w-full rounded-md border p-2 ${
              errors.securityQuestion ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select a Security Question</option>
            {securityQuestions.map((question) => (
              <option key={question.Id} value={question.Id}>
                {question.Question}
              </option>
            ))}
          </select>
        </div>

        <FormComponent2
          label="Security Answer"
          value={formData.securityAnswer}
          onChange={handleChange("securityAnswer")}
          error={errors.securityAnswer}
          minLength={3}
        />
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <FormComponent2
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
            onKeyDown={handleKeyDown}
            minLength={8}
            maxLength={15}
          />

          {/* Password Strength Bar */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Password Strength</span>
                <span
                  className={
                    passwordStrength.strength <= 2
                      ? "text-red-600"
                      : passwordStrength.strength === 3
                        ? "text-yellow-600"
                        : passwordStrength.strength === 4
                          ? "text-blue-600"
                          : "text-green-600"
                  }
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                  style={{
                    width: `${(passwordStrength.strength / 5) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <FormComponent2
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange("confirmPassword")}
          error={errors.confirmPassword}
          onKeyDown={handleKeyDown}
          minLength={8}
          maxLength={15}
        />
      </div>

      {/*Live Requirement Checklist */}
      <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">
          Password Requirements:
        </p>
        <ul className="space-y-1 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <span
              className={
                formData.password.length >= 8
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {formData.password.length >= 8 ? "✓" : "○"}
            </span>
            8–15 characters
          </li>
          <li className="flex items-center gap-2">
            <span
              className={
                /[A-Z]/.test(formData.password)
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {/[A-Z]/.test(formData.password) ? "✓" : "○"}
            </span>
            At least 1 uppercase letter
          </li>
          <li className="flex items-center gap-2">
            <span
              className={
                /[a-z]/.test(formData.password)
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {/[a-z]/.test(formData.password) ? "✓" : "○"}
            </span>
            At least 1 lowercase letter
          </li>
          <li className="flex items-center gap-2">
            <span
              className={
                /\d/.test(formData.password)
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {/\d/.test(formData.password) ? "✓" : "○"}
            </span>
            At least 1 number
          </li>
          <li className="flex items-center gap-2">
            <span
              className={
                /[@$!%*?&]/.test(formData.password)
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {/[@$!%*?&]/.test(formData.password) ? "✓" : "○"}
            </span>
            At least 1 special character (@$!%*?&)
          </li>
        </ul>
      </div>
    </div>
  );
});

SecurityQuestion.displayName = "SecurityQuestion";
export default SecurityQuestion;
