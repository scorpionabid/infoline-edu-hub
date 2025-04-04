// Xətasını düzəltmək üçün id və name eyni hissələrindən istifadə
import React from 'react';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithColumns } from '@/types/column';

// Rast gəlinən sətirdəki name əvəzinə category.name istifadə edək
const useSchoolColumnData = (columns: CategoryWithColumns[]) => {
  const { t } = useLanguage();

  const getColumnById = (categoryId: string, columnId: string) => {
    const category = columns.find(c => c.id === categoryId || c.category.id === categoryId);
    if (!category) return null;
    return category.columns.find(col => col.id === columnId);
  };

  const getColumnFormatted = ({ value, column }) => {
    if (value === null || value === undefined) return t('notAvailable');
    if (column.type === 'number') return Number(value).toLocaleString();
    return String(value);
  };

  return {
    getColumnById: (categoryId: string, columnId: string) => {
      const category = columns.find(c => c.id === categoryId || c.category.id === categoryId);
      if (!category) return null;
      return category.columns.find(col => col.id === columnId);
    },
    getColumnFormatted: (column) => {
      if (column.value === null || column.value === undefined) return t('notAvailable');
      if (column.column.type === 'number') return Number(column.value).toLocaleString();
      return String(column.value);
    },
  };
};

interface SchoolColumnTableProps {
  categories: CategoryWithColumns[];
  schoolData: Record<string, any>;
  filterCriteria?: {
    categoryId?: string;
    columnIds?: string[];
  };
}

const SchoolColumnTable: React.FC<SchoolColumnTableProps> = ({
  categories,
  schoolData,
  filterCriteria
}) => {
  const { t } = useLanguage();
  const { getColumnFormatted } = useSchoolColumnData(categories);

  // Filter categories if specified
  const filteredCategories = filterCriteria?.categoryId
    ? categories.filter(cat => cat.category.id === filterCriteria.categoryId)
    : categories;

  // Get all columns from filtered categories
  const allColumns = filteredCategories.flatMap(cat => 
    filterCriteria?.columnIds 
      ? cat.columns.filter(col => filterCriteria.columnIds?.includes(col.id))
      : cat.columns
  );

  // Group columns by category
  const columnsByCategory = filteredCategories.map(cat => ({
    category: cat.category,
    columns: filterCriteria?.columnIds 
      ? cat.columns.filter(col => filterCriteria.columnIds?.includes(col.id))
      : cat.columns
  })).filter(group => group.columns.length > 0);

  return (
    <div className="overflow-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[180px] font-medium">{t('school')}</TableHead>
            {columnsByCategory.map((group, index) => (
              <React.Fragment key={index}>
                <TableHead
                  colSpan={group.columns.length}
                  className="text-center font-medium border-l"
                >
                  {group.category.name}
                </TableHead>
              </React.Fragment>
            ))}
          </TableRow>
          <TableRow>
            <TableHead className="font-medium">{t('schoolName')}</TableHead>
            {columnsByCategory.flatMap((group, groupIndex) =>
              group.columns.map((column, colIndex) => (
                <TableHead
                  key={`${groupIndex}-${colIndex}`}
                  className={`font-medium ${colIndex === 0 ? 'border-l' : ''}`}
                >
                  {column.name}
                </TableHead>
              ))
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.keys(schoolData).map((schoolId) => (
            <TableRow key={schoolId}>
              <TableCell className="font-medium">
                {schoolData[schoolId].name}
              </TableCell>
              {columnsByCategory.flatMap((group, groupIndex) =>
                group.columns.map((column, colIndex) => (
                  <TableCell
                    key={`${schoolId}-${groupIndex}-${colIndex}`}
                    className={`${colIndex === 0 ? 'border-l' : ''}`}
                  >
                    {getColumnFormatted({
                      value: schoolData[schoolId][column.id],
                      column
                    })}
                  </TableCell>
                ))
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SchoolColumnTable;
