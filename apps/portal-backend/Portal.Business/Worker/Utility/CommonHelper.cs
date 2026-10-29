using Microsoft.Extensions.Configuration;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Newtonsoft.Json;
using Portal.Data;
using Portal.Entities.Base;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Resources;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;
using System.Drawing;
using System.Drawing.Imaging;

namespace Portal.Business.Worker.Utility
{
    public class CommonHelper
    {
        private readonly IConfiguration _configuration;
        private const int ExifOrientationId = 0x0112;
        //private static readonly Repository objData;

        ////// Inject MainRepository via constructor
        //public static  CommonHelper(Repository repository)
        //{
        //    objData = repository ?? throw new ArgumentNullException(nameof(repository));
        //}

        public CommonHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public static ResourceManager rm;
        public static CultureInfo ci;

        static string EncryptionKey = "DYT64MDREU864EHD";
        public static string Encrypt(string Text)
        {
            byte[] clearBytes = Encoding.Unicode.GetBytes(Text);

            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);

                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(clearBytes, 0, clearBytes.Length);
                        cs.Close();
                    }

                    Text = Convert.ToBase64String(ms.ToArray());
                }
            }

            return Text;
        }
        public static string Decrypt(string Text)
        {
            byte[] cipherBytes = Convert.FromBase64String(Text);

            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);

                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(cipherBytes, 0, cipherBytes.Length);
                        cs.Close();
                    }

                    Text = Encoding.Unicode.GetString(ms.ToArray());
                }
            }

            return Text;
        }
        public static void SaveException(string exception, string source, string userLoginId = "Guest")
        {
            try
            {
                exception ??= "No exception message provided.";
                source ??= "Unknown source.";
                userLoginId ??= "Guest";
                Repository objData = new Repository();
                LogEntity entity = new LogEntity
                {
                    ErrorMessage = exception,
                    LogSource = source,
                    UserLoginID = userLoginId,
                    BrowserInfo = new BrowserEntity()
                };

                objData.SaveLog(entity);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving exception: {ex.Message}");
            }
        }
        public static string Base64Encrypt(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }
        public static string Base64Decrypt(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }
        public static string GetXML(object objData)
        {
            XmlDocument xmlDoc = new XmlDocument();
            XmlSerializer xmlSerializer = new XmlSerializer(objData.GetType());

            using (MemoryStream xmlStream = new MemoryStream())
            {
                xmlSerializer.Serialize(xmlStream, objData);
                xmlStream.Position = 0;
                xmlDoc.Load(xmlStream);

                return xmlDoc.InnerXml;
            }
        }
        public static DateTime DateStringToDateTime(string strDate)
        {
            DateTime dtDate = new DateTime();

            if (!string.IsNullOrEmpty(strDate))
            {
                string c = strDate.Replace("/", "-");
                var year = Convert.ToInt32(c.Split('-')[2]);
                var month = Convert.ToInt32(c.Split('-')[1]);
                var day = Convert.ToInt32(c.Split('-')[0]);
                dtDate = new DateTime(year, month, day);
            }

            return dtDate;
        }
        public static string DateTimeToDateString(DateTime dtDate)
        {
            string strDate = string.Empty;

            if (IsValidDate(dtDate))
            {
                strDate = dtDate.Day.ToString().PadLeft(2, '0') + "/" +
                          dtDate.Month.ToString().PadLeft(2, '0') + "/" +
                          dtDate.Year;
            }

            return strDate;
        }
        public static bool IsValidDate(DateTime dtDate)
        {
            DateTime minValue = DateTime.Parse(System.Data.SqlTypes.SqlDateTime.MinValue.ToString());
            DateTime maxValue = DateTime.Parse(System.Data.SqlTypes.SqlDateTime.MaxValue.ToString());

            if (minValue > dtDate || maxValue < dtDate)
                return false;

            return true;
        }

        public static List<DropdownEntity> Attendance()
        {
            List<DropdownEntity> lstAttendace = new List<DropdownEntity>();
            lstAttendace.Add(new DropdownEntity { Value = "-1", Text = "Select", Group = "1" });
            lstAttendace.Add(new DropdownEntity { Value = "1", Text = "Present", Group = "1" });
            lstAttendace.Add(new DropdownEntity { Value = "2", Text = "Absent", Group = "1" });
            lstAttendace.Add(new DropdownEntity { Value = "3", Text = "Result Hold", Group = "1" });
            return lstAttendace;
        }
        public static string AttendanceLabel(string Value)
        {
            if (Value == "-1")
                return "";
            else if (Value == "1")
                return "Present";
            else if (Value == "2")
                return "Absent";
            else if (Value == "3")
                return "Result Hold";
            else
                return "";
        }
        public static List<DropdownEntity> DataTableToList(DataTable table, bool hasSelect)
        {
            var list = new List<DropdownEntity>(table.Rows.Count);
            DropdownEntity ddl;

            if (hasSelect)
            {
                ddl = new DropdownEntity()
                {
                    Value = "-1",
                    Text = "Select",
                    Group = "-1",
                    Group2 = "-1"
                };
                list.Add(ddl);
            }
            if (table != null && table.Rows.Count > 0)
            {
                foreach (DataRow row in table.Rows)
                {
                    var values = row.ItemArray;
                    ddl = new DropdownEntity()
                    {
                        Value = values[0].ToString(),
                        Text = values[1].ToString(),
                        Group = values[2].ToString(),
                        Group2 = values.Length > 3 ? values[3].ToString() : "-1"
                    };
                    list.Add(ddl);
                }
            }
            return list;
        }
        public static BankEntity GetBankDetails(string IFSCCode)
        {
            BankEntity entity = new BankEntity();
            string url = "https://ifsc.razorpay.com/" + IFSCCode;
            try
            {
                HttpWebRequest myReq = (HttpWebRequest)WebRequest.Create(url);
                HttpWebResponse myResp = (HttpWebResponse)myReq.GetResponse();
                System.IO.StreamReader respStreamReader = new System.IO.StreamReader(myResp.GetResponseStream());
                entity = JsonConvert.DeserializeObject<BankEntity>(respStreamReader.ReadToEnd());
                respStreamReader.Close();
                myResp.Close();
            }
            catch (Exception ex)
            {
            }
            return entity;
        }

        public string UploadFilesToBlobPublic(FileUploadEntity objFileUpload, Dictionary<int, string> dicContainers)
        {
            string url = "";
            string path = "";
            Int32 index = 1;

            var blobSection = _configuration.GetSection("Blob");
            var StorageConnectionStringPublic = blobSection["StorageConnectionString"];
            var FileMainContainerPublic = blobSection["FileMainContainer"]?.ToLower();
            try
            {
                var items = from pair in dicContainers orderby pair.Key ascending select pair;

                //string storageConnection = CloudConfigurationManager.GetSetting(StorageConnectionStringPublic);
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(StorageConnectionStringPublic);
                CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();
                CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(FileMainContainerPublic.ToString().ToLower());
                //cloudBlobContainer.CreateIfNotExistsAsync();
                cloudBlobContainer.CreateIfNotExistsAsync().GetAwaiter().GetResult();

                foreach (KeyValuePair<int, string> pair in items)
                {
                    path = path + pair.Value + "/";
                }

                String extension = "";

                Int32 i = objFileUpload.FileName.LastIndexOf('.');
                if (i > 0)
                {
                    extension = objFileUpload.FileName.Substring(i + 1);
                }

                var fileName = "";
                if (dicContainers.Count == 1)
                {
                    fileName = objFileUpload.FileName;
                }
                else
                {
                    if (objFileUpload.FileNameDisplay != null && objFileUpload.FileNameDisplay.Length > 0)
                    {
                        fileName = objFileUpload.FileNameDisplay + "_" + Guid.NewGuid().ToString("N") + "." + extension;
                    }
                    else
                    {
                        fileName = Guid.NewGuid().ToString("N") + "." + extension;
                    }
                }
                path = path + fileName;
                CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(path);
                cloudBlockBlob.Properties.ContentType = objFileUpload.ContentType;

                using (var stream = new MemoryStream(objFileUpload.FileByteArray, writable: false))
                {
                    cloudBlockBlob.UploadFromStreamAsync(stream).GetAwaiter().GetResult();
                    //cloudBlockBlob.UploadFromStreamAsync(stream);
                }

                url = cloudBlockBlob.Uri.ToString();
                index++;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return url;
        }

        public string FixImageOrientationIfRequired(string imageUrl, string userLoginID, string fileType)
        {
            try
            {
                using (var webClient = new WebClient())
                {
                    byte[] data = webClient.DownloadData(imageUrl);

                    using (var inputStream = new MemoryStream(data))
                    using (var image = Image.FromStream(inputStream))
                    {
                        // No EXIF orientation information
                        if (!image.PropertyIdList.Contains(ExifOrientationId))
                        {
                            return imageUrl;
                        }

                        var propertyItem = image.GetPropertyItem(ExifOrientationId);

                        ushort orientation = BitConverter.ToUInt16(propertyItem.Value, 0);

                        // Already correct
                        if (orientation == 1)
                        {
                            return imageUrl;
                        }

                        // Fix orientation
                        switch (orientation)
                        {
                            case 3:
                                image.RotateFlip(RotateFlipType.Rotate180FlipNone);
                                break;

                            case 6:
                                image.RotateFlip(RotateFlipType.Rotate90FlipNone);
                                break;

                            case 8:
                                image.RotateFlip(RotateFlipType.Rotate270FlipNone);
                                break;

                            default:
                                return imageUrl;
                        }

                        // Remove EXIF orientation
                        try
                        {
                            image.RemovePropertyItem(ExifOrientationId);
                        }
                        catch
                        {
                            // Ignore metadata removal error
                        }

                        // Save corrected image
                        using (var outputStream = new MemoryStream())
                        {
                            image.Save(outputStream, ImageFormat.Jpeg);

                            byte[] correctedImage = outputStream.ToArray();

                            // Upload corrected image
                            return UploadCorrectedImage(correctedImage, userLoginID, fileType);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "FixImageOrientationIfRequired", userLoginID.ToString());
                // If correction fails, keep original URL
                return imageUrl;
            }
        }
        private string UploadCorrectedImage(byte[] imageBytes, string userLoginID, string fileType)
        {
            var dicContainers = new Dictionary<int, string>
    {
        { 1, "msbsvetlive" },
        { 2, "candidate" },
        { 3, userLoginID.ToString().ToLower() }
    };

            var objFileUpload = new FileUploadEntity
            {
                FileNameDisplay = fileType,
                FileName = fileType + ".jpg",
                ContentType = "image/jpeg",
                FileByteArray = imageBytes
            };

            return UploadFilesToBlobPublic(objFileUpload, dicContainers);
        }


    }

}
