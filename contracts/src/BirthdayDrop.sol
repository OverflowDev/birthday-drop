// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BirthdayCard.sol";

/// @notice Time-locked stablecoin birthday gift vault on Arc.
/// Gifts are locked until the specified birthday timestamp.
/// Each gift mints a BirthdayCard NFT to the recipient as proof.
contract BirthdayDrop is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Gift {
        uint256 id;
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 birthdayTimestamp;
        string message;
        uint8 theme;
        bool recurring;
        uint256 cardTokenId;
        bool claimed;
        bool cancelled;
        uint256 createdAt;
    }

    BirthdayCard public immutable birthdayCard;
    uint256 private _nextGiftId;

    mapping(uint256 => Gift) public gifts;
    mapping(address => uint256[]) public giftsByRecipient;
    mapping(address => uint256[]) public giftsBySender;
    mapping(address => bool) public supportedTokens;
    mapping(address => string) public tokenSymbols;

    event GiftCreated(
        uint256 indexed giftId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 birthdayTimestamp,
        bool recurring,
        uint256 cardTokenId
    );
    event GiftClaimed(uint256 indexed giftId, address indexed recipient, address token, uint256 amount);
    event GiftCancelled(uint256 indexed giftId, address indexed sender);
    /// @notice Emitted when a recurring gift is claimed — sender should create a new gift for next year.
    event RecurringGiftNeeded(
        uint256 indexed originalGiftId,
        address indexed sender,
        address indexed recipient,
        uint256 nextBirthday
    );

    constructor(address _birthdayCard, address[] memory _tokens, string[] memory _symbols) {
        require(_tokens.length == _symbols.length, "Length mismatch");
        birthdayCard = BirthdayCard(_birthdayCard);
        for (uint256 i = 0; i < _tokens.length; i++) {
            supportedTokens[_tokens[i]] = true;
            tokenSymbols[_tokens[i]] = _symbols[i];
        }
    }

    /// @notice Create a time-locked gift. Tokens are held by this contract until claimed.
    function createGift(
        address recipient,
        address token,
        uint256 amount,
        uint256 birthdayTimestamp,
        string calldata message,
        uint8 theme,
        bool recurring
    ) external nonReentrant returns (uint256 giftId) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot gift yourself");
        require(supportedTokens[token], "Unsupported token");
        require(amount > 0, "Amount must be > 0");
        require(birthdayTimestamp > block.timestamp, "Birthday must be in future");
        require(bytes(message).length <= 200, "Message too long");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        giftId = _nextGiftId++;

        uint256 cardTokenId = birthdayCard.mint(
            recipient,
            giftId,
            msg.sender,
            amount,
            tokenSymbols[token],
            birthdayTimestamp,
            message,
            theme
        );

        gifts[giftId] = Gift({
            id: giftId,
            sender: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            birthdayTimestamp: birthdayTimestamp,
            message: message,
            theme: theme,
            recurring: recurring,
            cardTokenId: cardTokenId,
            claimed: false,
            cancelled: false,
            createdAt: block.timestamp
        });

        giftsByRecipient[recipient].push(giftId);
        giftsBySender[msg.sender].push(giftId);

        emit GiftCreated(giftId, msg.sender, recipient, token, amount, birthdayTimestamp, recurring, cardTokenId);
    }

    /// @notice Claim a gift after its birthday timestamp has passed.
    function claimGift(uint256 giftId) external nonReentrant {
        Gift storage gift = gifts[giftId];
        require(gift.recipient == msg.sender, "Not the recipient");
        require(!gift.claimed, "Already claimed");
        require(!gift.cancelled, "Gift was cancelled");
        require(block.timestamp >= gift.birthdayTimestamp, "Birthday has not arrived yet");

        gift.claimed = true;
        birthdayCard.markClaimed(gift.cardTokenId);

        IERC20(gift.token).safeTransfer(msg.sender, gift.amount);

        emit GiftClaimed(giftId, msg.sender, gift.token, gift.amount);

        if (gift.recurring) {
            emit RecurringGiftNeeded(giftId, gift.sender, msg.sender, gift.birthdayTimestamp + 365 days);
        }
    }

    /// @notice Cancel a gift and recover the tokens. Only the original sender can cancel.
    function cancelGift(uint256 giftId) external nonReentrant {
        Gift storage gift = gifts[giftId];
        require(gift.sender == msg.sender, "Not the sender");
        require(!gift.claimed, "Already claimed");
        require(!gift.cancelled, "Already cancelled");

        gift.cancelled = true;
        birthdayCard.markCancelled(gift.cardTokenId);

        IERC20(gift.token).safeTransfer(msg.sender, gift.amount);

        emit GiftCancelled(giftId, msg.sender);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function getGift(uint256 giftId) external view returns (Gift memory) {
        return gifts[giftId];
    }

    function getGiftsByRecipient(address recipient) external view returns (Gift[] memory) {
        uint256[] storage ids = giftsByRecipient[recipient];
        Gift[] memory result = new Gift[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) result[i] = gifts[ids[i]];
        return result;
    }

    function getGiftsBySender(address sender) external view returns (Gift[] memory) {
        uint256[] storage ids = giftsBySender[sender];
        Gift[] memory result = new Gift[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) result[i] = gifts[ids[i]];
        return result;
    }

    function getTotalGifts() external view returns (uint256) {
        return _nextGiftId;
    }
}
