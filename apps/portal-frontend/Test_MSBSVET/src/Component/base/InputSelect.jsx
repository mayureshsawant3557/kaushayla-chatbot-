import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle, X, ChevronDown, Search } from "lucide-react";

const InputSelect = ({
  label,
  name,
  placeholder = "Select an option",
  options = [],
  value = "",
  onChange,
  onBlur,
  onFocus,
  validators = [],
  disabled = false,
  searchable = false,
  clearable = false,
  className = "",
  onValidationChange,
  helperText = "",
  required = false,
  debounceMs = 300,
  validateOnChange = true,
  validateOnBlur = true,
  maxHeight = "300px",
  forceShowError = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const selectRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceTimer = useRef(null);

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

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Mark as touched and run validation when forceShowError becomes true
  useEffect(() => {
    if (forceShowError) {
      setTouched(true);
      // Run validation to ensure error state is updated
      const validate = async () => {
        const validationError = await runValidation(value);
        setError(validationError);

        if (onValidationChange) {
          onValidationChange(name, validationError, label || name);
        }
      };
      validate();
    }
  }, [forceShowError]);

  // Filter options based on search term
  const filteredOptions =
    searchable && searchTerm
      ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      : options;

  // Get selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Handle option selection
  const handleSelect = async (option) => {
    setTouched(true);
    setIsOpen(false);
    setSearchTerm("");

    const validationError = await runValidation(option.value);
    setError(validationError);

    if (onValidationChange) {
      onValidationChange(name, validationError, label || name);
    }

    if (onChange) {
      onChange(option.value);
    }
  };

  // Handle clear
  const handleClear = async (e) => {
    e.stopPropagation();
    setTouched(true);

    const validationError = await runValidation("");
    setError(validationError);

    if (onValidationChange) {
      onValidationChange(name, validationError, label || name);
    }

    if (onChange) {
      onChange("");
    }
  };

  // Handle toggle dropdown
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(true);
      if (onFocus) {
        onFocus({ target: { name, value } });
      }
    }
  };

  // Handle blur
  const handleBlur = async () => {
    setIsFocused(false);
    setTouched(true);

    if (validateOnBlur) {
      const validationError = await runValidation(value);
      setError(validationError);

      if (onValidationChange) {
        onValidationChange(name, validationError, label || name);
      }
    }

    if (onBlur) {
      onBlur({ target: { name, value } });
    }
  };

  // Determine border color
  const getBorderColor = () => {
    if (disabled) return 'border-gray-300';
    if (error && (touched || forceShowError)) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    if (!error && (touched || forceShowError) && value) return 'border-green-500 focus:border-green-500 focus:ring-green-500';
    if (isOpen) return 'border-blue-500 ring-2 ring-blue-200';
    return 'border-gray-300 hover:border-gray-400';
  };

  const showError = (touched || forceShowError) && error;
  const showSuccess = (touched || forceShowError) && !error && value && validators.length > 0;

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

      {/* Select Container with relative positioning */}
      <div className="relative" ref={selectRef}>
        {/* Select Button */}
        <div
          className={`
            flex items-center justify-between
            px-3 py-2 border rounded-lg cursor-pointer
            ${getBorderColor()}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
            transition-all duration-200
          `}
          onClick={handleToggle}
          onBlur={handleBlur}
          tabIndex={disabled ? -1 : 0}
        >
          <span
            className={`flex-1 flex items-center gap-2 ${!selectedOption ? "text-gray-400" : "text-gray-900"}`}
          >
            {selectedOption?.icon && (
              <span className="shrink-0 flex items-center">{selectedOption.icon}</span>
            )}
            <span>{selectedOption ? selectedOption.label : placeholder}</span>
          </span>

          <div className="flex items-center gap-2">
            {/* Validation Icons */}
            {!isValidating && (
              <>
                {showError && <AlertCircle className="w-5 h-5 text-red-500" />}
                {showSuccess && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </>
            )}

            {/* Clear Button */}
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown Arrow */}
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""
                }`}
            />
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
            style={{ maxHeight }}
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`
                    px-3 py-2 cursor-pointer transition-colors
                    ${option.value === value ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}
                  `}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        {option.icon && (
                          <span className="shrink-0 flex items-center">{option.icon}</span>
                        )}
                        <div className="flex flex-col">
                          <span className={`font-medium ${option.value === value ? 'text-blue-700' : 'text-gray-900'}`}>
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="text-xs text-gray-500 mt-0.5">
                              {option.description}
                            </span>
                          )}
                        </div>
                      </div>
                      {option.value === value && (
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text or Error Message */}
      {(helperText || showError) && (
        <div className="mt-1 text-sm">
          {showError ? (
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

export default InputSelect;