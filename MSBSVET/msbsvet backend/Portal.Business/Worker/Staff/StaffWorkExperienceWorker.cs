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
    public class StaffWorkExperienceWorker : IStaffWorkExperience
    {
        private readonly Repository objData;
        //Inject Repository via Constructor 
        public StaffWorkExperienceWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public List<StaffWorkExperienceEntity> GetStaffWorkExperienceList(long StaffID)
        {
            List<StaffWorkExperienceEntity> list = new List<StaffWorkExperienceEntity>();
            try
            {
                DataTable dt = objData.GetStaffWorkExperienceList(StaffID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    StaffWorkExperienceEntity obj;
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj = new StaffWorkExperienceEntity();

                        obj.WorkExperienceRowID = Convert.ToInt64(dr["WorkExperienceRowID"]);
                        obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                        obj.EstablishmentName = Convert.ToString(dr["EstablishmentName"]);
                        obj.FromDate = Convert.ToDateTime(dr["FromDate"]);
                        obj.FromDateStr = Convert.ToString(dr["FromDateStr"]);
                        obj.ToDate = Convert.ToDateTime(dr["ToDate"]);
                        obj.ToDateStr = Convert.ToString(dr["ToDateStr"]);
                        obj.SalaryPerMonth = Convert.ToInt32(dr["SalaryPerMonth"]);
                        obj.JobRole = Convert.ToString(dr["JobRole"]);
                        obj.Address = Convert.ToString(dr["Address"]);
                        obj.StateID = Convert.ToInt16(dr["StateID"]);
                        obj.State = Convert.ToString(dr["State"]);
                        obj.DistrictID = Convert.ToInt32(dr["DistrictID"]);
                        obj.District = Convert.ToString(dr["District"]);
                        obj.TalukaID = Convert.ToInt32(dr["TalukaID"]);
                        obj.Taluka = Convert.ToString(dr["Taluka"]);
                        obj.CityID = Convert.ToInt32(dr["CityID"]);
                        obj.City = Convert.ToString(dr["City"]);
                        obj.OtherCity = Convert.ToString(dr["OtherCity"]);
                        obj.Pincode = Convert.ToString(dr["Pincode"]);
                        obj.IsPincodeCorrect = Convert.ToInt16(dr["IsPincodeCorrect"]);
                        obj.IsWorkExperience = Convert.ToString(dr["IsWorkExperience"]);

                        list.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffWorkExperienceList", StaffID.ToString());
                throw ex;
            }
            return list;
        }
        public StaffWorkExperienceEntity GetStaffWorkExperience(long WorkExperienceRowID)
        {
            StaffWorkExperienceEntity obj = new StaffWorkExperienceEntity();
            try
            {
                DataTable dt = objData.GetStaffWorkExperience(WorkExperienceRowID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.WorkExperienceRowID = Convert.ToInt64(dr["WorkExperienceRowID"]);
                    obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.EstablishmentName = Convert.ToString(dr["EstablishmentName"]);
                    obj.FromDate = Convert.ToDateTime(dr["FromDate"]);
                    obj.ToDate = Convert.ToDateTime(dr["ToDate"]);
                    obj.SalaryPerMonth = Convert.ToInt32(dr["SalaryPerMonth"]);
                    obj.JobRole = Convert.ToString(dr["JobRole"]);
                    obj.Address = Convert.ToString(dr["Address"]);
                    obj.StateID = Convert.ToInt16(dr["StateID"]);
                    obj.DistrictID = Convert.ToInt32(dr["DistrictID"]);
                    obj.TalukaID = Convert.ToInt32(dr["TalukaID"]);
                    obj.CityID = Convert.ToInt32(dr["CityID"]);
                    obj.OtherCity = Convert.ToString(dr["OtherCity"]);
                    obj.Pincode = Convert.ToString(dr["Pincode"]);
                    obj.IsPincodeCorrect = Convert.ToInt16(dr["IsPincodeCorrect"]);
                    obj.IsWorkExperience = Convert.ToString(dr["IsWorkExperience"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffWorkExperience", WorkExperienceRowID.ToString());
                throw ex;
            }
            return obj;
        }
        public string DeleteStaffWorkExperience(StaffWorkExperienceEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteStaffWorkExperience(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteStaffWorkExperience", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string SaveStaffWorkExperience(StaffWorkExperienceEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffWorkExperience(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffWorkExperience", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string SaveSectorialExpertise(List<SectorialExpertiseEntity> entity, long StaffID, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveSectorialExpertise(entity, StaffID, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveSectorialExpertise", UserLoginID);
                retVal = ex.Message;
            }
            return retVal;

        }
        public List<SectorialExpertiseEntity> GetStaffSectorialExpertiseList(long StaffID)
        {
            List<SectorialExpertiseEntity> list = new List<SectorialExpertiseEntity>();
            try
            {
                DataTable dt = objData.GetStaffSectorialExpertiseList(StaffID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    SectorialExpertiseEntity obj;
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj = new SectorialExpertiseEntity();
                        obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                        obj.SectorialExpertiseID = Convert.ToInt64(dr["SectorialExpertiseID"]);
                        obj.SectorialExpertiseName = Convert.ToString(dr["SectorialExpertiseName"]);
                        obj.IsSectorialExperience = Convert.ToString(dr["IsSectorialExperience"]);
                        list.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffSectorialExpertiseList", StaffID.ToString());
                throw ex;
            }
            return list;
        }
    }
}
