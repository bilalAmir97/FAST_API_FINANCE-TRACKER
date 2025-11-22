# config.py - This file holds global variables and configuration for the application.

# Import the 'Dict' and 'List' type hints from the 'typing' library for clear code.
from typing import Dict, List

# This is a Python dictionary that will act as our simple in-memory database.
# - The 'keys' of the dictionary will be the usernames (e.g., "Alice").
# - The 'values' will be their corresponding bank balances (e.g., 50000.0).
# We start with an empty dictionary because users will be added dynamically
# through the /create-user API endpoint.
# The type hint 'Dict[str, float]' means we expect a dictionary with string keys and float values.
user_accounts: Dict[str, float] = {}

# This is a list that will store a history of all transactions.
# Each item in the list will be a dictionary representing a single transaction.
transaction_history: List[Dict] = []

# Dictionary to store extended user details (email, phone, pin, etc.)
user_details: Dict[str, Dict] = {}


