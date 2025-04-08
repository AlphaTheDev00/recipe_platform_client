# Savora Recipe Platform 🍽️

## Description 📝

Savora is a full-stack recipe sharing platform developed as part of my software engineering bootcamp at General Assembly. This project demonstrates my ability to create a complete web application with a Django REST Framework backend API and a React frontend. Users can discover, create, share, and manage their favorite recipes in a seamless and intuitive interface.

## Deployment Links 🚀

- **Frontend**: [https://savora-recipe.netlify.app](https://savora-recipe.netlify.app)
- **API**: [https://savora-recipe-b7493c60c573-2ac1db511588.herokuapp.com/](https://savora-recipe-b7493c60c573-2ac1db511588.herokuapp.com/)

### Demo Accounts 👤

**Regular Users:**

- Usernames: user1, user2, user3, user4, user5
- Password for all accounts: `password123`

**Admin Account:**

- Username: `admin`
- Password: `admin123`

## Getting Started / Code Installation 🛠️

### Backend Setup ⚙️

1. Clone the repository:

```bash
git clone <repository-url>
cd recipe_api
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run migrations:

```bash
python manage.py migrate
```

6. Seed the database with sample data (optional):

```bash
python manage.py seed_recipes
```

7. Run the development server:

```bash
python manage.py runserver
```

### Frontend Setup 💻

1. Navigate to the frontend directory:

```bash
cd ../recipe-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development server:

```bash
npm run dev
```

5. Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

## Timeframe & Working Team 🕒

This project was completed as a solo project over a two-week sprint. I was responsible for all aspects of the application, from planning and design to implementation and deployment.

## Technologies Used 💡

### Frontend

- ⚛️ **React 19**: Component-based UI library
- 🔀 **React Router 7**: For client-side routing
- 🌐 **Axios**: HTTP client for API requests
- 🎨 **Bootstrap 5**: CSS framework for responsive design
- ⚡ **Vite**: Build tool and development server
- 🌍 **Netlify**: Frontend deployment platform

### Backend

- 🐍 **Django 5.1**: Python web framework
- 📡 **Django REST Framework**: API development toolkit
- 🗃️ **PostgreSQL**: Relational database
- 🔐 **Token Authentication**: For secure user authentication
- ☁️ **Cloudinary**: Cloud storage for media files
- 🌐 **Heroku**: Backend deployment platform

### Development Tools

- 🧠 **Git & GitHub**: Version control
- 🖥️ **VS Code**: Code editor
- 🧪 **Postman**: API testing
- 🖌️ **Figma**: UI/UX design
- 📋 **Trello**: Project management

## Brief 📋

The project brief required the development of a full-stack application with the following specifications:

- 🔧 Create a RESTful API using Django REST Framework
- 🧩 Implement a React frontend that consumes the API
- 🔐 Include user authentication and authorization
- ✏️ Implement CRUD functionality for at least one resource
- 📱 Design a responsive and intuitive user interface
- 🚀 Deploy both frontend and backend to production environments
- 📚 Include comprehensive documentation

## Planning 🗂️

### Entity Relationship Diagram (ERD) 🧩



### Wireframes 🖼️

&#x20;

### User Stories 👥

- As a user, I want to browse recipes without logging in
- As a user, I want to create an account to save my favorite recipes
- As a user, I want to create, edit, and delete my own recipes
- As a user, I want to rate and comment on recipes
- As a user, I want to filter recipes by category or difficulty
- As a user, I want to customize my profile with my cooking preferences

### Project Management 📌



## Build / Code Process 🧱

(Details on backend/frontend code implementation follow in the document)

## Challenges ⚠️

(Details on API structure, image handling, and authentication)

## Wins 🏆

(Details on achievements such as responsive design)
