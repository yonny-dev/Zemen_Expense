import tailwindcss from '@tailwindcss/vite'; // Import the Tailwind CSS plugin for Vite
import react from '@vitejs/plugin-react'; // Import the React plugin for Vite to support JSX and Fast Refresh
import path from 'path'; // Import the Node.js path module for handling file paths
import {defineConfig, loadEnv} from 'vite'; // Import Vite's configuration helper and environment loader

export default defineConfig(({mode}) => { // Export the Vite configuration using the defineConfig helper
  const env = loadEnv(mode, '.', ''); // Load environment variables from the root directory based on the current mode
  return { // Return the configuration object
    plugins: [react(), tailwindcss()], // Register the React and Tailwind CSS plugins
    define: { // Define global constants that will be replaced during build time
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY), // Inject the GEMINI_API_KEY from environment variables into process.env
    }, // End of define
    resolve: { // Configure module resolution options
      alias: { // Define path aliases for cleaner imports
        '@': path.resolve(__dirname, '.'), // Map the '@' symbol to the root directory
      }, // End of alias
    }, // End of resolve
    server: { // Configure the development server options
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true', // Enable or disable Hot Module Replacement based on the DISABLE_HMR environment variable
    }, // End of server
  }; // End of configuration object
}); // End of defineConfig
