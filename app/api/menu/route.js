import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const filePath = path.join(process.cwd(), 'data', 'menu.json');

export async function GET() {
  const file = await fs.readFile(filePath, 'utf8');
  return NextResponse.json(JSON.parse(file));
}

export async function POST(request) {
  const body = await request.json();
  await fs.writeFile(filePath, JSON.stringify(body, null, 2));
  return NextResponse.json({ ok: true });
}
