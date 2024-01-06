// 'use client'
import Loader from '@/components/global/loader';
import QuillEditor from '@/components/quill-editor/quill-editor'
import { getSharedFilesOfUser } from '@/lib/supabase/queries';
import { setAllSharedFiles } from '@/redux/folderSlice';
import { useAppSelector } from '@/redux/store';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { v4 } from 'uuid';

interface PageHelpInterface {
    params: any;
}

const PageHelp:React.FC<PageHelpInterface> = ({params}) => {

    // const [isValid, setisValid] = useState(false)

    // const router = useRouter();

    // const dispatch = useDispatch();
    // const currUserDataRedux = useAppSelector((state)=>state.USERSLICEFNReducer)
    // const allSharedFile = useAppSelector((state)=>state.sharedFilesReducer)
   
// fix : getSharedFilesOfUser is getting called 2 times
    

    // const getSharedFiles = async()=>{
        
    //     const res = await getSharedFilesOfUser(currUserDataRedux.id);

    //     dispatch(setAllSharedFiles(res))

    //     if(res.find((d:any)=>d.id == params.fileidshared)){
    //         // console.log('aa gye idhar');
    //         setisValid(true)
    //     }else{
    //         setisValid(false)
    //         router.replace(`/dashboard/${params.workspaceid}`)
    //     }
                
    // }

    // useEffect(()=>{
    //     getSharedFiles()
    // },[])


  return (
    <>
    {/* <div className={isValid?'':'hidden'}> */}
        <QuillEditor 
            dirType='File'
            fileId= {params.fileidshared}
            params={params}
            isSharedFile={true}
            key={v4()}
        />
    {/* </div> */}

    {/* <div className={!isValid?'w-max h-max ml-[50%] ':'hidden'}>
        <Loader />
    </div> */}

    </>
  )
}

export default PageHelp