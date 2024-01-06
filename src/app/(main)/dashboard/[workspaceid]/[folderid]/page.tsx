import QuillEditor from '@/components/quill-editor/quill-editor';
import { getFolderData } from '@/lib/supabase/queries';
import React from 'react'
import { v4 } from 'uuid';


interface FolderPageProps {
    params : any;
}

const FolderPage:React.FC<FolderPageProps> = async({params}) => {

    const folderId = params.folderid
    // const {data, error} = await getFolderData(folderId)



  return (
    <>
        {/* <div>{JSON.stringify(data)}</div> */}
        <QuillEditor 
            dirType='Folder'
            fileId= {folderId}
            params={params}
            isSharedFile={false}
            key={v4()}
        />
    </>
  )
}

export default FolderPage