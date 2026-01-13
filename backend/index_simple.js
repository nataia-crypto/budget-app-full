const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../database.sqlite',
  logging: false
});

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, { tableName: 'transactions' });

// Главная страница
app.get('/', (req, res) => {
  res.json({ message: 'Backend работает!' });
});

// Все транзакции
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ order: [['date', 'DESC']] });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить транзакцию
app.post('/api/transactions', async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;
    
    if (!amount || !type || !category) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    const transaction = await Transaction.create({
      amount,
      type,
      category,
      description: description || '',
      date: date || new Date().toISOString().split('T')[0]
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания' });
  }
});

// Удалить транзакцию
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Transaction.destroy({ where: { id } });
    
    if (deleted) {
      res.status(200).json({ message: 'Удалено' });
    } else {
      res.status(404).json({ error: 'Не найдено' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    
    app.listen(PORT, () => {
      console.log(`✅ Сервер работает: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

start();
