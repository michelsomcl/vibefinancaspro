
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Filter, Search } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TransactionForm from "@/components/transactions/TransactionForm";

export default function Transactions() {
  const { 
    transactions, 
    categories, 
    clientsSuppliers, 
    loading, 
    deleteTransaction,
    updatePayableAccount,
    updateReceivableAccount,
    payableAccounts,
    receivableAccounts
  } = useFinance();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Função para criar data a partir de string sem problemas de timezone
  const parseDate = (dateString: string) => {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date(dateString);
  };

  // Função para extrair apenas a data (YYYY-MM-DD) de uma string de data
  const getDateOnly = (dateInput: string | Date): string => {
    if (typeof dateInput === 'string') {
      // Se for string, pega apenas a parte da data (antes do T se houver)
      return dateInput.split('T')[0];
    } else {
      // Se for Date, converte para YYYY-MM-DD
      const year = dateInput.getFullYear();
      const month = String(dateInput.getMonth() + 1).padStart(2, '0');
      const day = String(dateInput.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  // Função para formatar data corretamente
  const formatDate = (dateInput: string | Date) => {
    let date: Date;
    
    if (typeof dateInput === 'string') {
      // Parse da string sem adicionar timezone para evitar conversões UTC
      const parts = dateInput.split('T')[0].split('-');
      if (parts.length === 3) {
        // Cria a data usando os valores exatos (ano, mês-1, dia)
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        // Fallback para o método anterior
        date = new Date(dateInput + 'T00:00:00');
      }
    } else {
      // Se já for Date, usa diretamente
      date = dateInput;
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(transaction => {
        const clientSupplier = clientsSuppliers.find(cs => cs.id === transaction.clientSupplierId);
        const category = categories.find(cat => cat.id === transaction.categoryId);
        
        const searchLower = searchTerm.toLowerCase();
        return (
          clientSupplier?.name.toLowerCase().includes(searchLower) ||
          category?.name.toLowerCase().includes(searchLower) ||
          transaction.observations?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filtro por categoria
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.categoryId === categoryFilter);
    }

    // Filtro por tipo
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    // Filtro por período - corrigido para comparar apenas as datas (sem horário)
    if (startDate) {
      filtered = filtered.filter(transaction => {
        const transactionDateOnly = getDateOnly(transaction.paymentDate);
        return transactionDateOnly >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter(transaction => {
        const transactionDateOnly = getDateOnly(transaction.paymentDate);
        return transactionDateOnly <= endDate;
      });
    }

    return filtered.sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }, [transactions, searchTerm, categoryFilter, typeFilter, startDate, endDate, clientsSuppliers, categories]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, { name: string; revenue: number; expense: number }> = {};

    filteredTransactions.forEach(transaction => {
      const category = categories.find(cat => cat.id === transaction.categoryId);
      if (!category) return;

      if (!summary[category.id]) {
        summary[category.id] = {
          name: category.name,
          revenue: 0,
          expense: 0
        };
      }

      if (transaction.type === 'receita') {
        summary[category.id].revenue += transaction.value;
      } else {
        summary[category.id].expense += transaction.value;
      }
    });

    return Object.values(summary);
  }, [filteredTransactions, categories]);

  const totalRevenue = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      try {
        // Find the transaction before deleting it
        const transaction = transactions.find(t => t.id === id);
        
        // Before deletion, check if the transaction is linked to a payable or receivable
        if (transaction?.sourceType === 'payable' && transaction?.sourceId) {
          // Find the corresponding payable account
          const payable = payableAccounts.find(p => p.id === transaction.sourceId);
          
          if (payable && payable.isPaid) {
            // Mark the payable account as unpaid
            await updatePayableAccount(payable.id, {
              isPaid: false,
              paidDate: undefined
            });
            
            console.log(`Marked payable account ${payable.id} as unpaid`);
          }
        } else if (transaction?.sourceType === 'receivable' && transaction?.sourceId) {
          // Find the corresponding receivable account
          const receivable = receivableAccounts.find(r => r.id === transaction.sourceId);
          
          if (receivable && receivable.isReceived) {
            // Mark the receivable account as not received
            await updateReceivableAccount(receivable.id, {
              isReceived: false,
              receivedDate: undefined
            });
            
            console.log(`Marked receivable account ${receivable.id} as not received`);
          }
        }
        
        // Now delete the transaction
        await deleteTransaction(id);
      } catch (error) {
        console.error('Error when deleting transaction:', error);
      }
    }
  };

  const getClientSupplierName = (id: string) => {
    const clientSupplier = clientsSuppliers.find(cs => cs.id === id);
    return clientSupplier?.name || 'Não encontrado';
  };

  const getCategoryName = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    return category?.name || 'Não encontrada';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setTypeFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-tertiary">Lançamentos</h1>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-tertiary">Lançamentos</h1>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Novo Lançamento</span>
        </Button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Total de Receitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">Total de Despesas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className={`text-xl sm:text-2xl font-bold ${totalRevenue - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalRevenue - totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">Saldo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Filtros
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
              Limpar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Data inicial"
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Data final"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Categoria */}
      {categorySummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categorySummary.map((summary, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded gap-2">
                  <span className="font-medium text-sm sm:text-base">{summary.name}</span>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
                    {summary.revenue > 0 && (
                      <span className="text-green-600">
                        +{formatCurrency(summary.revenue)}
                      </span>
                    )}
                    {summary.expense > 0 && (
                      <span className="text-red-600">
                        -{formatCurrency(summary.expense)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Lançamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Lançamentos ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum lançamento encontrado</p>
            </div>
          ) : (
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente/Fornecedor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge variant={transaction.type === 'receita' ? 'default' : 'destructive'}>
                          {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getClientSupplierName(transaction.clientSupplierId)}
                      </TableCell>
                      <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
                      <TableCell className={transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.value)}
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.paymentDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.sourceType === 'manual' && 'Manual'}
                          {transaction.sourceType === 'payable' && 'Conta a Pagar'}
                          {transaction.sourceType === 'receivable' && 'Conta a Receber'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Mobile Card Layout */}
          <div className="sm:hidden space-y-4 p-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Badge variant={transaction.type === 'receita' ? 'default' : 'destructive'} className="text-xs">
                      {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Cliente/Fornecedor:</p>
                      <p className="font-medium text-sm">{getClientSupplierName(transaction.clientSupplierId)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Categoria:</p>
                        <p className="text-sm">{getCategoryName(transaction.categoryId)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data:</p>
                        <p className="text-sm">{formatDate(transaction.paymentDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <Badge variant="outline" className="text-xs">
                        {transaction.sourceType === 'manual' && 'Manual'}
                        {transaction.sourceType === 'payable' && 'Conta a Pagar'}
                        {transaction.sourceType === 'receivable' && 'Conta a Receber'}
                      </Badge>
                      <p className={`font-bold text-lg ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.value)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog do Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingTransaction ? 'Editar' : 'Novo'} Lançamento
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
