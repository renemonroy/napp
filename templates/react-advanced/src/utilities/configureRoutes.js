import views from '../components/views';

export default () => (
	[
		{
			path: '/',
			exact: true,
			component: views.Home,
			key: 'home-view',
		},
		{
			path: '/about',
			exact: true,
			component: views.About,
			key: 'about-view',
		},
	]
);
