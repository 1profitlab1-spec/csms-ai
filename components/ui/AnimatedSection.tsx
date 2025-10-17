import React, { useRef } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, className, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(ref, { threshold: 0.1, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={`${className} transition-opacity duration-1000 ${isIntersecting ? 'opacity-100 is-intersecting' : 'opacity-0'}`}
      style={style}
    >
      {children}
    </div>
  );
};

export { AnimatedSection };