using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Services
{
    public class ResponseEntity
    {
        public string Responsecode { get; set; }
        public object Data { get; set; }
        public string Message { get; set; }
        public string NumberofRecords { get; set; }
    }
}
