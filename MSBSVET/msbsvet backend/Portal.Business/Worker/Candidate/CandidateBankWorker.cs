using Portal.Business.Interface.Candidate;
using Portal.Entities.Candidate;
using System;
using System.Data;
using Portal.Data;
using Portal.Business.Worker.Utility;

namespace Portal.Business.Worker.Candidate
{
    public class CandidateBankWorker : ICandidateBank
    {

        private readonly Repository _repository;
        //private readonly CommonHelper _commonHelper;
        //Inject Repository via Constructor 
        public CandidateBankWorker(Repository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            //_commonHelper = commonHelper ?? throw new ArgumentNullException(nameof(commonHelper));
        }

        public CandidateBankEntity GetCandidateBank(CandidateInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            CandidateBankEntity obj = new CandidateBankEntity();
            try
            {
                DataTable dt = _repository.GetCandidateBank(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.AccountType = Convert.ToString(dr["AccountType"]);
                    obj.AccountNo = Convert.ToString(dr["AccountNo"]);
                    obj.AccountHolderName = Convert.ToString(dr["AccountHolderName"]);
                    obj.IFSCCode = Convert.ToString(dr["IFSCCode"]);
                    obj.BankName = Convert.ToString(dr["BankName"]);
                    obj.BranchName = Convert.ToString(dr["BranchName"]);
                    obj.CancelChequePath = Convert.ToString(dr["CancelChequePath"]);
                    obj.PANNo = Convert.ToString(dr["PANNo"]);
                    obj.PANPath = Convert.ToString(dr["PANPath"]);
                    obj.IsBankAcount = Convert.ToInt32(dr["IsBankAcount"]);
                    obj.IsPANDetails = Convert.ToInt32(dr["IsPANDetails"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateBank", entity.UserLoginID);
                throw;
            }
            return obj;
        }

        public string SaveCandidateBank(CandidateBankEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            string retVal;
            try
            {
                retVal = _repository.SaveCandidateBank(entity);

                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateBank", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
