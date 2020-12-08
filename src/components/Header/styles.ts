import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => createStyles({
	root: {
		zIndex: 10
	},
	toolBar: isMobile => ({
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: isMobile ? "0 0 0 13px" : "0 16px 0 16px"
	}),
	title: isMobile => ({
		marginLeft: theme.spacing(3),
		fontSize: isMobile ? "28px" : "2rem"
	}),
	installButtonContainer: isMobile => ({
		flexGrow: isMobile ? 0 : 1
	}),
	installButton: {
		marginRight: "13px",
		padding: "0px 15px"
	},
	installButtonIcon: {
		marginLeft: "7px",
		marginBottom: "3px"
	},
	moto: {
		fontStyle: "italic"
	}
}));

export default useStyles;
