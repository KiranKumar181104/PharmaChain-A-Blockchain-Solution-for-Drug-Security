"""
Hashing Utilities for Drug Composition
Uses SHA-256 for secure, deterministic hashing
"""
import hashlib
import json
from typing import Dict, Any


def normalize_composition(composition: Dict[str, Any]) -> str:
    """
    Normalize composition data to ensure consistent hashing
    
    Args:
        composition: Drug composition dictionary
        
    Returns:
        Normalized JSON string ready for hashing
    """
    # Sort ingredients by name for consistency
    if 'ingredients' in composition:
        composition['ingredients'] = sorted(
            composition['ingredients'],
            key=lambda x: x.get('name', '').lower()
        )
    
    # Convert to JSON with sorted keys
    normalized = json.dumps(composition, sort_keys=True, separators=(',', ':'))
    return normalized


def generate_composition_hash(composition: Dict[str, Any]) -> str:
    """
    Generate SHA-256 hash of drug composition
    
    Args:
        composition: Drug composition dictionary
        
    Returns:
        64-character hexadecimal SHA-256 hash
        
    Example:
        >>> composition = {
        ...     "ingredients": [
        ...         {"name": "Paracetamol", "quantity": "500mg", "percentage": 50.0},
        ...         {"name": "Caffeine", "quantity": "65mg", "percentage": 6.5}
        ...     ]
        ... }
        >>> hash_value = generate_composition_hash(composition)
        >>> len(hash_value)
        64
    """
    # Normalize composition for consistent hashing
    normalized_composition = normalize_composition(composition)
    
    # Generate SHA-256 hash
    hash_object = hashlib.sha256(normalized_composition.encode('utf-8'))
    hash_hex = hash_object.hexdigest()
    
    return hash_hex


def verify_composition_hash(composition: Dict[str, Any], expected_hash: str) -> bool:
    """
    Verify that a composition matches the expected hash
    
    Args:
        composition: Drug composition dictionary
        expected_hash: Expected SHA-256 hash
        
    Returns:
        True if hash matches, False otherwise
    """
    actual_hash = generate_composition_hash(composition)
    return actual_hash.lower() == expected_hash.lower()


def hash_string(data: str) -> str:
    """
    Generate SHA-256 hash of a string
    
    Args:
        data: String to hash
        
    Returns:
        64-character hexadecimal SHA-256 hash
    """
    hash_object = hashlib.sha256(data.encode('utf-8'))
    return hash_object.hexdigest()
