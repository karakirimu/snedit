import { HStack, IconButton, Text } from '@chakra-ui/react';
import { Slider } from "@/components/ui/slider"
import { useAudio } from 'react-use';
import { IoMdPause, IoMdPlay } from 'react-icons/io';

type AudioPlayerProps = {
    fileUrl: string;
    autoPlay?: boolean;
}

const AudioPlayer : React.FC<AudioPlayerProps> = ({fileUrl, autoPlay}) => {
    const [audio, state, controls] = useAudio({
        src: fileUrl,
        autoPlay: autoPlay || false,
      });

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <HStack w={"full"} gap={0} borderRadius="lg">
            {audio}
            {state.playing ? 
                <IconButton variant={"outline"} onClick={controls.pause}><IoMdPause/></IconButton>
                 : <IconButton variant={"outline"} onClick={controls.play}><IoMdPlay/></IconButton>}
            <Slider
                ml={4}
                w={"full"}
                value={[state.time || 0]}
                max={state.duration || 0}
                onValueChange={(e) => {
                    controls.seek(e.value[0])
                }}
                onMouseUp={(e) => {
                    if(e.buttons === 1 && !state.playing) {
                        controls.play();
                    }
                }}/>
            <Text textAlign="right" minW={"12ch"} mx={2}>{formatTime(state.time || 0)} / {formatTime(state.duration || 0)}</Text>
        </HStack>
    );
};

export default AudioPlayer;
