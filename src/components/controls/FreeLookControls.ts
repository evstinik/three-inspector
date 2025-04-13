import {
  Camera,
  Vector3,
  Euler,
  MathUtils,
  Quaternion,
  Object3D as ThreeObject3D,
  PerspectiveCamera,
  Scene
} from 'three'

/**
 * Free Look Camera Controls
 * - Hold right mouse button to activate
 * - WASD keys for horizontal movement
 * - Q/E keys for vertical movement
 * - Mouse movement to look around
 * - Shift key to move faster
 */
export class FreeLookControls {
  // Reference to the app's original camera (not modified)
  private appCamera: Camera
  // Our dedicated free look camera
  private freeLookCamera: PerspectiveCamera
  private domElement: HTMLElement
  private scene: Scene | null = null
  private cameraRig: ThreeObject3D

  // Movement state
  private moveForward: boolean = false
  private moveBackward: boolean = false
  private moveLeft: boolean = false
  private moveRight: boolean = false
  private moveUp: boolean = false
  private moveDown: boolean = false
  private boost: boolean = false

  // Mouse state
  private isActive: boolean = false
  private isPointerLocked: boolean = false
  private mouseX: number = 0
  private mouseY: number = 0

  // Camera look
  private pitchObject = new ThreeObject3D()
  private yawObject = new ThreeObject3D()

  // Movement settings
  private readonly movementSpeed: number = 5.0
  private readonly boostFactor: number = 2.0
  private readonly lookSensitivity: number = 0.002

  // Event handlers
  private pointerMoveHandler: (event: MouseEvent) => void
  private pointerDownHandler: (event: MouseEvent) => void
  private pointerUpHandler: (event: MouseEvent) => void
  private keyDownHandler: (event: KeyboardEvent) => void
  private keyUpHandler: (event: KeyboardEvent) => void

  constructor(appCamera: Camera, domElement: HTMLElement, scene?: Scene) {
    this.appCamera = appCamera
    this.domElement = domElement
    this.scene = scene || null

    // Create our own camera that will be used for free look mode
    // Copy properties from the app camera if it's a PerspectiveCamera
    if (appCamera instanceof PerspectiveCamera) {
      this.freeLookCamera = new PerspectiveCamera(
        appCamera.fov,
        appCamera.aspect,
        appCamera.near,
        appCamera.far
      )
    } else {
      // Default values if app camera is not a PerspectiveCamera
      this.freeLookCamera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
    }

    // Create a camera rig for movement and rotation that we'll add to the scene when active
    this.cameraRig = new ThreeObject3D()
    this.cameraRig.name = 'FreeLookCameraRig'

    // Setup camera rig - a pitch object (for looking up/down)
    // nested within a yaw object (for looking left/right)
    this.yawObject.add(this.pitchObject)
    this.pitchObject.add(this.freeLookCamera)
    this.cameraRig.add(this.yawObject)

    // Initialize with the app camera's position and orientation
    this.syncWithAppCamera()

    // Initialize event handlers with bound 'this' context
    this.pointerMoveHandler = this.onPointerMove.bind(this)
    this.pointerDownHandler = this.onPointerDown.bind(this)
    this.pointerUpHandler = this.onPointerUp.bind(this)
    this.keyDownHandler = this.onKeyDown.bind(this)
    this.keyUpHandler = this.onKeyUp.bind(this)
  }

  /**
   * Synchronize the free look camera with the app camera's position and orientation
   */
  public syncWithAppCamera(): void {
    // Get app camera world position
    const appPosition = new Vector3()
    this.appCamera.getWorldPosition(appPosition)

    // Get app camera world quaternion
    const appQuaternion = new Quaternion()
    this.appCamera.getWorldQuaternion(appQuaternion)

    // Position the yaw object at the app camera position
    this.yawObject.position.copy(appPosition)

    // Extract euler angles from the quaternion
    const euler = new Euler().setFromQuaternion(appQuaternion, 'YXZ')

    // Set the pitch and yaw based on the app camera orientation
    this.yawObject.rotation.y = euler.y
    this.pitchObject.rotation.x = euler.x

    // Reset the free look camera's local position
    this.freeLookCamera.position.set(0, 0, 0)
    this.freeLookCamera.rotation.set(0, 0, 0)
  }

  /**
   * Add camera rig to the scene
   */
  private addCameraRigToScene(): void {
    if (this.scene && !this.scene.getObjectByName('FreeLookCameraRig')) {
      console.log('Adding free look camera rig to scene')
      this.scene.add(this.cameraRig)
    }
  }

  /**
   * Remove camera rig from the scene
   */
  private removeCameraRigFromScene(): void {
    if (this.scene) {
      console.log('Removing free look camera rig from scene')
      this.scene.remove(this.cameraRig)
    }
  }

  public connect(): void {
    this.domElement.addEventListener('mousemove', this.pointerMoveHandler)
    this.domElement.addEventListener('mousedown', this.pointerDownHandler)
    document.addEventListener('mouseup', this.pointerUpHandler)
    document.addEventListener('keydown', this.keyDownHandler)
    document.addEventListener('keyup', this.keyUpHandler)

    // Set pointer lock on the canvas
    this.domElement.requestPointerLock =
      this.domElement.requestPointerLock ||
      (this.domElement as any).mozRequestPointerLock ||
      (this.domElement as any).webkitRequestPointerLock

    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this), false)
    document.addEventListener('mozpointerlockchange', this.onPointerLockChange.bind(this), false)
    document.addEventListener('webkitpointerlockchange', this.onPointerLockChange.bind(this), false)

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  public disconnect(): void {
    // Remove camera rig from scene
    this.removeCameraRigFromScene()

    // Reset all movement flags
    this.resetMovementFlags()

    this.domElement.removeEventListener('mousemove', this.pointerMoveHandler)
    this.domElement.removeEventListener('mousedown', this.pointerDownHandler)
    document.removeEventListener('mouseup', this.pointerUpHandler)
    document.removeEventListener('keydown', this.keyDownHandler)
    document.removeEventListener('keyup', this.keyUpHandler)

    document.removeEventListener('pointerlockchange', this.onPointerLockChange.bind(this), false)
    document.removeEventListener('mozpointerlockchange', this.onPointerLockChange.bind(this), false)
    document.removeEventListener(
      'webkitpointerlockchange',
      this.onPointerLockChange.bind(this),
      false
    )

    window.removeEventListener('resize', this.onWindowResize.bind(this))

    // Exit pointer lock if active
    this.exitPointerLock()
  }

  private onWindowResize(): void {
    if (this.appCamera instanceof PerspectiveCamera && this.freeLookCamera) {
      // Keep the free look camera's aspect ratio in sync with the app camera
      this.freeLookCamera.aspect = this.appCamera.aspect
      this.freeLookCamera.updateProjectionMatrix()
    }
  }

  public update(deltaTime: number): void {
    if (!this.isActive) return

    const actualSpeed = this.boost
      ? this.movementSpeed * this.boostFactor * deltaTime
      : this.movementSpeed * deltaTime

    // We need to calculate the forward direction based on the combined rotations
    // of both the yaw and pitch objects to get the true camera direction
    const forward = new Vector3(0, 0, -1)

    // First apply pitch rotation
    const pitchQuat = new Quaternion().setFromEuler(new Euler(this.pitchObject.rotation.x, 0, 0))
    forward.applyQuaternion(pitchQuat)

    // Then apply yaw rotation
    const yawQuat = new Quaternion().setFromEuler(new Euler(0, this.yawObject.rotation.y, 0))
    forward.applyQuaternion(yawQuat)

    // For left/right movement, we want to move perpendicular to the forward direction,
    // but only in the horizontal plane
    const right = new Vector3(1, 0, 0)
    right.applyQuaternion(yawQuat) // Only apply yaw, not pitch

    // Global up vector for up/down movement
    const up = new Vector3(0, 1, 0)

    // Calculate movement
    const movement = new Vector3(0, 0, 0)

    if (this.moveForward) movement.add(forward)
    if (this.moveBackward) movement.sub(forward)
    if (this.moveRight) movement.add(right)
    if (this.moveLeft) movement.sub(right)
    if (this.moveUp) movement.add(up)
    if (this.moveDown) movement.sub(up)

    // Normalize movement vector to prevent diagonal speed boost
    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(actualSpeed)
      this.yawObject.position.add(movement)
    }
  }

  public focusOnObject(position: Vector3, distance: number = 10): void {
    // Create a direction from camera position to object position
    const direction = new Vector3().subVectors(position, this.yawObject.position).normalize()

    // Set camera position at a distance from object along that direction
    this.yawObject.position.copy(position).sub(direction.multiplyScalar(distance))

    // Point camera at object
    this.lookAt(position)
  }

  public lookAt(position: Vector3): void {
    // Calculate direction from camera to target
    const direction = new Vector3().subVectors(position, this.yawObject.position).normalize()

    // Calculate pitch and yaw from direction vector
    const pitch = -Math.asin(direction.y)
    const yaw = Math.atan2(direction.x, direction.z)

    // Apply rotation to pitch and yaw objects
    this.pitchObject.rotation.x = pitch
    this.yawObject.rotation.y = yaw
  }

  private onPointerLockChange(): void {
    const lockElement =
      document.pointerLockElement ||
      (document as any).mozPointerLockElement ||
      (document as any).webkitPointerLockElement

    this.isPointerLocked = lockElement === this.domElement

    // If we lost pointer lock but control is still active, deactivate
    if (!this.isPointerLocked && this.isActive) {
      this.isActive = false

      // Reset all movement flags
      this.resetMovementFlags()

      // Dispatch custom event for component integration
      const freeLookEvent = new CustomEvent('freelook:activated', { detail: { active: false } })
      this.domElement.dispatchEvent(freeLookEvent)
    }
  }

  private onPointerMove(event: MouseEvent): void {
    if (!this.isActive || !this.isPointerLocked) return

    // Get mouse movement (with pointer lock API)
    const movementX =
      event.movementX || (event as any).mozMovementX || (event as any).webkitMovementX || 0

    const movementY =
      event.movementY || (event as any).mozMovementY || (event as any).webkitMovementY || 0

    // Apply sensitivity
    this.mouseX = movementX * this.lookSensitivity
    this.mouseY = movementY * this.lookSensitivity

    // Update camera rotation
    this.yawObject.rotation.y -= this.mouseX

    // Limit vertical rotation to avoid flipping
    this.pitchObject.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.pitchObject.rotation.x - this.mouseY)
    )
  }

  private onPointerDown(event: MouseEvent): void {
    // Only activate on right mouse button (button 2)
    if (event.button === 2) {
      event.preventDefault()

      // Sync with app camera before activating
      this.syncWithAppCamera()

      // Add camera rig to scene if needed
      this.addCameraRigToScene()

      this.isActive = true

      // Request pointer lock
      this.domElement.requestPointerLock()

      // Dispatch custom event for component integration
      const freeLookEvent = new CustomEvent('freelook:activated', { detail: { active: true } })
      this.domElement.dispatchEvent(freeLookEvent)
    }
  }

  private onPointerUp(event: MouseEvent): void {
    // Only deactivate if it was right mouse button
    if (event.button === 2 && this.isActive) {
      this.isActive = false

      // Reset all movement flags
      this.resetMovementFlags()

      // Exit pointer lock
      this.exitPointerLock()

      // Dispatch custom event for component integration
      const freeLookEvent = new CustomEvent('freelook:activated', { detail: { active: false } })
      this.domElement.dispatchEvent(freeLookEvent)
    }
  }

  private exitPointerLock(): void {
    const document = this.domElement.ownerDocument

    if (document.exitPointerLock) {
      document.exitPointerLock()
    } else if ((document as any).mozExitPointerLock) {
      ;(document as any).mozExitPointerLock()
    } else if ((document as any).webkitExitPointerLock) {
      ;(document as any).webkitExitPointerLock()
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.isActive) return

    switch (event.code) {
      case 'KeyW':
        this.moveForward = true
        break
      case 'KeyS':
        this.moveBackward = true
        break
      case 'KeyA':
        this.moveLeft = true
        break
      case 'KeyD':
        this.moveRight = true
        break
      case 'KeyQ':
        this.moveDown = true
        break
      case 'KeyE':
        this.moveUp = true
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        this.boost = true
        break
      case 'KeyF':
        // F key for focus - we'll handle this in the component
        this.domElement.dispatchEvent(new CustomEvent('freelook:focus'))
        break
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    if (!this.isActive) return

    switch (event.code) {
      case 'KeyW':
        this.moveForward = false
        break
      case 'KeyS':
        this.moveBackward = false
        break
      case 'KeyA':
        this.moveLeft = false
        break
      case 'KeyD':
        this.moveRight = false
        break
      case 'KeyQ':
        this.moveDown = false
        break
      case 'KeyE':
        this.moveUp = false
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        this.boost = false
        break
    }
  }

  public get active(): boolean {
    return this.isActive
  }

  public getPosition(): Vector3 {
    return this.yawObject.position.clone()
  }

  public getDirection(): Vector3 {
    const direction = new Vector3(0, 0, -1)
    return direction.applyQuaternion(this.freeLookCamera.quaternion)
  }

  public getCamera(): PerspectiveCamera {
    return this.freeLookCamera
  }

  public setScene(scene: Scene): void {
    this.scene = scene
  }

  /**
   * Reset all movement flags
   */
  private resetMovementFlags(): void {
    this.moveForward = false
    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false
    this.moveUp = false
    this.moveDown = false
    this.boost = false
  }
}
