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
	slug: isMobile => ({
		height: isMobile ? "calc(100% - 56px)" : "100%",
		overflow: "auto",
		paddingBottom: isMobile ? "64px" : "0px"
	}),
	fallback: {
		height: "calc(100% - 64px)"
	}
}));

export default useStyles;
