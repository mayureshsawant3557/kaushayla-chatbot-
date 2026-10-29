using System;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Portal.Data.Source
{
    public class Connection : IDisposable
    {
        private readonly string _connectionString;
        private SqlConnection? _sqlConnection;

        public Connection(string connectionString)
        {
            _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        }

        public SqlConnection GetConnection()
        {
            if (_sqlConnection == null || _sqlConnection.State == ConnectionState.Closed)
            {
                _sqlConnection = new SqlConnection(_connectionString);
                Console.WriteLine("✅ Database Connection Successful!");
            }
            return _sqlConnection;
        }

        public void Dispose()
        {
            if (_sqlConnection != null && _sqlConnection.State != ConnectionState.Closed)
            {
                _sqlConnection.Close();
                _sqlConnection.Dispose();
                Console.WriteLine("🔴 Database Connection Closed.");
            }
        }
    }
}