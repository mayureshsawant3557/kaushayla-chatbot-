import React, { useEffect } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';

const Modal = ({
  show = false,
  onClose,
  title = 'Modal Title',
  children,
  size = 'md', // 'sm', 'md', 'lg', 'xl', 'full'
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  className = '',
  variant = 'default', // 'default', 'success', 'error', 'warning', 'info'
}) => {
  // Handle ESC key press
  useEffect(() => {
    if (!show || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [show, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  // Get size classes
  const getSizeClasses = () => {
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full mx-4',
    };
    return sizes[size] || sizes.md;
  };

  // Get variant classes
  const getVariantClasses = () => {
    const variants = {
      default: {
        header: 'bg-gray-50 border-gray-200',
        icon: null,
        iconColor: '',
      },
      success: {
        header: 'bg-green-50 border-green-200',
        icon: CheckCircle2,
        iconColor: 'text-green-600',
      },
      error: {
        header: 'bg-red-50 border-red-200',
        icon: XCircle,
        iconColor: 'text-red-600',
      },
      warning: {
        header: 'bg-yellow-50 border-yellow-200',
        icon: CheckCircle2,
        iconColor: 'text-yellow-600',
      },
      info: {
        header: 'bg-blue-50 border-blue-200',
        icon: CheckCircle2,
        iconColor: 'text-blue-600',
      },
    };
    return variants[variant] || variants.default;
  };

  const variantConfig = getVariantClasses();
  const IconComponent = variantConfig.icon;

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`
            bg-white rounded-lg shadow-2xl
            ${getSizeClasses()}
            w-full
            animate-modalSlideIn
            ${className}
          `}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div
            className={`
              border-b px-6 py-4 rounded-t-lg
              flex items-center justify-between
              ${variantConfig.header}
              ${headerClassName}
            `}
          >
            <div className="flex items-center gap-3">
              {IconComponent && (
                <IconComponent className={`w-6 h-6 ${variantConfig.iconColor}`} />
              )}
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className={`px-6 py-4 ${bodyClassName}`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className={`
                border-t border-gray-200 px-6 py-4 rounded-b-lg
                bg-gray-50
                ${footerClassName}
              `}
            >
              {footer}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-modalSlideIn {
          animation: modalSlideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

// Success Modal Component (specialized version)
export const SuccessModal = ({
  show,
  onClose,
  data = {},
  title = 'Form Submitted Successfully!',
  excludeFields = ['password', 'confirmPassword'],
  ...props
}) => {
  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return value.toString();
  };

  const filteredData = Object.entries(data).filter(
    ([key, value]) => !excludeFields.includes(key) && value !== '' && value !== null && value !== undefined
  );

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={title}
      variant="success"
      size="lg"
      footer={
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Close
        </button>
      }
      {...props}
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Your form has been submitted successfully. Here's a summary of your submission:
        </p>

        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <dl className="space-y-3">
            {filteredData.map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:gap-4 border-b border-gray-200 pb-2 last:border-b-0">
                <dt className="font-medium text-gray-700 sm:w-1/3">
                  {formatFieldName(key)}:
                </dt>
                <dd className="text-gray-900 sm:w-2/3 wrap-break-word">
                  {formatValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
