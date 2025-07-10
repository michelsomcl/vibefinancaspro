
import { useMemo } from 'react';
import { useFinance } from "@/contexts/FinanceContext";

interface UseReportDataProps {
  activeReport: 'unpaid-expenses' | 'paid-expenses' | 'unreceived-revenues' | 'received-revenues';
  dateRange: { from?: Date; to?: Date };
}

export const useReportData = ({ activeReport, dateRange }: UseReportDataProps) => {
  const { payableAccounts, receivableAccounts, transactions, categories } = useFinance();

  const expenseCategories = categories.filter(cat => cat.type === 'despesa');
  const revenueCategories = categories.filter(cat => cat.type === 'receita');

  const reportData = useMemo(() => {
    let data: any[] = [];
    let categoriesData: any[] = [];
    let title = '';

    switch (activeReport) {
      case 'unpaid-expenses':
        data = payableAccounts.filter(p => !p.isPaid);
        categoriesData = expenseCategories;
        title = 'Despesas a Pagar por Categoria';
        break;
      case 'paid-expenses':
        // Para despesas pagas: usar contas a pagar que foram pagas
        data = payableAccounts.filter(p => p.isPaid && p.paidDate);
        categoriesData = expenseCategories;
        title = 'Despesas Pagas por Categoria';
        break;
      case 'unreceived-revenues':
        data = receivableAccounts.filter(r => !r.isReceived);
        categoriesData = revenueCategories;
        title = 'Receitas a Receber por Categoria';
        break;
      case 'received-revenues':
        // Para receitas recebidas: usar contas a receber que foram recebidas
        data = receivableAccounts.filter(r => r.isReceived && r.receivedDate);
        categoriesData = revenueCategories;
        title = 'Receitas Recebidas por Categoria';
        break;
    }

    // Filtrar por data se especificado
    if (dateRange.from || dateRange.to) {
      data = data.filter(item => {
        let dateToCheck: Date;
        
        if (activeReport === 'paid-expenses') {
          // Para despesas pagas, usar paidDate (data em que foi paga)
          const paidDateStr = item.paidDate;
          if (!paidDateStr) return false;
          
          // Converter string da data para Date considerando fuso horário local
          const parts = paidDateStr.split('-').map(Number);
          dateToCheck = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
        } else if (activeReport === 'received-revenues') {
          // Para receitas recebidas, usar receivedDate (data em que foi recebida)
          const receivedDateStr = item.receivedDate;
          if (!receivedDateStr) return false;
          
          // Converter string da data para Date considerando fuso horário local
          const parts = receivedDateStr.split('-').map(Number);
          dateToCheck = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
        } else {
          // Para contas não pagas/recebidas, usar dueDate
          const dueDateStr = item.dueDate;
          if (!dueDateStr) return false;
          
          // Converter string da data para Date considerando fuso horário local
          const parts = dueDateStr.split('-').map(Number);
          dateToCheck = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
        }

        // Normalizar as datas de filtro para comparação
        const fromDate = dateRange.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate(), 12, 0, 0) : null;
        const toDate = dateRange.to ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate(), 12, 0, 0) : null;

        if (fromDate && dateToCheck < fromDate) return false;
        if (toDate && dateToCheck > toDate) return false;
        return true;
      });
    }

    // Agrupar por categoria
    const groupedData = categoriesData.map(category => {
      const categoryItems = data.filter(item => {
        return item.categoryId === category.id;
      });
      
      const total = categoryItems.reduce((sum, item) => sum + item.value, 0);
      
      return {
        categoryName: category.name,
        total,
        count: categoryItems.length,
        items: categoryItems
      };
    }).filter(group => group.count > 0);

    const grandTotal = groupedData.reduce((sum, group) => sum + group.total, 0);

    return {
      title,
      data: groupedData,
      grandTotal,
      period: dateRange.from && dateRange.to 
        ? `${dateRange.from.toLocaleDateString('pt-BR')} - ${dateRange.to.toLocaleDateString('pt-BR')}`
        : 'Total Acumulado'
    };
  }, [activeReport, payableAccounts, receivableAccounts, expenseCategories, revenueCategories, dateRange]);

  return reportData;
};
