import React, { useState } from 'react';
import Identicon from 'identicon.js';

const Main = props => {
	const { posts, createPost, tipPost } = props;

	const [content, setContent] = useState('');

	const getAvatar = account => {
		const imgString = new Identicon(account, 30).toString();
		return `data:image/png;base64,${imgString}`;
	}

	const handleSubmit = e => {
		e.preventDefault();
		createPost(content);
	}

	const handleInput = e => {
		setContent(e.target.value);
	}

	const handleClick = e => {
		const id = e.target.getAttribute("data-id");
		const tipAmount = window.web3.utils.toWei('0.1', 'Ether');
		tipPost(id, tipAmount);
	}

	return (
		<div className="container mt-5">
			<div className="row">
				<main role="main" className="col-12 col-sm-10 col-lg-6 m-auto">
					<div className="content">
						<form className="mb-5" onSubmit={handleSubmit}>
							<input value={content} onChange={handleInput} className="form-control mb-2" type="text" placeholder="What's new with you?" aria-label="What's new with you?" />
							<div className="d-grid gap-2">
							<button className="btn btn-block btn-primary" type="submit">Share</button>
							</div>
						</form>
						{posts.map((post, key) => {
							return (
								<div className="card mb-4" key={`post-${key}`}>
									<div className="card-header">
										<img className="rounded-circle me-2" src={getAvatar(post.author)} /><small>{post.author}</small>
									</div>
									<div className="card-body fw-bold">
										{post.content}
									</div>
									<div className="card-footer bg-white d-flex justify-content-between text-uppercase align-items-center">
										<div>
											Tips: <span className="badge rounded-pill bg-warning text-dark">{window.web3.utils.fromWei(post.tipAmount.toString())}</span> Eth
										</div>
										<div>
											<button onClick={handleClick} data-id={post.id} type="button" className="btn btn-primary btn-sm">Tip 0.1 Eth</button>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</main>
			</div>
		</div>
	)
}

export default Main;