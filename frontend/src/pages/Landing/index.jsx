import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplets,
  Building2,
  Container,
  UtensilsCrossed,
  Waves,
  Receipt,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Cloud,
  ArrowRight,
  Sparkles,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Code2,
  Server,
  Database,
  Layers,
  Cpu,
  Feather
} from 'lucide-react';

import heroPreview from '../../assets/hero-preview.png';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Building2,
      title: 'Farm Management',
      description: 'Effortlessly organize multiple farm sites, assign staff roles, and oversee all daily field operations from a centralized hub.',
      color: 'text-teal-600 bg-teal-50',
    },
    {
      icon: Container,
      title: 'Tank Management',
      description: 'Track individual pond metrics, stocking densities, biomass estimations, and growth trajectories per culture cycle.',
      color: 'text-cyan-600 bg-cyan-50',
    },
    {
      icon: UtensilsCrossed,
      title: 'Feed Tracking',
      description: 'Optimize Feed Conversion Ratio (FCR), schedule precise feeding rations, and prevent costly feed waste.',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      icon: Waves,
      title: 'Water Quality Monitoring',
      description: 'Log and monitor crucial water parameters including pH, dissolved oxygen (DO), salinity, temperature, and ammonia.',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: Receipt,
      title: 'Expense Management',
      description: 'Maintain detailed financial logs for feed, chemicals, power, labor, and calculate net profit margins per harvest.',
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Generate actionable growth analytics, harvest projections, and automated yield summaries with interactive visual charts.',
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  const advantages = [
    {
      icon: Zap,
      title: 'Easy to Use',
      description: 'Designed specifically for aquaculture operators with a clean, intuitive interface that requires zero technical training.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade data encryption and role-based permissions safeguard your valuable farm records.',
    },
    {
      icon: Sparkles,
      title: 'Real-Time Monitoring',
      description: 'Instant threshold notifications alert you immediately when water parameters drift into dangerous zones.',
    },
    {
      icon: Cloud,
      title: 'Cloud Based',
      description: 'Access your farm dashboard anytime, anywhere from mobile, tablet, or desktop with automated cloud sync.',
    },
  ];

  const techStack = [
    { name: 'React', desc: 'Frontend Framework', icon: Code2, badge: 'UI Library' },
    { name: 'Node.js', desc: 'Backend Runtime', icon: Server, badge: 'Runtime' },
    { name: 'Express', desc: 'REST API Framework', icon: Layers, badge: 'Backend' },
    { name: 'PostgreSQL', desc: 'Relational Database', icon: Database, badge: 'Database' },
    { name: 'Supabase', desc: 'Cloud Auth & Storage', icon: Cpu, badge: 'Backend' },
    { name: 'Tailwind CSS', desc: 'Utility Design System', icon: Feather, badge: 'Styling' },
    { name: 'Prisma', desc: 'Type-Safe ORM', icon: Database, badge: 'ORM' },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans scroll-smooth">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
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

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#hero" className="hover:text-primary transition-colors">Home</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#why-aquatrack" className="hover:text-primary transition-colors">Why AquaTrack</a>
            <a href="#tech-stack" className="hover:text-primary transition-colors">Tech Stack</a>
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

          {/* Mobile Menu Button */}
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
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-primary py-1"
            >
              Features
            </a>
            <a
              href="#why-aquatrack"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-primary py-1"
            >
              Why AquaTrack
            </a>
            <a
              href="#tech-stack"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-primary py-1"
            >
              Tech Stack
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
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-teal-50/60 via-background to-background">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="primary" size="md" className="mb-4 shadow-xs inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Next-Gen Aquaculture Management</span>
            </Badge>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-tight mb-6">
              Smart Prawn Farm <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Management Platform
              </span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8 max-w-2xl mx-auto">
              Streamline pond operations, optimize feed conversion ratios, monitor real-time water quality parameters, and maximize harvest profitability with AquaTrack.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                className="shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto"
              >
                Get Started Free
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Visual Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl p-2 bg-gradient-to-b from-primary/20 via-border to-border shadow-2xl border border-primary/20 backdrop-blur-md">
              <img
                src={heroPreview}
                alt="AquaTrack Dashboard Preview"
                className="rounded-xl w-full object-cover max-h-[520px]"
              />

              {/* Floating Metric Badge 1 */}
              <div className="absolute -top-4 left-6 sm:left-12 bg-surface/95 backdrop-blur-md border border-border px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 animate-bounce-slow">
                <div className="w-3 h-3 rounded-full bg-success animate-ping" />
                <div>
                  <div className="text-[10px] text-text-secondary uppercase font-semibold">Water Quality</div>
                  <div className="text-xs font-bold text-text-primary">DO: 6.8 mg/L (Optimal)</div>
                </div>
              </div>

              {/* Floating Metric Badge 2 */}
              <div className="absolute -bottom-4 right-6 sm:right-12 bg-surface/95 backdrop-blur-md border border-border px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                  FCR
                </div>
                <div>
                  <div className="text-[10px] text-text-secondary uppercase font-semibold">Feed Ratio</div>
                  <div className="text-xs font-bold text-text-primary">1.25 Efficiency Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 bg-surface border-y border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Comprehensive Platform Capabilities
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Everything You Need to Run High-Yield Prawn Farms
            </h3>
            <p className="text-sm sm:text-base text-text-secondary mt-3">
              Built for commercial prawn farmers, hatcheries, and aquaculture enterprises seeking precision management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  hoverEffect={true}
                  padding="relaxed"
                  className="flex flex-col items-start gap-4 border-border/80 hover:border-primary/40 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. WHY AQUATRACK SECTION */}
      <section id="why-aquatrack" className="py-20 bg-gradient-to-b from-background via-teal-50/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Why Choose AquaTrack
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Designed for Speed, Security & Simplicity
            </h3>
            <p className="text-sm sm:text-base text-text-secondary mt-3">
              Eliminate paper logbooks and spreadsheets with an all-in-one digital aquaculture solution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv, index) => {
              const Icon = adv.icon;
              return (
                <div
                  key={index}
                  className="bg-surface border border-border/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-center flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary-light text-primary flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-semibold text-text-primary mb-2">
                    {adv.title}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. TECHNOLOGY STACK SECTION */}
      <section id="tech-stack" className="py-20 bg-surface border-y border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Modern Engineering
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Powered by Industry-Standard Tech Stack
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-2">
              Built on a robust, scalable architecture ensuring sub-second response times and high availability.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {techStack.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <div
                  key={index}
                  className="bg-background border border-border hover:border-primary/40 rounded-xl p-4 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface text-primary flex items-center justify-center mb-3 shadow-xs border border-border">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold text-text-primary mb-0.5">
                    {tech.name}
                  </h5>
                  <span className="text-[10px] text-text-secondary leading-tight mb-2">
                    {tech.desc}
                  </span>
                  <Badge variant="outline" size="sm" className="text-[9px] px-1.5 py-0">
                    {tech.badge}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-teal-900 via-primary to-teal-800 text-white p-8 sm:p-14 overflow-hidden shadow-xl text-center">
            {/* Background Decorative Circles */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Start Managing Your Farm Smarter
              </h2>

              <p className="text-sm sm:text-base text-teal-100 mb-8 leading-relaxed">
                Join progressive prawn farmers streamlining their operations, improving Feed Conversion Ratios, and maximizing harvest yields today.
              </p>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/register')}
                icon={<CheckCircle2 className="w-5 h-5 text-primary" />}
                className="bg-white text-primary hover:bg-teal-50 font-bold px-8 shadow-lg"
              >
                Create Free Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
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
                Next-generation prawn farm management platform empowering commercial aquaculture with precision tracking and analytics.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h5 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wider">
                Quick Links
              </h5>
              <ul className="flex flex-col gap-2">
                <li><a href="#hero" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#why-aquatrack" className="hover:text-primary transition-colors">Why AquaTrack</a></li>
                <li><a href="#tech-stack" className="hover:text-primary transition-colors">Tech Stack</a></li>
              </ul>
            </div>

            {/* Col 3: Portal Links */}
            <div>
              <h5 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wider">
                Account Portals
              </h5>
              <ul className="flex flex-col gap-2">
                <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard Preview</Link></li>
                <li><Link to="/farm-setup" className="hover:text-primary transition-colors">Farm Setup Wizard</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact Info */}
            <div>
              <h5 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wider">
                Contact & Support
              </h5>
              <ul className="flex flex-col gap-2.5">
                <li className="flex items-center gap-2 text-text-secondary">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>support@aquatrack.io</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>+1 (800) AQUA-TRACK</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>Coastal Aquaculture Tech Park</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p>© 2026 AquaTrack Inc. All rights reserved.</p>
            <p className="text-text-secondary/70">Building sustainable & profitable prawn farms worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
