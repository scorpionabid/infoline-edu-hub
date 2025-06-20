
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, Building2, Edit3, Users, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface EntryModeSelectorProps {
  selectedMode: 'single' | 'bulk' | null;
  onModeSelect: (mode: 'single' | 'bulk') => void;
  className?: string;
}

export const EntryModeSelector: React.FC<EntryModeSelectorProps> = ({
  selectedMode,
  onModeSelect,
  className
}) => {
  const { t } = useTranslation();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">{t('dataEntry.data_entry')}</h2>
        <p className="text-muted-foreground">
          {t('dataEntry.workflow.mode_selection')}
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Single School Mode */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedMode === 'single' ? 'ring-2 ring-primary border-primary bg-primary/5' : ''
          }`}
          onClick={() => onModeSelect('single')}
        >
          <CardContent className="p-6 space-y-4">
            {/* Icon and Title */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <School className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('dataEntry.workflow.single_school')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('dataEntry.workflow.single_description')}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t('dataEntry.workflow.quick_easy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t('dataEntry.workflow.school_specific')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t('dataEntry.workflow.real_time_validation')}</span>
              </div>
            </div>

            {/* Best For */}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('common.ideal')}:</span>
                <Badge variant="secondary" className="text-xs">
                  {t('dataEntry.workflow.ideal_individual')}
                </Badge>
              </div>
            </div>

            {/* Selection Button */}
            <Button 
              className="w-full mt-4"
              variant={selectedMode === 'single' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                onModeSelect('single');
              }}
            >
              {t('dataEntry.workflow.single_school')} {t('common.select')}
            </Button>
          </CardContent>
        </Card>

        {/* Bulk School Mode */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedMode === 'bulk' ? 'ring-2 ring-primary border-primary bg-primary/5' : ''
          }`}
          onClick={() => onModeSelect('bulk')}
        >
          <CardContent className="p-6 space-y-4">
            {/* Icon and Title */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('dataEntry.workflow.bulk_school')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('dataEntry.workflow.bulk_description')}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t('dataEntry.workflow.time_saving')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t('dataEntry.workflow.multi_selection')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t('dataEntry.workflow.bulk_operations')}</span>
              </div>
            </div>

            {/* Best For */}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('common.ideal')}:</span>
                <Badge variant="secondary" className="text-xs">
                  {t('dataEntry.workflow.ideal_standard')}
                </Badge>
              </div>
            </div>

            {/* Selection Button */}
            <Button 
              className="w-full mt-4"
              variant={selectedMode === 'bulk' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                onModeSelect('bulk');
              }}
            >
              {t('dataEntry.workflow.bulk_school')} {t('common.select')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Help Text */}
      {selectedMode && (
        <div className="text-center space-y-2 mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {selectedMode === 'single' 
                ? t('dataEntry.workflow.single_mode_selected') 
                : t('dataEntry.workflow.bulk_mode_selected')
              }
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('dataEntry.workflow.proceed_next')}
          </p>
        </div>
      )}
    </div>
  );
};
