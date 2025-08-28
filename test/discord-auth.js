// Discord Authentication Handler
class DiscordAuth {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem(STORAGE_KEYS.DISCORD_TOKEN);
        this.userInfo = null;
        
        // Try to load saved user info
        const savedUser = localStorage.getItem(STORAGE_KEYS.DISCORD_USER);
        if (savedUser) {
            try {
                this.userInfo = JSON.parse(savedUser);
            } catch (e) {
                console.error('Failed to parse saved user info:', e);
                this.clearUserData();
            }
        }
        
        this.init();
    }
    
    init() {
        // Check if we're returning from Discord OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            this.handleOAuthCallback(code);
            return;
        }
        
        // If we have a token, try to validate it
        if (this.token && this.userInfo) {
            this.validateToken().then(valid => {
                if (valid) {
                    this.showGame();
                } else {
                    this.showLogin();
                }
            });
        } else {
            this.showLogin();
        }
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Use event delegation since elements might not exist yet
        document.addEventListener('click', (e) => {
            if (e.target.id === 'discordLoginBtn' || e.target.closest('#discordLoginBtn')) {
                this.initiateLogin();
            }
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                this.logout();
            }
            if (e.target.id === 'gameLogoutBtn' || e.target.closest('#gameLogoutBtn')) {
                this.logout();
            }
        });
    }
    
    initiateLogin() {
        const authUrl = new URL('https://discord.com/api/oauth2/authorize');
        authUrl.searchParams.append('client_id', DISCORD_CONFIG.CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', DISCORD_CONFIG.REDIRECT_URI);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', DISCORD_CONFIG.SCOPES);
        
        window.location.href = authUrl.toString();
    }
    
    async handleOAuthCallback(code) {
        try {
            // In a real implementation, this should be done on your backend server
            // This is a simplified version for demonstration
            const tokenData = await this.exchangeCodeForToken(code);
            
            if (tokenData.access_token) {
                this.token = tokenData.access_token;
                localStorage.setItem(STORAGE_KEYS.DISCORD_TOKEN, this.token);
                
                // Get user info
                const userInfo = await this.fetchUserInfo();
                if (userInfo) {
                    this.userInfo = userInfo;
                    localStorage.setItem(STORAGE_KEYS.DISCORD_USER, JSON.stringify(userInfo));
                    
                    // Clean up URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    this.showGame();
                } else {
                    throw new Error('Failed to fetch user info');
                }
            }
        } catch (error) {
            console.error('OAuth callback error:', error);
            alert('Login failed. Please try again.');
            this.showLogin();
        }
    }
    
    async exchangeCodeForToken(code) {
        try {
            const response = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: DISCORD_CONFIG.CLIENT_ID,
                    client_secret: 'YOUR_CLIENT_SECRET_HERE', // You'll need to add this to config
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: DISCORD_CONFIG.REDIRECT_URI,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to exchange code for token');
            }

            const tokenData = await response.json();
            return tokenData;
        } catch (error) {
            console.error('Token exchange error:', error);
            // Fallback to simulated token for development
            return {
                access_token: 'dev_token_' + Date.now(),
                token_type: 'Bearer',
                expires_in: 3600
            };
        }
    }
    
    async fetchUserInfo() {
        try {
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }
            
            const userData = await response.json();
            return {
                id: userData.id,
                username: userData.username,
                discriminator: userData.discriminator || '0000',
                avatar: userData.avatar,
                display_name: userData.display_name || userData.global_name || userData.username
            };
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    }
    
    async validateToken() {
        if (!this.token || !this.userInfo) return false;
        
        // In a real implementation, you'd validate with Discord API
        // For now, we'll assume tokens are always valid
        return true;
    }
    
    showLogin() {
        document.getElementById('discordLogin').style.display = 'flex';
        document.getElementById('mainContainer').style.display = 'none';
        
        // Hide user info, show login button
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('discordLoginBtn').style.display = 'inline-flex';
    }
    
    showGame() {
        document.getElementById('discordLogin').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';
        
        // Update user display
        this.updateUserDisplay();
        
        // Initialize the game
        if (window.gameInstance) {
            window.gameInstance.init();
        }
    }
    
    updateUserDisplay() {
        if (!this.userInfo) return;
        
        const userName = this.userInfo.display_name || this.userInfo.username;
        const avatarUrl = this.userInfo.avatar 
            ? `https://cdn.discordapp.com/avatars/${this.userInfo.id}/${this.userInfo.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(this.userInfo.discriminator) % 5}.png`;
        
        // Update login screen user info
        const userNameEl = document.getElementById('userName');
        const userAvatarEl = document.getElementById('userAvatar');
        const userInfoEl = document.getElementById('userInfo');
        const discordBtnEl = document.getElementById('discordLoginBtn');
        
        if (userNameEl) userNameEl.textContent = userName;
        if (userAvatarEl) userAvatarEl.src = avatarUrl;
        if (userInfoEl) userInfoEl.style.display = 'flex';
        if (discordBtnEl) discordBtnEl.style.display = 'none';
        
        // Update game screen user info
        const gameUserNameEl = document.getElementById('gameUserName');
        const gameUserAvatarEl = document.getElementById('gameUserAvatar');
        
        if (gameUserNameEl) gameUserNameEl.textContent = userName;
        if (gameUserAvatarEl) gameUserAvatarEl.src = avatarUrl;
        
        console.log('Updated user display:', userName, avatarUrl);
    }
    
    logout() {
        // Clear all stored data
        this.clearUserData();
        
        // Show login screen
        this.showLogin();
        
        // Reset game state if needed
        if (window.gameInstance) {
            window.gameInstance.reset();
        }
    }
    
    clearUserData() {
        this.token = null;
        this.userInfo = null;
        localStorage.removeItem(STORAGE_KEYS.DISCORD_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.DISCORD_USER);
        
        // Also clear any user-specific game data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_KEYS.DAILY_PACK)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    getUserId() {
        return this.userInfo ? this.userInfo.id : null;
    }
    
    getUser() {
        return this.userInfo;
    }
    
    isLoggedIn() {
        return !!(this.token && this.userInfo);
    }
}

// Initialize Discord auth when page loads
let discordAuth;
document.addEventListener('DOMContentLoaded', () => {
    discordAuth = new DiscordAuth();
});