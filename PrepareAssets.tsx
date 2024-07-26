import {
  copyFileAssets,
  exists,
  unlink,
  readDir,
} from '@dr.pogodin/react-native-fs';
import {resolveAssetsPath} from '@dr.pogodin/react-native-static-server';
import {Platform} from 'react-native';

async function logFolderStructure(
  path: string,
  prefix: string = '',
): Promise<void> {
  try {
    const items = await readDir(path);
    for (const item of items) {
      console.log(`${prefix}${item.name}`);
      if (item.isDirectory()) {
        await logFolderStructure(`${path}/${item.name}`, `${prefix}  `);
      }
    }
  } catch (error) {
    console.log(`Error reading folder structure at ${path}: ${error}`);
  }
}

export async function prepareAssetsForStaticServer() {
  if (Platform.OS !== 'android') {
    return;
  }

  const targetwebPathOnDevice = resolveAssetsPath('web');
  const sourcewebPath = 'web'; // Path within the assets folder

  console.log('Source folder structure:');
  await logFolderStructure(sourcewebPath);

  const alreadyExtracted = await exists(targetwebPathOnDevice);

  if (alreadyExtracted) {
    console.log("Remove existing assets from the device's file system");
    await unlink(targetwebPathOnDevice);
  }

  // console.log("Copy assets to the device's file system");
  // console.log('Path to copy assets to:', targetwebPathOnDevice);

  await copyFileAssets('web', targetwebPathOnDevice);
}

//   console.log('Destination folder structure:');
//   await logFolderStructure(targetwebPathOnDevice);
