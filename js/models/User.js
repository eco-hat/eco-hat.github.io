export default class User {
    constructor(name, studentNumber, password) {
        this.name = name;
        this.studentNumber = studentNumber;
        this.password = password;
        this.points = 0;
        this.activities = [];
    }
}