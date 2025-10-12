export async function getJobOffers() {
  const response = await fetch("http://localhost:8089/api/joboffers");
  if (!response.ok) throw new Error("Failed to fetch job offers");
  return await response.json();
}

export async function applyForJob(candidateId, jobOfferId) {
  const response = await fetch("http://localhost:8089/api/candidates/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ candidateId, jobOfferId }),
  });

  if (!response.ok) throw new Error("Failed to apply for job");
  return await response.json();
}
