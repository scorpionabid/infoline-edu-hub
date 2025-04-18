
import React, { createContext, useContext, useState } from 'react';
import { Checkbox } from './checkbox';
import { Label } from './label';

interface CheckboxGroupContextProps {
  values: string[];
  onValueChange: (values: string[]) => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextProps | undefined>(undefined);

interface CheckboxGroupProps {
  children: React.ReactNode;
  defaultValue?: string[];
  onValueChange: (values: string[]) => void;
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  children,
  defaultValue = [],
  onValueChange,
  className,
}) => {
  const [values, setValues] = useState<string[]>(defaultValue);

  const handleValueChange = (newValues: string[]) => {
    setValues(newValues);
    onValueChange(newValues);
  };

  return (
    <CheckboxGroupContext.Provider value={{ values, onValueChange: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
};

interface CheckboxItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export const CheckboxItem: React.FC<CheckboxItemProps> = ({ children, value, disabled }) => {
  const context = useContext(CheckboxGroupContext);

  if (!context) {
    throw new Error('CheckboxItem must be used within a CheckboxGroup');
  }

  const { values, onValueChange } = context;
  const checked = values.includes(value);

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      onValueChange([...values, value]);
    } else {
      onValueChange(values.filter((v) => v !== value));
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`checkbox-${value}`}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
      />
      <Label htmlFor={`checkbox-${value}`} className="cursor-pointer">
        {children}
      </Label>
    </div>
  );
};
