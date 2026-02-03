export type Airport = {
  iata: string;
  name: string;
  city: string;
  country: string;
};

export const airports: Airport[] = [
  // United States - Major Hubs
  { iata: "ATL", name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", country: "United States" },
  { iata: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "United States" },
  { iata: "ORD", name: "O'Hare International", city: "Chicago", country: "United States" },
  { iata: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "United States" },
  { iata: "DEN", name: "Denver International", city: "Denver", country: "United States" },
  { iata: "JFK", name: "John F. Kennedy International", city: "New York", country: "United States" },
  { iata: "SFO", name: "San Francisco International", city: "San Francisco", country: "United States" },
  { iata: "SEA", name: "Seattle-Tacoma International", city: "Seattle", country: "United States" },
  { iata: "LAS", name: "Harry Reid International", city: "Las Vegas", country: "United States" },
  { iata: "MCO", name: "Orlando International", city: "Orlando", country: "United States" },
  { iata: "EWR", name: "Newark Liberty International", city: "Newark", country: "United States" },
  { iata: "MIA", name: "Miami International", city: "Miami", country: "United States" },
  { iata: "PHX", name: "Phoenix Sky Harbor International", city: "Phoenix", country: "United States" },
  { iata: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "United States" },
  { iata: "BOS", name: "Boston Logan International", city: "Boston", country: "United States" },
  { iata: "MSP", name: "Minneapolis-Saint Paul International", city: "Minneapolis", country: "United States" },
  { iata: "DTW", name: "Detroit Metropolitan Wayne County", city: "Detroit", country: "United States" },
  { iata: "PHL", name: "Philadelphia International", city: "Philadelphia", country: "United States" },
  { iata: "LGA", name: "LaGuardia", city: "New York", country: "United States" },
  { iata: "CLT", name: "Charlotte Douglas International", city: "Charlotte", country: "United States" },
  { iata: "BWI", name: "Baltimore/Washington International", city: "Baltimore", country: "United States" },
  { iata: "SLC", name: "Salt Lake City International", city: "Salt Lake City", country: "United States" },
  { iata: "DCA", name: "Ronald Reagan Washington National", city: "Washington", country: "United States" },
  { iata: "IAD", name: "Washington Dulles International", city: "Washington", country: "United States" },
  { iata: "SAN", name: "San Diego International", city: "San Diego", country: "United States" },
  { iata: "TPA", name: "Tampa International", city: "Tampa", country: "United States" },
  { iata: "AUS", name: "Austin-Bergstrom International", city: "Austin", country: "United States" },
  { iata: "PDX", name: "Portland International", city: "Portland", country: "United States" },
  { iata: "BNA", name: "Nashville International", city: "Nashville", country: "United States" },
  { iata: "HNL", name: "Daniel K. Inouye International", city: "Honolulu", country: "United States" },
  { iata: "OGG", name: "Kahului", city: "Maui", country: "United States" },
  { iata: "RDU", name: "Raleigh-Durham International", city: "Raleigh", country: "United States" },
  { iata: "MSY", name: "Louis Armstrong New Orleans International", city: "New Orleans", country: "United States" },
  { iata: "SJC", name: "San Jose International", city: "San Jose", country: "United States" },
  { iata: "OAK", name: "Oakland International", city: "Oakland", country: "United States" },
  { iata: "FLL", name: "Fort Lauderdale-Hollywood International", city: "Fort Lauderdale", country: "United States" },
  { iata: "ANC", name: "Ted Stevens Anchorage International", city: "Anchorage", country: "United States" },

  // Canada
  { iata: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "Canada" },
  { iata: "YVR", name: "Vancouver International", city: "Vancouver", country: "Canada" },
  { iata: "YUL", name: "Montreal-Trudeau International", city: "Montreal", country: "Canada" },
  { iata: "YYC", name: "Calgary International", city: "Calgary", country: "Canada" },
  { iata: "YOW", name: "Ottawa Macdonald-Cartier International", city: "Ottawa", country: "Canada" },

  // Mexico & Central America
  { iata: "MEX", name: "Mexico City International", city: "Mexico City", country: "Mexico" },
  { iata: "CUN", name: "Cancun International", city: "Cancun", country: "Mexico" },
  { iata: "GDL", name: "Guadalajara International", city: "Guadalajara", country: "Mexico" },
  { iata: "SJO", name: "Juan Santamaria International", city: "San Jose", country: "Costa Rica" },
  { iata: "PTY", name: "Tocumen International", city: "Panama City", country: "Panama" },

  // Caribbean
  { iata: "SJU", name: "Luis Munoz Marin International", city: "San Juan", country: "Puerto Rico" },
  { iata: "NAS", name: "Lynden Pindling International", city: "Nassau", country: "Bahamas" },
  { iata: "MBJ", name: "Sangster International", city: "Montego Bay", country: "Jamaica" },

  // South America
  { iata: "GRU", name: "Sao Paulo-Guarulhos International", city: "Sao Paulo", country: "Brazil" },
  { iata: "GIG", name: "Rio de Janeiro-Galeao International", city: "Rio de Janeiro", country: "Brazil" },
  { iata: "EZE", name: "Ministro Pistarini International", city: "Buenos Aires", country: "Argentina" },
  { iata: "SCL", name: "Arturo Merino Benitez International", city: "Santiago", country: "Chile" },
  { iata: "BOG", name: "El Dorado International", city: "Bogota", country: "Colombia" },
  { iata: "LIM", name: "Jorge Chavez International", city: "Lima", country: "Peru" },
  { iata: "UIO", name: "Mariscal Sucre International", city: "Quito", country: "Ecuador" },
  { iata: "MVD", name: "Carrasco International", city: "Montevideo", country: "Uruguay" },

  // United Kingdom & Ireland
  { iata: "LHR", name: "Heathrow", city: "London", country: "United Kingdom" },
  { iata: "LGW", name: "Gatwick", city: "London", country: "United Kingdom" },
  { iata: "STN", name: "Stansted", city: "London", country: "United Kingdom" },
  { iata: "MAN", name: "Manchester", city: "Manchester", country: "United Kingdom" },
  { iata: "EDI", name: "Edinburgh", city: "Edinburgh", country: "United Kingdom" },
  { iata: "DUB", name: "Dublin", city: "Dublin", country: "Ireland" },

  // Western Europe
  { iata: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France" },
  { iata: "ORY", name: "Orly", city: "Paris", country: "France" },
  { iata: "NCE", name: "Nice Cote d'Azur", city: "Nice", country: "France" },
  { iata: "AMS", name: "Schiphol", city: "Amsterdam", country: "Netherlands" },
  { iata: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Germany" },
  { iata: "MUC", name: "Munich", city: "Munich", country: "Germany" },
  { iata: "BER", name: "Berlin Brandenburg", city: "Berlin", country: "Germany" },
  { iata: "ZRH", name: "Zurich", city: "Zurich", country: "Switzerland" },
  { iata: "GVA", name: "Geneva", city: "Geneva", country: "Switzerland" },
  { iata: "BRU", name: "Brussels", city: "Brussels", country: "Belgium" },
  { iata: "VIE", name: "Vienna International", city: "Vienna", country: "Austria" },

  // Southern Europe
  { iata: "MAD", name: "Adolfo Suarez Madrid-Barajas", city: "Madrid", country: "Spain" },
  { iata: "BCN", name: "Josep Tarradellas Barcelona-El Prat", city: "Barcelona", country: "Spain" },
  { iata: "AGP", name: "Malaga-Costa del Sol", city: "Malaga", country: "Spain" },
  { iata: "PMI", name: "Palma de Mallorca", city: "Palma de Mallorca", country: "Spain" },
  { iata: "LIS", name: "Humberto Delgado", city: "Lisbon", country: "Portugal" },
  { iata: "FCO", name: "Leonardo da Vinci-Fiumicino", city: "Rome", country: "Italy" },
  { iata: "MXP", name: "Milan Malpensa", city: "Milan", country: "Italy" },
  { iata: "VCE", name: "Marco Polo", city: "Venice", country: "Italy" },
  { iata: "NAP", name: "Naples International", city: "Naples", country: "Italy" },
  { iata: "FLR", name: "Amerigo Vespucci", city: "Florence", country: "Italy" },
  { iata: "BGY", name: "Milan Bergamo", city: "Bergamo", country: "Italy" },
  { iata: "BLQ", name: "Guglielmo Marconi", city: "Bologna", country: "Italy" },
  { iata: "PSA", name: "Galileo Galilei", city: "Pisa", country: "Italy" },
  { iata: "CTA", name: "Catania-Fontanarossa", city: "Catania", country: "Italy" },
  { iata: "PMO", name: "Falcone-Borsellino", city: "Palermo", country: "Italy" },
  { iata: "TRN", name: "Turin Caselle", city: "Turin", country: "Italy" },
  { iata: "ATH", name: "Eleftherios Venizelos", city: "Athens", country: "Greece" },

  // Northern & Eastern Europe
  { iata: "CPH", name: "Copenhagen", city: "Copenhagen", country: "Denmark" },
  { iata: "ARN", name: "Stockholm Arlanda", city: "Stockholm", country: "Sweden" },
  { iata: "OSL", name: "Oslo Gardermoen", city: "Oslo", country: "Norway" },
  { iata: "HEL", name: "Helsinki-Vantaa", city: "Helsinki", country: "Finland" },
  { iata: "WAW", name: "Warsaw Chopin", city: "Warsaw", country: "Poland" },
  { iata: "PRG", name: "Vaclav Havel", city: "Prague", country: "Czech Republic" },
  { iata: "BUD", name: "Budapest Ferenc Liszt", city: "Budapest", country: "Hungary" },
  { iata: "OTP", name: "Henri Coanda", city: "Bucharest", country: "Romania" },

  // Turkey
  { iata: "IST", name: "Istanbul", city: "Istanbul", country: "Turkey" },
  { iata: "SAW", name: "Sabiha Gokcen", city: "Istanbul", country: "Turkey" },
  { iata: "AYT", name: "Antalya", city: "Antalya", country: "Turkey" },

  // Middle East
  { iata: "DXB", name: "Dubai International", city: "Dubai", country: "United Arab Emirates" },
  { iata: "AUH", name: "Abu Dhabi International", city: "Abu Dhabi", country: "United Arab Emirates" },
  { iata: "DOH", name: "Hamad International", city: "Doha", country: "Qatar" },
  { iata: "JED", name: "King Abdulaziz International", city: "Jeddah", country: "Saudi Arabia" },
  { iata: "RUH", name: "King Khalid International", city: "Riyadh", country: "Saudi Arabia" },
  { iata: "TLV", name: "Ben Gurion", city: "Tel Aviv", country: "Israel" },
  { iata: "AMM", name: "Queen Alia International", city: "Amman", country: "Jordan" },
  { iata: "BAH", name: "Bahrain International", city: "Manama", country: "Bahrain" },
  { iata: "MCT", name: "Muscat International", city: "Muscat", country: "Oman" },
  { iata: "KWI", name: "Kuwait International", city: "Kuwait City", country: "Kuwait" },

  // East Asia
  { iata: "NRT", name: "Narita International", city: "Tokyo", country: "Japan" },
  { iata: "HND", name: "Haneda", city: "Tokyo", country: "Japan" },
  { iata: "KIX", name: "Kansai International", city: "Osaka", country: "Japan" },
  { iata: "ICN", name: "Incheon International", city: "Seoul", country: "South Korea" },
  { iata: "PEK", name: "Beijing Capital International", city: "Beijing", country: "China" },
  { iata: "PKX", name: "Beijing Daxing International", city: "Beijing", country: "China" },
  { iata: "PVG", name: "Shanghai Pudong International", city: "Shanghai", country: "China" },
  { iata: "CAN", name: "Guangzhou Baiyun International", city: "Guangzhou", country: "China" },
  { iata: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "China" },
  { iata: "TPE", name: "Taiwan Taoyuan International", city: "Taipei", country: "Taiwan" },

  // Southeast Asia
  { iata: "SIN", name: "Changi", city: "Singapore", country: "Singapore" },
  { iata: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand" },
  { iata: "KUL", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia" },
  { iata: "CGK", name: "Soekarno-Hatta International", city: "Jakarta", country: "Indonesia" },
  { iata: "DPS", name: "Ngurah Rai International", city: "Bali", country: "Indonesia" },
  { iata: "MNL", name: "Ninoy Aquino International", city: "Manila", country: "Philippines" },
  { iata: "SGN", name: "Tan Son Nhat International", city: "Ho Chi Minh City", country: "Vietnam" },
  { iata: "HAN", name: "Noi Bai International", city: "Hanoi", country: "Vietnam" },
  { iata: "PNH", name: "Phnom Penh International", city: "Phnom Penh", country: "Cambodia" },
  { iata: "REP", name: "Siem Reap International", city: "Siem Reap", country: "Cambodia" },

  // South Asia
  { iata: "DEL", name: "Indira Gandhi International", city: "Delhi", country: "India" },
  { iata: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India" },
  { iata: "BLR", name: "Kempegowda International", city: "Bangalore", country: "India" },
  { iata: "MAA", name: "Chennai International", city: "Chennai", country: "India" },
  { iata: "HYD", name: "Rajiv Gandhi International", city: "Hyderabad", country: "India" },
  { iata: "CMB", name: "Bandaranaike International", city: "Colombo", country: "Sri Lanka" },
  { iata: "DAC", name: "Hazrat Shahjalal International", city: "Dhaka", country: "Bangladesh" },
  { iata: "KTM", name: "Tribhuvan International", city: "Kathmandu", country: "Nepal" },
  { iata: "MLE", name: "Velana International", city: "Male", country: "Maldives" },

  // Africa
  { iata: "JNB", name: "O.R. Tambo International", city: "Johannesburg", country: "South Africa" },
  { iata: "CPT", name: "Cape Town International", city: "Cape Town", country: "South Africa" },
  { iata: "CAI", name: "Cairo International", city: "Cairo", country: "Egypt" },
  { iata: "CMN", name: "Mohammed V International", city: "Casablanca", country: "Morocco" },
  { iata: "RAK", name: "Marrakech Menara", city: "Marrakech", country: "Morocco" },
  { iata: "NBO", name: "Jomo Kenyatta International", city: "Nairobi", country: "Kenya" },
  { iata: "ADD", name: "Bole International", city: "Addis Ababa", country: "Ethiopia" },
  { iata: "LOS", name: "Murtala Muhammed International", city: "Lagos", country: "Nigeria" },
  { iata: "ACC", name: "Kotoka International", city: "Accra", country: "Ghana" },
  { iata: "DSS", name: "Blaise Diagne International", city: "Dakar", country: "Senegal" },
  { iata: "DAR", name: "Julius Nyerere International", city: "Dar es Salaam", country: "Tanzania" },

  // Oceania
  { iata: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "Australia" },
  { iata: "MEL", name: "Melbourne Tullamarine", city: "Melbourne", country: "Australia" },
  { iata: "BNE", name: "Brisbane", city: "Brisbane", country: "Australia" },
  { iata: "PER", name: "Perth", city: "Perth", country: "Australia" },
  { iata: "AKL", name: "Auckland", city: "Auckland", country: "New Zealand" },
  { iata: "CHC", name: "Christchurch International", city: "Christchurch", country: "New Zealand" },
  { iata: "NAN", name: "Nadi International", city: "Nadi", country: "Fiji" },
  { iata: "PPT", name: "Faaa International", city: "Papeete", country: "French Polynesia" },
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
