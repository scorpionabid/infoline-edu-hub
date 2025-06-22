
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';

interface SchoolLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  links?: any[];
}

export const SchoolLinksDialog: React.FC<SchoolLinksDialogProps> = ({
  open,
  onOpenChange,
  schoolId,
  links = []
}) => {
  const [schoolLinks, setSchoolLinks] = useState(links);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' });

  const handleAddLink = () => {
    if (newLink.title && newLink.url) {
      setSchoolLinks([...schoolLinks, { ...newLink, id: Date.now() }]);
      setNewLink({ title: '', url: '', description: '' });
    }
  };

  const handleDeleteLink = (linkId: number) => {
    setSchoolLinks(schoolLinks.filter(link => link.id !== linkId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Məktəb Linkləri</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkTitle">Başlıq</Label>
              <Input
                id="linkTitle"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                placeholder="Link başlığı"
              />
            </div>
            <div>
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="linkDescription">Təsvir</Label>
            <Input
              id="linkDescription"
              value={newLink.description}
              onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
              placeholder="Link təsviri"
            />
          </div>
          
          <Button onClick={handleAddLink} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Link əlavə et
          </Button>
          
          <div className="space-y-2">
            <h4 className="font-medium">Mövcud Linklər</h4>
            {schoolLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Heç bir link əlavə edilməyib</p>
            ) : (
              schoolLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{link.title}</div>
                    <div className="text-sm text-muted-foreground">{link.url}</div>
                    {link.description && (
                      <div className="text-xs text-muted-foreground">{link.description}</div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => window.open(link.url, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLink(link.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolLinksDialog;
