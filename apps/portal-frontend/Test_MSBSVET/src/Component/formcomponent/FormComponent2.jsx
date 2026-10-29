// it use in securityquestion component 
    const FormComponent2 = ({ label, value, onChange, error, type = "text", onKeyDown }) => {
        return (
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                    {label} <span className="text-red-500">*</span>
                    {error && <span className="ml-2 text-sm text-red-500">{error}</span>}
                </label>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    onKeyDownCapture={onKeyDown} // Capturing event earlier in the bubble phase
                    className={`mt-1 w-full rounded-md border p-2 ${error ? "border-red-500" : "border-gray-300"}`}
                    //minLength={8}
                    maxLength={15}
                />
            </div>
        );
    };


export default FormComponent2;