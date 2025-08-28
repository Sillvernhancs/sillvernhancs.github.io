// Discord OAuth Configuration
const DISCORD_CONFIG = {
    CLIENT_ID: '1409944634045763625', // Replace with your Discord app's Client ID
    REDIRECT_URI: 'http://127.0.0.1:5500/', // Or your custom callback URL
    SCOPES: 'identify', // Basic user info - add 'guilds' if you want to check server membership
    API_ENDPOINT: 'https://discord.com/api/v10'
};

// REPLACE THESE WITH YOUR OWN ASSETS
const PACK_IMAGE = 'HexapodTCGPack.png';

// Card collection with rarity and image URLs
const CARD_COLLECTION = {
    common: [
        { name: 'The Soldier Ant', image: 'bugs_card/ant.png' },
        { name: 'The House Spider', image: 'bugs_card/spider.png'},
        { name: 'The Bumble Bee', image: 'bugs_card/bee.png'},
        { name: 'The Pill Bug', image: 'bugs_card/pill.png'},
        { name: 'The Grass Hopper', image: 'bugs_card/cricket.png'},
    ],
    uncommon: [
        { name: 'The Tiger Beetle', image: 'bugs_card/tiger.png' },
        { name: 'The Black Beetle', image: 'bugs_card/blackbeetle.png' },
        { name: 'The Diving Bell Spider', image: 'bugs_card/divingbell.png' },
        { name: 'The Dung Beetle', image: 'bugs_card/dungbeetle.png' },
        { name: 'The Mole Cricket', image: 'bugs_card/mole.png' },
        { name: 'The Wasp', image: 'bugs_card/wasp.png' },
    ],
    legendary: [
        { name: 'The Praying Mantis', image: 'bugs_card/mantis.png' },
        { name: 'The Dragon Fly', image: 'bugs_card/dragon.png' },
        { name: 'The Rhino Beetle', image: 'bugs_card/rihno.png' },
    ]
};

// Rarity chances (must add up to 100)
const RARITY_CHANCES = {
    common: 75,     // ~74% chance
    uncommon: 23,   // ~23% chance
    legendary: 2      // 3% chance
};

// Audio settings
const AUDIO_SETTINGS = {
    // Replace these URLs with your own audio files
    backgroundMusic: 'sfx/backtrack.mp3',
    packOpen: 'sfx/tcg pack open.mp3',
    cardSlam: 'sfx/Card Deal 2.wav',
    commonReveal: 'sfx/card_deal.mp3',
    uncommonReveal: 'sfx/card_deal.mp3',
    legendaryReveal: 'sfx/card_deal.mp3',
    legendaryAnoucement: 'sfx/legendary annoucement.mp3',
    uncommonAnoucement: 'sfx/uncommon.mp3',
    allCardsReveal: 'sfx/cardflips.mp3',
    allCardsReveal_withLegendary: ''
};

// Storage keys
const STORAGE_KEYS = {
    DAILY_PACK: 'hexapod_daily_pack_',  // Will be appended with Discord ID
    DISCORD_TOKEN: 'hexapod_discord_token',
    DISCORD_USER: 'hexapod_discord_user'
};

// Webhook configuration
const WEBHOOK_CONFIG = {
    URL: 'https://discord.com/api/webhooks/1409950851891597314/t0I-IeQ6SxyYVCOCzIVlIJiEQINkYPBiClx3pjQVoHKYODv9gbehtp3uYbWAjCw7uGcL',
    ENABLED: true
};