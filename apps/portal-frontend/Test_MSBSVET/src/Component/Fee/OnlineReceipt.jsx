import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import independencedayindia20 from "../../assets/independencedayindia20.jpg"
import { GetTransactionDetails } from "../../Endpoints_All/Fee/feeManagement";
import BoardLogo from "../../assets/Board Logo - small size.jpg";
import agent from "../../lib/api/agent";
import useLoading from "../../Hooks/useLoading";

const OnlineReceipt = () => {
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get("TransactionID");

    const [receiptData, setReceiptData] = useState(null);
    const { startLoading, stopLoading } = useLoading();

    useEffect(() => {
        if (transactionId) {
            fetchTransactionDetails();
        } else {
            stopLoading();
        }
    }, [transactionId]);

    useEffect(() => {
        if (receiptData?.TransactionID) {
            const timer = setTimeout(() => {
                document.title =
                    `${receiptData?.PayeeDisplayApplicationId || "Payment"}-PaymentReceipt`
                        .replaceAll("/", "_");

                window.print();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [receiptData]);

    const fetchTransactionDetails = async () => {
        startLoading();

        try {
            const response = await agent.post(
                `${GetTransactionDetails}?TransactionID=${transactionId}`
            );

            if (response?.data?.Status === "Success") {
                setReceiptData(response.data.Data);
            } else {
                setReceiptData(null);
            }
        } catch (error) {
            console.error("Error fetching transaction details:", error);
            setReceiptData(null);
        } finally {
            stopLoading();
        }
    };

    const getReceiptTitle = () => {
        const purpose = receiptData?.Purpose?.toUpperCase()?.trim();

        if (purpose === "INSTITUTE REGISTRATION FEE") {
            return "Institute Registration Fee Receipt";
        } else if (purpose === "INSPECTION FEE") {
            return "Inspection Fee Receipt";
        } else if (purpose === "APPLICATION FORM FEE") {
            return "Application Form Fee Receipt";
        } else {
            return "Examination Fee Receipt";
        }
    };

    const getTransactionStatus = () => {
        let status = receiptData?.IsPaid === true ? "Paid" : "Failed";

        if (receiptData?.IsRefunded) {
            status += " (Refunded)";
        } else if (receiptData?.IsChargeBackAccepted) {
            status += " (Refunded Through ChargeBack)";
        }

        return status;
    };

    if (!receiptData) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    fontSize: "16px",
                    color: "red"
                }}
            >
                Receipt not found.
            </div>
        );
    }

    return (
        <div
            id="receiptPageWrapper"
            style={{
                lineHeight: "normal",
                fontFamily: "'Poppins', sans-serif"
            }}
        >
            <style>{receiptStyles}</style>

            <table className="receipt-header">
                <tbody>
                    <tr>
                        <td className="left-logo">
                            <img
                                src={independencedayindia20}
                                alt="Left Logo"
                            />
                        </td>

                        <td className="header-content">
                            <span>Government of Maharashtra</span>
                            <br />

                            <span>
                                Skill, Employment, Entrepreneurship and Innovation Department
                            </span>
                            <br />

                            <span className="board-name">
                                Maharashtra State Board of Skill, Vocational Education and Training
                            </span>
                            <br />

                            <span className="receipt-title">
                                {getReceiptTitle()}
                            </span>
                            <br />

                            <span className="application-heading">
                                Application ID
                            </span>
                            {" : "}
                            <span className="application-id">
                                {receiptData?.PayeeDisplayApplicationId}
                            </span>
                        </td>

                        <td className="right-logo">
                            <img
                                src={BoardLogo}
                                alt="Right Logo"
                            />
                        </td>
                    </tr>

                    <tr>
                        <td colSpan="3" className="header-bottom"></td>
                    </tr>
                </tbody>
            </table>

            <table className="receipt-table">
                <tbody>
                    <tr>
                        <td className="receipt-label">
                            Candidate Name
                        </td>
                        <td className="receipt-value">
                            {receiptData?.PayeeName}
                        </td>
                    </tr>

                    <tr>
                        <td className="receipt-label">
                            Admission Session
                        </td>
                        <td className="receipt-value">
                            {receiptData?.AcademicYear}
                        </td>
                    </tr>

                    <tr>
                        <td className="receipt-label">
                            Course Type
                        </td>
                        <td className="receipt-value">
                            {receiptData?.Course}
                        </td>
                    </tr>

                    <tr>
                        <td className="receipt-label">
                            Amount Paid ( ₹ )
                        </td>
                        <td className="receipt-value">
                            {receiptData?.FeeAmount}
                        </td>
                    </tr>

                    <tr>
                        <td className="receipt-label">
                            Transaction Number
                        </td>
                        <td className="receipt-value">
                            {receiptData?.TransactionID}
                        </td>
                    </tr>

                    <tr>
                        <td className="receipt-label">
                            Date &amp; Time Of Payment
                        </td>
                        <td className="receipt-value">
                            {receiptData?.PaymentDate}
                        </td>
                    </tr>

                    <tr>
                        <td className="receipt-label">
                            Transaction Status
                        </td>
                        <td
                            className={`receipt-value ${receiptData?.IsPaid === true
                                    ? "paid-status"
                                    : "failed-status"
                                }`}
                        >
                            {getTransactionStatus()}
                        </td>
                    </tr>

                    <tr>
                        <td colSpan="2" className="refund-message">
                            In case of any failure in processing your transaction,
                            deducted amount will be refunded to your respective bank
                            account within 7 working days from the date of the failed
                            transaction.
                        </td>
                    </tr>

                    <tr>
                        <td className="footer-left">
                            <span className="label-font">Place</span> : Mumbai
                        </td>

                        <td className="footer-right">
                            For Finance Officer, MSBSVET, Mumbai
                        </td>
                    </tr>

                    <tr>
                        <td className="footer-left">
                            <span className="label-font">Date</span> :{" "}
                            {receiptData?.PaymentDate}
                        </td>

                        <td className="footer-right">
                            <span className="system-generated">
                                This is system generated receipt and hence does not require sign.
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const receiptStyles = `
    .receipt-header,
    .receipt-table {
        width: 100%;
        font-size: 12px;
        border: 1px solid #c5d3d3;
        margin-bottom: 0;
        border-collapse: collapse;
    }

    .receipt-header td,
    .receipt-table td {
        border: 1px solid #c5d3d3;
        vertical-align: middle;
        padding: 0.25rem;
        color: #000;
    }

    .left-logo {
        width: 15%;
        text-align: center;
        border-right-width: 0 !important;
    }

    .left-logo img,
    .right-logo img {
        max-height: 130px;
        width: auto;
        object-fit: contain;
        display: block;
        margin: 0 auto;
    }

    .header-content {
        width: 70%;
        text-align: center;
        vertical-align: middle;
        border-left-width: 0 !important;
        border-right-width: 0 !important;
    }

    .right-logo {
        width: 15%;
        text-align: center;
        border-left-width: 0 !important;
    }

    .board-name {
        font-size: 14px;
    }

    .receipt-title,
    .application-heading,
    .application-id {
        font-weight: bold;
        font-size: large;
    }

    .header-bottom {
        text-align: center;
    }

    .receipt-label {
        text-align: right;
        width: 50%;
        font-weight: 600;
    }

    .receipt-value {
        text-align: left;
    }

    .paid-status {
        color: green !important;
        font-weight: bold;
    }

    .failed-status {
        color: red !important;
        font-weight: bold;
    }

    .refund-message {
        text-align: left;
    }

    .footer-left {
        text-align: left;
        width: 50%;
    }

    .footer-right {
        vertical-align: bottom;
    }

    .label-font {
        font-weight: 600;
    }

    .system-generated {
        font-size: x-small;
    }

    @media print {
        @page {
            size: A4 portrait;
            margin: 5mm;
        }

        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        body * {
            visibility: hidden;
        }

        #receiptPageWrapper,
        #receiptPageWrapper * {
            visibility: visible !important;
        }

        #receiptPageWrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            line-height: normal !important;
            font-family: 'Poppins', sans-serif !important;
        }

        #receiptPageWrapper .receipt-header,
        #receiptPageWrapper .receipt-header td {
            border: none !important;
        }

        #receiptPageWrapper .receipt-table {
            border: 1px solid #c5d3d3 !important;
            border-collapse: collapse !important;
            width: 100% !important;
            font-size: 12px !important;
        }

        #receiptPageWrapper .receipt-table td {
            border: 1px solid #c5d3d3 !important;
            vertical-align: middle !important;
            padding: 0.25rem !important;
            color: #000 !important;
        }

        #receiptPageWrapper img {
            max-height: 130px !important;
            width: auto !important;
            object-fit: contain !important;
            display: block !important;
            margin: 0 auto !important;
        }

        #receiptPageWrapper .paid-status {
            color: green !important;
        }

        #receiptPageWrapper .failed-status {
            color: red !important;
        }

        nav,
        header,
        footer,
        aside,
        .sidebar,
        .navbar,
        .header,
        .footer,
        .no-print {
            display: none !important;
        }
    }
`;

export default OnlineReceipt;