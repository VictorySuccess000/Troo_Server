const Jimp = require("jimp");

exports.main = async (file,LOGO) => {
  const [image, logo] = await Promise.all([
    Jimp.read(file),
    Jimp.read(LOGO)
  ]);
  image.resize(400,260);
  logo.resize(image.bitmap.width / 4, Jimp.AUTO);
  const X=image.bitmap.width/20; 
  const Y=image.bitmap.height/2;

  return image.composite(logo, X, Y, [
    {
      mode: Jimp.BLEND_SCREEN,
      opacitySource: 0.1,
      opacityDest: 1
    }
  ]);
};
