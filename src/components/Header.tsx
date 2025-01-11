import React, { useEffect, useRef } from 'react';
import { Box, HStack, IconButton, Button, Input, Stack } from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { Slider } from "@/components/ui/slider"
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { handleOpenImageFolder, handleOpenMusicFolder } from '@/functions/fileHandler';
import { GoArrowLeft, GoArrowRight } from 'react-icons/go';
import { BiFirstPage, BiLastPage } from 'react-icons/bi';
import { importSnConfig, SnConfig } from '@/types/SnConfig';
import { FaCog } from 'react-icons/fa';
import { Field } from "@/components/ui/field"
import { Property } from '@/functions/useProperty';
import { InfoTip } from "@/components/ui/toggle-tip"

interface HeaderProps {
  onImageFolderSelect: (files: FileList) => void;
  onMusicFolderSelect: (files: FileList) => void;
  onExport: () => void;
  onImport: (config: SnConfig) => void;
  onIndexChange: (index: number) => void;
  config: Property<SnConfig>;
  selectedIndex: number;
  lastImageIndex: number | null;
}

const Header: React.FC<HeaderProps> = ({ onImageFolderSelect, onMusicFolderSelect, onExport, onImport, onIndexChange, config, selectedIndex, lastImageIndex }) => {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedIndex !== null && event.altKey && event.ctrlKey) {
        switch (event.key) {
          case 'ArrowLeft':
            onIndexChange(selectedIndex - 1);
            break;
          case 'ArrowRight':
            onIndexChange(selectedIndex + 1);
            break;
          case 'Home':
            onIndexChange(1);
            break;
          case 'End':
            if (lastImageIndex !== null) {
              onIndexChange(lastImageIndex);
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, lastImageIndex, onIndexChange]);

  const PackageSettingsDialog = () => {
    return (
      <>
        <DialogRoot initialFocusEl={() => ref.current}>
          <DialogTrigger asChild>
            <IconButton variant="outline" size="sm">
              <FaCog />
            </IconButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Package settings</DialogTitle>
            </DialogHeader>
            <DialogBody pb="4">
              <Stack gap="4">
                <Field label="Package name">
                  <Input ref={ref} placeholder="package name here"
                    value={config.get().package_name}
                    onChange={(e) => { config.set({ ...config.get(), package_name: e.target.value }) }} />
                </Field>
                <Field label="Description">
                  <Input placeholder="description"
                    value={config.get().description}
                    onChange={(e) => { config.set({ ...config.get(), description: e.target.value }) }} />
                </Field>
                <Field label={`Text speed: ${config.get().text_speed} (ms)`}>
                  <HStack w={"full"}>
                    <Slider
                      ml={4}
                      w={"full"}
                      step={10}
                      min={0}
                      value={[config.get().text_speed]}
                      max={10000}
                      onValueChange={(e) => { config.set({ ...config.get(), text_speed: e.value[0] })}}/>
                    <InfoTip content="Time interval to display one character (in milliseconds)" />
                  </HStack>
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Close</Button>
              </DialogActionTrigger>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </>
    );
  }

  return (
    <Box as="header" bg={"gray.700"} borderBottom={"1px solid gray.950"} color="white" p={1}>
      <HStack justify="space-between" px={1}>
        <HStack gap={2}>
          <MenuRoot size={"sm"}>
            <MenuTrigger asChild>
              <Button variant="outline" size="sm">
                File
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="import-a" onClick={() => importSnConfig(onImport)}>
                Open Playlist
              </MenuItem>
              <MenuItem value="export-a" onClick={onExport}>
                Save Playlist
              </MenuItem>
            </MenuContent>
          </MenuRoot>
          <MenuRoot size={"sm"}>
            <MenuTrigger asChild>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="open-image-folder-a" onClick={() => handleOpenImageFolder({ onImageFolderSelect })}>
                Open Image Folder...
              </MenuItem>
              <MenuItem value="open-music-folder-a" onClick={() => handleOpenMusicFolder({ onMusicFolderSelect })}>
                Open Music Folder...
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </HStack>
        {(selectedIndex !== 0) && (
          <HStack gap={0}>
            <IconButton onClick={() => onIndexChange(1)} variant="outline" size="sm" title='First image (Ctrl + Alt + Home)'>
              <BiFirstPage />
            </IconButton>
            <IconButton onClick={() => onIndexChange(selectedIndex - 1)} variant="outline" size="sm" title='Previous image (Ctrl + Alt + ←)'>
              <GoArrowLeft />
            </IconButton>
            <Input id='image-index' size="sm" w="6ch" textAlign="center" value={selectedIndex} readOnly />
            <IconButton onClick={() => onIndexChange(selectedIndex + 1)} variant="outline" size="sm" title='Next image (Ctrl + Alt + →)'>
              <GoArrowRight />
            </IconButton>
            <IconButton onClick={() => lastImageIndex && onIndexChange(lastImageIndex)} variant="outline" size="sm" title='Last image (Ctrl + Alt + End)'>
              <BiLastPage />
            </IconButton>
          </HStack>
        )}
        <HStack gap={4}>
          <PackageSettingsDialog />
        </HStack>
      </HStack>
    </Box>
  );
};

export default Header;