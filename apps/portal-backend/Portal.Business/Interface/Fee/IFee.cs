using Portal.Entities;
using Portal.Entities.Fee;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Fee
{
    public interface IFee
    {
        DataSet GetTransactionWiseCandidateList(long TransactionID);
        string SetFeePushResponse(FeeTransactionEntity ft);
        List<FeeTransactionEntity> GetFailedTransactionForAPICheck(long PayeeID);
        List<FeeTransactionEntity> GetTransactionHistory(long PayeeID, int userTypeId = 91);
        DownloadFileEntity IsDownloadCETApplicationFormFeePaid(long PayeeID, int PhaseID);
        FeeToPay GetFeeToPay(long PayeeID, int PhaseID);

        FeeDBResponse SetFeeTransaction(long PayeeID, int PhaseID, string Vendor, string IPAddress);
       FeeTransactionEntity GetTransactionDetails(long TransactionID);
        FeeDBResponse SetFeeTransactionResponse(FeeTransactionEntity FP);
        bool IsPhaseWiseFeePaid(long PayeeID, int PhaseID);
        List<FeeTransactionEntity> GetTransactionsForRefundCheck(string PayeeInput);

        string RefundTransaction(string transactionId, string userLoginId, string RefundRequestId, string RefundBankRRN, string CommaNdName, string IPAddress);

        string SaveOrderId(string transactionId, string orderId);
        DataSet GetFeeCartItems(long CartId);
        DataTable SaveFeeCartItems(List<CandidateListForPayment> lst, long InstituteID, long CourseID, long BatchID, string UserLoginId, string IPAddress, int phaseId);
        DataTable SaveFeeCartItemsForCourses(List<CourseListForPayment> lst, long CollegeID ,  string UserLoginId, string IPAddress, int phaseId);

        Task CheckFailedTransactions(long candidateId);

    }
}
