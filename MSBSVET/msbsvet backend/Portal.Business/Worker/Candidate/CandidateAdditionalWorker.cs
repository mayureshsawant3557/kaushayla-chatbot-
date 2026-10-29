using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Business.Worker.Candidate
{
    public class CandidateAdditionalWorker : ICandidateAdditional
    {
        private readonly Repository _objData;

        // ✅ Dependency Injection to avoid NullReferenceException
        public CandidateAdditionalWorker(Repository objData)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }

        public CandidateAdditionalEntity GetCandidateAdditional(CandidateInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateInput cannot be null");

            CandidateAdditionalEntity obj = new CandidateAdditionalEntity();
            try
            {
                DataTable dt = _objData.GetCandidateAdditional(entity);

                if (dt == null || dt.Rows.Count == 0)
                {
                    Console.WriteLine($"No data found for CandidateID: {entity.CandidateID}");
                    return null;
                }

                DataRow dr = dt.Rows[0];

                obj.CandidateID = dr["CandidateID"] != DBNull.Value ? Convert.ToInt64(dr["CandidateID"]) : 0;
                obj.BloodGroupID = dr["BloodGroupID"] != DBNull.Value ? Convert.ToInt16(dr["BloodGroupID"]) : (short)0;
                obj.MotherTongueID = dr["MotherTongueID"] != DBNull.Value ? Convert.ToInt16(dr["MotherTongueID"]) : (short)0;

                Console.WriteLine($"Successfully fetched data for CandidateID: {obj.CandidateID}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetCandidateAdditional: {ex.Message}");
                CommonHelper.SaveException(ex.Message, "GetCandidateAdditional");
                throw;
            }
            return obj;
        }

        public string SaveCandidateAdditional(CandidateAdditionalEntity entity)
        {
            if (entity == null)
                return "Invalid input data.";

            string retVal = "";
            try
            {
                retVal = _objData.SaveCandidateAdditional(entity);
                if (string.IsNullOrEmpty(retVal) || retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateAdditional", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public List<CandidateLanguageEntity> GetCandidateLanguageList(long CandidateID)
        {
            List<CandidateLanguageEntity> list = new List<CandidateLanguageEntity>();
            try
            {
                DataTable dt = _objData.GetCandidateLanguageList(CandidateID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        CandidateLanguageEntity obj = new CandidateLanguageEntity
                        {
                            LanguageRowID = Convert.ToInt64(dr["LanguageRowID"]),
                            CandidateID = Convert.ToInt64(dr["CandidateID"]),
                            LanguageID = Convert.ToInt16(dr["LanguageID"]),
                            Language = Convert.ToString(dr["Language"]),
                            Read = Convert.ToInt16(dr["Read"]),
                            ReadStr = Convert.ToString(dr["ReadStr"]),
                            Write = Convert.ToInt16(dr["Write"]),
                            WriteStr = Convert.ToString(dr["WriteStr"]),
                            Speak = Convert.ToInt16(dr["Speak"]),
                            SpeakStr = Convert.ToString(dr["SpeakStr"])
                        };

                        list.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateLanguageList", CandidateID.ToString());
                throw;
            }
            return list;
        }

        public CandidateLanguageEntity GetCandidateLanguage(long LanguageRowID)
        {
            CandidateLanguageEntity obj = new CandidateLanguageEntity();
            try
            {
                DataTable dt = _objData.GetCandidateLanguage(LanguageRowID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.LanguageRowID = Convert.ToInt64(dr["LanguageRowID"]);
                    obj.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.LanguageID = Convert.ToInt16(dr["LanguageID"]);
                    obj.Read = Convert.ToInt16(dr["Read"]);
                    obj.Write = Convert.ToInt16(dr["Write"]);
                    obj.Speak = Convert.ToInt16(dr["Speak"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateLanguage", LanguageRowID.ToString());
                throw;
            }
            return obj;
        }

        public string DeleteCandidateLanguage(CandidateLanguageEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.DeleteCandidateLanguage(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteCandidateLanguage", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string SaveCandidateLanguage(CandidateLanguageEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.SaveCandidateLanguage(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateLanguage", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
