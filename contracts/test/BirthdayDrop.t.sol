// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/BirthdayDrop.sol";
import "../src/BirthdayCard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract BirthdayDropTest is Test {
    BirthdayDrop public drop;
    BirthdayCard public card;
    MockERC20 public usdc;
    MockERC20 public eurc;

    address alice = address(0xA11CE);
    address bob   = address(0xB0B);

    uint256 constant ONE  = 1e6;
    uint256 constant GIFT = 10 * ONE; // $10.00

    function setUp() public {
        card = new BirthdayCard();
        usdc = new MockERC20("USD Coin", "USDC");
        eurc = new MockERC20("Euro Coin", "EURC");

        address[] memory tokens  = new address[](2);
        string[]  memory symbols = new string[](2);
        tokens[0] = address(usdc); symbols[0] = "USDC";
        tokens[1] = address(eurc); symbols[1] = "EURC";

        drop = new BirthdayDrop(address(card), tokens, symbols);
        card.setBirthdayDrop(address(drop));

        usdc.mint(alice, 1_000 * ONE);
        eurc.mint(alice, 1_000 * ONE);

        vm.prank(alice);
        usdc.approve(address(drop), type(uint256).max);
        vm.prank(alice);
        eurc.approve(address(drop), type(uint256).max);
    }

    // ── Create ──────────────────────────────────────────────────────────────

    function test_CreateGift() public {
        uint256 birthday = block.timestamp + 30 days;

        vm.prank(alice);
        uint256 giftId = drop.createGift(bob, address(usdc), GIFT, birthday, "Happy Birthday Bob!", 0, false);

        assertEq(giftId, 0);

        BirthdayDrop.Gift memory g = drop.getGift(giftId);
        assertEq(g.sender, alice);
        assertEq(g.recipient, bob);
        assertEq(g.amount, GIFT);
        assertEq(g.token, address(usdc));
        assertEq(g.birthdayTimestamp, birthday);
        assertFalse(g.claimed);
        assertFalse(g.cancelled);

        // NFT minted to recipient
        assertEq(card.ownerOf(g.cardTokenId), bob);
        // Tokens locked in vault
        assertEq(usdc.balanceOf(address(drop)), GIFT);
    }

    function test_RevertCreateGift_SelfGift() public {
        vm.prank(alice);
        vm.expectRevert("Cannot gift yourself");
        drop.createGift(alice, address(usdc), GIFT, block.timestamp + 1 days, "hi", 0, false);
    }

    function test_RevertCreateGift_PastBirthday() public {
        vm.prank(alice);
        vm.expectRevert("Birthday must be in future");
        drop.createGift(bob, address(usdc), GIFT, block.timestamp, "hi", 0, false);
    }

    function test_RevertCreateGift_UnsupportedToken() public {
        vm.prank(alice);
        vm.expectRevert("Unsupported token");
        drop.createGift(bob, address(0xDEAD), GIFT, block.timestamp + 1 days, "hi", 0, false);
    }

    // ── Claim ───────────────────────────────────────────────────────────────

    function test_ClaimGift() public {
        uint256 birthday = block.timestamp + 1 days;
        vm.prank(alice);
        uint256 giftId = drop.createGift(bob, address(usdc), GIFT, birthday, "Happy Birthday!", 0, false);

        vm.warp(birthday);

        vm.prank(bob);
        drop.claimGift(giftId);

        assertEq(usdc.balanceOf(bob), GIFT);
        assertTrue(drop.getGift(giftId).claimed);
        assertTrue(card.getCard(drop.getGift(giftId).cardTokenId).claimed);
    }

    function test_RevertClaimGift_TooEarly() public {
        uint256 birthday = block.timestamp + 1 days;
        vm.prank(alice);
        uint256 giftId = drop.createGift(bob, address(usdc), GIFT, birthday, "hi", 0, false);

        vm.prank(bob);
        vm.expectRevert("Birthday has not arrived yet");
        drop.claimGift(giftId);
    }

    function test_RevertClaimGift_NotRecipient() public {
        uint256 birthday = block.timestamp + 1 days;
        vm.prank(alice);
        uint256 giftId = drop.createGift(bob, address(usdc), GIFT, birthday, "hi", 0, false);

        vm.warp(birthday);
        vm.prank(alice);
        vm.expectRevert("Not the recipient");
        drop.claimGift(giftId);
    }

    function test_RevertClaimGift_AfterCancel() public {
        uint256 birthday = block.timestamp + 1 days;
        vm.prank(alice);
        uint256 giftId = drop.createGift(bob, address(usdc), GIFT, birthday, "hi", 0, false);

        vm.prank(alice);
        drop.cancelGift(giftId);

        vm.warp(birthday);
        vm.prank(bob);
        vm.expectRevert("Gift was cancelled");
        drop.claimGift(giftId);
    }

    // ── Cancel ──────────────────────────────────────────────────────────────

    function test_CancelGift() public {
        uint256 birthday = block.timestamp + 30 days;
        vm.prank(alice);
        uint256 giftId = drop.createGift(bob, address(usdc), GIFT, birthday, "hi", 0, false);

        uint256 before = usdc.balanceOf(alice);

        vm.prank(alice);
        drop.cancelGift(giftId);

        assertTrue(drop.getGift(giftId).cancelled);
        assertEq(usdc.balanceOf(alice), before + GIFT);
        assertTrue(card.getCard(drop.getGift(giftId).cardTokenId).cancelled);
    }

    function test_RevertCancelGift_NotSender() public {
        uint256 birthday = block.timestamp + 30 days;
        vm.prank(alice);
        uint256 giftId = drop.createGift(bob, address(usdc), GIFT, birthday, "hi", 0, false);

        vm.prank(bob);
        vm.expectRevert("Not the sender");
        drop.cancelGift(giftId);
    }

    // ── Recurring ────────────────────────────────────────────────────────────

    function test_RecurringGiftEmitsEvent() public {
        uint256 birthday = block.timestamp + 1 days;
        vm.prank(alice);
        uint256 giftId = drop.createGift(bob, address(usdc), GIFT, birthday, "hi", 0, true);

        vm.warp(birthday);

        uint256 nextBirthday = drop.getGift(giftId).birthdayTimestamp + 365 days;
        vm.expectEmit(true, true, true, true);
        emit BirthdayDrop.RecurringGiftNeeded(giftId, alice, bob, nextBirthday);

        vm.prank(bob);
        drop.claimGift(giftId);
    }

    // ── EURC ────────────────────────────────────────────────────────────────

    function test_EURCGift() public {
        uint256 birthday = block.timestamp + 30 days;
        vm.prank(alice);
        uint256 giftId = drop.createGift(bob, address(eurc), GIFT, birthday, "Joyeux Anniversaire!", 1, false);

        assertEq(drop.getGift(giftId).token, address(eurc));

        vm.warp(birthday);
        vm.prank(bob);
        drop.claimGift(giftId);

        assertEq(eurc.balanceOf(bob), GIFT);
    }

    // ── Batch / Views ────────────────────────────────────────────────────────

    function test_GetGiftsByRecipient() public {
        uint256 birthday = block.timestamp + 30 days;
        vm.startPrank(alice);
        drop.createGift(bob, address(usdc), GIFT, birthday, "Gift 1", 0, false);
        drop.createGift(bob, address(eurc), GIFT, birthday, "Gift 2", 1, false);
        vm.stopPrank();

        BirthdayDrop.Gift[] memory bobGifts = drop.getGiftsByRecipient(bob);
        assertEq(bobGifts.length, 2);
    }

    function test_GetGiftsBySender() public {
        uint256 birthday = block.timestamp + 30 days;
        vm.startPrank(alice);
        drop.createGift(bob, address(usdc), GIFT, birthday, "Gift A", 0, false);
        drop.createGift(bob, address(usdc), GIFT, birthday, "Gift B", 0, false);
        vm.stopPrank();

        BirthdayDrop.Gift[] memory aliceGifts = drop.getGiftsBySender(alice);
        assertEq(aliceGifts.length, 2);
    }

    function test_TotalGifts() public {
        uint256 birthday = block.timestamp + 30 days;
        vm.startPrank(alice);
        drop.createGift(bob, address(usdc), GIFT, birthday, "a", 0, false);
        drop.createGift(bob, address(usdc), GIFT, birthday, "b", 0, false);
        vm.stopPrank();

        assertEq(drop.getTotalGifts(), 2);
    }

    // ── NFT tokenURI smoke test ───────────────────────────────────────────────

    function test_TokenURIReturnsBase64() public {
        uint256 birthday = block.timestamp + 30 days;
        vm.prank(alice);
        uint256 giftId = drop.createGift(bob, address(usdc), GIFT, birthday, "Happy Birthday!", 2, false);

        uint256 cardId = drop.getGift(giftId).cardTokenId;
        string memory uri = card.tokenURI(cardId);

        // Should start with the data URI prefix
        bytes memory b = bytes(uri);
        assertEq(b[0], "d");
        assertEq(b[1], "a");
        assertEq(b[2], "t");
        assertEq(b[3], "a");
    }
}
