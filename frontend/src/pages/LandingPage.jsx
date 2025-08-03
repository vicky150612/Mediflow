import "../index.css";
import Doctor3D from "../components/Doctor3D";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        icon: "📋",
        title: "Access Control",
        desc: "Patients have complete control over their medical records. Grant or revoke access to healthcare providers with a simple click, ensuring privacy and security.",
        highlight: "One-click control"
    },
    {
        icon: "📨",
        title: "Instant Communication",
        desc: "Seamless communication between doctors and reception staff. Share prescriptions, test orders, and patient updates instantly without delays.",
        highlight: "Real-time sharing"
    },
    {
        icon: "🎙️",
        title: "Voice Recording",
        desc: "Doctors can record voice notes and prescriptions, which the patient can playback at any time.",
        highlight: "Hands-free workflow"
    },
    {
        icon: "🤖",
        title: "AI Assistant",
        desc: "Intelligent AI provides patients with clear, easy-to-understand explanations of diagnoses, treatment plans, and medical procedures in plain language.",
        highlight: "Simplified explanations"
    },
    {
        icon: "🗂️",
        title: "Storage",
        desc: "All medical documents, reports, and prescriptions are stored in an accessible location. Access your files anytime, anywhere with complete peace of mind.",
        highlight: "Bank-level security"
    }
];

const LandingPage = () => {
    const [is3DModelLoaded, setIs3DModelLoaded] = useState(false);
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const buttonRef = useRef(null);
    const featuresRef = useRef(null);
    const cardsRef = useRef([]);
    const doctor3DRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        cardsRef.current = [];

        const tl = gsap.timeline();

        tl.from(titleRef.current, { y: 50, opacity: 0, duration: 1, ease: 'power3.out' })
            .from(subtitleRef.current, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
            .from(buttonRef.current, { y: 20, opacity: 0, duration: 0.6 }, '-=0.4');

        const featuresH2 = featuresRef.current?.querySelector('h2');
        if (featuresH2) {
            gsap.from(featuresH2, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: 'top 80%',
                }
            });
        }

        gsap.from(cardsRef.current.filter(Boolean), {
            scale: 0.9,
            opacity: 0,
            y: 40,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: {
                trigger: featuresRef.current?.querySelector('.grid'),
                start: 'top 75%'
            }
        });

        if (doctor3DRef.current) {
            gsap.to(doctor3DRef.current, { y: -10, yoyo: true, repeat: -1, duration: 2, ease: 'power2.inOut', delay: 1 });
        }

        tl.eventCallback("onComplete", () => {
            if (buttonRef.current) gsap.set(buttonRef.current, { opacity: 1 });
        });

        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    cardsRef.current = [];

    return (
        <div className="min-h-screen bg-[#0a0b0f] text-gray-100">
            <nav className="max-w-6xl mx-auto flex justify-between items-center py-6 px-4">
                <span className="text-2xl font-bold text-blue-400 cursor-pointer">Mediflow</span>
                <div className="space-x-6">
                    <button className="font-medium hover:text-blue-400 transition-colors duration-200 cursor-pointer" onClick={() => navigate('/login')}>Log In</button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-lg transition-all duration-200 cursor-pointer" onClick={() => navigate('/signup')}>Sign Up</button>
                </div>
            </nav>

            <header ref={heroRef} className="flex flex-col-reverse lg:flex-row items-center max-w-6xl mx-auto px-4 py-20 gap-12">
                <div className="flex-1 space-y-6">
                    <h1 ref={titleRef} className="text-5xl lg:text-6xl font-extrabold leading-tight">
                        Simplify Healthcare
                        <br />with <span className="text-blue-400">Mediflow</span>
                    </h1>
                    <p ref={subtitleRef} className="text-lg text-gray-300 max-w-lg">
                        A unified platform for doctors, receptionists, and patients to collaborate seamlessly. From AI-powered insights to instant notifications—everything you need to deliver exceptional care.
                    </p>
                    <div className="flex space-x-4">
                        <button
                            ref={buttonRef}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-7 rounded-lg shadow-lg transition hover:scale-105 cursor-pointer"
                            onClick={() => navigate('/signup')}>
                            Get Started Free
                        </button>
                    </div>
                </div>
                <div ref={doctor3DRef} className="flex-1 flex justify-center items-center min-h-[400px] relative">
                    {!is3DModelLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    )}
                    <div className={`transition-opacity duration-500 ${is3DModelLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <Doctor3D onLoad={() => setIs3DModelLoaded(true)} />
                    </div>
                </div>
            </header>

            <section ref={featuresRef} className="py-16 bg-[#16171e]">
                <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                ref={el => cardsRef.current[i] = el}
                                className="bg-white/5 backdrop-blur-md rounded-xl p-6 flex flex-col items-start hover:shadow-lg hover:shadow-blue-500/20 transition-transform duration-300"
                            >
                                <div className="text-4xl mb-4" aria-label={f.title + " icon"}>{f.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                                <p className="text-gray-300 text-sm transition-all duration-300 ease-in-out">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="bg-[#0a0b0f] border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-blue-400">Mediflow</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Revolutionizing healthcare workflows with AI-powered solutions for medical professionals and patients.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                                    {/* LinkedIn SVG */}
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                </a>
                                <a href="#" aria-label="GitHub" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                                    {/* GitHub SVG */}
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0.297C5.373 0.297 0 5.67 0 12.297c0 5.285 3.438 9.773 8.207 11.387.6.111.793-.26.793-.577 0-.285-.011-1.04-.017-2.042-3.338.726-4.042-1.611-4.042-1.611-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.304-5.467-1.332-5.467-5.932 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.625-5.479 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .32.192.694.801.576C20.565 22.067 24 17.578 24 12.297c0-6.627-5.373-12-12-12z" /></svg>
                                </a>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-white font-semibold">Product</h3>
                            <ul className="space-y-2 text-sm">
                                <li key="features"><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Features</a></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-white font-semibold">Support</h3>
                            <ul className="space-y-2 text-sm">
                                <li key="contact"><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Contact Us</a></li>
                                <li key="bug"><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Report a bug</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-gray-400 text-sm">
                            © 2025 Mediflow. All rights reserved.
                        </p>
                        <div className="flex space-x-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
