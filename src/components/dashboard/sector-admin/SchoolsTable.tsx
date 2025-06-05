
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface SchoolStat {
  id: string;
  name: string;
  status: string;
  completionRate: number;
  lastUpdated: string;
  studentCount?: number;
  teacherCount?: number;
}

interface SchoolsTableProps {
  schools: SchoolStat[];
  onView: (schoolId: string) => void;
  onEdit: (schoolId: string) => void;
  onDelete: (schoolId: string) => void;
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({
  schools,
  onView,
  onEdit,
  onDelete
}) => {
  const getStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'default' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>School Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Completion Rate</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Teachers</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schools.map((school) => (
          <TableRow key={school.id}>
            <TableCell className="font-medium">{school.name}</TableCell>
            <TableCell>{getStatusBadge(school.status)}</TableCell>
            <TableCell>{school.completionRate}%</TableCell>
            <TableCell>{formatDate(school.lastUpdated)}</TableCell>
            <TableCell>{school.studentCount || 0}</TableCell>
            <TableCell>{school.teacherCount || 0}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(school.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(school.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(school.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SchoolsTable;
