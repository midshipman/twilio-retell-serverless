import twilio from 'twilio';
import OpenAI from "openai";
import sgMail = require("@sendgrid/mail");

 async function getSummary(context, input){

  // var OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  var OPENAI_API_KEY = context.OPENAI_API_KEY;
  const openai = new OpenAI({apiKey: OPENAI_API_KEY, });

  var summary_format = "Dear John, Your Air France flight from Paris to SF originally scheduled for June 3rd has been rescheduled. Your new flight details are: Flight: AF82 Date: June 5th Departure Time: 7:15 PM Arrival Time: 10:15 PM"
  var prompt = "Summarize the flight change from the transcript, return exactly 'no change' if cannot find flight recheduling in the transcript. If yes return with sample format exactly: "
  

  const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
          { role: "system", content: prompt + summary_format },
          { role: "user", content: input}
      ], 

  });

  console.log(completion.choices[0]);

  return completion.choices[0].message.content;

}


export const handler = async function(context, event, callback) {
    console.log(`Incoming >> event `, event.event);
    
    if(event.event == 'call_analyzed')
    {
      console.log(`Incoming >> transcript`, event.data.transcript);
      console.log(`Incoming >> call_summary`, event.data.call_analysis.call_summary);

      var sms_summary = await getSummary(context, event.data.transcript)
      
      var email_summary = sms_summary;

      if(sms_summary == "no change"){
        console.log("no flight change!")
        return  callback(null);
      }
      // console.log(`ACCOUNT_SID`, process.env.ACCOUNT_SID);
      // console.log(`AUTH_TOKEN`, process.env.AUTH_TOKEN);

      // var ACCOUNT_SID = process.env.ACCOUNT_SID;
      // var AUTH_TOKEN = process.env.AUTH_TOKEN;
      // var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY

      var ACCOUNT_SID = context.ACCOUNT_SID;
      var AUTH_TOKEN = context.AUTH_TOKEN;
      var SENDGRID_API_KEY = context.SENDGRID_API_KEY

      //send sms
      try {
        const twilioClient = twilio(ACCOUNT_SID, AUTH_TOKEN);
        
        await twilioClient.messages.create({
            from: 'ABC Airline',
            body: sms_summary,
            to: '+4917673552924',
          });
        console.log(`SMS sent successfully`);
      } 
      catch (e: any) {
        console.log(e);
      }

      //send email
      sgMail.setApiKey(SENDGRID_API_KEY);

      const message = {
        to: "readercn@gmail.com",
        from: {email:"hwang@midshipman.xyz", name:"ABC Airline"},
        subject: "Your flight is changed by ABC Airline",
        text: email_summary,
      };

      await sgMail.send(message)
        .then((response) => {
          console.log("Email sent successfully");
          console.log(response[0].statusCode)
          // console.log(response[0].headers)
        })
        .catch(e => {
          console.log(e);
        });

    }

    return callback(null);
  };