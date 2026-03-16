import { useState, useEffect, Fragment } from 'react';
import { getMyDonations, handleDonationRequestAction } from '../../services/api';
import { socket } from '../../services/socket';
import { FaSearch, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaPhone, FaKey, FaCheckCircle, FaClipboardList, FaUser, FaTruck, FaBoxOpen, FaClock, FaUsers, FaArrowRight, FaShieldAlt, FaExternalLinkAlt, FaUtensils, FaHourglassHalf } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DonorDonations = () => {
    const [donations, setDonations] = useState([]);
    const [filteredDonations, setFilteredDonations] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
    const [visibleCount, setVisibleCount] = useState(15);

    useEffect(() => {
        fetchDonations();

        const handleUpdate = (data) => {
            fetchDonations();
        };

        socket.on('donationUpdated', handleUpdate);
        socket.on('pickupOtpGenerated', handleUpdate);
        socket.on('newRequestReceived', handleUpdate);

        return () => {
            socket.off('donationUpdated', handleUpdate);
            socket.off('pickupOtpGenerated', handleUpdate);
            socket.off('newRequestReceived', handleUpdate);
        };
    }, []);

    useEffect(() => {
        filterData();
    }, [search, statusFilter, donations]);

    const fetchDonations = async () => {
        try {
            const { data } = await getMyDonations();
            setDonations(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const filterData = () => {
        let temp = [...donations];
        if (statusFilter !== 'all') {
            temp = temp.filter(d => d.status === statusFilter);
        }
        if (search) {
            temp = temp.filter(d =>
                d.foodType.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFilteredDonations(temp);
        setVisibleCount(15);
    };

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleAction = async (requestId, action) => {
        try {
            await handleDonationRequestAction(requestId, action);
            toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}`);
            fetchDonations();
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
        }
    };

    const stats = {
        total: donations.length,
        completed: donations.filter(d => ['completed', 'delivered'].includes(d.status)).length,
        active: donations.filter(d => ['posted', 'requested', 'assigned', 'picked'].includes(d.status)).length,
        peopleHelped: donations.filter(d => ['completed', 'delivered'].includes(d.status)).length
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            pending_approval: 'bg-orange-50 text-orange-700 border-orange-100',
            posted: 'bg-yellow-50 text-yellow-700 border-yellow-100',
            requested: 'bg-blue-50 text-blue-700 border-blue-100',
            assigned: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            picked: 'bg-purple-50 text-purple-700 border-purple-100',
            delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            expired: 'bg-red-50 text-red-700 border-red-100',
        };
        return (
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[1.5px] border ${styles[status] || 'bg-gray-50'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const getExpiryTime = (date) => {
        const diff = new Date(date) - new Date();
        if (diff <= 0) return "Expired";
        const hours = Math.floor(diff / 36e5);
        if (hours < 1) return "Expiring soon";
        return `${hours}h left`;
    };

    const latestOrder = filteredDonations[0];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading donor dashboard...</div>;

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto animate-fade-in-up">

            {/* STATS CARDS - COMPACT & PREMIUM */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Gifted', val: stats.total, icon: <FaBoxOpen />, color: 'blue' },
                    { label: 'Completed', val: stats.completed, icon: <FaCheckCircle />, color: 'emerald' },
                    { label: 'Live Alerts', val: stats.active, icon: <FaHourglassHalf />, color: 'amber' },
                    { label: 'Social Impact', val: stats.peopleHelped, icon: <FaUsers />, color: 'purple' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className={`absolute -right-4 -top-4 text-${s.color}-50 text-8xl transition-all group-hover:scale-110 group-hover:-rotate-12`}>{s.icon}</div>
                        <div className="relative z-10">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <h3 className="text-4xl font-black text-gray-800">{s.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* TOP PROGRESS TRACKER (CONSISTENCY WITH ADMIN) */}
            {latestOrder && (
                <div className="bg-white p-8 px-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-gray-50">
                        <div>
                            <h4 className="text-xl font-black text-gray-800">Latest Donation Status</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{latestOrder.foodType} — {latestOrder.quantity} units</p>
                        </div>
                        <StatusBadge status={latestOrder.status} />
                    </div>

                    <div className="relative flex justify-between items-center max-w-5xl mx-auto pt-4 pb-10">
                        <div className="absolute top-[48px] left-[5rem] right-[5rem] h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-1000"
                                style={{
                                    width: latestOrder.status === 'completed' || latestOrder.status === 'delivered' ? '100%'
                                        : latestOrder.status === 'picked' ? '66%'
                                            : latestOrder.status === 'assigned' || latestOrder.status === 'requested' ? '33%'
                                                : '0%'
                                }}
                            />
                        </div>

                        {[
                            { label: 'Posted', icon: <FaClipboardList />, active: true, date: latestOrder.createdAt },
                            { label: 'Assigned', icon: <FaUser />, active: ['assigned', 'picked', 'delivered', 'completed'].includes(latestOrder.status), date: latestOrder.assignedAt },
                            { label: 'Picked Up', icon: <FaTruck />, active: ['picked', 'delivered', 'completed'].includes(latestOrder.status), date: latestOrder.pickedAt },
                            { label: 'Delivered', icon: <FaCheckCircle />, active: ['delivered', 'completed'].includes(latestOrder.status), date: latestOrder.deliveredAt }
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col items-center relative z-10 w-32">
                                <div className={`w-14 h-14 rounded-full border-[3px] shadow-sm flex items-center justify-center transition-all duration-500 bg-white ${step.active ? 'border-emerald-500 text-emerald-600 scale-110' : 'border-gray-50 text-gray-200'}`}>
                                    <div className="text-lg">{step.icon}</div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${step.active ? 'text-gray-800' : 'text-gray-300'}`}>{step.label}</p>
                                    {step.active && step.date && (
                                        <div className="mt-1 opacity-60">
                                            <p className="text-[8px] font-black text-gray-400 uppercase">{new Date(step.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                            <p className="text-[8px] font-black text-gray-400 uppercase">{new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-full lg:w-1/3">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Filter my donations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-4 focus:ring-emerald-500/10 text-sm"
                    />
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                    {['all', 'posted', 'pending_approval', 'requested', 'assigned', 'completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'bg-white text-gray-400 border border-gray-100 hover:bg-emerald-50'
                                }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* DENSE DATA TABLE */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1100px] border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[2px] border-b border-gray-100">
                                <th className="px-10 py-6">Mission Overview</th>
                                <th className="px-6 py-6 text-center">Status</th>
                                <th className="px-10 py-6">Recipient Agent</th>
                                <th className="px-10 py-6">Volunteer Hero</th>
                                <th className="px-10 py-6">Dates & Expiry</th>
                                <th className="px-10 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDonations.slice(0, visibleCount).map(donation => (
                                <Fragment key={donation._id}>
                                    <tr
                                        className={`group transition-all cursor-pointer ${expandedRow === donation._id ? 'bg-emerald-50/40' : 'hover:bg-gray-50/50'}`}
                                        onClick={() => toggleRow(donation._id)}
                                    >
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-5">
                                                <div className="h-12 w-12 bg-white text-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-sm border border-emerald-50 group-hover:scale-110 transition-transform">
                                                    <FaUtensils />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-800 capitalize leading-tight">{donation.foodType}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{donation.quantity} units committed</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <StatusBadge status={donation.status} />
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black border border-emerald-200 capitalize">
                                                    {donation.recipient ? donation.recipient.name.charAt(0) : 'W'}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{donation.recipient ? donation.recipient.name : 'Waiting...'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black border border-indigo-200 capitalize">
                                                    {donation.volunteer ? donation.volunteer.name.charAt(0) : 'S'}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{donation.volunteer ? donation.volunteer.name : 'Searching...'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col text-[10px]">
                                                <span className="font-bold text-gray-600">{new Date(donation.createdAt).toLocaleDateString()}</span>
                                                <span className={`font-black uppercase tracking-tighter mt-0.5 ${getExpiryTime(donation.expiryDate).includes('Expiring') ? 'text-orange-500' : 'text-gray-400'}`}>
                                                    {getExpiryTime(donation.expiryDate)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${expandedRow === donation._id ? 'bg-gray-800 text-white shadow-xl rotate-180' : 'bg-gray-50 text-gray-300 hover:text-emerald-500'}`}>
                                                <FaChevronDown className="text-xs" />
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedRow === donation._id && (
                                        <tr className="bg-emerald-50/10 border-t border-gray-100">
                                            <td colSpan="6" className="p-0 animate-fade-in">
                                                <div className="px-10 py-10 space-y-10">
                                                    {/* PENDING APPROVALS SECTION */}
                                                    {donation.subRequests && donation.subRequests.filter(r => r.status === 'pending_approval').length > 0 && (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center space-x-3 mb-2">
                                                                <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                                                                <h5 className="text-[11px] font-black text-orange-600 uppercase tracking-[2px]">Awaiting Your Confirmation</h5>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {donation.subRequests.filter(r => r.status === 'pending_approval').map(req => (
                                                                    <div key={req._id} className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all">
                                                                        <div className="flex items-center space-x-6">
                                                                            <div className="h-14 w-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner">{req.quantity}</div>
                                                                            <div>
                                                                                <p className="font-black text-gray-800 text-base">{req.recipient?.name}</p>
                                                                                <div className="flex items-center mt-1 space-x-3">
                                                                                    <span className="text-[10px] text-gray-400 font-bold flex items-center"><FaMapMarkerAlt className="mr-1.5 text-orange-500" /> {req.recipientLocation?.address?.split(',')[0]}</span>
                                                                                    <span className="text-[10px] text-gray-300 font-bold">|</span>
                                                                                    <span className="text-[10px] text-gray-400 font-bold">Request received {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex space-x-2">
                                                                            <button onClick={() => handleAction(req._id, 'approve')} className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all">Approve</button>
                                                                            <button onClick={() => handleAction(req._id, 'reject')} className="px-6 py-3 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-100 hover:bg-red-50 hover:text-red-500 transition-all">Decline</button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* ACTIVE MISSIONS SECTION */}
                                                    {donation.subRequests && donation.subRequests.filter(r => r.status !== 'pending_approval' && r.status !== 'expired').length > 0 && (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center space-x-3 mb-2">
                                                                <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                                                                <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-[2px]">Live Mission Feed</h5>
                                                            </div>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                {donation.subRequests.filter(r => r.status !== 'pending_approval' && r.status !== 'expired').map(req => (
                                                                    <div key={req._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5 hover:shadow-md transition-all">
                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex items-center space-x-4">
                                                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${req.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                                    {req.status === 'completed' ? '📦' : '🚚'}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-black text-gray-800">{req.quantity} Units for {req.recipient?.name}</p>
                                                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">{req.status}</p>
                                                                                </div>
                                                                            </div>
                                                                            {req.status === 'assigned' && req.pickupOtp?.code && (
                                                                                <div className="bg-emerald-600 px-4 py-2 rounded-xl shadow-lg shadow-emerald-100 group">
                                                                                    <p className="text-[8px] font-black text-white/70 uppercase tracking-widest mb-0.5">Sharing Code</p>
                                                                                    <p className="text-lg font-mono font-black text-white tracking-[4px]">{req.pickupOtp.code}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 space-y-6">
                                                                            <div className="flex items-start space-x-3 mb-2">
                                                                                <FaMapMarkerAlt className="text-emerald-500 mt-1 shrink-0" />
                                                                                <p className="text-[11px] font-bold text-gray-500 leading-relaxed italic">{req.recipientLocation?.address || 'Address not listed'}</p>
                                                                            </div>

                                                                            {/* GRANULAR TIMELINE - "ALL TIME INSTANCES" */}
                                                                            <div className="space-y-4 ml-2 border-l border-gray-100 pl-4 py-2">
                                                                                {[
                                                                                    { label: 'Request Logged', time: req.createdAt, active: true },
                                                                                    { label: 'Volunteer Assigned', time: req.assignedAt, active: ['assigned', 'picked', 'delivered', 'completed'].includes(req.status) },
                                                                                    { label: 'Picked Up from You', time: req.pickedAt, active: ['picked', 'delivered', 'completed'].includes(req.status) },
                                                                                    { label: 'Arrived at Destination', time: req.deliveredAt, active: ['delivered', 'completed'].includes(req.status) },
                                                                                    { label: 'Final Completion', time: req.completedAt, active: req.status === 'completed' }
                                                                                ].map((step, idx) => step.time && (
                                                                                    <div key={idx} className="flex items-center space-x-4 group/step">
                                                                                        <div className={`h-2.5 w-2.5 rounded-full border-2 bg-white transition-all ${step.active ? 'border-emerald-500 scale-125 shadow-sm shadow-emerald-200' : 'border-gray-200'}`}></div>
                                                                                        <div className="flex flex-col">
                                                                                            <span className={`text-[10px] font-black uppercase tracking-wider ${step.active ? 'text-gray-700' : 'text-gray-300'}`}>{step.label}</span>
                                                                                            <span className="text-[9px] font-bold text-gray-400 mt-0.5">
                                                                                                {new Date(step.time).toLocaleDateString()} at {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* EMPTY STATE WITHIN EXPANDED */}
                                                    {(!donation.subRequests || donation.subRequests.length === 0) && (
                                                        <div className="py-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                                                            <div className="text-4xl mb-3">📡</div>
                                                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Awaiting Requests</p>
                                                            <p className="text-[10px] text-gray-300 font-bold mt-1">Your donation is visible to nearby recipients</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DonorDonations;
