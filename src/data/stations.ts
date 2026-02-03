export type Station = {
  code: string;
  name: string;
  city: string;
  country: string;
};

export const stations: Station[] = [
  // United States - Amtrak Major Hubs
  { code: "NYP", name: "New York Penn Station", city: "New York", country: "United States" },
  { code: "WAS", name: "Washington Union Station", city: "Washington", country: "United States" },
  { code: "CHI", name: "Chicago Union Station", city: "Chicago", country: "United States" },
  { code: "BOS", name: "Boston South Station", city: "Boston", country: "United States" },
  { code: "PHL", name: "Philadelphia 30th Street", city: "Philadelphia", country: "United States" },
  { code: "BWI", name: "BWI Marshall Airport Station", city: "Baltimore", country: "United States" },
  { code: "NWK", name: "Newark Penn Station", city: "Newark", country: "United States" },
  { code: "WIL", name: "Wilmington Station", city: "Wilmington", country: "United States" },
  { code: "PVD", name: "Providence Station", city: "Providence", country: "United States" },
  { code: "NHV", name: "New Haven Union Station", city: "New Haven", country: "United States" },
  { code: "ALB", name: "Albany-Rensselaer Station", city: "Albany", country: "United States" },
  { code: "RGH", name: "Raleigh Station", city: "Raleigh", country: "United States" },
  { code: "CLT", name: "Charlotte Station", city: "Charlotte", country: "United States" },
  { code: "ATL", name: "Atlanta Peachtree Station", city: "Atlanta", country: "United States" },
  { code: "NOL", name: "New Orleans Union Station", city: "New Orleans", country: "United States" },
  { code: "MIA", name: "Miami Station", city: "Miami", country: "United States" },
  { code: "ORL", name: "Orlando Station", city: "Orlando", country: "United States" },
  { code: "TPA", name: "Tampa Union Station", city: "Tampa", country: "United States" },
  { code: "DEN", name: "Denver Union Station", city: "Denver", country: "United States" },
  { code: "SEA", name: "Seattle King Street Station", city: "Seattle", country: "United States" },
  { code: "PDX", name: "Portland Union Station", city: "Portland", country: "United States" },
  { code: "EMY", name: "Los Angeles Union Station", city: "Los Angeles", country: "United States" },
  { code: "SFC", name: "San Francisco Ferry Building", city: "San Francisco", country: "United States" },
  { code: "SDG", name: "San Diego Santa Fe Depot", city: "San Diego", country: "United States" },
  { code: "SAC", name: "Sacramento Valley Station", city: "Sacramento", country: "United States" },
  { code: "MSP", name: "St. Paul Union Depot", city: "Minneapolis", country: "United States" },
  { code: "MKE", name: "Milwaukee Intermodal Station", city: "Milwaukee", country: "United States" },
  { code: "STL", name: "St. Louis Gateway Station", city: "St. Louis", country: "United States" },
  { code: "KCY", name: "Kansas City Union Station", city: "Kansas City", country: "United States" },
  { code: "PGH", name: "Pittsburgh Station", city: "Pittsburgh", country: "United States" },

  // United Kingdom
  { code: "STP", name: "London St Pancras International", city: "London", country: "United Kingdom" },
  { code: "KGX", name: "London King's Cross", city: "London", country: "United Kingdom" },
  { code: "EUS", name: "London Euston", city: "London", country: "United Kingdom" },
  { code: "PAD", name: "London Paddington", city: "London", country: "United Kingdom" },
  { code: "VIC", name: "London Victoria", city: "London", country: "United Kingdom" },
  { code: "WAT", name: "London Waterloo", city: "London", country: "United Kingdom" },
  { code: "LIV", name: "London Liverpool Street", city: "London", country: "United Kingdom" },
  { code: "EDB", name: "Edinburgh Waverley", city: "Edinburgh", country: "United Kingdom" },
  { code: "MAN", name: "Manchester Piccadilly", city: "Manchester", country: "United Kingdom" },
  { code: "BHM", name: "Birmingham New Street", city: "Birmingham", country: "United Kingdom" },
  { code: "LDS", name: "Leeds Station", city: "Leeds", country: "United Kingdom" },
  { code: "GLC", name: "Glasgow Central", city: "Glasgow", country: "United Kingdom" },
  { code: "BRI", name: "Bristol Temple Meads", city: "Bristol", country: "United Kingdom" },
  { code: "YRK", name: "York Station", city: "York", country: "United Kingdom" },
  { code: "NCL", name: "Newcastle Central", city: "Newcastle", country: "United Kingdom" },
  { code: "CDF", name: "Cardiff Central", city: "Cardiff", country: "United Kingdom" },

  // France
  { code: "PLY", name: "Paris Gare de Lyon", city: "Paris", country: "France" },
  { code: "PNO", name: "Paris Gare du Nord", city: "Paris", country: "France" },
  { code: "PMO", name: "Paris Montparnasse", city: "Paris", country: "France" },
  { code: "PES", name: "Paris Gare de l'Est", city: "Paris", country: "France" },
  { code: "PSL", name: "Paris Gare Saint-Lazare", city: "Paris", country: "France" },
  { code: "PAU", name: "Paris Gare d'Austerlitz", city: "Paris", country: "France" },
  { code: "LYS", name: "Lyon Part-Dieu", city: "Lyon", country: "France" },
  { code: "LYP", name: "Lyon Perrache", city: "Lyon", country: "France" },
  { code: "MRS", name: "Marseille Saint-Charles", city: "Marseille", country: "France" },
  { code: "NIC", name: "Nice Ville", city: "Nice", country: "France" },
  { code: "BDX", name: "Bordeaux Saint-Jean", city: "Bordeaux", country: "France" },
  { code: "TLS", name: "Toulouse Matabiau", city: "Toulouse", country: "France" },
  { code: "STR", name: "Strasbourg Gare Centrale", city: "Strasbourg", country: "France" },
  { code: "LIL", name: "Lille Europe", city: "Lille", country: "France" },
  { code: "NTS", name: "Nantes Gare", city: "Nantes", country: "France" },
  { code: "MPL", name: "Montpellier Saint-Roch", city: "Montpellier", country: "France" },
  { code: "AIX", name: "Aix-en-Provence TGV", city: "Aix-en-Provence", country: "France" },
  { code: "AVG", name: "Avignon TGV", city: "Avignon", country: "France" },

  // Germany
  { code: "BLS", name: "Berlin Hauptbahnhof", city: "Berlin", country: "Germany" },
  { code: "MHH", name: "Munich Hauptbahnhof", city: "Munich", country: "Germany" },
  { code: "FFT", name: "Frankfurt Hauptbahnhof", city: "Frankfurt", country: "Germany" },
  { code: "HHH", name: "Hamburg Hauptbahnhof", city: "Hamburg", country: "Germany" },
  { code: "KLN", name: "Cologne Hauptbahnhof", city: "Cologne", country: "Germany" },
  { code: "DUS", name: "Dusseldorf Hauptbahnhof", city: "Dusseldorf", country: "Germany" },
  { code: "STG", name: "Stuttgart Hauptbahnhof", city: "Stuttgart", country: "Germany" },
  { code: "HAN", name: "Hannover Hauptbahnhof", city: "Hannover", country: "Germany" },
  { code: "NRN", name: "Nuremberg Hauptbahnhof", city: "Nuremberg", country: "Germany" },
  { code: "LEJ", name: "Leipzig Hauptbahnhof", city: "Leipzig", country: "Germany" },
  { code: "DRS", name: "Dresden Hauptbahnhof", city: "Dresden", country: "Germany" },

  // Italy
  { code: "RMT", name: "Roma Termini", city: "Rome", country: "Italy" },
  { code: "MLC", name: "Milano Centrale", city: "Milan", country: "Italy" },
  { code: "FIS", name: "Firenze Santa Maria Novella", city: "Florence", country: "Italy" },
  { code: "VCE", name: "Venezia Santa Lucia", city: "Venice", country: "Italy" },
  { code: "NAP", name: "Napoli Centrale", city: "Naples", country: "Italy" },
  { code: "BOL", name: "Bologna Centrale", city: "Bologna", country: "Italy" },
  { code: "TRN", name: "Torino Porta Nuova", city: "Turin", country: "Italy" },
  { code: "VRN", name: "Verona Porta Nuova", city: "Verona", country: "Italy" },
  { code: "GEN", name: "Genova Piazza Principe", city: "Genoa", country: "Italy" },
  { code: "PIS", name: "Pisa Centrale", city: "Pisa", country: "Italy" },
  { code: "BAR", name: "Bari Centrale", city: "Bari", country: "Italy" },

  // Spain
  { code: "MAT", name: "Madrid Atocha", city: "Madrid", country: "Spain" },
  { code: "MAC", name: "Madrid Chamartin", city: "Madrid", country: "Spain" },
  { code: "BCS", name: "Barcelona Sants", city: "Barcelona", country: "Spain" },
  { code: "SVQ", name: "Sevilla Santa Justa", city: "Seville", country: "Spain" },
  { code: "VLC", name: "Valencia Joaquin Sorolla", city: "Valencia", country: "Spain" },
  { code: "MLG", name: "Malaga Maria Zambrano", city: "Malaga", country: "Spain" },
  { code: "ZAR", name: "Zaragoza Delicias", city: "Zaragoza", country: "Spain" },
  { code: "BIL", name: "Bilbao Abando", city: "Bilbao", country: "Spain" },
  { code: "ALI", name: "Alicante Terminal", city: "Alicante", country: "Spain" },
  { code: "COR", name: "Cordoba Central", city: "Cordoba", country: "Spain" },

  // Netherlands
  { code: "AMS", name: "Amsterdam Centraal", city: "Amsterdam", country: "Netherlands" },
  { code: "RTD", name: "Rotterdam Centraal", city: "Rotterdam", country: "Netherlands" },
  { code: "UTR", name: "Utrecht Centraal", city: "Utrecht", country: "Netherlands" },
  { code: "EIN", name: "Eindhoven Centraal", city: "Eindhoven", country: "Netherlands" },
  { code: "DHA", name: "Den Haag Centraal", city: "The Hague", country: "Netherlands" },

  // Belgium
  { code: "BRM", name: "Brussels Midi/Zuid", city: "Brussels", country: "Belgium" },
  { code: "BRC", name: "Brussels Central", city: "Brussels", country: "Belgium" },
  { code: "ANT", name: "Antwerp Central", city: "Antwerp", country: "Belgium" },
  { code: "GHT", name: "Ghent Sint-Pieters", city: "Ghent", country: "Belgium" },
  { code: "BRG", name: "Bruges Station", city: "Bruges", country: "Belgium" },

  // Switzerland
  { code: "ZRH", name: "Zurich Hauptbahnhof", city: "Zurich", country: "Switzerland" },
  { code: "GVA", name: "Geneva Cornavin", city: "Geneva", country: "Switzerland" },
  { code: "BRN", name: "Bern Hauptbahnhof", city: "Bern", country: "Switzerland" },
  { code: "BSL", name: "Basel SBB", city: "Basel", country: "Switzerland" },
  { code: "LSN", name: "Lausanne Gare", city: "Lausanne", country: "Switzerland" },
  { code: "LUZ", name: "Lucerne Station", city: "Lucerne", country: "Switzerland" },
  { code: "INT", name: "Interlaken Ost", city: "Interlaken", country: "Switzerland" },

  // Austria
  { code: "VIE", name: "Wien Hauptbahnhof", city: "Vienna", country: "Austria" },
  { code: "SBG", name: "Salzburg Hauptbahnhof", city: "Salzburg", country: "Austria" },
  { code: "IBK", name: "Innsbruck Hauptbahnhof", city: "Innsbruck", country: "Austria" },

  // Scandinavia
  { code: "STO", name: "Stockholm Central", city: "Stockholm", country: "Sweden" },
  { code: "GOT", name: "Gothenburg Central", city: "Gothenburg", country: "Sweden" },
  { code: "MAL", name: "Malmo Central", city: "Malmo", country: "Sweden" },
  { code: "CPH", name: "Copenhagen Central", city: "Copenhagen", country: "Denmark" },
  { code: "OSL", name: "Oslo Sentralstasjon", city: "Oslo", country: "Norway" },
  { code: "BGO", name: "Bergen Station", city: "Bergen", country: "Norway" },
  { code: "HEL", name: "Helsinki Central", city: "Helsinki", country: "Finland" },

  // Eastern Europe
  { code: "PRG", name: "Prague Hlavni Nadrazi", city: "Prague", country: "Czech Republic" },
  { code: "BUD", name: "Budapest Keleti", city: "Budapest", country: "Hungary" },
  { code: "WAW", name: "Warsaw Centralna", city: "Warsaw", country: "Poland" },
  { code: "KRK", name: "Krakow Glowny", city: "Krakow", country: "Poland" },
  { code: "BUC", name: "Bucharest Nord", city: "Bucharest", country: "Romania" },
  { code: "ZAG", name: "Zagreb Glavni Kolodvor", city: "Zagreb", country: "Croatia" },
  { code: "LJB", name: "Ljubljana Station", city: "Ljubljana", country: "Slovenia" },

  // Portugal & Ireland
  { code: "LIS", name: "Lisbon Santa Apolonia", city: "Lisbon", country: "Portugal" },
  { code: "LIO", name: "Lisbon Oriente", city: "Lisbon", country: "Portugal" },
  { code: "OPO", name: "Porto Campanha", city: "Porto", country: "Portugal" },
  { code: "DUB", name: "Dublin Connolly", city: "Dublin", country: "Ireland" },
  { code: "DHP", name: "Dublin Heuston", city: "Dublin", country: "Ireland" },

  // Major Ferry Terminals
  { code: "DVR", name: "Dover Ferry Terminal", city: "Dover", country: "United Kingdom" },
  { code: "CAL", name: "Calais Ferry Terminal", city: "Calais", country: "France" },
  { code: "PIR", name: "Piraeus Port", city: "Athens", country: "Greece" },
  { code: "CIV", name: "Civitavecchia Port", city: "Rome", country: "Italy" },
  { code: "HEI", name: "Helsinki Olympia Terminal", city: "Helsinki", country: "Finland" },
  { code: "TAL", name: "Tallinn D-Terminal", city: "Tallinn", country: "Estonia" },
  { code: "STH", name: "Stockholm Vartahamnen", city: "Stockholm", country: "Sweden" },
  { code: "HLG", name: "Helsingborg Ferry Terminal", city: "Helsingborg", country: "Sweden" },
  { code: "HLS", name: "Helsingor Ferry Terminal", city: "Helsingor", country: "Denmark" },
  { code: "SPL", name: "Split Ferry Terminal", city: "Split", country: "Croatia" },
  { code: "DBK", name: "Dubrovnik Ferry Terminal", city: "Dubrovnik", country: "Croatia" },
  { code: "NPC", name: "Naples Molo Beverello", city: "Naples", country: "Italy" },
  { code: "OLB", name: "Olbia Ferry Terminal", city: "Olbia", country: "Italy" },
  { code: "PMF", name: "Palma Ferry Terminal", city: "Palma de Mallorca", country: "Spain" },
  { code: "IBF", name: "Ibiza Ferry Terminal", city: "Ibiza", country: "Spain" },
  { code: "TGR", name: "Tangier Med Port", city: "Tangier", country: "Morocco" },
  { code: "ALG", name: "Algeciras Ferry Terminal", city: "Algeciras", country: "Spain" },
];

// Pre-computed lowercase search index for performance
type StationIndex = {
  station: Station;
  codeLower: string;
  nameLower: string;
  cityLower: string;
  countryLower: string;
};

const searchIndex: StationIndex[] = stations.map((station) => ({
  station,
  codeLower: station.code.toLowerCase(),
  nameLower: station.name.toLowerCase(),
  cityLower: station.city.toLowerCase(),
  countryLower: station.country.toLowerCase(),
}));

export function searchStations(query: string, limit = 8): Station[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const exactCode: Station[] = [];
  const startsWithCode: Station[] = [];
  const substringMatches: Station[] = [];

  for (const entry of searchIndex) {
    if (entry.codeLower === q) {
      exactCode.push(entry.station);
    } else if (entry.codeLower.startsWith(q)) {
      startsWithCode.push(entry.station);
    } else if (
      entry.codeLower.includes(q) ||
      entry.nameLower.includes(q) ||
      entry.cityLower.includes(q) ||
      entry.countryLower.includes(q)
    ) {
      substringMatches.push(entry.station);
    }
  }

  return [...exactCode, ...startsWithCode, ...substringMatches].slice(0, limit);
}
