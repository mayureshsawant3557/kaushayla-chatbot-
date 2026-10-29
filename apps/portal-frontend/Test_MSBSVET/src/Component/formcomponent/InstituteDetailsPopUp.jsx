import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useInstituteDetails } from "../../lib/hooks/useInstituteDetails";
import { SwalHelper } from "../../utils/swalHelper";
import { useInstituteMapping } from "../../lib/hooks/command/useInstituteMapping";
import Swal from "sweetalert2";
import { getDeviceIP } from "../../utils/CommonHelper";
import { useAuth } from "../../Hooks/AuthContext";
function InstituteDetailsPopUp({ open, onClose, onSaved, promotingOrgId, isSecretary }) {
    const { t } = useTranslation("InstituteDetails");
    const [searchID, setSearchID] = useState("");
    const [popupError, setPopupError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const {userInfo} = useAuth();

    const { instituteDetails: data,
        //isFetched,
        isSuccess: isFetched,
        instituteID, error,
        isError,
        isLoading: isFetchingData,
        instituteIDQuery,
        instituteDetailsQuery,
        refetch: instituteQueryRefetch
    } = useInstituteDetails(searchID || undefined);
    const {
        saveInstituteMapping,
        isSaving
    } = useInstituteMapping();


    useEffect(() => {
        if (open) {
            setSearchID("");
            setPopupError("");
            setIsExpanded(false);
            setLoading(false);
        }
    }, [open]);

    useEffect(() => {
        if (isError && searchID) {
            let errorMessage = "An error occurred while fetching institute details.";

            if (instituteIDQuery?.isError && instituteIDQuery?.error) {
                const idError = instituteIDQuery.error;
                errorMessage = idError?.Message || idError?.message || "Institute Code not found.";
            }
            else if (instituteDetailsQuery?.isError && instituteDetailsQuery?.error) {
                const detailsError = instituteDetailsQuery.error;
                errorMessage = detailsError?.Message || detailsError?.message || "Institute details not found.";
            }
            else if (error) {
                errorMessage = error?.Message || error?.message || errorMessage;
            }

            setPopupError(errorMessage);
            setIsExpanded(false);
        }
    }, [isError, error, instituteIDQuery, instituteDetailsQuery, searchID]);

    useEffect(() => {
        if (isFetched && data) {
            setPopupError("");
        }
    }, [isFetched, data]);

    const handleSearch = useCallback(async () => {
        if (!searchID?.trim()) {
            SwalHelper.error("Error", "Institute ID Required.");
            return;
        }
        setPopupError("");
        setIsExpanded(true); // Expand popup when search is triggered
        try {
            await instituteQueryRefetch();
        } catch (error) {
            SwalHelper.error("Error", "Institute not found.");
            setIsExpanded(false);
            setPopupError("Invalid Institute ID");
        }
    }, [searchID, instituteQueryRefetch]);

    const handleSave = async () => {
        if (!instituteID && !promotingOrgId) {
            SwalHelper.error("Error", "Required data missing.");
            return;
        }

        setLoading(true);

        try {
            const ipAddress = await getDeviceIP();

            // 🔥 fallback logic
            const finalInstituteId = promotingOrgId || instituteID;

            let payload = {
                ID: 0,

                // ✅ dynamic based on availability
                InstituteID: finalInstituteId,

                // (optional but recommended if API supports)
                PromotingOrganisationId: promotingOrgId || null,

                StaffID: data?.InstituteCode,
                ManagementType: 1,
                CreateBy: userInfo.UserLoginID || "system",
                IPAddress: ipAddress || "127.0.0.1",
            };


            const result = await saveInstituteMapping(payload);

            const message = result?.Message || "Record saved successfully.";
            const dataMessage = result?.Data || "";

            const isWarning = dataMessage?.toLowerCase().includes("already");

            const finalMessage = isWarning
                ? `${message}<br/><br/><b>Info:</b> ${dataMessage}`
                : message;

            Swal.fire({
                title: isWarning ? "Warning" : "Success",
                html: finalMessage,
                icon: isWarning ? "warning" : "success",
            });

            onClose();
            if (onSaved) onSaved();

        } catch (error) {
            Swal.fire({
                title: "Error",
                text:
                    error?.response?.data?.Message ||
                    error?.response?.data?.message ||
                    "Failed to save data.",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className={`
                bg-white rounded-xl shadow-lg relative p-0 min-h-[250px] transition-all duration-300 ease-in-out
                ${isExpanded
                    ? 'max-w-4xl w-[90vw] md:w-[70vw] max-h-[80vh] overflow-y-auto'
                    : 'max-w-2xl w-[85vw] md:w-[50vw]'
                }
            `}>
                <div className="bg-[#062568] text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
                    <span className="font-semibold text-xl">
                        Add Affiliated Institutes
                    </span>
                    <button
                        onClick={onClose}
                        className="rounded p-1 hover:bg-gray-600 transition"
                        disabled={loading}
                    >
                        <IoClose className="text-2xl text-white-600" />
                    </button>
                </div>

                <div className="px-4 pb-4 pt-4 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 w-full justify-center">
                        <label className="text-md text-gray-700 whitespace-nowrap">
                            Institute Code <span className="text-red-600 ml-1">*</span> :
                        </label>
                        <input
                            className="border px-2 py-2 rounded text-sm flex-1 max-w-md"
                            value={searchID}
                            onChange={e => {
                                const upperValue = e.target.value.toUpperCase();
                                setSearchID(upperValue);
                                setPopupError("");
                            }}
                            disabled={isFetchingData} 
                            placeholder="Enter Institute ID"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleSearch}
                        className="bg-[#ed3d3d] hover:bg-red-700 px-6 py-2 text-white rounded text-sm transition"
                        disabled={!searchID.trim() || isFetchingData}
                    >
                        {isFetchingData ? "Loading..." : "Get Institute Details"}
                    </button>
                </div>

                {popupError && (
                    <div className="px-4 pb-2">
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{popupError}</div>
                    </div>
                )}

                {isFetched && data && (
                    <div className="px-4 pb-6 border-t border-gray-200">
                        <h3 className="font-semibold text-lg mb-4 text-gray-800">
                            Affiliated Institutes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div>
                                <div className="flex items-start">
                                    <span className="font-semibold min-w-[140px] text-sm">Institute Name</span>
                                    <span className="mx-2 text-gray-500">:</span>
                                    <span className="text-sm">{data.InstituteName}</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-start">
                                    <span className="font-semibold min-w-[140px] text-sm">Institute Code</span>
                                    <span className="mx-2 text-gray-500">:</span>
                                    <span className="text-sm">{data.InstituteCode}</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-start">
                                    <span className="font-semibold min-w-[140px] text-sm">District</span>
                                    <span className="mx-2 text-gray-500">:</span>
                                    <span className="text-sm">{data.District}</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-start">
                                    <span className="font-semibold min-w-[140px] text-sm">Taluka</span>
                                    <span className="mx-2 text-gray-500">:</span>
                                    <span className="text-sm">{data.InstituteTaluka}</span>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex items-start">
                                    <span className="font-semibold min-w-[140px] text-sm">City / Village</span>
                                    <span className="mx-2 text-gray-500">:</span>
                                    <span className="text-sm">{data.InstituteCity}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isFetched && data && (
                    <div className="flex justify-center gap-3 px-4 pb-6 pt-2 border-t border-gray-200">
                        <button
                            onClick={handleSave}
                            className={`bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 ${loading} ? "opacity-50 pointer-events-none" : "hover:scale-[1.02]"`}
                            disabled={loading || !data.InstituteCode}
                        >
                            {loading ? "Saving..." : "Add Affiliated Institutes"}
                        </button>
                        <button
                            onClick={() => {
                                setIsExpanded(false);
                                setSearchID("");
                                setPopupError("");
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                            disabled={loading}
                        >
                            {"New Search"}
                        </button>
                    </div>
                )}

                {(loading || isFetchingData) && (
                    <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-90 backdrop-blur-sm rounded-xl">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <span className="text-sm text-gray-600"> {loading ? "Saving..." : "Loading..."}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InstituteDetailsPopUp;