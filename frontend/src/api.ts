const API_URL = 'http://localhost:5000/api';

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string | null;
  date: string;
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(`${API_URL}/transactions`);
  if (!response.ok) throw new Error('Ошибка сети');
  return response.json();
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error('Ошибка создания');
  return response.json();
};

export const deleteTransaction = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Ошибка удаления');
};
