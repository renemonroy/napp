import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter } from 'react-router-redux';
import App from './components/app';
import mainSaga from './sagas';
import configureStore from './utilities/configureStore';
import configureRoutes from './utilities/configureRoutes';

const history = createHistory();
const store = configureStore(history);
const routes = configureRoutes();
store.runSaga(mainSaga);

document.addEventListener('DOMContentLoaded', () => {
	ReactDOM.render(
		<Provider store={store}>
			<ConnectedRouter history={history}>
				<App routes={routes} />
			</ConnectedRouter>
		</Provider>,
		document.getElementById('root'),
  );
});
