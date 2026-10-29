using Portal.Data;
using Portal.Entities;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Entities.Candidate;
using System;
using System.Data;

namespace Portal.Business.Worker.Candidate
{
    public class CandidateAddressWorker : ICandidateAddress
    {
        private readonly Repository _objData;

        // ✅ Dependency Injection to prevent NullReferenceException
        public CandidateAddressWorker(Repository objData)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }

        public CandidateAddressEntity GetCandidateAddress(CandidateInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateInput cannot be null");

            CandidateAddressEntity obj = new CandidateAddressEntity();
            try
            {
                DataTable dt = _objData.GetCandidateAddress(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.CandidateID = dr["CandidateID"] != DBNull.Value ? Convert.ToInt64(dr["CandidateID"]) : 0;
                    obj.PAddress = dr["PAddress"]?.ToString();
                    obj.PStateID = dr["PStateID"] != DBNull.Value ? Convert.ToInt16(dr["PStateID"]) : (short)0;
                    obj.PDistrictID = dr["PDistrictID"] != DBNull.Value ? Convert.ToInt32(dr["PDistrictID"]) : 0;
                    obj.PTalukaID = dr["PTalukaID"] != DBNull.Value ? Convert.ToInt32(dr["PTalukaID"]) : 0;
                    obj.PCityID = dr["PCityID"] != DBNull.Value ? Convert.ToInt32(dr["PCityID"]) : 0;
                    obj.POtherCity = dr["POtherCity"]?.ToString();
                    obj.PPincode = dr["PPincode"]?.ToString();
                    obj.IsPPincodeCorrect = dr["IsPPincodeCorrect"] != DBNull.Value ? Convert.ToInt16(dr["IsPPincodeCorrect"]) : (short)0;
                    obj.IsCAddressSameAsPAddress = dr["IsCAddressSameAsPAddress"] != DBNull.Value ? Convert.ToInt16(dr["IsCAddressSameAsPAddress"]) : (short)0;
                    obj.CAddress = dr["CAddress"]?.ToString();
                    obj.CStateID = dr["CStateID"] != DBNull.Value ? Convert.ToInt16(dr["CStateID"]) : (short)0;
                    obj.CDistrictID = dr["CDistrictID"] != DBNull.Value ? Convert.ToInt32(dr["CDistrictID"]) : 0;
                    obj.CTalukaID = dr["CTalukaID"] != DBNull.Value ? Convert.ToInt32(dr["CTalukaID"]) : 0;
                    obj.CCityID = dr["CCityID"] != DBNull.Value ? Convert.ToInt32(dr["CCityID"]) : 0;
                    obj.COtherCity = dr["COtherCity"]?.ToString();
                    obj.CPincode = dr["CPincode"]?.ToString();
                    obj.IsCPincodeCorrect = dr["IsCPincodeCorrect"] != DBNull.Value ? Convert.ToInt16(dr["IsCPincodeCorrect"]) : (short)0;
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateAddress", entity.UserLoginID);
                throw;
            }
            return obj;
        }

        public string SaveCandidateAddress(CandidateAddressEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateAddressEntity cannot be null");

            try
            {
                string retVal = _objData.SaveCandidateAddress(entity);
                return retVal.ToUpper() == "N" ? "Data has not been saved. Please try again." : retVal;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateAddress", entity.UserLoginID);
                throw;
            }
        }
    }
}
