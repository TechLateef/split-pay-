// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SplitBill
 * @notice Manages an isolated on-chain split bill instance on Monad testnet.
 */
contract SplitBill is ReentrancyGuard {
    enum Status {
        Open,
        Settled,
        Cancelled,
        Expired
    }

    address public immutable factory;
    address public immutable creator;
    string public billTitle;
    string public billDescription;
    uint256 public immutable totalAmount;
    uint256 public immutable splitAmount;
    uint256 public immutable totalParticipants;
    address[] public participants; // Invited & joined participants excluding creator
    
    mapping(address => bool) public isParticipant;
    mapping(address => bool) public paid;
    mapping(address => bool) public hasClaimedRefund;
    
    uint256 public immutable createdAt;
    uint256 public immutable deadline; // 0 = no deadline, otherwise unix timestamp
    Status public status;
    uint256 public paidCount;
    uint256 public totalCollected;
    bool public creatorWithdrawn;

    // Events
    event BillCreated(
        address indexed creator,
        string title,
        uint256 totalAmount,
        uint256 participantCount
    );
    event ParticipantPaid(
        address indexed participant,
        uint256 amount,
        uint256 paidCount,
        uint256 remaining
    );
    event BillSettled(address indexed creator, uint256 totalCollected);
    event BillCancelled(address indexed creator);
    event BillExpired(uint256 timestamp);
    event RefundClaimed(address indexed participant, uint256 amount);
    event CreatorWithdrew(address indexed creator, uint256 amount);

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }

    /**
     * @param _billTitle Name / title of the bill
     * @param _billDescription Description / notes
     * @param _creator Address of bill creator
     * @param _participants List of participant addresses (excluding creator)
     * @param _totalParticipants Total number of people (including creator). If < participants.length + 1, defaults to participants.length + 1
     * @param _splitAmount Share amount in wei owed by each person
     * @param _deadlineInHours Payment window in hours (0 for no deadline)
     */
    constructor(
        string memory _billTitle,
        string memory _billDescription,
        address _creator,
        address[] memory _participants,
        uint256 _totalParticipants,
        uint256 _splitAmount,
        uint256 _deadlineInHours
    ) payable {
        require(_creator != address(0), "Invalid creator address");
        require(_splitAmount > 0, "Split amount must be > 0");
        require(msg.value == _splitAmount, "Must pay creator share upfront");
        require(bytes(_billTitle).length > 0, "Bill title required");

        uint256 minParticipants = _participants.length + 1;
        uint256 actualTotal = _totalParticipants >= minParticipants ? _totalParticipants : minParticipants;

        factory = msg.sender;
        creator = _creator;
        billTitle = _billTitle;
        billDescription = _billDescription;
        splitAmount = _splitAmount;
        totalParticipants = actualTotal;
        totalAmount = _splitAmount * actualTotal;

        for (uint256 i = 0; i < _participants.length; i++) {
            address p = _participants[i];
            require(p != address(0), "Invalid participant address");
            require(p != _creator, "Creator cannot be in participant list");
            if (!isParticipant[p]) {
                isParticipant[p] = true;
                participants.push(p);
            }
        }

        createdAt = block.timestamp;
        deadline = _deadlineInHours > 0
            ? block.timestamp + (_deadlineInHours * 1 hours)
            : 0;

        // Creator is automatically paid
        paid[_creator] = true;
        paidCount = 1;
        totalCollected = msg.value;

        if (actualTotal == 1) {
            status = Status.Settled;
            emit BillSettled(_creator, totalCollected);
        } else {
            status = Status.Open;
        }

        emit BillCreated(_creator, _billTitle, totalAmount, actualTotal);
        emit ParticipantPaid(_creator, msg.value, 1, actualTotal - 1);
    }

    /**
     * @notice Checks and updates expired status if deadline has passed
     */
    function _checkAndUpdateExpired() internal {
        if (status == Status.Open && deadline > 0 && block.timestamp > deadline) {
            status = Status.Expired;
            emit BillExpired(block.timestamp);
        }
    }

    /**
     * @notice Participant pays their share. Anyone with the bill link can pay and join dynamically!
     */
    function pay() external payable nonReentrant {
        _checkAndUpdateExpired();
        require(status == Status.Open, "Bill is not open");
        require(!paid[msg.sender], "Already paid");
        require(msg.value == splitAmount, "Incorrect payment amount");
        require(paidCount < totalParticipants, "All participant slots are filled");

        // Dynamically register participant if not already pre-added
        if (!isParticipant[msg.sender] && msg.sender != creator) {
            isParticipant[msg.sender] = true;
            participants.push(msg.sender);
        }

        paid[msg.sender] = true;
        paidCount++;
        totalCollected += msg.value;

        uint256 remaining = totalParticipants > paidCount ? totalParticipants - paidCount : 0;
        emit ParticipantPaid(msg.sender, msg.value, paidCount, remaining);

        if (paidCount == totalParticipants) {
            status = Status.Settled;
            emit BillSettled(creator, totalCollected);
        }
    }

    /**
     * @notice Creator cancels the bill before settlement
     */
    function cancelBill() external onlyCreator nonReentrant {
        require(status == Status.Open, "Bill cannot be cancelled");
        status = Status.Cancelled;
        emit BillCancelled(creator);
    }

    /**
     * @notice Marks the bill as expired if deadline has passed
     */
    function expireBill() external {
        require(status == Status.Open, "Bill is not open");
        require(deadline > 0 && block.timestamp > deadline, "Deadline has not passed");
        status = Status.Expired;
        emit BillExpired(block.timestamp);
    }

    /**
     * @notice Allows any paying participant/creator to claim a refund if cancelled or expired
     */
    function claimRefund() external nonReentrant {
        _checkAndUpdateExpired();
        require(
            status == Status.Cancelled || status == Status.Expired,
            "Refund not available"
        );
        require(paid[msg.sender], "No payment to refund");
        require(!hasClaimedRefund[msg.sender], "Refund already claimed");

        hasClaimedRefund[msg.sender] = true;
        totalCollected -= splitAmount;

        (bool success, ) = payable(msg.sender).call{value: splitAmount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(msg.sender, splitAmount);
    }

    /**
     * @notice Creator withdraws all collected funds when bill is settled
     */
    function withdrawSettled() external onlyCreator nonReentrant {
        require(status == Status.Settled, "Bill is not settled");
        require(!creatorWithdrawn, "Funds already withdrawn");

        creatorWithdrawn = true;
        uint256 payout = address(this).balance;
        require(payout > 0, "No balance to withdraw");

        (bool success, ) = payable(creator).call{value: payout}("");
        require(success, "Withdrawal transfer failed");

        emit CreatorWithdrew(creator, payout);
    }

    /**
     * @notice Returns complete state of the bill in a single call
     */
    function getDetails()
        external
        view
        returns (
            address _creator,
            string memory _billTitle,
            string memory _billDescription,
            uint256 _totalAmount,
            uint256 _splitAmount,
            uint256 _createdAt,
            uint256 _deadline,
            Status _status,
            uint256 _paidCount,
            uint256 _totalParticipants,
            uint256 _totalCollected,
            bool _creatorWithdrawn
        )
    {
        return (
            creator,
            billTitle,
            billDescription,
            totalAmount,
            splitAmount,
            createdAt,
            deadline,
            (status == Status.Open && deadline > 0 && block.timestamp > deadline)
                ? Status.Expired
                : status,
            paidCount,
            totalParticipants,
            totalCollected,
            creatorWithdrawn
        );
    }

    /**
     * @notice Returns all invited participants and their paid status
     */
    function getParticipants()
        external
        view
        returns (address[] memory _participants, bool[] memory _paidStatuses)
    {
        uint256 len = participants.length;
        _participants = participants;
        _paidStatuses = new bool[](len);
        for (uint256 i = 0; i < len; i++) {
            _paidStatuses[i] = paid[participants[i]];
        }
    }

    /**
     * @notice Returns status for a specific address
     */
    function getParticipantStatus(
        address participant
    ) external view returns (bool isMember, bool hasPaid, bool refunded) {
        bool member = (participant == creator) || isParticipant[participant];
        return (member, paid[participant], hasClaimedRefund[participant]);
    }

    receive() external payable {
        revert("Use pay() to contribute");
    }
}