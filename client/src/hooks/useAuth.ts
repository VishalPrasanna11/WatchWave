import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const basicAuth = localStorage.getItem('basicAuth');

    if (basicAuth && !isAuthenticated) {
      setIsAuthenticated(true);
    } else if (!basicAuth && isAuthenticated) {
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]);

  return { isAuthenticated };
};