import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplets,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

import { Button } from '../../components/Button';

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
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
          <div className="md:hidden border-b border-border bg-surface px-4 pt-3 pb-6 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
            <Button variant="outline" fullWidth onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
              Login
            </Button>
            <Button variant="primary" fullWidth onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
              Get Started
            </Button>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="hero" className="relative pt-20 pb-28 md:pt-32 md:pb-40 overflow-hidden bg-gradient-to-b from-teal-50/50 via-background to-background flex-1 flex items-center">
        {/* Abstract Background Accents */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-tight mb-6">
              Commercial Prawn Farm <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Management Platform
              </span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto">
              AquaTrack helps commercial aquaculture businesses manage farm properties, tanks, crop cycles, feed, medicines, expenses, harvests, and reports from one unified system.
            </p>

            <div className="flex items-center justify-center gap-4">
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
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="px-8 font-semibold"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOTER */}
      <footer className="bg-surface border-t border-border pt-10 pb-8 text-xs text-text-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Col 1: Brand Info */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-primary tracking-tight">AquaTrack</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed max-w-md">
                Centralized prawn farm management platform empowering commercial aquaculture businesses.
              </p>
            </div>

            {/* Col 2: Account Portals */}
            <div className="md:text-right">
              <h5 className="font-semibold text-text-primary text-sm mb-2.5 uppercase tracking-wider">
                Account Portals
              </h5>
              <ul className="flex flex-col md:items-end gap-2">
                <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Get Started</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border/80 text-center">
            <p className="text-text-secondary/70">Commercial Aquaculture Management Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
