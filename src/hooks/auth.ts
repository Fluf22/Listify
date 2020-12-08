import { useState, createContext, useContext } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

export const authContext = createContext<any>(null);

export const useAuth = () => {
	return useContext(authContext);
};

export const useProvideAuth = () => {
	const [user, setUser] = useState(null);

	const login = (callback: any) => {
		netlifyIdentity.open();
		netlifyIdentity.on('login', (user: any) => {
			setUser(user);
			callback(user);
		});
	};

	const logout = (callback: any) => {
		netlifyIdentity.logout();
		netlifyIdentity.on('logout', () => {
			setUser(user);
			callback();
		});
	};

	return {
		user,
		login,
		logout
	};
}
