using Portal.Business.Interface.Obwc;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.DataMySQL;
using Portal.Entities.Base;
using Portal.Entities.Obwc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Obwc
{
    public class ObwcWorker : IObwc
    {
        private readonly Repository objData;
        // Constructor Injection for Dependency Injection
        public ObwcWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }
        MySQLData objDataMySQL = new MySQLData();
        private List<ObwcResultEntity> FillResultData(DataTable dt)
        {
            List<ObwcResultEntity> lst = new List<ObwcResultEntity>();
            foreach (DataRow dr in dt.Rows)
            {
                ObwcResultEntity entity = new ObwcResultEntity();
                if (dt.Columns.Cast<DataColumn>()
                                      .Any(c => c.ColumnName == "site_id"))
                    entity.site_id = dr["site_id"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                                    .Any(c => c.ColumnName == "nameOfSite"))
                    entity.nameOfSite = dr["nameOfSite"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                            .Any(c => c.ColumnName == "addressOfSite"))
                    entity.addressOfSite = dr["addressOfSite"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "district_name"))
                    entity.district_name = dr["district_name"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "statusOfCamp"))
                    entity.statusOfCamp = dr["statusOfCamp"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "reason"))
                    entity.reason = dr["reason"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "site_approval_date"))
                    entity.site_approval_date = dr["site_approval_date"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "batch_id"))
                    entity.batch_id = dr["batch_id"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "batch_code"))
                    entity.batch_code = dr["batch_code"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "batch_status"))
                    entity.batch_status = dr["batch_status"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "batch_create_date"))
                    entity.batch_create_date = dr["batch_create_date"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "course_name"))
                    entity.course_name = dr["course_name"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                            .Any(c => c.ColumnName == "training_start_date"))
                    entity.training_start_date = dr["training_start_date"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "addressOfSite"))
                    entity.training_end_date = dr["training_end_date"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "registration_no"))
                    entity.registration_no = dr["registration_no"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "fullname_worker"))
                    entity.fullname_worker = dr["fullname_worker"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "age_worker"))
                    entity.age_worker = dr["age_worker"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "gender"))
                    entity.gender = dr["gender"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "status"))
                    entity.status = dr["status"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "type_of_worker_title"))
                    entity.type_of_worker_title = dr["type_of_worker_title"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "total_marks"))
                    entity.total_marks = dr["total_marks"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "attendance"))
                    entity.attendance = dr["attendance"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "acquired_marks"))
                    entity.acquired_marks = dr["acquired_marks"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "percentage_of_worker"))
                    entity.percentage_of_worker = dr["percentage_of_worker"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "result_of_worker"))
                    entity.result_of_worker = dr["result_of_worker"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "trainingPartnerName"))
                    entity.trainingPartnerName = dr["trainingPartnerName"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "BatchCodeURL"))
                    entity.BatchCodeURL = dr["BatchCodeURL"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "District"))
                    entity.District = dr["District"].ToString();


                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "Address"))
                    entity.Address = dr["Address"].ToString();

                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "Taluka"))
                    entity.Taluka = dr["Taluka"].ToString();

                if (dt.Columns.Cast<DataColumn>()
                  .Any(c => c.ColumnName == "PinCode"))
                    entity.PinCode = dr["PinCode"].ToString();

                if (dt.Columns.Cast<DataColumn>()
                  .Any(c => c.ColumnName == "CityVillage"))
                    entity.CityVillage = dr["CityVillage"].ToString();

                if (dt.Columns.Cast<DataColumn>()
           .Any(c => c.ColumnName == "Title"))
                    entity.Title = dr["Title"].ToString();

                if (dt.Columns.Cast<DataColumn>()
                 .Any(c => c.ColumnName == "FirstName"))
                    entity.FirstName = dr["FirstName"].ToString();

                if (dt.Columns.Cast<DataColumn>()
                .Any(c => c.ColumnName == "MiddleName"))
                    entity.MiddleName = dr["MiddleName"].ToString();

                if (dt.Columns.Cast<DataColumn>()
                .Any(c => c.ColumnName == "LastName"))
                    entity.LastName = dr["LastName"].ToString();

                if (dt.Columns.Cast<DataColumn>()
            .Any(c => c.ColumnName == "PrimaryMobileNumber"))
                    entity.PrimaryMobileNumber = dr["PrimaryMobileNumber"].ToString();
                if (dt.Columns.Cast<DataColumn>()
            .Any(c => c.ColumnName == "AlternativeMobileNumber"))
                    entity.AlternativeMobileNumber = dr["AlternativeMobileNumber"].ToString();

                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "TrainingPartner"))
                    entity.TrainingPartner = dr["TrainingPartner"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "CourseName"))
                    entity.CourseName = dr["CourseName"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "CourseCode"))
                    entity.CourseCode = dr["CourseCode"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                            .Any(c => c.ColumnName == "InstituteCode"))
                    entity.InstituteCode = dr["InstituteCode"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "Passed"))
                    entity.Passed = Convert.ToInt16(dr["Passed"].ToString());
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "Appeared"))
                    entity.Appeared = Convert.ToInt16(dr["Appeared"].ToString());
                if (dt.Columns.Cast<DataColumn>()
                      .Any(c => c.ColumnName == "Enrolled"))
                    entity.Enrolled = Convert.ToInt16(dr["Enrolled"].ToString());

                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "InstituteID"))
                    entity.InstituteID = dr["InstituteID"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "CourseID"))
                    entity.CourseID = dr["CourseID"].ToString();

                if (dt.Columns.Cast<DataColumn>()
             .Any(c => c.ColumnName == "AssessmentDate"))
                    entity.AssessmentDate = dr["AssessmentDate"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "IsCertificateGenerated"))
                    entity.IsCertificateGenerated = dr["IsCertificateGenerated"].ToString();

                if (dt.Columns.Cast<DataColumn>()
              .Any(c => c.ColumnName == "dob_worker"))
                    entity.dob_worker = dr["dob_worker"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "mobile_no_worker"))
                    entity.mobile_no_worker = dr["mobile_no_worker"].ToString();

                if (dt.Columns.Cast<DataColumn>()
          .Any(c => c.ColumnName == "PrintDateTime"))
                    entity.PrintDateTime = dr["PrintDateTime"].ToString();

                if (dt.Columns.Cast<DataColumn>()
          .Any(c => c.ColumnName == "SiteAddress"))
                    entity.SiteAddress = dr["SiteAddress"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "SiteName"))
                    entity.SiteName = dr["SiteName"].ToString();
                if (dt.Columns.Cast<DataColumn>()
         .Any(c => c.ColumnName == "SiteCityVillage"))
                    entity.SiteCityVillage = dr["SiteCityVillage"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "SitePinCode"))
                    entity.SitePinCode = dr["SitePinCode"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                    .Any(c => c.ColumnName == "SiteTaluka"))
                    entity.SiteTaluka = dr["SiteTaluka"].ToString();
                if (dt.Columns.Cast<DataColumn>()
         .Any(c => c.ColumnName == "SiteTulakaCode"))
                    entity.SiteTulakaCode = dr["SiteTulakaCode"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "SiteDistrict"))
                    entity.SiteDistrict = dr["SiteDistrict"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                     .Any(c => c.ColumnName == "SiteDistrictCode"))
                    entity.SiteDistrictCode = dr["SiteDistrictCode"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                                     .Any(c => c.ColumnName == "DispatchDateTime"))
                    entity.DispatchDateTime = dr["DispatchDateTime"].ToString();
                if (dt.Columns.Cast<DataColumn>()
                                     .Any(c => c.ColumnName == "batch_type"))
                    entity.batch_type = dr["batch_type"].ToString();
                lst.Add(entity);
            }
            return lst;
        }
        private List<DropdownEntity> DataTableToList(DataTable table, bool hasSelect)
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

        public string UpdateBatchDate(string BatchID, string Types, DateTime SelectedDate, string CreatedBy, string CreatedByIPAddress, string BatchType)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateBatchDate(BatchID, Types, SelectedDate, CreatedBy, CreatedByIPAddress, BatchType);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSaveUpdateOBWCResult", CreatedBy);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string GetSaveUpdateOBWCResult(List<ObwcResultEntity> ResultDetails, DateTime CreatedDateTime, string CreatedBy, string CreatedByIPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetSaveUpdateOBWCResult(ResultDetails, CreatedDateTime, CreatedBy, CreatedByIPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSaveUpdateOBWCResult", CreatedBy);
                retVal = ex.Message;
            }
            return retVal;
        }
        public List<ObwcResultEntity> GetBatchData()
        {
            List<ObwcResultEntity> lst = new List<ObwcResultEntity>();
            try
            {
                DataTable dt = new DataTable();
                dt = objDataMySQL.GetBatchData();
                if (dt != null && dt.Rows.Count > 0)
                {
                    lst = FillResultData(dt);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchData", "");
                throw ex;
            }
            return lst;
        }
        public List<ObwcResultEntity> GetResultByBatchID(string BatchID, string BatchType)
        {
            List<ObwcResultEntity> lst = new List<ObwcResultEntity>();
            try
            {
                DataTable dt = new DataTable();
                dt = objData.GetResultByBatchID(BatchID, BatchType);
                if (dt != null && dt.Rows.Count > 0)
                {
                    lst = FillResultData(dt);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultByBatchID", BatchID);
                throw ex;
            }
            return lst;
        }
        public DataTable GetResultByBatchID(string BatchID, string BatchType, string tesp = "")
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetResultByBatchID(BatchID, BatchType);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultByBatchID", BatchID);
                throw ex;
            }
            return dt;
        }

        public DataTable GetResultByBatchIDExport(string BatchID, string BatchType)
        {
            DataTable dt = new DataTable();
            try
            {

                dt = objData.GetResultByBatchIDExport(BatchID, BatchType);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultByBatchID", BatchID);
                throw ex;
            }
            return dt;
        }
        public List<ObwcResultEntity> GetSearchResult(Int64 InstituteID, Int64 CoureseID, string District, string batch_id, string batch_status, string batch_type)
        {
            List<ObwcResultEntity> lst = new List<ObwcResultEntity>();
            try
            {
                DataTable dt = new DataTable();
                dt = objData.GetSearchResult(InstituteID, CoureseID, District, batch_id, batch_status, batch_type);
                if (dt != null && dt.Rows.Count > 0)
                {
                    lst = FillResultData(dt);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSearchResult", batch_id + " " + InstituteID);
                throw ex;
            }
            return lst;
        }
        public DataTable GetSearchResultExport(Int64 InstituteID, Int64 CoureseID, string District, string batch_id, string batch_status, string batch_type)
        {
            DataTable dt = new DataTable();
            try
            {

                dt = objData.GetSearchResultExport(InstituteID, CoureseID, District, batch_id, batch_status, batch_type);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSearchResultExport", InstituteID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataTable GetResultByCandidate(string BatchID, string SiteID, string CandidateID, string BatchType)
        {
            DataTable dt = new DataTable();
            try
            {

                dt = objData.GetResultByCandidate(BatchID, SiteID, CandidateID, BatchType);
                //if (dt != null && dt.Rows.Count > 0)
                //{
                //    lst = FillResultData(dt);
                //}
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultByBatchID", BatchID);
                throw ex;
            }
            return dt;
        }


        public List<DropdownEntity> GetBatchOBWCResult()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetBatchOBWCResult();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchOBWCResult");
                throw ex;
            }
            return objList;
        }

        public List<DropdownEntity> GetBatchStatusOBWCResult()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetBatchStatusOBWCResult();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchStatusOBWCResult");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetBatchTypeOBWCResult()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetBatchTypeOBWCResult();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchTypeOBWCResult");
                throw ex;
            }
            return objList;
        }

        public List<DropdownEntity> GetCourseOBWCResult()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetCourseOBWCResult();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseOBWCResult");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetDistrictOBWCResult()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetDistrictOBWCResult();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetDistrictOBWCResult");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetTraningPartnerOBWCResult()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetTraningPartnerOBWCResult();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTraningPartnerOBWCResult");
                throw ex;
            }
            return objList;
        }

        public List<DropdownEntity> GetTraningPartnerOBWCResultForInstiutte(string InstituteCode)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetTraningPartnerOBWCResultForInstiutte(InstituteCode);
                objList = DataTableToList(dt, false);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTraningPartnerOBWCResultForInstiutte");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetBatchOBWCResultForInstiutte(string InstituteCode)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetBatchOBWCResultForInstiutte(InstituteCode);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchOBWCResultForInstiutte");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetDistrictOBWCResultForInstitute(string InstituteCode)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetDistrictOBWCResultForInstitute(InstituteCode);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetDistrictOBWCResultForInstitute");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetCourseOBWCResultForInstitute(string InstituteCode)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetCourseOBWCResultForInstitute(InstituteCode);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseOBWCResultForInstitute");
                throw ex;
            }
            return objList;
        }

        public DataSet GetResultSheetBatchCode(string BatchCode)
        {
            DataSet ds = new DataSet();
            try
            {

                ds = objData.GetResultSheetBatchCode(BatchCode);
                //if (dt != null && dt.Rows.Count > 0)
                //{
                //    lst = FillResultData(dt);
                //}
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultSheetBatchCode", BatchCode);
                throw ex;
            }
            return ds;
        }
        public DataSet GetTraningPartnerOBWCResultMasters(Int64 InstituteID, Int64 CourseID, string District, string batch_status)
        {
            DataSet ds = new DataSet();
            try
            {

                ds = objData.GetTraningPartnerOBWCResultMasters(InstituteID, CourseID, District, batch_status);
                //if (dt != null && dt.Rows.Count > 0)
                //{
                //    lst = FillResultData(dt);
                //}
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTraningPartnerOBWCResultMasters", InstituteID.ToString());
                throw ex;
            }
            return ds;
        }




    }
}
