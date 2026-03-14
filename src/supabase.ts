/// <reference types="vite/client" /> // Provides TypeScript types for Vite's environment variables
import { createClient } from '@supabase/supabase-js'; // Imports the function to create a Supabase client

// Retrieves the Supabase URL from environment variables or uses a fallback URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rsnajrooytfgcxemwovp.supabase.co';
// Retrieves the Supabase Anon Key from environment variables or uses a fallback key
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbmFqcm9veXRmZ2N4ZW13b3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzQwMTAsImV4cCI6MjA4ODk1MDAxMH0.2-ZtY37gkd3YRzKanKc5702LIQXTsL3Z65HMGOtgJyU';

// Initializes and exports the Supabase client instance for use throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to handle Google OAuth sign-in
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google', // Specifies Google as the authentication provider
    options: {
      redirectTo: window.location.origin, // Redirects back to the app's home page after login
    },
  });
  if (error) throw error; // Throws an error if sign-in fails
};

// Function to handle user sign-up with email and password
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email, // User's email address
    password, // User's chosen password
    options: {
      emailRedirectTo: window.location.origin, // Redirects back to the app after email confirmation
    },
  });
  if (error) throw error; // Throws an error if sign-up fails
  return data; // Returns the created user data
};

// Function to handle user sign-in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, // User's email address
    password, // User's password
  });
  if (error) throw error; // Throws an error if sign-in fails
  return data; // Returns the session data
};

// Function to trigger a password reset email
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`, // URL to handle password reset
  });
  if (error) throw error; // Throws an error if the request fails
};

// Function to sign out the current user
export const logout = async () => {
  const { error } = await supabase.auth.signOut(); // Calls Supabase sign-out
  if (error) throw error; // Throws an error if sign-out fails
};
