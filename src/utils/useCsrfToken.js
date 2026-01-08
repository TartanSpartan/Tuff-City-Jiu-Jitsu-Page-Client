import { useState, useEffect } from 'react';

/**
 * Custom hook to asynchronously retrieve the CSRF token from the backend
 * via the designated API endpoint (/csrf_token).
 * returns {{status: 'idle'|'loading'|'loaded'|'error', token: string | null}}
 */
export function useCsrfToken() {
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState('loading'); // Start in loading state

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/csrf_token`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.csrf_token) {
          setToken(data.csrf_token);
          setStatus('loaded');
          console.log("CSRF Token fetched SUCCESSFULLY via API."); 
        } else {
          throw new Error("CSRF token missing in API response data.");
        }

      } catch (error) {
        console.error("Error fetching CSRF token:", error);
        setStatus('error');
        setToken(null);
      }
    };
    fetchCsrfToken();
  }, []);

  return { token, status };
}
