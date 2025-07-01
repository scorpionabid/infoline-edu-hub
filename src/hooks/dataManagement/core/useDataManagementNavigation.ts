
import type { DataManagementStep } from '../types';

export const useDataManagementNavigation = (
  currentStep: DataManagementStep,
  setCurrentStep: (step: DataManagementStep) => void,
  selectedCategory: any,
  selectedColumn: any
) => {
  const goToNextStep = () => {
    switch (currentStep) {
      case 'category':
        if (selectedCategory) {
          setCurrentStep('column');
        }
        break;
      case 'column':
        if (selectedColumn) {
          setCurrentStep('data');
        }
        break;
      default:
        break;
    }
  };

  const goToPrevStep = () => {
    switch (currentStep) {
      case 'column':
        setCurrentStep('category');
        break;
      case 'data':
        setCurrentStep('column');
        break;
      default:
        break;
    }
  };

  const goToStep = (step: DataManagementStep) => {
    setCurrentStep(step);
  };

  return {
    goToNextStep,
    goToPrevStep,
    goToStep
  };
};
