export type Language = "en" | "fil" | "bik";

export interface Translations {
    // Header
    appName: string;
    appTagline: string;
    alertLevel: string;
    alertLevelShort: string;

    // Navigation
    navMap: string;
    navEvacuation: string;
    navSafety: string;
    navEmergency: string;

    // Hero
    dashboardTitle: string;
    dashboardSubtitle: string;
    location: string;

    // Alert Card
    volcanoAlertLevel: string;
    unableToFetch: string;
    checkPhivolcs: string;
    loading: string;
    fetchingFromPhivolcs: string;
    updated: string;
    normal: string;
    hazardous: string;

    // Status Card
    yourLocation: string;
    searchedLocation: string;
    locating: string;
    acquiringLocation: string;
    error: string;
    danger: string;
    insidePDZ: string;
    safe: string;
    outsidePDZ: string;
    distance: string;
    fromCrater: string;

    // Location Search
    searchPlaceholder: string;
    searching: string;
    clearSearch: string;

    // Evacuation Panel
    evacuationCenters: string;
    foundNearby: string;
    loadingCenters: string;
    routeTo: string;
    clearSelection: string;
    calculatingRoute: string;
    getDirections: string;
    drive: string;
    enableLocation: string;
    noCentersFound: string;
    refresh: string;
    retry: string;

    // Evacuation Types
    shelter: string;
    school: string;
    hospital: string;
    government: string;

    // Safety Tips
    safetyPrecautions: string;
    stayPrepared: string;
    beReadyToEvacuate: string;
    beforeEruption: string;
    duringEvacuation: string;
    volcanicHazards: string;
    emergencyKit: string;
    stayInformed: string;
    monitorPhivolcs: string;

    // Safety Tips Content
    tipsBefore: string[];
    tipsDuring: string[];
    tipsHazards: string[];
    tipsKit: string[];

    // Footer
    emergencyContacts: string;
    hotline: string;
    website: string;
    nationalEmergency: string;
    redCross: string;
    locatedAt: string;
    allRightsReserved: string;
    followAdvisories: string;
    projectFrom: string;

    // Language
    language: string;
}

export const translations: Record<Language, Translations> = {
    en: {
        // Header
        appName: "Ligtas Mayon",
        appTagline: "Safety Monitoring",
        alertLevel: "Alert Level",
        alertLevelShort: "Lv.",

        // Navigation
        navMap: "Map",
        navEvacuation: "Evacuation",
        navSafety: "Safety Tips",
        navEmergency: "Emergency",

        // Hero
        dashboardTitle: "Stay Safe",
        dashboardSubtitle: "Monitor your proximity to Mayon Volcano's Permanent Danger Zone",
        location: "Albay, Philippines",

        // Alert Card
        volcanoAlertLevel: "Volcano Alert Level",
        unableToFetch: "Unable to fetch",
        checkPhivolcs: "Check PHIVOLCS directly",
        loading: "Loading...",
        fetchingFromPhivolcs: "Fetching from PHIVOLCS...",
        updated: "Updated",
        normal: "Normal",
        hazardous: "Hazardous",

        // Status Card
        yourLocation: "Your Location",
        searchedLocation: "Searched Location",
        locating: "Locating...",
        acquiringLocation: "Acquiring location...",
        error: "Error",
        danger: "DANGER",
        insidePDZ: "Inside 6km PDZ",
        safe: "Safe",
        outsidePDZ: "Outside PDZ",
        distance: "Distance",
        fromCrater: "from Crater",

        // Location Search
        searchPlaceholder: "Search location or enter coordinates...",
        searching: "Searching...",
        clearSearch: "Clear",

        // Evacuation Panel
        evacuationCenters: "Evacuation Centers",
        foundNearby: "found nearby",
        loadingCenters: "Loading evacuation centers...",
        routeTo: "Route to",
        clearSelection: "Clear selection",
        calculatingRoute: "Calculating route...",
        getDirections: "Get Directions in Google Maps",
        drive: "drive",
        enableLocation: "Enable location or search a place to get directions",
        noCentersFound: "No evacuation centers found",
        refresh: "Refresh",
        retry: "Retry",

        // Evacuation Types
        shelter: "Shelter",
        school: "School",
        hospital: "Hospital",
        government: "Government",

        // Safety Tips
        safetyPrecautions: "Safety Precautions",
        stayPrepared: "Stay prepared for volcanic emergencies",
        beReadyToEvacuate: "Be ready to evacuate at any moment",
        beforeEruption: "Before an Eruption",
        duringEvacuation: "During Evacuation",
        volcanicHazards: "Volcanic Hazards",
        emergencyKit: "Emergency Kit Essentials",
        stayInformed: "Stay informed:",
        monitorPhivolcs: "Monitor PHIVOLCS bulletins and follow instructions from local authorities.",

        // Safety Tips Content
        tipsBefore: [
            "Know your evacuation routes and nearest evacuation centers",
            "Prepare an emergency kit with essentials for at least 3 days",
            "Keep important documents in a waterproof container",
            "Stay updated with PHIVOLCS bulletins and local advisories",
            "Know the alert levels and what each one means",
        ],
        tipsDuring: [
            "Follow official evacuation orders immediately",
            "Use designated evacuation routes only",
            "Bring your emergency kit and important documents",
            "Help elderly, children, and persons with disabilities",
            "Do not attempt to cross bridges covered by lahar",
            "Stay calm and avoid panic",
        ],
        tipsHazards: [
            "Pyroclastic flows: Extremely hot and fast-moving - evacuate immediately",
            "Ashfall: Wear N95 masks, protect eyes, stay indoors when heavy",
            "Lahar: Avoid river channels and low-lying areas during rain",
            "Lava flows: Move perpendicular to flow direction to escape",
            "Volcanic gases: Leave area if you smell sulfur or have difficulty breathing",
        ],
        tipsKit: [
            "Water (1 gallon per person per day for 3 days)",
            "Non-perishable food and manual can opener",
            "First aid kit and prescription medications",
            "Flashlight, batteries, and portable radio",
            "N95 masks, goggles, and protective clothing",
            "Cash, IDs, and important documents",
            "Phone charger and emergency contact list",
        ],

        // Footer
        emergencyContacts: "Emergency Contacts",
        hotline: "Hotline",
        website: "Website",
        nationalEmergency: "National Emergency",
        redCross: "Red Cross",
        locatedAt: "Located at Ligñon Hill, Albay",
        allRightsReserved: "All rights reserved.",
        followAdvisories: "Always follow official advisories from local authorities and PHIVOLCS.",
        projectFrom: "A project from",

        // Language
        language: "Language",
    },

    fil: {
        // Header
        appName: "Ligtas Mayon",
        appTagline: "Pagsubaybay sa Kaligtasan",
        alertLevel: "Antas ng Alerto",
        alertLevelShort: "Lv.",

        // Navigation
        navMap: "Mapa",
        navEvacuation: "Ebakwasyon",
        navSafety: "Kaligtasan",
        navEmergency: "Emerhensya",

        // Hero
        dashboardTitle: "Manatiling Ligtas",
        dashboardSubtitle: "Subaybayan ang iyong distansya sa Permanent Danger Zone ng Bulkang Mayon",
        location: "Albay, Pilipinas",

        // Alert Card
        volcanoAlertLevel: "Antas ng Alerto sa Bulkan",
        unableToFetch: "Hindi makuha ang datos",
        checkPhivolcs: "Tingnan ang PHIVOLCS direkta",
        loading: "Naglo-load...",
        fetchingFromPhivolcs: "Kinukuha mula sa PHIVOLCS...",
        updated: "Na-update",
        normal: "Normal",
        hazardous: "Mapanganib",

        // Status Card
        yourLocation: "Iyong Lokasyon",
        searchedLocation: "Hinanap na Lokasyon",
        locating: "Hinahanap...",
        acquiringLocation: "Kinukuha ang lokasyon...",
        error: "Error",
        danger: "PANGANIB",
        insidePDZ: "Nasa loob ng 6km PDZ",
        safe: "Ligtas",
        outsidePDZ: "Nasa labas ng PDZ",
        distance: "Distansya",
        fromCrater: "mula sa Crater",

        // Location Search
        searchPlaceholder: "Maghanap ng lokasyon o coordinates...",
        searching: "Naghahanap...",
        clearSearch: "Burahin",

        // Evacuation Panel
        evacuationCenters: "Mga Evacuation Center",
        foundNearby: "malapit",
        loadingCenters: "Naglo-load ng evacuation centers...",
        routeTo: "Ruta papunta sa",
        clearSelection: "Burahin ang pinili",
        calculatingRoute: "Kinakalkula ang ruta...",
        getDirections: "Kumuha ng Direksyon sa Google Maps",
        drive: "biyahe",
        enableLocation: "I-enable ang lokasyon o maghanap ng lugar para makakuha ng direksyon",
        noCentersFound: "Walang nahanap na evacuation centers",
        refresh: "I-refresh",
        retry: "Subukan muli",

        // Evacuation Types
        shelter: "Shelter",
        school: "Paaralan",
        hospital: "Ospital",
        government: "Pamahalaan",

        // Safety Tips
        safetyPrecautions: "Mga Pag-iingat sa Kaligtasan",
        stayPrepared: "Maging handa para sa volcanic emergencies",
        beReadyToEvacuate: "Maging handa mag-evacuate anumang oras",
        beforeEruption: "Bago Mag-erupt",
        duringEvacuation: "Habang Nag-e-evacuate",
        volcanicHazards: "Mga Panganib sa Bulkan",
        emergencyKit: "Mga Kailangan sa Emergency Kit",
        stayInformed: "Manatiling updated:",
        monitorPhivolcs: "Subaybayan ang PHIVOLCS bulletins at sundin ang mga tagubilin ng local authorities.",

        // Safety Tips Content
        tipsBefore: [
            "Alamin ang iyong evacuation routes at pinakamalapit na evacuation centers",
            "Maghanda ng emergency kit na may mga kailangan para sa 3 araw",
            "Itago ang mahahalagang dokumento sa waterproof na lalagyan",
            "Manatiling updated sa PHIVOLCS bulletins at local advisories",
            "Alamin ang mga alert levels at ang ibig sabihin ng bawat isa",
        ],
        tipsDuring: [
            "Sundin agad ang opisyal na evacuation orders",
            "Gamitin lamang ang mga itinalagang evacuation routes",
            "Dalhin ang emergency kit at mahahalagang dokumento",
            "Tulungan ang mga matatanda, bata, at may kapansanan",
            "Huwag sumubok tumawid sa mga tulay na may lahar",
            "Manatiling kalmado at iwasan ang panic",
        ],
        tipsHazards: [
            "Pyroclastic flows: Napakainit at mabilis - mag-evacuate agad",
            "Ashfall: Magsuot ng N95 masks, protektahan ang mata, manatili sa loob kapag mabigat",
            "Lahar: Iwasan ang mga river channels at mababang lugar kapag umuulan",
            "Lava flows: Gumalaw papalayo sa direksyon ng daloy",
            "Volcanic gases: Umalis sa lugar kapag may amoy sulfur o nahihirapan huminga",
        ],
        tipsKit: [
            "Tubig (1 gallon per tao kada araw para sa 3 araw)",
            "Non-perishable food at manual can opener",
            "First aid kit at mga gamot",
            "Flashlight, batteries, at portable radio",
            "N95 masks, goggles, at protective clothing",
            "Cash, IDs, at mahahalagang dokumento",
            "Phone charger at emergency contact list",
        ],

        // Footer
        emergencyContacts: "Mga Emergency Contacts",
        hotline: "Hotline",
        website: "Website",
        nationalEmergency: "National Emergency",
        redCross: "Red Cross",
        locatedAt: "Matatagpuan sa Ligñon Hill, Albay",
        allRightsReserved: "All rights reserved.",
        followAdvisories: "Laging sundin ang opisyal na advisories mula sa local authorities at PHIVOLCS.",
        projectFrom: "Isang proyekto mula kay",

        // Language
        language: "Wika",
    },

    bik: {
        // Header
        appName: "Ligtas Mayon",
        appTagline: "Pagbabantay sa Kaligtasan",
        alertLevel: "Lebel nin Alerto",
        alertLevelShort: "Lv.",

        // Navigation
        navMap: "Mapa",
        navEvacuation: "Ebakwasyon",
        navSafety: "Kaligtasan",
        navEmergency: "Emerhensya",

        // Hero
        dashboardTitle: "Magdanay na Ligtas",
        dashboardSubtitle: "Bantayan an saimong distansya sa Permanent Danger Zone kan Bulkan Mayon",
        location: "Albay, Pilipinas",

        // Alert Card
        volcanoAlertLevel: "Lebel nin Alerto sa Bulkan",
        unableToFetch: "Dai makua an datos",
        checkPhivolcs: "Hilngon an PHIVOLCS direkta",
        loading: "Nagloload...",
        fetchingFromPhivolcs: "Kinukua hali sa PHIVOLCS...",
        updated: "Na-update",
        normal: "Normal",
        hazardous: "Delikado",

        // Status Card
        yourLocation: "Saimong Lokasyon",
        searchedLocation: "Hinanap na Lokasyon",
        locating: "Pighahanap...",
        acquiringLocation: "Kinukua an lokasyon...",
        error: "Error",
        danger: "PELIGRO",
        insidePDZ: "Yaon sa laog nin 6km PDZ",
        safe: "Ligtas",
        outsidePDZ: "Yaon sa luwas nin PDZ",
        distance: "Distansya",
        fromCrater: "hali sa Crater",

        // Location Search
        searchPlaceholder: "Maghanap nin lokasyon o coordinates...",
        searching: "Naghahanap...",
        clearSearch: "Halion",

        // Evacuation Panel
        evacuationCenters: "Mga Evacuation Center",
        foundNearby: "harani",
        loadingCenters: "Nagloload nin evacuation centers...",
        routeTo: "Ruta pasiring sa",
        clearSelection: "Halion an pinili",
        calculatingRoute: "Pigkakalkula an ruta...",
        getDirections: "Kumuha nin Direksyon sa Google Maps",
        drive: "biyahe",
        enableLocation: "I-enable an lokasyon o maghanap nin lugar para makakua nin direksyon",
        noCentersFound: "Mayong nakuang evacuation centers",
        refresh: "I-refresh",
        retry: "Probaran giraray",

        // Evacuation Types
        shelter: "Shelter",
        school: "Eskwelahan",
        hospital: "Ospital",
        government: "Gobyerno",

        // Safety Tips
        safetyPrecautions: "Mga Pag-iingat sa Kaligtasan",
        stayPrepared: "Magin andam para sa volcanic emergencies",
        beReadyToEvacuate: "Magin andam mag-evacuate arin man na oras",
        beforeEruption: "Bago Magbuto",
        duringEvacuation: "Mantang Nag-e-evacuate",
        volcanicHazards: "Mga Peligro sa Bulkan",
        emergencyKit: "Mga Kaipuhan sa Emergency Kit",
        stayInformed: "Magin updated:",
        monitorPhivolcs: "Bantayan an PHIVOLCS bulletins asin sunudon an mga instruksyon kan local authorities.",

        // Safety Tips Content
        tipsBefore: [
            "Aramon an saimong evacuation routes asin pinakaharani na evacuation centers",
            "Mag-andam nin emergency kit na may mga kaipuhan para sa 3 aldaw",
            "Itago an mahahalagang dokumento sa waterproof na lalagyan",
            "Magin updated sa PHIVOLCS bulletins asin local advisories",
            "Aramon an mga alert levels asin an boot sabihon kan kada saro",
        ],
        tipsDuring: [
            "Sunudon tolos an opisyal na evacuation orders",
            "Gamiton sana an mga itinalaan na evacuation routes",
            "Darahon an emergency kit asin mahahalagang dokumento",
            "Tabangan an mga gurang, aki, asin may kapansanan",
            "Dai magprobar magtabok sa mga tulay na may lahar",
            "Magin kalmado asin likayan an panic",
        ],
        tipsHazards: [
            "Pyroclastic flows: Grabe kainit asin rikas - mag-evacuate tolos",
            "Ashfall: Magsulot nin N95 masks, protektaran an mata, magdanay sa laog kun grabe",
            "Lahar: Likayan an mga river channels asin hababa na lugar kun nag-uuran",
            "Lava flows: Maghiro paharayo sa direksyon kan daloy",
            "Volcanic gases: Maghali sa lugar kun may amoy sulfur o nasakitan maginhawa",
        ],
        tipsKit: [
            "Tubig (1 gallon per tawo kada aldaw para sa 3 aldaw)",
            "Non-perishable food asin manual can opener",
            "First aid kit asin mga bulong",
            "Flashlight, batteries, asin portable radio",
            "N95 masks, goggles, asin protective clothing",
            "Cash, IDs, asin mahahalagang dokumento",
            "Phone charger asin emergency contact list",
        ],

        // Footer
        emergencyContacts: "Mga Emergency Contacts",
        hotline: "Hotline",
        website: "Website",
        nationalEmergency: "National Emergency",
        redCross: "Red Cross",
        locatedAt: "Yaon sa Ligñon Hill, Albay",
        allRightsReserved: "All rights reserved.",
        followAdvisories: "Pirmi sunudon an opisyal na advisories hali sa local authorities asin PHIVOLCS.",
        projectFrom: "Sarong proyekto hali ki",

        // Language
        language: "Lengguahe",
    },
};

export const languageNames: Record<Language, string> = {
    en: "English",
    fil: "Filipino",
    bik: "Bikol",
};
