using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class BuildingSpaceAnalysisEntity
    {
        public string Title { get; set; }
        public decimal GroundFloorArea { get; set; }
        public decimal OtherFloorArea { get; set; }
        public decimal TotalFloorArea { get; set; }
        public string Remark { get; set; }
    }
}
