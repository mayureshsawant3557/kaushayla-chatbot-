import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";

import { ThemeContext } from "../../Context/ThemeContext";
import { useLoading } from "../../../Hooks/useLoading";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import {
    GetInstituteIDByInstituteCode,
    PromotingOrgGetProposedInstituteDetails,
} from "../../../Endpoints_All/Base/Institute";

import { useNavigate, useSearchParams } from "react-router-dom";
import agent from "../../../lib/api/agent";

import { usePayment } from "../../Context/PaymentContext";
import { useAuth } from "../../../Hooks/AuthContext";

import InstituteDetailsCard from "../../formcomponent/InstituteDetailsCard";

const PHASE_ID = 8;
const FEE_TYPE_ID = 8;

const SecurityDeposite = () => {
    const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading } = useLoading();

    const navigate = useNavigate();
    const { fetchAndCalculateSecurityDepositTotal } = usePayment();

    const [searchParams] = useSearchParams();

    const p1 = searchParams.get("P1");
    const p2 = searchParams.get("P2");

    const [userLoginID, setUserLoginID] = useState("");
    const [userTypeID, setUserTypeID] = useState("");
    const [instituteID, setInstituteID] = useState(null);
    const [ipAddress, setIpAddress] = useState("");

    // Institute information
    const [instituteProfile, setInstituteProfile] = useState(null);

    // Prevent popup from appearing repeatedly
    const [isCodePopupShown, setIsCodePopupShown] = useState(false);

    const { userInfo } = useAuth();

    /*
     * ---------------------------------------------------------
     * FETCH USER + INSTITUTE DETAILS
     * ---------------------------------------------------------
     */
    const fetchUserAndInstituteDetails = async () => {
        try {
            const loginID = userInfo?.UserLoginID;
            const typeID = userInfo?.UserTypeID;

            if (!loginID) {
                throw new Error("User login information not found");
            }

            if (!typeID) {
                throw new Error("User type id not found");
            }

            setUserLoginID(loginID);
            setUserTypeID(typeID);

            /*
             * UserType 14
             * OR
             * UserType 81 with P1
             *
             * P1 contains InstituteID
             */
            if (typeID === 14 || (typeID === 81 && p1)) {
                setInstituteID(p1);

                return {
                    loginID,
                    instituteID: p1,
                };
            }

            /*
             * Normal institute login.
             *
             * UserLoginID = InstituteCode
             */
            const resInstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`
            );

            const instID = resInstitute.data?.Data;

            if (!instID) {
                throw new Error("Institute not found");
            }

            setInstituteID(instID);

            return {
                loginID,
                instituteID: instID,
            };
        } catch (error) {
            console.error(
                "Error fetching user and institute details:",
                error
            );

            throw error;
        }
    };

    /*
     * ---------------------------------------------------------
     * FETCH IP
     * ---------------------------------------------------------
     */
    const fetchIP = async () => {
        try {
            const response = await agent.get(getIp, {
                headers: {
                    accept: "*",
                },
            });

            const ip = response.data?.ip || "0.0.0.0";

            setIpAddress(ip);

            return ip;
        } catch (error) {
            console.error("IP fetch error:", error);

            setIpAddress("0.0.0.0");

            return "0.0.0.0";
        }
    };

    /*
     * ---------------------------------------------------------
     * FETCH INSTITUTE PROFILE
     *
     * Same API which InstituteDetailsCard uses.
     *
     * Important:
     * We are intentionally fetching the data here because
     * popup logic belongs to SecurityDeposite.jsx.
     * ---------------------------------------------------------
     */
    const fetchInstituteProfile = async (instituteId, loginID) => {
        try {
            if (!instituteId || !loginID) {
                return null;
            }

            const response = await agent.get(
                `${PromotingOrgGetProposedInstituteDetails}/${instituteId}/${loginID}`
            );

            if (response.data?.Status === "Success") {
                const profile = response.data?.Data;

                setInstituteProfile(profile);

                return profile;
            }

            return null;
        } catch (error) {
            console.error(
                "Error fetching institute profile:",
                error
            );

            return null;
        }
    };

    /*
     * ---------------------------------------------------------
     * NEW INSTITUTE + GENERATED CODE POPUP
     * ---------------------------------------------------------
     *
     * Existing InstituteDetailsCard logic:
     *
     * IsNewInst === 0 -> New Institute
     *
     * CollegeRegistrationNo -> Generated Institute Code
     *
     * Therefore popup is shown only when:
     *
     * IsNewInst === 0
     * AND
     * CollegeRegistrationNo exists
     * ---------------------------------------------------------
     */
    const showNewInstituteCodePopup = async (profile) => {
        if (isCodePopupShown) {
            return;
        }

        if (!profile) {
            return;
        }

        const isNewInstitute = profile?.IsNewInst === 0;

        const generatedInstituteCode =
            profile?.CollegeRegistrationNo?.toString().trim();

        /*
         * DO NOT SHOW POPUP if:
         *
         * 1. Existing institute
         * 2. New institute but code not generated
         */
        if (!isNewInstitute || !generatedInstituteCode) {
            return;
        }

        setIsCodePopupShown(true);

        await Swal.fire({
            icon: "success",

            title: "Institute Code Generated Successfully",

            html: `
                <div style="text-align:left;">

                    <p style="
                        font-size:16px;
                        margin-bottom:18px;
                    ">
                        Your new institute has been successfully registered
                        and the <b>Institute Code</b> has been generated.
                    </p>

                    <div style="
                        background:#f0fdf4;
                        border:2px solid #16a34a;
                        border-radius:10px;
                        padding:18px;
                        text-align:center;
                        margin-bottom:20px;
                    ">

                        <div style="
                            font-size:14px;
                            color:#166534;
                            font-weight:600;
                            margin-bottom:8px;
                        ">
                            YOUR NEW INSTITUTE CODE
                        </div>

                        <div style="
                            font-size:28px;
                            font-weight:800;
                            color:#15803d;
                            letter-spacing:2px;
                            background:white;
                            border-radius:6px;
                            padding:10px;
                            border:1px dashed #16a34a;
                        ">
                            ${generatedInstituteCode}
                        </div>

                    </div>

                    <div style="
                        background:#fff7ed;
                        border-left:5px solid #f97316;
                        padding:14px;
                        margin-bottom:15px;
                        border-radius:5px;
                    ">

                        <strong>Important:</strong>

                        <ul style="
                            margin-top:10px;
                            padding-left:20px;
                            line-height:1.8;
                        ">

                            <li>
                                Please keep the above
                                <b>Institute Code</b> safely.
                            </li>

                            <li>
                                This Institute Code will be used for
                                <b>future institute-related processes</b>.
                            </li>

                            <li>
                                Please use this code as your
                                <b>login ID / Institute Code</b>
                                wherever required.
                            </li>

                        </ul>

                    </div>

                    <div style="
                        background:#eff6ff;
                        border-left:5px solid #2563eb;
                        padding:14px;
                        border-radius:5px;
                    ">

                        <strong>Security & Password Instructions</strong>

                        <ul style="
                            margin-top:10px;
                            padding-left:20px;
                            line-height:1.8;
                        ">

                            <li>
                                Please set your
                                <b>Security Question and Answer</b>
                                after login.
                            </li>

                            <li>
                                Change your password from
                                <b>Miscellaneous &gt; Change Password</b>.
                            </li>

                            <li>
                                Your default / old password is:
                                <span style="
                                    font-weight:800;
                                    color:#dc2626;
                                    background:#fee2e2;
                                    padding:3px 7px;
                                    border-radius:4px;
                                    margin-left:5px;
                                ">
                                   Institute Code Itself.
                                </span>
                            </li>

                            <li>
                                For security reasons, please change the
                                default password immediately after login.
                            </li>

                        </ul>

                    </div>

                </div>
            `,

            confirmButtonText: "I Understand",

            confirmButtonColor: "#16a34a",

            allowOutsideClick: false,

            allowEscapeKey: false,

            width: "900px",
        });
    };

    /*
     * ---------------------------------------------------------
     * LOAD PAGE DATA
     * ---------------------------------------------------------
     */
    const loadData = async () => {
        try {
            startLoading();

            const { loginID, instituteID } =
                await fetchUserAndInstituteDetails();

            /*
             * Fetch IP
             */
            //await fetchIP();

            /*
             * Fetch institute profile.
             *
             * This gives us:
             *
             * IsNewInst
             * CollegeRegistrationNo
             * InstituteCode
             * InstituteName
             * etc.
             */
            const profile = await fetchInstituteProfile(
                instituteID,
                loginID
            );

            /*
             * Show popup ONLY for:
             *
             * New Institute
             * +
             * Generated Institute Code
             */
            if (profile) {
               // await showNewInstituteCodePopup(profile);
            }
        } catch (error) {
            console.error("Error loading data:", error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.message ||
                    "Failed to fetch institute details",
            });
        } finally {
            stopLoading();
        }
    };

    /*
     * ---------------------------------------------------------
     * INITIAL LOAD
     * ---------------------------------------------------------
     */
    useEffect(() => {
        if (!userInfo) {
            return;
        }

        loadData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo]);

    /*
     * ---------------------------------------------------------
     * DISPLAY CODE
     * ---------------------------------------------------------
     */
    const isNewInstitute =
        instituteProfile?.IsNewInst === 0;

    const generatedInstituteCode =
        instituteProfile?.CollegeRegistrationNo?.toString().trim();

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */
    return (
        <div className="p-6">

            {/* ------------------------------------------------
                NEW INSTITUTE GENERATED CODE HIGHLIGHT
            ------------------------------------------------- */}
            {isNewInstitute && generatedInstituteCode && (
                <div
                    className="
                        mb-6
                        rounded-xl
                        border-2
                        border-green-500
                        bg-green-50
                        p-5
                        shadow-md
                    "
                >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                        <div>
                            <div className="text-sm font-semibold text-green-700">
                                New Institute Code Generated
                            </div>

                            <div className="mt-1 text-sm text-gray-700">
                                Please use this Institute Code for all
                                future institute-related processes.
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                        <div
                            className="
                                rounded-lg
                                border-2
                                border-green-600
                                bg-white
                                px-6
                                py-3
                                text-center
                                shadow-sm

                            "
                        >
                            <div className="text-xs font-semibold text-gray-500">
                                INSTITUTE CODE
                            </div>

                            <div className="mt-1 text-2xl font-extrabold tracking-wider text-green-700">
                                {generatedInstituteCode}
                            </div>
                        </div>
                        <div
                            className="
                                rounded-lg
                                border-2
                                border-green-600
                                bg-white
                                px-6
                                py-3
                                text-center
                                shadow-sm
                            "
                        >
                            <div className="text-xs font-semibold text-gray-500">
                                PASSWORD
                            </div>

                            <div className="mt-1 text-2xl font-extrabold tracking-wider text-green-700">
                                {generatedInstituteCode}
                            </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ------------------------------------------------
                INSTITUTE DETAILS
            ------------------------------------------------- */}
            <fieldset className="mb-6 rounded border border-gray-300 px-4 pb-1 pt-3">

                <legend
                    className={`
                        flex
                        items-center
                        gap-2
                        rounded-md
                        border
                        border-gray-300
                        ${color}
                        px-4
                        py-2
                        text-xl
                        font-bold
                        text-white
                        shadow-md
                    `}
                >
                    Institute Code Details
                </legend>

                <div className="p-4">

                    <InstituteDetailsCard
                        instituteCode={userLoginID}
                    />

                </div>

            </fieldset>

            {/* ------------------------------------------------
                SECURITY / PASSWORD NOTE
            ------------------------------------------------- */}
            {isNewInstitute && generatedInstituteCode && (
                <div
                    className="
                        mb-6
                        rounded-xl
                        border
                        border-blue-300
                        bg-blue-50
                        p-5
                        shadow-sm
                    "
                >

                    <div className="mb-3 text-lg font-bold text-blue-800">
                        Important Login & Security Instructions
                    </div>

                    <ul className="list-disc space-y-2 pl-6 text-sm text-gray-700">

                        <li>
                            Keep your generated
                            <strong className="mx-1">
                                Institute Code
                            </strong>
                            safely for all future processes.
                        </li>

                        <li>
                            After login, set your
                            <strong className="mx-1">
                                Security Question and Answer
                            </strong>.
                        </li>

                        <li>
                            Change your password from:
                            <strong className="mx-1">
                                Miscellaneous &gt; Change Password
                            </strong>
                        </li>

                        <li>
                            Your default / old password is:
                            <strong className="ml-2 rounded bg-red-100 px-2 py-1 text-red-700">
                                Institute Code Itself.
                            </strong>
                        </li>

                        <li className="font-semibold text-red-600">
                            For security purposes, please change the
                            default password immediately after login.
                        </li>

                    </ul>

                </div>
            )}

        </div>
    );
};

export default SecurityDeposite;