const { sequelize } = require('../config/database');
const User = require('./User');
const Account = require('./Account');
const Category = require('./Category');
const Transaction = require('./Transaction');
const Budget = require('./Budget');

// Определяем связи между моделями

// User имеет много Account
User.hasMany(Account, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Account.belongsTo(User, { foreignKey: 'user_id' });

// User имеет много Category
User.hasMany(Category, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'user_id' });

// User имеет много Transaction
User.hasMany(Transaction, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

// User имеет много Budget
User.hasMany(Budget, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'user_id' });

// Account имеет много Transaction
Account.hasMany(Transaction, { foreignKey: 'account_id', onDelete: 'CASCADE' });
Transaction.belongsTo(Account, { foreignKey: 'account_id' });

// Category имеет много Transaction
Category.hasMany(Transaction, { foreignKey: 'category_id', onDelete: 'SET NULL' });
Transaction.belongsTo(Category, { foreignKey: 'category_id' });

// Category имеет много Budget
Category.hasMany(Budget, { foreignKey: 'category_id', onDelete: 'CASCADE' });
Budget.belongsTo(Category, { foreignKey: 'category_id' });

module.exports = {
  sequelize,
  User,
  Account,
  Category,
  Transaction,
  Budget,
};
