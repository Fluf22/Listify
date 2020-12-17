import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => createStyles({
	description: {
		padding: theme.spacing(3),
	},
	fallback: {
		height: "calc(100% - 64px)"
	},
	cardRoot: {
		width: "300px"
	},
	appBar: {
		position: "relative"
	},
	title: {
		marginLeft: theme.spacing(2),
		flex: 1,
	},
}));

export default useStyles;
