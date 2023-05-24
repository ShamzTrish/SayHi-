// this is just a props what Icons can take "width , height etc.."
import { LucideProps, UserPlus } from 'lucide-react'


export const Icons = {
  Logo: (props: LucideProps) => (
    <svg {...props} viewBox='0 0 2000 2000'>
      <path
        fill='currentColor'
        d='m1976.678 964.142-1921.534-852.468c-14.802-6.571-32.107-3.37-43.577 8.046-11.477 11.413-14.763 28.703-8.28 43.532l365.839 836.751-365.839 836.749c-6.483 14.831-3.197 32.119 8.28 43.532 7.508 7.467 17.511 11.417 27.677 11.417 5.37 0 10.785-1.103 15.9-3.371l1921.533-852.466c14.18-6.292 23.322-20.349 23.322-35.861.001-15.514-9.141-29.571-23.321-35.861zm-1861.042-739.791 1664.615 738.489h-1341.737zm321.069 816.954h1334.219l-1655.287 734.35z'
      />
    </svg>
  ),
  UserPlus
  
}

// since we have two options in the Icons - either Logo or UserPlus icon with this sintax below it lets you select what option you want to have, either the Logo or the UserPlus when you want to use it
export type Icon = keyof typeof Icons