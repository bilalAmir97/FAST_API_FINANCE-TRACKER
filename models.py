# models.py - This file defines the data shapes for our API requests and responses.

# Import necessary classes from the Pydantic library.
# - BaseModel is the base class all our data models will inherit from.
# - Field allows us to add extra validation and description to our model fields.
from pydantic import BaseModel, Field

# --- Pydantic Models for Request Validation ---
# Pydantic models define the structure and data types of incoming request bodies.
# FastAPI uses these models to automatically validate requests and document the API.

class UserCredentials(BaseModel):
    """ Pydantic model for the /authenticate request body. """
    # Expect a 'username' field that is a string.
    username: str
    # Expect a 'pin' field that is a string.
    # 'Field' adds more rules:
    # - ... means the field is required.
    # - min_length=4 and max_length=4 ensure the PIN is exactly 4 characters.
    pin: str = Field(..., min_length=4, max_length=4, description="PIN must be a 4-digit string")

class DepositWithdrawRequest(BaseModel):
    """ Pydantic model for the /deposit and /withdraw request bodies. """
    # Expect a 'username' field to identify the user.
    username: str
    # Expect an 'amount' field that is a float (a number with decimals).
    # 'gt=0' means the amount must be greater than 0.
    amount: float = Field(..., gt=0, description="Amount must be a positive number")

class TransferRequest(BaseModel):
    """ Pydantic model for the /transfer request body. """
    # The user sending the money.
    from_user: str
    # The user receiving the money.
    to_user: str
    # The amount to transfer, which must be a positive number.
    amount: float = Field(..., gt=0, description="Transfer amount must be positive")

class CreateUserRequest(BaseModel):
    """ Pydantic model for the /create-user request body. """
    username: str
    first_name: str
    last_name: str
    email: str
    phone: str
    pin: str = Field(..., min_length=4, max_length=4, description="PIN must be a 4-digit string")


class UserBalanceResponse(BaseModel):
    """ Pydantic model for the data returned by the /balance/{username} endpoint. """
    # The username of the account holder.
    username: str
    # The current balance of the account.
    balance: float
