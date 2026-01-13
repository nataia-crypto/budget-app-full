import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartProps {
  transactions: any[];
}

const Charts: React.FC<ChartProps> = ({ transactions }) => {
  // Считаем расходы по категориям
  const categoryData = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((acc: Record<string, number>, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  // Преобразуем в массив для графика
  const pieData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value: Number((value as number).toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Цвета для секторов
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'
  ];

  if (pieData.length === 0) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '15px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>📈 График расходов</h3>
        <p style={{ color: '#666' }}>Добавьте расходы, чтобы увидеть график</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '15px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginTop: 0 }}>📈 Распределение расходов</h3>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              // Исправление: проверяем, что percent определен
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(1) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} ₽`, 'Сумма']}
              labelFormatter={(label) => `Категория: ${label}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        <p>💡 <strong>Совет:</strong> Наведите на сектор, чтобы увидеть точную сумму</p>
      </div>
    </div>
  );
};

export default Charts;
