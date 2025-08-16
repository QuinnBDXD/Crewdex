import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const variants: Record<string, string> = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-gray-300 hover:bg-gray-50',
    };
    const sizes: Record<string, string> = {
      sm: 'h-9 px-3',
      md: 'h-10 px-4',
      lg: 'h-11 px-8',
    };
    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
