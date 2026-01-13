const express = require('express');
const router = express.Router();
const { Budget, Category, Transaction } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Получить все бюджеты пользователя
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: Category,
          attributes: ['id', 'name', 'color', 'icon'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Получаем статистику по каждому бюджету
    const budgetsWithStats = await Promise.all(
      budgets.map(async (budget) => {
        const budgetData = budget.toJSON();
        
        // Рассчитываем потраченную сумму за период
        const startDate = new Date(budget.start_date);
        const endDate = new Date(budget.end_date);

        const expenses = await Transaction.sum('amount', {
          where: {
            userId: req.user.id,
            categoryId: budget.categoryId,
            type: 'expense',
            date: {
              [Op.between]: [startDate, endDate],
            },
          },
        });

        budgetData.spent = expenses || 0;
        budgetData.remaining = budget.amount - budgetData.spent;
        budgetData.percentage = budget.amount > 0 
          ? Math.min((budgetData.spent / budget.amount) * 100, 100) 
          : 0;

        return budgetData;
      })
    );

    res.json(budgetsWithStats);
  } catch (error) {
    console.error('Ошибка получения бюджетов:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении бюджетов' 
    });
  }
});

// Создать бюджет
router.post('/', auth, async (req, res) => {
  try {
    const { categoryId, amount, period } = req.body;

    // Проверяем существование категории
    const category = await Category.findOne({
      where: { 
        id: categoryId, 
        userId: req.user.id,
        type: 'expense',
      },
    });

    if (!category) {
      return res.status(404).json({ 
        error: 'Категория расходов не найдена' 
      });
    }

    // Рассчитываем даты в зависимости от периода
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
    }

    const budget = await Budget.create({
      categoryId,
      amount,
      period,
      start_date: startDate,
      end_date: endDate,
      userId: req.user.id,
    });

    const fullBudget = await Budget.findByPk(budget.id, {
      include: [{ model: Category }],
    });

    res.status(201).json(fullBudget);
  } catch (error) {
    console.error('Ошибка создания бюджета:', error);
    res.status(400).json({ 
      error: 'Ошибка при создании бюджета' 
    });
  }
});

// Обновить бюджет
router.put('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
    });

    if (!budget) {
      return res.status(404).json({ 
        error: 'Бюджет не найден' 
      });
    }

    await budget.update(req.body);

    const updatedBudget = await Budget.findByPk(budget.id, {
      include: [{ model: Category }],
    });

    res.json(updatedBudget);
  } catch (error) {
    console.error('Ошибка обновления бюджета:', error);
    res.status(400).json({ 
      error: 'Ошибка при обновлении бюджета' 
    });
  }
});

// Удалить бюджет
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
    });

    if (!budget) {
      return res.status(404).json({ 
        error: 'Бюджет не найден' 
      });
    }

    await budget.destroy();

    res.json({ 
      message: 'Бюджет удален' 
    });
  } catch (error) {
    console.error('Ошибка удаления бюджета:', error);
    res.status(500).json({ 
      error: 'Ошибка при удалении бюджета' 
    });
  }
});

module.exports = router;
