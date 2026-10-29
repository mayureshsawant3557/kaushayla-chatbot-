
using Portal.Business.Interface.Registration;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Registration;
using System.Collections.Generic;
using System.Data;


namespace Portal.Business.Worker.Registration
{
    public class RegistrationWorker : IRegistration
    {
        //Repository objData = new Repository();

        private readonly Repository objData;

        // Constructor Injection for Dependency Injection
        public RegistrationWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public DataTable Registration_IsMobileNoDuplicate(string MobileNo)
        {
            try
            {
                return objData.Registration_IsMobileNoDuplicate(MobileNo);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Registration_IsMobileNoDuplicate", MobileNo.ToString());
                throw ex;
            }
        }
        public bool IsCandidateAlreadyRegisteredUsingThisMobileNo(Int64 CandidateID, string MobileNo)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsCandidateAlreadyRegisteredUsingThisMobileNo(CandidateID, MobileNo);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsCandidateAlreadyRegisteredUsingThisMobileNo", CandidateID.ToString());
                throw ex;
            }
            return retVal;
        }
        public bool IsCandidateAlreadyRegisteredUsingThisEMailID(long CandidateID, string EMailID)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsCandidateAlreadyRegisteredUsingThisEMailID(CandidateID, EMailID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsCandidateAlreadyRegisteredUsingThisEMailID", CandidateID.ToString());
                throw ex;
            }
            return retVal;
        }
        public bool IsStaffAlreadyRegisteredUsingThisEMailID(long StaffID, string EMailID)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsStaffAlreadyRegisteredUsingThisEMailID(StaffID, EMailID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsStaffAlreadyRegisteredUsingThisEMailID", StaffID.ToString());
                throw ex;
            }
            return retVal;
        }
        public bool IsStaffAlreadyRegisteredUsingThisMobileNo(long StaffID, string EMailID)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsStaffAlreadyRegisteredUsingThisMobileNo(StaffID, EMailID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsStaffAlreadyRegisteredUsingThisMobileNo", StaffID.ToString());
                throw ex;
            }
            return retVal;
        }

        public DataTable RegistrationStaff_IsMobileNoDuplicate(string MobileNo)
        {
            try
            {
                return objData.RegistrationStaff_IsMobileNoDuplicate(MobileNo);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RegistrationStaff_IsMobileNoDuplicate", MobileNo.ToString());
                throw ex;
            }
        }
        public string RegisterCandidate(RegistrationEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.RegisterCandidate(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RegisterCandidate", entity.FirstName + " " + entity.MobileNo);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string RegisterStaff(RegistrationEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.RegisterStaff(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RegisterStaff", entity.FirstName + " " + entity.MobileNo);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string RegisterInstitute(InstituteRegistraionEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.RegisterInstitute(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RegisterInstitute", entity.InstituteName + " " + entity.AuthorizedPersonUserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string RegisterComplaint(RegisterComplaintEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.RegisterComplaint(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RegisterComplaint", entity.FirstName + " " + entity.MobileNo);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string RegisterProposedOrganisation(PromotingOrganizationRegistrationEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.RegisterProposedOrganisation(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RegisterProposedOrganisation", entity.NameOfPromotingOrganization + " " + entity.ProfileIDforAuthorizedRepresentative);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string RegisterCandidateStep(RegistrationEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.RegisterCandidateStep(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RegisterCandidate", entity.FirstName + " " + entity.MobileNo);
                retVal = ex.Message;
            }
            return retVal;
        }
        public bool IsInstituteEligibleForApplyWithPromotingOgranisation(Int64 PrmotingOrganisation)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsInstituteEligibleForApplyWithPromotingOgranisation(PrmotingOrganisation);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsInstituteEligibleForApplyWithPromotingOgranisation", PrmotingOrganisation.ToString());
                throw ex;
            }
            return retVal;
        }
    }
}
