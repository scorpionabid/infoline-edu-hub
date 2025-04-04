
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilePlus, Search } from 'lucide-react';

interface CategoryFilterCardProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
}

const CategoryFilterCard: React.FC<CategoryFilterCardProps> = ({
  searchTerm,
  setSearchTerm,
  onRefresh
}) => {
  const { t } = useLanguage();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('filterCategories')}</CardTitle>
            <CardDescription>{t('filterCategoriesDescription')}</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1" 
            onClick={onRefresh}
          >
            <FilePlus className="h-4 w-4" />
            {t('refresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchCategories')}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilterCard;
