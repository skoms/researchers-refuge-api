# REST API SQLite Database for Researchers Refuge

## How to Use 
* Setting up
```
cd api 
npm install
npm run seed
```
* Starting the API
```
npm start
```

## Routes
* Main API Route - Welcome Message
```
GET: /api/
```

* GET Users Route - Returns user information
```
GET: /api/users/
```
* POST Users Route - Create new user
```
POST: /api/users/
```

* GET Articles Route - Gets and displays all the articles and basic info on owners
```
GET: /api/articles/
```
* GET Article Route - Gets and displays specified article and basic info on owner
```
GET: /api/articles/:id
```
* POST Create Article Route - Creates new article and assigns logged authenticated user as its owner
```
POST: /api/articles/
```
* PUT Update Article Route - updates article if user is authenticated to do so
```
PUT: /api/articles/:id
```
* DELETE Delete Article Route - Deletes article if user is authenticated to do so
```
DELETE: /api/articles/:id
```