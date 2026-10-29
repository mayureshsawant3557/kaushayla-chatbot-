import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { useAuth } from "../../Hooks/AuthContext";
import { GetStaffID } from '../../Endpoints_All/Base/masterData';
import { GetStaffSummary } from "../../Endpoints_All/Staff/summary";
import { SaveDVETOManagementDetails, SaveDVETOInspectionCommittee, SaveROManagementDetails } from "../../Endpoints_All/Base/DVETO";
import NotVerifiedIcon from '../../assets/NotVerifiedIcon.jpg';
import VerifiedIcon from '../../assets/VerifiedIcon.jpg';
import agent from "../../lib/api/agent";
import { getDeviceIP } from "../../utils/CommonHelper";

const EMPTY_ROW = {
    ProfileID: "",
    Title: "",
    FirstName: "",
    MiddleName: "",
    LastName: "",
    Gender: "",
    DOB: "",
    MobileNo: "",
    EmailID: "",
    Status: "",

};

const DVETOStaffProfilePopup = ({
    open,
    onClose,
    roleConfig,
    onSaved,
    IsPromotorForm = false,
    instituteID,
    isRO = false

}) => {
    const { userInfo } = useAuth();
    const [searchID, setSearchID] = useState("");
    const [popupError, setPopupError] = useState("");
    const [data, setData] = useState(EMPTY_ROW);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [numericStaffID, setNumericStaffID] = useState(null);

    const handleSearchID = async () => {
        setPopupError("");
        if (!searchID?.trim()) {
            setPopupError("Staff/Management Profile ID required.");
            setData(EMPTY_ROW);
            setFetched(false);
            setNumericStaffID(null);
            return;
        }

        setLoading(true);

        try {
            const ipAddress = await getDeviceIP();

            const resstaffid = await agent.get(`${GetStaffID}?ApplicationID=${searchID.trim()}`);

            if (resstaffid.data.Status === "Success" && resstaffid.data.Data) {

                const numericID = resstaffid.data.Data;
                setNumericStaffID(numericID);

                const requestBody = {
                    StaffID: numericID,
                    UserLoginID: "",
                    PageCode: "1",
                    IPAddress: ipAddress
                };

                const res = await agent.post(GetStaffSummary, requestBody);

                if (res.data.Status === 'Success' && res.data.Data) {

                    setData({
                        ...res.data.Data.StaffPrimarySummary,
                        ApplicationID: searchID.trim(),
                        StaffID: numericID
                    });
                    setFetched(true);
                } else {
                    setPopupError("No profile found for this ID.");
                    setData(EMPTY_ROW);
                    setFetched(false);
                    setNumericStaffID(null);
                }
            } else {
                setPopupError("No profile found for this ID.");
                setData(EMPTY_ROW);
                setFetched(false);
                setNumericStaffID(null);
            }
        } catch (error) {
            setPopupError("Unable to fetch profile.");
            setData(EMPTY_ROW);
            setFetched(false);
            setNumericStaffID(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {

        if (!data.ApplicationID || !data.FirstName) {
            Swal.fire("Error", "Please search and load a profile first.", "error");
            return;
        }

        setLoading(true);

        try {

            const ipAddress = await getDeviceIP();

            const officeID = instituteID
                ? Number(instituteID)
                : userInfo.UserID;

            const payload =
                roleConfig.apiLabel === "InspectionCommittee"
                    ? {
                        ID: 0,
                        InstituteID: officeID,
                        StaffID: numericStaffID || data.StaffID,
                        ManagementType: roleConfig.ManagementTypeID,
                        CreateBy: userInfo.UserLoginID || "system",
                        IPAddress: ipAddress
                    }
                    : {
                        ID: 0,
                        ...(isRO
                            ? { ROID: officeID }
                            : { DVETOID: officeID }),
                        StaffID: numericStaffID || data.StaffID,
                        ManagementType: roleConfig.ManagementTypeID,
                        CreateBy: userInfo.UserLoginID || "system",
                        IPAddress: ipAddress
                    };

            const apiToCall =
                roleConfig.apiLabel === "InspectionCommittee"
                    ? SaveDVETOInspectionCommittee
                    : isRO
                        ? SaveROManagementDetails
                        : SaveDVETOManagementDetails;

            const response = await agent.post(apiToCall, payload);
            Swal.fire("Success", "Record saved successfully.", "success");
            onClose();
            if (onSaved) onSaved();

        } catch (error) {

            if (error.response) {

                // Show the error
                Swal.fire({
                    icon: "error",
                    title: `Error ${error.response.status}`,
                    text: error.response.data?.message || JSON.stringify(error.response.data) || "Unknown error"
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "Failed to save data"
                });
            }
        } finally {
            setLoading(false);
        }
    };
    if (!open || !roleConfig) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-[90vw] md:w-[60vw] relative p-0 min-h-[300px]">
                {/* Header */}
                <div className="bg-[#062568] text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
                    <span className="font-semibold text-xl">
                        {roleConfig.button.replace('Add', 'Add/Update')}
                    </span>
                    <button onClick={onClose} className="rounded p-1 hover:bg-gray-600 transition">
                        <IoClose className="text-2xl text-white-600" />
                    </button>
                </div>

                {/* Note - Updated for DVETO */}
                <div className="p-2 pb-1">
                    <div className="rounded bg-red-100 border border-red-300 text-red-900 px-3 py-2 mb-3 text-sm">
                        <ul className="list-disc pl-5">
                            {
                                isRO ? (
                                    <>
                                        <li>Regional Joint Director can be added as either Principal Officer or Officer.</li>
                                        <li>Principal Officer cannot be added as Officer.</li>
                                        <li>A member can be added as Officer only once.</li>
                                    </>
                                ) : (
                                    <>
                                        <li>DVETO Officer can be added as either Principal Officer or Officer.</li>
                                        <li>Principal Officer cannot be added as Officer.</li>
                                        <li>A member can be added as Officer only once.</li>
                                    </>
                                )
                            }</ul>
                    </div>
                </div>

                {/* Search row */}
                <div className="px-4 pb-2 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 w-full justify-center">
                        <label className="text-md text-gray-700 whitespace-nowrap">
                            Staff/Management Profile ID<span className="text-red-600 ml-1">*</span> :
                        </label>

                        <input
                            className="border px-2 py-2 rounded text-sm w-64"
                            value={searchID}
                            onChange={e => {
                                setSearchID(e.target.value);
                                setPopupError("");
                                setFetched(false);
                                setNumericStaffID(null);
                            }}
                            onKeyUp={e => {
                                setSearchID(e.target.value.toUpperCase());
                            }}
                            disabled={fetched || loading}
                            placeholder="Enter Profile ID"
                            onKeyDown={e => {
                                if (e.key === "Enter" && !fetched && !loading) handleSearchID();
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleSearchID}
                        className="bg-[#ed3d3d] hover:bg-red-700 px-3 py-2 text-white rounded text-sm"
                        disabled={fetched || loading}
                    >
                        Get Staff/Management Details
                    </button>
                </div>

                {popupError && <div className="text-xs text-red-600 px-4">{popupError}</div>}

                {fetched && (
                    <div className="px-4 pb-4 mt-3">
                        <div className="flex gap-6">
                            <div className="flex-1">
                                <div className="space-y-2">
                                    <div className="flex">
                                        <span className="font-semibold min-w-[200px]">Staff/Management</span>
                                        <span className="mr-2">:</span>
                                        <span>{`${data.FirstName || ''} ${data.MiddleName || ''} ${data.LastName || ''} (${data.ApplicationID || '0'})`}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-semibold min-w-[200px]">Date of Birth</span>
                                        <span className="mr-2">:</span>
                                        <span>{data.DOB || ''}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-semibold min-w-[200px]">Gender</span>
                                        <span className="mr-2">:</span>
                                        <span>{data.Gender || ''}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-semibold min-w-[200px]">Primary Mobile No</span>
                                        <span className="mr-2">:</span>
                                        <span>{data.MobileNo || ''}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-semibold min-w-[200px]">E-mail ID</span>
                                        <span className="mr-2">:</span>
                                        <span>{data.EMailID || ''}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                {data.VerifyCnt === "" && (
                                    <div className="absolute -top-2 -right-2 z-10">
                                        <img alt="not-verified" src={NotVerifiedIcon} className="w-12 h-12" />
                                    </div>
                                )}
                                {data.VerifyCnt > 0 && data.RejectCnt === 0 && (
                                    <div className="absolute -top-2 -right-2 z-10">
                                        <img alt="verified" src={VerifiedIcon} className="w-12 h-12" />
                                    </div>
                                )}
                                <img
                                    src={data.PhotoFilePath || "/images/default-avatar.jpg"}
                                    alt="Staff Photo"
                                    className="w-40 h-48 object-cover border-2 border-gray-300"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-center gap-3 px-4 pb-4">
                    {fetched && (
                        <button
                            onClick={handleSave}
                            className={`bg-green-700 text-white px-6 py-2 rounded ${loading ? "opacity-50 pointer-events-none" : ""}`}
                            disabled={loading}
                        >
                            Save
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DVETOStaffProfilePopup;