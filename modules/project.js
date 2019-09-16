const storage = require("storage.js");
class Project{
    constructor(name, creator){
        this.name = name
        this.creator = creator;
        this.tasks = [];
        this.users = [creator];
        this.admins = [creator];
        this.id = this.getNewId();
    }
    async getNewId(){
        let a = "abcdefghijklmnopkqrtuvwxyzABCDEFGHIJKLMNOPKQRTUVWXYZ0123456789";
        let testId = "";
        for(let i = 0; i < 16; i++){
            testId += a[Math.round(Math.random()*a.length-1)];
        }
        if(await storage.verifyID()){
            return testId;
        } 
        return this.getNewId();
    
    }
}
let a = new Project("Webbserver", "mattias");
console.log(a)