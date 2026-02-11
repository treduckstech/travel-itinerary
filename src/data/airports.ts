export type Airport = {
  iata: string;
  name: string;
  city: string;
  country: string;
  tz: string;
};

export const airports: Airport[] = [
  // United States - Major Hubs
  { iata: "ATL", name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", country: "United States", tz: "America/New_York" },
  { iata: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "United States", tz: "America/Los_Angeles" },
  { iata: "ORD", name: "O'Hare International", city: "Chicago", country: "United States", tz: "America/Chicago" },
  { iata: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "United States", tz: "America/Chicago" },
  { iata: "DEN", name: "Denver International", city: "Denver", country: "United States", tz: "America/Denver" },
  { iata: "JFK", name: "John F. Kennedy International", city: "New York", country: "United States", tz: "America/New_York" },
  { iata: "SFO", name: "San Francisco International", city: "San Francisco", country: "United States", tz: "America/Los_Angeles" },
  { iata: "SEA", name: "Seattle-Tacoma International", city: "Seattle", country: "United States", tz: "America/Los_Angeles" },
  { iata: "LAS", name: "Harry Reid International", city: "Las Vegas", country: "United States", tz: "America/Los_Angeles" },
  { iata: "MCO", name: "Orlando International", city: "Orlando", country: "United States", tz: "America/New_York" },
  { iata: "EWR", name: "Newark Liberty International", city: "Newark", country: "United States", tz: "America/New_York" },
  { iata: "MIA", name: "Miami International", city: "Miami", country: "United States", tz: "America/New_York" },
  { iata: "PHX", name: "Phoenix Sky Harbor International", city: "Phoenix", country: "United States", tz: "America/Phoenix" },
  { iata: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "United States", tz: "America/Chicago" },
  { iata: "BOS", name: "Boston Logan International", city: "Boston", country: "United States", tz: "America/New_York" },
  { iata: "MSP", name: "Minneapolis-Saint Paul International", city: "Minneapolis", country: "United States", tz: "America/Chicago" },
  { iata: "DTW", name: "Detroit Metropolitan Wayne County", city: "Detroit", country: "United States", tz: "America/Detroit" },
  { iata: "PHL", name: "Philadelphia International", city: "Philadelphia", country: "United States", tz: "America/New_York" },
  { iata: "LGA", name: "LaGuardia", city: "New York", country: "United States", tz: "America/New_York" },
  { iata: "CLT", name: "Charlotte Douglas International", city: "Charlotte", country: "United States", tz: "America/New_York" },
  { iata: "BWI", name: "Baltimore/Washington International", city: "Baltimore", country: "United States", tz: "America/New_York" },
  { iata: "SLC", name: "Salt Lake City International", city: "Salt Lake City", country: "United States", tz: "America/Denver" },
  { iata: "DCA", name: "Ronald Reagan Washington National", city: "Washington", country: "United States", tz: "America/New_York" },
  { iata: "IAD", name: "Washington Dulles International", city: "Washington", country: "United States", tz: "America/New_York" },
  { iata: "SAN", name: "San Diego International", city: "San Diego", country: "United States", tz: "America/Los_Angeles" },
  { iata: "TPA", name: "Tampa International", city: "Tampa", country: "United States", tz: "America/New_York" },
  { iata: "AUS", name: "Austin-Bergstrom International", city: "Austin", country: "United States", tz: "America/Chicago" },
  { iata: "PDX", name: "Portland International", city: "Portland", country: "United States", tz: "America/Los_Angeles" },
  { iata: "BNA", name: "Nashville International", city: "Nashville", country: "United States", tz: "America/Chicago" },
  { iata: "HNL", name: "Daniel K. Inouye International", city: "Honolulu", country: "United States", tz: "Pacific/Honolulu" },
  { iata: "OGG", name: "Kahului", city: "Maui", country: "United States", tz: "Pacific/Honolulu" },
  { iata: "RDU", name: "Raleigh-Durham International", city: "Raleigh", country: "United States", tz: "America/New_York" },
  { iata: "MSY", name: "Louis Armstrong New Orleans International", city: "New Orleans", country: "United States", tz: "America/Chicago" },
  { iata: "SJC", name: "San Jose International", city: "San Jose", country: "United States", tz: "America/Los_Angeles" },
  { iata: "OAK", name: "Oakland International", city: "Oakland", country: "United States", tz: "America/Los_Angeles" },
  { iata: "FLL", name: "Fort Lauderdale-Hollywood International", city: "Fort Lauderdale", country: "United States", tz: "America/New_York" },
  { iata: "ANC", name: "Ted Stevens Anchorage International", city: "Anchorage", country: "United States", tz: "America/Anchorage" },

  // Canada
  { iata: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "Canada", tz: "America/Toronto" },
  { iata: "YVR", name: "Vancouver International", city: "Vancouver", country: "Canada", tz: "America/Vancouver" },
  { iata: "YUL", name: "Montreal-Trudeau International", city: "Montreal", country: "Canada", tz: "America/Montreal" },
  { iata: "YYC", name: "Calgary International", city: "Calgary", country: "Canada", tz: "America/Edmonton" },
  { iata: "YOW", name: "Ottawa Macdonald-Cartier International", city: "Ottawa", country: "Canada", tz: "America/Toronto" },

  // Mexico & Central America
  { iata: "MEX", name: "Mexico City International", city: "Mexico City", country: "Mexico", tz: "America/Mexico_City" },
  { iata: "CUN", name: "Cancun International", city: "Cancun", country: "Mexico", tz: "America/Cancun" },
  { iata: "GDL", name: "Guadalajara International", city: "Guadalajara", country: "Mexico", tz: "America/Mexico_City" },
  { iata: "SJO", name: "Juan Santamaria International", city: "San Jose", country: "Costa Rica", tz: "America/Costa_Rica" },
  { iata: "PTY", name: "Tocumen International", city: "Panama City", country: "Panama", tz: "America/Panama" },

  // Caribbean
  { iata: "SJU", name: "Luis Munoz Marin International", city: "San Juan", country: "Puerto Rico", tz: "America/Puerto_Rico" },
  { iata: "NAS", name: "Lynden Pindling International", city: "Nassau", country: "Bahamas", tz: "America/Nassau" },
  { iata: "MBJ", name: "Sangster International", city: "Montego Bay", country: "Jamaica", tz: "America/Jamaica" },

  // South America
  { iata: "GRU", name: "Sao Paulo-Guarulhos International", city: "Sao Paulo", country: "Brazil", tz: "America/Sao_Paulo" },
  { iata: "GIG", name: "Rio de Janeiro-Galeao International", city: "Rio de Janeiro", country: "Brazil", tz: "America/Sao_Paulo" },
  { iata: "EZE", name: "Ministro Pistarini International", city: "Buenos Aires", country: "Argentina", tz: "America/Argentina/Buenos_Aires" },
  { iata: "SCL", name: "Arturo Merino Benitez International", city: "Santiago", country: "Chile", tz: "America/Santiago" },
  { iata: "BOG", name: "El Dorado International", city: "Bogota", country: "Colombia", tz: "America/Bogota" },
  { iata: "LIM", name: "Jorge Chavez International", city: "Lima", country: "Peru", tz: "America/Lima" },
  { iata: "UIO", name: "Mariscal Sucre International", city: "Quito", country: "Ecuador", tz: "America/Guayaquil" },
  { iata: "MVD", name: "Carrasco International", city: "Montevideo", country: "Uruguay", tz: "America/Montevideo" },

  // United Kingdom & Ireland
  { iata: "LHR", name: "Heathrow", city: "London", country: "United Kingdom", tz: "Europe/London" },
  { iata: "LGW", name: "Gatwick", city: "London", country: "United Kingdom", tz: "Europe/London" },
  { iata: "STN", name: "Stansted", city: "London", country: "United Kingdom", tz: "Europe/London" },
  { iata: "MAN", name: "Manchester", city: "Manchester", country: "United Kingdom", tz: "Europe/London" },
  { iata: "EDI", name: "Edinburgh", city: "Edinburgh", country: "United Kingdom", tz: "Europe/London" },
  { iata: "DUB", name: "Dublin", city: "Dublin", country: "Ireland", tz: "Europe/Dublin" },

  // Western Europe
  { iata: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France", tz: "Europe/Paris" },
  { iata: "ORY", name: "Orly", city: "Paris", country: "France", tz: "Europe/Paris" },
  { iata: "NCE", name: "Nice Cote d'Azur", city: "Nice", country: "France", tz: "Europe/Paris" },
  { iata: "AMS", name: "Schiphol", city: "Amsterdam", country: "Netherlands", tz: "Europe/Amsterdam" },
  { iata: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Germany", tz: "Europe/Berlin" },
  { iata: "MUC", name: "Munich", city: "Munich", country: "Germany", tz: "Europe/Berlin" },
  { iata: "BER", name: "Berlin Brandenburg", city: "Berlin", country: "Germany", tz: "Europe/Berlin" },
  { iata: "ZRH", name: "Zurich", city: "Zurich", country: "Switzerland", tz: "Europe/Zurich" },
  { iata: "GVA", name: "Geneva", city: "Geneva", country: "Switzerland", tz: "Europe/Zurich" },
  { iata: "BRU", name: "Brussels", city: "Brussels", country: "Belgium", tz: "Europe/Brussels" },
  { iata: "VIE", name: "Vienna International", city: "Vienna", country: "Austria", tz: "Europe/Vienna" },

  // Southern Europe
  { iata: "MAD", name: "Adolfo Suarez Madrid-Barajas", city: "Madrid", country: "Spain", tz: "Europe/Madrid" },
  { iata: "BCN", name: "Josep Tarradellas Barcelona-El Prat", city: "Barcelona", country: "Spain", tz: "Europe/Madrid" },
  { iata: "AGP", name: "Malaga-Costa del Sol", city: "Malaga", country: "Spain", tz: "Europe/Madrid" },
  { iata: "PMI", name: "Palma de Mallorca", city: "Palma de Mallorca", country: "Spain", tz: "Europe/Madrid" },
  { iata: "LIS", name: "Humberto Delgado", city: "Lisbon", country: "Portugal", tz: "Europe/Lisbon" },
  { iata: "FCO", name: "Leonardo da Vinci-Fiumicino", city: "Rome", country: "Italy", tz: "Europe/Rome" },
  { iata: "MXP", name: "Milan Malpensa", city: "Milan", country: "Italy", tz: "Europe/Rome" },
  { iata: "VCE", name: "Marco Polo", city: "Venice", country: "Italy", tz: "Europe/Rome" },
  { iata: "NAP", name: "Naples International", city: "Naples", country: "Italy", tz: "Europe/Rome" },
  { iata: "FLR", name: "Amerigo Vespucci", city: "Florence", country: "Italy", tz: "Europe/Rome" },
  { iata: "BGY", name: "Milan Bergamo", city: "Bergamo", country: "Italy", tz: "Europe/Rome" },
  { iata: "BLQ", name: "Guglielmo Marconi", city: "Bologna", country: "Italy", tz: "Europe/Rome" },
  { iata: "PSA", name: "Galileo Galilei", city: "Pisa", country: "Italy", tz: "Europe/Rome" },
  { iata: "CTA", name: "Catania-Fontanarossa", city: "Catania", country: "Italy", tz: "Europe/Rome" },
  { iata: "PMO", name: "Falcone-Borsellino", city: "Palermo", country: "Italy", tz: "Europe/Rome" },
  { iata: "TRN", name: "Turin Caselle", city: "Turin", country: "Italy", tz: "Europe/Rome" },
  { iata: "ATH", name: "Eleftherios Venizelos", city: "Athens", country: "Greece", tz: "Europe/Athens" },
  { iata: "SKG", name: "Thessaloniki Macedonia", city: "Thessaloniki", country: "Greece", tz: "Europe/Athens" },
  { iata: "HER", name: "Heraklion Nikos Kazantzakis", city: "Heraklion", country: "Greece", tz: "Europe/Athens" },
  { iata: "JTR", name: "Santorini (Thira)", city: "Santorini", country: "Greece", tz: "Europe/Athens" },
  { iata: "JMK", name: "Mykonos", city: "Mykonos", country: "Greece", tz: "Europe/Athens" },
  { iata: "CFU", name: "Corfu Ioannis Kapodistrias", city: "Corfu", country: "Greece", tz: "Europe/Athens" },
  { iata: "RHO", name: "Rhodes Diagoras", city: "Rhodes", country: "Greece", tz: "Europe/Athens" },
  { iata: "CHQ", name: "Chania Daskalogiannis", city: "Chania", country: "Greece", tz: "Europe/Athens" },
  { iata: "OPO", name: "Francisco Sa Carneiro", city: "Porto", country: "Portugal", tz: "Europe/Lisbon" },
  { iata: "FAO", name: "Faro", city: "Faro", country: "Portugal", tz: "Europe/Lisbon" },
  { iata: "FNC", name: "Cristiano Ronaldo", city: "Funchal", country: "Portugal", tz: "Atlantic/Madeira" },
  { iata: "PDL", name: "Joao Paulo II", city: "Ponta Delgada", country: "Portugal", tz: "Atlantic/Azores" },
  { iata: "ALC", name: "Alicante-Elche", city: "Alicante", country: "Spain", tz: "Europe/Madrid" },
  { iata: "VLC", name: "Valencia", city: "Valencia", country: "Spain", tz: "Europe/Madrid" },
  { iata: "SVQ", name: "Seville", city: "Seville", country: "Spain", tz: "Europe/Madrid" },
  { iata: "BIO", name: "Bilbao", city: "Bilbao", country: "Spain", tz: "Europe/Madrid" },
  { iata: "IBZ", name: "Ibiza", city: "Ibiza", country: "Spain", tz: "Europe/Madrid" },
  { iata: "TFS", name: "Tenerife South", city: "Tenerife", country: "Spain", tz: "Atlantic/Canary" },
  { iata: "LPA", name: "Gran Canaria", city: "Las Palmas", country: "Spain", tz: "Atlantic/Canary" },
  { iata: "ACE", name: "Cesar Manrique-Lanzarote", city: "Lanzarote", country: "Spain", tz: "Atlantic/Canary" },
  { iata: "SCQ", name: "Santiago de Compostela", city: "Santiago de Compostela", country: "Spain", tz: "Europe/Madrid" },
  { iata: "DBV", name: "Dubrovnik", city: "Dubrovnik", country: "Croatia", tz: "Europe/Zagreb" },
  { iata: "SPU", name: "Split", city: "Split", country: "Croatia", tz: "Europe/Zagreb" },
  { iata: "ZAG", name: "Franjo Tudman", city: "Zagreb", country: "Croatia", tz: "Europe/Zagreb" },
  { iata: "MLA", name: "Malta International", city: "Valletta", country: "Malta", tz: "Europe/Malta" },
  { iata: "LCA", name: "Larnaca International", city: "Larnaca", country: "Cyprus", tz: "Asia/Nicosia" },
  { iata: "PFO", name: "Paphos International", city: "Paphos", country: "Cyprus", tz: "Asia/Nicosia" },
  { iata: "TIV", name: "Tivat", city: "Tivat", country: "Montenegro", tz: "Europe/Podgorica" },
  { iata: "LJU", name: "Ljubljana Joze Pucnik", city: "Ljubljana", country: "Slovenia", tz: "Europe/Ljubljana" },
  { iata: "MRS", name: "Marseille Provence", city: "Marseille", country: "France", tz: "Europe/Paris" },
  { iata: "TLS", name: "Toulouse-Blagnac", city: "Toulouse", country: "France", tz: "Europe/Paris" },

  // Northern & Eastern Europe
  { iata: "CPH", name: "Copenhagen", city: "Copenhagen", country: "Denmark", tz: "Europe/Copenhagen" },
  { iata: "ARN", name: "Stockholm Arlanda", city: "Stockholm", country: "Sweden", tz: "Europe/Stockholm" },
  { iata: "OSL", name: "Oslo Gardermoen", city: "Oslo", country: "Norway", tz: "Europe/Oslo" },
  { iata: "HEL", name: "Helsinki-Vantaa", city: "Helsinki", country: "Finland", tz: "Europe/Helsinki" },
  { iata: "WAW", name: "Warsaw Chopin", city: "Warsaw", country: "Poland", tz: "Europe/Warsaw" },
  { iata: "PRG", name: "Vaclav Havel", city: "Prague", country: "Czech Republic", tz: "Europe/Prague" },
  { iata: "BUD", name: "Budapest Ferenc Liszt", city: "Budapest", country: "Hungary", tz: "Europe/Budapest" },
  { iata: "OTP", name: "Henri Coanda", city: "Bucharest", country: "Romania", tz: "Europe/Bucharest" },

  // Turkey
  { iata: "IST", name: "Istanbul", city: "Istanbul", country: "Turkey", tz: "Europe/Istanbul" },
  { iata: "SAW", name: "Sabiha Gokcen", city: "Istanbul", country: "Turkey", tz: "Europe/Istanbul" },
  { iata: "AYT", name: "Antalya", city: "Antalya", country: "Turkey", tz: "Europe/Istanbul" },

  // Middle East
  { iata: "DXB", name: "Dubai International", city: "Dubai", country: "United Arab Emirates", tz: "Asia/Dubai" },
  { iata: "AUH", name: "Abu Dhabi International", city: "Abu Dhabi", country: "United Arab Emirates", tz: "Asia/Dubai" },
  { iata: "DOH", name: "Hamad International", city: "Doha", country: "Qatar", tz: "Asia/Qatar" },
  { iata: "JED", name: "King Abdulaziz International", city: "Jeddah", country: "Saudi Arabia", tz: "Asia/Riyadh" },
  { iata: "RUH", name: "King Khalid International", city: "Riyadh", country: "Saudi Arabia", tz: "Asia/Riyadh" },
  { iata: "TLV", name: "Ben Gurion", city: "Tel Aviv", country: "Israel", tz: "Asia/Jerusalem" },
  { iata: "AMM", name: "Queen Alia International", city: "Amman", country: "Jordan", tz: "Asia/Amman" },
  { iata: "BAH", name: "Bahrain International", city: "Manama", country: "Bahrain", tz: "Asia/Bahrain" },
  { iata: "MCT", name: "Muscat International", city: "Muscat", country: "Oman", tz: "Asia/Muscat" },
  { iata: "KWI", name: "Kuwait International", city: "Kuwait City", country: "Kuwait", tz: "Asia/Kuwait" },

  // East Asia
  { iata: "NRT", name: "Narita International", city: "Tokyo", country: "Japan", tz: "Asia/Tokyo" },
  { iata: "HND", name: "Haneda", city: "Tokyo", country: "Japan", tz: "Asia/Tokyo" },
  { iata: "KIX", name: "Kansai International", city: "Osaka", country: "Japan", tz: "Asia/Tokyo" },
  { iata: "ICN", name: "Incheon International", city: "Seoul", country: "South Korea", tz: "Asia/Seoul" },
  { iata: "PEK", name: "Beijing Capital International", city: "Beijing", country: "China", tz: "Asia/Shanghai" },
  { iata: "PKX", name: "Beijing Daxing International", city: "Beijing", country: "China", tz: "Asia/Shanghai" },
  { iata: "PVG", name: "Shanghai Pudong International", city: "Shanghai", country: "China", tz: "Asia/Shanghai" },
  { iata: "CAN", name: "Guangzhou Baiyun International", city: "Guangzhou", country: "China", tz: "Asia/Shanghai" },
  { iata: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "China", tz: "Asia/Hong_Kong" },
  { iata: "TPE", name: "Taiwan Taoyuan International", city: "Taipei", country: "Taiwan", tz: "Asia/Taipei" },

  // Southeast Asia
  { iata: "SIN", name: "Changi", city: "Singapore", country: "Singapore", tz: "Asia/Singapore" },
  { iata: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand", tz: "Asia/Bangkok" },
  { iata: "KUL", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia", tz: "Asia/Kuala_Lumpur" },
  { iata: "CGK", name: "Soekarno-Hatta International", city: "Jakarta", country: "Indonesia", tz: "Asia/Jakarta" },
  { iata: "DPS", name: "Ngurah Rai International", city: "Bali", country: "Indonesia", tz: "Asia/Makassar" },
  { iata: "MNL", name: "Ninoy Aquino International", city: "Manila", country: "Philippines", tz: "Asia/Manila" },
  { iata: "SGN", name: "Tan Son Nhat International", city: "Ho Chi Minh City", country: "Vietnam", tz: "Asia/Ho_Chi_Minh" },
  { iata: "HAN", name: "Noi Bai International", city: "Hanoi", country: "Vietnam", tz: "Asia/Ho_Chi_Minh" },
  { iata: "PNH", name: "Phnom Penh International", city: "Phnom Penh", country: "Cambodia", tz: "Asia/Phnom_Penh" },
  { iata: "REP", name: "Siem Reap International", city: "Siem Reap", country: "Cambodia", tz: "Asia/Phnom_Penh" },

  // South Asia
  { iata: "DEL", name: "Indira Gandhi International", city: "Delhi", country: "India", tz: "Asia/Kolkata" },
  { iata: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India", tz: "Asia/Kolkata" },
  { iata: "BLR", name: "Kempegowda International", city: "Bangalore", country: "India", tz: "Asia/Kolkata" },
  { iata: "MAA", name: "Chennai International", city: "Chennai", country: "India", tz: "Asia/Kolkata" },
  { iata: "HYD", name: "Rajiv Gandhi International", city: "Hyderabad", country: "India", tz: "Asia/Kolkata" },
  { iata: "CMB", name: "Bandaranaike International", city: "Colombo", country: "Sri Lanka", tz: "Asia/Colombo" },
  { iata: "DAC", name: "Hazrat Shahjalal International", city: "Dhaka", country: "Bangladesh", tz: "Asia/Dhaka" },
  { iata: "KTM", name: "Tribhuvan International", city: "Kathmandu", country: "Nepal", tz: "Asia/Kathmandu" },
  { iata: "MLE", name: "Velana International", city: "Male", country: "Maldives", tz: "Indian/Maldives" },

  // Africa
  { iata: "JNB", name: "O.R. Tambo International", city: "Johannesburg", country: "South Africa", tz: "Africa/Johannesburg" },
  { iata: "CPT", name: "Cape Town International", city: "Cape Town", country: "South Africa", tz: "Africa/Johannesburg" },
  { iata: "CAI", name: "Cairo International", city: "Cairo", country: "Egypt", tz: "Africa/Cairo" },
  { iata: "CMN", name: "Mohammed V International", city: "Casablanca", country: "Morocco", tz: "Africa/Casablanca" },
  { iata: "RAK", name: "Marrakech Menara", city: "Marrakech", country: "Morocco", tz: "Africa/Casablanca" },
  { iata: "NBO", name: "Jomo Kenyatta International", city: "Nairobi", country: "Kenya", tz: "Africa/Nairobi" },
  { iata: "ADD", name: "Bole International", city: "Addis Ababa", country: "Ethiopia", tz: "Africa/Addis_Ababa" },
  { iata: "LOS", name: "Murtala Muhammed International", city: "Lagos", country: "Nigeria", tz: "Africa/Lagos" },
  { iata: "ACC", name: "Kotoka International", city: "Accra", country: "Ghana", tz: "Africa/Accra" },
  { iata: "DSS", name: "Blaise Diagne International", city: "Dakar", country: "Senegal", tz: "Africa/Dakar" },
  { iata: "DAR", name: "Julius Nyerere International", city: "Dar es Salaam", country: "Tanzania", tz: "Africa/Dar_es_Salaam" },

  // Oceania
  { iata: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "Australia", tz: "Australia/Sydney" },
  { iata: "MEL", name: "Melbourne Tullamarine", city: "Melbourne", country: "Australia", tz: "Australia/Melbourne" },
  { iata: "BNE", name: "Brisbane", city: "Brisbane", country: "Australia", tz: "Australia/Brisbane" },
  { iata: "PER", name: "Perth", city: "Perth", country: "Australia", tz: "Australia/Perth" },
  { iata: "AKL", name: "Auckland", city: "Auckland", country: "New Zealand", tz: "Pacific/Auckland" },
  { iata: "CHC", name: "Christchurch International", city: "Christchurch", country: "New Zealand", tz: "Pacific/Auckland" },
  { iata: "NAN", name: "Nadi International", city: "Nadi", country: "Fiji", tz: "Pacific/Fiji" },
  { iata: "PPT", name: "Faaa International", city: "Papeete", country: "French Polynesia", tz: "Pacific/Tahiti" },
];

// Pre-computed lowercase search index for performance
type AirportIndex = {
  airport: Airport;
  iataLower: string;
  nameLower: string;
  cityLower: string;
  countryLower: string;
};

const searchIndex: AirportIndex[] = airports.map((airport) => ({
  airport,
  iataLower: airport.iata.toLowerCase(),
  nameLower: airport.name.toLowerCase(),
  cityLower: airport.city.toLowerCase(),
  countryLower: airport.country.toLowerCase(),
}));

export function searchAirports(query: string, limit = 8): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const exactIata: Airport[] = [];
  const startsWithCode: Airport[] = [];
  const substringMatches: Airport[] = [];

  for (const entry of searchIndex) {
    if (entry.iataLower === q) {
      exactIata.push(entry.airport);
    } else if (entry.iataLower.startsWith(q)) {
      startsWithCode.push(entry.airport);
    } else if (
      entry.iataLower.includes(q) ||
      entry.nameLower.includes(q) ||
      entry.cityLower.includes(q) ||
      entry.countryLower.includes(q)
    ) {
      substringMatches.push(entry.airport);
    }
  }

  return [...exactIata, ...startsWithCode, ...substringMatches].slice(0, limit);
}
