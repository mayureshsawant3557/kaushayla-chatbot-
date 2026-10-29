using Portal.Entities;
using Portal.Entities.Administration;
using Portal.Entities.Base;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Administration
{
    public interface IAdministration
    {
        DataTable GetAllExamFees();
        DataTable GetExamFees(Int32 CourseTypeID, Int32 ExamTypeID);
        string SaveExamFees(Int32 CourseTypeID, Int32 ExamTypeID, Int32 BoardFees, Int32 AssessmentFees, Int32 ExamFees, DateTime? ImplementationDate, string UserLoginID, string IpAddress);
        DataTable GetExamFeesByID(Int32 ID);
        DataTable GetEvaluationForUnlock(Int64 BatchID, string SubjectCode, string subjectType);
        string UpdateEvaluationMarksUnlock(Int64 BatchID, string SubjectCode, string UserLoginID, string IpAddress, string subjectType);
        List<DropdownEntity> GetInstituteCourseBatche(Int64 InstituteID, Int64 CourseID, Int32 AdmissionYearID, bool isAttendanceDashboard = false);
        DataTable GetBatchWiseAdmittedCandidate(Int64 BatchID);
        List<ManageContactUsEntity> GetManageContactUs();
        DataTable GetCandidatePhotoDetails(string ProfileId);
        string UpdateFixedOrientationIssueImage(CandidateUpdatedImageEntity entity);
    }
}

