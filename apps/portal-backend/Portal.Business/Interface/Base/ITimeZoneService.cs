namespace Portal.Business.Interface.Base;

public interface ITimeZoneService
{
    DateTime GetCurrentIstDateTime();
    DateTime GetCurrentIstDate();
    string GetCurrentIstDateTimeString(string format = "dd/MM/yyyy hh:mm:ss tt");
    string GetCurrentIstDateString(string format = "dd/MM/yyyy");

    DateTime ConvertUtcToIst(DateTime utcDateTime);
    DateTime ConvertIstToUtc(DateTime istDateTime);
    DateTime ConvertBetweenTimeZones(DateTime dateTime, string fromTimeZoneId, string toTimeZoneId);

    DateTime? ConvertDateStringToDateTime(string strDate, string format = "yyyy-MM-dd");
    bool TryParseDateString(string strDate, out DateTime result, string format = "yyyy-MM-dd");
    string ConvertDateTimeToDateString(DateTime? dtDate, string format = "dd/MM/yyyy");

    DateTime? ConvertDateTimeStringToDateTime(string strDate, string inputFormat = "dd-MM-yyyy HH:mm:ss", string outputFormat = "MM-dd-yyyy HH:mm:ss");
    string ConvertDateTimeToDateTimeString(DateTime? dateTime, string outputFormat = "dd/MM/yyyy HH:mm:ss");

    bool IsDateValid(DateTime dtDate);
    bool IsDateInPast(DateTime date);
    bool IsDateInFuture(DateTime date);
    bool IsToday(DateTime date);

    int CalculateAge(DateTime birthDate);
    int GetDaysBetween(DateTime startDate, DateTime endDate);
    DateTime AddBusinessDays(DateTime startDate, int businessDays);

    TimeZoneInfo GetIstTimeZone();
    TimeSpan GetIstUtcOffset();
    bool IsValidTimeZoneId(string timeZoneId);
}