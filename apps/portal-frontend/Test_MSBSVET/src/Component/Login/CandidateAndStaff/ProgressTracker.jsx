import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStepValidation } from "../../../hooks/useStepValidation";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../Hooks/AuthContext";

const ProgressTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStepId, setActiveStepId] = useState(1);
  const [searchParams] = useSearchParams();

  const candidateIdFromUrl = searchParams.get("candidateId");
  const { userInfo } = useAuth();
 const userTypeID = Number(userInfo?.UserTypeID);

  // If institute is opening a candidate form, treat as Candidate
  const isStaffUser = !candidateIdFromUrl && userTypeID === 95;

  // Use the step validation hook
  const {
    currentStepId,
    validateAndNavigate,
    canAccessStep,
    isLoading: stepLoading,
    formType,
    userID,
    isStaff,
  } = useStepValidation();

  // Define progress sections based on user type
  const getProgressSections = () => {
    if (isStaffUser) {
      // Staff progress sections (11 steps)
      return [
        {
          id: "primary",
          number: 1,
          label: "Primary",
          route: "/Staff/Primary",
          isLocked: false,
        },
        {
          id: "address",
          number: 2,
          label: "Address",
          route: "/Staff/Address",
          isLocked: false,
        },
        {
          id: "parent",
          number: 3,
          label: "Parent",
          route: "/Staff/Parent",
          isLocked: false,
        },
        {
          id: "category",
          number: 4,
          label: "Category",
          route: "/Staff/Category",
          isLocked: false,
        },
        {
          id: "qualification",
          number: 5,
          label: "Qualification",
          route: "/Staff/Qualification",
          isLocked: false,
        },
        {
          id: "training",
          number: 6,
          label: "Training",
          route: "/Staff/Training",
          isLocked: false,
        },
        {
          id: "additional",
          number: 7,
          label: "Additional",
          route: "/Staff/Additional",
          isLocked: false,
        },
        {
          id: "bank",
          number: 8,
          label: "Bank",
          route: "/Staff/Bank",
          isLocked: false,
        },
        {
          id: "workexperience",
          number: 9,
          label: "Work Experience",
          route: "/Staff/WorkExperience",
          isLocked: false,
        },
        {
          id: "sectorialexpertise",
          number: 10,
          label: "Sectorial Expertise",
          route: "/Staff/SectorialExpertise",
          isLocked: false,
        },
        {
          id: "verify",
          number: 11,
          label: "Verify",
          route: "/Staff/LockApplicationForm",
          isLocked: false,
        },
      ];
    } else {
      // Candidate progress sections (12 steps)
      const isInstituteViewingCandidate =
        userTypeID === 61 && candidateIdFromUrl;

      return isInstituteViewingCandidate
        ? [
            {
              id: "primary",
              number: 1,
              label: "Primary",
              route: "/Candidate/Primary",
              isLocked: false,
            },
            {
              id: "address",
              number: 2,
              label: "Address",
              route: "/Candidate/Address",
              isLocked: false,
            },
            {
              id: "parent",
              number: 3,
              label: "Parent",
              route: "/Candidate/Parent",
              isLocked: false,
            },
            {
              id: "category",
              number: 4,
              label: "Category",
              route: "/Candidate/Category",
              isLocked: false,
            },
            {
              id: "qualification",
              number: 5,
              label: "Qualification",
              route: "/Candidate/Qualification",
              isLocked: false,
            },
            {
              id: "training",
              number: 6,
              label: "Training",
              route: "/Candidate/Training",
              isLocked: false,
            },
            {
              id: "additional",
              number: 7,
              label: "Additional",
              route: "/Candidate/Additional",
              isLocked: false,
            },
            {
              id: "bank",
              number: 8,
              label: "Bank",
              route: "/Candidate/Bank",
              isLocked: false,
            },
            {
              id: "workexperience",
              number: 9,
              label: "Work Experience",
              route: "/Candidate/WorkExperience",
              isLocked: false,
            },
            {
              id: "verify",
              number: 10,
              label: "Verify",
              route: "/Candidate/LockApplicationForm",
              isLocked: false,
            },
          ]
        : [
            {
              id: "primary",
              number: 1,
              label: "Primary",
              route: "/Candidate/Primary",
              isLocked: false,
            },
            {
              id: "address",
              number: 2,
              label: "Address",
              route: "/Candidate/Address",
              isLocked: false,
            },
            {
              id: "parent",
              number: 3,
              label: "Parent",
              route: "/Candidate/Parent",
              isLocked: false,
            },
            {
              id: "category",
              number: 4,
              label: "Category",
              route: "/Candidate/Category",
              isLocked: false,
            },
            {
              id: "qualification",
              number: 5,
              label: "Qualification",
              route: "/Candidate/Qualification",
              isLocked: false,
            },
            {
              id: "training",
              number: 6,
              label: "Training",
              route: "/Candidate/Training",
              isLocked: false,
            },
            {
              id: "additional",
              number: 7,
              label: "Additional",
              route: "/Candidate/Additional",
              isLocked: false,
            },
            {
              id: "bank",
              number: 8,
              label: "Bank",
              route: "/Candidate/Bank",
              isLocked: false,
            },
            {
              id: "workexperience",
              number: 9,
              label: "Work Experience",
              route: "/Candidate/WorkExperience",
              isLocked: false,
            },
            {
              id: "verify",
              number: 10,
              label: "Verify",
              route: "/Candidate/LockApplicationForm",
              isLocked: false,
            },
            {
              id: "apply",
              number: 11,
              label: "Apply",
              route: "/Candidate/MainCourseAdmissionApply",
              isLocked: false,
            },
            {
              id: "admissionletter",
              number: 12,
              label: "Admission Letter",
              route: "/Dashboard/DashboardCandidate",
              isLocked: false,
            },
          ];
    }
  };

  const progressSections = getProgressSections();

  // Get current step number based on current route
  const getCurrentStepFromRoute = () => {
    const currentPath = location.pathname;
    const currentSection = progressSections.find(
      (section) =>
        currentPath.includes(section.id) || currentPath === section.route,
    );
    return currentSection ? currentSection.number : 1; // Default to 1 if not found
  };

  // Update active step when route changes or currentStepId changes
  useEffect(() => {
    const routeStep = getCurrentStepFromRoute();
    if (routeStep <= currentStepId) {
      setActiveStepId(routeStep);
    } else {
      setActiveStepId(currentStepId);
    }
  }, [location.pathname, currentStepId]);

  // Handle navigation to different sections
  const navigateTo = (section) => {
    // Don't navigate to locked sections
    if (section.isLocked) return;

    // Use canAccessStep from the hook
    if (canAccessStep(section.number)) {
      setActiveStepId(section.number);
      if (candidateIdFromUrl) {
        navigate(`${section.route}?candidateId=${candidateIdFromUrl}`);
      } else {
        navigate(section.route);
      }
    }
  };

  // Get ball color based on position relative to current step
  const getBallColor = (number, isLocked) => {
    if (isLocked) return "bg-gray-500"; // Lock tab
    if (number === activeStepId) return "bg-yellow-500"; // Any active/clicked step
    if (number < currentStepId) return "bg-green-500"; // Completed steps
    if (number === currentStepId) return "bg-blue-500"; // Current step from API
    return "bg-gray-300"; // Upcoming steps
  };

  // Get label color based on position relative to current step
  const getLabelColor = (number, isLocked) => {
    if (isLocked) return "text-gray-500"; // Lock tab
    if (number === activeStepId) return "text-yellow-500"; // Any active/clicked step
    if (number < currentStepId) return "text-green-500"; // Completed
    if (number === currentStepId) return "text-blue-500"; // Current step from API
    return "text-gray-500"; // Upcoming
  };

  // Get cursor style based on whether step is accessible
  const getCursorStyle = (number, isLocked) => {
    if (isLocked) return "cursor-not-allowed";
    return canAccessStep(number) ? "cursor-pointer" : "cursor-not-allowed";
  };

  // Calculate progress percentage for the green line
  const progressPercentage =
    ((currentStepId - 1) / (progressSections.length - 1)) * 100;

  // Show loading state while step validation is loading
  if (stepLoading) {
    return (
      <div className="mx-auto mb-8 max-w-full rounded-lg border border-purple-300 p-4">
        <div className="text-center text-blue-600">
          Loading step information...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-8 max-w-full rounded-lg border border-purple-300 p-4">
      <div className="relative overflow-x-auto hide-scrollbar">
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <div className="relative w-max min-w-full">
          {/* Background progress line (gray) */}
          <div className="absolute left-0 right-0 top-5 z-0 h-1 bg-gray-300"></div>

          {/* Filled progress line (green) */}
          <div
            className="absolute left-0 top-5 z-0 h-1 bg-green-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>

          {/* Progress balls */}
          <div className="relative z-0 flex justify-between">
            {progressSections.map((section) => (
              <div
                key={section.id}
                className={`flex flex-col items-center flex-shrink-0 w-20 ${getCursorStyle(section.number, section.isLocked)}`}
                onClick={() => !section.isLocked && navigateTo(section)}
                title={`Step ${section.number}: ${section.label}${!canAccessStep(section.number) ? " (Locked)" : ""}`}
              >
                {/* Ball */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getBallColor(section.number, section.isLocked)} transition-all duration-200 hover:scale-110`}
                >
                  {section.isLocked ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  ) : (
                    section.number
                  )}
                </div>
                {/* Label */}
                <div
                  className={`text-xs font-medium mt-1 text-center whitespace-nowrap ${getLabelColor(section.number, section.isLocked)}`}
                >
                  {section.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
