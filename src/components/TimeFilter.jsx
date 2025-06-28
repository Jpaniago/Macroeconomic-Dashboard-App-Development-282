import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCalendar, FiCheck } = FiIcons;

const TimeFilter = ({ selectedPeriod, onPeriodChange, periods = ['Mensal', 'Trimestral', 'Anual'] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
    >
      <div className="flex items-center space-x-2 mb-3">
        <SafeIcon icon={FiCalendar} className="text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Período</span>
      </div>
      
      <div className="flex space-x-2">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => onPeriodChange(period)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-1">
              {selectedPeriod === period && (
                <SafeIcon icon={FiCheck} className="text-xs" />
              )}
              <span>{period}</span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default TimeFilter;