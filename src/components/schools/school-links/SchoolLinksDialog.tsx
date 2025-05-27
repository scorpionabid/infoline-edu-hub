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
import { Edit, Trash2, Plus } from 'lucide-react';
import { SchoolLink } from '@/types/link';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';

interface SchoolLinksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: { id: string };
  links?: SchoolLink[];
  onDelete?: (linkId: string) => Promise<void>;
  onAdd?: (linkData: Omit<SchoolLink, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

// Define link categories
const LINK_CATEGORIES = [
  { value: 'general', label: 'Ümumi' },
  { value: 'educational', label: 'Təhsil' },
  { value: 'administrative', label: 'İnzibati' },
  { value: 'resource', label: 'Resurslar' }
];

const SchoolLinksDialog: React.FC<SchoolLinksDialogProps> = ({
  isOpen,
  onClose,
  school,
  links: propLinks,
  onDelete: propOnDelete,
  onAdd: propOnAdd,
  isLoading: propIsLoading,
}) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(propIsLoading || false);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<SchoolLink | null>(null);
  const [links, setLinks] = useState<SchoolLink[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'general'
  });

  // Fetch links from database
  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching links for school:', school.id);
      
      const { data, error } = await supabase
        .from('school_links')
        .select('*')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched links:', data);
      setLinks(data || []);
    } catch (error: any) {
      console.error('Error fetching links:', error);
      toast.error(t('errorFetchingLinks') || 'Link məlumatlarını əldə edərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch links when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchLinks();
    }
  }, [isOpen, school.id]);

  // Initialize form when editing a link
  useEffect(() => {
    if (editingLink) {
      setFormData({
        title: editingLink.title || '',
        url: editingLink.url || '',
        description: editingLink.description || '',
        category: editingLink.category || 'general'
      });
    } else {
      // Reset form when creating a new link
      setFormData({
        title: '',
        url: '',
        description: '',
        category: 'general'
      });
    }
  }, [editingLink]);

  // Direct database operations
  const createLink = async (linkData: Omit<SchoolLink, 'id'>) => {
    try {
      console.log('Creating link with data:', linkData);
      
      const { data, error } = await supabase
        .from('school_links')
        .insert([linkData])
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Link created successfully:', data);
      
      // Also call the prop function if provided
      if (propOnAdd) {
        await propOnAdd(linkData);
      }
      
      return data[0];
    } catch (error: any) {
      console.error('Error creating link:', error);
      throw error;
    }
  };

  const updateLink = async (linkData: SchoolLink) => {
    try {
      console.log('Updating link with data:', linkData);
      
      const { data, error } = await supabase
        .from('school_links')
        .update({
          title: linkData.title,
          url: linkData.url,
          description: linkData.description,
          category: linkData.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkData.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Link updated successfully:', data);
      return data[0];
    } catch (error: any) {
      console.error('Error updating link:', error);
      throw error;
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      console.log('Deleting link with id:', linkId);
      
      const { error } = await supabase
        .from('school_links')
        .delete()
        .eq('id', linkId);
      
      if (error) {
        throw error;
      }
      
      console.log('Link deleted successfully');
      
      // Also call the prop function if provided
      if (propOnDelete) {
        await propOnDelete(linkId);
      }
    } catch (error: any) {
      console.error('Error deleting link:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    try {
      setIsLoading(true);
      if (editingLink) {
        await updateLink({ ...editingLink, ...formData });
        toast.success(t('linkUpdated') || 'Link uğurla yeniləndi');
      } else {
        // Add missing required fields for SchoolLink type
        const newLink: Omit<SchoolLink, 'id'> = {
          ...formData,
          school_id: school.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await createLink(newLink);
        toast.success(t('linkAdded') || 'Link uğurla əlavə edildi');
      }
      setShowForm(false);
      setEditingLink(null);
      await fetchLinks();
    } catch (error: any) {
      console.error('Error submitting link:', error);
      toast.error(t('errorSubmittingLink') || 'Link göndərilərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (link: SchoolLink) => {
    console.log('Edit link clicked for:', link);
    setEditingLink(link);
    setShowForm(true);
  };

  const handleDelete = async (link: SchoolLink) => {
    try {
      setIsLoading(true);
      await deleteLink(link.id);
      toast.success(t('linkDeleted') || 'Link uğurla silindi');
      await fetchLinks();
    } catch (error: any) {
      console.error('Error deleting link:', error);
      toast.error(t('errorDeletingLink') || 'Link silinərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddLinkClick = () => {
    console.log('Add link button clicked');
    setEditingLink(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    setShowForm(false);
    setEditingLink(null);
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

        {showForm ? (
          // Show the link form when showForm is true
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4">{editingLink ? t('editLink') : t('addLink')}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  {t('title')}
                </label>
                <Input 
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium mb-1">
                  {t('url')}
                </label>
                <Input 
                  id="url" 
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  {t('description')}
                </label>
                <Textarea 
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  {t('category')}
                </label>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {LINK_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {editingLink ? t('update') : t('add')}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // Show the links table when showForm is false
          <div className="grid gap-4 py-4">
            <div className="flex justify-start">
              <Button 
                onClick={handleAddLinkClick}
                className="flex items-center gap-2"
                type="button"
              >
                <Plus size={16} />
                {t('addLink')}
              </Button>
            </div>

            {links.length > 0 ? (
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
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {t('noLinksFound')}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolLinksDialog;
