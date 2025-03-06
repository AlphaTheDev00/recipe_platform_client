# Recipe API Documentation

## Overview

This is a Django REST Framework API for a recipe sharing platform. The API allows users to:

- Create and manage recipes
- Browse and search recipes
- Rate and favorite recipes
- Add comments
- Manage user profiles

## Core Components

### 1. Models (Database Tables)

Located in `projects/recipe_api/api/models.py`:

#### Main Models:

- `Recipe`: Stores recipe information

  - Title, description, instructions
  - Cooking time, difficulty level
  - Image upload capability
  - Connected to author (user)

- `UserProfile`: Extended user information

  - Bio
  - Favorite cuisine
  - Cooking experience level
  - Created automatically when user registers

- `Category`: Recipe classifications

  - Name (e.g., Breakfast, Lunch, Dinner)
  - Description
  - Created at timestamp

- `Ingredient`: Recipe ingredients
  - Name
  - Connected to specific recipe

### 2. Serializers (Data Conversion)

Located in `projects/recipe_api/api/serializers.py`:

Serializers convert complex data (like database objects) to JSON and vice versa.

Example:

```python
class RecipeSerializer(serializers.ModelSerializer):
    ingredients = IngredientSerializer(many=True, required=False)
    author = UserSerializer(read_only=True)

    class Meta:
        model = Recipe
        fields = ('id', 'title', 'description', ...)
```

### 3. Views (API Endpoints)

Located in `projects/recipe_api/api/views.py`:

#### Main Endpoints:

1. User Management (`UserViewSet`):

   - POST `/api/users/register/`: Create new account
   - GET `/api/users/me/`: Get current user profile

2. Recipe Management (`RecipeViewSet`):

   - GET `/api/recipes/`: List all recipes
   - POST `/api/recipes/`: Create new recipe
   - GET `/api/recipes/{id}/`: Get specific recipe
   - PUT `/api/recipes/{id}/`: Update recipe
   - DELETE `/api/recipes/{id}/`: Delete recipe

   Special Features:

   - `/api/recipes/top_rated/`: Get highest rated recipes
   - `/api/recipes/trending/`: Get popular recipes
   - `/api/recipes/my_recipes/`: User's own recipes
   - `/api/recipes/recommendations/`: Personalized suggestions

3. Category Management (`CategoryViewSet`):
   - GET `/api/categories/`: List all categories
   - POST `/api/categories/`: Create new category

## How It Works (Step by Step)

### 1. Creating a Recipe

When a user creates a recipe:

1. Frontend sends POST request to `/api/recipes/`
2. Request contains:
   ```json
   {
     "title": "Chocolate Cake",
     "description": "Delicious chocolate cake",
     "instructions": "1. Mix ingredients...",
     "ingredients": [{ "name": "Flour" }, { "name": "Sugar" }],
     "categories": ["Dessert", "Baking"]
   }
   ```
3. API processes:
   - Validates data
   - Creates recipe in database
   - Creates ingredients
   - Links categories
   - Returns complete recipe data

### 2. Searching Recipes

When user searches:

1. Frontend sends GET request: `/api/recipes/?search=chocolate`
2. API:
   - Searches title, description, ingredients
   - Filters by rating, category, difficulty
   - Returns matching recipes

### 3. Rating a Recipe

When user rates a recipe:

1. Frontend sends POST request
2. API:
   - Validates user authentication
   - Creates/updates rating
   - Recalculates average rating

## Key Features

### 1. Authentication

- Token-based authentication
- Required for:
  - Creating recipes
  - Rating
  - Favoriting
  - Commenting

### 2. Image Handling

- Supports recipe image uploads
- Generates URLs for frontend display
- Uses Django's ImageField

### 3. Search and Filtering

- Search by title, ingredients, categories
- Filter by:
  - Rating
  - Cooking time
  - Difficulty
  - Category

### 4. Recommendations

- Based on user preferences
- Uses:
  - Favorite recipes
  - Rating history
  - Category preferences

## Testing the API with Postman

### Initial Setup

1. Download and install Postman
2. Create a new Collection named "Recipe API"
3. Set base URL: `http://localhost:8000`

### 1. User Authentication Tests

#### Register New User

- Method: POST
- URL: `http://localhost:8000/api/users/register/`
- Body (JSON):

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "testpass123"
}
```

#### Login

- Method: POST
- URL: `http://localhost:8000/api-token-auth/`
- Body (JSON):

```json
{
  "username": "testuser",
  "password": "testpass123"
}
```

- Save the returned token for future requests

### 2. Recipe Operations

#### Create Recipe

- Method: POST
- URL: `http://localhost:8000/api/recipes/`
- Headers:
  - Authorization: Token your_token_here
- Body (JSON):

```json
{
  "title": "Chocolate Cake",
  "description": "Delicious chocolate cake recipe",
  "instructions": "1. Mix ingredients\n2. Bake at 350°F",
  "ingredients": [
    { "name": "Flour" },
    { "name": "Sugar" },
    { "name": "Cocoa Powder" }
  ],
  "categories": ["Dessert", "Baking"]
}
```

#### Get All Recipes

- Method: GET
- URL: `http://localhost:8000/api/recipes/`
- Optional Query Parameters:
  - Search: `?search=chocolate`
  - Filter: `?category=Dessert`
  - Rating: `?min_rating=4`

#### Get Single Recipe

- Method: GET
- URL: `http://localhost:8000/api/recipes/1/`

### 3. Rating and Reviews

#### Add Rating

- Method: POST
- URL: `http://localhost:8000/api/ratings/`
- Headers: Authorization required
- Body (JSON):

```json
{
  "recipe": 1,
  "score": 5,
  "comment": "Great recipe!"
}
```

### 4. Common Response Examples

#### Success Response

```json
{
  "id": 1,
  "title": "Chocolate Cake",
  "description": "Delicious chocolate cake recipe",
  "ingredients": [
    { "id": 1, "name": "Flour" },
    { "id": 2, "name": "Sugar" }
  ],
  "avg_rating": 4.5
}
```

#### Error Response

```json
{
  "error": "Invalid request",
  "detail": "Title field is required"
}
```

### Testing Tips

1. Always check the Authorization header when required
2. Test both valid and invalid inputs
3. Verify response status codes:
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 404: Not Found
4. Test search and filter functionality
5. Verify data persistence after creation/updates

### Testing Guide

# Recipe API Testing Guide

## Postman Setup

1. **Environment Configuration**

   - Create new environment "Recipe API Dev"
   - Add variables:
     ```
     base_url: http://localhost:8000
     auth_token: [leave empty initially]
     ```

2. **Collection Setup**
   - Create new collection "Recipe API Tests"
   - Add folders:
     - Auth
     - Recipes
     - Categories
     - Ratings
     - Comments
     - Favorites

## Test Scenarios

### 1. Authentication Flow

#### 1.1 User Registration

```http
POST {{base_url}}/api/users/register/
Content-Type: application/json

{
    "username": "testchef",
    "email": "chef@test.com",
    "password": "SecurePass123!",
    "profile": {
        "bio": "Love cooking Italian food",
        "favorite_cuisine": "Italian",
        "cooking_experience": "intermediate"
    }
}
```

Expected: 201 Created with token

#### 1.2 User Login

```http
POST {{base_url}}/api-token-auth/
Content-Type: application/json

{
    "username": "testchef",
    "password": "SecurePass123!"
}
```

Expected: 200 OK with token

- Save token to environment variable: `auth_token`

### 2. Recipe Management

#### 2.1 Create Recipe (Success)

```http
POST {{base_url}}/api/recipes/
Authorization: Token {{auth_token}}
Content-Type: application/json

{
    "title": "Classic Margherita Pizza",
    "description": "Traditional Italian pizza",
    "instructions": "1. Make dough\n2. Add toppings\n3. Bake at 450°F",
    "cooking_time": 45,
    "difficulty": "medium",
    "ingredients": [
        {"name": "Pizza Dough"},
        {"name": "Tomatoes"},
        {"name": "Fresh Mozzarella"},
        {"name": "Basil"}
    ],
    "categories": ["Italian", "Pizza"]
}
```

Expected: 201 Created

#### 2.2 Create Recipe (Validation Error)

```http
POST {{base_url}}/api/recipes/
Authorization: Token {{auth_token}}
Content-Type: application/json

{
    "title": "",
    "description": "Test"
}
```

Expected: 400 Bad Request

#### 2.3 Search and Filter Tests

Test these URLs:

```
GET {{base_url}}/api/recipes/?search=pizza
GET {{base_url}}/api/recipes/?category=Italian
GET {{base_url}}/api/recipes/?min_rating=4
GET {{base_url}}/api/recipes/?difficulty=medium
GET {{base_url}}/api/recipes/?max_cooking_time=60
```

### 3. Category Operations

#### 3.1 Create Categories

```http
POST {{base_url}}/api/categories/
Authorization: Token {{auth_token}}
Content-Type: application/json

{
    "name": "Vegetarian",
    "description": "Meat-free recipes"
}
```

#### 3.2 List Categories

```http
GET {{base_url}}/api/categories/
```

### 4. Rating System

#### 4.1 Add Rating

```http
POST {{base_url}}/api/ratings/
Authorization: Token {{auth_token}}
Content-Type: application/json

{
    "recipe": 1,
    "score": 5
}
```

#### 4.2 Update Rating

```http
PUT {{base_url}}/api/ratings/1/
Authorization: Token {{auth_token}}
Content-Type: application/json

{
    "recipe": 1,
    "score": 4
}
```

### 5. Comments

#### 5.1 Add Comment

```http
POST {{base_url}}/api/comments/
Authorization: Token {{auth_token}}
Content-Type: application/json

{
    "recipe": 1,
    "content": "Great recipe! I added extra garlic."
}
```

#### 5.2 Get Recipe Comments

```http
GET {{base_url}}/api/comments/recipe_comments/?recipe_id=1
```

### 6. Favorites

#### 6.1 Add to Favorites

```http
POST {{base_url}}/api/favorites/
Authorization: Token {{auth_token}}
Content-Type: application/json

{
    "recipe": 1
}
```

#### 6.2 Get User Favorites

```http
GET {{base_url}}/api/recipes/my_favorites/
Authorization: Token {{auth_token}}
```

## Test Sequence

1. **Authentication Tests**

   - Register new user
   - Login and save token
   - Try accessing protected endpoint without token (should fail)
   - Try accessing with token (should succeed)

2. **Recipe Flow**

   - Create categories first
   - Create recipe
   - Search for created recipe
   - Update recipe
   - Add rating
   - Add to favorites
   - Add comment
   - Delete recipe

3. **Error Cases**
   - Try creating recipe without auth
   - Submit invalid data
   - Try accessing non-existent recipe
   - Try deleting other user's recipe

## Response Validation Checklist

- [ ] Status code matches expected
- [ ] Response format matches API schema
- [ ] All required fields present
- [ ] Data types are correct
- [ ] Relationships properly nested
- [ ] Timestamps in correct format
- [ ] Authorization working as expected

## Common Issues and Solutions

1. **Authentication Errors**

   - Check token format
   - Verify token not expired
   - Ensure "Token" prefix in Authorization header

2. **Data Validation**

   - Check required fields
   - Verify data types
   - Ensure valid enum values

3. **Search/Filter Issues**
   - URL encode parameters
   - Check parameter names
   - Verify filter value formats

## Performance Testing

1. **Basic Load Test**

   - Create collection runner
   - Run 100 GET requests to /recipes/
   - Check response times
   - Monitor error rates

2. **Concurrent Users**
   - Test with multiple auth tokens
   - Verify data isolation
   - Check rate limiting

## Security Testing

1. **Authentication**

   - Test expired tokens
   - Test invalid tokens
   - Test missing tokens

2. **Authorization**
   - Test access to other users' data
   - Verify proper role checks
   - Test permission boundaries

## Automated Testing Setup

1. **Collection Runner**

   - Create test scripts for each request
   - Set environment variables
   - Define success criteria

2. **Newman Integration**
   ```bash
   newman run Recipe_API_Collection.json -e Dev_Environment.json
   ```

## Monitoring Tests

1. **Response Times**

   - < 200ms: Excellent
   - 200-500ms: Good
   - > 500ms: Investigate

2. **Status Codes**
   - Track 4xx errors
   - Monitor 5xx errors
   - Log unexpected responses
