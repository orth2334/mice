// Global Constants & Calculations Coefficients
const ECO_COEFFICIENTS = {
  cup: 52,
  plate: 37,
  bowl: 60,
  fork: 9
};
const TRANSPORT_COEFFICIENT = 120; // 120g CO2eq per passenger-km saved
const ENERGY_COEFFICIENT = 478.1; // 478.1g CO2eq per 1 kWh saved

// Session token & statistics state
let sessionToken = localStorage.getItem('mice_session_token');
let sessionStats = {
  username: '',
  totalReducedCarbonGrams: 0,
  totalParticipants: 0,
  totalActions: 0,
  items: {
    reusable_cup: 0,
    reusable_plate: 0,
    reusable_bowl: 0,
    reusable_fork: 0,
    public_transport: 0,
    renewable_energy: 0,
    upcycled_keyring: 0,
    upcycled_banner: 0,
    paper_booth: 0,
    digital_signage: 0
  },
  papersSaved: 0,
  keyringReducedCarbonGrams: 0,
  keyringParticipants: 0,
  paperBoothParticipants: 0,
  signageParticipants: 0
};
let sessionUsernames = new Set();
let transportParticipantsCount = 0;

let lastStats = {
  totalReducedCarbonGrams: 0,
  totalParticipants: 0,
  totalActions: 0,
  reusable_cup: 0,
  reusable_plate: 0,
  reusable_bowl: 0,
  reusable_fork: 0,
  public_transport: 0,
  renewable_energy: 0,
  upcycled_keyring: 0,
  upcycled_banner: 0,
  paper_booth: 0,
  digital_signage: 0,
  papersSaved: 0,
  keyringReducedCarbonGrams: 0,
  keyringParticipants: 0,
  paperBoothParticipants: 0,
  signageParticipants: 0
};

// Component-specific states
let esgReportState = {
  submitted: false,
  username: '',
  title: '',
  fileName: ''
};

let localFoodState = {
  submitted: false,
  username: '',
  store: '',
  amount: 0,
  reductionGrams: 0
};

let iso20121State = {
  submitted: false,
  username: '',
  certOrg: '',
  fileName: '',
  fileType: '',
  previewUrl: null
};

let advisoryState = {
  submitted: false,
  username: '',
  location: '',
  datetime: '',
  summary: '',
  fileName: '',
  previewUrl: null
};

let venueEcologyState = {
  submitted: false,
  username: '',
  fileName: '',
  checkedCerts: []
};

let barrierFreeState = {
  submitted: false,
  username: '',
  checkedItems: []
};

let localEconomyState = {
  submitted: false,
  username: '',
  amount: 0,
  details: ''
};

let inclusionState = {
  submitted: false,
  username: '',
  programs: []
};

let esgEduState = {
  submitted: false,
  username: '',
  programs: []
};

let supportersState = {
  submitted: false,
  username: '',
  role: '',
  fileName: '',
  fileType: ''
};

let donationState = {
  submitted: false,
  username: '',
  amount: 0,
  target: '',
  details: ''
};

let knowledgeState = {
  submitted: false,
  username: '',
  programs: []
};

let currentSignageQuantities = {
  main: 0,
  sub: 0,
  booth: 0
};
