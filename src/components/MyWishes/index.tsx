import React, { useState } from 'react';
import { CircularProgress, Grid, Typography, Button, AppBar, Dialog, IconButton, Toolbar, Slide, DialogContent, TextField, DialogActions, Fab, useMediaQuery } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import useStyles from './styles';
import { useGetAllWishes, usePostWish, usePutWish, useDeleteWish } from '../../queries';
import WarningIcon from '@material-ui/icons/Warning';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CloseIcon from '@material-ui/icons/Close';
import netlifyIdentity from 'netlify-identity-widget';
import { IWish } from '../../interfaces';

const Transition: any = React.forwardRef((props: any, ref: any) => {
	return <Slide direction="up" ref={ref} {...props} />;
});

const MyWishes = () => {
	const isMobile = useMediaQuery('(max-width:555px)');
	const classes = useStyles(isMobile);
	const { isLoading, isError, data } = useGetAllWishes();
	const { mutate: createWish } = usePostWish();
	const { mutate: editWish } = usePutWish();
	const { mutate: deleteWish } = useDeleteWish();
	const [wish, setWish] = useState<IWish | undefined>(undefined);
	const [deleteWishWithID, setDeleteWishWithID] = useState<string | undefined>(undefined);

	const openCreateEditWishDialog = (wishID: string | undefined) => {
		console.log("data: ", data);
		const wishObject: IWish = {
			id: "",
			title: "",
			link: "",
			imageURL: "",
			price: "",
			created: {
				for: netlifyIdentity.currentUser()?.email || ""
			}
		};
		if (wishID === undefined) {
			setWish(wishObject);
		} else {
			setWish(Object.assign({}, wishObject, data?.wishes?.find((wish: any) => wish.id === wishID)));
		}
	};

	const handleCreateEditWish = () => {
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
			console.log("Delete wish: ", data?.wishes?.find((wish: any) => wish.id === deleteWishWithID));
			deleteWish(deleteWishWithID);
			setDeleteWishWithID(undefined);
		}
	};

	const handleOpenWish = (link: string) => {
		window.open(link, "_blank");
	};

	return (
		<Grid item container direction="column" justify="space-between" className={classes.description}>
			<Helmet>
				<title>Ma liste - Caudex</title>
				<meta name="description" content="My wishes - Caudex" />
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
				) : (<Grid item container direction="row" wrap="wrap" spacing={3} justify="space-around">
					{
						data?.wishes.map((wish: any, idx: number) => (
							<Grid
								key={btoa((new Date()).toUTCString() + `${idx}`)}
								item
								container
								direction="column"
								justify="space-between"
								xs={12}
								sm={6}
								lg={3}
								style={{
									height: "300px",
									border: "1px white solid",
									borderRadius: "5px",
									margin: "20px",
									flexGrow: 1
								}}
							>
								<Grid item container direction="row-reverse" spacing={1}>
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
								<Grid item style={{ flexGrow: 1 }}>
									<Typography variant="h4">{wish.title}</Typography>
								</Grid>
								<Grid item container direction="row-reverse">
									<Grid item>
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
							</Grid>
						))
					}
					{
						[0, 1, 2, 3, 4].map((item: number) => (
							<Grid
								key={btoa((new Date()).toUTCString() + `${item}`)}
								item
								container
								direction="column"
								xs={12}
								sm={6}
								lg={3}
								style={{
									width: "300px",
									height: "0px",
									margin: "0 20px",
									padding: "0px"
								}}
							>
							</Grid>
						))
					}
				</Grid>)
			}
			<Fab color="secondary" aria-label="add wish" onClick={() => openCreateEditWishDialog(undefined)} className={classes.addWishFab}>
				<AddIcon color="primary" />
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

export default MyWishes;
