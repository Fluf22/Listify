import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../../hooks/auth';

const PrivateRoute = ({ children, ...rest }: any) => {
	let { user } = useAuth();

	return (
		<Route
			{...rest}
			render={({ location }: any) =>
				user ? (
					children
				) : (
						<Redirect
							to={{
								pathname: "/login",
								state: { from: location }
							}}
						/>
					)
			}
		/>
	);
};

export default PrivateRoute;
