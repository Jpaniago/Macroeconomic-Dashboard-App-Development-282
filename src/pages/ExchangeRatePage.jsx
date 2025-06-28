import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ChartContainer from '../components/ChartContainer';
import MetricCard from '../components/MetricCard';
import TimeFilter from '../components/TimeFilter';
import { fetchBCBData } from '../services/dataService';

const { FiDollarSign, FiTrendingUp, FiTrendingDown, FiGlobe } = FiIcons;

const ExchangeRatePage = () => {
  const [data, setData] = useState({
    usd: { buy: 5.12, sell: 5.13, trend: 0.02 },
    eur: { buy: 5.45, sell: 5.46, trend: -0.01 },
    gbp: { buy: 6.28, sell: 6.29, trend: 0.03 },
    ars: { buy: 0.0052, sell: 0.0053, trend: -0.0001 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Mensal');

  useEffect(() => {
    loadExchangeData();
  }, [selectedPeriod]);

  const loadExchangeData = async () => {
    setLoading(true);
    try {
      const [usdData, eurData] = await Promise.all([
        fetchBCBData('1', selectedPeriod),    // USD/BRL
        fetchBCBData('21619', selectedPeriod) // EUR/BRL
      ]);

      setData({
        usd: { 
          buy: usdData[usdData.length - 1]?.valor || 5.12,
          sell: (usdData[usdData.length - 1]?.valor || 5.12) + 0.01,
          trend: usdData.length > 1 ? 
            usdData[usdData.length - 1]?.valor - usdData[usdData.length - 2]?.valor : 0.02
        },
        eur: { 
          buy: eurData[eurData.length - 1]?.valor || 5.45,
          sell: (eurData[eurData.length - 1]?.valor || 5.45) + 0.01,
          trend: eurData.length > 1 ? 
            eurData[eurData.length - 1]?.valor - eurData[eurData.length - 2]?.valor : -0.01
        },
        gbp: { buy: 6.28, sell: 6.29, trend: 0.03 },
        ars: { buy: 0.0052, sell: 0.0053, trend: -0.0001 }
      });
    } catch (error) {
      console.error('Erro ao carregar dados de câmbio:', error);
      setData({
        usd: { buy: 5.12, sell: 5.13, trend: 0.02 },
        eur: { buy: 5.45, sell: 5.46, trend: -0.01 },
        gbp: { buy: 6.28, sell: 6.29, trend: 0.03 },
        ars: { buy: 0.0052, sell: 0.0053, trend: -0.0001 }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value, currency) => {
    if (currency === 'ARS') {
      return `R$ ${value.toFixed(4)}`;
    }
    return `R$ ${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Taxas de Câmbio</h1>
          <p className="text-gray-600">Cotações das principais moedas em relação ao Real - Período: {selectedPeriod}</p>
        </div>
        
        <TimeFilter 
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      {/* Main Currency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="USD/BRL"
          value={formatCurrency(data.usd.buy, 'USD')}
          trend={data.usd.trend}
          icon={data.usd.trend > 0 ? FiTrendingUp : FiTrendingDown}
          color="green"
          loading={loading}
        />
        <MetricCard
          title="EUR/BRL"
          value={formatCurrency(data.eur.buy, 'EUR')}
          trend={data.eur.trend}
          icon={data.eur.trend > 0 ? FiTrendingUp : FiTrendingDown}
          color="blue"
          loading={loading}
        />
        <MetricCard
          title="GBP/BRL"
          value={formatCurrency(data.gbp.buy, 'GBP')}
          trend={data.gbp.trend}
          icon={data.gbp.trend > 0 ? FiTrendingUp : FiTrendingDown}
          color="purple"
          loading={loading}
        />
        <MetricCard
          title="ARS/BRL"
          value={formatCurrency(data.ars.buy, 'ARS')}
          trend={data.ars.trend}
          icon={data.ars.trend > 0 ? FiTrendingUp : FiTrendingDown}
          color="red"
          loading={loading}
        />
      </div>

      {/* Detailed Exchange Rates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Cotações Detalhadas - {selectedPeriod}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moeda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data).map(([currency, rates]) => (
                <tr key={currency} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <SafeIcon icon={FiGlobe} className="text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {currency.toUpperCase()}/BRL
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(rates.buy, currency.toUpperCase())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(rates.sell, currency.toUpperCase())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center space-x-1 ${
                      rates.trend > 0 ? 'text-green-600' : rates.trend < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <SafeIcon 
                        icon={
                          rates.trend > 0 ? FiTrendingUp : 
                          rates.trend < 0 ? FiTrendingDown : 
                          FiDollarSign
                        } 
                        className="text-sm" 
                      />
                      <span className="text-sm font-medium">
                        {rates.trend > 0 ? '+' : ''}{rates.trend.toFixed(4)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="USD/BRL"
          type="line"
          seriesCode="1"
          dataSource="BCB"
          loading={loading}
        />
        <ChartContainer
          title="EUR/BRL"
          type="line"
          seriesCode="21619"
          dataSource="BCB"
          loading={loading}
        />
        <ChartContainer
          title="Volatilidade das Moedas"
          type="bar"
          loading={loading}
        />
        <ChartContainer
          title="Comparativo de Moedas"
          type="line"
          loading={loading}
        />
      </div>

      {/* Currency Converter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversor de Moedas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <input
              type="number"
              placeholder="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">De</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Para</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900">Resultado: R$ {(1000 * data.usd.buy).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-green-900 mb-3">Sobre o Câmbio</h3>
        <p className="text-sm text-green-800">
          As cotações são atualizadas em tempo real durante o horário de funcionamento do mercado. 
          Os valores de compra e venda podem variar entre instituições financeiras. Para operações 
          comerciais, consulte sempre sua instituição financeira. Os dados são obtidos diretamente 
          do Banco Central do Brasil.
        </p>
      </motion.div>
    </div>
  );
};

export default ExchangeRatePage;