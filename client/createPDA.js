const web3 = require('@solana/web3.js');

  

async function findPDA(programIdString, seedString) {

const programId = new web3.PublicKey(programIdString);

const seed = Buffer.from(seedString);

  

const [pda, bumpSeed] = await web3.PublicKey.findProgramAddress(

[seed],

programId

);

  

console.log('PDA:', pda.toString());

console.log('Bump Seed:', bumpSeed);

}

  

const PROGRAM_ID = 'CkDEBSt52MZaHatWguaDb8qaSmcbv1H6cbAP8Jc1tRjK'; // Replace with your actual program ID

const SEED_STRING = 'poll_123'; // Define a seed specific to your use case

findPDA(PROGRAM_ID, SEED_STRING);