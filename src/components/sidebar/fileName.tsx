import React from 'react'
import { useRouter } from 'next/navigation';

interface FileNameProps {
    title:string;
    logo:any;
    fileId:string;
    folderId:string|null;
    workspaceId:string;
    data:any;
}

const FileName:React.FC<FileNameProps> = ({title,logo,workspaceId,fileId,folderId}) => {

    const router = useRouter();

  return (
    <div>
        <div
        className='cursor-pointer'
        onClick={()=>{router.replace(`/dashboard/${workspaceId}/${folderId}/${fileId}`)}}>
            {logo} {title}
        </div>
    </div>
  )
}

export default FileName