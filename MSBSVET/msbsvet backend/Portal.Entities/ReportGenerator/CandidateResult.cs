using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ReportGenerator
{
    public class CandidateResult
    {
        public int ID { get; set; }
        public long CandidateID { get; set; }
        public string ProfileNo { get; set; }
        public string CandidateName { get; set; }
        public string MotherName { get; set; }
        public DateTime DateofBirth { get; set; }
        public string Duration { get; set; }
        public string Examination { get; set; }
        public int ExaminationID { get; set; }
        public long ApplicationID { get; set; }
        public string ApplicationIDDisplay { get; set; }
        public string CandidatePhoto { get; set; }
        public string CandidateSign { get; set; }
        public string ResultStatus { get; set; }
        public decimal Percentage { get; set; }
        public string Grade { get; set; }
        public DateTime ResultDate { get; set; }
        public int TotalMarksMax { get; set; }
        public int TotalMarksMin { get; set; }
        public int TotalMarksObt { get; set; }
        public string QRcode { get; set; }
        public string MMYYY { get; set; }
        public string SRNO { get; set; }
        public long BatchID { get; set; }
        public DateTime BatchStartDate { get; set; }
        public DateTime BatchEndDate { get; set; }
        public int CourseID { get; set; }
        public string CourseNameCode { get; set; }
        public string CourseApprovedBy { get; set; }
        public string Sector { get; set; }
        public string SubSector { get; set; }
        public string CourseType { get; set; }
        public string NSQFLevel { get; set; }
        public string InstituteNameCode { get; set; }
        public string InstituteAddress { get; set; }
        public string City { get; set; }
        public string PinCode { get; set; }
        public string Taluka { get; set; }
        public string District { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public string IsResultFresh { get; set; }
        public string StatementMarksName { get; set; }
        public string StatementMarksDesignation { get; set; }
        public string StatementMarksSign { get; set; }
        public string CertificateMarksName { get; set; }
        public string CertificateMarksDesignation { get; set; }
        public string CertificateMarksSign { get; set; }
        public int GraceMarks { get; set; }
        public string GraceMarksSymbol { get; set; }
        public int InstituteID { get; set; }
        public string GenderCode { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
    }
}
