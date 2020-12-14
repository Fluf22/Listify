import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => createStyles({
	root: {
		height: "calc(100% - 64px)"
	},
	description: {
		padding: theme.spacing(3),
	},
	paragraph: {
		marginBottom: "50px"
	},
	paragraphText: {
		paddingLeft: theme.spacing(3),
		marginTop: "30px"
	},
	fallback: {
		height: "calc(100% - 64px)"
	},
	appBar: {
		position: "relative"
	},
	title: {
		marginLeft: theme.spacing(2),
		flex: 1,
	},
	addWishFab: isMobile => ({
		position: "fixed",
		right: "20px",
		bottom: isMobile ? "76px" : "20px"
	})
}));

export default useStyles;
