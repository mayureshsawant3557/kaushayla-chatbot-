import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff, X } from "lucide-react";

const InputText = ({
  label,
  name,
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  onBlur,
  onFocus,
  validators = [],
  helperText = "",
  disabled = false,
  required = false,
  prefix = null,
  suffix = null,
  showPasswordToggle = false,
  clearable = false,
  debounceMs = 300,
  validateOnChange = true,
  validateOnBlur = true,
  onValidationChange,
  className = "",
  inputClassName = "",
  forceShowError = false,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const debounceTimer = useRef(null);
  const isFirstRender = useRef(true);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Mark as touched and run validation when forceShowError becomes true
  useEffect(() => {
    if (forceShowError) {
      setTouched(true);
      // Run validation to ensure error state is updated
      const validate = async () => {
        const validationError = await runValidation(localValue);
        setError(validationError);

        if (onValidationChange) {
          onValidationChange(name, validationError, label || name);
        }
      };
      validate();
    }
  }, [forceShowError]);

  // Run validation
  const runValidation = async (val) => {
    if (validators.length === 0) {
      return null;
    }

    setIsValidating(true);

    for (const validator of validators) {
      let validationError = null;

      if (typeof validator === "function") {
        validationError = await validator(val);
      } else {
        validationError = validator;
      }

      if (validationError) {
        setIsValidating(false);
        return validationError;
      }
    }

    setIsValidating(false);
    return null;
  };

  // Validate with debounce
  const validateWithDebounce = async (val) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    return new Promise((resolve) => {
      debounceTimer.current = setTimeout(async () => {
        const validationError = await runValidation(val);
        setError(validationError);

        if (onValidationChange) {
          onValidationChange(name, validationError, label || name);
        }

        resolve(validationError);
      }, debounceMs);
    });
  };

  // Handle input change
  const handleChange = async (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (onChange) {
      onChange(newValue);
    }

    if (validateOnChange && touched) {
      await validateWithDebounce(newValue);
    }
  };

  // Handle blur
  const handleBlur = async (e) => {
    setTouched(true);

    if (validateOnBlur) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      const validationError = await runValidation(localValue);
      setError(validationError);

      if (onValidationChange) {
        onValidationChange(name, validationError, label || name);
      }
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  // Handle focus
  const handleFocus = (e) => {
    if (onFocus) {
      onFocus(e);
    }
  };

  // Clear input
  const handleClear = () => {
    setLocalValue("");
    setError(null);
    setTouched(false);

    if (onChange) {
      onChange("");
    }

    if (onValidationChange) {
      onValidationChange(name, null, label || name);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine input type
  const inputType = type === "password" && showPassword ? "text" : type;

  // Determine border color
  const getBorderColor = () => {
    if (disabled) return 'border-gray-300';
    if (error && (touched || forceShowError)) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    if (!error && (touched || forceShowError) && localValue) return 'border-green-500 focus:border-green-500 focus:ring-green-500';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  // Skip validation on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            {prefix}
          </div>
        )}

        {/* Input Field */}
        <input
          id={name}
          name={name}
          type={inputType}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg
            ${prefix ? "pl-10" : ""}
            ${suffix || clearable || showPasswordToggle ? "pr-10" : ""}
            ${getBorderColor()}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
            transition-colors duration-200
            focus:outline-none focus:ring-2
            ${inputClassName}
          `}
          {...props}
        />

        {/* Right Side Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Validation Icons */}
          {(touched || forceShowError) && !isValidating && (
            <>
              {error && <AlertCircle className="w-5 h-5 text-red-500" />}
              {!error && localValue && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </>
          )}

          {/* Password Toggle */}
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Clear Button */}
          {clearable && localValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Suffix */}
          {suffix && (
            <span className="text-gray-400 pointer-events-none">{suffix}</span>
          )}
        </div>
      </div>

      {/* Helper Text or Error Message */}
      {(helperText || (error && (touched || forceShowError))) && (
        <div className="mt-1 text-sm">
          {error && (touched || forceShowError) ? (
            <p className="text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          ) : (
            helperText && <p className="text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InputText;
