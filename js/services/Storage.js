export default class Storage {
    static API_URL = "https://ecohat-fast-api.vercel.com";

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

    // UPDATED: Now accepts the rememberMe flag
    static async login(id, pass, rememberMe) {
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
        
        // Clear old sessions to prevent conflicts
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');

        // Store based on checkbox preference
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(userData)); 
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
        }
        
        return userData;
    }

    // UPDATED: Now checks both local and session storage
    static getCurrentUser() {
        const localData = localStorage.getItem('currentUser');
        const sessionData = sessionStorage.getItem('currentUser');
        return JSON.parse(localData || sessionData);
    }

    static async getUserHistory(studentId) {
        const response = await fetch(`${this.API_URL}/user-history/${studentId}`);
        if (!response.ok) throw new Error("Failed to fetch history");
        return await response.json();
    }

    // UPDATED: Now completely destroys both storage types to prevent ghost sessions
    static logout() { 
        localStorage.removeItem('currentUser'); 
        sessionStorage.removeItem('currentUser');
    }

    // --- ADMIN METHODS ---

    static async getInventory() {
        try {
            const response = await fetch(`${this.API_URL}/admin/inventory`);
            if (!response.ok) throw new Error("API Error");
            return await response.json();
        } catch (err) {
            console.warn("API Offline, using fallback data.");
            return [
                { id: 1, name: "Ballpen", quantity: 0 },
                { id: 2, name: "Notebook", quantity: 0 },
                { id: 3, name: "Pencil", quantity: 0 }
            ];
        }
    }

    static async updateInventory(updatedItems) {
        console.log("Sending to Backend:", JSON.stringify({ items: updatedItems }));
        
        const response = await fetch(`${this.API_URL}/admin/inventory-update`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: updatedItems })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Route not found on server" }));
            throw new Error(errorData.detail || `Server Error: ${response.status}`);
        }
        return await response.json();
    }

    static async processRedemption(qrData) {
        const response = await fetch(`${this.API_URL}/process-redemption`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: qrData 
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Redemption failed");
        return result.message;
    }

    static async getAdminLogs() {
        const response = await fetch(`${this.API_URL}/admin/logs`);
        if (!response.ok) throw new Error("Failed to fetch logs");
        return await response.json();
    }

    static async saveManualLog(amount) {
        const response = await fetch(`${this.API_URL}/admin/manual-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseFloat(amount) })
        });
        if (!response.ok) throw new Error("Failed to save log");
    }

    static getAllUsers() { return []; }
}