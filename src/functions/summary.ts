import twilio from 'twilio';
import sgMail = require("@sendgrid/mail");

export const handler = async function(context, event, callback) {
    console.log(`Incoming >> event `, event.event);
    
    if(event.event == 'call_analyzed')
    {
      // console.log(`Incoming >> transcript`, event.data.transcript);
      console.log(`Incoming >> call_summary`, event.data.call_analysis.call_summary);

      
      var sms_summary = event.data.call_analysis.call_summary;
      var email_summary = event.data.call_analysis.call_summary;

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

    callback(null);
  };