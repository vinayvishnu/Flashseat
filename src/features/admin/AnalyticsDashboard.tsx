import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data arrays for charts
const revenueHistory = [
  { day: 'Mon', revenue: 45000 },
  { day: 'Tue', revenue: 78000 },
  { day: 'Wed', revenue: 112000 },
  { day: 'Thu', revenue: 95000 },
  { day: 'Fri', revenue: 165000 },
  { day: 'Sat', revenue: 234000 },
  { day: 'Sun', revenue: 312000 },
];

const trafficFunnel = [
  { stage: 'Visits', count: 1850 },
  { stage: 'Waiting Room', count: 1240 },
  { stage: 'Seat Selector', count: 540 },
  { stage: 'Checkout Settle', count: 210 },
];

const ticketCategories = [
  { name: 'VIP Seats', value: 45, color: '#8B5CF6' },
  { name: 'Premium Seats', value: 112, color: '#00F2FE' },
  { name: 'General Seats', value: 242, color: '#10B981' },
];

const recentLogs = [
  { id: 'TXN-9821', user: 'Amit Sharma', amount: 15000, seats: 'A-VIP-12, A-VIP-13', time: '2 mins ago' },
  { id: 'TXN-9734', user: 'Rahul Kumar', amount: 7000, seats: 'B-PREM-4, B-PREM-5', time: '5 mins ago' },
  { id: 'TXN-9621', user: 'Priya Mishra', amount: 3500, seats: 'B-PREM-18', time: '8 mins ago' },
  { id: 'TXN-9512', user: 'Sachin Tendulkar', amount: 3000, seats: 'C-GEN-10, C-GEN-11', time: '12 mins ago' },
];

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-foreground">
          Ticketing Performance Analytics
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          Real-time transaction volumes, visitor conversions, and seating category distribution metrics.
        </p>
      </div>

      {/* Grid Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Stat 1 */}
        <motion.div whileHover={{ y: -4 }} className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide block">Gross Revenue Settled</span>
            <span className="text-2xl font-extrabold font-display mt-1 block text-gradient-primary">₹9,41,000</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Stat 2 */}
        <motion.div whileHover={{ y: -4 }} className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide block">Active Queue Concurrency</span>
            <span className="text-2xl font-extrabold font-display mt-1 block text-gradient-accent">1,240 nodes</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Users className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Stat 3 */}
        <motion.div whileHover={{ y: -4 }} className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide block">Overall Conversion Rate</span>
            <span className="text-2xl font-extrabold font-display mt-1 block text-gradient-vip">11.35%</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <TrendingUp className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Stat 4 */}
        <motion.div whileHover={{ y: -4 }} className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide block">Server Node Load</span>
            <span className="text-2xl font-extrabold font-display mt-1 block text-success">Optimized</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
            <Activity className="h-6 w-6" />
          </div>
        </motion.div>
      </div>

      {/* Recharts Graphics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart 1: Revenue Timeline (Area Chart) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/75 font-display">Revenue timeline (₹)</h3>
            <span className="text-xs text-foreground/45">Weekly billing transaction velocity curves</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4757" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF4757" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#FF4757" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Ticket Categories (Pie Chart) */}
        <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/75 font-display">Seating Tier Distribution</h3>
            <span className="text-xs text-foreground/45">Volume shares by seats segment categories</span>
          </div>
          <div className="h-56 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ticketCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs mt-2 font-semibold">
            {ticketCategories.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-foreground/60">{c.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Conversion Funnel (Bar Chart) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/75 font-display">User flow conversion funnel</h3>
            <span className="text-xs text-foreground/45">Funnel drop-off metrics per customer session</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficFunnel} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis type="number" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <YAxis dataKey="stage" type="category" stroke="rgba(255,255,255,0.2)" fontSize={10} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {trafficFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#10B981' : '#00F2FE'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Table Log */}
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/75 font-display">Live Ledger Receipts</h3>
            <span className="h-2 w-2 rounded-full bg-success animate-ping" />
          </div>
          
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold">{log.user}</div>
                  <div className="text-[10px] text-foreground/40 mt-0.5">Seats: {log.seats} • {log.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-success">₹{log.amount.toLocaleString('en-IN')}</div>
                  <div className="text-[9px] font-mono text-accent mt-0.5">{log.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsDashboard;
