import mongoose from "mongoose";
import dotenv from "dotenv";

import Movie from "./models/Movie.js";
import Theatre from "./models/Theatre.js";

dotenv.config();

const movies = [
  {
    title: "Avengers Endgame",
    description: "Superheroes unite to save the universe.",
    duration: 181,
    genre: "Action",
    movieLanguage: "English",
    rating: 9.2,
    poster:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2TNwXA3uB2MhrSb6dBhJS0kdprQIPH1csIQ&s",
  },
  {
    title: "Interstellar",
    description: "Journey through space and time.",
    duration: 169,
    genre: "Sci-Fi",
    movieLanguage: "English",
    rating: 9.0,
    poster:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzUNnduPnOx0vSXEwoxfDqgqsKOBIMtJ21aw&s",
  },
  {
    title: "KGF Chapter 2",
    description: "Rocky rules the gold empire.",
    duration: 168,
    genre: "Action",
    movieLanguage: "Hindi",
    rating: 8.7,
    poster:
      "https://m.media-amazon.com/images/S/pv-target-images/dbe30e1e25813a698e0da679a5968c380bd2d1b4e6966394d4c964c6b3301896.jpg",
  },
  {
    title: "Jawan",
    description: "A high-octane action thriller.",
    duration: 165,
    genre: "Action",
    movieLanguage: "Hindi",
    rating: 8.3,
    poster:
      "https://akm-img-a-in.tosshub.com/indiatoday/images/media_bank/202309/shah-rukh-khan--jawan--srk-films-295651-3x4.jpg?VersionId=RGX_q3pk2AWWdkkOYhypoZSFxDHwV.vF",
  },
  {
    title: "Inception",
    description: "Dreams inside dreams.",
    duration: 148,
    genre: "Sci-Fi",
    movieLanguage: "English",
    rating: 9.1,
    poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
  },
  {
    title: "3 Idiots",
    description: "Engineering college comedy drama.",
    duration: 171,
    genre: "Comedy",
    movieLanguage: "Hindi",
    rating: 8.9,
    poster:
      "https://m.media-amazon.com/images/M/MV5BNzc4ZWQ3NmYtODE0Ny00YTQ4LTlkZWItNTBkMGQ0MmUwMmJlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
  },
  {
    title: "Pushpa",
    description: "Rise of a red sandalwood smuggler.",
    duration: 179,
    genre: "Action",
    movieLanguage: "Telugu",
    rating: 8.5,
    poster:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6rhuYd0Lt3pH-GXNGrXnpcJ6nulhYkRTAbw&s",
  },
  {
    title: "The Batman",
    description: "Dark detective thriller.",
    duration: 176,
    genre: "Crime",
    movieLanguage: "English",
    rating: 8.6,
    poster:
      "https://m.media-amazon.com/images/M/MV5BMmU5NGJlMzAtMGNmOC00YjJjLTgyMzUtNjAyYmE4Njg5YWMyXkEyXkFqcGc@._V1_.jpg",
  },
  {
    title: "RRR",
    description: "Epic historical action drama.",
    duration: 187,
    genre: "Action",
    movieLanguage: "Telugu",
    rating: 8.8,
    poster:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6j7Ljof_xzTZFEWtvZ9XHIYlGp8VrNRIRTQ&s",
  },
  {
    title: "Dune",
    description: "Battle for the desert planet.",
    duration: 155,
    genre: "Sci-Fi",
    movieLanguage: "English",
    rating: 8.4,
    poster:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl3Q8Is5bTtUqHOlYr8tNQtYNGB_LXxLbXMA&s",
  },
];

// DUPLICATE TO MAKE 20
const extendedMovies = [
  ...movies,
  ...movies.map((m, i) => ({
    ...m,
    title: `${m.title} ${i + 2}`,
  })),
];

const theatres = [
  {
    name: "PVR Cinemas",
    location: "Mumbai",
    totalSeats: 100,
  },
  {
    name: "INOX",
    location: "Delhi",
    totalSeats: 100,
  },
  {
    name: "Cinepolis",
    location: "Bangalore",
    totalSeats: 100,
  },
  {
    name: "Miraj Cinemas",
    location: "Kolkata",
    totalSeats: 100,
  },
  {
    name: "MovieTime",
    location: "Chennai",
    totalSeats: 100,
  },
  {
    name: "Rajhans Cinema",
    location: "Surat",
    totalSeats: 100,
  },
  {
    name: "Wave Cinemas",
    location: "Lucknow",
    totalSeats: 100,
  },
  {
    name: "Asian Cinemas",
    location: "Hyderabad",
    totalSeats: 100,
  },
  {
    name: "Carnival Cinemas",
    location: "Pune",
    totalSeats: 100,
  },
  {
    name: "Fun Cinemas",
    location: "Jaipur",
    totalSeats: 100,
  },
];

// DUPLICATE TO MAKE 20
const extendedTheatres = [
  ...theatres,
  ...theatres.map((t, i) => ({
    ...t,
    name: `${t.name} ${i + 2}`,
  })),
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    await Movie.deleteMany();
    await Theatre.deleteMany();

    console.log("Old Data Removed");

    await Movie.insertMany(extendedMovies);
    await Theatre.insertMany(extendedTheatres);

    console.log("20 Movies Added");
    console.log("20 Theatres Added");

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedDatabase();