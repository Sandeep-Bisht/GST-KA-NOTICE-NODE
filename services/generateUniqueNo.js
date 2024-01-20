
const Tickets = require('../models/tickets'); // Import your tickets model

const generateUniqueNo = async (prefix) => {
  try {
    // return prefix;

   if(!prefix || (prefix != 'T' && prefix != "Case")){
    return {
        error: true,
        status: 400,
        message: 'Invalid data.',
      };
   }

   let previousdata = [];

   if(prefix === 'T'){
    previousdata = await Tickets.find().select('ticketNo');
   }else{
    previousdata = await Tickets.find().select('ticketNo');
   }

   let uniqueNo = await UniqueNo();

   function UniqueNo(){
    let randomNumber = prefix + Math.floor(100000 + Math.random() * 900000);
    if(previousdata && Array.isArray(previousdata)){

        if(previousdata.some(item => item.ticketNo == randomNumber)){
            generateUniqueNo()
        }
        else{
            return randomNumber;
        }
    }
    else{
        return randomNumber;
    }
   }

    return uniqueNo;
    
  } catch (error) {
    return {
      error: true,
      status: 500,
      message: 'Error creating new user.',
    };
  }
};

module.exports = generateUniqueNo;
