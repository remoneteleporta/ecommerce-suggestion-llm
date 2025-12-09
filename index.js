async function search() {
  const tickersArr = document.getElementById("searchInput").value;
  if (!tickersArr) return;

  const response = await fetch(`/api/search?q=${tickersArr}`);
  if (!response.ok) {
    const text = await response.text();
    console.error("Server error:", text);
    return;
  }

  const data = await response.json();
  document.getElementById("summary").textContent = data.summary;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  data.products.forEach(p => {
    const item = document.createElement("div");
    item.style.margin = "10px 0";
    item.innerHTML = `
      <strong>${p.title}</strong><br>
      ${p.price} — from ${p.source}<br>
      <a href="${p.link}" target="_blank">View</a>
    `;
    resultsDiv.appendChild(item);
  });
}
