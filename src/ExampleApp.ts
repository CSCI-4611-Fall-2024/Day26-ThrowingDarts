/** CSci-4611 Example Code
 * Copyright 2023+ Regents of the University of Minnesota
 * Please do not distribute beyond the CSci-4611 course
 */

/* Lecture 25
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'


export class ExampleApp extends gfx.GfxApp
{
    private cameraControls: gfx.FirstPersonControls;

    private pickMesh: gfx.Mesh3;
    private dartboardMesh: gfx.Mesh3;
    private bunnyMesh: gfx.Mesh3;

    private boundsMesh: gfx.Mesh3;
    private boundsMaterial: gfx.BoundingVolumeMaterial;

    private pickRayMarker: gfx.Mesh3;

    public boundingVolumeMode: string;
    public raycastMode: string;
    public model: string;

    constructor()
    {
        super();

        this.cameraControls = new gfx.FirstPersonControls(this.camera); 
        
        // dartboard
        this.dartboardMesh = gfx.Geometry3Factory.createBox(1, 1, 0.1);
        const dartBoardMaterial = new gfx.PhongMaterial();
        dartBoardMaterial.texture = new gfx.Texture('./assets/dartboard.jpg')
        this.dartboardMesh.material = dartBoardMaterial;
        this.dartboardMesh.position.set(0, 1.5, 0);
        this.pickMesh = this.dartboardMesh;

        // bunny
        this.bunnyMesh = gfx.MeshLoader.loadOBJ('./assets/bunny.obj');
        this.bunnyMesh.position.set(0, 1.5, 0);
        this.bunnyMesh.visible = false;

        this.boundsMesh = this.bunnyMesh.createInstance(true);
        this.boundsMaterial = new gfx.BoundingVolumeMaterial();

        this.pickRayMarker = gfx.Geometry3Factory.createSphere(0.04, 2);

        this.boundingVolumeMode = 'None';
        this.raycastMode = 'Mesh';
        this.model = 'Dartboard';
    }

    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 1920/1080, .1, 750);
        this.camera.position.set(0, 1.5, 2);

        // Configure camera controls
        this.cameraControls.mouseButton = 2;
        this.cameraControls.translationSpeed = 2;

        // Create the scene lighting
        const sceneLight = new gfx.PointLight();
        sceneLight.ambientIntensity.set(0.25, 0.25, 0.25);
        sceneLight.diffuseIntensity.set(1, 1, 1);
        sceneLight.specularIntensity.set(1, 1, 1);
        sceneLight.position.set(10, 10, 10);
        this.scene.add(sceneLight);

        // Create the skybox material
        const skyboxMaterial = new gfx.UnlitMaterial();
        skyboxMaterial.color.set(0.749, 0.918, 0.988);
        skyboxMaterial.side = gfx.Side.BACK;

        // Add the skybox to the scene
        const skybox = gfx.Geometry3Factory.createBox(500, 500, 500);
        skybox.material = skyboxMaterial;
        this.scene.add(skybox);

        // Create the ground material
        const groundMaterial = new gfx.UnlitMaterial();
        groundMaterial.color.set(0, 0.5, 0);

        // Add the ground mesh to the scene
        const ground = gfx.Geometry3Factory.createBox(500, 10, 500);
        ground.position.set(0, -5, 0);
        ground.material = groundMaterial;
        this.scene.add(ground);

        this.scene.add(this.dartboardMesh);
        this.scene.add(this.bunnyMesh);

        this.boundsMesh.material = this.boundsMaterial;
        this.boundsMesh.visible = false;
        this.scene.add(this.boundsMesh);

        this.pickRayMarker.material = new gfx.PhongMaterial();
        this.pickRayMarker.material.setColor(new gfx.Color(0, 1, 1));
        this.pickRayMarker.visible = false;
        this.scene.add(this.pickRayMarker);

        this.createGUI();
    }

    createGUI(): void
    {
        // Create the GUI
        const gui = new GUI();
        gui.width = 260;

        const sceneController = gui.add(this, 'model', [
            'Dartboard',
            'Bunny'
        ]);
        sceneController.name('Scene');
        sceneController.onChange(()=>{
            if(this.model == 'Dartboard')
            {
                this.dartboardMesh.visible = true;
                this.bunnyMesh.visible = false;
                this.pickMesh = this.dartboardMesh;
            }
            else 
            {
                this.bunnyMesh.visible = true;
                this.dartboardMesh.visible = false;
                this.pickMesh = this.bunnyMesh;
            }
        });

        const raycastController = gui.add(this, 'raycastMode', [
            'Box',
            'Sphere',
            'Mesh'
        ]);
        raycastController.name('Raycast Mode');


        const boundingVolumeController = gui.add(this, 'boundingVolumeMode', [
            'None',
            'Box',
            'Sphere'
        ]);
        boundingVolumeController.name('Bunny Bounds');
        boundingVolumeController.onChange(()=>{
            if(this.boundingVolumeMode == 'Box')
            {
                this.boundsMaterial.mode = gfx.BoundingVolumeMode.ORIENTED_BOUNDING_BOX;
                this.boundsMesh.visible = true;
            }
            else if(this.boundingVolumeMode == 'Sphere')
            {
                this.boundsMaterial.mode = gfx.BoundingVolumeMode.BOUNDING_SPHERE;
                this.boundsMesh.visible = true;
            }
            else
            {
                this.boundsMesh.visible = false;
            }
        });
    }

    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);
    }

    onMouseDown(event: MouseEvent): void 
    {
        // Exit the event handler if we did not click the left mouse button
        if(event.button != 0)
            return;

        const normalizedDeviceCoords = this.getNormalizedDeviceCoordinates(event.x, event.y);
        
        const ray = new gfx.Ray3();
        ray.setPickRay(normalizedDeviceCoords, this.camera);

        let intersection: gfx.Vector3 | null = null;

        if(this.raycastMode == 'Box')
            intersection = ray.intersectsOrientedBoundingBox(this.pickMesh);
        else if(this.raycastMode == 'Sphere')
            intersection = ray.intersectsOrientedBoundingSphere(this.pickMesh);
        else
            intersection = ray.intersectsMesh3(this.pickMesh);

        if(intersection)
        {            
            const dart = gfx.Geometry3Factory.createCone(0.025, 0.3, 20);
            dart.material.setColor(gfx.Color.YELLOW);
            const M = gfx.Matrix4.makeIdentity();
            M.multiply(gfx.Matrix4.makeTranslation(intersection));
            M.multiply(gfx.Matrix4.makeRotationX(-Math.PI/2));
            M.multiply(gfx.Matrix4.makeTranslation(new gfx.Vector3(0, -0.15, 0)));
            dart.setLocalToParentMatrix(M, false);
            this.scene.add(dart);
            return;
        }

        const groundPlane = new gfx.Plane3(gfx.Vector3.ZERO, gfx.Vector3.UP);
        const groundIntersection = ray.intersectsPlane(groundPlane);
        if(groundIntersection)
        {
            this.pickRayMarker.visible = true;
            this.pickRayMarker.position.copy(groundIntersection);
            return;
        }

        this.pickRayMarker.visible = false;
    }
}
