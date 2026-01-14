const express = require('express');
const router = express.Router();
const { Transaction } = require('../models');

// Получить все транзакции (без авторизации)
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      order: [['date', 'DESC']],
      limit: 100
    });
    res.json(transactions);
  } catch (error) {
    console.error('Ошибка получения транзакций:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении транзакций' 
    });
  }
});

// Создать транзакцию (без авторизации)
router.post('/', async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;
    
    // Используем фиксированные значения для демо
    const transaction = await Transaction.create({
      type,
      amount,
      description: description || 'Без описания',
      date: date || new Date(),
      // Фиксированные ID для демо
      userId: 1,
      accountId: 1,
      categoryId: 1
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Ошибка создания транзакции:', error);
    res.status(400).json({ 
      error: 'Ошибка при создании транзакции: ' + error.message 
    });
  }
});

// Удалить транзакцию (без авторизации)
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ 
        error: 'Транзакция не найдена' 
      });
    }

    await transaction.destroy();
    res.json({ 
      message: 'Транзакция удалена' 
    });
  } catch (error) {
    console.error('Ошибка удаления транзакции:', error);
    res.status(500).json({ 
      error: 'Ошибка при удалении транзакции' 
    });
  }
});

module.exports = router;
