# 🚀 Deployment Checklist - CORS File Upload Fix

## Issue Summary
```
Error: System.IO.FileNotFoundException: Could not load file or assembly 'Azure.Storage.Blobs
```

**Root Cause**: NuGet packages (especially `Azure.Storage.Blobs`) are not deployed to the production server.

---

## ✅ Local Development (COMPLETED)

- ✅ NuGet restore completed
- ✅ Project builds successfully (4994 warnings, 0 errors)
- ✅ FileUploadController refactored with dependency injection
- ✅ CORS middleware corrected in Program.cs
- ✅ All code changes committed to Git

---

## 🔄 Production Deployment Steps

### Step 1: Clean Build on Production Machine
```powershell
# On your local machine OR on the deployment server
cd "C:\Devendra\MSBSVETGit\MSBSVET-Backend_API"
dotnet clean
dotnet build --configuration Release
```

### Step 2: Publish Release Build
```powershell
# Publish as self-contained (includes all runtime dependencies)
dotnet publish -c Release -o "C:\Published\MSBSVET-API" --no-self-contained

# OR for production (recommended - smaller size but requires .NET 8 runtime on server)
dotnet publish -c Release -o "C:\Published\MSBSVET-API" --self-contained
```

### Step 3: Stop IIS Application
```powershell
# Stop IIS
iisreset /stop

# Wait 10 seconds
Start-Sleep -Seconds 10
```

### Step 4: Backup Current Deployment
```powershell
# Backup existing files (adjust path to your actual deployment folder)
$backupPath = "C:\inetpub\wwwroot\api_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item -Path "C:\inetpub\wwwroot\api" -Destination $backupPath -Recurse

Write-Host "Backup created at: $backupPath"
```

### Step 5: Deploy New Files
```powershell
# Copy published files to IIS folder
Copy-Item -Path "C:\Published\MSBSVET-API\*" -Destination "C:\inetpub\wwwroot\api" -Recurse -Force
```

### Step 6: Start IIS Application
```powershell
# Start IIS
iisreset /start

# Wait for app to start
Start-Sleep -Seconds 5
```

### Step 7: Verify Deployment
```powershell
# Test API endpoint
$response = Invoke-WebRequest -Uri "https://api.msbsvet.edu.in/api/FileUpload" -Method Options -Headers @{"Origin"="https://msbsvet.edu.in"} -ErrorAction SilentlyContinue

# Check CORS headers
Write-Host "Status Code: $($response.StatusCode)"
Write-Host "CORS Headers:"
$response.Headers | ForEach-Object { Write-Host "  $_ : $($response.Headers[$_])" }
```

---

## 🐛 If Deployment Still Fails

### Issue 1: Assembly Not Found on Server
**Solution**: Ensure .NET 8 Runtime is installed on production server
```powershell
# Check .NET version on server
dotnet --version

# If not installed, download from: https://dotnet.microsoft.com/download/dotnet/8.0
```

### Issue 2: IIS Cannot Read Published Files
**Solution**: Check file permissions
```powershell
# Grant IIS_IUSRS permission
$acl = Get-Acl "C:\inetpub\wwwroot\api"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS","Modify","ContainerInherit,ObjectInherit","None","Allow")
$acl.SetAccessRule($rule)
Set-Acl "C:\inetpub\wwwroot\api" $acl
```

### Issue 3: Port/HTTPS Not Working
**Solution**: Check IIS binding and SSL certificate
```powershell
# List IIS bindings
Get-WebBinding -Name "YourSiteName"

# Ensure HTTPS binding uses valid SSL certificate
netsh http show sslcert
```

---

## 📋 Files Changed in This Fix

1. **Portal.Server\Controllers\FileUploadController.cs**
   - Added dependency injection for IConfiguration
   - Added ILogger for debugging
   - Added configuration validation
   - Fixed response format

2. **Portal.Server\Program.cs**
   - Corrected CORS middleware order (MUST be first)
   - Added "OPTIONS" method to CORS policy
   - Added "/api/FileUpload" to middleware exclusions
   - Added [EnableCors] attribute to controller

---

## ✅ Verification After Deployment

### Check 1: Browser Network Tab
```
1. Open DevTools (F12)
2. Go to Network tab
3. Try file upload
4. Click on FileUpload request
5. Verify Response Headers include:
   ✅ access-control-allow-origin: https://msbsvet.edu.in
   ✅ access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
```

### Check 2: Preflight Request
```
Should see TWO requests in Network tab:
1. OPTIONS /api/FileUpload?... → Status 200 (Preflight)
2. POST /api/FileUpload?... → Status 200 (Actual request)
```

### Check 3: Server Logs
```
Look for logs containing:
✅ "FileUpload request - fileName: xxx"
✅ "SAS URL generated successfully"
```

---

## 🎯 Success Criteria

- ✅ No `FileNotFoundException` for Azure.Storage.Blobs
- ✅ File upload API returns 200 (not 500)
- ✅ CORS headers present in response
- ✅ SAS URL generated and returned to frontend
- ✅ Frontend can upload file to Azure Blob Storage

---

## 📞 Rollback Plan (If Needed)

```powershell
# Stop IIS
iisreset /stop

# Restore from backup
$backupPath = "C:\inetpub\wwwroot\api_backup_YYYYMMDD_HHMMSS"
Copy-Item -Path "$backupPath\*" -Destination "C:\inetpub\wwwroot\api" -Recurse -Force

# Start IIS
iisreset /start
```

---

## 🔗 Git Commit Info

```
Commit: Fix CORS file upload error: Refactor FileUploadController with DI, fix middleware order, add OPTIONS method
Files: 
  - Portal.Server/Controllers/FileUploadController.cs
  - Portal.Server/Program.cs
```

**To pull latest changes on production:**
```powershell
cd "C:\Devendra\MSBSVETGit\MSBSVET-Backend_API"
git pull origin master
```

---

**Last Updated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Status**: ✅ Ready for Production Deployment
