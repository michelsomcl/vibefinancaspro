
import React from 'react';
import ReportTableHeader from './ReportTableHeader';
import DetailedReportTable from './DetailedReportTable';
import SummaryReportTable from './SummaryReportTable';

interface ReportTableProps {
  reportData: {
    title: string;
    data: Array<{
      categoryName: string;
      total: number;
      count: number;
      items: any[];
    }>;
    grandTotal: number;
    period: string;
  };
  showDetailed?: boolean;
}

export default function ReportTable({ reportData, showDetailed = false }: ReportTableProps) {
  return (
    <div className="p-3 sm:p-6">
      <ReportTableHeader 
        title={reportData.title}
        period={reportData.period}
        showDetailed={showDetailed}
      />

      {reportData.data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm sm:text-base">Nenhum dado encontrado para o período selecionado</p>
        </div>
      ) : (
        <>
          {showDetailed ? (
            <DetailedReportTable reportData={reportData} />
          ) : (
            <SummaryReportTable reportData={reportData} />
          )}
        </>
      )}
    </div>
  );
}
