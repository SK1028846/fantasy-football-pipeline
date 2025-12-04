import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Callback from './components/Callback';
import TradeEvaluator from './components/TradeEvaluator';
import PreviousTrades from './components/PreviousTrades';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/trade"
          element={
            <ProtectedRoute>
              <TradeEvaluator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/previoustrades"
          element={
            <ProtectedRoute>
              <PreviousTrades />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/trade" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


