'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import 'quill/dist/quill.snow.css'
import { Button } from '../ui/button';
import { useAppSelector } from '@/redux/store';
import { File, FileShared, Folder } from '@/lib/supabase/supabase.types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ISDRAWEROPEN, setIsDrawerOpenRedux, setScreenWidthRedux } from '@/redux/userSlice';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useForm,SubmitHandler } from 'react-hook-form';
import { ShareUserOnFileSchema } from '@/lib/types';
import { string, z } from 'zod';
import { addSharedUserOnFile, deleteFileForever, deleteFileTemp, getAllUsersOnFileQuery, getFileData, getFiles, getFolderData, getFolders, getSharedFilesOfUser, getSharedUser, removeSharedUserQuery, restoreFile, saveFileData, saveFolderData } from '@/lib/supabase/queries';
import { setAllDeletedFiles, setAllFilesReducer, setAllSharedFiles, setIsLoadingReducer, setSharedUserOnFileReducer } from '@/redux/folderSlice';
import { v4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/providers/socket-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useToast } from '../ui/use-toast';


interface QuillEditorProps {
    dirType : 'File' | 'Folder';
    fileId : string;
    params: any;
    isSharedFile: boolean;
}

var TOOLBAR_OPTIONS = [
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    ['blockquote', 'code-block'],
  
    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
    [{ direction: 'rtl' }], // text direction
  
    [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
    // [{ size: ['20px', '24px', '36px'] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
  
    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],
  
    ['clean'], // remove formatting button
];

const QuillEditor:React.FC<QuillEditorProps> = ({dirType, fileId, params,isSharedFile}) => {

    const dispatch = useDispatch()
    // sidebar state manager
    try{
        const screenWidth:number = useRef(window.innerWidth).current
        dispatch(setScreenWidthRedux(screenWidth))
    }catch(e){}
    const sw = useAppSelector((state)=>state.SCREENWIDTHReducer)
    useEffect(()=>{
        if(sw<700){
        dispatch(setIsDrawerOpenRedux(false))
        }
    },[params?.folderid])

    const [quill, setQuill] = useState<any>(null)
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const workspaceid = params.workspaceid;
    const folderid = params.folderid;
    const router = useRouter()

    const { toast } = useToast()

    const [deleteclicked, setdeleteclicked] = useState(1)

    const supabase = createClientComponentClient();

    // socket
    const {socket, isConnected} = useSocket();

    // is file shared valid
    // const allSharedFiles = useAppSelector((state)=>state.sharedFilesReducer)
    // if(isSharedFile){
    //     console.log(allSharedFiles)
    //     const isSharedValid = allSharedFiles.find((e:any)=>(e.id==fileId))
    //     if(!isSharedValid){
    //         route.replace(`/dashboard/${workspaceid}`)
    //     }
    // }


    // const details = useMemo(()=>{
    //     let AllDetails:any = {}
    //     if(dirType === 'Folder'){
    //         AllDetails['title'] = dirDetails[0]?.title;
    //         AllDetails['data'] = dirDetails[0]?.data;
    //         AllDetails['id'] = dirDetails[0]?.id;
    //         AllDetails['iconId'] = dirDetails[0]?.iconId;
    //         AllDetails['inTrash'] = dirDetails[0]?.inTrash;
    //         AllDetails['createdAt'] = dirDetails[0]?.createdAt;
    //         AllDetails['workspaceId'] = dirDetails[0]?.workspaceId;
    //         AllDetails['folderId'] = null;
    //     }
    //     if(dirType === 'File'){
    //         AllDetails['title'] = dirDetails[0]?.title;
    //         AllDetails['data'] = dirDetails[0]?.data;
    //         AllDetails['id'] = dirDetails[0]?.id;
    //         AllDetails['iconId'] = dirDetails[0]?.iconId;
    //         AllDetails['inTrash'] = dirDetails[0]?.inTrash;
    //         AllDetails['createdAt'] = dirDetails[0]?.createdAt;
    //         AllDetails['workspaceId'] = dirDetails[0]?.workspaceId;
    //         AllDetails['folderId'] = dirDetails[0]?.folderId;
    //     }

    //     return {
    //         title : AllDetails['title'],
    //         data : AllDetails['data'],
    //         id: AllDetails['id'],
    //         icon: AllDetails['iconId'],
    //         intrash: AllDetails['inTrash'],
    //         createdAt: AllDetails['createdAt'],
    //         workspaceId: AllDetails['workspaceId'],
    //         folderIdforFile: AllDetails['folderId'],
    //     }
    // }, [folderid])

    // to store current data
    const [details, setDetails] = useState({
        title:'',
        data:'',
        id:'',
        icon:'',
        intrash:null,
        createdAt:'',
        workspaceId:'',
        folderIdforFile:null
    })

    // cursors state
    const [collaborators, setCollaborators] = useState<
        {id:string; email:string; avatarUrl:string}[]
        >([
            {id:'123123123', email:'subhadip@gmail.com', avatarUrl:'123'}
    ])

    const [localCursors, setLocalCursors] = useState<any>([])



    const wrapperRef = useCallback(async(wrapper:any)=>{
        if(typeof window !== 'undefined'){
            if(wrapper === null) return ;
            wrapper.innerHTML = ''
            const editor = document.createElement('div')
            wrapper.append(editor)
            const Quill = (await import('quill')).default; 
            // WIP cursor
            const QuillCursors = (await import('quill-cursors')).default;
            Quill.register('modules/cursors', QuillCursors);

            const q = new Quill(editor,{
                theme:'snow',
                modules:{
                    toolbar: TOOLBAR_OPTIONS,
                    // cursors
                    cursors: {
                        transformOnTextChange: true,
                    }

                }
            });
            // console.log('QUILL ----')
            setQuill(q)

            // console.log(q)
            // console.log('QUILL ----')
        }
    }, [])


    // upload banner
    const uploadBanner = ()=>{
        alert('coming soon 🚀');
    }

    // edit file folder name
    const editFileFolderName = (type:'File'|'Folder')=>{
        alert(`${type} coming soon 🚀`);
    }
    
    
    // Redux Data
    const {iconId:currIconIdWorkspace, title:currTitleWorkspace} = useAppSelector((state)=>state.CURRworkspaceFNReducer)
    const allfoldersDataRedux = useAppSelector((state)=>state.ALLfoldersFNReducer)
    const allfileDataRedux = useAppSelector((state)=>state.ALLfilesFNReducer)
    const currUserDataRedux = useAppSelector((state)=>state.USERSLICEFNReducer)
    const alllDelFiles = useAppSelector((state)=>state.deletedFilesReducer)

    // Sidebar state
    try{
        const scW = useRef(window.innerWidth).current
        dispatch(setScreenWidthRedux(scW))
    }catch(e){}
    const drawerState = useAppSelector((state)=>state.ISDRAWEROPENReducer)
    const screenWidth = useAppSelector((state)=>state.SCREENWIDTHReducer)
    // dispatch(setIsDrawerOpenRedux(!drawerState))

    let currFolderDetails = null
    if(dirType == 'File'){
        currFolderDetails = allfoldersDataRedux.filter((folderData)=>folderData.id==details.folderIdforFile)[0]
    }
    // console.log(allfoldersDataRedux)

    // share file
    const [userEmailForShare, setuserEmailForShare] = useState<any>(null);
    const sharedUserOnFile = useAppSelector((state)=>state.sharedUserOnFileReducer)

    const {register, handleSubmit, reset, formState:{isSubmitting,errors}} = 
        useForm<z.infer<typeof ShareUserOnFileSchema>>(
        {
            mode:'onChange', defaultValues:{
                email:'',
            }
        }
    )
    const onSubmitAddUserForm:SubmitHandler<z.infer<typeof ShareUserOnFileSchema>> = async(value) =>{
        console.log(value.email)
        if(value.email == currUserDataRedux.email){
            alert('Cannot add yourself')
            reset()
            return;
        }
        try {
            const getuserData = await getSharedUser(value.email)
            console.log(getuserData)

            if(getuserData?.data){
                setuserEmailForShare({email:getuserData.data.email, id:getuserData.data.id})
            }else{
                alert('User not found')
                setuserEmailForShare(null)
            }

            reset()
            
        } catch (error) {
            setuserEmailForShare(null)
        }
    }

    const addUserToCurrentPage = async(email:string, id:string)=>{

        // check the owner
        if(isSharedFile){
            return;
        }

        const data_toAddUser: FileShared = {
            id : v4(),
            createdAt: new Date().toISOString(),
            email: email,
            fileId: fileId,
            isDeleted: false,
            userIdOwner: currUserDataRedux.id,
            userIdShared: id
        }

        const data = await addSharedUserOnFile(data_toAddUser)
        if(data=='success'){
            toast({
                title: 'user added 🎉',
                description: `${email} is added.`,
            });
        }
        else if(data=='user already added'){
            toast({
                title: 'user already added 🚀',
                description: ``,
            });
        }
        setuserEmailForShare(null);
        // redux
        if(data=='success'){
            let allU = JSON.parse(JSON.stringify(sharedUserOnFile))
            if(allU[fileId]){
                allU[fileId].push(data_toAddUser)
            }else{
                allU[fileId] = [data_toAddUser]
            }
            // console.log(allU)
            dispatch((setSharedUserOnFileReducer(allU)))
        }
    }

    const getAllUsersOnFile = async()=>{
        console.log('getAllUsersOnFile()')
        if(dirType == 'File' && !sharedUserOnFile[fileId]){
            const getAllSharedUser = await getAllUsersOnFileQuery(fileId);
            if(getAllSharedUser.length>0){
                let allU = JSON.parse(JSON.stringify(sharedUserOnFile))
                allU[fileId] = getAllSharedUser
                // console.log(allU)
                dispatch((setSharedUserOnFileReducer(allU)))
            }
        }
    }

    const removeSharedUser = async(id:string)=>{
        if(isSharedFile){
            return;
        }
        const response = await removeSharedUserQuery(id, currUserDataRedux.id);
        if(response == 'success'){
            toast({
                title: 'user removed 💔',
                description: ``,
            });
            let allU = JSON.parse(JSON.stringify(sharedUserOnFile))
            allU[fileId] = allU[fileId].filter((d:FileShared)=>d.id != id)
            // console.log(allU)
            dispatch((setSharedUserOnFileReducer(allU)))
        }
    }
    // share file ends


    // fetch folder/file data from DB on initial page load
    useEffect(()=>{

        if(!fileId) return;
        if(!quill) return;

        // fixed 🟢 : Data not displaying correctly - sol: need to call db here
        
        const fetchInformation = async()=>{

            let AllDetails:any = {};

            if(dirType == 'File'){
                dispatch(setIsLoadingReducer(true))

                // check is shared file valid to user
                if(isSharedFile){
                    const res = await getSharedFilesOfUser(currUserDataRedux.id);
                    dispatch(setAllSharedFiles(res))
                    if(res.find((d:any)=>d.id == fileId)){
                        // WIP: get file owner email from user table
                        console.log('aa gye idhar');
                    }else{
                        dispatch(setIsLoadingReducer(false))
                        return router.replace(`/dashboard/${params.workspaceid}`)
                    }
                }

                const {data:selectedDir, error} = await getFileData(fileId);

                if(selectedDir[0]?.id == undefined){
                    dispatch(setIsLoadingReducer(false))
                    return router.replace(`/dashboard/${workspaceid}`)
                }
                try{
                    quill?.setContents(JSON.parse(selectedDir[0].data || ''))
                }catch(e){}

                // for details state
                AllDetails['title'] = selectedDir[0]?.title;
                AllDetails['data'] = selectedDir[0]?.data;
                AllDetails['id'] = selectedDir[0]?.id;
                AllDetails['icon'] = selectedDir[0]?.iconId;
                AllDetails['intrash'] = selectedDir[0]?.inTrash;
                AllDetails['createdAt'] = selectedDir[0]?.createdAt;
                AllDetails['workspaceId'] = selectedDir[0]?.workspaceId;
                AllDetails['folderIdforFile'] = selectedDir[0]?.folderId;

                dispatch(setIsLoadingReducer(false))
                await getAllUsersOnFile();

                // console.log(sharedUserOnFile[fileId]);

            }else if(dirType == 'Folder'){
                dispatch(setIsLoadingReducer(true))
                const {data:selectedDir, error} = await getFolderData(fileId);
                try{
                    quill?.setContents(JSON.parse(selectedDir[0].data || ''))
                }catch(e){}

                // for details state
                AllDetails['title'] = selectedDir[0]?.title;
                AllDetails['data'] = selectedDir[0]?.data;
                AllDetails['id'] = selectedDir[0]?.id;
                AllDetails['icon'] = selectedDir[0]?.iconId;
                AllDetails['intrash'] = selectedDir[0]?.inTrash;
                AllDetails['createdAt'] = selectedDir[0]?.createdAt;
                AllDetails['workspaceId'] = selectedDir[0]?.workspaceId;
                AllDetails['folderIdforFile'] = null;

                dispatch(setIsLoadingReducer(false))
            }
            setDetails(JSON.parse(JSON.stringify(AllDetails)))
        }
        fetchInformation();

    }, [quill, deleteclicked])
    // fix - Only quill as a dependency here


    // room 
    // WIP add socket 
    useEffect(()=>{
        // FIX : 🔴 condition check for null
        if(socket===null || quill===null || !fileId) return;


        // console.log(sharedUserOnFile)
        // console.log(sharedUserOnFile[fileId])
        
        // if(!sharedUserOnFile || sharedUserOnFile[fileId] == undefined){
        //     console.log('Not shared');
        //     return
        // }

        
        console.log('socket needed')
        socket.emit('create-room', fileId);
        

    },[socket, quill, fileId, dirType, sharedUserOnFile])


    //  Text Data state
    const [liveEditorData, setLiveEditorData] = useState(details.data)
    const [allChangesSaved, setAllChangesSaved] = useState(true)

    const [isSaving, setIsSaving] = useState(false)

    // save document function
    const saveDocumentFN = async()=>{
        if(dirType == 'File'){
            setIsSaving(true)
            const res = await saveFileData(details.id, liveEditorData)
            setAllChangesSaved(true)
            setIsSaving(false)
            return
        }
        else if (dirType == 'Folder'){
            setIsSaving(true)
            const res = await saveFolderData(details.id, liveEditorData)
            setAllChangesSaved(true)
            setIsSaving(false)
            return
        }
    }


    // socket send changes to all user and auto save
    useEffect(()=>{
        if(socket===null || quill===null || !fileId) return;

        // WIP : curser selection state
        const selectionChangeHandler = (cursorId:string)=>{
            return (range:any, oldRange:any, source:any)=>{
                if(source==='user' && cursorId && dirType=='File' && sharedUserOnFile && sharedUserOnFile[fileId]?.length>0){
                    // console.log(sharedUserOnFile[fileId])
                    socket.emit('send-cursor-move', range, fileId, cursorId);
                }
            }
        };

        // quill user editing doc handler
        const quillHandler = (delta:any, oldDelta:any, source:any)=>{
            if(source !== 'user') return;

            setAllChangesSaved(false)
            // console.log('---')
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            
            const contents = quill?.getContents();
            let d = JSON.stringify(contents);
            setLiveEditorData(d);
            
            // auto save
            saveTimerRef.current = setTimeout(async () => {
                console.log('auto save')
                
                if(dirType == 'File'){
                    setIsSaving(true)
                    const res = await saveFileData(details?.id, d)
                    setAllChangesSaved(true)
                    setIsSaving(false)
                    return
                }
                else if (dirType == 'Folder'){
                    setIsSaving(true)
                    const res = await saveFolderData(details?.id, d)
                    setAllChangesSaved(true)
                    setIsSaving(false)
                    return
                }

            }, 1000)

            // fix : check condition for sharing -> Sol - All folder/files shares because an user can open same file/folder in different tabs.
            // console.log('socket send ---')
            socket.emit('send-changes', delta, fileId)
        }

        quill.on('text-change', quillHandler);
        quill.on('selection-change', selectionChangeHandler(currUserDataRedux.id))
        // WIP : cursors selection handler
        return ()=>{
            quill.off('text-change', quillHandler);
            quill.off('selection-change', selectionChangeHandler)
            // WIP cursors 

            if(saveTimerRef.current) clearTimeout(saveTimerRef.current)
        }

        

    }, [quill, socket, fileId, details, dirType,currUserDataRedux.id, sharedUserOnFile])


    // receive cursor state change socket
    useEffect(()=>{
        if(quill===null || socket===null || !fileId || dirType!='File' || !sharedUserOnFile[fileId]?.length) return;
        // console.log('----+++---')
        console.log(sharedUserOnFile[fileId]?.length)

        const socketHandler = (range:any, roomId:string, cursorId:string)=>{
            // console.log('cursor receiving')
            if(roomId === fileId){
                const cursorToMove = localCursors.find((c:any)=>c.cursors()?.[0].id === cursorId);
                if(cursorToMove){
                    // try{
                    cursorToMove.moveCursor(cursorId, range)
                    // }catch(e){}
                }
            }
        }

        socket.on('receive-cursor-move', socketHandler)

        return ()=>{
            socket.on('receive-cursor-move', socketHandler)
        }
    },[quill, socket, fileId, localCursors, dirType, sharedUserOnFile])

    // receive socket changes
    useEffect(()=>{
        if(quill === null || socket === null || !fileId) return;

        // console.log('socket receiving useEffect')

        // FIXED🟢 : Socket not receiving - Sol: add dirType in this useEffect dependency array.

        const socketHandler = (deltas:any, id:string)=>{
            // console.log('changes receiving')
            if(id==fileId){
                quill?.updateContents(deltas)
            }
        }
        socket?.on('receive-changes', socketHandler)

        return ()=>{
            // console.log('off')
            socket.off('receive-changes', socketHandler)
        }

    },[quill, socket, fileId, dirType])


    // WIP : Cursors socket
    

    useEffect(()=>{
        if(!fileId || quill===null) return;

        const room = supabase.channel(fileId)
        const subscription = room.on('presence', {event:'sync'}, ()=>{
            const newState = room.presenceState();
            const newCollaborators = Object.values(newState).flat() as any;
            setCollaborators(newCollaborators)
            if(currUserDataRedux.id){
                const allCursors:any = []
                newCollaborators.forEach((collaborator:{id:string;email:string;avatarUrl:string;})=>{
                    if(collaborator.id !== currUserDataRedux.id){
                        const userCursor = quill.getModule('cursors');
                        userCursor.createCursor(
                            collaborator.id, 
                            collaborator.email.split('@')[0],
                            `#${Math.random().toString(16).slice(2,8)}`
                        );
                        allCursors.push(userCursor)
                    }
                })
                setLocalCursors(allCursors)
            }
        }).subscribe((status)=>{
            if(status!=='SUBSCRIBED' || currUserDataRedux.id.length==0) return;
            room.track({
                id: currUserDataRedux.id,
                email: currUserDataRedux.email?.split('@')[0],
                // WIP : user url from supabase storage
                avatarUrl: ''
            })
        })

        return ()=>{
            supabase.removeChannel(room)
        }

    },[fileId, quill, supabase, currUserDataRedux])


    // restore file / folder 

    const restoreFileFolder =async () => {
        if(dirType='File'){

            const fID = fileId
            const foID = params.folderid

            const res = await restoreFile(fID, foID)

            console.log(res)

            if(res=='success'){

                // del file redux update
                let delFileData = {}
                let dd:File[] = []
                alllDelFiles.map((d:File)=>{
                    if(d.id !== fID){
                        dd.push(d)
                    }else{
                        delFileData = d
                    }
                })
                dispatch(setAllDeletedFiles(dd))

                // allfiles redux update
                let allFiles = JSON.parse(JSON.stringify(allfileDataRedux)) 
                
                if(allFiles && allFiles[params.folderid]){
                    allFiles[params.folderid].map((d:File,i:number)=>{
                        if(d.id == fileId){
                            allFiles[params.folderid][i].inTrash = ''
                        }
                    })
                }
                dispatch(setAllFilesReducer(allFiles))
                
                // toast
                toast({
                    title: 'Restored 🎉',
                    description: `${details.title} has been restored.`,
                });

            }

            // update the quill editor state
            setdeleteclicked(deleteclicked+1)
        }
    }


    const deleteFileFolder =async () => {
        if(dirType == 'File'){
            
            const sure = confirm('are you sure ?')
            if(!sure){
                return;
            }

            // DB update
            const res = await deleteFileTemp(fileId)

            if(res !== 'error'){
                // toast
                toast({
                    title: 'Moved to Trash 🗑️',
                    description: `${details.title} has been moved to Trash.`,
                });

                // update the delFiles redux state
                let dd:File[] = [{
                    createdAt: details.createdAt,
                    data: details.data,
                    folderId: details.folderIdforFile,
                    iconId: details.icon,
                    id: details.id,
                    inTrash: '1',
                    title: details.title,
                    workspaceId: details.workspaceId,
                    bannerUrl: ''
                }, ...alllDelFiles]

                dispatch(setAllDeletedFiles(dd))

                // update the quill editor state
                setdeleteclicked(deleteclicked+1)

                if(!params.folderid) return

                // update the allfiles redux state
                let allFiles = JSON.parse(JSON.stringify(allfileDataRedux)) 
                
                if(allFiles && allFiles[params.folderid]){
                    allFiles[params.folderid].map((d:File,i:number)=>{
                        if(d.id == fileId){
                            allFiles[params.folderid][i].inTrash = '1'
                        }
                    })
                }
                dispatch(setAllFilesReducer(allFiles))
            }
        }
    }



    const deleteFileForeverFN =async () => {
        if(dirType=='File'){

            const ffff = fileId

            const res = await deleteFileForever(ffff, details.workspaceId, currUserDataRedux.id)

            if(res=='success'){

                let dd:File[] = []
                alllDelFiles.map((d:File)=>{
                    if(d.id !== ffff){
                        dd.push(d)
                    }else{
                    }
                })
                dispatch(setAllDeletedFiles(dd))

                toast({
                    title:'Deleted forever ❗'
                })

                return router.replace(`/dashboard/${workspaceid}`);
            }else{
                toast({
                    title:'Something went wrong.'
                })
            }
        }
    }


  return (
    <>
    <div className={`${drawerState&&screenWidth<700?'z-50 absolute bg-slate-400 bg-opacity-10 w-full h-full cursor-pointer text-center'
    :'hidden'}`}
        onClick={()=>{dispatch(setIsDrawerOpenRedux(false))}}
    >
        <div className='relative top-[50%] left-[50%]'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
            </svg>


        </div>
    </div>
    <div className={`${drawerState&&screenWidth<700?'opacity-30':'opacity-100'}`}>
        {details.intrash=='1'?<>
            <article className='
                bg-red-400 flex flex-row py-2 w-full
                justify-center items-center text-white gap-4'
            >
                <div className=''>This {dirType} is in Trash.</div>
                {
                isSharedFile ? <></> :
                <div className=''>
                    <Button onClick={()=>{restoreFileFolder()}} className='bg-transparent py-0 px-2 mx-2' type='button' variant={'outline'}>Restore</Button>
                    <Button 
                        onClick={()=>{confirm('do you want to delete this file Forever ❓ This action cannot be undone ❗')&&deleteFileForeverFN()}}
                        className='bg-transparent py-0 px-2 mx-2' type='button' variant={'outline'}>Delete
                    </Button>
                </div>
                }
            </article>
        </>:<></>}


    <div className='flex flex-col-reverse lg:flex-row justify-between p-2 w-[100%] sticky top-0 bg-background z-40'>
        <div className='flex flex-row items-center mr-2'>
            {/* Sidebar show/hide */}
            <div
                className='cursor-pointer'
                onClick={()=>dispatch(setIsDrawerOpenRedux(!drawerState))}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
                </svg>
            </div>
            {/* file location */}
            <div className= {!isSharedFile?'p-2 text-base':'hidden'}>
                {dirType == 'Folder' ? <div>{currIconIdWorkspace} {currTitleWorkspace} / {details.icon} {details.title}</div>:<></>}
                {dirType == 'File' ? <div>{currIconIdWorkspace} {currTitleWorkspace} / {currFolderDetails?.iconId} {currFolderDetails?.title} / {details.icon} {details.title}</div> : <></>}
            </div>
            <div className={isSharedFile?'p-2 text-lg':'hidden'}>
                {dirType == 'File' ? <div>{details.icon} {details.title}</div> : <></>}
            </div>
            <div className={isSharedFile?'hidden':'flex gap-x-2'}>

                {/* WIP : Edit file/folder name */}

                <div className='cursor-pointer hover:scale-125 transition-all' onClick={()=>{editFileFolderName(dirType)}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </div>
                {
                    dirType=='File' && details.intrash=='' ?
                    <div className='cursor-pointer hover:scale-125 transition-all' onClick={()=>{deleteFileFolder()}}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </div>:''
                }
            </div>
        </div>
        <div className={`${ drawerState&&screenWidth<700 ?'hidden':
        'flex lg:flex-row flex-row-reverse justify-end p-2 items-center gap-2'}`} >

            {(allChangesSaved) ? <div className='text-sm px-1'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>

            </div> : <div className='animate-bounce'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
            </div> }

            {/* <div className='pr-2'>
                {isConnected ? '🟢' : '🔴'} 
            </div> */}

            <div className={`${dirType!=='File' || isSharedFile ?'hidden':'flex'}`}>
                
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className='mr-2' size={'sm'} onClick={()=>{getAllUsersOnFile()}}>collaborators  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                            </svg>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] gap-1">
                        <form onSubmit={handleSubmit(onSubmitAddUserForm)}>
                            <DialogHeader>
                            <DialogTitle>Share</DialogTitle>
                            <DialogDescription>
                                Please enter the full email of instaNote user to add.
                            </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="flex items-center gap-4">
                                    <Label htmlFor="email" className="">
                                        Email
                                    </Label>
                                    <Input id="email" type='email' className="col-span-3" 
                                    {...register('email',{
                                        required: 'Email is required'
                                    })}
                                    />
                                    <Button type="submit" size='icon' className='px-2'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                    </Button>
                                </div>

                                <small className='text-red-600'>
                                    {errors?.email?.message?.toString()}
                                </small>
                            
                            </div>
                        </form>

                        {userEmailForShare!=null ? 
                        <>
                        <p>user found</p>
                        <div className='flex flex-row items-center justify-between border-l-4 px-2 border-blue-400'>
                            <div>{userEmailForShare?.email}</div>
                            <Button
                                onClick={()=>{addUserToCurrentPage(userEmailForShare?.email, userEmailForShare?.id)}}
                                variant='ghost' size='sm'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </Button>
                        </div></> : ''}

                        {sharedUserOnFile[fileId]?.length>0 ? <div>
                            <p>Collaborators</p>
                            {sharedUserOnFile[fileId].map((data:FileShared)=>{
                                return (<>
                                
                                <div className='flex flex-row justify-between items-center border-l-2 border-green-400 px-2 my-1'>
                                    <div>
                                        {data.email}
                                    </div>
                                    <Button 
                                        onClick={()=>{removeSharedUser(data.id)}}
                                        variant='ghost' size='sm'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </Button>
                                </div>
                                </>)
                            })}
                        </div> :''}

                    </DialogContent>
                </Dialog>

            </div>
            
                {/* <div>
                    <Button className='bg-green-900' variant="outline" 
                        // disabled={isSaving}
                        // onClick={()=>{saveDocumentFN()}}>
                        // {isSaving ?'saving':'Save'}
                    </Button>
                </div> */}


            <div className='flex flex-row w-10 h-8'>
                {/* {sharedUserOnFile[fileId]?.length>0  ?
                <>
                    <Avatar className={ `bg-amber-900 translate-x-4 z-40`}>
                        <AvatarFallback className={`bg-amber-900 text-lg`}>+{sharedUserOnFile[fileId]?.length}</AvatarFallback>
                    </Avatar>
                </> : <></>
                    
                } */}
                {/* <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar> */}


                {/* all active user on this page */}

                {collaborators?.map((collaborator) => (
                <TooltipProvider key={collaborator.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar
                        className="
                        -ml-3 
                        bg-background 
                        border-2 
                        flex 
                        items-center 
                        justify-center 
                        border-white 
                        h-8 
                        w-8 
                        rounded-full
                        "
                      >
                        <AvatarImage
                          src={
                            collaborator.avatarUrl ? collaborator.avatarUrl : ''
                          }
                          className="rounded-full"
                        />
                        <AvatarFallback>
                          {collaborator.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{collaborator.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}




            </div>
        </div>
    </div>

{/* Banner Upload section */}
    {/* <div 
        onClick={()=>{uploadBanner()}}
        className='h-[100px] cursor-pointer border-b-2 w-[100%] flex flex-row justify-center gap-4 items-center'>
        <div className='opacity-60'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
        </div>
        <div className='opacity-60'>Upload Banner</div>
    </div> */}


    <div className={`
        ${(drawerState && screenWidth<700) ? 'hidden' : 
        'flex flex-col justify-center relative items-center mt-1'}
        
    `}
    >
        {/* {screenWidth} */}

        {/* File/Folder Name */}
        <div className='flex justify-center items-center flex-col text-slate-900 
            bg-gradient-to-r from-sky-500 to-indigo-500 w-full h-[80px]'>
            <div className='max-w-[1100px] text-2xl opacity-100 py-2'>
                {details.icon + ' ' + details.title}
            </div>
            <div className='opacity-90 text-sm pb-2'>{dirType.toUpperCase()}</div>
        </div>


        {/* Text Editor */}
        <div 
            id='container'
            className='max-w-[1100px]'
            ref={wrapperRef}  
        >  
        </div>
        
    </div>
    </div>
    </>
  )
}

export default QuillEditor