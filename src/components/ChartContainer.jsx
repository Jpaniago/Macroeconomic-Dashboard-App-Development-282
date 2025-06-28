import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { fetchBCBData, fetchIBGEData, formatDataLabel } from '../services/dataService';
import TimeFilter from './TimeFilter';

const ChartContainer = ({ title, type = 'line', seriesCode, dataSource = 'BCB', loading = false }) => {
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Mensal');

  useEffect(() => {
    loadChartData();
  }, [title, selectedPeriod, seriesCode]);

  const loadChartData = async () => {
    setChartLoading(true);
    try {
      let data = [];
      
      if (seriesCode) {
        // Busca dados reais baseado na fonte
        if (dataSource === 'BCB') {
          data = await fetchBCBData(seriesCode, selectedPeriod);
        } else if (dataSource === 'IBGE') {
          data = await fetchIBGEData(seriesCode, selectedPeriod);
        }
      } else {
        // Dados simulados para demonstração
        data = generateSimulatedData();
      }
      
      setChartData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
      setChartData(generateSimulatedData());
    } finally {
      setChartLoading(false);
    }
  };

  const generateSimulatedData = () => {
    const data = [];
    const baseValue = getBaseValueFromTitle(title);
    
    if (selectedPeriod === 'Mensal') {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      for (let i = 0; i < 12; i++) {
        data.push({
          data: months[i],
          valor: baseValue + (Math.random() - 0.5) * 2
        });
      }
    } else if (selectedPeriod === 'Trimestral') {
      for (let i = 0; i < 8; i++) {
        const year = 2022 + Math.floor(i / 4);
        const quarter = (i % 4) + 1;
        data.push({
          data: `${year}-Q${quarter}`,
          valor: baseValue + (Math.random() - 0.5) * 2
        });
      }
    } else if (selectedPeriod === 'Anual') {
      for (let i = 0; i < 10; i++) {
        const year = 2014 + i;
        data.push({
          data: year.toString(),
          valor: baseValue + (Math.random() - 0.5) * 3
        });
      }
    }
    
    return data;
  };

  const getBaseValueFromTitle = (title) => {
    if (title.includes('Selic')) return 10.75;
    if (title.includes('IPCA')) return 4.5;
    if (title.includes('Câmbio') || title.includes('USD')) return 5.0;
    if (title.includes('PIB')) return 2.9;
    return 5.0;
  };

  const getChartOptions = () => {
    const baseOptions = {
      title: {
        text: `${title} - ${selectedPeriod}`,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#374151'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        textStyle: {
          color: '#374151'
        },
        formatter: function(params) {
          const point = params[0];
          const label = formatDataLabel(point.axisValue, selectedPeriod);
          return `${label}<br/>${point.seriesName}: ${point.value.toFixed(2)}${getUnitFromTitle(title)}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.map(item => formatDataLabel(item.data, selectedPeriod)),
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisLabel: {
          color: '#6b7280',
          rotate: selectedPeriod === 'Mensal' && chartData.length > 8 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisLabel: {
          color: '#6b7280',
          formatter: function(value) {
            return value.toFixed(2) + getUnitFromTitle(title);
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6'
          }
        }
      }
    };

    const seriesData = chartData.map(item => item.valor);
    const seriesName = title.split(' - ')[0];

    if (type === 'line') {
      return {
        ...baseOptions,
        series: [{
          name: seriesName,
          data: seriesData,
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
            color: getColorFromTitle(title)
          },
          itemStyle: {
            color: getColorFromTitle(title)
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: getColorFromTitle(title) + '40'
              }, {
                offset: 1, color: getColorFromTitle(title) + '10'
              }]
            }
          }
        }]
      };
    } else {
      return {
        ...baseOptions,
        series: [{
          name: seriesName,
          data: seriesData,
          type: 'bar',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: getColorFromTitle(title)
              }, {
                offset: 1, color: getDarkerColor(getColorFromTitle(title))
              }]
            }
          }
        }]
      };
    }
  };

  const getColorFromTitle = (title) => {
    if (title.includes('Selic') || title.includes('Juros')) return '#3b82f6';
    if (title.includes('IPCA') || title.includes('Inflação')) return '#ef4444';
    if (title.includes('Câmbio') || title.includes('USD')) return '#10b981';
    if (title.includes('PIB')) return '#8b5cf6';
    return '#3b82f6';
  };

  const getDarkerColor = (color) => {
    const colorMap = {
      '#3b82f6': '#1d4ed8',
      '#ef4444': '#dc2626',
      '#10b981': '#059669',
      '#8b5cf6': '#7c3aed'
    };
    return colorMap[color] || '#1d4ed8';
  };

  const getUnitFromTitle = (title) => {
    if (title.includes('Câmbio') || title.includes('USD')) return '';
    if (title.includes('%') || title.includes('PIB') || title.includes('Selic') || title.includes('IPCA')) return '%';
    return '';
  };

  if (loading || chartLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <div className="mb-4">
        <TimeFilter 
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>
      
      <ReactECharts
        option={getChartOptions()}
        style={{ height: '300px' }}
        opts={{ renderer: 'canvas' }}
      />
    </motion.div>
  );
};

export default ChartContainer;