using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
//using System.Web.UI.WebControls;

namespace Portal.Entities.Institute
{
    public class InspectionFeeEntity
    {
        public Int64 InstituteId { get; set; }
        public Int64 CourseID { get; set; }
        public string CourseCode { get; set; }
        public string Course { get; set; }
        public int ApprovedUnits { get; set; }
        public int ProposedUnits { get; set; }
        public int TotalUnits { get; set; }
        //added
        public int   InspectionUnits { get; set; }
        public int  LOITotalUnits  { get; set; }
        public int LOIProposedUnits { get; set; }
        public int  InspectionFee { get; set; }
        public int SecurityDeposit { get; set; }
       
       
       
       
       
        public decimal PerUnitInspectionFee { get; set; }
        public decimal ApprovedUnitsInspectionFee { get; set; }
        public decimal ProposedUnitsInspectionFee { get; set; }
        public decimal TotalUnitsInspectionFee { get; set; }
        public bool IsEditAllowed { get; set; }
        public bool IsFeePaid { get; set; }
        public string LastModifiedOn { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string ModelCurriculum { get; set; }

    }
}
