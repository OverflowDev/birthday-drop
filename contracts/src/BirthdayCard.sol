// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @notice On-chain SVG NFT gift card minted when a birthday gift is created.
contract BirthdayCard is ERC721, Ownable {
    using Strings for uint256;

    struct CardData {
        uint256 giftId;
        address sender;
        address recipient;
        uint256 amount;
        string tokenSymbol;
        uint256 birthdayTimestamp;
        string message;
        uint8 theme;
        bool claimed;
        bool cancelled;
    }

    mapping(uint256 => CardData) public cards;
    uint256 private _nextTokenId;
    address public birthdayDrop;

    string[5] private THEME_NAMES = ["Birthday", "Ocean", "Sunset", "Midnight", "Garden"];
    string[5] private GRADIENT_FROM = ["#FF6B6B", "#0099F7", "#F7971E", "#141E30", "#56AB2F"];
    string[5] private GRADIENT_TO  = ["#FFE66D", "#F11712", "#FFD200", "#243B55", "#A8E063"];
    string[5] private BG_COLOR     = ["#FFF0F0", "#EFF8FF", "#FFF8EF", "#16213E", "#F0FFF4"];
    string[5] private TEXT_COLOR   = ["#1a1a1a", "#1a1a1a", "#1a1a1a", "#FFFFFF", "#1a1a1a"];
    string[5] private SUB_COLOR    = ["#666666", "#555555", "#555555", "#AAAAAA", "#555555"];

    event CardMinted(uint256 indexed tokenId, uint256 indexed giftId, address indexed recipient);

    modifier onlyBirthdayDrop() {
        require(msg.sender == birthdayDrop, "Only BirthdayDrop");
        _;
    }

    constructor() ERC721("BirthdayDrop Gift Card", "BDROP") Ownable(msg.sender) {}

    function setBirthdayDrop(address _birthdayDrop) external onlyOwner {
        require(_birthdayDrop != address(0), "Zero address");
        birthdayDrop = _birthdayDrop;
    }

    function mint(
        address to,
        uint256 giftId,
        address sender,
        uint256 amount,
        string calldata tokenSymbol,
        uint256 birthdayTimestamp,
        string calldata message,
        uint8 theme
    ) external onlyBirthdayDrop returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        cards[tokenId] = CardData({
            giftId: giftId,
            sender: sender,
            recipient: to,
            amount: amount,
            tokenSymbol: tokenSymbol,
            birthdayTimestamp: birthdayTimestamp,
            message: message,
            theme: theme % 5,
            claimed: false,
            cancelled: false
        });
        emit CardMinted(tokenId, giftId, to);
        return tokenId;
    }

    function getCard(uint256 tokenId) external view returns (CardData memory) {
        return cards[tokenId];
    }

    function markClaimed(uint256 tokenId) external onlyBirthdayDrop {
        cards[tokenId].claimed = true;
    }

    function markCancelled(uint256 tokenId) external onlyBirthdayDrop {
        cards[tokenId].cancelled = true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        CardData memory card = cards[tokenId];
        string memory svg = _buildSVG(card);
        string memory status = card.claimed ? "Claimed" : (card.cancelled ? "Cancelled" : "Pending");

        string memory json = string(abi.encodePacked(
            '{"name":"Birthday Drop #', tokenId.toString(), '",',
            '"description":"A time-locked birthday gift powered by Arc stablecoins.",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
            '"attributes":[',
            '{"trait_type":"Theme","value":"', THEME_NAMES[card.theme], '"},',
            '{"trait_type":"Status","value":"', status, '"},',
            '{"trait_type":"Token","value":"', card.tokenSymbol, '"},',
            '{"trait_type":"Gift ID","value":"', card.giftId.toString(), '"}',
            ']}'
        ));

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function _buildSVG(CardData memory card) internal view returns (string memory) {
        uint8 i = card.theme;
        string memory amount   = _formatAmount(card.amount, card.tokenSymbol);
        string memory msg_     = _truncate(_sanitize(card.message), 42);
        string memory sender_  = _addrShort(card.sender);
        string memory recip_   = _addrShort(card.recipient);
        string memory statusTx = card.claimed ? "CLAIMED" : (card.cancelled ? "CANCELLED" : "PENDING");
        string memory statusFl = card.claimed ? "#4CAF50" : (card.cancelled ? "#F44336" : "#FF9800");

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">',
            '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" stop-color="', GRADIENT_FROM[i], '"/>',
            '<stop offset="100%" stop-color="', GRADIENT_TO[i], '"/>',
            '</linearGradient></defs>',
            '<rect width="400" height="260" rx="20" fill="url(#g)"/>',
            '<rect x="8" y="8" width="384" height="244" rx="16" fill="', BG_COLOR[i], '" opacity="0.93"/>',
            _buildText(amount, msg_, sender_, recip_, statusTx, statusFl, card.giftId.toString(), i)
        ));
    }

    function _buildText(
        string memory amount,
        string memory msg_,
        string memory sender_,
        string memory recip_,
        string memory statusTx,
        string memory statusFl,
        string memory giftIdStr,
        uint8 i
    ) internal view returns (string memory) {
        return string(abi.encodePacked(
            '<text x="200" y="44" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="', SUB_COLOR[i], '" letter-spacing="3">BIRTHDAY DROP</text>',
            '<text x="200" y="80" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" font-weight="bold" fill="', TEXT_COLOR[i], '">', amount, '</text>',
            '<text x="200" y="106" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="', SUB_COLOR[i], '">', msg_, '</text>',
            '<line x1="30" y1="124" x2="370" y2="124" stroke="', SUB_COLOR[i], '" stroke-width="0.4" opacity="0.35"/>',
            '<text x="30" y="144" font-family="Arial,sans-serif" font-size="9" fill="', SUB_COLOR[i], '">FROM</text>',
            '<text x="30" y="160" font-family="monospace" font-size="11" fill="', TEXT_COLOR[i], '">', sender_, '</text>',
            '<text x="215" y="144" font-family="Arial,sans-serif" font-size="9" fill="', SUB_COLOR[i], '">TO</text>',
            '<text x="215" y="160" font-family="monospace" font-size="11" fill="', TEXT_COLOR[i], '">', recip_, '</text>',
            '<rect x="145" y="193" width="110" height="26" rx="13" fill="', statusFl, '" opacity="0.14"/>',
            '<text x="200" y="211" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="', statusFl, '">', statusTx, '</text>',
            '<text x="200" y="248" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="', SUB_COLOR[i], '">arc.io  |  gift #', giftIdStr, '</text>',
            '</svg>'
        ));
    }

    function _formatAmount(uint256 amount, string memory symbol) internal pure returns (string memory) {
        uint256 whole = amount / 1e6;
        uint256 cents = (amount % 1e6) / 1e4;
        string memory centsStr = cents < 10
            ? string(abi.encodePacked("0", cents.toString()))
            : cents.toString();
        return string(abi.encodePacked(whole.toString(), ".", centsStr, " ", symbol));
    }

    function _addrShort(address addr) internal pure returns (string memory) {
        bytes20 b = bytes20(addr);
        bytes memory h = "0123456789abcdef";
        // "0x" + 4 bytes (8 hex) + "..." + 2 bytes (4 hex) = 17 chars
        bytes memory r = new bytes(17);
        r[0] = "0"; r[1] = "x";
        for (uint256 k = 0; k < 4; k++) {
            r[2 + k * 2] = h[uint8(b[k]) >> 4];
            r[3 + k * 2] = h[uint8(b[k]) & 0xf];
        }
        r[10] = "."; r[11] = "."; r[12] = ".";
        r[13] = h[uint8(b[18]) >> 4];
        r[14] = h[uint8(b[18]) & 0xf];
        r[15] = h[uint8(b[19]) >> 4];
        r[16] = h[uint8(b[19]) & 0xf];
        return string(r);
    }

    function _truncate(string memory str, uint256 maxLen) internal pure returns (string memory) {
        bytes memory b = bytes(str);
        if (b.length <= maxLen) return str;
        bytes memory r = new bytes(maxLen);
        for (uint256 k = 0; k < maxLen; k++) r[k] = b[k];
        return string(r);
    }

    function _sanitize(string memory str) internal pure returns (string memory) {
        bytes memory inp = bytes(str);
        uint256 extra = 0;
        for (uint256 k = 0; k < inp.length; k++) {
            if (inp[k] == 0x3C) extra += 3;       // < → &lt;
            else if (inp[k] == 0x3E) extra += 3;  // > → &gt;
            else if (inp[k] == 0x26) extra += 4;  // & → &amp;
        }
        if (extra == 0) return str;
        bytes memory out = new bytes(inp.length + extra);
        uint256 j = 0;
        for (uint256 k = 0; k < inp.length; k++) {
            if (inp[k] == 0x3C) {
                out[j++] = "&"; out[j++] = "l"; out[j++] = "t"; out[j++] = ";";
            } else if (inp[k] == 0x3E) {
                out[j++] = "&"; out[j++] = "g"; out[j++] = "t"; out[j++] = ";";
            } else if (inp[k] == 0x26) {
                out[j++] = "&"; out[j++] = "a"; out[j++] = "m"; out[j++] = "p"; out[j++] = ";";
            } else {
                out[j++] = inp[k];
            }
        }
        return string(out);
    }
}
