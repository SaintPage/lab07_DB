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

// Crear usuario
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

// Crear película
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

// Buscar usuario
async function getUser(userid) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userid: $userid})
      RETURN u
      `,
      { userid }
    );

    console.log("\nUsuario encontrado:");
    result.records.forEach(record => {
      console.log(record.get("u").properties);
    });
  } finally {
    await session.close();
  }
}

// Buscar película
async function getMovie(movieid) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Movie {movieid: $movieid})
      RETURN m
      `,
      { movieid }
    );

    console.log("\nPelícula encontrada:");
    result.records.forEach(record => {
      console.log(record.get("m").properties);
    });
  } finally {
    await session.close();
  }
}

// Buscar usuario con sus ratings
async function getUserRatings(userid) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userid: $userid})-[r:RATED]->(m:Movie)
      RETURN u, r, m
      `,
      { userid }
    );

    console.log("\nRatings del usuario:");

    result.records.forEach(record => {
      const user = record.get("u").properties;
      const movie = record.get("m").properties;
      const rating = record.get("r").properties;

      console.log({
        user,
        movie,
        rating
      });
    });
  } finally {
    await session.close();
  }
}

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

    // Relaciones
    await createRated(1, 101, 5, now);
    await createRated(1, 102, 4, now);

    await createRated(2, 101, 4, now);
    await createRated(2, 103, 5, now);

    await createRated(3, 102, 5, now);
    await createRated(3, 104, 3, now);

    await createRated(4, 103, 4, now);
    await createRated(4, 105, 5, now);

    await createRated(5, 104, 5, now);
    await createRated(5, 101, 4, now);

    console.log("\nGrafo poblado correctamente");

    // Pruebas rápidas de la búsqueda
    console.log("\n--- PRUEBAS DE BÚSQUEDA ---");

    await getUser(1);
    await getMovie(101);
    await getUserRatings(1);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.close();
  }
}

main();