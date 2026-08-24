import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MermaidDiagram } from "@/components/admin/mermaid-diagram";
import { Network } from "lucide-react";

export const dynamic = "force-dynamic";

const ERD_CHART = `
erDiagram
    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ Assessment : "takes"
    User ||--o{ CoachingLog : "gives (Coach)"
    User ||--o{ CoachingLog : "receives (Coachee)"
    
    CoachingLog ||--o{ ActionItem : "contains"
    
    Question ||--o{ Option : "has"

    User {
        String id PK
        String name
        String npp UK
        String email UK
        String department
        String position
        String role "USER | ADMIN"
    }
    
    Account {
        String id PK
        String userId FK
        String type
        String provider
    }
    
    Session {
        String id PK
        String userId FK
        DateTime expires
    }
    
    Assessment {
        String id PK
        String userId FK
        String primaryStyle
        String secondaryStyle
        Boolean isCombination
    }
    
    CoachingLog {
        String id PK
        String coachId FK
        String coacheeId FK
        DateTime date
        String title
        String notes
    }
    
    ActionItem {
        String id PK
        String coachingLogId FK
        String text
        DateTime dueDate
        String evidenceUrl
    }
    
    Question {
        String id PK
        Int order
        String text
        Boolean isActive
    }
    
    Option {
        String id PK
        String questionId FK
        String letter
        String text
    }
`;

export default async function ErdPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-extrabold text-[#015249] dark:text-white tracking-tight flex items-center gap-3">
          <Network className="w-8 h-8 text-[#57BC90]" />
          Database ERD
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Visualisasi Entity Relationship Diagram dari struktur database sistem penilaian gaya komunikasi dan coaching.
        </p>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 relative">
        <MermaidDiagram chart={ERD_CHART} />
      </div>
    </div>
  );
}
