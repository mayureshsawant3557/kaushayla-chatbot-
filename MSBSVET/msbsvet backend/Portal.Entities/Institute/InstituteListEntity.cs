using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class InstituteListEntity
    {
        public Int64 InstituteID { get; set; }
        public string InstituteCode { get; set; }
        public string InstituteName { get; set; }    
        public string InstituteUrl { get; set; }

		public Int16 RegionID { get; set; }
        public string Region { get; set; }
        public Int32 DistrictID { get; set; }
        public string District { get; set; }
        public Int32 TalukaID { get; set; }
        public string Taluka { get; set; }
        public Int64 ChoiceCode { get; set; }
        public Int64 CourseID { get; set; }
        public string CourseCode { get; set; }
        public string Course { get; set; }
        public Int16 ShiftID { get; set; }
        public string Shift { get; set; }
        public Int16 SectorID { get; set; }
        public string Sector { get; set; }
        public Int16 CourseTypeID { get; set; }
        public string CourseType { get; set; }
        public Int16 EntryQualificationID { get; set; }
        public string EntryQualification { get; set; }
        public string AffiliationValidity { get; set; }
        public Int16 NoOfUnit { get; set; }        
        public Int16 TotalIntake { get; set; }
        public Int16 CurrentVacancy { get; set; }
		public Int32 IsApplied { get; set; }
        public string FullTimePartTime { get; set; }
	}
}
