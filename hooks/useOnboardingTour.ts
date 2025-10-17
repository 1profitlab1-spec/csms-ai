// hooks/useOnboardingTour.ts
import { useState, useEffect } from 'react';
import { TourStep } from '../types';

export const useOnboardingTour = (
  isNewUser: boolean,
  onComplete: () => void,
  steps: TourStep[]
) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Start the tour only if the user is new and there are steps.
    if (isNewUser && steps.length > 0) {
      const tourCompleted = localStorage.getItem('cosmos_tour_completed');
      if (!tourCompleted) {
        setIsTourActive(true);
      }
    }
  }, [isNewUser, steps.length]);

  const completeTour = () => {
    setIsTourActive(false);
    localStorage.setItem('cosmos_tour_completed', 'true');
    onComplete();
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeTour();
    }
  };

  const skipTour = () => {
    completeTour();
  };

  return {
    isTourActive,
    currentStep: isTourActive ? steps[currentStepIndex] : null,
    nextStep,
    skipTour,
  };
};
