/**
 * Master configuration for 15-Page Institute Inspection Flow.
 * Order of array determines navigation sequence (goNext / goBack).
 */
export const INSPECTION_FLOW_PAGES = [
    { pageCode: "InspectionCommittee", title: "Inspection Committee", route: "/Institute/InspectionCommittee" },
    { pageCode: "UnitsForInspection", title: "Units for Inspection", route: "/Institute/UnitsForInspection" },
    { pageCode: "BuildingDetails", title: "Building Details", route: "/Institute/BuildingDetails" },
    { pageCode: "Land", title: "Land Details", route: "/Institute/LandDetails" },
    { pageCode: "WorkshopDetails", title: "Workshop Details", route: "/Institute/WorkshopDetails" },
    { pageCode: "TrainingEquipmentDetails", title: "Training Equipment", route: "/Institute/TrainingEquipmentDetails" },
    { pageCode: "CommonFacility", title: "Common Facility", route: "/Institute/CommonFacilityDetails" }, 
    { pageCode: "Power", title: "Power Details", route: "/Institute/PowerDetails" },
    { pageCode: "Bank Account", title: "Bank Account", route: "/Institute/InstituteBank" },
    { pageCode: "InspectionFee", title: "Inspection Fee", route: "/Institute/InspectionFee" }
    
];
