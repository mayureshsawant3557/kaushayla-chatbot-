using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using Portal.Data.Source;
using Portal.Entities;
using Portal.Entities.Fee;



namespace Portal.Data
{
    public partial class Repository
    {
        public DataSet GetFailedTransactionForRegularSync()
        {
            var parms = new Dictionary<string, object>();

            return _dbAccess.GetDataSet("Fee_GetFailedTransactionForRegularSync", parms);
        }

        public DataSet GetFailedTransactionForAPICheck(Int64 PayeeID)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@PayeeID", PayeeID);

            return _dbAccess.GetDataSet("Fee_GetFailedTransactionForAPICheck", parms);
        }

        public DataSet GetTransactionHistory(Int64 PayeeID, int userTypeId = 91)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@PayeeID", PayeeID);
            parms.Add("@UserTypeId", userTypeId);

            return _dbAccess.GetDataSet("Fee_GetTransactionHistory", parms);
        }
        public DataTable IsDownloadCETApplicationFormFeePaid(Int64 PayeeID, Int32 PhaseID)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@PayeeID", PayeeID);
            parms.Add("@PhaseID", PhaseID);

            return _dbAccess.GetDataTable("Fee_IsDownloadCETApplicationFormFeePaid", parms);
        }
        public DataSet GetFeeToPay(Int64 PayeeID, Int32 PhaseID)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@PayeeID", PayeeID);
            parms.Add("@PhaseID", PhaseID);

            return _dbAccess.GetDataSet("Fee_GetFeeToPay", parms);
        }
        public DataSet SetFeeTransaction(Int64 PayeeID, Int32 PhaseID, string VendorId, string IPAddress)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@PayeeID", PayeeID);
            parms.Add("@PhaseID", PhaseID);
            parms.Add("@VendorId", VendorId);
            parms.Add("@IPAddress", IPAddress);

            return _dbAccess.GetDataSet("Fee_SetFeeTransaction", parms);
        }
        public DataSet GetTransactionDetails(Int64 TransactionID)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@TransactionID", TransactionID);

            return _dbAccess.GetDataSet("Fee_GetTransactionDetails", parms);
        }
        public DataSet GetTransactionWiseCandidateList(Int64 TransactionID)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@TransactionID", TransactionID);

            return _dbAccess.GetDataSet("Fee_GetTransactionWiseCandidateList", parms);
        }
        public DataSet SetFeeTransactionResponse(FeeTransactionEntity ft)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@TransactionID", ft.TransactionID);
            parms.Add("@BankRefereneceNo", ft.BankRefereneceNo);
            parms.Add("@PayGateID", ft.PayGateID);
            parms.Add("@GatewayFullResponse", ft.GatewayResponse);
            parms.Add("@TransactionResponse", ft.ErrorMessage);
            parms.Add("@FeeAmount", ft.FeeAmount);
            parms.Add("@IsPaid", ft.IsPaid);
            parms.Add("@Optional1", ft.Optional1);
            parms.Add("@Optional2", ft.Optional2);
            parms.Add("@Optional3", ft.Optional3);
            parms.Add("@Optional4", ft.Optional4);
            parms.Add("@Optional5", ft.Optional5);
            parms.Add("@IsAPICheck", ft.IsAPICheck);
            return _dbAccess.GetDataSet("Fee_SetFeeTransactionResponse", parms);
        }

        public string SetFeePushResponse(FeeTransactionEntity ft)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@TransactionID", ft.TransactionID);
            parms.Add("@BankRefereneceNo", ft.BankRefereneceNo);
            parms.Add("@PayGateID", ft.PayGateID);
            parms.Add("@GatewayFullResponse", ft.GatewayResponse);
            parms.Add("@TransactionResponse", ft.ErrorMessage);
            parms.Add("@FeeAmount", ft.FeeAmount);
            parms.Add("@IsPaid", ft.IsPaid);
            parms.Add("@Optional1", ft.Optional1);
            parms.Add("@Optional2", ft.Optional2);
            parms.Add("@Optional3", ft.Optional3);
            parms.Add("@Optional4", ft.Optional4);
            parms.Add("@Optional5", ft.Optional5);

            string projectId = ft.TransactionID.ToString().Substring(0, 10);


            //string connectionString = "Server=103.174.86.70,1433;Database=MSBVE_Staging_UAT;User Id=portal;Password=SQL@2025;Encrypt=True;TrustServerCertificate=True;";

            //if (projectId == "11")
            //{
            //    connectionString = "BED";
            //}
            //else if (projectId == "12")
            //{
            //    connectionString = "MED";
            //}
            //else if (projectId == "13")
            //{
            //    connectionString = "BPED";
            //}
            //else if (projectId == "14")
            //{
            //    connectionString = "MPED";
            //}
            //else if (projectId == "15")
            //{
            //    connectionString = "BABSCBED";
            //}
            //else if (projectId == "16")
            //{
            //    connectionString = "BEDMED";
            //}
            //else if (projectId == "17")
            //{
            //    connectionString = "LLB3";
            //}
            //else if (projectId == "18")
            //{
            //    connectionString = "LLB5";
            //}



            //MultiDatabaseAccess _multiDB = new MultiDatabaseAccess();
            return _dbAccess.ExecuteScalar("Fee_SetFeePushResponse", parms).ToString();
        }

        public bool IsPhaseWiseFeePaid(Int64 PayeeID, Int32 PhaseID)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@PayeeID", PayeeID);
            parms.Add("@PhaseID", PhaseID);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Fee_IsPhaseWiseFeePaid", parms));
        }

        public string RefundTransaction(string transactionId, string userLoginId, string RefundRequestId, string RefundBankRRN, string CommandName, string IPAddress)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@TransactionId", transactionId);
            parms.Add("@UserLoginId", userLoginId);
            parms.Add("@RefundRequestId", RefundRequestId);
            parms.Add("@RefundBankRRN", RefundBankRRN);
            parms.Add("@CommandName", CommandName);
            parms.Add("@IPAddress", IPAddress);

            return Convert.ToString(_dbAccess.ExecuteScalar("Fee_RefundTransaction", parms));
        }

        public DataTable GetTransactionsForRefundCheck(string PayeeInput)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@PayeeInput", PayeeInput);

            return _dbAccess.GetDataTable("Fee_GetTransactionsForRefundCheck", parms);

        }

        public string SaveOrderId(string transactionId, string orderId)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@TransactionId", transactionId);
            parms.Add("@OrderId", orderId);

            return _dbAccess.ExecuteScalar("Fee_SaveOrderId", parms).ToString();
        }

        public DataTable SaveFeeCartItems(List<CandidateListForPayment> lst, long InstituteID, long CourseID, long BatchID, string UserLoginId, string IPAddress, int phaseId)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@CandidateList", GetXML(lst));
            parms.Add("@InstituteID", InstituteID);
            parms.Add("@CourseID", CourseID);
            parms.Add("@BatchID", BatchID);
            parms.Add("@UserLoginId", UserLoginId);
            parms.Add("@IPAddress", IPAddress);
            parms.Add("@PhaseId", phaseId);

            return _dbAccess.GetDataTable("Fee_SaveFeeCartItems", parms);
        }


        public DataSet GetFeeCartItems(Int64 CartId)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@CartId", CartId);

            return _dbAccess.GetDataSet("Fee_GetFeeCartItems", parms);
        }

        public DataTable SaveFeeCartItemsForCourses(List<CourseListForPayment> lst, long CollegeID, string UserLoginId, string IPAddress, int phaseId)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@CourseList", GetXML(lst));
            parms.Add("@CollegeID", CollegeID);
            //parms.Add("@CourseID", CourseID);
            //parms.Add("@BatchID", BatchID);
            parms.Add("@UserLoginId", UserLoginId);
            parms.Add("@IPAddress", IPAddress);
            parms.Add("@PhaseId", phaseId);

            return _dbAccess.GetDataTable("Fee_SaveCourseSecurityFeeCart", parms);
        }
    }
}
