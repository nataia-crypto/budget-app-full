const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const simpleTransactionRoutes = require('./routes/simpleTransactions');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS настройки
const corsOptions = {
  origin: ['https://budget-app-full.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/simple/transactions', simpleTransactionRoutes);

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
    app.listen(PORT, 'localhost', () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📡 API доступен по адресу: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к БД:', err);
    process.exit(1);
  });

module.exports = app;
