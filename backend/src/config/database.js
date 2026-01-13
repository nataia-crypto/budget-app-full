const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено');
  } catch (error) {
    console.error('❌ Не удалось подключиться к базе данных:', error);
  }
};

testConnection();

module.exports = { sequelize };
