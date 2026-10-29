using Portal.Entities.ExistingInstitute;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class InstituteInfoEntity
    {
        public Int64 InstituteID { get; set; }
        public int ApplicationFor { get; set; }
        public string InstituteCode { get; set; }
        public string InstituteName { get; set; }
        public string InstituteAddress { get; set; }
        public Int16 StateID { get; set; }
        public string State { get; set; }
        public Int16 RegionID { get; set; }
        public string Region { get; set; }
        public Int32 DistrictID { get; set; }
        public string District { get; set; }
        public Int32 TalukaID { get; set; }
        public string Taluka { get; set; }
        public string City { get; set; }
        public Int32 CityID { get; set; }
        public string OtherCity { get; set; }

        public string PinCode { get; set; }
        public string STD { get; set; }
        public string PhoneNo { get; set; }
        public string FaxNo { get; set; }
        public string EMailID { get; set; }
        public string WebSite { get; set; }
        public string InstituteUrl { get; set; }
        public string LocationCategory { get; set; }
        public int LocationCategoryID { get; set; }
        public string LastModifiedOn { get; set; }
        public DateTime EstablishmentDate { get; set; }
        public string ResolutionPath { get; set; }
        public short InstituteStatusID { get; set; }
        public short PromotingOrgTypeID { get; set; }
        public short CourseTypeID { get; set; }
        public string PrevInstituteCode { get; set; }
        public bool IsActive { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }


        public string AuthorizedPersonTitle { get; set; }
        public string AuthorizedPersonFirstName { get; set; }
        public string AuthorizedPersonMiddleName { get; set; }
        public string AuthorizedPersonLastName { get; set; }
        public string AuthorizedPersonName { get; set; }
        public string AuthorizedPersonMobileNo1 { get; set; }
        public string AuthorizedPersonMobileNo2 { get; set; }
        public string AuthorizedPersonEmailId { get; set; }
        public string AuthorizedPersonPhoto { get; set; }
        public string PromotingOrgOthers { get; set; }
        public string PromotingOrgType { get; set; }
        public string AuthorizedPersonAadharNo { get; set; }
        public string AuthorizedPersonGender { get; set; }
        public string Password { get; set; }

        public DateTime AuthorizedPersonDOB { get; set; }

        public string AuthorizedPersonAadharCardPath { get; set; }
        public string Designation { get; set; }
        public Int64 UserID { get; set; }


        public string MSBSVETRegistrationNumber { get; set; }
        public string MSBSVETApprovalDate { get; set; }
        public string MSBSVETApprovalLetterPath { get; set; }

        public string VTPRegistrationNumber { get; set; }
        public string VTPApprovalDate { get; set; }
        public string VTPApprovalLetterPath { get; set; }

        public string SmartTPRegistrationNumber { get; set; }
        public string SmartTPApprovalDate { get; set; }
        public string SmartTPApprovalLetterPath { get; set; }

        public string SmartTCRegistrationNumber { get; set; }
        public string SmartTCApprovalDate { get; set; }
        public string SmartTCApprovalLetterPath { get; set; }

        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public Int64 IsNewInst { get; set; }
        public string FormStatus { get; set; }
        public string InstituteProfileVerificationRemark { get; set; }
        public string CollegeRegistrationNo { get; set; }
        public Int64 CollegeID { get; set; }

        public List<InstituteMemberEntity> ListInstituteMember { get; set; }
        public List<InstituteCourseEntity> ListInstituteCourse { get; set; }
        public List<OtherRegistrationDetailsEntity> lstOtherRegistrationDetailsEntity;
        public InstituteInfoEntity()
        {
            ListInstituteMember = new List<InstituteMemberEntity>();
            ListInstituteCourse = new List<InstituteCourseEntity>();
            lstOtherRegistrationDetailsEntity = new List<OtherRegistrationDetailsEntity>();
        }

    }
    }
