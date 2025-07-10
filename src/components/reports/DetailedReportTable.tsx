
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-4 sm:space-y-6">
      {reportData.data.map((category, categoryIndex) => (
        <div key={categoryIndex} className="border rounded-lg p-2 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-tertiary mb-4">
            {category.categoryName}
          </h3>
          
          {/* Desktop Table */}
          <div className="hidden sm:block">
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

          {/* Mobile Card Layout */}
          <div className="sm:hidden space-y-3">
            {sortItemsByDueDate(category.items).map((item, itemIndex) => (
              <Card key={itemIndex} className="border-l-4 border-l-primary">
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{getClientSupplierName(item)}</p>
                      <p className="text-xs text-gray-600">{getFormattedDate(item)}</p>
                    </div>
                    <p className="font-bold text-primary text-sm">{formatCurrency(item.value)}</p>
                  </div>
                  {item.observations && (
                    <p className="text-xs text-gray-600 truncate">{item.observations}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Mobile Subtotal */}
            <Card className="bg-gray-50">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Subtotal - {category.categoryName}</span>
                  <span className="font-bold text-primary">{formatCurrency(category.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
      
      <div className="border-t-2 border-gray-300 pt-4">
        <div className="bg-primary text-white p-3 sm:p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-base sm:text-lg font-bold">TOTAL GERAL</span>
            <span className="text-lg sm:text-xl font-bold">{formatCurrency(reportData.grandTotal)}</span>
          </div>
          <div className="text-xs sm:text-sm opacity-90">
            {reportData.data.reduce((sum, cat) => sum + cat.count, 0)} item(s) no total
          </div>
        </div>
      </div>
    </div>
  );
}
