import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';

const MetricCard = ({ title, value, trend, icon, color = 'blue', loading = false }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <SafeIcon icon={icon} className="text-white text-lg" />
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend !== 0 && (
          <div className={`flex items-center space-x-1 text-sm ${getTrendColor(trend)}`}>
            <SafeIcon icon={icon} className="text-xs" />
            <span>{trend > 0 ? '+' : ''}{trend.toFixed(2)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;