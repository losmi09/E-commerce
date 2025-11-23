import generateFileName from '../utils/image/generateFileName.js';
import prettyBytes from 'pretty-bytes';
import pluralize from 'pluralize';
import AppError from '../utils/error/appError.js';
import prisma from '../server.js';
import deleteImage from '../utils/image/deleteImage.js';
import resizeTheImage from '../utils/image/resizeTheImage.js';
import * as crudRepository from '../repositories/crudRepository.js';

const findProductImages = async productId =>
  await prisma.productImage.findMany({
    where: { productId },
  });

export const deleteRelatedImages = async (model, doc) => {
  if (model === 'product') {
    deleteImage('products', doc.coverImage);

    const productImages = await findProductImages(doc.id);

    productImages.forEach(img => deleteImage('products', img.fileName));
  } else deleteImage(pluralize(model), doc.image);
};

const setImage = async (model, id, fileName) => {
  const imageFields = {
    user: 'image',
    product: 'coverImage',
    category: 'image',
  };

  const field = imageFields[model];

  await prisma[model].update({
    where: { id },
    data: { [field]: fileName },
  });
};

const setProductImage = async (id, fileName, size) => {
  await prisma.productImage.create({
    data: {
      productId: id,
      fileName,
      extension: 'jpg',
      size,
      humanReadableSize: prettyBytes(size),
    },
  });
};

const uploadProductImages = async (model, id, files) => {
  await Promise.all(
    files.images.map(async (file, i) => {
      const fileName = generateFileName(model, id, false, i);

      await resizeTheImage(file.buffer, 'products', fileName);

      await setProductImage(+id, fileName, file.size);
    })
  );
};

const getBuffer = (model, file, files) =>
  model === 'product' ? files.coverImage[0].buffer : file.buffer;

export const prepareTheImage = async ({
  model,
  id,
  file,
  files,
  isCover = false, // Products can have one cover image
}) => {
  const doc = await crudRepository.findUniqueDocument(model, +id);

  if (!doc) throw new AppError(`No ${model} found with that ID`, 404);

  const fileName = generateFileName(model, +id, isCover);

  const buffer = getBuffer(model, file, files);

  await resizeTheImage(buffer, pluralize(model), fileName);

  await setImage(model, +id, fileName);

  if (model === 'product') await uploadProductImages(model, +id, files);

  return fileName;
};

export default prepareTheImage;
