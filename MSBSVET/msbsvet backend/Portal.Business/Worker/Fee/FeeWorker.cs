using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using NPOI.POIFS.Properties;
using Portal.Business.Interface.Fee;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Fee;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Razorpay.Api;

namespace Portal.Business.Worker.Fee
{
    public class FeeWorker : IFee
    {
        private readonly Repository objData;
        private readonly IConfiguration _configuration;

        //Inject Repository via Constructor 
        public FeeWorker(Repository repository, IConfiguration configuration)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
            _configuration = configuration;
        }

        //public FeeWorker()
        //{

        //}

        public List<FeeTransactionEntity> GetFailedTransactionForAPICheck(long PayeeID)
        {
           List<FeeTransactionEntity> ltr = new List<FeeTransactionEntity>();
            try
            {
                DataSet ds = objData.GetFailedTransactionForAPICheck(PayeeID);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        FeeTransactionEntity ft = new FeeTransactionEntity();

                        ft.TransactionID = Convert.ToInt64(dr["TransactionID"].ToString());
                        ft.PaymentVendor = Convert.ToString(dr["Vendor"]);
                        ft.PayeeMobileNo = dr["PayeeMobileNo"].ToString();
                        ft.PayeeEMailID = dr["PayeeEMailID"].ToString();
                        ft.FeeAmount = Convert.ToDecimal(dr["FeeAmount"]);
                        ft.OrderId = Convert.ToString(dr["OrderId"]);

                        //ft.ServiceCharge = Convert.ToDecimal(dr["ServiceCharge"]);
                        //ft.TotalAmount = Convert.ToDecimal(dr["TotalAmount"]);
                        //ft.IsValid = Convert.ToBoolean(dr["IsValid"]);
                        //ft.IsPaid = Convert.ToBoolean(dr["IsPaid"]);
                        //ft.IsReconciled = Convert.ToBoolean(dr["IsReconciled"]);
                        //ft.TransactionDate = dr["TransactionDate"].ToString();
                        //ft.LastPaymentdate = dr["LastPaymentDate"].ToString();
                        //ft.BankRefereneceNo = dr["BankRefereneceNo"].ToString();
                        //ft.PayGateID = dr["PayGateID"].ToString();
                        //ft.PaymentDate = dr["PaymentDate"].ToString();
                        //ft.Purpose = dr["Purpose"].ToString();
                        //ft.PhaseID = Convert.ToInt16(dr["PhaseID"].ToString());
                        //ft.ReceiptURL = dr["ReceiptURL"].ToString();
                        //ft.Optional1 = Convert.ToString(dr["Optional1"]);
                        //ft.Optional2 = Convert.ToString(dr["Optional2"]);
                        //ft.Optional3 = Convert.ToString(dr["Optional3"]);
                        //ft.Optional4 = Convert.ToString(dr["Optional4"]);
                        //ft.Optional5 = Convert.ToString(dr["Optional5"]);

                        //ft.IsRefunded = Convert.ToBoolean(dr["IsRefunded"]);
                        //ft.IsChargeBackAccepted = Convert.ToBoolean(dr["IsChargeBackAccepted"]);
                        //ft.TxStatus = Convert.ToString(dr["TxStatus"]);

                        ltr.Add(ft);
                    }
                    ;
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTransactionHistory");
                throw ex;
            }
            return ltr;
        }
        public List<FeeTransactionEntity> GetTransactionHistory(long PayeeID, int userTypeId = 91)
        {
            List<FeeTransactionEntity> ltr = new List<FeeTransactionEntity>();
            try
            {
                DataSet ds = objData.GetTransactionHistory(PayeeID, userTypeId);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        FeeTransactionEntity ft = new FeeTransactionEntity();

                        ft.TransactionID = Convert.ToInt64(dr["TransactionID"].ToString());
                        ft.PayeeID = Convert.ToInt64(dr["PayeeID"].ToString());
                        ft.PayeeApplicationID = dr["PayeeApplicationID"].ToString();
                        ft.PayeeName = dr["PayeeName"].ToString();
                        ft.PayeeMobileNo = dr["PayeeMobileNo"].ToString();
                        ft.PayeeEMailID = dr["PayeeEMailID"].ToString();
                        ft.Course = dr["Course"].ToString();
                        ft.AcademicYear = dr["AcademicYear"].ToString();
                        ft.FeeAmount = Convert.ToDecimal(dr["FeeAmount"]);
                        ft.ServiceCharge = Convert.ToDecimal(dr["ServiceCharge"]);
                        ft.TotalAmount = Convert.ToDecimal(dr["TotalAmount"]);
                        ft.IsValid = Convert.ToBoolean(dr["IsValid"]);
                        ft.IsPaid = Convert.ToBoolean(dr["IsPaid"]);
                        ft.IsReconciled = Convert.ToBoolean(dr["IsReconciled"]);
                        ft.TransactionDate = dr["TransactionDate"].ToString();
                        ft.LastPaymentdate = dr["LastPaymentDate"].ToString();
                        ft.BankRefereneceNo = dr["BankRefereneceNo"].ToString();
                        ft.PayGateID = dr["PayGateID"].ToString();
                        ft.PaymentDate = dr["PaymentDate"].ToString();
                        ft.Purpose = dr["Purpose"].ToString();
                        ft.PhaseID = Convert.ToInt16(dr["PhaseID"].ToString());
                        ft.ReceiptURL = dr["ReceiptURL"].ToString();
                        ft.Optional1 = Convert.ToString(dr["Optional1"]);
                        ft.Optional2 = Convert.ToString(dr["Optional2"]);
                        ft.Optional3 = Convert.ToString(dr["Optional3"]);
                        ft.Optional4 = Convert.ToString(dr["Optional4"]);
                        ft.Optional5 = Convert.ToString(dr["Optional5"]);

                        ft.IsRefunded = Convert.ToBoolean(dr["IsRefunded"]);
                        ft.IsChargeBackAccepted = Convert.ToBoolean(dr["IsChargeBackAccepted"]);
                        ft.TxStatus = Convert.ToString(dr["TxStatus"]);
                        ft.BatchId = Convert.ToString(dr["BatchId"]);

                        ltr.Add(ft);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTransactionHistory");
                throw ex;
            }
            return ltr;
        }
        public DownloadFileEntity IsDownloadCETApplicationFormFeePaid(long PayeeID, int PhaseID)
        {
            DownloadFileEntity obj = new DownloadFileEntity();
            try
            {
                DataTable dt = objData.IsDownloadCETApplicationFormFeePaid(PayeeID, PhaseID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    obj.IsFeePaid = Convert.ToBoolean(dt.Rows[0]["IsFeePaid"]);
                    obj.FileName = dt.Rows[0]["FileName"].ToString();
                    obj.FilePath = dt.Rows[0]["FilePath"].ToString();
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsDownloadCETApplicationFormFeePaid");
                throw ex;
            }
            return obj;
        }
        public FeeToPay GetFeeToPay(long PayeeID, int PhaseID)
        {
            FeeToPay fp = new FeeToPay();
            try
            {
                DataSet ds = objData.GetFeeToPay(PayeeID, PhaseID);

                if (ds != null && ds.Tables.Count > 0)
                {
                    if (ds.Tables[0].Rows.Count > 0)
                    {
                        fp.Fee.Purpose = Convert.ToString(ds.Tables[0].Rows[0]["Purpose"]);
                        fp.Fee.FeeAmount = Convert.ToDecimal(ds.Tables[0].Rows[0]["FeeAmount"]);
                        fp.Fee.LastPaymentDate = Convert.ToString(ds.Tables[0].Rows[0]["LastPaymentDate"]);
                        fp.Fee.IsEligibleToPay = Convert.ToBoolean(ds.Tables[0].Rows[0]["IsEligibleToPay"]);
                        fp.Fee.NotEligibleMsg = Convert.ToString(ds.Tables[0].Rows[0]["ErrorMessage"]);
                        fp.Fee.Course = Convert.ToString(ds.Tables[0].Rows[0]["Course"]);
                        fp.Fee.AcademicYear = Convert.ToString(ds.Tables[0].Rows[0]["AcademicYear"]);
                        fp.Fee.PayeeApplicationID = Convert.ToString(ds.Tables[0].Rows[0]["PayeeApplicationID"]);
                        fp.Fee.PayeeName = Convert.ToString(ds.Tables[0].Rows[0]["PayeeName"]);
                        fp.Fee.PayeeDisplayApplicationId = Convert.ToString(ds.Tables[0].Rows[0]["PayeeDisplayApplicationId"]);

                        fp.Fee.UnitCode = ds.Tables[0].Rows[0]["UnitCode"] == DBNull.Value
                            ? null
                            : Convert.ToString(ds.Tables[0].Rows[0]["UnitCode"]);
                    }

                    if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                    {
                        foreach (DataRow dr in ds.Tables[1].Rows)
                        {
                            FeeTransactionEntity ft = new FeeTransactionEntity();

                            ft.TransactionID = Convert.ToInt64(dr["TransactionID"].ToString());
                            ft.PayeeID = Convert.ToInt64(dr["PayeeID"].ToString());
                            ft.PayeeApplicationID = dr["PayeeApplicationID"].ToString();
                            ft.PayeeDisplayApplicationId = dr["PayeeDisplayApplicationId"].ToString();
                            ft.PayeeName = dr["PayeeName"].ToString();
                            ft.PayeeMobileNo = dr["PayeeMobileNo"].ToString();
                            ft.PayeeEMailID = dr["PayeeEMailID"].ToString();
                            ft.Course = dr["Course"].ToString();
                            ft.AcademicYear = dr["AcademicYear"].ToString();
                            ft.FeeAmount = Convert.ToDecimal(dr["FeeAmount"]);
                            ft.ServiceCharge = Convert.ToDecimal(dr["ServiceCharge"]);
                            ft.TotalAmount = Convert.ToDecimal(dr["TotalAmount"]);
                            ft.IsValid = Convert.ToBoolean(dr["IsValid"]);
                            ft.IsPaid = Convert.ToBoolean(dr["IsPaid"]);
                            ft.IsReconciled = Convert.ToBoolean(dr["IsReconciled"]);
                            ft.TransactionDate = dr["TransactionDate"].ToString();
                            ft.LastPaymentdate = dr["LastPaymentDate"].ToString();
                            ft.BankRefereneceNo = dr["BankRefereneceNo"].ToString();
                            ft.PayGateID = dr["PayGateID"].ToString();
                            ft.PaymentDate = dr["PaymentDate"].ToString();
                            ft.Purpose = dr["Purpose"].ToString();
                            ft.PhaseID = Convert.ToInt16(dr["PhaseID"].ToString());
                            ft.ReceiptURL = dr["ReceiptURL"].ToString();
                            ft.Optional1 = Convert.ToString(dr["Optional1"]);
                            ft.Optional2 = Convert.ToString(dr["Optional2"]);
                            ft.Optional3 = Convert.ToString(dr["Optional3"]);
                            ft.Optional4 = Convert.ToString(dr["Optional4"]);
                            ft.Optional5 = Convert.ToString(dr["Optional5"]);

                            fp.PaidTransactions.Add(ft);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetFeeToPay");
                throw ex;
            }
            return fp;
        }
        public FeeDBResponse SetFeeTransaction(Int64 PayeeID, Int32 PhaseID, string Vendor, string IPAddress)
        {
            FeeDBResponse fp = new FeeDBResponse();
            try
            {
                DataSet ds = objData.SetFeeTransaction(PayeeID, PhaseID, Vendor, IPAddress);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    fp.TransactionID = Convert.ToInt64(ds.Tables[0].Rows[0]["TransactionID"].ToString());
                    fp.SuccessFlag = ds.Tables[0].Rows[0]["SuccessFlag"].ToString();
                    fp.ErrorMessage = ds.Tables[0].Rows[0]["ErrorMessage"].ToString();
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SetFeeTransaction");
                throw ex;
            }
            return fp;
        }
        public FeeTransactionEntity GetTransactionDetails(long TransactionID)
        {
            FeeTransactionEntity ft = new FeeTransactionEntity();
            try
            {
                DataSet ds = objData.GetTransactionDetails(TransactionID);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[0].Rows[0];

                    ft.TransactionID = Convert.ToInt64(dr["TransactionID"].ToString());
                    ft.PayeeID = Convert.ToInt64(dr["PayeeID"].ToString());
                    ft.PayeeApplicationID = dr["PayeeApplicationID"].ToString();
                    ft.PayeeDisplayApplicationId = dr["PayeeDisplayApplicationId"].ToString();
                    ft.Course = dr["Course"].ToString();
                    ft.AcademicYear = dr["AcademicYear"].ToString();
                    ft.PayeeName = dr["PayeeName"].ToString();
                    ft.PayeeMobileNo = dr["PayeeMobileNo"].ToString();
                    ft.PayeeEMailID = dr["PayeeEMailID"].ToString();
                    ft.FeeAmount = Convert.ToDecimal(dr["FeeAmount"]);
                    ft.ServiceCharge = Convert.ToDecimal(dr["ServiceCharge"]);
                    ft.TotalAmount = Convert.ToDecimal(dr["TotalAmount"]);
                    ft.IsValid = Convert.ToBoolean(dr["IsValid"]);
                    ft.IsPaid = Convert.ToBoolean(dr["IsPaid"]);
                    ft.IsReconciled = Convert.ToBoolean(dr["IsReconciled"]);
                    ft.TransactionDate = dr["TransactionDate"].ToString();
                    ft.LastPaymentdate = dr["LastPaymentDate"].ToString();
                    ft.BankRefereneceNo = dr["BankRefereneceNo"].ToString();
                    ft.PayGateID = dr["PayGateID"].ToString();
                    ft.PaymentDate = dr["PaymentDate"].ToString();
                    ft.Purpose = dr["Purpose"].ToString();
                    ft.PhaseID = Convert.ToInt16(dr["PhaseID"].ToString());
                    ft.ReceiptURL = dr["ReceiptURL"].ToString();
                    ft.Optional1 = Convert.ToString(dr["Optional1"]);
                    ft.Optional2 = Convert.ToString(dr["Optional2"]);
                    ft.Optional3 = Convert.ToString(dr["Optional3"]);
                    ft.Optional4 = Convert.ToString(dr["Optional4"]);
                    ft.Optional5 = Convert.ToString(dr["Optional5"]);
                    ft.PayeeCategory = Convert.ToString(dr["PayeeCategory"]);
                    ft.IsRefunded = Convert.ToBoolean(dr["IsRefunded"]);
                    ft.IsChargeBackAccepted = Convert.ToBoolean(dr["IsChargeBackAccepted"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTransactionDetails");
                throw ex;
            }
            return ft;
        }

        public DataSet GetTransactionWiseCandidateList(long TransactionID)
        {
            DataSet ds = objData.GetTransactionWiseCandidateList(TransactionID);
            return ds;
        }
        public string SetFeePushResponse(FeeTransactionEntity ft)
        {
            string s = objData.SetFeePushResponse(ft);
            return s;
        }
        public FeeDBResponse SetFeeTransactionResponse(FeeTransactionEntity ft)
        {
            FeeDBResponse fp = new FeeDBResponse();
            try
            {
                DataSet ds = objData.SetFeeTransactionResponse(ft);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    fp.TransactionID = Convert.ToInt64(ds.Tables[0].Rows[0]["TransactionID"].ToString());
                    fp.ErrorMessage = ds.Tables[0].Rows[0]["ErrorMessage"].ToString();
                    fp.SuccessFlag = ds.Tables[0].Rows[0]["IsOk"].ToString();
                    fp.BankReferenceNo = ds.Tables[0].Rows[0]["BankReferenceNo"].ToString();
                    fp.FeeAmount = Convert.ToDecimal(ds.Tables[0].Rows[0]["Amount"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SetFeeTransactionResponse");
                throw ex;
            }
            return fp;
        }
        public bool IsPhaseWiseFeePaid(long PayeeID, int PhaseID)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsPhaseWiseFeePaid(PayeeID, PhaseID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsPhaseWiseFeePaid");
                throw ex;
            }
            return retVal;
        }

        public List<FeeTransactionEntity> GetTransactionsForRefundCheck(string PayeeInput)
        {
            List<FeeTransactionEntity> ltr = new List<FeeTransactionEntity>();
            try
            {
                DataTable dt = objData.GetTransactionsForRefundCheck(PayeeInput);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        FeeTransactionEntity ft = new FeeTransactionEntity();

                        ft.TransactionID = Convert.ToInt64(dr["TransactionID"].ToString());
                        ft.PayeeID = Convert.ToInt64(dr["PayeeID"].ToString());
                        ft.PayeeApplicationID = dr["PayeeApplicationID"].ToString();
                        ft.PayeeName = dr["PayeeName"].ToString();
                        ft.PayeeMobileNo = dr["PayeeMobileNo"].ToString();
                        ft.PayeeEMailID = dr["PayeeEMailID"].ToString();
                        ft.FeeAmount = Convert.ToDecimal(dr["FeeAmount"]);
                        ft.ServiceCharge = Convert.ToDecimal(dr["ServiceCharge"]);
                        ft.TotalAmount = Convert.ToDecimal(dr["TotalAmount"]);
                        ft.IsValid = Convert.ToBoolean(dr["IsValid"]);
                        ft.IsPaid = Convert.ToBoolean(dr["IsPaid"]);
                        ft.IsReconciled = Convert.ToBoolean(dr["IsReconciled"]);
                        ft.TransactionDate = dr["TransactionDate"].ToString();
                        ft.LastPaymentdate = dr["LastPaymentDate"].ToString();
                        ft.BankRefereneceNo = dr["BankRefereneceNo"].ToString();
                        ft.PayGateID = dr["PayGateID"].ToString();
                        ft.PaymentDate = dr["PaymentDate"].ToString();
                        ft.Purpose = dr["Purpose"].ToString();
                        ft.PhaseID = Convert.ToInt16(dr["PhaseID"].ToString());
                        ft.ReceiptURL = dr["ReceiptURL"].ToString();
                        ft.Optional1 = Convert.ToString(dr["Optional1"]);
                        ft.Optional2 = Convert.ToString(dr["Optional2"]);
                        ft.Optional3 = Convert.ToString(dr["Optional3"]);
                        ft.Optional4 = Convert.ToString(dr["Optional4"]);
                        ft.Optional5 = Convert.ToString(dr["Optional5"]);

                        //-------------- Newly added below 5 field

                        ft.IsRefunded = Convert.ToBoolean(dr["IsRefunded"]);
                        ft.IsEligibleForRefund = Convert.ToBoolean(dr["IsEligibleForRefund"]);
                        ft.RefundDate = Convert.ToString(dr["RefundDate"]);
                        ft.IsChargeBackAccepted = Convert.ToBoolean(dr["IsChargeBackAccepted"]);
                        ft.ChargeBackDate = Convert.ToString(dr["ChargeBackDate"]);
                        ft.TxStatus = Convert.ToString(dr["TxStatus"]);
                        ft.VendorId = Convert.ToInt32(dr["VendorId"]);
                        ltr.Add(ft);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTransactionsForRefundCheck");
                throw ex;
            }
            return ltr;
        }

        public string RefundTransaction(string transactionId, string userLoginId, string RefundRequestId, string RefundBankRRN, string CommandName, string IPAddress)
        {

            string retVal = "N";
            try
            {
                retVal = objData.RefundTransaction(transactionId, userLoginId, RefundRequestId, RefundBankRRN, CommandName, IPAddress);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RefundTransaction");
                throw ex;
            }
            return retVal;
        }


        public string SaveOrderId(string transactionId, string orderId)
        {
            string retVal = "N";
            try
            {
                retVal = objData.SaveOrderId(transactionId, orderId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveOrderId");
                throw ex;
            }
            return retVal;
        }

        public DataTable SaveFeeCartItems(List<CandidateListForPayment> lst, long InstituteID, long CourseID, long BatchID, string UserLoginId, string IPAddress, int phaseId = 2)
        {
            DataTable dt;
            try
            {
                dt = objData.SaveFeeCartItems(lst, InstituteID, CourseID, BatchID, UserLoginId, IPAddress, phaseId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveFeeCartItems");
                throw ex;
            }
            return dt;
        }
        public DataSet GetFeeCartItems(long CartId)
        {
            DataSet dt;
            try
            {
                dt = objData.GetFeeCartItems(CartId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetFeeCartItems");
                throw ex;
            }
            return dt;
        }

        public DataTable SaveFeeCartItemsForCourses(List<CourseListForPayment> lst, long CollegeID, string UserLoginId, string IPAddress, int phaseId = 2)
        {
            DataTable dt;
            try
            {
                dt = objData.SaveFeeCartItemsForCourses(lst, CollegeID, UserLoginId, IPAddress, phaseId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveFeeCartItemsForCourses");
                throw ex;
            }
            return dt;
        }


        public async Task CheckFailedTransactions(long candidateId)
        {
            try
            {
                var failedTransactions = GetFailedTransactionForAPICheck(candidateId);

                if (failedTransactions?.Any() == true)
                {
                    foreach (var transaction in failedTransactions)
                    {
                        if (!string.IsNullOrEmpty(transaction.OrderId))
                        {
                            await CheckRazorpayPayment(transaction.OrderId);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Error checking failed transactions for candidate {CandidateId}");
            }
        }

        public async Task CheckRazorpayPayment(string orderId)
        {
            try
            {
                var client = new RazorpayClient(
                   _configuration["Razorpay:RazorPayKey"],
                    _configuration["Razorpay:RazorPaySecret"]
                );

                Order order = client.Order.Fetch(orderId);

                if (order?["status"] == "paid")
                {
                    string transactionId = order["receipt"];
                    List<Payment> payments = client.Order.Fetch(orderId).Payments();

                    if (payments?.Any() == true)
                    {
                        foreach (Payment payment in payments)
                        {
                            if (payment["status"] == "captured")
                            {
                                var feeTransaction = new FeeTransactionEntity
                                {
                                    TransactionID = Convert.ToInt64(transactionId),
                                    Optional2 = payment["method"],
                                    PayGateID = "",
                                    BankRefereneceNo = payment["id"],
                                    FeeAmount = Convert.ToDecimal(payment["amount"]) / 100.00m,
                                    IsPaid = true,
                                    IsValid = true,
                                    GatewayResponse = JsonConvert.SerializeObject(payment),
                                    IsAPICheck = true
                                };

                                SetFeeTransactionResponse(feeTransaction);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Error checking Razorpay payment for order {OrderId}");
            }
        }
    }
}
