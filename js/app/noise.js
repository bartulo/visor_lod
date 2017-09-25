define( ["three", "ImprovedNoise"], function ( THREE, ImprovedNoise ) {
  // Create noise and save it to texture
  var width = 1024;
  var size = width * width;
  var data = new Uint8Array( size );
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'mdt05.bin', true);
  xhr.responseType = 'arraybuffer';
  var noise = []
  console.log(xhr);

    return noise;

} );
