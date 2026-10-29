// use in userinfo component

//const FormComponent = ({ label, value, onChange, error, type = "text" }) => {
//    return (
//        <div className="flex-1">
//            <label className="block text-sm font-medium text-gray-700">
//                {label} <span className="text-red-500">*</span>
//                {error && (
//                    <span className="ml-2 text-sm text-red-500">
//                        {error}
//                    </span>
//                )}
//            </label>
//            <input
//                type={type}
//                value={value}
//                onChange={onChange}
//                className={`mt-1 w-full rounded-md border p-2 ${error ? "border-red-500" : "border-gray-300"}`}
//            />
//        </div>
//    );
//};

//export default FormComponent;

//const FormComponent = ({ label, value, onChange, error, type = "text", onKeyDown }) => {
//    return (
//        <div className="flex-1">
//            <label className="block text-sm font-medium text-gray-700">
//                {label} <span className="text-red-500">*</span>
//                {error && <span className="ml-2 text-sm text-red-500">{error}</span>}
//            </label>
//            <input
//                type={type}
//                value={value}
//                onChange={onChange}
//                onKeyDownCapture={onKeyDown} // Capturing event earlier in the bubble phase
//                className={`mt-1 w-full rounded-md border p-2 ${error ? "border-red-500" : "border-gray-300"}`}
//                minLength={8}
//                maxLength={15}
//            />
//        </div>
//    );
//};

//export default FormComponent;
import IconTooltip from "./TooltipComponent";

const FormComponent = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
  options = [],
  isSelect = false,
  disabled = false,
  extraClass = "",
  tooltip = "",
  tooltipPosition = "right",
  autoUpperCase = false,
  min = "",
  max = "",
}) => {
  const baseInputStyle =
    "w-full rounded-md p-2 border transition duration-200 focus:outline-none";

  const errorStyle = error
    ? "border-red-500 focus:ring-1 focus:ring-red-500"
    : "border-gray-300 focus:ring-1 focus:ring-blue-500";

  const handleChange = (e) => {
    const raw = e.target.value;
    // Do not uppercase numeric inputs; only uppercase for text when explicitly requested
    const out =
      autoUpperCase && type !== "number" ? String(raw).toUpperCase() : raw;
    onChange(out);
  };

  const fieldId = id || name;

  return (
    <div className={`mb-2 ${extraClass}`}>
      <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={fieldId}>
        {label} {required && <span className="text-red-500">*</span>}
        {tooltip && (
          <IconTooltip
            message={tooltip}
            position={tooltipPosition}
            width="w-80"
          />
        )}
        {error && <span className="ml-2 text-sm text-red-500">{error}</span>}
      </label>

      {isSelect ? (
        <select
          id={fieldId}
          name={name}
          data-testid={name || id}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${baseInputStyle} ${errorStyle}`}
          disabled={disabled}
        >
          <option value="">Select</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          name={name}
          data-testid={name || id}
          type={type}
          value={value}
          onChange={handleChange}
          className={`${baseInputStyle} ${errorStyle}`}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
        />
      )}
    </div>
  );
};

export default FormComponent;
