import React from 'react';

/**
 * ButtonGroup Component
 * Groups buttons together like Bootstrap button groups
 */

const ButtonGroup = ({
  children,
  vertical = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = [
    'inline-flex',
    vertical ? 'flex-col' : 'flex-row',
    '[&>button]:focus:z-10',
    '[&>button]:focus:relative',
  ];

  // Remove border radius from middle buttons
  const groupClasses = vertical
    ? [
      '[&>button:not(:first-child):not(:last-child)]:rounded-none',
      '[&>button:first-child]:rounded-b-none',
      '[&>button:last-child]:rounded-t-none',
      '[&>button:not(:first-child)]:-mt-px',
    ]
    : [
      '[&>button:not(:first-child):not(:last-child)]:rounded-none',
      '[&>button:first-child]:rounded-r-none',
      '[&>button:last-child]:rounded-l-none',
      '[&>button:not(:first-child)]:-ml-px',
    ];

  const classes = [...baseClasses, ...groupClasses, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="group" {...props}>
      {children}
    </div>
  );
};

export default ButtonGroup;