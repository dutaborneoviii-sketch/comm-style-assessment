export function getUserAccess(user: { workUnit?: string | null, pangkat?: string | null, role?: string | null, positionDetail?: string | null }) {
  const workUnit = user?.workUnit || "";
  const pangkat = user?.pangkat || "";
  
  let isCoach = false;
  let isCoachee = false;
  let isAdmin = user?.role === "ADMIN"; // Default fallback to DB role

  if (workUnit === "Kedeputian Wilayah VIII") {
    if (pangkat === "Senior Manager") { isCoach = true; }
    else if (pangkat === "Manager") { isCoach = true; isCoachee = true; }
    else if (["Asisten Manager", "Pelaksana", "PTT/PATT"].includes(pangkat)) { isCoachee = true; }
  } 
  else if (workUnit === "Kedeputian Bidang Operasional dan Keamanan Teknologi Informasi") {
    if (pangkat === "Asisten Manager") { isCoach = true; isCoachee = true; isAdmin = true; }
    else if (pangkat === "Pelaksana") { isCoachee = true; isAdmin = true; }
  } 
  else if (workUnit.startsWith("Kantor Cabang") || workUnit === "Kantor Kabupaten" || workUnit === "Kantor Kota") {
    if (pangkat === "Manager") { isCoach = true; }
    else if (pangkat === "Asisten Manager") {
      if (user?.positionDetail === "Claim Advisor Pratama") {
        isCoachee = true;
      } else {
        isCoach = true; 
        isCoachee = true; 
      }
    }
    else if (pangkat === "Pelaksana") { isCoachee = true; }
    else if (pangkat === "PTT/PATT") {
      // Checked for Coachee EXCEPT Balikpapan and Tarakan
      if (!["Kantor Cabang Balikpapan", "Kantor Cabang Tarakan"].includes(workUnit)) {
        isCoachee = true;
      }
    }
  }

  // Allow Deputi Direksi Wilayah to be coach (in case table misses edge cases)
  if (!isCoach && user?.pangkat === 'Deputi Direksi Wilayah') {
      isCoach = true;
  }
  
  // Backward compatibility with previous logic
  if (!isCoach && ['Deputi Direksi Wilayah', 'Asisten Deputi', 'Kepala Kabupaten', 'Kepala Cabang', 'Kepala Kantor Kabupaten', 'Kepala Kantor Kota', 'Asisten Manager'].some(pos => user?.positionDetail?.startsWith(pos))) {
      isCoach = true;
  }

  const isManagerKC = pangkat === 'Manager' && workUnit?.startsWith('Kantor Cabang');
  
  // Force isCoachee false for Top Level/Manager users just to be safe
  if (
    pangkat === 'Senior Manager' || 
    pangkat === 'Deputi Direksi Wilayah' || 
    isManagerKC ||
    ['Kepala Cabang', 'Deputi Direksi Wilayah'].includes(user?.positionDetail || '')
  ) {
    isCoachee = false;
  }

  return { isCoach, isCoachee, isAdmin };
}
