using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Admission
{
    public class BCLSStudentResponseEntity
    {
        public string status { get; set; }
        public int userid { get; set; }
        public string loginurl { get; set; }
        public bool enrolled { get; set; }
        public int courseid { get; set; }
    }
}
