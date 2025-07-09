
-- Adicionar coluna user_id nas tabelas principais
ALTER TABLE public.accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.clients_suppliers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.payable_accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.receivable_accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Remover políticas antigas que permitiam acesso total
DROP POLICY IF EXISTS "Allow all operations on accounts" ON public.accounts;
DROP POLICY IF EXISTS "Allow all operations on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all operations on clients_suppliers" ON public.clients_suppliers;
DROP POLICY IF EXISTS "Allow all operations on payable_accounts" ON public.payable_accounts;
DROP POLICY IF EXISTS "Allow all operations on receivable_accounts" ON public.receivable_accounts;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON public.transactions;

-- Criar políticas RLS para accounts
CREATE POLICY "Users can view their own accounts" 
  ON public.accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts" 
  ON public.accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
  ON public.accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" 
  ON public.accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar políticas RLS para categories
CREATE POLICY "Users can view their own categories" 
  ON public.categories 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" 
  ON public.categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
  ON public.categories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
  ON public.categories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar políticas RLS para clients_suppliers
CREATE POLICY "Users can view their own clients_suppliers" 
  ON public.clients_suppliers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients_suppliers" 
  ON public.clients_suppliers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients_suppliers" 
  ON public.clients_suppliers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients_suppliers" 
  ON public.clients_suppliers 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar políticas RLS para payable_accounts
CREATE POLICY "Users can view their own payable_accounts" 
  ON public.payable_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payable_accounts" 
  ON public.payable_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payable_accounts" 
  ON public.payable_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payable_accounts" 
  ON public.payable_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar políticas RLS para receivable_accounts
CREATE POLICY "Users can view their own receivable_accounts" 
  ON public.receivable_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receivable_accounts" 
  ON public.receivable_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receivable_accounts" 
  ON public.receivable_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receivable_accounts" 
  ON public.receivable_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar políticas RLS para transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);
