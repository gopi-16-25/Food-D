import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/auth/AuthLayout';
import LoginCard from '../components/auth/LoginCard';
import RoleDivider from '../components/auth/RoleDivider';

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const termsContainerRef = useRef(null);

    const { googleAuth, login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'recipient') navigate('/recipient');
            else if (user.role === 'volunteer') navigate('/volunteer');
            else navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            setHasScrolledToBottom(true);
        } else {
            setHasScrolledToBottom(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsGoogleLoading(true);
        try {
            const userData = await googleAuth(credentialResponse.credential);

            if (userData) {
                if (!userData.isProfileComplete) {
                    navigate('/select-role');
                } else if (userData.role === 'recipient') {
                    navigate('/recipient');
                } else if (userData.role === 'volunteer') {
                    navigate('/volunteer');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error("Google Auth Error:", error);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const success = await login(email, otp);
            if (success) {
                const userData = JSON.parse(localStorage.getItem('user'));
                if (userData && !userData.isProfileComplete) {
                    navigate('/select-role');
                } else if (userData?.role === 'recipient') {
                    navigate('/recipient');
                } else if (userData?.role === 'volunteer') {
                    navigate('/volunteer');
                } else {
                    navigate('/dashboard');
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isGoogleLoginEnabled = termsAccepted && hasScrolledToBottom;

    return (
        <AuthLayout>
            <LoginCard title="FoodConnect">
                <div className="space-y-6">
                    {isGoogleLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium animate-pulse">Verifying with Google...</p>
                        </div>
                    ) : (
                        <>
                            {/* Google Login Button - User */}
                            <div
                                className={`transition-opacity duration-200 ${!isGoogleLoginEnabled
                                    ? 'opacity-50 cursor-not-allowed pointer-events-none'
                                    : ''
                                    }`}
                            >
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => console.log('Login Failed')}
                                    theme="filled_blue"
                                    size="large"
                                    text="continue_with"
                                    shape="pill"
                                    logo_alignment="left"
                                    disabled={!isGoogleLoginEnabled}
                                />
                                {!isGoogleLoginEnabled && (
                                    <p className="text-xs text-center text-gray-500 mt-2">
                                        Please read and agree to the Terms & Conditions to continue
                                    </p>
                                )}
                            </div>



                            {/* Terms and Conditions Container */}
                            <div className="mt-6 border-t border-gray-200 pt-6">
                                <div className="bg-gray-50 rounded-lg overflow-hidden">
                                    <div
                                        ref={termsContainerRef}
                                        onScroll={handleScroll}
                                        className="terms-scroll-container h-48 overflow-y-auto p-4 text-sm text-gray-600 leading-relaxed"
                                        style={{ scrollBehavior: 'smooth' }}
                                    >
                                        <div className="mt-0 pt-0  text-xs text-gray-400 text-center">
                                            ↓ Scroll to the bottom to continue ↓
                                        </div>

                                        <p className="mb-4 pb-3 text-xs text-gray-400 border-b border-gray-200 text-center mt-3">
                                            By continuing, you acknowledge that you have read and agreed to these terms.
                                        </p>
                                        <h3 className="font-semibold text-gray-900 mb-3">Terms and Conditions</h3>
                                        <p className="mb-3">Last updated: {new Date().toLocaleDateString()}</p>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">1. Acceptance of Terms</h4>
                                        <p className="mb-3">
                                            By accessing and using FoodConnect, you agree to be bound by these Terms and Conditions.
                                            If you do not agree to these terms, please do not use our platform.
                                        </p>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">2. Description of Service</h4>
                                        <p className="mb-3">
                                            FoodConnect is a platform that connects food donors, volunteers, and recipients to reduce
                                            food waste and fight hunger. We facilitate redistribution of surplus food in real-time.
                                        </p>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">3. User Responsibilities</h4>
                                        <p className="mb-3">As a user of FoodConnect, you agree to:</p>
                                        <ul className="list-disc pl-5 mb-3 space-y-1">
                                            <li>Provide accurate and truthful information</li>
                                            <li>Maintain confidentiality of your account</li>
                                            <li>Comply with all applicable laws and regulations</li>
                                            <li>Not misuse or exploit the platform</li>
                                            <li>Respect other users and their rights</li>
                                        </ul>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">4. Food Safety and Quality</h4>
                                        <p className="mb-3">
                                            Donors are responsible for ensuring food safety, hygiene, and proper storage.
                                            Recipients must verify food quality before consumption. Food is provided "as is"
                                            without guarantees from the platform.
                                        </p>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">5. Legal Compliance (India)</h4>
                                        <p className="mb-3">
                                            Users must comply with all applicable laws of India. Any misuse, fraud, or unlawful activity
                                            will result in strict legal action as per Indian law.
                                        </p>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">6. Misuse and Legal Action</h4>
                                        <p className="mb-3">
                                            Any user found engaging in fraud, false representation, misuse of donations, or harmful activities
                                            may face legal consequences under Indian law.
                                        </p>

                                        <ul className="list-disc pl-5 mb-3 space-y-1">
                                            <li>Violations may be punishable under the Information Technology Act, 2000</li>
                                            <li>Fraud and cheating may attract action under IPC Sections 415 and 420</li>
                                            <li>Any harmful or negligent behavior may lead to legal liability</li>
                                        </ul>

                                        <p className="mb-3">
                                            FoodConnect reserves the right to report such activities to authorities and cooperate
                                            with law enforcement agencies.
                                        </p>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">7. Liability Disclaimer</h4>
                                        <p className="mb-3">
                                            FoodConnect acts only as an intermediary platform. We are not responsible for the quality,
                                            safety, or legality of food items. Users participate at their own risk.
                                        </p>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">8. Account Suspension</h4>
                                        <p className="mb-3">
                                            We reserve the right to suspend or terminate accounts involved in suspicious, harmful,
                                            or policy-violating activities without prior notice.
                                        </p>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">9. Privacy Policy</h4>
                                        <p className="mb-3">
                                            Your data is handled according to our Privacy Policy. By using the platform,
                                            you consent to data collection and usage.
                                        </p>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">10. Modifications</h4>
                                        <p className="mb-3">
                                            FoodConnect may update these terms at any time. Continued use of the platform
                                            indicates acceptance of updated terms.
                                        </p>

                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">11. Contact</h4>
                                        <p className="mb-3">
                                            For any questions, contact admin at gopimaries@gmail.com
                                        </p>


                                    </div>

                                    {/* Agreement Checkbox */}
                                    <div className="p-4 bg-white border-t border-gray-200">
                                        <label className="flex items-start space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                disabled={!hasScrolledToBottom}
                                                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                            <span className="text-sm text-gray-700">
                                                I have read and agree to the{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        termsContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
                                                >
                                                    Terms and Conditions
                                                </button>
                                                {' '}and{' '}
                                                <button
                                                    type="button"
                                                    className="text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
                                                >
                                                    Privacy Policy
                                                </button>
                                            </span>
                                        </label>
                                        {!hasScrolledToBottom && (
                                            <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                </svg>
                                                Please scroll to the bottom of the terms to enable agreement
                                            </p>
                                        )}
                                        {hasScrolledToBottom && !termsAccepted && (
                                            <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Please check the box to agree to the terms
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </LoginCard>
        </AuthLayout>
    );
};

export default Login;