
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  created_at: string;
}

interface SchoolsListProps {
  schools: School[];
  onEdit?: (school: School) => void;
  onDelete?: (schoolId: string) => void;
}

export const SchoolsList: React.FC<SchoolsListProps> = ({
  schools,
  onEdit,
  // onDelete
}) => {
  if (!schools || schools.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Heç bir məktəb tapılmadı
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {schools.map((school) => (
        <Card key={school.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{school.name}</span>
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(school)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(school.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default SchoolsList;
