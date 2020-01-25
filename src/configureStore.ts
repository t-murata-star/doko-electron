import { applyMiddleware, createStore, Store } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import rootReducer, { RootState } from './modules';

const logger = createLogger();
const middlewares = [thunk, logger];
const store = createStore(rootReducer, applyMiddleware(...middlewares));
export default store as Store<RootState>;
