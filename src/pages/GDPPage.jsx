import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ChartContainer from '../components/ChartContainer';
import MetricCard from '../components/MetricCard';
import TimeFilter from '../components/TimeFilter';
import { fetchIBGEData } from '../services/dataService';

const { FiTrendingUp, FiTrendingDown, FiBarChart3 } = FiIcons;

const GDPPage = () => {
  const [data, setData] = useState({
    quarterly: { value: 1.2, trend: 0.3 },
    annual: { value: 2.9, trend: 0.5 },
    perCapita: { value: 8.2, trend: 0.2 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Trimestral');

  useEffect(() => {
    loadGDPData();
  }, [selectedPeriod]);

  const loadGDPData = async () => {
    setLoading(true);
    try {
      // PIB a preços correntes (série 1207)
      const pibData = await fetchIBGEData('1207', selectedPeriod);
      
      if (pibData && pibData.length > 0) {
        setData({
          quarterly: { 
            value: pibData[pibData.length - 1]?.valor || 0,
            trend: pibData.length > 1 ? 
              pibData[pibData.length - 1]?.valor - pibData[pibData.length - 2]?.valor : 0
          },
          annual: { 
            value: pibData.reduce((acc, item) => acc + item.valor, 0) / pibData.length,
            trend: 0.5 
          },
          perCapita: { 
            value: 8.2, 
            trend: 0.2 
          }
        });
      } else {
        // Dados simulados se não conseguir buscar
        setData({
          quarterly: { value: 1.2, trend: 0.3 },
          annual: { value: 2.9, trend: 0.5 },
          perCapita: { value: 8.2, trend: 0.2 }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do PIB:', error);
      setData({
        quarterly: { value: 1.2, trend: 0.3 },
        annual: { value: 2.9, trend: 0.5 },
        perCapita: { value: 8.2, trend: 0.2 }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Produto Interno Bruto</h1>
          <p className="text-gray-600">Acompanhe a evolução da economia brasileira - Período: {selectedPeriod}</p>
        </div>
        
        <TimeFilter 
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          periods={['Trimestral', 'Anual']}
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title={`PIB ${selectedPeriod}`}
          value={`${data.quarterly.value.toFixed(1)}%`}
          trend={data.quarterly.trend}
          icon={data.quarterly.trend > 0 ? FiTrendingUp : FiTrendingDown}
          color="green"
          loading={loading}
        />
        <MetricCard
          title="PIB Anual"
          value={`${data.annual.value.toFixed(1)}%`}
          trend={data.annual.trend}
          icon={data.annual.trend > 0 ? FiTrendingUp : FiTrendingDown}
          color="blue"
          loading={loading}
        />
        <MetricCard
          title="PIB per Capita"
          value={`R$ ${data.perCapita.value.toFixed(1)}k`}
          trend={data.perCapita.trend}
          icon={data.perCapita.trend > 0 ? FiTrendingUp : FiTrendingDown}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="PIB - Variação"
          type="bar"
          seriesCode="1207"
          dataSource="IBGE"
          loading={loading}
        />
        <ChartContainer
          title="PIB - Evolução"
          type="line"
          seriesCode="1207"
          dataSource="IBGE"
          loading={loading}
        />
        <ChartContainer
          title="PIB por Setor"
          type="bar"
          loading={loading}
        />
        <ChartContainer
          title="PIB Comparativo Regional"
          type="bar"
          loading={loading}
        />
      </div>

      {/* Sector Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Composição do PIB por Setor</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <SafeIcon icon={FiBarChart3} className="text-2xl text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Serviços</p>
            <p className="text-xl font-bold text-blue-600">73.3%</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <SafeIcon icon={FiBarChart3} className="text-2xl text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Indústria</p>
            <p className="text-xl font-bold text-green-600">18.1%</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <SafeIcon icon={FiBarChart3} className="text-2xl text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Agropecuária</p>
            <p className="text-xl font-bold text-yellow-600">8.6%</p>
          </div>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-green-900 mb-3">Sobre o PIB</h3>
        <p className="text-sm text-green-800">
          O Produto Interno Bruto (PIB) é a soma de todos os bens e serviços produzidos no país e serve como 
          principal medida da atividade econômica. No Brasil, é calculado pelo IBGE trimestralmente, com dados 
          dessazonalizados e em volume.
        </p>
      </motion.div>
    </div>
  );
};

export default GDPPage;