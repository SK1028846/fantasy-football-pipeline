import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { evaluateTrade } from '../services/api';
import './TradeEvaluator.css';

function TradeEvaluator() {
  const [sideA, setSideA] = useState(['']);
  const [sideB, setSideB] = useState(['']);
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getAccessTokenSilently, logout: auth0Logout } = useAuth0();
  const navigate = useNavigate();

  const addPlayer = (side, setSide) => {
    setSide([...side, '']);
  };

  const removePlayer = (side, setSide, index) => {
    if (side.length > 1) {
      setSide(side.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (side, setSide, index, value) => {
    const newSide = [...side];
    newSide[index] = value;
    setSide(newSide);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGrade(null);
    setLoading(true);

    // Filter out empty players
    const sideAPlayers = sideA.filter(player => player.trim() !== '');
    const sideBPlayers = sideB.filter(player => player.trim() !== '');

    if (sideAPlayers.length === 0 || sideBPlayers.length === 0) {
      setError('Please add at least one player to each side of the trade.');
      setLoading(false);
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const result = await evaluateTrade(sideAPlayers, sideBPlayers, token);
      // Backend returns { grade: "..." } or just the grade string
      setGrade(result.grade || result);
    } catch (err) {
      console.error('Trade evaluation error:', err);
      setError(err.message || 'Failed to evaluate trade. Please try again.');
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
    <div className="trade-container">
      <div className="trade-header">
        <h1>Fantasy Trade Evaluator</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/previoustrades')} className="nav-button">
            Previous Trades
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="trade-form">
        <div className="trade-sides">
          <div className="trade-side">
            <h2>Side A</h2>
            {sideA.map((player, index) => (
              <div key={index} className="player-input-group">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => updatePlayer(sideA, setSideA, index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className="player-input"
                />
                {sideA.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(sideA, setSideA, index)}
                    className="remove-button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addPlayer(sideA, setSideA)}
              className="add-button"
            >
              + Add Player
            </button>
          </div>

          <div className="trade-divider">
            <span>VS</span>
          </div>

          <div className="trade-side">
            <h2>Side B</h2>
            {sideB.map((player, index) => (
              <div key={index} className="player-input-group">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => updatePlayer(sideB, setSideB, index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className="player-input"
                />
                {sideB.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(sideB, setSideB, index)}
                    className="remove-button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addPlayer(sideB, setSideB)}
              className="add-button"
            >
              + Add Player
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {grade && (
          <div className="grade-result">
            <h3>Trade Grade</h3>
            <div className="grade-value">{grade}</div>
          </div>
        )}

        <button type="submit" disabled={loading} className="evaluate-button">
          {loading ? 'Evaluating...' : 'Evaluate Trade'}
        </button>
      </form>
    </div>
  );
}

export default TradeEvaluator;

