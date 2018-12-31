var MedicalRecord = artifacts.require('./MedicalRecord.sol')

module.exports = function (deployer) {
  deployer.deploy(MedicalRecord)
}
