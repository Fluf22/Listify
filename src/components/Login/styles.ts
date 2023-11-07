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
	}
}));

export default useStyles;
