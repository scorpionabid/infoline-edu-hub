import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/common/useToast';
import { SchoolLink } from '@/types/link';
import { useEntityLinks } from '@/hooks/common/useEntityLinks';
import { LinkForm } from './LinkForm';
import { LinkList } from './LinkList';

interface SchoolLinksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: {
    id: string;
    name: string;
    region_id?: string;
    sector_id?: string;
  } | null;
  userRole: string;
}

export const SchoolLinksDialog: React.FC<SchoolLinksDialogProps> = ({
  isOpen,
  onClose,
  school,
  userRole
}) => {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLink, setEditingLink] = useState<SchoolLink | null>(null);
  
  // Determine entity type based on user role
  const entityType = userRole === 'schooladmin' ? 'school' : 
                    userRole === 'sectoradmin' ? 'sector' : 
                    userRole === 'regionadmin' ? 'region' : 'school';
  
  // Get entity ID based on role
  const entityId = userRole === 'schooladmin' ? school?.id :
                  userRole === 'sectoradmin' ? school?.sector_id :
                  userRole === 'regionadmin' ? school?.region_id : school?.id;
  
  const { links, loading, createLink, updateLink, deleteLink, refetch } = useEntityLinks(
    entityType, 
    userRole === 'schooladmin' ? school?.id : entityId
  );
  
  const { success } = useToast();
  
  useEffect(() => {
    if (isOpen && school) {
      refetch();
    }
  }, [isOpen, school, refetch]);
  
  const handleAddLink = async (linkData: any) => {
    try {
      if (school) {
        await createLink({
          ...linkData,
          school_id: school.id
        });
        setIsAddingLink(false);
        success('Link uğurla əlavə edildi');
      }
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };
  
  const handleUpdateLink = async (linkData: any) => {
    try {
      if (editingLink) {
        await updateLink(editingLink.id, linkData);
        setEditingLink(null);
        success('Link uğurla yeniləndi');
      }
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };
  
  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteLink(linkId);
      success('Link uğurla silindi');
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };
  
  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const handleCloseDialog = () => {
    setIsAddingLink(false);
    setEditingLink(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {school?.name} - Linklər
          </DialogTitle>
          <DialogDescription>
            Məktəb üçün linklər və faydalı resurslar
          </DialogDescription>
        </DialogHeader>
        
        {isAddingLink || editingLink ? (
          <LinkForm 
            initialData={editingLink || undefined} 
            onSubmit={editingLink ? handleUpdateLink : handleAddLink}
            onCancel={() => {
              setIsAddingLink(false);
              setEditingLink(null);
            }}
          />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => setIsAddingLink(true)} 
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" /> Yeni Link Əlavə Et
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-4">Yüklənir...</div>
            ) : links.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Bu məktəb üçün heç bir link əlavə edilməyib
              </div>
            ) : (
              <LinkList 
                links={links} 
                onEdit={setEditingLink}
                onDelete={handleDeleteLink}
                onOpen={handleOpenLink}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
