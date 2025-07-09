
import { useCallback } from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from 'xlsx';
import { usePdfGeneration } from "@/hooks/usePdfGeneration";
import { useFinance } from "@/contexts/FinanceContext";

interface ReportData {
  title: string;
  data: Array<{
    categoryName: string;
    total: number;
    count: number;
    items: any[];
  }>;
  grandTotal: number;
  period: string;
}

export const useReportExport = () => {
  const { generatePdf } = usePdfGeneration();
  const { clientsSuppliers } = useFinance();

  const getClientSupplierNameForExcel = (item: any) => {
    // Para transações, primeiro tentar clientSupplierId (camelCase)
    if (item.clientSupplierId) {
      const clientSupplier = clientsSuppliers.find(cs => cs.id === item.clientSupplierId);
      return clientSupplier?.name || 'N/A';
    }
    
    // Para transações, usar client_supplier_id (snake_case)
    if (item.client_supplier_id) {
      const clientSupplier = clientsSuppliers.find(cs => cs.id === item.client_supplier_id);
      return clientSupplier?.name || 'N/A';
    }
    
    // Para contas a pagar, usar supplier_id
    if (item.supplier_id) {
      const clientSupplier = clientsSuppliers.find(cs => cs.id === item.supplier_id);
      return clientSupplier?.name || 'N/A';
    }
    
    // Para contas a receber, usar client_id
    if (item.client_id) {
      const clientSupplier = clientsSuppliers.find(cs => cs.id === item.client_id);
      return clientSupplier?.name || 'N/A';
    }
    
    // Fallback para propriedades alternativas
    const clientSupplier = clientsSuppliers.find(cs => 
      cs.id === item.clientId || cs.id === item.supplierId
    );
    return clientSupplier?.name || 'N/A';
  };

  const handlePrint = useCallback((printRef: React.RefObject<HTMLDivElement>) => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  }, []);

  const handlePrintPdf = useCallback(async (
    printRef: React.RefObject<HTMLDivElement>,
    reportData: ReportData,
    showDetailed: boolean
  ) => {
    if (printRef.current) {
      try {
        const fileName = `${reportData.title.replace(/\s+/g, '_')}_${showDetailed ? 'Detalhado_' : ''}${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        await generatePdf(printRef.current, fileName);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
      }
    }
  }, [generatePdf]);

  const handleSave = useCallback((
    reportData: ReportData,
    showDetailed: boolean,
    activeReport: string
  ) => {
    // Preparar dados para Excel
    const excelData = [
      [reportData.title + (showDetailed ? ' - Detalhado' : '')],
      [`Período: ${reportData.period}`],
      [`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`],
      [] // linha vazia
    ];

    if (showDetailed) {
      // Formato detalhado
      reportData.data.forEach(category => {
        excelData.push([]);
        excelData.push([`CATEGORIA: ${category.categoryName}`]);
        excelData.push(['Cliente/Fornecedor', 'Data', 'Observações', 'Valor']);
        
        category.items.forEach(item => {
          const clientSupplierName = getClientSupplierNameForExcel(item);
          let dateToShow = '';
          
          if (activeReport === 'paid-expenses' || activeReport === 'received-revenues') {
            // Para transações, usar payment_date primeiro
            if (item.payment_date) {
              dateToShow = format(new Date(item.payment_date), 'dd/MM/yyyy');
            } else if (item.paymentDate) {
              dateToShow = format(new Date(item.paymentDate), 'dd/MM/yyyy');
            } else if (item.due_date) {
              dateToShow = format(new Date(item.due_date), 'dd/MM/yyyy');
            } else if (item.dueDate) {
              dateToShow = format(new Date(item.dueDate), 'dd/MM/yyyy');
            } else {
              dateToShow = '-';
            }
          } else {
            // Para contas não pagas/recebidas, usar due_date
            if (item.due_date) {
              dateToShow = format(new Date(item.due_date), 'dd/MM/yyyy');
            } else if (item.dueDate) {
              dateToShow = format(new Date(item.dueDate), 'dd/MM/yyyy');
            } else {
              dateToShow = '-';
            }
          }
          
          excelData.push([
            clientSupplierName,
            dateToShow,
            item.observations || '',
            item.value.toString()
          ]);
        });
        
        excelData.push([`Subtotal - ${category.categoryName}`, '', '', category.total.toString()]);
      });
    } else {
      // Formato resumido
      excelData.push(['Categoria', 'Quantidade', 'Total']);
      
      reportData.data.forEach(category => {
        excelData.push([
          category.categoryName,
          category.count.toString(),
          category.total.toString()
        ]);
      });
    }

    // Adicionar total geral
    excelData.push([
      'TOTAL GERAL',
      showDetailed ? '' : reportData.data.reduce((sum, cat) => sum + cat.count, 0).toString(),
      showDetailed ? '' : '',
      reportData.grandTotal.toString()
    ]);

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Aplicar formatação
    if (showDetailed) {
      ws['!cols'] = [
        { width: 30 }, // Cliente/Fornecedor
        { width: 15 }, // Data
        { width: 40 }, // Observações
        { width: 20 }  // Valor
      ];
    } else {
      ws['!cols'] = [
        { width: 30 }, // Categoria
        { width: 15 }, // Quantidade
        { width: 20 }  // Total
      ];
    }

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

    // Salvar arquivo
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${showDetailed ? 'Detalhado_' : ''}${format(new Date(), 'yyyy-MM-dd')}.xls`;
    XLSX.writeFile(wb, fileName);
  }, [clientsSuppliers]);

  return {
    handlePrint,
    handlePrintPdf,
    handleSave
  };
};
