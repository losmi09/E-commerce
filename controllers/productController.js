import multer from 'multer';
import * as crudController from './crudController.js';
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

export const getAllProducts = crudController.getAll('product');
export const getProduct = crudController.getOne('product');
export const createProduct = crudController.createOne('product');
export const updateProduct = crudController.updateOne('product');
export const deleteProduct = crudController.deleteOne('product');
