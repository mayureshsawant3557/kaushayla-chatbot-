import { CreditCard, Calendar, User, BookOpen, Clock, AlertCircle, CheckCircle, Loader, Shield, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import agent from '../../../lib/api/agent';
import { GetFeeToPay, SetFeeTransactionResponse, InitiatePayment, HandleResponse } from '../../../Endpoints_All/Fee/feeManagement';
import { rzpkey } from '../../../Endpoints_All/Config/baseConfig';
const FeePaymentPage = () => {
    const [feeData, setFeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [transactionId, setTransactionId] = useState(null);
    // Extract parameters from URL pattern
    const getUrlParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            PayeeID: urlParams.get('A1'),
            PhaseID: urlParams.get('PhaseId'),
            
            
        };
    };

    const navigate = useNavigate();

    // check 
    var transactionIdFromResponse;
    let lastRazorpayOrder = null;

    // Fetch fee data from API
    const fetchFeeData = async () => {
        try {
            setLoading(true);
            setError(null);
            const { PayeeID, PhaseID } = getUrlParams();

            if (!PayeeID || !PhaseID) {
                throw new Error('Missing required parameters (PayeeID or PhaseID)');
            }

            const response = await agent.get(
                `${GetFeeToPay}?PayeeID=${PayeeID}&PhaseID=${PhaseID}`
            );

            if (!response.status === 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.data;
            if (data.Status === 'Success') {
                setFeeData(data.Data);
            } else {
                throw new Error(data.Message || 'Failed to fetch fee data');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching fee data:', err);
        } finally {
            setLoading(false);
        }
    };

   
    // Create Razorpay order via backend API
    const createRazorpayOrder = async () => {
        try {
            const { PayeeID: candidateId, PhaseID: phaseId } = getUrlParams();

            if (!feeData?.Fee?.FeeAmount) throw new Error('Invalid fee amount');
            if (!candidateId || !phaseId) throw new Error('Missing candidateId or phaseId');

            const payload = {
                CandidateId: parseInt(candidateId, 0),
                PhaseId: parseInt(phaseId, 10),
                FeeAmount: feeData.Fee.FeeAmount
            };


            //const response = await fetch(InitiatePayment, {
            //    method: 'POST',
            //    headers: {
            //        'Content-Type': 'application/json'
            //    },
            //    body: JSON.stringify(payload)
            //});
            const response = await agent.post(
                InitiatePayment,
                payload
            );
            
           // const rawText = await response.text();
           //const rawText = await response.data.toString();
           // console.log('Raw response:', rawText);
            // const result = JSON.parse(rawText);

            const result = response.data;

            transactionIdFromResponse = result.Data.TransactionId;
            lastRazorpayOrder = result?.Data?.RazorpayOrder ?? lastRazorpayOrder;


            const razorpayOrder = result?.Data?.RazorpayOrder.OrderId ;
            if (!razorpayOrder) {
                throw new Error("Razorpay Order ID not generated");
            }

            //if (!response.ok) {
            //    const errorMessage = result.Message || `HTTP ${response.status}`;
            //    throw new Error(`Failed to create order: ${errorMessage}`);
            //}

            if (result.Status === 'Success') {
                return result.Data.RazorpayOrder;
            } else {
                throw new Error(result.Message || 'Order creation failed');
            }
        } catch (error) {
            console.error('Order creation error:', error);
            throw new Error(`Failed to create Razorpay order: ${error.message}`);
        }
    };



    const sendTransactionResponse = async (
        paymentResponse,
        order,
        status = 'success'
    ) => {
        try {

            const { PayeeID, PhaseID } = getUrlParams();


            //const { data: { ip: clientIP } } = await agent.get(
            //    'https://api.ipify.org?format=json'
            //);
            // const order = await createRazorpayOrder();

            // single order create 
            const order = lastRazorpayOrder;
            const txnId = transactionIdFromResponse;

            const transactionData = {
                TransactionID: txnId , //transactionIdFromResponse
                PayeeID: Number(PayeeID),
                PayeeApplicationID: feeData.Fee.PayeeApplicationID,
                PayeeDisplayApplicationId: feeData.Fee.PayeeDisplayApplicationId,
                PayeeName: order.Name,
                PayeeMobileNo: order.Mobile,
                PayeeEMailID: order.Email,
                FeeAmount: feeData.Fee.FeeAmount,
                ServiceCharge: 0,
                TotalAmount: feeData.Fee.FeeAmount,
                IsValid: status === true ? true : false,
                IsPaid: status === true ? true : false,
                IsReconciled: false,
                TransactionDate: new Date().toISOString(),
                LastPaymentdate: feeData.Fee.LastPaymentDate ?? null,
                BankRefereneceNo: paymentResponse.razorpay_payment_id,
                PayGateID: paymentResponse?.razorpay_payment_id,
                PaymentDate: new Date().toISOString(),
                Purpose: feeData.Fee.Purpose,
                PhaseID: Number(PhaseID),
                ReceiptURL: '',
                Optional1: paymentResponse?.razorpay_order_id ?? order.orderId,
                Optional2: paymentResponse?.razorpay_signature,
                Optional3: '',
                Optional4: '',
                Optional5: '',
                GatewayResponse: JSON.stringify(paymentResponse),
                ErrorMessage: status === 'failed' ? 'Payment failed' : '',
                RefundDate: '',
                IsRefunded: false,
                IsEligibleForRefund: status === 'success',
                ChargeBackDate: '',
                IsChargeBackAccepted: false,
                TxStatus: status === 'success' ? 'SUCCESS' : 'FAILED',
                PayeeCategory: feeData.Fee.PayeeCategory ?? "",
                PaymentVendor: 'Razorpay',
                IsPushResponse: true,
                IsAPICheck: true,
                VendorId: 1,
                Course: feeData.Fee.Course,
                AcademicYear: feeData.Fee.AcademicYear,
                BatchId: feeData.Fee.BatchId ?? 0,
                OrderId: order.OrderId
            };

            //const url = `${SetFeeTransaction}?IPAddress=${clientIP}`;
            const url = `${SetFeeTransactionResponse}`;


            const { data: result } = await agent.post(url, transactionData);



            return {
                Status: result.Status ?? 'Success',
                Message: result.Message ?? 'Transaction saved successfully',
                Data: result.Data ?? result,
                TransactionID: result.Data?.TransactionID ?? result.TransactionID,
                PaymentId: paymentResponse?.razorpay_payment_id
            };
        } catch (error) {
            console.error('❌ Error sending transaction response:', error);
            throw error;
        }
    };


    // Initialize Razorpay payment
    const initiatePayment = async () => {
        if (!feeData?.Fee?.IsEligibleToPay) {
            alert(feeData?.Fee?.NotEligibleMsg || 'You are not eligible to make this payment');
            return;
        }
        setProcessing(true);
        setPaymentStatus(null);
        try {
            if (!window.Razorpay) {
                await loadRazorpayScript();
            }
            const order = await createRazorpayOrder();
            const options = {
                key: rzpkey,
                amount: order.Amount,
                currency: order.currency,
                name: feeData.Fee.PayeeName ?? 'Payee',
                description: feeData.Fee.Purpose ?? 'Fee Payment',
                order_id: order.OrderId,
                prefill: {
                    name: feeData.Fee.PayeeName,
                    email: order.Email,
                    contact: order.Mobile
                },
                notes: {
                    application_id: feeData.Fee.PayeeDisplayApplicationId,
                    course: feeData.Fee.Course,
                    academic_year: feeData.Fee.AcademicYear,
                    payee_id: getUrlParams().PayeeID,
                    phase_id: getUrlParams().PhaseID,
                    unit_code: feeData.Fee.UnitCode

                },
                theme: { color: '#059669' },
                handler: async function (response) {
                    await handlePaymentSuccess(response, order);
                },
                modal: {
                    ondismiss: async function () {
                        setProcessing(false);
                        try {
                            await sendTransactionResponse(null, order, 'failed');
                        } catch (error) {
                            console.error('Error recording cancelled payment:', error);
                        }
                    }
                }
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', async function (response) {
                await handlePaymentFailure(response, order.orderId);
            });
            paymentObject.open();
        } catch (error) {
            setPaymentStatus({
                type: 'error',
                message: 'Failed to initialize payment. Please try again.',
                details: error.message
            });
            setProcessing(false);
        }
    };


    // Handle successful payment
    const handlePaymentSuccess = async (response, order) => {
        try {
            

            //// First save transaction to database
            const transactionResult = await sendTransactionResponse(response, order, 'success');

            // Verify payment using new backend API
            //const verificationResponse = await fetch(HandleResponse, {
            //    method: 'POST',
            //    headers: { 'Content-Type': 'application/json' },
            //    body: JSON.stringify({
            //        razorpayPaymentId: response.razorpay_payment_id,
            //        razorpayOrderId: response.razorpay_order_id,
            //        razorpaySignature: response.razorpay_signature
            //    })
            //});
            const verificationResponse = await agent.post(
                HandleResponse,
                {
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature
                }
            );

            const verificationResult = await verificationResponse.data;



            if (
                verificationResponse.status === 200 &&
                verificationResult.Status === 'Success' &&
                transactionResult.Status === 'Success'
            ) {
                setPaymentStatus({
                    type: 'success',
                    message: 'Congratulations! Your payment has been made successful!',
                    transactionId: verificationResult.Data.TransactionId,
                    paymentId: verificationResult.Data.BankReferenceNo,
                    amount: feeData.Fee.FeeAmount,
                    showTransactionDetails: true
                });
                setTimeout(() => {
                    fetchFeeData();
                }, 2000);
            }

             else {
                throw new Error(
                    verificationResult.Message ||
                    transactionResult.Message ||
                    'Payment processing failed'
                );
            }

        } catch (error) {
            console.error('Error handling payment success:', error);
            setPaymentStatus({
                type: 'warning',
                message: 'Payment completed but verification failed.',
                details: 'Please contact support with your payment ID for assistance.',
                paymentId: response.razorpay_payment_id
            });
        } finally {
            setProcessing(false);
        }
    };


    // Verify payment with backend
    //const verifyPayment = async (orderId, paymentId, signature) => {
    //    try {
    //        const response = await fetch(VerifyPayment, {
    //            method: 'POST',
    //            headers: {
    //                'Content-Type': 'application/json',
    //            },
    //            body: JSON.stringify({
    //                OrderId: orderId,
    //                PaymentId: paymentId,
    //                Signature: signature
    //            })
    //        });

    //        console.log('Verifying payment with backend:', response);

    //        if (!response.ok) {
    //            throw new Error(`Payment verification failed: ${response.status}`);
    //        }

    //        const result = await response.json();
    //        return result;
    //    } catch (error) {
    //        console.error('Error verifying payment:', error);
    //        throw error;
    //    }
    //};

    // Handle payment failure
    const handlePaymentFailure = async (response, order) => {
        try {

            // Send failed transaction response to API
            await sendTransactionResponse(response, order, 'failed');

            setPaymentStatus({
                type: 'error',
                message: 'Payment failed!',
                details: response.error?.description || 'Please try again or contact support.',
                errorCode: response.error?.code
            });

        } catch (error) {
            console.error('Error handling payment failure:', error);
            setPaymentStatus({
                type: 'error',
                message: 'Payment failed and could not record the transaction.',
                details: 'Please contact support for assistance.'
            });
        } finally {
            setProcessing(false);
        }
    };

    // Load Razorpay script dynamically
    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Razorpay script'));
            document.body.appendChild(script);
        });
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const cleanedDate = this.lastPaymentDate.replace(/\s+/g, ' ').trim();
            return new Date(cleanedDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Reset payment status
    const resetPaymentStatus = () => {
        setPaymentStatus(null);
    };

    // Navigate to transaction history (placeholder function)
    // Navigate to transaction history (corrected function)
    //const goToTransactionHistory = () => {
    //    // Get transactionId from paymentStatus state (set in handlePaymentSuccess)
    //    const transactionId = paymentStatus?.transactionId;

    //    if (!transactionId) {
    //        alert('Transaction ID missing!');
    //        return;
    //    }

    //    // Navigate to /Candidate/TransactionHistory with ?txn=transactionId
    //    navigate(`/Candidate/TransactionHistory?txn=${encodeURIComponent(transactionId)}`);
    //};

    useEffect(() => {
        fetchFeeData();
    }, []);

    const handleNavigationAfterPayment = () => {
        const { PayeeID, PhaseID } = getUrlParams();
        if(PhaseID === '2') {
            navigate('/Fee/TransactionHistory');
        } else if(PhaseID==='1' || PhaseID==='6') {
            navigate("/Candidate/MainCourseAdmissionApply");
        } else{
            navigate("/Institute/InspectionRequest");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading fee details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Fee Details</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchFeeData}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!feeData?.Fee) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Fee Data Found</h2>
                    <p className="text-gray-600">Unable to retrieve fee information for this application.</p>
                </div>
            </div>
        );
    }

    const { Fee, PaidTransactions } = feeData;
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Fee Payment Portal</h1>
                    <p className="text-gray-600">Complete your application fee payment securely</p>
                </div>

                {/* Payment Status Alert */}
                {paymentStatus && (
                    <div className={`mb-6 rounded-lg border ${paymentStatus.type === 'success' ? 'bg-green-50 border-green-200' :
                        paymentStatus.type === 'error' ? 'bg-red-50 border-red-200' :
                            paymentStatus.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-blue-50 border-blue-200'
                        }`}>
                        {paymentStatus.showTransactionDetails ? (
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-green-800 text-lg">
                                                {paymentStatus.message}
                                            </h3>
                                        </div>
                                    </div>
                                    {/*<button*/}
                                    {/*    onClick={resetPaymentStatus}*/}
                                    {/*    className="text-gray-400 hover:text-gray-600"*/}
                                    {/*>*/}
                                    {/*    ×*/}
                                    {/*</button>*/}
                                </div>

                                <div className="space-y-2 text-green-700 mb-4">
                                    <p><span className="font-medium">Transaction ID:</span> {paymentStatus.transactionId}</p>
                                    <p><span className="font-medium">Payment ID:</span> {paymentStatus.paymentId}</p>
                                    <p><span className="font-medium">Amount(Rs.):</span> {paymentStatus.amount}</p>
                                </div>

                                {/*<p className="text-green-700 mb-4">*/}
                                {/*    Please click on <span className="font-medium">Go To Transaction History</span> tab to print receipt.*/}
                                {/*</p>*/}

                                {/*<div className="flex justify-end">*/}
                                {/*    <button*/}
                                {/*        onClick={goToTransactionHistory}*/}
                                {/*        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors"*/}
                                {/*    >*/}
                                {/*        Go To Transaction History*/}
                                {/*    </button>*/}
                                {/*</div>*/}
                                {/*<button onClick={() => window.history.back()} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors duration-200" > Next </button>*/}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleNavigationAfterPayment()}
                                        // onClick={() => navigate("/Institute/InspectionRequest")}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors duration-200"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        {paymentStatus.type === 'success' && <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />}
                                        {paymentStatus.type === 'error' && <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />}
                                        {paymentStatus.type === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />}
                                        <div>
                                            <h3 className={`font-semibold ${paymentStatus.type === 'success' ? 'text-green-800' :
                                                paymentStatus.type === 'error' ? 'text-red-800' :
                                                    paymentStatus.type === 'warning' ? 'text-yellow-800' :
                                                        'text-blue-800'
                                                }`}>
                                                {paymentStatus.message}
                                            </h3>
                                            <p className={`text-sm mt-1 ${paymentStatus.type === 'success' ? 'text-green-700' :
                                                paymentStatus.type === 'error' ? 'text-red-700' :
                                                    paymentStatus.type === 'warning' ? 'text-yellow-700' :
                                                        'text-blue-700'
                                                }`}>
                                                {paymentStatus.details}
                                            </p>
                                            {paymentStatus.errorCode && (
                                                <p className="text-xs text-gray-600 mt-1">Error Code: {paymentStatus.errorCode}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={resetPaymentStatus}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content */}

                {!paymentStatus && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Fee Details Card */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
                                <h2 className="text-xl font-semibold mb-2">Application Details</h2>
                                <p className="text-emerald-100">Application ID: {Fee.PayeeDisplayApplicationId}</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Candidate Information */}
                                <div className="flex items-start space-x-4">
                                    <User className="w-6 h-6 text-emerald-600 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Name</h3>
                                        <p className="text-gray-600">
                                            {Fee.PayeeName}
                                            {/*{Fee.PayeeDisplayApplicationId?.includes('V') && (*/}
                                            {/*    <span className="text-gray-600"> SKILL DEVELOPMENT INSTITUTE</span>*/}
                                            {/*)}*/}
                                        </p>
                                    </div>
                                </div>

                                {/* Course Information */}
                                <div className="flex items-start space-x-4">
                                    <BookOpen className="w-6 h-6 text-emerald-600 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Purpose</h3>
                                        <p className="text-gray-600">{Fee.Course  || Fee.Purpose}</p>
                                    </div>
                                </div>

                                {/* Academic Year */}
                                <div className="flex items-start space-x-4">
                                    <Calendar className="w-6 h-6 text-emerald-600 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Academic Year</h3>
                                        <p className="text-gray-600">{Fee.AcademicYear}</p>
                                    </div>
                                </div>

                                {/* Last Payment Date */}
                                <div className="flex items-start space-x-4">
                                    <Clock className="w-6 h-6 text-emerald-600 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Last Payment Date</h3>
                                        <p className="text-gray-600">{formatDate(Fee.LastPaymentDate)}</p>
                                    </div>
                                </div>

                                {/* Eligibility Status */}
                                <div className="flex items-start space-x-4">
                                    {Fee.IsEligibleToPay ? (
                                        <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Payment Eligibility</h3>
                                        <p className={`${Fee.IsEligibleToPay ? 'text-green-600' : 'text-red-600'}`}>
                                            {Fee.IsEligibleToPay ? 'Eligible to Pay' : Fee.NotEligibleMsg || 'Not Eligible'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className="space-y-6">
                            {/* Fee Amount Card */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="text-center">
                                    <CreditCard className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{Fee.Purpose}</h3>
                                    <div className="text-3xl font-bold text-emerald-600 mb-4">
                                        ₹{Fee.FeeAmount.toLocaleString('en-IN')}
                                    </div>

                                    <button
                                        onClick={initiatePayment}
                                        disabled={!Fee.IsEligibleToPay || processing}
                                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${Fee.IsEligibleToPay && !processing
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center">
                                                <Loader className="w-5 h-5 animate-spin mr-2" />
                                                Processing...
                                            </span>
                                        ) : (
                                            'Proceed to Pay'
                                        )}
                                    </button>

                                    {!Fee.IsEligibleToPay && Fee.NotEligibleMsg && (
                                        <p className="text-sm text-red-600 mt-3">{Fee.NotEligibleMsg}</p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Security Info */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
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
                    </div>
                )}


                {/* Previous Transactions */}
                {/*{PaidTransactions && PaidTransactions.length > 0 && (*/}
                {/*    <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">*/}
                {/*        <div className="bg-gray-50 px-6 py-4 border-b">*/}
                {/*            <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>*/}
                {/*        </div>*/}
                {/*        <div className="p-6">*/}
                {/*            <div className="space-y-4">*/}
                {/*                {PaidTransactions.map((transaction, index) => (*/}
                {/*                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">*/}
                {/*                        <div>*/}
                {/*                            <p className="font-medium text-gray-900">*/}
                {/*                                Transaction #{transaction.id || transaction.TransactionID}*/}
                {/*                            </p>*/}
                {/*                            <p className="text-sm text-gray-600">*/}
                {/*                                {formatDate(transaction.date || transaction.TransactionDate)}*/}
                {/*                            </p>*/}
                {/*                        </div>*/}
                {/*                        <div className="text-right">*/}
                {/*                            <p className="font-semibold text-green-600">*/}
                {/*                                ₹{(transaction.amount || transaction.TotalAmount || 0).toLocaleString('en-IN')}*/}
                {/*                            </p>*/}
                {/*                            <p className="text-sm text-gray-600">*/}
                {/*                                {transaction.status || transaction.TxStatus}*/}
                {/*                            </p>*/}
                {/*                        </div>*/}
                {/*                    </div>*/}
                {/*                ))}*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        </div>
    );
};

export default FeePaymentPage;