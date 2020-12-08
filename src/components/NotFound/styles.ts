import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => createStyles({
	root: {
		height: "calc(100% - 64px)",
		color: "#fff"
	},
	mainText: {
		fontSize: "50vmin"
	},
	button: {
		margin: theme.spacing(1),
	},
	buttonText: {
		marginTop: "2px"
	}
}));

export default useStyles;
