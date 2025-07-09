
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardCalculations } from "@/hooks/useDashboardCalculations";
import { useDashboardChartData } from "@/hooks/useDashboardChartData";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { formatCurrency } from "@/utils/formatCurrency";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filters = {
    dateRange: dateRange.from || dateRange.to ? dateRange : undefined,
    categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined
  };

  const { currentMonth, categories } = useDashboardData(filters);
  const calculations = useDashboardCalculations(filters);
  const chartData = useDashboardChartData();

  const handleResetFilters = () => {
    setDateRange({});
    setSelectedCategories([]);
  };

  const getPeriodText = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`;
    } else if (dateRange.from) {
      return `A partir de ${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })}`;
    } else if (dateRange.to) {
      return `Até ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`;
    }
    return format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tertiary">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {getPeriodText()}
        </p>
      </div>

      <DashboardFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        categories={categories}
        onResetFilters={handleResetFilters}
      />

      <DashboardCards
        {...calculations}
        formatCurrency={formatCurrency}
      />

      <DashboardCharts
        {...chartData}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
