'use client'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { FormSchemaEmail } from '@/lib/types'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import Logo from '../../../../public/cypresslogo.svg'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Loader from '@/components/global/loader'
import { actionResetPassword } from '@/lib/server-action/auth-actions'


const ResetPassword = () => {

    const [submitError, setSubmitError] = useState('');

    const form = useForm<z.infer<typeof FormSchemaEmail>>({
        mode:"onChange",
        resolver: zodResolver(FormSchemaEmail),
        defaultValues:{email:''}
    })

    const isLoading = form.formState.isSubmitting;


    const onSubmit: SubmitHandler<z.infer<typeof FormSchemaEmail>> = async(
        formData
      )=>{
        const {error, data} = await actionResetPassword(formData);
    
        if(error){
          form.reset();
            setSubmitError(error);
        }else if(data){
            setSubmitError("✅ Reset link send successfully. Check your inbox 📨");
        }
    
      }

  return (
    <div>
    <Form {...form}>
      <form 
      onChange={()=>{
        if(submitError) setSubmitError('')
      }}
      onSubmit={form.handleSubmit(onSubmit)} className='w-full justify-center sm:w-[400px] space-y-6 flex flex-col'
      >
        <Link href='/' className='w-full flex justify-start items-center'>
          <Image src={Logo} alt='InstaNote logo' width={50} height={50}/>
          <span className='font-semibold dark:text-white text-4xl ml-2'>InstaNote</span>
        </Link>
        <FormDescription className='
        text-foreground/60'>
          An all in one collaboration and productivity platform
        </FormDescription>
        <FormDescription className='
        text-foreground/80'>
          Reset password
        </FormDescription>
        <FormField 
          disabled={isLoading} 
          control={form.control}
          name='email' 
          render={({field})=>(
            <FormItem>
              <FormControl>
                <Input type='email' placeholder='Email' {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {submitError && <FormMessage>{submitError}</FormMessage>}

        <Button type='submit' className='w-full p-6' size='lg' disabled={isLoading}>
            {!isLoading ? "Get reset link" : <Loader/>}
        </Button>

        <span className='self-center'>
          Already registered ?
          <Link href='/login' className='text-primary'> login</Link>
        </span>

        <span className='self-center'>
          Dont have an account 
          <Link href='/signup' className='text-primary'> Sign Up</Link>
        </span>

      </form>
    </Form>
    </div>
  )
}

export default ResetPassword