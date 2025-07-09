
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
        // Para despesas pagas: usar TODOS os lançamentos de despesa do período
        data = transactions.filter(t => t.type === 'despesa');
        categoriesData = expenseCategories;
        title = 'Despesas Pagas por Categoria';
        break;
      case 'unreceived-revenues':
        data = receivableAccounts.filter(r => !r.isReceived);
        categoriesData = revenueCategories;
        title = 'Receitas a Receber por Categoria';
        break;
      case 'received-revenues':
        // Para receitas recebidas: usar TODOS os lançamentos de receita do período
        data = transactions.filter(t => t.type === 'receita');
        categoriesData = revenueCategories;
        title = 'Receitas Recebidas por Categoria';
        break;
    }

    // Filtrar por data se especificado
    if (dateRange.from || dateRange.to) {
      data = data.filter(item => {
        let dateToCheck: Date;
        
        if (activeReport === 'paid-expenses' || activeReport === 'received-revenues') {
          // Para transações, usar paymentDate
          if (item.paymentDate) {
            dateToCheck = new Date(item.paymentDate);
          } else {
            dateToCheck = new Date(item.dueDate);
          }
        } else {
          // Para contas não pagas/recebidas, usar dueDate
          dateToCheck = new Date(item.dueDate);
        }

        if (dateRange.from && dateToCheck < dateRange.from) return false;
        if (dateRange.to && dateToCheck > dateRange.to) return false;
        return true;
      });
    }

    // Agrupar por categoria
    const groupedData = categoriesData.map(category => {
      const categoryItems = data.filter(item => {
        // Para transações, usar categoryId
        if (item.categoryId) {
          return item.categoryId === category.id;
        }
        // Para contas a pagar/receber, também usar categoryId
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
  }, [activeReport, payableAccounts, receivableAccounts, transactions, expenseCategories, revenueCategories, dateRange]);

  return reportData;
};
