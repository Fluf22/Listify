import React from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import HomeIcon from '@material-ui/icons/Home';
import { RouteComponentProps } from 'react-router-dom';
import useStyles from './styles';

const NotFound = (props: RouteComponentProps) => {
	const classes = useStyles();

	return (
		<Grid className={classes.root} container direction="column" justify="center" alignItems="center">
			<Typography variant="h1" className={classes.mainText}>404</Typography>
			<Grid container item justify="center">
				<Button
					variant="contained"
					className={classes.button}
					startIcon={<KeyboardArrowLeftIcon />}
					onClick={() => props.history.goBack()}
				>
					<span className={classes.buttonText}>Back</span>
				</Button>
				<Button
					variant="contained"
					className={classes.button}
					endIcon={<HomeIcon />}
					onClick={() => props.history.push("/")}
				>
					<span className={classes.buttonText}>Home</span>
				</Button>
			</Grid>
		</Grid>
	);
};

export default NotFound;
