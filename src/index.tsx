import React from 'react';
import './index.css';
import AppPanel from './containers/AppPanel';
import * as serviceWorker from './serviceWorker';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store/configureStore';
import { ThemeProvider as MaterialThemeProvider, StylesProvider } from '@material-ui/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from './components/materialui/theme';

render(
  <StylesProvider injectFirst>
    <MaterialThemeProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        <Provider store={store}>
          <AppPanel />
        </Provider>
      </StyledThemeProvider>
    </MaterialThemeProvider>
  </StylesProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
