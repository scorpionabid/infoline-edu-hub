
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Plus } from 'lucide-react';
import { SectorLink } from '@/types/school-link';

interface SectorLinksCardProps {
  links: SectorLink[];
  onAddLink?: () => void;
  onEditLink?: (link: SectorLink) => void;
}

const SectorLinksCard: React.FC<SectorLinksCardProps> = ({ 
  links, 
  onAddLink, 
  onEditLink 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sector Links</CardTitle>
          {onAddLink && (
            <Button variant="outline" size="sm" onClick={onAddLink}>
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {links.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No links available
            </p>
          ) : (
            links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{link.title}</h4>
                  {link.description && (
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  )}
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline inline-flex items-center mt-1"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Link
                  </a>
                </div>
                {onEditLink && (
                  <Button variant="ghost" size="sm" onClick={() => onEditLink(link)}>
                    Edit
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorLinksCard;
