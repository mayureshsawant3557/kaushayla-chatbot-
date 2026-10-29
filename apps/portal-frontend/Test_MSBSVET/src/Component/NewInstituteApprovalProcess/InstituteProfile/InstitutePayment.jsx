import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { GetFeeToPay, HandleResponse, InitiatePayment, SetFeeTransactionResponse } from "../../../Endpoints_All/Fee/feeManagement";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import agent from "../../../lib/api/agent";
import Button from "../../base/Button";
import { useNavigate } from "react-router-dom";
import { rzpkey } from "../../../Endpoints_All/config/baseConfig";
import useLoading from "../../../Hooks/useLoading";
import Swal from 'sweetalert2';
import { useAuth } from "../../../Hooks/AuthContext";
import { ThemeContext } from "../../Context/ThemeContext";
import { getDeviceIP } from "../../../utils/CommonHelper";

const InstitutePayment = () => {

    const columns = [
        { header: "Sr. No.", key: "srNo", width: "80px", className: "text-center" },
        { header: "Fee Type", key: "purpose", className: "text-center" },
        { header: "Transaction ID", key: "transactionID", className: "text-center" },
        { header: "Amount (₹)", key: "feeAmount", type: "currency", className: "text-center" },
        { header: "Payment Id", key: "bankRefereneceNo", className: "text-center" },
        { header: "Payment Date", key: "paymentDate", className: "text-center" },
        {
            header: "Print Receipt",
            key: "receiptURL",
            type: "link",
            linkUrl: (row) => row.receiptURL,
            className: "text-center"
        }
    ];
const { userInfo } = useAuth();
    const UserID = userInfo?.UserID;
    const UserTypeID = userInfo?.UserTypeID;
    const location = useLocation();
    const navigate = useNavigate();

    const [feeData, setFeeData] = useState(null);
    const [paidTransactions, setPaidTransactions] = useState([]);
    const [instituteId, setInstituteId] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);

    const [showVerificationUI, setShowVerificationUI] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [existingStatus, setExistingStatus] = useState('');
    const [existingRemark, setExistingRemark] = useState('');
    const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
    const { startLoading, stopLoading, isLoading } = useLoading();
    const [verificationStatus, setVerificationStatus] = useState("");
    const [verificationRemark, setVerificationRemark] = useState("");
    const { color } = useContext(ThemeContext);
    const [ipAddress, setIpAddress] = useState("");


    var transactionIdFromResponse;
    let lastRazorpayOrder = null;

    const getHashCode = (str) => {
        if (!str) return 0;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    const getInstituteIdFromQueryString = () => {
        const searchParams = new URLSearchParams(location.search);
        let p1 = searchParams.get('P1');
        let p2 = searchParams.get('P2');

        if (p1 && p2) {
            const calculatedHash = getHashCode(p1).toString();
            if (calculatedHash === p2) {
                return parseInt(p1);
            }
        } else if (p1) {
            return parseInt(p1);
        }

        const pathParts = location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && !isNaN(parseInt(lastPart))) {
            return parseInt(lastPart);
        }

        const instituteIdFromSession = userInfo?.InstituteID;
        if (instituteIdFromSession) {
            return parseInt(instituteIdFromSession);
        }

        if (location.state?.instituteId) {
            return parseInt(location.state.instituteId);
        }

        return null;
    };

    const getFeeToPay = async () => {
        let payeeId = UserID;

        if (UserTypeID === 81) {
            const id = getInstituteIdFromQueryString();
            if (id) {
                payeeId = id;
                setInstituteId(id);
            } else {
                return;
            }
        }

        if (!payeeId) return;

        const PhaseID = 3;

        try {
            const response = await agent.get(
                `${GetFeeToPay}?PayeeID=${payeeId}&PhaseID=${PhaseID}`
            );

            if (response?.data?.Data?.Fee && response?.data?.Status === 'Success') {

                const fee = response.data.Data.Fee;

                setFeeData(fee);
                setPaidTransactions(response.data.Data.PaidTransactions || []);

                if (UserTypeID === 81 && fee.FeeAmount <= 0) {
                    try{
                        const statusResponse = await agent.get(`/api/InstituteBase/GetProposedInstituteStatus/${payeeId}`);
                        const statusData = statusResponse.data?.Data;
                        if(statusData?.IsPaymentTransactionApproved==="R"){
                            setApprovalStatus("R");
                            setRejectReason("Authorized Representative and/ or Principal Promoter not yet verified. Verify Authorized Representative and/ or Principal Promoter Profile. Read User Manual for Staff/ Management available on portal under User Manual Section.");
                            setExistingStatus("R");
                            setIsAlreadyVerified(false);
                            
                        } else {
                            setApprovalStatus("V");
                            setRejectReason("ALREADY VERIFIED");
                            setExistingStatus("V");
                            setIsAlreadyVerified(true);
                        }

                    } catch (error) {
                        console.error("Error fetching verification status:", error);
                    }
                }

                if (UserTypeID !== 81 && fee.FeeAmount <= 0) {
                    try {
                        const statusResponse = await agent.get(
                            `/api/InstituteBase/GetProposedInstituteStatus/${payeeId}`
                        );

                        const statusData = statusResponse.data?.Data;

                        if (statusData) {
                            setVerificationStatus(statusData.IsPaymentTransactionApproved);

                            if (statusData.IsPaymentTransactionApproved === "V") {
                                setVerificationRemark("ALREADY VERIFIED");
                            } else {
                                setVerificationRemark(statusData.PaymentTransactionRemark);
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching verification status:", error);
                    }
                }

            } else {
                setFeeData(null);
                setPaidTransactions([]);
            }

        } catch (error) {
            console.error('Error fetching fee data:', error);
            setFeeData(null);
            setPaidTransactions([]);
        }
    };
    useEffect(() => {
        fetchIP();
        getFeeToPay();
        
    }, [UserID, UserTypeID, location.search]);

    useEffect(() => {
        if (UserTypeID === 81) {
            setShowVerificationUI(true);
        }
    }, [UserTypeID]);


      const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };

    const extractHref = (html) => {
        const hrefMatch = html?.match(/href=([^ >]+)/);
        if (!hrefMatch) return null;
        const url = hrefMatch[1];
        const params = new URLSearchParams(url.split('?')[1]);
        return params.get('TransactionID');
    };

    const tableData = (paidTransactions || []).map((transaction, index) => ({
        srNo: index + 1,
        purpose: transaction.Purpose,
        transactionID: transaction.TransactionID,
        feeAmount: transaction.FeeAmount,
        bankRefereneceNo: transaction.BankRefereneceNo,
        paymentDate: transaction.PaymentDate,
        receiptURL: extractHref(transaction.ReceiptURL)
    }));

    const renderCell = (item, col) => {
        if (col.key === "receiptURL") {
            return (
                <Button variant='primary' size='sm' onClick={() => handlePrintTransactionReceipt(item?.transactionID)}>
                    Print Receipt
                </Button>
            );
        }
        return undefined;
    };

    const handlePrintTransactionReceipt = (item) => {
        if (!item) {
            return;
        }
        const popupWidth = 1000;
        const popupHeight = 750;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;
        window.open(
            `${window.location.origin}/React/InstOnlineReceipt?TransactionID=${item}`,
            "InstOnlineReceipt",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

    }

    const handleCloseConfirm = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to close?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes",
            cancelButtonText: "No"
        });

        if (result.isConfirmed) {
            const hash = String(instituteId).getHashCode();
            navigate(`/InstituteDash?P1=${instituteId}&P2=${hash}`);
        }
    };

    const handleUpdateVerification = async () => {
        if (!approvalStatus) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please select Approved / Reject status",
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        if (approvalStatus === "R" && !rejectReason.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please enter a reason for rejection",
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        const id = instituteId || getInstituteIdFromQueryString();

        try {
            const payload = {
                instituteID: id,
                remark: rejectReason?.toUpperCase() || "",
                status: approvalStatus,
                pageCode: "InstitutePayment",
                createdBy: userInfo?.UserLoginID,
                ipAddress: ipAddress
            };

            await agent.post("/api/InstituteBase/update-verification-status", payload);

            const hash = getHashCode(id?.toString() || "");
            navigate(`/Institute/PromotingOrganization?P1=${id}&P2=${hash}`);

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Something went wrong", "error");
        }
    };
    // RAZORPAY PAYMENT FUNCTIONS
    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Razorpay script'));
            document.body.appendChild(script);
        });
    };

    const createRazorpayOrder = async () => {
        try {
            const phaseId = 3;
            if (!feeData?.FeeAmount) throw new Error('Invalid fee amount');
            if (!UserID || !phaseId) throw new Error('Missing candidateId or phaseId');

            const payload = {
                CandidateId: parseInt(UserID, 0),
                PhaseId: phaseId,
                FeeAmount: feeData?.FeeAmount
            };

            const response = await agent.post(InitiatePayment, payload);
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

    const sendTransactionResponse = async (paymentResponse, order, status = 'success') => {
        try {
            const razorpayOrder = lastRazorpayOrder;
            const txnId = transactionIdFromResponse;

            const transactionData = {
                TransactionID: txnId,
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
                BankRefereneceNo: paymentResponse?.razorpay_payment_id,
                PayGateID: paymentResponse?.razorpay_payment_id,
                PaymentDate: new Date().toISOString(),
                Purpose: feeData.Purpose,
                PhaseID: Number(3),
                ReceiptURL: '',
                Optional1: paymentResponse?.razorpay_order_id ?? order?.orderId,
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

    const handlePaymentSuccess = async (response, order) => {
        try {
            const transactionResult = await sendTransactionResponse(response, order, 'success');

            const verificationResponse = await agent.post(HandleResponse, {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
            });

            const verificationResult = verificationResponse.data;

            if (verificationResponse.status === 200 &&
                verificationResult.Status === 'Success' &&
                transactionResult.Status === 'Success'
            ) {
                alert('Congratulations! Your payment has been made successful!');
                setTimeout(() => {
                    getFeeToPay();
                }, 2000);
            } else {
                throw new Error('Payment processing failed');
            }
        } catch (error) {
            console.error('Error handling payment success:', error);
            alert('Payment completed but verification failed. Please contact support.');
        } finally {
            setProcessing(false);
        }
    };

    const handlePaymentFailure = async (response, order) => {
        try {
            await sendTransactionResponse(response, order, 'failed');
            alert('Payment failed! Please try again.');
        } catch (error) {
            console.error('Error handling payment failure:', error);
        } finally {
            setProcessing(false);
        }
    };

    const initiatePayment = async () => {
        if (!feeData?.IsEligibleToPay) {
            alert(feeData?.NotEligibleMsg || 'You are not eligible to make this payment');
            return;
        }
        setProcessing(true);
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
            alert('Failed to initialize payment. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <>
            {UserTypeID === 81 ? (
                // SECRETARY VIEW
                <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
                    {(!feeData || feeData?.FeeAmount <= 0) && (
                        <div className="mb-4 rounded-md bg-cyan-100 text-cyan-800 p-2 font-medium">
                            Currently you do not have any pending fee to pay.
                        </div>
                    )}

                    <fieldset className="mb-4 rounded-md border p-4">
                        <legend className={`rounded ${color} px-4 py-1 text-white`}>
                            Registration Fee
                        </legend>

                        {/* Show fee details for secretary */}
                        {feeData && feeData?.FeeAmount > 0 && (
                            <div className="mt-4 space-y-3 text-sm md:text-base">
                                <div className="grid grid-cols-2">
                                    <span className="font-semibold text-gray-600 text-right">Institute Profile ID :</span>
                                    <span className="font-medium text-left pl-2">{feeData?.PayeeDisplayApplicationId}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="font-semibold text-gray-600 text-right">Institute Name :</span>
                                    <span className="font-medium text-left pl-2">{feeData?.PayeeName}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="font-semibold text-gray-600 text-right">Fee Type :</span>
                                    <span className="font-medium text-left pl-2">{feeData?.Purpose}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="font-semibold text-gray-600 text-right">Amount (₹) :</span>
                                    <span className="font-medium text-left pl-2">{feeData?.FeeAmount}</span>
                                </div>
                            </div>
                        )}

                        {paidTransactions && paidTransactions.length > 0 && (
                            <>
                                <h2 className="text-2xl font-bold mt-4 mb-4">Successful Transactions</h2>
                                <FilteredTableComponent
                                    data={tableData ?? []}
                                    columns={columns}
                                    searchable={false}
                                    sortable={false}
                                    showExport={false}
                                    showSearch={false}
                                    emptyStateMessage="No Transactions Found"
                                    renderCell={renderCell}
                                />
                                <div className="mt-4 text-sm font-semibold">
                                    Note: For print receipt, check Miscellaneous → payment history link.
                                </div>
                            </>
                        )}


                        {/* Secretary Verification Section */}
                        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                            <h3 className="text-md font-normal mb-3">Select Approved Reject Status <span className="text-red-500">*</span></h3>
                            <div className="flex gap-6 mb-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="V"
                                        checked={approvalStatus === 'V'}
                                        onChange={(e) => setApprovalStatus(e.target.value)}
                                        disabled={isAlreadyVerified || feeData?.FeeAmount <= 0}
                                        className="h-4 w-4 accent-gray-400 cursor-not-allowed"
                                    />
                                    <span className="ml-2 text-sm">Verified</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="R"
                                        checked={approvalStatus === 'R'}
                                        onChange={(e) => setApprovalStatus(e.target.value)}
                                        disabled={isAlreadyVerified || feeData?.FeeAmount <= 0}
                                        className="h-4 w-4 accent-gray-400 cursor-not-allowed"
                                    />
                                    <span className="ml-2 text-sm">Rejected</span>
                                </label>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-normal mb-2">
                                    Reason for Rejection/ Remark
                                    {approvalStatus === 'R' && !isAlreadyVerified && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm uppercase"
                                    rows="3"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value.toUpperCase())}

                                    placeholder={isAlreadyVerified ? "Already Verified" : "Enter remark..."}
                                />
                            </div>


                        </div>
                        <div className="flex justify-center gap-3 mt-8">
                            <Button variant='primary' onClick={() => navigate(`/InstituteDash?P1=${instituteId}&P2=${String(instituteId).getHashCode()}`)}>Back</Button>
                            <Button variant='success' onClick={handleUpdateVerification}>Proceed</Button>
                            <Button variant='danger' onClick={handleCloseConfirm}>
                                Close
                            </Button>
                        </div>
                    </fieldset>
                </div>
            ) : (
                // INSTITUTE USER VIEW WITH RAZORPAY
                paidTransactions && paidTransactions.length > 0 ? (
                    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
                        <div className="mb-4 rounded-md bg-cyan-100 text-cyan-800 p-2 font-medium">
                            Currently you do not have any pending fee to pay.
                        </div>
                        <fieldset className="mb-4 rounded-md border p-4">
                            <legend
                                className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                            >
                                Registration Fee
                            </legend>
                            <h2 className="text-2xl font-bold mt-4 mb-4">Successful Transactions</h2>
                            <FilteredTableComponent
                                data={tableData ?? []}
                                columns={columns}
                                searchable={false}
                                sortable={false}
                                showExport={false}
                                showSearch={false}
                                emptyStateMessage="No Transactions Found"
                                renderCell={renderCell}
                            />
                            <div className="mt-4 text-sm font-semibold">
                                Note: For print receipt, check Miscellaneous → payment history link.
                            </div>
                            {feeData?.FeeAmount <= 0 &&
                                (verificationStatus === "R" || verificationStatus === "V") && (
                                    <div className="mt-4 p-3 rounded border">

                                        {verificationStatus === "R" && (
                                            <div className="text-red-600">
                                                <p className="font-normal">Verification Status: Rejected</p>
                                                <p className="text-sm">
                                                    Reason for Rejection/ Remark : {verificationRemark?.toUpperCase()}
                                                </p>
                                            </div>
                                        )}

                                        {verificationStatus === "V" && (
                                            <div className="text-green-600">
                                                <p className="font-normal">Verification Status: Verified</p>
                                                <p className="text-sm">
                                                    Reason for Rejection/ Remark : ALREADY VERIFIED
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                )}

                            <div className="flex justify-center gap-3 mt-8">
                                <Button variant='primary' onClick={() => navigate(-1)}>Back</Button>
                                <Button variant='success' onClick={() => navigate('/Institute/PromotingOrganization')}>Next</Button>
                                <Button variant='danger' onClick={() => navigate(-1)}>Close</Button>
                            </div>
                        </fieldset>
                    </div>
                ) : feeData?.IsEligibleToPay && feeData?.FeeAmount > 0 ? (
                    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
                        <fieldset className="mb-4 rounded-md border p-4">
                            <legend
                                className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                            >
                                Institute Registration Fee
                            </legend>
                            <div className="mt-4 space-y-3 text-sm md:text-base">
                                <div className="grid grid-cols-2">
                                    <span className="font-semibold text-gray-600 text-right">Institute Profile ID :</span>
                                    <span className="font-medium text-left pl-2">{feeData?.PayeeDisplayApplicationId}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="font-semibold text-gray-600 text-right">Institute Name :</span>
                                    <span className="font-medium text-left pl-2">{feeData?.PayeeName}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="font-semibold text-gray-600 text-right">Fee Type :</span>
                                    <span className="font-medium text-left pl-2">{feeData?.Purpose}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="font-semibold text-gray-600 text-right">Amount (₹) :</span>
                                    <span className="font-medium text-left pl-2">{feeData?.FeeAmount}</span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-3 mt-8">
                                <Button variant='primary' onClick={() => navigate(-1)}>Back</Button>
                                <Button variant='success' onClick={initiatePayment} disabled={processing}>
                                    {processing ? "Processing..." : "Proceed >>"}
                                </Button>
                                <Button variant='danger' onClick={() => navigate(-1)}>Close</Button>
                            </div>
                        </fieldset>
                    </div>
                ) : (
                    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
                        <div className="mb-4 rounded-md bg-yellow-100 text-yellow-800 p-3 font-medium">
                            {feeData?.NotEligibleMsg || "Currently you do not have any pending fee to pay."}
                        </div>
                        <div className="flex justify-center gap-3 mt-8">
                            <Button variant='primary' onClick={() => navigate(-1)}>Back</Button>
                            <Button variant='danger' onClick={() => navigate(-1)}>Close</Button>
                        </div>
                    </div>
                )
            )}
        </>
    );
};

export default InstitutePayment;