# 💎 Onyx Private Limited

**Where Elegance Meets Finance**

## 📖 Overview

**Onyx Private Limited** is a next-generation banking interface designed for exclusivity, elegance, and performance. This full-stack application demonstrates enterprise-grade fintech architecture, featuring a high-performance **FastAPI** backend and a sophisticated, responsive frontend built with **Glassmorphism** principles and advanced **GSAP** animations.

---

## ✨ Key Features

### 🔐 Authentication & Security
- Robust user authentication system with PIN-based verification
- Secure session management and data protection
- Role-based access control for enhanced security

### 📊 Real-Time Dashboard
- Live balance updates with instant transaction reflection
- Account status monitoring and activity tracking
- Quick-access action buttons for common operations
- Personalized user experience with dynamic content

### 💸 Transaction Management
- **Deposit**: Seamlessly add funds with instant confirmation
- **Withdraw**: Secure cash-out with validation checks
- **Transfer**: Instant peer-to-peer transfers between Onyx users
- Transaction validation and error handling

### 📜 Transaction History
- Comprehensive activity log with detailed transaction records
- Advanced search and filter capabilities
- Export functionality for financial records
- Real-time updates for all account activities

### 🎨 Premium UI/UX Design
- **Glassmorphism Effects**: Translucent cards with sophisticated golden accents
- **Gold Dust Particles**: Custom background animation with floating gold embers
- **Responsive Layout**: Seamless experience across Desktop, Tablet, and Mobile
- **Dynamic Island Notifications**: Context-aware success/error messaging
- **Staggered Animations**: Smooth GSAP-powered entry sequences

---

## 🛠️ Technology Stack

### Frontend Architecture
| Technology | Purpose |
|:-----------|:--------|
| **HTML5 & CSS3** | Semantic markup with custom styling using CSS Variables, Flexbox, and Grid |
| **JavaScript ES6+** | Modular architecture with async/await patterns for API integration |
| **GSAP (GreenSock)** | High-performance timeline-based animations and transitions |
| **Font Awesome 6** | Premium icon library for navigation and UI elements |
| **Google Fonts** | *Playfair Display* for elegant headings, *Inter* for clean body text |

### Backend Architecture
| Technology | Purpose |
|:-----------|:--------|
| **Python 3.10+** | Core programming language with type hints |
| **FastAPI** | Modern, fast web framework with automatic API documentation |
| **Uvicorn** | Lightning-fast ASGI server with WebSocket support |
| **Pydantic** | Data validation and serialization with type safety |

---

## 🚀 Installation Guide

### Prerequisites
- Python 3.10 or higher
- pip (Python Package Installer)
- Virtual environment (recommended)

### Step-by-Step Setup

**1. Clone the Repository**
git clone <repository-url>
cd onyx-private

text

**2. Create Virtual Environment** *(Recommended)*
python -m venv venv

Activate on Windows
venv\Scripts\activate

Activate on macOS/Linux
source venv/bin/activate

**3. Install Dependencies**
pip install -r requirements.txt

**4. Launch the Application**
uvicorn main:app --reload

> Server runs at `http://127.0.0.1:8000`

---

## 📱 User Guide

### Getting Started
1. **Access Application**: Navigate to `http://127.0.0.1:8000/index.html`
2. **Create Account**: 
   - Click "Register" on the login screen
   - Enter unique username and 4-digit PIN
   - Submit to create your account
3. **Login**: Use credentials to access the secure dashboard

### Core Operations
- **Deposit Funds**: Add money to your account with instant balance updates
- **Withdraw Cash**: Securely remove funds with validation
- **Transfer Money**: Send funds to other Onyx users by username
- **View History**: Access detailed transaction logs with search/filter options

### Testing Transfers
Open a second browser window in Incognito mode, create another account, and test peer-to-peer transfers between accounts.

---

## 📂 Project Architecture

onyx-private/
│
├── assets/
│ ├── css/
│ │ └── style.css # Global styles, themes, and responsive design
│ ├── js/
│ │ ├── main.js # Core application logic and API integration
│ │ └── animations.js # GSAP animations and particle effects
│ └── images/ # Static assets and visual resources
│
├── templates/
│ ├── index.html # Login gateway
│ ├── register.html # User registration interface
│ ├── dashboard.html # Main banking hub
│ └── history.html # Transaction history view
│
├── main.py # FastAPI application entry point
├── routes.py # RESTful API endpoints
├── models.py # Pydantic data models
├── config.py # Application configuration
├── requirements.txt # Python dependencies
└── README.md # Project documentation

---

## 🎨 Design System

### Visual Identity
- **Color Palette**: Custom 135° gradient (`#1a1a1a` → `#050505`) with gold accents (`#d4af37`)
- **Typography**: Elegant *Playfair Display* serif paired with modern *Inter* sans-serif
- **Spacing**: Consistent 8px baseline grid for harmonious layouts

### UI Components
- **Glassmorphic Cards**: Semi-transparent surfaces with backdrop blur
- **Sticky Sidebar**: Fixed navigation with smooth scroll behavior
- **Interactive Elements**: Hover states with gold glow and lift effects
- **Responsive Grid**: Adaptive layouts using CSS Grid and Flexbox

### Animation Patterns
- **Page Transitions**: Staggered fade-ins with 0.1s delays
- **Micro-interactions**: Button ripples and card lifts
- **Background Effects**: Continuous gold particle animation
- **Notifications**: Slide-in dynamic island alerts

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow PEP 8 for Python code
- Use ES6+ JavaScript standards
- Write semantic HTML5
- Include JSDoc comments for functions
- Add unit tests for new features

---

## 👨‍💻 Developer

**Muhammad Bilal Amir**  
*Frontend Developer | Full-Stack Engineer*

---

<div align="center">
  <sub>Built with ❤️ and precision for modern banking experiences</sub>
</div>