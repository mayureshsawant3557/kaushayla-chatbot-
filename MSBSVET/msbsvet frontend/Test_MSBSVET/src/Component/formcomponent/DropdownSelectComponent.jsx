import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const DropdownSelectComponent = ({
    label,
    options,
    value,
    onChange,
    error,
    required,
    disabled,
    loading
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    const selectedOption = options.find(option => option.value === value);
    const displayValue = selectedOption ? selectedOption.label : "";

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
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setSearchTerm("");
            }
        }
    };

    return (
        <div className="flex flex-col relative" ref={dropdownRef}>
            <label className="mb-1 text-sm font-medium text-gray-700">
                {label} {required && <span className=" text-red-500">*</span>}
                {error && <span className="ml-2 text-sm text-red-500">{`${label} is required`}</span>}
            </label>

            <div
                className={`w-full p-2 border rounded-md flex justify-between items-center cursor-pointer ${error ? "border-red-500" : "border-gray-300"} ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                onClick={toggleDropdown}
            >
                <span className={`truncate ${!value ? "text-gray-500" : ""}`}>
                    {displayValue || `Select`}
                </span>
                {/* ChevronDown icon removed */}
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 top-full overflow-y-auto">
                    <div className="sticky top-0 p-2 bg-white border-b border-gray-200 flex items-center">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Search ${label?.toLowerCase()}...`}
                            className="w-full p-1 outline-none text-sm"
                            autoFocus
                        />
                    </div>

                    {loading ? (
                        <div className="p-2 text-center text-gray-500">Loading...</div>
                    ) : filteredOptions.length > 0 ? (
                        <ul>
                            {filteredOptions.map((option, index) => (
                                <li
                                    key={index}
                                    className={`p-2 hover:bg-gray-100 cursor-pointer ${option.value === value ? "bg-blue-50 text-blue-600" : ""}`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-2 text-center text-gray-500">No results found</div>
                    )}
                </div>
            )}

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="hidden"
                disabled={disabled}
            >
                <option value="">Select</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
export default DropdownSelectComponent;


