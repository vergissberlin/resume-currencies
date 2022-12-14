import * as THREE from 'three'
import {CSS2DRenderer, CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js'
import {GUI} from 'three/addons/libs/lil-gui.module.min.js'
import './style.css'


// Texture loader
const textureLoader = new THREE.TextureLoader()

// Scene setup
const scene = new THREE.Scene()

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 6
camera.layers.enableAll()
camera.layers.toggle(1)



// Light setup
const light = new THREE.PointLight(0xffffff, 1.2, 100)
light.position.set(3, 3, 3)
scene.add(light)

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, .3)
scene.add(ambientLight)


// Earth setup
const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
const earthMaterial = new THREE.MeshPhongMaterial({
    specular: 0x333333,
    shininess: 15,
    map: textureLoader.load('earth-day.jpg'),
    specularMap: textureLoader.load('earth-specular.jpg'),
    normalMap: textureLoader.load('earth-normal.png'),
    normalScale: new THREE.Vector2(2.85, 2.85),
    bumpMap: textureLoader.load('earth-bump.jpg'),
    bumpScale: 0.01,
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)

// Roughness map
earth.receiveShadow = true
scene.add(earth)


// Add clouds to earth
const cloudTexture = new THREE.TextureLoader().load('earth-clouds.jpg')
const cloudMaterial = new THREE.MeshStandardMaterial({map: cloudTexture, transparent: true, opacity: 0.5, side: THREE.DoubleSide})
const cloudGeometry = new THREE.SphereGeometry(1.015, 64, 64)
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial)
clouds.castShadow = true
scene.add(clouds)


// Add background image within a sphere skybox
const skyboxGeometry = new THREE.SphereGeometry(12, 100, 100)
const skyboxTexture = new THREE.TextureLoader().load('stars-milkyway.jpg')
const skyboxMaterial = new THREE.MeshBasicMaterial({map: skyboxTexture, side: THREE.BackSide})
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
scene.add(skybox)

// Renderer setup
const canvas = document.querySelector('#space')
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)


// Render loop
const animate = function () {
    requestAnimationFrame(animate)

    earth.rotation.x += 0.0005
    earth.rotation.y += 0.001

    // Clouds rotation is the same as the earth
    clouds.rotation.x = earth.rotation.x
    clouds.rotation.y = earth.rotation.y

    // Skybox rotation is the same as the earth
    skybox.rotation.x = earth.rotation.x
    skybox.rotation.y = earth.rotation.y

    renderer.render(scene, camera)
}

animate()


// Change rotation of earth and clouds on mouse drag
let isDragging = false
let lastMousePosition = {x: 0, y: 0}

let moveEvent = (e) => {
    if (isDragging) {
        const deltaMove = {
            x: e.offsetX - lastMousePosition.x,
            y: e.offsetY - lastMousePosition.y
        }

        earth.rotation.y += deltaMove.x * 0.001
        earth.rotation.x += deltaMove.y * 0.001

        /// Clouds rotation is the same as the earth
        clouds.rotation.x = earth.rotation.x
        clouds.rotation.y = earth.rotation.y

    }

    lastMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    }
}

window.addEventListener('mousedown', () => {
    isDragging = true
})
window.addEventListener('mouseup', () => {
    isDragging = false
})
window.addEventListener('touchstart', () => {
    isDragging = true
})
window.addEventListener('touchend', () => {
    isDragging = false
})

window.addEventListener('mousemove', moveEvent)
window.addEventListener('touchmove', moveEvent)

// Zoom in/out on mouse wheel
window.addEventListener('wheel', (e) => {
    // max zoom in
    if (camera.position.z < 1.15) {
        camera.position.z = 1.15
        return
    }
    // max zoom out
    if (camera.position.z > 12) {
        camera.position.z = 12
        return
    }
    camera.position.z += e.deltaY * 0.01
})


// Resize listener with improved performance
let resizeTimer
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }, 250)
})

// Rotate the light arround the earth on mouse move
window.addEventListener('mousemove', (e) => {
    light.position.x = Math.sin(e.clientX / window.innerWidth * 2 * Math.PI) * -3
    light.position.z = Math.cos(e.clientX / window.innerWidth * 2 * Math.PI) * -3
    light.position.y = -(e.clientY / window.innerHeight * 6 - 3)
})



// Change background color to a gradient
const gradient = new THREE.Color(0x000000)
gradient.setHSL(0.02, 0.08, 0.08)
renderer.setClearColor(gradient, 1)


/*
// Add a background image
const loader = new THREE.TextureLoader()
const texture = loader.load('stars-dark.jpg')
texture.minFilter = THREE.NearestFilter
texture.magFilter = THREE.NearestFilter
texture.format = THREE.RGBFormat

// background image crop
texture.wrapS = THREE.RepeatWrapping
texture.wrapT = THREE.RepeatWrapping
texture.repeat.set(1, 1)
scene.background = texture
*/

// Get current values of currency from API
const apiKey = 'MXOPiCmyl3TzlByq7DuKDkRHXW0bletn4VOxFibf'
const getCurrency = async () => {
    // Configure the request for json data
    const request = new Request(`https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`, {
        method: 'GET',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
    // Convert the response to json
    const responseJson = await (await fetch(request)).json()
    console.log(responseJson)

    // Return the data
    return responseJson.data
}
// console.log(getCurrency())

/*
// Place the currency values on the earth
const placeCurrency = async () => {
    // Get the currency data
    const currency = await getCurrency()

    // Loop through the currency data
    for (const [key, value] of Object.entries(currency)) {
        // Create a sphere for the currency
        const currencyGeometry = new THREE.SphereGeometry(0.1, 32, 32)
        const currencyMaterial = new THREE.MeshStandardMaterial({color: 0xffffff})
        const currencySphere = new THREE.Mesh(currencyGeometry, currencyMaterial)
        currencySphere.castShadow = true

        // Set the position of the currency
        currencySphere.position.x = Math.sin(Math.random() * 2 * Math.PI) * 3
        currencySphere.position.y = Math.random() * 6 - 3
        currencySphere.position.z = Math.cos(Math.random() * 2 * Math.PI) * 3

        // Add the currency to the scene
        scene.add(currencySphere)
    }
}
*/


// Print out the currency values on the earth with CSS2DRenderer
const placeCurrency = async () => {
    // Get the currency data
    const currency = await getCurrency()

    // Loop through the currency data
    for (const [key, value] of Object.entries(currency)) {

        // Create a div for the currency
        const currencyDiv = document.createElement('div')
        currencyDiv.className = 'currency'
        currencyDiv.textContent = `${key} ${value}`
        console.log(`${key} ${value}`)

        // Create a CSS2DObject for the currency
        const currencyObject = new CSS2DObject(currencyDiv)
        currencyObject.position.x = Math.sin(Math.random() * 2 * Math.PI) * 3
        currencyObject.position.y = Math.random() * 6
        currencyObject.position.z = Math.cos(Math.random() * 2 * Math.PI) * 33

        // Add the currency to the scene
        scene.add(currencyObject)
    }
}

placeCurrency()

// Add a CSS2DRenderer to the scene
const css2dRenderer = new CSS2DRenderer()
css2dRenderer.setSize(window.innerWidth, window.innerHeight)
css2dRenderer.domElement.style.position = 'absolute'
css2dRenderer.domElement.style.top = 0
document.body.appendChild(css2dRenderer.domElement)

// Render the scene
const render = () => {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
}





// Start the render loop
render()

