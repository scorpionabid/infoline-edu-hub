
import React from 'react';
import { Report } from '@/types/report';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableViewProps {
  report: Report;
}

const TableView: React.FC<TableViewProps> = ({ report }) => {
  // Default dummy data
  const headers = ["ID", "Ad", "Məktəb", "Tarix", "Status"];
  const rows = [
    ["1", "Report 1", "Məktəb #5", "01.01.2023", "Aktiv"],
    ["2", "Report 2", "Məktəb #12", "05.02.2023", "Təsdiq gözləyir"],
    ["3", "Report 3", "Məktəb #7", "10.03.2023", "Tamamlanıb"],
  ];

  // Real data would be parsed from report content or fetched separately
  
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableCaption>{report.title || "Hesabat"}</TableCaption>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className="font-medium">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableView;
