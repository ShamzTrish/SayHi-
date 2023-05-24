"use client"

import { FC, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Button from './ui/Button'
import axios from 'axios'

import { toast } from 'react-hot-toast' // this is simple package that automatically extends the text are as you are writing - so depending how much you write it gets as big


interface ChatInputProps {
    chatPartner: User,
    chatId: string,
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {

    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    const [input, setInput] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false) //to show a loading button - when we are sending a message


    const sendMessage = async () => {

        setIsLoading(true)
        if (!input) {
            return setIsLoading(false)
        }

        try { // we need to send the message to our database. we are using axios again and post request. first parameter is the route that it's gonna take (we have it under api/message/send) and second is what you wanna send, in our case the input and the chat id
            await axios.post('/api/message/send', { text: input, chatId })
            setInput('')
            textareaRef.current?.focus() //this will automatically puts focus on the input field right after you send a message
        } catch (error) {
            toast.error('Sorry, Something went wrong! Please try again later.')
        } finally {
            setIsLoading(false)
        }
    }
    const onKeyDownFunc = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }
    const setInputValue = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }
    const textAreaFocus = () => {
        textareaRef.current?.focus()
    }

    return <div className='border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0'>
        <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600'>
            <TextareaAutosize ref={textareaRef} onKeyDown={onKeyDownFunc}
                rows={1}
                value={input}
                onChange={setInputValue}
                placeholder={`Message ${chatPartner.name}`}
                className='block w-full resize-none border-0 bg-transparent text-grey-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6'
            />
            <div
                onClick={textAreaFocus} className='py-2'
                aria-hidden="true">
                <div className='py-px'>
                    <div className='h-9' />
                </div>
            </div>
            <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                <div className='flex-shring-0'>
                    <Button onClick={sendMessage} type='submit' isLoading={isLoading}>Send</Button>
                </div>
            </div>
        </div>
    </div>
}

export default ChatInput