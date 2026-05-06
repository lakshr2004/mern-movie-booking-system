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
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089321/MV5BMDk5ODNjNzMtYzI5Yy00NmI3LWIwYzctMTFjZjcwN2I2Yzk2XkEyXkFqcGc._V1_FMjpg_UX1000__ch5aah.jpg",
  },
  {
    title: "Jawan",
    genre: "Action",
    language: "Hindi",
    duration: 170,
    rating: 8.1,
    description:
      "A fearless vigilante takes on corruption and injustice while uncovering shocking truths from his past.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089551/ems_ymbr5e.jpg",
  },
  {
    title: "Interstellar",
    genre: "Sci-Fi",
    language: "English",
    duration: 169,
    rating: 9.0,
    description:
      "A team of astronauts travel through a wormhole in search of a new home for humanity.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089565/p10543523_p_v8_as_ucxke9.jpg",
  },
  {
    title: "KGF Chapter 2",
    genre: "Action",
    language: "Kannada",
    duration: 196,
    rating: 8.7,
    description:
      "Rocky rises as the king of the KGF empire while battling powerful enemies and political threats.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089576/dbe30e1e25813a698e0da679a5968c380bd2d1b4e6966394d4c964c6b3301896_n4u35x.jpg",
  },
  {
    title: "Pushpa",
    genre: "Action",
    language: "Telugu",
    duration: 168,
    rating: 8.3,
    description:
      "A fearless laborer climbs the ranks of the red sandalwood smuggling syndicate.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089592/images_wacca3.jpg",
  },
  {
    title: "Avengers Endgame",
    genre: "Superhero",
    language: "English",
    duration: 195,
    rating: 9.2,
    description:
      "The Avengers assemble one final time to reverse Thanos' destruction and restore the universe.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089606/images_wp0yam.jpg",
  },
  {
    title: "3 Idiots",
    genre: "Comedy",
    language: "Hindi",
    duration: 181,
    rating: 9.1,
    description:
      "Three engineering students discover friendship, passion, and the true meaning of success.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089620/images_tyveat.jpg",
  },
  {
    title: "Vikram",
    genre: "Action",
    language: "Tamil",
    duration: 168,
    rating: 8.8,
    description:
      "A retired black-ops commander returns to stop a deadly criminal syndicate.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089629/00b65207aec0f97e1d57216fc41377ec9bbd922fde9368fce743a56120d62744_u6amnw.jpg",
  },
  {
    title: "RRR",
    genre: "Action",
    language: "Telugu",
    duration: 187,
    rating: 8.9,
    description:
      "Two revolutionaries form an epic friendship while fighting against British rule in India.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089640/images_z0vdj3.jpg",
  },
  {
    title: "Drishyam 2",
    genre: "Thriller",
    language: "Malayalam",
    duration: 156,
    rating: 8.6,
    description:
      "A clever family man struggles to protect his family as old secrets begin to resurface.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089651/images_vfjrc2.jpg",
  },
  {
    title: "The Dark Knight",
    genre: "Crime",
    language: "English",
    duration: 169,
    rating: 9.4,
    description:
      "Batman faces the Joker, a criminal mastermind who throws Gotham City into chaos.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089662/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw._V1_FMjpg_UX1000__ebh52o.jpg",
  },
  {
    title: "Kantara",
    genre: "Thriller",
    language: "Kannada",
    duration: 135,
    rating: 8.8,
    description:
      "A man becomes entangled in a mystical conflict involving tradition, nature, and power.",
    poster: "https://i0.wp.com/whatsonsidsmind.com/wp-content/uploads/2024/08/fff9e-kantara-poster-1.jpeg?resize=730%2C730&ssl=1",
  },
  {
    title: "Master",
    genre: "Action",
    language: "Tamil",
    duration: 158,
    rating: 8.0,
    description:
      "An alcoholic professor clashes with a ruthless gangster running crimes through a juvenile prison.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089691/Vijay-The-Master----Gallery-6e6877e0-4dcd-11f0-a68c-6d02d77cb994_u5llcv.jpg",
  },
  {
    title: "Dangal",
    genre: "Sports",
    language: "Hindi",
    duration: 154,
    rating: 8.9,
    description:
      "A former wrestler trains his daughters to become world-class wrestling champions.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089700/images_myy2bi.jpg",
  },
  {
    title: "Spider-Man No Way Home",
    genre: "Superhero",
    language: "English",
    duration: 182,
    rating: 8.7,
    description:
      "Spider-Man faces villains from alternate universes after a magical spell goes wrong.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089710/81y0foYjoFL._AC_UF1000_1000_QL80__xyhhoo.jpg",
  },
  {
    title: "Baahubali 2",
    genre: "Fantasy",
    language: "Telugu",
    duration: 181,
    rating: 8.8,
    description:
      "The truth behind Amarendra Baahubali’s death is revealed in this epic kingdom saga.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089722/711eHgGtnFL._AC_UF1000_1000_QL80__i2e4xa.jpg",
  },
  {
    title: "Jailer",
    genre: "Action",
    language: "Tamil",
    duration: 129,
    rating: 8.2,
    description:
      "A retired jailer goes on a brutal mission after his family is threatened by criminals.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089731/images_qoldnm.jpg",
  },
  {
    title: "Inception",
    genre: "Sci-Fi",
    language: "English",
    duration: 157,
    rating: 9.0,
    description:
      "A skilled thief enters dreams to steal secrets but is tasked with planting an idea instead.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089743/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw._V1__s7rf9e.jpg",
  },
  {
    title: "777 Charlie",
    genre: "Drama",
    language: "Kannada",
    duration: 210,
    rating: 8.9,
    description:
      "A lonely man’s life changes completely after bonding with a spirited dog named Charlie.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089752/images_nec3t6.jpg",
  },
  {
    title: "Premam",
    genre: "Romance",
    language: "Malayalam",
    duration: 141,
    rating: 8.5,
    description:
      "A heartfelt coming-of-age love story that follows different phases of a young man’s life.",
    poster: "https://res.cloudinary.com/dekbfgle9/image/upload/q_auto/f_auto/v1778089763/8af17eda51c974669fda316b5eb5dab8de1ff652e3b3ff0e651b6d4421a01b82_elnyie.jpg",
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