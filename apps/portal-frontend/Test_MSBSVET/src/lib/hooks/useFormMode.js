import { useState } from "react";

export const useFormMode = (userTypeId) => {
    const hasEditPermission = canEdit(userTypeId);

    const [isViewMode, setIsViewMode] = useState(!hasEditPermission);

    const fieldsDisabled = !hasEditPermission || isViewMode;
    
    return {
        isViewMode,
        setIsViewMode,
        hasEditPermission,
        fieldsDisabled,
    };
};

const EDIT_PERMISSION_BY_USER_TYPE = {
    66: true,
    64: false,   
    81: false,  
    11: false,  
};

export const canEdit = (userTypeId) => {
    return EDIT_PERMISSION_BY_USER_TYPE[userTypeId] ?? false;
};