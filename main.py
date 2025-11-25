# main.py - This is the main entry point of our application.

# Import necessary libraries
import uvicorn  # A server to run our FastAPI application
from fastapi import FastAPI  # The main FastAPI class
from fastapi.middleware.cors import CORSMiddleware  # Middleware for handling Cross-Origin Resource Sharing
import logging  # Library for logging events and errors

from fastapi.staticfiles import StaticFiles  # For serving static files like CSS and JS
from fastapi.responses import FileResponse  # For serving HTML files

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

# --- Mount Static Files ---
# This allows us to serve files from the "assets" directory at the "/assets" URL path.
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

# --- Include API Routes ---
# This line includes all the endpoints defined in our routes.py file into the main app.
# The 'prefix' adds '/api' to the beginning of all routes from that file.
app.include_router(api_router, prefix="/api", tags=["Bank Operations"])

# --- Frontend Routes ---
# These endpoints serve the HTML files for our frontend application.

@app.get("/", tags=["Frontend"])
async def read_index():
    """Serve the login page (index.html)"""
    logger.info("Serving index.html")
    return FileResponse("index.html")

@app.get("/register", tags=["Frontend"])
async def read_register():
    """Serve the registration page"""
    logger.info("Serving register.html")
    return FileResponse("register.html")

@app.get("/dashboard", tags=["Frontend"])
async def read_dashboard():
    """Serve the dashboard page"""
    logger.info("Serving dashboard.html")
    return FileResponse("dashboard.html")

@app.get("/history", tags=["Frontend"])
async def read_history():
    """Serve the transaction history page"""
    logger.info("Serving history.html")
    return FileResponse("history.html")

# --- Uvicorn Server ---
# This block of code runs only when you execute this script directly (e.g., `python main.py`).
if __name__ == "__main__":
    # Log that the server is starting
    logger.info("Starting Uvicorn server.")
    # Run the Uvicorn server
    # 'main:app' tells uvicorn to look for the 'app' object in the 'main.py' file.
    # 'reload=True' makes the server restart automatically when you change the code.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
