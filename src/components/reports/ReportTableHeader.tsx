
import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportTableHeaderProps {
  title: string;
  period: string;
  showDetailed: boolean;
}

export default function ReportTableHeader({ title, period, showDetailed }: ReportTableHeaderProps) {
  return (
    <div className="header text-center mb-6">
      <h2 className="text-2xl font-bold text-tertiary mb-2">
        {title} {showDetailed && '- Detalhado'}
      </h2>
      <p className="text-gray-600">Período: {period}</p>
      <p className="text-sm text-gray-500">
        Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </p>
    </div>
  );
}
