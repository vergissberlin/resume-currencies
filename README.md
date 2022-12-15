# Currency exchange rate visualization

[![Build and deploy application](https://github.com/vergissberlin/resume-currencies/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/vergissberlin/resume-currencies/actions/workflows/build-and-deploy.yml)

Visualisation of currency exchange rates as prototype with threejs.

![Teaser](./docs/teaser-without.png)

## Architecture

This project is baseed on Three.js. As data source, the Free Currency API is used. The API is used to get the currency data for the selected date. The data is then used to calculate the position of the countries on the globe. The globe is then rotated to the selected currency.

```mermaid
flowchart LR
    A[User] <-->| getExchangeRates | B(ReversProxy) <--> | getExchangeRates | C[CurrencyAPI]
```

## Improvements

This is an prototype of a currency visualization. It is not finished and there are a lot of improvements to be made. If you want to contribute, feel free to open a pull request.

### Add Functionality

This project is not in final state.
To be useful, the following features need to be added:

* List view of all currencies with their current value under the globe
* Rotate the earth to selected currency
* Color countries based on currency value (red = low, green = high) (Heatmap)
* On click on a label, open a modal with more information about the currency history
* Add time slider to change the date of the currency data
* Add a search bar to search for a currency by country name
* Add a loading animation
* Add imprint

### Technical improvements

- [x] Capsulate logic in fuctions
- [x] Add types
- [ ] CORS proxy settings
- [ ] Add unit and e2e tests
- [ ]  Add a 404 page
- [ ]  Add error handling
- [x]  CI/CD pipeline with github actions
- [x]  Use github pages to host the project
- [ ] Add a linter
- [ ] Add a formatter
- [ ] Add a commit message linter
- [x] Reduce the size of the textures
- [ ] Varnish Reverse Proxy for the API to hide the API key and to cache the data

## Development

*Setup and run:*

```bash
yarn
yarn dev
```

## Credits

* Textures <https://www.solarsystemscope.com/textures/>
* API <https://app.freecurrencyapi.com/dashboard>

## License

MIT

## Changelog

```typescript
import * as THREE from 'three'
import gsap from 'gsap'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import './style.css'

const
    apiKey = 'MXOPiCmyl3TzlByq7DuKDkRHXW0bletn4VOxFibf',
    currencyList = 'AUD,CAD,CHF,CNY,EUR,HKD,JPY,MXN,RUB,USD'

let
    camera,
    scene,
    renderer,
    labelRenderer

let
    currencyBase = 'EUR',
    apiUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=${currencyList}&base_currency=${currencyBase}`

// If developement mode, use mock data
if (process.env.NODE_ENV === 'development')
    apiUrl = `${window.location.href}/fixtures/mock.json`


/**
 * Class structure
 * - import all needed modules
 * - declare all variables
 * - init
 * - animate
 * - render
 * - onWindowResize
*/
class App {

    constructor() {
        this.init()
        this.animate()
    }

    init() {
        // Renderer setup
        renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0x000000, 1)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        document.body.appendChild(renderer.domElement)

        // Orbit controls setup
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.minDistance = 1
        controls.maxDistance = 10
        controls.enablePan = false
        controls.enableZoom = false
        controls.enableRotate = false

        // Get current values of currency from API
        getCurrency().then((data) => {
            updateLabels(data.rates)
        })

        // Update the currency values every 10 seconds
        setInterval(() => {
            getCurrency().then((data) => {
                updateLabels(data.rates)
            })
        }, 10000)

        // Change base currency
        const select = document.getElementById('currency')
        select.addEventListener('change', (event) => {
            currencyBase = event.target.value
            getCurrency().then((data) => {
                updateLabels(data.rates)
            })
        })
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this))
        this.render()
    }

    render() {
        renderer.render(scene, camera)
        labelRenderer.render(scene, camera)
    }

    onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
}

// Start the app
new App()


// Animations
const timeline = gsap.timeline({ defaults: { duration: 1.44, ease: 'power2.inOut' } })
//timeline.fromTo(camera.position, { x: 0, y: 0, z: 20 }, { x: 0, y: 0, z: 1.8 })
timeline.fromTo("#title", { y: -100, opacity: 0 }, { y: 0, opacity: 1 })
```
