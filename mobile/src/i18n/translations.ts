export type Language = 'en' | 'fil' | 'bik';

export interface Translations {
  // Header
  appName: string;
  appTagline: string;

  // Navigation
  navHome: string;
  navMap: string;
  navEvacuation: string;
  navSafety: string;

  // Alert Card
  volcanoAlertLevel: string;
  updated: string;
  source: string;
  lastSynced: string;
  refreshAlert: string;
  normal: string;
  hazardous: string;

  // Status Card
  status: string;
  distanceFromMayon: string;
  insidePDZ: string;
  outsidePDZ: string;
  searchedLocation: string;

  // Location Search
  searchByAddress: string;
  search: string;
  coordinates: string;
  searchCoordinates: string;
  clearSearch: string;

  // Evacuation
  evacuationCenters: string;
  lastSyncedColon: string;
  noCentersFound: string;

  // Evacuation Types
  shelter: string;
  school: string;
  hospital: string;
  government: string;

  // Route
  routeDetails: string;
  distance: string;
  duration: string;
  clearRoute: string;

  // Safety
  safetyInformation: string;
  safetyPrecautions: string;
  beReadyToEvacuate: string;
  beforeEruption: string;
  duringEvacuation: string;
  volcanicHazards: string;
  emergencyKit: string;
  stayInformed: string;
  emergencyContacts: string;

  // Safety Tips Content
  tipsBefore: string[];
  tipsDuring: string[];
  tipsHazards: string[];
  tipsKit: string[];

  // Offline
  downloadOfflineMap: string;
  offlineMode: string;
  onlineMode: string;
  offlineMapCached: string;
  downloadingTiles: string;

  // SOS
  sos: string;
  emergencySOS: string;
  sosCall911: string;
  sosCall911Desc: string;
  sosCallObservatory: string;
  sosCallObservatoryDesc: string;
  sosShareLocation: string;
  sosShareLocationDesc: string;
  sosNavigate: string;
  sosNavigateDesc: string;
  sosLocationMessage: string;
  sosLocationUnavailable: string;
  sosNoNearbyCenter: string;

  // Language
  language: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Ligtas Mayon',
    appTagline: 'Safety Monitoring',

    navHome: 'Home',
    navMap: 'Map',
    navEvacuation: 'Evacuation',
    navSafety: 'Safety',

    volcanoAlertLevel: 'Volcano Alert Level',
    updated: 'Updated',
    source: 'Source',
    lastSynced: 'Last synced',
    refreshAlert: 'Refresh Alert',
    normal: 'Normal',
    hazardous: 'Hazardous',

    status: 'Status',
    distanceFromMayon: 'Distance from Mayon',
    insidePDZ: 'Inside 6km PDZ',
    outsidePDZ: 'Outside 6km PDZ',
    searchedLocation: 'Searched location',

    searchByAddress: 'Search by address...',
    search: 'Search',
    coordinates: 'Coordinates (lat, lng)',
    searchCoordinates: 'Search Coordinates',
    clearSearch: 'Clear Search',

    evacuationCenters: 'Evacuation Centers',
    lastSyncedColon: 'Last synced:',
    noCentersFound: 'No evacuation centers found.',

    shelter: 'Shelter',
    school: 'School',
    hospital: 'Hospital',
    government: 'Government',

    routeDetails: 'Route Details',
    distance: 'Distance',
    duration: 'Duration',
    clearRoute: 'Clear Route',

    safetyInformation: 'Safety Information',
    safetyPrecautions: 'Safety Precautions',
    beReadyToEvacuate: 'Be ready to evacuate at any moment.',
    beforeEruption: 'Before an Eruption',
    duringEvacuation: 'During Evacuation',
    volcanicHazards: 'Volcanic Hazards',
    emergencyKit: 'Emergency Kit Essentials',
    stayInformed: 'Stay informed: Monitor PHIVOLCS bulletins and follow instructions from local authorities.',
    emergencyContacts: 'Emergency Contacts',

    tipsBefore: [
      'Know your evacuation routes and nearest evacuation centers',
      'Prepare an emergency kit with essentials for at least 3 days',
      'Keep important documents in a waterproof container',
      'Stay updated with PHIVOLCS bulletins and local advisories',
      'Know the alert levels and what each one means',
    ],
    tipsDuring: [
      'Follow official evacuation orders immediately',
      'Use designated evacuation routes only',
      'Bring your emergency kit and important documents',
      'Help elderly, children, and persons with disabilities',
      'Do not attempt to cross bridges covered by lahar',
      'Stay calm and avoid panic',
    ],
    tipsHazards: [
      'Pyroclastic flows: Extremely hot and fast-moving - evacuate immediately',
      'Ashfall: Wear N95 masks, protect eyes, stay indoors when heavy',
      'Lahar: Avoid river channels and low-lying areas during rain',
      'Lava flows: Move perpendicular to flow direction to escape',
      'Volcanic gases: Leave area if you smell sulfur or have difficulty breathing',
    ],
    tipsKit: [
      'Water (1 gallon per person per day for 3 days)',
      'Non-perishable food and manual can opener',
      'First aid kit and prescription medications',
      'Flashlight, batteries, and portable radio',
      'N95 masks, goggles, and protective clothing',
      'Cash, IDs, and important documents',
      'Phone charger and emergency contact list',
    ],

    sos: 'SOS',
    emergencySOS: 'Emergency SOS',
    sosCall911: 'Call 911',
    sosCall911Desc: 'Connect to emergency services',
    sosCallObservatory: 'Call Mayon Observatory',
    sosCallObservatoryDesc: 'PHIVOLCS Mayon Volcano Observatory',
    sosShareLocation: 'Share My Location',
    sosShareLocationDesc: 'Send your GPS coordinates to family or rescuers',
    sosNavigate: 'Navigate to Nearest Center',
    sosNavigateDesc: 'Open directions to the closest evacuation center',
    sosLocationMessage: 'I need help! My location:',
    sosLocationUnavailable: 'Location unavailable',
    sosNoNearbyCenter: 'No nearby centers found',

    downloadOfflineMap: 'Download Offline Map',
    offlineMode: 'Offline Mode',
    onlineMode: 'Online Mode',
    offlineMapCached: 'Offline map cached',
    downloadingTiles: 'Downloading tiles...',

    language: 'Language',
  },

  fil: {
    appName: 'Ligtas Mayon',
    appTagline: 'Pagsubaybay sa Kaligtasan',

    navHome: 'Home',
    navMap: 'Mapa',
    navEvacuation: 'Ebakwasyon',
    navSafety: 'Kaligtasan',

    volcanoAlertLevel: 'Antas ng Alerto sa Bulkan',
    updated: 'Na-update',
    source: 'Pinagmulan',
    lastSynced: 'Huling na-sync',
    refreshAlert: 'I-refresh ang Alerto',
    normal: 'Normal',
    hazardous: 'Mapanganib',

    status: 'Katayuan',
    distanceFromMayon: 'Distansya mula sa Mayon',
    insidePDZ: 'Nasa loob ng 6km PDZ',
    outsidePDZ: 'Nasa labas ng 6km PDZ',
    searchedLocation: 'Hinanap na lokasyon',

    searchByAddress: 'Maghanap ng address...',
    search: 'Hanapin',
    coordinates: 'Coordinates (lat, lng)',
    searchCoordinates: 'Hanapin ang Coordinates',
    clearSearch: 'Burahin ang Paghahanap',

    evacuationCenters: 'Mga Evacuation Center',
    lastSyncedColon: 'Huling na-sync:',
    noCentersFound: 'Walang nahanap na evacuation centers.',

    shelter: 'Shelter',
    school: 'Paaralan',
    hospital: 'Ospital',
    government: 'Pamahalaan',

    routeDetails: 'Detalye ng Ruta',
    distance: 'Distansya',
    duration: 'Tagal',
    clearRoute: 'Burahin ang Ruta',

    safetyInformation: 'Impormasyon sa Kaligtasan',
    safetyPrecautions: 'Mga Pag-iingat sa Kaligtasan',
    beReadyToEvacuate: 'Maging handa mag-evacuate anumang oras.',
    beforeEruption: 'Bago Mag-erupt',
    duringEvacuation: 'Habang Nag-e-evacuate',
    volcanicHazards: 'Mga Panganib sa Bulkan',
    emergencyKit: 'Mga Kailangan sa Emergency Kit',
    stayInformed: 'Manatiling updated: Subaybayan ang PHIVOLCS bulletins at sundin ang mga tagubilin ng local authorities.',
    emergencyContacts: 'Mga Emergency Contacts',

    tipsBefore: [
      'Alamin ang iyong evacuation routes at pinakamalapit na evacuation centers',
      'Maghanda ng emergency kit na may mga kailangan para sa 3 araw',
      'Itago ang mahahalagang dokumento sa waterproof na lalagyan',
      'Manatiling updated sa PHIVOLCS bulletins at local advisories',
      'Alamin ang mga alert levels at ang ibig sabihin ng bawat isa',
    ],
    tipsDuring: [
      'Sundin agad ang opisyal na evacuation orders',
      'Gamitin lamang ang mga itinalagang evacuation routes',
      'Dalhin ang emergency kit at mahahalagang dokumento',
      'Tulungan ang mga matatanda, bata, at may kapansanan',
      'Huwag sumubok tumawid sa mga tulay na may lahar',
      'Manatiling kalmado at iwasan ang panic',
    ],
    tipsHazards: [
      'Pyroclastic flows: Napakainit at mabilis - mag-evacuate agad',
      'Ashfall: Magsuot ng N95 masks, protektahan ang mata, manatili sa loob kapag mabigat',
      'Lahar: Iwasan ang mga river channels at mababang lugar kapag umuulan',
      'Lava flows: Gumalaw papalayo sa direksyon ng daloy',
      'Volcanic gases: Umalis sa lugar kapag may amoy sulfur o nahihirapan huminga',
    ],
    tipsKit: [
      'Tubig (1 gallon per tao kada araw para sa 3 araw)',
      'Non-perishable food at manual can opener',
      'First aid kit at mga gamot',
      'Flashlight, batteries, at portable radio',
      'N95 masks, goggles, at protective clothing',
      'Cash, IDs, at mahahalagang dokumento',
      'Phone charger at emergency contact list',
    ],

    sos: 'SOS',
    emergencySOS: 'Emergency SOS',
    sosCall911: 'Tumawag sa 911',
    sosCall911Desc: 'Kumonekta sa emergency services',
    sosCallObservatory: 'Tumawag sa Mayon Observatory',
    sosCallObservatoryDesc: 'PHIVOLCS Mayon Volcano Observatory',
    sosShareLocation: 'Ibahagi ang Lokasyon Ko',
    sosShareLocationDesc: 'Ipadala ang GPS coordinates sa pamilya o rescuers',
    sosNavigate: 'Pumunta sa Pinakamalapit na Center',
    sosNavigateDesc: 'Buksan ang direksyon papunta sa pinakamalapit na evacuation center',
    sosLocationMessage: 'Kailangan ko ng tulong! Ang lokasyon ko:',
    sosLocationUnavailable: 'Hindi available ang lokasyon',
    sosNoNearbyCenter: 'Walang malapit na centers',

    downloadOfflineMap: 'I-download ang Offline Map',
    offlineMode: 'Offline Mode',
    onlineMode: 'Online Mode',
    offlineMapCached: 'Naka-cache ang offline map',
    downloadingTiles: 'Nagda-download ng tiles...',

    language: 'Wika',
  },

  bik: {
    appName: 'Ligtas Mayon',
    appTagline: 'Pagbabantay sa Kaligtasan',

    navHome: 'Home',
    navMap: 'Mapa',
    navEvacuation: 'Ebakwasyon',
    navSafety: 'Kaligtasan',

    volcanoAlertLevel: 'Lebel nin Alerto sa Bulkan',
    updated: 'Na-update',
    source: 'Ginikanan',
    lastSynced: 'Huring na-sync',
    refreshAlert: 'I-refresh an Alerto',
    normal: 'Normal',
    hazardous: 'Delikado',

    status: 'Kamugtakan',
    distanceFromMayon: 'Distansya hali sa Mayon',
    insidePDZ: 'Yaon sa laog nin 6km PDZ',
    outsidePDZ: 'Yaon sa luwas nin 6km PDZ',
    searchedLocation: 'Hinanap na lokasyon',

    searchByAddress: 'Maghanap nin address...',
    search: 'Hanapon',
    coordinates: 'Coordinates (lat, lng)',
    searchCoordinates: 'Hanapon an Coordinates',
    clearSearch: 'Halion an Paghanap',

    evacuationCenters: 'Mga Evacuation Center',
    lastSyncedColon: 'Huring na-sync:',
    noCentersFound: 'Mayong nakuang evacuation centers.',

    shelter: 'Shelter',
    school: 'Eskwelahan',
    hospital: 'Ospital',
    government: 'Gobyerno',

    routeDetails: 'Detalye nin Ruta',
    distance: 'Distansya',
    duration: 'Kahaloy',
    clearRoute: 'Halion an Ruta',

    safetyInformation: 'Impormasyon sa Kaligtasan',
    safetyPrecautions: 'Mga Pag-iingat sa Kaligtasan',
    beReadyToEvacuate: 'Magin andam mag-evacuate arin man na oras.',
    beforeEruption: 'Bago Magbuto',
    duringEvacuation: 'Mantang Nag-e-evacuate',
    volcanicHazards: 'Mga Peligro sa Bulkan',
    emergencyKit: 'Mga Kaipuhan sa Emergency Kit',
    stayInformed: 'Magin updated: Bantayan an PHIVOLCS bulletins asin sunudon an mga instruksyon kan local authorities.',
    emergencyContacts: 'Mga Emergency Contacts',

    tipsBefore: [
      'Aramon an saimong evacuation routes asin pinakaharani na evacuation centers',
      'Mag-andam nin emergency kit na may mga kaipuhan para sa 3 aldaw',
      'Itago an mahahalagang dokumento sa waterproof na lalagyan',
      'Magin updated sa PHIVOLCS bulletins asin local advisories',
      'Aramon an mga alert levels asin an boot sabihon kan kada saro',
    ],
    tipsDuring: [
      'Sunudon tolos an opisyal na evacuation orders',
      'Gamiton sana an mga itinalaan na evacuation routes',
      'Darahon an emergency kit asin mahahalagang dokumento',
      'Tabangan an mga gurang, aki, asin may kapansanan',
      'Dai magprobar magtabok sa mga tulay na may lahar',
      'Magin kalmado asin likayan an panic',
    ],
    tipsHazards: [
      'Pyroclastic flows: Grabe kainit asin rikas - mag-evacuate tolos',
      'Ashfall: Magsulot nin N95 masks, protektaran an mata, magdanay sa laog kun grabe',
      'Lahar: Likayan an mga river channels asin hababa na lugar kun nag-uuran',
      'Lava flows: Maghiro paharayo sa direksyon kan daloy',
      'Volcanic gases: Maghali sa lugar kun may amoy sulfur o nasakitan maginhawa',
    ],
    tipsKit: [
      'Tubig (1 gallon per tawo kada aldaw para sa 3 aldaw)',
      'Non-perishable food asin manual can opener',
      'First aid kit asin mga bulong',
      'Flashlight, batteries, asin portable radio',
      'N95 masks, goggles, asin protective clothing',
      'Cash, IDs, asin mahahalagang dokumento',
      'Phone charger asin emergency contact list',
    ],

    sos: 'SOS',
    emergencySOS: 'Emergency SOS',
    sosCall911: 'Mag-apod sa 911',
    sosCall911Desc: 'Kumonektar sa emergency services',
    sosCallObservatory: 'Mag-apod sa Mayon Observatory',
    sosCallObservatoryDesc: 'PHIVOLCS Mayon Volcano Observatory',
    sosShareLocation: 'Ipaabot an Lokasyon Ko',
    sosShareLocationDesc: 'Ipadara an GPS coordinates sa pamilya o rescuers',
    sosNavigate: 'Magduman sa Pinakaharani na Center',
    sosNavigateDesc: 'Buksan an direksyon paduman sa pinakaharani na evacuation center',
    sosLocationMessage: 'Kaipuhan ko nin tabang! An lokasyon ko:',
    sosLocationUnavailable: 'Dai available an lokasyon',
    sosNoNearbyCenter: 'Mayong harani na centers',

    downloadOfflineMap: 'I-download an Offline Map',
    offlineMode: 'Offline Mode',
    onlineMode: 'Online Mode',
    offlineMapCached: 'Naka-cache an offline map',
    downloadingTiles: 'Nagda-download nin tiles...',

    language: 'Lengguahe',
  },
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  fil: 'Filipino',
  bik: 'Bikol',
};
