const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Бэкенд для учета бюджета работает',
    timestamp: new Date().toISOString()
  });
});

// Connect to database and start server
sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ База данных подключена');
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📡 API доступен по адресу: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к БД:', err);
    process.exit(1);
  });

module.exports = app;
