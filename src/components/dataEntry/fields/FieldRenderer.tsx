
import React from 'react';
import { Column } from '@/types/column';
import UnifiedFieldRenderer from './UnifiedFieldRenderer';

export interface FieldRendererProps {
  column: Column;
  value: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
  readOnly?: boolean;
}

/**
 * FieldRenderer - Legacy wrapper for UnifiedFieldRenderer
 * @deprecated Use UnifiedFieldRenderer directly for new code
 */
export const FieldRenderer: React.FC<FieldRendererProps> = (props) => {
  return <UnifiedFieldRenderer {...props} />;
};

export default FieldRenderer;
