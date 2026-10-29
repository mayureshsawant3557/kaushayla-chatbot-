import { baseURL } from "../config/baseConfig";

export const GetPromotingOrganisationDetails =
    `${baseURL}/api/PromotionalOrganisation/GetPromotingOrganisationDetails`;

export const GetPromoterDetailsByInstituteID =
    `${baseURL}/api/PromotionalOrganisation/GetPromoterDetailsByInstituteID`;

export const GetAssociatedInstituteByPromotingOrganisationID =
    `${baseURL}/api/PromotionalOrganisation/GetAssociatedInstituteByPromotingOrganisationID`;

export const PromotingOrganizationDashboardRejectStatusCounts = ({
    tableName = "Dev",
    promotingOrganisationId,
    statusParam = "R",
}) =>
    `${baseURL}/api/PromotionalOrganisation/PromotingOrganizationDashboardRejectStatusCounts?tableName=${tableName}&promotingOrganisationId=${promotingOrganisationId}&statusParam=${statusParam}`;

export const GetStatusProposedOrganisation = (proposedOrganisationId) =>
    `${baseURL}/api/PromotionalOrganisation/GetStatusProposedOrganisation/${proposedOrganisationId}`;

export const UpdateProposedOrganisationStatus = ({
    proposedOrganisationId,
    userLoginId,
    ipAddress,
    statusCode,
}) =>
    `${baseURL}/api/PromotionalOrganisation/UpdateProposedOrganisationStatus?proposedOrganisationId=${proposedOrganisationId}&userLoginId=${userLoginId}&ipAddress=${ipAddress}&statusCode=${statusCode}`;

export const SavePromotionalOrganisationDetailsVerification =
    `${baseURL}/api/PromotionalOrganisation/SavePromotionalOrganisationDetailsVerification`;

export const GetMasterPromotingType =
    `${baseURL}/Base/GetMasterPromotingType`;

export const GetMasterPromoterStatus =
    `${baseURL}/Base/GetMasterPromoterStatus`;

export const Delete_PromoterStaffMappingDetails =
    `${baseURL}/api/PromotionalOrganisation/Delete_PromoterStaffMappingDetails`;

export const Update_PromoterStaffMappingDetails =
    `${baseURL}/api/PromotionalOrganisation/Update_PromoterStaffMappingDetails`;

export const Update_AssociatedInstituteMappingDetails =
    `${baseURL}/api/PromotionalOrganisation/Update_AssociatedInstituteMappingDetails`;