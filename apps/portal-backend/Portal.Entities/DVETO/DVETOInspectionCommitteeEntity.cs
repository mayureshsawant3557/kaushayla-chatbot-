using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.DVETO
{
    
    public class DVETOInspectionCommitteeEntity
    {
        // Primary fields 
        public long ID { get; set; }
        public long InstituteID { get; set; }
        public long StaffID { get; set; }
        public int ManagementType { get; set; }

        // Response fields from GET SP 
        public string? Title { get; set; }
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? MobileNo { get; set; }
        public string? Gender { get; set; }
        public string? DOB { get; set; }
        public string? ProfileID { get; set; }
        public string? CollegeRegistrationNo { get; set; }
        public string? CollegeName { get; set; }
        public string? Status { get; set; }
        public string? FormStatus { get; set; }

        // For Save/Update operations 
        public string? CreateBy { get; set; }
        public string? IPAddress { get; set; }
        public string? InspectionCommitteePhoto { get; set; }
    }

    public class DVETOInspectionCommitteePhotoEntity
    {
        public long InstituteID { get; set; }
        public string PhotoPath { get; set; }
    }



    public class DVETOInspectionCommitteeResponse
    {
        public List<DVETOInspectionCommitteeEntity> Members { get; set; }
        public DVETOInspectionCommitteePhotoEntity Photo { get; set; }
    }
}
