
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, School } from 'lucide-react';
import { School as SchoolType } from '@/types/school';

interface SingleNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolType;
  onSend: (data: any) => Promise<void>;
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
  const [priority, setPriority] = useState('normal');
  const [type, setType] = useState('reminder');

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;

    await onSend({
      title,
      message,
      priority,
      type,
      schoolId: school.id
    });

    // Reset form
    setTitle('');
    setMessage('');
    setPriority('normal');
    setType('reminder');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Bildiriş Göndər
          </DialogTitle>
          <DialogDescription>
            {school.name} məktəbinə bildiriş göndəriləcək
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlıq</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bildiriş başlığı..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Növ</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reminder">Xatırlatma</SelectItem>
                <SelectItem value="deadline">Son tarix</SelectItem>
                <SelectItem value="update">Yenilik</SelectItem>
                <SelectItem value="urgent">Təcili</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioritet</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Aşağı</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Yüksək</SelectItem>
                <SelectItem value="urgent">Təcili</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mesaj</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bildiriş məzmunu..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Ləğv et
          </Button>
          <Button onClick={handleSend} disabled={!title.trim() || !message.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Göndərilir...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Göndər
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
