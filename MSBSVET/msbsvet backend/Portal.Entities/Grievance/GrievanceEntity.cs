using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities
{
    [Serializable]
    public class GrievanceEntity
    {
        public Int64 GrievanceID { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string ProfileID { get; set; }
        public string EMailID { get; set; }
        public string MobileNo { get; set; }
        public Int16 GrievanceCategoryID { get; set; }
        public string OtherGrievanceCategory { get; set; }
        public string GrievanceCategory { get; set; }
        public string Grievance { get; set; }
        public string GrievanceFileURL { get; set; }
        public string GrievanceDate { get; set; }
        public string GrievanceTime { get; set; }
        public string RepliedGrievance { get; set; }
        public string RepliedGrievanceFileURL { get; set; }
        public string RepliedGrievanceDate { get; set; }
        public string RepliedGrievanceTime { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public int IsProfileFetch { get; set; }
    }
}
