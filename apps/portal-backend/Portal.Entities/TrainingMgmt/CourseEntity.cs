using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.TrainingMgmt
{
    public class CourseEntity
    {
        public Int64 InstituteId { get; set; }
        public string InstituteCode { get; set; }
        public string InstituteName { get; set; }
        public Int64 CourseId { get; set; }
        public string CourseName { get; set; }
        public string CourseCode { get; set; }       
        public List<BatchEntity> lstBatch { get; set; }

        public CourseEntity() {
            lstBatch = new List<BatchEntity>(); 
        }   
    }
}
