
import React from 'react';
import { Control, Controller, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, MoveVertical, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ColumnFormData } from '@/components/columns/columnDialog/useColumnForm';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface OptionsFieldProps {
  control: Control<ColumnFormData>;
}

interface SortableItemProps {
  id: string;
  index: number;
  control: Control<ColumnFormData>;
  remove: (index: number) => void;
}

const SortableItem = ({ id, index, control, remove }: SortableItemProps) => {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-2">
      <CardContent className="p-3 flex items-center gap-2">
        <div className="cursor-move" {...attributes} {...listeners}>
          <MoveVertical className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor={`options.${index}.label`} className="text-xs">
                {t('label')}
              </Label>
              <Controller
                name={`options.${index}.label`}
                control={control}
                render={({ field }) => (
                  <Input
                    id={`options.${index}.label`}
                    {...field}
                    placeholder={t('optionLabel')}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor={`options.${index}.value`} className="text-xs">
                {t('value')}
              </Label>
              <Controller
                name={`options.${index}.value`}
                control={control}
                render={({ field }) => (
                  <Input
                    id={`options.${index}.value`}
                    {...field}
                    placeholder={t('optionValue')}
                  />
                )}
              />
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => remove(index)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

const OptionsField: React.FC<OptionsFieldProps> = ({ control }) => {
  const { t } = useLanguage();
  const { fields, append, remove, move } = useFieldArray({
    name: 'options',
    control,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      
      move(oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>{t('options')}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ label: '', value: '' })}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('addOption')}
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="border rounded-md p-4 text-center text-muted-foreground">
          {t('noOptionsAdded')}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <SortableItem
                key={field.id}
                id={field.id}
                index={index}
                control={control}
                remove={remove}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default OptionsField;
