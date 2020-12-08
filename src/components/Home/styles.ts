import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles(() => createStyles({
	root: {
		height: "100%"
	},
	body: {
		height: "calc(100% - 64px)"
	},
	categorySelector: {
		height: "10%"
	},
	slug: {
		height: "90%"
	},
	fallback: {
		height: "calc(100% - 64px)"
	}
}));

export default useStyles;
