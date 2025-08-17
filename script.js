// script.js - works with your existing verify.html structure
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

const supabase = createClient(window.__SUPABASE_URL__, window.__SUPABASE_ANON_KEY__);

// Get your existing elements by ID
const $input = document.getElementById("cert-input");
const $name = document.getElementById("name");
const $university = document.getElementById("university");
const $branch = document.getElementById("branch");
const $courseType = document.getElementById("course-type");
const $issuedAt = document.getElementById("issued-at");
const $status = document.getElementById("cert-status");

// Validate TBH-YYYY-ABCDE format
const isValidId = (id) => /^TBH-\d{4}-[A-Z0-9]{5}$/.test(id);

async function verifyCert(certId) {
  const normalized = certId.trim().toUpperCase();
  
  if (!isValidId(normalized)) {
    if ($status) $status.textContent = "Invalid ID format";
    return;
  }

  if ($status) $status.textContent = "Checking...";

  try {
    const { data } = await supabase
      .from("certificates_public")
      .select("name, uni, deg, course, issued_at")
      .eq("cert_id", normalized)
      .single();

    if (data) {
      // Update your placeholders with real data
      if ($name) $name.textContent = data.name;
      if ($university) $university.textContent = data.uni;
      if ($branch) $branch.textContent = data.deg;
      if ($courseType) $courseType.textContent = data.course;
      if ($issuedAt) $issuedAt.textContent = formatDate(data.issued_at);
      if ($status) $status.textContent = "Valid";
    } else {
      if ($status) $status.textContent = "Not found";
    }
  } catch (error) {
    if ($status) $status.textContent = "Error verifying";
  }
}

// Listen for input changes
if ($input) {
  let timer;
  $input.addEventListener("input", (e) => {
    clearTimeout(timer);
    e.target.value = e.target.value.toUpperCase();
    timer = setTimeout(() => verifyCert(e.target.value), 500);
  });
}

// Auto-verify if URL has ?id= parameter (for QR codes)
const urlId = new URLSearchParams(location.search).get("id");
if (urlId && $input) {
  $input.value = urlId.toUpperCase();
  verifyCert(urlId);
}
