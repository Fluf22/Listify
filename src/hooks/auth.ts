import { useState, createContext, useContext, useEffect, useMemo } from "react";
import netlifyIdentity from 'netlify-identity-widget';
import { useHistory, useLocation } from "react-router-dom";

export const authContext = createContext<any>(null);

export const useAuth = () => {
	return useContext(authContext);
};

type NetlifyUser = netlifyIdentity.User | null;

export const useProvideAuth = () => {
	const history = useHistory();
	const location = useLocation();

	const [user, setUser] = useState<NetlifyUser>(netlifyIdentity.currentUser());

	const { from }: any = useMemo(() => location.state || { from: { pathname: "/" } }, [location]);

	useEffect(() => {
		const handleLogin = () => {
			const newUser = netlifyIdentity.currentUser();
			setUser(newUser);
			console.log("Logged in user: ", newUser);
			history.replace(from);
			netlifyIdentity.close();
		};

		const handleLogout = () => {
			setUser(null);
			console.log("Logged out");
			history.push("/");
		};

		// Subscribe to login and logout events
		netlifyIdentity.on('login', handleLogin);
		netlifyIdentity.on('logout', handleLogout);

		// Clean up event listeners on unmount
		return () => {
			netlifyIdentity.off('login', handleLogin);
			netlifyIdentity.off('logout', handleLogout);
		};
	}, [from, history]);

	const login = (callback: any) => {
		netlifyIdentity.open();
	};

	const logout = (callback: any) => {
		netlifyIdentity.logout();
	};

	return {
		user,
		login,
		logout
	};
}
