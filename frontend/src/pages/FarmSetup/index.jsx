import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Droplets,
  ClipboardList,
  ShieldAlert
} from 'lucide-react';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { Badge } from '../../components/Badge';

import farmService from '../../services/farmService';

// Zod Validation Schema for required frontend inputs
const farmSetupSchema = z.object({
  farmName: z.string().min(1, 'Farm name is required').trim(),
  ownerName: z.string().min(1, 'Owner name is required').trim(),
});

export default function FarmSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [existingFarmId, setExistingFarmId] = useState(null);
  const [existingFarmData, setExistingFarmData] = useState(null);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(farmSetupSchema),
    defaultValues: {
      farmName: '',
      ownerName: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    async function loadFarmDetails() {
      try {
        const res = await farmService.getFarm();
        const farm = res.data || res;
        if (farm && farm.id) {
          setExistingFarmId(farm.id);
          setExistingFarmData(farm);
          reset({
            farmName: farm.farmName || '',
            ownerName: farm.ownerName || '',
          });
          setIsCompleted(true);
        }
      } catch (err) {
        // Farm not found yet, normal for initial setup
      }
    }
    loadFarmDetails();
  }, [reset]);

  const handleNext = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const isStepValid = await trigger(['farmName', 'ownerName']);

    if (isStepValid) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data) => {
    if (currentStep < 2) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    // Payload with internal fallback defaults for legacy backend schema fields
    const farmPayload = {
      farmName: data.farmName.trim(),
      ownerName: data.ownerName.trim(),
      location: existingFarmData?.location || 'Farm Location',
      district: existingFarmData?.district || 'District',
      state: existingFarmData?.state || 'State',
      totalAcres: existingFarmData?.totalAcres ? parseFloat(existingFarmData.totalAcres) : 10,
    };

    try {
      if (existingFarmId) {
        const updatedRes = await farmService.updateFarm(existingFarmId, farmPayload);
        setExistingFarmData(updatedRes.data || updatedRes || farmPayload);
      } else {
        const createdRes = await farmService.createFarm(farmPayload);
        const created = createdRes.data || createdRes;
        setExistingFarmId(created?.id || 'new-farm');
        setExistingFarmData(created || farmPayload);
      }
      setIsSubmitting(false);
      setIsCompleted(true);
      // NO AUTOMATIC REDIRECT TO /dashboard
    } catch (err) {
      setIsSubmitting(false);
      setApiError(err.message || 'Failed to save farm details.');
    }
  };

  const steps = [
    { number: 1, title: 'Farm Details', icon: Building2 },
    { number: 2, title: 'Review & Register', icon: ClipboardList },
  ];

  const currentFarmName = getValues('farmName') || existingFarmData?.farmName || 'SAI AQUA';
  const currentOwnerName = getValues('ownerName') || existingFarmData?.ownerName || 'Sai';

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-surface border-b border-border py-4 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-xs">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-primary tracking-tight leading-none block">
              AquaTrack
            </span>
            <span className="text-[10px] text-text-secondary font-medium tracking-wider uppercase">
              Onboarding Setup
            </span>
          </div>
        </div>

        {isCompleted ? (
          <Badge variant="success" size="sm" className="hidden sm:inline-flex font-semibold">
            Registered
          </Badge>
        ) : (
          <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
            Step {currentStep} of 2
          </Badge>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        <PageHeader
          title="Farm Onboarding"
          subtitle="Configure your farm profile to initialize tracking metrics."
        />

        {/* Stepper Progress Bar (Shown ONLY during setup flow) */}
        {!isCompleted && (
          <div className="mb-10">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 relative">
              {steps.map((step) => {
                const Icon = step.icon;
                const isCurrent = currentStep === step.number;
                const isDone = currentStep > step.number;

                return (
                  <div
                    key={step.number}
                    className={`
                      flex flex-col items-center text-center p-3.5 rounded-xl border transition-all duration-200
                      ${isCurrent
                        ? 'bg-surface border-primary shadow-sm ring-2 ring-primary/20'
                        : isDone
                          ? 'bg-primary-light/40 border-primary/30 text-primary'
                          : 'bg-surface/50 border-border opacity-70'
                      }
                    `}
                  >
                    <div
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mb-2 transition-colors
                        ${isDone
                          ? 'bg-primary text-white'
                          : isCurrent
                            ? 'bg-primary text-white'
                            : 'bg-background text-text-secondary border border-border'
                        }
                      `}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                    </div>

                    <span className={`text-[11px] sm:text-xs font-semibold leading-tight ${isCurrent ? 'text-primary' : 'text-text-primary'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Wizard Form Card */}
        <Card padding="relaxed" className="shadow-lg border-border/80 bg-surface relative">
          {isCompleted ? (
            <div className="py-8 px-2 sm:px-6 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-200">
              {/* Header / Status */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-primary flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-9 h-9 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                  Farm Registered Successfully
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary max-w-md">
                  Your farm <strong className="text-text-primary">{currentFarmName}</strong> has been registered successfully.
                </p>
              </div>

              {/* Summary Card */}
              <div className="w-full max-w-md bg-background border border-border rounded-xl p-5 shadow-2xs text-left space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary" /> Farm Summary
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    ● Registered
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="bg-surface p-3 rounded-lg border border-border/50">
                    <span className="text-[10px] text-text-secondary uppercase font-semibold block">Farm Name</span>
                    <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                      {currentFarmName}
                    </span>
                  </div>

                  <div className="bg-surface p-3 rounded-lg border border-border/50">
                    <span className="text-[10px] text-text-secondary uppercase font-semibold block">Farm Owner</span>
                    <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                      {currentOwnerName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Single Primary Action */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/dashboard')}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  className="font-semibold px-8 py-2.5 text-sm"
                >
                  Go to Dashboard →
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {apiError && (
                <div className="mb-4 p-3 bg-danger-light text-danger rounded-lg text-xs font-medium border border-danger/20 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* STEP 1: FARM DETAILS */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" /> Step 1: Farm Details
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Enter general details of your prawn farm.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Farm Name"
                      placeholder="e.g. SAI AQUA"
                      required
                      error={errors.farmName?.message}
                      {...register('farmName')}
                    />

                    <Input
                      label="Owner Name"
                      placeholder="e.g. Sai"
                      required
                      error={errors.ownerName?.message}
                      {...register('ownerName')}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: REVIEW & REGISTER */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" /> Step 2: Review & Register
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Review farm details before registering.
                    </p>
                  </div>

                  <div className="bg-background border border-border rounded-xl p-5 shadow-2xs">
                    <div className="mb-3 border-b border-border/60 pb-2">
                      <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" /> Review Farm Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-text-secondary block">Farm Name</span>
                        <span className="font-semibold text-text-primary text-sm">{getValues('farmName')}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary block">Farm Owner</span>
                        <span className="font-semibold text-text-primary text-sm">{getValues('ownerName')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Bottom Buttons */}
              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                ) : <div />}

                {currentStep < 2 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Continue →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    iconPosition="right"
                    className="bg-success hover:bg-green-600 focus:ring-success/40 font-semibold"
                  >
                    Register Farm ✓
                  </Button>
                )}
              </div>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}
