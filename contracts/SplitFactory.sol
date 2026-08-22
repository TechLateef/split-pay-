// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SplitBill.sol";

/**
 * @title SplitFactory
 * @notice Factory contract that deploys and indexes SplitBill contracts on Monad.
 */
contract SplitFactory {
    address[] public allBills;
    mapping(address => address[]) private creatorBills;
    mapping(address => address[]) private participantBills;
    mapping(address => bool) public isBill;

    event BillCreated(
        address indexed billAddress,
        address indexed creator,
        string billTitle,
        uint256 totalAmount,
        uint256 splitAmount,
        uint256 participantCount
    );

    /**
     * @notice Deploys a new SplitBill contract with pre-defined participants
     */
    function createBill(
        string memory _billTitle,
        string memory _billDescription,
        address[] memory _participants,
        uint256 _splitAmount,
        uint256 _deadlineInHours
    ) external payable returns (address) {
        return createBillWithCount(
            _billTitle,
            _billDescription,
            _participants,
            _participants.length + 1,
            _splitAmount,
            _deadlineInHours
        );
    }

    /**
     * @notice Deploys a new SplitBill contract with open slots or pre-defined participants
     * @param _billTitle Name of the bill
     * @param _billDescription Description / memo
     * @param _participants Array of invited participant addresses (can be empty)
     * @param _totalParticipants Total number of people splitting (including creator)
     * @param _splitAmount Amount in wei each person owes
     * @param _deadlineInHours Payment window in hours (0 = no deadline)
     */
    function createBillWithCount(
        string memory _billTitle,
        string memory _billDescription,
        address[] memory _participants,
        uint256 _totalParticipants,
        uint256 _splitAmount,
        uint256 _deadlineInHours
    ) public payable returns (address) {
        require(_splitAmount > 0, "Split amount must be > 0");
        require(msg.value == _splitAmount, "Must pay creator share upfront");

        uint256 minParticipants = _participants.length + 1;
        uint256 actualTotal = _totalParticipants >= minParticipants ? _totalParticipants : minParticipants;

        SplitBill bill = new SplitBill{value: msg.value}(
            _billTitle,
            _billDescription,
            msg.sender,
            _participants,
            actualTotal,
            _splitAmount,
            _deadlineInHours
        );

        address billAddress = address(bill);
        allBills.push(billAddress);
        isBill[billAddress] = true;
        creatorBills[msg.sender].push(billAddress);

        for (uint256 i = 0; i < _participants.length; i++) {
            participantBills[_participants[i]].push(billAddress);
        }

        uint256 totalAmount = _splitAmount * actualTotal;

        emit BillCreated(
            billAddress,
            msg.sender,
            _billTitle,
            totalAmount,
            _splitAmount,
            actualTotal
        );

        return billAddress;
    }

    /**
     * @notice Get all bills created by a specific address
     */
    function getCreatorBills(
        address creator
    ) external view returns (address[] memory) {
        return creatorBills[creator];
    }

    /**
     * @notice Get all bills where an address is an invited participant
     */
    function getParticipantBills(
        address participant
    ) external view returns (address[] memory) {
        return participantBills[participant];
    }

    /**
     * @notice Returns total number of bills created
     */
    function getBillsCount() external view returns (uint256) {
        return allBills.length;
    }

    /**
     * @notice Returns all bill addresses
     */
    function getAllBills() external view returns (address[] memory) {
        return allBills;
    }
}