import { useState, useEffect, Fragment } from 'react';
import { getAdminDonations, clearInactiveDonations } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaClipboardList, FaUser, FaTruck, FaCheckCircle, FaBoxOpen, FaClock, FaCircle } from 'react-icons/fa';

const AdminOrders = () => {
    const [donations, setDonations] = useState([]);
    const [filteredDonations, setFilteredDonations] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(15);
    const [expandedRow, setExpandedRow] = useState(null);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        fetchDonations();
    }, []);

    useEffect(() => {
        filterData();
    }, [search, statusFilter, donations]);

    const fetchDonations = async () => {
        try {
            const { data } = await getAdminDonations();
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
                d.donor?.name.toLowerCase().includes(search.toLowerCase()) ||
                d.foodType.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFilteredDonations(temp);
        setVisibleCount(15);
    };

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleClearInactive = async () => {
        if (!window.confirm("Are you sure you want to completely remove all completed and expired records from the system?")) return;
        setClearing(true);
        try {
            const res = await clearInactiveDonations();
            toast.success(res.data?.message || "Cleared inactive records!");
            fetchDonations();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to clear records");
        } finally {
            setClearing(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            posted: 'bg-yellow-50 text-yellow-600 border-yellow-100',
            requested: 'bg-blue-50 text-blue-600 border-blue-100',
            assigned: 'bg-purple-50 text-purple-600 border-purple-100',
            picked: 'bg-orange-50 text-orange-600 border-orange-100',
            delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            expired: 'bg-red-50 text-red-500 border-red-100',
        };
        return (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-100'}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    const latestOrder = filteredDonations[0];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

    return (
        <div className="space-y-6 pb-20 animate-fade-in-up">

            {/* SEARCH & FILTERS - COMPACT */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-full lg:w-96">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Quick search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {['all', 'posted', 'requested', 'assigned', 'delivered', 'completed', 'expired'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${statusFilter === status
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-200 mx-1 hidden lg:block"></div>
                    <button
                        onClick={handleClearInactive}
                        disabled={clearing}
                        className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50 flex items-center"
                    >
                        {clearing ? 'Clearing...' : 'Clear Inactive'}
                    </button>
                </div>
            </div>

            {/* TOP PROGRESS TRACKER (RESTORED FROM SCREENSHOT) */}
            {latestOrder && (
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                    <div className="relative flex justify-between items-center max-w-5xl mx-auto">

                        {/* THE TRACKER LINE */}
                        <div className="absolute top-8 left-[4rem] right-[4rem] h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-1000"
                                style={{
                                    width: latestOrder.status === 'completed' || latestOrder.status === 'delivered' ? '100%'
                                        : latestOrder.status === 'picked' ? '66%'
                                            : latestOrder.status === 'assigned' ? '33%'
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
                                <div className={`w-16 h-16 rounded-full border-[3px] shadow-sm flex items-center justify-center transition-all duration-500 bg-white ${step.active ? 'border-blue-500 text-blue-600 scale-110 shadow-blue-100' : 'border-gray-100 text-gray-200'}`}>
                                    <div className="text-xl">{step.icon}</div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className={`text-xs font-black uppercase tracking-widest ${step.active ? 'text-gray-800' : 'text-gray-300'}`}>{step.label}</p>
                                    {step.active && step.date && (
                                        <div className="mt-1 opacity-60">
                                            <p className="text-[9px] font-bold text-gray-500">{new Date(step.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                            <p className="text-[8px] font-black text-gray-400">{new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DENSE DATA TABLE (RESTORED FROM SCREENSHOT) */}
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[2px] border-b border-gray-100">
                                <th className="px-8 py-6">Item & Quantity</th>
                                <th className="px-6 py-6">Status Info</th>
                                <th className="px-8 py-6">Donor Account</th>
                                <th className="px-8 py-6">Recipient</th>
                                <th className="px-8 py-6">Volunteer Agent</th>
                                <th className="px-8 py-6">Timestamp</th>
                                <th className="px-8 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDonations.slice(0, visibleCount).map(donation => (
                                <Fragment key={donation._id}>
                                    <tr
                                        className={`hover:bg-blue-50/30 transition-all group cursor-pointer ${expandedRow === donation._id ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => toggleRow(donation._id)}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 capitalize leading-tight">{donation.foodType}</span>
                                                <span className="text-[10px] font-black text-gray-400 mt-0.5">{donation.quantity} units</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={donation.status} />
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black border border-blue-200 shadow-sm">
                                                    {donation.donor?.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{donation.donor?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-2">
                                                <FaMapMarkerAlt className={`text-xs ${donation.recipient ? 'text-emerald-500' : 'text-gray-200'}`} />
                                                <span className={`text-xs font-bold ${donation.recipient ? 'text-gray-700' : 'text-gray-300 italic'}`}>
                                                    {donation.recipient ? donation.recipient.name : 'Pending...'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-2">
                                                <FaTruck className={`text-xs ${donation.volunteer ? 'text-indigo-500' : 'text-gray-200'}`} />
                                                <span className={`text-xs font-bold ${donation.volunteer ? 'text-gray-700' : 'text-gray-300 italic'}`}>
                                                    {donation.volunteer ? donation.volunteer.name : 'Unassigned'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col text-[10px]">
                                                <span className="font-bold text-gray-600">{new Date(donation.createdAt).toLocaleDateString()}</span>
                                                <span className="font-black text-gray-400 uppercase tracking-tighter mt-0.5">{new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className={`p-2 rounded-lg transition-all ${expandedRow === donation._id ? 'bg-blue-600 text-white rotate-180 shadow-lg' : 'text-gray-300 hover:text-blue-600'}`}>
                                                <FaChevronDown className="text-xs" />
                                            </button>
                                        </td>
                                    </tr>

                                    {/* EXPANDED VIEW - DETAILED TIMELINE (IF NEEDED, BUT TOP HAS ONE ALREADY) */}
                                    {expandedRow === donation._id && (
                                        <tr className="bg-blue-50/10 border-t border-gray-100">
                                            <td colSpan="7" className="px-8 py-10">
                                                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10 flex flex-col lg:flex-row gap-12">
                                                    {/* MISSION SUMMARY */}
                                                    <div className="lg:w-1/3 space-y-6">
                                                        <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mb-4">Mission Intelligence</h5>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg"><FaBoxOpen /></div>
                                                                <div>
                                                                    <p className="text-xs font-black text-gray-800">{donation.foodType}</p>
                                                                    <p className="text-[10px] font-bold text-gray-400">{donation.quantity} units registered</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start space-x-4">
                                                                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg mt-1"><FaMapMarkerAlt /></div>
                                                                <div>
                                                                    <p className="text-xs font-black text-gray-800">Final Destination</p>
                                                                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic">{donation.recipientLocation?.address || 'Community Drop-off Point'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* GRANULAR TIMELINE - "ALL TIME INSTANCES" */}
                                                    <div className="lg:w-2/3 space-y-8">
                                                        <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[3px] mb-4">Lifecycle Audit Log</h5>
                                                        <div className="relative space-y-6 ml-4 border-l-2 border-dashed border-gray-100 pl-8 py-4">
                                                            {[
                                                                { label: 'Donation Posted', time: donation.createdAt, status: 'posted' },
                                                                { label: 'Role Assigned', time: donation.assignedAt, status: 'assigned' },
                                                                { label: 'Pickup Completed', time: donation.pickedAt, status: 'picked' },
                                                                { label: 'Carrier Arrived', time: donation.deliveredAt, status: 'delivered' },
                                                                { label: 'Mission Finished', time: donation.completedAt, status: 'completed' }
                                                            ].map((step, idx) => (
                                                                <div key={idx} className="relative group">
                                                                    {/* Dot */}
                                                                    <div className={`absolute -left-[33px] top-1.5 h-3.5 w-3.5 rounded-full border-[3px] bg-white transition-all ${step.time ? 'border-indigo-500 scale-110 z-10 shadow-sm shadow-indigo-100' : 'border-gray-100 z-0'}`}></div>

                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex flex-col">
                                                                            <span className={`text-[11px] font-black uppercase tracking-wider ${step.time ? 'text-gray-800' : 'text-gray-200'}`}>{step.label}</span>
                                                                            <span className={`text-[10px] font-bold mt-1 ${step.time ? 'text-gray-400' : 'text-gray-100'}`}>
                                                                                {step.time ? `${new Date(step.time).toLocaleDateString()} at ${new Date(step.time).toLocaleTimeString()}` : 'Pending...'}
                                                                            </span>
                                                                        </div>
                                                                        {step.time && (
                                                                            <span className="bg-gray-50 px-3 py-1 rounded-lg text-[8px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">Verified</span>
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

                {/* PAGINATION */}
                <div className="p-8 border-t border-gray-50 flex justify-center space-x-4 bg-gray-50/30">
                    {visibleCount < filteredDonations.length && (
                        <button
                            onClick={() => setVisibleCount(prev => prev + 10)}
                            className="px-8 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-100"
                        >
                            Load More Records
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AdminOrders;
