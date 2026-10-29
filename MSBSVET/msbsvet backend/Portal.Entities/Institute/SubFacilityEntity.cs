using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class SubFacilityEntity
    {
        public long Id { get; set; }
        public long InstituteId { get; set; }
        public int FacilityGroupId { get; set; }
        public int SubFacilityGroupId { get; set; }
        public string? FacilityGroup { get; set; }
        public string? SubFacilityGroup { get; set; }
        public decimal? AvailableSpace { get; set; }
        public string? PhotoPath { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDateTime { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
        public string? CreatedBy { get; set; }  // Changed to string
        public string? ModifiedBy { get; set; }
        public int RowNumber { get; set; }
        public int TotalCount { get; set; }

        public bool IsCourse { get; set; }
        public string? Course { get; set; }
        public string? RequiredSeprate { get; set; }
        public string? RequiredSpace { get; set; }
        public string? Status { get; set; }
    }

    public class SubFacilityInputEntity
    {
        public long InstituteId { get; set; }
        public string UserLoginID { get; set; }
    }
    public class SubFacilitySaveEntity
    {
        public long Id { get; set; }
        public long InstituteId { get; set; }
        public int SubFacilityGroupId { get; set; }
        public decimal? AvailableSpace { get; set; }
        public string PhotoPath { get; set; }
        public string UserLoginID { get; set; }
        public string UserIPAddress { get; set; }
    }

    public class SubFacilityBulkSaveEntity
    {
        public long InstituteId { get; set; }
        public int SubFacilityGroupId { get; set; }
        public List<SubFacilityItem> FacilityData { get; set; }
        public string UserLoginID { get; set; }
        public string UserIPAddress { get; set; }
    }

    public class SubFacilityItem
    {
        public long? Id { get; set; }
        public decimal? AvailableSpace { get; set; }
        public string PhotoPath { get; set; }
    }

    public class SubFacilityDeleteEntity
    {
        public long Id { get; set; }
        public long InstituteId { get; set; }
        public string UserLoginID { get; set; }
        public string UserIPAddress { get; set; }
    }

}
