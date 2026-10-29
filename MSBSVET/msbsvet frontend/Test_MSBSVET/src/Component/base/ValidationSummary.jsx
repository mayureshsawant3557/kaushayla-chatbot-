import React, { useEffect, useRef, useState } from 'react';
import { XCircle, AlertTriangle, X } from 'lucide-react';

/**
 * ValidationSummary Component
 * Displays validation errors in either popup modal or inline div
 * 
 * @param {string} mode - Display mode: 'popup' (modal) or 'inline' (embedded div)
 * @param {Object} errors - Object containing field errors
 * @param {Object} fieldLabels - Object mapping field names to display labels
 * @param {boolean} show - Whether to show the summary
 * @param {Function} onClose - Callback when summary is closed
 * @param {string} title - Main title text
 * @param {string} subtitle - Subtitle/description text
 * @param {string} position - Position for popup mode: 'center', 'top-right', etc.
 * @param {boolean} autoClose - Auto close after delay
 * @param {number} autoCloseDelay - Delay before auto close (ms)
 * @param {boolean} showCloseButton - Show X close button in header
 * @param {string} className - Additional CSS classes
 * @param {boolean} groupBySection - Group errors by section
 * @param {string} maxHeight - Maximum height for scrollable content
 */
const ValidationSummary = ({
  mode = 'popup', // 'popup' or 'inline'
  errors = {},
  fieldLabels = {},
  show = false,
  onClose,
  title = 'Form Validation Failed',
  subtitle = "Please correct the following errors",
  position = 'center',
  autoClose = false,
  autoCloseDelay = 5000,
  showCloseButton = true,
  className = '',
  groupBySection = false,
  maxHeight = '80vh',
}) => {
  const timerRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  // Auto close functionality
  useEffect(() => {
    if (show && autoClose) {
      timerRef.current = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, autoCloseDelay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [show, autoClose, autoCloseDelay, onClose]);

  // Prevent body scroll when popup modal is open
  useEffect(() => {
    if (mode === 'popup' && show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show, mode]);

  // Get error entries
  const errorEntries = Object.entries(errors).filter(([_, error]) => error !== null && error !== undefined && error !== '');

  // Format field name for display
  const formatFieldName = (fieldName) => {
    if (fieldLabels[fieldName]) {
      return fieldLabels[fieldName];
    }

    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  // Group errors by section if enabled
  const groupedErrors = groupBySection
    ? errorEntries.reduce((acc, [key, error]) => {
      const section = key.includes('.') ? key.split('.')[0] : 'General';
      if (!acc[section]) acc[section] = [];
      acc[section].push([key, error]);
      return acc;
    }, {})
    : { 'Errors': errorEntries };

  // Don't render if not shown or no errors
  if (!show || errorEntries.length === 0) {
    return null;
  }

  // ─── Trigger slide-out then call the real onClose after it finishes ─────
  const handleClose = () => {
    setIsClosing(true);
    // 400ms matches modalSlideOut duration — call parent close after it ends
    setTimeout(() => {
      setIsClosing(false);
      if (onClose) onClose();
    }, 400);
  };

  // Render error content (shared between modes)
  const renderErrorContent = () => (
    <div className="space-y-3">
      {Object.entries(groupedErrors).map(([section, sectionErrors]) => (
        <div key={section}>
          {groupBySection && Object.keys(groupedErrors).length > 1 && (
            <h4 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-red-200">
              {formatFieldName(section)}
            </h4>
          )}

          <ul className="space-y-3">
            {sectionErrors.map(([fieldName, error]) => (
              <li key={fieldName} className="flex items-start gap-2">
                <AlertTriangle className="w-4 md:w-5 h-4 md:h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm md:text-base text-gray-900">
                    <span className="font-semibold text-gray-900">
                      {formatFieldName(fieldName)} :
                    </span>{' '}
                    <span className="text-gray-700">
                      {error}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  // Render inline mode
  if (mode === 'inline') {
    return (
      <div className={`bg-white rounded-md shadow-lg mb-4 border border-red-200 ${className}`}>
        {/* Header */}
        <div className="p-2 md:p-3 bg-red-50 rounded-t-md border-b border-red-200">
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1 flex-1">
              <div className="shrink-0">
                <XCircle className="w-4 md:w-6 h-4 md:h-6 text-red-500" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm md:text-base font-semibold">
                  {subtitle}
                </p>
              </div>
            </div>
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200 shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4 md:w-6 md:h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-2 md:p-3 bg-white">
          {renderErrorContent()}
        </div>
      </div>
    );
  }

  // Render popup mode
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Popup Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <div
          className={`
            bg-white rounded-xl shadow-2xl
            max-w-2xl w-full
            flex flex-col
            ${isClosing ? 'animate-modalSlideOut' : 'animate-modalSlideIn'}
            ${className}
          `}
          style={{ maxHeight }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="validation-summary-title"
        >
          {/* Header */}
          <div className="p-2 md:p-3 shrink-0 bg-red-50 rounded-t-xl border-b border-red-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 md:gap-3 flex-1">
                <div className="shrink-0">
                  <XCircle className="w-10 md:w-12 h-10 md:h-12 text-red-500" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h2
                    id="validation-summary-title"
                    className="text-base md:text-xl font-bold text-gray-900"
                  >
                    {title}
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base mt-1">
                    {subtitle}
                  </p>
                </div>
              </div>
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-200 shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="px-3 md:px-4 py-3 md:py-4 overflow-y-auto flex-1 bg-white">
            {renderErrorContent()}
          </div>

          {/* Footer */}
          <div className="p-1 md:p-2 shrink-0 flex justify-center border-t border-red-200 bg-white rounded-b-2xl">
            <button
              onClick={handleClose}
              className="w-auto px-8 md:px-12 py-1 md:py-2 bg-red-600 text-white text-base md:text-lg font-semibold rounded-xl hover:bg-red-700 active:bg-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Keyframes – colocated so no separate CSS file is needed */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalSlideOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-40px);
          }
        }

        .animate-modalSlideIn {
          animation: modalSlideIn 0.3s ease-out forwards;
        }

        .animate-modalSlideOut {
          animation: modalSlideOut 0.4s ease-in forwards;
        }
      `}</style>
    </>
  );
};

export default ValidationSummary;