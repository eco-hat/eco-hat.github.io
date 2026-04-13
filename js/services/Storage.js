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
        // Save the session data locally so the dashboard knows who is logged in
        localStorage.setItem('currentUser', JSON.stringify(userData)); 
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    static logout() { 
        localStorage.removeItem('currentUser'); 
    }

    // Temporary placeholders so your Admin dashboard doesn't crash 
    // before we build the backend routes for them!
    static getAllUsers() { return []; }
    static updateCurrentUser(user) { }
}