
import { useState } from 'react';
import { PayableAccount } from "@/types";
import { useFinance } from "@/contexts/FinanceContext";
import { toast } from "@/hooks/use-toast";

export function usePayablesActions() {
  const {
    updatePayableAccount,
    deletePayableAccount,
    addTransaction,
    deleteTransaction,
    transactions,
    payableAccounts
  } = useFinance();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<PayableAccount | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta a pagar?')) {
      try {
        const payable = payableAccounts.find(p => p.id === id);
        
        if (payable?.isPaid) {
          const relatedTransaction = transactions.find(
            t => t.sourceType === 'payable' && t.sourceId === id
          );
          
          if (relatedTransaction) {
            await deleteTransaction(relatedTransaction.id);
          }
        }
        
        await deletePayableAccount(id);
        
        toast({
          title: "Conta excluída",
          description: "A conta a pagar foi excluída com sucesso."
        });
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir a conta.",
          variant: "destructive"
        });
      }
    }
  };

  const handleMarkAsPaid = async (payable: PayableAccount) => {
    if (!payable.accountId) {
      setSelectedPayable(payable);
      setPaymentDialogOpen(true);
      return;
    }

    try {
      const existingTransaction = transactions.find(
        t => t.sourceType === 'payable' && t.sourceId === payable.id
      );
      
      if (existingTransaction) {
        await updatePayableAccount(payable.id, {
          isPaid: true,
          paidDate: new Date()
        });
        
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como paga."
        });
        return;
      }
      
      const paidDate = new Date();
      
      await updatePayableAccount(payable.id, {
        isPaid: true,
        paidDate,
        accountId: payable.accountId
      });
      
      await addTransaction({
        type: 'despesa',
        clientSupplierId: payable.supplierId,
        categoryId: payable.categoryId,
        accountId: payable.accountId,
        value: payable.value,
        paymentDate: paidDate,
        observations: payable.observations,
        sourceType: 'payable',
        sourceId: payable.id
      });
      
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado e adicionado aos lançamentos."
      });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o pagamento.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayable || !selectedAccountId) {
      toast({
        title: "Erro",
        description: "Selecione uma conta para o pagamento.",
        variant: "destructive"
      });
      return;
    }

    try {
      const paidDate = new Date();
      
      await updatePayableAccount(selectedPayable.id, {
        isPaid: true,
        paidDate,
        accountId: selectedAccountId
      });
      
      await addTransaction({
        type: 'despesa',
        clientSupplierId: selectedPayable.supplierId,
        categoryId: selectedPayable.categoryId,
        accountId: selectedAccountId,
        value: selectedPayable.value,
        paymentDate: paidDate,
        observations: selectedPayable.observations,
        sourceType: 'payable',
        sourceId: selectedPayable.id
      });
      
      setPaymentDialogOpen(false);
      setSelectedPayable(null);
      setSelectedAccountId('');
      
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado e adicionado aos lançamentos."
      });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o pagamento.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsUnpaid = async (payable: PayableAccount) => {
    try {
      await updatePayableAccount(payable.id, {
        isPaid: false,
        paidDate: undefined,
        accountId: undefined
      });
      
      const relatedTransaction = transactions.find(
        t => t.sourceType === 'payable' && t.sourceId === payable.id
      );
      
      if (relatedTransaction) {
        await deleteTransaction(relatedTransaction.id);
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como não paga e o lançamento foi removido."
        });
      } else {
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como não paga."
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do pagamento.",
        variant: "destructive"
      });
    }
  };

  return {
    paymentDialogOpen,
    setPaymentDialogOpen,
    selectedPayable,
    selectedAccountId,
    setSelectedAccountId,
    handleDelete,
    handleMarkAsPaid,
    handleMarkAsUnpaid,
    handleConfirmPayment
  };
}
