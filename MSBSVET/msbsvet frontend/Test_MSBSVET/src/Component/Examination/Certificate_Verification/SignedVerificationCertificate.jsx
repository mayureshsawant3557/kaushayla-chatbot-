import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import agent from '../../../lib/api/agent';
import FormComponent from '../../formcomponent/FormComponent';
import DropdownComponent from '../../formcomponent/DropdownComponent';
import TransactionDetailsPage from '../../Login/AplicationForm/TransactionHistory';
import {
    GetPincodeData,
    GetMasterDistrict,
    GetMasterTaluka,
    GetMasterCity,
} from '../../../Endpoints_All/Base/location';
import { send_otp, verify_otp, resend_otp, save_otp_status } from "../../../Endpoints_All/OTP/otp";

import { GetMasterTableList } from '../../../Endpoints_All/Base/masterData';
import { RequestSignedVerificationCertificate } from '../../../Endpoints_All/Examination/VerificationCertificate';
import { SetFeeTransactionResponse, GetFeeToPay, InitiatePayment, HandleResponse } from '../../../Endpoints_All/Fee/feeManagement';
import { CreditCard, Loader, Shield, Lock } from 'lucide-react';
import publicAgent from '../../../lib/api/publicAgent';

// OTP Configuration
const OTP_CONFIG = {
    MAX_ATTEMPTS: 3,
    RESEND_COOLDOWN: 30,
    EXPIRY_TIME: 300
};

// New API endpoint for states
const GET_STATES_API = `${GetMasterTableList}?TableName=Master_State&DataValueField=StateID&DataTextField=State&HasSelect=true`;

const SignedVerificationCertificate = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState('form');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const { profileId, candidateName } = location.state || {};
    const [transactionId, setTransactionId] = useState(null);
    // State for dropdown options
    const [districts, setDistricts] = useState([]);
    const [talukas, setTalukas] = useState([]);
    const [cities, setCities] = useState([]);
    const [states, setStates] = useState([]);
    const [clientIP, setClientIP] = useState("");

    // State for filtered options based on selections
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [filteredTalukas, setFilteredTalukas] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    // Loading states
    const [loadingStates, setLoadingStates] = useState({
        states: false,
        districts: false,
        talukas: false,
        cities: false,
        pincodeLookup: false
    });

    const [formData, setFormData] = useState({
        designation: '',
        organizationName: '',
        organizationAddress: '',
        pinCode: '',
        stateID: 0,
        districtID: 0,
        talukaID: 0,
        cityID: 0,
        primaryMobile: '',
        otpVerified: false
    });

    const [verificationData, setVerificationData] = useState({
        requestNo: '',
        profileId: '',
        paymentStatus: '',
        transactionId: '',
    });

    // Fee payment related states
    const [feeData, setFeeData] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);

    const [errors, setErrors] = useState({});

    // OTP related states
    const [isVerified, setIsVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [currentOtp, setCurrentOtp] = useState(null);
    const [otpAttempts, setOtpAttempts] = useState(0);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [transactionIdFromResponse, setTransactionIdFromResponse] = useState(null);
    const [feeAmount, setFeeAmount] = useState(null);

    // Enhanced loading functions
    const startLoading = useCallback(() => setLoading(true), []);
    const stopLoading = useCallback(() => setLoading(false), []);

    useEffect(() => {
        // Prevent navigation when on success page
        if (currentStep === 'success') {
            const handleBeforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = '';
            };
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [currentStep]);

    // Resend cooldown timer effect
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    useEffect(() => {
        if (!profileId) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Profile ID is missing. Please go back and try again.',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate(-1);
            });
        } else {
        }
    }, [profileId, navigate, candidateName]);

    // Fetch all location data on component mount
    useEffect(() => {
        fetchStates();
        fetchAllDistricts();
        fetchAllTalukas();
        fetchAllCities();
        fetchClientIP();
    }, []);

    const fetchClientIP = async () => {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setClientIP(data.ip);
    } catch (error) {
        setClientIP("0.0.0.0");
    }
};

    // Fetch fee data for verification certificate
    const fetchFeeData = async () => {
        try {
            setLoading(true);

            const PayeeID = profileId.slice(-6);
            const PhaseID = 5;

            const response = await publicAgent.get(
                `${GetFeeToPay}?PayeeID=${PayeeID}&PhaseID=${PhaseID}`
            );


            if (response.data.Status === 'Success') {
                const feeInfo = response.data.Data;
                const isAlreadyPaid = feeInfo.Fee?.IsPaid || false;

                setFeeData(feeInfo);
                setFeeAmount(feeInfo?.Fee?.FeeAmount || 0);


                // REMOVE OR COMMENT OUT THIS AUTO-NAVIGATION
                // if (isAlreadyPaid && currentStep === 'verification') {
                //     setCurrentStep('success');
                //     setPaymentStatus({
                //         type: 'success',
                //         message: 'Payment already completed',
                //         transactionId: feeInfo.Fee?.TransactionId,
                //         showTransactionDetails: true
                //     });
                // }
            } else {
                throw new Error(response.data.Message);
            }

        } catch (err) {

            Swal.fire({
                icon: 'error',
                title: 'Fee Error',
                text: err.message || 'Failed to load fee information'
            });

        } finally {
            setLoading(false);
        }
    };

    // Create Razorpay order for verification certificate
    const createRazorpayOrder = async () => {
        try {
            const PayeeID = profileId.slice(-6);
            const PhaseID = 5;

            // Fetch fee details
            // const feeResponse = await publicAgent.get(
            //     `${GetFeeToPay}?PayeeID=${PayeeID}&PhaseID=${PhaseID}`
            // );

            // const feeDetails = feeResponse.data.Data;


            // Create payload object
            const payload = {
                CandidateID: Number(PayeeID),
                //PayeeApplicationID: feeDetails.Fee.PayeeApplicationID,
                PhaseID: PhaseID,
                FeeAmount: feeAmount,
                // PayeeName: feeDetails.Fee.PayeeName || candidateName || '',
                // PayeeMobileNo: formData.primaryMobile || '',
                // PayeeEMailID: '',
                // Purpose: feeDetails.Fee.Purpose,
                // PayeeCategory: feeDetails.Fee.PayeeCategory || "VERIFICATION",
                // Course: feeDetails.Fee.Course,
                // AcademicYear: feeDetails.Fee.AcademicYear,
                // BatchId: feeDetails.Fee.BatchId || 0,

            };


            // Make the API call - USE ONE CONSISTENT AGENT
            const { data } = await publicAgent.post(InitiatePayment, payload);

            // OR use publicAgent - but be consistent
            // const { data } = await publicAgent.post(InitiatePayment, payload);

            if (data.Status === 'Success' && data.Data?.RazorpayOrder) {
                return {
                    order: data.Data.RazorpayOrder,
                    transactionId: data.Data.TransactionId
                };
            } else {
                throw new Error(data.Message || 'Order creation failed');
            }

        } catch (error) {
            throw error;
        }
    };


    const sendTransactionResponse = async (
        paymentResponse,
        orderId,
        status = 'success',
        transactionId
    ) => {
        try {
            const PayeeID = profileId.slice(-6);
            const PhaseID = 5;

            if (!feeData || !feeData.Fee) {
                throw new Error('Fee data not available');
            }

            const orderData = {
                Name: formData.designation || '',
                Mobile: formData.primaryMobile || '',
                Email: ''
            };

            const transactionData = {
                transactionID: Number(transactionId),
                payeeID: Number(PayeeID),
                payeeApplicationID: feeData.Fee.PayeeApplicationID || '',
                payeeDisplayApplicationId: feeData.Fee.PayeeDisplayApplicationId || '',
                payeeName: orderData.Name || 'N/A',
                payeeMobileNo: orderData.Mobile || '',
                payeeEMailID: orderData.Email || '',
                feeAmount: feeData.Fee.FeeAmount || 200,
                serviceCharge: feeData.Fee.ServiceCharge || 0,
                totalAmount: feeData.Fee.FeeAmount || 200,
                isValid: status === 'success',
                isPaid: status === 'success',
                isReconciled: false,
                transactionDate: new Date().toISOString(),
                lastPaymentdate: '',
                bankRefereneceNo: paymentResponse?.razorpay_payment_id || 'FAILED',
                payGateID: paymentResponse?.razorpay_payment_id || 'FAILED',
                paymentDate: new Date().toISOString(),
                purpose: feeData.Fee.Purpose || 'CERTIFICATE VERIFICATION FEE',
                phaseID: Number(PhaseID),
                receiptURL: '',
                optional1: paymentResponse?.razorpay_order_id || orderId || '',
                optional2: paymentResponse?.razorpay_signature || '',
                optional3: '',
                optional4: '',
                optional5: '',
                gatewayResponse: JSON.stringify(paymentResponse || { error: 'Payment failed' }),
                errorMessage: status === 'failed' ? (paymentResponse?.error?.description || 'Payment failed') : '',
                refundDate: '',
                isRefunded: false,
                isEligibleForRefund: status === 'success',
                chargeBackDate: '',
                isChargeBackAccepted: false,
                txStatus: status === 'success' ? 'SUCCESS' : 'FAILED',
                payeeCategory: feeData.Fee.PayeeCategory || "VERIFICATION",
                paymentVendor: 'Razorpay',
                isPushResponse: true,
                isAPICheck: true,
                vendorId: 1,
                course: feeData.Fee.Course || '',
                academicYear: feeData.Fee.AcademicYear || '',
                batchId: feeData.Fee.BatchId ? String(feeData.Fee.BatchId) : '0',
                orderId: orderId || ''
            };


            const url = `${SetFeeTransactionResponse}`;
            const { data: result } = await publicAgent.post(url, transactionData, {
                headers: { 'Content-Type': 'application/json' }
            });


            return {
                Status: result.Status ?? 'Success',
                Message: result.Message ?? 'Transaction saved successfully',
                Data: result.Data ?? result,
                TransactionID: result.Data?.TransactionID ?? result.TransactionID,
                PaymentId: paymentResponse?.razorpay_payment_id
            };
        } catch (error) {
            if (error.response?.data?.errors) {
            }
            if (error.response) {
            }
            throw error;
        }
    };

    // Load Razorpay script
    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
            if (window.Razorpay) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;

            script.onload = () => {
                setTimeout(() => {
                    if (window.Razorpay) {
                        resolve();
                    } else {
                        reject(new Error('Razorpay script loaded but SDK not available'));
                    }
                }, 100);
            };

            script.onerror = () => {
                reject(new Error('Failed to load Razorpay script. Please check your internet connection.'));
            };

            document.body.appendChild(script);
        });
    };



    // Handle successful payment
    const handlePaymentSuccess = async (response, orderId, transactionId) => {
        try {

            // Immediately set processing to false and show loading
            setProcessing(false);

            // Show loading indicator while processing
            Swal.fire({
                title: "Processing Payment",
                text: "Please wait while we confirm your payment...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const transactionResult = await sendTransactionResponse(response, orderId, 'success', transactionId);

            const verificationResponse = await publicAgent.post(
                HandleResponse,
                {
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature
                }
            );

            const verificationResult = verificationResponse.data;

            if (verificationResult.Status === 'Success' && transactionResult.Status === 'Success') {
                try {
                    const updateRequestData = {
                        profileID: (verificationData.profileId || profileId).toString(),
                        name: candidateName || '',
                        designation: formData.designation?.trim() || "",
                        organizationName: formData.organizationName?.trim() || "",
                        organizationAddress: formData.organizationAddress?.trim() || "",
                        pinCode: formData.pinCode?.trim() || "",
                        stateID: parseInt(formData.stateID) || 0,
                        districtID: parseInt(formData.districtID) || 0,
                        talukaID: parseInt(formData.talukaID) || 0,
                        cityID: parseInt(formData.cityID) || 0,
                        primaryMobile: formData.primaryMobile?.trim() || "",
                        otpVerified: Boolean(formData.otpVerified),
                        userLoginID: 0,
                        ipAddress: clientIP || "0.0.0.0",
                        pageCode: "PAYMENT_SUCCESS",
                        requestNo: verificationData.requestNo,
                        paymentStatus: "completed",
                        transactionID: transactionResult.TransactionID,
                        feeAmount: feeData.Fee.FeeAmount || 200,
                        status: "pending",
                        isUpdate: true
                    };


                    const updateResponse = await publicAgent.post(RequestSignedVerificationCertificate, updateRequestData);

                    // Update verification data with payment status
                    setVerificationData(prev => ({
                        ...prev,
                        paymentStatus: 'completed',
                        transactionId: transactionResult.TransactionID,
                        certificateStatus: 'paid',
                        status: 'pending',
                        updatedAt: new Date().toISOString()
                    }));

                    // Update feeData
                    if (feeData && feeData.Fee) {
                        setFeeData({
                            ...feeData,
                            Fee: {
                                ...feeData.Fee,
                                IsEligibleToPay: false,
                                IsPaid: true,
                                PaymentStatus: 'completed',
                                TransactionId: transactionResult.TransactionID
                            }
                        });
                    }

                    // Close the loading Swal
                    Swal.close();

                    // IMPORTANT: Set currentStep to success IMMEDIATELY before showing success popup
                    setCurrentStep('success');

                    // Small delay to ensure state update completes
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // Show success popup after state is updated
                    await Swal.fire({
                        title: "Payment Successful 🎉",
                        text: "Your payment has been processed successfully. Your verification request has been submitted.",
                        icon: "success",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#28a745",
                    });

                } catch (certificateUpdateError) {
                    Swal.close();

                    // Still show success page even if update fails
                    setCurrentStep('success');

                    await Swal.fire({
                        icon: 'warning',
                        title: 'Partial Success',
                        text: 'Payment completed but verification update failed. Please contact support.',
                        confirmButtonText: 'OK'
                    });
                }

            } else {
                throw new Error(verificationResult.Message || transactionResult.Message || 'Payment processing failed');
            }
        } catch (error) {
            Swal.close();

            await Swal.fire({
                icon: 'warning',
                title: 'Partial Success',
                text: 'Payment completed but verification failed. Please contact support.',
                confirmButtonText: 'OK'
            });

            setCurrentStep('success');
        } finally {
            setProcessing(false);
        }
    };

    // Handle payment failure
    const handlePaymentFailure = async (response, orderId) => {
        try {

            const failureOrderId = orderId || response?.razorpay_order_id || 'UNKNOWN';

            const failureResponse = {
                razorpay_payment_id: response?.razorpay_payment_id || 'FAILED',
                razorpay_order_id: failureOrderId,
                razorpay_signature: response?.razorpay_signature || '',
                error: response?.error || { description: 'Payment failed' }
            };

            await sendTransactionResponse(failureResponse, failureOrderId, 'failed');

            setPaymentStatus({
                type: 'error',
                message: 'Payment failed!',
                details: response?.error?.description || 'Please try again or contact support.',
                errorCode: response?.error?.code
            });

            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: response?.error?.description || 'Payment failed. Please try again.',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            setPaymentStatus({
                type: 'error',
                message: 'Payment failed and could not record the transaction.',
                details: 'Please contact support for assistance.'
            });
        } finally {
            setProcessing(false);
        }
    };

    const initiatePayment = async () => {

        if (!feeData?.Fee?.IsEligibleToPay) {
            Swal.fire({
                icon: 'warning',
                title: 'Not Eligible',
                text: feeData?.Fee?.NotEligibleMsg || 'You are not eligible to make this payment'
            });
            return;
        }

        setProcessing(true);
        setPaymentStatus(null);

        try {
            if (!window.Razorpay) {
                await loadRazorpayScript();
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (!window.Razorpay) {
                throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
            }

            const { order, transactionId } = await createRazorpayOrder();

            if (!order || !order.OrderId) {
                throw new Error("Invalid order response from server - missing OrderId");
            }

            const options = {
                key: 'rzp_test_er5gJgaSzluxIH',
                amount: order.Amount,
                currency: 'INR',
                name: 'Verification Certificate Payment',
                description: feeData.Fee.Purpose || 'Verification Certificate Fee',
                order_id: order.OrderId,

                prefill: {
                    name: formData.designation || '',
                    email: '',
                    contact: formData.primaryMobile || ''
                },
                notes: {
                    request_no: verificationData.requestNo,
                    profile_id: verificationData.profileId,
                    purpose: 'Verification Certificate',
                    payee_id: profileId.slice(-6),
                    phase_id: 5
                },
                theme: {
                    color: '#059669'
                },
                handler: async function (response) {
                    // Immediately show loading and hide verification page content
                    setIsPaymentProcessing(true);
                    try {
                        await handlePaymentSuccess(response, order.OrderId, transactionId);
                    } catch (error) {
                        setIsPaymentProcessing(false);
                        Swal.fire({
                            icon: 'error',
                            title: 'Payment Processing Error',
                            text: error.message || 'There was an error processing your payment. Please contact support.'
                        });
                        setProcessing(false);
                    }
                },
                modal: {
                    ondismiss: async function () {
                        setProcessing(false);
                        try {
                            await sendTransactionResponse(null, order.OrderId, 'failed');
                        } catch (error) {
                        }
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);

            paymentObject.on('payment.failed', async function (response) {
                setProcessing(false);
                try {
                    await handlePaymentFailure(response, order.OrderId);
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Payment Failed',
                        text: response.error?.description || 'Payment failed. Please try again.'
                    });
                }
            });

            paymentObject.open();

        } catch (error) {
            setProcessing(false);

            Swal.fire({
                icon: 'error',
                title: 'Payment Initialization Failed',
                text: error.message || 'Failed to initialize payment. Please try again.',
                confirmButtonText: 'OK'
            });

            setPaymentStatus({
                type: 'error',
                message: 'Failed to initialize payment. Please try again.',
                details: error.message
            });
        }
    };

    // Fetch states using the new API
    const fetchStates = async () => {
        setLoadingStates(prev => ({ ...prev, states: true }));
        try {
            const response = await agent.get(GET_STATES_API);
            if (response.data.Status === "Success") {
                const stateData = response.data.Data.filter(item => item.Value !== "-1");
                setStates(stateData);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error loading states: ${error.message}`
            });
        } finally {
            setLoadingStates(prev => ({ ...prev, states: false }));
        }
    };

    // Fetch all districts
    const fetchAllDistricts = async () => {
        setLoadingStates(prev => ({ ...prev, districts: true }));
        try {
            const response = await agent.get(GetMasterDistrict);
            if (response.data.Status === "Success") {
                const allDistricts = response.data.Data.filter(item => item.Value !== "-1");
                setDistricts(allDistricts);
            }
        } catch (error) {
        } finally {
            setLoadingStates(prev => ({ ...prev, districts: false }));
        }
    };

    // Fetch all talukas
    const fetchAllTalukas = async () => {
        setLoadingStates(prev => ({ ...prev, talukas: true }));
        try {
            const response = await agent.get(GetMasterTaluka);
            if (response.data.Status === "Success") {
                const allTalukas = response.data.Data.filter(item => item.Value !== "-1");
                setTalukas(allTalukas);
            }
        } catch (error) {
        } finally {
            setLoadingStates(prev => ({ ...prev, talukas: false }));
        }
    };

    // Fetch all cities
    const fetchAllCities = async () => {
        setLoadingStates(prev => ({ ...prev, cities: true }));
        try {
            const response = await agent.get(GetMasterCity);
            if (response.data.Status === "Success") {
                const allCities = response.data.Data.filter(item => item.Value !== "-1");
                setCities(allCities);
            }
        } catch (error) {
        } finally {
            setLoadingStates(prev => ({ ...prev, cities: false }));
        }
    };

    // Update filtered options when dependencies change
    useEffect(() => {
        if (formData.stateID) {
            const filtered = districts.filter(
                district => district.Group === formData.stateID.toString()
            );
            setFilteredDistricts(filtered);

            if (!filtered.some(d => d.Value === formData.districtID.toString()) && formData.districtID !== 0) {
                setFormData(prev => ({
                    ...prev,
                    districtID: 0,
                    talukaID: 0,
                    cityID: 0
                }));
                setFilteredTalukas([]);
                setFilteredCities([]);
            }
        }
    }, [formData.stateID, districts]);

    useEffect(() => {
        if (formData.districtID) {
            const filtered = talukas.filter(
                taluka => taluka.Group === formData.districtID.toString()
            );
            setFilteredTalukas(filtered);

            if (!filtered.some(t => t.Value === formData.talukaID.toString()) && formData.talukaID !== 0) {
                setFormData(prev => ({
                    ...prev,
                    talukaID: 0,
                    cityID: 0
                }));
                setFilteredCities([]);
            }
        }
    }, [formData.districtID, talukas]);

    useEffect(() => {
        if (formData.talukaID) {
            const filtered = cities.filter(
                city => city.Group === formData.talukaID.toString()
            );
            setFilteredCities(filtered);

            if (!filtered.some(c => c.Value === formData.cityID.toString()) && formData.cityID !== 0) {
                setFormData(prev => ({
                    ...prev,
                    cityID: 0
                }));
            }
        }
    }, [formData.talukaID, cities]);

    // Lookup address details by pincode
    const lookupAddressByPincode = async (pincode) => {
        if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
            return;
        }

        setLoadingStates(prev => ({ ...prev, pincodeLookup: true }));
        try {
            const response = await agent.get(`${GetPincodeData}?Pincode=${pincode}`);

            if (response.data.Status === "Success" && response.data.Data) {
                const pincodeData = response.data.Data;

                const stateID = parseInt(pincodeData.StateID) || 0;
                const districtID = parseInt(pincodeData.DistrictID) || 0;
                const talukaID = parseInt(pincodeData.TalukaID) || 0;
                const cityID = parseInt(pincodeData.CityID) || 0;

                const districtExists = districts.some(d => {
                    return parseInt(d.Value) === districtID && d.Group === stateID.toString();
                });

                const talukaExists = talukas.some(t => {
                    return parseInt(t.Value) === talukaID && t.Group === districtID.toString();
                });

                const cityExists = cities.some(c => {
                    return parseInt(c.Value) === cityID && c.Group === talukaID.toString();
                });

                if (districtExists && talukaExists && cityExists) {
                    setFormData(prev => ({
                        ...prev,
                        stateID,
                        districtID,
                        talukaID,
                        cityID
                    }));

                    Swal.fire({
                        icon: 'success',
                        title: 'Address Found',
                        text: 'Address details have been automatically filled',
                        timer: 2000,
                        confirmButtonText: 'Okay'
                    });
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Partial Address Found',
                        text: 'Please verify and complete the address details manually',
                        timer: 3000,
                        showConfirmButton: true

                    });

                    setFormData(prev => ({
                        ...prev,
                        stateID: stateID || 0,
                        districtID: districtExists ? districtID : 0,
                        talukaID: 0,
                        cityID: 0
                    }));
                }
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Pincode Not Found',
                    text: 'Please manually select your address details',
                    timer: 3000,
                    showConfirmButton: false
                });

                setFormData(prev => ({
                    ...prev,
                    stateID: 0,
                    districtID: 0,
                    talukaID: 0,
                    cityID: 0
                }));
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Pincode Lookup Failed',
                text: 'Please manually select your address details',
                timer: 3000,
                showConfirmButton: false
            });
        } finally {
            setLoadingStates(prev => ({ ...prev, pincodeLookup: false }));
        }
    };

    // Format options for dropdown component
    const formatOptions = (data) => {
        return data.map(item => ({
            value: item.Value,
            label: item.Text
        }));
    };

    // Optimized form change handler
    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: false }));
        }
    }, [errors]);

    // Optimized pincode change handler
    const handlePincodeChange = useCallback((field, value) => {
        const numericValue = value.replace(/\D/g, '').slice(0, 6);

        setFormData(prev => ({ ...prev, [field]: numericValue }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: false }));
        }

        if (numericValue.length === 6) {
            lookupAddressByPincode(numericValue);
        }
    }, [errors, lookupAddressByPincode]);

    // Handle dropdown changes with numeric conversion
    const handleDropdownChange = (field, value) => {
        const numericValue = value ? parseInt(value) : 0;
        setFormData(prev => ({
            ...prev,
            [field]: numericValue
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: false
            }));
        }
    };

    // Enhanced mobile number verification
    const handleVerifyClick = async () => {
        if (!formData.primaryMobile) {
            setErrors(prev => ({ ...prev, primaryMobile: "Please enter a mobile number." }));
            return;
        }

        if (!/^[6-9]\d{9}$/.test(formData.primaryMobile)) {
            setErrors(prev => ({ ...prev, primaryMobile: "Enter a valid 10-digit mobile number starting with 6-9." }));
            return;
        }

        setOtpLoading(true);

        try {
            await sendOTP();
        } catch (error) {
        }
    };

    // Enhanced OTP sending function
    const sendOTP = async () => {
        startLoading();
        try {
            const response = await agent.post(send_otp, {
                MobileNo: formData.primaryMobile,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });

            setOtpLoading(false);

            if (response.data.success) {
                const otp = response.data.otp || response.data.OTP;
                setCurrentOtp(otp);
                setOtpAttempts(0);

                showOTPDialog(otp);
            } else {
                throw new Error(response.data.message || "Failed to send OTP");
            }

        } catch (error) {
            setOtpLoading(false);

            Swal.fire({
                title: "OTP Error",
                text: error.response?.data?.message || "Failed to send OTP. Please try again.",
                icon: "error"
            });
        }
        stopLoading();
    };

    // Enhanced OTP dialog
    const showOTPDialog = () => {
        Swal.fire({
            title: "OTP Verification",
            html: `
        <div style="text-align: left; margin-bottom: 20px;">
            <div style="background-color: #d1fae5; padding: 10px; border-radius: 5px; color: #065f46;">
                OTP has been sent to Mobile No. ******${formData.primaryMobile.slice(-4)}.
            </div>
           
        </div>
        <input type="text" id="otp-input" class="swal2-input" placeholder="Enter 4-digit OTP" maxlength="4" style="text-align: center; font-size: 18px; letter-spacing: 2px;" />
        <div id="otp-error" style="color: #dc2626; font-size: 14px; margin-top: 10px; display: none;"></div>
        <div style="margin-top: 15px; font-size: 14px; color: #6b7280;">
            Attempts remaining: <span id="attempts-remaining">${OTP_CONFIG.MAX_ATTEMPTS}</span>
        </div>
    `,
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Verify OTP",
            denyButtonText: resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP',
            cancelButtonText: "Close",
            allowOutsideClick: false,
            didOpen: () => {
                const input = document.getElementById('otp-input');
                input.focus();

                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                });
            },
            preConfirm: async () => {
                const enteredOtp = document.getElementById("otp-input").value;
                const errorDiv = document.getElementById("otp-error");
                const attemptsSpan = document.getElementById("attempts-remaining");

                if (!enteredOtp) {
                    errorDiv.textContent = "Please enter the OTP.";
                    errorDiv.style.display = "block";
                    return false;
                }

                if (enteredOtp.length !== 4) {
                    errorDiv.textContent = "OTP must be 4 digits.";
                    errorDiv.style.display = "block";
                    return false;
                }

                try {
                    const verifyResponse = await agent.post(
                        verify_otp,
                        {
                            MobileNo: formData.primaryMobile,
                            OTP: enteredOtp
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            timeout: 15000
                        }
                    );
                    if (verifyResponse.data.success) {
                        await saveOTPVerificationStatus(formData.primaryMobile, enteredOtp, true);
                        setIsVerified(true);
                        setFormData(prev => ({ ...prev, otpVerified: true }));
                        setCurrentOtp(null);
                        setOtpAttempts(0);

                        Swal.fire({
                            title: "Verified ✅",
                            text: "Mobile number verified successfully!",
                            icon: "success",
                            timer: 2000,
                            confirmButtonText: 'Okay'
                        });
                        return true;
                    } else {
                        throw new Error(verifyResponse.data.message || "Invalid OTP");
                    }
                } catch (error) {

                    const newAttempts = otpAttempts + 1;
                    setOtpAttempts(newAttempts);

                    await saveOTPVerificationStatus(formData.primaryMobile, enteredOtp, false);

                    if (newAttempts >= OTP_CONFIG.MAX_ATTEMPTS) {
                        errorDiv.textContent = "Maximum attempts exceeded. Please request a new OTP.";
                        errorDiv.style.display = "block";
                        return false;
                    }

                    const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - newAttempts;
                    attemptsSpan.textContent = remainingAttempts;

                    if (error.response?.data?.message?.includes("expired")) {
                        errorDiv.textContent = "OTP has expired. Please request a new OTP.";
                    } else {
                        errorDiv.textContent = `Invalid OTP. `;
                    }
                    errorDiv.style.display = "block";
                    return false;
                }
            },
        }).then((result) => {
            if (result.isDenied && resendCooldown === 0) {
                handleResendOTP();
            } else if (result.isDenied && resendCooldown > 0) {
                Swal.fire({
                    title: "Please Wait",
                    text: `Please wait ${resendCooldown} seconds before requesting another OTP.`,
                    icon: "info"
                });
            }
        });
    };

    // Enhanced OTP resend function
    const handleResendOTP = async () => {
        if (resendCooldown > 0) {
            Swal.fire({
                title: "Please Wait",
                text: `Please wait ${resendCooldown} seconds before requesting another OTP.`,
                icon: "info"
            });
            return;
        }

        try {
            Swal.fire({
                title: "Resending OTP",
                text: "Please wait...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await agent.post(resend_otp, {
                MobileNo: formData.primaryMobile,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });

            Swal.close();

            if (response.data.success) {
                const newOtp = response.data.otp || response.data.OTP;
                setCurrentOtp(newOtp);
                setOtpAttempts(0);
                setResendCooldown(OTP_CONFIG.RESEND_COOLDOWN);

                showOTPDialog(newOtp);
            } else {
                throw new Error(response.data.message || "Failed to resend OTP");
            }
        } catch (error) {
            Swal.fire({
                title: "Resend Failed",
                text: error.response?.data?.message || "Failed to resend OTP. Please try again.",
                icon: "error"
            });
        }
    };

    // Enhanced OTP verification status saving
    const saveOTPVerificationStatus = async (mobileNo, otp, isVerified) => {
        try {
            const response = await agent.post(
                save_otp_status,
                {
                    MobileNo: mobileNo,
                    Purpose: 'VerifyCandidateMobileNo',
                    OTP: otp,
                    IsOTPVerified: isVerified
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );
            return response.data;
        } catch (error) {
            return null;
        }
    };

    const validateForm = () => {
        const required = ['designation', 'organizationName', 'organizationAddress', 'pinCode', 'stateID', 'districtID', 'talukaID', 'cityID', 'primaryMobile'];
        let newErrors = {};
        let hasError = false;

        for (let field of required) {
            if (field === 'stateID' || field === 'districtID' || field === 'talukaID' || field === 'cityID') {
                if (!formData[field] || formData[field] === 0) {
                    newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
                    hasError = true;
                }
            } else if (!formData[field]) {
                newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
                hasError = true;
            }
        }

        if (formData.primaryMobile && !/^[6-9]\d{9}$/.test(formData.primaryMobile)) {
            newErrors.primaryMobile = "Enter a valid 10-digit mobile number starting with 6-9";
            hasError = true;
        }

        if (!formData.otpVerified) {
            Swal.fire({
                icon: 'error',
                title: 'Verification Required',
                text: 'Please verify your mobile number with OTP'
            });
            hasError = true;
        }

        setErrors(newErrors);
        return !hasError;
    };

    const handleProceedToVerification = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const requestData = {
                profileID: profileId.toString(),
                name: candidateName,
                designation: formData.designation?.trim() || "",
                organizationName: formData.organizationName?.trim() || "",
                organizationAddress: formData.organizationAddress?.trim() || "",
                pinCode: formData.pinCode?.trim() || "",
                stateID: parseInt(formData.stateID) || 0,
                districtID: parseInt(formData.districtID) || 0,
                talukaID: parseInt(formData.talukaID) || 0,
                cityID: parseInt(formData.cityID) || 0,
                primaryMobile: formData.primaryMobile?.trim() || "",
                otpVerified: Boolean(formData.otpVerified),
                userLoginID: 0,
                ipAddress: clientIP || "0.0.0.0",
                pageCode: "VERIFICATION_REQUEST",
                requestNo: "",
                paymentStatus: "",
                transactionID: "",
                feeAmount: 200,
                status: "",
                isUpdate: false
            };


            const response = await publicAgent.post(RequestSignedVerificationCertificate, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                timeout: 30000,
            });

            if (response.status === 200) {
                const verificationId = response.data.Data;

                setVerificationData({
                    requestNo: verificationId,
                    profileId: profileId,
                    paymentStatus: 'pending',
                    transactionId: null,
                    message: response.data.Message,
                    ...response.data
                });

                await fetchFeeData();
                setCurrentStep('verification');
            } else {
                throw new Error('Failed to save verification request');
            }
        } catch (error) {

            if (error.response) {
            }

            if (error.response) {
                const status = error.response.status;
                const errorMessage = error.response.data?.Message || error.response.data?.message || 'Server error occurred';

                if (status === 400) {
                    alert(`Validation Error: ${errorMessage}`);
                } else if (status === 401) {
                    alert('Session expired. Please login again.');
                } else if (status === 409) {
                    alert('A request with this information already exists.');
                } else {
                    alert(`Error: ${errorMessage}`);
                }
            } else if (error.request) {
                alert('Network error. Please check your internet connection and try again.');
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = () => {
        Swal.fire({
            icon: 'info',
            title: 'Download Certificate',
            text: 'Your verification certificate will be available for download once it is generated and signed. You will receive it via post/courier within 15 days.',
            confirmButtonText: 'OK'
        });
    };


    const handleBack = () => {
        if (currentStep === 'verification') {
            setCurrentStep('form');
        } else if (currentStep === 'success') {
            // Instead of going back to verification, show confirmation
            Swal.fire({
                title: 'Close Application',
                text: 'Are you sure you want to close? Your payment is already completed.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, close',
                cancelButtonText: 'Stay'
            })

        } else {
            navigate(-1);
        }
    };

    const handleClose = () => {
        let message = 'Do you want to close the verification certificate request?';
        let title = 'Are you sure?';

        if (currentStep === 'success') {
            message = 'Your payment is completed. Are you sure you want to close?';
            title = 'Close Application';
        }

        Swal.fire({
            title: title,
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, close it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Always go back
                navigate(-1);
            }
        });
    };
    // Loading indicator
    if (loadingStates.states && states.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading location data...</p>
                </div>
            </div>
        );
    }

    if (currentStep === 'form') {
        return (
            <div className="min-h-screen bg-gray-50 px-6 py-6">
                <div className="mb-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back
                    </button>
                </div>

                <fieldset className="rounded border border-gray-300 bg-white p-6 shadow-lg mx-4 lg:mx-8">
                    <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-600 px-6 py-2 text-xl font-bold text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Request Signed Verification Certificate
                    </legend>

                    <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <h3 className="font-semibold text-yellow-800 mb-2">Note:</h3>
                        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                            <li>Recheck the selected examination for which Verification Certificate to be issued.</li>
                            <li>It is advised to select final examination in which candidate has appeared.</li>
                            <li>A signed Verification Certificate shall be issued through Post/Courier in the name as mentioned below within 15 days from submission of request.</li>
                            <li>Signed Verification Certificate shall be issued after the successful payment of Rs.200 as Verification Fees through online payment gateway.</li>
                        </ol>
                    </div>

                    {(loading || loadingStates.pincodeLookup) && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-600">
                                    {loadingStates.pincodeLookup ? 'Updating location...' : 'Processing...'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6 relative">
                        <h3 className="text-lg font-semibold text-gray-700">To whom certificate should be addressed</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormComponent
                                label={<strong>Designation</strong>}
                                value={formData.designation}
                                onChange={(value) => handleChange('designation', value)}
                                error={errors.designation}
                                required={true}
                                extraClass="font-medium"
                                placeholder="Enter designation"
                            />

                            <FormComponent
                                label={<strong>Organization/Industry Name</strong>}
                                value={formData.organizationName}
                                onChange={(value) => handleChange('organizationName', value)}
                                error={errors.organizationName}
                                required={true}
                                extraClass="font-medium"
                                placeholder="Enter organization/industry name"
                            />
                        </div>

                        <FormComponent
                            label={<strong>Organization/Industry Address</strong>}
                            value={formData.organizationAddress}
                            onChange={(value) => handleChange('organizationAddress', value)}
                            error={errors.organizationAddress}
                            required={true}
                            extraClass="font-medium"
                            placeholder="Enter complete address"
                            type="textarea"
                            rows="3"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <FormComponent
                                    label={<strong>Pin Code</strong>}
                                    value={formData.pinCode}
                                    onChange={(value) => handlePincodeChange('pinCode', value)}
                                    error={errors.pinCode}
                                    required={true}
                                    extraClass="font-medium"
                                    placeholder="Enter pin code"
                                    maxLength="6"
                                    type="tel"
                                />
                                {loadingStates.pincodeLookup && formData.pinCode.length === 6 && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-blue-600">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                                        Looking up address...
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <DropdownComponent
                                label="State"
                                value={formData.stateID.toString()}
                                onChange={(value) => handleDropdownChange('stateID', value)}
                                options={formatOptions(states)}
                                error={errors.stateID}
                                placeholder="Select State"
                                required={true}
                                loading={loadingStates.states}
                            />

                            <DropdownComponent
                                label="District"
                                value={formData.districtID.toString()}
                                onChange={(value) => handleDropdownChange('districtID', value)}
                                options={formatOptions(filteredDistricts)}
                                error={errors.districtID}
                                placeholder={filteredDistricts.length === 0 ? "Loading districts..." : "Select District"}
                                required={true}
                                disabled={!formData.stateID || filteredDistricts.length === 0}
                                loading={loadingStates.districts}
                            />

                            <DropdownComponent
                                label="Taluka"
                                value={formData.talukaID.toString()}
                                onChange={(value) => handleDropdownChange('talukaID', value)}
                                options={formatOptions(filteredTalukas)}
                                error={errors.talukaID}
                                placeholder={
                                    !formData.districtID
                                        ? "Select District first"
                                        : filteredTalukas.length === 0
                                            ? "No talukas available"
                                            : "Select Taluka"
                                }
                                required={true}
                                disabled={!formData.districtID}
                                loading={loadingStates.talukas}
                            />

                            <DropdownComponent
                                label="City/Village"
                                value={formData.cityID.toString()}
                                onChange={(value) => handleDropdownChange('cityID', value)}
                                options={formatOptions(filteredCities)}
                                error={errors.cityID}
                                placeholder={
                                    !formData.talukaID
                                        ? "Select Taluka first"
                                        : filteredCities.length === 0
                                            ? "No cities available"
                                            : "Select City/Village"
                                }
                                required={true}
                                disabled={!formData.talukaID}
                                loading={loadingStates.cities}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <strong>Mobile Number</strong> <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="rounded-md border border-gray-300 bg-gray-100 p-2">+91</span>
                                <input
                                    type="tel"
                                    name="primaryMobile"
                                    value={formData.primaryMobile}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        handleChange('primaryMobile', value);
                                    }}
                                    className={`w-52 rounded-md p-2 border ${errors.primaryMobile ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="Enter 10-digit number"
                                    maxLength="10"
                                    disabled={formData.otpVerified}
                                />
                                {formData.otpVerified ? (
                                    <span className="flex items-center text-green-600">
                                        Verified ✓
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleVerifyClick}
                                        className={`rounded-md px-3 py-2 text-white min-w-[80px] ${otpLoading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-red-500 hover:bg-red-600'
                                            }`}
                                        disabled={otpLoading}
                                    >
                                        {otpLoading ? (
                                            <div className="flex items-center gap-1">
                                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                                <span className="text-xs">Sending</span>
                                            </div>
                                        ) : (
                                            'Verify'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center pt-6 border-t">
                            <div className="space-x-3">
                                <button
                                    onClick={handleProceedToVerification}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Proceed'}
                                </button>

                                <button
                                    onClick={handleClose}
                                    className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        );
    }

    if (currentStep === 'verification') {
        return (
            <div className="min-h-screen bg-gray-50 px-6 py-6">
                <div className="mb-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back
                    </button>
                </div>

                <fieldset className="rounded border border-gray-300 bg-white p-6 shadow-lg mx-4 lg:mx-8">
                    <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-600 px-6 py-2 text-xl font-bold text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Certification Verification Processed
                    </legend>

                    {/* Show loading overlay when payment is processing */}
                    {isPaymentProcessing && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                                <p className="text-gray-700 font-medium">Processing your payment...</p>
                                <p className="text-sm text-gray-500 mt-2">Please do not close this window</p>
                            </div>
                        </div>
                    )}

                    <div className={`mt-6 text-center ${isPaymentProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg mb-6">
                            <div className="space-y-3 text-center">
                                <div className="flex flex-col items-center">
                                    <span className="font-medium text-gray-600 mb-1">Verification Request No:</span>
                                    <span className="font-bold text-blue-800 text-lg">{verificationData.requestNo}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="font-medium text-gray-600 mb-1">Profile ID:</span>
                                    <span className="font-bold text-blue-800 text-lg">{verificationData.profileId}</span>
                                </div>
                            </div>
                        </div>

                        {feeData && feeData.Fee && !feeData.Fee.IsPaid ? (
                            <div className="mb-6">
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="text-center">
                                        <CreditCard className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{feeData.Fee.Purpose}</h3>
                                        <div className="text-3xl font-bold text-emerald-600 mb-4">
                                            ₹{feeData.Fee.FeeAmount.toLocaleString('en-IN')}
                                        </div>
                                        <button
                                            onClick={initiatePayment}
                                            disabled={!feeData.Fee.IsEligibleToPay || processing || isPaymentProcessing}
                                            className={`py-3 px-6 rounded-lg font-semibold transition-all duration-200 inline-block ${feeData.Fee.IsEligibleToPay && !processing && !isPaymentProcessing
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            style={{ minWidth: '180px' }}
                                        >
                                            {processing || isPaymentProcessing ? (
                                                <span className="flex items-center justify-center">
                                                    <Loader className="w-5 h-5 animate-spin mr-2" />
                                                    Processing...
                                                </span>
                                            ) : (
                                                'Proceed to Pay'
                                            )}
                                        </button>
                                        {!feeData.Fee.IsEligibleToPay && feeData.Fee.NotEligibleMsg && (
                                            <p className="text-sm text-red-600 mt-3">{feeData.Fee.NotEligibleMsg}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 bg-white rounded-xl shadow-lg p-6">
                                    <div className="text-center">
                                        <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                                        <h4 className="font-semibold text-gray-900 mb-2">Secure Payment</h4>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Lock className="w-4 h-4" />
                                                <span>256-bit SSL Encryption</span>
                                            </div>
                                            <p>Powered by Razorpay</p>
                                            <p>Your payment information is secure</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : feeData && feeData.Fee && feeData.Fee.IsPaid ? (
                            <div className="mb-6">
                                <div className="bg-green-50 border border-green-200 rounded-xl shadow-lg p-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Completed</h3>
                                        <p className="text-green-700">Your payment has been successfully processed.</p>
                                        <p className="text-sm text-green-600 mt-2">Transaction ID: {feeData.Fee.TransactionId || verificationData.transactionId}</p>
                                        <button
                                            onClick={() => setCurrentStep('success')}
                                            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            View Payment Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleClose}
                                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </fieldset>
            </div>
        );
    }

    if (currentStep === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 px-6 py-6">
                <div className="mb-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back
                    </button>
                </div>

                <fieldset className="rounded border border-gray-300 bg-white p-6 shadow-lg mx-4 lg:mx-8">
                    <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-600 px-6 py-2 text-xl font-bold text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Payment Successful
                    </legend>

                    <div className="mt-6">
                        {/* Success Icon and Message */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
                            <p className="text-gray-600">Your verification certificate request has been submitted successfully.</p>
                        </div>

                        {/* Details Section */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
                            <div className="max-w-3xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column */}
                                    <div>
                                        <div className="mb-6">
                                            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Verification Request No</div>
                                            <div className="text-lg font-bold text-gray-800 break-all">{verificationData.requestNo}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Profile ID</div>
                                            <div className="text-lg font-bold text-gray-800 break-all">{verificationData.profileId}</div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="md:pl-40">
                                        <div className="mb-6">
                                            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Payment Status</div>
                                            <div>
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                    SUCCESSFUL
                                                </span>
                                            </div>
                                        </div>
                                        {verificationData.transactionId && (
                                            <div>
                                                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Transaction ID</div>
                                                <div className="text-base font-semibold text-gray-700 font-mono break-all">{verificationData.transactionId}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Information Card */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-blue-800 mb-1">Important Information</h4>
                                    <p className="text-sm text-blue-700 leading-relaxed">
                                        Your verification certificate request has been processed successfully.
                                        The signed certificate will be sent to your provided address within 15 days via post/courier.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Details Section */}
                        {verificationData.transactionId && (
                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 rounded border border-gray-300 bg-gray-600 px-6 py-2 w-fit">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                        </svg>
                                        <h3 className="text-xl font-bold text-white">Transaction Details</h3>
                                    </div>
                                </div>
                                <TransactionDetailsPage
                                    transactionID={verificationData?.transactionId}
                                    fromSignedVerification={true}
                                />
                            </div>
                        )}

                        {/* Action Buttons
                    <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleDownloadCertificate}
                            className="bg-blue-600 text-white py-2.5 px-6 rounded-md hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Download Certificate
                        </button>

                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium text-sm"
                        >
                            Close
                        </button>
                    </div> */}
                    </div>
                </fieldset>
            </div>
        );
    }
    return null;
};

export default SignedVerificationCertificate;