let productInput = "";

const generateReportBtn = document.querySelector(".generate-report-btn");
const tickerInput = document.getElementById("ticker-input");
const tickersDiv = document.querySelector(".ticker-choice-display");
const loadingArea = document.querySelector(".loading-panel");
const apiMessage = document.getElementById("api-message");
const actionPanel = document.querySelector(".action-panel");
const outputPanel = document.querySelector(".output-panel");

// Add product input
document.querySelector(".add-ticker-btn").addEventListener("click", () => {
  const value = tickerInput.value.trim();

  if (value.length >= 3) {
    productInput = value.toLowerCase();
    tickerInput.value = "";
    renderTickers(productInput);
    generateReportBtn.disabled = false;
  } else {
    const label = document.querySelector("label");
    label.style.color = "red";
    label.textContent =
      "You must add at least product. E.g Football for Children.";
  }
});

function renderTickers(product) {
  tickersDiv.textContent = product;
  tickersDiv.classList.add("ticker");
}

// Fetch product data from backend function
generateReportBtn.addEventListener("click", fetchProductData);

async function fetchProductData() {
  if (!productInput) return;

  actionPanel.style.display = "none";
  loadingArea.style.display = "flex";
  apiMessage.innerText = "Querying Products API...";

  try {
    // Call backend function (Netlify or Vercel)
    const response = await fetch(
      `/.netlify/functions/product?q=${encodeURIComponent(productInput)}`
    );
    const data = await response.json();

    apiMessage.innerText = "Creating Product Suggestions...";

    // Call AI backend function
    const aiResponse = await fetch("/.netlify/functions/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    const aiOutput = await aiResponse.json();
    renderReport(aiOutput);

  } catch (err) {
    console.error(err);
    loadingArea.innerText = "There was an error fetching product data.";
  }
}

function renderReport(output) {
  loadingArea.style.display = "none";
  outputPanel.style.display = "flex";

  const report = document.createElement("p");
  report.textContent = output;
  outputPanel.appendChild(report);
}