
using Portal.Business.Interface.ExistingInstitute;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities;
using Portal.Entities.ExistingInstitute;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Xml;
using System.Xml.Serialization;
using static iTextSharp.text.pdf.events.IndexEvents;



namespace Portal.Business
{
    public class ExistingInstituteWorker : IExistingInstitute
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public ExistingInstituteWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }
        public PromotingOrganisationEntity GetPromotionalOrganisationDetails(InstituteInputEntity input)
        {
            PromotingOrganisationEntity obj = new PromotingOrganisationEntity();
            try
            {
                DataTable dt = objData.GetPromotionalOrganisationDetails_ExistingInstitute(input);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.OrganisationID = Convert.ToInt64(dr["Organizationid"]);
                    obj.InstituteID = Convert.ToInt64(dr["Organizationid"]);
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
                    obj.IsVerify = Convert.ToString(dr["IsVerify"]);

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
                retVal = objData.SavePromotionalOrganisationDetails_ExistingInstitute(entity);
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
                retVal = objData.SaveInstitute_PromoterStaffMappingDetails_ExistingInstitute(entity);
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
                retVal = objData.Delete_PromoterStaffMappingDetails_ExistingInstitute(entity);

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
                retVal = objData.SavePromotersDetails_ExistingInstitute(entity);
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
                DataTable dt = objData.GetPromoterDetailsByID_ExistingInstitute(PromoterID);

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
                DataTable dt = objData.GetPromoterDetailsByInstituteID_ExistingInstitute(input);

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
            return obj;

        }

        public InstituteInfoEntity GetProposedInstituteDetails(Int64 InstituteID, string userLoginId)
        {
            InstituteInfoEntity obj = new InstituteInfoEntity();
            try
            {
                DataSet ds = objData.GetProposedInstituteDetails_ExistingInstitute(InstituteID, userLoginId);

                if (ds != null && ds.Tables.Count > 1)
                {
                    DataRow dr1 = ds.Tables[0].Rows[0];
                    obj = FillProposedInstituteDetails(dr1);
                    foreach (DataRow dr in ds.Tables[1].Rows)
                    {
                        OtherRegistrationDetailsEntity other = new OtherRegistrationDetailsEntity();
                        other.ID = Convert.ToInt64(dr["ID"]);
                        other.InstituteID = Convert.ToInt64(dr["InstituteID"]);
                        other.ParticularID = Convert.ToInt64(dr["ParticularID"]);
                        other.RegisteredName = dr["RegisteredName"].ToString();
                        other.InstituteCode = dr["InstituteCode"].ToString();
                        other.ApprovalOrderPath = dr["ApprovalOrderPath"].ToString();
                        other.Particular = dr["Particular"].ToString();
                        other.ApprovalDate = Convert.ToDateTime(dr["ApprovalDate"]);
                        obj.lstOtherRegistrationDetailsEntity.Add(other);
                    }
                }
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
            obj.City = Convert.ToString(dr["City"]);
            obj.CityID = Convert.ToInt32(dr["CityID"]);
            obj.PinCode = Convert.ToString(dr["PinCode"]);
            obj.LocationCategoryID = Convert.ToInt16(dr["LocationCategoryID"]);
            obj.LocationCategory = Convert.ToString(dr["LocationCategory"]);
            obj.STD = Convert.ToString(dr["STD"]);
            obj.PhoneNo = Convert.ToString(dr["PhoneNo"]);
            obj.EMailID = Convert.ToString(dr["EMailID"]);
            obj.WebSite = Convert.ToString(dr["WebSite"]);
            obj.EstablishmentDate = dr["EstablishmentDate"] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(dr["EstablishmentDate"]);
            obj.ResolutionPath = Convert.ToString(dr["ResolutionPath"]);

            obj.IsActive = Convert.ToBoolean(dr["IsActive"]);
            obj.State = Convert.ToString(dr["State"]);
            obj.District = Convert.ToString(dr["District"]);
            obj.Taluka = Convert.ToString(dr["Taluka"]);
            obj.OtherCity = dr["OtherCity"] != DBNull.Value ? dr["OtherCity"].ToString() : null;


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

            obj.Latitude = Convert.ToString(dr["Latitude"]);
            obj.Longitude = Convert.ToString(dr["Longitude"]);
            obj.InstituteProfileVerificationRemark = Convert.ToString(dr["InstituteProfileVerificationRemark"]);
            obj.FormStatus = Convert.ToString(dr["FormStatus"]);

            return obj;
        }

        public string SaveProposedInstituteDetails(ProposedInstituteInfoEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveProposedInstituteDetails_ExistingInstitute(entity);
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

        public DataSet GetInstituteHeaderDashboard(Int64 InstituteId, string InstituteCode)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetInstituteHeaderDashboard(InstituteId, InstituteCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromoterDetailsByID");
                throw ex;
            }
            return ds;
        }

        //Proposed Course of new INstitute

        public List<ProposedCourseUnitDetailsEntity> GetProposedCourseUnitRequirementDetails(Int64 InstituteID, Int64 CourseId, string UserLoginID)
        {
            DataSet ds = null;
            List<ProposedCourseUnitDetailsEntity> lst = new List<ProposedCourseUnitDetailsEntity>();
            ProposedCourseUnitDetailsEntity obj = null;
            try
            {
                ds = objData.GetProposedCourseUnitRequirementDetails_ExistingInstitute(InstituteID, CourseId, UserLoginID);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        obj = new ProposedCourseUnitDetailsEntity();
                        obj.RequiredItems = dr["RequiredItems"].ToString();
                        obj.PerUnitNorms = dr["PerUnitNorms"].ToString();
                        obj.RequiredForApprovedUnits = Convert.ToString(dr["ApprovedUnits"]);
                        obj.RequiredForProposedUnits = Convert.ToString(dr["ProposedUnits"]);
                        obj.RequiredForTotalUnits = Convert.ToString(dr["TotalUnits"]);

                        lst.Add(obj);
                    }
                }

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseUnitRequirementDetails", InstituteID.ToString());

            }
            return lst;
        }


        public DataSet GetProposedCourseUnitDetails(InstituteInputEntity entity)
        {
            try
            {
                return objData.GetProposedCourseUnitDetails_ExistingInstitute(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseUnitDetails", entity.InstituteId.ToString());
                throw;
            }
        }
        public DataSet Institute_GetCourseUnitDetailsForNationalTrade(InstituteInputEntity entity)
        {
            try
            {
                return objData.Institute_GetCourseUnitDetailsForNationalTrade(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseUnitDetails", entity.InstituteId.ToString());
                throw;
            }
        }
        
            public DataSet Institute_GetCoursesWiseRequirementDetails(InstituteInputEntity entity)
        {
            try
            {
                return objData.Institute_GetCoursesWiseRequirementDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseUnitDetails", entity.InstituteId.ToString());
                throw;
            }
        }
        public string SaveProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.SaveProposedCourseUnitDetails_ExistingInstitute(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveProposedCourseUnitDetails");
                throw ex;
            }
            return returnval;
        }

        public string DeleteProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.DeleteProposedCourseUnitDetails_ExistingInstitute(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteProposedCourseUnitDetails");
                throw ex;
            }
            return returnval;
        }

        public string SaveCourseUnitDetails(CourseUnitDetailsEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.SaveCourseUnitDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseUnitDetails");
                throw ex;
            }
            return returnval;
        }
        public string DeleteCourseUnitDetails(RenewalDetailsEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.DeleteCourseUnitDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CourseUnitDetailsEntity");
                throw ex;
            }
            return returnval;
        }

        public CourseUnitDetailsEntity GetCourseUnitDetails(CourseUnitDetailsEntity entity)
        {
            CourseUnitDetailsEntity courseUnitDetailsEntity = new CourseUnitDetailsEntity();
            try
            {
                DataSet ds = objData.GetCourseUnitDetails(entity);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        courseUnitDetailsEntity = FillCourseUnitDetailsEntity(dr);
                    }
                }
                List<RenewalDetailsEntity> lstrenewalDetails = new List<RenewalDetailsEntity>();
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[1].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[1].Rows)
                    {
                        RenewalDetailsEntity renewalDetails = FillRenewalDetailsEntity(dr);
                        lstrenewalDetails.Add(renewalDetails);
                    }
                }
                courseUnitDetailsEntity.lstRenewalDetails = lstrenewalDetails;

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseUnitDetails", entity.InstituteID.ToString());

            }
            return courseUnitDetailsEntity;
        }




        public string SaveInstituteVerificationDetails(ProposedInstituteInfoEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveInstituteVerificationDetails(entity);
                if (retVal.ToUpper() != "Y")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInstituteVerificationDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        protected CourseUnitDetailsEntity FillCourseUnitDetailsEntity(DataRow dr)
        {
            CourseUnitDetailsEntity entity = new CourseUnitDetailsEntity();
            entity.InstituteID = dr["InstituteID"] == null ? 0 : Convert.ToInt64(dr["InstituteID"]);
            entity.CourseID = dr["CourseID"] == null ? 0 : Convert.ToInt64(dr["CourseID"]);
            entity.UnitNo = dr["UnitNo"] == null ? 0 : Convert.ToInt64(dr["UnitNo"]);
            entity.ApprovalOrderDate = Convert.ToDateTime(dr["ApprovalOrderDate"]);
            entity.ApprovalOrder = Convert.ToString(dr["ApprovalOrder"]);
            entity.ApprovalInspectionFeesApplicableAmount = Convert.ToDecimal(dr["ApprovalInspectionFeesApplicableAmount"]);
            entity.ApprovalInspectionFeesAmountPaid = Convert.ToDecimal(dr["ApprovalInspectionFeesAmountPaid"]);
            entity.ApprovalInspectionFeesModeOfPayment = Convert.ToInt16(dr["ApprovalInspectionFeesModeOfPayment"]);
            entity.ApprovalInspectionFeesTransactionSlipPath = Convert.ToString(dr["ApprovalInspectionFeesTransactionSlipPath"]);
            entity.ApprovalInspectionFeesAccount = Convert.ToInt64(dr["ApprovalInspectionFeesAccount"]);
            entity.ApprovalInspectionFeesPaymentDate = Convert.ToDateTime(dr["ApprovalInspectionFeesPaymentDate"]);
            entity.ApprovalInspectionFeesTransactionId = Convert.ToString(dr["ApprovalInspectionFeesTransactionId"]);
            entity.ApprovalInspectionFeesPaymentId = Convert.ToInt64(dr["ApprovalInspectionFeesPaymentId"]);
            entity.ApprovalInspectionFeesVariation = Convert.ToString(dr["ApprovalInspectionFeesVariation"]);


            entity.SecurityDepositDetailsApplicableAmount = Convert.ToDecimal(dr["SecurityDepositDetailsApplicableAmount"]);
            entity.SecurityDepositDetailsAmountPaid = Convert.ToDecimal(dr["SecurityDepositDetailsAmountPaid"]);
            entity.SecurityDepositDetailsModeOfPayment = Convert.ToInt16(dr["SecurityDepositDetailsModeOfPayment"]);
            entity.SecurityDepositDetailsTransactionSlipPath = Convert.ToString(dr["SecurityDepositDetailsTransactionSlipPath"]);
            entity.SecurityDepositDetailsAccount = Convert.ToInt64(dr["SecurityDepositDetailsAccount"]);
            entity.SecurityDepositDetailsPaymentDate = Convert.ToDateTime(dr["SecurityDepositDetailsPaymentDate"]);
            entity.SecurityDepositDetailsTransactionId = Convert.ToString(dr["SecurityDepositDetailsTransactionId"]);
            entity.SecurityDepositDetailsPaymentId = Convert.ToInt64(dr["SecurityDepositDetailsPaymentId"]);
            entity.SecurityDepositDetailsVariation = Convert.ToString(dr["SecurityDepositDetailsVariation"]);

            return entity;
        }

        protected RenewalDetailsEntity FillRenewalDetailsEntity(DataRow dr)
        {
            RenewalDetailsEntity entity = new RenewalDetailsEntity();
            entity.InstituteID = dr["InstituteID"] == null ? 0 : Convert.ToInt64(dr["InstituteID"]);
            entity.CourseID = dr["CourseID"] == null ? 0 : Convert.ToInt64(dr["CourseID"]);
            entity.UnitID = dr["UnitNo"] == null ? 0 : Convert.ToInt64(dr["UnitID"]);
            entity.CourseUnitIDDetailsID = Convert.ToInt64(dr["CourseUnitIDDetailsID"]);
            entity.renewalFrom = Convert.ToString(dr["renewalFrom"]);
            entity.renewalTo = Convert.ToString(dr["renewalTo"]);
            entity.ApplicableAmount = Convert.ToDecimal(dr["ApplicableAmount"]);
            entity.AmountPaid = Convert.ToDecimal(dr["AmountPaid"]);
            entity.ModeOfPayment = Convert.ToInt16(dr["ModeOfPayment"]);
            entity.TransactionSlipPath = Convert.ToString(dr["TransactionSlipPath"]);
            entity.Account = Convert.ToInt64(dr["Account"]);
            entity.PaymentDate = Convert.ToDateTime(dr["PaymentDate"]);
            entity.TransactionId = Convert.ToString(dr["TransactionId"]);
            entity.PaymentId = Convert.ToInt64(dr["PaymentId"]);
            entity.Variation = Convert.ToString(dr["Variation"]);
            return entity;
        }


        // institute profile
        public string LockInstituteForm(InstituteFormLockEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.LockInstituteForm(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "LockInstituteForm", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string UnlockInstituteForm(InstituteFormLockEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.UnlockInstituteForm(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UnlockInstituteForm", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public DataTable CheckInstituteFormFillingEligibility(InstituteFormEligibilityEntity entity)
        {
            DataTable retVal = null;
            try
            {
                retVal = objData.CheckInstituteFormFillingEligibility(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckInstituteFormFillingEligibility", entity.UserLoginID);
                throw;
            }
            return retVal;
        }

        public DataTable CheckInstituteRequestEligibility(InstituteFormEligibilityEntity entity)
        {
            DataTable retVal = null;
            try
            {
                retVal = objData.CheckInstituteRequestEligibility(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckInstituteRequestEligibility", entity.UserLoginID);
                throw;
            }
            return retVal;
        }

        public TraningEquiplemntEntity Inventory_GetEquipmentListDetails(InstituteInputEntity inputEntity)
        {
            List<TrainingEquipmentListEntity> lstTrainingEquipment = new List<TrainingEquipmentListEntity>();
            TrainingEquipmentListEntity obj = new TrainingEquipmentListEntity();
            TraningEquiplemntEntity entity = new TraningEquiplemntEntity();
            try
            {
                DataSet ds = objData.Inventory_GetEquipmentListDetails(inputEntity);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    entity.lstTrainingEquipmentListEntity = ExtractTrainingEquipmentList(ds.Tables[0]);
                }
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[1].Rows.Count > 0)
                {
                    TraningEquipmentPhotoEntity traningEquipmentPhotoEntity = new TraningEquipmentPhotoEntity();
                    List<TraningEquipmentPhotoEntity> lstPhoto = new List<TraningEquipmentPhotoEntity>();
                    foreach (DataRow dr in ds.Tables[1].Rows)
                    {
                        traningEquipmentPhotoEntity = new TraningEquipmentPhotoEntity();
                        traningEquipmentPhotoEntity.InstituteID = Convert.ToInt64(dr["InstituteId"]);
                        traningEquipmentPhotoEntity.CourseID = Convert.ToInt64(dr["CourseId"]);
                        traningEquipmentPhotoEntity.PhotoPath = Convert.ToString(dr["PhotoPath"]);
                        traningEquipmentPhotoEntity.ID = Convert.ToInt64(dr["Id"]);
                        lstPhoto.Add(traningEquipmentPhotoEntity);
                    }
                    entity.lstEquipmentPhoto = lstPhoto;
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTrainingEquipmentListDetails", inputEntity.InstituteId.ToString());
                throw ex;
            }

            return entity;
        }

        public string Inventory_UpdateEquipmentAvailability(List<TrainingEquipmentListEntity> lstTrainingEquipmentList, List<TraningEquipmentPhotoEntity> lstPhoto, string PageCode)
        {
            string retVal = "";
            try
            {
                retVal = objData.Inventory_UpdateEquipmentAvailability(lstTrainingEquipmentList, lstPhoto, PageCode);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been updated. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateTrainingEquipmentAvailability", "");
                retVal = ex.Message;
            }
            return retVal;
        }

        public List<TrainingEquipmentListEntity> ExtractTrainingEquipmentList(DataTable dt)
        {
            List<TrainingEquipmentListEntity> lstTrainingEquipment = new List<TrainingEquipmentListEntity>();
            TrainingEquipmentListEntity obj = new TrainingEquipmentListEntity();

            foreach (DataRow dr in dt.Rows)
            {
                obj = new TrainingEquipmentListEntity();
                

                obj.InstituteId = dr["InstituteID"] != DBNull.Value ? Convert.ToInt64(dr["InstituteID"]) : 0;
                obj.CourseID = dr["CourseID"] != DBNull.Value ? Convert.ToInt64(dr["CourseID"]) : 0;
                obj.EquipmentId = dr["EquipmentId"] != DBNull.Value ? Convert.ToInt32(dr["EquipmentId"]) : 0;
                obj.EquipmentName = dr["EquipmentName"] != DBNull.Value ? Convert.ToString(dr["EquipmentName"]) : "";
                obj.EquipmentCategoryId = dr["EquipmentCategoryId"] != DBNull.Value ? Convert.ToInt32(dr["EquipmentCategoryId"]) : 0;
                obj.EquipmentCategory = dr["EquipmentCategory"] != DBNull.Value ? Convert.ToString(dr["EquipmentCategory"]) : "";
                obj.UtilizationRemarks = dr["UtilizationRemarks"] != DBNull.Value ? Convert.ToString(dr["UtilizationRemarks"]) : "";

                obj.IsDsrItem = dr["IsDsrItem"] != DBNull.Value ? Convert.ToBoolean(dr["IsDsrItem"]) : false;
                obj.IsMandatory = dr["IsMandatory"] != DBNull.Value ? Convert.ToBoolean(dr["IsMandatory"]) : false;
                obj.IsAlliedCourseItem = dr["IsAlliedCourseItem"] != DBNull.Value ? Convert.ToBoolean(dr["IsAlliedCourseItem"]) : false;
                obj.IsMouItem = dr["IsMouItem"] != DBNull.Value ? Convert.ToBoolean(dr["IsMouItem"]) : false;

                obj.RequiredPerUnit = dr["RequiredPerUnit"] != DBNull.Value ? Convert.ToInt32(dr["RequiredPerUnit"]) : 0;
                obj.AvailableEquipments = dr["AvailableEquipments"] != DBNull.Value ? Convert.ToInt32(dr["AvailableEquipments"]) : 0;
                obj.RequiredEquipmentForTotalUnits = dr["RequiredEquipmentForTotalUnits"] != DBNull.Value ? Convert.ToInt32(dr["RequiredEquipmentForTotalUnits"]) : 0;

                obj.IsEditAllowed = dr["IsEditAllowed"] != DBNull.Value ? Convert.ToBoolean(dr["IsEditAllowed"]) : false;
                obj.IsDeleteAllowed = dr["IsDeleteAllowed"] != DBNull.Value ? Convert.ToBoolean(dr["IsDeleteAllowed"]) : false;

                obj.IsCourseMOU = dr["MOU"] != DBNull.Value ? Convert.ToInt16(dr["MOU"]) : (short)0;
                obj.MOUPath = dr["MOUPath"] != DBNull.Value ? Convert.ToString(dr["MOUPath"]) : "";
                obj.Remark = dr["Remark"] != DBNull.Value ? Convert.ToInt16(dr["Remark"]) : (short)0;
                obj.EquipmentStatus = dr["EquipmentStatus"] != DBNull.Value ? Convert.ToString(dr["EquipmentStatus"]) : "";


                obj.DistanceBetweenInstituteAndMOU = dr["DistanceBetweenInstituteAndMOU"] != DBNull.Value ? (short)Convert.ToInt64(dr["DistanceBetweenInstituteAndMOU"]) : (short)0;
                lstTrainingEquipment.Add(obj);
            }

            return lstTrainingEquipment;
        }







    }
}
