
export type ColumnType = 
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'image'
  | 'email'
  | 'url'
  | 'tel';

// Column və ColumnOption tiplərini columns.ts-dən əldə edilməsini təmin edirik
export type { Column, ColumnOption, ColumnValidation, CategoryWithColumns } from './columns';
