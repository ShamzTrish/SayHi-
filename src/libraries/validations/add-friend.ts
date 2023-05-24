// tohle je nase validation schema pro nas email input, ale da se to implementovat i na cely form(kdyby jsme meli vic inputu)
// EMAIL VALIDATION

import { z } from "zod";

export const addFriendValidator =  z.object({
    email: z.string().email()
    
})