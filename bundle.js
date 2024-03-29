/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var CelestialBody = __webpack_require__(1);
	var PhysicsObject = __webpack_require__(2);
	var GhostObject = __webpack_require__(3);
	var assetsObj = __webpack_require__(4);

	var entityArray = [];
	var assets = {
		textures: {},
		models: {}
	};

	window.sounds = [];
	window.soundIndex = 0;
	for(var i = 0; i < 10; i++) {
		sounds.push(new Audio('plop'+((i % 5)+1)+'.wav'))
		sounds[i].volume = 0.125;
	}



	var faceRenderer = new THREE.WebGLRenderer();
	faceRenderer.setSize(128, 128);
	var faceCamera = new THREE.PerspectiveCamera(30, 1, 1, 10000000);

	var terra, luna, sol, fe;
	var rojo, wasser, igloo;
	var piggen;
	var navBall;
	var skyBox;

	var manager = new THREE.LoadingManager();
	var textureLoader = new THREE.ImageLoader(manager);
	var modelLoader = new THREE.OBJLoader(manager);

	var sTime, pTime, dTime;
	window.tTime;

	var mouse = {
		isDown: false,
		isHeld: false,
		deltaY: 0,
		clickPos: {
			x: null,
			y: null
		},
		curPos: {
			x: null,
			y: null
		}
	};
	var keyArray = [];
	var cameraObj = {
		pitch: -Math.PI / 2,
		yaw: Math.PI / 2,
		roll: 0,
		oPitch: -Math.PI / 2,
		oYaw: 0,
		oRoll: 0,
		distance: 50
	}

	$(function() {
		loadAssets();
	});

	function loadAssets() {
		var i = 0;
		for(let key in assetsObj.textures) {
			(function() {
				var key2 = key;
				i++;
				let src = assetsObj.textures[key2];
				assets.textures[key2] = new THREE.Texture();
				textureLoader.load(src, function(image) {
					assets.textures[key2].image = image;
					assets.textures[key2].needsUpdate = true;
					if(--i === 0) {
						//init();
						nameInit();
					}
				})
			})();
		}
		for(let key in assetsObj.models) {
			(function() {
				var key2 = key;
				i++;
				let obj = assetsObj.models[key2];
				assets.models[key2] = null;
				modelLoader.load(obj.src, function(mesh) {
					mesh.traverse(function(child) {
						if(child instanceof THREE.Mesh) {
							child.material.map = assets.textures[obj.texture];
						}
					});
					assets.models[key2] = mesh;
					//console.log(assets.models[key].clone());
					if(--i === 0) {
						//init();
						nameInit();
					}
				});
			})();
		}
	}
	function nameInit() {
		$("#nameForm").show();
	}

	function setupScenes() {
		//var ambient = new THREE.AmbientLight( 0x222222 );
		var ambient = new THREE.AmbientLight( 0x222222 );
		systemScene.add( ambient );
		var point = new THREE.PointLight(0xFFFFFF)
		point.position.set( 0, 1, 0 );

		systemScene.add( point );
		$("#renderContainer").append(systemRenderer.domElement);

		/*
		var hudElem = hudRenderer.domElement;
		hudElem.style.position = "absolute";
		hudElem.style.left = 0;
		hudElem.style.top = 0;
		$("#renderContainer").append(hudElem);
		*/

		var faceElem = faceRenderer.domElement;
		faceElem.style.position = "absolute";
		faceElem.style.left = "calc(100% - 128px - 32px)";
		faceElem.style.top = "calc(100% - 128px - 32px)";
		faceElem.style.borderRadius = "32px";
		faceElem.style.border = "2px solid rgba(100, 0, 0, 1)";
		$("#renderContainer").append(faceElem);

		systemScene.add(proLine);
		systemScene.add(retroLine);
		systemScene.add(gravityLine);
		systemScene.add(facingLine);
	}
	var line;
	var geo;
	var mat;
	function setupSystem() {
		sol = new CelestialBody(128 * 10, assets.textures.sol, null, 0, 0, 128000 * 100 * 1000, "Sol");
		sol.material.emissiveMap = assets.textures.sol;
		sol.material.emissive.r = 1;
		sol.material.emissive.g = 1;
		sol.material.emissive.b = 1;
		systemScene.add(sol.mesh);
		entityArray.push(sol);

		fe = new CelestialBody(16, assets.textures.fe, sol, sol.size * 4, 0.125 / 8, 128000 / 2, "Fe");
		systemScene.add(fe.mesh);
		entityArray.push(fe);
		
		terra = new CelestialBody(32, assets.textures.terra, sol, sol.size * 32, 0.125 / 32 / 8 / 8 / 8 , 128000, "Terra");
		systemScene.add(terra.mesh);
		entityArray.push(terra);
		
		luna = new CelestialBody(4, assets.textures.luna, terra, terra.size * 8, 0.125 / 32 , 128000 / 32, "Luna");
		systemScene.add(luna.mesh);
		entityArray.push(luna);

		rojo = new CelestialBody(48, assets.textures.rojo, sol, sol.size * 16, 0.125 / 32 / 8 / 8, 128000, "Rojo");
		systemScene.add(rojo.mesh);
		entityArray.push(rojo);

		wasser = new CelestialBody(128, assets.textures.wasser, sol, sol.size * 64, 0.125 / 32 / 8 / 8 / 8, 128000 * 8, "Wasser");
		systemScene.add(wasser.mesh);
		entityArray.push(wasser);

		igloo = new CelestialBody(8, assets.textures.igloo, sol, sol.size * 128, 0.125 / 32 / 8 / 8 / 8 , 128000, "Igloo");
		systemScene.add(igloo.mesh);
		entityArray.push(igloo);

		var MAX_POINTS = 500;
		var geometry = new THREE.BufferGeometry();
		var positions = new Float32Array(MAX_POINTS * 3);
		geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setDrawRange(0, 500);
		var material = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 1 } );

		// line
		line = new THREE.Line( geometry,  material );
		//systemScene.add( line );

		for(var i = 0; i < 1; i++) {

			var isDonator;
			if(document.URL.match(/donater=(1+)/)) {
				isDonator = true;
			} else {
				isDonator = false;
			}
			if(isDonator) {
				piggen = new PhysicsObject(assets.models.katsuit_orange.clone(), terra, 1);
				var katpack = assets.models.katpack_orange.clone();
				piggen.mesh.add(katpack)
				var ushank = assets.models.ushanka.clone();
				piggen.mesh.add(ushank);
			} else {
				piggen = new PhysicsObject(assets.models.katsuit.clone(), terra, 1);
				var katpack = assets.models.katpack.clone();
				piggen.mesh.add(katpack)
			}

			piggen.mesh.add(faceCamera);
			var katface = assets.models.kat.clone();
			piggen.mesh.add(katface)
			var kathelm = assets.models.kathelmet.clone();
			piggen.mesh.add(kathelm);
			systemScene.add(piggen.mesh);
			entityArray.push(piggen);
			//piggen.mesh.position.y = terra.size * 4;
			//piggen.mesh.position.x = terra.size * 2;
			//piggen.mesh.position.x = terra.pos.x - 40 + Math.random() * 80;
			//piggen.mesh.position.z = terra.pos.z - 40 + Math.random() * 80;
			//piggen.velocity.x = 4;
			//piggen.isGrounded = false;
			if(isDonator) {
				piggen.mesh.scale.set(0.75,0.75,0.75);
			} else {
				piggen.mesh.scale.set(0.5,0.5,0.5);
			}
			faceCamera.up = new THREE.Vector3(0, 1, 0);
			faceCamera.position.set(8, 5, 0);
			faceCamera.lookAt(new THREE.Vector3(0, 5, 0));
		}


		var geo = new THREE.SphereGeometry(100, 32, 32);
		var mat = new THREE.MeshLambertMaterial({map:assets.textures.navball});
		navBall = new THREE.Mesh(geo, mat);
		navBall.position.y = (window.innerHeight * 0.8) / 2 - 100;
		//hudScene.add(navBall);
		//hudScene.add(new THREE.AmbientLight(0xFFFFFF));
		navBall.target = piggen;

		geo = new THREE.SphereGeometry(5, 8, 8);
		mat = new THREE.MeshLambertMaterial({color: 0xFF0000});
		cursorDot = new THREE.Mesh(geo, mat);
		cursorDot.position.y = (window.innerHeight * 0.8) / 2 - 100;
		cursorDot.position.z = -100;
		//hudScene.add(cursorDot);

		var materialArray = [];
		var order = ["left", "right", "up", "down", "front", "back"];
		for(var i = 0; i < 6; i++) {
			materialArray.push(new THREE.MeshBasicMaterial({
				map: assets.textures["sky_" + order[i]],
				side: THREE.BackSide
			}))
		}
		var skyGeo = new THREE.CubeGeometry(10000000, 10000000, 10000000);
		var skyMat = new THREE.MeshFaceMaterial(materialArray);
		skyBox = new THREE.Mesh(skyGeo, skyMat);
		skyBox.position.x = piggen.mesh.position.x;
		skyBox.position.y = piggen.mesh.position.y;
		skyBox.position.z = piggen.mesh.position.z;
		systemScene.add(skyBox);

	}

	function setupEventListeners() {
		window.onresize = function(e) {
			systemRenderer.setSize(($("#renderContainer").innerWidth()), (window.innerHeight * 0.8));
			window.systemCamera = new THREE.PerspectiveCamera(60, ($("#renderContainer").innerWidth()) / (window.innerHeight * 0.8), 1, 10000000);
		}
		window.onwheel = function(e) {
			mouse.deltaY = e.deltaY;
		}
		window.onmousedown = function(e) {
			mouse.isDown = mouse.isHeld = true;
			mouse.clickPos.x = e.clientX;
			mouse.clickPos.y = e.clientY;
		}
		window.onmouseup = function(e) {
			mouse.clickPos.x = mouse.clickPos.y = null;
			mouse.isDown = mouse.isHeld = false;
		}
		window.onmousemove = function(e) {
			mouse.curPos.x = e.clientX;
			mouse.curPos.y = e.clientY;
		}
		window.onkeydown = function(e) {
			keyArray[e.keyCode] = true;
		}
		window.onkeyup = function(e) {
			keyArray[e.keyCode] = false;
		}
	}
	var ws;
	var uuid;
	var key;
	var ghosts = {

	}
	var systemRenderer, systemScene;
	window.init = function init() {
		;
		
		systemRenderer = new THREE.WebGLRenderer();
		systemRenderer.setSize(($("#renderContainer").innerWidth()), (window.innerHeight * 0.8));
		//systemRenderer.setSize(($("#renderContainer").innerWidth()), (window.innerHeight * 0.8));
		systemScene = new THREE.Scene();
		window.systemCamera = new THREE.PerspectiveCamera(60, ($("#renderContainer").innerWidth()) / (window.innerHeight * 0.8), 1, 10000000);
		/*
		var hudRenderer = new THREE.WebGLRenderer({alpha:true});
		hudRenderer.setSize(($("#renderContainer").innerWidth()), (window.innerHeight * 0.8));
		var hudScene = new THREE.Scene();
		var hudCamera = new THREE.OrthographicCamera(-($("#renderContainer").innerWidth()) / 2, ($("#renderContainer").innerWidth()) / 2, -(window.innerHeight * 0.8) / 2, (window.innerHeight * 0.8) / 2, 1, 10000);
		hudCamera.position.z = -1000;
		hudCamera.up = new THREE.Vector3(0, 1, 0);
		hudCamera.lookAt(new THREE.Vector3(0, 0, 0));
		*/




		$(".planetContainer").tooltip();
		$("#nameForm").hide();
		setupEventListeners();
		setupScenes();
		setupSystem();
		ws = new WebSocket('ws://localhost:3000');
		var isDonator;
		if(document.URL.match(/donater=(1+)/)) {
			isDonator = true;
		} else {
			isDonator = false;
		}
		ws.onopen = function() {
			var interval = setInterval(function() {
				if(key) {
					ws.send(JSON.stringify({
						messageType: "piggen_update",
						data: {
							name: $("#nameField").val(),
							key: key,
							isDonator: isDonator,
							piggen: {
								pos: {
									x:piggen.pos.x,
									y:piggen.pos.y,
									z:piggen.pos.z
								},
								vel: {
									x:piggen.vel.x,
									y:piggen.vel.y,
									z:piggen.vel.z
								},
								acc: {
									x:piggen.acc.x,
									y:piggen.acc.y,
									z:piggen.acc.z
								},
								pitch: piggen.pitch,
								yaw: piggen.yaw,
								roll: piggen.roll,
								isGrounded:piggen.isGrounded,
								anchorLoc:{
									x:piggen.anchorLoc.x,
									y:piggen.anchorLoc.y,
									z:piggen.anchorLoc.z
								}
							}
						}

					}))
				}
			}, 10);
			ws.onclose = function() {
				window.clearInterval(interval);
				// Clear all the ghosts, etc.
			}
			ws.onmessage = function(e) {
				try {
					var message = JSON.parse(e.data);
					switch(message.messageType) {
						case "connection_confirmed":
							console.log("My uuid is: ", message.data.uuid);
							uuid = message.data.uuid;
							tTime = message.data.tTime;
							key = message.data.key;
							var nameTag = $("<div>");
							var nameEmote = $("<div>");
							nameTag.append(nameEmote);
							
							nameEmote.addClass("emote")
							nameTag.addClass("nameTag");
							nameTag.attr('id', message.data.uuid);
							var nameText = $("<div>");
							nameText.text($("#nameField").val().substring(0, 12) + (isDonator ? " 💵" : ""));
							nameTag.append(nameText);
							if(isDonator) {
								nameTag.addClass("isDonator");
							}
							$("#renderContainer").append(nameTag);
							nameTag.css("left", "calc(100% - 128px - 32px + 64px - "+nameTag.outerWidth()/2+"px)");
							nameTag.css("top", "calc(100% - 128px - 32px + 128px - "+nameTag.outerHeight()+"px)");

							var chatlog = $("<div>").addClass("chat");
							if(isDonator) {
								chatlog.addClass("subchat");
							}
							chatlog.text($("#nameField").val().substring(0, 12) + (isDonator ? " 💵" : "") + " has joined.");
							$("#log").append(chatlog)
							setTimeout(function() {
								$("#log :first-child").remove();
							}, 3000);


							break;
						case "world_update":
							if(ghosts[message.data.uuid]) {
								ghosts[message.data.uuid].piggen = message.data.piggen;
								ghosts[message.data.uuid].name = message.data.name;
								ghosts[message.data.uuid].obj.update(message.data.piggen);
								console.log()
								if(message.data.emote !== -1) {
									console.log($("#"+message.data.uuid+" .emote"));
									$("#"+message.data.uuid+" .emote").append($("<img>").attr("src", "em"+message.data.emote+".png"));
									setTimeout(function() {
										$("#"+message.data.uuid+" .emote").text("");
									}, 3000);
									//console.log("EMOTE DETECTED!");
								}
							} else {
								console.log("New ghost detected.");
								var tDon = message.data.isDonator;
								var tobj;
								if(tDon) {
									tobj =  new GhostObject(assets.models.katsuit_orange.clone(), message.data.piggen)
									tobj.isDonate = true;
								} else {
									tobj =  new GhostObject(assets.models.katsuit.clone(), message.data.piggen)
								}

								tobj.charName = message.data.name.substring(0, 12) + (message.data.isDonator ? " 💵" : "");
								ghosts[message.data.uuid] = {
									piggen: message.data.piggen,
									obj: tobj
								}
								var chatlog = $("<div>").addClass("chat");
								if(tDon) {
									chatlog.addClass("subchat");
								}
								chatlog.text(message.data.name.substring(0, 12) + (message.data.isDonator ? " 💵" : "") + " has joined.");
								$("#log").append(chatlog)
								setTimeout(function() {
									$("#log :first-child").remove();
								}, 3000);
								ghosts[message.data.uuid].name = message.data.name;
								var t = ghosts[message.data.uuid].obj.mesh;
								var katface = assets.models.kat.clone();
								t.add(katface)
								//var katpack = assets.models.katpack.clone();
								//t.add(katpack)
								var kathelm = assets.models.kathelmet.clone();
								t.add(kathelm);
								if(tDon) {
									t.add(assets.models.ushanka.clone());
									ghosts[message.data.uuid].obj.mesh.scale.set(0.75, 0.75, 0.75);
									var katpack = assets.models.katpack_orange.clone();
									t.add(katpack)
								} else {
									ghosts[message.data.uuid].obj.mesh.scale.set(0.5, 0.5, 0.5);
									var katpack = assets.models.katpack.clone();
									t.add(katpack)
								}
								ghosts[message.data.uuid].obj.uuid = message.data.uuid
								var nameTag = $("<div>");
								ghosts[message.data.uuid].dom = nameTag
								nameTag.addClass("nameTag");

								var nameEmote = $("<div>");
								nameEmote.addClass("emote");
								nameTag.append(nameEmote);
								var nameText = $("<div>");
								nameText.text(message.data.name.substring(0, 12) + (message.data.isDonator ? " 💵" : ""));
								nameTag.append(nameText);


								/*
								var nameTag = $("<div>");
							var nameEmote = $("<div>");
							nameTag.append(nameEmote);
							
							nameEmote.addClass("emote")
							nameTag.addClass("nameTag");
							nameTag.attr('id', message.data.uuid);
							var nameText = $("<div>");
							nameText.text($("#nameField").val().substring(0, 12) + (isDonator ? " 💵" : ""));
							nameTag.append(nameText);
								*/
								$("#renderContainer").append(nameTag);
								if(message.data.isDonator) {
									nameTag.addClass('isDonator')
								}
								var pos = new THREE.Vector3(piggen.pos.x, piggen.pos.y, piggen.pos.z);
								pos.project(systemCamera);

								nameTag.css('left', Math.round((pos.x + 1) * (window.innerWidth - 300) / 2))
								nameTag.css('top', Math.round(window.innerHeight * 0.1 + (-1 * pos.y + 1) * (window.innerHeight * 0.8) / 2))
								nameTag.attr("id", message.data.uuid);

								systemScene.add(ghosts[message.data.uuid].obj.mesh);
								entityArray.push(ghosts[message.data.uuid].obj);
							}
							//console.log(message.data);
							break;
						case "dead_unit":
							if(ghosts[message.data.uuid]) {
								systemScene.remove(ghosts[message.data.uuid].obj.mesh);
								$("#"+message.data.uuid).remove();
							}
							break;
						default:
							console.log("Unknown messageType: ", message.messageType);
							break;
					}
				} catch(e) {
					console.log("Error parsing server message", e);
					ws.close();
				}
			}
		}
		
		sTime = (new Date()).getTime();
		pTime = sTime;
		tTime = 0;
		setInterval(main, 10);
	}
	var lineIndex = 0;
	var step = 0;
	function main() {
		sTime = (new Date()).getTime();
		dTime = sTime - pTime;
		tTime += dTime;
		control();
		logic();
		if(step++ % 8 === 0) {
			var pos = line.geometry.attributes.position.array;
			pos[lineIndex] = piggen.pos.x;
			pos[lineIndex + 1] = piggen.pos.y;
			pos[lineIndex + 2] = piggen.pos.z;
			line.geometry.attributes.position.needsUpdate = true;
			lineIndex += 3;
			if(lineIndex >= 500 * 3) {
				lineIndex = 0;
			}
		}
		render();
		pTime = sTime;
	}
	var canEmote = true;
	function doEmoji(n) {
		$("#"+uuid + " .emote").append($("<img>").attr("src", "em"+n+".png"));
		canEmote = false;
		ws.send(JSON.stringify({
			messageType: "emote",
			data: {
				key: key,
				num: n
			}
		}));
		setTimeout(function() {
			$("#"+uuid + " .emote").html("");
			canEmote = true;
		}, 3000);
	}
	function control() {
		// 48 -> 57
		if(canEmote) {
			if(keyArray[48]) {
				doEmoji(0);
			}
			if(keyArray[49]) {
				doEmoji(1);
				
			}
			if(keyArray[50]) {
				doEmoji(2);
				
			}
			if(keyArray[51]) {
				doEmoji(3);
				
			}
			if(keyArray[52]) {
				doEmoji(4);
				
			}
			if(keyArray[53]) {
				doEmoji(5);
				
			}
			if(keyArray[54]) {
				doEmoji(6);
				
			}
			if(keyArray[55]) {
				doEmoji(7);
				
			}
			if(keyArray[56]) {
				doEmoji(8);
				
			}
			if(keyArray[57]) {
				doEmoji(9);

			}
		}
		if(mouse.isHeld) {
			mouse.isHeld = false;
			cameraObj.oYaw = cameraObj.yaw;
			cameraObj.oPitch = cameraObj.pitch;
			cameraObj.oRoll = cameraObj.roll;
		}
		if(mouse.isDown) {
			cameraObj.yaw = cameraObj.oYaw + (mouse.curPos.x - mouse.clickPos.x) / ($("#renderContainer").innerWidth()) * Math.PI * 2;
			cameraObj.pitch = Math.min(Math.max(cameraObj.oPitch + (mouse.curPos.y - mouse.clickPos.y) / (window.innerHeight * 0.8) * Math.PI * 2, -Math.PI + 0.0000001), -0.0000001);
		}
		if(mouse.deltaY !== 0) {
			cameraObj.distance += mouse.deltaY / 100;
			if(cameraObj.distance < 2) {
				cameraObj.distance = 2;
			}
			mouse.deltaY = 0;
		}

		// 32 Space
		if(keyArray[32]) {
			//Space
			isThrusting = true;
		} else {
			isThrusting = false;
		}
		// WASD
		// 87, 65, 83, 68
		// QE
		// 81, 69
		var delta = dTime / 1000 * 2;
		if(keyArray[87]) {
			//W
			var m1 = new THREE.Matrix4();
			m1.makeRotationZ(-1 * delta);
			navBallQ.multiply(m1);
			
		} else if (keyArray[83]) {
			//S
			var m1 = new THREE.Matrix4();
			m1.makeRotationZ(delta);
			navBallQ.multiply(m1);
		}
		if(keyArray[65]) {
			//A
			var m1 = new THREE.Matrix4();
			m1.makeRotationY(delta);
			navBallQ.multiply(m1);
		} else if(keyArray[68]) {
			//D
			var m1 = new THREE.Matrix4();
			m1.makeRotationY(-1 * delta);
			navBallQ.multiply(m1);
		}
		if(keyArray[81]) {
			//Q
			var m1 = new THREE.Matrix4();
			m1.makeRotationX(-1 * delta);
			navBallQ.multiply(m1);
		} else if(keyArray[69]) {
			//E
			var m1 = new THREE.Matrix4();
			m1.makeRotationX(delta);
			navBallQ.multiply(m1);
		}
		var e = new THREE.Euler();
		e.setFromRotationMatrix(navBallQ);
		piggen.yaw = e.z;
		piggen.roll = e.x;
		piggen.pitch = e.y;
		var v1 = new THREE.Vector3(1, 0, 0);
		v1.applyMatrix4(navBallQ);
		//console.log(v1);

		

		navBall.rotation.x = e.z; // Yeah, ok
		navBall.rotation.y = e.y;
		navBall.rotation.z = e.x; // Yep, makes sense.
	}


	var proMat = new THREE.LineBasicMaterial({color:0x00FF00})
	window.prograde = new THREE.Geometry();
	prograde.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0)
	)
	var proLine = new THREE.Line(prograde, proMat);
	proLine.frustumCulled = false;
	var retroMat = new THREE.LineBasicMaterial({color:0xFF0000})
	window.retrograde = new THREE.Geometry();
	retrograde.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0)
	)
	var retroLine = new THREE.Line(retrograde, retroMat);
	retroLine.frustumCulled = false;
	var gravityMat = new THREE.LineBasicMaterial({color:0x0000FF})
	window.gravityDir = new THREE.Geometry();
	gravityDir.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0)
	)
	var gravityLine = new THREE.Line(gravityDir, gravityMat);
	gravityLine.frustumCulled = false;
	var facingMat = new THREE.LineBasicMaterial({color:0xFFFFFF})
	window.facingDir = new THREE.Geometry();
	facingDir.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0)
	)
	var facingLine = new THREE.Line(facingDir, facingMat);
	facingLine.frustumCulled = false;


	/*
	var mat2 = new THREE.LineBasicMaterial({color:0xFFFF00})
	window.geo2 = new THREE.Geometry();
	geo2.vertices.push(
		new THREE.Vector3(-10000000, 0, 0),
		new THREE.Vector3(10000000, 0, 0)
	)
	var testLine = new THREE.Line(geo2);
	testLine.frustumCulled = false;
	*/

	window.isThrusting = false;
	window.navBallQ = new THREE.Matrix4();

	function logic() {
		//navBall.rotation.x = navBall.target.pitch + Math.PI / 2;
		//navBall.rotation.z = navBall.target.yaw;
		//navBall.rotation.setFromRotationMatrix(navBallQ, 'YXZw')

		for(var i = 0; i < entityArray.length; i++) {
			if(entityArray[i].logic) {
				entityArray[i].logic(dTime, tTime, entityArray);
			}
		}
		var pos = piggen.pos;

		skyBox.position.x = piggen.mesh.position.x;
		skyBox.position.y = piggen.mesh.position.y;
		skyBox.position.z = piggen.mesh.position.z;

		pos.add(new THREE.Vector3(Math.cos(cameraObj.yaw) * Math.sin(cameraObj.pitch) * cameraObj.distance, Math.cos(cameraObj.pitch) * cameraObj.distance, Math.sin(cameraObj.yaw) * Math.sin(cameraObj.pitch) * cameraObj.distance));

		systemCamera.position.set(pos.x, pos.y + 2.5, pos.z);
		systemCamera.up = new THREE.Vector3(0, 1, 0);
		systemCamera.lookAt(piggen.pos.add(new THREE.Vector3(0, 2.5, 0)));

		//faceCamera.up = new THREE.Vector3(0, 1, 0);
		//faceCamera.position.set(piggen.pos.x + 4 * pDir.x, piggen.pos.y + 2.5 * pDir.z, piggen.pos.z);
		//faceCamera.lookAt(piggen.pos.add(new THREE.Vector3(0, 2.5, 0)));
	}
	function render() {
		systemRenderer.render(systemScene, systemCamera);
		//hudRenderer.render(hudScene, hudCamera);
		faceRenderer.render(systemScene, faceCamera);
	}
	function ui() {
		for(var i = 0; i < entityArray.length; i++) {
			if(entityArray[i].ui) {
				entityArray[i].ui(dTime, tTime, entityArray);
			}
		}
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = class CelestialBody {
		constructor(size, map, target, orbit, speed, mass, name) {
			this.size = size;
			this.map = map;
			this.geometry = new THREE.SphereGeometry(this.size, 128, 128);
			this.material = new THREE.MeshLambertMaterial({map:map});
			this.mesh = new THREE.Mesh(this.geometry, this.material);
			this.target = target;
			this.orbit = orbit;
			this.speed = speed;
			this.mass = mass;
			this.name = name;

			var parentPos = this.orbit;
			var parent = this.target;
			while(parent) {
				parentPos += parent.orbit;
				parent = parent.target;
			}
			this.mesh.position.x = parentPos;
			
		}
		logic(dTime, tTime, entities) {
			var finalPos = new THREE.Vector3(0, 0, 0);
			var parent = this.target;
			while(parent) {
				finalPos.add(parent.pos);
				parent = parent.target;
			}
			this.mesh.position.x = finalPos.x + Math.cos(tTime / 1000 * this.speed) * this.orbit;
			this.mesh.position.z = finalPos.z + Math.sin(tTime / 1000 * this.speed) * this.orbit;
		}
		get pos() {
			return new THREE.Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z) 
		}
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var CelestialBody = __webpack_require__(1);
	var phrases = {
		"Sol":"been vaporized on the surface of",
		"Fe":"touched down on",
		"Rojo":"kicked up dust on",
		"Terra":"returned to",
		"Luna":"landed on",
		"Wasser":"splashed down on",
		"Igloo":"discovered"
	}
	module.exports = class PhysicsObject {
		constructor(mesh, target, mass) {
			this.mesh = mesh;
			this.isGrounded = true;
			this.target = target;
			this.acceleration = new THREE.Vector3(0, 0, 0);
			this.velocity = new THREE.Vector3(0, 0, 0);
			this.mass = mass;
			this.mesh.position.x = this.target.pos.x;
			this.mesh.position.y = this.target.pos.y + this.target.size;
			this.mesh.position.z = this.target.pos.z;
			this.anchorLoc = {
				x: 0,
				y: 1,
				z: 0
			}
			this.pitch = 0;
			this.yaw = 0;
			this.roll = 0;
			this.dist = 0;
			this.canMakeSound = true;
			this.nearestCeles = null;
			this.lastName = "";
		}
		logic(dTime, tTime, entities) {
			this.mesh.rotation.y = this.pitch;
			this.mesh.rotation.z = this.yaw;
			this.mesh.rotation.x = this.roll;
			//console.log(this.pitch, this.yaw, this.roll);
			var tSize = 1 / 64;
			var pDir = new THREE.Vector3(1, 0, 0);
			pDir.applyMatrix4(navBallQ);
			var celestial = this.findNearestCelestial(entities);
			this.nearestCeles = celestial;
			var dir = celestial.pos.sub(this.pos);
			var gForce2 = 0.01 * (celestial.mass * this.mass) / (celestial.pos.distanceToSquared(this.pos));
			while(dTime > 0) {
				dTime -= tSize;
				if(isThrusting) {
					this.isGrounded = false;
				}
				if(!this.isGrounded) {
					
					dir = celestial.pos.sub(this.pos).normalize();
					var tStep = tSize / 100;

					this.mesh.position.x += tStep * (this.vel.x + tStep * this.acc.x / 2);
					this.mesh.position.y += tStep * (this.vel.y + tStep * this.acc.y / 2);
					this.mesh.position.z += tStep * (this.vel.z + tStep * this.acc.z / 2);

					celestial = this.findNearestCelestial(entities);
					this.nearestCeles = celestial;

					gForce2 = 0.01 * (celestial.mass * this.mass) / (celestial.pos.distanceToSquared(this.pos));
					this.dist = Math.sqrt(celestial.pos.distanceToSquared(this.pos)) - celestial.size;
					var tAccX2, tAccY2, tAccZ2;
					//var pitch = this.pitch;
					//var yaw = this.yaw;
					//var pDir = new THREE.Vector3(Math.cos(yaw) * Math.cos(pitch), Math.sin(pitch), Math.sin(yaw) * Math.cos(pitch));
					//console.log(this.pitch, this.yaw, this.roll);
					//var pDir = new THREE.Vector3(Math.cos(this.pitch) * Math.cos(this.yaw), Math.sin(this.yaw), Math.sin(this.pitch) * Math.cos(this.yaw));
					
					//console.log(pDir);
					//console.log(pDir);
					pDir = new THREE.Vector3(1, 0, 0);
					pDir.applyMatrix4(navBallQ);
					var thrustModifier = 1.5;
					if(isThrusting) {
						tAccX2 = dir.x * gForce2 + pDir.x * thrustModifier;
						tAccY2 = dir.y * gForce2 + pDir.y * thrustModifier;
						tAccZ2 = dir.z * gForce2 + pDir.z * thrustModifier;
					} else {
						tAccX2 = dir.x * gForce2;
						tAccY2 = dir.y * gForce2;
						tAccZ2 = dir.z * gForce2;
					}
					
					this.velocity.x += tStep * (this.acc.x + tAccX2) / 2;
					this.velocity.x *= 0.999999995;
					this.velocity.y += tStep * (this.acc.y + tAccY2) / 2;
					this.velocity.y *= 0.999999995;
					this.velocity.z += tStep * (this.acc.z + tAccZ2) / 2;
					this.velocity.z *= 0.999999995;

					this.acceleration.x = tAccX2;
					this.acceleration.y = tAccY2;
					this.acceleration.z = tAccZ2;

					if(this.pos.distanceTo(celestial.pos) < celestial.size) {
						dir.negate();
						this.mesh.position.x = celestial.pos.x + dir.x * celestial.size;
						this.mesh.position.y = celestial.pos.y + dir.y * celestial.size;
						this.mesh.position.z = celestial.pos.z + dir.z * celestial.size;
						this.anchorLoc.x = dir.x;
						this.anchorLoc.y = dir.y;
						this.anchorLoc.z = dir.z;
						this.isGrounded = true;
						if(this.canMakeSound) {
							sounds[(soundIndex++) % 10].play();
							this.canMakeSound = false;
							setTimeout(function() {
								this.canMakeSound = true;
							}.bind(this), 250);

							if(this.nearestCeles.name !== "Terra" && this.nearestCeles.name !== this.lastName) {
								this.lastName = this.nearestCeles.name;
								var chatlog = $("<div>").addClass("chat");
								if(document.URL.match(/donater=(1+)/)) {
									chatlog.addClass("subchat");
								}
								chatlog.text($("#nameField").val().substring(0, 12) + (document.URL.match(/donater=(1+)/) ? " 💵" : "") + " has "+phrases[this.nearestCeles.name]+" " + this.nearestCeles.name + ".");
								$("#log").append(chatlog)
								setTimeout(function() {
									$("#log :first-child").remove();
								}, 3000);
							}
						}
						this.target = celestial;
						this.velocity.set(0, 0, 0);
					}
				} else {
					this.mesh.position.x = this.target.pos.x + this.anchorLoc.x * this.target.size;
					this.mesh.position.y = this.target.pos.y + this.anchorLoc.y * this.target.size;
					this.mesh.position.z = this.target.pos.z + this.anchorLoc.z * this.target.size;
				}
			}

			facingDir.vertices[0].set(this.pos.x, this.pos.y, this.pos.z);
			facingDir.vertices[1].set(this.pos.x + pDir.x * 5, this.pos.y + pDir.y * 5, this.pos.z + pDir.z * 5);
			facingDir.verticesNeedUpdate = true;

			prograde.vertices[0].set(this.pos.x, this.pos.y, this.pos.z);
			prograde.vertices[1].set(this.pos.x + this.vel.x * 5, this.pos.y + this.vel.y * 5, this.pos.z + this.vel.z * 5);
			prograde.verticesNeedUpdate = true;

			retrograde.vertices[0].set(this.pos.x, this.pos.y, this.pos.z);
			retrograde.vertices[1].set(this.pos.x - this.vel.x * 5, this.pos.y - this.vel.y * 5, this.pos.z - this.vel.z * 5);
			retrograde.verticesNeedUpdate = true;

			if(!this.isGrounded) {
				gravityDir.vertices[0].set(this.pos.x, this.pos.y, this.pos.z);
				gravityDir.vertices[1].set(this.pos.x + dir.x * gForce2 * 2.5, this.pos.y + dir.y * gForce2 * 2.5, this.pos.z + dir.z * gForce2 * 2.5);
				gravityDir.verticesNeedUpdate = true;
			} else {
				gravityDir.vertices[0].set(this.pos.x, this.pos.y, this.pos.z);
				gravityDir.vertices[1].set(this.pos.x, this.pos.y, this.pos.z);
				gravityDir.verticesNeedUpdate = true;
			}


			$("#altitude").html("Altitude<br>"+this.dist.toFixed(2) + "<br>" + this.vel.length().toFixed(2) + "u/s");
		}
		get acc() {
			return this.acceleration;
		}
		get vel() {
			return this.velocity;
		}
		get pos() {
			return new THREE.Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
		}
		findNearestCelestial(entities) {
			//Eventually refactor this so that it takes into sphere of influences, based on mass etc.
			var nearest = null;
			var nearestDist = Infinity;
			for(var i = 0; i < entities.length; i++) {
				var entity = entities[i];
				if(entity instanceof CelestialBody) {
					var dist = this.pos.distanceToSquared(entity.pos);
					if(dist < nearestDist) {
						nearestDist = dist;
						nearest = entity;
					}
				}
			}
			return nearest;
		}
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var CelestialBody = __webpack_require__(1);
	var phrases = {
		"Sol":"been vaporized on the surface of",
		"Fe":"touched down on",
		"Rojo":"kicked up dust on",
		"Terra":"returned to",
		"Luna":"landed on",
		"Wasser":"splashed down on",
		"Igloo":"discovered"
	}
	module.exports = class GhostObject {
		constructor(mesh, piggen) {
			this.mesh = mesh;
			this.update(piggen);
			this.canMakeSound = true;
			this.nearestCeles = null
			this.isDonate = false;
			this.lastName = "";
		}
		update(what) {
			this.mesh.position.x = what.pos.x;
			this.mesh.position.y = what.pos.y;
			this.mesh.position.z = what.pos.z;
			this.mesh.rotation.y = what.pitch;
			this.mesh.rotation.x = what.roll;
			this.mesh.rotation.z = what.yaw;
			if(this.canMakeSound) {
				if(this.piggen) {
					if(what.isGrounded && what.isGrounded !== this.piggen.isGrounded) {
						sounds[(soundIndex++) % 10].play();
						this.canMakeSound = false;
						setTimeout(function() {
							this.canMakeSound = true;
						}.bind(this), 250);

						if(this.nearestCeles.name !== "Terra" && this.nearestCeles.name !== this.lastName) {
							this.lastName = this.nearestCeles.name;
							var chatlog = $("<div>").addClass("chat");
							if(this.isDonate) {
								chatlog.addClass("subchat");
							}
							chatlog.text(this.charName + " has "+phrases[this.nearestCeles.name]+" " + this.nearestCeles.name + ".");
							$("#log").append(chatlog)
							setTimeout(function() {
								$("#log :first-child").remove();
							}, 3000);
						}
					}
				}
			}
			this.piggen = what;
		}
		logic(dTime, tTime, entities) {
			var tSize = dTime;
			var tStep = tSize / 100;
			var celestial = this.findNearestCelestial(entities);
			this.nearestCeles = celestial;
			if(!this.piggen.isGrounded) {
				this.mesh.position.x += tStep * (this.piggen.vel.x + tStep * this.piggen.acc.x / 2);
				this.mesh.position.y += tStep * (this.piggen.vel.y + tStep * this.piggen.acc.y / 2);
				this.mesh.position.z += tStep * (this.piggen.vel.z + tStep * this.piggen.acc.z / 2);
				this.piggen.vel.x += tStep * (this.piggen.acc.x) / 2;
				this.piggen.vel.x *= 0.999999995;
				this.piggen.vel.y += tStep * (this.piggen.acc.y) / 2;
				this.piggen.vel.y *= 0.999999995;
				this.piggen.vel.z += tStep * (this.piggen.acc.z) / 2;
				this.piggen.vel.z *= 0.999999995;
			} else {
				this.mesh.position.x = celestial.pos.x + this.piggen.anchorLoc.x * celestial.size;
				this.mesh.position.y = celestial.pos.y + this.piggen.anchorLoc.y * celestial.size;
				this.mesh.position.z = celestial.pos.z + this.piggen.anchorLoc.z * celestial.size;
			}
			/*
			var pos = new THREE.Vector3(piggen.pos.x, piggen.pos.y, piggen.pos.z);
			pos.project(systemCamera);
			nameTag.css('left', Math.round((pos.x + 1) * window.innerWidth / 2))
			nameTag.css('top', Math.round((-1 * pos.y + 1) * window.innerHeight / 2))
			*/
			var pos = new THREE.Vector3(this.piggen.pos.x, this.piggen.pos.y, this.piggen.pos.z);
			pos.project(systemCamera);
			if(pos.z > 1) {
				$("#"+this.uuid).hide();	
			} else {

				$("#"+this.uuid).show();
			}
			$("#"+this.uuid).css('left', Math.round((pos.x + 1) * ($("#renderContainer").innerWidth()) / 2))
			$("#"+this.uuid).css('top', Math.round((-1 * pos.y + 1) * (window.innerHeight * 0.8) / 2) - 64)

		}
		findNearestCelestial(entities) {
			//Eventually refactor this so that it takes into sphere of influences, based on mass etc.
			var nearest = null;
			var nearestDist = Infinity;
			for(var i = 0; i < entities.length; i++) {
				var entity = entities[i];
				if(entity instanceof CelestialBody) {
					var pos = new THREE.Vector3(this.piggen.pos.x,this.piggen.pos.y,this.piggen.pos.z);
					var dist = pos.distanceToSquared(entity.pos);
					if(dist < nearestDist) {
						nearestDist = dist;
						nearest = entity;
					}
				}
			}
			return nearest;
		}
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = {
		textures: {
			terra: "world.png",
			luna: "luna.png",
			sol: "sol.png",
			fe: "fe.png",
			navball: "ball-texture.png",
			sky_back: "test_render_2_back.png",
			sky_down: "test_render_2_down.png",
			sky_front: "test_render_2_front.png",
			sky_left: "test_render_2_left.png",
			sky_right: "test_render_2_right.png",
			sky_up: "test_render_2_up.png",
			kat: "pre_kat.png",
			kathelmet: "pre_kathelmet_interior.png",
			soyuz: "pre_soyuz.png",
			katsuit: "pre_katsuit.png",
			katpack: "pre_katpack.png",
			katsuit_orange: "pre_katsuit2.png",
			katpack_orange: "pre_katpack_orange.png",
			katsuit_blue: "pre_katsuit3.png",
			katpack_blue: "pre_katpack_blue.png",
			ushanka: "pre_ushanka.png",
			rojo: "rojo.png",
			wasser: "wasser.png",
			igloo: "igloo.png"
		},
		models: {
			kat: {
				src: "kat.obj",
				texture: "kat"
			},
			kathelmet: {
				src: "kathelmet_interior.obj",
				texture: "kathelmet"
			},
			soyuz: {
				src: "soyuz.obj",
				texture: "soyuz"
			},
			katsuit: {
				src: "katsuit_pack.obj",
				texture: "katsuit"
			},
			katpack: {
				src: "katpack.obj",
				texture: "katpack"
			},
			katsuit_orange: {
				src: "katsuit_pack.obj",
				texture: "katsuit_orange"
			},
			katpack_orange: {
				src: "katpack.obj",
				texture: "katpack_orange"
			},
			ushanka: {
				src: "ushanka.obj",
				texture: "ushanka"
			}
		}
	};

/***/ }
/******/ ]);