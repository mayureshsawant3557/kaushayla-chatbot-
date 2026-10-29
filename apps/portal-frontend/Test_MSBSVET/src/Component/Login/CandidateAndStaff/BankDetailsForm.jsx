import { useState, useEffect, useContext } from 'react';
import agent from '../../../lib/api/agent';
import FormComponent from '../../FormComponent/FormComponent';
import UploadPdf from '../../formcomponent/UploadPdf';
import ProgressTracker from './ProgressTracker';
import { RazorApi } from '../../../Endpoints_All/External/ifsc';
import Swal from 'sweetalert2';
import {
    SaveCandidateBank,
    GetCandidateBank,
    getIFSCDetails
} from '../../../Endpoints_All/Candidate/bank';
import {
    GetStaffBank,
    SaveStaffBank
} from '../../../Endpoints_All/Staff/bank';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLoading } from "../../../Hooks/useLoading";
import { getDeviceIP } from '../../../utils/CommonHelper';
import { useAuth } from '../../../Hooks/AuthContext';
import { CheckCandidateURL } from '../../../Endpoints_All/Candidate/summary';
import { CheckStaffURL } from '../../../Endpoints_All/Staff/summary';
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import VerifiedIcon from "../../../assets/VerifiedIcon.jpg"
export const BankDetailsForm = () => {
    // State for form fields
    const [hasAccount, setHasAccount] = useState(null); // null, 'Yes', 'No', 'Skip'
    const [hasPAN, setHasPAN] = useState(null); // null, 'Yes', 'No', 'Skip'
    const [accountType, setAccountType] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolderName, setAccountHolderName] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [branchName, setBranchName] = useState('');
    const [passbook, setPassbook] = useState(null);
    const [passbookPath, setPassbookPath] = useState('');
    const [panNumber, setPanNumber] = useState('');
    const [panCard, setPanCard] = useState(null);
    const [panCardPath, setPanCardPath] = useState('');
    const { color } = useContext(ThemeContext);

    const [saveSuccess, setSaveSuccess] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { userInfo } = useAuth();
    const userTypeID = Number(userInfo?.UserTypeID);

    const candidateIdFromUrl = searchParams.get("candidateId");
    const applicationId = searchParams.get("applicationId");

    const isInstituteUser = userTypeID === 61;
    const effectiveCandidateId =
        userTypeID === 61
            ? candidateIdFromUrl
            : userInfo?.UserID;


    // State for errors
    const [errors, setErrors] = useState({});

    // Initialize useLoading hook
    const { startLoading, stopLoading, isLoading } = useLoading();

    // State for IFSC verification
    const [isVerifyingIFSC, setIsVerifyingIFSC] = useState(false);
    const [ifscVerified, setIfscVerified] = useState(false);
    const [ipAddress, setIpAddress] = useState('');

    // Safe AI Assistant Autofill event listener for Bank Details
    useEffect(() => {
        const handleAutofill = (e) => {
            if (!e || !e.detail) return;
            const d = e.detail;

            if (d.hasAccount) setHasAccount(d.hasAccount);
            if (d.accountType) setAccountType(d.accountType);
            if (d.accountNumber) setAccountNumber(d.accountNumber);
            if (d.accountHolderName) setAccountHolderName(d.accountHolderName);
            if (d.ifscCode) setIfscCode(d.ifscCode);
            if (d.bankName) setBankName(d.bankName);
            if (d.branchName) setBranchName(d.branchName);
            if (d.panNumber) setPanNumber(d.panNumber);
            if (d.hasPAN) setHasPAN(d.hasPAN);
        };

        window.addEventListener('msbsvet:autofill', handleAutofill);
        return () => window.removeEventListener('msbsvet:autofill', handleAutofill);
    }, []);

    // ✅ Separate state to preserve bank and PAN data when toggling options
    const [savedBankData, setSavedBankData] = useState({
        accountType: '',
        accountNumber: '',
        accountHolderName: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        passbook: null,
        passbookPath: '',
        ifscVerified: false
    });

    const [savedPANData, setSavedPANData] = useState({
        panNumber: '',
        panCard: null,
        panCardPath: ''
    });

    // Store initial form data for reset functionality
    const [initialFormData, setInitialFormData] = useState({
        hasAccount: null,
        hasPAN: null,
        accountType: '',
        accountNumber: '',
        accountHolderName: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        passbook: null,
        passbookPath: '',
        panNumber: '',
        panCard: null,
        panCardPath: '',
        ifscVerified: false
    });

    // Get user info once

    const formType =
        candidateIdFromUrl
            ? 'Candidate'
            : userTypeID === 91
                ? 'Candidate'
                : 'Staff';

    const UserType = formType;
    const userLoginID = userInfo.UserLoginID;
    const loggedInUserID = userInfo.UserID;

    const userID =
        candidateIdFromUrl || loggedInUserID;

    // Determine API endpoints and key based on form type
    const API_ENDPOINTS = {
        Candidate: {
            get: GetCandidateBank,
            save: SaveCandidateBank,
            userTypeIDName: 'CandidateID'
        },
        Staff: {
            get: GetStaffBank,
            save: SaveStaffBank,
            userTypeIDName: 'StaffID'
        }
    };

    const currentEndpoints = API_ENDPOINTS[formType] || API_ENDPOINTS.Candidate;

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
    };

    const checkCandidateStaffURL = async () => {
        if (!userID) {
            return;
        }
        if (userTypeID === 61) {
            return;
        }
        let response;
        if (userTypeID == 91) {
            debugger;
            response = await agent.get(`${CheckCandidateURL}?candidateId=${userID}&pageCode=Bank&userLoginId=${userLoginID}`);
        } else if (userTypeID == 95) {
            debugger;
            const payLoad = {
                staffID: userID,
                userLoginID: userLoginID,
                pageCode: 'Bank',
                ipAddress: ipAddress

            }
            response = await agent.post(CheckStaffURL, payLoad);
        }

        let IsRightURL;
        let RightURL;
        if (response?.data?.Status == 'Success' && response?.data?.Data) {
            IsRightURL = response?.data?.Data?.IsRightURL;
            RightURL = response?.data?.Data?.RightURL;
        }
        if (IsRightURL === false && RightURL) {
            navigate(RightURL);
        }
    }

    // ✅ Helper function to check if value is valid (not null, empty, or "string" placeholder)
    const isValidValue = (value) => {
        if (!value) return false;
        if (typeof value === 'string') {
            const trimmedValue = value.trim().toLowerCase();
            // Check for empty or "string" placeholder or "-1"
            if (trimmedValue === '' || trimmedValue === 'string' || trimmedValue === '-1') return false;
        }
        return true;
    };

    // Custom Radio Button Component
    const RadioButton = ({ name, value, checked, onChange, label }) => {
        return (
            <label className="flex cursor-pointer items-center">
                <div className="relative">
                    <input
                        type="radio"
                        name={name}
                        checked={checked}
                        onChange={onChange}
                        className="sr-only" />
                    <div className={`w-5 h-5 border-2 rounded-full ${checked ? 'border-sky-500' : 'border-gray-300'} flex items-center justify-center`}>
                        {checked && <div className="h-3 w-3 rounded-full bg-sky-500"></div>}
                    </div>
                </div>
                <span className="ml-2">{label}</span>
            </label>
        );
    };

    useEffect(() => {
        fetchIP();
        checkCandidateStaffURL();

    }, []);


    // Fetch bank details on component mount only once
    useEffect(() => {
        if (!dataFetched && userID) {
            const fetchBankDetails = async () => {
                try {
                    startLoading();
                    let response;

                    if (UserType === 'Candidate') {
                        response = await agent.get(`${currentEndpoints.get}${userID}`);
                    } else {
                        // Staff - POST request
                        response = await agent.post(currentEndpoints.get, {
                            StaffID: userID,
                            UserLoginID: userLoginID,
                            PageCode: "Bank",
                            IPAddress: ipAddress
                        });
                    }


                    if (response.data.Status === "Success" && response.data.Data) {
                        const data = response.data.Data;

                        // ✅ Determine hasAccount status from IsBankAcount field (supports 1/0/-1 and text)
                        let accountStatus = null;
                        if (data.IsBankAcount !== null && data.IsBankAcount !== undefined) {
                            const raw = data.IsBankAcount;
                            const numVal = typeof raw === 'number' ? raw : parseInt(raw, 10);

                            if (!isNaN(numVal)) {
                                if (numVal === 1) accountStatus = 'Yes';
                                else if (numVal === 0) accountStatus = 'No';
                                else if (numVal === -1) accountStatus = 'Skip';
                            } else {
                                const bankStatus = String(raw).trim().toLowerCase();
                                if (bankStatus.startsWith('y')) accountStatus = 'Yes';
                                else if (bankStatus.startsWith('n')) accountStatus = 'No';
                                else if (bankStatus.startsWith('s') && bankStatus.includes('k')) accountStatus = 'Skip';
                            }
                        }

                        // ✅ Determine hasPAN status from IsPANDetails field (supports 1/0/-1 and text)
                        let panStatus = null;
                        if (data.IsPANDetails !== null && data.IsPANDetails !== undefined) {
                            const raw = data.IsPANDetails;
                            const numVal = typeof raw === 'number' ? raw : parseInt(raw, 10);

                            if (!isNaN(numVal)) {
                                if (numVal === 1) panStatus = 'Yes';
                                else if (numVal === 0) panStatus = 'No';
                                else if (numVal === -1) panStatus = 'Skip';
                            } else {
                                const panStatusVal = String(raw).trim().toLowerCase();
                                if (panStatusVal.startsWith('y')) panStatus = 'Yes';
                                else if (panStatusVal.startsWith('n')) panStatus = 'No';
                                else if (panStatusVal.startsWith('s') && panStatusVal.includes('k')) panStatus = 'Skip';
                            }
                        }

                        // ✅ Only set bank account fields if status is "Yes" AND values are valid AND AccountType is not "-1"
                        let bankAccountData = {
                            accountType: '',
                            accountNumber: '',
                            accountHolderName: '',
                            ifscCode: '',
                            bankName: '',
                            branchName: '',
                            passbookPath: '',
                            ifscVerified: false
                        };

                        // ✅ Skip if AccountType is "-1"
                        if (accountStatus === 'Yes' && data.AccountType !== "-1") {
                            // Only populate if actual data exists (not "string" placeholder)
                            if (isValidValue(data.AccountType)) {
                                bankAccountData.accountType = data.AccountType;
                            }
                            if (isValidValue(data.AccountNo)) {
                                bankAccountData.accountNumber = data.AccountNo;
                            }
                            if (isValidValue(data.AccountHolderName)) {
                                bankAccountData.accountHolderName = data.AccountHolderName;
                            }
                            if (isValidValue(data.IFSCCode)) {
                                bankAccountData.ifscCode = data.IFSCCode;
                            }
                            if (isValidValue(data.BankName)) {
                                bankAccountData.bankName = data.BankName;
                            }
                            if (isValidValue(data.BranchName)) {
                                bankAccountData.branchName = data.BranchName;
                            }
                            if (isValidValue(data.CancelChequePath)) {
                                bankAccountData.passbookPath = data.CancelChequePath;
                            }

                            // Set IFSC verified if we have all three fields
                            bankAccountData.ifscVerified = Boolean(
                                bankAccountData.bankName &&
                                bankAccountData.branchName &&
                                bankAccountData.ifscCode
                            );
                        }

                        // ✅ Only set PAN fields if status is "Yes" AND values are valid
                        let panData = {
                            panNumber: '',
                            panCardPath: ''
                        };

                        if (panStatus === 'Yes') {
                            // Only populate if actual data exists (not "string" placeholder)
                            if (isValidValue(data.PANNo)) {
                                panData.panNumber = data.PANNo;
                            }
                            if (isValidValue(data.PANPath)) {
                                panData.panCardPath = data.PANPath;
                            }
                        }

                        // ✅ Create form data object
                        const formData = {
                            ...bankAccountData,
                            ...panData,
                            passbook: bankAccountData.passbookPath ? bankAccountData.passbookPath : '',
                            panCard: panData.panCardPath ? panData.panCardPath : '',
                            hasAccount: accountStatus,
                            hasPAN: panStatus
                        };


                        // Set form data
                        setAccountType(formData.accountType);
                        setAccountNumber(formData.accountNumber);
                        setAccountHolderName(formData.accountHolderName);
                        setIfscCode(formData.ifscCode);
                        setBankName(formData.bankName);
                        setBranchName(formData.branchName);
                        setPanNumber(formData.panNumber);
                        setPassbook(formData.passbook);
                        setPassbookPath(formData.passbookPath);
                        setPanCard(formData.panCard);
                        setPanCardPath(formData.panCardPath);
                        setHasAccount(formData.hasAccount);
                        setHasPAN(formData.hasPAN);
                        setIfscVerified(formData.ifscVerified);

                        // ✅ Save bank and PAN data separately for preservation
                        setSavedBankData({
                            accountType: formData.accountType,
                            accountNumber: formData.accountNumber,
                            accountHolderName: formData.accountHolderName,
                            ifscCode: formData.ifscCode,
                            bankName: formData.bankName,
                            branchName: formData.branchName,
                            passbook: formData.passbook,
                            passbookPath: formData.passbookPath,
                            ifscVerified: formData.ifscVerified
                        });

                        setSavedPANData({
                            panNumber: formData.panNumber,
                            panCard: formData.panCard,
                            panCardPath: formData.panCardPath
                        });

                        // Save initial form data for reset functionality
                        setInitialFormData(formData);
                    }

                    setDataFetched(true);
                } catch (error) {
                    console.error("Error fetching bank details:", error);

                    // Handle 404 specifically
                    if (error.response && error.response.status === 404) {
                    }

                    setDataFetched(true);
                } finally {
                    stopLoading();
                }
            };

            fetchBankDetails();
        }
    }, [userID]);

    // ✅ Handle Bank Account selection change - PRESERVE DATA
    const handleAccountChange = (value) => {
        // Save current bank data before changing selection (if user entered any)
        if (hasAccount === 'Yes' && (accountType || accountNumber || accountHolderName || ifscCode)) {
            setSavedBankData({
                accountType,
                accountNumber,
                accountHolderName,
                ifscCode,
                bankName,
                branchName,
                passbook,
                passbookPath,
                ifscVerified
            });
        }

        setHasAccount(value);

        // ✅ Restore saved data when user selects "Yes" again
        if (value === 'Yes') {
            // Restore from saved data
            setAccountType(savedBankData.accountType);
            setAccountNumber(savedBankData.accountNumber);
            setAccountHolderName(savedBankData.accountHolderName);
            setIfscCode(savedBankData.ifscCode);
            setBankName(savedBankData.bankName);
            setBranchName(savedBankData.branchName);
            setPassbook(savedBankData.passbook);
            setPassbookPath(savedBankData.passbookPath);
            setIfscVerified(savedBankData.ifscVerified);
        } else if (value === 'No' || value === 'Skip') {
            // Clear display but keep data in savedBankData
            setAccountType('');
            setAccountNumber('');
            setAccountHolderName('');
            setIfscCode('');
            setBankName('');
            setBranchName('');
            setPassbook(null);
            setPassbookPath('');
            setIfscVerified(false);
        }

        // Clear errors
        setErrors(prev => ({
            ...prev,
            accountType: null,
            accountNumber: null,
            accountHolderName: null,
            ifscCode: null,
            bankName: null,
            branchName: null,
            passbook: null
        }));

    };

    // ✅ Handle PAN selection change - PRESERVE DATA
    const handlePANChange = (value) => {
        // Save current PAN data before changing selection (if user entered any)
        if (hasPAN === 'Yes' && (panNumber || panCardPath)) {
            setSavedPANData({
                panNumber,
                panCard,
                panCardPath
            });
        }

        setHasPAN(value);

        // ✅ Restore saved data when user selects "Yes" again
        if (value === 'Yes') {
            // Restore from saved data
            setPanNumber(savedPANData.panNumber);
            setPanCard(savedPANData.panCard);
            setPanCardPath(savedPANData.panCardPath);
        } else if (value === 'No' || value === 'Skip') {
            // Clear display but keep data in savedPANData
            setPanNumber('');
            setPanCard(null);
            setPanCardPath('');
        }

        // Clear errors
        setErrors(prev => ({
            ...prev,
            panNumber: null,
            panCard: null
        }));

    };

    // Function to reset form to initial values
    const handleReset = () => {
        setHasAccount(initialFormData.hasAccount);
        setHasPAN(initialFormData.hasPAN);
        setAccountType(initialFormData.accountType);
        setAccountNumber(initialFormData.accountNumber);
        setAccountHolderName(initialFormData.accountHolderName);
        setIfscCode(initialFormData.ifscCode);
        setBankName(initialFormData.bankName);
        setBranchName(initialFormData.branchName);
        setPassbook(initialFormData.passbook);
        setPassbookPath(initialFormData.passbookPath);
        setPanNumber(initialFormData.panNumber);
        setPanCard(initialFormData.panCard);
        setPanCardPath(initialFormData.panCardPath);
        setIfscVerified(initialFormData.ifscVerified);

        // ✅ Also reset saved data to initial values
        setSavedBankData({
            accountType: initialFormData.accountType,
            accountNumber: initialFormData.accountNumber,
            accountHolderName: initialFormData.accountHolderName,
            ifscCode: initialFormData.ifscCode,
            bankName: initialFormData.bankName,
            branchName: initialFormData.branchName,
            passbook: initialFormData.passbook,
            passbookPath: initialFormData.passbookPath,
            ifscVerified: initialFormData.ifscVerified
        });

        setSavedPANData({
            panNumber: initialFormData.panNumber,
            panCard: initialFormData.panCard,
            panCardPath: initialFormData.panCardPath
        });

        setErrors({});
    };

    // Function to convert file to base64
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const handlePanCardChange = (fileData) => {
        const newPanCard = {
            filePath: fileData.filePath,
            fileName: fileData.fileName,
            uniqueFileName: fileData.uniqueFileName,
            file: fileData.file
        };
        setPanCard(newPanCard);
        setPanCardPath(fileData.filePath);

        // ✅ Update saved data as well
        setSavedPANData(prev => ({
            ...prev,
            panCard: newPanCard,
            panCardPath: fileData.filePath
        }));

        if (errors.panCard) {
            setErrors(prev => ({ ...prev, panCard: null }));
        }
    };

    const handlePassbookChange = (fileData) => {
        const newPassbook = {
            filePath: fileData.filePath,
            fileName: fileData.fileName,
            uniqueFileName: fileData.uniqueFileName,
            file: fileData.file
        };
        setPassbook(newPassbook);
        setPassbookPath(fileData.filePath);

        // ✅ Update saved data as well
        setSavedBankData(prev => ({
            ...prev,
            passbook: newPassbook,
            passbookPath: fileData.filePath
        }));

        if (errors.passbook) {
            setErrors(prev => ({ ...prev, passbook: null }));
        }
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation logic
        const newErrors = {};

        // Check if bank account option is selected
        if (hasAccount === null) {
            newErrors.hasAccount = "Please select bank account option";
        }

        // Check if PAN option is selected
        if (hasPAN === null && UserType === 'Staff') {
            newErrors.hasPAN = "Please select PAN details option";
        }

        // Validate bank details only if "Yes" is selected
        if (hasAccount === 'Yes') {
            if (!accountType) newErrors.accountType = "Required";
            if (!accountNumber) newErrors.accountNumber = "Required";
            if (!accountHolderName) newErrors.accountHolderName = "Required";
            if (!ifscCode) newErrors.ifscCode = "Required";
            if (!ifscVerified) newErrors.ifscCode = "IFSC code must be verified";
            if (!bankName) newErrors.bankName = "Required";
            if (!branchName) newErrors.branchName = "Required";
            // if (!passbook && !passbookPath) {
            //     newErrors.passbook = 'Bank Passbook Cover Page / Cheque is required';
            // }
        }

        // Validate PAN details only if "Yes" is selected
        if (hasPAN === 'Yes') {
            if (!panNumber) newErrors.panNumber = "Required";
            if (!panCard && !panCardPath) {
                newErrors.panCard = 'PAN Card is required';
            }
        }

        setErrors(newErrors);

        // If no errors, submit form
        if (Object.keys(newErrors).length === 0) {
            try {
                startLoading();

                let requestData = {};

                // Base structure for both Candidate and Staff
                requestData = {
                    UserLoginID: userLoginID,
                    IPAddress: ipAddress,
                    PageCode: "Bank",
                    IsBankAcount: hasAccount === 'Yes' ? 1 : hasAccount === 'No' ? 0 : -1,
                    IsPANDetails: hasPAN === 'Yes' ? 1 : hasPAN === 'No' ? 0 : -1
                };

                // Add user ID based on form type
                if (UserType === 'Candidate') {
                    requestData.CandidateID = userID;
                } else {
                    requestData.StaffID = userID;
                }

                // ✅ Handle Bank Account data based on selection (skip if accountType would be -1)
                if (hasAccount === 'Yes' && accountType !== '-1' && accountType !== '') {
                    // Send filled data when Yes is selected
                    requestData.AccountType = accountType;
                    requestData.AccountNo = accountNumber;
                    requestData.AccountHolderName = accountHolderName;
                    requestData.IFSCCode = ifscCode;
                    requestData.BankName = bankName;
                    requestData.BranchName = branchName;

                    // Handle passbook file upload
                    if (passbook && passbook.file) {
                        // New file upload - send base64
                        try {
                            const base64Passbook = await convertFileToBase64(passbook.file);
                            requestData.CancelCheque = base64Passbook;
                            requestData.CancelChequeName = passbook.fileName;
                            requestData.CancelChequePath = passbookPath || "string";
                        } catch (error) {
                            console.error("Error converting passbook to base64:", error);
                            throw new Error("Error processing passbook file");
                        }
                    } else if (passbookPath && passbookPath !== '') {
                        // Existing file path (blob URL) - only send path
                        requestData.CancelChequePath = passbookPath;
                    } else {
                        // No file at all - send placeholder
                        requestData.CancelChequePath = "string";
                    }
                } else {
                    // Send "string" placeholder for No/Skip
                    requestData.AccountType = "";
                    requestData.AccountNo = "";
                    requestData.AccountHolderName = "";
                    requestData.IFSCCode = "";
                    requestData.BankName = "";
                    requestData.BranchName = "";
                    requestData.CancelChequePath = "";
                }

                // ✅ Handle PAN data based on selection
                if (hasPAN === 'Yes') {
                    // Send filled data when Yes is selected
                    requestData.PANNo = panNumber;

                    // Handle PAN card file upload
                    if (panCard && panCard.file) {
                        // New file upload - send base64
                        try {
                            const base64PanCard = await convertFileToBase64(panCard.file);
                            requestData.PAN = base64PanCard;
                            requestData.PANName = panCard.fileName;
                            requestData.PANPath = panCardPath || "";
                        } catch (error) {
                            console.error("Error converting PAN card to base64:", error);
                            throw new Error("Error processing PAN card file");
                        }
                    } else if (panCardPath && panCardPath !== '') {
                        // Existing file path (blob URL) - only send path
                        requestData.PANPath = panCardPath;
                    } else {
                        // No file at all - send placeholder
                        requestData.PANPath = "";
                    }
                } else {
                    // Send "string" placeholder for No/Skip
                    requestData.PANNo = "";
                    requestData.PANPath = "";
                }


                // Submit the form data with error handling for 404
                const response = await agent.post(currentEndpoints.save, requestData, {
                    validateStatus: function (status) {
                        return (status >= 200 && status < 300) || status === 404;
                    }
                });


                // Handle 404 error specifically
                if (response.status === 404) {
                    throw new Error("API endpoint not found (404). Please check the endpoint URL.");
                }

                if (response.data.Status === "Success") {

                    // Update initial form data with new values
                    const newInitialData = {
                        hasAccount,
                        hasPAN,
                        accountType,
                        accountNumber,
                        accountHolderName,
                        ifscCode,
                        bankName,
                        branchName,
                        passbook,
                        passbookPath,
                        panNumber,
                        panCard,
                        panCardPath,
                        ifscVerified
                    };

                    setInitialFormData(newInitialData);

                    // ✅ Update saved data as well
                    setSavedBankData({
                        accountType,
                        accountNumber,
                        accountHolderName,
                        ifscCode,
                        bankName,
                        branchName,
                        passbook,
                        passbookPath,
                        ifscVerified
                    });

                    setSavedPANData({
                        panNumber,
                        panCard,
                        panCardPath
                    });

                    // Show success message
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: response.data.Message || 'Bank details saved successfully.',
                        confirmButtonText: 'Continue'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Navigate to next page
                            if (isInstituteUser && candidateIdFromUrl) {
                                navigate(
                                    `/Candidate/LockApplicationForm?candidateId=${effectiveCandidateId}&applicationId=${applicationId}`
                                );
                            } else {
                                navigate(`/${UserType}/WorkExperience`);
                            }
                        }
                    });
                } else {
                    throw new Error(response.data.Message || `API returned status: ${response.data.Status}`);
                }
            } catch (error) {
                console.error("Error saving bank details:", error);
                console.error("Error details:", error.response?.data);

                let errorMessage = "Failed to save bank details. Please try again.";

                // Handle different error types
                if (error.response) {
                    if (error.response.status === 404) {
                        errorMessage = "API endpoint not found (404). Please contact support.";
                    } else if (error.response.status === 400 && error.response.data?.errors) {
                        // Handle validation errors
                        const validationErrors = error.response.data.errors;
                        errorMessage = "Validation errors: " + Object.keys(validationErrors)
                            .map(key => `${key}: ${validationErrors[key].join(', ')}`)
                            .join('; ');
                    } else if (error.response.data?.Message) {
                        errorMessage = error.response.data.Message;
                    }
                } else if (error.request) {
                    errorMessage = "No response from server. Please check your connection.";
                } else if (error.message) {
                    errorMessage = error.message;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage
                });
            } finally {
                stopLoading();
            }
        } else {
        }
    };

    // Function to verify IFSC code using Razor API
    const verifyIFSC = async (e) => {
        e.preventDefault();

        setErrors({ ...errors, ifscCode: null });

        if (!ifscCode) {
            setErrors({ ...errors, ifscCode: "IFSC code is required" });
            return;
        }

        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(ifscCode)) {
            setErrors({ ...errors, ifscCode: "Invalid IFSC format" });
            return;
        }

        setIsVerifyingIFSC(true);
        try {
            //const response = await agent.get(`${RazorApi}${ifscCode}`);
            const response = await agent.get(`${getIFSCDetails}/${ifscCode}`)
            const responseData = response?.data?.Data;
            if (response.data.Data && response.data.Status == 'Success') {
                const newBankName = responseData.BANK || '';
                const newBranchName = responseData.BRANCH || '';
                // const newBankName = response.data.BANK || '';
                // const newBranchName = response.data.BRANCH || '';

                setBankName(newBankName);
                setBranchName(newBranchName);
                setIfscVerified(true);

                // ✅ Update saved data as well
                setSavedBankData(prev => ({
                    ...prev,
                    bankName: newBankName,
                    branchName: newBranchName,
                    ifscVerified: true
                }));
            } else {
                setErrors({ ...errors, ifscCode: "Invalid IFSC code. No bank details found." });
                setIfscVerified(false);
            }
        } catch (error) {
            console.error("Error verifying IFSC code:", error);
            setErrors({ ...errors, ifscCode: "Failed to verify IFSC code. Please check and try again." });
            setIfscVerified(false);
        } finally {
            setIsVerifyingIFSC(false);
        }
    };

    // Account type options
    const accountTypeOptions = [
        { value: 'Saving', label: 'Saving' },
        { value: 'Current', label: 'Current' }
    ];

    return (
        <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4">
                <ProgressTracker />
            </div>

            {errors.form && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {errors.form}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <fieldset className="mb-4 rounded-md border p-4">
                    <legend
                        className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                    >
                        Bank Details
                    </legend>

                    <div className="mt-4">
                        <div className="mb-6 text-center">
                            <p className="font-normal mb-3">
                                <strong>Do You have Bank Account?</strong>
                                <span className="text-red-500 ml-1">*</span>
                            </p>
                            <div className="flex justify-center space-x-6">
                                <RadioButton
                                    name="hasAccount"
                                    value="Yes"
                                    checked={hasAccount === "Yes"}
                                    onChange={() => handleAccountChange("Yes")}
                                    label="Yes"
                                />
                                <RadioButton
                                    name="hasAccount"
                                    value="No"
                                    checked={hasAccount === "No"}
                                    onChange={() => handleAccountChange("No")}
                                    label="No"
                                />
                                <RadioButton
                                    name="hasAccount"
                                    value="Skip"
                                    checked={hasAccount === "Skip"}
                                    onChange={() => handleAccountChange("Skip")}
                                    label="Skip"
                                />
                            </div>
                            {errors.hasAccount && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.hasAccount}
                                </p>
                            )}
                        </div>

                        {/* ✅ Auto-expand when hasAccount === 'Yes' and accountType is not "-1" */}
                        {hasAccount === "Yes" && accountType !== "-1" && (
                            <>
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div>
                                        <FormComponent
                                            label="Type Of Account"
                                            isSelect={true}
                                            options={accountTypeOptions}
                                            value={accountType}
                                            onChange={(val) => {
                                                setAccountType(val);
                                                setSavedBankData((prev) => ({
                                                    ...prev,
                                                    accountType: val,
                                                }));
                                            }}
                                            error={errors.accountType}
                                            required={true}
                                        />
                                    </div>

                                    <div>
                                        <FormComponent
                                            label="Account Number"
                                            type="text"
                                            value={accountNumber}
                                            onChange={(val) => {
                                                if (/^\d*$/.test(val)) {
                                                    setAccountNumber(val);
                                                    setSavedBankData((prev) => ({
                                                        ...prev,
                                                        accountNumber: val,
                                                    }));
                                                }
                                            }}
                                            error={errors.accountNumber}
                                            required={true}
                                            placeholder="Enter account number"
                                        />
                                    </div>

                                    <div>
                                        <FormComponent
                                            label="Name Of Account Holder"
                                            type="text"
                                            value={accountHolderName}
                                            onChange={(val) => {
                                                if (/^[A-Za-z\s]*$/.test(val)) {
                                                    setAccountHolderName(val);
                                                    setSavedBankData((prev) => ({
                                                        ...prev,
                                                        accountHolderName: val,
                                                    }));
                                                }
                                            }}
                                            error={errors.accountHolderName}
                                            required={true}
                                            placeholder="Enter account holder name"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-grow">
                                            <FormComponent
                                                label="Bank IFSC Code"
                                                type="text"
                                                value={ifscCode}
                                                onChange={(value) => {
                                                    const upperValue = value.toUpperCase();
                                                    setIfscCode(upperValue);
                                                    setIfscVerified(false);
                                                    setBankName("");
                                                    setBranchName("");
                                                    setSavedBankData((prev) => ({
                                                        ...prev,
                                                        ifscCode: upperValue,
                                                        ifscVerified: false,
                                                        bankName: "",
                                                        branchName: "",
                                                    }));
                                                }}
                                                error={errors.ifscCode}
                                                required={true}
                                                placeholder="Enter IFSC code"
                                                extraClass="mb-0"
                                            />
                                        </div>
                                        {ifscVerified ? (
                                            // ✅ Show Verified Icon when IFSC is verified
                                            <div className="ml-2 mt-1 mb-4 flex items-center px-2 py-1 rounded bg-green-500 text-white">
                                                <img
                                                    src={VerifiedIcon}
                                                    alt="Verified"
                                                    className="w-5 h-5 mr-1"
                                                />
                                                <span className="text-sm font-medium">Verified</span>
                                            </div>
                                        ) : (
                                            // ✅ Show Check IFSC Code button when not verified
                                            <button
                                                type="button"
                                                onClick={verifyIFSC}
                                                disabled={isVerifyingIFSC || !ifscCode}
                                                className={`ml-2 mt-1 mb-4 flex items-center px-3 py-1.5 rounded ${isVerifyingIFSC
                                                        ? "bg-yellow-300 text-gray-700 cursor-wait"
                                                        : ifscVerified
                                                            ? "bg-green-500 text-white"
                                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                                    } ${!ifscCode ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                {isVerifyingIFSC ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Verifying
                                                    </>
                                                ) : (
                                                    "Check IFSC Code"
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <FormComponent
                                            label="Bank Name"
                                            type="text"
                                            value={bankName}
                                            onChange={setBankName}
                                            error={errors.bankName}
                                            required={true}
                                            placeholder="Enter bank name"
                                            disabled={true}
                                        />
                                    </div>

                                    <div>
                                        <FormComponent
                                            label="Branch Name"
                                            type="text"
                                            value={branchName}
                                            onChange={setBranchName}
                                            error={errors.branchName}
                                            required={true}
                                            placeholder="Enter branch name"
                                            disabled={true}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <UploadPdf
                                        file={passbook?.fileName || ""}
                                        onFileChange={handlePassbookChange}
                                        buttonClassName="bg-[#00c3f9]"
                                        buttonText="Upload"
                                        label="Upload Bank Passbook Cover Page / Cheque"
                                        showLabel={true}
                                        allowedFileTypes="jpg, jpeg, png, pdf"
                                        maxFileSize="2 MB"
                                        //required={true}
                                        userTypeId={userTypeID}
                                        userLoginID={userLoginID}
                                        linkName="View Passbook"
                                        uniquefilepath={passbookPath || ""}
                                        id="passbookUpload"
                                    />
                                    {/* {errors.passbook && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.passbook}
                                        </p>
                                    )} */}
                                </div>
                            </>
                        )}
                    </div>
                </fieldset>
                {formType == "Staff" && (
                    <fieldset className="mb-4 rounded-md border p-4">
                        <legend
                            className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                        >
                            PAN Details
                        </legend>

                        <div className="mt-4">
                            <div className="mb-6 text-center">
                                <p className="font-normal mb-3">
                                    <strong>Do You have PAN Details?</strong>
                                    <span className="text-red-500 ml-1">*</span>
                                </p>
                                <div className="flex justify-center space-x-6">
                                    <RadioButton
                                        name="hasPAN"
                                        value="Yes"
                                        checked={hasPAN === "Yes"}
                                        onChange={() => handlePANChange("Yes")}
                                        label="Yes"
                                    />
                                    <RadioButton
                                        name="hasPAN"
                                        value="No"
                                        checked={hasPAN === "No"}
                                        onChange={() => handlePANChange("No")}
                                        label="No"
                                    />
                                    <RadioButton
                                        name="hasPAN"
                                        value="Skip"
                                        checked={hasPAN === "Skip"}
                                        onChange={() => handlePANChange("Skip")}
                                        label="Skip"
                                    />
                                </div>
                                {errors.hasPAN && (
                                    <p className="mt-2 text-sm text-red-600">{errors.hasPAN}</p>
                                )}
                            </div>

                            {/* ✅ Auto-expand when hasPAN === 'Yes' */}
                            {hasPAN === "Yes" && (
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div>
                                        <FormComponent
                                            label="PAN Number"
                                            type="text"
                                            value={panNumber}
                                            onChange={(value) => {
                                                const upperValue = value.toUpperCase();
                                                setPanNumber(upperValue);
                                                setSavedPANData((prev) => ({
                                                    ...prev,
                                                    panNumber: upperValue,
                                                }));
                                            }}
                                            error={errors.panNumber}
                                            required={true}
                                            placeholder="Enter PAN number"
                                        />
                                    </div>

                                    <div>
                                        <UploadPdf
                                            file={panCard?.fileName || ""}
                                            onFileChange={handlePanCardChange}
                                            buttonClassName="bg-[#00c3f9]"
                                            buttonText="Upload"
                                            label="Upload PAN Card"
                                            showLabel={true}
                                            allowedFileTypes="jpg, jpeg, png, pdf"
                                            maxFileSize="2 MB"
                                            required={true}
                                            userTypeId={userTypeID}
                                            userLoginID={userLoginID}
                                            linkName="View PAN Card"
                                            uniquefilepath={panCardPath || ""}
                                            id="panCardUpload"
                                        />
                                        {errors.panCard && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.panCard}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </fieldset>
                )}

                <div className="mt-8 flex justify-center space-x-4">
                    <button
                        type="button"
                        className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-gray-300"
                        onClick={handleReset}
                        disabled={isLoading}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save & Next"}
                    </button>
                </div>
            </form>
        </div>
    );
};
