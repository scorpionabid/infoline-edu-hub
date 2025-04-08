import React, { ReactNode, ComponentProps } from 'react';
import {
  Command as CmdkCommand
} from '@/components/ui/command';

// Command komponentinin props tipini əldə edirik
type CmdkCommandProps = ComponentProps<typeof CmdkCommand>;

interface SafeCommandProps extends Omit<CmdkCommandProps, 'children'> {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * CMDK Command komponentinin təhlükəsiz versiyası
 * "undefined is not iterable" xətasını aradan qaldırmaq üçün
 */
export const SafeCommand: React.FC<SafeCommandProps> = ({ 
  children, 
  fallback = null,
  ...props 
}) => {
  // Error handling üçün try-catch bloku
  try {
    return (
      <CmdkCommand {...props}>
        {children}
      </CmdkCommand>
    );
  } catch (error) {
    console.error('CMDK Command komponentində xəta:', error);
    
    // Xəta halında fallback UI göstəririk
    return (
      <div className="p-4 border rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">
          İstifadəçi seçimi komponenti yüklənərkən xəta baş verdi.
        </p>
        {fallback}
      </div>
    );
  }
};
