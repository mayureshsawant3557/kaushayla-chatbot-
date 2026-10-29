using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class InspectionUnitDetailsEntity
    {
        public long InstituteId { get; set; }
        public long SectorID { get; set; }
        public string Sector { get; set; }
        public string CourseType { get; set; }
        public long CourseTypeID { get; set; }
        public long CourseID { get; set; }
        public string CourseCode { get; set; }
        public string Course { get; set; }
        public string CourseWithCourseCode { get; set; }
        public int ApprovedUnits { get; set; }
        public int ProposedUnits { get; set; }
        public int TotalUnits { get; set; }
        public int LOIProposedUnits { get; set; }
        public int LOITotalUnits { get; set; }
        public decimal InspectionFee { get; set; }
        public decimal SecurityDeposit { get; set; }
        public int IsEditAllowed { get; set; }
        public int IsDeleteAllowed { get; set; }
        public int IsViewAllowed { get; set; }
        public int IsExistingCourse { get; set; }
        public decimal PerUnitSecurityDeposit { get; set; }
        public decimal PerUnitInspectionFees { get; set; }
        public string Remark { get; set; }
        public string PageStatus { get; set; }
        public int InspectionUnits { get; set; }
        public int RecommendedUnits { get; set; }
        public int RecommendedUnitsByBoard { get; set; }
        public int ApprovedCategoryID { get; set; }
        public string ApprovedCategory { get; set; }

        public int MaxBatchesPerDay { get; set; }
        public int MaxTraningSetupRequired { get; set; }
        public string ModelCurriculum { get; set; }

        //public string IsExistingInstitute { get; set; }
        //public string InstituteCode { get; set; }
        //public string DistrictCode { get; set; }
        //public string LastInstituteCodeInDistrict { get; set; }


    }
}
