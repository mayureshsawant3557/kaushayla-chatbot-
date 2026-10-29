import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../Component/Context/ThemeContext';
import { FaUserTie } from 'react-icons/fa';
import { useAuth } from '../../Hooks/AuthContext';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DVETOStaffProfilePopup from '../../Component/formcomponent/DVETOStaffProfilePopup';
import Staff_PrintApplicationForm from '../../Component/PrintApplicationForm/Staff_PrintApplicationForm';
import ReactDOM from "react-dom/client";
import { GetDVETOManagementDetails } from "../../Endpoints_All/Base/DVETO";
import { GetStaffID } from '../../Endpoints_All/Base/masterData';
import agent from '../../lib/api/agent';

const DVETO_ROLE_CONFIG = [
    {
        key: "authorizedRep",
        label: "Authorized Representative of DVETO",
        apiLabel: "DVETOOfficer",
        button: "Add Authorized Representative of DVETO",
        updateButton: "Update Authorized Representative of DVETO",
        ManagementTypeID: 5,
        required: true
    },
    {
        key: "dvetoOfficer",
        label: "District Vocational Education and Training Officer",
        apiLabel: "District Vocational Education and Training Officer",
        button: "Add District Vocational Education and Training Officer",
        updateButton: "Update District Vocational Education and Training Officer",
        ManagementTypeID: 6,
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
        key: "apprenticeship",
        label: "Apprenticeship Coordinator",
        apiLabel: "ApprenticeshipCoordinator",
        button: "Add Apprenticeship Coordinator",
        updateButton: "Update Apprenticeship Coordinator",
        ManagementTypeID: 4,
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

const DVETOOfficerManagement = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState({
        authorizedRep: { ...EMPTY_ROW },
        dvetoOfficer: { ...EMPTY_ROW },
        admission: { ...EMPTY_ROW },
        apprenticeship: { ...EMPTY_ROW },
    });
    const [popupRole, setPopupRole] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [popupKey, setPopupKey] = useState(0);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchDVETOOfficerData();
        
    }, [refresh]);

    const fetchDVETOOfficerData = async () => {
        setLoading(true);

        try {
            const dvetoID = userInfo?.UserID;

            const res = await agent.get(`${GetDVETOManagementDetails}?dvetoID=${dvetoID}`);
            

            if (res.data?.Status === "Success" && Array.isArray(res.data.Data)) {
                let dataMap = {};

                DVETO_ROLE_CONFIG.forEach(({ key, ManagementTypeID }) => {
                    const row = res.data.Data.find((itm) => itm.ManagementType === ManagementTypeID);
                    dataMap[key] = row ? row : { ...EMPTY_ROW };
                });

                setRecords(dataMap);
            }

        } catch (error) {
            Swal.fire("Error", "Unable to fetch DVETO officer data.", "error");
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
            const resstaff = await agent.get(`${GetStaffID}?ApplicationID=${profileID.trim()}`);
            const staffID = resstaff.data.Data;

            const printWindow = window.open('', '_blank', 'width=1200,height=800,left=100,top=100');

            if (!printWindow) {
                Swal.fire("Error", "Please allow pop-ups for this website", "error");
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>DVETO Officer Application Form - ${profileID}</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; }
                        #root { width: 100%; }
                        .staff-print-application-form {
                            font-family: 'Poppins', sans-serif;
                            padding: 20px;
                            background-color: #fff;
                        }
                        .application-form {
                            width: 100%;
                            font-size: 12px;
                            border: 1px solid #c5d3d3;
                            margin-bottom: 0px;
                        }
                        .application-form th {
                            background-color: #f0f1f4;
                            border: 1px solid #c5d3d3;
                            font-weight: 600;
                            color: #000;
                            padding: 0.25rem;
                        }
                        .application-form td {
                            border: 1px solid #c5d3d3;
                            vertical-align: middle;
                            color: #000;
                            padding: 0.25rem;
                        }
                        .table { margin: 0px; }
                        .table th, .table td { padding: 0.25rem; }
                        .GridView { margin: 0px; width: 100%; }
                        .GridView th {
                            border: 1px solid #eeeeee;
                            padding: 3px;
                            font-size: 12px;
                            font-weight: 500;
                            vertical-align: middle;
                            background-color: #f0f1f4;
                        }
                        .GridView td {
                            border: 1px solid #eeeeee;
                            padding: 3px;
                            font-size: 12px;
                        }
                        .sub-title { font-size: 12px; }
                        .main-title { font-size: 14px; }
                        .main-title1 { font-size: 18px; font-weight: 600; }
                        .labelFont { font-weight: 600 !important; }
                        .logo-image { width: 90px; }
                        .india-logo { width: 60px; }
                        @media print {
                            .no-print { display: none !important; }
                            .staff-print-application-form { padding: 0; }
                            body { margin: 0; padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div id="root">Loading...</div>
                </body>
                </html>
            `);

            printWindow.document.close();

            printWindow.onload = () => {
                const container = printWindow.document.getElementById('root');
                const root = ReactDOM.createRoot(container);
                const handleReadyToPrint = () => {
                    setTimeout(() => {
                        printWindow.focus();
                        printWindow.print();
                    }, 300);
                };
                root.render(
                    <Staff_PrintApplicationForm
                        staffID={staffID}
                        userLoginID={profileID}
                        pageCode="DVETO_STAFF_PRINT"
                        onReadyToPrint={handleReadyToPrint}
                    />
                );
            };
        } catch (error) {
            Swal.fire("Error", "Unable to print profile.", "error");
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

    const validateAllFields = () => {
        const newErrors = {};
        let missingRoles = [];

        DVETO_ROLE_CONFIG.forEach((role) => {
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
                        <p class="mb-3">Please add the following required DVETO roles:</p>
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
        if (validateAllFields()) {
            navigate("/dveto/PromotingOrganization");
        }
    };

    const handleBack = () => {
        window.history.back();
    };

    const handleClose = () => {
        window.close();
    };

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
            <td className="p-2 border border-gray-300">{data.Title}</td>
            <td className="p-2 border border-gray-300">{data.FirstName}</td>
            <td className="p-2 border border-gray-300">{data.MiddleName}</td>
            <td className="p-2 border border-gray-300">{data.LastName}</td>
            <td className="p-2 border border-gray-300">{data.Gender}</td>
            <td className="p-2 border border-gray-300">{data.DOB}</td>
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
                    <FaUserTie className="mr-2 text-white" />
                    Office Management
                </legend>

                <div className="px-4 pb-3 pt-3">
                    <div className="grid grid-cols-1 gap-6">
                        {DVETO_ROLE_CONFIG.map((role) => (
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
                                                <th className="p-2 border border-gray-300">Title</th>
                                                <th className="p-2 border border-gray-300">First Name</th>
                                                <th className="p-2 border border-gray-300">Middle/ Father / Husband Name</th>
                                                <th className="p-2 border border-gray-300">Last/ Surname</th>
                                                <th className="p-2 border border-gray-300">Gender</th>
                                                <th className="p-2 border border-gray-300">Date of Birth</th>
                                                <th className="p-2 border border-gray-300">Mobile No.</th>
                                                <th className="p-2 border border-gray-300">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records[role.key] && records[role.key].ProfileID
                                                ? getRowCells(records[role.key], 0)
                                                : (
                                                    <tr>
                                                        <td colSpan={9} className={`text-center py-4 ${errors[role.key] ? 'text-red-500' : 'text-gray-400'} border border-gray-300`}>
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
                    </div>

                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            type="button"
                            className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-semibold text-sm"
                            onClick={handleSaveAndNext}
                        >
                            Save and Next
                        </button>
                    </div>
                </div>
            </fieldset>

            <DVETOStaffProfilePopup
                key={popupKey}
                open={!!popupRole}
                roleConfig={DVETO_ROLE_CONFIG.find(r => r.key === popupRole)}
                onClose={handlePopupClose}
                onSaved={onPopupSaved}
            />

            {loading && (
                <div className="fixed inset-0 bg-white/60 flex justify-center items-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]"></div>
                </div>
            )}
        </div>
    );
};

export default DVETOOfficerManagement;