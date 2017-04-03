import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';
import UIRoutesManager from '../ui-routes-manager';

const App = ({ routes }) => (
	<div id="app">
		<nav>
			<ul>
				<li><Link to="/">Home</Link></li>
				<li><Link to="/about">About</Link></li>
			</ul>
		</nav>
		<UIRoutesManager routes={routes} />
	</div>
);

App.propTypes = {
	routes: PropTypes.array.isRequired,
};

export default App;
