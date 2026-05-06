const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("./models/Movie");
const Theatre = require("./models/Theatre");
const Show = require("./models/Show");

// ================= CONNECT DB =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ================= MOVIES =================
const movies = [
  {
    title: "Leo",
    genre: "Action",
    language: "Tamil",
    duration: 164,
    rating: 8.4,
    poster: "https://picsum.photos/300/450?random=1",
  },
  {
    title: "Jawan",
    genre: "Action",
    language: "Hindi",
    duration: 170,
    rating: 8.1,
    poster: "https://picsum.photos/300/450?random=2",
  },
  {
    title: "Interstellar",
    genre: "Sci-Fi",
    language: "English",
    duration: 169,
    rating: 9.0,
    poster: "https://picsum.photos/300/450?random=3",
  },
  {
    title: "KGF Chapter 2",
    genre: "Action",
    language: "Kannada",
    duration: 196,
    rating: 8.7,
    poster: "https://picsum.photos/300/450?random=4",
  },
  {
    title: "Pushpa",
    genre: "Action",
    language: "Telugu",
    duration: 168,
    rating: 8.3,
    poster: "https://picsum.photos/300/450?random=5",
  },
  {
    title: "Avengers Endgame",
    genre: "Superhero",
    language: "English",
    duration: 195,
    rating: 9.2,
    poster: "https://picsum.photos/300/450?random=6",
  },
  {
    title: "3 Idiots",
    genre: "Comedy",
    language: "Hindi",
    duration: 181,
    rating: 9.1,
    poster: "https://picsum.photos/300/450?random=7",
  },
  {
    title: "Vikram",
    genre: "Action",
    language: "Tamil",
    duration: 168,
    rating: 8.8,
    poster: "https://picsum.photos/300/450?random=8",
  },
  {
    title: "RRR",
    genre: "Action",
    language: "Telugu",
    duration: 187,
    rating: 8.9,
    poster: "https://picsum.photos/300/450?random=9",
  },
  {
    title: "Drishyam 2",
    genre: "Thriller",
    language: "Malayalam",
    duration: 156,
    rating: 8.6,
    poster: "https://picsum.photos/300/450?random=10",
  },
  {
    title: "The Dark Knight",
    genre: "Crime",
    language: "English",
    duration: 169,
    rating: 9.4,
    poster: "https://picsum.photos/300/450?random=11",
  },
  {
    title: "Kantara",
    genre: "Thriller",
    language: "Kannada",
    duration: 135,
    rating: 8.8,
    poster: "https://picsum.photos/300/450?random=12",
  },
  {
    title: "Master",
    genre: "Action",
    language: "Tamil",
    duration: 158,
    rating: 8.0,
    poster: "https://picsum.photos/300/450?random=13",
  },
  {
    title: "Dangal",
    genre: "Sports",
    language: "Hindi",
    duration: 154,
    rating: 8.9,
    poster: "https://picsum.photos/300/450?random=14",
  },
  {
    title: "Spider-Man No Way Home",
    genre: "Superhero",
    language: "English",
    duration: 182,
    rating: 8.7,
    poster: "https://picsum.photos/300/450?random=15",
  },
  {
    title: "Baahubali 2",
    genre: "Fantasy",
    language: "Telugu",
    duration: 181,
    rating: 8.8,
    poster: "https://picsum.photos/300/450?random=16",
  },
  {
    title: "Jailer",
    genre: "Action",
    language: "Tamil",
    duration: 129,
    rating: 8.2,
    poster: "https://picsum.photos/300/450?random=17",
  },
  {
    title: "Inception",
    genre: "Sci-Fi",
    language: "English",
    duration: 157,
    rating: 9.0,
    poster: "https://picsum.photos/300/450?random=18",
  },
  {
    title: "777 Charlie",
    genre: "Drama",
    language: "Kannada",
    duration: 210,
    rating: 8.9,
    poster: "https://picsum.photos/300/450?random=19",
  },
  {
    title: "Premam",
    genre: "Romance",
    language: "Malayalam",
    duration: 141,
    rating: 8.5,
    poster: "https://picsum.photos/300/450?random=20",
  },
];

// ================= 20 THEATRES =================
const theatres = [
  { name: "PVR Phoenix Mall", location: "Mumbai" },
  { name: "INOX Megaplex", location: "Delhi" },
  { name: "Cinepolis Nexus", location: "Bangalore" },
  { name: "Miraj Cinemas", location: "Hyderabad" },
  { name: "Carnival Cinemas", location: "Chennai" },
  { name: "PVR Orion Mall", location: "Bangalore" },
  { name: "INOX Marina Mall", location: "Chennai" },
  { name: "Cinepolis Lulu Mall", location: "Kochi" },
  { name: "PVR Elante", location: "Chandigarh" },
  { name: "Asian Cinemas", location: "Hyderabad" },
  { name: "MovieTime Cinemas", location: "Pune" },
  { name: "Rajhans Cinemas", location: "Surat" },
  { name: "Mukta A2 Cinemas", location: "Ahmedabad" },
  { name: "Wave Cinemas", location: "Noida" },
  { name: "Sathyam Cinemas", location: "Chennai" },
  { name: "SPI Palazzo", location: "Bangalore" },
  { name: "PVR Vegas", location: "Delhi" },
  { name: "INOX South City", location: "Kolkata" },
  { name: "CineHub Multiplex", location: "Jaipur" },
  { name: "Galaxy Cinemas", location: "Lucknow" },
];

// ================= SHOW TIMES =================
const showTimes = [
  "10:00 AM",
  "1:00 PM",
  "4:00 PM",
  "7:00 PM",
  "10:00 PM",
];

// ================= SEED FUNCTION =================
const seedDatabase = async () => {
  try {
    console.log("Deleting old data...");

    await Movie.deleteMany();
    await Theatre.deleteMany();
    await Show.deleteMany();

    console.log("Creating movies...");
    const createdMovies = await Movie.insertMany(movies);

    console.log("Creating theatres...");
    const createdTheatres = await Theatre.insertMany(theatres);

    console.log("Creating shows...");

    const shows = [];

    for (const movie of createdMovies) {
      for (const theatre of createdTheatres) {
        for (const time of showTimes) {
          shows.push({
            movie: movie._id,
            theatre: theatre._id,
            showTime: new Date(),
            time,
            price: Math.floor(Math.random() * 200) + 150,
            bookedSeats: [],
            lockedSeats: [],
          });
        }
      }
    }

    await Show.insertMany(shows);

    console.log("====================================");
    console.log("20 Movies Created");
    console.log("20 Theatres Created");
    console.log("2000 Shows Created");
    console.log("Database Seeded Successfully 🚀");
    console.log("====================================");

    process.exit();
    

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedDatabase();