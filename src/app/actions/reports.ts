"use server";

import { prisma } from "@/lib/prisma";
import { getUserAccess } from "@/lib/access";

export async function getCoachingReport() {
  const allUsers = await prisma.user.findMany({
    where: {
      status: "APPROVED"
    },
    select: {
      id: true,
      name: true,
      npp: true,
      email: true,
      role: true,
      department: true,
      pangkat: true,
      positionDetail: true,
      workUnit: true,
      employeeLocation: true,
      coachLogs: {
        select: {
          isClosed: true,
          coacheeId: true,
          coachee: {
            select: { name: true, pangkat: true, positionDetail: true, employeeLocation: true }
          }
        }
      }
    },
    orderBy: [
      { department: 'asc' },
      { name: 'asc' }
    ]
  });

  const leaders = allUsers.filter(u => getUserAccess(u as any).isCoach);

  const allStaff = await prisma.user.findMany({
    where: {
      status: "APPROVED",
      positionDetail: {
        notIn: ["Deputi Direksi Wilayah", "Kepala Cabang"]
      }
    },
    select: { id: true, name: true, department: true, positionDetail: true, employeeLocation: true, workUnit: true, pangkat: true }
  });

  const report = leaders.map(leader => {
    const selesaiLogs = leader.coachLogs.filter(log => log.isClosed);
    const prosesLogs = leader.coachLogs.filter(log => !log.isClosed);
    
    const countNames = (logs: typeof leader.coachLogs) => {
      const counts: Record<string, number> = {};
      logs.forEach(log => {
        const name = log.coachee?.name;
        if (name) {
          counts[name] = (counts[name] || 0) + 1;
        }
      });
      return Object.entries(counts).map(([name, count]) => `${name} (${count}x)`);
    };

    const selesaiNames = Array.from(new Set(selesaiLogs.map(log => log.coachee?.name).filter(Boolean))) as string[];
    const prosesNames = Array.from(new Set(prosesLogs.map(log => log.coachee?.name).filter(Boolean))) as string[];
    const totalSesiNames = countNames(leader.coachLogs);
    
    const uniqueCoacheeIds = new Set(leader.coachLogs.map(log => log.coacheeId));
    
    let eligibleStaff: typeof allStaff = [];
    
    const isTopLevel = leader.pangkat === 'Senior Manager' || leader.pangkat === 'Deputi Direksi Wilayah' || leader.positionDetail === 'Deputi Direksi Wilayah' || leader.positionDetail === 'Kepala Cabang';
    
    let targetPangkat: string[] = [];
    if (isTopLevel) {
      if (leader.positionDetail === 'Kepala Cabang' || (leader.workUnit?.startsWith('Kantor Cabang') && leader.pangkat === 'Manager')) {
        targetPangkat = ['Asisten Manager'];
      } else if (leader.pangkat === 'Senior Manager') {
        targetPangkat = ['Manager'];
      } else {
        targetPangkat = ['Manager', 'Asisten Manager', 'Pelaksana', 'PTT/PATT', 'Asisten Deputi', 'Kepala Kabupaten', 'Kepala Kantor Kabupaten', 'Staf Pelaksana'];
      }
    } else if (leader.pangkat === 'Manager' || leader.positionDetail === 'Asisten Deputi' || leader.positionDetail === 'Kepala Kabupaten' || leader.positionDetail === 'Kepala Kantor Kabupaten') {
      targetPangkat = ['Asisten Manager', 'Pelaksana', 'PTT/PATT', 'Staf Pelaksana'];
    } else if (leader.pangkat === 'Asisten Manager' || leader.positionDetail === 'Asisten Manager') {
      targetPangkat = ['Pelaksana', 'PTT/PATT', 'Staf Pelaksana'];
    }

    eligibleStaff = allStaff.filter(s => {
      if (s.id === leader.id) return false;
      if (leader.role === 'ADMIN') return true;
      
      const isTarget = targetPangkat.includes(s.pangkat!) || targetPangkat.includes(s.positionDetail!);
      if (!isTarget) return false;
      
      const isSameUnit = !leader.workUnit || s.workUnit === leader.workUnit;
      const isSameDept = (isTopLevel || leader.positionDetail === 'Kepala Kabupaten' || leader.positionDetail === 'Kepala Kantor Kabupaten') ? true : (!leader.department || s.department === leader.department);
      const isSameLoc = (leader.positionDetail === 'Kepala Kabupaten' || leader.positionDetail === 'Kepala Kantor Kabupaten') ? s.employeeLocation === leader.employeeLocation : true;
      
      return isSameUnit && isSameDept && isSameLoc;
    });
    
    const belumMulaiStaff = eligibleStaff.filter(s => !uniqueCoacheeIds.has(s.id));
    const belumMulaiNames = belumMulaiStaff.map(s => s.name).filter(Boolean) as string[];

    // Generate detailed members list
    const membersList: { name: string; pangkat: string; status: string; positionDetail: string; employeeLocation: string; selesai: number; proses: number; belumMulai: number }[] = [];
    
    // Add staff with sessions
    const counts: Record<string, { selesai: number; proses: number; pangkat: string; positionDetail: string; employeeLocation: string }> = {};
    (leader as any).coachLogs.forEach((log: any) => {
      const name = log.coachee?.name;
      const pangkat = log.coachee?.pangkat || "-";
      const positionDetail = log.coachee?.positionDetail || "-";
      const employeeLocation = log.coachee?.employeeLocation || "-";
      if (name) {
        if (!counts[name]) counts[name] = { selesai: 0, proses: 0, pangkat, positionDetail, employeeLocation };
        if (log.isClosed) counts[name].selesai++;
        else counts[name].proses++;
      }
    });
    
    Object.entries(counts).forEach(([name, data]) => {
      membersList.push({ name, pangkat: data.pangkat || null, positionDetail: data.positionDetail || null, employeeLocation: data.employeeLocation || null, selesai: data.selesai, proses: data.proses, belumMulai: 0, status: `Mengikuti ${data.selesai + data.proses}x sesi Coaching` });
    });
    
    // Add staff without sessions
    belumMulaiStaff.forEach(s => {
      if (s.name) {
        membersList.push({ name: s.name, pangkat: s.pangkat || "-", positionDetail: s.positionDetail || "-", employeeLocation: s.employeeLocation || "-", selesai: 0, proses: 0, belumMulai: 1, status: 'Belum Mengikuti Sesi Coaching' });
      }
    });

    // Sort members alphabetically
    membersList.sort((a, b) => a.name.localeCompare(b.name));

    return {
      id: leader.id,
      name: leader.name,
      department: leader.department || null,
      pangkat: leader.pangkat || null,
      positionDetail: leader.positionDetail || null,
      employeeLocation: leader.employeeLocation || null,
      workUnit: leader.workUnit || null,
      totalSesi: leader.coachLogs.length,
      selesai: selesaiLogs.length,
      proses: prosesLogs.length,
      belumMulai: belumMulaiNames.length,
      
      // Tooltip data
      totalSesiNames,
      selesaiNames,
      prosesNames,
      belumMulaiNames,
      
      // Detailed breakdown
      members: membersList
    };
  });

  const deputi = report.filter(r => r.pangkat === 'Deputi Direksi Wilayah');
  const others = report.filter(r => r.pangkat !== 'Deputi Direksi Wilayah');

  const getSortScore = (r: any) => {
    if (r.pangkat === 'Senior Manager') return 1;
    if (r.pangkat === 'Manager') {
      if (r.positionDetail?.includes('Asisten Deputi')) return 2;
      if (r.positionDetail?.includes('Kepala Cabang')) return 3;
      return 4; // other managers just in case
    }
    if (r.pangkat === 'Asisten Manager') return 5;
    return 99;
  };

  others.sort((a, b) => {
    const orderA = getSortScore(a);
    const orderB = getSortScore(b);
    
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || '').localeCompare(b.name || '');
  });

  return [...deputi, ...others];
}
