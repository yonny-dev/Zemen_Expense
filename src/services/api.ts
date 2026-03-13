import { supabase } from '../supabase'; // Import the Supabase client instance
import { Transaction } from '../types'; // Import the Transaction type definition

// Export an API object containing database interaction methods
export const api = {
  // Method to subscribe to real-time transaction updates
  subscribeTransactions: (callback: (transactions: Transaction[]) => void) => {
    // Perform an initial fetch of transactions and pass them to the callback
    api.getTransactions().then(callback);

    // Set up a real-time subscription channel for the 'transactions' table
    const subscription = supabase
      .channel('public:transactions') // Name of the channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        // When any change (insert, update, delete) occurs, re-fetch and update the UI
        api.getTransactions().then(callback);
      })
      .subscribe(); // Start listening

    // Return a cleanup function to unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(subscription);
    };
  },

  // Method to fetch all transactions for the currently logged-in user
  getTransactions: async () => {
    // Get the current user's information from Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return []; // If no user is logged in, return an empty list

    // Query the 'transactions' table for rows belonging to the user
    const { data, error } = await supabase
      .from('transactions') // Target table
      .select('*') // Select all columns
      .eq('user_id', user.id) // Filter by user ID
      .order('date', { ascending: false }); // Order by date, newest first

    if (error) {
      // Log any errors that occur during the fetch
      console.error('Error fetching transactions:', error);
      return [];
    }

    // Return the fetched data cast as an array of Transactions
    return data as Transaction[];
  },

  // Method to add a new transaction to the database
  addTransaction: async (transaction: Transaction) => {
    // Get the current user's information
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated'); // Ensure user is logged in

    // Insert a new row into the 'transactions' table
    const { error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction, // Spread the transaction data (amount, category, etc.)
        user_id: user.id, // Attach the user's ID for security (RLS)
        created_at: new Date().toISOString() // Set the creation timestamp
      }]);

    if (error) throw error; // Throw error if insertion fails
  },

  // Method to update an existing transaction
  updateTransaction: async (id: string | number, transaction: Partial<Transaction>) => {
    // Update the row where the ID matches
    const { error } = await supabase
      .from('transactions')
      .update(transaction) // Apply the partial updates
      .eq('id', id); // Match by transaction ID

    if (error) throw error; // Throw error if update fails
  },

  // Method to delete a transaction
  deleteTransaction: async (id: string | number) => {
    // Delete the row where the ID matches
    const { error } = await supabase
      .from('transactions')
      .delete() // Perform deletion
      .eq('id', id); // Match by transaction ID

    if (error) throw error; // Throw error if deletion fails
  }
};
