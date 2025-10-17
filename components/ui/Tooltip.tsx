// components/ui/Tooltip.tsx
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button } from './Button';

interface TooltipProps {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onNext: () => void;
  onSkip: () => void;
  currentStepIndex: number;
  totalSteps: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  targetId,
  title,
  content,
  position = 'bottom',
  onNext,
  onSkip,
  currentStepIndex,
  totalSteps,
}) => {
  const [style, setStyle] = useState({});
  const [arrowStyle, setArrowStyle] = useState({});

  useLayoutEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) {
        // Fallback for centered tooltip if target not found (e.g., welcome message)
        setStyle({
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
        });
        return;
    };

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const targetRect = target.getBoundingClientRect();
    const tooltipStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
    };
    const arrowStyles: React.CSSProperties = {
      position: 'absolute',
      width: '0',
      height: '0',
      borderColor: 'transparent',
      borderStyle: 'solid',
    };

    const offset = 10; // Space between target and tooltip

    switch (position) {
      case 'top':
        tooltipStyle.top = `${targetRect.top - offset}px`;
        tooltipStyle.left = `${targetRect.left + targetRect.width / 2}px`;
        tooltipStyle.transform = 'translate(-50%, -100%)';
        arrowStyles.top = '100%';
        arrowStyles.left = '50%';
        arrowStyles.transform = 'translateX(-50%)';
        arrowStyles.borderWidth = '8px 8px 0';
        arrowStyles.borderTopColor = '#3b0764'; // purple-950
        break;
      case 'right':
        tooltipStyle.top = `${targetRect.top + targetRect.height / 2}px`;
        tooltipStyle.left = `${targetRect.right + offset}px`;
        tooltipStyle.transform = 'translateY(-50%)';
        arrowStyles.top = '50%';
        arrowStyles.right = '100%';
        arrowStyles.transform = 'translateY(-50%)';
        arrowStyles.borderWidth = '8px 8px 8px 0';
        arrowStyles.borderRightColor = '#3b0764';
        break;
      case 'left':
        tooltipStyle.top = `${targetRect.top + targetRect.height / 2}px`;
        tooltipStyle.left = `${targetRect.left - offset}px`;
        tooltipStyle.transform = 'translate(-100%, -50%)';
        arrowStyles.top = '50%';
        arrowStyles.left = '100%';
        arrowStyles.transform = 'translateY(-50%)';
        arrowStyles.borderWidth = '8px 0 8px 8px';
        arrowStyles.borderLeftColor = '#3b0764';
        break;
      default: // bottom
        tooltipStyle.top = `${targetRect.bottom + offset}px`;
        tooltipStyle.left = `${targetRect.left + targetRect.width / 2}px`;
        tooltipStyle.transform = 'translateX(-50%)';
        arrowStyles.top = `-${2 * 8}px`; // arrow height
        arrowStyles.left = '50%';
        arrowStyles.transform = 'translateX(-50%)';
        arrowStyles.borderWidth = '0 8px 8px';
        arrowStyles.borderBottomColor = '#3b0764';
        break;
    }
    
    setStyle(tooltipStyle);
    setArrowStyle(arrowStyles);

  }, [targetId, position]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in">
        <div style={style} className="glassmorphism bg-purple-950/80 border-purple-800 rounded-lg p-4 w-80 max-w-[90vw] shadow-2xl">
            <div style={arrowStyle} />
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-brand-text-secondary mb-4">{content}</p>
            <div className="flex justify-between items-center">
                <Button variant="link" size="sm" onClick={onSkip}>Skip Tour</Button>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-text-secondary">{currentStepIndex + 1} / {totalSteps}</span>
                    <Button size="sm" onClick={onNext}>
                        {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Tooltip;