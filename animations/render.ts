import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';

const main = async () => {
  const entryPoint = path.join(__dirname, 'src/index.ts');

  console.log('📦 Bundling...');
  const bundled = await bundle({
    entryPoint,
  });

  console.log('🎬 Selecting composition...');
  const comp = await selectComposition({
    serveUrl: bundled,
    id: 'SplendorDemo',
  });

  console.log('🎨 Rendering GIF...');
  await renderMedia({
    composition: comp,
    serveUrl: bundled,
    codec: 'gif',
    outputLocation: path.join(__dirname, 'out/splendor-demo.gif'),
    everyNthFrame: 2, // Reduce file size
  });

  console.log('✅ Done! Output: out/splendor-demo.gif');
};

main().catch((err) => {
  console.error('❌ Render failed:', err);
  process.exit(1);
});
