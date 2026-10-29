import React, { useMemo, useState, useContext, useEffect } from "react";
import agent from '../../lib/api/agent';
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import OTPService from "../formcomponent/OTPService";
import Swal from "sweetalert2";
import { ThemeContext } from "../Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import { getIpAndLocation } from "../../pages/DeviceDetails";
import { DateInput } from "../../Component/formcomponent/DateInputComponent";


import {
    GetUserName,
    GetFinancialDataForPppFund,
    SaveFinancialDataForPppFund,
    GetInstituteAndManagementMobile,
} from "../../Endpoints_All/ITISpecification/itiSpecification";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import { GetMasterTableList } from "../../Endpoints_All/Base/masterData";
import { useAuth } from "../../Hooks/AuthContext";


const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};


const toDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
};

const toYYYYMMDD = (dateStr) => {
    if (!dateStr || !dateStr.includes("-")) return "";
    const [d, m, y] = dateStr.split("-");
    return `${y}-${m}-${d}`;
};

const PPPFunds = () => {
    const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { userInfo } = useAuth();
    const [isPPP, setIsPPP] = useState(false);
    const [instituteName, setInstituteName] = useState("");
    const [latestAllocationYear, setLatestAllocationYear] = useState("-");
    const [latestFinancialYear, setLatestFinancialYear] = useState("-");
    const [userMobile, setUserMobile] = useState("");
    const [instituteID, setInstituteID] = useState(null);
    const [userID, setUserID] = useState(null);
    const [ipAddress, setIpAddress] = useState("");
    const [financialYearsMap, setFinancialYearsMap] = useState({});

    const [error, setError] = useState("");

    const [pppData, setPPPData] = useState([]);
    const [originalPPPData, setOriginalPPPData] = useState([]);
    const [nonPPPData] = useState([
        {
            id: 1,
            SNo: 1,
            FinancialYear: "NA",
            AllocationYear: "NA",
            AsOnDate: "NA",
            FundsReceived: 0,
            InterestEarned: 0,
            RevenueGenerated: 0,
            TotalExpenditure: 0,
            Repayment: 0,
            BalanceAsOnDate: 0,
        },
    ]);

    const [hasValidChanges, setHasValidChanges] = useState(false);
    const maxDate = getTodayDate();

    // which row is in edit mode
    const [editingRowId, setEditingRowId] = useState(null);

    const recalcBalance = (row) => {
        const A = parseFloat(row.FundsReceived || 0);
        const B = parseFloat(row.InterestEarned || 0);
        const C = parseFloat(row.RevenueGenerated || 0);
        const D = parseFloat(row.TotalExpenditure || 0);
        const E = parseFloat(row.Repayment || 0);
        const balance = A + B + C - (D + E);
        return Number.isNaN(balance) ? 0 : balance;
    };

    const hasRowChanged = (currentRow, originalRow) => {
        if (!originalRow) return true;

        const fieldsToCheck = [
            "AsOnDate",
            "InterestEarned",
            "RevenueGenerated",
            "TotalExpenditure",
            "Repayment",
        ];

        return fieldsToCheck.some(
            (field) => String(currentRow[field]) !== String(originalRow[field])
        );
    };

    const validateRow = (row) => {
        const numericFields = [
            "InterestEarned",
            "RevenueGenerated",
            "TotalExpenditure",
            "Repayment",
        ];

        for (const field of numericFields) {
            const v = Number(row[field] ?? 0);
            if (Number.isNaN(v) || v < 0) return false;
        }

        const anyFilled =
            row.AsOnDate || numericFields.some((f) => Number(row[f] ?? 0) > 0);

        return anyFilled;
    };

    const updateHasValidChanges = (currentRows) => {
        const anyChanged = currentRows.some((row) => {
            const original = originalPPPData.find((orig) => orig.id === row.id);
            return hasRowChanged(row, original) && validateRow(row);
        });
        setHasValidChanges(anyChanged);
    };

    const handlePPPRowChange = (updatedRow) => {
        const numericFields = [
            "InterestEarned",
            "RevenueGenerated",
            "TotalExpenditure",
            "Repayment",
        ];
        const sanitized = { ...updatedRow };

        numericFields.forEach((field) => {
            let v = sanitized[field];
            if (v === "" || v === null || v === undefined) v = 0;
            v = Number(v);
            if (Number.isNaN(v) || v < 0) v = 0;
            sanitized[field] = v;
        });

        const withBalance = {
            ...sanitized,
            BalanceAsOnDate: recalcBalance(sanitized),
        };

        setPPPData((prev) => {
            const next = prev.map((row) =>
                row.id === withBalance.id ? withBalance : row
            );
            updateHasValidChanges(next);
            return next;
        });
    };

    // columns: Action instead of S.N.
    const baseColumns = useMemo(
        () => [
            { header: "Action", key: "Action" },
            { header: "Financial Year", key: "FinancialYear", width: "120px" },
            // { header: "Allocation Year", key: "AllocationYear" },
            { header: "As on Date", key: "AsOnDate", width: "120px" },
            { header: "Funds Received", key: "FundsReceived" },
            { header: "Interest Earned", key: "InterestEarned" },
            { header: "Revenue Generated", key: "RevenueGenerated" },
            { header: "Total Expenditure", key: "TotalExpenditure" },
            { header: "Repayment", key: "Repayment" },
            { header: "Balance as on Date", key: "BalanceAsOnDate" },
        ],
        []
    );

    const renderNonPPPCell = (row, column) => {
        const value = row[column.key];
        return value === null || value === undefined || value === "" ? " NA" : value;
    };

    //const toDDMMYYYY = (dateString) => {
    //    if (!dateString) return "";

    //    const d = new Date(dateString);

    //    const day = String(d.getDate()).padStart(2, "0");
    //    const month = String(d.getMonth() + 1).padStart(2, "0");
    //    const year = d.getFullYear();

    //    return `${day}/${month}/${year}`;
    //};

    // editable PPP cell renderer
    const renderPPPCell = (row, column, onRowChangeLocal) => {
        const key = column.key;
        const isEditing = editingRowId === row.id;

        // Action column: edit icon toggles edit mode
        if (key === "Action") {
            return (
                <button
                    type="button"
                    onClick={() => {
                        setEditingRowId(isEditing ? null : row.id);
                    }}
                    className="flex items-center justify-center px-2 py-1 rounded text-blue-600 hover:text-blue-800"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                </button>
            );
        }

        // read-only fields
        if (
            key === "FinancialYear" ||
            key === "AllocationYear" ||
            key === "FundsReceived"
        ) {
            const value = row[key] === null || row[key] === undefined ? 0 : row[key];
            return <span className="px-2 py-1 text-left block">{value}</span>;
        }

        // date field - display and edit in dd-mm-yyyy format
        // In the renderPPPCell function, update the date field section:

        // date field - display in dd-mm-yyyy, store in yyyy-mm-dd internally
        if (key === "AsOnDate") {
            if (!isEditing) {
                // Display in dd-mm-yyyy format
                return (
                    <span className="px-2 py-1 text-left block">
                        {row.AsOnDate ? toDDMMYYYY(row.AsOnDate) : ""}
                    </span>
                );
            }

            // For editing, input uses yyyy-mm-dd (already in correct format)
            return (
                //<input
                //    type="date"
                //    max={maxDate}
                //    className="border border-gray-300 rounded px-2 py-1 text-sm w-full text-left"
                //    value={row.AsOnDate || ""}
                //    onChange={(e) => {
                //        const selectedDate = e.target.value;
                //        if (selectedDate > maxDate) {
                //            Swal.fire({
                //                title: "Invalid Date",
                //                text: "Cannot select a future date.",
                //                icon: "warning",
                //            });
                //            return;
                //        }
                //        // Store in yyyy-mm-dd format directly
                //        onRowChangeLocal({
                //            ...row,
                //            AsOnDate: selectedDate,
                //        });
                //    }}
                ///>
                // REPLACE the DateInput block
                //<DateInput
                //    label=""
                //    value={row.AsOnDate ? toDDMMYYYY(row.AsOnDate) : ""}
                //    onChange={(date) => {
                //        if (!date) return;
                //        onRowChangeLocal({
                //            ...row,
                //            AsOnDate: date,
                //        });
                //    }}
                //    minDate={
                //        row.FinancialYearStartDate
                //            ? new Date(row.FinancialYearStartDate)
                //            : null
                //    }
                //    maxDate={
                //        row.FinancialYearEndDate
                //            ? new Date(row.FinancialYearEndDate)
                //            : null
                //    }
                //    position="top"
                ///>

                <input
                    type="date"
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full text-left"
                    value={row.AsOnDate || ""}
                    min={row.FinancialYearStartDate || ""}
                    max={row.FinancialYearEndDate || maxDate}
                    onChange={(e) => {
                        const selectedDate = e.target.value;

                        if (!selectedDate) return;

                        // Validate against FinancialYearStartDate
                        if (row.FinancialYearStartDate && selectedDate < row.FinancialYearStartDate) {
                            Swal.fire({
                                title: "Invalid Date",
                                text: `Date cannot be before the financial year start date (${toDDMMYYYY(row.FinancialYearStartDate)}).`,
                                icon: "warning",
                            });
                            return;
                        }

                        // Validate against FinancialYearEndDate
                        if (row.FinancialYearEndDate && selectedDate > row.FinancialYearEndDate) {
                            Swal.fire({
                                title: "Invalid Date",
                                text: `Date cannot be after the financial year end date (${toDDMMYYYY(row.FinancialYearEndDate)}).`,
                                icon: "warning",
                            });
                            return;
                        }

                        // Validate against today (no future date)
                        if (selectedDate > maxDate) {
                            Swal.fire({
                                title: "Invalid Date",
                                text: "Cannot select a future date.",
                                icon: "warning",
                            });
                            return;
                        }

                        onRowChangeLocal({
                            ...row,
                            AsOnDate: selectedDate, // stored as yyyy-mm-dd
                        });
                    }}
                />


            );
        }


        // numeric editable fields
        if (
            [
                "InterestEarned",
                "RevenueGenerated",
                "TotalExpenditure",
                "Repayment",
            ].includes(key)
        ) {
            let value = row[key];
            if (value === 0 || value === "0") value = row[key]; // keep 0 if user typed it
            if (value === null || value === undefined) value = "";
            if (value === "") value = ""; // allow empty display

            if (!isEditing) {
                return <span className="px-2 py-1 text-left block">{row[key] ?? 0}</span>;
            }

            const handleChange = (e) => {
                let val = e.target.value;

                // IF USER CLEARS INPUT → KEEP IT EMPTY
                if (val === "") {
                    onRowChangeLocal({
                        ...row,
                        [key]: "", // keep blank in UI
                    });
                    return;
                }

                // Otherwise convert to number
                let num = Number(val);
                if (Number.isNaN(num) || num < 0) num = 0;

                onRowChangeLocal({
                    ...row,
                    [key]: num,
                });
            };

            const preventMinus = (e) => {
                if (e.key === "-" || e.code === "Minus") e.preventDefault();
            };

            return (
                <input
                    type="number"
                    min={0}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full text-left"
                    value={value}
                    onChange={handleChange}
                    onKeyDown={preventMinus}
                />
            );
        }

        // balance
        if (key === "BalanceAsOnDate") {
            const value =
                row.BalanceAsOnDate === null || row.BalanceAsOnDate === undefined
                    ? 0
                    : row.BalanceAsOnDate;
            return (
                <span className="px-2 py-1 font-semibold text-left block">
                    {value}
                </span>
            );
        }

        return <span className="text-left block">{row[key]}</span>;
    };

    const renderPPPTableCell = (row, column) =>
        renderPPPCell(row, column, handlePPPRowChange);

    const fetchUserMobileNo = async (instId) => {
        try {
            if (!instId) {
                return "";
            }

            const url = `${GetInstituteAndManagementMobile}/${instId}/2`;
            const response = await agent.get(url, {
                headers: {
                    accept: "*/*",
                    "Content-Type": "application/json",
                },
            });

            if (
                response.data &&
                response.data.Status === "Success" &&
                response.data.Data?.length > 0
            ) {
                return response.data.Data[0].MobileNo || "";
            } else {
                return "";
            }
        } catch (err) {
            return "";
        }
    };

    useEffect(() => {
        const fetchIP = async () => {
            try {
                const data = await getIpAndLocation();
                setIpAddress(data.ip);
            } catch (error) {
                setIpAddress("127.0.0.1");
            }
        };

        fetchIP();
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchAllData = async () => {
            try {
                startLoading();
                setError("");

                // Fetch Financial Years from Master Table API
                const fyResponse = await agent.get(GetMasterTableList, {
                    params: {
                        TableName: "Master_FinancialYear",
                        DataValueField: "FinancialYear",
                        DataTextField: "FinancialYearID",
                        HasSelect: true
                    }
                });

                const fyMap = {};
                if (fyResponse.data && fyResponse.data.Status === "Success") {
                    fyResponse.data.Data.forEach(item => {
                        if (item.Text !== "Select") {
                            fyMap[item.Text] = item.Value;
                        }
                    });
                }

                if (isMounted) {
                    setFinancialYearsMap(fyMap);
                }

                if (!userInfo) {
                    if (isMounted) {
                        setError("User information not found.");
                        stopLoading();
                    }
                    return;
                }

                const code = userInfo?.UserLoginID || "";
                const userId = userInfo?.UserID || 0;

                if (isMounted) {
                    setUserID(userId);
                }

                const userNameRes = await agent.get(`${GetUserName}/${code}`);
                const nameData = userNameRes.data;
                const instName =
                    nameData?.UserName || nameData?.Data?.UserName || "—";

                if (isMounted) {
                    setInstituteName(instName);
                }

                const instRes = await agent.get(GetInstituteIDByInstituteCode, {
                    params: { InstituteCode: code },
                });
                const instId = instRes?.data?.Data ?? instRes?.data?.InstituteID ?? null;

                if (isMounted) {
                    setInstituteID(instId);
                }

                if (instId) {
                    const mob = await fetchUserMobileNo(instId);
                    if (isMounted) {
                        setUserMobile(mob);
                    }
                }

                if (!instId) {
                    if (isMounted) {
                        setIsPPP(false);
                        setLatestAllocationYear("-");
                        setLatestFinancialYear("-");
                        stopLoading();
                    }
                    return;
                }

                const pppRes = await agent.get(GetFinancialDataForPppFund, {
                    params: { InstituID: instId },
                });

                const apiData = pppRes?.data;

                if (
                    !apiData ||
                    apiData.Status !== "Success" ||
                    !Array.isArray(apiData.Data) ||
                    apiData.Data.length === 0
                ) {
                    if (isMounted) {
                        setIsPPP(false);
                        setLatestAllocationYear("-");
                        setLatestFinancialYear("-");
                        stopLoading();
                    }
                    return;
                }

                const isPPPFlag = apiData.Data[0].IsPPP === 1;

                if (!isPPPFlag) {
                    if (isMounted) {
                        setIsPPP(false);
                        setLatestAllocationYear("-");
                        setLatestFinancialYear("-");
                        stopLoading();
                    }
                    return;
                }

                if (isMounted) {
                    setIsPPP(true);

                    const mapped = apiData.Data.map((item, index) => {
                        const fy = fyMap[String(item.FinancialYearID)] || "N/A";
                        const ay = fyMap[String(item.AllocationYearID)] || "N/A";

                        // Store date in yyyy-mm-dd format internally
                        let asOn = "";
                        if (item.AsonDate && !item.AsonDate.startsWith("1900")) {
                            asOn = item.AsonDate.substring(0, 10) || item.FinancialYearStartDate; // Keep as yyyy-mm-dd
                        } else {
                            // asOn = getTodayDate(); // Already returns yyyy-mm-dd
                            asOn = item.FinancialYearStartDate?.substring(0, 10) ?? getTodayDate();
                        }

                        const row = {
                            id: item.ID || index + 1,
                            SNo: index + 1,
                            FinancialYear: fy,
                            AllocationYear: ay,
                            AsOnDate: asOn, // Store in yyyy-mm-dd
                            FundsReceived: item.FundsReceived ?? 0,
                            InterestEarned: item.InterestEarned ?? 0,
                            RevenueGenerated: item.RevenueGenerated ?? 0,
                            TotalExpenditure: item.TotalExpenditure ?? 0,
                            Repayment: item.Repayment ?? 0,
                            FinancialYearID: item.FinancialYearID ?? 0,
                            AllocationYearID: item.AllocationYearID ?? 0,
                            FinancialYearStartDate: item.FinancialYearStartDate?.substring(0, 10) ?? "",  // ADD
                            FinancialYearEndDate: item.FinancialYearEndDate?.substring(0, 10) ?? ""
                        };

                        return {
                            ...row,
                            BalanceAsOnDate:
                                item.BalanceasonDate ?? recalcBalance(row),
                        };
                    });


                    setPPPData(mapped);
                    setOriginalPPPData(JSON.parse(JSON.stringify(mapped)));
                    updateHasValidChanges(mapped);
                    setLatestFinancialYear(mapped[0]?.FinancialYear || "-");
                    setLatestAllocationYear(mapped[0]?.AllocationYear || "-");
                    stopLoading();
                }
            } catch (err) {
                if (isMounted) {
                    setError("ITI not under PPP Scheme.");
                    stopLoading();
                }
            }
        };

        fetchAllData();

        return () => {
            isMounted = false;
        };
    }, []);

    const buildSavePayload = () => {
        if (!instituteID || !userID) {
            return [];
        }

        const changedRows = pppData.filter((row) => {
            const original = originalPPPData.find((orig) => orig.id === row.id);
            return hasRowChanged(row, original) && validateRow(row);
        });


        return changedRows.map((row) => ({
            id: row.id ?? 0,
            financialYearID: row.FinancialYearID ?? 0,
            allocationYearID: row.AllocationYearID ?? 0,
            instituteID: instituteID,
            asonDate: row.AsOnDate ? `${row.AsOnDate}T00:00:00.000Z` : null,
            fundsReceived: Number(row.FundsReceived || 0),
            interestEarned: Number(row.InterestEarned || 0),
            revenueGenerated: Number(row.RevenueGenerated || 0),
            totalExpenditure: Number(row.TotalExpenditure || 0),
            repayment: Number(row.Repayment || 0),
            balanceasonDate: Number(recalcBalance(row)),
            userID: userID,
            userIpAddress: ipAddress,  // Changed from IPAddress to userIpAddress
        }));
    };


    const submitAllFunds = async () => {
        try {
            startLoading();

            const payload = buildSavePayload();

            if (!payload.length) {
                stopLoading();
                Swal.fire({
                    title: "No Changes",
                    text: "No changes detected to save.",
                    icon: "info",
                });
                return;
            }


            const res = await agent.post(SaveFinancialDataForPppFund, payload);

            const data = res.data;
            if (data?.Status === "Success") {
                Swal.fire({
                    title: "Success",
                    text: data.Message || "PPP fund details saved successfully.",
                    icon: "success",
                });

                setOriginalPPPData(JSON.parse(JSON.stringify(pppData)));
                setHasValidChanges(false);
            } else {
                Swal.fire({
                    title: "Error",
                    text: data?.Message || "Failed to save PPP fund details.",
                    icon: "error",
                });
            }

            stopLoading();
        } catch (err) {
            stopLoading();
            Swal.fire({
                title: "Error",
                text:
                    err?.response?.data?.Message ||
                    err?.response?.data?.message ||
                    "Error while saving PPP fund details.",
                icon: "error",
            });
        }
    };


    const otpService = OTPService({
        mobileNo: userMobile,
        purpose: "SubmitPPPFund",
        isVerifyRequired: true,
        messege: "OTP verification required by Head of Institute/ Principal/Director",
        isDuplicateCheck: false,
        onSuccess: async () => {
            await submitAllFunds();
        },
        onError: (error) => {
            Swal.fire({
                title: "Verification Failed",
                text: error?.message || "OTP verification failed. Please try again.",
                icon: "error",
            });
        },
        onCancel: () => { },
    });

    const handleSaveClick = async () => {
        if (!hasValidChanges) {
            Swal.fire({
                title: "No Changes",
                text: "Please make changes to PPP fund details before saving.",
                icon: "info",
            });
            return;
        }

        if (!userMobile) {
            Swal.fire({
                title: "Error",
                text: "Mobile number not found. Please contact administrator.",
                icon: "error",
            });
            return;
        }

        const confirmResult = await Swal.fire({
            title: "Confirm Submission",
            html: `
                <div class="text-left">
                    <p class="mb-3 font-semibold">
                        You are about to submit PPP Fund details.
                    </p>
                    <p class="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                         Once submitted, this information will be sent to the respective Regional Office and DVET.
                        Please verify all amounts carefully before proceeding.
                    </p>
                    
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Proceed to OTP Verification",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#059669",
            cancelButtonColor: "#dc2626",
            width: "600px",
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        if (otpService && typeof otpService.startVerification === "function") {
            try {
                await otpService.startVerification(userMobile);
            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text: "Failed to start OTP verification. Please try again.",
                    icon: "error",
                });
            }
        } else {
            Swal.fire({
                title: "Error",
                text: "OTP verification service is not available.",
                icon: "error",
            });
        }
    };

    const mainTableData = isPPP ? pppData : nonPPPData;
    const mainTableColumns = baseColumns;
    const renderMainTableCell = isPPP ? renderPPPTableCell : renderNonPPPCell;

    if (isLoading) {
        return (
            <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading PPP Fund Details...</span>
                </div>
            </div>
        );
    }

    const fund = {
        name: "PPP Fund",
        logo: "https://cdn-icons-png.flaticon.com/512/3135/3135673.png",
    };

    return (
        <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
            <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-1">
                <legend
                    className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
                >
                    <img
                        src={fund.logo}
                        alt="Fund Logo"
                        className="w-7 h-7 mr-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm"
                    />
                    {fund.name}
                </legend>

                <div className="flex flex-wrap items-center justify-between gap-6 bg-blue-50 border border-blue-200 rounded-md px-4 py-3 mt-4 shadow-sm">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-700 ">
                            PPP Fund Status
                        </h3>
                        <div className="flex items-center gap-2 text-gray-800 font-medium">
                            <span>Institute Name:</span>
                            <span className="px-3 py-1 rounded">
                                {instituteName || "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-800 font-medium">
                            <span>Allocation Year:</span>
                            <span className="px-3 py-1 rounded">
                                {latestAllocationYear || "NA"}
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-md px-6 py-4 text-center my-4">
                        <p className="text-yellow-700">{error}</p>
                    </div>
                )}

                {!error && mainTableData.length === 0 && (
                    <div className="bg-blue-50 border border-blue-300 rounded-md px-6 py-4 text-center my-4">
                        <p className="text-blue-700">
                            No data available for this institute.
                        </p>
                    </div>
                )}

                {mainTableData.length > 0 && (
                    <>
                        <div className="flex justify-end mb-2">
                            <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 mt-3 rounded border border-gray-300">
                                All amounts in Rs.
                            </span>
                        </div>

                        <FilteredTableComponent
                            data={mainTableData}
                            columns={mainTableColumns}
                            filterColumns={[]}  //"FinancialYear", "AllocationYear", "AsOnDate"
                            onRowChange={isPPP ? handlePPPRowChange : null}
                            customButtons={[]}
                            title=""
                            exportFileName="PPP_Fund_Status"
                            tableId="ppp-fund-status-table"
                            searchable={false}
                            sortable={false}
                            showExcelTemplate={false}
                            exportable={false}
                            showSearch={false}
                            showExport={false}
                            className="mt-4"
                            renderCell={renderMainTableCell}
                            maxHeight="500px"
                            stickyHeader={true}
                            readOnly={!isPPP}
                        />



                        <div className="flex justify-center gap-3 mt-4 mb-2">
                            {isPPP && hasValidChanges && editingRowId !== null && (
                                <button
                                    type="button"
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow transition-colors"
                                    onClick={handleSaveClick}
                                    disabled={otpService.otpLoading}
                                >
                                    {otpService.otpLoading ? "Processing..." : "Save"}
                                </button>
                            )}
                        </div>

                    </>
                )}
            </fieldset>
        </div>
    );
};

export default PPPFunds;
