const fs = require('fs');
const path = './src/app/actions/reports.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace any potentially undefined returns with || null
code = code.replace(/pangkat: data\.pangkat,/g, "pangkat: data.pangkat || null,");
code = code.replace(/positionDetail: data\.positionDetail,/g, "positionDetail: data.positionDetail || null,");
code = code.replace(/employeeLocation: data\.employeeLocation,/g, "employeeLocation: data.employeeLocation || null,");

code = code.replace(/department: leader\.department,/g, "department: leader.department || null,");
code = code.replace(/pangkat: leader\.pangkat,/g, "pangkat: leader.pangkat || null,");
code = code.replace(/positionDetail: leader\.positionDetail,/g, "positionDetail: leader.positionDetail || null,");
code = code.replace(/employeeLocation: leader\.employeeLocation,/g, "employeeLocation: leader.employeeLocation || null,");
code = code.replace(/workUnit: leader\.workUnit,/g, "workUnit: leader.workUnit || null,");

fs.writeFileSync(path, code);
