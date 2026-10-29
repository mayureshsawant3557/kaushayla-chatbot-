# ⚡ Quick Reference - CORS File Upload Fix

## 🎯 The Problem
```
CORS error when uploading file from https://msbsvet.edu.in to https://api.msbsvet.edu.in
Error: FileNotFoundException: Azure.Storage.Blobs assembly not found
Status: 500 Internal Server Error
```

## 🔧 What Was Fixed

### Controller (FileUploadController.cs)
```diff
- var _connectionString = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build()...
+ public FileUploadController(IConfiguration configuration, ILogger<FileUploadController> logger)
+ Added validation for configuration
+ Added logging for debugging
+ [EnableCors("AllowUAT")] attribute added
```

### Middleware (Program.cs)
```diff
+ CORS middleware moved to FIRST position (after app.Build())
+ Added "OPTIONS" method to CORS policy
+ Added "/api/FileUpload" to encryption middleware exclusion
```

## 📊 Before vs After

| Metric | Before | After |
|--------|--------|-------|
| Configuration Loading | ❌ Per request | ✅ Dependency Injection |
| CORS Middleware Order | ❌ Wrong | ✅ First |
| OPTIONS Method | ❌ Missing | ✅ Allowed |
| Encryption Interference | ❌ Yes | ✅ Excluded |
| Build Status | ❌ Error | ✅ Success |

## 🚀 Deployment Quick Start

```powershell
# 1. Commit
git add -A
git commit -m "Fix CORS file upload error"
git push origin master

# 2. Clean build
dotnet clean
dotnet build --configuration Release

# 3. Publish
dotnet publish -c Release -o "C:\PublishOutput\MSBSVET-API" --no-self-contained

# 4. Stop IIS
iisreset /stop
Start-Sleep -Seconds 10

# 5. Backup existing
$backup = "C:\inetpub\wwwroot\api_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item -Path "C:\inetpub\wwwroot\api" -Destination $backup -Recurse

# 6. Deploy
Copy-Item -Path "C:\PublishOutput\MSBSVET-API\*" -Destination "C:\inetpub\wwwroot\api" -Recurse -Force

# 7. Start IIS
iisreset /start
```

## ✅ Testing

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Open DevTools**: F12
3. **Go to Network tab**
4. **Try file upload** from https://msbsvet.edu.in
5. **Check two requests appear**:
   - OPTIONS → 200 ✅
   - POST → 200 ✅
6. **Verify response headers include**:
   - `access-control-allow-origin: https://msbsvet.edu.in` ✅

## 🐛 Quick Troubleshoot

| Problem | Solution |
|---------|----------|
| Still getting CORS error | Clear browser cache, check deployment |
| 500 error | Check IIS logs, verify .NET 8 runtime installed |
| Assembly not found | Run `dotnet restore` then redeploy |
| Preflight fails | Ensure OPTIONS method allowed in CORS policy |

## 📁 Files Changed

1. `Portal.Server\Controllers\FileUploadController.cs`
2. `Portal.Server\Program.cs`

## ✨ Key Improvements

✅ Dependency Injection (not loading config per request)
✅ Proper error handling and validation
✅ Comprehensive logging for debugging
✅ Correct CORS middleware ordering
✅ OPTIONS preflight support
✅ File upload encryption middleware exclusion
✅ Better response format (JSON object)

## 🔄 Rollback (If Needed)

```powershell
iisreset /stop
$backup = "C:\inetpub\wwwroot\api_backup_YYYYMMDD_HHMMSS"
Copy-Item -Path "$backup\*" -Destination "C:\inetpub\wwwroot\api" -Recurse -Force
iisreset /start
```

---

**Status**: ✅ Ready for Production

**Build**: ✅ Successful (0 errors)

**Deployment Time**: ~5-10 minutes
