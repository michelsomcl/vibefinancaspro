
import { useFinance } from "@/contexts/FinanceContext";
import { startOfMonth, endOfMonth, isAfter } from "date-fns";

interface DashboardFilters {
  dateRange?: { from?: Date; to?: Date };
  categoryIds?: string[];
}

export const useDashboardData = (filters?: DashboardFilters) => {
  const { payableAccounts, receivableAccounts, transactions, categories } = useFinance();
  
  const currentMonth = new Date();
  const hasDateFilter = filters?.dateRange?.from || filters?.dateRange?.to;
  
  // Se não há filtro de data, usar período amplo para incluir lançamentos futuros
  const monthStart = filters?.dateRange?.from || (hasDateFilter ? startOfMonth(currentMonth) : new Date(2020, 0, 1));
  const monthEnd = filters?.dateRange?.to || (hasDateFilter ? endOfMonth(currentMonth) : new Date(2030, 11, 31));

  // Filtrar por categorias se especificado
  const filterByCategory = (items: any[]) => {
    if (!filters?.categoryIds || filters.categoryIds.length === 0) {
      return items;
    }
    return items.filter(item => filters.categoryIds!.includes(item.categoryId));
  };

  // Filtrar dados do período - considerando data de pagamento para contas pagas
  const currentMonthPayables = filterByCategory(
    payableAccounts.filter(p => {
      if (p.isPaid && p.paidDate) {
        const paidDate = new Date(p.paidDate);
        return paidDate >= monthStart && paidDate <= monthEnd;
      } else {
        const dueDate = new Date(p.dueDate);
        return dueDate >= monthStart && dueDate <= monthEnd;
      }
    })
  );

  const currentMonthReceivables = filterByCategory(
    receivableAccounts.filter(r => {
      if (r.isReceived && r.receivedDate) {
        const receivedDate = new Date(r.receivedDate);
        return receivedDate >= monthStart && receivedDate <= monthEnd;
      } else {
        const dueDate = new Date(r.dueDate);
        return dueDate >= monthStart && dueDate <= monthEnd;
      }
    })
  );

  const currentMonthTransactions = filterByCategory(
    transactions.filter(t => {
      const paymentDate = new Date(t.paymentDate);
      return paymentDate >= monthStart && paymentDate <= monthEnd;
    })
  );

  return {
    currentMonth,
    currentMonthPayables,
    currentMonthReceivables,
    currentMonthTransactions,
    monthStart,
    monthEnd,
    payableAccounts: filterByCategory(payableAccounts),
    receivableAccounts: filterByCategory(receivableAccounts),
    categories,
    hasDateFilter
  };
};
