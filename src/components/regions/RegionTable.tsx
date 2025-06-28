
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { regionsStore } from '@/hooks/regions/useRegionsStore';
import { EnhancedRegion } from '@/types/region';

interface RegionTableProps {
  onEdit: (region: EnhancedRegion) => void;
  onDelete: (region: EnhancedRegion) => void;
  onAssignAdmin: (region: EnhancedRegion) => void;
}

export const RegionTable: React.FC<RegionTableProps> = ({
  onEdit,
  onDelete,
  onAssignAdmin
}) => {
  const regions = regionsStore(state => state.regions);
  const loading = regionsStore(state => state.loading);

  if (loading) {
    return <div className="text-center py-4">Yüklənir...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad</TableHead>
            <TableHead>Təsvir</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Əməliyyatlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regions.map((region) => (
            <TableRow key={region.id}>
              <TableCell className="font-medium">{region.name}</TableCell>
              <TableCell>{region.description}</TableCell>
              <TableCell>{region.status}</TableCell>
              <TableCell>{region.admin_email || 'Təyin edilməyib'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onEdit(region)}>
                      Redaktə et
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAssignAdmin(region)}>
                      Admin təyin et
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(region)}>
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
