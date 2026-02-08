"""
Drug Composition Validation Utilities
Validates drug composition against standard dataset
"""
from typing import Dict, List, Any, Tuple
import logging

logger = logging.getLogger(__name__)


async def validate_composition(
    drug_name: str,
    provided_composition: Dict[str, Any],
    dataset_composition: Dict[str, Any]
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Validate provided composition against dataset
    
    Args:
        drug_name: Name of the drug
        provided_composition: Composition provided by manufacturer
        dataset_composition: Standard composition from dataset
        
    Returns:
        Tuple of (is_valid, message, validation_details)
    """
    try:
        provided_ingredients = {
            ing['name'].lower(): ing 
            for ing in provided_composition.get('ingredients', [])
        }
        
        dataset_ingredients = {
            ing['name'].lower(): ing 
            for ing in dataset_composition.get('ingredients', [])
        }
        
        # Find missing and extra ingredients
        provided_names = set(provided_ingredients.keys())
        dataset_names = set(dataset_ingredients.keys())
        
        missing_ingredients = list(dataset_names - provided_names)
        extra_ingredients = list(provided_names - dataset_names)
        
        # Calculate match percentage
        common_ingredients = provided_names & dataset_names
        if len(dataset_names) > 0:
            match_percentage = (len(common_ingredients) / len(dataset_names)) * 100
        else:
            match_percentage = 0
        
        # Determine validity (>= 90% match required)
        is_valid = match_percentage >= 90 and len(missing_ingredients) == 0
        
        if is_valid:
            message = f"Composition validated successfully ({match_percentage:.1f}% match)"
        else:
            message = f"Composition validation failed ({match_percentage:.1f}% match)"
        
        validation_details = {
            'matchPercentage': match_percentage,
            'missingIngredients': missing_ingredients,
            'extraIngredients': extra_ingredients,
            'totalProvidedIngredients': len(provided_names),
            'totalExpectedIngredients': len(dataset_names)
        }
        
        return is_valid, message, validation_details
        
    except Exception as e:
        logger.error(f"Composition validation error: {str(e)}")
        return False, f"Validation error: {str(e)}", {}


def normalize_ingredient_name(name: str) -> str:
    """
    Normalize ingredient name for comparison
    
    Args:
        name: Ingredient name
        
    Returns:
        Normalized name (lowercase, trimmed)
    """
    return name.strip().lower()


def compare_ingredient_quantities(
    provided_qty: str,
    expected_qty: str
) -> bool:
    """
    Compare ingredient quantities (basic comparison)
    
    Args:
        provided_qty: Provided quantity string
        expected_qty: Expected quantity string
        
    Returns:
        True if quantities match (basic string comparison)
    """
    # In production, implement proper unit conversion and tolerance checking
    return provided_qty.strip().lower() == expected_qty.strip().lower()
