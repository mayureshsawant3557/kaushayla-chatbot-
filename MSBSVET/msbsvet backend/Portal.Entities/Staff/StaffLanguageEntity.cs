using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Staff
{
    public class StaffLanguageEntity
    {
        public Int64 LanguageRowID { get; set; }
        public Int64 StaffID { get; set; }
        public Int16 LanguageID { get; set; }
        public string Language { get; set; }
        public Int16 Read { get; set; }
        public string ReadStr { get; set; }
        public Int16 Write { get; set; }
        public string WriteStr { get; set; }
        public Int16 Speak { get; set; }
        public string SpeakStr { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
    }
}
