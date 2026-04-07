import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/auth/AuthLayout';
import LoginCard from '../components/auth/LoginCard';
import RoleDivider from '../components/auth/RoleDivider';
import Button from '../components/common/Button';
import { resendOtp } from '../services/api';

// const ResendOtpButton = ({ email }) => {
//     const [timer, setTimer] = useState(30); // 30 seconds
//     const [canResend, setCanResend] = useState(false);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (timer > 0) {
//             const interval = setInterval(() => setTimer(t => t - 1), 1000);
//             return () => clearInterval(interval);
//         } else {
//             setCanResend(true);
//         }
//     }, [timer]);

//     const handleResend = async () => {
//         setLoading(true);
//         try {
//             await resendOtp(email);
//             setTimer(30);
//             setCanResend(false);
//             alert('OTP Resent Successfully');
//         } catch (error) {
//             console.error(error);
//             alert('Failed to resend OTP');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Button
//             type="button"
//             onClick={handleResend}
//             disabled={!canResend || loading}
//             isLoading={loading}
//             variant="ghost"
//             className={`w-full text-sm font-bold py-2 ${canResend ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
//         >
//             {canResend ? 'Resend OTP' : `Resend OTP in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
//         </Button>
//     );
// };

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { googleAuth, login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'recipient') navigate('/recipient');
            else if (user.role === 'volunteer') navigate('/volunteer');
            else navigate("/dashboard");
        }
    }, [user, navigate]);

    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => console.log('Login Failed')}
                                theme="filled_blue"
                                size="large"
                                text="continue_with"
                                shape="pill"
                                logo_alignment="left"
                            />

                            <RoleDivider />

                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => console.log('Admin Login Failed')}
                                theme="filled_black"
                                size="large"
                                text="signin_with"
                                shape="pill"
                                logo_alignment="left"
                            />
                        </>
                    )}
                </div>
            </LoginCard>
        </AuthLayout>
    );
};

export default Login;
