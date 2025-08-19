export async function sendEmail(email: string, subject: string, body: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': import.meta.env.VITE_API_KEY
    },
    body: JSON.stringify({
      sender: { email: 'read.cycle.inv@gmail.com', name: 'ReadCycle' },
      to: [{ email: email, name: 'Parent' }],
      subject: subject,
      htmlContent: body
    })
  });

  const data = await res.json();

  console.log("DATA: ", data)
}