async function login() {
  const params = new URLSearchParams();
  params.append('npp', '10030');
  params.append('password', '123456');

  try {
    const res = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text.substring(0, 200));
  } catch (err) {
    console.error(err);
  }
}

login();
