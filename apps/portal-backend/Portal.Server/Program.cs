using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Portal.Business.Interface.Base;
using Portal.Business.Worker;
using Portal.Business.Worker.FirebaseNotification;
using Portal.Data.Source;
using Portal.Entities.Base;
using Portal.Server.Middleware;
using QuestPDF.Infrastructure;
using System.Security.Cryptography;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//builder.Services.AddControllers();

builder.Services.AddControllers(opt =>
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));
}).AddNewtonsoftJson(options =>
{
    // To ignore reference loops (avoid self-referencing stack overflow)
    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;

    // To preserve property names as-is (no camel casing)
    options.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver();

    // To format the JSON output
    options.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.Indented;
});

//builder.Services.AddControllers(opt =>
//{
//    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
//    opt.Filters.Add(new AuthorizeFilter(policy));
//}).AddNewtonsoftJson(options =>
//      {
//          // To ignore reference loops (avoid self-referencing stack overflow)
//          options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;

//          // To preserve property names as-is (no camel casing)
//          options.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver();

//          // To format the JSON output
//          options.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.Indented;
//      });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(c =>
{
    var securityScheme = new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Example: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securityScheme);

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            securityScheme,
            Array.Empty<string>()
        }
    });
});

// Register Connection class 
builder.Services.AddSingleton<Connection>(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    string connString = configuration.GetConnectionString("DBConnection")
                         ?? throw new InvalidOperationException("DBConnection is missing in configuration.");
    return new Connection(connString);
});

builder.Services.AddSingleton<RSA>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();

    var pem = config["Encryption:PrivateKey"]
        ?? throw new Exception("Encryption:PrivateKey missing");

    return RsaKeyLoader.LoadPrivateKey(pem);
});
builder.Services.AddOptions<AadhaarApiOptions>()
            .BindConfiguration(AadhaarApiOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Initialize Firebase
if (FirebaseApp.DefaultInstance == null)
{
    var firebaseCredentials = builder.Configuration.GetSection("Firebase:Credentials").Get<Dictionary<string, string>>();
    var firebaseJson = System.Text.Json.JsonSerializer.Serialize(firebaseCredentials);

    FirebaseApp.Create(new AppOptions()
    {
        //Credential = GoogleCredential.FromFile("pushnotification-b5259-firebase-adminsdk-fbsvc-ec65c95fa4.json")
        Credential = GoogleCredential.FromJson(firebaseJson)
    });
}

// Initialize Background Service
builder.Services.AddHostedService<ScheduledNotificationWorker>();

builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();


builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddHttpClient<IAadhaarVerificationService, AadhaarVerificationService>(client =>
{
    client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
    client.Timeout = TimeSpan.FromSeconds(60);
});
// Configure JSON options
//builder.Services.AddControllers()
//    .AddNewtonsoftJson(options =>
//    {
//        // To ignore reference loops (avoid self-referencing stack overflow)
//        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;

//        // To preserve property names as-is (no camel casing)
//        options.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver();

//        // To format the JSON output
//        options.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.Indented;
//    });

// CORS Configuration - This is the key fix


//ADDED  for https cookies tets
//builder.Services.ConfigureApplicationCookie(options =>
//{
//    options.Cookie.HttpOnly = true;
//    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
//    options.Cookie.SameSite = SameSiteMode.None;
//});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .WithOrigins(
              "https://msbsvet.edu.in", "https://staging.msbsvet.edu.in" , "https://new.msbsvet.edu.in", "https://uat.msbsvet.edu.in", "https://ifsc.razorpay.com/",
              "https://apiuat.msbsvet.edu.in", "https://api.msbsvet.edu.in", "http://localhost:3000",
              "https://apiuat.msbsvet.edu.in", "https://api.msbsvet.edu.in", "https://uatapi.msbsvet.edu.in", "http://staging.msbsvet.edu.in",
                "https://localhost:3000" , "http://localhost:3000", "http://localhost:5173", "https://localhost:5173", "http://localhost:5174",
                "https://ifsc.razorpay.com"
            // React local dev
            )
            .AllowAnyHeader()
            .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS","MERGE","HEAD","PATCH")
            .AllowCredentials()
            .SetIsOriginAllowedToAllowWildcardSubdomains()
            .WithExposedHeaders("X-Encrypted");
    });

    //options.AddPolicy("AllowAll", builder =>
    //{
    //    builder
    //        .WithOrigins("https://localhost:3000", "http://localhost:3000", "http://localhost:3001")
    //        .AllowAnyHeader()
    //        //.WithMethods("GET", "POST", "PUT", "DELETE","PATCH")
    //        .AllowAnyMethod()
    //        .AllowCredentials()
    //        .WithExposedHeaders("X-Encrypted");
    //});
    //options.AddPolicy("AllowAll", builder =>
    //{
    //    builder
    //        .WithOrigins("https://localhost:3000", "http://localhost:3000")
    //        .AllowAnyHeader()
    //        //.WithMethods("GET", "POST", "PUT", "DELETE","PATCH")
    //        .AllowAnyMethod()
    //        .AllowCredentials()
    //        .WithExposedHeaders("X-Encrypted");
    //});
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto;

    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

QuestPDF.Settings.License = LicenseType.Community;

app.UseForwardedHeaders();
// Configure the HTTP request pipeline.

// CORS MUST be applied first (right after building the app)
//if (app.Environment.IsDevelopment())
//{
app.UseCors("AllowAll");
//}
//else
//{
//    app.UseCors("AllowUAT");
//}
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseSwagger();
app.UseSwaggerUI();
//app.Use(async (context, next) =>
//{
//    var auth = context.Request.Headers["Authorization"].ToString();
//    await next();
//});

//app.UseMiddleware<RequestDebugMiddleware>();
app.UseWhen(
       context =>
        !context.Request.Path.StartsWithSegments("/api/security/public-key") &&
        !context.Request.Path.StartsWithSegments("/api/account/refresh-token") &&
        !context.Request.Path.StartsWithSegments("/api/FileUpload")&&
        !context.Request.Path.StartsWithSegments("/api/AadhaarVerification/verify") &&
        !context.Request.Path.StartsWithSegments("/api/AadhaarVerification/reverify") &&
        !context.Request.Path.StartsWithSegments("/api/chatbot") &&
        !context.Request.Path.StartsWithSegments("/api/chat") &&
        !context.Request.Path.StartsWithSegments("/api/tts"),
         


    appBuilder =>
    {   
        appBuilder.UseMiddleware<DecryptRequestMiddleware>();
    });

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<EncryptResponseMiddleware>();
//app.UseMiddleware<ResponseDebugMiddleware>();
app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

