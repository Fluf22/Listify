import React, { useState, useEffect } from 'react';
import { AppBar, Button, Grid, Toolbar, Typography, useMediaQuery } from '@material-ui/core';
import AccountLogin from '../AccountLogin';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { useEventListener } from '../../hooks';
import useStyles from './styles';
import { useHistory } from 'react-router-dom';

interface HeaderProps {
	page: string | undefined;
};

interface PageType {
	id: string;
	name: string;
};

const pages: PageType[] = [
	{
		id: "home",
		name: "Home"
	}, {
		id: "lists",
		name: "Toutes les listes"
	}, {
		id: "me",
		name: "Ma liste"
	}, {
		id: "calendar",
		name: "Calendrier"
	}
];

const Header = (props: HeaderProps) => {
	const isMobile = useMediaQuery('(max-width:555px)');
	const classes = useStyles(isMobile);
	const history = useHistory();
	const { page } = props;
	const [showInstallButton, setShowInstallButton] = useState<boolean>(false);
	//eslint-disable-next-line
	const [selectedPage, setPage] = useState<PageType | undefined>(page ? pages.find(p => p.id === page) : undefined);

	useEventListener("beforeinstallprompt", (event: any) => {
		event.preventDefault();
		installAppEvent = event;
		setShowInstallButton(true);
	});

	useEventListener("appinstalled", () => {
		setShowInstallButton(false);
	});

	const handleInstall = () => {
		if (installAppEvent && (installAppEvent as any).prompt && (installAppEvent as any).userChoice) {
			(installAppEvent as any).prompt();
			setShowInstallButton(false);
			(installAppEvent as any).userChoice.then((choiceResult: any) => {
				console.log("choiceResult: ", choiceResult)
				installAppEvent = undefined;
			});
		}
	};

	useEffect(() => {
		if (selectedPage !== undefined && !history.location.pathname.includes(selectedPage.id)) {
			history.push(`/${selectedPage.id}`);
		}
	}, [selectedPage, history]);

	return (
		<Grid container className={classes.root}>
			<AppBar position="sticky" color="primary">
				<Toolbar className={classes.toolBar}>
					<Grid container direction="row" justify="space-between" alignItems="center" >
						<Grid item container direction="row" alignItems="center" xs>
							<img src="/logo192.png" height="64" alt="Lord of the rings related app logo" />
							<Typography variant="h3" className={classes.title}>Caudex</Typography>
						</Grid>
						<Grid item container justify="flex-end" xs className={classes.installButtonContainer}>
							{
								showInstallButton ? (
									<Button color="primary" onClick={() => handleInstall()} variant="outlined" className={classes.installButton}>
										Install
										<CloudDownloadIcon className={classes.installButtonIcon} />
									</Button>
								) : ("")
							}
							<AccountLogin />
						</Grid>
					</Grid>
				</Toolbar>
			</AppBar>
		</Grid>
	);
};

export default Header;
