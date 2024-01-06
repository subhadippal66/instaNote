import { Socket, Server as NetServer } from "net";
import {Server as SocketIoServer} from 'socket.io'
import { NextApiResponse } from "next";
import { z } from "zod";

export const FormSchema = z.object({email:z.string().describe("Email").email({message:"Invalid Email"}),
    password:z.string().describe("Password").min(1, "Password is required")
})

export const CreateWorkspaceFormSchema = z.object({
   workspaceName: z.string().describe('Workspace Name').min(1,'Workspace name must be minimum of 1 character.'),
   logo: z.any(),
})

export const CreateFolderFormSchema = z.object({
   folderName: z.string().describe('Workspace Name').min(1,'Workspace name must be minimum of 1 character.'),
   logo: z.any(),
})


export const CreateFilesFormSchema = z.object({
   fileName: z.string().describe('Page Name').min(1,'Page name must be minimum of 1 character.'),
   logo: z.any(),
   hiddenFolderId: z.string()
})

export type NextApiResponseServerIo = NextApiResponse & {
   socket: Socket & {
      server: NetServer &{
         io: SocketIoServer
      }
   }
}

export const ShareUserOnFileSchema = z.object({
   email: z.string().email('email is invalid').describe('Email of instaNote user')
})