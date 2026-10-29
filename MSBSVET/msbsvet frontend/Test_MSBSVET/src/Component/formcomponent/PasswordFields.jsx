import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordFields({
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  setErrorsFromParent,
}) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

  
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength === 3) return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength === 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const validate = () => {
    const validationErrors = {};

    if (!newPassword) {
      validationErrors.newPassword = "Password is required.";
    } else if (!passwordRegex.test(newPassword)) {
      validationErrors.newPassword =
        "8–15 chars, 1 uppercase, 1 number, 1 special char.";
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = "Confirm Password is required.";
    } else if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(validationErrors);
    setErrorsFromParent?.(validationErrors);
    return validationErrors;
  };

  useEffect(() => {
    if (newPassword || confirmPassword) validate();
  }, [newPassword, confirmPassword]);

return (
  <div className="w-full">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* LEFT SIDE (Password + Strength + Checklist) */}
      <div className="flex flex-col gap-4">

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`border rounded-md px-3 py-2 pr-10 text-sm w-full 
              ${errors.newPassword ? "border-red-500" : "border-gray-300"}`}
            />

            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* ✅ Password Strength Bar (LIMITED WIDTH) */}
        {newPassword && (
          <div>
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
                className={`h-full ${passwordStrength.color}`}
                style={{
                  width: `${(passwordStrength.strength / 5) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* ✅ Requirement Checklist (LIMITED WIDTH) */}
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Password Requirements:
          </p>

          <ul className="space-y-1 text-sm text-blue-800">
            <li>
              {newPassword.length >= 8 ? "✓" : "○"} 8–15 characters
            </li>
            <li>
              {/[A-Z]/.test(newPassword) ? "✓" : "○"} At least 1 uppercase letter
            </li>
            <li>
              {/[a-z]/.test(newPassword) ? "✓" : "○"} At least 1 lowercase letter
            </li>
            <li>
              {/\d/.test(newPassword) ? "✓" : "○"} At least 1 number
            </li>
            <li>
              {/[@$!%*?&]/.test(newPassword) ? "✓" : "○"} At least 1 special character
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE (Confirm Password only) */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Confirm Password <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`border rounded-md px-3 py-2 pr-10 text-sm w-full 
            ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
          />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

    </div>
  </div>
);
}