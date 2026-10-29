using Admission.Business;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Portal.Business;
using Portal.Business.Interface.Abstractions.Authentication;
using Portal.Business.Interface.Account;
using Portal.Business.Interface.Administration;
using Portal.Business.Interface.Admission;
using Portal.Business.Interface.Attendance;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.Candidate;
using Portal.Business.Interface.Certificate;
using Portal.Business.Interface.DVET;
using Portal.Business.Interface.DVETO;
using Portal.Business.Interface.Exam;
using Portal.Business.Interface.ExistingInstitute;
using Portal.Business.Interface.Fee;
using Portal.Business.Interface.FirebaseNotification;
using Portal.Business.Interface.Institute;
using Portal.Business.Interface.ITIAdmission;
using Portal.Business.Interface.ITISpecification;
using Portal.Business.Interface.Master;
using Portal.Business.Interface.MasterMgmt;
using Portal.Business.Interface.Menu;
using Portal.Business.Interface.Obwc;
using Portal.Business.Interface.Registration;
using Portal.Business.Interface.Report;
using Portal.Business.Interface.RO;
using Portal.Business.Interface.SchoolStep;
using Portal.Business.Interface.Staff;
using Portal.Business.Worker;
using Portal.Business.Worker.Abstractions.Authentication;
using Portal.Business.Worker.Account;
using Portal.Business.Worker.Administration;
using Portal.Business.Worker.Admission;
using Portal.Business.Worker.Attendance;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Candidate;
using Portal.Business.Worker.Certificate;
using Portal.Business.Worker.DVET;
using Portal.Business.Worker.DVETO;
using Portal.Business.Worker.Fee;
using Portal.Business.Worker.FirebaseNotification;
using Portal.Business.Worker.Institute;
using Portal.Business.Worker.ITIAdmission;
using Portal.Business.Worker.ITISpecification;
using Portal.Business.Worker.Master;
using Portal.Business.Worker.MasterMgmt;
using Portal.Business.Worker.Menu;
using Portal.Business.Worker.Obwc;
using Portal.Business.Worker.Registration;
using Portal.Business.Worker.Report;
using Portal.Business.Worker.RO;
using Portal.Business.Worker.Staff;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Data.Pool.Certificate;
using Portal.Data.Source;
using Portal.Entities.Base;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;

namespace Portal.Server.Middleware;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
    this IServiceCollection services,
    IConfiguration configuration)
    {
        AddAuthentication(services, configuration);
        AddAuthorization(services);

        return services;
    }

    private static void AddAuthentication(IServiceCollection services, IConfiguration configuration)
    {
        // Add JWT Authentication with ASP.NET Core Identity
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            //options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            var jwtSettings = configuration.GetSection("Jwt");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = securityKey,
                //ClockSkew = TimeSpan.FromSeconds(30)

                NameClaimType = JwtRegisteredClaimNames.Sub,
                RoleClaimType = ClaimTypes.Role,

                ClockSkew = TimeSpan.Zero
            };

            //options.Events = new JwtBearerEvents
            //{
            //    OnMessageReceived = context =>
            //    {
            //        context.Token = context.Request.Cookies["access_token"];
            //        return Task.CompletedTask;
            //    }
            //};
            //options.TokenValidationParameters = new TokenValidationParameters
            //{
            //    ValidateIssuer = true,
            //    ValidIssuer = "https://localhost:44321/",
            //    ValidateAudience = true,
            //    ValidAudience = "http://localhost:3000",
            //    ValidateLifetime = true,
            //    ValidateIssuerSigningKey = true,
            //    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!))
            //};

            //options.Events = new JwtBearerEvents
            //{
            //    OnAuthenticationFailed = context =>
            //    {
            //        Console.WriteLine("========== JWT AUTH FAILED ==========");
            //        Console.WriteLine(context.Exception.ToString());
            //        Console.WriteLine("=====================================");
            //        return Task.CompletedTask;
            //    },
            //    OnTokenValidated = context =>
            //    {
            //        Console.WriteLine("JWT VALIDATED");
            //        Console.WriteLine(context);
            //        Console.WriteLine("User: " + context.Principal?.Identity?.Name);
            //        return Task.CompletedTask;
            //    }
            //};
        });

        services.AddHttpContextAccessor();

        services.AddScoped<IJwtService, JwtService>();
    }

    private static void AddAuthorization(IServiceCollection services)
    {
        services.AddScoped<AuthorizationService>();

        services.AddScoped<IAuthorizationHandler,
            ValidUserAuthorizationHandler>();

        services.AddAuthorization(options =>
        {
            options.DefaultPolicy = new AuthorizationPolicyBuilder(
                    JwtBearerDefaults.AuthenticationScheme
                )
                .RequireAuthenticatedUser()
                .AddRequirements(new ValidUserRequirement())
                .Build();
        });

        services.AddTransient<IClaimsTransformation, CustomClaimsTransformation>();
    }
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<DatabaseAccess>();
        services.AddScoped<MultiDatabaseAccess>();
        services.AddScoped<Repository>();
        services.AddScoped<CommonHelper>();





        services.AddScoped<ICandidateBank, CandidateBankWorker>();
        services.AddScoped<ICandidateAdditional, CandidateAdditionalWorker>();
        services.AddScoped<ICandidateAddress, CandidateAddressWorker>();
        services.AddScoped<ICandidateApplyMainCourse, CandidateApplyMainCourseWorker>();
        services.AddScoped<ICandidatePrimary, CandidatePrimaryWorker>();
        services.AddScoped<ICandidateParent, CandidateParentWorker>();
        services.AddScoped<ICandidateCategory, CandidateCategoryWorker>();
        services.AddScoped<ICandidateCourseApply, CandidateCourseApplyWorker>();
        services.AddScoped<ICandidateQualification, CandidateQualificationWorker>();
        services.AddScoped<ICandidateTraining, CandidateTrainingWorker>();
        services.AddScoped<ICandidateWorkExperience, CandidateWorkExperienceWorker>();
        services.AddScoped<ICandidateSummary, CandidateSummaryWorker>();
        services.AddScoped<IAccount, AccountWorker>();
        services.AddScoped<IManageFAQ, ManageFAQWorker>();

        services.AddScoped<IBase, BaseWorker>();
        services.AddScoped<IAdmission, AdmissionWorker>();
        services.AddScoped<IFee, FeeWorker>();
        services.AddScoped<IVerificationCertificateRequest, VerificationCertificateRequestWorker>();
        services.AddScoped<VerificationCertificateRequestRepository>();

        services.AddScoped<IInstituteBase, InstituteBaseWorker>();
        services.AddScoped<IExistingInstitute, ExistingInstituteWorker>();
        services.AddScoped<IGrievance, GrievanceWorker>();
        services.AddScoped<IPromotionalOrganisation, PromotionalOrganisationWorker>();


        services.AddScoped<IITIAdmission, IITIAdmissionWorker>();
        services.AddScoped<IITISpecificationBase, ITISpecificationWorker>();
        services.AddScoped<IRegistration, RegistrationWorker>();
        services.AddScoped<IMenu, MenuWorker>();
        services.AddScoped<IStaffAdditional, StaffAdditionalWorker>();
        services.AddScoped<IStaffAddress, StaffAddressWorker>();
        services.AddScoped<IStaffApproval, StaffApprovalWorker>();
        services.AddScoped<IStaffBank, StaffBankWorker>();
        services.AddScoped<IStaffCategory, StaffCategoryWorker>();
        services.AddScoped<IStaffParent, StaffParentWorker>();
        services.AddScoped<IStaffPrimary, StaffPrimaryWorker>();
        services.AddScoped<IStaffQualification, StaffQualificationWorker>();
        services.AddScoped<IStaffSummary, StaffSummaryWorker>();
        services.AddScoped<IStaffTraining, StaffTrainingWorker>();
        services.AddScoped<IStaffWorkExperience, StaffWorkExperienceWorker>();
        services.AddScoped<IStaffApproval, StaffApprovalWorker>();
        services.AddScoped<IStaffBank, StaffBankWorker>();
        services.AddScoped<IStaffCategory, StaffCategoryWorker>();
        services.AddScoped<IStaffParent, StaffParentWorker>();
        services.AddScoped<IStaffPrimary, StaffPrimaryWorker>();
        services.AddScoped<IStaffQualification, StaffQualificationWorker>();
        services.AddScoped<IStaffSummary, StaffSummaryWorker>();
        services.AddScoped<IStaffTraining, StaffTrainingWorker>();
        services.AddScoped<IStaffWorkExperience, StaffWorkExperienceWorker>();
        //<!--  Administration -->
        services.AddScoped<IManageNotification, ManageNotificationWorker>();
        services.AddScoped<IAdministration, AdministrationWorker>();
        services.AddScoped<IManageActivityStatus, ManageActivityStatusWorker>();
        services.AddScoped<IManageProjectConfiguration, ManageProjectConfigurationWorker>();
        services.AddScoped<IManageReports, ManageReportsWorker>();
        services.AddScoped<IManageUsers, ManageUsersWorker>();
        services.AddScoped<ISQueryResult, SQueryResultWorker>();
        services.AddScoped<IAttendance, AttendanceWorker>();
        services.AddScoped<IPythonService, PythonServiceWorker>();
        services.AddHttpClient<IOcrVerificationService, OcrVerificationServiceWorker>();
        services.AddScoped<IFirebaseNotification, FirebaseNotificationWorker>();


        services.AddScoped<IExam, ExamWorker>();
        services.AddScoped<IVerificationCertificate, VerificationCertificateWorker>();
        services.AddScoped<IReport, ReportWorker>();
        services.AddScoped<ICourseDetails, CoursDetailsWorker>();
        services.AddScoped<ICourseDetails, CoursDetailsWorker>();

        services.AddScoped<IObwc, ObwcWorker>();

        services.AddScoped<ExamWorker>();
        //services.AddScoped<IRsaEncryptionService, RsaEncryptionService>();
        //services.AddScoped<ICryptoService, CryptoService>();
        services.AddScoped<ISchoolStep, SchoolStepWorker>();
        services.AddScoped<IDVETOBase, DVETOBaseWorker>();
        services.AddScoped<IROBase, ROBaseWorker>();

        //STT Exam
        services.AddScoped<ISTTExam, STTExamWorker>();

        //STT Batch Result Report
        services.AddScoped<ISTTBatchResultReport, STTBatchResultReportWorker>();

        services.AddScoped<ISecurityService, SecurityService>();
        services.AddScoped<IMaster , MasterWorker>();
        services.AddScoped<IDVET, DVETWorker>();

        services.AddHttpClient<AadhaarVerificationService>(client =>          // ✅ Force Action resolution
            {
                client.DefaultRequestHeaders.Accept.Add(
                    new MediaTypeWithQualityHeaderValue("application/json"));
                client.Timeout = TimeSpan.FromSeconds(60);
            });
        services.AddScoped<IAadhaarVerificationService>(sp => sp.GetRequiredService<AadhaarVerificationService>());

        services.AddSingleton<ITimeZoneService, TimeZoneService>();

        return services;
    }
}
