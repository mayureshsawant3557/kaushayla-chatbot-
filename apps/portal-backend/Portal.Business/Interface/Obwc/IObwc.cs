using Portal.Entities;
using Portal.Entities.Obwc;
using Portal.Entities.Base;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Obwc
{
    public interface IObwc
    {
        List<ObwcResultEntity> GetBatchData();
        string GetSaveUpdateOBWCResult(List<ObwcResultEntity> ResultDetails, DateTime CreatedDateTime, string CreatedBy, string CreatedByIPAddress);
        string UpdateBatchDate(string BatchID, string Types, DateTime SelectedDate, string CreatedBy, string CreatedByIPAddress, string BatchType);
        List<DropdownEntity> GetBatchOBWCResult();
        List<DropdownEntity> GetBatchStatusOBWCResult();
        List<DropdownEntity> GetCourseOBWCResult();
        List<DropdownEntity> GetDistrictOBWCResult();
        List<DropdownEntity> GetTraningPartnerOBWCResult();
        DataTable GetResultByCandidate(string BatchID, string SiteID, string CandidateID, string BatchType);
        List<ObwcResultEntity> GetResultByBatchID(string BatchID, string BatchType);
        List<ObwcResultEntity> GetSearchResult(Int64 InstituteID, Int64 CoureseID, string District, string batch_id, string batch_status, string batch_type);
        DataTable GetSearchResultExport(Int64 InstituteID, Int64 CoureseID, string District, string batch_id, string batch_status, string batch_type);
        DataTable GetResultByBatchIDExport(string BatchID, string BatchType);
        List<DropdownEntity> GetTraningPartnerOBWCResultForInstiutte(string InstituteCode);
        List<DropdownEntity> GetBatchOBWCResultForInstiutte(string InstituteCode);
        List<DropdownEntity> GetDistrictOBWCResultForInstitute(string InstituteCode);
        List<DropdownEntity> GetCourseOBWCResultForInstitute(string InstituteCode);
        List<DropdownEntity> GetBatchTypeOBWCResult();
        DataSet GetResultSheetBatchCode(string BatchCode);
        DataSet GetTraningPartnerOBWCResultMasters(Int64 InstituteID, Int64 CourseID, string District, string batch_status);
    }
}
