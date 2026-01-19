import React, { useState, useEffect, useRef } from 'react';
import { Shield, Server, Zap, CheckCircle, Menu, X, ArrowRight, Mail, Phone, MapPin, Clock, Users, Lock, Cpu, Cloud, MessageCircle, AlertCircle, Loader } from 'lucide-react';

// Feature Card Component with animation
const FeatureCard = ({ icon: Icon, title, description, color, delay }) => {
  const [ref, setRef] = useState(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref]);

  const colorMap = {
    blue: {
      bg: 'from-blue-100 to-blue-200',
      text: 'text-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    teal: {
      bg: 'from-teal-100 to-teal-200',
      text: 'text-teal-600',
      shadow: 'shadow-teal-500/20'
    },
    purple: {
      bg: 'from-purple-100 to-purple-200',
      text: 'text-purple-600',
      shadow: 'shadow-purple-500/20'
    }
  };

  const colors = colorMap[color];

  return (
    <div
      ref={setRef}
      className={`flex items-start space-x-4 group p-6 rounded-xl bg-white shadow-md hover:shadow-xl border border-gray-100 transition-all duration-500 hover:-translate-y-1 ${
        isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg ${colors.shadow}`}>
        <Icon className={`w-8 h-8 ${colors.text}`} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-teal-600 transition-colors">{title}</h4>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default function IntegroSystems() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileWidgetId, setTurnstileWidgetId] = useState(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const turnstileRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load Turnstile script dynamically
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    
    if (existingScript) {
      if (window.turnstile) {
        setTurnstileLoaded(true);
      } else {
        existingScript.addEventListener('load', () => {
          setTurnstileLoaded(true);
        });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Turnstile script loaded successfully');
      setTurnstileLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Turnstile script');
      setSubmitStatus('error');
      setErrorMessage('Security verification failed to load. Please refresh the page.');
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize Turnstile widget when script is loaded
  useEffect(() => {
    if (!turnstileLoaded || !turnstileRef.current) {
      return;
    }

    // Clear any existing widget
    if (turnstileWidgetId !== null && window.turnstile) {
      try {
        window.turnstile.remove(turnstileWidgetId);
        console.log('🗑️ Removed old Turnstile widget');
      } catch (e) {
        console.log('No widget to remove');
      }
    }

    // Clear the container
    if (turnstileRef.current) {
      turnstileRef.current.innerHTML = '';
    }

    // Render new widget
    try {
      console.log('🔄 Rendering Turnstile widget...');
      const widgetId = window.turnstile.render(turnstileRef.current, {
        sitekey: '0x4AAAAAACMrxA4X4MrL5wYR',
        theme: 'dark',
        callback: function(token) {
          console.log('✅ Turnstile verified successfully');
        },
        'error-callback': function() {
          console.error('❌ Turnstile verification error');
          setSubmitStatus('error');
          setErrorMessage('CAPTCHA verification failed. Please refresh the page and try again.');
        },
        'expired-callback': function() {
          console.log('⏰ Turnstile token expired, resetting...');
          if (window.turnstile && widgetId !== null) {
            window.turnstile.reset(widgetId);
          }
        },
        'timeout-callback': function() {
          console.log('⏱️ Turnstile timeout, resetting...');
          if (window.turnstile && widgetId !== null) {
            window.turnstile.reset(widgetId);
          }
        }
      });
      
      setTurnstileWidgetId(widgetId);
      console.log('✅ Turnstile widget rendered with ID:', widgetId);
    } catch (error) {
      console.error('❌ Error rendering Turnstile widget:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to initialize security verification. Please refresh the page.');
    }

    return () => {
      if (turnstileWidgetId !== null && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId);
        } catch (e) {
          console.log('Widget cleanup completed');
        }
      }
    };
  }, [turnstileLoaded]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setSubmitStatus(null);
  setErrorMessage('');

  // Validation
  if (!formData.name || !formData.email || !formData.phone || !formData.message) {
    setSubmitStatus('error');
    setErrorMessage('Please fill in all required fields: Name, Email, Contact Number, and Requirements');
    setSubmitting(false);
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setSubmitStatus('error');
    setErrorMessage('Please enter a valid email address');
    setSubmitting(false);
    return;
  }

  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (!phoneRegex.test(formData.phone)) {
    setSubmitStatus('error');
    setErrorMessage('Please enter a valid phone number');
    setSubmitting(false);
    return;
  }

  // Get the Turnstile token
  const captchaToken = document.querySelector('input[name="cf-turnstile-response"]')?.value;
  
  if (!captchaToken) {
    setSubmitStatus('error');
    setErrorMessage('Please wait for the security verification to complete and try again.');
    setSubmitting(false);
    
    // Try to reset the widget
    if (turnstileWidgetId !== null && window.turnstile) {
      try {
        window.turnstile.reset(turnstileWidgetId);
      } catch (e) {
        console.error('Failed to reset Turnstile:', e);
      }
    }
    return;
  }

  const timestamp = new Date().toLocaleString('en-ZA', { 
    timeZone: 'Africa/Johannesburg',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: 'a35af147-667e-431e-973d-64375fb18ea5',
        
        // Enhanced email formatting with emojis
        subject: `🚀 NEW IT ASSESSMENT REQUEST - ${formData.company || formData.name}`,
        from_name: 'Integro Systems Website',
        replyto: formData.email,
        
        // Primary contact info with emojis for better email readability
        '👤 Contact Name': formData.name,
        '🏢 Company': formData.company || 'Not Provided',
        '📧 Email': formData.email,
        '📱 Phone': formData.phone,
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━': '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '💼 IT REQUIREMENTS': formData.message,
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ': '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '⚡ Priority': 'HIGH',
        '📍 Lead Source': 'Website Contact Form',
        '🕐 Submitted': timestamp,
        
        // CAPTCHA token
        'cf-turnstile-response': captchaToken,
        
        // ✅ AUTO-RESPONSE CONFIGURATION - This sends a separate email to the contact
        autoresponse: {
          subject: `Thank You for Contacting Integro Systems - We'll Be In Touch Soon!`,
          message: `
Hi ${formData.name},

Thank you for reaching out to Integro Systems! We've successfully received your IT assessment request and our team is reviewing your requirements.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 YOUR SUBMISSION DETAILS:

Name: ${formData.name}
Company: ${formData.company || 'Not Provided'}
Email: ${formData.email}
Phone: ${formData.phone}
Submitted: ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT HAPPENS NEXT?

One of our IT specialists will contact you within 24 hours to discuss your specific needs and how we can help optimize your business technology infrastructure.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEED IMMEDIATE ASSISTANCE?

📞 Phone: +27 67 414 8908
📧 Email: support@integrosystems.co.za
💬 WhatsApp: https://wa.me/27674148908

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We look forward to partnering with you to deliver enterprise-grade IT solutions that drive your business forward.

Best regards,
The Integro Systems Team
Enterprise IT Support, Automation & Security Solutions

Pretoria, South Africa
www.integrosystems.co.za

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated confirmation email. Please do not reply directly to this message.
If you have any questions, please contact us at support@integrosystems.co.za

© 2026 Integro Systems. All rights reserved.
          `
        }
      })
    });

    const result = await response.json();
    
    if (result.success) {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      
      // Reset Turnstile widget after successful submission
      if (turnstileWidgetId !== null && window.turnstile) {
        try {
          window.turnstile.reset(turnstileWidgetId);
          console.log('✅ Turnstile widget reset after successful submission');
        } catch (e) {
          console.error('Failed to reset Turnstile:', e);
        }
      }
      
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          const formElement = contactSection.querySelector('.bg-white\\/5');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    } else {
      setSubmitStatus('error');
      setErrorMessage(result.message || 'There was an error submitting your form. Please try again.');
      
      // Reset Turnstile widget after error
      if (turnstileWidgetId !== null && window.turnstile) {
        try {
          window.turnstile.reset(turnstileWidgetId);
        } catch (e) {
          console.error('Failed to reset Turnstile:', e);
        }
      }
    }
  } catch (error) {
    console.error('Form submission error:', error);
    setSubmitStatus('error');
    setErrorMessage('There was an error submitting your form. Please try again or contact us directly at support@integrosystems.co.za');
    
    // Reset Turnstile widget after error
    if (turnstileWidgetId !== null && window.turnstile) {
      try {
        window.turnstile.reset(turnstileWidgetId);
      } catch (e) {
        console.error('Failed to reset Turnstile:', e);
      }
    }
  } finally {
    setSubmitting(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (submitStatus === 'error') {
      setSubmitStatus(null);
      setErrorMessage('');
    }
  };

  // Animation hook for fade-in on scroll
  const useInView = (options = {}) => {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      }, { threshold: 0.1, ...options });

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      };
    }, []);

    return [ref, isInView];
  };

  // Count-up animation for stats
  const useCountUp = (end, duration = 2000, isInView) => {
    const [count, setCount] = useState(0);
    const [isDecimal, setIsDecimal] = useState(false);

    useEffect(() => {
      if (!isInView) return;

      let numericEnd;
      let hasDecimal = false;

      if (typeof end === 'string') {
        const numStr = end.replace(/[^\d.]/g, '');
        numericEnd = parseFloat(numStr);
        hasDecimal = numStr.includes('.');
        setIsDecimal(hasDecimal);
      } else {
        numericEnd = end;
      }

      let startTime;
      let animationFrame;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        if (hasDecimal) {
          setCount(parseFloat((numericEnd * percentage).toFixed(1)));
        } else {
          setCount(Math.floor(numericEnd * percentage));
        }

        if (percentage < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(numericEnd);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [end, duration, isInView]);

    return { count, isDecimal };
  };

  const services = [
    {
      icon: Server,
      title: "Managed IT Support",
      description: "Comprehensive outsourced IT infrastructure management with proactive monitoring and enterprise-grade system administration.",
      features: ["24/7 Remote Technical Support", "Enterprise Hardware & Software Management", "Real-time Network Monitoring", "Microsoft 365 & Google Workspace Administration"]
    },
    {
      icon: Cloud,
      title: "Cloud & Backup Solutions",
      description: "Enterprise cloud infrastructure with redundant backup systems and comprehensive disaster recovery protocols.",
      features: ["Automated Multi-tier Backups", "Hybrid Cloud & Offsite Storage", "Business Continuity Planning", "Cloud Migration & Optimization"]
    },
    {
      icon: Shield,
      title: "Cybersecurity Solutions",
      description: "Multi-layered security architecture designed to protect against evolving threats while maintaining compliance standards.",
      features: ["Advanced Endpoint Protection", "Next-gen Firewall & IDS/IPS", "Email Security & Phishing Protection", "Ransomware Prevention & Detection"]
    },
    {
      icon: Zap,
      title: "Automation & Process Optimization",
      description: "Intelligent workflow automation and systems integration that eliminate manual processes and enhance operational efficiency.",
      features: ["Business Process Automation", "Custom API Integrations", "Real-time Data Synchronization", "Operational Efficiency Analysis"]
    },
    {
      icon: Cpu,
      title: "Custom Software Development",
      description: "Bespoke enterprise applications engineered to align with your specific business requirements and workflows.",
      features: ["Enterprise Web & Desktop Applications", "Cross-platform Mobile Solutions", "Legacy System Modernization", "Third-party System Integration"]
    }
  ];

  const packages = [
    {
      name: "Starter IT Care",
      color: "from-blue-500 to-indigo-600",
      price: "R1,500 - R2,500",
      period: "per month",
      description: "Essential IT support for small businesses (1-5 users)",
      features: [
        "Business-hours remote technical support",
        "Endpoint security & antivirus monitoring",
        "Email infrastructure & network support",
        "Microsoft 365 or Google Workspace configuration",
        "50GB encrypted cloud backup per user",
        "Monthly comprehensive system audit"
      ],
      highlighted: false
    },
    {
      name: "Business IT Pro",
      color: "from-teal-500 to-cyan-600",
      price: "R4,000 - R8,000",
      period: "per month",
      description: "Comprehensive IT management for growing enterprises (5-20 users)",
      features: [
        "Hybrid remote & onsite technical support",
        "Server infrastructure & network monitoring",
        "Enterprise-grade firewall & antivirus",
        "Daily automated backup (cloud + local redundancy)",
        "Full Microsoft 365 & Workspace administration",
        "1TB encrypted cloud storage per user",
        "Priority incident response & quarterly IT audits"
      ],
      highlighted: true
    },
    {
      name: "Enterprise Secure",
      color: "from-pink-500 to-purple-500",
      price: "R10,000+",
      period: "per month",
      description: "Complete security-first IT infrastructure management",
      features: [
        "24/7 fully managed IT support & monitoring",
        "Real-time threat detection & response",
        "Disaster recovery & business continuity planning",
        "Unlimited encrypted cloud backup & storage",
        "Dedicated cloud platform administration",
        "Process automation & integration consulting",
        "Compliance management & audit support"
      ],
      highlighted: false
    }
  ];

  const statsData = [
    { icon: Users, value: "100+", label: "Enterprise Clients" },
    { icon: Shield, value: "99.9%", label: "Uptime SLA" },
    { icon: Clock, value: "<2hr", label: "Avg Response Time" },
    { icon: Lock, value: "100%", label: "Secure Infrastructure" }
  ];

  // Stats component with count-up animation
  const StatCard = ({ stat, index }) => {
    const [ref, isInView] = useInView();
    const { count, isDecimal } = useCountUp(stat.value, 2000, isInView);

    const formatCount = () => {
      if (!isInView) return '0';
      
      const value = stat.value;
      const displayCount = isDecimal ? count.toFixed(1) : count;
      
      if (typeof value === 'string') {
        if (value.includes('%')) {
          return displayCount + '%';
        } else if (value.includes('<')) {
          return '<' + displayCount + 'hr';
        } else if (value.includes('+')) {
          return displayCount + '+';
        }
      }
      return displayCount;
    };

    return (
      <div 
        ref={ref}
        className={`text-center group hover:scale-105 transition-all duration-500 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <div 
          className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-2xl mb-5 group-hover:shadow-2xl group-hover:shadow-blue-500/40 transition-all duration-300 shadow-lg mx-auto"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%)',
            borderRadius: '1rem'
          }}
        >
          <stat.icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
        </div>
        <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-3">
          {formatCount()}
        </div>
        <div className="text-gray-700 font-semibold text-base md:text-lg">{stat.label}</div>
      </div>
    );
  };

  // Service card with animation
  const ServiceCard = ({ service, index }) => {
    const [ref, isInView] = useInView();

    return (
      <div 
        ref={ref}
        className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 group text-center ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: `${index * 150}ms` }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/30 mx-auto">
          <service.icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
        <div className="space-y-3">
          {service.features.map((feature, idx) => (
            <div key={idx} className="flex items-start space-x-3 group/item">
              <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
              <span className="text-gray-700 text-left">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white shadow-xl' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <img 
                src="https://i.postimg.cc/mrNHcz4K/copy-reduced-logo-removebg-preview.png" 
                alt="Integro Systems Logo" 
                className="h-20 md:h-20 transition-transform duration-300 hover:scale-100"
              />
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group">
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#packages" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group">
                Packages
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>

            <button 
              className="hidden md:block bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
            </button>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t animate-slideDown">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-600 py-2 transition-colors">Services</a>
              <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-600 py-2 transition-colors">Packages</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-600 py-2 transition-colors">About</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-600 py-2 transition-colors">Contact</a>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-slate-950 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-700 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6 px-6 py-3 bg-blue-600/50 backdrop-blur-md rounded-full text-white text-sm md:text-base font-bold border-2 border-blue-400/60 animate-fadeIn shadow-2xl shadow-blue-500/50" style={{boxShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)'}}>
              Trusted IT Partner for South African Enterprises
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight animate-fadeInUp drop-shadow-lg">
              <span className="text-white font-extrabold">Enterprise-Grade IT Infrastructure,</span>
              <span className="block mt-2 font-extrabold animated-gradient-text">
                Delivered with Precision
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto leading-relaxed animate-fadeInUp drop-shadow-md" style={{animationDelay: '0.2s'}}>
              Empowering South African businesses with resilient IT systems, intelligent automation, and multi-layered cybersecurity solutions designed for operational excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <button 
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/60 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 group shadow-xl"
              >
                <span>Request Consultation</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition-all duration-300 border-2 border-white/40 hover:border-white/60 shadow-lg"
              >
                Explore Solutions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {statsData.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive IT Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From enterprise infrastructure management to advanced cybersecurity, we deliver the complete technology foundation your organization needs to thrive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 px-4 bg-slate-900 text-white relative overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRDIDI5Ljc5IDMwIDI4IDMxLjc5IDI4IDM0YzAgMi4yMSAxLjc5IDQgNCA0IDIuMjEgMCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] animate-move"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Scalable Service Packages
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Select the optimal IT support package aligned with your business requirements. All packages feature transparent, predictable monthly pricing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div 
                key={index}
                className={`rounded-2xl p-8 border transition-all duration-500 hover:scale-105 text-center ${
                  pkg.highlighted 
                    ? 'bg-white/5 backdrop-blur-sm border-teal-400 shadow-2xl shadow-teal-500/30 md:scale-105' 
                    : 'bg-transparent border-white/20 hover:border-teal-400/50'
                } relative group`}
              >
                {pkg.highlighted && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center z-10">
                    <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg animate-bounce">
                      Most Popular
                    </span>
                  </div>
                )}
          
                <div className={`w-full h-6 bg-gradient-to-r ${pkg.color} rounded-full mb-6 group-hover:h-7 transition-all duration-300 shadow-2xl ring-2 ring-white/10`} style={{opacity: 1}}></div>
                <h3 className="text-2xl font-bold mb-2 text-white">{pkg.name}</h3>
                <p className="text-gray-300 mb-6">{pkg.description}</p>
                <div className="mb-6">
                  <div className="text-4xl font-bold mb-1 text-white">{pkg.price}</div>
                  <div className="text-gray-300">{pkg.period}</div>
                </div>
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-3 group/item">
                      <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                      <span className="text-gray-200 text-left">{feature}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    pkg.highlighted
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-teal-500/50 hover:scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4 text-lg">Need custom enterprise solutions or one-time services?</p>
            <button 
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              className="text-teal-400 font-semibold hover:text-teal-300 transition-colors inline-flex items-center space-x-2 text-lg group"
            >
              <span>Contact us for tailored pricing</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Integro Systems?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your trusted technology partner delivering measurable results
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Glowing animated card for company description */}
              <div className="relative group">
                {/* Animated glow effect behind */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-teal-500 to-blue-500 rounded-2xl opacity-40 blur-md group-hover:opacity-60 transition-all duration-500 animate-gradient"></div>
                
                {/* Main card content */}
                <div className="relative rounded-2xl p-8 shadow-xl border-2 border-blue-400 hover:border-teal-400 transition-all duration-500 animate-pulse-border overflow-hidden">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50 animate-gradient"></div>
                  
                  {/* Content */}
                  <div className="relative space-y-6">
                    <p className="text-lg text-gray-700 leading-relaxed font-medium">
                      Integro Systems is a premier South African IT solutions provider specializing in resilient infrastructure architecture, intelligent process automation, and enterprise-grade cybersecurity. We enable organizations to operate with maximum efficiency, robust security, and minimal technology disruption.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed font-medium">
                      Unlike conventional IT providers, we prioritize solutions that deliver measurable ROI—stable, scalable infrastructure, time-saving automation, and layered security that evolves with your business. No unnecessary complexity, no overselling—just reliable technology that drives results.
                    </p>
                  </div>
                </div>
              </div>

              {/* Animated Feature Cards */}
              <div className="space-y-6">
                <FeatureCard 
                  icon={Shield}
                  title="Security-First Architecture"
                  description="Multi-layered protection engineered for real-world threats, not theoretical vulnerabilities."
                  color="blue"
                  delay={0}
                />
                <FeatureCard 
                  icon={Zap}
                  title="Automation Excellence"
                  description="Eliminate manual processes and enhance operational efficiency through intelligent workflow automation."
                  color="teal"
                  delay={100}
                />
                <FeatureCard 
                  icon={Users}
                  title="Dedicated Partnership"
                  description="Enterprise-level IT expertise without the overhead of in-house infrastructure teams."
                  color="purple"
                  delay={200}
                />
              </div>
            </div>

            <div className="relative">
              {/* Floating background elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
              
              {/* Main CTA Card */}
              <div className="relative bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl p-8 text-white shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-300 hover:scale-105 overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRDIDI5Ljc5IDMwIDI4IDMxLjc5IDI4IDM0YzAgMi4yMSAxLjc5IDQgNCA0IDIuMjEgMCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] animate-move"></div>
                </div>

                <Cloud className="w-16 h-16 mb-6 opacity-90 animate-pulse relative z-10" />
                <h3 className="text-2xl font-bold mb-4 relative z-10">Ready to Transform Your Infrastructure?</h3>
                <p className="mb-6 text-blue-50 leading-relaxed relative z-10">
                  Schedule a consultation to discover how we can optimize your technology infrastructure, minimize downtime, and fortify your business operations.
                </p>
                
                <ul className="space-y-3 mb-8 relative z-10">
                  <li className="flex items-center space-x-3 group/li">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 group-hover/li:scale-110 transition-transform" />
                    <span>Complimentary IT infrastructure assessment</span>
                  </li>
                  <li className="flex items-center space-x-3 group/li">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 group-hover/li:scale-110 transition-transform" />
                    <span>Flexible engagement models</span>
                  </li>
                  <li className="flex items-center space-x-3 group/li">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 group-hover/li:scale-110 transition-transform" />
                    <span>Transparent, predictable pricing structure</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                  className="relative z-10 bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:shadow-xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 w-full group"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Schedule Consultation</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Let's Build Your IT Foundation
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Contact us today for a complimentary IT assessment and discover how we can elevate your business technology infrastructure.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105 group">
              <Phone className="w-8 h-8 text-teal-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold mb-2">Phone</h3>
              <p className="text-gray-300">+27 67 414 8908</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105 group">
              <Mail className="w-8 h-8 text-teal-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-gray-300 break-words text-sm">support@integrosystems.co.za</p>
            </div>
            <a 
              href="https://wa.me/27674148908" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105 group cursor-pointer"
            >
              <MessageCircle className="w-8 h-8 text-teal-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold mb-2">WhatsApp</h3>
              <p className="text-gray-300">Chat with us</p>
            </a>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105 group">
              <MapPin className="w-8 h-8 text-teal-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold mb-2">Location</h3>
              <p className="text-gray-300">Pretoria, South Africa</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">Request Your Complimentary IT Assessment</h3>
            
            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-5 bg-gradient-to-r from-green-500/20 to-teal-500/20 border-2 border-green-400/50 rounded-xl backdrop-blur-sm animate-fadeIn">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-7 h-7 text-green-400 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-green-300 text-lg">Thank you for your inquiry!</p>
                    <p className="text-sm text-green-200 mt-1">We'll contact you within 24 hours to discuss your IT requirements.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="mb-6 p-5 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/50 rounded-xl backdrop-blur-sm animate-fadeIn">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-7 h-7 text-red-400 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-red-300 text-lg">Please check your information</p>
                    <p className="text-sm text-red-200 mt-1">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field */}
              <input 
                type="checkbox" 
                name="botcheck" 
                className="hidden" 
                style={{ display: 'none' }}
                tabIndex="-1"
                autoComplete="off"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name *" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Business Email *" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <input 
                type="tel" 
                name="phone"
                placeholder="Contact Number *" 
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input 
                type="text" 
                name="company"
                placeholder="Company Name" 
                value={formData.company}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <textarea 
                name="message"
                placeholder="Describe your IT requirements... *" 
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              ></textarea>
              
              {/* Turnstile Container - Now using explicit render with ref */}
              <div className="flex justify-center min-h-[65px]">
                <div ref={turnstileRef}></div>
              </div>
              
              {!turnstileLoaded && (
                <p className="text-sm text-gray-400 text-center">Loading security verification...</p>
              )}
              
              <button 
                type="submit"
                disabled={submitting || !turnstileLoaded}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Submit Inquiry</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-gray-400 py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="https://i.postimg.cc/mrNHcz4K/copy-reduced-logo-removebg-preview.png" 
              alt="Integro Systems Logo" 
              className="h-20 hover:scale-105 transition-transform"
            />
          </div>
          <p className="mb-4 text-lg">Enterprise IT Support, Automation & Security Solutions</p>
          <p className="text-sm text-gray-500">© 2026 Integro Systems. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(10px, 10px);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(20, 184, 166, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(20, 184, 166, 0.5), 0 0 60px rgba(59, 130, 246, 0.4);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }

        .animate-move {
          animation: move 20s ease-in-out infinite alternate;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-pulse-border {
          animation: pulse-border 3s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animated-gradient-text {
          background: linear-gradient(90deg, #06b6d4, #14b8a6, #22d3ee, #06b6d4);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 4s ease infinite;
          filter: drop-shadow(0 0 40px rgba(6, 182, 212, 0.6));
        }
      `}</style>
    </div>
  );
}
