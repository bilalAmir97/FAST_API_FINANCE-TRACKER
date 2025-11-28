# routes.py - This file contains all the API endpoint definitions for our application.

# Import necessary libraries and modules
import logging  # For logging events
from fastapi import APIRouter, HTTPException  # APIRouter to group routes, HTTPException to handle errors
from typing import Dict  # For type hinting dictionaries

# Import our Pydantic models from models.py
from models import (
    UserCredentials,
    DepositWithdrawRequest,
    TransferRequest,
    CreateUserRequest,
    UserBalanceResponse,
    TransactionAnalysisRequest,
    TransactionAnalysisResponse,
)
# Import our "database" from config.py
from config import user_accounts, transaction_history, user_details
from datetime import datetime

# Import AI service for transaction analysis
from ai_service import analyze_transaction, analyze_spending_overview

# Get a logger instance for this file. It will inherit the configuration from main.py.
logger = logging.getLogger(__name__)

# Create an APIRouter instance. We'll add all our endpoints to this router.
router = APIRouter()

# --- API Endpoints ---

# The '@router.post("/authenticate")' line is a decorator.
# It tells FastAPI that the function below it handles POST requests to the /authenticate URL.
@router.post("/authenticate", summary="Authenticate a user")
async def authenticate(credentials: UserCredentials):
    """
    Authenticates a user based on username and a 4-digit PIN.
    - **username**: The user's username.
    - **pin**: A 4-digit numeric PIN.
    """
    # Check if the provided PIN is composed of digits.
    if not credentials.pin.isdigit():
        # If not, log a warning and raise an HTTPException.
        # This sends a 400 Bad Request error response to the client.
        logger.warning(f"Authentication failed for {credentials.username}: Invalid PIN format")
        raise HTTPException(status_code=400, detail="Invalid PIN format. PIN must be a 4-digit number.")
    
    # Check if the username exists in our user_accounts dictionary.
    if credentials.username in user_accounts:
        # If the user exists, log the successful authentication and return a welcome message.
        logger.info(f"User {credentials.username} authenticated successfully.")
        return {"message": f"Welcome, {credentials.username}!"}
    
    # If the user does not exist, log a warning and raise a 404 Not Found error.
    logger.warning(f"Authentication failed: User {credentials.username} not found.")
    raise HTTPException(status_code=404, detail="User not found.")

@router.post("/deposit", summary="Deposit funds into a user's account")
async def deposit(request: DepositWithdrawRequest):
    """
    Deposits a specified amount into a user's account.
    - **username**: The user to deposit funds to.
    - **amount**: The positive amount to deposit.
    """
    # Check if the user exists before depositing.
    if request.username not in user_accounts:
        logger.error(f"Deposit failed: User {request.username} not found.")
        raise HTTPException(status_code=404, detail=f"User '{request.username}' not found.")
    
    # If the user exists, add the amount to their balance.
    user_accounts[request.username] += request.amount
    
    # Log the transaction to our history
    deposit_record = {
        "type": "deposit",
        "username": request.username,
        "amount": request.amount,
        "timestamp": datetime.now().isoformat(),
        "note": request.note,
    }
    transaction_history.append(deposit_record)

    # Optionally run AI analysis on the note
    analysis = None
    if request.note:
        try:
            analysis = await analyze_transaction(request.note)
            if analysis and "category" in analysis:
                deposit_record["category"] = analysis["category"]
        except Exception as e:  # Do not fail the transaction on AI issues
            logger.exception("AI analysis failed for deposit: %s", e)

    # Log the successful transaction.
    logger.info(f"Deposited {request.amount} to {request.username}. New balance: {user_accounts[request.username]}")
    # Return a success message with the new balance.
    response_body = {
        "message": "Deposit successful",
        "username": request.username,
        "new_balance": user_accounts[request.username],
    }
    if analysis:
        response_body["analysis"] = analysis
    return response_body

@router.post("/withdraw", summary="Withdraw funds from a user's account")
async def withdraw(request: DepositWithdrawRequest):
    """
    Withdraws a specified amount from a user's account.
    - **username**: The user to withdraw funds from.
    - **amount**: The positive amount to withdraw.
    """
    # Check if the user exists.
    if request.username not in user_accounts:
        logger.error(f"Withdrawal failed: User {request.username} not found.")
        raise HTTPException(status_code=404, detail=f"User '{request.username}' not found.")

    # Check if the user has enough money to withdraw.
    if user_accounts[request.username] < request.amount:
        logger.error(f"Withdrawal failed for {request.username}: Insufficient balance.")
        raise HTTPException(status_code=400, detail="Insufficient balance.")

    # If checks pass, subtract the amount from the user's balance.
    user_accounts[request.username] -= request.amount

    # Log the transaction
    withdrawal_record = {
        "type": "withdrawal",
        "username": request.username,
        "amount": -request.amount, # Store as a negative value
        "timestamp": datetime.now().isoformat(),
        "note": request.note,
    }
    transaction_history.append(withdrawal_record)

    # Optionally run AI analysis on the note
    analysis = None
    if request.note:
        try:
            analysis = await analyze_transaction(request.note)
            if analysis and "category" in analysis:
                withdrawal_record["category"] = analysis["category"]
        except Exception as e:  # Do not fail the transaction on AI issues
            logger.exception("AI analysis failed for withdrawal: %s", e)

    logger.info(f"Withdrew {request.amount} from {request.username}. New balance: {user_accounts[request.username]}")
    # Return a success message.
    response_body = {
        "message": "Withdrawal successful",
        "username": request.username,
        "new_balance": user_accounts[request.username],
    }
    if analysis:
        response_body["analysis"] = analysis
    return response_body

# The 'response_model' tells FastAPI to validate the outgoing response against our Pydantic model.
# This ensures the response format is always correct and documents it in the API docs.
@router.get("/balance/{username}", summary="Get a user's balance", response_model=UserBalanceResponse)
async def get_balance(username: str):
    """
    Returns the current balance for a specific user.
    """
    # Check if the user exists.
    if username not in user_accounts:
        logger.warning(f"Balance check failed: User {username} not found.")
        raise HTTPException(status_code=404, detail=f"User '{username}' not found.")
    
    logger.info(f"Balance check for {username}.")
    # Return the username and their balance. FastAPI will validate this against UserBalanceResponse.
    return {"username": username, "balance": user_accounts[username]}

@router.post("/transfer", summary="Transfer funds between users")
async def transfer(request: TransferRequest):
    """
    Transfers an amount from one user to another.
    """
    # Check if both the sender and receiver exist.
    if request.from_user not in user_accounts:
        raise HTTPException(status_code=404, detail=f"Sender '{request.from_user}' not found.")
    if request.to_user not in user_accounts:
        raise HTTPException(status_code=404, detail=f"Receiver '{request.to_user}' not found.")
    # A user cannot send money to themselves.
    if request.from_user == request.to_user:
        raise HTTPException(status_code=400, detail="Sender and receiver cannot be the same user.")

    # Check if the sender has enough money.
    if user_accounts[request.from_user] < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance.")

    # Perform the transaction.
    user_accounts[request.from_user] -= request.amount
    user_accounts[request.to_user] += request.amount
    
    # Log the transaction for both parties
    timestamp = datetime.now().isoformat()
    transfer_out_record = {
        "type": "transfer_out",
        "username": request.from_user,
        "amount": -request.amount,
        "to_user": request.to_user,
        "timestamp": timestamp,
        "note": request.note,
    }
    transfer_in_record = {
        "type": "transfer_in",
        "username": request.to_user,
        "amount": request.amount,
        "from_user": request.from_user,
        "timestamp": timestamp,
        "note": request.note,
    }
    transaction_history.append(transfer_out_record)
    transaction_history.append(transfer_in_record)

    # Optionally run AI analysis on the note
    analysis = None
    if request.note:
        try:
            analysis = await analyze_transaction(request.note)
            if analysis and "category" in analysis:
                transfer_out_record["category"] = analysis["category"]
                transfer_in_record["category"] = analysis["category"]
        except Exception as e:  # Do not fail the transaction on AI issues
            logger.exception("AI analysis failed for transfer: %s", e)

    logger.info(f"Transferred {request.amount} from {request.from_user} to {request.to_user}.")
    
    # Return a detailed success message.
    response_body = {
        "message": "Transfer successful",
        "transaction": vars(request),
        "updated_balances": {
            request.from_user: user_accounts[request.from_user],
            request.to_user: user_accounts[request.to_user]
        },
    }
    if analysis:
        response_body["analysis"] = analysis
    return response_body

# The '-> Dict[str, float]' is a type hint indicating the function returns a dictionary
# with string keys and float values.
@router.get("/transactions/{username}", summary="Get user transaction history")
async def get_transactions(username: str):
    """
    Returns the recent transaction history for a specific user.
    """
    if username not in user_accounts:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found.")
    
    # Filter transactions for this user
    user_txs = [tx for tx in transaction_history if tx["username"] == username]
    
    # Return the most recent 10 transactions (assuming append order is chronological)
    return {"transactions": user_txs[-10:][::-1]} # Reverse to show newest first


@router.get("/spending-summary/{username}", summary="Get AI spending summary based on dominant category")
async def get_spending_summary(username: str):
    """Compute the user's dominant spending category and return a one-line AI tip.

    Only considers outflows (withdrawals and transfers out) that have an attached category.
    """
    if username not in user_accounts:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found.")

    # Collect relevant transactions
    user_txs = [tx for tx in transaction_history if tx.get("username") == username]

    category_totals: Dict[str, float] = {}
    for tx in user_txs:
        category = tx.get("category")
        amount = tx.get("amount", 0.0)
        # We treat negative amounts as spending (withdrawals, transfer_out)
        if not category or amount >= 0:
            continue
        spend = abs(float(amount))
        category_totals[category] = category_totals.get(category, 0.0) + spend

    if not category_totals:
        return {
            "has_data": False,
            "category": None,
            "total": 0.0,
            "tip": "No spending insights available yet.",
        }

    # Find dominant category by total spend
    top_category, top_total = max(category_totals.items(), key=lambda kv: kv[1])

    tip = None
    try:
        tip = await analyze_spending_overview(top_category, top_total)
    except Exception as e:  # Do not fail the request on AI issues
        logger.exception("AI spending summary failed for %s: %s", username, e)

    return {
        "has_data": True,
        "category": top_category,
        "total": top_total,
        "tip": tip or f"Your highest spending category is {top_category}.",
    }

@router.get("/users", summary="Get all users and balances")
async def get_users() -> Dict[str, float]:
    """
    Returns a dictionary of all users and their current balances.
    """
    logger.info("All user balances requested.")
    return user_accounts

# 'status_code=201' sets the default success status code to 201 Created,
# which is more appropriate for creating a new resource.
@router.post("/create-user", status_code=201, summary="Create a new user")
async def create_user(request: CreateUserRequest):
    """
    Creates a new user with the provided details.
    """
    if request.username in user_accounts:
        raise HTTPException(status_code=400, detail=f"User '{request.username}' already exists.")
    
    # Initialize balance to 0
    user_accounts[request.username] = 0.0
    
    # Store full user details
    user_details[request.username] = {
        "first_name": request.first_name,
        "last_name": request.last_name,
        "email": request.email,
        "phone": request.phone,
        "pin": request.pin # In production, HASH THIS PIN!
    }
    
    logger.info(f"New user created: {request.username}")
    return {
        "message": "User created successfully",
        "username": request.username
    }


@router.post("/analyze-transaction", response_model=TransactionAnalysisResponse, summary="AI analyze a transaction note")
async def analyze_transaction_endpoint(request: TransactionAnalysisRequest) -> TransactionAnalysisResponse:
    """Run the Categorizer -> Analyzer AI workflow on a transaction note.

    - **note**: Free-text description of the transaction (e.g., "Pizza with friends").
    - Returns: detected category and a short savings tip.
    """
    try:
        result = await analyze_transaction(request.note)
    except RuntimeError as e:
        # Typically missing API key or configuration
        logger.error("AI analysis configuration error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:  # pragma: no cover - defensive
        logger.exception("AI analysis failed")
        raise HTTPException(status_code=500, detail="AI analysis failed") from e

    return TransactionAnalysisResponse(**result)
