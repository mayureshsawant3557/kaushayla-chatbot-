using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Fee
{
    public class DownloadFileEntity
    {
        public bool IsFeePaid { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
    }
}
