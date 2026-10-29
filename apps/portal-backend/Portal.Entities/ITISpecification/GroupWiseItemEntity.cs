using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class GroupWiseItemEntity
    {
        public int ItemId { get; set; }
        public int GroupID { get; set; }
        public int SectorID { get; set; }
        public int CategoryId { get; set; }
        public string NameofITem { get; set; }
        public string GroupName { get; set; }
        public string SectorName { get; set; }
        public string CategoryName { get; set; }
        public string SpecificationDocument { get; set; }
    }
}
