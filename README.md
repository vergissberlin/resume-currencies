## Credits

- Textures https://www.solarsystemscope.com/textures/
- API https://app.freecurrencyapi.com/dashboard


```js
// Place the currency values on the earth, hide labels behind the earth
const placeCurrency = async () => {
    // Get the currency data
    const currency = await getCurrency()

    // Loop through the currency data
    for (const [key, value] of Object.entries(currency)) {

        // Create a div for the currency
        const currencyDiv = document.createElement('div')
        currencyDiv.className = 'label'
        currencyDiv.textContent = `${key} ${value}`

        // Random number between -1 and 1
        const random = Math.random() * 2 - 1

        // Create a CSS2DObject for the currency
        const currencyObject = new CSS2DObject(currencyDiv)
        currencyObject.position.x = Math.sin(Math.random() * 2 * Math.PI)
        currencyObject.position.y = Math.random() * 2 - 1
        currencyObject.position.z = Math.cos(Math.random() * 2 * Math.PI)

        // Add the currency to the scene
        scene.add(currencyObject)
    }
}



const currencyDivs = {
    AUD: document.createElement('div'),
    BGN: document.createElement('div'),
    BRL: document.createElement('div'),
    CAD: document.createElement('div'),
    CHF: document.createElement('div'),
    CNY: document.createElement('div'),
    CZK: document.createElement('div'),
    EUR: document.createElement('div'),
    GBP: document.createElement('div'),
    HKD: document.createElement('div'),
    JPY: document.createElement('div'),
    MXN: document.createElement('div'),
    PLN: document.createElement('div'),
    RUB: document.createElement('div'),
    USD: document.createElement('div'),
}

const currencyObjects = {
    AUD: new CSS2DObject(currencyDivs.AUD),
    BGN: new CSS2DObject(currencyDivs.BGN),
    BRL: new CSS2DObject(currencyDivs.BRL),
    CAD: new CSS2DObject(currencyDivs.CAD),
    CHF: new CSS2DObject(currencyDivs.CHF),
    CNY: new CSS2DObject(currencyDivs.CNY),
    CZK: new CSS2DObject(currencyDivs.CZK),
    EUR: new CSS2DObject(currencyDivs.EUR),
    GBP: new CSS2DObject(currencyDivs.GBP),
    HKD: new CSS2DObject(currencyDivs.HKD),
    JPY: new CSS2DObject(currencyDivs.JPY),
    MXN: new CSS2DObject(currencyDivs.MXN),
    PLN: new CSS2DObject(currencyDivs.PLN),
    RUB: new CSS2DObject(currencyDivs.RUB),
    USD: new CSS2DObject(currencyDivs.USD),
}


```
