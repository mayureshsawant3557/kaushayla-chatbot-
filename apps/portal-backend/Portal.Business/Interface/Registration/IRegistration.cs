using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;
using Portal.Entities.Registration;

namespace Portal.Business.Interface.Registration
{
    public interface IRegistration
    {
        DataTable Registration_IsMobileNoDuplicate(string MobileNo);

        bool IsCandidateAlreadyRegisteredUsingThisMobileNo(long CandidateID, string MobileNo);
        bool IsCandidateAlreadyRegisteredUsingThisEMailID(long CandidateID, string EMailID);
        bool IsStaffAlreadyRegisteredUsingThisEMailID(long StaffID, string EMailID);
        bool IsStaffAlreadyRegisteredUsingThisMobileNo(long StaffID, string EMailID);
        DataTable RegistrationStaff_IsMobileNoDuplicate(string MobileNo);
        string RegisterStaff(RegistrationEntity entity);
        string RegisterCandidate(RegistrationEntity entity);
        string RegisterCandidateStep(RegistrationEntity entity);

        string RegisterInstitute(InstituteRegistraionEntity entity);
        string RegisterComplaint(RegisterComplaintEntity entity);
        string RegisterProposedOrganisation(PromotingOrganizationRegistrationEntity entity);
        bool IsInstituteEligibleForApplyWithPromotingOgranisation(Int64 PrmotingOrganisation);

    }
}
