import React, { Suspense } from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import { CircularProgress, Grid } from '@material-ui/core';
import Header from '../Header';
import Main from '../Main';
import ErrorBoundary from './error-boundary';
import ServiceWorkerWrapper from '../ServiceWorkerWrapper';
import useStyles from './styles';
import PrivateRoute from '../Auth/private-route';

const NotFound = React.lazy(() => import('../NotFound'));
const Login = React.lazy(() => import('../Login'));

interface HomeRouteProps {
	slug?: string;
};

const Home = (props: RouteComponentProps<HomeRouteProps>) => {
	const classes = useStyles();

	return (
		<Grid container direction="column" className={classes.root}>
			<Header page={props.match.params.slug} />
			<Grid item container direction="column" className={classes.body}>
				<Grid item container direction="row" className={classes.slug}>
					<ErrorBoundary>
						<Suspense fallback={
							<Grid container justify="center" alignItems="center" className={classes.fallback}>
								<CircularProgress color="secondary" />
							</Grid>
						}>
							<Switch>
								<PrivateRoute exact path="/">
									<Main />
								</PrivateRoute>
								<Route exact path="/login" component={Login} />
								<Route path="*" component={NotFound} />
							</Switch>
						</Suspense>
					</ErrorBoundary>
				</Grid>
			</Grid>
			<ServiceWorkerWrapper />
		</Grid>
	);
};

export default Home;
