
import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer, FileText, FileSpreadsheet } from "lucide-react";

interface ReportActionsProps {
  onPrint: () => void;
  onPrintPdf: () => Promise<void>;
  onSave: () => void;
  showDetailed: boolean;
}

export default function ReportActions({ 
  onPrint, 
  onPrintPdf, 
  onSave, 
  showDetailed 
}: ReportActionsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onPrint} variant="outline" className="flex items-center gap-2">
        <Printer className="h-4 w-4" />
        Imprimir
      </Button>
      <Button 
        onClick={onPrintPdf} 
        variant="outline" 
        className="flex items-center gap-2"
        disabled={showDetailed}
      >
        <FileText className="h-4 w-4" />
        PDF
      </Button>
      <Button onClick={onSave} variant="outline" className="flex items-center gap-2">
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
    </div>
  );
}
