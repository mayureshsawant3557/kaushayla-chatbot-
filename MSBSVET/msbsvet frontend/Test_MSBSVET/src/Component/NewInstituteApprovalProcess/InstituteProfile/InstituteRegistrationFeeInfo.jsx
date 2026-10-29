import { useContext, useEffect, useState } from "react";
import { GetFeeToPay, HandleResponse, InitiatePayment, SetFeeTransaction, SetFeeTransactionResponse } from "../../../Endpoints_All/Fee/feeManagement";
import agent from "../../../lib/api/agent";
import Button from "../../base/Button";
import { useNavigate } from "react-router-dom";
import { sha256 } from "js-sha256";
import { rzpkey } from "../../../Endpoints_All/config/baseConfig";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../Hooks/AuthContext";
import { ThemeContext } from "../../Context/ThemeContext";

const InstituteRegistrationFeeInfo = () => {
    const [searchParams] = useSearchParams();
    const { userInfo } = useAuth();


    const UserID = searchParams.get("PayeeID") || userInfo?.UserID;
    const PhaseID = searchParams.get("PhaseId") || 3;
    const UserTypeID = userInfo?.UserTypeID;

    const navigate = useNavigate();

    const [feeData, setFeeData] = useState(null);
    const [paidTransactions, setPaidTransactions] = useState([]);

    const [processing, setProcessing] = useState(false);

    const [paymentStatus, setPaymentStatus] = useState(null);

    const [transactionId, setTransactionId] = useState(null);
    const { color } = useContext(ThemeContext);

    useEffect(() => {
        if (!UserTypeID && !UserID) {
            return;
        }
        getFeeToPay();
    }, [])

    var transactionIdFromResponse;
    let lastRazorpayOrder = null;

    const getFeeToPay = async () => {
        if (!UserID) {
            return;
        }
        //const PhaseID = 3;
        const response = await agent.get(
            `${GetFeeToPay}?PayeeID=${UserID}&PhaseID=${PhaseID}`
        );
        if (response?.data?.Data?.Fee && response?.data?.Status == 'Success') {
            setFeeData(response?.data?.Data?.Fee);
            setPaidTransactions(response?.data?.Data?.PaidTransactions || [])
        } else {
            setFeeData(null);
            setPaidTransactions([]);
        }


    }

    const extractHref = (html) => {
        const hrefMatch = html?.match(/href=([^ >]+)/);
        if (!hrefMatch) return null;

        const url = hrefMatch[1];
        const params = new URLSearchParams(url.split('?')[1]);
        return params.get('TransactionID');
    };

    const createRazorpayOrder = async () => {
        try {
            //const { PayeeID: candidateId, PhaseID: phaseId } = getUrlParams();

            const phaseId = 3;
            if (!feeData?.FeeAmount) throw new Error('Invalid fee amount');
            if (!UserID || !phaseId) throw new Error('Missing candidateId or phaseId');

            const payload = {
                CandidateId: parseInt(UserID, 0),
                PhaseId: phaseId,
                FeeAmount: feeData?.FeeAmount
            };

            const response = await agent.post(
                InitiatePayment,
                payload
            );



            const result = response.data;

            transactionIdFromResponse = result.Data.TransactionId;
            lastRazorpayOrder = result?.Data?.RazorpayOrder ?? lastRazorpayOrder;


            const razorpayOrder = result?.Data?.RazorpayOrder.OrderId;
            if (!razorpayOrder) {
                throw new Error("Razorpay Order ID not generated");
            }


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


            // single order create 
            //const order = lastRazorpayOrder;
            const razorpayOrder = lastRazorpayOrder;
            const txnId = transactionIdFromResponse;

            const transactionData = {
                TransactionID: txnId, //transactionIdFromResponse
                PayeeID: Number(UserID),
                PayeeApplicationID: feeData.PayeeApplicationID,
                PayeeDisplayApplicationId: feeData.PayeeDisplayApplicationId,
                PayeeName: razorpayOrder.Name,
                PayeeMobileNo: razorpayOrder.Mobile,
                PayeeEMailID: razorpayOrder.Email,
                FeeAmount: feeData.FeeAmount,
                ServiceCharge: 0,
                TotalAmount: feeData.FeeAmount,
                IsValid: status === 'success',
                IsPaid: status === 'success',
                IsReconciled: false,
                TransactionDate: new Date().toISOString(),
                LastPaymentdate: feeData.LastPaymentDate ?? null,
                BankRefereneceNo: paymentResponse.razorpay_payment_id,
                PayGateID: paymentResponse?.razorpay_payment_id,
                PaymentDate: new Date().toISOString(),
                Purpose: feeData.Purpose,
                PhaseID: Number(3),
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
                PayeeCategory: feeData.PayeeCategory ?? "",
                PaymentVendor: 'Razorpay',
                IsPushResponse: true,
                IsAPICheck: true,
                VendorId: 1,
                Course: feeData.Course,
                AcademicYear: feeData.AcademicYear,
                BatchId: feeData.BatchId ?? 0,
                OrderId: razorpayOrder.OrderId
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
            console.error('Error sending transaction response:', error);
            throw error;
        }
    };


    // Initialize Razorpay payment
    const initiatePayment = async () => {
        if (!feeData?.IsEligibleToPay) {
            alert(feeData?.NotEligibleMsg || 'You are not eligible to make this payment');
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
                name: feeData.PayeeName ?? 'Payee',
                description: feeData.Purpose ?? 'Fee Payment',
                order_id: order.OrderId,
                prefill: {
                    name: feeData.PayeeName,
                    email: order.Email,
                    contact: order.Mobile
                },
                notes: {
                    application_id: feeData.PayeeDisplayApplicationId,
                    course: feeData.Course,
                    academic_year: feeData.AcademicYear,
                    payee_id: UserID,
                    phase_id: 3
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
                    amount: feeData.FeeAmount,
                    showTransactionDetails: true
                });
                setTimeout(() => {
                    navigate('/Institute/InstitutePayment');
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

    // Handle payment failure
    const handlePaymentFailure = async (response, order) => {
        try {

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
            return new Date(dateString).toLocaleDateString('en-IN', {
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

    const handleNavigationAfterPayment = () => {
        navigate("/tinstitute/dashboard");
    }


    return (
        <>
            <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
                <fieldset className="mb-4 rounded-md border p-4">
                    <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                        Institute Registration Fee
                    </legend>
                    <div className="mt-4 space-y-3 text-sm md:text-base">

                        <div className="grid grid-cols-2 text-right">
                            <span className="font-semibold text-gray-600">
                                Institute Profile ID :
                            </span>
                            <span className="font-medium text-left pl-2">
                                {feeData?.PayeeDisplayApplicationId}
                            </span>
                        </div>

                        <div className="grid grid-cols-2">
                            <span className="font-semibold text-gray-600 text-right">
                                Institute Name :
                            </span>
                            <span className="font-medium text-left pl-2">
                                {feeData?.PayeeName}
                            </span>
                        </div>

                        <div className="grid grid-cols-2">
                            <span className="font-semibold text-gray-600 text-right">
                                Fee Type :
                            </span>
                            <span className="font-medium text-left pl-2">
                                {feeData?.Purpose}
                            </span>
                        </div>

                        <div className="grid grid-cols-2">
                            <span className="font-semibold text-gray-600 text-right">
                                Amount (₹) :
                            </span>
                            <span className="font-medium text-left pl-2">
                                {feeData?.FeeAmount}
                            </span>
                        </div>

                    </div>
                    <div className="flex justify-center gap-3 mt-8">
                        <Button variant='primary' size='sm' onClick={() => navigate(-1)}>
                            Back
                        </Button>

                        <Button variant='success' size='sm' onClick={() => initiatePayment()}>
                            Proceed &gt;&gt;
                        </Button>

                        <Button variant='danger' size='sm' onClick={() => navigate('/tinstitute/dashboard')}>Close</Button>

                    </div>

                </fieldset>
            </div>
        </>
    );
};

export default InstituteRegistrationFeeInfo;
