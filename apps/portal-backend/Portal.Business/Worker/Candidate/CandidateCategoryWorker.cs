using Portal.Data;
using Portal.Entities;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Entities.Candidate;
using System;
using System.Data;

namespace Portal.Business.Worker.Candidate
{
    public class CandidateCategoryWorker : ICandidateCategory
    {
        private readonly Repository _repository;

        // ✅ Dependency Injection: Repository is injected via constructor
        public CandidateCategoryWorker(Repository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository), "Repository instance cannot be null");
        }

        public CandidateCategoryEntity GetCandidateCategory(CandidateInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateInput cannot be null");

            CandidateCategoryEntity obj = new CandidateCategoryEntity();
            try
            {
                DataTable dt = _repository.GetCandidateCategory(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.NationalityID = Convert.ToInt16(dr["NationalityID"]);
                    obj.IsMHDomiciled = Convert.ToInt16(dr["IsMHDomiciled"]);
                    obj.DomicileCertificatePath = Convert.ToString(dr["DomicileCertificatePath"]);
                    obj.LeavingCertificatePath = Convert.ToString(dr["LeavingCertificatePath"]);
                    obj.ReligionID = Convert.ToInt16(dr["ReligionID"]);
                    obj.CategoryID = Convert.ToInt16(dr["CategoryID"]);
                    obj.CasteID = Convert.ToInt32(dr["CasteID"]);
                    obj.CasteCertificatePath = Convert.ToString(dr["CasteCertificatePath"]);
                    obj.IsBelongToNCL = Convert.ToInt16(dr["IsBelongToNCL"]);
                    obj.NCLCertificatePath = Convert.ToString(dr["NCLCertificatePath"]);
                    obj.IsBelongToPWD = Convert.ToInt16(dr["IsBelongToPWD"]);
                    obj.DisabilityPercentage = Convert.ToInt16(dr["DisabilityPercentage"]);
                    obj.DisabilityID = Convert.ToInt16(dr["DisabilityID"]);
                    obj.DisabilityType = Convert.ToString(dr["DisabilityType"]);
                    obj.UniqueDisabilityIDNo = Convert.ToString(dr["UniqueDisabilityIDNo"]);
                    obj.PWDCertificatePath = Convert.ToString(dr["PWDCertificatePath"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateCategory", entity.UserLoginID);
                throw;
            }
            return obj;
        }

        public string SaveCandidateCategory(CandidateCategoryEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateCategoryEntity cannot be null");

            string retVal = "";
            try
            {
                retVal = _repository.SaveCandidateCategory(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateCategory", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
