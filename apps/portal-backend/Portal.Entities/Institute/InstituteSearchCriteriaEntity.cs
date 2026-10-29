using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
	public class InstituteSearchCriteriaEntity
	{
		public Int16? RegionID { get; set; }
		public Int32? DistrictID { get; set; }
		public Int32? TalukaID { get; set; }
		public Int16? SectorID { get; set; }
		public Int16? CourseTypeID { get; set; }
		public Int64? CourseID { get; set; }
		public Int16? EntryQualificationID { get; set; }

		public string FullPartTime { get; set; }
		public string InstituteCode { get; set; }

		public Int64 InstituteID { get; set; }

        public Int16 ISForSTT { get; set; }

    }
}
