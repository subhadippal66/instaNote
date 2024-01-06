'use server'

import db from "./db"
import { File, Folder, Subscription, FileShared, workspace } from "./supabase.types";
import { v4, validate } from 'uuid';
import { files, folders, users, workspaces, fileShared } from '../../../migrations/schema';
import { and, count, desc, eq, inArray, notExists, notInArray } from "drizzle-orm";
import { collaborators } from "./schema";
import { error } from "console";


export const getUserSubscriptionStatus = async(userId: string)=>{
    try{

        const data = await db.query.subscriptions.findFirst({
            where: (s,{eq})=>eq(s.userId, userId)
        });
        
        if(data) return {data: data as Subscription, error:null};
        else return {data: null, error: null}

    }catch(error){
        console.log(error)
        return {data: null, error: `Error ${error}`}
    }
}


// share user query
export const getSharedUser = async (email:string)=>{
    console.log('query hits')
    if(!email) return {email:'',error:''}

    // console.log(email, '--')
    const userFromUserTable = await db.query.users.findFirst({
        where: (s, {eq}) => eq(s.email, email)
    });

    if(userFromUserTable) return {data:userFromUserTable, error:null};
    else return {data:null, error:'error'}
}



// export const addSharedUserOnFile = async (userIdShared:string, userIdOwner:string, fileId:string, email:string)=>{
export const addSharedUserOnFile = async (dataToAddUser:any)=>{

    try{

        const checkDB = await db
        .select()
        .from(fileShared)
        .where(and(eq(dataToAddUser.fileId, fileShared.fileId), eq(dataToAddUser.userIdShared, fileShared.userIdShared))) as FileShared[]

        if(checkDB.length > 0){
            // console.log('exist')
            return 'user already added'
        }

        
        const response = await db.insert(fileShared).values(dataToAddUser)
        // console.log(dataToAddUser);
        // console.log('-------------------')
        // console.log(response)
        return 'success'

    }catch(e){
        console.log(e)
    }
}

export const getAllUsersOnFileQuery = async(fileId:string)=>{

    if(!fileShared){
        return []
    }

    try {

        console.log('getAllUsersOnFileQuery')

        const getSharedUser = await db
        .select()
        .from(fileShared)
        .where(eq(fileShared.fileId, fileId)) as FileShared[]
    
        return getSharedUser;
    } catch (error) {
        return []
    }
}

export const removeSharedUserQuery = async(id:string, fileOwner:string)=>{
    if(!validate(id) || !validate(fileOwner)){
        return 'error';
    }
    try{
        const res = await db.delete(fileShared).where(and(eq(fileShared.id,id), eq(fileShared.userIdOwner, fileOwner)))
        // console.log(res)
        return 'success'
    }catch(e){
        return 'error';
    }

}


//  returns files that are shared with a user
export const getSharedFilesOfUser = async(userId: string)=>{
    if(!validate(userId)) return []
    console.log('Shared files hits 🚀')
    try{
        const res = await db
        .select({FileId: fileShared.fileId})
        .from(fileShared)
        .where(eq(fileShared.userIdShared, userId)) as [];

        // console.log(res)

        if(res.length>0){
            let a: string[] = []
            res.map((d:{FileId:string})=>{
                a.push(d.FileId)
            })
            const res1 = await db.select().from(files)
            .where(inArray(files.id, a)) as File[]

            // console.log(res1)
            return res1;
        }

        return [];
    }catch(e){
        return []
    }
}


export const createWorkspace = async (workspace: workspace) => {
    try {
      const response = await db.insert(workspaces).values(workspace);
      return { data: null, error: null };
    } catch (error) {
      console.log(error);
      return { data: null, error: 'Error' };
    }
};

export const createFolder =async (folder:Folder) => {
    try{
        const response = await db.insert(folders).values(folder);
        return { data: 'success', error: null };
    } catch (error) {
      console.log(error);
      return { data: null, error: 'Error' };
    }
}

export const createFile =async (file:File) => {
    try{
        const response = await db.insert(files).values(file);
        return { data: 'success', error: null };
    } catch (error) {
      console.log(error);
      return { data: null, error: 'Error' };
    }
}



export const getFiles = async (folderId: string|null) => {
    if(!folderId) return { data: null, error: 'Error' };
    const isValid = validate(folderId);
    if (!isValid) return { data: null, error: 'Error' };
    try {
        const results = await db
        .select()
        .from(files)
        .orderBy(desc(files.createdAt))
        // .where(and(eq(files.folderId, folderId),eq(files.inTrash, ''))) as File[] | [];
        .where(eq(files.folderId, folderId)) as File[] | [];
        return { data: results, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};


export const getFolders = async (workspaceId: string, inTrash: boolean) =>{
    // console.log(workspaceId)
    let trashVal = ''
    if(inTrash){trashVal = '1'}

    const isValid = validate(workspaceId)
    if(!isValid){
        return {
            data: [],
            error: 'Error from UUID'
        }
    };

    try{
        const results: Folder[] | [] = await db
            .select()
            .from(folders)
            .orderBy(desc(folders.createdAt))
            // .where(and(eq(folders.workspaceId, workspaceId),eq(folders.inTrash,trashVal)));
            .where(eq(folders.workspaceId, workspaceId));
        console.log('here')
        return {data:results, error: null};
    }catch(error){
        return {data:[], error: 'Error in DB query'};
    }
}

export const getFolderData =async (folderId:string) => {
    const isValid = validate(folderId)
    console.log(folderId)
    if(!isValid){
        return {
            data: [],
            error: 'Error from UUID'
        }
    };

    try{
        const response = await db
            .select()
            .from(folders)
            .where(eq(folders.id , folderId))
            .limit(1) as Folder[]
        console.log('DB runs : getFolderData')
        return {
            data : response,
            error:null
        }

    }catch(e){
        return {
            data: [],
            error: 'Error'
        }
    }
}

export const getFileData =async (fileId:string) => {
    const isValid = validate(fileId)
    console.log(fileId + '  -- getFileData called')
    if(!isValid){
        return {
            data: [],
            error: 'Error from UUID'
        }
    };

    try{
        const response = await db
            .select()
            .from(files)
            .where(eq(files.id , fileId))
            .limit(1) as File[]
        console.log('DB runs : getFileData')
        return {
            data : response,
            error:null
        }

    }catch(e){
        return {
            data: [],
            error: 'Error'
        }
    }
}

export const getPrivateWorkspaces =async (userId:string) => {
    if(!userId) return [];
    const privateWorspaces = await db.select({
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data:workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo
    }).from(workspaces).where(and(
        notExists(
            db.select().from(collaborators).where(eq(collaborators.workspaceId, workspaces.id))
        ),
        eq(workspaces.workspaceOwner, userId)
    )) as workspace[];

    return privateWorspaces; 
}

export const getCollaboratingWorkspaces = async(userId:string) =>{
    if(!userId) return [];

    const collaboratedWorkspaces = await db.select({
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data:workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo
    }).from(users)
    .innerJoin(collaborators,eq(users.id, collaborators.userId))
    .innerJoin(workspaces,eq(collaborators.workspaceId,workspaces.id))
    .where(eq(users.id, userId)) as workspace[];
    
    return collaboratedWorkspaces;
}

export const getSharedWorkspaces = async (userId:string) => {
    if(!userId) return [];

    const sharedWorkspaces = await db.selectDistinct({
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data:workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo
    }).from(workspaces)
    .orderBy(workspaces.createdAt)
    .innerJoin(collaborators,eq(workspaces.id, collaborators.workspaceId))
    .where(eq(workspaces.workspaceOwner, userId)) as workspace[];

    return sharedWorkspaces;
}



// save folder data
export const saveFolderData = async (folderId : string, data : string) =>{
    if(!folderId) return 'error';
    console.log('save folder data');
    try {
        await db
        .update(folders)
        .set({data: data})
        .where(eq(folders.id, folderId))

        return 'success'
        
    } catch (error) {
        return 'error';
    }
}

// save file data
export const saveFileData = async (fileId : string, data : string) =>{
    if(!fileId) return 'error';

    console.log('save file data');
    
    try {
        await db
        .update(files)
        .set({data: data})
        .where(eq(files.id, fileId))

        return 'success'
        
    } catch (error) {
        return 'error';
    }
}

// get total no of workspaces
export const getTotalNoOfWorkspaceQuery =async (userId:string) => {
    if(!userId) return null

    try{
        const res = await db
            .select({value:count()})
            .from(workspaces)
            .where(eq(workspaces.workspaceOwner,userId))
            .groupBy(workspaces.workspaceOwner)
        
        return res;
    }catch(e){
        return null;
    }
}


export const getTotalNoOfFolderQuery =async (WPid:string) => {
    if(!WPid) return null

    try{
        const res = await db
            .select({value:count()})
            .from(folders)
            .where(eq(folders.workspaceId,WPid))
            .groupBy(folders.workspaceId)
        
        return res;
    }catch(e){
        return null;
    }
}


export const getTotalNoOfFileQuery =async (folderid:string) => {
    if(!folderid) return null

    try{
        const res = await db
            .select({value:count()})
            .from(files)
            .where(eq(files.folderId,folderid))
            // .groupBy(files.folderId)
        
        return res;
    }catch(e){
        return null;
    }
}

// get standalone deleted files
export const getDeletedFiledStandlone =async (wID:string) => {
    if(!wID) return [];

    try{
        // get folders which are deleted

        // const delFolderID = await db
        // .select({id:folders.id})
        // .from(folders)
        // .where(and(eq(folders.workspaceId, wID), eq(folders.inTrash, '1'))) as {id:string}[]
        
        // let arr:string[] = []

        // delFolderID.map((d:{id:string})=>{
        //     arr.push(d.id)
        // })

        // get files which are deleted and not in this folders
        // const alldelFiles = await db
        // .select()
        // .from(files)
        // .where(and(eq(files.workspaceId,wID),and(eq(files.inTrash,'1'),notInArray(files.folderId, arr)))) as File[]


        // get all del files
        const alldelFiles = await db.select()
        .from(files)
        .where(and( eq(files.workspaceId, wID), eq(files.inTrash,'1') )) as File[]

        return alldelFiles;

    }catch(e){return []}
}


export const deleteFolderTemp = async(folderId:string) => {
    if(!folderId) return 'error';

    try {

        const res = await db
        .update(folders)
        .set({inTrash:'1'})
        .where(eq(folders.id, folderId))

        const resFile = await db
        .update(files)
        .set({inTrash:'1'})
        .where(eq(files.folderId, folderId))

        console.log(res)
        console.log(resFile)

        return 'success'

    } catch (error) {
        return 'error'
    }   
}

export const deleteFileTemp =async (fileId:string) => {
    if(!fileId) return 'error';

    try {
        const resFile = await db
        .update(files)
        .set({inTrash:'1'})
        .where(eq(files.id, fileId))
        
    } catch (error) {
        return 'error';
    }
}

export const restoreFolder =async (folderId:string) => {
    if(!folderId) return 'error';

    try {

        const res = await db
        .update(folders)
        .set({inTrash:''})
        .where(eq(folders.id, folderId))

        const resFile = await db
        .update(files)
        .set({inTrash:''})
        .where(eq(files.folderId, folderId))

        console.log(res)
        console.log(resFile)

        return 'success'

        
    } catch (error) {
        return 'error'
    }
}

export const restoreFile =async (fileId:string, folderId:string|null) => {
    if(!fileId) return 'error';
    if(!folderId || folderId===null) return 'error';

    try {
        const resFile = await db
        .update(files)
        .set({inTrash:''})
        .where(eq(files.id, fileId))

        const setFolder = await db.update(folders).set({inTrash:''})
        .where(eq(folders.id, folderId))

        return 'success'
        
    } catch (error) {
        return 'error';
    }
}