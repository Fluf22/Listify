import React from 'react';
import { useProvideAuth, authContext } from '../hooks/auth';

const ProvideAuth = ({ children }: any) => {
	const auth = useProvideAuth();
	return (
		<authContext.Provider value={auth}>
			{children}
		</authContext.Provider>
	);
};

export default ProvideAuth;
