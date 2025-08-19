export async function sendEmail(email: string, subject: string, body: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': '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'
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