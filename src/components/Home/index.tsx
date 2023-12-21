import React, { Suspense } from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import { CircularProgress, Grid, useMediaQuery } from '@material-ui/core';
import Header from '../Header';
import ErrorBoundary from './error-boundary';
import ServiceWorkerWrapper from '../ServiceWorkerWrapper';
import useStyles from './styles';
import Footer from '../Footer';
import ProvideAuth from "../Auth/provide-auth";

const NotFound = React.lazy(() => import('../NotFound'));
const Login = React.lazy(() => import('../Login'));
const PrivateRoute = React.lazy(() => import('../Auth/private-route'));
const MyWishes = React.lazy(() => import('../MyWishes'));
const WishLists = React.lazy(() => import('../WishLists'));

interface HomeRouteProps {
	slug?: string;
};

const Home = (props: RouteComponentProps<HomeRouteProps>) => {
	const isMobile = useMediaQuery('(max-width:555px)');
	const classes = useStyles(isMobile);

	return (
		<ProvideAuth>
			<Grid container direction="column" className={classes.root}>
				<Header page={props.match.params.slug || ""} />
				<Grid item container direction="column" className={classes.body}>
					<Grid item container direction="row" className={classes.slug}>
						<ErrorBoundary>
							<Suspense fallback={
								<Grid container justifyContent="center" alignItems="center" className={classes.fallback}>
									<CircularProgress color="secondary" />
								</Grid>
							}>
								<Switch>
									<PrivateRoute path="/lists/:wishesUserMail?">
										<WishLists />
									</PrivateRoute>
									<PrivateRoute exact path="/">
										<MyWishes />
									</PrivateRoute>
									<Route exact path="/login" component={Login} />
									<Route path="*" component={NotFound} />
								</Switch>
							</Suspense>
						</ErrorBoundary>
					</Grid>
				</Grid>
				{
					isMobile ? (
						<Footer page={props.match.params.slug || ""} />
					) : ("")
				}
				<ServiceWorkerWrapper />
			</Grid>
		</ProvideAuth>
	);
};

export default Home;
