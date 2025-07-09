
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatCurrency";
import { useFinance } from "@/contexts/FinanceContext";
import { formatDate } from "@/utils/tableUtils";

interface DetailedReportTableProps {
  reportData: {
    data: Array<{
      categoryName: string;
      total: number;
      count: number;
      items: any[];
    }>;
    grandTotal: number;
  };
}

export default function DetailedReportTable({ reportData }: DetailedReportTableProps) {
  const { clientsSuppliers } = useFinance();

  const getClientSupplierName = (item: any) => {
    if (item.clientSupplierId) {
      const clientSupplier = clientsSuppliers.find(cs => cs.id === item.clientSupplierId);
      return clientSupplier?.name || 'N/A';
    }
    
    if (item.client_supplier_id) {
      const clientSupplier = clientsSuppliers.find(cs => cs.id === item.client_supplier_id);
      return clientSupplier?.name || 'N/A';
    }
    
    if (item.supplier_id) {
      const clientSupplier = clientsSuppliers.find(cs => cs.id === item.supplier_id);
      return clientSupplier?.name || 'N/A';
    }
    
    if (item.client_id) {
      const clientSupplier = clientsSuppliers.find(cs => cs.id === item.client_id);
      return clientSupplier?.name || 'N/A';
    }
    
    const clientSupplier = clientsSuppliers.find(cs => 
      cs.id === item.clientId || cs.id === item.supplierId
    );
    return clientSupplier?.name || 'N/A';
  };

  const getFormattedDate = (item: any) => {
    let dateToUse = null;
    
    if (item.payment_date) {
      dateToUse = item.payment_date;
    } else if (item.paymentDate) {
      dateToUse = item.paymentDate;
    } else if (item.paidDate) {
      dateToUse = item.paidDate;
    } else if (item.receivedDate) {
      dateToUse = item.receivedDate;
    } else if (item.due_date) {
      dateToUse = item.due_date;
    } else if (item.dueDate) {
      dateToUse = item.dueDate;
    }
    
    if (!dateToUse) {
      return '-';
    }

    try {
      return formatDate(dateToUse);
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  const sortItemsByDueDate = (items: any[]) => {
    return [...items].sort((a, b) => {
      const getDateForSort = (item: any) => {
        if (item.payment_date) return new Date(item.payment_date);
        if (item.paymentDate) return new Date(item.paymentDate);
        if (item.due_date) return new Date(item.due_date);
        if (item.dueDate) return new Date(item.dueDate);
        return new Date(0);
      };
      
      const dateA = getDateForSort(a);
      const dateB = getDateForSort(b);
      return dateA.getTime() - dateB.getTime();
    });
  };

  return (
    <div className="space-y-6">
      {reportData.data.map((category, categoryIndex) => (
        <div key={categoryIndex} className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-tertiary mb-4">
            {category.categoryName}
          </h3>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente/Fornecedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortItemsByDueDate(category.items).map((item, itemIndex) => (
                <TableRow key={itemIndex}>
                  <TableCell>{getClientSupplierName(item)}</TableCell>
                  <TableCell>{getFormattedDate(item)}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.observations || '-'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 font-semibold">
                <TableCell colSpan={3}>Subtotal - {category.categoryName}</TableCell>
                <TableCell className="text-right">{formatCurrency(category.total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}
      
      <div className="border-t-2 border-gray-300 pt-4">
        <div className="bg-primary text-white p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">TOTAL GERAL</span>
            <span className="text-xl font-bold">{formatCurrency(reportData.grandTotal)}</span>
          </div>
          <div className="text-sm opacity-90">
            {reportData.data.reduce((sum, cat) => sum + cat.count, 0)} item(s) no total
          </div>
        </div>
      </div>
    </div>
  );
}
