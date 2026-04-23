const mongoose = require('mongoose');
require('dotenv').config();

const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Show = require('./models/Show');

async function clearData() {
  await Movie.deleteMany({});
  await Theatre.deleteMany({});
  await Show.deleteMany({});
}

// Movie Data with Original Posters and Mixed Languages
const movieData = [
  { title: 'Avengers: Endgame', lang: 'English', poster: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg' },
  { title: 'Spider-Man: No Way Home', lang: 'English', poster: 'https://upload.wikimedia.org/wikipedia/en/0/01/Spider-Man_No_Way_Home_poster.jpg' },
  { title: 'Baahubali 2', lang: 'Telugu', poster: 'https://upload.wikimedia.org/wikipedia/en/9/93/Baahubali_2_The_Conclusion_poster.jpg' },
  { title: 'RRR', lang: 'Telugu', poster: 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg' },
  { title: 'KGF Chapter 2', lang: 'Telugu', poster: 'https://upload.wikimedia.org/wikipedia/en/d/d0/K.G.F_Chapter_2.jpg' },
  { title: 'Pushpa', lang: 'Telugu', poster: 'https://upload.wikimedia.org/wikipedia/en/7/75/Pushpa_The_Rise_Part_1.jpg' },
  { title: 'Kantara', lang: 'Telugu', poster: 'https://upload.wikimedia.org/wikipedia/en/8/84/Kantara_poster.jpeg' },
  { title: 'Jailer', lang: 'Telugu', poster: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Jailer_2023_poster.jpg' },
  { title: 'Leo', lang: 'Telugu', poster: 'https://upload.wikimedia.org/wikipedia/en/7/75/Leo_%282023_Indian_film%29_poster.jpg' },
  { title: 'Jersey', lang: 'Hindi', poster: 'https://upload.wikimedia.org/wikipedia/en/0/01/Jersey_2022_poster.jpg' },
  { title: 'Vakeel Saab', lang: 'Telugu', poster: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Vakeel_Saab_poster.jpg' },
  { title: 'Chandu Champion', lang: 'Hindi', poster: 'https://upload.wikimedia.org/wikipedia/en/3/30/Chandu_Champion_film_poster.jpeg' },
  { title: 'Maidaan', lang: 'Hindi', poster: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Maidaan_2024_film_poster.jpg' },
  { title: 'Amar Singh Chamkila', lang: 'Hindi', poster: 'https://upload.wikimedia.org/wikipedia/en/9/93/Amar_Singh_Chamkila_film_poster.jpg' },
  { title: 'Dunki', lang: 'Hindi', poster: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Dunki_film_poster.jpg' },
  { title: 'Animal', lang: 'Hindi', poster: 'https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg' },
  { title: 'Jawan', lang: 'Hindi', poster: 'https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg' },
  { title: 'Pathaan', lang: 'Hindi', poster: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Pathaan_film_poster.jpg' },
  { title: 'Gadar 2', lang: 'Hindi', poster: 'https://upload.wikimedia.org/wikipedia/en/6/62/Gadar_2_film_poster.jpg' },
  { title: 'OMG 2', lang: 'Hindi', poster: 'https://upload.wikimedia.org/wikipedia/en/6/64/OMG_2_poster.jpg' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🧹 Clearing old data...');
    await clearData();

    console.log('🎬 Creating 20 movies...');
    const movieDocs = movieData.map((m, i) => ({
      title: m.title,
      description: `Epic description for ${m.title}. A must watch cinematic experience.`,
      duration: 150,
      genre: 'Action',
      movieLanguage: m.lang,
      poster: m.poster,
      rating: 8.5,
      cast: ['Lead Actor', 'Lead Actress']
    }));
    const movies = await Movie.insertMany(movieDocs);

    console.log('🎭 Creating 10 theatres...');
    const theatreNames = ['PVR Plex', 'INOX', 'Cinepolis', 'Big Cinemas', 'Miraj'];
    const theatreDocs = [];
    for (let i = 0; i < 10; i++) {
      theatreDocs.push({
        name: `${theatreNames[i % 5]} ${Math.floor(i / 5) + 1}`,
        location: `City ${i + 1}`,
        totalSeats: 100
      });
    }
    const theatres = await Theatre.insertMany(theatreDocs);

    console.log('🎟️ Generating show data...');
    const showsToInsert = [];
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    baseDate.setDate(baseDate.getDate() + 1); // For tomorrow

    for (const movie of movies) {
      let slotsPerMovie = 0;
      for (let h = 9; h < 24 && slotsPerMovie < 20; h++) {
        for (let m = 0; m < 60 && slotsPerMovie < 20; m += 30) {
          const showTime = new Date(baseDate);
          showTime.setHours(h, m);

          for (const theatre of theatres) {
            showsToInsert.push({
              movie: movie._id,
              theatre: theatre._id,
              showTime,
              price: 200,
              bookedSeats: []
            });
          }
          slotsPerMovie++;
        }
      }
    }

    console.log(`📦 Inserting ${showsToInsert.length} shows...`);
    // Using insertMany for performance
    await Show.insertMany(showsToInsert);

    console.log(`✅ SEED COMPLETE!`);
    console.log(`Movies: ${movies.length} | Theatres: ${theatres.length} | Shows: ${showsToInsert.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();