import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash2 } from 'lucide-react';
import { LinkFormProps, SchoolLink } from '@/types/link';
import LinkForm from './LinkForm';

interface SchoolLinksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: { id: string };
  links: SchoolLink[];
  onDelete: (linkId: string) => Promise<void>;
  onCreate: (linkData: Omit<SchoolLink, 'id'>) => Promise<void>;
  onUpdate: (linkData: SchoolLink) => Promise<void>;
  fetchLinks: () => Promise<void>;
}

const SchoolLinksDialog: React.FC<SchoolLinksDialogProps> = ({
  isOpen,
  onClose,
  school,
  links,
  onDelete,
  onCreate,
  onUpdate,
  fetchLinks,
}) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingLink, setEditingLink] = useState<SchoolLink | null>(null);

  const handleLinkSubmit = async (linkData: any) => {
    try {
      setIsLoading(true);
      if (editingLink) {
        await onUpdate({ ...editingLink, ...linkData });
        toast.success(t('linkUpdated'));
      } else {
        await onCreate({ ...linkData, school_id: school.id });
        toast.success(t('linkAdded'));
      }
      setShowLinkForm(false);
      setEditingLink(null);
      await fetchLinks();
    } catch (error: any) {
      console.error('Error submitting link:', error);
      toast.error(t('errorSubmittingLink'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (link: SchoolLink) => {
    setEditingLink(link);
    setShowLinkForm(true);
  };

  const handleDelete = async (link: SchoolLink) => {
    try {
      setIsLoading(true);
      await onDelete(link.id);
      toast.success(t('linkDeleted'));
      fetchLinks();
    } catch (error: any) {
      console.error('Error deleting link:', error);
      toast.error(t('errorDeletingLink'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('schoolLinks')}</DialogTitle>
          <DialogDescription>
            {t('manageSchoolLinks')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button onClick={() => setShowLinkForm(true)}>{t('addLink')}</Button>

          <Table>
            <TableCaption>{t('schoolLinksList')}</TableCaption>
            <TableHead>
              <TableRow>
                <TableHead>{t('title')}</TableHead>
                <TableHead>{t('url')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.title}</TableCell>
                  <TableCell><a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a></TableCell>
                  <TableCell>{link.category}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(link)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('edit')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(link)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('close')}
          </Button>
        </DialogFooter>
        
        {showLinkForm && (
          <LinkForm
            editData={editingLink}
            onSubmit={handleLinkSubmit}
            onCancel={() => {
              setShowLinkForm(false);
              setEditingLink(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SchoolLinksDialog;
