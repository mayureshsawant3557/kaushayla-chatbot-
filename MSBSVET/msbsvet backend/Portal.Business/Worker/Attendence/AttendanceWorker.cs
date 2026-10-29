using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using FirebaseAdmin.Messaging;
using Microsoft.AspNetCore.Http;
using Microsoft.Exchange.WebServices.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Practices.EnterpriseLibrary.Data;
using NPOI.SS.Formula.Functions;
using Portal.Business.Interface.Attendance;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Data.Source;
using Portal.Entities.Attendance;
using Portal.Entities.AttendanceDbResponse;
using Portal.Entities.Attendence;
using Portal.Entities.FirebaseNotification;
using System.Data;
using System.Text;
namespace Portal.Business.Worker.Attendance
{
    public class AttendanceWorker : IAttendance
    {
        private readonly Repository _attendanceRepo;
        private readonly IPythonService _pythonService;

        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly string _containerName;

        public AttendanceWorker(IPythonService pythonService, IConfiguration configuration, Repository _attendanceRepo)
        {
            this._attendanceRepo = _attendanceRepo ?? throw new ArgumentNullException(nameof(_attendanceRepo), "Repository instance cannot be null");
            _pythonService = pythonService ?? throw new ArgumentNullException(nameof(pythonService));

            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _connectionString = _configuration["AttendanceBlob:StorageConnectionString"];
            _containerName = _configuration["AttendanceBlob:FileMainContainer"] ?? "DVETTesting";
        }

        public async Task<ServiceResult<object>> EnrollFace(long userId, FaceEnrollmentRequest request)
        {
            try
            {
                // Validate image URL
                if (string.IsNullOrEmpty(request.FaceImageUrl))
                {
                    return ServiceResult<object>.FailureResponse("Face Image Url is Required");
                }

                // Generate face encoding using Python service
                var pyServiceResponse = await _pythonService.GetFaceEncodingFromImageUrl(request.FaceImageUrl);
                if (!pyServiceResponse.IsSuccess)
                {
                    return ServiceResult<object>.FailureResponse("Enroll_Face Processing Failed While Encoding.", 422);
                }



                // Store enrollment with face encoding 
                var dbResponse = _attendanceRepo.EnrollFace(userId, request.FaceImageUrl, pyServiceResponse.Data, request.Note);
                if (dbResponse.Result != "Y")
                {
                    return ServiceResult<object>.FailureResponse(dbResponse.Message, 422);
                }

                return ServiceResult<object>.SuccessResponse(dbResponse.Data);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "EnrollFace");
                return ServiceResult<object>.FailureResponse($"Face Enrollment Failed: {ex.Message}", 500);
            }
        }
        public async Task<ServiceResult<object>> ReEnrollFace(long userId, FaceEnrollmentRequest request)
        {
            try
            {
                //Check IsUserFaceEnrolled and EncodingExist
                var dbResponse = _attendanceRepo.getUserFaceEncoding(userId);

                //if(No)  ->  No face enrollment found.
                if (dbResponse.Result != "Y")
                {
                    return ServiceResult<object>.FailureResponse("No Face Enrollment Found",404);
                }
                bool isFaceEnrolled = dbResponse.Data.FaceEnrolled;
                string storedEncoding = dbResponse.Data.FaceEncodingData;

                //get encoding of current selfie -> GetFaceEncodingFromUrl
                var UrlEncoding_pyServiceResponse = await _pythonService.GetFaceEncodingFromImageUrl(request.FaceImageUrl);
                if (!UrlEncoding_pyServiceResponse.IsSuccess)
                {
                    return ServiceResult<object>.FailureResponse("Re_Enroll_Face Processing Failed While Encoding.", 422);
                }
                string submittedEncoding = UrlEncoding_pyServiceResponse.Data;

                //compare submitted and current encoding -> CompareEncodingsAsync
                if (string.IsNullOrEmpty(submittedEncoding))
                {
                    return ServiceResult<object>.SuccessResponse("No Face Detected");
                }
                var Compare_PyServiceResponse = await _pythonService.CompareEncodings(storedEncoding, submittedEncoding);
                if (!Compare_PyServiceResponse.IsSuccess)
                {
                    return ServiceResult<object>.FailureResponse("Face re-enrollment failed. The selfie is not of actual user. It must Match 70%", 422);
                }

                // Store re-enrollment with face encoding
                var ReEnroll_dbResponse = _attendanceRepo.ReEnrollFace(userId, request.FaceImageUrl, submittedEncoding, request.Note);
                if (ReEnroll_dbResponse.Result != "Y")
                {
                    return ServiceResult<object>.FailureResponse(ReEnroll_dbResponse.Message, 422);
                }

                return ServiceResult<object>.SuccessResponse(ReEnroll_dbResponse.Data);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ReEnrollFace");
                return ServiceResult<object>.FailureResponse($"Face Re-Enrollment Failed: {ex.Message}", 500);
            }
        }
        public async Task<ServiceResult<object>> PunchIn(long userId, PunchInRequest request, string ipAddress)
        {
            try
            {

                //Check IsUserFaceEnrolled and EncodingExist
                var dbResponse = _attendanceRepo.getUserFaceEncoding(userId);

                //if(No)  ->  No face enrollment found.
                if (dbResponse.Result != "Y")
                {
                    return ServiceResult<object>.FailureResponse("No Face Enrollment Found", 404);
                }
                bool isFaceEnrolled = dbResponse.Data.FaceEnrolled;
                string storedEncoding = dbResponse.Data.FaceEncodingData;
 
                    //get encoding of current selfie Image -> GetFaceEncodingFromUrl
                    var ImageEncoding_pyServiceResponse = await _pythonService.GetFaceEncodingFromImage(request.Selfie);
                    if (!ImageEncoding_pyServiceResponse.IsSuccess)
                    {
                        return ServiceResult<object>.FailureResponse("Unable To Process(ENC) Image.", 422);
                    }
                    string submittedEncoding = ImageEncoding_pyServiceResponse.Data;

                    //compare submitted and current encoding -> CompareEncodingsAsync
                    if (string.IsNullOrEmpty(submittedEncoding))
                    {
                        return ServiceResult<object>.SuccessResponse("No Face Detected");
                    }
                    var Compare_PyServiceResponse = await _pythonService.CompareEncodings(storedEncoding, submittedEncoding);
                    if (!Compare_PyServiceResponse.IsSuccess)
                    {
                        return ServiceResult<object>.FailureResponse("Face Not Matched.", 422);
                    }

                //Upload Image
                var uploadRes = await UploadPhoto(userId, request.Selfie, false);
                if(uploadRes.IsSuccess == false)
                {
                    return ServiceResult<object>.FailureResponse("Unable to upload photo.", 400);
                }
                var filePath = $"{uploadRes.Data.uniqueFileName}";
                // Store PunchIn
                var PunchIn_dbResponse = _attendanceRepo.PunchIn(userId, request, ipAddress, filePath);
                if (PunchIn_dbResponse.Result != "Y")
                {
                    return ServiceResult<object>.FailureResponse(PunchIn_dbResponse.Message, 422);
                }

                return ServiceResult<object>.SuccessResponse(PunchIn_dbResponse.Data);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "PunchIn");
                return ServiceResult<object>.FailureResponse($"PuchIn Failed: {ex.Message}", 500);
            }
        }
        public async Task<ServiceResult<object>> PunchOut(long userId, PunchOutRequest request, string ipAddress)
        {
            try
            {
                //Check IsUserFaceEnrolled and EncodingExist
                var dbResponse = _attendanceRepo.getUserFaceEncoding(userId);

                //if(No)  ->  No face enrollment found.
                if (dbResponse.Result != "Y")
                {
                    return ServiceResult<object>.FailureResponse("No Face Enrollment Found", 404);
                }
                bool isFaceEnrolled = dbResponse.Data.FaceEnrolled;
                string storedEncoding = dbResponse.Data.FaceEncodingData;

                    //get encoding of current selfie Image -> GetFaceEncodingFromUrl
                    var ImageEncoding_pyServiceResponse = await _pythonService.GetFaceEncodingFromImage(request.Selfie);
                    if (!ImageEncoding_pyServiceResponse.IsSuccess)
                    {
                        return ServiceResult<object>.FailureResponse("Punch_Out_Face Processing Failed While Encoding.", 422);
                    }
                    string submittedEncoding = ImageEncoding_pyServiceResponse.Data;

                    //compare submitted and current encoding -> CompareEncodingsAsync
                    if (string.IsNullOrEmpty(submittedEncoding))
                    {
                        return ServiceResult<object>.SuccessResponse("No Face Detected");
                    }
                    var Compare_PyServiceResponse = await _pythonService.CompareEncodings(storedEncoding, submittedEncoding);
                    if (!Compare_PyServiceResponse.IsSuccess)
                    {
                        return ServiceResult<object>.FailureResponse("Face Not Matched.", 422);
                    }
                //Upload Image
                var uploadRes = await UploadPhoto(userId, request.Selfie, false);
                if (uploadRes.IsSuccess == false)
                {
                    return ServiceResult<object>.FailureResponse("Unable to upload photo.", 400);
                }
                var filePath = $"{uploadRes.Data.uniqueFileName}";

                // Store PunchIn
                var PunchOut_dbResponse = _attendanceRepo.PunchOut(userId, request, ipAddress, filePath);
                if (PunchOut_dbResponse.Result != "Y")
                {
                    return ServiceResult<object>.FailureResponse(PunchOut_dbResponse.Message, 422);
                }

                return ServiceResult<object>.SuccessResponse(PunchOut_dbResponse.Data);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "PunchOut");
                return ServiceResult<object>.FailureResponse($"PunchOut Failed: {ex.Message}", 500);
            }
        }


        public ServiceResult<object> GetTodayAttendance(long userId)
        {

            var dbResponse = _attendanceRepo.GetTodayAttendance(userId);
            if (dbResponse.Result == "Y")
            {
                return ServiceResult<object>.SuccessResponse(dbResponse.Data);
            }

            return ServiceResult<object>.FailureResponse(dbResponse.Message);
        }

        public object GetAttendanceHistory(long userId, DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var effectiveStartDate = startDate ?? DateTime.Now.AddMonths(-1);
                var effectiveEndDate = endDate ?? DateTime.Now;

                var param = new Dictionary<string, object>
        {
            {"@UserId", userId},
            {"@StartDate", effectiveStartDate},
            {"@EndDate", effectiveEndDate}
        };

                DataTable dt = _attendanceRepo.GetAttendanceHistory(param);

                var records = new List<object>();

                if (dt?.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        var record = new
                        {
                            id = Convert.ToInt64(row["id"]),
                            attendanceDate = row["AttendanceDate"] != DBNull.Value ?
                                Convert.ToDateTime(row["AttendanceDate"]).ToString("yyyy-MM-dd") : null,
                            punchInTime = row["PunchInTime"] != DBNull.Value ?
                                Convert.ToDateTime(row["PunchInTime"]).ToString("yyyy-MM-dd HH:mm:ss") : null,
                            punchOutTime = row["PunchOutTime"] != DBNull.Value ?
                                Convert.ToDateTime(row["PunchOutTime"]).ToString("yyyy-MM-dd HH:mm:ss") : null,
                            totalHours = row["TotalHours"] != DBNull.Value ?
                                Convert.ToDecimal(row["TotalHours"]) : (decimal?)null,
                            attendanceStatus = row["AttendanceStatus"]?.ToString(),
                            dailyPlan = row["DailyPlan"]?.ToString(),
                            workSummary = row["WorkSummary"]?.ToString(),
                            punchInRemark = row["PunchInRemark"]?.ToString(),
                            punchOutRemark = row["PunchOutRemark"]?.ToString(),
                            punchInDistanceFromOffice = row["PunchInDistanceFromOffice"] != DBNull.Value ?
                                Convert.ToDecimal(row["PunchInDistanceFromOffice"]) : (decimal?)null,
                            punchOutDistanceFromOffice = row["PunchOutDistanceFromOffice"] != DBNull.Value ?
                                Convert.ToDecimal(row["PunchOutDistanceFromOffice"]) : (decimal?)null,
                            isPunchInValid = row["IsPunchInValid"] != DBNull.Value ?
                                Convert.ToBoolean(row["IsPunchInValid"]) : (bool?)null,
                            isPunchOutValid = row["IsPunchOutValid"] != DBNull.Value ?
                                Convert.ToBoolean(row["IsPunchOutValid"]) : (bool?)null,
                            canPunchOut = row["PunchInTime"] != DBNull.Value && row["PunchOutTime"] == DBNull.Value,
                            canPunchIn = row["PunchInTime"] == DBNull.Value,
                            faceVerificationStatus = row["FaceVerificationStatus"]?.ToString()
                        };

                        records.Add(record);
                    }
                }

                return new
                {
                    totalRecords = records.Count,
                    records = records,
                    startDate = effectiveStartDate.ToString("yyyy-MM-dd"),
                    endDate = effectiveEndDate.ToString("yyyy-MM-dd")
                };
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAttendanceHistory");
                throw;
            }
        }

        public ServiceResult<object> GetMonthlyStatistics(long userId, int? year, int? month)
        {

            var dbResponse = _attendanceRepo.GetMonthlyStatistics(userId, year, month);
            if (dbResponse.Result == "Y")
            {
                return ServiceResult<object>.SuccessResponse(dbResponse.Data);
            }

            return ServiceResult<object>.FailureResponse(dbResponse.Message);
        }

        public object GetUserInstituteLocation(long userId)
        {
            try
            {
                DataTable dt = _attendanceRepo.GetUserInstituteLocation(userId);
                return DataTableToList(dt); // Changed from DataTableToList(dt, true)
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUserInstituteLocation");
                throw;
            }
        }

        public object ValidateLocation(long userId, double latitude, double longitude)
        {
            try
            {
                var param = new Dictionary<string, object>
                {
                    {"@UserId", userId},
                    {"@Latitude", latitude},
                    {"@Longitude", longitude}
                };

                DataTable dt = _attendanceRepo.ValidateLocation(param);
                return DataTableToList(dt); // Changed from DataTableToList(dt, true)
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ValidateLocation");
                throw;
            }
        }

        // Synchronous wrappers
        public object GetFaceEnrollmentStatus(long userId)
        {
            try
            {
                DataTable dt = _attendanceRepo.GetFaceEnrollmentStatus(userId);
                return DataTableToList(dt); // Changed from DataTableToList(dt, true)
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetFaceEnrollmentStatus");
                throw;
            }
        }

        public void DeleteFaceEnrollment(long userId)
        {
            try
            {
                _attendanceRepo.DeleteFaceEnrollment(userId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteFaceEnrollment");
                throw;
            }
        }

        public object GetAttendanceCalendar(long userId, int? year, int? month)
        {
            try
            {
                var param = new Dictionary<string, object>
                {
                    {"@UserId", userId},
                    {"@Year", year ?? DateTime.Now.Year},
                    {"@Month", month ?? DateTime.Now.Month}
                };

                DataTable dt = _attendanceRepo.GetAttendanceCalendar(param);

                if (dt?.Rows.Count > 0)
                {
                    var firstRow = dt.Rows[0];
                    var calendarDays = new List<object>();

                    foreach (DataRow row in dt.Rows)
                    {
                        var dayData = new Dictionary<string, object>
                        {
                            ["date"] = row["date"]?.ToString(),
                            ["dayOfWeek"] = row["dayOfWeek"]?.ToString(),
                            ["hasAttendance"] = Convert.ToBoolean(row["hasAttendance"] ?? false),
                            ["status"] = row["status"]?.ToString()
                        };

                        // Add optional fields if present
                        if (Convert.ToBoolean(row["hasAttendance"] ?? false))
                        {
                            dayData["totalHours"] = Convert.ToDecimal(row["totalHours"] ?? 0);
                            dayData["punchInTime"] = row["punchInTime"]?.ToString();
                            dayData["punchOutTime"] = row["punchOutTime"]?.ToString();
                        }

                        calendarDays.Add(dayData);
                    }

                    return new
                    {
                        year = Convert.ToInt32(firstRow["year"]),
                        month = Convert.ToInt32(firstRow["month"]),
                        monthName = firstRow["monthName"]?.ToString(),
                        calendarDays = calendarDays,
                        totalDays = Convert.ToInt32(firstRow["totalDays"]),
                        presentDays = Convert.ToInt32(firstRow["presentDays"]),
                        absentDays = Convert.ToInt32(firstRow["absentDays"]),
                        attendancePercentage = firstRow["attendancePercentage"]
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAttendanceCalendar");
                throw;
            }
        }

        public object GetWeeklyStatistics(long userId)
        {
            try
            {
                var param = new Dictionary<string, object>
                {
                    { "@UserId", userId }
                };

                DataTable dt = _attendanceRepo.GetWeeklyStatistics(param);

                if (dt?.Rows.Count > 0)
                {
                    var firstRow = dt.Rows[0];

                    var days = new List<object>();

                    foreach (DataRow row in dt.Rows)
                    {
                        days.Add(new
                        {
                            date = row["date"]?.ToString(),
                            dayName = row["dayName"]?.ToString(),
                            status = row["status"]?.ToString(),
                            hours = Convert.ToDecimal(row["hours"] ?? 0),
                            present = Convert.ToBoolean(row["present"] ?? false),

                            //dayOfWeek = row["dayOfWeek"] == DBNull.Value
                            //    ? 0
                            //    : Convert.ToInt32(row["dayOfWeek"]),

                            //isWeekend = row["isWeekend"] == DBNull.Value
                            //    ? 
                            //    : Convert.ToBoolean(row["isWeekend"]),

                            displayDayName = row["displayDayName"]?.ToString(),
                            shortDayName = row["shortDayName"]?.ToString(),
                        });
                    }

                    return new
                    {
                        totalDays = Convert.ToInt32(firstRow["totalDays"]),
                        presentDays = Convert.ToInt32(firstRow["presentDays"]),
                        totalHours = Convert.ToDecimal(firstRow["totalHours"] ?? 0),

                        days = days
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetWeeklyStatistics");
                throw;
            }
        }

        // Updated GetUserProfile method to return proper format
        public object GetUserProfile(long userId, int userTypeId)
        {
            try
            {
                DataTable dt = _attendanceRepo.GetUserProfile(userId, userTypeId);

                if (dt?.Rows.Count > 0)
                {
                    var row = dt.Rows[0];

                    // Convert to expected format
                    return new
                    {
                        id = Convert.ToInt64(row["UserID"]),
                        registrationNo = row["RegistrationNo"]?.ToString() ?? "",
                        profileId = row["ProfileId"]?.ToString() ?? "",
                        firstName = row["FirstName"]?.ToString() ?? "",
                        middleName = row["MiddleName"]?.ToString() ?? "",
                        lastName = row["LastName"]?.ToString() ?? "",
                        fullName = row["FullName"]?.ToString() ?? "",
                        boardName = "Maharashtra State Board",
                        instituteName = row["InstituteName"]?.ToString() ?? "",
                        instituteCode = row["InstituteCode"]?.ToString() ?? "N/A",
                        courseCode = row["CourseCode"]?.ToString() ?? "N/A",
                        profilePhotoUrl = row["ProfilePhotoUrl"]?.ToString() ?? "",
                        userRole = row["UserType"]?.ToString() ?? "", // Based on userTypeId
                        faceEnrolled = Convert.ToBoolean(row["FaceEnrolled"] ?? false),
                        enrolledPhotoUrl = row["EnrolledPhotoUrl"]?.ToString() ?? "",
                        isActive = Convert.ToBoolean(row["IsActive"] ?? true),
                        createdAt = row["CreatedAt"]?.ToString() ?? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUserProfile");
                throw;
            }
        }
        
        public ServiceResult<object> Dashboard(long userId, int userTypeId)
        {

            var profile = _attendanceRepo.NewGetUserProfile(userId, userTypeId);
            if (profile.Result != "Y")
            {
                return ServiceResult<object>.FailureResponse(profile.Message);
            }

            var today = _attendanceRepo.GetTodayAttendance(userId);
            var monthly = _attendanceRepo.GetMonthlyStatistics(userId, null, null);

            var dashboardData = new
            {
                UserProfile = profile.Data,
                TodayAttendance = today.Result == "Y" ? today.Data : null,
                MonthlyAttendance = monthly.Result == "Y" ? monthly.Data : null
            };

            return ServiceResult<object>.SuccessResponse(dashboardData);
        }

        public string UpdateProfilePhoto(long userId, string photoUrl)
        {
            try
            {
                var param = new Dictionary<string, object>
                {
                    {"@UserId", userId},
                    {"@PhotoUrl", photoUrl}
                };

                _attendanceRepo.UpdateProfilePhoto(param);
                return photoUrl;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateProfilePhoto");
                throw;
            }
        }

        public async Task<ServiceResult<PhotoUploadResult>> UploadPhoto(long userId, IFormFile photo, bool checkIsHuman = true)
        {
            try
            {
                if (photo == null || photo.Length == 0)
                {
                    return ServiceResult<PhotoUploadResult>.FailureResponse("Please select a file to upload", 400, "PHOTO_NOT_Found");
                }
                if (!IsValidImageFileType(photo.ContentType))
                {
                    return ServiceResult<PhotoUploadResult>.FailureResponse("Invalid file type. Only image files are allowed", 400, "INVALID_FILE");
                }
                if (!IsValidFileSize(photo.Length))
                {
                    return ServiceResult<PhotoUploadResult>.FailureResponse("File too large. Maximum size is 20MB", 400, "FILE_TOO_LARGE");
                }


                if (checkIsHuman)
                {
                    // Validate human face using Python service
                    Console.WriteLine("Validating image for human face...");
                    var isHumanFaceResponse = await _pythonService.CheckIsHumanFace(photo);
                    if (!isHumanFaceResponse.IsSuccess)
                    {
                        return ServiceResult<PhotoUploadResult>.FailureResponse(isHumanFaceResponse.Message, isHumanFaceResponse.StatusCode, isHumanFaceResponse.ErrorCode);
                    }
                    Console.WriteLine("Face validation successful. Proceeding with upload...");
                }



                // Azure Blob Upload
                string uniqueFileName = GenerateUniqueFileName(photo.FileName);
                Console.WriteLine($"Uploading file: {uniqueFileName}");
                var blobServiceClient = new BlobServiceClient(_connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
                await containerClient.CreateIfNotExistsAsync();

                var blobClient = containerClient.GetBlobClient(uniqueFileName);
                string contentType = photo.ContentType;
                using (var inputStream = photo.OpenReadStream())
                {
                    var blobHttpHeaders = new BlobHttpHeaders { ContentType = contentType };
                    await blobClient.UploadAsync(inputStream, new BlobUploadOptions
                    {
                        HttpHeaders = blobHttpHeaders
                    });
                }

                // SAS token generation (15 minutes expiry for temporary access)
                string sasUrl = "";
                string permanentUrl = blobClient.Uri.ToString();
                if (blobClient.CanGenerateSasUri)
                {
                    var sasBuilder = new BlobSasBuilder
                    {
                        BlobContainerName = _containerName,
                        BlobName = uniqueFileName,
                        Resource = "b",
                        ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(15)
                    };
                    sasBuilder.SetPermissions(BlobSasPermissions.Read);
                    sasUrl = blobClient.GenerateSasUri(sasBuilder).ToString();
                }
                Console.WriteLine($"Upload successful: {sasUrl}");


                // Success Response
                var res = new PhotoUploadResult
                {
                    success = true,
                    message = "Photo uploaded successfully with valid face verification",
                    url = sasUrl, // Temporary SAS URL (15 min expiry)
                    permanentUrl = permanentUrl, // Permanent URL (use if container is public)
                    fileName = photo.FileName,
                    uniqueFileName = uniqueFileName,
                    filePath = uniqueFileName,
                    uploadTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    faceValidation = new FaceValidationResult
                    {
                        verified = true,
                        isHumanFace = true
                    }
                };
                return ServiceResult<PhotoUploadResult>.SuccessResponse(res);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UploadPhoto");
                return ServiceResult<PhotoUploadResult>.FailureResponse($"Error While Uploading Photo : {ex.Message}", 500);
            }
        }




        #region Photo Upload Helper Methods
        private string GenerateUniqueFileName(string originalFileName)
        {
            if (string.IsNullOrEmpty(originalFileName))
            {
                originalFileName = "image";
            }

            // Extract extension
            string extension = "";
            int dotIndex = originalFileName.LastIndexOf('.');
            if (dotIndex != -1)
            {
                extension = originalFileName.Substring(dotIndex + 1).ToLower();
                extension = System.Text.RegularExpressions.Regex.Replace(extension, @"[^a-z0-9]", "");
            }

            // Sanitize base name
            string baseName = originalFileName.Substring(0, dotIndex != -1 ? dotIndex : originalFileName.Length);
            baseName = System.Text.RegularExpressions.Regex.Replace(baseName, @"[^a-zA-Z0-9_-]", "_");

            // Add UUID
            string uniqueName = baseName + "_" + Guid.NewGuid().ToString("N");

            return "facialdata_" + uniqueName + (string.IsNullOrEmpty(extension) ? "" : "." + extension);
        }
        private bool IsValidImageFileType(string contentType)
        {
            return contentType != null && contentType.ToLower().StartsWith("image/");
        }
        private bool IsValidFileSize(long fileSize)
        {
            const long MAX_SIZE = 20 * 1024 * 1024; // 20MB
            return fileSize <= MAX_SIZE;
        }
        #endregion

        #region Regularization
        public async Task<ServiceResult<object>> CreateRegularization(long userId, RegularizationCreateRequest request)
        {
            try
            {
                //Check IsUserFaceEnrolled and EncodingExist
                var dbResponse = _attendanceRepo.getUserFaceEncoding(userId);

                //if(No)  ->  No face enrollment found.
                if (dbResponse.Result != "Y")
                {
                    return ServiceResult<object>.FailureResponse("No Face Enrollment Found", 404);
                }
                bool isFaceEnrolled = dbResponse.Data.FaceEnrolled;
                string storedEncoding = dbResponse.Data.FaceEncodingData;

                //get encoding of current selfie Image -> GetFaceEncodingFromUrl
                var ImageEncoding_pyServiceResponse = await _pythonService.GetFaceEncodingFromImage(request.Selfie);
                if (!ImageEncoding_pyServiceResponse.IsSuccess)
                {
                    return ServiceResult<object>.FailureResponse("Face Processing Failed While Encoding.", 422);
                }
                string submittedEncoding = ImageEncoding_pyServiceResponse.Data;

                //compare submitted and current encoding -> CompareEncodingsAsync
                if (string.IsNullOrEmpty(submittedEncoding))
                {
                    return ServiceResult<object>.SuccessResponse("No Face Detected");
                }
                var Compare_PyServiceResponse = await _pythonService.CompareEncodings(storedEncoding, submittedEncoding);
                if (!Compare_PyServiceResponse.IsSuccess)
                {
                    return ServiceResult<object>.FailureResponse("Face Not Matched.", 422);
                }

                var regularizationDbResponse = _attendanceRepo.CreateRegularization(userId, request);

                if (regularizationDbResponse.Result == "Y")
                {
                    return ServiceResult<object>.SuccessResponse(regularizationDbResponse.Data, regularizationDbResponse.Message);
                }
                return ServiceResult<object>.FailureResponse(regularizationDbResponse.Message);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CreateRegularization");
                return ServiceResult<object>.FailureResponse("Unable to regularize the request. Please try after some time");
            }
        }
        public async Task<ServiceResult<object>> ProcessRegularization(List<long> requestId, int action, string approveBy, string approvalRemark = "")
        {
            try
            {
                var dbResponse = _attendanceRepo.ProcessRegularization(requestId, action, approveBy, approvalRemark);

                if (dbResponse.Result == "Y")
                {
                    return ServiceResult<object>.SuccessResponse(dbResponse.Data, dbResponse.Message);
                }
                return ServiceResult<object>.FailureResponse(dbResponse.Message);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ProcessRegularization");
                return ServiceResult<object>.FailureResponse("Unable to process regularization the request. Please try after some time");
            }
        }
        public async Task<ServiceResult<object>> GetUserRegularization(long userId, int? approvalStatus)
        {
            try
            {
                var dbResponse = _attendanceRepo.GetUserRegularization(userId, approvalStatus);

                if (dbResponse.Result == "Y")
                {
                    return ServiceResult<object>.SuccessResponse(dbResponse.Data, dbResponse.Message);
                }
                return ServiceResult<object>.FailureResponse(dbResponse.Message);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPendingRegularizationRequests");
                return ServiceResult<object>.FailureResponse("Unable to fetch the request. Please try after some time");
            }
        }
        public async Task<ServiceResult<object>> GetInstituteRegularization(string collegeLoginId, long userTypeId, int? approvalStatus)
        {
            try
            {
                long collegeId = _attendanceRepo.GetInstituteIDByInstituteCode(collegeLoginId);

                if (collegeId <= 0)
                {
                    return ServiceResult<object>.FailureResponse("Institute ID not found.");
                }
                var dbResponse = _attendanceRepo.GetInstituteRegularization(collegeId, userTypeId, approvalStatus);

                if (dbResponse.Result == "Y")
                {
                    return ServiceResult<object>.SuccessResponse(dbResponse.Data, dbResponse.Message);
                }
                return ServiceResult<object>.FailureResponse(dbResponse.Message);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteRegularizationRequests");
                return ServiceResult<object>.FailureResponse("Unable to fetch the request. Please try after some time");
            }
        }
        #endregion
        
        public async Task<ServiceResult<object>> GetInstituteSummaryByDate(string instituteCode, long userTypeId, long courseId, long batchId,DateTime? attendanceDate)
        {
            try
            {
                long collegeId = _attendanceRepo.GetInstituteIDByInstituteCode(instituteCode);

                if (collegeId <= 0)
                {
                    return ServiceResult<object>.FailureResponse("Institute ID not found.");
                }

                var dbResponse =   _attendanceRepo.GetInstituteSummaryByDate(collegeId, userTypeId,courseId, batchId,attendanceDate);

                if (dbResponse.Result == "Y")
                {
                    return ServiceResult<object>.SuccessResponse(dbResponse.Data, dbResponse.Message);
                }
                return ServiceResult<object>.FailureResponse( dbResponse.Message );
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message,"GetInstituteTodaySummary",instituteCode);
                return ServiceResult<object>.FailureResponse("Unable to fetch institute attendance summary.");
            }
        }

        // Updated method to return proper JSON objects instead of dropdown format
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
