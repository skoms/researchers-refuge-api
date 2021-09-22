'use strict';

const bcryptjs = require('bcryptjs');
const Context = require('./context');

class Database {
  constructor(seedData, enableLogging) {
    this.articles = seedData.articles;
    this.users = seedData.users;
    this.topics = seedData.topics;
    this.categories = seedData.categories;
    this.enableLogging = enableLogging;
    this.context = new Context('ResearchersRefuge', enableLogging);
  }

  // Log message if logging is enabled
  log(message) {
    if (this.enableLogging) {
      console.info(message);
    }
  }

  // Inserts users into database
  createUser(user) {
    return this.context
      .execute(`
        INSERT INTO "Users"
          ("firstName", "lastName", "emailAddress", "password", "occupation", "bio", "mostActiveField", "articles", "credits", "followers", "following", "profileImgURL", "headerImgURL", "accessLevel", "accreditedArticles", "discreditedArticles", "createdAt", "updatedAt")
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW());
      `,
        [
          user.firstName,
          user.lastName,
          user.emailAddress,
          user.password,
          user.occupation,
          user.bio,
          user.mostActiveField,
          user.articles,
          user.credits,
          user.followers,
          user.following,
          user.profileImgURL,
          user.headerImgURL,
          user.accessLevel,
          user.accreditedArticles,
          user.discreditedArticles
        ]
      );
  }

  // Inserts article into database
  createArticle(article) {
    return this.context
      .execute(`
        INSERT INTO "Articles"
          ("userId", "topicId", "title", "topic", "intro", "body", "tags", "published", "credits", "createdAt", "updatedAt")
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW());
      `, 
        [ 
          article.userId, 
          article.topicId, 
          article.title, 
          article.topic,
          article.intro, 
          article.body, 
          article.tags, 
          article.published,
          article.credits 
        ]
      );
  }

  // Inserts topic into database
  createTopic(topic) {
    return this.context
      .execute(`
        INSERT INTO "Topics"
          ("categoryId", "name", "relatedTags", "createdAt", "updatedAt")
        VALUES
          ($1, $2, $3, NOW(), NOW());
      `, [ topic.categoryId, topic.name, topic.relatedTags ]
      );
  }

  // Inserts categories into database
  createCategory(category) {
    return this.context
      .execute(`
        INSERT INTO "Categories"
          ("name", "createdAt", "updatedAt")
        VALUES
          ($1, NOW(), NOW());
      `, [category.name]
      );
  }

  // Hashes the passwords in the for the database
  async hashUserPasswords(users) {
    const usersWithHashedPasswords = [];

    for (const user of users) {
      const hashedPassword = await bcryptjs.hash(user.password, 10);
      usersWithHashedPasswords.push({ ...user, password: hashedPassword });
    }

    return usersWithHashedPasswords;
  }

  // Inserts all the users given as argument to the database
  async createUsers(users) {
    for (const user of users) {
      await this.createUser(user);
    }
  }

  // Inserts all the articles given as argument to the database
  async createArticles(articles) {
    for (const article of articles) {
      await this.createArticle(article);
    }
  }

  // Inserts all the topics given as argument to the database
  async createTopics(topics) {
    for (const topic of topics) {
      await this.createTopic(topic);
    }
  }

  // Inserts all the categories given as argument to the database
  async createCategories(categories) {
    for (const category of categories) {
      await this.createCategory(category);
    }
  }

  // Initializes all the databases if not already there, if they are, data gets dropped and filled with new seed data
  async init() {
    this.log('Dropping the Users table if exists...');
    await this.context.execute(`
      DROP TABLE IF EXISTS "Users" cascade;
    `);

    this.log('Creating the Users table...');

    await this.context.execute(`
      CREATE TABLE "Users" (
        "id" BIGSERIAL PRIMARY KEY, 
        "firstName" VARCHAR(50) NOT NULL DEFAULT '', 
        "lastName" VARCHAR(50) NOT NULL DEFAULT '', 
        "emailAddress" VARCHAR(120) NOT NULL DEFAULT '' UNIQUE, 
        "password" VARCHAR(120) NOT NULL DEFAULT '', 
        "occupation" VARCHAR(50) DEFAULT '', 
        "bio" VARCHAR(255) DEFAULT '', 
        "mostActiveField" VARCHAR(50) DEFAULT '', 
        "articles" INTEGER DEFAULT 0, 
        "credits" INTEGER DEFAULT 0, 
        "followers" INTEGER[], 
        "following" INTEGER[],
        "profileImgURL" VARCHAR(255) DEFAULT 'https://img.icons8.com/ios-glyphs/120/000000/test-account.png', 
        "headerImgURL" VARCHAR(255) DEFAULT 'https://placeimg.com/1000/150/tech', 
        "accessLevel" VARCHAR(255) DEFAULT 'none',
        "accreditedArticles" INTEGER[],
        "discreditedArticles" INTEGER[],
        "createdAt" timestamp NOT NULL, 
        "updatedAt" timestamp NOT NULL
      );
    `);

    this.log('Hashing the user passwords...');

    const users = await this.hashUserPasswords(this.users);

    this.log('Creating the user records...');

    await this.createUsers(users);

    
    this.log('Dropping the Categories table...');
    await this.context.execute(`
      DROP TABLE IF EXISTS "Categories" cascade;
    `);

    this.log('Creating the Categories table...');

    await this.context.execute(`
      CREATE TABLE "Categories" (
        "id" BIGSERIAL PRIMARY KEY, 
        "name" VARCHAR(255) NOT NULL DEFAULT '', 
        "createdAt" timestamp NOT NULL, 
        "updatedAt" timestamp NOT NULL
      );
    `);

    this.log('Creating the category records...');

    await this.createCategories(this.categories);

    
    this.log('Dropping the Topics table...');
    await this.context.execute(`
      DROP TABLE IF EXISTS "Topics" cascade;
    `);  

    this.log('Creating the Topics table...');

    await this.context.execute(`
      CREATE TABLE "Topics" (
        "id" BIGSERIAL PRIMARY KEY, 
        "name" VARCHAR(255) NOT NULL DEFAULT '', 
        "relatedTags" VARCHAR(255)[] NOT NULL, 
        "createdAt" timestamp NOT NULL, 
        "updatedAt" timestamp NOT NULL,
        "categoryId" INTEGER NOT NULL DEFAULT -1
          REFERENCES "Categories" (id) ON DELETE CASCADE ON UPDATE CASCADE
      );    
    `);  

    this.log('Creating the topic records...');

    await this.createTopics(this.topics); 
        

    this.log('Dropping the Articles table...');
    await this.context.execute(`
      DROP TABLE IF EXISTS "Articles";
    `);

    this.log('Creating the Articles table...');

    await this.context.execute(`
      CREATE TABLE "Articles" (
        "id" BIGSERIAL PRIMARY KEY, 
        "title" VARCHAR(255) NOT NULL DEFAULT '', 
        "topic" VARCHAR(255) NOT NULL DEFAULT '', 
        "intro" TEXT NOT NULL DEFAULT '', 
        "body" TEXT NOT NULL DEFAULT '', 
        "tags" VARCHAR(255)[] NOT NULL, 
        "published" DATE NOT NULL,
        "credits" INTEGER DEFAULT 0,
        "createdAt" timestamp NOT NULL, 
        "updatedAt" timestamp NOT NULL, 
        "userId" INTEGER NOT NULL DEFAULT -1
          REFERENCES "Users" (id) ON DELETE CASCADE ON UPDATE CASCADE,
        "topicId" INTEGER NOT NULL DEFAULT -1 
          REFERENCES "Topics" (id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    this.log('Creating the article records...');

    await this.createArticles(this.articles); 

    this.log('Database successfully initialized!');
  }
}

module.exports = Database;
