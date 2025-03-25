import { CategoryWithColumns } from '@/types/column';
import { generateId } from '@/utils/generateId';
import { useLanguage } from '@/context/LanguageContext';

export const createDemoCategories = (): CategoryWithColumns[] => {
  const { t } = useLanguage();

  const demoCategory1 = {
    id: generateId(),
    name: t('demoCategory1'),
    description: t('demoCategory1Description'),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    assignment: 'all' as const,
    createdAt: new Date().toISOString(),
    priority: 1,
    columns: [
      {
        id: generateId(),
        categoryId: '',
        name: t('demoCategory1Column1'),
        type: 'number',
        isRequired: true,
        order: 1,
        status: 'active',
        helpText: t('demoCategory1Column1HelpText'),
        validationRules: { minValue: 0, maxValue: 1000 },
      },
      {
        id: generateId(),
        categoryId: '',
        name: t('demoCategory1Column2'),
        type: 'text',
        isRequired: false,
        order: 2,
        status: 'active',
        helpText: t('demoCategory1Column2HelpText'),
      },
    ]
  };

  const demoCategory2 = {
    id: generateId(),
    name: t('demoCategory2'),
    description: t('demoCategory2Description'),
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    assignment: 'sectors' as const,
    createdAt: new Date().toISOString(),
    priority: 2,
    columns: [
      {
        id: generateId(),
        categoryId: '',
        name: t('demoCategory2Column1'),
        type: 'number',
        isRequired: true,
        order: 1,
        status: 'active',
        helpText: t('demoCategory2Column1HelpText'),
        validationRules: { minValue: 0, maxValue: 500 },
      },
      {
        id: generateId(),
        categoryId: '',
        name: t('demoCategory2Column2'),
        type: 'select',
        isRequired: true,
        order: 2,
        status: 'active',
        helpText: t('demoCategory2Column2HelpText'),
        options: [
          { label: t('option1'), value: 'option1' },
          { label: t('option2'), value: 'option2' },
        ],
      },
    ]
  };

  return [demoCategory1, demoCategory2];
};
