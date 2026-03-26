import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, password, reportData } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Create user account via auth system
    // Note: This uses the built-in auth endpoints
    const signupUrl = `${Deno.env.get('BASE44_AUTH_URL')}/auth/signup`;
    const signupRes = await fetch(signupUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).catch(() => null);

    if (!signupRes?.ok) {
      // Account might already exist - try to log in instead
      const loginUrl = `${Deno.env.get('BASE44_AUTH_URL')}/auth/login`;
      const loginRes = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        return Response.json({ error: 'Failed to create or access account' }, { status: 400 });
      }

      const loginData = await loginRes.json();
      return Response.json({ success: true, token: loginData.token });
    }

    const signupData = await signupRes.json();
    return Response.json({ success: true, token: signupData.token });
  } catch (error) {
    console.error('Error creating account:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});