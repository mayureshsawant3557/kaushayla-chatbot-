using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Fee
{
    public class FeeTransactionEntity
    {
        public Int64 TransactionID { get; set; }
        public Int64 PayeeID { get; set; }
        public string PayeeApplicationID { get; set; }
        public string PayeeDisplayApplicationId { get; set; }
        public string PayeeName { get; set; }
        public string PayeeMobileNo { get; set; }
        public string PayeeEMailID { get; set; }
        public decimal FeeAmount { get; set; }
        public decimal ServiceCharge { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsValid { get; set; }
        public bool IsPaid { get; set; }
        public bool IsReconciled { get; set; }
        public string TransactionDate { get; set; }
        public string LastPaymentdate { get; set; }
        public string BankRefereneceNo { get; set; }
        public string PayGateID { get; set; }
        public string PaymentDate { get; set; }
        public string Purpose { get; set; }
        public Int16 PhaseID { get; set; }
        public string ReceiptURL { get; set; }
        public string Optional1 { get; set; }
        public string Optional2 { get; set; }
        public string Optional3 { get; set; }
        public string Optional4 { get; set; }
        public string Optional5 { get; set; }
        public string GatewayResponse { get; set; }
        public string ErrorMessage { get; set; }

        public string RefundDate { get; set; }
        public bool IsRefunded { get; set; }
        public bool IsEligibleForRefund { get; set; }

        public string ChargeBackDate { get; set; }
        public bool IsChargeBackAccepted { get; set; }

        public string TxStatus { get; set; }

        public string PayeeCategory { get; set; }

        public string PaymentVendor { get; set; }

        public bool IsPushResponse { get; set; }

        public bool IsAPICheck { get; set; }

        public int VendorId { get; set; }

        public string Course { get; set; }
        public string AcademicYear { get; set; }

        public string BatchId { get; set; }

        public string OrderId { get; set; }
        public FeeTransactionEntity()
        {
            IsPaid = false;
            IsPushResponse = false;
        }
    }
    public class FeeEntity
    {
        public string Course { get; set; }
        public string AcademicYear { get; set; }
        public string Purpose { get; set; }
        public decimal FeeAmount { get; set; }
        public string LastPaymentDate { get; set; }
        public bool IsEligibleToPay { get; set; }
        public string NotEligibleMsg { get; set; }
        public string PayeeApplicationID { get; set; }
        public string PayeeDisplayApplicationId { get; set; }
        public string PayeeName { get; set; }
        public string? UnitCode { get; set; } //ADDED

    }
    public class FeeToPay
    {
        public FeeEntity Fee { get; set; }
        public List<FeeTransactionEntity> PaidTransactions { get; set; }
        public FeeToPay()
        {
            Fee = new FeeEntity();
            PaidTransactions = new List<FeeTransactionEntity>();
        }
    }
    public class FeeDBResponse
    {
        public Int64 TransactionID { get; set; }
        public decimal FeeAmount { get; set; }
        public string BankReferenceNo { get; set; }
        public string SuccessFlag { get; set; }
        public string ErrorMessage { get; set; }
    }
    public class CandidateListForPayment
    {
        public long ApplicationId { get; set; }
        public long CourseID { get; set; }
        public long BatchID { get; set; }
        public long InstituteID { get; set; }
        public long CandidateID {get;set;}
		public Int32 BoardFees { get;set; }
        public Int32 AssessmentFees { get; set; }
        public Int32 ExamFees { get; set; }
        public long NewBatchID { get; set; }
        public Int32 PaidInspectionUnit { get; set; }
        public Int64 SecurityFees { get; set; }
        public Int64 PayeeId { get; set; }
    }

    public class CourseListForPayment
    {
        public long CourseID { get; set; }
        public long ShiftID { get; set; }
        public long UnitID { get; set; }
        public long UnitCode { get; set; }
    }
}