// discord-auth.js - Updated to work with Supabase backend
class DiscordAuth {
    constructor() {
        this.supabaseUrl = CONFIG.SUPABASE_URL;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check for existing session
        const savedUser = localStorage.getItem('discord_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainGame();
        } else {
            // Check if we're returning from Discord OAuth
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
                this.handleOAuthCallback(code);
            } else {
                this.showLoginScreen();
            }
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login button
        const discordLoginBtn = document.getElementById('discordLoginBtn');
        if (discordLoginBtn) {
            discordLoginBtn.addEventListener('click', () => this.initiateLogin());
        }

        // Logout buttons
        const logoutBtn = document.getElementById('logoutBtn');
        const gameLogoutBtn = document.getElementById('gameLogoutBtn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        if (gameLogoutBtn) {
            gameLogoutBtn.addEventListener('click', () => this.logout());
        }
    }

    initiateLogin() {
        const params = new URLSearchParams({
            client_id: CONFIG.DISCORD_CLIENT_ID,
            redirect_uri: CONFIG.DISCORD_REDIRECT_URI,
            response_type: 'code',
            scope: 'identify email',
        });

        window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
    }

    async handleOAuthCallback(code) {
        try {
            // Show loading state
            this.showLoading('Authenticating with Discord...');

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // Send code to Supabase Edge Function
            const response = await fetch(`${this.supabaseUrl}/functions/v1/discord-oauth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Authentication failed');
            }

            const data = await response.json();
            this.currentUser = data.user;

            // Save user data to localStorage
            localStorage.setItem('discord_user', JSON.stringify(this.currentUser));

            this.showMainGame();
        } catch (error) {
            console.error('OAuth callback error:', error);
            this.showError('Authentication failed. Please try again.');
            this.showLoginScreen();
        }
    }

    async refreshUserData() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(
                `${this.supabaseUrl}/functions/v1/discord-oauth?user_id=${this.currentUser.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                localStorage.setItem('discord_user', JSON.stringify(this.currentUser));
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    }

    showLoginScreen() {
        document.getElementById('discordLogin').style.display = 'flex';
        document.getElementById('mainContainer').style.display = 'none';
    }

    showMainGame() {
        document.getElementById('discordLogin').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';

        if (this.currentUser) {
            // Update user display elements
            const gameUserAvatar = document.getElementById('gameUserAvatar');
            const gameUserName = document.getElementById('gameUserName');

            if (gameUserAvatar && this.currentUser.avatar_url) {
                gameUserAvatar.src = this.currentUser.avatar_url;
                gameUserAvatar.onerror = () => {
                    gameUserAvatar.src = `https://cdn.discordapp.com/embed/avatars/0.png`;
                };
            }

            if (gameUserName) {
                gameUserName.textContent = this.currentUser.username;
            }

            // Check if user has already opened today's pack
            this.updatePackStatus();
        }
    }

    updatePackStatus() {
        const titleElement = document.getElementById('title');
        const packContainer = document.getElementById('packContainer');
        const lockedMessage = document.getElementById('lockedMessage');

        if (this.currentUser && this.currentUser.has_opened_today) {
            if (titleElement) titleElement.textContent = 'Pack Already Opened!';
            if (packContainer) packContainer.style.display = 'none';
            if (lockedMessage) lockedMessage.style.display = 'block';
        } else {
            if (titleElement) titleElement.textContent = 'Open Your Daily Pack!';
            if (packContainer) packContainer.style.display = 'flex';
            if (lockedMessage) lockedMessage.style.display = 'none';
        }
    }

    showLoading(message) {
        // You can implement a loading spinner here
        console.log('Loading:', message);
    }

    showError(message) {
        // You can implement error display here
        console.error('Error:', message);
        alert(message); // Simple fallback
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('discord_user');
        this.showLoginScreen();
        
        // Reset the game state
        if (window.game) {
            window.game.reset();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return !!this.currentUser;
    }
}

// Initialize Discord Auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.discordAuth = new DiscordAuth();
});