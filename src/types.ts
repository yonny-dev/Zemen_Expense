// Defines the allowed types for a transaction: either 'income' or 'expense'
export type TransactionType = 'income' | 'expense';

// Interface defining the structure of a Transaction object
export interface Transaction {
  id?: string | number; // Optional unique identifier (UUID from database)
  type: TransactionType; // Whether it's an income or an expense
  amount: number; // The monetary value of the transaction
  category: string; // The category (e.g., 'Food', 'Salary')
  source?: string; // Optional source type: 'InCash' or 'Digital Money'
  source_name?: string; // Optional specific source name: 'Telebirr', 'CBE', etc.
  date: string; // The date of the transaction in YYYY-MM-DD format
  description: string; // A brief note or description
  created_at?: string; // Optional timestamp of when it was recorded
}

// Interface for summary statistics
export interface Stats {
  type: TransactionType; // Type of transaction being summarized
  total: number; // Total sum for that type
}

// List of available digital wallet options in Ethiopia
export const DIGITAL_MONEY_OPTIONS = ['Telebirr', 'M-Pesa', 'e-Birr'];

// List of major Ethiopian banks
export const BANKS = [
  'Commercial Bank of Ethiopia (CBE)', 'Awash Bank', 'Dashen Bank', 'Abay Bank',
  'Addis International Bank', 'Amhara Bank', 'Berhan Bank', 'Bunna Bank',
  'Cooperative Bank of Oromia', 'Debub Global Bank', 'Enat Bank', 'Lion Bank',
  'Nib Bank', 'Oromia International Bank', 'Siinqee Bank', 'Tsehay Bank',
  'Tsedey Bank', 'Wegagen Bank', 'United Bank', 'Zemen Bank'
];

// Predefined categories for expenses
export const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'
];

// Predefined categories for income
export const INCOME_CATEGORIES = [
  'Salary', 'Side Hustle', 'Bonus', 'Gift', 'Investment', 'Other'
];
