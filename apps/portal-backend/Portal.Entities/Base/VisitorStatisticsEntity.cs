using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    public class VisitorStatisticsEntity
    {
        public long TotalVisitors { get; set; }

        public int TodayVisitors { get; set; }

        public DateTime LastUpdatedDate { get; set; }
    }
}
