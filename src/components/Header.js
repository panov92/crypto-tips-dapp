import React from 'react';
import Identicon from 'identicon.js';

const Header = props => {
	const { account } = props;

	const getAvatar = account => {
		const imgString = new Identicon(account, 30).toString();
		return `data:image/png;base64,${imgString}`;
	}

	return (
		<nav className="navbar navbar-dark bg-dark">
			<div className="container-fluid">
				<a className="navbar-brand" href="#">Social Newtwork</a>
				{account ? (
					<div className="ml-auto text-white-50">
						<img className="rounded-circle me-2" src={getAvatar(account)} />
						<small>{account}</small>
					</div>
				) : null}
			</div>
		</nav>
	)
}

export default Header;