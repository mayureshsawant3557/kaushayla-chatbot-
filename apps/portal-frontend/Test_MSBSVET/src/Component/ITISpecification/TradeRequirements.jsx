import { useState, useEffect, useContext, useRef } from "react";
import { Button } from "@mui/material";
import agent from '../../lib/api/agent';
import { ThemeContext } from "../Context/ThemeContext";
import { Search } from "lucide-react";
import Swal from 'sweetalert2';
import FilteredTableComponent from '../formcomponent/FilteredTableComponent';
import OTPService from '../formcomponent/OTPService';
import { ITISpecification } from "../../Endpoints_All/ITISpecification/itiSpecification";
import { API_BASE } from "../../Endpoints_All/Base/masterData";

import DropdownComponent from "../formcomponent/DropdownComponent";
import { TradeRequirementsExporter } from '../formcomponent/TradeRequirementsExporter';
import { GetDPDCDetailsByCollegeRegNo } from "../../Endpoints_All/Base/Institute";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import { GetInstituteAndManagementMobile } from "../../Endpoints_All/ITISpecification/itiSpecification";
import {
    GetFinancialDataForPppFund,
} from "../../Endpoints_All/ITISpecification/itiSpecification";

import { getIpAndLocation } from "../../pages/DeviceDetails";
import { useAuth } from "../../Hooks/AuthContext";

const TradeRequirements = ({ onBack }) => {
    const { color } = useContext(ThemeContext);
    const printRef = useRef();

    // State management
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingApi, setLoadingApi] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [existingRequirements, setExistingRequirements] = useState([]);
    const [userMobile, setUserMobile] = useState('');
    const [selectedFinancialYear, setSelectedFinancialYear] = useState("2025-2026");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [availableFund, setAvailableFund] = useState(0);
    const [pppAvailableFund, setPppAvailableFund] = useState(0);
    const [instituteId, setInstituteId] = useState(null);
    const [isDeclared, setIsDeclared] = useState(false);

    // AUTOSAVE STATE
    const [autoSaveStatus, setAutoSaveStatus] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const lastChangeTimeRef = useRef(null);
    const autoSaveTimerRef = useRef(null);
    const lastAutoSaveRef = useRef(null);

    const [isGovCollege, setIsGovCollege] = useState(null);
    const [checkingActivity, setCheckingActivity] = useState(false);
    const [ipAddress, setIpAddress] = useState("");
    const { userInfo } = useAuth();

    const [realTimeTotals, setRealTimeTotals] = useState({
        DistrictItemsCount: 0,
        DistrictFundAmount: 0,
        PPPItemsCount: 0,
        PPPFundAmount: 0,
        StateItemsCount: 0,
        StateFundAmount: 0
    });

    const API_BASE_URL = ITISpecification;
    const FINANCIAL_YEAR = "2025-2026";

    const [proposedTotals, setProposedTotals] = useState({
        DistrictItemsCount: 0,
        DistrictFund: 0,
        PPPItemsCount: 0,
        PPPFund: 0,
        StateItemsCount: 0,
        StateFund: 0
    });

    const financialYearOptions = [
        { value: "2025-2026", label: "2025-2026" }
    ];

    const getExporter = () => {
        return new TradeRequirementsExporter(
            userInfo,
            FINANCIAL_YEAR,
            userInfo?.UserName || userInfo?.Institute_Name || 'Institute Name'
        );
    };

    // Check if row is fully filled
    const isRowFullyFilled = (item) => {
        return (item.districtFund > 0) || (item.ppp > 0) || (item.stateFund > 0);
    };

    // Check if any requirement is submitted
    const checkSubmissionStatus = (requirementsData) => {
        const hasSubmitted = requirementsData.some(req => req.Status === "Submitted");
        setIsSubmitted(hasSubmitted);
        return hasSubmitted;
    };

    // OTP Service configuration
    const otpConfig = {
        MAX_ATTEMPTS: 3,
        RESEND_COOLDOWN: 30,
        OTP_LENGTH: 4,
        showDemo: true
    };

    // Calculate real-time totals
    const calculateRealTimeTotals = (currentItems) => {
        const totals = {
            DistrictItemsCount: 0,
            DistrictFundAmount: 0,
            PPPItemsCount: 0,
            PPPFundAmount: 0,
            StateItemsCount: 0,
            StateFundAmount: 0
        };

        currentItems.forEach(item => {
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

    // ==================== NEW: Check Activity Validation (Called on Submit) ====================
    const checkActivityValidity = async () => {

        try {
            setCheckingActivity(true);

            const activityApiUrl = `${API_BASE}/GetIsActivityValid?ActivityName=TradeRequirementsSubmit`;

            const response = await agent.get(activityApiUrl);

            if (response.data.Status === "Success" && response.data.Data?.length > 0) {
                const isValid = response.data.Data[0].IsValid;
                return isValid === 1;
            } else {
                return false;
            }
        } catch (error) {
            console.error("❌ Error checking activity:", error);
            console.error("❌ Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            return false;
        } finally {
            setCheckingActivity(false);
        }
    };

    // Fetch Government College Status (on load)
    useEffect(() => {
        const fetchGovCollegeStatus = async () => {
            if (!userInfo?.UserLoginID) return;

            try {
                const response = await agent.get(`${API_BASE_URL}/GetIsGovCollege?CollegeID=${userInfo.UserLoginID}`);
                if (response.data.Status === "Success" && response.data.Data?.length > 0) {
                    setIsGovCollege(response.data.Data[0].IsGovCollege);
                }
            } catch (error) {
                console.error("Error fetching government college status:", error);
            }
        };

        if (userInfo?.UserLoginID) {
            fetchGovCollegeStatus();
        }
    }, [userInfo?.UserLoginID]);

    //ip address fetch
    useEffect(() => {
        const fetchIP = async () => {
            try {
                const data = await getIpAndLocation();
                setIpAddress(data.ip);
            } catch (error) {
                console.error('Error fetching IP:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIP();
    }, []);

    // Fetch Institute ID from InstituteCode
    useEffect(() => {
        const fetchInstituteId = async () => {
            if (!userInfo?.UserLoginID) return;

            try {
                const instRes = await agent.get(GetInstituteIDByInstituteCode, {
                    params: { InstituteCode: userInfo.UserLoginID },
                });
                const instId = instRes?.data?.Data ?? instRes?.data?.InstituteID ?? null;
                setInstituteId(instId);
            } catch (error) {
                console.error("Error fetching Institute ID:", error);
            }
        };

        fetchInstituteId();
    }, [userInfo?.UserLoginID]);

    // Fetch Available Funds (District and PPP)
    useEffect(() => {
        if (!userInfo?.UserLoginID || !instituteId) return;

        const fetchAvailableFunds = async () => {
            try {
                const dpdcResponse = await agent.get(GetDPDCDetailsByCollegeRegNo, {
                    params: {
                        CollegeRegistrationNo: userInfo.UserLoginID
                    },
                    headers: {
                        "accept": "*/*",
                        "Content-Type": "application/json"
                    }
                });

                const totalAvailable = dpdcResponse.data?.Data?.[0]?.TotalAllottedToInstitute || 0;
                setAvailableFund(totalAvailable);

                const pppRes = await agent.get(GetFinancialDataForPppFund, {
                    params: { InstituID: instituteId },
                });

                const pppBalance = pppRes?.data?.Data?.[0]?.BalanceasonDate || 0;
                setPppAvailableFund(pppBalance);

            } catch (error) {
                console.error("Error fetching Available Funds:", error);
            }
        };

        fetchAvailableFunds();
    }, [userInfo, instituteId]);

    // Update real-time totals whenever items change
    useEffect(() => {
        const newTotals = calculateRealTimeTotals(items);
        setRealTimeTotals(newTotals);
    }, [items]);

    // Handle financial year change
    const handleFinancialYearChange = (value) => {
        setSelectedFinancialYear(value);
    };

    // Initialize OTP Service
    const otpService = OTPService({
        mobileNo: userMobile,
        purpose: 'SubmitTradeRequirements',
        isVerifyRequired: true,
        messege: 'Information filled in Trade Requirement table shall be submitted to respective Regional Office and DVET. Once information is submitted, user shall not be able to edit the information. So recheck information and then submit. ',
        isDuplicateCheck: false,
        config: otpConfig,
        onSuccess: async (data) => {
            await submitRequirements();
        },
        onError: (error) => {
            console.error("OTP Verification Error:", error);
            Swal.fire({
                title: "Verification Failed",
                text: error.message || "OTP verification failed. Please try again.",
                icon: "error"
            });
        },
        onCancel: () => {
        }
    });

    useEffect(() => {
        initializeComponent();
    }, []);

    // AUTOSAVE LOGIC
    useEffect(() => {
        if (isSubmitted || !userInfo.UserID) {
            return;
        }

        if (items.length > 0) {
            const now = Date.now();
            lastChangeTimeRef.current = now;
            setHasUnsavedChanges(true);

            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }

            autoSaveTimerRef.current = setTimeout(() => {
                performAutoSave();
            }, 5000);
        }

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [items, isSubmitted, userInfo.UserID]);

    // Perform autosave
    const performAutoSave = async () => {
        const now = Date.now();
        const lastChange = lastChangeTimeRef.current;

        if (!lastChange || (now - lastChange) > 60000) {
            setHasUnsavedChanges(false);
            return;
        }

        if (!hasUnsavedChanges) {
            return;
        }

        const itemsToSave = getAllItemsWithChanges();

        if (itemsToSave.length === 0) {
            setHasUnsavedChanges(false);
            return;
        }

        try {
            setAutoSaveStatus('saving');
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
                        requiredAsPerNorms: 0,
                        available: 0,
                        FinancialYear: FINANCIAL_YEAR,
                        IPAddress: ipAddress

                    };
                    const response = await agent.post(`${API_BASE_URL}/SaveSingleRequirement`, requestData);

                    if (response.data.Status === "Success") {
                        savedCount++;
                    }
                } catch (error) {
                    console.error(`Error autosaving item ${item.itemId}:`, error);
                }
            }

            if (savedCount > 0) {
                lastAutoSaveRef.current = Date.now();
                setAutoSaveStatus('saved');
                setHasUnsavedChanges(false);

                setTimeout(() => {
                    setAutoSaveStatus('');
                }, 3000);

                await loadExistingRequirements(userInfo.UserID);
                await loadProposedTotals(userInfo.UserID);
            }
        } catch (error) {
            console.error("Autosave error:", error);
            setAutoSaveStatus('');
        }
    };

    const loadProposedTotals = async (userId) => {
        try {
            const response = await agent.get(`${API_BASE_URL}/GetProposedTotals`, {
                params: {
                    userId,
                    financialYear: FINANCIAL_YEAR
                }
            });

            if (response.data.Status === "Success") {
                setProposedTotals(response.data.Data[0] || {
                    DistrictItemsCount: 0,
                    DistrictFund: 0,
                    PPPItemsCount: 0,
                    PPPFund: 0,
                    StateItemsCount: 0,
                    StateFund: 0
                });
            }
        } catch (error) {
            console.error("Error loading proposed totals:", error);
        }
    };

    // Initialize component
    const initializeComponent = async () => {
        

        if (userInfo?.UserID) {
            await loadTradeRequirements();

            setTimeout(async () => {
                await loadExistingRequirements(storedUserInfo.UserID);
                await loadProposedTotals(storedUserInfo.UserID);
            }, 500);
        } else {
            Swal.fire({
                title: "Session Error",
                text: "User session not found. Please login again.",
                icon: "error"
            });
        }
    };

    // Load trade requirements
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
                        uniqueItems.push({
                            id: uniqueKey,
                            itemId: item.ItemId,
                            sectorId: item.SectorID,
                            categoryId: item.CategoryId,
                            itemCode: item.ItemCode || 'N/A',
                            name: item.NameofITem || 'Unknown Item',
                            sector: item.SectorName || 'Unknown Sector',
                            category: item.CategoryName || 'Unknown Category',
                            estimatedPrice: item.EstimatedPrice || 0,
                            documentLink: item.SpecificationDocument || '',
                            districtFund: 0,
                            ppp: 0,
                            stateFund: 0
                        });
                    }
                });

                setItems(uniqueItems);
            } else {
                console.error("API returned no data:", response.data);
                setItems([]);
                Swal.fire({
                    title: "No Data Found",
                    text: "No items were found in the database.",
                    icon: "info"
                });
            }
        } catch (error) {
            console.error("Error loading trade requirements:", error);
            handleApiError(error, "Failed to load trade requirements", () => loadTradeRequirements());
            setItems([]);
        } finally {
            setLoadingApi(false);
        }
    };

    // Load existing requirements
    const loadExistingRequirements = async (userId) => {
        try {
            const response = await agent.get(`${API_BASE_URL}/GetUserRequirements`, {
                params: {
                    userId: userId,
                    financialYear: FINANCIAL_YEAR
                }
            });


            if (response.data.Status === "Success") {
                const requirementsData = Array.isArray(response.data.Data) ? response.data.Data : [];
                setExistingRequirements(requirementsData);

                const submitted = checkSubmissionStatus(requirementsData);

                if (requirementsData.length > 0) {
                    setItems(prevItems => {
                        return prevItems.map(item => {
                            const existing = requirementsData.find(req =>
                                req.ItemID === item.itemId &&
                                req.SectorID === item.sectorId &&
                                req.CategoryID === item.categoryId
                            );

                            if (existing) {
                                return {
                                    ...item,
                                    districtFund: existing.DistrictFund || 0,
                                    ppp: existing.PPP || 0,
                                    stateFund: existing.StateFund || 0,
                                    requirementId: existing.ID,
                                    status: existing.Status || ''
                                };
                            }
                            return item;
                        });
                    });

                    if (submitted) {
                        Swal.fire({
                            title: "View Only Mode",
                            text: "These requirements have been submitted and cannot be edited. Please contact DVET (desk 07) to unlock for editing.",
                            icon: "info",
                            confirmButtonText: "OK"
                        });
                    }

                }
            } else {
                console.error("API returned error:", response.data.Message);
                setExistingRequirements([]);
                setIsSubmitted(false);
            }
        } catch (error) {
            console.error("Error loading existing requirements:", error);
            setExistingRequirements([]);
            setIsSubmitted(false);
        }
    };

    // Handle API errors
    const handleApiError = (error, defaultMessage, retryFunction = null) => {
        let errorMessage = defaultMessage;
        if (error.response) {
            errorMessage += ` Server responded with: ${error.response.status} - ${error.response.data?.Message || error.response.statusText}`;
        } else if (error.request) {
            errorMessage += " No response from server. Please check your connection.";
        } else {
            errorMessage += ` ${error.message}`;
        }

        const swalConfig = {
            title: "Error",
            text: errorMessage,
            icon: "error"
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

    // Handle input change
    const handleInputChange = (itemId, field, value) => {
        const numericValue = value === '' ? 0 : parseFloat(value) || 0;

        const updatedItems = items.map(item => {
            if (item.id === itemId) {
                return { ...item, [field]: numericValue };
            }
            return item;
        });

        setItems(updatedItems);
    };

    // Handle document download
    const handleDocumentDownload = (documentUrl, itemName) => {
        if (!documentUrl || documentUrl.trim() === '') {
            Swal.fire({
                title: "Document Not Available",
                text: "No specification document available for this item.",
                icon: "warning"
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
                    icon: "error"
                });
            }
        } catch (error) {
            console.error("Download error:", error);
            Swal.fire({
                title: "Error Opening Document",
                text: "There was an error opening the document. Please try again.",
                icon: "error"
            });
        }
    };

    const getAllItemsWithChanges = () => {
        return itemsWithCalculations.filter(item =>
            (item.total || 0) > 0 || item.requirementId
        );
    };

    // Save requirements
    const handleSave = async () => {
        const itemsToSave = getAllItemsWithChanges();

        if (itemsToSave.length === 0) {
            Swal.fire({
                title: "No Changes to Save",
                text: "No changes detected. Please modify at least one item.",
                icon: "info"
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
                        FinancialYear: FINANCIAL_YEAR,
                        IPAddress: ipAddress
                    };

                    const response = await agent.post(`${API_BASE_URL}/SaveSingleRequirement`, requestData);

                    if (response.data.Status === "Success") {
                        if (response.data.Action === 'DELETED') {
                            deletedCount++;
                        } else {
                            savedCount++;
                        }
                    } else {
                        failedCount++;
                        console.error(`Failed to save item ${item.itemId}:`, response.data.Message);
                    }
                } catch (error) {
                    failedCount++;
                    console.error(`Error saving item ${item.itemId}:`, error);
                }
            }

            await loadExistingRequirements(userInfo.UserID);
            await loadProposedTotals(userInfo.UserID);

            if (savedCount > 0 || deletedCount > 0) {
                lastAutoSaveRef.current = Date.now();
                setHasUnsavedChanges(false);

                let message = '';
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
                    icon: (savedCount + deletedCount) === itemsToSave.length ? "success" : "warning",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    title: "Save Failed",
                    text: "No items were saved successfully.",
                    icon: "error"
                });
            }
        } catch (error) {
            console.error("Error saving:", error);
            Swal.fire({
                title: "Save Failed",
                text: "An error occurred while saving requirements.",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // ==================== UPDATED: Handle Submit with Activity Check ====================
    const handleSubmit = async () => {

        // Check if there are items to submit
        const itemsWithTotal = getItemsWithTotal();
        if (itemsWithTotal.length === 0) {
            Swal.fire({
                title: "No Items to Submit",
                text: "Please add funding amounts to at least one item before submitting.",
                icon: "warning"
            });
            return;
        }

        // Check declaration checkbox
        if (!isDeclared) {
            Swal.fire({
                title: "Declaration Required",
                text: "Please accept the declaration checkbox before submitting.",
                icon: "warning"
            });
            return;
        }

        try {
            // ==================== STEP 1: Check Activity Validity ====================
            const isActivityValid = await checkActivityValidity();

            if (!isActivityValid) {
                Swal.fire({
                    title: "Submission Not Available",
                    text: "This activity is currently not available for submission. The system administrator has disabled this feature. Please contact DVET (desk 07) for more information.",
                    icon: "error",
                    confirmButtonColor: "#d33"
                });
                return;
            }

            // ==================== STEP 2: Fetch Mobile Number ====================
            setLoading(true);

            if (!instituteId) {
                Swal.fire({
                    title: "Institute ID Not Found",
                    text: "Unable to find institute ID. Please try again or contact support.",
                    icon: "error"
                });
                setLoading(false);
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
                const mobileNo = mobileResponse.data.Data[0].MobileNo || "";

                if (!mobileNo) {
                    Swal.fire({
                        title: "Mobile Number Not Found",
                        text: "No mobile number found for management. Please update your profile with the principal's mobile number.",
                        icon: "error"
                    });
                    setLoading(false);
                    return;
                }

                setUserMobile(mobileNo);

                // ==================== STEP 3: Start OTP Verification ====================
                const result = await otpService.startVerification(mobileNo);
                if (!result.success) {
                    Swal.fire({
                        title: "OTP Error",
                        text: result.error || "Failed to send OTP. Please try again.",
                        icon: "error"
                    });
                }
            } else {
                Swal.fire({
                    title: "Mobile Number Not Found",
                    text: "Unable to find mobile number for OTP verification. Please contact system administrator.",
                    icon: "error"
                });
            }
        } catch (error) {
            console.error("❌ Error in submit process:", error);
            handleApiError(error, "Failed to process submission");
        } finally {
            setLoading(false);
        }
    };

    const submitRequirements = async () => {
        const itemsToSave = getAllItemsWithChanges();

        try {
            setLoading(true);
            let submittedCount = 0;
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
                        FinancialYear: FINANCIAL_YEAR,
                        IPAddress: ipAddress,
                        Operation: "SUBMIT"
                    };

                    const response = await agent.post(`${API_BASE_URL}/SaveSingleRequirement`, requestData);

                    if (response.data.Status === "Success") {
                        submittedCount++;
                    } else {
                        failedCount++;
                        console.error(`Failed to submit item ${item.itemId}:`, response.data.Message);
                    }
                } catch (error) {
                    failedCount++;
                    console.error(`Error submitting item ${item.itemId}:`, error);
                }
            }

            await loadExistingRequirements(userInfo.UserID);
            await loadProposedTotals(userInfo.UserID);

            if (submittedCount > 0) {
                Swal.fire({
                    title: "Submit Complete!",
                    text: `Successfully submitted ${submittedCount} items${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
                    icon: submittedCount === itemsToSave.length ? "success" : "warning",
                    timer: 3000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    title: "Submit Failed",
                    text: "No items were submitted successfully.",
                    icon: "error"
                });
            }
        } catch (error) {
            console.error("Error submitting:", error);
            Swal.fire({
                title: "Submit Failed",
                text: "An error occurred while submitting requirements.",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // Table columns configuration
    const tableColumns = [
        {
            key: 'serialNumber',
            header: 'S.N.',
            headerClassName: 'text-center',
            className: 'text-center',
            sortable: false,
            width: '60px'
        },
        {
            key: 'itemCode',
            header: 'Item Code',
            headerClassName: 'text-center',
            className: 'text-center',
            width: '100px'
        },
        {
            key: 'name',
            header: 'Name of Item',
            type: 'custom',
            headerClassName: 'text-left',
            className: 'text-left',
            width: '300px',

        },
        {
            key: 'sector',
            header: 'Sector',
            headerClassName: 'text-center',
            className: 'text-center',
            width: '120px'
        },
        {
            key: 'category',
            header: 'Category',
            headerClassName: 'text-center',
            className: 'text-center',
            width: '140px'
        },
        {
            key: 'estimatedPrice',
            header: 'Estimated Price',
            type: 'currency',
            headerClassName: 'text-right',
            className: 'text-center',
            width: '120px'
        },
        {
            key: 'districtFund',
            header: 'Proposed in District Fund',
            type: isSubmitted ? 'text' : 'input',
            inputType: 'number',
            min: 0,
            step: 1,
            placeholder: '0',
            headerClassName: 'text-center bg-pink-200',
            className: 'text-center',
            sortable: false,
            width: '120px',
            readonly: isSubmitted
        },
        {
            key: 'ppp',
            header: 'Proposed in PPP',
            type: isSubmitted ? 'text' : 'input',
            inputType: 'number',
            min: 0,
            step: 1,
            placeholder: '0',
            headerClassName: 'text-center bg-yellow-200',
            className: 'text-center',
            sortable: false,
            width: '110px',
            readonly: isSubmitted
        },
        {
            key: 'stateFund',
            header: 'Proposed in State Fund',
            type: isSubmitted ? 'text' : 'input',
            inputType: 'number',
            min: 0,
            step: 1,
            placeholder: '0',
            headerClassName: 'text-center bg-green-200',
            className: 'text-center',
            sortable: false,
            width: '120px',
            readonly: isSubmitted
        },
        {
            key: 'total',
            header: 'Total',
            type: 'currency',
            headerClassName: 'text-center bg-purple-100',
            className: 'text-center font-semibold',
            width: '100px'
        }
    ];

    const renderCell = (item, column, rowIndex) => {
        if ((column.key === 'itemCode' || column.key === 'name') && isRowFullyFilled(item)) {
            return (
                <span className="text-green-500 font-semibold">
                    {item[column.key]}
                </span>
            );
        }

        if (isSubmitted && (column.key === 'districtFund' || column.key === 'ppp' || column.key === 'stateFund')) {
            return (
                <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {item[column.key] || 0}
                </span>
            );
        }

        if (column.key === 'sector') {
            return (
                <button
                    onClick={() => handleDocumentDownload(item.documentLink, item.sector)}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-center w-full"
                    title="Click to download specification document"
                    disabled={!item.documentLink || item.documentLink.trim() === ''}
                >
                    {item.sector}
                </button>
            );
        }
        return undefined;
    };

    // Add serial number and total calculation
    const itemsWithCalculations = items.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
        total: (item.districtFund || 0) + (item.ppp || 0) + (item.stateFund || 0)
    }));

    // Get items with total > 0
    const getItemsWithTotal = () => {
        return itemsWithCalculations.filter(item => (item.total || 0) > 0);
    };

    // Filter for export
    const exportFilter = (data) => {
        return data.filter(item => (item.total || 0) > 0);
    };

    const downloadExcelTemplate = () => {
        try {
            const exporter = getExporter();
            exporter.exportExcelTemplate(items);
        } catch (error) {
            Swal.fire({
                title: "Export Failed",
                text: error.message,
                icon: "warning"
            });
        }
    };

    const handlePrintReport = () => {
        try {
            const exporter = getExporter();
            const status = existingRequirements[0]?.Status;
            const submissionDate = status === "Submitted" ? existingRequirements[0]?.SubmissionDate : "";
            exporter.exportToPDF(itemsWithCalculations, submissionDate);
        } catch (error) {
            console.error("Print report error:", error);
            Swal.fire({
                title: "Export Failed",
                text: error.message || "Failed to generate print report",
                icon: "warning"
            });
        }
    };

    const downloadCSV = () => {
        try {
            const exporter = getExporter();
            exporter.exportToExcel(items, existingRequirements[0]?.SubmissionDate || '');
        } catch (error) {
            Swal.fire({
                title: "Export Failed",
                text: error.message,
                icon: "warning"
            });
        }
    };

    const downloadPDF = () => {
        try {
            const exporter = getExporter();
            exporter.exportToPDF(items, existingRequirements[0]?.SubmissionDate || '');
        } catch (error) {
            Swal.fire({
                title: "Export Failed",
                text: error.message,
                icon: "warning"
            });
        }
    };

    return (
        <div className="space-y-6 p-4">
            <fieldset className="rounded border border-gray-300 p-4">
                <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Trade Requirements - All Items
                    </div>
                </legend>

                {/* AUTOSAVE INDICATOR */}
                {!isSubmitted && (
                    <div className="flex justify-end items-center mb-2">
                        {autoSaveStatus === 'saving' && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Saving...</span>
                            </div>
                        )}
                        {autoSaveStatus === 'saved' && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Auto saved</span>
                            </div>
                        )}
                        {autoSaveStatus === '' && hasUnsavedChanges && (
                            <div className="text-sm text-red-500">
                                <span>Unsaved changes</span>
                            </div>
                        )}
                    </div>
                )}

                {isSubmitted && (
                    <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">
                                    This data has been submitted and is in <strong>View Only Mode</strong>.
                                    To make changes, please contact DVET (desk 07) to unlock the data.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Container with Financial Year Dropdown and Fund Cards */}
                <div className="p-4 rounded-lg mb-6 border border-gray-300 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                        {/* Financial Year Dropdown */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <DropdownComponent
                                    label="Financial Year"
                                    options={financialYearOptions}
                                    value={selectedFinancialYear}
                                    onChange={handleFinancialYearChange}
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
                                        <div className="font-bold text-pink-800 text-lg">Proposed in District Fund</div>
                                        <div className="bg-pink-100 rounded-full p-2">
                                            <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Items:</span>
                                            <span className="font-semibold text-pink-700 bg-pink-100 px-2 py-1 rounded">
                                                {realTimeTotals.DistrictItemsCount}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Amount:</span>
                                            <span className="font-semibold text-pink-700">
                                                ₹{realTimeTotals.DistrictFundAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-pink-200 pt-2">
                                            <span className="text-gray-600">Available Fund:</span>
                                            <span className="font-semibold text-pink-800 bg-pink-200 px-2 py-1 rounded">
                                                ₹{availableFund.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* PPP Card */}
                                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="font-bold text-yellow-800 text-lg">Proposed in PPP Fund</div>
                                        <div className="bg-yellow-100 rounded-full p-2">
                                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Items:</span>
                                            <span className="font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                                                {realTimeTotals.PPPItemsCount}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Amount:</span>
                                            <span className="font-semibold text-yellow-700">
                                                ₹{realTimeTotals.PPPFundAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-yellow-200 pt-2">
                                            <span className="text-gray-600">Available Fund:</span>
                                            <span className="font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded">
                                                ₹{pppAvailableFund.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* State Fund Card */}
                                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="font-bold text-green-800 text-lg">Proposed in State Fund</div>
                                        <div className="bg-green-100 rounded-full p-2">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Items:</span>
                                            <span className="font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                                                {realTimeTotals.StateItemsCount}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Amount:</span>
                                            <span className="font-semibold text-green-700">
                                                ₹{realTimeTotals.StateFundAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-green-200 pt-2">
                                            <span className="text-gray-600">Available Fund:</span>
                                            <span className="font-semibold text-green-800 bg-green-200 px-2 py-1 rounded">
                                                ₹{0}
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
                        <p className="mt-2 text-gray-600">Loading all trade requirements...</p>
                    </div>
                )}

                {/* No Data State */}
                {!loadingApi && items.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No trade requirements found. Please check your database connection.</p>
                        <Button
                            variant="outlined"
                            onClick={loadTradeRequirements}
                            className="mt-4"
                        >
                            Retry Loading
                        </Button>
                    </div>
                )}

                {/* Filtered Table Component */}
                {!loadingApi && items.length > 0 && (
                    <FilteredTableComponent
                        data={itemsWithCalculations}
                        columns={tableColumns}
                        filterColumns={['sector', 'category', 'name']}
                        onRowChange={isSubmitted ? null : handleInputChange}
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
                    {/* Checkbox */}
                    <div className="mt-4 flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="declaration"
                            className="mt-1 h-4 w-4 cursor-pointer"
                            checked={isDeclared}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setIsDeclared(checked);
                            }}
                            disabled={isSubmitted}
                        />
                        <label
                            htmlFor="declaration"
                            className="text-sm text-blue-800 cursor-pointer"
                        >
                            I hereby declare that the above information is true and correct to the best of my knowledge.
                        </label>
                    </div>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700">
                        <li>The demand has been proposed for sanctioned affiliated and to be affiliated CTS units.</li>
                        <li>The demand covers 652 units sanctioned vide Government of Maharashtra resolution dated 22.06.2023.</li>
                        <li>The demand is based as per norms for CTS Trades.</li>
                        <li>
                            The institute has planned to create common facilities as CNC Lab, Computer Lab,
                            Drawing Hall, Library, Class Room, Store Room, Office, Conference Room,
                            Seminar Hall, etc. for optimum utilization of resources.
                        </li>
                        <li>The demand is placed after utilization of existing available training infrastructure.</li>
                        <li>
                            The institute has taken necessary administrative approval for procurement
                            through DPDC fund and IMC approval for procurement through PPP fund.
                        </li>
                        <li>
                            The demand also covers training infrastructure required for Short Term Training (STEP).
                        </li>
                    </ol>
                </div>

                <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">
                        <span className="font-medium">Note:</span>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>Click on <span className="font-medium">"Submit"</span> button to Submit Information to Regional Office and Head Office.</li>
                            <li>OTP confirmation on Head of Institute/ Principal/Director Primary Mobile Number required to submit filled information.</li>
                            <li>Information once submitted shall not be available for editing.</li>
                            <li>Contact DVET (desk 07) to unlock information and resubmission.</li>
                        </ol>
                    </p>
                </div>

                {/* ==================== Action Buttons ==================== */}
                {!loadingApi && items.length > 0 && (
                    <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
                        {/* Save Button */}
                        <button
                            className="bg-green-600 text-white px-6 py-2 font-bold rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSave}
                            disabled={loading || isSubmitted}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>

                        {/* Submit Button */}
                        <button
                            className="bg-blue-600 text-white px-6 py-2 font-bold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            disabled={
                                !isDeclared ||
                                loading ||
                                isSubmitted ||
                                checkingActivity
                            }
                            title={
                                checkingActivity
                                    ? "Checking activity status..."
                                    : !isDeclared
                                        ? "Please accept the declaration checkbox above"
                                        : "Click to submit requirements"
                            }
                        >
                            {loading ? "Submitting..." : checkingActivity ? "Checking..." : "Submit"}
                        </button>
                    </div>
                )}

            </fieldset>

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                <div ref={printRef} className="p-4">
                    <h1 className="text-2xl font-bold text-center mb-4">Trade Requirements - Financial Year {FINANCIAL_YEAR}</h1>
                    {userInfo.UserName && (
                        <p className="text-center mb-4">Prepared by: {userInfo.UserName}</p>
                    )}
                    <table className="min-w-full border-collapse border border-gray-300 text-sm">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-2 py-2 bg-gray-100">S.N.</th>
                                <th className="border border-gray-300 px-2 py-2 bg-gray-100">Item Code</th>
                                <th className="border border-gray-300 px-2 py-2 bg-gray-100">Name of Item</th>
                                <th className="border border-gray-300 px-2 py-2 bg-gray-100">Sector</th>
                                <th className="border border-gray-300 px-2 py-2 bg-gray-100">Category</th>
                                <th className="border border-gray-300 px-2 py-2 bg-gray-100">Estimated Price</th>
                                <th className="border border-gray-300 px-2 py-2 bg-gray-100">District Fund</th>
                                <th className="border border-gray-300 px-2 py-2 bg-gray-100">PPP</th>
                                <th className="border border-gray-300 px-2 py-2 bg-gray-100">State Fund</th>
                                <th className="border border-gray-300 px-2 py-2 bg-gray-100">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getItemsWithTotal().map((item, index) => (
                                <tr key={item.id}>
                                    <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                                    <td className="border border-gray-300 px-2 py-2">{item.itemCode || 'N/A'}</td>
                                    <td className="border border-gray-300 px-2 py-2">{item.name}</td>
                                    <td className="border border-gray-300 px-2 py-2">{item.sector}</td>
                                    <td className="border border-gray-300 px-2 py-2">{item.category}</td>
                                    <td className="border border-gray-300 px-2 py-2 text-right">{item.estimatedPrice.toLocaleString()}</td>
                                    <td className="border border-gray-300 px-2 py-2 text-center">{(item.districtFund || 0).toLocaleString()}</td>
                                    <td className="border border-gray-300 px-2 py-2 text-center">{(item.ppp || 0).toLocaleString()}</td>
                                    <td className="border border-gray-300 px-2 py-2 text-center">{(item.stateFund || 0).toLocaleString()}</td>
                                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold">
                                        {item.total.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 text-sm text-gray-600">
                        <p>Generated on: {new Date().toLocaleString()}</p>
                        <p>Total Items with Requirements: {getItemsWithTotal().length}</p>
                        <p>Total Amount: ₹{getItemsWithTotal().reduce((sum, item) => sum + item.total, 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradeRequirements;
