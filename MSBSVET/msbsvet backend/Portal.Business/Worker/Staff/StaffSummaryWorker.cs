using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Data;
using Portal.Business.Interface.Staff;
using Portal.Data;
using Portal.Entities.Base;
using Portal.Business.Worker.Utility;
using Portal.Entities.Staff;
using Portal.Entities.Institute;

namespace Portal.Business.Worker.Staff
{
    public class StaffSummaryWorker : IStaffSummary
    {
        private readonly Repository objData;
        //Inject Repository via Constructor 
        public StaffSummaryWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public CheckURLEntity CheckStaffURL(StaffInput entity)
        {
            CheckURLEntity obj = new CheckURLEntity();
            try
            {
                DataTable dt = objData.CheckStaffURL(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    obj.IsRightURL = Convert.ToBoolean(dt.Rows[0]["IsRightUrl"]);
                    obj.RightURL = Convert.ToString(dt.Rows[0]["RightUrl"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckStaffURL", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }
        public StaffSummaryEntity GetStaffSummary(StaffInput entity)
        {
            StaffSummaryEntity obj = new StaffSummaryEntity();
            try
            {
                DataSet ds = objData.GetStaffSummary(entity);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[0].Rows[0];

                    obj.StaffApplicationStatusSummary.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.StaffApplicationStatusSummary.IsPrimaryDetailsFilled = Convert.ToBoolean(dr["IsPrimaryDetailsFilled"].ToString());
                    obj.StaffApplicationStatusSummary.IsAddressDetailsFilled = Convert.ToBoolean(dr["IsAddressDetailsFilled"].ToString());
                    obj.StaffApplicationStatusSummary.IsParentDetailsFilled = Convert.ToBoolean(dr["IsParentDetailsFilled"].ToString());
                    obj.StaffApplicationStatusSummary.IsCategoryDetailsFilled = Convert.ToBoolean(dr["IsCategoryDetailsFilled"].ToString());
                    obj.StaffApplicationStatusSummary.IsQualificationDetailsFilled = Convert.ToBoolean(dr["IsQualificationDetailsFilled"].ToString());
                    obj.StaffApplicationStatusSummary.IsTrainingDetailsFilled = Convert.ToBoolean(dr["IsTrainingDetailsFilled"].ToString());
                    obj.StaffApplicationStatusSummary.IsAdditionalDetailsFilled = Convert.ToBoolean(dr["IsAdditionalDetailsFilled"].ToString());
                    obj.StaffApplicationStatusSummary.IsBankDetailsFilled = Convert.ToBoolean(dr["IsBankDetailsFilled"].ToString());
                    obj.StaffApplicationStatusSummary.IsWorkExperienceDetailsFilled = Convert.ToBoolean(dr["IsWorkExperienceDetailsFilled"].ToString());
                    obj.StaffApplicationStatusSummary.IsSectorialExpertiseDetailsFilled = Convert.ToBoolean(dr["IsSectorialExpertiseDetailsFilled"].ToString());
                    obj.StaffApplicationStatusSummary.IsEligible = Convert.ToBoolean(dr["IsEligible"].ToString());
                    obj.StaffApplicationStatusSummary.ErrorMsg = dr["ErrorMsg"].ToString();
                    obj.StaffApplicationStatusSummary.WarningMsg = dr["WarningMsg"].ToString();
                    obj.StaffApplicationStatusSummary.VersionNo = Convert.ToInt32(dr["VersionNo"].ToString());
                    obj.StaffApplicationStatusSummary.StepID = Convert.ToInt16(dr["StepID"].ToString());
                    obj.StaffApplicationStatusSummary.FormStatus = dr["FormStatus"].ToString();
                    obj.StaffApplicationStatusSummary.LastModifiedOn = Convert.ToDateTime(dr["LastModifiedOn"].ToString());
                    obj.StaffApplicationStatusSummary.LastModifiedBy = dr["LastModifiedBy"].ToString();
                    obj.StaffApplicationStatusSummary.LastModifiedByIPAddress = dr["LastModifiedByIPAddress"].ToString();
                    obj.StaffApplicationStatusSummary.LastModifiedPage = dr["LastModifiedPage"].ToString();
                    obj.StaffApplicationStatusSummary.ConfirmedDateTime = Convert.ToDateTime(dr["ConfirmedDateTime"].ToString());
                    obj.StaffApplicationStatusSummary.ConfirmedBy = dr["ConfirmedBy"].ToString();
                    obj.StaffApplicationStatusSummary.ConfirmedByIPAddress = dr["ConfirmedByIPAddress"].ToString();
                }

                if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[1].Rows[0];

                    obj.StaffPrimarySummary.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.StaffPrimarySummary.ApplicationID = Convert.ToString(dr["ApplicationID"]);
                    //obj.StaffPrimarySummary.ITIRegistrationNo = Convert.ToString(dr["ITIRegistrationNo"]);
                    obj.StaffPrimarySummary.FirstName = Convert.ToString(dr["FirstName"]);
                    obj.StaffPrimarySummary.MiddleName = Convert.ToString(dr["MiddleName"]);
                    obj.StaffPrimarySummary.LastName = Convert.ToString(dr["LastName"]);
                    obj.StaffPrimarySummary.PhotoFilePath = Convert.ToString(dr["PhotoFilePath"]);
                    obj.StaffPrimarySummary.SignFilePath = Convert.ToString(dr["SignFilePath"]);
                    obj.StaffPrimarySummary.Gender = Convert.ToString(dr["Gender"]);
                    obj.StaffPrimarySummary.DOB = Convert.ToString(dr["DOB"]);
                    obj.StaffPrimarySummary.AadhaarNo = Convert.ToString(dr["AadhaarNo"]);
                    obj.StaffPrimarySummary.AadhaarFilePath = Convert.ToString(dr["AadhaarFilePath"]);
                    obj.StaffPrimarySummary.MobileNo = Convert.ToString(dr["MobileNo"]);
                    obj.StaffPrimarySummary.AltMobileNo = Convert.ToString(dr["AltMobileNo"]);
                    obj.StaffPrimarySummary.EMailID = Convert.ToString(dr["EMailID"]);
                    obj.StaffPrimarySummary.JobRoles = Convert.ToString(dr["JobRoles"]);
                    obj.StaffPrimarySummary.VerifyCnt = Convert.ToString(dr["VerifyCnt"]);
                    obj.StaffPrimarySummary.RejectCnt = Convert.ToString(dr["RejectCnt"]);

                }

                if (ds != null && ds.Tables.Count > 2 && ds.Tables[2].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[2].Rows[0];

                    obj.StaffAddressSummary.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.StaffAddressSummary.PAddress = Convert.ToString(dr["PAddress"]);
                    obj.StaffAddressSummary.PState = Convert.ToString(dr["PState"]);
                    obj.StaffAddressSummary.PDistrict = Convert.ToString(dr["PDistrict"]);
                    obj.StaffAddressSummary.PTaluka = Convert.ToString(dr["PTaluka"]);
                    obj.StaffAddressSummary.PCity = Convert.ToString(dr["PCity"]);
                    obj.StaffAddressSummary.PPincode = Convert.ToString(dr["PPincode"]);
                    obj.StaffAddressSummary.IsCAddressSameAsPAddress = Convert.ToString(dr["IsCAddressSameAsPAddress"]);
                    obj.StaffAddressSummary.CAddress = Convert.ToString(dr["CAddress"]);
                    obj.StaffAddressSummary.CState = Convert.ToString(dr["CState"]);
                    obj.StaffAddressSummary.CDistrict = Convert.ToString(dr["CDistrict"]);
                    obj.StaffAddressSummary.CTaluka = Convert.ToString(dr["CTaluka"]);
                    obj.StaffAddressSummary.CCity = Convert.ToString(dr["CCity"]);
                    obj.StaffAddressSummary.CPincode = Convert.ToString(dr["CPincode"]);
                }

                if (ds != null && ds.Tables.Count > 3 && ds.Tables[3].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[3].Rows[0];

                    obj.StaffParentSummary.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.StaffParentSummary.IsOrphan = Convert.ToString(dr["IsOrphan"]);
                    obj.StaffParentSummary.FatherFirstName = Convert.ToString(dr["FatherFirstName"]);
                    obj.StaffParentSummary.FatherMiddleName = Convert.ToString(dr["FatherMiddleName"]);
                    obj.StaffParentSummary.FatherLastName = Convert.ToString(dr["FatherLastName"]);
                    obj.StaffParentSummary.MotherFirstName = Convert.ToString(dr["MotherFirstName"]);
                    obj.StaffParentSummary.MotherMiddleName = Convert.ToString(dr["MotherMiddleName"]);
                    obj.StaffParentSummary.MotherLastName = Convert.ToString(dr["MotherLastName"]);
                    obj.StaffParentSummary.MaritalStatus = Convert.ToString(dr["MaritalStatus"]);
                    obj.StaffParentSummary.SpouseTitle = Convert.ToString(dr["SpouseTitle"]);
                    obj.StaffParentSummary.SpouseFirstName = Convert.ToString(dr["SpouseFirstName"]);
                    obj.StaffParentSummary.SpouseMiddleName = Convert.ToString(dr["SpouseMiddleName"]);
                    obj.StaffParentSummary.SpouseLastName = Convert.ToString(dr["SpouseLastName"]);
                    obj.StaffParentSummary.FatherTitle = Convert.ToString(dr["FatherTitle"]);
                    obj.StaffParentSummary.MotherTitle = Convert.ToString(dr["MotherTitle"]);
                }

                if (ds != null && ds.Tables.Count > 4 && ds.Tables[4].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[4].Rows[0];

                    obj.StaffCategorySummary.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.StaffCategorySummary.Nationality = Convert.ToString(dr["Nationality"]);
                    obj.StaffCategorySummary.IsMHDomiciled = Convert.ToString(dr["IsMHDomiciled"]);
                    obj.StaffCategorySummary.Religion = Convert.ToString(dr["Religion"]);
                    obj.StaffCategorySummary.CategoryID = Convert.ToInt16(dr["CategoryID"]);
                    obj.StaffCategorySummary.Category = Convert.ToString(dr["Category"]);
                    obj.StaffCategorySummary.Caste = Convert.ToString(dr["Caste"]);
                    obj.StaffCategorySummary.CasteCertificatePath = Convert.ToString(dr["CasteCertificatePath"]);
                    obj.StaffCategorySummary.IsBelongToNCL = Convert.ToString(dr["IsBelongToNCL"]);
                    obj.StaffCategorySummary.NCLCertificatePath = Convert.ToString(dr["NCLCertificatePath"]);
                    obj.StaffCategorySummary.IsBelongToPWD = Convert.ToString(dr["IsBelongToPWD"]);
                    obj.StaffCategorySummary.DisabilityPercentage = Convert.ToInt16(dr["DisabilityPercentage"]);
                    obj.StaffCategorySummary.Disability = Convert.ToString(dr["Disability"]);
                    obj.StaffCategorySummary.DisabilityType = Convert.ToString(dr["DisabilityType"]);
                    obj.StaffCategorySummary.UniqueDisabilityIDNo = Convert.ToString(dr["UniqueDisabilityIDNo"]);
                    obj.StaffCategorySummary.PWDCertificatePath = Convert.ToString(dr["PWDCertificatePath"]);
                }

                if (ds != null && ds.Tables.Count > 5 && ds.Tables[5].Rows.Count > 0)
                {
                    StaffQualificationSummaryEntity objQ;

                    foreach (DataRow dr in ds.Tables[5].Rows)
                    {
                        objQ = new StaffQualificationSummaryEntity();

                        objQ.QualificationRowID = Convert.ToInt64(dr["QualificationRowID"]);
                        objQ.StaffID = Convert.ToInt64(dr["StaffID"]);
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

                        obj.StaffQualificationSummaryList.Add(objQ);
                    }
                }

                if (ds != null && ds.Tables.Count > 6 && ds.Tables[6].Rows.Count > 0)
                {
                    StaffTrainingSummaryEntity objT;

                    foreach (DataRow dr in ds.Tables[6].Rows)
                    {
                        objT = new StaffTrainingSummaryEntity();

                        objT.TrainingRowID = Convert.ToInt64(dr["TrainingRowID"]);
                        objT.StaffID = Convert.ToInt64(dr["StaffID"]);
                        objT.Course = Convert.ToString(dr["Course"]);
                        objT.CourseConductedBy = Convert.ToString(dr["CourseConductedBy"]);
                        objT.FromDate = Convert.ToString(dr["FromDate"]);
                        objT.ToDate = Convert.ToString(dr["ToDate"]);
                        objT.CertificatePath = Convert.ToString(dr["CertificatePath"]);

                        obj.StaffTrainingSummaryList.Add(objT);
                    }
                }

                if (ds != null && ds.Tables.Count > 7 && ds.Tables[7].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[7].Rows[0];

                    obj.StaffAdditionalSummary.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.StaffAdditionalSummary.BloodGroup = Convert.ToString(dr["BloodGroup"]);
                    obj.StaffAdditionalSummary.MotherTongue = Convert.ToString(dr["MotherTongue"]);
                }

                if (ds != null && ds.Tables.Count > 8 && ds.Tables[8].Rows.Count > 0)
                {
                    StaffLanguageSummaryEntity objL;

                    foreach (DataRow dr in ds.Tables[8].Rows)
                    {
                        objL = new StaffLanguageSummaryEntity();

                        objL.LanguageRowID = Convert.ToInt64(dr["LanguageRowID"]);
                        objL.StaffID = Convert.ToInt64(dr["StaffID"]);
                        objL.Language = Convert.ToString(dr["Language"]);
                        objL.Read = Convert.ToString(dr["Read"]);
                        objL.Write = Convert.ToString(dr["Write"]);
                        objL.Speak = Convert.ToString(dr["Speak"]);

                        obj.StaffLanguageSummaryList.Add(objL);
                    }
                }

                if (ds != null && ds.Tables.Count > 9 && ds.Tables[9].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[9].Rows[0];

                    obj.StaffBankSummary.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.StaffBankSummary.AccountType = Convert.ToString(dr["AccountType"]);
                    obj.StaffBankSummary.AccountNo = Convert.ToString(dr["AccountNo"]);
                    obj.StaffBankSummary.AccountHolderName = Convert.ToString(dr["AccountHolderName"]);
                    obj.StaffBankSummary.IFSCCode = Convert.ToString(dr["IFSCCode"]);
                    obj.StaffBankSummary.BankName = Convert.ToString(dr["BankName"]);
                    obj.StaffBankSummary.BranchName = Convert.ToString(dr["BranchName"]);
                    obj.StaffBankSummary.PANNo = Convert.ToString(dr["PANNo"]);
                    obj.StaffBankSummary.PANPath = Convert.ToString(dr["PANPath"]);
                }

                if (ds != null && ds.Tables.Count > 10 && ds.Tables[10].Rows.Count > 0)
                {
                    StaffWorkExperienceSummaryEntity objA;

                    foreach (DataRow dr in ds.Tables[10].Rows)
                    {
                        objA = new StaffWorkExperienceSummaryEntity();

                        objA.WorkExperienceRowID = Convert.ToInt64(dr["WorkExperienceRowID"]);
                        objA.StaffID = Convert.ToInt64(dr["StaffID"]);
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

                        obj.StaffWorkExperienceSummaryList.Add(objA);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffSummary", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }
        public string LockStaffForm(StaffFormLockEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.LockStaffForm(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "LockStaffForm", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string UnlockStaffForm(StaffFormUnlockEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.UnlockStaffForm(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UnlockStaffForm", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataTable GetEligibilityFlagForUnlockStaffForm(long StaffID, string UserLoginID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetEligibilityFlagForUnlockStaffForm(StaffID, UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetEligibilityFlagForUnlockStaffForm", StaffID.ToString());
                throw ex;
            }
            return dt;
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
