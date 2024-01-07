'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import EmojiPicker from '../global/emoji-picker'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { CreateFilesFormSchema, CreateFolderFormSchema } from '@/lib/types'
import { File, Folder } from '@/lib/supabase/supabase.types'
import { v4 } from 'uuid'
import { useToast } from '../ui/use-toast'
import { createFile, createFolder, getDeletedFiledStandlone, getFiles, getFolders, getTotalNoOfFileQuery, getTotalNoOfFolderQuery } from '@/lib/supabase/queries'
import Loader from '../global/loader'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { ScrollArea } from '../ui/scroll-area'
import CreateFile from './createFile'
import FileName from './fileName'
import { usePathname, useRouter } from 'next/navigation';
import { AccordionHeader } from '@radix-ui/react-accordion'
import { useDispatch } from 'react-redux'
import { AppDispatch, useAppSelector } from '@/redux/store'
import { setAllDeletedFiles, setAllFilesReducer, setAllFoldersReducer, setIsLoadingReducer } from '@/redux/folderSlice'
import { setIsDrawerOpenRedux } from '@/redux/userSlice'



interface FolderProps {
    workspaceID : string;
}

const Folders: React.FC<FolderProps> = ({workspaceID}) => {

    const router = useRouter();

    // states
    const [selectedEmojiFolder, setSelectedEmojiFolder] = useState('📁');
    const [selectedEmojiFile, setSelectedEmojiFile] = useState('📝');

    const [isloading, setIsloading] = useState(false);
    const [isloadingFiles, setIsloadingFiles] = useState(false);

    const [allFolders, setAllFolders] = useState<any>(null); //Handled by Redux
    const [allFiles, setAllFiles] = useState<any>({});


    const { toast } = useToast()

    // Redux
    const dispatch = useDispatch<AppDispatch>()
    // trash handler
    let inTrash = useAppSelector((state)=>state.IN_TRASH_FNReducer)
    // console.log(inTrash)

    // redux
    const allfoldersDataRedux = useAppSelector((state)=>state.ALLfoldersFNReducer)
    const allFilesDataRedux = useAppSelector((state)=>state.ALLfilesFNReducer)

    const alllDelFiles = useAppSelector((state)=>state.deletedFilesReducer)

    const currUser = useAppSelector((state)=>state.USERSLICEFNReducer)

    // create folders
    const {register, handleSubmit, reset, formState:{isSubmitting:isLoading,errors}} = 
        useForm<z.infer<typeof CreateFolderFormSchema>>(
        {
            mode:'onChange', defaultValues:{
                logo:'',
                folderName: '',
            }
        }
    )

    const [folderCount, setFolderCount] = useState<number|null>(null)
    const onSubmit: SubmitHandler<
        z.infer<typeof CreateFolderFormSchema>
        > = async(value) =>{

            // subscription check
            if(currUser?.subscription==null){

                const n = await getTotalNoOfFolderQuery(workspaceID)
                console.log('subscription check')
                if(n){
                    console.log(n[0]?.value)
                    if(n[0]?.value>=5){
                        toast({
                            title: 'Upgrade to pro ❗',
                            description: `Cannot create more than 5 folders in a workspace on free plan.`,
                        });
                        return; 
                    }
                }
            }

        const folderId = v4();

        setIsloading(true)
        
        dispatch(setIsLoadingReducer(true))

        try{
            const newFolder : Folder = {
                id: folderId,
                bannerUrl: null,
                createdAt: new Date().toISOString(),
                iconId: selectedEmojiFolder,
                inTrash: '',
                data:'',
                title: value.folderName,
                workspaceId: workspaceID
            }

            console.log(newFolder)

            const {data, error} = await createFolder(newFolder);

            console.log(data)

            if(data == 'success'){
                toast({
                    title: 'Folder Created 🎉',
                    description: `${selectedEmojiFolder + " " + value.folderName} has been created successfully.`,
                });

                let allFolderArray = allfoldersDataRedux;
                allFolderArray.unshift(newFolder);
                setAllFolders(allFolderArray);
                // reducer
                dispatch(setAllFoldersReducer(allFolderArray))
            }

            reset()
            setIsloading(false)
            dispatch(setIsLoadingReducer(false))
            

        }catch(error){
            toast({
                title: 'Error ❌',
                description: `Try again later`,
            });
            setIsloading(false)
            dispatch(setIsLoadingReducer(false))
            reset()
        }
    }


    // get all folders
    useEffect(()=>{

        const getFolder = async (workspaceID:string) => {

            dispatch(setIsLoadingReducer(true))

            const {data:dataFolder,error:errorFolder} = await getFolders(workspaceID , inTrash);

            setAllFolders(dataFolder);

            // reducer
            dispatch(setIsLoadingReducer(false))
            dispatch(setAllFoldersReducer(dataFolder))

            // console.log(dataFolder)
            
        }

        getFolder(workspaceID);

    },[workspaceID])


    // create new file 
    const {register:registerFiles, handleSubmit:handleSubmitFiles, reset:resetFiles, formState:{isSubmitting:isloadingFile ,errors:errorsFiles}} = 
        useForm<z.infer<typeof CreateFilesFormSchema>>(
        {
            mode:'onChange', defaultValues:{
                logo:'',
                fileName: '',
            }
        }
    )

    const onSubmitNewFile: SubmitHandler<z.infer<typeof CreateFilesFormSchema>> = 
        async(value)=>{


            // subscription check and limit
            if(currUser?.subscription==null){

                const n = await getTotalNoOfFileQuery(workspaceID)
                console.log('subscription check files')
                if(n){
                    // console.log(n[0]?.value)
                    if(n[0]?.value>=50){
                        toast({
                            title: 'Upgrade to pro ❗',
                            description: `Cannot create more than 50 pages in a workspace on free plan.`,
                        });
                        return; 
                    }
                }
            }

            const fileID = v4();

            
            // return;
            setIsloadingFiles(true)
            
            try{
                const newFile:File = {
                    id: fileID,
                    folderId: value.hiddenFolderId,
                    bannerUrl: null,
                    createdAt: new Date().toISOString(),
                    iconId: selectedEmojiFile,
                    inTrash: '',
                    title: value.fileName,
                    data: '',
                    workspaceId: workspaceID
                }

                

                const {data, error} = await createFile(newFile)

                console.log(data, error)

                if(data=='success'){
                    toast({
                        title: 'New File Created 🎉',
                        description: `${selectedEmojiFile + " " + value.fileName} has been created successfully.`,
                    });

                    // add file to state
                    let tempAllFiles = JSON.parse(JSON.stringify(allFilesDataRedux))
                    tempAllFiles[value.hiddenFolderId].unshift(newFile)
                    // redux state
                    dispatch(setAllFilesReducer(tempAllFiles))
                    setAllFiles(tempAllFiles)
                }
                setIsloadingFiles(false)
                resetFiles()
            }
            catch(error){
                // toast({
                //     title: 'Error creating file ❌',
                //     description: `Try again later.`,
                // });
                setIsloadingFiles(false)
                resetFiles()
            }
        }


    // get files
    const [currFolderExp, setCurrFolderExp] = useState('')

    useEffect(()=>{
        const getFilesOfId =async (folderId:string) => {

            setIsloadingFiles(true)
            if(allFilesDataRedux[folderId]){
                console.log("Already exist")
                // console.log(allFiles)
            }
            else if(currFolderExp.length>1){
                const {data, error} = await getFiles(folderId)
                let allfile_ = JSON.parse(JSON.stringify(allFilesDataRedux))
                allfile_[folderId] = data;
                dispatch(setAllFilesReducer(allfile_))
                setAllFiles(allfile_)
                console.log('DB runs')

                // console.log('---allFiles redux---')
                // console.log(allFiles)
                // console.log('---allFiles redux---')
                // redux state
            }
            setIsloadingFiles(false)
        }

        getFilesOfId(currFolderExp)
    }, [currFolderExp])


    // go to folder
    
    const screenWidth = useAppSelector((state)=>state.SCREENWIDTHReducer)
    const gotoFolder = (folderID:string) =>{
        if(screenWidth<700){
            dispatch(setIsDrawerOpenRedux(false))
        }
        setCurrFolderExp(folderID)
        router.replace(`/dashboard/${workspaceID}/${folderID}`)
    }

    


    // getDeleted files
    const getDelFiles =async () => {

        const res = await getDeletedFiledStandlone(workspaceID)
        console.log(res)

        dispatch(setAllDeletedFiles(res))

    }

    useEffect(()=>{
        if(alllDelFiles.length>0){
            return;
        }
        getDelFiles()
    },[])
    

    // console.log(allFilesDataRedux)

return (
<div className=''>
    {inTrash ? <></> :
    <div className='pt-4 h-[10%]'>
    <Dialog>
        <DialogTrigger asChild>
            <Button size={'sm'} className='py-0' variant="outline">Create new folder ➕</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                    <DialogTitle>Create new folder</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="folderName" className="text-right">
                        Folder name
                    </Label>
                    
                    <Input id="folderName" className="col-span-3"
                        disabled={isloading}
                        {...register('folderName',{
                            required: 'Folder name is rquired'
                        })}
                    />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="" className="text-left">
                            Pick an icon
                        </Label>
                        {/* <div className='p-2 border'> */}
                            <EmojiPicker getValue={(emoji)=>{setSelectedEmojiFolder(emoji)}}>
                                {selectedEmojiFolder}
                            </EmojiPicker>
                        {/* </div> */}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                    <Button type="submit" className='text-sm' size={'sm'} disabled={isloading}>{!isLoading ? 'Create Folder 📁' : <Loader />}</Button>
                    </DialogClose>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </div>
    }


    {inTrash ? <div className='text-sm text-red-400 pt-4'>TRASH</div> :
        <div className='text-sm text-blue-400 pt-4'>MY FOLDERS</div>
    }


    <div className='pt-4'>
        <Accordion type="multiple" className="w-full">
            {/* defaultValue is Value of AccordionItem */}
        <ScrollArea className='h-[30vh] px-2'>


        {allfoldersDataRedux != null ? 
            allfoldersDataRedux
            .filter((f:Folder)=>{
                if(inTrash){
                    return f.inTrash == '1';
                }
                else{
                    return f.inTrash == '';
                }
            })
            .map((folderdata:Folder, index:number)=>{
            // console.log(data)
            
            return (<>
                <AccordionItem className='border-none' value={folderdata?.id}>
                    <div className='flex flex-row  hover:bg-slate-700 transition-all cursor-pointer'
                        
                    >
                        <div className='no-underline  flex flex-row justify-between py-1 px-0 w-full text-left' 
                            onClick={()=> gotoFolder(folderdata?.id)}
                        >
                            {/* <AccordionTrigger
                                className='flex flex-row justify-between py-1 px-0 no-underline data-[state=open]:hidden'
                                // onClick={()=> gotoFolder(folderdata?.id)}
                                > */}
                                    {folderdata?.iconId} {folderdata?.title}
                            {/* </AccordionTrigger>
                            <AccordionHeader
                                className='flex flex-row justify-between py-1 px-0 no-underline data-[state=closed]:hidden'
                                // onClick={()=> gotoFolder(folderdata?.id)}
                                >
                                    {folderdata?.iconId} {folderdata?.title}
                            </AccordionHeader> */}
                        </div>
                        <div className='px-2 flex items-center justify-center'>
                            <AccordionTrigger 
                                onClick={()=> setCurrFolderExp(folderdata?.id)} 
                                className='py-1 px-0 data-[state=open]:hidden'
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </AccordionTrigger>
                            <AccordionTrigger
                                onClick={()=> setCurrFolderExp(folderdata?.id)} 
                                className='py-1 px-0 data-[state=closed]:hidden'
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>

                            </AccordionTrigger>
                        </div>
                    </div>
                    <AccordionContent className='pt-0 px-2 pb-4'>

                        {/* create new file */}
                        {inTrash ? <></> : 
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className='px-2 py-3 mt-0 h-0 text-cyan-300 transition-all' variant="ghost">New page +</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <CreateFile
                                    workspaceId={workspaceID}
                                    folderId = {folderdata?.id}
                                    folderName = {folderdata?.title}
                                    isLoadingFiles = {isloadingFiles}
                                    setIsLoadingFiles = {setIsloadingFiles}
                                    handleSubmitFiles = {handleSubmitFiles}
                                    registerFiles = {registerFiles}
                                    selectedEmojiFile = {selectedEmojiFile}
                                    setSelectedEmojiFile = {setSelectedEmojiFile}
                                    onSubmitNewFile = {onSubmitNewFile}
                                />
                                
                            </DialogContent>
                        </Dialog>
                        }   

                        {/* all files render */}
                        {
                        allFilesDataRedux ?
                        allFilesDataRedux[folderdata?.id]?.map((file:File)=>{
                            if(!inTrash && file.inTrash=='1') return (<></>)
                            return(<>
                                <FileName
                                    title={file.title} 
                                    logo={file.iconId}
                                    fileId = {file.id}
                                    folderId = {file.folderId}
                                    workspaceId = {workspaceID}
                                    data={file.data}

                                />
                            </>)

                        })
                        : <Loader />
                        }

                    </AccordionContent>
                </AccordionItem>
                </>
            )


        }) : <Loader />
        }

        {
            // inTrash && alllDelFiles.length>0 ?
            // <p className='text-sm p-2 text-red-500'>All deleted files</p> : <></>
        }


        {
            inTrash && alllDelFiles.map((file:File)=>{
                return(<>
                    <FileName
                        title={file.title} 
                        logo={file.iconId}
                        fileId = {file.id}
                        folderId = {file.folderId}
                        workspaceId = {workspaceID}
                        data={file.data}

                    />
                </>)
            })
        }


        {allfoldersDataRedux?.length == 0 && !inTrash ? 
        <div className='text-sm text-opacity-20'>
            create your first folder to get started 🚀
        </div> : <></>}
        {alllDelFiles?.length == 0 && inTrash ? 
        <div className='text-sm text-opacity-20'>
            Nothing in trash
        </div> : <></>}

        </ScrollArea>
        </Accordion>


        <div className='shadow shadow-gray-600 w-full h-[1px]'></div>
    </div>

    
</div>
)
}

export default Folders