import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from "../../Context/ThemeContext";
import { FaUsers } from 'react-icons/fa';
import { useAuth } from "../../../Hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import StaffProfilePopup from "../../formcomponent/StaffProfilePopup";
import AdmissionCommitteePopup, {
    ADMISSION_ACTIVITIES,
    ADMISSION_COMMITTEE_TYPE_IDS,
} from "../../formcomponent/AdmissionCommitteePopup";
import Staff_PrintApplicationForm from "../../PrintApplicationForm/Staff_PrintApplicationForm"; // Import the print component
/*import ReactDOM from 'react-dom';*/
import { GetInstituteManagementDetails, GetInstituteIDByInstituteCode, DeleteInstituteManagementDetails } from "../../../Endpoints_All/Base/Institute";
import ReactDOM from "react-dom/client";
import { GetStaffID } from '../../../Endpoints_All/Base/masterData';
import agent from '../../../lib/api/agent';
import { getDeviceIP } from '../../../utils/CommonHelper';

const ROLE_CONFIG = [
    {
        key: "authorizedRep",
        label: "Authorized Representative of Institute",
        apiLabel: "AuthorizedRepresentative",
        button: "Add Authorized Representative",
        updateButton: "Update Authorized Representative",
        ManagementTypeID: 1,
        required: true
    },
    {
        key: "principal",
        label: "Head of Institute/ Principal/Director",
        apiLabel: "Principal",
        button: "Add Head of Institute",
        updateButton: "Update Head of Institute",
        ManagementTypeID: 2,
        required: true
    },
    {
        key: "apprenticeship",
        label: "Apprenticeship Coordinator",
        apiLabel: "ApprenticeshipCoordinator",
        button: "Add Apprenticeship Coordinator",
        updateButton: "Update Apprenticeship Coordinator",
        ManagementTypeID: 4,
        required: true
    },
    {
        key: "admission",
        label: "Admission Coordinator",
        apiLabel: "AdmissionCoordinator",
        button: "Add Admission Coordinator",
        updateButton: "Update Admission Coordinator",
        ManagementTypeID: 3,
        required: true
    },
    {
        key: "ExamController",
        label: "Exam Controller",
        apiLabel: "ApprenticeshipCoordinator",
        button: "Add Exam Controller",
        updateButton: "Update Exam Controller",
        ManagementTypeID: 9,
        required: true
    },
];

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

const Management = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState({
        authorizedRep: { ...EMPTY_ROW },
        principal: { ...EMPTY_ROW },
        admission: { ...EMPTY_ROW },
        apprenticeship: { ...EMPTY_ROW },
    });
    const [popupRole, setPopupRole] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [popupKey, setPopupKey] = useState(0);
    const [errors, setErrors] = useState({});
    const [ipAddress, setIpAddress] = useState("");


    // --- Admission Committee state ---
    const [admissionCommittee, setAdmissionCommittee] = useState([]);
    const [admissionPopupOpen, setAdmissionPopupOpen] = useState(false);
    const [editingCommitteeMember, setEditingCommitteeMember] = useState(null);



    useEffect(() => {
        fetchManagementData();
        fetchIP();
        

    }, [refresh]);

    const fetchIP = async () => {
    try {
        const ip = await getDeviceIP();
        setIpAddress(ip);
    } catch (err) {
    }
    };


    const fetchManagementData = async () => {
        setLoading(true);

        try {
            const resinstitute = await agent.get(`${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo?.UserLoginID}`);

            const res = await agent.get(`${GetInstituteManagementDetails}?instituteID=${resinstitute.data.Data}`);
            if (res.data?.Status === "Success" && Array.isArray(res.data.Data)) {
                // Populate single-role records (ManagementTypeIDs 1-4)
                let dataMap = {};
                ROLE_CONFIG.forEach(({ key, ManagementTypeID }) => {
                    const row = res.data.Data.find((itm) => itm.ManagementType === ManagementTypeID);
                    dataMap[key] = row ? row : { ...EMPTY_ROW };
                });
                setRecords(dataMap);

                // Group Admission Committee records (ManagementTypeIDs 105-108) by ProfileID
                const admissionRows = res.data.Data.filter(itm =>
                    ADMISSION_COMMITTEE_TYPE_IDS.includes(itm.ManagementType)
                );
                const grouped = {};
                admissionRows.forEach(itm => {
                    const groupKey = itm.ProfileID || itm.StaffID;
                    if (!grouped[groupKey]) {
                        grouped[groupKey] = {
                            ProfileID: itm.ProfileID,
                            InternalStaffID: itm.StaffID,  // numeric DB id used in delete/save
                            Title: itm.Title,
                            FirstName: itm.FirstName,
                            MiddleName: itm.MiddleName,
                            LastName: itm.LastName,
                            Gender: itm.Gender,
                            DOB: itm.DOB,
                            MobileNo: itm.MobileNo,
                            Status: itm.Status,
                            Activities: [],
                        };
                    }
                    const activity = ADMISSION_ACTIVITIES.find(
                        a => a.ManagementTypeID === itm.ManagementType
                    );
                    if (activity) {
                        grouped[groupKey].Activities.push({
                            ...activity,
                            RecordID: itm.ID || itm.Id || 0,  // record PK for delete
                            InternalStaffID: itm.StaffID,
                        });
                    }
                });
                setAdmissionCommittee(Object.values(grouped));
            }
        } catch (error) {
            Swal.fire("Error", "Unable to fetch management data.", "error");
        } finally {
            setLoading(false);
        }
    };

  const handlePrintProfile = async (profileID) => {
    if (!profileID) {
        Swal.fire("Info", "No Profile ID available", "info");
        return;
    }

    try {
        const resstaff = await agent.get(
            `${GetStaffID}?ApplicationID=${profileID.trim()}`
        );

        const staffID = resstaff.data.Data;

        const popupWidth = 1000;
        const popupHeight = 750;

        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        window.open(
            `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffID}&userLoginID=${profileID}&pageCode=STAFF_PRINT`,
            "StaffPrintApplicationForm",
            `width=${popupWidth},
             height=${popupHeight},
             left=${left},
             top=${top},
             resizable=yes,
             scrollbars=yes`
        );

    } catch (error) {
        Swal.fire("Error", "Failed to load profile", "error");
    }
};

    const handlePopupClose = () => {
        setPopupRole(null);
        setPopupKey(prev => prev + 1);
    };

    const onPopupSaved = () => {
        handlePopupClose();
        setRefresh((r) => !r);
        if (popupRole) {
            setErrors(prev => ({ ...prev, [popupRole]: false }));
        }
    };

    const handleAdmissionPopupClose = () => {
        setAdmissionPopupOpen(false);
        setEditingCommitteeMember(null);
    };

    const onAdmissionSaved = () => {
        handleAdmissionPopupClose();
        setRefresh(r => !r);
    };

    // Inline delete: called when user unchecks an activity badge checkbox in the table
    const handleRemoveActivity = async (member, activity) => {
        const result = await Swal.fire({
            title: "Remove Activity?",
            html: `Remove <strong>${activity.label}</strong> from <strong>${member.FirstName} ${member.LastName}</strong>?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, Remove",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;

        try {
            const resinstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo?.UserLoginID}`
            );
            await agent.post(DeleteInstituteManagementDetails, {
                ID: activity.RecordID || 0,
                InstituteID: resinstitute.data.Data,
                ManagementType: activity.ManagementTypeID,
                CreateBy: userInfo?.UserLoginID || "system",
                IPAddress:ipAddress,
            });
            setRefresh(r => !r);
        } catch {
            Swal.fire("Error", "Failed to remove activity.", "error");
        }
    };

    const validateAllFields = () => {
        const newErrors = {};
        let missingRoles = [];

        ROLE_CONFIG.forEach((role) => {
            if (role.required) {
                const record = records[role.key];
                if (!record || !record.ProfileID) {
                    newErrors[role.key] = true;
                    missingRoles.push(role.label);
                }
            }
        });

        setErrors(newErrors);

        if (missingRoles.length > 0) {
            Swal.fire({
                icon: "warning",
                title: "Required Fields Missing",
                html: `
                    <div class="text-left">
                        <p class="mb-3">Please add the following required management roles:</p>
                        <ul class="list-disc ml-6 text-left">
                            ${missingRoles.map(role => `<li>${role}</li>`).join('')}
                        </ul>
                    </div>
                `,
                confirmButtonColor: "#d33",
                confirmButtonText: "OK"
            });
            return false;
        }

        return true;
    };

   const handleSaveAndNext = () => {

    const userTypeId = Number(userInfo?.UserTypeID);

    if (validateAllFields()) {
        debugger;

        if (userTypeId === 61) {
            navigate("/institute/dashboard");
        } else {
            navigate("/institute/PromotingOrganization");
        }
    }
};

    const handleBack = () => {

        const userTypeId = userInfo?.UserTypeID;

        if (Number(userTypeId) === 61) {
            navigate("/institute/dashboard");
        } else {
            navigate(-1);
        }
    };

    const handleClose = () => {
        window.close();
    };

    // UPDATED: Modified to include click handler
    const getRowCells = (data, idx) => (
        <tr className="text-sm" key={idx}>
            <td className="p-2 border border-gray-300">
                <a
                    href="#"
                    className="text-blue-700 hover:underline cursor-pointer"
                    onClick={(e) => {
                        e.preventDefault();
                        handlePrintProfile(data.ProfileID);
                    }}
                >
                    {data.ProfileID}
                </a>
            </td>
            <td className="p-2 border border-gray-300">
                {[data.Title, data.FirstName, data.MiddleName, data.LastName].filter(Boolean).join(' ')}
            </td>
            <td className="p-2 border border-gray-300">{data.Gender}</td>
            <td className="p-2 border border-gray-300">{data.MobileNo}</td>
            <td className="p-2 border border-gray-300 text-center">
                {data.Status === "Verified" ? (
                    <div className="flex justify-center">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">✓</span>
                        </div>
                    </div>
                ) : data.Status ? (
                    <div className="flex justify-center">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">?</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">?</span>
                        </div>
                    </div>
                )}
            </td>
        </tr>
    );

    return (
        <div className="w-full p-4">
            <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
                <legend className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}>
                    <FaUsers className="mr-2 text-white" />
                    Institute Management
                </legend>

                <div className="px-4 pb-3 pt-3">
                    <div className="grid grid-cols-1 gap-6">
                        {ROLE_CONFIG.map((role) => (
                            <div
                                className={`border ${errors[role.key] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} shadow rounded-lg p-0`}
                                key={role.key}
                            >
                                <div className={`${errors[role.key] ? 'bg-red-100' : 'bg-gray-200'} px-3 py-2 font-semibold text-gray-800 border-b text-sm rounded-t-lg flex items-center justify-between`}>
                                    <span>
                                        {role.label}
                                        {role.required && <span className="text-red-500 ml-1">*</span>}
                                    </span>
                                    {errors[role.key] && (
                                        <span className="text-red-600 text-xs font-normal">Required</span>
                                    )}
                                </div>
                                <div className="overflow-x-auto bg-white">
                                    <table className="w-full text-gray-800 border-collapse">
                                        <thead className="bg-gray-100">
                                            <tr className="text-xs">
                                                <th className="p-2 border border-gray-300">Profile ID</th>
                                                <th className="p-2 border border-gray-300">Name</th>
                                                <th className="p-2 border border-gray-300">Gender</th>
                                                <th className="p-2 border border-gray-300">Mobile No.</th>
                                                <th className="p-2 border border-gray-300">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records[role.key] && records[role.key].ProfileID
                                                ? getRowCells(records[role.key], 0)
                                                : (
                                                    <tr>
                                                        <td colSpan={5} className={`text-center py-4 ${errors[role.key] ? 'text-red-500' : 'text-gray-400'} border border-gray-300`}>
                                                            {errors[role.key] ? 'Please add this required role' : 'No record added yet.'}
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-center p-3">
                                    <button
                                        className={`${errors[role.key] ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} px-6 py-2 rounded text-white text-sm font-semibold`}
                                        onClick={() => {
                                            setPopupRole(role.key);
                                            setPopupKey(prev => prev + 1);
                                        }}
                                    >
                                        {records[role.key] && records[role.key].ProfileID
                                            ? role.updateButton
                                            : role.button}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* --- Admission Committee section --- */}
                        <div className="border border-gray-300 bg-white shadow rounded-lg p-0">
                            <div className="bg-gray-200 px-3 py-2 font-semibold text-gray-800 border-b text-sm rounded-t-lg flex items-center justify-between">
                                <span>Admission Committee</span>
                                <button
                                    className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-white text-xs font-semibold"
                                    onClick={() => {
                                        setEditingCommitteeMember(null);
                                        setAdmissionPopupOpen(true);
                                    }}
                                >
                                    + Add Member
                                </button>
                            </div>

                            <div className="overflow-x-auto bg-white">
                                <table className="w-full text-gray-800 border-collapse">
                                    <thead className="bg-gray-100">
                                        <tr className="text-xs">
                                            <th className="p-2 border border-gray-300">Profile ID</th>
                                            <th className="p-2 border border-gray-300">Name</th>
                                            <th className="p-2 border border-gray-300">Gender</th>
                                            <th className="p-2 border border-gray-300">Mobile No.</th>
                                            <th className="p-2 border border-gray-300">Admission Activities</th>
                                            <th className="p-2 border border-gray-300">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admissionCommittee.length > 0 ? (
                                            admissionCommittee.map((member, idx) => (
                                                <tr key={idx} className="text-sm">
                                                    <td className="p-2 border border-gray-300">
                                                        <a
                                                            href="#"
                                                            className="text-blue-700 hover:underline cursor-pointer"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                handlePrintProfile(member.ProfileID);
                                                            }}
                                                        >
                                                            {member.ProfileID}
                                                        </a>
                                                    </td>
                                                    <td className="p-2 border border-gray-300">
                                                        {[member.Title, member.FirstName, member.MiddleName, member.LastName].filter(Boolean).join(' ')}
                                                    </td>
                                                    <td className="p-2 border border-gray-300">{member.Gender}</td>
                                                    <td className="p-2 border border-gray-300">{member.MobileNo}</td>
                                                    <td className="p-2 border border-gray-300">
                                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                                            {member.Activities.map(activity => (
                                                                <label
                                                                    key={`${member.ProfileID}-${activity.key}`}
                                                                    className="flex items-center gap-1 cursor-pointer group"
                                                                    title="Uncheck to remove this activity"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={true}
                                                                        onChange={() => handleRemoveActivity(member, activity)}
                                                                        className="w-3.5 h-3.5 accent-blue-600 cursor-pointer flex-shrink-0"
                                                                    />
                                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap group-hover:bg-red-100 group-hover:text-red-700 group-hover:border-red-300 transition-colors">
                                                                        {activity.label}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-2 border border-gray-300 text-center">
                                                        <button
                                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                                                            onClick={() => {
                                                                setEditingCommitteeMember(member);
                                                                setAdmissionPopupOpen(true);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4 text-gray-400 border border-gray-300">
                                                    No admission committee members added yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* --- End Admission Committee section --- */}
                    </div>{/* end grid grid-cols-1 gap-6 */}

                    <div className="flex justify-center items-center gap-4 mt-6">
                        {/* <button
                            type="button"
                            className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
                            onClick={handleBack}
                        >
                            Back
                        </button> */}
                        <button
                            type="button"
                            className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
                            onClick={handleBack}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="bg-yellow-600 hover:bg-yellow-600 text-white px-6 py-2 rounded font-semibold text-sm"
                            onClick={handleSaveAndNext}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </fieldset>

            <StaffProfilePopup
                key={popupKey}
                open={!!popupRole}
                roleConfig={ROLE_CONFIG.find(r => r.key === popupRole)}
                onClose={handlePopupClose}
                onSaved={onPopupSaved}
            />

            {/* Admission Committee popup — separate from ROLE_CONFIG popups */}
            <AdmissionCommitteePopup
                open={admissionPopupOpen}
                onClose={handleAdmissionPopupClose}
                onSaved={onAdmissionSaved}
                existingMember={editingCommitteeMember}
            />

            {loading && (
                <div className="fixed inset-0 bg-white/60 flex justify-center items-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]"></div>
                </div>
            )}
        </div>
    );
};

export default Management;
