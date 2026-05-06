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
    description:
      "A mysterious café owner with a violent past gets hunted by dangerous gangsters who believe he is someone else.",
    poster: "https://picsum.photos/300/450?random=1",
  },
  {
    title: "Jawan",
    genre: "Action",
    language: "Hindi",
    duration: 170,
    rating: 8.1,
    description:
      "A fearless vigilante takes on corruption and injustice while uncovering shocking truths from his past.",
    poster: "https://picsum.photos/300/450?random=2",
  },
  {
    title: "Interstellar",
    genre: "Sci-Fi",
    language: "English",
    duration: 169,
    rating: 9.0,
    description:
      "A team of astronauts travel through a wormhole in search of a new home for humanity.",
    poster: "https://picsum.photos/300/450?random=3",
  },
  {
    title: "KGF Chapter 2",
    genre: "Action",
    language: "Kannada",
    duration: 196,
    rating: 8.7,
    description:
      "Rocky rises as the king of the KGF empire while battling powerful enemies and political threats.",
    poster: "https://picsum.photos/300/450?random=4",
  },
  {
    title: "Pushpa",
    genre: "Action",
    language: "Telugu",
    duration: 168,
    rating: 8.3,
    description:
      "A fearless laborer climbs the ranks of the red sandalwood smuggling syndicate.",
    poster: "https://picsum.photos/300/450?random=5",
  },
  {
    title: "Avengers Endgame",
    genre: "Superhero",
    language: "English",
    duration: 195,
    rating: 9.2,
    description:
      "The Avengers assemble one final time to reverse Thanos' destruction and restore the universe.",
    poster: "https://picsum.photos/300/450?random=6",
  },
  {
    title: "3 Idiots",
    genre: "Comedy",
    language: "Hindi",
    duration: 181,
    rating: 9.1,
    description:
      "Three engineering students discover friendship, passion, and the true meaning of success.",
    poster: "https://picsum.photos/300/450?random=7",
  },
  {
    title: "Vikram",
    genre: "Action",
    language: "Tamil",
    duration: 168,
    rating: 8.8,
    description:
      "A retired black-ops commander returns to stop a deadly criminal syndicate.",
    poster: "https://picsum.photos/300/450?random=8",
  },
  {
    title: "RRR",
    genre: "Action",
    language: "Telugu",
    duration: 187,
    rating: 8.9,
    description:
      "Two revolutionaries form an epic friendship while fighting against British rule in India.",
    poster: "https://picsum.photos/300/450?random=9",
  },
  {
    title: "Drishyam 2",
    genre: "Thriller",
    language: "Malayalam",
    duration: 156,
    rating: 8.6,
    description:
      "A clever family man struggles to protect his family as old secrets begin to resurface.",
    poster: "https://picsum.photos/300/450?random=10",
  },
  {
    title: "The Dark Knight",
    genre: "Crime",
    language: "English",
    duration: 169,
    rating: 9.4,
    description:
      "Batman faces the Joker, a criminal mastermind who throws Gotham City into chaos.",
    poster: "https://picsum.photos/300/450?random=11",
  },
  {
    title: "Kantara",
    genre: "Thriller",
    language: "Kannada",
    duration: 135,
    rating: 8.8,
    description:
      "A man becomes entangled in a mystical conflict involving tradition, nature, and power.",
    poster: "https://picsum.photos/300/450?random=12",
  },
  {
    title: "Master",
    genre: "Action",
    language: "Tamil",
    duration: 158,
    rating: 8.0,
    description:
      "An alcoholic professor clashes with a ruthless gangster running crimes through a juvenile prison.",
    poster: "https://picsum.photos/300/450?random=13",
  },
  {
    title: "Dangal",
    genre: "Sports",
    language: "Hindi",
    duration: 154,
    rating: 8.9,
    description:
      "A former wrestler trains his daughters to become world-class wrestling champions.",
    poster: "https://picsum.photos/300/450?random=14",
  },
  {
    title: "Spider-Man No Way Home",
    genre: "Superhero",
    language: "English",
    duration: 182,
    rating: 8.7,
    description:
      "Spider-Man faces villains from alternate universes after a magical spell goes wrong.",
    poster: "https://picsum.photos/300/450?random=15",
  },
  {
    title: "Baahubali 2",
    genre: "Fantasy",
    language: "Telugu",
    duration: 181,
    rating: 8.8,
    description:
      "The truth behind Amarendra Baahubali’s death is revealed in this epic kingdom saga.",
    poster: "https://picsum.photos/300/450?random=16",
  },
  {
    title: "Jailer",
    genre: "Action",
    language: "Tamil",
    duration: 129,
    rating: 8.2,
    description:
      "A retired jailer goes on a brutal mission after his family is threatened by criminals.",
    poster: "https://picsum.photos/300/450?random=17",
  },
  {
    title: "Inception",
    genre: "Sci-Fi",
    language: "English",
    duration: 157,
    rating: 9.0,
    description:
      "A skilled thief enters dreams to steal secrets but is tasked with planting an idea instead.",
    poster: "https://picsum.photos/300/450?random=18",
  },
  {
    title: "777 Charlie",
    genre: "Drama",
    language: "Kannada",
    duration: 210,
    rating: 8.9,
    description:
      "A lonely man’s life changes completely after bonding with a spirited dog named Charlie.",
    poster: "https://picsum.photos/300/450?random=19",
  },
  {
    title: "Premam",
    genre: "Romance",
    language: "Malayalam",
    duration: 141,
    rating: 8.5,
    description:
      "A heartfelt coming-of-age love story that follows different phases of a young man’s life.",
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

                for (let i = 0; i < showTimes.length; i++) {

                    const hourMap = {
                        0: 10,
                        1: 13,
                        2: 16,
                        3: 19,
                        4: 22,
                    };

                    const showDate = new Date();

                    showDate.setHours(hourMap[i]);
                    showDate.setMinutes(0);
                    showDate.setSeconds(0);

                    shows.push({
                        movie: movie._id,

                        theatre: theatre._id,

                        // ✅ REAL DATE OBJECT
                        showTime: showDate,

                        price: Math.floor(Math.random() * 200) + 150,

                        bookedSeats: [],

                        totalSeats: 100,
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