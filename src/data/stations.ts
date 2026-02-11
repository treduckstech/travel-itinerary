export type Station = {
  code: string;
  name: string;
  city: string;
  country: string;
  tz: string;
};

export const stations: Station[] = [
  // United States - Amtrak Major Hubs
  { code: "NYP", name: "New York Penn Station", city: "New York", country: "United States", tz: "America/New_York" },
  { code: "WAS", name: "Washington Union Station", city: "Washington", country: "United States", tz: "America/New_York" },
  { code: "CHI", name: "Chicago Union Station", city: "Chicago", country: "United States", tz: "America/Chicago" },
  { code: "BOS", name: "Boston South Station", city: "Boston", country: "United States", tz: "America/New_York" },
  { code: "PHL", name: "Philadelphia 30th Street", city: "Philadelphia", country: "United States", tz: "America/New_York" },
  { code: "BWI", name: "BWI Marshall Airport Station", city: "Baltimore", country: "United States", tz: "America/New_York" },
  { code: "NWK", name: "Newark Penn Station", city: "Newark", country: "United States", tz: "America/New_York" },
  { code: "WIL", name: "Wilmington Station", city: "Wilmington", country: "United States", tz: "America/New_York" },
  { code: "PVD", name: "Providence Station", city: "Providence", country: "United States", tz: "America/New_York" },
  { code: "NHV", name: "New Haven Union Station", city: "New Haven", country: "United States", tz: "America/New_York" },
  { code: "ALB", name: "Albany-Rensselaer Station", city: "Albany", country: "United States", tz: "America/New_York" },
  { code: "RGH", name: "Raleigh Station", city: "Raleigh", country: "United States", tz: "America/New_York" },
  { code: "CLT", name: "Charlotte Station", city: "Charlotte", country: "United States", tz: "America/New_York" },
  { code: "ATL", name: "Atlanta Peachtree Station", city: "Atlanta", country: "United States", tz: "America/New_York" },
  { code: "NOL", name: "New Orleans Union Station", city: "New Orleans", country: "United States", tz: "America/Chicago" },
  { code: "MIA", name: "Miami Station", city: "Miami", country: "United States", tz: "America/New_York" },
  { code: "ORL", name: "Orlando Station", city: "Orlando", country: "United States", tz: "America/New_York" },
  { code: "TPA", name: "Tampa Union Station", city: "Tampa", country: "United States", tz: "America/New_York" },
  { code: "DEN", name: "Denver Union Station", city: "Denver", country: "United States", tz: "America/Denver" },
  { code: "SEA", name: "Seattle King Street Station", city: "Seattle", country: "United States", tz: "America/Los_Angeles" },
  { code: "PDX", name: "Portland Union Station", city: "Portland", country: "United States", tz: "America/Los_Angeles" },
  { code: "EMY", name: "Los Angeles Union Station", city: "Los Angeles", country: "United States", tz: "America/Los_Angeles" },
  { code: "SFC", name: "San Francisco Ferry Building", city: "San Francisco", country: "United States", tz: "America/Los_Angeles" },
  { code: "SDG", name: "San Diego Santa Fe Depot", city: "San Diego", country: "United States", tz: "America/Los_Angeles" },
  { code: "SAC", name: "Sacramento Valley Station", city: "Sacramento", country: "United States", tz: "America/Los_Angeles" },
  { code: "MSP", name: "St. Paul Union Depot", city: "Minneapolis", country: "United States", tz: "America/Chicago" },
  { code: "MKE", name: "Milwaukee Intermodal Station", city: "Milwaukee", country: "United States", tz: "America/Chicago" },
  { code: "STL", name: "St. Louis Gateway Station", city: "St. Louis", country: "United States", tz: "America/Chicago" },
  { code: "KCY", name: "Kansas City Union Station", city: "Kansas City", country: "United States", tz: "America/Chicago" },
  { code: "PGH", name: "Pittsburgh Station", city: "Pittsburgh", country: "United States", tz: "America/New_York" },

  // United Kingdom
  { code: "STP", name: "London St Pancras International", city: "London", country: "United Kingdom", tz: "Europe/London" },
  { code: "KGX", name: "London King's Cross", city: "London", country: "United Kingdom", tz: "Europe/London" },
  { code: "EUS", name: "London Euston", city: "London", country: "United Kingdom", tz: "Europe/London" },
  { code: "PAD", name: "London Paddington", city: "London", country: "United Kingdom", tz: "Europe/London" },
  { code: "VIC", name: "London Victoria", city: "London", country: "United Kingdom", tz: "Europe/London" },
  { code: "WAT", name: "London Waterloo", city: "London", country: "United Kingdom", tz: "Europe/London" },
  { code: "LIV", name: "London Liverpool Street", city: "London", country: "United Kingdom", tz: "Europe/London" },
  { code: "EDB", name: "Edinburgh Waverley", city: "Edinburgh", country: "United Kingdom", tz: "Europe/London" },
  { code: "MAN", name: "Manchester Piccadilly", city: "Manchester", country: "United Kingdom", tz: "Europe/London" },
  { code: "BHM", name: "Birmingham New Street", city: "Birmingham", country: "United Kingdom", tz: "Europe/London" },
  { code: "LDS", name: "Leeds Station", city: "Leeds", country: "United Kingdom", tz: "Europe/London" },
  { code: "GLC", name: "Glasgow Central", city: "Glasgow", country: "United Kingdom", tz: "Europe/London" },
  { code: "BRI", name: "Bristol Temple Meads", city: "Bristol", country: "United Kingdom", tz: "Europe/London" },
  { code: "YRK", name: "York Station", city: "York", country: "United Kingdom", tz: "Europe/London" },
  { code: "NCL", name: "Newcastle Central", city: "Newcastle", country: "United Kingdom", tz: "Europe/London" },
  { code: "CDF", name: "Cardiff Central", city: "Cardiff", country: "United Kingdom", tz: "Europe/London" },

  // France
  { code: "PLY", name: "Paris Gare de Lyon", city: "Paris", country: "France", tz: "Europe/Paris" },
  { code: "PNO", name: "Paris Gare du Nord", city: "Paris", country: "France", tz: "Europe/Paris" },
  { code: "PMO", name: "Paris Montparnasse", city: "Paris", country: "France", tz: "Europe/Paris" },
  { code: "PES", name: "Paris Gare de l'Est", city: "Paris", country: "France", tz: "Europe/Paris" },
  { code: "PSL", name: "Paris Gare Saint-Lazare", city: "Paris", country: "France", tz: "Europe/Paris" },
  { code: "PAU", name: "Paris Gare d'Austerlitz", city: "Paris", country: "France", tz: "Europe/Paris" },
  { code: "LYS", name: "Lyon Part-Dieu", city: "Lyon", country: "France", tz: "Europe/Paris" },
  { code: "LYP", name: "Lyon Perrache", city: "Lyon", country: "France", tz: "Europe/Paris" },
  { code: "MRS", name: "Marseille Saint-Charles", city: "Marseille", country: "France", tz: "Europe/Paris" },
  { code: "NIC", name: "Nice Ville", city: "Nice", country: "France", tz: "Europe/Paris" },
  { code: "BDX", name: "Bordeaux Saint-Jean", city: "Bordeaux", country: "France", tz: "Europe/Paris" },
  { code: "TLS", name: "Toulouse Matabiau", city: "Toulouse", country: "France", tz: "Europe/Paris" },
  { code: "STR", name: "Strasbourg Gare Centrale", city: "Strasbourg", country: "France", tz: "Europe/Paris" },
  { code: "LIL", name: "Lille Europe", city: "Lille", country: "France", tz: "Europe/Paris" },
  { code: "NTS", name: "Nantes Gare", city: "Nantes", country: "France", tz: "Europe/Paris" },
  { code: "MPL", name: "Montpellier Saint-Roch", city: "Montpellier", country: "France", tz: "Europe/Paris" },
  { code: "AIX", name: "Aix-en-Provence TGV", city: "Aix-en-Provence", country: "France", tz: "Europe/Paris" },
  { code: "AVG", name: "Avignon TGV", city: "Avignon", country: "France", tz: "Europe/Paris" },

  // Germany
  { code: "BLS", name: "Berlin Hauptbahnhof", city: "Berlin", country: "Germany", tz: "Europe/Berlin" },
  { code: "MHH", name: "Munich Hauptbahnhof", city: "Munich", country: "Germany", tz: "Europe/Berlin" },
  { code: "FFT", name: "Frankfurt Hauptbahnhof", city: "Frankfurt", country: "Germany", tz: "Europe/Berlin" },
  { code: "HHH", name: "Hamburg Hauptbahnhof", city: "Hamburg", country: "Germany", tz: "Europe/Berlin" },
  { code: "KLN", name: "Cologne Hauptbahnhof", city: "Cologne", country: "Germany", tz: "Europe/Berlin" },
  { code: "DUS", name: "Dusseldorf Hauptbahnhof", city: "Dusseldorf", country: "Germany", tz: "Europe/Berlin" },
  { code: "STG", name: "Stuttgart Hauptbahnhof", city: "Stuttgart", country: "Germany", tz: "Europe/Berlin" },
  { code: "HAN", name: "Hannover Hauptbahnhof", city: "Hannover", country: "Germany", tz: "Europe/Berlin" },
  { code: "NRN", name: "Nuremberg Hauptbahnhof", city: "Nuremberg", country: "Germany", tz: "Europe/Berlin" },
  { code: "LEJ", name: "Leipzig Hauptbahnhof", city: "Leipzig", country: "Germany", tz: "Europe/Berlin" },
  { code: "DRS", name: "Dresden Hauptbahnhof", city: "Dresden", country: "Germany", tz: "Europe/Berlin" },

  // Italy
  { code: "RMT", name: "Roma Termini", city: "Rome", country: "Italy", tz: "Europe/Rome" },
  { code: "MLC", name: "Milano Centrale", city: "Milan", country: "Italy", tz: "Europe/Rome" },
  { code: "FIS", name: "Firenze Santa Maria Novella", city: "Florence", country: "Italy", tz: "Europe/Rome" },
  { code: "VCE", name: "Venezia Santa Lucia", city: "Venice", country: "Italy", tz: "Europe/Rome" },
  { code: "NAP", name: "Napoli Centrale", city: "Naples", country: "Italy", tz: "Europe/Rome" },
  { code: "BOL", name: "Bologna Centrale", city: "Bologna", country: "Italy", tz: "Europe/Rome" },
  { code: "TRN", name: "Torino Porta Nuova", city: "Turin", country: "Italy", tz: "Europe/Rome" },
  { code: "VRN", name: "Verona Porta Nuova", city: "Verona", country: "Italy", tz: "Europe/Rome" },
  { code: "GEN", name: "Genova Piazza Principe", city: "Genoa", country: "Italy", tz: "Europe/Rome" },
  { code: "PIS", name: "Pisa Centrale", city: "Pisa", country: "Italy", tz: "Europe/Rome" },
  { code: "BAR", name: "Bari Centrale", city: "Bari", country: "Italy", tz: "Europe/Rome" },
  { code: "PLR", name: "Palermo Centrale", city: "Palermo", country: "Italy", tz: "Europe/Rome" },
  { code: "CAT", name: "Catania Centrale", city: "Catania", country: "Italy", tz: "Europe/Rome" },
  { code: "PDV", name: "Padova Centrale", city: "Padua", country: "Italy", tz: "Europe/Rome" },
  { code: "TRS", name: "Trieste Centrale", city: "Trieste", country: "Italy", tz: "Europe/Rome" },
  { code: "SLR", name: "Salerno Stazione", city: "Salerno", country: "Italy", tz: "Europe/Rome" },
  { code: "PGI", name: "Perugia Fontivegge", city: "Perugia", country: "Italy", tz: "Europe/Rome" },
  { code: "RGC", name: "Reggio Calabria Centrale", city: "Reggio Calabria", country: "Italy", tz: "Europe/Rome" },
  { code: "BRE", name: "Brescia Stazione", city: "Brescia", country: "Italy", tz: "Europe/Rome" },
  { code: "FRR", name: "Ferrara Stazione", city: "Ferrara", country: "Italy", tz: "Europe/Rome" },
  { code: "CMS", name: "Como San Giovanni", city: "Como", country: "Italy", tz: "Europe/Rome" },
  { code: "VRE", name: "Varenna-Esino", city: "Varenna", country: "Italy", tz: "Europe/Rome" },
  { code: "LCC", name: "Lecco Stazione", city: "Lecco", country: "Italy", tz: "Europe/Rome" },
  { code: "SPZ", name: "La Spezia Centrale", city: "La Spezia", country: "Italy", tz: "Europe/Rome" },
  { code: "MGR", name: "Monterosso al Mare", city: "Monterosso", country: "Italy", tz: "Europe/Rome" },
  { code: "VNZ", name: "Vernazza", city: "Vernazza", country: "Italy", tz: "Europe/Rome" },
  { code: "CRN", name: "Corniglia", city: "Corniglia", country: "Italy", tz: "Europe/Rome" },
  { code: "MNR", name: "Manarola", city: "Manarola", country: "Italy", tz: "Europe/Rome" },
  { code: "RMG", name: "Riomaggiore", city: "Riomaggiore", country: "Italy", tz: "Europe/Rome" },
  { code: "SNA", name: "Siena Stazione", city: "Siena", country: "Italy", tz: "Europe/Rome" },
  { code: "RMO", name: "Roma Ostiense", city: "Rome", country: "Italy", tz: "Europe/Rome" },
  { code: "RMT2", name: "Roma Tiburtina", city: "Rome", country: "Italy", tz: "Europe/Rome" },

  // Spain
  { code: "MAT", name: "Madrid Atocha", city: "Madrid", country: "Spain", tz: "Europe/Madrid" },
  { code: "MAC", name: "Madrid Chamartin", city: "Madrid", country: "Spain", tz: "Europe/Madrid" },
  { code: "BCS", name: "Barcelona Sants", city: "Barcelona", country: "Spain", tz: "Europe/Madrid" },
  { code: "SVQ", name: "Sevilla Santa Justa", city: "Seville", country: "Spain", tz: "Europe/Madrid" },
  { code: "VLC", name: "Valencia Joaquin Sorolla", city: "Valencia", country: "Spain", tz: "Europe/Madrid" },
  { code: "MLG", name: "Malaga Maria Zambrano", city: "Malaga", country: "Spain", tz: "Europe/Madrid" },
  { code: "ZAR", name: "Zaragoza Delicias", city: "Zaragoza", country: "Spain", tz: "Europe/Madrid" },
  { code: "BIL", name: "Bilbao Abando", city: "Bilbao", country: "Spain", tz: "Europe/Madrid" },
  { code: "ALI", name: "Alicante Terminal", city: "Alicante", country: "Spain", tz: "Europe/Madrid" },
  { code: "COR", name: "Cordoba Central", city: "Cordoba", country: "Spain", tz: "Europe/Madrid" },

  // Netherlands
  { code: "AMS", name: "Amsterdam Centraal", city: "Amsterdam", country: "Netherlands", tz: "Europe/Amsterdam" },
  { code: "RTD", name: "Rotterdam Centraal", city: "Rotterdam", country: "Netherlands", tz: "Europe/Amsterdam" },
  { code: "UTR", name: "Utrecht Centraal", city: "Utrecht", country: "Netherlands", tz: "Europe/Amsterdam" },
  { code: "EIN", name: "Eindhoven Centraal", city: "Eindhoven", country: "Netherlands", tz: "Europe/Amsterdam" },
  { code: "DHA", name: "Den Haag Centraal", city: "The Hague", country: "Netherlands", tz: "Europe/Amsterdam" },

  // Belgium
  { code: "BRM", name: "Brussels Midi/Zuid", city: "Brussels", country: "Belgium", tz: "Europe/Brussels" },
  { code: "BRC", name: "Brussels Central", city: "Brussels", country: "Belgium", tz: "Europe/Brussels" },
  { code: "ANT", name: "Antwerp Central", city: "Antwerp", country: "Belgium", tz: "Europe/Brussels" },
  { code: "GHT", name: "Ghent Sint-Pieters", city: "Ghent", country: "Belgium", tz: "Europe/Brussels" },
  { code: "BRG", name: "Bruges Station", city: "Bruges", country: "Belgium", tz: "Europe/Brussels" },

  // Switzerland
  { code: "ZRH", name: "Zurich Hauptbahnhof", city: "Zurich", country: "Switzerland", tz: "Europe/Zurich" },
  { code: "GVA", name: "Geneva Cornavin", city: "Geneva", country: "Switzerland", tz: "Europe/Zurich" },
  { code: "BRN", name: "Bern Hauptbahnhof", city: "Bern", country: "Switzerland", tz: "Europe/Zurich" },
  { code: "BSL", name: "Basel SBB", city: "Basel", country: "Switzerland", tz: "Europe/Zurich" },
  { code: "LSN", name: "Lausanne Gare", city: "Lausanne", country: "Switzerland", tz: "Europe/Zurich" },
  { code: "LUZ", name: "Lucerne Station", city: "Lucerne", country: "Switzerland", tz: "Europe/Zurich" },
  { code: "INT", name: "Interlaken Ost", city: "Interlaken", country: "Switzerland", tz: "Europe/Zurich" },

  // Austria
  { code: "VIE", name: "Wien Hauptbahnhof", city: "Vienna", country: "Austria", tz: "Europe/Vienna" },
  { code: "SBG", name: "Salzburg Hauptbahnhof", city: "Salzburg", country: "Austria", tz: "Europe/Vienna" },
  { code: "IBK", name: "Innsbruck Hauptbahnhof", city: "Innsbruck", country: "Austria", tz: "Europe/Vienna" },

  // Scandinavia
  { code: "STO", name: "Stockholm Central", city: "Stockholm", country: "Sweden", tz: "Europe/Stockholm" },
  { code: "GOT", name: "Gothenburg Central", city: "Gothenburg", country: "Sweden", tz: "Europe/Stockholm" },
  { code: "MAL", name: "Malmo Central", city: "Malmo", country: "Sweden", tz: "Europe/Stockholm" },
  { code: "CPH", name: "Copenhagen Central", city: "Copenhagen", country: "Denmark", tz: "Europe/Copenhagen" },
  { code: "OSL", name: "Oslo Sentralstasjon", city: "Oslo", country: "Norway", tz: "Europe/Oslo" },
  { code: "BGO", name: "Bergen Station", city: "Bergen", country: "Norway", tz: "Europe/Oslo" },
  { code: "HEL", name: "Helsinki Central", city: "Helsinki", country: "Finland", tz: "Europe/Helsinki" },

  // Eastern Europe
  { code: "PRG", name: "Prague Hlavni Nadrazi", city: "Prague", country: "Czech Republic", tz: "Europe/Prague" },
  { code: "BUD", name: "Budapest Keleti", city: "Budapest", country: "Hungary", tz: "Europe/Budapest" },
  { code: "WAW", name: "Warsaw Centralna", city: "Warsaw", country: "Poland", tz: "Europe/Warsaw" },
  { code: "KRK", name: "Krakow Glowny", city: "Krakow", country: "Poland", tz: "Europe/Warsaw" },
  { code: "BUC", name: "Bucharest Nord", city: "Bucharest", country: "Romania", tz: "Europe/Bucharest" },
  { code: "ZAG", name: "Zagreb Glavni Kolodvor", city: "Zagreb", country: "Croatia", tz: "Europe/Zagreb" },
  { code: "LJB", name: "Ljubljana Station", city: "Ljubljana", country: "Slovenia", tz: "Europe/Ljubljana" },

  // Portugal & Ireland
  { code: "LIS", name: "Lisbon Santa Apolonia", city: "Lisbon", country: "Portugal", tz: "Europe/Lisbon" },
  { code: "LIO", name: "Lisbon Oriente", city: "Lisbon", country: "Portugal", tz: "Europe/Lisbon" },
  { code: "OPO", name: "Porto Campanha", city: "Porto", country: "Portugal", tz: "Europe/Lisbon" },
  { code: "DUB", name: "Dublin Connolly", city: "Dublin", country: "Ireland", tz: "Europe/Dublin" },
  { code: "DHP", name: "Dublin Heuston", city: "Dublin", country: "Ireland", tz: "Europe/Dublin" },

  // Major Ferry Terminals
  { code: "DVR", name: "Dover Ferry Terminal", city: "Dover", country: "United Kingdom", tz: "Europe/London" },
  { code: "CAL", name: "Calais Ferry Terminal", city: "Calais", country: "France", tz: "Europe/Paris" },
  { code: "PIR", name: "Piraeus Port", city: "Athens", country: "Greece", tz: "Europe/Athens" },
  { code: "CIV", name: "Civitavecchia Port", city: "Rome", country: "Italy", tz: "Europe/Rome" },
  { code: "HEI", name: "Helsinki Olympia Terminal", city: "Helsinki", country: "Finland", tz: "Europe/Helsinki" },
  { code: "TAL", name: "Tallinn D-Terminal", city: "Tallinn", country: "Estonia", tz: "Europe/Tallinn" },
  { code: "STH", name: "Stockholm Vartahamnen", city: "Stockholm", country: "Sweden", tz: "Europe/Stockholm" },
  { code: "HLG", name: "Helsingborg Ferry Terminal", city: "Helsingborg", country: "Sweden", tz: "Europe/Stockholm" },
  { code: "HLS", name: "Helsingor Ferry Terminal", city: "Helsingor", country: "Denmark", tz: "Europe/Copenhagen" },
  { code: "SPL", name: "Split Ferry Terminal", city: "Split", country: "Croatia", tz: "Europe/Zagreb" },
  { code: "DBK", name: "Dubrovnik Ferry Terminal", city: "Dubrovnik", country: "Croatia", tz: "Europe/Zagreb" },
  { code: "NPC", name: "Naples Molo Beverello", city: "Naples", country: "Italy", tz: "Europe/Rome" },
  { code: "OLB", name: "Olbia Ferry Terminal", city: "Olbia", country: "Italy", tz: "Europe/Rome" },
  { code: "PMF", name: "Palma Ferry Terminal", city: "Palma de Mallorca", country: "Spain", tz: "Europe/Madrid" },
  { code: "IBF", name: "Ibiza Ferry Terminal", city: "Ibiza", country: "Spain", tz: "Europe/Madrid" },
  { code: "TGR", name: "Tangier Med Port", city: "Tangier", country: "Morocco", tz: "Africa/Casablanca" },
  { code: "ALG", name: "Algeciras Ferry Terminal", city: "Algeciras", country: "Spain", tz: "Europe/Madrid" },
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
