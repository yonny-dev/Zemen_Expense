import {StrictMode} from 'react'; // Import StrictMode for highlighting potential problems
import {createRoot} from 'react-dom/client'; // Import createRoot for rendering the app
import App from './App.tsx'; // Import the main App component
import './index.css'; // Import global styles

// Create the root element and render the App component
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
