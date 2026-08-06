import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { TankProvider } from './context/TankContext';
import { CropProvider } from './context/CropContext';
import { FeedProvider } from './context/FeedContext';
import { MedicineProvider } from './context/MedicineContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { HarvestProvider } from './context/HarvestContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TankProvider>
          <CropProvider>
            <FeedProvider>
              <MedicineProvider>
                <ExpenseProvider>
                  <HarvestProvider>
                    <AppRoutes />
                  </HarvestProvider>
                </ExpenseProvider>
              </MedicineProvider>
            </FeedProvider>
          </CropProvider>
        </TankProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
