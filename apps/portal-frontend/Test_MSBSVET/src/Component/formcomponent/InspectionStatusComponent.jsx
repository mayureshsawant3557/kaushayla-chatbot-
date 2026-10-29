import React, {
    useEffect,
    useState,
    useContext,
    forwardRef,
    useImperativeHandle
} from "react";

import agent from "../../lib/api/agent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { GetInstituteInspectionDash } from "../../Endpoints_All/Base/DVETO";
import { useAuth } from "../../Hooks/AuthContext";

const InspectionStatusComponent = forwardRef(
    ({ instituteId, pageCode, onChange, readOnly, TypeID, userName = '', mode = "edit" }, ref) => {
        const {userInfo} = useAuth();
        const UserTypeID = TypeID || userInfo.UserTypeID;

        const [status, setStatus] = useState("");
        const [remark, setRemark] = useState("");
        const [isLocked, setIsLocked] = useState(false);
        const { color } = useContext(ThemeContext);

        const [error, setError] = useState({
            status: false,
            remark: false
        });

        //const isAdmin = UserTypeID === 14 || UserTypeID === 81 ;

        const isAdmin = mode !== "view" && (UserTypeID === 14 || UserTypeID === 81);
        // const legendTitle =
        //     UserTypeID === 81
        //         ? `Verification Remark By Board`
        //         : `Inspection Remark  By DVETO ${userName}`;

        // const legendTitle = 
        //     UserTypeID === 81
        //         ? "Verification Remark By Board"
        //         : UserTypeID === 14
        //             ? `Inspection Remark By DVETO ${userName}`
        //             : `Inspection Remark By DVETO IF TYPEID ==81 Verification Remark By Board ${userName}`;

        const legendTitle =
            TypeID == 81
                ? `Board Verification Remark  ${userName}`
                : UserTypeID === 81
                    ? "Board Verification Remark"
                    : (TypeID === 14 || UserTypeID === 14)
                        ? `DVETO Inspection Remark  ${userName}`
                        : `DVETO Inspection Remark  ${userName}`;

        // 🔹 Load Existing Status
        const loadStatus = async () => {
            if (!instituteId) return;

            try {
                const res = await agent.get(
                    `${GetInstituteInspectionDash}/${instituteId}/${UserTypeID}`
                );

                const list = res.data?.Data || [];

                const currentPage = list.find(item =>
                    item.PageCode?.includes(pageCode)
                );

                if (currentPage) {
                    const statusValue = currentPage.PageStatus || "";
                    const remarkValue = currentPage.Remark || "";

                    setStatus(statusValue);
                    setRemark(remarkValue);

                    if (statusValue === "V") {
                        setIsLocked(true);
                    }

                    if (onChange) {
                        onChange({
                            status: statusValue,
                            remark: remarkValue
                        });
                    }
                }

            } catch (error) {
            }
        };
        useEffect(() => {
            if (instituteId && pageCode) {
                loadStatus();
            }
            
        }, [instituteId, pageCode]);

        
        //const validate = () => {
        //    let isValid = true;
        //    let newErrors = { status: false, remark: false };

        //    if (status === "N") {
        //        newErrors.status = true;
        //        isValid = false;
        //    }

        //    if (status === "R" && !remark.trim()) {
        //        newErrors.remark = true;
        //        isValid = false;
        //    }

        //    setError(newErrors);
        //    return isValid;
        //};

        const validate = () => {

            if (mode === "view") return true;   // ✅ skip validation

            let isValid = true;
            let newErrors = { status: false, remark: false };

            if (!status || status === "N") {
                newErrors.status = true;
                isValid = false;
            }

            if (status === "R" && !remark.trim()) {
                newErrors.remark = true;
                isValid = false;
            }

            setError(newErrors);
            return isValid;
        };

        
        useImperativeHandle(ref, () => ({
            validate
        }));

        
        //const handleStatusChange = (value) => {
        //    setStatus(value);

        //    setError(prev => ({
        //        ...prev,
        //        status: false
        //    }));

        //    if (onChange) {
        //        onChange({
        //            status: value,
        //            remark: remark
        //        });
        //    }
        //};
        const handleStatusChange = (value) => {

            setStatus(value);

            // 🔥 Clear remark if switching to Verified
            if (value === "V") {
                setRemark("");
            }

            // 🔥 Reset errors
            setError({
                status: false,
                remark: false
            });

            if (onChange) {
                onChange({
                    status: value,
                    remark: value === "V" ? "" : remark
                });
            }
        };

        

        const handleRemarkChange = (value) => {
            setRemark(value);

            setError(prev => ({
                ...prev,
                remark: false
            }));

            if (onChange) {
                onChange({
                    status: status,
                    remark: value
                });
            }
        };

        return (
            <fieldset className="rounded border border-gray-300 p-4 mt-6 bg-white shadow-sm">

                <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                    {/* {`Inspection Remark ${userName}`*/}
                        {legendTitle}
                </legend>

                <div className="mt-3">

                    {/* 🔹 Non Admin View */}
                    {!isAdmin ? (
                        <div className="text-base font-semibold">
                            {status === "V" && <span className="text-green-600">Verified</span>}
                            {status === "R" && <span className="text-red-600">Rejected</span>}
                            {status === "N" && <span className="text-gray-500">Pending</span>}
                        </div>
                    ) : (

                        <>
                            {/* 🔹 Admin Radio Buttons */}
                            <div className="flex items-center gap-8">

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="V"
                                        checked={status === "V"}
                                        onChange={() => handleStatusChange("V")}
                                        className="accent-green-600 w-4 h-4"
                                            // disabled={readOnly}
                                            disabled={readOnly || mode === "view"}
                                    />
                                    <span className="font-medium text-green-700">
                                        Verified
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="R"
                                        checked={status === "R"}
                                        onChange={() => handleStatusChange("R")}
                                        className="accent-red-600 w-4 h-4"
                                            //disabled={readOnly}
                                            disabled={readOnly || mode === "view"}
                                    />
                                    <span className="font-medium text-red-700">
                                        Rejected
                                    </span>
                                </label>

                            </div>

                            {/* 🔥 STATUS ERROR */}
                            {error.status && (
                                <p className="text-red-500 text-sm mt-2">
                                    Please select Inspection Status
                                </p>
                            )}
                        </>
                    )}

                    {/* 🔹 Remark Section */}
                    <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Remark {status === "R" && <span>*</span>}
                        </label>

                        {!isAdmin ? (
                            <div>{remark || "No remark provided"}</div>
                        ) : (
                            <>
                                <textarea
                                    className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 
                                    ${error.remark
                                            ? "border-red-500 focus:ring-red-400"
                                            : "border-gray-300 focus:ring-blue-400"
                                        }`}
                                    placeholder={
                                        status === "R"
                                            ? "Enter rejection remark (required)"
                                            : "Enter remark (optional)"
                                    }
                                    value={remark}
                                    rows={3}
                                    onChange={(e) => handleRemarkChange(e.target.value)}
                                    disabled={readOnly}
                                />

                                {/* 🔥 REMARK ERROR */}
                                {error.remark && (
                                    <p className="text-red-500 text-sm mt-1">
                                        Remark is required when status is Rejected
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </fieldset>
        );
    }
);

export default InspectionStatusComponent;