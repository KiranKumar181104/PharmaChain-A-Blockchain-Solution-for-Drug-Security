"""
API Routes Package
"""
from .auth import router as auth_router
from .drugs import router as drugs_router
from .verification import router as verification_router
from .audit import router as audit_router

__all__ = [
    'auth_router',
    'drugs_router',
    'verification_router',
    'audit_router'
]
