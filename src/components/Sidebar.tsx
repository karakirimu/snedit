import React, { useEffect, useRef } from 'react';
import { Box, VStack, Text, Image, HStack } from "@chakra-ui/react";
import { Button } from './ui/button';
import { handleOpenImageFolder } from '@/functions/fileHandler';
import { FileAttribute } from '@/types/FileAttribute';
import { DndContext, MouseSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SnConfig } from '@/types/SnConfig';
import { Property } from '@/functions/useProperty';
import { SourceMap } from './SettingCard';

interface SidebarProps {
  images: Property<SourceMap[]>;
  selectedIndex: Property<number>;
  config: Property<SnConfig>;
  onClick: (index: number) => void;
  onImageFolderSelect: (files: FileList) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ images, selectedIndex, config, onClick, onImageFolderSelect }) => {
  const selectedImageRef = useRef<HTMLDivElement | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (selectedImageRef.current) {
      selectedImageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedIndex]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (
      active.data.current == null ||
      over == null ||
      over.data.current == null
    ) {
      return;
    }

    if (active.id !== over.id) {
      const im = images.get();
      const oldIndex = im.findIndex((img) => img.src.objectURL === active.id);
      const newIndex = im.findIndex((img) => img.src.objectURL === over.id);

      const reorderedImages = arrayMove(im, oldIndex, newIndex);
      images.set(reorderedImages);

      // Reorder SnConfig.data to match the new image order
      const reorderedData = arrayMove(config.get().playlist, oldIndex, newIndex);
      config.set((prev) => ({ ...prev, playlist: reorderedData }));
      selectedIndex.set(newIndex + 1);
    }
  };

  return (
    <Box as="aside" bg={{ base: "gray.100", _dark: "gray.800" }} borderRight={"1px solid gray.950"} minW="220px" maxW="220px" p={4} minH="calc(100vh - 44px)" maxH="calc(100vh - 44px)" overflowY="auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.get().map((img) => img.src.objectURL)} strategy={verticalListSortingStrategy}>
          <VStack align="start" gap={4}>
            {images.get().length > 0 ? (
              images.get().map((im, index) => (
                <SortableItem
                  key={im.src.objectURL}
                  id={im.src.objectURL}
                  index={index}
                  src={im.src}
                  selectedImageIndex={selectedIndex.get()}
                  onClick={onClick}
                  selectedImageRef={selectedImageRef}
                />
              ))
            ) : (
              <Button variant={"subtle"} onClick={() => handleOpenImageFolder({ onImageFolderSelect })}>Open Image Folder...</Button>
            )}
          </VStack>
        </SortableContext>
      </DndContext>
    </Box>
  );
};

interface SortableItemProps {
  id: string;
  index: number;
  src: FileAttribute;
  selectedImageIndex: number | null;
  onClick: (index: number) => void;
  selectedImageRef: React.RefObject<HTMLDivElement>;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, index, src, selectedImageIndex, onClick, selectedImageRef }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <HStack
      key={index}
      gap={2}
      alignItems={"start"}
      maxW={"100%"}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Text w={`${index.toString().length + 1}ch`}>{index + 1}</Text>
      <Box
        key={index}
        onClick={() => onClick(index + 1)}
        cursor="pointer"
        p={2}
        borderRadius="md"
        maxW={"100%"}
        bg={(selectedImageIndex !== null && index + 1 === selectedImageIndex) ? { base: "gray.200", _dark: "gray.700" } : "transparent"}
        _hover={{ bg: { base: "gray.300", _dark: "gray.600" } }}
        ref={(selectedImageIndex !== null && index + 1 === selectedImageIndex) ? selectedImageRef : null}
      >
        <VStack align="center" gapY={1}>
          <Image key={`thumbnail-${index}`} src={src.objectURL} alt={`image-${index}`} />
          <Text whiteSpace={"pre-wrap"} wordBreak={"break-all"} maxW={"100%"}>{src.name}</Text>
        </VStack>
      </Box>
    </HStack>
  );
};

export default Sidebar;