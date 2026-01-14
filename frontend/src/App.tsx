import React, { useEffect, useState } from 'react';
import Charts from './Charts';
import { API_URL } from './api';

function App() {
  const [transactions, setTransactions] = useState<any>([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Еда');
  const [description, setDescription] = useState('');
  
  const expenseCategories = [
    'Еда', 'Транспорт', 'Развлечения', 'Здоровье',
    'Одежда', 'Дом/Квартира', 'Связь/Интернет', 'Коммунальные',
    'Образование', 'Путешествия', 'Спорт', 'Подарки',
    'Домашние животные', 'Техника', 'Книги', 'Рестораны/Кафе'
  ];
  
  const incomeCategories = [
    'Зарплата', 'Фриланс', 'Инвестиции', 'Проценты',
    'Подарок', 'Возврат', 'Премия', 'Продажа'
  ];
  
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  
  const loadTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTransaction = {
      amount: parseFloat(amount),
      type,
      category,
      description,
      date: new Date().toISOString()
    };
    
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTransaction)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await loadTransactions();
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Ошибка при добавлении');
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };
  
  useEffect(() => {
    loadTransactions();
  }, []);
  
  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Бюджет + Графики</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Финансы</h3>
          <p>Баланс: {balance.toFixed(2)} ₽</p>
          <p>Доходы: {totalIncome.toFixed(2)} ₽</p>
          <p>Расходы: {totalExpense.toFixed(2)} ₽</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <h3>Новая транзакция</h3>
        <div>
          <input
            type="number"
            placeholder="Сумма (₽)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ marginRight: '10px', padding: '5px' }}
          />
        </div>
        
        <div style={{ margin: '10px 0' }}>
          <label>
            <input
              type="radio"
              name="type"
              value="income"
              checked={type === 'income'}
              onChange={() => setType('income')}
            />
            Доход
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="type"
              value="expense"
              checked={type === 'expense'}
              onChange={() => setType('expense')}
            />
            Расход
          </label>
        </div>
        
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div style={{ margin: '10px 0' }}>
          <input
            type="text"
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: '5px', width: '300px' }}
          />
        </div>
        
        <button type="submit" style={{ padding: '8px 20px' }}>
          Добавить
        </button>
      </form>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>История операций ({transactions.length})</h3>
        {transactions.length === 0 ? (
          <p>Нет транзакций</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {transactions.map((t: any) => (
              <li 
                key={t.id} 
                style={{ 
                  border: '1px solid #ccc', 
                  marginBottom: '10px', 
                  padding: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{t.type === 'income' ? 'Доход' : 'Расход'}</strong>
                  <div>{t.category}</div>
                  <div>{t.description || 'Без описания'}</div>
                  <div>{new Date(t.date).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: t.type === 'income' ? 'green' : 'red', fontSize: '18px' }}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} ₽
                  </span>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    style={{ 
                      background: 'red', 
                      color: 'white', 
                      border: 'none', 
                      padding: '5px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <Charts transactions={transactions} />
      
      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
        <p>
          Backend: {process.env.REACT_APP_API_URL || 'http://localhost:5000'} | 
          Frontend: {window.location.origin} | 
          Графики: Recharts
        </p>
      </div>
    </div>
  );
}

export default App;
