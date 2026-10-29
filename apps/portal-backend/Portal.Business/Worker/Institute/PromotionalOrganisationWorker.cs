using Portal.Business.Interface.Institute;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.ExistingInstitute;
using Portal.Entities.Institute;
using Portal.Entities.Registration;
using System.Data;

namespace Portal.Business
{
    public class PromotionalOrganisationWorker : IPromotionalOrganisation
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public PromotionalOrganisationWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }
        public PromotingOrganisationEntity GetPromotionalOrganisationDetails(InstituteInputEntity input)
        {
            PromotingOrganisationEntity obj = new PromotingOrganisationEntity();
            try
            {
                DataTable dt = objData.GetPromotionalOrganisationDetails(input);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.OrganisationID = Convert.ToInt64(dr["Organizationid"]);
                    obj.PromotingOrganisationProfileID = dr["ApplicationId"].ToString();
                    obj.PromotingOrganisationType = Convert.ToInt16(dr["PromotingOrganisationType"]);
                    obj.PromotingOrganisationStatus = Convert.ToInt16(dr["PromotingOrganisationStatus"]);
                    obj.RegistrationDate = Convert.ToDateTime(dr["EstablishmentDate"]);
                    obj.PromotingOrganisationName = Convert.ToString(dr["OrganizatioName"]);
                    obj.RegistrationNumber = Convert.ToString(dr["RegistrationNumber"]);

                    obj.PAddress = Convert.ToString(dr["Address"]);
                    obj.PStateID = Convert.ToInt16(dr["StateId"]);
                    obj.PDistrictID = Convert.ToInt32(dr["DistrictId"]);
                    obj.PTalukaID = Convert.ToInt32(dr["TalukaId"]);
                    obj.PCityID = Convert.ToInt32(dr["CityVillage"]);
                    obj.POtherCity = Convert.ToString(dr["OtherCityVillage"]);
                    obj.PPincode = Convert.ToString(dr["PinCode"]);
                    //obj.IsPPincodeCorrect = Convert.ToInt16(dr["IsPPincodeCorrect"]);
                    obj.MobileNo = Convert.ToString(dr["PhoneNo"]);
                    obj.EMailID = Convert.ToString(dr["EmailId"]);
                    obj.RegistrationCertificatePath = Convert.ToString(dr["RegistrationCertificatePath"]);
                    obj.PANNo = Convert.ToString(dr["PAN"]);
                    obj.PANPath = Convert.ToString(dr["PANPath"]);

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromotionalOrganisationDetails");
                throw ex;
            }
            return obj;
        }
        public string SavePromotionalOrganisationDetails(PromotingOrganisationEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SavePromotionalOrganisationDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SavePromotionalOrganisationDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string SaveInstitute_PromoterStaffMappingDetails(PromotersDetailsEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveInstitute_PromoterStaffMappingDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInstitute_PromoterStaffMappingDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string Delete_PromoterStaffMappingDetails(PromotersDetailsEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.Delete_PromoterStaffMappingDetails(entity);

                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Delete_PromoterStaffMappingDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string SavePromotersDetails(PromotersDetailsEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SavePromotersDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SavePromotersDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public PromotersDetailsEntity GetPromoterDetailsByID(Int64 PromoterID)
        {
            PromotersDetailsEntity obj = new PromotersDetailsEntity();
            try
            {
                DataTable dt = objData.GetPromoterDetailsByID(PromoterID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    obj = FillPromotersDetailsEntity(dr);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromoterDetailsByID");
                throw ex;
            }
            return obj;
        }
        public List<PromotersDetailsEntity> GetPromoterDetailsByInstituteID(InstituteInputEntity input)
        {
            List<PromotersDetailsEntity> obj = new List<PromotersDetailsEntity>();
            try
            {
                DataTable dt = objData.GetPromoterDetailsByInstituteID(input);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj.Add(FillPromotersDetailsEntity(dr));
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromoterDetailsByID");
                throw ex;
            }
            return obj;
        }
        protected PromotersDetailsEntity FillPromotersDetailsEntity(DataRow dr)
        {
            PromotersDetailsEntity obj = new PromotersDetailsEntity();
            obj.PromoterID = Convert.ToInt64(dr["PromoterID"]);
            obj.InstituteID = Convert.ToInt64(dr["InstituteID"]);
            obj.PromoterTypeID = Convert.ToInt16(dr["PromoterTypeID"]);
            obj.PromoterType = Convert.ToString(dr["PromoterType"]);
            //obj.IsPromoterAuthorisedRepresentive = Convert.ToBoolean(dr["IsPromoterAuthorisedRepresentive"]);
            obj.TitleID = Convert.ToInt16(dr["TitleID"]);
            obj.Title = Convert.ToString(dr["Title"]);
            obj.FirstName = Convert.ToString(dr["FirstName"]);
            obj.MiddleName = Convert.ToString(dr["MiddleName"]);
            obj.LastName = Convert.ToString(dr["LastName"]);
            obj.GenderCode = Convert.ToString(dr["GenderCode"]);
            obj.DOB = Convert.ToDateTime(dr["DOB"]);
            obj.FormatDOB = Convert.ToString(dr["FormatDOB"]);
            obj.AadhaarNo = Convert.ToString(dr["AadhaarNo"]);
            obj.Designation = Convert.ToString(dr["Designation"]);
            obj.AltMobileNo = Convert.ToString(dr["AltMobileNo"]);
            obj.MobileNo = Convert.ToString(dr["MobileNo"]);
            obj.EMailID = Convert.ToString(dr["EMailID"]);
            obj.PhoneNo = Convert.ToString(dr["PhoneNo"]);
            obj.AadhaarPath = Convert.ToString(dr["AadhaarPath"]);
            obj.PhotoPath = Convert.ToString(dr["PhotoPath"]);
            obj.StaffProfileId = Convert.ToString(dr["StaffProfileId"]);
            obj.IsEditAllowed = Convert.ToBoolean(dr["IsEditAllowed"]);
            obj.IsDeleteAllowed = Convert.ToBoolean(dr["IsDeleteAllowed"]);
            obj.IsapprovedPromoter = Convert.ToString(dr["IsapprovedPromoter"]);
            obj.StaffId = Convert.ToInt64(dr["StaffId"]);
            obj.RejectRemakr = dr["RejectRemakr"].ToString();
            return obj;

        }

        public InstituteInfoEntity GetProposedInstituteDetails(Int64 InstituteID, string userLoginId)
        {
            InstituteInfoEntity obj = new InstituteInfoEntity();
            try
            {
                DataSet ds = objData.GetProposedInstituteDetails(InstituteID, userLoginId);
                List<OtherRegistrationDetailsEntity> lst = new List<OtherRegistrationDetailsEntity>();
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[0].Rows[0];
                    obj = FillProposedInstituteDetails(dr);
                }
                if (ds != null && ds.Tables[1].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[1].Rows)
                    {
                        OtherRegistrationDetailsEntity entity = new OtherRegistrationDetailsEntity();
                        entity.ParticularID = Convert.ToInt64(dr["ParticularID"].ToString());
                        entity.InstituteID = Convert.ToInt64(dr["InstituteID"].ToString());
                        entity.RegisteredName = dr["RegisteredName"].ToString();
                        entity.InstituteCode = dr["InstituteCode"].ToString();
                       
                        entity.ApprovalDate = Convert.ToDateTime(dr["ApprovalDate"].ToString());
                        entity.ApprovalOrderPath = dr["ApprovalOrderPath"].ToString();
                        lst.Add(entity);
                    }
                }
                obj.lstOtherRegistrationDetailsEntity = lst;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedInstituteDetails");
                throw ex;
            }
            return obj;
        }
        protected InstituteInfoEntity FillProposedInstituteDetails(DataRow dr)
        {
            InstituteInfoEntity obj = new InstituteInfoEntity();
            obj.InstituteID = Convert.ToInt64(dr["InstituteID"]);
            obj.InstituteCode = Convert.ToString(dr["InstituteCode"]);
            obj.InstituteName = Convert.ToString(dr["InstituteName"]);
            obj.InstituteAddress = Convert.ToString(dr["InstituteAddress"]);
            obj.StateID = Convert.ToInt16(dr["StateID"]);
            obj.DistrictID = Convert.ToInt16(dr["DistrictID"]);
            obj.TalukaID = Convert.ToInt32(dr["TalukaID"]);
            if (dr["City"].ToString() == "")
                obj.City = "Other";
            else
                obj.City = Convert.ToString(dr["City"]);
            if (dr["CityID"].ToString() == "0")
                obj.CityID = 9999999;
            else
                obj.CityID = Convert.ToInt32(dr["CityID"]);
            obj.PinCode = Convert.ToString(dr["PinCode"]);
            obj.LocationCategoryID = Convert.ToInt16(dr["LocationCategoryID"]);
            obj.LocationCategory = Convert.ToString(dr["LocationCategory"]);
            obj.STD = Convert.ToString(dr["STD"]);
            obj.PhoneNo = Convert.ToString(dr["PhoneNo"]);
            obj.EMailID = Convert.ToString(dr["EMailID"]);
            obj.WebSite = Convert.ToString(dr["WebSite"]);
            if (dr["EstablishmentDate"].ToString() != "")
                obj.EstablishmentDate = Convert.ToDateTime(dr["EstablishmentDate"]);
            obj.ResolutionPath = Convert.ToString(dr["ResolutionPath"]);
            obj.AuthorizedPersonFirstName = dr["AuthorizedPersonName"].ToString();
            obj.AuthorizedPersonMobileNo1 = dr["AuthorizedPersonMobileNo"].ToString();
            obj.IsActive = Convert.ToBoolean(dr["IsActive"]);
            obj.State = Convert.ToString(dr["State"]);
            obj.District = Convert.ToString(dr["District"]);
            obj.Taluka = Convert.ToString(dr["Taluka"]);

            obj.MSBSVETRegistrationNumber = Convert.ToString(dr["MSBSVETRegistrationNumber"]);
            obj.VTPRegistrationNumber = Convert.ToString(dr["VTPRegistrationNumber"]);
            obj.SmartTCRegistrationNumber = Convert.ToString(dr["SmartTCRegistrationNumber"]);
            obj.SmartTPRegistrationNumber = Convert.ToString(dr["SmartTPRegistrationNumber"]);

            obj.MSBSVETApprovalDate = Convert.ToString(dr["MSBSVETApprovalDate"]);
            obj.VTPApprovalDate = Convert.ToString(dr["VTPApprovalDate"]);
            obj.SmartTCApprovalDate = Convert.ToString(dr["SmartTCApprovalDate"]);
            obj.SmartTPApprovalDate = Convert.ToString(dr["SmartTPApprovalDate"]);

            obj.MSBSVETApprovalLetterPath = Convert.ToString(dr["MSBSVETApprovalLetterPath"]);
            obj.VTPApprovalLetterPath = Convert.ToString(dr["VTPApprovalLetterPath"]);
            obj.SmartTPApprovalLetterPath = Convert.ToString(dr["SmartTPApprovalLetterPath"]);
            obj.SmartTCApprovalLetterPath = Convert.ToString(dr["SmartTCApprovalLetterPath"]);
            obj.IsNewInst = Convert.ToInt16(dr["IsNewInst"]);
            obj.CollegeID = Convert.ToInt64(dr["CollegeID"].ToString());
            obj.CollegeRegistrationNo = Convert.ToString(dr["CollegeRegistrationNo"]);
            obj.Latitude = Convert.ToString(dr["Latitude"]);
            obj.Longitude = Convert.ToString(dr["Longitude"]);

            return obj;
        }

        public string SaveProposedInstituteDetails(InstituteInfoEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveProposedInstituteDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SavePromotersDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        /// <summary>
        /// //////////////////////
        /// </summary>
        /// <param></param>
        /// <returns></returns>
        public PromotingOrganizationRegistrationEntity GetPromotingOrganisationDetails(InstituteInputEntity entity)
        {
            PromotingOrganizationRegistrationEntity obj = new PromotingOrganizationRegistrationEntity();
            try
            {
                DataTable dt = objData.GetPromotingOrganisationDetails(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    obj = FillPromotingOrganisationDetails(dr);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromoterDetailsByID");
                throw ex;
            }
            return obj;


        }

        protected PromotingOrganizationRegistrationEntity FillPromotingOrganisationDetails(DataRow dr)
        {
            //dr["IsMSBSVETPortal"] == null ? Convert.ToInt16(0) : Convert.ToInt16(dr["IsMSBSVETPortal"]);
            PromotingOrganizationRegistrationEntity obj = new PromotingOrganizationRegistrationEntity();
            obj.PromotingOrganisationID = dr["PromotingOrganisationID"] == DBNull.Value ? Convert.ToInt64("0") : Convert.ToInt64(dr["PromotingOrganisationID"]);
            obj.NameOfPromotingOrganization = Convert.ToString(dr["OrganizatioName"]);
            obj.PromotingOrganisationTypeName = dr["PromotingOrganisationTypeName"].ToString();
            obj.PromotingType = dr["PromotingType"].ToString();
            obj.PromoterStatus = dr["PromoterStatus"].ToString();
            obj.OrganizatioRegistrationNumber = Convert.ToString(dr["OrganizatioRegistrationNumber"]);
            obj.PromotingOrganizationStatusID = Convert.ToInt32(dr["PromotingOrganisationStatus"]);
            obj.PromotingOrganizationType = Convert.ToInt32(dr["PromotingOrganisationType"]);
            obj.PromotingOrganizationTypeOther = Convert.ToString(dr["PromotingOrganisationOtherType"]);
            obj.PromotingOrganizationPincode = Convert.ToString(dr["PinCode"]);
            obj.PromotingOrganizationStateID = Convert.ToInt16(dr["StateId"]);
            obj.PromotingOrganizationDistrictID = Convert.ToInt16(dr["DistrictId"]);
            obj.PromotingOrganizationTalukaID = Convert.ToInt32(dr["TalukaId"]);
            obj.PromotingOrganizationCityID = Convert.ToInt32(dr["CityVillage"]);
            obj.PromotingOrganizationState = Convert.ToString(dr["State"]);
            obj.PromotingOrganizationDistrict = Convert.ToString(dr["District"]);
            obj.PromotingOrganizationTaluka = Convert.ToString(dr["Taluka"]);
            obj.PromotingOrganizationCityName = Convert.ToString(dr["OtherCityVillage"]);
            obj.PromotingOrganizationAddress = Convert.ToString(dr["Address"]);
            obj.RegistrationCertificatePath = Convert.ToString(dr["RegistrationCertificatePath"]);
            obj.AuthorizedRepresentativeMobileNo =   dr["PhoneNo"] == DBNull.Value ? string.Empty : dr["PhoneNo"].ToString();
            obj.AuthorizedRepresentativeEMailID = Convert.ToString(dr["EmailId"]);
            obj.PromotingOrganizationRegistrationDate = Convert.ToDateTime(dr["EstablishmentDate"].ToString());
            obj.ProfileIDforAuthorizedRepresentative = Convert.ToString(dr["AuthorizedRepresentativeRegistrationNumber"]);
            obj.PAN = Convert.ToString(dr["PAN"]);
            obj.PANPath = Convert.ToString(dr["PANPath"]);
            obj.ApplicationID = dr["ApplicationId"].ToString();


            obj.IsApprovedOrganizatioName = Convert.ToString(dr["IsApprovedOrganizatioName"]);
            obj.IsApprovedOrganizatioRegistrationNumber = Convert.ToString(dr["IsApprovedOrganizatioRegistrationNumber"]);
            obj.IsApprovedPromotingOrganisationType = Convert.ToString(dr["IsApprovedPromotingOrganisationType"]);

            obj.IsApprovedPromotingOrganisationOtherType = Convert.ToString(dr["IsApprovedPromotingOrganisationOtherType"]);
            obj.IsApprovedPromotingOrganisationStatus = Convert.ToString(dr["IsApprovedPromotingOrganisationStatus"]);
            obj.IsApprovedEstablishmentDate = Convert.ToString(dr["IsApprovedEstablishmentDate"]);
            obj.IsApprovedAddress = Convert.ToString(dr["IsApprovedAddress"]);

            obj.IsApprovedPinCode = Convert.ToString(dr["IsApprovedPinCode"]);
            obj.IsApprovedStateId = Convert.ToString(dr["IsApprovedStateId"]);
            obj.IsApprovedDistrictId = Convert.ToString(dr["IsApprovedDistrictId"]);
            obj.IsApprovedTalukaId = Convert.ToString(dr["IsApprovedTalukaId"]);

            obj.IsApprovedOtherCityVillage = Convert.ToString(dr["IsApprovedOtherCityVillage"]);
            obj.IsApprovedCityVillage = Convert.ToString(dr["IsApprovedCityVillage"]);
            obj.IsApprovedPhoneNo = Convert.ToString(dr["IsApprovedPhoneNo"]);
            obj.IsApprovedEmailId = Convert.ToString(dr["IsApprovedEmailId"]);

            obj.IsApprovedAuthorizedRepresentativeRegistrationNumber = Convert.ToString(dr["IsApprovedAuthorizedRepresentativeRegistrationNumber"]);
            obj.IsApprovedRegistrationCertificatePath = Convert.ToString(dr["IsApprovedRegistrationCertificatePath"]);
            obj.IsApprovedPAN = Convert.ToString(dr["IsApprovedPAN"]);
            obj.IsApprovedPANPath = Convert.ToString(dr["IsApprovedPANPath"]);

            obj.RejectResionOrganizatioName = Convert.ToString(dr["RejectResionOrganizatioName"]);
            obj.RejectResionOrganizatioRegistrationNumber = Convert.ToString(dr["RejectResionOrganizatioRegistrationNumber"]);
            obj.RejectResionPromotingOrganisationType = Convert.ToString(dr["RejectResionPromotingOrganisationType"]);
            obj.RejectResionPromotingOrganisationOtherType = Convert.ToString(dr["RejectResionPromotingOrganisationOtherType"]);

            obj.RejectResionPromotingOrganisationStatus = Convert.ToString(dr["RejectResionPromotingOrganisationStatus"]);
            obj.RejectResionEstablishmentDate = Convert.ToString(dr["RejectResionEstablishmentDate"]);
            obj.RejectResionAddress = Convert.ToString(dr["RejectResionAddress"]);
            obj.RejectResionPinCode = Convert.ToString(dr["RejectResionPinCode"]);

            obj.RejectResionStateId = Convert.ToString(dr["RejectResionStateId"]);
            obj.RejectResionDistrictId = Convert.ToString(dr["RejectResionDistrictId"]);
            obj.RejectResionTalukaId = Convert.ToString(dr["RejectResionTalukaId"]);
            obj.RejectResionOtherCityVillage = Convert.ToString(dr["RejectResionOtherCityVillage"]);
            obj.RejectResionCityVillage = Convert.ToString(dr["RejectResionCityVillage"]);
            obj.RejectResionPhoneNo = Convert.ToString(dr["RejectResionPhoneNo"]);
            obj.RejectResionEmailId = Convert.ToString(dr["RejectResionEmailId"]);
            obj.RejectResionAuthorizedRepresentativeRegistrationNumber = Convert.ToString(dr["RejectResionAuthorizedRepresentativeRegistrationNumber"]);

            obj.RejectResionRegistrationCertificatePath = Convert.ToString(dr["RejectResionRegistrationCertificatePath"]);
            obj.RejectResionPANPath = Convert.ToString(dr["RejectResionPANPath"]);
            obj.RejectResionPAN = Convert.ToString(dr["RejectResionPAN"]);
            return obj;
        }
        public string SaveInstitute_AssociatedInstituteMappingDetails(PromotersDetailsMappingRequest entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveInstitute_AssociatedInstituteMappingDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInstitute_AssociatedInstituteMappingDetails", entity.CreateBy);
                retVal = ex.Message;
            }
            return retVal;
        }
        public List<AssociatedInstituteEntity> GetAssociatedInstituteByPromotingOrganisationID(InstituteInputEntity input)
        {
            List<AssociatedInstituteEntity> obj = new List<AssociatedInstituteEntity>();
            try
            {
                DataTable dt = objData.GetAssociatedInstituteByPromotingOrganisationID(input);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj.Add(FillAssociatedInstituteEntity(dr));
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromoterDetailsByID");
                throw ex;
            }
            return obj;
        }
        protected AssociatedInstituteEntity FillAssociatedInstituteEntity(DataRow dr)
        {
            AssociatedInstituteEntity obj = new AssociatedInstituteEntity();
            obj.AssociatedInstituteID = Convert.ToInt64(dr["AssociatedInstituteID"]);
            obj.InstituteID = Convert.ToInt64(dr["InstituteID"]);
            obj.PromoterTypeID = Convert.ToInt16(dr["PromoterTypeID"]);
            obj.PromoterType = Convert.ToString(dr["PromoterType"]);
            //obj.IsPromoterAuthorisedRepresentive = Convert.ToBoolean(dr["IsPromoterAuthorisedRepresentive"]);
            obj.PromotingOrganisationId = Convert.ToInt64(dr["PromotingOrganisationId"]);
            obj.District = Convert.ToString(dr["CollegeDistrict"]);
            obj.Taluka = Convert.ToString(dr["CollegeTaluka"]);
            obj.CityorVillage = Convert.ToString(dr["CollegeCity"]);
            obj.NameofInstitute = Convert.ToString(dr["NameofInstitute"]);
            obj.InstituteCode = Convert.ToString(dr["InstituteCode"]);
            obj.IsEditAllowed = Convert.ToBoolean(dr["IsEditAllowed"]);
            obj.IsDeleteAllowed = Convert.ToBoolean(dr["IsDeleteAllowed"]);
            obj.Remark = Convert.ToString(dr["Remark"]);
            obj.IsVerified = Convert.ToString(dr["IsVerified"]);
            return obj;

        }
        public string Delete_AssociatedInstituteMappingDetails(long Id, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.Delete_AssociatedInstituteMappingDetails(Id,  UserLoginID,  IPAddress);

                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Delete_AssociatedInstituteMappingDetails", Id.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        public string GetStatusProposedOrganisation(Int64 ProposedOrganisationID)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetStatusProposedOrganisation(ProposedOrganisationID);

                if (retVal.ToUpper() == "X")
                {
                    retVal = "Data has not been Found. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStatusProposedOrganisation", ProposedOrganisationID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        public string UpdateProposedOrganisationStatus(Int64 ProposedOrganisationID, string UserLoginID, string IPAddress, char StatusCode)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateProposedOrganisationStatus(ProposedOrganisationID, UserLoginID, IPAddress, StatusCode);

                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been Found. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateProposedOrganisationStatus", ProposedOrganisationID.ToString() + " : " + StatusCode);
                retVal = ex.Message;
            }
            return retVal;
        }

        public DataTable SearchPromotingOrganization(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID)
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.SearchPromotingOrganization(DistrictID, TalukaID, RegionID, FormStatus, InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchPromotingOrganization");
                throw ex;
            }
            return ds;
        }
        public DataSet GetPromotingOrganizationSearch(Int64 InstituteId, string InstituteCode, char FormStatus)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetPromotingOrganizationSearch(InstituteId, InstituteCode, FormStatus);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromotingOrganizationSearch");
                throw ex;
            }
            return ds;
        }

        public string SavePromotionalOrganisationDetailsVerification(PromotingOrganisationVerificationSave entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SavePromotionalOrganisationDetailsVerification(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SavePromotionalOrganisationDetailsVerification", entity.PromotingOrganisationID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        public string Update_AssociatedInstituteMappingDetails(List<AssociatedInstituteEntity> entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.Update_AssociatedInstituteMappingDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Update_AssociatedInstituteMappingDetails", entity.FirstOrDefault().PromotingOrganisationId.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }

        public string Update_PromoterStaffMappingDetails(List<PromotersDetailsEntity> entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.Update_PromoterStaffMappingDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Update_PromoterStaffMappingDetails ", entity.FirstOrDefault().InstituteID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataSet PromotingOrganizationDashboardRejectStatusCounts(string TableName, Int64 PromotingOrganisationID, char StatusParam)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.PromotingOrganizationDashboardRejectStatusCounts(TableName, PromotingOrganisationID, StatusParam);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "PromotingOrganizationDashboardRejectStatusCounts");
                throw ex;
            }
            return ds;
        }

        public string ConfirmPromotionalOrganisationDetails(Int64 PromotingOrganisationId, string UserLoginID, string IpAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.ConfirmPromotionalOrganisationDetails(PromotingOrganisationId, UserLoginID, IpAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ConfirmPromotionalOrganisationDetails", PromotingOrganisationId.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }

        public Int64 GetPromotingOrganisationIDBYInstituteID(Int64 InstituteID)
        {
            Int64 retVal = 0;
            try
            {
                retVal = objData.GetPromotingOrganisationIDBYInstituteID(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromotingOrganisationIDBYInstituteID", InstituteID.ToString());
            }
            return retVal;
        }


        //Add for the Checking the Duplicate Registration/ Incorporation Number/ GR Number in a 
        //promoting organization registration page.
        public DuplicateCheckResultEntity CheckDuplicatePromotingOrganisation(CheckDuplicatePromotingOrganisationRequestEntity entity)
        {
            DuplicateCheckResultEntity obj = new DuplicateCheckResultEntity();
            try
            {
                string regNo = entity?.OrganizatioRegistrationNumber?.Trim();

                if (string.IsNullOrEmpty(regNo))
                    throw new ArgumentException("Registration number is required.");

                DataTable dt = objData.CheckDuplicatePromotingOrganisation(regNo);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    obj.IsDuplicate = Convert.ToInt32(dr["IsDuplicate"]);
                    obj.Message = dr["Message"]?.ToString();
                }
                else
                {
                    throw new InvalidOperationException("Duplicate check returned no result.");
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckDuplicatePromotingOrganisation");
                throw;
            }
            return obj;
        }
    }
}
