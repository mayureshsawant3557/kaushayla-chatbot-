import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { GetStaffID } from '../../Endpoints_All/Base/masterData';
import { GetStaffSummary } from "../../Endpoints_All/Staff/summary";
import { SaveInstituteManagementDetails, DeleteInstituteManagementDetails, GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import NotVerifiedIcon from '../../assets/NotVerifiedIcon.jpg';
import VerifiedIcon from '../../assets/VerifiedIcon.jpg';
import agent from "../../lib/api/agent";
import { getDeviceIP } from "../../utils/CommonHelper";
import { useAuth } from "../../Hooks/AuthContext";

// Activity definitions for Admission Committee — ManagementTypeIDs 105-108
export const ADMISSION_ACTIVITIES = [
    { key: "ADMISSION_CONFIRMATION",    label: "Admission Confirmation",        ManagementTypeID: 105 },
    { key: "APP_FORM_CONFIRMATION",     label: "Application Form Confirmation", ManagementTypeID: 106 },
    { key: "ADMISSION_CANCELLATION",    label: "Admission Cancellation",        ManagementTypeID: 107 },
    { key: "APP_COUNSELLINGROUND",      label: "Counselling Round Activities",  ManagementTypeID: 108 },
];

export const ADMISSION_COMMITTEE_TYPE_IDS = ADMISSION_ACTIVITIES.map(a => a.ManagementTypeID);

const EMPTY_ROW = {
    ProfileID: "",
    Title: "",
    FirstName: "",
    MiddleName: "",
    LastName: "",
    Gender: "",
    DOB: "",
    MobileNo: "",
    EMailID: "",
    Status: "",
};
let ipAddress = "";
// Fetches staff record by ApplicationID/ProfileID and sets component state.
const fetchStaffByProfileID = async (profileID, { setLoading, setData, setFetched, setPopupError }) => {
    if (!profileID?.trim()) {
        setPopupError("Staff/Management Profile ID required.");
        setData(EMPTY_ROW);
        setFetched(false);
        return;
    }
    setLoading(true);
    try {
        const resstaffid = await agent.get(`${GetStaffID}?ApplicationID=${profileID.trim()}`);
        if (resstaffid.data.Status === "Success" && resstaffid.data.Data) {
            const requestBody = {
                StaffID: resstaffid.data.Data,
                UserLoginID: "",
                PageCode: "1",
                IPAddress: ipAddress,
            };
            const res = await agent.post(GetStaffSummary, requestBody);
            if (res.data.Status === "Success" && res.data.Data) {
                setData(res.data.Data.StaffPrimarySummary);
                setFetched(true);
            } else {
                setPopupError("No profile found for this ID.");
                setData(EMPTY_ROW);
                setFetched(false);
            }
        } else {
            setPopupError("No profile found for this ID.");
            setData(EMPTY_ROW);
            setFetched(false);
        }
    } catch {
        setPopupError("Unable to fetch profile.");
        setData(EMPTY_ROW);
        setFetched(false);
    } finally {
        setLoading(false);
    }
};

/*
 * AdmissionCommitteePopup
 *
 * Props:
 *   open            – boolean controlling visibility
 *   onClose         – called when popup is dismissed
 *   onSaved         – called after a successful save (triggers parent refresh)
 *   existingMember  – when editing: { ProfileID, Activities: ADMISSION_ACTIVITIES[] }
 *                     when adding:  null
 */
const AdmissionCommitteePopup = ({ open, onClose, onSaved, existingMember = null }) => {
    const [searchID, setSearchID]               = useState("");
    const [popupError, setPopupError]           = useState("");
    const [data, setData]                       = useState(EMPTY_ROW);
    const [loading, setLoading]                 = useState(false);
    const [fetched, setFetched]                 = useState(false);
    const [selectedActivities, setSelectedActivities] = useState([]);
     const {userInfo} = useAuth();
    //const [ipAddress, setIpAddress] = useState("0.0.0.0");
    // Reset or pre-populate whenever the popup opens
    useEffect(() => {
        if (!open) return;
      
        if (existingMember) {
            const preselected = existingMember.Activities.map(a => a.ManagementTypeID);
            setSearchID(existingMember.ProfileID || "");
            setSelectedActivities(preselected);
            setPopupError("");
            // Auto-fetch staff details for the existing member
            fetchStaffByProfileID(existingMember.ProfileID, {
                setLoading,
                setData,
                setFetched,
                setPopupError,
            });
        } else {
            setSearchID("");
            setSelectedActivities([]);
            setData(EMPTY_ROW);
            setFetched(false);
            setPopupError("");
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect (() =>{
        fetchIP();
        
    })

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            ipAddress = ip;
        } catch (err) {
        }
        };

    const handleSearchID = () => {
        fetchStaffByProfileID(searchID, { setLoading, setData, setFetched, setPopupError });
    };

    const handleActivityToggle = (managementTypeID) => {
        setSelectedActivities(prev =>
            prev.includes(managementTypeID)
                ? prev.filter(id => id !== managementTypeID)
                : [...prev, managementTypeID]
        );
    };

    const handleSave = async () => {
        if (!data.ApplicationID || !data.FirstName) return;
        debugger;
        if (selectedActivities.length === 0) {
            Swal.fire("Warning", "Please select at least one admission activity.", "warning");
            return;
        }

        setLoading(true);
        try {
            const resinstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo.UserLoginID}`
            );
            const instituteID = resinstitute.data.Data;

            // IDs that were already saved when popup opened
            const initialActivityIDs = existingMember
                ? existingMember.Activities.map(a => a.ManagementTypeID)
                : [];

            // Activities unchecked since popup opened — delete them
            const toDelete = existingMember
                ? existingMember.Activities.filter(a => !selectedActivities.includes(a.ManagementTypeID))
                : [];

            // Activities newly checked — insert them
            const toInsert = selectedActivities.filter(id => !initialActivityIDs.includes(id));

            const deletePromises = toDelete.map(activity =>
                agent.post(DeleteInstituteManagementDetails, {
                    ID: activity.RecordID || 0,
                    InstituteID: instituteID,
                    StaffID: activity.InternalStaffID,
                    ManagementType: activity.ManagementTypeID,
                    CreateBy: userInfo.UserLoginID || "system",
                    IPAddress: ipAddress,
                })
            );

            const insertPromises = toInsert.map(managementTypeID =>
                agent.post(SaveInstituteManagementDetails, {
                    ID: 0,
                    InstituteID: instituteID,
                    StaffID: data.StaffID,
                    ManagementType: managementTypeID,
                    CreateBy: userInfo.UserLoginID || "system",
                    IPAddress: ipAddress,
                })
            );

            const allPromises = [...deletePromises, ...insertPromises];

            if (allPromises.length === 0) {
                Swal.fire("Info", "No changes to save.", "info");
                onClose();
                return;
            }

            await Promise.all(allPromises);
            debugger;

            // Check first insert response for API-level error message
            if (insertPromises.length > 0) {
                const response = await insertPromises[0];
                if (response.data.Status === "Error")
                    Swal.fire("Warning", response.data.Message);
                else
                    Swal.fire("Success", "Admission committee record updated.", "success");
            } else {
                Swal.fire("Success", "Admission committee record updated.", "success");
            }

            onClose();
            if (onSaved) onSaved();
        } catch {
            Swal.fire("Error", "Failed to update admission committee data.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-[90vw] md:w-[65vw] relative p-0 min-h-[300px]">

                {/* Header */}
                <div className="bg-[#062568] text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
                    <span className="font-semibold text-xl">
                        Add/Update Admission Committee Member
                    </span>
                    <button onClick={onClose} className="rounded p-1 hover:bg-gray-600 transition">
                        <IoClose className="text-2xl" />
                    </button>
                </div>

                {/* Info note */}
                <div className="p-2 pb-1">
                    <div className="rounded bg-red-100 border border-red-300 text-red-900 px-3 py-2 mb-3 text-sm">
                        <ul className="list-disc pl-5">
                            <li>Enter the Staff/Management Profile ID to search and assign admission activities.</li>
                            <li>You can select one or multiple activities for the same staff member.</li>
                            <li>Enter Sevarth ID for Government Employees registered on DVET HRMS Portal.</li>
                        </ul>
                    </div>
                </div>

                {/* Search row */}
                <div className="px-4 pb-2 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 w-full justify-center">
                        <label className="text-md text-gray-700 whitespace-nowrap">
                            Staff/ Management Profile ID<span className="text-red-600 ml-1">*</span> :
                        </label>
                        <input
                            className="border px-2 py-2 rounded text-sm w-64"
                            value={searchID}
                            onChange={e => {
                                setSearchID(e.target.value);
                                setPopupError("");
                                setFetched(false);
                            }}
                            onKeyUp={e => setSearchID(e.target.value.toUpperCase())}
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

                {popupError && (
                    <div className="text-xs text-red-600 px-4 mb-1">{popupError}</div>
                )}

                {/* Staff details + activity checkboxes — shown after successful fetch */}
                {fetched && (
                    <div className="px-4 pb-2 mt-3">
                        {/* Staff summary card */}
                        <div className="flex gap-6 mb-4">
                            <div className="flex-1">
                                <div className="space-y-2">
                                    <div className="flex">
                                        <span className="font-semibold min-w-[200px]">Staff/ Management</span>
                                        <span className="mr-2">:</span>
                                        <span>{`${data.FirstName} ${data.MiddleName} ${data.LastName} (${data.ApplicationID || '0'})`}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-semibold min-w-[200px]">Date of Birth</span>
                                        <span className="mr-2">:</span>
                                        <span>{data.DOB}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-semibold min-w-[200px]">Gender</span>
                                        <span className="mr-2">:</span>
                                        <span>{data.Gender || 'Male'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-semibold min-w-[200px]">Primary Mobile No</span>
                                        <span className="mr-2">:</span>
                                        <span>{data.MobileNo}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-semibold min-w-[200px]">E-mail ID</span>
                                        <span className="mr-2">:</span>
                                        <span>{data.EMailID}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Photo with verification badge */}
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

                        {/* Admission activity checkboxes */}
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <p className="font-semibold text-sm text-gray-700 mb-2">
                                Select Admission Activities <span className="text-red-500">*</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ADMISSION_ACTIVITIES.map(activity => (
                                    <label
                                        key={activity.key}
                                        className="flex items-center gap-2 cursor-pointer text-sm text-gray-800"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedActivities.includes(activity.ManagementTypeID)}
                                            onChange={() => handleActivityToggle(activity.ManagementTypeID)}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        {activity.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Save button */}
                <div className="flex justify-center gap-3 px-4 pb-4 mt-2">
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

                {/* Full-screen loader overlay */}
                {loading && (
                    <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 rounded-xl">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmissionCommitteePopup;
