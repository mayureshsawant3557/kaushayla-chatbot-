
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using static System.Net.Mime.MediaTypeNames;
using System.Security.Policy;
using System.Net;

using Portal.Entities.Base;
using Portal.Business.Interface.Admission;
using Portal.Data;
using Portal.Business.Worker.Utility;
using Portal.Entities.Admission;
using Portal.Entities.Candidate;

namespace Portal.Business.Worker.Admission
{
	public class AdmissionWorker : IAdmission
	{
		//Repository objData = new Repository();

		private readonly Repository objData;

		//Inject Repository via Constructor 
		public AdmissionWorker(Repository repository)
		{
			objData = repository ?? throw new ArgumentNullException(nameof(repository));
		}

		public List<DropdownEntity> GetRoundList(int UserTypeID, string Flag, string UserLoginID = "")
		{
			List<DropdownEntity> objList = new List<DropdownEntity>();
			try
			{
				DataTable dt = objData.GetRoundList(UserTypeID, Flag, UserLoginID);
				objList = DataTableToList(dt, true);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetRoundList");
				throw ex;
			}
			return objList;
		}
		public short GetCurrentRoundID()
		{
			short retVal = 0;
			try
			{
				retVal = objData.GetCurrentRoundID();
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetCurrentRoundID");
				throw ex;
			}
			return retVal;
		}
		public DataTable GetMeritStatus(short RoundID, string MeritType, long CandidateID)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetMeritStatus(RoundID, MeritType, CandidateID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetMeritStatus", CandidateID.ToString());
				throw ex;
			}
			return dt;
		}
		public DataTable GetAllotmentStatus(short RoundID, long CandidateID)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetAllotmentStatus(RoundID, CandidateID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetAllotmentStatus", CandidateID.ToString());
				throw ex;
			}
			return dt;
		}
		public DataTable GetAllotmentStatusApi(short RoundID, long CandidateID)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetAllotmentStatusApi(RoundID, CandidateID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetAllotmentStatusApi", CandidateID.ToString());
				throw ex;
			}
			return dt;
		}
		public string SaveConsentForAdmission(short RoundID, long CandidateID, long ChoiceCode, string UserLoginID, string IPAddress)
		{
			string retVal = "";
			try
			{
				retVal = objData.SaveConsentForAdmission(RoundID, CandidateID, ChoiceCode, UserLoginID, IPAddress);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "SaveConsentForAdmission", UserLoginID);
				retVal = ex.Message;
			}
			return retVal;
		}
		public DataTable GetAllotmentSummary(long CandidateID, string EncryptedCandidateID)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetAllotmentSummary(CandidateID, EncryptedCandidateID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetAllotmentSummary", CandidateID.ToString());
				throw ex;
			}
			return dt;
		}
		public DataTable GetReportingDetails(long CandidateID, long ApplicationID, string EncryptedApplicationID, short RoundID, string ReportingStatus, string UserLoginID, string Flag)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetReportingDetails(CandidateID, ApplicationID, EncryptedApplicationID, RoundID, ReportingStatus, UserLoginID, Flag);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetReportingDetails", CandidateID.ToString());
				throw ex;
			}
			return dt;
		}
		public AdmissionSummaryEntity GetAdmissionSummary(long CandidateID, long ApplicationID, long CourseID, long CollegeID, short RoundID, string UserLoginID, string ReportingStatus, string Flag)
		{
			AdmissionSummaryEntity obj = new AdmissionSummaryEntity();
			try
			{
				DataSet ds = objData.GetAdmissionSummary(CandidateID, ApplicationID, CourseID, CollegeID, RoundID, UserLoginID, ReportingStatus, Flag);

				if (ds != null)
				{
					if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
					{
						DataRow dr = ds.Tables[0].Rows[0];

						obj.CandidatePrimarySummary.ApplicationID = dr["ApplicationID"].ToString();
						obj.CandidatePrimarySummary.ProfileID = dr["ProfileID"].ToString();
						obj.CandidatePrimarySummary.CandidateID = Convert.ToInt64(dr["CandidateID"]);
						obj.CandidatePrimarySummary.ITIRegistrationNo = Convert.ToString(dr["ITIRegistrationNo"]);
						obj.CandidatePrimarySummary.FirstName = Convert.ToString(dr["FirstName"]);
						obj.CandidatePrimarySummary.MiddleName = Convert.ToString(dr["MiddleName"]);
						obj.CandidatePrimarySummary.LastName = Convert.ToString(dr["LastName"]);
						obj.CandidatePrimarySummary.PhotoFilePath = Convert.ToString(dr["PhotoFilePath"]);
						obj.CandidatePrimarySummary.SignFilePath = Convert.ToString(dr["SignFilePath"]);
						obj.CandidatePrimarySummary.Gender = Convert.ToString(dr["Gender"]);
						obj.CandidatePrimarySummary.DOB = dr["DOB"].ToString();
						obj.CandidatePrimarySummary.DOBFilePath = Convert.ToString(dr["DOBFilePath"]);
						obj.CandidatePrimarySummary.AadhaarNo = Convert.ToString(dr["AadhaarNo"]);
						obj.CandidatePrimarySummary.AadhaarFilePath = Convert.ToString(dr["AadhaarFilePath"]);
						obj.CandidatePrimarySummary.MobileNo = Convert.ToString(dr["MobileNo"]);
						obj.CandidatePrimarySummary.AltMobileNo = Convert.ToString(dr["AltMobileNo"]);
						obj.CandidatePrimarySummary.EMailID = Convert.ToString(dr["EMailID"]);
					}

					if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
					{
						DataRow dr = ds.Tables[1].Rows[0];

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

					if (ds.Tables.Count > 2 && ds.Tables[2].Rows.Count > 0)
					{

						CandidateQualificationSummaryEntity objQ;

						foreach (DataRow dr in ds.Tables[2].Rows)
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

					if (ds != null && ds.Tables.Count > 3 && ds.Tables[3].Rows.Count > 0)
					{
						CandidateTrainingSummaryEntity objT;

						foreach (DataRow dr in ds.Tables[3].Rows)
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
					if (ds != null && ds.Tables.Count > 4 && ds.Tables[4].Rows.Count > 0)
					{
						CandidateWorkExperienceSummaryEntity objA;

						foreach (DataRow dr in ds.Tables[4].Rows)
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



					if (ds.Tables.Count > 5 && ds.Tables[5].Rows.Count > 0)
					{
						DataRow dr = ds.Tables[5].Rows[0];

						obj.AllotmentSummary.CandidateID = Convert.ToInt64(dr["CandidateID"]);
						//obj.AllotmentSummary.Round = dr["Round"].ToString();
						//obj.AllotmentSummary.MeritNo = dr["MeritNo"].ToString();
						//obj.AllotmentSummary.MeritMarks = dr["MeritMarks"].ToString();
						//obj.AllotmentSummary.EligibleCategory = dr["EligibleCategory"].ToString();
						//obj.AllotmentSummary.EligibleSocialReservation = dr["EligibleSocialReservation"].ToString();
						obj.AllotmentSummary.AllottedChoiceCode = dr["AllottedChoiceCode"].ToString();
						//obj.AllotmentSummary.AllottedChoiceCodeDisplay = dr["AllottedChoiceCodeDisplay"].ToString();
						obj.AllotmentSummary.AllottedCollege = dr["AllottedCollege"].ToString();
						//obj.AllotmentSummary.AllottedStream = dr["AllottedStream"].ToString();
						//obj.AllotmentSummary.AllottedStatus = dr["AllottedStatus"].ToString();
						//obj.AllotmentSummary.AllottedMedium = dr["AllottedMedium"].ToString();
						//obj.AllotmentSummary.AllottedPreferenceNo = dr["AllottedPreferenceNo"].ToString();
						//obj.AllotmentSummary.AllottedType = dr["AllottedType"].ToString();
						obj.AllotmentSummary.AllotmentDate = dr["AllotmentDate"].ToString();
						//obj.AllotmentSummary.IsConsentGiven = dr["IsConsentGiven"].ToString();
						//obj.AllotmentSummary.ConsentGivenDateTime = dr["ConsentGivenDateTime"].ToString();
						obj.AllotmentSummary.ReasonForRejection = dr["ReasonForRejection"].ToString();
						obj.AllotmentSummary.RejectionComments = dr["RejectionComments"].ToString();
						//obj.AllotmentSummary.RejectedDateTime = dr["RejectedDateTime"].ToString();
                        obj.AllotmentSummary.AdmissionDate = dr["AdmissionDate"].ToString();
						obj.AllotmentSummary.AdmissionComments = dr["AdmissionComments"].ToString();
						obj.AllotmentSummary.ReportingStatus = dr["ReportingStatus"].ToString();
						obj.AllotmentSummary.ReportedDateTime = dr["ReportedDateTime"].ToString();
						obj.AllotmentSummary.ReportedBy = dr["ReportedBy"].ToString();
						obj.AllotmentSummary.ReportedByIPAddress = dr["ReportedByIPAddress"].ToString();
						obj.AllotmentSummary.CancellationComments = dr["CancellationComments"].ToString();
						obj.AllotmentSummary.CancelledDateTime = dr["CancelledDateTime"].ToString();
						obj.AllotmentSummary.CancelledBy = dr["CancelledBy"].ToString();
						obj.AllotmentSummary.CancelledByIPAddress = dr["CancelledByIPAddress"].ToString();
						obj.AllotmentSummary.CourseID = Convert.ToInt64(dr["CourseID"]);
						obj.AllotmentSummary.CourseFee = Convert.ToString(dr["CourseFee"]);
						obj.AllotmentSummary.PaidCourseFee = Convert.ToString(dr["PaidCourseFee"]);
						obj.AllotmentSummary.RefundFee = Convert.ToString(dr["RefundFee"]);
						obj.AllotmentSummary.CourseStartDate = dr["CourseStartDate"].ToString();
						obj.AllotmentSummary.UnitNo = dr["NoOfUnit"] is DBNull ? Convert.ToInt16(0) : Convert.ToInt16(dr["NoOfUnit"]);
						obj.AllotmentSummary.Intake = dr["Intake"] is DBNull ? Convert.ToInt16(0) : Convert.ToInt32(dr["Intake"]);
						obj.AllotmentSummary.ShiftNo = dr["ShiftNo"] is DBNull ? Convert.ToInt16(0) : Convert.ToInt16(dr["ShiftNo"]);

					}

					if (ds != null && ds.Tables.Count > 6 && ds.Tables[6].Rows.Count > 0)
					{
						RequiredDocumentSummaryEntity objT;

						foreach (DataRow dr in ds.Tables[6].Rows)
						{
							objT = new RequiredDocumentSummaryEntity();
							objT.DocumentID = Convert.ToInt16(dr["DocumentID"]);
							objT.ID = Convert.ToInt64(dr["ID"]);
							objT.DocumentName = Convert.ToString(dr["DocumentName"]);
							objT.Course = Convert.ToString(dr["Course"]);
							objT.Degree = Convert.ToString(dr["Degree"]);
							objT.IsDocumentCompulsory = Convert.ToBoolean(dr["IsDocumentCompulsory"]);
							objT.CandidateID = Convert.ToInt64(dr["CandidateID"]);
							objT.DocumentUrl = Convert.ToString(dr["DocumentUrl"]);
							objT.InstituteVerificationStatus = Convert.ToString(dr["InstituteVerificationStatus"]);
							objT.InstituteDateTime = Convert.ToString(dr["InstituteDateTime"]);
							objT.InstituteCreatedBy = Convert.ToString(dr["InstituteCreatedBy"]);
							objT.DirectorVerificationStatus = Convert.ToString(dr["DirectorVerificationStatus"]);
							objT.InstituteDateTime = Convert.ToString(dr["InstituteDateTime"]);
							objT.DirectorCreatedBy = Convert.ToString(dr["DirectorCreatedBy"]);
							objT.DocumentVerificationStatus = Convert.ToString(dr["DocumentVerificationStatus"]);
							objT.DocumentVerificationDate = Convert.ToString(dr["DocumentVerificationDate"]);
							objT.IsOrignalDocumentSubmitted = Convert.ToString(dr["IsOrignalSubmitted"]);
							objT.IsOrignalSubmittedReturn = Convert.ToString(dr["IsOrignalSubmittedReturn"]);
							objT.ReturnDateTime = Convert.ToString(dr["ReturnDateTime"]);
							//objT.ReturnBy = Convert.ToString(dr["ReturnBy"]);
							objT.InstituteVerificationStatusDisplay = Convert.ToString(dr["InstituteVerificationStatusDisplay"]);
							objT.DirectorVerificationStatusDisplay = Convert.ToString(dr["DirectorVerificationStatusDisplay"]);
							objT.IsOrignalSubmittedDisplay = Convert.ToString(dr["IsOrignalSubmittedDisplay"]);
							objT.IsOrignalSubmittedReturnDisplay = Convert.ToString(dr["IsOrignalSubmittedReturnDisplay"]);
							obj.ListRequiredDocumentSummary.Add(objT);
						}
					}
                    // Candidate Required Fields Validation
                    if (Flag == "ConfirmAdmission" && ds != null && ds.Tables.Count > 7 && ds.Tables[7].Rows.Count > 0)
                    {
                        DataRow dr = ds.Tables[7].Rows[0];

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
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetAdmissionSummary", CandidateID.ToString());
				throw ex;
			}
			return obj;
		}
		public string ConfirmAdmission(long CandidateID, long ApplicationID, long CourseID, long CollegeID, short RoundID, string xmldoc, string AdmissionComments, string ReportedBy, string ReportedByIPAddress,
			double CourseFee, double CourseFeePay, DateTime StartCourseDate, short UnitNo, short ShiftID, long BatchID)
		{
			string retVal = "";
			try
			{
				retVal = objData.ConfirmAdmission(CandidateID, ApplicationID, CourseID, CollegeID, RoundID, xmldoc, AdmissionComments, ReportedBy, ReportedByIPAddress, CourseFee, CourseFeePay, StartCourseDate, UnitNo, ShiftID, BatchID);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "ConfirmAdmission", CandidateID.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}
		public string RejectAdmission(long CandidateID, long ApplicationID, long CourseID, long CollegeID, short RoundID, string XMLString, string RejectionComments, string RejectedBy, string RejectedByIPAddress, string ReasonForRejection)
		{
			string retVal = "";
			try
			{
				retVal = objData.RejectAdmission(CandidateID, ApplicationID, CourseID, CollegeID, RoundID, XMLString, RejectionComments, RejectedBy, RejectedByIPAddress, ReasonForRejection);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "RejectAdmission", CandidateID.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}
		public string CancelAdmission(long CandidateID, long ApplicationID, long CourseID, long CollegeID, short RoundID, string XMLString, string CancellationComments, double RefundFee, string CancelledBy, string CancelledByIPAddress)
		{
			string retVal = "";
			try
			{
				retVal = objData.CancelAdmission(CandidateID, ApplicationID, CourseID, CollegeID, RoundID, XMLString, CancellationComments, RefundFee, CancelledBy, CancelledByIPAddress);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "CancelAdmission", CandidateID.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}
		public string GetAdmissionDetails(long CandidateID)
		{
			string retVal = "";
			try
			{
				retVal = objData.GetAdmissionDetails(CandidateID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetAdmissionDetails");
				throw ex;
			}
			return retVal;
		}
		public List<RequiredDocumentEntity> GetOptionalDocuments(long CandidateID)
		{
			List<RequiredDocumentEntity> listRequiredDocuments = new List<RequiredDocumentEntity>();
			try
			{
				DataTable dt = objData.GetOptionalDocuments(CandidateID);

				if (dt != null && dt.Rows.Count > 0)
				{
					foreach (DataRow dr in dt.Rows)
					{
						RequiredDocumentEntity obj = new RequiredDocumentEntity();

						obj.CandidateID = Convert.ToInt64(dr["CandidateID"]);
						obj.DocumentID = Convert.ToInt16(dr["DocumentID"]);
						obj.DocumentName = dr["DocumentName"].ToString();
						obj.DocumentUploadedURL = Convert.ToString(dr["DocumentUploadedURL"]);
						obj.CCStatus = Convert.ToString(dr["CCStatus"]);
						obj.NCLStatus = Convert.ToString(dr["NCLStatus"]);
						obj.IsCompulsory = Convert.ToBoolean(dr["IsCompulsory"]);
						obj.IsVerified = Convert.ToBoolean(dr["IsVerified"]);

						listRequiredDocuments.Add(obj);
					}
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetOptionalDocuments", CandidateID.ToString());
				throw ex;
			}
			return listRequiredDocuments;
		}
		public string SaveOptionalDocumentUploadStatus(long CandidateID, int DocumentID, string DocumentUploadedURL, int TrainingRowID, int QualificationRowID, string UserLoginID, string IPAddress)
		{
			bool result = false;
			string retVal = "";
			try
			{
				objData.SaveOptionalDocumentUploadStatus(CandidateID, DocumentID, DocumentUploadedURL, TrainingRowID, QualificationRowID, UserLoginID, IPAddress, "", out result);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "SaveOptionalDocumentUploadStatus", UserLoginID);
				retVal = ex.Message;
			}
			return retVal;
		}
		public List<DropdownEntity> GetMasterCollege(short ZoneID, short AreaID)
		{
			List<DropdownEntity> objList = new List<DropdownEntity>();
			try
			{
				DataTable dt = objData.GetMasterCollege(ZoneID, AreaID);
				objList = DataTableToList(dt, true);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetMasterCollege");
				throw ex;
			}
			return objList;
		}
		public DataSet GetCutOff(string ChoiceCode, string RoundID)
		{
			DataSet ds = new DataSet();
			try
			{
				ds = objData.GetCutOff(ChoiceCode, RoundID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetCutOff", ChoiceCode);
				throw ex;
			}
			return ds;
		}
		public DataSet GetReasonForNotAllotted(short RoundID, long CandidateID)
		{
			DataSet ds = new DataSet();
			try
			{
				ds = objData.GetReasonForNotAllotted(RoundID, CandidateID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetReasonForNotAllotted", CandidateID.ToString());
				throw ex;
			}
			return ds;
		}
		public string UndoConsentForAdmission(short RoundID, long CandidateID, long ChoiceCode, string UserLoginID, string IPAddress)
		{
			string retVal = "";
			try
			{
				retVal = objData.UndoConsentForAdmission(RoundID, CandidateID, ChoiceCode, UserLoginID, IPAddress);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "UndoConsentForAdmission", UserLoginID);
				retVal = ex.Message;
			}
			return retVal;
		}
		public DataTable GetVacancy(long CourseID, long CollegeID, short UnitNo, short Shift)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetVacancy(CourseID, CollegeID, UnitNo, Shift);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetVacancy", CourseID.ToString() + " : " + CollegeID.ToString());
				throw ex;
			}
			return dt;
		}
		public string SendRequestForForcedAdmissionCancellation(long CandidateID, long ChoiceCode, short RoundID, short QuotaID, string ReasonForCancellation, string CancellationRequestedBy, string CancellationRequestedByIPAddress)
		{
			string retVal = "";
			try
			{
				retVal = objData.SendRequestForForcedAdmissionCancellation(CandidateID, ChoiceCode, RoundID, QuotaID, ReasonForCancellation, CancellationRequestedBy, CancellationRequestedByIPAddress);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "SendRequestForForcedAdmissionCancellation", CandidateID.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}
		public DataTable GetRequestedForForcedAdmissionCancellationList()
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetRequestedForForcedAdmissionCancellationList();
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetRequestedForForcedAdmissionCancellationList");
				throw ex;
			}
			return dt;
		}
		public DataSet GetCutOffPreviousYear(string ChoiceCode, string RoundID)
		{
			DataSet ds = new DataSet();
			try
			{
				ds = objData.GetCutOffPreviousYear(ChoiceCode, RoundID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetCutOffPreviousYear", ChoiceCode);
				throw ex;
			}
			return ds;
		}
		public bool IsAllotted27211008404(long CandidateID)
		{
			bool retVal = false;
			try
			{
				retVal = objData.IsAllotted27211008404(CandidateID);

			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "IsAllotted27211008404");
				throw ex;
			}
			return retVal;
		}
		public string SaveConsentFor27211008404(long CandidateID, string SeatAcceptanceStatus, string UserLoginID, string IPAddress)
		{
			string retVal = "";
			try
			{
				retVal = objData.SaveConsentFor27211008404(CandidateID, SeatAcceptanceStatus, UserLoginID, IPAddress);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "SaveConsentFor27211008404", UserLoginID);
				retVal = ex.Message;
			}
			return retVal;
		}

		public List<DropdownEntity> DataTableToList(DataTable table, bool hasSelect)
		{
			var list = new List<DropdownEntity>(table.Rows.Count);
			DropdownEntity ddl;

			if (hasSelect)
			{
				ddl = new DropdownEntity()
				{
					Value = "-1",
					Text = "Select",
					Group = "-1"
				};
				list.Add(ddl);
			}
			if (table != null && table.Rows.Count > 0)
			{
				foreach (DataRow row in table.Rows)
				{
					var values = row.ItemArray;
					ddl = new DropdownEntity()
					{
						Value = values[0].ToString(),
						Text = values[1].ToString(),
						Group = values[2].ToString()
					};
					list.Add(ddl);
				}
			}
			return list;
		}
		public DataSet GetAdmissionSummaryForPDF(long CandidateID, long ApplicationID, long CourseID, long CollegeID, short RoundID, string UserLoginID, string ReportingStatus, string Flag)
		{
			DataSet ds = new DataSet();
			try
			{
				ds = objData.GetAdmissionSummary(CandidateID, ApplicationID, CourseID, CollegeID, RoundID, UserLoginID, ReportingStatus, Flag);

				if (ds != null)
				{
					return ds;
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetAdmissionSummary", CandidateID.ToString());
				throw ex;
			}
			return ds;
		}
		public DataTable GetReportingDetailsByInstituteID(long InstituteID, string Flag)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetReportingDetailsByInstituteID(InstituteID, Flag);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetReportingDetails", InstituteID.ToString());
				throw ex;
			}
			return dt;
		}
		public List<DropdownEntity> GetCollegeCourseUnitMaster(long CourseID, long CollegeID)
		{
			List<DropdownEntity> objList = new List<DropdownEntity>();
			try
			{
				DataTable dt = objData.GetCollegeCourseUnitMaster(CourseID, CollegeID);
				objList = DataTableToList(dt, true);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetCollegeCourseUnitMaster" + CourseID.ToString() + " : " + CollegeID.ToString());
				throw ex;
			}
			return objList;
		}
		public List<DropdownEntity> GetCollegeCourseShiftMaster(long CourseID, long CollegeID)
		{
			List<DropdownEntity> objList = new List<DropdownEntity>();
			try
			{
				DataTable dt = objData.GetCollegeCourseShiftMaster(CourseID, CollegeID);
				objList = DataTableToList(dt, true);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetCollegeCourseShiftMaster" + CourseID.ToString() + " : " + CollegeID.ToString());
				throw ex;
			}
			return objList;
		}

		public DataTable GetCourseByCollogeID(long CollegeID, int admissionYearID, string flag = "A")
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetCourseByCollogeID(CollegeID, admissionYearID,flag);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetCourseByCollogeID" + CollegeID.ToString() + admissionYearID.ToString());
				throw ex;
			}
			return dt;
		}

		public string GetAdmissionApplicationStatus(long ApplicationID, long CollegeID, int userTypeID)
		{
			string retVal = "";
			try
			{
				retVal = objData.GetAdmissionApplicationStatus(ApplicationID, CollegeID, userTypeID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetAdmissionApplicationStatus", ApplicationID.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}

		public DataTable GetPendingCandidateSendForDEVTO(long CourseID, long CollegeID, int AdmissionYearID)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetPendingCandidateSendForDEVTO(CourseID, CollegeID, AdmissionYearID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetPendingCandidateSendForDEVTO", CollegeID.ToString());
				throw ex;
			}
			return dt;
		}
		public DataTable GetRejectedCandidatebyDEVTO(long CourseID, long CollegeID, int AdmissionYearID)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetRejectedCandidatebyDEVTO(CourseID, CollegeID, AdmissionYearID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetRejectedCandidatebyDEVTO", CollegeID.ToString());
				throw ex;
			}
			return dt;
		}
		public string SaveCandidateSendForDEVTOStatus(string xmldoc, string UserLoginID, string IPAddress)
		{
			string retVal = "";
			try
			{
				retVal = objData.SaveCandidateSendForDEVTOStatus(UserLoginID, IPAddress, xmldoc);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "SaveCandidateSendForDEVTOStatus", UserLoginID.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}
		public string SaveCandidateSendForDEVTOStatusRecall(string xmldoc, string UserLoginID, string IPAddress)
		{
			string retVal = "";
			try
			{
				retVal = objData.SaveCandidateSendForDEVTOStatusRecall(UserLoginID, IPAddress, xmldoc);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "SaveCandidateSendForDEVTOStatusRecall", UserLoginID.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}
		public DataTable GetPendingCandidateSendForDEVTOApproval(long CourseID, long CollegeID, int AdmissionYearID, int RegionID, int UserTypeID)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetPendingCandidateSendForDEVTOApproval(CourseID, CollegeID, AdmissionYearID, RegionID, UserTypeID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetPendingCandidateSendForDEVTOApproval", CollegeID.ToString() + "RegionID : " + RegionID.ToString());
				throw ex;
			}
			return dt;
		}
		//public DataTable CandidateListForDVETOApproved(long CourseID, long CollegeID, int AdmissionYearID, int RegionID, int UserTypeID, int BatchTypeID)
		//{
		//    DataTable dt = new DataTable();
		//    try
		//    {
		//        dt = objData.CandidateListForDVETOApproved(CourseID, CollegeID, AdmissionYearID, RegionID, UserTypeID, BatchTypeID);
		//    }
		//    catch (Exception ex)
		//    {
		//        CommonHelper.SaveException(ex.Message, "CandidateListForDVETOApproved", CollegeID.ToString() + "RegionID : " + RegionID.ToString());
		//        throw ex;
		//    }
		//    return dt;
		//}
		public string SaveCandidateDEVTOStatus(string UserLoginID, string IPAddress, string xmldoc)
		{
			string retVal = "";
			try
			{
				retVal = objData.SaveCandidateDEVTOStatus(UserLoginID, IPAddress, xmldoc);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "SaveCandidateDEVTOStatus", UserLoginID.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}

		public DataTable GetBatch(long CourseID, long CollegeID)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetBatch(CourseID, CollegeID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetBatch", CollegeID.ToString() + "CourseID : " + CourseID.ToString());
				throw ex;
			}
			return dt;
		}
		public DataTable GetCollegeCourseBatchDetailsByBatchID(long CourseID, long CollegeID, long BatchID)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetCollegeCourseBatchDetailsByBatchID(CourseID, CollegeID, BatchID);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetCollegeCourseBatchDetailsByBatchID", CollegeID.ToString() + "BatchID : " + BatchID.ToString());
				throw ex;
			}
			return dt;
		}
		public bool IsAdmissionLastDateOver(long CourseID, long CollegeID)
		{
			bool retVal = false;
			try
			{
				retVal = objData.IsAdmissionLastDateOver(CourseID, CollegeID);

			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "IsAdmissionLastDateOver");
				throw ex;
			}
			return retVal;
		}

		public string TransferBatch(string UserLoginID, string IPAddress, string xmldoc)
		{
			string retVal = "";
			try
			{
				retVal = objData.TransferBatch(UserLoginID, IPAddress, xmldoc);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "TransferBatch", UserLoginID.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}

		public string SaveAcadmisthanRegistration(AcadmisthanStudentEntity acadmisthanStudent)
		{
			string retVal = "";
			try
			{
				retVal = objData.SaveAcadmisthanRegistration(acadmisthanStudent);
				if (retVal.ToUpper() == "N")
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "SaveAcadmisthanRegistration", acadmisthanStudent.Username.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}
		public DataTable GetAcadmisthanRegistration(AcadmisthanStudentEntity acadmisthanStudent)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetAcadmisthanRegistration(acadmisthanStudent);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetAcadmisthanRegistration", "ApplicationID: " + acadmisthanStudent.ApplicationID.ToString() + " CandidateID : " + acadmisthanStudent.CandidateID.ToString());
				throw ex;
			}
			return dt;
		}

		public string AcadmisthanInsertCourseMapping(AcadmisthanStudentEntity entity)
		{
			string retVal = "";
			try
			{
				retVal = objData.AcadmisthanInsertCourseMapping(entity).ToString();
				if (retVal == null)
				{
					retVal = "Data has not been saved. Please try again.";
				}
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "AcadmisthanInsertCourseMapping", entity.Username.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}
		public bool UpdateCourseMapping(AcadmisthanStudentEntity entity)
		{
			bool retVal = false;
			try
			{
				retVal = objData.UpdateCourseMapping(entity);

			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "UpdateCourseMapping");
				throw ex;
			}
			return retVal;
		}
		public AcadmisthanStudentEntity GetByCandidateIDCourseMappings(long candidateID)
		{
			AcadmisthanStudentEntity entity = new AcadmisthanStudentEntity();
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetByCandidateIDCourseMappings(candidateID);
				if (dt.Rows.Count > 0)
					entity = MapAcadmisthanStudentToEntity(dt.Rows[0]);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetByCandidateIDCourseMappings", " CandidateID : " + candidateID.ToString());
				throw ex;
			}
			return entity;
		}
		private AcadmisthanStudentEntity MapAcadmisthanStudentToEntity(DataRow row)
		{
			return new AcadmisthanStudentEntity
			{
				ID = row.Field<Int64>("ID"),
				CandidateID = row.Field<Int64?>("CandidateID") ?? 0,
				ApplicationID = row.Field<Int64?>("ApplicationID") ?? 0,
				UserID = row.Field<Int64?>("UserID") ?? 0,
				CourseID = row.Field<int?>("CourseID") ?? 0,
				LoginURL = row.Field<string>("LoginURL"),
				Enrolled = row.Field<int?>("Enrolled") ?? 0,
				CreatedBy = row.Field<string>("CreatedBy"),
				MSBVCourseID = row.Field<Int64?>("MSBVCourseID") ?? 0,
				Email = row.Field<string>("Email"),
				Firstname = row.Field<string>("Firstname"),
				Lastname = row.Field<string>("Lastname"),
				Username = row.Field<string>("Username"),
				TempPassword = row.Field<string>("TempPassword"),
				UniqueId = row.Field<string>("UniqueId"),
				Institution = row.Field<string>("Institution"),
				Department = row.Field<string>("Department"),
				WantsUrl = row.Field<string>("WantsUrl"),
				Mode = row.Field<string>("Mode"),
				Enrol = row.Field<string>("Enrol")
			};
		}



		//BCLS--
		public string SaveBCLSRegistration(AcadmisthanStudentEntity acadmisthanStudent)
		{
			string retVal = "";
			try
			{
				retVal = objData.SaveBCLSRegistration(acadmisthanStudent);
				if (retVal.ToUpper() == "N")
				{

					retVal = "Data has not been saved. Please try again.";
				}

			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "SaveBCLSRegistration", acadmisthanStudent.Username.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}
		public DataTable GetBCLSRegistration(AcadmisthanStudentEntity acadmisthanStudent)
		{
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetBCLSRegistration(acadmisthanStudent);
			}
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetBCLSRegistration", "ApplicationID: " + acadmisthanStudent.ApplicationID.ToString() + " CandidateID : " + acadmisthanStudent.CandidateID.ToString());
				throw ex;
			}
			return dt;
		}
		public string BCLSInsertCourseMapping(AcadmisthanStudentEntity acadmisthanStudent)
		{
			string retVal = "";
			try
			{
				retVal = objData.BCLSInsertCourseMapping(acadmisthanStudent).ToString();
				if(retVal == null)
				{
					retVal = "Data has not been saved. Please try again.";

                }
            }
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "BCLSInsertCourseMapping", acadmisthanStudent.Username.ToString());
				retVal = ex.Message;
			}
			return retVal;
		}
		public bool UpdateBCLSCourseMapping(AcadmisthanStudentEntity acadmisthanStudent)
		{
			bool retVal = false;
			try
			{
				retVal = objData.UpdateBCLSCourseMapping(acadmisthanStudent);
            }
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "UpdateBCLSCourseMapping");
				throw ex;
			}
			return retVal;
		}
		public AcadmisthanStudentEntity GetBCLSByCandidateIDCourseMappings(long candidateID)
		{
            AcadmisthanStudentEntity acadmisthanStudent = new AcadmisthanStudentEntity();
			DataTable dt = new DataTable();
			try
			{
				dt = objData.GetBCLSByCandidateIDCourseMappings(candidateID);
				if(dt.Rows.Count > 0)
				{
                    acadmisthanStudent = MapAcadmisthanStudentToEntity(dt.Rows[0]);
                }
            }
			catch (Exception ex)
			{
				CommonHelper.SaveException(ex.Message, "GetByCandidateIDCourseMapping", " CandidateID : " + candidateID.ToString());
				throw ex;
			}
			return acadmisthanStudent;
		}
        //private BCLSStudentEntity MapBCLSStudentToEntity(DataRow row)
        //{
        //    return new BCLSStudentEntity
        //    {
        //        ID = row.Field<Int64>("ID"),
        //        CandidateID = row.Field<Int64?>("CandidateID") ?? 0,
        //        ApplicationID = row.Field<Int64?>("ApplicationID") ?? 0,
        //        UserID = row.Field<Int64?>("UserID") ?? 0,
        //        CourseID = row.Field<int?>("CourseID") ?? 0,
        //        LoginURL = row.Field<string>("LoginURL"),
        //        Enrolled = row.Field<int?>("Enrolled") ?? 0,
        //        CreatedBy = row.Field<string>("CreatedBy"),
        //        MSBVCourseID = row.Field<Int64?>("MSBVCourseID") ?? 0,
        //        Email = row.Field<string>("Email"),
        //        Firstname = row.Field<string>("Firstname"),
        //        Lastname = row.Field<string>("Lastname"),
        //        Username = row.Field<string>("Username"),
        //        TempPassword = row.Field<string>("TempPassword"),
        //        UniqueId = row.Field<string>("UniqueId"),
        //        Institution = row.Field<string>("Institution"),
        //        Department = row.Field<string>("Department"),
        //        WantsUrl = row.Field<string>("WantsUrl"),
        //        Mode = row.Field<string>("Mode"),
        //        Enrol = row.Field<string>("Enrol")
        //    };
        //}

    }
}
