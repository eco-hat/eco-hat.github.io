export default class Storage {
    // This points to your live Python API!
    static API_URL = "https://ecohatfastapi-production.up.railway.app";

    static async register(user) {
        const response = await fetch(`${this.API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Registration failed");
        }
    }

    static async login(id, pass) {
        const response = await fetch(`${this.API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: id, password: pass })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Invalid login");
        }
        
        const userData = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(userData)); 
        
        return userData; // <-- ADD THIS LINE
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    static async getUserHistory(studentId) {
        const response = await fetch(`${this.API_URL}/user-history/${studentId}`);
        if (!response.ok) throw new Error("Failed to fetch history");
        return await response.json();
    }

    static logout() { 
        localStorage.removeItem('currentUser'); 
    }

    // Temporary placeholders so your Admin dashboard doesn't crash 
    // before we build the backend routes for them!
    static getAllUsers() { return []; }
    static updateCurrentUser(user) { }

    // Admin tool: Process a scanned QR code
    static async processRedemption(qrData) {
        const response = await fetch(`${this.API_URL}/process-redemption`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: qrData // qrData is already a JSON string from the scanner
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Redemption failed");
        return result.message;
    }
}