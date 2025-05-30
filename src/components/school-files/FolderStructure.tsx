
import React from 'react';
import { Folder, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FolderItem[];
}

interface FolderStructureProps {
  items: FolderItem[];
  onItemClick?: (item: FolderItem) => void;
}

const FolderStructure: React.FC<FolderStructureProps> = ({ items, onItemClick }) => {
  const renderItem = (item: FolderItem, level: number = 0) => (
    <div key={item.id} style={{ marginLeft: `${level * 20}px` }}>
      <Button
        variant="ghost"
        className="w-full justify-start p-2 h-auto"
        onClick={() => onItemClick?.(item)}
      >
        {item.type === 'folder' ? (
          <Folder className="h-4 w-4 mr-2" />
        ) : (
          <File className="h-4 w-4 mr-2" />
        )}
        <span className="text-sm">{item.name}</span>
      </Button>
      {item.children && item.children.map(child => renderItem(child, level + 1))}
    </div>
  );

  return (
    <div className="space-y-1">
      {items.map(item => renderItem(item))}
    </div>
  );
};

export default FolderStructure;
