
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date | string) => {
  let dateStr: string;
  if (date instanceof Date) {
    dateStr = date.toISOString().split('T')[0];
  } else {
    dateStr = typeof date === 'string' ? date.split('T')[0] : date;
  }
  
  const parts = dateStr.split('-').map(Number);
  const year = parts[0];
  const month = parts[1] - 1;
  const day = parts[2];
  
  // Criar a data considerando o fuso horário local (America/Sao_Paulo)
  // Usar 12:00 para evitar problemas de fuso horário
  const dateObj = new Date(year, month, day, 12, 0, 0);
  
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatDatePayables = (date: Date) => {
  // Criar uma nova data com horário fixo para evitar problemas de fuso horário
  const adjustedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  return format(adjustedDate, 'dd/MM/yyyy', { locale: ptBR });
};
