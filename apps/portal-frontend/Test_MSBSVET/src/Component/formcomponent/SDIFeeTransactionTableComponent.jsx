import { useState, useEffect } from 'react';
import agent from '../../lib/api/agent';
import { GetTransactionDetails } from '../../Endpoints_All/Fee/feeManagement';
import { TransactionHistory } from '../../Endpoints_All/Fee/feeManagement';
import FilteredTableComponent from '../../Component/formcomponent/FilteredTableComponent';
import { Printer } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import DocumentLink from "../formcomponent/OpenDocumentComponent";
import Swal from 'sweetalert2';
import { useLoading } from "../../Hooks/useLoading";



import { usePayment } from "../Context/PaymentContext";


const TransactionDetailsPage = ({ instituteID, userTypeID, fromSignedVerification = false }) => {
    //const [transactionData, setTransactionData] = useState(null);
    const [apiTransactionData, setApiTransactionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { setTransactionData } = usePayment();
    const { startLoading, stopLoading, isLoading } = useLoading();


    const navigate = useNavigate();
    const transactionColumns = [
        {
            key: 'SN',
            header: 'S.N.',
           
            className: 'text-center text-sm font-bold bg-gray-50',
            width: '60px'
        },
        {
            key: 'FeeType',
            header: 'Fee Type',
            
            className: 'text-left pl-6 pr-3 text-sm font-medium',
            width: '220px'
        },
        {
            key: 'TransactionID',
            header: 'Transaction ID',
          
            className: 'text-left pl-4 pr-3 font-mono text-sm',
            width: '200px'
        },
        {
            key: 'Amount',
            header: 'Amount (Rs.)',
            
            className: 'text-right pr-6 pl-4 text-sm font-semibold text-green-700 bg-green-50',
            width: '140px'
        },
        {
            key: 'PaymentId',
            header: 'Payment ID',
         
            className: 'text-left pl-4 pr-3 font-mono text-sm',
            width: '200px'
        },
        {
            key: 'PaymentDate',
            header: 'Payment Date',
           
            className: 'text-left pl-6 pr-3 text-sm font-medium',
            width: '220px'
        },
        
        {
            key: 'PrintReceipt',
            header: 'Print Receipt',
            
            className: 'text-center p-2',
            width: '160px'
        }
    ];

    const getTransactionIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('txn');
    };

    const prepareTransactionData = () => {
        if (!apiTransactionData || apiTransactionData.length === 0) return [];


        return apiTransactionData.map((item, index) => ({
            SN: index + 1,
            FeeType: item.Purpose || 'N/A',
            TransactionID: item.TransactionID || 'N/A',
            Amount: `₹${Number(item.FeeAmount || 0).toFixed(2)}`,
            PaymentId: item.BankRefereneceNo || 'N/A',
            PaymentDate: formatPaymentDate(item.PaymentDate),
            PrintReceipt: 'Print Receipt',
            _fullData: item,
            id: item.TransactionID
        }));
    };

    
    // added for inspection fee paid
    useEffect(() => {
        if (apiTransactionData) {
            setTransactionData(apiTransactionData);
        }
    }, [apiTransactionData]);
    
    
    
    const renderTransactionCell = (item, column, rowIndex) => {
        
        if (column.key === 'PrintReceipt') {
            return (
                <div className="flex justify-center items-center h-full">
                    <button
                        onClick={() => handleOpenReceipt(item._fullData)}
                        disabled={!item._fullData?.ReceiptURL}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all ${item._fullData?.ReceiptURL
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                        title={item._fullData?.ReceiptURL ? "Click to open receipt" : "No receipt available"}
                    >
                        <Printer size={16} />
                        Print Receipt
                    </button>

                    {/*<div className="flex justify-center items-center">*/}
                    {/*    <span className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">*/}

                    {/*        <Printer size={16} />*/}

                    {/*        <DocumentLink*/}
                    {/*            documentUrl={`/InstOnlineReceipt?TransactionID=${item._fullData?.TransactionID}`}*/}
                    {/*            itemName="Receipt"*/}
                    {/*            label="Print Receipt"*/}
                    {/*        />*/}

                    {/*    </span>*/}
                    {/*</div>*/}
                </div>
            );
        }

        
        return undefined; 
    };

    //const handleOpenReceipt = (fullData) => {
    //    if (!fullData?.ReceiptURL) return;

    //    // Example: onlineReceipt.aspx?TransactionID=500100037925


    //    //const urlParams = new URLSearchParams(url.split("?")[1]);
    //    //const transactionId = urlParams.get("TransactionID");
    //    const transactionId = fullData.TransactionID;

    //    //if (transactionId) {
    //    //    navigate(`/InstOnlineReceipt?TransactionID=${transactionId}`);
    //    //}

    //    if (transactionId) {
    //        window.open(
    //            `/React/InstOnlineReceipt?TransactionID=${transactionId}`,
    //            "_blank"
    //        );
    //    }
    //};

    const handleOpenReceipt = (fullData) => {
        if (!fullData?.ReceiptURL) return;

        const transactionId = fullData.TransactionID;
        if (!transactionId) return;

        const popupWidth = 1000;
        const popupHeight = 750;

        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const popup = window.open(
            `${window.location.origin}/React/InstOnlineReceipt?TransactionID=${transactionId}`,
            "ReceiptWindow",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!popup) {
            Swal.fire({
                title: "Popup Blocked",
                text: "Please allow popups for this website.",
                icon: "error"
            });
        }
    };

    

    const fetchTransactionDetails = async (instituteID, userTypeID) => {
        try {
            startLoading();
            setError(null);
            //const response = await agent.post(
            //    `${GetTransactionDetails}?TransactionID=${transactionId}`
            //); TransactionHistory

            const response = await agent.get(
                `${TransactionHistory}/${instituteID}`,
                {
                    params: {
                        userTypeId: userTypeID
                    },
                    timeout: 15000
                }
            );
            if (response.data.Status === 'Success') {
                setApiTransactionData(response.data.Data);
            } else {
                setError('Failed to fetch transaction details');
            }
        } catch (err) {
            setError('Failed to fetch transaction details');
        } finally {
            //setLoading(false);
            stopLoading();
        }
    };

    useEffect(() => {
        if (instituteID && userTypeID) {
            fetchTransactionDetails(instituteID, userTypeID);
        } else {
            setError('Transaction ID not found');
            setLoading(false);
        }
    }, [instituteID, userTypeID]);

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

    

   

    //if (isLoading) {
    //    return (
    //        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-12">
    //            <div className="text-center">
    //                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-500 mx-auto mb-6 shadow-xl"></div>
    //                <p className="text-2xl font-semibold text-gray-700">Loading Transaction Details...</p>
    //            </div>
    //        </div>
    //    );
    //}


    

    return (
        <div className="py-3">
            <div className="max-w-full mx-auto px-4">
                <div className="font-bold text-xl"> Successful Transactions 
</div>
               

                
               
                    <FilteredTableComponent
                        data={prepareTransactionData()}
                        columns={transactionColumns}
                        filterColumns={[]}
                        customButtons={[]}
                        title="Paid Transaction Details"
                        exportFileName="Transaction_Details"
                        tableId="transaction-details-table"
                        searchable={false}
                        sortable={false}
                        showExcelTemplate={false}
                        exportable={false}
                        showSearch={false}
                        showExport={false}
                        className="!w-full !max-w-none"
                        renderCell={renderTransactionCell}
                        maxHeight="none"
                        stickyHeader={true}
                        readOnly={true}
                        emptyStateMessage="No transaction data found"
                />

               
               

                
            </div>
        </div>
    );
};

export default TransactionDetailsPage;
