import React from 'react'
import { z } from 'zod';

interface FoldersListProps {
    workspaceID: string;
}

const FoldersList:React.FC<FoldersListProps>  = ({workspaceID}) => {

  return (
    <div className='pt-4'>
        <div>All Folders</div>
    </div>
  )
}

export default FoldersList