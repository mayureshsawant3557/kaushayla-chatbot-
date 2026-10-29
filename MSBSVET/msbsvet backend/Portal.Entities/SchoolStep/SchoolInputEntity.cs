using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities
{
    public class SchoolInputEntity
    {
        public long SchoolID { get; set; }
        public long InstituteId { get; set; }
        public string UDISENo { get; set; }
        public string SchoolName { get; set; }
        public string Address { get; set; }
        public int? PinCode { get; set; }
        public long CityId { get; set; }
        public string OtherCity { get; set; }
        public string Village { get; set; }
        public long TalukaId { get; set; }
        public int DistrictId { get; set; }
        public DateTime? MoUDate { get; set; }
        public DateTime? MoUExpiry { get; set; }
        public string MoUFilePath { get; set; }
        public string MoUFileName { get; set; }
        public string SelectedCourses { get; set; }
        public string CreatedBy { get; set; }
        public string IpAddress { get; set; }
    }
}
