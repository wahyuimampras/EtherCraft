import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '/public/products');
const outputDir = path.join(__dirname, '/public/products/optimized-images');

async function optimizeImages() {
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  const files = await fs.readdir(inputDir);

  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );

  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    try {
      await sharp(inputPath)
        .resize(800)
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      console.log(`Optimized: ${file}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  console.log('All images processed');
}

optimizeImages();
