import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware as createRouterMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';
import reducers from '../reducers';

export default (h) => {
	const routerMiddleware = createRouterMiddleware(h);
	const sagaMiddleware = createSagaMiddleware();
	const loggerMiddleware = createLogger();
	const middleware = applyMiddleware(
		routerMiddleware,
		sagaMiddleware,
		loggerMiddleware,
	);
	const store = createStore(reducers, middleware);
	store.runSaga = sagaMiddleware.run;
	return store;
};
