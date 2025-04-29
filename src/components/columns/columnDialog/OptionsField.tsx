
import { useCallback, useEffect, useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { ColumnOption, ColumnType } from '@/types/column';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { Checkbox } from '@/components/ui/checkbox';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useFieldArray, useFormContext } from 'react-hook-form';

interface OptionsFieldProps {
  control: any;
  name: string;
  columnType: ColumnType;
}

export default function OptionsField({ control, name, columnType }: OptionsFieldProps) {
  const { t } = useLanguage();
  const form = useFormContext();
  const [showValueField, setShowValueField] = useState(false);
  const [enableCustomColors, setEnableCustomColors] = useState(false);

  // Get the current values of the field array with useFieldArray
  const { fields, append, remove, move } = useFieldArray({
    control,
    name
  });

  // Function to update a specific field in the options array
  const updateOptionField = useCallback((index: number, field: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [field]: value };
    form.setValue(name, newFields);
  }, [fields, form, name]);

  // Function to handle drag and drop
  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }

    move(result.source.index, result.destination.index);
  }, [move]);

  // Add a new option
  const handleAddOption = () => {
    append({ 
      value: '', 
      label: '', 
      color: '#' + Math.floor(Math.random() * 16777215).toString(16) 
    } as ColumnOption);
  };

  // Effect to initialize options if they are not already present
  useEffect(() => {
    if (!fields || fields.length === 0) {
      append({ 
        value: '', 
        label: '', 
        color: '#' + Math.floor(Math.random() * 16777215).toString(16) 
      } as ColumnOption);
    }
  }, [append, fields]);

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>{t('options')}</FormLabel>
              <div className="flex items-center gap-4">
                {columnType !== 'checkbox' && columnType !== 'radio' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showValues" 
                      checked={showValueField}
                      onCheckedChange={(checked) => setShowValueField(!!checked)}
                    />
                    <Label htmlFor="showValues" className="text-sm font-normal">
                      {t('showValueField')}
                    </Label>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="enableColors" 
                    checked={enableCustomColors}
                    onCheckedChange={(checked) => setEnableCustomColors(!!checked)}
                  />
                  <Label htmlFor="enableColors" className="text-sm font-normal">
                    {t('enableCustomColors')}
                  </Label>
                </div>
              </div>
            </div>
            
            <FormControl>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="options-list">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {fields.length === 0 ? (
                        <div className="text-sm text-gray-500 italic p-2 border border-dashed rounded-md text-center">
                          {t('noOptionsAdded')}
                        </div>
                      ) : (
                        fields.map((field, index) => {
                          const typedField = field as unknown as ColumnOption;
                          return (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-2 bg-background p-2 rounded-md border group"
                                >
                                  <div 
                                    {...provided.dragHandleProps} 
                                    className="cursor-grab text-gray-400 hover:text-gray-600"
                                  >
                                    <GripVertical size={16} />
                                  </div>
                                  
                                  {showValueField && (
                                    <Input 
                                      placeholder={t('value')}
                                      className="flex-1"
                                      value={typedField.value || ''}
                                      onChange={(e) => updateOptionField(index, 'value', e.target.value)}
                                    />
                                  )}
                                  
                                  <Input 
                                    placeholder={t('label')}
                                    className="flex-1"
                                    value={typedField.label || ''}
                                    onChange={(e) => updateOptionField(index, 'label', e.target.value)}
                                  />
                                  
                                  {enableCustomColors && (
                                    <Input 
                                      type="color" 
                                      className="w-10 p-0 h-9 cursor-pointer border border-input"
                                      value={typedField.color || '#000000'}
                                      onChange={(e) => updateOptionField(index, 'color', e.target.value)}
                                    />
                                  )}
                                  
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    type="button"
                                    onClick={() => remove(index)} 
                                    className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </FormControl>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddOption}
              className="w-full"
            >
              <Plus size={16} className="mr-2" />
              {t('addOption')}
            </Button>
            
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
