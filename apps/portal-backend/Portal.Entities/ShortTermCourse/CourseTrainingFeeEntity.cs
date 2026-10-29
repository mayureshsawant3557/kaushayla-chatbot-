using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ShortTermCourse
{
    public class CourseTrainingFeeEntity
    {
        public string ActionType { get; set; }
        public int? ID { get; set; }
        public string TrainingFeeID { get; set; }
        public decimal? WithPlacement { get; set; }
        public decimal? WithoutPlacement { get; set; }
        public string UserName { get; set; }
        public string UserIpAddress { get; set; }
    }
}
