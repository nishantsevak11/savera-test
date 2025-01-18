// import sendEmailService from '../service/emailService.js';
// import scheduleTaskAtUserTime from '../service/schedule.js';
import { scheduleService } from '../service/schedule.js';
import userModel from '../models/user.model.js';


async function sendEmailController(){
    // console.log(`Sending email to ${data.name} with email ${data.email}`);
    // sendEmailService(data);
    const users = await userModel.find({})
    // console.log(users);
    scheduleService.scheduleEmailsForAllUsers(users);
    
}

export default sendEmailController;