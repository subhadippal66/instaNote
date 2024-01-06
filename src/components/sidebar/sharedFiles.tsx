'use client'
import { getSharedFilesOfUser } from '@/lib/supabase/queries'
import { setAllSharedFiles } from '@/redux/folderSlice'
import { useAppSelector } from '@/redux/store'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Button } from '../ui/button'
import { File } from '@/lib/supabase/supabase.types'
import { useRouter } from 'next/navigation'


interface SharedFileParams {
  workspaceId:string;
}

const SharedFiles:React.FC<SharedFileParams> = ({workspaceId}) => {
  const router = useRouter();
  const dispatch = useDispatch()
  const currUserDataRedux = useAppSelector((state)=>state.USERSLICEFNReducer)

  const getSharedFiles = async()=>{
    const res = await getSharedFilesOfUser(currUserDataRedux.id);
    if(res?.length>0){
      dispatch(setAllSharedFiles(res))
    }
    // console.log(res)
  }
  
  useEffect(() => {
    getSharedFiles();
  }, [])
  


  const allSharedFiles = useAppSelector((state)=>state.sharedFilesReducer)

  return (
    <div className='pt-4'>
      <div className='flex flex-row justify-between items-center'>
        <div className='text-sm text-blue-400'>SHARED FILES 🤝</div>
        <Button variant={'ghost'} size={'sm'} onClick={()=>{getSharedFiles()}}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </Button>
      </div>
        {allSharedFiles?.length>0? ''
        :
        <div className='text-xs'>Shared files will appear here.</div>
        }

        {allSharedFiles?.length>0 && allSharedFiles.map((d:File)=>{
          // console.log(d)
          return (
            <>
              <div className='cursor-pointer' 
                onClick={()=>{router.replace(`/dashboard/${workspaceId}/sharedfile/${d.id}`)}}
              >{d.iconId} {d.title}</div>
            </>
          )
        })}
    </div>
  )
}

export default SharedFiles