
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
import { Send, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { School } from '@/types/school';

interface SingleNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onSend: (notificationData: {
    title: string;
    message: string;
    type: string;
    priority: string;
    schoolId: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const SingleNotificationDialog: React.FC<SingleNotificationDialogProps> = ({
  isOpen,
  onClose,
  school,
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
      schoolId: school.id
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
    { value: 'info', label: 'Məlumat' },
    { value: 'warning', label: 'Xəbərdarlıq' },
    { value: 'success', label: 'Uğur' },
    { value: 'error', label: 'Xəta' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Aşağı' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Yüksək' },
    { value: 'critical', label: 'Kritik' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Bildiriş Göndər</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* School Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium">Məktəb:</Label>
            <p className="text-sm text-gray-700 mt-1">{school.name}</p>
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
              rows={3}
            />
          </div>

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

export default SingleNotificationDialog;
