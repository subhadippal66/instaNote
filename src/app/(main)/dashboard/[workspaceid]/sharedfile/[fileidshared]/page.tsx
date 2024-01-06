import QuillEditor from '@/components/quill-editor/quill-editor'
import { getAllUsersOnFileQuery, getFileData, getSharedFilesOfUser } from '@/lib/supabase/queries'
import { setAllSharedFiles, setSharedUserOnFileReducer } from '@/redux/folderSlice'
import { useAppSelector } from '@/redux/store'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import PageHelp from './pageHelp'


interface FilePageInterface {
    params: any
}

const SharedFilePage:React.FC<FilePageInterface> = async({params}) => {

    const fileID = params.fileidshared
    // const workspaceID = params.workspaceid

    // const {data, error} = await getFileData(fileID)

    return (
      <PageHelp params={params} />
    )

}

export default SharedFilePage