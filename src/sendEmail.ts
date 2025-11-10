export async function sendEmail(email: string, subject: string, body: string) {
  const res = await fetch(
    "https://us-central1-book-exchange-22dd2.cloudfunctions.net/sendEmail",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, subject, body }),
    }
  );

  const data = await res.json();
  console.log("Email response:", data);
  return data;
}
