import React from 'react';
import { User } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Account Configuration"
        subtitle="Manage your profile and farm details."
        badge={<Badge variant="primary">Account Active</Badge>}
      />

      <Card padding="relaxed" className="w-full border-border/80 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Personal & Farm Info</h3>
            <p className="text-xs text-text-secondary">Update owner name and mobile details</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={user?.fullName || user?.name || ''}
              readOnly
            />
            <Input
              label="Mobile Number"
              value={user?.mobile || ''}
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Farm Name"
              value={user?.farmName || 'My Prawn Farm'}
              readOnly
            />
            <Input
              label="Account Role"
              value="Farm Owner / Administrator"
              readOnly
            />
          </div>
        </form>
      </Card>
    </div>
  );
}

