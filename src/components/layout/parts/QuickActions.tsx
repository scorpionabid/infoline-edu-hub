import React, { useState } from 'react';
import { Plus, Upload, BarChart, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useTranslation } from '@/contexts/TranslationContext';
import { useTouchGestures } from '@/hooks/layout/mobile/useTouchGestures';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  gradient: string;
  visible: boolean;
}

const QuickActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {
    isSchoolAdmin,
    isSectorAdmin,
    canManageSchools,
    canViewReports
  } = usePermissions();

  // Touch gestures for mobile interaction
  const touchGestures = useTouchGestures({
    onTap: () => setIsOpen(!isOpen),
    onSwipeUp: () => setIsOpen(true),
    onSwipeDown: () => setIsOpen(false)
  });
  
  // Extract only the needed touch handlers, not isGesturing
  const { onTouchStart, onTouchMove, onTouchEnd } = touchGestures;

  // Quick actions based on user role
  const quickActions: QuickAction[] = [
    {
      id: 'data-entry',
      label: t('quickActions.dataEntry') || 'Məlumat Girişi',
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      action: () => {
        navigate(isSchoolAdmin ? '/school-data-entry' : '/data-entry');
        setIsOpen(false);
      },
      visible: isSchoolAdmin || isSectorAdmin
    },
    {
      id: 'excel-upload',
      label: t('quickActions.excelUpload') || 'Excel Yüklə',
      icon: Upload,
      gradient: 'from-green-500 to-green-600',
      action: () => {
        navigate('/data-entry?action=upload');
        setIsOpen(false);
      },
      visible: isSchoolAdmin || isSectorAdmin
    },
    {
      id: 'new-school',
      label: t('quickActions.newSchool') || 'Yeni Məktəb',
      icon: Plus,
      gradient: 'from-purple-500 to-purple-600',
      action: () => {
        navigate('/schools?action=create');
        setIsOpen(false);
      },
      visible: canManageSchools
    },
    {
      id: 'create-report',
      label: t('quickActions.createReport') || 'Hesabat Yarat',
      icon: BarChart,
      gradient: 'from-orange-500 to-orange-600',
      action: () => {
        navigate('/reports?action=create');
        setIsOpen(false);
      },
      visible: canViewReports
    }
  ].filter(action => action.visible);

  // Don't render if no actions available
  if (quickActions.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className={cn(
                  "transform transition-all duration-300 ease-out",
                  isOpen 
                    ? "translate-y-0 opacity-100 scale-100" 
                    : "translate-y-4 opacity-0 scale-95"
                )}
                style={{
                  transitionDelay: `${index * 50}, ms`
                }}
              >
                <Button
                  onClick={action.action}
                  className={cn(
                    "h-12 w-12 rounded-full shadow-lg",
                    "bg-gradient-to-r", action.gradient,
                    "text-white hover:shadow-xl",
                    "transition-all duration-200",
                    "active:scale-95"
                  )}
                  size="icon"
                  title={action.label}
                >
                  <Icon className="h-5 w-5" />
                </Button>
                
                {/* Label */}
                <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
                  <div className="bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-1 shadow-md">
                    <span className="text-sm font-medium whitespace-nowrap">
                      {action.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-primary to-primary/90",
          "text-primary-foreground hover:shadow-xl",
          "transition-all duration-300 ease-out",
          "active:scale-95",
          isOpen && "rotate-45"
        )}
        size="icon"
        aria-label={isOpen ? t('quickActions.close') || 'Bağla' : t('quickActions.open') || 'Sürətli əməliyyatlar'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default QuickActions;