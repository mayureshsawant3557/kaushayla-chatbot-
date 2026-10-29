using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ExistingInstitute
{
    public class CourseUnitDetailsEntity
    {
        public Int64 ID { get; set; }
        public DateTime ApprovalOrderDate { get; set; }
        public string ApprovalOrder { get; set; }
        public Int64 CourseID { get; set; }
        public Int64 InstituteID { get; set; }
        public Int64 UnitNo { get; set; }
        public Decimal ApprovalInspectionFeesApplicableAmount { get; set; }
        public Decimal ApprovalInspectionFeesAmountPaid { get; set; }
        public Int16 ApprovalInspectionFeesModeOfPayment { get; set; }
        public string ApprovalInspectionFeesTransactionSlipPath { get; set; }
        public Int64 ApprovalInspectionFeesAccount { get; set; }
        public DateTime ApprovalInspectionFeesPaymentDate { get; set; }
        public String ApprovalInspectionFeesTransactionId { get; set; }
        public Int64 ApprovalInspectionFeesPaymentId { get; set; }
        public string ApprovalInspectionFeesVariation { get; set; }

        public Decimal SecurityDepositDetailsApplicableAmount { get; set; }
        public Decimal SecurityDepositDetailsAmountPaid { get; set; }
        public Int16 SecurityDepositDetailsModeOfPayment { get; set; }
        public string SecurityDepositDetailsTransactionSlipPath { get; set; }
        public Int64 SecurityDepositDetailsAccount { get; set; }
        public DateTime SecurityDepositDetailsPaymentDate { get; set; }
        public String SecurityDepositDetailsTransactionId { get; set; }
        public Int64 SecurityDepositDetailsPaymentId { get; set; }
        public string SecurityDepositDetailsVariation { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public List<RenewalDetailsEntity> lstRenewalDetails;
        public CourseUnitDetailsEntity()
        {
            lstRenewalDetails = new List<RenewalDetailsEntity>();
        }
    }
}
