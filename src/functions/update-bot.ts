import Airtable from 'airtable';
import Retell from "retell-sdk";

exports.handler =  async function (context, event, callback) {

    console.log('Incoming', event.id);
    
    try {
        
        var base = new Airtable({apiKey: context.AIRTABLE_API_KEY,}).base(context.AIRTABLE_BASE_ID);

        // const events = await base('builder').select({
        //     fields: ["Name", "Bookings"],
        //     maxRecords: 1,
        //   }).all();
        
        // console.log('Retrieved', events[0]);

        var record =  base('builder').find(event.id);
        if (record) {
            
            var description = (await record).get('Description') + "\n";
            var flow = (await record).get('Voice Flow') + "\n";
            var plan = (await record).get('Flights Plan') + "\n";
            var bookings = (await record).get('Bookings') + "\n";

            var prompt = description +  plan + bookings + flow;
            console.log(`new prompt: \n`, prompt);

            // update the prompt to retell agent
            const retell = new Retell({apiKey: context.RETELL_API_KEY,});
            await retell.llm.update(context.RETELL_LLM_ID, {general_prompt:prompt});
            
            var prompt_es = "You are an agent only speak Spanish \n" + prompt
            await retell.llm.update(context.RETELL_LLM_ID_ES, {general_prompt:prompt_es});
            // retell.llm.update(context.RETELL_LLM_ID, {model:"gpt-4o"});
        }
    }
    catch (err) {
        console.error("Error connecting to Airtable", err);
        return callback(null, "Sorry, something went wrong, please try again!");
    }

    return callback(null, "Your Voice Assistant is ready, you can call +44 7700 176203 now!");
};