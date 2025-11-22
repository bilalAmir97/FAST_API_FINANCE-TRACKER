# main.py - This is the main entry point of our application.

# Import necessary libraries
import uvicorn  # A server to run our FastAPI application
from fastapi import FastAPI  # The main FastAPI class
from fastapi.middleware.cors import CORSMiddleware  # Middleware for handling Cross-Origin Resource Sharing
import logging  # Library for logging events and errors

# Import the router from our routes.py file
from routes import router as api_router

# Initialize the FastAPI application
# This creates the main app object. We also add metadata for the API documentation.
app = FastAPI(
    title="Multi-User Bank API",
    description="A simple API for multi-user bank operations including transfers, deposits, and withdrawals.",
    version="1.0.0",
)

# --- Configure Logging ---
# This section sets up logging to show information in the console and save it to a file.

# Create a handler to write log messages to a file named 'bank_api.log'
file_handler = logging.FileHandler('bank_api.log')
# Set the minimum level of messages to be logged to the file (INFO and above)
file_handler.setLevel(logging.INFO)

# Create a handler to show log messages in the console
console_handler = logging.StreamHandler()
# Set the minimum level of messages to be logged to the console
console_handler.setLevel(logging.INFO)

# Define the format for our log messages
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# Apply the format to both handlers
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Configure the root logger with our handlers. This activates the logging setup.
logging.basicConfig(level=logging.INFO, handlers=[file_handler, console_handler])

# Get a logger instance for this file
logger = logging.getLogger(__name__)

# --- CORS Middleware Configuration ---
# CORS allows a web page from one domain to access API resources on another domain.

# Define which origins are allowed to access our API. "*" means all origins.
origins = ["*"]

# Add the CORS middleware to our FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow origins defined above
    allow_credentials=True,  # Allow cookies to be included in requests
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all request headers
)

# --- Include API Routes ---
# This line includes all the endpoints defined in our routes.py file into the main app.
# The 'prefix' adds '/api' to the beginning of all routes from that file.
app.include_router(api_router, prefix="/api", tags=["Bank Operations"])

# --- Root Endpoint ---
# This is the main landing page of our API.
@app.get("/", tags=["Root"])
async def read_root():
    # Log that someone accessed this endpoint
    logger.info("Root endpoint accessed.")
    # Return a welcome message
    return {"message": "Welcome to the Multi-User Bank API. Visit /docs for documentation."}

# --- Uvicorn Server ---
# This block of code runs only when you execute this script directly (e.g., `python main.py`).
if __name__ == "__main__":
    # Log that the server is starting
    logger.info("Starting Uvicorn server.")
    # Run the Uvicorn server
    # 'main:app' tells uvicorn to look for the 'app' object in the 'main.py' file.
    # 'reload=True' makes the server restart automatically when you change the code.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
