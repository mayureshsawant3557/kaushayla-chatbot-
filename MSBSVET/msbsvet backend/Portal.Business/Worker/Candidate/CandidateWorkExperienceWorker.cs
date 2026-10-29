using Portal.Data;
using Portal.Entities;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Candidate
{
    public class CandidateWorkExperienceWorker : ICandidateWorkExperience
    {
        private readonly Repository _repository;

        // Constructor Injection
        public CandidateWorkExperienceWorker(Repository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository), "Repository instance cannot be null");
        }

        public List<CandidateWorkExperienceEntity> GetCandidateWorkExperienceList(long CandidateID)
        {
            List<CandidateWorkExperienceEntity> list = new List<CandidateWorkExperienceEntity>();
            try
            {
                DataTable dt = _repository.GetCandidateWorkExperienceList(CandidateID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        list.Add(new CandidateWorkExperienceEntity
                        {
                            WorkExperienceRowID = Convert.ToInt64(dr["WorkExperienceRowID"]),
                            CandidateID = Convert.ToInt64(dr["CandidateID"]),
                            EstablishmentName = Convert.ToString(dr["EstablishmentName"]),
                            FromDate = Convert.ToDateTime(dr["FromDate"]),
                            FromDateStr = Convert.ToString(dr["FromDateStr"]),
                            ToDate = Convert.ToDateTime(dr["ToDate"]),
                            ToDateStr = Convert.ToString(dr["ToDateStr"]),
                            SalaryPerMonth = Convert.ToInt32(dr["SalaryPerMonth"]),
                            JobRole = Convert.ToString(dr["JobRole"]),
                            Address = Convert.ToString(dr["Address"]),
                            StateID = Convert.ToInt16(dr["StateID"]),
                            State = Convert.ToString(dr["State"]),
                            DistrictID = Convert.ToInt32(dr["DistrictID"]),
                            District = Convert.ToString(dr["District"]),
                            TalukaID = Convert.ToInt32(dr["TalukaID"]),
                            Taluka = Convert.ToString(dr["Taluka"]),
                            CityID = Convert.ToInt32(dr["CityID"]),
                            City = Convert.ToString(dr["City"]),
                            OtherCity = Convert.ToString(dr["OtherCity"]),
                            Pincode = Convert.ToString(dr["Pincode"]),
                            IsPincodeCorrect = Convert.ToInt16(dr["IsPincodeCorrect"]),
                           
                            IsWorkExperience = Convert.ToString(dr["IsWorkExperience"])
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateWorkExperienceList", CandidateID.ToString());
                throw;
            }
            return list;
        }

        public CandidateWorkExperienceEntity GetCandidateWorkExperience(long WorkExperienceRowID)
        {
            try
            {
                DataTable dt = _repository.GetCandidateWorkExperience(WorkExperienceRowID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    return new CandidateWorkExperienceEntity
                    {
                        WorkExperienceRowID = Convert.ToInt64(dr["WorkExperienceRowID"]),
                        CandidateID = Convert.ToInt64(dr["CandidateID"]),
                        EstablishmentName = Convert.ToString(dr["EstablishmentName"]),
                        FromDate = Convert.ToDateTime(dr["FromDate"]),
                        ToDate = Convert.ToDateTime(dr["ToDate"]),
                        SalaryPerMonth = Convert.ToInt32(dr["SalaryPerMonth"]),
                        JobRole = Convert.ToString(dr["JobRole"]),
                        Address = Convert.ToString(dr["Address"]),
                        StateID = Convert.ToInt16(dr["StateID"]),
                        DistrictID = Convert.ToInt32(dr["DistrictID"]),
                        TalukaID = Convert.ToInt32(dr["TalukaID"]),
                        CityID = Convert.ToInt32(dr["CityID"]),
                        OtherCity = Convert.ToString(dr["OtherCity"]),
                        Pincode = Convert.ToString(dr["Pincode"]),
                        IsPincodeCorrect = Convert.ToInt16(dr["IsPincodeCorrect"]),
                        IsWorkExperience = Convert.ToString(dr["IsWorkExperience"])
                    };
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateWorkExperience", WorkExperienceRowID.ToString());
                throw;
            }
            return null;
        }

        public string DeleteCandidateWorkExperience(CandidateWorkExperienceEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));

            try
            {
                string retVal = _repository.DeleteCandidateWorkExperience(entity);
                return retVal.ToUpper() == "N" ? "Data has not been saved. Please try again." : retVal;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteCandidateWorkExperience", entity.UserLoginID);
                return ex.Message;
            }
        }

        public string SaveCandidateWorkExperience(CandidateWorkExperienceEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));

            try
            {
                string retVal = _repository.SaveCandidateWorkExperience(entity);
                return retVal.ToUpper() == "N" ? "Data has not been saved. Please try again." : retVal;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateWorkExperience", entity.UserLoginID);
                return ex.Message;
            }
        }
    }
}
