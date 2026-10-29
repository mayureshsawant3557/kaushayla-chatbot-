using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class ProposedCourseUnitDetailsEntity
    {
        public Int64 InstituteId { get; set; }
        public Int64 CourseId { get; set; }
        public string CourseCode { get; set; }
        public string Course { get; set; }
        public Int16 ProposedUnits { get; set; }
        public Int16 ApprovedUnits { get; set; }
        public Int16 TotalUnits { get; set; }
        public bool IsEditAllowed { get; set; }
        public bool IsDeleteAllowed { get; set; }
        public string LastModifiedOn { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }

        public string RequiredItems { get; set; }
        public string PerUnitNorms { get; set; }
        public string RequiredForProposedUnits { get; set; }
        public string RequiredForApprovedUnits { get; set; }
        public string RequiredForTotalUnits { get; set; }

        public Int16 LOIProposedUnits { get; set; }
        public Int16 LOITotalUnits { get; set; }
        public Int64 SecurityDeposit { get; set; }
        public Int64 InspectionFee { get; set; }

        public class UpdateProposedCourseUnitsRequest
        {
            public long InstituteID { get; set; }
            public List<ProposedCourseUnitDetailsEntity> ProposedCourses { get; set; }
            public string CreatedBy { get; set; }
            public string IpAddress { get; set; }
        }

    }
}
