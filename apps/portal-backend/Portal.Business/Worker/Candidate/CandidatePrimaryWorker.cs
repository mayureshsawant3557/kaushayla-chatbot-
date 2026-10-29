using Microsoft.Extensions.Configuration;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Candidate
{
    public class CandidatePrimaryWorker : ICandidatePrimary
    {
        private readonly Repository _objData;
        private readonly IConfiguration _configuration;
        private readonly CommonHelper _commonHelper;

        // ✅ Dependency Injection to avoid tight coupling and improve testability
        public CandidatePrimaryWorker(Repository objData, IConfiguration configuration)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration),"Configuration instance cannot be null");
            _commonHelper = new CommonHelper(_configuration);
        }

        public CandidatePrimaryEntity GetCandidatePrimary(CandidateInput entity)
        {
            CandidatePrimaryEntity obj = new CandidatePrimaryEntity();
            try
            {
                DataTable dt = _objData.GetCandidatePrimary(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                   obj.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.ITIRegistrationNo = Convert.ToString(dr["ITIRegistrationNo"]);
                    obj.FirstName = Convert.ToString(dr["FirstName"]);
                    obj.MiddleName = Convert.ToString(dr["MiddleName"]);
                    obj.LastName = Convert.ToString(dr["LastName"]);
                    obj.PhotoFilePath = Convert.ToString(dr["PhotoFilePath"]);
                    obj.SignFilePath = Convert.ToString(dr["SignFilePath"]);
                    obj.GenderCode = Convert.ToString(dr["GenderCode"]);
                    obj.DOB = Convert.ToDateTime(dr["DOB"]);
                    obj.DOBFilePath = Convert.ToString(dr["DOBFilePath"]);
                    obj.AadhaarNo = Convert.ToString(dr["AadhaarNo"]);
                    obj.AadhaarFilePath = Convert.ToString(dr["AadhaarFilePath"]);
                    obj.MobileNo = Convert.ToString(dr["MobileNo"]);
                    obj.AltMobileNo = Convert.ToString(dr["AltMobileNo"]);
                    obj.EMailID = Convert.ToString(dr["EMailID"]);
                    obj.IsAadhaarVerified = Convert.ToBoolean(dr["IsAadhaarVerified"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidatePrimary", entity.UserLoginID);
                throw;
            }
            return obj;
        }
        public string SaveCandidatePrimary(CandidatePrimaryEntity entity)
        {
            string retVal = "";

            try
            {
                // Fix Photo Orientation
                if (!string.IsNullOrWhiteSpace(entity.PhotoFilePath))
                {
                    entity.PhotoFilePath = _commonHelper.FixImageOrientationIfRequired(
                        entity.PhotoFilePath,
                        entity.UserLoginID,
                        "photo");
                }

                // Fix Signature Orientation
                if (!string.IsNullOrWhiteSpace(entity.SignFilePath))
                {
                    entity.SignFilePath = _commonHelper.FixImageOrientationIfRequired(
                        entity.SignFilePath,
                        entity.UserLoginID,
                        "sign");
                }

                // Save after image processing
                retVal = _objData.SaveCandidatePrimary(entity);

                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "SaveCandidatePrimary",
                    entity.UserLoginID);

                retVal = ex.Message;
            }

            return retVal;
        }

        public DataTable IsAadharNoDuplicate(string AadharNo, long CandidateID)
        {
            try
            {
                return _objData.IsAadharNoDuplicate(AadharNo, CandidateID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsAadharNoDuplicate", AadharNo.ToString());
                throw;
            }
        }

        public string UpdateAadharNo(string AadhaarNo, CandidateInput entity, string AadhaarFilePath)
        {
            string retVal = "";
            try
            {
                retVal = _objData.UpdateAadharNo(AadhaarNo, entity, AadhaarFilePath);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateAadharNo", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataTable GetCandidateDashboard(long CandidateID)
        {
            try
            {
                return _objData.GetCandidateDashboard(CandidateID);
            }
            catch(Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateDashboard", CandidateID.ToString());
                throw;
            }
        }
    }
}
