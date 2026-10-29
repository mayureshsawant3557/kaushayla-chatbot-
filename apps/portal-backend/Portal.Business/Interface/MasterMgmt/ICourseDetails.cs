using Portal.Entities;
using Portal.Entities.MasterMgmt;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.MasterMgmt
{
    public interface ICourseDetails
    {
        string SaveCourse(NewCourseEntity courseEntity, string CreatedBy, string CreatedByIPAddress);
        NewCourseEntity GetCourseByID(long CourseID);
        DataTable GetTimeTableForEdit(long CourseID, int ExaminationID);
        string UpdateCourseDisplayAdmissionNewUnit(long CourseID, string UpdateCol, string Value);
    }
}
