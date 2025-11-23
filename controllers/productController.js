import multer from 'multer';
import * as factory from './handlerFactory.js';
import fileFilter from '../utils/image/fileFilter.js';
import catchAsync from '../utils/catchAsync.js';
import * as imageService from '../services/imageService.js';

const storage = multer.memoryStorage();

const upload = multer({ storage, fileFilter });

export const uploadProductImages = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeProductImage = catchAsync(async (req, res, next) => {
  if (!req.files?.coverImage?.[0] || !req.files.images?.[0]) return next();

  req.body.coverImage = await imageService.prepareTheImage({
    model: 'product',
    id: req.params.id,
    files: req.files,
    isCover: true,
  });

  next();
});

export const getAllProducts = factory.getAll('product');
export const getProduct = factory.getOne('product');
export const createProduct = factory.createOne('product');
export const updateProduct = factory.updateOne('product');
export const deleteProduct = factory.deleteOne('product');
