/**
 * DataEntry komponentləri üçün mərkəzi ixrac
 * Bu fayl, layihənin digər hissələrində yeni struktur import edilərkən 
 * köhnə faylların import yollarını dəyişmədən istifadə edilə bilməsi üçündür
 */

// Core komponentləri yenidən ixrac
export { DataEntryForm, FormFields } from './core';
export { default as DataEntryFormContent } from './core/DataEntryFormContent';

// Shared komponentləri yenidən ixrac
export { DataEntryFormLoading, DataEntryFormError } from './shared';

// Field komponentləri yenidən ixrac
export { default as FieldRendererSimple } from './fields/FieldRendererSimple';
export { default as FieldRenderer } from './fields/FieldRenderer';
export { default as EntryField } from './fields/EntryField';

// Status komponentləri yenidən ixrac
export { StatusBadge } from './status';

// Legacy komponentlər - bunlar əvvəlki import əmrlərinin işləməsi üçün
// Gələcəkdə bu şəkildə birbaşa ixrac edilməli və ya daha yaxşı adlandırılmalıdır
