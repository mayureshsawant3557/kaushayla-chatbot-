using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class TrainingEquipmentListEntity
    {
        public Int64 InstituteId { get; set; }
        public Int64 CourseID { get; set; }
        public string CourseCode { get; set; }
        public string Course { get; set; }
        public int EquipmentId { get; set; }
        public string EquipmentName { get; set; }
        public int EquipmentCategoryId { get; set; }
       public string EquipmentCategory { get; set; }
        public string UtilizationRemarks { get; set; }
        public bool IsDsrItem { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsAlliedCourseItem { get; set; }
        public bool IsMouItem { get; set; }
        public int RequiredPerUnit { get; set; }
        public int RequiredEquipmentForApprovedUnits { get; set; }
        public int RequiredEquipmentForProposedUnits { get; set; }
        public int RequiredEquipmentForTotalUnits { get; set; }
        public Int32 AvailableEquipments { get; set; }
        public string EquipmentStatus { get; set; }
        public bool IsEditAllowed { get; set; }
        public bool IsDeleteAllowed { get; set; }

        public string MOUPath { get; set; }
        public Int16 IsCourseMOU { get; set; }
        public Int16 Remark { get; set; }

        public Int16 DistanceBetweenInstituteAndMOU { get; set; }  //added 


        public string UserLoginId { get; set; }
        public string PageCode { get; set; }
        public string IPAddress { get; set; }

         public List<TraningEquipmentPhotoEntity> lstEquipmentPhoto { get; set; }
        public TrainingEquipmentListEntity()
        {
            lstEquipmentPhoto = new List<TraningEquipmentPhotoEntity>();
        }


    }
    public class TraningEquiplemntEntity
    {
        public List<TrainingEquipmentListEntity> lstTrainingEquipmentListEntity { get; set; }
        public List<TraningEquipmentPhotoEntity> lstEquipmentPhoto { get; set; }
        public TraningEquiplemntEntity()
        {
            lstEquipmentPhoto = new List<TraningEquipmentPhotoEntity>();
            lstTrainingEquipmentListEntity = new List<TrainingEquipmentListEntity>();
        }
    }
}
