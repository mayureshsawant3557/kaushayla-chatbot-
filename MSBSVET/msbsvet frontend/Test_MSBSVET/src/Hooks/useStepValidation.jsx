// File: hooks/useStepValidation.js

import { useState, useEffect, useCallback } from 'react';
import agent from '../lib/api/agent';
import Swal from 'sweetalert2';
import { IsStaffFormLocked, IsCandidateFormLocked } from '../Endpoints_All/Base/formLock'
import { baseURL } from '../Endpoints_All/Config/baseConfig'
import { useSearchParams } from "react-router-dom";
import { useAuth } from './AuthContext';
//import axiosInstance, { isAuthenticated, getCurrentUser } from '../Hooks/jwtaxiosInstance';
export const useStepValidation = () => {
    const [currentStepId, setCurrentStepId] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
     const {userInfo} = useAuth();

    // Get user info from session storage
    const userTypeID = userInfo?.UserTypeID;
    const [searchParams] = useSearchParams();

    const candidateIdFromUrl = searchParams.get("candidateId");


    // Institute opening candidate form should behave like Candidate
    const isStaff =
        !candidateIdFromUrl &&
        userTypeID === 95;

    const formType = isStaff ? "Staff" : "Candidate";

    const userID =
        candidateIdFromUrl ||
        userInfo?.UserID;
    
    // Progress sections definition with step numbers
    const allProgressSections = [
        { id: 'primary', label: 'Primary', number: 1, route: `/${formType}/Primary` },
        { id: 'address', label: 'Address', number: 2, route: `/${formType}/Address` },
        { id: 'parent', label: 'Parent', number: 3, route: `/${formType}/Parent` },
        { id: 'category', label: 'Category', number: 4, route: `/${formType}/Category` },
        { id: 'qualification', label: 'Qualification', number: 5, route: `/${formType}/Qualification` },
        { id: 'training', label: 'Training', number: 6, route: `/${formType}/Training` },
        { id: 'additional', label: 'Additional', number: 7, route: `/${formType}/Additional` },
        { id: 'bank', label: 'Bank', number: 8, route: `/${formType}/Bank` },
        { id: 'work-experience', label: 'Work Experience', number: 9, route: `/${formType}/WorkExperience` },
        { id: 'verify', label: 'Verify', number: 10, route: `/${formType}/LockApplicationForm` },
        { id: 'apply', label: 'Apply', number: 11, route: '/Candidate/MainCourseAdmissionApply' },
        { id: 'admission-letter', label: 'Admission Letter', number: 12, route: '/admission-letter' },
    ];

    // Fetch current step ID from API
    const fetchCurrentStepId = useCallback(async () => {
        const userTypeID = userInfo?.UserTypeID;
        if (
            userTypeID === 91 ||
            userTypeID === 95 ||
            candidateIdFromUrl
        ) {
            if (!userID) {
                setIsLoading(false);
                return null;
            }

            try {
                setIsLoading(true);
                setError(null);

                const url = `${baseURL}/Base/Get${formType}StepID?${formType}ID=${userID}`;

                const response = await agent.get(url);

                if (response.data && response.data.Status === "Success") {
                    const stepId = response.data.Data;
                    setCurrentStepId(stepId);
                    return stepId;
                } else {
                    throw new Error('Failed to fetch step ID - Invalid response');
                }
            } catch (error) {
                setError(error.message);
                return null;
            } finally {
                setIsLoading(false);
            }
        } else {
            return null;
        }
    }, [userID, formType]);

    // Check if user can access a specific step
    const canAccessStep = useCallback((stepNumber) => {
        const canAccess = stepNumber <= currentStepId;
        return canAccess;
    }, [currentStepId]);

    // Validate step access and show appropriate message
    const validateStepAccess = useCallback((stepNumber) => {
        if (canAccessStep(stepNumber)) {
            return { allowed: true, message: null };
        } else {
            const currentStepSection = allProgressSections.find(s => s.number === currentStepId);
            const currentStepLabel = currentStepSection ? currentStepSection.label : 'Unknown';

            return {
                allowed: false,
                message: `You can access only up to "${currentStepLabel}" (Step ${currentStepId}).`
            };
        }
    }, [currentStepId, canAccessStep, allProgressSections]);

    // Show step validation warning
    const showStepWarning = useCallback((message) => {
        Swal.fire({
            icon: 'warning',
            title: 'Step Not Allowed',
            text: message,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
    }, []);

    // Validate and navigate to step (with optional navigation function)
    const validateAndNavigate = useCallback((stepNumber, navigate, route, userData, currentUserLoginId) => {
        const validation = validateStepAccess(stepNumber);

        if (validation.allowed) {
            navigate(route, {
                state: {
                    profileId: userData?.UserLoginID || currentUserLoginId,
                    isLoggedIn: true
                }
            });
            return true;
        } else {
            showStepWarning(validation.message);
            return false;
        }
    }, [validateStepAccess, showStepWarning]);

    // Get step information by step number
    const getStepInfo = useCallback((stepNumber) => {
        return allProgressSections.find(section => section.number === stepNumber);
    }, [allProgressSections]);

    // Get step information by route
    const getStepByRoute = useCallback((route) => {
        return allProgressSections.find(section =>
            section.route === route || route.includes(section.id)
        );
    }, [allProgressSections]);

    // Get current step from route path
    const getCurrentStepFromRoute = useCallback((pathname) => {
        const currentSection = allProgressSections.find(section =>
            pathname.includes(section.id) || pathname === section.route
        );
        return currentSection ? currentSection.number : 1;
    }, [allProgressSections]);

    // Check if form is locked
    const checkFormLockStatus = useCallback(async () => {
        if (!userID) {
            return null;
        }

        try {
            const lockCheckEndpoint = isStaff
                ? `${IsStaffFormLocked}?StaffID=${userID}`
                : `${IsCandidateFormLocked}?CandidateID=${userID}`;


            const response = await agent.get(lockCheckEndpoint);

            return response.data.Data === true;
        } catch (error) {
            return false; // Default to unlocked on error
        }
    }, [userID, isStaff]);

    // Enhanced navigation with form lock check
    const navigateWithValidation = useCallback(async (stepNumber, navigate, route, userData, currentUserLoginId) => {
        // First check step validation
        const validation = validateStepAccess(stepNumber);

        if (!validation.allowed) {
            showStepWarning(validation.message);
            return false;
        }

        // Check if form is locked
        const isLocked = await checkFormLockStatus();

        if (isLocked) {
            Swal.fire({
                title: 'Information',
                text: 'Profile is locked. To view Profile, follow link Application Form > Profile',
                icon: 'info',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#28a745'
            });
            return false;
        }

        // Navigate if all checks pass
        navigate(route, {
            state: {
                profileId: userData?.UserLoginID || currentUserLoginId,
                isLoggedIn: true
            }
        });
        return true;
    }, [validateStepAccess, showStepWarning, checkFormLockStatus]);

    // Refresh step data
    const refreshStepData = useCallback(() => {
        return fetchCurrentStepId();
    }, [fetchCurrentStepId]);

    // Initialize step ID on mount
    useEffect(() => {
        fetchCurrentStepId();
    }, [fetchCurrentStepId]);



    return {
        // State
        currentStepId,
        isLoading,
        error,

        // Data
        allProgressSections,
        formType,
        userID,
        isStaff,

        // Validation functions
        canAccessStep,
        validateStepAccess,

        // Navigation functions
        validateAndNavigate,
        navigateWithValidation,

        // Utility functions
        getStepInfo,
        getStepByRoute,
        getCurrentStepFromRoute,
        checkFormLockStatus,
        showStepWarning,

        // Actions
        fetchCurrentStepId,
        refreshStepData
    };
};