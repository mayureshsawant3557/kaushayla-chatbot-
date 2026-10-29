using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Inspection

{
    public class InstituteInspectionStatusEntity
    {
        public InstituteInfoEntity InstituteInfo { get; set; }

        public int InspectionStatusId { get; set; }
        public string InspectionStatus { get; set; }

        public InstituteInspectionStatusEntity()
        {
            InstituteInfo = new InstituteInfoEntity();
        }
    }
}
