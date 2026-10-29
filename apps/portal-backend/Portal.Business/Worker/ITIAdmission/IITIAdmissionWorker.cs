
using Portal.Business.Interface.ITIAdmission;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.ITIAdmission;
using System;
using System.Data;
using System.Threading.Tasks;

namespace Portal.Business.Worker.ITIAdmission
{
    public class IITIAdmissionWorker : IITIAdmission
    {
        private readonly Repository _repository;

        // Constructor Injection for Dependency Injection
        public IITIAdmissionWorker(Repository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public ITIAdmissionEntity GetIITIAdmissionData(string ITIRegistrationNo, string ITIFirstName, string ITIDOBITI)
        {
            ITIAdmissionEntity obj = new ITIAdmissionEntity();
            try
            {
                DataTable dt = _repository.GetIITIAdmissionData(ITIRegistrationNo, ITIFirstName, ITIDOBITI);
                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    obj.RegistrationNumber = (Convert.ToString(dr["RegistrationNumber"]));
                    obj.CandidateFirstName = (Convert.ToString(dr["CandidateFirstName"]));
                    obj.CandidateLastName = (Convert.ToString(dr["CandidateLastName"]));
                    obj.GenderCode = (Convert.ToString(dr["GenderCode"]));
                    obj.DateOfBirth = (DateTime)(dr["DateOfBirth"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dr["DateOfBirth"]));
                    obj.PrimaryMobileNo = (Convert.ToString(dr["PrimaryMobileNo"]));
                    obj.SecondaryMobileNo = (Convert.ToString(dr["SecondaryMobileNo"]));
                    obj.Email = (Convert.ToString(dr["Email"]));
                    obj.FatherName = (Convert.ToString(dr["FatherName"]));

                    obj.ITIName = (Convert.ToString(dr["ITIName"]));
                    obj.DVETInstituteCode = (Convert.ToString(dr["DVETInstituteCode"]));
                    obj.TradeName = (Convert.ToString(dr["TradeName"]));
                    obj.TradeCode = (Convert.ToString(dr["TradeCode"]));
                    obj.AdmissionYear = (Convert.ToString(dr["AdmissionYear"]));

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, nameof(GetIITIAdmissionData), ITIRegistrationNo);
                throw;
            }
            return obj;
        }
        public ITIAdmissionEntity GetMSBVAdmissionData(string ApplicationID, string FirstName, string DOB)
        {
            ITIAdmissionEntity obj = new ITIAdmissionEntity();
            try
            {
                DataTable dt = _repository.GetMSBVAdmissionData(ApplicationID, FirstName, DOB);
                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    obj.RegistrationNumber = (Convert.ToString(dr["ApplicationID"]));
                    obj.CandidateFirstName = (Convert.ToString(dr["FirstName"]));
                    obj.CandidateMiddleName = (Convert.ToString(dr["MiddleName"]));
                    obj.CandidateLastName = (Convert.ToString(dr["LastName"]));
                    obj.GenderCode = (Convert.ToString(dr["GenderCode"]));
                    obj.DateOfBirth = (DateTime)(dr["DOB"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dr["DOB"]));
                    obj.PrimaryMobileNo = (Convert.ToString(dr["MobileNo"]));
                    obj.SecondaryMobileNo = (Convert.ToString(dr["AltMobileNo"]));
                    obj.Email = (Convert.ToString(dr["EMailID"]));
                    obj.FatherName = (Convert.ToString(dr["MiddleName"]));

                    obj.ITIName = (Convert.ToString(dr["InstituteName"]));
                    obj.DVETInstituteCode = (Convert.ToString(dr["InstituteCode"]));
                    obj.TradeName = (Convert.ToString(dr["CourseName"]));
                    obj.TradeCode = (Convert.ToString(dr["CourseCode"]));
                    obj.AdmissionYear = (Convert.ToString(dr["YearDisplayName"]));

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, nameof(GetIITIAdmissionData), ApplicationID);
                throw;
            }
            return obj;
        }
        public ITIAdmissionEntity GetUserData(string ITIRegistrationNo)
        {
            ITIAdmissionEntity obj = new ITIAdmissionEntity();
            try
            {
                DataTable dt = _repository.GetUserData(ITIRegistrationNo);
                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    obj.RegistrationNumber = (Convert.ToString(dr["RegistrationNumber"]));
                    obj.CandidateFirstName = (Convert.ToString(dr["CandidateFirstName"]));
                    obj.CandidateLastName = (Convert.ToString(dr["CandidateLastName"]));
                    obj.GenderCode = (Convert.ToString(dr["GenderCode"]));
                    obj.PrimaryMobileNo = (Convert.ToString(dr["PrimaryMobileNo"]));
                    obj.SecondaryMobileNo = (Convert.ToString(dr["SecondaryMobileNo"]));
                    obj.Email = (Convert.ToString(dr["Email"]));
                    obj.FatherName = (Convert.ToString(dr["FatherName"]));
                    obj.AddressLine1 = (Convert.ToString(dr["PAddress"]));
                    obj.StateID = Convert.ToInt16(dr["PStateID"] ?? 27);
                    obj.DistrictID = Convert.ToInt16(dr["PDistrictID"] ?? -1);
                    obj.TalukaID = Convert.ToInt32(dr["PTalukaID"] ?? -1);
                    obj.CityID = Convert.ToInt32(dr["PCityID"] ?? -1);
                    obj.City = (Convert.ToString(dr["POtherCity"]));
                    obj.PinCode = (Convert.ToString(dr["PPincode"]));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, nameof(GetUserData), ITIRegistrationNo);
                throw;
            }
            return obj;
        }
    }
}
