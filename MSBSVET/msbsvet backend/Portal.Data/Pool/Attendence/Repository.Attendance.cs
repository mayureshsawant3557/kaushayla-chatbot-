using FirebaseAdmin.Messaging;
using Microsoft.Exchange.WebServices.Data;
using Newtonsoft.Json;
using Portal.Entities.Attendance;
using Portal.Entities.AttendanceDbResponse;
using Portal.Entities.Attendence;
using Portal.Entities.FirebaseNotification;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {

        public DataTable GetAttendanceCalendar(Dictionary<string, object> parameters)
        {
            return _dbAccess.GetDataTable("Attendance_GetCalendar", parameters);
        }

        public DataTable GetWeeklyStatistics(Dictionary<string, object> parameters)
        {
            return _dbAccess.GetDataTable("Attendance_GetWeeklyStatistics", parameters);
        }

        public DbResponse<object> GetMonthlyStatistics(long userId, int? year, int? month)
        {
            try
            {
                var param = new Dictionary<string, object>
                {
                    {"@UserId", userId},
                    {"@Year", year ?? DateTime.Now.Year},
                    {"@Month", month ?? DateTime.Now.Month}
                };

                DataTable dt = _dbAccess.GetDataTable("Attendance_GetMonthlyStatistics", param);

                if (dt == null || dt.Rows.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No attendance found."
                    };
                }

                return new DbResponse<object>
                {
                    Result = "Y",
                    Message = "Today's attendance fetched successfully.",
                    Data = DataTableToList(dt) // or map to an object if it's a single row
                };
            }
            catch (Exception ex)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = $"An error occurred while fetching today's attendance. {ex.Message}"
                };
            }
            
        }

        public DbResponse<FaceEncodingDto> getUserFaceEncoding(long userId)
        {
            try
            {
                var param = new Dictionary<string, object>
                {
                    ["@UserId"] = userId
                };

                DataTable dt = _dbAccess.GetDataTable("Attendance_GetUserFaceEncoding", param );

                if (dt == null || dt.Rows.Count == 0)
                {
                    return new DbResponse<FaceEncodingDto>
                    {
                        Result = "N",
                        Message = "No face enrollment found."
                    };
                }

                var row = dt.Rows[0];

                bool faceEnrolled = row["FaceEnrolled"] != DBNull.Value && Convert.ToBoolean(row["FaceEnrolled"]);
                string faceEncoding = row["FaceEncodingData"] == DBNull.Value
                        ? null
                        : row["FaceEncodingData"]?.ToString();
                string faceImageUrl = row["FaceImageUrl"] == DBNull.Value
                        ? null
                        : row["FaceImageUrl"]?.ToString();
                DateTime? enrollmentDate = row["EnrollmentDate"] == DBNull.Value
                        ? (DateTime?)null
                        : Convert.ToDateTime(row["EnrollmentDate"]);

                // Face is not properly enrolled
                if (!faceEnrolled || string.IsNullOrEmpty(faceEncoding))
                {
                    return new DbResponse<FaceEncodingDto>
                    {
                        Result = "N",
                        Message = !faceEnrolled
                            ? "Face is not enrolled."
                            : "Face encoding not found."
                    };
                }

                var data = new FaceEncodingDto
                {
                    FaceEnrolled = faceEnrolled,
                    FaceEncodingData = faceEncoding,
                    FaceImageUrl = faceImageUrl,
                    EnrollmentDate = enrollmentDate
                };

                return new DbResponse<FaceEncodingDto>
                {
                    Result = "Y",
                    Message = "Face encoding fetched successfully.",
                    Data = data
                };
            }
            catch (Exception ex)
            {
                return new DbResponse<FaceEncodingDto>
                {
                    Result = "N",
                    Message = $"An error occurred while fetching face encoding. {ex.Message}"
                };
            }
        }

        public DbResponse<object> PunchIn(long userId, PunchInRequest request, string ipAddress, string filePath)
        {
            try
            {
                var param = new Dictionary<string, object>
                {
                    ["@UserId"] = userId,
                    ["@Latitude"] = request.Latitude,
                    ["@Longitude"] = request.Longitude,
                    ["@DailyPlan"] = request.DailyPlan ?? "",
                    ["@Remark"] = request.Remark ?? "",
                    ["@SelfieUrl"] = filePath ?? "", // Not storing selfie file
                    ["@IPAddress"] = ipAddress ?? "",
                    ["@FaceVerified"] = 1,
                    ["@AttendanceDate"] = request.AttendanceDate ?? (object)DBNull.Value,
                    ["@PunchInT"] = request.PunchInT ?? (object)DBNull.Value
                };

                DataTable dt = _dbAccess.GetDataTable("Attendance_PunchIn", param);
                if (dt == null || dt.Rows.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No response received from punch-in."
                    };
                }

                var row = dt.Rows[0];

                // -----------------------------------------
                // Handle stored procedure failure
                // -----------------------------------------

                if (row.Table.Columns.Contains("Success") && row["Success"] != DBNull.Value && !Convert.ToBoolean(row["Success"]))
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = row.Table.Columns.Contains("Message") && row["Message"] != DBNull.Value
                                    ? row["Message"].ToString()
                                    : "Punch-in failed."
                    };
                }

                return new DbResponse<object>
                {
                    Result = "Y",
                    Message = "Punch-in successful.",
                    Data = DataTableToList(dt)
                }; 
            }
            catch (Exception ex)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = $"An error occurred during punch-in. {ex.Message}"
                };
            }
        }

        public DbResponse<object> PunchOut(long userId, PunchOutRequest request, string ipAddress, string filePath)
        {
            try
            {
                var param = new Dictionary<string, object>
                {
                    ["@UserId"] = userId,
                    ["@Latitude"] = request.Latitude,
                    ["@Longitude"] = request.Longitude,
                    ["@WorkSummary"] = request.WorkSummary ?? "",
                    ["@Remark"] = request.Remark ?? "",
                    ["@SelfieUrl"] = filePath ?? "", // Not storing selfie file
                    ["@IPAddress"] = ipAddress ?? "",
                    ["@FaceVerified"] = 1,
                    ["@AttendanceDate"] = request.AttendanceDate ?? (object)DBNull.Value,
                    ["@PunchOutT"] = request.PunchOutT ?? (object)DBNull.Value
                };

                DataTable dt = _dbAccess.GetDataTable("Attendance_PunchOut", param);
                if (dt == null || dt.Rows.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No response received from punch-out."
                    };
                }

                var row = dt.Rows[0];

                // -----------------------------------------
                // Handle stored procedure failure
                // -----------------------------------------

                if (row.Table.Columns.Contains("Success") && row["Success"] != DBNull.Value && !Convert.ToBoolean(row["Success"]))
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = row.Table.Columns.Contains("Message") && row["Message"] != DBNull.Value
                                    ? row["Message"].ToString()
                                    : "Punch-Out failed."
                    };
                }

                return new DbResponse<object>
                {
                    Result = "Y",
                    Message = "Punch-Out successful.",
                    Data = DataTableToList(dt)
                };
            }
            catch (Exception ex)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = $"An error occurred during punch-Out. {ex.Message}"
                };
            }
        }

        public DbResponse<object> GetTodayAttendance(long userId)
        {
            try
            {
                var param = new Dictionary<string, object> { { "@UserId", userId } };
                var dt = _dbAccess.GetDataTable("Attendance_GetTodayAttendance", param);

                if (dt == null || dt.Rows.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No attendance found."
                    };
                }

                return new DbResponse<object>
                {
                    Result = "Y",
                    Message = "Today's attendance fetched successfully.",
                    Data = DataTableToList(dt) // or map to an object if it's a single row
                };
            }
            catch (Exception ex)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = $"An error occurred while fetching today's attendance. {ex.Message}"
                };
            }
        }

        public DataTable GetAttendanceHistory(Dictionary<string, object> parameters)
        {
            return _dbAccess.GetDataTable("Attendance_GetAttendanceHistory", parameters);
        }

        public DataTable GetUserInstituteLocation(long userId)
        {
            var param = new Dictionary<string, object> { { "@UserId", userId } };
            return _dbAccess.GetDataTable("Attendance_GetUserInstituteLocation", param);
        }

        public DataTable ValidateLocation(Dictionary<string, object> parameters)
        {
            return _dbAccess.GetDataTable("Attendance_ValidateLocation", parameters);
        }
        public DbResponse<object> EnrollFace(long userId, string faceImageUrl, string faceEncoding, string note = "")
        {
            try
            {
                var parameters = new Dictionary<string, object>
                {
                    ["@UserId"] = userId,
                    ["@FaceImageUrl"] = faceImageUrl ?? "",
                    ["@FaceEncoding"] = faceEncoding ?? "",
                    ["@Note"] = note ?? ""
                };

                var dt = _dbAccess.GetDataTable("Attendance_EnrollFaceWithEncoding", parameters);

                if (dt == null || dt.Rows.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No response received from face enrollment."
                    };
                }

                var row = dt.Rows[0];

                bool success = row["Success"] != DBNull.Value && Convert.ToBoolean(row["Success"]);
                string message = row["Message"]?.ToString() ?? "Unknown response from face enrollment.";

                // Stored procedure returned failure
                if (!success)
                {
                    string? errorCode = row.Table.Columns.Contains("ErrorCode") && row["ErrorCode"] != DBNull.Value
                                            ? row["ErrorCode"].ToString()
                                            : "ENROLLMENT_FAILED";
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = message,
                        //Data = new
                        //{

                        //}
                    };
                }

                // Stored procedure returned success
                var enrollment = new
                {
                    EnrollmentId = row.Table.Columns.Contains("EnrollmentId") && row["EnrollmentId"] != DBNull.Value
                        ? Convert.ToInt64(row["EnrollmentId"])
                        : 0,
                    EnrollmentDate = row.Table.Columns.Contains("EnrollmentDate")
                        ? row["EnrollmentDate"]?.ToString() ?? ""
                        : "",
                    FaceImageUrl = row.Table.Columns.Contains("FaceImageUrl")
                        ? row["FaceImageUrl"]?.ToString() ?? ""
                        : ""
                };

                return new DbResponse<object>
                {
                    Result = "Y",
                    Message = message,
                    Data = enrollment
                };
            }
            catch (Exception ex)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = $"An error occurred during face enrollment. {ex.Message}"
                };
            }
        }
        public DbResponse<object> ReEnrollFace(long userId, string faceImageUrl, string faceEncoding, string note = "")
        {
            try
            {
                var parameters = new Dictionary<string, object>
                {
                    ["@UserId"] = userId,
                    ["@FaceImageUrl"] = faceImageUrl,
                    ["@FaceEncoding"] = faceEncoding,
                    ["@Note"] = note ?? ""
                };

                DataTable dt = _dbAccess.GetDataTable("Attendance_ReEnrollFaceWithEncoding", parameters);
                if (dt == null || dt.Rows.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No response received from face re-enrollment."
                    };
                }

                var row = dt.Rows[0];

                bool success = row["Success"] != DBNull.Value && Convert.ToBoolean(row["Success"]);
                string message = row["Message"]?.ToString() ?? "Unknown response from face re-enrollment.";

                // Re-enrollment failed
                if (!success)
                {
                    string? errorCode = row.Table.Columns.Contains("ErrorCode") && row["ErrorCode"] != DBNull.Value
                            ? row["ErrorCode"].ToString()
                            : "REENROLLMENT_FAILED";

                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = message
                    };
                }

                // Re-enrollment successful
                var data = new 
                {
                    EnrollmentId = row.Table.Columns.Contains("EnrollmentId") && row["EnrollmentId"] != DBNull.Value
                            ? Convert.ToInt64(row["EnrollmentId"])
                            : 0,
                    EnrollmentDate = row.Table.Columns.Contains("EnrollmentDate") && row["EnrollmentDate"] != DBNull.Value
                            ? row["EnrollmentDate"].ToString()
                            : "",
                    FaceImageUrl = row.Table.Columns.Contains("FaceImageUrl") && row["FaceImageUrl"] != DBNull.Value
                            ? row["FaceImageUrl"].ToString()
                            : ""
                };

                return new DbResponse<object>
                {
                    Result = "Y",
                    Message = message,
                    Data = data
                };
            }
            catch (Exception ex)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = $"An error occurred during face re-enrollment. {ex.Message}"
                };
            }
        }

        public DataTable GetFaceEnrollmentStatus(long userId)
        {
            var param = new Dictionary<string, object> { { "@UserId", userId } };
            return _dbAccess.GetDataTable("Attendance_GetFaceEnrollmentStatus", param);
        }

        public void DeleteFaceEnrollment(long userId)
        {
            var param = new Dictionary<string, object> { { "@UserId", userId } };
            _dbAccess.ExecuteNonQuery("Attendance_DeleteFaceEnrollment", param);
        }

        public DataTable GetUserProfile(long userId, int userTypeId)
        {
            var param = new Dictionary<string, object> {
                { "@UserId", userId },
                {"@UserTypeId", userTypeId}
            };
            return _dbAccess.GetDataTable("Attendance_GetUserProfile_Old", param);
        }

        public DbResponse<object> NewGetUserProfile(long userId, int userTypeId)
        {
            var parameters = new Dictionary<string, object>
            {
                ["@UserId"] = userId,
                ["@UserTypeId"] = userTypeId
            };

            var dt = _dbAccess.GetDataTable("Attendance_GetUserProfile", parameters);

            if (dt == null || dt.Rows.Count == 0)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = "No user profile found."
                };
            }

            var row = dt.Rows[0];

            var profile = new
            {
                id = Convert.ToInt64(row["UserID"]),
                UserTypeId = Convert.ToInt64(row["UserTypeID"]),
                profileId = row["ProfileId"]?.ToString() ?? "",
                firstName = row["FirstName"]?.ToString() ?? "",
                middleName = row["MiddleName"]?.ToString() ?? "",
                lastName = row["LastName"]?.ToString() ?? "",
                fullName = row["FullName"]?.ToString() ?? "",
                MobileNo = row["UserMobileNo"]?.ToString() ?? "",
                Email=row["UserEmailID"]?.ToString() ?? "",
                instituteCode = row["InstituteCode"]?.ToString() ?? "N/A",
                instituteName = row["InstituteName"]?.ToString() ?? "",
                hasValidInstitute = Convert.ToBoolean(row["HasValidInstitute"] ?? false),
                courseCode = row["CourseCode"]?.ToString() ?? "N/A",
                CollegeId = row["CollegeId"]?.ToString() ?? "",
                isActive = Convert.ToBoolean(row["IsActive"] ?? true),
                profilePhotoUrl = row["ProfilePhotoUrl"]?.ToString() ?? "",
                faceEnrolled = Convert.ToBoolean(row["FaceEnrolled"] ?? false),
                enrolledPhotoUrl = row["EnrolledPhotoUrl"]?.ToString() ?? ""
            };

            return new DbResponse<object>
            {
                Result = "Y",                                     // Later Form DB
                Message = "User profile fetched successfully.",
                Data = profile
            };
        }

        public void UpdateProfilePhoto(Dictionary<string, object> parameters)
        {
            _dbAccess.ExecuteNonQuery("Attendance_UpdateProfilePhoto", parameters);
        }

        public DbResponse<object> CreateRegularization(long userId, RegularizationCreateRequest request)
        {
            try
            {
                var param = new Dictionary<string, object>
                {
                    ["@UserId"] = userId,
                    ["@RequestType"] = request.RequestType.ToUpper() ?? "",
                    ["@RequestedPunchDateTime"] = request.RequestedPunchDateTime,
                    ["@PunchRemark"] = request.PunchRemark ?? "",
                    ["@SelfieUrl"] = "",
                    ["@Latitude"] = request.Latitude ?? (object)DBNull.Value,
                    ["@Longitude"] = request.Longitude ?? (object)DBNull.Value
                };

                var ds = _dbAccess.GetDataSet("Attendance_RegularizationCreate",param);

                if (ds == null || ds.Tables.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No response received from regularization request."
                    };
                }

                // Result Set 1 - Common Response
                var statusTable = ds.Tables[0];

                if (statusTable.Rows.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No response from database."
                    };
                }

                var result = statusTable.Rows[0]["Success"] != DBNull.Value &&
                             Convert.ToBoolean(statusTable.Rows[0]["Success"])
                             ? "Y"
                             : "N";
                var message = statusTable.Rows[0]["Message"]?.ToString() ?? "";

                // Result Set 2 - Data
                object data = null;

                if (result == "Y" &&  ds.Tables.Count > 1 &&  ds.Tables[1].Rows.Count > 0)
                {
                    data = DataTableToList(ds.Tables[1]);
                }

                return new DbResponse<object>
                {
                    Result = result,
                    Message = message,
                    Data = data
                };
            }
            catch (Exception ex)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = $"An error occurred while creating regularization request. {ex.Message}"
                };
            }
        }
        public DbResponse<object> ProcessRegularization(List<long> requestIds, int action, string approveBy, string approvalRemark = "")
        {
            try
            {
                if (requestIds == null || requestIds.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "At least one regularization request ID is required."
                    };
                }

                // Convert IDs to JSON
                var requestIdsJson = JsonConvert.SerializeObject(requestIds);
                var param = new Dictionary<string, object>
                {
                    ["@RequestIds"] = requestIdsJson,
                    ["@Action"] = action,
                    ["@ApproveBy"] = approveBy ?? "",
                    ["@ApprovalRemark"] = approvalRemark ?? ""
                };

                var ds = _dbAccess.GetDataSet("Attendance_RegularizationProcess",param);

                if (ds == null || ds.Tables.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No response from database."
                    };
                }

                // Result Set 1 - Summary
                var statusTable = ds.Tables[0];

                if (statusTable.Rows.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No response from database."
                    };
                }

                var result = statusTable.Rows[0]["Success"] != DBNull.Value &&
                    Convert.ToBoolean(statusTable.Rows[0]["Success"])
                        ? "Y"
                        : "N";
                var message = statusTable.Rows[0]["Message"]?.ToString() ?? "";

                // Result Set 2 - Individual Results
                object data = null;
                if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                {
                    data = DataTableToList(ds.Tables[1]);
                }
                return new DbResponse<object>
                {
                    Result = result,
                    Message = message,
                    Data = data
                };
            }
            catch (Exception ex)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = $"An error occurred while processing regularization. {ex.Message}"
                };
            }
        }
        public DbResponse<object> GetUserRegularization(long userId, int? approvalStatus)
        {
            try
            {
                var param = new Dictionary<string, object>()
                {
                    ["@UserId"] = userId,
                    ["@ApprovalStatus"] = approvalStatus.HasValue ? approvalStatus.Value : DBNull.Value
                };

                DataTable dt = _dbAccess.GetDataTable("Attendance_RegularizationGetUserRequests", param);
                if (dt == null || dt.Rows.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No pending regularization requests found."
                    };
                }

                return new DbResponse<object>
                {
                    Result = "Y",
                    Message = "Pending regularization requests fetched successfully.",
                    Data = DataTableToList(dt)
                };
            }
            catch (Exception ex)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = $"An error occurred while fetching pending regularization requests. {ex.Message}"
                };
            }
        }
        public DbResponse<object> GetInstituteRegularization(long collegeId, long userTypeId, int? approvalStatus)
        {
            try
            {
                var param = new Dictionary<string, object>()
                {
                    ["@CollegeId"] = collegeId,
                    ["@UserTypeID"] = userTypeId,
                    ["@ApprovalStatus"] = approvalStatus.HasValue ? approvalStatus.Value : DBNull.Value
                };

                var ds = _dbAccess.GetDataSet("Attendance_RegularizationGetInstituteRequests", param);
                if (ds == null || ds.Tables.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No response from database."
                    };
                }

                // Result Set 1 - Common Response
                var statusTable = ds.Tables[0];

                if (statusTable.Rows.Count == 0)
                {
                    return new DbResponse<object>
                    {
                        Result = "N",
                        Message = "No response from database."
                    };
                }

                var result = statusTable.Rows[0]["Success"] != DBNull.Value && Convert.ToBoolean(statusTable.Rows[0]["Success"])
                             ? "Y"
                             : "N";
                var message = statusTable.Rows[0]["Message"]?.ToString() ?? "";
                // Result Set 2 - Data
                object data = null;
                if (result == "Y" && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                {
                    data = DataTableToList(ds.Tables[1]);
                }
                return new DbResponse<object>
                {
                    Result = result,
                    Message = message,
                    Data = data
                };
            }
            catch (Exception ex)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = $"An error occurred while fetching pending regularization requests. {ex.Message}"
                };
            }
        }


        public DbResponse<InstituteTodaySummaryResponse> GetInstituteSummaryByDate( long collegeId, long userTypeId, long courseId, long batchId,DateTime? attendanceDate)
        {
            //var parameters = new Dictionary<string, object>
            //    {
            //        { "@CollegeID", collegeId },
            //        { "@UserTypeID", userTypeId },
            //        { "@AttendanceDate", attendanceDate ?? (object)DBNull.Value }
            //    };
            var parameters = new Dictionary<string, object>
{
                     { "@CollegeID", collegeId },
                     { "@UserTypeID", userTypeId },
                     { "@CourseID", courseId > 0 ? (object)courseId : DBNull.Value },
                     { "@BatchID",  batchId  > 0 ? (object)batchId  : DBNull.Value },
                     { "@AttendanceDate", attendanceDate ?? (object)DBNull.Value }
};

            var ds = _dbAccess.GetDataSet("Attendance_GetInstituteSummary_ByDate",parameters);

            if (ds == null || ds.Tables.Count == 0)
            {
                return new DbResponse<InstituteTodaySummaryResponse>
                {
                    Result = "N",
                    Message = "No response from database"
                };
            }

            var result = ds.Tables[0].Rows[0]["Result"]?.ToString() ?? "N";

            var message = ds.Tables[0].Rows[0]["Message"]?.ToString() ?? "";

            InstituteTodaySummaryResponse summary = null;

            if (result == "Y")
            {
                summary = new InstituteTodaySummaryResponse();
                // Summary
                if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                {
                    var row = ds.Tables[1].Rows[0];
                    summary.TotalCount =  Convert.ToInt64(row["TotalCount"]);
                    summary.PunchOut =  Convert.ToInt64(row["PunchOut"]);
                    summary.PunchIn =  Convert.ToInt64(row["PunchIn"]);
                    summary.Remaining = Convert.ToInt64(row["Remaning"]);
                   
                    

                }

                // Details
                summary.Details = new List<AttendanceUserResponse>();

                if (ds.Tables.Count > 2)
                {
                    foreach (DataRow row in ds.Tables[2].Rows)
                    {
                        summary.Details.Add(
                            new AttendanceUserResponse
                            {
                                UserID =  Convert.ToInt64(row["UserID"]),
                                UserLoginID = row["UserLoginID"]?.ToString(),
                                UserName = row["UserName"]?.ToString(),
                                PunchIn = row["PunchIn"] == DBNull.Value
                                    ? null
                                    : Convert.ToDateTime(row["PunchIn"]),
                                PunchOut = row["PunchOut"] == DBNull.Value
                                    ? null
                                    : Convert.ToDateTime(row["PunchOut"]),
                                PunchInLatitude = row["PunchInLatitude"] == DBNull.Value
                        ? null
                        : Convert.ToDecimal(row["PunchInLatitude"]),
                                PunchInLongitude = row["PunchInLongitude"] == DBNull.Value
                        ? null
                        : Convert.ToDecimal(row["PunchInLongitude"]),
                                PunchOutLatitude = row["PunchOutLatitude"] == DBNull.Value
                        ? null
                        : Convert.ToDecimal(row["PunchOutLatitude"]),
                                PunchOutLongitude = row["PunchOutLongitude"] == DBNull.Value
                        ? null
                        : Convert.ToDecimal(row["PunchOutLongitude"]),

                                AttendanceStatus = row["AttendanceStatus"]?.ToString()
                            }
                        );
                    }
                }
            }

            return new DbResponse<InstituteTodaySummaryResponse>
            {
                Result = result,
                Message = message,
                Data = summary
            };
        }
        
        
        protected object DataTableToList(DataTable dt, bool returnAsObject = false)
        {
            if (dt == null || dt.Rows.Count == 0)
                return new List<object>();

            var result = new List<Dictionary<string, object>>();

            foreach (DataRow row in dt.Rows)
            {
                var dict = new Dictionary<string, object>();
                foreach (DataColumn col in dt.Columns)
                {
                    var value = row[col];
                    dict[col.ColumnName] = value == DBNull.Value ? null : value;
                }
                result.Add(dict);
            }

            // Return single object if only one row, otherwise return array
            return result.Count == 1 ? (object)result[0] : result;
        }
    }
}
