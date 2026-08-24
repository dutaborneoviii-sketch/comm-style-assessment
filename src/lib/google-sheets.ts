export async function sendAssessmentToGoogleSheets(data: any) {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  
  if (!url) {
    console.warn("NEXT_PUBLIC_GOOGLE_SCRIPT_URL is not defined in environment variables.");
    return null;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "text/plain;charset=utf-8", 
        // Note: Using text/plain to avoid CORS preflight issues with Google Apps Script
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to send data to Google Sheets:", error);
    return null;
  }
}
