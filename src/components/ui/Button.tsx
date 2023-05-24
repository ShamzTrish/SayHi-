import { cn } from "@/libraries/utilities"
import { VariantProps, cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { ButtonHTMLAttributes, FC } from "react"



// tady si nastavuju CSS v tailwind 
export const buttonVariants = cva(
    // tohle je defaultni nastaveni CSS ktere budou mit vsechny buttons ktere vytvorime
    'active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-color focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    {
        // zde si nastavujeme volitelne varainty. Varianty/Size si muzeme pak zavolat pri rendrovani componenty buttons.
        // 'variants' jsou je povinny nazev. 'buttonVariant' je mnou zvoleny nazev. To stajny plati pro 'buttonSize'
        variants: {
            buttonVariant: {
                default: 'bg-slate-900 text-white hover:bg-slate-800',
                ghost: 'bg-transparent hover:text-slate-900 hover:bg-slate-200'
            },
            buttonSize: {
                default: 'h-10 py-2 px-4',
                sm: 'h-9 px-2',
                lg: 'h11 px-8'
            }
        },
        // 'defaultVariants' je znovu povinny nazev.
        defaultVariants: {
            buttonVariant: 'default',
            buttonSize: 'default'
        }
    }
)

// "export interface" je typescript. 
// " extends ButtonHTMLAttributes<HTMLButtonElement>" timhle rikame ze na tenhle button muzeme pouzivat REACT moznosti ovladani napriklad jako onClick, onChange atd..
// VariantProps<typeof buttonVariants> timhle rikame ze na tenhle button muzeme pouzivat to nastaveni 'const buttonVariants' ktere jsme si vytvorili jako napriklad "buttonVariant" nebo "buttonSize"
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    // tady si delame button schema
    isLoading?: boolean
}


// tady musime vypsat do zavorek vsechno co jsme si nahore kodu vytvorili jako buttonSize atd a taky ...props abychom mohli prijmout jakekoliv jine props nez ty co tady mame vypsany
const Button: FC<ButtonProps> = ({ className, children, buttonVariant, isLoading, buttonSize, ...props }) => {
    // <Loader2/> je z "lucide-react" ikonka kterou budeme pouzivat u nacitani
    return <>
        {/* cn je nase function kterou jseme si vytvorili v 'utilities' ktera nam umozni override name dany classes z 'buttonVariants' . Kdyby nastala situace kdy si potreboujeme vytvorit button v jine barve/velikosti , tak diky tomuhle je budeme moct zmenit */}
        <button {...props} className={cn(buttonVariants({ buttonVariant, buttonSize, className }))} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h2-4 w-4 animate-spin" /> : null}
            {children}
        </button>
    </>
}
export default Button