using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ExistingInstitute
{
    public class RenewalDetailsEntity
    {
        public Int64 InstituteID { get; set; }
        public Int64 CourseID { get; set; }
        public Int64 UnitID { get; set; }
        public Int64 ID { get; set; }
        public Int64 CourseUnitIDDetailsID { get; set; }

        public string renewalFrom { get; set; }
        public string renewalTo { get; set; }

        public Decimal ApplicableAmount { get; set; }
        public Decimal AmountPaid { get; set; }

        public Int16 ModeOfPayment { get; set; }

        public string TransactionSlipPath { get; set; }

        public Int64 Account { get; set; }
        public DateTime PaymentDate { get; set; }

        public String TransactionId { get; set; }

        public Int64 PaymentId { get; set; }
        public string Variation { get; set; }

        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }

    }
}
