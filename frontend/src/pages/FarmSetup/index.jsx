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
  Layers,
  ClipboardList,
  ShieldAlert
} from 'lucide-react';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { Badge } from '../../components/Badge';

import farmService from '../../services/farmService';

// Zod Validation Schema strictly matching backend contract (POST /api/farms)
const farmSetupSchema = z.object({
  farmName: z.string().min(1, 'Farm name is required').trim(),
  ownerName: z.string().min(1, 'Owner name is required').trim(),
  location: z.string().min(1, 'Farm location is required').trim(),
  district: z.string().min(1, 'District is required').trim(),
  state: z.string().min(1, 'State is required').trim(),
  totalAcres: z.coerce
    .number({ invalid_type_error: 'Total farm area must be a number' })
    .positive('Area must be greater than 0'),
});

export default function FarmSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [existingFarmId, setExistingFarmId] = useState(null);
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
      location: '',
      district: '',
      state: '',
      totalAcres: '',
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
          reset({
            farmName: farm.farmName || '',
            ownerName: farm.ownerName || '',
            location: farm.location || '',
            district: farm.district || '',
            state: farm.state || '',
            totalAcres: farm.totalAcres || '',
          });
        }
      } catch (err) {
        // Farm not found yet, normal for initial setup
      }
    }
    loadFarmDetails();
  }, [reset]);

  const handleNext = async () => {
    let fieldsToValidate = [];

    if (currentStep === 1) {
      fieldsToValidate = ['farmName', 'ownerName', 'location', 'district', 'state'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['totalAcres'];
    }

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setApiError('');

    const farmPayload = {
      farmName: data.farmName.trim(),
      ownerName: data.ownerName.trim(),
      location: data.location.trim(),
      district: data.district.trim(),
      state: data.state.trim(),
      totalAcres: parseFloat(data.totalAcres),
    };

    try {
      if (existingFarmId) {
        await farmService.updateFarm(existingFarmId, farmPayload);
      } else {
        await farmService.createFarm(farmPayload);
      }
      setIsSubmitting(false);
      setIsCompleted(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setIsSubmitting(false);
      setApiError(err.message || 'Failed to save farm details.');
    }
  };

  const steps = [
    { number: 1, title: 'Farm Details', icon: Building2 },
    { number: 2, title: 'Land Details', icon: Layers },
    { number: 3, title: 'Review & Submit', icon: ClipboardList },
  ];

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

        <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
          Step {currentStep} of 3
        </Badge>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <PageHeader
          title="Farm Onboarding Wizard"
          subtitle="Configure your farm profile to initialize tracking metrics."
        />

        {/* Stepper Progress Bar */}
        <div className="mb-10">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCurrent = currentStep === step.number;
              const isDone = currentStep > step.number;

              return (
                <div
                  key={step.number}
                  className={`
                    flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200
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

        {/* Wizard Form Card */}
        <Card padding="relaxed" className="shadow-lg border-border/80 bg-surface relative">
          {isCompleted ? (
            <div className="py-12 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-success-light text-success flex items-center justify-center animate-bounce-slow">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Farm Setup Complete!</h2>
              <p className="text-sm text-text-secondary max-w-md">
                Your farm profile has been saved to the database. Redirecting to your dashboard...
              </p>
              <Button variant="primary" size="md" onClick={() => navigate('/dashboard')} className="mt-2">
                Go to Dashboard
              </Button>
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
                      Enter general business and location details of your prawn farm.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Farm Name"
                      placeholder="e.g. BlueWave Aqua Farm"
                      required
                      error={errors.farmName?.message}
                      {...register('farmName')}
                    />

                    <Input
                      label="Owner Name"
                      placeholder="e.g. Rajesh Kumar"
                      required
                      error={errors.ownerName?.message}
                      {...register('ownerName')}
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Farm Location / Address"
                        placeholder="e.g. Survey No. 42, Coastal Road, Village X"
                        required
                        error={errors.location?.message}
                        {...register('location')}
                      />
                    </div>

                    <Input
                      label="District"
                      placeholder="e.g. Nellore"
                      required
                      error={errors.district?.message}
                      {...register('district')}
                    />

                    <Input
                      label="State"
                      placeholder="e.g. Andhra Pradesh"
                      required
                      error={errors.state?.message}
                      {...register('state')}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: LAND DETAILS */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" /> Step 2: Land Details
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Specify the total land footprint of your farm in acres.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      label="Total Farm Area (Acres)"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 12.5"
                      required
                      helperText="Specify total land area including embankments"
                      error={errors.totalAcres?.message}
                      {...register('totalAcres')}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & SUBMIT */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" /> Step 3: Review & Submit
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Verify your farm information before finalizing setup.
                    </p>
                  </div>

                  <div className="bg-background border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2">
                      <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" /> Farm & Owner Info
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-text-secondary block">Farm Name</span>
                        <span className="font-semibold text-text-primary">{getValues('farmName')}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary block">Owner Name</span>
                        <span className="font-semibold text-text-primary">{getValues('ownerName')}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary block">Location</span>
                        <span className="font-semibold text-text-primary">{getValues('location')}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary block">District</span>
                        <span className="font-semibold text-text-primary">{getValues('district')}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary block">State</span>
                        <span className="font-semibold text-text-primary">{getValues('state')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2">
                      <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" /> Land & Capacity
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-text-secondary block">Total Farm Area</span>
                        <span className="font-semibold text-text-primary">{getValues('totalAcres')} Acres</span>
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
                    Previous
                  </Button>
                ) : <div />}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    iconPosition="right"
                    className="bg-success hover:bg-green-600 focus:ring-success/40"
                  >
                    Finish Setup
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
