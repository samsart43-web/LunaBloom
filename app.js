const STORAGE_KEY = "lunabloom_state_v2";
const DAY = 24 * 60 * 60 * 1000;
const ASSISTANT_NAME = "Zyra";
const ASSISTANT_NAME_HI = "Zyra";
const ASSISTANT_NAME_BN = "Zyra";
const ASSISTANT_NAME_TA = "Zyra";
const ASSISTANT_NAME_TE = "Zyra";
const ASSISTANT_NAME_MR = "Zyra";
const MIN_CYCLE_LENGTH = 20;
const MAX_CYCLE_LENGTH = 45;
const MIN_PERIOD_LENGTH = 2;
const MAX_PERIOD_LENGTH = 10;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;
const LAST_PERIOD_LOOKBACK_DAYS = 120;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_STORED_LOGS = 3650;
const ALLOWED_FLOW = new Set(["none", "light", "medium", "heavy", "spotting"]);
const ALLOWED_MOOD = new Set(["happy", "calm", "sad", "anxious", "irritable", "energetic"]);
const ALLOWED_ENERGY = new Set(["low", "medium", "high"]);
const ALLOWED_SYMPTOMS = new Set(["cramps", "headache", "bloating", "fatigue", "backache", "breast_tenderness", "acne", "cravings", "nausea"]);
const ALLOWED_PREFERENCES = new Set(["cramps", "mood_swings", "headache", "cravings", "energy", "sleep"]);
const SUPPORTED_THEMES = new Set(["pink", "lavender", "dark", "white", "pastel", "festival"]);
const defaultState = {
  userName: "Luna",
  cycleLength: Math.min(MAX_CYCLE_LENGTH, Math.max(MIN_CYCLE_LENGTH, 28)),
  periodLength: Math.min(MAX_PERIOD_LENGTH, Math.max(MIN_PERIOD_LENGTH, 5)),
  lastPeriodDate: null,
  lastPeriodEnd: null,
  isSetup: false,
  language: "en",
  theme: "pink",
  dailyLogs: [], // {date, flow, mood, energy, symptoms:[], sleep}
  cycleHistory: [], // {actualStart, actualEnd, predictedStart, deltaDays}
  symptomPreferences: []
};

let appData = { ...defaultState };
let currentViewDate = new Date();
let onboardingStep = 1;
let selectedFlow = null;
let selectedMood = null;
let selectedEnergy = null;
let selectedSymptoms = [];
const MAX_CHAT_CONTEXT_ITEMS = 10;
let chatContext = [];
const translations = {
  en: {
    onboarding_welcome_title: "Welcome to LunaBloom", onboarding_welcome_desc: "Your personal wellness companion for cycle tracking and health insights.", onboarding_cycle_title: "What's your cycle length?", onboarding_cycle_desc: "Most cycles are usually 21-35 days, but you can set 20-40.", onboarding_period_title: "How long is your period?", onboarding_period_desc: "This helps us predict your cycle accurately.", onboarding_date_title: "When did your last period start?", onboarding_date_desc: "Enter the date to start tracking your cycle.", onboarding_symptom_title: "Pick what you want to track", onboarding_symptom_desc: "Choose the signals you care about most.", onboarding_notify_title: "Stay informed", onboarding_notify_desc: "Get reminders for upcoming periods and ovulation.", btn_continue: "Continue", btn_back: "Back", btn_start_tracking: "Start Tracking", btn_all_set: "All Set!", btn_save: "Save Changes", btn_save_tracking: "Save Today's Log", btn_clear_data: "Clear All Data", btn_mark_start: "Mark period start today", btn_mark_end: "Mark period end", days: "days", days_until: "Days Until", your_name: "Your Name", placeholder_name: "Enter your name", next_period: "Next Period", ovulation: "Ovulation", fertile_window: "Fertile Window", cycle_length: "Cycle Length", todays_insight: "Today's Insight", log_symptoms: "Log Today", see_all: "See All", sym_mood: "Mood", sym_flow: "Flow", sym_energy: "Energy", sym_sleep: "Sleep", nav_home: "Home", nav_calendar: "Calendar", nav_log: "Log", nav_insights: "Insights", nav_assistant: "AI", calendar_title: "Calendar", day_sun: "Sun", day_mon: "Mon", day_tue: "Tue", day_wed: "Wed", day_thu: "Thu", day_fri: "Fri", day_sat: "Sat", legend_period: "Period", legend_ovulation: "Ovulation", legend_fertile: "Fertile", legend_today: "Today", tracking_title: "Log Symptoms", tracking_subtitle: "Track how you're feeling today", cat_flow: "Flow", cat_mood: "Mood", cat_symptoms: "Symptoms", cat_energy: "Energy", flow_none: "None", flow_light: "Light", flow_medium: "Medium", flow_heavy: "Heavy", flow_spotting: "Spotting", mood_happy: "Happy", mood_calm: "Calm", mood_sad: "Sad", mood_anxious: "Anxious", mood_irritable: "Irritable", mood_energetic: "Energetic", sym_cramps: "Cramps", sym_headache: "Headache", sym_bloating: "Bloating", sym_fatigue: "Fatigue", sym_backache: "Backache", sym_breast_tenderness: "Tender", sym_acne: "Acne", sym_cravings: "Cravings", sym_nausea: "Nausea", energy_low: "Low", energy_medium: "Medium", energy_high: "High", insights_title: "Your Insights", insights_subtitle: "Track your cycle patterns over time", avg_cycle: "Avg Cycle", avg_period: "Avg Period", total_cycles: "Cycles", regularity: "Regularity", prediction_accuracy: "Prediction Accuracy", mood_chart_title: "Mood Distribution", symptoms_chart_title: "Common Symptoms", cycle_history_title: "Cycle History", assistant_title: ASSISTANT_NAME, assistant_disclaimer: "Disclaimer: Not medical advice. Consult a healthcare professional for clinical concerns.", assistant_welcome: `Hi! I'm ${ASSISTANT_NAME} - your intelligent cycle & wellness companion. Ask me anything about your period, symptoms, mood, nutrition, sleep, or just chat. I understand English, Hindi & Hinglish!`, ask_placeholder: "Ask anything about your cycle...", q_period: "When is my next period?", q_phase: "What phase am I in?", q_cramps: "Tips for cramps?", q_fertile: "Fertile window?", settings_title: "Settings", settings_theme: "Theme", settings_language: "Language", settings_cycle: "Cycle Settings", settings_cycle_length: "Average Cycle Length", settings_period_length: "Average Period Length", settings_privacy: "Privacy & Data", settings_privacy_desc: "All your data stays on this device. You can clear it anytime.", settings_credits: "This app has been created by a 14-year-old student currently studying in Class 8. If you'd like to share feedback, report an issue, or suggest a new feature, feel free to reach out to me on Instagram at @samm.senpai.", theme_pink: "Soft Pink", theme_lavender: "Purple", theme_dark: "Dark", theme_white: "Blue", theme_pastel: "Mint", theme_festival: "Peach", phase_menstrual: "Menstrual", phase_follicular: "Follicular", phase_ovulation: "Ovulation", phase_luteal: "Luteal"
  },
  hi: {
    onboarding_welcome_title: "LunaBloom à¤®à¥‡à¤‚ à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆ",
    onboarding_welcome_desc: "à¤šà¤•à¥à¤° à¤Ÿà¥à¤°à¥ˆà¤•à¤¿à¤‚à¤— à¤”à¤° à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤‡à¤¨à¤¸à¤¾à¤‡à¤Ÿà¥à¤¸ à¤•à¥‡ à¤²à¤¿à¤ à¤†à¤ªà¤•à¤¾ à¤¸à¤¾à¤¥à¥€à¥¤",
    onboarding_cycle_title: "à¤†à¤ªà¤•à¤¾ à¤šà¤•à¥à¤° à¤•à¤¿à¤¤à¤¨à¥‡ à¤¦à¤¿à¤¨ à¤•à¤¾ à¤¹à¥ˆ?",
    onboarding_cycle_desc: "à¤œà¤¼à¥à¤¯à¤¾à¤¦à¤¾à¤¤à¤° à¤šà¤•à¥à¤° 21-35 à¤¦à¤¿à¤¨à¥‹à¤‚ à¤•à¥‡ à¤¹à¥‹à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤",
    onboarding_period_title: "à¤®à¤¾à¤¸à¤¿à¤• à¤§à¤°à¥à¤® à¤•à¤¿à¤¤à¤¨à¥‡ à¤¦à¤¿à¤¨ à¤šà¤²à¤¤à¤¾ à¤¹à¥ˆ?",
    onboarding_period_desc: "à¤¸à¤Ÿà¥€à¤• à¤­à¤µà¤¿à¤·à¥à¤¯à¤µà¤¾à¤£à¥€ à¤•à¥‡ à¤²à¤¿à¤ à¤¯à¤¹ à¤œà¤¼à¤°à¥‚à¤°à¥€ à¤¹à¥ˆà¥¤",
    onboarding_date_title: "à¤ªà¤¿à¤›à¤²à¤¾ à¤ªà¥€à¤°à¤¿à¤¯à¤¡ à¤•à¤¬ à¤¶à¥à¤°à¥‚ à¤¹à¥à¤†?",
    onboarding_date_desc: "à¤¶à¥à¤°à¥‚ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤¤à¤¾à¤°à¥€à¤– à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚à¥¤",
    onboarding_symptom_title: "à¤•à¥à¤¯à¤¾ à¤Ÿà¥à¤°à¥ˆà¤• à¤•à¤°à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥€ à¤¹à¥ˆà¤‚?",
    onboarding_symptom_desc: "à¤‰à¤¨ à¤¸à¤‚à¤•à¥‡à¤¤à¥‹à¤‚ à¤•à¥‹ à¤šà¥à¤¨à¥‡à¤‚ à¤œà¥‹ à¤†à¤ªà¤•à¥‡ à¤²à¤¿à¤ à¤…à¤¹à¤® à¤¹à¥ˆà¤‚à¥¤",
    onboarding_notify_title: "à¤¸à¥‚à¤šà¤¿à¤¤ à¤°à¤¹à¥‡à¤‚",
    onboarding_notify_desc: "à¤†à¤¨à¥‡ à¤µà¤¾à¤²à¥‡ à¤ªà¥€à¤°à¤¿à¤¯à¤¡ à¤”à¤° à¤“à¤µà¥à¤¯à¥‚à¤²à¥‡à¤¶à¤¨ à¤…à¤²à¤°à¥à¤Ÿ à¤ªà¤¾à¤à¤‚à¥¤",
    btn_continue: "à¤†à¤—à¥‡ à¤¬à¤¢à¤¼à¥‡à¤‚",
    btn_back: "à¤ªà¥€à¤›à¥‡",
    btn_start_tracking: "à¤Ÿà¥à¤°à¥ˆà¤•à¤¿à¤‚à¤— à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚",
    btn_all_set: "à¤¹à¥‹ à¤—à¤¯à¤¾!",
    btn_save: "à¤¸à¤¹à¥‡à¤œà¥‡à¤‚",
    btn_save_tracking: "à¤†à¤œ à¤•à¤¾ à¤²à¥‰à¤— à¤¸à¤¹à¥‡à¤œà¥‡à¤‚",
    btn_clear_data: "à¤¸à¤¾à¤°à¤¾ à¤¡à¥‡à¤Ÿà¤¾ à¤¹à¤Ÿà¤¾à¤à¤",
    btn_mark_start: "à¤†à¤œ à¤ªà¥€à¤°à¤¿à¤¯à¤¡ à¤¶à¥à¤°à¥‚ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚",
    btn_mark_end: "à¤ªà¥€à¤°à¤¿à¤¯à¤¡ à¤¸à¤®à¤¾à¤ªà¥à¤¤ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚",
    days: "à¤¦à¤¿à¤¨",
    days_until: "à¤¦à¤¿à¤¨ à¤¬à¤¾à¤•à¥€",
    your_name: "à¤†à¤ªà¤•à¤¾ à¤¨à¤¾à¤®",
    placeholder_name: "à¤¨à¤¾à¤® à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚",
    next_period: "à¤…à¤—à¤²à¤¾ à¤ªà¥€à¤°à¤¿à¤¯à¤¡",
    ovulation: "à¤“à¤µà¥à¤¯à¥‚à¤²à¥‡à¤¶à¤¨",
    fertile_window: "à¤«à¤°à¥à¤Ÿà¤¾à¤‡à¤² à¤µà¤¿à¤‚à¤¡à¥‹",
    cycle_length: "à¤šà¤•à¥à¤° à¤²à¤‚à¤¬à¤¾à¤ˆ",
    todays_insight: "à¤†à¤œ à¤•à¥€ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€",
    log_symptoms: "à¤†à¤œ à¤²à¥‰à¤— à¤•à¤°à¥‡à¤‚",
    see_all: "à¤¸à¤­à¥€ à¤¦à¥‡à¤–à¥‡à¤‚",
    sym_mood: "à¤®à¥‚à¤¡",
    sym_flow: "à¤«à¥à¤²à¥‹",
    sym_energy: "à¤Šà¤°à¥à¤œà¤¾",
    sym_sleep: "à¤¨à¥€à¤‚à¤¦",
    nav_home: "à¤¹à¥‹à¤®",
    nav_calendar: "à¤•à¥ˆà¤²à¥‡à¤‚à¤¡à¤°",
    nav_log: "à¤²à¥‰à¤—",
    nav_insights: "à¤‡à¤¨à¤¸à¤¾à¤‡à¤Ÿà¥à¤¸",
    nav_assistant: "AI",
    calendar_title: "à¤•à¥ˆà¤²à¥‡à¤‚à¤¡à¤°",
    day_sun: "à¤°à¤µà¤¿",
    day_mon: "à¤¸à¥‹à¤®",
    day_tue: "à¤®à¤‚à¤—à¤²",
    day_wed: "à¤¬à¥à¤§",
    day_thu: "à¤—à¥à¤°à¥",
    day_fri: "à¤¶à¥à¤•à¥à¤°",
    day_sat: "à¤¶à¤¨à¤¿",
    legend_period: "à¤ªà¥€à¤°à¤¿à¤¯à¤¡",
    legend_ovulation: "à¤“à¤µà¥à¤¯à¥‚à¤²à¥‡à¤¶à¤¨",
    legend_fertile: "à¤«à¤°à¥à¤Ÿà¤¾à¤‡à¤²",
    legend_today: "à¤†à¤œ",
    tracking_title: "à¤²à¤•à¥à¤·à¤£ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚",
    tracking_subtitle: "à¤†à¤œ à¤†à¤ª à¤•à¥ˆà¤¸à¤¾ à¤®à¤¹à¤¸à¥‚à¤¸ à¤•à¤° à¤°à¤¹à¥€ à¤¹à¥ˆà¤‚",
    cat_flow: "à¤«à¥à¤²à¥‹",
    cat_mood: "à¤®à¥‚à¤¡",
    cat_symptoms: "à¤²à¤•à¥à¤·à¤£",
    cat_energy: "à¤Šà¤°à¥à¤œà¤¾",
    flow_none: "à¤¨à¤¹à¥€à¤‚",
    flow_light: "à¤¹à¤²à¥à¤•à¤¾",
    flow_medium: "à¤®à¤§à¥à¤¯à¤®",
    flow_heavy: "à¤­à¤¾à¤°à¥€",
    flow_spotting: "à¤¸à¥à¤ªà¥‰à¤Ÿà¤¿à¤‚à¤—",
    mood_happy: "à¤–à¥à¤¶",
    mood_calm: "à¤¶à¤¾à¤‚à¤¤",
    mood_sad: "à¤‰à¤¦à¤¾à¤¸",
    mood_anxious: "à¤šà¤¿à¤‚à¤¤à¤¿à¤¤",
    mood_irritable: "à¤šà¤¿à¤¡à¤¼à¤šà¤¿à¤¡à¤¼à¤¾",
    mood_energetic: "à¤Šà¤°à¥à¤œà¤¾à¤µà¤¾à¤¨",
    sym_cramps: "à¤à¤‚à¤ à¤¨",
    sym_headache: "à¤¸à¤¿à¤°à¤¦à¤°à¥à¤¦",
    sym_bloating: "à¤ªà¥‡à¤Ÿ à¤«à¥‚à¤²à¤¨à¤¾",
    sym_fatigue: "à¤¥à¤•à¤¾à¤¨",
    sym_backache: "à¤ªà¥€à¤  à¤¦à¤°à¥à¤¦",
    sym_breast_tenderness: "à¤¸à¤‚à¤µà¥‡à¤¦à¤¨à¤¶à¥€à¤²à¤¤à¤¾",
    sym_acne: "à¤®à¥à¤‚à¤¹à¤¾à¤¸à¥‡",
    sym_cravings: "à¤•à¥à¤°à¥‡à¤µà¤¿à¤‚à¤—",
    sym_nausea: "à¤®à¤¤à¤²à¥€",
    energy_low: "à¤•à¤®",
    energy_medium: "à¤®à¤§à¥à¤¯à¤®",
    energy_high: "à¤‰à¤šà¥à¤š",
    insights_title: "à¤†à¤ªà¤•à¥€ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€",
    insights_subtitle: "à¤¸à¤®à¤¯ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤¦à¥‡à¤–à¥‡à¤‚",
    avg_cycle: "à¤”à¤¸à¤¤ à¤šà¤•à¥à¤°",
    avg_period: "à¤”à¤¸à¤¤ à¤…à¤µà¤§à¤¿",
    total_cycles: "à¤šà¤•à¥à¤°",
    regularity: "à¤¨à¤¿à¤¯à¤®à¤¿à¤¤à¤¤à¤¾",
    prediction_accuracy: "à¤­à¤µà¤¿à¤·à¥à¤¯à¤µà¤¾à¤£à¥€ à¤¸à¤Ÿà¥€à¤•à¤¤à¤¾",
    mood_chart_title: "à¤®à¥‚à¤¡ à¤µà¤¿à¤¤à¤°à¤£",
    symptoms_chart_title: "à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯ à¤²à¤•à¥à¤·à¤£",
    cycle_history_title: "à¤šà¤•à¥à¤° à¤‡à¤¤à¤¿à¤¹à¤¾à¤¸",
    assistant_title: "Zyra",
    assistant_disclaimer: "à¤…à¤¸à¥à¤µà¥€à¤•à¤°à¤£: à¤¯à¤¹ à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¥€à¤¯ à¤¸à¤²à¤¾à¤¹ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤ à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤¸à¤‚à¤¬à¤‚à¤§à¥€ à¤¸à¤®à¤¸à¥à¤¯à¤¾à¤“à¤‚ à¤•à¥‡ à¤²à¤¿à¤ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤®à¤¿à¤²à¥‡à¤‚à¥¤",
    assistant_welcome: "à¤¨à¤®à¤¸à¥à¤¤à¥‡! à¤®à¥ˆà¤‚ à¤œà¤¼à¤¾à¤¯à¤°à¤¾ (Zyra) à¤¹à¥‚à¤  - à¤†à¤ªà¤•à¥€ à¤‡à¤‚à¤Ÿà¥‡à¤²à¤¿à¤œà¥‡à¤‚à¤Ÿ à¤¹à¥‡à¤²à¥à¤¥ à¤¸à¤¾à¤¥à¥€à¥¤ à¤ªà¥€à¤°à¤¿à¤¯à¤¡, à¤²à¤•à¥à¤·à¤£à¥‹à¤‚ à¤¯à¤¾ à¤®à¥‚à¤¡ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤•à¥à¤› à¤­à¥€ à¤ªà¥‚à¤›à¥‡à¤‚à¥¤",
    ask_placeholder: "à¤šà¤•à¥à¤° à¤¸à¥‡ à¤œà¥à¤¡à¤¼à¤¾ à¤•à¥à¤› à¤­à¥€ à¤ªà¥‚à¤›à¥‡à¤‚...",
    q_period: "à¤®à¥‡à¤°à¤¾ à¤…à¤—à¤²à¤¾ à¤ªà¥€à¤°à¤¿à¤¯à¤¡ à¤•à¤¬ à¤¹à¥ˆ?",
    q_phase: "à¤®à¥ˆà¤‚ à¤•à¤¿à¤¸ à¤šà¤°à¤£ à¤®à¥‡à¤‚ à¤¹à¥‚à¤?",
    q_cramps: "à¤à¤‚à¤ à¤¨ à¤•à¥‡ à¤Ÿà¤¿à¤ªà¥à¤¸?",
    q_fertile: "à¤«à¤°à¥à¤Ÿà¤¾à¤‡à¤² à¤µà¤¿à¤‚à¤¡à¥‹?",
    settings_title: "à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸",
    settings_theme: "à¤¥à¥€à¤®",
    settings_language: "à¤­à¤¾à¤·à¤¾",
    settings_cycle: "à¤šà¤•à¥à¤° à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸",
    settings_cycle_length: "à¤”à¤¸à¤¤ à¤šà¤•à¥à¤° à¤²à¤‚à¤¬à¤¾à¤ˆ",
    settings_period_length: "à¤”à¤¸à¤¤ à¤…à¤µà¤§à¤¿ à¤²à¤‚à¤¬à¤¾à¤ˆ",
    settings_privacy: "à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾",
    settings_privacy_desc: "à¤¸à¤¾à¤°à¤¾ à¤¡à¥‡à¤Ÿà¤¾ à¤†à¤ªà¤•à¥‡ à¤¡à¤¿à¤µà¤¾à¤‡à¤¸ à¤ªà¤° à¤°à¤¹à¤¤à¤¾ à¤¹à¥ˆà¥¤",
    settings_credits: "à¤¯à¤¹ à¤à¤ª à¤à¤• 14 à¤¸à¤¾à¤² à¤•à¥‡ à¤›à¤¾à¤¤à¥à¤° à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤¬à¤¨à¤¾à¤¯à¤¾ à¤—à¤¯à¤¾ à¤¹à¥ˆ à¤œà¥‹ à¤…à¤­à¥€ 8à¤µà¥€à¤‚ à¤•à¤•à¥à¤·à¤¾ à¤®à¥‡à¤‚ à¤ªà¤¢à¤¼ à¤°à¤¹à¤¾ à¤¹à¥ˆà¥¤ à¤¯à¤¦à¤¿ à¤†à¤ª à¤«à¥€à¤¡à¤¬à¥ˆà¤• à¤¸à¤¾à¤à¤¾ à¤•à¤°à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚, à¤•à¤¿à¤¸à¥€ à¤¸à¤®à¤¸à¥à¤¯à¤¾ à¤•à¥€ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤•à¤°à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚, à¤¯à¤¾ à¤•à¤¿à¤¸à¥€ à¤¨à¤ à¤«à¥€à¤šà¤° à¤•à¤¾ à¤¸à¥à¤à¤¾à¤µ à¤¦à¥‡à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚, à¤¤à¥‹ à¤¬à¥‡à¤à¤¿à¤à¤• à¤®à¥à¤à¤¸à¥‡ à¤‡à¤‚à¤¸à¥à¤Ÿà¤¾à¤—à¥à¤°à¤¾à¤® à¤ªà¤° @samm.senpai à¤ªà¤° à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤",
    theme_pink: "à¤¸à¥‰à¤«à¥à¤Ÿ à¤ªà¤¿à¤‚à¤•",
    theme_lavender: "à¤²à¥ˆà¤µà¥‡à¤‚à¤¡à¤°",
    theme_dark: "à¤¡à¤¾à¤°à¥à¤•",
    theme_white: "à¤®à¤¿à¤¨à¤¿à¤®à¤²",
    theme_pastel: "à¤ªà¥‡à¤¸à¥à¤Ÿà¤²",
    theme_festival: "à¤«à¥‡à¤¸à¥à¤Ÿà¤¿à¤µà¤²",
    phase_menstrual: "à¤®à¤¾à¤¸à¤¿à¤•",
    phase_follicular: "à¤«à¥‰à¤²à¤¿à¤•à¥à¤¯à¥à¤²à¤°",
    phase_ovulation: "à¤“à¤µà¥à¤¯à¥‚à¤²à¥‡à¤¶à¤¨",
    phase_luteal: "à¤²à¥à¤¯à¥‚à¤Ÿà¤¿à¤¯à¤²"
  }
}
  ;
const supportedLangs = ["en", "hi", "bn", "ta", "te", "mr"];
supportedLangs.forEach((lang) => {
  if (!translations[lang]) {
    translations[lang] = { ...translations.en };
  }
});
function clampInteger(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}
function sanitizeDailyLogs(logs) {
  if (!Array.isArray(logs)) return [];
  return logs
    .map((log) => {
      const date = typeof log?.date === "string" ? log.date : "";
      if (!parseDateInputValue(date)) return null;
      const flow = typeof log.flow === "string" && ALLOWED_FLOW.has(log.flow) ? log.flow : null;
      const mood = typeof log.mood === "string" && ALLOWED_MOOD.has(log.mood) ? log.mood : null;
      const energy = typeof log.energy === "string" && ALLOWED_ENERGY.has(log.energy) ? log.energy : null;
      const symptoms = Array.isArray(log.symptoms)
        ? [...new Set(log.symptoms.map((item) => String(item || "").trim().toLowerCase()).filter((item) => ALLOWED_SYMPTOMS.has(item)))]
        : [];
      return { date, flow, mood, energy, symptoms };
    })
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, MAX_STORED_LOGS);
}
function sanitizeCycleHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .map((entry) => {
      const actualStart = typeof entry?.actualStart === "string" && parseDateInputValue(entry.actualStart) ? entry.actualStart : null;
      const actualEnd = typeof entry?.actualEnd === "string" && parseDateInputValue(entry.actualEnd) ? entry.actualEnd : null;
      const predictedStart = typeof entry?.predictedStart === "string" && parseDateInputValue(entry.predictedStart) ? entry.predictedStart : null;
      const deltaDays = Number.isFinite(Number(entry?.deltaDays)) ? Number(entry.deltaDays) : null;
      if (!actualStart && !predictedStart) return null;
      return { actualStart, actualEnd, predictedStart, deltaDays };
    })
    .filter(Boolean)
    .slice(0, 60);
}
function normalizeAppState(rawState) {
  const state = (rawState && typeof rawState === "object") ? rawState : {};
  const normalized = { ...defaultState };
  normalized.userName = validateUserName(state.userName || defaultState.userName).value || defaultState.userName;
  normalized.cycleLength = clampInteger(state.cycleLength, MIN_CYCLE_LENGTH, MAX_CYCLE_LENGTH, defaultState.cycleLength);
  normalized.periodLength = clampInteger(state.periodLength, MIN_PERIOD_LENGTH, MAX_PERIOD_LENGTH, defaultState.periodLength);
  if (normalized.periodLength >= normalized.cycleLength) {
    normalized.periodLength = Math.max(MIN_PERIOD_LENGTH, Math.min(normalized.cycleLength - 1, defaultState.periodLength));
  }
  normalized.lastPeriodDate = parseDateInputValue(state.lastPeriodDate) ? state.lastPeriodDate : null;
  normalized.lastPeriodEnd = parseDateInputValue(state.lastPeriodEnd) ? state.lastPeriodEnd : null;
  normalized.isSetup = Boolean(state.isSetup);
  normalized.language = supportedLangs.includes(state.language) ? state.language : defaultState.language;
  normalized.theme = SUPPORTED_THEMES.has(state.theme) ? state.theme : defaultState.theme;
  normalized.dailyLogs = sanitizeDailyLogs(state.dailyLogs);
  normalized.cycleHistory = sanitizeCycleHistory(state.cycleHistory);
  normalized.symptomPreferences = Array.isArray(state.symptomPreferences)
    ? [...new Set(state.symptomPreferences.map((item) => String(item || "").trim()).filter((item) => ALLOWED_PREFERENCES.has(item)))]
    : [];
  return normalized;
}
function upsertDailyLog(entry) {
  const clean = sanitizeDailyLogs([entry])[0];
  if (!clean) return;
  const existingIndex = appData.dailyLogs.findIndex((log) => log.date === clean.date);
  if (existingIndex >= 0) appData.dailyLogs[existingIndex] = clean;
  else appData.dailyLogs.push(clean);
  appData.dailyLogs = sanitizeDailyLogs(appData.dailyLogs);
}
async function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      appData = normalizeAppState(JSON.parse(saved));
    } catch (error) {
      console.warn("Could not parse local state. Using defaults.", error);
      appData = { ...defaultState };
    }
  } else {
    appData = { ...defaultState };
  }
  try {
    const response = await fetch('/api/data/dashboard');
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const remoteLogs = sanitizeDailyLogs(result.data);
        const shouldUseRemote = result.source !== 'local_only' || appData.dailyLogs.length === 0;
        if (shouldUseRemote) {
          appData.dailyLogs = remoteLogs;
          saveState();
        }
      }
    }
  } catch (e) {
    console.warn("Backend sync unavailable, continuing with local state.", e);
  }
  renderAll();
}
function saveState() {
  const snapshot = {
    userName: appData.userName,
    cycleLength: appData.cycleLength,
    periodLength: appData.periodLength,
    lastPeriodDate: appData.lastPeriodDate,
    lastPeriodEnd: appData.lastPeriodEnd,
    isSetup: appData.isSetup,
    language: appData.language,
    theme: appData.theme,
    dailyLogs: sanitizeDailyLogs(appData.dailyLogs),
    cycleHistory: sanitizeCycleHistory(appData.cycleHistory),
    symptomPreferences: Array.isArray(appData.symptomPreferences) ? appData.symptomPreferences : []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
async function saveLogToBackend(entry) {
  try {
    const response = await fetch('/api/data/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!response.ok) {
      return { success: false, status: response.status };
    }
    return await response.json();
  } catch (e) {
    console.warn("Could not save log to backend, using local fallback.", e);
    return { success: false };
  }
}
function bindNavigation() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.getAttribute("data-target");
      if (target) showScreen(target);
    }
    );
  }
  );
}
function showScreen(id) {
  // Block navigation to any app screen until onboarding is fully completed
  if (!appData.isSetup && id !== 'onboarding-screen') {
    return;
  }
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
    s.scrollTop = 0; // Reset scroll position when leaving a screen
  });
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add("active");
    screen.scrollTop = 0; // Reset scroll position when entering a screen
  }
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.getAttribute("data-target") === id);
  }
  );
}
function hydrateOnboardingInputs() {
  const cycleSlider = document.getElementById("onboarding-cycle-slider");
  const periodSlider = document.getElementById("onboarding-period-slider");
  const dateInput = document.getElementById("onboarding-date");
  const nameInput = document.getElementById("user-name");
  updatePreferenceUI();
  applyOnboardingInputConstraints();
  if (cycleSlider) {
    cycleSlider.value = appData.cycleLength;
    updateCycleSlider(cycleSlider.value);
  }
  if (periodSlider) {
    periodSlider.value = appData.periodLength;
    updatePeriodSlider(periodSlider.value);
  }
  if (dateInput) {
    dateInput.value = "";
    if (appData.lastPeriodDate) {
      const dateValidation = validateLastPeriodDate(appData.lastPeriodDate);
      if (dateValidation.isValid) {
        dateInput.value = appData.lastPeriodDate;
      }
    }
  }
  if (nameInput && appData.userName && appData.userName !== defaultState.userName) {
    nameInput.value = appData.userName;
  }
}
function bindPreferenceChips() {
  document.querySelectorAll("#preference-chips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const key = chip.dataset.pref;
      if (appData.symptomPreferences.includes(key)) {
        appData.symptomPreferences = appData.symptomPreferences.filter((p) => p !== key);
      }
      else {
        appData.symptomPreferences.push(key);
      }
      updatePreferenceUI();
    }
    );
  }
  );
}
function updatePreferenceUI() {
  document.querySelectorAll("#preference-chips .chip").forEach((chip) => {
    chip.classList.toggle("selected", appData.symptomPreferences.includes(chip.dataset.pref));
  }
  );
}
function formatDateInputValue(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseDateInputValue(value) {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}
function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
function getMinAllowedLastPeriodDate() {
  const minDate = getTodayStart();
  minDate.setDate(minDate.getDate() - LAST_PERIOD_LOOKBACK_DAYS);
  return minDate;
}
function applyOnboardingInputConstraints() {
  const dateInput = document.getElementById("onboarding-date");
  if (dateInput) {
    dateInput.min = formatDateInputValue(getMinAllowedLastPeriodDate());
    dateInput.max = formatDateInputValue(getTodayStart());
    dateInput.oninput = () => {
      dateInput.setCustomValidity("");
    };
  }
}
function showDateInputError(dateInput, message) {
  if (!dateInput) return;
  dateInput.setCustomValidity(message || "Please enter a valid date.");
  dateInput.reportValidity();
}
function validateLastPeriodDate(value) {
  if (!value) {
    return {
      isValid: false,
      message: "Please enter your last period date."
    };
  }
  const parsedDate = parseDateInputValue(value);
  if (!parsedDate) {
    return {
      isValid: false,
      message: "Please enter a valid date."
    };
  }
  const today = getTodayStart();
  if (parsedDate > today) {
    return {
      isValid: false,
      message: "Please enter a date that is not in the future."
    };
  }
  const minDate = getMinAllowedLastPeriodDate();
  if (parsedDate < minDate) {
    return {
      isValid: false,
      message: `Please enter a date within the last ${LAST_PERIOD_LOOKBACK_DAYS} days.`
    };
  }
  return {
    isValid: true,
    value: formatDateInputValue(parsedDate)
  };
}
function validateCycleAndPeriod(cycleValue, periodValue) {
  const cycle = Number(cycleValue);
  const period = Number(periodValue);
  if (!Number.isInteger(cycle) || cycle < MIN_CYCLE_LENGTH || cycle > MAX_CYCLE_LENGTH) {
    return {
      isValid: false,
      field: "cycle",
      message: `Cycle length must be between ${MIN_CYCLE_LENGTH} and ${MAX_CYCLE_LENGTH} days.`
    };
  }
  if (!Number.isInteger(period) || period < MIN_PERIOD_LENGTH || period > MAX_PERIOD_LENGTH) {
    return {
      isValid: false,
      field: "period",
      message: `Period length must be between ${MIN_PERIOD_LENGTH} and ${MAX_PERIOD_LENGTH} days.`
    };
  }
  if (period >= cycle) {
    return {
      isValid: false,
      field: "period",
      message: "Period length must be less than cycle length."
    };
  }
  return {
    isValid: true,
    cycle,
    period
  };
}
function validateUserName(value) {
  const name = value?.trim() || "";
  if (name.length < MIN_NAME_LENGTH) {
    return {
      isValid: false,
      message: `Please enter at least ${MIN_NAME_LENGTH} characters for your name.`
    };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return {
      isValid: false,
      message: `Name should be ${MAX_NAME_LENGTH} characters or fewer.`
    };
  }
  return {
    isValid: true,
    value: name
  };
}
function nextOnboardingStep() {
  if (onboardingStep === 3) {
    const cycleSlider = document.getElementById("onboarding-cycle-slider");
    const periodSlider = document.getElementById("onboarding-period-slider");
    const cycleValidation = validateCycleAndPeriod(cycleSlider?.value || appData.cycleLength, periodSlider?.value || appData.periodLength);
    if (!cycleValidation.isValid) {
      showToast(cycleValidation.message);
      if (cycleValidation.field === "cycle") cycleSlider?.focus();
      if (cycleValidation.field === "period") periodSlider?.focus();
      return;
    }
  }
  if (onboardingStep === 4) {
    const dateInput = document.getElementById("onboarding-date");
    dateInput?.setCustomValidity("");
    const dateValidation = validateLastPeriodDate(dateInput?.value || "");
    if (!dateValidation.isValid) {
      showDateInputError(dateInput, dateValidation.message);
      showToast(dateValidation.message);
      dateInput?.focus();
      return;
    }
    dateInput?.setCustomValidity("");
    dateInput.value = dateValidation.value;
  }
  if (onboardingStep === 5 && appData.symptomPreferences.length === 0) {
    showToast("Please choose at least one symptom preference to continue.");
    return;
  }
  const steps = document.querySelectorAll(".onboarding-step");
  onboardingStep = Math.min(steps.length, onboardingStep + 1);
  updateOnboardingUI();
}

function prevOnboardingStep() {
  if (onboardingStep > 1) {
    onboardingStep = onboardingStep - 1;
    updateOnboardingUI();
  }
}
function updateOnboardingUI() {
  document.querySelectorAll(".onboarding-step").forEach((step) => {
    step.classList.toggle("active", Number(step.dataset.step) === onboardingStep);
  }
  );
  document.querySelectorAll(".onboarding-dot").forEach((dot) => {
    dot.classList.toggle("active", Number(dot.dataset.dot) === onboardingStep);
  }
  );
}
function completeOnboarding() {
  const nameInput = document.getElementById("user-name");
  const dateInput = document.getElementById("onboarding-date");
  const cycleSlider = document.getElementById("onboarding-cycle-slider");
  const periodSlider = document.getElementById("onboarding-period-slider");
  const selectedPreferences = Array.from(document.querySelectorAll("#preference-chips .chip.selected"), (chip) => chip.dataset.pref).filter(Boolean);
  const cycleValidation = validateCycleAndPeriod(cycleSlider?.value || appData.cycleLength, periodSlider?.value || appData.periodLength);
  if (!cycleValidation.isValid) {
    onboardingStep = cycleValidation.field === "period" ? 3 : 2;
    updateOnboardingUI();
    showToast(cycleValidation.message);
    if (cycleValidation.field === "cycle") cycleSlider?.focus();
    if (cycleValidation.field === "period") periodSlider?.focus();
    return;
  }
  if (selectedPreferences.length === 0) {
    onboardingStep = 5;
    updateOnboardingUI();
    showToast("Please choose at least one symptom preference.");
    return;
  }
  dateInput?.setCustomValidity("");
  const dateValidation = validateLastPeriodDate(dateInput?.value || "");
  if (!dateValidation.isValid) {
    onboardingStep = 4;
    updateOnboardingUI();
    showDateInputError(dateInput, dateValidation.message);
    showToast(dateValidation.message);
    dateInput?.focus();
    return;
  }
  dateInput?.setCustomValidity("");
  const nameValidation = validateUserName(nameInput?.value || "");
  if (!nameValidation.isValid) {
    showToast(nameValidation.message);
    nameInput?.focus();
    return;
  }

  appData.userName = nameValidation.value;
  appData.cycleLength = cycleValidation.cycle;
  appData.periodLength = cycleValidation.period;
  appData.lastPeriodDate = dateValidation.value;
  appData.symptomPreferences = selectedPreferences;
  appData.isSetup = true;
  syncSettingsInputs();
  saveState();
  renderAll();
  showScreen("dashboard-screen");
  showToast("You're all set! Tracking has started.");
}
function updateCycleSlider(val) {
  document.getElementById("cycle-slider-value").innerText = val;
}
function updatePeriodSlider(val) {
  document.getElementById("period-slider-value").innerText = val;
}
let themeTransitionTimer = null;
function applyTheme(theme, options = {}) {
  const shouldAnimate = Boolean(options.animate);
  const currentGradient = getComputedStyle(document.body).getPropertyValue("--bg-gradient").trim();

  if (shouldAnimate && currentGradient) {
    const existingOverlay = document.querySelector(".theme-transition-overlay");
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement("div");
    overlay.className = "theme-transition-overlay";
    overlay.style.background = currentGradient;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add("fade-out");
    });

    if (themeTransitionTimer) clearTimeout(themeTransitionTimer);
    themeTransitionTimer = setTimeout(() => {
      overlay.remove();
    }, 520);
  }

  document.body.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-option").forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.theme === theme);
  }
  );
}
function setTheme(theme) {
  if (!SUPPORTED_THEMES.has(theme)) return;
  appData.theme = theme;
  applyTheme(theme, { animate: true });
  saveState();
  renderAll();
}
function sanitizeDisplayText(text) {
  if (typeof text !== "string") return text;
  let clean = text;
  if (/[ÃÂâàð]/.test(clean)) {
    try {
      clean = decodeURIComponent(escape(clean));
    } catch (error) {
      clean = text;
    }
  }
  return clean.replace(/\u0000/g, "");
}
function translatePage() {
  const dict = translations[appData.language] || translations.en;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = sanitizeDisplayText(dict[key] || translations.en[key] || el.textContent);
  }
  );
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", sanitizeDisplayText(dict[key] || translations.en[key] || el.placeholder));
  }
  );
}
function setLanguage(lang, persist = true) {
  if (!translations[lang]) lang = "en";
  appData.language = lang;
  document.querySelectorAll(".language-option").forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.lang === lang);
  }
  );
  translatePage();
  if (persist) saveState();
}
function syncSettingsInputs() {
  const c = document.getElementById("setting-cycle-length");
  const p = document.getElementById("setting-period-length");
  if (c) c.value = appData.cycleLength;
  if (p) p.value = appData.periodLength;
}
function saveSettings() {
  const c = document.getElementById("setting-cycle-length");
  const p = document.getElementById("setting-period-length");
  const cycleValidation = validateCycleAndPeriod(c?.value || appData.cycleLength, p?.value || appData.periodLength);
  if (!cycleValidation.isValid) {
    showToast(cycleValidation.message);
    if (cycleValidation.field === "cycle") c?.focus();
    if (cycleValidation.field === "period") p?.focus();
    return;
  }
  appData.cycleLength = cycleValidation.cycle;
  appData.periodLength = cycleValidation.period;
  saveState();
  renderAll();
  showToast("Settings saved");
}
function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  appData = {
    ...defaultState
  }
    ;
  onboardingStep = 1;
  selectedFlow = selectedEnergy = selectedMood = null;
  selectedSymptoms = [];
  chatContext = [];
  showScreen("onboarding-screen");
  hydrateOnboardingInputs();
  translatePage();
  applyTheme(appData.theme);
  bootstrapChatContext();
  showToast("Data cleared");
}
function renderAll() {
  translatePage();
  updateGreeting();
  renderPredictions();
  updateProgressRing();
  updatePhaseInsight();
  renderCalendar();
  renderCharts();
  renderHistory();
  updateTrackingSelections();
}
function markPeriodStartToday() {
  const today = toISO(new Date());
  const infoBefore = appData.lastPeriodDate ? getCycleInfo(new Date()) : {
  }
    ;
  const predicted = infoBefore?.nextCycleStart ? toISO(infoBefore.nextCycleStart) : null;
  const delta = predicted ? Math.abs(Math.round((new Date(today) - new Date(predicted)) / DAY)) : null;
  appData.lastPeriodDate = today;
  appData.lastPeriodEnd = null;
  appData.cycleHistory.unshift({
    actualStart: today, actualEnd: null, predictedStart: predicted, deltaDays: delta
  }
  );
  appData.cycleHistory = appData.cycleHistory.slice(0, 30);
  saveState();
  renderAll();
  showToast("Period start logged");
}
function markPeriodEndToday() {
  const today = toISO(new Date());
  appData.lastPeriodEnd = today;
  const current = appData.cycleHistory.find((c) => !c.actualEnd);
  if (current) current.actualEnd = today;
  saveState();
  renderAll();
  showToast("Period end logged");
}
function updateGreeting() {
  const name = document.getElementById("user-name-display");
  if (name) name.textContent = appData.userName || "User";
}
function getCycleInfo(referenceDate = new Date()) {
  if (!appData.lastPeriodDate) return {
  }
    ;
  const start = new Date(appData.lastPeriodDate);
  start.setHours(0, 0, 0, 0);
  const diff = referenceDate.setHours(0, 0, 0, 0) - start.getTime();
  const dayIndex = Math.floor(diff / DAY) + 1;
  const cyclesPassed = Math.floor((dayIndex - 1) / appData.cycleLength);
  const currentCycleStart = new Date(start.getTime() + cyclesPassed * appData.cycleLength * DAY);
  const nextCycleStart = new Date(currentCycleStart.getTime() + appData.cycleLength * DAY);
  const ovulation = new Date(currentCycleStart.getTime() + (appData.cycleLength - 14) * DAY);
  const fertileStart = new Date(ovulation.getTime() - 3 * DAY);
  const fertileEnd = new Date(ovulation.getTime() + 1 * DAY);
  return {
    cycleDay: dayIndex - cyclesPassed * appData.cycleLength, currentCycleStart, nextCycleStart, ovulation, fertileStart, fertileEnd
  }
    ;
}
function renderPredictions() {
  if (!appData.lastPeriodDate) return;
  const info = getCycleInfo(new Date());
  const fmt = (d) => d.toLocaleDateString(appData.language, {
    month: "short", day: "numeric"
  }
  );
  setText("next-period-date", fmt(info.nextCycleStart));
  setText("ovulation-date", fmt(info.ovulation));
  setText("fertile-window", `${fmt(info.fertileStart)} - ${fmt(info.fertileEnd)}`);
  setText("cycle-length-display", `${appData.cycleLength} ${t("days")}`);
  setText("days-countdown", Math.max(0, Math.ceil((info.nextCycleStart - new Date()) / DAY)));
  setText("current-cycle-day", info.cycleDay);
  setText("cycle-day-text", `${t("days_until")} ${t("next_period").toLowerCase()}`);
  updatePhaseBadge(document.getElementById("phase-badge"), info.cycleDay);
  updatePhaseBadge(document.getElementById("insight-phase-badge"), info.cycleDay);
}
function updateProgressRing() {
  const ring = document.getElementById("ring-progress");
  if (!ring || !appData.lastPeriodDate) return;
  const info = getCycleInfo(new Date());
  const percent = Math.min(1, info.cycleDay / appData.cycleLength);
  const circumference = 2 * Math.PI * 100;
  ring.style.strokeDashoffset = `${circumference - percent * circumference}`;
}
function updatePhaseBadge(el, cycleDay) {
  if (!el) return;
  const {
    periodLength, cycleLength }
    = appData;
  let phase = "phase_follicular";
  if (cycleDay <= periodLength) phase = "phase_menstrual";
  else if (cycleDay >= cycleLength - 14 - 1 && cycleDay <= cycleLength - 14 + 1) phase = "phase_ovulation";
  else if (cycleDay > cycleLength - 14 + 1) phase = "phase_luteal";
  el.textContent = t(phase);
  el.className = `phase-badge ${phase}`;
}
function updatePhaseInsight() {
  const tipEl = document.getElementById("phase-tip");
  if (!tipEl || !appData.lastPeriodDate) return;
  const {
    cycleDay }
    = getCycleInfo(new Date());
  let tip = "Log your symptoms daily to see smarter insights. Stay hydrated and keep moving today.";
  if (cycleDay <= appData.periodLength) {
    tip = "Rest, hydrate, and focus on gentle stretches during your menstrual days.";
  }
  else if (cycleDay < appData.cycleLength - 14 - 2) {
    tip = "Follicular phase: great time for creative work and strength training.";
  }
  else if (cycleDay >= appData.cycleLength - 15 && cycleDay <= appData.cycleLength - 13) {
    tip = "Ovulation window: energy may be higher; schedule important tasks.";
  }
  else {
    tip = "Luteal phase: prioritize sleep, balanced meals, and lighter workouts.";
  }
  tipEl.textContent = tip;
}
function bindCalendarNav() {
  document.getElementById("prev-month")?.addEventListener("click", () => changeMonth(-1));
  document.getElementById("next-month")?.addEventListener("click", () => changeMonth(1));
}
function changeMonth(delta) {
  currentViewDate.setMonth(currentViewDate.getMonth() + delta);
  renderCalendar();
}
function renderCalendar() {
  const container = document.getElementById("calendar-days");
  if (!container) return;
  container.innerHTML = "";
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthYearLabel = document.getElementById("calendar-month-year");
  monthYearLabel.textContent = firstDay.toLocaleDateString(appData.language, {
    month: "long", year: "numeric"
  }
  );
  const windows = buildCycleWindows();
  for (let i = 0;
    i < startWeekday;
    i++) {
    const spacer = document.createElement("div");
    spacer.className = "calendar-day empty";
    container.appendChild(spacer);
  }
  for (let d = 1;
    d <= daysInMonth;
    d++) {
    const cell = document.createElement("div");
    const date = new Date(year, month, d);
    const iso = toISO(date);
    cell.className = "calendar-day";
    cell.innerHTML = `<span>${d}</span>`;
    const todayIso = toISO(new Date());
    if (iso === todayIso) cell.classList.add("today");
    const log = appData.dailyLogs.find((l) => l.date === iso);
    if (log) cell.classList.add("logged");
    windows.forEach((win) => {
      if (date >= win.start && date <= win.end) cell.classList.add("period");
      if (date >= win.fertileStart && date <= win.fertileEnd) cell.classList.add("fertile");
      if (sameDay(date, win.ovulation)) cell.classList.add("ovulation");
    }
    );
    container.appendChild(cell);
  }
}
function buildCycleWindows() {
  if (!appData.lastPeriodDate) return [];
  const windows = [];
  const start = new Date(appData.lastPeriodDate);
  start.setHours(0, 0, 0, 0);
  const endRange = new Date(currentViewDate);
  endRange.setMonth(endRange.getMonth() + 6);
  let cursor = new Date(start);
  while (cursor <= endRange && windows.length < 24) {
    const periodEnd = new Date(cursor.getTime() + (appData.periodLength - 1) * DAY);
    const ovulation = new Date(cursor.getTime() + (appData.cycleLength - 14) * DAY);
    const fertileStart = new Date(ovulation.getTime() - 3 * DAY);
    const fertileEnd = new Date(ovulation.getTime() + 1 * DAY);
    windows.push({
      start: new Date(cursor), end: periodEnd, ovulation, fertileStart, fertileEnd
    }
    );
    cursor = new Date(cursor.getTime() + appData.cycleLength * DAY);
  }
  return windows;
}
function selectCategory(cat) {
  document.querySelectorAll(".tracking-category").forEach((c) => {
    c.classList.toggle("active", c.dataset.category === cat);
  }
  );
  ["flow", "mood", "symptoms", "energy"].forEach((name) => {
    const panel = document.getElementById(`${name}-options`);
    if (panel) panel.classList.toggle("hidden", name !== cat);
  }
  );
}
function markOption(groupId, value) {
  document.querySelectorAll(`#${groupId} .tracking-option`).forEach((opt) => {
    opt.classList.toggle("selected", opt.dataset.value === value);
  }
  );
}
function selectFlow(val) {
  selectedFlow = val;
  markOption("flow-options", val);
}
function selectMood(val) {
  selectedMood = val;
  markOption("mood-options", val);
}
function selectEnergy(val) {
  selectedEnergy = val;
  markOption("energy-options", val);
}
function toggleSymptom(val) {
  if (selectedSymptoms.includes(val)) {
    selectedSymptoms = selectedSymptoms.filter((s) => s !== val);
  }
  else {
    selectedSymptoms.push(val);
  }
  document.querySelectorAll("#symptoms-options .tracking-option").forEach((opt) => {
    opt.classList.toggle("selected", selectedSymptoms.includes(opt.dataset.value));
  }
  );
}
function updateTrackingSelections() {
  markOption("flow-options", selectedFlow);
  markOption("mood-options", selectedMood);
  markOption("energy-options", selectedEnergy);
  document.querySelectorAll("#symptoms-options .tracking-option").forEach((opt) => {
    opt.classList.toggle("selected", selectedSymptoms.includes(opt.dataset.value));
  }
  );
}
async function saveTracking() {
  const today = toISO(new Date());
  const hasAtLeastOneDetail = Boolean(selectedFlow || selectedMood || selectedEnergy || selectedSymptoms.length);
  if (!hasAtLeastOneDetail) {
    showToast("Please add at least one detail before saving today's log.");
    return;
  }
  const entry = {
    date: today, flow: selectedFlow, mood: selectedMood, energy: selectedEnergy, symptoms: [...selectedSymptoms]
  }
    ;

  const result = await saveLogToBackend(entry);
  if (result.success) {
    upsertDailyLog(entry);
    saveState();
    renderAll();
    showToast("Today's log saved securely");
  } else {
    upsertDailyLog(entry);
    saveState();
    renderAll();
    showToast("Saved locally. Sync will resume when backend is available.");
  }
}
function openMoodModal() {
  showScreen("tracking-screen");
  selectCategory("mood");
}
function openFlowModal() {
  showScreen("tracking-screen");
  selectCategory("flow");
}
function openEnergyModal() {
  showScreen("tracking-screen");
  selectCategory("energy");
}
function openSleepModal() {
  showScreen("tracking-screen");
  selectCategory("symptoms");
}
function renderCharts() {
  renderBarChart("mood-chart", countBy(appData.dailyLogs, "mood"), ["happy", "calm", "sad", "anxious", "irritable", "energetic"]);
  renderBarChart("symptoms-chart", countSymptoms(appData.dailyLogs), ["cramps", "headache", "bloating", "fatigue", "backache", "acne", "cravings", "nausea"]);
  updateStats();
}
function renderBarChart(containerId, counts, keys) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const max = Math.max(1, ...keys.map((k) => counts[k] || 0));
  keys.forEach((key) => {
    const value = counts[key] || 0;
    const item = document.createElement("div");
    item.className = "bar-item";
    const bar = document.createElement("div");
    bar.className = "bar";
    const barHeight = Math.max(34, Math.round((value / max) * 120));
    bar.style.setProperty("--bar-height", `${barHeight}px`);
    bar.innerHTML = `<span class="bar-value">${value}</span>`;
    const label = document.createElement("span");
    label.className = "bar-label";
    label.textContent = formatKey(key);
    item.appendChild(bar);
    item.appendChild(label);
    container.appendChild(item);
  }
  );
}
function formatKey(key) {
  const prettyKeyMap = {
    mood_swings: "Mood Swings",
    breast_tenderness: "Breast Tenderness",
    backache: "Back Pain"
  };
  return prettyKeyMap[key] || key.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
function countBy(list, key) {
  return list.reduce((acc, item) => {
    if (item[key]) acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }
    , {
    }
  );
}
function countSymptoms(list) {
  const acc = {
  }
    ;
  list.forEach((log) => {
    (log.symptoms || []).forEach((s) => {
      acc[s] = (acc[s] || 0) + 1;
    }
    );
  }
  );
  return acc;
}
function updateStats() {
  const measuredPeriods = appData.cycleHistory.filter((c) => c.actualStart && c.actualEnd).map((c) => Math.max(1, Math.round((new Date(c.actualEnd) - new Date(c.actualStart)) / DAY) + 1));
  const measuredCycles = getMeasuredCycleLengths();
  const avgCycle = measuredCycles.length ? average(measuredCycles) : appData.cycleLength;
  const avgPeriod = measuredPeriods.length ? average(measuredPeriods) : appData.periodLength;
  const accuracy = computePredictionAccuracy();
  setText("avg-cycle-length", Math.round(avgCycle));
  setText("avg-period-length", Math.round(avgPeriod));
  setText("total-cycles", buildCycleWindows().length);
  setText("prediction-accuracy", accuracy);
}
function renderHistory() {
  const list = document.getElementById("cycle-history-list");
  if (!list) return;
  list.innerHTML = "";
  const entries = (appData.cycleHistory.length ? appData.cycleHistory : buildCycleWindows()).slice(0, 6);
  entries.forEach((win, idx) => {
    const start = win.actualStart ? new Date(win.actualStart) : win.start;
    const end = win.actualEnd ? new Date(win.actualEnd) : win.end;
    const item = document.createElement("div");
    item.className = "history-item";
    const left = document.createElement("div");
    const title = document.createElement("div");
    title.className = "history-title";
    title.textContent = `Cycle ${idx + 1}`;
    const dates = document.createElement("div");
    dates.className = "history-dates";
    dates.textContent = fmtRange(start, end || start);
    left.appendChild(title);
    left.appendChild(dates);

    const pill = document.createElement("div");
    pill.className = "history-pill";
    pill.textContent = win.deltaDays != null ? `${Math.abs(win.deltaDays)}d off` : t("phase_menstrual");
    item.appendChild(left);
    item.appendChild(pill);
    list.appendChild(item);
  }
  );
}
function fmtRange(start, end) {
  const fmt = (d) => d.toLocaleDateString(appData.language, {
    month: "short", day: "numeric"
  }
  );
  return `${fmt(start)} - ${fmt(end)}`;
}
function getMeasuredCycleLengths() {
  const starts = appData.cycleHistory.filter((c) => c.actualStart).map((c) => new Date(c.actualStart)).sort((a, b) => b - a);
  const lengths = [];
  for (let i = 0;
    i < starts.length - 1;
    i++) {
    lengths.push(Math.max(1, Math.round((starts[i] - starts[i + 1]) / DAY)));
  }
  return lengths;
}
function computePredictionAccuracy() {
  const deltas = appData.cycleHistory.map((c) => c.deltaDays).filter((d) => typeof d === "number");
  if (!deltas.length) return "--";
  const avg = average(deltas);
  const score = Math.max(0, Math.min(100, Math.round(100 - avg * 8)));
  return `${score}%`;
}
function bindChatInput() {
  const input = document.getElementById("chat-input");
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  }
  );
}
function askQuickQuestion(q) {
  const input = document.getElementById("chat-input");
  if (input) {
    input.value = q;
    sendMessage();
  }
}
function compactChatMessage(text) {
  return String(text || "").trim().slice(0, 500);
}
function addToChatContext(role, text) {
  const message = compactChatMessage(text);
  if (!message) return;
  chatContext.push({
    role: role === "assistant" ? "assistant" : "user",
    message
  });
  if (chatContext.length > MAX_CHAT_CONTEXT_ITEMS) {
    chatContext = chatContext.slice(-MAX_CHAT_CONTEXT_ITEMS);
  }
}
function bootstrapChatContext() {
  chatContext = [];
  const bubbles = document.querySelectorAll("#chat-container .chat-bubble");
  bubbles.forEach((bubble) => {
    const role = bubble.classList.contains("user") ? "user" : "assistant";
    addToChatContext(role, bubble.textContent);
  });
}
async function sendMessage() {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const text = input?.value?.trim();
  if (!text) return;

  appendChatBubble(text, "user");
  addToChatContext("user", text);
  input.value = "";
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.classList.add("loading");
  }

  const info = getCycleInfo(new Date());
  const cycleDay = info.cycleDay || 0;
  const phase = document.getElementById("phase-badge")?.textContent || "Unknown";

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        language: appData.language,
        cycleDay: cycleDay,
        phase: phase,
        context: chatContext
      })
    });
    const result = await response.json();
    if (result.success) {
      const assistantReply = compactChatMessage(result.response);
      if (assistantReply) {
        appendChatBubble(assistantReply, "assistant");
        addToChatContext("assistant", assistantReply);
      } else {
        const fallbackReply = generateAssistantResponse(text);
        appendChatBubble(fallbackReply, "assistant");
        addToChatContext("assistant", fallbackReply);
      }
    } else {
      const fallbackReply = generateAssistantResponse(text);
      appendChatBubble(fallbackReply, "assistant");
      addToChatContext("assistant", fallbackReply);
    }
  } catch (e) {
    console.error("Chat error:", e);
    const fallbackReply = generateAssistantResponse(text);
    appendChatBubble(fallbackReply, "assistant");
    addToChatContext("assistant", fallbackReply);
  } finally {
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.classList.remove("loading");
    }
  }
}
function detectLanguage(text) {
  const t = text || "";
  if (/[\u0B80-\u0BFF]/.test(t)) return "ta";
  if (/[\u0C00-\u0C7F]/.test(t)) return "te";
  if (/[\u0980-\u09FF]/.test(t)) return "bn";
  if (/[\u0900-\u097F]/.test(t)) return "hi";
  const lower = t.toLowerCase();
  const hinglishHints = ["kya", "kyu", "kaise", "nahi", "haan", "mera", "meri", "period", "dard", "pet", "bukhar"];
  if (hinglishHints.some((w) => lower.includes(w))) return "hinglish";
  return "en";
}
function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
function getLangPack(lang) {
  const packs = {
    en: {
      name: ASSISTANT_NAME,
      askDetails: "I can help with that. Please share a bit more detail so I can respond accurately.",
      askCycle: "Please share your last period start date and your average cycle length (in days).",
      askSymptoms: "Which symptoms are you experiencing, and how intense are they?",
      serious: "If symptoms are severe, sudden, or bleeding is very heavy, please consult a qualified doctor.",
      gentleCare: [
        "A warm compress, gentle stretching, and steady hydration can help.",
        "Light movement, warm fluids, and regular meals often provide relief.",
        "Prioritize rest and keep your fluid intake consistent."
      ],
      crampsTips: [
        "For cramps, consider heat therapy, gentle stretches, and hydration.",
        "Cramps often ease with warmth, light movement, and consistent fluids.",
        "A warm pad and slow breathing can reduce cramp intensity."
      ],
      pmsTips: [
        "PMS commonly appears in the luteal phase. Regular meals, hydration, and good sleep can help.",
        "PMS often improves with steady routines, light activity, and adequate rest.",
        "For PMS, focus on sleep, balanced meals, and gentle movement."
      ],
      followUps: [
        "How severe is it (mild, moderate, or severe)?",
        "When did it start?",
        "Is anything making it better or worse?"
      ],
      genericHelp:
        "I can help with:\n- period and cycle timing\n- PMS, cramps, and mood changes\n- fertility window questions\n\nWhat would you like to discuss?",
      noData:
        "If you share your last period start date and average cycle length, I can tailor this for you."
    },
    hinglish: {
      name: ASSISTANT_NAME,
      askDetails: "Main madad karna chahti hoon. Sahi jawab ke liye thoda detail bata dijiye.",
      askCycle: "Kripya last period start date aur average cycle length (days me) bata dijiye.",
      askSymptoms: "Abhi kaun se symptoms hain aur intensity kitni hai?",
      serious:
        "Agar symptoms bahut severe hain ya bleeding bahut heavy hai, to kripya qualified doctor se consult karein.",
      gentleCare: [
        "Heat pad, halki stretching, aur hydration se aaram mil sakta hai.",
        "Light walk, warm fluids, aur regular meals help karte hain.",
        "Rest ko priority dein aur paani regularly piyen."
      ],
      crampsTips: [
        "Cramps ke liye heat therapy, gentle stretches, aur hydration try karein.",
        "Garam sek aur halka movement cramps me relief de sakta hai.",
        "Warm pad aur slow breathing se cramps kam ho sakte hain."
      ],
      pmsTips: [
        "PMS aksar luteal phase me hota hai. Regular meals, hydration, aur achchi neend madad karti hai.",
        "PMS me routine, light activity, aur rest se relief mil sakta hai.",
        "PMS ke liye sleep, balanced meals, aur gentle movement par focus karein."
      ],
      followUps: [
        "Intensity mild/medium/severe hai?",
        "Kab se ho raha hai?",
        "Kis cheez se better ya worse hota hai?"
      ],
      genericHelp:
        "Main in topics par madad kar sakti hoon:\n- period aur cycle timing\n- PMS, cramps, mood changes\n- fertility window questions\n\nAap kis baare me baat karna chahenge?",
      noData:
        "Last period start date aur average cycle length batayenge to main zyada accurate guidance de sakti hoon."
    },
    hi: {
      name: ASSISTANT_NAME,
      askDetails: "\u092e\u0948\u0902 \u092e\u0926\u0926 \u0915\u0930\u0928\u093e \u091a\u093e\u0939\u0924\u0940 \u0939\u0942\u0902\u0964 \u0925\u094b\u0921\u093c\u0940 \u0914\u0930 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0926\u0947\u0902?",
      askCycle:
        "\u0915\u0943\u092a\u092f\u093e \u0906\u092a\u0915\u0947 \u092a\u093f\u091b\u0932\u0947 \u092a\u0940\u0930\u093f\u092f\u0921 \u0915\u0940 \u0924\u093e\u0930\u0940\u0916 \u0914\u0930 \u0914\u0938\u0924 \u091a\u0915\u094d\u0930 \u0932\u0902\u092c\u093e\u0908 \u092c\u0924\u093e\u090f\u0902\u0964",
      askSymptoms:
        "\u0905\u092d\u0940 \u0915\u094c\u0928-\u0938\u0947 \u0932\u0915\u094d\u0937\u0923 \u0939\u0948\u0902 \u0914\u0930 \u0926\u0930\u094d\u0926 \u0915\u093f\u0924\u0928\u093e \u0939\u0948?",
      serious:
        "\u0905\u0917\u0930 \u0932\u0915\u094d\u0937\u0923 \u092c\u0939\u0941\u0924 \u0924\u0947\u091c \u0939\u0948\u0902 \u092f\u093e \u092c\u094d\u0932\u0940\u0921\u093f\u0902\u0917 \u092c\u0939\u0941\u0924 \u092d\u093e\u0930\u0940 \u0939\u0948, \u0924\u094b \u0915\u0943\u092a\u092f\u093e \u0921\u0949\u0915\u094d\u091f\u0930 \u0938\u0947 \u0938\u0932\u093e\u0939 \u0932\u0947\u0902\u0964",
      gentleCare: [
        "\u0917\u0930\u092e \u0938\u0947\u0915, \u0939\u0932\u094d\u0915\u0947 \u0938\u094d\u091f\u094d\u0930\u0947\u091a \u0914\u0930 \u0939\u093e\u0907\u0921\u094d\u0930\u0947\u0936\u0928 \u0938\u093e\u0939\u092f\u0915 \u0939\u0948\u0964",
        "\u0939\u0932\u0915\u0940 \u091a\u093e\u0932, \u0917\u0930\u092e \u092a\u0947\u092f \u0914\u0930 \u0928\u093f\u092f\u092e\u093f\u0924 \u092d\u094b\u091c\u0928 \u0915\u0930\u0947\u0902\u0964",
        "\u091c\u093f\u0924\u0928\u093e \u0939\u094b \u0938\u0915\u0947 \u0906\u0930\u093e\u092e \u0915\u0930\u0947\u0902 \u0914\u0930 \u092a\u093e\u0928\u0940 \u092a\u093f\u090f\u0902\u0964"
      ],
      crampsTips: [
        "\u090f\u0902\u0920\u0928 \u0915\u0947 \u0932\u093f\u090f \u0917\u0930\u092e \u0938\u0947\u0915, \u0939\u0932\u094d\u0915\u0947 \u0938\u094d\u091f\u094d\u0930\u0947\u091a \u0914\u0930 \u092a\u093e\u0928\u0940 \u092a\u093f\u092f\u0947\u0902\u0964",
        "\u0917\u0930\u092e\u093e\u0939\u091f \u0914\u0930 \u0939\u0932\u0915\u0940 \u0917\u0924\u093f\u0935\u093f\u0927\u093f \u090f\u0902\u0920\u0928 \u092e\u0947\u0902 \u0930\u093e\u0939\u0924 \u0926\u0947\u0924\u0940 \u0939\u0948\u0964",
        "\u0906\u0930\u093e\u092e \u0914\u0930 \u0927\u0940\u092e\u0940 \u0938\u093e\u0902\u0938 \u090f\u0902\u0920\u0928 \u0915\u094b \u0915\u092e \u0915\u0930 \u0938\u0915\u0924\u0940 \u0939\u0948\u0964"
      ],
      pmsTips: [
        "PMS \u0905\u0915\u094d\u0938\u0930 \u0932\u094d\u092f\u0942\u091f\u093f\u092f\u0932 \u092b\u0947\u091c \u092e\u0947\u0902 \u0939\u094b\u0924\u093e \u0939\u0948\u0964 \u0939\u093e\u0907\u0921\u094d\u0930\u0947\u0936\u0928, \u0938\u092e\u092f \u092a\u0930 \u092d\u094b\u091c\u0928 \u0914\u0930 \u0905\u091a\u094d\u091b\u0940 \u0928\u0940\u0902\u0926 \u092e\u0926\u0926 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964",
        "\u0928\u093f\u092f\u092e\u093f\u0924 \u092d\u094b\u091c\u0928 \u0914\u0930 \u0905\u091a\u094d\u091b\u0940 \u0928\u0940\u0902\u0926 \u0938\u0947 PMS \u092e\u0947\u0902 \u0930\u093e\u0939\u0924 \u092e\u093f\u0932 \u0938\u0915\u0924\u0940 \u0939\u0948\u0964",
        "\u0939\u0932\u0915\u0940 \u0915\u0938\u0930\u0924 \u0914\u0930 \u0906\u0930\u093e\u092e PMS \u092e\u0947\u0902 \u0938\u0939\u093e\u092f\u0915 \u0939\u094b\u0924\u0947 \u0939\u0948\u0902\u0964"
      ],
      followUps: [
        "\u0926\u0930\u094d\u0926 \u0939\u0932\u094d\u0915\u093e/\u092e\u0927\u094d\u092f\u092e/\u0924\u0947\u091c \u0939\u0948?",
        "\u0915\u092c \u0938\u0947 \u0939\u0948?",
        "\u0915\u093f\u0938\u0940 \u091a\u0940\u091c \u0938\u0947 \u0930\u093e\u0939\u0924 \u092e\u093f\u0932\u0924\u0940 \u0939\u0948 \u092f\u093e \u092c\u0922\u093c\u0924\u093e \u0939\u0948?"
      ],
      genericHelp:
        "\u092e\u0948\u0902 \u092a\u0940\u0930\u093f\u092f\u0921, PMS, \u090f\u0902\u0920\u0928, \u092e\u0942\u0921 \u092c\u0926\u0932\u093e\u0935 \u0914\u0930 \u0938\u093e\u0907\u0915\u093f\u0932 \u091f\u093e\u0907\u092e\u093f\u0902\u0917 \u092e\u0947\u0902 \u092e\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u0940 \u0939\u0942\u0902\u0964 \u0906\u092a \u0915\u094d\u092f\u093e \u091c\u093e\u0928\u0928\u093e \u091a\u093e\u0939\u0924\u0947 \u0939\u0948\u0902?",
      noData:
        "\u0905\u0917\u0930 \u0906\u092a \u0905\u092a\u0928\u0947 \u092a\u093f\u091b\u0932\u0947 \u092a\u0940\u0930\u093f\u092f\u0921 \u0915\u0940 \u0924\u093e\u0930\u0940\u0916 \u0914\u0930 \u0914\u0938\u0924 \u091a\u0915\u094d\u0930 \u0932\u0902\u092c\u093e\u0908 \u092c\u0924\u093e\u090f\u0902, \u0924\u094b \u092e\u0948\u0902 \u092a\u0930\u094d\u0938\u0928\u0932\u093e\u0907\u091c\u094d\u0921 \u0905\u0928\u0941\u092e\u093e\u0928 \u0926\u0947 \u0938\u0915\u0924\u0940 \u0939\u0942\u0902\u0964"
    },
    bn: {
      name: ASSISTANT_NAME,
      askDetails:
        "\u0986\u09ae\u09bf \u09b8\u09be\u09b9\u09be\u09af\u09cd\u09af \u0995\u09b0\u09a4\u09c7 \u099a\u09be\u0987\u0964 \u098f\u0995\u099f\u09c1 \u09ac\u09bf\u09b8\u09cd\u09a4\u09be\u09b0\u09bf\u09a4 \u09ac\u09b2\u09ac\u09c7\u09a8?",
      askCycle:
        "\u0986\u09aa\u09a8\u09be\u09b0 \u09b6\u09c7\u09b7 \u09aa\u09bf\u09b0\u09bf\u09df\u09a1 \u09b6\u09c1\u09b0\u09c1\u09b0 \u09a4\u09be\u09b0\u09bf\u0996 \u098f\u09ac\u0982 \u0997\u09dc \u099a\u0995\u09cd\u09b0 \u09b2\u0999\u09cd\u0998\u09cd\u09af \u09ac\u09b2\u09c1\u09a8\u0964",
      askSymptoms:
        "\u098f\u0996\u09a8 \u0995\u09c0 \u09b2\u0995\u09cd\u09b7\u09a3 \u0986\u099b\u09c7 \u098f\u09ac\u0982 \u09ac\u09cd\u09af\u09a5\u09be \u0995\u09a4\u099f\u09be \u09a4\u09c0\u09ac\u09cd\u09b0?",
      serious:
        "\u09b2\u0995\u09cd\u09b7\u09a3 \u0996\u09c1\u09ac \u09a4\u09c0\u09ac\u09cd\u09b0 \u09b9\u09b2\u09c7 \u0985\u09a5\u09ac\u09be \u09b0\u0995\u09cd\u09a4\u0995\u09cd\u09b7\u09b0\u09a3 \u0985\u09a4\u09cd\u09af\u09a7\u09bf\u0995 \u09b9\u09b2\u09c7 \u09a1\u09be\u0995\u09cd\u09a4\u09be\u09b0\u09c7\u09b0 \u09aa\u09b0\u09be\u09ae\u09b0\u09cd\u09b6 \u09a8\u09bf\u09a8\u0964",
      genericHelp:
        "\u0986\u09ae\u09bf \u09aa\u09bf\u09b0\u09bf\u09df\u09a1, PMS, \u0995\u09cd\u09af\u09be\u09ae\u09cd\u09aa\u09b8, \u09ae\u09c1\u09a1 \u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 \u0993 \u09b8\u09be\u0987\u0995\u09c7\u09b2 \u099f\u09be\u0987\u09ae\u09bf\u0982\u09b0 \u09ac\u09cd\u09af\u09be\u09aa\u09be\u09b0\u09c7 \u09b8\u09be\u09b9\u09be\u09af\u09cd\u09af \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf\u0964 \u0995\u09c0 \u099c\u09be\u09a8\u09a4\u09c7 \u099a\u09be\u09a8?",
      noData:
        "\u09aa\u09bf\u09b0\u09bf\u09df\u09a1 \u09b6\u09c1\u09b0\u09c1\u09b0 \u09a4\u09be\u09b0\u09bf\u0996 \u098f\u09ac\u0982 \u0997\u09dc \u099a\u0995\u09cd\u09b0 \u09b2\u0999\u09cd\u0998\u09cd\u09af \u09ac\u09b2\u09b2\u09c7 \u0986\u09ae\u09bf \u09ad\u09be\u09b2\u09cb \u09ad\u09be\u09ac\u09c7 \u09ac\u09b2\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u0964"
    },
    ta: {
      name: ASSISTANT_NAME,
      askDetails:
        "\u0ba8\u0bbe\u0ba9\u0bcd \u0b89\u0ba4\u0bb5 \u0bb5\u0bbf\u0bb0\u0bc1\u0bae\u0bcd\u0baa\u0bc1\u0b95\u0bbf\u0bb1\u0bc7\u0ba9\u0bcd. \u0b95\u0bca\u0b9e\u0bcd\u0b9a\u0bae\u0bcd \u0bb5\u0bbf\u0bb5\u0bb0\u0bae\u0bcd \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bbe?",
      askCycle:
        "\u0b95\u0b9f\u0bbf\u0bb8\u0bbf \u0bae\u0bbe\u0ba4\u0bb5\u0bbf\u0b9f\u0bcb\u0bb2\u0bbf\u0bb2\u0bcd \u0ba4\u0bc6\u0bbe\u0b9f\u0b99\u0bcd\u0b95\u0bbf\u0baf \u0ba4\u0bc7\u0ba4\u0bbf\u0baf\u0bc1\u0bae\u0bcd, \u0b92\u0b9f\u0bcd\u0b9f\u0bc1\u0bae\u0bca\u0ba4\u0bcd\u0ba4 \u0b9a\u0bc1\u0b95\u0bcd\u0bb0 \u0ba8\u0bc0\u0bb3\u0bae\u0bcd \u0bb8\u0bca\u0bb2\u0bcd\u0bb2\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bbe.",
      askSymptoms:
        "\u0b87\u0baa\u0bcd\u0baa\u0bcb\u0ba4\u0bc1 \u0b8e\u0ba9\u0bcd\u0ba9 \u0b85\u0bb2\u0b95\u0bcd\u0b95\u0bae\u0bcd? \u0bb5\u0bb2\u0bbf \u0b8e\u0ba4\u0bc1 \u0b85\u0bb3\u0bb5\u0bc1?",
      serious:
        "\u0bae\u0bc0\u0bb1\u0bcd\u0bb1 \u0b85\u0bb2\u0b95\u0bcd\u0b95\u0bae\u0bcd \u0b85\u0ba4\u0bbf\u0b95\u0bae\u0bb3\u0bb5\u0bbf\u0bb2\u0bcd \u0b87\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bbe\u0bb2\u0bcd \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0bb0\u0ba4\u0bcd\u0ba4\u0b95\u0bca\u0b9f\u0bc8 \u0bae\u0bbf\u0b95\u0bc1\u0ba8\u0bcd\u0ba4\u0bbe\u0bb2\u0bcd \u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bc8 \u0b85\u0ba3\u0bc1\u0b95\u0bb5\u0bc1\u0bae\u0bcd.",
      genericHelp:
        "\u0b87\u0ba9\u0bcd\u0ba4\u0bbf\u0bb0\u0bcd\u0baa\u0bbf\u0bb0\u0bbf\u0baf\u0ba4\u0bcd\u0ba4\u0bc1, PMS, \u0b95\u0bcd\u0bb0\u0bbe\u0bae\u0bcd\u0baa\u0bcd\u0bb8\u0bcd, \u0bae\u0bc2\u0b9f\u0bcd \u0bae\u0bbe\u0bb1\u0bc1\u0ba4\u0bb2\u0bcd, \u0b9a\u0bc1\u0b95\u0bcd\u0bb0 \u0ba8\u0bc7\u0bb0\u0bae\u0bcd \u0baa\u0bb1\u0bcd\u0bb1\u0bbf \u0ba8\u0bbe\u0ba9\u0bcd \u0b89\u0ba4\u0bb5 \u0baa\u0ba3\u0bbf\u0ba4\u0bcd\u0ba4\u0bbf\u0b9f\u0bc7\u0ba9\u0bcd. \u0b8e\u0ba9\u0bcd\u0ba9 \u0bae\u0bc7\u0bb2\u0bcd \u0baa\u0bc7\u0b9a \u0bb5\u0bbf\u0bb0\u0bc1\u0bae\u0bcd\u0baa\u0bc1\u0b95\u0bbf\u0bb1\u0bc0\u0bb0\u0bcd?",
      noData:
        "\u0b95\u0b9f\u0bbf\u0bb8\u0bbf \u0bae\u0bbe\u0ba4\u0bb5\u0bbf\u0b9f\u0bcb\u0bb2\u0bbf\u0bb2\u0bcd \u0ba4\u0bc6\u0bbe\u0b9f\u0b99\u0bcd\u0b95\u0bbf\u0baf \u0ba4\u0bc7\u0ba4\u0bbf \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b9a\u0bc1\u0b95\u0bcd\u0bb0 \u0ba8\u0bc0\u0bb3\u0bae\u0bcd \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bbf\u0ba9\u0bbe\u0bb2\u0bcd \u0b9a\u0bb0\u0bbf\u0baf\u0bbe\u0b95 \u0baa\u0bb0\u0bcd\u0bb8\u0ba9\u0bb2\u0bcd \u0b9a\u0bc6\u0baf\u0bcd\u0baf \u0bae\u0bc1\u0b9f\u0bbf\u0baf\u0bc1\u0bae\u0bcd."
    },
    te: {
      name: ASSISTANT_NAME,
      askDetails:
        "\u0c28\u0c3e\u0c28\u0c41 \u0c38\u0c39\u0c3e\u0c2f\u0c02 \u0c1a\u0c47\u0c2f\u0c3e\u0c32\u0c28\u0c41\u0c15\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c28\u0c41. \u0c24\u0c4a\u0c21\u0c3f\u0c97\u0c3e \u0c35\u0c3f\u0c35\u0c30\u0c02 \u0c1a\u0c46\u0c2a\u0c4d\u0c2a\u0c02\u0c21\u0c3f?",
      askCycle:
        "\u0c2e\u0c40 \u0c1a\u0c3f\u0c35\u0c30\u0c3f \u0c2a\u0c40\u0c30\u0c3f\u0c2f\u0c21\u0c4d \u0c06\u0c30\u0c02\u0c2d \u0c24\u0c47\u0c26\u0c40, \u0c38\u0c3e\u0c27\u0c3e\u0c30\u0c23 \u0c38\u0c3e\u0c15\u0c7f\u0c32\u0c4d \u0c28\u0c3f\u0c31\u0c4d\u0c32\u0c02\u0c2c\u0c02 \u0c1a\u0c46\u0c2a\u0c4d\u0c2a\u0c02\u0c21\u0c3f.",
      askSymptoms:
        "\u0c2a\u0c4d\u0c30\u0c38\u0c4d\u0c24\u0c41\u0c24\u0c02 \u0c0e\u0c35\u0c41\u0c1f\u0c3f \u0c32\u0c15\u0c4d\u0c37\u0c23\u0c3e\u0c32\u0c41 \u0c09\u0c28\u0c4d\u0c28\u0c3e\u0c2f\u0c3f? \u0c28\u0c4a\u0c2a\u0c4d\u0c2a\u0c3f \u0c0e\u0c02\u0c24 \u0c24\u0c40\u0c35\u0c4d\u0c30\u0c02\u0c17\u0c3e \u0c09\u0c02\u0c26\u0c3f?",
      serious:
        "\u0c32\u0c15\u0c4d\u0c37\u0c23\u0c3e\u0c32\u0c41 \u0c24\u0c40\u0c35\u0c4d\u0c30\u0c02\u0c17\u0c3e \u0c09\u0c02\u0c1f\u0c47 \u0c32\u0c47\u0c26\u0c3e \u0c30\u0c15\u0c4d\u0c24\u0c38\u0c4d\u0c30\u0c3e\u0c35\u0c02 \u0c1a\u0c3e\u0c32\u0c3e \u0c2d\u0c3e\u0c30\u0c40\u0c17\u0c3e \u0c09\u0c02\u0c1f\u0c47 \u0c21\u0c3e\u0c15\u0c4d\u0c1f\u0c30\u0c4d\u0c28\u0c3f \u0c38\u0c02\u0c2a\u0c4d\u0c30\u0c26\u0c3f\u0c02\u0c1a\u0c02\u0c21\u0c3f.",
      genericHelp:
        "\u0c2a\u0c40\u0c30\u0c3f\u0c2f\u0c21\u0c4d\u0c38\u0c4d, PMS, \u0c15\u0c4d\u0c30\u0c3e\u0c2e\u0c4d\u0c2a\u0c4d\u0c38\u0c4d, \u0c2e\u0c42\u0c21\u0c4d \u0c2e\u0c3e\u0c30\u0c4d\u0c2a\u0c41\u0c32\u0c41, \u0c38\u0c3e\u0c15\u0c7f\u0c32\u0c4d \u0c1f\u0c48\u0c2e\u0c3f\u0c02\u0c17\u0c4d \u0c2a\u0c4d\u0c30\u0c38\u0c4d\u0c28\u0c32\u0c41 \u0c17\u0c41\u0c30\u0c3f\u0c02\u0c1a\u0c3f \u0c28\u0c47\u0c28\u0c41 \u0c38\u0c39\u0c3e\u0c2f\u0c02 \u0c1a\u0c47\u0c2f\u0c41\u0c24\u0c3e\u0c28\u0c41. \u0c2e\u0c40\u0c15\u0c41 \u0c0f\u0c2e\u0c3f \u0c15\u0c3e\u0c35\u0c3e\u0c32\u0c3f?",
      noData:
        "\u0c2e\u0c40 \u0c1a\u0c3f\u0c35\u0c30\u0c3f \u0c2a\u0c40\u0c30\u0c3f\u0c2f\u0c21\u0c4d \u0c06\u0c30\u0c02\u0c2d \u0c24\u0c47\u0c26\u0c40 \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c38\u0c3e\u0c27\u0c3e\u0c30\u0c23 \u0c38\u0c3e\u0c15\u0c7f\u0c32\u0c4d \u0c28\u0c3f\u0c31\u0c4d\u0c32\u0c02\u0c2c\u0c02 \u0c1a\u0c46\u0c2a\u0c4d\u0c2a\u0c02\u0c21\u0c3f \u0c05\u0c2a\u0c4d\u0c2a\u0c41\u0c21\u0c41 \u0c2a\u0c30\u0c4d\u0c38\u0c28\u0c32\u0c48\u0c1c\u0c4d\u0c21\u0c4d \u0c05\u0c28\u0c41\u0c2e\u0c3e\u0c28\u0c02 \u0c07\u0c35\u0c4d\u0c35\u0c17\u0c32\u0c28\u0c41."
    },
    mr: {
      name: ASSISTANT_NAME,
      askDetails:
        "\u092e\u0932\u093e \u092e\u0926\u0924 \u0915\u0930\u093e\u092f\u091a\u0940 \u0906\u0939\u0947. \u0925\u094b\u0921\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0926\u0947\u0924\u093e \u0915\u093e?",
      askCycle:
        "\u0915\u0943\u092a\u092f\u093e \u0906\u092a\u0932\u094d\u092f\u093e \u0936\u0947\u0935\u091f\u091a\u094d\u092f\u093e \u092a\u0940\u0930\u093f\u092f\u0921\u091a\u0940 \u0924\u093e\u0930\u0940\u0916 \u0906\u0923\u093f \u0938\u0930\u093e\u0938\u0930\u0940 \u091a\u0915\u094d\u0930 \u0932\u093e\u0902\u092c\u0940 \u0938\u093e\u0902\u0917\u093e.",
      askSymptoms:
        "\u0938\u0927\u094d\u092f\u093e \u0915\u094b\u0923\u0924\u0940 \u0932\u0915\u094d\u0937\u0923\u0947 \u0906\u0939\u0947\u0924 \u0906\u0923\u093f \u0926\u0941\u0916\u0923\u0947 \u0915\u093f\u0924\u0940 \u0924\u0940\u0935\u094d\u0930 \u0906\u0939\u0947?",
      serious:
        "\u0932\u0915\u094d\u0937\u0923\u0947 \u0905\u0924\u093f\u0936\u092f \u0924\u0940\u0935\u094d\u0930 \u0906\u0939\u0947\u0924 \u0915\u093f\u0902\u0935\u093e \u0930\u0915\u094d\u0924\u0938\u094d\u0930\u093e\u0935 \u0916\u0942\u092a \u091c\u093e\u0938\u094d\u0924 \u0905\u0938\u0947\u0932 \u0924\u0930 \u0915\u0943\u092a\u092f\u093e \u0921\u0949\u0915\u094d\u091f\u0930\u091a\u093e \u0938\u0932\u094d\u0932\u093e \u0918\u094d\u092f\u093e.",
      genericHelp:
        "\u092a\u0940\u0930\u093f\u092f\u0921, PMS, \u0915\u094d\u0930\u0945\u092e\u094d\u092a\u094d\u0938, \u092e\u0942\u0921 \u092c\u0926\u0932 \u0906\u0923\u093f \u091a\u0915\u094d\u0930 \u091f\u093e\u0907\u092e\u093f\u0902\u0917 \u092f\u093e\u092c\u0926\u094d\u0926\u0932 \u092e\u0932\u093e \u092e\u0926\u0924 \u0915\u0930\u0924\u093e \u092f\u0947\u0908\u0932. \u0906\u092a\u0923 \u0915\u093e\u092f \u0935\u093f\u091a\u093e\u0930\u0924 \u0906\u0939\u093e\u0924?",
      noData:
        "\u0906\u092a\u0932\u094d\u092f\u093e \u0936\u0947\u0935\u091f\u091a\u094d\u092f\u093e \u092a\u0940\u0930\u093f\u092f\u0921\u091a\u0940 \u0924\u093e\u0930\u0940\u0916 \u0906\u0923\u093f \u0938\u0930\u093e\u0938\u0930\u0940 \u091a\u0915\u094d\u0930 \u0932\u093e\u0902\u092c\u0940 \u0938\u093e\u0902\u0917\u093f\u0924\u0932\u094d\u092f\u093e\u0938 \u092e\u0940 \u0905\u0927\u093f\u0915 \u092a\u0930\u094d\u0938\u0928\u0932\u093e\u0907\u091c\u094d\u0921 \u0905\u0928\u0941\u092e\u093e\u0928 \u0926\u0947\u0908\u0928."
    }
  };
  return packs[lang] || packs.en;
}

function generateAssistantResponse(question) {
  // â”€â”€ System Prompt Context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Zyra is an intelligent, friendly, intent-first AI assistant for menstrual
  // health. She understands English, Hindi, Hinglish, and mixed languages.
  // She never gives robotic one-liners. She adapts tone to the user.
  // She focuses on the INTENT of the message, not just keywords.
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const info = getCycleInfo(new Date());
  const fmt = (d) => (d ? d.toLocaleDateString(appData.language, { month: "short", day: "numeric" }) : "--");
  const lang = detectLanguage(question);
  const pack = getLangPack(lang);
  const lower = (question || "").toLowerCase().trim();
  const hasCycle = Boolean(appData.lastPeriodDate);
  const userName = (appData.userName && appData.userName !== "Luna") ? appData.userName : "";
  const hi = userName ? `${userName}, ` : "";

  // Latest log context
  const latestLog = appData.dailyLogs.reduce((acc, item) =>
    (!acc || item.date > acc.date ? item : acc), null) || null;
  const latestSymptoms = latestLog?.symptoms?.length ? latestLog.symptoms : null;
  const symCtx = latestSymptoms
    ? `\n\nðŸ“ Last logged (${fmt(new Date(latestLog.date))}): ${latestSymptoms.map(formatKey).join(", ")}.`
    : "";

  // Phase helpers
  const getPhaseKey = (day) => {
    if (!hasCycle || !day) return "phase_follicular";
    if (day <= appData.periodLength) return "phase_menstrual";
    if (day >= appData.cycleLength - 15 && day <= appData.cycleLength - 13) return "phase_ovulation";
    if (day > appData.cycleLength - 13) return "phase_luteal";
    return "phase_follicular";
  };
  const phaseKey = hasCycle ? getPhaseKey(info.cycleDay) : null;
  const daysLeft = hasCycle ? Math.max(0, Math.ceil((info.nextCycleStart - new Date()) / DAY)) : null;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // â”€â”€ Serious symptoms â†’ refer to doctor immediately â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const seriousFlags = ["severe bleed", "very heavy bleed", "soaking pad", "faint", "fainting",
    "high fever", "unconscious", "chest pain", "vomiting blood", "blood clot", "can't move",
    "emergency", "hospital"];
  if (seriousFlags.some(f => lower.includes(f))) {
    return `${hi}these symptoms sound serious. Please consult a doctor or visit a clinic as soon as possible. Don't delay - your health matters most. ðŸ¥`;
  }

  // â”€â”€ INTENT: Greeting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const greetWords = ["hi", "hello", "hey", "namaste", "hii", "hlo", "helo", "namaskar",
    "good morning", "good evening", "good afternoon", "good night", "sup", "yo"];
  if (greetWords.some(w => lower === w || lower.startsWith(w + " ") || lower.startsWith(w + "!"))) {
    if (hasCycle) {
      return `Hey ${hi}I'm Zyra! \n\nYou're on cycle day ${info.cycleDay} (${phaseName(info.cycleDay)} phase) with ${daysLeft} day${daysLeft === 1 ? "" : "s"} until your next period.\n\nHow can I help you today? You can ask me about symptoms, mood, nutrition, sleep - anything!`;
    }
    return `Hey ${hi}I'm Zyra!  Your personal cycle & wellness companion.\n\nI can help with:\n- Period & cycle timing\n- Symptoms (cramps, bloating, fatigue...)\n- Mood & emotional support\n- Nutrition & sleep tips\n- Fertility & ovulation\n\nWhat's on your mind?`;
  }

  // â”€â”€ INTENT: How are you / small talk â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/how are you|how r u|how do you|aap kaisi|kaise ho|theek ho/.test(lower)) {
    return "I'm doing great, thank you for asking! ðŸ˜Š I'm here and ready to help you with anything about your cycle, health, or wellness. What would you like to know?";
  }

  // â”€â”€ INTENT: Next period â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/next period|when.*period|period.*when|period.*date|period kab|agli date|period aayega|aayegi|due date/.test(lower)) {
    if (!hasCycle) return `${pack.askCycle}\n\n${pack.noData}`;
    if (daysLeft === 0) {
      return `${hi}your period is expected to start **today** (${fmt(info.nextCycleStart)})! ðŸ©¸\n\nMake sure you're prepared. You may already be feeling early symptoms like cramps or mood shifts. Take it easy today.`;
    }
    if (daysLeft <= 3) {
      return `${hi}your period is coming up very soon - expected around **${fmt(info.nextCycleStart)}** (just ${daysLeft} day${daysLeft === 1 ? "" : "s"} away). ðŸ©¸\n\nYou're in the late luteal phase now. It's normal to feel:\n- Bloating or cramps starting\n- Mood sensitivity\n- Fatigue or breast tenderness\n\nStock up on supplies and get some extra rest!`;
    }
    return `${hi}your next period is expected around **${fmt(info.nextCycleStart)}** - that's ${daysLeft} days from now.\n\nYou're currently on cycle day ${info.cycleDay} (${phaseName(info.cycleDay)} phase). If your cycle shifts, update your last period date in settings for better accuracy.`;
  }

  // â”€â”€ INTENT: Current phase / cycle day â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/phase|cycle day|which day|kon sa phase|kaunsa|which phase|abhi kaunsa|current phase/.test(lower)) {
    if (!hasCycle) return `${pack.askCycle}\n\n${pack.noData}`;
    const phaseDescriptions = {
      phase_menstrual: "ðŸ©¸ **Menstrual Phase** - Your body is shedding the uterine lining. Prioritize rest, warmth, and gentle movement. Iron-rich foods (spinach, lentils, eggs) help replenish what you lose.",
      phase_follicular: "ðŸŒ± **Follicular Phase** - Estrogen rises and you naturally gain more energy and focus. This is a great time for creative work, learning, and strength training.",
      phase_ovulation: "âœ¨ **Ovulation Phase** - Peak energy and confidence! You're at your most communicative and social. This is also your highest fertility window.",
      phase_luteal: "ðŸŒ™ **Luteal Phase** - Progesterone rises after ovulation. You may feel more introverted and sensitive. Focus on sleep, magnesium-rich foods, and reducing stress."
    };
    return `${hi}you're on **cycle day ${info.cycleDay}** - in your **${phaseName(info.cycleDay)}** phase.\n\n${phaseDescriptions[phaseKey]}\n\nâ³ Next period in **${daysLeft} days** (${fmt(info.nextCycleStart)}).${symCtx}`;
  }

  // â”€â”€ INTENT: Ovulation / fertile window / conception â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/ovulation|fertile|fertility|conceive|baby|pregnant|garbh|pregnancy|bachha/.test(lower)) {
    if (!hasCycle) return `${pack.askCycle}\n\n${pack.noData}`;
    return `${hi}your estimated **fertile window** is **${fmt(info.fertileStart)} â€“ ${fmt(info.fertileEnd)}**, with ovulation around **${fmt(info.ovulation)}**.\n\nðŸŒŸ During this window:\n- Cervical mucus becomes clear and stretchy (like egg whites)\n- Basal body temperature rises slightly after ovulation\n- You may feel mild pelvic discomfort (mittelschmerz)\n- Energy and libido are typically higher\n\nFor conception, the best days are 1â€“2 days before ovulation and on the ovulation day itself.`;
  }

  // â”€â”€ INTENT: Cramps / period pain â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/cramp|period pain|pelvic pain|abdomen.*pain|pain.*abdomen|dard|pet.*dard|dard.*pet|enth|à¤à¤‚à¤ à¤¨|uterine pain/.test(lower)) {
    return `${hi}period cramps (dysmenorrhea) are caused by prostaglandins - chemicals that make the uterus contract. Very common, very real!\n\n**Quick relief:**\n- ðŸ”¥ Heat pad on lower abdomen (15â€“20 min) - works as well as ibuprofen for many\n- ðŸ’Š Ibuprofen/naproxen taken at the *start* of cramps (not after they peak)\n- ðŸµ Ginger or chamomile tea - natural anti-inflammatory\n- ðŸ§˜ Gentle yoga: child's pose, supine twist, cat-cow\n- ðŸš¶ A light 10-min walk can reduce cramp intensity\n\n**For ongoing relief:** Magnesium supplements (200â€“300mg/day) taken throughout your cycle are shown to reduce cramp severity.${symCtx}`;
  }

  // â”€â”€ INTENT: Headache / migraine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/headache|head.*ache|migraine|head.*hurt|sir.*dard|sirdard|brain.*pain/.test(lower)) {
    return `${hi}hormonal headaches typically strike just before your period (when estrogen drops sharply) or around ovulation.\n\n**What helps:**\n- ðŸ’§ Stay hydrated - dehydration amplifies hormonal headaches\n- ðŸŒ‘ Rest in a dark, quiet room\n- ðŸ§Š Cold compress on the forehead or back of neck\n- â˜• Small amount of caffeine can help (but avoid regular dependency)\n- ðŸ’Š Magnesium glycinate (400mg/day) is well-studied for reducing menstrual migraine frequency\n- ðŸ˜´ Keep a consistent sleep schedule - irregular sleep triggers migraines\n\nIf headaches are severe, one-sided, or come with vision changes, please see a doctor.${symCtx}`;
  }

  // â”€â”€ INTENT: Bloating â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/bloat|swollen|puff|gas|gassy|fuller|heavy stomach|pet.*fool|à¤«à¥‚à¤²à¤¨à¤¾/.test(lower)) {
    return `${hi}bloating before and during periods is caused by hormonal shifts (especially progesterone and prostaglandins) that cause water retention and slow digestion.\n\n**Bloating busters:**\n- ðŸš« Reduce salt, processed food, and carbonated drinks\n- ðŸµ Peppermint or fennel tea eases gas\n- ðŸ¥— Eat smaller, more frequent meals\n- ðŸš¶ Light walking after meals improves gut motility\n- ðŸ’Š Magnesium and vitamin B6 reduce water retention\n- ðŸ¥’ Potassium-rich foods (banana, avocado) help flush excess fluid${symCtx}`;
  }

  // â”€â”€ INTENT: Fatigue / tiredness / weakness â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/tired|fatigue|exhausted|no energy|low energy|weak|weakness|lethargic|thakan|à¤¥à¤•à¤¾à¤¨|kami.*energy/.test(lower)) {
    return `${hi}fatigue is extremely common during your period and in the days before it.\n\n**Why it happens:** Blood loss can reduce iron, progesterone is naturally sedating, and your body is working hard.\n\n**Energy recovery:**\n- ðŸ¥© Iron-rich foods: spinach, lentils, red meat, pumpkin seeds\n- ðŸŠ Pair iron with vitamin C (lemon, orange) for better absorption\n- ðŸ˜´ Protect your sleep - even one bad night worsens fatigue significantly\n- ðŸš¶ A 10-min brisk walk paradoxically boosts energy\n- ðŸ« Dark chocolate (70%+) gives magnesium + mild energy\n- â˜• Limit caffeine after 2pm so it doesn't wreck your sleep${symCtx}`;
  }

  // â”€â”€ INTENT: Mood / emotions / anxiety / stress â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/mood|emotion|anxious|anxiety|irritable|irritat|sad|depress|stress|nervous|upset|angry|crying|rona|gussa|chidchida|à¤šà¤¿à¤¡à¤¼|à¤®à¥‚à¤¡|emotional/.test(lower)) {
    const isLuteal = phaseKey === "phase_luteal";
    const context = isLuteal
      ? `You're in the **luteal phase** right now - when progesterone peaks and serotonin tends to dip. Mood sensitivity is completely hormonal and real.`
      : `Mood changes can happen at different points in your cycle based on hormone shifts.`;
    return `${hi}${context}\n\n**This is valid. Your feelings are real and hormone-driven.**\n\nðŸ’› What can help:\n- Acknowledge it without judgment - there's nothing "wrong" with you\n- ðŸŸ Omega-3s (fish, walnuts, flaxseed) support serotonin production\n- ðŸƒ Even 20 min of exercise releases endorphins\n- ðŸ““ Journaling - track how your mood shifts across your cycle (patterns emerge!)\n- ðŸ§˜ Deep breathing or short meditation reduces cortisol\n- â˜• Reduce caffeine and alcohol (both amplify anxiety)\n- ðŸ’¬ Reaching out to someone you trust genuinely helps${symCtx}`;
  }

  // â”€â”€ INTENT: Sleep â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/sleep|insomnia|can'?t sleep|not sleeping|neend|à¤¨à¥€à¤‚à¤¦|raat.*neend|sleep.*problem|poor sleep/.test(lower)) {
    return `${hi}sleep disruption is especially common in the luteal phase (1â€“2 weeks before your period) due to rising body temperature and progesterone changes.\n\n**Sleep tips synced to your cycle:**\n- ðŸŒ¡ï¸ Keep your room cool (18â€“20Â°C) - body temp rises before your period\n- ðŸ“± No screens 1 hour before bed - blue light delays melatonin\n- ðŸµ Chamomile or ashwagandha tea before bed\n- ðŸ’Š Magnesium glycinate (300mg) before sleep improves quality\n- ðŸŽ¯ Same wake time every day - anchors your sleep rhythm\n- ðŸ”¥ For cramp-disrupted sleep, a heating pad nearby helps\n- Avoid naps longer than 25 min if you're struggling at night${symCtx}`;
  }

  // â”€â”€ INTENT: Nausea â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/nausea|nauseous|vomit|sick|queasy|ulti|à¤‰à¤²à¥à¤Ÿà¥€|michal|à¤®à¤¿à¤šà¤²à¥€/.test(lower)) {
    return `${hi}nausea during your period is caused by prostaglandins - the same chemicals that cause cramps can trigger nausea when released into the bloodstream.\n\n**Nausea relief:**\n- ðŸ«š Ginger - tea, capsule, or candy (scientifically proven to reduce nausea)\n- ðŸš Eat small, bland meals - avoid greasy or spicy food during your period\n- ðŸ’§ Sip water slowly - dehydration worsens nausea\n- ðŸƒ Peppermint tea or peppermint aromatherapy\n- ðŸ˜®â€ðŸ’¨ Slow, deep breaths activate the vagus nerve and calm nausea\n- ðŸ›Œ Resting in a slightly elevated position can help\n\nIf nausea is severe or comes with vomiting every cycle, it's worth discussing with a doctor.${symCtx}`;
  }

  // â”€â”€ INTENT: PMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/pms|premenstrual|before.*period|period.*before|luteal.*symptoms/.test(lower)) {
    return `${hi}PMS (Premenstrual Syndrome) happens in the **luteal phase** (days after ovulation until your period) when progesterone peaks and serotonin dips.\n\n**Common PMS symptoms:** bloating, mood swings, cravings, fatigue, breast tenderness, headaches, irritability.\n\n**Evidence-based remedies:**\n- ðŸ¥¦ **Magnesium** (300mg/day) - reduces bloating, headaches, and mood symptoms\n- ðŸŸ **Vitamin B6** - supports serotonin production\n- ðŸ¥› **Calcium** (1200mg/day) - reduces PMS severity by up to 50% in studies\n- ðŸƒ Regular aerobic exercise - the most consistent PMS reducer\n- â˜• Reduce caffeine and alcohol starting day 14 of your cycle\n- ðŸ˜´ Protect sleep rigorously - poor sleep makes every PMS symptom worse\n${hasCycle ? `\nðŸ“… Your next PMS window is roughly around **${fmt(info.ovulation)}** onward.` : ""}`;
  }

  // â”€â”€ INTENT: Nutrition / food / diet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/food|eat|diet|nutrition|what.*eat|meal|khana|à¤–à¤¾à¤¨à¤¾|poshan|drink|supplement/.test(lower)) {
    if (hasCycle) {
      const phaseNutrition = {
        phase_menstrual: "ðŸ©¸ **You're menstruating:** Focus on iron (spinach, lentils, red meat), vitamin C (helps iron absorption), and anti-inflammatory foods (ginger, turmeric, berries). Warm soups and herbal teas are comforting. Avoid excessive salt and alcohol.",
        phase_follicular: "ðŸŒ± **Follicular phase:** Light, fresh foods support rising estrogen. Try: salads, fermented foods (yogurt, kimchi, kefir), eggs, and seeds (flax, pumpkin). Your digestion is at its best now.",
        phase_ovulation: "âœ¨ **Ovulation phase:** Antioxidant-rich foods help. Try: berries, leafy greens, quinoa, and zinc-rich foods (pumpkin seeds, chickpeas, shellfish). Stay hydrated.",
        phase_luteal: "ðŸŒ™ **Luteal phase:** Complex carbs (sweet potato, oats, brown rice) stabilize mood by supporting serotonin. Magnesium (dark chocolate, nuts, seeds) eases PMS. Reduce caffeine, salt, and alcohol to minimize bloating and mood swings."
      };
      return `${hi}here's your cycle-phase food guide (Day ${info.cycleDay}):\n\n${phaseNutrition[phaseKey]}\n\nðŸ’§ Always: 8+ glasses of water daily. Consistent hydration reduces headaches, fatigue, and cramps.`;
    }
    return `${hi}eating with your cycle is powerful! Here's the general guide:\n\n- ðŸ©¸ **Menstrual:** Iron, anti-inflammatory foods, warm meals\n- ðŸŒ± **Follicular:** Fresh, light foods, fermented foods, eggs\n- âœ¨ **Ovulation:** Zinc, antioxidants, leafy greens\n- ðŸŒ™ **Luteal:** Magnesium, complex carbs, reduce salt & caffeine\n\nLog your period start date so I can give you personalized tips!`;
  }

  // â”€â”€ INTENT: Exercise / workout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/exercise|workout|gym|yoga|run|walk|sport|fitness|vyayam|à¤µà¥à¤¯à¤¾à¤¯à¤¾à¤®/.test(lower)) {
    if (hasCycle) {
      const phaseExercise = {
        phase_menstrual: "ðŸ§˜ **Menstrual phase:** Gentle yoga, walking, and stretching. Honor your body - rest is productive. Avoid intense HIIT if you're cramping badly.",
        phase_follicular: "ðŸ‹ï¸ **Follicular phase:** Excellent for strength training and HIIT! Estrogen supports muscle recovery and energy. Push yourself.",
        phase_ovulation: "ðŸ’ª **Ovulation:** Your performance peak! Take on your hardest workouts, competitions, or challenges now. Energy and pain tolerance are highest.",
        phase_luteal: "ðŸš´ **Luteal phase:** Shift to moderate exercise - pilates, swimming, cycling, hiking. Your body needs more recovery time as progesterone rises."
      };
      return `${hi}syncing workouts with your cycle = smarter training!\n\n${phaseExercise[phaseKey]}\n\nNo matter the phase, consistency matters more than intensity. Even 20 min of movement improves mood, sleep, and pain tolerance.`;
    }
    return `${hi}syncing your exercise to your cycle is a game-changer! Log your cycle to get phase-specific workout advice from me.`;
  }

  // â”€â”€ INTENT: Irregular periods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/irregular|late.*period|period.*late|missed.*period|no.*period|period.*skip|period.*stop/.test(lower)) {
    return `${hi}irregular periods can have several causes - and most are manageable with the right information.\n\n**Common causes:**\n- ðŸ˜° Stress (cortisol suppresses reproductive hormones)\n- âš–ï¸ Significant weight gain or loss\n- ðŸƒ Excessive exercise or under-eating\n- ðŸ¦‹ Thyroid imbalances\n- ðŸ”„ PCOS (Polycystic Ovary Syndrome)\n- ðŸ“ Perimenopause (if 40s+)\n\n**When to see a doctor:**\n- Period is 7+ days late with no obvious reason\n- Cycles consistently shorter than 21 or longer than 35 days\n- Stopped for 3+ months (excluding pregnancy)\n- Suddenly very heavy or very light\n\n**Lifestyle steps that help:** reducing stress, maintaining a healthy weight, consistent sleep, and avoiding extreme diets.`;
  }

  // â”€â”€ INTENT: Backache â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/back.*pain|backache|lower back|spine.*ache|kamar.*dard|kamar dard/.test(lower)) {
    return `${hi}lower back pain during your period happens because uterine contractions can radiate pain to the lower back and thighs.\n\n**Relief:**\n- ðŸ”¥ Heating pad on your lower back\n- ðŸ§˜ Child's pose, pelvic tilts, and seated twists\n- ðŸ›Œ Sleep with a pillow between your knees (reduces spinal pressure)\n- ðŸ’Š Ibuprofen/naproxen are more effective than paracetamol for period-related back pain\n- ðŸš¶ Light walking keeps the back muscles from stiffening${symCtx}`;
  }

  // â”€â”€ INTENT: Skin / acne / pimples â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/acne|pimple|breakout|skin|muhanase|à¤®à¥à¤¹à¤¾à¤‚à¤¸à¥‡/.test(lower)) {
    return `${hi}hormonal acne is extremely common and follows your cycle predictably:\n\nðŸ“… **When it flares:**\n- **Before ovulation:** androgen surge can cause oily skin\n- **Before period:** progesterone drop triggers breakouts\n\nðŸ§´ **Cycle-synced skincare:**\n- **Follicular:** Best time for retinoids and active treatments\n- **Ovulation:** Lighter products, good SPF\n- **Luteal:** Salicylic acid spot treatments, oil control\n- **Menstrual:** Soothe and hydrate - skin is sensitive\n\nðŸ¥— **Diet links:** Reducing dairy and high-glycemic foods (white bread, sugar) is well-studied to reduce hormonal acne. Zinc supplements also help.`;
  }

  // â”€â”€ INTENT: Cravings / hunger â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/craving|chocolate|sweet|candy|hungry|appetite|bhook|à¤®à¥€à¤ à¤¾/.test(lower)) {
    return `${hi}premenstrual cravings - especially for sugar, carbs, and chocolate - are driven by dropping serotonin in the luteal phase. Your brain wants a quick serotonin fix!\n\nðŸ§  **Smart satisfiers:**\n- ðŸ« Dark chocolate (70%+) - satisfies AND provides magnesium + mood-supporting flavonoids\n- ðŸŒ Banana or dates - natural sweetness with potassium\n- ðŸ¥œ Nuts with a little honey - balances blood sugar\n- ðŸ  Sweet potato or oats - complex carbs for sustained serotonin\n\nCravings are your body signaling nutritional needs. Listen, but make the swap when you can!`;
  }

  // â”€â”€ INTENT: Thank you / bye / done â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (/^(thank|thanks|thank you|thx|thnks|shukriya|dhanyavad|bye|goodbye|ok|okay|got it|acha|theek hai|haan|sure|alright)/.test(lower)) {
    return pick([
      "You're welcome!  Take care of yourself - your body does incredible things.",
      "Happy to help! Remember, the more you track, the smarter your predictions get. ðŸ’•",
      "Of course! Don't hesitate to ask me anything. Your wellbeing is what I'm here for. ðŸŒ·",
      "Anytime!  Stay hydrated, rest well, and be kind to yourself."
    ]);
  }

  // â”€â”€ INTENT: General health question (catch-all, still intelligent) â”€â”€â”€â”€â”€â”€â”€â”€
  const genericFallback = hasCycle
    ? `${hi}I'm here to help with anything about your cycle, body, or wellness! \n\nYou're currently on **cycle day ${info.cycleDay}** (${phaseName(info.cycleDay)} phase), with your next period in ${daysLeft} days.\n\nYou can ask me about:\n- Symptoms (cramps, mood, bloating, fatigue...)\n- Nutrition & food for each phase\n- Exercise & energy tips\n- Sleep, skin, or emotional health\n\nWhat would you like to explore?${symCtx}`
    : `${hi}I'm Zyra - here to help with your cycle, symptoms, mood, and wellness! \n\n${pack.genericHelp}\n\n${pack.noData}`;

  return genericFallback;
}
function appendChatBubble(text, role = "assistant") {
  const container = document.getElementById("chat-container");
  if (!container) return;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = sanitizeDisplayText(text);
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}
function phaseName(day) {
  if (!day) return t("phase_follicular");
  if (day <= appData.periodLength) return t("phase_menstrual");
  if (day >= appData.cycleLength - 15 && day <= appData.cycleLength - 13) return t("phase_ovulation");
  if (day > appData.cycleLength - 13) return t("phase_luteal");
  return t("phase_follicular");
}
function average(list) {
  if (!list.length) return 0;
  return list.reduce((a, b) => a + b, 0) / list.length;
}
function t(key) {
  const dict = translations[appData.language] || translations.en;
  return sanitizeDisplayText(dict[key] || translations.en[key] || key);
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = sanitizeDisplayText(text);
}
function toISO(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function sameDay(a, b) {
  return toISO(a) === toISO(b);
}
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = sanitizeDisplayText(message);
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("visible"), 10);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }
    , 2500);
}
window.nextOnboardingStep = nextOnboardingStep;
window.completeOnboarding = completeOnboarding;
window.updateCycleSlider = updateCycleSlider;
window.updatePeriodSlider = updatePeriodSlider;
window.setTheme = setTheme;
window.setLanguage = setLanguage;
window.saveSettings = saveSettings;
window.clearAllData = clearAllData;
window.switchScreen = showScreen;
window.selectCategory = selectCategory;
window.selectFlow = selectFlow;
window.selectMood = selectMood;
window.selectEnergy = selectEnergy;
window.toggleSymptom = toggleSymptom;
window.saveTracking = saveTracking;
window.openMoodModal = openMoodModal;
window.openFlowModal = openFlowModal;
window.openEnergyModal = openEnergyModal;
window.openSleepModal = openSleepModal;
window.askQuickQuestion = askQuickQuestion;
window.sendMessage = sendMessage;
window.markPeriodStartToday = markPeriodStartToday;
window.markPeriodEndToday = markPeriodEndToday;



document.addEventListener("DOMContentLoaded", () => {
  loadState().then(() => {
    bindNavigation();
    bindCalendarNav();
    bindChatInput();
    bindPreferenceChips();
    hydrateOnboardingInputs();
    syncSettingsInputs();

    // Application state based UI
    applyTheme(appData.theme);
    setLanguage(appData.language, false);

    if (appData.isSetup && appData.lastPeriodDate) {
      showScreen("dashboard-screen");
    } else {
      showScreen("onboarding-screen");
    }
    renderAll();
    bootstrapChatContext();
  });
});

