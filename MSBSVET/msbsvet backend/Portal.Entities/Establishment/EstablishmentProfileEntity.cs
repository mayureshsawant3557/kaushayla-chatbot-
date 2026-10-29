using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Establishment
{
    public class EstablishmentProfileEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string NAPSRegistrationID { get; set; }
        public string NAPSEstablishmentName { get; set; }
        public Int32 EstablishmentTypeID { get; set; }
        public string OtherEstablishmentType { get; set; }
        public string RegistrationNo { get; set; }
        public DateTime RegistrationDate { get; set; }
        public string EstablishmentName { get; set; }
        public string RegistrationCertificatePath { get; set; }
        public string OperationsSector { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string ReasonForRejection { get; set; }
    }
}
