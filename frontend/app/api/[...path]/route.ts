import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'POST');
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'PATCH');
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'DELETE');
}

async function proxyRequest(req: NextRequest, path: string[], method: string) {
  const url = `${BACKEND_URL}/api/${path.join('/')}`;
  const cookie = req.headers.get('cookie') || '';

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
  };

  if (method !== 'GET') {
    options.body = await req.text();
  }

  const backendRes = await fetch(url, options);
  const data = await backendRes.text();
  
  const res = new NextResponse(data, {
    status: backendRes.status,
    headers: { 'Content-Type': 'application/json' },
  });

  const setCookie = backendRes.headers.get('set-cookie');
  if (setCookie) {
    res.headers.set('set-cookie', setCookie);
  }

  return res;
}