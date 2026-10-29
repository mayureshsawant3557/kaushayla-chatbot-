using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Staff    
{
    public class StaffWorkExperienceEntity
    {
        public Int64 WorkExperienceRowID { get; set; }
        public Int64 StaffID { get; set; }
        public string EstablishmentName { get; set; }
        public DateTime FromDate { get; set; }
        public string FromDateStr { get; set; }
        public DateTime ToDate { get; set; }
        public string ToDateStr { get; set; }
        public Int32 SalaryPerMonth { get; set; }
        public string JobRole { get; set; }
        public string Address { get; set; }
        public Int16 StateID { get; set; }
        public string State { get; set; }
        public Int32 DistrictID { get; set; }
        public string District { get; set; }
        public Int32 TalukaID { get; set; }
        public string Taluka { get; set; }
        public Int32 CityID { get; set; }
        public string City { get; set; }
        public string OtherCity { get; set; }
        public string Pincode { get; set; }
        public Int16 IsPincodeCorrect { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string IsWorkExperience { get; set; }
       public List<SectorialExpertiseEntity> SectorialExpertise { get; set; }
    }
    public class SectorialExpertiseEntity
	{
		public Int64 StaffID { get; set; }
		public Int64 SectorialExpertiseID { get; set; }
		public string SectorialExpertiseName { get; set; }
		public string UserLoginID { get; set; }
		public string IPAddress { get; set; }
        public string IsSectorialExperience { get; set; }

    }
}
