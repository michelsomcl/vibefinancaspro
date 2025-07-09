
import { useDashboardData } from "./useDashboardData";
import { isAfter } from "date-fns";

interface DashboardFilters {
  dateRange?: { from?: Date; to?: Date };
  categoryIds?: string[];
}

export const useDashboardCalculations = (filters?: DashboardFilters) => {
  const {
    currentMonthTransactions,
    monthStart,
    monthEnd,
    payableAccounts,
    receivableAccounts,
    hasDateFilter
  } = useDashboardData(filters);

  // Calcular TODOS os lançamentos do período (incluindo os de origem payable/receivable)
  const paidExpenses = currentMonthTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);

  const receivedRevenues = currentMonthTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);

  // Calcular totais das contas não pagas com vencimento no período
  // Se não há filtro de data, incluir TODOS os lançamentos futuros (parcelados/recorrentes)
  const unpaidExpenses = payableAccounts
    .filter(p => !p.isPaid)
    .filter(p => {
      if (!hasDateFilter) {
        // Sem filtro de data: incluir todos os lançamentos não pagos
        return true;
      } else {
        // Com filtro de data: usar o período especificado
        const dueDate = new Date(p.dueDate);
        return dueDate >= monthStart && dueDate <= monthEnd;
      }
    })
    .reduce((sum, p) => sum + p.value, 0);

  const unreceiveredRevenues = receivableAccounts
    .filter(r => !r.isReceived)
    .filter(r => {
      if (!hasDateFilter) {
        // Sem filtro de data: incluir todos os lançamentos não recebidos
        return true;
      } else {
        // Com filtro de data: usar o período especificado
        const dueDate = new Date(r.dueDate);
        return dueDate >= monthStart && dueDate <= monthEnd;
      }
    })
    .reduce((sum, r) => sum + r.value, 0);

  // Totais finais usando os lançamentos da tela "Lançamentos"
  const totalPaidExpenses = paidExpenses;
  const totalReceivedRevenues = receivedRevenues;

  const balancePaid = totalReceivedRevenues - totalPaidExpenses;
  const balanceUnpaid = unreceiveredRevenues - unpaidExpenses;

  // Contas vencidas (sempre considerar data atual, independente dos filtros)
  const today = new Date();
  const overduePayables = payableAccounts
    .filter(p => !p.isPaid && isAfter(today, new Date(p.dueDate)))
    .reduce((sum, p) => sum + p.value, 0);
    
  const overdueReceivables = receivableAccounts
    .filter(r => !r.isReceived && isAfter(today, new Date(r.dueDate)))
    .reduce((sum, r) => sum + r.value, 0);

  return {
    totalPaidExpenses,
    unpaidExpenses,
    totalReceivedRevenues,
    unreceiveredRevenues,
    balancePaid,
    balanceUnpaid,
    overduePayables,
    overdueReceivables
  };
};
