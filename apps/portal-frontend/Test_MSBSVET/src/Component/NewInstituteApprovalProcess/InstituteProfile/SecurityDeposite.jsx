


import React, { useState, useEffect, useContext, useMemo } from "react";
import Swal from "sweetalert2";
import { SwalHelper } from "../../../utils/SwalHelper"; // TODO: confirm correct path to SwalHelper.js in this project
import { ThemeContext } from "../../Context/ThemeContext";
import { useLoading } from "../../../Hooks/useLoading";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { GetSecurityFeeDetails } from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess"; // TODO: confirm actual endpoint export name
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sha256 } from "js-sha256";
import agent from "../../../lib/api/agent";
import {
    CheckFeePaid,
    SaveFeeCartItemsForCourses,
} from "../../../Endpoints_All/Fee/feeManagement";
import DocumentLink from "../../formcomponent/OpenDocumentComponent";
import { usePayment } from "../../Context/PaymentContext";
import { useAuth } from "../../../Hooks/AuthContext";

const PHASE_ID = 8; // TODO: confirm actual PhaseId for Security Deposit (Inspection used 7)
const FEE_TYPE_ID = 8; // TODO: confirm actual fee-type id used by CheckFeePaid

const SecurityDeposite = () => {
    const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading, isLoading } = useLoading();
    const navigate = useNavigate();
    const { fetchAndCalculateSecurityDepositTotal } = usePayment();
    const [searchParams] = useSearchParams();
    const p1 = searchParams.get("P1");
    const p2 = searchParams.get("P2");
    const [securityDepositData, setSecurityDepositData] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [userLoginID, setUserLoginID] = useState("");
    const [userTypeID, setUserTypeID] = useState("");
    const [instituteID, setInstituteID] = useState(null);
    const [ipAddress, setIpAddress] = useState("");
    const [feeStaus, setFeeStatus] = useState();
    const { userInfo } = useAuth();

    const candidates = securityDepositData;

    // Fetch User and Institute Details
    const fetchUserAndInstituteDetails = async () => {
        try {
            const loginID = userInfo?.UserLoginID;
            const typeID = userInfo?.UserTypeID;

            if (!loginID) throw new Error("User login information not found");
            if (!typeID) throw new Error("User type id not found");

            setUserLoginID(loginID);
            setUserTypeID(typeID);

            if (typeID === 14 || (typeID === 81 && p1)) {
                setInstituteID(p1);
                return { loginID, instituteID: p1 };
            }

            const resInstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
            );
            const instID = resInstitute.data?.Data;
            if (!instID) throw new Error("Institute not found");

            setInstituteID(instID);
            return { loginID, instituteID: instID };
        } catch (error) {
            console.error("Error fetching user details:", error);
            throw error;
        }
    };

    const fetchIsFeePaid = async (instituteID) => {
        try {
            const feeStatus = await agent.get(
                `${CheckFeePaid}/${instituteID}/${FEE_TYPE_ID}`,
            );
            setFeeStatus(feeStatus.data?.Data);
        } catch (error) {
            console.error("Error fetching fee details:", error);
            throw error;
        }
    };

    const fetchIP = async () => {
        try {
            const response = await agent.get(getIp, { headers: { accept: "*" } });
            const ip = response.data?.ip || "0.0.0.0";
            setIpAddress(ip);
            return ip;
        } catch (error) {
            console.error("IP fetch error:", error);
            setIpAddress("0.0.0.0");
            return "0.0.0.0";
        }
    };

    const fetchSecurityDepositDetails = async (instituteID) => {
        try {
            const response = await agent.get(GetSecurityFeeDetails, {
                params: {
                    InstituteID: instituteID
                   // CourseID: -1,
                    //ApprovalID: 1
                }
            });

            if (
                response.data?.Status === "Success" &&
                response.data?.Data?.length > 0
            ) {
                const data = response.data.Data;
                setSecurityDepositData(data);
                return data;
            }
            else if (response.data?.Status === "Error") {
                await SwalHelper.warning(
                    "Security Deposit Not Available",
                    "Security Deposit details will be available only after the Board approves the course(s)."
                );
            }
            //throw new Error("Security Deposit details will be available only after Board approval of the course(s).");
        } catch (error) {
            //console.error("Error fetching security deposit details:", error);
            SwalHelper.warning(
                "Security Deposit Not Available",
                "Security Deposit details will be available only after the Board approves the course(s)."
            );
        }
    };

    const loadData = async () => {
        try {
            startLoading();
            const { loginID, instituteID } = await fetchUserAndInstituteDetails();
            await fetchIP();
            await fetchIsFeePaid(instituteID);
            await fetchSecurityDepositDetails(instituteID);
        } catch (error) {
            console.error("Error loading data:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Failed to fetch data",
            });
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Totals computed ONLY from selected items
    const totals = useMemo(() => {
        if (!selectedCandidates || selectedCandidates.length === 0) {
            return {
                totalUnits: 0,
                totalPerUnitSecurityDeposit: 0,
                totalSecurityDeposit: 0,
            };
        }

        return selectedCandidates.reduce(
            (acc, item) => {
                const unit = Number(item.Unit ?? item.ApprovedUnits ?? 1);
                const perUnitDeposit = Number(item.PerUnitSecurityDeposit || 0);
                const securityDeposit = item.SecurityDeposit
                    ? Number(item.SecurityDeposit)
                    : unit * perUnitDeposit;

                return {
                    totalUnits: acc.totalUnits + unit,
                    totalPerUnitSecurityDeposit: acc.totalPerUnitSecurityDeposit + perUnitDeposit,
                    totalSecurityDeposit: acc.totalSecurityDeposit + securityDeposit,
                };
            },
            {
                totalUnits: 0,
                totalPerUnitSecurityDeposit: 0,
                totalSecurityDeposit: 0,
            }
        );
    }, [selectedCandidates]);

    const columns = useMemo(
        () => [
            // {
            //     key: "CourseID",
            //     header: "Course ID",
            //     className: "text-center",
            //     width: "90px",
            //     sortable: true,
            // },
            // {
            //     key: "CollegeID",
            //     header: "College ID",
            //     className: "text-center",
            //     width: "100px",
            //     sortable: true,
            // },
            {
                key: "Course",
                header: "Course",
                className: "text-left pl-4",
                width: "320px",
                sortable: true,
            },
            
            {
                key: "Shift",
                header: "Shift",
                className: "text-center",
                width: "80px",
                sortable: true,
            },
            {
                key: "Unit",
                header: "Unit",
                className: "text-center",
                width: "80px",
                sortable: true,
            },
            {
                key: "UnitID",
                header: "Unit ID",
                className: "text-center",
                width: "120px",
                sortable: true,
            },
            // {
            //     key: "ApprovedCategory",
            //     header: "Approved Category",
            //     className: "text-center",
            //     width: "150px",
            //     sortable: true,
            // },
            {
                key: "PerUnitSecurityDeposit",
                header: "Per Unit Security Deposit",
                className: "text-center",
                width: "180px",
                sortable: true,
            },
            // {
            //     key: "TotalSecurityDeposit",
            //     header: "Total Security Deposit",
            //     className: "text-center",
            //     width: "180px",
            //     sortable: true,
            // },
            {
                key: "PaymentStatus",
                header: "Payment Status",
                className: "text-center",
                width: "120px",
                sortable: true,
            },
            {
                key: "TransactionID",
                header: "Transaction ID",
                className: "text-center",
                width: "160px",
                sortable: true,
            },
            {
                key: "PaymentDateTime",
                header: "Payment Date",
                className: "text-center",
                width: "180px",
                sortable: true,
            },
        ],
        []
    );

    const column = columns;

    const renderCell = (item, column) => {
        if (column.key === "Course" || column.key === "CourseWithCourseCode") {
            const courseName =
                item.Course ??
                item.CourseWithCourseCode ??
                item.CourseName ??
                item.courseName ??
                "";

            return item.ApprovalOrder ? (
                <DocumentLink
                    documentUrl={item.ApprovalOrder}
                    itemName={courseName || "Course"}
                    label={courseName}
                />
            ) : (
                courseName
            );
        }
        if (column.key === "PerUnitSecurityDeposit") {
            const val = Number(item.PerUnitSecurityDeposit) || 0;
            return `₹ ${val.toLocaleString("en-IN")}`;
        }
        // if (column.key === "TotalSecurityDeposit" || column.key === "SecurityDeposit") {
        //     const perUnit = Number(item.PerUnitSecurityDeposit) || 0;
        //     const unit = Number(item.Unit ?? item.ApprovedUnits ?? 1);
        //     const total = item.SecurityDeposit ? Number(item.SecurityDeposit) : unit * perUnit;
        //     return `₹ ${total.toLocaleString("en-IN")}`;
        // }
        if (column.key === "PaymentStatus") {
            const isPaid =
                item.IsPaid === 1 ||
                item.IsPaid === true ||
                String(item.PaymentStatus || "").trim().toLowerCase() === "paid";
            const statusText = item.PaymentStatus || (isPaid ? "Paid" : "Pending");
            return isPaid ? (
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {statusText}
                </span>
            ) : (
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    {statusText}
                </span>
            );
        }
        if (column.key === "TransactionID") {
            return item.TransactionID ? (
                <span className="font-bold text-xs text-gray-700">{item.TransactionID}</span>
            ) : (
                "-"
            );
        }
        if (column.key === "PaymentDateTime") {
            if (!item.PaymentDateTime) return "-";

            const date = new Date(item.PaymentDateTime);

            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = String(date.getFullYear());

            return `${day}/${month}/${year}`;
        }
        return item[column.key] !== undefined && item[column.key] !== null ? item[column.key] : "-";
    };

    const renderCustomFooter = () => {
        return (
            <tr className="bg-gray-100 font-bold">
                <td
                    colSpan={4}
                    className="border border-gray-300 px-4 py-2 text-right font-bold"
                >
                    Total ({selectedCandidates.length} of {candidates.length} selected)
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center font-bold">
                    ₹{totals.totalPerUnitSecurityDeposit.toLocaleString("en-IN")}
                </td>
                
                <td colSpan={3} className="border border-gray-300 px-2 py-2"></td>
            </tr>
        );
    };

    const navigateToFeeInfo = async (alreadyPaid = 0, cartId = null) => {
        try {
            if (selectedCandidates.length === 0) {
                Swal.fire({
                    icon: "warning",
                    title: "No Selection",
                    text: "Please select at least one course to pay the security deposit.",
                });
                return;
            }

            if (!totals || (totals.totalSecurityDeposit || 0) === 0) {
                Swal.fire({
                    icon: "warning",
                    title: "No Fees",
                    text: "There is no security deposit to pay for the selected course(s).",
                });
                return;
            }

            let instId = instituteID;
            if (!instId) {
                if (!userLoginID) {
                    setUserLoginID(userInfo?.UserLoginID || "");
                }
                const login = userInfo?.UserLoginID;
                if (!login)
                    throw new Error("User login not available to fetch Institute ID");

                const res = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${encodeURIComponent(login)}`,
                );
                instId = res.data?.Data;
                if (!instId) throw new Error("Institute ID not found");
                setInstituteID(instId);
            }

            const A1 = cartId || 0;
            const A2 = sha256(String(A1));
            const PhaseId = PHASE_ID;


            Swal.fire({
                title: "Proceed to Payment",
                html: `
                    <div class="text-left">
                        <p class="mb-2"><strong>Institute ID:</strong> ${userLoginID}</p>
                        <p class="mb-2"><strong>Total Security Deposit to Pay:</strong> ₹${Number(totals?.totalSecurityDeposit || 0).toLocaleString("en-IN")}</p>
                        <p class="text-sm text-gray-600 mt-2">You will be redirected to the payment page to complete the transaction.</p>
                    </div>
                `,
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Continue to Pay",
                cancelButtonText: "Cancel",
                width: "520px",
            }).then((res) => {
                if (res.isConfirmed) {
                    const selectedCourses = selectedCandidates.map((item) => ({
                        Course: item.Course ?? item.CourseWithCourseCode ?? item.CourseName ?? "",
                        CourseID: item.CourseID,
                        Unit: item.Unit ?? item.ApprovedUnits ?? 1,
                        PerUnitSecurityDeposit: item.PerUnitSecurityDeposit || 0,
                        SecurityDeposit: item.SecurityDeposit || ((item.Unit || 1) * (item.PerUnitSecurityDeposit || 0)),
                    }));

                    navigate(`/Institute/FeeInfo?PhaseId=${PhaseId}&A1=${A1}&A2=${A2}`, {
                        state: {
                            instituteId: A1,
                            from: "security-deposit",
                            securityDepositAmount: totals.totalSecurityDeposit,
                            selectedCourses,
                        },
                    });
                }
            });
        } catch (error) {
            console.error("Error navigating to FeeInfo:", error);
            Swal.fire({
                icon: "error",
                title: "Navigation Error",
                text: error.message || "Failed to navigate to payment page",
            });
        }
    };

    const handlePayment = async () => {
        try {
            let alreadyPaid = 0;

            if (typeof fetchAndCalculateSecurityDepositTotal === "function") {
                alreadyPaid = await fetchAndCalculateSecurityDepositTotal(
                    instituteID,
                    userTypeID,
                );
            }

            if (selectedCandidates.length === 0) {
                Swal.fire({
                    icon: "warning",
                    title: "No Items Selected",
                    text: "Please select at least one course from the table to proceed with payment.",
                });
                return;
            }

            const ip = ipAddress || (await fetchIP());

            const payload = selectedCandidates.map((item) => ({
                courseID: item.CourseID || item.CourseID || 0,
                shiftID: item.Shift ?? item.Shift ?? 0,
                unitID: item.Unit ?? item.Unit ?? 0,
                unitCode: item.UnitID || 0,
            }));

            //const collegeID = selectedCandidates[0]?.CollegeID || instituteID;

            const response = await agent.post(SaveFeeCartItemsForCourses, payload, {
                params: {
                    CollegeID: instituteID,
                    UserLoginId: userLoginID,
                    IPAddress: ip,
                    phaseId: PHASE_ID,
                },
            });

            if (response.data?.Status !== "Success") {
                throw new Error(response.data?.Message || "Failed to save cart.");
            }

            const cartId = response.data?.Data?.[0]?.CartId;

            if (!cartId) {
                throw new Error("CartId not returned from API.");
            }

            navigateToFeeInfo(alreadyPaid, cartId);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message,
            });
        }
    };

    return (
        <div className="p-6">
            <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-1">
                <legend
                    className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
                >
                    Security Deposit Details
                </legend>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-lg text-gray-600">
                            Loading security deposit details...
                        </span>
                    </div>
                ) : !candidates.length ? (
                    <div className="flex flex-col justify-center items-center py-20">
                        <svg
                            className="w-16 h-16 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <div className="text-lg text-gray-500 font-medium">
                            No security deposit data available
                        </div>
                        <div className="text-sm text-gray-400 mt-2">
                            Security Deposit details will be available only after Board approval of the course(s).
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mt-2">
                            <FilteredTableComponent
                                data={candidates ?? []}
                                columns={column}
                                searchable={true}
                                showExport={true}
                                showExcelTemplate={false}
                                showPDF={true}
                                sortable={true}
                                showCheckbox={true}
                                isRowSelectable={(item) => {
                                    const isPaid =
                                        item.IsPaid === 1 ||
                                        item.IsPaid === true ||
                                        String(item.PaymentStatus || "").trim().toLowerCase() === "paid";
                                    if (isPaid) return false;

                                    return (
                                        (!item.TransactionDetail || item.TransactionDetail.trim() === "") &&
                                        (item.PendingAmount === undefined || item.PendingAmount > 0)
                                    );
                                }}
                                onSelectionChange={(selected) => setSelectedCandidates(selected)}
                                exportFileName="Security_Deposit_Details"
                                tableId="security-deposit-table"
                                maxHeight="500px"
                                stickyHeader={true}
                                renderCell={renderCell}
                                customFooter={renderCustomFooter()}
                                emptyMessage="No security deposit data available"
                            />
                        </div>

                        {/* Notes Section */}
                        <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Note:</span>
                            </p>
                            <ol className="list-decimal list-inside mt-2 space-y-1.5 text-sm text-blue-700">
                                <li>
                                    Security Deposit is calculated based on newly
                                    approved/recommended units during the affiliation process.
                                </li>
                                <li>
                                    Security Deposit cannot be refunded partially; it is held
                                    against the approved infrastructure.
                                </li>
                                <li>
                                    After payment of Security Deposit, the affiliation process
                                    shall proceed to the next stage.
                                </li>
                                <li>
                                    Users are advised to pay the Security Deposit after completing
                                    all information on previous pages.
                                </li>
                                <li>
                                    Only selected courses (checked above) will be included in the
                                    security deposit payment.
                                </li>
                            </ol>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-8 mt-8 pt-12 border-t-2 border-gray-300">
                            {/* BACK */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (userTypeID === 14 || userTypeID === 81) {
                                        let url = "/Institute/InspectionRequest";
                                        if (p1) {
                                            url += `?P1=${p1}`;
                                            if (p2) url += `&P2=${p2}`;
                                        }
                                        navigate(url);
                                    } else {
                                        navigate("/Institute/InspectionRequest");
                                    }
                                }}
                                className="px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg text-sm hover:bg-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Back
                            </button>

                            {/* MIDDLE BUTTON */}
                            {userTypeID === 14 || userTypeID === 81 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        let url = "/Institute/AffiliationRequest";
                                        if (p1) {
                                            url += `?P1=${p1}`;
                                            if (p2) url += `&P2=${p2}`;
                                        }
                                        navigate(url);
                                    }}
                                    className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                                >
                                    Next
                                </button>
                            ) : feeStaus === false ? (
                                <button
                                    type="button"
                                    onClick={handlePayment}
                                    disabled={
                                        selectedCandidates.length === 0 ||
                                        !totals ||
                                        totals.totalSecurityDeposit === 0
                                    }
                                    className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl ${selectedCandidates.length === 0 ||
                                        !totals ||
                                        totals.totalSecurityDeposit === 0
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                                        }`}
                                >
                                    Pay Security Deposit
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => navigate("/Institute/AffiliationRequest")}
                                    className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                                >
                                    Next
                                </button>
                            )}

                            {/* CLOSE */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (userTypeID === 14 || userTypeID === 81) {
                                        navigate("/Dashboard/DashboardDVET");
                                    } else {
                                        navigate("/tinstitute/dashboard");
                                    }
                                }}
                                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg text-sm hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </fieldset>
        </div>
    );
};

export default SecurityDeposite;
