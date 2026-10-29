using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ElectionDuty
{
    // ── Request entity for Save ──────────────────────────────
    public class ElectionDutyStaffEntity
    {
        public int UserID { get; set; }

        public int StaffID { get; set; }
        public string Designation { get; set; }
        public string CreatedBy { get; set; }
        public string IPAddress { get; set; }
        public List<ElectionDutyDeputationEntity> Deputations { get; set; }
            = new List<ElectionDutyDeputationEntity>();
    }

    // ── Single deputation period ─────────────────────────────
    public class ElectionDutyDeputationEntity
    {
        public int DeputationID { get; set; }  // used in Update
        public string DeputationFrom { get; set; }  // dd/mm/yyyy
        public string DeputationTo { get; set; }  // dd/mm/yyyy
        public int DistrictID { get; set; }
        public string District { get; set; }
        public int ConstituencyID { get; set; }
        public string Constituency { get; set; }
        public string NatureOfDeputation { get; set; }  // Full Time | Part Time
        public string ModifiedBy { get; set; }
        public string IPAddress { get; set; }
    }

    // ── Response entity for Get List ─────────────────────────
    public class ElectionDutyListEntity
    {
        public int ElectionDutyStaffID { get; set; }
        public int StaffID { get; set; }
        public string ProfileID { get; set; }
        public string Title { get; set; }
        public string FullName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string MobileNo { get; set; }
        public string EMailID { get; set; }
        public string GenderCode { get; set; }
        public string Designation { get; set; }
        public int DeputationID { get; set; }
        public string DeputationFrom { get; set; }
        public string DeputationTo { get; set; }
        public int DistrictID { get; set; }
        public string District { get; set; }
        public int ConstituencyID { get; set; }
        public string Constituency { get; set; }
        public string NatureOfDeputation { get; set; }
        public string AssigenedByAuthority { get; set; }
    }

    // ── Constituency dropdown entity ─────────────────────────
    public class ConstituencyEntity
    {
        public int Value { get; set; }
        public string Text { get; set; }
        public string ConstituencyMarathi { get; set; }
    }

    // ── Delete request entities ──────────────────────────────
    public class DeleteElectionDutyStaffEntity
    {
        public int ElectionDutyStaffID { get; set; }
        public string DeletedBy { get; set; }
        public string IPAddress { get; set; }
    }

    public class DeleteElectionDutyDeputationEntity
    {
        public int DeputationID { get; set; }
        public string DeletedBy { get; set; }
        public string IPAddress { get; set; }
    }
}