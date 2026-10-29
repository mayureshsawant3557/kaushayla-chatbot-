using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;
using Portal.Data;
using System.Data;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Entities.Base;
using Portal.Entities.Candidate;
using Portal.Entities.Institute;

namespace Portal.Business.Worker.Candidate
{
    public class CandidateSummaryWorker : ICandidateSummary
    {
        private readonly Repository _objData; // Injected Repository instance

        // ✅ Constructor Dependency Injection
        public CandidateSummaryWorker(Repository objData)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }

        public CheckURLEntity CheckCandidateURL(CandidateInput entity)
        {
            CheckURLEntity obj = new CheckURLEntity();
            try
            {
                DataTable dt = _objData.CheckCandidateURL(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    obj.IsRightURL = Convert.ToBoolean(dt.Rows[0]["IsRightUrl"]);
                    obj.RightURL = Convert.ToString(dt.Rows[0]["RightUrl"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckCandidateURL", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }

        public CandidateSummaryEntity GetCandidateSummary(CandidateInput entity)
        {
            CandidateSummaryEntity obj = new CandidateSummaryEntity();
            try
            {
                DataSet ds = _objData.GetCandidateSummary(entity);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[0].Rows[0];

                    obj.CandidateApplicationStatusSummary.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.CandidateApplicationStatusSummary.IsPrimaryDetailsFilled = Convert.ToBoolean(dr["IsPrimaryDetailsFilled"].ToString());
                    obj.CandidateApplicationStatusSummary.IsAddressDetailsFilled = Convert.ToBoolean(dr["IsAddressDetailsFilled"].ToString());
                    obj.CandidateApplicationStatusSummary.IsParentDetailsFilled = Convert.ToBoolean(dr["IsParentDetailsFilled"].ToString());
                    obj.CandidateApplicationStatusSummary.IsCategoryDetailsFilled = Convert.ToBoolean(dr["IsCategoryDetailsFilled"].ToString());
                    obj.CandidateApplicationStatusSummary.IsQualificationDetailsFilled = Convert.ToBoolean(dr["IsQualificationDetailsFilled"].ToString());
                    obj.CandidateApplicationStatusSummary.IsTrainingDetailsFilled = Convert.ToBoolean(dr["IsTrainingDetailsFilled"].ToString());
                    obj.CandidateApplicationStatusSummary.IsAdditionalDetailsFilled = Convert.ToBoolean(dr["IsAdditionalDetailsFilled"].ToString());
                    obj.CandidateApplicationStatusSummary.IsBankDetailsFilled = Convert.ToBoolean(dr["IsBankDetailsFilled"].ToString());
                    obj.CandidateApplicationStatusSummary.IsWorkExperienceDetailsFilled = Convert.ToBoolean(dr["IsWorkExperienceDetailsFilled"].ToString());
                    obj.CandidateApplicationStatusSummary.IsEligible = Convert.ToBoolean(dr["IsEligible"].ToString());
                    obj.CandidateApplicationStatusSummary.ErrorMsg = dr["ErrorMsg"].ToString();
                    obj.CandidateApplicationStatusSummary.WarningMsg = dr["WarningMsg"].ToString();
                    obj.CandidateApplicationStatusSummary.VersionNo = Convert.ToInt32(dr["VersionNo"].ToString());
                    obj.CandidateApplicationStatusSummary.StepID = Convert.ToInt16(dr["StepID"].ToString());
                    obj.CandidateApplicationStatusSummary.FormStatus = dr["FormStatus"].ToString();
                    obj.CandidateApplicationStatusSummary.LastModifiedOn = Convert.ToDateTime(dr["LastModifiedOn"].ToString());
                    obj.CandidateApplicationStatusSummary.LastModifiedBy = dr["LastModifiedBy"].ToString();
                    obj.CandidateApplicationStatusSummary.LastModifiedByIPAddress = dr["LastModifiedByIPAddress"].ToString();
                    obj.CandidateApplicationStatusSummary.LastModifiedPage = dr["LastModifiedPage"].ToString();
                    obj.CandidateApplicationStatusSummary.ConfirmedDateTime = Convert.ToDateTime(dr["ConfirmedDateTime"].ToString());
                    obj.CandidateApplicationStatusSummary.ConfirmedBy = dr["ConfirmedBy"].ToString();
                    obj.CandidateApplicationStatusSummary.ConfirmedByIPAddress = dr["ConfirmedByIPAddress"].ToString();
                }

                if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[1].Rows[0];

                    obj.CandidatePrimarySummary.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.CandidatePrimarySummary.ApplicationID = Convert.ToString(dr["ApplicationID"]);
                    obj.CandidatePrimarySummary.ITIRegistrationNo = Convert.ToString(dr["ITIRegistrationNo"]);
                    obj.CandidatePrimarySummary.FirstName = Convert.ToString(dr["FirstName"]);
                    obj.CandidatePrimarySummary.MiddleName = Convert.ToString(dr["MiddleName"]);
                    obj.CandidatePrimarySummary.LastName = Convert.ToString(dr["LastName"]);
                    obj.CandidatePrimarySummary.PhotoFilePath = Convert.ToString(dr["PhotoFilePath"]);
                    obj.CandidatePrimarySummary.SignFilePath = Convert.ToString(dr["SignFilePath"]);
                    obj.CandidatePrimarySummary.Gender = Convert.ToString(dr["Gender"]);
                    obj.CandidatePrimarySummary.DOB = Convert.ToString(dr["DOB"]);
                    obj.CandidatePrimarySummary.AadhaarNo = Convert.ToString(dr["AadhaarNo"]);
                    obj.CandidatePrimarySummary.AadhaarFilePath = Convert.ToString(dr["AadhaarFilePath"]);
                    obj.CandidatePrimarySummary.MobileNo = Convert.ToString(dr["MobileNo"]);
                    obj.CandidatePrimarySummary.AltMobileNo = Convert.ToString(dr["AltMobileNo"]);
                    obj.CandidatePrimarySummary.EMailID = Convert.ToString(dr["EMailID"]);
                }

                if (ds != null && ds.Tables.Count > 2 && ds.Tables[2].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[2].Rows[0];

                    obj.CandidateAddressSummary.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.CandidateAddressSummary.PAddress = Convert.ToString(dr["PAddress"]);
                    obj.CandidateAddressSummary.PState = Convert.ToString(dr["PState"]);
                    obj.CandidateAddressSummary.PDistrict = Convert.ToString(dr["PDistrict"]);
                    obj.CandidateAddressSummary.PTaluka = Convert.ToString(dr["PTaluka"]);
                    obj.CandidateAddressSummary.PCity = Convert.ToString(dr["PCity"]);
                    obj.CandidateAddressSummary.PPincode = Convert.ToString(dr["PPincode"]);
                    obj.CandidateAddressSummary.IsCAddressSameAsPAddress = Convert.ToString(dr["IsCAddressSameAsPAddress"]);
                    obj.CandidateAddressSummary.CAddress = Convert.ToString(dr["CAddress"]);
                    obj.CandidateAddressSummary.CState = Convert.ToString(dr["CState"]);
                    obj.CandidateAddressSummary.CDistrict = Convert.ToString(dr["CDistrict"]);
                    obj.CandidateAddressSummary.CTaluka = Convert.ToString(dr["CTaluka"]);
                    obj.CandidateAddressSummary.CCity = Convert.ToString(dr["CCity"]);
                    obj.CandidateAddressSummary.CPincode = Convert.ToString(dr["CPincode"]);
                }

                if (ds != null && ds.Tables.Count > 3 && ds.Tables[3].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[3].Rows[0];

                    obj.CandidateParentSummary.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.CandidateParentSummary.IsOrphan = Convert.ToString(dr["IsOrphan"]);
                    obj.CandidateParentSummary.FatherTitle = Convert.ToString(dr["FatherTitle"]);

                    obj.CandidateParentSummary.FatherFirstName = Convert.ToString(dr["FatherFirstName"]);
                    obj.CandidateParentSummary.FatherMiddleName = Convert.ToString(dr["FatherMiddleName"]);
                    obj.CandidateParentSummary.FatherLastName = Convert.ToString(dr["FatherLastName"]);
                    obj.CandidateParentSummary.MotherTitle = Convert.ToString(dr["MotherTitle"]);

                    obj.CandidateParentSummary.MotherFirstName = Convert.ToString(dr["MotherFirstName"]);
                    obj.CandidateParentSummary.MotherMiddleName = Convert.ToString(dr["MotherMiddleName"]);
                    obj.CandidateParentSummary.MotherLastName = Convert.ToString(dr["MotherLastName"]);
                    obj.CandidateParentSummary.MaritalStatus = Convert.ToString(dr["MaritalStatus"]);
                    obj.CandidateParentSummary.SpouseTitle = Convert.ToString(dr["SpouseTitle"]);
                    obj.CandidateParentSummary.SpouseFirstName = Convert.ToString(dr["SpouseFirstName"]);
                    obj.CandidateParentSummary.SpouseMiddleName = Convert.ToString(dr["SpouseMiddleName"]);
                    obj.CandidateParentSummary.SpouseLastName = Convert.ToString(dr["SpouseLastName"]);
                }

                if (ds != null && ds.Tables.Count > 4 && ds.Tables[4].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[4].Rows[0];

                    obj.CandidateCategorySummary.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.CandidateCategorySummary.Nationality = Convert.ToString(dr["Nationality"]);
                    obj.CandidateCategorySummary.IsMHDomiciled = Convert.ToString(dr["IsMHDomiciled"]);
                    obj.CandidateCategorySummary.Religion = Convert.ToString(dr["Religion"]);
                    obj.CandidateCategorySummary.CategoryID = Convert.ToInt16(dr["CategoryID"]);
                    obj.CandidateCategorySummary.Category = Convert.ToString(dr["Category"]);
                    obj.CandidateCategorySummary.Caste = Convert.ToString(dr["Caste"]);
                    obj.CandidateCategorySummary.CasteCertificatePath = Convert.ToString(dr["CasteCertificatePath"]);
                    obj.CandidateCategorySummary.IsBelongToNCL = Convert.ToString(dr["IsBelongToNCL"]);
                    obj.CandidateCategorySummary.NCLCertificatePath = Convert.ToString(dr["NCLCertificatePath"]);
                    obj.CandidateCategorySummary.IsBelongToPWD = Convert.ToString(dr["IsBelongToPWD"]);
                    obj.CandidateCategorySummary.DisabilityPercentage = Convert.ToInt16(dr["DisabilityPercentage"]);
                    obj.CandidateCategorySummary.Disability = Convert.ToString(dr["Disability"]);
                    obj.CandidateCategorySummary.DisabilityType = Convert.ToString(dr["DisabilityType"]);
                    obj.CandidateCategorySummary.UniqueDisabilityIDNo = Convert.ToString(dr["UniqueDisabilityIDNo"]);
                    obj.CandidateCategorySummary.PWDCertificatePath = Convert.ToString(dr["PWDCertificatePath"]);
                }

                if (ds != null && ds.Tables.Count > 5 && ds.Tables[5].Rows.Count > 0)
                {
                    CandidateQualificationSummaryEntity objQ;

                    foreach (DataRow dr in ds.Tables[5].Rows)
                    {
                        objQ = new CandidateQualificationSummaryEntity();

                        objQ.QualificationRowID = Convert.ToInt64(dr["QualificationRowID"]);
                        objQ.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                        objQ.Qualification = Convert.ToString(dr["Qualification"]);
                        objQ.QualificationGroup = Convert.ToString(dr["QualificationGroup"]);
                        objQ.Degree = Convert.ToString(dr["Degree"]);
                        objQ.Subject = Convert.ToString(dr["Subject"]);
                        objQ.University = Convert.ToString(dr["University"]);
                        objQ.ResultDate = Convert.ToString(dr["ResultDate"]);
                        objQ.AppearingYear = Convert.ToString(dr["AppearingYear"]);
                        objQ.Attempts = Convert.ToInt16(dr["Attempts"]);
                        objQ.MarksObtained = Convert.ToString(dr["MarksObtained"]);
                        objQ.MaximumMarks = Convert.ToString(dr["MaximumMarks"]);
                        objQ.CourseDuration = Convert.ToInt16(dr["CourseDuration"]);
                        objQ.Class = Convert.ToString(dr["Class"]);
                        objQ.Mode = Convert.ToString(dr["Mode"]);
                        objQ.CertificatePath = Convert.ToString(dr["CertificatePath"]);

                        obj.CandidateQualificationSummaryList.Add(objQ);
                    }
                }

                if (ds != null && ds.Tables.Count > 6 && ds.Tables[6].Rows.Count > 0)
                {
                    CandidateTrainingSummaryEntity objT;

                    foreach (DataRow dr in ds.Tables[6].Rows)
                    {
                        objT = new CandidateTrainingSummaryEntity();

                        objT.TrainingRowID = Convert.ToInt64(dr["TrainingRowID"]);
                        objT.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                        objT.Course = Convert.ToString(dr["Course"]);
                        objT.CourseConductedBy = Convert.ToString(dr["CourseConductedBy"]);
                        objT.FromDate = Convert.ToString(dr["FromDate"]);
                        objT.ToDate = Convert.ToString(dr["ToDate"]);
                        objT.CertificatePath = Convert.ToString(dr["CertificatePath"]);

                        obj.CandidateTrainingSummaryList.Add(objT);
                    }
                }

                if (ds != null && ds.Tables.Count > 7 && ds.Tables[7].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[7].Rows[0];

                    obj.CandidateAdditionalSummary.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.CandidateAdditionalSummary.BloodGroup = Convert.ToString(dr["BloodGroup"]);
                    obj.CandidateAdditionalSummary.MotherTongue = Convert.ToString(dr["MotherTongue"]);
                }

                if (ds != null && ds.Tables.Count > 8 && ds.Tables[8].Rows.Count > 0)
                {
                    CandidateLanguageSummaryEntity objL;

                    foreach (DataRow dr in ds.Tables[8].Rows)
                    {
                        objL = new CandidateLanguageSummaryEntity();

                        objL.LanguageRowID = Convert.ToInt64(dr["LanguageRowID"]);
                        objL.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                        objL.Language = Convert.ToString(dr["Language"]);
                        objL.Read = Convert.ToString(dr["Read"]);
                        objL.Write = Convert.ToString(dr["Write"]);
                        objL.Speak = Convert.ToString(dr["Speak"]);

                        obj.CandidateLanguageSummaryList.Add(objL);
                    }
                }

                if (ds != null && ds.Tables.Count > 9 && ds.Tables[9].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[9].Rows[0];

                    obj.CandidateBankSummary.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.CandidateBankSummary.AccountType = Convert.ToString(dr["AccountType"]);
                    obj.CandidateBankSummary.AccountNo = Convert.ToString(dr["AccountNo"]);
                    obj.CandidateBankSummary.AccountHolderName = Convert.ToString(dr["AccountHolderName"]);
                    obj.CandidateBankSummary.IFSCCode = Convert.ToString(dr["IFSCCode"]);
                    obj.CandidateBankSummary.BankName = Convert.ToString(dr["BankName"]);
                    obj.CandidateBankSummary.BranchName = Convert.ToString(dr["BranchName"]);
                    obj.CandidateBankSummary.PANNo = Convert.ToString(dr["PANNo"]);
                    obj.CandidateBankSummary.PANPath = Convert.ToString(dr["PANPath"]);
                }

                if (ds != null && ds.Tables.Count > 10 && ds.Tables[10].Rows.Count > 0)
                {
                    CandidateWorkExperienceSummaryEntity objA;

                    foreach (DataRow dr in ds.Tables[10].Rows)
                    {
                        objA = new CandidateWorkExperienceSummaryEntity();

                        objA.WorkExperienceRowID = Convert.ToInt64(dr["WorkExperienceRowID"]);
                        objA.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                        objA.EstablishmentName = Convert.ToString(dr["EstablishmentName"]);
                        objA.FromDate = Convert.ToString(dr["FromDate"]);
                        objA.ToDate = Convert.ToString(dr["ToDate"]);
                        objA.SalaryPerMonth = Convert.ToInt32(dr["SalaryPerMonth"]);
                        objA.JobRole = Convert.ToString(dr["JobRole"]);
                        objA.Address = Convert.ToString(dr["Address"]);
                        objA.State = Convert.ToString(dr["State"]);
                        objA.District = Convert.ToString(dr["District"]);
                        objA.Taluka = Convert.ToString(dr["Taluka"]);
                        objA.City = Convert.ToString(dr["City"]);
                        objA.Pincode = Convert.ToString(dr["Pincode"]);

                        obj.CandidateWorkExperienceSummaryList.Add(objA);
                    }
                }
                if (ds != null && ds.Tables.Count > 11 && ds.Tables[11].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[11].Rows[0];

                    obj.CandidateCheckRequiredFields.CandidateID = Convert.ToInt64(dr["CandidateID"]);

                    obj.CandidateCheckRequiredFields.IsFirstNameFilled = Convert.ToInt16(dr["IsFirstNameFilled"]);

                    obj.CandidateCheckRequiredFields.IsDOBFilled = Convert.ToInt16(dr["IsDOBFilled"]);

                    obj.CandidateCheckRequiredFields.IsAadhaarNoFilled = Convert.ToInt16(dr["IsAadhaarNoFilled"]);

                    obj.CandidateCheckRequiredFields.IsProfilePhotoUploaded = Convert.ToInt16(dr["IsProfilePhotoUploaded"]);

                    obj.CandidateCheckRequiredFields.IsSignaturePhotoUploaded = Convert.ToInt16(dr["IsSignaturePhotoUploaded"]);

                    obj.CandidateCheckRequiredFields.IsAadhaarCardUploaded = Convert.ToInt16(dr["IsAadhaarCardUploaded"]);

                    obj.CandidateCheckRequiredFields.IsPrimaryNoFilled = Convert.ToInt16(dr["IsPrimaryNoFilled"]);

                    obj.CandidateCheckRequiredFields.IsPAddressFilled = Convert.ToInt16(dr["IsPAddressFilled"]);

                    obj.CandidateCheckRequiredFields.IsCAddressFilled = Convert.ToInt16(dr["IsCAddressFilled"]);

                    obj.CandidateCheckRequiredFields.IsOrphanSelected = Convert.ToInt16(dr["IsOrphanSelected"]);

                    obj.CandidateCheckRequiredFields.IsFatherFirstNameFilled = Convert.ToInt16(dr["IsFatherFirstNameFilled"]);

                    obj.CandidateCheckRequiredFields.IsMotherFirstNameFilled = Convert.ToInt16(dr["IsMotherFirstNameFilled"]);

                    //obj.CandidateCheckRequiredFields.IsLeavingCertificateUploaded = Convert.ToInt16(dr["IsLeavingCertificateUploaded"]);

                    obj.CandidateCheckRequiredFields.IsPWDSelected = Convert.ToInt16(dr["IsPWDSelected"]);

                    obj.CandidateCheckRequiredFields.IsDisabilityCertificateUploaded = Convert.ToInt16(dr["IsDisabilityCertificateUploaded"]);

                    obj.CandidateCheckRequiredFields.IsQualificationDetailsFilled = Convert.ToInt16(dr["IsQualificationDetailsFilled"]);

                    obj.CandidateCheckRequiredFields.IsBloodGroupSelected = Convert.ToInt16(dr["IsBloodGroupSelected"]);

                    obj.CandidateCheckRequiredFields.IsMotherToungeSelected = Convert.ToInt16(dr["IsMotherToungeSelected"]);

                    obj.CandidateCheckRequiredFields.IsLanguagesKnownSelected = Convert.ToInt16(dr["IsLanguagesKnownSelected"]);

                    obj.CandidateCheckRequiredFields.IsEligible = Convert.ToBoolean(dr["IsEligible"]);

                    obj.CandidateCheckRequiredFields.ErrorMsg = Convert.ToString(dr["ErrorMsg"]);

                    obj.CandidateCheckRequiredFields.WarningMsg = Convert.ToString(dr["WarningMsg"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateSummary", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }

        public string LockCandidateForm(CandidateFormLockEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.LockCandidateForm(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "LockCandidateForm", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string UnlockCandidateForm(CandidateFormUnlockEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.UnlockCandidateForm(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UnlockCandidateForm", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public DataTable GetEligibilityFlagForUnlockCandidateForm(long CandidateID, string UserLoginID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = _objData.GetEligibilityFlagForUnlockCandidateForm(CandidateID, UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetEligibilityFlagForUnlockCandidateForm", CandidateID.ToString());
                throw ex;
            }
            return dt;
        }

        public InstituteInfoEntity GetAppliedInstituteDetailsSummary(CandidateInput entity)
        {
            InstituteInfoEntity obj = new InstituteInfoEntity();
            try
            {
                DataSet ds = _objData.GetAppliedInstituteDetailsSummary(entity);
                obj = ExtractInstituteDetails(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteDetails");
                throw ex;
            }
            return obj;
        }

        public InstituteInfoEntity ExtractInstituteDetails(DataSet ds)
        {
            InstituteInfoEntity obj = new InstituteInfoEntity();
            List<InstituteMemberEntity> listMember = new List<InstituteMemberEntity>();
            List<InstituteCourseEntity> listCourse = new List<InstituteCourseEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[0].Rows[0];

                    obj.InstituteID = Convert.ToInt64(dr["InstituteID"]);
                    obj.InstituteCode = Convert.ToString(dr["InstituteCode"]);
                    obj.InstituteName = Convert.ToString(dr["InstituteName"]);
                    obj.InstituteAddress = Convert.ToString(dr["InstituteAddress"]);
                    obj.StateID = Convert.ToInt16(dr["StateID"]);
                    obj.State = Convert.ToString(dr["State"]);
                    obj.RegionID = Convert.ToInt16(dr["RegionID"]);
                    obj.Region = Convert.ToString(dr["Region"]);
                    obj.DistrictID = Convert.ToInt32(dr["DistrictID"]);
                    obj.District = Convert.ToString(dr["District"]);
                    obj.TalukaID = Convert.ToInt32(dr["TalukaID"]);
                    obj.Taluka = Convert.ToString(dr["Taluka"]);
                    obj.City = Convert.ToString(dr["City"]);
                    obj.PinCode = Convert.ToString(dr["PinCode"]);
                    obj.PhoneNo = Convert.ToString(dr["PhoneNo"]);
                    obj.FaxNo = Convert.ToString(dr["FaxNo"]);
                    obj.EMailID = Convert.ToString(dr["EMailID"]);
                    obj.WebSite = Convert.ToString(dr["WebSite"]);

                    if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                    {
                        foreach (DataRow dr1 in ds.Tables[1].Rows)
                        {
                            InstituteMemberEntity objMember = new InstituteMemberEntity();

                            objMember.MemberTypeID = Convert.ToInt16(dr1["MemberTypeID"]);
                            objMember.MemberType = Convert.ToString(dr1["MemberType"]);
                            objMember.MemberName = Convert.ToString(dr1["MemberName"]);
                            objMember.Designation = Convert.ToString(dr1["Designation"]);
                            objMember.MobileNo = Convert.ToString(dr1["MobileNo"]);
                            objMember.AltMobileNo = Convert.ToString(dr1["AltMobileNo"]);
                            objMember.EMailiD = Convert.ToString(dr1["EMailiD"]);
                            objMember.PhoneNo = Convert.ToString(dr1["PhoneNo"]);

                            listMember.Add(objMember);
                        }
                    }
                    obj.ListInstituteMember = listMember;

                    if (ds.Tables.Count > 2 && ds.Tables[2].Rows.Count > 0)
                    {
                        InstituteCourseEntity objCourse;
                        foreach (DataRow dr1 in ds.Tables[2].Rows)
                        {
                            objCourse = new InstituteCourseEntity();

                            objCourse.ChoiceCode = Convert.ToInt64(dr1["ChoiceCode"]);
                            objCourse.CourseID = Convert.ToInt64(dr1["CourseID"]);
                            objCourse.CourseCode = Convert.ToString(dr1["CourseCode"]);
                            objCourse.Course = Convert.ToString(dr1["Course"]);
                            objCourse.ShiftID = Convert.ToInt16(dr1["ShiftID"]);
                            objCourse.Shift = Convert.ToString(dr1["Shift"]);
                            objCourse.CourseTypeID = Convert.ToInt16(dr1["CourseTypeID"]);
                            objCourse.CourseType = Convert.ToString(dr1["CourseType"]);
                            objCourse.CourseBatchStartDate = Convert.ToString(dr1["CourseBatchStartDate"]);
                            objCourse.AdmissionLastDate = Convert.ToString(dr1["AdmissionLastDate"]);
                            objCourse.TotalIntake = Convert.ToInt16(dr1["TotalIntake"]);
                            objCourse.CurrentVacancy = Convert.ToInt16(dr1["CurrentVacancy"]);

                            listCourse.Add(objCourse);
                        }
                    }
                    obj.ListInstituteCourse = listCourse;
                }
            }
            catch (Exception)
            {
                throw;
            }
            return obj;
        }
    }
}