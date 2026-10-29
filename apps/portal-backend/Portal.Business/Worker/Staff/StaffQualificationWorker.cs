using Portal.Business.Interface.Staff;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Staff
{
    public class StaffQualificationWorker : IStaffQualification
    {
        private readonly Repository objData;
        //Inject Repository via Constructor 
        public StaffQualificationWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public List<StaffQualificationEntity> GetStaffQualificationList(long StaffID)
        {
            List<StaffQualificationEntity> list = new List<StaffQualificationEntity>();
            try
            {
                DataTable dt = objData.GetStaffQualificationList(StaffID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    StaffQualificationEntity obj;
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj = new StaffQualificationEntity();

                        obj.QualificationRowID = Convert.ToInt64(dr["QualificationRowID"]);
                        obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                        obj.QualificationID = Convert.ToInt16(dr["QualificationID"]);
                        obj.Qualification = Convert.ToString(dr["Qualification"]);
                        obj.QualificationGroup = Convert.ToString(dr["QualificationGroup"]);
                        obj.Degree = Convert.ToString(dr["Degree"]);
                        obj.Subject = Convert.ToString(dr["Subject"]);
                        obj.University = Convert.ToString(dr["University"]);
                        obj.ResultDate = Convert.ToDateTime(dr["ResultDate"]);
                        obj.ResultDateStr = Convert.ToString(dr["ResultDateStr"]);
                        obj.AppearingYearsStr = dr["AppearingYear"].ToString();
                        obj.Attempts = Convert.ToInt16(dr["Attempts"]);
                        obj.MarksObtainedStr = dr["MarksObtained"].ToString();
                        obj.MaximumMarksStr = dr["MaximumMarks"].ToString();
                        obj.CourseDuration = Convert.ToInt16(dr["CourseDuration"]);
                        obj.Class = Convert.ToString(dr["Class"]);
                        obj.Mode = Convert.ToString(dr["Mode"]);
                        obj.CertificatePath = Convert.ToString(dr["CertificatePath"]);

                        list.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffQualificationList", StaffID.ToString());
                throw ex;
            }
            return list;
        }
        public StaffQualificationEntity GetStaffQualification(long QualificationRowID)
        {
            StaffQualificationEntity obj = new StaffQualificationEntity();
            try
            {
                DataTable dt = objData.GetStaffQualification(QualificationRowID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.QualificationRowID = Convert.ToInt64(dr["QualificationRowID"]);
                    obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.QualificationID = Convert.ToInt16(dr["QualificationID"]);
                    obj.QualificationGroup = Convert.ToString(dr["QualificationGroup"]);
                    obj.Degree = Convert.ToString(dr["Degree"]);
                    obj.Subject = Convert.ToString(dr["Subject"]);
                    obj.University = Convert.ToString(dr["University"]);
                    obj.ResultDate = Convert.ToDateTime(dr["ResultDate"]);
                    obj.AppearingYear = Convert.ToInt16(dr["AppearingYear"]);
                    obj.Attempts = Convert.ToInt16(dr["Attempts"]);
                    obj.MarksObtained = Convert.ToInt32(dr["MarksObtained"]);
                    obj.MaximumMarks = Convert.ToInt32(dr["MaximumMarks"]);
                    obj.CourseDuration = Convert.ToInt16(dr["CourseDuration"]);
                    obj.Class = Convert.ToString(dr["Class"]);
                    obj.Mode = Convert.ToString(dr["Mode"]);
                    obj.CertificatePath = Convert.ToString(dr["CertificatePath"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffQualification", QualificationRowID.ToString());
                throw ex;
            }
            return obj;
        }
        public string DeleteStaffQualification(StaffQualificationEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteStaffQualification(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteStaffQualification", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string SaveStaffQualification(StaffQualificationEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffQualification(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffQualification", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
