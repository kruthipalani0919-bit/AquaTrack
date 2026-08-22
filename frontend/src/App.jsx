import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { TankProvider } from './context/TankContext';
import { CropProvider } from './context/CropContext';
import { FeedProvider } from './context/FeedContext';
import { MedicineProvider } from './context/MedicineContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { HarvestProvider } from './context/HarvestContext';
import { StockingProvider } from './context/StockingContext';
import { PondLeaseProvider } from './context/PondLeaseContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteProvider>
          <TankProvider>
            <CropProvider>
              <FeedProvider>
                <MedicineProvider>
                  <ExpenseProvider>
                    <HarvestProvider>
                      <StockingProvider>
                        <PondLeaseProvider>
                          <AppRoutes />
                        </PondLeaseProvider>
                      </StockingProvider>
                    </HarvestProvider>
                  </ExpenseProvider>
                </MedicineProvider>
              </FeedProvider>
            </CropProvider>
          </TankProvider>
        </SiteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
