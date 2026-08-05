import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { TankProvider } from './context/TankContext';

export default function App() {
  return (
    <BrowserRouter>
      <TankProvider>
        <AppRoutes />
      </TankProvider>
    </BrowserRouter>
  );
}
