import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const DropdownComponent = ({
    label,
    options,
    value, // Array if isMulti is true; string/number/"" if single-select
    onChange,
    error,
    required,
    disabled,
    loading,
    isForFilterTable = false,
    isMulti = false, // New prop
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // ✅ Safe array helper — never trust value's shape blindly
    const selectedArray = isMulti ? (Array.isArray(value) ? value : []) : [];

    // ✅ Single source of truth for "is this option currently selected" —
    // branches on isMulti instead of always assuming value is array-like.
    const isOptionSelected = (optionValue) =>
        isMulti ? selectedArray.includes(optionValue) : value === optionValue;

    // Calculate display value
    const displayValue = isMulti
        ? (selectedArray.length > 0 ? `${selectedArray.length} Selected` : "")
        : options.find(o => o.value === value)?.label || "";

    const isEmpty = isMulti ? selectedArray.length === 0 : (value === "" || value === null || value === undefined);

    const filteredOptions = options.filter(option =>
        option.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        if (isMulti) {
            const newValue = selectedArray.includes(optionValue)
                ? selectedArray.filter(v => v !== optionValue)
                : [...selectedArray, optionValue];
            onChange(newValue);
        } else {
            onChange(optionValue);
            setIsOpen(false);
            setSearchTerm("");
        }
    };

    const testId = label ? label.toLowerCase().replace(/\s+/g, '_') : undefined;

    return (
        <div className="flex flex-col relative" ref={dropdownRef} data-testid={testId} data-value={value || ""}>
            <label className="mb-1 text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div
                className={`w-full p-2 border rounded-md flex justify-between items-center cursor-pointer ${error ? "border-red-500" : "border-gray-300"} ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`truncate ${isEmpty ? "text-gray-500" : ""}`}>
                    {displayValue || (label ? `Select ${label}` : "Select")}
                </span>
            </div>

            {isOpen && (
                <div className={`${isForFilterTable ? "w-full" : "absolute z-20 w-full"} mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 top-full overflow-y-auto`}>
                    <div className="sticky top-0 p-2 bg-white border-b border-gray-200 flex items-center">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full p-1 outline-none text-sm"
                        />
                    </div>

                    {loading ? (
                        <div className="p-2 text-center text-gray-500">Loading...</div>
                    ) : filteredOptions.length > 0 ? (
                        <ul>
                            {filteredOptions.map((option, index) => (
                                <li
                                    key={index}
                                    className={`p-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer ${isOptionSelected(option.value) ? "bg-blue-50" : ""}`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {isMulti && (
                                        <input
                                            type="checkbox"
                                            checked={isOptionSelected(option.value)}
                                            readOnly
                                        />
                                    )}
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-2 text-center text-gray-500">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};
export default DropdownComponent;