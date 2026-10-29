import React, { useEffect, useState, useContext } from "react";
import agent from "../../lib/api/agent";
import { ThemeContext } from "../../Component/Context/ThemeContext";

import {
    PromotingOrgGetProposedInstituteDetails,
    GetInstituteIDByInstituteCode,
    GetPromotingOrganisationIDByInstituteID,
    GetPromotingOrganisationDetails
} from "../../Endpoints_All/Base/Institute";
import { getDeviceIP } from "../../utils/CommonHelper";

const InstituteDetailsCard = ({ instituteCode }) => {

    const { color } = useContext(ThemeContext);

    const [instituteID, setInstituteID] = useState(null);
    const [userLoginID, setUserLoginID] = useState("");
    const [instituteProfile, setInstituteProfile] = useState(null);
    const [promotingOrg, setPromotingOrg] = useState(null);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");

    // ✅ INIT
    useEffect(() => {
        const init = async () => {
            if (!instituteCode) return;

            try {
                const loginID = instituteCode.slice(-6);
                setUserLoginID(loginID);

                const res = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`
                );

                const instID = res?.data?.Data;

                if (instID) {
                    setInstituteID(instID);
                }

            } catch (err) {
            }
        };

        init();
    }, [instituteCode]);

    // ✅ FETCH DATA
    useEffect(() => {
        if (!instituteID || !userLoginID) return;

        const fetchData = async () => {
            try {
                const res = await agent.get(
                    `${PromotingOrgGetProposedInstituteDetails}/${instituteID}/${userLoginID}`
                );

                if (res.data?.Status === "Success") {
                    setInstituteProfile(res.data.Data);
                }

                const orgRes = await agent.get(
                    `${GetPromotingOrganisationIDByInstituteID}/${instituteID}`
                );

                const orgId = orgRes?.data?.Data;

                if (orgId) {
                    const orgDetails = await agent.post(
                        GetPromotingOrganisationDetails,
                        {
                            instituteId: orgId,
                            userLoginID,
                            pageCode: "ExistingInstitute",
                            itemId: 0,
                            ipAddress: ipAddress
                        }
                    );

                    if (orgDetails.data?.Status === "Success") {
                        setPromotingOrg(orgDetails.data.Data);
                    }
                }

            } catch (err) {
            }
        };

        fetchData();
    }, [instituteID, userLoginID]);
    useEffect(() => {
        fetchIP();
    })

    const p = instituteProfile;
    

    // ✅ Authorized Person Parsing
    const rawValue = p?.AuthorizedPersonFirstName || "";
    const name = rawValue.match(/^[^<]+/)?.[0]?.trim() || "";
    const code = rawValue.match(/\(([^)]+)\)/)?.[1] || "";
    const staffid = code ? code.slice(-6) : "";
    const logoUrl = rawValue.match(/src="([^"]+)"/)?.[1];

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
    };

    // ✅ POPUPS
    const InstituteDetailsPopUp = () => {
        window.open(
            //`${window.location.origin}/React/InstituteDetailsPrint?instituteId=${instituteID}`,
            `${window.location.origin}/React/InspectionApplication?P1=${instituteID}&P2=${userLoginID}`,

            "_blank",
            "width=1000,height=750"
        );
    };

    const handleStaffClick = () => {
        if (!staffid) return;

        window.open(
            `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffid}&userLoginID=${code}`,
            "_blank",
            "width=1000,height=750"
        );
    };

    const handlePromotingOrgClick = () => {
        if (!promotingOrg) return;

        window.open(
            `${window.location.origin}/React/PromotingOrganizationPrint?instituteId=${instituteID}&promotingOrgId=${promotingOrg.ApplicationID}&userLoginID=${userLoginID}`,
            "_blank",
            "width=1000,height=750"
        );
    };

    return (
        <fieldset className="rounded-xl border border-gray-200 bg-white shadow-sm">

            <legend
                className={`flex ${color} items-center text-base font-semibold text-white 
        border-2 border-gray-300 px-4 py-1.5 rounded-md ml-4`}
            >
                Institute Details
            </legend>

            <div className="p-4">

                <table className="w-full text-sm border border-gray-200">

                    <tbody className="divide-y divide-gray-200">

                        <tr>
                            <td className="px-4 py-3 font-semibold border-r w-48">
                                Institute Type
                            </td>

                            <td className="px-4 py-3">
                                {p?.IsNewInst === 0 ? "New Institute" : "Existing Institute"}
                            </td>

                            {(p?.IsNewInst === 0 ||
                                (p?.IsNewInst === 1 && p?.CollegeRegistrationNo)) && (
                                    <>
                                        <td className="px-4 py-3 border-l font-semibold border-r w-48">
                                            Institute Code
                                        </td>

                                        <td className="px-4 py-3">
                                            {p?.CollegeRegistrationNo || ''}
                                        </td>
                                    </>
                                )}
                           
                        </tr>

                        <tr>
                            <td className="px-4 py-3 font-semibold border-r">
                                Institute Name
                            </td>

                            <td className="px-4 py-3 font-bold" colSpan={3}>
                                {p?.InstituteName} SKILL DEVELOPMENT INSTITUTE

                                <span
                                    onClick={InstituteDetailsPopUp}
                                    className="ml-2 text-blue-600 cursor-pointer underline"
                                >
                                    ({p?.InstituteCode})
                                </span>
                            </td>
                        </tr>

                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <td colSpan={4} className="px-4 py-2 font-semibold">
                                Authorized Representative
                            </td>
                        </tr>

                        <tr>
                            <td colSpan={4} className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span>{name}</span>

                                    <span
                                        onClick={handleStaffClick}
                                        className="text-blue-600 underline cursor-pointer"
                                    >
                                        ({code})
                                    </span>

                                    {logoUrl && (
                                        <img src={logoUrl} alt="status" className="w-5 h-5" />
                                    )}
                                </div>
                            </td>
                        </tr>

                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <td colSpan={4} className="px-4 py-2 font-semibold">
                                Promoting Organization
                            </td>
                        </tr>

                        <tr>
                            <td colSpan={4} className="px-4 py-3">
                                {promotingOrg ? (
                                    <div className="flex items-center gap-3">
                                        <span>{promotingOrg.NameOfPromotingOrganization}</span>

                                        <span
                                            onClick={handlePromotingOrgClick}
                                            className="text-blue-600 underline cursor-pointer"
                                        >
                                            ({promotingOrg.ApplicationID})
                                        </span>

                                        <img
                                            src={
                                                promotingOrg?.IsApprovedOrganizatioRegistrationNumber === "V"
                                                    ? logoUrl
                                                    : "/assets/NotVerifiedIcon.jpg"
                                            }
                                            alt="status"
                                            className="w-5 h-5"
                                        />
                                    </div>
                                ) : "—"}
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>
        </fieldset>
    );
};

export default InstituteDetailsCard;