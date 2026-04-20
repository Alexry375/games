/*
 * HexGL AI Pilot — sensor-based autonomous driver.
 *
 * Strategy: every frame, scan a fan of probe points ahead of the ship against
 * the collision map (on-track = R==255). The centroid of on-track probes is
 * the steering target; the ship then presses left/right/forward keys to align
 * its forward direction with that target. Full throttle at all times.
 *
 * Install: include <script src="bkcore/hexgl/AIPilot.js"></script> after
 * HexGL scripts. The pilot auto-attaches when window.hexGL becomes available.
 */

var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};

bkcore.hexgl.AIPilot = (function () {

	// Tuning constants.
	var LOOK_MAX     = 1200;   // max march distance per probe (world units)
	var STEP         = 20;     // march step in world units
	var FAN_ANGLE    = Math.PI * 0.55;   // total spread of probe fan (~100°)
	var FAN_COUNT    = 25;     // dense fan for high resolution
	var STEER_DEAD   = 0.02;
	var SHARP_ANGLE  = 0.15;

	function AIPilot(hexGL) {
		this.hexGL = hexGL;
		this.shipControls = hexGL.components.shipControls;
		this.collisionMap = this.shipControls.collisionMap;
		this.pixelRatio   = this.shipControls.collisionPixelRatio;
		this._raf = null;

		// Pre-compute probe angles (evenly spaced on -FAN/2..+FAN/2).
		this.probeAngles = [];
		for (var i = 0; i < FAN_COUNT; i++) {
			var t = (FAN_COUNT === 1) ? 0.5 : i / (FAN_COUNT - 1);
			this.probeAngles.push((t - 0.5) * FAN_ANGLE);
		}

		// Reusable temporaries.
		this._forward = new THREE.Vector3();
		this._tmp = new THREE.Vector3();
	}

	AIPilot.prototype.start = function () {
		var self = this;
		function loop() {
			self.tick();
			self._raf = requestAnimationFrame(loop);
		}
		loop();
	};

	AIPilot.prototype.tick = function () {
		var sc = this.shipControls;
		if (!sc || !sc.active) {
			// Game not running yet (countdown, pause, finished). Keep throttle off.
			if (sc) sc.key.forward = sc.key.left = sc.key.right =
				sc.key.ltrigger = sc.key.rtrigger = false;
			return;
		}
		if (!this.collisionMap || !this.collisionMap.loaded) return;

		// Ship forward is local +Z (ShipControls uses translateZ(+speed)).
		this._forward.set(0, 0, 1);
		sc.dummy.matrix.rotateAxis(this._forward);
		var fx = this._forward.x;
		var fz = this._forward.z;
		var fAngle = Math.atan2(fx, fz); // yaw (0 = +Z forward)

		var px = sc.dummy.position.x;
		var pz = sc.dummy.position.z;

		var speed = sc.getRealSpeed(100); // 0..~700 range

		// Depth-weighted centroid of probe angles. Capping depth at DEPTH_CAP
		// prevents a single long probe on one side from dragging the centroid.
		var DEPTH_CAP = 500;
		var sumA = 0, sumW = 0;
		var forwardDepth = 0;

		for (var i = 0; i < this.probeAngles.length; i++) {
			var a = this.probeAngles[i];
			var worldA = fAngle + a;
			var sinA = Math.sin(worldA), cosA = Math.cos(worldA);
			var depth = 0;
			for (var d = STEP; d <= LOOK_MAX; d += STEP) {
				if (this._onTrack(px + sinA * d, pz + cosA * d)) depth = d;
				else break;
			}
			var w = Math.min(depth, DEPTH_CAP);
			sumA += a * w;
			sumW += w;
			if (Math.abs(a) < 0.05) forwardDepth = depth;
		}

		var sumWeight = sumW;
		var steer = (sumW > 0) ? (sumA / sumW) : 0;
		var centerOpen = forwardDepth > 200;
		var forwardClearDepth = forwardDepth;

		// If every probe is off-track, we're off the road — escape.
		if (sumWeight === 0) {
			steer = this._escapeDirection(px, pz, fAngle);
		}

		// Debug trace (throttled).
		if (!this._dbg) this._dbg = 0;
		this._dbg++;
		if (this._dbg % 15 === 0) {
			window.__aiDbg = {
				fAngle: fAngle.toFixed(3),
				steer: steer.toFixed(3),
				fwd: forwardDepth,
				speed: speed.toFixed(0),
				x: px.toFixed(0), z: pz.toFixed(0)
			};
		}

		// ---- DEBUG: direction test mode. If window.__aiTest is set, override. ----
		if (window.__aiTest === 'left') {
			sc.key.forward = true; sc.key.left = true; sc.key.right = false;
			sc.key.ltrigger = false; sc.key.rtrigger = false;
			return;
		}
		if (window.__aiTest === 'right') {
			sc.key.forward = true; sc.key.left = false; sc.key.right = true;
			sc.key.ltrigger = false; sc.key.rtrigger = false;
			return;
		}
		if (window.__aiTest === 'straight') {
			sc.key.forward = true; sc.key.left = false; sc.key.right = false;
			sc.key.ltrigger = false; sc.key.rtrigger = false;
			return;
		}
		// ---- Normal AI control. ----
		// Convention (verified empirically):
		//   key.left  turns ship toward +X   (use when steer > 0)
		//   key.right turns ship toward -X   (use when steer < 0)
		//   ltrigger  air-brake + drift right (tightens right turn)
		//   rtrigger  air-brake + drift left  (tightens left turn)

		var absSteer = Math.abs(steer);

		// Safe speed: falls off as the required turn tightens, and falls off
		// as the visible straight ahead shrinks.
		var turnCap  = 500 - 1800 * absSteer;              // sharp curve → lower cap
		var sightCap = 200 + 0.8 * forwardDepth;           // short sight → lower cap
		var safeSpeed = Math.min(turnCap, sightCap);
		if (safeSpeed < 120) safeSpeed = 120;              // never crawl below this

		var tooFast = speed > safeSpeed;

		// Throttle: hold unless we need to brake.
		sc.key.forward = !tooFast;

		// Steering.
		sc.key.left    = steer >  STEER_DEAD;
		sc.key.right   = steer < -STEER_DEAD;

		// Air-brakes: active when sharp turn needed OR when going too fast into a turn.
		var needBrake = tooFast && absSteer > STEER_DEAD;
		sc.key.ltrigger = (steer >  SHARP_ANGLE) || (needBrake && steer > 0);
		sc.key.rtrigger = (steer < -SHARP_ANGLE) || (needBrake && steer < 0);

		// Emergency: wall dead ahead, both brakes.
		if (forwardClearDepth < 60 && speed > 40) {
			sc.key.forward  = false;
			sc.key.ltrigger = true;
			sc.key.rtrigger = true;
		}
	};

	// Sample collision pixel at a world-space point (same math as ShipControls).
	AIPilot.prototype._onTrack = function (wx, wz) {
		var cm = this.collisionMap;
		var x = Math.round(cm.pixels.width  / 2 + wx * this.pixelRatio);
		var z = Math.round(cm.pixels.height / 2 + wz * this.pixelRatio);
		var c = cm.getPixel(x, z);
		return c.r === 255; // on-track, checkpoints, and bonus pads all have r=255
	};

	// Fallback: sweep a wider fan to find any on-track pixel and steer toward it.
	AIPilot.prototype._escapeDirection = function (px, pz, fAngle) {
		var SWEEP = 32;
		var bestA = 0;
		var bestDist = Infinity;
		for (var i = 0; i < SWEEP; i++) {
			var a = (i / SWEEP) * Math.PI * 2;
			for (var d = 10; d <= 400; d += 20) {
				var sx = px + Math.sin(a) * d;
				var sz = pz + Math.cos(a) * d;
				if (this._onTrack(sx, sz)) {
					if (d < bestDist) { bestDist = d; bestA = a; }
					break;
				}
			}
		}
		var rel = bestA - fAngle;
		while (rel >  Math.PI) rel -= Math.PI * 2;
		while (rel < -Math.PI) rel += Math.PI * 2;
		return rel;
	};

	// Waits for window.hexGL to be ready, then installs.
	function install() {
		var tries = 0;
		var iv = setInterval(function () {
			tries++;
			var hg = window.hexGL;
			if (hg && hg.components && hg.components.shipControls &&
				hg.components.shipControls.collisionMap &&
				hg.components.shipControls.collisionMap.loaded) {
				clearInterval(iv);
				window.aiPilot = new AIPilot(hg);
				window.aiPilot.start();
				console.log('[AIPilot] installed.');
			} else if (tries > 300) {
				clearInterval(iv);
				console.warn('[AIPilot] gave up waiting for hexGL.');
			}
		}, 100);
	}

	return { install: install, AIPilot: AIPilot };
})();

// Auto-install on script load.
bkcore.hexgl.AIPilot.install();
