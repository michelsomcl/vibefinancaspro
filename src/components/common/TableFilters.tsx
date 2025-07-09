
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterConfig {
  key: string;
  placeholder: string;
  value: string;
}

interface TableFiltersProps {
  filters: Record<string, string>;
  filterConfigs: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export default function TableFilters({ filters, filterConfigs, onFilterChange, onClearFilters }: TableFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
        {filterConfigs.map((config) => (
          <Input
            key={config.key}
            placeholder={config.placeholder}
            value={filters[config.key]}
            onChange={(e) => onFilterChange(config.key, e.target.value)}
          />
        ))}
      </div>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClearFilters}>
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}
