// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import medicalRecordArtifact from '../../build/contracts/MedicalRecord.json'

// MedicalRecord is our usable abstraction, which we'll use through the code below.
const MedicalRecord = contract(medicalRecordArtifact)

let accounts
let hospitalAccount
let doctorAccount
let patientAccount

const App = {
  start: function () {
    const self = this

    // Bootstrap the MedicalRecord abstraction for Use.
    MedicalRecord.setProvider(web3.currentProvider)

    // Get all accounts
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  registerHospital: function() {
    const hospitalAddress = document.getElementById('hospital_address')
    hospitalAccount = accounts[0]
    hospitalAddress.innerHTML = hospitalAccount
  },

  registerDoctor: function() {
    const doctorAddress = document.getElementById('doctor_address')
    doctorAccount = accounts[1]
    const hospital = document.getElementById('input_hospital_address').value
    let medicalRecord
    MedicalRecord.deployed().then(function (instance) {
      medicalRecord = instance
      medicalRecord.registerDoctor(hospital, { from: doctorAccount })
    })
    doctorAddress.innerHTML = doctorAccount
  },

  registerPatient: function() {
    const patientAddress = document.getElementById('patient_address')
    patientAccount = accounts[2]
    patientAddress.innerHTML = patientAccount
  },

  readRecord: function() {
    const self = this
    let medicalRecord
    const patient = document.getElementById('input_patient_address').value;
    MedicalRecord.deployed().then(function (instance) {
      medicalRecord = instance
      return medicalRecord.readHistory.call(patient, { from: doctorAccount })
    }).then(function (value) {
      const status = document.getElementById('status')
      status.innerHTML = value.valueOf()
      if (status.innerHTML !== "No permission to access history!") {
        document.getElementById('add').style.visibility = "visible"
        document.getElementById('new').style.visibility = "visible"
        document.getElementById('new_record').style.visibility = "visible"
      }
      else {
        document.getElementById('add').style.visibility = "hidden"
        document.getElementById('new').style.visibility = "hidden"
        document.getElementById('new_record').style.visibility = "hidden"
      }

    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  addRecord: function() {
    const self = this
    let medicalRecord
    MedicalRecord.deployed().then(function (instance) {
      medicalRecord = instance
      const newRecord = document.getElementById('new_record').value
      var currentDate = new Date()
      var date = currentDate.getDate()
      var month = currentDate.getMonth()
      var year = currentDate.getFullYear()
      var hour = ("0" + currentDate.getHours()).slice(-2)
      var minute = ("0" + currentDate.getMinutes()).slice(-2)
      var second = ("0" + currentDate.getSeconds()).slice(-2)
      var dateString = year + "-" + (month + 1) + "-" + date + " " + hour + ":" + minute + ":" + second + "  " + newRecord
      medicalRecord.addRecord(patientAccount, dateString, { from: doctorAccount })
    }).then(function () {
      self.readRecord()
    })
  },

  grantAccess: function() {
    let medicalRecord
    const hospital = document.getElementById('patient_hospital_address').value
    MedicalRecord.deployed().then(function (instance) {
      medicalRecord = instance
      medicalRecord.grantAccess(hospital, { from: patientAccount })
    })
  },
  removeAccess: function() {
    let medicalRecord
    const hospital = document.getElementById('patient_hospital_address').value
    MedicalRecord.deployed().then(function (instance) {
      medicalRecord = instance
      medicalRecord.removeAccess(hospital, { from: patientAccount })
    })
  }
}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  }

  App.start()
})
