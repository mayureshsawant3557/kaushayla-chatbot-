import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from "../../Context/ThemeContext";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { FaUserTie } from 'react-icons/fa';
import { useAuth } from "../../../Hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import agent from '../../../lib/api/agent';
import { useLoading } from "../../../Hooks/useLoading";
import Swal from 'sweetalert2';
import ReactDOM from 'react-dom/client'; // ADD THIS IMPORT
import Staff_PrintApplicationForm from '../../PrintApplicationForm/Staff_PrintApplicationForm'; // ADD THIS IMPORT
import {
    GetInstituteIDByInstituteCode,
    GetPromotingOrganisationIDByInstituteID,
    GetPromoterDetailsByInstituteID
} from "../../../Endpoints_All/Base/Institute";
import { GetStaffID } from '../../../Endpoints_All/Base/masterData';
import { getDeviceIP } from '../../../utils/CommonHelper';

const promoterTypeOptions = [
    { id: "Trustee", name: "Trustee" },
    { id: "Director", name: "Director" },
    { id: "Partner", name: "Partner" },
    { id: "Member", name: "Member" }
];

function formatOptions(options) {
    return options.map((opt) =>
        typeof opt === "object"
            ? { value: opt.id?.toString(), label: opt.name }
            : { value: opt, label: opt }
    );
}

const Promoters = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const { startLoading, stopLoading, isLoading } = useLoading();

    const [authorizedRepresentative, setAuthorizedRepresentative] = useState(null);
    const [principalPromoter, setPrincipalPromoter] = useState(null);
    const [members, setMembers] = useState([]);
    const [isSamePerson, setIsSamePerson] = useState(false);
    const [selectedPromoterType, setSelectedPromoterType] = useState('Trustee');
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [hasPromotingOrg, setHasPromotingOrg] = useState(false);
     const [ipAddress, setIpAddress] = useState("0.0.0.0");

    useEffect(() => {
        checkPromotingOrganisationAndFetchPromoters();
        fetchIP();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (selectedPromoterType) {
            const filtered = members.filter(m => m.PromoterType === selectedPromoterType);
            setFilteredMembers(filtered);
        } else {
            setFilteredMembers(members);
        }
    }, [selectedPromoterType, members]);


 const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
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

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to open profile."
        });
    }
};

    const checkPromotingOrganisationAndFetchPromoters = async () => {
        startLoading();
        try {
            const instituteCode = userInfo?.UserLoginID;

            const resInstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`
            );

            if (!resInstitute.data?.Data) {
                await showInstructionAlert();
                return;
            }

            const instituteId = resInstitute.data.Data;

            const resOrganisation = await agent.get(
                `${GetPromotingOrganisationIDByInstituteID}/${instituteId}`
            );

            if (resOrganisation.data?.Status === "Success" &&
                resOrganisation.data?.Data &&
                resOrganisation.data.Data !== 0) {

                setHasPromotingOrg(true);
                const promotingOrgId = resOrganisation.data.Data;
                await fetchPromotersData(promotingOrgId);
            } else {
                setHasPromotingOrg(false);
                await showInstructionAlert();
            }
        } catch (error) {
            await showInstructionAlert();
        } finally {
            stopLoading();
        }
    };

    const fetchPromotersData = async (promotingOrgId) => {
        try {
            const payload = {
                instituteId: promotingOrgId,
                userLoginID: userInfo?.UserLoginID || "",
                pageCode: "ExistingInstitute",
                itemId: "0",
                ipAddress: ipAddress
            };

            const response = await agent.post(
                GetPromoterDetailsByInstituteID,
                payload
            );

            if (response.data?.Status === "Success" &&
                response.data?.Data &&
                response.data.Data.length > 0) {

                const promotersData = response.data.Data;

                const authRep = promotersData.find(p =>
                    p.PromoterType === 'Authorized Representative' ||
                    p.PromoterTypeID === 5
                );

                const principal = promotersData.find(p =>
                    p.PromoterType === 'Principal Promoter' ||
                    p.PromoterTypeID === 8
                );

                const membersList = promotersData.filter(p =>
                    p.PromoterType === 'Trustee' ||
                    p.PromoterType === 'Member' ||
                    p.PromoterType === 'Director' ||
                    p.PromoterType === 'Partner' ||
                    [1, 2, 3, 4].includes(p.PromoterTypeID)
                );

                setAuthorizedRepresentative(authRep || null);
                setPrincipalPromoter(principal || null);
                setMembers(membersList);

                if (authRep && principal && authRep.StaffId === principal.StaffId) {
                    setIsSamePerson(true);
                } else {
                    setIsSamePerson(false);
                }
            } else {
                setAuthorizedRepresentative(null);
                setPrincipalPromoter(null);
                setMembers([]);
            }
        } catch (error) {
            setAuthorizedRepresentative(null);
            setPrincipalPromoter(null);
            setMembers([]);
        }
    };

    const showInstructionAlert = async () => {
        const result = await Swal.fire({
            title: 'Promoters Not Updated',
            width: '700px',
            html: `
            <div class="text-left w-full">
                <p class="mb-3">Promoters for this Skill Development Institute are not updated. To update Promoters details, follow below mentioned process:</p>
                <ol class="list-decimal ml-5 space-y-2">
                    <li>Register Promoting Organization. Refer User Manual for Promoting Organization for detailed process</li>
                    <li>Update "Promoters" page in Promoting Organization account.</li>
                    <li>The Promoters details shall be displayed on this page once Promoters are updated in Promoting Organization account.</li>
                </ol>
            </div>
        `,
            icon: 'info',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'bg-[#00c3f9] hover:bg-[#00a8d6] text-white rounded px-6 py-2'
            },
            buttonsStyling: false,
            allowOutsideClick: false,  // Prevent closing by clicking outside
            allowEscapeKey: false       // Prevent closing with Escape key
        });

        // Only navigate back if user clicked OK
        if (result.isConfirmed) {
            window.history.back();
        }
    };


    const extractProfileId = (htmlString) => {
        if (!htmlString) return '';
        const cleanText = htmlString.replace(/<[^>]*>/g, '');
        return cleanText;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStatusIcon = (status) => {
        const verifiedStatuses = ["A", "V", "Active", "Verified"];

        if (verifiedStatuses.includes(status)) {
            return (
                <div className="flex justify-center">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                    </div>
                </div>
            );
        }

        // Default icon
        return (
            <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">?</span>
                </div>
            </div>
        );
    };


    // UPDATED: Modified to include print functionality
    const renderPromoterRow = (promoter) => {
        if (!promoter) return null;

        const profileId = extractProfileId(promoter.StaffProfileId) || promoter.StaffId;

        return (
            <tr className="bg-white">
                <td className="border border-gray-300 px-2 py-1">
                    <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 underline text-xs cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            handlePrintProfile(profileId, promoter.StaffId);
                        }}
                    >
                        {profileId}
                    </a>
                </td>
                <td className="border border-gray-300 px-2 py-1 text-xs">{promoter.Title || '-'}</td>
                <td className="border border-gray-300 px-2 py-1 text-xs">{promoter.FirstName || '-'}</td>
                <td className="border border-gray-300 px-2 py-1 text-xs">{promoter.MiddleName || '-'}</td>
                <td className="border border-gray-300 px-2 py-1 text-xs">{promoter.LastName || '-'}</td>
                <td className="border border-gray-300 px-2 py-1 text-xs">{promoter.GenderCode || '-'}</td>
                <td className="border border-gray-300 px-2 py-1 text-xs">
                    {promoter.FormatDOB || formatDate(promoter.DOB) || '-'}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-xs">{promoter.MobileNo || '-'}</td>
                <td className="border border-gray-300 px-2 py-1">
                    {getStatusIcon(promoter.IsapprovedPromoter)}
                </td>
            </tr>
        );
    };

    // const handleBack = () => {
    //     window.history.back();
    // };
     const handleBack = () => {

        const userTypeId = userInfo?.UserTypeID;

        if (Number(userTypeId) === 61) {
            navigate("/institute/dashboard");
        } else {
            navigate(-1);
        }
    };

    const handleNext = () => {
        navigate('/institute/dashboard');
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }

    if (!hasPromotingOrg) {
        return null;
    }

    return (
        <div className="w-full p-4">
            <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
                <legend className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}>
                    <FaUserTie className="mr-2 text-white" />
                    Promoters
                </legend>

                <div className="px-4 pb-3 pt-3">
                    {/* Pink Note Box */}
                    <div className="bg-pink-100 border border-pink-300 text-pink-800 px-3 py-2 rounded text-sm mb-4">
                        <strong>Note:</strong>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>
                                To edit Authorized Representative/ Principal Promoter/ Promoter profile information, login to respective Staff/ Management account and edit profile.
                            </li>
                            <li>
                                To change assigned Authorized Representative/ Principal Promoter/ Promoter, login to respective Promoting Organization and edit Promoters.
                            </li>
                        </ol>
                    </div>

                    {/* Authorized Representative Section */}
                    <div className="mb-4">
                        <div className="bg-gray-200 px-3 py-2 mb-2 rounded">
                            <h3 className="text-sm font-semibold text-gray-800">Authorized Representative of Promoting Organization*</h3>
                        </div>
                        {authorizedRepresentative ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Profile ID</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Title</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">First Name</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Middle/ Father/ Husband Name</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Last/ Surname</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Gender</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Date of Birth</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Mobile No.</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderPromoterRow(authorizedRepresentative)}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
                                No Authorized Representative found.
                            </div>
                        )}
                    </div>

                    {/* Principal Promoter Section */}
                    <div className="mb-4">
                        <div className="bg-gray-200 px-3 py-2 mb-2 rounded">
                            <h3 className="text-sm font-semibold text-gray-800">Principal Promoter*</h3>
                        </div>

                        <div className="mb-3 flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">Is Authorized Representative and Principal Promoter same ?</span>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="isSame"
                                    value="Yes"
                                    checked={isSamePerson}
                                    disabled
                                    className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="isSame"
                                    value="No"
                                    checked={!isSamePerson}
                                    disabled
                                    className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm">No</span>
                            </label>
                        </div>

                        {principalPromoter ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Profile ID</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Title</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">First Name</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Middle/ Father/ Husband Name</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Last/ Surname</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Gender</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Date of Birth</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Mobile No.</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderPromoterRow(principalPromoter)}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
                                No Principal Promoter found.
                            </div>
                        )}
                    </div>

                    {/* Members Section */}
                    <div className="mb-4">
                        <div className="bg-gray-200 px-3 py-2 mb-2 rounded">
                            <h3 className="text-sm font-semibold text-gray-800">Member</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                            <div>
                                <DropdownComponent
                                    label="Promoter Type"
                                    name="PromoterType"
                                    options={formatOptions(promoterTypeOptions)}
                                    value={selectedPromoterType}
                                    onChange={(value) => setSelectedPromoterType(value)}
                                    required={false}
                                    loading={false}
                                    disabled={true}
                                />
                            </div>
                        </div>

                        {filteredMembers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Sr. No.</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Profile ID</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Promoter Type</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Title</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">First Name</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Middle/ Father/ Husband Name</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Last/ Surname</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Gender</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Date of Birth</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Mobile No.</th>
                                            <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMembers.map((member, index) => {
                                            const profileId = extractProfileId(member.StaffProfileId) || member.StaffId;
                                            return (
                                                <tr key={member.PromoterID || index} className="bg-white">
                                                    <td className="border border-gray-300 px-2 py-1 text-xs text-center">{index + 1}</td>
                                                    <td className="border border-gray-300 px-2 py-1">
                                                        <a
                                                            href="#"
                                                            className="text-blue-600 hover:text-blue-800 underline text-xs cursor-pointer"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePrintProfile(profileId, member.StaffId);
                                                            }}
                                                        >
                                                            {profileId}
                                                        </a>
                                                    </td>
                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{member.PromoterType || '-'}</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{member.Title || '-'}</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{member.FirstName || '-'}</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{member.MiddleName || '-'}</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{member.LastName || '-'}</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{member.GenderCode || '-'}</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-xs">
                                                        {member.FormatDOB || formatDate(member.DOB) || '-'}
                                                    </td>
                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{member.MobileNo || '-'}</td>
                                                    <td className="border border-gray-300 px-2 py-1">
                                                        {getStatusIcon(member.IsapprovedPromoter)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
                                {members.length > 0
                                    ? 'No members found for selected promoter type.'
                                    : 'No members found.'}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            type="button"
                            className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
                            onClick={handleBack}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-semibold text-sm"
                            onClick={handleNext}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default Promoters;
