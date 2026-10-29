using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.PromotingOrganization
{
    public class PromotingOrganizationEntity
    {
        public Int64 CandidateID { get; set; }
        public required string TypeofPromotingOrganization { get; set; }
        public required string GovernmentorPrivateStatus { get; set; }
        public string NameofPromotingOrganization { get; set; }
        public string DateofRegistrationorIncorporationorEstablishment { get; set; }
        public string RegistrationorIncorporationNumberorGRNumber { get; set; }
        public string UploadRegistrationOrIncorporationCertificate { get; set; }
        public string Addressasmentionedduringregistration { get; set; }
        public string Pincode { get; set; }
        public string State { get; set; }
        public string District { get; set; }
        public string Taluka { get; set; }
        public string CityOrVillage { get; set; }
        public string PhoneNumber { get; set; }
        public string EMailID { get; set; }
        public string PANofPromotingOrganization { get; set; }
        public string UploadPANCardofPromotingOrganization { get; set; }
    }
}
