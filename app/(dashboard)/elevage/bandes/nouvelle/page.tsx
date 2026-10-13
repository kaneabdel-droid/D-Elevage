import { redirect } from 'next/navigation'

export default function NouvelleBandeRedirectPage() {
  redirect('/elevage/bandes?nouveau=1')
}
