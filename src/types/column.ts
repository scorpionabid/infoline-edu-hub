
export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  // Tarix üçün əlavələr
  minDate?: Date;
  maxDate?: Date;
}
