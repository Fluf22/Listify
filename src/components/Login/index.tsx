import React from 'react';
import {useHistory, useLocation, Redirect} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {Button, Grid, Typography} from '@material-ui/core';
import { useAuth } from '../../hooks/auth';
import useStyles from './styles';

const Login = () => {
	const classes = useStyles();
	const history = useHistory();
	const location = useLocation();
	const { user, open } = useAuth();

	const { from }: any = location.state || { from: { pathname: "/" } };

	const handleOpen = (user: any) => {
		console.log("Logged in user: ", user);
		history.replace(from);
	};

	if (user === null) {
		return (
			<Grid item container direction="column" className={classes.description} justifyContent="space-around">
				<Helmet>
					<title>Home - Caudex</title>
					<meta name="description" content="Homepage of Caudex" />
				</Helmet>
				<Grid item container direction="column" justifyContent="space-evenly" className={classes.paragraph}>
					<Grid item>
						<Typography variant="h4">
							Connexion nécessaire
						</Typography>
					</Grid>
					<Grid item className={classes.paragraphText}>
						<Typography>
							Vous devez vous connecter pour accéder au site
						</Typography>
					</Grid>
					<Grid item>
						<Button onClick={() => open("signup", handleOpen)} className={classes.signupLink}>S'inscrire</Button>
						<Button onClick={() => open("login", handleOpen)} className={classes.signupLink}>Se connecter</Button>
					</Grid>
				</Grid>
			</Grid>
		);
	} else {
		return (
			<Redirect to={from} />
		);
	}
};

export default Login;
