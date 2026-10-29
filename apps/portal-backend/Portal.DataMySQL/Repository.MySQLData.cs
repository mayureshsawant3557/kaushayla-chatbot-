using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading.Tasks;
using MySql.Data.MySqlClient;


namespace Portal.DataMySQL
{
    public class MySQLData
    {
        public DataTable GetBatchData()
        {
            string connString = "Server=dbiwbms.mysql.database.azure.com;Database=iwbms_prod;Uid=msbvet;Pwd=sD@wrW42a;";

            // The SQL query to select data from the MySQL view
            string query = "SELECT * FROM iwbms_prod.sds_assessment_agency_view";
            DataTable dt = new DataTable();
            // Create a MySQL connection
            using (MySqlConnection conn = new MySqlConnection(connString))
            {
                try
                {
                    // Open the connection
                    conn.Open();

                    // Create a command to execute the query
                    MySqlDataAdapter adapter = new MySqlDataAdapter(query, conn);

                    // Execute the command and retrieve data
                    adapter.Fill(dt);

                    // Loop through the result set and print each record


                    // Close the reader
                    //reader.Close();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    conn.Close();
                }
                return dt;
            }
        }
    }
}
