using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;


namespace Portal.Data.Source
{
    public class SSCDatabaseAccess
    {
        Database objDB;
        static string BaseConnectionString = ConfigurationManager.ConnectionStrings["SSCDBConnection"].ConnectionString;
        public SSCDatabaseAccess()
        {
            BaseConnectionString = ConfigurationManager.ConnectionStrings["SSCDBConnection"].ConnectionString;
        }

        public DataTable GetDataTable(string spName)
        {
            DataSet ds = null;
            DataTable dt = null;
            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand objcmd = objDB.GetStoredProcCommand(spName))
                {
                    try
                    {
                        ds = objDB.ExecuteDataSet(objcmd);
                        if (ds != null && ds.Tables.Count > 0)
                        {
                            dt = ds.Tables[0];
                        }
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {
                        if (ds != null)
                            ds.Dispose();
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return dt;

        }
        public DataTable GetDataTable(string spName, Dictionary<string, object> parms)
        {
            DataSet ds = null;
            DataTable dt = null;
            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    foreach (var o in parms)
                    {
                        if (o.Value != null)
                        {
                            objDB.AddInParameter(cmd, o.Key, GetDBType(o.Value), o.Value);
                        }
                        else
                        {
                            objDB.AddInParameter(cmd, o.Key, DbType.String, DBNull.Value);
                        }
                    }

                    try
                    {
                        ds = objDB.ExecuteDataSet(cmd);

                        if (ds != null && ds.Tables.Count > 0)
                        {
                            dt = ds.Tables[0];
                        }
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {
                        if (ds != null)
                            ds.Dispose();
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return dt;


        }
        public DataTable GetDataTable(string spName, string parms, string parmValues)
        {
            DataSet ds = null;
            DataTable dt = null;
            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    if (!string.IsNullOrEmpty(parms) && !string.IsNullOrEmpty(parmValues))
                    {
                        if (parms.Contains("$"))
                        {
                            string[] prams = parms.Split('$');
                            string[] parmvalues = parmValues.Split('$');

                            for (int i = 0; i < prams.Length; i++)
                            {
                                var parameter = prams[i];

                                for (int j = 0; j < parmvalues.Length; j++)
                                {
                                    var parametervalue = parmvalues[i];

                                    if (!string.IsNullOrEmpty(parametervalue))
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    else
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    break;
                                }
                            }
                        }
                        else
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.CommandTimeout = 10000;
                            objDB.AddInParameter(cmd, parms, DbType.String, parmValues);
                        }
                    }

                    try
                    {
                        ds = objDB.ExecuteDataSet(cmd);

                        if (ds != null && ds.Tables.Count > 0)
                        {
                            dt = ds.Tables[0];
                        }
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {
                        if (ds != null)
                            ds.Dispose();
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return dt;


        }
        public DataSet GetDataSetByQuery(string sqlQuery)
        {
            DataSet ds = null;
            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand objcmd = objDB.GetSqlStringCommand(sqlQuery))
                {
                    try
                    {
                        ds = objDB.ExecuteDataSet(objcmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {

                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return ds;

        }

        public DataSet GetDataSet(string spName)
        {
            DataSet ds = null;
            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand objcmd = objDB.GetStoredProcCommand(spName))
                {
                    try
                    {
                        ds = objDB.ExecuteDataSet(objcmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return ds;

        }
        public DataSet GetDataSet(string spName, Dictionary<string, object> parms)
        {
            DataSet ds = null;

            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    foreach (var o in parms)
                    {
                        if (o.Value != null)
                        {
                            objDB.AddInParameter(cmd, o.Key, GetDBType(o.Value), o.Value);
                        }
                        else
                        {
                            objDB.AddInParameter(cmd, o.Key, DbType.String, DBNull.Value);
                        }
                    }

                    try
                    {
                        ds = objDB.ExecuteDataSet(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {

                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return ds;


        }
        public DataSet GetDataSet(string spName, string parms, string parmValues)
        {
            DataSet ds = null;

            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    if (!string.IsNullOrEmpty(parms) && !string.IsNullOrEmpty(parmValues))
                    {
                        if (parms.Contains("$"))
                        {
                            string[] prams = parms.Split('$');
                            string[] parmvalues = parmValues.Split('$');

                            for (int i = 0; i < prams.Length; i++)
                            {
                                var parameter = prams[i];

                                for (int j = 0; j < parmvalues.Length; j++)
                                {
                                    var parametervalue = parmvalues[i];

                                    if (!string.IsNullOrEmpty(parametervalue))
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    else
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    break;
                                }
                            }
                        }
                        else
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.CommandTimeout = 10000;
                            objDB.AddInParameter(cmd, parms, DbType.String, parmValues);
                        }
                    }

                    try
                    {
                        ds = objDB.ExecuteDataSet(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return ds;


        }

        public DataSet GetDataSet(string spName, string connectionStringKey)
        {
            DataSet ds = null;
            try
            {
                objDB = new SqlDatabase(ConfigurationManager.AppSettings[connectionStringKey].ToString());
                using (DbCommand objcmd = objDB.GetStoredProcCommand(spName))
                {
                    try
                    {
                        ds = objDB.ExecuteDataSet(objcmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return ds;

        }
        public DataSet GetDataSet(string spName, string connectionStringKey, Dictionary<string, object> parms)
        {
            DataSet ds = null;

            try
            {
                objDB = new SqlDatabase(ConfigurationManager.AppSettings[connectionStringKey].ToString());
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    foreach (var o in parms)
                    {
                        if (o.Value != null)
                        {
                            objDB.AddInParameter(cmd, o.Key, GetDBType(o.Value), o.Value);
                        }
                        else
                        {
                            objDB.AddInParameter(cmd, o.Key, DbType.String, DBNull.Value);
                        }
                    }

                    try
                    {
                        ds = objDB.ExecuteDataSet(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {

                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return ds;


        }
        public DataSet GetDataSet(string spName, string connectionStringKey, string parms, string parmValues)
        {
            DataSet ds = null;

            try
            {
                objDB = new SqlDatabase(ConfigurationManager.AppSettings[connectionStringKey].ToString());
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    if (!string.IsNullOrEmpty(parms) && !string.IsNullOrEmpty(parmValues))
                    {
                        if (parms.Contains("$"))
                        {
                            string[] prams = parms.Split('$');
                            string[] parmvalues = parmValues.Split('$');

                            for (int i = 0; i < prams.Length; i++)
                            {
                                var parameter = prams[i];

                                for (int j = 0; j < parmvalues.Length; j++)
                                {
                                    var parametervalue = parmvalues[i];

                                    if (!string.IsNullOrEmpty(parametervalue))
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    else
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    break;
                                }
                            }
                        }
                        else
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.CommandTimeout = 10000;
                            objDB.AddInParameter(cmd, parms, DbType.String, parmValues);
                        }
                    }

                    try
                    {
                        ds = objDB.ExecuteDataSet(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return ds;


        }

        public object ExecuteScalar(string spName)
        {
            object obj = null;
            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand objcmd = objDB.GetStoredProcCommand(spName))
                {
                    try
                    {
                        obj = objDB.ExecuteScalar(objcmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;

        }
        public object ExecuteScalar(string spName, Dictionary<string, object> parms)
        {
            object obj = null;

            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    foreach (var o in parms)
                    {
                        if (o.Value != null)
                        {
                            objDB.AddInParameter(cmd, o.Key, GetDBType(o.Value), o.Value);
                        }
                        else
                        {
                            objDB.AddInParameter(cmd, o.Key, DbType.String, DBNull.Value);
                        }
                    }

                    try
                    {
                        obj = objDB.ExecuteScalar(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {

                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;


        }
        public object ExecuteScalar(string spName, string parms, string parmValues)
        {
            object obj = null;

            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    if (!string.IsNullOrEmpty(parms) && !string.IsNullOrEmpty(parmValues))
                    {
                        if (parms.Contains("$"))
                        {
                            string[] prams = parms.Split('$');
                            string[] parmvalues = parmValues.Split('$');

                            for (int i = 0; i < prams.Length; i++)
                            {
                                var parameter = prams[i];

                                for (int j = 0; j < parmvalues.Length; j++)
                                {
                                    var parametervalue = parmvalues[i];

                                    if (!string.IsNullOrEmpty(parametervalue))
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    else
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    break;
                                }
                            }
                        }
                        else
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.CommandTimeout = 10000;
                            objDB.AddInParameter(cmd, parms, DbType.String, parmValues);
                        }
                    }

                    try
                    {
                        obj = objDB.ExecuteDataSet(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;


        }

        public object ExecuteScalar(string spName, string connectionStringKey)
        {
            object obj = null;
            try
            {
                objDB = new SqlDatabase(ConfigurationManager.AppSettings[connectionStringKey].ToString());
                using (DbCommand objcmd = objDB.GetStoredProcCommand(spName))
                {
                    try
                    {
                        obj = objDB.ExecuteScalar(objcmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;

        }
        public object ExecuteScalar(string spName, string connectionStringKey, Dictionary<string, object> parms)
        {
            object obj = null;

            try
            {
                objDB = new SqlDatabase(ConfigurationManager.AppSettings[connectionStringKey].ToString());
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    foreach (var o in parms)
                    {
                        if (o.Value != null)
                        {
                            objDB.AddInParameter(cmd, o.Key, GetDBType(o.Value), o.Value);
                        }
                        else
                        {
                            objDB.AddInParameter(cmd, o.Key, DbType.String, DBNull.Value);
                        }
                    }

                    try
                    {
                        obj = objDB.ExecuteScalar(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {

                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;


        }
        public object ExecuteScalar(string spName, string connectionStringKey, string parms, string parmValues)
        {
            object obj = null;

            try
            {
                objDB = new SqlDatabase(ConfigurationManager.AppSettings[connectionStringKey].ToString());
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    if (!string.IsNullOrEmpty(parms) && !string.IsNullOrEmpty(parmValues))
                    {
                        if (parms.Contains("$"))
                        {
                            string[] prams = parms.Split('$');
                            string[] parmvalues = parmValues.Split('$');

                            for (int i = 0; i < prams.Length; i++)
                            {
                                var parameter = prams[i];

                                for (int j = 0; j < parmvalues.Length; j++)
                                {
                                    var parametervalue = parmvalues[i];

                                    if (!string.IsNullOrEmpty(parametervalue))
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    else
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    break;
                                }
                            }
                        }
                        else
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.CommandTimeout = 10000;
                            objDB.AddInParameter(cmd, parms, DbType.String, parmValues);
                        }
                    }

                    try
                    {
                        obj = objDB.ExecuteDataSet(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;


        }

        public int ExecuteNonQuery(string spName)
        {
            int obj = 0;
            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand objcmd = objDB.GetStoredProcCommand(spName))
                {
                    try
                    {
                        obj = objDB.ExecuteNonQuery(objcmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;

        }
        public int ExecuteNonQuery(string spName, Dictionary<string, object> parms)
        {
            int obj;

            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    foreach (var o in parms)
                    {
                        if (o.Value != null)
                        {
                            objDB.AddInParameter(cmd, o.Key, GetDBType(o.Value), o.Value);
                        }
                        else
                        {
                            objDB.AddInParameter(cmd, o.Key, DbType.String, DBNull.Value);
                        }
                    }

                    try
                    {
                        obj = objDB.ExecuteNonQuery(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {

                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;


        }
        public int ExecuteNonQuery(string spName, string parms, string parmValues)
        {
            int obj;

            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    if (!string.IsNullOrEmpty(parms) && !string.IsNullOrEmpty(parmValues))
                    {
                        if (parms.Contains("$"))
                        {
                            string[] prams = parms.Split('$');
                            string[] parmvalues = parmValues.Split('$');

                            for (int i = 0; i < prams.Length; i++)
                            {
                                var parameter = prams[i];

                                for (int j = 0; j < parmvalues.Length; j++)
                                {
                                    var parametervalue = parmvalues[i];

                                    if (!string.IsNullOrEmpty(parametervalue))
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    else
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    break;
                                }
                            }
                        }
                        else
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.CommandTimeout = 10000;
                            objDB.AddInParameter(cmd, parms, DbType.String, parmValues);
                        }
                    }

                    try
                    {
                        obj = objDB.ExecuteNonQuery(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;


        }

        public int ExecuteNonQuery(string spName, string connectionStringKey)
        {
            int obj;
            try
            {
                objDB = new SqlDatabase(ConfigurationManager.AppSettings[connectionStringKey].ToString());
                using (DbCommand objcmd = objDB.GetStoredProcCommand(spName))
                {
                    try
                    {
                        obj = objDB.ExecuteNonQuery(objcmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;

        }
        public int ExecuteNonQuery(string spName, string connectionStringKey, Dictionary<string, object> parms)
        {
            int obj;

            try
            {
                objDB = new SqlDatabase(ConfigurationManager.AppSettings[connectionStringKey].ToString());
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    foreach (var o in parms)
                    {
                        if (o.Value != null)
                        {
                            objDB.AddInParameter(cmd, o.Key, GetDBType(o.Value), o.Value);
                        }
                        else
                        {
                            objDB.AddInParameter(cmd, o.Key, DbType.String, DBNull.Value);
                        }
                    }

                    try
                    {
                        obj = objDB.ExecuteNonQuery(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {

                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;


        }
        public int ExecuteNonQuery(string spName, string connectionStringKey, string parms, string parmValues)
        {
            int obj;

            try
            {
                objDB = new SqlDatabase(ConfigurationManager.AppSettings[connectionStringKey].ToString());
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    if (!string.IsNullOrEmpty(parms) && !string.IsNullOrEmpty(parmValues))
                    {
                        if (parms.Contains("$"))
                        {
                            string[] prams = parms.Split('$');
                            string[] parmvalues = parmValues.Split('$');

                            for (int i = 0; i < prams.Length; i++)
                            {
                                var parameter = prams[i];

                                for (int j = 0; j < parmvalues.Length; j++)
                                {
                                    var parametervalue = parmvalues[i];

                                    if (!string.IsNullOrEmpty(parametervalue))
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    else
                                        objDB.AddInParameter(cmd, parameter, DbType.String, parametervalue.Trim());
                                    break;
                                }
                            }
                        }
                        else
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.CommandTimeout = 10000;
                            objDB.AddInParameter(cmd, parms, DbType.String, parmValues);
                        }
                    }

                    try
                    {
                        obj = objDB.ExecuteNonQuery(cmd);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }

            return obj;


        }

        public int ExecuteNonQuery(string spName, Dictionary<string, object> parms, string outParm, out string outputValue)
        {
            int obj;
            string outputResultValue = "";
            try
            {
                objDB = new SqlDatabase(BaseConnectionString);
                using (DbCommand cmd = objDB.GetStoredProcCommand(spName))
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    foreach (var o in parms)
                    {
                        if (o.Value != null)
                        {
                            objDB.AddInParameter(cmd, o.Key, GetDBType(o.Value), o.Value);
                        }
                        else
                        {
                            objDB.AddInParameter(cmd, o.Key, DbType.String, DBNull.Value);
                        }
                    }
                    objDB.AddOutParameter(cmd, outParm, DbType.String, 200);

                    try
                    {
                        obj = objDB.ExecuteNonQuery(cmd);
                        outputResultValue = objDB.GetParameterValue(cmd, outParm).ToString();
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    finally
                    {

                    }
                }

            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                objDB = null;
            }
            outputValue = outputResultValue;
            return obj;
        }


        private DbType GetDBType(object dbvalue)
        {
            if (dbvalue.GetType() == typeof(string))
            {
                return DbType.String;
            }
            else if (dbvalue.GetType() == typeof(short))
            {
                return DbType.Int16;
            }
            else if (dbvalue.GetType() == typeof(bool))
            {
                return DbType.Boolean;
            }
            else if (dbvalue.GetType() == typeof(int))
            {
                return DbType.Int32;
            }
            else if (dbvalue.GetType() == typeof(long))
            {
                return DbType.Int64;
            }
            else if (dbvalue.GetType() == typeof(decimal))
            {
                return DbType.Decimal;
            }
            else if (dbvalue.GetType() == typeof(DateTime))
            {
                return DbType.DateTime;
            }
            else
            {
                return DbType.String;
            }

        }


    }
}
