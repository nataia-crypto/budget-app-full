const { sequelize, User, Category, Account } = require('./models');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ База данных синхронизирована');

    // Создаем тестового пользователя
    const user = await User.create({
      name: 'Тестовый Пользователь',
      email: 'test@example.com',
      password: 'password123',
    });

    console.log(`✅ Пользователь создан: ${user.email}`);

    // Создаем стандартные категории доходов
    const incomeCategories = [
      { name: 'Зарплата', type: 'income', color: '#10B981', icon: 'briefcase' },
      { name: 'Фриланс', type: 'income', color: '#8B5CF6', icon: 'code' },
      { name: 'Инвестиции', type: 'income', color: '#F59E0B', icon: 'trending-up' },
      { name: 'Подарки', type: 'income', color: '#EC4899', icon: 'gift' },
      { name: 'Возврат долга', type: 'income', color: '#14B8A6', icon: 'dollar-sign' },
    ];

    // Создаем стандартные категории расходов
    const expenseCategories = [
      { name: 'Продукты', type: 'expense', color: '#EF4444', icon: 'shopping-cart' },
      { name: 'Транспорт', type: 'expense', color: '#3B82F6', icon: 'car' },
      { name: 'Развлечения', type: 'expense', color: '#8B5CF6', icon: 'film' },
      { name: 'Кафе и рестораны', type: 'expense', color: '#F59E0B', icon: 'coffee' },
      { name: 'Комунальные услуги', type: 'expense', color: '#10B981', icon: 'home' },
      { name: 'Одежда', type: 'expense', color: '#EC4899', icon: 'shopping-bag' },
      { name: 'Здоровье', type: 'expense', color: '#14B8A6', icon: 'heart' },
      { name: 'Образование', type: 'expense', color: '#6366F1', icon: 'book-open' },
    ];

    for (const cat of [...incomeCategories, ...expenseCategories]) {
      await Category.create({
        ...cat,
        userId: user.id,
        is_default: true,
      });
    }

    console.log('✅ Категории созданы');

    // Создаем тестовые счета
    const accounts = [
      { name: 'Наличные', type: 'cash', balance: 5000, color: '#10B981', icon: 'wallet' },
      { name: 'Основная карта', type: 'bank_account', balance: 25000, color: '#3B82F6', icon: 'credit-card' },
      { name: 'Кредитная карта', type: 'credit_card', balance: 0, color: '#EF4444', icon: 'credit-card' },
      { name: 'Сбережения', type: 'savings', balance: 100000, color: '#F59E0B', icon: 'piggy-bank' },
    ];

    for (const acc of accounts) {
      await Account.create({
        ...acc,
        userId: user.id,
      });
    }

    console.log('✅ Счета созданы');
    console.log('✅ Начальные данные успешно загружены!');
    
    console.log('\n🔑 Данные для входа:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при загрузке начальных данных:', error);
    process.exit(1);
  }
};

seedDatabase();
