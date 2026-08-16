const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("./models/Movie");
const Theatre = require("./models/Theatre");
const Show = require("./models/Show");
const { generateShowtimeGrid, validateNoOverlap } = require("./utils/showtimeGenerator");

// 20 realistic shared theatre locations across cities
const THEATRE_POOL = [
  { name: "PVR Icon Kolkata", location: "South City Mall, Kolkata", screenType: "IMAX 4K", priceRange: "₹250 - ₹500", price: 320 },
  { name: "INOX City Centre", location: "Salt Lake, Kolkata", screenType: "INSIGNIA 3D", priceRange: "₹220 - ₹450", price: 280 },
  { name: "Cinepolis Fun Republic", location: "Andheri West, Mumbai", screenType: "REALD 3D", priceRange: "₹260 - ₹520", price: 350 },
  { name: "Miraj Cinemas Apex", location: "Janakpuri, Delhi", screenType: "DOLBY ATMOS", priceRange: "₹200 - ₹400", price: 240 },
  { name: "PVR Select CITYWALK", location: "Saket, New Delhi", screenType: "LUXE 4K", priceRange: "₹300 - ₹600", price: 420 },
  { name: "INOX Forum Mall", location: "Koramangala, Bengaluru", screenType: "MX4D", priceRange: "₹250 - ₹480", price: 310 },
  { name: "Cinepolis Acropolis Mall", location: "EM Bypass, Kolkata", screenType: "VIP 3D", priceRange: "₹240 - ₹460", price: 290 },
  { name: "MovieMax Hypercity", location: "Thane West, Mumbai", screenType: "DOLBY 7.1", priceRange: "₹180 - ₹380", price: 220 },
  { name: "PVR Diamond Plaza", location: "Jessore Road, Kolkata", screenType: "PVR P[XL]", priceRange: "₹210 - ₹420", price: 260 },
  { name: "Mukta A2 Cinemas", location: "Central Mall, Ahmedabad", screenType: "RGB LASER", priceRange: "₹190 - ₹370", price: 230 },
  { name: "PVR Directors Cut", location: "Vasant Kunj, New Delhi", screenType: "DIRECTORS CUT", priceRange: "₹400 - ₹800", price: 550 },
  { name: "INOX Leisure Park", location: "Bandra West, Mumbai", screenType: "IMAX 3D", priceRange: "₹280 - ₹550", price: 380 },
  { name: "Carnival Cinemas Salt Lake", location: "Sector V, Kolkata", screenType: "DIGITAL 2D", priceRange: "₹160 - ₹320", price: 200 },
  { name: "Cinepolis Nexus Mall", location: "Whitefield, Bengaluru", screenType: "MACRO XE", priceRange: "₹230 - ₹470", price: 300 },
  { name: "Asian Radhika Multiplex", location: "ECIL, Hyderabad", screenType: "4K ATMOS", priceRange: "₹180 - ₹350", price: 210 },
  { name: "SVT Cinemas Central", location: "T. Nagar, Chennai", screenType: "Qube 4K", priceRange: "₹170 - ₹340", price: 190 },
  { name: "Rajhans Cinemas Park", location: "Ring Road, Surat", screenType: "3D ATMOS", priceRange: "₹190 - ₹390", price: 240 },
  { name: "E-Square Multiplex", location: "University Road, Pune", screenType: "E-SQUARE MAX", priceRange: "₹200 - ₹410", price: 250 },
  { name: "SPI Escape Cinemas", location: "Express Avenue, Chennai", screenType: "Sizzler 4K", priceRange: "₹220 - ₹440", price: 270 },
  { name: "Wave Cinemas Centre Stage", location: "Sector 18, Noida", screenType: "PLATINUM 3D", priceRange: "₹240 - ₹480", price: 300 },
];

const MOVIES_DATA = [
  {
    title: "Master",
    poster: "/posters/master.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/UTiXQcrLlv4",
    story: "JD, an alcoholic professor, is sent to a juvenile reform school for a three-month teaching assignment.\nThere, he discovers that a ruthless gangster named Bhavani is using the young inmates for illegal criminal activities.\nDetermined to save the children, JD confronts his own vices and takes on Bhavani's criminal empire.\nA high-stakes clash ensues between the idealistic teacher and the merciless crime lord.",
    cast: [
      { name: "Vijay", role: "John Durairaj (JD)" },
      { name: "Vijay Sethupathi", role: "Bhavani" },
      { name: "Malavika Mohanan", role: "Charulatha" },
      { name: "Andrea Jeremiah", role: "Vanathi" },
      { name: "Arjun Das", role: "Das" },
      { name: "Shanthanu Bhagyaraj", role: "Bhargav" }
    ],
    genre: "Action / Thriller",
    movieLanguage: "Tamil",
    duration: 179,
    certificate: "UA",
    rating: 8.4
  },
  {
    title: "The Dark Knight",
    poster: "/posters/the-dark-knight.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/EXeTwQWrcwY",
    story: "Batman, Lieutenant James Gordon, and District Attorney Harvey Dent team up to dismantle Gotham City's organized crime.\nTheir efforts are disrupted by the Joker, a psychotic criminal mastermind who plunges Gotham into sheer anarchy.\nBatman is forced to push his physical and psychological limits to stop the terrifying wave of chaos.\nA battle for the soul of Gotham unfolds as personal sacrifices test the city's heroic defenders.",
    cast: [
      { name: "Christian Bale", role: "Bruce Wayne / Batman" },
      { name: "Heath Ledger", role: "Joker" },
      { name: "Aaron Eckhart", role: "Harvey Dent" },
      { name: "Michael Caine", role: "Alfred Pennyworth" },
      { name: "Gary Oldman", role: "James Gordon" },
      { name: "Maggie Gyllenhaal", role: "Rachel Dawes" }
    ],
    genre: "Action / Crime / Drama",
    movieLanguage: "English",
    duration: 152,
    certificate: "UA",
    rating: 9.0
  },
  {
    title: "Drishyam 2",
    poster: "/posters/drishyam-2.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/cxA2y9Tgl7o",
    story: "Seven years after the disappearance of Sameer Deshmukh, the Salgaonkar family believes their secret is safe.\nHowever, a new investigation team led by IG Tarun Ahlawat reopens the unclosed murder case with fresh evidence.\nVijay Salgaonkar must draw upon all his cunning to construct a brilliant defense and shield his loved ones.\nA gripping battle of wits erupts between a determined father and the unrelenting police force.",
    cast: [
      { name: "Ajay Devgn", role: "Vijay Salgaonkar" },
      { name: "Tabu", role: "Meera Deshmukh" },
      { name: "Shriya Saran", role: "Nandini Salgaonkar" },
      { name: "Akshaye Khanna", role: "IG Tarun Ahlawat" },
      { name: "Ishita Dutta", role: "Anju Salgaonkar" },
      { name: "Rajat Kapoor", role: "Mahesh Deshmukh" }
    ],
    genre: "Crime / Drama / Thriller",
    movieLanguage: "Hindi",
    duration: 140,
    certificate: "UA",
    rating: 8.6
  },
  {
    title: "RRR",
    poster: "/posters/rrr.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/NgBoT6ZTL60",
    story: "Set in the 1920s British Raj, two legendary Indian revolutionaries form a deep and unexpected brotherhood.\nKomaram Bheem embarks on a dangerous mission to rescue a young tribal girl kidnapped by British rulers.\nAlluri Sitarama Raju works covertly inside the colonial police force to secure weapons for his people.\nWhen their secret identities clash, their unbreakable bond is tested in an epic battle for freedom.",
    cast: [
      { name: "N.T. Rama Rao Jr.", role: "Komaram Bheem" },
      { name: "Ram Charan", role: "Alluri Sitarama Raju" },
      { name: "Ajay Devgn", role: "Venkata Rama Raju" },
      { name: "Alia Bhatt", role: "Sita" },
      { name: "Shriya Saran", role: "Sarojini" },
      { name: "Ray Stevenson", role: "Governor Scott Buxton" }
    ],
    genre: "Action / Drama",
    movieLanguage: "Telugu",
    duration: 187,
    certificate: "UA",
    rating: 8.8
  },
  {
    title: "Vikram",
    poster: "/posters/vikram.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/OKBMCL-frVU",
    story: "A special black-ops unit led by Agent Amar is assigned to investigate a series of mysterious masked killings.\nAs Amar uncovers the truth, he encounters the ruthless drug lord Santhanam hunting for lost raw cocaine.\nThe investigation reveals the secret operative Vikram, who has returned to dismantle the narcotics syndicate.\nAn explosive war breaks out between rogue law enforcers, clandestine agents, and lethal cartel bosses.",
    cast: [
      { name: "Kamal Haasan", role: "Commander Vikram" },
      { name: "Vijay Sethupathi", role: "Santhanam" },
      { name: "Fahadh Faasil", role: "Agent Amar" },
      { name: "Suriya", role: "Rolex" },
      { name: "Narain", role: "Inspector Bejoy" },
      { name: "Kalidas Jayaram", role: "Prabhanjan" }
    ],
    genre: "Action / Thriller",
    movieLanguage: "Tamil",
    duration: 175,
    certificate: "UA",
    rating: 8.7
  },
  {
    title: "3 Idiots",
    poster: "/posters/3-idiots.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/K0eDlFX9GMc",
    story: "Two college friends embark on a road trip across India to find their long-lost companion Rancho.\nFlashbacks recall their engineering student days under the oppressive, strict dean known as Virus.\nRancho inspires his friends to pursue true passion and knowledge rather than mechanical rote learning.\nThe journey reveals life-changing lessons about friendship, dreams, and overcoming societal pressure.",
    cast: [
      { name: "Aamir Khan", role: "Rancho / Phunsukh Wangdu" },
      { name: "R. Madhavan", role: "Farhan Qureshi" },
      { name: "Sharman Joshi", role: "Raju Rastogi" },
      { name: "Kareena Kapoor", role: "Pia Sahastrabuddhe" },
      { name: "Boman Irani", role: "Viru Sahastrabuddhe (Virus)" },
      { name: "Omi Vaidya", role: "Chatur Ramalingam (Silencer)" }
    ],
    genre: "Comedy / Drama",
    movieLanguage: "Hindi",
    duration: 170,
    certificate: "UA",
    rating: 8.9
  },
  {
    title: "Avengers: Infinity War",
    poster: "/posters/avengers-infinity-war.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/6ZfuNTqbHE8",
    story: "The powerful alien warlord Thanos begins his cosmic quest to collect all six Infinity Stones.\nHis goal is to wipe out half of all life in the universe to restore cosmic balance.\nThe Avengers and their superhero allies assemble across Earth and space to stop his devastating crusade.\nSacrifices must be made as the heroes face their greatest and most dangerous threat yet.",
    cast: [
      { name: "Robert Downey Jr.", role: "Tony Stark / Iron Man" },
      { name: "Chris Hemsworth", role: "Thor" },
      { name: "Mark Ruffalo", role: "Bruce Banner / Hulk" },
      { name: "Chris Evans", role: "Steve Rogers / Captain America" },
      { name: "Scarlett Johansson", role: "Natasha Romanoff / Black Widow" },
      { name: "Josh Brolin", role: "Thanos" }
    ],
    genre: "Action / Sci-Fi / Adventure",
    movieLanguage: "English",
    duration: 149,
    certificate: "UA",
    rating: 8.5
  },
  {
    title: "Pushpa: The Rise Part 1",
    poster: "/posters/pushpa-the-rise.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/pKctjlxbFDQ",
    story: "Pushpa Raj, a coolie in Seshachalam forests, rises through the ranks of a red sandalwood smuggling ring.\nHis fearless attitude and sharp intellect help him take control of the lucrative illicit syndicate.\nAs Pushpa consolidates power, he makes dangerous enemies among rival smugglers and corrupt officials.\nHis ultimate conflict begins when ruthless police officer Bhanwar Singh Shekhawat challenges his reign.",
    cast: [
      { name: "Allu Arjun", role: "Pushpa Raj" },
      { name: "Rashmika Mandanna", role: "Srivalli" },
      { name: "Fahadh Faasil", role: "SP Bhanwar Singh Shekhawat" },
      { name: "Jagadeesh Prathap Bandari", role: "Kesava" },
      { name: "Sunil", role: "Mangalam Srinu" },
      { name: "Anasuya Bharadwaj", role: "Dakshayani" }
    ],
    genre: "Action / Crime / Drama",
    movieLanguage: "Telugu",
    duration: 179,
    certificate: "UA",
    rating: 8.2
  },
  {
    title: "Inception",
    poster: "/posters/inception.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/YoHD9XEInc0",
    story: "Dom Cobb is a skilled thief who extracts valuable secrets from deep within the subconscious during dreams.\nHe is offered a chance to clear his criminal record by performing inception: planting an idea into a target's mind.\nCobb assembles a team of specialists to navigate complex multi-layered dreamscapes.\nHowever, a dangerous projection of his tragic past threatens to doom the entire mission.",
    cast: [
      { name: "Leonardo DiCaprio", role: "Dom Cobb" },
      { name: "Joseph Gordon-Levitt", role: "Arthur" },
      { name: "Elliot Page", role: "Ariadne" },
      { name: "Tom Hardy", role: "Eames" },
      { name: "Ken Watanabe", role: "Saito" },
      { name: "Marion Cotillard", role: "Mal Cobb" }
    ],
    genre: "Action / Sci-Fi / Thriller",
    movieLanguage: "English",
    duration: 148,
    certificate: "UA",
    rating: 8.8
  },
  {
    title: "Jailer",
    poster: "/posters/jailer.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/Y5BeWdODb7c",
    story: "Muthuvel Pandian is a retired jailer living a quiet and peaceful family life in Chennai.\nWhen his police officer son mysteriously vanishes while investigating an idol smuggling ring, Muthuvel steps in.\nHe unlocks his past formidable connections and unleashes a brutal offensive against the criminal syndicate.\nThe retired warden shows no mercy as he dismantles the kingpin's empire to avenge his family.",
    cast: [
      { name: "Rajinikanth", role: "Tiger Muthuvel Pandian" },
      { name: "Vinayakan", role: "Varman" },
      { name: "Ramya Krishnan", role: "Vijaya" },
      { name: "Vasanth Ravi", role: "ACP Arjun" },
      { name: "Tamannaah Bhatia", role: "Kamna" },
      { name: "Mohanlal", role: "Mathew" }
    ],
    genre: "Action / Comedy / Crime",
    movieLanguage: "Tamil",
    duration: 168,
    certificate: "UA",
    rating: 8.1
  },
  {
    title: "Baahubali 2: The Conclusion",
    poster: "/posters/baahubali-2.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/qD-6d8Wo3do",
    story: "Mahendra Baahubali learns the tragic truth behind his father Amarendra Baahubali's legendary life and death.\nJealousy and conspiracy by Bhallaladeva led to the tragic execution of the beloved prince by Kattappa.\nArmed with the truth, Mahendra gathers loyal allies to overthrow the tyrannical King Bhallaladeva.\nAn epic final war takes place to reclaim the kingdom of Mahishmati and restore justice.",
    cast: [
      { name: "Prabhas", role: "Amarendra & Mahendra Baahubali" },
      { name: "Rana Daggubati", role: "Bhallaladeva" },
      { name: "Anushka Shetty", role: "Devasena" },
      { name: "Tamannaah Bhatia", role: "Avanthika" },
      { name: "Sathyaraj", role: "Kattappa" },
      { name: "Ramya Krishnan", role: "Sivagami" }
    ],
    genre: "Action / Drama / Fantasy",
    movieLanguage: "Telugu",
    duration: 167,
    certificate: "UA",
    rating: 8.7
  },
  {
    title: "Spider-Man: No Way Home",
    poster: "/posters/spider-man-no-way-home.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/JfVOs4VSpmA",
    story: "Spider-Man's secret identity is revealed to the world, throwing Peter Parker's life into complete chaos.\nPeter turns to Doctor Strange for help, requesting a spell to make everyone forget he is Spider-Man.\nThe spell goes awry, breaking open the multiverse and releasing dangerous villains from alternate realities.\nPeter must discover what it truly means to be Spider-Man as he fights to save the multiverse.",
    cast: [
      { name: "Tom Holland", role: "Peter Parker / Spider-Man" },
      { name: "Zendaya", role: "MJ" },
      { name: "Benedict Cumberbatch", role: "Doctor Strange" },
      { name: "Jacob Batalon", role: "Ned Leeds" },
      { name: "Willem Dafoe", role: "Norman Osborn / Green Goblin" },
      { name: "Jamie Foxx", role: "Max Dillon / Electro" }
    ],
    genre: "Action / Adventure / Sci-Fi",
    movieLanguage: "English",
    duration: 148,
    certificate: "UA",
    rating: 8.6
  },
  {
    title: "Dangal",
    poster: "/posters/dangal.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/x_7YlGv9u1g",
    story: "Mahavir Singh Phogat, a former amateur wrestler, dreams of winning an international gold medal for India.\nUnable to do so himself, he decides to train his daughters Geeta and Babita in elite wrestling.\nOvercoming societal prejudice and strict training regimes, the sisters rise through national competitions.\nTheir journey culminates at the Commonwealth Games, inspiring an entire nation.",
    cast: [
      { name: "Aamir Khan", role: "Mahavir Singh Phogat" },
      { name: "Fatima Sana Shaikh", role: "Geeta Phogat" },
      { name: "Sanya Malhotra", role: "Babita Kumari" },
      { name: "Sakshi Tanwar", role: "Daya Shobha Kaur" },
      { name: "Zaira Wasim", role: "Young Geeta Phogat" },
      { name: "Suhani Bhatnagar", role: "Young Babita Kumari" }
    ],
    genre: "Action / Biography / Drama",
    movieLanguage: "Hindi",
    duration: 161,
    certificate: "U",
    rating: 8.8
  },
  {
    title: "KGF: Chapter 2",
    poster: "/posters/kgf-chapter-2.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/JKa05nyUmuQ",
    story: "After eliminating Garuda, Rocky establishes his undisputed rule over the blood-soaked Kolar Gold Fields.\nHis rapid rise to supreme power draws the wrath of ruthless rivals and government authorities alike.\nAdheera, a formidable warrior, emerges from the shadows to reclaim the gold mines by force.\nRocky must fight an all-out war against lethal enemies and Prime Minister Ramika Sen to defend his empire.",
    cast: [
      { name: "Yash", role: "Raja Krishnappa Bairya (Rocky)" },
      { name: "Sanjay Dutt", role: "Adheera" },
      { name: "Raveena Tandon", role: "Ramika Sen" },
      { name: "Srinidhi Shetty", role: "Reena Desai" },
      { name: "Prakash Raj", role: "Vijayendra Ingalagi" },
      { name: "Archana Jois", role: "Shanthamma" }
    ],
    genre: "Action / Crime / Drama",
    movieLanguage: "Kannada",
    duration: 168,
    certificate: "UA",
    rating: 8.4
  },
  {
    title: "Interstellar",
    poster: "/posters/interstellar.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/zSWdZVtXT7E",
    story: "In a future Earth plagued by global crop blights and famine, humanity faces imminent extinction.\nA team of astronauts led by Cooper embarks on a dangerous interstellar mission through a wormhole.\nThey travel across unknown galaxies to locate a habitable new planet for human survival.\nCooper must endure space-time anomalies and extreme isolation while striving to return home to his daughter.",
    cast: [
      { name: "Matthew McConaughey", role: "Joseph Cooper" },
      { name: "Anne Hathaway", role: "Dr. Amelia Brand" },
      { name: "Jessica Chastain", role: "Murphy Cooper" },
      { name: "Michael Caine", role: "Professor John Brand" },
      { name: "Matt Damon", role: "Dr. Mann" },
      { name: "Mackenzie Foy", role: "Young Murphy" }
    ],
    genre: "Adventure / Drama / Sci-Fi",
    movieLanguage: "English",
    duration: 169,
    certificate: "UA",
    rating: 8.9
  },
  {
    title: "Kaithi",
    poster: "/posters/kaithi.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
    trailer: "https://www.youtube.com/embed/gzq8tDb3p_4",
    story: "Dilli, a recently released prisoner, wishes to meet his daughter for the very first time.\nHis journey is interrupted when an injured police officer recruits him to drive a truck full of unconscious cops.\nPursued relentlessly by a violent drug gang seeking revenge, Dilli must fight through the night to protect them.\nA single night of non-stop action decides the fate of innocent lives and a father's dream.",
    cast: [
      { name: "Karthi", role: "Dilli" },
      { name: "Narain", role: "Inspector Bejoy" },
      { name: "Arjun Das", role: "Anbu" },
      { name: "Harish Uthaman", role: "Adaikalam" },
      { name: "George Maryan", role: "Constable Napoleon" },
      { name: "Dheena", role: "Kamatchi" }
    ],
    genre: "Action / Crime / Thriller",
    movieLanguage: "Tamil",
    duration: 145,
    certificate: "UA",
    rating: 8.5
  }
];

async function seedNowShowing() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movieDB";
    console.log("Connecting to MongoDB for Now Showing module seed...");
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log("✅ Connected to Primary MongoDB.");
    } catch (primaryErr) {
      console.log("⚠️ Primary MongoDB connection failed, attempting local fallback...");
      await mongoose.connect("mongodb://127.0.0.1:27017/movieDB", { serverSelectionTimeoutMS: 5000 });
      console.log("✅ Connected to Local Fallback MongoDB.");
    }

    // Clear existing data for clean re-seed
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Show.deleteMany({});
    console.log("🧹 Cleared old Movie, Theatre, and Show collections.");

    // 1. Seed standard Theatre documents in MongoDB
    const theatreDocMap = new Map();
    for (const t of THEATRE_POOL) {
      const theatreDoc = await Theatre.create({
        name: t.name,
        location: t.location,
        totalSeats: 100
      });
      theatreDocMap.set(t.name, theatreDoc);
    }
    console.log(`✅ Seeded ${theatreDocMap.size} distinct Theatre documents.`);

    // 2. Generate movies with 5x10 showtime-theatre grid and validate
    let totalSlotsGenerated = 0;

    for (const movieItem of MOVIES_DATA) {
      // Reusable generator call
      const showtimesGrid = generateShowtimeGrid(movieItem.duration, THEATRE_POOL);
      
      // Explicit overlap validation
      validateNoOverlap(showtimesGrid, movieItem.duration);

      // Create movie document first
      const createdMovie = new Movie({
        title: movieItem.title,
        poster: movieItem.poster,
        fallbackPoster: movieItem.fallbackPoster,
        trailer: movieItem.trailer || "",
        story: movieItem.story,
        description: movieItem.story,
        cast: movieItem.cast,
        genre: movieItem.genre,
        movieLanguage: movieItem.movieLanguage,
        duration: movieItem.duration,
        certificate: movieItem.certificate,
        rating: movieItem.rating,
        showtimes: []
      });

      // Hydrate showtimes with real Theatre and Show MongoDB IDs
      const hydratedShowtimes = [];

      for (const slot of showtimesGrid) {
        const hydratedTheatres = [];

        for (const tItem of slot.theatres) {
          const theatreDoc = theatreDocMap.get(tItem.name);
          
          // Create real Show document so seat selection works cleanly
          const showDoc = await Show.create({
            movie: createdMovie._id,
            theatre: theatreDoc._id,
            showTime: slot.time,
            price: tItem.price || 250,
            bookedSeats: [],
            totalSeats: 100
          });

          hydratedTheatres.push({
            name: tItem.name,
            location: tItem.location,
            screenType: tItem.screenType,
            priceRange: tItem.priceRange,
            price: tItem.price,
            theatreId: theatreDoc._id,
            showId: showDoc._id
          });

          totalSlotsGenerated++;
        }

        hydratedShowtimes.push({
          time: slot.time,
          theatres: hydratedTheatres
        });
      }

      createdMovie.showtimes = hydratedShowtimes;
      await createdMovie.save();

      console.log(`🎬 Seeded "${movieItem.title}" (${movieItem.duration}m) with 5 showtimes x 10 theatres = 50 slots [Overlap Validated ✅]`);
    }

    console.log(`\n🎉 SEED SUCCESSFUL! Total Movies: ${MOVIES_DATA.length}, Total Slots: ${totalSlotsGenerated}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Script Error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedNowShowing();
}

module.exports = { seedNowShowing, MOVIES_DATA, THEATRE_POOL };
