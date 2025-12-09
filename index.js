let tickersArr = ""

document.getElementById('ticker-input-form').addEventListener('click', () => {
    const tickerInput = document.getElementById('ticker-input')
    if (tickerInput.value.length >= 3) {
        generateReportBtn.disabled = false
        const newTickerStr = tickerInput.value
        tickersArr =  newTickerStr.toLowerCase().split(' ').join('+')
        tickerInput.value = ''
        renderTickers()
    } else {
        const label = document.getElementById('label')
        label.style.color = 'red'
        label.textContent = 'You must add a product requirement. E.g Football for Kids.'
    }
})

function renderTickers() {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = tickersArr
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
}

const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

const generateReportBtn = document.querySelector('.generate-report-btn')

generateReportBtn.addEventListener('click', fetchProductData)

async function fetchProductData() {
    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'
    try {
        const tick = encodeURIComponent(tickersArr);
         const response = await fetch(`/api/search?q=${tick}`);
         const data = await response.json();
            const status = await response.status
            if (status === 200) {
                apiMessage.innerText = 'Creating Product Suggestions...'
                console.log(data)
                const prodData = data
                renderReport(prodData)
            } else {
                loadingArea.innerText = 'There was an error fetching product data.'
            }
        }
     catch (err) {
        loadingArea.innerText = 'There was an error fetching product data.'
        console.error('error: ', err)
    }
}

function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    output.products.forEach((p) => {
    const item = document.createElement("div");
    item.style.margin = "10px 0";
    item.innerHTML = `
      <strong>${p.title}</strong><br>
      ${p.price} — from ${p.source}<br>
      <a href="${p.link}" target="_blank">View</a>
    `;
    outputArea.appendChild(item);
  });
    outputArea.style.display = 'flex'
}