import * as XLSX from 'xlsx';
import { EntryTicket } from '../types';

export interface ExcelTicketRow {
  ticketName: string;
  adultCost: number;
  childCost: number;
  rowNumber: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const generateEntryTicketTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Ticket Name', 'Adult Cost', 'Child Cost'],
    ['Temple Entry Fee', '50000', '25000'],
    ['Museum Pass', '75000', '75000'],
    ['National Park Entry', '100000', '50000']
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Entry Tickets');

  XLSX.writeFile(wb, 'entry_tickets_template.xlsx');
};

export const parseEntryTicketExcel = (file: File): Promise<{ rows: ExcelTicketRow[], errors: ValidationError[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const rows: ExcelTicketRow[] = [];
        const errors: ValidationError[] = [];

        if (jsonData.length < 2) {
          errors.push({ row: 0, field: 'file', message: 'Excel file is empty or has no data rows' });
          resolve({ rows, errors });
          return;
        }

        const headers = jsonData[0];
        const expectedHeaders = ['Ticket Name', 'Adult Cost', 'Child Cost'];

        const hasValidHeaders = expectedHeaders.every((header, index) =>
          headers[index]?.toString().toLowerCase().trim() === header.toLowerCase()
        );

        if (!hasValidHeaders) {
          errors.push({
            row: 0,
            field: 'headers',
            message: 'Invalid Excel format. Expected columns: Ticket Name, Adult Cost, Child Cost'
          });
          resolve({ rows, errors });
          return;
        }

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowNumber = i + 1;

          if (!row || row.length === 0 || !row[0]) {
            continue;
          }

          const ticketName = row[0]?.toString().trim() || '';
          const adultCostRaw = row[1];
          const childCostRaw = row[2];

          if (!ticketName) {
            errors.push({ row: rowNumber, field: 'Ticket Name', message: 'Ticket name is required' });
            continue;
          }

          const adultCost = parseFloat(adultCostRaw);
          if (isNaN(adultCost) || adultCost < 0) {
            errors.push({ row: rowNumber, field: 'Adult Cost', message: 'Adult cost must be a valid positive number' });
            continue;
          }

          const childCost = parseFloat(childCostRaw);
          if (isNaN(childCost) || childCost < 0) {
            errors.push({ row: rowNumber, field: 'Child Cost', message: 'Child cost must be a valid positive number' });
            continue;
          }

          rows.push({
            ticketName,
            adultCost,
            childCost,
            rowNumber
          });
        }

        resolve({ rows, errors });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
};

export const convertExcelRowsToTickets = (
  rows: ExcelTicketRow[],
  areaId: string,
  areaName: string
): EntryTicket[] => {
  return rows.map(row => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: row.ticketName,
    adultCost: row.adultCost,
    childCost: row.childCost,
    areaId: areaId || undefined,
    areaName: areaName || undefined
  }));
};
