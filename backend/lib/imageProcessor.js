const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

const IMAGE_SPECS = {
  rooms: {
    directory: path.join(UPLOAD_ROOT, 'rooms'),
    publicPath: '/uploads/rooms',
    width: 1600,
    height: 1200,
  },
  gallery: {
    directory: path.join(UPLOAD_ROOT, 'gallery'),
    publicPath: '/uploads/gallery',
    width: 1800,
    height: 1350,
  },
  site: {
    directory: path.join(UPLOAD_ROOT, 'site'),
    publicPath: '/uploads/site',
    width: 1920,
    height: 1280,
  },
};

const ensureDirectory = async (directoryPath) => {
  await fs.mkdir(directoryPath, { recursive: true });
};

const buildFileName = (originalName = 'image') => {
  const extensionless = path.parse(originalName).name || 'image';
  const sanitizedBase = extensionless.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'image';
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizedBase}.webp`;
};

const processImageBuffer = async ({ buffer, originalName, target }) => {
  const spec = IMAGE_SPECS[target];

  if (!spec) {
    throw new Error('Unsupported upload target');
  }

  await ensureDirectory(spec.directory);

  const fileName = buildFileName(originalName);
  const outputPath = path.join(spec.directory, fileName);

  await sharp(buffer)
    .rotate()
    .resize(spec.width, spec.height, {
      fit: 'contain',
      background: { r: 15, g: 15, b: 15, alpha: 1 },
      withoutEnlargement: true,
    })
    .webp({ quality: 92, effort: 6 })
    .toFile(outputPath);

  return `${spec.publicPath}/${fileName}`;
};

const processUploadedFiles = async ({ files, target }) => {
  return Promise.all(
    files.map((file) =>
      processImageBuffer({
        buffer: file.buffer,
        originalName: file.originalname,
        target,
      })
    )
  );
};

module.exports = {
  processUploadedFiles,
};
