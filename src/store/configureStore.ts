import { createStore, applyMiddleware, Store } from 'redux';
import rootReducer, { RootState } from '../modules';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

const logger = createLogger();
const middlewares = [thunk, logger];
const store = createStore(rootReducer, applyMiddleware(...middlewares));
export default store as Store<RootState>;
