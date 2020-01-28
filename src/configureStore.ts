import { applyMiddleware, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import rootReducer, { RootState } from './modules';

const middlewares = [thunk];

if (process.env.NODE_ENV !== 'production') {
  const { createLogger } = window.require('redux-logger');
  const logger = createLogger();
  middlewares.push(logger);
}

const store = createStore(rootReducer, applyMiddleware(...middlewares));
export default store as Store<RootState>;
