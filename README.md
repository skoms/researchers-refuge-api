# REST API SQLite Database for Researchers Refuge

## Description

This is a REST API to be used as the back-end for the Researcher's Refuge application. It includes a connection to a PostgreSQL Database, and utilizes Sequelize and Express to deal with the route requests and responses. It also includes a very basic back-end authentication for Users trying to log into the website using the authentication middleware for routes that require it, also automatically hashes any password before entering the database.

## How to Install

1. Clone the repository

```
git clone https://github.com/skoms/researchers-refuge-api.git
```

2. Open the downloaded code and install dependencies

```
npm install
```

3. Seed the data to a PostgreSQL Database

```
npm run seed
```

4. Start the api

```
npm start
```

5. <a href='https://github.com/skoms/researchers-refuge'>Set up and start Client</a>

## Routes

- Main API Route - Welcome Message

```
GET: /api/
```

### Admin Routes

Gets all the statistics on row count in needed tables

```
GET: /api/admin/stats/
```

Gets all the users (and sorts if selected)

```
GET: /api/admin/users/
```

Gets all the users (and sorts if selected) based on search query

```
GET: /api/admin/users/search/
```

Gets all the articles (and sorts if selected)

```
GET: /api/admin/articles/
```

Gets all the articles (and sorts if selected) based on search query

```
GET: /api/admin/articles/search/
```

Gets all the topics (and sorts if selected)

```
GET: /api/admin/topics/
```

Gets all the topics (and sorts if selected) based on search query

```
GET: /api/admin/topics/search/
```

Gets all the categories (and sorts if selected)

```
GET: /api/admin/categories/
```

Gets all the categories (and sorts if selected) based on search query

```
GET: /api/admin/categories/search/
```

Gets all the reports (and sorts if selected)

```
GET: /api/admin/reports/
```

Gets all the reports (and sorts if selected) based on search query

```
GET: /api/admin/reports/search/
```

Posts user to the database

```
POST: /api/admin/users/
```

Posts article to the database

```
POST: /api/admin/articles/
```

Posts topic to the database

```
POST: /api/admin/topics/
```

Posts category to the database

```
POST: /api/admin/categories/
```

Posts report to the database

```
POST: /api/admin/reports/
```

Updates entry of :type and param id

```
PUT: /api/admin/:type
```

Blocks entry of :type and param id

```
PUT: /api/admin/:type/block
```

Marks report as one of ['open', 'resolved', 'rejected'] and updates the entry

```
PUT: /api/admin/reports/mark
```

Deletes entry of :type and param id

```
DELETE: /api/admin/:type
```

### Article Routes

Gets all the articles and owner info based on filter

```
GET: /api/articles/filter/
```

Gets recommended articles

```
GET: /api/articles/recommended/
```

Gets articles by its tag

```
GET: /api/articles/tag/
```

Gets articles by query

```
GET: /api/articles/query/
```

Gets articles by followed users

```
GET: /api/articles/following/
```

Gets article by param id

```
GET: /api/articles/
```

Gets articles from owner by param id

```
GET: /api/articles/owner/
```

Posts article to database

```
POST: /api/articles/
```

Updates article by param id

```
PUT: /api/articles/
```

Accredits article by param id

```
PUT: /api/articles/credit/
```

Deletes article by param id

```
DELETE: /api/articles/
```

### Category Routes

Gets all categories

```
GET: /api/categories/
```

Gets category by param id

```
GET: /api/categories/
```

Gets categories by query

```
GET: /api/categories/query/
```

### Report Routes

Gets error message saying they cannot read reports from this unauthorized route

```
GET: /api/reports/
```

Posts a new report to the database

```
POST: /api/reports/
```

### Topic Routes

Gets all topics

```
GET: /api/topics/
```

Gets topics by its tag

```
GET: /api/topics/tag/
```

Gets topics by query

```
GET: /api/topics/query/
```

Gets topic by name

```
GET: /api/topics/name/
```

Gets topic by id

```
GET: /api/topics/id/
```

Gets recommended topics

```
GET: /api/topics/recommended/
```

### User Routes

Gets specified user by param id

```
GET: /api/users/
```

Gets info about authenticated user

```
GET: /api/users/me/
```

Gets recommended users

```
GET: /api/users/recommended/
```

Gets users by query

```
GET: /api/users/query/
```

Posts user to database

```
POST: /api/users/
```

Updates user to database

```
PUT: /api/users/
```

Follows user and updates to database

```
PUT: /api/users/follow/
```
