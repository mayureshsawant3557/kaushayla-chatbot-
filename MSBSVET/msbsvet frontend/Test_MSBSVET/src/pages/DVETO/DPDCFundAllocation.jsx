import React, { useEffect, useState, useContext, useRef } from "react";
import agent from "../../lib/api/agent";
import Swal from "sweetalert2";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";

import {
    DVETOGetInstituteForDpdcFund,
    DVETOGetCompleteFundAllocationData,
    DVETOSaveCompleteFundAllocationData,

    DVETO_GetFundAllocationData_2203 ,
    DVETO_SaveFundAllocationData_2203 ,
    DVETO_GetFundAllocationMasters_2203,



} from "../../Endpoints_All/Base/DVETO";
import { GetCurrentFinancialYear } from "../../Endpoints_All/Base/Institute";
import { DVETOGetDvetoManagementTypeByDvetoID } from "../../Endpoints_All/Base/DVETO";
import OTPService from "../../Component/formcomponent/OTPService";
import { useAuth } from "../../Hooks/AuthContext";



const findCombination = (row, targetAmount) => {
    if (!targetAmount || targetAmount <= 0) return [];
    const heads = [
        { name: "head1", val: row.head1Amount },
        { name: "head2", val: row.head2Amount },
        { name: "head3", val: row.head3Amount },
        { name: "head4", val: row.head4Amount },
        { name: "head5", val: row.head5Amount },
        { name: "head6", val: row.head6Amount },
        { name: "head7", val: row.head7Amount },
        { name: "head8", val: row.head8Amount },
    ].filter(h => h.val > 0);

    const result = [];
    const search = (index, currentSum, currentSubset) => {
        if (currentSum === targetAmount) {
            result.push(...currentSubset);
            return true;
        }
        if (currentSum > targetAmount || index >= heads.length) {
            return false;
        }
        if (search(index + 1, currentSum + heads[index].val, [...currentSubset, heads[index].name])) {
            return true;
        }
        if (search(index + 1, currentSum, currentSubset)) {
            return true;
        }
        return false;
    };
    search(0, 0, []);
    return result;
};

const DropdownCheckboxSelect = ({ selectedHeads = [], row, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const buttonRef = React.useRef(null);
    const dropdownRef = React.useRef(null);


    

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleScrollOrResize = (event) => {
            if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
                         return;
                      }
            setIsOpen(false);
        };
        if (isOpen) {
            window.addEventListener("scroll", handleScrollOrResize, true);
            window.addEventListener("resize", handleScrollOrResize);
        }
        return () => {
            window.removeEventListener("scroll", handleScrollOrResize, true);
            window.removeEventListener("resize", handleScrollOrResize);
        };
    }, [isOpen]);

    //useEffect(() => {
    //    const handleScrollOrResize = () => {
    //        const handleScrollOrResize = (event) => {
    //            if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
    //                return;
    //            }
    //            setIsOpen(false);
    //        };
    //        if (isOpen) {
    //            window.addEventListener("scroll", handleScrollOrResize, true);
    //            window.addEventListener("resize", handleScrollOrResize);
    //        }
    //        return () => {
    //            window.removeEventListener("scroll", handleScrollOrResize, true);
    //            window.removeEventListener("resize", handleScrollOrResize);
    //        };
    //    }, [isOpen]);

    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom,
                left: rect.left,
            });
        }
        setIsOpen(!isOpen);
    };

    const headsList = [
        { key: "head1", label: "PPP Fund", amount: row.head1Amount },
        { key: "head2", label: "Head 2", amount: row.head2Amount },
        { key: "head3", label: "Head 3", amount: row.head3Amount },
        { key: "head4", label: "Head 4", amount: row.head4Amount },
        { key: "head5", label: "Head 5", amount: row.head5Amount },
        { key: "head6", label: "Head 6", amount: row.head6Amount },
        { key: "head7", label: "Head 7", amount: row.head7Amount },
        { key: "head8", label: "Head 8", amount: row.head8Amount },
    ];

    const currentSum = selectedHeads.reduce((sum, key) => {
        const head = headsList.find(h => h.key === key);
        return sum + (head ? head.amount : 0);
    }, 0);

    const handleCheckboxChange = (key, checked) => {
        let updated;
        if (checked) {
            updated = [...selectedHeads, key];
        } else {
            updated = selectedHeads.filter(k => k !== key);
        }
        onChange(updated);
    };

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleDropdown}
                    className="inline-flex justify-between items-center w-28 rounded border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                    <span>{currentSum}</span>
                    <svg className="-mr-1 ml-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: "fixed",
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        zIndex: 9999,
                    }}
                    className="mt-1 w-52 rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5 max-h-60 overflow-y-auto"
                >
                    <div className="py-1">
                        {headsList.map((head) => {
                            const isChecked = selectedHeads.includes(head.key);
                            return (
                                <label
                                    key={head.key}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => handleCheckboxChange(head.key, e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                                    />
                                    <span className="flex-1 truncate text-left">{head.label}</span>
                                    <span className="text-gray-500 text-xs font-semibold ml-2">Rs. {head.amount}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const DPDCFundAllocation = () => {

    const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading } = useLoading();

    const [userMobile, setUserMobile] = useState("");
    const {userInfo} = useAuth();
   

    const loginID = userInfo?.UserID;

    const [financialYearID, setFinancialYearID] =
        useState("");

    const BOOKS_HEADS = ["head1", "head2"];           // change as needed
    const MET_HEADS = ["head1", "head3", "head5"];  // change as needed

    const [financialYearOptions,
        setFinancialYearOptions] = useState([]);

    const [selectedFinancialYear,
        setSelectedFinancialYear] = useState("");

    const [districtName, setDistrictName] = useState("");
    const [districtID, setDistrictID] = useState("");


    const defaultAllocation = {
        head1TotalAllocation: 0,
        head2TotalAllocation: 0,
        head3TotalAllocation: 0,
        head4TotalAllocation: 0,
        head5TotalAllocation: 0,
        head6TotalAllocation: 0,
        head7TotalAllocation: 0,
        head8TotalAllocation: 0,
        districtFundForBooks: 0,
        districtFundForMET: 0,
        booksSelectedHeads: [],
        metSelectedHeads: [],
    };

    const [gthsData, setGthsData] = useState([]);
    const [gitiData, setGitiData] = useState([]);

    const [allocation2203, setAllocation2203] =
        useState(defaultAllocation);

    const [allocation2230, setAllocation2230] =
        useState(defaultAllocation);

    useEffect(() => {

        loadFinancialYears();
        fetchUserMobile();

    }, []);

    const loadFinancialYears = async () => {

        try {

            const res = await agent.get(
                GetCurrentFinancialYear
            );

            const data = res.data?.Data || [];

            const options = data.map((item) => ({
                value: item.YearId,
                label: item.YearDisplayName,
            }));

            setFinancialYearOptions(options);

            const currentYear =
                data.find((x) => x.isCurrent);   //isCurrent

            if (currentYear) {

                setFinancialYearID(
                    currentYear.YearId
                );

                setSelectedFinancialYear(
                    currentYear.YearDisplayName
                );
            }

        } catch (error) {

        }
    };

    const fetchUserMobile = async () => {
        if (!loginID) {
            return;
        }

        try {
            const url = `${DVETOGetDvetoManagementTypeByDvetoID}/${loginID}/6`;

            const response = await agent.get(url, {
                headers: {
                    accept: '*/*',
                    'Content-Type': 'application/json',
                }
            });

            const data = response?.data;

            if (data?.Status === "Success" && data?.Data?.length > 0) {
                const mobileNo = data.Data[0]?.MobileNo;
                const mobileString = mobileNo ? String(mobileNo) : "";

                setUserMobile(mobileString);
            } else {
                setUserMobile("");
            }

        } catch (error) {
            setUserMobile(""); // safe fallback
        }
    };
    const pendingSaveRef = useRef(null);

    const otpService = OTPService({
        mobileNo: userMobile,
        purpose: 'SubmitDPDCFundByDveto',
        isVerifyRequired: true,
        messege: 'OTP verification required by District Vocational Education and Training Officer',
        isDuplicateCheck: false,
        onSuccess: async () => {
            const pending = pendingSaveRef.current;
            if (pending) {
                pendingSaveRef.current = null; 
                await performSave(pending.majorHeadID, pending.allocation, pending.data);
            } else {
            }
        },
        onError: (error) => {
            pendingSaveRef.current = null; 
            Swal.fire({
                title: "Verification Failed",
                text: error.message || "OTP verification failed. Please try again.",
                icon: "error"
            });
        },
        onCancel: () => {
            pendingSaveRef.current = null; // ✅ Clear on cancel
        }
    });
    useEffect(() => {

        if (financialYearID) {

            loadData();
        }

    }, [financialYearID]);

    const loadData = async () => {

        try {

            startLoading();

            await Promise.all([
                loadInstituteData("GTHS", 2203),
                loadInstituteData("GITI", 2230),
            ]);

        } catch (error) {


            Swal.fire(
                "Error",
                "Failed to load data",
                "error"
            );

        } finally {
            stopLoading();
        }
    };

    const loadInstituteData = async (
        instType,
        majorHeadID
    ) => {

        try {

            const instituteRes = await agent.get(
                `${DVETOGetInstituteForDpdcFund}/${loginID}/${instType}`
            );
            setDistrictName(instituteRes?.data?.Data?.[0]?.District || "");
            //setDistrictID(instituteRes?.data?.Data?.[0]?.CollegeDistrictID || "");
            const districtId =
                instituteRes?.data?.Data?.[0]?.CollegeDistrictID || "";
            setDistrictID(districtId);

            const allocationRes = await agent.get(
                `${DVETOGetCompleteFundAllocationData}`,
                {
                    params: {
                        FinancialYearID: financialYearID,
                        DistrictID: districtID || districtId,
                        MajorHeadID: majorHeadID,
                    },
                }
            );

            const instituteList =
                instituteRes?.data?.Data || [];

            const districtAllocation =
                allocationRes?.data?.Data?.Table?.[0] || {};

            const instituteAllocation =
                allocationRes?.data?.Data?.Table1 || [];

            const mergedData = instituteList.map((inst) => {

                const saved = instituteAllocation.find(
                    (x) => x.InstituteID === inst.CollegeID
                );

                const row = {

                    instituteID: inst.CollegeID,
                    instituteCode: inst.CollegeRegistrationNo,
                    collegeName: inst.CollegeName,

                    head1Amount: saved?.Head1Amount || 0,
                    head2Amount: saved?.Head2Amount || 0,
                    head3Amount: saved?.Head3Amount || 0,
                    head4Amount: saved?.Head4Amount || 0,
                    head5Amount: saved?.Head5Amount || 0,
                    head6Amount: saved?.Head6Amount || 0,
                    head7Amount: saved?.Head7Amount || 0,
                    head8Amount: saved?.Head8Amount || 0,

                    fundForBooks: saved?.FundForBooks || 0,
                    fundForMET: saved?.FundForMET || 0,
                };

                row.booksSelectedHeads = findCombination(row, saved?.FundForBooks || 0);
                row.metSelectedHeads = findCombination(row, saved?.FundForMET || 0);

                return row;
            });

            const allocationObject = {

                head1TotalAllocation:
                    districtAllocation?.Head1TotalAllocation || 0,

                head2TotalAllocation:
                    districtAllocation?.Head2TotalAllocation || 0,

                head3TotalAllocation:
                    districtAllocation?.Head3TotalAllocation || 0,

                head4TotalAllocation:
                    districtAllocation?.Head4TotalAllocation || 0,

                head5TotalAllocation:
                    districtAllocation?.Head5TotalAllocation || 0,

                head6TotalAllocation:
                    districtAllocation?.Head6TotalAllocation || 0,

                head7TotalAllocation:
                    districtAllocation?.Head7TotalAllocation || 0,

                head8TotalAllocation:
                    districtAllocation?.Head8TotalAllocation || 0,

                districtFundForBooks:
                    districtAllocation?.FundForBooks || 0,

                districtFundForMET:
                    districtAllocation?.FundForMET || 0,
            };

            const districtRowForInit = {
                head1Amount: allocationObject.head1TotalAllocation,
                head2Amount: allocationObject.head2TotalAllocation,
                head3Amount: allocationObject.head3TotalAllocation,
                head4Amount: allocationObject.head4TotalAllocation,
                head5Amount: allocationObject.head5TotalAllocation,
                head6Amount: allocationObject.head6TotalAllocation,
                head7Amount: allocationObject.head7TotalAllocation,
                head8Amount: allocationObject.head8TotalAllocation,
            };

            allocationObject.booksSelectedHeads = findCombination(districtRowForInit, districtAllocation?.FundForBooks || 0);
            allocationObject.metSelectedHeads = findCombination(districtRowForInit, districtAllocation?.FundForMET || 0);

            if (majorHeadID === 2203) {

                setGthsData(mergedData);
                setAllocation2203(allocationObject);

            } else {

                setGitiData(mergedData);
                setAllocation2230(allocationObject);
            }

        } catch (error) {
        }
    };

    const handleInstituteInputChange = (
        type,
        rowIndex,
        field,
        value
    ) => {

        const updatedData =
            type === "GTHS"
                ? [...gthsData]
                : [...gitiData];

        const row = { ...updatedData[rowIndex] };
        row[field] = Number(value) || 0;

        // Recalculate fundForBooks based on booksSelectedHeads and new head values
        if (row.booksSelectedHeads) {
            row.fundForBooks = row.booksSelectedHeads.reduce((sum, key) => {
                const amountField = key + "Amount";
                return sum + (row[amountField] || 0);
            }, 0);
        }

        // Recalculate fundForMET based on metSelectedHeads and new head values
        if (row.metSelectedHeads) {
            row.fundForMET = row.metSelectedHeads.reduce((sum, key) => {
                const amountField = key + "Amount";
                return sum + (row[amountField] || 0);
            }, 0);
        }

        updatedData[rowIndex] = row;

        if (type === "GTHS") {
            setGthsData(updatedData);
        } else {
            setGitiData(updatedData);
        }
    };

    const handleDropdownSelectChange = (
        type,
        rowIndex,
        columnField,
        selectedHeads
    ) => {
        const updatedData =
            type === "GTHS"
                ? [...gthsData]
                : [...gitiData];

        const row = { ...updatedData[rowIndex] };

        if (columnField === "books") {
            row.booksSelectedHeads = selectedHeads;
            row.fundForBooks = selectedHeads.reduce((sum, key) => {
                const amountField = key + "Amount";
                return sum + (row[amountField] || 0);
            }, 0);
        } else if (columnField === "met") {
            row.metSelectedHeads = selectedHeads;
            row.fundForMET = selectedHeads.reduce((sum, key) => {
                const amountField = key + "Amount";
                return sum + (row[amountField] || 0);
            }, 0);
        }

        updatedData[rowIndex] = row;

        if (type === "GTHS") {
            setGthsData(updatedData);
        } else {
            setGitiData(updatedData);
        }
    };

    const handleAllocationChange = (
        type,
        field,
        value
    ) => {

        const amount = Number(value) || 0;

        if (type === "GTHS") {

            setAllocation2203((prev) => {
                const updated = {
                    ...prev,
                    [field]: amount,
                };
                if (updated.booksSelectedHeads) {
                    updated.districtFundForBooks = updated.booksSelectedHeads.reduce((sum, key) => {
                        const amountField = key + "TotalAllocation";
                        return sum + (updated[amountField] || 0);
                    }, 0);
                }
                if (updated.metSelectedHeads) {
                    updated.districtFundForMET = updated.metSelectedHeads.reduce((sum, key) => {
                        const amountField = key + "TotalAllocation";
                        return sum + (updated[amountField] || 0);
                    }, 0);
                }
                return updated;
            });

        } else {

            setAllocation2230((prev) => {
                const updated = {
                    ...prev,
                    [field]: amount,
                };
                if (updated.booksSelectedHeads) {
                    updated.districtFundForBooks = updated.booksSelectedHeads.reduce((sum, key) => {
                        const amountField = key + "TotalAllocation";
                        return sum + (updated[amountField] || 0);
                    }, 0);
                }
                if (updated.metSelectedHeads) {
                    updated.districtFundForMET = updated.metSelectedHeads.reduce((sum, key) => {
                        const amountField = key + "TotalAllocation";
                        return sum + (updated[amountField] || 0);
                    }, 0);
                }
                return updated;
            });
        }
    };

    const handleAllocationDropdownChange = (
        type,
        columnField,
        selectedHeads
    ) => {
        if (type === "GTHS") {
            setAllocation2203((prev) => {
                const updated = { ...prev };
                if (columnField === "books") {
                    updated.booksSelectedHeads = selectedHeads;
                    updated.districtFundForBooks = selectedHeads.reduce((sum, key) => {
                        const amountField = key + "TotalAllocation";
                        return sum + (updated[amountField] || 0);
                    }, 0);
                } else if (columnField === "met") {
                    updated.metSelectedHeads = selectedHeads;
                    updated.districtFundForMET = selectedHeads.reduce((sum, key) => {
                        const amountField = key + "TotalAllocation";
                        return sum + (updated[amountField] || 0);
                    }, 0);
                }
                return updated;
            });
        } else {
            setAllocation2230((prev) => {
                const updated = { ...prev };
                if (columnField === "books") {
                    updated.booksSelectedHeads = selectedHeads;
                    updated.districtFundForBooks = selectedHeads.reduce((sum, key) => {
                        const amountField = key + "TotalAllocation";
                        return sum + (updated[amountField] || 0);
                    }, 0);
                } else if (columnField === "met") {
                    updated.metSelectedHeads = selectedHeads;
                    updated.districtFundForMET = selectedHeads.reduce((sum, key) => {
                        const amountField = key + "TotalAllocation";
                        return sum + (updated[amountField] || 0);
                    }, 0);
                }
                return updated;
            });
        }
    };

    const calculateTotals = (data) => {

        return data.reduce(
            (acc, item) => {

                acc.head1 += item.head1Amount || 0;
                acc.head2 += item.head2Amount || 0;
                acc.head3 += item.head3Amount || 0;
                acc.head4 += item.head4Amount || 0;
                acc.head5 += item.head5Amount || 0;
                acc.head6 += item.head6Amount || 0;
                acc.head7 += item.head7Amount || 0;
                acc.head8 += item.head8Amount || 0;

                acc.books += item.fundForBooks || 0;
                acc.met += item.fundForMET || 0;

                acc.grandTotal +=
                    (item.head1Amount || 0) +
                    (item.head2Amount || 0) +
                    (item.head3Amount || 0) +
                    (item.head4Amount || 0) +
                    (item.head5Amount || 0) +
                    (item.head6Amount || 0) +
                    (item.head7Amount || 0) +
                    (item.head8Amount || 0);

                return acc;

            },
            {
                head1: 0,
                head2: 0,
                head3: 0,
                head4: 0,
                head5: 0,
                head6: 0,
                head7: 0,
                head8: 0,
                books: 0,
                met: 0,
                grandTotal: 0,
            }
        );
    };

    const validateTable = (
        allocation,
        totals
    ) => {

        const validations = [
            {
                total: totals.head1,
                allocation:
                    allocation.head1TotalAllocation,
                name: "Head1",
            },
            {
                total: totals.head2,
                allocation:
                    allocation.head2TotalAllocation,
                name: "Head2",
            },
            {
                total: totals.head3,
                allocation:
                    allocation.head3TotalAllocation,
                name: "Head3",
            },
            {
                total: totals.head4,
                allocation:
                    allocation.head4TotalAllocation,
                name: "Head4",
            },
            {
                total: totals.head5,
                allocation:
                    allocation.head5TotalAllocation,
                name: "Head5",
            },
            {
                total: totals.head6,
                allocation:
                    allocation.head6TotalAllocation,
                name: "Head6",
            },
            {
                total: totals.head7,
                allocation:
                    allocation.head7TotalAllocation,
                name: "Head7",
            },
            {
                total: totals.head8,
                allocation:
                    allocation.head8TotalAllocation,
                name: "Head8",
            },
            {
                total: totals.books,
                allocation:
                    allocation.districtFundForBooks,
                name: "Fund For Books",
            },
            {
                total: totals.met,
                allocation:
                    allocation.districtFundForMET,
                name: "Fund For MET",
            },
        ];

        for (const item of validations) {

            if (item.total > item.allocation) {

                Swal.fire({
                    icon: "warning",
                    title: "Validation",
                    html: `
        <div style="text-align:left; font-size:15px; line-height:1.8;">
            
            <div style="margin-bottom:10px; color:#d33; font-weight:bold;">
                ${item.name} Allocation Exceeded
            </div>

            <div>
                <b>Total Allocation :</b> Rs.${item.allocation}
            </div>

            <div>
                <b>Total Distribution :</b> Rs.${item.total}
            </div>

            <div>
                <b>Balance :</b> Rs.${item.allocation - item.total}
            </div>

            <div style="
                margin-top:12px;
                padding:10px;
                background:#fff3cd;
                border-left:4px solid #ffc107;
                color:#856404;
                border-radius:4px;
            ">
                Please adjust the distribution to be within the allocation.
            </div>

        </div>
    `,
                    confirmButtonText: "OK"
                });

                return false;
            }
        }

        

        return true;
    };
    

    const saveData = async (
        majorHeadID,
        allocation,
        data
    ) => {

        const totals = calculateTotals(data);

        const isValid =
            validateTable(allocation, totals);

        if (!isValid) {
            return;
        }
        pendingSaveRef.current = { majorHeadID, allocation, data };
        try {
            await otpService.startVerification(userMobile);
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Failed to start OTP verification. Please try again.",
                icon: "error"
            });
        }

        //try {

        //    startLoading();

        //    const payload = {

        //        financialYearID,
        //        districtID,
        //        majorHeadID,

        //        head1TotalAllocation:
        //            allocation.head1TotalAllocation,

        //        head2TotalAllocation:
        //            allocation.head2TotalAllocation,

        //        head3TotalAllocation:
        //            allocation.head3TotalAllocation,

        //        head4TotalAllocation:
        //            allocation.head4TotalAllocation,

        //        head5TotalAllocation:
        //            allocation.head5TotalAllocation,

        //        head6TotalAllocation:
        //            allocation.head6TotalAllocation,

        //        head7TotalAllocation:
        //            allocation.head7TotalAllocation,

        //        head8TotalAllocation:
        //            allocation.head8TotalAllocation,

        //        districtFundForBooks:
        //            allocation.districtFundForBooks,

        //        districtFundForMET:
        //            allocation.districtFundForMET,

        //        instituteData: JSON.stringify(
        //            data.map((x) => ({
        //                InstituteID: x.instituteID,
        //                InstituteCode: x.instituteCode,

        //                Head1Amount: x.head1Amount,
        //                Head2Amount: x.head2Amount,
        //                Head3Amount: x.head3Amount,
        //                Head4Amount: x.head4Amount,
        //                Head5Amount: x.head5Amount,
        //                Head6Amount: x.head6Amount,
        //                Head7Amount: x.head7Amount,
        //                Head8Amount: x.head8Amount,

        //                FundForBooks:
        //                    x.fundForBooks,

        //                FundForMET:
        //                    x.fundForMET,
        //            }))
        //        ),

        //        createdBy: loginID,
        //    };

           
        //    const response = await agent.post(
        //        `${DVETOSaveCompleteFundAllocationData}`,
        //        payload
        //    );
        //    console.log("Save Response:", response);
        //    if (
        //        response?.data?.Status !== "Success"
        //    ) {
        //        throw new Error(
        //            response?.data?.Message ||
        //            "Save Failed"
        //        );
        //    }

        //    Swal.fire(
        //        "Success",
        //        "Data Saved Successfully",
        //        "success"
        //    );

        //} catch (error) {

        //    console.error(error);

        //    Swal.fire(
        //        "Error",
        //        error.message || "Save Failed",
        //        "error"
        //    );

        //} finally {

        //    stopLoading();
        //}
    };

    const performSave = async (majorHeadID, allocation, data) => {
        try {
            startLoading();

            const payload = {
                financialYearID,
                districtID,
                majorHeadID,

                head1TotalAllocation: allocation.head1TotalAllocation,
                head2TotalAllocation: allocation.head2TotalAllocation,
                head3TotalAllocation: allocation.head3TotalAllocation,
                head4TotalAllocation: allocation.head4TotalAllocation,
                head5TotalAllocation: allocation.head5TotalAllocation,
                head6TotalAllocation: allocation.head6TotalAllocation,
                head7TotalAllocation: allocation.head7TotalAllocation,
                head8TotalAllocation: allocation.head8TotalAllocation,

                districtFundForBooks: BOOKS_HEADS.reduce((sum, h) => sum + (allocation[`${h}TotalAllocation`] || 0), 0),

            //allocation.districtFundForBooks,
                districtFundForMET: MET_HEADS.reduce((sum, h) => sum + (allocation[`${h}TotalAllocation`] || 0), 0),
// allocation.districtFundForMET,

                instituteData: JSON.stringify(
                    data.map((x) => ({
                        InstituteID: x.instituteID,
                        InstituteCode: x.instituteCode,
                        Head1Amount: x.head1Amount,
                        Head2Amount: x.head2Amount,
                        Head3Amount: x.head3Amount,
                        Head4Amount: x.head4Amount,
                        Head5Amount: x.head5Amount,
                        Head6Amount: x.head6Amount,
                        Head7Amount: x.head7Amount,
                        Head8Amount: x.head8Amount,
                        FundForBooks: BOOKS_HEADS.reduce((sum, h) => sum + (x[`${h}Amount`] || 0), 0), //x.fundForBooks,
                        FundForMET: MET_HEADS.reduce((sum, h) => sum + (x[`${h}Amount`] || 0), 0),//x.fundForMET,
                    }))
                ),

                createdBy: loginID,
            };

            const response = await agent.post(
                `${DVETOSaveCompleteFundAllocationData}`,
                payload
            );

            if (response?.data?.Status !== "Success") {
                throw new Error(response?.data?.Message || "Save Failed");
            }

            Swal.fire("Success", "Data Saved Successfully", "success");
            await Promise.all([
                loadInstituteData("GTHS", 2203),
                loadInstituteData("GITI", 2230),
            ]);

        } catch (error) {
            Swal.fire("Error", error.message || "Save Failed", "error");
        } finally {
            stopLoading();
        }
    };
    const renderTable = (
        title,
        type,
        majorHeadID,
        allocation,
        data
    ) => {

        const totals = calculateTotals(data);

        // All validations run in real time on user input
        const errors = [];
        if (totals.head1 > allocation.head1TotalAllocation) errors.push(`Head 1: Distribution (${totals.head1}) exceeds Allocation (${allocation.head1TotalAllocation})`);
        if (totals.head2 > allocation.head2TotalAllocation) errors.push(`Head 2: Distribution (${totals.head2}) exceeds Allocation (${allocation.head2TotalAllocation})`);
        if (totals.head3 > allocation.head3TotalAllocation) errors.push(`Head 3: Distribution (${totals.head3}) exceeds Allocation (${allocation.head3TotalAllocation})`);
        if (totals.head4 > allocation.head4TotalAllocation) errors.push(`Head 4: Distribution (${totals.head4}) exceeds Allocation (${allocation.head4TotalAllocation})`);
        if (totals.head5 > allocation.head5TotalAllocation) errors.push(`Head 5: Distribution (${totals.head5}) exceeds Allocation (${allocation.head5TotalAllocation})`);
        if (totals.head6 > allocation.head6TotalAllocation) errors.push(`Head 6: Distribution (${totals.head6}) exceeds Allocation (${allocation.head6TotalAllocation})`);
        if (totals.head7 > allocation.head7TotalAllocation) errors.push(`Head 7: Distribution (${totals.head7}) exceeds Allocation (${allocation.head7TotalAllocation})`);
        if (totals.head8 > allocation.head8TotalAllocation) errors.push(`Head 8: Distribution (${totals.head8}) exceeds Allocation (${allocation.head8TotalAllocation})`);
        if (totals.books > allocation.districtFundForBooks) errors.push(`Fund For Books: Distribution (${totals.books}) exceeds Allocation (${allocation.districtFundForBooks})`);
        if (totals.met > allocation.districtFundForMET) errors.push(`Fund For MET: Distribution (${totals.met}) exceeds Allocation (${allocation.districtFundForMET})`);

        const tableData = [];

        tableData.push({

            sn: "",
            institute: (
                <strong>Total Allocation</strong>
            ),

            head1: (
                <input
                    type="number"
                    value={
                        allocation.head1TotalAllocation
                    }
                    onChange={(e) =>
                        handleAllocationChange(
                            type,
                            "head1TotalAllocation",
                            e.target.value
                        )
                    }
                    min="0"
                    className="border p-1 w-20 text-center font-bold"
                />
            ),

            head2: (
                <input
                    type="number"
                    value={
                        allocation.head2TotalAllocation
                    }
                    onChange={(e) =>
                        handleAllocationChange(
                            type,
                            "head2TotalAllocation",
                            e.target.value
                        )
                    }
                    min="0"
                    className="border p-1 w-20 text-center font-bold"
                />
            ),

            head3: (
                <input
                    type="number"
                    value={
                        allocation.head3TotalAllocation
                    }
                    onChange={(e) =>
                        handleAllocationChange(
                            type,
                            "head3TotalAllocation",
                            e.target.value
                        )
                    }
                    min="0"
                    className="border p-1 w-20 text-center font-bold"
                />
            ),

            head4: (
                <input
                    type="number"
                    value={
                        allocation.head4TotalAllocation
                    }
                    onChange={(e) =>
                        handleAllocationChange(
                            type,
                            "head4TotalAllocation",
                            e.target.value
                        )
                    }
                    min="0"
                    className="border p-1 w-20 text-center font-bold"
                />
            ),

            head5: (
                <input
                    type="number"
                    value={
                        allocation.head5TotalAllocation
                    }
                    onChange={(e) =>
                        handleAllocationChange(
                            type,
                            "head5TotalAllocation",
                            e.target.value
                        )
                    }
                    min="0"
                    className="border p-1 w-20 text-center font-bold"
                />
            ),

            head6: (
                <input
                    type="number"
                    value={
                        allocation.head6TotalAllocation
                    }
                    onChange={(e) =>
                        handleAllocationChange(
                            type,
                            "head6TotalAllocation",
                            e.target.value
                        )
                    }
                    min="0"
                    className="border p-1 w-20 text-center font-bold"
                />
            ),

            head7: (
                <input
                    type="number"
                    value={
                        allocation.head7TotalAllocation
                    }
                    onChange={(e) =>
                        handleAllocationChange(
                            type,
                            "head7TotalAllocation",
                            e.target.value
                        )
                    }
                    min="0"
                    className="border p-1 w-20 text-center font-bold"
                />
            ),

            head8: (
                <input
                    type="number"
                    value={
                        allocation.head8TotalAllocation
                    }
                    onChange={(e) =>
                        handleAllocationChange(
                            type,
                            "head8TotalAllocation",
                            e.target.value
                        )
                    }
                    min="0"
                    className="border p-1 w-20 text-center font-bold"
                />
            ),

            total: (
                <div className="w-full flex justify-end">
                <strong>
                    {
                        (allocation.head1TotalAllocation || 0) +
                        (allocation.head2TotalAllocation || 0) +
                        (allocation.head3TotalAllocation || 0) +
                        (allocation.head4TotalAllocation || 0) +
                        (allocation.head5TotalAllocation || 0) +
                        (allocation.head6TotalAllocation || 0) +
                        (allocation.head7TotalAllocation || 0) +
                        (allocation.head8TotalAllocation || 0)
                    }
                    </strong>
                </div>
            ),

            books: (
                //<DropdownCheckboxSelect
                //    selectedHeads={allocation.booksSelectedHeads || []}
                //    row={{
                //        head1Amount: allocation.head1TotalAllocation,
                //        head2Amount: allocation.head2TotalAllocation,
                //        head3Amount: allocation.head3TotalAllocation,
                //        head4Amount: allocation.head4TotalAllocation,
                //        head5Amount: allocation.head5TotalAllocation,
                //        head6Amount: allocation.head6TotalAllocation,
                //        head7Amount: allocation.head7TotalAllocation,
                //        head8Amount: allocation.head8TotalAllocation,
                //    }}
                //    onChange={(selected) =>
                //        handleAllocationDropdownChange(
                //            type,
                //            "books",
                //            selected
                //        )
                //    }
                ///>
                //<strong>{allocation.districtFundForBooks}</strong>
                <div className="w-full flex justify-end">
                <strong>
                    {BOOKS_HEADS.reduce((sum, h) => sum + (allocation[`${h}TotalAllocation`] || 0), 0)}
                    </strong>
                </div>
            ),

            met: (
                //<DropdownCheckboxSelect
                //    selectedHeads={allocation.metSelectedHeads || []}
                //    row={{
                //        head1Amount: allocation.head1TotalAllocation,
                //        head2Amount: allocation.head2TotalAllocation,
                //        head3Amount: allocation.head3TotalAllocation,
                //        head4Amount: allocation.head4TotalAllocation,
                //        head5Amount: allocation.head5TotalAllocation,
                //        head6Amount: allocation.head6TotalAllocation,
                //        head7Amount: allocation.head7TotalAllocation,
                //        head8Amount: allocation.head8TotalAllocation,
                //    }}
                //    onChange={(selected) =>
                //        handleAllocationDropdownChange(
                //            type,
                //            "met",
                //            selected
                //        )
                //    }
                ///>
                //<strong>{allocation.districtFundForMET}</strong>
                <div className="w-full flex justify-end">
                <strong>
                    {MET_HEADS.reduce((sum, h) => sum + (allocation[`${h}TotalAllocation`] || 0), 0)}
                    </strong>
                </div>
            ),
        });

        data.forEach((x, index) => {

            const rowTotal =
                (x.head1Amount || 0) +
                (x.head2Amount || 0) +
                (x.head3Amount || 0) +
                (x.head4Amount || 0) +
                (x.head5Amount || 0) +
                (x.head6Amount || 0) +
                (x.head7Amount || 0) +
                (x.head8Amount || 0);

            tableData.push({

                sn: index + 1,

                institute: x.collegeName,

                head1: (
                    <input
                        type="number"
                        value={x.head1Amount}
                        onChange={(e) =>
                            handleInstituteInputChange(
                                type,
                                index,
                                "head1Amount",
                                e.target.value
                            )
                        }
                        min="0"
                        className="border p-1 w-20 text-center"
                    />
                ),

                head2: (
                    <input
                        type="number"
                        value={x.head2Amount}
                        onChange={(e) =>
                            handleInstituteInputChange(
                                type,
                                index,
                                "head2Amount",
                                e.target.value
                            )
                        }
                        min="0"
                        className="border p-1 w-20 text-center"
                    />
                ),

                head3: (
                    <input
                        type="number"
                        value={x.head3Amount}
                        onChange={(e) =>
                            handleInstituteInputChange(
                                type,
                                index,
                                "head3Amount",
                                e.target.value
                            )
                        }
                        min="0"
                        className="border p-1 w-20 text-center"
                    />
                ),

                head4: (
                    <input
                        type="number"
                        value={x.head4Amount}
                        onChange={(e) =>
                            handleInstituteInputChange(
                                type,
                                index,
                                "head4Amount",
                                e.target.value
                            )
                        }
                        min="0"
                        className="border p-1 w-20 text-center"
                    />
                ),

                head5: (
                    <input
                        type="number"
                        value={x.head5Amount}
                        onChange={(e) =>
                            handleInstituteInputChange(
                                type,
                                index,
                                "head5Amount",
                                e.target.value
                            )
                        }
                        min="0"
                        className="border p-1 w-20 text-center"
                    />
                ),

                head6: (
                    <input
                        type="number"
                        value={x.head6Amount}
                        onChange={(e) =>
                            handleInstituteInputChange(
                                type,
                                index,
                                "head6Amount",
                                e.target.value
                            )
                        }
                        min="0"
                        className="border p-1 w-20 text-center"
                    />
                ),

                head7: (
                    <input
                        type="number"
                        value={x.head7Amount}
                        onChange={(e) =>
                            handleInstituteInputChange(
                                type,
                                index,
                                "head7Amount",
                                e.target.value
                            )
                        }
                        min="0"
                        className="border p-1 w-20 text-center"
                    />
                ),

                head8: (
                    <input
                        type="number"
                        value={x.head8Amount}
                        onChange={(e) =>
                            handleInstituteInputChange(
                                type,
                                index,
                                "head8Amount",
                                e.target.value
                            )
                        }
                        min="0"
                        className="border p-1 w-20 text-center"
                    />
                ),

                total: <div className="w-full flex justify-end">
                    <strong>{rowTotal}</strong>
                      </div>,

                books: (
                    //<DropdownCheckboxSelect
                    //    selectedHeads={x.booksSelectedHeads || []}
                    //    row={x}
                    //    onChange={(selected) =>
                    //        handleDropdownSelectChange(
                    //            type,
                    //            index,
                    //            "books",
                    //            selected
                    //        )
                    //    }
                    ///>
                    //<strong>{x.fundForBooks}</strong>
                    <div className="w-full flex justify-end">
                    <strong>
                        {BOOKS_HEADS.reduce((sum, h) => sum + (x[`${h}Amount`] || 0), 0)}
                        </strong>
                    </div>
                ),

                met: (
                    //<DropdownCheckboxSelect
                    //    selectedHeads={x.metSelectedHeads || []}
                    //    row={x}
                    //    onChange={(selected) =>
                    //        handleDropdownSelectChange(
                    //            type,
                    //            index,
                    //            "met",
                    //            selected
                    //        )
                    //    }
                    ///>
                    //<strong>{x.fundForMET}</strong>
                    <div className="w-full flex justify-end">
                    <strong>
                        {MET_HEADS.reduce((sum, h) => sum + (x[`${h}Amount`] || 0), 0)}
                        </strong>
                    </div>
                ),
            });
        });

        tableData.push({

            sn: "",

            institute: (
                <strong>Total Distribution</strong>
            ),

            head1:<div className="w-full flex justify-end"><strong>{totals.head1}</strong> </div>,
            head2:<div className="w-full flex justify-end"><strong>{totals.head2}</strong> </div>,
            head3:<div className="w-full flex justify-end"><strong>{totals.head3}</strong> </div>,
            head4:<div className="w-full flex justify-end"><strong>{totals.head4}</strong> </div>,
            head5:<div className="w-full flex justify-end"><strong>{totals.head5}</strong> </div>,
            head6:<div className="w-full flex justify-end"><strong>{totals.head6}</strong> </div>,
            head7:<div className="w-full flex justify-end"><strong>{totals.head7}</strong> </div>,
            head8: <div className="w-full flex justify-end"><strong>{totals.head8}</strong> </div>,

            total: (
                <div className="w-full flex justify-end">
                <strong>
                    {totals.grandTotal}
                    </strong>
                </div>
            ),

            books: <div className="w-full flex justify-end"> <strong>{totals.books}</strong> </div>,
            met: <div className="w-full flex justify-end"> <strong>{totals.met}</strong></div>,
        });

        tableData.push({

            sn: "",

            institute: <strong>Balance</strong>,

            head1: (
                <div className="w-full flex justify-end">
                <strong className={allocation.head1TotalAllocation - totals.head1 < 0 ? "text-red-600" : "text-green-700"}>
                    {allocation.head1TotalAllocation -
                        totals.head1}
                    </strong>
                </div>
            ),

            head2: (
                <div className="w-full flex justify-end">
                <strong className={allocation.head2TotalAllocation - totals.head2 < 0 ? "text-red-600" : "text-green-700"}>
                    {allocation.head2TotalAllocation -
                        totals.head2}
                    </strong>
                </div>
            ),

            head3: (
                <div className="w-full flex justify-end">
                <strong className={allocation.head3TotalAllocation - totals.head3 < 0 ? "text-red-600" : "text-green-700"}>
                    {allocation.head3TotalAllocation -
                        totals.head3}
                    </strong>
                </div>
            ),

            head4: (
                <div className="w-full flex justify-end">
                <strong className={allocation.head4TotalAllocation - totals.head4 < 0 ? "text-red-600" : "text-green-700"}>
                    {allocation.head4TotalAllocation -
                        totals.head4}
                    </strong>
                </div>
            ),

            head5: (
                <div className="w-full flex justify-end">
                <strong className={allocation.head5TotalAllocation - totals.head5 < 0 ? "text-red-600" : "text-green-700"}>
                    {allocation.head5TotalAllocation -
                        totals.head5}
                    </strong>
                </div>
            ),

            head6: (
                <div className="w-full flex justify-end">
                <strong className={allocation.head6TotalAllocation - totals.head6 < 0 ? "text-red-600" : "text-green-700"}>
                    {allocation.head6TotalAllocation -
                        totals.head6}
                    </strong>
                </div>
            ),

            head7: (
                <div className="w-full flex justify-end">
                <strong className={allocation.head7TotalAllocation - totals.head7 < 0 ? "text-red-600" : "text-green-700"}>
                    {allocation.head7TotalAllocation -
                        totals.head7}
                    </strong>
                </div>
            ),

            head8: (
                <div className="w-full flex justify-end">
                <strong className={allocation.head8TotalAllocation - totals.head8 < 0 ? "text-red-600" : "text-green-700"}>
                    {allocation.head8TotalAllocation -
                        totals.head8}
                    </strong>
                </div>
            ),

            total: (
                <div className="w-full flex justify-end">
                <strong className={(allocation.head1TotalAllocation + allocation.head2TotalAllocation + allocation.head3TotalAllocation + allocation.head4TotalAllocation + allocation.head5TotalAllocation + allocation.head6TotalAllocation + allocation.head7TotalAllocation + allocation.head8TotalAllocation) - totals.grandTotal < 0 ? "text-red-600" : "text-green-700"}>
                    {
                        (
                            allocation.head1TotalAllocation +
                            allocation.head2TotalAllocation +
                            allocation.head3TotalAllocation +
                            allocation.head4TotalAllocation +
                            allocation.head5TotalAllocation +
                            allocation.head6TotalAllocation +
                            allocation.head7TotalAllocation +
                            allocation.head8TotalAllocation
                        ) - totals.grandTotal
                    }
                    </strong>
                </div>
            ),

            books: (
                <div className="w-full flex justify-end">
                <strong className={allocation.districtFundForBooks - totals.books < 0 ? "text-red-600" : "text-green-700"}>
                    {allocation.districtFundForBooks -
                        totals.books}
                    </strong>
                </div>
            ),

            met: (
                <div className="w-full flex justify-end">
                <strong className={allocation.districtFundForMET - totals.met < 0 ? "text-red-600" : "text-green-700"}>
                    {allocation.districtFundForMET -
                        totals.met}
                    </strong>
                </div>
            ),
        });

        const columns = [
            {
                key: "sn",
                header: "S.N.",
            },
            {
                key: "institute",
                header: "Institute Name",
            },
            {
                key: "head1",
                header: "ppp Fund",
            },
            {
                key: "head2",
                header: "Head2",
            },
            {
                key: "head3",
                header: "Head3",
            },
            {
                key: "head4",
                header: "Head4",
            },
            {
                key: "head5",
                header: "Head5",
            },
            {
                key: "head6",
                header: "Head6",
            },
            {
                key: "head7",
                header: "Head7",
            },
            {
                key: "head8",
                header: "Head8",
            },
            {
                key: "total",
                header: "Total",
            },
            {
                key: "books",
                header: "Fund For Books",
            },
            {
                key: "met",
                header: "Fund For MET",
            },
        ];

        return (

            <div className="mb-12">

                <div
                    className={`${color} text-white p-3 rounded font-bold text-lg mb-4`}
                >
                    {title}
                </div>

                <FilteredTableComponent
                    data={tableData}
                    columns={columns}
                    searchable={false}
                    sortable={false}
                    showSearch={false}
                    showExport={false}
                    exportable={false}
                    stickyHeader={true}
                    maxHeight="600px"
                />

                <div className="mt-3 text-red-600 text-sm">

                    <p>
                        Validation:
                        Total Distribution must be
                        less than or equal to Total
                        Allocation.
                    </p>

                </div>

                {errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm rounded shadow-sm">
                        <p className="font-bold mb-1">Validation Errors:</p>
                        <ul className="list-disc pl-5">
                            {errors.map((err, idx) => (
                                <li key={idx} className="font-semibold">{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex justify-center mt-5">

                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
                        onClick={() =>
                            saveData(
                                majorHeadID,
                                allocation,
                                data
                            )
                        }
                    >
                        Save
                    </button>

                </div>

            </div>
        );
    };

    return (

        <div className="p-5">

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-5 shadow-sm">

                <h3 className="text-lg font-semibold text-blue-700 mb-4">
                    District Fund Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                        <label className="block font-semibold mb-1">
                            District
                        </label>

                        <input
                            type="text"
                            value={districtName}
                            disabled
                            className="border rounded p-2 w-full bg-gray-100"
                        />

                    </div>

                    <div>

                        <label className="block font-semibold mb-1">
                            Financial Year
                        </label>

                        <select
                            value={financialYearID}
                            onChange={(e) => {

                                const selected =
                                    financialYearOptions.find(
                                        (x) =>
                                            String(x.value) ===
                                            e.target.value
                                    );

                                setFinancialYearID(
                                    e.target.value
                                );

                                setSelectedFinancialYear(
                                    selected?.label || ""
                                );
                            }}
                            className="border rounded p-2 w-full"
                        >

                            <option value="">
                                Select Financial Year
                            </option>

                            {financialYearOptions.map(
                                (item) => (
                                    <option
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                </div>

            </div>

            {renderTable(
                "Major Head 2203 - GTHS",
                "GTHS",
                2203,
                allocation2203,
                gthsData
            )}


            {renderTable(
                "Major Head 2230 - GITI",
                "GITI",
                2230,
                allocation2230,
                gitiData)}

           

        </div>
    );
};

export default DPDCFundAllocation;