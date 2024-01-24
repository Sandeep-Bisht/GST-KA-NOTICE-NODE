
const Tickets = require('../models/tickets'); // Import your tickets model
const Cases = require('../models/cases')

const generateUniqueNo = async (prefix) => {
  try {
    // return prefix;

   if(!prefix || (prefix != 'T' && prefix != "C")){
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
    previousdata = await Cases.find().select('caseNo');
   }

   let uniqueNo = await UniqueNo();

   function UniqueNo(){
    let randomNumber = prefix + Math.floor(100000 + Math.random() * 900000);
    if(previousdata && Array.isArray(previousdata)){

        if(prefix === 'T' ? previousdata.some(item => item.ticketNo == randomNumber) : previousdata.some(item => item.caseNo == randomNumber)){
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
      message: 'Error creating Unique Code.',
    };
  }
};

module.exports = generateUniqueNo;
