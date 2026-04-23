const mongoose = require('mongoose');
require('dotenv').config();

const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Show = require('./models/Show');

// 🎬 Movie Data (Realistic)
const movieData = [
  {
    title: 'Baahubali 2',
    cast: ['Prabhas', 'Rana Daggubati', 'Anushka Shetty'],
    description: 'Shivudu learns about his royal heritage and rises to avenge his father’s death and reclaim Mahishmati.'
  },
  {
    title: 'RRR',
    cast: ['Ram Charan', 'Jr. NTR', 'Alia Bhatt'],
    description: 'Two revolutionaries fight against British rule while forming a powerful friendship.'
  },
  {
    title: 'KGF Chapter 2',
    cast: ['Yash', 'Sanjay Dutt', 'Raveena Tandon'],
    description: 'Rocky faces powerful enemies while expanding his empire in the gold mines.'
  },
  {
    title: 'Pushpa',
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    description: 'A laborer rises in the red sandalwood smuggling world with sheer determination.'
  },
  {
    title: 'Kantara',
    cast: ['Rishab Shetty', 'Sapthami Gowda', 'Kishore'],
    description: 'A man battles tradition, nature, and authority in a mystical folklore setting.'
  },
  {
    title: 'Jailer',
    cast: ['Rajinikanth', 'Vinayakan', 'Mohanlal'],
    description: 'A retired jailer hunts criminals after his son gets entangled in a crime network.'
  },
  {
    title: 'Leo',
    cast: ['Vijay', 'Sanjay Dutt', 'Trisha'],
    description: 'A peaceful man’s past resurfaces when dangerous gangsters target him.'
  },
  {
    title: 'Jersey',
    cast: ['Nani', 'Shraddha Srinath', 'Satya'],
    description: 'A failed cricketer returns to the game in his late 30s to fulfill his son’s dream.'
  },
  {
    title: 'Vakeel Saab',
    cast: ['Pawan Kalyan', 'Nivetha Thomas', 'Anjali'],
    description: 'A lawyer fights for justice in a case involving three women.'
  },
  {
    title: 'Chandu Champion',
    cast: ['Kartik Aaryan', 'Vijay Raaz'],
    description: 'A man overcomes physical challenges to become a sports champion.'
  },
  {
    title: 'Maidaan',
    cast: ['Ajay Devgn', 'Priyamani'],
    description: 'Based on Indian football’s golden era, a coach builds a legendary team.'
  },
  {
    title: 'Amar Singh Chamkila',
    cast: ['Diljit Dosanjh', 'Parineeti Chopra'],
    description: 'The rise and controversy of Punjab’s iconic singer Amar Singh Chamkila.'
  }
];

// 🎭 Theatre Data
const theatreNames = [
  'PVR Superplex', 'INOX Megaplex', 'Cinepolis Grand', 'Big Cinemas Elite',
  'SRS Cinemas Prime', 'Miraj Cinemas Luxe', 'Movietime Multiplex',
  'Carnival Cinemas IMAX', 'Spice Cinemas 4DX', 'Wave Cinemas Gold'
];

const theatreLocations = [
  'Mumbai Central', 'Bandra West', 'Juhu Beach', 'Andheri East', 'Bhandup West',
  'Thane East', 'Navi Mumbai', 'Borivali West', 'Dadar East', 'Chembur'
];

// 🌐 Languages
const languages = ['Hindi', 'English', 'Telugu'];

// ⏰ Show Times (Tomorrow)
const times = [];
for (let h = 9; h <= 23; h += 1.1) {
  for (let m = 0; m < 60; m += 15) {
    const date = new Date();
    date.setHours(Math.floor(h), Math.floor(m), 0, 0);
    date.setDate(date.getDate() + 1);
    times.push(date);
    if (times.length >= 20) break;
  }
  if (times.length >= 20) break;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear old data
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Show.deleteMany({});
    console.log('Old data cleared');

    // 🎬 Create Movies
    const movies = [];
    for (let i = 0; i < movieData.length; i++) {
      const data = movieData[i];

      const movie = new Movie({
        title: data.title,
        description: data.description,
        duration: 150 + Math.floor(Math.random() * 30),
        genre: 'Action',
        movieLanguage: languages[Math.floor(Math.random() * languages.length)], // ✅ random
        poster: `https://picsum.photos/400/600?random=${i}`,
        rating: Number((7.5 + Math.random() * 2.5).toFixed(1)), // ✅ 1 decimal
        cast: data.cast
      });

      await movie.save();
      movies.push(movie);
      console.log(`Created movie ${i + 1}: ${movie.title}`);
    }

    // 🎭 Create Theatres (Fixed seats = 100)
    const theatres = [];
    for (let i = 0; i < theatreNames.length; i++) {
      const theatre = new Theatre({
        name: theatreNames[i],
        location: theatreLocations[i],
        totalSeats: 100 // ✅ fixed
      });

      await theatre.save();
      theatres.push(theatre);
      console.log(`Created theatre ${i + 1}: ${theatre.name}`);
    }

    // 🎟️ Create Shows
    let showCount = 0;
    for (const movie of movies) {
      for (let t = 0; t < times.length; t++) {
        const time = times[t];

        for (const theatre of theatres) {
          const show = new Show({
            movie: movie._id,
            theatre: theatre._id,
            showTime: time,
            price: 150 + Math.floor(Math.random() * 200),
            bookedSeats: []
          });

          await show.save();
          showCount++;

          if (showCount % 200 === 0) {
            console.log(`Seeded ${showCount} shows...`);
          }
        }
      }
      console.log(`Completed shows for ${movie.title}`);
    }

    console.log(`✅ Seeding complete!`);
    console.log(`Movies: ${movies.length}, Theatres: ${theatres.length}, Shows: ${showCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();