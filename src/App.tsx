import { HStack } from "@chakra-ui/react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SettingCard, { SourceMap } from "@/components/SettingCard";
import { createSnConfig, exportSnConfig, SnConfig } from './types/SnConfig';
import { useProperty } from './functions/useProperty';
import { decodeBase64, encodeBase64 } from "./functions/base64";
import { v4 } from "uuid";

function App() {
  const images = useProperty<SourceMap[]>([]);
  const musics = useProperty<SourceMap[]>([]);
  const selectedIndex = useProperty<number>(0);
  const imageLastIndex = useProperty<number | null>(null);
  const snConfig = useProperty<SnConfig>(createSnConfig("No Title", "No Description"));
 
  const handleIndexClick = (index: number) => {
    if(index < 1 || index > images.get().length) {
      return;
    }
    selectedIndex.set(index);
  };

  const openImageFolder = async (files: FileList) => {
    if(images.get().length > 0) {
      images.get().forEach((image) => URL.revokeObjectURL(image.src.objectURL));
      images.set([]);
      selectedIndex.set(0);
    }
    
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const imageMap = imageFiles.map(file => {return {id: v4(), data: file}});
    const imageUrls = imageMap.map(file => {
      return { id: file.id, src:{
        name: file.data.name,
        size: file.data.size,
        type: file.data.type,
        path: file.data.webkitRelativePath,
        objectURL: URL.createObjectURL(file.data)
      }
    };
    });

    const snData = await Promise.all(imageMap.map(async (file) => {
      const base64 = await encodeBase64(file.data);
      return { id: file.id, name: file.data.name, data: base64 };
    }));

    snConfig.set((prev) => {
      snData.forEach((sn) => {
        prev.src.image.push(sn)
        // Generate image dependent playlist
        prev.playlist.push({ id: v4(), image_id: sn.id, audio_id: '', text_id: '', config: { caption_position: 'bottom' } });
      });
      return ({...prev })
    });

    if(imageUrls.length > 0) {
      imageLastIndex.set(imageUrls.length);
      images.set(imageUrls);
      selectedIndex.set(1);
    }
  };
  
  const openMusicFolder = async (files: FileList) => {
    if(musics.get().length > 0) {
      musics.get().forEach((music) => URL.revokeObjectURL(music.src.objectURL));
      musics.set([]);
    }

    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
    const audioMap = audioFiles.map(file => {return {id: v4(), data: file}});
    const audioAttributes = audioMap.map(d => {
      return { id: d.id,
                src: {
                name: d.data.name,
                size: d.data.size,
                type: d.data.type,
                path: d.data.webkitRelativePath,
                objectURL: URL.createObjectURL(d.data)
              }
            };
    });

    const snData = await Promise.all(audioMap.map(async (file, index) => {
      const base64 = await encodeBase64(file.data);
      return { id: file.id, name: audioFiles[index].name, data: base64 };
    }));

    snConfig.set((prev) => {
      snData.forEach((sn) => prev.src.audio.push(sn));
      return ({...prev })
    });

    if(audioAttributes.length > 0) {
      musics.set(audioAttributes);
    }
  };

  const exportConfig = () => {
    exportSnConfig(snConfig.get());
  };

  const importConfig = async (configData: SnConfig) => {
    const imageUrls = await Promise.all(configData.src.image.map(async (item) => {
      const blob = decodeBase64(item.data);
      const objectURL = URL.createObjectURL(blob);
      return {
        id: item.id,
        src: {
          name: item.name,
          size: blob.size,
          type: blob.type,
          path: '', // You can set the path if needed
          objectURL
        }
    };
    }));

    const audioUrls = await Promise.all(configData.src.audio.map(async (item) => {
      if(item === undefined) {
        return { id: "", src: {
          name: "Unknown",
          size: 0,
          type: "",
          path: '', // You can set the path if needed
          objectURL: ""
        }};
      }
      const blob = decodeBase64(item.data);
      const objectURL = URL.createObjectURL(blob);
      return {
        id: item.id,
        src:{
            name: item.name,
            size: blob.size,
            type: blob.type,
            path: '', // You can set the path if needed
            objectURL
          }
        };
    }))
  
    snConfig.set((prev) => ({...prev, ...configData}));
  
    if (imageUrls.length > 0) {
      imageLastIndex.set(imageUrls.length);
      images.set(imageUrls);
      musics.set(audioUrls);
      selectedIndex.set(1);
    }
  };

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
      {selectedIndex.get() !== 0 && <SettingCard imageSrc={images.get()} index={selectedIndex.get()} config={snConfig} audioSrc={musics.get()} />}
      </HStack>
    </>
  );
}

export default App;