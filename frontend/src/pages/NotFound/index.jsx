import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { authService } from '../../services/authService';

/**
 * Reusable 404 Error Page.
 * Displays 404 Page Not Found error with context-aware return button.
 */
export default function NotFound() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleReturn = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10">
        <Card padding="relaxed" className="shadow-lg border-border/80 bg-surface">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-4xl font-extrabold text-primary tracking-tight">404</span>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                Page Not Found
              </h1>
              <p className="text-xs text-text-secondary max-w-xs mx-auto mt-2">
                The page you are looking for does not exist, has been removed, or is temporarily unavailable.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleReturn}
              icon={isAuthenticated ? <Home className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              className="mt-4 font-semibold shadow-sm"
            >
              {isAuthenticated ? 'Back to Dashboard' : 'Back to Login'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
