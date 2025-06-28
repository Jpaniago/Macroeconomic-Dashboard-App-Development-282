import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ChartContainer from '../components/ChartContainer';
import MetricCard from '../components/MetricCard';
import TimeFilter from '../components/TimeFilter';
import { fetchBCBData } from '../services/dataService';

const { FiPercent, FiTrendingUp, FiTrendingDown, FiCalendar } = FiIcons;

const InterestRatesPage = () => {
  const [data, setData] = useState({
    selic: { current: 11.75, next: 12.25, trend: 0.5 },
    cdi: { current: 11.65, trend: 0.45 },
    tjlp: { current: 7.5, trend: 0.0 }
  });
  const [loading, setLoading] = useState(true);
  const [nextMeeting, setNextMeeting] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Mensal');

  useEffect(() => {
    loadInterestData();
  }, [selectedPeriod]);

  const loadInterestData = async () => {
    setLoading(true);
    try {
      const [selicData, cdiData] = await Promise.all([
        fetchBCBData('11', selectedPeriod),  // Taxa Selic
        fetchBCBData('12', selectedPeriod)   // CDI
      ]);

      const nextCopomDate = new Date();
      nextCopomDate.setDate(nextCopomDate.getDate() + 45);
      setNextMeeting(nextCopomDate.toLocaleDateString('pt-BR'));
      
      setData({
        selic: { 
          current: selicData[selicData.length - 1]?.valor || 11.75,
          next: 12.25,
          trend: selicData.length > 1 ? 
            selicData[selicData.length - 1]?.valor - selicData[selicData.length - 2]?.valor : 0.5
        },
        cdi: { 
          current: cdiData[cdiData.length - 1]?.valor || 11.65,
          trend: cdiData.length > 1 ? 
            cdiData[cdiData.length - 1]?.valor - cdiData[cdiData.length - 2]?.valor : 0.45
        },
        tjlp: { current: 7.5, trend: 0.0 }
      });
    } catch (error) {
      console.error('Erro ao carregar dados de juros:', error);
      // Dados simulados em caso de erro
      const nextCopomDate = new Date();
      nextCopomDate.setDate(nextCopomDate.getDate() + 45);
      setNextMeeting(nextCopomDate.toLocaleDateString('pt-BR'));
      
      setData({
        selic: { current: 11.75, next: 12.25, trend: 0.5 },
        cdi: { current: 11.65, trend: 0.45 },
        tjlp: { current: 7.5, trend: 0.0 }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Taxas de Juros</h1>
          <p className="text-gray-600">Acompanhe as principais taxas de juros da economia brasileira - Período: {selectedPeriod}</p>
        </div>
        
        <TimeFilter 
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      {/* Next COPOM Meeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
      >
        <div className="flex items-center justify-center space-x-2">
          <SafeIcon icon={FiCalendar} className="text-blue-600" />
          <span className="text-blue-800 font-medium">
            Próxima reunião do COPOM: {nextMeeting}
          </span>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Taxa Selic Atual"
          value={`${data.selic.current.toFixed(2)}%`}
          trend={data.selic.trend}
          icon={data.selic.trend > 0 ? FiTrendingUp : FiTrendingDown}
          color="blue"
          loading={loading}
        />
        <MetricCard
          title={`CDI (${selectedPeriod})`}
          value={`${data.cdi.current.toFixed(2)}%`}
          trend={data.cdi.trend}
          icon={data.cdi.trend > 0 ? FiTrendingUp : FiTrendingDown}
          color="green"
          loading={loading}
        />
        <MetricCard
          title="TJLP"
          value={`${data.tjlp.current.toFixed(2)}%`}
          trend={data.tjlp.trend}
          icon={data.tjlp.trend === 0 ? FiPercent : (data.tjlp.trend > 0 ? FiTrendingUp : FiTrendingDown)}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Selic Projection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Projeção Taxa Selic</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Taxa Atual</p>
            <p className="text-3xl font-bold text-blue-600">{data.selic.current.toFixed(2)}%</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Projeção Próxima Reunião</p>
            <p className="text-3xl font-bold text-orange-600">{data.selic.next.toFixed(2)}%</p>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Evolução da Taxa Selic"
          type="line"
          seriesCode="11"
          dataSource="BCB"
          loading={loading}
        />
        <ChartContainer
          title="CDI"
          type="line"
          seriesCode="12"
          dataSource="BCB"
          loading={loading}
        />
        <ChartContainer
          title="Histórico de Decisões do COPOM"
          type="bar"
          seriesCode="11"
          dataSource="BCB"
          loading={loading}
        />
        <ChartContainer
          title="Spread Bancário"
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
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Sobre as Taxas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Selic:</strong> Taxa básica de juros da economia, definida pelo COPOM a cada 45 dias.
          </div>
          <div>
            <strong>CDI:</strong> Certificado de Depósito Interbancário, referência para investimentos.
          </div>
          <div>
            <strong>TJLP:</strong> Taxa de Juros de Longo Prazo, usada em financiamentos do BNDES.
          </div>
          <div>
            <strong>COPOM:</strong> Comitê de Política Monetária do Banco Central do Brasil.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InterestRatesPage;