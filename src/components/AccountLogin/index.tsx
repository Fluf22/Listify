import React from 'react';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { Button } from '@material-ui/core';
import { useAuth } from '../../hooks/auth';
import { useHistory } from 'react-router-dom';

const AccountLogin = () => {
	const { user, login, logout } = useAuth();
	const history = useHistory();

	const handleLogin = (user: any) => {
		console.log("Logged in user: ", user);
	};

	const handleLogout = () => {
		console.log("Logged out");
		history.push("/");
	};

	return (
		user === null ? (
			<Button color="secondary" onClick={() => login(handleLogin)}>
				<AccountCircleIcon />
				Login
			</Button>
		) : (
			<Button color="secondary" onClick={() => logout(handleLogout)}>
				<AccountCircleIcon />
				Logout
			</Button>
		)
	);
};

export default AccountLogin;
