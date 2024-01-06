import React from "react";
import { DialogClose, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import EmojiPicker from "../global/emoji-picker";
import { Button } from "../ui/button";
import Loader from "../global/loader";

interface CreateFileProps {
    workspaceId:string;
    folderId: string;
    folderName: string;
    handleSubmitFiles: any;
    isLoadingFiles: boolean;
    setIsLoadingFiles: any;
    registerFiles: any;
    selectedEmojiFile: any;
    setSelectedEmojiFile: any;
    onSubmitNewFile: any
}

const CreateFile:React.FC<CreateFileProps> = ({
    workspaceId,folderId,folderName, handleSubmitFiles,
    isLoadingFiles,onSubmitNewFile,registerFiles,selectedEmojiFile,
    setIsLoadingFiles,setSelectedEmojiFile
}) => {
  return (
    <div>
      <form onSubmit={handleSubmitFiles(onSubmitNewFile)}>
        <DialogHeader>
          <DialogTitle>
            Create new page in <u>{folderName}</u> 📝
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fileName" className="text-right">
              Page name
            </Label>

            <Input
              id="fileName"
              className="col-span-3"
              disabled={isLoadingFiles}
              {...registerFiles("fileName", {
                required: "Page name is rquired",
              })}
            />

            <Input
              className=""
              id="folderID"
              value={folderId}
              placeholder={folderId}
              {...registerFiles("hiddenFolderId", { value: folderId })}
              type="hidden"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="" className="text-left">
              Pick an icon
            </Label>
            {/* <div className='p-2 border'> */}
            <EmojiPicker
              getValue={(emoji) => {
                setSelectedEmojiFile(emoji);
              }}
            >
              {selectedEmojiFile}
            </EmojiPicker>
            {/* </div> */}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" variant="outline" disabled={isLoadingFiles}>
              {!isLoadingFiles ? "Create Page 📄" : <Loader />}
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </div>
  );
};

export default CreateFile;
