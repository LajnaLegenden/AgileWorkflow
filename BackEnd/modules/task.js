class Task{
    constructor(name, desc, procjetID){
        this.name = name;
        this.desc = desc;
        this.comments = [];
        this.id = this.getNewId();
        this.procjetID  = procjetID;
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