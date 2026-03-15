"""
UGROW Restaurants Router
API endpoints for restaurant management
SRS Section 6 - Admin Restaurant Management
"""

import uuid
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form # type: ignore
from sqlalchemy.orm import Session # type: ignore

from database import get_db
from models import (
    User, 
    Restaurant, 
    PlatformCredential,
    RestaurantCreate,
    RestaurantResponse,
    RestaurantStatus,
    PlatformType,
    CredentialType
)
from services.auth_service import get_current_user_dependency, get_current_admin
from services.report_service import ReportService

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])


# ============================================
# Helper Functions
# ============================================

def restaurant_to_dict(restaurant: Restaurant) -> dict:
    """Convert Restaurant model to dictionary"""
    return {
        "id": str(restaurant.id),
        "name": restaurant.name,
        "ownerName": restaurant.owner_name,
        "ownerPhone": restaurant.owner_phone,
        "managerName": restaurant.manager_name,
        "managerPhone": restaurant.manager_phone,
        "area": restaurant.area,
        "address": restaurant.address,
        "googleMapsUrl": restaurant.google_maps_url,
        "profileImageUrl": restaurant.profile_image_url,
        "platforms": restaurant.platforms,
        "status": restaurant.status.value,
        "createdAt": restaurant.created_at.isoformat() if restaurant.created_at else None,
        "updatedAt": restaurant.updated_at.isoformat() if restaurant.updated_at else None,
        "credentials": [
            {
                "id": str(c.id),
                "platform": c.platform.value,
                "credentialType": c.credential_type.value,
                "loginEmail": c.login_email,
                # Password is encrypted, don't return in list view
            }
            for c in restaurant.credentials
        ]
    }


# ============================================
# Read Endpoints
# ============================================

@router.get("", response_model=List[dict])
async def get_all_restaurants(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Get all restaurants (admin only)
    Optional filter by status
    """
    query = db.query(Restaurant)
    
    if status:
        try:
            status_enum = RestaurantStatus(status)
            query = query.filter(Restaurant.status == status_enum)
        except ValueError:
            pass
    
    restaurants = query.order_by(Restaurant.name).all()
    return [restaurant_to_dict(r) for r in restaurants]


@router.get("/{restaurant_id}", response_model=dict)
async def get_restaurant(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get single restaurant by ID
    Admin can view any, client can only view their own
    """
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == uuid.UUID(restaurant_id)
    ).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    # Check permissions
    if not current_user.is_admin and current_user.restaurant_id != restaurant.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return restaurant_to_dict(restaurant)


# ============================================
# Create & Update Endpoints
# ============================================

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_restaurant(
    name: str = Form(...),
    ownerName: Optional[str] = Form(None),
    ownerPhone: Optional[str] = Form(None),
    managerName: Optional[str] = Form(None),
    managerPhone: Optional[str] = Form(None),
    area: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    googleMapsUrl: Optional[str] = Form(None),
    platforms: str = Form(...),  # JSON array as string
    status: str = Form("active"),
    clientUsername: str = Form(...),
    clientPassword: str = Form(...),
    profileImage: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Create a new restaurant with client user (admin only)
    """
    from services.auth_service import AuthService
    
    try:
        # Parse platforms
        import json
        platform_list = json.loads(platforms)
        
        # Create restaurant
        restaurant = Restaurant(
            id=uuid.uuid4(),
            name=name,
            owner_name=ownerName,
            owner_phone=ownerPhone,
            manager_name=managerName,
            manager_phone=managerPhone,
            area=area,
            address=address,
            google_maps_url=googleMapsUrl,
            platforms=platform_list,
            status=RestaurantStatus(status),
            profile_image_url="/No_Profile.png"  # Default
        )
        
        db.add(restaurant)
        db.flush()  # Get restaurant.id without committing
        
        # Handle profile image upload
        if profileImage:
            # Save file and update path
            # Implementation depends on storage service
            pass
        
        # Create client user
        auth_service = AuthService(db)
        email = f"{clientUsername}@ugrow.com"
        
        # Check if email exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email {email} already exists"
            )
        
        client_user = User(
            id=uuid.uuid4(),
            username=clientUsername,
            email=email,
            password_hash=auth_service.hash_password(clientPassword),
            role="client",
            restaurant_id=restaurant.id,
            status="active"
        )
        
        db.add(client_user)
        db.commit()
        db.refresh(restaurant)
        
        return restaurant_to_dict(restaurant)
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid platforms format"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create restaurant: {str(e)}"
        )


@router.put("/{restaurant_id}", response_model=dict)
async def update_restaurant(
    restaurant_id: str,
    name: Optional[str] = Form(None),
    ownerName: Optional[str] = Form(None),
    ownerPhone: Optional[str] = Form(None),
    managerName: Optional[str] = Form(None),
    managerPhone: Optional[str] = Form(None),
    area: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    googleMapsUrl: Optional[str] = Form(None),
    platforms: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    profileImage: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Update restaurant details (admin only)
    """
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == uuid.UUID(restaurant_id)
    ).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    try:
        if name:
            restaurant.name = name
        if ownerName is not None:
            restaurant.owner_name = ownerName
        if ownerPhone is not None:
            restaurant.owner_phone = ownerPhone
        if managerName is not None:
            restaurant.manager_name = managerName
        if managerPhone is not None:
            restaurant.manager_phone = managerPhone
        if area is not None:
            restaurant.area = area
        if address is not None:
            restaurant.address = address
        if googleMapsUrl is not None:
            restaurant.google_maps_url = googleMapsUrl
        if platforms:
            import json
            restaurant.platforms = json.loads(platforms)
        if status:
            restaurant.status = RestaurantStatus(status)
        
        # Handle profile image
        if profileImage:
            # Save and update path
            pass
        
        db.commit()
        db.refresh(restaurant)
        
        return restaurant_to_dict(restaurant)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update restaurant: {str(e)}"
        )


@router.patch("/{restaurant_id}/status", response_model=dict)
async def update_restaurant_status(
    restaurant_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Update restaurant status (admin only)
    """
    try:
        new_status = RestaurantStatus(status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: active, hold, deactivated"
        )
    
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == uuid.UUID(restaurant_id)
    ).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    restaurant.status = new_status
    db.commit()
    db.refresh(restaurant)
    
    return restaurant_to_dict(restaurant)


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_restaurant(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Delete a restaurant and all associated data (admin only)
    """
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == uuid.UUID(restaurant_id)
    ).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    # Delete associated reports and files
    report_service = ReportService(db)
    reports = report_service.get_reports_by_restaurant(restaurant.id)
    for report in reports:
        report_service.delete_report(report.id)
    
    # Delete will cascade to users and credentials due to model relationships
    db.delete(restaurant)
    db.commit()
    
    return None


# ============================================
# Platform Credentials Endpoints
# ============================================

@router.post("/{restaurant_id}/credentials", response_model=dict)
async def add_platform_credential(
    restaurant_id: str,
    platform: str,
    loginEmail: str,
    password: str,
    credentialType: str = "portal",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Add platform credentials for a restaurant (admin only)
    Password is encrypted before storage
    """
    from services.auth_service import AuthService
    
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == uuid.UUID(restaurant_id)
    ).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    try:
        platform_enum = PlatformType(platform)
        cred_type_enum = CredentialType(credentialType)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid platform or credential type: {e}"
        )
    
    # Check if credential already exists for this platform + type
    existing = db.query(PlatformCredential).filter(
        PlatformCredential.restaurant_id == restaurant.id,
        PlatformCredential.platform == platform_enum,
        PlatformCredential.credential_type == cred_type_enum
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Credentials already exist for {platform} ({credentialType})"
        )
    
    # Encrypt password
    auth_service = AuthService(db)
    encrypted_password = auth_service.encrypt_credential(password)
    
    credential = PlatformCredential(
        id=uuid.uuid4(),
        restaurant_id=restaurant.id,
        platform=platform_enum,
        credential_type=cred_type_enum,
        login_email=loginEmail,
        password_encrypted=encrypted_password
    )
    
    db.add(credential)
    db.commit()
    db.refresh(credential)
    
    return {
        "id": str(credential.id),
        "platform": credential.platform.value,
        "credentialType": credential.credential_type.value,
        "loginEmail": credential.login_email,
        "message": "Credentials added successfully"
    }


@router.get("/{restaurant_id}/credentials", response_model=List[dict])
async def get_platform_credentials(
    restaurant_id: str,
    includePasswords: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get platform credentials for a restaurant
    Admin can view all including decrypted passwords
    Client can only view their own (passwords masked)
    """
    from services.auth_service import AuthService
    
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == uuid.UUID(restaurant_id)
    ).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    # Check permissions
    if not current_user.is_admin and current_user.restaurant_id != restaurant.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    credentials = db.query(PlatformCredential).filter(
        PlatformCredential.restaurant_id == restaurant.id
    ).all()
    
    result = []
    auth_service = AuthService(db)
    
    for cred in credentials:
        cred_dict = {
            "id": str(cred.id),
            "platform": cred.platform.value,
            "credentialType": cred.credential_type.value,
            "loginEmail": cred.login_email,
        }
        
        # Only admin can view decrypted passwords
        if includePasswords and current_user.is_admin:
            try:
                decrypted = auth_service.decrypt_credential(cred.password_encrypted)
                cred_dict["password"] = decrypted
            except Exception:
                cred_dict["password"] = "[DECRYPTION_ERROR]"
        else:
            cred_dict["password"] = "••••••••"
        
        result.append(cred_dict)
    
    return result


@router.delete("/{restaurant_id}/credentials/{credential_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_platform_credential(
    restaurant_id: str,
    credential_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Delete platform credentials (admin only)
    """
    credential = db.query(PlatformCredential).filter(
        PlatformCredential.id == uuid.UUID(credential_id),
        PlatformCredential.restaurant_id == uuid.UUID(restaurant_id)
    ).first()
    
    if not credential:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found"
        )
    
    db.delete(credential)
    db.commit()
    
    return None