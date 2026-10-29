using Portal.Business.Interface.Master;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Master;
using System;
using System.Collections.Generic;
using System.Data;
using static Portal.Entities.Master.MasterBatchEntity;




namespace Portal.Business.Worker.Master
{
    public class MasterWorker : IMaster
    {
        private readonly Repository objData;

        public MasterWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }
        #region Master List

        public List<MasterListEntity> GetMasterList()
        {
            List<MasterListEntity> objList = new List<MasterListEntity>();
            try
            {
                DataTable dt = objData.GetMasterList();
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterListEntity
                        {
                            ID = Convert.ToInt32(row["ID"]),
                            MasterName = row["MasterName"].ToString(),
                            MasterLink = row["MasterLink"].ToString(),
                            IsActive = Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterList"); throw ex; }
            return objList;
        }
        #endregion

        #region State Methods
        public List<MasterStateEntity> GetMasterState()
        {
            List<MasterStateEntity> objList = new List<MasterStateEntity>();
            try
            {
                DataTable dt = objData.GetMasterState();
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterStateEntity
                        {
                            StateID = Convert.ToInt32(row["StateID"]),
                            State = row["State"].ToString(),
                            CountryID = Convert.ToInt32(row["CountryID"]),
                            IsActive = Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterState"); throw ex; }
            return objList;
        }

        public bool InsertMasterState(MasterStateEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.InsertMasterState(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterState", entity.State); throw ex; }
            return retVal;
        }

        public bool UpdateMasterState(MasterStateEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.UpdateMasterState(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterState", entity.StateID.ToString()); throw ex; }
            return retVal;
        }

        public bool SoftDeleteMasterState(int StateID)
        {
            bool retVal = false;
            try { retVal = objData.SoftDeleteMasterState(StateID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterState", StateID.ToString()); throw ex; }
            return retVal;
        }
        #endregion

        #region District Methods
        public List<MasterDistrictEntity> GetMasterDistricttable()
        {
            List<MasterDistrictEntity> objList = new List<MasterDistrictEntity>();
            try
            {
                DataTable dt = objData.GetMasterDistricttable();
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterDistrictEntity
                        {
                            DistrictID = row["DistrictID"] == DBNull.Value ? 0 : Convert.ToInt32(row["DistrictID"]),
                            District = row["District"] == DBNull.Value ? "" : row["District"].ToString(),
                            DistrictMarathi = row["DistrictMarathi"] == DBNull.Value ? null : row["DistrictMarathi"].ToString(),
                            StateID = row["StateID"] == DBNull.Value ? 0 : Convert.ToInt32(row["StateID"]),
                            IsActive = Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterDistrict"); throw ex; }
            return objList;
        }

        public bool InsertMasterDistrict(MasterDistrictEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.InsertMasterDistrict(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterDistrict", entity.District); throw ex; }
            return retVal;
        }

        public bool UpdateMasterDistrict(MasterDistrictEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.UpdateMasterDistrict(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterDistrict", entity.DistrictID.ToString()); throw ex; }
            return retVal;
        }

        public bool SoftDeleteMasterDistrict(int DistrictID)
        {
            bool retVal = false;
            try { retVal = objData.SoftDeleteMasterDistrict(DistrictID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterDistrict", DistrictID.ToString()); throw ex; }
            return retVal;
        }

        public List<MasterTalukaEntity> GetMasterTalukatable()
        {
            List<MasterTalukaEntity> objList = new List<MasterTalukaEntity>();
            try
            {
                DataTable dt = objData.GetMasterTalukatable();
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterTalukaEntity
                        {
                            TalukaID = Convert.ToInt32(row["TalukaID"]),
                            Taluka = row["Taluka"].ToString(),
                            DistrictID = Convert.ToInt32(row["DistrictID"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterTaluka"); throw ex; }
            return objList;
        }
        public bool InsertMasterTaluka(MasterTalukaEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.InsertMasterTaluka(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterTaluka", entity.Taluka); throw ex; }
            return retVal;
        }

        public bool UpdateMasterTaluka(MasterTalukaEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.UpdateMasterTaluka(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterTaluka", entity.TalukaID.ToString()); throw ex; }
            return retVal;
        }

        public bool SoftDeleteMasterTaluka(int TalukaID)
        {
            bool retVal = false;
            try { retVal = objData.SoftDeleteMasterTaluka(TalukaID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTaluka", TalukaID.ToString()); throw ex; }
            return retVal;
        }
        #endregion

        #region
        public List<MasterCityEntity> GetMasterCity(int pageNumber, int pageSize, string search, bool? isActive = null, bool? isRural = null)
        {
            List<MasterCityEntity> objList = new List<MasterCityEntity>();
            try
            {
                DataTable dt = objData.GetMasterCity(pageNumber, pageSize, search, isActive, isRural);
                if (dt != null && dt.Rows.Count > 0)
                    foreach (DataRow row in dt.Rows)
                        objList.Add(new MasterCityEntity
                        {
                            CityID = row["CityID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CityID"]),
                            City = row["City"] == DBNull.Value ? "" : row["City"].ToString(),
                            CityMarathi = row["CityMarathi"] == DBNull.Value ? null : row["CityMarathi"].ToString(),
                            TalukaID = row["TalukaID"] == DBNull.Value ? 0 : Convert.ToInt32(row["TalukaID"]),
                            TalukaName = row["TalukaName"] == DBNull.Value ? "" : row["TalukaName"].ToString(),
                            IsRural = row["IsRural"] == DBNull.Value ? false : Convert.ToBoolean(row["IsRural"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                            TotalCount = row["TotalCount"] == DBNull.Value ? 0 : Convert.ToInt32(row["TotalCount"]),
                            CityTypeText = row["CityTypeText"] == DBNull.Value ? "" : row["CityTypeText"].ToString(), // NEW
                        });
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterCity"); throw ex; }
            return objList;
        }
        public MasterCityStatsEntity GetMasterCityStats()
        {
            var stats = new MasterCityStatsEntity();
            try
            {
                DataTable dt = objData.GetMasterCityStats();
                if (dt != null && dt.Rows.Count > 0)
                {
                    var row = dt.Rows[0];
                    stats.TotalCount = row["TotalCount"] == DBNull.Value ? 0 : Convert.ToInt32(row["TotalCount"]);
                    stats.ActiveCount = row["ActiveCount"] == DBNull.Value ? 0 : Convert.ToInt32(row["ActiveCount"]);
                    stats.InactiveCount = row["InactiveCount"] == DBNull.Value ? 0 : Convert.ToInt32(row["InactiveCount"]);
                    stats.RuralCount = row["RuralCount"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuralCount"]);
                    stats.UrbanCount = row["UrbanCount"] == DBNull.Value ? 0 : Convert.ToInt32(row["UrbanCount"]);
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterCityStats"); throw ex; }
            return stats;
        }
        public bool InsertMasterCity(MasterCityEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.InsertMasterCity(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterCity", entity.City); throw ex; }
            return retVal;
        }

        public bool UpdateMasterCity(MasterCityEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.UpdateMasterCity(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterCity", entity.CityID.ToString()); throw ex; }
            return retVal;
        }

        public bool SoftDeleteMasterCity(int CityID)
        {
            bool retVal = false;
            try { retVal = objData.SoftDeleteMasterCity(CityID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterCity", CityID.ToString()); throw ex; }
            return retVal;
        }
        #endregion

        #region Region Methods

        public List<MasterRegionEntity> GetMasterRegion()
        {
            List<MasterRegionEntity> objList = new List<MasterRegionEntity>();
            try
            {
                DataTable dt = objData.GetMasterRegion();
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterRegionEntity
                        {
                            RegionID = row["RegionID"] == DBNull.Value ? 0 : Convert.ToInt32(row["RegionID"]),
                            Region = row["Region"] == DBNull.Value ? "" : row["Region"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterRegion"); throw ex; }
            return objList;
        }

        public bool InsertMasterRegion(MasterRegionEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.InsertMasterRegion(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterRegion", entity.Region); throw ex; }
            return retVal;
        }

        public bool UpdateMasterRegion(MasterRegionEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.UpdateMasterRegion(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterRegion", entity.RegionID.ToString()); throw ex; }
            return retVal;
        }

        public bool SoftDeleteMasterRegion(int RegionID)
        {
            bool retVal = false;
            try { retVal = objData.SoftDeleteMasterRegion(RegionID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterRegion", RegionID.ToString()); throw ex; }
            return retVal;
        }
        #endregion

        #region Pincode Methods
        public List<MasterPincodeEntity> GetMasterPincode(int pageNumber, int pageSize, string search)
        {
            List<MasterPincodeEntity> objList = new List<MasterPincodeEntity>();
            try
            {
                DataTable dt = objData.GetMasterPincode(pageNumber, pageSize, search);
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterPincodeEntity
                        {
                            PincodeID = Convert.ToInt32(row["PincodeID"]),
                            Pincode = row["Pincode"] == DBNull.Value ? "" : row["Pincode"].ToString(),
                            PostOffice = row["PostOffice"] == DBNull.Value ? "" : row["PostOffice"].ToString(),
                            CityID = row["CityID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CityID"]),
                            CityName = row.Table.Columns.Contains("CityName") && row["CityName"] != DBNull.Value ? row["CityName"].ToString() : null,
                            TalukaName = row.Table.Columns.Contains("TalukaName") && row["TalukaName"] != DBNull.Value ? row["TalukaName"].ToString() : null,
                            DistrictName = row.Table.Columns.Contains("DistrictName") && row["DistrictName"] != DBNull.Value ? row["DistrictName"].ToString() : null,
                            StateName = row.Table.Columns.Contains("StateName") && row["StateName"] != DBNull.Value ? row["StateName"].ToString() : null,
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                            TotalCount = row.Table.Columns.Contains("TotalCount") && row["TotalCount"] != DBNull.Value ? Convert.ToInt32(row["TotalCount"]) : 0
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterPincode"); throw ex; }
            return objList;
        }

        public MasterPincodeStatsEntity GetMasterPincodeStats()
        {
            var stats = new MasterPincodeStatsEntity();
            try
            {
                DataTable dt = objData.GetMasterPincodeStats();
                if (dt != null && dt.Rows.Count > 0)
                {
                    var row = dt.Rows[0];
                    stats.TotalCount = row["TotalCount"] == DBNull.Value ? 0 : Convert.ToInt32(row["TotalCount"]);
                    stats.ActiveCount = row["ActiveCount"] == DBNull.Value ? 0 : Convert.ToInt32(row["ActiveCount"]);
                    stats.InactiveCount = row["InactiveCount"] == DBNull.Value ? 0 : Convert.ToInt32(row["InactiveCount"]);
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterPincodeStats"); throw ex; }
            return stats;
        }
        public bool InsertMasterPincode(MasterPincodeEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.InsertMasterPincode(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterPincode", entity.Pincode); throw ex; }
            return retVal;
        }

        public bool UpdateMasterPincode(MasterPincodeEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.UpdateMasterPincode(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterPincode", entity.PincodeID.ToString()); throw ex; }
            return retVal;
        }

        public bool SoftDeleteMasterPincode(int PincodeID)
        {
            bool retVal = false;
            try { retVal = objData.SoftDeleteMasterPincode(PincodeID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterPincode", PincodeID.ToString()); throw ex; }
            return retVal;
        }
        #endregion

        #region

        //public List<MasterCasteEntity> GetMasterCaste()
        //{
        //    try { return objData.GetMasterCaste(); }
        //    catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterCaste"); throw; }
        //}

        public bool InsertMasterCaste(MasterCasteEntity entity)
        {
            try { return objData.InsertMasterCaste(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterCaste", entity.Caste); throw; }
        }

        public bool UpdateMasterCaste(MasterCasteEntity entity)
        {
            try { return objData.UpdateMasterCaste(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterCaste", entity.CasteID.ToString()); throw; }
        }

        public (bool Success, string Message) SoftDeleteMasterCaste(int CasteID)
        {
            try
            {
                return objData.SoftDeleteMasterCaste(CasteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterCaste", CasteID.ToString());
                throw;
            }
        }



        public List<MasterCasteEntity> GetAllMasterCaste()
        {
            try
            {
                return objData.GetAllMasterCaste();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAllMasterCaste");
                throw;
            }
        }
        #endregion

        #region Category Methods

        public List<MasterCategoryEntity> GetMasterCasteCategory()
        {
            List<MasterCategoryEntity> objList = new List<MasterCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterCasteCategory();
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterCategoryEntity
                        {
                            CategoryID = row["CategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CategoryID"]),
                            Category = row["Category"] == DBNull.Value ? "" : row["Category"].ToString(),
                            CategoryCode = row["CategoryCode"] == DBNull.Value ? "" : row["CategoryCode"].ToString(),
                            SeqNo = row["SeqNo"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["SeqNo"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterCategory"); throw; }
            return objList;
        }

        public bool InsertMasterCategory(MasterCategoryEntity entity)
        {
            try { return objData.InsertMasterCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterCategory", entity.Category); throw; }
        }

        public bool UpdateMasterCategory(MasterCategoryEntity entity)
        {
            try { return objData.UpdateMasterCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterCategory", entity.CategoryID.ToString()); throw; }
        }

        public bool SoftDeleteMasterCategory(int CategoryID)
        {
            try { return objData.SoftDeleteMasterCategory(CategoryID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterCategory", CategoryID.ToString()); throw; }
        }

        #endregion

        #region Disability Methods

        public List<MasterDisabilityEntity> GetAllDisabilities()
        {
            List<MasterDisabilityEntity> objList = new List<MasterDisabilityEntity>();
            try
            {
                DataTable dt = objData.GetAllDisabilities();
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterDisabilityEntity
                        {
                            DisabilityID = row["DisabilityID"] == DBNull.Value ? 0 : Convert.ToInt32(row["DisabilityID"]),
                            Disability = row["Disability"] == DBNull.Value ? "" : row["Disability"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetAllDisabilities"); throw; }
            return objList;
        }


        public bool InsertDisability(MasterDisabilityEntity entity)
        {
            try { return objData.InsertDisability(entity); } // ← was _dbAccess.ExecuteScalar(...)
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertDisability"); throw; }
        }

        public bool UpdateDisability(MasterDisabilityEntity entity)
        {
            try { return objData.UpdateDisability(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateDisability", entity.DisabilityID.ToString()); throw; }
        }

        public bool SoftDeleteDisability(int DisabilityID)
        {
            try { return objData.SoftDeleteDisability(DisabilityID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteDisability", DisabilityID.ToString()); throw; }
        }

        #endregion

        #region AcademicYear Methods

        public List<MasterAcademicYearEntity> GetAllAcademicYears()
        {
            List<MasterAcademicYearEntity> objList = new List<MasterAcademicYearEntity>();
            try
            {
                DataTable dt = objData.GetAllAcademicYears();
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterAcademicYearEntity
                        {
                            YearId = Convert.ToInt32(row["YearId"]),
                            YearName = row["YearName"].ToString(),
                            YearDisplayName = row["YearDisplayName"].ToString(),
                            isCurrent = Convert.ToBoolean(row["isCurrent"]),
                            isactive = Convert.ToBoolean(row["isactive"]),
                            IsForAdmission = Convert.ToBoolean(row["IsForAdmission"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetAllAcademicYears"); throw ex; }
            return objList;
        }

        public bool InsertAcademicYear(MasterAcademicYearEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.InsertAcademicYear(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertAcademicYear", entity.YearName); throw ex; }
            return retVal;
        }

        public bool UpdateAcademicYear(MasterAcademicYearEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.UpdateAcademicYear(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateAcademicYear", entity.YearId.ToString()); throw ex; }
            return retVal;
        }

        public bool SoftDeleteAcademicYear(int YearId)
        {
            bool retVal = false;
            try { retVal = objData.SoftDeleteAcademicYear(YearId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteAcademicYear", YearId.ToString()); throw ex; }
            return retVal;
        }

        #endregion

        #region Activity Status Methods

        public List<MasterActivityStatusEntity> GetAllActivityStatuses()
        {
            List<MasterActivityStatusEntity> objList = new List<MasterActivityStatusEntity>();
            try
            {
                DataTable dt = objData.GetAllActivityStatuses();
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterActivityStatusEntity
                        {
                            SeqNo = Convert.ToInt32(row["SeqNo"]),
                            RegionID = row["RegionID"] != DBNull.Value ? Convert.ToInt32(row["RegionID"]) : 0,
                            ActivityName = row["ActivityName"].ToString(),
                            ActivityDetails = row["ActivityDetails"] != DBNull.Value ? row["ActivityDetails"].ToString() : string.Empty,
                            ActivityStartDateTime = row["ActivityStartDateTime"] != DBNull.Value ? Convert.ToDateTime(row["ActivityStartDateTime"]) : (DateTime?)null,
                            ActivityEndDateTime = row["ActivityEndDateTime"] != DBNull.Value ? Convert.ToDateTime(row["ActivityEndDateTime"]) : (DateTime?)null,
                            IsActive = Convert.ToBoolean(row["IsActive"]),
                            ModifiedDateTime = row["ModifiedDateTime"] != DBNull.Value ? Convert.ToDateTime(row["ModifiedDateTime"]) : (DateTime?)null,
                            ModifiedBy = row["ModifiedBy"] != DBNull.Value ? row["ModifiedBy"].ToString() : string.Empty,
                            ModifiedByIPAddress = row["ModifiedByIPAddress"] != DBNull.Value ? row["ModifiedByIPAddress"].ToString() : string.Empty,
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetAllActivityStatuses"); throw ex; }
            return objList;
        }

        public bool InsertActivityStatus(MasterActivityStatusEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.InsertActivityStatus(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertActivityStatus", entity.ActivityName); throw ex; }
            return retVal;
        }

        public bool UpdateActivityStatus(MasterActivityStatusEntity entity)
        {
            bool retVal = false;
            try { retVal = objData.UpdateActivityStatus(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateActivityStatus", entity.SeqNo.ToString()); throw ex; }
            return retVal;
        }

        public bool SoftDeleteActivityStatus(int SeqNo, string ModifiedBy, string ModifiedByIPAddress)
        {
            bool retVal = false;
            try { retVal = objData.SoftDeleteActivityStatus(SeqNo, ModifiedBy, ModifiedByIPAddress); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteActivityStatus", SeqNo.ToString()); throw ex; }
            return retVal;
        }

        #endregion

        #region AffiliationPages Methods

        public List<MasterAffiliationPageEntity> GetMasterAffiliationPages()
        {
            List<MasterAffiliationPageEntity> objList = new List<MasterAffiliationPageEntity>();
            try
            {
                DataTable dt = objData.GetMasterAffiliationPages();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterAffiliationPageEntity
                        {
                            PageId = row["PageId"] == DBNull.Value ? 0 : Convert.ToInt32(row["PageId"]),
                            PageName = row["PageName"] == DBNull.Value ? "" : row["PageName"].ToString(),
                            PageUrl = row["PageUrl"] == DBNull.Value ? null : row["PageUrl"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                            PageGrop = row["PageGrop"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["PageGrop"]),
                            PageCode = row["PageCode"] == DBNull.Value ? null : row["PageCode"].ToString(),
                            BGColur = row["BGColur"] == DBNull.Value ? null : row["BGColur"].ToString(),
                            AnchorTagTarget = row["AnchorTagTarget"] == DBNull.Value ? null : row["AnchorTagTarget"].ToString(),
                            ReactPageUrl = row["ReactPageUrl"] == DBNull.Value ? null : row["ReactPageUrl"].ToString(),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterAffiliationPages"); throw; }
            return objList;
        }

        public bool InsertMasterAffiliationPage(MasterAffiliationPageEntity entity)
        {
            try { return objData.InsertMasterAffiliationPage(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterAffiliationPage", entity.PageName); throw; }
        }

        public bool UpdateMasterAffiliationPage(MasterAffiliationPageEntity entity)
        {
            try { return objData.UpdateMasterAffiliationPage(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterAffiliationPage", entity.PageId.ToString()); throw; }
        }

        public bool SoftDeleteMasterAffiliationPage(int PageId)
        {
            try { return objData.SoftDeleteMasterAffiliationPage(PageId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterAffiliationPage", PageId.ToString()); throw; }
        }

        #endregion

        #region ApplicationFormLinks Methods

        public List<MasterApplicationFormLinkEntity> GetMasterApplicationFormLinks()
        {
            List<MasterApplicationFormLinkEntity> objList = new List<MasterApplicationFormLinkEntity>();
            try
            {
                DataTable dt = objData.GetMasterApplicationFormLinks();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterApplicationFormLinkEntity
                        {
                            LinkID = row["LinkID"] == DBNull.Value ? 0 : Convert.ToInt32(row["LinkID"]),
                            LinkType = row["LinkType"] == DBNull.Value ? "" : row["LinkType"].ToString(),
                            LinkName = row["LinkName"] == DBNull.Value ? "" : row["LinkName"].ToString(),
                            LinkDescription = row["LinkDescription"] == DBNull.Value ? null : row["LinkDescription"].ToString(),
                            LinkURL = row["LinkURL"] == DBNull.Value ? null : row["LinkURL"].ToString(),
                            PageCode = row["PageCode"] == DBNull.Value ? null : row["PageCode"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                            LinkURLReact = row["LinkURLReact"] == DBNull.Value ? null : row["LinkURLReact"].ToString(),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterApplicationFormLinks"); throw; }
            return objList;
        }

        public bool InsertMasterApplicationFormLink(MasterApplicationFormLinkEntity entity)
        {
            try { return objData.InsertMasterApplicationFormLink(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterApplicationFormLink", entity.LinkName); throw; }
        }

        public bool UpdateMasterApplicationFormLink(MasterApplicationFormLinkEntity entity)
        {
            try { return objData.UpdateMasterApplicationFormLink(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterApplicationFormLink", entity.LinkID.ToString()); throw; }
        }

        public bool SoftDeleteMasterApplicationFormLink(int LinkID)
        {
            try { return objData.SoftDeleteMasterApplicationFormLink(LinkID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterApplicationFormLink", LinkID.ToString()); throw; }
        }

        #endregion

        #region ApprovalGroup Methods

        public List<Master_ApprovalGroupEntity> GetMaster_ApprovalGroups()
        {
            List<Master_ApprovalGroupEntity> objList = new List<Master_ApprovalGroupEntity>();
            try
            {
                DataTable dt = objData.GetMaster_ApprovalGroups();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new Master_ApprovalGroupEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            ApprovalGroupName = row["ApprovalGroupName"] == DBNull.Value ? "" : row["ApprovalGroupName"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterApprovalGroups"); throw; }
            return objList;
        }

        public bool InsertMasterApprovalGroup(Master_ApprovalGroupEntity entity)
        {
            try { return objData.InsertMasterApprovalGroup(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterApprovalGroup", entity.ApprovalGroupName); throw; }
        }

        public bool UpdateMasterApprovalGroup(Master_ApprovalGroupEntity entity)
        {
            try { return objData.UpdateMasterApprovalGroup(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterApprovalGroup", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterApprovalGroup(int ID)
        {
            try { return objData.SoftDeleteMasterApprovalGroup(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterApprovalGroup", ID.ToString()); throw; }
        }

        #endregion

        #region MasterBatch Methods

        public List<MasterBatchEntity> GetMasterBatches()
        {
            List<MasterBatchEntity> objList = new List<MasterBatchEntity>();
            try
            {
                DataTable dt = objData.GetMasterBatches();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterBatchEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            BatchID = row["BatchID"] == DBNull.Value ? "" : row["BatchID"].ToString(),
                            CollegeID = row["CollegeID"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["CollegeID"]),
                            CourseID = row["CourseID"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["CourseID"]),
                            ShiftID = row["ShiftID"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["ShiftID"]),
                            UnitNo = row["UnitNo"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["UnitNo"]),
                            UnitID = row["UnitID"] == DBNull.Value ? null : (long?)Convert.ToInt64(row["UnitID"]),
                            BatchStartDate = row["BatchStartDate"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(row["BatchStartDate"]),
                            BatchEndDate = row["BatchEndDate"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(row["BatchEndDate"]),
                            AdmissionEndDate = row["AdmissionEndDate"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(row["AdmissionEndDate"]),
                            IsSystemCreated = row["IsSystemCreated"] == DBNull.Value ? 0 : Convert.ToInt32(row["IsSystemCreated"]),
                            BatchStatus = row["BatchStatus"] == DBNull.Value ? 0 : Convert.ToInt32(row["BatchStatus"]),
                            IsDeleted = row["IsDeleted"] == DBNull.Value ? 0 : Convert.ToInt32(row["IsDeleted"]),
                            AdmissionYearID = row["AdmissionYearID"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["AdmissionYearID"]),
                            BatchTypeID = row["BatchTypeID"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["BatchTypeID"]),
                            ExaminationID1 = row["ExaminationID1"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["ExaminationID1"]),
                            ExaminationID2 = row["ExaminationID2"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["ExaminationID2"]),
                            Intake = row["Intake"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["Intake"]),
                            //SchoolID = row["SchoolID"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["SchoolID"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterBatches"); throw; }
            return objList;
        }

        public bool InsertMasterBatch(MasterBatchEntity entity)
        {
            bool retVal = false;
            // ↓ entity.BatchID is string — no cast needed
            try { retVal = objData.InsertMasterBatch(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterBatch", entity.BatchID); throw; }
            return retVal;
        }

        public bool UpdateMasterBatch(MasterBatchEntity entity)
        {
            bool retVal = false;
            // ↓ entity.ID is int — .ToString() is fine
            try { retVal = objData.UpdateMasterBatch(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterBatch", entity.ID.ToString()); throw; }
            return retVal;
        }

        public bool SoftDeleteMasterBatch(int ID)
        {
            bool retVal = false;
            try { retVal = objData.SoftDeleteMasterBatch(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBatch", ID.ToString()); throw; }
            return retVal;
        }

        #endregion

        #region Country Methods

        public List<MasterCountryEntity> GetMasterCountries()
        {
            List<MasterCountryEntity> objList = new List<MasterCountryEntity>();

            try
            {
                DataTable dt = objData.GetMasterCountries();

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterCountryEntity
                        {
                            CountryID = row["CountryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CountryID"]),
                            Country = row["Country"] == DBNull.Value ? string.Empty : row["Country"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"])
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterCountries");
                throw;
            }

            return objList;
        }

        public int InsertMasterCountry(MasterCountryEntity entity)
        {
            try
            {
                return objData.InsertMasterCountry(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "InsertMasterCountry", entity.Country);
                throw;
            }
        }

        public bool UpdateMasterCountry(MasterCountryEntity entity)
        {
            try
            {
                return objData.UpdateMasterCountry(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterCountry", entity.CountryID.ToString());
                throw;
            }
        }

        public bool SoftDeleteMasterCountry(int CountryID)
        {
            try
            {
                return objData.SoftDeleteMasterCountry(CountryID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterCountry", CountryID.ToString());
                throw;
            }
        }

        #endregion

        #region ApprovalOrder Methods

        public List<MasterApprovalOrderEntity> GetMasterApprovalOrders()
        {
            List<MasterApprovalOrderEntity> objList = new List<MasterApprovalOrderEntity>();
            try
            {
                DataTable dt = objData.GetMasterApprovalOrders();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterApprovalOrderEntity
                    {
                        ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                        ApprovalOrderNo = row["ApprovalOrderNo"] == DBNull.Value ? "" : row["ApprovalOrderNo"].ToString(),
                        ApprovalOrderDate = row["ApprovalOrderDate"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(row["ApprovalOrderDate"]),
                        ApprovalOrder = row["ApprovalOrder"] == DBNull.Value ? null : row["ApprovalOrder"].ToString(),
                        ApprovalOrderRemakr = row["ApprovalOrderRemakr"] == DBNull.Value ? null : row["ApprovalOrderRemakr"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterApprovalOrders"); throw; }
            return objList;
        }

        public bool InsertMasterApprovalOrder(MasterApprovalOrderEntity entity)
        {
            try { return objData.InsertMasterApprovalOrder(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterApprovalOrder", entity.ApprovalOrderNo); throw; }
        }

        public bool UpdateMasterApprovalOrder(MasterApprovalOrderEntity entity)
        {
            try { return objData.UpdateMasterApprovalOrder(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterApprovalOrder", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterApprovalOrder(int ID)
        {
            try { return objData.SoftDeleteMasterApprovalOrder(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterApprovalOrder", ID.ToString()); throw; }
        }

        #endregion

        #region SubSector Methods

        public List<MasterSubSectorEntity> GetMasterSubSectors()
        {
            List<MasterSubSectorEntity> objList = new List<MasterSubSectorEntity>();
            try
            {
                DataTable dt = objData.GetMasterSubSectors();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterSubSectorEntity
                    {
                        SubSectorID = row["SubSectorID"] == DBNull.Value ? 0 : Convert.ToInt32(row["SubSectorID"]),
                        SubSector = row["SubSector"] == DBNull.Value ? "" : row["SubSector"].ToString(),
                        SectorID = row["SectorID"] == DBNull.Value ? 0 : Convert.ToInt32(row["SectorID"]),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterSubSectors"); throw; }
            return objList;
        }

        public bool InsertMasterSubSector(MasterSubSectorEntity entity)
        {
            try { return objData.InsertMasterSubSector(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterSubSector", entity.SubSector); throw; }
        }

        public bool UpdateMasterSubSector(MasterSubSectorEntity entity)
        {
            try { return objData.UpdateMasterSubSector(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterSubSector", entity.SubSectorID.ToString()); throw; }
        }

        public bool SoftDeleteMasterSubSector(int SubSectorID)
        {
            try { return objData.SoftDeleteMasterSubSector(SubSectorID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSubSector", SubSectorID.ToString()); throw; }
        }

        #endregion

        #region SubjectCourse Methods

        public List<MasterSubjectCourseEntity> GetMasterSubjectCourses()
        {
            List<MasterSubjectCourseEntity> objList = new List<MasterSubjectCourseEntity>();
            try
            {
                DataTable dt = objData.GetMasterSubjectCourses();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterSubjectCourseEntity
                    {
                        SubjectCourseID = row["SubjectCourseID"] == DBNull.Value ? 0 : Convert.ToInt32(row["SubjectCourseID"]),
                        CourseID = row["CourseID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CourseID"]),
                        CourseCode = row["CourseCode"] == DBNull.Value ? null : row["CourseCode"].ToString(),
                        SubjectName = row["SubjectName"] == DBNull.Value ? null : row["SubjectName"].ToString(),
                        SubjectCode = row["SubjectCode"] == DBNull.Value ? null : row["SubjectCode"].ToString(),
                        SubjectType = row["SubjectType"] == DBNull.Value ? null : row["SubjectType"].ToString(),
                        IsActive = Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterSubjectCourses"); throw; }
            return objList;
        }

        public bool InsertMasterSubjectCourse(MasterSubjectCourseEntity entity)
        {
            try { return objData.InsertMasterSubjectCourse(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterSubjectCourse", entity.SubjectName); throw; }
        }

        public bool UpdateMasterSubjectCourse(MasterSubjectCourseEntity entity)
        {
            try { return objData.UpdateMasterSubjectCourse(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterSubjectCourse", entity.OldSubjectCode); throw; }
        }

        public bool SoftDeleteMasterSubjectCourse(int CourseID, string SubjectCode)
        {
            try { return objData.SoftDeleteMasterSubjectCourse(CourseID, SubjectCode); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSubjectCourse", SubjectCode); throw; }
        }

        #endregion

        #region MasterLanguage Methods

        public List<MasterLanguageEntity> GetMasterLanguages()
        {
            List<MasterLanguageEntity> objList = new List<MasterLanguageEntity>();
            try
            {
                DataTable dt = objData.GetMasterLanguages();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterLanguageEntity
                    {
                        LanguageID = row["LanguageID"] == DBNull.Value ? 0 : Convert.ToInt32(row["LanguageID"]),
                        Language = row["Language"] == DBNull.Value ? "" : row["Language"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterLanguages"); throw; }
            return objList;
        }

        public bool InsertMasterLanguage(MasterLanguageEntity entity)
        {
            try { return objData.InsertMasterLanguage(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterLanguage", entity.Language); throw; }
        }

        public bool UpdateMasterLanguage(MasterLanguageEntity entity)
        {
            try { return objData.UpdateMasterLanguage(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterLanguage", entity.LanguageID.ToString()); throw; }
        }

        public bool SoftDeleteMasterLanguage(int LanguageID)
        {
            try { return objData.SoftDeleteMasterLanguage(LanguageID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterLanguage", LanguageID.ToString()); throw; }
        }

        #endregion

        #region Designation Methods

        public List<MasterDesignationEntity> GetMasterDesignations()
        {
            List<MasterDesignationEntity> objList = new List<MasterDesignationEntity>();
            try
            {
                DataTable dt = objData.GetMasterDesignations();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterDesignationEntity
                        {
                            DesignationId = row["DesignationId"] == DBNull.Value ? 0 : Convert.ToInt32(row["DesignationId"]),
                            Designation = row["Designation"] == DBNull.Value ? "" : row["Designation"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"])
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterDesignations"); throw; }
            return objList;
        }

        public bool InsertMasterDesignation(MasterDesignationEntity entity)
        {
            try { return objData.InsertMasterDesignation(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterDesignation", entity.Designation); throw; }
        }

        public bool UpdateMasterDesignation(MasterDesignationEntity entity)
        {
            try { return objData.UpdateMasterDesignation(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterDesignation", entity.DesignationId.ToString()); throw; }
        }

        public bool SoftDeleteMasterDesignation(int DesignationId)
        {
            try { return objData.SoftDeleteMasterDesignation(DesignationId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterDesignation", DesignationId.ToString()); throw; }
        }

        #endregion

        #region CourseType Methods

        public List<MasterCourseTypeEntity> GetMasterCourseTypes()
        {
            List<MasterCourseTypeEntity> objList = new List<MasterCourseTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterCourseTypes();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterCourseTypeEntity
                        {
                            CourseTypeID = row["CourseTypeID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CourseTypeID"]),
                            CourseType = row["CourseType"] == DBNull.Value ? "" : row["CourseType"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"])
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterCourseTypes"); throw; }
            return objList;
        }

        public bool InsertMasterCourseType(MasterCourseTypeEntity entity)
        {
            try { return objData.InsertMasterCourseType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterCourseType", entity.CourseType); throw; }
        }

        public bool UpdateMasterCourseType(MasterCourseTypeEntity entity)
        {
            try { return objData.UpdateMasterCourseType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterCourseType", entity.CourseTypeID.ToString()); throw; }
        }

        public bool SoftDeleteMasterCourseType(int CourseTypeID)
        {
            try { return objData.SoftDeleteMasterCourseType(CourseTypeID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterCourseType", CourseTypeID.ToString()); throw; }
        }

        #endregion

        #region MasterDocuments Methods

        public List<MasterDocumentEntity> GetMasterDocuments()
        {
            List<MasterDocumentEntity> objList = new List<MasterDocumentEntity>();
            try
            {
                DataTable dt = objData.GetMasterDocuments();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterDocumentEntity
                    {
                        ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                        DocumentName = row["DocumentName"] == DBNull.Value ? "" : row["DocumentName"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        IsDocumentCompulsory = row["IsDocumentCompulsory"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDocumentCompulsory"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterDocuments"); throw; }
            return objList;
        }

        public bool InsertMasterDocument(MasterDocumentEntity entity)
        {
            try { return objData.InsertMasterDocument(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterDocument", entity.DocumentName); throw; }
        }

        public bool UpdateMasterDocument(MasterDocumentEntity entity)
        {
            try { return objData.UpdateMasterDocument(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterDocument", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterDocument(int ID)
        {
            try { return objData.SoftDeleteMasterDocument(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterDocument", ID.ToString()); throw; }
        }

        #endregion

        #region FacilityGroup Methods

        public List<MasterFacilityGroupEntity> GetMasterFacilityGroups()
        {
            List<MasterFacilityGroupEntity> objList = new List<MasterFacilityGroupEntity>();
            try
            {
                DataTable dt = objData.GetMasterFacilityGroups();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterFacilityGroupEntity
                    {
                        FacilityGroupId = row["FacilityGroupId"] == DBNull.Value ? 0 : Convert.ToInt32(row["FacilityGroupId"]),
                        FacilityGroup = row["FacilityGroup"] == DBNull.Value ? "" : row["FacilityGroup"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterFacilityGroups"); throw; }
            return objList;
        }

        public bool InsertMasterFacilityGroup(MasterFacilityGroupEntity entity)
        {
            try { return objData.InsertMasterFacilityGroup(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterFacilityGroup", entity.FacilityGroup); throw; }
        }

        public bool UpdateMasterFacilityGroup(MasterFacilityGroupEntity entity)
        {
            try { return objData.UpdateMasterFacilityGroup(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterFacilityGroup", entity.FacilityGroupId.ToString()); throw; }
        }

        public bool SoftDeleteMasterFacilityGroup(int FacilityGroupId)
        {
            try { return objData.SoftDeleteMasterFacilityGroup(FacilityGroupId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterFacilityGroup", FacilityGroupId.ToString()); throw; }
        }

        #endregion

        #region BloodGroup Methods

        public List<MasterBloodGroupEntity> GetMasterBloodGroups()
        {
            List<MasterBloodGroupEntity> objList = new List<MasterBloodGroupEntity>();
            try
            {
                DataTable dt = objData.GetMasterBloodGroups();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterBloodGroupEntity
                    {
                        BloodGroupId = row["BloodGroupId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BloodGroupId"]),
                        BloodGroup = row["BloodGroup"] == DBNull.Value ? "" : row["BloodGroup"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterBloodGroups"); throw; }
            return objList;
        }

        public bool InsertMasterBloodGroup(MasterBloodGroupEntity entity)
        {
            try { return objData.InsertMasterBloodGroup(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterBloodGroup", entity.BloodGroup); throw; }
        }

        public bool UpdateMasterBloodGroup(MasterBloodGroupEntity entity)
        {
            try { return objData.UpdateMasterBloodGroup(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterBloodGroup", entity.BloodGroupId.ToString()); throw; }
        }

        public bool SoftDeleteMasterBloodGroup(int BloodGroupId)
        {
            try { return objData.SoftDeleteMasterBloodGroup(BloodGroupId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBloodGroup", BloodGroupId.ToString()); throw; }
        }

        #endregion

        #region MasterGender Methods

        public List<MasterGenderEntity> GetMasterGenders()
        {
            List<MasterGenderEntity> objList = new List<MasterGenderEntity>();
            try
            {
                DataTable dt = objData.GetMasterGenders();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterGenderEntity
                    {
                        GenderCode = row["GenderCode"] == DBNull.Value ? "" : row["GenderCode"].ToString(),
                        Gender = row["Gender"] == DBNull.Value ? "" : row["Gender"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"])
                    });
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterGenders");
                throw;
            }
            return objList;
        }

        public bool InsertMasterGender(MasterGenderEntity entity)
        {
            try
            {
                return objData.InsertMasterGender(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "InsertMasterGender", entity.GenderCode);
                throw;
            }
        }

        public bool UpdateMasterGender(MasterGenderEntity entity)
        {
            try
            {
                return objData.UpdateMasterGender(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterGender", entity.GenderCode);
                throw;
            }
        }

        public bool SoftDeleteMasterGender(string GenderCode)
        {
            try
            {
                return objData.SoftDeleteMasterGender(GenderCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterGender", GenderCode);
                throw;
            }
        }

        #endregion

        #region BuildingFloor Methods

        public List<MasterBuildingFloorEntity> GetMasterBuildingFloor()
        {
            List<MasterBuildingFloorEntity> objList = new List<MasterBuildingFloorEntity>();
            try
            {
                DataTable dt = objData.GetMasterBuildingFloor();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterBuildingFloorEntity
                        {
                            FloorId = row["FloorId"] == DBNull.Value ? 0 : Convert.ToInt32(row["FloorId"]),
                            FloorName = row["FloorName"] == DBNull.Value ? "" : row["FloorName"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterBuildingFloors"); throw; }
            return objList;
        }

        public bool InsertMasterBuildingFloor(MasterBuildingFloorEntity entity)
        {
            try { return objData.InsertMasterBuildingFloor(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterBuildingFloor", entity.FloorName); throw; }
        }

        public bool UpdateMasterBuildingFloor(MasterBuildingFloorEntity entity)
        {
            try { return objData.UpdateMasterBuildingFloor(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterBuildingFloor", entity.FloorId.ToString()); throw; }
        }

        public bool SoftDeleteMasterBuildingFloor(int FloorId)
        {
            try { return objData.SoftDeleteMasterBuildingFloor(FloorId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBuildingFloor", FloorId.ToString()); throw; }
        }

        #endregion

        #region BuildingNameType Methods

        public List<MasterBuildingNameTypeEntity> GetMasterBuildingNameTypes()
        {
            List<MasterBuildingNameTypeEntity> objList = new List<MasterBuildingNameTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterBuildingNameTypes();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterBuildingNameTypeEntity
                    {
                        BuildingNameTypeId = row["BuildingNameTypeId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuildingNameTypeId"]),
                        BuildingNameType = row["BuildingNameType"] == DBNull.Value ? "" : row["BuildingNameType"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterBuildingNameTypes"); throw; }
            return objList;
        }

        public bool InsertMasterBuildingNameType(MasterBuildingNameTypeEntity entity)
        {
            try { return objData.InsertMasterBuildingNameType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterBuildingNameType", entity.BuildingNameType); throw; }
        }

        public bool UpdateMasterBuildingNameType(MasterBuildingNameTypeEntity entity)
        {
            try { return objData.UpdateMasterBuildingNameType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterBuildingNameType", entity.BuildingNameTypeId.ToString()); throw; }
        }

        public bool SoftDeleteMasterBuildingNameType(int BuildingNameTypeId)
        {
            try { return objData.SoftDeleteMasterBuildingNameType(BuildingNameTypeId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBuildingNameType", BuildingNameTypeId.ToString()); throw; }
        }

        #endregion

        #region BuildingOwnershipType Methods

        public List<MasterBuildingOwnershipTypeEntity> GetMasterBuildingOwnershipTypes()
        {
            List<MasterBuildingOwnershipTypeEntity> objList = new List<MasterBuildingOwnershipTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterBuildingOwnershipTypes();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterBuildingOwnershipTypeEntity
                    {
                        OwnerShipTypeid = row["OwnerShipTypeid"] == DBNull.Value ? 0 : Convert.ToInt32(row["OwnerShipTypeid"]),
                        OwnerShipType = row["OwnerShipType"] == DBNull.Value ? "" : row["OwnerShipType"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterBuildingOwnershipTypes"); throw; }
            return objList;
        }

        public bool InsertMasterBuildingOwnershipType(MasterBuildingOwnershipTypeEntity entity)
        {
            try { return objData.InsertMasterBuildingOwnershipType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterBuildingOwnershipType", entity.OwnerShipType); throw; }
        }

        public bool UpdateMasterBuildingOwnershipType(MasterBuildingOwnershipTypeEntity entity)
        {
            try { return objData.UpdateMasterBuildingOwnershipType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterBuildingOwnershipType", entity.OwnerShipTypeid.ToString()); throw; }
        }

        public bool SoftDeleteMasterBuildingOwnershipType(int OwnerShipTypeid)
        {
            try { return objData.SoftDeleteMasterBuildingOwnershipType(OwnerShipTypeid); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBuildingOwnershipType", OwnerShipTypeid.ToString()); throw; }
        }

        #endregion

        #region BuildingStatus Methods

        public List<MasterBuildingStatusEntity> GetMasterBuildingStatuses()
        {
            List<MasterBuildingStatusEntity> objList = new List<MasterBuildingStatusEntity>();
            try
            {
                DataTable dt = objData.GetMasterBuildingStatuses();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterBuildingStatusEntity
                    {
                        BuildingStatusId = row["BuildingStatusId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuildingStatusId"]),
                        BuildingStatus = row["BuildingStatus"] == DBNull.Value ? "" : row["BuildingStatus"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterBuildingStatuses"); throw; }
            return objList;
        }

        public bool InsertMasterBuildingStatus(MasterBuildingStatusEntity entity)
        {
            try { return objData.InsertMasterBuildingStatus(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterBuildingStatus", entity.BuildingStatus); throw; }
        }

        public bool UpdateMasterBuildingStatus(MasterBuildingStatusEntity entity)
        {
            try { return objData.UpdateMasterBuildingStatus(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterBuildingStatus", entity.BuildingStatusId.ToString()); throw; }
        }

        public bool SoftDeleteMasterBuildingStatus(int BuildingStatusId)
        {
            try { return objData.SoftDeleteMasterBuildingStatus(BuildingStatusId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBuildingStatus", BuildingStatusId.ToString()); throw; }
        }

        #endregion

        #region BuildingUsageType Methods

        public List<MasterBuildingUsageTypeEntity> GetMasterBuildingUsageTypes()
        {
            List<MasterBuildingUsageTypeEntity> objList = new List<MasterBuildingUsageTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterBuildingUsageTypes();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterBuildingUsageTypeEntity
                    {
                        UsageTypeId = row["UsageTypeId"] == DBNull.Value ? 0 : Convert.ToInt32(row["UsageTypeId"]),
                        UsageType = row["UsageType"] == DBNull.Value ? "" : row["UsageType"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterBuildingUsageTypes"); throw; }
            return objList;
        }

        public bool InsertMasterBuildingUsageType(MasterBuildingUsageTypeEntity entity)
        {
            try { return objData.InsertMasterBuildingUsageType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterBuildingUsageType", entity.UsageType); throw; }
        }

        public bool UpdateMasterBuildingUsageType(MasterBuildingUsageTypeEntity entity)
        {
            try { return objData.UpdateMasterBuildingUsageType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterBuildingUsageType", entity.UsageTypeId.ToString()); throw; }
        }

        public bool SoftDeleteMasterBuildingUsageType(int UsageTypeId)
        {
            try { return objData.SoftDeleteMasterBuildingUsageType(UsageTypeId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBuildingUsageType", UsageTypeId.ToString()); throw; }
        }

        #endregion

        #region Constituency Methods

        public List<MasterConstituencyEntity> GetMasterConstituencies()
        {
            List<MasterConstituencyEntity> objList = new List<MasterConstituencyEntity>();
            try
            {
                DataTable dt = objData.GetMasterConstituencies();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterConstituencyEntity
                    {
                        ConstituencyID = row["ConstituencyID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ConstituencyID"]),
                        Constituency = row["Constituency"] == DBNull.Value ? "" : row["Constituency"].ToString(),
                        ConstituencyMarathi = row["ConstituencyMarathi"] == DBNull.Value ? null : row["ConstituencyMarathi"].ToString(),
                        DistrictID = row["DistrictID"] == DBNull.Value ? 0 : Convert.ToInt32(row["DistrictID"]),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        DistrictName = row["DistrictName"] == DBNull.Value ? null : row["DistrictName"].ToString(),
                        StateName = row["StateName"] == DBNull.Value ? null : row["StateName"].ToString(),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterConstituencies"); throw; }
            return objList;
        }

        public bool InsertMasterConstituency(MasterConstituencyEntity entity)
        {
            try { return objData.InsertMasterConstituency(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterConstituency", entity.Constituency); throw; }
        }

        public bool UpdateMasterConstituency(MasterConstituencyEntity entity)
        {
            try { return objData.UpdateMasterConstituency(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterConstituency", entity.ConstituencyID.ToString()); throw; }
        }

        public bool SoftDeleteMasterConstituency(int ConstituencyID)
        {
            try { return objData.SoftDeleteMasterConstituency(ConstituencyID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterConstituency", ConstituencyID.ToString()); throw; }
        }

        #endregion

        #region ConstructionType Methods

        public List<MasterConstructionTypeEntity> GetMasterConstructionTypes()
        {
            List<MasterConstructionTypeEntity> objList = new List<MasterConstructionTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterConstructionTypes();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterConstructionTypeEntity
                        {
                            ConstructionTypeId = row["ConstructionTypeId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ConstructionTypeId"]),
                            ConstructionType = row["ConstructionType"] == DBNull.Value ? "" : row["ConstructionType"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterConstructionTypes"); throw; }
            return objList;
        }

        public bool InsertMasterConstructionType(MasterConstructionTypeEntity entity)
        {
            try { return    objData.InsertMasterConstructionType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterConstructionType", entity.ConstructionType); throw; }
        }

        public bool UpdateMasterConstructionType(MasterConstructionTypeEntity entity)
        {
            try { return objData.UpdateMasterConstructionType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterConstructionType", entity.ConstructionTypeId.ToString()); throw; }
        }

        public bool SoftDeleteMasterConstructionType(int ConstructionTypeId)
        {
            try { return objData.SoftDeleteMasterConstructionType(ConstructionTypeId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterConstructionType", ConstructionTypeId.ToString()); throw; }
        }

        #endregion

        #region ConstructionYear Methods

        public List<MasterConstructionYearEntity> GetMasterConstructionYears()
        {
            List<MasterConstructionYearEntity> objList = new List<MasterConstructionYearEntity>();
            try
            {
                DataTable dt = objData.GetMasterConstructionYears();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterConstructionYearEntity
                        {
                            YearId = row["YearId"] == DBNull.Value ? 0 : Convert.ToInt32(row["YearId"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterConstructionYears"); throw; }
            return objList;
        }

        public bool InsertMasterConstructionYear(MasterConstructionYearEntity entity)
        {
            try { return objData.InsertMasterConstructionYear(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterConstructionYear", entity.YearId.ToString()); throw; }
        }

        public bool UpdateMasterConstructionYear(MasterConstructionYearEntity entity)
        {
            try { return objData.UpdateMasterConstructionYear(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterConstructionYear", entity.YearId.ToString()); throw; }
        }

        public bool SoftDeleteMasterConstructionYear(int YearId)
        {
            try { return objData.SoftDeleteMasterConstructionYear(YearId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterConstructionYear", YearId.ToString()); throw; }
        }

        #endregion

        #region ContactUsType Methods

        public List<MasterContactUsTypeEntity> GetMasterContactUsTypes()
        {
            List<MasterContactUsTypeEntity> objList = new List<MasterContactUsTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterContactUsTypes();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterContactUsTypeEntity
                        {
                            ContactUsTypeID = row["ContactUsTypeID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ContactUsTypeID"]),
                            ContactUsType = row["ContactUsType"] == DBNull.Value ? "" : row["ContactUsType"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterContactUsTypes"); throw; }
            return objList;
        }

        public bool InsertMasterContactUsType(MasterContactUsTypeEntity entity)
        {
            try { return objData.InsertMasterContactUsType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterContactUsType", entity.ContactUsType); throw; }
        }

        public bool UpdateMasterContactUsType(MasterContactUsTypeEntity entity)
        {
            try { return objData.UpdateMasterContactUsType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterContactUsType", entity.ContactUsTypeID.ToString()); throw; }
        }

        public bool SoftDeleteMasterContactUsType(int ContactUsTypeID)
        {
            try { return objData.SoftDeleteMasterContactUsType(ContactUsTypeID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterContactUsType", ContactUsTypeID.ToString()); throw; }
        }

        #endregion

        #region CourseApprover Methods

        public List<MasterCourseApproverEntity> GetMasterCourseApprovers()
        {
            List<MasterCourseApproverEntity> objList = new List<MasterCourseApproverEntity>();
            try
            {
                DataTable dt = objData.GetMasterCourseApprovers();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterCourseApproverEntity
                        {
                            CourseApproverID = row["CourseApproverID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CourseApproverID"]),
                            CourseApprover = row["CourseApprover"] == DBNull.Value ? "" : row["CourseApprover"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterCourseApprovers"); throw; }
            return objList;
        }

        public bool InsertMasterCourseApprover(MasterCourseApproverEntity entity)
        {
            try { return objData.InsertMasterCourseApprover(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterCourseApprover", entity.CourseApprover); throw; }
        }

        public bool UpdateMasterCourseApprover(MasterCourseApproverEntity entity)
        {
            try { return objData.UpdateMasterCourseApprover(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterCourseApprover", entity.CourseApproverID.ToString()); throw; }
        }

        public bool SoftDeleteMasterCourseApprover(int CourseApproverID)
        {
            try { return objData.SoftDeleteMasterCourseApprover(CourseApproverID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterCourseApprover", CourseApproverID.ToString()); throw; }
        }

        #endregion

        #region Sector Methods

        public List<MasterSectorEntity> GetMasterSectors()
        {
            List<MasterSectorEntity> objList = new List<MasterSectorEntity>();
            try
            {
                DataTable dt = objData.GetMasterSectors();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterSectorEntity
                    {
                        SectorID = row["SectorID"] == DBNull.Value ? 0 : Convert.ToInt32(row["SectorID"]),
                        Sector = row["Sector"] == DBNull.Value ? "" : row["Sector"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterSectors"); throw; }
            return objList;
        }

        public bool InsertMasterSector(MasterSectorEntity entity)
        {
            try { return objData.InsertMasterSector(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterSector", entity.Sector); throw; }
        }

        public bool UpdateMasterSector(MasterSectorEntity entity)
        {
            try { return objData.UpdateMasterSector(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterSector", entity.SectorID.ToString()); throw; }
        }

        public bool SoftDeleteMasterSector(int SectorID)
        {
            try { return objData.SoftDeleteMasterSector(SectorID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSector", SectorID.ToString()); throw; }
        }

        #endregion

        #region ElectiveSubject Methods

        public List<MasterElectiveSubjectEntity> GetMasterElectiveSubjects()
        {
            List<MasterElectiveSubjectEntity> objList = new List<MasterElectiveSubjectEntity>();
            try
            {
                DataTable dt = objData.GetMasterElectiveSubjects();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterElectiveSubjectEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            SubjectName = row["SubjectName"] == DBNull.Value ? "" : row["SubjectName"].ToString(),
                            SubjectType = row["SubjectType"] == DBNull.Value ? "" : row["SubjectType"].ToString(),
                            GroupID = row["GroupID"] == DBNull.Value ? 0 : Convert.ToInt32(row["GroupID"]),
                            CourseID = row["CourseID"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["CourseID"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                            SubjectCode = row["SubjectCode"] == DBNull.Value ? null : row["SubjectCode"].ToString(),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterElectiveSubjects"); throw; }
            return objList;
        }

        public bool InsertMasterElectiveSubject(MasterElectiveSubjectEntity entity)
        {
            try { return objData.InsertMasterElectiveSubject(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterElectiveSubject", entity.SubjectName); throw; }
        }

        public bool UpdateMasterElectiveSubject(MasterElectiveSubjectEntity entity)
        {
            try { return objData.UpdateMasterElectiveSubject(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterElectiveSubject", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterElectiveSubject(int ID)
        {
            try { return objData.SoftDeleteMasterElectiveSubject(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterElectiveSubject", ID.ToString()); throw; }
        }

        #endregion

        #region MasterTitle Methods

        public List<MasterTitleEntity> GetMasterTitles()
        {
            List<MasterTitleEntity> objList = new List<MasterTitleEntity>();
            try
            {
                DataTable dt = objData.GetMasterTitles();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterTitleEntity
                        {
                            TitleID = row["TitleID"] == DBNull.Value ? 0 : Convert.ToInt32(row["TitleID"]),
                            Title = row["Title"] == DBNull.Value ? "" : row["Title"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterTitles"); throw; }
            return objList;
        }

        public bool InsertMasterTitle(MasterTitleEntity entity)
        {
            try { return objData.InsertMasterTitle(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterTitle", entity.Title); throw; }
        }

        public bool UpdateMasterTitle(MasterTitleEntity entity)
        {
            try { return objData.UpdateMasterTitle(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterTitle", entity.TitleID.ToString()); throw; }
        }

        public bool SoftDeleteMasterTitle(int TitleID)
        {
            try { return objData.SoftDeleteMasterTitle(TitleID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTitle", TitleID.ToString()); throw; }
        }

        #endregion

        #region SignatureAuthority Methods

        public List<MasterSignatureAuthorityEntity> GetMasterSignatureAuthorities()
        {
            List<MasterSignatureAuthorityEntity> objList = new List<MasterSignatureAuthorityEntity>();
            try
            {
                DataTable dt = objData.GetMasterSignatureAuthorities();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterSignatureAuthorityEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            SignatureType = row["SignatureType"] == DBNull.Value ? "" : row["SignatureType"].ToString(),
                            NameOfAuthority = row["NameOfAuthority"] == DBNull.Value ? "" : row["NameOfAuthority"].ToString(),
                            Designation = row["Designation"] == DBNull.Value ? "" : row["Designation"].ToString(),
                            SignaturePath = row["SignaturePath"] == DBNull.Value ? null : row["SignaturePath"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                            IsCurrent = row["IsCurrent"] == DBNull.Value ? false : Convert.ToBoolean(row["IsCurrent"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterSignatureAuthorities"); throw; }
            return objList;
        }

        public int InsertMasterSignatureAuthority(MasterSignatureAuthorityEntity entity)
        {
            try { return objData.InsertMasterSignatureAuthority(entity); } 
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterSignatureAuthority", entity.NameOfAuthority); throw; }
        }
        public bool UpdateMasterSignatureAuthority(MasterSignatureAuthorityEntity entity)
        {
            try { return objData.UpdateMasterSignatureAuthority(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterSignatureAuthority", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterSignatureAuthority(int ID)
        {
            try { return objData.SoftDeleteMasterSignatureAuthority(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSignatureAuthority", ID.ToString()); throw; }
        }

        #endregion

        #region FloorPreference Methods

        public List<MasterFloorPreferenceEntity> GetMasterFloorPreferences()
        {
            List<MasterFloorPreferenceEntity> objList = new List<MasterFloorPreferenceEntity>();
            try
            {
                DataTable dt = objData.GetMasterFloorPreferences();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterFloorPreferenceEntity
                        {
                            FloorId = row["FloorId"] == DBNull.Value ? 0 : Convert.ToInt32(row["FloorId"]),
                            FloorName = row["FloorName"] == DBNull.Value ? "" : row["FloorName"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterFloorPreferences"); throw; }
            return objList;
        }

        public bool InsertMasterFloorPreference(MasterFloorPreferenceEntity entity)
        {
            try { return objData.InsertMasterFloorPreference(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterFloorPreference", entity.FloorName); throw; }
        }

        public bool UpdateMasterFloorPreference(MasterFloorPreferenceEntity entity)
        {
            try { return objData.UpdateMasterFloorPreference(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterFloorPreference", entity.FloorId.ToString()); throw; }
        }

        public bool SoftDeleteMasterFloorPreference(int FloorId)
        {
            try { return objData.SoftDeleteMasterFloorPreference(FloorId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterFloorPreference", FloorId.ToString()); throw; }
        }

        #endregion

        #region GrievanceCategory Methods

        public List<MasterGrievanceCategoryEntity> GetMasterGrievanceCategories()
        {
            List<MasterGrievanceCategoryEntity> objList = new List<MasterGrievanceCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterGrievanceCategories();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterGrievanceCategoryEntity
                    {
                        GrievanceCategoryID = row["GrievanceCategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["GrievanceCategoryID"]),
                        GrievanceCategory = row["GrievanceCategory"] == DBNull.Value ? "" : row["GrievanceCategory"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterGrievanceCategories"); throw; }
            return objList;
        }

        public bool InsertMasterGrievanceCategory(MasterGrievanceCategoryEntity entity)
        {
            try { return objData.InsertMasterGrievanceCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterGrievanceCategory", entity.GrievanceCategory); throw; }
        }

        public bool UpdateMasterGrievanceCategory(MasterGrievanceCategoryEntity entity)
        {
            try { return objData.UpdateMasterGrievanceCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterGrievanceCategory", entity.GrievanceCategoryID.ToString()); throw; }
        }

        public bool SoftDeleteMasterGrievanceCategory(int GrievanceCategoryID)
        {
            try { return objData.SoftDeleteMasterGrievanceCategory(GrievanceCategoryID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterGrievanceCategory", GrievanceCategoryID.ToString()); throw; }
        }

        #endregion

        #region FAQCategory Methods

        public List<MasterFAQCategoryEntity> GetMasterFAQCategories()
        {
            List<MasterFAQCategoryEntity> objList = new List<MasterFAQCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterFAQCategories();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterFAQCategoryEntity
                    {
                        FAQCategoryID = row["FAQCategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["FAQCategoryID"]),
                        FAQCategory = row["FAQCategory"] == DBNull.Value ? "" : row["FAQCategory"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterFAQCategories"); throw; }
            return objList;
        }

        public bool InsertMasterFAQCategory(MasterFAQCategoryEntity entity)
        {
            try { return objData.InsertMasterFAQCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterFAQCategory", entity.FAQCategory); throw; }
        }

        public bool UpdateMasterFAQCategory(MasterFAQCategoryEntity entity)
        {
            try { return objData.UpdateMasterFAQCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterFAQCategory", entity.FAQCategoryID.ToString()); throw; }
        }

        public bool SoftDeleteMasterFAQCategory(int FAQCategoryID)
        {
            try { return objData.SoftDeleteMasterFAQCategory(FAQCategoryID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterFAQCategory", FAQCategoryID.ToString()); throw; }
        }

        #endregion

        #region FacilitySubGroup Methods

        public List<MasterFacilitySubGroupEntity> GetMasterFacilitySubGroups()
        {
            List<MasterFacilitySubGroupEntity> objList = new List<MasterFacilitySubGroupEntity>();
            try
            {
                DataTable dt = objData.GetMasterFacilitySubGroups();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterFacilitySubGroupEntity
                    {
                        SubFacilityGroupId = row["SubFacilityGroupId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SubFacilityGroupId"]),
                        FacilityGroupId = row["FacilityGroupId"] == DBNull.Value ? 0 : Convert.ToInt32(row["FacilityGroupId"]),
                        SubFacilityGroup = row["SubFacilityGroup"] == DBNull.Value ? "" : row["SubFacilityGroup"].ToString(),
                        RequiredNumber = row["RequiredNumber"] == DBNull.Value ? 0 : Convert.ToInt32(row["RequiredNumber"]),
                        RequiredSpace = row["RequiredSpace"] == DBNull.Value ? 0 : Convert.ToDecimal(row["RequiredSpace"]),
                        HasMultiplyFactor = row["HasMultiplyFactor"] == DBNull.Value ? false : Convert.ToBoolean(row["HasMultiplyFactor"]),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterFacilitySubGroups"); throw; }
            return objList;
        }

        public bool InsertMasterFacilitySubGroup(MasterFacilitySubGroupEntity entity)
        {
            try { return objData.InsertMasterFacilitySubGroup(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterFacilitySubGroup", entity.SubFacilityGroup); throw; }
        }

        public bool UpdateMasterFacilitySubGroup(MasterFacilitySubGroupEntity entity)
        {
            try { return objData.UpdateMasterFacilitySubGroup(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterFacilitySubGroup", entity.SubFacilityGroupId.ToString()); throw; }
        }

        public bool SoftDeleteMasterFacilitySubGroup(int SubFacilityGroupId)
        {
            try { return objData.SoftDeleteMasterFacilitySubGroup(SubFacilityGroupId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterFacilitySubGroup", SubFacilityGroupId.ToString()); throw; }
        }

        #endregion

        #region JobRole Methods (Business Logic)

        public List<MasterJobRoleEntity> GetMasterJobRoles()
        {
            List<MasterJobRoleEntity> objList = new List<MasterJobRoleEntity>();
            try
            {
                DataTable dt = objData.GetMasterJobRoles();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterJobRoleEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            JobRoleName = row["JobRoleName"] == DBNull.Value ? "" : row["JobRoleName"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterJobRoles"); throw; }
            return objList;
        }

        public bool InsertMasterJobRole(MasterJobRoleEntity entity)
        {
            try { return objData.InsertMasterJobRole(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterJobRole", entity.JobRoleName); throw; }
        }

        public bool UpdateMasterJobRole(MasterJobRoleEntity entity)
        {
            try { return objData.UpdateMasterJobRole(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterJobRole", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterJobRole(int ID)
        {
            try { return objData.SoftDeleteMasterJobRole(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterJobRole", ID.ToString()); throw; }
        }

        #endregion

        #region LocationCategory Methods

        public List<MasterLocationCategoryEntity> GetMasterLocationCategories()
        {
            List<MasterLocationCategoryEntity> objList = new List<MasterLocationCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterLocationCategories();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterLocationCategoryEntity
                    {
                        LocationCategoryID = row["LocationCategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["LocationCategoryID"]),
                        LocationCategory = row["LocationCategory"] == DBNull.Value ? "" : row["LocationCategory"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterLocationCategories"); throw; }
            return objList;
        }

        public bool InsertMasterLocationCategory(MasterLocationCategoryEntity entity)
        {
            try { return objData.InsertMasterLocationCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterLocationCategory", entity.LocationCategory); throw; }
        }

        public bool UpdateMasterLocationCategory(MasterLocationCategoryEntity entity)
        {
            try { return objData.UpdateMasterLocationCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterLocationCategory", entity.LocationCategoryID.ToString()); throw; }
        }

        public bool SoftDeleteMasterLocationCategory(int LocationCategoryID)
        {
            try { return objData.SoftDeleteMasterLocationCategory(LocationCategoryID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterLocationCategory", LocationCategoryID.ToString()); throw; }
        }

        #endregion

        #region LandOwnershipType Methods

        public List<MasterLandOwnershipTypeEntity> GetMasterLandOwnershipTypes()
        {
            List<MasterLandOwnershipTypeEntity> objList = new List<MasterLandOwnershipTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterLandOwnershipTypes();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterLandOwnershipTypeEntity
                        {
                            OwnerShipTypeid = row["OwnerShipTypeid"] == DBNull.Value ? 0 : Convert.ToInt32(row["OwnerShipTypeid"]),
                            OwnerShipType = row["OwnerShipType"] == DBNull.Value ? "" : row["OwnerShipType"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterLandOwnershipTypes"); throw; }
            return objList;
        }

        public bool InsertMasterLandOwnershipType(MasterLandOwnershipTypeEntity entity)
        {
            try { return objData.InsertMasterLandOwnershipType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterLandOwnershipType", entity.OwnerShipType); throw; }
        }

        public bool UpdateMasterLandOwnershipType(MasterLandOwnershipTypeEntity entity)
        {
            try { return objData.UpdateMasterLandOwnershipType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterLandOwnershipType", entity.OwnerShipTypeid.ToString()); throw; }
        }

        public bool SoftDeleteMasterLandOwnershipType(int OwnerShipTypeid)
        {
            try { return objData.SoftDeleteMasterLandOwnershipType(OwnerShipTypeid); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterLandOwnershipType", OwnerShipTypeid.ToString()); throw; }
        }

        #endregion

        #region Master Month Methods

        public List<MasterMonthEntity> GetMasterMonths()
        {
            List<MasterMonthEntity> objList = new List<MasterMonthEntity>();
            try
            {
                DataTable dt = objData.GetMasterMonths();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterMonthEntity
                    {
                        MonthId = row["MonthId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonthId"]),
                        MonthsName = row["MonthsName"] == DBNull.Value ? "" : row["MonthsName"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterMonths"); throw; }
            return objList;
        }

        public bool InsertMasterMonth(MasterMonthEntity entity)
        {
            try { return objData.InsertMasterMonth(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterMonth", entity.MonthsName); throw; }
        }

        public bool UpdateMasterMonth(MasterMonthEntity entity)
        {
            try { return objData.UpdateMasterMonth(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterMonth", entity.MonthId.ToString()); throw; }
        }

        public bool SoftDeleteMasterMonth(int MonthId)
        {
            try { return objData.SoftDeleteMasterMonth(MonthId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterMonth", MonthId.ToString()); throw; }
        }

        #endregion

        #region SecurityQuestion Methods

        public List<MasterSecurityQuestionEntity> GetMasterSecurityQuestions()
        {
            List<MasterSecurityQuestionEntity> objList = new List<MasterSecurityQuestionEntity>();
            try
            {
                DataTable dt = objData.GetMasterSecurityQuestions();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterSecurityQuestionEntity
                        {
                            SecurityQuestionID = row["SecurityQuestionID"] == DBNull.Value ? 0 : Convert.ToInt32(row["SecurityQuestionID"]),
                            SecurityQuestion = row["SecurityQuestion"] == DBNull.Value ? "" : row["SecurityQuestion"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterSecurityQuestions"); throw; }
            return objList;
        }

        public bool InsertMasterSecurityQuestion(MasterSecurityQuestionEntity entity)
        {
            try { return objData.InsertMasterSecurityQuestion(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterSecurityQuestion", entity.SecurityQuestion); throw; }
        }

        public bool UpdateMasterSecurityQuestion(MasterSecurityQuestionEntity entity)
        {
            try { return objData.UpdateMasterSecurityQuestion(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterSecurityQuestion", entity.SecurityQuestionID.ToString()); throw; }
        }

        public bool SoftDeleteMasterSecurityQuestion(int SecurityQuestionID)
        {
            try { return objData.SoftDeleteMasterSecurityQuestion(SecurityQuestionID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSecurityQuestion", SecurityQuestionID.ToString()); throw; }
        }

        #endregion

        #region SkillTrade Methods

        public List<MasterSkillTradeEntity> GetMasterSkillTrades()
        {
            List<MasterSkillTradeEntity> objList = new List<MasterSkillTradeEntity>();
            try
            {
                DataTable dt = objData.GetMasterSkillTrades();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterSkillTradeEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            TradeName = row["TradeName"] == DBNull.Value ? "" : row["TradeName"].ToString(),
                            TradeCode = row["TradeCode"] == DBNull.Value ? null : row["TradeCode"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterSkillTrades"); throw; }
            return objList;
        }

        public bool InsertMasterSkillTrade(MasterSkillTradeEntity entity)
        {
            try { return objData.InsertMasterSkillTrade(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterSkillTrade", entity.TradeName); throw; }
        }

        public bool UpdateMasterSkillTrade(MasterSkillTradeEntity entity)
        {
            try { return objData.UpdateMasterSkillTrade(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterSkillTrade", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterSkillTrade(int ID)
        {
            try { return objData.SoftDeleteMasterSkillTrade(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSkillTrade", ID.ToString()); throw; }
        }

        #endregion

        #region Qualification Methods

        public List<MasterQualificationEntity> GetMasterQualifications()
        {
            List<MasterQualificationEntity> objList = new List<MasterQualificationEntity>();
            try
            {
                DataTable dt = objData.GetMasterQualifications();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterQualificationEntity
                        {
                            QualificationID = row["QualificationID"] == DBNull.Value ? 0 : Convert.ToInt32(row["QualificationID"]),
                            Qualification = row["Qualification"] == DBNull.Value ? "" : row["Qualification"].ToString(),
                            QualificationGroup = row["QualificationGroup"] == DBNull.Value ? "" : row["QualificationGroup"].ToString(),
                            SeqNO = row["SeqNO"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["SeqNO"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterQualifications"); throw; }
            return objList;
        }

        public bool InsertMasterQualification(MasterQualificationEntity entity)
        {
            try { return objData.InsertMasterQualification(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterQualification", entity.Qualification); throw; }
        }

        public bool UpdateMasterQualification(MasterQualificationEntity entity)
        {
            try { return objData.UpdateMasterQualification(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterQualification", entity.QualificationID.ToString()); throw; }
        }

        public bool SoftDeleteMasterQualification(int QualificationID)
        {
            try { return objData.SoftDeleteMasterQualification(QualificationID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterQualification", QualificationID.ToString()); throw; }
        }

        #endregion

        #region RestrictedKeyword Methods

        public List<MasterRestrictedKeywordEntity> GetMasterRestrictedKeywords()
        {
            List<MasterRestrictedKeywordEntity> objList = new List<MasterRestrictedKeywordEntity>();
            try
            {
                DataTable dt = objData.GetMasterRestrictedKeywords();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterRestrictedKeywordEntity
                    {
                        KeyWordID = row["KeyWordID"] == DBNull.Value ? 0 : Convert.ToInt32(row["KeyWordID"]),
                        KeyWordName = row["KeyWordName"] == DBNull.Value ? "" : row["KeyWordName"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterRestrictedKeywords"); throw; }
            return objList;
        }

        public bool InsertMasterRestrictedKeyword(MasterRestrictedKeywordEntity entity)
        {
            try { return objData.InsertMasterRestrictedKeyword(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterRestrictedKeyword", entity.KeyWordName); throw; }
        }

        public bool UpdateMasterRestrictedKeyword(MasterRestrictedKeywordEntity entity)
        {
            try { return objData.UpdateMasterRestrictedKeyword(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterRestrictedKeyword", entity.KeyWordID.ToString()); throw; }
        }

        public bool SoftDeleteMasterRestrictedKeyword(int KeyWordID)
        {
            try { return objData.SoftDeleteMasterRestrictedKeyword(KeyWordID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterRestrictedKeyword", KeyWordID.ToString()); throw; }
        }

        #endregion

        #region Master_Shift Methods

        public List<MasterShiftEntity> GetMasterShifts()
        {
            List<MasterShiftEntity> objList = new List<MasterShiftEntity>();
            try
            {
                DataTable dt = objData.GetMasterShifts();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterShiftEntity
                    {
                        ShiftID = row["ShiftID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ShiftID"]),
                        Shift = row["Shift"] == DBNull.Value ? "" : row["Shift"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterShifts"); throw; }
            return objList;
        }

        public bool InsertMasterShift(MasterShiftEntity entity)
        {
            try { return objData.InsertMasterShift(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterShift", entity.Shift); throw; }
        }

        public bool UpdateMasterShift(MasterShiftEntity entity)
        {
            try { return objData.UpdateMasterShift(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterShift", entity.ShiftID.ToString()); throw; }
        }

        public bool SoftDeleteMasterShift(int ShiftID)
        {
            try { return objData.SoftDeleteMasterShift(ShiftID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterShift", ShiftID.ToString()); throw; }
        }

        #endregion

        #region VCApplication Methods

        public List<MasterVCApplicationEntity> GetMasterVCApplications()
        {
            List<MasterVCApplicationEntity> objList = new List<MasterVCApplicationEntity>();
            try
            {
                DataTable dt = objData.GetMasterVCApplications();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterVCApplicationEntity
                    {
                        ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                        VCApplication = row["VCApplication"] == DBNull.Value ? "" : row["VCApplication"].ToString(),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterVCApplications"); throw; }
            return objList;
        }

        public int InsertMasterVCApplication(MasterVCApplicationEntity entity)
        {
            try { return objData.InsertMasterVCApplication(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterVCApplication", entity.VCApplication); throw; }
        }
        public bool UpdateMasterVCApplication(MasterVCApplicationEntity entity)
        {
            try { return objData.UpdateMasterVCApplication(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterVCApplication", entity.ID.ToString()); throw; }
        }

        public bool DeleteMasterVCApplication(int ID)
        {
            try { return objData.DeleteMasterVCApplication(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "DeleteMasterVCApplication", ID.ToString()); throw; }
        }

        #endregion

        #region TypeofInstitute Methods

        public List<MasterTypeofInstituteEntity> GetMasterTypeofInstitutes()
        {
            List<MasterTypeofInstituteEntity> objList = new List<MasterTypeofInstituteEntity>();
            try
            {
                DataTable dt = objData.GetMasterTypeofInstitutes();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterTypeofInstituteEntity
                    {
                        ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                        TypefInstitute = row["TypefInstitute"] == DBNull.Value ? "" : row["TypefInstitute"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        SeqNo = row["SeqNo"] == DBNull.Value ? 0 : Convert.ToInt32(row["SeqNo"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterTypeofInstitutes"); throw; }
            return objList;
        }

        public bool InsertMasterTypeofInstitute(MasterTypeofInstituteEntity entity)
        {
            try { return objData.InsertMasterTypeofInstitute(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterTypeofInstitute", entity.TypefInstitute); throw; }
        }

        public bool UpdateMasterTypeofInstitute(MasterTypeofInstituteEntity entity)
        {
            try { return objData.UpdateMasterTypeofInstitute(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterTypeofInstitute", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterTypeofInstitute(int ID)
        {
            try { return objData.SoftDeleteMasterTypeofInstitute(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTypeofInstitute", ID.ToString()); throw; }
        }

        #endregion

        #region TrainingRemarkforUtilization Methods

        public List<MasterTrainingRemarkforUtilizationEntity> GetMasterTrainingRemarkforUtilization()
        {
            List<MasterTrainingRemarkforUtilizationEntity> objList = new List<MasterTrainingRemarkforUtilizationEntity>();
            try
            {
                DataTable dt = objData.GetMasterTrainingRemarkforUtilization();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterTrainingRemarkforUtilizationEntity
                    {
                        ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                        RemarkforUtilization = row["RemarkforUtilization"] == DBNull.Value ? "" : row["RemarkforUtilization"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterTrainingRemarkforUtilization"); throw; }
            return objList;
        }

        public int GetNextTrainingRemarkforUtilizationID()
        {
            try { return objData.GetNextTrainingRemarkforUtilizationID(); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetNextTrainingRemarkforUtilizationID"); throw; }
        }

        public bool InsertMasterTrainingRemarkforUtilization(MasterTrainingRemarkforUtilizationEntity entity)
        {
            try { return objData.InsertMasterTrainingRemarkforUtilization(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterTrainingRemarkforUtilization", entity.RemarkforUtilization); throw; }
        }

        public bool UpdateMasterTrainingRemarkforUtilization(MasterTrainingRemarkforUtilizationEntity entity)
        {
            try { return objData.UpdateMasterTrainingRemarkforUtilization(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterTrainingRemarkforUtilization", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterTrainingRemarkforUtilization(int ID)
        {
            try { return objData.SoftDeleteMasterTrainingRemarkforUtilization(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTrainingRemarkforUtilization", ID.ToString()); throw; }
        }

        #endregion

        #region TrainingFeeCategory Methods (BusinessLogic)

        public List<MasterTrainingFeeCategoryEntity> GetMasterTrainingFeeCategories()
        {
            List<MasterTrainingFeeCategoryEntity> objList = new List<MasterTrainingFeeCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterTrainingFeeCategories();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterTrainingFeeCategoryEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            TrainingFeeCategory = row["TrainingFeeCategory"] == DBNull.Value ? "" : row["TrainingFeeCategory"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterTrainingFeeCategories"); throw; }
            return objList;
        }

        public int InsertMasterTrainingFeeCategory(MasterTrainingFeeCategoryEntity entity)
        {
            try { return objData.InsertMasterTrainingFeeCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterTrainingFeeCategory", entity.TrainingFeeCategory); throw; }
        }

        public bool UpdateMasterTrainingFeeCategory(MasterTrainingFeeCategoryEntity entity)
        {
            try { return objData.UpdateMasterTrainingFeeCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterTrainingFeeCategory", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterTrainingFeeCategory(int ID)
        {
            try { return objData.SoftDeleteMasterTrainingFeeCategory(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTrainingFeeCategory", ID.ToString()); throw; }
        }

        #endregion

        #region TrainingEquipment Methods

        public List<MasterTrainingEquipmentEntity> GetMasterTrainingEquipment()
        {
            List<MasterTrainingEquipmentEntity> objList = new List<MasterTrainingEquipmentEntity>();
            try
            {
                DataTable dt = objData.GetMasterTrainingEquipment();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterTrainingEquipmentEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            NameofItem = row["NameofItem"] == DBNull.Value ? "" : row["NameofItem"].ToString(),
                            ItemCode = row["ItemCode"] == DBNull.Value ? null : row["ItemCode"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterTrainingEquipment"); throw; }
            return objList;
        }

        public bool InsertMasterTrainingEquipment(MasterTrainingEquipmentEntity entity)
        {
            try { return objData.InsertMasterTrainingEquipment(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterTrainingEquipment", entity.NameofItem); throw; }
        }

        public bool UpdateMasterTrainingEquipment(MasterTrainingEquipmentEntity entity)
        {
            try { return objData.UpdateMasterTrainingEquipment(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterTrainingEquipment", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterTrainingEquipment(int ID)
        {
            try { return objData.SoftDeleteMasterTrainingEquipment(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTrainingEquipment", ID.ToString()); throw; }
        }

        #endregion

        #region TrainingCategory Methods

        public List<MasterTrainingCategoryEntity> GetMasterTrainingCategories()
        {
            List<MasterTrainingCategoryEntity> objList = new List<MasterTrainingCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterTrainingCategories();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterTrainingCategoryEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            TrainingCategory = row["TrainingCategory"] == DBNull.Value ? "" : row["TrainingCategory"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterTrainingCategories"); throw; }
            return objList;
        }

        public bool InsertMasterTrainingCategory(MasterTrainingCategoryEntity entity)
        {
            try { return objData.InsertMasterTrainingCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterTrainingCategory", entity.TrainingCategory); throw; }
        }

        public bool UpdateMasterTrainingCategory(MasterTrainingCategoryEntity entity)
        {
            try { return objData.UpdateMasterTrainingCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterTrainingCategory", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterTrainingCategory(int ID)
        {
            try { return objData.SoftDeleteMasterTrainingCategory(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTrainingCategory", ID.ToString()); throw; }
        }

        #endregion

        #region TrainingNameOfItem Methods

        public List<MasterTrainingNameOfItemEntity> GetMasterTrainingNameOfItems()
        {
            List<MasterTrainingNameOfItemEntity> objList = new List<MasterTrainingNameOfItemEntity>();
            try
            {
                DataTable dt = objData.GetMasterTrainingNameOfItems();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterTrainingNameOfItemEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            TrainingNameofItem = row["TrainingNameofItem"] == DBNull.Value ? "" : row["TrainingNameofItem"].ToString(),
                            //TraningCategoryID = row["TraningCategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["TraningCategoryID"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterTrainingNameOfItems"); throw; }
            return objList;
        }

        public int InsertMasterTrainingNameOfItem(MasterTrainingNameOfItemEntity entity)
        {
            try { return objData.InsertMasterTrainingNameOfItem(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterTrainingNameOfItem", entity.TrainingNameofItem); throw; }
        }

        public bool UpdateMasterTrainingNameOfItem(MasterTrainingNameOfItemEntity entity)
        {
            try { return objData.UpdateMasterTrainingNameOfItem(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterTrainingNameOfItem", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterTrainingNameOfItem(int ID)
        {
            try { return objData.SoftDeleteMasterTrainingNameOfItem(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTrainingNameOfItem", ID.ToString()); throw; }
        }

        #endregion

        #region MasterEquipmentCategories
        public List<MasterEquipmentCategoryEntity> GetMasterEquipmentCategories()
        {
            List<MasterEquipmentCategoryEntity> objList = new List<MasterEquipmentCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterEquipmentCategories();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterEquipmentCategoryEntity
                    {
                        EquipmentCategoryId = row["EquipmentCategoryId"] == DBNull.Value ? 0 : Convert.ToInt32(row["EquipmentCategoryId"]),
                        EquipmentCategory = row["EquipmentCategory"] == DBNull.Value ? "" : row["EquipmentCategory"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterEquipmentCategories"); throw; }
            return objList;
        }

        public bool InsertMasterEquipmentCategory(MasterEquipmentCategoryEntity entity)
        {
            try { return objData.InsertMasterEquipmentCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterEquipmentCategory", entity.EquipmentCategory); throw; }
        }

        public bool UpdateMasterEquipmentCategory(MasterEquipmentCategoryEntity entity)
        {
            try { return objData.UpdateMasterEquipmentCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterEquipmentCategory", entity.EquipmentCategoryId.ToString()); throw; }
        }

        public bool SoftDeleteMasterEquipmentCategory(int EquipmentCategoryId)
        {
            try { return objData.SoftDeleteMasterEquipmentCategory(EquipmentCategoryId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterEquipmentCategory", EquipmentCategoryId.ToString()); throw; }
        }
        #endregion

        #region SectorialExpertise Methods

        public List<MasterSectorialExpertiseEntity> GetMasterSectorialExpertise()
        {
            List<MasterSectorialExpertiseEntity> objList = new List<MasterSectorialExpertiseEntity>();
            try
            {
                DataTable dt = objData.GetMasterSectorialExpertise();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterSectorialExpertiseEntity
                    {
                        SectorialExpertiseID = row["SectorialExpertiseID"] == DBNull.Value ? 0 : Convert.ToInt32(row["SectorialExpertiseID"]),
                        SectorialExpertiseName = row["SectorialExpertiseName"] == DBNull.Value ? "" : row["SectorialExpertiseName"].ToString(),
                        SeqNo = row["SeqNo"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["SeqNo"]),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterSectorialExpertise"); throw; }
            return objList;
        }

        public bool InsertMasterSectorialExpertise(MasterSectorialExpertiseEntity entity)
        {
            try { return objData.InsertMasterSectorialExpertise(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterSectorialExpertise", entity.SectorialExpertiseName); throw; }
        }

        public bool UpdateMasterSectorialExpertise(MasterSectorialExpertiseEntity entity)
        {
            try { return objData.UpdateMasterSectorialExpertise(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterSectorialExpertise", entity.SectorialExpertiseID.ToString()); throw; }
        }

        public bool SoftDeleteMasterSectorialExpertise(int SectorialExpertiseID)
        {
            try { return objData.SoftDeleteMasterSectorialExpertise(SectorialExpertiseID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSectorialExpertise", SectorialExpertiseID.ToString()); throw; }
        }

        #endregion

        #region SubjectTypeExam Methods

        public List<SubjectTypeExamEntity> GetMasterSubjectTypeExam()
        {
            List<SubjectTypeExamEntity> objList = new List<SubjectTypeExamEntity>();
            try
            {
                DataTable dt = objData.GetMasterSubjectTypeExam();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new SubjectTypeExamEntity
                        {
                            SubjectTypeExamID = row["SubjectTypeExamID"] == DBNull.Value ? 0 : Convert.ToInt32(row["SubjectTypeExamID"]),
                            SubjectTypeExamName = row["SubjectTypeExamName"] == DBNull.Value ? "" : row["SubjectTypeExamName"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterSubjectTypeExam"); throw; }
            return objList;
        }

        public bool InsertMasterSubjectTypeExam(SubjectTypeExamEntity entity)
        {
            try { return objData.InsertMasterSubjectTypeExam(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterSubjectTypeExam", entity.SubjectTypeExamName); throw; }
        }

        public bool UpdateMasterSubjectTypeExam(SubjectTypeExamEntity entity)
        {
            try { return objData.UpdateMasterSubjectTypeExam(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterSubjectTypeExam", entity.SubjectTypeExamID.ToString()); throw; }
        }

        public bool SoftDeleteMasterSubjectTypeExam(int SubjectTypeExamID)
        {
            try { return objData.SoftDeleteMasterSubjectTypeExam(SubjectTypeExamID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSubjectTypeExam", SubjectTypeExamID.ToString()); throw; }
        }

        #endregion

        #region PromoterStatus Methods

        public List<MasterPromoterStatusEntity> GetMasterPromoterStatuses()
        {
            List<MasterPromoterStatusEntity> objList = new List<MasterPromoterStatusEntity>();
            try
            {
                DataTable dt = objData.GetMasterPromoterStatuses();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterPromoterStatusEntity
                        {
                            PromoterStatusID = row["PromoterStatusID"] == DBNull.Value ? 0 : Convert.ToInt32(row["PromoterStatusID"]),
                            PromoterStatus = row["PromoterStatus"] == DBNull.Value ? "" : row["PromoterStatus"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterPromoterStatuses"); throw; }
            return objList;
        }

        public bool InsertMasterPromoterStatus(MasterPromoterStatusEntity entity)
        {
            try { return objData.InsertMasterPromoterStatus(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterPromoterStatus", entity.PromoterStatus); throw; }
        }

        public bool UpdateMasterPromoterStatus(MasterPromoterStatusEntity entity)
        {
            try { return objData.UpdateMasterPromoterStatus(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterPromoterStatus", entity.PromoterStatusID.ToString()); throw; }
        }

        public bool SoftDeleteMasterPromoterStatus(int PromoterStatusID)
        {
            try { return objData.SoftDeleteMasterPromoterStatus(PromoterStatusID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterPromoterStatus", PromoterStatusID.ToString()); throw; }
        }

        #endregion

        #region PromoterType Methods

        public List<MasterPromoterTypeEntity> GetMasterPromoterTypes()
        {
            List<MasterPromoterTypeEntity> objList = new List<MasterPromoterTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterPromoterTypes();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterPromoterTypeEntity
                        {
                            PromoterTypeID = row["PromoterTypeID"] == DBNull.Value ? 0 : Convert.ToInt32(row["PromoterTypeID"]),
                            PromoterType = row["PromoterType"] == DBNull.Value ? "" : row["PromoterType"].ToString(),
                            PromoterGroup = row["PromoterGroup"] == DBNull.Value ? null : row["PromoterGroup"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterPromoterTypes"); throw; }
            return objList;
        }

        public bool InsertMasterPromoterType(MasterPromoterTypeEntity entity)
        {
            try { return objData.InsertMasterPromoterType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterPromoterType", entity.PromoterType); throw; }
        }

        public bool UpdateMasterPromoterType(MasterPromoterTypeEntity entity)
        {
            try { return objData.UpdateMasterPromoterType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterPromoterType", entity.PromoterTypeID.ToString()); throw; }
        }

        public bool SoftDeleteMasterPromoterType(int PromoterTypeID)
        {
            try { return objData.SoftDeleteMasterPromoterType(PromoterTypeID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterPromoterType", PromoterTypeID.ToString()); throw; }
        }

        #endregion

        #region PromotingType Methods

        public List<MasterPromotingTypeEntity> GetMasterPromotingTypes()
        {
            List<MasterPromotingTypeEntity> objList = new List<MasterPromotingTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterPromotingTypes();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterPromotingTypeEntity
                    {
                        PromotingTypeID = row["PromotingTypeID"] == DBNull.Value ? 0 : Convert.ToInt32(row["PromotingTypeID"]),
                        PromotingType = row["PromotingType"] == DBNull.Value ? "" : row["PromotingType"].ToString(),
                        PromotingGroup = row["PromotingGroup"] == DBNull.Value ? null : row["PromotingGroup"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterPromotingTypes"); throw; }
            return objList;
        }

        public bool InsertMasterPromotingType(MasterPromotingTypeEntity entity)
        {
            try { return objData.InsertMasterPromotingType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterPromotingType", entity.PromotingType); throw; }
        }

        public bool UpdateMasterPromotingType(MasterPromotingTypeEntity entity)
        {
            try { return objData.UpdateMasterPromotingType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterPromotingType", entity.PromotingTypeID.ToString()); throw; }
        }

        public bool SoftDeleteMasterPromotingType(int PromotingTypeID)
        {
            try { return objData.SoftDeleteMasterPromotingType(PromotingTypeID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterPromotingType", PromotingTypeID.ToString()); throw; }
        }

        #endregion

        #region NotificationCategory Methods

        public List<MasterNotificationCategoryEntity> GetMasterNotificationCategories()
        {
            List<MasterNotificationCategoryEntity> objList = new List<MasterNotificationCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterNotificationCategories();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterNotificationCategoryEntity
                        {
                            NotificationCategoryID = row["NotificationCategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["NotificationCategoryID"]),
                            NotificationCategory = row["NotificationCategory"] == DBNull.Value ? "" : row["NotificationCategory"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterNotificationCategories"); throw; }
            return objList;
        }

        public bool InsertMasterNotificationCategory(MasterNotificationCategoryEntity entity)
        {
            try { return objData.InsertMasterNotificationCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterNotificationCategory", entity.NotificationCategory); throw; }
        }

        public bool UpdateMasterNotificationCategory(MasterNotificationCategoryEntity entity)
        {
            try { return objData.UpdateMasterNotificationCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterNotificationCategory", entity.NotificationCategoryID.ToString()); throw; }
        }

        public bool SoftDeleteMasterNotificationCategory(int NotificationCategoryID)
        {
            try { return objData.SoftDeleteMasterNotificationCategory(NotificationCategoryID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterNotificationCategory", NotificationCategoryID.ToString()); throw; }
        }

        #endregion

        #region MasterOtherInfra Methods

        public List<MasterOtherInfraEntity> GetMasterOtherInfra()
        {
            List<MasterOtherInfraEntity> objList = new List<MasterOtherInfraEntity>();
            try
            {
                DataTable dt = objData.GetMasterOtherInfra();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterOtherInfraEntity
                    {
                        OtherInfraId = row["OtherInfraId"] == DBNull.Value ? 0 : Convert.ToInt32(row["OtherInfraId"]),
                        OtherInfra = row["OtherInfra"] == DBNull.Value ? "" : row["OtherInfra"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterOtherInfra"); throw; }
            return objList;
        }

        public bool InsertMasterOtherInfra(MasterOtherInfraEntity entity)
        {
            try { return objData.InsertMasterOtherInfra(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterOtherInfra", entity.OtherInfra); throw; }
        }

        public bool UpdateMasterOtherInfra(MasterOtherInfraEntity entity)
        {
            try { return objData.UpdateMasterOtherInfra(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterOtherInfra", entity.OtherInfraId.ToString()); throw; }
        }

        public bool SoftDeleteMasterOtherInfra(int OtherInfraId)
        {
            try { return objData.SoftDeleteMasterOtherInfra(OtherInfraId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterOtherInfra", OtherInfraId.ToString()); throw; }
        }

        #endregion

        #region OtherInfraOptions Methods

        public List<MasterOtherInfraOptionEntity> GetMasterOtherInfraOptions()
        {
            List<MasterOtherInfraOptionEntity> objList = new List<MasterOtherInfraOptionEntity>();
            try
            {
                DataTable dt = objData.GetMasterOtherInfraOptions();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterOtherInfraOptionEntity
                    {
                        OtherInfraId = row["OtherInfraId"] == DBNull.Value ? 0 : Convert.ToInt32(row["OtherInfraId"]),
                        OtherInfra = row["OtherInfra"] == DBNull.Value ? "" : row["OtherInfra"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterOtherInfraOptions"); throw; }
            return objList;
        }

        public bool InsertMasterOtherInfraOptions(MasterOtherInfraOptionEntity entity)
        {
            try { return objData.InsertMasterOtherInfraOptions(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterOtherInfraOptions", entity.OtherInfra); throw; }
        }

        public bool UpdateMasterOtherInfraOptions(MasterOtherInfraOptionEntity entity)
        {
            try { return objData.UpdateMasterOtherInfraOptions(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterOtherInfraOptions", entity.OtherInfraId.ToString()); throw; }
        }

        public bool SoftDeleteMasterOtherInfraOptions(int OtherInfraId)
        {
            try { return objData.SoftDeleteMasterOtherInfraOptions(OtherInfraId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterOtherInfraOptions", OtherInfraId.ToString()); throw; }
        }

        #endregion

        #region UserType Methods

        public List<MasterUserTypeEntity> GetMasterUserTypes()
        {
            List<MasterUserTypeEntity> objList = new List<MasterUserTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterUserTypes();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterUserTypeEntity
                        {
                            UserTypeID = row["UserTypeID"] == DBNull.Value ? 0 : Convert.ToInt32(row["UserTypeID"]),
                            UserType = row["UserType"] == DBNull.Value ? "" : row["UserType"].ToString(),
                            UserTypeCode = row["UserTypeCode"] == DBNull.Value ? null : row["UserTypeCode"].ToString(),
                            UserInitial = row["UserInitial"] == DBNull.Value ? null : row["UserInitial"].ToString(),
                            DashboardURL = row["DashboardURL"] == DBNull.Value ? null : row["DashboardURL"].ToString(),
                            IsAdmin = row["IsAdmin"] == DBNull.Value ? false : Convert.ToBoolean(row["IsAdmin"]),
                            IsMultipleLoginAllowed = row["IsMultipleLoginAllowed"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMultipleLoginAllowed"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                            DashboardURLReact = row["DashboardURLReact"] == DBNull.Value ? null : row["DashboardURLReact"].ToString(),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterUserTypes"); throw; }
            return objList;
        }

        public bool InsertMasterUserType(MasterUserTypeEntity entity)
        {
            try { return objData.InsertMasterUserType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterUserType", entity.UserType); throw; }
        }

        public bool UpdateMasterUserType(MasterUserTypeEntity entity)
        {
            try { return objData.UpdateMasterUserType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterUserType", entity.UserTypeID.ToString()); throw; }
        }

        public bool SoftDeleteMasterUserType(int UserTypeID)
        {
            try { return objData.SoftDeleteMasterUserType(UserTypeID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterUserType", UserTypeID.ToString()); throw; }
        }

        #endregion

        #region NSQFLevel Methods (BAL)

        public List<MasterNSQFLevelEntity> GetMasterNSQFLevels()
        {
            List<MasterNSQFLevelEntity> objList = new List<MasterNSQFLevelEntity>();
            try
            {
                DataTable dt = objData.GetMasterNSQFLevels();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterNSQFLevelEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            NSQFLEVEL = row["NSQFLEVEL"] == DBNull.Value ? "" : row["NSQFLEVEL"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterNSQFLevels"); throw; }
            return objList;
        }

        public int InsertMasterNSQFLevel(MasterNSQFLevelEntity entity)
        {
            try { return objData.InsertMasterNSQFLevel(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterNSQFLevel", entity.NSQFLEVEL); throw; }
        }

        public bool UpdateMasterNSQFLevel(MasterNSQFLevelEntity entity)
        {
            try { return objData.UpdateMasterNSQFLevel(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterNSQFLevel", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterNSQFLevel(int ID)
        {
            try { return objData.SoftDeleteMasterNSQFLevel(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterNSQFLevel", ID.ToString()); throw; }
        }

        #endregion

        #region ProjectConfiguration Methods

        public List<MasterProjectConfigurationEntity> GetMasterProjectConfigurations()
        {
            List<MasterProjectConfigurationEntity> objList = new List<MasterProjectConfigurationEntity>();
            try
            {
                DataTable dt = objData.GetMasterProjectConfigurations();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterProjectConfigurationEntity
                    {
                        SeqNo = row["SeqNo"] == DBNull.Value ? 0 : Convert.ToInt32(row["SeqNo"]),
                        RegionID = row["RegionID"] == DBNull.Value ? 0 : Convert.ToInt32(row["RegionID"]),
                        AppKey = row["AppKey"] == DBNull.Value ? "" : row["AppKey"].ToString(),
                        AppKeyDetails = row["AppKeyDetails"] == DBNull.Value ? "" : row["AppKeyDetails"].ToString(),
                        AppValue = row["AppValue"] == DBNull.Value ? null : row["AppValue"].ToString(),
                        ControlRequired = row["ControlRequired"] == DBNull.Value ? "" : row["ControlRequired"].ToString(),
                        ControlMaxValue = row["ControlMaxValue"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["ControlMaxValue"]),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        ModifiedDateTime = row["ModifiedDateTime"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["ModifiedDateTime"]),
                        ModifiedBy = row["ModifiedBy"] == DBNull.Value ? null : row["ModifiedBy"].ToString(),
                        ModifiedByIPAddress = row["ModifiedByIPAddress"] == DBNull.Value ? null : row["ModifiedByIPAddress"].ToString(),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterProjectConfigurations"); throw; }
            return objList;
        }

        public bool InsertMasterProjectConfiguration(MasterProjectConfigurationEntity entity)
        {
            try { return objData.InsertMasterProjectConfiguration(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterProjectConfiguration", entity.AppKey); throw; }
        }

        public bool UpdateMasterProjectConfiguration(MasterProjectConfigurationEntity entity)
        {
            try { return objData.UpdateMasterProjectConfiguration(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterProjectConfiguration", entity.SeqNo.ToString()); throw; }
        }

        public bool SoftDeleteMasterProjectConfiguration(int SeqNo)
        {
            try { return objData.SoftDeleteMasterProjectConfiguration(SeqNo); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterProjectConfiguration", SeqNo.ToString()); throw; }
        }

        #endregion

        #region ITISpecificationCategory Methods

        public List<MasterITISpecificationCategoryEntity> GetMasterITISpecificationCategories()
        {
            List<MasterITISpecificationCategoryEntity> objList = new List<MasterITISpecificationCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterITISpecificationCategories();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterITISpecificationCategoryEntity
                    {
                        ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                        CategoryName = row["CategoryName"] == DBNull.Value ? "" : row["CategoryName"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterITISpecificationCategories"); throw; }
            return objList;
        }

        public bool InsertMasterITISpecificationCategory(MasterITISpecificationCategoryEntity entity)
        {
            try { return objData.InsertMasterITISpecificationCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterITISpecificationCategory", entity.CategoryName); throw; }
        }

        public bool UpdateMasterITISpecificationCategory(MasterITISpecificationCategoryEntity entity)
        {
            try { return objData.UpdateMasterITISpecificationCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationCategory", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterITISpecificationCategory(int ID)
        {
            try { return objData.SoftDeleteMasterITISpecificationCategory(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationCategory", ID.ToString()); throw; }
        }

        #endregion

        #region ITISpecificationGroup Methods

        public List<MasterITISpecificationGroupEntity> GetMasterITISpecificationGroups()
        {
            List<MasterITISpecificationGroupEntity> objList = new List<MasterITISpecificationGroupEntity>();
            try
            {
                DataTable dt = objData.GetMasterITISpecificationGroups();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterITISpecificationGroupEntity
                    {
                        ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                        GroupName = row["GroupName"] == DBNull.Value ? "" : row["GroupName"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterITISpecificationGroups"); throw; }
            return objList;
        }

        public bool InsertMasterITISpecificationGroup(MasterITISpecificationGroupEntity entity)
        {
            try { return objData.InsertMasterITISpecificationGroup(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterITISpecificationGroup", entity.GroupName); throw; }
        }

        public bool UpdateMasterITISpecificationGroup(MasterITISpecificationGroupEntity entity)
        {
            try { return objData.UpdateMasterITISpecificationGroup(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationGroup", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterITISpecificationGroup(int ID)
        {
            try { return objData.SoftDeleteMasterITISpecificationGroup(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationGroup", ID.ToString()); throw; }
        }

        #endregion

        #region ITISpecificationItem Methods

        public List<MasterITISpecificationItemEntity> GetMasterITISpecificationItems()
        {
            List<MasterITISpecificationItemEntity> objList = new List<MasterITISpecificationItemEntity>();
            try
            {
                DataTable dt = objData.GetMasterITISpecificationItems();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterITISpecificationItemEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            NameofITem = row["NameofITem"] == DBNull.Value ? "" : row["NameofITem"].ToString(),
                            ItemCode = row["ItemCode"] == DBNull.Value ? null : row["ItemCode"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterITISpecificationItems"); throw; }
            return objList;
        }

        public bool InsertMasterITISpecificationItem(MasterITISpecificationItemEntity entity)
        {
            try { return objData.InsertMasterITISpecificationItem(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterITISpecificationItem", entity.NameofITem); throw; }
        }

        public bool UpdateMasterITISpecificationItem(MasterITISpecificationItemEntity entity)
        {
            try { return objData.UpdateMasterITISpecificationItem(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationItem", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterITISpecificationItem(int ID)
        {
            try { return objData.SoftDeleteMasterITISpecificationItem(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationItem", ID.ToString()); throw; }
        }

        #endregion

        #region ITISpecificationNameofItemAsperDGT Methods

        public List<MasterITISpecificationNameofItemAsperDGTEntity> GetMasterITISpecificationNameofItemAsperDGT()
        {
            List<MasterITISpecificationNameofItemAsperDGTEntity> objList = new List<MasterITISpecificationNameofItemAsperDGTEntity>();
            try
            {
                DataTable dt = objData.GetMasterITISpecificationNameofItemAsperDGT();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterITISpecificationNameofItemAsperDGTEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            ItemAsperDGT = row["ItemAsperDGT"] == DBNull.Value ? "" : row["ItemAsperDGT"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterITISpecificationNameofItemAsperDGT"); throw; }
            return objList;
        }

        public bool InsertMasterITISpecificationNameofItemAsperDGT(MasterITISpecificationNameofItemAsperDGTEntity entity)
        {
            try { return objData.InsertMasterITISpecificationNameofItemAsperDGT(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterITISpecificationNameofItemAsperDGT", entity.ItemAsperDGT); throw; }
        }

        public bool UpdateMasterITISpecificationNameofItemAsperDGT(MasterITISpecificationNameofItemAsperDGTEntity entity)
        {
            try { return objData.UpdateMasterITISpecificationNameofItemAsperDGT(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationNameofItemAsperDGT", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterITISpecificationNameofItemAsperDGT(int ID)
        {
            try { return objData.SoftDeleteMasterITISpecificationNameofItemAsperDGT(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationNameofItemAsperDGT", ID.ToString()); throw; }
        }

        #endregion

        #region MasterSubject Methods

        public List<MasterSubjectEntity> GetMasterSubjects()
        {
            List<MasterSubjectEntity> objList = new List<MasterSubjectEntity>();
            try
            {
                DataTable dt = objData.GetMasterSubjects();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterSubjectEntity
                        {
                            SubjectId = row["SubjectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SubjectId"]),
                            SubjectName = row["SubjectName"] == DBNull.Value ? "" : row["SubjectName"].ToString(),
                            SubjectCode = row["SubjectCode"] == DBNull.Value ? "" : row["SubjectCode"].ToString(),
                            SubjectType = row["SubjectType"] == DBNull.Value ? null : row["SubjectType"].ToString(),
                            SubjectTypeID = row["SubjectTypeID"] == DBNull.Value ? 0 : Convert.ToInt32(row["SubjectTypeID"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterSubjects"); throw; }
            return objList;
        }

        public bool InsertMasterSubject(MasterSubjectEntity entity)
        {
            try { return objData.InsertMasterSubject(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterSubject", entity.SubjectName); throw; }
        }

        public bool UpdateMasterSubject(MasterSubjectEntity entity)
        {
            try { return objData.UpdateMasterSubject(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterSubject", entity.SubjectId.ToString()); throw; }
        }

        public bool SoftDeleteMasterSubject(int SubjectId)
        {
            try { return objData.SoftDeleteMasterSubject(SubjectId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSubject", SubjectId.ToString()); throw; }
        }

        #endregion

        #region ItemAsperDVET Methods

        public List<MasterItemAsperDVETEntity> GetMasterItemAsperDVETs()
        {
            List<MasterItemAsperDVETEntity> objList = new List<MasterItemAsperDVETEntity>();
            try
            {
                DataTable dt = objData.GetMasterItemAsperDVETs();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterItemAsperDVETEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            ItemAsperDVET = row["ItemAsperDVET"] == DBNull.Value ? "" : row["ItemAsperDVET"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterItemAsperDVETs"); throw; }
            return objList;
        }

        public bool InsertMasterItemAsperDVET(MasterItemAsperDVETEntity entity)
        {
            try { return objData.InsertMasterItemAsperDVET(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterItemAsperDVET", entity.ItemAsperDVET); throw; }
        }

        public bool UpdateMasterItemAsperDVET(MasterItemAsperDVETEntity entity)
        {
            try { return objData.UpdateMasterItemAsperDVET(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterItemAsperDVET", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterItemAsperDVET(int ID)
        {
            try { return objData.SoftDeleteMasterItemAsperDVET(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterItemAsperDVET", ID.ToString()); throw; }
        }

        #endregion

        #region ITISpecificationSector Methods

        public List<MasterITISpecificationSectorEntity> GetMasterITISpecificationSectors()
        {
            List<MasterITISpecificationSectorEntity> objList = new List<MasterITISpecificationSectorEntity>();
            try
            {
                DataTable dt = objData.GetMasterITISpecificationSectors();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterITISpecificationSectorEntity
                    {
                        ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                        SectorName = row["SectorName"] == DBNull.Value ? "" : row["SectorName"].ToString(),
                        SpecificationDocument = row["SpecificationDocument"] == DBNull.Value ? null : row["SpecificationDocument"].ToString(),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterITISpecificationSectors"); throw; }
            return objList;
        }

        public bool InsertMasterITISpecificationSector(MasterITISpecificationSectorEntity entity)
        {
            try { return objData.InsertMasterITISpecificationSector(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterITISpecificationSector", entity.SectorName); throw; }
        }

        public bool UpdateMasterITISpecificationSector(MasterITISpecificationSectorEntity entity)
        {
            try { return objData.UpdateMasterITISpecificationSector(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationSector", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterITISpecificationSector(int ID)
        {
            try { return objData.SoftDeleteMasterITISpecificationSector(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationSector", ID.ToString()); throw; }
        }

        #endregion

        #region ITISpecificationTrade Methods

        public List<MasterITISpecificationTradeEntity> GetMasterITISpecificationTrades()
        {
            List<MasterITISpecificationTradeEntity> objList = new List<MasterITISpecificationTradeEntity>();
            try
            {
                DataTable dt = objData.GetMasterITISpecificationTrades();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterITISpecificationTradeEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            TradeName = row["TradeName"] == DBNull.Value ? "" : row["TradeName"].ToString(),
                            TradeCode = row["TradeCode"] == DBNull.Value ? null : row["TradeCode"].ToString(),
                            SpecificationDocument = row["SpecificationDocument"] == DBNull.Value ? null : row["SpecificationDocument"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterITISpecificationTrades"); throw; }
            return objList;
        }

        public bool InsertMasterITISpecificationTrade(MasterITISpecificationTradeEntity entity)
        {
            try { return objData.InsertMasterITISpecificationTrade(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterITISpecificationTrade", entity.TradeName); throw; }
        }

        public bool UpdateMasterITISpecificationTrade(MasterITISpecificationTradeEntity entity)
        {
            try { return objData.UpdateMasterITISpecificationTrade(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationTrade", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterITISpecificationTrade(int ID)
        {
            try { return objData.SoftDeleteMasterITISpecificationTrade(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationTrade", ID.ToString()); throw; }
        }

        #endregion

        #region ITISpecificationUsage Methods

        public List<MasterITISpecificationUsageEntity> GetMasterITISpecificationUsages()
        {
            List<MasterITISpecificationUsageEntity> objList = new List<MasterITISpecificationUsageEntity>();
            try
            {
                DataTable dt = objData.GetMasterITISpecificationUsages();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterITISpecificationUsageEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            Usage = row["Usage"] == DBNull.Value ? "" : row["Usage"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterITISpecificationUsages"); throw; }
            return objList;
        }

        public bool InsertMasterITISpecificationUsage(MasterITISpecificationUsageEntity entity)
        {
            try { return objData.InsertMasterITISpecificationUsage(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterITISpecificationUsage", entity.Usage); throw; }
        }

        public bool UpdateMasterITISpecificationUsage(MasterITISpecificationUsageEntity entity)
        {
            try { return objData.UpdateMasterITISpecificationUsage(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationUsage", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterITISpecificationUsage(int ID)
        {
            try { return objData.SoftDeleteMasterITISpecificationUsage(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationUsage", ID.ToString()); throw; }
        }

        #endregion

        #region ITISpecificationSpecificationAsperDGT Methods

        public List<MasterITISpecificationSpecificationAsperDGTEntity> GetMasterITISpecificationSpecificationAsperDGTs()
        {
            List<MasterITISpecificationSpecificationAsperDGTEntity> objList = new List<MasterITISpecificationSpecificationAsperDGTEntity>();
            try
            {
                DataTable dt = objData.GetMasterITISpecificationSpecificationAsperDGTs();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterITISpecificationSpecificationAsperDGTEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            SpecificationDGT = row["SpecificationDGT"] == DBNull.Value ? "" : row["SpecificationDGT"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterITISpecificationSpecificationAsperDGTs"); throw; }
            return objList;
        }

        public bool InsertMasterITISpecificationSpecificationAsperDGT(MasterITISpecificationSpecificationAsperDGTEntity entity)
        {
            try { return objData.InsertMasterITISpecificationSpecificationAsperDGT(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterITISpecificationSpecificationAsperDGT", entity.SpecificationDGT); throw; }
        }

        public bool UpdateMasterITISpecificationSpecificationAsperDGT(MasterITISpecificationSpecificationAsperDGTEntity entity)
        {
            try { return objData.UpdateMasterITISpecificationSpecificationAsperDGT(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationSpecificationAsperDGT", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterITISpecificationSpecificationAsperDGT(int ID)
        {
            try { return objData.SoftDeleteMasterITISpecificationSpecificationAsperDGT(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationSpecificationAsperDGT", ID.ToString()); throw; }
        }

        #endregion

        #region ITISpecificationSectorWise Methods (Business Layer)

        public List<MasterITISpecificationSectorWiseEntity> GetMasterITISpecificationSectorWise()
        {
            List<MasterITISpecificationSectorWiseEntity> objList = new List<MasterITISpecificationSectorWiseEntity>();
            try
            {
                DataTable dt = objData.GetMasterITISpecificationSectorWise();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterITISpecificationSectorWiseEntity
                    {
                        ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                        ItemID = row["ItemID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemID"]),
                        GroupID = row["GroupID"] == DBNull.Value ? 0 : Convert.ToInt32(row["GroupID"]),
                        SectorID = row["SectorID"] == DBNull.Value ? 0 : Convert.ToInt32(row["SectorID"]),
                        CategoryID = row["CategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CategoryID"]),
                        EstimatedPrice = row["EstimatedPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(row["EstimatedPrice"]),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        IsDocShow = row["IsDocShow"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDocShow"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterITISpecificationSectorWise"); throw; }
            return objList;
        }

        public bool InsertMasterITISpecificationSectorWise(MasterITISpecificationSectorWiseEntity entity)
        {
            try { return objData.InsertMasterITISpecificationSectorWise(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterITISpecificationSectorWise", entity.ItemID.ToString()); throw; }
        }

        public bool UpdateMasterITISpecificationSectorWise(MasterITISpecificationSectorWiseEntity entity)
        {
            try { return objData.UpdateMasterITISpecificationSectorWise(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationSectorWise", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterITISpecificationSectorWise(int ID)
        {
            try { return objData.SoftDeleteMasterITISpecificationSectorWise(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationSectorWise", ID.ToString()); throw; }
        }

        #endregion

        #region IgnoreWords Methods

        public List<MasterIgnoreWordEntity> GetMasterIgnoreWordsList()
        {
            List<MasterIgnoreWordEntity> lst = new List<MasterIgnoreWordEntity>();
            DataTable dt;
            try
            {
                dt = objData.GetMasterIgnoreWordsList();
                foreach (DataRow dr in dt.Rows)
                {
                    lst.Add(new MasterIgnoreWordEntity
                    {
                        ID = dr["ID"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ID"]),
                        WordsName = dr["WordsName"] == DBNull.Value ? "" : dr["WordsName"].ToString(),
                        IsActive = dr["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(dr["IsActive"]),
                        WordstoBeignored = dr["WordstoBeignored"] == DBNull.Value ? null : dr["WordstoBeignored"].ToString(),
                    });
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterIgnoreWordsList");
                throw ex;
            }
            return lst;
        }

        public bool InsertMasterIgnoreWord(MasterIgnoreWordEntity entity)
        {
            try { return objData.InsertMasterIgnoreWord(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterIgnoreWord", entity.WordsName); throw; }
        }

        public bool UpdateMasterIgnoreWord(MasterIgnoreWordEntity entity)
        {
            try { return objData.UpdateMasterIgnoreWord(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterIgnoreWord", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterIgnoreWord(int ID)
        {
            try { return objData.SoftDeleteMasterIgnoreWord(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterIgnoreWord", ID.ToString()); throw; }
        }

        #endregion

        #region MasterFinancialYear Methods

        public List<MasterFinancialYearEntity> GetMasterFinancialYears()
        {
            List<MasterFinancialYearEntity> objList = new List<MasterFinancialYearEntity>();
            try
            {
                DataTable dt = objData.GetMasterFinancialYears();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterFinancialYearEntity
                    {
                        FinancialYearID = row["FinancialYearID"] == DBNull.Value ? 0 : Convert.ToInt32(row["FinancialYearID"]),
                        FinancialYear = row["FinancialYear"] == DBNull.Value ? "" : row["FinancialYear"].ToString(),
                        StartDate = row["StartDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["StartDate"]),
                        EndDate = row["EndDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["EndDate"]),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        IsCurrentFY = row["IsCurrentFY"] == DBNull.Value ? false : Convert.ToBoolean(row["IsCurrentFY"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterFinancialYears"); throw; }
            return objList;
        }

        public bool InsertMasterFinancialYear(MasterFinancialYearEntity entity)
        {
            try { return objData.InsertMasterFinancialYear(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterFinancialYear", entity.FinancialYear); throw; }
        }

        public bool UpdateMasterFinancialYear(MasterFinancialYearEntity entity)
        {
            try { return objData.UpdateMasterFinancialYear(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterFinancialYear", entity.FinancialYearID.ToString()); throw; }
        }

        public bool SoftDeleteMasterFinancialYear(int FinancialYearID)
        {
            try { return objData.SoftDeleteMasterFinancialYear(FinancialYearID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterFinancialYear", FinancialYearID.ToString()); throw; }
        }

        public bool SetCurrentFinancialYear(int FinancialYearID)
        {
            try { return objData.SetCurrentFinancialYear(FinancialYearID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SetCurrentFinancialYear", FinancialYearID.ToString()); throw; }
        }

        #endregion

        #region User Methods

        public List<MasterUserEntity> GetMasterUsers()
        {
            List<MasterUserEntity> objList = new List<MasterUserEntity>();
            try
            {
                DataTable dt = objData.GetMasterUsers();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterUserEntity
                        {
                            UserID = row["UserID"] == DBNull.Value ? 0 : Convert.ToInt32(row["UserID"]),
                            UserTypeID = row["UserTypeID"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["UserTypeID"]),
                            UserLoginID = row["UserLoginID"] == DBNull.Value ? "" : row["UserLoginID"].ToString(),
                            UserPassword = row["UserPassword"] == DBNull.Value ? "" : row["UserPassword"].ToString(),
                            UserName = row["UserName"] == DBNull.Value ? "" : row["UserName"].ToString(),
                            UserMobileNo = row["UserMobileNo"] == DBNull.Value ? "" : row["UserMobileNo"].ToString(),
                            UserEmailID = row["UserEmailID"] == DBNull.Value ? "" : row["UserEmailID"].ToString(),
                            SecurityQuestionID = row["SecurityQuestionID"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["SecurityQuestionID"]),
                            SecurityQuestionAnswer = row["SecurityQuestionAnswer"] == DBNull.Value ? "" : row["SecurityQuestionAnswer"].ToString(),
                            LoggedInSessionID = row["LoggedInSessionID"] == DBNull.Value ? "" : row["LoggedInSessionID"].ToString(),
                            CurrentLoginDateTime = row["CurrentLoginDateTime"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["CurrentLoginDateTime"]),
                            LastLoginDateTime = row["LastLoginDateTime"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["LastLoginDateTime"]),
                            IsNewRegistration = row["IsNewRegistration"] == DBNull.Value ? false : Convert.ToBoolean(row["IsNewRegistration"]),
                            IsPasswordResetDone = row["IsPasswordResetDone"] == DBNull.Value ? false : Convert.ToBoolean(row["IsPasswordResetDone"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                            ModifiedDateTime = row["ModifiedDateTime"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["ModifiedDateTime"]),
                            ModifiedBy = row["ModifiedBy"] == DBNull.Value ? "" : row["ModifiedBy"].ToString(),
                            ModifiedByIPAddress = row["ModifiedByIPAddress"] == DBNull.Value ? "" : row["ModifiedByIPAddress"].ToString(),
                            IsAccountLock = row["IsAccountLock"] == DBNull.Value ? false : Convert.ToBoolean(row["IsAccountLock"]),
                            LoginAttempt = row["LoginAttempt"] == DBNull.Value ? 0 : Convert.ToInt32(row["LoginAttempt"]),
                            MsbsvetMtId = row["MsbsvetMtId"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["MsbsvetMtId"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterUsers"); throw; }
            return objList;
        }

        public bool InsertMasterUser(MasterUserEntity entity)
        {
            try { return objData.InsertMasterUser(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterUser", entity.UserName); throw; }
        }

        public bool UpdateMasterUser(MasterUserEntity entity)
        {
            try { return objData.UpdateMasterUser(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterUser", entity.UserID.ToString()); throw; }
        }

        public bool SoftDeleteMasterUser(int UserID)
        {
            try { return objData.SoftDeleteMasterUser(UserID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterUser", UserID.ToString()); throw; }
        }

        #endregion

        #region BatchType Methods

        public List<MasterBatchTypeEntity> GetMasterBatchTypes()
        {
            List<MasterBatchTypeEntity> objList = new List<MasterBatchTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterBatchTypes();
                foreach (DataRow row in dt.Rows)
                {
                    objList.Add(new MasterBatchTypeEntity
                    {
                        ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                        BatchName = row["BatchName"] == DBNull.Value ? "" : row["BatchName"].ToString(),
                        AcademicYearID = row["AcademicYearID"] == DBNull.Value ? 0 : Convert.ToInt32(row["AcademicYearID"]),
                        IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        IsCurrent = row["IsCurrent"] == DBNull.Value ? false : Convert.ToBoolean(row["IsCurrent"]),
                        IsForAdmission = row["IsForAdmission"] == DBNull.Value ? (bool?)null : Convert.ToBoolean(row["IsForAdmission"]),
                        IsForExamFee = row["IsForExamFee"] == DBNull.Value ? (bool?)null : Convert.ToBoolean(row["IsForExamFee"]),
                        IsForExam = row["IsForExam"] == DBNull.Value ? (bool?)null : Convert.ToBoolean(row["IsForExam"]),
                        IsForResult = row["IsForResult"] == DBNull.Value ? (bool?)null : Convert.ToBoolean(row["IsForResult"]),
                    });
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterBatchTypes"); throw; }
            return objList;
        }

        public bool InsertMasterBatchType(MasterBatchTypeEntity entity)
        {
            try { return objData.InsertMasterBatchType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterBatchType", entity.BatchName); throw; }
        }

        public bool UpdateMasterBatchType(MasterBatchTypeEntity entity)
        {
            try { return objData.UpdateMasterBatchType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterBatchType", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterBatchType(int ID)
        {
            try { return objData.SoftDeleteMasterBatchType(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBatchType", ID.ToString()); throw; }
        }

        #endregion

        #region BatchStatus Methods

        public List<MasterBatchStatusEntity> GetMasterBatchStatuses()
        {
            List<MasterBatchStatusEntity> objList = new List<MasterBatchStatusEntity>();
            try
            {
                DataTable dt = objData.GetMasterBatchStatuses();
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterBatchStatusEntity
                        {
                            BatchStatusID = row["BatchStatusID"] == DBNull.Value ? 0 : Convert.ToInt32(row["BatchStatusID"]),
                            BatchStatusName = row["BatchStatusName"] == DBNull.Value ? "" : row["BatchStatusName"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                            BatchStatusDiscription = row["BatchStatusDiscription"] == DBNull.Value ? null : row["BatchStatusDiscription"].ToString(),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterBatchStatuses"); throw; }
            return objList;
        }

        public bool InsertMasterBatchStatus(MasterBatchStatusEntity entity)
        {
            try { return objData.InsertMasterBatchStatus(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterBatchStatus", entity.BatchStatusName); throw; }
        }

        public bool UpdateMasterBatchStatus(MasterBatchStatusEntity entity)
        {
            try { return objData.UpdateMasterBatchStatus(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterBatchStatus", entity.BatchStatusID.ToString()); throw; }
        }

        public bool SoftDeleteMasterBatchStatus(int BatchStatusID)
        {
            try { return objData.SoftDeleteMasterBatchStatus(BatchStatusID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBatchStatus", BatchStatusID.ToString()); throw; }
        }

        #endregion

        #region ExamType Methods

        public List<MasterExamTypeEntity> GetMasterExamTypes()
        {
            List<MasterExamTypeEntity> objList = new List<MasterExamTypeEntity>();
            try
            {
                DataTable dt = objData.GetMasterExamTypes();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterExamTypeEntity
                        {
                            ExamTypeID = row["ExamTypeID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ExamTypeID"]),
                            ExamType = row["ExamType"] == DBNull.Value ? "" : row["ExamType"].ToString(),
                            Isactive = row["Isactive"] == DBNull.Value ? false : Convert.ToBoolean(row["Isactive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterExamTypes"); throw; }
            return objList;
        }

        public bool InsertMasterExamType(MasterExamTypeEntity entity)
        {
            try { return objData.InsertMasterExamType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterExamType", entity.ExamType); throw; }
        }

        public bool UpdateMasterExamType(MasterExamTypeEntity entity)
        {
            try { return objData.UpdateMasterExamType(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterExamType", entity.ExamTypeID.ToString()); throw; }
        }

        public bool SoftDeleteMasterExamType(int ExamTypeID)
        {
            try { return objData.SoftDeleteMasterExamType(ExamTypeID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterExamType", ExamTypeID.ToString()); throw; }
        }

        #endregion

        #region Religion Methods

        public List<MasterReligionEntity> GetMasterReligions()
        {
            List<MasterReligionEntity> objList = new List<MasterReligionEntity>();
            try
            {
                DataTable dt = objData.GetMasterReligions();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterReligionEntity
                        {
                            ReligionID = row["ReligionID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ReligionID"]),
                            Religion = row["Religion"] == DBNull.Value ? "" : row["Religion"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterReligions"); throw; }
            return objList;
        }

        public bool InsertMasterReligion(MasterReligionEntity entity)
        {
            try { return objData.InsertMasterReligion(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterReligion", entity.Religion); throw; }
        }

        public bool UpdateMasterReligion(MasterReligionEntity entity)
        {
            try { return objData.UpdateMasterReligion(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterReligion", entity.ReligionID.ToString()); throw; }
        }

        public bool SoftDeleteMasterReligion(int ReligionID)
        {
            try { return objData.SoftDeleteMasterReligion(ReligionID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterReligion", ReligionID.ToString()); throw; }
        }

        #endregion

        #region SuccessStories Methods

        public List<MasterSuccessStoriesEntity> GetMasterSuccessStories()
        {
            List<MasterSuccessStoriesEntity> objList = new List<MasterSuccessStoriesEntity>();
            try
            {
                DataTable dt = objData.GetMasterSuccessStories();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterSuccessStoriesEntity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            FirstName = row["FirstName"] == DBNull.Value ? "" : row["FirstName"].ToString(),
                            MiddleName = row["MiddleName"] == DBNull.Value ? "" : row["MiddleName"].ToString(),
                            LastName = row["LastName"] == DBNull.Value ? "" : row["LastName"].ToString(),
                            CandidateProfileID = row["CandidateProfileID"] == DBNull.Value ? "" : row["CandidateProfileID"].ToString(),
                            PhotoPath = row["PhotoPath"] == DBNull.Value ? "" : row["PhotoPath"].ToString(),
                            CourseID = row["CourseID"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["CourseID"]),
                            InstituteID = row["InstituteID"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["InstituteID"]),
                            PassingYearID = row["PassingYearID"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["PassingYearID"]),
                            PresentDesignation = row["PresentDesignation"] == DBNull.Value ? "" : row["PresentDesignation"].ToString(),
                            PresentOrganization = row["PresentOrganization"] == DBNull.Value ? "" : row["PresentOrganization"].ToString(),
                            SelectionYearID = row["SelectionYearID"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["SelectionYearID"]),
                            SelectionYear = row["SelectionYear"] == DBNull.Value ? "" : row["SelectionYear"].ToString(),

                            // ── FIXED: was Convert.ToBoolean(row["..."]) ──
                            IsPublished = ToBool(row["IsPublished"]),
                            IsActive = ToBool(row["IsActive"]),
                            IsProfile = ToBool(row["IsProfile"]),

                            CreatedDateTime = row["CreatedDateTime"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["CreatedDateTime"]),
                            CreatedBy = row["CreatedBy"] == DBNull.Value ? "" : row["CreatedBy"].ToString(),
                            CreatedByIPAddress = row["CreatedByIPAddress"] == DBNull.Value ? "" : row["CreatedByIPAddress"].ToString(),
                            ModifiedDateTime = row["ModifiedDateTime"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["ModifiedDateTime"]),
                            ModifiedBy = row["ModifiedBy"] == DBNull.Value ? "" : row["ModifiedBy"].ToString(),
                            ModifiedByIPAddress = row["ModifiedByIPAddress"] == DBNull.Value ? "" : row["ModifiedByIPAddress"].ToString(),
                            DocumentPath = row["DocumentPath"] == DBNull.Value ? "" : row["DocumentPath"].ToString(),
                            CandidateMobileNo = row["CandidateMobileNo"] == DBNull.Value ? "" : row["CandidateMobileNo"].ToString(),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterSuccessStories"); throw; }
            return objList;
        }


        private static bool ToBool(object val)
        {
            if (val == null || val == DBNull.Value) return false;
            if (val is bool b) return b;

            var s = val.ToString().Trim();
            if (string.IsNullOrEmpty(s)) return false;
            if (s == "1") return true;
            if (s == "0") return false;

            return bool.TryParse(s, out var parsed) && parsed;
        }

        public int InsertMasterSuccessStory(MasterSuccessStoriesEntity entity)
        {
            try { return objData.InsertMasterSuccessStory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterSuccessStory", entity.CandidateProfileID); throw; }
        }

        public bool UpdateMasterSuccessStory(MasterSuccessStoriesEntity entity)
        {
            try { return objData.UpdateMasterSuccessStory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterSuccessStory", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterSuccessStory(int ID)
        {
            try { return objData.SoftDeleteMasterSuccessStory(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSuccessStory", ID.ToString()); throw; }
        }

        #endregion

        #region ITISpecificationItemV2 Methods

        public List<MasterITISpecificationItemV2Entity> GetMasterITISpecificationItemsV2()
        {
            List<MasterITISpecificationItemV2Entity> objList = new List<MasterITISpecificationItemV2Entity>();
            try
            {
                DataTable dt = objData.GetMasterITISpecificationItemsV2();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterITISpecificationItemV2Entity
                        {
                            ID = row["ID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ID"]),
                            NameofITem = row["NameofITem"] == DBNull.Value ? "" : row["NameofITem"].ToString(),
                            ItemCode = row["ItemCode"] == DBNull.Value ? "" : row["ItemCode"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterITISpecificationItemsV2"); throw; }
            return objList;
        }

        public bool InsertMasterITISpecificationItemV2(MasterITISpecificationItemV2Entity entity)
        {
            try { return objData.InsertMasterITISpecificationItemV2(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterITISpecificationItemV2", entity.NameofITem); throw; }
        }

        public bool UpdateMasterITISpecificationItemV2(MasterITISpecificationItemV2Entity entity)
        {
            try { return objData.UpdateMasterITISpecificationItemV2(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationItemV2", entity.ID.ToString()); throw; }
        }

        public bool SoftDeleteMasterITISpecificationItemV2(int ID)
        {
            try { return objData.SoftDeleteMasterITISpecificationItemV2(ID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationItemV2", ID.ToString()); throw; }
        }

        #endregion

        #region InstituteCategory Methods

        public List<MasterInstituteCategoryEntity> GetMasterInstituteCategories()
        {
            List<MasterInstituteCategoryEntity> objList = new List<MasterInstituteCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterInstituteCategories();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterInstituteCategoryEntity
                        {
                            CategoryID = row["CategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CategoryID"]),
                            Category = row["Category"] == DBNull.Value ? "" : row["Category"].ToString(),
                            CategoryCode = row["CategoryCode"] == DBNull.Value ? "" : row["CategoryCode"].ToString(),
                            SeqNo = row["SeqNo"] == DBNull.Value ? 0 : Convert.ToInt32(row["SeqNo"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterInstituteCategories"); throw; }
            return objList;
        }

        public bool InsertMasterInstituteCategory(MasterInstituteCategoryEntity entity)
        {
            try { return objData.InsertMasterInstituteCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterInstituteCategory", entity.Category); throw; }
        }

        public bool UpdateMasterInstituteCategory(MasterInstituteCategoryEntity entity)
        {
            try { return objData.UpdateMasterInstituteCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterInstituteCategory", entity.CategoryID.ToString()); throw; }
        }

        public bool SoftDeleteMasterInstituteCategory(int CategoryID)
        {
            try { return objData.SoftDeleteMasterInstituteCategory(CategoryID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterInstituteCategory", CategoryID.ToString()); throw; }
        }

        #endregion

        #region InstituteOwnership Methods

        public List<MasterInstituteOwnershipEntity> GetMasterInstituteOwnerships()
        {
            List<MasterInstituteOwnershipEntity> objList = new List<MasterInstituteOwnershipEntity>();
            try
            {
                DataTable dt = objData.GetMasterInstituteOwnerships();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterInstituteOwnershipEntity
                        {
                            OwnershipID = row["OwnershipID"] == DBNull.Value ? 0 : Convert.ToInt32(row["OwnershipID"]),
                            OwnershipName = row["OwnershipName"] == DBNull.Value ? "" : row["OwnershipName"].ToString(),
                            OwnershipCode = row["OwnershipCode"] == DBNull.Value ? "" : row["OwnershipCode"].ToString(),
                            SeqNo = row["SeqNo"] == DBNull.Value ? 0 : Convert.ToInt32(row["SeqNo"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterInstituteOwnerships"); throw; }
            return objList;
        }

        public int GetNextSeqNoInstituteOwnership()
        {
            try { return objData.GetNextSeqNoInstituteOwnership(); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetNextSeqNoInstituteOwnership"); throw; }
        }

        public bool InsertMasterInstituteOwnership(MasterInstituteOwnershipEntity entity)
        {
            try { return objData.InsertMasterInstituteOwnership(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterInstituteOwnership", entity.OwnershipName); throw; }
        }

        public bool UpdateMasterInstituteOwnership(MasterInstituteOwnershipEntity entity)
        {
            try { return objData.UpdateMasterInstituteOwnership(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterInstituteOwnership", entity.OwnershipID.ToString()); throw; }
        }

        public bool SoftDeleteMasterInstituteOwnership(int OwnershipID)
        {
            try { return objData.SoftDeleteMasterInstituteOwnership(OwnershipID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterInstituteOwnership", OwnershipID.ToString()); throw; }
        }

        #endregion

        #region InfraCategory Methods

        public List<MasterInfraCategoryEntity> GetMasterInfraCategories()
        {
            List<MasterInfraCategoryEntity> objList = new List<MasterInfraCategoryEntity>();
            try
            {
                DataTable dt = objData.GetMasterInfraCategories();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterInfraCategoryEntity
                        {
                            InfraCategoryID = row["InfraCategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["InfraCategoryID"]),
                            InfraCategory = row["InfraCategory"] == DBNull.Value ? "" : row["InfraCategory"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterInfraCategories"); throw; }
            return objList;
        }

        public bool InsertMasterInfraCategory(MasterInfraCategoryEntity entity)
        {
            try { return objData.InsertMasterInfraCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterInfraCategory", entity.InfraCategory); throw; }
        }

        public bool UpdateMasterInfraCategory(MasterInfraCategoryEntity entity)
        {
            try { return objData.UpdateMasterInfraCategory(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterInfraCategory", entity.InfraCategoryID.ToString()); throw; }
        }

        public bool SoftDeleteMasterInfraCategory(int InfraCategoryID)
        {
            try { return objData.SoftDeleteMasterInfraCategory(InfraCategoryID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterInfraCategory", InfraCategoryID.ToString()); throw; }
        }

        #endregion

        #region InfraItem Methods

        public List<MasterInfraItemEntity> GetMasterInfraItems()
        {
            List<MasterInfraItemEntity> objList = new List<MasterInfraItemEntity>();
            try
            {
                DataTable dt = objData.GetMasterInfraItems();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterInfraItemEntity
                        {
                            InfraItemID = row["InfraItemID"] == DBNull.Value ? 0 : Convert.ToInt32(row["InfraItemID"]),
                            InfraItem = row["InfraItem"] == DBNull.Value ? "" : row["InfraItem"].ToString(),
                            InfraCategoryID = row["InfraCategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(row["InfraCategoryID"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterInfraItems"); throw; }
            return objList;
        }

        public bool InsertMasterInfraItem(MasterInfraItemEntity entity)
        {
            try { return objData.InsertMasterInfraItem(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterInfraItem", entity.InfraItem); throw; }
        }

        public bool UpdateMasterInfraItem(MasterInfraItemEntity entity)
        {
            try { return objData.UpdateMasterInfraItem(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterInfraItem", entity.InfraItemID.ToString()); throw; }
        }

        public bool SoftDeleteMasterInfraItem(int InfraItemID)
        {
            try { return objData.SoftDeleteMasterInfraItem(InfraItemID); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterInfraItem", InfraItemID.ToString()); throw; }
        }

        #endregion

        #region TrainingEquipmentList Methods

        public List<MasterTrainingEquipmentListEntity> GetMasterTrainingEquipmentList()
        {
            List<MasterTrainingEquipmentListEntity> objList = new List<MasterTrainingEquipmentListEntity>();
            try
            {
                DataTable dt = objData.GetMasterTrainingEquipmentList();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterTrainingEquipmentListEntity
                        {
                            EquipmentId = row["EquipmentId"] == DBNull.Value ? 0 : Convert.ToInt32(row["EquipmentId"]),
                            CourseID = row["CourseID"] == DBNull.Value ? 0 : Convert.ToInt32(row["CourseID"]),
                            ItemID = row["ItemID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemID"]),
                            EquipmentCategoryId = row["EquipmentCategoryId"] == DBNull.Value ? 0 : Convert.ToInt32(row["EquipmentCategoryId"]),
                            UtilizationRemarksID = row["UtilizationRemarksID"] == DBNull.Value ? 0 : Convert.ToInt32(row["UtilizationRemarksID"]),
                            IsDsrItem = row["IsDsrItem"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDsrItem"]),
                            IsMouItem = row["IsMouItem"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMouItem"]),
                            IsMandatory = row["IsMandatory"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMandatory"]),
                            IsAlliedCourseItem = row["IsAlliedCourseItem"] == DBNull.Value ? false : Convert.ToBoolean(row["IsAlliedCourseItem"]),
                            RequiredPerUnit = row["RequiredPerUnit"] == DBNull.Value ? 0 : Convert.ToInt32(row["RequiredPerUnit"]),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterTrainingEquipmentList"); throw; }
            return objList;
        }

        public bool InsertMasterTrainingEquipmentList(MasterTrainingEquipmentListEntity entity)
        {
            try { return objData.InsertMasterTrainingEquipmentList(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterTrainingEquipmentList", entity.EquipmentId.ToString()); throw; }
        }

        public bool UpdateMasterTrainingEquipmentList(MasterTrainingEquipmentListEntity entity)
        {
            try { return objData.UpdateMasterTrainingEquipmentList(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterTrainingEquipmentList", entity.EquipmentId.ToString()); throw; }
        }

        public bool SoftDeleteMasterTrainingEquipmentList(int EquipmentId)
        {
            try { return objData.SoftDeleteMasterTrainingEquipmentList(EquipmentId); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTrainingEquipmentList", EquipmentId.ToString()); throw; }
        }

        #endregion

        #region OBWCCourse Methods

        public List<MasterOBWCCourseEntity> GetMasterOBWCCourses()
        {
            List<MasterOBWCCourseEntity> objList = new List<MasterOBWCCourseEntity>();
            try
            {
                DataTable dt = objData.GetMasterOBWCCourses();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterOBWCCourseEntity
                        {
                            Id = row["Id"] == DBNull.Value ? 0 : Convert.ToInt32(row["Id"]),
                            MBOCWPortalName = row["MBOCWPortalName"] == DBNull.Value ? "" : row["MBOCWPortalName"].ToString(),
                            CourseCode = row["CourseCode"] == DBNull.Value ? "" : row["CourseCode"].ToString(),
                            CourseName = row["CourseName"] == DBNull.Value ? "" : row["CourseName"].ToString(),
                            DurationinHours = row["DurationinHours"] == DBNull.Value ? "" : row["DurationinHours"].ToString(),
                            Sector = row["Sector"] == DBNull.Value ? "" : row["Sector"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetMasterOBWCCourses"); throw; }
            return objList;
        }

        public bool InsertMasterOBWCCourse(MasterOBWCCourseEntity entity)
        {
            try { return objData.InsertMasterOBWCCourse(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertMasterOBWCCourse", entity.CourseCode); throw; }
        }

        public bool UpdateMasterOBWCCourse(MasterOBWCCourseEntity entity)
        {
            try { return objData.UpdateMasterOBWCCourse(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateMasterOBWCCourse", entity.Id.ToString()); throw; }
        }

        public bool SoftDeleteMasterOBWCCourse(int Id)
        {
            try { return objData.SoftDeleteMasterOBWCCourse(Id); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteMasterOBWCCourse", Id.ToString()); throw; }
        }

        #endregion

        #region OBWCInstitute Methods

        public List<MasterOBWCInstituteEntity> GetAllOBWCInstitutes()
        {
            List<MasterOBWCInstituteEntity> objList = new List<MasterOBWCInstituteEntity>();
            try
            {
                DataTable dt = objData.GetAllOBWCInstitutes();
                if (dt != null)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        objList.Add(new MasterOBWCInstituteEntity
                        {
                            Id = row["Id"] == DBNull.Value ? 0 : Convert.ToInt32(row["Id"]),
                            NameasperBOCWPortal = row["NameasperBOCWPortal"] == DBNull.Value ? "" : row["NameasperBOCWPortal"].ToString(),
                            InstituteCode = row["InstituteCode"] == DBNull.Value ? "" : row["InstituteCode"].ToString(),
                            TrainingPartner = row["TrainingPartner"] == DBNull.Value ? "" : row["TrainingPartner"].ToString(),
                            Address = row["Address"] == DBNull.Value ? "" : row["Address"].ToString(),
                            CityVillage = row["CityVillage"] == DBNull.Value ? "" : row["CityVillage"].ToString(),
                            PinCode = row["PinCode"] == DBNull.Value ? "" : row["PinCode"].ToString(),
                            Taluka = row["Taluka"] == DBNull.Value ? "" : row["Taluka"].ToString(),
                            District = row["District"] == DBNull.Value ? "" : row["District"].ToString(),
                            Title = row["Title"] == DBNull.Value ? "" : row["Title"].ToString(),
                            FirstName = row["FirstName"] == DBNull.Value ? "" : row["FirstName"].ToString(),
                            MiddleName = row["MiddleName"] == DBNull.Value ? "" : row["MiddleName"].ToString(),
                            LastName = row["LastName"] == DBNull.Value ? "" : row["LastName"].ToString(),
                            PrimaryMobileNumber = row["PrimaryMobileNumber"] == DBNull.Value ? "" : row["PrimaryMobileNumber"].ToString(),
                            AlternativeMobileNumber = row["AlternativeMobileNumber"] == DBNull.Value ? "" : row["AlternativeMobileNumber"].ToString(),
                            EMailID = row["EMailID"] == DBNull.Value ? "" : row["EMailID"].ToString(),
                            IsActive = row["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(row["IsActive"]),
                        });
                    }
                }
            }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "GetAllOBWCInstitutes"); throw; }
            return objList;
        }

        public bool InsertOBWCInstitute(MasterOBWCInstituteEntity entity)
        {
            try { return objData.InsertOBWCInstitute(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "InsertOBWCInstitute", entity.InstituteCode); throw; }
        }

        public bool UpdateOBWCInstitute(MasterOBWCInstituteEntity entity)
        {
            try { return objData.UpdateOBWCInstitute(entity); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "UpdateOBWCInstitute", entity.Id.ToString()); throw; }
        }

        public bool SoftDeleteOBWCInstitute(int Id)
        {
            try { return objData.SoftDeleteOBWCInstitute(Id); }
            catch (Exception ex) { CommonHelper.SaveException(ex.Message, "SoftDeleteOBWCInstitute", Id.ToString()); throw; }
        }

        #endregion


    }


}