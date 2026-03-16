import { useState, useEffect, Fragment } from 'react';
import { getRecipientDashboard, completeDonation } from '../../services/api';
import { socket } from '../../services/socket';
import { FaCheck, FaTruck, FaBox, FaUserClock, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaClipboardList, FaUser, FaCheckCircle, FaClock, FaBoxOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const RecipientRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

    const fetchData = async () => {
        try {
            const { data } = await getRecipientDashboard();
            setRequests(data.timelines || []);
            setLoading(false);
        } catch (error) {
            console.error("Fetch Error:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const handleUpdate = () => fetchData();
        socket.on('donationUpdated', handleUpdate);
        return () => socket.off('donationUpdated', handleUpdate);
    }, []);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const openConfirmModal = (id, e) => {
        e.stopPropagation();
        setConfirmModal({ isOpen: true, id });
    };

    const handleConfirmDelivery = async () => {
        try {
            await completeDonation(confirmModal.id);
            toast.success("Delivery confirmed! Thank you.");
            fetchData();
        } catch (error) {
            toast.error("Failed to confirm delivery.");
        } finally {
            setConfirmModal({ isOpen: false, id: null });
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            posted: 'bg-yellow-50 text-yellow-600 border-yellow-100',
            requested: 'bg-blue-50 text-blue-600 border-blue-100',
            assigned: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            picked: 'bg-purple-50 text-purple-700 border-purple-100',
            delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
        return (
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-50'}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    const latestRequest = requests[0];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your requests...</div>;

    if (requests.length === 0) return (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm animate-fade-in-up">
            <div className="h-40 w-40 bg-gray-50 rounded-[4rem] flex items-center justify-center text-7xl mx-auto mb-8 shadow-inner">🍽️</div>
            <h3 className="text-2xl font-black text-gray-700">No Food Requested Yet</h3>
            <p className="text-gray-400 font-bold max-w-sm mx-auto mt-2">Browse nearby donations and start making a difference in your community.</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto animate-fade-in-up">

            {/* TOP PROGRESS TRACKER (RESTORED FROM SCREENSHOT PATTERN) */}
            {latestRequest && (
                <div className="bg-white p-8 px-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-gray-50">
                        <div>
                            <h4 className="text-xl font-black text-gray-800 tracking-tight">Current Request Progress</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{latestRequest.foodType} — {new Date(latestRequest.timestamps.posted).toLocaleDateString()}</p>
                        </div>
                        <StatusBadge status={latestRequest.status} />
                    </div>

                    <div className="relative flex justify-between items-center max-w-5xl mx-auto pt-4 pb-10">
                        <div className="absolute top-[48px] left-[5rem] right-[5rem] h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                style={{
                                    width: latestRequest.status === 'completed' || latestRequest.status === 'delivered' ? '100%'
                                        : latestRequest.status === 'picked' ? '66%'
                                            : latestRequest.status === 'assigned' ? '33%'
                                                : '0%'
                                }}
                            />
                        </div>

                        {[
                            { label: 'Request Sent', icon: <FaClipboardList />, active: true },
                            { label: 'Assigned', icon: <FaUser />, active: ['assigned', 'picked', 'delivered', 'completed'].includes(latestRequest.status) },
                            { label: 'Out for Delivery', icon: <FaTruck />, active: ['picked', 'delivered', 'completed'].includes(latestRequest.status) },
                            { label: 'Arrived', icon: <FaCheckCircle />, active: ['delivered', 'completed'].includes(latestRequest.status) }
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col items-center relative z-10 w-32">
                                <div className={`w-14 h-14 rounded-full border-[3px] shadow-sm flex items-center justify-center transition-all duration-700 bg-white ${step.active ? 'border-blue-500 text-blue-600 scale-110' : 'border-gray-50 text-gray-200 shadow-inner'}`}>
                                    <div className="text-lg">{step.icon}</div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${step.active ? 'text-gray-800' : 'text-gray-300'}`}>{step.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DENSE HISTORY TABLE (RESTORED DETAILING) */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[2px] border-b border-gray-100">
                                <th className="px-10 py-6">Requested Food</th>
                                <th className="px-6 py-6 text-center">Status Info</th>
                                <th className="px-8 py-6">Mission Details</th>
                                <th className="px-8 py-6">Timestamp</th>
                                <th className="px-8 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {requests.map(req => (
                                <Fragment key={req.donationId}>
                                    <tr
                                        className={`group transition-all cursor-pointer ${expandedId === req.donationId ? 'bg-blue-50/40' : 'hover:bg-gray-50/50'}`}
                                        onClick={() => toggleExpand(req.donationId)}
                                    >
                                        <td className="px-10 py-7">
                                            <div className="flex items-center space-x-5">
                                                <div className="h-12 w-12 bg-white text-blue-600 rounded-xl flex items-center justify-center text-xl shadow-sm border border-blue-50 group-hover:scale-110 transition-transform">
                                                    <FaBoxOpen />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-800 capitalize text-lg leading-tight">{req.foodType}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">ID: {req.donationId.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-7 text-center">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100">S</div>
                                                    <span className="text-[11px] font-bold text-gray-600 italic">Self Requested</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-500 border border-indigo-100">V</div>
                                                    <span className="text-[11px] font-bold text-gray-700">{req.status === 'assigned' || req.status === 'picked' ? 'Agent Assigned' : 'Searching Agent...'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col text-[10px]">
                                                <span className="font-bold text-gray-600">{new Date(req.timestamps.posted).toLocaleDateString()}</span>
                                                <span className="font-black text-gray-400 uppercase tracking-tighter mt-0.5">{new Date(req.timestamps.posted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <div className="flex items-center justify-end space-x-4">
                                                {req.status === 'delivered' && (
                                                    <button
                                                        onClick={(e) => openConfirmModal(req.donationId, e)}
                                                        className="px-6 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all transform hover:-translate-y-0.5"
                                                    >
                                                        Confirm
                                                    </button>
                                                )}
                                                <button className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${expandedId === req.donationId ? 'bg-gray-800 text-white shadow-xl rotate-180' : 'bg-gray-50 text-gray-300 hover:text-blue-500'}`}>
                                                    <FaChevronDown className="text-xs" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {expandedId === req.donationId && (
                                        <tr className="bg-gray-50/40 border-t border-gray-100">
                                            <td colSpan="5" className="p-0 animate-fade-in">
                                                <div className="px-10 py-16">
                                                    <div className="max-w-4xl mx-auto space-y-12">
                                                        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                                                            <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[3px]">Detailed Mission Timeline</h5>
                                                            <div className="flex items-center text-[10px] font-black text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
                                                                <FaClock className="mr-2" /> UPDATED {new Date().toLocaleTimeString()}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-8 relative ml-4 border-l-2 border-gray-100 pl-10 py-4">
                                                            {[
                                                                { label: 'Request Sent', status: 'posted', time: req.timestamps.posted },
                                                                { label: 'Volunteer Assigned', status: 'assigned', time: req.timestamps.assigned },
                                                                { label: 'Out for Delivery', status: 'picked', time: req.timestamps.picked },
                                                                { label: 'Arrived at Destination', status: 'delivered', time: req.timestamps.delivered },
                                                                { label: 'Completed', status: 'completed', time: req.timestamps.completed }
                                                            ].map((step, i) => (
                                                                <div key={i} className={`relative flex items-start group ${step.time ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                                                                    <div className={`absolute -left-[54px] top-1.5 h-6 w-6 rounded-full border-4 border-white shadow-md z-10 transition-all ${step.time ? 'bg-emerald-500 scale-110 shadow-emerald-100' : 'bg-gray-200'}`}></div>
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <h6 className={`text-sm font-black tracking-tight ${step.time ? 'text-gray-800' : 'text-gray-300'}`}>{step.label}</h6>
                                                                            {step.time && <span className="text-[10px] font-bold text-gray-400">{new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                                                        </div>
                                                                        {step.time && <p className="text-[11px] font-bold text-gray-400">{new Date(step.time).toLocaleDateString()}</p>}

                                                                        {/* OTP FOR PICKED STATUS */}
                                                                        {step.status === 'picked' && req.recipientOtp && (
                                                                            <div className="mt-4 p-5 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-xl shadow-indigo-100 animate-fade-in-up border border-white/10">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <span className="text-[9px] font-black text-white/70 uppercase tracking-[2px]">Delivery Proof Code</span>
                                                                                    <div className="h-5 w-5 bg-white/20 rounded-md flex items-center justify-center text-[10px] text-white">🔐</div>
                                                                                </div>
                                                                                <div className="bg-white/10 p-3 rounded-xl flex items-center justify-center">
                                                                                    <span className="text-2xl font-black text-white font-mono tracking-[10px]">{req.recipientOtp}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
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

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={handleConfirmDelivery}
                title="Confirm Delivery Receipt"
                message="Confirm that you have safely received this food donation. This action completes the donation mission."
                confirmText="Yes, Received"
            />
        </div>
    );
};

export default RecipientRequests;
