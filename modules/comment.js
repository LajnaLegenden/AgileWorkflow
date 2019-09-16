class Comment{
    constructor(author, content,taskID){
        this.author = author;
        this.content = content;
        this.postDate = new Date();
        this.taskID = taskID;
    }
}