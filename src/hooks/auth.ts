import { useState, createContext, useContext } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

export const authContext = createContext<any>(null);

export const useAuth = () => {
	return useContext(authContext);
};

export const useProvideAuth = () => {
	const [user, setUser] = useState<netlifyIdentity.User | null>(netlifyIdentity.currentUser());

	const open = (tab: "login" | "signup" | undefined = "login", callback: any) => {
		netlifyIdentity.off('login');
		netlifyIdentity.on('login', (user: any) => {
			setUser(user);
			callback(user);
			netlifyIdentity.close();
		});
		netlifyIdentity.open(tab);
	};

	const logout = (callback: any) => {
		netlifyIdentity.off('logout');
		netlifyIdentity.on('logout', () => {
			setUser(null);
			callback();
		});
		netlifyIdentity.logout();
	};

	return {
		user,
		open,
		logout
	};
}
