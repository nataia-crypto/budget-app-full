const express = require('express');
const router = express.Router();
const { Transaction, Account, Category } = require('../models');
const auth = require('../middleware/auth');

// Получить все транзакции пользователя
router.get('/', auth, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      categoryId, 
      accountId,
      limit = 50,
      offset = 0 
    } = req.query;

    const where = { userId: req.user.id };

    // Фильтры
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.$gte = new Date(startDate);
      if (endDate) where.date.$lte = new Date(endDate);
    }

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;

    const transactions = await Transaction.findAll({
      where,
      include: [
        { 
          model: Account, 
          attributes: ['id', 'name', 'type', 'color'] 
        },
        { 
          model: Category, 
          attributes: ['id', 'name', 'type', 'color', 'icon'] 
        },
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Получаем общее количество для пагинации
    const total = await Transaction.count({ where });

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Ошибка получения транзакций:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении транзакций' 
    });
  }
});

// Получить статистику
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = { userId: req.user.id };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.$gte = new Date(startDate);
      if (endDate) where.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.findAll({ where });

    const stats = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      byCategory: {},
      byDay: {},
    };

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      
      if (transaction.type === 'income') {
        stats.totalIncome += amount;
        stats.balance += amount;
      } else if (transaction.type === 'expense') {
        stats.totalExpense += amount;
        stats.balance -= amount;
      }

      // Статистика по категориям
      if (transaction.Category) {
        const catName = transaction.Category.name;
        stats.byCategory[catName] = (stats.byCategory[catName] || 0) + amount;
      }

      // Статистика по дням
      const date = transaction.date.toISOString().split('T')[0];
      stats.byDay[date] = (stats.byDay[date] || 0) + amount;
    });

    res.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении статистики' 
    });
  }
});

// Создать транзакцию
router.post('/', auth, async (req, res) => {
  try {
    const { 
      type, 
      amount, 
      description, 
      categoryId, 
      accountId, 
      date, 
      tags = [] 
    } = req.body;

    // Проверяем существование счета
    const account = await Account.findOne({ 
      where: { id: accountId, userId: req.user.id } 
    });
    
    if (!account) {
      return res.status(404).json({ 
        error: 'Счет не найден' 
      });
    }

    // Проверяем существование категории (если указана)
    if (categoryId) {
      const category = await Category.findOne({ 
        where: { id: categoryId, userId: req.user.id } 
      });
      
      if (!category) {
        return res.status(404).json({ 
          error: 'Категория не найдена' 
        });
      }
    }

    const transaction = await Transaction.create({
      type,
      amount,
      description,
      categoryId,
      accountId,
      date: date || new Date(),
      tags,
      userId: req.user.id,
    });

    // Обновляем баланс счета
    const updateAmount = type === 'income' ? amount : -amount;
    await account.increment('balance', { by: updateAmount });

    // Получаем полную транзакцию с связанными данными
    const fullTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        { model: Account },
        { model: Category },
      ],
    });

    res.status(201).json(fullTransaction);
  } catch (error) {
    console.error('Ошибка создания транзакции:', error);
    res.status(400).json({ 
      error: 'Ошибка при создании транзакции' 
    });
  }
});

// Обновить транзакцию
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
    });

    if (!transaction) {
      return res.status(404).json({ 
        error: 'Транзакция не найдена' 
      });
    }

    // Сохраняем старые данные для отката баланса
    const oldAmount = parseFloat(transaction.amount);
    const oldType = transaction.type;
    const oldAccountId = transaction.accountId;

    const { 
      type = oldType, 
      amount, 
      accountId = oldAccountId,
      ...updates 
    } = req.body;

    const newAmount = parseFloat(amount || oldAmount);

    // Если изменился счет или сумма/тип, обновляем балансы
    if (oldAccountId !== accountId || oldAmount !== newAmount || oldType !== type) {
      const oldAccount = await Account.findByPk(oldAccountId);
      const newAccount = await Account.findByPk(accountId);

      if (!oldAccount || !newAccount) {
        return res.status(404).json({ 
          error: 'Счет не найден' 
        });
      }

      // Откатываем старую транзакцию
      const oldAdjustment = oldType === 'income' ? -oldAmount : oldAmount;
      await oldAccount.increment('balance', { by: oldAdjustment });

      // Применяем новую транзакцию
      const newAdjustment = type === 'income' ? newAmount : -newAmount;
      await newAccount.increment('balance', { by: newAdjustment });
    }

    // Обновляем транзакцию
    await transaction.update({
      type,
      amount: newAmount,
      accountId,
      ...updates,
    });

    const updatedTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        { model: Account },
        { model: Category },
      ],
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Ошибка обновления транзакции:', error);
    res.status(400).json({ 
      error: 'Ошибка при обновлении транзакции' 
    });
  }
});

// Удалить транзакцию
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
    });

    if (!transaction) {
      return res.status(404).json({ 
        error: 'Транзакция не найдена' 
      });
    }

    // Обновляем баланс счета
    const account = await Account.findByPk(transaction.accountId);
    const adjustment = transaction.type === 'income' 
      ? -parseFloat(transaction.amount) 
      : parseFloat(transaction.amount);
    
    await account.increment('balance', { by: adjustment });

    // Удаляем транзакцию
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
