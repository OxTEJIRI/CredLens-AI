// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CredLensScoreRegistry {
    address public owner;

    struct ScoreRecord {
        uint16 score;
        string label;
        string sourceChain;
        uint256 updatedAt;
        bool exists;
    }

    mapping(address => ScoreRecord) private scores;

    event ScoreUpdated(
        address indexed wallet,
        uint16 score,
        string label,
        string sourceChain,
        uint256 updatedAt
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setScore(
        address wallet,
        uint16 score,
        string calldata label,
        string calldata sourceChain
    ) external onlyOwner {
        require(wallet != address(0), "Invalid wallet");
        require(score <= 100, "Score must be between 0 and 100");
        require(bytes(label).length > 0, "Label is required");
        require(bytes(sourceChain).length > 0, "Source chain is required");

        scores[wallet] = ScoreRecord({
            score: score,
            label: label,
            sourceChain: sourceChain,
            updatedAt: block.timestamp,
            exists: true
        });

        emit ScoreUpdated(wallet, score, label, sourceChain, block.timestamp);
    }

    function getScore(address wallet)
        external
        view
        returns (
            uint16 score,
            string memory label,
            string memory sourceChain,
            uint256 updatedAt,
            bool exists
        )
    {
        ScoreRecord memory record = scores[wallet];
        return (
            record.score,
            record.label,
            record.sourceChain,
            record.updatedAt,
            record.exists
        );
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }
}
