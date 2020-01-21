import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../modules';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

const logger = createLogger();
const middlewares = [thunk, logger];
const store = createStore(rootReducer, applyMiddleware(...middlewares));
export default store;
