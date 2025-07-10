import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
interface ReportFiltersProps {
  activeReport: 'unpaid-expenses' | 'paid-expenses' | 'unreceived-revenues' | 'received-revenues';
  onReportChange: (report: 'unpaid-expenses' | 'paid-expenses' | 'unreceived-revenues' | 'received-revenues') => void;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  onDateRangeChange: (range: {
    from?: Date;
    to?: Date;
  }) => void;
  showDetailed: boolean;
  onShowDetailedChange: (detailed: boolean) => void;
}
export default function ReportFilters({
  activeReport,
  onReportChange,
  dateRange,
  onDateRangeChange,
  showDetailed,
  onShowDetailedChange
}: ReportFiltersProps) {
  const reportOptions = [{
    value: 'unpaid-expenses',
    label: 'Despesas a Pagar'
  }, {
    value: 'paid-expenses',
    label: 'Despesas Pagas'
  }, {
    value: 'unreceived-revenues',
    label: 'Receitas a Receber'
  }, {
    value: 'received-revenues',
    label: 'Receitas Recebidas'
  }];
  const clearDateRange = () => {
    onDateRangeChange({});
  };
  return <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {reportOptions.map(option => <Button key={option.value} variant={activeReport === option.value ? "default" : "outline"} size="sm" onClick={() => onReportChange(option.value as any)} className="justify-start">
                  {option.label}
                </Button>)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="detailed-report" checked={showDetailed} onCheckedChange={onShowDetailedChange} />
            <Label htmlFor="detailed-report" className="text-sm font-medium">
              Relatório Detalhado (com todos os lançamentos)
            </Label>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Período</label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "dd/MM/yyyy", {
                    locale: ptBR
                  }) : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateRange.from} onSelect={date => onDateRangeChange({
                  ...dateRange,
                  from: date
                })} locale={ptBR} initialFocus />
                </PopoverContent>
              </Popover>

              <span className="text-sm text-gray-500">até</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !dateRange.to && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "dd/MM/yyyy", {
                    locale: ptBR
                  }) : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateRange.to} onSelect={date => onDateRangeChange({
                  ...dateRange,
                  to: date
                })} locale={ptBR} initialFocus />
                </PopoverContent>
              </Popover>

              {(dateRange.from || dateRange.to) && <Button variant="outline" size="sm" onClick={clearDateRange} className="px-2">
                  <X className="h-4 w-4" />
                </Button>}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Se não informar período, será apresentado o total acumulado
            </p>
          </div>
        </div>
      </CardContent>
    </Card>;
}