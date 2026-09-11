/**
 * MICE ESG Frontend API Module (Decoupled Client)
 */
const API_BASE_URL = window.location.origin.includes('github.io') ? '' : 'http://localhost:3000';

export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stats`);
    if (!res.ok) throw new Error('API Response Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend API unavailable. Using frontend fallback mode:', err);
    return null;
  }
}

export async function submitParticipation(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/participate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('API Response Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend API submission unavailable. Using local fallback:', err);
    return { success: true, fallback: true };
  }
}
