import React, { useState, useEffect } from 'react';
import { Provider, defaultTheme } from '@adobe/react-spectrum';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthService, AuthUserProfile } from './auth/authService';
import { AuthPage } from './pages/AuthPage';
import { ModelExplorerPage } from './pages/ModelExplorerPage';

export const App: React.FC = () => {
  const authService = AuthService.getInstance();
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(
    authService.getCurrentUser()
  );

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Provider theme={defaultTheme} colorScheme="light" minHeight="100vh">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="auth-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <AuthPage onAuthenticated={(user) => setCurrentUser(user)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-screen"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.3 }}
          >
            <ModelExplorerPage onSignOut={() => setCurrentUser(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </Provider>
  );
};

export default App;
