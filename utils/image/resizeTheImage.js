import sharp from 'sharp';

const resizeTheImage = async (buffer, path, fileName) =>
  await sharp(buffer)
    .resize(2000, 1333)
    .toFormat('jpg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/${path}/${fileName}`);

export default resizeTheImage;
