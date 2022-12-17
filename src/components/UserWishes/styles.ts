import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => createStyles({
	description: {
		padding: theme.spacing(3),
	},
	fallback: {
		height: "calc(100% - 64px)"
	},
	cardGridItem: {
		minHeight: "300px",
		flexGrow: 1
	},
	cardRoot: {
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		backgroundColor: "#e8272c"
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
		bottom: isMobile ? "76px" : "20px",
		backgroundColor: "#13aa52 !important"
	})
}));

export default useStyles;
