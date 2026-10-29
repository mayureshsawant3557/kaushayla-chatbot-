using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    [Serializable]
    public class FileViewEntity
    {
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public byte[] FileByteArray { get; set; }
    }
}
