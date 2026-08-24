const Jimp = require('jimp');

async function processImage(inputPath) {
  try {
    const image = await Jimp.read(inputPath);
    console.log('Processing', inputPath);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // Calculate how close to white it is (0 to 1, where 1 is pure white)
      const whiteness = (red + green + blue) / (255 * 3);
      
      if (whiteness > 0.95) {
        // Pure white -> completely transparent
        // Slightly off-white -> partially transparent (smooths the halo a bit)
        const alpha = Math.max(0, 255 - ((whiteness - 0.95) * 20 * 255));
        this.bitmap.data[idx + 3] = alpha; 
      }
    });
    
    await image.writeAsync(inputPath);
    console.log('Saved', inputPath);
  } catch (err) {
    console.error('Error processing', inputPath, err);
  }
}

async function run() {
  await processImage('public/images/kuisioner-icon.png');
  await processImage('public/images/coaching-icon.png');
}

run();
