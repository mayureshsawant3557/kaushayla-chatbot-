import {  useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { useAuth } from "../../Hooks/AuthContext";
import { GetStaffID } from '../../Endpoints_All/Base/masterData';
import {GetStaffSummary} from "../../Endpoints_All/Staff/summary";
import { SaveInstituteManagementDetails, SaveInstitutePromoterStaffMappingDetails } from "../../Endpoints_All/Base/Institute";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import NotVerifiedIcon from '../../assets/NotVerifiedIcon.jpg';
import VerifiedIcon from '../../assets/VerifiedIcon.jpg';
import agent from "../../lib/api/agent";
import { useSearchParams } from "react-router-dom";
  
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

const AddAuthorizedRepPopup = ({
    
    open,
    onClose,
    roleConfig,
    onSaved,
    IsPromotorForm = false
}) => {
   // 
     
    const { user } = useAuth();
    const [searchID, setSearchID] = useState("");
    const [popupError, setPopupError] = useState("");
    const [data, setData] = useState(EMPTY_ROW);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const {userInfo} = useAuth();
    const [searchParams] = useSearchParams();



      const fetchIp = async () => {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return "0.0.0.0";
    }
};

    
    const handleSearchID = async () => {
        setPopupError("");
        if (!searchID?.trim()) {
            setPopupError("Staff/Management Profile ID required.");
            setData(EMPTY_ROW);
            setFetched(false);
            return;
        }
        setLoading(true);
        try {
             const ipAddress = await fetchIp();
            const resstaffid =  await agent.get(`${GetStaffID}?ApplicationID=${searchID.trim() }`);
            if (resstaffid.data.Status == "Success" && resstaffid.data.Data) {
                const requestBody = {
                    StaffID: resstaffid.data.Data,
                    UserLoginID: "",
                    PageCode: "1",
                    IPAddress: ipAddress
                };
                //const res = await agent.post(`${GetStaffSummary}`, { staffID: res.data.Data.trim() });
                const res = await agent.post(
                    GetStaffSummary,
                    requestBody
                );


                if (res.data.Status === 'Success' && res.data.Data) {
                    
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

    const handleSave = async () => {
        
        if (!data.ApplicationID || !data.FirstName) return;
        setLoading(true);
       const ipAddress = await fetchIp();
       const p1 = searchParams.get('P1');
       const userTypeId = userInfo?.UserTypeID;
       let resinstitute;
       if(p1 !== null && userTypeId == 81){
        resinstitute=p1;
       }else{
        const res = await agent.get(`${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo.UserLoginID}`);
        resinstitute=res.data.Data
        
       }
        // const resinstitute = await agent.get(`${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo.UserLoginID}`);
        
        let payload;
        if (IsPromotorForm) {
            payload = {
                ID: 0,
                InstituteID: resinstitute,
                StaffID: data.ApplicationID,
                ManagementType: roleConfig.ManagementTypeID,
                CreateBy: userInfo.UserLoginID || "system",
              IPAddress: ipAddress
            };
        } else {
            payload = {
                ID: 0,
                InstituteID: resinstitute,
                StaffID: data.StaffID,
                ManagementType: roleConfig.ManagementTypeID,
                CreateBy: userInfo.UserLoginID || "system",
             IPAddress: ipAddress
            };
        }

        try {
            if (IsPromotorForm) {
                await agent.post(`${SaveInstitutePromoterStaffMappingDetails}`, payload);
            }
            else {
                await agent.post(`${SaveInstituteManagementDetails}`, payload);
            }
            Swal.fire("Success", "Record saved.", "success");
            onClose();
            if (onSaved) onSaved();
        } catch (error){
            Swal.fire("Error", "Failed to save data.", error);
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
                {/* Note */}
                <div className="p-2 pb-1">
                    <div className="rounded bg-red-100 border border-red-300 text-red-900 px-3 py-2 mb-3 text-sm">
                        <span>Note:</span>
                        <ul className="list-disc pl-5">
                            <li>Skill Development Institute
                                <ul className="list-disc pl-7">
                                <li>All communication related to Skill Development Institute shall be sent to Authorized Representative of Institute</li>
                                <li>Authorized Representative of Institute can be either Head of Institute/ Principal/ Director, Admission Coordinator or Apprenticeship Coordinator</li>
                                </ul></li>

                            <li>
                                Enter Sevarth ID as Staff/ Management Profile ID for Government Employees registered on DVET HRMS Portal
                            </li>
                        </ul>
                    </div>

                </div>
                {/* Search row */}
                <div className="px-4 pb-2 flex flex-col items-center gap-3">

                    {/* LABEL + INPUT IN ONE LINE */}
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
                            onKeyUp={e => {
                                setSearchID(e.target.value.toUpperCase());  // convert to uppercase on keyup
                            }}
                            disabled={fetched || loading}
                            placeholder="Enter Profile ID"
                            onKeyDown={e => {
                                if (e.key === "Enter" && !fetched && !loading) handleSearchID();
                            }}
                        />
                    </div>

                    {/* BUTTON BELOW AND CENTER */}
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
                            {/* Left side - Details */}
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

                            {/* Right side - Photo with verification status */}
                             
                            <div className="relative">
                                {data.VerifyCnt == ""   && (
                                    <div className="absolute -top-2 -right-2 z-10">
                                        <img alt="not-verified" src={NotVerifiedIcon} className="w-12 h-12" />
                                    </div>
                                )}
                                {data.VerifyCnt > 0 && data.RejectCnt == 0 && (
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
                    //<div className="flex flex-wrap gap-3 px-4 pb-4 mt-3 transition-all duration-200">
                    //    <div className="flex-1 min-w-[250px]">
                    //        <div className="mb-1"><span className="font-semibold">First Name</span> : {data.FirstName}</div>
                    //        <div className="mb-1"><span className="font-semibold">Middle/ Father/ Husband Name</span> : {data.MiddleName}</div>
                    //        <div className="mb-1"><span className="font-semibold">Last/ Surname</span> : {data.LastName}</div>
                    //        <div className="mb-1"><span className="font-semibold">Date of Birth</span> : {data.DOB}</div>
                    //        <div className="mb-1"><span className="font-semibold">MobileNo</span> : {data.MobileNo}</div>
                    //        <div className="mb-1"><span className="font-semibold">E-mail ID</span> : {data.EMailID}</div>
                    //    </div>
                    //    <div className="flex items-end">
                    //        {data.Status !== "Verified" && (
                    //            <div>
                    //                <img alt="not-verified" src="/images/red-cross.png" className="w-10 h-10" />
                    //                <div className="text-red-700 uppercase text-center text-xs font-bold">NOT VERIFIED</div>
                    //            </div>
                    //        )}
                    //    </div>
                    //</div>
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

export default AddAuthorizedRepPopup;