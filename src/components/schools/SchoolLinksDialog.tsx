
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, ExternalLink, Edit } from 'lucide-react';
import { useSchoolLinks } from '@/hooks/schools/useSchoolLinks';
import { CreateSchoolLinkData } from '@/types/link';

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
  const { links, loading, createLink, updateLink, deleteLink } = useSchoolLinks(schoolId);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'general'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLink) {
        await updateLink(editingLink.id, formData);
        setEditingLink(null);
      } else {
        const linkData: CreateSchoolLinkData = {
          school_id: schoolId,
          ...formData
        };
        await createLink(linkData);
      }
      
      setFormData({ title: '', url: '', description: '', category: 'general' });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving link:', error);
    }
  };

  const handleEdit = (link: any) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
      category: link.category
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLink(null);
    setFormData({ title: '', url: '', description: '', category: 'general' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {schoolName} - Link İdarəetməsi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showForm ? (
            <>
              <Button 
                onClick={() => setShowForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Link Əlavə Et
              </Button>

              {loading ? (
                <div className="text-center py-4">Yüklənir...</div>
              ) : (
                <div className="space-y-3">
                  {links.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Hələ ki heç bir link əlavə edilməyib
                    </div>
                  ) : (
                    links.map((link) => (
                      <div key={link.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{link.title}</h4>
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                              {link.url}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            {link.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {link.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(link)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteLink(link.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Başlıq</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Təsvir (ixtiyari)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingLink ? 'Yenilə' : 'Əlavə Et'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Ləğv Et
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
