import { FileAttribute } from '@/types/FileAttribute';
import { Box, Card, Input, createListCollection, Textarea, Flex, Stack, IconButton } from '@chakra-ui/react';
import React, { useRef, useEffect, useCallback } from 'react';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import CaptionCard, { CaptionCardHandle } from './CaptionCard';
import { SnConfig } from '@/types/SnConfig';
import { Property } from '@/functions/useProperty';
import AudioPlayer from './AudioPlayer';
import { Field } from "@/components/ui/field"
import { MdReplay } from 'react-icons/md';

type SettingCardProps = {
  imageSrc: FileAttribute;
  audioSrc: FileAttribute[];
  index: number|null;
  config: Property<SnConfig>;
}

const SettingCard: React.FC<SettingCardProps> = ({ imageSrc, index, config, audioSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataIndex = index !== null ? index - 1 : -1;
  const audioPath = dataIndex !== -1 && config.get().data[dataIndex].audio !== undefined ? [config.get().data[dataIndex].audio!] : ["None"];
  const audioList = createListCollection({
     items: audioSrc,
     itemToString: (item) => item.path,
     itemToValue: (item) => item.path
  });
  const captionCardRef = useRef<CaptionCardHandle>(null);

  const handleReplay = () => {
      captionCardRef.current?.replay();
  };

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (canvas && context && imageSrc) {
      const image = new Image();
      image.src = imageSrc.objectURL;
      image.onload = () => {
        const maxWidth = window.innerWidth - 200; // Adjust for sidebar width
        const maxHeight = window.innerHeight - 40; // Adjust for header height
        let width = image.width;
        let height = image.height;

        // Scale image to fit within the canvas
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const scale = Math.min(widthRatio, heightRatio);
          width *= scale;
          height *= scale;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
      };
    }

  }, [imageSrc]);

  useEffect(() => {
    drawImage();
    window.addEventListener('resize', drawImage);
    return () => {
      window.removeEventListener('resize', drawImage);
    };
  }, [drawImage]);

  return (
    <Box alignItems="center" justifyContent="center" w={"100%"} height="calc(100vh - 40px)" p={4}>
      <Card.Root flexDirection="row" overflow="hidden" w={"100%"} h={"100%"} p={0}>
        <Flex w={"100%"} maxH={"100%"} alignContent={"center"} justifyContent={"center"} alignItems={"center"} direction={"column"}>
            <canvas ref={canvasRef} style={{ border: '0px solid black', maxWidth: '100%', objectFit: "contain" }} />
            <CaptionCard ref={captionCardRef}
                         caption={dataIndex !== -1 && config.get().data[dataIndex].text !== undefined ? config.get().data[dataIndex].text : ""}
                         w={"full"}
                         mt={2}
                         speed={config.get().text_speed} />
        </Flex>
        <Box w={"100%"}>
          <Card.Body h={"100%"}>
            <Card.Title mx={4} mb={2}>{`No. ${index} -Bind settings`}</Card.Title>
            <Card.Description h={"100%"} overflowY="auto">
              <Stack gap="4" mx={4}>
                <Field label="Image">
                  <Input id='image-path' 
                          type="text"
                          placeholder="image path"
                          size="md"
                          value={dataIndex !== -1 && config.get().data[dataIndex].image !== undefined ? config.get().data[dataIndex].image : ""}
                          defaultValue={""} readOnly disabled/>
                </Field>
                <Field label="Music">
                  <SelectRoot key={"music-select"}
                              size={"md"}
                              collection={audioList}
                              value={audioPath}
                              onValueChange={(e) => {  
                                if(dataIndex !== -1) {
                                  config.set((prev) => {
                                    const n = prev.data[dataIndex];
                                    n.audio = e.items[0].path;
                                    prev.editElement(index!, n);
                                    return {...prev};
                                  });
                                }
                              }}>
                    <SelectTrigger>
                      <SelectValueText placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioList.items.map((file) => (
                        <SelectItem area-labelledby={`music-${file.path}`} item={file.path} key={file.path}>
                          {file.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  {(audioPath[0] !== "None") ? <AudioPlayer fileUrl={audioSrc.find((f) => f.path === audioPath[0])!.objectURL} /> : <></>}
                </Field>
                <Field label="Caption">
                  <Box w={"full"} display={"flex"} justifyContent={"flex-end"}>
                    <IconButton variant={"outline"} onClick={handleReplay}>
                      <MdReplay />
                    </IconButton>
                  </Box>
                  <Textarea
                    resize="vertical"
                    id='caption-text'
                    h={"300px"}
                    placeholder="Caption here..."
                    value={dataIndex !== -1 && config.get().data[dataIndex].text !== undefined ? config.get().data[dataIndex].text : ""}
                    onChange={(e) => dataIndex !== -1 
                      && config.set((prev) => {
                        const n = prev.data[dataIndex];
                        n.text = e.target.value;
                        prev.editElement(index!, n);
                      return {...prev};
                    })}
                  />
                </Field>
              </Stack>
            </Card.Description>
          </Card.Body>
          <Card.Footer></Card.Footer>
        </Box>
      </Card.Root>
    </Box>
  );
};

export default SettingCard;