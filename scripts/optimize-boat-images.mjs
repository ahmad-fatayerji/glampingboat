import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const groups = [
  {
    sourceDir: path.join("public", "images", "boat"),
    targetWidthFor: (file) => (file.startsWith("plan") ? 1701 : 1920),
    qualityFor: (file) => (file.startsWith("plan") ? 82 : 78),
  },
  {
    sourceDir: path.join("public", "images", "our vision"),
    targetWidthFor: () => 1920,
    qualityFor: () => 78,
  },
];

for (const group of groups) {
  const outputDir = path.join(group.sourceDir, "optimized");
  fs.mkdirSync(outputDir, { recursive: true });

  const files = fs
    .readdirSync(group.sourceDir)
    .filter((file) => file.toLowerCase().endsWith(".png"));

  for (const file of files) {
    const input = path.join(group.sourceDir, file);
    const output = path.join(outputDir, file.replace(/\.png$/i, ".webp"));
    const metadata = await sharp(input).metadata();
    const targetWidth = group.targetWidthFor(file);
    const width = Math.min(metadata.width ?? targetWidth, targetWidth);

    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: group.qualityFor(file), effort: 6 })
      .toFile(output);

    const sizeMb = fs.statSync(output).size / 1024 / 1024;
    console.log(
      `${file} -> ${path.relative(".", output)} ${width}px ${sizeMb.toFixed(2)}MB`
    );
  }
}
