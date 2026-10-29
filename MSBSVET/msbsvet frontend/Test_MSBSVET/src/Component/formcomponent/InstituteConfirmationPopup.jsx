import { IoClose } from "react-icons/io5";

const InstituteConfirmationPopup = ({ open, onConfirm, onCancel, instituteData }) => {
    if (!open) return null;

    const {
        instituteName, isNewInst, prevInstituteCode,
        address, city, otherCity, pincode,
        taluka, district, state,
        authName, authTitle, authLoginId, authMobile
    } = instituteData;

    const displayCity = city === "Other" ? otherCity : city;
    const displayName = isNewInst === "0" || isNewInst === 0
        ? `${instituteName} SKILL DEVELOPMENT INSTITUTE`   
        : `${instituteName} (${prevInstituteCode})`;        

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div style={{ background: "#062568" }} className="px-5 py-4">
                    <h2 className="text-white text-lg font-medium m-0">Information</h2>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {/* Warning text */}
                    <p className="text-red-600 text-sm font-medium mb-5 leading-relaxed">
                        All documents/ certificates/ communication shall be sent on Correspondence Address.
                        Ensure the Correspondence Address is correct. Your Correspondence Address shall appear as:
                    </p>

                    {/* Address Details */}
                    <div className="text-sm text-gray-800 leading-loose">
                        <div className="font-medium">{displayName}</div>
                        <div>Address : {address}</div>
                        <div>
                            City/ Village : {displayCity}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            Pin Code : {pincode}
                        </div>
                        <div>
                            Taluka : {taluka}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            District : {district}
                        </div>
                        <div>State : {state}</div>
                        <div>
                            Authorized Representative Name : {authTitle} {authName} ({authLoginId})
                        </div>
                        <div>Primary Mobile No. : {authMobile}</div>
                    </div>

                    {/* Buttons */}
                    <div className="border-t border-gray-200 mt-6 pt-5 flex justify-center gap-4">
                        <button
                            onClick={onConfirm}
                            className="px-10 py-2 text-white text-sm font-medium rounded"
                            style={{ background: "#1a7a3c" }}
                        >
                            Yes
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-10 py-2 text-white text-sm font-medium rounded"
                            style={{ background: "#c0392b" }}
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstituteConfirmationPopup;