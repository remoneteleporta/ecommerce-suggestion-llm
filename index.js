const { OpenAI } = require('openai')
let tickersArr = ""

const generateReportBtn = document.querySelector('.generate-report-btn')

generateReportBtn.addEventListener('click', fetchProductData)

document.getElementById('ticker-input-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const tickerInput = document.getElementById('ticker-input')
    if (tickerInput.value.length >= 3) {
        generateReportBtn.disabled = false
        const newTickerStr = tickerInput.value
        tickersArr =  newTickerStr.toLowerCase().split(' ').join('+')
        tickerInput.value = ''
        renderTickers()
    } else {
        const label = document.getElementsByTagName('label')[0]
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

async function fetchProductData() {
    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'
    try {
         const url = `https://serpapi.com/search.json?engine=google_shopping&q=${tickersArr}&google_domain=google.com&api_key=${process.env.SERP_API_KEY}`
            const response = await fetch(url)
            const data = await response.json()
            const status = await response.status
            if (status === 200) {
                apiMessage.innerText = 'Creating Product Suggestions...'
                console.log(data)
                const prodData = data
                fetchReport(prodData)
            } else {
                loadingArea.innerText = 'There was an error fetching product data.'
            }
        }
     catch (err) {
        loadingArea.innerText = 'There was an error fetching product data.'
        console.error('error: ', err)
    }
}

async function fetchReport(data) {
    const messages = [
        {
            role: 'system',
            content: 'You are an Ecommerce Product suggestion Export who can look into all product data and suggest top 3 products, their brands, their price and ratings in 50 words'
            },
        {
            role: 'user',
            content: `${data}
            ###
            The Samsung Galaxy A16 model with 8 megapixel is best product to buy with 4.5 ratings and price below 100000 
            ###
            `
        }
    ]

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        })
        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: messages,
            temperature: 1
        })
        renderReport(response.choices[0].message.content)

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