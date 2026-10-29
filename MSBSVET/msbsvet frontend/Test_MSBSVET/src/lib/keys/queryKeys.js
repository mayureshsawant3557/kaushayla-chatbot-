export const instituteKeys = {
    instituteId: (instituteCode) => ['institute', 'id', instituteCode],
    promotingOrgId: (instituteId) => ['institute', 'promoting-org', instituteId],
    associatedInstitutes: (promotorOrgId) => ['associated-institutes', promotorOrgId]
};