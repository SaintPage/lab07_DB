const neo4j = require("neo4j-driver");

const URI = "neo4j+s://4e9db6ea.databases.neo4j.io";
const USER = "4e9db6ea";
const PASSWORD = "NergiZ62YSAc1YXP52oSdqPcbw6prdQRPkAaKxFfOkU";

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function createPerson(
  tmdbId,
  name,
  born,
  died,
  bornIn,
  url,
  imdbId,
  bio,
  poster
) {
  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (p:Person {tmdbId: $tmdbId})
      SET p.name = $name,
          p.born = datetime($born),
          p.died = datetime($died),
          p.bornIn = $bornIn,
          p.url = $url,
          p.imdbId = $imdbId,
          p.bio = $bio,
          p.poster = $poster
      RETURN p
      `,
      {
        tmdbId,
        name,
        born,
        died,
        bornIn,
        url,
        imdbId,
        bio,
        poster,
      }
    );
    console.log(`Person creada: ${name}`);
  } finally {
    await session.close();
  }
}

async function createMovie(
  movieId,
  title,
  tmdbId,
  released,
  imdbRating,
  year,
  imdbId,
  runtime,
  countries,
  imdbVotes,
  url,
  revenue,
  plot,
  poster,
  budget,
  languages
) {
  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (m:Movie {movieId: $movieId})
      SET m.title = $title,
          m.tmdbId = $tmdbId,
          m.released = datetime($released),
          m.imdbRating = $imdbRating,
          m.year = $year,
          m.imdbId = $imdbId,
          m.runtime = $runtime,
          m.countries = $countries,
          m.imdbVotes = $imdbVotes,
          m.url = $url,
          m.revenue = $revenue,
          m.plot = $plot,
          m.poster = $poster,
          m.budget = $budget,
          m.languages = $languages
      RETURN m
      `,
      {
        movieId,
        title,
        tmdbId,
        released,
        imdbRating,
        year,
        imdbId,
        runtime,
        countries,
        imdbVotes,
        url,
        revenue,
        plot,
        poster,
        budget,
        languages,
      }
    );
    console.log(`Movie creada: ${title}`);
  } finally {
    await session.close();
  }
}

async function createGenre(name) {
  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (g:Genre {name: $name})
      RETURN g
      `,
      { name }
    );
    console.log(`Genre creado: ${name}`);
  } finally {
    await session.close();
  }
}

async function createUser(userId, name) {
  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (u:User {userId: $userId})
      SET u.name = $name
      RETURN u
      `,
      { userId, name }
    );
    console.log(`User creado: ${name}`);
  } finally {
    await session.close();
  }
}

async function actedIn(personId, movieId, role) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (p:Person {tmdbId: $personId})
      MATCH (m:Movie {movieId: $movieId})
      MERGE (p)-[r:ACTED_IN]->(m)
      SET r.role = $role
      `,
      { personId, movieId, role }
    );
  } finally {
    await session.close();
  }
}

async function directed(personId, movieId, role) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (p:Person {tmdbId: $personId})
      MATCH (m:Movie {movieId: $movieId})
      MERGE (p)-[r:DIRECTED]->(m)
      SET r.role = $role
      `,
      { personId, movieId, role }
    );
  } finally {
    await session.close();
  }
}

async function inGenre(movieId, genreName) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (m:Movie {movieId: $movieId})
      MATCH (g:Genre {name: $genreName})
      MERGE (m)-[:IN_GENRE]->(g)
      `,
      { movieId, genreName }
    );
  } finally {
    await session.close();
  }
}

async function rated(userId, movieId, rating) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (u:User {userId: $userId})
      MATCH (m:Movie {movieId: $movieId})
      MERGE (u)-[r:RATED]->(m)
      SET r.rating = $rating,
          r.timestamp = timestamp()
      `,
      { userId, movieId, rating }
    );
  } finally {
    await session.close();
  }
}

async function getUser(userId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})
      RETURN u
      `,
      { userId }
    );

    console.log("\nUsuario encontrado:");
    result.records.forEach(record => {
      console.log(record.get("u").properties);
    });
  } finally {
    await session.close();
  }
}

async function getMovie(movieId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Movie {movieId: $movieId})
      RETURN m
      `,
      { movieId }
    );

    console.log("\nPelícula encontrada:");
    result.records.forEach(record => {
      console.log(record.get("m").properties);
    });
  } finally {
    await session.close();
  }
}

async function getUserRatings(userId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})-[r:RATED]->(m:Movie)
      RETURN u, r, m
      `,
      { userId }
    );

    console.log("\nRatings del usuario:");
    result.records.forEach(record => {
      const user = record.get("u").properties;
      const movie = record.get("m").properties;
      const rating = record.get("r").properties;

      console.log({ user, movie, rating });
    });
  } finally {
    await session.close();
  }
}

async function main() {
  try {
    await createPerson(
      1,
      "Leonardo DiCaprio",
      "1974-11-11T00:00:00",
      null,
      "USA",
      "https://example.com/leo",
      1001,
      "Actor famoso",
      "https://example.com/poster1.jpg"
    );

    await createPerson(
      2,
      "Christopher Nolan",
      "1970-07-30T00:00:00",
      null,
      "UK",
      "https://example.com/nolan",
      1002,
      "Director reconocido",
      "https://example.com/poster2.jpg"
    );

    await createPerson(
      3,
      "Joseph Gordon-Levitt",
      "1981-02-17T00:00:00",
      null,
      "USA",
      "https://example.com/joseph",
      1003,
      "Actor secundario",
      "https://example.com/poster3.jpg"
    );

    await createMovie(
      500,
      "Dream Heist",
      9001,
      "2025-01-01T00:00:00",
      8.7,
      2025,
      2001,
      130,
      ["USA"],
      100000,
      "https://example.com/movie",
      500000000,
      "Un robo dentro de sueños",
      "https://example.com/postermovie.jpg",
      150000000,
      ["English"]
    );

    await createGenre("Sci-Fi");
    await createGenre("Action");

    await createUser(900, "Estuardo");

    await actedIn(1, 500, "Cobb");
    await actedIn(3, 500, "Arthur");

    await directed(2, 500, "Director");

    await inGenre(500, "Sci-Fi");
    await inGenre(500, "Action");

    await rated(900, 500, 5);

    console.log("Grafo creado correctamente");

    await getUser(900);
    await getMovie(500);
    await getUserRatings(900);

  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

main();