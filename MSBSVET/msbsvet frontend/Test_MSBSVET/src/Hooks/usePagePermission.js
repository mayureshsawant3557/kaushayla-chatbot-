// import { useAuth } from "./AuthContext";

// const VIEWER_USER_TYPE = 501;
// const INSPECTION_USER_TYPE = 81;

// export const usePagePermission = () => {
//     const { userInfo } = useAuth();

//     const userTypeID = Number(userInfo?.UserTypeID);

//     const isViewer = userTypeID === VIEWER_USER_TYPE;
//     const isInspectionUser = userTypeID === INSPECTION_USER_TYPE;

//     return {
//         userTypeID,

//         User types
//         isViewer,
//         isInspectionUser,

//         General permissions
//         canView: true,
//         canEdit: !isViewer,
//         canAdd: !isViewer,
//         canDelete: !isViewer,
//         canSave: !isViewer,
//         canUpdateStatus: !isViewer,

//         Useful for workflow
//         isReadOnly: isViewer,
//         isEditMode: !isViewer,
//     };
// };

import { useAuth } from "./AuthContext";

/**
 * Central permission layer for the inspection flow.
 * Determines capabilities based on UserTypeID:
 *  - 14: DVETO permissions
 *  - 64: Institute permissions
 *  - 81: Board permissions
 *  - 501: View-only mode (isViewer = true, canEdit = false, canSave = false)
 */
export const usePagePermission = () => {
    const { userInfo } = useAuth();
    const userTypeID = Number(userInfo?.UserTypeID);

    const isViewer = userTypeID === 501;

    return {
        userTypeID,
        isViewer,
        isReadOnly: isViewer,
        canView: true,
        canEdit: !isViewer,
        canSave: !isViewer,
        canDelete: !isViewer,
        canUpdate: !isViewer,
        canUpdateStatus: [14, 81].includes(userTypeID),
    };
};
