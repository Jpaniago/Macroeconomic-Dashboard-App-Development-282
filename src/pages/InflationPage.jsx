import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ChartContainer from '../components/ChartContainer';
import MetricCard from '../components/MetricCard';
import TimeFilter from '../components/TimeFilter';
import { fetchIBGEData, fetchBCBData } from '../services/dataService';

const { FiPercent, FiTrendingUp, FiTrendingDown } = FiIcons;

const InflationPage = () => {
  const [data, setData] = useState({
    ipca: { current: 0, accumulated: 0, target: 3.0 },
    igpm: { current: 0, accumulated: 0 },
    inpc: { current: 0, accumulated: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Mensal');

  useEffect(() => {
    loadInflationData();
  }, [selectedPeriod]);

  const loadInflationData = async () => {
    setLoading(true);
    try {
      const [ipcaData, igpmData, inpcData] = await Promise.all([
        fetchIBGEData('1737', selectedPeriod), // IPCA
        fetchBCBData('189', selectedPeriod),   // IGP-M
        fetchIBGEData('1736', selectedPeriod)  // INPC
      ]);

      setData({
        ipca: { 
          current: ipcaData[ipcaData.length - 1]?.valor || 0,
          accumulated: ipcaData.reduce((acc, item) => acc + item.valor, 0),
          target: 3.0 
        },
        igpm: { 
          current: igpmData[igpmData.length - 1]?.valor || 0,
          accumulated: igpmData.reduce((acc, item) => acc + item.valor, 0)
        },
        inpc: { 
          current: inpcData[inpcData.length - 1]?.valor || 0,
          accumulated: inpcData.reduce((acc, item) => acc + item.valor, 0)
        }
      });
    } catch (error) {
      console.error('Erro ao carregar dados de inflação:', error);
      // Dados simulados em caso de erro
      setData({
        ipca: { current: 0.32, accumulated: 4.62, target: 3.0 },
        igpm: { current: 0.28, accumulated: 5.12 },
        inpc: { current: 0.35, accumulated: 4.89 }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Indicadores de Inflação</h1>
          <p className="text-gray-600">Acompanhe os principais índices de preços do Brasil - Período: {selectedPeriod}</p>
        </div>
        
        <TimeFilter 
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title={`IPCA (${selectedPeriod})`}
          value={`${data.ipca.current.toFixed(2)}%`}
          trend={data.ipca.current}
          icon={data.ipca.current > 0 ? FiTrendingUp : FiTrendingDown}
          color="red"
          loading={loading}
        />
        <MetricCard
          title={`IPCA (Acumulado)`}
          value={`${data.ipca.accumulated.toFixed(2)}%`}
          trend={data.ipca.accumulated - data.ipca.target}
          icon={data.ipca.accumulated > data.ipca.target ? FiTrendingUp : FiTrendingDown}
          color="red"
          loading={loading}
        />
        <MetricCard
          title="Meta de Inflação"
          value={`${data.ipca.target.toFixed(1)}%`}
          trend={0}
          icon={FiPercent}
          color="blue"
          loading={loading}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title={`IGP-M (${selectedPeriod})`}
          value={`${data.igpm.accumulated.toFixed(2)}%`}
          trend={data.igpm.current}
          icon={data.igpm.current > 0 ? FiTrendingUp : FiTrendingDown}
          color="purple"
          loading={loading}
        />
        <MetricCard
          title={`INPC (${selectedPeriod})`}
          value={`${data.inpc.accumulated.toFixed(2)}%`}
          trend={data.inpc.current}
          icon={data.inpc.current > 0 ? FiTrendingUp : FiTrendingDown}
          color="green"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="IPCA - Evolução"
          type="line"
          seriesCode="1737"
          dataSource="IBGE"
          loading={loading}
        />
        <ChartContainer
          title="IGP-M - Evolução"
          type="line"
          seriesCode="189"
          dataSource="BCB"
          loading={loading}
        />
        <ChartContainer
          title="INPC - Evolução"
          type="line"
          seriesCode="1736"
          dataSource="IBGE"
          loading={loading}
        />
        <ChartContainer
          title="Comparativo de Índices"
          type="line"
          loading={loading}
        />
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Sobre os Indicadores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>IPCA:</strong> Índice Nacional de Preços ao Consumidor Amplo, usado como referência para a meta de inflação.
          </div>
          <div>
            <strong>IGP-M:</strong> Índice Geral de Preços do Mercado, amplamente usado em contratos.
          </div>
          <div>
            <strong>INPC:</strong> Índice Nacional de Preços ao Consumidor, focado nas famílias de menor renda.
          </div>
          <div>
            <strong>Meta:</strong> Definida pelo Conselho Monetário Nacional para orientar a política monetária.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InflationPage;