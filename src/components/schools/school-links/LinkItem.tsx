import React from 'react';
import { SchoolLink } from '../../../types/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { H4, P } from '@/components/ui/typography';

interface LinkItemProps {
  link: SchoolLink;
  onEdit: (link: SchoolLink) => void;
  onDelete: (link: SchoolLink) => void;
  readonly?: boolean;
}

export const LinkItem: React.FC<LinkItemProps> = ({ link, onEdit, onDelete, readonly = false }) => {
  return (
    <Card className="mb-2">
      <CardContent>
        <H4 className="font-semibold">{link.title}</H4>
        <P className="text-gray-500 mb-2">
          {link.category}
        </P>
        {link.description && (
          <P className="mb-2">
            {link.description}
          </P>
        )}
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 hover:underline"
        >
          {link.url}
        </a>
      </CardContent>
      {!readonly && (
        <CardFooter className="flex justify-end space-x-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(link)}>
            Düzəliş et
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(link)}>
            Sil
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
