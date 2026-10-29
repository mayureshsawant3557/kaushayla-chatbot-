import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BoardLogo from "../../assets/Board Logo - small size.jpg";
import independencedayindia20 from "../../assets/independencedayindia20.jpg";
import agent from "../../lib/api/agent";
import { GetTransactionDetails } from "../../Endpoints_All/Fee/feeManagement";

const VerificationReceipt = () => {
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get("TransactionID");

    const [receiptData, setReceiptData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (transactionId) {
            fetchTransactionDetails();
        } else {
            setLoading(false);
        }
    }, [transactionId]);

    // Auto-trigger print dialog once receipt data is loaded
    useEffect(() => {
        if (receiptData && receiptData.TransactionID) {
            const timer = setTimeout(() => {
                document.title = `VerificationReceipt_${receiptData?.TransactionID || ""}`;
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [receiptData]);

    const fetchTransactionDetails = async () => {
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
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "16px" }}>
                Loading receipt...
            </div>
        );
    }

    if (!receiptData) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "16px", color: "red" }}>
                Receipt not found.
            </div>
        );
    }

    return (
        <div id="receiptPageWrapper" style={{ lineHeight: "normal", fontFamily: "'Poppins', sans-serif" }}>
            <style>{receiptStyles}</style>

            {/* Header Table with Logos */}
            <table
                style={{
                    width: "100%",
                    fontSize: "12px",
                    border: "1px solid #c5d3d3",
                    marginBottom: "0px",
                    borderCollapse: "collapse",
                }}
            >
                <tbody>
                    <tr>
                        <td
                            style={{
                                width: "15%",
                                textAlign: "center",
                                border: "1px solid #c5d3d3",
                                borderRightWidth: "0px",
                                verticalAlign: "middle",
                                padding: "0.25rem",
                            }}
                        >
                            <img
                                src={independencedayindia20}
                                alt="Left Logo"
                                style={{
                                    maxHeight: "130px",
                                    width: "auto",
                                    objectFit: "contain",
                                    display: "block",
                                    margin: "0 auto"
                                }}
                            />
                        </td>
                        <td
                            style={{
                                width: "70%",
                                textAlign: "center",
                                verticalAlign: "middle",
                                border: "1px solid #c5d3d3",
                                borderRightWidth: "0px",
                                borderLeftWidth: "0px",
                                padding: "0.25rem",
                            }}
                        >
                            <span style={{ fontSize: "12px" }}>Government of Maharashtra</span>
                            <br />
                            <span style={{ fontSize: "12px" }}>
                                Skill, Employment, Entrepreneurship and Innovation Department
                            </span>
                            <br />
                            <span style={{ fontSize: "14px" }}>
                                Maharashtra State Board of Skill, Vocational Education and Training
                            </span>
                            <br />
                            <span style={{ fontWeight: "bold", fontSize: "large" }}>
                                Verification Certificate Fee Receipt
                            </span>
                        </td>
                        <td
                            style={{
                                width: "15%",
                                textAlign: "center",
                                border: "1px solid #c5d3d3",
                                borderLeftWidth: "0px",
                                verticalAlign: "middle",
                                padding: "0.25rem",
                            }}
                        >
                            <img
                                src={BoardLogo}
                                alt="Right Logo"
                                style={{
                                    maxHeight: "130px",
                                    width: "auto",
                                    objectFit: "contain",
                                    display: "block",
                                    margin: "0 auto"
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td
                            colSpan="3"
                            style={{
                                textAlign: "center",
                                border: "1px solid #c5d3d3",
                                padding: "0.25rem",
                            }}
                        >
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Receipt Data Table - No Institute fields */}
            <table
                style={{
                    width: "100%",
                    fontSize: "12px",
                    border: "1px solid #c5d3d3",
                    marginBottom: "0px",
                    borderCollapse: "collapse",
                }}
            >
                <tbody>
                    <tr>
                        <td
                            style={{
                                textAlign: "right",
                                width: "50%",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                                fontWeight: "600",
                                backgroundColor: "#f9f9f9"
                            }}
                        >
                            Fee Type
                        </td>
                        <td
                            style={{
                                textAlign: "left",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                            }}
                        >
                            <strong>{receiptData?.Purpose || "CERTIFICATE VERIFICATION FEE"}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{
                                textAlign: "right",
                                width: "50%",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                                fontWeight: "600",
                                backgroundColor: "#f9f9f9"
                            }}
                        >
                            Amount Paid (₹)
                        </td>
                        <td
                            style={{
                                textAlign: "left",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                            }}
                        >
                            <strong>₹{receiptData?.TotalAmount || receiptData?.FeeAmount || 200}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{
                                textAlign: "right",
                                width: "50%",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                                fontWeight: "600",
                                backgroundColor: "#f9f9f9"
                            }}
                        >
                            Transaction Number
                        </td>
                        <td
                            style={{
                                textAlign: "left",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                            }}
                        >
                            {receiptData?.TransactionID}
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{
                                textAlign: "right",
                                width: "50%",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                                fontWeight: "600",
                                backgroundColor: "#f9f9f9"
                            }}
                        >
                            Date & Time Of Payment
                        </td>
                        <td
                            style={{
                                textAlign: "left",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                            }}
                        >
                            {receiptData?.PaymentDate}
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{
                                textAlign: "right",
                                width: "50%",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                                fontWeight: "600",
                                backgroundColor: "#f9f9f9"
                            }}
                        >
                            Transaction Status
                        </td>
                        <td
                            style={{
                                textAlign: "left",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                                color: receiptData?.IsPaid === true ? "green" : "red",
                                fontWeight: "bold",
                            }}
                        >
                            {receiptData?.IsPaid === true ? "✓ PAID" : "UNPAID"}
                        </td>
                    </tr>
                    <tr>
                        <td
                            colSpan="2"
                            style={{
                                textAlign: "left",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                                backgroundColor: "#fff3e0"
                            }}
                        >
                            <strong>Note:</strong> In case of any failure in processing your transaction, deducted amount
                            will be refunded to your respective bank account within 7 working days
                            from the date of the failed transaction.
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{
                                textAlign: "left",
                                width: "50%",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                            }}
                        >
                            <strong>Place</strong> : Mumbai
                        </td>
                        <td
                            style={{
                                verticalAlign: "bottom",
                                border: "1px solid #c5d3d3",
                                padding: "0.5rem",
                                textAlign: "right"
                            }}
                        >
                            <strong>For Finance Officer, MSBSVET, Mumbai</strong>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{
                                textAlign: "left",
                                width: "50%",
                                border: "1px solid #c5d3d3",
                                verticalAlign: "middle",
                                padding: "0.5rem",
                            }}
                        >
                            <strong>Date</strong> : {receiptData?.PaymentDate}
                        </td>
                        <td
                            style={{
                                border: "1px solid #c5d3d3",
                                padding: "0.5rem",
                            }}
                        >
                        </td>
                    </tr>
                    <tr>
                        <td
                            colSpan="2"
                            style={{
                                textAlign: "center",
                                border: "1px solid #c5d3d3",
                                padding: "0.5rem",
                                fontSize: "10px",
                                color: "#666"
                            }}
                        >
                            This is system generated receipt and hence does not require signature.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// Print CSS — ensures PDF shows exact same design as screen
const receiptStyles = `
    @media print {
        @page {
            size: A4 portrait;
            margin: 5mm;
        }

        /* Force exact colors in print */
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        /* Hide everything on the page first */
        body * {
            visibility: hidden;
        }

        /* Show only the receipt */
        #receiptPageWrapper,
        #receiptPageWrapper * {
            visibility: visible !important;
        }

        /* Position receipt at top-left of printed page */
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

        /* Remove borders from the FIRST table (header) */
        #receiptPageWrapper table:first-of-type,
        #receiptPageWrapper table:first-of-type td {
            border: none !important;
        }

        /* Preserve table styles for the main receipt table */
        #receiptPageWrapper table:last-of-type {
            border: 1px solid #c5d3d3 !important;
            border-collapse: collapse !important;
            width: 100% !important;
            font-size: 12px !important;
            margin-bottom: 0px !important;
        }

        /* Preserve cell borders for the main receipt table */
        #receiptPageWrapper table:last-of-type td {
            border: 1px solid #c5d3d3 !important;
            vertical-align: middle !important;
            padding: 0.5rem !important;
            color: #000 !important;
        }

        /* Preserve images */
        #receiptPageWrapper img {
            max-height: 130px !important;
            width: auto !important;
            object-fit: contain !important;
            display: block !important;
            margin: 0 auto !important;
        }

        /* Hide sidebar, navbar, footer, etc */
        nav, header, footer, aside,
        .sidebar, .navbar, .header, .footer,
        .no-print {
            display: none !important;
        }
    }
`;

export default VerificationReceipt;