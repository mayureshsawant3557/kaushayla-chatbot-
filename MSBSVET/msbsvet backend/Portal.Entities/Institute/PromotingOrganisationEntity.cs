using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class PromotingOrganisationEntity
    {
        public Int64 InstituteID { get; set; }
        public Int64 OrganisationID { get; set; }
        public Int16 PromotingOrganisationStatus { get; set; }
        public Int16 PromotingOrganisationType { get; set; }
        public string OtherPromotingOrganisationType { get; set; }
        public string PromotingOrganisationName { get; set; }
        public DateTime RegistrationDate { get; set; }
        public string RegistrationNumber { get; set; }
        public string PAddress { get; set; }
        public Int16 PStateID { get; set; }
        public Int32 PDistrictID { get; set; }
        public Int32 PTalukaID { get; set; }
        public Int32 PCityID { get; set; }
        public string POtherCity { get; set; }
        public string PPincode { get; set; }
        public Int16 IsPPincodeCorrect { get; set; }
        public string MobileNo { get; set; }
        public string EMailID { get; set; }
        public string RegistrationCertificatePath { get; set; }
        public string PANNo { get; set; }
        public string PANPath { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string IsVerify { get; set; }
        public string VerifiedOn { get; set; }
        public string VerifiedBy { get; set; }
        public string PromotingOrganisationProfileID { get; set; }

    }
}
