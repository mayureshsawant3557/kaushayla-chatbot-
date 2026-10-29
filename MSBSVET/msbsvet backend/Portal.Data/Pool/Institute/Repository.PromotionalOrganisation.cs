using Portal.Entities;
using Portal.Entities.Institute;
using Portal.Entities.Registration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetPromotionalOrganisationDetails(InstituteInputEntity entity)
        {

            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            //return _dbAccess.GetDataTable("Institute_GetPromotingOrganizationDetailsByOrganisationID", param);

            return _dbAccess.GetDataTable("Institute_GetPromotingOrganizationDetails", param);

        }

        public DataTable GetPromotingOrganisationDetails(InstituteInputEntity entity)
        {

            var param = new Dictionary<string, object>();
            param.Add("@PromotingOrganisationID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            //return _dbAccess.GetDataTable("Institute_GetPromotingOrganizationDetailsByOrganisationID", param);

            return _dbAccess.GetDataTable("Institute_GetPromotingOrganisationDetails", param);

        }

        public string SavePromotionalOrganisationDetails(PromotingOrganisationEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@OrganisationID", entity.OrganisationID);
            param.Add("@OrganizatioName", entity.PromotingOrganisationName);
            param.Add("@EstablishmentDate", entity.RegistrationDate);
            param.Add("@RegistrationNumber", entity.RegistrationNumber);
            param.Add("@PromotingOrganisationStatus", entity.PromotingOrganisationStatus);
            param.Add("@PromotingOrganisationType", entity.PromotingOrganisationType);
            param.Add("@PromotingOrganisationOtherType", entity.OtherPromotingOrganisationType);
            param.Add("@Address", entity.PAddress);
            param.Add("@PinCode", entity.PPincode);
            param.Add("@StateId", entity.PStateID);
            param.Add("@DistrictId", entity.PDistrictID);
            param.Add("@TalukaId", entity.PTalukaID);
            param.Add("@OtherCityVillage", entity.POtherCity);
            param.Add("@CityVillage", entity.PCityID);
            param.Add("@PhoneNo", entity.MobileNo);
            param.Add("@EmailId", entity.EMailID);
            param.Add("@RegistrationCertificatePath", entity.RegistrationCertificatePath);
            param.Add("@PAN", entity.PANNo);
            param.Add("@PANPath", entity.PANPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            //param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Institute_SavePromotingOrganizationDetails", param).ToString();
        }
        public string SaveInstitute_PromoterStaffMappingDetails(PromotersDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@PromoterID", entity.PromoterID);
            param.Add("@StaffProfileId", entity.StaffProfileId);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@PromoterTypeID", entity.PromoterTypeID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveInstitute_PromoterStaffMappingDetails", param).ToString();

        }

        public string Delete_PromoterStaffMappingDetails(PromotersDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@PromoterID", entity.PromoterID);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@PromoterTypeID", entity.PromoterTypeID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Institute_Delete_PromoterStaffMappingDetails", param).ToString();

        }
        public string SavePromotersDetails(PromotersDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@PromoterID", entity.PromoterID);

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@PromoterTypeID", entity.PromoterTypeID);
            //param.Add("@IsPromoterAuthorisedRepresentive", entity.IsPromoterAuthorisedRepresentive);
            param.Add("@TitleID", entity.TitleID);
            param.Add("@FirstName", entity.FirstName);

            param.Add("@MiddleName", entity.MiddleName);
            param.Add("@LastName", entity.LastName);
            param.Add("@GenderCode", entity.GenderCode);
            param.Add("@DOB", entity.DOB);
            param.Add("@AadhaarNo", entity.AadhaarNo);
            param.Add("@Designation", entity.Designation);
            param.Add("@MobileNo", entity.MobileNo);

            param.Add("@AltMobileNo", entity.AltMobileNo);
            param.Add("@EmailId", entity.EMailID);
            param.Add("@PhoneNo", entity.PhoneNo == null ? "0" : entity.PhoneNo);
            param.Add("@AadhaarPath", entity.AadhaarPath);
            param.Add("@PhotoPath", entity.PhotoPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            //param.Add("@PageCode", entity.PageCode);
            return _dbAccess.ExecuteScalar("Institute_SaveInstitute_PromoterDetails", param).ToString();
        }
        public DataTable GetPromoterDetailsByID(Int64 PromoterID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@PromoterID", PromoterID);
            return _dbAccess.GetDataTable("Institute_GetInstitute_PromoterDetailsByID", param);
        }
        //public DataTable GetPromoterDetailsByInstituteID(InstituteInputEntity entity)
        //{
        //    var param = new Dictionary<string, object>();

        //    param.Add("@InstituteID", entity.InstituteId);
        //    param.Add("@UserLoginId", entity.UserLoginID);
        //    param.Add("@PageCode", entity.PageCode);

        //    return _dbAccess.GetDataTable("Institute_GetCoursesWiseRequirementDetails", param);
        //}
        public DataTable GetPromoterDetailsByInstituteID(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Institute_GetInstitute_PromoterDetailsByInstituteID", param);
        }

        public DataSet GetProposedInstituteDetails(Int64 InstituteID, string userloginId)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@userloginId", userloginId);

            return _dbAccess.GetDataSet("Institute_GetProposedInstituteDetails", param);
        }

        //public string SaveProposedInstituteDetails(InstituteInfoEntity entity)
        //{
        //    var param = new Dictionary<string, object>();

        //    param.Add("@InstituteID", entity.InstituteID);
        //    param.Add("@InstituteCode", entity.InstituteCode);
        //    param.Add("@InstituteName", entity.InstituteName);
        //    param.Add("@InstituteAddress", entity.InstituteAddress);
        //    param.Add("@StateID", entity.StateID);

        //    param.Add("@DistrictID", entity.DistrictID);
        //    param.Add("@TalukaID", entity.TalukaID);
        //    param.Add("@CityID", entity.CityID);
        //    param.Add("@City", entity.OtherCity);
        //    param.Add("@PinCode", entity.PinCode);
        //    param.Add("@LocationCategoryID", entity.LocationCategoryID);
        //    param.Add("@PhoneNo", entity.PhoneNo);
        //    param.Add("@FaxNo", entity.FaxNo);
        //    param.Add("@EMailID", entity.EMailID);
        //    param.Add("@WebSite", entity.WebSite);
        //    param.Add("@EstablishmentDate", entity.EstablishmentDate);
        //    param.Add("@ResolutionPath", entity.ResolutionPath);
        //    param.Add("@InstituteStatusID", entity.InstituteStatusID);
        //    param.Add("@PromotingOrgTypeID", entity.PromotingOrgTypeID);
        //    param.Add("@PrevInstituteCode", entity.PrevInstituteCode);
        //    param.Add("@UserLoginID", entity.UserLoginID);
        //    param.Add("@IPAddress", entity.IPAddress);
        //    //param.Add("@PageCode", entity.PageCode);

        //    return _dbAccess.ExecuteScalar("Institute_SaveProposedInstituteDetails", param).ToString();

        //}
        public string SaveProposedInstituteDetails(InstituteInfoEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteID);
            //param.Add("@InstituteCode", entity.InstituteCode);
            param.Add("@InstituteName", entity.InstituteName);
            param.Add("@InstituteAddress", entity.InstituteAddress);
            param.Add("@StateID", entity.StateID);

            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@TalukaID", entity.TalukaID);
            param.Add("@CityID", entity.CityID);
            param.Add("@OtherCity", entity.OtherCity == null ? "" : entity.OtherCity);
            param.Add("@PinCode", entity.PinCode);
            param.Add("@LocationCategoryID", entity.LocationCategoryID);
            param.Add("@PhoneNo", entity.PhoneNo);
            param.Add("@STD", entity.STD);
            param.Add("@EMailID", entity.EMailID);
            param.Add("@WebSite", entity.WebSite == null ? "" : entity.WebSite);
            //param.Add("@EstablishmentDate", entity.EstablishmentDate);
            param.Add("@ResolutionPath", entity.ResolutionPath);
            //param.Add("@InstituteStatusID", entity.InstituteStatusID);
            //param.Add("@PromotingOrgTypeID", entity.PromotingOrgTypeID);
            //param.Add("@PrevInstituteCode", entity.PrevInstituteCode);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@OtherRegistrationDetailsXML", GetXML(entity.lstOtherRegistrationDetailsEntity));
            param.Add("@IsInstNew", entity.IsNewInst);
            param.Add("@Latitude", entity.Latitude);
            param.Add("@Longitude", entity.Longitude);

            return _dbAccess.ExecuteScalar("Institute_SaveProposedInstituteDetails", param).ToString();

        }

       
        public string SaveInstitute_AssociatedInstituteMappingDetails(PromotersDetailsMappingRequest entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@PromotingOrganisationId", entity.InstituteID);
            param.Add("@InstituteCode", entity.StaffID);
            //param.Add("@InstituteID", entity.InstituteID);
            param.Add("@PromoterTypeID", entity.ManagementType);
            param.Add("@UserLoginID", entity.CreateBy);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveInstitute_AssociatedInstituteMappingDetails", param).ToString();

        }
        public DataTable GetAssociatedInstituteByPromotingOrganisationID(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Institute_GetInstitute_AssociatedInstituteByOrganisationID", param);
        }
        public string Delete_AssociatedInstituteMappingDetails(long Id, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@AssociatedInstituteID", Id);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);


            return _dbAccess.ExecuteScalar("Institute_Delete_AssociatedInstituteMappingDetails", param).ToString();

        }


        public string GetStatusProposedOrganisation(Int64 ProposedOrganisationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ProposedOrganisationID", ProposedOrganisationID);
            return _dbAccess.ExecuteScalar("ProposedOrganisation_GetStatusProposedOrganisation", param).ToString();
        }
        public string UpdateProposedOrganisationStatus(Int64 ProposedOrganisationID, string UserLoginID, string IPAddress, char StatusCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ProposedOrganisationID", ProposedOrganisationID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);
            param.Add("@Status", StatusCode);
            return _dbAccess.ExecuteScalar("ProposedOrganisation_UpdateProposedOrganisationStatus", param).ToString();
        }

        public DataTable SearchPromotingOrganization(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@RegionID", RegionID);
            param.Add("@FormStatus", FormStatus);
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("PromotingOrganization_SearchPromotingOrganization", param);
        }
        public DataSet GetPromotingOrganizationSearch(Int64 InstituteId, string InstituteCode, char FormStatus)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", InstituteId);
            param.Add("@InstituteCode", InstituteCode);
            param.Add("@FormStatus", FormStatus);

            return _dbAccess.GetDataSet("PromotingOrganization_PromotingOrganizationSearch", param);
        }
        public string SavePromotionalOrganisationDetailsVerification(PromotingOrganisationVerificationSave entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.PromotingOrganisationID);
            param.Add("@OrganisationID", entity.PromotingOrganisationID);
            param.Add("@OrganizatioName", entity.NameOfPromotingOrganization);
            param.Add("@EstablishmentDate", entity.PromotingOrganizationRegistrationDate);
            param.Add("@RegistrationNumber", entity.OrganizatioRegistrationNumber);
            param.Add("@PromotingOrganisationStatus", entity.PromoterStatus);
            param.Add("@PromotingOrganisationType", entity.PromotingOrganizationType);
            param.Add("@PromotingOrganisationOtherType", entity.PromotingOrganizationTypeOther);
            param.Add("@Address", entity.PromotingOrganizationAddress);
            param.Add("@PinCode", entity.PromotingOrganizationPincode);
            param.Add("@StateId", entity.PromotingOrganizationStateID);
            param.Add("@DistrictId", entity.PromotingOrganizationDistrictID);
            param.Add("@TalukaId", entity.PromotingOrganizationTalukaID);
            param.Add("@OtherCityVillage", entity.PromotingOrganizationCityName);
            param.Add("@CityVillage", entity.PromotingOrganizationCityID);
            param.Add("@PhoneNo", entity.PromotingOrganizationPhoneNumber);
            param.Add("@EmailId", entity.AuthorizedRepresentativeEMailID);
            param.Add("@RegistrationCertificatePath", entity.RegistrationCertificatePath);
            param.Add("@PAN", entity.PAN);
            param.Add("@PANPath", entity.PANPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            //param.Add("@PageCode", entity.PageCode);
            param.Add("@IsApprovedOrganizatioName", entity.IsApprovedOrganizatioName);
            param.Add("@IsApprovedPromotingOrganisationOtherType", entity.IsApprovedPromotingOrganisationOtherType);
            param.Add("@IsApprovedPromotingOrganisationStatus", entity.IsApprovedPromotingOrganisationStatus);
            param.Add("@IsApprovedOrganizatioRegistrationNumber", entity.IsApprovedOrganizatioRegistrationNumber);
            param.Add("@IsApprovedAuthorizedRepresentativeRegistrationNumber", entity.IsApprovedAuthorizedRepresentativeRegistrationNumber);
            param.Add("@IsApprovedRegistrationCertificatePath", entity.IsApprovedRegistrationCertificatePath);
            param.Add("@IsApprovedAddress", entity.IsApprovedAddress);
            param.Add("@IsApprovedPinCode", entity.IsApprovedPinCode);
            param.Add("@IsApprovedStateId", entity.IsApprovedStateId);
            param.Add("@IsApprovedTalukaId", entity.IsApprovedTalukaId);
            param.Add("@IsApprovedDistrictId", entity.IsApprovedDistrictId);
            param.Add("@IsApprovedCityVillage", entity.IsApprovedCityVillage);
            param.Add("@IsApprovedOtherCityVillage", entity.IsApprovedOtherCityVillage);
            param.Add("@IsApprovedPAN", entity.IsApprovedPAN);
            param.Add("@IsApprovedPANPath", entity.IsApprovedPANPath);

            param.Add("@RejectResionPromotingOrganisationType", entity.RejectResionPromotingOrganisationType);
            param.Add("@RejectResionPromotingOrganisationOtherType", entity.RejectResionPromotingOrganisationOtherType);
            param.Add("@RejectResionPromotingOrganisationStatus", entity.RejectResionPromotingOrganisationStatus);
            param.Add("@RejectResionOrganizatioName", entity.RejectResionOrganizatioName);
            param.Add("@RejectResionAddress", entity.RejectResionAddress);
            param.Add("@RejectResionPinCode", entity.RejectResionPinCode);
            param.Add("@RejectResionStateId", entity.RejectResionStateId);
            param.Add("@RejectResionDistrictId", entity.RejectResionDistrictId);
            param.Add("@RejectResionTalukaId", entity.RejectResionTalukaId);
            param.Add("@RejectResionOtherCityVillage", entity.RejectResionOtherCityVillage);
            param.Add("@RejectResionCityVillage", entity.RejectResionCityVillage);
            param.Add("@RejectResionRegistrationCertificatePath", entity.RejectResionRegistrationCertificatePath);
            param.Add("@RejectResionPAN", entity.RejectResionPAN);
            param.Add("@RejectResionPANPath", entity.RejectResionPANPath);
            param.Add("@IsApprovedPromotingOrganisationType", entity.IsApprovedPromotingOrganisationType);
            param.Add("@IsApprovedEstablishmentDate", entity.IsApprovedEstablishmentDate);
            param.Add("@RejectResionEstablishmentDate", entity.RejectResionEstablishmentDate);
            param.Add("@RejectResionOrganizatioRegistrationNumber", entity.RejectResionOrganizatioRegistrationNumber);

            return _dbAccess.ExecuteScalar("PromotionalOrganisation_PromotionalOrganisationDetailsVerification", param).ToString();
        }

        public string Update_AssociatedInstituteMappingDetails(List<AssociatedInstituteEntity> entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@AssociatedInstituteMappingXML", GetXML(entity));
            param.Add("@UserLoginID", entity.FirstOrDefault().UserLoginID);
            param.Add("@IpAddress", entity.FirstOrDefault().IPAddress);
            return _dbAccess.ExecuteScalar("Institute_Update_AssociatedInstituteMappingDetails", param).ToString();
        }

        public string Update_PromoterStaffMappingDetails(List<PromotersDetailsEntity> entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@PromoterStaffMappingXML", GetXML(entity));
            param.Add("@UserLoginID", entity.FirstOrDefault().UserLoginID);
            param.Add("@IpAddress", entity.FirstOrDefault().IPAddress);
            return _dbAccess.ExecuteScalar("Institute_Update_PromoterStaffMappingDetails", param).ToString();
        }

        public DataSet PromotingOrganizationDashboardRejectStatusCounts(string TableName, Int64 PromotingOrganisationID, char StatusParam)
        {
            var param = new Dictionary<string, object>();

            param.Add("@TableName", TableName);
            param.Add("@PromotingOrganisationID", PromotingOrganisationID);
            param.Add("@StatusParam", StatusParam);

            return _dbAccess.GetDataSet("PromotingOrganization_RejectStatusCounts", param);
        }
        public string ConfirmPromotionalOrganisationDetails(Int64 PromotingOrganisationId, string UserLoginID, string IpAddress)
        {
            var param = new Dictionary<string, object>();
            param.Add("@PromotingOrganisationId", PromotingOrganisationId);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IpAddress", IpAddress);
            return _dbAccess.ExecuteScalar("Institute_ConfirmPromotionalOrganisationDetails", param).ToString();
        }
        public Int64 GetPromotingOrganisationIDBYInstituteID(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return Convert.ToInt64(_dbAccess.ExecuteScalar("PromotingOrganisation_GetPromotingOrganisationIDBYInstituteID", param).ToString());

        }

        //Add for the Checking the Duplicate Registration/ Incorporation Number/ GR Number in a 
        //promoting organization registration page.

        public DataTable CheckDuplicatePromotingOrganisation(string organizatioRegistrationNumber)
        {
            var param = new Dictionary<string, object>();
            param.Add("@OrganizatioRegistrationNumber", organizatioRegistrationNumber);

            return _dbAccess.GetDataTable("ISOrganizationRegistrationNumberDuplicate", param);
        }
    }
}
