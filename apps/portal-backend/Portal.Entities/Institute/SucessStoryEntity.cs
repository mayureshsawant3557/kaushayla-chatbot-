using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class SucessStoryEntity
    {
        public Int64 ID { get; set; }

        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string CandidateFullName { get; set; }
        public string CandidateProfileID { get; set; }
        public string CandidateMobileNo { get; set; }
        public string PhotoPath { get; set; }
        public Int64 CourseID { get; set; }
        public Int64 InstituteID { get; set; }
        public int PassingYearID { get; set; }
        public string PresentDesignation { get; set; }
        public string PresentOrganization { get; set; }
        public int SelectionYearID { get; set; }
        public bool IsPublished { get; set; }
        public bool IsActive { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string CourseName { get; set; }
        public string CourseCode { get; set; }
        public string InstituteCode { get; set; }
        public string InstituteName { get; set; }
        public string PassingYear { get; set; }
        public string PublishedStatus { get; set; }
        public string CourseNameCode { get; set; }
        public string InstituteNameCode { get; set; }
        public string IsProfileId { get; set; }
        public string SelectionYear { get; set; }
        public string DocumentPath { get; set; }
        public string IsProfile { get; set; }

    }
}
