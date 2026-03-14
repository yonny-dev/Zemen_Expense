import React, { useState } from 'react'; // Import React and useState hook
import { motion, AnimatePresence } from 'motion/react'; // Import animation components
import { LogIn, Mail, Lock, ArrowRight, Loader2, AlertCircle, Languages, Moon, Sun } from 'lucide-react'; // Import icons
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '../supabase'; // Import auth functions
import { Language, translations } from '../translations'; // Import translations and types
import { clsx, type ClassValue } from 'clsx'; // Import class merging utility
import { twMerge } from 'tailwind-merge'; // Import tailwind merging utility

// Utility for merging tailwind classes efficiently
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Props interface for the Auth component
interface AuthProps {
  lang: Language; // Current language
  setLang: (lang: Language) => void; // Function to change language
  isDark: boolean; // Current theme mode
  setIsDark: (isDark: boolean) => void; // Function to change theme mode
}

// Authentication modes
type AuthMode = 'signin' | 'signup' | 'reset';

export default function Auth({ lang, setLang, isDark, setIsDark }: AuthProps) {
  const t = translations[lang]; // Get translations for current language
  const [mode, setMode] = useState<AuthMode>('signin'); // State for current auth mode
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input
  const [loading, setLoading] = useState(false); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [message, setMessage] = useState<string | null>(null); // State for success messages

  // Function to calculate password strength score
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 1; // Length check
    if (/[A-Z]/.test(pass)) strength += 1; // Uppercase check
    if (/[0-9]/.test(pass)) strength += 1; // Number check
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1; // Special character check
    return strength;
  };

  const strength = getPasswordStrength(password); // Get current password strength

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true); // Set loading state
    setError(null); // Clear previous errors
    setMessage(null); // Clear previous messages

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password); // Sign in with email/password
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password); // Sign up with email/password
        setMessage(lang === 'en' ? 'Check your email for the confirmation link! If you don\'t see it, check your spam folder.' : 'እባክዎ የኢሜል ማረጋገጫ ሊንኩን ያረጋግጡ! ካላገኙት አይፈለጌ መልዕክት (spam) ውስጥ ይፈልጉ።');
      } else if (mode === 'reset') {
        await resetPassword(email); // Send password reset email
        setMessage(lang === 'en' ? 'Password reset link sent to your email!' : 'የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜልዎ ተልኳል!');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred'); // Set error message
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      {/* Floating Theme and Language Toggles */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 flex gap-2 z-50">
        {/* Theme Toggle Button */}
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 sm:p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
          title={t.theme}
        >
          {isDark ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
        </button>
        {/* Language Toggle Button */}
        <button 
          onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
          className="p-2.5 sm:p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 active:scale-95"
          title={t.language}
        >
          <Languages size={18} className="sm:w-5 sm:h-5" />
          <span className="text-[10px] sm:text-xs font-bold">{lang === 'en' ? 'አማ' : 'EN'}</span>
        </button>
      </div>

      {/* Main Auth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8 space-y-8"
      >
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center text-center">
          <img 
            src="https://i.postimg.cc/pTG830n5/Zemen-expense-logo-removebg.png" 
            alt="Zemen Expense" 
            className="h-24 w-auto object-contain mb-2"
            referrerPolicy="no-referrer"
          />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {lang === 'en' ? 'Your personal Ethiopian finance tracker' : 'የእርስዎ የግል የኢትዮጵያ የገንዘብ መከታተያ'}
          </p>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {/* Auth Form (Changes based on mode) */}
            <motion.form 
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
              {/* Email Input Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                  {lang === 'en' ? 'Email Address' : 'የኢሜል አድራሻ'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-ethiopia-green transition-all"
                  />
                </div>
              </div>

              {/* Password Input Field (Hidden in Reset mode) */}
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                    {lang === 'en' ? 'Password' : 'የይለፍ ቃል'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-ethiopia-green transition-all"
                    />
                  </div>
                  
                  {/* Password Strength Indicator (Only for Sign Up) */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="px-1 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        <span>{t.passwordStrength}</span>
                        <span className={cn(
                          strength <= 1 ? "text-red-500" : strength <= 2 ? "text-yellow-500" : "text-ethiopia-green"
                        )}>
                          {strength <= 1 ? t.weak : strength <= 3 ? t.medium : t.strong}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                        <div className={cn("h-full transition-all duration-500", strength >= 1 ? "bg-red-500 w-1/4" : "w-0")} />
                        <div className={cn("h-full transition-all duration-500", strength >= 2 ? "bg-yellow-500 w-1/4" : "w-0")} />
                        <div className={cn("h-full transition-all duration-500", strength >= 3 ? "bg-yellow-500 w-1/4" : "w-0")} />
                        <div className={cn("h-full transition-all duration-500", strength >= 4 ? "bg-ethiopia-green w-1/4" : "w-0")} />
                      </div>
                      {password.length < 8 && (
                        <p className="text-[10px] text-zinc-400 italic">{t.passwordRequirements}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Error Message Display */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              {/* Success Message Display */}
              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs"
                >
                  {message}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ethiopia-green text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-ethiopia-green/30 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {mode === 'signin' ? (lang === 'en' ? 'Sign In' : 'ግባ') : 
                     mode === 'signup' ? (lang === 'en' ? 'Create Account' : 'አካውንት ፍጠር') : 
                     (lang === 'en' ? 'Send Reset Link' : 'የመቀየሪያ ሊንክ ላክ')}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">
                {lang === 'en' ? 'Or continue with' : 'ወይም በዚህ ይቀጥሉ'}
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button 
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3.5 rounded-2xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm active:scale-[0.98]"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />
            <span className="text-sm">{lang === 'en' ? 'Google' : 'Google'}</span>
          </button>

          {/* Mode Switcher Links */}
          <div className="flex flex-col gap-2 text-center text-sm">
            {mode === 'signin' ? (
              <>
                <button onClick={() => setMode('signup')} className="text-ethiopia-green font-semibold hover:underline">
                  {lang === 'en' ? "Don't have an account? Sign Up" : 'አካውንት የለዎትም? ይመዝገቡ'}
                </button>
                <button onClick={() => setMode('reset')} className="text-zinc-500 text-xs hover:underline">
                  {lang === 'en' ? 'Forgot password?' : 'የይለፍ ቃል ረስተዋል?'}
                </button>
              </>
            ) : mode === 'signup' ? (
              <button onClick={() => setMode('signin')} className="text-ethiopia-green font-semibold hover:underline">
                {lang === 'en' ? 'Already have an account? Sign In' : 'አካውንት አለዎት? ይግቡ'}
              </button>
            ) : (
              <button onClick={() => setMode('signin')} className="text-ethiopia-green font-semibold hover:underline">
                {lang === 'en' ? 'Back to Sign In' : 'ወደ መግቢያ ይመለሱ'}
              </button>
            )}
          </div>
        </div>

        {/* Legal Footer */}
        <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
          {lang === 'en' 
            ? 'By signing in, you agree to our Terms of Service and Privacy Policy.' 
            : 'በመግባትዎ በአገልግሎት ውላችን እና በግላዊነት ፖሊሲያችን ተስማምተዋል።'}
        </p>
      </motion.div>
    </div>
  );
}
