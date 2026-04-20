/*
 * HexGL — custom track "Hexastar"
 * Procedurally generated 6-branch star circuit.
 * Drop-in track, compatible with the existing HexGL loader / ShipControls.
 */

var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};
bkcore.hexgl.tracks = bkcore.hexgl.tracks || {};

bkcore.hexgl.tracks.Hexastar = {

	lib: null,
	materials: {},

	name: "Hexastar",

	checkpoints: {
		list: [0, 40, 80, 120, 160, 200],
		start: 0,
		last: 200
	},

	// Spawn at outer vertex 0 (angle 0°), facing toward inner vertex 0 (angle 30°).
	// Values produced by tools/gen-hexastar.js.
	spawn: { x: 2500.0, y: 10, z: 0.0 },
	spawnRotation: { x: 0, y: -1.8266, z: 0 },

	analyser: null,
	pixelRatio: 2048.0 / 6000.0,

	// Star geometry constants (must match tools/gen-hexastar.js).
	_R_OUT: 2500,
	_R_IN: 900,
	_HALF_W: 90,

	load: function(opts, quality)
	{
		this.lib = new bkcore.threejs.Loader(opts);

		var prefix = (quality < 2) ? "textures" : "textures.full";

		this.lib.load({
			textures: {
				'hex'                   : prefix + "/hud/hex.jpg",
				'spark'                 : prefix + "/particles/spark.png",
				'cloud'                 : prefix + "/particles/cloud.png",
				'ship.feisar.diffuse'   : prefix + "/ships/feisar/diffuse.jpg",
				'booster.diffuse'       : prefix + "/ships/feisar/booster/booster.png",
				'booster.sprite'        : prefix + "/ships/feisar/booster/boostersprite.jpg",
				'track.hexastar.diffuse': prefix + "/tracks/cityscape/diffuse.jpg"
			},
			texturesCube: {
				'skybox.dawnclouds'     : prefix + "/skybox/dawnclouds/%1.jpg"
			},
			geometries: {
				'booster'               : "geometries/booster/booster.js",
				'ship.feisar'           : "geometries/ships/feisar/feisar.js"
			},
			analysers: {
				'track.hexastar.collision' : "textures/tracks/hexastar/collision.png",
				'track.hexastar.height'    : "textures/tracks/hexastar/height.png"
			},
			images: {
				'hud.bg'                : prefix + "/hud/hud-bg.png",
				'hud.speed'             : prefix + "/hud/hud-fg-speed.png",
				'hud.shield'            : prefix + "/hud/hud-fg-shield.png"
			},
			sounds: {
				bg:        { src: 'audio/bg.ogg',        loop: true,  usePanner: false },
				crash:     { src: 'audio/crash.ogg',     loop: false, usePanner: true  },
				destroyed: { src: 'audio/destroyed.ogg', loop: false, usePanner: false },
				boost:     { src: 'audio/boost.ogg',     loop: false, usePanner: true  },
				wind:      { src: 'audio/wind.ogg',      loop: true,  usePanner: true  }
			}
		});
	},

	buildMaterials: function(quality)
	{
		// Track ribbon — vivid cyan emissive look so the player sees instantly
		// this is not Cityscape.
		// Main ribbon: reuse Cityscape's track diffuse, tiled along length.
		var trackTex = this.lib.get("textures", "track.hexastar.diffuse");
		if (trackTex) {
			trackTex.wrapS = THREE.RepeatWrapping;
			trackTex.wrapT = THREE.RepeatWrapping;
			trackTex.needsUpdate = true;
		}
		this.materials.track = new THREE.MeshBasicMaterial({
			map: trackTex,
			color: 0xbfefff,           // cool cyan tint on top of the grey track texture
			side: THREE.DoubleSide
		});

		// Glowing magenta edge strips (emissive-like via additive blending).
		this.materials.trackEdge = new THREE.MeshBasicMaterial({
			color: 0xff1e8c,
			blending: THREE.AdditiveBlending,
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide
		});

		// Glowing cyan under-glow just beneath the ribbon for depth.
		this.materials.trackGlow = new THREE.MeshBasicMaterial({
			color: 0x00e5ff,
			blending: THREE.AdditiveBlending,
			transparent: true,
			opacity: 0.35,
			depthWrite: false,
			side: THREE.DoubleSide
		});

		this.materials.ship = new THREE.MeshBasicMaterial({
			map: this.lib.get("textures", "ship.feisar.diffuse"),
			ambient: 0xaaaaaa
		});

		this.materials.booster = new THREE.MeshBasicMaterial({
			map: this.lib.get("textures", "booster.diffuse"),
			transparent: true
		});
	},

	_buildStarVertices: function()
	{
		var verts = [];
		for (var i = 0; i < 12; i++) {
			var a = (i * Math.PI) / 6;
			var r = (i % 2 === 0) ? this._R_OUT : this._R_IN;
			verts.push({ x: r * Math.cos(a), z: r * Math.sin(a) });
		}
		return verts;
	},

	// Build a flat ribbon between inner offset -halfW1..+halfW1 and +halfW2..+halfW3
	// (so we can carve out main body vs edge strips on the same star spline).
	// offsetIn / offsetOut are the signed perpendicular offsets from the centerline
	// that define the strip's inner and outer sides.
	// yOffset lifts the strip vertically to avoid z-fighting.
	// uRepeat controls how many texture tiles fit along the entire segment.
	_buildRibbonStrip: function(offsetIn, offsetOut, yOffset, uRepeat)
	{
		var verts = this._buildStarVertices();
		var geo = new THREE.Geometry();

		for (var i = 0; i < 12; i++) {
			var A = verts[i];
			var B = verts[(i + 1) % 12];
			var dx = B.x - A.x, dz = B.z - A.z;
			var len = Math.sqrt(dx * dx + dz * dz);
			var ux = dx / len, uz = dz / len;
			var px = -uz, pz = ux; // perpendicular in XZ

			var i0 = geo.vertices.length;
			// Four corners of the strip (inner-side and outer-side at A, then at B).
			geo.vertices.push(new THREE.Vector3(A.x + px * offsetIn,  yOffset, A.z + pz * offsetIn));
			geo.vertices.push(new THREE.Vector3(A.x + px * offsetOut, yOffset, A.z + pz * offsetOut));
			geo.vertices.push(new THREE.Vector3(B.x + px * offsetOut, yOffset, B.z + pz * offsetOut));
			geo.vertices.push(new THREE.Vector3(B.x + px * offsetIn,  yOffset, B.z + pz * offsetIn));

			// Wind faces CCW as seen from above (+Y).
			// Orientation of winding depends on whether offsetIn > offsetOut, so we
			// emit both triangles with the same winding then rely on DoubleSide in
			// the material (set at buildMaterials).
			geo.faces.push(new THREE.Face3(i0, i0 + 1, i0 + 2));
			geo.faces.push(new THREE.Face3(i0, i0 + 2, i0 + 3));

			// UVs: v along length (tiled), u across width (0..1).
			var uA = i * uRepeat;
			var uB = (i + 1) * uRepeat;
			geo.faceVertexUvs[0].push([
				new THREE.UV(0, uA), new THREE.UV(1, uA), new THREE.UV(1, uB)
			]);
			geo.faceVertexUvs[0].push([
				new THREE.UV(0, uA), new THREE.UV(1, uB), new THREE.UV(0, uB)
			]);
		}

		geo.computeFaceNormals();
		geo.computeVertexNormals();
		return geo;
	},

	_buildTrackGeometries: function()
	{
		var HW = this._HALF_W;          // 90
		var EDGE_W = 8;                 // glowing edge strip width (world units)
		var GLOW_OVER = 40;             // under-glow extends past the ribbon
		return {
			// Main body — inset by EDGE_W so the edges sit on top cleanly.
			body:       this._buildRibbonStrip(-(HW - EDGE_W),  (HW - EDGE_W), 0.0, 4),
			// Two magenta edge strips.
			edgeLeft:   this._buildRibbonStrip( (HW - EDGE_W),  HW,             0.15, 1),
			edgeRight:  this._buildRibbonStrip(-(HW - EDGE_W), -HW,             0.15, 1),
			// Wider additive under-glow sitting just below, for a neon halo.
			glow:       this._buildRibbonStrip(-(HW + GLOW_OVER), (HW + GLOW_OVER), -0.3, 1)
		};
	},

	buildScenes: function(ctx, quality)
	{
		// Collision analyser drives both ShipControls and Gameplay.checkPoint.
		this.analyser = this.lib.get("analysers", "track.hexastar.collision");

		// ===== SKYBOX =====
		var sceneCube = new THREE.Scene();
		var cameraCube = new THREE.PerspectiveCamera(70, ctx.width / ctx.height, 1, 6000);
		sceneCube.add(cameraCube);

		var skyshader = THREE.ShaderUtils.lib["cube"];
		skyshader.uniforms["tCube"].texture = this.lib.get("texturesCube", "skybox.dawnclouds");
		var skymaterial = new THREE.ShaderMaterial({
			fragmentShader: skyshader.fragmentShader,
			vertexShader: skyshader.vertexShader,
			uniforms: skyshader.uniforms,
			depthWrite: false
		});
		var skymesh = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), skymaterial);
		skymesh.flipSided = true;
		sceneCube.add(skymesh);
		ctx.manager.add("sky", sceneCube, cameraCube);

		// ===== MAIN SCENE =====
		var camera = new THREE.PerspectiveCamera(70, ctx.width / ctx.height, 1, 60000);
		var scene = new THREE.Scene();
		scene.add(camera);
		scene.add(new THREE.AmbientLight(0xbbbbbb));

		var sun = new THREE.DirectionalLight(0xffffff, 1.5, 30000);
		sun.position.set(-4000, 1200, 1800);
		sun.lookAt(new THREE.Vector3());
		if (quality > 2) {
			sun.castShadow = true;
			sun.shadowCameraNear = 50;
			sun.shadowCameraFar = camera.far * 2;
			sun.shadowCameraRight  =  3000;
			sun.shadowCameraLeft   = -3000;
			sun.shadowCameraTop    =  3000;
			sun.shadowCameraBottom = -3000;
			sun.shadowBias = 0.0001;
			sun.shadowDarkness = 0.7;
			sun.shadowMapWidth = 2048;
			sun.shadowMapHeight = 2048;
		}
		scene.add(sun);

		// ===== SHIP =====
		var ship = ctx.createMesh(scene, this.lib.get("geometries", "ship.feisar"),
			this.spawn.x, this.spawn.y, this.spawn.z, this.materials.ship);

		var booster = ctx.createMesh(ship, this.lib.get("geometries", "booster"),
			0, 0.665, -3.8, this.materials.booster);
		booster.depthWrite = false;

		var boosterSprite = new THREE.Sprite({
			map: this.lib.get("textures", "booster.sprite"),
			blending: THREE.AdditiveBlending,
			useScreenCoordinates: false,
			color: 0xffffff
		});
		boosterSprite.scale.set(0.02, 0.02, 0.02);
		boosterSprite.mergeWith3D = false;
		booster.add(boosterSprite);

		var boosterLight = new THREE.PointLight(0x00a2ff, 4.0, 60);
		boosterLight.position.set(0, 0.665, -4);
		if (quality > 0) ship.add(boosterLight);

		// ===== SHIP CONTROLS =====
		var shipControls = new bkcore.hexgl.ShipControls(ctx);
		shipControls.collisionMap = this.lib.get("analysers", "track.hexastar.collision");
		shipControls.collisionPixelRatio = this.pixelRatio;
		shipControls.collisionDetection = true;
		shipControls.heightMap = this.lib.get("analysers", "track.hexastar.height");
		shipControls.heightPixelRatio = this.pixelRatio;
		shipControls.heightBias = 4.0;
		shipControls.heightScale = 10.0;
		shipControls.control(ship);
		ctx.components.shipControls = shipControls;
		ctx.tweakShipControls();

		// ===== SHIP EFFECTS =====
		ctx.components.shipEffects = new bkcore.hexgl.ShipEffects({
			scene: scene,
			shipControls: shipControls,
			booster: booster,
			boosterSprite: boosterSprite,
			boosterLight: boosterLight,
			useParticles: false
		});

		// ===== TRACK (procedural, 4 layers) =====
		var trackGeos = this._buildTrackGeometries();
		ctx.createMesh(scene, trackGeos.glow,      0, 0, 0, this.materials.trackGlow);
		ctx.createMesh(scene, trackGeos.body,      0, 0, 0, this.materials.track);
		ctx.createMesh(scene, trackGeos.edgeLeft,  0, 0, 0, this.materials.trackEdge);
		ctx.createMesh(scene, trackGeos.edgeRight, 0, 0, 0, this.materials.trackEdge);

		// ===== CAMERA CHASE =====
		ctx.components.cameraChase = new bkcore.hexgl.CameraChase({
			target: ship,
			camera: camera,
			cameraCube: ctx.manager.get("sky").camera,
			lerp: 0.5,
			yoffset: 8.0,
			zoffset: 10.0,
			viewOffset: 10.0
		});

		ctx.manager.add("game", scene, camera, function(delta, renderer) {
			if (delta > 25 && this.objects.lowFPS < 1000) this.objects.lowFPS++;
			var dt = delta / 16.6;
			this.objects.components.shipControls.update(dt);
			this.objects.components.shipEffects.update(dt);
			this.objects.components.cameraChase.update(dt, this.objects.components.shipControls.getSpeedRatio());
			this.objects.composers.game.render(dt);
			if (this.objects.hud) this.objects.hud.update(
				this.objects.components.shipControls.getRealSpeed(100),
				this.objects.components.shipControls.getRealSpeedRatio(),
				this.objects.components.shipControls.getShield(100),
				this.objects.components.shipControls.getShieldRatio()
			);
			if (this.objects.components.shipControls.getShieldRatio() < 0.2)
				this.objects.extras.vignetteColor.setHex(0x992020);
			else
				this.objects.extras.vignetteColor.setHex(0x00e5ff);
		}, {
			components: ctx.components,
			composers: ctx.composers,
			extras: ctx.extras,
			quality: quality,
			hud: ctx.hud,
			time: 0.0,
			lowFPS: 0
		});
	}
};
