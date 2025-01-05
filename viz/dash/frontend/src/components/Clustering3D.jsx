import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

// Tooltip component for points
function PointLabel({ text, position }) {
  return (
    <Text
      position={[position[0], position[1] + 0.5, position[2]]}
      fontSize={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

function Points({ data, highlightedId, hoveredPoint, onPointHover }) {
  const pointsRef = useRef();
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (pointsRef.current && data.length > 0) {
      const positions = new Float32Array(data.length * 3);
      const colors = new Float32Array(data.length * 3);
      
      // Find min/max for scaling
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      
      data.forEach(point => {
        minX = Math.min(minX, point.pc1);
        maxX = Math.max(maxX, point.pc1);
        minY = Math.min(minY, point.pc2);
        maxY = Math.max(maxY, point.pc2);
        minZ = Math.min(minZ, point.pc3);
        maxZ = Math.max(maxZ, point.pc3);
      });

      const scale = 20;
      const xRange = maxX - minX;
      const yRange = maxY - minY;
      const zRange = maxZ - minZ;
      
      const positionArray = [];
      
      data.forEach((point, i) => {
        const isHighlighted = point.entity_id === highlightedId;
        
        const x = ((point.pc1 - minX) / xRange - 0.5) * scale;
        const y = ((point.pc2 - minY) / yRange - 0.5) * scale;
        const z = ((point.pc3 - minZ) / zRange - 0.5) * scale;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        positionArray.push([x, y, z]);

        if (isHighlighted) {
          
          colors[i * 3] = 1;     
          colors[i * 3 + 1] = 1; 
          colors[i * 3 + 2] = 1; 
        } else {
          
          colors[i * 3] = .65;       
          colors[i * 3 + 1] = 0.35;   
          colors[i * 3 + 2] = 0.05;   
        
        }
      });

      setPositions(positionArray);
      
      pointsRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
      pointsRef.current.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
      );
    }
  }, [data, highlightedId]);

  const handlePointerMove = (event) => {
    if (event.intersections.length > 0) {
      const index = event.intersections[0].index;
      onPointHover(data[index]);
    } else {
      onPointHover(null);
    }
  };

  return (
    <>
      <points 
        ref={pointsRef}
        onPointerMove={handlePointerMove}
        onPointerOut={() => onPointHover(null)}
      >
        <bufferGeometry>
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={data.length}
            array={new Float32Array(data.length * 3)}
            itemSize={3}
          />
          <bufferAttribute
            attachObject={['attributes', 'color']}
            count={data.length}
            array={new Float32Array(data.length * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          vertexColors={true}
          sizeAttenuation={true}
        />
      </points>
      {hoveredPoint && positions[data.indexOf(hoveredPoint)] && (
        <PointLabel 
          text={`ID: ${hoveredPoint.entity_id}`}
          position={positions[data.indexOf(hoveredPoint)]}
        />
      )}
    </>
  );
}

const Clustering3D = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);
  const [sampleSize, setSampleSize] = useState(1000);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);



  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/cluster-data?sample_size=${sampleSize}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchEntity = async () => {
    if (!searchId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/entity/${searchId}`);
      if (!response.ok) throw new Error('Entity not found');
      const entityData = await response.json();
      
      if (!data.find(d => d.entity_id === entityData.entity_id)) {
        setData(prev => [...prev, entityData]);
      }
      
      setHighlightedId(parseInt(searchId));
      setSelectedPoint(entityData);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sampleSize]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner">
          <div className="bitcoin-spinner">₿</div>
        </div>
        <p className="loading-text">Loading cluster data...</p>
        <style jsx>{`
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: white;
            background: rgba(13, 17, 22, 0.95);
          }

          .bitcoin-spinner {
            font-size: 2rem;
            animation: spin 2s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-text {
            margin-top: 10px;
            font-size: 1.2rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="clustering-container">
      {/* Controls */}
      <div className="controls-panel">
        <h3>Visualization Controls</h3>
        
        <div className="control-section">
          <label>Search Entity ID</label>
          <div className="control-group">
            <input
              type="text"
              placeholder="Enter Entity ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="control-input"
            />
            <button onClick={searchEntity} className="control-button">
              Search
            </button>
          </div>
        </div>

        <div className="control-section">
          <label>Sample Size</label>
          <div className="control-group">
            <input
              type="number"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="control-input"
              min={100}
              max={25000}
            />
            <button onClick={fetchData} className="control-button">
              Refresh
            </button>
          </div>
          <small>Adjust the number of data points to visualize.</small>
        </div>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
      </div>

      {/* Legend */}
      <div className="legend">
        <h3>Visualization Guide</h3>
        <div className="legend-content">
          <p><strong>Navigation:</strong></p>
          <ul>
            <li>Drag to rotate view</li>
            <li>Scroll to zoom in/out</li>
            <li>Right-click drag to pan</li>
          </ul>
        </div>
      </div>

      {/* Enhanced Entity Details */}
      {selectedPoint && (
        <div className="entity-details">
          <h3>Entity Details</h3>
          <div className="details-content">
            <p><strong>ID:</strong> {selectedPoint.entity_id}</p>
            <p><strong>Received:</strong> {selectedPoint.total_btc_received?.toFixed(8)} BTC</p>
            <p><strong>Spent:</strong> {selectedPoint.total_btc_spent?.toFixed(8)} BTC</p>
            <p><strong>Total Transactions:</strong> {
              (selectedPoint.total_receive_transactions || 0) + 
              (selectedPoint.total_spend_transactions || 0)
            }</p>
            <p><strong>Dominant Cluster:</strong> {selectedPoint.cluster}</p>
            <p><strong>Cluster Probability:</strong> {
              selectedPoint[`cluster_${selectedPoint.cluster}`]?.toFixed(4)
            }</p>
          </div>
        </div>
      )}

      {/* 3D Visualization */}
      <div className="visualization-container">
        <Canvas>
          <PerspectiveCamera makeDefault position={[10, 10, 10]} />
          <OrbitControls enableDamping dampingFactor={0.05} />
          <ambientLight intensity={0.5} />
          <Points 
            data={data} 
            highlightedId={highlightedId}
            hoveredPoint={hoveredPoint}
            onPointHover={setHoveredPoint}
          />
          <gridHelper args={[20, 20, '#666666', '#444444']} />

          {/* Custom Axes with Labels */}
          <group>
            {/* PCA1 - X Axis (Red) */}
            <Line
              points={[[-10, 0, 0], [10, 0, 0]]}
              color="red"
              lineWidth={2}
            />
            <Text
              position={[10.5, 0, 0]}
              fontSize={.4}
              color="red"
              anchorX="center"
              anchorY="middle"
            >
              PCA1
            </Text>

            {/* PCA2 - Y Axis (Green) */}
            <Line
              points={[ [0, -10, 0], [0, 10, 0] ]}
              color="green"
              lineWidth={2}
            />
            <Text
              position={[0, 10.5, 0]}
              fontSize={.4}
              color="green"
              anchorX="center"
              anchorY="middle"
            >
              PCA2
            </Text>

            {/* PCA3 - Z Axis (Blue) */}
            <Line
              points={[ [0, 0, -10], [0, 0, 10] ]}
              color="blue"
              lineWidth={2}
            />
            <Text
              position={[0, 0, 10.5]}
              fontSize={.4}
              color="blue"
              anchorX="center"
              anchorY="middle"
            >
              PCA3
            </Text>
          </group>
        </Canvas>
      </div>

      <style jsx>{`
        .clustering-container {
          height: calc(100vh - 200px);
          position: relative;
          background: rgba(13, 17, 22, 0.95);
          border-radius: 12px;
          overflow: hidden;
        }

        .controls-panel, .legend, .entity-details {
          position: absolute;
          background: rgba(13, 17, 22, 0.95);
          padding: 20px;
          border-radius: 12px;
          color: white;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(247, 147, 26, 0.2);
          max-height: 80vh;
          overflow-y: auto;
        }

        .controls-panel {
          top: 20px;
          left: 20px;
          z-index: 10;
        }

        .legend {
          top: 20px;
          right: 20px;
          width: 250px;
        }

        .entity-details {
          bottom: 20px;
          left: 20px;
          width: 250px;
        }

        .control-section {
          margin-bottom: 20px;
        }

        label {
          display: block;
          color: #f7931a;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .control-group {
          display: flex;
          gap: 10px;
          margin-bottom: 4px;
        }

        .control-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          width: 150px;
        }

        .control-button {
          background: #f7931a;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .control-button:hover {
          background: #f7a543;
        }

        h3 {
          color: #f7931a;
          margin-top: 0;
          margin-bottom: 15px;
        }

        .legend-content ul {
          list-style: none;
          padding-left: 0;
          margin: 5px 0;
        }

        .legend-content li {
          margin: 5px 0;
          font-size: 0.9rem;
        }

        .legend-content p {
          margin: 10px 0 5px 0;
        }

        small {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
        }

        .error-message {
          color: #ff4444;
          font-size: 0.9rem;
          margin-top: 10px;
          padding: 8px;
          background: rgba(255, 68, 68, 0.1);
          border-radius: 4px;
        }

        .visualization-container {
          height: 100%;
          width: 100%;
        }

        .details-content {
          font-size: 0.9rem;
        }

        .details-content p {
          margin: 5px 0;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          color: white;
          background: rgba(13, 17, 22, 0.95);
        }
      `}</style>
    </div>
  );
};

export default Clustering3D;



