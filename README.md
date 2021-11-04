<img
src='./images/RR_BANNER.png'
alt='researchers refuge banner'
/>

---

| <a href='https://researchers-refuge.herokuapp.com/'><button>✅ Live Demo</button></a>
| <a href='https://github.com/skoms/researchers-refuge-api'><button>💻 Front-End Client Repository</button></a>
| <a href='https://github.com/skoms'><button><svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
</svg> Skoms' GitHub</button></a>
|

_On live demo please allow the website 30 seconds for cold-startup_

---

# REST API SQLite Database for Researchers Refuge

<!-- vscode-markdown-toc -->

## 📋 Table Of Contents

1. [🗒️ Description](#Description)
2. [⚙️ Technologies](#Technologies)
3. [📓 How to Install](#HowToInstall)
4. [💾 Routes](#Routes)

   - [Admin Routes](#AdminRoutes)
   - [Article Routes](#ArticleRoutes)
   - [Category Routes](#CategoryRoutes)
   - [Report Routes](#ReportRoutes)
   - [Topic Routes](#TopicRoutes)
   - [User Routes](#UserRoutes)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=false
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## 1. <a name='Description'></a>🗒️ Description

This is a REST API to be used as the back-end for the Researcher's Refuge application. It includes a connection to a PostgreSQL Database, and utilizes Sequelize and Express to deal with the route requests and responses. It also includes a very basic back-end authentication for Users trying to log into the website using the authentication middleware for routes that require it, also automatically hashes any password before entering the database.

## 2. <a name='Technologies'></a>⚙️ Technologies

- Node.js
- Express
- `bcryptjs` for Auth
- Sequelize
- PostgreSQL

## 3. <a name='HowToInstall'></a>📓 How To Install

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

## 4. <a name='Routes'></a>💾 Routes

- Main API Route - Welcome Message

```
GET: /api/
```

<a href='#'>To Top</a>

### 4.1. <a name='AdminRoutes'></a>Admin Routes

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

<a href='#'>To Top</a>

### 4.2. <a name='ArticleRoutes'></a>Article Routes

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

<a href='#'>To Top</a>

### 4.3. <a name='CategoryRoutes'></a>Category Routes

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

<a href='#'>To Top</a>

### 4.4. <a name='ReportRoutes'></a>Report Routes

Gets error message saying they cannot read reports from this unauthorized route

```
GET: /api/reports/
```

Posts a new report to the database

```
POST: /api/reports/
```

<a href='#'>To Top</a>

### 4.5. <a name='TopicRoutes'></a>Topic Routes

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

<a href='#'>To Top</a>

### 4.6. <a name='UserRoutes'></a>User Routes

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

<a href='#'>To Top</a>
