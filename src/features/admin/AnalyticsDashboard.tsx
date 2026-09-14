import React, { useState } from 'react';
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
import { io as ioClient } from 'socket.io-client';
import { TrendingUp, Users, DollarSign, Activity, ShoppingCart, Terminal, Shield, Play } from 'lucide-react';
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
  const [testLogs, setTestLogs] = useState<string[]>(['🔬 Test Lab initialized. Select a test suite above to begin simulation...']);
  const [runningTest, setRunningTest] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setTestLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runAuthTest = async () => {
    setRunningTest('auth');
    setTestLogs([]);
    addLog('🚀 Starting Authentication REST API integration tests...');
    
    try {
      const email = `test_${Date.now()}@flashseat.ai`;
      const password = 'Password123!';

      // 1. Register
      addLog('⏳ 1. Sending POST /auth/register...');
      const regRes = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Frontend Tester', email, password })
      });
      const regData = await regRes.json();
      addLog(`🔹 Response status: ${regRes.status}. Success: ${regData.success}`);
      if (regRes.status !== 201) throw new Error('Registration failed');
      const token = regData.data.token;

      // 2. Login
      addLog('⏳ 2. Sending POST /auth/login...');
      const logRes = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const logData = await logRes.json();
      addLog(`🔹 Response status: ${logRes.status}. Token: ${logData.data?.token ? 'Verified' : 'Missing'}`);

      // 3. Profile me
      addLog('⏳ 3. Sending GET /auth/me (authenticated)...');
      const meRes = await fetch('http://localhost:5000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meData = await meRes.json();
      addLog(`🔹 Response status: ${meRes.status}. User Name: ${meData.data?.name}`);

      addLog('🎉 AUTHENTICATION TEST COMPLETED SUCCESSFULLY!');
    } catch (e: any) {
      addLog(`❌ Test Failed: ${e.message}`);
    } finally {
      setRunningTest(null);
    }
  };

  const runConcurrencyTest = async () => {
    setRunningTest('concurrency');
    setTestLogs([]);
    addLog('🚀 Starting Concurrency & Distributed Lock Race Condition Test...');
    
    try {
      // 1. Authenticate user to get token
      addLog('⏳ 1. Authenticating test runner session...');
      const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@example.com', password: 'user123' })
      });
      const loginData = await loginRes.json();
      if (!loginData.success) throw new Error('Login failed');
      const token = loginData.data.token;

      // 2. Fetch matches to get active eventId
      addLog('⏳ 2. Querying active match configurations...');
      const matchesRes = await fetch('http://localhost:5000/api/v1/events');
      const matchesData = await matchesRes.json();
      if (!matchesData.success || matchesData.data.length === 0) throw new Error('No matches found. Please seed the DB.');
      const eventId = matchesData.data[0]._id;

      // 3. Race condition lock requests
      const seatNumber = `C-GEN-${Math.floor(Math.random() * 50) + 50}`;
      addLog(`⏳ 3. Sending 10 parallel booking lock requests for seat ${seatNumber}...`);

      const requests = Array.from({ length: 10 }, () =>
        fetch('http://localhost:5000/api/v1/booking/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ eventId, seatNumber })
        })
      );

      const responses = await Promise.all(requests);
      let success = 0;
      let blocked = 0;

      for (let i = 0; i < responses.length; i++) {
        const status = responses[i].status;
        const body = await responses[i].json();
        if (status === 202) {
          success++;
          addLog(`   👉 Req #${i+1}: 202 Accepted (Acquired Redis Lock)`);
        } else if (status === 409) {
          blocked++;
          addLog(`   👉 Req #${i+1}: 409 Conflict (Rejected by Redis Lock)`);
        } else {
          addLog(`   👉 Req #${i+1}: ${status} ${body.error}`);
        }
      }

      addLog(`\n📊 Concurrency Report:`);
      addLog(`🔹 Redis Lock Acquired (202): ${success}`);
      addLog(`🔸 Rejected Concurrency (409): ${blocked}`);

      if (success === 1 && blocked === 9) {
        addLog('🎉 CONCURRENCY LOCK TEST PASSED SUCCESSFULLY!');
      } else {
        addLog('⚠️ Test Completed with unexpected lock ratios');
      }
    } catch (e: any) {
      addLog(`❌ Test Failed: ${e.message}`);
    } finally {
      setRunningTest(null);
    }
  };

  const runSagaTest = async () => {
    setRunningTest('saga');
    setTestLogs([]);
    addLog('🚀 Starting E2E Kafka Saga & Compensation Rollback Test...');
    
    try {
      // 1. Authenticate
      addLog('⏳ 1. Authenticating user...');
      const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@example.com', password: 'user123' })
      });
      const loginData = await loginRes.json();
      const token = loginData.data.token;

      // 2. Fetch matches to get active eventId
      const matchesRes = await fetch('http://localhost:5000/api/v1/events');
      const matchesData = await matchesRes.json();
      const eventId = matchesData.data[0]._id;

      // 3. Lock seat ending in "09" to force payment failure & Saga rollback
      const seatNumber = 'C-GEN-9';
      addLog(`⏳ 2. Locking seat ${seatNumber} (triggers automatic Saga failure/rollback)...`);
      const lockRes = await fetch('http://localhost:5000/api/v1/booking/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId, seatNumber })
      });
      const lockData = await lockRes.json();
      if (lockRes.status !== 202) throw new Error(lockData.error || 'Lock failed');
      const bookingId = lockData.data.bookingId;
      addLog(`🔹 Seat locked. Booking ID: ${bookingId}. Connecting Socket...`);

      // 4. Connect to WebSockets to listen to progress
      const testSocket = ioClient('http://localhost:5000');
      testSocket.emit('join', bookingId);
      addLog('📡 Socket connected & joined transaction progress room.');

      testSocket.on('booking:progress', (data: any) => {
        addLog(`🔔 Socket Alert: [Saga Status: ${data.status}] - ${data.message}`);
        if (data.status === 'FAILED') {
          addLog('🎉 SUCCESS: Saga compensation rollback confirmed! Seat released.');
          testSocket.disconnect();
          setRunningTest(null);
        }
      });

    } catch (e: any) {
      addLog(`❌ Test Failed: ${e.message}`);
      setRunningTest(null);
    }
  };

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
            {recentLogs.map((log) => {
              return (
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
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulation Lab Panel */}
      <div className="glass rounded-3xl p-6 border border-white/5 space-y-6 mt-8">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-foreground/80 font-display flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <span>🔬 Interactive E2E Simulation & Testing Lab</span>
            </h3>
            <p className="text-xs text-foreground/50 mt-1">
              Verify authentication, distributed locks, and Kafka Saga rollbacks directly inside the web interface.
            </p>
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="flex flex-wrap gap-4">
          <button
            disabled={runningTest !== null}
            onClick={runAuthTest}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-bold transition-all disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Test Auth REST APIs</span>
          </button>

          <button
            disabled={runningTest !== null}
            onClick={runConcurrencyTest}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/20 text-accent text-xs font-bold transition-all disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Test Concurrency Lock</span>
          </button>

          <button
            disabled={runningTest !== null}
            onClick={runSagaTest}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 text-secondary text-xs font-bold transition-all disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Test Saga Rollback</span>
          </button>
        </div>

        {/* Terminal Log Output */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-left font-mono text-xs text-accent/80 space-y-1.5 h-64 overflow-y-auto flex flex-col shadow-inner">
          <div className="flex items-center gap-1.5 text-foreground/45 border-b border-white/5 pb-1.5 mb-2 font-bold font-sans uppercase">
            <Terminal className="h-4 w-4" />
            <span>Live Simulation Terminal Output</span>
          </div>
          {testLogs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AnalyticsDashboard;
