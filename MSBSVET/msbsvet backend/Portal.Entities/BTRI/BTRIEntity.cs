using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.BTRI
{
    public class BTRIEntity
    {
        public Int64 BTRIID { get; set; }
        public string BTRICode { get; set; }
        public string BTRIName { get; set; }
        public string CareOf { get; set; }        
        public string Address { get; set; }
        public Int16 RegionID { get; set; }
        public string Region { get; set; }
        public Int16 StateID { get; set; }
        public string State { get; set; }
        public Int32 DistrictID { get; set; }
        public string District { get; set; }
        public Int32 TalukaID { get; set; }
        public string Taluka { get; set; }
        public Int32 CityID { get; set; }
        public string City { get; set; }
        public string Pincode { get; set; }
        public string Title { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string MobileNo { get; set; }
        public string AltMobileNo { get; set; }
        public string EMailID { get; set; }
        public Int32 EstablishmentDistrictID { get; set; }
        public string EstablishmentDistrict { get; set; }

        public Int16 IsPincodeCorrect { get; set; }
        public string OtherCity { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
    }
}
