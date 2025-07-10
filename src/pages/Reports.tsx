
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useFinance } from "@/contexts/FinanceContext";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import ReportActions from "@/components/reports/ReportActions";
import { useReportData } from "@/hooks/useReportData";
import { useReportExport } from "@/hooks/useReportExport";

export default function Reports() {
  const { loading } = useFinance();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [activeReport, setActiveReport] = useState<'unpaid-expenses' | 'paid-expenses' | 'unreceived-revenues' | 'received-revenues'>('unpaid-expenses');
  const [showDetailed, setShowDetailed] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const reportData = useReportData({ activeReport, dateRange });
  const { handlePrint, handlePrintPdf, handleSave } = useReportExport();

  const onPrint = () => handlePrint(printRef);
  const onPrintPdf = () => handlePrintPdf(printRef, reportData, showDetailed);
  const onSave = () => handleSave(reportData, showDetailed, activeReport);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-tertiary">Relatórios</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-tertiary">Relatórios</h1>
        <div className="w-full sm:w-auto">
          <ReportActions
            onPrint={onPrint}
            onPrintPdf={onPrintPdf}
            onSave={onSave}
            showDetailed={showDetailed}
          />
        </div>
      </div>

      <ReportFilters
        activeReport={activeReport}
        onReportChange={setActiveReport}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showDetailed={showDetailed}
        onShowDetailedChange={setShowDetailed}
      />

      <Card>
        <CardContent className="p-0">
          <div ref={printRef}>
            <ReportTable reportData={reportData} showDetailed={showDetailed} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
