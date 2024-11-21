import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import StatAnalysisChart from "./components/StatAnalysisChart";
import StatisticsPanel from "./components/StatisticsPanel";
import Clustering3D from "./components/Clustering3D";  // Add this import

const App = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('network');

  useEffect(() => {
    let isSubscribed = true;

    const loadData = () => {
      setLoading(true);
      Papa.parse("/data/entity2.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (isSubscribed) {
            const validData = result.data
              .filter(row => 
                row.ENTITY_ID && 
                row.AVG_TRANSACTION_SIZE !== undefined &&
                row.NUM_TRANSACTIONS !== undefined
              )
              .slice(0, 1000);
            
            setCsvData(validData);
            setLoading(false);
          }
        },
        error: (error) => {
          if (isSubscribed) {
            console.error("Error loading CSV:", error);
            setError("Failed to load data. Please try again later.");
            setLoading(false);
          }
        },
      });
    };

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`tab-button ${activeTab === id ? 'active' : ''}`}
    >
      <span className="icon">{icon}</span>
      {label}
    </button>
  );

  const renderContent = () => {
    if (activeTab === 'network') {
      if (loading) {
        return (
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="bitcoin-spinner">₿</div>
            </div>
            <p className="loading-text">Loading blockchain data...</p>
          </div>
        );
      }

      if (error) {
        return (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        );
      }

      if (!csvData.length) {
        return <div className="error-state">No data available</div>;
      }

      return (
        <div className="dashboard-layout">
          <div className="charts-section">
            <StatAnalysisChart data={csvData} type={activeTab} />
          </div>
          <div className="stats-section">
            <StatisticsPanel data={csvData} />
          </div>
        </div>
      );
    }

    if (activeTab === 'clustering') {
      return (
        <div className="clustering-content">
          <Clustering3D />
        </div>
      );
    }

    return null;
  };

  const theme = {
    bitcoin: '#f7931a',
    bitcoinHover: '#f7a543',
    primary: '#0d1116',
    secondary: '#1c2026',
    accent: '#4a90e2',
    text: '#ffffff',
    textSecondary: '#8a919e',
    gold: '#ffd700'
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="bitcoin-logo">₿</div>
            <h1>Bitcoin Node Analysis</h1>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="tabs-container">
          <TabButton id="network" label="Network Stats" icon="📊" />
          <TabButton id="clustering" label="Clustering Results" icon="🔍" />
        </div>
        
        <div className="content-container">
          {renderContent()}
        </div>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
          background: linear-gradient(145deg, #0d1116 0%, #1c2026 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          margin: 0;
          padding: 0;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Component-specific Styles */}
      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: linear-gradient(145deg, ${theme.primary} 0%, ${theme.secondary} 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
          color: ${theme.text};
        }

        .app-header {
          background: rgba(13, 17, 22, 0.8);
          backdrop-filter: blur(10px);
          padding: 1.5rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          max-width: 1800px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bitcoin-logo {
          font-size: 3rem;
          color: ${theme.bitcoin};
          animation: pulse 2s ease-in-out infinite;
        }

        h1 {
          font-size: 3rem;
          font-weight: 600;
          margin: 0;
          color: ${theme.bitcoin};
          letter-spacing: -0.02em;
        }

        .main-content {
          max-width: 1800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .tabs-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .tab-button {
          flex: 1;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: ${theme.textSecondary};
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.05);
          color: ${theme.bitcoin};
        }

        .tab-button.active {
          background: rgba(247, 147, 26, 0.15);
          color: ${theme.bitcoin};
        }

        .content-container {
          margin-top: 2rem;
          min-height: 600px;
          padding: 1rem;
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns: 3fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .charts-section, .stats-section {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: ${theme.secondary};
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .charts-section {
          min-height: 600px;
        }

        .stats-section {
          position: sticky;
          top: 120px;
          min-height: 600px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          color: ${theme.textSecondary};
        }

        .loading-spinner {
          width: 80px;
          height: 80px;
          margin-bottom: 1rem;
          position: relative;
        }

        .bitcoin-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 3rem;
          color: ${theme.bitcoin};
          animation: pulse 1.5s ease-in-out infinite;
        }

        .error-state {
          text-align: center;
          padding: 2rem;
          color: ${theme.textSecondary};
        }

        .retry-button {
          background: ${theme.bitcoin};
          color: ${theme.primary};
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 1rem;
        }

        .retry-button:hover {
          background: ${theme.bitcoinHover};
          transform: translateY(-1px);
        }

        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.8; transform: scale(0.95); }
        }

        .clustering-content {
          background: ${theme.secondary};
          border-radius: 12px;
          color: ${theme.text};
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          height: calc(100vh - 250px);  /* Adjust height for visualization */
          overflow: hidden;
          position: relative;
        }

        @media (max-width: 1200px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }

          .stats-section {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 1rem;
          }

          h1 {
            font-size: 2rem;
          }

          .main-content {
            padding: 1rem;
          }

          .tabs-container {
            flex-direction: column;
          }

          .charts-section, .stats-section {
            min-height: 400px;
          }

          .clustering-content {
            height: calc(100vh - 200px);
          }
        }
      `}</style>
    </div>
  );
};

export default App;
