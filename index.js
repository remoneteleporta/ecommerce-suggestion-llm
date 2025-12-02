let productInput = ""

const generateReportBtn = document.querySelector('.generate-report-btn')

generateReportBtn.addEventListener('click', fetchProductData)

document.getElementById('ticker-input-form').addEventListener('click', (e) => {
    e.preventDefault()
    const tickerInput = document.getElementById('ticker-input')
    if (tickerInput.value.length >= 3) {
        generateReportBtn.disabled = false
        const newTickerStr = tickerInput.value
        productInput = newTickerStr.toLowerCase()
        console.log(productInput)
        tickerInput.value = ''
        renderTickers(productInput)
    } else {
        const label = document.getElementsByTagName('label')[0]
        label.style.color = 'red'
        label.textContent = 'You must add at least product. E.g Football for Children.'
        return
    }
})

function renderTickers(productInput) {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = productInput
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    }

const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

async function fetchProductData() {
    document.querySelector('.action-panel').style.display = 'none';
    loadingArea.style.display = 'flex';

    try {
        const url = `https://serpapi.com/search?engine=google&q=${productInput}&api_key=${process.env.SERP_API_KEY}`;
        const response = await fetch(url)

        if (response.status === 200) {
            const data = await response.text()
            console.log(data)
            apiMessage.innerText = 'Creating Product Suggestions...'
            fetchReport(data)
        } else {
            loadingArea.innerText = 'There was an error fetching product data.'
        }

    } catch (err) {
        loadingArea.innerText = 'There was an error fetching product data.'
        console.error('Fetch Error:', err)
    }
}


async function fetchReport(data) {
    const messages = [
        {
            role: 'system',
            content: 'You are an Online Product Recommendation Expert, giving recommendations in 30 words'
        },
        {
            role: 'user',
            content: `${data}
            ###
            The best matching product for you is Samsung Phone with 8 megapixel camera, 512 gb Storage which is under ₹50K in price
            ###
            `
        }
    ]

    try {
        const openAI = require("openai")
        const client = new openAI.OpenAI({apiKey: process.env.OPENAI_API_KEY})
        const response = await client.chat.completions.create({
            model: 'gpt-5-nano',
            messages: messages,
            temperature: 1
        })
        renderReport(response)

    } catch (err) {
        console.log('Error:', err)
        loadingArea.innerText = 'Unable to access AI. Please refresh and try again'
    }
}

function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    const report = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'
}