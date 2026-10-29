using Portal.Entities;
using Portal.Entities.Staff;
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
        public DataTable GetStaffQualificationList(Int64 StaffID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", StaffID);

            return _dbAccess.GetDataTable("Staff_GetQualificationList", param);
        }
        public DataTable GetStaffQualification(Int64 QualificationRowID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@QualificationRowID", QualificationRowID);

            return _dbAccess.GetDataTable("Staff_GetQualification", param);
        }
        public string DeleteStaffQualification(StaffQualificationEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@QualificationRowID", entity.QualificationRowID);
            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_DeleteQualification", param).ToString();
        }
        public string SaveStaffQualification(StaffQualificationEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@QualificationRowID", entity.QualificationRowID);
            param.Add("@StaffID", entity.StaffID);
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

            return _dbAccess.ExecuteScalar("Staff_SaveQualification", param).ToString();
        }
    }
}
