import React, { useState } from 'react';
import { AppBar, Button, Grid, Toolbar, Typography, useMediaQuery, Menu, MenuItem, Tabs, Tab } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/auth';
import { useEventListener } from '../../hooks';
import useStyles from './styles';

interface HeaderProps {
	page: string | undefined;
};

interface PageType {
	id: string;
	name: string;
};

const pages: PageType[] = [
	{
		id: "",
		name: "Ma liste"
	}, {
		id: "lists",
		name: "Toutes les listes"
	}, {
		id: "calendar",
		name: "Calendrier"
	}
];

const Header = (props: HeaderProps) => {
	const isMobile = useMediaQuery('(max-width:555px)');
	const classes = useStyles(isMobile);
	const history = useHistory();
	const [showInstallButton, setShowInstallButton] = useState<boolean>(false);
	const { user, logout } = useAuth();
	const [anchorEl, setAnchorEl] = useState(null);
	const selectedPageIdx = props.page ? pages.findIndex(p => p.id === props.page) : 0;

	const handlePageChange = (pageIdx: number) => {
		const selectedPageID = pages[pageIdx].id;
		if (props.page !== selectedPageID) {
			history.push(`/${selectedPageID}`);
		}
	};

	const handleLogout = () => {
		handleCloseMenu();
		logout(() => {
			console.log("Logged out");
			history.push("/");
		});
	};

	const handleOpenMenu = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleCloseMenu = () => {
		setAnchorEl(null);
	};


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

	return (
		<Grid container className={classes.root}>
			<AppBar position="sticky" color="primary">
				<Toolbar className={classes.toolBar}>
					<Grid container direction="row" justify="space-between" alignItems="center" >
						<Grid item container direction="row" alignItems="center" xs>
							<img src="/logo192.png" height="64" alt="Lord of the rings related app logo" />
							<Typography variant="h3" className={classes.title}>Caudex</Typography>
						</Grid>
						{
							isMobile ? ("") : (
								<Tabs
									aria-label="tab menu"
									value={selectedPageIdx}
									onChange={(_, newValue) => handlePageChange(newValue)}
								>
									{
										pages.map((page: PageType, idx: number) => (
											<Tab key={idx} label={page.name} />
										))
									}
								</Tabs>
							)
						}
						<Grid item container justify="flex-end" xs className={classes.installButtonContainer}>
							{
								showInstallButton ? (
									<Button color="secondary" onClick={() => handleInstall()} variant="outlined" className={classes.installButton}>
										{isMobile ? "" : "Install"}
										<CloudDownloadIcon className={classes.installButtonIcon} />
									</Button>
								) : ("")
							}
							{
								isMobile ? (
									<>
										<Button color="secondary" onClick={handleOpenMenu}>
											<AccountCircleIcon className={classes.installButtonIcon} />
										</Button>
										<Menu
											id="logout-menu"
											anchorEl={anchorEl}
											open={Boolean(anchorEl)}
											onClose={handleCloseMenu}
										>
											{
												user === null ? (
													<MenuItem onClick={() => history.push("/login")}>Connexion</MenuItem>
												) : (
														<>
															<MenuItem disabled>{user.user_metadata?.full_name || "Inconnu"}</MenuItem>
															<MenuItem onClick={() => handleLogout()}>Déconnexion</MenuItem>
														</>
													)
											}
										</Menu>
									</>
								) : (user === null ? (
									<Button color="secondary" onClick={() => history.push("/login")}>
										Connexion
										<AccountCircleIcon className={classes.installButtonIcon} />
									</Button>
								) : (
										<>
											<Button color="secondary" onClick={handleOpenMenu}>
												{user.user_metadata?.full_name || "Inconnu"}
												<AccountCircleIcon className={classes.installButtonIcon} />
											</Button>
											<Menu
												id="logout-menu"
												anchorEl={anchorEl}
												open={Boolean(anchorEl)}
												onClose={handleCloseMenu}
											>
												<MenuItem onClick={() => handleLogout()}>Déconnexion</MenuItem>
											</Menu>
										</>
									))
							}
						</Grid>
					</Grid>
				</Toolbar>
			</AppBar>
		</Grid>
	);
};

export default Header;
