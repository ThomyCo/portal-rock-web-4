let last=0;export async function musicBrainzGate(){const wait=Math.max(0,1000-(Date.now()-last));if(wait)await new Promise(r=>setTimeout(r,wait));last=Date.now()}
