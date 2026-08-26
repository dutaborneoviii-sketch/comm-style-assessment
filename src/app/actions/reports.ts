"use server";

import { prisma } from "@/lib/prisma";

export async function getCoachingReport() {
  const leaders = await prisma.user.findMany({
    where: {
      position: {
        in: ["Asisten Deputi", "Deputi Direksi Wilayah"]
      },
      status: "APPROVED"
    },
    select: {
      id: true,
      name: true,
      department: true,
      position: true,
      coachLogs: {
        select: {
          isClosed: true,
          coacheeId: true,
          coachee: {
            select: { name: true, position: true }
          }
        }
      }
    },
    orderBy: [
      { department: 'asc' },
      { name: 'asc' }
    ]
  });

  const allStaff = await prisma.user.findMany({
    where: {
      status: "APPROVED",
      position: {
        notIn: ["Deputi Direksi Wilayah"]
      }
    },
    select: { id: true, name: true, department: true, position: true }
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
    
    let eligibleStaff = [];
    if (leader.position === 'Deputi Direksi Wilayah') {
      eligibleStaff = allStaff.filter(s => s.position === 'Asisten Deputi');
    } else {
      eligibleStaff = allStaff.filter(s => s.department === leader.department && s.id !== leader.id && s.position !== 'Asisten Deputi');
    }
    
    const belumMulaiStaff = eligibleStaff.filter(s => !uniqueCoacheeIds.has(s.id));
    const belumMulaiNames = belumMulaiStaff.map(s => s.name).filter(Boolean) as string[];

    // Generate detailed members list
    const membersList: { name: string; status: string; position: string; selesai: number; proses: number; belumMulai: number }[] = [];
    
    // Add staff with sessions
    const counts: Record<string, { selesai: number; proses: number; position: string }> = {};
    leader.coachLogs.forEach(log => {
      const name = log.coachee?.name;
      const position = log.coachee?.position || "-";
      if (name) {
        if (!counts[name]) counts[name] = { selesai: 0, proses: 0, position };
        if (log.isClosed) counts[name].selesai++;
        else counts[name].proses++;
      }
    });
    
    Object.entries(counts).forEach(([name, data]) => {
      membersList.push({ name, position: data.position, selesai: data.selesai, proses: data.proses, belumMulai: 0, status: `Mengikuti ${data.selesai + data.proses}x sesi Coaching` });
    });
    
    // Add staff without sessions
    belumMulaiStaff.forEach(s => {
      if (s.name) {
        membersList.push({ name: s.name, position: s.position || "-", selesai: 0, proses: 0, belumMulai: 1, status: 'Belum Mengikuti Sesi Coaching' });
      }
    });

    // Sort members alphabetically
    membersList.sort((a, b) => a.name.localeCompare(b.name));

    // Also inject the leader as the first member if they want it like the mockup (Optional, I'll just add the leader to members list if it makes sense. Wait, no, it's better to just put the leader in the UI array). Actually I'll let UI handle prepending the leader.

    return {
      id: leader.id,
      name: leader.name,
      department: leader.department,
      position: leader.position,
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

  const deputi = report.filter(r => r.position === 'Deputi Direksi Wilayah');
  const others = report.filter(r => r.position !== 'Deputi Direksi Wilayah');

  return [...deputi, ...others];
}
