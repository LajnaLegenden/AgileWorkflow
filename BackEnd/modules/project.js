class Project{
    constructor(name, creator){
        this.name = name
        this.creator = creator;
        this.users = [creator];
        this.admins = [creator];
    }
}