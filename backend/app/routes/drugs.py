"""
Drug Management Routes
Handles drug registration and ownership transfer
"""
from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas import (
    DrugRegistrationRequest,
    DrugRegistrationResponse,
    OwnershipTransferRequest,
    OwnershipTransferResponse,
    CompositionValidationRequest,
    CompositionValidationResponse
)
from app.database import get_database
from app.utils import generate_composition_hash, blockchain_service, validate_composition
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/drugs", tags=["Drugs"])


@router.post("/validate-composition", response_model=CompositionValidationResponse)
async def validate_drug_composition(
    request: CompositionValidationRequest,
    db=Depends(get_database)
):
    """
    Validate drug composition against standard dataset
    
    - **drugName**: Name of the drug
    - **composition**: Drug composition to validate
    """
    try:
        # Fetch standard composition from dataset
        dataset_entry = await db.drug_composition_dataset.find_one(
            {"drugName": request.drugName}
        )
        
        if not dataset_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No standard composition found for drug: {request.drugName}"
            )
        
        # Validate composition
        is_valid, message, details = await validate_composition(
            request.drugName,
            request.composition.dict(),
            dataset_entry.get("standardComposition", {})
        )
        
        return {
            "isValid": is_valid,
            "message": message,
            "matchPercentage": details.get("matchPercentage"),
            "missingIngredients": details.get("missingIngredients", []),
            "extraIngredients": details.get("extraIngredients", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Composition validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Composition validation failed: {str(e)}"
        )


@router.post("/register", response_model=DrugRegistrationResponse)
async def register_drug(
    drug_data: DrugRegistrationRequest,
    db=Depends(get_database)
    
):
    """
    Register a new drug batch on the blockchain
    
    Steps:
    1. Validate composition against dataset
    2. Generate composition hash (SHA-256)
    3. Store on blockchain
    4. Store full composition in MongoDB
    
    - **batchId**: Unique batch identifier
    - **drugName**: Name of the drug
    - **composition**: Full drug composition
    - **manufactureDate**: Manufacturing date (Unix timestamp)
    - **expiryDate**: Expiry date (Unix timestamp)
    - **manufacturerAddress**: Manufacturer's wallet address
    """
    try:
        # Check if batch ID already exists
        existing_batch = await db.drug_composition_storage.find_one(
            {"batchId": drug_data.batchId}
        )
        
        if existing_batch:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch ID already exists"
            )
        
        # Validate manufacturer
        manufacturer = await db.users.find_one(
            {"walletAddress": drug_data.manufacturerAddress}
        )
        
        if not manufacturer or manufacturer.get("role") != "MANUFACTURER":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only registered manufacturers can register drugs"
            )
        
        # Validate composition against dataset
        dataset_entry = await db.drug_composition_dataset.find_one(
            {"drugName": drug_data.drugName}
        )
        
        if dataset_entry:
            is_valid, message, _ = await validate_composition(
                drug_data.drugName,
                drug_data.composition.dict(),
                dataset_entry.get("standardComposition", {})
            )
            
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Composition validation failed: {message}"
                )
        
        # Generate composition hash
        composition_hash = generate_composition_hash(drug_data.composition.dict())
        
        # Register on blockchain (build transaction)
        blockchain_result = await blockchain_service.register_drug(
            batch_id=drug_data.batchId,
            drug_name=drug_data.drugName,
            composition_hash=composition_hash,
            manufacture_date=drug_data.manufactureDate,
            expiry_date=drug_data.expiryDate,
            manufacturer_address=drug_data.manufacturerAddress
        )
        
        if not blockchain_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Blockchain registration failed: {blockchain_result.get('error')}"
            )
        
        # Store full composition in MongoDB (off-chain)
        composition_doc = {
            "batchId": drug_data.batchId,
            "drugName": drug_data.drugName,
            "fullComposition": drug_data.composition.dict(),
            "compositionHash": composition_hash,
            "manufacturer": drug_data.manufacturerAddress,
            "manufactureDate": drug_data.manufactureDate,
            "expiryDate": drug_data.expiryDate,
            "registrationTimestamp": datetime.utcnow()
        }
        
        await db.drug_composition_storage.insert_one(composition_doc)
        # ✅ Store batch master record
        await db.drug_batches.insert_one({
            "batchId": drug_data.batchId,
            "drugName": drug_data.drugName,
            "manufacturer": drug_data.manufacturerAddress.lower(),
            "currentOwner": drug_data.manufacturerAddress.lower(),
            "status": "ACTIVE",
            "manufactureDate": drug_data.manufactureDate,
            "expiryDate": drug_data.expiryDate,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        })

        
        logger.info(f"Drug registered: {drug_data.batchId} by {drug_data.manufacturerAddress}")
        
        return {
            "success": True,
            "message": "Drug registered successfully. Sign the transaction in MetaMask.",
            "batchId": drug_data.batchId,
            "compositionHash": composition_hash,
            "transactionHash": None  # Will be set after user signs in frontend
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Drug registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Drug registration failed: {str(e)}"
        )


@router.post("/transfer", response_model=OwnershipTransferResponse)
async def transfer_ownership(
    transfer_data: OwnershipTransferRequest,
    db=Depends(get_database)
):
    """
    Transfer drug ownership to another party
    
    - **batchId**: Batch identifier
    - **fromAddress**: Current owner's wallet address
    - **toAddress**: New owner's wallet address
    - **location**: Transfer location
    """
    try:
        # Validate batch exists
        batch = await db.drug_batches.find_one(
            {"batchId": transfer_data.batchId }
        )

        # ✅ Update current owner in DB
        await db.drug_batches.update_one(
            {"batchId": transfer_data.batchId},
            {
                "$set": {
                    "currentOwner": transfer_data.toAddress.lower(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )

        
        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch ID not found"
            )
        
        # Validate users
        from_address = transfer_data.fromAddress.lower()
        to_address = transfer_data.toAddress.lower()

        from_user = await db.users.find_one(
            {"walletAddress": from_address}
        )
        to_user = await db.users.find_one(
            {"walletAddress": to_address}
        )

        if not from_user or not to_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or both users not found"
            )
        
        # Validate transfer chain
        from_role = from_user.get("role")
        to_role = to_user.get("role")
        
        valid_transfers = [
            ("MANUFACTURER", "DISTRIBUTOR"),
            ("DISTRIBUTOR", "PHARMACY"),
            ("DISTRIBUTOR", "DISTRIBUTOR")
        ]
        
        if (from_role, to_role) not in valid_transfers:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Invalid transfer: {from_role} cannot transfer to {to_role}"
            )
        
        # ✅ AUTO-REGISTER NEW OWNER ON BLOCKCHAIN IF NOT ALREADY REGISTERED
        # Note: transferOwnership function in smart contract now handles auto-registration
        # when new owner receives their first transfer. Backend just needs to validate
        # that both users exist in MongoDB.
        
        # Transfer on blockchain (build transaction)
        blockchain_result = await blockchain_service.transfer_ownership(
            batch_id=transfer_data.batchId,
            new_owner=transfer_data.toAddress,
            location=transfer_data.location,
            current_owner=transfer_data.fromAddress
        )
        
        if not blockchain_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Blockchain transfer failed: {blockchain_result.get('error')}"
            )
        
        logger.info(
            f"Ownership transferred: {transfer_data.batchId} "
            f"from {transfer_data.fromAddress} to {transfer_data.toAddress}"
        )
        
        return {
            "success": True,
            "message": "Ownership transfer initiated. Sign the transaction in MetaMask.",
            "batchId": transfer_data.batchId,
            "transactionHash": None  # Will be set after user signs in frontend
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ownership transfer error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ownership transfer failed: {str(e)}"
        )


@router.get("/batch/{batch_id}")
async def get_drug_info(batch_id: str, db=Depends(get_database)):
    """
    Get complete drug information from MongoDB
    """
    try:
        drug = await db.drug_composition_storage.find_one({"batchId": batch_id})
        
        if not drug:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch ID not found"
            )
        
        # Remove MongoDB _id field
        drug.pop("_id", None)
        
        return {
            "success": True,
            "data": drug
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get drug info error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve drug info: {str(e)}"
        )
