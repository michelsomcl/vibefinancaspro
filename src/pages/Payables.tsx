
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import PayableForm from "@/components/payables/PayableForm";
import PayablesList from "@/components/payables/PayablesList";
import PaymentDialog from "@/components/payables/PaymentDialog";
import { PayableAccount } from "@/types";
import { SimpleDashboard } from "@/components/dashboard/SimpleDashboard";
import { formatCurrency } from "@/utils/formatCurrency";
import { usePayablesActions } from "@/hooks/usePayablesActions";

export default function Payables() {
  const { 
    payableAccounts, 
    categories, 
    clientsSuppliers, 
    accounts,
    loading
  } = useFinance();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState<PayableAccount | null>(null);
  const [filteredPayables, setFilteredPayables] = useState(payableAccounts);

  const {
    paymentDialogOpen,
    setPaymentDialogOpen,
    selectedAccountId,
    setSelectedAccountId,
    handleDelete,
    handleMarkAsPaid,
    handleMarkAsUnpaid,
    handleConfirmPayment
  } = usePayablesActions();

  const suppliers = clientsSuppliers.filter(cs => cs.type === 'fornecedor');
  const expenseCategories = categories.filter(cat => cat.type === 'despesa');

  // Calcular total de despesas com base nos payables filtrados
  const totalExpenses = useMemo(() => {
    return filteredPayables.reduce((sum, payable) => sum + payable.value, 0);
  }, [filteredPayables]);

  // Atualizar payables filtrados quando os dados mudarem
  React.useEffect(() => {
    setFilteredPayables(payableAccounts);
  }, [payableAccounts]);

  const handleEdit = (payable: PayableAccount) => {
    const payableWithFixedDate = {
      ...payable,
      dueDate: new Date(payable.dueDate.getTime() + payable.dueDate.getTimezoneOffset() * 60000)
    };
    setEditingPayable(payableWithFixedDate);
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingPayable(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-tertiary">Contas a Pagar</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-tertiary">Contas a Pagar</h1>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta a Pagar
        </Button>
      </div>

      <SimpleDashboard
        title="Total de Despesas"
        value={totalExpenses}
        formatCurrency={formatCurrency}
        color="red"
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          <PayablesList
            payableAccounts={payableAccounts}
            suppliers={suppliers}
            expenseCategories={expenseCategories}
            onMarkAsPaid={handleMarkAsPaid}
            onMarkAsUnpaid={handleMarkAsUnpaid}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onFilteredDataChange={setFilteredPayables}
          />
        </CardContent>
      </Card>

      <PaymentDialog
        isOpen={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onConfirm={handleConfirmPayment}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onAccountChange={setSelectedAccountId}
      />

      {isFormOpen && (
        <PayableForm
          payable={editingPayable}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingPayable(null);
          }}
        />
      )}
    </div>
  );
}
