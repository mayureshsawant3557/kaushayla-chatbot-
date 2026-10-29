using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.Establishment;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Establishment
{
    public interface IEstablishmentSummary
    {
        CheckURLEntity CheckEstablishmentURL(EstablishmentInput entity);
        EstablishmentSummaryEntity GetEstablishmentSummary(EstablishmentInput entity);
        string UnlockEstablishmentForm(EstablishmentFormUnlockEntity entity);
        DataTable GetEligibilityFlagForUnlockEstablishmentForm(long EstablishmentID, string UserLoginID);
        DataSet GetCurrentApprovalStatus(long EstablishmentID);
        string ResubmitEstablishmentFormForApproval(long EstablishmentID, string UserLoginID, string IPAddress);
    }
}
