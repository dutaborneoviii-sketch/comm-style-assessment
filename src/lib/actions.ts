"use server";

import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(formData: FormData) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo: '/profile'
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Kredensial tidak valid.' };
        default:
          return { error: 'Terjadi kesalahan.' };
      }
    }
    throw error;
  }
}

import { prisma } from "@/lib/prisma";
import { calculateStyle, AnswerCounts } from "@/lib/scoring";
import { redirect } from "next/navigation";

export async function submitAssessment(counts: AnswerCounts) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = calculateStyle(counts);

  const assessment = await prisma.assessment.create({
    data: {
      userId: session.user.id,
      countA: counts.A,
      countB: counts.B,
      countC: counts.C,
      countD: counts.D,
      primaryStyle: result.primaryStyle,
      secondaryStyle: result.secondaryStyle,
      isCombination: result.isCombination,
    }
  });

  redirect(`/questionnaire/result/${assessment.id}`);
}

import { revalidatePath } from "next/cache";

export async function updateQuestion(
  questionId: string, 
  data: { text: string; options: { id: string; text: string }[] }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") throw new Error("Forbidden");

  // Update question text
  await prisma.question.update({
    where: { id: questionId },
    data: { text: data.text }
  });

  // Update options texts
  for (const opt of data.options) {
    await prisma.option.update({
      where: { id: opt.id },
      data: { text: opt.text }
    });
  }

  revalidatePath('/admin/questions');
  revalidatePath('/questionnaire');
}

import * as xlsx from 'xlsx';

export async function uploadQuestionsExcel(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") throw new Error("Forbidden");

  const file = formData.get('file') as File | null;
  if (!file) throw new Error("No file provided");

  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = xlsx.utils.sheet_to_json<any>(worksheet);

  if (!data || data.length === 0) throw new Error("Excel file is empty");

  // Validate format. Expecting at least: Pertanyaan, A, B, C, D
  const firstRow = data[0];
  if (!firstRow.Pertanyaan || !firstRow.A || !firstRow.B || !firstRow.C || !firstRow.D) {
    throw new Error("Format Excel tidak valid. Pastikan kolom berjudul: Pertanyaan, A, B, C, D");
  }

  // Transaction to delete old and insert new
  await prisma.$transaction(async (tx) => {
    // Delete all existing questions
    await tx.question.deleteMany();

    // Insert new questions
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row.Pertanyaan) continue;

      await tx.question.create({
        data: {
          order: i + 1,
          text: String(row.Pertanyaan),
          options: {
            create: [
              { letter: 'A', text: String(row.A || '') },
              { letter: 'B', text: String(row.B || '') },
              { letter: 'C', text: String(row.C || '') },
              { letter: 'D', text: String(row.D || '') },
            ]
          }
        }
      });
    }
  });

  revalidatePath('/admin/questions');
  revalidatePath('/questionnaire');
}
