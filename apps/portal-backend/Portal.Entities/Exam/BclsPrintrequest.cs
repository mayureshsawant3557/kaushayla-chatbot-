using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Exam;

public  class BCLSPrintAllRequest
{
    public long InstituteId { get; set; } = 0;
    public long CourseId { get; set; } = 0;
    public int ExaminationId { get; set; } = 0;
    public string IsResultFresh { get; set; } = "F";
}
