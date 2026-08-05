import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { TankProvider } from './context/TankContext';
import { CropProvider } from './context/CropContext';
import { FeedProvider } from './context/FeedContext';
import { WaterQualityProvider } from './context/WaterQualityContext';
import { MedicineProvider } from './context/MedicineContext';
import { ExpenseProvider } from './context/ExpenseContext';

export default function App() {
  return (
    <BrowserRouter>
      <TankProvider>
        <CropProvider>
          <FeedProvider>
            <WaterQualityProvider>
              <MedicineProvider>
                <ExpenseProvider>
                  <AppRoutes />
                </ExpenseProvider>
              </MedicineProvider>
            </WaterQualityProvider>
          </FeedProvider>
        </CropProvider>
      </TankProvider>
    </BrowserRouter>
  );
}
