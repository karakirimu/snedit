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
import { Property, useProperty } from '@/functions/useProperty';
import AudioPlayer from './AudioPlayer';
import { Field } from "@/components/ui/field"
import { MdReplay } from 'react-icons/md';
import { v4 } from 'uuid';

export type SourceMap = {
  id: string;
  src: FileAttribute;
}

type SettingCardProps = {
  imageSrc: SourceMap[];
  audioSrc: SourceMap[];
  index: number;
  config: Property<SnConfig>;
}

const SettingCard: React.FC<SettingCardProps> = ({ imageSrc, index, config, audioSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataIndex = index - 1;
  const selected = dataIndex !== -1 && config ? config.get().getSource(dataIndex) : undefined;
  const selectedAudio = useProperty<string[]>(selected && selected.audio ? [selected.audio.name] : ["None"]);
  const audioList = createListCollection({
     items: audioSrc,
     itemToString: (item) => item.src.name,
     itemToValue: (item) => item.id
  });
  const captionCardRef = useRef<CaptionCardHandle>(null);

  const handleReplay = () => {
      captionCardRef.current?.replay();
  };

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (canvas && context && imageSrc && dataIndex !== -1) {
      const image = new Image();
      image.src = imageSrc[dataIndex].src.objectURL;
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

  }, [dataIndex, imageSrc]);

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
                         caption={dataIndex !== -1 && selected && selected.text !== undefined ? selected.text.data : ""}
                         w={"full"}
                         mt={2}
                         speed={config.get().player.text_speed} />
        </Flex>
        <Box w={"100%"}>
          <Card.Body h={"100%"}>
            <Card.Title mx={4} mb={2}>{`No. ${index} -Bind settings`}</Card.Title>
            <Card.Description h={"100%"} overflowY="auto">
              <Stack gap="4" mx={4}>
                <Field label="Image">
                  <Input id='image-name' 
                          type="text"
                          placeholder="image name"
                          size="md"
                          value={dataIndex !== -1 && selected && selected.image !== undefined ? selected.image.name : ""}
                          defaultValue={""} readOnly disabled/>
                </Field>
                <Field label="Music">
                  <SelectRoot key={"music-select"}
                              size={"md"}
                              collection={audioList}
                              value={selectedAudio.get()}
                              onValueChange={(e) => {  
                                if(dataIndex !== -1) {
                                  config.set((prev) => {
                                    const n = prev.playlist[dataIndex];
                                    const contains = prev.src.audio.findIndex((f) => f.id === e.items[0].id);
                                    if(contains !== -1) {
                                      n.audio_id = prev.src.audio[contains].id;
                                      prev.edit(dataIndex, n);
                                      selectedAudio.set(e.value);
                                    }
                                    return {...prev};
                                  });
                                }
                              }}>
                    <SelectTrigger>
                      <SelectValueText placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioList.items.map((file) => (
                        <SelectItem area-labelledby={`music-${file.id}`} item={file} key={file.id}>
                          {file.src.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  {(selected !== undefined && selected.audio) ? <AudioPlayer fileUrl={audioSrc.find((f) => f.id === selected.audio?.id)!.src.objectURL} /> : <></>}
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
                    value={dataIndex !== -1 && selected && selected.text !== undefined ? selected.text.data : ""}
                    onChange={(e) => dataIndex !== -1 
                      && config.set((prev) => {
                        const n = prev.playlist[dataIndex];
                        if(n.text_id === "" || n.text_id === undefined){
                          n.text_id = v4();
                          prev.src.text.push({ id: n.text_id, name: "", data: e.target.value });
                        }else{
                          prev.src.text.find((t) => t.id === n.text_id)!.data = e.target.value;
                        }
                        prev.edit(dataIndex, n);
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