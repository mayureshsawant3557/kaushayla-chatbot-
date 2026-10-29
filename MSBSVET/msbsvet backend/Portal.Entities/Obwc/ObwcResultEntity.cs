using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Obwc
{
    public class ObwcResultEntity
    {
        public string ID { get; set; }
        public string site_id { get; set; }
        public string nameOfSite { get; set; }
        public string addressOfSite { get; set; }
        public string district_name { get; set; }
        public string statusOfCamp { get; set; }
        public string reason { get; set; }
        public string site_approval_date { get; set; }
        public string batch_id { get; set; }
        public string batch_code { get; set; }
        public string batch_status { get; set; }
        public string batch_create_date { get; set; }
        public string course_name { get; set; }
        public string training_start_date { get; set; }
        public string training_end_date { get; set; }
        public string registration_no { get; set; }
        public string fullname_worker { get; set; }
        public string age_worker { get; set; }
        public string gender { get; set; }
        public string status { get; set; }
        public string type_of_worker_title { get; set; }
        public string total_marks { get; set; }
        public string attendance { get; set; }
        public string acquired_marks { get; set; }
        public string percentage_of_worker { get; set; }
        public string result_of_worker { get; set; }
        public string CreatedDateTime { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedByIPAddress { get; set; }
        public string ModifiedDateTime { get; set; }
        public string ModifiedBy { get; set; }
        public string ModifiedByIPAddress { get; set; }
        public string IsResultPrint { get; set; }
        public string PrintDateTime { get; set; }
        public string PrintdBy { get; set; }
        public string PrintByIPAddress { get; set; }
        public string trainingPartnerName { get; set; }
        public string DispatchDateTime { get; set; }
        public string DispatchBy { get; set; }
        public string DispatchByIPAddress { get; set; }
        public string CourseID { get; set; }
        public string MBOCWPortalName { get; set; }
        public string CourseCode { get; set; }
        public string CourseName { get; set; }
        public string DurationinHours { get; set; }
        public string Sector { get; set; }
        public string CourseIsActive { get; set; }
        public string InstituteID { get; set; }
        public string NameasperBOCWPortal { get; set; }
        public string InstituteCode { get; set; }
        public string TrainingPartner { get; set; }
        public string Address { get; set; }
        public string CityVillage { get; set; }
        public string PinCode { get; set; }
        public string Taluka { get; set; }
        public string District { get; set; }
        public string Title { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string PrimaryMobileNumber { get; set; }
        public string AlternativeMobileNumber { get; set; }
        public string EMailID { get; set; }
        public string InstituteIsActive { get; set; }

        public int Enrolled { get; set; }
        public int Appeared { get; set; }
        public int Passed { get; set; }
        public string QRcode { get; set; }
        public string QRcodeText { get; set; }
        public string BatchCodeURL { get; set; }

        public string IsCertificateGenerated { get; set; }
        public string AssessmentDate { get; set; }
        public string mobile_no_worker { get; set; }
        public string dob_worker { get; set; }

        public string SiteAddress { get; set; }
        public string SiteName { get; set; }
        public string SiteCityVillage { get; set; }
        public string SitePinCode { get; set; }
        public string SiteTaluka { get; set; }
        public string SiteTulakaCode { get; set; }
        public string SiteDistrict { get; set; }

        public string SiteDistrictCode { get; set; }
        public string batch_type { get; set; }
    }
}
