import React, { useEffect, useState } from 'react';
import { Snackbar, Button } from '@material-ui/core';
import * as serviceWorkerRegistration from '../../serviceWorkerRegistration';
import useStyles from './styles';

const ServiceWorkerWrapper = () => {
	const classes = useStyles();
	const [showReload, setShowReload] = useState(false);
	const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

	const onSWUpdate = (registration: ServiceWorkerRegistration) => {
		setShowReload(true);
		setWaitingWorker(registration.waiting);
	};

	useEffect(() => {
		serviceWorkerRegistration.register({ onUpdate: onSWUpdate });
	}, []);

	const reloadPage = () => {
		waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
		setShowReload(false);
		window.location.reload();
	};

	return (
		<Snackbar
			id="update-snackbar"
			open={showReload}
			message="New version available!"
			onClick={reloadPage}
			anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			action={
				<Button
					color="primary"
					size="small"
					onClick={reloadPage}
				>
					Update
				</Button>
			}
			className={classes.root}
		/>
	);
}

export default ServiceWorkerWrapper;
