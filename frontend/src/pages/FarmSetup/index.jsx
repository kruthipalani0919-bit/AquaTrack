import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  MapPin,
  Container,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Droplets,
  Layers,
  Sparkles,
  ClipboardList,
  Plus,
  Trash2
} from 'lucide-react';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { Badge } from '../../components/Badge';

// 1. Zod Validation Schemas
const tankSchema = z.object({
  name: z.string().min(1, 'Tank name is required'),
  area: z.coerce.number({ invalid_type_error: 'Area must be a number' }).positive('Area must be greater than 0'),
  depth: z.coerce.number({ invalid_type_error: 'Depth must be a number' }).positive('Depth must be greater than 0'),
  waterSource: z.string().min(1, 'Please select a water source'),
  remarks: z.string().optional(),
});

const farmSetupSchema = z.object({
  // Step 1: Farm Details
  farmName: z.string().min(1, 'Farm name is required').trim(),
  ownerName: z.string().min(1, 'Owner name is required').trim(),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, 'Mobile number must contain exactly 10 digits'),
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  location: z.string().min(1, 'Farm location is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),

  // Step 2: Land Details
  totalArea: z.coerce.number({ invalid_type_error: 'Total farm area must be a number' }).positive('Area must be greater than 0'),
  numberOfTanks: z.coerce
    .number({ invalid_type_error: 'Number of tanks must be a number' })
    .min(1, 'At least 1 tank is required')
    .max(50, 'Maximum 50 tanks allowed'),

  // Step 3: Tank Configuration
  tanks: z.array(tankSchema).min(1, 'At least 1 tank configuration is required'),
});

const WATER_SOURCES = [
  { value: 'Borewell', label: 'Borewell' },
  { value: 'Canal', label: 'Canal' },
  { value: 'River', label: 'River' },
  { value: 'Rain Water', label: 'Rain Water' },
  { value: 'Other', label: 'Other' },
];

export default function FarmSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(farmSetupSchema),
    defaultValues: {
      farmName: '',
      ownerName: '',
      mobileNumber: '',
      email: '',
      location: '',
      district: '',
      state: '',
      totalArea: '',
      numberOfTanks: 2,
      tanks: [],
    },
    mode: 'onTouched',
  });

  const { fields, replace, append, remove } = useFieldArray({
    control,
    name: 'tanks',
  });

  const numberOfTanksValue = watch('numberOfTanks');

  // Step Navigation Validation
  const handleNext = async () => {
    let fieldsToValidate = [];

    if (currentStep === 1) {
      fieldsToValidate = ['farmName', 'ownerName', 'mobileNumber', 'email', 'location', 'district', 'state'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['totalArea', 'numberOfTanks'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['tanks'];
    }

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      // When moving from Step 2 to Step 3, generate tanks dynamically if needed
      if (currentStep === 2) {
        const count = parseInt(numberOfTanksValue, 10) || 1;
        const currentTanks = getValues('tanks') || [];

        if (currentTanks.length !== count) {
          const newTanks = Array.from({ length: count }, (_, idx) => {
            return currentTanks[idx] || {
              name: `Tank P-${idx + 1}`,
              area: 1.5,
              depth: 1.8,
              waterSource: 'Borewell',
              remarks: '',
            };
          });
          replace(newTanks);
        }
      }

      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = (data) => {
    setIsSubmitting(true);
    console.log('Complete Farm Setup Data:', data);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }, 1000);
  };

  const steps = [
    { number: 1, title: 'Farm Details', icon: Building2 },
    { number: 2, title: 'Land Details', icon: Layers },
    { number: 3, title: 'Tank Configuration', icon: Container },
    { number: 4, title: 'Review & Submit', icon: ClipboardList },
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
          Step {currentStep} of 4
        </Badge>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <PageHeader
          title="Farm Onboarding Wizard"
          subtitle="Configure your farm profile and tank setup to initialize tracking metrics."
        />

        {/* Stepper Progress Bar */}
        <div className="mb-10">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
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
                Your farm details and tank configurations have been initialized. Form data printed to developer console. Redirecting to your dashboard...
              </p>
              <Button variant="primary" size="md" onClick={() => navigate('/dashboard')} className="mt-2">
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

                    <Input
                      label="Mobile Number"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      required
                      error={errors.mobileNumber?.message}
                      {...register('mobileNumber')}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="e.g. owner@bluewave.com"
                      required
                      error={errors.email?.message}
                      {...register('email')}
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
                      Specify the land footprint and number of active culture tanks/ponds.
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
                      error={errors.totalArea?.message}
                      {...register('totalArea')}
                    />

                    <Input
                      label="Number of Tanks / Ponds"
                      type="number"
                      min={1}
                      max={50}
                      placeholder="e.g. 4"
                      required
                      helperText="Tank setup forms will generate dynamically in Step 3"
                      error={errors.numberOfTanks?.message}
                      {...register('numberOfTanks')}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: TANK CONFIGURATION */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="border-b border-border pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <Container className="w-5 h-5 text-primary" /> Step 3: Tank Configuration
                      </h2>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Configure dimensions and water source for each individual tank.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => {
                        append({
                          name: `Tank P-${fields.length + 1}`,
                          area: 1.5,
                          depth: 1.8,
                          waterSource: 'Borewell',
                          remarks: '',
                        });
                        setValue('numberOfTanks', fields.length + 1);
                      }}
                    >
                      Add Tank
                    </Button>
                  </div>

                  <div className="flex flex-col gap-6">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-background/60 border border-border/80 rounded-xl p-5 relative transition-all hover:border-primary/30"
                      >
                        <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-2">
                          <span className="font-bold text-sm text-primary flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary-light text-primary text-xs flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            Tank #{index + 1} Configuration
                          </span>

                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                remove(index);
                                setValue('numberOfTanks', fields.length - 1);
                              }}
                              className="text-text-secondary hover:text-danger p-1 rounded-md transition-colors"
                              title="Remove tank"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="Tank Name"
                            placeholder="e.g. Pond A1"
                            required
                            error={errors.tanks?.[index]?.name?.message}
                            {...register(`tanks.${index}.name`)}
                          />

                          <Input
                            label="Tank Area (Acres)"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 1.5"
                            required
                            error={errors.tanks?.[index]?.area?.message}
                            {...register(`tanks.${index}.area`)}
                          />

                          <Input
                            label="Tank Depth (Meters)"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 1.8"
                            required
                            error={errors.tanks?.[index]?.depth?.message}
                            {...register(`tanks.${index}.depth`)}
                          />

                          <Select
                            label="Water Source"
                            options={WATER_SOURCES}
                            required
                            error={errors.tanks?.[index]?.waterSource?.message}
                            {...register(`tanks.${index}.waterSource`)}
                          />

                          <div className="md:col-span-2">
                            <Input
                              label="Remarks / Notes"
                              placeholder="e.g. High salinity aerated pond"
                              error={errors.tanks?.[index]?.remarks?.message}
                              {...register(`tanks.${index}.remarks`)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & SUBMIT */}
              {currentStep === 4 && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" /> Step 4: Review & Submit
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Verify your farm information before finalizing onboarding setup.
                    </p>
                  </div>

                  {/* Summary Box 1: Farm Details */}
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

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-text-secondary block">Farm Name</span>
                        <span className="font-semibold text-text-primary">{getValues('farmName')}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary block">Owner Name</span>
                        <span className="font-semibold text-text-primary">{getValues('ownerName')}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary block">Mobile</span>
                        <span className="font-semibold text-text-primary">{getValues('mobileNumber')}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary block">Email</span>
                        <span className="font-semibold text-text-primary">{getValues('email')}</span>
                      </div>
                      <div className="col-span-2">
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

                  {/* Summary Box 2: Land Details */}
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
                        <span className="font-semibold text-text-primary">{getValues('totalArea')} Acres</span>
                      </div>
                      <div>
                        <span className="text-text-secondary block">Configured Tanks</span>
                        <span className="font-semibold text-text-primary">{getValues('tanks')?.length || 0} Tanks</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Box 3: Tank List */}
                  <div className="bg-background border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2">
                      <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                        <Container className="w-4 h-4 text-primary" /> Tank Configurations
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {getValues('tanks')?.map((tank, idx) => (
                        <div key={idx} className="p-3 bg-surface border border-border rounded-lg flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">{tank.name}</span>
                            <Badge variant="secondary" size="sm">{tank.waterSource}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-text-secondary">
                            <span>Area: <strong className="text-text-primary">{tank.area} Acres</strong></span>
                            <span>Depth: <strong className="text-text-primary">{tank.depth} m</strong></span>
                          </div>
                          {tank.remarks && (
                            <p className="text-[10px] text-text-secondary italic mt-1">"{tank.remarks}"</p>
                          )}
                        </div>
                      ))}
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

                {currentStep < 4 ? (
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
