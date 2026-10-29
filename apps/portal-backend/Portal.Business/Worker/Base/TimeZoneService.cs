using Portal.Business.Interface.Base;
using System;
using System.Globalization;

namespace Portal.Business.Worker.Base;

public class TimeZoneService : ITimeZoneService
{
    private readonly TimeZoneInfo _istTimeZone;
    private static readonly DateTime MinValidDate = new DateTime(1900, 1, 1);
    private static readonly DateTime MaxValidDate = new DateTime(2100, 12, 31);

    // Common date formats for parsing
    private static readonly string[] CommonDateFormats = new[]
    {
        "dd-MM-yyyy",
        "dd/MM/yyyy",
        "dd-MM-yyyy HH:mm",
        "dd/MM/yyyy HH:mm",
        "dd-MM-yyyy HH:mm:ss",
        "dd/MM/yyyy HH:mm:ss",
    };

    public TimeZoneService()
    {
        _istTimeZone = InitializeIstTimeZone();
    }

    private TimeZoneInfo InitializeIstTimeZone()
    {
        try
        {
            // Try Windows timezone ID first
            return TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
        }
        catch (TimeZoneNotFoundException)
        {
            try
            {
                // Try Linux/Mac timezone ID
                return TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");
            }
            catch (TimeZoneNotFoundException)
            {
                // Fallback: Create custom IST timezone (UTC+5:30)
                return TimeZoneInfo.CreateCustomTimeZone(
                    "IST",
                    new TimeSpan(5, 30, 0),
                    "India Standard Time",
                    "India Standard Time"
                );
            }
        }
    }

    public DateTime GetCurrentIstDateTime()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _istTimeZone);
    }
    public DateTime GetCurrentIstDate()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _istTimeZone).Date;
    }
    public string GetCurrentIstDateTimeString(string format = "dd/MM/yyyy hh:mm:ss tt")
    {
        if (string.IsNullOrWhiteSpace(format))
        {
            format = "dd/MM/yyyy hh:mm:ss tt";
        }

        var istDateTime = GetCurrentIstDateTime();

        try
        {
            return istDateTime.ToString(format, CultureInfo.InvariantCulture);
        }
        catch (FormatException ex)
        {
            throw new FormatException($"Invalid date format string: {format}", ex);
        }
    }
    public string GetCurrentIstDateString(string format = "dd/MM/yyyy")
    {
        if (string.IsNullOrWhiteSpace(format))
        {
            format = "dd/MM/yyyy";
        }

        var istDate = GetCurrentIstDate();

        try
        {
            return istDate.ToString(format, CultureInfo.InvariantCulture);
        }
        catch (FormatException ex)
        {
            throw new FormatException($"Invalid date format string: {format}", ex);
        }
    }

    public DateTime ConvertUtcToIst(DateTime utcDateTime)
    {
        if (utcDateTime.Kind != DateTimeKind.Utc)
        {
            // If not explicitly UTC, treat as UTC
            utcDateTime = DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);
        }

        return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, _istTimeZone);
    }
    public DateTime ConvertIstToUtc(DateTime istDateTime)
    {
        // Convert IST to UTC
        return TimeZoneInfo.ConvertTimeToUtc(istDateTime, _istTimeZone);
    }
    public DateTime ConvertBetweenTimeZones(DateTime dateTime, string fromTimeZoneId, string toTimeZoneId)
    {
        if (string.IsNullOrWhiteSpace(fromTimeZoneId))
        {
            throw new ArgumentNullException(nameof(fromTimeZoneId));
        }

        if (string.IsNullOrWhiteSpace(toTimeZoneId))
        {
            throw new ArgumentNullException(nameof(toTimeZoneId));
        }

        try
        {
            var fromTimeZone = TimeZoneInfo.FindSystemTimeZoneById(fromTimeZoneId);
            var toTimeZone = TimeZoneInfo.FindSystemTimeZoneById(toTimeZoneId);

            // Convert to UTC first, then to target timezone
            var utcTime = TimeZoneInfo.ConvertTimeToUtc(dateTime, fromTimeZone);
            return TimeZoneInfo.ConvertTimeFromUtc(utcTime, toTimeZone);
        }
        catch (TimeZoneNotFoundException ex)
        {
            throw new ArgumentException($"Invalid timezone ID: {ex.Message}", ex);
        }
    }

    public DateTime? ConvertDateStringToDateTime(string strDate, string format = "dd/MM/yyyy")
    {
        if (string.IsNullOrWhiteSpace(strDate))
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(format))
        {
            format = "dd/MM/yyyy";
        }

        try
        {
            DateTime result;

            // Try exact format first
            if (DateTime.TryParseExact(strDate, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
            {
                return result;
            }

            // Try common formats
            if (DateTime.TryParseExact(strDate, CommonDateFormats, CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
            {
                return result;
            }

            // Try general parsing as last resort
            if (DateTime.TryParse(strDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
            {
                return result;
            }

            return null;
        }
        catch
        {
            return null;
        }
    }
    public bool TryParseDateString(string strDate, out DateTime result, string format = "dd/MM/yyyy")
    {
        result = default(DateTime);

        if (string.IsNullOrWhiteSpace(strDate))
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(format))
        {
            format = "dd/MM/yyyy";
        }

        try
        {
            // Try exact format first
            if (DateTime.TryParseExact(strDate, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
            {
                return IsDateValid(result);
            }

            // Try common formats
            if (DateTime.TryParseExact(strDate, CommonDateFormats, CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
            {
                return IsDateValid(result);
            }

            // Try general parsing
            if (DateTime.TryParse(strDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
            {
                return IsDateValid(result);
            }

            return false;
        }
        catch
        {
            result = default(DateTime);
            return false;
        }
    }
    public string ConvertDateTimeToDateString(DateTime? dtDate, string format = "dd/MM/yyyy")
    {
        if (dtDate == null || !IsDateValid(dtDate.Value))
            return "";

        if (string.IsNullOrWhiteSpace(format))
        {
            format = "dd/MM/yyyy";
        }

        try
        {
            return dtDate.Value.ToString(format, CultureInfo.InvariantCulture);
        }
        catch
        {
            return "";
        }
    }

    public DateTime? ConvertDateTimeStringToDateTime(string strDate, string inputFormat = "dd/MM/yyyy HH:mm:ss", string outputFormat = "MM/dd/yyyy HH:mm:ss")
    {
        if (string.IsNullOrWhiteSpace(strDate))
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(inputFormat))
        {
            inputFormat = "dd/MM/yyyy HH:mm:ss";
        }

        if (string.IsNullOrWhiteSpace(outputFormat))
        {
            outputFormat = "MM/dd/yyyy HH:mm:ss";
        }

        try
        {
            DateTime result;

            if (DateTime.TryParseExact(strDate, inputFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
            {
                string reformatted = result.ToString(outputFormat, CultureInfo.InvariantCulture);
                if (DateTime.TryParseExact(reformatted, outputFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime finalResult))
                {
                    return finalResult;
                }
                return result;
            }

            if (DateTime.TryParseExact(strDate, CommonDateFormats, CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
            {
                string reformatted = result.ToString(outputFormat, CultureInfo.InvariantCulture);
                if (DateTime.TryParseExact(reformatted, outputFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime finalResult))
                {
                    return finalResult;
                }
                return result;
            }

            if (DateTime.TryParse(strDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
            {
                string reformatted = result.ToString(outputFormat, CultureInfo.InvariantCulture);
                if (DateTime.TryParseExact(reformatted, outputFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime finalResult))
                {
                    return finalResult;
                }
                return result;
            }

            return null;
        }
        catch
        {
            return null;
        }
    }
    public string ConvertDateTimeToDateTimeString(DateTime? dateTime, string outputFormat = "dd/MM/yyyy HH:mm:ss")
    {
        if (dateTime == null)
        {
            return "";
        }

        if (string.IsNullOrWhiteSpace(outputFormat))
        {
            outputFormat = "dd/MM/yyyy HH:mm:ss";
        }

        try
        {
            return dateTime.Value.ToString(outputFormat, CultureInfo.InvariantCulture);
        }
        catch
        {
            return "";
        }
    }

    public bool IsDateValid(DateTime dtDate)
    {
        // Check if date is not default/minimum value
        if (dtDate == default(DateTime) || dtDate == DateTime.MinValue || dtDate == DateTime.MaxValue)
        {
            return false;
        }

        // Check if date is within reasonable range
        if (dtDate < MinValidDate || dtDate > MaxValidDate)
        {
            return false;
        }

        // Additional validation: check if it's a valid calendar date
        try
        {
            var year = dtDate.Year;
            var month = dtDate.Month;
            var day = dtDate.Day;

            // Verify the date components are valid
            if (year < 1900 || year > 2100)
                return false;

            if (month < 1 || month > 12)
                return false;

            if (day < 1 || day > DateTime.DaysInMonth(year, month))
                return false;

            return true;
        }
        catch
        {
            return false;
        }
    }
    public bool IsDateInPast(DateTime date)
    {
        if (!IsDateValid(date))
        {
            return false;
        }

        var currentIstDate = GetCurrentIstDate();
        return date.Date < currentIstDate;
    }
    public bool IsDateInFuture(DateTime date)
    {
        if (!IsDateValid(date))
        {
            return false;
        }

        var currentIstDate = GetCurrentIstDate();
        return date.Date > currentIstDate;
    }
    public bool IsToday(DateTime date)
    {
        if (!IsDateValid(date))
        {
            return false;
        }

        var currentIstDate = GetCurrentIstDate();
        return date.Date == currentIstDate;
    }

    public int CalculateAge(DateTime birthDate)
    {
        if (!IsDateValid(birthDate))
        {
            throw new ArgumentException("Invalid birth date", nameof(birthDate));
        }

        var today = GetCurrentIstDate();

        if (birthDate > today)
        {
            throw new ArgumentException("Birth date cannot be in the future", nameof(birthDate));
        }

        int age = today.Year - birthDate.Year;

        // Adjust if birthday hasn't occurred this year
        if (birthDate.Date > today.AddYears(-age))
        {
            age--;
        }

        return age;
    }
    public int GetDaysBetween(DateTime startDate, DateTime endDate)
    {
        if (!IsDateValid(startDate))
        {
            throw new ArgumentException("Invalid start date", nameof(startDate));
        }

        if (!IsDateValid(endDate))
        {
            throw new ArgumentException("Invalid end date", nameof(endDate));
        }

        TimeSpan difference = endDate.Date - startDate.Date;
        return Math.Abs(difference.Days);
    }
    public DateTime AddBusinessDays(DateTime startDate, int businessDays)
    {
        if (!IsDateValid(startDate))
        {
            throw new ArgumentException("Invalid start date", nameof(startDate));
        }

        if (businessDays == 0)
        {
            return startDate;
        }

        int direction = businessDays > 0 ? 1 : -1;
        int daysToAdd = Math.Abs(businessDays);
        DateTime currentDate = startDate;

        while (daysToAdd > 0)
        {
            currentDate = currentDate.AddDays(direction);

            // Skip weekends
            if (currentDate.DayOfWeek != DayOfWeek.Saturday &&
                currentDate.DayOfWeek != DayOfWeek.Sunday)
            {
                daysToAdd--;
            }
        }

        return currentDate;
    }

    public TimeZoneInfo GetIstTimeZone()
    {
        return _istTimeZone;
    }
    public TimeSpan GetIstUtcOffset()
    {
        return _istTimeZone.BaseUtcOffset;
    }
    public bool IsValidTimeZoneId(string timeZoneId)
    {
        if (string.IsNullOrWhiteSpace(timeZoneId))
        {
            return false;
        }

        try
        {
            TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return true;
        }
        catch (TimeZoneNotFoundException)
        {
            return false;
        }
        catch (InvalidTimeZoneException)
        {
            return false;
        }
    }
}