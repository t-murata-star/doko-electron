import { StylesProvider, ThemeProvider as MaterialThemeProvider } from '@material-ui/styles';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { baseTheme } from './components/materialui/theme';
import App from './components/App';
import './index.css';
import store from './configureStore';

render(
  <StylesProvider injectFirst>
    <MaterialThemeProvider theme={baseTheme}>
      <Provider store={store}>
        <App />
      </Provider>
    </MaterialThemeProvider>
  </StylesProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
