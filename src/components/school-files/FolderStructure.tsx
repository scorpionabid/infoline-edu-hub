import React from 'react';
import { FileCategory } from '../../types/file';
import { Icon, Typography } from '../ui';

interface FolderStructureProps {
  categories: FileCategory[];
  activeCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const FolderStructure: React.FC<FolderStructureProps> = ({ 
  categories, 
  activeCategory, 
  onSelectCategory 
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="mb-3">
        <Typography variant="h6">Qovluqlar</Typography>
      </div>
      
      <ul className="space-y-2">
        <li>
          <button
            className={`flex items-center w-full text-left p-2 rounded hover:bg-gray-100 ${
              activeCategory === null ? 'bg-gray-200' : ''
            }`}
            onClick={() => onSelectCategory(null)}
          >
            <Icon name="folder" className="mr-2" />
            <span>Bütün fayllar</span>
          </button>
        </li>
        
        {categories.map(category => (
          <li key={category.id}>
            <button
              className={`flex items-center w-full text-left p-2 rounded hover:bg-gray-100 ${
                activeCategory === category.id ? 'bg-gray-200' : ''
              }`}
              onClick={() => onSelectCategory(category.id)}
            >
              <Icon name={category.icon || 'folder'} className="mr-2" />
              <span>{category.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
