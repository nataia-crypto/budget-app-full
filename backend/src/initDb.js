const { User, Account, Category, Transaction } = require('./models');

async function initDatabase() {
  try {
    // Создаем демо-пользователя
    const [user] = await User.findOrCreate({
      where: { id: 1 },
      defaults: {
        email: 'demo@example.com',
        password: 'demo123',
        name: 'Демо пользователь'
      }
    });

    // Создаем демо-счет
    const [account] = await Account.findOrCreate({
      where: { id: 1 },
      defaults: {
        name: 'Основной счет',
        type: 'cash',
        balance: 0,
        userId: 1
      }
    });

    // Создаем демо-категории
    const categories = [
      { name: 'Еда', type: 'expense', userId: 1 },
      { name: 'Транспорт', type: 'expense', userId: 1 },
      { name: 'Зарплата', type: 'income', userId: 1 },
      { name: 'Фриланс', type: 'income', userId: 1 }
    ];

    for (const cat of categories) {
      await Category.findOrCreate({
        where: { name: cat.name, userId: 1 },
        defaults: cat
      });
    }

    console.log('✅ Демо-данные инициализированы');
  } catch (error) {
    console.error('❌ Ошибка инициализации демо-данных:', error);
  }
}

module.exports = initDatabase;
