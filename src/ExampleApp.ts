/** CSci-4611 Example Code
 * Copyright 2023+ Regents of the University of Minnesota
 * Please do not distribute beyond the CSci-4611 course
 */

import * as gfx from 'gophergfx'

export class ExampleApp extends gfx.GfxApp
{
    private cameraControls: gfx.FirstPersonControls;

    private groundMesh: gfx.Mesh3;
    private dartboardMesh: gfx.Mesh3;
    private bunnyMesh: gfx.Mesh3;

    constructor()
    {
        super();
        this.cameraControls = new gfx.FirstPersonControls(this.camera);
        this.groundMesh = new gfx.Mesh3();
        this.dartboardMesh = new gfx.Mesh3();
        this.bunnyMesh = new gfx.Mesh3();
    }

    createScene(): void 
    {        
        // Set background color
        this.renderer.background = new gfx.Color(0.749, 0.918, 0.988);

        // Create the scene lighting
        const sceneLight = new gfx.PointLight();
        sceneLight.ambientIntensity.set(0.25, 0.25, 0.25);
        sceneLight.diffuseIntensity.set(1, 1, 1);
        sceneLight.specularIntensity.set(1, 1, 1);
        sceneLight.position.set(10, 10, 10);
        this.scene.add(sceneLight);
        
        // Setup camera
        this.camera.setPerspectiveCamera(60, 1920/1080, .1, 750);
        this.camera.position.set(0, 1.5, 2);
        this.cameraControls.mouseButton = 2;
        this.cameraControls.translationSpeed = 2;

        // Create the ground
        const groundMaterial = new gfx.UnlitMaterial();
        groundMaterial.color.set(0, 0.5, 0);
        this.groundMesh = gfx.Geometry3Factory.createBox(500, 10, 500);
        this.groundMesh.position.set(0, -5, 0);
        this.groundMesh.material = groundMaterial;
        this.scene.add(this.groundMesh);

        // Create the dartboard
        this.dartboardMesh = gfx.Geometry3Factory.createBox(1, 1, 0.01);
        const dartBoardMaterial = new gfx.PhongMaterial();
        dartBoardMaterial.texture = new gfx.Texture('./assets/dartboard.jpg')
        this.dartboardMesh.material = dartBoardMaterial;
        this.dartboardMesh.position.set(-0.33, 1.5, -1);
        this.scene.add(this.dartboardMesh);

        // Create the bunny
        this.bunnyMesh = gfx.MeshLoader.loadOBJ('./assets/bunny.obj');
        this.bunnyMesh.position.set(0.33, 1.5, 0.5);
        this.scene.add(this.bunnyMesh);
    }

    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);
    }

    onMouseDown(event: MouseEvent): void 
    {
        if (event.button == 0) {
            const normalizedDeviceCoords = this.getNormalizedDeviceCoordinates(event.x, event.y);
            
            
        }
    }
}
