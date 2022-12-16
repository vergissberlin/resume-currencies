import * as THREE from 'three'
import gsap from 'gsap'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import './style.css'
import { type } from 'os'

type Textures = {
    earth: {
        map: string,
        normal: string,
        specular: string,
        bump: string,
        clouds: string,
    },
    skybox: {
        normal: string,
    },
}

const
    apiKey = 'MXOPiCmyl3TzlByq7DuKDkRHXW0bletn4VOxFibf',
    currencyList = 'AUD,CAD,CHF,CNY,EUR,HKD,JPY,MXN,RUB,USD',
    textureLoader = new THREE.TextureLoader(),
    currencyCoordinates: {
        code: string,
        x: number,
        y: number,
        z: number,
    }[] = [
            { code: 'AUD', x: 1, y: 2, z: 4 },
            { code: 'CAD', x: 1, y: .75, z: -.2 },
            { code: 'CHF', x: 1, y: .73, z: 1.725 },
            { code: 'CNY', x: 1, y: 1.1, z: 3.5 },
            { code: 'EUR', x: 1, y: .79, z: 1.62 },
            { code: 'HKD', x: 1, y: 1.182, z: 3.58 },
            { code: 'JPY', x: 1, y: .97, z: 3.9 },
            { code: 'MXN', x: 1, y: 1.17, z: -.2 },
            { code: 'RUB', x: 1, y: .58, z: 2.7 },
            { code: 'USD', x: 1, y: 1, z: -.3 },
        ]
let
    factor: number = 1

let
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    data: JSON,
    scene: THREE.Scene,
    sound: THREE.Audio,
    spotLight: THREE.SpotLight,
    renderer: THREE.WebGLRenderer,
    resizeTimer: number,
    labelRenderer: CSS2DRenderer

let
    earth: THREE.Mesh,
    clouds: THREE.Mesh,
    form: THREE.Mesh,
    formDiv: HTMLDivElement,
    select: THREE.Mesh,
    skybox: THREE.Mesh

let
    textures: Textures = {
        earth: {
            map: 'images/earth-day-8k.jpg',
            normal: 'images/earth-normal-2k.png',
            specular: 'images/earth-specular-2k.jpg',
            bump: 'images/earth-bump-2k.jpg',
            clouds: 'images/earth-clouds-8k.jpg',
        },
        skybox: {
            normal: 'images/skybox-milkyway-4k.jpg',
        },
    }

// if touch device, use smaller textures
if (window.matchMedia('(pointer: coarse)').matches) {
    textures = {
        earth: {
            map: 'images/earth-day-2k.jpg',
            normal: 'images/earth-normal-2k.png',
            specular: 'images/earth-specular-2k.jpg',
            bump: 'images/earth-bump-2k.jpg',
            clouds: 'images/earth-clouds-2k.jpg',
        },
        skybox: {
            normal: 'images/skybox-milkyway-2k.jpg',
        },
    }
}

let
    currencyBase: String = 'EUR',
    apiUrl: String = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=${currencyList}&base_currency=${currencyBase}`

// If developement mode, use mock data
if (process.env.NODE_ENV === 'development')
    apiUrl = `${window.location.href}/fixtures/mock.json`

/**
 * Get current values of currency from API
 * @returns {Promise<JSON>}
 */
const getCurrency = async (): Promise<JSON> => {
    apiUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=${currencyList}&base_currency=${currencyBase}`
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

/**
 *  Update labels with currency data
 * @param data JSON object with currency data
 */
const updateLabels = (data: [string, any][]): void => {
    data = Object.entries(data)
    data.map((x) => currencyCoordinates.map((y) => {
        if (y.code === x[0]) {
            x.coords = { x: y.x, y: y.y, z: y.z }
            return x
        }
    }))

    data = data.filter(x => x.coords !== undefined)
    data.forEach(currency => {
        // Check if label with id  currency[0] exits
        const label = document.getElementById(currency[0])
        const value: number = currency[1] * factor
        if (label) {
            label.innerHTML = `${currency[0]}: ${value.toFixed(2)}`
        } else {
            const currencyDiv = document.createElement('div')
            currencyDiv.className = 'label'
            currencyDiv.id = currency[0]
            currencyDiv.textContent = `${currency[0]} ${value.toFixed(2)}`
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
    if (document.getElementById(currencyBase))
        document.getElementById(currencyBase).style.backgroundColor = 'rgba(255, 144, 140, 0.5)'
}



/**
 * Init
 * @async
 * @name init
 * @description Initialize the scene, camera, lights, objects and renderer
 * @returns {void}
 */
const init = (): void => {
    // Scene setup
    scene = new THREE.Scene()

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 6
    camera.layers.enableAll()
    camera.layers.toggle(1)

    // Spot light setup
    spotLight = new THREE.PointLight(0xffffff, 1.2, 100)
    spotLight.position.set(12, 12, 12)
    scene.add(spotLight)

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, .3)
    scene.add(ambientLight)

    // Earth setup
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
    const earthTexture = textureLoader.load(textures.earth.map)
    earthTexture.minFilter = THREE.NearestFilter
    earthTexture.magFilter = THREE.NearestFilter
    earthTexture.format = THREE.RGBAFormat

    const earthMaterial = new THREE.MeshPhongMaterial({
        shininess: 15,
        map: textureLoader.load(textures.earth.map),
        specularMap: textureLoader.load(textures.earth.specular),
        specular: 0x333333,
        bumpMap: textureLoader.load(textures.earth.bump),
        bumpScale: 1,
        normalMap: textureLoader.load(textures.earth.normal),
        normalScale: new THREE.Vector2(2.85, 2.85),
    })

    earth = new THREE.Mesh(earthGeometry, earthMaterial)
    earth.receiveShadow = true
    scene.add(earth)

    // Add clouds to earth
    const cloudTexture = new THREE.TextureLoader().load(textures.earth.clouds)
    const cloudMaterial = new THREE.MeshStandardMaterial({ map: cloudTexture, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    const cloudGeometry = new THREE.SphereGeometry(1.015, 64, 64)
    clouds = new THREE.Mesh(cloudGeometry, cloudMaterial)
    clouds.castShadow = true
    scene.add(clouds)

    // Add skybox
    const skyboxGeometry = new THREE.SphereGeometry(12, 100, 100)
    const skyboxTexture = new THREE.TextureLoader().load(textures.skybox.normal)
    const skyboxMaterial = new THREE.MeshBasicMaterial({ map: skyboxTexture, side: THREE.BackSide })
    skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
    scene.add(skybox)

    // Add labels
    labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(window.innerWidth, window.innerHeight)
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.top = '0px'
    document.body.appendChild(labelRenderer.domElement)

    // Renderer setup
    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // Orbit controls
    controls = new OrbitControls(camera, labelRenderer.domElement)
    controls.minDistance = 1.5
    controls.maxDistance = 15
    controls.enableDamping = true
    controls.autoRotate = true
    controls.autoRotateSpeed = .5

    // Add background sound to the scene
    const listener = new THREE.AudioListener()
    camera.add(listener)
    sound = new THREE.Audio(listener)
    const audioLoader = new THREE.AudioLoader()
    audioLoader.load('sounds/background-enterprise.mp3', function (buffer) {
        sound.setBuffer(buffer)
        sound.setLoop(true)
        sound.setVolume(0.5)
        sound.play()
    })

    // Add formular to change base currency
    formDiv = document.createElement('div')
    formDiv.className = 'form'
    form = new CSS2DObject(formDiv)
    form.position.set(0, 0, 0)
    earth.add(form)

    // Add user input to change base currency
    select = document.createElement('select')
    currencyCoordinates.forEach(currency => {
        const option = document.createElement('option')
        option.value = currency.code
        option.textContent = currency.code
        select.appendChild(option)
    })
    select.value = currencyBase
    select.className = 'select'
    formDiv.appendChild(select)

    // Add input field to change base currency factor
    const input = document.createElement('input')
    input.type = 'number'
    input.value = 1
    input.min = 1
    input.max = 10000
    input.step = 1
    input.pattern = '[0-9]*'
    input.className = 'factor'
    input.onchange = () => onFactorChange(input.value)
    formDiv.appendChild(input)

}

/**
 * Animation
 * @returns {void}
 */
const animate = (): void => {
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

/**
 * Add event listeners
 * @returns {void}
 */
const addEventListeners = (): void => {
    controls.addEventListener('change', onControlsChange, false)
    window.addEventListener('resize', onWindowResize, false)
    select.addEventListener('change', onSelectChange, false)
    document.addEventListener('mousemove', onMouseMove, false)
}

/**
 * On mouse move, update the mouse position
 * @returns {void}
 */
const onControlsChange = (): void => {
    // Hide seletion when orbit controls distance is larger than 5
    if (controls.getDistance() > 4) {
        formDiv.style.opacity = '0'
    } else {
        formDiv.style.opacity = '1'
    }
}

/**
 * On window resize, update the camera and renderer
 * @returns {void}
 */
const onWindowResize = (): void => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        labelRenderer.setSize(window.innerWidth, window.innerHeight)
    }, 250)
}

/**
 * On change of select box, change the currencyBase and update the currency rates
 * @returns {void}
 */
const onSelectChange = (): void => {
    currencyBase = select.value
    getCurrency().then(data => updateLabels(data))
    render()
}

const onFactorChange = (value): void => {
    factor = parseFloat(value)
    getCurrency().then(data => updateLabels(data))
    render()
}

/**
 *  On change of select box, change the currencyBase and update the currency rates
 * @param e Event
 * @returns {void}
 */
const onMouseMove = (e: MouseEvent): void => {
    e.preventDefault()
    // Rotate the light arround the earth on mouse move
    spotLight.position.x = Math.sin(e.clientX / window.innerWidth * 2 * Math.PI) * -3
    spotLight.position.z = Math.cos(e.clientX / window.innerWidth * 2 * Math.PI) * -3
    spotLight.position.y = -(e.clientY / window.innerHeight * 6 - 3)
}

/**
 * Render the scene
 * @returns {void}
 */
const render = async (): Promise<void> => {
    // Get data from API
    data = await getCurrency()

    // Update labels
    updateLabels(data)
}

init()
animate()
addEventListeners()
render()

// Animation timeline
const timeline = gsap.timeline({ defaults: { duration: 1.44, ease: 'power2.inOut' } })
timeline.fromTo(camera.position, { x: 0, y: 0, z: 20 }, { x: 0, y: 0, z: 1.8 })
timeline.fromTo("#title", { y: -100, opacity: 0 }, { y: 0, opacity: 1 })
