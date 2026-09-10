import React from 'react';
import { Provider, defaultTheme } from '@adobe/react-spectrum';
import { ModelExplorerPage } from './pages/ModelExplorerPage';

export const App: React.FC = () => {
  return (
    <Provider theme={defaultTheme} colorScheme="light" minHeight="100vh">
      <ModelExplorerPage />
    </Provider>
  );
};

export default App;
