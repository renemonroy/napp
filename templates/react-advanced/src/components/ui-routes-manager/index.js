import React, { PropTypes } from 'react';
import { Route, Switch } from 'react-router-dom';

const UIRoutesManager = ({ routes }) => (
	<Switch>
		{routes.map(route => (
			<Route {...route} />
		))}
	</Switch>
);

UIRoutesManager.propTypes = {
	routes: PropTypes.array.isRequired,
};

UIRoutesManager.defaultProps = {
	routes: [],
};

export default UIRoutesManager;
