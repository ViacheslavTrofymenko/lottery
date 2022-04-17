    // SPDX-License-Identifier: MIT

    pragma solidity ^0.8.4;

    /// @title A lottery that accepts ERC20 tokens and issues a lottery ticket as ERC721 NFT in return.
    /// @author Viacheslav
    /// @notice This contract was written only for studing purpose and passing test task.

    import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/utils/Counters.sol";
    

    interface IERC20 {
        function transfer(address, uint) external returns (bool);
        function balanceOf(address account) external view returns (uint256);
        function transferFrom(address from, address to, uint256 amount) external;
    }


    contract Lottery is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    address public admin;
    address payable[] public players;
    uint public lotteryId;
    uint deployDate;
    IERC20 token;

    constructor()  ERC721("Lottery", "LOT") {
        admin = msg.sender;
        lotteryId = 1;
        deployDate = block.timestamp;
    }

    modifier drawConditions() {
        require(players.length == 3 || block.timestamp >= deployDate + 2 hours, "Not enough players participating in a lottery or it's not yet time for the draw");
        _;
    }

     function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmZPG55YkkazYd9PqwWZy9LyxsfeTFZnt8os6FqNs5ZR6y";
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function enter(IERC20 _token, uint _amount) public {
        require(msg.sender != admin, "Admin cann't play");

        require(players.length < 3 && block.timestamp < deployDate + 2 hours, "Player limit reached or time is out");
        require(_amount == 5, "Should be exact 5 ERC20 token");
        _token.transferFrom(msg.sender, address(this), _amount);

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);

    /// @notice address of player entering lottery
    players.push(payable (msg.sender));
    }

    function getRandomNumber() internal view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players.length)));    
    }
    

    function pickWinner() public onlyOwner drawConditions{
        address payable winner;
        winner = players[getRandomNumber() % players.length];
        uint erc20balance = token.balanceOf(address(this));
        token.transferFrom (address(this), winner, erc20balance);

        lotteryId++;

        /// @notice reset the state of the contract
        players = new address payable[](0);
    }
}
