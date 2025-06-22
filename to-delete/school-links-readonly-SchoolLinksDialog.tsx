
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SchoolLink } from '@/types/school-link';

interface SchoolLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  links: SchoolLink[];
}

const SchoolLinksDialog: React.FC<SchoolLinksDialogProps> = ({
  open,
  onOpenChange,
  schoolId,
  links
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>School Links</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {links.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No links available for this school
            </p>
          ) : (
            links.map((link) => (
              <div key={link.id} className="p-3 border rounded-lg">
                <h4 className="font-medium">{link.title}</h4>
                {link.description && (
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                )}
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Open Link
                </a>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolLinksDialog;
