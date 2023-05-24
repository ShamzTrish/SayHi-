"use client"

import { FC, useState } from 'react'
import Button from './ui/Button'
import { addFriendValidator } from '@/libraries/validations/add-friend'
import axios, { AxiosError } from 'axios'
import { TypeOf, z } from "zod"
import { set, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"

interface AddFriendButtonProps {

}
interface Inputs {
    email: string
}

// timhle nastavime aby jsme nas validator ktery je napsany v JS nastavime na TS type a stane se z toho string.

type FormData = z.infer<typeof addFriendValidator>

const AddFriendButton: FC<AddFriendButtonProps> = ({ }) => {

    const [showSuccess, setShowSuccess] = useState<boolean>(false)

    // const { register, handleSubmit, setError } = useForm()

    const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>({
        //resolver = tohle pro nas handlnuje any type of error ktery muzeme dostat, at uz to bude chybejici @ v email, nebo nejaky nepovolene znaky napriklad jako ',./?' 
        resolver: zodResolver(addFriendValidator)
    })

    // tady delame logiku na Add button, za asynch v zavorkach muzeme hnedka nastavit diky TS co budeme ocekavat a jaky typ to bude . (email:string)
    const addFriendBtn = async (email: string) => {
        try {
            // tady si zavolame nase validation na email ktery jsme si vytvorili pomoct import { z } from "zod";
            const validatedEmail = addFriendValidator.parse({ email })

            // tady odkazujeme na nas vytvoreny route /api/friends/add kde nastavujeme celou logic kde nastavujeme POST request 
            await axios.post("/api/friends/add", {
                email: validatedEmail
            })

            setShowSuccess(true)

        } catch (error) {

            //here we can take advantage of the library that we have called zod, that can actually handle the error for us. So this is how we check if it is the zod error, meaning if the error exists in zod
            if (error instanceof z.ZodError) {
                setError("email", { message: error.message })    // here you specify in which field the error happened, so you an individually set the field or you can select all, in our case we only have email input. the message is how you get the error message in zod, in axios is a bit different, see below
                return
            }



            if (error instanceof AxiosError) {
                setError('email', { message: error.response?.data })
                return
            }

            //if we couldn't indentify the error, meaning if it's not axios or zod error, we can just generate universal message like this:
            setError('email', { message: 'Woops, Something went wrong!' })
        }
    }

    // tady si nastavime logic na nas submit btn
    const onSubmit = (data: FormData) => {
        addFriendBtn(data.email)
    }

    return <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
        <label htmlFor="email" className='block text-sm font-medium leading-6 text-gray-900'>Add Email Down Below</label>
        <div className='mt-2 flex gap-4'>
            <input
                {...register("email")}
                type="text" className='block rounded-md border-0 w-full py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 text-grey-900 placeholder:text-grey-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6' placeholder='email@example.com' />
            <Button>Add</Button>
        </div>
        <p className='mt-1 text-sm text-red-600'>{errors.email?.message}</p>
        {showSuccess ? (
            <p className='mt-1 text-sm text-green-600'>Friend request has been sended!</p>
        ) : null}
    </form>
}

export default AddFriendButton