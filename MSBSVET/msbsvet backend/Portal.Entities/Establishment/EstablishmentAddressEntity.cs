using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Establishment

{
    public class EstablishmentAddressEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public Int16 StateID { get; set; }
        public Int32 DistrictID { get; set; }
        public Int32 TalukaID { get; set; }
        public Int32 CityID { get; set; }
        public string OtherCity { get; set; }
        public string Pincode { get; set; }
        public Int16 IsPincodeCorrect { get; set; }      
        public string PhoneNo { get; set; }
        public string EMailID { get; set; }
        public string GoogleMapLocation { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string ReasonForRejection { get; set; }
    }
}
