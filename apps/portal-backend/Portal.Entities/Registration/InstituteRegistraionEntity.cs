//using AjaxControlToolkit.HtmlEditor.ToolbarButtons;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
//using System.Web.UI.WebControls;

namespace Portal.Entities.Registration
{
    public class InstituteRegistraionEntity
    {
        public Int32 ApplicationFor { get; set; }
        public Int32 PromotingOrgType { get; set; }
        public Int64 PromotingOrganisationID { get; set; }
        public string PromotingOrgOthers { get; set; }
        public Int32 InstituteStatusID { get; set; }
        public string InstituteName { get; set; }
        public string Skill { get; set; }
        public Int32 IsExistingInstitute { get; set; }
        public Int64 InstituteID { get; set; }

        public DateTime EstablishmentDate { get; set; }
        public string AuthorizedPersonTitle { get; set; }
        public string AuthorizedPersonFirstName { get; set; }
        public string AuthorizedPersonMiddleName { get; set; }
        public string AuthorizedPersonLastName { get; set; }
        public string AuthorizedPersonGender { get; set; }
        public DateTime AuthorizedPersonDOB { get; set; }
        public string AuthorizedPersonAadharNo { get; set; }
        public string AuthorizedPersonMobileNo1 { get; set; }
        public string AuthorizedPersonMobileNo2 { get; set; }
        public string EMailID { get; set; }
        public string AuthorizedPersonForPromotingOrganisationUserLoginID { get; set; }
        public string AuthorizedPersonForPromotingOrganisationTitle { get; set; }
        public string AuthorizedPersonForPromotingOrganisationFirstName { get; set; }
        public string AuthorizedPersonForPromotingOrganisationMiddleName { get; set; }
        public string AuthorizedPersonForPromotingOrganisationLastName { get; set; }
        public string AuthorizedPersonForPromotingOrganisationGender { get; set; }
        public DateTime AuthorizedPersonForPromotingOrganisationDOB { get; set; }
        public string AuthorizedPersonForPromotingOrganisationAadharNo { get; set; }
        public string AuthorizedPersonForPromotingOrganisationMobileNo1 { get; set; }
        public string AuthorizedPersonForPromotingOrganisationMobileNo2 { get; set; }
        public string AuthorizedPersonForPromotingOrganisationEMailID { get; set; }

        public Int32 SecurityQuestionID { get; set; }
        public string SecurityQuestionAnswer { get; set; }
        public Int32 StateID { get; set; }
        public Int32 DistrictID { get; set; }
        public Int32 TalukaID { get; set; }
        public Int32 ddlCity { get; set; }
        public string OtherCity { get; set; }
        public string AuthorizedPersonUserLoginID { get; set; }
        public string Password { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }


        public Int32 ExInstStateID { get; set; }
        public Int32 ExInstDistrictID { get; set; }
        public Int32 ExInstTalukaID { get; set; }
        public Int32 ExInstddlCity { get; set; }
        public string ExInstOtherCity { get; set; }
        public string ExInstPincode { get; set; }

    }
}
