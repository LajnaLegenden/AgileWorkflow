let Storage = require('./storage');
let axios = require('axios')


module.exports = async function (data) {

    let time = newTime();
    let text = "";
    switch (data.action) {
        case 'move':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.user} moved ${data.data.name} to ${data.data.state}`;
            break;
        case 'addedTask':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.user} created a task called "${data.data.name}"`; break;
        case 'join':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.data.user} has joined the project, invited by @${data.data.name}`; break;
        case 'remove':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.data.user} removed the task "${data.data.name}"`; break;
        case 'edit':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.data.user} edited the task @${data.data.name}`; break;
        case 'assign':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.data.from} assigned a task to @${data.data.username}`; break;
        case 'newEvent':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.data.from} added a new event to the calendar`; break;
        case 'removeAssign':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.data.from} removed an assignment on task "${data.data.taskName}"`; break;
        case 'removeEvent':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.data.from} removed an event on the calendar"`; break;
        case 'removewebhook':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.data.from} removed a webhook"`; break;
        case 'newWebhook':
            text = `[${time.hours}.${time.minutes}.${time.seconds}] @${data.data.from} added a new Webhook"`; break;

    }

    let project = await Storage.getProject(data.id)

    let webhookPayload = {
        "username": "Flow",
        "embeds": [
            {
                "title": "New Action in " + project[0].name,
                "description": text,
                "url": "https://flow.ntit4.wtf/dashboard/" + data.data.projectID
            }
        ]
    }

    let webhookArray = await Storage.getAllWebhooksForProject(data.id);


    for (let i = 0; i < webhookArray.length; i++) {
        axios.post(webhookArray[i].url, webhookPayload)
            .then((res) => {

            })
            .catch((error) => {
                console.error(error)
            })
    }
}

function newTime() {
    let d = new Date();
    let hours = d.getHours().toString();
    let minutes = d.getMinutes().toString();
    let seconds = d.getSeconds().toString();
    if (hours.length == 1) {
        hours += "0";
        hours = hours.split("").reverse().join("");
    }
    if (minutes.length == 1) {
        minutes += "0";
        minutes = minutes.split("").reverse().join("");
    }
    if (seconds.length == 1) {
        seconds += "0";
        seconds = seconds.split("").reverse().join("");
    }
    return { hours, minutes, seconds }
}
