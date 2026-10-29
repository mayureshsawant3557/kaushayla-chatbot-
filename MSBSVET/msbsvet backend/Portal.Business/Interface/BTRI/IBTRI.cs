
using Portal.Entities.BTRI;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.BTRI
{
    public interface IBTRI
    {
        BTRIEntity GetBTRIDetails(long BTRIID);
        string SaveBTRIDetails(BTRIEntity entity);
        DataTable EstablishmentSearch(int UserTypeID, string UserLoginID, string ApplicationStatus, string RegistrationNo, string EstablishmentName);
        DataSet GetEstablishmentDashboard(int UserTypeID, string UserLoginID, long EstablishmentID);
        DataSet GetEstablishmentInspectionSchedule(long EstablishmentID);
        string SaveEstablishmentInspectionSchedule(long EstablishmentID, long BTRIID, DateTime InspectionScheduledDate, string UserLoginID, string IPAddress);
        DataSet GetEstablishmentActualInspection(long EstablishmentID);
        string SaveEstablishmentActualInspection(long EstablishmentID, DateTime ActualInspectionDate, int UserTypeID, string UserLoginID, string IPAddress);
        DataSet GetEstablishmentScrutinyDetails(long EstablishmentID, string PageCode);
        string SaveEstablishmentScrutinyDetails(long EstablishmentID, string Comments, string ApprovalStatus, string ReasonForRejection, int UserTypeID, string UserLoginID, string IPAddress, string PageCode);
        DataSet GetEstablishmentFinalScrutinyDetails(int UserTypeID, string UserLoginID, long EstablishmentID);
        string SaveEstablishmentFinalScrutinyDetails(long EstablishmentID, string ApprovalStatus, int UserTypeID, string UserLoginID, string IPAddress);
        bool CheckEstablishmentScrutinyEligiblity(long EstablishmentID, string UserLoginID);
        bool IsEstablishmentEligibleToRecall(long EstablishmentID, string UserLoginID);
        DataSet GetEstablishmentScrutinyStatus(long EstablishmentID, string Flag);
    }
}
