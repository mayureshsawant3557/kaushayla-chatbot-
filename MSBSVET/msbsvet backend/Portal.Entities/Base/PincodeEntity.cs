using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    public class PincodeEntity
    {
        public string Pincode { get; set; }
        public Int16 StateID { get; set; }
        public Int32 DistrictID { get; set; }
        public Int32 TalukaID { get; set; }
        public Int32 CityID { get; set; }
        public string OtherCity { get; set; }
    }
}
