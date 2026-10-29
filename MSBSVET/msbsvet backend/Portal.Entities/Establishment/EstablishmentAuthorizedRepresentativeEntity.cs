using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Establishment
{
    public class EstablishmentAuthorizedRepresentativeEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string Title { get; set; }
        public string NAPSCandidateName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Designation { get; set; }
        public string GenderCode { get; set; }
        public string MobileNo { get; set; }
        public string AlternateMobileNo { get; set; }
        public string EMailID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string ReasonForRejection { get; set; }
    }
}
