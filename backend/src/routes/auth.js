const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь с таким email уже существует' 
      });
    }

    // Создаем пользователя
    const user = await User.create({ name, email, password });

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(400).json({ 
      error: 'Ошибка при регистрации' 
    });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ищем пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // Проверяем пароль
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(400).json({ 
      error: 'Ошибка при входе' 
    });
  }
});

// Получить текущего пользователя
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Требуется аутентификация' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'Пользователь не найден' 
      });
    }

    res.json({ 
      user: user.toJSON() 
    });
  } catch (error) {
    res.status(401).json({ 
      error: 'Неверный токен' 
    });
  }
});

module.exports = router;
