import { unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import catchAsync from './catchAsync.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const deleteImage = catchAsync(async (folder, imageName) => {
  if (imageName !== 'default.jpg')
    await unlink(path.join(__dirname, `../public/img/${folder}/${imageName}`));
});

export default deleteImage;
