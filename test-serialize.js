const { getCoachingReport } = require('./.next/server/app/actions/reports.js');

async function run() {
  const reports = await getCoachingReport();
  
  // function to recursively find undefined values in objects
  function findUndefined(obj, path = "") {
    if (obj === undefined) {
      console.log("Found undefined at path:", path);
      return true;
    }
    if (obj === null || typeof obj !== 'object') return false;
    
    let hasUndefined = false;
    for (const key in obj) {
      if (findUndefined(obj[key], path ? `${path}.${key}` : key)) {
        hasUndefined = true;
      }
    }
    return hasUndefined;
  }
  
  console.log("Checking for undefined...");
  const has = findUndefined(reports, "reports");
  if (!has) {
    console.log("No undefined values found!");
  }
}

run().catch(console.error);
