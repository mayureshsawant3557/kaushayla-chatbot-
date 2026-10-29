using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Xml.Serialization;
using Portal.Entities;
using Portal.Entities.Registration;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable Registration_IsMobileNoDuplicate(string mobileNo)
        {
            if (string.IsNullOrWhiteSpace(mobileNo) || _dbAccess == null)
                throw new ArgumentNullException(nameof(mobileNo), "Mobile number or database access cannot be null.");

            var param = new Dictionary<string, object> { { "@MobileNo", mobileNo } };
            return _dbAccess.GetDataTable("Registration_IsMobileNoDuplicate", param);
        }

        //public bool IsCandidateAlreadyRegisteredUsingThisMobileNo(long candidateID, string mobileNo)
        //{
        //    if (string.IsNullOrWhiteSpace(mobileNo) || _dbAccess == null)
        //        throw new ArgumentNullException(nameof(mobileNo), "Mobile number or database access cannot be null.");

        //    var param = new Dictionary<string, object>
        //    {
        //        { "@CandidateID", candidateID },
        //        { "@MobileNo", mobileNo }
        //    };

        //    var result = _dbAccess.ExecuteScalar("Registration_IsCandidateAlreadyRegisteredUsingThisMobileNo", param);
        //    return result != null && Convert.ToBoolean(result);
        //}

        public bool IsCandidateAlreadyRegisteredUsingThisEMailID(long candidateID, string emailID)
        {
            if (string.IsNullOrWhiteSpace(emailID) || _dbAccess == null)
                throw new ArgumentNullException(nameof(emailID), "Email ID or database access cannot be null.");

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", candidateID },
                { "@EMailID", emailID }
            };

            var result = _dbAccess.ExecuteScalar("Registration_IsCandidateAlreadyRegisteredUsingThisEMailID", param);
            return result != null && Convert.ToBoolean(result);
        }
        public bool IsStaffAlreadyRegisteredUsingThisMobileNo(Int64 StaffID, string MobileNo)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", StaffID);
            param.Add("@MobileNo", MobileNo);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Registration_IsStaffAlreadyRegisteredUsingThisMobileNo", param));
        }
        public bool IsCandidateAlreadyRegisteredUsingThisMobileNo(Int64 CandidateID, string MobileNo)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CandidateID", CandidateID);
            param.Add("@MobileNo", MobileNo);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Registration_IsCandidateAlreadyRegisteredUsingThisMobileNo", param));
        }
        public bool IsStaffAlreadyRegisteredUsingThisEMailID(Int64 StaffID, string EMailID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", StaffID);
            param.Add("@EMailID", EMailID);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Registration_IsStaffAlreadyRegisteredUsingThisEMailID", param));
        }
        public DataTable RegistrationStaff_IsMobileNoDuplicate(string MobileNo)
        {
            var param = new Dictionary<string, object>();
            param.Add("@MobileNo", MobileNo);

            return _dbAccess.GetDataTable("RegistrationStaff_IsMobileNoDuplicate", param);
        }

        public string RegisterInstitute(InstituteRegistraionEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ApplicationFor", entity.ApplicationFor);
            param.Add("@PromotingOrgType", entity.PromotingOrgType);
            param.Add("@PromotingOrgOthers", entity.PromotingOrgOthers);
            param.Add("@InstituteStatusID", entity.InstituteStatusID);
            param.Add("@InstituteName", entity.InstituteName);
            param.Add("@PromotingOrganisationID", entity.PromotingOrganisationID);
            param.Add("@AuthorizedPersonTitle", entity.AuthorizedPersonTitle);
            param.Add("@AuthorizedPersonFirstName", entity.AuthorizedPersonFirstName);
            param.Add("@AuthorizedPersonMiddleName", entity.AuthorizedPersonMiddleName);
            param.Add("@AuthorizedPersonLastName", entity.AuthorizedPersonLastName);
            param.Add("@AuthorizedPersonGender", entity.AuthorizedPersonGender);
            param.Add("@AuthorizedPersonDOB", entity.AuthorizedPersonDOB);
            param.Add("@AuthorizedPersonAadharNo", entity.AuthorizedPersonAadharNo);
            param.Add("@AuthorizedPersonMobileNo1", entity.AuthorizedPersonMobileNo1);
            param.Add("@AuthorizedPersonMobileNo2", entity.AuthorizedPersonMobileNo2);
            param.Add("@EMailID", entity.EMailID);
            param.Add("@SecurityQuestionID", entity.SecurityQuestionID);
            param.Add("@SecurityQuestionAnswer", entity.SecurityQuestionAnswer);
            param.Add("@StateID", entity.StateID);
            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@TalukaID", entity.TalukaID);
            param.Add("@ddlCity", entity.ddlCity);
            param.Add("@OtherCity", entity.OtherCity);
            param.Add("@AuthorizedPersonUserLoginID", entity.AuthorizedPersonUserLoginID);
            param.Add("@Password", entity.Password);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            param.Add("@AuthorizedPersonForPromotingOrganisationUserLoginID", entity.AuthorizedPersonForPromotingOrganisationEMailID);
            param.Add("@AuthorizedPersonForPromotingOrganisationTitle", entity.AuthorizedPersonForPromotingOrganisationTitle);
            param.Add("@AuthorizedPersonForPromotingOrganisationFirstName", entity.AuthorizedPersonForPromotingOrganisationFirstName);
            param.Add("@AuthorizedPersonForPromotingOrganisationMiddleName", entity.AuthorizedPersonForPromotingOrganisationMiddleName);
            param.Add("@AuthorizedPersonForPromotingOrganisationLastName", entity.AuthorizedPersonForPromotingOrganisationLastName);
            param.Add("@AuthorizedPersonForPromotingOrganisationGender", entity.AuthorizedPersonForPromotingOrganisationGender);
            param.Add("@AuthorizedPersonForPromotingOrganisationDOB", entity.AuthorizedPersonForPromotingOrganisationDOB);
            param.Add("@AuthorizedPersonForPromotingOrganisationAadharNo", entity.AuthorizedPersonForPromotingOrganisationAadharNo);
            param.Add("@AuthorizedPersonForPromotingOrganisationMobileNo1", entity.AuthorizedPersonForPromotingOrganisationMobileNo1);
            param.Add("@AuthorizedPersonForPromotingOrganisationMobileNo2", entity.AuthorizedPersonForPromotingOrganisationMobileNo2);
            param.Add("@AuthorizedPersonForPromotingOrganisationEMailID", entity.AuthorizedPersonForPromotingOrganisationEMailID);


            param.Add("@ExInstStateID", entity.ExInstStateID);
            param.Add("@ExInstDistrictID", entity.ExInstDistrictID);
            param.Add("@ExInstTalukaID", entity.ExInstTalukaID);
            param.Add("@ExInstddlCity", entity.ExInstddlCity);
            param.Add("@ExInstOtherCity", entity.ExInstOtherCity);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@IsExistingInstitute", entity.IsExistingInstitute);
            param.Add("@ExInstPincode", entity.ExInstPincode);
            param.Add("@Skill", entity.Skill);


            return _dbAccess.ExecuteScalar("Registration_RegisterInstitute", param).ToString();
        }
        public string RegisterComplaint(RegisterComplaintEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@IsMSBSVETPortal", entity.IsMSBSVETPortal);
            param.Add("@MSBSVETRegistrationNumber", entity.MSBSVETRegistrationNumber);
            param.Add("@FirstName", entity.FirstName);
            param.Add("@MiddleName", entity.MiddleName);
            param.Add("@LastName", entity.LastName);
            param.Add("@MobileNo", entity.MobileNo);
            param.Add("@AltMobileNo", entity.AltMobileNo);
            param.Add("@EMailID", entity.EMailID);
            param.Add("@Address", entity.Address);
            param.Add("@StateID", entity.StateID);
            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@TalukaID", entity.TalukaID);
            param.Add("@CityID", entity.CityID);
            param.Add("@OtherCity", entity.CityName);
            param.Add("@Pincode", entity.Pincode);

            param.Add("@NameofInstitute", entity.NameofInstitute);
            param.Add("@TypeofInstituteID", entity.TypeofInstituteID);
            param.Add("@OtherTypeofInstitute", entity.TypeofInstituteName);
            param.Add("@NameofPersonwhoownsInstituteFirstName", entity.NameofPersonwhoownsInstituteFirstName);
            param.Add("@NameofPersonwhoownsInstituteMiddleName", entity.NameofPersonwhoownsInstituteMiddleName);
            param.Add("@NameofPersonwhoownsInstituteLastName", entity.NameofPersonwhoownsInstituteLastName);
            param.Add("@NameofPersonwhoownsInstituteMobileNo", entity.NameofPersonwhoownsInstituteMobileNo);
            param.Add("@NameofPersonwhoownsInstituteEMailID", entity.NameofPersonwhoownsInstituteEMailID);
            param.Add("@NameofPersonwhoownsInstituteWebSite", entity.NameofPersonwhoownsInstituteWebSite);
            param.Add("@NameofPersonwhoownsInstituteAddress", entity.NameofPersonwhoownsInstituteAddress);
            param.Add("@NameofPersonwhoownsInstituteStateID", entity.NameofPersonwhoownsInstituteStateID);
            param.Add("@NameofPersonwhoownsInstituteDistrictID", entity.NameofPersonwhoownsInstituteDistrictID);
            param.Add("@NameofPersonwhoownsInstituteTalukaID", entity.NameofPersonwhoownsInstituteTalukaID);
            param.Add("@NameofPersonwhoownsInstituteCityID", entity.NameofPersonwhoownsInstituteCityID);
            param.Add("@NameofPersonwhoownsInstituteOtherCity", entity.NameofPersonwhoownsInstituteCityName);
            param.Add("@NameofPersonwhoownsInstitutePincode", entity.NameofPersonwhoownsInstitutePincode);
            param.Add("@Detailsofthecomplaint", entity.Detailsofthecomplaint);
            param.Add("@Place", entity.Place);
            //param.Add("@DocumentList", GetXML(entity.lstRegisterComplaintDocument));
            param.Add("@DocumentList", GetXML(entity.lstRegisterComplaintDocument ?? new List<RegisterComplaintDocumentEntity>()));




            param.Add("@SecurityQuestionID", entity.SecurityQuestionID);
            param.Add("@SecurityQuestionAnswer", entity.SecurityQuestionAnswer);
            param.Add("@Password", entity.Password);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@IsAdmissionDataFetch", entity.IsAdmissionDataFetch);


            return _dbAccess.ExecuteScalar("Registration_RegisterComplaint", param).ToString();
        }

        public string RegisterCandidate(RegistrationEntity entity)
        {
            if (entity == null || _dbAccess == null)
                throw new ArgumentNullException(nameof(entity), "Registration entity or database access cannot be null.");

            var param = new Dictionary<string, object>
            {
                { "@ITIRegistrationNo", entity.ITIRegistrationNo ?? string.Empty },
                { "@FirstName", entity.FirstName ?? string.Empty },
                { "@MiddleName", entity.MiddleName ?? string.Empty },
                { "@LastName", entity.LastName ?? string.Empty },
                { "@GenderCode", entity.GenderCode },
                { "@DOB", entity.DOB },
                { "@MobileNo", entity.MobileNo ?? string.Empty },
                { "@AltMobileNo", entity.AltMobileNo ?? string.Empty },
                { "@EMailID", entity.EMailID ?? string.Empty },
                { "@SecurityQuestionID", entity.SecurityQuestionID },
                { "@SecurityQuestionAnswer", entity.SecurityQuestionAnswer ?? string.Empty },
                { "@Password", entity.Password ?? string.Empty },
                { "@UserLoginID", entity.UserLoginID ?? string.Empty },
                { "@IPAddress", entity.IPAddress ?? string.Empty },
                { "@PageCode", entity.PageCode ?? string.Empty },
                { "@IsAdmissionDataFetch", entity.IsAdmissionDataFetch }
            };

            var result = _dbAccess.ExecuteScalar("Registration_RegisterCandidate", param);
            return result?.ToString() ?? string.Empty;
        }

        public string RegisterStaff(RegistrationEntity entity)
        {
            var param = new Dictionary<string, object>();
            string jobRole = "";

            var serializer = new XmlSerializer(typeof(List<JobRole>), new XmlRootAttribute("root"));
            using (var stream = new StringWriter())
            {
                serializer.Serialize(stream, entity.ListJobRole);
                jobRole = stream.ToString();
            }
            param.Add("@FirstName", entity.FirstName);
            param.Add("@MiddleName", entity.MiddleName);
            param.Add("@LastName", entity.LastName);
            param.Add("@GenderCode", entity.GenderCode);
            param.Add("@DOB", entity.DOB);
            param.Add("@MobileNo", entity.MobileNo);
            param.Add("@AltMobileNo", entity.AltMobileNo);
            param.Add("@EMailID", entity.EMailID);
            param.Add("@SecurityQuestionID", entity.SecurityQuestionID);
            param.Add("@SecurityQuestionAnswer", entity.SecurityQuestionAnswer);
            param.Add("@Password", entity.Password);
            param.Add("@JobRole", jobRole);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@AadhaarNo", entity.AadhaarNo);
            param.Add("@AadhaarFilePath", entity.AadhaarFilePath);
            param.Add("@DOBFilePath", entity.DOBFilePath);
            param.Add("@PhotoFilePath", entity.PhotoFilePath);
            param.Add("@SignFilePath", entity.SignFilePath);
            param.Add("@IsAddhareVerify", entity.IsAddhareVerify);
            return _dbAccess.ExecuteScalar("Registration_RegisterStaff", param).ToString();
        }
          public string RegisterProposedOrganisation(PromotingOrganizationRegistrationEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ApplicationFor", entity.PromotingOrganizationRegistrationFor);
            param.Add("@PromotingOrgType", entity.PromotingOrganizationType);
            param.Add("@PromotingOrgOthers", entity.PromotingOrganizationTypeOther);
            param.Add("@InstituteStatusID", entity.PromotingOrganizationStatusID);
            param.Add("@InstituteName", entity.NameOfPromotingOrganization);
            param.Add("@EstablishmentDate", entity.PromotingOrganizationRegistrationDate);
            param.Add("@AuthorizedPersonTitle", entity.AuthorizedRepresentativeTitle);
            param.Add("@AuthorizedPersonFirstName", entity.AuthorizedRepresentativeFirstName);
            param.Add("@AuthorizedPersonMiddleName", entity.AuthorizedRepresentativeMiddleName);
            param.Add("@AuthorizedPersonLastName", entity.AuthorizedRepresentativeLastName);
            param.Add("@AuthorizedPersonGender", entity.AuthorizedRepresentativeGenderCode);
            param.Add("@AuthorizedPersonDOB", entity.AuthorizedRepresentativeDOB);
            param.Add("@AuthorizedPersonAadharNo", entity.AuthorizedRepresentativeAadharNo);
            param.Add("@AuthorizedPersonMobileNo1", entity.AuthorizedRepresentativeMobileNo);
            param.Add("@AuthorizedPersonMobileNo2", entity.AuthorizedRepresentativeAltMobileNo);
            param.Add("@EMailID", entity.AuthorizedRepresentativeEMailID);
            param.Add("@SecurityQuestionID", entity.AuthorizedRepresentativeSecurityQuestionID);
            param.Add("@SecurityQuestionAnswer", entity.AuthorizedRepresentativeSecurityQuestionAnswer);
            param.Add("@Address", entity.PromotingOrganizationAddress);
            param.Add("@PinCode", entity.PromotingOrganizationPincode);
            param.Add("@StateID", entity.PromotingOrganizationStateID);
            param.Add("@DistrictID", entity.PromotingOrganizationDistrictID);
            param.Add("@TalukaID", entity.PromotingOrganizationTalukaID);
            param.Add("@ddlCity", entity.PromotingOrganizationCityID);
            param.Add("@OtherCity", entity.PromotingOrganizationCityName);
            param.Add("@AuthorizedPersonUserLoginID", entity.ProfileIDforAuthorizedRepresentative);
            param.Add("@Password", entity.AuthorizedRepresentativePassword);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@OrganizatioRegistrationNumber", entity.OrganizatioRegistrationNumber);

            return _dbAccess.ExecuteScalar("Registration_ProposedOrganisationRegistraion", param).ToString();
        }

        public string RegisterCandidateStep(RegistrationEntity entity)
        {
            if (entity == null || _dbAccess == null)
                throw new ArgumentNullException(nameof(entity), "Registration entity or database access cannot be null.");

            var param = new Dictionary<string, object>
            {
                { "@ITIRegistrationNo", entity.ITIRegistrationNo ?? string.Empty },
                { "@FirstName", entity.FirstName ?? string.Empty },
                { "@MiddleName", entity.MiddleName ?? string.Empty },
                { "@LastName", entity.LastName ?? string.Empty },
                { "@GenderCode", entity.GenderCode },
                { "@DOB", entity.DOB },
                { "@MobileNo", entity.MobileNo ?? string.Empty },
                { "@AltMobileNo", entity.AltMobileNo ?? string.Empty },
                { "@EMailID", entity.EMailID ?? string.Empty },
                { "@SecurityQuestionID", entity.SecurityQuestionID },
                { "@SecurityQuestionAnswer", entity.SecurityQuestionAnswer ?? string.Empty },
                { "@Password", entity.Password ?? string.Empty },
                { "@UserLoginID", entity.UserLoginID ?? string.Empty },
                { "@IPAddress", entity.IPAddress ?? string.Empty },
                { "@PageCode", entity.PageCode ?? string.Empty },
                { "@IsAdmissionDataFetch", entity.IsAdmissionDataFetch },
                { "@PhotoFilePath", entity.PhotoFilePath ?? (object)DBNull.Value },
                { "@AadhaarNo", entity.AadhaarNo ?? (object)DBNull.Value },
                { "@AadhaarFilePath", entity.AadhaarFilePath ?? (object)DBNull.Value }
            };

            var result = _dbAccess.ExecuteScalar("Registration_RegisterCandidateStep", param);
            return result?.ToString() ?? string.Empty;
        }
        public bool IsInstituteEligibleForApplyWithPromotingOgranisation(Int64 PrmotingOrganisation)
        {
            var param = new Dictionary<string, object>();

            param.Add("@PromotingOrganisationID", PrmotingOrganisation);
            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Registration_IsInstituteEligibleForApplyWithPromotingOgranisation", param));
        }
    }
}
