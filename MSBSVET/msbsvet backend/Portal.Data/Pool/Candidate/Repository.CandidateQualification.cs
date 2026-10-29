using Portal.Entities;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetCandidateQualificationList(Int64 CandidateID)
        {
            if (CandidateID <= 0)
            {
                throw new ArgumentException("Invalid CandidateID", nameof(CandidateID));
            }

            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", CandidateID);

            return _dbAccess.GetDataTable("Candidate_GetQualificationList", param);
        }

        public DataTable GetCandidateQualification(Int64 QualificationRowID)
        {
            if (QualificationRowID <= 0)
            {
                throw new ArgumentException("Invalid QualificationRowID", nameof(QualificationRowID));
            }

            var param = new Dictionary<string, object>();
            param.Add("@QualificationRowID", QualificationRowID);

            return _dbAccess.GetDataTable("Candidate_GetQualification", param);
        }

        public string DeleteCandidateQualification(CandidateQualificationEntity entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity), "CandidateQualificationEntity input cannot be null.");
            }

            var param = new Dictionary<string, object>();
            param.Add("@QualificationRowID", entity.QualificationRowID);
            param.Add("@CandidateID", entity.CandidateID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Candidate_DeleteQualification", param).ToString();
        }

        public string SaveCandidateQualification(CandidateQualificationEntity entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity), "CandidateQualificationEntity input cannot be null.");
            }

            var param = new Dictionary<string, object>();

            param.Add("@QualificationRowID", entity.QualificationRowID);
            param.Add("@CandidateID", entity.CandidateID);
            param.Add("@QualificationID", entity.QualificationID);
            param.Add("@Degree", entity.Degree);
            param.Add("@Subject", entity.Subject);
            param.Add("@University", entity.University);
            param.Add("@ResultDate", entity.ResultDate);
            param.Add("@AppearingYear", entity.AppearingYear);
            param.Add("@Attempts", entity.Attempts);
            param.Add("@MarksObtained", entity.MarksObtained);
            param.Add("@MaximumMarks", entity.MaximumMarks);
            param.Add("@CourseDuration", entity.CourseDuration);
            param.Add("@Class", entity.Class);
            param.Add("@Mode", entity.Mode);
            param.Add("@CertificatePath", entity.CertificatePath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Candidate_SaveQualification", param).ToString();
        }
    }
}
