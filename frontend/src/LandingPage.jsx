import React, { useState, useEffect, useRef } from 'react';
import {
    Leaf,
    Users,
    Calendar,
    MapPin,
    Shield,
    Clock,
    TrendingUp,
    Heart,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Menu,
    X,
    Star,
    Truck,
    Phone,
    Mail,
    Globe,
    Award,
    Target,
    Zap
} from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate('/login');
    }
    useEffect(() => {
        if (user) {
            if (!user.isProfileComplete) {
                navigate('/select-role');
            } else if (user.role === 'recipient') {
                navigate('/recipient');
            } else if (user.role === 'volunteer') {
                navigate('/volunteer');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);



    useEffect(() => {
        const handleScroll = () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('bg-white', 'shadow-lg');
                    navbar.classList.remove('bg-transparent');
                } else {
                    navbar.classList.remove('bg-white', 'shadow-lg');
                    navbar.classList.add('bg-transparent');
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} scrollToSection={scrollToSection} />
            <HeroSection scrollToSection={scrollToSection} />
            <ProblemStatement />
            <AboutProject />
            <WhoWeAre />
            <HowItWorks />
            <Features />
            <Testimonials />
            <CallToAction />
            <Footer />
        </div>
    );
};

// Navbar Component
const Navbar = ({ isMenuOpen, setIsMenuOpen, scrollToSection }) => {
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate('/login');
    }
    const navLinks = [
        { name: 'Home', id: 'home' },
        { name: 'Problem', id: 'problem' },
        { name: 'About', id: 'about' },
        { name: 'How It Works', id: 'how-it-works' },
        { name: 'Features', id: 'features' },
    ];

    return (
        <nav id="navbar" className="fixed top-0 w-full z-50 transition-all duration-300 bg-transparent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollToSection('home')}>
                        <Leaf className="h-8 w-8 text-green-600" />
                        <span className="text-xl font-bold text-gray-800">FoodConnect</span>
                    </div>

                    <div className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => scrollToSection(link.id)}
                                className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium"
                            >
                                {link.name}
                            </button>
                        ))}
                        <button onClick={goToLogin} className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all duration-200 transform hover:scale-105">
                            Get Started
                        </button>
                    </div>

                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden bg-white rounded-lg shadow-xl mt-2 py-4">
                        {navLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => scrollToSection(link.id)}
                                className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                            >
                                {link.name}
                            </button>
                        ))}
                        <div className="px-6 py-3">
                            <button onClick={goToLogin} className="w-full bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

// CountUp Animation Component
const CountUp = ({ end, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let start = 0;
                    const increment = end / (duration / 16);
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= end) {
                            setCount(end);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(start));
                        }
                    }, 16);
                    return () => clearInterval(timer);
                }
            },
            { threshold: 0.5 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return (
        <span ref={countRef}>
            {count}{suffix}
        </span>
    );
};

// Hero Section with Particle Background
const HeroSection = ({ scrollToSection }) => {
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate('/login');
    }
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated Particle Background */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50"></div>
                <div className="particles-container">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 10}s`,
                                animationDuration: `${5 + Math.random() * 10}s`,
                                width: `${2 + Math.random() * 6}px`,
                                height: `${2 + Math.random() * 6}px`,
                                opacity: 0.1 + Math.random() * 0.3,
                            }}
                        />
                    ))}
                </div>
                {/* Floating Leaves */}
                <div className="floating-leaves">
                    <Leaf className="leaf leaf-1 text-green-400" />
                    <Leaf className="leaf leaf-2 text-green-500" />
                    <Leaf className="leaf leaf-3 text-green-300" />
                    <Leaf className="leaf leaf-4 text-green-400" />
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="animate-fade-in-up">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Reduce Food Waste.
                            <span className="text-green-600"> Feed Lives.</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Connecting donors, volunteers, and beneficiaries in real-time to ensure no food goes to waste.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={goToLogin} className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                                Get Started
                            </button>
                            <button
                                onClick={() => scrollToSection('problem')}
                                className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold border-2 border-green-600 hover:bg-green-50 transition-all duration-200"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>

                {/* Animated Stats */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                        <div className="text-4xl font-bold text-green-600">
                            <CountUp end={30} suffix="%" />
                        </div>
                        <div className="text-gray-600 mt-2">Food Saved from Waste</div>
                        <div className="text-sm text-green-500 mt-2">↑ 15% this year</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                        <div className="text-4xl font-bold text-green-600">
                            <CountUp end={10000} suffix="+" />
                        </div>
                        <div className="text-gray-600 mt-2">Meals Delivered</div>
                        <div className="text-sm text-green-500 mt-2">↑ 200% growth</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                        <div className="text-4xl font-bold text-green-600">
                            <CountUp end={500} suffix="+" />
                        </div>
                        <div className="text-gray-600 mt-2">Active Volunteers</div>
                        <div className="text-sm text-green-500 mt-2">Growing daily</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Problem Statement Section with Scroll Animation
const ProblemStatement = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const problems = [
        {
            icon: <TrendingUp className="h-12 w-12 text-red-500" />,
            title: "Food Wastage",
            description: "India wastes 67 million tons of food annually, enough to feed the entire state of Bihar for a year."
        },
        {
            icon: <Heart className="h-12 w-12 text-orange-500" />,
            title: "Hunger Crisis",
            description: "Despite food waste, 189 million people in India go hungry every day due to lack of access."
        },
        {
            icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
            title: "Poor Coordination",
            description: "Lack of real-time communication between donors, NGOs, and beneficiaries leads to food spoilage."
        }
    ];

    return (
        <section id="problem" className="py-20 bg-gray-50" ref={sectionRef}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        The Challenge We Face
                    </h2>
                    <p className="text-lg text-gray-600">
                        India faces a paradoxical crisis where tons of food are wasted daily while millions struggle with hunger.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {problems.map((problem, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                                }`}
                            style={{ transitionDelay: `${index * 200}ms` }}
                        >
                            <div className="flex justify-center mb-4">{problem.icon}</div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-3">{problem.title}</h3>
                            <p className="text-gray-600 text-center">{problem.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// About Project Section - Redesigned
const AboutProject = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const highlights = [
        { icon: <Clock className="h-6 w-6" />, text: "Real-time food listing" },
        { icon: <CheckCircle className="h-6 w-6" />, text: "Request system" },
        { icon: <Truck className="h-6 w-6" />, text: "Volunteer delivery" },
        { icon: <Shield className="h-6 w-6" />, text: "Secure OTP verification" },
        { icon: <MapPin className="h-6 w-6" />, text: "Location-based matching" },
    ];

    return (
        <section id="about" className="py-20 bg-white" ref={sectionRef}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            About The Project
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            A web-based platform that connects donors, recipients, and volunteers in real-time to ensure efficient food distribution and reduce waste.
                        </p>
                        <div className="space-y-4">
                            {highlights.map((item, index) => (
                                <div key={index} className="flex items-center space-x-3 group">
                                    <div className="text-green-600 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                                    <span className="text-gray-700">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`relative transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                        {/* Redesigned Static Design */}
                        <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-8 shadow-2xl">
                            <div className="bg-white rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-2">
                                        <Award className="h-6 w-6 text-green-600" />
                                        <span className="font-semibold text-gray-800">Impact Stats</span>
                                    </div>
                                    <Zap className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-600">CO₂ Reduced</p>
                                                <p className="text-2xl font-bold text-green-600">2,500 kg</p>
                                            </div>
                                            <Leaf className="h-8 w-8 text-green-500" />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-600">Active NGOs</p>
                                                <p className="text-2xl font-bold text-green-600">150+</p>
                                            </div>
                                            <Users className="h-8 w-8 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-600">Cities Covered</p>
                                                <p className="text-2xl font-bold text-green-600">25+</p>
                                            </div>
                                            <Target className="h-8 w-8 text-purple-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>⭐ 4.9 Rating</span>
                                        <span>✓ Trusted Platform</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Who We Are Section with Scroll Animation
const WhoWeAre = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50" ref={sectionRef}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Who We Are</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        A passionate team of developers and social entrepreneurs building technology for social impact.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="text-green-600 mb-4">
                                <Globe className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
                            <p className="text-gray-600">
                                Reduce food waste and improve food distribution using innovative technology solutions.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="text-green-600 mb-4">
                                <Heart className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
                            <p className="text-gray-600">
                                A hunger-free and waste-free society where no food goes to waste and no one sleeps hungry.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// How It Works Section with Scroll Animation
const HowItWorks = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const steps = [
        {
            step: "01",
            title: "Donor Uploads Food",
            description: "Restaurants, events, or individuals post available surplus food with details.",
        },
        {
            step: "02",
            title: "Recipient Requests",
            description: "NGOs or individuals in need request the food through the platform.",
        },
        {
            step: "03",
            title: "Donor Approves",
            description: "Donor reviews and approves the most suitable request.",
        },
        {
            step: "04",
            title: "Volunteer Accepts",
            description: "Nearby volunteers accept delivery tasks for food pickup and drop-off.",
        },
        {
            step: "05",
            title: "OTP Verification",
            description: "Secure OTP confirms successful delivery to the recipient.",
        }
    ];

    return (
        <section id="how-it-works" className="py-20 bg-white" ref={sectionRef}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                    <p className="text-lg text-gray-600">
                        Simple 5-step process to reduce food waste and feed those in need
                    </p>
                </div>

                <div className="relative">
                    <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-16 w-4/5 h-1 bg-gradient-to-r from-green-200 via-green-400 to-green-200"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`relative transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                                    }`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-green-600">{step.step}</span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                                    <p className="text-gray-600 text-sm">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <ArrowRight className="h-6 w-6 text-green-400 animate-pulse" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// Features Section with Scroll Animation
const Features = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: <Clock className="h-10 w-10" />,
            title: "Real-Time Coordination",
            description: "Instant updates and notifications for all stakeholders in the food distribution chain."
        },
        {
            icon: <MapPin className="h-10 w-10" />,
            title: "Location-Based Matching",
            description: "Smart algorithms connect nearby donors, volunteers, and recipients automatically."
        },
        {
            icon: <Shield className="h-10 w-10" />,
            title: "OTP Secure Delivery",
            description: "End-to-end verification system ensuring food reaches the right hands."
        },
        {
            icon: <Users className="h-10 w-10" />,
            title: "User-Friendly Interface",
            description: "Intuitive design makes it easy for everyone to use regardless of technical skill."
        },
        {
            icon: <TrendingUp className="h-10 w-10" />,
            title: "Scalable System",
            description: "Built to handle growing number of users and food donations across cities."
        },
        {
            icon: <Heart className="h-10 w-10" />,
            title: "Impact Tracking",
            description: "Real-time analytics showing meals saved and carbon footprint reduced."
        }
    ];

    return (
        <section id="features" className="py-20 bg-gray-50" ref={sectionRef}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
                    <p className="text-lg text-gray-600">
                        Everything you need to manage food donation and distribution efficiently
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                                }`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Testimonials Section
const Testimonials = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const testimonials = [
        {
            name: "Priya Sharma",
            role: "Restaurant Owner (Donor)",
            content: "I can now donate food easily without waste. The platform makes it simple to connect with nearby NGOs.",
            rating: 5,
        },
        {
            name: "Rahul Verma",
            role: "Volunteer",
            content: "Helping people has never been this organized. The real-time coordination and OTP system ensure smooth deliveries.",
            rating: 5,
        },
        {
            name: "Meera Devi",
            role: "Beneficiary",
            content: "This platform helped me get food on time for my family. The volunteers are very kind and punctual.",
            rating: 5,
        }
    ];

    return (
        <section className="py-20 bg-white" ref={sectionRef}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What People Say</h2>
                    <p className="text-lg text-gray-600">
                        Real stories from our community making a difference
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                                }`}
                            style={{ transitionDelay: `${index * 200}ms` }}
                        >
                            <div className="flex mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                            <div>
                                <p className="font-bold text-gray-900">{testimonial.name}</p>
                                <p className="text-sm text-gray-500">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Call To Action Section
const CallToAction = () => {
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate('/login');
    }
    return (
        <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Join Us in Reducing Food Waste</h2>
                <p className="text-xl text-white mb-8 opacity-90">
                    Together we can make a difference - one meal at a time
                </p>
                <button onClick={goToLogin} className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Start Donating Now
                </button>
            </div>
        </section>
    );
};

// Footer
const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Leaf className="h-8 w-8 text-green-400" />
                            <span className="text-xl font-bold">FoodConnect</span>
                        </div>
                        <p className="text-gray-400">
                            Real-time food donation platform connecting donors, volunteers, and beneficiaries.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="#home" className="text-gray-400 hover:text-green-400 transition-colors">Home</a></li>
                            <li><a href="#problem" className="text-gray-400 hover:text-green-400 transition-colors">Problem</a></li>
                            <li><a href="#about" className="text-gray-400 hover:text-green-400 transition-colors">About</a></li>
                            <li><a href="#features" className="text-gray-400 hover:text-green-400 transition-colors">Features</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Contact</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-400">gopimaries@gmail.com</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-400">+91 9994920208</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                                <FaFacebook className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                                <FaTwitter className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                                <FaInstagram className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                                <FaLinkedin className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center">
                    <p className="text-gray-400">
                        &copy; 2026 FoodConnect. All rights reserved. Making a difference together.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default LandingPage;