import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';

interface ErrorBoundaryState {
	hasError: boolean;
};

class ErrorBoundary extends React.PureComponent<any, ErrorBoundaryState> {
	constructor(props: any) {
		super(props);
		this.state = {
			hasError: false
		};
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: any, errorInfo: any) {
		console.error(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<Grid container direction="column" justify="center" alignItems="center" style={{ height: "calc(100% - 64px)" }}>
					<WarningIcon style={{ fontSize: "80px" }} />
					<Typography style={{ fontSize: "40px" }}>An error as occured</Typography>
					<Typography style={{ fontSize: "40px" }}>Please reload the page</Typography>
				</Grid>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
