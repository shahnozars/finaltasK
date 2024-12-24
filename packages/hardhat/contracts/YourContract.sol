// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateManager {
    address public owner;

    struct Certificate {
        string title;
        uint256 issueDate;
        bool valid;
    }

    mapping(address => Certificate) public certificates;

    event CertificateIssued(address indexed recipient, string title, uint256 issueDate);
    event CertificateRevoked(address indexed recipient);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(address recipient, string memory title) public onlyOwner {
        require(certificates[recipient].valid == false, "Certificate already issued to this address");

        certificates[recipient] = Certificate({
            title: title,
            issueDate: block.timestamp,
            valid: true
        });

        emit CertificateIssued(recipient, title, block.timestamp);
    }

    function revokeCertificate(address recipient) public onlyOwner {
        require(certificates[recipient].valid == true, "No valid certificate found for this address");

        certificates[recipient].valid = false;

        emit CertificateRevoked(recipient);
    }

    function checkCertificate(address recipient) public view returns (string memory title, uint256 issueDate, bool valid) {
        Certificate memory cert = certificates[recipient];
        return (cert.title, cert.issueDate, cert.valid);
    }
}