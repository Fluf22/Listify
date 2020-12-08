import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import useStyles from './styles';

const Main = () => {
	const classes = useStyles();

	return (
		<Grid item container direction="column" className={classes.description} justify="space-around">
			<Helmet>
				<title>Home - Caudex</title>
				<meta name="description" content="Homepage of Caudex" />
			</Helmet>
			<Grid item container direction="column" justify="space-evenly" className={classes.paragraph}>
				<Grid item>
					<Typography variant="h4">
						Page sécurisée
					</Typography>
				</Grid>
				<Grid item className={classes.paragraphText}>
					<Typography>
						Vous etes connecté si vous pouvez voir cette page
					</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default Main;
