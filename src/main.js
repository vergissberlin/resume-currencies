import * as THREE from 'three'
import {CSS2DRenderer, CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import {GUI} from 'three/addons/libs/lil-gui.module.min.js'
import './style.css'

const apiKey = 'MXOPiCmyl3TzlByq7DuKDkRHXW0bletn4VOxFibf'
const currencyList = 'AUD,CAD,CHF,CNY,EUR,HKD,JPY,MXN,RUB,USD'
let currencyBase = 'AUD'


// If developement mode, use mock data
if (process.env.NODE_ENV === 'developments')
    apiUrl = `${window.location.href}/fixtures/mock.json`

// Get current values of currency from API
const getCurrency = async () => {
    const apiUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=${currencyList}&base_currency=${currencyBase}`
    // Configure the request for json data
    const request = new Request(apiUrl, {
        method: 'GET',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })

    // Convert the response to json
    const responseJson = await (await fetch(request)).json()

    // Return the data
    return responseJson.data
}

const updateLabels = (data) => {
    data = Object.entries(data)
    data.map((x) => currencyCoordinates.map((y) => {
        if (y.code === x[0]) {
            x.coords = {x: y.x, y: y.y, z: y.z}
            return x
        } else {
        }
    }))

    data = data.filter(x => x.coords !== undefined)
    data.forEach(currency => {
        // Check if label with id  currency[0] exits
        const label = document.getElementById(currency[0])
        if (label) {
            label.innerHTML = `${currency[0]}: ${currency[1].toFixed(2)}`
        } else {
            const currencyDiv = document.createElement('div')
            currencyDiv.className = 'label'
            currencyDiv.id = currency[0]
            currencyDiv.textContent = `${currency[0]} ${currency[1].toFixed(2)}`
            currencyDiv.style.marginTop = '-.1em'
            const currencyLabel = new CSS2DObject(currencyDiv)
            let point = new THREE.Vector3().setFromSphericalCoords(currency.coords.x, currency.coords.y, currency.coords.z)
            currencyLabel.position.set(point.x, point.y, point.z)
            earth.add(currencyLabel)
            currencyLabel.layers.set(0)
        }
    })

    // Reset background color of all labels
    const labels = document.getElementsByClassName('label')
    for (let i = 0; i < labels.length; i++) {
        labels[i].style.backgroundColor = '#747bffaa'
    }
    // Change background color from current base currency
    document.getElementById(currencyBase).style.backgroundColor = 'rgba(255, 144, 140, 0.5)'
}

// Texture loader
const textureLoader = new THREE.TextureLoader()

// Scene setup
const scene = new THREE.Scene()

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 6
camera.layers.enableAll()
camera.layers.toggle(1)

// Spot light setup
const spotLight = new THREE.PointLight(0xffffff, 1.2, 100)
spotLight.position.set(12, 12, 12)
scene.add(spotLight)

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, .3)
scene.add(ambientLight)

// Earth setup
const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
const earthTexture = textureLoader.load('images/earth-day.jpg')
earthTexture.minFilter = THREE.NearestFilter
earthTexture.magFilter = THREE.NearestFilter
earthTexture.format = THREE.RGBAFormat

const earthMaterial = new THREE.MeshPhongMaterial({
    specular: 0x333333,
    shininess: 15,
    map: earthTexture,
    specularMap: textureLoader.load('images/earth-specular.jpg'),
    normalMap: textureLoader.load('images/earth-normal.png'),
    normalScale: new THREE.Vector2(2.85, 2.85),
    bumpMap: textureLoader.load('images/earth-bump.jpg'),
    bumpScale: 1,
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
earth.receiveShadow = true
scene.add(earth)

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
document.body.appendChild(labelRenderer.domElement)

// x,y,z coordinates of the currencies on the earth as array
const currencyCoordinates = [
    {code: 'AUD', x: 1, y: 2, z: 4},
    {code: 'CAD', x: 1, y: .75, z: -.2},
    {code: 'CHF', x: 1, y: .73, z: 1.725},
    {code: 'CNY', x: 1, y: 1.1, z: 3.5},
    {code: 'EUR', x: 1, y: .79, z: 1.62},
    {code: 'HKD', x: 1, y: 1.182, z: 3.58},
    {code: 'JPY', x: 1, y: .97, z: 3.9},
    {code: 'MXN', x: 1, y: 1.17, z: -.2},
    {code: 'RUB', x: 1, y: .58, z: 2.7},
    {code: 'USD', x: 1, y: 1, z: -.3},
]

// Add helper to show the x,y,z coordinates of the currencies
const helper = new THREE.AxesHelper(1)
helper.position.set(0, 0, 0)
earth.add(helper)

// Get the currency data
getCurrency().then(data => updateLabels(data))

// Add clouds to earth
const cloudTexture = new THREE.TextureLoader().load('images/earth-clouds.jpg')
const cloudMaterial = new THREE.MeshStandardMaterial({map: cloudTexture, transparent: true, opacity: 0.5, side: THREE.DoubleSide})
const cloudGeometry = new THREE.SphereGeometry(1.015, 64, 64)
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial)
clouds.castShadow = true
scene.add(clouds)

// Add background image within a sphere skybox
const skyboxGeometry = new THREE.SphereGeometry(12, 100, 100)
const skyboxTexture = new THREE.TextureLoader().load('images/skybox-milkyway.jpg')
const skyboxMaterial = new THREE.MeshBasicMaterial({map: skyboxTexture, side: THREE.BackSide})
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
scene.add(skybox)

// Renderer setup
const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, labelRenderer.domElement)
controls.minDistance = 1.5
controls.maxDistance = 15
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = .5

// Hide seletion when orbit controls distance is larger than 5
controls.addEventListener('change', () => {
    if (controls.getDistance() > 4) {
        selection.style.opacity = 0
    } else {
        selection.style.opacity = 1
    }
})

// Add selection box
const selection = document.createElement('select')

// Add options to selection box
currencyCoordinates.forEach(currency => {
    const option = document.createElement('option')
    option.value = currency.code
    option.textContent = currency.code
    selection.appendChild(option)
})
selection.className = 'selection'

// On change of selection box, change the currencyBase and update the currency rates
selection.onchange = () => {
    currencyBase = selection.value
    getCurrency().then(data => updateLabels(data))
}


const selectionContainer = new CSS2DObject(selection)
selectionContainer.position.set(0, 0, 0)
earth.add(selectionContainer)

// Render loop
const animate = function () {
    requestAnimationFrame(animate)
    controls.update()

    earth.rotation.x += 0.00005
    earth.rotation.y += 0.0005

    // Clouds rotation is the same as the earth
    clouds.rotation.x = earth.rotation.x
    clouds.rotation.y = earth.rotation.y

    // Skybox rotation is the same as the earth
    skybox.rotation.x = earth.rotation.x
    skybox.rotation.y = earth.rotation.y

    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
}

animate()


// Resize listener with improved performance
let resizeTimer
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        labelRenderer.setSize(window.innerWidth, window.innerHeight)
    }, 250)
})

// Rotate the light arround the earth on mouse move
window.addEventListener('mousemove', (e) => {
    spotLight.position.x = Math.sin(e.clientX / window.innerWidth * 2 * Math.PI) * -3
    spotLight.position.z = Math.cos(e.clientX / window.innerWidth * 2 * Math.PI) * -3
    spotLight.position.y = -(e.clientY / window.innerHeight * 6 - 3)
})

// Add background sound to the scene
const listener = new THREE.AudioListener()
camera.add(listener)
const sound = new THREE.Audio(listener)
const audioLoader = new THREE.AudioLoader()
audioLoader.load('sounds/background-enterprise.mp3', function (buffer) {
    sound.setBuffer(buffer)
    sound.setLoop(true)
    sound.setVolume(0.5)
    sound.play()
})
