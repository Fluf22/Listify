import React, { useEffect, useState } from 'react';
import { Button, Card, CardActions, CardContent, CircularProgress, Grid, Typography, Dialog, AppBar, Toolbar, DialogContent, IconButton, Slide } from '@material-ui/core';
import { IUser } from '../../interfaces';
import { Helmet } from 'react-helmet';
import WarningIcon from '@material-ui/icons/Warning';
import CloseIcon from '@material-ui/icons/Close';
import useStyles from './styles';
import { useGetUsers } from '../../queries/users';
import { useHistory, useParams } from 'react-router-dom';
import UserWishes from '../UserWishes';

const Transition: any = React.forwardRef((props: any, ref: any) => {
	return <Slide direction="up" ref={ref} {...props} />;
});

const WishLists = () => {
	const classes = useStyles();
	const history = useHistory();
	const { wishesUserMail }: { wishesUserMail: string | undefined } = useParams();
	const { isError, isLoading, data: users } = useGetUsers();
	const [openedList, setOpenedList] = useState<IUser | undefined>(wishesUserMail ? users?.find((user: IUser) => user.email === wishesUserMail) : undefined);

	useEffect(() => {
		if (!isLoading) {
			setOpenedList(wishesUserMail ? users?.find((user: IUser) => user.email === wishesUserMail) : undefined);
		}
	}, [isLoading, users, wishesUserMail]);

	const handleSeeList = (email: string) => {
		if (wishesUserMail !== email) {
			history.push(`/lists/${email}`);
		}
	};

	const handleCloseList = () => {
		setOpenedList(undefined);
		history.push("/lists");
	};

	return (
		<Grid item container direction="column" justify="space-between" className={classes.description}>
			<Helmet>
				<title>{openedList === undefined ? "Toutes les listes" : `Liste de ${openedList.name}`} - Caudex</title>
				<meta name="description" content="Toutes les listes - Caudex" />
			</Helmet>
			{
				isLoading ? (
					<Grid container justify="center" alignItems="center" className={classes.fallback}>
						<CircularProgress color="secondary" />
					</Grid>
				) : isError ? (
					<Grid container direction="column" justify="center" alignItems="center" style={{ height: "calc(100% - 64px)" }}>
						<WarningIcon style={{ fontSize: "80px" }} />
						<Typography style={{ fontSize: "40px" }}>An error as occured</Typography>
						<Typography style={{ fontSize: "40px" }}>Please reload the page</Typography>
					</Grid>
				) : (
							<Grid item container direction="row" wrap="wrap">
								{
									users?.map((user: IUser, idx: number) => (
										<Grid key={btoa((new Date()).toString() + idx.toString())} item container justify="center" xs={12} sm={6} lg={4} xl={2} style={{ marginBottom: "22px" }}>
											<Card key={idx} className={classes.cardRoot} color="primary">
												<CardContent>
													<Typography variant="h5" component="h2" color="primary">
														{user.name}
													</Typography>
													<Typography color="textSecondary">
														{user.email}
													</Typography>
												</CardContent>
												<CardActions>
													<Button size="small" onClick={() => handleSeeList(user.email)}>Voir la liste</Button>
												</CardActions>
											</Card>
										</Grid>
									))
								}
								{
									[0, 1, 2, 3, 4, 5].map((item: number) => (
										<Grid key={item} item xs={12} sm={6} lg={4} xl={2} style={{ height: "0px", padding: "0px" }}>
										</Grid>
									))
								}
							</Grid>
						)
			}
			<Dialog fullScreen open={openedList !== undefined} onClose={() => handleCloseList()} TransitionComponent={Transition}>
				<AppBar className={classes.appBar}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={() => handleCloseList()} aria-label="close">
							<CloseIcon />
						</IconButton>
						<Typography variant="h6" className={classes.title}>
							{`Liste de ${openedList?.name}`}
						</Typography>
					</Toolbar>
				</AppBar>
				<DialogContent>
					{
						openedList?.email !== undefined ? (
							<UserWishes user={openedList?.email} />
						) : (
								<Grid container justify="center" alignItems="center" className={classes.fallback}>
									<CircularProgress color="secondary" />
								</Grid>
							)
					}
				</DialogContent>
			</Dialog>
		</Grid>
	);
};

export default WishLists;
