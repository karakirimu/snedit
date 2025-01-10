import { HStack } from "@chakra-ui/react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SettingCard from "@/components/SettingCard";
import { FileAttribute } from './types/FileAttribute';
import { createSnConfig, exportSnConfig, SnConfig } from './types/SnConfig';
import { useProperty } from './functions/useProperty';

function App() {
  const images = useProperty<FileAttribute[]>([]);
  const musics = useProperty<FileAttribute[]>([]);
  const selectedIndex = useProperty<number>(0);
  const imageLastIndex = useProperty<number | null>(null);
  const selectedImage = useProperty<FileAttribute | null>(null);
  const snConfig = useProperty<SnConfig>(createSnConfig("", "", []));
 
  const handleIndexClick = (index: number) => {
    if(index < 1 || index > images.get().length) {
      return;
    }
    const imageSrc = images.get()[index - 1];
    selectedImage.set(imageSrc);
    selectedIndex.set(index);
  };

  const openImageFolder = (files: FileList) => {
    if(images.get().length > 0) {
      images.get().forEach((image) => URL.revokeObjectURL(image.objectURL));
      images.set([]);
    }
    
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const imageUrls = imageFiles.map(file => {
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        path: file.webkitRelativePath,
        objectURL: URL.createObjectURL(file)
      };
    });

    const snData = imageUrls.map((image, index) => {
      return {
        no: index + 1,
        image: image.path
      };
    });
    snConfig.set((prev) => {
      prev.data = snData;
      return prev;
    });

    if(imageUrls.length > 0) {
      imageLastIndex.set(imageUrls.length);
      images.set(imageUrls);
      selectedImage.set(imageUrls[0]);
      selectedIndex.set(1);
    }
  };
  
  const openMusicFolder = (files: FileList) => {
    if(musics.get().length > 0) {
      musics.get().forEach((music) => URL.revokeObjectURL(music.objectURL));
      musics.set([]);
    }

    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
    const audioAttributes = audioFiles.map(file => {
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        path: file.webkitRelativePath,
        objectURL: URL.createObjectURL(file)
      };
    });

    if(audioAttributes.length > 0) {
      musics.set(audioAttributes);
    }
  };

  const exportConfig = () => {
    exportSnConfig(snConfig.get());
  };

  const importConfig = (config: SnConfig) => {
    snConfig.set(config);
  }

  return (
    <>
      <Header onImageFolderSelect={openImageFolder}
              onMusicFolderSelect={openMusicFolder}
              onExport={exportConfig}
              onImport={importConfig}
              onIndexChange={handleIndexClick}
              config={snConfig}
              selectedIndex={selectedIndex.get()}
              lastImageIndex={imageLastIndex.get()}/>
      <HStack align="start" p={0} m={0} gap={0}>
      <Sidebar images={images} selectedIndex={selectedIndex} config={snConfig} onClick={handleIndexClick} onImageFolderSelect={openImageFolder} />
      {selectedImage.get() && <SettingCard imageSrc={selectedImage.get()!} index={selectedIndex.get()} config={snConfig} audioSrc={musics.get()} />}
      </HStack>
    </>
  );
}

export default App;