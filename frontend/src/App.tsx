import React, { useEffect, useState } from 'react';
import Charts from './Charts';

function App() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Еда');
  const [description, setDescription] = useState('');

  const expenseCategories = [
    '🍔 Еда', '🚗 Транспорт', '🎬 Развлечения', '💊 Здоровье',
    '👕 Одежда', '🏠 Дом/Квартира', '📱 Связь/Интернет', '💡 Коммунальные',
    '🎓 Образование', '✈️ Путешествия', '🏋️ Спорт', '🎁 Подарки',
    '🐶 Домашние животные', '💻 Техника', '📚 Книги', '🍷 Рестораны/Кафе'
  ];

  const incomeCategories = [
    '💰 Зарплата', '💼 Фриланс', '📈 Инвестиции', '🏦 Проценты',
    '🎁 Подарок', '🔄 Возврат', '🏆 Премия', '📱 Продажа'
  ];

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const loadTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      alert('Введите сумму!');
      return;
    }

    const newTransaction = {
      amount: parseFloat(amount),
      type,
      category: category.replace(/^[^ ]+ /, ''),
      description,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      
      if (response.ok) {
        await loadTransactions();
        setAmount('');
        setDescription('');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('❌ Ошибка при добавлении');
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>💰 Бюджет + Графики</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* Левая колонка */}
        <div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h2>📊 Финансы</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <p>Баланс</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: balance >= 0 ? 'green' : 'red' }}>
                  {balance.toFixed(2)} ₽
                </p>
              </div>
              <div>
                <p>Доходы</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>{totalIncome.toFixed(2)} ₽</p>
              </div>
              <div>
                <p>Расходы</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>{totalExpense.toFixed(2)} ₽</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>➕ Новая транзакция</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label>Сумма (₽)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px' }}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label>Тип</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    style={{ 
                      flex: 1, 
                      padding: '10px', 
                      background: type === 'income' ? 'green' : '#eee',
                      color: type === 'income' ? 'white' : 'black',
                      border: 'none',
                      borderRadius: '5px'
                    }}
                  >
                    📥 Доход
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    style={{ 
                      flex: 1, 
                      padding: '10px', 
                      background: type === 'expense' ? 'red' : '#eee',
                      color: type === 'expense' ? 'white' : 'black',
                      border: 'none',
                      borderRadius: '5px'
                    }}
                  >
                    📤 Расход
                  </button>
                </div>
              </div>

              <div>
                <label>Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px' }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Описание</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px' }}
                  placeholder="Комментарий"
                />
              </div>

              <button
                type="submit"
                style={{ 
                  background: '#3b82f6', 
                  color: 'white', 
                  padding: '12px', 
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold'
                }}
              >
                💾 Сохранить
              </button>
            </form>
          </div>

          {/* График */}
          <Charts transactions={transactions} />
        </div>

        {/* Правая колонка */}
        <div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>📋 История операций ({transactions.length})</h2>
            
            {transactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Нет транзакций</p>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {transactions.map((t) => (
                  <div key={t.id} style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    background: t.type === 'income' ? '#f0fff4' : '#fff0f0'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ 
                          background: t.type === 'income' ? 'green' : 'red',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '12px'
                        }}>
                          {t.type === 'income' ? 'Доход' : 'Расход'}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>{t.category}</span>
                      </div>
                      <p style={{ color: '#666', margin: '4px 0', fontSize: '14px' }}>
                        {t.description || 'Без описания'}
                      </p>
                      <p style={{ color: '#999', fontSize: '12px' }}>{t.date}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: t.type === 'income' ? 'green' : 'red'
                      }}>
                        {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} ₽
                      </p>
                      <button
                        onClick={async () => {
                          if (window.confirm('Удалить?')) {
                            await fetch(`http://localhost:5000/api/transactions/${t.id}`, {
                              method: 'DELETE'
                            });
                            await loadTransactions();
                          }
                        }}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          color: '#999',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p>Backend: http://localhost:5000 | Frontend: http://localhost:3000 | Графики: Recharts</p>
      </div>
    </div>
  );
}

export default App;
