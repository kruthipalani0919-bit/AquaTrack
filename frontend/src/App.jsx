import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { TankProvider } from './context/TankContext';
import { CropProvider } from './context/CropContext';
import { FeedProvider } from './context/FeedContext';

export default function App() {
  return (
    <BrowserRouter>
      <TankProvider>
        <CropProvider>
          <FeedProvider>
            <AppRoutes />
          </FeedProvider>
        </CropProvider>
      </TankProvider>
    </BrowserRouter>
  );
}
