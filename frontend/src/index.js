import React from 'react';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import { createRoot } from 'react-dom/client';


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
