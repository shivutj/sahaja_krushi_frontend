import './App.css';
import { HashRouter } from 'react-router-dom';
import Router from './routes/Router';

function App() {
  return (
    <HashRouter>
      <Router />
    </HashRouter>
  );
}

export default App;
