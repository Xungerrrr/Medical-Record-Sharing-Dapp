pragma solidity ^0.5.0;

contract MedicalRecord {
    
    struct User {
        string name;
        string record;
        mapping(address => bool) isAuthenticated;
    }
    
    struct Doctor {
        address hospital;
    }
    
    mapping(address => User) private users;
    mapping(address => Doctor) private doctors;
    

    function registerDoctor(address h) public {
        doctors[msg.sender] = Doctor({hospital:h});
    }
    
    function readHistory(address user) public view returns(string memory record) {
        if (users[user].isAuthenticated[doctors[msg.sender].hospital] == true) {
            record = users[user].record;
        }
        else {
            record = "No permission to access history!";
        }
    }
    function addRecord(address user, string memory record) public {
        if (users[user].isAuthenticated[doctors[msg.sender].hospital] == true) {
            string memory n = "\n";
            bytes memory newRecord = bytes(record);
            bytes memory enter = bytes(n);
            bytes memory history = bytes(users[user].record);
            string memory temp = new string(newRecord.length + history.length + enter.length);
            bytes memory add = bytes(temp);
            uint k = 0;
            for (uint i = 0; i < newRecord.length; i++) add[k++] = newRecord[i];
            for (uint i = 0; i < enter.length; i++) add[k++] = enter[i];
            for (uint i = 0; i < history.length; i++) add[k++] = history[i];
            users[user].record = string(add);
        }
    }
    
    function grantAccess(address hospital) public {
        users[msg.sender].isAuthenticated[hospital] = true;
    }
    
    function removeAccess(address hospital) public {
        users[msg.sender].isAuthenticated[hospital] = false;
    }
}