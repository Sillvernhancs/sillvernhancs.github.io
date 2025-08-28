// Main Game Logic
class HexapodGame {
    constructor() {
        this.currentCardIndex = 0;
        this.pulledCards = [];
        this.canClickCard = false;
        this.isInitialized = false;
        
        // Wait for DOM and Discord auth to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.waitForAuth());
        } else {
            this.waitForAuth();
        }
    }
    
    waitForAuth() {
        // Wait for Discord auth to be initialized
        const checkAuth = () => {
            if (window.discordAuth && discordAuth.isLoggedIn()) {
                console.log('Auth ready, initializing game...');
                this.init();
            } else {
                setTimeout(checkAuth, 100);
            }
        };
        checkAuth();
    }
    
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log('Game initializing for user:', discordAuth.getUser());
        
        this.setupImageProtection();
        this.createParticles();
        this.setupEventListeners();
        this.checkDailyPackStatus();
        
        console.log('Game fully initialized');
    }
    
    setupImageProtection() {
        // Image protection measures (disabled in debug mode)
        const urlParams = new URLSearchParams(window.location.search);
        const debugMode = urlParams.get('debug') === 'true';
        
        if (!debugMode) {
            // Disable right-click context menu
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
            });
            
            // Disable common keyboard shortcuts for dev tools and saving
            document.addEventListener('keydown', function(e) {
                // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+A, Ctrl+P
                if (e.keyCode === 123 || 
                    (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
                    (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 65 || e.keyCode === 80))) {
                    e.preventDefault();
                    return false;
                }
            });
        }
        
        // Disable drag and drop on all images
        document.addEventListener('dragstart', function(e) {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });
        
        // Additional protection against image theft
        document.addEventListener('selectstart', function(e) {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });
        
        // Override the normal image loading for card images
        window.setProtectedImage = function(imgElement, src) {
            imgElement.src = src;
            
            // Add additional layer - make images unselectable
            imgElement.style.webkitUserSelect = 'none';
            imgElement.style.mozUserSelect = 'none';
            imgElement.style.msUserSelect = 'none';
            imgElement.style.userSelect = 'none';
            imgElement.draggable = false;
        };
        
        // Apply protection to pack image
        const packImg = document.getElementById('packImage');
        if (packImg) {
            window.setProtectedImage(packImg, PACK_IMAGE);
        }
    }
    
    createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        for (let i = 0; i < 20; i++) { // Reduced from 30 for performance
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            container.appendChild(particle);
        }
    }
    
    setupEventListeners() {
        // Pack click handler
        const packContainer = document.getElementById('packContainer');
        if (packContainer) {
            packContainer.addEventListener('click', () => this.openPack());
        }
        
        // Card click handler
        const currentCard = document.getElementById('currentCard');
        if (currentCard) {
            currentCard.addEventListener('click', () => this.onCardClick());
        }
    }
    
    getUserStorageKey() {
        const userId = discordAuth.getUserId();
        return STORAGE_KEYS.DAILY_PACK + userId;
    }
    
    canOpenPack() {
        if (!discordAuth.isLoggedIn()) return false;
        
        const lastOpened = localStorage.getItem(this.getUserStorageKey());
        if (!lastOpened) return true;
        
        const lastDate = new Date(lastOpened);
        const today = new Date();
        
        // Set both dates to midnight for comparison
        const lastMidnight = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return todayMidnight > lastMidnight;
    }
    
    checkDailyPackStatus() {
        const canOpen = this.canOpenPack();
        const packContainer = document.getElementById('packContainer');
        const lockedMessage = document.getElementById('lockedMessage');
        const title = document.getElementById('title');
        
        if (!canOpen) {
            packContainer.style.opacity = '0.5';
            packContainer.style.pointerEvents = 'none';
            lockedMessage.style.display = 'block';
            title.textContent = 'Daily Pack Already Opened!';
        } else {
            packContainer.style.opacity = '1';
            packContainer.style.pointerEvents = 'auto';
            lockedMessage.style.display = 'none';
            title.textContent = 'Open Your Daily Pack!';
        }
    }
    
    getRandomCard() {
        const rand = Math.random() * 100;
        let rarity;
        
        if (rand < RARITY_CHANCES.legendary) {
            rarity = 'legendary';
        } else if (rand < RARITY_CHANCES.legendary + RARITY_CHANCES.uncommon) {
            rarity = 'uncommon';
        } else {
            rarity = 'common';
        }
        
        const cards = CARD_COLLECTION[rarity];
        const card = cards[Math.floor(Math.random() * cards.length)];
        
        return { ...card, rarity };
    }
    
    generatePack() {
        this.pulledCards = [];
        for (let i = 0; i < 5; i++) {
            this.pulledCards.push(this.getRandomCard());
        }
    }
    
    createLightning() {
        const lightning = document.getElementById('lightning');
        if (!lightning) return;
        
        lightning.innerHTML = '';
        lightning.classList.add('active');
        
        for (let i = 0; i < 5; i++) {
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt';
            bolt.style.left = Math.random() * 100 + '%';
            bolt.style.animationDelay = i * 0.1 + 's';
            lightning.appendChild(bolt);
        }
        
        setTimeout(() => {
            lightning.classList.remove('active');
        }, 1000);
    }
    
    updateTitle(card) {
        const title = document.getElementById('title');
        if (title) {
            title.textContent = card.name;
            title.className = 'title card-name ' + card.rarity;
        }
    }
    
    showCard(index) {
        const card = this.pulledCards[index];
        const cardElement = document.getElementById('currentCard');
        const cardImage = document.getElementById('cardImage');
        
        if (!cardElement || !cardImage) return;
        
        // Force animation reset by removing and re-adding the element
        const newCard = cardElement.cloneNode(true);
        cardElement.parentNode.replaceChild(newCard, cardElement);
        
        // Get the new reference
        const currentCard = document.getElementById('currentCard');
        const currentImage = document.getElementById('cardImage');
        
        // Reset card with proper animation
        currentCard.className = 'card ' + card.rarity;
        currentCard.classList.add('card-slam');
        currentCard.classList.remove('flipped');
        this.canClickCard = false;
        
        // Play card slam sound
        if (audioManager) audioManager.play('cardSlam');
        
        // Update title
        this.updateTitle(card);
        
        // Set card image with protection
        if (window.setProtectedImage) {
            window.setProtectedImage(currentImage, card.image);
        }

        if (card.rarity === 'uncommon') {
            // Play uncommon announcement sound
            if (audioManager) audioManager.play('uncommonAnoucement');
        }
        
        // Special effects for legendary
        if (card.rarity === 'legendary') {
            // Play legendary sound immediately when card appears
            if (audioManager) audioManager.play('legendaryAnoucement');
            
            // Show legendary announcement
            const announcement = document.getElementById('legendaryAnnouncement');
            if (announcement) {
                announcement.classList.add('show');
                setTimeout(() => announcement.classList.remove('show'), 2000);
            }
            
            // Screen shake
            const mainContainer = document.getElementById('mainContainer');
            if (mainContainer) {
                mainContainer.classList.add('screen-shake');
                setTimeout(() => {
                    mainContainer.classList.remove('screen-shake');
                }, 500);
            }
            
            // Lightning effect
            this.createLightning();
        }
        
        // Auto flip after animation
        setTimeout(() => {
            currentCard.classList.add('flipped');
            this.canClickCard = true;
            
            // Play rarity-specific reveal sound
            if (audioManager) audioManager.play(card.rarity + 'Reveal');
            
        }, card.rarity === 'legendary' ? 1200 : 600);
        
        // Re-attach click handler to the new element
        currentCard.addEventListener('click', () => this.onCardClick());
    }
    
    onCardClick() {
        if (!this.canClickCard) return;
        
        this.currentCardIndex++;
        
        if (this.currentCardIndex < 5) {
            this.showCard(this.currentCardIndex);
        } else {
            this.displayAllCards();
        }
    }
    
    displayAllCards() {
        const container = document.getElementById('allCardsDisplay');
        const cardDisplay = document.getElementById('cardDisplay');
        const title = document.getElementById('title');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        // Play all cards reveal sound
        const legendaryPulled = this.pulledCards.some(card => card.rarity === 'legendary');
        if (audioManager) {
            if (legendaryPulled) {
                audioManager.play('allCardsReveal_withLegendary');
            } else {
                audioManager.play('allCardsReveal');
            }
        }
        
        // Reset title
        if (title) {
            title.textContent = 'Your Collection!';
            title.className = 'title';
        }

        this.pulledCards.forEach((card, i) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'small-card ' + card.rarity;
            cardDiv.style.animationDelay = i * 0.1 + 's';
            
            const img = document.createElement('img');
            if (window.setProtectedImage) {
                window.setProtectedImage(img, card.image);
            } else {
                img.src = card.image;
            }
            img.alt = card.name;
            
            const glow = document.createElement('div');
            glow.className = 'rarity-glow';
            glow.style.opacity = '1';
            
            cardDiv.appendChild(glow);
            cardDiv.appendChild(img);
            container.appendChild(cardDiv);
        });
        
        if (cardDisplay) cardDisplay.style.display = 'none';
        container.style.display = 'flex';
        
        // Send webhook after all cards are displayed
        setTimeout(() => {
            this.sendWebhook();
        }, 2000); // Wait 2 seconds for all animations to finish
    }
    
    openPack() {
        console.log('Pack clicked!');
        console.log('Can open pack:', this.canOpenPack());
        console.log('User ID:', discordAuth.getUserId());
        
        if (!this.canOpenPack()) {
            console.log('Pack opening blocked - already opened today');
            const lockedMessage = document.getElementById('lockedMessage');
            if (lockedMessage) {
                lockedMessage.style.display = 'block';
            }
            return;
        }
        
        console.log('Starting pack opening sequence...');
        
        const title = document.getElementById('title');
        if (title) {
            title.textContent = "";
        }
        
        // Play pack opening sound
        if (audioManager) audioManager.play('packOpen');
        
        // Save opened date with user-specific key
        const storageKey = this.getUserStorageKey();
        console.log('Saving to storage key:', storageKey);
        localStorage.setItem(storageKey, new Date().toISOString());
        
        // Generate pack
        this.generatePack();
        this.currentCardIndex = 0;
        console.log('Generated cards:', this.pulledCards);
        
        // Start mobile-optimized opening sequence
        const pack = document.getElementById('pack');
        if (pack) {
            pack.classList.add('opening');
        }
        
        // Simplified energy rings for mobile
        setTimeout(() => {
            const ring1 = document.getElementById('energyRing1');
            if (ring1) ring1.classList.add('active');
        }, 100);
        setTimeout(() => {
            const ring2 = document.getElementById('energyRing2');
            if (ring2) ring2.classList.add('active');
        }, 200);
        setTimeout(() => {
            const ring3 = document.getElementById('energyRing3');
            if (ring3) ring3.classList.add('active');
        }, 300);
        
        // Show first card after shortened animation sequence
        setTimeout(() => {
            const packContainer = document.getElementById('packContainer');
            const cardDisplay = document.getElementById('cardDisplay');
            const flashOverlay = document.getElementById('flashOverlay');
            
            if (packContainer) packContainer.style.display = 'none';
            if (cardDisplay) cardDisplay.style.display = 'block';
            if (flashOverlay) flashOverlay.classList.remove('active');
            
            console.log('Showing first card...');
            this.showCard(0);
        }, 1300);
    }
    
    reset() {
        // Reset game state
        this.currentCardIndex = 0;
        this.pulledCards = [];
        this.canClickCard = false;
        
        // Reset UI
        const packContainer = document.getElementById('packContainer');
        const cardDisplay = document.getElementById('cardDisplay');
        const allCardsDisplay = document.getElementById('allCardsDisplay');
        const lockedMessage = document.getElementById('lockedMessage');
        const title = document.getElementById('title');
        
        if (packContainer) {
            packContainer.style.display = 'block';
            packContainer.style.opacity = '1';
            packContainer.style.pointerEvents = 'auto';
        }
        if (cardDisplay) cardDisplay.style.display = 'none';
        if (allCardsDisplay) {
            allCardsDisplay.style.display = 'none';
            allCardsDisplay.innerHTML = '';
        }
        if (lockedMessage) lockedMessage.style.display = 'none';
        if (title) {
            title.textContent = 'Open Your Daily Pack!';
            title.className = 'title';
        }
        
        // Reset pack animation
        const pack = document.getElementById('pack');
        if (pack) {
            pack.classList.remove('opening');
        }
        
        // Reset energy rings
        ['energyRing1', 'energyRing2', 'energyRing3'].forEach(id => {
            const ring = document.getElementById(id);
            if (ring) ring.classList.remove('active');
        });
        
        // Clear particles and recreate them
        const particles = document.getElementById('particles');
        if (particles) {
            particles.innerHTML = '';
            this.createParticles();
        }
    }
    
    async sendWebhook() {
        if (!discordAuth.isLoggedIn()) return;
        
        const webhookUrl = 'https://discord.com/api/webhooks/1409950851891597314/t0I-IeQ6SxyYVCOCzIVlIJiEQINkYPBiClx3pjQVoHKYODv9gbehtp3uYbWAjCw7uGcL';
        const user = discordAuth.getUser();
        const now = new Date();
        const pullDate = now.toLocaleDateString();
        const pullTime = now.toLocaleTimeString();
        
        try {
            // Take screenshot using html2canvas
            await this.captureAndSendScreenshot(webhookUrl, user, pullDate, pullTime);
        } catch (error) {
            console.error('Error sending webhook:', error);
            // Fallback to text-only webhook
            this.sendTextWebhook(webhookUrl, user, pullDate, pullTime);
        }
    }
    
    async captureAndSendScreenshot(webhookUrl, user, pullDate, pullTime) {
        // Load html2canvas dynamically
        if (!window.html2canvas) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            document.head.appendChild(script);
            
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }
        
        // Hide user bar temporarily for cleaner screenshot
        const userBar = document.getElementById('userBar');
        const originalDisplay = userBar ? userBar.style.display : '';
        if (userBar) userBar.style.display = 'none';
        
        // Capture screenshot
        const canvas = await html2canvas(document.body, {
            backgroundColor: null,
            scale: 0.5, // Reduce size
            width: 1200,
            height: 800
        });
        
        // Show user bar again
        if (userBar) userBar.style.display = originalDisplay;
        
        // Convert to blob
        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            
            // Create embed
            const embed = {
                title: "Daily Pack Opening",
                color: this.getEmbedColor(),
                fields: [
                    {
                        name: "Player",
                        value: `<@${user.id}>`,
                        inline: true
                    },
                    {
                        name: "Pull Date",
                        value: `${pullDate} at ${pullTime}`,
                        inline: true
                    },
                    {
                        name: "Cards Pulled",
                        value: this.formatCardList(),
                        inline: false
                    }
                ],
                footer: {
                    text: "✅ Verified by Hexapod™"
                },
                timestamp: new Date().toISOString(),
                image: {
                    url: "attachment://pull_screenshot.png"
                }
            };
            
            // Create payload
            const payload = {
                embeds: [embed]
            };
            
            formData.append('payload_json', JSON.stringify(payload));
            formData.append('file', blob, 'pull_screenshot.png');
            
            // Send webhook
            await fetch(webhookUrl, {
                method: 'POST',
                body: formData
            });
        }, 'image/png', 0.8);
    }
    
    async sendTextWebhook(webhookUrl, user, pullDate, pullTime) {
        const embed = {
            title: "Daily Pack Opening",
            color: this.getEmbedColor(),
            fields: [
                {
                    name: "Player",
                    value: `<@${user.id}>`,
                    inline: true
                },
                {
                    name: "Pull Date",
                    value: `${pullDate} at ${pullTime}`,
                    inline: true
                },
                {
                    name: "Cards Pulled",
                    value: this.formatCardList(),
                    inline: false
                }
            ],
            footer: {
                text: "✅ Verified by Hexapod™"
            },
            timestamp: new Date().toISOString()
        };
        
        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });
    }
    
    getEmbedColor() {
        // Check if legendary was pulled for gold color
        const hasLegendary = this.pulledCards.some(card => card.rarity === 'legendary');
        const hasUncommon = this.pulledCards.some(card => card.rarity === 'uncommon');
        
        if (hasLegendary) return 0xFFD700; // Gold
        if (hasUncommon) return 0x0096FF;  // Blue
        return 0x999999; // Gray for common only
    }
    
    formatCardList() {
        const rarityEmojis = {
            common: '⚪',
            uncommon: '🔵', 
            legendary: '🟡'
        };
        
        return this.pulledCards.map(card => 
            `${rarityEmojis[card.rarity]} **${card.name}** (${card.rarity})`
        ).join('\n');
    }
}

// Initialize game when page loads
let gameInstance;
document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new HexapodGame();
    window.gameInstance = gameInstance; // Make it globally accessible
});