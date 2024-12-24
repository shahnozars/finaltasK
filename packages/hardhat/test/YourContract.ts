import { ethers } from "hardhat";
import { expect } from "chai";
import { CertificateManager } from "../typechain-types";

describe("CertificateManager Contract", function () {
  let certificateManager: CertificateManager;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async () => {
    const certificateManagerFactory = await ethers.getContractFactory("CertificateManager");
    certificateManager = await certificateManagerFactory.deploy();
    await certificateManager.waitForDeployment();

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  it("Should allow the owner to issue a certificate", async () => {
    const title = "Certificate of Excellence";
  
    
    const issueDate = (await ethers.provider.getBlock("latest")).timestamp;
  
    const tx = await certificateManager.connect(owner).issueCertificate(addr1.address, title);
    const receipt = await tx.wait(); 
  
    await expect(tx)
      .to.emit(certificateManager, "CertificateIssued")
      .withArgs(addr1.address, title, issueDate);  
  
    const certificate = await certificateManager.certificates(addr1.address);
    expect(certificate.title).to.equal(title);
    expect(certificate.valid).to.be.true;
  });
  

  it("Should not allow issuing a certificate to the same address twice", async () => {
    const title = "Certificate of Excellence";

    await certificateManager.connect(owner).issueCertificate(addr1.address, title);
    
    await expect(certificateManager.connect(owner).issueCertificate(addr1.address, "Another Certificate"))
      .to.be.revertedWith("Certificate already issued to this address");
  });

  it("Should allow the owner to revoke a certificate", async () => {
    const title = "Certificate of Excellence";

    await certificateManager.connect(owner).issueCertificate(addr1.address, title);
    const tx = await certificateManager.connect(owner).revokeCertificate(addr1.address);
    await expect(tx)
      .to.emit(certificateManager, "CertificateRevoked")
      .withArgs(addr1.address);

    const certificate = await certificateManager.certificates(addr1.address);
    expect(certificate.valid).to.be.false;
  });

  it("Should not allow revoking a certificate that doesn't exist", async () => {
    await expect(certificateManager.connect(owner).revokeCertificate(addr1.address))
      .to.be.revertedWith("No valid certificate found for this address");
  });

  it("Should allow anyone to check a certificate", async () => {
    const title = "Certificate of Excellence";

    await certificateManager.connect(owner).issueCertificate(addr1.address, title);
    
    const [certTitle, issueDate, valid] = await certificateManager.checkCertificate(addr1.address);
    expect(certTitle).to.equal(title);
    expect(valid).to.be.true;
    expect(issueDate).to.be.greaterThan(0);
  });

  it("Should allow only the owner to issue or revoke certificates", async () => {
    const title = "Certificate of Excellence";
    
    await expect(certificateManager.connect(addr1).issueCertificate(addr2.address, title))
      .to.be.revertedWith("Only owner can perform this action");

    await expect(certificateManager.connect(addr1).revokeCertificate(addr2.address))
      .to.be.revertedWith("Only owner can perform this action");
  });
});
