import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Ticket, LogOut, LayoutDashboard, BarChart2, ShieldAlert, User as UserIcon, Wallet, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tickets', path: '/my-tickets', icon: Ticket },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: ShieldAlert });
  }

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/5 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-secondary text-white shadow-lg"
            >
              <Ticket className="h-6 w-6" />
            </motion.div>
            <span className="font-display text-xl font-extrabold tracking-tight">
              <span className="text-foreground">FlashSeat</span>
              <span className="text-primary font-medium text-lg ml-1">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      active ? 'text-primary' : 'text-foreground/75 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                    {active && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wallet Panel */}
            {isAuthenticated && user && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-semibold"
              >
                <Wallet className="h-4 w-4 text-secondary" />
                <span>₹{user.walletBalance.toLocaleString('en-IN')}</span>
              </motion.div>
            )}

            {/* Light/Dark Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Profile Dropdown */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3 border-l border-white/10 pl-4">
                <Link to="/profile" className="flex items-center space-x-2 text-foreground/75 hover:text-foreground">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-danger/80 hover:text-danger hover:bg-danger/10 transition-all"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-all">Sign In</Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 shadow-md shadow-primary/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-foreground/70 hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-foreground/70 hover:text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-white/5"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              {isAuthenticated && (
                <>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-2 p-3 rounded-lg text-base font-medium transition-all ${
                          isActive(link.path) ? 'bg-primary/10 text-primary' : 'hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                  
                  {user && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 border border-secondary/10 text-secondary">
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-5 w-5" />
                        <span className="text-sm font-semibold">Wallet Balance</span>
                      </div>
                      <span className="font-bold">₹{user.walletBalance.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-2 mt-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 p-3 rounded-lg hover:bg-white/5"
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-2 p-3 w-full rounded-lg text-danger hover:bg-danger/10 text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center py-2.5 rounded-lg border border-white/10 text-center hover:bg-white/5"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-center hover:opacity-90"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default Navbar;
