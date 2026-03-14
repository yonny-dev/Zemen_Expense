import React, { useState, useEffect, useMemo } from 'react'; // Import React and core hooks
import { motion, AnimatePresence } from 'motion/react'; // Import animation components
import { Plus, LayoutDashboard, ListOrdered, Languages, Moon, Sun, TrendingUp, TrendingDown, Wallet, Trash2, Edit2, X, LogOut, Settings, User as UserIcon, ChevronDown, Download, AlertCircle, RefreshCw } from 'lucide-react'; // Import UI icons
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'; // Import chart components
import { format, parseISO } from 'date-fns'; // Import date formatting utilities
import { clsx, type ClassValue } from 'clsx'; // Import utility for conditional class names
import { twMerge } from 'tailwind-merge'; // Import utility to merge Tailwind classes

import { Transaction, DIGITAL_MONEY_OPTIONS, BANKS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './types'; // Import custom types and constants
import { translations, Language } from './translations'; // Import translation data and language type
import { api } from './services/api'; // Import API service for database operations
import { supabase, logout } from './supabase'; // Import Supabase client and logout helper
import { User } from '@supabase/supabase-js'; // Import Supabase User type
import Auth from './components/Auth'; // Import the Authentication component

// Utility function to merge Tailwind CSS classes efficiently
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Main Application Component
export default function App() {
  // State for the current language (defaults to 'en' or saved preference)
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lang') as Language) || 'en';
    }
    return 'en';
  });
  // State for the theme (dark/light mode)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  // State to store the list of transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // State to store the currently logged-in user
  const [user, setUser] = useState<User | null>(null);
  // State to track if the app is still loading initial data
  const [loading, setLoading] = useState(true);
  // State to track the active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  // State to control the visibility of the transaction modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to store the transaction currently being edited
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  // State to store the transaction ID to be deleted
  const [transactionToDelete, setTransactionToDelete] = useState<string | number | null>(null);
  // State to control the user profile menu dropdown
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Helper to get the current translation object based on selected language
  const t = translations[lang];

  // Effect to handle authentication state on mount
  useEffect(() => {
    // Check if there is an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to authentication state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Effect to subscribe to transaction updates when a user is logged in
  useEffect(() => {
    if (user) {
      // Start real-time subscription
      const unsubscribe = api.subscribeTransactions(setTransactions);
      return () => unsubscribe(); // Unsubscribe on logout or unmount
    } else {
      setTransactions([]); // Clear transactions if no user
    }
  }, [user]);

  // Effect to apply the dark mode class to the document root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Effect to save language preference to local storage
  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  // Memoized calculation of total income, expense, and balance
  const totals = useMemo(() => {
    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0);
    const expense = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // Memoized data for the bar chart (last 6 months)
  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return format(d, 'MMM');
    }).reverse();

    return last6Months.map(month => {
      const monthTxs = transactions.filter(tx => format(parseISO(tx.date), 'MMM') === month);
      return {
        name: t.months[month as keyof typeof t.months] || month,
        income: monthTxs.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0),
        expense: monthTxs.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0),
      };
    });
  }, [transactions, t.months]);

  // Memoized data for the category pie chart
  const categoryData = useMemo(() => {
    const categories = EXPENSE_CATEGORIES;
    return categories.map(cat => ({
      name: t.categories[cat as keyof typeof t.categories] || cat,
      value: transactions
        .filter(tx => tx.type === 'expense' && tx.category === cat)
        .reduce((acc, tx) => acc + tx.amount, 0)
    })).filter(c => c.value > 0);
  }, [transactions, t.categories]);

  // Function to handle saving (adding or updating) a transaction
  const handleSaveTransaction = async (tx: Transaction) => {
    try {
      if (editingTransaction?.id) {
        // Update existing
        await api.updateTransaction(editingTransaction.id as string, tx);
      } else {
        // Add new
        await api.addTransaction(tx);
      }
      setIsModalOpen(false); // Close modal
      setEditingTransaction(null); // Clear edit state
      // Force reload as requested by user
      window.location.reload();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert(lang === 'en' ? 'Failed to save transaction' : 'ግብይቱን ማስቀመጥ አልተቻለም');
    }
  };

  // Function to handle deleting a transaction
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
      await api.deleteTransaction(transactionToDelete as string); // Call API to delete
      setTransactionToDelete(null);
      // Force reload as requested by user
      window.location.reload();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert(lang === 'en' ? 'Failed to delete transaction' : 'ግብይቱን ማጥፋት አልተቻለም');
    }
  };

  // Function to export transaction history as a CSV file
  const downloadHistory = () => {
    if (transactions.length === 0) return; // Do nothing if there are no transactions

    // Define CSV column headers
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Source', 'Description'];
    // Map transactions to CSV rows
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.date,
        tx.type,
        tx.category,
        tx.amount,
        tx.source_name || tx.source || '',
        `"${tx.description.replace(/"/g, '""')}"` // Escape quotes in description
      ].join(','))
    ].join('\n');

    // Create a Blob containing the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); // Create a temporary anchor element
    const url = URL.createObjectURL(blob); // Create a URL for the blob
    link.setAttribute('href', url); // Set the link target
    link.setAttribute('download', `zemen_expense_history_${format(new Date(), 'yyyy-MM-dd')}.csv`); // Set filename
    link.style.visibility = 'hidden'; // Hide the link
    document.body.appendChild(link); // Add to document
    link.click(); // Programmatically click to start download
    document.body.removeChild(link); // Clean up
  };

  // Render a loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ethiopia-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Render the Auth component if the user is not logged in
  if (!user) {
    return (
      <Auth 
        lang={lang} 
        setLang={setLang} 
        isDark={isDark} 
        setIsDark={setIsDark} 
      />
    );
  }

  // Colors for the pie chart
  const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#0ea5e9', '#06b6d4', '#f59e0b', '#f97316'];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:top-0 lg:bottom-0 lg:w-64 bg-white dark:bg-zinc-900 border-t lg:border-t-0 lg:border-r border-zinc-200 dark:border-zinc-800 z-50">
        <div className="flex lg:flex-col h-full p-4 justify-around lg:justify-start gap-4">
          {/* App Logo (Desktop Only) */}
          <div className="hidden lg:flex items-center mb-8 px-2">
            <img 
              src="https://i.postimg.cc/pTG830n5/Zemen-expense-logo-removebg.png" 
              alt="Zemen Expense" 
              className="h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Navigation Buttons */}
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={20} />}
            label={t.dashboard}
          />
          <NavButton 
            active={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')}
            icon={<ListOrdered size={20} />}
            label={t.transactions}
          />

          {/* Sidebar Footer Actions */}
          <div className="lg:mt-auto flex lg:flex-col gap-2">
            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 text-zinc-500 dark:text-zinc-400"
              title={t.theme}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              <span className="hidden lg:inline font-medium">{t.theme}</span>
            </button>
            {/* Language Toggle */}
            <button 
              onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
              className="p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 text-zinc-500 dark:text-zinc-400"
              title={t.language}
            >
              <Languages size={20} />
              <span className="hidden lg:inline font-medium">{lang === 'en' ? 'አማርኛ' : 'English'}</span>
            </button>
            {/* Logout Button */}
            <button 
              onClick={() => logout()}
              className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors flex items-center gap-3"
              title={lang === 'en' ? 'Logout' : 'ውጣ'}
            >
              <LogOut size={20} />
              <span className="hidden lg:inline font-medium">{lang === 'en' ? 'Logout' : 'ውጣ'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8">
        {/* Decorative Top Border */}
        <div className="h-2 w-full tilet-border rounded-full mb-8 opacity-50" />
        
        {/* Page Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{activeTab === 'dashboard' ? t.dashboard : t.transactions}</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              {/* Display current date in selected language */}
              {t.days[format(new Date(), 'EEEE') as keyof typeof t.days]}, {t.fullMonths[format(new Date(), 'MMMM') as keyof typeof t.fullMonths]} {format(new Date(), 'do')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button 
              onClick={() => window.location.reload()}
              className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm text-zinc-500"
              title={lang === 'en' ? 'Refresh' : 'አድስ'}
            >
              <RefreshCw size={20} />
            </button>

            {/* Add Transaction Button */}
            <button 
              onClick={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
              className="bg-ethiopia-green hover:bg-ethiopia-green/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-ethiopia-green/20 transition-all active:scale-95"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">{t.addTransaction}</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                  {/* Show user avatar if available, otherwise default icon */}
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <UserIcon size={18} />
                  )}
                </div>
                <ChevronDown size={16} className={cn("transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
              </button>

              {/* User Menu Dropdown Content */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    {/* Overlay to close menu when clicking outside */}
                    <div 
                      className="fixed inset-0 z-[60]" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-2 z-[70] overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{lang === 'en' ? 'Account' : 'አካውንት'}</p>
                        <p className="text-sm font-medium truncate">{user?.email}</p>
                      </div>
                      
                      {/* Theme Toggle in Menu */}
                      <button 
                        onClick={() => { setIsDark(!isDark); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm"
                      >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        <span>{t.theme}: {isDark ? (lang === 'en' ? 'Dark' : 'ጨለማ') : (lang === 'en' ? 'Light' : 'ብርሃን')}</span>
                      </button>

                      {/* Language Toggle in Menu */}
                      <button 
                        onClick={() => { setLang(lang === 'en' ? 'am' : 'en'); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm"
                      >
                        <Languages size={18} />
                        <span>{t.language}: {lang === 'en' ? 'English' : 'አማርኛ'}</span>
                      </button>

                      <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

                      {/* Logout Button in Menu */}
                      <button 
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors text-sm font-medium"
                      >
                        <LogOut size={18} />
                        <span>{lang === 'en' ? 'Logout' : 'ውጣ'}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Conditional Rendering based on Active Tab */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            {/* Summary Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title={t.totalBalance} amount={totals.balance} icon={<Wallet className="text-ethiopia-green" />} currency={t.currency} />
              <StatCard title={t.totalIncome} amount={totals.income} icon={<TrendingUp className="text-emerald-500" />} currency={t.currency} />
              <StatCard title={t.totalExpense} amount={totals.expense} icon={<TrendingDown className="text-rose-500" />} currency={t.currency} />
            </div>

            {/* Data Visualizations Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Trend Bar Chart */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-6">{t.monthlyTrend}</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name={t.income} />
                      <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name={t.expense} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Spending by Category Pie Chart */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-6">{t.spendingByCategory}</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {/* Assign colors to pie segments */}
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Transactions Section (Dashboard View) */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">{t.recentTransactions}</h3>
                {/* Link to switch to the full transactions tab */}
                <button onClick={() => setActiveTab('transactions')} className="text-ethiopia-green font-medium hover:underline">View All</button>
              </div>
              {/* Show only the 5 most recent transactions */}
              <TransactionList 
                transactions={transactions.slice(0, 5)} 
                onEdit={(tx) => { setEditingTransaction(tx); setIsModalOpen(true); }}
                onDelete={(id) => setTransactionToDelete(id)}
                t={t}
              />
            </div>
          </div>
        ) : (
          /* Full Transactions History Tab View */
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{t.transactions}</h3>
              {/* Export History Button */}
              <button 
                onClick={downloadHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-bold text-zinc-600 dark:text-zinc-400"
              >
                <Download size={14} />
                <span>{t.downloadHistory}</span>
              </button>
            </div>
            {/* Full List of All Transactions */}
            <TransactionList 
              transactions={transactions} 
              onEdit={(tx) => { setEditingTransaction(tx); setIsModalOpen(true); }}
              onDelete={(id) => setTransactionToDelete(id)}
              t={t}
            />
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {transactionToDelete && (
          <ConfirmModal
            isOpen={!!transactionToDelete}
            onClose={() => setTransactionToDelete(null)}
            onConfirm={handleDeleteTransaction}
            title={lang === 'en' ? 'Delete Transaction' : 'ግብይቱን አጥፋ'}
            message={lang === 'en' ? 'Are you sure you want to delete this transaction? This action cannot be undone.' : 'ይህንን ግብይት በእርግጠኝነት ማጥፋት ይፈልጋሉ? ይህ ድርጊት ሊመለስ አይችልም።'}
            confirmText={lang === 'en' ? 'Delete' : 'አጥፋ'}
            cancelText={lang === 'en' ? 'Cancel' : 'ተመለስ'}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Transaction Modal for Adding/Editing */}
      <AnimatePresence>
        {isModalOpen && (
          <TransactionModal 
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
            onSave={handleSaveTransaction}
            editingTransaction={editingTransaction}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for sidebar navigation buttons
function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick} // Handle click event
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all duration-200", // Base styles
        active 
          ? "bg-ethiopia-green text-white shadow-lg shadow-ethiopia-green/20" // Active state styles
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400" // Inactive state styles
      )}
    >
      {icon} {/* Render icon */}
      <span className="hidden lg:inline font-bold">{label}</span> {/* Render label (hidden on mobile) */}
    </button>
  );
}

// Helper component for dashboard statistic cards
function StatCard({ title, amount, icon, currency }: { title: string, amount: number, icon: React.ReactNode, currency: string }) {
  return (
    <div className="glass-card p-6 flex items-center gap-4">
      {/* Icon Container */}
      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div>
        {/* Stat Title */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{title}</p>
        {/* Stat Amount with Currency Formatting */}
        <p className="text-2xl font-bold tracking-tight">{currency} {amount.toLocaleString()}</p>
      </div>
    </div>
  );
}

// Component to render a list of transactions
function TransactionList({ transactions, onEdit, onDelete, t }: { transactions: Transaction[], onEdit: (tx: Transaction) => void, onDelete: (id: string | number) => void, t: any }) {
  // Show a message if there are no transactions
  if (transactions.length === 0) return <p className="text-center py-12 text-zinc-500">{t.noTransactions}</p>;

  return (
    <div className="space-y-3">
      {/* Map through transactions and render each item */}
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
          <div className="flex items-center gap-4">
            {/* Transaction Type Icon (Income/Expense) */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              tx.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            )}>
              {tx.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
            <div>
              {/* Category Name (Translated) */}
              <p className="font-bold">{t.categories[tx.category as keyof typeof t.categories] || tx.category}</p>
              {/* Source and Date Info */}
              <p className="text-xs text-zinc-500">
                {tx.source_name || tx.source} • {t.months[format(parseISO(tx.date), 'MMM') as keyof typeof t.months] || format(parseISO(tx.date), 'MMM')} {format(parseISO(tx.date), 'd, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Transaction Amount with Color Coding */}
            <p className={cn(
              "font-bold text-lg",
              tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
            )}>
              {tx.type === 'income' ? '+' : '-'} {t.currency} {tx.amount.toLocaleString()}
            </p>
            {/* Action Buttons (Edit/Delete) - Visible on Hover (Desktop) and Always (Mobile) */}
            <div className="flex gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(tx); }} 
                className="p-3 lg:p-2 bg-zinc-100 dark:bg-zinc-800 lg:bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl lg:rounded-lg text-zinc-500 transition-colors" 
                title={t.edit}
              >
                <Edit2 size={18} className="lg:w-4 lg:h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); tx.id && onDelete(tx.id); }} 
                className="p-3 lg:p-2 bg-red-50 dark:bg-red-900/20 lg:bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl lg:rounded-lg text-red-500 transition-colors" 
                title={t.delete}
              >
                <Trash2 size={18} className="lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Confirmation Modal Component
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, t }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, confirmText: string, cancelText: string, t: any }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 text-center"
      >
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{cancelText}</button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Component for the Add/Edit Transaction Modal
function TransactionModal({ isOpen, onClose, onSave, editingTransaction, t }: { isOpen: boolean, onClose: () => void, onSave: (tx: Transaction) => void, editingTransaction: Transaction | null, t: any }) {
  // Initialize form data with editing transaction or default values
  const [formData, setFormData] = useState<Transaction>(editingTransaction || {
    type: 'expense',
    amount: 0,
    category: EXPENSE_CATEGORIES[0],
    source: 'InCash',
    source_name: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // State to control visibility of bank/digital money selection
  const [showSourceList, setShowSourceList] = useState(formData.source === 'Digital Money');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Modal Backdrop with Blur Effect */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Close modal on backdrop click
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      {/* Modal Content Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="text-xl font-bold">{editingTransaction ? t.edit : t.addTransaction}</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X size={20} /></button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Transaction Type Toggle (Income vs Expense) */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <button 
              onClick={() => setFormData({ ...formData, type: 'income', category: INCOME_CATEGORIES[0] })}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                formData.type === 'income' ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-500" : "text-zinc-500"
              )}
            >
              {t.income}
            </button>
            <button 
              onClick={() => setFormData({ ...formData, type: 'expense', category: EXPENSE_CATEGORIES[0] })}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                formData.type === 'expense' ? "bg-white dark:bg-zinc-700 shadow-sm text-rose-500" : "text-zinc-500"
              )}
            >
              {t.expense}
            </button>
          </div>

          {/* Amount and Date Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase px-1">{t.amount}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">{t.currency}</span>
                <input 
                  type="number" 
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full p-3 pl-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-ethiopia-green outline-none font-bold text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase px-1">{t.date}</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-ethiopia-green outline-none"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase px-1">{t.category}</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-ethiopia-green outline-none"
            >
              {/* Dynamically show categories based on transaction type */}
              {(formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                <option key={cat} value={cat}>
                  {t.categories[cat as keyof typeof t.categories] || cat}
                </option>
              ))}
            </select>
          </div>

          {/* Source Selection (Only for Income) */}
          {formData.type === 'income' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase px-1">{t.source}</label>
                <div className="flex gap-2">
                  {/* Cash Option */}
                  <button 
                    onClick={() => { setFormData({ ...formData, source: 'InCash', source_name: '' }); setShowSourceList(false); }}
                    className={cn(
                      "flex-1 py-3 rounded-xl border-2 transition-all font-medium",
                      formData.source === 'InCash' ? "border-ethiopia-green bg-ethiopia-green/5 text-ethiopia-green" : "border-transparent bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {t.inCash}
                  </button>
                  {/* Digital Money Option */}
                  <button 
                    onClick={() => { setFormData({ ...formData, source: 'Digital Money' }); setShowSourceList(true); }}
                    className={cn(
                      "flex-1 py-3 rounded-xl border-2 transition-all font-medium",
                      formData.source === 'Digital Money' ? "border-ethiopia-green bg-ethiopia-green/5 text-ethiopia-green" : "border-transparent bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {t.digitalMoney}
                  </button>
                </div>
              </div>

              {/* Digital Money/Bank List (if selected) */}
              {showSourceList && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase px-1">{t.selectSource}</label>
                  <select 
                    value={formData.source_name}
                    onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-ethiopia-green outline-none"
                  >
                    <option value="">-- {t.selectSource} --</option>
                    <optgroup label={t.digitalWallets}>
                      {/* Map through digital wallet options */}
                      {DIGITAL_MONEY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </optgroup>
                    <optgroup label={t.ethiopianBanks}>
                      {/* Map through bank options */}
                      {BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                    </optgroup>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Description Input Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase px-1">{t.description}</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-ethiopia-green outline-none min-h-[100px]"
              placeholder="..."
            />
          </div>
        </div>

        {/* Modal Footer (Cancel and Save Buttons) */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 flex gap-3">
          {/* Cancel Button */}
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">{t.cancel}</button>
          {/* Save Button */}
          <button 
            onClick={() => onSave(formData)} // Trigger save action
            className="flex-1 py-4 rounded-2xl font-bold bg-ethiopia-green text-white shadow-lg shadow-ethiopia-green/20 hover:bg-ethiopia-green/90 transition-all"
          >
            {t.save}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
