import React from 'react';
import ReactDOM from 'react-dom';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { CssBaseline, ThemeProvider, Theme, createMuiTheme } from '@material-ui/core';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import netlifyIdentity from 'netlify-identity-widget';
import Home from './components/Home';
import './styles.css';
import ProvideAuth from './components/Auth/provide-auth';
// import reportWebVitals from './reportWebVitals';

global.installAppEvent = undefined;
netlifyIdentity.init({ locale: "fr" });

const theme: Theme = createMuiTheme({
	palette: {
		primary: {
			main: "#e8272c",
			contrastText: "#ffffff"
		},
		secondary: {
			main: "#ffffff",
			contrastText: "#13aa52"
		}
	}
});

const queryCache = new QueryCache();

ReactDOM.render(
	<React.Fragment>
		<ReactQueryCacheProvider queryCache={queryCache}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<ProvideAuth>
					<Router>
						<Route path="/:slug?" component={Home} />
					</Router>
				</ProvideAuth>
			</ThemeProvider>
			{
				process.env.NODE_ENV === "development" ? (
					<ReactQueryDevtools initialIsOpen />
				) : ("")
			}
		</ReactQueryCacheProvider>
	</React.Fragment>,
	document.getElementById('root')
);

// reportWebVitals();
