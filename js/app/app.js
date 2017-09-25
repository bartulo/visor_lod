define( ["three", "camera", "container", "controls", "geometry", "material",  "noise", "renderer", "scene", "terrain"],
function ( THREE, camera, container, controls, geometry, material, noise, renderer, scene, Terrain ) {
  var app = {
    clock: new THREE.Clock(),
    mouse: { x: 0, y: 0 },
    smoothMouse: { x: 0, y: 0 },
    init: function () {
      // Terrain( heightdata, worldWidth, levels of detail, tile resolution )
      function loadTerrain(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'mdt05.bin', true);
        xhr.responseType = 'arraybuffer';
        app.terrain = new Terrain();
        xhr.onload = function() {
          var mdt = new Uint16Array(xhr.response);
          var mdt8 = new Uint8Array( 1024 * 1024 * 3 );
          for (var i=1226; i< 10049802; i++){
            if (mdt[i]<255) {
              mdt8[(i-1226)*3] = 0;
            } else {
              mdt8[(i-1226)*3] = 255;
            }
            mdt8[(i-1226)*3 + 1] = Math.trunc(mdt[i]/255);
            mdt8[(i-1226)*3 + 2] = mdt[i]%255;
          }
          callback(mdt8);
        }
        xhr.send(null);
      }
      loadTerrain(function(data){
         var noise = new THREE.DataTexture( data, 1024, 1024, THREE.RGBFormat );
         noise.wrapS = THREE.MirroredRepeatWrapping;
         noise.wrapT = THREE.MirroredRepeatWrapping;
         noise.needsUpdate = true;
         app.terrain = new Terrain( noise, 1024, 4, 64 );
         scene.add( app.terrain );
      });
      // Add sky
      app.sky = new THREE.Mesh( geometry.sky, material.sky );
      app.sky.position.z = 250;
      app.sky.visible = false;
      scene.add( app.sky );
      
      /// Add sky2
      app.sky2 = new THREE.Mesh( geometry.sky2, material.atmosphere );
      app.sky2.position.z = -1000;
      scene.add( app.sky2 );

      // Mouse input
      container.addEventListener( 'mousemove', function( e ) {
        app.mouse = {
          x: e.clientX - container.offsetWidth / 2,
          // Square to give more sensitivity at bottom of screen
          y: Math.pow( container.offsetHeight - e.clientY, 2 ) / container.offsetHeight
        };
      } );

      container.addEventListener( 'click', function() {
        // Switch between different frag shaders
        var s = app.terrain.cycleShader();
        if ( s === 0 ) {
          app.sky.visible = true;
          app.sky2.visible = false;
        } else {
          app.sky.visible = false;
          app.sky2.visible = true;
          if ( s === 1 ) {
            material.atmosphere.uniforms.uHorizonColor.value = new THREE.Color( 0xfff1d8 );
            material.atmosphere.uniforms.uSkyColor.value = new THREE.Color( 0xf9f9ff );
          } else {
            material.atmosphere.uniforms.uHorizonColor.value = new THREE.Color( 0xffffff );
            material.atmosphere.uniforms.uSkyColor.value = new THREE.Color( 0x55b9ff );
          }
        }
      } );
    },
 //   height: function() {
 //     var i = Math.floor( camera.position.x % 1024 );
 //     var j = 1023 - Math.floor( camera.position.y % 1024 );
 //     //var h = 1024 * noise.image.data[ 13 ];
 //     var h = 1024 * noise.image.data[i + 1024 * j] / 255;
 //     return h * h / 2000 + 20;
 //   },
    center: new THREE.Vector3( 205, 135, 0 ),
    animate: function () {
      window.requestAnimationFrame( app.animate );

      // Smooth mouse position
      var smooth = 0.02;
      app.smoothMouse.x += smooth * ( app.mouse.x - app.smoothMouse.x );
      app.smoothMouse.y += smooth * ( app.mouse.y - app.smoothMouse.y );

      var time = 0.5 * app.clock.getElapsedTime();
      camera.position.x = 450 * Math.cos( time / 3 ) + app.center.x;
      camera.position.y = 250 * Math.sin( time / 4 ) + app.center.y + 500;
      camera.position.z = Math.min( app.smoothMouse.y / 2 + 5, 500 );
      //camera.position.z = 30 + 260 * Math.pow( Math.sin( time ), 4 );
      camera.up = new THREE.Vector3( 0, 0, 1 );
      camera.lookAt( app.center );

      // Look left right
      var look = app.center.clone();
      look.sub( camera.position );
      look.normalize();
      look.multiplyScalar( 50 );
      var across = new THREE.Vector3().crossVectors( look, camera.up );
      across.multiplyScalar( app.smoothMouse.x / 333 );
      camera.position.add( across );
      //camera.up = new THREE.Vector3( 1, 0, 1 );
      camera.up.add( across.multiplyScalar( -0.005 ) );
      camera.lookAt( app.center );

      app.terrain.offset.x = camera.position.x;
      app.terrain.offset.y = camera.position.y;
      renderer.render( scene, camera );
    }
  };
  return app;
} );
