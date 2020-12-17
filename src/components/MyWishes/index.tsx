import React from 'react';
import { Grid, CircularProgress, useMediaQuery } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import useStyles from './styles';
import netlifyIdentity from 'netlify-identity-widget';
import UserWishes from '../UserWishes';

const MyWishes = () => {
	const isMobile = useMediaQuery('(max-width:555px)');
	const classes = useStyles(isMobile);
	const netlifyUser = netlifyIdentity.currentUser();

	return (
		<Grid item container direction="column" justify="space-between" className={classes.description}>
			<Helmet>
				<title>Ma liste - Caudex</title>
				<meta name="description" content="My wishes - Caudex" />
			</Helmet>
			{
				netlifyUser ? (
					<UserWishes user={netlifyUser.email} />
				) : (
					<Grid container justify="center" alignItems="center" className={classes.fallback}>
						<CircularProgress color="secondary" />
					</Grid>
				)
			}
		</Grid>
	);
};

export default MyWishes;
