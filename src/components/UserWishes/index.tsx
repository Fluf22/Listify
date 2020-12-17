import React, { useState } from 'react';
import { useDeleteWish, useGetAllWishes, usePostWish, usePutWish } from '../../queries/wishes';
import WarningIcon from '@material-ui/icons/Warning';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import useStyles from './styles';
import { Grid, CircularProgress, Typography, Card, CardContent, CardActions, Button, useMediaQuery, AppBar, Dialog, DialogActions, DialogContent, Fab, IconButton, TextField, Toolbar, Slide } from '@material-ui/core';
import { IWish } from '../../interfaces';
import netlifyIdentity from 'netlify-identity-widget';
import { useSnackbar } from 'notistack';

interface IUserWishesProps {
	user: string;
};

const Transition: any = React.forwardRef((props: any, ref: any) => {
	return <Slide direction="up" ref={ref} {...props} />;
});

const UserWishes = (props: IUserWishesProps) => {
	const isMobile = useMediaQuery('(max-width:555px)');
	const classes = useStyles(isMobile);
	const { isLoading, isError, data: wishes } = useGetAllWishes(props.user);
	const { mutate: createWish } = usePostWish();
	const { mutate: editWish } = usePutWish();
	const { mutate: deleteWish } = useDeleteWish();
	const [wish, setWish] = useState<IWish | undefined>(undefined);
	const [deleteWishWithID, setDeleteWishWithID] = useState<string | undefined>(undefined);
	const { enqueueSnackbar } = useSnackbar();

	const openCreateEditWishDialog = (wishID: string | undefined) => {
		console.log("data: ", wishes);
		const wishObject: IWish = {
			id: "",
			title: "",
			link: "",
			imageURL: "",
			price: "",
			created: {
				for: props.user || ""
			}
		};
		if (wishID === undefined) {
			setWish(wishObject);
		} else {
			setWish(Object.assign({}, wishObject, wishes?.find((wish: any) => wish.id === wishID)));
		}
	};

	const handleCreateEditWish = () => {
		if (wish && wish.title === "") {
			enqueueSnackbar("Un titre est nécessaire !", { variant: "warning" });
			return;
		}
		const wishToPost = Object.assign({}, wish);
		delete wishToPost.id;
		if (wish?.id === "") {
			console.log("New wish: ", wishToPost);
			createWish(wishToPost);
			setWish(undefined);
		} else {
			console.log("Edit wish: ", wishToPost);
			editWish({ wishID: wish?.id || "-1", wishToPost });
			setWish(undefined);
		}
	};

	const handleDeleteWish = () => {
		if (deleteWishWithID !== undefined) {
			console.log("Delete wish: ", wishes?.find((wish: any) => wish.id === deleteWishWithID));
			deleteWish(deleteWishWithID);
			setDeleteWishWithID(undefined);
		}
	};

	const handleOpenWish = (link: string) => {
		window.open(link, "_blank");
	};

	return (
		<Grid container direction="row" style={{ height: "100%" }}>
			{
				isLoading ? (
					<Grid container justify="center" alignItems="center" className={classes.fallback}>
						<CircularProgress color="primary" />
					</Grid>
				) : isError ? (
					<Grid container direction="column" justify="center" alignItems="center" style={{ height: "calc(100% - 64px)" }}>
						<WarningIcon style={{ fontSize: "80px" }} />
						<Typography style={{ fontSize: "40px" }}>An error as occured</Typography>
						<Typography style={{ fontSize: "40px" }}>Please reload the page</Typography>
					</Grid>
				) : (
							<Grid item container direction="row" wrap="wrap" spacing={3} justify="space-around">
								{
									wishes?.map((wish: IWish, idx: number) => (
										<Grid key={btoa((new Date()).toString() + idx.toString())} item container justify="center" xs={12} sm={6} lg={4} xl={2} style={{ marginBottom: "22px" }} className={classes.cardGridItem}>
											<Card className={classes.cardRoot} variant="outlined">
												<CardContent>
													<Typography variant="h5" component="h2" color="secondary">
														{wish.title}
													</Typography>
													<Typography color="textSecondary">
														{
															wish.created.by !== wish.created.for ? (`Proposé par : ${wish.created.by}`) : ""
														}
													</Typography>
													<Typography color="textSecondary">
														{
															wish.offeredBy && wish.offeredBy?.length > 0 ? (`Offert par : ${wish.offeredBy.map(el => el.name).join(", ")}`) : ""
														}
													</Typography>
												</CardContent>
												<CardActions>
													<Grid container direction="row" justify="space-between" alignItems="center">
														{
															wish.created.by === netlifyIdentity.currentUser()?.email ? (
																<Grid item container direction="row" spacing={1} style={{ maxWidth: "50%" }}>
																	<Grid item>
																		<Button variant="contained" color="secondary" onClick={() => setDeleteWishWithID(wish.id)}>
																			<DeleteIcon color="primary" />
																		</Button>
																	</Grid>
																	<Grid item>
																		<Button variant="contained" color="secondary" onClick={() => openCreateEditWishDialog(wish.id)}>
																			<EditIcon color="primary" />
																		</Button>
																	</Grid>
																</Grid>
															) : (
																<Grid item style={{ maxWidth: "50%" }}>
																</Grid>
															)
														}
														<Grid item style={{ maxWidth: "50%", display: "flex", justifyContent: "flex-end" }}>
															{
																wish.link !== "" ? (
																	<Button variant="contained" color="secondary" onClick={() => handleOpenWish(wish.link)}>
																		<span style={{ color: "#e8272c" }}>Voir</span>
																		<OpenInNewIcon color="primary" style={{ marginLeft: "7px" }} />
																	</Button>
																) : ("")
															}
														</Grid>
													</Grid>
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
			<Fab aria-label="add wish" onClick={() => openCreateEditWishDialog(undefined)} className={classes.addWishFab}>
				<AddIcon color="secondary" />
			</Fab>
			<Dialog fullScreen open={wish !== undefined} onClose={() => setWish(undefined)} TransitionComponent={Transition}>
				<AppBar className={classes.appBar}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={() => setWish(undefined)} aria-label="close">
							<CloseIcon />
						</IconButton>
						<Typography variant="h6" className={classes.title}>
							{
								wish?.id === "" ? "Nouvelle idée" : "Modifier une idée"
							}
						</Typography>
						<Button autoFocus color="inherit" onClick={() => handleCreateEditWish()}>
							{
								wish?.id === "" ? "Sauvegarder" : "Mettre à jour"
							}
						</Button>
					</Toolbar>
				</AppBar>
				<DialogContent>
					<TextField
						label="Titre"
						variant="outlined"
						value={wish?.title}
						onChange={({ target: { value } }) => setWish(Object.assign({}, wish, { title: value }))}
						style={{ marginTop: "13px" }}
						fullWidth
						required
					/>
					<TextField
						label="Lien (optionnel)"
						variant="outlined"
						value={wish?.link}
						onChange={({ target: { value } }) => setWish(Object.assign({}, wish, { link: value }))}
						style={{ marginTop: "13px" }}
						fullWidth
					/>
					<TextField
						label="Image (optionnel)"
						variant="outlined"
						value={wish?.imageURL}
						onChange={({ target: { value } }) => setWish(Object.assign({}, wish, { imageURL: value }))}
						style={{ marginTop: "13px" }}
						fullWidth
					/>
					<TextField
						label="Prix (optionnel)"
						variant="outlined"
						value={wish?.price}
						onChange={({ target: { value } }) => setWish(Object.assign({}, wish, { price: value }))}
						style={{ marginTop: "13px" }}
						fullWidth
					/>
				</DialogContent>
			</Dialog>
			<Dialog open={deleteWishWithID !== undefined} onClose={() => setDeleteWishWithID(undefined)} TransitionComponent={Transition}>
				<AppBar className={classes.appBar}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={() => setDeleteWishWithID(undefined)} aria-label="close">
							<CloseIcon />
						</IconButton>
						<Typography variant="h6" className={classes.title}>
							Supprimer un élément
						</Typography>
					</Toolbar>
				</AppBar>
				<DialogContent>
					Voulez-vous vraiment supprimer cet élément ?
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteWishWithID(undefined)} color="primary">
						Annuler
					</Button>
					<Button onClick={() => handleDeleteWish()} color="primary">
						Supprimer
					</Button>
				</DialogActions>
			</Dialog>
		</Grid>
	);
};

export default UserWishes;
