import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { TankProvider } from './context/TankContext';
import { CropProvider } from './context/CropContext';
import { FeedProvider } from './context/FeedContext';
import { WaterQualityProvider } from './context/WaterQualityContext';

export default function App() {
  return (
    <BrowserRouter>
      <TankProvider>
        <CropProvider>
          <FeedProvider>
            <WaterQualityProvider>
              <AppRoutes />
            </WaterQualityProvider>
          </FeedProvider>
        </CropProvider>
      </TankProvider>
    </BrowserRouter>
  );
}
