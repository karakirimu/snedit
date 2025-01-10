
export const handleOpenImageFolder = (props : { onImageFolderSelect: (files: FileList) => void;}) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        props.onImageFolderSelect(files);
      }
    };
    input.click();
  };

  export const handleOpenMusicFolder = (props : { onMusicFolderSelect: (files: FileList) => void;}) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        props.onMusicFolderSelect(files);
      }
    };
    input.click();
  };