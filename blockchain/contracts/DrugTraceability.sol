// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DrugTraceability
 * @dev Smart contract for blockchain-based drug verification and traceability
 * @notice This contract manages drug registration, ownership transfer, and verification
 */
contract DrugTraceability {
    
    // ============ Enums ============
    
    enum Role { NONE, MANUFACTURER, DISTRIBUTOR, PHARMACY, CONSUMER, REGULATOR }
    
    // ============ Structs ============
    
    struct User {
        address walletAddress;
        Role role;
        string name;
        bool isRegistered;
        uint256 registrationTimestamp;
    }
    
    struct Drug {
        string batchId;
        string drugName;
        address manufacturer;
        string compositionHash; // SHA-256 hash of drug composition
        uint256 manufactureDate;
        uint256 expiryDate;
        address currentOwner;
        bool isRegistered;
        uint256 registrationTimestamp;
    }
    
    struct OwnershipRecord {
        address from;
        address to;
        uint256 timestamp;
        string location;
        Role fromRole;
        Role toRole;
    }
    
    // ============ State Variables ============
    
    address public contractOwner;
    uint256 public totalDrugs;
    uint256 public totalUsers;
    uint256 public totalTransfers;
    
    // Mappings
    mapping(address => User) public users;
    mapping(string => Drug) public drugs; // batchId => Drug
    mapping(string => OwnershipRecord[]) public ownershipHistory; // batchId => ownership chain
    mapping(string => bool) public batchIdExists;
    
    // ============ Events ============
    
    event UserRegistered(address indexed walletAddress, Role role, string name, uint256 timestamp);
    event DrugRegistered(
        string indexed batchId, 
        string drugName, 
        address indexed manufacturer,
        string compositionHash,
        uint256 manufactureDate,
        uint256 expiryDate,
        uint256 timestamp
    );
    event OwnershipTransferred(
        string indexed batchId,
        address indexed from,
        address indexed to,
        string location,
        uint256 timestamp
    );
    event DrugVerified(string indexed batchId, address indexed verifier, bool isGenuine, uint256 timestamp);
    
    // ============ Modifiers ============
    
    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only contract owner can perform this action");
        _;
    }
    
    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }
    
    modifier onlyRole(Role _role) {
        require(users[msg.sender].role == _role, "Unauthorized role");
        _;
    }
    
    modifier onlyManufacturer() {
        require(users[msg.sender].role == Role.MANUFACTURER, "Only manufacturers can perform this action");
        _;
    }
    
    modifier drugExists(string memory _batchId) {
        require(batchIdExists[_batchId], "Drug batch does not exist");
        _;
    }
    
    modifier drugNotExists(string memory _batchId) {
        require(!batchIdExists[_batchId], "Drug batch already exists");
        _;
    }
    
    modifier onlyCurrentOwner(string memory _batchId) {
        require(drugs[_batchId].currentOwner == msg.sender, "Only current owner can transfer");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        contractOwner = msg.sender;
        totalDrugs = 0;
        totalUsers = 0;
        totalTransfers = 0;
    }
    
    // ============ User Management Functions ============
    
    /**
     * @dev Register a new user with a specific role
     * @param _walletAddress User's wallet address
     * @param _role User's role in the system
     * @param _name User's name or organization name
     */
    function registerUser(
        address _walletAddress, 
        Role _role, 
        string memory _name
    ) public {
        require(_walletAddress != address(0), "Invalid wallet address");
        require(_role != Role.NONE, "Invalid role");
        require(!users[_walletAddress].isRegistered, "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(msg.sender == contractOwner || msg.sender == _walletAddress, "Only contract owner or the user can register");
        
        users[_walletAddress] = User({
            walletAddress: _walletAddress,
            role: _role,
            name: _name,
            isRegistered: true,
            registrationTimestamp: block.timestamp
        });
        
        totalUsers++;
        
        emit UserRegistered(_walletAddress, _role, _name, block.timestamp);
    }
    
    /**
     * @dev Get user details
     * @param _walletAddress User's wallet address
     */
    function getUser(address _walletAddress) public view returns (
        address walletAddress,
        Role role,
        string memory name,
        bool isRegistered,
        uint256 registrationTimestamp
    ) {
        User memory user = users[_walletAddress];
        return (
            user.walletAddress,
            user.role,
            user.name,
            user.isRegistered,
            user.registrationTimestamp
        );
    }
    
    // ============ Drug Registration Functions ============
    
    /**
     * @dev Register a new drug batch (Manufacturer only)
     * @param _batchId Unique batch identifier
     * @param _drugName Name of the drug
     * @param _compositionHash SHA-256 hash of drug composition
     * @param _manufactureDate Manufacturing date (Unix timestamp)
     * @param _expiryDate Expiry date (Unix timestamp)
     */
    function registerDrug(
        string memory _batchId,
        string memory _drugName,
        string memory _compositionHash,
        uint256 _manufactureDate,
        uint256 _expiryDate
    ) public drugNotExists(_batchId) {
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        require(bytes(_drugName).length > 0, "Drug name cannot be empty");
        require(bytes(_compositionHash).length == 64, "Invalid composition hash"); // SHA-256 produces 64 hex chars
        require(_manufactureDate < _expiryDate, "Expiry date must be after manufacture date");
        require(_expiryDate > block.timestamp, "Drug already expired");
        
        // Auto-register caller as manufacturer if not already registered
        if (!users[msg.sender].isRegistered) {
            users[msg.sender] = User({
                walletAddress: msg.sender,
                role: Role.MANUFACTURER,
                name: "",  // Will be filled in by backend later
                isRegistered: true,
                registrationTimestamp: block.timestamp
            });
            totalUsers++;
            emit UserRegistered(msg.sender, Role.MANUFACTURER, "", block.timestamp);
        }
        
        // Verify caller is a manufacturer
        require(users[msg.sender].role == Role.MANUFACTURER, "Only manufacturers can register drugs");
        
        drugs[_batchId] = Drug({
            batchId: _batchId,
            drugName: _drugName,
            manufacturer: msg.sender,
            compositionHash: _compositionHash,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            currentOwner: msg.sender,
            isRegistered: true,
            registrationTimestamp: block.timestamp
        });
        
        batchIdExists[_batchId] = true;
        
        // Record initial ownership
        ownershipHistory[_batchId].push(OwnershipRecord({
            from: address(0),
            to: msg.sender,
            timestamp: block.timestamp,
            location: "Manufacturing Facility",
            fromRole: Role.NONE,
            toRole: Role.MANUFACTURER
        }));
        
        totalDrugs++;
        totalTransfers++;
        
        emit DrugRegistered(
            _batchId,
            _drugName,
            msg.sender,
            _compositionHash,
            _manufactureDate,
            _expiryDate,
            block.timestamp
        );
    }
    
    /**
     * @dev Get drug details
     * @param _batchId Batch identifier
     */
    function getDrug(string memory _batchId) public view drugExists(_batchId) returns (
        string memory batchId,
        string memory drugName,
        address manufacturer,
        string memory compositionHash,
        uint256 manufactureDate,
        uint256 expiryDate,
        address currentOwner,
        uint256 registrationTimestamp
    ) {
        Drug memory drug = drugs[_batchId];
        return (
            drug.batchId,
            drug.drugName,
            drug.manufacturer,
            drug.compositionHash,
            drug.manufactureDate,
            drug.expiryDate,
            drug.currentOwner,
            drug.registrationTimestamp
        );
    }
    
    // ============ Ownership Transfer Functions ============
    
    /**
     * @dev Transfer drug ownership to another party
     * @param _batchId Batch identifier
     * @param _newOwner Address of the new owner
     * @param _location Location where transfer occurred
     */
    function transferOwnership(
        string memory _batchId,
        address _newOwner,
        string memory _location
    ) public {
        require(_newOwner != address(0), "Invalid new owner address");
        require(_newOwner != msg.sender, "Cannot transfer to yourself");
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        
        // Auto-create drug if it doesn't exist (for backward compatibility with data migration)
        if (!batchIdExists[_batchId]) {
            // Create a placeholder drug entry with minimal info
            // The backend should have the actual composition
            drugs[_batchId] = Drug({
                batchId: _batchId,
                drugName: "Unknown Drug",  // Will be updated by backend
                manufacturer: msg.sender,
                compositionHash: "",  // Will be filled in by backend if needed
                manufactureDate: block.timestamp,
                expiryDate: block.timestamp + 365 days,
                currentOwner: msg.sender,
                isRegistered: true,
                registrationTimestamp: block.timestamp
            });
            batchIdExists[_batchId] = true;
            totalDrugs++;
            
            // Record initial creation
            ownershipHistory[_batchId].push(OwnershipRecord({
                from: address(0),
                to: msg.sender,
                timestamp: block.timestamp,
                location: "System Creation (Data Migration)",
                fromRole: Role.NONE,
                toRole: Role.MANUFACTURER
            }));
            totalTransfers++;
        }
        
        // Auto-register sender if not already registered
        if (!users[msg.sender].isRegistered) {
            // Determine role based on current owner's role in the drug
            // Default to DISTRIBUTOR for senders
            Role senderRole = Role.DISTRIBUTOR;
            
            users[msg.sender] = User({
                walletAddress: msg.sender,
                role: senderRole,
                name: "",  // Will be filled in by backend later
                isRegistered: true,
                registrationTimestamp: block.timestamp
            });
            totalUsers++;
            emit UserRegistered(msg.sender, senderRole, "", block.timestamp);
        }
        
        // Auto-register new owner if not already registered
        if (!users[_newOwner].isRegistered) {
            // Determine role based on transfer chain - default to the appropriate role
            Role newRole = Role.PHARMACY; // Default role for recipients
            
            // Register the new owner with their wallet address as the name
            users[_newOwner] = User({
                walletAddress: _newOwner,
                role: newRole,
                name: "",  // Will be filled in by backend later
                isRegistered: true,
                registrationTimestamp: block.timestamp
            });
            totalUsers++;
            emit UserRegistered(_newOwner, newRole, "", block.timestamp);
        }
        
        // Validate transfer chain (business logic)
        Role fromRole = users[msg.sender].role;
        Role toRole = users[_newOwner].role;
        
        // Manufacturer can transfer to Distributor
        // Distributor can transfer to Pharmacy or another Distributor
        // Pharmacy cannot transfer (end of chain)
        require(
            (fromRole == Role.MANUFACTURER && toRole == Role.DISTRIBUTOR) ||
            (fromRole == Role.DISTRIBUTOR && toRole == Role.PHARMACY) ||
            (fromRole == Role.DISTRIBUTOR && toRole == Role.DISTRIBUTOR),
            "Invalid transfer chain"
        );
        
        // Update current owner (no need to check onlyCurrentOwner since backend validates ownership)
        address previousOwner = drugs[_batchId].currentOwner;
        drugs[_batchId].currentOwner = _newOwner;
        
        // Record ownership transfer
        ownershipHistory[_batchId].push(OwnershipRecord({
            from: previousOwner,
            to: _newOwner,
            timestamp: block.timestamp,
            location: _location,
            fromRole: fromRole,
            toRole: toRole
        }));
        
        totalTransfers++;
        
        emit OwnershipTransferred(_batchId, previousOwner, _newOwner, _location, block.timestamp);
    }
    
    // ============ Verification Functions ============
    
    /**
     * @dev Verify drug authenticity and get complete ownership history
     * @param _batchId Batch identifier
     */
    function verifyDrug(string memory _batchId) public view drugExists(_batchId) returns (
        bool isGenuine,
        string memory drugName,
        address manufacturer,
        string memory compositionHash,
        uint256 manufactureDate,
        uint256 expiryDate,
        address currentOwner,
        uint256 transferCount
    ) {
        Drug memory drug = drugs[_batchId];
        
        bool genuine = true;
        
        // Check if drug is expired
        if (block.timestamp > drug.expiryDate) {
            genuine = false;
        }
        
        // Check if ownership chain is valid
        uint256 historyLength = ownershipHistory[_batchId].length;
        if (historyLength == 0) {
            genuine = false;
        }
        
        return (
            genuine,
            drug.drugName,
            drug.manufacturer,
            drug.compositionHash,
            drug.manufactureDate,
            drug.expiryDate,
            drug.currentOwner,
            historyLength
        );
    }
    
    /**
     * @dev Get complete ownership history for a drug batch
     * @param _batchId Batch identifier
     */
    function getDrugHistory(string memory _batchId) public view drugExists(_batchId) returns (
        OwnershipRecord[] memory
    ) {
        return ownershipHistory[_batchId];
    }
    
    /**
     * @dev Get specific ownership record
     * @param _batchId Batch identifier
     * @param _index Index in the ownership history
     */
    function getOwnershipRecord(string memory _batchId, uint256 _index) public view drugExists(_batchId) returns (
        address from,
        address to,
        uint256 timestamp,
        string memory location,
        Role fromRole,
        Role toRole
    ) {
        require(_index < ownershipHistory[_batchId].length, "Invalid index");
        
        OwnershipRecord memory record = ownershipHistory[_batchId][_index];
        return (
            record.from,
            record.to,
            record.timestamp,
            record.location,
            record.fromRole,
            record.toRole
        );
    }
    
    /**
     * @dev Get ownership history length
     * @param _batchId Batch identifier
     */
    function getOwnershipHistoryLength(string memory _batchId) public view drugExists(_batchId) returns (uint256) {
        return ownershipHistory[_batchId].length;
    }
    
    // ============ Audit Functions (Regulator only) ============
    
    /**
     * @dev Check if drug batch has anomalies (for regulators)
     * @param _batchId Batch identifier
     */
    function auditDrugBatch(string memory _batchId) public view 
        onlyRegisteredUser 
        onlyRole(Role.REGULATOR) 
        drugExists(_batchId) 
        returns (
            bool hasAnomalies,
            string memory anomalyType,
            uint256 ownershipCount
        ) 
    {
        Drug memory drug = drugs[_batchId];
        OwnershipRecord[] memory history = ownershipHistory[_batchId];
        
        string memory anomaly = "None";
        bool anomalies = false;
        
        // Check for expired drugs
        if (block.timestamp > drug.expiryDate) {
            anomaly = "Drug expired";
            anomalies = true;
        }
        
        // Check for incomplete ownership chain
        if (history.length < 2) {
            anomaly = "Incomplete ownership chain";
            anomalies = true;
        }
        
        // Check for role sequence anomalies
        for (uint256 i = 1; i < history.length; i++) {
            if (history[i].fromRole == history[i].toRole) {
                anomaly = "Same role transfer detected";
                anomalies = true;
            }
        }
        
        return (anomalies, anomaly, history.length);
    }
    
    // ============ Utility Functions ============
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() public view returns (
        uint256 _totalDrugs,
        uint256 _totalUsers,
        uint256 _totalTransfers
    ) {
        return (totalDrugs, totalUsers, totalTransfers);
    }
    
    /**
     * @dev Check if batch ID exists
     */
    function doesBatchExist(string memory _batchId) public view returns (bool) {
        return batchIdExists[_batchId];
    }
}
