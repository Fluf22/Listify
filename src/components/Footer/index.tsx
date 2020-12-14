import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import GroupIcon from '@material-ui/icons/Group';
import EventIcon from '@material-ui/icons/Event';

interface IFooter {
	page: string;
};

interface PageType {
	id: string;
	icon: any;
	name: string;
};

const pages: PageType[] = [
	{
		id: "",
		icon: <PlaylistAddIcon />,
		name: "Ma liste"
	}, {
		id: "lists",
		icon: <GroupIcon />,
		name: "Toutes les listes"
	}, {
		id: "calendar",
		icon: <EventIcon />,
		name: "Calendrier"
	}
];

const Footer = (props: IFooter) => {
	const history = useHistory();
	const selectedPageIdx = props.page ? pages.findIndex(p => p.id === props.page) : 0;

	const handlePageChange = (pageIdx: number) => {
		const selectedPageID = pages[pageIdx].id;
		if (props.page !== selectedPageID) {
			history.push(`/${selectedPageID}`);
		}
	};

	return (
		<BottomNavigation
			value={selectedPageIdx}
			onChange={(_, newValue) => handlePageChange(newValue)}
			showLabels
			style={{
				width: "100%",
				position: "absolute",
				bottom: 0,
				left: 0
			}}
		>
			{
				pages.map((page: PageType, idx: number) => (
					<BottomNavigationAction key={idx} label={page.name} icon={page.icon} />
				))
			}
		</BottomNavigation>
	);
};

export default Footer;
