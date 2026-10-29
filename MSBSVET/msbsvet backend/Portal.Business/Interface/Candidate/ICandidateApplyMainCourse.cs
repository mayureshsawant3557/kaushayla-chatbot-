
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Candidate
{
    public interface ICandidateApplyMainCourse
    {
        List<MainCourseApplyEntity> GetAppliedMainCourse(long CandidateID);
        string SaveAppliedMainCourse(MainCourseApplyEntity entity);
        Int16 GetMainCourseAppliedFor(Int64 ApplicationID);
    }
}
