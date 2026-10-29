import { useState, useEffect, useContext, useRef } from "react";
import { Button } from "@mui/material";
import agent from '../../lib/api/agent';
import { ThemeContext } from "../Context/ThemeContext";
import { Search } from "lucide-react";
import Swal from "sweetalert2";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import OTPService from "../formcomponent/OTPService";
import { ITISpecification } from "../../Endpoints_All/ITISpecification/itiSpecification";
import { GetIsGovCollege, GetIsActivityValid } from "../../Endpoints_All/Base/masterData";
import DropdownComponent from "../formcomponent/DropdownComponent";
import { TradeRequirementsExporter } from "../formcomponent/TradeRequirementsExporter";
import { GetDPDCDetailsByCollegeRegNo } from "../../Endpoints_All/Base/Institute";
import { GetInstituteIDByInstituteCode, GetCurrentFinancialYear } from "../../Endpoints_All/Base/Institute";
import {
    GetInstituteAndManagementMobile,
    GetFinancialDataForPppFund,
} from "../../Endpoints_All/ITISpecification/itiSpecification";
import { getIp } from "../../Endpoints_All/Utils/fileUpload";
import { useAuth } from "../../Hooks/AuthContext";

const TradeRequirements = ({ onBack }) => {
    const { color } = useContext(ThemeContext);
    const printRef = useRef();

    // ============ STATE MANAGEMENT ============
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingApi, setLoadingApi] = useState(false);
    const [existingRequirements, setExistingRequirements] = useState([]);
    const [userMobile, setUserMobile] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [availableFund, setAvailableFund] = useState(0);
    const [pppAvailableFund, setPppAvailableFund] = useState(0);
    const [instituteId, setInstituteId] = useState(null);
    const [isDeclared, setIsDeclared] = useState(false);

    // AUTOSAVE STATE
    const [autoSaveStatus, setAutoSaveStatus] = useState("");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const lastChangeTimeRef = useRef(null);
    const autoSaveTimerRef = useRef(null);
    const lastAutoSaveRef = useRef(null);

    const [isGovCollege, setIsGovCollege] = useState(null);
    const [isActivityValid, setIsActivityValid] = useState(null);
    const [checkingApis, setCheckingApis] = useState(false);
    const [ipAddress, setIpAddress] = useState("");
    const { userInfo } = useAuth();

    const [realTimeTotals, setRealTimeTotals] = useState({
        DistrictItemsCount: 0,
        DistrictFundAmount: 0,
        PPPItemsCount: 0,
        PPPFundAmount: 0,
        StateItemsCount: 0,
        StateFundAmount: 0,
    });

    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [FINANCIAL_YEAR, setFinancialYear] = useState("");
    const [selectedFinancialYear, setSelectedFinancialYear] = useState("");



    // ============ OPTIMIZED VALIDATION STATE ============
    const rowValidationTimersRef = useRef({});
    const [rowsWithValidationError, setRowsWithValidationError] = useState(new Set());
    const [rowsPendingValidation, setRowsPendingValidation] = useState(new Set());

    // Track which rows user has actually edited
    const userEditedRowsRef = useRef(new Set());

    const [proposedTotals, setProposedTotals] = useState({
        DistrictItemsCount: 0,
        DistrictFund: 0,
        PPPItemsCount: 0,
        PPPFund: 0,
        StateItemsCount: 0,
        StateFund: 0,
    });

    // ============ CONSTANTS ============
    const API_BASE_URL = ITISpecification;
    //const FINANCIAL_YEAR = "2025-2026";
    const VALIDATION_DELAY = 2000;
    const AUTOSAVE_DELAY = 5000;

    //const financialYearOptions = [{ value: "2025-2026", label: "2025-2026" }];

    const otpConfig = {
        MAX_ATTEMPTS: 3,
        RESEND_COOLDOWN: 30,
        OTP_LENGTH: 4,
        showDemo: true,
    };

    // ============ HELPER FUNCTIONS ============
    const getExporter = () => {
        return new TradeRequirementsExporter(
            userInfo,
            FINANCIAL_YEAR,
            userInfo?.UserName || userInfo?.Institute_Name || "Institute Name"
        );
    };
    // for yaer 
    
        const fetchAdmissionYear = async () => {
            try {
                //const res = await agent.get(GetCurrentAdmissionYear);
                const res = await agent.get(GetCurrentFinancialYear);

                const data = res.data?.Data || [];

                const options = data.map(item => ({
                    value: item.YearDisplayName,   
                    label: item.YearDisplayName
                }));

                setFinancialYearOptions(options);

                // Set current year automatically
                const currentYear = data.find(x => x.isCurrent);

                if (currentYear) {
                    const year = currentYear.YearDisplayName;
                    setFinancialYear(currentYear.YearDisplayName);
                    setSelectedFinancialYear(currentYear.YearDisplayName);
                    return year;


                   // await loadProposedTotals(userInfo.UserID, currentYear.YearDisplayName);
                }
                return null;

            } catch (error) {
            }
        };

       
    const isRowFullyFilled = (item) =>
        (item.districtFund || 0) > 0 ||
        (item.ppp || 0) > 0 ||
        (item.stateFund || 0) > 0;

    const checkSubmissionStatus = (requirementsData) => {
        const hasSubmitted = requirementsData.some((req) => req.Status === "Submitted");
        setIsSubmitted(hasSubmitted);
        return hasSubmitted;
    };

    const calculateRealTimeTotals = (currentItems) => {
        const totals = {
            DistrictItemsCount: 0,
            DistrictFundAmount: 0,
            PPPItemsCount: 0,
            PPPFundAmount: 0,
            StateItemsCount: 0,
            StateFundAmount: 0,
        };

        currentItems.forEach((item) => {
            const estimatedPrice = Number(item.estimatedPrice) || 0;
            totals.DistrictItemsCount += Number(item.districtFund) || 0;
            totals.DistrictFundAmount += estimatedPrice * (Number(item.districtFund) || 0);
            totals.PPPItemsCount += Number(item.ppp) || 0;
            totals.PPPFundAmount += estimatedPrice * (Number(item.ppp) || 0);
            totals.StateItemsCount += Number(item.stateFund) || 0;
            totals.StateFundAmount += estimatedPrice * (Number(item.stateFund) || 0);
        });

        return totals;
    };

    // ============ CORE VALIDATION LOGIC - ONLY FOR SINGLE ROW ============
    /**
     * FINAL CORRECTED VALIDATION LOGIC
     * Rule 1: If X <= Y, disable proposed fields
     * Rule 2: If X > Y AND D > (X - Y), NO popup (valid)
     * Rule 3: If X > Y AND D <= (X - Y), SHOW error popup
     * 
     * CRITICAL: This validates ONLY ONE ROW at a time
     */
    const validateRow = (item) => {
        const x = Number(item.requiredAsPerNorms) || 0;
        const y = Number(item.available) || 0;
        const a = Number(item.districtFund) || 0;
        const b = Number(item.ppp) || 0;
        const c = Number(item.stateFund) || 0;
        const d = a + b + c;


        // Rule 1: If X <= Y, disable fields
        if (x <= y) {
            return {
                isValid: true,
                shouldDisable: true,
                errorMessage: "",
            };
        }

        // Rule 2 & 3: If X > Y
        const maxAllowed = x - y;

        // SHOW POPUP when D <= maxAllowed
        if (d > maxAllowed) {
            return {
                isValid: false,
                shouldDisable: false,
                errorMessage: `Total Proposed items (${d} Qty) should not be more than 
                 actual Deficiency (Required as per norms - Available = ${maxAllowed} Qty).`,
            };
        }

        // Valid: D > maxAllowed (no popup)
        return {
            isValid: true,
            shouldDisable: false,
            errorMessage: "",
        };
    };

    /**
     * CRITICAL: Validate ONLY the specific row user edited, with updated data
     */
    const validateRowWithUpdatedData = (rowId, updatedItem) => {

        const validation = validateRow(updatedItem);

        // Remove from pending validation
        setRowsPendingValidation((prev) => {
            const newSet = new Set(prev);
            newSet.delete(rowId);
            return newSet;
        });

        if (!validation.isValid) {
            // Mark row as having error
            setRowsWithValidationError((prev) => {
                const newSet = new Set(prev);
                newSet.add(rowId);
                return newSet;
            });

            // Show popup when D <= (X - Y)
            Swal.fire({
                title: "Validation Error",
                text: validation.errorMessage,
                icon: "warning",
                confirmButtonText: "OK",
                confirmButtonColor: "#d33",
            });
        } else {
            // Clear error if exists
            setRowsWithValidationError((prev) => {
                const newSet = new Set(prev);
                newSet.delete(rowId);
                return newSet;
            });
        }
    };

    /**
     * CRITICAL: Only validate rows that user has ACTUALLY EDITED
     * NO LOOP - Only check if any edited row has errors
     */
    const isDataValidForAutosave = () => {

        // Don't save if any row has validation errors
        if (rowsWithValidationError.size > 0) {
            return false;
        }

        // Don't save if any row is pending validation
        if (rowsPendingValidation.size > 0) {
            return false;
        }

        return true;
    };

    // ============ INPUT CHANGE HANDLER - ONLY VALIDATES EDITED ROW ============
    /**
     * CRITICAL: Only validate the SPECIFIC ROW user is editing
     * NO LOOP through all rows
     */
    const handleInputChange = (rowId, field, value) => {

        const numericValue = value === "" ? 0 : parseFloat(value) || 0;

        // CRITICAL: Track that user has edited this specific row
        userEditedRowsRef.current.add(rowId);

        // Store the updated item to use for validation
        let updatedItemForValidation = null;

        setItems((prevItems) => {
            const updatedItems = prevItems.map((item) => {
                if (item.id !== rowId) return item;

                // Create updated item with new value
                //const updated = { ...item, [field]: numericValue };

                let updated = { ...item, [field]: numericValue };
                if (field === "requiredAsPerNorms") {
                    updated = {
                        ...updated,
                        districtFund: 0,
                        ppp: 0,
                        stateFund: 0,
                    };
                }

                // Store for validation outside setState
                updatedItemForValidation = updated;

                const x = Number(updated.requiredAsPerNorms) || 0;
                const y = Number(updated.available) || 0;

                // Reset proposed fields when X <= Y
                if (
                    (field === "requiredAsPerNorms" || field === "available") &&
                    x <= y
                ) {
                    // Clear timers for THIS ROW ONLY
                    if (rowValidationTimersRef.current[rowId]) {
                        clearTimeout(rowValidationTimersRef.current[rowId]);
                        delete rowValidationTimersRef.current[rowId];
                    }

                    // Clear validation states for THIS ROW ONLY
                    setRowsWithValidationError((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(rowId);
                        return newSet;
                    });
                    setRowsPendingValidation((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(rowId);
                        return newSet;
                    });

                    // Reset proposed fields if no saved data
                    if (!item.requirementId) {
                        updatedItemForValidation = {
                            ...updated,
                            districtFund: 0,
                            ppp: 0,
                            stateFund: 0,
                        };
                        return updatedItemForValidation;
                    }
                }

                return updated;
            });

            return updatedItems;
        });

        // CRITICAL: Use the updated item for validation, not old state
        if (!updatedItemForValidation) return;

        const x = Number(updatedItemForValidation.requiredAsPerNorms) || 0;
        const y = Number(updatedItemForValidation.available) || 0;

        // Set up delayed validation ONLY for THIS ROW when X > Y
        if (
            (field === "districtFund" || field === "ppp" || field === "stateFund") &&
            x > y
        ) {

            // Clear existing timer for THIS ROW ONLY
            if (rowValidationTimersRef.current[rowId]) {
                clearTimeout(rowValidationTimersRef.current[rowId]);
            }

            // Clear previous error state for THIS ROW ONLY
            setRowsWithValidationError((prev) => {
                const newSet = new Set(prev);
                newSet.delete(rowId);
                return newSet;
            });

            // Mark THIS ROW as pending validation
            setRowsPendingValidation((prev) => {
                const newSet = new Set(prev);
                newSet.add(rowId);
                return newSet;
            });

            // Capture the updated item in closure
            const itemToValidate = { ...updatedItemForValidation };

            // CRITICAL: Validate ONLY THIS ROW after 5 seconds
            rowValidationTimersRef.current[rowId] = setTimeout(() => {
                validateRowWithUpdatedData(rowId, itemToValidate);
            }, VALIDATION_DELAY);
        } else if (field === "requiredAsPerNorms" || field === "available") {
            // Clear timer for THIS ROW ONLY when X or Y changes
            if (rowValidationTimersRef.current[rowId]) {
                clearTimeout(rowValidationTimersRef.current[rowId]);
                delete rowValidationTimersRef.current[rowId];
            }

            // Clear validation states for THIS ROW ONLY
            setRowsWithValidationError((prev) => {
                const newSet = new Set(prev);
                newSet.delete(rowId);
                return newSet;
            });
            setRowsPendingValidation((prev) => {
                const newSet = new Set(prev);
                newSet.delete(rowId);
                return newSet;
            });
        }

        // Trigger autosave
        setHasUnsavedChanges(true);
        lastChangeTimeRef.current = Date.now();
    };

    // ============ AUTOSAVE LOGIC ============
    useEffect(() => {
        if (isSubmitted || !userInfo.UserID) return;
        if (items.length === 0) return;

        if (!isDataValidForAutosave()) {
            return;
        }

        const now = Date.now();
        lastChangeTimeRef.current = now;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            performAutoSave();
        }, AUTOSAVE_DELAY);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [items, isSubmitted, userInfo.UserID, rowsWithValidationError, rowsPendingValidation]);

    const performAutoSave = async () => {
        if (!isDataValidForAutosave()) {
            setHasUnsavedChanges(true);
            return;
        }

        const now = Date.now();
        const lastChange = lastChangeTimeRef.current;

        if (!lastChange || now - lastChange > 60000) {
            setHasUnsavedChanges(false);
            return;
        }

        if (!hasUnsavedChanges) return;

        const itemsToSave = getAllItemsWithChanges();
        if (itemsToSave.length === 0) {
            setHasUnsavedChanges(false);
            return;
        }

        try {
            setAutoSaveStatus("saving");
            let savedCount = 0;

            for (const item of itemsToSave) {
                try {
                    const requestData = {
                        UserID: userInfo.UserID,
                        CollegeID: userInfo.UserLoginID,
                        ItemID: item.itemId,
                        SectorID: item.sectorId,
                        CategoryID: item.categoryId,
                        DistrictFund: item.districtFund || 0,
                        PPP: item.ppp || 0,
                        StateFund: item.stateFund || 0,
                        RequiredAsPerNorms: item.requiredAsPerNorms || 0,
                        Available: item.available || 0,
                        FinancialYear: FINANCIAL_YEAR,
                        IPAddress: ipAddress,
                    };

                    const response = await agent.post(
                        `${API_BASE_URL}/SaveSingleRequirement`,
                        requestData
                    );

                    if (response.data.Status === "Success") {
                        savedCount++;
                    }
                } catch (error) {
                    console.error(`Error autosaving item ${item.itemId}:`, error);
                }
            }

            if (savedCount > 0) {
                lastAutoSaveRef.current = Date.now();
                setAutoSaveStatus("saved");
                setHasUnsavedChanges(false);

                setTimeout(() => {
                    setAutoSaveStatus("");
                }, 3000);

                await loadExistingRequirements(userInfo.UserID,FINANCIAL_YEAR);
                await loadProposedTotals(userInfo.UserID);
            }
        } catch (error) {
            console.error("Autosave error:", error);
            setAutoSaveStatus("");
        }
    };

    // ============ DATA LOADING FUNCTIONS ============
    const initializeComponent = async () => {
        
        const financialYear = await fetchAdmissionYear();

        if (userInfo?.UserID && financialYear) {
            await loadTradeRequirements(financialYear);
            
           // Requirements(financialYear);
            

           // setTimeout(async () => {
                await loadExistingRequirements(userInfo?.UserID, financialYear);
                await loadProposedTotals(userInfo?.UserID, financialYear);

           // }, 500);
        } else if (!financialYear) {
            Swal.fire({
                title: "Session Error",
                text: "User session not found. Please login again.",
                icon: "error",
            });
        }
    };

    const loadTradeRequirements = async () => {
        setLoadingApi(true);
        try {
            const response = await agent.get(`${API_BASE_URL}/GetAllItems`);

            if (response.data.Status === "Success" && response.data.Data) {
                const uniqueItems = [];
                const seenKeys = new Set();

                response.data.Data.forEach((item) => {
                    const uniqueKey = `${item.ItemId}_${item.SectorID}_${item.CategoryId}`;

                    if (!seenKeys.has(uniqueKey)) {
                        seenKeys.add(uniqueKey);

                        const itemCode = item.ItemCode || "N/A";
                        const itemName =
                            item.NameofITem && item.ItemCode
                                ? `${item.NameofITem} (${item.ItemCode})`
                                : item.NameofITem || item.ItemCode || "Unknown Item";

                        uniqueItems.push({
                            id: uniqueKey,
                            itemId: item.ItemId,
                            sectorId: item.SectorID,
                            categoryId: item.CategoryId,
                            itemCode: itemCode,
                            name: itemName,
                            sector: item.SectorName || "Unknown Sector",
                            category: item.CategoryName || "Unknown Category",
                            estimatedPrice: item.EstimatedPrice || 0,
                            documentLink: item.SpecificationDocument || "",
                            districtFund: 0,
                            ppp: 0,
                            stateFund: 0,
                            requiredAsPerNorms: 0,
                            available: 0,
                        });
                    }
                });

                setItems(uniqueItems);
            } else {
                setItems([]);
                Swal.fire({
                    title: "No Data Found",
                    text: "No items were found in the database.",
                    icon: "info",
                });
            }
        } catch (error) {
            console.error("Error loading trade requirements:", error);
            handleApiError(error, "Failed to load trade requirements", () =>
                loadTradeRequirements()
            );
            setItems([]);
        } finally {
            setLoadingApi(false);
        }
    };

    const loadExistingRequirements = async (userId, financialYear) => {
        try {
            const response = await agent.get(`${API_BASE_URL}/GetUserRequirements`, {
                params: {
                    userId: userId,
                    financialYear: financialYear, //FINANCIAL_YEAR
                },
            });

            if (response.data.Status === "Success") {
                const requirementsData = Array.isArray(response.data.Data)
                    ? response.data.Data
                    : [];
                setExistingRequirements(requirementsData);

                const submitted = checkSubmissionStatus(requirementsData);

                if (requirementsData.length > 0) {
                    setItems((prevItems) =>
                        prevItems.map((item) => {
                            const existing = requirementsData.find(
                                (req) =>
                                    req.ItemID === item.itemId &&
                                    req.SectorID === item.sectorId &&
                                    req.CategoryID === item.categoryId
                            );

                            if (existing) {
                                // DON'T mark as edited on load - only on user input
                                // This prevents validation on page load

                                return {
                                    ...item,
                                    districtFund: existing.DistrictFund || 0,
                                    ppp: existing.PPP || 0,
                                    stateFund: existing.StateFund || 0,
                                    requiredAsPerNorms: existing.RequiredAsPerNorms || 0,
                                    available: existing.Available || 0,
                                    requirementId: existing.ID,
                                    status: existing.Status || "",
                                };
                            }
                            return item;
                        })
                    );

                    if (submitted) {
                        Swal.fire({
                            title: "View Only Mode",
                            text: "These requirements have been submitted and cannot be edited. Please contact DVET (desk 07) to unlock for editing.",
                            icon: "info",
                            confirmButtonText: "OK",
                        });
                    }
                }
            } else {
                setExistingRequirements([]);
                setIsSubmitted(false);
            }
        } catch (error) {
            console.error("Error loading existing requirements:", error);
            setExistingRequirements([]);
            setIsSubmitted(false);
        }
    };

    const loadProposedTotals = async (userId, financialYear) => {
        try {
            const response = await agent.get(`${API_BASE_URL}/GetProposedTotals`, {
                params: { userId, financialYear: FINANCIAL_YEAR || financialYear },
            });

            if (response.data.Status === "Success") {
                setProposedTotals(
                    response.data.Data[0] || {
                        DistrictItemsCount: 0,
                        DistrictFund: 0,
                        PPPItemsCount: 0,
                        PPPFund: 0,
                        StateItemsCount: 0,
                        StateFund: 0,
                    }
                );
            }
        } catch (error) {
            console.error("Error loading proposed totals:", error);
        }
    };

    const checkCollegeAndActivity = async () => {
        if (!userInfo?.UserLoginID) return;

        setCheckingApis(true);
        try {
            const [govCollegeResponse, activityResponse] = await Promise.all([
                //agent.get(`${API_BASE_URL}/GetIsGovCollege?CollegeID=${userInfo.UserLoginID}`),
                //agent.get(
                //    `${API_BASE_URL}/GetIsActivityValid?ActivityName=TradeRequirementsSubmit`
                //),
                agent.get(`${GetIsGovCollege}?CollegeID=${userInfo?.UserID}&UserLoginID=${userInfo?.UserLoginID}`),
                agent.get(
                    `${GetIsActivityValid}?ActivityName=TradeRequirementsSubmit`
                ),
            ]);

            if (
                govCollegeResponse.data.Status === "Success" &&
                govCollegeResponse.data.Data?.length > 0
            ) {
                setIsGovCollege(govCollegeResponse.data.Data[0].IsGovCollege);
            }

            if (
                activityResponse.data.Status === "Success" &&
                activityResponse.data.Data?.length > 0
            ) {
                setIsActivityValid(activityResponse.data.Data[0].IsValid);
            }
        } catch (error) {
            console.error("Error checking college and activity:", error);
            setIsGovCollege(null);
            setIsActivityValid(0);
        } finally {
            setCheckingApis(false);
        }
    };

    // ============ SAVE & SUBMIT HANDLERS ============
    const getAllItemsWithChanges = () => {
        return itemsWithCalculations.filter(
            (item) => (item.total || 0) > 0 || item.requirementId
        );
    };

    const handleSave = async () => {
        if (rowsWithValidationError.size > 0 || rowsPendingValidation.size > 0) {
            Swal.fire({
                title: "Invalid Data",
                text: "Please correct highlighted rows before saving or wait for validation to complete.",
                icon: "warning",
            });
            return;
        }

        if (!isDataValidForAutosave()) {
            Swal.fire({
                title: "Validation Error",
                text: "Please ensure all data is valid before saving.",
                icon: "warning",
            });
            return;
        }

        const itemsToSave = getAllItemsWithChanges();
        if (itemsToSave.length === 0) {
            Swal.fire({
                title: "No Changes to Save",
                text: "No changes detected. Please modify at least one item.",
                icon: "info",
            });
            return;
        }

        try {
            setLoading(true);
            let savedCount = 0;
            let deletedCount = 0;
            let failedCount = 0;

            for (const item of itemsToSave) {
                try {
                    const requestData = {
                        UserID: userInfo.UserID,
                        CollegeID: userInfo.UserLoginID,
                        ItemID: item.itemId,
                        SectorID: item.sectorId,
                        CategoryID: item.categoryId,
                        DistrictFund: item.districtFund || 0,
                        PPP: item.ppp || 0,
                        StateFund: item.stateFund || 0,
                        RequiredAsPerNorms: item.requiredAsPerNorms || 0,
                        Available: item.available || 0,
                        FinancialYear: FINANCIAL_YEAR,
                        IPAddress: ipAddress,
                    };

                    const response = await agent.post(
                        `${API_BASE_URL}/SaveSingleRequirement`,
                        requestData
                    );

                    if (response.data.Status === "Success") {
                        if (response.data.Action === "DELETED") {
                            deletedCount++;
                        } else {
                            savedCount++;
                        }
                    } else {
                        failedCount++;
                    }
                } catch (error) {
                    failedCount++;
                    console.error(`Error saving item ${item.itemId}:`, error);
                }
            }

            await loadExistingRequirements(userInfo?.UserID,FINANCIAL_YEAR);
            await loadProposedTotals(userInfo?.UserID);

            if (savedCount > 0 || deletedCount > 0) {
                lastAutoSaveRef.current = Date.now();
                setHasUnsavedChanges(false);

                let message = "";
                if (savedCount > 0 && deletedCount > 0) {
                    message = `Successfully saved ${savedCount} items and cleared ${deletedCount} items`;
                } else if (savedCount > 0) {
                    message = `Successfully saved ${savedCount} items`;
                } else if (deletedCount > 0) {
                    message = `Successfully cleared ${deletedCount} items`;
                }
                if (failedCount > 0) {
                    message += ` (${failedCount} failed)`;
                }

                Swal.fire({
                    title: "Save Complete!",
                    text: message,
                    icon: savedCount + deletedCount === itemsToSave.length ? "success" : "warning",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    title: "Save Failed",
                    text: "No items were saved successfully.",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("Error saving:", error);
            Swal.fire({
                title: "Save Failed",
                text: "An error occurred while saving requirements.",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // const handleSubmit = async () => {
    //     if (rowsWithValidationError.size > 0 || rowsPendingValidation.size > 0) {
    //         Swal.fire({
    //             title: "Invalid Data",
    //             text: "Please correct highlighted rows before submitting or wait for validation to complete.",
    //             icon: "warning",
    //         });
    //         return;
    //     }

    //     const itemsWithTotal = getItemsWithTotal();
    //     if (itemsWithTotal.length === 0) {
    //         Swal.fire({
    //             title: "No Items to Submit",
    //             text: "Please add funding amounts to at least one item before submitting.",
    //             icon: "warning",
    //         });
    //         return;
    //     }

    //     if (isActivityValid !== 1) {
    //         Swal.fire({
    //             title: "Activity Not Available",
    //             text: "This activity is currently not available for submission. Please contact DVET for more information.",
    //             icon: "error",
    //         });
    //         return;
    //     }

    //     try {
    //         setLoading(true);

    //         if (!instituteId) {
    //             Swal.fire({
    //                 title: "Institute ID Not Found",
    //                 text: "Unable to find institute ID. Please try again.",
    //                 icon: "error",
    //             });
    //             return;
    //         }

    //         const url = `${GetInstituteAndManagementMobile}/${instituteId}/2`;
    //         const mobileResponse = await agent.get(url, {
    //             headers: {
    //                 accept: "*/*",
    //                 "Content-Type": "application/json",
    //             },
    //         });

    //         if (
    //             mobileResponse.data &&
    //             mobileResponse.data.Status === "Success" &&
    //             mobileResponse.data.Data?.length > 0
    //         ) {
    //             const mobileNo = mobileResponse.data.Data[0].MobileNo || "";

    //             if (!mobileNo) {
    //                 Swal.fire({
    //                     title: "Mobile Number Not Found",
    //                     text: "No mobile number found for management. Please update your profile.",
    //                     icon: "error",
    //                 });
    //                 return;
    //             }

    //             setUserMobile(mobileNo);

    //             const result = await otpService.startVerification(mobileNo);
    //             if (!result.success) {
    //                 Swal.fire({
    //                     title: "OTP Error",
    //                     text: result.error || "Failed to send OTP. Please try again.",
    //                     icon: "error",
    //                 });
    //             }
    //         } else {
    //             Swal.fire({
    //                 title: "Mobile Number Not Found",
    //                 text: "Unable to find mobile number for OTP verification.",
    //                 icon: "error",
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Error getting management mobile number:", error);
    //         handleApiError(error, "Failed to get mobile number for OTP");
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const handleSubmit = async () => {
        if (rowsWithValidationError.size > 0 || rowsPendingValidation.size > 0) {
            Swal.fire({
                title: "Invalid Data",
                text: "Please correct highlighted rows before submitting or wait for validation to complete.",
                icon: "warning",
            });
            return;
        }

        const itemsWithTotal = getItemsWithTotal();
        if (itemsWithTotal.length === 0) {
            Swal.fire({
                title: "No Items to Submit",
                text: "Please add funding amounts to at least one item before submitting.",
                icon: "warning",
            });
            return;
        }

        if (isActivityValid !== 1) {
            Swal.fire({
                title: "Activity Not Available",
                text: "This activity is currently not available for submission. Please contact DVET for more information.",
                icon: "error",
            });
            return;
        }

        try {
            setLoading(true);

            let mobileNo = "";

            
            if (userInfo?.UserTypeID === 12) {
                mobileNo = "8097070713";
            } else {
                if (!instituteId) {
                    Swal.fire({
                        title: "Institute ID Not Found",
                        text: "Unable to find institute ID. Please try again.",
                        icon: "error",
                    });
                    return;
                }

                const url = `${GetInstituteAndManagementMobile}/${instituteId}/2`;

                const mobileResponse = await agent.get(url, {
                    headers: {
                        accept: "*/*",
                        "Content-Type": "application/json",
                    },
                });

                if (
                    mobileResponse.data &&
                    mobileResponse.data.Status === "Success" &&
                    mobileResponse.data.Data?.length > 0
                ) {
                    mobileNo = mobileResponse.data.Data[0].MobileNo || "";
                }

                if (!mobileNo) {
                    Swal.fire({
                        title: "Mobile Number Not Found",
                        text: "No mobile number found for management. Please update your profile.",
                        icon: "error",
                    });
                    return;
                }
            }

            setUserMobile(mobileNo);

            const result = await otpService.startVerification(mobileNo);

            if (!result.success) {
                Swal.fire({
                    title: "OTP Error",
                    text: result.error || "Failed to send OTP. Please try again.",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("Error getting management mobile number:", error);
            handleApiError(error, "Failed to get mobile number for OTP");
        } finally {
            setLoading(false);
        }
    };
    const submitRequirements = async () => {
        if (rowsWithValidationError.size > 0 || rowsPendingValidation.size > 0) return;

        const itemsToSave = getAllItemsWithChanges();

        try {
            setLoading(true);
            let submittedCount = 0;
            let failedCount = 0;

            for (const item of itemsToSave) {
                try {
                    const requestData = {
                        UserID: userInfo?.UserID,
                        CollegeID: userInfo?.UserLoginID,
                        ItemID: item.itemId,
                        SectorID: item.sectorId,
                        CategoryID: item.categoryId,
                        DistrictFund: item.districtFund || 0,
                        PPP: item.ppp || 0,
                        StateFund: item.stateFund || 0,
                        RequiredAsPerNorms: item.requiredAsPerNorms || 0,
                        Available: item.available || 0,
                        FinancialYear: FINANCIAL_YEAR,
                        IPAddress: ipAddress,
                        Operation: "SUBMIT",
                    };

                    const response = await agent.post(
                        `${API_BASE_URL}/SaveSingleRequirement`,
                        requestData
                    );

                    if (response.data.Status === "Success") {
                        submittedCount++;
                    } else {
                        failedCount++;
                    }
                } catch (error) {
                    failedCount++;
                    console.error(`Error submitting item ${item.itemId}:`, error);
                }
            }

            await loadExistingRequirements(userInfo?.UserID,FINANCIAL_YEAR);
            await loadProposedTotals(userInfo?.UserID);

            if (submittedCount > 0) {
                Swal.fire({
                    title: "Submit Complete!",
                    text: `Successfully submitted ${submittedCount} items${failedCount > 0 ? ` (${failedCount} failed)` : ""
                        }`,
                    icon: submittedCount === itemsToSave.length ? "success" : "warning",
                    timer: 3000,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    title: "Submit Failed",
                    text: "No items were submitted successfully.",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("Error submitting:", error);
            Swal.fire({
                title: "Submit Failed",
                text: "An error occurred while submitting requirements.",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // ============ UTILITY FUNCTIONS ============
    const handleApiError = (error, defaultMessage, retryFunction = null) => {
        let errorMessage = defaultMessage;
        if (error.response) {
            errorMessage += ` Server responded with: ${error.response.status} - ${error.response.data?.Message || error.response.statusText
                }`;
        } else if (error.request) {
            errorMessage += " No response from server. Please check your connection.";
        } else {
            errorMessage += ` ${error.message}`;
        }

        const swalConfig = {
            title: "Error",
            text: errorMessage,
            icon: "error",
        };

        if (retryFunction) {
            swalConfig.showCancelButton = true;
            swalConfig.confirmButtonText = "Retry";
            swalConfig.cancelButtonText = "Cancel";
        }

        Swal.fire(swalConfig).then((result) => {
            if (result.isConfirmed && retryFunction) {
                retryFunction();
            }
        });
    };

    const handleDocumentDownload = (documentUrl, itemName) => {
        if (!documentUrl || documentUrl.trim() === "") {
            Swal.fire({
                title: "Document Not Available",
                text: "No specification document available for this item.",
                icon: "warning",
            });
            return;
        }

        try {
            const popupWidth = 800;
            const popupHeight = 600;
            const left = (window.screen.width - popupWidth) / 2;
            const top = (window.screen.height - popupHeight) / 2;

            const popup = window.open(
                "",
                `${itemName}_PDF_Viewer`,
                `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`
            );

            if (popup) {
                popup.document.write(`
                <html>
                  <head><title>${itemName} Document Viewer</title></head>
                  <body style="margin:0; overflow:hidden;">
                    <iframe src="${documentUrl}" frameborder="0" style="border:none; width:100vw; height:100vh;"></iframe>
                  </body>
                </html>
              `);
                popup.document.close();
                popup.focus();
            } else {
                Swal.fire({
                    title: "Popup Blocked",
                    text: "Please allow popups for this website to view the PDF.",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("Download error:", error);
            Swal.fire({
                title: "Error Opening Document",
                text: "There was an error opening the document. Please try again.",
                icon: "error",
            });
        }
    };

    const handleFinancialYearChange = async  (value) => {
        setSelectedFinancialYear(value);
        setFinancialYear(value);

        if (userInfo?.UserID) {
            setLoadingApi(true);
            await loadTradeRequirements(value);
            await loadExistingRequirements(userInfo?.UserID, value);
            await loadProposedTotals(userInfo?.UserID, value );
            setLoadingApi(false);
        }
       
    };

    useEffect(() => {
        if (userInfo?.UserID && FINANCIAL_YEAR) {
            loadTradeRequirements(FINANCIAL_YEAR);
            loadExistingRequirements(userInfo?.UserID, FINANCIAL_YEAR);
            loadProposedTotals(userInfo?.UserID, FINANCIAL_YEAR);
        }
    }, [FINANCIAL_YEAR, userInfo?.UserID]); 

    // ============ EXPORT FUNCTIONS ============
    const downloadExcelTemplate = () => {
        try {
            const exporter = getExporter();
            exporter.exportExcelTemplate(items);
        } catch (error) {
            Swal.fire({
                title: "Export Failed",
                text: error.message,
                icon: "warning",
            });
        }
    };

    const isDataReadyForPrint = () =>
        items &&
        items.length > 0 &&
        existingRequirements &&
        existingRequirements.length > 0 &&
        userInfo &&
        userInfo?.UserLoginID;

    const handlePrintReport = () => {
        if (!isDataReadyForPrint()) {
            Swal.fire({
                title: "Data Not Ready",
                text: "Please wait for data to finish loading before generating the report.",
                icon: "warning",
            });
            return;
        }

        try {
            const exporterLocal = getExporter();
            const status = existingRequirements[0]?.Status;
            const submissionDate =
                status === "Submitted" ? existingRequirements[0]?.SubmissionDate : "";
            exporterLocal.exportToPDF(itemsWithCalculations, submissionDate);
        } catch (error) {
            Swal.fire({
                title: "Export Failed",
                text: error.message || "Failed to generate print report",
                icon: "warning",
            });
        }
    };

    const downloadCSV = () => {
        try {
            const exporter = getExporter();
            exporter.exportToExcel(items, existingRequirements[0]?.SubmissionDate || "");
        } catch (error) {
            Swal.fire({
                title: "Export Failed",
                text: error.message,
                icon: "warning",
            });
        }
    };

    const downloadPDF = () => {
        try {
            const exporter = getExporter();
            exporter.exportToPDF(items, existingRequirements[0]?.SubmissionDate || "");
        } catch (error) {
            Swal.fire({
                title: "Export Failed",
                text: error.message,
                icon: "warning",
            });
        }
    };

    // ============ COMPUTED VALUES ============
    const itemsWithCalculations = items.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
        total: (item.districtFund || 0) + (item.ppp || 0) + (item.stateFund || 0),
        requiredAsPerNorms: item.requiredAsPerNorms || 0,
        available: item.available || 0,
    }));

    const getItemsWithTotal = () => itemsWithCalculations.filter((item) => (item.total || 0) > 0);

    const exportFilter = (data) => data.filter((item) => (item.total || 0) > 0);

    // ============ TABLE COLUMN CONFIGURATION ============
    const tableColumns = [
        {
            key: "serialNumber",
            header: "S.N.",
            headerClassName: "text-center",
            className: "text-center",
            sortable: false,
            width: "60px",
        },
        {
            key: "name",
            header: "Name of Item (with Code)",
            type: "custom",
            headerClassName: "text-left",
            className: "text-left",
            width: "320px",
        },
        {
            key: "sector",
            header: "Sector",
            headerClassName: "text-center",
            className: "text-center",
            width: "120px",
        },
        {
            key: "category",
            header: "Category",
            headerClassName: "text-center",
            className: "text-center",
            width: "140px",
        },
        {
            key: "estimatedPrice",
            header: "Estimated Price",
            type: "currency",
            headerClassName: "text-right",
            className: "text-center",
            width: "120px",
        },
        {
            key: "requiredAsPerNorms",
            header: "Required as per norms",
            type: isSubmitted ? "text" : "input",
            inputType: "number",
            min: 0,
            step: 1,
            placeholder: "0",
            headerClassName: "text-center bg-blue-100",
            className: "text-center",
            sortable: false,
            width: "120px",
            readonly: isSubmitted,
        },
        {
            key: "available",
            header: "Available",
            type: isSubmitted ? "text" : "input",
            inputType: "number",
            min: 0,
            step: 1,
            placeholder: "0",
            headerClassName: "text-center bg-blue-50",
            className: "text-center",
            sortable: false,
            width: "110px",
            readonly: isSubmitted,
        },
        {
            key: "deficiency",
            header: "Deficiency",
            type: isSubmitted ? "text" : "input",
            inputType: "number",
            min: 0,
            step: 1,
            placeholder: "0",
            headerClassName: "text-center bg-blue-50",
            className: "text-center",
            sortable: false,
            width: "110px",
            readonly: isSubmitted,
        },
        {
            key: "districtFund",
            header: "Proposed in DPDC",
            type: isSubmitted ? "text" : "input",
            inputType: "number",
            min: 0,
            step: 1,
            placeholder: "0",
            headerClassName: "text-center bg-pink-200",
            className: "text-center",
            sortable: false,
            width: "110px",
            readonly: isSubmitted,
        },
        {
            key: "ppp",
            header: "Proposed in PPP",
            type: isSubmitted ? "text" : "input",
            inputType: "number",
            min: 0,
            step: 1,
            placeholder: "0",
            headerClassName: "text-center bg-yellow-200",
            className: "text-center",
            sortable: false,
            width: "110px",
            readonly: isSubmitted,
        },
        {
            key: "stateFund",
            header: "Proposed in State Fund",
            type: isSubmitted ? "text" : "input",
            inputType: "number",
            min: 0,
            step: 1,
            placeholder: "0",
            headerClassName: "text-center bg-green-200",
            className: "text-center",
            sortable: false,
            width: "120px",
            readonly: isSubmitted,
        },
        {
            key: "total",
            header: "Total",
            type: "currency",
            headerClassName: "text-center bg-purple-100",
            className: "text-center font-semibold",
            width: "100px",
        },
    ];

    // ============ CUSTOM CELL RENDERER ============
    const renderCell = (item, column) => {
        const x = Number(item.requiredAsPerNorms) || 0;
        const y = Number(item.available) || 0;
        const diff = Math.max(0, x - y);

        if (column.key === "name" && isRowFullyFilled(item)) {
            return <span className="text-green-500 font-semibold">{item[column.key]}</span>;
        }

        if (
            isSubmitted &&
            (column.key === "districtFund" || column.key === "ppp" || column.key === "stateFund")
        ) {
            return (
                <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {item[column.key] || 0}
                </span>
            );
        }

        if (
            (column.key === "districtFund" || column.key === "ppp" || column.key === "stateFund") &&
            x <= y
        ) {
            const savedValue = item[column.key] || 0;

            if (savedValue > 0 || item.requirementId) {
                return (
                    <input
                        type="number"
                        className="w-full border border-gray-300 bg-gray-50 text-center text-gray-700 cursor-not-allowed"
                        value={savedValue}
                        disabled
                        readOnly
                    />
                );
            }

            return (
                <input
                    type="number"
                    className="w-full border border-gray-200 bg-gray-100 text-center text-gray-500 cursor-not-allowed"
                    value={0}
                    disabled
                    readOnly
                />
            );
        }

        if (
            (column.key === "districtFund" || column.key === "ppp" || column.key === "stateFund") &&
            rowsWithValidationError.has(item.id)
        ) {
            return (
                <input
                    type="number"
                    className="w-full border-2 border-red-500 bg-red-50 text-center"
                    value={item[column.key] || 0}
                    onChange={(e) => handleInputChange(item.id, column.key, e.target.value)}
                    min="0"
                    step="1"
                />
            );
        }

        if (
            (column.key === "districtFund" || column.key === "ppp" || column.key === "stateFund") &&
            rowsPendingValidation.has(item.id)
        ) {
            return (
                <input
                    type="number"
                    className="w-full border-2 border-yellow-400 bg-yellow-50 text-center"
                    value={item[column.key] || 0}
                    onChange={(e) => handleInputChange(item.id, column.key, e.target.value)}
                    min="0"
                    step="1"
                />
            );
        }

        if (column.key === "sector") {
            return (
                <button
                    onClick={() => handleDocumentDownload(item.documentLink, item.sector)}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-center w-full"
                    title="Click to download specification document"
                    disabled={!item.documentLink || item.documentLink.trim() === ""}
                >
                    {item.sector}
                </button>
            );
        }

        if (column.key === "deficiency") {
            return (
                <input
                    type="number"
                    className="w-full border border-gray-200 bg-gray-100 text-center text-gray-500 cursor-not-allowed"
                    value={diff}
                    disabled
                    readOnly
                />
            );
        }

        return undefined;
    };

    // ============ OTP SERVICE ============
    const otpService = OTPService({
        mobileNo: userMobile,
        purpose: "SubmitTradeRequirements",
        isVerifyRequired: true,
        messege:
            "Information filled in Trade Requirement table shall be submitted to respective Regional Office and DVET. Once information is submitted, user shall not be able to edit the information. So recheck information and then submit. ",
        isDuplicateCheck: false,
        config: otpConfig,
        onSuccess: async () => {
            await submitRequirements();
        },
        onError: (error) => {
            Swal.fire({
                title: "Verification Failed",
                text: error.message || "OTP verification failed. Please try again.",
                icon: "error",
            });
        },
        onCancel: () => { },
    });

    // ============ EFFECTS ============
    useEffect(() => {
        initializeComponent();
        
    }, []);

    useEffect(() => {
        if (userInfo?.UserLoginID) {
            checkCollegeAndActivity();
        }
    }, [userInfo?.UserLoginID]);

    useEffect(() => {
        const fetchIP = async () => {
            try {
                const response = await agent.get(getIp, {
                    headers: { accept: "*/*" },
                });
                setIpAddress(response.ip || "");
            } catch (error) {
                console.error("Error fetching IP:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchIP();
    }, []);

    useEffect(() => {
        const fetchInstituteId = async () => {
            if (!userInfo?.UserLoginID) return;
            try {
                const instRes = await agent.get(GetInstituteIDByInstituteCode, {
                    params: { InstituteCode: userInfo?.UserLoginID },
                });
                const instId = instRes?.data?.Data ?? instRes?.data?.InstituteID ?? null;
                setInstituteId(instId);
            } catch (error) {
                console.error("Error fetching Institute ID:", error);
            }
        };
        fetchInstituteId();
    }, [userInfo?.UserLoginID]);

    // added for match the year 
    const normalizeFinancialYear = (fy) => {
        if (!fy) return "";

        fy = fy.trim().replace(/\//g, "-");

        const parts = fy.split("-");

        if (parts.length !== 2) return fy;

        const startYear = parts[0];

        let endYear = parts[1];

        // Convert 27 -> 2027
        if (endYear.length === 2) {
            endYear = startYear.substring(0, 2) + endYear;
        }

        return `${startYear}-${endYear}`;
    };

    useEffect(() => {
        if (!userInfo?.UserLoginID || !instituteId) return;

        const fetchAvailableFunds = async () => {
            try {

                const selectedFY =
                    normalizeFinancialYear(FINANCIAL_YEAR); 
                const dpdcResponse = await agent.get(GetDPDCDetailsByCollegeRegNo, {
                    params: {
                        CollegeRegistrationNo: userInfo?.UserLoginID,
                    },
                    headers: {
                        accept: "*/*",
                        "Content-Type": "application/json",
                    },
                });
                //const totalAvailable =
                //    dpdcResponse.data?.Data?.[0]?.TotalAllottedToInstitute || 0;
                //setAvailableFund(totalAvailable);
                const dpdcData = dpdcResponse.data?.Data || [];

                // Match selected financial year
                const matchedDPDC = dpdcData.find(item =>
                    normalizeFinancialYear(item.FinancialYear) === selectedFY
                );


                setAvailableFund(
                    matchedDPDC?.TotalAllottedToInstitute || 0
                );

                const pppRes = await agent.get(GetFinancialDataForPppFund, {
                    params: { InstituID: instituteId },
                });
                //const pppBalance = pppRes?.data?.Data?.[0]?.BalanceasonDate || 0;
                //setPppAvailableFund(pppBalance);

                const pppData = pppRes?.data?.Data || [];

                // Match selected financial year
                const matchedPPP = pppData.find(item =>
                    normalizeFinancialYear(item.FinancialYear) === selectedFY
                );


                setPppAvailableFund(
                    matchedPPP?.BalanceasonDate || 0
                );

            } catch (error) {
                console.error("Error fetching Available Funds:", error);
            }
        };
        fetchAvailableFunds();
    }, [userInfo, instituteId]);

    useEffect(() => {
        const newTotals = calculateRealTimeTotals(items);
        setRealTimeTotals(newTotals);
    }, [items]);

    // ============ CLEANUP ============
    useEffect(() => {
        return () => {
            // Clear ALL timers
            Object.values(rowValidationTimersRef.current).forEach((timer) => {
                if (timer) clearTimeout(timer);
            });

            rowValidationTimersRef.current = {};

            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, []);

    // ============ JSX RETURN ============
    return (
        <div className="space-y-6 p-4">
            <fieldset className="rounded border border-gray-300 p-4">
                <legend
                    className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
                >
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Trade Requirements - All Items
                    </div>
                </legend>

                {!isSubmitted && (
                    <div className="flex justify-end items-center mb-2">
                        {autoSaveStatus === "saving" && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                <span>Saving...</span>
                            </div>
                        )}
                        {autoSaveStatus === "saved" && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <span>Auto saved</span>
                            </div>
                        )}
                        {autoSaveStatus === "" &&
                            hasUnsavedChanges && (
                                <div className="text-sm text-red-500">
                                    <span>Unsaved changes</span>
                                </div>
                            )}
                    </div>
                )}

                {isSubmitted && (
                    <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                        <p className="text-sm font-medium">
                            This data has been submitted and is in
                            <strong> View Only Mode</strong>.
                        </p>
                    </div>
                )}

                {/* top cards, table, buttons etc. remain same as previous answer;
                only key behaviour changes are above */}

                <div className="p-4 rounded-lg mb-6 border border-gray-300 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        {/* Financial Year Dropdown */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <DropdownComponent
                                    label="Financial Year"
                                    options={financialYearOptions}
                                    value={
                                        selectedFinancialYear
                                    }
                                    onChange={
                                        handleFinancialYearChange
                                    }
                                    required={true}
                                    disabled={false}
                                    loading={false}
                                    error=""
                                />
                            </div>
                        </div>

                        {/* Fund Cards */}
                        <div className="lg:col-span-3">
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                                {/* District Fund Card */}
                                <div className="bg-pink-50 border-l-4 border-pink-500 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="font-bold text-pink-800 text-lg">
                                            Proposed in District
                                            Fund
                                        </div>
                                        <div className="bg-pink-100 rounded-full p-2">
                                            <svg
                                                className="w-6 h-6 text-pink-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Items:
                                            </span>
                                            <span className="font-semibold text-pink-700 bg-pink-100 px-2 py-1 rounded">
                                                {
                                                    realTimeTotals.DistrictItemsCount
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Amount:
                                            </span>
                                            <span className="font-semibold text-pink-700">
                                                ₹
                                                {realTimeTotals.DistrictFundAmount.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-pink-200 pt-2">
                                            <span className="text-gray-600">
                                                Available Fund:
                                            </span>
                                            <span className="font-semibold text-pink-800 bg-pink-200 px-2 py-1 rounded">
                                                ₹
                                                {availableFund.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* PPP Card */}
                                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="font-bold text-yellow-800 text-lg">
                                            Proposed in PPP Fund
                                        </div>
                                        <div className="bg-yellow-100 rounded-full p-2">
                                            <svg
                                                className="w-6 h-6 text-yellow-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Items:
                                            </span>
                                            <span className="font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                                                {
                                                    realTimeTotals.PPPItemsCount
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Amount:
                                            </span>
                                            <span className="font-semibold text-yellow-700">
                                                ₹
                                                {realTimeTotals.PPPFundAmount.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-yellow-200 pt-2">
                                            <span className="text-gray-600">
                                                Available Fund:
                                            </span>
                                            <span className="font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded">
                                                ₹
                                                {pppAvailableFund.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* State Fund Card */}
                                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="font-bold text-green-800 text-lg">
                                            Proposed in State Fund
                                        </div>
                                        <div className="bg-green-100 rounded-full p-2">
                                            <svg
                                                className="w-6 h-6 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Items:
                                            </span>
                                            <span className="font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                                                {
                                                    realTimeTotals.StateItemsCount
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Amount:
                                            </span>
                                            <span className="font-semibold text-green-700">
                                                ₹
                                                {realTimeTotals.StateFundAmount.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-green-200 pt-2">
                                            <span className="text-gray-600">
                                                Available Fund:
                                            </span>
                                            <span className="font-semibold text-green-800 bg-green-200 px-2 py-1 rounded">
                                                ₹0
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loadingApi && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">
                            Loading all trade requirements...
                        </p>
                    </div>
                )}

                {/* No Data State */}
                {!loadingApi && items.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-600">
                            No trade requirements found. Please
                            check your database connection.
                        </p>
                        <Button
                            variant="outlined"
                            onClick={loadTradeRequirements}
                            className="mt-4"
                        >
                            Retry Loading
                        </Button>
                    </div>
                )}
                {/* ... for brevity, keep your existing JSX for cards and notes,
                  using itemsWithCalculations, tableColumns, renderCell,
                  handleInputChange, handleSave, handleSubmit etc. */}
                {/* TABLE */}
                {!loadingApi && items.length > 0 && (
                    <FilteredTableComponent
                        data={itemsWithCalculations}
                        columns={tableColumns}
                        filterColumns={[
                            "sector",
                            "category",
                            "name",
                        ]}
                        onRowChange={
                            isSubmitted ? null : handleInputChange
                        }
                        customButtons={[]}
                        title={`Trade Requirements - Financial Year ${FINANCIAL_YEAR}`}
                        exportFileName={`Trade_Requirements_${FINANCIAL_YEAR}`}
                        onExportFilter={exportFilter}
                        tableId="trade-requirements-table"
                        searchable={true}
                        sortable={true}
                        showExcelTemplate={!isSubmitted}
                        exportable={true}
                        showSearch={true}
                        showExport={true}
                        className="mt-4"
                        downloadCSV={downloadCSV}
                        downloadPDF={downloadPDF}
                        downloadTemplate={downloadExcelTemplate}
                        renderCell={renderCell}
                        maxHeight="500px"
                        stickyHeader={true}
                        readOnly={isSubmitted}
                    />
                )}
                <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                    <div className="mt-4 flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="declaration"
                            className="mt-1 h-4 w-4 cursor-pointer"
                            checked={isDeclared}
                            onChange={(e) =>
                                setIsDeclared(e.target.checked)
                            }
                        />
                        <label
                            htmlFor="declaration"
                            className="text-sm text-blue-800 cursor-pointer"
                        >
                            I hereby declare that the above information
                            is true and correct to the best of my
                            knowledge.
                        </label>
                    </div>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700">
                        <li>
                            The demand has been proposed for sanctioned
                            affiliated and to be affiliated CTS units.
                        </li>
                        <li>
                            The demand covers 652 units sanctioned vide
                            Government of Maharashtra resolution dated
                            22.06.2023.
                        </li>
                        <li>
                            The demand is based as per norms for CTS
                            Trades.
                        </li>
                        <li>
                            The institute has planned to create common
                            facilities as CNC Lab, Computer Lab, Drawing
                            Hall, Library, Class Room, Store Room,
                            Office, Conference Room, Seminar Hall, etc.
                            for optimum utilization of resources.
                        </li>
                        <li>
                            The demand is placed after utilization of
                            existing available training infrastructure.
                        </li>
                        <li>
                            The institute has taken necessary
                            administrative approval for procurement
                            through DPDC fund and IMC approval for
                            procurement through PPP fund.
                        </li>
                        <li>
                            The demand also covers training
                            infrastructure required for Short Term
                            Training (STEP).
                        </li>
                    </ol>
                </div>

                <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">
                        <span className="font-medium">
                            Note:
                        </span>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>
                                Click on{" "}
                                <span className="font-medium">
                                    "Submit"
                                </span>{" "}
                                button to Submit Information to Regional
                                Office and Head Office.
                            </li>
                            <li>
                                OTP confirmation on Head of Institute/
                                Principal/Director Primary Mobile Number
                                required to submit filled information.
                            </li>
                            <li>
                                Information once submitted shall not be
                                available for editing.
                            </li>
                            <li>
                                Contact DVET (desk 07) to unlock
                                information and resubmission.
                            </li>
                        </ol>
                    </p>
                </div>
                {/* action buttons (Save / Submit) */}
                {!loadingApi && items.length > 0 && (
                    <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
                        <button
                            className="bg-green-600 text-white px-6 py-2 font-bold rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSave}
                            disabled={loading || isSubmitted || rowsWithValidationError.size > 0}
                        >
                            Save
                        </button>

                        <button
                            className="bg-blue-600 text-white px-6 py-2 font-bold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            disabled={
                                !isDeclared ||
                                loading ||
                                isSubmitted ||
                                checkingApis ||
                                isActivityValid !== 1 ||
                                rowsWithValidationError.size > 0
                            }
                            title={
                                !isDeclared
                                    ? "Please accept the declaration"
                                    : isActivityValid !== 1
                                        ? "Activity not available for submission"
                                        : ""
                            }
                        >
                            {loading
                                ? "Submitting..."
                                : checkingApis
                                    ? "Checking..."
                                    : "Submit"}
                        </button>

                        {false && (
                            <button
                                className="bg-purple-600 text-white px-6 py-2 font-bold rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handlePrintReport}
                                disabled={
                                    loading ||
                                    !items ||
                                    items.length === 0 ||
                                    !existingRequirements ||
                                    existingRequirements.length === 0
                                }
                                title={
                                    !items ||
                                        items.length === 0 ||
                                        !existingRequirements ||
                                        existingRequirements.length === 0
                                        ? "Please wait for data to load"
                                        : ""
                                }
                            >
                                Print Report
                            </button>
                        )}
                    </div>
                )
                } </fieldset >

        </div >

    );
};

export default TradeRequirements;
