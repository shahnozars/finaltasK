const deployCertificateManager: DeployFunction = async function (hre) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying CertificateManager with the account:", deployer);

  
  const certificateManager = await deploy("CertificateManager", {
    from: deployer,
    args: [], 
    log: true,
    autoMine: true, 
  });

  console.log("CertificateManager deployed to:", certificateManager.address);
};

export default deployCertificateManager;

deployCertificateManager.tags = ["CertificateManager"];
