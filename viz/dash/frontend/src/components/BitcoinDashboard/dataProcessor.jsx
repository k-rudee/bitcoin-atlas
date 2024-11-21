import Papa from 'papaparse';
import _ from 'lodash';

export const loadEntityData = async () => {
  try {
    const response = await window.fs.readFile('entity_mapping.csv', { encoding: 'utf8' });
    
    const result = Papa.parse(response, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', '|', ';']
    });

    const processedData = result.data.map(entity => ({
      ...entity,
      totalVolume: (entity.TOTAL_BTC_RECEIVED || 0) + (entity.TOTAL_BTC_SPENT || 0),
      transactionCount: (entity.TOTAL_RECIEVE_TRANSACTIONS || 0) + (entity.TOTAL_SPEND_TRANSACTIONS || 0),
      addressCount: (entity.TOTAL_RECIEVE_ADDRESSES || 0) + (entity.TOTAL_SPEND_ADDRESSES || 0)
    }));

    const statistics = {
      totalEntities: processedData.length,
      totalVolume: processedData.reduce((sum, entity) => sum + entity.totalVolume, 0),
      averageTransactions: processedData.reduce((sum, entity) => sum + entity.transactionCount, 0) / processedData.length,
      medianTransactions: calculateMedian(processedData.map(entity => entity.transactionCount)),
      volumeDistribution: calculateDistribution(processedData.map(entity => entity.totalVolume))
    };

    return { entities: processedData, statistics };
  } catch (error) {
    console.error('Error loading entity data:', error);
    throw error;
  }
};

const calculateMedian = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const calculateDistribution = (values) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = 20;
  const binSize = (max - min) / binCount;

  const bins = Array(binCount).fill(0);
  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    bins[binIndex]++;
  });

  return bins.map((count, i) => ({
    range: (min + (i * binSize)).toFixed(8),
    count: count
  }));
};