import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import agent from '../../../lib/api/agent';
import { ChevronLeft, ChevronRight, X, Printer } from 'lucide-react';
import { GetTransactionDetails } from '../../../Endpoints_All/Fee/feeManagement';
import FilteredTableComponent from '../../formcomponent/FilteredTableComponent';

const TransactionDetailsPage = ({ transactionID, fromSignedVerification = false }) => {
    const navigate = useNavigate();
    const [transactionData, setTransactionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Table columns configuration with optimized widths
    const tableColumns = [
        {
            key: "srNo",
            header: "Sr. No.",
            sortable: true,
            width: "70px",
            headerClassName: "text-center bg-gray-50",
            className: "text-center"
        },
        {
            key: "purpose",
            header: "Fee Type",
            sortable: true,
            width: "280px",
            headerClassName: "text-left bg-gray-50",
            className: "text-left font-medium"
        },
        {
            key: "transactionId",
            header: "Transaction ID",
            sortable: true,
            width: "180px",
            headerClassName: "text-left bg-gray-50",
            className: "text-left font-mono text-sm"
        },
        {
            key: "amount",
            header: "Amount (Rs.)",
            sortable: true,
            width: "120px",
            headerClassName: "text-right bg-gray-50",
            className: "text-right font-bold text-emerald-600"
        },
        {
            key: "paymentId",
            header: "Payment Id",
            sortable: true,
            width: "200px",
            headerClassName: "text-left bg-gray-50",
            className: "text-left font-mono text-sm"
        },
        {
            key: "paymentDate",
            header: "Payment Date",
            sortable: true,
            width: "180px",
            headerClassName: "text-center bg-gray-50",
            className: "text-center text-sm"
        },
        {
            key: "course",
            header: "Course",
            sortable: true,
            width: "150px",
            headerClassName: "text-left bg-gray-50",
            className: "text-left"
        },
        {
            key: "academicYear",
            header: "Admission Year",
            sortable: true,
            width: "120px",
            headerClassName: "text-center bg-gray-50",
            className: "text-center"
        },
        {
            key: "printReceipt",
            header: "Print Receipt",
            sortable: false,
            width: "110px",
            headerClassName: "text-center bg-gray-50",
            className: "text-center"
        }
    ];

    // Get transaction ID from URL (?txn=...)
    const getTransactionIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('txn');
    };

    // API call to fetch transaction details
    const fetchTransactionDetails = async (transactionId) => {
        try {
            setLoading(true);
            const response = await agent.post(
                `${GetTransactionDetails}?TransactionID=${transactionId}`
            );
            if (response.data.Status === 'Success') {
                setTransactionData(response.data.Data);
                setError(null);
            } else {
                setError('Failed to fetch transaction details');
                setTransactionData(null);
            }
        } catch (err) {
            setError('Failed to fetch transaction details');
            setTransactionData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const transactionId = transactionID || getTransactionIdFromUrl();
        if (transactionId) {
            fetchTransactionDetails(transactionId);
        } else {
            setError('Transaction ID not found');
            setLoading(false);
        }
        // eslint-disable-next-line
    }, []);

    // Utility: format payment date
    const formatPaymentDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const cleaned = dateStr.replace(/\s{2,}/g, ' ');
            const d = new Date(cleaned);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateStr;
        }
    };

    // Handle print receipt - open in new tab with InstOnlineReceipt component
    const handlePrintReceipt = (transactionId) => {
        if (!transactionId) {
            return;
        }
         window.location.href=`/React/VerificationReceipt?TransactionID=${transactionID}`;
        
    };

    const handleBack = () => window.history.back();
    const handleNext = () => {
    }
    const handleClose = () => window.close();

    // Transform transaction data to table format
    const getTableData = () => {
        if (!transactionData) return [];

        return [{
            id: 1,
            srNo: 1,
            purpose: transactionData.Purpose || '',
            transactionId: transactionData.TransactionID || '',
            amount: Number(transactionData.FeeAmount || 0).toFixed(2),
            paymentId: transactionData.BankRefereneceNo || '',
            paymentDate: formatPaymentDate(transactionData.PaymentDate),
            course: transactionData.Course || '',
            academicYear: transactionData.AcademicYear || '',
            receiptUrl: transactionData.ReceiptURL || '',
            _original: transactionData
        }];
    };

    // Custom cell renderer with improved styling
    const renderCell = (row, column) => {
        if (column.key === 'printReceipt') {
            return (
                <button
                    onClick={() => handlePrintReceipt(row.transactionId)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1.5 text-sm transition-colors"
                >
                    <Printer size={14} />
                    Print Receipt
                </button>
            );
        }

        if (column.key === 'amount') {
            return (
                <span className="font-bold text-black">
                    ₹{row.amount}
                </span>
            );
        }

        if (column.key === 'transactionId' || column.key === 'paymentId') {
            return (
                <span className="font-mono text-sm text-gray-700">
                    {row[column.key] || '-'}
                </span>
            );
        }

        // Default rendering
        return row[column.key] || '-';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading transaction details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => fetchTransactionDetails(transactionID)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-50">
            <div className="w-full px-4">
                <div className="bg-white rounded-xl shadow-md mb-6 p-6 overflow-x-auto">
                    <FilteredTableComponent
                        data={getTableData()}
                        columns={tableColumns}
                        filterColumns={['purpose', 'course', 'academicYear', 'transactionId']}
                        searchable={true}
                        sortable={true}
                        exportable={true}
                        showSearch={true}
                        showExport={true}
                        showExcel={true}
                        showPDF={false}
                        title="Paid Transactions"
                        exportFileName={`Transaction_${transactionData?.TransactionID || 'details'}`}
                        tableId="transaction-details-table"
                        renderCell={renderCell}
                        maxHeight="500px"
                        stickyHeader={true}
                        emptyStateMessage="No transaction data found"
                        emptyStateSubMessage="Please check the transaction ID and try again"
                        className="mt-2"
                    />
                </div>

                {!fromSignedVerification && (
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
                        >
                            <ChevronLeft size={16} />
                            Back
                        </button>
                        <div className="flex gap-4">
                            <button
                                onClick={handleNext}
                                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={handleClose}
                                className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2 font-medium"
                            >
                                <X size={16} />
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionDetailsPage;