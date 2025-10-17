import React from 'react';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-xl border border-purple-300/10 bg-purple-950/20 backdrop-blur-lg p-6 text-white shadow-lg ${className}`}
    {...props}
  />
));
Card.displayName = 'Card';

export { Card };