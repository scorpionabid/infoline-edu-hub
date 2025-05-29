import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2, ExternalLink } from 'lucide-react';
import { useEntityLinks } from '@/hooks/common/useEntityLinks';
import { useAuth } from '@/context/auth';

export const RegionLinksCard: React.FC = () => {
  const { user } = useAuth();
  const regionId = user?.region_id;
  const { links, loading } = useEntityLinks('region', regionId);

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Region Linkləri
        </CardTitle>
        <Link2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Yüklənir...</div>
        ) : links.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Hələ ki heç bir link paylaşılmayıb
          </div>
        ) : (
          <div className="space-y-2">
            {links.slice(0, 3).map((link) => (
              <div key={link.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{link.title}</p>
                  {link.description && (
                    <p className="text-xs text-muted-foreground">
                      {link.description}
                    </p>
                  )}
                  {/* School information is not available in the SchoolLink type */}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLinkClick(link.url)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {links.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{links.length - 3} əlavə link
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
