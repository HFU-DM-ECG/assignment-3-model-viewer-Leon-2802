## Model Viewer 'Toon shader combined with Fresnel effect'

# Explanation
This model viewer showcases a classic toon shader combined with a Fresnel effect. The toon shading works by only illuminating fragments where the normals form an angle lower than 90° to the light direction. I have added a Fresnel effect on top of this, which increases the brightness of the fragments based on the angle between the eyeVector and the normals.

When these effects are combined, you achieve a toon shader with a slight metallic appearance, perfectly suited for a robot model.

Note: Unfortunately, there is an issue where rotating the robot does not update the lighting correctly to reflect that the light is hitting other parts of the robot, compared to after the initialization...

# Sources:
- how to get the direction of lights in a scene: https://www.maya-ndljk.com/blog/threejs-basic-toon-shader
- code for outline-pass: https://github.com/OmarShehata/webgl-outlines/blob/main/threejs/src/CustomOutlinePass.js
- article about how the outline-pass works: https://omar-shehata.medium.com/how-to-render-outlines-in-webgl-8253c14724f9