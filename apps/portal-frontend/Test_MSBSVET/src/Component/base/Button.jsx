import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Comprehensive Button Component
 * Bootstrap-like button system with Tailwind CSS
 */

const Button = forwardRef(({
  // Content
  children,
  leftIcon,
  rightIcon,
  iconOnly = false,

  // Variants
  variant = 'primary',
  outline = false,
  soft = false,

  // Sizes
  size = 'md',

  // Shapes
  pill = false,
  square = false,
  rounded = true,

  // Layout
  fullWidth = false,

  // States
  disabled = false,
  loading = false,
  active = false,

  // HTML attributes
  type = 'button',
  onClick,
  className = '',

  ...props
}, ref) => {

  // Base classes
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transform active:scale-95',
  ];

  // Size classes
  const sizeClasses = {
    xs: 'text-xs px-2.5 py-1.5 gap-1',
    sm: 'text-sm px-3 py-2 gap-1.5',
    md: 'text-base px-4 py-2.5 gap-2',
    lg: 'text-lg px-5 py-3 gap-2.5',
    xl: 'text-xl px-6 py-4 gap-3',
  };

  // Icon-only sizes
  const iconOnlySizeClasses = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
    xl: 'p-4',
  };

  // Border radius
  const getBorderRadius = () => {
    if (square) return 'rounded-none';
    if (pill) return 'rounded-full';
    const radiusMap = {
      xs: 'rounded',
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
    };
    return rounded ? radiusMap[size] : 'rounded-none';
  };

  // Variant colors
  const variantClasses = {
    primary: {
      solid: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500',
      soft: 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 focus:ring-blue-500',
    },
    secondary: {
      solid: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 focus:ring-gray-500',
      outline: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500',
      soft: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-500',
    },
    success: {
      solid: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500',
      outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 active:bg-green-100 focus:ring-green-500',
      soft: 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300 focus:ring-green-500',
    },
    danger: {
      solid: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
      outline: 'border-2 border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100 focus:ring-red-500',
      soft: 'bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300 focus:ring-red-500',
    },
    warning: {
      solid: 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 focus:ring-yellow-500',
      outline: 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 active:bg-yellow-100 focus:ring-yellow-500',
      soft: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 active:bg-yellow-300 focus:ring-yellow-500',
    },
    info: {
      solid: 'bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800 focus:ring-cyan-500',
      outline: 'border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 focus:ring-cyan-500',
      soft: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 active:bg-cyan-300 focus:ring-cyan-500',
    },
    light: {
      solid: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500',
      soft: 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500',
    },
    dark: {
      solid: 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 focus:ring-gray-500',
      outline: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500',
      soft: 'bg-gray-800 text-gray-100 hover:bg-gray-700 active:bg-gray-600 focus:ring-gray-500',
    },
    link: {
      solid: 'text-blue-600 hover:text-blue-700 hover:underline focus:ring-blue-500',
      outline: 'text-blue-600 hover:text-blue-700 hover:underline focus:ring-blue-500',
      soft: 'text-blue-600 hover:text-blue-700 hover:underline focus:ring-blue-500',
    },
    ghost: {
      solid: 'text-gray-600 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500',
      outline: 'text-gray-600 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500',
      soft: 'text-gray-600 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500',
    },
  };

  // Get variant type
  const variantType = soft ? 'soft' : outline ? 'outline' : 'solid';

  // Icon sizes
  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  // Combine classes
  const buttonClasses = [
    ...baseClasses,
    iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
    variantClasses[variant]?.[variantType] || variantClasses.primary.solid,
    getBorderRadius(),
    fullWidth && 'w-full',
    active && 'ring-2 ring-offset-2',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
      )}
      {!loading && leftIcon && (
        <span className={iconSizeClasses[size]}>{leftIcon}</span>
      )}
      {!iconOnly && children && !loading && children}
      {iconOnly && !loading && (leftIcon || rightIcon) && (
        <span className={iconSizeClasses[size]}>{leftIcon || rightIcon}</span>
      )}
      {!loading && rightIcon && !iconOnly && (
        <span className={iconSizeClasses[size]}>{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;