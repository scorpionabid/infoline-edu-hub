
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useSectors } from '@/hooks/sectors/useSectors';
import { EnhancedSector } from '@/types/sector';

interface SectorTableProps {
  onEdit: (sector: EnhancedSector) => void;
  onDelete: (sector: EnhancedSector) => void;
  onAssignAdmin: (sector: EnhancedSector) => void;
}

export const SectorTable: React.FC<SectorTableProps> = ({
  onEdit,
  onDelete,
  onAssignAdmin
}) => {
  const [sectors, setSectors] = React.useState<EnhancedSector[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // useSectors hook-unun qaytardığı real məlumatları istifadə et
  const { sectors: sectorData, loading: isLoading } = useSectors();
  
  React.useEffect(() => {
    if (sectorData) {
      setSectors(sectorData as EnhancedSector[]);
      setLoading(isLoading);
    }
  }, [sectorData, isLoading]);

  if (loading) {
    return <div className="text-center py-4">Yüklənir...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Təsvir</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Əməliyyatlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectors.map((sector) => (
            <TableRow key={sector.id}>
              <TableCell className="font-medium">{sector.name}</TableCell>
              <TableCell>{sector.region_name}</TableCell>
              <TableCell>{sector.description}</TableCell>
              <TableCell>{sector.status}</TableCell>
              <TableCell>{sector.admin_email || 'Təyin edilməyib'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onEdit(sector)}>
                      Redaktə et
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAssignAdmin(sector)}>
                      Admin təyin et
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(sector)}>
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
