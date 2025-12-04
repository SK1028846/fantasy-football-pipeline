import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getPreviousTrades } from '../services/api';
import './PreviousTrades.css';

function PreviousTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { getAccessTokenSilently, logout: auth0Logout } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    loadTrades();
  }, [page]);

  const loadTrades = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getAccessTokenSilently();
      const result = await getPreviousTrades(page, 10, token);
      // Backend returns either an array of trades or an object with { trades: [...], hasMore: boolean }
      if (Array.isArray(result)) {
        setTrades(result);
        setHasMore(result.length === 10);
      } else if (result.trades) {
        setTrades(result.trades);
        setHasMore(result.hasMore !== false && result.trades.length === 10);
      } else {
        setTrades([]);
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load previous trades.');
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin + '/login',
      },
    });
  };

  return (
    <div className="trades-container">
      <div className="trades-header">
        <h1>Previous Trades</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/trade')} className="nav-button">
            New Trade
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="loading">Loading trades...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : trades.length === 0 ? (
        <div className="empty-state">
          <p>No previous trades found.</p>
          <button onClick={() => navigate('/trade')} className="nav-button">
            Evaluate Your First Trade
          </button>
        </div>
      ) : (
        <>
          <div className="trades-list">
            {trades.map((trade, index) => (
              <div key={trade.id || index} className="trade-card">
                <div className="trade-sides-display">
                  <div className="trade-side-display">
                    <h3>Side A</h3>
                    <ul>
                      {trade.sideA?.map((player, i) => (
                        <li key={i}>{player}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="trade-divider-small">VS</div>
                  <div className="trade-side-display">
                    <h3>Side B</h3>
                    <ul>
                      {trade.sideB?.map((player, i) => (
                        <li key={i}>{player}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {trade.grade && (
                  <div className="trade-grade">
                    <strong>Grade:</strong> {trade.grade}
                  </div>
                )}
                {trade.createdAt && (
                  <div className="trade-date">
                    {new Date(trade.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="page-button"
            >
              Previous
            </button>
            <span className="page-info">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore || loading}
              className="page-button"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PreviousTrades;

