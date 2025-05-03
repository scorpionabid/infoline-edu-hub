
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useNotificationsQuery } from '@/hooks/useNotificationsQuery';
import { useLanguage } from '@/context/LanguageContext';

const NotificationSystem: React.FC = () => {
  const { t } = useLanguage();
  const { notifications, isLoading, error, refetch } = useNotificationsQuery();

  useEffect(() => {
    if (!isLoading && !error && notifications && notifications.length > 0) {
      notifications.forEach(notification => {
        if (!(notification.is_read || notification.read)) {
          toast(notification.title, {
            description: notification.message || t('noDescription'),
            duration: 5000,
            className: 'bg-white border border-gray-200 shadow-md rounded-md',
            onAutoClose: () => {
              // Bildiriş avtomatik bağlandıqda oxundu kimi qeyd et
              // Burada API endpoint-ə bildirişin ID-sini göndərmək lazımdır
              console.log(`Bildiriş oxundu kimi qeyd edildi: ${notification.id}`);
              // refetch(); // Bildirişləri yenidən yüklə
            },
            action: {
              label: 'Ətraflı bax',
              onClick: () => {
                // Ətraflı bax linkinə klikləndikdə baş verəcək hadisələr
                console.log(`Ətraflı bax klikləndi: ${notification.id}`);
                // Bildirişi oxundu kimi qeyd et və ətraflı səhifəyə yönləndir
                // window.location.href = `/notifications/${notification.id}`;
                refetch(); // Bildirişləri yenidən yüklə
              },
            }
          });
        }
      });
    }
  }, [notifications, isLoading, error, t, refetch]);

  return null; // Bu komponent heç bir UI render etmir
};

export default NotificationSystem;
