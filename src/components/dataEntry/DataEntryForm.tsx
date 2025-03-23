
import React from 'react';
import { CategoryWithColumns, Column } from '@/types/column';
import { CategoryEntryData, EntryValue } from '@/types/dataEntry';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import { AlertCircle, CalendarIcon, HelpCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useForm } from 'react-hook-form';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/context/LanguageContext';

interface DataEntryFormProps {
  category: CategoryWithColumns;
  entryData: CategoryEntryData;
  onValueChange: (categoryId: string, columnId: string, value: any) => void;
  getErrorForColumn: (columnId: string) => string | undefined;
  isSubmitted: boolean;
  onSaveCategory?: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  category,
  entryData,
  onValueChange,
  getErrorForColumn,
  isSubmitted,
  onSaveCategory
}) => {
  const form = useForm();
  const { t } = useLanguage();

  const getValueForColumn = (columnId: string): any => {
    const value = entryData.values.find(v => v.columnId === columnId)?.value;
    return value !== undefined ? value : '';
  };

  const getStatusForColumn = (columnId: string): 'pending' | 'approved' | 'rejected' => {
    return entryData.values.find(v => v.columnId === columnId)?.status || 'pending';
  };

  const renderFormField = (column: Column) => {
    const errorMessage = getErrorForColumn(column.id);
    const isDisabled = isSubmitted;
    const status = getStatusForColumn(column.id);
    
    const isRejected = status === 'rejected';
    const isApproved = status === 'approved';
    
    return (
      <div key={column.id} className="mb-6">
        <FormItem className={cn(
          "space-y-2", 
          isRejected && "bg-red-50 p-3 rounded-md dark:bg-red-900/20",
          isApproved && "bg-green-50 p-3 rounded-md dark:bg-green-900/20"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FormLabel className="flex items-center space-x-2">
                <span>{column.name}</span>
                {column.isRequired && <span className="text-red-500">*</span>}
              </FormLabel>
              {isApproved && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0">
                  {t('approved')}
                </Badge>
              )}
              {isRejected && (
                <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200 text-xs px-1.5 py-0">
                  {t('rejected')}
                </Badge>
              )}
            </div>
            {column.helpText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{column.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {column.type === 'text' && !column.multiline && (
            <FormControl>
              <Input
                value={getValueForColumn(column.id) || ''}
                onChange={(e) => onValueChange(category.id, column.id, e.target.value)}
                placeholder={column.placeholder || `${column.name} daxil edin`}
                className={cn(
                  errorMessage ? 'border-red-500' : '', 
                  isRejected && "border-red-400",
                  isApproved && "border-green-400 bg-green-50/50"
                )}
                disabled={isDisabled}
              />
            </FormControl>
          )}

          {column.type === 'text' && column.multiline && (
            <FormControl>
              <Textarea
                value={getValueForColumn(column.id) || ''}
                onChange={(e) => onValueChange(category.id, column.id, e.target.value)}
                placeholder={column.placeholder || `${column.name} daxil edin`}
                className={cn(
                  errorMessage ? 'border-red-500' : '', 
                  isRejected && "border-red-400",
                  isApproved && "border-green-400 bg-green-50/50"
                )}
                rows={4}
                disabled={isDisabled}
              />
            </FormControl>
          )}
          
          {column.type === 'number' && (
            <FormControl>
              <Input
                type="number"
                value={getValueForColumn(column.id) || ''}
                onChange={(e) => onValueChange(category.id, column.id, e.target.value ? Number(e.target.value) : '')}
                placeholder={column.placeholder || `${column.name} daxil edin`}
                className={cn(
                  errorMessage ? 'border-red-500' : '', 
                  isRejected && "border-red-400",
                  isApproved && "border-green-400 bg-green-50/50"
                )}
                disabled={isDisabled}
                min={column.validationRules?.minValue}
                max={column.validationRules?.maxValue}
              />
            </FormControl>
          )}
          
          {column.type === 'select' && column.options && (
            <Select
              value={getValueForColumn(column.id) || ''}
              onValueChange={(value) => onValueChange(category.id, column.id, value)}
              disabled={isDisabled}
            >
              <FormControl>
                <SelectTrigger className={cn(
                  errorMessage ? 'border-red-500' : '', 
                  isRejected && "border-red-400",
                  isApproved && "border-green-400 bg-green-50/50"
                )}>
                  <SelectValue placeholder={column.placeholder || 'Seçin'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {column.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {column.type === 'date' && (
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !getValueForColumn(column.id) && "text-muted-foreground",
                      errorMessage && "border-red-500",
                      isRejected && "border-red-400",
                      isApproved && "border-green-400 bg-green-50/50"
                    )}
                    disabled={isDisabled}
                  >
                    {getValueForColumn(column.id) ? (
                      format(new Date(getValueForColumn(column.id)), 'dd MMMM yyyy', { locale: az })
                    ) : (
                      <span>Tarix seçin</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={getValueForColumn(column.id) ? new Date(getValueForColumn(column.id)) : undefined}
                  onSelect={(date) => onValueChange(category.id, column.id, date)}
                  disabled={isDisabled}
                  className={cn("p-3 pointer-events-auto")}
                  locale={az}
                />
              </PopoverContent>
            </Popover>
          )}
          
          {column.type === 'checkbox' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={column.id}
                checked={!!getValueForColumn(column.id)}
                onCheckedChange={(checked) => onValueChange(category.id, column.id, checked)}
                disabled={isDisabled}
                className={cn(
                  isRejected ? "border-red-400" : "",
                  isApproved ? "border-green-400" : ""
                )}
              />
              <label
                htmlFor={column.id}
                className={cn(
                  "text-sm", 
                  isRejected ? "text-red-600 dark:text-red-400" : 
                  isApproved ? "text-green-600 dark:text-green-400" : 
                  "text-muted-foreground"
                )}
              >
                {column.placeholder || 'Seçin'}
              </label>
            </div>
          )}
          
          {isRejected && entryData.values.find(v => v.columnId === column.id)?.errorMessage && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm ml-2">{t('rejectionReason')}</AlertTitle>
              <AlertDescription className="text-sm ml-2">
                {entryData.values.find(v => v.columnId === column.id)?.errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {errorMessage && !isRejected && (
            <FormMessage>
              {errorMessage}
            </FormMessage>
          )}
          
          {column.helpText && (
            <FormDescription className={
              isRejected ? "text-red-600 dark:text-red-400" : 
              isApproved ? "text-green-600 dark:text-green-400" : 
              ""
            }>
              {column.helpText}
            </FormDescription>
          )}
        </FormItem>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {category.deadline && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <span>{t('deadline')}:</span>
              <span className="font-medium">{format(new Date(category.deadline), 'dd.MM.yyyy')}</span>
            </div>
          )}
          
          {onSaveCategory && !isSubmitted && (
            <Button variant="outline" size="sm" onClick={onSaveCategory} className="ml-2">
              <Save className="h-4 w-4 mr-2" />
              {t('saveCategory')}
            </Button>
          )}
        </div>
      </div>
      
      {category.description && (
        <div className="text-sm text-muted-foreground mb-6 bg-muted/50 p-3 rounded-md">
          {category.description}
        </div>
      )}

      {entryData.approvalStatus === 'rejected' && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('categoryRejected')}</AlertTitle>
          <AlertDescription>
            {t('fixErrorsAndResubmit')}
          </AlertDescription>
        </Alert>
      )}
      
      {entryData.approvalStatus === 'approved' && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          <CheckIcon className="h-4 w-4" />
          <AlertTitle>{t('categoryApproved')}</AlertTitle>
          <AlertDescription>
            {t('categoryApprovedDesc')}
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {category.columns.map(column => renderFormField(column))}
          </div>
        </form>
      </Form>
    </div>
  );
};

// CheckIcon komponent
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default DataEntryForm;
