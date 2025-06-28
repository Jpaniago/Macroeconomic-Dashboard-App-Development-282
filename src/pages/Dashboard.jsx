import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import MetricCard from '../components/MetricCard';
import ChartContainer from '../components/ChartContainer';
import TimeFilter from '../components/TimeFilter';
import { fetchBCBData, fetchIBGEData } from '../services/dataService';

const { FiTrendingUp, FiTrendingDown, FiMinus, FiRefreshCw } = FiIcons;

const Dashboard = () => {
  const [data, setData] = useState({
    selic: { value: 0, trend: 0 },
    ipca: { value: 0, trend: 0 },
    usd: { value: 0, trend: 0 },
    pib: { value: 0, trend: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Mensal');

  const loadData = async () => {
    setLoading(true);
    try {
      const [selicData, ipcaData, usdData] = await Promise.all([
        fetchBCBData('11', selectedPeriod), // Taxa Selic
        fetchIBGEData('1737', selectedPeriod), // IPCA
        fetchBCBData('1', selectedPeriod) // USD/BRL
      ]);

      setData({
        selic: {
          value: selicData[selicData.length - 1]?.valor || 0,
          trend: selicData.length > 1 ? 
            selicData[selicData.length - 1]?.valor - selicData[selicData.length - 2]?.valor : 0
        },
        ipca: {
          value: ipcaData[ipcaData.length - 1]?.valor || 0,
          trend: ipcaData.length > 1 ? 
            ipcaData[ipcaData.length - 1]?.valor - ipcaData[ipcaData.length - 2]?.valor : 0
        },
        usd: {
          value: usdData[usdData.length - 1]?.valor || 0,
          trend: usdData.length > 1 ? 
            usdData[usdData.length - 1]?.valor - usdData[usdData.length - 2]?.valor : 0
        },
        pib: { value: 2.9, trend: 0.3 } // Dados simulados para PIB
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const getTrendIcon = (trend) => {
    if (trend > 0) return FiTrendingUp;
    if (trend < 0) return FiTrendingDown;
    return FiMinus;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Macroeconômico</h1>
          <p className="text-gray-600 mt-2">Indicadores econômicos do Brasil - Período: {selectedPeriod}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <TimeFilter 
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
          
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Taxa Selic"
          value={`${data.selic.value.toFixed(2)}%`}
          trend={data.selic.trend}
          icon={getTrendIcon(data.selic.trend)}
          color="blue"
          loading={loading}
        />
        <MetricCard
          title={`IPCA (${selectedPeriod})`}
          value={`${data.ipca.value.toFixed(2)}%`}
          trend={data.ipca.trend}
          icon={getTrendIcon(data.ipca.trend)}
          color="red"
          loading={loading}
        />
        <MetricCard
          title="USD/BRL"
          value={`R$ ${data.usd.value.toFixed(2)}`}
          trend={data.usd.trend}
          icon={getTrendIcon(data.usd.trend)}
          color="green"
          loading={loading}
        />
        <MetricCard
          title={`PIB (${selectedPeriod})`}
          value={`${data.pib.value.toFixed(1)}%`}
          trend={data.pib.trend}
          icon={getTrendIcon(data.pib.trend)}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Taxa Selic"
          type="line"
          seriesCode="11"
          dataSource="BCB"
          loading={loading}
        />
        <ChartContainer
          title="IPCA"
          type="line"
          seriesCode="1737"
          dataSource="IBGE"
          loading={loading}
        />
        <ChartContainer
          title="Câmbio USD/BRL"
          type="line"
          seriesCode="1"
          dataSource="BCB"
          loading={loading}
        />
        <ChartContainer
          title="PIB"
          type="bar"
          seriesCode="pib"
          dataSource="IBGE"
          loading={loading}
        />
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-500"
        >
          Última atualização: {lastUpdate.toLocaleString('pt-BR')}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;