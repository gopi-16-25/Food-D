import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBell, FaSearch, FaCircle, FaUser, FaTruck, FaQuoteLeft, FaGift, FaKey, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { getAdminNotifications } from '../../services/api';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageHelper';
import toast from 'react-hot-toast';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem(`notifs_${user?._id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(() => {
        const saved = localStorage.getItem(`unread_${user?._id}`);
        return saved ? parseInt(saved) : 0;
    });
    const dropdownRef = useRef(null);

    // Save notifications to localStorage when they change
    useEffect(() => {
        if (user?._id) {
            localStorage.setItem(`notifs_${user._id}`, JSON.stringify(notifications));
            localStorage.setItem(`unread_${user._id}`, unreadCount.toString());
        }
    }, [notifications, unreadCount, user?._id]);

    useEffect(() => {
        if (!user) return;

        // Join private room for targeted notifications
        socket.emit('join', user._id);

        // --- ROLE BASED NOTIFICATION LOGIC ---

        // 1. New Request (For Donor)
        const handleNewRequest = (data) => {
            if (user.role === 'donor') {
                const msg = `New request for your ${data.foodType}!`;
                addNotification({
                    message: msg,
                    type: 'new_request',
                    time: new Date(),
                    status: 'pending'
                });
                toast.success(msg, { icon: '🎁' });
            }
        };

        // 2. OTP Generated (For Donor/Recipient)
        const handlePickupOtp = (data) => {
            if (user.role === 'donor') {
                const msg = `Pickup OTP Generated: ${data.otp}`;
                addNotification({
                    message: `Volunteer arrived! Use OTP: ${data.otp}`,
                    type: 'otp',
                    time: new Date(),
                    status: 'active'
                });
                toast('Volunteer is there for pickup!', { icon: '🔑' });
            }
        };

        const handleDeliveryOtp = (data) => {
            if (user.role === 'recipient') {
                const msg = `Your food is here! OTP: ${data.otp}`;
                addNotification({
                    message: msg,
                    type: 'otp',
                    time: new Date(),
                    status: 'active'
                });
                toast.success(msg, { icon: '🔑', duration: 10000 });
            }
        };

        // 3. Generic Updates (Approvals, Assignments, Progress)
        const handleUpdate = (data) => {
            let msg = '';
            let icon = '🔔';

            // Perspective: Recipient
            if (user.role === 'recipient') {
                if (data.type === 'request_approved') {
                    msg = `Your request for ${data.foodType} was approved!`;
                    icon = '✅';
                } else if (data.type === 'request_rejected') {
                    msg = `Sorry, your request for ${data.foodType} was declined.`;
                    icon = '❌';
                } else if (data.status === 'assigned') {
                    msg = `A volunteer has been assigned to your gift!`;
                    icon = '🚚';
                } else if (data.status === 'picked') {
                    msg = `Your gift is on the way!`;
                    icon = '📦';
                } else if (data.type === 'partial_reservation') {
                    msg = `Hurry! Someone else just requested ${data.foodType}.`;
                    icon = '🔥';
                }
            }

            // Perspective: Donor
            if (user.role === 'donor') {
                if (data.status === 'assigned') {
                    msg = `Volunteer assigned for your ${data.foodType}.`;
                    icon = '🤝';
                } else if (data.status === 'completed') {
                    msg = `Mission Accomplished! Handed over to recipient.`;
                    icon = '💖';
                }
            }

            // Perspective: Volunteer
            if (user.role === 'volunteer') {
                if (data.status === 'requested' && data.type === 'approval') {
                    msg = `New mission available nearby!`;
                    icon = '📍';
                } else if (data.type === 'partial_reservation') {
                    // Update: Volunteer might care if quantity changes, but maybe not a toast
                }
            }

            if (msg) {
                addNotification({
                    message: msg,
                    type: data.type || 'update',
                    time: new Date(),
                    status: data.status || 'info'
                });
                toast(msg, { icon });
            }
        };

        socket.on('newRequestReceived', handleNewRequest);
        socket.on('pickupOtpGenerated', handlePickupOtp);
        socket.on('deliveryOtpGenerated', handleDeliveryOtp);
        socket.on('donationUpdated', handleUpdate);

        // Click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            socket.off('newRequestReceived', handleNewRequest);
            socket.off('pickupOtpGenerated', handlePickupOtp);
            socket.off('deliveryOtpGenerated', handleDeliveryOtp);
            socket.off('donationUpdated', handleUpdate);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [user]);

    const addNotification = (notif) => {
        const fullNotif = { ...notif, _id: Date.now(), read: false };
        setNotifications(prev => [fullNotif, ...prev].slice(0, 20)); // Keep last 20
        setUnreadCount(prev => prev + 1);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            setUnreadCount(0);
            // Mark all currently visible as read
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const getTitle = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const path = pathSegments.pop();

        if (path === 'orders') return 'Order Management';
        if (path === 'analytics' && user?.role === 'admin') return 'Analytics & Reports';
        if (path === 'overview') return `${user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Overview`;
        if (path === 'donations') return 'My Donations';
        if (path === 'requests') return 'My Requests';
        if (path === 'available') return 'Available Missions';
        if (path === 'deliveries') return 'My Deliveries';

        return 'Dashboard';
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'otp': return <FaKey className="text-orange-500" />;
            case 'new_request': return <FaGift className="text-indigo-500" />;
            case 'request_approved': return <FaCheckCircle className="text-emerald-500" />;
            case 'request_rejected': return <FaExclamationTriangle className="text-red-500" />;
            default: return <FaBell className="text-blue-500" />;
        }
    };

    return (
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex justify-between items-center sticky top-0 z-20 backdrop-blur-sm bg-opacity-90 shrink-0">
            <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">{getTitle()}</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">
                    System Hub — {user?.name?.split(' ')[0]}
                </p>
            </div>

            <div className="flex items-center space-x-6">
                <div className="relative" ref={dropdownRef}>
                    <div
                        className={`relative cursor-pointer transition-all p-3 rounded-2xl ${unreadCount > 0 ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        onClick={toggleNotifications}
                    >
                        <FaBell className="text-xl" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-white animate-bounce">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>

                    {showNotifications && (
                        <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up origin-top-right ring-1 ring-gray-100/50">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-gray-800 text-sm tracking-tight">Recent Activity</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Real-time alerts</p>
                                </div>
                                <button
                                    onClick={clearNotifications}
                                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="max-h-[30rem] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center">
                                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl text-gray-200 mb-4 shadow-inner">📭</div>
                                        <p className="text-sm font-bold text-gray-400">All caught up!</p>
                                        <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest mt-1">No new alerts found</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`p-5 border-b border-gray-50 transition-all flex items-start space-x-4 cursor-pointer hover:bg-gray-50 group ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                {getNotifIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-800 leading-snug">{notif.message}</p>
                                                <div className="flex items-center mt-1.5 space-x-2">
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                                        {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {!notif.read && <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse"></span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 text-center border-t border-gray-50 bg-gray-50/30">
                                <button className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] hover:text-gray-800 transition-colors">
                                    View Detailed Logs
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="flex items-center space-x-3 pl-6 border-l border-gray-100 cursor-pointer group"
                    onClick={() => navigate('/dashboard/profile')}
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-gray-800 leading-none">{user?.name?.split(' ')[0]}</p>
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">{user?.role}</p>
                    </div>
                    <div className="h-11 w-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:shadow-indigo-200 transition-all border-2 border-white overflow-hidden transform group-hover:-translate-y-1">
                        {user?.avatar ? (
                            <img
                                src={getImageUrl(user.avatar)}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            user?.name?.charAt(0)?.toUpperCase() || 'A'
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
