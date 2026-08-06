import React from 'react';
import { Settings as SettingsIcon, User, Building2, Shield, Bell, Save } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Account Configuration"
        subtitle="Manage your profile, farm details, security credentials, and application preferences."
        badge={<Badge variant="primary">Account Active</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="relaxed" className="lg:col-span-2 border-border/80 space-y-6">
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

        <Card padding="relaxed" className="border-border/80 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">System Security</h3>
              <p className="text-xs text-text-secondary">Authentication state</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-text-secondary">
            <div className="p-3 rounded-lg bg-background border border-border space-y-1">
              <span className="font-semibold text-text-primary block">Authentication Method</span>
              <p>JWT Token stored securely in browser state</p>
            </div>

            <div className="p-3 rounded-lg bg-background border border-border space-y-1">
              <span className="font-semibold text-text-primary block">API Connection</span>
              <p className="text-emerald-600 font-medium">Connected to Backend Server</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
