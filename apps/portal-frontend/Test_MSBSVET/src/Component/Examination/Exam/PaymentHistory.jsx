import { useContext, useEffect, useState } from "react";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import useLoading from "../../../Hooks/useLoading";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Examination/Exam";
import agent from "../../../lib/api/agent";
import { TransactionHistory } from "../../../Endpoints_All/Fee/feeManagement";
import Button from "../../base/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Hooks/AuthContext";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import Loader from "../../formcomponent/Loader";

const PaymentHistory = () => {

    const { userInfo } = useAuth();
    const user = userInfo;
    const [error, setError] = useState(null)
    const navigate = useNavigate();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const [paidTransactions, setPaidTransactions] = useState([]);
    const [failedTransaction, setFailedTransaction] = useState([]);
    const { color } = useContext(ThemeContext);

  const paidTransactioncolumns = [
    { key: "srNo", header: "Sr. No.", width: "70px", className: "text-center" },
    {
      key: "Purpose",
      header: "Fee Type",
      width: "200px",
      className: "text-center",
    },
    {
      key: "TransactionID",
      header: "Transaction ID",
      width: "120px",
      className: "text-center",
    },
    {
      key: "TotalAmount",
      header: "Amount (Rs.)",
      width: "120px",
      className: "text-center",
    },
    {
      key: "BankRefereneceNo",
      header: "Payment ID",
      width: "140px",
      className: "text-center",
    },
    {
      key: "TransactionDate",
      header: "Payment Date",
      width: "140px",
      className: "text-center",
    },
    {
      key: "Course",
      header: "Course",
      width: "200px",
      className: "text-center",
    },
    {
      key: "AcademicYear",
      header: "Admission Year",
      width: "120px",
      className: "text-center",
    },
    {
      key: "BatchId",
      header: "BatchID",
      width: "120px",
      className: "text-center",
    },
    {
      key: "ReceiptURL",
      header: "Print Receipt",
      width: "120px",
      className: "text-center",
    },
  ];
  const failedTransactioncolumns = [
    { key: "srNo", header: "Sr. No.", width: "70px", className: "text-center" },
    {
      key: "TransactionID",
      header: "Transaction ID",
      width: "120px",
      className: "text-center",
    },
    {
      key: "TotalAmount",
      header: "Amount (Rs.)",
      width: "120px",
      className: "text-center",
    },
    {
      key: "TransactionDate",
      header: "Payment Date",
      width: "140px",
      className: "text-center",
    },
    {
      key: "Message",
      header: "Message",
      width: "140px",
      className: "text-center",
    },
    {
      key: "BankRefereneceNo",
      header: "Payment ID",
      width: "140px",
      className: "text-center",
    },
    {
      key: "Purpose",
      header: "Purpose",
      width: "200px",
      className: "text-center",
    },
    {
      key: "Course",
      header: "Course",
      width: "200px",
      className: "text-center",
    },
    {
      key: "AcademicYear",
      header: "Admission Year",
      width: "120px",
      className: "text-center",
    },
    {
      key: "BatchId",
      header: "BatchID",
      width: "120px",
      className: "text-center",
    },
    // { key: 'ReceiptURL', header: 'Print Receipt', width: '120px', className: 'text-center' },
  ];
    const visiblePaidTransactionColumns =
        Number(userInfo?.UserTypeID) === 64
            ? paidTransactioncolumns.filter(
                col => !["Course", "AcademicYear", "BatchId"].includes(col.key)
            )
            : paidTransactioncolumns;

    const visibleFailedTransactionColumn =
        Number(userInfo.UserTypeID) === 64
            ? failedTransactioncolumns.filter(
                col => !["Message", "BankRefereneceNo", "Course", "AcademicYear", "BatchId"].includes(col.key)
        ) : failedTransactioncolumns;





  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    try {
      startLoading();
      setError(null);
      const userLoginID = user?.UserLoginID;
      const userTypeID = user?.UserTypeID;

      if (!userLoginID) {
        throw new Error("User login ID not found in session storage");
      }

      const instituteResponse = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${userLoginID}`,
      );

      const instituteData = instituteResponse.data;

      if (instituteData.Status !== "Success" || !instituteData.Data) {
        throw new Error(
          instituteData.Message || "Failed to retrieve Institute ID",
        );
      }
      const instituteID = instituteData?.Data;

      const transactionHistory = await agent.get(
        `${TransactionHistory}/${instituteID}`,
        {
          params: {
            userTypeId: userTypeID,
          },
        },
      );
      const transactionData = transactionHistory?.data;

      if (
        transactionData.Status === "Success" &&
        Array.isArray(transactionData?.Data)
      ) {
        const paid = transactionData?.Data?.filter(
          (item) => item.IsPaid === true,
        ).map((item, index) => ({
          ...item,
          srNo: index + 1,
        }));
        const failed = transactionData?.Data?.filter(
          (item) => item.IsPaid === false,
        ).map((item, index) => ({
          ...item,
          srNo: index + 1,
        }));
        setPaidTransactions(paid);
        setFailedTransaction(failed);
      } else {
        setPaidTransactions([]);
        setFailedTransaction([]);
      }
    } catch (err) {
      setError(err.message);
      //setBatches([])
    } finally {
      stopLoading();
    }
    };
  const handlePrintClick = (transactionId) => {
        if (!transactionId) {
            return;
        }

        const transaction = paidTransactions?.find(
            x => Number(x.TransactionID) === Number(transactionId)
        );

        if (!transaction) {
            return;
        }

        const phaseId = transaction.PhaseID ?? transaction.phaseId;

        const popupWidth = 1000;
        const popupHeight = 750;

        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const receiptPath =
            [7, 8, 3].includes(Number(phaseId))
                ? `/React/InstOnlineReceipt?TransactionID=${transactionId}`
                : `/React/OnlineReceipt?TransactionID=${transactionId}`;

        window.open(
            `${window.location.origin}${receiptPath}`,
            'OnlineReceipt',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    };

    const renderCell = (item, column) => {
        if (column.key === "ReceiptURL") {
            const hrefMatch = item.ReceiptURL?.match(
                /href\s*=\s*[\\]?["']?([^"'\\\s>]+)/,
            );
            const labelMatch = item.ReceiptURL?.match(/>([^<]+)<\/a>/);
            const href = hrefMatch ? hrefMatch[1].replace(/\\/g, "") : "#";
            const label = labelMatch ? labelMatch[1].trim() : "View";
            const idMatch = href.match(/TransactionID=([^&]+)/);
            const transactionId = idMatch ? idMatch[1] : null;

            return (
                <span
                    className='bg-cyan-400 text-white px-2 py-1 rounded text-xs font-medium inline-block hover:bg-cyan-500 cursor-pointer'
                    onClick={() => transactionId && handlePrintClick(transactionId)}
                >
                    {label}
                </span>
            );
        }
        return undefined;
    };
    // const handlePrintClick = (transactionId) => {
    //     if (!transactionId) {
    //         return;
    //     }
    //     //navigate(`/InstOnlineReceipt?TransactionID=${transactionId}`)
    //     //window.location.href = `/React/BulkOnlineReceipt?TransactionID=${transactionId}`;
    //     const popupWidth = 1000
    //     const popupHeight = 750
    //     const left = (window.screen.width - popupWidth) / 2
    //     const top = (window.screen.height - popupHeight) / 2

    //     window.open(
    //         `${window.location.origin}/React/BulkOnlineReceipt?TransactionID=${transactionId}`,
    //         'BulkOnlineReceipt',
    //         `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    //     )
    // }

   

    if(isLoading) {
        return (
            <Loader />
        )
    }

  return (
    <>
      <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
        <fieldset className="mb-4 rounded-md border p-4">
          <legend
            className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
          >
            
            <span>Transaction History</span>
          </legend>

                    {paidTransactions && paidTransactions.length > 0 ? (
                    <div>
                        <span className={`text-lg font-medium ${color} text-white  rounded-md px-4 py-1`}>Paid Transactions</span>
                        <FilteredTableComponent
                            data={paidTransactions ?? []}
                              columns={visiblePaidTransactionColumns}
                            filterColumns={['Course', 'BatchID']}
                              searchable={false}
                              sortable={false}
                            exportable={true}
                            showExcel={true}
                            showPDF={true}
                            exportFileName='Transaction_History'
                            title='Transaction History'
                            renderCell={renderCell}
                            emptyStateMessage='No Transaction History Available'
                            emptyStateSubMessage='There are no Transaction History available at this time.'
                            maxHeight='500px'
                        />
                    </div>
                    ) : (
                        <div>No paid transactions available.</div>
                    )}
                    <hr />
                    {failedTransaction && failedTransaction.length > 0 && (
                    <div className="pt-5">
                        <span className={`text-lg font-medium ${color} text-white  rounded-md px-4 py-1`}>Failed Transactions</span>
                        <FilteredTableComponent
                            data={failedTransaction ?? []}
                            columns={visibleFailedTransactionColumn}
                            filterColumns={['Course', 'BatchID']}
                              searchable={false}
                              sortable={false}
                            exportable={true}
                            showExcel={true}
                            showPDF={true}
                            exportFileName='Transaction_History'
                            title='Transaction History'
                            //renderCell={renderCell}
                            emptyStateMessage='No Transaction History Available'
                            emptyStateSubMessage='There are no Transaction History available at this time.'
                            maxHeight='500px'
                        />
                    </div>
                    )}
                    <div className='flex justify-center gap-3 mt-4'>
                        <Button variant='danger' onClick={() => navigate(-1)}>
                            Back
                        </Button>
                        <Button variant='success' 
                        onClick={() => {
                            if(userInfo?.UserTypeID == 91) {
                                navigate('/candidate/dashboard')
                            } else {
                                navigate('/institute/dashboard')
                            }
                        }}
                        >
                            Next
                        </Button>
                        <Button variant='primary' onClick={() => {
                            if(userInfo?.UserTypeID == 91) {
                                navigate('/candidate/dashboard')
                            } else {
                                navigate('/institute/dashboard')
                            }
                        }}>
                            Close
                        </Button>
                    </div>
                </fieldset>
            </div>
        </>
    )
}

export default PaymentHistory;
