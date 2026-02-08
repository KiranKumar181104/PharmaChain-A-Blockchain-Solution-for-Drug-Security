import React, { useState, useEffect } from 'react';
import { getAuditStatistics, getAnomalies } from '../services/api';
import './AuditDashboard.css';

const AuditDashboard = () => {
  const [stats, setStats] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, anomaliesData] = await Promise.all([
        getAuditStatistics(),
        getAnomalies()
      ]);
      setStats(statsData);
      setAnomalies(anomaliesData);
    } catch (err) {
      setError('Failed to load audit data');
      console.error('Audit data error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading audit data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="audit-dashboard">
      <h3>System Audit Dashboard</h3>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <h3>{stats.totalDrugs}</h3>
            <p>Total Drugs</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <h3>{stats.totalUsers}</h3>
            <p>Registered Users</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <h3>{stats.totalTransfers}</h3>
            <p>Total Transfers</p>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⚠️</div>
            <h3>{stats.drugsWithAnomalies}</h3>
            <p>Drugs with Anomalies</p>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">⏰</div>
            <h3>{stats.expiredDrugs}</h3>
            <p>Expired Drugs</p>
          </div>
        </div>
      )}

      {anomalies && anomalies.length > 0 && (
        <div className="anomalies-table">
          <h3>Detected Anomalies</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Drug Name</th>
                  <th>Anomaly Type</th>
                  <th>Manufacturer</th>
                  <th>Transfers</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((item, index) => (
                  <tr key={index}>
                    <td><code>{item.batchId}</code></td>
                    <td>{item.drugName}</td>
                    <td><span className="anomaly-badge">{item.anomalyType}</span></td>
                    <td><code>{item.manufacturer.substring(0, 10)}...</code></td>
                    <td>{item.ownershipCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {anomalies && anomalies.length === 0 && (
        <div className="no-anomalies">
          <div className="no-anomalies-icon">✅</div>
          <h4>No Anomalies Detected</h4>
          <p>All drugs in the system are properly tracked and verified.</p>
        </div>
      )}
    </div>
  );
};

export default AuditDashboard;
