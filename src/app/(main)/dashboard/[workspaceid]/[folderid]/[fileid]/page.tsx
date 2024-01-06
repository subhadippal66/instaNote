import QuillEditor from '@/components/quill-editor/quill-editor'
import { getFileData } from '@/lib/supabase/queries'
import React from 'react'
import { v4 } from 'uuid'

interface FilePageInterface {
    params: any
}

const FilePage:React.FC<FilePageInterface> = async({params}) => {

    const fileID = params.fileid
    const folderID = params.folderid
    const workspaceID = params.workspaceid

    // const {data, error} = await getFileData(fileID)

  return (
    <>
        <QuillEditor 
            dirType='File'
            fileId= {fileID}
            params={params}
            isSharedFile={false}
            key={v4()}
        />
    </>
  )
}

export default FilePage