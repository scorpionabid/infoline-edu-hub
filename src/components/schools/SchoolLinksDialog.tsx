
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, ExternalLink, Plus } from 'lucide-react';
import { useSchoolLinks } from '@/hooks/schools/useSchoolLinks';

interface SchoolLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  schoolName: string;
}

export const SchoolLinksDialog: React.FC<SchoolLinksDialogProps> = ({
  open,
  onOpenChange,
  schoolId,
  schoolName
}) => {
  const { links, loading, createLink, deleteLink } = useSchoolLinks(schoolId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    category: 'general'
  });

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) return;
    
    try {
      await createLink({
        school_id: schoolId,
        title: newLink.title,
        url: newLink.url,
        description: newLink.description,
        category: newLink.category
      });
      
      setNewLink({ title: '', url: '', description: '', category: 'general' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteLink(linkId);
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{schoolName} - Linklər İdarəetməsi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Mövcud Linklər</h3>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Yeni Link
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Yüklənir...</div>
          ) : links.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Hələ ki heç bir link əlavə edilməyib
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{link.title}</h4>
                    <p className="text-sm text-gray-600">{link.url}</p>
                    {link.description && (
                      <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLinkClick(link.url)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddForm && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Yeni Link Əlavə Et</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Başlıq</Label>
                <Input
                  id="title"
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  placeholder="Link başlığı"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıqlama (İxtiyari)</Label>
                <Textarea
                  id="description"
                  value={newLink.description}
                  onChange={(e) => setNewLink({...newLink, description: e.target.value})}
                  placeholder="Link haqqında qısa açıqlama"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Ləğv et
                </Button>
                <Button onClick={handleAddLink}>
                  Link Əlavə Et
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
