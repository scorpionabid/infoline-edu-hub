import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, Building2, Edit3, Users, Clock, CheckCircle } from 'lucide-react';

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
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Melumat Daxil Etme</h2>
        <p className="text-muted-foreground">
          Hansi usulla melumat daxil etmek istediyinizi secin
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
                <h3 className="text-lg font-semibold">Tek Mekteb</h3>
                <p className="text-sm text-muted-foreground">
                  Bir mekteb ucun melumat daxil edin
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Tez ve asan daxil etme</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Mekteb-spesifik melumatlar</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Real-time validation</span>
              </div>
            </div>

            {/* Best For */}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ideal:</span>
                <Badge variant="secondary" className="text-xs">
                  Ferdi melumatlar
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
              Tek Mekteb Sec
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
                <h3 className="text-lg font-semibold">Bulk Mekteb</h3>
                <p className="text-sm text-muted-foreground">
                  Coxlu mekteb ucun eyni melumat
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Vaxt qenaeti</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Coxlu mekteb secimi</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Toplu emeliyyatlar</span>
              </div>
            </div>

            {/* Best For */}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ideal:</span>
                <Badge variant="secondary" className="text-xs">
                  Standart melumatlar
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
              Bulk Mekteb Sec
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
              {selectedMode === 'single' ? 'Tek mekteb rejimi secildi' : 'Bulk mekteb rejimi secildi'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedMode === 'single' 
              ? 'Indi kateqoriya ve sutun secimi ucun novbeti addima kecin'
              : 'Indi kateqoriya ve sutun secimi ucun novbeti addima kecin'
            }
          </p>
        </div>
      )}
    </div>
  );
};