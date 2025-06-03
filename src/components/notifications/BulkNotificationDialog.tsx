
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Send, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { School } from '@/types/school';

interface BulkNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchools: School[];
  onSend: (notificationData: {
    title: string;
    message: string;
    type: string;
    priority: string;
    schoolIds: string[];
  }) => Promise<void>;
  isLoading?: boolean;
}

export const BulkNotificationDialog: React.FC<BulkNotificationDialogProps> = ({
  isOpen,
  onClose,
  selectedSchools,
  onSend,
  isLoading = false
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [priority, setPriority] = useState('normal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      return;
    }

    await onSend({
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      schoolIds: selectedSchools.map(school => school.id)
    });

    // Reset form
    setTitle('');
    setMessage('');
    setType('info');
    setPriority('normal');
    onClose();
  };

  const getTypeIcon = (notificationType: string) => {
    switch (notificationType) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const typeOptions = [
    { value: 'info', label: 'Məlumat', color: 'bg-blue-100 text-blue-800' },
    { value: 'warning', label: 'Xəbərdarlıq', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'success', label: 'Uğur', color: 'bg-green-100 text-green-800' },
    { value: 'error', label: 'Xəta', color: 'bg-red-100 text-red-800' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Aşağı' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Yüksək' },
    { value: 'critical', label: 'Kritik' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Toplu Bildiriş Göndər</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Schools */}
          <div>
            <Label className="text-sm font-medium">
              Seçilmiş məktəblər ({selectedSchools.length})
            </Label>
            <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-gray-50">
              {selectedSchools.map((school) => (
                <Badge key={school.id} variant="secondary" className="text-xs">
                  {school.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notification Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Bildiriş növü</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(option.value)}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioritet</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Başlıq *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bildiriş başlığını daxil edin"
              required
              className="mt-1"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Mesaj *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bildiriş mətnini daxil edin"
              required
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Preview */}
          {title && message && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <Label className="text-sm font-medium">Önizləmə:</Label>
              <div className="mt-2 p-3 bg-white border rounded-md">
                <div className="flex items-center space-x-2 mb-2">
                  {getTypeIcon(type)}
                  <span className="font-medium">{title}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      priority === 'critical' ? 'border-red-500 text-red-700' :
                      priority === 'high' ? 'border-orange-500 text-orange-700' :
                      'border-gray-500 text-gray-700'
                    }`}
                  >
                    {priorityOptions.find(p => p.value === priority)?.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Ləğv et
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !message.trim() || isLoading}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? 'Göndərilir...' : 'Göndər'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkNotificationDialog;
