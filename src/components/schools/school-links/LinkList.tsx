import React from 'react';
import { SchoolLink } from '../../../types/link';
import EmptyState from '@/components/ui/empty-state';
import { LoadingSpinner as Spinner } from '@/components/ui/LoadingSpinner';
import { LinkItem } from './LinkItem';

interface LinkListProps {
  links: SchoolLink[];
  loading: boolean;
  error: Error | null;
  onEdit: (link: SchoolLink) => void;
  onDelete: (link: SchoolLink) => void;
  readonly?: boolean;
}

export const LinkList: React.FC<LinkListProps> = ({ 
  links, 
  loading, 
  error, 
  onEdit, 
  onDelete, 
  readonly = false 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Linklər yüklənərkən xəta baş verdi. Yenidən cəhd edin.
      </div>
    );
  }
  
  if (links.length === 0) {
    return (
      <EmptyState
        title="Link tapılmadı"
        description="Bu məktəb üçün hələ link əlavə edilməyib."
        icon="link-2"
      />
    );
  }
  
  return (
    <div className="space-y-2">
      {links.map(link => (
        <LinkItem
          key={link.id}
          link={link}
          onEdit={onEdit}
          onDelete={onDelete}
          readonly={readonly}
        />
      ))}
    </div>
  );
};
