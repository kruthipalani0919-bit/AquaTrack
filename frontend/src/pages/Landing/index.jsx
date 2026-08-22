import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplets,
  Building2,
  Container,
  UtensilsCrossed,
  Receipt,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Cloud,
  ArrowRight,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  DollarSign,
  PieChart,
  Stethoscope,
  Wheat
} from 'lucide-react';

import { Button } from '../../components/Button';

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans scroll-smooth">
      {/* 1. NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Droplets className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-primary tracking-tight leading-tight">
                AquaTrack
              </span>
              <span className="text-[10px] text-text-secondary font-medium tracking-widest uppercase">
                Prawn Farm Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#hero" className="hover:text-primary transition-colors">Home</a>
            <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
            <a href="#overview" className="hover:text-primary transition-colors">Overview</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface px-4 pt-3 pb-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-primary py-1"
            >
              Home
            </a>
            <a
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-primary py-1"
            >
              Solutions
            </a>
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-primary py-1"
            >
              Overview
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-primary py-1"
            >
              Contact
            </a>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button variant="outline" fullWidth onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="primary" fullWidth onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="hero" className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden bg-gradient-to-b from-teal-50/50 via-background to-background">
        {/* Abstract Background Accents */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-tight mb-6">
              Centralized Prawn Farm <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Management Platform
              </span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-10 max-w-3xl mx-auto">
              AquaTrack is a centralized prawn farm management platform that helps aquaculture businesses manage farms, tanks, crop cycles, feed, medicines, expenses, harvests, and reports from one unified system.
            </p>

            <div className="flex items-center justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                className="shadow-md hover:shadow-lg transition-shadow px-8 font-semibold"
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* Clean Operational Highlights Banner */}
          <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 sm:p-8 rounded-2xl bg-surface/80 border border-border shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-4 p-2">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Container className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Tank & Crop Operations</h4>
                <p className="text-xs text-text-secondary mt-0.5">Pond dimensions, seed stocking, and growth tracking.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 sm:border-l sm:border-border sm:pl-6">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Feed & Health Management</h4>
                <p className="text-xs text-text-secondary mt-0.5">Ration schedules, stock tracking, and treatment logs.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 sm:border-l sm:border-border sm:pl-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Harvest & Financials</h4>
                <p className="text-xs text-text-secondary mt-0.5">Yield records, operating expenses, and reporting.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOLUTIONS / CAPABILITIES SECTION */}
      <section id="solutions" className="py-24 bg-surface border-y border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Core Platform Capabilities
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Unified Platform for Prawn Farm Operations
            </h3>
            <p className="text-sm sm:text-base text-text-secondary mt-4 leading-relaxed">
              Consolidate field operations, input management, financial records, and operational reports into structured enterprise workflows.
            </p>
          </div>

          {/* 3 Clean Spaced Columns matching existing modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Column 1: Farm Operations */}
            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-background border border-border/70 hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-text-primary">Farm Operations</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Setup farm properties, register pond dimensions, track active culture batches, and monitor seed stocking density across your farm site.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-text-primary font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Farm Setup & Configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Tank & Pond Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Crop Cycle & Seed Stocking Logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Crop Lifecycle & DOC Tracking</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Financial Management */}
            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-background border border-border/70 hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-text-primary">Financial Management</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Manage feed inventory, track treatment medicines, log daily operating expenses, and record harvest yields and buyer sales revenue.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-text-primary font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Feed Ration & Stock Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Medicine & Treatment Records</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Operational Expense Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Harvest Yield & Buyer Records</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Reporting & Analytics */}
            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-background border border-border/70 hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PieChart className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-text-primary">Reporting & Analytics</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Review operational summaries, evaluate production metrics, generate harvest yield reports, and track overall financial insights.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-text-primary font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Operational Activity Reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Harvest Summaries & Yield Logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Financial Expenditure Insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Performance Monitoring Overview</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OVERVIEW & ADVANTAGES SECTION */}
      <section id="overview" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Operational Efficiency
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Designed for Commercial Aquaculture Standards
            </h3>
            <p className="text-sm sm:text-base text-text-secondary mt-3">
              Replace fragmented spreadsheets and paper registers with structured digital workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface border border-border rounded-2xl p-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-text-primary mb-2">Streamlined Operations</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Intuitive forms and structured record-keeping tailored specifically for prawn farm management.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-text-primary mb-2">Data Integrity</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Secure JWT authentication and structured storage ensure operational records remain accurate and safe.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-text-primary mb-2">Performance Tracking</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Track tank stocking, feed rations, medicine treatments, and harvest outputs effortlessly.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-text-primary mb-2">Centralized Access</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Access your farm dashboard and module records securely from any web browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-teal-900 via-primary to-teal-800 text-white p-10 sm:p-16 overflow-hidden shadow-xl text-center">
            {/* Background Decorative Accents */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Streamline Your Prawn Farm Operations
              </h2>

              <p className="text-sm sm:text-base text-teal-100 mb-8 leading-relaxed">
                Manage your tanks, crop cycles, feed, medicines, expenses, and harvests with AquaTrack.
              </p>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/register')}
                icon={<ArrowRight className="w-5 h-5 text-primary" />}
                iconPosition="right"
                className="bg-white text-primary hover:bg-teal-50 font-bold px-8 shadow-lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer id="contact" className="bg-surface border-t border-border pt-16 pb-12 text-xs text-text-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand Info */}
            <div className="md:col-span-1 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-primary tracking-tight">AquaTrack</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Centralized prawn farm management platform empowering commercial aquaculture businesses with structured operational oversight.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h5 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wider">
                Platform
              </h5>
              <ul className="flex flex-col gap-2">
                <li><a href="#hero" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#solutions" className="hover:text-primary transition-colors">Solutions</a></li>
                <li><a href="#overview" className="hover:text-primary transition-colors">Overview</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Col 3: Account Portals */}
            <div>
              <h5 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wider">
                Account Portals
              </h5>
              <ul className="flex flex-col gap-2">
                <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Get Started</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact Info */}
            <div>
              <h5 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wider">
                Contact
              </h5>
              <ul className="flex flex-col gap-2.5">
                <li className="flex items-center gap-2 text-text-secondary">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>contact@aquatrack.io</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>+1 (800) AQUA-TRACK</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>Aquaculture Innovation Center</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p>© 2026 AquaTrack Inc. All rights reserved.</p>
            <p className="text-text-secondary/70">Commercial Aquaculture Management Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
