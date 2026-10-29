using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class InstituteStatusEntity
    {
        public Int64 InstituteID { get; set; }
        public int VersionNo { get; set; }
        public int StepID { get; set; }

        public string FormStatus { get; set; }

        public DateTime? LastModifiedOn { get; set; }
        public string LastModifiedBy { get; set; }
        public string LastModifiedByIPAddress { get; set; }
        public string LastModifiedPage { get; set; }

        public string SelfDeclarationPath { get; set; }
        public string LetterOfIntentPath { get; set; }

        public bool IsLetterOfIntentGenerated { get; set; }
        public DateTime? LetterOfIntentGenerationDate { get; set; }

        public string IsPaymentTransactionApproved { get; set; }
        public string PaymentTransactionRemark { get; set; }

        public string IsPromotingOrganization { get; set; }
        public string PromotingOrganizationRemark { get; set; }

        public string IsPromotors { get; set; }
        public string PromotorsRemark { get; set; }

        public string IsProposedInstitute { get; set; }
        public string ProposedInstituteRemark { get; set; }

        public string IsProposedCourses { get; set; }
        public string ProposedCoursesRemark { get; set; }

        public string IsSelfDeclaration { get; set; }
        public string SelfDeclarationRemark { get; set; }

        public string IsApplicationforLetterofIntent { get; set; }
        public string ApplicationforLetterofIntent { get; set; }

        public DateTime? LetterOfIntentIssueDate { get; set; }
        public string ISLetterOfIntentIssued { get; set; }
    }
}

