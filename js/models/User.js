export default class User {
    constructor(name, student_id, password, course = "", year = "") {
        this.name = name;
        this.student_id = student_id;
        this.password = password;
        this.course = course; // Ensure this is here
        this.year = year;     // Ensure this is here
        this.role = "student";
        this.points = 0;
    }
}