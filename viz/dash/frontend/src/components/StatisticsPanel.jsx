import React, { useMemo } from 'react';
import _ from 'lodash';
import { 
  Scale, 
  Wallet,
  Activity,
  Zap,
  Network,
  ArrowUpDown,
  ArrowLeftRight,
  Clock,
  LineChart
} from 'lucide-react';


const formatNumber = (num, options = {}) => {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  });
  return formatter.format(num);
};

const StatCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="stat-card">
    <div className="icon-container">
      <Icon size={18} /> 
    </div>
    <div className="stat-info">
      <h3 className="stat-title">{title}</h3>
      <p className="stat-value">{value}</p>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
  </div>
);

const StatisticsPanel = ({ data }) => {
  const stats = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;

    return {
      totalVolume: _.sumBy(data, d => parseFloat(d.TOTAL_VOLUME) || 0),
      avgTxSize: _.meanBy(data, d => parseFloat(d.AVG_TRANSACTION_SIZE) || 0),
      totalTx: _.sumBy(data, d => parseInt(d.NUM_TRANSACTIONS) || 0),
      peakTxRate: _.maxBy(data, d => parseFloat(d.PEAK_TX_RATE) || 0)?.PEAK_TX_RATE || 0,
      avgInDegree: _.meanBy(data, d => parseInt(d.IN_DEGREE) || 0),
      avgOutDegree: _.meanBy(data, d => parseInt(d.OUT_DEGREE) || 0),
      avgChainDepth: _.meanBy(data, d => parseInt(d.CHAIN_DEPTH) || 0),
      largeTxRatio: _.meanBy(data, d => parseFloat(d.LARGE_TX_RATIO) || 0),
      microTxRatio: _.meanBy(data, d => parseFloat(d.MICRO_TX_RATIO) || 0),
      businessHoursTx: _.meanBy(data, d => parseFloat(d.BUSINESS_HOURS_TXS) || 0),
      maxTxSize: _.maxBy(data, d => parseFloat(d.MAX_TRANSACTION_SIZE) || 0)?.MAX_TRANSACTION_SIZE || 0,
      avgTxRate: _.meanBy(data, d => parseFloat(d.AVG_TX_RATE) || 0)
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="statistics-panel">
      <div className="stat-cards-container">
        {/* Primary Stats */}
        <StatCard
          title="Total Volume"
          value={`₿${formatNumber(stats.totalVolume)}`}
          subtitle="Total transaction volume"
          icon={Scale}
        />
        <StatCard
          title="Avg Transaction"
          value={`₿${formatNumber(stats.avgTxSize, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`}
          subtitle="Mean transaction value"
          icon={Wallet}
        />
        <StatCard
          title="Tx Count"
          value={formatNumber(stats.totalTx)}
          subtitle="Number of transactions"
          icon={Activity}
        />
        <StatCard
          title="Peak Tx Rate"
          value={`${formatNumber(stats.peakTxRate)}/hr`}
          subtitle="Highest transactions per hour"
          icon={Zap}
        />

        {/* Network Stats */}
        <StatCard
          title="Net Connectivity"
          value={`${formatNumber(stats.avgInDegree, { maximumFractionDigits: 1 })} / ${formatNumber(stats.avgOutDegree, { maximumFractionDigits: 1 })}`}
          subtitle="Avg In/Out Degree"
          icon={Network}
        />
        <StatCard
          title="Chain Depth"
          value={formatNumber(stats.avgChainDepth, { maximumFractionDigits: 1 })}
          subtitle="Average chain depth"
          icon={ArrowUpDown}
        />

        {/* Transaction Patterns */}
        <StatCard
          title="Tx Mix"
          value={`${(stats.largeTxRatio * 100).toFixed(1)}% / ${(stats.microTxRatio * 100).toFixed(1)}%`}
          subtitle="Large/Micro Tx Ratio"
          icon={ArrowLeftRight}
        />
      </div>

      {/* Activity Overview */}
      <div className="activity-overview">
        <div className="activity-header">
          <LineChart size={18} className="activity-icon" /> {/* Reduced icon size */}
          <h3 className="activity-title">Activity Overview</h3>
        </div>
        <div className="activity-stats">
          <div className="activity-item">
            <span className="activity-label">Avg Tx Rate</span>
            <span className="activity-value">{formatNumber(stats.avgTxRate, { maximumFractionDigits: 2 })} tx/hr</span>
          </div>
          <div className="activity-item">
            <span className="activity-label">Max Tx Size</span>
            <span className="activity-value">₿{formatNumber(stats.maxTxSize, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
          </div>
        </div>
      </div>

      {/* Styles for the component */}
      <style jsx>{`
        .statistics-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem; /* Reduced gap for tighter spacing */
        }

        .stat-cards-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); /* Reduced min width */
          gap: 1rem; /* Reduced gap between cards */
        }

        .stat-card {
          background: rgba(13, 17, 22, 0.4);
          backdrop-filter: blur(8px); /* Slightly reduced blur for a more compact look */
          padding: 1rem; /* Reduced padding */
          border-radius: 1.25rem; /* Slightly smaller border radius */
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          transition: border 0.3s ease;
        }

        .stat-card:hover {
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .icon-container {
          background: rgba(255, 153, 0, 0.1);
          padding: 0.35rem; /* Reduced padding */
          border-radius: 0.75rem; /* Reduced border radius */
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem; /* Reduced margin */
        }

        .stat-info {
          flex: 1;
        }

        .stat-title {
          font-size: 0.75rem; /* Reduced font size */
          color: #a0aec0;
          margin: 0;
          margin-bottom: 0.25rem; /* Reduced margin */
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.25rem; /* Reduced font size */
          color: #fff;
          margin: 0;
          font-weight: 600;
        }

        .stat-subtitle {
          font-size: 0.65rem; /* Reduced font size */
          color: #a0aec0;
          margin: 0;
          margin-top: 0.2rem; /* Reduced margin */
        }

        .activity-overview {
          background: rgba(13, 17, 22, 0.4);
          backdrop-filter: blur(8px); /* Slightly reduced blur */
          padding: 1rem; /* Reduced padding */
          border-radius: 1.25rem; /* Slightly smaller border radius */
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .activity-header {
          display: flex;
          align-items: center;
          gap: 0.4rem; /* Reduced gap */
          margin-bottom: 0.75rem; /* Reduced margin */
        }

        .activity-icon {
          color: #f7931a;
        }

        .activity-title {
          font-size: 1.1rem; /* Slightly reduced font size */
          color: #fff;
          margin: 0;
          font-weight: 600;
        }

        .activity-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem; /* Reduced gap */
        }

        .activity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem; /* Reduced padding */
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem; /* Reduced border radius */
          gap: .85rem;
        }

        .activity-label {
          font-size: 0.75rem; /* Reduced font size */
          color: #a0aec0;
        }

        .activity-value {
          font-size: 0.95rem; /* Reduced font size */
          color: #fff;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .stat-cards-container {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); /* Further reduced min width on smaller screens */
          }

          .stat-card {
            padding: 0.75rem; /* Further reduced padding */
          }

          .stat-title {
            font-size: 0.7rem; /* Further reduced font size */
          }

          .stat-value {
            font-size: 1.1rem; /* Further reduced font size */
          }

          .stat-subtitle {
            font-size: 0.6rem; /* Further reduced font size */
          }

          .activity-title {
            font-size: 1rem; /* Further reduced font size */
          }

          .activity-value {
            font-size: 0.85rem; /* Further reduced font size */
          }
        }
      `}</style>
    </div>
  );
};

export default StatisticsPanel;

