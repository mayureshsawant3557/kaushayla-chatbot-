
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Portal.Business.Interface.Candidate
{
    public interface ICandidateCourseApply
    {
        string ApplyForCourse(CourseApplyEntity entity);
        List<InstituteListEntity> GetAppliedCourse(long CandidateID, long ApplicationID, short AdmissionYearID);
        List<InstituteListEntity> GetAppliedCourseByCandidateID(long CandidateID, long ApplicationID);
        List<InstituteListEntity> GetAppliedCourseByCandidateID(long CandidateID);
        string DeleteAppliedCourse(CourseApplyEntity entity);
        DataSet GetApplyForAdmissionEligiblity(long CandidateID, string UserLoginID);
        string DeleteAppliedCourseByCandidateID(CourseApplyEntity entity);

       

    }
}
