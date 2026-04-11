const neo4j = require("neo4j-driver");

const URI = "neo4j+s://4e9db6ea.databases.neo4j.io";
const USER = "4e9db6ea";
const PASSWORD = "NergiZ62YSAc1YXP52oSdqPcbw6prdQRPkAaKxFfOkU";

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function createConstraints() {
  const session = driver.session();
  try {
    await session.run(`
      CREATE CONSTRAINT user_id_unique IF NOT EXISTS
      FOR (u:User)
      REQUIRE u.userid IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT movie_id_unique IF NOT EXISTS
      FOR (m:Movie)
      REQUIRE m.movieid IS UNIQUE
    `);
  } finally {
    await session.close();
  }
}

// Función para crear un usuario
async function createUser(userid, name) {
  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (u:User {userid: $userid})
      SET u.name = $name
      RETURN u
      `,
      { userid, name }
    );
    console.log(`Usuario creado: ${name}`);
  } finally {
    await session.close();
  }
}

// Función para crear una película
async function createMovie(movieid, title, year) {
  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (m:Movie {movieid: $movieid})
      SET m.title = $title,
          m.year = $year
      RETURN m
      `,
      { movieid, title, year }
    );
    console.log(`Película creada: ${title}`);
  } finally {
    await session.close();
  }
}

async function createRated(userid, movieid, rating, timestamp) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (u:User {userid: $userid})
      MATCH (m:Movie {movieid: $movieid})
      MERGE (u)-[r:RATED]->(m)
      SET r.rating = $rating,
          r.timestamp = $timestamp
      RETURN r
      `,
      { userid, movieid, rating, timestamp }
    );
    console.log(`Rating creado: User ${userid} -> Movie ${movieid}`);
  } finally {
    await session.close();
  }
}

// Función para crear la relación RATED
async function main() {
  try {
    await createConstraints();

    // Crear usuarios
    await createUser(1, "Ana");
    await createUser(2, "Luis");
    await createUser(3, "Carlos");
    await createUser(4, "María");
    await createUser(5, "Sofía");

    // Crear películas
    await createMovie(101, "Inception", 2010);
    await createMovie(102, "The Matrix", 1999);
    await createMovie(103, "Interstellar", 2014);
    await createMovie(104, "Titanic", 1997);
    await createMovie(105, "Avatar", 2009);

    const now = Date.now();


    // Ana
    await createRated(1, 101, 5, now);
    await createRated(1, 102, 4, now);

    // Luis
    await createRated(2, 101, 4, now);
    await createRated(2, 103, 5, now);

    // Carlos
    await createRated(3, 102, 5, now);
    await createRated(3, 104, 3, now);

    // María
    await createRated(4, 103, 4, now);
    await createRated(4, 105, 5, now);

    // Sofía
    await createRated(5, 104, 5, now);
    await createRated(5, 101, 4, now);

    console.log("Grafo poblado correctamente");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.close();
  }
}

main();