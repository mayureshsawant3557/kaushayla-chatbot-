using Microsoft.Extensions.Configuration;
using Portal.Business.Interface.Administration;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities;
using Portal.Entities.Administration;
using Portal.Entities.Base;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.Drawing.Imaging;

namespace Portal.Business.Worker.Administration
{
    public class AdministrationWorker : IAdministration
    {
        private readonly Repository objData;
        private readonly IConfiguration _configuration;
        private readonly CommonHelper _commonHelper;

        //Inject Repository via Constructor 
        public AdministrationWorker(Repository repository, IConfiguration configuration)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration), "Configuration instance cannot be null");
            _commonHelper = new CommonHelper(_configuration);
        }

        public DataTable GetAllExamFees()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetAllExamFees();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAllExamFees");
                throw ex;
            }
            return dt;
        }
        public DataTable GetExamFees(int CourseTypeID, int ExamTypeID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetExamFees(CourseTypeID, ExamTypeID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExamFees");
                throw ex;
            }
            return dt;
        }
        public DataTable GetExamFeesByID(int ID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetExamFeesByID(ID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExamFeesByID : " + ID.ToString());
                throw ex;
            }
            return dt;
        }
        public string SaveExamFees(int CourseTypeID, int ExamTypeID, int BoardFees, int AssessmentFees, int ExamFees, DateTime? ImplementationDate, string UserLoginID, string IpAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveExamFees(CourseTypeID, ExamTypeID, BoardFees, AssessmentFees, ExamFees, ImplementationDate, UserLoginID, IpAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveExamFees");
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataTable GetEvaluationForUnlock(long BatchID, string SubjectCode, string subjectType)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetEvaluationForUnlock(BatchID, SubjectCode, subjectType);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExamFees");
                throw ex;
            }
            return dt;
        }
        public string UpdateEvaluationMarksUnlock(long BatchID, string SubjectCode, string UserLoginID, string IpAddress, string subjectType)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateEvaluationMarksUnlock(BatchID, SubjectCode, UserLoginID, IpAddress, subjectType);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveExamFees");
                retVal = ex.Message;
            }
            return retVal;
        }
        public List<DropdownEntity> GetInstituteCourseBatche(long InstituteID, long CourseID, int AdmissionYearID, bool isAttendanceDashboard = false)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetInstituteCourseBatche(InstituteID, CourseID, AdmissionYearID, isAttendanceDashboard);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterTableList");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> DataTableToList(DataTable table, bool hasSelect)
        {
            var list = new List<DropdownEntity>(table.Rows.Count);
            DropdownEntity ddl;

            if (hasSelect)
            {
                ddl = new DropdownEntity()
                {
                    Value = "-1",
                    Text = "Select",
                    Group = "-1",
                    Group2 = "-1"
                };
                list.Add(ddl);
            }
            if (table != null && table.Rows.Count > 0)
            {
                foreach (DataRow row in table.Rows)
                {
                    var values = row.ItemArray;
                    ddl = new DropdownEntity()
                    {
                        Value = values[0].ToString(),
                        Text = values[1].ToString(),
                        Group = values[2].ToString(),
                        Group2 = values.Length > 3 ? values[3].ToString() : "-1"
                    };
                    list.Add(ddl);
                }
            }
            return list;
        }
        public DataTable GetBatchWiseAdmittedCandidate(long BatchID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetBatchWiseAdmittedCandidate(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchWiseAdmittedCandidate : " + BatchID.ToString());
                throw ex;
            }
            return dt;
        }
        public List<ManageContactUsEntity> GetManageContactUs()
        {
            List<ManageContactUsEntity> lst = new List<ManageContactUsEntity>();
            try
            {
                DataTable dt = objData.GetManageContactUs();
                if (dt != null)
                {
                    if (dt.Rows.Count > 0)
                    {
                        return FillManageContactUsEntity(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchWiseAdmittedCandidate : ", "");
                throw ex;
            }
            return lst;
        }
        private List<ManageContactUsEntity> FillManageContactUsEntity(DataTable dt)
        {
            List<ManageContactUsEntity> lst = new List<ManageContactUsEntity>();

            foreach (DataRow dr in dt.Rows)
            {
                ManageContactUsEntity entity = new ManageContactUsEntity();
                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "ID"))
                    entity.ID = Convert.ToInt64(dr["ID"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "OfficeID"))
                    entity.OfficeID = Convert.ToInt32(dr["OfficeID"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "RegionID"))
                    entity.RegionID = Convert.ToInt32(dr["RegionID"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "DistrictID"))
                    entity.DistrictID = Convert.ToInt32(dr["DistrictID"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "GeoLOcation"))
                    entity.GeoLocation = dr["GeoLOcation"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "Website"))
                    entity.Website = dr["Website"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "PhoneNo"))
                    entity.PhoneNo = dr["PhoneNo"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "Emailid"))
                    entity.Emailid = dr["Emailid"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "HelplineNumber"))
                    entity.HelplineNumber = dr["HelplineNumber"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "Address"))
                    entity.Address = dr["Address"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "JointDirectorName"))
                    entity.JointDirectorName = dr["JointDirectorName"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "IsActive"))
                    entity.IsActive = Convert.ToBoolean(dr["IsActive"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "ContactUsType"))
                    entity.ContactUsType = dr["ContactUsType"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "Region"))
                    entity.Region = dr["Region"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "RegionMarathi"))
                    entity.RegionMarathi = dr["RegionMarathi"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "District"))
                    entity.District = dr["District"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "DistrictMarathi"))
                    entity.DistrictMarathi = dr["DistrictMarathi"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "WebsiteMarathi"))
                    entity.WebsiteMarathi = dr["WebsiteMarathi"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "PhoneNoMarathi"))
                    entity.PhoneNoMarathi = dr["PhoneNoMarathi"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "EmailidMarathi"))
                    entity.EmailidMarathi = dr["EmailidMarathi"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "HelplineNumberMarathi"))
                    entity.HelplineNumberMarathi = dr["HelplineNumberMarathi"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "AddressMarathi"))
                    entity.AddressMarathi = dr["AddressMarathi"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "JointDirectorNameMarathi"))
                    entity.JointDirectorNameMarathi = dr["JointDirectorNameMarathi"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "GeoLocationUrl"))
                    entity.GeoLocationUrl = dr["GeoLocationUrl"].ToString();


                lst.Add(entity);
            }

            return lst;

        }
        public DataTable GetCandidatePhotoDetails(string ProfileId)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCandidatePhotoDetails(ProfileId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchWiseAdmittedCandidate : " + ProfileId.ToString());
                throw ex;
            }
            return dt;
        }
        public string UpdateFixedOrientationIssueImage(CandidateUpdatedImageEntity entity)
        {
            string retVal = "";
            try
            {
                if (!string.IsNullOrWhiteSpace(entity.UpdatedProfilePhoto))
                {
                    entity.UpdatedProfilePhoto =  _commonHelper.FixImageOrientationIfRequired(
                        entity.UpdatedProfilePhoto,
                        entity.ProfileId,
                        "photo");
                }

                // Fix Signature Orientation
                if (!string.IsNullOrWhiteSpace(entity.UpdatedSignPhoto))
                {
                    entity.UpdatedSignPhoto = _commonHelper.FixImageOrientationIfRequired(
                        entity.UpdatedSignPhoto,
                        entity.ProfileId,
                        "sign");
                }
                retVal = objData.UpdateFixedOrientationIssueImage(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveExamFees");
                retVal = ex.Message;
            }
            return retVal;
        }

    }
}
