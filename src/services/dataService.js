// Serviço para buscar dados do Banco Central do Brasil
export const fetchBCBData = async (seriesCode, period = 'Mensal') => {
  try {
    const periodMap = {
      'Mensal': 12,    // Últimos 12 meses
      'Trimestral': 8, // Últimos 8 trimestres (2 anos)
      'Anual': 10      // Últimos 10 anos
    };

    const months = periodMap[period] || 12;
    const endDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const startDate = new Date();
    
    if (period === 'Anual') {
      startDate.setFullYear(startDate.getFullYear() - months);
    } else if (period === 'Trimestral') {
      startDate.setMonth(startDate.getMonth() - (months * 3));
    } else {
      startDate.setMonth(startDate.getMonth() - months);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
    
    const response = await fetch(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados?formato=json&dataInicial=${startDateStr}&dataFinal=${endDate}`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar dados do BCB');
    }
    
    const data = await response.json();
    return processBCBData(data, period);
  } catch (error) {
    console.error('Erro ao buscar dados do BCB:', error);
    return generateMockData(seriesCode, period);
  }
};

// Serviço para buscar dados do IBGE
export const fetchIBGEData = async (seriesCode, period = 'Mensal') => {
  try {
    const periodMap = {
      'Mensal': '-12',      // Últimos 12 períodos
      'Trimestral': '-8',   // Últimos 8 trimestres
      'Anual': '-10'        // Últimos 10 anos
    };

    const periodsParam = periodMap[period] || '-12';
    
    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v3/agregados/${seriesCode}/periodos/${periodsParam}/variaveis/63?localidades=N1[all]`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar dados do IBGE');
    }
    
    const data = await response.json();
    const series = data[0]?.resultados[0]?.series[0]?.serie || {};
    
    return processIBGEData(series, period);
  } catch (error) {
    console.error('Erro ao buscar dados do IBGE:', error);
    return generateMockData(seriesCode, period);
  }
};

// Processa dados do BCB baseado no período
const processBCBData = (data, period) => {
  if (period === 'Trimestral') {
    // Agrupa dados mensais em trimestres
    const quarters = [];
    const groupedData = {};
    
    data.forEach(item => {
      const date = new Date(item.data.split('/').reverse().join('-'));
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      const year = date.getFullYear();
      const key = `${year}-Q${quarter}`;
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(parseFloat(item.valor));
    });
    
    Object.entries(groupedData).forEach(([key, values]) => {
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
      quarters.push({
        data: key,
        valor: avgValue
      });
    });
    
    return quarters.sort((a, b) => a.data.localeCompare(b.data));
  } else if (period === 'Anual') {
    // Agrupa dados mensais em anos
    const years = [];
    const groupedData = {};
    
    data.forEach(item => {
      const date = new Date(item.data.split('/').reverse().join('-'));
      const year = date.getFullYear().toString();
      
      if (!groupedData[year]) {
        groupedData[year] = [];
      }
      groupedData[year].push(parseFloat(item.valor));
    });
    
    Object.entries(groupedData).forEach(([year, values]) => {
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
      years.push({
        data: year,
        valor: avgValue
      });
    });
    
    return years.sort((a, b) => a.data.localeCompare(b.data));
  }
  
  // Retorna dados mensais como estão
  return data.map(item => ({
    data: item.data,
    valor: parseFloat(item.valor)
  }));
};

// Processa dados do IBGE baseado no período
const processIBGEData = (series, period) => {
  const processedData = Object.entries(series).map(([periodo, valor]) => ({
    data: periodo,
    valor: parseFloat(valor) || 0
  }));

  if (period === 'Trimestral') {
    // Agrupa dados mensais em trimestres se necessário
    const quarters = [];
    const groupedData = {};
    
    processedData.forEach(item => {
      const year = item.data.substring(0, 4);
      const month = parseInt(item.data.substring(4, 6));
      const quarter = Math.ceil(month / 3);
      const key = `${year}-Q${quarter}`;
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item.valor);
    });
    
    Object.entries(groupedData).forEach(([key, values]) => {
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
      quarters.push({
        data: key,
        valor: avgValue
      });
    });
    
    return quarters.sort((a, b) => a.data.localeCompare(b.data));
  } else if (period === 'Anual') {
    // Agrupa dados mensais em anos
    const years = [];
    const groupedData = {};
    
    processedData.forEach(item => {
      const year = item.data.substring(0, 4);
      
      if (!groupedData[year]) {
        groupedData[year] = [];
      }
      groupedData[year].push(item.valor);
    });
    
    Object.entries(groupedData).forEach(([year, values]) => {
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
      years.push({
        data: year,
        valor: avgValue
      });
    });
    
    return years.sort((a, b) => a.data.localeCompare(b.data));
  }
  
  return processedData.sort((a, b) => a.data.localeCompare(b.data));
};

// Função para gerar dados simulados (fallback)
const generateMockData = (seriesCode, period = 'Mensal') => {
  const baseValues = {
    '11': 10.75, // Selic
    '1737': 4.5, // IPCA
    '1': 5.0,    // USD/BRL
    'pib': 2.9   // PIB
  };
  
  const baseValue = baseValues[seriesCode] || 5.0;
  const data = [];
  
  if (period === 'Mensal') {
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (12 - i - 1));
      data.push({
        data: date.toISOString().split('T')[0],
        valor: baseValue + (Math.random() - 0.5) * 2
      });
    }
  } else if (period === 'Trimestral') {
    for (let i = 0; i < 8; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - ((8 - i - 1) * 3));
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      data.push({
        data: `${date.getFullYear()}-Q${quarter}`,
        valor: baseValue + (Math.random() - 0.5) * 2
      });
    }
  } else if (period === 'Anual') {
    for (let i = 0; i < 10; i++) {
      const year = new Date().getFullYear() - (10 - i - 1);
      data.push({
        data: year.toString(),
        valor: baseValue + (Math.random() - 0.5) * 2
      });
    }
  }
  
  return data;
};

// Serviço para buscar dados do Ipeadata
export const fetchIpeaData = async (seriesCode, period = 'Mensal') => {
  try {
    // Como o Ipeadata pode não ter CORS habilitado, vamos usar dados simulados
    // Em produção, seria necessário um proxy backend
    return generateMockData(seriesCode, period);
  } catch (error) {
    console.error('Erro ao buscar dados do Ipeadata:', error);
    return generateMockData(seriesCode, period);
  }
};

// Função para formatar labels baseado no período
export const formatDataLabel = (dataStr, period) => {
  if (period === 'Trimestral' && dataStr.includes('-Q')) {
    return dataStr; // Já está no formato correto
  } else if (period === 'Anual') {
    return dataStr; // Ano já está no formato correto
  } else {
    // Formato mensal - converte data para formato brasileiro
    if (dataStr.includes('-')) {
      const date = new Date(dataStr);
      return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    }
    return dataStr;
  }
};