export default class Storage {
    static API_URL = "https://ecohat-fastapi.onrender.com";

    /**
     * Authenticated User Management
     */
    static async register(user) {
        // Ensure the ID is mapped to 'student_id' if your backend requires that specific field name
        const payload = {
            ...user,
            student_id: user.student_id || user.id || user.studentNumber
        };

        const response = await fetch(`${this.API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Registration failed");
        }
    }

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
        
        // Wipe existing sessions to avoid identity confusion
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');

        // Persist session based on user choice
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(userData)); 
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
        }
        
        return userData;
    }

    static getCurrentUser() {
        const localData = localStorage.getItem('currentUser');
        const sessionData = sessionStorage.getItem('currentUser');
        return JSON.parse(localData || sessionData);
    }

    static logout() { 
        localStorage.removeItem('currentUser'); 
        sessionStorage.removeItem('currentUser');
    }

    /**
     * Student Activity & Ranking
     */
    static async getUserHistory(studentId) {
        const response = await fetch(`${this.API_URL}/user-history/${studentId}`);
        if (!response.ok) throw new Error("Failed to fetch history");
        return await response.json();
    }

    /**
     * Fetches all registered students for the Leaderboard
     */
    static async getAllStudents() {
        try {
            const response = await fetch(`${this.API_URL}/admin/students`);
            if (!response.ok) throw new Error("Failed to fetch student list");
            
            const students = await response.json();
            
            return students
                .map(s => ({
                    ...s,
                    bottles_collected: Math.floor((s.points || 0) / 5)
                }))
                .sort((a, b) => b.points - a.points);
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
            return []; 
        }
    }

    static async getStudentRank(studentId) {
        const allStudents = await this.getAllStudents();
        const index = allStudents.findIndex(s => s.student_id === studentId || s.id === studentId);
        
        if (index === -1) return { position: 'N/A', competitor: null };

        return {
            position: index + 1,
            totalStudents: allStudents.length,
            competitor: index > 0 ? allStudents[index - 1] : null 
        };
    }

    /**
     * Admin: Inventory Management
     */
    static async getInventory() {
        try {
            const response = await fetch(`${this.API_URL}/admin/inventory`);
            if (!response.ok) throw new Error("API Error");
            return await response.json();
        } catch (err) {
            console.warn("API Offline, using fallback inventory.");
            return [
                { id: 1, name: "Ballpen", quantity: 0 },
                { id: 2, name: "Notebook", quantity: 0 },
                { id: 3, name: "Pencil", quantity: 0 }
            ];
        }
    }

    static async updateInventory(updatedItems) {
        const response = await fetch(`${this.API_URL}/admin/inventory-update`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: updatedItems })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Server Error" }));
            throw new Error(errorData.detail || `Server Error: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Admin: Transaction Logs & Redemptions
     */
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

    static async saveManualLog(payload) {
        const response = await fetch(`${this.API_URL}/admin/manual-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Failed to save transaction log");
        return await response.json();
    }
}