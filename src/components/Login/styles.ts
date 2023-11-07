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
		marginTop: "30px",
		marginBottom: "30px",
	},
	signupLink: {
		padding: "7px",
		border: "2px solid white",
		borderRadius: "7px",
		marginLeft: "13px",
		color: "white"
	}
}));

export default useStyles;
