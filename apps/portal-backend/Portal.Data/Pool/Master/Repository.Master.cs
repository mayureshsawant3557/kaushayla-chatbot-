using Microsoft.Data.SqlClient;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Portal.Data;           
using Portal.Entities;       
using Portal.Entities.Master;
using System;
using System.Collections.Generic;
using System.Data;
using static Portal.Entities.Master.MasterBatchEntity;

namespace Portal.Data {

        public partial class Repository
    {

        #region Master List
        public DataTable GetMasterList()
        {
            return _dbAccess.GetDataTable("sp_GetMasterList");
        }
        #endregion

        #region State
        public DataTable GetMasterState()
        {
            return _dbAccess.GetDataTable("sp_GetMasterState");
        }

        public bool InsertMasterState(MasterStateEntity entity)
        {
            var param = new Dictionary<string, object>
            {
                { "@StateID",   entity.StateID },
                { "@State",     entity.State },
                { "@CountryID", entity.CountryID },
                { "@IsActive",  entity.IsActive }
            };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterState", param);
            return result != null;
        }

        public bool UpdateMasterState(MasterStateEntity entity)
        {
            var param = new Dictionary<string, object>
            {
                { "@StateID",   entity.StateID },
                { "@State",     entity.State },
                { "@CountryID", entity.CountryID },
                { "@IsActive",  entity.IsActive }
            };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterState", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterState(int StateID)
        {
            var param = new Dictionary<string, object> { { "@StateID", StateID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterState", param);
            return result != null && Convert.ToInt32(result) > 0;
        }
    #endregion

        # region District
        public DataTable GetMasterDistricttable()
        {
            return _dbAccess.GetDataTable("Base_GetMasterDistrict");
        }

        public bool InsertMasterDistrict(MasterDistrictEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@DistrictID",      entity.DistrictID },
        { "@District",    entity.District },
        { "@DistrictMarathi", entity.DistrictMarathi ?? (object)DBNull.Value },
        { "@StateID",         entity.StateID },
        { "@IsActive",        entity.IsActive },

    };
            object result = _dbAccess.ExecuteScalar("SP_InsertMasterDistrict", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterDistrict(MasterDistrictEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@DistrictID",      entity.DistrictID },
        { "@District",    entity.District    },
        { "@DistrictMarathi", entity.DistrictMarathi ?? (object)DBNull.Value },
        { "@StateID",         entity.StateID },
        { "@IsActive",        entity.IsActive },

    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterDistrict", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterDistrict(int DistrictID)
        {
            var param = new Dictionary<string, object> { { "@DistrictID", DistrictID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterDistrict", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion
         
        #region taluka
        public DataTable GetMasterTalukatable()
        {
            return _dbAccess.GetDataTable("SP_GetMasterTalukas");
        }
        public bool InsertMasterTaluka(MasterTalukaEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@TalukaID",      entity.TalukaID },
        { "@Taluka",        entity.Taluka },
        { "@TalukaMarathi", entity.TalukaMarathi ?? (object)DBNull.Value },
        { "@DistrictID",    entity.DistrictID },
        { "@IsActive",      entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterTaluka", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterTaluka(MasterTalukaEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@TalukaID",      entity.TalukaID },
        { "@Taluka",        entity.Taluka },
        { "@TalukaMarathi", entity.TalukaMarathi ?? (object)DBNull.Value },
        { "@DistrictID",    entity.DistrictID },
        { "@IsActive",      entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterTaluka", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterTaluka(int TalukaID)
        {
            var param = new Dictionary<string, object> { { "@TalukaID", TalukaID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterTaluka", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region  city
        public DataTable GetMasterCity(int pageNumber, int pageSize, string search, bool? isActive = null, bool? isRural = null)
        {
            var param = new Dictionary<string, object>
    {
        { "@PageNumber", pageNumber },
        { "@PageSize",   pageSize },
        { "@Search",     string.IsNullOrEmpty(search) ? (object)DBNull.Value : search },
        { "@IsActive",   isActive.HasValue ? (object)isActive.Value : DBNull.Value },
        { "@IsRural",    isRural.HasValue  ? (object)isRural.Value  : DBNull.Value },
    };
            return _dbAccess.GetDataTable("sp_GetMasterCity", param);
        }
        public DataTable GetMasterCityStats()
        {
            return _dbAccess.GetDataTable("Base_GetMasterCityStats");
        }

        public bool InsertMasterCity(MasterCityEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@CityID",      entity.CityID },
        { "@City",        entity.City },
        { "@CityMarathi", entity.CityMarathi ?? (object)DBNull.Value },
        { "@TalukaID",    entity.TalukaID },
        { "@IsRural",     entity.IsRural },
        { "@IsActive",    entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterCity", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterCity(MasterCityEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@CityID",      entity.CityID },
        { "@City",        entity.City },
        { "@CityMarathi", entity.CityMarathi ?? (object)DBNull.Value },
        { "@TalukaID",    entity.TalukaID },
        { "@IsRural",     entity.IsRural },
        { "@IsActive",    entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterCity", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterCity(int CityID)
        {
            var param = new Dictionary<string, object> { { "@CityID", CityID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterCity", param);
            return result != null && Convert.ToInt32(result) > 0;
        }
        #endregion

        #region Region
        public bool InsertMasterRegion(MasterRegionEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@RegionID",      entity.RegionID },
        { "@Region",        entity.Region },
        { "@RegionMarathi", entity.RegionMarathi ?? (object)DBNull.Value },
        { "@SeqNO",         entity.SeqNO },
        { "@IsActive",      entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterRegion", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterRegion(MasterRegionEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@RegionID",      entity.RegionID },
        { "@Region",        entity.Region },
        { "@RegionMarathi", entity.RegionMarathi ?? (object)DBNull.Value },
        { "@SeqNO",         entity.SeqNO },
        { "@IsActive",      entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterRegion", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterRegion(int RegionID)
        {
            var param = new Dictionary<string, object> { { "@RegionID", RegionID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterRegion", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region Pincode
        public DataTable GetMasterPincode(int pageNumber, int pageSize, string search)
        {
            var param = new Dictionary<string, object>
            {
                { "@PageNumber", pageNumber },
                { "@PageSize", pageSize },
                { "@Search", string.IsNullOrEmpty(search) ? (object)DBNull.Value : search }
            };
            return _dbAccess.GetDataTable("Base_GetMasterPincode", param);
        }
        public DataTable GetMasterPincodeStats()
        {
            return _dbAccess.GetDataTable("Base_GetMasterPincodeStats");
        }
        public bool InsertMasterPincode(MasterPincodeEntity entity)
        {
            var param = new Dictionary<string, object>
            {
                { "@Pincode",    entity.Pincode },
                { "@PostOffice", entity.PostOffice },
                { "@CityID",     entity.CityID },
                { "@IsActive",   entity.IsActive },
            };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterPincode", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterPincode(MasterPincodeEntity entity)
        {
            var param = new Dictionary<string, object>
            {
                { "@PincodeID",  entity.PincodeID },
                { "@Pincode",    entity.Pincode },
                { "@PostOffice", entity.PostOffice },
                { "@CityID",     entity.CityID },
                { "@IsActive",   entity.IsActive },
            };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterPincode", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterPincode(int PincodeID)
        {
            var param = new Dictionary<string, object> { { "@PincodeID", PincodeID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterPincode", param);
            return result != null && Convert.ToInt32(result) > 0;
        }
        #endregion

        #region 
        //public List<MasterCasteEntity> GetMasterCaste()
        //{
        //    DataTable dt = _dbAccess.ExecuteDataTable("Base_GetMasterCaste", null);
        //    var list = new List<MasterCasteEntity>();
        //    if (dt == null || dt.Rows.Count == 0) return list;

        //    foreach (DataRow row in dt.Rows)
        //    {
        //        list.Add(new MasterCasteEntity
        //        {
        //            CasteID = row["CasteID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CasteID"]),
        //            Caste = row["Caste"] == DBNull.Value ? "" : row["Caste"].ToString(),
        //            CasteSrNo = row["CasteSrNo"] == DBNull.Value ? null : Convert.ToInt32(row["CasteSrNo"]),
        //            CategoryID = row["CategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CategoryID"]),
        //            CategoryName = row["CategoryName"] == DBNull.Value ? "" : row["CategoryName"].ToString(),
        //            IsSBC = row["IsSBC"] == DBNull.Value ? false : Convert.ToBoolean(row["IsSBC"]),
        //            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
        //        });
        //    }
        //    return list;
        //}

        public bool InsertMasterCaste(MasterCasteEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@Caste",      entity.Caste },
        { "@CasteSrNo",  entity.CasteSrNo.HasValue ? (object)entity.CasteSrNo.Value : null }, // DBNull nahi, null
        { "@CategoryID", entity.CategoryID },
        { "@IsSBC",      entity.IsSBC },
        // @NewCasteID nahi
    };

            object result = _dbAccess.ExecuteScalar("Base_InsertMasterCaste", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterCaste(MasterCasteEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@CasteID",    entity.CasteID },
        { "@Caste",      entity.Caste },
        { "@CasteSrNo",  entity.CasteSrNo.HasValue ? (object)entity.CasteSrNo.Value : DBNull.Value },
        { "@CategoryID", entity.CategoryID },
        { "@IsSBC",      entity.IsSBC },
        { "@IsActive",   entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("Base_UpdateMasterCaste", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public (bool Success, string Message) SoftDeleteMasterCaste(int CasteID)
        {
            var param = new Dictionary<string, object>
    {
        { "@CasteID", CasteID },
        { "@Message", "" }  // Output parameter
    };

            object result = _dbAccess.ExecuteScalar("Base_DeleteMasterCaste", param);
            string message = param["@Message"].ToString();

            bool success = result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
            return (success, message);
        }


        public List<MasterCasteEntity> GetAllMasterCaste()
        {
            DataTable dt = _dbAccess.GetDataTable("Base_GetAllMasterCaste");
            var list = new List<MasterCasteEntity>();

            if (dt == null || dt.Rows.Count == 0)
                return list;

            foreach (DataRow row in dt.Rows)
            {
                list.Add(new MasterCasteEntity
                {
                    CasteID = row["CasteID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CasteID"]),
                    Caste = row["Caste"] == DBNull.Value ? "" : row["Caste"].ToString(),
                    CasteSrNo = row["CasteSrNo"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["CasteSrNo"]),
                    CategoryID = row["CategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CategoryID"]),
                    CategoryName = row.Table.Columns.Contains("CategoryName") && row["CategoryName"] != DBNull.Value
                        ? row["CategoryName"].ToString()
                        : null,
                    IsSBC = row["IsSBC"] == DBNull.Value ? false : Convert.ToBoolean(row["IsSBC"]),
                    IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"])
                });
            }
            return list;
        }

        #endregion

        #region Category
        public DataTable GetMasterCasteCategory()
        {
            return _dbAccess.GetDataTable("sp_GetMasterCategory");
        }

        public bool InsertMasterCategory(MasterCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@Category",     entity.Category },
        { "@CategoryCode", entity.CategoryCode },
        { "@SeqNo",        entity.SeqNo.HasValue ? (object)entity.SeqNo.Value : DBNull.Value },
        { "@IsActive",     entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterCategory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterCategory(MasterCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@CategoryID",   entity.CategoryID },
        { "@Category",     entity.Category },
        { "@CategoryCode", entity.CategoryCode },
        { "@SeqNo",        entity.SeqNo.HasValue ? (object)entity.SeqNo.Value : DBNull.Value },
        { "@IsActive",     entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterCategory(int CategoryID)
        {
            var param = new Dictionary<string, object> { { "@CategoryID", CategoryID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }
        #endregion

        #region Disability Methods

        public DataTable GetAllDisabilities()
        {
            return _dbAccess.GetDataTable("sp_GetAllDisabilities");
        }

        public bool InsertDisability(MasterDisabilityEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@Disability", entity.Disability },
        { "@IsActive",   entity.IsActive }
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertDisability", param);
            return result != null;
        }

        public bool UpdateDisability(MasterDisabilityEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@DisabilityID", entity.DisabilityID },
        { "@Disability",   entity.Disability },
        { "@IsActive",     entity.IsActive }
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateDisability", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteDisability(int DisabilityID)
        {
            var param = new Dictionary<string, object> { { "@DisabilityID", DisabilityID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteDisability", param);
            return result != null && Convert.ToInt32(result) > 0;
        }
        #endregion

        #region AcademicYear Methods

        public DataTable GetAllAcademicYears()
        {
            return _dbAccess.GetDataTable("SP_GetAll_AcademicYear");
        }

        public bool InsertAcademicYear(MasterAcademicYearEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@YearName",        entity.YearName },
        { "@YearId",          entity.YearId },
        { "@YearDisplayName", entity.YearDisplayName },
        { "@isCurrent",       entity.isCurrent },
        { "@isactive",        entity.isactive },
        { "@IsForAdmission",  entity.IsForAdmission }
    };
            object result = _dbAccess.ExecuteScalar("SP_Insert_AcademicYear", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateAcademicYear(MasterAcademicYearEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@YearId",          entity.YearId },
        { "@YearName",        entity.YearName },
        { "@YearDisplayName", entity.YearDisplayName },
        { "@isCurrent",       entity.isCurrent },
        { "@isactive",        entity.isactive },
        { "@IsForAdmission",  entity.IsForAdmission }
    };
            object result = _dbAccess.ExecuteScalar("SP_Update_AcademicYear", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteAcademicYear(int YearId)
        {
            var param = new Dictionary<string, object> { { "@YearId", YearId } };
            object result = _dbAccess.ExecuteScalar("SP_SoftDelete_AcademicYear", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region Activity Status Methods

        public DataTable GetAllActivityStatuses()
        {
            return _dbAccess.GetDataTable("usp_MasterActivityStatus_GetAll");
        }

        public bool InsertActivityStatus(MasterActivityStatusEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@RegionID",              entity.RegionID },
        { "@ActivityName",          entity.ActivityName },
        { "@ActivityDetails",       entity.ActivityDetails       ?? (object)DBNull.Value },
        { "@ActivityStartDateTime", entity.ActivityStartDateTime.HasValue ? (object)entity.ActivityStartDateTime.Value : DBNull.Value },
        { "@ActivityEndDateTime",   entity.ActivityEndDateTime.HasValue   ? (object)entity.ActivityEndDateTime.Value   : DBNull.Value },
        { "@IsActive",              entity.IsActive },
        { "@ModifiedBy",            entity.ModifiedBy            ?? (object)DBNull.Value },
        { "@ModifiedByIPAddress",   entity.ModifiedByIPAddress   ?? (object)DBNull.Value }
    };
            object result = _dbAccess.ExecuteScalar("usp_MasterActivityStatus_Insert", param);
            return result != null;
        }

        public bool UpdateActivityStatus(MasterActivityStatusEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SeqNo",                 entity.SeqNo },
        { "@RegionID",              entity.RegionID },
        { "@ActivityName",          entity.ActivityName },
        { "@ActivityDetails",       entity.ActivityDetails       ?? (object)DBNull.Value },
        { "@ActivityStartDateTime", entity.ActivityStartDateTime.HasValue ? (object)entity.ActivityStartDateTime.Value : DBNull.Value },
        { "@ActivityEndDateTime",   entity.ActivityEndDateTime.HasValue   ? (object)entity.ActivityEndDateTime.Value   : DBNull.Value },
        { "@IsActive",              entity.IsActive },
        { "@ModifiedBy",            entity.ModifiedBy            ?? (object)DBNull.Value },
        { "@ModifiedByIPAddress",   entity.ModifiedByIPAddress   ?? (object)DBNull.Value }
    };
            object result = _dbAccess.ExecuteScalar("usp_MasterActivityStatus_Update", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteActivityStatus(int SeqNo, string ModifiedBy, string ModifiedByIPAddress)
        {
            var param = new Dictionary<string, object>
    {
        { "@SeqNo",               SeqNo },
        { "@ModifiedBy",          ModifiedBy          ?? (object)DBNull.Value },
        { "@ModifiedByIPAddress", ModifiedByIPAddress ?? (object)DBNull.Value }
    };
            object result = _dbAccess.ExecuteScalar("usp_MasterActivityStatus_SoftDelete", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region AffiliationPages Methods

        public DataTable GetMasterAffiliationPages()
        {
            return _dbAccess.GetDataTable("sp_GetMasterAffiliationPages");
        }

        public bool InsertMasterAffiliationPage(MasterAffiliationPageEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@PageId",          entity.PageId                                                              },
        { "@PageName",        entity.PageName                                                            },
        { "@PageUrl",         entity.PageUrl         ?? (object)DBNull.Value                            },
        { "@IsActive",        entity.IsActive                                                            },
        { "@PageGrop",        entity.PageGrop.HasValue ? (object)entity.PageGrop.Value : DBNull.Value   },
        { "@PageCode",        entity.PageCode        ?? (object)DBNull.Value                            },
        { "@BGColur",         entity.BGColur         ?? (object)DBNull.Value                            },
        { "@AnchorTagTarget", entity.AnchorTagTarget ?? (object)DBNull.Value                            },
        { "@ReactPageUrl",    entity.ReactPageUrl    ?? (object)DBNull.Value                            },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterAffiliationPage", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterAffiliationPage(MasterAffiliationPageEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@PageId",          entity.PageId                                                              },
        { "@PageName",        entity.PageName                                                            },
        { "@PageUrl",         entity.PageUrl         ?? (object)DBNull.Value                            },
        { "@IsActive",        entity.IsActive                                                            },
        { "@PageGrop",        entity.PageGrop.HasValue ? (object)entity.PageGrop.Value : DBNull.Value   },
        { "@PageCode",        entity.PageCode        ?? (object)DBNull.Value                            },
        { "@BGColur",         entity.BGColur         ?? (object)DBNull.Value                            },
        { "@AnchorTagTarget", entity.AnchorTagTarget ?? (object)DBNull.Value                            },
        { "@ReactPageUrl",    entity.ReactPageUrl    ?? (object)DBNull.Value                            },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterAffiliationPage", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterAffiliationPage(int PageId)
        {
            var param = new Dictionary<string, object> { { "@PageId", PageId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterAffiliationPage", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ApplicationFormLinks Methods

        public DataTable GetMasterApplicationFormLinks()
        {
            return _dbAccess.GetDataTable("sp_GetMasterApplicationFormLinks");
        }

        public bool InsertMasterApplicationFormLink(MasterApplicationFormLinkEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@LinkID",          entity.LinkID                                          },
        { "@LinkType",        entity.LinkType                                        },
        { "@LinkName",        entity.LinkName                                        },
        { "@LinkDescription", entity.LinkDescription ?? (object)DBNull.Value        },
        { "@LinkURL",         entity.LinkURL         ?? (object)DBNull.Value        },
        { "@PageCode",        entity.PageCode        ?? (object)DBNull.Value        },
        { "@IsActive",        entity.IsActive                                        },
        { "@LinkURLReact",    entity.LinkURLReact    ?? (object)DBNull.Value        },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterApplicationFormLink", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterApplicationFormLink(MasterApplicationFormLinkEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@LinkID",          entity.LinkID                                          },
        { "@LinkType",        entity.LinkType                                        },
        { "@LinkName",        entity.LinkName                                        },
        { "@LinkDescription", entity.LinkDescription ?? (object)DBNull.Value        },
        { "@LinkURL",         entity.LinkURL         ?? (object)DBNull.Value        },
        { "@PageCode",        entity.PageCode        ?? (object)DBNull.Value        },
        { "@IsActive",        entity.IsActive                                        },
        { "@LinkURLReact",    entity.LinkURLReact    ?? (object)DBNull.Value        },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterApplicationFormLink", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterApplicationFormLink(int LinkID)
        {
            var param = new Dictionary<string, object> { { "@LinkID", LinkID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterApplicationFormLink", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ApprovalGroup Methods

        public DataTable GetMaster_ApprovalGroups()
        {
            return _dbAccess.GetDataTable("sp_GetMaster_ApprovalGroups");
        }

        public bool InsertMasterApprovalGroup(Master_ApprovalGroupEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ApprovalGroupName", entity.ApprovalGroupName },
        { "@IsActive",          entity.IsActive          },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMaster_ApprovalGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterApprovalGroup(Master_ApprovalGroupEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                entity.ID                },
        { "@ApprovalGroupName", entity.ApprovalGroupName },
        { "@IsActive",          entity.IsActive          },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMaster_ApprovalGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterApprovalGroup(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMaster_ApprovalGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region MasterBatch Methods

        public DataTable GetMasterBatches()
        {
            return _dbAccess.GetDataTable("sp_GetMasterBatches");
        }

        public bool InsertMasterBatch(MasterBatchEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@BatchID",          entity.BatchID                                        },
        { "@CollegeID",        entity.CollegeID        ?? (object)DBNull.Value      },
        { "@CourseID",         entity.CourseID         ?? (object)DBNull.Value      },
        { "@ShiftID",          entity.ShiftID          ?? (object)DBNull.Value      },
        { "@UnitNo",           entity.UnitNo           ?? (object)DBNull.Value      },
        { "@UnitID",           entity.UnitID           ?? (object)DBNull.Value      },
        { "@BatchStartDate",   entity.BatchStartDate   ?? (object)DBNull.Value      },
        { "@BatchEndDate",     entity.BatchEndDate     ?? (object)DBNull.Value      },
        { "@AdmissionEndDate", entity.AdmissionEndDate ?? (object)DBNull.Value      },
        { "@IsSystemCreated",  entity.IsSystemCreated                               },
        { "@BatchStatus",      entity.BatchStatus                                   },
        { "@IsDeleted",        entity.IsDeleted                                     },
        { "@AdmissionYearID",  entity.AdmissionYearID  ?? (object)DBNull.Value      },
        { "@BatchTypeID",      entity.BatchTypeID      ?? (object)DBNull.Value      },
        { "@ExaminationID1",   entity.ExaminationID1   ?? (object)DBNull.Value      },
        { "@ExaminationID2",   entity.ExaminationID2   ?? (object)DBNull.Value      },
        { "@Intake",           entity.Intake           ?? (object)DBNull.Value      },
        //{ "@SchoolID",         entity.SchoolID         ?? (object)DBNull.Value      },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterBatch", param);
            return result != null && Convert.ToInt32(result) > 0;
        }
    public bool UpdateMasterBatch(MasterBatchEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",               entity.ID                                            },
        { "@BatchID",          entity.BatchID                                       },
        { "@CollegeID",        entity.CollegeID        ?? (object)DBNull.Value      },
        { "@CourseID",         entity.CourseID         ?? (object)DBNull.Value      },
        { "@ShiftID",          entity.ShiftID          ?? (object)DBNull.Value      },
        { "@UnitNo",           entity.UnitNo           ?? (object)DBNull.Value      },
        { "@UnitID",           entity.UnitID           ?? (object)DBNull.Value      },
        { "@BatchStartDate",   entity.BatchStartDate   ?? (object)DBNull.Value      },
        { "@BatchEndDate",     entity.BatchEndDate     ?? (object)DBNull.Value      },
        { "@AdmissionEndDate", entity.AdmissionEndDate ?? (object)DBNull.Value      },
        { "@IsSystemCreated",  entity.IsSystemCreated                               },
        { "@BatchStatus",      entity.BatchStatus                                   },
        { "@IsDeleted",        entity.IsDeleted                                     },
        { "@AdmissionYearID",  entity.AdmissionYearID  ?? (object)DBNull.Value      },
        { "@BatchTypeID",      entity.BatchTypeID      ?? (object)DBNull.Value      },
        { "@ExaminationID1",   entity.ExaminationID1   ?? (object)DBNull.Value      },
        { "@ExaminationID2",   entity.ExaminationID2   ?? (object)DBNull.Value      },
        { "@Intake",           entity.Intake           ?? (object)DBNull.Value      },
        //{ "@SchoolID",         entity.SchoolID         ?? (object)DBNull.Value      },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterBatch", param);
            return result != null && Convert.ToInt32(result) > 0;
        }
    

        public bool SoftDeleteMasterBatch(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterBatch", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region Country Methods

        public DataTable GetMasterCountries()
        {
            return _dbAccess.GetDataTable("sp_GetMasterCountries");
        }

        public int InsertMasterCountry(MasterCountryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@CountryID", entity.CountryID },
        { "@Country", entity.Country },
        { "@IsActive", entity.IsActive }
    };

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterCountryNew", param);

            return result == null ? 0 : Convert.ToInt32(result);
        }

        public bool UpdateMasterCountry(MasterCountryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@CountryID", entity.CountryID },
        { "@Country",   entity.Country   },
        { "@IsActive",  entity.IsActive  },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterCountry", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterCountry(int CountryID)
        {
            var param = new Dictionary<string, object> { { "@CountryID", CountryID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterCountry", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ApprovalOrder Methods

        public DataTable GetMasterApprovalOrders()
        {
            return _dbAccess.GetDataTable("sp_GetMasterApprovalOrders");
        }

        public bool InsertMasterApprovalOrder(MasterApprovalOrderEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ApprovalOrderNo",     entity.ApprovalOrderNo                             },
        { "@ApprovalOrderDate",   entity.ApprovalOrderDate ?? (object)DBNull.Value   },
        { "@ApprovalOrder",       entity.ApprovalOrder     ?? (object)DBNull.Value   },
        { "@ApprovalOrderRemakr", entity.ApprovalOrderRemakr ?? (object)DBNull.Value },
        { "@IsActive",            entity.IsActive                                     },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterApprovalOrder", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterApprovalOrder(MasterApprovalOrderEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                  entity.ID                                              },
        { "@ApprovalOrderNo",     entity.ApprovalOrderNo                                },
        { "@ApprovalOrderDate",   entity.ApprovalOrderDate ?? (object)DBNull.Value      },
        { "@ApprovalOrder",       entity.ApprovalOrder     ?? (object)DBNull.Value      },
        { "@ApprovalOrderRemakr", entity.ApprovalOrderRemakr ?? (object)DBNull.Value    },
        { "@IsActive",            entity.IsActive                                        },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterApprovalOrder", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterApprovalOrder(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterApprovalOrder", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region SubSector Methods

        public DataTable GetMasterSubSectors()
        {
            return _dbAccess.GetDataTable("sp_GetMasterSubSectors");
        }

        public bool InsertMasterSubSector(MasterSubSectorEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SubSector", entity.SubSector              },
        { "@SectorID",  entity.SectorID               },
        { "@IsActive",  entity.IsActive               },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterSubSector", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterSubSector(MasterSubSectorEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SubSectorID", entity.SubSectorID          },
        { "@SubSector",   entity.SubSector            },
        { "@SectorID",    entity.SectorID             },
        { "@IsActive",    entity.IsActive             },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterSubSector", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterSubSector(int SubSectorID)
        {
            var param = new Dictionary<string, object> { { "@SubSectorID", SubSectorID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterSubSector", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region SubjectCourse Methods

        public DataTable GetMasterSubjectCourses()
        {
            return _dbAccess.GetDataTable("sp_GetMasterSubjectCourses");
        }

        public bool InsertMasterSubjectCourse(MasterSubjectCourseEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            { "@CourseID",    entity.CourseID                              },
            { "@CourseCode",  entity.CourseCode  ?? (object)DBNull.Value  },
            { "@SubjectName", entity.SubjectName ?? (object)DBNull.Value  },
            { "@SubjectCode", entity.SubjectCode ?? (object)DBNull.Value  },
            { "@SubjectType", entity.SubjectType ?? (object)DBNull.Value  },
        };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterSubjectCourse", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterSubjectCourse(MasterSubjectCourseEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            { "@OldCourseID",    entity.OldCourseID                            },
            { "@OldSubjectCode", entity.OldSubjectCode ?? (object)DBNull.Value },
            { "@CourseID",       entity.CourseID                               },
            { "@CourseCode",     entity.CourseCode  ?? (object)DBNull.Value    },
            { "@SubjectName",    entity.SubjectName ?? (object)DBNull.Value    },
            { "@SubjectCode",    entity.SubjectCode ?? (object)DBNull.Value    },
            { "@SubjectType",    entity.SubjectType ?? (object)DBNull.Value    },
        };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterSubjectCourse", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterSubjectCourse(int CourseID, string SubjectCode)
        {
            var param = new Dictionary<string, object>
        {
            { "@CourseID",    CourseID    },
            { "@SubjectCode", SubjectCode },
        };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterSubjectCourse", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region MasterLanguage Methods

        public DataTable GetMasterLanguages()
        {
            return _dbAccess.GetDataTable("sp_GetMasterLanguages");
        }

        public bool InsertMasterLanguage(MasterLanguageEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@LanguageID", entity.LanguageID },
        { "@Language", entity.Language },
        { "@IsActive", entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterLanguage", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterLanguage(MasterLanguageEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@LanguageID", entity.LanguageID },
        { "@Language",   entity.Language   },
        { "@IsActive",   entity.IsActive   },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterLanguage", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterLanguage(int LanguageID)
        {
            var param = new Dictionary<string, object> { { "@LanguageID", LanguageID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterLanguage", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region Designation Methods

        public DataTable GetMasterDesignations()
        {
            return _dbAccess.GetDataTable("sp_GetMasterDesignations"); 
        }

        public bool InsertMasterDesignation(MasterDesignationEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@DesignationId", entity.DesignationId },
        { "@Designation",   entity.Designation   },
        { "@IsActive",      entity.IsActive      }
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterDesignation", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterDesignation(MasterDesignationEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@DesignationId", entity.DesignationId },
        { "@Designation",   entity.Designation   },
        { "@IsActive",      entity.IsActive      }
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterDesignation", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterDesignation(int DesignationId)
        {
            var param = new Dictionary<string, object> { { "@DesignationId", DesignationId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterDesignation", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region CourseType Methods

        public DataTable GetMasterCourseTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterCourseTypes");
        }

        public bool InsertMasterCourseType(MasterCourseTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@CourseTypeID", entity.CourseTypeID },
        { "@CourseType",   entity.CourseType   },
        { "@IsActive",     entity.IsActive     }
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterCourseType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterCourseType(MasterCourseTypeEntity entity)
        {
            var param = new Dictionary<string, object>    
    {
        { "@CourseTypeID", entity.CourseTypeID },
        { "@CourseType",   entity.CourseType   },
        { "@IsActive",     entity.IsActive     }
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterCourseType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterCourseType(int CourseTypeID)
        {
            var param = new Dictionary<string, object> { { "@CourseTypeID", CourseTypeID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterCourseType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region MasterDocuments Methods

        public DataTable GetMasterDocuments()
        {
            return _dbAccess.GetDataTable("sp_GetMasterDocuments");
        }

        public bool InsertMasterDocument(MasterDocumentEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                   entity.ID                   },
        { "@DocumentName",         entity.DocumentName         },
        { "@IsActive",             entity.IsActive             },
        { "@IsDocumentCompulsory", entity.IsDocumentCompulsory },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterDocument", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterDocument(MasterDocumentEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                   entity.ID                   },
        { "@DocumentName",         entity.DocumentName         },
        { "@IsActive",             entity.IsActive             },
        { "@IsDocumentCompulsory", entity.IsDocumentCompulsory },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterDocument", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterDocument(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterDocument", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region FacilityGroup Methods

        public DataTable GetMasterFacilityGroups()
        {
            return _dbAccess.GetDataTable("sp_GetMasterFacilityGroups");
        }

        public bool InsertMasterFacilityGroup(MasterFacilityGroupEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@FacilityGroupId", entity.FacilityGroupId },
        { "@FacilityGroup",   entity.FacilityGroup   },
        { "@IsActive",        entity.IsActive         },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterFacilityGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterFacilityGroup(MasterFacilityGroupEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@FacilityGroupId", entity.FacilityGroupId },
        { "@FacilityGroup",   entity.FacilityGroup   },
        { "@IsActive",        entity.IsActive         },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterFacilityGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterFacilityGroup(int FacilityGroupId)
        {
            var param = new Dictionary<string, object> { { "@FacilityGroupId", FacilityGroupId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterFacilityGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region BloodGroup Methods

        public DataTable GetMasterBloodGroups()
        {
            return _dbAccess.GetDataTable("sp_GetMasterBloodGroups");
        }

        public bool InsertMasterBloodGroup(MasterBloodGroupEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@BloodGroupId", entity.BloodGroupId },
        { "@BloodGroup",   entity.BloodGroup   },
        { "@IsActive",     entity.IsActive     },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterBloodGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterBloodGroup(MasterBloodGroupEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@BloodGroupId", entity.BloodGroupId },
        { "@BloodGroup",   entity.BloodGroup   },
        { "@IsActive",     entity.IsActive     },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterBloodGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterBloodGroup(int BloodGroupId)
        {
            var param = new Dictionary<string, object> { { "@BloodGroupId", BloodGroupId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterBloodGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region MasterGender Methods

        public DataTable GetMasterGenders()
        {
            return _dbAccess.GetDataTable("sp_GetMasterGenders");
        }

        public bool InsertMasterGender(MasterGenderEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@GenderCode", entity.GenderCode },
        { "@Gender",     entity.Gender     },
        { "@IsActive",   entity.IsActive   }
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterGender", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterGender(MasterGenderEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@GenderCode", entity.GenderCode },
        { "@Gender",     entity.Gender     },
        { "@IsActive",   entity.IsActive   }
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterGender", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterGender(string GenderCode)
        {
            var param = new Dictionary<string, object> { { "@GenderCode", GenderCode } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterGender", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region BuildingFloor Methods

        public DataTable GetMasterBuildingFloor()
        {
            return _dbAccess.GetDataTable("sp_GetMasterBuildingFloors");
        }

        public bool InsertMasterBuildingFloor(MasterBuildingFloorEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@FloorId",   entity.FloorId   },   
        { "@FloorName", entity.FloorName },
        { "@IsActive",  entity.IsActive  },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterBuildingFloor", param);
            return result != null && Convert.ToInt32(result) > 0;
        }


        public bool UpdateMasterBuildingFloor(MasterBuildingFloorEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@FloorId",   entity.FloorId   },
        { "@FloorName", entity.FloorName },
        { "@IsActive",  entity.IsActive  },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterBuildingFloor", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterBuildingFloor(int FloorId)
        {
            var param = new Dictionary<string, object> { { "@FloorId", FloorId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterBuildingFloor", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion
         
        #region BuildingNameType Methods

        public DataTable GetMasterBuildingNameTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterBuildingNameTypes");
        }

        public bool InsertMasterBuildingNameType(MasterBuildingNameTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@BuildingNameTypeId", entity.BuildingNameTypeId },
        { "@BuildingNameType",   entity.BuildingNameType   },
        { "@IsActive",           entity.IsActive           },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterBuildingNameType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterBuildingNameType(MasterBuildingNameTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@BuildingNameTypeId", entity.BuildingNameTypeId },
        { "@BuildingNameType",   entity.BuildingNameType   },
        { "@IsActive",           entity.IsActive           },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterBuildingNameType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterBuildingNameType(int BuildingNameTypeId)
        {
            var param = new Dictionary<string, object> { { "@BuildingNameTypeId", BuildingNameTypeId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterBuildingNameType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region BuildingOwnershipType Methods

        public DataTable GetMasterBuildingOwnershipTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterBuildingOwnershipTypes");
        }

        public bool InsertMasterBuildingOwnershipType(MasterBuildingOwnershipTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@OwnerShipTypeid", entity.OwnerShipTypeid },
        { "@OwnerShipType",   entity.OwnerShipType   },
        { "@IsActive",        entity.IsActive         },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterBuildingOwnershipType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterBuildingOwnershipType(MasterBuildingOwnershipTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@OwnerShipTypeid", entity.OwnerShipTypeid },
        { "@OwnerShipType",   entity.OwnerShipType   },
        { "@IsActive",        entity.IsActive         },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterBuildingOwnershipType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterBuildingOwnershipType(int OwnerShipTypeid)
        {
            var param = new Dictionary<string, object> { { "@OwnerShipTypeid", OwnerShipTypeid } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterBuildingOwnershipType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region BuildingStatus Methods

        public DataTable GetMasterBuildingStatuses()
        {
            return _dbAccess.GetDataTable("sp_GetMasterBuildingStatuses");
        }

        public bool InsertMasterBuildingStatus(MasterBuildingStatusEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@BuildingStatusId", entity.BuildingStatusId },
        { "@BuildingStatus",   entity.BuildingStatus   },
        { "@IsActive",         entity.IsActive         },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterBuildingStatus", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterBuildingStatus(MasterBuildingStatusEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@BuildingStatusId", entity.BuildingStatusId },
        { "@BuildingStatus",   entity.BuildingStatus   },
        { "@IsActive",         entity.IsActive         },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterBuildingStatus", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterBuildingStatus(int BuildingStatusId)
        {
            var param = new Dictionary<string, object> { { "@BuildingStatusId", BuildingStatusId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterBuildingStatus", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region BuildingUsageType Methods

        public DataTable GetMasterBuildingUsageTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterBuildingUsageTypes");
        }

        public bool InsertMasterBuildingUsageType(MasterBuildingUsageTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@UsageTypeId", entity.UsageTypeId },
        { "@UsageType",   entity.UsageType   },
        { "@IsActive",    entity.IsActive    },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterBuildingUsageType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterBuildingUsageType(MasterBuildingUsageTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@UsageTypeId", entity.UsageTypeId },
        { "@UsageType",   entity.UsageType   },
        { "@IsActive",    entity.IsActive    },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterBuildingUsageType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterBuildingUsageType(int UsageTypeId)
        {
            var param = new Dictionary<string, object> { { "@UsageTypeId", UsageTypeId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterBuildingUsageType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region Constituency Methods

        public DataTable GetMasterConstituencies()
        {
            return _dbAccess.GetDataTable("sp_GetMasterConstituencies");
        }

        public bool InsertMasterConstituency(MasterConstituencyEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        
        { "@Constituency",         entity.Constituency                                      },
        { "@ConstituencyMarathi",  entity.ConstituencyMarathi ?? (object)DBNull.Value       },
        { "@DistrictID",           entity.DistrictID                                        },
        { "@IsActive",             entity.IsActive                                          },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterConstituency", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterConstituency(MasterConstituencyEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ConstituencyID",       entity.ConstituencyID                                    },
        { "@Constituency",         entity.Constituency                                      },
        { "@ConstituencyMarathi",  entity.ConstituencyMarathi ?? (object)DBNull.Value       },
        { "@DistrictID",           entity.DistrictID                                        },
        { "@IsActive",             entity.IsActive                                          },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterConstituency", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterConstituency(int ConstituencyID)
        {
            var param = new Dictionary<string, object> { { "@ConstituencyID", ConstituencyID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterConstituency", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion
        
        #region ConstructionType Methods

        public DataTable GetMasterConstructionTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterConstructionTypes");
        }

        public bool InsertMasterConstructionType(MasterConstructionTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ConstructionType", entity.ConstructionType },
        { "@IsActive",         entity.IsActive          },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterConstructionType", param);

            if (result == null) return false;          
            return Convert.ToInt32(result) > 0;         
        }

        public bool UpdateMasterConstructionType(MasterConstructionTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ConstructionTypeId", entity.ConstructionTypeId },
        { "@ConstructionType",   entity.ConstructionType   },
        { "@IsActive",           entity.IsActive            },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterConstructionType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterConstructionType(int ConstructionTypeId)
        {
            var param = new Dictionary<string, object> { { "@ConstructionTypeId", ConstructionTypeId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterConstructionType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ConstructionYear Methods

        public DataTable GetMasterConstructionYears()
        {
            return _dbAccess.GetDataTable("sp_GetMasterConstructionYears");
        }

        public bool InsertMasterConstructionYear(MasterConstructionYearEntity entity)
        {
            var param = new Dictionary<string, object>
{
    { "@YearId",   entity.YearId   },
    { "@IsActive", entity.IsActive },
};
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterConstructionYear", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterConstructionYear(MasterConstructionYearEntity entity)
        {
            var param = new Dictionary<string, object>
{
    { "@YearId",   entity.YearId   },
    { "@IsActive", entity.IsActive },
};
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterConstructionYear", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterConstructionYear(int YearId)
        {
            var param = new Dictionary<string, object> { { "@YearId", YearId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterConstructionYear", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ContactUsType Methods

        public DataTable GetMasterContactUsTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterContactUsTypes");
        }

        public bool InsertMasterContactUsType(MasterContactUsTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ContactUsType", entity.ContactUsType },
        { "@IsActive",      entity.IsActive      },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterContactUsType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterContactUsType(MasterContactUsTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ContactUsTypeID", entity.ContactUsTypeID },
        { "@ContactUsType",   entity.ContactUsType   },
        { "@IsActive",        entity.IsActive        },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterContactUsType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterContactUsType(int ContactUsTypeID)
        {
            var param = new Dictionary<string, object> { { "@ContactUsTypeID", ContactUsTypeID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterContactUsType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region CourseApprover Methods

        public DataTable GetMasterCourseApprovers()
        {
            return _dbAccess.GetDataTable("sp_GetMasterCourseApprovers");
        }

        public bool InsertMasterCourseApprover(MasterCourseApproverEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@CourseApprover", entity.CourseApprover },
        { "@IsActive",       entity.IsActive        },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterCourseApprover", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterCourseApprover(MasterCourseApproverEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@CourseApproverID", entity.CourseApproverID },
        { "@CourseApprover",   entity.CourseApprover    },
        { "@IsActive",         entity.IsActive          },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterCourseApprover", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterCourseApprover(int CourseApproverID)
        {
            var param = new Dictionary<string, object> { { "@CourseApproverID", CourseApproverID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterCourseApprover", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region Sector Methods

        public DataTable GetMasterSectors()
        {
            return _dbAccess.GetDataTable("sp_GetMasterSectors");
        }

        public bool InsertMasterSector(MasterSectorEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SectorID", entity.SectorID },
        { "@Sector",   entity.Sector   },
        { "@IsActive", entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterSector", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterSector(MasterSectorEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SectorID", entity.SectorID },
        { "@Sector",   entity.Sector   },
        { "@IsActive", entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterSector", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterSector(int SectorID)
        {
            var param = new Dictionary<string, object> { { "@SectorID", SectorID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterSector", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ElectiveSubject Methods

        public DataTable GetMasterElectiveSubjects()
        {
            return _dbAccess.GetDataTable("sp_GetMasterElectiveSubjects");
        }

        public bool InsertMasterElectiveSubject(MasterElectiveSubjectEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SubjectName", entity.SubjectName                              },
        { "@SubjectType", entity.SubjectType                              },
        { "@GroupID",     entity.GroupID                                  },
        { "@CourseID",    entity.CourseID    ?? (object)DBNull.Value      },
        { "@IsActive",    entity.IsActive                                 },
        { "@SubjectCode", entity.SubjectCode ?? (object)DBNull.Value      },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterElectiveSubject", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterElectiveSubject(MasterElectiveSubjectEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",          entity.ID                                       },
        { "@SubjectName", entity.SubjectName                              },
        { "@SubjectType", entity.SubjectType                              },
        { "@GroupID",     entity.GroupID                                  },
        { "@CourseID",    entity.CourseID    ?? (object)DBNull.Value      },
        { "@IsActive",    entity.IsActive                                 },
        { "@SubjectCode", entity.SubjectCode ?? (object)DBNull.Value      },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterElectiveSubject", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterElectiveSubject(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterElectiveSubject", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region MasterTitle Methods

        public DataTable GetMasterTitles()
        {
            return _dbAccess.GetDataTable("sp_GetMasterTitles");
        }

        public bool InsertMasterTitle(MasterTitleEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@TitleID",  entity.TitleID  },
        { "@Title",    entity.Title    },
        { "@IsActive", entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterTitle", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterTitle(MasterTitleEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@TitleID",  entity.TitleID  },
        { "@Title",    entity.Title    },
        { "@IsActive", entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterTitle", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterTitle(int TitleID)
        {
            var param = new Dictionary<string, object> { { "@TitleID", TitleID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterTitle", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region SignatureAuthority Methods

        public DataTable GetMasterSignatureAuthorities()
        {
            return _dbAccess.GetDataTable("sp_GetMasterSignatureAuthorities");
        }

        public int InsertMasterSignatureAuthority(MasterSignatureAuthorityEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SignatureType",   entity.SignatureType   ?? (object)DBNull.Value },
        { "@NameOfAuthority", entity.NameOfAuthority ?? (object)DBNull.Value },
        { "@Designation",     entity.Designation     ?? (object)DBNull.Value },
        { "@SignaturePath",   entity.SignaturePath   ?? (object)DBNull.Value },
        { "@IsActive",        entity.IsActive         },
        { "@IsCurrent",       entity.IsCurrent        },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterSignatureAuthority", param);
            return result != null && result != DBNull.Value ? Convert.ToInt32(result) : 0;
        }

        public bool UpdateMasterSignatureAuthority(MasterSignatureAuthorityEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",              entity.ID },
        { "@SignatureType",   entity.SignatureType   ?? (object)DBNull.Value },
        { "@NameOfAuthority", entity.NameOfAuthority ?? (object)DBNull.Value },
        { "@Designation",     entity.Designation     ?? (object)DBNull.Value },
        { "@SignaturePath",   entity.SignaturePath   ?? (object)DBNull.Value },
        { "@IsActive",        entity.IsActive         },
        { "@IsCurrent",       entity.IsCurrent        },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterSignatureAuthority", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterSignatureAuthority(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterSignatureAuthority", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region FloorPreference Methods

        public DataTable GetMasterFloorPreferences()
        {
            return _dbAccess.GetDataTable("sp_GetMasterFloorPreferences");
        }

        public bool InsertMasterFloorPreference(MasterFloorPreferenceEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@FloorId",   entity.FloorId   },
        { "@FloorName", entity.FloorName },
        { "@IsActive",  entity.IsActive  },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterFloorPreference", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterFloorPreference(MasterFloorPreferenceEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@FloorId",   entity.FloorId   },
        { "@FloorName", entity.FloorName },
        { "@IsActive",  entity.IsActive  },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterFloorPreference", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterFloorPreference(int FloorId)
        {
            var param = new Dictionary<string, object> { { "@FloorId", FloorId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterFloorPreference", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion
        
        #region GrievanceCategory Methods

        public DataTable GetMasterGrievanceCategories()
        {
            return _dbAccess.GetDataTable("sp_GetMasterGrievanceCategories");
        }

        public bool InsertMasterGrievanceCategory(MasterGrievanceCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@GrievanceCategoryID", entity.GrievanceCategoryID },
        { "@GrievanceCategory",   entity.GrievanceCategory   },
        { "@IsActive",            entity.IsActive            },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterGrievanceCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterGrievanceCategory(MasterGrievanceCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@GrievanceCategoryID", entity.GrievanceCategoryID },
        { "@GrievanceCategory",   entity.GrievanceCategory   },
        { "@IsActive",            entity.IsActive            },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterGrievanceCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterGrievanceCategory(int GrievanceCategoryID)
        {
            var param = new Dictionary<string, object> { { "@GrievanceCategoryID", GrievanceCategoryID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterGrievanceCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion
       
        #region FAQCategory Methods

        public DataTable GetMasterFAQCategories()
        {
            return _dbAccess.GetDataTable("sp_GetMasterFAQCategories");
        }

        public bool InsertMasterFAQCategory(MasterFAQCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@FAQCategoryID", entity.FAQCategoryID },
        { "@FAQCategory",   entity.FAQCategory   },
        { "@IsActive",      entity.IsActive      },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterFAQCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterFAQCategory(MasterFAQCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@FAQCategoryID", entity.FAQCategoryID },
        { "@FAQCategory",   entity.FAQCategory   },
        { "@IsActive",      entity.IsActive      },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterFAQCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterFAQCategory(int FAQCategoryID)
        {
            var param = new Dictionary<string, object> { { "@FAQCategoryID", FAQCategoryID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterFAQCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion
       
        #region FacilitySubGroup Methods

        public DataTable GetMasterFacilitySubGroups()
        {
            return _dbAccess.GetDataTable("sp_GetMasterFacilitySubGroups");
        }

        public bool InsertMasterFacilitySubGroup(MasterFacilitySubGroupEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SubFacilityGroupId", entity.SubFacilityGroupId },
        { "@FacilityGroupId",    entity.FacilityGroupId    },
        { "@SubFacilityGroup",   entity.SubFacilityGroup   },
        { "@RequiredNumber",     entity.RequiredNumber     },
        { "@RequiredSpace",      entity.RequiredSpace      },
        { "@HasMultiplyFactor",  entity.HasMultiplyFactor  },
        { "@IsActive",           entity.IsActive           },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterFacilitySubGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterFacilitySubGroup(MasterFacilitySubGroupEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SubFacilityGroupId", entity.SubFacilityGroupId },
        { "@FacilityGroupId",    entity.FacilityGroupId    },
        { "@SubFacilityGroup",   entity.SubFacilityGroup   },
        { "@RequiredNumber",     entity.RequiredNumber     },
        { "@RequiredSpace",      entity.RequiredSpace      },
        { "@HasMultiplyFactor",  entity.HasMultiplyFactor  },
        { "@IsActive",           entity.IsActive           },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterFacilitySubGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterFacilitySubGroup(int SubFacilityGroupId)
        {
            var param = new Dictionary<string, object> { { "@SubFacilityGroupId", SubFacilityGroupId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterFacilitySubGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region JobRole Methods (Data Access)
 
public DataTable GetMasterJobRoles()
{
    return _dbAccess.GetDataTable("sp_GetMasterJobRoles");
}
 
public bool InsertMasterJobRole(MasterJobRoleEntity entity)
{
    var param = new Dictionary<string, object>
    {
        { "@ID",          entity.ID          },
        { "@JobRoleName", entity.JobRoleName },
        { "@IsActive",    entity.IsActive    },
    };
    object result = _dbAccess.ExecuteScalar("sp_InsertMasterJobRole", param);
    return result != null && Convert.ToInt32(result) > 0;
}
 
public bool UpdateMasterJobRole(MasterJobRoleEntity entity)
{
            var param = new Dictionary<string, object>
    {
        { "@ID",          entity.ID          },
        { "@JobRoleName", entity.JobRoleName },
        { "@IsActive",    entity.IsActive    },
    };
    object result = _dbAccess.ExecuteScalar("sp_UpdateMasterJobRole   ", param);
    return result != null && Convert.ToInt32(result) > 0;
}
 
public bool SoftDeleteMasterJobRole(int ID)
{
    var param = new Dictionary<string, object> { { "@ID", ID } };
    object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterJobRole", param);
    return result != null && Convert.ToInt32(result) > 0;
}

        #endregion

        #region LocationCategory Methods

        public DataTable GetMasterLocationCategories()
        {
            return _dbAccess.GetDataTable("sp_GetMasterLocationCategories");
        }

        public bool InsertMasterLocationCategory(MasterLocationCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            { "@LocationCategoryID", entity.LocationCategoryID },
            { "@LocationCategory",   entity.LocationCategory   },
            { "@IsActive",           entity.IsActive           },
        };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterLocationCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterLocationCategory(MasterLocationCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            { "@LocationCategoryID", entity.LocationCategoryID },
            { "@LocationCategory",   entity.LocationCategory   },
            { "@IsActive",           entity.IsActive           },
        };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterLocationCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterLocationCategory(int LocationCategoryID)
        {
            var param = new Dictionary<string, object> { { "@LocationCategoryID", LocationCategoryID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterLocationCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region LandOwnershipType Methods

        public DataTable GetMasterLandOwnershipTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterLandOwnershipTypes");
        }

        public bool InsertMasterLandOwnershipType(MasterLandOwnershipTypeEntity entity)
        {
            var param = new Dictionary<string, object>
            {
                { "@OwnerShipTypeid", entity.OwnerShipTypeid },
                { "@OwnerShipType",   entity.OwnerShipType   },
                { "@IsActive",        entity.IsActive        },
            };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterLandOwnershipType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterLandOwnershipType(MasterLandOwnershipTypeEntity entity)
        {
            var param = new Dictionary<string, object>
            {
                { "@OwnerShipTypeid", entity.OwnerShipTypeid },
                { "@OwnerShipType",   entity.OwnerShipType   },
                { "@IsActive",        entity.IsActive        },
            };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterLandOwnershipType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterLandOwnershipType(int OwnerShipTypeid)
        {
            var param = new Dictionary<string, object> { { "@OwnerShipTypeid", OwnerShipTypeid } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterLandOwnershipType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region Master Month Methods

        public DataTable GetMasterMonths()
        {
            return _dbAccess.GetDataTable("sp_GetMasterMonths");
        }

        public bool InsertMasterMonth(MasterMonthEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@MonthId",    entity.MonthId    },
        { "@MonthsName", entity.MonthsName },
        { "@IsActive",   entity.IsActive   },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterMonth", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterMonth(MasterMonthEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@MonthId",    entity.MonthId    },
        { "@MonthsName", entity.MonthsName },
        { "@IsActive",   entity.IsActive   },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterMonth", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterMonth(int MonthId)
        {
            var param = new Dictionary<string, object> { { "@MonthId", MonthId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterMonth", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region SecurityQuestion Methods

        public DataTable GetMasterSecurityQuestions()
        {
            return _dbAccess.GetDataTable("sp_GetMasterSecurityQuestions");
        }

        public bool InsertMasterSecurityQuestion(MasterSecurityQuestionEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            { "@SecurityQuestionID", entity.SecurityQuestionID },
            { "@SecurityQuestion",   entity.SecurityQuestion   },
            { "@IsActive",           entity.IsActive           },
        };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterSecurityQuestion", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterSecurityQuestion(MasterSecurityQuestionEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            { "@SecurityQuestionID", entity.SecurityQuestionID },
            { "@SecurityQuestion",   entity.SecurityQuestion   },
            { "@IsActive",           entity.IsActive           },
        };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterSecurityQuestion", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterSecurityQuestion(int SecurityQuestionID)
        {
            var param = new Dictionary<string, object> { { "@SecurityQuestionID", SecurityQuestionID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterSecurityQuestion", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region SkillTrade Methods

        public DataTable GetMasterSkillTrades()
        {
            return _dbAccess.GetDataTable("sp_GetMasterSkillTrades");
        }

        public bool InsertMasterSkillTrade(MasterSkillTradeEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            { "@TradeName", entity.TradeName                          },
        { "@TradeCode", entity.TradeCode ?? (object)DBNull.Value  },
        { "@IsActive",  entity.IsActive                           },
        };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterSkillTrade", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterSkillTrade(MasterSkillTradeEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            { "@ID",        entity.ID                                     },
            { "@TradeName", entity.TradeName                              },
            { "@TradeCode", entity.TradeCode ?? (object)DBNull.Value      },
            { "@IsActive",  entity.IsActive                               },
        };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterSkillTrade", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterSkillTrade(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterSkillTrade", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion
        
        #region Qualification Methods

        public DataTable GetMasterQualifications()
        {
            return _dbAccess.GetDataTable("sp_GetMasterQualifications");
        }

        public bool InsertMasterQualification(MasterQualificationEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@QualificationID",      entity.QualificationID                              },
        { "@Qualification",       entity.Qualification                                },
        { "@QualificationGroup",  entity.QualificationGroup                           },
        { "@SeqNO",               entity.SeqNO           ?? (object)DBNull.Value       },
        { "@IsActive",            entity.IsActive                                      },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterQualification", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterQualification(MasterQualificationEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@QualificationID",      entity.QualificationID                              },
        { "@Qualification",       entity.Qualification                                },
        { "@QualificationGroup",  entity.QualificationGroup                           },
        { "@SeqNO",               entity.SeqNO           ?? (object)DBNull.Value       },
        { "@IsActive",            entity.IsActive                                      },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterQualification", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterQualification(int QualificationID)
        {
            var param = new Dictionary<string, object> { { "@QualificationID", QualificationID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterQualification", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region RestrictedKeyword Methods

        public DataTable GetMasterRestrictedKeywords()
        {
            return _dbAccess.GetDataTable("sp_GetMasterRestrictedKeywords");
        }

        public bool InsertMasterRestrictedKeyword(MasterRestrictedKeywordEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@KeyWordID",   entity.KeyWordID   },
        { "@KeyWordName", entity.KeyWordName },
        { "@IsActive",    entity.IsActive    },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterRestrictedKeyword", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterRestrictedKeyword(MasterRestrictedKeywordEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@KeyWordID",   entity.KeyWordID   },
        { "@KeyWordName", entity.KeyWordName },
        { "@IsActive",    entity.IsActive    },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterRestrictedKeyword", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterRestrictedKeyword(int KeyWordID)
        {
            var param = new Dictionary<string, object> { { "@KeyWordID", KeyWordID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterRestrictedKeyword", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region Master_Shift Methods

        public DataTable GetMasterShifts()
        {
            return _dbAccess.GetDataTable("sp_GetMasterShifts");
        }

        public bool InsertMasterShift(MasterShiftEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@Shift",    entity.Shift },
        { "@IsActive", entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterShift", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterShift(MasterShiftEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ShiftID",  entity.ShiftID },
        { "@Shift",    entity.Shift },
        { "@IsActive", entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterShift", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterShift(int ShiftID)
        {
            var param = new Dictionary<string, object> { { "@ShiftID", ShiftID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterShift", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region VCApplication Methods

        public DataTable GetMasterVCApplications()
        {
            return _dbAccess.GetDataTable("sp_GetMasterVCApplications");
        }

        public int InsertMasterVCApplication(MasterVCApplicationEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@VCApplication", entity.VCApplication },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterVCApplication", param);
            return result != null && result != DBNull.Value ? Convert.ToInt32(result) : 0;
        }
        public bool UpdateMasterVCApplication(MasterVCApplicationEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            { "@ID",            entity.ID            },
            { "@VCApplication", entity.VCApplication },
        };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterVCApplication", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool DeleteMasterVCApplication(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_DeleteMasterVCApplication", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region TypeofInstitute Methods

        public DataTable GetMasterTypeofInstitutes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterTypeofInstitute");
        }

        public bool InsertMasterTypeofInstitute(MasterTypeofInstituteEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@TypefInstitute", entity.TypefInstitute },
        { "@IsActive",       entity.IsActive        },
        { "@SeqNo",          entity.SeqNo           },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterTypeofInstitute", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterTypeofInstitute(MasterTypeofInstituteEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",             entity.ID              },
        { "@TypefInstitute", entity.TypefInstitute  },
        { "@IsActive",       entity.IsActive        },
        { "@SeqNo",          entity.SeqNo           },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterTypeofInstitute", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterTypeofInstitute(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterTypeofInstitute", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region TrainingRemarkforUtilization Methods

        public DataTable GetMasterTrainingRemarkforUtilization()
        {
            return _dbAccess.GetDataTable("sp_GetMasterTrainingRemarkforUtilization");
        }

        public int GetNextTrainingRemarkforUtilizationID()
        {
            var param = new Dictionary<string, object>();
            object result = _dbAccess.ExecuteScalar("sp_GetNextTrainingRemarkforUtilizationID", param);
            return result != null ? Convert.ToInt32(result) : 1;
        }

        public bool InsertMasterTrainingRemarkforUtilization(MasterTrainingRemarkforUtilizationEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                   entity.ID                   },
        { "@RemarkforUtilization", entity.RemarkforUtilization },
        { "@IsActive",             entity.IsActive              },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterTrainingRemarkforUtilization", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterTrainingRemarkforUtilization(MasterTrainingRemarkforUtilizationEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                   entity.ID                   },
        { "@RemarkforUtilization", entity.RemarkforUtilization },
        { "@IsActive",             entity.IsActive              },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterTrainingRemarkforUtilization", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterTrainingRemarkforUtilization(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterTrainingRemarkforUtilization", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region TrainingFeeCategory Methods (DataAccess)

        public DataTable GetMasterTrainingFeeCategories()
        {
            return _dbAccess.GetDataTable("sp_GetMasterTrainingFeeCategories");
        }

        public int InsertMasterTrainingFeeCategory(MasterTrainingFeeCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
{
    { "@ID",                  entity.ID                  },
    { "@TrainingFeeCategory", entity.TrainingFeeCategory },
    { "@IsActive",            entity.IsActive            },
};
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterTrainingFeeCategory", param);
            return (result != null && result != DBNull.Value && Convert.ToInt32(result) > 0) ? entity.ID : 0;
        }

        public bool UpdateMasterTrainingFeeCategory(MasterTrainingFeeCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                  entity.ID                  },
        { "@TrainingFeeCategory", entity.TrainingFeeCategory },
        { "@IsActive",            entity.IsActive            },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterTrainingFeeCategory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterTrainingFeeCategory(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterTrainingFeeCategory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }
        #endregion

        #region TrainingEquipment Methods

        public DataTable GetMasterTrainingEquipment()
        {
            return _dbAccess.GetDataTable("sp_GetMasterTrainingEquipment");
        }

        public bool InsertMasterTrainingEquipment(MasterTrainingEquipmentEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@NameofItem", entity.NameofItem                   },
        { "@ItemCode",   entity.ItemCode ?? (object)DBNull.Value },
        { "@IsActive",   entity.IsActive                     },
    };
            // IDENTITY PK - no @ID param, SP returns SCOPE_IDENTITY()
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterTrainingEquipment", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterTrainingEquipment(MasterTrainingEquipmentEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",         entity.ID                           },
        { "@NameofItem", entity.NameofItem                   },
        { "@ItemCode",   entity.ItemCode ?? (object)DBNull.Value },
        { "@IsActive",   entity.IsActive                     },
    };
            // Non-identity SP - result is @@ROWCOUNT
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterTrainingEquipment", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterTrainingEquipment(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterTrainingEquipment", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region TrainingCategory Methods

        public DataTable GetMasterTrainingCategories()
        {
            return _dbAccess.GetDataTable("sp_GetMasterTrainingCategories");
        }

        public bool InsertMasterTrainingCategory(MasterTrainingCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@TrainingCategory", entity.TrainingCategory },
        { "@IsActive",         entity.IsActive          },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterTrainingCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterTrainingCategory(MasterTrainingCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",               entity.ID               },
        { "@TrainingCategory", entity.TrainingCategory },
        { "@IsActive",         entity.IsActive          },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterTrainingCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterTrainingCategory(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterTrainingCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region TrainingNameOfItem Methods

        public DataTable GetMasterTrainingNameOfItems()
        {
            return _dbAccess.GetDataTable("sp_GetMasterTrainingNameOfItems");
        }


        public int InsertMasterTrainingNameOfItem(MasterTrainingNameOfItemEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@TrainingNameofItem", entity.TrainingNameofItem },
        //{ "@TraningCategoryID",  entity.TraningCategoryID  },
        { "@IsActive",           entity.IsActive           },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterTrainingNameOfItem", param);
            return result != null ? Convert.ToInt32(result) : 0;
        }

        public bool UpdateMasterTrainingNameOfItem(MasterTrainingNameOfItemEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                 entity.ID                 },
        { "@TrainingNameofItem", entity.TrainingNameofItem },
        //{ "@TraningCategoryID",  entity.TraningCategoryID  },
        { "@IsActive",           entity.IsActive           },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterTrainingNameOfItem", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterTrainingNameOfItem(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterTrainingNameOfItem", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region EquipmentCategory Methods
 
public DataTable GetMasterEquipmentCategories()
{
    return _dbAccess.GetDataTable("sp_GetMasterEquipmentCategories");
}
 
public bool InsertMasterEquipmentCategory(MasterEquipmentCategoryEntity entity)
{
    var param = new Dictionary<string, object>
    {
        { "@EquipmentCategoryId", entity.EquipmentCategoryId },
        { "@EquipmentCategory",   entity.EquipmentCategory   },
        { "@IsActive",            entity.IsActive            },
    };
    object result = _dbAccess.ExecuteScalar("sp_InsertMasterEquipmentCategory", param);
    return result != null && Convert.ToInt32(result) > 0;
}
 
public bool UpdateMasterEquipmentCategory(MasterEquipmentCategoryEntity entity)
{
    var param = new Dictionary<string, object>
    {
        { "@EquipmentCategoryId", entity.EquipmentCategoryId },
        { "@EquipmentCategory",   entity.EquipmentCategory   },
        { "@IsActive",            entity.IsActive            },
    };
    object result = _dbAccess.ExecuteScalar("sp_UpdateMasterEquipmentCategory", param);
    return result != null && Convert.ToInt32(result) > 0;
}
 
public bool SoftDeleteMasterEquipmentCategory(int EquipmentCategoryId)
{
    var param = new Dictionary<string, object> { { "@EquipmentCategoryId", EquipmentCategoryId } };
    object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterEquipmentCategory", param);
    return result != null && Convert.ToInt32(result) > 0;
}

        #endregion

        #region SectorialExpertise Methods

        public DataTable GetMasterSectorialExpertise()
        {
            return _dbAccess.GetDataTable("sp_GetMasterSectorialExpertise");
        }

        public bool InsertMasterSectorialExpertise(MasterSectorialExpertiseEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SectorialExpertiseName", entity.SectorialExpertiseName },
        { "@SeqNo",                  entity.SeqNo ?? (object)DBNull.Value },
        { "@IsActive",               entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterSectorialExpertise", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterSectorialExpertise(MasterSectorialExpertiseEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SectorialExpertiseID",   entity.SectorialExpertiseID },
        { "@SectorialExpertiseName", entity.SectorialExpertiseName },
        { "@SeqNo",                  entity.SeqNo ?? (object)DBNull.Value },
        { "@IsActive",               entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterSectorialExpertise", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterSectorialExpertise(int SectorialExpertiseID)
        {
            var param = new Dictionary<string, object> { { "@SectorialExpertiseID", SectorialExpertiseID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterSectorialExpertise", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region SubjectTypeExam Methods

        public DataTable GetMasterSubjectTypeExam()
        {
            return _dbAccess.GetDataTable("sp_GetSubjectTypeExam");
        }

        // SubjectTypeExamID is IDENTITY -> never sent on insert, DB/SP assigns it.
        public bool InsertMasterSubjectTypeExam(SubjectTypeExamEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SubjectTypeExamName", entity.SubjectTypeExamName },
        { "@IsActive",            entity.IsActive            },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertSubjectTypeExam", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterSubjectTypeExam(SubjectTypeExamEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SubjectTypeExamID",   entity.SubjectTypeExamID   },
        { "@SubjectTypeExamName", entity.SubjectTypeExamName },
        { "@IsActive",            entity.IsActive            },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateSubjectTypeExam", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterSubjectTypeExam(int SubjectTypeExamID)
        {
            var param = new Dictionary<string, object> { { "@SubjectTypeExamID", SubjectTypeExamID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteSubjectTypeExam", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region PromoterStatus Methods

        public DataTable GetMasterPromoterStatuses()
        {
            return _dbAccess.GetDataTable("sp_GetMasterPromoterStatuses");
        }

        public bool InsertMasterPromoterStatus(MasterPromoterStatusEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@PromoterStatusID", entity.PromoterStatusID },
        { "@PromoterStatus",   entity.PromoterStatus    },
        { "@IsActive",         entity.IsActive           },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterPromoterStatus", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterPromoterStatus(MasterPromoterStatusEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@PromoterStatusID", entity.PromoterStatusID },
        { "@PromoterStatus",   entity.PromoterStatus    },
        { "@IsActive",         entity.IsActive           },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterPromoterStatus", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterPromoterStatus(int PromoterStatusID)
        {
            var param = new Dictionary<string, object> { { "@PromoterStatusID", PromoterStatusID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterPromoterStatus", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region PromoterType Methods

        public DataTable GetMasterPromoterTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterPromoterTypes");
        }

        public bool InsertMasterPromoterType(MasterPromoterTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@PromoterTypeID", entity.PromoterTypeID                              },
        { "@PromoterType",   entity.PromoterType                                },
        { "@PromoterGroup",  entity.PromoterGroup ?? (object)DBNull.Value       },
        { "@IsActive",       entity.IsActive                                    },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterPromoterType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterPromoterType(MasterPromoterTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@PromoterTypeID", entity.PromoterTypeID                              },
        { "@PromoterType",   entity.PromoterType                                },
        { "@PromoterGroup",  entity.PromoterGroup ?? (object)DBNull.Value       },
        { "@IsActive",       entity.IsActive                                    },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterPromoterType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterPromoterType(int PromoterTypeID)
        {
            var param = new Dictionary<string, object> { { "@PromoterTypeID", PromoterTypeID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterPromoterType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion
        
        #region PromotingType Methods

        public DataTable GetMasterPromotingTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterPromotingTypes");
        }

        public bool InsertMasterPromotingType(MasterPromotingTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@PromotingType",  entity.PromotingType },
        { "@PromotingTypeID", entity.PromotingTypeID },
        { "@PromotingGroup", entity.PromotingGroup ?? (object)DBNull.Value },
        { "@IsActive",       entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterPromotingType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterPromotingType(MasterPromotingTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@PromotingTypeID", entity.PromotingTypeID },
        { "@PromotingType",   entity.PromotingType },
        { "@PromotingGroup",  entity.PromotingGroup ?? (object)DBNull.Value },
        { "@IsActive",        entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterPromotingType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterPromotingType(int PromotingTypeID)
        {
            var param = new Dictionary<string, object> { { "@PromotingTypeID", PromotingTypeID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterPromotingType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region NotificationCategory Methods

        public DataTable GetMasterNotificationCategories()
        {
            return _dbAccess.GetDataTable("sp_GetMasterNotificationCategories");
        }

        public bool InsertMasterNotificationCategory(MasterNotificationCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@NotificationCategoryID", entity.NotificationCategoryID },
        { "@NotificationCategory",   entity.NotificationCategory   },
        { "@IsActive",               entity.IsActive                },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterNotificationCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterNotificationCategory(MasterNotificationCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@NotificationCategoryID", entity.NotificationCategoryID },
        { "@NotificationCategory",   entity.NotificationCategory   },
        { "@IsActive",               entity.IsActive                },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterNotificationCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterNotificationCategory(int NotificationCategoryID)
        {
            var param = new Dictionary<string, object> { { "@NotificationCategoryID", NotificationCategoryID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterNotificationCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region MasterOtherInfra Methods

        public DataTable GetMasterOtherInfra()
        {
            return _dbAccess.GetDataTable("sp_GetMasterOtherInfra");
        }

        public bool InsertMasterOtherInfra(MasterOtherInfraEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@OtherInfraId", entity.OtherInfraId },
        { "@OtherInfra",   entity.OtherInfra ?? (object)DBNull.Value },
        { "@IsActive",     entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterOtherInfra", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterOtherInfra(MasterOtherInfraEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@OtherInfraId", entity.OtherInfraId },
        { "@OtherInfra",   entity.OtherInfra ?? (object)DBNull.Value },
        { "@IsActive",     entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterOtherInfra", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterOtherInfra(int OtherInfraId)
        {
            var param = new Dictionary<string, object> { { "@OtherInfraId", OtherInfraId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterOtherInfra", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region OtherInfraOptions Methods

        public DataTable GetMasterOtherInfraOptions()
        {
            return _dbAccess.GetDataTable("sp_GetMasterOtherInfraOptions");
        }

        public bool InsertMasterOtherInfraOptions(MasterOtherInfraOptionEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@OtherInfraId", entity.OtherInfraId },
        { "@OtherInfra",   entity.OtherInfra   },
        { "@IsActive",     entity.IsActive     },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterOtherInfraOptions", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterOtherInfraOptions(MasterOtherInfraOptionEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@OtherInfraId", entity.OtherInfraId },
        { "@OtherInfra",   entity.OtherInfra   },
        { "@IsActive",     entity.IsActive     },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterOtherInfraOptions", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterOtherInfraOptions(int OtherInfraId)
        {
            var param = new Dictionary<string, object> { { "@OtherInfraId", OtherInfraId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterOtherInfraOptions", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region UserType Methods

        public DataTable GetMasterUserTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterUserTypes");
        }

        public bool InsertMasterUserType(MasterUserTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@UserTypeID",             entity.UserTypeID                                     },
        { "@UserType",               entity.UserType                                       },
        { "@UserTypeCode",           entity.UserTypeCode           ?? (object)DBNull.Value  },
        { "@UserInitial",            entity.UserInitial            ?? (object)DBNull.Value  },
        { "@DashboardURL",           entity.DashboardURL           ?? (object)DBNull.Value  },
        { "@IsAdmin",                entity.IsAdmin                                         },
        { "@IsMultipleLoginAllowed", entity.IsMultipleLoginAllowed                          },
        { "@IsActive",               entity.IsActive                                        },
        { "@DashboardURLReact",      entity.DashboardURLReact      ?? (object)DBNull.Value  },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterUserType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterUserType(MasterUserTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@UserTypeID",             entity.UserTypeID                                     },
        { "@UserType",               entity.UserType                                       },
        { "@UserTypeCode",           entity.UserTypeCode           ?? (object)DBNull.Value  },
        { "@UserInitial",            entity.UserInitial            ?? (object)DBNull.Value  },
        { "@DashboardURL",           entity.DashboardURL           ?? (object)DBNull.Value  },
        { "@IsAdmin",                entity.IsAdmin                                         },
        { "@IsMultipleLoginAllowed", entity.IsMultipleLoginAllowed                          },
        { "@IsActive",               entity.IsActive                                        },
        { "@DashboardURLReact",      entity.DashboardURLReact      ?? (object)DBNull.Value  },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterUserType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterUserType(int UserTypeID)
        {
            var param = new Dictionary<string, object> { { "@UserTypeID", UserTypeID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterUserType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region NSQFLevel Methods (DAL)

        public DataTable GetMasterNSQFLevels()
        {
            return _dbAccess.GetDataTable("sp_GetMasterNSQFLevels");
        }

        // Returns the newly created ID (0 if failed).
        public int InsertMasterNSQFLevel(MasterNSQFLevelEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@NSQFLEVEL", entity.NSQFLEVEL },
        { "@IsActive",  entity.IsActive  },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterNSQFLevel", param);
            return result != null ? Convert.ToInt32(result) : 0;
        }

        public bool UpdateMasterNSQFLevel(MasterNSQFLevelEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",        entity.ID        },
        { "@NSQFLEVEL", entity.NSQFLEVEL },
        { "@IsActive",  entity.IsActive  },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterNSQFLevel", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterNSQFLevel(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterNSQFLevel", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ProjectConfiguration Methods

        public DataTable GetMasterProjectConfigurations()
        {
            return _dbAccess.GetDataTable("sp_GetMasterProjectConfigurations");
        }

        public bool InsertMasterProjectConfiguration(MasterProjectConfigurationEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@RegionID",            entity.RegionID                                        },
        { "@AppKey",              entity.AppKey                                          },
        { "@AppKeyDetails",       entity.AppKeyDetails                                   },
        { "@AppValue",            entity.AppValue         ?? (object)DBNull.Value        },
        { "@ControlRequired",     entity.ControlRequired                                 },
        { "@ControlMaxValue",     entity.ControlMaxValue  ?? (object)DBNull.Value        },
        { "@IsActive",            entity.IsActive                                        },
        { "@ModifiedBy",          entity.ModifiedBy          ?? (object)DBNull.Value     },
        { "@ModifiedByIPAddress", entity.ModifiedByIPAddress ?? (object)DBNull.Value     },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterProjectConfiguration", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterProjectConfiguration(MasterProjectConfigurationEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SeqNo",               entity.SeqNo                                           },
        { "@RegionID",            entity.RegionID                                        },
        { "@AppKey",              entity.AppKey                                          },
        { "@AppKeyDetails",       entity.AppKeyDetails                                   },
        { "@AppValue",            entity.AppValue         ?? (object)DBNull.Value        },
        { "@ControlRequired",     entity.ControlRequired                                 },
        { "@ControlMaxValue",     entity.ControlMaxValue  ?? (object)DBNull.Value        },
        { "@IsActive",            entity.IsActive                                        },
        { "@ModifiedBy",          entity.ModifiedBy          ?? (object)DBNull.Value     },
        { "@ModifiedByIPAddress", entity.ModifiedByIPAddress ?? (object)DBNull.Value     },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterProjectConfiguration", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterProjectConfiguration(int SeqNo)
        {
            var param = new Dictionary<string, object> { { "@SeqNo", SeqNo } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterProjectConfiguration", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ITISpecificationCategory Methods

        public DataTable GetMasterITISpecificationCategories()
        {
            return _dbAccess.GetDataTable("sp_GetMasterITISpecificationCategories");
        }

        public bool InsertMasterITISpecificationCategory(MasterITISpecificationCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@CategoryName", entity.CategoryName },
        { "@IsActive",     entity.IsActive     },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterITISpecificationCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterITISpecificationCategory(MasterITISpecificationCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",           entity.ID           },
        { "@CategoryName", entity.CategoryName },
        { "@IsActive",     entity.IsActive     },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterITISpecificationCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterITISpecificationCategory(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterITISpecificationCategory", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ITISpecificationGroup Methods

        public DataTable GetMasterITISpecificationGroups()
        {
            return _dbAccess.GetDataTable("sp_GetMasterITISpecificationGroups");
        }

        public bool InsertMasterITISpecificationGroup(MasterITISpecificationGroupEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@GroupName", entity.GroupName },
        { "@IsActive",  entity.IsActive  },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterITISpecificationGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterITISpecificationGroup(MasterITISpecificationGroupEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",        entity.ID        },
        { "@GroupName", entity.GroupName },
        { "@IsActive",  entity.IsActive  },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterITISpecificationGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterITISpecificationGroup(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterITISpecificationGroup", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ITISpecificationItem Methods

        public DataTable GetMasterITISpecificationItems()
        {
            return _dbAccess.GetDataTable("sp_GetMasterITISpecificationItems");
        }

        public bool InsertMasterITISpecificationItem(MasterITISpecificationItemEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@NameofITem", entity.NameofITem },
        { "@ItemCode",   entity.ItemCode ?? (object)DBNull.Value },
        { "@IsActive",   entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterITISpecificationItem", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterITISpecificationItem(MasterITISpecificationItemEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",         entity.ID },
        { "@NameofITem", entity.NameofITem },
        { "@ItemCode",   entity.ItemCode ?? (object)DBNull.Value },
        { "@IsActive",   entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterITISpecificationItem", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterITISpecificationItem(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterITISpecificationItem", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ITISpecificationNameofItemAsperDGT Methods

        public DataTable GetMasterITISpecificationNameofItemAsperDGT()
        {
            return _dbAccess.GetDataTable("sp_GetMasterITISpecificationNameofItemAsperDGT");
        }

        public bool InsertMasterITISpecificationNameofItemAsperDGT(MasterITISpecificationNameofItemAsperDGTEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ItemAsperDGT", entity.ItemAsperDGT ?? (object)DBNull.Value },
        { "@IsActive",     entity.IsActive                             },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterITISpecificationNameofItemAsperDGT", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterITISpecificationNameofItemAsperDGT(MasterITISpecificationNameofItemAsperDGTEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",           entity.ID                                    },
        { "@ItemAsperDGT", entity.ItemAsperDGT ?? (object)DBNull.Value },
        { "@IsActive",     entity.IsActive                              },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterITISpecificationNameofItemAsperDGT", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterITISpecificationNameofItemAsperDGT(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterITISpecificationNameofItemAsperDGT", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region MasterSubject Methods

        public DataTable GetMasterSubjects()
        {
            return _dbAccess.GetDataTable("sp_GetMasterSubjects");
        }

        // SubjectId is IDENTITY -> never sent on insert, DB/SP assigns it.
        public bool InsertMasterSubject(MasterSubjectEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SubjectName",   entity.SubjectName                            },
        { "@SubjectCode",   entity.SubjectCode                            },
        { "@SubjectType",   entity.SubjectType   ?? (object)DBNull.Value  },
        { "@SubjectTypeID", entity.SubjectTypeID                          },
        { "@IsActive",      entity.IsActive                               },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterSubject", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterSubject(MasterSubjectEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SubjectId",     entity.SubjectId                              },
        { "@SubjectName",   entity.SubjectName                            },
        { "@SubjectCode",   entity.SubjectCode                            },
        { "@SubjectType",   entity.SubjectType   ?? (object)DBNull.Value  },
        { "@SubjectTypeID", entity.SubjectTypeID                          },
        { "@IsActive",      entity.IsActive                               },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterSubject", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterSubject(int SubjectId)
        {
            var param = new Dictionary<string, object> { { "@SubjectId", SubjectId } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterSubject", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ItemAsperDVET Methods

        public DataTable GetMasterItemAsperDVETs()
        {
            return _dbAccess.GetDataTable("sp_GetMasterItemAsperDVET");
        }

        public bool InsertMasterItemAsperDVET(MasterItemAsperDVETEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ItemAsperDVET", entity.ItemAsperDVET },
        { "@IsActive",      entity.IsActive      },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterItemAsperDVET", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterItemAsperDVET(MasterItemAsperDVETEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",            entity.ID            },
        { "@ItemAsperDVET", entity.ItemAsperDVET },
        { "@IsActive",      entity.IsActive      },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterItemAsperDVET", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterItemAsperDVET(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterItemAsperDVET", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ITISpecificationSector Methods

        public DataTable GetMasterITISpecificationSectors()
        {
            return _dbAccess.GetDataTable("sp_GetMasterITISpecificationSectors");
        }

        public bool InsertMasterITISpecificationSector(MasterITISpecificationSectorEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SectorName",            entity.SectorName },
        { "@SpecificationDocument", entity.SpecificationDocument ?? (object)DBNull.Value },
        { "@IsActive",              entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterITISpecificationSector", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterITISpecificationSector(MasterITISpecificationSectorEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                    entity.ID },
        { "@SectorName",            entity.SectorName },
        { "@SpecificationDocument", entity.SpecificationDocument ?? (object)DBNull.Value },
        { "@IsActive",              entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterITISpecificationSector", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterITISpecificationSector(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterITISpecificationSector", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ITISpecificationTrade Methods

        public DataTable GetMasterITISpecificationTrades()
        {
            return _dbAccess.GetDataTable("sp_GetMasterITISpecificationTrades");
        }

        public bool InsertMasterITISpecificationTrade(MasterITISpecificationTradeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@TradeName",              entity.TradeName                                },
        { "@TradeCode",              entity.TradeCode              ?? (object)DBNull.Value },
        { "@SpecificationDocument",  entity.SpecificationDocument  ?? (object)DBNull.Value },
        { "@IsActive",               entity.IsActive                                 },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterITISpecificationTrade", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterITISpecificationTrade(MasterITISpecificationTradeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                     entity.ID                                       },
        { "@TradeName",              entity.TradeName                                },
        { "@TradeCode",              entity.TradeCode              ?? (object)DBNull.Value },
        { "@SpecificationDocument",  entity.SpecificationDocument  ?? (object)DBNull.Value },
        { "@IsActive",               entity.IsActive                                 },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterITISpecificationTrade", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterITISpecificationTrade(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterITISpecificationTrade", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ITISpecificationUsage Methods

        public DataTable GetMasterITISpecificationUsages()
        {
            return _dbAccess.GetDataTable("sp_GetMasterITISpecificationUsage");
        }

        public bool InsertMasterITISpecificationUsage(MasterITISpecificationUsageEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@Usage",    entity.Usage    },
        { "@IsActive", entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterITISpecificationUsage", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterITISpecificationUsage(MasterITISpecificationUsageEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",       entity.ID       },
        { "@Usage",    entity.Usage    },
        { "@IsActive", entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterITISpecificationUsage", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterITISpecificationUsage(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterITISpecificationUsage", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ITISpecificationSpecificationAsperDGT Methods (Data Access)

        public DataTable GetMasterITISpecificationSpecificationAsperDGTs()
        {
            return _dbAccess.GetDataTable("sp_GetMasterITISpecificationSpecificationAsperDGTs");
        }

        public bool InsertMasterITISpecificationSpecificationAsperDGT(MasterITISpecificationSpecificationAsperDGTEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@SpecificationDGT", entity.SpecificationDGT },
        { "@IsActive",         entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterITISpecificationSpecificationAsperDGT", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterITISpecificationSpecificationAsperDGT(MasterITISpecificationSpecificationAsperDGTEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",               entity.ID },
        { "@SpecificationDGT", entity.SpecificationDGT },
        { "@IsActive",         entity.IsActive },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterITISpecificationSpecificationAsperDGT", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterITISpecificationSpecificationAsperDGT(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterITISpecificationSpecificationAsperDGT", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ITISpecificationSectorWise Methods (Data Access)

        public DataTable GetMasterITISpecificationSectorWise()
        {
            return _dbAccess.GetDataTable("sp_GetMasterITISpecificationSectorWise");
        }

        public bool InsertMasterITISpecificationSectorWise(MasterITISpecificationSectorWiseEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ItemID",         entity.ItemID },
        { "@GroupID",        entity.GroupID },
        { "@SectorID",       entity.SectorID },
        { "@CategoryID",     entity.CategoryID },
        { "@EstimatedPrice", entity.EstimatedPrice },
        { "@IsActive",       entity.IsActive },
        { "@IsDocShow",      entity.IsDocShow },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterITISpecificationSectorWise", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterITISpecificationSectorWise(MasterITISpecificationSectorWiseEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",             entity.ID },
        { "@ItemID",         entity.ItemID },
        { "@GroupID",        entity.GroupID },
        { "@SectorID",       entity.SectorID },
        { "@CategoryID",     entity.CategoryID },
        { "@EstimatedPrice", entity.EstimatedPrice },
        { "@IsActive",       entity.IsActive },
        { "@IsDocShow",      entity.IsDocShow },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterITISpecificationSectorWise", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterITISpecificationSectorWise(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterITISpecificationSectorWise", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region IgnoreWords Methods
        public DataTable GetMasterIgnoreWordsList()
        {
            return _dbAccess.GetDataTable("Base_GetMaster_IgnoreWords");
        }

        public bool InsertMasterIgnoreWord(MasterIgnoreWordEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        // { "@ID", entity.ID },  
        { "@WordsName",        entity.WordsName },
        { "@IsActive",         entity.IsActive },
        { "@WordstoBeignored", entity.WordstoBeignored ?? (object)DBNull.Value },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterIgnoreWord", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterIgnoreWord(MasterIgnoreWordEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",               entity.ID                                     },
        { "@WordsName",        entity.WordsName                              },
        { "@IsActive",         entity.IsActive                               },
        { "@WordstoBeignored", entity.WordstoBeignored ?? (object)DBNull.Value },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterIgnoreWord", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterIgnoreWord(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterIgnoreWord", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region MasterFinancialYear Methods

        public DataTable GetMasterFinancialYears()
{
    return _dbAccess.GetDataTable("sp_GetMasterFinancialYears");
}

public bool InsertMasterFinancialYear(MasterFinancialYearEntity entity)
{
    var param = new Dictionary<string, object>
    {
        { "@FinancialYear", entity.FinancialYear },
        { "@StartDate",     entity.StartDate },
        { "@EndDate",       entity.EndDate },
        { "@IsActive",      entity.IsActive },
        { "@IsCurrentFY",   entity.IsCurrentFY },
    };
    object result = _dbAccess.ExecuteScalar("sp_InsertMasterFinancialYear", param);
    return result != null && Convert.ToInt32(result) > 0;
}

public bool UpdateMasterFinancialYear(MasterFinancialYearEntity entity)
{
    var param = new Dictionary<string, object>
    {
        { "@FinancialYearID", entity.FinancialYearID },
        { "@FinancialYear",   entity.FinancialYear },
        { "@StartDate",       entity.StartDate },
        { "@EndDate",         entity.EndDate },
        { "@IsActive",        entity.IsActive },
        { "@IsCurrentFY",     entity.IsCurrentFY },
    };
    object result = _dbAccess.ExecuteScalar("sp_UpdateMasterFinancialYear", param);
    return result != null && Convert.ToInt32(result) > 0;
}

public bool SoftDeleteMasterFinancialYear(int FinancialYearID)
{
    var param = new Dictionary<string, object> { { "@FinancialYearID", FinancialYearID } };
    object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterFinancialYear", param);
    return result != null && Convert.ToInt32(result) > 0;
}

public bool SetCurrentFinancialYear(int FinancialYearID)
{
    var param = new Dictionary<string, object> { { "@FinancialYearID", FinancialYearID } };
    object result = _dbAccess.ExecuteScalar("sp_SetCurrentFinancialYear", param);
    return result != null && Convert.ToInt32(result) > 0;
}

        #endregion

        #region User Methods

        public DataTable GetMasterUsers()
        {
            return _dbAccess.GetDataTable("sp_GetMasterUsers");
        }

        public bool InsertMasterUser(MasterUserEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@UserID",                 entity.UserID },
        { "@UserTypeID",             entity.UserTypeID              ?? (object)DBNull.Value },
        { "@UserLoginID",            entity.UserLoginID              ?? (object)DBNull.Value },
        { "@UserPassword",           entity.UserPassword             ?? (object)DBNull.Value },
        { "@UserName",               entity.UserName                 ?? (object)DBNull.Value },
        { "@UserMobileNo",           entity.UserMobileNo             ?? (object)DBNull.Value },
        { "@UserEmailID",            entity.UserEmailID              ?? (object)DBNull.Value },
        { "@SecurityQuestionID",     entity.SecurityQuestionID       ?? (object)DBNull.Value },
        { "@SecurityQuestionAnswer", entity.SecurityQuestionAnswer   ?? (object)DBNull.Value },
        { "@LoggedInSessionID",      entity.LoggedInSessionID        ?? (object)DBNull.Value },
        { "@CurrentLoginDateTime",   entity.CurrentLoginDateTime     ?? (object)DBNull.Value },
        { "@LastLoginDateTime",      entity.LastLoginDateTime        ?? (object)DBNull.Value },
        { "@IsNewRegistration",      entity.IsNewRegistration },
        { "@IsPasswordResetDone",    entity.IsPasswordResetDone },
        { "@IsActive",               entity.IsActive },
        { "@ModifiedBy",             entity.ModifiedBy               ?? (object)DBNull.Value },
        { "@ModifiedByIPAddress",    entity.ModifiedByIPAddress      ?? (object)DBNull.Value },
        { "@IsAccountLock",          entity.IsAccountLock },
        { "@LoginAttempt",           entity.LoginAttempt },
        { "@MsbsvetMtId",            entity.MsbsvetMtId              ?? (object)DBNull.Value },
    };

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterUser", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterUser(MasterUserEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@UserID",                 entity.UserID },
        { "@UserTypeID",             entity.UserTypeID              ?? (object)DBNull.Value },
        { "@UserLoginID",            entity.UserLoginID              ?? (object)DBNull.Value },
        { "@UserPassword",           entity.UserPassword             ?? (object)DBNull.Value },
        { "@UserName",               entity.UserName                 ?? (object)DBNull.Value },
        { "@UserMobileNo",           entity.UserMobileNo             ?? (object)DBNull.Value },
        { "@UserEmailID",            entity.UserEmailID              ?? (object)DBNull.Value },
        { "@SecurityQuestionID",     entity.SecurityQuestionID       ?? (object)DBNull.Value },
        { "@SecurityQuestionAnswer", entity.SecurityQuestionAnswer   ?? (object)DBNull.Value },
        { "@LoggedInSessionID",      entity.LoggedInSessionID        ?? (object)DBNull.Value },
        { "@CurrentLoginDateTime",   entity.CurrentLoginDateTime     ?? (object)DBNull.Value },
        { "@LastLoginDateTime",      entity.LastLoginDateTime        ?? (object)DBNull.Value },
        { "@IsNewRegistration",      (object?)entity.IsNewRegistration ?? DBNull.Value },
        { "@IsPasswordResetDone",    (object?)entity.IsPasswordResetDone ?? DBNull.Value },
        { "@IsActive",               entity.IsActive },
        { "@ModifiedBy",             entity.ModifiedBy               ?? (object)DBNull.Value },
        { "@ModifiedByIPAddress",    entity.ModifiedByIPAddress      ?? (object)DBNull.Value },
        { "@IsAccountLock",          entity.IsAccountLock },
        { "@LoginAttempt",           entity.LoginAttempt },
        { "@MsbsvetMtId",            entity.MsbsvetMtId              ?? (object)DBNull.Value },
    };

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterUser", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterUser(int UserID)
        {
            var param = new Dictionary<string, object> { { "@UserID", UserID } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterUser", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region BatchType Methods

        public DataTable GetMasterBatchTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterBatchTypes");
        }

        public bool InsertMasterBatchType(MasterBatchTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",             entity.ID                                      },
        { "@BatchName",      entity.BatchName                               },
        { "@AcademicYearID", entity.AcademicYearID                          },
        { "@IsActive",       entity.IsActive                                },
        { "@IsCurrent",      entity.IsCurrent                               },
        { "@IsForAdmission", entity.IsForAdmission ?? (object)DBNull.Value  },
        { "@IsForExamFee",   entity.IsForExamFee   ?? (object)DBNull.Value  },
        { "@IsForExam",      entity.IsForExam      ?? (object)DBNull.Value  },
        { "@IsForResult",    entity.IsForResult    ?? (object)DBNull.Value  },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterBatchType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterBatchType(MasterBatchTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",             entity.ID                                      },
        { "@BatchName",      entity.BatchName                               },
        { "@AcademicYearID", entity.AcademicYearID                          },
        { "@IsActive",       entity.IsActive                                },
        { "@IsCurrent",      entity.IsCurrent                               },
        { "@IsForAdmission", entity.IsForAdmission ?? (object)DBNull.Value  },
        { "@IsForExamFee",   entity.IsForExamFee   ?? (object)DBNull.Value  },
        { "@IsForExam",      entity.IsForExam      ?? (object)DBNull.Value  },
        { "@IsForResult",    entity.IsForResult    ?? (object)DBNull.Value  },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterBatchType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterBatchType(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterBatchType", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region BatchStatus Methods

        public DataTable GetMasterBatchStatuses()
        {
            return _dbAccess.GetDataTable("sp_GetMasterBatchStatuses");
        }

        public bool InsertMasterBatchStatus(MasterBatchStatusEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@BatchStatusID",          entity.BatchStatusID                                        },
        { "@BatchStatusName",        entity.BatchStatusName                                      },
        { "@IsActive",               entity.IsActive                                             },
        { "@BatchStatusDiscription", entity.BatchStatusDiscription ?? (object)DBNull.Value       },
    };
            object result = _dbAccess.ExecuteScalar("sp_InsertMasterBatchStatus", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterBatchStatus(MasterBatchStatusEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@BatchStatusID",          entity.BatchStatusID                                        },
        { "@BatchStatusName",        entity.BatchStatusName                                      },
        { "@IsActive",               entity.IsActive                                             },
        { "@BatchStatusDiscription", entity.BatchStatusDiscription ?? (object)DBNull.Value       },
    };
            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterBatchStatus", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterBatchStatus(int BatchStatusID)
        {
            var param = new Dictionary<string, object> { { "@BatchStatusID", BatchStatusID } };
            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterBatchStatus", param);
            return result != null && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ExamType Methods

        public DataTable GetMasterExamTypes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterExamTypes");
        }

        public bool InsertMasterExamType(MasterExamTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ExamTypeID", entity.ExamTypeID },
        { "@ExamType",   entity.ExamType    ?? (object)DBNull.Value },
        { "@Isactive",   entity.Isactive                            },
    };

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterExamType", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterExamType(MasterExamTypeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ExamTypeID", entity.ExamTypeID },
        { "@ExamType",   entity.ExamType    ?? (object)DBNull.Value },
        { "@Isactive",   entity.Isactive                            },
    };

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterExamType", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterExamType(int ExamTypeID)
        {
            var param = new Dictionary<string, object> { { "@ExamTypeID", ExamTypeID } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterExamType", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region Religion Methods

        public DataTable GetMasterReligions()
        {
            return _dbAccess.GetDataTable("sp_GetMasterReligions");
        }

        public bool InsertMasterReligion(MasterReligionEntity entity)
        {
            // ReligionID is a plain INT column (NOT IDENTITY) — caller must supply it.
            var param = new Dictionary<string, object>
    {
        { "@ReligionID", entity.ReligionID                       },
        { "@Religion",   entity.Religion ?? (object)DBNull.Value },
        { "@IsActive",   entity.IsActive                         },
    };

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterReligion", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterReligion(MasterReligionEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ReligionID", entity.ReligionID                       },
        { "@Religion",   entity.Religion ?? (object)DBNull.Value },
        { "@IsActive",   entity.IsActive                         },
    };

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterReligion", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterReligion(int ReligionID)
        {
            var param = new Dictionary<string, object> { { "@ReligionID", ReligionID } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterReligion", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region SuccessStories Methods

        public DataTable GetMasterSuccessStories()
        {
            return _dbAccess.GetDataTable("sp_GetMasterSuccessStories");
        }

        public int InsertMasterSuccessStory(MasterSuccessStoriesEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@FirstName",             entity.FirstName ?? (object)DBNull.Value },
        { "@MiddleName",            entity.MiddleName ?? (object)DBNull.Value },
        { "@LastName",              entity.LastName ?? (object)DBNull.Value },
        { "@CandidateProfileID",    entity.CandidateProfileID ?? (object)DBNull.Value },
        { "@PhotoPath",             entity.PhotoPath ?? (object)DBNull.Value },
        { "@CourseID",              (object)entity.CourseID ?? DBNull.Value },
        { "@InstituteID",           (object)entity.InstituteID ?? DBNull.Value },
        { "@PassingYearID",         (object)entity.PassingYearID ?? DBNull.Value },
        { "@PresentDesignation",    entity.PresentDesignation ?? (object)DBNull.Value },
        { "@PresentOrganization",   entity.PresentOrganization ?? (object)DBNull.Value },
        { "@SelectionYearID",       (object)entity.SelectionYearID ?? DBNull.Value },
        { "@SelectionYear",         entity.SelectionYear ?? (object)DBNull.Value },
        { "@IsPublished",           entity.IsPublished },
        { "@IsActive",              entity.IsActive },
        { "@IsProfile",             entity.IsProfile },
        { "@CreatedBy",             entity.CreatedBy ?? (object)DBNull.Value },
        { "@CreatedByIPAddress",    entity.CreatedByIPAddress ?? (object)DBNull.Value },
        { "@DocumentPath",          entity.DocumentPath ?? (object)DBNull.Value },
        { "@CandidateMobileNo",     entity.CandidateMobileNo ?? (object)DBNull.Value },
    };

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterSuccessStory", param);
            return result != null && result != DBNull.Value ? Convert.ToInt32(result) : 0;
        }

        public bool UpdateMasterSuccessStory(MasterSuccessStoriesEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@ID",                    entity.ID },
        { "@FirstName",             entity.FirstName ?? (object)DBNull.Value },
        { "@MiddleName",            entity.MiddleName ?? (object)DBNull.Value },
        { "@LastName",              entity.LastName ?? (object)DBNull.Value },
        { "@CandidateProfileID",    entity.CandidateProfileID ?? (object)DBNull.Value },
        { "@PhotoPath",             entity.PhotoPath ?? (object)DBNull.Value },
        { "@CourseID",              (object)entity.CourseID ?? DBNull.Value },
        { "@InstituteID",           (object)entity.InstituteID ?? DBNull.Value },
        { "@PassingYearID",         (object)entity.PassingYearID ?? DBNull.Value },
        { "@PresentDesignation",    entity.PresentDesignation ?? (object)DBNull.Value },
        { "@PresentOrganization",   entity.PresentOrganization ?? (object)DBNull.Value },
        { "@SelectionYearID",       (object)entity.SelectionYearID ?? DBNull.Value },
        { "@SelectionYear",         entity.SelectionYear ?? (object)DBNull.Value },
        { "@IsPublished",           entity.IsPublished },
        { "@IsActive",              entity.IsActive },
        { "@IsProfile",             entity.IsProfile },
        { "@ModifiedBy",            entity.ModifiedBy ?? (object)DBNull.Value },
        { "@ModifiedByIPAddress",   entity.ModifiedByIPAddress ?? (object)DBNull.Value },
        { "@DocumentPath",          entity.DocumentPath ?? (object)DBNull.Value },
        { "@CandidateMobileNo",     entity.CandidateMobileNo ?? (object)DBNull.Value },
    };

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterSuccessStory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterSuccessStory(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterSuccessStory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region ITISpecificationItemV2 Methods

        public DataTable GetMasterITISpecificationItemsV2()
        {
            return _dbAccess.GetDataTable("sp_GetMasterITISpecificationItemsV2");
        }

        public bool InsertMasterITISpecificationItemV2(MasterITISpecificationItemV2Entity entity)
        {
            var param = new Dictionary<string, object>
{
    { "@NameofITem", entity.NameofITem ?? (object)DBNull.Value },
    { "@ItemCode",   entity.ItemCode   ?? (object)DBNull.Value },
    { "@IsActive",   entity.IsActive                           },
};

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterITISpecificationItemV2", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterITISpecificationItemV2(MasterITISpecificationItemV2Entity entity)
        {
            var param = new Dictionary<string, object>
{
    { "@ID",         entity.ID },
    { "@NameofITem", entity.NameofITem ?? (object)DBNull.Value },
    { "@ItemCode",   entity.ItemCode   ?? (object)DBNull.Value },
    { "@IsActive",   entity.IsActive                           },
};

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterITISpecificationItemV2", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterITISpecificationItemV2(int ID)
        {
            var param = new Dictionary<string, object> { { "@ID", ID } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterITISpecificationItemV2", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region InstituteCategory Methods

        public DataTable GetMasterInstituteCategories()
        {
            return _dbAccess.GetDataTable("sp_GetMasterInstituteCategories");
        }

        public bool InsertMasterInstituteCategory(MasterInstituteCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@Category",     entity.Category     ?? (object)DBNull.Value },
        { "@CategoryCode", entity.CategoryCode ?? (object)DBNull.Value },
        { "@SeqNo",        entity.SeqNo },
        { "@IsActive",     entity.IsActive },
    };

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterInstituteCategory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }
        public bool UpdateMasterInstituteCategory(MasterInstituteCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
{
    { "@CategoryID",   entity.CategoryID },
    { "@Category",     entity.Category     ?? (object)DBNull.Value },
    { "@CategoryCode", entity.CategoryCode ?? (object)DBNull.Value },
    { "@SeqNo",        entity.SeqNo },
    { "@IsActive",     entity.IsActive },
};

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterInstituteCategory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterInstituteCategory(int CategoryID)
        {
            var param = new Dictionary<string, object> { { "@CategoryID", CategoryID } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterInstituteCategory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region InstituteOwnership Methods

        public DataTable GetMasterInstituteOwnerships()
        {
            return _dbAccess.GetDataTable("sp_GetMasterInstituteOwnerships");
        }

        public int GetNextSeqNoInstituteOwnership()
        {
            object result = _dbAccess.ExecuteScalar("sp_GetNextSeqNo_InstituteOwnership", null);
            return result != null && result != DBNull.Value ? Convert.ToInt32(result) : 1;
        }

        // NOTE: OwnershipID is an IDENTITY column — it is NOT passed on insert.
        // sp_InsertMasterInstituteOwnership returns the new SCOPE_IDENTITY() value.
        public bool InsertMasterInstituteOwnership(MasterInstituteOwnershipEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@OwnershipName", entity.OwnershipName ?? (object)DBNull.Value },
        { "@OwnershipCode", entity.OwnershipCode ?? (object)DBNull.Value },
        { "@SeqNo",         entity.SeqNo                                 },
        { "@IsActive",      entity.IsActive                              },
    };

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterInstituteOwnership", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterInstituteOwnership(MasterInstituteOwnershipEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@OwnershipID",   entity.OwnershipID                            },
        { "@OwnershipName", entity.OwnershipName ?? (object)DBNull.Value },
        { "@OwnershipCode", entity.OwnershipCode ?? (object)DBNull.Value },
        { "@SeqNo",         entity.SeqNo                                 },
        { "@IsActive",      entity.IsActive                              },
    };

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterInstituteOwnership", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterInstituteOwnership(int OwnershipID)
        {
            var param = new Dictionary<string, object> { { "@OwnershipID", OwnershipID } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterInstituteOwnership", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region InfraCategory Methods

        public DataTable GetMasterInfraCategories()
        {
            return _dbAccess.GetDataTable("sp_GetMasterInfraCategories");
        }

        public bool InsertMasterInfraCategory(MasterInfraCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@InfraCategoryID", entity.InfraCategoryID },
        { "@InfraCategory",   entity.InfraCategory ?? (object)DBNull.Value },
        { "@IsActive",        entity.IsActive },
    };

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterInfraCategory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterInfraCategory(MasterInfraCategoryEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@InfraCategoryID", entity.InfraCategoryID },
        { "@InfraCategory",   entity.InfraCategory ?? (object)DBNull.Value },
        { "@IsActive",        entity.IsActive },
    };

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterInfraCategory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterInfraCategory(int InfraCategoryID)
        {
            var param = new Dictionary<string, object> { { "@InfraCategoryID", InfraCategoryID } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterInfraCategory", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region InfraItem Methods
 
public DataTable GetMasterInfraItems()
{
    return _dbAccess.GetDataTable("sp_GetMasterInfraItems");
}
 
public bool InsertMasterInfraItem(MasterInfraItemEntity entity)
{
    var param = new Dictionary<string, object>
{
    { "@InfraItemID",     entity.InfraItemID },
    { "@InfraItem",       entity.InfraItem       ?? (object)DBNull.Value },
    { "@InfraCategoryID", entity.InfraCategoryID },
    { "@IsActive",        entity.IsActive                                },
};
 
    object result = _dbAccess.ExecuteScalar("sp_InsertMasterInfraItem", param);
    return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
}
 
public bool UpdateMasterInfraItem(MasterInfraItemEntity entity)
{
    var param = new Dictionary<string, object>
{
    { "@InfraItemID",     entity.InfraItemID },
    { "@InfraItem",       entity.InfraItem       ?? (object)DBNull.Value },
    { "@InfraCategoryID", entity.InfraCategoryID },
    { "@IsActive",        entity.IsActive                                },
};
 
    object result = _dbAccess.ExecuteScalar("sp_UpdateMasterInfraItem", param);
    return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
}
 
public bool SoftDeleteMasterInfraItem(int InfraItemID)
{
    var param = new Dictionary<string, object> { { "@InfraItemID", InfraItemID } };
 
    object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterInfraItem", param);
    return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
}

        #endregion

        #region TrainingEquipmentList Methods

        public DataTable GetMasterTrainingEquipmentList()
        {
            return _dbAccess.GetDataTable("sp_GetMasterTrainingEquipmentList");
        }

        public bool InsertMasterTrainingEquipmentList(MasterTrainingEquipmentListEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@EquipmentId",           entity.EquipmentId },
        { "@CourseID",              entity.CourseID },
        { "@ItemID",                entity.ItemID },
        { "@EquipmentCategoryId",   entity.EquipmentCategoryId },
        { "@UtilizationRemarksID",  entity.UtilizationRemarksID },
        { "@IsDsrItem",             entity.IsDsrItem },
        { "@IsMouItem",             entity.IsMouItem },
        { "@IsMandatory",           entity.IsMandatory },
        { "@IsAlliedCourseItem",    entity.IsAlliedCourseItem },
        { "@RequiredPerUnit",       entity.RequiredPerUnit },
        { "@IsActive",              entity.IsActive },
    };

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterTrainingEquipmentList", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterTrainingEquipmentList(MasterTrainingEquipmentListEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@EquipmentId",           entity.EquipmentId },
        { "@CourseID",              entity.CourseID },
        { "@ItemID",                entity.ItemID },
        { "@EquipmentCategoryId",   entity.EquipmentCategoryId },
        { "@UtilizationRemarksID",  entity.UtilizationRemarksID },
        { "@IsDsrItem",             entity.IsDsrItem },
        { "@IsMouItem",             entity.IsMouItem },
        { "@IsMandatory",           entity.IsMandatory },
        { "@IsAlliedCourseItem",    entity.IsAlliedCourseItem },
        { "@RequiredPerUnit",       entity.RequiredPerUnit },
        { "@IsActive",              entity.IsActive },
    };

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterTrainingEquipmentList", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterTrainingEquipmentList(int EquipmentId)
        {
            var param = new Dictionary<string, object> { { "@EquipmentId", EquipmentId } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterTrainingEquipmentList", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region OBWCCourse Methods

        public DataTable GetMasterOBWCCourses()
        {
            return _dbAccess.GetDataTable("sp_GetMasterOBWCCourses");
        }

        public bool InsertMasterOBWCCourse(MasterOBWCCourseEntity entity)
        {
            var param = new Dictionary<string, object>
{
    { "@MBOCWPortalName",    entity.MBOCWPortalName ?? (object)DBNull.Value },
    { "@CourseCode",         entity.CourseCode       ?? (object)DBNull.Value },
    { "@CourseName",         entity.CourseName       ?? (object)DBNull.Value },
    { "@DurationinHours",    entity.DurationinHours  ?? (object)DBNull.Value },
    { "@Sector",             entity.Sector           ?? (object)DBNull.Value },
    { "@IsActive",           entity.IsActive                                 },
};

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterOBWCCourse", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateMasterOBWCCourse(MasterOBWCCourseEntity entity)
        {
            var param = new Dictionary<string, object>
{
    { "@Id",                 entity.Id },
    { "@MBOCWPortalName",    entity.MBOCWPortalName ?? (object)DBNull.Value },
    { "@CourseCode",         entity.CourseCode       ?? (object)DBNull.Value },
    { "@CourseName",         entity.CourseName       ?? (object)DBNull.Value },
    { "@DurationinHours",    entity.DurationinHours  ?? (object)DBNull.Value },
    { "@Sector",             entity.Sector           ?? (object)DBNull.Value },
    { "@IsActive",           entity.IsActive                                 },
};

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterOBWCCourse", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteMasterOBWCCourse(int Id)
        {
            var param = new Dictionary<string, object> { { "@Id", Id } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterOBWCCourse", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion

        #region OBWCInstitute Methods

        public DataTable GetAllOBWCInstitutes()
        {
            return _dbAccess.GetDataTable("sp_GetMasterOBWCInstitutes");
        }

        public bool InsertOBWCInstitute(MasterOBWCInstituteEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@NameasperBOCWPortal",     entity.NameasperBOCWPortal     ?? (object)DBNull.Value },
        { "@InstituteCode",           entity.InstituteCode           ?? (object)DBNull.Value },
        { "@TrainingPartner",         entity.TrainingPartner         ?? (object)DBNull.Value },
        { "@Address",                 entity.Address                 ?? (object)DBNull.Value },
        { "@CityVillage",             entity.CityVillage             ?? (object)DBNull.Value },
        { "@PinCode",                 entity.PinCode                 ?? (object)DBNull.Value },
        { "@Taluka",                  entity.Taluka                  ?? (object)DBNull.Value },
        { "@District",                entity.District                ?? (object)DBNull.Value },
        { "@Title",                   entity.Title                   ?? (object)DBNull.Value },
        { "@FirstName",               entity.FirstName               ?? (object)DBNull.Value },
        { "@MiddleName",              entity.MiddleName              ?? (object)DBNull.Value },
        { "@LastName",                entity.LastName                ?? (object)DBNull.Value },
        { "@PrimaryMobileNumber",     entity.PrimaryMobileNumber     ?? (object)DBNull.Value },
        { "@AlternativeMobileNumber", entity.AlternativeMobileNumber ?? (object)DBNull.Value },
        { "@EMailID",                 entity.EMailID                 ?? (object)DBNull.Value },
        { "@IsActive",                entity.IsActive                                        },
    };

            object result = _dbAccess.ExecuteScalar("sp_InsertMasterOBWCInstitute", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool UpdateOBWCInstitute(MasterOBWCInstituteEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@Id",                      entity.Id                                              },
        { "@NameasperBOCWPortal",     entity.NameasperBOCWPortal     ?? (object)DBNull.Value },
        { "@InstituteCode",           entity.InstituteCode           ?? (object)DBNull.Value },
        { "@TrainingPartner",         entity.TrainingPartner         ?? (object)DBNull.Value },
        { "@Address",                 entity.Address                 ?? (object)DBNull.Value },
        { "@CityVillage",             entity.CityVillage             ?? (object)DBNull.Value },
        { "@PinCode",                 entity.PinCode                 ?? (object)DBNull.Value },
        { "@Taluka",                  entity.Taluka                  ?? (object)DBNull.Value },
        { "@District",                entity.District                ?? (object)DBNull.Value },
        { "@Title",                   entity.Title                   ?? (object)DBNull.Value },
        { "@FirstName",               entity.FirstName               ?? (object)DBNull.Value },
        { "@MiddleName",              entity.MiddleName              ?? (object)DBNull.Value },
        { "@LastName",                entity.LastName                ?? (object)DBNull.Value },
        { "@PrimaryMobileNumber",     entity.PrimaryMobileNumber     ?? (object)DBNull.Value },
        { "@AlternativeMobileNumber", entity.AlternativeMobileNumber ?? (object)DBNull.Value },
        { "@EMailID",                 entity.EMailID                 ?? (object)DBNull.Value },
        { "@IsActive",                entity.IsActive                                        },
    };

            object result = _dbAccess.ExecuteScalar("sp_UpdateMasterOBWCInstitute", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        public bool SoftDeleteOBWCInstitute(int Id)
        {
            var param = new Dictionary<string, object> { { "@Id", Id } };

            object result = _dbAccess.ExecuteScalar("sp_SoftDeleteMasterOBWCInstitute", param);
            return result != null && result != DBNull.Value && Convert.ToInt32(result) > 0;
        }

        #endregion


    }
}

    

