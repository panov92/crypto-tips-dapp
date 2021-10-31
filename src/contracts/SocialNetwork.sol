// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

contract SocialNetwork {
    string public name;
    uint public postsCount;
    mapping(uint => Post) public posts;

    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }

    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    constructor() {
        name = "Social Network";
        postsCount = 0;
    }

    function createPost(string memory _content) public {
        // Require valid content
        require(bytes(_content).length > 0);

        // Increment the post count
        postsCount++;

        // Create the post
        posts[postsCount] = Post(postsCount, _content, 0, payable(msg.sender));

        // Trigget Event
        emit PostCreated(postsCount, _content, 0, payable(msg.sender));
    }

    function tipPost(uint _id) public payable {
        // Make sure the id is valid
        require(_id > 0 && _id <= postsCount);

        // Fetch the post
        Post memory _post = posts[_id];

        // Fetch the author
        address payable _author = _post.author;

        // Pay the author
        payable(_author).transfer(msg.value);

        // Increment the tip amount
        _post.tipAmount = _post.tipAmount + msg.value;

        // Update the post
        posts[_id] = _post;

        // Trigger an event
        emit PostTipped(postsCount, _post.content, _post.tipAmount, _author);
    }
}
