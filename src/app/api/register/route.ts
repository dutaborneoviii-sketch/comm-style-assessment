import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, npp, email, department, position, password } = body;

    if (!name || !npp || !email || !department || !position || !password) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { npp: npp },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'NPP atau Email sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        npp,
        email,
        department,
        position,
        password: hashedPassword,
        status: 'PENDING',
        role: 'USER'
      }
    });

    return NextResponse.json({ message: 'Pendaftaran berhasil. Silakan tunggu persetujuan Admin.', user: { id: newUser.id, name: newUser.name } }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem: ' + (error.message || String(error)) }, { status: 500 });
  }
}
