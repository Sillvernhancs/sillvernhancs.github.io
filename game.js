// game.js - Updated to work with Supabase backend
class HexapodGame {
    constructor() {
        this.cards = [];
        this.currentCardIndex = 0;
        this.isPackOpened = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createParticles();
    }

    setupEventListeners() {
        const pack = document.getElementById('pack');
        const currentCard = document.getElementById('currentCard');
        
        if (pack) {
            pack.addEventListener('click', () => this.openPack());
        }
        
        if (currentCard) {
            currentCard.addEventListener('click', () => this.nextCard());
        }
    }

    async openPack() {
        if (this.isPackOpened) return;
        if (!window.discordAuth || !window.discordAuth.isLoggedIn()) {
            alert('Please log in first!');
            return;
        }

        const user = window.discordAuth.getCurrentUser();
        if (user.has_opened_today) {
            alert('You have already opened your daily pack! Come back tomorrow.');
            return;
        }

        try {
            this.showLoading(true);
            
            // Call the open-pack Edge Function
            const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/open-pack`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ user_id: user.id }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to open pack');
            }

            const data = await response.json();
            this.cards = data.cards;
            
            // Update user status
            user.has_opened_today = true;
            localStorage.setItem('discord_user', JSON.stringify(user));
            
            // Start pack opening animation
            this.animatePackOpening();
            
        } catch (error) {
            console.error('Failed to open pack:', error);
            alert('Failed to open pack: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const pack = document.getElementById('pack');
        if (pack) {
            pack.style.pointerEvents = show ? 'none' : 'auto';
            pack.style.opacity = show ? '0.7' : '1';
        }
    }

    animatePackOpening() {
        this.isPackOpened = true;
        
        const packContainer = document.getElementById('packContainer');
        const pack = document.getElementById('pack');
        const cardDisplay = document.getElementById('cardDisplay');
        
        if (!pack || !cardDisplay) return;

        // Play pack opening sound
        if (window.audioManager) {
            window.audioManager.playPackOpen();
        }

        // Add pack opening animation
        pack.classList.add('opening');
        
        // Trigger flash effect
        this.triggerFlash();
        
        // Start energy rings animation
        this.animateEnergyRings();
        
        // Show first card after animation
        setTimeout(() => {
            if (packContainer) packContainer.style.display = 'none';
            cardDisplay.style.display = 'block';
            this.showCard(0);
        }, 2000);
    }

    showCard(index) {
        if (index >= this.cards.length) {
            this.showAllCards();
            return;
        }

        const card = this.cards[index];
        const cardImage = document.getElementById('cardImage');
        const currentCard = document.getElementById('currentCard');
        const cardDisplay = document.getElementById('cardDisplay');
        
        if (!cardImage || !currentCard) return;

        // Set card image (fallback to placeholder if image doesn't exist)
        cardImage.src = card.image_url;
        cardImage.onerror = () => {
            cardImage.src = 'placeholder-card.png'; // Add a placeholder card image
        };
        
        // Set rarity glow
        currentCard.className = `card ${card.rarity}-glow`;
        
        // Trigger special effects for rare cards
        if (['epic', 'legendary'].includes(card.rarity)) {
            this.triggerSpecialEffects(card.rarity);
        }
        
        // Play card reveal sound
        if (window.audioManager) {
            window.audioManager.playCardReveal(card.rarity);
        }
        
        // Show card with animation
        currentCard.style.transform = 'rotateY(180deg)';
        setTimeout(() => {
            currentCard.style.transform = 'rotateY(0deg)';
        }, 100);
        
        this.currentCardIndex = index;
    }

    nextCard() {
        if (this.currentCardIndex < this.cards.length - 1) {
            this.showCard(this.currentCardIndex + 1);
        } else {
            this.showAllCards();
        }
    }

    showAllCards() {
        const cardDisplay = document.getElementById('cardDisplay');
        const allCardsDisplay = document.getElementById('allCardsDisplay');
        const title = document.getElementById('title');
        
        if (cardDisplay) cardDisplay.style.display = 'none';
        if (allCardsDisplay) {
            allCardsDisplay.style.display = 'grid';
            allCardsDisplay.innerHTML = ''; // Clear previous content
            
            // Create summary
            const summary = document.createElement('div');
            summary.className = 'pack-summary';
            summary.innerHTML = '<h2>Pack Contents</h2>';
            allCardsDisplay.appendChild(summary);
            
            // Show all cards
            this.cards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = `mini-card ${card.rarity}`;
                cardElement.innerHTML = `
                    <img src="${card.image_url}" alt="${card.name}" onerror="this.src='placeholder-card.png'">
                    <div class="card-info">
                        <h3>${card.name}</h3>
                        <p class="rarity ${card.rarity}">${card.rarity.toUpperCase()}</p>
                        <p class="description">${card.description}</p>
                        ${card.attack !== undefined ? `<p class="stats">ATK: ${card.attack} DEF: ${card.defense}</p>` : ''}
                        ${card.cost !== undefined ? `<p class="cost">Cost: ${card.cost}</p>` : ''}
                    </div>
                `;
                allCardsDisplay.appendChild(cardElement);
            });
            
            // Add "come back tomorrow" message
            const tomorrowMessage = document.createElement('div');
            tomorrowMessage.className = 'tomorrow-message';
            tomorrowMessage.innerHTML = '<p>Come back tomorrow for your next daily pack!</p>';
            allCardsDisplay.appendChild(tomorrowMessage);
        }
        
        if (title) {
            title.textContent = 'Pack Opened!';
        }
        
        // Update the auth status
        if (window.discordAuth) {
            window.discordAuth.updatePackStatus();
        }
    }

    triggerFlash() {
        const flashOverlay = document.getElementById('flashOverlay');
        if (flashOverlay) {
            flashOverlay.classList.add('active');
            setTimeout(() => {
                flashOverlay.classList.remove('active');
            }, 500);
        }
    }

    triggerSpecialEffects(rarity) {
        if (rarity === 'legendary') {
            // Lightning effect
            const lightning = document.getElementById('lightning');
            if (lightning) {
                lightning.classList.add('active');
                setTimeout(() => {
                    lightning.classList.remove('active');
                }, 1000);
            }
            
            // Legendary announcement
            const announcement = document.getElementById('legendaryAnnouncement');
            if (announcement) {
                announcement.classList.add('show');
                setTimeout(() => {
                    announcement.classList.remove('show');
                }, 3000);
            }
        }
        
        // Extra particles for epic and legendary
        if (['epic', 'legendary'].includes(rarity)) {
            this.createBurstParticles();
        }
    }

    animateEnergyRings() {
        const rings = ['energyRing1', 'energyRing2', 'energyRing3'];
        rings.forEach((ringId, index) => {
            const ring = document.getElementById(ringId);
            if (ring) {
                setTimeout(() => {
                    ring.classList.add('active');
                }, index * 200);
            }
        });
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 4 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    createBurstParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'burst-particle';
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.transform = `rotate(${i * 18}deg)`;
            particlesContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }

    reset() {
        this.cards = [];
        this.currentCardIndex = 0;
        this.isPackOpened = false;
        
        // Reset UI
        const packContainer = document.getElementById('packContainer');
        const cardDisplay = document.getElementById('cardDisplay');
        const allCardsDisplay = document.getElementById('allCardsDisplay');
        const pack = document.getElementById('pack');
        
        if (packContainer) packContainer.style.display = 'flex';
        if (cardDisplay) cardDisplay.style.display = 'none';
        if (allCardsDisplay) allCardsDisplay.style.display = 'none';
        if (pack) pack.classList.remove('opening');
        
        // Clear energy rings
        const rings = ['energyRing1', 'energyRing2', 'energyRing3'];
        rings.forEach(ringId => {
            const ring = document.getElementById(ringId);
            if (ring) ring.classList.remove('active');
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new HexapodGame();
});