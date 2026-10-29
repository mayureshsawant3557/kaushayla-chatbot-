using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Staff
{
    public class StaffCategoryEntity
    {
        public Int64 StaffID { get; set; }
        public Int16 NationalityID { get; set; }
        public Int16 IsMHDomiciled { get; set; }
        public string DomicileCertificatePath { get; set; }
        public Int16 ReligionID { get; set; }
        public Int16 CategoryID { get; set; }
        public Int32 CasteID { get; set; }
        public string CasteCertificatePath { get; set; }
        public Int16 IsBelongToNCL { get; set; }
        public string NCLCertificatePath { get; set; }
        public Int16 IsBelongToPWD { get; set; }
        public Int16 DisabilityPercentage { get; set; }
        public Int16 DisabilityID { get; set; }
        public string DisabilityType { get; set; }
        public string UniqueDisabilityIDNo { get; set; }
        public string PWDCertificatePath { get; set; }
		public string LeavingCertificatePath { get; set; }
		public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
    }
}
