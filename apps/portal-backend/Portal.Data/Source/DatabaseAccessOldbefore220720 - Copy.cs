using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using Portal.Entities;

namespace Portal.Data.Source
{
    public  class DatabaseAccessold //partial
    {
        string _outErr = string.Empty;
//        public DataTable GetDataTable(string spName)
//        {
//            DataTable dt = new DataTable();
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
////                    // LoggingHelperFileDB.LogInfo("Connection Done " + spName);
//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            SqlDataReader dr = cmd.ExecuteReader(CommandBehavior.CloseConnection);
//                            dt.Load(dr);
//                            dr.Close();
//                            if (_conn.State == ConnectionState.Open)
//                            {
//                                _conn.Close();
//                            }
//                        }
//                    }
//                    catch (Exception ex)
//                    {
////                        // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                        {
//                            _conn.Close();
//                        }
//  //                      // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
////                // LoggingHelperFileDB.LogException(ex);
//                throw;
//            }

//            return dt;
//        }
//        public DataTable GetDataTable(string spName, Dictionary<string, object> parms)
//        {
//            DataTable dt = new DataTable();
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//    //                // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            foreach (var o in parms)
//                            {
//                                if (o.Value != null)
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, o.Value);
//                                }
//                                else
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, DBNull.Value);
//                                }
//                            }
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            SqlDataReader dr = cmd.ExecuteReader(CommandBehavior.CloseConnection);
//                            dt.Load(dr);
//                            dr.Close();
//                            if (_conn.State == ConnectionState.Open)
//                            {
//                                _conn.Close();
//                            }
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//  //                      // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();
//      //                  // LoggingHelperFileDB.LogInfo("Connection Closed");

//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//          //      // LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return dt;
//        }
//        public DataTable GetDataTable(string spName, string parms, string parmValues)
//        {
//            DataTable dt = new DataTable();
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                   // // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            if (!string.IsNullOrEmpty(parms) && !string.IsNullOrEmpty(parmValues))
//                            {
//                                if (parms.Contains("$"))
//                                {
//                                    string[] prams = parms.Split('$');
//                                    string[] parmvalues = parmValues.Split('$');

//                                    for (int i = 0; i < prams.Length; i++)
//                                    {
//                                        var parameter = prams[i];

//                                        for (int j = 0; j < parmvalues.Length; j++)
//                                        {
//                                            var parametervalue = parmvalues[i];

//                                            if (!string.IsNullOrEmpty(parametervalue))
//                                                cmd.Parameters.AddWithValue(parameter, parametervalue.Trim());
//                                            else
//                                                cmd.Parameters.AddWithValue(parameter, DBNull.Value);
//                                            break;
//                                        }
//                                    }
//                                }
//                                else
//                                {
//                                    cmd.CommandType = CommandType.StoredProcedure;
//                                    cmd.CommandTimeout = 1000;
//                                    cmd.Parameters.AddWithValue(parms, parmValues.Trim());
//                                }
//                            }
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            SqlDataReader dr = cmd.ExecuteReader(CommandBehavior.CloseConnection);
//                            dt.Load(dr);
//                            dr.Close();
//                            if (_conn.State == ConnectionState.Open)
//                            {
//                                _conn.Close();
//                            }
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                      //  // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();
//                        //// LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//            //    // LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return dt;
//        }

//        public DataSet GetDataSetByQuery(string sqlQuery)
//        {
//            DataSet ds = new DataSet();
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                  //  // LoggingHelperFileDB.LogInfo("Connection Done");

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = sqlQuery;
//                            cmd.CommandType = CommandType.Text;
//                            cmd.CommandTimeout = 10000;

//                            SqlDataAdapter da = new SqlDataAdapter(cmd);
//                            da.Fill(ds);
//                            if (_conn.State == ConnectionState.Open)
//                            {
//                                _conn.Close();
//                            }
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                       // // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                        {
//                            _conn.Close();
//                        }

//                       // // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//              //  // LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return ds;
//        }

//        public DataSet GetDataSet(string spName)
//        {
//            DataSet ds = new DataSet();
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                    // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            SqlDataAdapter da = new SqlDataAdapter(cmd);
//                            da.Fill(ds);
//                            if (_conn.State == ConnectionState.Open)
//                            {
//                                _conn.Close();
//                            }
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                      //  // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                        {
//                            _conn.Close();
//                        }

//                        //// LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                //// LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return ds;
//        }
//        public DataSet GetDataSet(string spName, Dictionary<string, object> parms)
//        {
//            DataSet ds = new DataSet();
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                   // // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            foreach (var o in parms)
//                            {
//                                if (o.Value != null)
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, o.Value);
//                                }
//                                else
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, DBNull.Value);
//                                }
//                            }

//                            SqlDataAdapter da = new SqlDataAdapter(cmd);
//                            da.Fill(ds);
//                            if (_conn.State == ConnectionState.Open)
//                            {
//                                _conn.Close();
//                            }
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                      //  // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();

//                       // // LoggingHelperFileDB.LogInfo("Connection Closed");

//                    }

//                }
//            }
//            catch (Exception ex)
//            {
//                //// LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return ds;
//        }
//        public DataSet GetDataSet(string spName, string parms, string parmValues)
//        {
//            DataSet ds = new DataSet();
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                   // // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            if (!string.IsNullOrEmpty(parms) && !string.IsNullOrEmpty(parmValues))
//                            {
//                                if (parms.Contains("$"))
//                                {
//                                    string[] prams = parms.Split('$');
//                                    string[] parmvalues = parmValues.Split('$');

//                                    for (int i = 0; i < prams.Length; i++)
//                                    {
//                                        var parameter = prams[i];

//                                        for (int j = 0; j < parmvalues.Length; j++)
//                                        {
//                                            var parametervalue = parmvalues[i];

//                                            if (!string.IsNullOrEmpty(parametervalue))
//                                                cmd.Parameters.AddWithValue(parameter, parametervalue.Trim());
//                                            else
//                                                cmd.Parameters.AddWithValue(parameter, DBNull.Value);
//                                            break;
//                                        }
//                                    }
//                                }
//                                else
//                                {
//                                    cmd.CommandType = CommandType.StoredProcedure;
//                                    cmd.CommandTimeout = 1000;
//                                    cmd.Parameters.AddWithValue(parms, parmValues.Trim());
//                                }
//                            }

//                            SqlDataAdapter da = new SqlDataAdapter(cmd);
//                            da.Fill(ds);

//                            if (_conn.State == ConnectionState.Open)
//                            {
//                                _conn.Close();
//                            }
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                       // // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();

//                      //  // LoggingHelperFileDB.LogInfo("Connection Closed");

//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                //// LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return ds;
//        }

//        public DataSet GetDataSet(string spName, string connectionStringName)
//        {
//            string connectionString = ConfigurationManager.ConnectionStrings[connectionStringName].ConnectionString;
//            DataSet ds = new DataSet();
//            try
//            {
//                using (SqlConnection _conn = new SqlConnection(connectionString))
//                {
//                 ///   // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;
//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();
//                            SqlDataAdapter da = new SqlDataAdapter(cmd);
//                            da.Fill(ds);

//                            if (_conn.State == ConnectionState.Open)
//                            {
//                                _conn.Close();
//                            }
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                      //  // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                        {
//                            _conn.Close();
//                            _conn.Dispose();
//                        }

//                       // // LoggingHelperFileDB.LogInfo("Connection Closed" + spName);
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                //// LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return ds;
//        }
//        public DataSet GetDataSet(string spName, string connectionStringName, Dictionary<string, object> parms)
//        {
//            string connectionString = ConfigurationManager.ConnectionStrings[connectionStringName].ConnectionString;
//            DataSet ds = new DataSet();
//            try
//            {
//                using (SqlConnection _conn = new SqlConnection(connectionString))
//                {
//                  ///  // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            foreach (var o in parms)
//                            {
//                                if (o.Value != null)
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, o.Value);
//                                }
//                                else
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, DBNull.Value);
//                                }
//                            }
//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();
//                            SqlDataAdapter da = new SqlDataAdapter(cmd);
//                            da.Fill(ds);

//                            if (_conn.State == ConnectionState.Open)
//                            {
//                                _conn.Close();
//                            }
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                       // // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();
////                        // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                //// LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return ds;
//        }
//        public DataSet GetDataSet(string spName, string connectionStringName, string parms, string parmValues)
//        {
//            string connectionString = ConfigurationManager.ConnectionStrings[connectionStringName].ConnectionString;
//            DataSet ds = new DataSet();
//            try
//            {
//                using (SqlConnection _conn = new SqlConnection(connectionString))
//                {
//                  //  // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            if (!string.IsNullOrEmpty(parms) && !string.IsNullOrEmpty(parmValues))
//                            {
//                                if (parms.Contains("$"))
//                                {
//                                    string[] prams = parms.Split('$');
//                                    string[] parmvalues = parmValues.Split('$');

//                                    for (int i = 0; i < prams.Length; i++)
//                                    {
//                                        var parameter = prams[i];

//                                        for (int j = 0; j < parmvalues.Length; j++)
//                                        {
//                                            var parametervalue = parmvalues[i];

//                                            if (!string.IsNullOrEmpty(parametervalue))
//                                                cmd.Parameters.AddWithValue(parameter, parametervalue.Trim());
//                                            else
//                                                cmd.Parameters.AddWithValue(parameter, DBNull.Value);
//                                            break;
//                                        }
//                                    }
//                                }
//                                else
//                                {
//                                    cmd.CommandType = CommandType.StoredProcedure;
//                                    cmd.CommandTimeout = 1000;
//                                    cmd.Parameters.AddWithValue(parms, parmValues.Trim());
//                                }
//                            }
                            
//                            SqlDataAdapter da = new SqlDataAdapter(cmd);
//                            da.Fill(ds);

//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();

//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                      //  // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();

//                        _conn.Dispose();

//                        //   // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//               // // LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return ds;
//        }

//        public object ExecuteScalar(string spName)
//        {
//            object obj = new object();
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                   // // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            obj = cmd.ExecuteScalar();


//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();

//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                       // // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();
//                       // // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                //// LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return obj;
//        }
//        public object ExecuteScalar(string spName, Dictionary<string, object> parms)
//        {
//            object obj = new object();

//            using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//            {
//                //// LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                try
//                {
//                    using (var cmd = _conn.CreateCommand())
//                    {
//                        cmd.CommandText = spName;
//                        cmd.CommandType = CommandType.StoredProcedure;
//                        cmd.CommandTimeout = 10000;

//                        foreach (var o in parms)
//                        {
//                            if (o.Value != null)
//                            {
//                                cmd.Parameters.AddWithValue(o.Key, o.Value);
//                            }
//                            else
//                            {
//                                cmd.Parameters.AddWithValue(o.Key, DBNull.Value);
//                            }
//                        }
//                        if (_conn.State == ConnectionState.Closed)
//                            _conn.Open();
//                        obj = cmd.ExecuteScalar();

//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();


//                    }
//                }
//                catch (Exception ex)
//                {
//                  //  // LoggingHelperFileDB.LogException(ex);
//                    throw;
//                }
//                finally
//                {
//                    if (_conn.State == ConnectionState.Open)
//                        _conn.Close();
//                    // // LoggingHelperFileDB.LogInfo("Connection Closed");
//                }
//            }

//            return obj;
//        }

//        public object ExecuteScalar(string spName, string connectionString)
//        {
//            object obj = new object();
//            try
//            {
//                using (SqlConnection _conn = new SqlConnection(connectionString))
//                {
//                    // // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            obj = cmd.ExecuteScalar();

//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();

//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                       // // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();

//                        _conn.Dispose();

//                        //   // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//              //  // LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return obj;
//        }
//        public object ExecuteScalar(string spName, Dictionary<string, object> parms, string connectionString)
//        {
//            object obj = new object();
//            try
//            {
//                using (SqlConnection _conn = new SqlConnection(connectionString))
//                {
//                  //  // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            foreach (var o in parms)
//                            {
//                                if (o.Value != null)
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, o.Value);
//                                }
//                                else
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, DBNull.Value);
//                                }
//                            }
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            obj = cmd.ExecuteScalar();

//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();


//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                    //    // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();
//                        _conn.Dispose();

//                        //  // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//             //   // LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return obj;
//        }

//        public int ExecuteNonQuery(string spName)
//        {
//            int result = 0;
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                   /// // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            result = (int)cmd.ExecuteNonQuery();

//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();

//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                        result = -10;
//                      //  // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();

//                      ///  // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                ///// LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return result;
//        }
//        public int ExecuteNonQuery(string spName, Dictionary<string, object> parms)
//        {
//            int result = 0;
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                //    // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            foreach (var o in parms)
//                            {
//                                if (o.Value != null)
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, o.Value);
//                                }
//                                else
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, DBNull.Value);
//                                }
//                            }
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            result = (int)cmd.ExecuteNonQuery();

//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();

//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                        result = -10;
//                //        // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();

//                //        // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                //// LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return result;
//        }
//        public int ExecuteNonQuery(string spName, Dictionary<string, object> parms, string outParm, out string outputValue)
//        {
//            int result = 0;
//            string outputResultValue = "";
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                    // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            foreach (var o in parms)
//                            {
//                                if (o.Value != null)
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, o.Value);
//                                }
//                                else
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, DBNull.Value);
//                                }
//                            }

//                            var outputIdParam = new SqlParameter(outParm, SqlDbType.NVarChar)
//                            {
//                                Direction = ParameterDirection.Output,
//                                Size = 150
//                            };

//                            cmd.Parameters.Add(outputIdParam);
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            result = (int)cmd.ExecuteNonQuery();

//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();

//                            outputResultValue = $"{outputIdParam.Value}";

                            
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                        result = -10;
//                        // LoggingHelperFileDB.LogException(ex);
//                        throw;

//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();

//                        // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//       //         // LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            outputValue = outputResultValue;
//            return result;
//        }
//        public int ExecuteNonQuery(string spName, Dictionary<string, object> parms, List<string> outParmValueList, out List<string> outputResultList)
//        {

//            int result = 0;
//            outputResultList = new List<string>();
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                    // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            foreach (var o in parms)
//                            {
//                                if (o.Value != null)
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, o.Value);
//                                }
//                                else
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, DBNull.Value);
//                                }
//                            }

//                            foreach (var outParm in outParmValueList)
//                            {
//                                if (!string.IsNullOrEmpty(outParm))
//                                {
//                                    var outputIdParam = new SqlParameter(outParm, SqlDbType.NVarChar, 200)
//                                    {
//                                        Direction = ParameterDirection.Output,
//                                    };
//                                    cmd.Parameters.Add(outputIdParam);
//                                }
//                            }
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            result = (int)cmd.ExecuteNonQuery();

//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();

//                            foreach (var outParm in outParmValueList)
//                            {
//                                if (!string.IsNullOrEmpty(outParm))
//                                {
//                                    outputResultList.Add($"{outParm}");
//                                }
//                            }
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                        result = -10;
//                        // LoggingHelperFileDB.LogException(ex);
//                        throw;

//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();

//                        // LoggingHelperFileDB.LogInfo("Connection Closed");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//         //       // LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return result;
//        }
//        public int ExecuteNonQuery(string spName, Dictionary<string, object> parms, DataTable dt, string dtParameterName)
//        {
//            int result = 0;
//            try
//            {
//                using (SqlConnection _conn = Connection.Singleton.SqlConnetionFactory)
//                {
//                    // LoggingHelperFileDB.LogInfo("Connection Done" + spName);

//                    try
//                    {
//                        using (var cmd = _conn.CreateCommand())
//                        {
//                            cmd.CommandText = spName;
//                            cmd.CommandType = CommandType.StoredProcedure;
//                            cmd.CommandTimeout = 10000;

//                            foreach (var o in parms)
//                            {
//                                if (o.Value != null)
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, o.Value);
//                                }
//                                else
//                                {
//                                    cmd.Parameters.AddWithValue(o.Key, DBNull.Value);
//                                }
//                            }

//                            SqlParameter tableParameter = new SqlParameter(dtParameterName, dt);
//                            tableParameter.SqlDbType = SqlDbType.Structured;
//                            cmd.Parameters.Add(tableParameter);
//                            if (_conn.State == ConnectionState.Closed)
//                                _conn.Open();
//                            result = (int)cmd.ExecuteNonQuery();

//                            if (_conn.State == ConnectionState.Open)
//                                _conn.Close();

//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                        result = -10;
//                        // LoggingHelperFileDB.LogException(ex);
//                        throw;
//                    }
//                    finally
//                    {
//                        if (_conn.State == ConnectionState.Open)
//                            _conn.Close();

//                        // LoggingHelperFileDB.LogInfo("Connection Closed");

//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//           //     // LoggingHelperFileDB.LogException(ex);
//                throw;
//            }
//            return result;
//        }
    }
}
